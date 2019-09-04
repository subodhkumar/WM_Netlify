import * as tslib_1 from "tslib";
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
var WIDGET_CONFIG = { widgetType: 'wm-table-column', hostClass: '' };
var inlineWidgetProps = ['datafield', 'displayfield', 'placeholder', 'searchkey', 'matchmode', 'displaylabel',
    'checkedvalue', 'uncheckedvalue', 'showdropdownon', 'dataset'];
var validationProps = ['maxchars', 'regexp', 'minvalue', 'maxvalue', 'required'];
inlineWidgetProps = tslib_1.__spread(inlineWidgetProps, validationProps);
var FieldDef = /** @class */ (function () {
    function FieldDef(widget) {
        this.widget = widget;
    }
    FieldDef.prototype.focus = function () {
        this.widget.focus();
    };
    FieldDef.prototype.setProperty = function (prop, newval) {
        // Get the scope of the current editable widget and set the value
        prop = prop === 'value' ? 'datavalue' : prop;
        this.widget[prop] = newval;
    };
    FieldDef.prototype.getProperty = function (prop) {
        prop = prop === 'value' ? 'datavalue' : prop;
        return this.widget[prop];
    };
    return FieldDef;
}());
var TableColumnDirective = /** @class */ (function (_super) {
    tslib_1.__extends(TableColumnDirective, _super);
    function TableColumnDirective(inj, appDefaults, table, group, bindfilterdataset, binddataset) {
        var _this = _super.call(this, inj, WIDGET_CONFIG) || this;
        _this.appDefaults = appDefaults;
        _this.table = table;
        _this.group = group;
        _this.bindfilterdataset = bindfilterdataset;
        _this.binddataset = binddataset;
        _this._debounceSetUpValidators = debounce(_this.setUpValidators.bind(_this, 'inlineInstance'), 250);
        _this._debounceSetUpValidatorsNew = debounce(_this.setUpValidators.bind(_this, 'inlineInstanceNew'), 250);
        return _this;
    }
    Object.defineProperty(TableColumnDirective.prototype, "dataoptions", {
        get: function () {
            return this._dataoptions;
        },
        set: function (options) {
            this._dataoptions = options;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TableColumnDirective.prototype, "datasource", {
        get: function () {
            return this._datasource;
        },
        set: function (ds) {
            this._datasource = ds;
        },
        enumerable: true,
        configurable: true
    });
    TableColumnDirective.prototype.ngOnInit = function () {
        _super.prototype.ngOnInit.call(this);
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
    };
    TableColumnDirective.prototype.ngAfterContentInit = function () {
        var _this = this;
        if (this._isRowFilter) {
            // Listen on the inner row filter widget and setup the widget
            var s1_1 = this._filterInstances.changes.subscribe(function (val) {
                _this.filterInstance = val.first && val.first.widget;
                _this.setUpFilterWidget();
            });
            this.registerDestroyListener(function () { return s1_1.unsubscribe(); });
        }
        if (this._isInlineEditable) {
            var s2_1 = this._inlineInstances.changes.subscribe(function (val) {
                // Listen on the inner inline widget and setup the widget
                _this.inlineInstance = val.first && val.first.widget;
                _this.table.registerFormField(_this.binding, new FieldDef(_this.inlineInstance));
                _this.setUpInlineWidget('inlineInstance');
            });
            this.registerDestroyListener(function () { return s2_1.unsubscribe(); });
            if (this._isNewEditableRow) {
                var s3_1 = this._inlineInstancesNew.changes.subscribe(function (val) {
                    // Listen on the inner inline widget and setup the widget
                    _this.inlineInstanceNew = val.first && val.first.widget;
                    _this.setUpInlineWidget('inlineInstanceNew');
                });
                this.registerDestroyListener(function () { return s3_1.unsubscribe(); });
            }
        }
        _super.prototype.ngAfterContentInit.call(this);
    };
    TableColumnDirective.prototype.ngAfterViewInit = function () {
        // manually listing the table column templateRef as templateRef will not be available prior.
        if (this.filterTemplateRef) {
            this.table.renderDynamicFilterColumn(this.filterTemplateRef);
        }
    };
    TableColumnDirective.prototype.addFormControl = function (suffix) {
        var ctrlName = suffix ? (this.binding + suffix) : this.binding;
        this.table.ngform.addControl(ctrlName, this.table.fb.control(''));
    };
    TableColumnDirective.prototype.getFormControl = function (suffix) {
        var ctrlName = suffix ? (this.binding + suffix) : this.binding;
        return this.table.ngform.controls[ctrlName];
    };
    // Setup the inline edit and filter widget
    TableColumnDirective.prototype.setUpControls = function () {
        if (this._isInlineEditable) {
            if (this.editWidgetType === FormWidgetType.UPLOAD) {
                return;
            }
            this.addFormControl();
            var control = this.getFormControl();
            if (control) {
                var onValueChangeSubscription_1 = control.valueChanges.subscribe(this.onValueChange.bind(this));
                this.registerDestroyListener(function () { return onValueChangeSubscription_1.unsubscribe(); });
            }
            if (this._isNewEditableRow) {
                this.addFormControl('_new');
                var newControl = this.getFormControl('_new');
                if (newControl) {
                    var onNewValueChangeSubscription_1 = newControl.valueChanges.subscribe(this.onValueChange.bind(this));
                    this.registerDestroyListener(function () { return onNewValueChangeSubscription_1.unsubscribe(); });
                }
            }
        }
        if (this._isRowFilter) {
            this.addFormControl('_filter');
            this.filterControl = this.getFormControl('_filter');
            if (this.filterControl) {
                var onFilterValueSubscription_1 = this.filterControl.valueChanges.subscribe(this.onFilterValueChange.bind(this));
                this.registerDestroyListener(function () { return onFilterValueSubscription_1.unsubscribe(); });
            }
        }
    };
    // Reset the row filter value
    TableColumnDirective.prototype.resetFilter = function () {
        if (this.filterControl) {
            this.filterControl.setValue('');
        }
        if (this.filterwidget === FormWidgetType.AUTOCOMPLETE) {
            this.filterInstance.query = '';
            this.filterInstance.queryModel = '';
        }
    };
    // On field value change, propagate event to parent form
    TableColumnDirective.prototype.onFilterValueChange = function (val) {
        this.table.rowFilter[this.field].value = val;
    };
    // On field value change, apply cascading filter
    TableColumnDirective.prototype.onValueChange = function (val) {
        if (val !== null) {
            applyFilterOnField(this.table.datasource, this.widget, this.table.fieldDefs, val, {
                widget: 'edit-widget-type'
            });
        }
    };
    TableColumnDirective.prototype.loadFilterData = function () {
        var _this = this;
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
                    getDistinctValues(this.table.datasource, this.widget, 'filterwidget').then(function (res) {
                        _this._filterDataSet = res.data;
                        _this.setFilterWidgetDataSet();
                    });
                }
            }
            else {
                // For other datasources, get the data from datasource bound to table
                this.registerDestroyListener($watch(this.table.binddataset, this.viewParent, {}, function (nv) { return _this.widget.filterdataset = nv; }, getWatchIdentifier(this.widgetId, 'filterdataset')));
            }
        }
    };
    TableColumnDirective.prototype.loadInlineWidgetData = function () {
        // If dataset is not bound, get the data implicitly
        if (isDataSetWidget(this['edit-widget-type']) && !this.binddataset && !this.readonly) {
            var dataSource = this.table.datasource;
            if (this['related-entity-name'] && this['primary-key']) {
                // Fetch the data for the related fields
                this.isDataSetBound = true;
                var bindings = _.split(this.binding, '.');
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
    };
    // On table datasource change, get the data for row filters
    TableColumnDirective.prototype.onDataSourceChange = function () {
        this.loadFilterData();
        this.loadInlineWidgetData();
    };
    // Set the data on the row filter widget
    TableColumnDirective.prototype.setFilterWidgetDataSet = function () {
        if (this.filterInstance) {
            this.filterInstance.dataset = this._filterDataSet;
        }
    };
    // Set the props on the row filter widget
    TableColumnDirective.prototype.setUpFilterWidget = function () {
        var _this = this;
        this.filterInstance.registerReadyStateListener(function () {
            if (isDataSetWidget(_this.filterwidget)) {
                // if binding is department.deptId then field will be deptId
                var field = _.last(_this.binding.split('.'));
                _this.filterInstance.dataset = _this._filterDataSet;
                _this.filterInstance.datafield = _this.filterdatafield || field;
                _this.filterInstance.displayfield = _this.filterdisplayfield || field;
                if (_this.filterwidget === FormWidgetType.AUTOCOMPLETE) {
                    _this.filterInstance.displaylabel = _this.filterdisplaylabel || field;
                    _this.filterInstance.searchkey = _this.filtersearchkey || field;
                }
            }
            if (_this.filterwidget === FormWidgetType.TIME) {
                _this.filterInstance.timepattern = _this.appDefaults.timeFormat || 'hh:mm:ss a';
            }
            _this.filterInstance.placeholder = _this.filterplaceholder || '';
        });
    };
    // On change of any validation property, set the angular form validators
    TableColumnDirective.prototype.setUpValidators = function (widget) {
        var control = this.getFormControl(widget === 'inlineInstanceNew' ? '_new' : undefined);
        if (!control) {
            return;
        }
        var validators = [];
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
    };
    // Set the props on the inline edit widget
    TableColumnDirective.prototype.setInlineWidgetProp = function (widget, prop, nv) {
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
    };
    // Initialize the inline edit widget
    TableColumnDirective.prototype.setUpInlineWidget = function (widget) {
        var _this = this;
        this[widget].registerReadyStateListener(function () {
            if (isDataSetWidget(_this['edit-widget-type'])) {
                _this[widget].dataset = _this.dataset;
            }
            inlineWidgetProps.forEach(function (key) {
                _this.setInlineWidgetProp(widget, key, _this[key]);
            });
            _this[widget].datasource = _this._datasource;
            _this[widget].dataoptions = _this._dataoptions;
            _this.setInlineWidgetProp(widget, 'datepattern', _this.editdatepattern);
        });
    };
    TableColumnDirective.prototype.getStyleDef = function () {
        return "width: " + (this.width || '') + "; background-color: " + (this.backgroundcolor || '') + "; color: " + (this.textcolor || '') + ";";
    };
    TableColumnDirective.prototype.populateFieldDef = function () {
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
            var defaultFormat = getDisplayDateTimeFormat(this.type);
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
    };
    TableColumnDirective.prototype.onPropertyChange = function (key, nv, ov) {
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
        _super.prototype.onPropertyChange.call(this, key, nv, ov);
    };
    TableColumnDirective.prototype.setProperty = function (property, nv) {
        this[property] = nv;
        switch (property) {
            case 'displayName':
                this.table.callDataGridMethod('setColumnProp', this.field, property, nv);
                break;
            default:
                this.table.redraw(true);
        }
    };
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
    TableColumnDirective.ctorParameters = function () { return [
        { type: Injector },
        { type: AppDefaults },
        { type: TableComponent, decorators: [{ type: Optional }] },
        { type: TableColumnGroupDirective, decorators: [{ type: Optional }] },
        { type: undefined, decorators: [{ type: Attribute, args: ['filterdataset.bind',] }] },
        { type: undefined, decorators: [{ type: Attribute, args: ['dataset.bind',] }] }
    ]; };
    TableColumnDirective.propDecorators = {
        _filterInstances: [{ type: ContentChildren, args: ['filterWidget',] }],
        _inlineInstances: [{ type: ContentChildren, args: ['inlineWidget',] }],
        _inlineInstancesNew: [{ type: ContentChildren, args: ['inlineWidgetNew',] }],
        customExprTmpl: [{ type: ContentChild, args: ['customExprTmpl',] }],
        filterTemplateRef: [{ type: ContentChild, args: ['filterTmpl',] }]
    };
    return TableColumnDirective;
}(BaseComponent));
export { TableColumnDirective };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibGUtY29sdW1uLmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vdGFibGUvdGFibGUtY29sdW1uL3RhYmxlLWNvbHVtbi5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBbUMsU0FBUyxFQUFFLFlBQVksRUFBRSxlQUFlLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQVUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzlKLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUU1QyxPQUFPLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxjQUFjLEVBQUUsd0JBQXdCLEVBQUUsY0FBYyxFQUFFLFNBQVMsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUVwSixPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDMUQsT0FBTyxFQUFFLFNBQVMsRUFBRSx3QkFBd0IsRUFBRSxlQUFlLEVBQUUsaUJBQWlCLEVBQUUsdUJBQXVCLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUNoSixPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDckQsT0FBTyxFQUFFLGtCQUFrQixFQUFFLGVBQWUsRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBQ3pHLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUNwRCxPQUFPLEVBQUUseUJBQXlCLEVBQUUsTUFBTSxvREFBb0QsQ0FBQztBQUMvRixPQUFPLEVBQUUsa0JBQWtCLEVBQUUscUJBQXFCLEVBQUUsMEJBQTBCLEVBQUUsaUJBQWlCLEVBQUUseUJBQXlCLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUluSyxJQUFNLGFBQWEsR0FBRyxFQUFDLFVBQVUsRUFBRSxpQkFBaUIsRUFBRSxTQUFTLEVBQUUsRUFBRSxFQUFDLENBQUM7QUFFckUsSUFBSSxpQkFBaUIsR0FBRyxDQUFDLFdBQVcsRUFBRSxjQUFjLEVBQUUsYUFBYSxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsY0FBYztJQUNqRixjQUFjLEVBQUUsZ0JBQWdCLEVBQUUsZ0JBQWdCLEVBQUUsU0FBUyxDQUFDLENBQUM7QUFDM0YsSUFBTSxlQUFlLEdBQUcsQ0FBQyxVQUFVLEVBQUUsUUFBUSxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsVUFBVSxDQUFDLENBQUM7QUFDbkYsaUJBQWlCLG9CQUFPLGlCQUFpQixFQUFLLGVBQWUsQ0FBQyxDQUFDO0FBRS9EO0lBR0ksa0JBQVksTUFBTTtRQUNkLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0lBQ3pCLENBQUM7SUFFRCx3QkFBSyxHQUFMO1FBQ0ksSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztJQUN4QixDQUFDO0lBRUQsOEJBQVcsR0FBWCxVQUFZLElBQUksRUFBRSxNQUFNO1FBQ3BCLGlFQUFpRTtRQUNqRSxJQUFJLEdBQUcsSUFBSSxLQUFLLE9BQU8sQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDN0MsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxNQUFNLENBQUM7SUFDL0IsQ0FBQztJQUVELDhCQUFXLEdBQVgsVUFBWSxJQUFJO1FBQ1osSUFBSSxHQUFHLElBQUksS0FBSyxPQUFPLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBQzdDLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM3QixDQUFDO0lBQ0wsZUFBQztBQUFELENBQUMsQUFyQkQsSUFxQkM7QUFFRDtJQU0wQyxnREFBYTtJQTJFbkQsOEJBQ0ksR0FBYSxFQUNMLFdBQXdCLEVBQ2IsS0FBcUIsRUFDckIsS0FBZ0MsRUFDWCxpQkFBaUIsRUFDdkIsV0FBVztRQU5qRCxZQVFJLGtCQUFNLEdBQUcsRUFBRSxhQUFhLENBQUMsU0FJNUI7UUFWVyxpQkFBVyxHQUFYLFdBQVcsQ0FBYTtRQUNiLFdBQUssR0FBTCxLQUFLLENBQWdCO1FBQ3JCLFdBQUssR0FBTCxLQUFLLENBQTJCO1FBQ1gsdUJBQWlCLEdBQWpCLGlCQUFpQixDQUFBO1FBQ3ZCLGlCQUFXLEdBQVgsV0FBVyxDQUFBO1FBSTdDLEtBQUksQ0FBQyx3QkFBd0IsR0FBRyxRQUFRLENBQUMsS0FBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsS0FBSSxFQUFFLGdCQUFnQixDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDakcsS0FBSSxDQUFDLDJCQUEyQixHQUFHLFFBQVEsQ0FBQyxLQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxLQUFJLEVBQUUsbUJBQW1CLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQzs7SUFDM0csQ0FBQztJQUVELHNCQUFJLDZDQUFXO2FBQWY7WUFDSSxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUM7UUFDN0IsQ0FBQzthQUVELFVBQWdCLE9BQU87WUFDbkIsSUFBSSxDQUFDLFlBQVksR0FBRyxPQUFPLENBQUM7UUFDaEMsQ0FBQzs7O09BSkE7SUFNRCxzQkFBSSw0Q0FBVTthQUFkO1lBQ0ksT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDO1FBQzVCLENBQUM7YUFFRCxVQUFlLEVBQUU7WUFDYixJQUFJLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQztRQUMxQixDQUFDOzs7T0FKQTtJQU1ELHVDQUFRLEdBQVI7UUFDSSxpQkFBTSxRQUFRLFdBQUUsQ0FBQztRQUVqQixpREFBaUQ7UUFDakQsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7UUFFeEIsK0RBQStEO1FBQy9ELHVCQUF1QixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsWUFBWSxFQUFFO1lBQzdDLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSztZQUNqQixXQUFXLEVBQUUsSUFBSSxDQUFDLFdBQVc7U0FDaEMsRUFBRSxJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFbEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRXhDLElBQUksQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLEtBQUssYUFBYSxJQUFJLElBQUksQ0FBQyxVQUFVLENBQUM7UUFDL0UsSUFBSSxDQUFDLGlCQUFpQixHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxLQUFLLFNBQVMsQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEtBQUssU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2hJLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUMsaUJBQWlCLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLEtBQUssU0FBUyxDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQztRQUN6SCxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7UUFFckIsSUFBSSxDQUFDLGlCQUFpQixHQUFHLElBQUksQ0FBQztJQUNsQyxDQUFDO0lBRUQsaURBQWtCLEdBQWxCO1FBQUEsaUJBNkJDO1FBNUJHLElBQUksSUFBSSxDQUFDLFlBQVksRUFBRTtZQUNuQiw2REFBNkQ7WUFDN0QsSUFBTSxJQUFFLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsVUFBQyxHQUFHO2dCQUNuRCxLQUFJLENBQUMsY0FBYyxHQUFHLEdBQUcsQ0FBQyxLQUFLLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7Z0JBQ3BELEtBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1lBQzdCLENBQUMsQ0FBQyxDQUFDO1lBQ0gsSUFBSSxDQUFDLHVCQUF1QixDQUFDLGNBQU0sT0FBQSxJQUFFLENBQUMsV0FBVyxFQUFFLEVBQWhCLENBQWdCLENBQUMsQ0FBQztTQUN4RDtRQUVELElBQUksSUFBSSxDQUFDLGlCQUFpQixFQUFFO1lBQ3hCLElBQU0sSUFBRSxHQUFHLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLFVBQUMsR0FBRztnQkFDbkQseURBQXlEO2dCQUN6RCxLQUFJLENBQUMsY0FBYyxHQUFHLEdBQUcsQ0FBQyxLQUFLLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7Z0JBQ3BELEtBQUksQ0FBQyxLQUFLLENBQUMsaUJBQWlCLENBQUMsS0FBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLFFBQVEsQ0FBQyxLQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztnQkFDOUUsS0FBSSxDQUFDLGlCQUFpQixDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFDN0MsQ0FBQyxDQUFDLENBQUM7WUFDSCxJQUFJLENBQUMsdUJBQXVCLENBQUMsY0FBTSxPQUFBLElBQUUsQ0FBQyxXQUFXLEVBQUUsRUFBaEIsQ0FBZ0IsQ0FBQyxDQUFDO1lBRXJELElBQUksSUFBSSxDQUFDLGlCQUFpQixFQUFFO2dCQUN4QixJQUFNLElBQUUsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxVQUFDLEdBQUc7b0JBQ3RELHlEQUF5RDtvQkFDekQsS0FBSSxDQUFDLGlCQUFpQixHQUFHLEdBQUcsQ0FBQyxLQUFLLElBQUksR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7b0JBQ3ZELEtBQUksQ0FBQyxpQkFBaUIsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO2dCQUNoRCxDQUFDLENBQUMsQ0FBQztnQkFDSCxJQUFJLENBQUMsdUJBQXVCLENBQUMsY0FBTSxPQUFBLElBQUUsQ0FBQyxXQUFXLEVBQUUsRUFBaEIsQ0FBZ0IsQ0FBQyxDQUFDO2FBQ3hEO1NBQ0o7UUFDRCxpQkFBTSxrQkFBa0IsV0FBRSxDQUFDO0lBQy9CLENBQUM7SUFFRCw4Q0FBZSxHQUFmO1FBQ0ksNEZBQTRGO1FBQzVGLElBQUksSUFBSSxDQUFDLGlCQUFpQixFQUFFO1lBQ3hCLElBQUksQ0FBQyxLQUFLLENBQUMseUJBQXlCLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUM7U0FDaEU7SUFDTCxDQUFDO0lBRUQsNkNBQWMsR0FBZCxVQUFlLE1BQWU7UUFDMUIsSUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDakUsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztJQUN0RSxDQUFDO0lBRUQsNkNBQWMsR0FBZCxVQUFlLE1BQWU7UUFDMUIsSUFBTSxRQUFRLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7UUFDakUsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDaEQsQ0FBQztJQUVELDBDQUEwQztJQUMxQyw0Q0FBYSxHQUFiO1FBQ0ksSUFBSSxJQUFJLENBQUMsaUJBQWlCLEVBQUU7WUFDeEIsSUFBSSxJQUFJLENBQUMsY0FBYyxLQUFLLGNBQWMsQ0FBQyxNQUFNLEVBQUU7Z0JBQy9DLE9BQU87YUFDVjtZQUNELElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztZQUN0QixJQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7WUFDdEMsSUFBSSxPQUFPLEVBQUU7Z0JBQ1QsSUFBTSwyQkFBeUIsR0FBSSxPQUFPLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUNqRyxJQUFJLENBQUMsdUJBQXVCLENBQUMsY0FBTSxPQUFBLDJCQUF5QixDQUFDLFdBQVcsRUFBRSxFQUF2QyxDQUF1QyxDQUFDLENBQUM7YUFDL0U7WUFFRCxJQUFJLElBQUksQ0FBQyxpQkFBaUIsRUFBRTtnQkFDeEIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDNUIsSUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDL0MsSUFBSSxVQUFVLEVBQUU7b0JBQ2IsSUFBTSw4QkFBNEIsR0FBSSxVQUFVLENBQUMsWUFBWSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO29CQUN2RyxJQUFJLENBQUMsdUJBQXVCLENBQUMsY0FBTSxPQUFBLDhCQUE0QixDQUFDLFdBQVcsRUFBRSxFQUExQyxDQUEwQyxDQUFDLENBQUM7aUJBQ2pGO2FBQ0o7U0FDSjtRQUVELElBQUksSUFBSSxDQUFDLFlBQVksRUFBRTtZQUNuQixJQUFJLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQy9CLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUNwRCxJQUFJLElBQUksQ0FBQyxhQUFhLEVBQUU7Z0JBQ3BCLElBQU0sMkJBQXlCLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDakgsSUFBSSxDQUFDLHVCQUF1QixDQUFDLGNBQU0sT0FBQSwyQkFBeUIsQ0FBQyxXQUFXLEVBQUUsRUFBdkMsQ0FBdUMsQ0FBQyxDQUFDO2FBQy9FO1NBQ0o7SUFDTCxDQUFDO0lBRUQsNkJBQTZCO0lBQzdCLDBDQUFXLEdBQVg7UUFDSSxJQUFJLElBQUksQ0FBQyxhQUFhLEVBQUU7WUFDcEIsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDbkM7UUFDRCxJQUFJLElBQUksQ0FBQyxZQUFZLEtBQUssY0FBYyxDQUFDLFlBQVksRUFBRTtZQUNuRCxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7WUFDL0IsSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDO1NBQ3ZDO0lBQ0wsQ0FBQztJQUVELHdEQUF3RDtJQUN4RCxrREFBbUIsR0FBbkIsVUFBb0IsR0FBRztRQUNuQixJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxHQUFHLEdBQUcsQ0FBQztJQUNqRCxDQUFDO0lBRUQsZ0RBQWdEO0lBQ2hELDRDQUFhLEdBQWIsVUFBYyxHQUFHO1FBQ2IsSUFBSSxHQUFHLEtBQUssSUFBSSxFQUFFO1lBQ2Qsa0JBQWtCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxHQUFHLEVBQUU7Z0JBQzlFLE1BQU0sRUFBRSxrQkFBa0I7YUFDN0IsQ0FBQyxDQUFDO1NBQ047SUFDTCxDQUFDO0lBRUQsNkNBQWMsR0FBZDtRQUFBLGlCQWlDQztRQWhDRyx5REFBeUQ7UUFDekQsSUFBSSxJQUFJLENBQUMsWUFBWSxJQUFJLGVBQWUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUU7WUFDcEYscURBQXFEO1lBQ3JELElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMscUJBQXFCLENBQUMsRUFBRTtnQkFDM0UsbUNBQW1DO2dCQUNuQyxJQUFJLElBQUksQ0FBQyxpQkFBaUIsRUFBRTtvQkFDeEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsR0FBSSxJQUFJLENBQUM7b0JBQ2xDLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLEdBQUksSUFBSSxDQUFDLGlCQUFpQixDQUFDO29CQUNyRCxJQUFJLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7aUJBQ2xFO2dCQUNELElBQUksSUFBSSxDQUFDLFlBQVksS0FBSyxjQUFjLENBQUMsWUFBWSxFQUFFO29CQUNuRCxJQUFJLENBQUMsY0FBYyxDQUFDLFdBQVcsR0FBRywwQkFBMEIsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQztvQkFDMUYsSUFBSSxDQUFDLGNBQWMsQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUM7aUJBQzFEO3FCQUFNO29CQUNILGlCQUFpQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsY0FBYyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUMsR0FBUTt3QkFDaEYsS0FBSSxDQUFDLGNBQWMsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDO3dCQUMvQixLQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQztvQkFDbEMsQ0FBQyxDQUFDLENBQUM7aUJBQ047YUFDSjtpQkFBTTtnQkFDSCxxRUFBcUU7Z0JBQ3JFLElBQUksQ0FBQyx1QkFBdUIsQ0FDeEIsTUFBTSxDQUNGLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxFQUN0QixJQUFJLENBQUMsVUFBVSxFQUNmLEVBQUUsRUFDRixVQUFBLEVBQUUsSUFBSSxPQUFBLEtBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxHQUFHLEVBQUUsRUFBOUIsQ0FBOEIsRUFDcEMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxlQUFlLENBQUMsQ0FDckQsQ0FDSixDQUFDO2FBQ0w7U0FDSjtJQUNMLENBQUM7SUFFRCxtREFBb0IsR0FBcEI7UUFDSSxtREFBbUQ7UUFDbkQsSUFBSSxlQUFlLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxXQUFXLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ2xGLElBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDO1lBQ3pDLElBQUksSUFBSSxDQUFDLHFCQUFxQixDQUFDLElBQUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFFO2dCQUNwRCx3Q0FBd0M7Z0JBQ3hDLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDO2dCQUMzQixJQUFNLFFBQVEsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUM7Z0JBQzVDLHFCQUFxQixDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsTUFBTSxFQUFFO29CQUMzQyxZQUFZLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7b0JBQzlCLFNBQVMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztvQkFDM0IsTUFBTSxFQUFFLGtCQUFrQjtpQkFDN0IsQ0FBQyxDQUFDO2FBQ047aUJBQU0sSUFBSSxVQUFVLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMscUJBQXFCLENBQUMsRUFBRTtnQkFDdkUseUJBQXlCLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUU7b0JBQy9DLE1BQU0sRUFBRSxrQkFBa0I7aUJBQzdCLENBQUMsQ0FBQzthQUNOO1NBQ0o7SUFDTCxDQUFDO0lBRUQsMkRBQTJEO0lBQzNELGlEQUFrQixHQUFsQjtRQUNJLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztRQUN0QixJQUFJLENBQUMsb0JBQW9CLEVBQUUsQ0FBQztJQUNoQyxDQUFDO0lBRUQsd0NBQXdDO0lBQ3hDLHFEQUFzQixHQUF0QjtRQUNJLElBQUksSUFBSSxDQUFDLGNBQWMsRUFBRTtZQUNyQixJQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDO1NBQ3JEO0lBQ0wsQ0FBQztJQUVELHlDQUF5QztJQUN6QyxnREFBaUIsR0FBakI7UUFBQSxpQkFrQkM7UUFqQkcsSUFBSSxDQUFDLGNBQWMsQ0FBQywwQkFBMEIsQ0FBQztZQUMzQyxJQUFJLGVBQWUsQ0FBQyxLQUFJLENBQUMsWUFBWSxDQUFDLEVBQUU7Z0JBQ3BDLDREQUE0RDtnQkFDNUQsSUFBTSxLQUFLLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUM5QyxLQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sR0FBRyxLQUFJLENBQUMsY0FBYyxDQUFDO2dCQUNsRCxLQUFJLENBQUMsY0FBYyxDQUFDLFNBQVMsR0FBRyxLQUFJLENBQUMsZUFBZSxJQUFJLEtBQUssQ0FBQztnQkFDOUQsS0FBSSxDQUFDLGNBQWMsQ0FBQyxZQUFZLEdBQUcsS0FBSSxDQUFDLGtCQUFrQixJQUFJLEtBQUssQ0FBQztnQkFDcEUsSUFBSSxLQUFJLENBQUMsWUFBWSxLQUFLLGNBQWMsQ0FBQyxZQUFZLEVBQUU7b0JBQ25ELEtBQUksQ0FBQyxjQUFjLENBQUMsWUFBWSxHQUFHLEtBQUksQ0FBQyxrQkFBa0IsSUFBSSxLQUFLLENBQUM7b0JBQ3BFLEtBQUksQ0FBQyxjQUFjLENBQUMsU0FBUyxHQUFHLEtBQUksQ0FBQyxlQUFlLElBQUksS0FBSyxDQUFDO2lCQUNqRTthQUNKO1lBQ0QsSUFBSSxLQUFJLENBQUMsWUFBWSxLQUFLLGNBQWMsQ0FBQyxJQUFJLEVBQUU7Z0JBQzNDLEtBQUksQ0FBQyxjQUFjLENBQUMsV0FBVyxHQUFHLEtBQUksQ0FBQyxXQUFXLENBQUMsVUFBVSxJQUFJLFlBQVksQ0FBQzthQUNqRjtZQUNELEtBQUksQ0FBQyxjQUFjLENBQUMsV0FBVyxHQUFHLEtBQUksQ0FBQyxpQkFBaUIsSUFBSSxFQUFFLENBQUM7UUFDbkUsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsd0VBQXdFO0lBQ3hFLDhDQUFlLEdBQWYsVUFBZ0IsTUFBTTtRQUNsQixJQUFNLE9BQU8sR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sS0FBSyxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUN6RixJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ1YsT0FBTztTQUNWO1FBQ0QsSUFBTSxVQUFVLEdBQUcsRUFBRSxDQUFDO1FBQ3RCLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNmLGtGQUFrRjtZQUNsRixJQUFJLElBQUksQ0FBQyxjQUFjLEtBQUssY0FBYyxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsY0FBYyxLQUFLLGNBQWMsQ0FBQyxNQUFNLEVBQUU7Z0JBQ2xHLFVBQVUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDO2FBQzVDO2lCQUFNO2dCQUNILFVBQVUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQ3hDO1NBQ0o7UUFDRCxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDZixVQUFVLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7U0FDeEQ7UUFDRCxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDZixVQUFVLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7U0FDbEQ7UUFDRCxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDZixVQUFVLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7U0FDbEQ7UUFDRCxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUU7WUFDYixVQUFVLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7U0FDcEQ7UUFDRCxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRTtZQUNyRCxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDN0Q7UUFDRCxPQUFPLENBQUMsYUFBYSxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ2xDLE9BQU8sQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO0lBQ3JDLENBQUM7SUFFRCwwQ0FBMEM7SUFDMUMsa0RBQW1CLEdBQW5CLFVBQW9CLE1BQU0sRUFBRSxJQUFJLEVBQUUsRUFBRTtRQUNoQyxJQUFJLElBQUksS0FBSyxhQUFhLElBQUksSUFBSSxDQUFDLGNBQWMsS0FBSyxjQUFjLENBQUMsSUFBSSxFQUFFO1lBQ3ZFLElBQUksR0FBRyxhQUFhLENBQUM7U0FDeEI7UUFDRCxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxTQUFTLENBQUMsRUFBRSxDQUFDLEVBQUU7WUFDL0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztTQUMzQjtRQUNELElBQUksZUFBZSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUNoQyxJQUFJLENBQUMsd0JBQXdCLEVBQUUsQ0FBQztZQUNoQyxJQUFJLENBQUMsMkJBQTJCLEVBQUUsQ0FBQztTQUN0QztJQUNMLENBQUM7SUFFRCxvQ0FBb0M7SUFDcEMsZ0RBQWlCLEdBQWpCLFVBQWtCLE1BQU07UUFBeEIsaUJBWUM7UUFYRyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsMEJBQTBCLENBQUM7WUFDcEMsSUFBSSxlQUFlLENBQUMsS0FBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsRUFBRTtnQkFDM0MsS0FBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sR0FBRyxLQUFJLENBQUMsT0FBTyxDQUFDO2FBQ3ZDO1lBQ0QsaUJBQWlCLENBQUMsT0FBTyxDQUFDLFVBQUEsR0FBRztnQkFDekIsS0FBSSxDQUFDLG1CQUFtQixDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsS0FBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDckQsQ0FBQyxDQUFDLENBQUM7WUFDSCxLQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsVUFBVSxHQUFHLEtBQUksQ0FBQyxXQUFXLENBQUM7WUFDM0MsS0FBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLFdBQVcsR0FBRyxLQUFJLENBQUMsWUFBWSxDQUFDO1lBQzdDLEtBQUksQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLEVBQUUsYUFBYSxFQUFFLEtBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUMxRSxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCwwQ0FBVyxHQUFYO1FBQ0ksT0FBTyxhQUFVLElBQUksQ0FBQyxLQUFLLElBQUksRUFBRSw4QkFBdUIsSUFBSSxDQUFDLGVBQWUsSUFBSSxFQUFFLG1CQUFZLElBQUksQ0FBQyxTQUFTLElBQUksRUFBRSxPQUFHLENBQUM7SUFDMUgsQ0FBQztJQUVELCtDQUFnQixHQUFoQjtRQUNJLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssS0FBSyxJQUFJLENBQUMsQ0FBQyxDQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQzVELElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUMxQixJQUFJLENBQUMsV0FBVyxHQUFJLElBQUksQ0FBQyxPQUFPLElBQUksRUFBRSxDQUFDO1FBQ3ZDLElBQUksQ0FBQyxTQUFTLEdBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUNqQyxJQUFJLENBQUMsYUFBYSxHQUFJLElBQUksQ0FBQyxhQUFhLENBQUM7UUFDekMsSUFBSSxDQUFDLGFBQWEsR0FBSSxJQUFJLENBQUMsYUFBYSxDQUFDO1FBQ3pDLElBQUksQ0FBQyxlQUFlLEdBQUksSUFBSSxDQUFDLGVBQWUsQ0FBQztRQUM3QyxJQUFJLENBQUMsU0FBUyxHQUFJLElBQUksQ0FBQyxTQUFTLENBQUM7UUFDakMsSUFBSSxDQUFDLFVBQVUsR0FBSSxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7UUFDdkMsSUFBSSxDQUFDLGlCQUFpQixHQUFJLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1FBQ3RELElBQUksQ0FBQyxLQUFLLEdBQUksSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQ2pDLElBQUksQ0FBQyxLQUFLLEdBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ2hDLElBQUksQ0FBQyxPQUFPLEdBQUksSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBQ3JDLElBQUksQ0FBQyxhQUFhLEdBQUksSUFBSSxDQUFDLGFBQWEsS0FBSyxVQUFVLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFFLENBQUMsQ0FBRSxJQUFJLENBQUMsYUFBYSxDQUFDO1FBQ2xHLElBQUksQ0FBQyxVQUFVLEdBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLE1BQU0sSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUUsQ0FBQyxDQUFFLElBQUksQ0FBQyxVQUFVLENBQUM7UUFDOUYsSUFBSSxDQUFDLEtBQUssR0FBSSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUUsQ0FBQyxDQUFFLFNBQVMsQ0FBQztRQUNyRCxJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxHQUFJLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3RHLElBQUksQ0FBQyxRQUFRLEdBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ25DLElBQUksQ0FBQyxRQUFRLEdBQUksU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsS0FBSyxNQUFNLENBQUMsQ0FBQyxDQUFFLENBQUMsSUFBSSxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBRSxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsVUFBVSxFQUFFLFVBQVUsRUFBRSxVQUFVLENBQUMsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztRQUN2TixJQUFJLENBQUMsWUFBWSxHQUFJLElBQUksQ0FBQyxZQUFZLElBQUksd0JBQXdCLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxRQUFRLENBQUMsQ0FBQztRQUMxRixJQUFJLENBQUMsb0JBQW9CLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQztRQUNyRCxJQUFJLENBQUMsWUFBWSxHQUFHLGVBQWUsQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBRXZGLG1HQUFtRztRQUNuRyxJQUFJLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksSUFBSSxDQUFDLGFBQWEsS0FBSyxRQUFRLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFO1lBQ25GLElBQU0sYUFBYSxHQUFHLHdCQUF3QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUMxRCxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssUUFBUSxDQUFDLElBQUksRUFBRTtnQkFDN0IsSUFBSSxDQUFDLFdBQVcsR0FBSSxJQUFJLENBQUMsV0FBVyxDQUFDLFVBQVUsSUFBSSxhQUFhLENBQUM7YUFDcEU7aUJBQU0sSUFBSSxJQUFJLENBQUMsSUFBSSxLQUFLLFFBQVEsQ0FBQyxJQUFJLEVBQUU7Z0JBQ3BDLElBQUksQ0FBQyxXQUFXLEdBQUksSUFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFVLElBQUksYUFBYSxDQUFDO2FBQ3BFO2lCQUFNLElBQUksSUFBSSxDQUFDLElBQUksS0FBSyxRQUFRLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxJQUFJLEtBQUssUUFBUSxDQUFDLFFBQVEsRUFBRTtnQkFDNUUsSUFBSSxDQUFDLFdBQVcsR0FBSSxJQUFJLENBQUMsV0FBVyxDQUFDLGNBQWMsSUFBSSxhQUFhLENBQUM7YUFDeEU7U0FDSjtJQUNMLENBQUM7SUFFRCwrQ0FBZ0IsR0FBaEIsVUFBaUIsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFO1FBQ3hCLElBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUU7WUFDekIsT0FBTztTQUNWO1FBQ0QsUUFBUSxHQUFHLEVBQUU7WUFDVCxLQUFLLFNBQVM7Z0JBQ1YsSUFBSSxDQUFDLFdBQVcsR0FBRyxFQUFFLElBQUksRUFBRSxDQUFDO2dCQUM1QixJQUFJLENBQUMsV0FBVyxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7Z0JBQ2xELE1BQU07WUFDVixLQUFLLGNBQWM7Z0JBQ2YsSUFBSSxDQUFDLFlBQVksR0FBRyxlQUFlLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztnQkFDdkYsTUFBTTtZQUNWLEtBQUssTUFBTTtnQkFDUCxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDeEIsTUFBTTtZQUNWLEtBQUssZUFBZTtnQkFDaEIsSUFBSSxDQUFDLGNBQWMsR0FBRyxFQUFFLENBQUM7Z0JBQ3pCLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDO2dCQUM5QixNQUFNO1lBQ1YsS0FBSyxpQkFBaUI7Z0JBQ2xCLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxnQkFBZ0IsRUFBRSxhQUFhLEVBQUUsRUFBRSxDQUFDLENBQUM7Z0JBQzlELElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxtQkFBbUIsRUFBRSxhQUFhLEVBQUUsRUFBRSxDQUFDLENBQUM7Z0JBQ2pFLE1BQU07WUFDVjtnQkFDSSxJQUFJLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRTtvQkFDakMsSUFBSSxDQUFDLG1CQUFtQixDQUFDLGdCQUFnQixFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQztvQkFDcEQsSUFBSSxDQUFDLG1CQUFtQixDQUFDLG1CQUFtQixFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQztpQkFDMUQ7Z0JBQ0QsTUFBTTtTQUNiO1FBRUQsaUJBQU0sZ0JBQWdCLFlBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUN4QyxDQUFDO0lBRUQsMENBQVcsR0FBWCxVQUFZLFFBQVEsRUFBRSxFQUFFO1FBQ3BCLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDcEIsUUFBUSxRQUFRLEVBQUU7WUFDZCxLQUFLLGFBQWE7Z0JBQ2QsSUFBSSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxlQUFlLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUM7Z0JBQ3pFLE1BQU07WUFDVjtnQkFDSSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztTQUMvQjtJQUNMLENBQUM7SUFyZE0sb0NBQWUsR0FBRyxhQUFhLEVBQUUsQ0FBQzs7Z0JBUDVDLFNBQVMsU0FBQztvQkFDUCxRQUFRLEVBQUUsaUJBQWlCO29CQUMzQixTQUFTLEVBQUU7d0JBQ1Asa0JBQWtCLENBQUMsb0JBQW9CLENBQUM7cUJBQzNDO2lCQUNKOzs7O2dCQWxEMkcsUUFBUTtnQkFHbkcsV0FBVztnQkFNbkIsY0FBYyx1QkF3SGQsUUFBUTtnQkF2SFIseUJBQXlCLHVCQXdIekIsUUFBUTtnREFDUixTQUFTLFNBQUMsb0JBQW9CO2dEQUM5QixTQUFTLFNBQUMsY0FBYzs7O21DQTlFNUIsZUFBZSxTQUFDLGNBQWM7bUNBQzlCLGVBQWUsU0FBQyxjQUFjO3NDQUM5QixlQUFlLFNBQUMsaUJBQWlCO2lDQUNqQyxZQUFZLFNBQUMsZ0JBQWdCO29DQW1FN0IsWUFBWSxTQUFDLFlBQVk7O0lBOFk5QiwyQkFBQztDQUFBLEFBN2RELENBTTBDLGFBQWEsR0F1ZHREO1NBdmRZLG9CQUFvQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFmdGVyQ29udGVudEluaXQsIEFmdGVyVmlld0luaXQsIEF0dHJpYnV0ZSwgQ29udGVudENoaWxkLCBDb250ZW50Q2hpbGRyZW4sIFRlbXBsYXRlUmVmLCBEaXJlY3RpdmUsIEluamVjdG9yLCBPbkluaXQsIE9wdGlvbmFsIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBWYWxpZGF0b3JzIH0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuXG5pbXBvcnQgeyAkd2F0Y2gsIEFwcERlZmF1bHRzLCBEYXRhU291cmNlLCBEYXRhVHlwZSwgZGVib3VuY2UsIEZvcm1XaWRnZXRUeXBlLCBnZXREaXNwbGF5RGF0ZVRpbWVGb3JtYXQsIGlzRGF0ZVRpbWVUeXBlLCBpc0RlZmluZWQgfSBmcm9tICdAd20vY29yZSc7XG5cbmltcG9ydCB7IEJhc2VDb21wb25lbnQgfSBmcm9tICcuLi8uLi9iYXNlL2Jhc2UuY29tcG9uZW50JztcbmltcG9ydCB7IEVESVRfTU9ERSwgZ2V0RGF0YVRhYmxlRmlsdGVyV2lkZ2V0LCBnZXREZWZhdWx0VmFsdWUsIGdldEVkaXRNb2RlV2lkZ2V0LCBzZXRIZWFkZXJDb25maWdGb3JUYWJsZSB9IGZyb20gJy4uLy4uLy4uLy4uL3V0aWxzL2xpdmUtdXRpbHMnO1xuaW1wb3J0IHsgcmVnaXN0ZXJQcm9wcyB9IGZyb20gJy4vdGFibGUtY29sdW1uLnByb3BzJztcbmltcG9ydCB7IGdldFdhdGNoSWRlbnRpZmllciwgaXNEYXRhU2V0V2lkZ2V0LCBwcm92aWRlQXNXaWRnZXRSZWYgfSBmcm9tICcuLi8uLi8uLi8uLi91dGlscy93aWRnZXQtdXRpbHMnO1xuaW1wb3J0IHsgVGFibGVDb21wb25lbnQgfSBmcm9tICcuLi90YWJsZS5jb21wb25lbnQnO1xuaW1wb3J0IHsgVGFibGVDb2x1bW5Hcm91cERpcmVjdGl2ZSB9IGZyb20gJy4uL3RhYmxlLWNvbHVtbi1ncm91cC90YWJsZS1jb2x1bW4tZ3JvdXAuZGlyZWN0aXZlJztcbmltcG9ydCB7IGFwcGx5RmlsdGVyT25GaWVsZCwgZmV0Y2hSZWxhdGVkRmllbGREYXRhLCBnZXREaXN0aW5jdEZpZWxkUHJvcGVydGllcywgZ2V0RGlzdGluY3RWYWx1ZXMsIGdldERpc3RpbmN0VmFsdWVzRm9yRmllbGQgfSBmcm9tICcuLi8uLi8uLi8uLi91dGlscy9kYXRhLXV0aWxzJztcblxuZGVjbGFyZSBjb25zdCBfO1xuXG5jb25zdCBXSURHRVRfQ09ORklHID0ge3dpZGdldFR5cGU6ICd3bS10YWJsZS1jb2x1bW4nLCBob3N0Q2xhc3M6ICcnfTtcblxubGV0IGlubGluZVdpZGdldFByb3BzID0gWydkYXRhZmllbGQnLCAnZGlzcGxheWZpZWxkJywgJ3BsYWNlaG9sZGVyJywgJ3NlYXJjaGtleScsICdtYXRjaG1vZGUnLCAnZGlzcGxheWxhYmVsJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnY2hlY2tlZHZhbHVlJywgJ3VuY2hlY2tlZHZhbHVlJywgJ3Nob3dkcm9wZG93bm9uJywgJ2RhdGFzZXQnXTtcbmNvbnN0IHZhbGlkYXRpb25Qcm9wcyA9IFsnbWF4Y2hhcnMnLCAncmVnZXhwJywgJ21pbnZhbHVlJywgJ21heHZhbHVlJywgJ3JlcXVpcmVkJ107XG5pbmxpbmVXaWRnZXRQcm9wcyA9IFsuLi5pbmxpbmVXaWRnZXRQcm9wcywgLi4udmFsaWRhdGlvblByb3BzXTtcblxuY2xhc3MgRmllbGREZWYge1xuICAgIHdpZGdldDtcblxuICAgIGNvbnN0cnVjdG9yKHdpZGdldCkge1xuICAgICAgICB0aGlzLndpZGdldCA9IHdpZGdldDtcbiAgICB9XG5cbiAgICBmb2N1cygpIHtcbiAgICAgICAgdGhpcy53aWRnZXQuZm9jdXMoKTtcbiAgICB9XG5cbiAgICBzZXRQcm9wZXJ0eShwcm9wLCBuZXd2YWwpIHtcbiAgICAgICAgLy8gR2V0IHRoZSBzY29wZSBvZiB0aGUgY3VycmVudCBlZGl0YWJsZSB3aWRnZXQgYW5kIHNldCB0aGUgdmFsdWVcbiAgICAgICAgcHJvcCA9IHByb3AgPT09ICd2YWx1ZScgPyAnZGF0YXZhbHVlJyA6IHByb3A7XG4gICAgICAgIHRoaXMud2lkZ2V0W3Byb3BdID0gbmV3dmFsO1xuICAgIH1cblxuICAgIGdldFByb3BlcnR5KHByb3ApIHtcbiAgICAgICAgcHJvcCA9IHByb3AgPT09ICd2YWx1ZScgPyAnZGF0YXZhbHVlJyA6IHByb3A7XG4gICAgICAgIHJldHVybiB0aGlzLndpZGdldFtwcm9wXTtcbiAgICB9XG59XG5cbkBEaXJlY3RpdmUoe1xuICAgIHNlbGVjdG9yOiAnW3dtVGFibGVDb2x1bW5dJyxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgcHJvdmlkZUFzV2lkZ2V0UmVmKFRhYmxlQ29sdW1uRGlyZWN0aXZlKVxuICAgIF1cbn0pXG5leHBvcnQgY2xhc3MgVGFibGVDb2x1bW5EaXJlY3RpdmUgZXh0ZW5kcyBCYXNlQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0LCBBZnRlckNvbnRlbnRJbml0LCBBZnRlclZpZXdJbml0IHtcbiAgICBzdGF0aWMgaW5pdGlhbGl6ZVByb3BzID0gcmVnaXN0ZXJQcm9wcygpO1xuXG4gICAgQENvbnRlbnRDaGlsZHJlbignZmlsdGVyV2lkZ2V0JykgX2ZpbHRlckluc3RhbmNlcztcbiAgICBAQ29udGVudENoaWxkcmVuKCdpbmxpbmVXaWRnZXQnKSBfaW5saW5lSW5zdGFuY2VzO1xuICAgIEBDb250ZW50Q2hpbGRyZW4oJ2lubGluZVdpZGdldE5ldycpIF9pbmxpbmVJbnN0YW5jZXNOZXc7XG4gICAgQENvbnRlbnRDaGlsZCgnY3VzdG9tRXhwclRtcGwnKSBjdXN0b21FeHByVG1wbDtcblxuICAgIHByaXZhdGUgX3Byb3BzSW5pdGlhbGl6ZWQ6IGJvb2xlYW47XG4gICAgcHJpdmF0ZSBfZmlsdGVyRGF0YVNldDtcbiAgICBwcml2YXRlIF9pc1Jvd0ZpbHRlcjtcbiAgICBwcml2YXRlIF9pc0lubGluZUVkaXRhYmxlO1xuICAgIHByaXZhdGUgX2lzTmV3RWRpdGFibGVSb3c7XG5cbiAgICBmaWx0ZXJJbnN0YW5jZTtcbiAgICBpbmxpbmVJbnN0YW5jZTtcbiAgICBpbmxpbmVJbnN0YW5jZU5ldztcblxuICAgIGJhY2tncm91bmRjb2xvcjtcbiAgICBiaW5kaW5nO1xuICAgIGNhcHRpb247XG4gICAgZGF0YXNldDtcbiAgICBkZWZhdWx0dmFsdWU7XG4gICAgZWRpdFdpZGdldFR5cGU7XG4gICAgZmlsdGVyd2lkZ2V0O1xuICAgIGZpZWxkO1xuICAgIGZvcm1hdHBhdHRlcm47XG4gICAgZ2VuZXJhdG9yO1xuICAgIGxpbWl0O1xuICAgIG1vYmlsZWRpc3BsYXk7XG4gICAgcGNkaXNwbGF5O1xuICAgIHJlYWRvbmx5O1xuICAgIHJlcXVpcmVkO1xuICAgIG1heGNoYXJzO1xuICAgIG1pbnZhbHVlO1xuICAgIG1heHZhbHVlO1xuICAgIHJlZ2V4cDtcbiAgICBzZWFyY2hhYmxlO1xuICAgIHNob3c7XG4gICAgc29ydGFibGU7XG4gICAgdGV4dGFsaWdubWVudDtcbiAgICB0ZXh0Y29sb3I7XG4gICAgdHlwZTtcbiAgICB3aWR0aDtcbiAgICBkYXRlcGF0dGVybjtcbiAgICBlZGl0ZGF0ZXBhdHRlcm47XG4gICAgZmlsdGVyZGF0YWZpZWxkO1xuICAgIGZpbHRlcmRpc3BsYXlmaWVsZDtcbiAgICBmaWx0ZXJkaXNwbGF5bGFiZWw7XG4gICAgZmlsdGVyc2VhcmNoa2V5O1xuICAgIGZpbHRlcnBsYWNlaG9sZGVyO1xuICAgIGRhdGFmaWVsZDtcbiAgICBkaXNwbGF5ZmllbGQ7XG4gICAgZGlzcGxheU5hbWU7XG4gICAgcGNEaXNwbGF5O1xuICAgIG1vYmlsZURpc3BsYXk7XG4gICAgdGV4dEFsaWdubWVudDtcbiAgICBiYWNrZ3JvdW5kQ29sb3I7XG4gICAgdGV4dENvbG9yO1xuICAgIHByaW1hcnlLZXk7XG4gICAgcmVsYXRlZEVudGl0eU5hbWU7XG4gICAgc3R5bGU7XG4gICAgY2xhc3M7XG4gICAgbmdjbGFzcztcbiAgICBmaWx0ZXJPbjtcbiAgICBmaWx0ZXJDb250cm9sO1xuICAgIGlzRGF0YVNldEJvdW5kO1xuICAgIGlzRmlsdGVyRGF0YVNldEJvdW5kO1xuICAgIHByaXZhdGUgX2RhdGFvcHRpb25zOiBhbnk7XG4gICAgcHJpdmF0ZSBfZGF0YXNvdXJjZTogYW55O1xuICAgIHByaXZhdGUgX2RlYm91bmNlU2V0VXBWYWxpZGF0b3JzO1xuICAgIHByaXZhdGUgX2RlYm91bmNlU2V0VXBWYWxpZGF0b3JzTmV3O1xuXG4gICAgQENvbnRlbnRDaGlsZCgnZmlsdGVyVG1wbCcpIGZpbHRlclRlbXBsYXRlUmVmOiBUZW1wbGF0ZVJlZjxhbnk+O1xuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIGluajogSW5qZWN0b3IsXG4gICAgICAgIHByaXZhdGUgYXBwRGVmYXVsdHM6IEFwcERlZmF1bHRzLFxuICAgICAgICBAT3B0aW9uYWwoKSBwdWJsaWMgdGFibGU6IFRhYmxlQ29tcG9uZW50LFxuICAgICAgICBAT3B0aW9uYWwoKSBwdWJsaWMgZ3JvdXA6IFRhYmxlQ29sdW1uR3JvdXBEaXJlY3RpdmUsXG4gICAgICAgIEBBdHRyaWJ1dGUoJ2ZpbHRlcmRhdGFzZXQuYmluZCcpIHB1YmxpYyBiaW5kZmlsdGVyZGF0YXNldCxcbiAgICAgICAgQEF0dHJpYnV0ZSgnZGF0YXNldC5iaW5kJykgcHVibGljIGJpbmRkYXRhc2V0XG4gICAgKSB7XG4gICAgICAgIHN1cGVyKGluaiwgV0lER0VUX0NPTkZJRyk7XG5cbiAgICAgICAgdGhpcy5fZGVib3VuY2VTZXRVcFZhbGlkYXRvcnMgPSBkZWJvdW5jZSh0aGlzLnNldFVwVmFsaWRhdG9ycy5iaW5kKHRoaXMsICdpbmxpbmVJbnN0YW5jZScpLCAyNTApO1xuICAgICAgICB0aGlzLl9kZWJvdW5jZVNldFVwVmFsaWRhdG9yc05ldyA9IGRlYm91bmNlKHRoaXMuc2V0VXBWYWxpZGF0b3JzLmJpbmQodGhpcywgJ2lubGluZUluc3RhbmNlTmV3JyksIDI1MCk7XG4gICAgfVxuXG4gICAgZ2V0IGRhdGFvcHRpb25zKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGF0YW9wdGlvbnM7XG4gICAgfVxuXG4gICAgc2V0IGRhdGFvcHRpb25zKG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5fZGF0YW9wdGlvbnMgPSBvcHRpb25zO1xuICAgIH1cblxuICAgIGdldCBkYXRhc291cmNlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGF0YXNvdXJjZTtcbiAgICB9XG5cbiAgICBzZXQgZGF0YXNvdXJjZShkcykge1xuICAgICAgICB0aGlzLl9kYXRhc291cmNlID0gZHM7XG4gICAgfVxuXG4gICAgbmdPbkluaXQoKSB7XG4gICAgICAgIHN1cGVyLm5nT25Jbml0KCk7XG5cbiAgICAgICAgLy8gU2V0IHRoZSBkZWZhdWx0IHZhbHVlcyBhbmQgcmVnaXN0ZXIgd2l0aCB0YWJsZVxuICAgICAgICB0aGlzLnBvcHVsYXRlRmllbGREZWYoKTtcblxuICAgICAgICAvLyBSZWdpc3RlciBjb2x1bW4gd2l0aCBoZWFkZXIgY29uZmlnIHRvIGNyZWF0ZSBncm91cCBzdHJ1Y3R1cmVcbiAgICAgICAgc2V0SGVhZGVyQ29uZmlnRm9yVGFibGUodGhpcy50YWJsZS5oZWFkZXJDb25maWcsIHtcbiAgICAgICAgICAgIGZpZWxkOiB0aGlzLmZpZWxkLFxuICAgICAgICAgICAgZGlzcGxheU5hbWU6IHRoaXMuZGlzcGxheU5hbWVcbiAgICAgICAgfSwgdGhpcy5ncm91cCAmJiB0aGlzLmdyb3VwLm5hbWUpO1xuXG4gICAgICAgIHRoaXMudGFibGUucmVnaXN0ZXJDb2x1bW5zKHRoaXMud2lkZ2V0KTtcblxuICAgICAgICB0aGlzLl9pc1Jvd0ZpbHRlciA9IHRoaXMudGFibGUuZmlsdGVybW9kZSA9PT0gJ211bHRpY29sdW1uJyAmJiB0aGlzLnNlYXJjaGFibGU7XG4gICAgICAgIHRoaXMuX2lzSW5saW5lRWRpdGFibGUgPSAhdGhpcy5yZWFkb25seSAmJiAodGhpcy50YWJsZS5lZGl0bW9kZSAhPT0gRURJVF9NT0RFLkRJQUxPRyAmJiB0aGlzLnRhYmxlLmVkaXRtb2RlICE9PSBFRElUX01PREUuRk9STSk7XG4gICAgICAgIHRoaXMuX2lzTmV3RWRpdGFibGVSb3cgPSB0aGlzLl9pc0lubGluZUVkaXRhYmxlICYmIHRoaXMudGFibGUuZWRpdG1vZGUgPT09IEVESVRfTU9ERS5RVUlDS19FRElUICYmIHRoaXMudGFibGUuc2hvd25ld3JvdztcbiAgICAgICAgdGhpcy5zZXRVcENvbnRyb2xzKCk7XG5cbiAgICAgICAgdGhpcy5fcHJvcHNJbml0aWFsaXplZCA9IHRydWU7XG4gICAgfVxuXG4gICAgbmdBZnRlckNvbnRlbnRJbml0KCkge1xuICAgICAgICBpZiAodGhpcy5faXNSb3dGaWx0ZXIpIHtcbiAgICAgICAgICAgIC8vIExpc3RlbiBvbiB0aGUgaW5uZXIgcm93IGZpbHRlciB3aWRnZXQgYW5kIHNldHVwIHRoZSB3aWRnZXRcbiAgICAgICAgICAgIGNvbnN0IHMxID0gdGhpcy5fZmlsdGVySW5zdGFuY2VzLmNoYW5nZXMuc3Vic2NyaWJlKCh2YWwpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmZpbHRlckluc3RhbmNlID0gdmFsLmZpcnN0ICYmIHZhbC5maXJzdC53aWRnZXQ7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRVcEZpbHRlcldpZGdldCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLnJlZ2lzdGVyRGVzdHJveUxpc3RlbmVyKCgpID0+IHMxLnVuc3Vic2NyaWJlKCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuX2lzSW5saW5lRWRpdGFibGUpIHtcbiAgICAgICAgICAgIGNvbnN0IHMyID0gdGhpcy5faW5saW5lSW5zdGFuY2VzLmNoYW5nZXMuc3Vic2NyaWJlKCh2YWwpID0+IHtcbiAgICAgICAgICAgICAgICAvLyBMaXN0ZW4gb24gdGhlIGlubmVyIGlubGluZSB3aWRnZXQgYW5kIHNldHVwIHRoZSB3aWRnZXRcbiAgICAgICAgICAgICAgICB0aGlzLmlubGluZUluc3RhbmNlID0gdmFsLmZpcnN0ICYmIHZhbC5maXJzdC53aWRnZXQ7XG4gICAgICAgICAgICAgICAgdGhpcy50YWJsZS5yZWdpc3RlckZvcm1GaWVsZCh0aGlzLmJpbmRpbmcsIG5ldyBGaWVsZERlZih0aGlzLmlubGluZUluc3RhbmNlKSk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRVcElubGluZVdpZGdldCgnaW5saW5lSW5zdGFuY2UnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5yZWdpc3RlckRlc3Ryb3lMaXN0ZW5lcigoKSA9PiBzMi51bnN1YnNjcmliZSgpKTtcblxuICAgICAgICAgICAgaWYgKHRoaXMuX2lzTmV3RWRpdGFibGVSb3cpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBzMyA9IHRoaXMuX2lubGluZUluc3RhbmNlc05ldy5jaGFuZ2VzLnN1YnNjcmliZSgodmFsKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIExpc3RlbiBvbiB0aGUgaW5uZXIgaW5saW5lIHdpZGdldCBhbmQgc2V0dXAgdGhlIHdpZGdldFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmlubGluZUluc3RhbmNlTmV3ID0gdmFsLmZpcnN0ICYmIHZhbC5maXJzdC53aWRnZXQ7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0VXBJbmxpbmVXaWRnZXQoJ2lubGluZUluc3RhbmNlTmV3Jyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdGhpcy5yZWdpc3RlckRlc3Ryb3lMaXN0ZW5lcigoKSA9PiBzMy51bnN1YnNjcmliZSgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBzdXBlci5uZ0FmdGVyQ29udGVudEluaXQoKTtcbiAgICB9XG5cbiAgICBuZ0FmdGVyVmlld0luaXQoKSB7XG4gICAgICAgIC8vIG1hbnVhbGx5IGxpc3RpbmcgdGhlIHRhYmxlIGNvbHVtbiB0ZW1wbGF0ZVJlZiBhcyB0ZW1wbGF0ZVJlZiB3aWxsIG5vdCBiZSBhdmFpbGFibGUgcHJpb3IuXG4gICAgICAgIGlmICh0aGlzLmZpbHRlclRlbXBsYXRlUmVmKSB7XG4gICAgICAgICAgICB0aGlzLnRhYmxlLnJlbmRlckR5bmFtaWNGaWx0ZXJDb2x1bW4odGhpcy5maWx0ZXJUZW1wbGF0ZVJlZik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBhZGRGb3JtQ29udHJvbChzdWZmaXg/OiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3QgY3RybE5hbWUgPSBzdWZmaXggPyAodGhpcy5iaW5kaW5nICsgc3VmZml4KSA6IHRoaXMuYmluZGluZztcbiAgICAgICAgdGhpcy50YWJsZS5uZ2Zvcm0uYWRkQ29udHJvbChjdHJsTmFtZSwgdGhpcy50YWJsZS5mYi5jb250cm9sKCcnKSk7XG4gICAgfVxuXG4gICAgZ2V0Rm9ybUNvbnRyb2woc3VmZml4Pzogc3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IGN0cmxOYW1lID0gc3VmZml4ID8gKHRoaXMuYmluZGluZyArIHN1ZmZpeCkgOiB0aGlzLmJpbmRpbmc7XG4gICAgICAgIHJldHVybiB0aGlzLnRhYmxlLm5nZm9ybS5jb250cm9sc1tjdHJsTmFtZV07XG4gICAgfVxuXG4gICAgLy8gU2V0dXAgdGhlIGlubGluZSBlZGl0IGFuZCBmaWx0ZXIgd2lkZ2V0XG4gICAgc2V0VXBDb250cm9scygpIHtcbiAgICAgICAgaWYgKHRoaXMuX2lzSW5saW5lRWRpdGFibGUpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmVkaXRXaWRnZXRUeXBlID09PSBGb3JtV2lkZ2V0VHlwZS5VUExPQUQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmFkZEZvcm1Db250cm9sKCk7XG4gICAgICAgICAgICBjb25zdCBjb250cm9sID0gdGhpcy5nZXRGb3JtQ29udHJvbCgpO1xuICAgICAgICAgICAgaWYgKGNvbnRyb2wpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBvblZhbHVlQ2hhbmdlU3Vic2NyaXB0aW9uID0gIGNvbnRyb2wudmFsdWVDaGFuZ2VzLnN1YnNjcmliZSh0aGlzLm9uVmFsdWVDaGFuZ2UuYmluZCh0aGlzKSk7XG4gICAgICAgICAgICAgICAgdGhpcy5yZWdpc3RlckRlc3Ryb3lMaXN0ZW5lcigoKSA9PiBvblZhbHVlQ2hhbmdlU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhpcy5faXNOZXdFZGl0YWJsZVJvdykge1xuICAgICAgICAgICAgICAgIHRoaXMuYWRkRm9ybUNvbnRyb2woJ19uZXcnKTtcbiAgICAgICAgICAgICAgICBjb25zdCBuZXdDb250cm9sID0gdGhpcy5nZXRGb3JtQ29udHJvbCgnX25ldycpO1xuICAgICAgICAgICAgICAgIGlmIChuZXdDb250cm9sKSB7XG4gICAgICAgICAgICAgICAgICAgY29uc3Qgb25OZXdWYWx1ZUNoYW5nZVN1YnNjcmlwdGlvbiA9ICBuZXdDb250cm9sLnZhbHVlQ2hhbmdlcy5zdWJzY3JpYmUodGhpcy5vblZhbHVlQ2hhbmdlLmJpbmQodGhpcykpO1xuICAgICAgICAgICAgICAgICAgIHRoaXMucmVnaXN0ZXJEZXN0cm95TGlzdGVuZXIoKCkgPT4gb25OZXdWYWx1ZUNoYW5nZVN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5faXNSb3dGaWx0ZXIpIHtcbiAgICAgICAgICAgIHRoaXMuYWRkRm9ybUNvbnRyb2woJ19maWx0ZXInKTtcbiAgICAgICAgICAgIHRoaXMuZmlsdGVyQ29udHJvbCA9IHRoaXMuZ2V0Rm9ybUNvbnRyb2woJ19maWx0ZXInKTtcbiAgICAgICAgICAgIGlmICh0aGlzLmZpbHRlckNvbnRyb2wpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBvbkZpbHRlclZhbHVlU3Vic2NyaXB0aW9uID0gdGhpcy5maWx0ZXJDb250cm9sLnZhbHVlQ2hhbmdlcy5zdWJzY3JpYmUodGhpcy5vbkZpbHRlclZhbHVlQ2hhbmdlLmJpbmQodGhpcykpO1xuICAgICAgICAgICAgICAgIHRoaXMucmVnaXN0ZXJEZXN0cm95TGlzdGVuZXIoKCkgPT4gb25GaWx0ZXJWYWx1ZVN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFJlc2V0IHRoZSByb3cgZmlsdGVyIHZhbHVlXG4gICAgcmVzZXRGaWx0ZXIoKSB7XG4gICAgICAgIGlmICh0aGlzLmZpbHRlckNvbnRyb2wpIHtcbiAgICAgICAgICAgIHRoaXMuZmlsdGVyQ29udHJvbC5zZXRWYWx1ZSgnJyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuZmlsdGVyd2lkZ2V0ID09PSBGb3JtV2lkZ2V0VHlwZS5BVVRPQ09NUExFVEUpIHtcbiAgICAgICAgICAgIHRoaXMuZmlsdGVySW5zdGFuY2UucXVlcnkgPSAnJztcbiAgICAgICAgICAgIHRoaXMuZmlsdGVySW5zdGFuY2UucXVlcnlNb2RlbCA9ICcnO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gT24gZmllbGQgdmFsdWUgY2hhbmdlLCBwcm9wYWdhdGUgZXZlbnQgdG8gcGFyZW50IGZvcm1cbiAgICBvbkZpbHRlclZhbHVlQ2hhbmdlKHZhbCkge1xuICAgICAgICB0aGlzLnRhYmxlLnJvd0ZpbHRlclt0aGlzLmZpZWxkXS52YWx1ZSA9IHZhbDtcbiAgICB9XG5cbiAgICAvLyBPbiBmaWVsZCB2YWx1ZSBjaGFuZ2UsIGFwcGx5IGNhc2NhZGluZyBmaWx0ZXJcbiAgICBvblZhbHVlQ2hhbmdlKHZhbCkge1xuICAgICAgICBpZiAodmFsICE9PSBudWxsKSB7XG4gICAgICAgICAgICBhcHBseUZpbHRlck9uRmllbGQodGhpcy50YWJsZS5kYXRhc291cmNlLCB0aGlzLndpZGdldCwgdGhpcy50YWJsZS5maWVsZERlZnMsIHZhbCwge1xuICAgICAgICAgICAgICAgIHdpZGdldDogJ2VkaXQtd2lkZ2V0LXR5cGUnXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGxvYWRGaWx0ZXJEYXRhKCkge1xuICAgICAgICAvLyBJZiBmaWx0ZXJkYXRhc2V0IGlzIG5vdCBib3VuZCwgZ2V0IHRoZSBkYXRhIGltcGxpY2l0bHlcbiAgICAgICAgaWYgKHRoaXMuX2lzUm93RmlsdGVyICYmIGlzRGF0YVNldFdpZGdldCh0aGlzLmZpbHRlcndpZGdldCkgJiYgIXRoaXMuYmluZGZpbHRlcmRhdGFzZXQpIHtcbiAgICAgICAgICAgIC8vIEZvciBsaXZlIHZhcmlhYmxlLCBnZXQgdGhlIGRhdGEgdXNpbmcgZGlzdGluY3QgQVBJXG4gICAgICAgICAgICBpZiAodGhpcy50YWJsZS5kYXRhc291cmNlLmV4ZWN1dGUoRGF0YVNvdXJjZS5PcGVyYXRpb24uU1VQUE9SVFNfRElTVElOQ1RfQVBJKSkge1xuICAgICAgICAgICAgICAgIC8vIGNoZWNrIGZvciByZWxhdGVkIGVudGl0eSBjb2x1bW5zXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucmVsYXRlZEVudGl0eU5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy53aWRnZXRbJ2lzLXJlbGF0ZWQnXSAgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLndpZGdldFsnbG9va3VwLXR5cGUnXSAgPSB0aGlzLnJlbGF0ZWRFbnRpdHlOYW1lO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLndpZGdldFsnbG9va3VwLWZpZWxkJ10gPSBfLmxhc3QoXy5zcGxpdCh0aGlzLmZpZWxkLCAnLicpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZmlsdGVyd2lkZ2V0ID09PSBGb3JtV2lkZ2V0VHlwZS5BVVRPQ09NUExFVEUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5maWx0ZXJJbnN0YW5jZS5kYXRhb3B0aW9ucyA9IGdldERpc3RpbmN0RmllbGRQcm9wZXJ0aWVzKHRoaXMudGFibGUuZGF0YXNvdXJjZSwgdGhpcyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZmlsdGVySW5zdGFuY2UuZGF0YXNvdXJjZSA9IHRoaXMudGFibGUuZGF0YXNvdXJjZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBnZXREaXN0aW5jdFZhbHVlcyh0aGlzLnRhYmxlLmRhdGFzb3VyY2UsIHRoaXMud2lkZ2V0LCAnZmlsdGVyd2lkZ2V0JykudGhlbigocmVzOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2ZpbHRlckRhdGFTZXQgPSByZXMuZGF0YTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0RmlsdGVyV2lkZ2V0RGF0YVNldCgpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIEZvciBvdGhlciBkYXRhc291cmNlcywgZ2V0IHRoZSBkYXRhIGZyb20gZGF0YXNvdXJjZSBib3VuZCB0byB0YWJsZVxuICAgICAgICAgICAgICAgIHRoaXMucmVnaXN0ZXJEZXN0cm95TGlzdGVuZXIoXG4gICAgICAgICAgICAgICAgICAgICR3YXRjaChcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudGFibGUuYmluZGRhdGFzZXQsXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnZpZXdQYXJlbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICB7fSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG52ID0+IHRoaXMud2lkZ2V0LmZpbHRlcmRhdGFzZXQgPSBudixcbiAgICAgICAgICAgICAgICAgICAgICAgIGdldFdhdGNoSWRlbnRpZmllcih0aGlzLndpZGdldElkLCAnZmlsdGVyZGF0YXNldCcpXG4gICAgICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgbG9hZElubGluZVdpZGdldERhdGEoKSB7XG4gICAgICAgIC8vIElmIGRhdGFzZXQgaXMgbm90IGJvdW5kLCBnZXQgdGhlIGRhdGEgaW1wbGljaXRseVxuICAgICAgICBpZiAoaXNEYXRhU2V0V2lkZ2V0KHRoaXNbJ2VkaXQtd2lkZ2V0LXR5cGUnXSkgJiYgIXRoaXMuYmluZGRhdGFzZXQgJiYgIXRoaXMucmVhZG9ubHkpIHtcbiAgICAgICAgICAgIGNvbnN0IGRhdGFTb3VyY2UgPSB0aGlzLnRhYmxlLmRhdGFzb3VyY2U7XG4gICAgICAgICAgICBpZiAodGhpc1sncmVsYXRlZC1lbnRpdHktbmFtZSddICYmIHRoaXNbJ3ByaW1hcnkta2V5J10pIHtcbiAgICAgICAgICAgICAgICAvLyBGZXRjaCB0aGUgZGF0YSBmb3IgdGhlIHJlbGF0ZWQgZmllbGRzXG4gICAgICAgICAgICAgICAgdGhpcy5pc0RhdGFTZXRCb3VuZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgY29uc3QgYmluZGluZ3MgPSBfLnNwbGl0KHRoaXMuYmluZGluZywgJy4nKTtcbiAgICAgICAgICAgICAgICBmZXRjaFJlbGF0ZWRGaWVsZERhdGEoZGF0YVNvdXJjZSwgdGhpcy53aWRnZXQsIHtcbiAgICAgICAgICAgICAgICAgICAgcmVsYXRlZEZpZWxkOiBfLmhlYWQoYmluZGluZ3MpLFxuICAgICAgICAgICAgICAgICAgICBkYXRhZmllbGQ6IF8ubGFzdChiaW5kaW5ncyksXG4gICAgICAgICAgICAgICAgICAgIHdpZGdldDogJ2VkaXQtd2lkZ2V0LXR5cGUnXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGRhdGFTb3VyY2UuZXhlY3V0ZShEYXRhU291cmNlLk9wZXJhdGlvbi5TVVBQT1JUU19ESVNUSU5DVF9BUEkpKSB7XG4gICAgICAgICAgICAgICAgZ2V0RGlzdGluY3RWYWx1ZXNGb3JGaWVsZChkYXRhU291cmNlLCB0aGlzLndpZGdldCwge1xuICAgICAgICAgICAgICAgICAgICB3aWRnZXQ6ICdlZGl0LXdpZGdldC10eXBlJ1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gT24gdGFibGUgZGF0YXNvdXJjZSBjaGFuZ2UsIGdldCB0aGUgZGF0YSBmb3Igcm93IGZpbHRlcnNcbiAgICBvbkRhdGFTb3VyY2VDaGFuZ2UoKSB7XG4gICAgICAgIHRoaXMubG9hZEZpbHRlckRhdGEoKTtcbiAgICAgICAgdGhpcy5sb2FkSW5saW5lV2lkZ2V0RGF0YSgpO1xuICAgIH1cblxuICAgIC8vIFNldCB0aGUgZGF0YSBvbiB0aGUgcm93IGZpbHRlciB3aWRnZXRcbiAgICBzZXRGaWx0ZXJXaWRnZXREYXRhU2V0KCkge1xuICAgICAgICBpZiAodGhpcy5maWx0ZXJJbnN0YW5jZSkge1xuICAgICAgICAgICAgdGhpcy5maWx0ZXJJbnN0YW5jZS5kYXRhc2V0ID0gdGhpcy5fZmlsdGVyRGF0YVNldDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFNldCB0aGUgcHJvcHMgb24gdGhlIHJvdyBmaWx0ZXIgd2lkZ2V0XG4gICAgc2V0VXBGaWx0ZXJXaWRnZXQoKSB7XG4gICAgICAgIHRoaXMuZmlsdGVySW5zdGFuY2UucmVnaXN0ZXJSZWFkeVN0YXRlTGlzdGVuZXIoKCkgPT4ge1xuICAgICAgICAgICAgaWYgKGlzRGF0YVNldFdpZGdldCh0aGlzLmZpbHRlcndpZGdldCkpIHtcbiAgICAgICAgICAgICAgICAvLyBpZiBiaW5kaW5nIGlzIGRlcGFydG1lbnQuZGVwdElkIHRoZW4gZmllbGQgd2lsbCBiZSBkZXB0SWRcbiAgICAgICAgICAgICAgICBjb25zdCBmaWVsZCA9IF8ubGFzdCh0aGlzLmJpbmRpbmcuc3BsaXQoJy4nKSk7XG4gICAgICAgICAgICAgICAgdGhpcy5maWx0ZXJJbnN0YW5jZS5kYXRhc2V0ID0gdGhpcy5fZmlsdGVyRGF0YVNldDtcbiAgICAgICAgICAgICAgICB0aGlzLmZpbHRlckluc3RhbmNlLmRhdGFmaWVsZCA9IHRoaXMuZmlsdGVyZGF0YWZpZWxkIHx8IGZpZWxkO1xuICAgICAgICAgICAgICAgIHRoaXMuZmlsdGVySW5zdGFuY2UuZGlzcGxheWZpZWxkID0gdGhpcy5maWx0ZXJkaXNwbGF5ZmllbGQgfHwgZmllbGQ7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZmlsdGVyd2lkZ2V0ID09PSBGb3JtV2lkZ2V0VHlwZS5BVVRPQ09NUExFVEUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5maWx0ZXJJbnN0YW5jZS5kaXNwbGF5bGFiZWwgPSB0aGlzLmZpbHRlcmRpc3BsYXlsYWJlbCB8fCBmaWVsZDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5maWx0ZXJJbnN0YW5jZS5zZWFyY2hrZXkgPSB0aGlzLmZpbHRlcnNlYXJjaGtleSB8fCBmaWVsZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5maWx0ZXJ3aWRnZXQgPT09IEZvcm1XaWRnZXRUeXBlLlRJTUUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmZpbHRlckluc3RhbmNlLnRpbWVwYXR0ZXJuID0gdGhpcy5hcHBEZWZhdWx0cy50aW1lRm9ybWF0IHx8ICdoaDptbTpzcyBhJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuZmlsdGVySW5zdGFuY2UucGxhY2Vob2xkZXIgPSB0aGlzLmZpbHRlcnBsYWNlaG9sZGVyIHx8ICcnO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBPbiBjaGFuZ2Ugb2YgYW55IHZhbGlkYXRpb24gcHJvcGVydHksIHNldCB0aGUgYW5ndWxhciBmb3JtIHZhbGlkYXRvcnNcbiAgICBzZXRVcFZhbGlkYXRvcnMod2lkZ2V0KSB7XG4gICAgICAgIGNvbnN0IGNvbnRyb2wgPSB0aGlzLmdldEZvcm1Db250cm9sKHdpZGdldCA9PT0gJ2lubGluZUluc3RhbmNlTmV3JyA/ICdfbmV3JyA6IHVuZGVmaW5lZCk7XG4gICAgICAgIGlmICghY29udHJvbCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHZhbGlkYXRvcnMgPSBbXTtcbiAgICAgICAgaWYgKHRoaXMucmVxdWlyZWQpIHtcbiAgICAgICAgICAgIC8vIEZvciBjaGVja2JveC90b2dnbGUgd2lkZ2V0LCByZXF1aXJlZCB2YWxpZGF0aW9uIHNob3VsZCBjb25zaWRlciB0cnVlIHZhbHVlIG9ubHlcbiAgICAgICAgICAgIGlmICh0aGlzLmVkaXRXaWRnZXRUeXBlID09PSBGb3JtV2lkZ2V0VHlwZS5DSEVDS0JPWCB8fCB0aGlzLmVkaXRXaWRnZXRUeXBlID09PSBGb3JtV2lkZ2V0VHlwZS5UT0dHTEUpIHtcbiAgICAgICAgICAgICAgICB2YWxpZGF0b3JzLnB1c2goVmFsaWRhdG9ycy5yZXF1aXJlZFRydWUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB2YWxpZGF0b3JzLnB1c2goVmFsaWRhdG9ycy5yZXF1aXJlZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMubWF4Y2hhcnMpIHtcbiAgICAgICAgICAgIHZhbGlkYXRvcnMucHVzaChWYWxpZGF0b3JzLm1heExlbmd0aCh0aGlzLm1heGNoYXJzKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMubWludmFsdWUpIHtcbiAgICAgICAgICAgIHZhbGlkYXRvcnMucHVzaChWYWxpZGF0b3JzLm1pbih0aGlzLm1pbnZhbHVlKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMubWF4dmFsdWUpIHtcbiAgICAgICAgICAgIHZhbGlkYXRvcnMucHVzaChWYWxpZGF0b3JzLm1heCh0aGlzLm1heHZhbHVlKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMucmVnZXhwKSB7XG4gICAgICAgICAgICB2YWxpZGF0b3JzLnB1c2goVmFsaWRhdG9ycy5wYXR0ZXJuKHRoaXMucmVnZXhwKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXNbd2lkZ2V0XSAmJiBfLmlzRnVuY3Rpb24odGhpc1t3aWRnZXRdLnZhbGlkYXRlKSkge1xuICAgICAgICAgICAgdmFsaWRhdG9ycy5wdXNoKHRoaXNbd2lkZ2V0XS52YWxpZGF0ZS5iaW5kKHRoaXNbd2lkZ2V0XSkpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnRyb2wuc2V0VmFsaWRhdG9ycyh2YWxpZGF0b3JzKTtcbiAgICAgICAgY29udHJvbC51cGRhdGVWYWx1ZUFuZFZhbGlkaXR5KCk7XG4gICAgfVxuXG4gICAgLy8gU2V0IHRoZSBwcm9wcyBvbiB0aGUgaW5saW5lIGVkaXQgd2lkZ2V0XG4gICAgc2V0SW5saW5lV2lkZ2V0UHJvcCh3aWRnZXQsIHByb3AsIG52KSB7XG4gICAgICAgIGlmIChwcm9wID09PSAnZGF0ZXBhdHRlcm4nICYmIHRoaXMuZWRpdFdpZGdldFR5cGUgPT09IEZvcm1XaWRnZXRUeXBlLlRJTUUpIHtcbiAgICAgICAgICAgIHByb3AgPSAndGltZXBhdHRlcm4nO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzW3dpZGdldF0gJiYgaXNEZWZpbmVkKG52KSkge1xuICAgICAgICAgICAgdGhpc1t3aWRnZXRdW3Byb3BdID0gbnY7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHZhbGlkYXRpb25Qcm9wcy5pbmNsdWRlcyhwcm9wKSkge1xuICAgICAgICAgICAgdGhpcy5fZGVib3VuY2VTZXRVcFZhbGlkYXRvcnMoKTtcbiAgICAgICAgICAgIHRoaXMuX2RlYm91bmNlU2V0VXBWYWxpZGF0b3JzTmV3KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBJbml0aWFsaXplIHRoZSBpbmxpbmUgZWRpdCB3aWRnZXRcbiAgICBzZXRVcElubGluZVdpZGdldCh3aWRnZXQpIHtcbiAgICAgICAgdGhpc1t3aWRnZXRdLnJlZ2lzdGVyUmVhZHlTdGF0ZUxpc3RlbmVyKCgpID0+IHtcbiAgICAgICAgICAgIGlmIChpc0RhdGFTZXRXaWRnZXQodGhpc1snZWRpdC13aWRnZXQtdHlwZSddKSkge1xuICAgICAgICAgICAgICAgIHRoaXNbd2lkZ2V0XS5kYXRhc2V0ID0gdGhpcy5kYXRhc2V0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaW5saW5lV2lkZ2V0UHJvcHMuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0SW5saW5lV2lkZ2V0UHJvcCh3aWRnZXQsIGtleSwgdGhpc1trZXldKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpc1t3aWRnZXRdLmRhdGFzb3VyY2UgPSB0aGlzLl9kYXRhc291cmNlO1xuICAgICAgICAgICAgdGhpc1t3aWRnZXRdLmRhdGFvcHRpb25zID0gdGhpcy5fZGF0YW9wdGlvbnM7XG4gICAgICAgICAgICB0aGlzLnNldElubGluZVdpZGdldFByb3Aod2lkZ2V0LCAnZGF0ZXBhdHRlcm4nLCB0aGlzLmVkaXRkYXRlcGF0dGVybik7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGdldFN0eWxlRGVmKCkge1xuICAgICAgICByZXR1cm4gYHdpZHRoOiAke3RoaXMud2lkdGggfHwgJyd9OyBiYWNrZ3JvdW5kLWNvbG9yOiAke3RoaXMuYmFja2dyb3VuZGNvbG9yIHx8ICcnfTsgY29sb3I6ICR7dGhpcy50ZXh0Y29sb3IgfHwgJyd9O2A7XG4gICAgfVxuXG4gICAgcG9wdWxhdGVGaWVsZERlZigpIHtcbiAgICAgICAgdGhpcy53aWR0aCA9IHRoaXMud2lkdGggPT09ICdweCcgPyAgJycgOiAodGhpcy53aWR0aCB8fCAnJyk7XG4gICAgICAgIHRoaXMuZmllbGQgPSB0aGlzLmJpbmRpbmc7XG4gICAgICAgIHRoaXMuZGlzcGxheU5hbWUgPSAgdGhpcy5jYXB0aW9uIHx8ICcnO1xuICAgICAgICB0aGlzLnBjRGlzcGxheSA9ICB0aGlzLnBjZGlzcGxheTtcbiAgICAgICAgdGhpcy5tb2JpbGVEaXNwbGF5ID0gIHRoaXMubW9iaWxlZGlzcGxheTtcbiAgICAgICAgdGhpcy50ZXh0QWxpZ25tZW50ID0gIHRoaXMudGV4dGFsaWdubWVudDtcbiAgICAgICAgdGhpcy5iYWNrZ3JvdW5kQ29sb3IgPSAgdGhpcy5iYWNrZ3JvdW5kY29sb3I7XG4gICAgICAgIHRoaXMudGV4dENvbG9yID0gIHRoaXMudGV4dGNvbG9yO1xuICAgICAgICB0aGlzLnByaW1hcnlLZXkgPSAgdGhpc1sncHJpbWFyeS1rZXknXTtcbiAgICAgICAgdGhpcy5yZWxhdGVkRW50aXR5TmFtZSA9ICB0aGlzWydyZWxhdGVkLWVudGl0eS1uYW1lJ107XG4gICAgICAgIHRoaXMuc3R5bGUgPSAgdGhpcy5nZXRTdHlsZURlZigpO1xuICAgICAgICB0aGlzLmNsYXNzID0gIHRoaXNbJ2NvbC1jbGFzcyddO1xuICAgICAgICB0aGlzLm5nY2xhc3MgPSAgdGhpc1snY29sLW5nLWNsYXNzJ107XG4gICAgICAgIHRoaXMuZm9ybWF0cGF0dGVybiA9ICB0aGlzLmZvcm1hdHBhdHRlcm4gPT09ICd0b051bWJlcicgPyAnbnVtYmVyVG9TdHJpbmcnICA6ICB0aGlzLmZvcm1hdHBhdHRlcm47XG4gICAgICAgIHRoaXMuc2VhcmNoYWJsZSA9ICAodGhpcy50eXBlID09PSAnYmxvYicgfHwgdGhpcy50eXBlID09PSAnY2xvYicpID8gZmFsc2UgIDogIHRoaXMuc2VhcmNoYWJsZTtcbiAgICAgICAgdGhpcy5saW1pdCA9ICB0aGlzLmxpbWl0ID8gK3RoaXMubGltaXQgIDogIHVuZGVmaW5lZDtcbiAgICAgICAgdGhpcy5lZGl0V2lkZ2V0VHlwZSA9IHRoaXNbJ2VkaXQtd2lkZ2V0LXR5cGUnXSA9ICB0aGlzWydlZGl0LXdpZGdldC10eXBlJ10gfHwgZ2V0RWRpdE1vZGVXaWRnZXQodGhpcyk7XG4gICAgICAgIHRoaXMuZmlsdGVyT24gPSAgdGhpc1snZmlsdGVyLW9uJ107XG4gICAgICAgIHRoaXMucmVhZG9ubHkgPSAgaXNEZWZpbmVkKHRoaXMuZ2V0QXR0cigncmVhZG9ubHknKSkgPyB0aGlzLmdldEF0dHIoJ3JlYWRvbmx5JykgPT09ICd0cnVlJyA6ICAodGhpc1sncmVsYXRlZC1lbnRpdHktbmFtZSddID8gIXRoaXNbJ3ByaW1hcnkta2V5J10gOiAgXy5pbmNsdWRlcyhbJ2lkZW50aXR5JywgJ3VuaXF1ZWlkJywgJ3NlcXVlbmNlJ10sIHRoaXMuZ2VuZXJhdG9yKSk7XG4gICAgICAgIHRoaXMuZmlsdGVyd2lkZ2V0ID0gIHRoaXMuZmlsdGVyd2lkZ2V0IHx8IGdldERhdGFUYWJsZUZpbHRlcldpZGdldCh0aGlzLnR5cGUgfHwgJ3N0cmluZycpO1xuICAgICAgICB0aGlzLmlzRmlsdGVyRGF0YVNldEJvdW5kID0gISF0aGlzLmJpbmRmaWx0ZXJkYXRhc2V0O1xuICAgICAgICB0aGlzLmRlZmF1bHR2YWx1ZSA9IGdldERlZmF1bHRWYWx1ZSh0aGlzLmRlZmF1bHR2YWx1ZSwgdGhpcy50eXBlLCB0aGlzLmVkaXRXaWRnZXRUeXBlKTtcblxuICAgICAgICAvLyBGb3IgZGF0ZSB0aW1lIGRhdGEgdHlwZXMsIGlmIGRhdGUgcGF0dGVybiBpcyBub3Qgc3BlY2lmaWVkLCBzZXQgdGhlIGFwcCBmb3JtYXQgb3IgZGVmYXVsdCBmb3JtYXRcbiAgICAgICAgaWYgKGlzRGF0ZVRpbWVUeXBlKHRoaXMudHlwZSkgJiYgdGhpcy5mb3JtYXRwYXR0ZXJuID09PSAndG9EYXRlJyAmJiAhdGhpcy5kYXRlcGF0dGVybikge1xuICAgICAgICAgICAgY29uc3QgZGVmYXVsdEZvcm1hdCA9IGdldERpc3BsYXlEYXRlVGltZUZvcm1hdCh0aGlzLnR5cGUpO1xuICAgICAgICAgICAgaWYgKHRoaXMudHlwZSA9PT0gRGF0YVR5cGUuREFURSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZXBhdHRlcm4gID0gdGhpcy5hcHBEZWZhdWx0cy5kYXRlRm9ybWF0IHx8IGRlZmF1bHRGb3JtYXQ7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMudHlwZSA9PT0gRGF0YVR5cGUuVElNRSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZGF0ZXBhdHRlcm4gID0gdGhpcy5hcHBEZWZhdWx0cy50aW1lRm9ybWF0IHx8IGRlZmF1bHRGb3JtYXQ7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMudHlwZSA9PT0gRGF0YVR5cGUuVElNRVNUQU1QIHx8IHRoaXMudHlwZSA9PT0gRGF0YVR5cGUuREFURVRJTUUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGVwYXR0ZXJuICA9IHRoaXMuYXBwRGVmYXVsdHMuZGF0ZVRpbWVGb3JtYXQgfHwgZGVmYXVsdEZvcm1hdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIG9uUHJvcGVydHlDaGFuZ2Uoa2V5LCBudiwgb3YpIHtcbiAgICAgICAgaWYgKCF0aGlzLl9wcm9wc0luaXRpYWxpemVkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgc3dpdGNoIChrZXkpIHtcbiAgICAgICAgICAgIGNhc2UgJ2NhcHRpb24nOlxuICAgICAgICAgICAgICAgIHRoaXMuZGlzcGxheU5hbWUgPSBudiB8fCAnJztcbiAgICAgICAgICAgICAgICB0aGlzLnNldFByb3BlcnR5KCdkaXNwbGF5TmFtZScsIHRoaXMuZGlzcGxheU5hbWUpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnZGVmYXVsdHZhbHVlJzpcbiAgICAgICAgICAgICAgICB0aGlzLmRlZmF1bHR2YWx1ZSA9IGdldERlZmF1bHRWYWx1ZSh0aGlzLmRlZmF1bHR2YWx1ZSwgdGhpcy50eXBlLCB0aGlzLmVkaXRXaWRnZXRUeXBlKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3Nob3cnOlxuICAgICAgICAgICAgICAgIHRoaXMudGFibGUucmVkcmF3KHRydWUpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnZmlsdGVyZGF0YXNldCc6XG4gICAgICAgICAgICAgICAgdGhpcy5fZmlsdGVyRGF0YVNldCA9IG52O1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0RmlsdGVyV2lkZ2V0RGF0YVNldCgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnZWRpdGRhdGVwYXR0ZXJuJzpcbiAgICAgICAgICAgICAgICB0aGlzLnNldElubGluZVdpZGdldFByb3AoJ2lubGluZUluc3RhbmNlJywgJ2RhdGVwYXR0ZXJuJywgbnYpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0SW5saW5lV2lkZ2V0UHJvcCgnaW5saW5lSW5zdGFuY2VOZXcnLCAnZGF0ZXBhdHRlcm4nLCBudik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGlmIChpbmxpbmVXaWRnZXRQcm9wcy5pbmNsdWRlcyhrZXkpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0SW5saW5lV2lkZ2V0UHJvcCgnaW5saW5lSW5zdGFuY2UnLCBrZXksIG52KTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRJbmxpbmVXaWRnZXRQcm9wKCdpbmxpbmVJbnN0YW5jZU5ldycsIGtleSwgbnYpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIHN1cGVyLm9uUHJvcGVydHlDaGFuZ2Uoa2V5LCBudiwgb3YpO1xuICAgIH1cblxuICAgIHNldFByb3BlcnR5KHByb3BlcnR5LCBudikge1xuICAgICAgICB0aGlzW3Byb3BlcnR5XSA9IG52O1xuICAgICAgICBzd2l0Y2ggKHByb3BlcnR5KSB7XG4gICAgICAgICAgICBjYXNlICdkaXNwbGF5TmFtZSc6XG4gICAgICAgICAgICAgICAgdGhpcy50YWJsZS5jYWxsRGF0YUdyaWRNZXRob2QoJ3NldENvbHVtblByb3AnLCB0aGlzLmZpZWxkLCBwcm9wZXJ0eSwgbnYpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICB0aGlzLnRhYmxlLnJlZHJhdyh0cnVlKTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==