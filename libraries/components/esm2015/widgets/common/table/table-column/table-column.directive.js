import { Attribute, ContentChild, ContentChildren, TemplateRef, Directive, Injector, Optional } from '@angular/core';
import { Validators } from '@angular/forms';
import { $watch, AppDefaults, DataSource, DataType, debounce, FormWidgetType, getDisplayDateTimeFormat, isDateTimeType, isDefined } from '@wm/core';
import { BaseComponent } from '../../base/base.component';
import { EDIT_MODE, getDataTableFilterWidget, getDefaultValue, getEditModeWidget, setHeaderConfigForTable } from '../../../../utils/live-utils';
import { registerProps } from './table-column.props';
import { getWatchIdentifier, isDataSetWidget, provideAsWidgetRef } from '../../../../utils/widget-utils';
import { TableComponent } from '../table.component';
import { TableColumnGroupDirective } from '../table-column-group/table-column-group.directive';
import { applyFilterOnField, fetchRelatedFieldData, getDistinctFieldProperties, getDistinctValues, getDistinctValuesForField } from '../../../../utils/data-utils';
const WIDGET_CONFIG = { widgetType: 'wm-table-column', hostClass: '' };
let inlineWidgetProps = ['datafield', 'displayfield', 'placeholder', 'searchkey', 'matchmode', 'displaylabel',
    'checkedvalue', 'uncheckedvalue', 'showdropdownon', 'dataset'];
const validationProps = ['maxchars', 'regexp', 'minvalue', 'maxvalue', 'required'];
inlineWidgetProps = [...inlineWidgetProps, ...validationProps];
class FieldDef {
    constructor(widget) {
        this.widget = widget;
    }
    focus() {
        this.widget.focus();
    }
    setProperty(prop, newval) {
        // Get the scope of the current editable widget and set the value
        prop = prop === 'value' ? 'datavalue' : prop;
        this.widget[prop] = newval;
    }
    getProperty(prop) {
        prop = prop === 'value' ? 'datavalue' : prop;
        return this.widget[prop];
    }
}
export class TableColumnDirective extends BaseComponent {
    constructor(inj, appDefaults, table, group, bindfilterdataset, binddataset) {
        super(inj, WIDGET_CONFIG);
        this.appDefaults = appDefaults;
        this.table = table;
        this.group = group;
        this.bindfilterdataset = bindfilterdataset;
        this.binddataset = binddataset;
        this._debounceSetUpValidators = debounce(this.setUpValidators.bind(this, 'inlineInstance'), 250);
        this._debounceSetUpValidatorsNew = debounce(this.setUpValidators.bind(this, 'inlineInstanceNew'), 250);
    }
    get dataoptions() {
        return this._dataoptions;
    }
    set dataoptions(options) {
        this._dataoptions = options;
    }
    get datasource() {
        return this._datasource;
    }
    set datasource(ds) {
        this._datasource = ds;
    }
    ngOnInit() {
        super.ngOnInit();
        // Set the default values and register with table
        this.populateFieldDef();
        // Register column with header config to create group structure
        setHeaderConfigForTable(this.table.headerConfig, {
            field: this.field,
            displayName: this.displayName
        }, this.group && this.group.name);
        this.table.registerColumns(this.widget);
        this._isRowFilter = this.table.filtermode === 'multicolumn' && this.searchable;
        this._isInlineEditable = !this.readonly && (this.table.editmode !== EDIT_MODE.DIALOG && this.table.editmode !== EDIT_MODE.FORM);
        this._isNewEditableRow = this._isInlineEditable && this.table.editmode === EDIT_MODE.QUICK_EDIT && this.table.shownewrow;
        this.setUpControls();
        this._propsInitialized = true;
    }
    ngAfterContentInit() {
        if (this._isRowFilter) {
            // Listen on the inner row filter widget and setup the widget
            const s1 = this._filterInstances.changes.subscribe((val) => {
                this.filterInstance = val.first && val.first.widget;
                this.setUpFilterWidget();
            });
            this.registerDestroyListener(() => s1.unsubscribe());
        }
        if (this._isInlineEditable) {
            const s2 = this._inlineInstances.changes.subscribe((val) => {
                // Listen on the inner inline widget and setup the widget
                this.inlineInstance = val.first && val.first.widget;
                this.table.registerFormField(this.binding, new FieldDef(this.inlineInstance));
                this.setUpInlineWidget('inlineInstance');
            });
            this.registerDestroyListener(() => s2.unsubscribe());
            if (this._isNewEditableRow) {
                const s3 = this._inlineInstancesNew.changes.subscribe((val) => {
                    // Listen on the inner inline widget and setup the widget
                    this.inlineInstanceNew = val.first && val.first.widget;
                    this.setUpInlineWidget('inlineInstanceNew');
                });
                this.registerDestroyListener(() => s3.unsubscribe());
            }
        }
        super.ngAfterContentInit();
    }
    ngAfterViewInit() {
        // manually listing the table column templateRef as templateRef will not be available prior.
        if (this.filterTemplateRef) {
            this.table.renderDynamicFilterColumn(this.filterTemplateRef);
        }
    }
    addFormControl(suffix) {
        const ctrlName = suffix ? (this.binding + suffix) : this.binding;
        this.table.ngform.addControl(ctrlName, this.table.fb.control(''));
    }
    getFormControl(suffix) {
        const ctrlName = suffix ? (this.binding + suffix) : this.binding;
        return this.table.ngform.controls[ctrlName];
    }
    // Setup the inline edit and filter widget
    setUpControls() {
        if (this._isInlineEditable) {
            if (this.editWidgetType === FormWidgetType.UPLOAD) {
                return;
            }
            this.addFormControl();
            const control = this.getFormControl();
            if (control) {
                const onValueChangeSubscription = control.valueChanges.subscribe(this.onValueChange.bind(this));
                this.registerDestroyListener(() => onValueChangeSubscription.unsubscribe());
            }
            if (this._isNewEditableRow) {
                this.addFormControl('_new');
                const newControl = this.getFormControl('_new');
                if (newControl) {
                    const onNewValueChangeSubscription = newControl.valueChanges.subscribe(this.onValueChange.bind(this));
                    this.registerDestroyListener(() => onNewValueChangeSubscription.unsubscribe());
                }
            }
        }
        if (this._isRowFilter) {
            this.addFormControl('_filter');
            this.filterControl = this.getFormControl('_filter');
            if (this.filterControl) {
                const onFilterValueSubscription = this.filterControl.valueChanges.subscribe(this.onFilterValueChange.bind(this));
                this.registerDestroyListener(() => onFilterValueSubscription.unsubscribe());
            }
        }
    }
    // Reset the row filter value
    resetFilter() {
        if (this.filterControl) {
            this.filterControl.setValue('');
        }
        if (this.filterwidget === FormWidgetType.AUTOCOMPLETE) {
            this.filterInstance.query = '';
            this.filterInstance.queryModel = '';
        }
    }
    // On field value change, propagate event to parent form
    onFilterValueChange(val) {
        this.table.rowFilter[this.field].value = val;
    }
    // On field value change, apply cascading filter
    onValueChange(val) {
        if (val !== null) {
            applyFilterOnField(this.table.datasource, this.widget, this.table.fieldDefs, val, {
                widget: 'edit-widget-type'
            });
        }
    }
    loadFilterData() {
        // If filterdataset is not bound, get the data implicitly
        if (this._isRowFilter && isDataSetWidget(this.filterwidget) && !this.bindfilterdataset) {
            // For live variable, get the data using distinct API
            if (this.table.datasource.execute(DataSource.Operation.SUPPORTS_DISTINCT_API)) {
                // check for related entity columns
                if (this.relatedEntityName) {
                    this.widget['is-related'] = true;
                    this.widget['lookup-type'] = this.relatedEntityName;
                    this.widget['lookup-field'] = _.last(_.split(this.field, '.'));
                }
                if (this.filterwidget === FormWidgetType.AUTOCOMPLETE) {
                    this.filterInstance.dataoptions = getDistinctFieldProperties(this.table.datasource, this);
                    this.filterInstance.datasource = this.table.datasource;
                }
                else {
                    getDistinctValues(this.table.datasource, this.widget, 'filterwidget').then((res) => {
                        this._filterDataSet = res.data;
                        this.setFilterWidgetDataSet();
                    });
                }
            }
            else {
                // For other datasources, get the data from datasource bound to table
                this.registerDestroyListener($watch(this.table.binddataset, this.viewParent, {}, nv => this.widget.filterdataset = nv, getWatchIdentifier(this.widgetId, 'filterdataset')));
            }
        }
    }
    loadInlineWidgetData() {
        // If dataset is not bound, get the data implicitly
        if (isDataSetWidget(this['edit-widget-type']) && !this.binddataset && !this.readonly) {
            const dataSource = this.table.datasource;
            if (this['related-entity-name'] && this['primary-key']) {
                // Fetch the data for the related fields
                this.isDataSetBound = true;
                const bindings = _.split(this.binding, '.');
                fetchRelatedFieldData(dataSource, this.widget, {
                    relatedField: _.head(bindings),
                    datafield: _.last(bindings),
                    widget: 'edit-widget-type'
                });
            }
            else if (dataSource.execute(DataSource.Operation.SUPPORTS_DISTINCT_API)) {
                getDistinctValuesForField(dataSource, this.widget, {
                    widget: 'edit-widget-type'
                });
            }
        }
    }
    // On table datasource change, get the data for row filters
    onDataSourceChange() {
        this.loadFilterData();
        this.loadInlineWidgetData();
    }
    // Set the data on the row filter widget
    setFilterWidgetDataSet() {
        if (this.filterInstance) {
            this.filterInstance.dataset = this._filterDataSet;
        }
    }
    // Set the props on the row filter widget
    setUpFilterWidget() {
        this.filterInstance.registerReadyStateListener(() => {
            if (isDataSetWidget(this.filterwidget)) {
                // if binding is department.deptId then field will be deptId
                const field = _.last(this.binding.split('.'));
                this.filterInstance.dataset = this._filterDataSet;
                this.filterInstance.datafield = this.filterdatafield || field;
                this.filterInstance.displayfield = this.filterdisplayfield || field;
                if (this.filterwidget === FormWidgetType.AUTOCOMPLETE) {
                    this.filterInstance.displaylabel = this.filterdisplaylabel || field;
                    this.filterInstance.searchkey = this.filtersearchkey || field;
                }
            }
            if (this.filterwidget === FormWidgetType.TIME) {
                this.filterInstance.timepattern = this.appDefaults.timeFormat || 'hh:mm:ss a';
            }
            this.filterInstance.placeholder = this.filterplaceholder || '';
        });
    }
    // On change of any validation property, set the angular form validators
    setUpValidators(widget) {
        const control = this.getFormControl(widget === 'inlineInstanceNew' ? '_new' : undefined);
        if (!control) {
            return;
        }
        const validators = [];
        if (this.required) {
            // For checkbox/toggle widget, required validation should consider true value only
            if (this.editWidgetType === FormWidgetType.CHECKBOX || this.editWidgetType === FormWidgetType.TOGGLE) {
                validators.push(Validators.requiredTrue);
            }
            else {
                validators.push(Validators.required);
            }
        }
        if (this.maxchars) {
            validators.push(Validators.maxLength(this.maxchars));
        }
        if (this.minvalue) {
            validators.push(Validators.min(this.minvalue));
        }
        if (this.maxvalue) {
            validators.push(Validators.max(this.maxvalue));
        }
        if (this.regexp) {
            validators.push(Validators.pattern(this.regexp));
        }
        if (this[widget] && _.isFunction(this[widget].validate)) {
            validators.push(this[widget].validate.bind(this[widget]));
        }
        control.setValidators(validators);
        control.updateValueAndValidity();
    }
    // Set the props on the inline edit widget
    setInlineWidgetProp(widget, prop, nv) {
        if (prop === 'datepattern' && this.editWidgetType === FormWidgetType.TIME) {
            prop = 'timepattern';
        }
        if (this[widget] && isDefined(nv)) {
            this[widget][prop] = nv;
        }
        if (validationProps.includes(prop)) {
            this._debounceSetUpValidators();
            this._debounceSetUpValidatorsNew();
        }
    }
    // Initialize the inline edit widget
    setUpInlineWidget(widget) {
        this[widget].registerReadyStateListener(() => {
            if (isDataSetWidget(this['edit-widget-type'])) {
                this[widget].dataset = this.dataset;
            }
            inlineWidgetProps.forEach(key => {
                this.setInlineWidgetProp(widget, key, this[key]);
            });
            this[widget].datasource = this._datasource;
            this[widget].dataoptions = this._dataoptions;
            this.setInlineWidgetProp(widget, 'datepattern', this.editdatepattern);
        });
    }
    getStyleDef() {
        return `width: ${this.width || ''}; background-color: ${this.backgroundcolor || ''}; color: ${this.textcolor || ''};`;
    }
    populateFieldDef() {
        this.width = this.width === 'px' ? '' : (this.width || '');
        this.field = this.binding;
        this.displayName = this.caption || '';
        this.pcDisplay = this.pcdisplay;
        this.mobileDisplay = this.mobiledisplay;
        this.textAlignment = this.textalignment;
        this.backgroundColor = this.backgroundcolor;
        this.textColor = this.textcolor;
        this.primaryKey = this['primary-key'];
        this.relatedEntityName = this['related-entity-name'];
        this.style = this.getStyleDef();
        this.class = this['col-class'];
        this.ngclass = this['col-ng-class'];
        this.formatpattern = this.formatpattern === 'toNumber' ? 'numberToString' : this.formatpattern;
        this.searchable = (this.type === 'blob' || this.type === 'clob') ? false : this.searchable;
        this.limit = this.limit ? +this.limit : undefined;
        this.editWidgetType = this['edit-widget-type'] = this['edit-widget-type'] || getEditModeWidget(this);
        this.filterOn = this['filter-on'];
        this.readonly = isDefined(this.getAttr('readonly')) ? this.getAttr('readonly') === 'true' : (this['related-entity-name'] ? !this['primary-key'] : _.includes(['identity', 'uniqueid', 'sequence'], this.generator));
        this.filterwidget = this.filterwidget || getDataTableFilterWidget(this.type || 'string');
        this.isFilterDataSetBound = !!this.bindfilterdataset;
        this.defaultvalue = getDefaultValue(this.defaultvalue, this.type, this.editWidgetType);
        // For date time data types, if date pattern is not specified, set the app format or default format
        if (isDateTimeType(this.type) && this.formatpattern === 'toDate' && !this.datepattern) {
            const defaultFormat = getDisplayDateTimeFormat(this.type);
            if (this.type === DataType.DATE) {
                this.datepattern = this.appDefaults.dateFormat || defaultFormat;
            }
            else if (this.type === DataType.TIME) {
                this.datepattern = this.appDefaults.timeFormat || defaultFormat;
            }
            else if (this.type === DataType.TIMESTAMP || this.type === DataType.DATETIME) {
                this.datepattern = this.appDefaults.dateTimeFormat || defaultFormat;
            }
        }
    }
    onPropertyChange(key, nv, ov) {
        if (!this._propsInitialized) {
            return;
        }
        switch (key) {
            case 'caption':
                this.displayName = nv || '';
                this.setProperty('displayName', this.displayName);
                break;
            case 'defaultvalue':
                this.defaultvalue = getDefaultValue(this.defaultvalue, this.type, this.editWidgetType);
                break;
            case 'show':
                this.table.redraw(true);
                break;
            case 'filterdataset':
                this._filterDataSet = nv;
                this.setFilterWidgetDataSet();
                break;
            case 'editdatepattern':
                this.setInlineWidgetProp('inlineInstance', 'datepattern', nv);
                this.setInlineWidgetProp('inlineInstanceNew', 'datepattern', nv);
                break;
            default:
                if (inlineWidgetProps.includes(key)) {
                    this.setInlineWidgetProp('inlineInstance', key, nv);
                    this.setInlineWidgetProp('inlineInstanceNew', key, nv);
                }
                break;
        }
        super.onPropertyChange(key, nv, ov);
    }
    setProperty(property, nv) {
        this[property] = nv;
        switch (property) {
            case 'displayName':
                this.table.callDataGridMethod('setColumnProp', this.field, property, nv);
                break;
            default:
                this.table.redraw(true);
        }
    }
}
TableColumnDirective.initializeProps = registerProps();
TableColumnDirective.decorators = [
    { type: Directive, args: [{
                selector: '[wmTableColumn]',
                providers: [
                    provideAsWidgetRef(TableColumnDirective)
                ]
            },] }
];
/** @nocollapse */
TableColumnDirective.ctorParameters = () => [
    { type: Injector },
    { type: AppDefaults },
    { type: TableComponent, decorators: [{ type: Optional }] },
    { type: TableColumnGroupDirective, decorators: [{ type: Optional }] },
    { type: undefined, decorators: [{ type: Attribute, args: ['filterdataset.bind',] }] },
    { type: undefined, decorators: [{ type: Attribute, args: ['dataset.bind',] }] }
];
TableColumnDirective.propDecorators = {
    _filterInstances: [{ type: ContentChildren, args: ['filterWidget',] }],
    _inlineInstances: [{ type: ContentChildren, args: ['inlineWidget',] }],
    _inlineInstancesNew: [{ type: ContentChildren, args: ['inlineWidgetNew',] }],
    customExprTmpl: [{ type: ContentChild, args: ['customExprTmpl',] }],
    filterTemplateRef: [{ type: ContentChild, args: ['filterTmpl',] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibGUtY29sdW1uLmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vdGFibGUvdGFibGUtY29sdW1uL3RhYmxlLWNvbHVtbi5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFtQyxTQUFTLEVBQUUsWUFBWSxFQUFFLGVBQWUsRUFBRSxXQUFXLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBVSxRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDOUosT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRTVDLE9BQU8sRUFBRSxNQUFNLEVBQUUsV0FBVyxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLGNBQWMsRUFBRSx3QkFBd0IsRUFBRSxjQUFjLEVBQUUsU0FBUyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRXBKLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUMxRCxPQUFPLEVBQUUsU0FBUyxFQUFFLHdCQUF3QixFQUFFLGVBQWUsRUFBRSxpQkFBaUIsRUFBRSx1QkFBdUIsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQ2hKLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUNyRCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsZUFBZSxFQUFFLGtCQUFrQixFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDekcsT0FBTyxFQUFFLGNBQWMsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBQ3BELE9BQU8sRUFBRSx5QkFBeUIsRUFBRSxNQUFNLG9EQUFvRCxDQUFDO0FBQy9GLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxxQkFBcUIsRUFBRSwwQkFBMEIsRUFBRSxpQkFBaUIsRUFBRSx5QkFBeUIsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBSW5LLE1BQU0sYUFBYSxHQUFHLEVBQUMsVUFB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LGdCQUFnQjtnQ0FtRTdCLFlBQVksU0FBQyxZQUFZIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQWZ0ZXJDb250ZW50SW5pdCwgQWZ0ZXJWaWV3SW5pdCwgQXR0cmlidXRlLCBDb250ZW50Q2hpbGQsIENvbnRlbnRDaGlsZHJlbiwgVGVtcGxhdGVSZWYsIERpcmVjdGl2ZSwgSW5qZWN0b3IsIE9uSW5pdCwgT3B0aW9uYWwgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFZhbGlkYXRvcnMgfSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XG5cbmltcG9ydCB7ICR3YXRjaCwgQXBwRGVmYXVsdHMsIERhdGFTb3VyY2UsIERhdGFUeXBlLCBkZWJvdW5jZSwgRm9ybVdpZGdldFR5cGUsIGdldERpc3BsYXlEYXRlVGltZUZvcm1hdCwgaXNEYXRlVGltZVR5cGUsIGlzRGVmaW5lZCB9IGZyb20gJ0B3bS9jb3JlJztcblxuaW1wb3J0IHsgQmFzZUNvbXBvbmVudCB9IGZyb20gJy4uLy4uL2Jhc2UvYmFzZS5jb21wb25lbnQnO1xuaW1wb3J0IHsgRURJVF9NT0RFLCBnZXREYXRhVGFibGVGaWx0ZXJXaWRnZXQsIGdldERlZmF1bHRWYWx1ZSwgZ2V0RWRpdE1vZGVXaWRnZXQsIHNldEhlYWRlckNvbmZpZ0ZvclRhYmxlIH0gZnJvbSAnLi4vLi4vLi4vLi4vdXRpbHMvbGl2ZS11dGlscyc7XG5pbXBvcnQgeyByZWdpc3RlclByb3BzIH0gZnJvbSAnLi90YWJsZS1jb2x1bW4ucHJvcHMnO1xuaW1wb3J0IHsgZ2V0V2F0Y2hJZGVudGlmaWVyLCBpc0RhdGFTZXRXaWRnZXQsIHByb3ZpZGVBc1dpZGdldFJlZiB9IGZyb20gJy4uLy4uLy4uLy4uL3V0aWxzL3dpZGdldC11dGlscyc7XG5pbXBvcnQgeyBUYWJsZUNvbXBvbmVudCB9IGZyb20gJy4uL3RhYmxlLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBUYWJsZUNvbHVtbkdyb3VwRGlyZWN0aXZlIH0gZnJvbSAnLi4vdGFibGUtY29sdW1uLWdyb3VwL3RhYmxlLWNvbHVtbi1ncm91cC5kaXJlY3RpdmUnO1xuaW1wb3J0IHsgYXBwbHlGaWx0ZXJPbkZpZWxkLCBmZXRjaFJlbGF0ZWRGaWVsZERhdGEsIGdldERpc3RpbmN0RmllbGRQcm9wZXJ0aWVzLCBnZXREaXN0aW5jdFZhbHVlcywgZ2V0RGlzdGluY3RWYWx1ZXNGb3JGaWVsZCB9IGZyb20gJy4uLy4uLy4uLy4uL3V0aWxzL2RhdGEtdXRpbHMnO1xuXG5kZWNsYXJlIGNvbnN0IF87XG5cbmNvbnN0IFdJREdFVF9DT05GSUcgPSB7d2lkZ2V0VHlwZTogJ3dtLXRhYmxlLWNvbHVtbicsIGhvc3RDbGFzczogJyd9O1xuXG5sZXQgaW5saW5lV2lkZ2V0UHJvcHMgPSBbJ2RhdGFmaWVsZCcsICdkaXNwbGF5ZmllbGQnLCAncGxhY2Vob2xkZXInLCAnc2VhcmNoa2V5JywgJ21hdGNobW9kZScsICdkaXNwbGF5bGFiZWwnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdjaGVja2VkdmFsdWUnLCAndW5jaGVja2VkdmFsdWUnLCAnc2hvd2Ryb3Bkb3dub24nLCAnZGF0YXNldCddO1xuY29uc3QgdmFsaWRhdGlvblByb3BzID0gWydtYXhjaGFycycsICdyZWdleHAnLCAnbWludmFsdWUnLCAnbWF4dmFsdWUnLCAncmVxdWlyZWQnXTtcbmlubGluZVdpZGdldFByb3BzID0gWy4uLmlubGluZVdpZGdldFByb3BzLCAuLi52YWxpZGF0aW9uUHJvcHNdO1xuXG5jbGFzcyBGaWVsZERlZiB7XG4gICAgd2lkZ2V0O1xuXG4gICAgY29uc3RydWN0b3Iod2lkZ2V0KSB7XG4gICAgICAgIHRoaXMud2lkZ2V0ID0gd2lkZ2V0O1xuICAgIH1cblxuICAgIGZvY3VzKCkge1xuICAgICAgICB0aGlzLndpZGdldC5mb2N1cygpO1xuICAgIH1cblxuICAgIHNldFByb3BlcnR5KHByb3AsIG5ld3ZhbCkge1xuICAgICAgICAvLyBHZXQgdGhlIHNjb3BlIG9mIHRoZSBjdXJyZW50IGVkaXRhYmxlIHdpZGdldCBhbmQgc2V0IHRoZSB2YWx1ZVxuICAgICAgICBwcm9wID0gcHJvcCA9PT0gJ3ZhbHVlJyA/ICdkYXRhdmFsdWUnIDogcHJvcDtcbiAgICAgICAgdGhpcy53aWRnZXRbcHJvcF0gPSBuZXd2YWw7XG4gICAgfVxuXG4gICAgZ2V0UHJvcGVydHkocHJvcCkge1xuICAgICAgICBwcm9wID0gcHJvcCA9PT0gJ3ZhbHVlJyA/ICdkYXRhdmFsdWUnIDogcHJvcDtcbiAgICAgICAgcmV0dXJuIHRoaXMud2lkZ2V0W3Byb3BdO1xuICAgIH1cbn1cblxuQERpcmVjdGl2ZSh7XG4gICAgc2VsZWN0b3I6ICdbd21UYWJsZUNvbHVtbl0nLFxuICAgIHByb3ZpZGVyczogW1xuICAgICAgICBwcm92aWRlQXNXaWRnZXRSZWYoVGFibGVDb2x1bW5EaXJlY3RpdmUpXG4gICAgXVxufSlcbmV4cG9ydCBjbGFzcyBUYWJsZUNvbHVtbkRpcmVjdGl2ZSBleHRlbmRzIEJhc2VDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIEFmdGVyQ29udGVudEluaXQsIEFmdGVyVmlld0luaXQge1xuICAgIHN0YXRpYyBpbml0aWFsaXplUHJvcHMgPSByZWdpc3RlclByb3BzKCk7XG5cbiAgICBAQ29udGVudENoaWxkcmVuKCdmaWx0ZXJXaWRnZXQnKSBfZmlsdGVySW5zdGFuY2VzO1xuICAgIEBDb250ZW50Q2hpbGRyZW4oJ2lubGluZVdpZGdldCcpIF9pbmxpbmVJbnN0YW5jZXM7XG4gICAgQENvbnRlbnRDaGlsZHJlbignaW5saW5lV2lkZ2V0TmV3JykgX2lubGluZUluc3RhbmNlc05ldztcbiAgICBAQ29udGVudENoaWxkKCdjdXN0b21FeHByVG1wbCcpIGN1c3RvbUV4cHJUbXBsO1xuXG4gICAgcHJpdmF0ZSBfcHJvcHNJbml0aWFsaXplZDogYm9vbGVhbjtcbiAgICBwcml2YXRlIF9maWx0ZXJEYXRhU2V0O1xuICAgIHByaXZhdGUgX2lzUm93RmlsdGVyO1xuICAgIHByaXZhdGUgX2lzSW5saW5lRWRpdGFibGU7XG4gICAgcHJpdmF0ZSBfaXNOZXdFZGl0YWJsZVJvdztcblxuICAgIGZpbHRlckluc3RhbmNlO1xuICAgIGlubGluZUluc3RhbmNlO1xuICAgIGlubGluZUluc3RhbmNlTmV3O1xuXG4gICAgYmFja2dyb3VuZGNvbG9yO1xuICAgIGJpbmRpbmc7XG4gICAgY2FwdGlvbjtcbiAgICBkYXRhc2V0O1xuICAgIGRlZmF1bHR2YWx1ZTtcbiAgICBlZGl0V2lkZ2V0VHlwZTtcbiAgICBmaWx0ZXJ3aWRnZXQ7XG4gICAgZmllbGQ7XG4gICAgZm9ybWF0cGF0dGVybjtcbiAgICBnZW5lcmF0b3I7XG4gICAgbGltaXQ7XG4gICAgbW9iaWxlZGlzcGxheTtcbiAgICBwY2Rpc3BsYXk7XG4gICAgcmVhZG9ubHk7XG4gICAgcmVxdWlyZWQ7XG4gICAgbWF4Y2hhcnM7XG4gICAgbWludmFsdWU7XG4gICAgbWF4dmFsdWU7XG4gICAgcmVnZXhwO1xuICAgIHNlYXJjaGFibGU7XG4gICAgc2hvdztcbiAgICBzb3J0YWJsZTtcbiAgICB0ZXh0YWxpZ25tZW50O1xuICAgIHRleHRjb2xvcjtcbiAgICB0eXBlO1xuICAgIHdpZHRoO1xuICAgIGRhdGVwYXR0ZXJuO1xuICAgIGVkaXRkYXRlcGF0dGVybjtcbiAgICBmaWx0ZXJkYXRhZmllbGQ7XG4gICAgZmlsdGVyZGlzcGxheWZpZWxkO1xuICAgIGZpbHRlcmRpc3BsYXlsYWJlbDtcbiAgICBmaWx0ZXJzZWFyY2hrZXk7XG4gICAgZmlsdGVycGxhY2Vob2xkZXI7XG4gICAgZGF0YWZpZWxkO1xuICAgIGRpc3BsYXlmaWVsZDtcbiAgICBkaXNwbGF5TmFtZTtcbiAgICBwY0Rpc3BsYXk7XG4gICAgbW9iaWxlRGlzcGxheTtcbiAgICB0ZXh0QWxpZ25tZW50O1xuICAgIGJhY2tncm91bmRDb2xvcjtcbiAgICB0ZXh0Q29sb3I7XG4gICAgcHJpbWFyeUtleTtcbiAgICByZWxhdGVkRW50aXR5TmFtZTtcbiAgICBzdHlsZTtcbiAgICBjbGFzcztcbiAgICBuZ2NsYXNzO1xuICAgIGZpbHRlck9uO1xuICAgIGZpbHRlckNvbnRyb2w7XG4gICAgaXNEYXRhU2V0Qm91bmQ7XG4gICAgaXNGaWx0ZXJEYXRhU2V0Qm91bmQ7XG4gICAgcHJpdmF0ZSBfZGF0YW9wdGlvbnM6IGFueTtcbiAgICBwcml2YXRlIF9kYXRhc291cmNlOiBhbnk7XG4gICAgcHJpdmF0ZSBfZGVib3VuY2VTZXRVcFZhbGlkYXRvcnM7XG4gICAgcHJpdmF0ZSBfZGVib3VuY2VTZXRVcFZhbGlkYXRvcnNOZXc7XG5cbiAgICBAQ29udGVudENoaWxkKCdmaWx0ZXJUbXBsJykgZmlsdGVyVGVtcGxhdGVSZWY6IFRlbXBsYXRlUmVmPGFueT47XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgaW5qOiBJbmplY3RvcixcbiAgICAgICAgcHJpdmF0ZSBhcHBEZWZhdWx0czogQXBwRGVmYXVsdHMsXG4gICAgICAgIEBPcHRpb25hbCgpIHB1YmxpYyB0YWJsZTogVGFibGVDb21wb25lbnQsXG4gICAgICAgIEBPcHRpb25hbCgpIHB1YmxpYyBncm91cDogVGFibGVDb2x1bW5Hcm91cERpcmVjdGl2ZSxcbiAgICAgICAgQEF0dHJpYnV0ZSgnZmlsdGVyZGF0YXNldC5iaW5kJykgcHVibGljIGJpbmRmaWx0ZXJkYXRhc2V0LFxuICAgICAgICBAQXR0cmlidXRlKCdkYXRhc2V0LmJpbmQnKSBwdWJsaWMgYmluZGRhdGFzZXRcbiAgICApIHtcbiAgICAgICAgc3VwZXIoaW5qLCBXSURHRVRfQ09ORklHKTtcblxuICAgICAgICB0aGlzLl9kZWJvdW5jZVNldFVwVmFsaWRhdG9ycyA9IGRlYm91bmNlKHRoaXMuc2V0VXBWYWxpZGF0b3JzLmJpbmQodGhpcywgJ2lubGluZUluc3RhbmNlJyksIDI1MCk7XG4gICAgICAgIHRoaXMuX2RlYm91bmNlU2V0VXBWYWxpZGF0b3JzTmV3ID0gZGVib3VuY2UodGhpcy5zZXRVcFZhbGlkYXRvcnMuYmluZCh0aGlzLCAnaW5saW5lSW5zdGFuY2VOZXcnKSwgMjUwKTtcbiAgICB9XG5cbiAgICBnZXQgZGF0YW9wdGlvbnMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kYXRhb3B0aW9ucztcbiAgICB9XG5cbiAgICBzZXQgZGF0YW9wdGlvbnMob3B0aW9ucykge1xuICAgICAgICB0aGlzLl9kYXRhb3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgfVxuXG4gICAgZ2V0IGRhdGFzb3VyY2UoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kYXRhc291cmNlO1xuICAgIH1cblxuICAgIHNldCBkYXRhc291cmNlKGRzKSB7XG4gICAgICAgIHRoaXMuX2RhdGFzb3VyY2UgPSBkcztcbiAgICB9XG5cbiAgICBuZ09uSW5pdCgpIHtcbiAgICAgICAgc3VwZXIubmdPbkluaXQoKTtcblxuICAgICAgICAvLyBTZXQgdGhlIGRlZmF1bHQgdmFsdWVzIGFuZCByZWdpc3RlciB3aXRoIHRhYmxlXG4gICAgICAgIHRoaXMucG9wdWxhdGVGaWVsZERlZigpO1xuXG4gICAgICAgIC8vIFJlZ2lzdGVyIGNvbHVtbiB3aXRoIGhlYWRlciBjb25maWcgdG8gY3JlYXRlIGdyb3VwIHN0cnVjdHVyZVxuICAgICAgICBzZXRIZWFkZXJDb25maWdGb3JUYWJsZSh0aGlzLnRhYmxlLmhlYWRlckNvbmZpZywge1xuICAgICAgICAgICAgZmllbGQ6IHRoaXMuZmllbGQsXG4gICAgICAgICAgICBkaXNwbGF5TmFtZTogdGhpcy5kaXNwbGF5TmFtZVxuICAgICAgICB9LCB0aGlzLmdyb3VwICYmIHRoaXMuZ3JvdXAubmFtZSk7XG5cbiAgICAgICAgdGhpcy50YWJsZS5yZWdpc3RlckNvbHVtbnModGhpcy53aWRnZXQpO1xuXG4gICAgICAgIHRoaXMuX2lzUm93RmlsdGVyID0gdGhpcy50YWJsZS5maWx0ZXJtb2RlID09PSAnbXVsdGljb2x1bW4nICYmIHRoaXMuc2VhcmNoYWJsZTtcbiAgICAgICAgdGhpcy5faXNJbmxpbmVFZGl0YWJsZSA9ICF0aGlzLnJlYWRvbmx5ICYmICh0aGlzLnRhYmxlLmVkaXRtb2RlICE9PSBFRElUX01PREUuRElBTE9HICYmIHRoaXMudGFibGUuZWRpdG1vZGUgIT09IEVESVRfTU9ERS5GT1JNKTtcbiAgICAgICAgdGhpcy5faXNOZXdFZGl0YWJsZVJvdyA9IHRoaXMuX2lzSW5saW5lRWRpdGFibGUgJiYgdGhpcy50YWJsZS5lZGl0bW9kZSA9PT0gRURJVF9NT0RFLlFVSUNLX0VESVQgJiYgdGhpcy50YWJsZS5zaG93bmV3cm93O1xuICAgICAgICB0aGlzLnNldFVwQ29udHJvbHMoKTtcblxuICAgICAgICB0aGlzLl9wcm9wc0luaXRpYWxpemVkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBuZ0FmdGVyQ29udGVudEluaXQoKSB7XG4gICAgICAgIGlmICh0aGlzLl9pc1Jvd0ZpbHRlcikge1xuICAgICAgICAgICAgLy8gTGlzdGVuIG9uIHRoZSBpbm5lciByb3cgZmlsdGVyIHdpZGdldCBhbmQgc2V0dXAgdGhlIHdpZGdldFxuICAgICAgICAgICAgY29uc3QgczEgPSB0aGlzLl9maWx0ZXJJbnN0YW5jZXMuY2hhbmdlcy5zdWJzY3JpYmUoKHZhbCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuZmlsdGVySW5zdGFuY2UgPSB2YWwuZmlyc3QgJiYgdmFsLmZpcnN0LndpZGdldDtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFVwRmlsdGVyV2lkZ2V0KCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMucmVnaXN0ZXJEZXN0cm95TGlzdGVuZXIoKCkgPT4gczEudW5zdWJzY3JpYmUoKSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5faXNJbmxpbmVFZGl0YWJsZSkge1xuICAgICAgICAgICAgY29uc3QgczIgPSB0aGlzLl9pbmxpbmVJbnN0YW5jZXMuY2hhbmdlcy5zdWJzY3JpYmUoKHZhbCkgPT4ge1xuICAgICAgICAgICAgICAgIC8vIExpc3RlbiBvbiB0aGUgaW5uZXIgaW5saW5lIHdpZGdldCBhbmQgc2V0dXAgdGhlIHdpZGdldFxuICAgICAgICAgICAgICAgIHRoaXMuaW5saW5lSW5zdGFuY2UgPSB2YWwuZmlyc3QgJiYgdmFsLmZpcnN0LndpZGdldDtcbiAgICAgICAgICAgICAgICB0aGlzLnRhYmxlLnJlZ2lzdGVyRm9ybUZpZWxkKHRoaXMuYmluZGluZywgbmV3IEZpZWxkRGVmKHRoaXMuaW5saW5lSW5zdGFuY2UpKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFVwSW5saW5lV2lkZ2V0KCdpbmxpbmVJbnN0YW5jZScpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLnJlZ2lzdGVyRGVzdHJveUxpc3RlbmVyKCgpID0+IHMyLnVuc3Vic2NyaWJlKCkpO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5faXNOZXdFZGl0YWJsZVJvdykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHMzID0gdGhpcy5faW5saW5lSW5zdGFuY2VzTmV3LmNoYW5nZXMuc3Vic2NyaWJlKCh2YWwpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gTGlzdGVuIG9uIHRoZSBpbm5lciBpbmxpbmUgd2lkZ2V0IGFuZCBzZXR1cCB0aGUgd2lkZ2V0XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5saW5lSW5zdGFuY2VOZXcgPSB2YWwuZmlyc3QgJiYgdmFsLmZpcnN0LndpZGdldDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRVcElubGluZVdpZGdldCgnaW5saW5lSW5zdGFuY2VOZXcnKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB0aGlzLnJlZ2lzdGVyRGVzdHJveUxpc3RlbmVyKCgpID0+IHMzLnVuc3Vic2NyaWJlKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHN1cGVyLm5nQWZ0ZXJDb250ZW50SW5pdCgpO1xuICAgIH1cblxuICAgIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcbiAgICAgICAgLy8gbWFudWFsbHkgbGlzdGluZyB0aGUgdGFibGUgY29sdW1uIHRlbXBsYXRlUmVmIGFzIHRlbXBsYXRlUmVmIHdpbGwgbm90IGJlIGF2YWlsYWJsZSBwcmlvci5cbiAgICAgICAgaWYgKHRoaXMuZmlsdGVyVGVtcGxhdGVSZWYpIHtcbiAgICAgICAgICAgIHRoaXMudGFibGUucmVuZGVyRHluYW1pY0ZpbHRlckNvbHVtbih0aGlzLmZpbHRlclRlbXBsYXRlUmVmKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFkZEZvcm1Db250cm9sKHN1ZmZpeD86IHN0cmluZykge1xuICAgICAgICBjb25zdCBjdHJsTmFtZSA9IHN1ZmZpeCA/ICh0aGlzLmJpbmRpbmcgKyBzdWZmaXgpIDogdGhpcy5iaW5kaW5nO1xuICAgICAgICB0aGlzLnRhYmxlLm5nZm9ybS5hZGRDb250cm9sKGN0cmxOYW1lLCB0aGlzLnRhYmxlLmZiLmNvbnRyb2woJycpKTtcbiAgICB9XG5cbiAgICBnZXRGb3JtQ29udHJvbChzdWZmaXg/OiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3QgY3RybE5hbWUgPSBzdWZmaXggPyAodGhpcy5iaW5kaW5nICsgc3VmZml4KSA6IHRoaXMuYmluZGluZztcbiAgICAgICAgcmV0dXJuIHRoaXMudGFibGUubmdmb3JtLmNvbnRyb2xzW2N0cmxOYW1lXTtcbiAgICB9XG5cbiAgICAvLyBTZXR1cCB0aGUgaW5saW5lIGVkaXQgYW5kIGZpbHRlciB3aWRnZXRcbiAgICBzZXRVcENvbnRyb2xzKCkge1xuICAgICAgICBpZiAodGhpcy5faXNJbmxpbmVFZGl0YWJsZSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuZWRpdFdpZGdldFR5cGUgPT09IEZvcm1XaWRnZXRUeXBlLlVQTE9BRCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuYWRkRm9ybUNvbnRyb2woKTtcbiAgICAgICAgICAgIGNvbnN0IGNvbnRyb2wgPSB0aGlzLmdldEZvcm1Db250cm9sKCk7XG4gICAgICAgICAgICBpZiAoY29udHJvbCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG9uVmFsdWVDaGFuZ2VTdWJzY3JpcHRpb24gPSAgY29udHJvbC52YWx1ZUNoYW5nZXMuc3Vic2NyaWJlKHRoaXMub25WYWx1ZUNoYW5nZS5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgICAgICB0aGlzLnJlZ2lzdGVyRGVzdHJveUxpc3RlbmVyKCgpID0+IG9uVmFsdWVDaGFuZ2VTdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aGlzLl9pc05ld0VkaXRhYmxlUm93KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hZGRGb3JtQ29udHJvbCgnX25ldycpO1xuICAgICAgICAgICAgICAgIGNvbnN0IG5ld0NvbnRyb2wgPSB0aGlzLmdldEZvcm1Db250cm9sKCdfbmV3Jyk7XG4gICAgICAgICAgICAgICAgaWYgKG5ld0NvbnRyb2wpIHtcbiAgICAgICAgICAgICAgICAgICBjb25zdCBvbk5ld1ZhbHVlQ2hhbmdlU3Vic2NyaXB0aW9uID0gIG5ld0NvbnRyb2wudmFsdWVDaGFuZ2VzLnN1YnNjcmliZSh0aGlzLm9uVmFsdWVDaGFuZ2UuYmluZCh0aGlzKSk7XG4gICAgICAgICAgICAgICAgICAgdGhpcy5yZWdpc3RlckRlc3Ryb3lMaXN0ZW5lcigoKSA9PiBvbk5ld1ZhbHVlQ2hhbmdlU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLl9pc1Jvd0ZpbHRlcikge1xuICAgICAgICAgICAgdGhpcy5hZGRGb3JtQ29udHJvbCgnX2ZpbHRlcicpO1xuICAgICAgICAgICAgdGhpcy5maWx0ZXJDb250cm9sID0gdGhpcy5nZXRGb3JtQ29udHJvbCgnX2ZpbHRlcicpO1xuICAgICAgICAgICAgaWYgKHRoaXMuZmlsdGVyQ29udHJvbCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG9uRmlsdGVyVmFsdWVTdWJzY3JpcHRpb24gPSB0aGlzLmZpbHRlckNvbnRyb2wudmFsdWVDaGFuZ2VzLnN1YnNjcmliZSh0aGlzLm9uRmlsdGVyVmFsdWVDaGFuZ2UuYmluZCh0aGlzKSk7XG4gICAgICAgICAgICAgICAgdGhpcy5yZWdpc3RlckRlc3Ryb3lMaXN0ZW5lcigoKSA9PiBvbkZpbHRlclZhbHVlU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gUmVzZXQgdGhlIHJvdyBmaWx0ZXIgdmFsdWVcbiAgICByZXNldEZpbHRlcigpIHtcbiAgICAgICAgaWYgKHRoaXMuZmlsdGVyQ29udHJvbCkge1xuICAgICAgICAgICAgdGhpcy5maWx0ZXJDb250cm9sLnNldFZhbHVlKCcnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5maWx0ZXJ3aWRnZXQgPT09IEZvcm1XaWRnZXRUeXBlLkFVVE9DT01QTEVURSkge1xuICAgICAgICAgICAgdGhpcy5maWx0ZXJJbnN0YW5jZS5xdWVyeSA9ICcnO1xuICAgICAgICAgICAgdGhpcy5maWx0ZXJJbnN0YW5jZS5xdWVyeU1vZGVsID0gJyc7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBPbiBmaWVsZCB2YWx1ZSBjaGFuZ2UsIHByb3BhZ2F0ZSBldmVudCB0byBwYXJlbnQgZm9ybVxuICAgIG9uRmlsdGVyVmFsdWVDaGFuZ2UodmFsKSB7XG4gICAgICAgIHRoaXMudGFibGUucm93RmlsdGVyW3RoaXMuZmllbGRdLnZhbHVlID0gdmFsO1xuICAgIH1cblxuICAgIC8vIE9uIGZpZWxkIHZhbHVlIGNoYW5nZSwgYXBwbHkgY2FzY2FkaW5nIGZpbHRlclxuICAgIG9uVmFsdWVDaGFuZ2UodmFsKSB7XG4gICAgICAgIGlmICh2YWwgIT09IG51bGwpIHtcbiAgICAgICAgICAgIGFwcGx5RmlsdGVyT25GaWVsZCh0aGlzLnRhYmxlLmRhdGFzb3VyY2UsIHRoaXMud2lkZ2V0LCB0aGlzLnRhYmxlLmZpZWxkRGVmcywgdmFsLCB7XG4gICAgICAgICAgICAgICAgd2lkZ2V0OiAnZWRpdC13aWRnZXQtdHlwZSdcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgbG9hZEZpbHRlckRhdGEoKSB7XG4gICAgICAgIC8vIElmIGZpbHRlcmRhdGFzZXQgaXMgbm90IGJvdW5kLCBnZXQgdGhlIGRhdGEgaW1wbGljaXRseVxuICAgICAgICBpZiAodGhpcy5faXNSb3dGaWx0ZXIgJiYgaXNEYXRhU2V0V2lkZ2V0KHRoaXMuZmlsdGVyd2lkZ2V0KSAmJiAhdGhpcy5iaW5kZmlsdGVyZGF0YXNldCkge1xuICAgICAgICAgICAgLy8gRm9yIGxpdmUgdmFyaWFibGUsIGdldCB0aGUgZGF0YSB1c2luZyBkaXN0aW5jdCBBUElcbiAgICAgICAgICAgIGlmICh0aGlzLnRhYmxlLmRhdGFzb3VyY2UuZXhlY3V0ZShEYXRhU291cmNlLk9wZXJhdGlvbi5TVVBQT1JUU19ESVNUSU5DVF9BUEkpKSB7XG4gICAgICAgICAgICAgICAgLy8gY2hlY2sgZm9yIHJlbGF0ZWQgZW50aXR5IGNvbHVtbnNcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5yZWxhdGVkRW50aXR5TmFtZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLndpZGdldFsnaXMtcmVsYXRlZCddICA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMud2lkZ2V0Wydsb29rdXAtdHlwZSddICA9IHRoaXMucmVsYXRlZEVudGl0eU5hbWU7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMud2lkZ2V0Wydsb29rdXAtZmllbGQnXSA9IF8ubGFzdChfLnNwbGl0KHRoaXMuZmllbGQsICcuJykpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5maWx0ZXJ3aWRnZXQgPT09IEZvcm1XaWRnZXRUeXBlLkFVVE9DT01QTEVURSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmZpbHRlckluc3RhbmNlLmRhdGFvcHRpb25zID0gZ2V0RGlzdGluY3RGaWVsZFByb3BlcnRpZXModGhpcy50YWJsZS5kYXRhc291cmNlLCB0aGlzKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5maWx0ZXJJbnN0YW5jZS5kYXRhc291cmNlID0gdGhpcy50YWJsZS5kYXRhc291cmNlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGdldERpc3RpbmN0VmFsdWVzKHRoaXMudGFibGUuZGF0YXNvdXJjZSwgdGhpcy53aWRnZXQsICdmaWx0ZXJ3aWRnZXQnKS50aGVuKChyZXM6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fZmlsdGVyRGF0YVNldCA9IHJlcy5kYXRhO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRGaWx0ZXJXaWRnZXREYXRhU2V0KCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gRm9yIG90aGVyIGRhdGFzb3VyY2VzLCBnZXQgdGhlIGRhdGEgZnJvbSBkYXRhc291cmNlIGJvdW5kIHRvIHRhYmxlXG4gICAgICAgICAgICAgICAgdGhpcy5yZWdpc3RlckRlc3Ryb3lMaXN0ZW5lcihcbiAgICAgICAgICAgICAgICAgICAgJHdhdGNoKFxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50YWJsZS5iaW5kZGF0YXNldCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudmlld1BhcmVudCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHt9LFxuICAgICAgICAgICAgICAgICAgICAgICAgbnYgPT4gdGhpcy53aWRnZXQuZmlsdGVyZGF0YXNldCA9IG52LFxuICAgICAgICAgICAgICAgICAgICAgICAgZ2V0V2F0Y2hJZGVudGlmaWVyKHRoaXMud2lkZ2V0SWQsICdmaWx0ZXJkYXRhc2V0JylcbiAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBsb2FkSW5saW5lV2lkZ2V0RGF0YSgpIHtcbiAgICAgICAgLy8gSWYgZGF0YXNldCBpcyBub3QgYm91bmQsIGdldCB0aGUgZGF0YSBpbXBsaWNpdGx5XG4gICAgICAgIGlmIChpc0RhdGFTZXRXaWRnZXQodGhpc1snZWRpdC13aWRnZXQtdHlwZSddKSAmJiAhdGhpcy5iaW5kZGF0YXNldCAmJiAhdGhpcy5yZWFkb25seSkge1xuICAgICAgICAgICAgY29uc3QgZGF0YVNvdXJjZSA9IHRoaXMudGFibGUuZGF0YXNvdXJjZTtcbiAgICAgICAgICAgIGlmICh0aGlzWydyZWxhdGVkLWVudGl0eS1uYW1lJ10gJiYgdGhpc1sncHJpbWFyeS1rZXknXSkge1xuICAgICAgICAgICAgICAgIC8vIEZldGNoIHRoZSBkYXRhIGZvciB0aGUgcmVsYXRlZCBmaWVsZHNcbiAgICAgICAgICAgICAgICB0aGlzLmlzRGF0YVNldEJvdW5kID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBjb25zdCBiaW5kaW5ncyA9IF8uc3BsaXQodGhpcy5iaW5kaW5nLCAnLicpO1xuICAgICAgICAgICAgICAgIGZldGNoUmVsYXRlZEZpZWxkRGF0YShkYXRhU291cmNlLCB0aGlzLndpZGdldCwge1xuICAgICAgICAgICAgICAgICAgICByZWxhdGVkRmllbGQ6IF8uaGVhZChiaW5kaW5ncyksXG4gICAgICAgICAgICAgICAgICAgIGRhdGFmaWVsZDogXy5sYXN0KGJpbmRpbmdzKSxcbiAgICAgICAgICAgICAgICAgICAgd2lkZ2V0OiAnZWRpdC13aWRnZXQtdHlwZSdcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZGF0YVNvdXJjZS5leGVjdXRlKERhdGFTb3VyY2UuT3BlcmF0aW9uLlNVUFBPUlRTX0RJU1RJTkNUX0FQSSkpIHtcbiAgICAgICAgICAgICAgICBnZXREaXN0aW5jdFZhbHVlc0ZvckZpZWxkKGRhdGFTb3VyY2UsIHRoaXMud2lkZ2V0LCB7XG4gICAgICAgICAgICAgICAgICAgIHdpZGdldDogJ2VkaXQtd2lkZ2V0LXR5cGUnXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBPbiB0YWJsZSBkYXRhc291cmNlIGNoYW5nZSwgZ2V0IHRoZSBkYXRhIGZvciByb3cgZmlsdGVyc1xuICAgIG9uRGF0YVNvdXJjZUNoYW5nZSgpIHtcbiAgICAgICAgdGhpcy5sb2FkRmlsdGVyRGF0YSgpO1xuICAgICAgICB0aGlzLmxvYWRJbmxpbmVXaWRnZXREYXRhKCk7XG4gICAgfVxuXG4gICAgLy8gU2V0IHRoZSBkYXRhIG9uIHRoZSByb3cgZmlsdGVyIHdpZGdldFxuICAgIHNldEZpbHRlcldpZGdldERhdGFTZXQoKSB7XG4gICAgICAgIGlmICh0aGlzLmZpbHRlckluc3RhbmNlKSB7XG4gICAgICAgICAgICB0aGlzLmZpbHRlckluc3RhbmNlLmRhdGFzZXQgPSB0aGlzLl9maWx0ZXJEYXRhU2V0O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gU2V0IHRoZSBwcm9wcyBvbiB0aGUgcm93IGZpbHRlciB3aWRnZXRcbiAgICBzZXRVcEZpbHRlcldpZGdldCgpIHtcbiAgICAgICAgdGhpcy5maWx0ZXJJbnN0YW5jZS5yZWdpc3RlclJlYWR5U3RhdGVMaXN0ZW5lcigoKSA9PiB7XG4gICAgICAgICAgICBpZiAoaXNEYXRhU2V0V2lkZ2V0KHRoaXMuZmlsdGVyd2lkZ2V0KSkge1xuICAgICAgICAgICAgICAgIC8vIGlmIGJpbmRpbmcgaXMgZGVwYXJ0bWVudC5kZXB0SWQgdGhlbiBmaWVsZCB3aWxsIGJlIGRlcHRJZFxuICAgICAgICAgICAgICAgIGNvbnN0IGZpZWxkID0gXy5sYXN0KHRoaXMuYmluZGluZy5zcGxpdCgnLicpKTtcbiAgICAgICAgICAgICAgICB0aGlzLmZpbHRlckluc3RhbmNlLmRhdGFzZXQgPSB0aGlzLl9maWx0ZXJEYXRhU2V0O1xuICAgICAgICAgICAgICAgIHRoaXMuZmlsdGVySW5zdGFuY2UuZGF0YWZpZWxkID0gdGhpcy5maWx0ZXJkYXRhZmllbGQgfHwgZmllbGQ7XG4gICAgICAgICAgICAgICAgdGhpcy5maWx0ZXJJbnN0YW5jZS5kaXNwbGF5ZmllbGQgPSB0aGlzLmZpbHRlcmRpc3BsYXlmaWVsZCB8fCBmaWVsZDtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5maWx0ZXJ3aWRnZXQgPT09IEZvcm1XaWRnZXRUeXBlLkFVVE9DT01QTEVURSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmZpbHRlckluc3RhbmNlLmRpc3BsYXlsYWJlbCA9IHRoaXMuZmlsdGVyZGlzcGxheWxhYmVsIHx8IGZpZWxkO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmZpbHRlckluc3RhbmNlLnNlYXJjaGtleSA9IHRoaXMuZmlsdGVyc2VhcmNoa2V5IHx8IGZpZWxkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLmZpbHRlcndpZGdldCA9PT0gRm9ybVdpZGdldFR5cGUuVElNRSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZmlsdGVySW5zdGFuY2UudGltZXBhdHRlcm4gPSB0aGlzLmFwcERlZmF1bHRzLnRpbWVGb3JtYXQgfHwgJ2hoOm1tOnNzIGEnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5maWx0ZXJJbnN0YW5jZS5wbGFjZWhvbGRlciA9IHRoaXMuZmlsdGVycGxhY2Vob2xkZXIgfHwgJyc7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIE9uIGNoYW5nZSBvZiBhbnkgdmFsaWRhdGlvbiBwcm9wZXJ0eSwgc2V0IHRoZSBhbmd1bGFyIGZvcm0gdmFsaWRhdG9yc1xuICAgIHNldFVwVmFsaWRhdG9ycyh3aWRnZXQpIHtcbiAgICAgICAgY29uc3QgY29udHJvbCA9IHRoaXMuZ2V0Rm9ybUNvbnRyb2wod2lkZ2V0ID09PSAnaW5saW5lSW5zdGFuY2VOZXcnID8gJ19uZXcnIDogdW5kZWZpbmVkKTtcbiAgICAgICAgaWYgKCFjb250cm9sKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdmFsaWRhdG9ycyA9IFtdO1xuICAgICAgICBpZiAodGhpcy5yZXF1aXJlZCkge1xuICAgICAgICAgICAgLy8gRm9yIGNoZWNrYm94L3RvZ2dsZSB3aWRnZXQsIHJlcXVpcmVkIHZhbGlkYXRpb24gc2hvdWxkIGNvbnNpZGVyIHRydWUgdmFsdWUgb25seVxuICAgICAgICAgICAgaWYgKHRoaXMuZWRpdFdpZGdldFR5cGUgPT09IEZvcm1XaWRnZXRUeXBlLkNIRUNLQk9YIHx8IHRoaXMuZWRpdFdpZGdldFR5cGUgPT09IEZvcm1XaWRnZXRUeXBlLlRPR0dMRSkge1xuICAgICAgICAgICAgICAgIHZhbGlkYXRvcnMucHVzaChWYWxpZGF0b3JzLnJlcXVpcmVkVHJ1ZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhbGlkYXRvcnMucHVzaChWYWxpZGF0b3JzLnJlcXVpcmVkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5tYXhjaGFycykge1xuICAgICAgICAgICAgdmFsaWRhdG9ycy5wdXNoKFZhbGlkYXRvcnMubWF4TGVuZ3RoKHRoaXMubWF4Y2hhcnMpKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5taW52YWx1ZSkge1xuICAgICAgICAgICAgdmFsaWRhdG9ycy5wdXNoKFZhbGlkYXRvcnMubWluKHRoaXMubWludmFsdWUpKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5tYXh2YWx1ZSkge1xuICAgICAgICAgICAgdmFsaWRhdG9ycy5wdXNoKFZhbGlkYXRvcnMubWF4KHRoaXMubWF4dmFsdWUpKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5yZWdleHApIHtcbiAgICAgICAgICAgIHZhbGlkYXRvcnMucHVzaChWYWxpZGF0b3JzLnBhdHRlcm4odGhpcy5yZWdleHApKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpc1t3aWRnZXRdICYmIF8uaXNGdW5jdGlvbih0aGlzW3dpZGdldF0udmFsaWRhdGUpKSB7XG4gICAgICAgICAgICB2YWxpZGF0b3JzLnB1c2godGhpc1t3aWRnZXRdLnZhbGlkYXRlLmJpbmQodGhpc1t3aWRnZXRdKSk7XG4gICAgICAgIH1cbiAgICAgICAgY29udHJvbC5zZXRWYWxpZGF0b3JzKHZhbGlkYXRvcnMpO1xuICAgICAgICBjb250cm9sLnVwZGF0ZVZhbHVlQW5kVmFsaWRpdHkoKTtcbiAgICB9XG5cbiAgICAvLyBTZXQgdGhlIHByb3BzIG9uIHRoZSBpbmxpbmUgZWRpdCB3aWRnZXRcbiAgICBzZXRJbmxpbmVXaWRnZXRQcm9wKHdpZGdldCwgcHJvcCwgbnYpIHtcbiAgICAgICAgaWYgKHByb3AgPT09ICdkYXRlcGF0dGVybicgJiYgdGhpcy5lZGl0V2lkZ2V0VHlwZSA9PT0gRm9ybVdpZGdldFR5cGUuVElNRSkge1xuICAgICAgICAgICAgcHJvcCA9ICd0aW1lcGF0dGVybic7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXNbd2lkZ2V0XSAmJiBpc0RlZmluZWQobnYpKSB7XG4gICAgICAgICAgICB0aGlzW3dpZGdldF1bcHJvcF0gPSBudjtcbiAgICAgICAgfVxuICAgICAgICBpZiAodmFsaWRhdGlvblByb3BzLmluY2x1ZGVzKHByb3ApKSB7XG4gICAgICAgICAgICB0aGlzLl9kZWJvdW5jZVNldFVwVmFsaWRhdG9ycygpO1xuICAgICAgICAgICAgdGhpcy5fZGVib3VuY2VTZXRVcFZhbGlkYXRvcnNOZXcoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIEluaXRpYWxpemUgdGhlIGlubGluZSBlZGl0IHdpZGdldFxuICAgIHNldFVwSW5saW5lV2lkZ2V0KHdpZGdldCkge1xuICAgICAgICB0aGlzW3dpZGdldF0ucmVnaXN0ZXJSZWFkeVN0YXRlTGlzdGVuZXIoKCkgPT4ge1xuICAgICAgICAgICAgaWYgKGlzRGF0YVNldFdpZGdldCh0aGlzWydlZGl0LXdpZGdldC10eXBlJ10pKSB7XG4gICAgICAgICAgICAgICAgdGhpc1t3aWRnZXRdLmRhdGFzZXQgPSB0aGlzLmRhdGFzZXQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpbmxpbmVXaWRnZXRQcm9wcy5mb3JFYWNoKGtleSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRJbmxpbmVXaWRnZXRQcm9wKHdpZGdldCwga2V5LCB0aGlzW2tleV0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzW3dpZGdldF0uZGF0YXNvdXJjZSA9IHRoaXMuX2RhdGFzb3VyY2U7XG4gICAgICAgICAgICB0aGlzW3dpZGdldF0uZGF0YW9wdGlvbnMgPSB0aGlzLl9kYXRhb3B0aW9ucztcbiAgICAgICAgICAgIHRoaXMuc2V0SW5saW5lV2lkZ2V0UHJvcCh3aWRnZXQsICdkYXRlcGF0dGVybicsIHRoaXMuZWRpdGRhdGVwYXR0ZXJuKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZ2V0U3R5bGVEZWYoKSB7XG4gICAgICAgIHJldHVybiBgd2lkdGg6ICR7dGhpcy53aWR0aCB8fCAnJ307IGJhY2tncm91bmQtY29sb3I6ICR7dGhpcy5iYWNrZ3JvdW5kY29sb3IgfHwgJyd9OyBjb2xvcjogJHt0aGlzLnRleHRjb2xvciB8fCAnJ307YDtcbiAgICB9XG5cbiAgICBwb3B1bGF0ZUZpZWxkRGVmKCkge1xuICAgICAgICB0aGlzLndpZHRoID0gdGhpcy53aWR0aCA9PT0gJ3B4JyA/ICAnJyA6ICh0aGlzLndpZHRoIHx8ICcnKTtcbiAgICAgICAgdGhpcy5maWVsZCA9IHRoaXMuYmluZGluZztcbiAgICAgICAgdGhpcy5kaXNwbGF5TmFtZSA9ICB0aGlzLmNhcHRpb24gfHwgJyc7XG4gICAgICAgIHRoaXMucGNEaXNwbGF5ID0gIHRoaXMucGNkaXNwbGF5O1xuICAgICAgICB0aGlzLm1vYmlsZURpc3BsYXkgPSAgdGhpcy5tb2JpbGVkaXNwbGF5O1xuICAgICAgICB0aGlzLnRleHRBbGlnbm1lbnQgPSAgdGhpcy50ZXh0YWxpZ25tZW50O1xuICAgICAgICB0aGlzLmJhY2tncm91bmRDb2xvciA9ICB0aGlzLmJhY2tncm91bmRjb2xvcjtcbiAgICAgICAgdGhpcy50ZXh0Q29sb3IgPSAgdGhpcy50ZXh0Y29sb3I7XG4gICAgICAgIHRoaXMucHJpbWFyeUtleSA9ICB0aGlzWydwcmltYXJ5LWtleSddO1xuICAgICAgICB0aGlzLnJlbGF0ZWRFbnRpdHlOYW1lID0gIHRoaXNbJ3JlbGF0ZWQtZW50aXR5LW5hbWUnXTtcbiAgICAgICAgdGhpcy5zdHlsZSA9ICB0aGlzLmdldFN0eWxlRGVmKCk7XG4gICAgICAgIHRoaXMuY2xhc3MgPSAgdGhpc1snY29sLWNsYXNzJ107XG4gICAgICAgIHRoaXMubmdjbGFzcyA9ICB0aGlzWydjb2wtbmctY2xhc3MnXTtcbiAgICAgICAgdGhpcy5mb3JtYXRwYXR0ZXJuID0gIHRoaXMuZm9ybWF0cGF0dGVybiA9PT0gJ3RvTnVtYmVyJyA/ICdudW1iZXJUb1N0cmluZycgIDogIHRoaXMuZm9ybWF0cGF0dGVybjtcbiAgICAgICAgdGhpcy5zZWFyY2hhYmxlID0gICh0aGlzLnR5cGUgPT09ICdibG9iJyB8fCB0aGlzLnR5cGUgPT09ICdjbG9iJykgPyBmYWxzZSAgOiAgdGhpcy5zZWFyY2hhYmxlO1xuICAgICAgICB0aGlzLmxpbWl0ID0gIHRoaXMubGltaXQgPyArdGhpcy5saW1pdCAgOiAgdW5kZWZpbmVkO1xuICAgICAgICB0aGlzLmVkaXRXaWRnZXRUeXBlID0gdGhpc1snZWRpdC13aWRnZXQtdHlwZSddID0gIHRoaXNbJ2VkaXQtd2lkZ2V0LXR5cGUnXSB8fCBnZXRFZGl0TW9kZVdpZGdldCh0aGlzKTtcbiAgICAgICAgdGhpcy5maWx0ZXJPbiA9ICB0aGlzWydmaWx0ZXItb24nXTtcbiAgICAgICAgdGhpcy5yZWFkb25seSA9ICBpc0RlZmluZWQodGhpcy5nZXRBdHRyKCdyZWFkb25seScpKSA/IHRoaXMuZ2V0QXR0cigncmVhZG9ubHknKSA9PT0gJ3RydWUnIDogICh0aGlzWydyZWxhdGVkLWVudGl0eS1uYW1lJ10gPyAhdGhpc1sncHJpbWFyeS1rZXknXSA6ICBfLmluY2x1ZGVzKFsnaWRlbnRpdHknLCAndW5pcXVlaWQnLCAnc2VxdWVuY2UnXSwgdGhpcy5nZW5lcmF0b3IpKTtcbiAgICAgICAgdGhpcy5maWx0ZXJ3aWRnZXQgPSAgdGhpcy5maWx0ZXJ3aWRnZXQgfHwgZ2V0RGF0YVRhYmxlRmlsdGVyV2lkZ2V0KHRoaXMudHlwZSB8fCAnc3RyaW5nJyk7XG4gICAgICAgIHRoaXMuaXNGaWx0ZXJEYXRhU2V0Qm91bmQgPSAhIXRoaXMuYmluZGZpbHRlcmRhdGFzZXQ7XG4gICAgICAgIHRoaXMuZGVmYXVsdHZhbHVlID0gZ2V0RGVmYXVsdFZhbHVlKHRoaXMuZGVmYXVsdHZhbHVlLCB0aGlzLnR5cGUsIHRoaXMuZWRpdFdpZGdldFR5cGUpO1xuXG4gICAgICAgIC8vIEZvciBkYXRlIHRpbWUgZGF0YSB0eXBlcywgaWYgZGF0ZSBwYXR0ZXJuIGlzIG5vdCBzcGVjaWZpZWQsIHNldCB0aGUgYXBwIGZvcm1hdCBvciBkZWZhdWx0IGZvcm1hdFxuICAgICAgICBpZiAoaXNEYXRlVGltZVR5cGUodGhpcy50eXBlKSAmJiB0aGlzLmZvcm1hdHBhdHRlcm4gPT09ICd0b0RhdGUnICYmICF0aGlzLmRhdGVwYXR0ZXJuKSB7XG4gICAgICAgICAgICBjb25zdCBkZWZhdWx0Rm9ybWF0ID0gZ2V0RGlzcGxheURhdGVUaW1lRm9ybWF0KHRoaXMudHlwZSk7XG4gICAgICAgICAgICBpZiAodGhpcy50eXBlID09PSBEYXRhVHlwZS5EQVRFKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlcGF0dGVybiAgPSB0aGlzLmFwcERlZmF1bHRzLmRhdGVGb3JtYXQgfHwgZGVmYXVsdEZvcm1hdDtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy50eXBlID09PSBEYXRhVHlwZS5USU1FKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kYXRlcGF0dGVybiAgPSB0aGlzLmFwcERlZmF1bHRzLnRpbWVGb3JtYXQgfHwgZGVmYXVsdEZvcm1hdDtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy50eXBlID09PSBEYXRhVHlwZS5USU1FU1RBTVAgfHwgdGhpcy50eXBlID09PSBEYXRhVHlwZS5EQVRFVElNRSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZXBhdHRlcm4gID0gdGhpcy5hcHBEZWZhdWx0cy5kYXRlVGltZUZvcm1hdCB8fCBkZWZhdWx0Rm9ybWF0O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25Qcm9wZXJ0eUNoYW5nZShrZXksIG52LCBvdikge1xuICAgICAgICBpZiAoIXRoaXMuX3Byb3BzSW5pdGlhbGl6ZWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBzd2l0Y2ggKGtleSkge1xuICAgICAgICAgICAgY2FzZSAnY2FwdGlvbic6XG4gICAgICAgICAgICAgICAgdGhpcy5kaXNwbGF5TmFtZSA9IG52IHx8ICcnO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0UHJvcGVydHkoJ2Rpc3BsYXlOYW1lJywgdGhpcy5kaXNwbGF5TmFtZSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdkZWZhdWx0dmFsdWUnOlxuICAgICAgICAgICAgICAgIHRoaXMuZGVmYXVsdHZhbHVlID0gZ2V0RGVmYXVsdFZhbHVlKHRoaXMuZGVmYXVsdHZhbHVlLCB0aGlzLnR5cGUsIHRoaXMuZWRpdFdpZGdldFR5cGUpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnc2hvdyc6XG4gICAgICAgICAgICAgICAgdGhpcy50YWJsZS5yZWRyYXcodHJ1ZSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdmaWx0ZXJkYXRhc2V0JzpcbiAgICAgICAgICAgICAgICB0aGlzLl9maWx0ZXJEYXRhU2V0ID0gbnY7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRGaWx0ZXJXaWRnZXREYXRhU2V0KCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdlZGl0ZGF0ZXBhdHRlcm4nOlxuICAgICAgICAgICAgICAgIHRoaXMuc2V0SW5saW5lV2lkZ2V0UHJvcCgnaW5saW5lSW5zdGFuY2UnLCAnZGF0ZXBhdHRlcm4nLCBudik7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRJbmxpbmVXaWRnZXRQcm9wKCdpbmxpbmVJbnN0YW5jZU5ldycsICdkYXRlcGF0dGVybicsIG52KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgaWYgKGlubGluZVdpZGdldFByb3BzLmluY2x1ZGVzKGtleSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRJbmxpbmVXaWRnZXRQcm9wKCdpbmxpbmVJbnN0YW5jZScsIGtleSwgbnYpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldElubGluZVdpZGdldFByb3AoJ2lubGluZUluc3RhbmNlTmV3Jywga2V5LCBudik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgc3VwZXIub25Qcm9wZXJ0eUNoYW5nZShrZXksIG52LCBvdik7XG4gICAgfVxuXG4gICAgc2V0UHJvcGVydHkocHJvcGVydHksIG52KSB7XG4gICAgICAgIHRoaXNbcHJvcGVydHldID0gbnY7XG4gICAgICAgIHN3aXRjaCAocHJvcGVydHkpIHtcbiAgICAgICAgICAgIGNhc2UgJ2Rpc3BsYXlOYW1lJzpcbiAgICAgICAgICAgICAgICB0aGlzLnRhYmxlLmNhbGxEYXRhR3JpZE1ldGhvZCgnc2V0Q29sdW1uUHJvcCcsIHRoaXMuZmllbGQsIHByb3BlcnR5LCBudik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHRoaXMudGFibGUucmVkcmF3KHRydWUpO1xuICAgICAgICB9XG4gICAgfVxufVxuIl19