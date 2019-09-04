import * as tslib_1 from "tslib";
import { Attribute, Component, ContentChildren, ContentChild, ElementRef, HostListener, Injector, NgZone, QueryList, ViewChild, ViewContainerRef, TemplateRef } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Subject } from 'rxjs';
import { $appDigest, $parseEvent, $unwatch, $watch, App, closePopover, DataSource, getClonedObject, getValidJSON, isDataSourceEqual, isDefined, isMobile, triggerFn, DynamicComponentRefProvider, extendProto } from '@wm/core';
import { styler } from '../../framework/styler';
import { StylableComponent } from '../base/stylable.component';
import { PaginationComponent } from '../pagination/pagination.component';
import { registerProps } from './table.props';
import { EDIT_MODE, getRowOperationsColumn } from '../../../utils/live-utils';
import { transformData } from '../../../utils/data-utils';
import { getConditionalClasses, getOrderByExpr, prepareFieldDefs, provideAsNgValueAccessor, provideAsWidgetRef } from '../../../utils/widget-utils';
const DEFAULT_CLS = 'app-grid app-panel panel';
const WIDGET_CONFIG = { widgetType: 'wm-table', hostClass: DEFAULT_CLS };
const exportIconMapping = {
    EXCEL: 'fa fa-file-excel-o',
    CSV: 'fa fa-file-text-o'
};
const ROW_OPS_FIELD = 'rowOperations';
const noop = () => { };
const ɵ0 = noop;
const isInputBodyWrapper = target => {
    const classes = ['.dropdown-menu', '.uib-typeahead-match', '.modal-dialog', '.toast'];
    let isInput = false;
    classes.forEach(cls => {
        if (target.closest(cls).length) {
            isInput = true;
            return false;
        }
    });
    const attrs = ['bsdatepickerdaydecorator'];
    if (!isInput) {
        attrs.forEach(attr => {
            if (target[0].hasAttribute(attr)) {
                isInput = true;
                return false;
            }
        });
    }
    return isInput;
};
const ɵ1 = isInputBodyWrapper;
export class TableComponent extends StylableComponent {
    constructor(inj, fb, app, dynamicComponentProvider, binddataset, binddatasource, readonlygrid, ngZone) {
        super(inj, WIDGET_CONFIG);
        this.inj = inj;
        this.fb = fb;
        this.app = app;
        this.dynamicComponentProvider = dynamicComponentProvider;
        this.binddataset = binddataset;
        this.binddatasource = binddatasource;
        this.readonlygrid = readonlygrid;
        this.ngZone = ngZone;
        this.rowActionsCompiledTl = {};
        this.rowFilterCompliedTl = {};
        this.inlineCompliedTl = {};
        this.inlineNewCompliedTl = {};
        this.customExprCompiledTl = {};
        this.rowDefInstances = {};
        this.rowDefMap = {};
        this.rowExpansionActionTl = {};
        this.columns = {};
        this.formfields = {};
        this.enablesort = true;
        this.selectedItems = [];
        this.selectedItemChange = new Subject();
        this.selectedItemChange$ = this.selectedItemChange.asObservable();
        this.actions = [];
        this._actions = {
            'header': [],
            'footer': []
        };
        this.exportOptions = [];
        this.headerConfig = [];
        this.items = [];
        this.rowActions = [];
        this.shownavigation = false;
        this.documentClickBind = noop;
        this.fieldDefs = [];
        this.rowDef = {};
        this.rowInstance = {};
        this.fullFieldDefs = [];
        this.applyProps = new Map();
        this.redraw = _.debounce(this._redraw, 150);
        this.debouncedHandleLoading = _.debounce(this.handleLoading, 350);
        // Filter and Sort Methods
        this.rowFilter = {};
        this._searchSortHandler = noop;
        this.searchSortHandler = (...args) => { this._searchSortHandler.apply(this, args); };
        this.onRowFilterChange = noop;
        this.onFilterConditionSelect = noop;
        this.showClearIcon = noop;
        this.clearRowFilter = noop;
        this.gridOptions = {
            data: [],
            colDefs: [],
            startRowIndex: 1,
            sortInfo: {
                field: '',
                direction: ''
            },
            filtermode: '',
            searchLabel: '',
            rowActions: [],
            headerConfig: [],
            rowClass: '',
            editmode: '',
            formPosition: '',
            isMobile: false,
            rowExpansionEnabled: false,
            rowDef: {
                position: '0'
            },
            name: '',
            messages: {
                selectField: 'Select Field'
            },
            onDataRender: () => {
                this.ngZone.run(() => {
                    if (this.gridData.length) {
                        this.invokeEventCallback('datarender', { $data: this.gridData, data: this.gridData });
                    }
                    // select rows selected in previous pages. (Not finding intersection of data and selecteditems as it will be heavy)
                    if (!this.multiselect) {
                        this.items.length = 0;
                    }
                    this.callDataGridMethod('selectRows', this.items);
                    this.selectedItems = this.callDataGridMethod('getSelectedRows');
                    this.selectedItemChange.next(this.selectedItems);
                    // On render, apply the filters set for query service variable
                    if (this._isPageSearch && this.filterInfo) {
                        this.searchSortHandler(this.filterInfo, undefined, 'search');
                    }
                });
            },
            onRowSelect: (row, e) => {
                this.ngZone.run(() => {
                    this.selectedItems = this.callDataGridMethod('getSelectedRows');
                    this.selectedItemChange.next(this.selectedItems);
                    const rowData = this.addRowIndex(row);
                    this.invokeEventCallback('rowselect', { $data: rowData, $event: e, row: rowData });
                });
            },
            // assigns the items on capture phase of the click handler.
            assignSelectedItems: (row, e) => {
                this.ngZone.run(() => {
                    /*
                     * in case of single select, update the items with out changing the reference.
                     * for multi select, keep old selected items in tact
                     */
                    if (this.multiselect) {
                        if (_.findIndex(this.items, row) === -1) {
                            this.items.push(row);
                        }
                    }
                    else {
                        this.items.length = 0;
                        this.items.push(row);
                    }
                });
            },
            onRowDblClick: (row, e) => {
                const rowData = this.addRowIndex(row);
                this.invokeEventCallback('rowdblclick', { $data: rowData, $event: e, row: rowData });
            },
            onRowDeselect: (row, e) => {
                if (this.multiselect) {
                    this.ngZone.run(() => {
                        this.items = _.pullAllWith(this.items, [row], _.isEqual);
                        this.selectedItems = this.callDataGridMethod('getSelectedRows');
                        this.invokeEventCallback('rowdeselect', { $data: row, $event: e, row });
                    });
                }
            },
            callOnRowDeselectEvent: (row, e) => {
                this.invokeEventCallback('rowdeselect', { $data: row, $event: e, row });
            },
            callOnRowClickEvent: (row, e) => {
                // Call row click only if click is triggered by user
                if (e && e.hasOwnProperty('originalEvent')) {
                    const rowData = this.addRowIndex(row);
                    this.invokeEventCallback('rowclick', { $data: rowData, $event: e, row: rowData });
                }
            },
            closePopover: closePopover,
            onColumnSelect: (col, e) => {
                this.selectedColumns = this.callDataGridMethod('getSelectedColumns');
                this.invokeEventCallback('columnselect', { $data: col, $event: e });
            },
            onColumnDeselect: (col, e) => {
                this.selectedColumns = this.callDataGridMethod('getSelectedColumns');
                this.invokeEventCallback('columndeselect', { $data: col, $event: e });
            },
            onHeaderClick: (col, e) => {
                // if onSort function is registered invoke it when the column header is clicked
                this.invokeEventCallback('headerclick', { $event: e, $data: col, column: col });
            },
            onRowDelete: (row, cancelRowDeleteCallback, e, callBack, options) => {
                this.ngZone.run(() => {
                    this.deleteRecord(_.extend({}, options, { row, 'cancelRowDeleteCallback': cancelRowDeleteCallback, 'evt': e, 'callBack': callBack }));
                });
            },
            onRowInsert: (row, e, callBack, options) => {
                this.insertRecord(_.extend({}, options, { row, event: e, 'callBack': callBack }));
            },
            beforeRowUpdate: (row, eventName) => {
                if (this._liveTableParent) {
                    this._liveTableParent.updateRow(row, eventName);
                }
                this.prevData = getClonedObject(row);
            },
            afterRowUpdate: (row, e, callBack, options) => {
                this.updateRecord(_.extend({}, options, { row, 'prevData': this.prevData, 'event': e, 'callBack': callBack }));
            },
            onBeforeRowUpdate: (row, e, options) => {
                return this.invokeEventCallback('beforerowupdate', { $event: e, $data: row, row, options: options });
            },
            onBeforeRowInsert: (row, e, options) => {
                return this.invokeEventCallback('beforerowinsert', { $event: e, $data: row, row, options: options });
            },
            onBeforeRowDelete: (row, e, options) => {
                const rowData = this.addRowIndex(row);
                return this.invokeEventCallback('beforerowdelete', { $event: e, row: rowData, options: options });
            },
            onFormRender: ($row, e, operation, alwaysNewRow) => {
                const widget = alwaysNewRow ? 'inlineInstanceNew' : 'inlineInstance';
                setTimeout(() => {
                    this.formWidgets = {};
                    this.fieldDefs.forEach(col => {
                        if (col[widget]) {
                            this.formWidgets[col.field] = col[widget];
                            this.setDisabledOnField(operation, col, widget);
                        }
                    });
                    this.invokeEventCallback('formrender', { $event: e, formWidgets: this.formWidgets, $operation: operation });
                }, 250);
            },
            onBeforeFormRender: (row, e, operation) => {
                return this.invokeEventCallback('beforeformrender', { $event: e, row, $operation: operation });
            },
            registerRowNgClassWatcher: (rowData, index) => {
                if (!this.rowngclass) {
                    return;
                }
                const row = this.getClonedRowObject(rowData);
                const watchName = `${this.widgetId}_rowNgClass_${index}`;
                $unwatch(watchName);
                this.registerDestroyListener($watch(this.rowngclass, this.viewParent, { row }, (nv, ov) => {
                    this.callDataGridMethod('applyRowNgClass', getConditionalClasses(nv, ov), index);
                }, watchName));
            },
            registerColNgClassWatcher: (rowData, colDef, rowIndex, colIndex) => {
                if (!colDef['col-ng-class']) {
                    return;
                }
                const row = this.getClonedRowObject(rowData);
                const watchName = `${this.widgetId}_colNgClass_${rowIndex}_${colIndex}`;
                $unwatch(watchName);
                this.registerDestroyListener($watch(colDef['col-ng-class'], this.viewParent, { row }, (nv, ov) => {
                    this.callDataGridMethod('applyColNgClass', getConditionalClasses(nv, ov), rowIndex, colIndex);
                }, watchName));
            },
            clearCustomExpression: () => {
                this.customExprViewRef.clear();
                this.customExprCompiledTl = {};
            },
            clearRowDetailExpression: () => {
                this.rowDetailViewRef.clear();
                this.rowDefMap = {};
                this.rowDefInstances = {};
            },
            generateCustomExpressions: (rowData, index) => {
                const row = this.getClonedRowObject(rowData);
                const compileTemplate = (tmpl) => {
                    if (!tmpl) {
                        return;
                    }
                    const colDef = {};
                    const context = {
                        row,
                        colDef
                    };
                    this.addEventsToContext(context);
                    const customExprView = this.customExprViewRef.createEmbeddedView(tmpl, context);
                    const rootNode = customExprView.rootNodes[0];
                    const fieldName = rootNode.getAttribute('data-col-identifier');
                    _.extend(colDef, this.columns[fieldName]);
                    this.customExprCompiledTl[fieldName + index] = rootNode;
                };
                if (this.isdynamictable) {
                    this.fieldDefs.forEach(col => {
                        compileTemplate(col.customExprTmpl);
                    });
                    return;
                }
                // For all the columns inside the table, generate the custom expression
                this.customExprTmpl.forEach(compileTemplate.bind(this));
            },
            generateRowExpansionCell: (rowData, index) => {
                const row = this.getClonedRowObject(rowData);
                // For all the columns inside the table, generate the inline widget
                this.rowExpansionActionTmpl.forEach((tmpl) => {
                    this.rowExpansionActionTl[index] = this.rowExpansionActionViewRef.createEmbeddedView(tmpl, { row }).rootNodes;
                });
            },
            getRowExpansionAction: (index) => {
                return this.rowExpansionActionTl[index];
            },
            generateRowDetailView: ($event, rowData, rowId, $target, $overlay, callback) => {
                const row = this.getClonedRowObject(rowData);
                const rowDef = getClonedObject(this.rowDef);
                if (this.rowInstance.invokeEventCallback('beforerowexpand', { $event, $data: rowDef, row }) === false) {
                    return;
                }
                if (!rowDef.content) {
                    return;
                }
                // Expand the row detail
                callback();
                // Row is already rendered. Return here
                if (this.rowDefMap[rowId] && this.rowDefMap[rowId].content === rowDef.content) {
                    this.rowInstance.invokeEventCallback('rowexpand', { $event, row, $data: this.rowDefInstances[rowId] });
                    return;
                }
                this.rowDefMap[rowId] = rowDef;
                $target.empty();
                $target.hide();
                $overlay.show();
                const context = {
                    row,
                    rowDef,
                    containerLoad: (widget) => {
                        setTimeout(() => {
                            $overlay.hide();
                            $target.show();
                            this.rowDefInstances[rowId] = widget;
                            this.rowInstance.invokeEventCallback('rowexpand', { $event, row, $data: widget });
                        }, 500);
                    }
                };
                const rootNode = this.rowDetailViewRef.createEmbeddedView(this.rowExpansionTmpl, context).rootNodes[0];
                $target[0].appendChild(rootNode);
                $appDigest();
            },
            onBeforeRowCollapse: ($event, row, rowId) => {
                return this.rowInstance.invokeEventCallback('beforerowcollapse', { $event, row, $data: this.rowDefInstances[rowId] });
            },
            onRowCollapse: ($event, row) => {
                this.rowInstance.invokeEventCallback('rowcollapse', { $event, row });
            },
            getCustomExpression: (fieldName, index) => {
                return this.customExprCompiledTl[fieldName + index] || '';
            },
            clearRowActions: () => {
                this.rowActionsViewRef.clear();
                this.rowActionsCompiledTl = {};
                this.rowExpansionActionViewRef.clear();
                this.rowExpansionActionTl = {};
            },
            generateRowActions: (rowData, index) => {
                const row = this.getClonedRowObject(rowData);
                this.rowActionsCompiledTl[index] = [];
                // For all the columns inside the table, generate the inline widget
                this.rowActionTmpl.forEach((tmpl) => {
                    this.rowActionsCompiledTl[index].push(...this.rowActionsViewRef.createEmbeddedView(tmpl, { row }).rootNodes);
                });
            },
            getRowAction: (index) => {
                return this.rowActionsCompiledTl[index];
            },
            generateInlineEditRow: (rowData, alwaysNewRow) => {
                const row = this.getClonedRowObject(rowData);
                if (alwaysNewRow) {
                    // Clear the view container ref
                    this.inlineEditNewViewRef.clear();
                    this.inlineNewCompliedTl = {};
                    // For all the columns inside the table, generate the inline widget
                    this.inlineWidgetNewTmpl.forEach(tmpl => {
                        let fieldName;
                        const context = {
                            row,
                            getControl: () => {
                                return this.ngform.controls[fieldName + '_new'] || {};
                            },
                            getValidationMessage: () => {
                                return this.columns[fieldName] && this.columns[fieldName].validationmessage;
                            }
                        };
                        const rootNode = this.inlineEditNewViewRef.createEmbeddedView(tmpl, context).rootNodes[0];
                        fieldName = rootNode.getAttribute('data-col-identifier');
                        this.inlineNewCompliedTl[fieldName] = rootNode;
                    });
                    this.clearForm(true);
                    return;
                }
                // Clear the view container ref
                this.inlineEditViewRef.clear();
                this.inlineCompliedTl = {};
                this.clearForm();
                // For all the columns inside the table, generate the inline widget
                this.inlineWidgetTmpl.forEach(tmpl => {
                    let fieldName;
                    const context = {
                        row,
                        getControl: () => {
                            return this.ngform.controls[fieldName] || {};
                        },
                        getValidationMessage: () => {
                            return this.columns[fieldName] && this.columns[fieldName].validationmessage;
                        }
                    };
                    const rootNode = this.inlineEditViewRef.createEmbeddedView(tmpl, context).rootNodes[0];
                    fieldName = rootNode.getAttribute('data-col-identifier');
                    this.inlineCompliedTl[fieldName] = rootNode;
                });
            },
            getInlineEditWidget: (fieldName, value, alwaysNewRow) => {
                if (alwaysNewRow) {
                    this.gridOptions.setFieldValue(fieldName + '_new', value);
                    return this.inlineNewCompliedTl[fieldName];
                }
                this.gridOptions.setFieldValue(fieldName, value);
                return this.inlineCompliedTl[fieldName];
            },
            setFieldValue: (fieldName, value) => {
                const control = this.ngform.controls && this.ngform.controls[fieldName];
                if (control) {
                    control.setValue(value);
                }
            },
            getFieldValue: fieldName => {
                const control = this.ngform.controls && this.ngform.controls[fieldName];
                return control && control.value;
            },
            generateFilterRow: () => {
                // Clear the view container ref
                this.filterViewRef.clear();
                this.rowFilterCompliedTl = {};
                // For all the columns inside the table, generate the compiled filter template
                this.filterTmpl.forEach((tmpl) => {
                    const rootNode = this.filterViewRef.createEmbeddedView(tmpl, {
                        changeFn: this.onRowFilterChange.bind(this),
                        isDisabled: (fieldName) => {
                            return this.emptyMatchModes.indexOf(this.rowFilter[fieldName] && this.rowFilter[fieldName].matchMode) > -1;
                        }
                    }).rootNodes[0];
                    this.rowFilterCompliedTl[rootNode.getAttribute('data-col-identifier')] = rootNode;
                });
            },
            getFilterWidget: (fieldName) => {
                // Move the generated filter template to the filter row
                return this.rowFilterCompliedTl[fieldName];
            },
            setGridEditMode: (val) => {
                this.ngZone.run(() => {
                    this.isGridEditMode = val;
                    $appDigest();
                });
            },
            setGridState: (val) => {
                this.isLoading = val === 'loading';
            },
            noChangesDetected: () => {
                this.toggleMessage(true, 'info', 'No Changes Detected');
            },
            // Function to redraw the widgets on resize of columns
            redrawWidgets: () => {
                this.fieldDefs.forEach(col => {
                    triggerFn(col.inlineInstance && col.inlineInstance.redraw);
                    triggerFn(col.inlineInstanceNew && col.inlineInstanceNew.redraw);
                    triggerFn(col.filterInstance && col.filterInstance.redraw);
                });
            },
            searchHandler: this.searchSortHandler.bind(this),
            sortHandler: this.searchSortHandler.bind(this),
            timeoutCall: (fn, delay) => {
                setTimeout(fn, delay);
            },
            runInNgZone: fn => {
                this.ngZone.run(fn);
            },
            safeApply: () => {
                $appDigest();
            },
            setTouched: (name) => {
                const ctrl = this.ngform.controls[name];
                if (ctrl) {
                    ctrl.markAsTouched();
                }
            },
            clearForm: this.clearForm.bind(this)
        };
        this._onChange = () => { };
        this._onTouched = () => { };
        styler(this.nativeElement, this);
        this.ngform = fb.group({});
        this.addEventsToContext(this.context);
        // Show loading status based on the variable life cycle
        this.app.subscribe('toggle-variable-state', options => {
            if (this.datasource && this.datasource.execute(DataSource.Operation.IS_API_AWARE) && isDataSourceEqual(options.variable, this.datasource)) {
                isDefined(this.variableInflight) ? this.debouncedHandleLoading(options) : this.handleLoading(options);
            }
        });
        this.deleteoktext = this.appLocale.LABEL_OK;
        this.deletecanceltext = this.appLocale.LABEL_CANCEL;
    }
    set gridData(newValue) {
        this._gridData = newValue;
        let startRowIndex = 0;
        let gridOptions;
        this._onChange(newValue);
        this._onTouched();
        if (isDefined(newValue)) {
            /*Setting the serial no's only when show navigation is enabled and data navigator is compiled
             and its current page is set properly*/
            if (this.isNavigationEnabled() && this.dataNavigator.dn.currentPage) {
                startRowIndex = ((this.dataNavigator.dn.currentPage - 1) * (this.dataNavigator.maxResults || 1)) + 1;
                this.setDataGridOption('startRowIndex', startRowIndex);
            }
            /* If colDefs are available, but not already set on the datagrid, then set them.
             * This will happen while switching from markup to design tab. */
            gridOptions = this.callDataGridMethod('getOptions');
            if (!gridOptions) {
                return;
            }
            if (!gridOptions.colDefs.length && this.fieldDefs.length) {
                this.setDataGridOption('colDefs', getClonedObject(this.fieldDefs));
            }
            // If data and colDefs are present, call on before data render event
            if (!this.isdynamictable && !_.isEmpty(newValue) && gridOptions.colDefs.length) {
                this.invokeEventCallback('beforedatarender', { $data: newValue, $columns: this.columns, data: newValue, columns: this.columns });
            }
            this.setDataGridOption('data', getClonedObject(newValue));
        }
    }
    get gridData() {
        return this._gridData || [];
    }
    get selecteditem() {
        if (this.multiselect) {
            return getClonedObject(this.items);
        }
        if (_.isEmpty(this.items)) {
            return {};
        }
        return getClonedObject(this.items[0]);
    }
    set selecteditem(val) {
        // Select the rows in the table based on the new selected items passed
        this.items.length = 0;
        this.callDataGridMethod('selectRows', val);
    }
    onKeyPress($event) {
        if ($event.which === 13) {
            this.invokeEventCallback('enterkeypress', { $event, $data: this.gridData });
        }
    }
    ngAfterContentInit() {
        super.ngAfterContentInit();
        const runModeInitialProperties = {
            showrowindex: 'showRowIndex',
            multiselect: 'multiselect',
            radioselect: 'showRadioColumn',
            filternullrecords: 'filterNullRecords',
            enablesort: 'enableSort',
            showheader: 'showHeader',
            enablecolumnselection: 'enableColumnSelection',
            shownewrow: 'showNewRow',
            gridfirstrowselect: 'selectFirstRow'
        };
        if (this._liveTableParent) {
            this.isPartOfLiveGrid = true;
        }
        if (this.readonlygrid || !this.editmode) {
            if (this.readonlygrid === 'true') {
                this.editmode = '';
            }
            else {
                if (this.isPartOfLiveGrid) {
                    this.editmode = this.isPartOfLiveGrid.formlayout === 'inline' ? EDIT_MODE.FORM : EDIT_MODE.DIALOG;
                }
                else {
                    this.editmode = this.readonlygrid ? EDIT_MODE.INLINE : '';
                }
            }
        }
        this.gridOptions.colDefs = this.fullFieldDefs;
        this.gridOptions.rowActions = this.rowActions;
        this.gridOptions.headerConfig = this.headerConfig;
        this.gridOptions.rowClass = this.rowclass;
        this.gridOptions.editmode = this.editmode;
        this.gridOptions.formPosition = this.formposition;
        this.gridOptions.filtermode = this.filtermode;
        this.gridOptions.searchLabel = this.searchlabel;
        this.gridOptions.isMobile = isMobile();
        this.gridOptions.name = this.name;
        // When loadondemand property is enabled(deferload="true") and show is true, only the column titles of the datatable are rendered, the data(body of the datatable) is not at all rendered.
        // Because the griddata is setting before the datatable dom is rendered but we are sending empty data to the datatable.
        if (!_.isEmpty(this.gridData)) {
            this.gridOptions.data = getClonedObject(this.gridData);
        }
        this.gridOptions.messages = {
            'selectField': 'Select Field'
        };
        this.datagridElement = $(this._tableElement.nativeElement);
        this.gridElement = this.$element;
        this.$element.css({ 'position': 'relative' });
        _.forEach(runModeInitialProperties, (value, key) => {
            if (isDefined(this[key])) {
                this.gridOptions[value] = (this[key] === 'true' || this[key] === true);
            }
        });
        this.renderOperationColumns();
        this.gridOptions.colDefs = this.fieldDefs;
        this.datagridElement.datatable(this.gridOptions);
        this.callDataGridMethod('setStatus', 'loading', this.loadingdatamsg);
        this.applyProps.forEach(args => this.callDataGridMethod(...args));
        if (this.editmode === EDIT_MODE.QUICK_EDIT) {
            this.documentClickBind = this._documentClickBind.bind(this);
            document.addEventListener('click', this.documentClickBind);
        }
    }
    ngOnDestroy() {
        document.removeEventListener('click', this.documentClickBind);
        if (this.navigatorResultWatch) {
            this.navigatorResultWatch.unsubscribe();
        }
        if (this.navigatorMaxResultWatch) {
            this.navigatorMaxResultWatch.unsubscribe();
        }
        super.ngOnDestroy();
    }
    addRowIndex(row) {
        const rowData = getClonedObject(row);
        const rowIndex = _.indexOf(this.gridOptions.data, row);
        if (rowIndex < 0) {
            return row;
        }
        rowData.$index = rowIndex + 1;
        rowData.$isFirst = rowData.$index === 1;
        rowData.$isLast = this.gridData.length === rowData.$index;
        return rowData;
    }
    addEventsToContext(context) {
        context.addNewRow = () => this.addNewRow();
        context.deleteRow = () => this.deleteRow();
        context.editRow = () => this.editRow();
    }
    execute(operation, options) {
        if ([DataSource.Operation.IS_API_AWARE, DataSource.Operation.IS_PAGEABLE, DataSource.Operation.SUPPORTS_SERVER_FILTER].includes(operation)) {
            return false;
        }
        return this.datasource ? this.datasource.execute(operation, options) : {};
    }
    isNavigationEnabled() {
        return this.shownavigation && this.dataNavigator && this.dataNavigatorWatched;
    }
    getClonedRowObject(rowData) {
        const row = getClonedObject(rowData);
        row.getProperty = field => {
            return _.get(row, field);
        };
        row.$isFirst = row.$index === 1;
        row.$isLast = this.gridData.length === row.$index;
        delete row.$$index;
        delete row.$$pk;
        return row;
    }
    handleLoading(data) {
        this.variableInflight = data.active;
        // based on the active state and response toggling the 'loading data...' and 'no data found' messages.
        if (data.active) {
            this.callDataGridMethod('setStatus', 'loading', this.loadingdatamsg);
        }
        else {
            // If grid is in edit mode or grid has data, dont show the no data message
            if (!this.isGridEditMode && _.isEmpty(this.dataset)) {
                this.callDataGridMethod('setStatus', 'nodata', this.nodatamessage);
            }
            else {
                this.callDataGridMethod('setStatus', 'ready');
            }
        }
    }
    setDisabledOnField(operation, colDef, widgetType) {
        if (operation !== 'new' && colDef['primary-key'] && colDef.generator === 'assigned' && !colDef['related-entity-name'] && !colDef.period) {
            colDef[widgetType].disabled = true;
        }
    }
    resetFormControl(ctrl) {
        ctrl.markAsUntouched();
        ctrl.markAsPristine();
    }
    clearForm(newRow) {
        const ctrls = this.ngform.controls;
        _.keys(this.ngform.controls).forEach(key => {
            // If new row, clear the controls in the new row. Else, clear the controls in edit row
            if (!key.endsWith('_filter') && ((key.endsWith('_new') && newRow) || (!key.endsWith('_new') && !newRow))) {
                ctrls[key].setValue('');
                this.resetFormControl(ctrls[key]);
            }
        });
    }
    /* Check whether it is non-empty row. */
    isEmptyRecord(record) {
        const properties = Object.keys(record);
        let data, isDisplayed;
        return properties.every((prop, index) => {
            data = record[prop];
            /* If fieldDefs are missing, show all columns in data. */
            isDisplayed = (this.fieldDefs.length && isDefined(this.fieldDefs[index]) &&
                (isMobile() ? this.fieldDefs[index].mobileDisplay : this.fieldDefs[index].pcDisplay)) || true;
            /*Validating only the displayed fields*/
            if (isDisplayed) {
                return (data === null || data === undefined || data === '');
            }
            return true;
        });
    }
    /* Function to remove the empty data. */
    removeEmptyRecords(serviceData) {
        const allRecords = serviceData;
        let filteredData = [];
        if (allRecords && allRecords.length) {
            /*Comparing and pushing the non-empty data columns*/
            filteredData = allRecords.filter(record => {
                return record && !this.isEmptyRecord(record);
            });
        }
        return filteredData;
    }
    setGridData(serverData) {
        const data = this.filternullrecords ? this.removeEmptyRecords(serverData) : serverData;
        if (!this.variableInflight) {
            if (data && data.length === 0) {
                this.callDataGridMethod('setStatus', 'nodata', this.nodatamessage);
            }
            else {
                this.callDataGridMethod('setStatus', 'ready');
            }
        }
        this.gridData = data;
    }
    setDataGridOption(optionName, newVal, forceSet = false) {
        if (!this.datagridElement || !this.datagridElement.datatable || !this.datagridElement.datatable('instance')) {
            return;
        }
        const option = {};
        if (isDefined && (!_.isEqual(newVal, this.gridOptions[optionName]) || forceSet)) {
            option[optionName] = newVal;
            this.datagridElement.datatable('option', option);
            this.gridOptions[optionName] = newVal;
        }
    }
    callDataGridMethod(...args) {
        if (!this.datagridElement || !this.datagridElement.datatable('instance')) {
            this.applyProps.set(args[1], args);
            return; // If datagrid is not initiliazed or destroyed, return here
        }
        return this.datagridElement.datatable.apply(this.datagridElement, args);
    }
    renderOperationColumns() {
        let rowActionCol, insertPosition;
        const rowOperationsColumn = getRowOperationsColumn(), config = {
            'name': rowOperationsColumn.field,
            'field': rowOperationsColumn.field,
            'isPredefined': true
        };
        // Return if no fieldDefs are present
        if (!this.fieldDefs.length) {
            return;
        }
        rowActionCol = _.find(this.fullFieldDefs, { 'field': ROW_OPS_FIELD, type: 'custom' }); // Check if column is fetched from markup
        _.remove(this.fieldDefs, { type: 'custom', field: ROW_OPS_FIELD }); // Removing operations column
        _.remove(this.headerConfig, { field: rowOperationsColumn.field });
        /*Add the column for row operations only if at-least one operation has been enabled.*/
        if (this.rowActions.length) {
            if (rowActionCol) { // If column is present in markup, push the column or push the default column
                insertPosition = rowActionCol.rowactionsposition ? _.toNumber(rowActionCol.rowactionsposition) : this.fieldDefs.length;
                this.fieldDefs.splice(insertPosition, 0, rowActionCol);
                if (insertPosition === 0) {
                    this.headerConfig.unshift(config);
                }
                else {
                    this.headerConfig.push(config);
                }
            }
            else {
                this.fieldDefs.push(rowOperationsColumn);
                this.headerConfig.push(config);
            }
        }
        this.setDataGridOption('headerConfig', this.headerConfig);
    }
    enablePageNavigation() {
        if (this.dataset && this.binddataset && this.dataNavigator) {
            /*Check for sanity*/
            this.dataNavigatorWatched = true;
            if (this.navigatorResultWatch) {
                this.navigatorResultWatch.unsubscribe();
            }
            /*Register a watch on the "result" property of the "dataNavigator" so that the paginated data is displayed in the live-list.*/
            this.navigatorResultWatch = this.dataNavigator.resultEmitter.subscribe((newVal) => {
                /* Check for sanity. */
                if (isDefined(newVal)) {
                    // Watch will not be triggered if dataset and new value are equal. So trigger the property change handler manually
                    // This happens in case, if dataset is directly updated.
                    if (_.isEqual(this.dataset, newVal)) {
                        this.watchVariableDataSet(newVal);
                    }
                    else {
                        if (_.isArray(newVal)) {
                            this.widget.dataset = [].concat(newVal);
                        }
                        else if (_.isObject(newVal)) {
                            this.widget.dataset = _.extend({}, newVal);
                        }
                        else {
                            this.widget.dataset = newVal;
                        }
                    }
                }
                else {
                    this.widget.dataset = undefined;
                }
            }, true);
            /*De-register the watch if it is exists */
            if (this.navigatorMaxResultWatch) {
                this.navigatorMaxResultWatch.unsubscribe();
            }
            /*Register a watch on the "maxResults" property of the "dataNavigator" so that the "pageSize" is displayed in the live-list.*/
            this.navigatorMaxResultWatch = this.dataNavigator.maxResultsEmitter.subscribe((newVal) => {
                this.pagesize = newVal;
            });
            // If dataset is a pageable object, data is present inside the content property
            this.__fullData = this.dataset;
            this.dataNavigator.widget.maxResults = this.pagesize || 5;
            this.dataNavigator.options = {
                maxResults: this.pagesize || 5
            };
            this.removePropertyBinding('dataset');
            this.dataNavigator.setBindDataSet(this.binddataset, this.viewParent, this.datasource, this.dataset, this.binddatasource);
        }
    }
    resetPageNavigation() {
        /*Check for sanity*/
        if (this.dataNavigator) {
            this.dataNavigator.resetPageNavigation();
        }
    }
    isDataValid() {
        let error;
        const dataset = this.dataset || {};
        /*In case "data" contains "error" & "errorMessage", then display the error message in the grid.*/
        if (dataset.error) {
            error = dataset.error;
        }
        if (dataset.data && dataset.data.error) {
            if (dataset.data.errorMessage) {
                error = dataset.data.errorMessage;
            }
        }
        if (error) {
            this.setGridData([]);
            this.callDataGridMethod('setStatus', 'error', error);
            return false;
        }
        return true;
    }
    // Function to populate the grid with data.
    populateGridData(serviceData) {
        let data;
        serviceData = transformData(serviceData, this.name);
        // Apply filter and sort, if data is refreshed through Refresh data method
        if (!this.isNavigationEnabled() && this._isClientSearch) {
            data = getClonedObject(serviceData);
            data = this.getSearchResult(data, this.filterInfo);
            data = this.getSortResult(data, this.sortInfo);
            this.serverData = data;
        }
        else {
            this.serverData = serviceData;
        }
        // If fielddefs are not present, generate fielddefs from data
        // Removing fielddefs check because When loadondemand property is enabled(deferload="true"), the dataset propertychangehanlder is triggered first before the dom is getting rendered.
        // So at that time fielddefs length is zero, due to this the columns are created dynamically.
        if (this.isdynamictable) {
            this.createGridColumns(this.serverData);
        }
        else {
            this.setGridData(this.serverData);
        }
    }
    // Function to generate and compile the form fields from the metadata
    generateDynamicColumns(columns) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            this.fieldDefs = []; // empty the form fields
            // empty the filter field template refs.
            this.filterTmpl._results = [];
            if (_.isEmpty(columns)) {
                return;
            }
            let tmpl = '';
            columns.forEach(col => {
                let attrsTmpl = '';
                let customTmpl = '';
                _.forEach(col, (val, key) => {
                    if (val) {
                        // If custom expression is present, keep it inside table column. Else, keep as attribute
                        if (key === 'customExpression') {
                            customTmpl = val;
                        }
                        else {
                            attrsTmpl += ` ${key}="${val}"`;
                        }
                    }
                });
                tmpl += `<wm-table-column ${attrsTmpl} tableName="${this.name}">${customTmpl}</wm-table-column>`;
            });
            this.dynamicTableRef.clear();
            if (!this._dynamicContext) {
                this._dynamicContext = Object.create(this.viewParent);
                this._dynamicContext[this.getAttr('wmTable')] = this;
            }
            this.noOfColumns = columns.length;
            const componentFactoryRef = yield this.dynamicComponentProvider.getComponentFactoryRef('app-table-dynamic-' + this.widgetId, tmpl, {
                noCache: true,
                transpile: true
            });
            const component = this.dynamicTableRef.createComponent(componentFactoryRef, 0, this.inj);
            extendProto(component.instance, this._dynamicContext);
            this.$element.find('.dynamic-table-container')[0].appendChild(component.location.nativeElement);
        });
    }
    prepareColDefs(data) {
        let defaultFieldDefs;
        let properties;
        this.fieldDefs = [];
        this.headerConfig = [];
        this.columns = {};
        /* if properties map is existed then fetch the column configuration for all nested levels using util function */
        properties = data;
        /*call utility function to prepare fieldDefs for grid against given data (A MAX OF 10 COLUMNS ONLY)*/
        defaultFieldDefs = prepareFieldDefs(properties);
        /*append additional properties*/
        _.forEach(defaultFieldDefs, columnDef => {
            columnDef.binding = columnDef.field;
            columnDef.caption = columnDef.displayName;
            columnDef.pcDisplay = true;
            columnDef.mobileDisplay = true;
            columnDef.searchable = true;
            columnDef.type = 'string';
        });
        defaultFieldDefs.forEach(col => {
            this.columns[col.field] = col;
        });
        this.invokeEventCallback('beforedatarender', { $data: data, $columns: this.columns, data: data, columns: this.columns });
        defaultFieldDefs = [];
        // Apply the changes made by the user
        _.forEach(this.columns, val => {
            defaultFieldDefs.push(val);
        });
        this.generateDynamicColumns(defaultFieldDefs);
    }
    createGridColumns(data) {
        /* this call back function receives the data from the variable */
        /* check whether data is valid or not */
        const dataValid = data && !data.error;
        /*if the data is type json object, make it an array of the object*/
        if (dataValid && !_.isArray(data)) {
            data = [data];
        }
        /* if the data is empty, show nodatamessage */
        if (_.isEmpty(data)) {
            this.setGridData(data);
            return;
        }
        if (!dataValid) {
            return;
        }
        /* if new columns to be rendered, prepare default fieldDefs for the data provided*/
        this.prepareColDefs(data);
        this.serverData = data;
        this.setGridData(this.serverData);
    }
    getSortExpr() {
        let sortExp;
        let pagingOptions;
        if (this.datasource && this.datasource.execute(DataSource.Operation.IS_PAGEABLE)) {
            pagingOptions = this.datasource.execute(DataSource.Operation.GET_PAGING_OPTIONS);
            sortExp = _.isEmpty(pagingOptions) ? '' : getOrderByExpr(pagingOptions.sort);
        }
        return sortExp || '';
    }
    watchVariableDataSet(newVal) {
        let result;
        // After the setting the watch on navigator, dataset is triggered with undefined. In this case, return here.
        if (this.dataNavigatorWatched && _.isUndefined(newVal) && this.__fullData) {
            return;
        }
        // If variable is in loading state, show loading icon
        if (this.variableInflight) {
            this.callDataGridMethod('setStatus', 'loading', this.loadingdatamsg);
        }
        result = getValidJSON(newVal);
        // Converting newval to object if it is an Object that comes as a string "{"data" : 1}"
        if (result) {
            newVal = result;
        }
        /*Return if data is invalid.*/
        if (!this.isDataValid()) {
            return;
        }
        // If value is empty or in studio mode, dont enable the navigation
        if (newVal) {
            if (this.shownavigation && !this.dataNavigatorWatched) {
                this.enablePageNavigation();
                return;
            }
        }
        else {
            this.resetPageNavigation();
            /*for run mode, disabling the loader and showing no data found message if dataset is not valid*/
            if (!this.variableInflight) {
                this.callDataGridMethod('setStatus', 'nodata', this.nodatamessage);
            }
            this.setDataGridOption('selectFirstRow', this.gridfirstrowselect);
        }
        if (!this.isNavigationEnabled() && newVal) {
            this.checkFiltersApplied(this.getSortExpr());
        }
        if (!_.isObject(newVal) || newVal === '' || (newVal && newVal.dataValue === '')) {
            if (!this.variableInflight) {
                // If variable has finished loading and resultSet is empty, ender empty data
                this.setGridData([]);
            }
            return;
        }
        if (newVal) {
            this.populateGridData(newVal);
        }
    }
    onDataSourceChange() {
        this.fieldDefs.forEach(col => {
            triggerFn(col.onDataSourceChange && col.onDataSourceChange.bind(col));
        });
    }
    onPropertyChange(key, nv, ov) {
        let enableNewRow;
        switch (key) {
            case 'datasource':
                this.watchVariableDataSet(this.dataset);
                this.onDataSourceChange();
                break;
            case 'dataset':
                if (this.binddatasource && !this.datasource) {
                    return;
                }
                this.watchVariableDataSet(nv);
                break;
            case 'filtermode':
                this.setDataGridOption('filtermode', nv);
                break;
            case 'searchlabel':
                this.setDataGridOption('searchLabel', nv);
                break;
            case 'navigation':
                if (nv === 'Advanced') { // Support for older projects where navigation type was advanced instead of clasic
                    this.navigation = 'Classic';
                    return;
                }
                if (nv !== 'None') {
                    this.shownavigation = true;
                }
                this.navControls = nv;
                break;
            case 'gridfirstrowselect':
                this.setDataGridOption('selectFirstRow', nv);
                break;
            case 'gridclass':
                this.callDataGridMethod('option', 'cssClassNames.grid', nv);
                break;
            case 'nodatamessage':
                this.callDataGridMethod('option', 'dataStates.nodata', nv);
                break;
            case 'loadingdatamsg':
                this.callDataGridMethod('option', 'dataStates.loading', nv);
                break;
            case 'loadingicon':
                this.callDataGridMethod('option', 'loadingicon', nv);
                break;
            case 'spacing':
                this.callDataGridMethod('option', 'spacing', nv);
                if (nv === 'condensed') {
                    this.navigationSize = 'small';
                }
                else {
                    this.navigationSize = '';
                }
                break;
            case 'exportformat':
                this.exportOptions = [];
                if (nv) {
                    // Populate options for export drop down menu
                    _.forEach(_.split(nv, ','), type => {
                        this.exportOptions.push({
                            label: type,
                            icon: exportIconMapping[type]
                        });
                    });
                }
                break;
            case 'shownewrow':
                // Enable new row if shownew is true or addNewRow buton is present
                enableNewRow = nv || _.some(this.actions, act => _.includes(act.action, 'addNewRow()'));
                this.callDataGridMethod('option', 'actionsEnabled.new', enableNewRow);
                break;
            case 'show':
                if (nv) {
                    this.invokeEventCallback('show');
                }
                else {
                    this.invokeEventCallback('hide');
                }
            default:
                super.onPropertyChange(key, nv, ov);
        }
    }
    onStyleChange(key, nv, ov) {
        switch (key) {
            case 'width':
                this.callDataGridMethod('setGridDimensions', 'width', nv);
                break;
            case 'height':
                this.callDataGridMethod('setGridDimensions', 'height', nv);
                break;
        }
        super.onStyleChange(key, nv, ov);
    }
    populateActions() {
        this._actions.header = [];
        this._actions.footer = [];
        _.forEach(this.actions, (action) => {
            if (_.includes(action.position, 'header')) {
                this._actions.header.push(action);
            }
            if (_.includes(action.position, 'footer')) {
                this._actions.footer.push(action);
            }
        });
    }
    // this method will render the filter row.
    renderDynamicFilterColumn(filteTemRef) {
        // For dynamic table manually pushing the filtertemplateRef as templateRef will not be available prior.
        if (this.isdynamictable) {
            this.filterTmpl._results.push(filteTemRef);
        }
    }
    registerColumns(tableColumn) {
        if (isMobile()) {
            if (!tableColumn.mobileDisplay) {
                return;
            }
        }
        else {
            if (!tableColumn.pcDisplay) {
                return;
            }
        }
        const colCount = this.fieldDefs.push(tableColumn);
        this.fullFieldDefs.push(tableColumn);
        this.rowFilter[tableColumn.field] = {
            value: undefined
        };
        this.fieldDefs.forEach(col => {
            this.columns[col.field] = col;
        });
        // If dynamic datatable and last column, pass the columns to jquery datatable
        if (this.isdynamictable && colCount === this.noOfColumns) {
            this.renderOperationColumns();
            this.setDataGridOption('colDefs', this.fieldDefs);
        }
    }
    registerFormField(name, formField) {
        this.formfields[name] = formField;
    }
    registerActions(tableAction) {
        this.actions.push(tableAction);
        this.populateActions();
    }
    registerRow(tableRow, rowInstance) {
        this.rowDef = tableRow;
        this.rowInstance = rowInstance;
        this.callDataGridMethod('option', 'cssClassNames.rowExpandIcon', this.rowDef.expandicon);
        this.callDataGridMethod('option', 'cssClassNames.rowCollapseIcon', this.rowDef.collapseicon);
        this.gridOptions.rowExpansionEnabled = true;
        this.gridOptions.rowDef = this.rowDef;
    }
    registerRowActions(tableRowAction) {
        this.rowActions.push(tableRowAction);
    }
    selectItem(item, data) {
        /* server is not updating immediately, so set the server data to success callback data */
        if (data) {
            this.serverData = data;
        }
        if (_.isObject(item)) {
            item = _.omitBy(item, (value) => {
                return _.isArray(value) && _.isEmpty(value);
            });
        }
        this.callDataGridMethod('selectRow', item, true);
    }
    /* deselect the given item*/
    deselectItem(item) {
        this.callDataGridMethod('deselectRow', item);
    }
    onDataNavigatorDataSetChange(nv) {
        let data;
        this.__fullData = nv;
        this.checkFiltersApplied(this.getSortExpr());
        if (this._isClientSearch) {
            data = getClonedObject(this.__fullData);
            if (_.isObject(data) && !_.isArray(data)) {
                data = [data];
            }
            data = this.getSearchResult(data, this.filterInfo);
            data = this.getSortResult(data, this.sortInfo);
            return data;
        }
        return nv;
    }
    toggleMessage(show, type, msg, header) {
        if (show && msg) {
            this.app.notifyApp(msg, type, header);
        }
    }
    export($item) {
        let filterFields;
        const sortOptions = _.isEmpty(this.sortInfo) ? '' : this.sortInfo.field + ' ' + this.sortInfo.direction;
        const columns = {};
        let isValid;
        let requestData;
        this.fieldDefs.forEach(fieldDef => {
            // Do not add the row operation actions column to the exported file.
            if (fieldDef.field === ROW_OPS_FIELD || !fieldDef.show) {
                return;
            }
            const option = {
                'header': fieldDef.displayName
            };
            // If column has exportexpression, then send form the expression as required by backend.
            // otherwise send the field name.
            if (fieldDef.exportexpression) {
                option.expression = fieldDef.exportexpression;
            }
            else {
                option.field = fieldDef.field;
            }
            columns[fieldDef.field] = option;
        });
        filterFields = this.getFilterFields(this.filterInfo);
        requestData = {
            matchMode: 'anywhereignorecase',
            filterFields: filterFields,
            orderBy: sortOptions,
            exportType: $item.label,
            logicalOp: 'AND',
            exportSize: this.exportdatasize,
            columns: columns
        };
        isValid = this.invokeEventCallback('beforeexport', { $data: requestData });
        if (isValid === false) {
            return;
        }
        requestData.fields = _.values(requestData.columns);
        this.datasource.execute(DataSource.Operation.DOWNLOAD, { data: requestData });
    }
    expandRow(rowId) {
        this.callDataGridMethod('expandRow', rowId);
    }
    collapseRow(rowId) {
        this.callDataGridMethod('collapseRow', rowId);
    }
    _documentClickBind(event) {
        const $target = event.target;
        // If click triggered from same grid or a dialog, do not save the row
        if (this.$element[0].contains($target) || event.target.doctype || isInputBodyWrapper($($target))) {
            return;
        }
        this.callDataGridMethod('saveRow');
    }
    _redraw(forceRender) {
        if (forceRender) {
            this.datagridElement.datatable(this.gridOptions);
        }
        else {
            setTimeout(() => {
                this.callDataGridMethod('setColGroupWidths');
                this.callDataGridMethod('addOrRemoveScroll');
            });
        }
    }
    invokeActionEvent($event, expression) {
        const fn = $parseEvent(expression);
        fn(this.viewParent, Object.assign(this.context, { $event }));
    }
    // change and blur events are added from the template
    handleEvent(node, eventName, callback, locals) {
        if (eventName !== 'select') {
            super.handleEvent(this.nativeElement, eventName, callback, locals);
        }
    }
    triggerUploadEvent($event, eventName, fieldName, row) {
        const params = { $event, row };
        if (!this.columns[fieldName]) {
            return;
        }
        if (eventName === 'change') {
            params.newVal = $event.target.files;
            params.oldVal = this.columns[fieldName]._oldUploadVal;
            this.columns[fieldName]._oldUploadVal = params.newVal;
        }
        this.columns[fieldName].invokeEventCallback(eventName, params);
    }
    registerFormWidget() { }
    // Form control accessor methods. This will be used for table inside form
    writeValue() { }
    registerOnChange(fn) {
        this._onChange = fn;
    }
    registerOnTouched(fn) {
        this._onTouched = fn;
    }
}
TableComponent.initializeProps = registerProps();
TableComponent.decorators = [
    { type: Component, args: [{
                selector: '[wmTable]',
                template: "<div class=\"panel-heading\" *ngIf=\"title || subheading || iconclass || exportOptions.length || _actions.header.length\">\n    <h3 class=\"panel-title\">\n        <div class=\"pull-left\">\n            <i class=\"app-icon panel-icon {{iconclass}}\" *ngIf=\"iconclass\"></i>\n        </div>\n        <div class=\"pull-left\">\n            <div class=\"heading\" [innerHTML]=\"title | trustAs: 'html'\"></div>\n            <div class=\"description\" [innerHTML]=\"subheading | trustAs: 'html'\"></div>\n        </div>\n        <div class=\"panel-actions app-datagrid-actions\" *ngIf=\"exportOptions.length || _actions.header.length\">\n            <ng-container *ngFor=\"let btn of _actions.header\"\n                          [ngTemplateOutlet]=\"btn.widgetType === 'button' ? buttonRef : anchorRef\" [ngTemplateOutletContext]=\"{btn:btn}\">\n            </ng-container>\n            <div wmMenu dropdown caption.bind=\"appLocale.LABEL_EXPORT\" *ngIf=\"exportOptions.length\"  autoclose=\"always\" attr.name=\"{{name}}-export\"\n                dataset.bind=\"exportOptions\" select.event=\"export($item)\" menuposition=\"down,left\"></div>\n        </div>\n    </h3>\n</div>\n<div class=\"app-datagrid\" #datagridElement></div>\n<div class=\"panel-footer clearfix\" [hidden]=\"!_actions.footer.length && (!shownavigation || dataNavigator?.dataSize <= pagesize)\">\n    <div class=\"app-datagrid-paginator\" [hidden]=\"!dataNavigator?.dataSize || !shownavigation || dataNavigator?.dataSize <= pagesize\">\n        <nav wmPagination show.bind=\"shownavigation\" navigationalign.bind=\"navigationalign\"\n             navigationsize.bind=\"navigationSize\"\n             navigation.bind=\"navControls\" showrecordcount.bind=\"showrecordcount\" maxsize.bind=\"maxsize\"\n             boundarylinks.bind=\"boundarylinks\"\n             forceellipses.bind=\"forceellipses\" directionlinks.bind=\"directionlinks\"></nav>\n    </div>\n    <div class=\"app-datagrid-actions\" *ngIf=\"_actions.footer.length\">\n        <ng-container *ngFor=\"let btn of _actions.footer\"\n                      [ngTemplateOutlet]=\"btn.widgetType === 'button' ? buttonRef : anchorRef\" [ngTemplateOutletContext]=\"{btn:btn}\">\n        </ng-container>\n    </div>\n</div>\n\n<ng-template #buttonRef let-btn=\"btn\">\n    <button wmButton caption.bind=\"btn.displayName\" show.bind=\"btn.show\" class.bind=\"btn.class\"  iconclass.bind=\"btn.iconclass\" (click)=\"invokeActionEvent($event, btn.action)\"\n            [ngClass]=\"{'btn-sm': spacing === 'condensed', 'disabled-new': btn.key === 'addNewRow' && (isGridEditMode || isLoading)}\"\n            type=\"button\" shortcutkey.bind=\"btn.shortcutkey\" tabindex.bind=\"btn.tabindex\" hint.bind=\"btn.title\" disabled.bind=\"btn.disabled\" conditionalclass.bind=\"btn.conditionalclass\" conditionalstyle.bind=\"btn.conditionalstyle\"></button>\n</ng-template>\n\n<ng-template #anchorRef let-btn=\"btn\">\n    <a wmAnchor caption.bind=\"btn.displayName\" show.bind=\"btn.show\" class.bind=\"btn.class\"  iconclass.bind=\"btn.iconclass\" (click)=\"invokeActionEvent($event, btn.action)\"\n            [ngClass]=\"{'btn-sm': spacing === 'condensed', 'disabled-new': btn.key === 'addNewRow' && (isGridEditMode || isLoading)}\"\n            shortcutkey.bind=\"btn.shortcutkey\" tabindex.bind=\"btn.tabindex\" hint.bind=\"btn.title\"\n            hyperlink.bind=\"btn.hyperlink\" target.bind=\"btn.target\" conditionalclass.bind=\"btn.conditionalclass\" conditionalstyle.bind=\"btn.conditionalstyle\"></a>\n</ng-template>\n\n<div hidden>\n    <ng-container #multiColumnFilterView></ng-container>\n\n    <ng-container #inlineEditView></ng-container>\n\n    <ng-container #inlineEditNewView></ng-container>\n\n    <ng-container #rowActionsView></ng-container>\n\n    <ng-container #rowExpansionActionView></ng-container>\n\n    <ng-container #customExprView></ng-container>\n\n    <ng-container #dynamicTable></ng-container>\n\n    <ng-container #rowDetailView></ng-container>\n\n    <div class=\"dynamic-table-container\"></div>\n</div>\n",
                providers: [
                    provideAsNgValueAccessor(TableComponent),
                    provideAsWidgetRef(TableComponent)
                ]
            }] }
];
/** @nocollapse */
TableComponent.ctorParameters = () => [
    { type: Injector },
    { type: FormBuilder },
    { type: App },
    { type: DynamicComponentRefProvider },
    { type: undefined, decorators: [{ type: Attribute, args: ['dataset.bind',] }] },
    { type: undefined, decorators: [{ type: Attribute, args: ['datasource.bind',] }] },
    { type: undefined, decorators: [{ type: Attribute, args: ['readonlygrid',] }] },
    { type: NgZone }
];
TableComponent.propDecorators = {
    dataNavigator: [{ type: ViewChild, args: [PaginationComponent,] }],
    _tableElement: [{ type: ViewChild, args: ['datagridElement',] }],
    rowActionTmpl: [{ type: ContentChildren, args: ['rowActionTmpl',] }],
    rowActionsViewRef: [{ type: ViewChild, args: ['rowActionsView', { read: ViewContainerRef },] }],
    filterTmpl: [{ type: ContentChildren, args: ['filterTmpl', { descendants: true },] }],
    filterViewRef: [{ type: ViewChild, args: ['multiColumnFilterView', { read: ViewContainerRef },] }],
    inlineWidgetTmpl: [{ type: ContentChildren, args: ['inlineWidgetTmpl', { descendants: true },] }],
    inlineEditViewRef: [{ type: ViewChild, args: ['inlineEditView', { read: ViewContainerRef },] }],
    inlineWidgetNewTmpl: [{ type: ContentChildren, args: ['inlineWidgetTmplNew', { descendants: true },] }],
    inlineEditNewViewRef: [{ type: ViewChild, args: ['inlineEditNewView', { read: ViewContainerRef },] }],
    customExprTmpl: [{ type: ContentChildren, args: ['customExprTmpl', { descendants: true },] }],
    customExprViewRef: [{ type: ViewChild, args: ['customExprView', { read: ViewContainerRef },] }],
    rowExpansionActionTmpl: [{ type: ContentChildren, args: ['rowExpansionActionTmpl',] }],
    rowExpansionTmpl: [{ type: ContentChild, args: ['rowExpansionTmpl',] }],
    rowDetailViewRef: [{ type: ViewChild, args: ['rowDetailView', { read: ViewContainerRef },] }],
    rowExpansionActionViewRef: [{ type: ViewChild, args: ['rowExpansionActionView', { read: ViewContainerRef },] }],
    dynamicTableRef: [{ type: ViewChild, args: ['dynamicTable', { read: ViewContainerRef },] }],
    onKeyPress: [{ type: HostListener, args: ['keypress', ['$event'],] }]
};
export { ɵ0, ɵ1 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibGUuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2NvbW1vbi90YWJsZS90YWJsZS5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBb0IsU0FBUyxFQUFFLFNBQVMsRUFBRSxlQUFlLEVBQUUsWUFBWSxFQUFFLFVBQVUsRUFBRSxZQUFZLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBYSxTQUFTLEVBQUUsU0FBUyxFQUFFLGdCQUFnQixFQUFFLFdBQVcsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUNsTixPQUFPLEVBQXdCLFdBQVcsRUFBYSxNQUFNLGdCQUFnQixDQUFDO0FBRTlFLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFFL0IsT0FBTyxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsWUFBWSxFQUFFLFVBQVUsRUFBRSxlQUFlLEVBQUUsWUFBWSxFQUFlLGlCQUFpQixFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLDJCQUEyQixFQUFFLFdBQVcsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUU3TyxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDaEQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDL0QsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sb0NBQW9DLENBQUM7QUFDekUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUM5QyxPQUFPLEVBQUUsU0FBUyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDOUUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQzFELE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxjQUFjLEVBQUUsZ0JBQWdCLEVBQUUs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SUFBSSxFQUFFLGdCQUFnQixFQUFDO3dDQUNuRCxTQUFTLFNBQUMsd0JBQXdCLEVBQUUsRUFBQyxJQUFJLEVBQUUsZ0JBQWdCLEVBQUM7OEJBRTVELFNBQVMsU0FBQyxjQUFjLEVBQUUsRUFBQyxJQUFJLEVBQUUsZ0JBQWdCLEVBQUM7eUJBMGtCbEQsWUFBWSxTQUFDLFVBQVUsRUFBRSxDQUFDLFFBQVEsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFmdGVyQ29udGVudEluaXQsIEF0dHJpYnV0ZSwgQ29tcG9uZW50LCBDb250ZW50Q2hpbGRyZW4sIENvbnRlbnRDaGlsZCwgRWxlbWVudFJlZiwgSG9zdExpc3RlbmVyLCBJbmplY3RvciwgTmdab25lLCBPbkRlc3Ryb3ksIFF1ZXJ5TGlzdCwgVmlld0NoaWxkLCBWaWV3Q29udGFpbmVyUmVmLCBUZW1wbGF0ZVJlZiB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgQ29udHJvbFZhbHVlQWNjZXNzb3IsIEZvcm1CdWlsZGVyLCBGb3JtR3JvdXAgfSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XG5cbmltcG9ydCB7IFN1YmplY3QgfSBmcm9tICdyeGpzJztcblxuaW1wb3J0IHsgJGFwcERpZ2VzdCwgJHBhcnNlRXZlbnQsICR1bndhdGNoLCAkd2F0Y2gsIEFwcCwgY2xvc2VQb3BvdmVyLCBEYXRhU291cmNlLCBnZXRDbG9uZWRPYmplY3QsIGdldFZhbGlkSlNPTiwgSURHZW5lcmF0b3IsIGlzRGF0YVNvdXJjZUVxdWFsLCBpc0RlZmluZWQsIGlzTW9iaWxlLCB0cmlnZ2VyRm4sIER5bmFtaWNDb21wb25lbnRSZWZQcm92aWRlciwgZXh0ZW5kUHJvdG8gfSBmcm9tICdAd20vY29yZSc7XG5cbmltcG9ydCB7IHN0eWxlciB9IGZyb20gJy4uLy4uL2ZyYW1ld29yay9zdHlsZXInO1xuaW1wb3J0IHsgU3R5bGFibGVDb21wb25lbnQgfSBmcm9tICcuLi9iYXNlL3N0eWxhYmxlLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBQYWdpbmF0aW9uQ29tcG9uZW50IH0gZnJvbSAnLi4vcGFnaW5hdGlvbi9wYWdpbmF0aW9uLmNvbXBvbmVudCc7XG5pbXBvcnQgeyByZWdpc3RlclByb3BzIH0gZnJvbSAnLi90YWJsZS5wcm9wcyc7XG5pbXBvcnQgeyBFRElUX01PREUsIGdldFJvd09wZXJhdGlvbnNDb2x1bW4gfSBmcm9tICcuLi8uLi8uLi91dGlscy9saXZlLXV0aWxzJztcbmltcG9ydCB7IHRyYW5zZm9ybURhdGEgfSBmcm9tICcuLi8uLi8uLi91dGlscy9kYXRhLXV0aWxzJztcbmltcG9ydCB7IGdldENvbmRpdGlvbmFsQ2xhc3NlcywgZ2V0T3JkZXJCeUV4cHIsIHByZXBhcmVGaWVsZERlZnMsIHByb3ZpZGVBc05nVmFsdWVBY2Nlc3NvciwgcHJvdmlkZUFzV2lkZ2V0UmVmIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvd2lkZ2V0LXV0aWxzJztcblxuZGVjbGFyZSBjb25zdCBfLCAkO1xuXG5jb25zdCBERUZBVUxUX0NMUyA9ICdhcHAtZ3JpZCBhcHAtcGFuZWwgcGFuZWwnO1xuY29uc3QgV0lER0VUX0NPTkZJRyA9IHt3aWRnZXRUeXBlOiAnd20tdGFibGUnLCBob3N0Q2xhc3M6IERFRkFVTFRfQ0xTfTtcblxuY29uc3QgZXhwb3J0SWNvbk1hcHBpbmcgPSB7XG4gICAgRVhDRUw6ICdmYSBmYS1maWxlLWV4Y2VsLW8nLFxuICAgIENTVjogJ2ZhIGZhLWZpbGUtdGV4dC1vJ1xufTtcblxuY29uc3QgUk9XX09QU19GSUVMRCA9ICdyb3dPcGVyYXRpb25zJztcblxuY29uc3Qgbm9vcCA9ICgpID0+IHt9O1xuXG5jb25zdCBpc0lucHV0Qm9keVdyYXBwZXIgPSB0YXJnZXQgPT4ge1xuICAgIGNvbnN0IGNsYXNzZXMgPSBbJy5kcm9wZG93bi1tZW51JywgJy51aWItdHlwZWFoZWFkLW1hdGNoJywgJy5tb2RhbC1kaWFsb2cnLCAnLnRvYXN0J107XG4gICAgbGV0IGlzSW5wdXQgPSBmYWxzZTtcbiAgICBjbGFzc2VzLmZvckVhY2goY2xzID0+IHtcbiAgICAgICAgaWYgKHRhcmdldC5jbG9zZXN0KGNscykubGVuZ3RoKSB7XG4gICAgICAgICAgICBpc0lucHV0ID0gdHJ1ZTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIGNvbnN0IGF0dHJzID0gWydic2RhdGVwaWNrZXJkYXlkZWNvcmF0b3InXTtcbiAgICBpZiAoIWlzSW5wdXQpIHtcbiAgICAgICAgYXR0cnMuZm9yRWFjaChhdHRyID0+IHtcbiAgICAgICAgICAgIGlmICh0YXJnZXRbMF0uaGFzQXR0cmlidXRlKGF0dHIpKSB7XG4gICAgICAgICAgICAgICAgaXNJbnB1dCA9IHRydWU7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIGlzSW5wdXQ7XG59O1xuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ1t3bVRhYmxlXScsXG4gICAgdGVtcGxhdGVVcmw6ICcuL3RhYmxlLmNvbXBvbmVudC5odG1sJyxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgcHJvdmlkZUFzTmdWYWx1ZUFjY2Vzc29yKFRhYmxlQ29tcG9uZW50KSxcbiAgICAgICAgcHJvdmlkZUFzV2lkZ2V0UmVmKFRhYmxlQ29tcG9uZW50KVxuICAgIF1cbn0pXG5leHBvcnQgY2xhc3MgVGFibGVDb21wb25lbnQgZXh0ZW5kcyBTdHlsYWJsZUNvbXBvbmVudCBpbXBsZW1lbnRzIEFmdGVyQ29udGVudEluaXQsIE9uRGVzdHJveSwgQ29udHJvbFZhbHVlQWNjZXNzb3Ige1xuICAgIHN0YXRpYyBpbml0aWFsaXplUHJvcHMgPSByZWdpc3RlclByb3BzKCk7XG4gICAgQFZpZXdDaGlsZChQYWdpbmF0aW9uQ29tcG9uZW50KSBkYXRhTmF2aWdhdG9yO1xuXG4gICAgQFZpZXdDaGlsZCgnZGF0YWdyaWRFbGVtZW50JykgcHJpdmF0ZSBfdGFibGVFbGVtZW50OiBFbGVtZW50UmVmO1xuXG4gICAgQENvbnRlbnRDaGlsZHJlbigncm93QWN0aW9uVG1wbCcpIHJvd0FjdGlvblRtcGw6IFF1ZXJ5TGlzdDxhbnk+O1xuICAgIEBWaWV3Q2hpbGQoJ3Jvd0FjdGlvbnNWaWV3Jywge3JlYWQ6IFZpZXdDb250YWluZXJSZWZ9KSByb3dBY3Rpb25zVmlld1JlZjogVmlld0NvbnRhaW5lclJlZjtcblxuICAgIEBDb250ZW50Q2hpbGRyZW4oJ2ZpbHRlclRtcGwnLCB7ZGVzY2VuZGFudHM6IHRydWV9KSBmaWx0ZXJUbXBsOiBRdWVyeUxpc3Q8YW55PjtcbiAgICBAVmlld0NoaWxkKCdtdWx0aUNvbHVtbkZpbHRlclZpZXcnLCB7cmVhZDogVmlld0NvbnRhaW5lclJlZn0pIGZpbHRlclZpZXdSZWY6IFZpZXdDb250YWluZXJSZWY7XG5cbiAgICBAQ29udGVudENoaWxkcmVuKCdpbmxpbmVXaWRnZXRUbXBsJywge2Rlc2NlbmRhbnRzOiB0cnVlfSkgaW5saW5lV2lkZ2V0VG1wbDogUXVlcnlMaXN0PGFueT47XG4gICAgQFZpZXdDaGlsZCgnaW5saW5lRWRpdFZpZXcnLCB7cmVhZDogVmlld0NvbnRhaW5lclJlZn0pIGlubGluZUVkaXRWaWV3UmVmOiBWaWV3Q29udGFpbmVyUmVmO1xuXG4gICAgQENvbnRlbnRDaGlsZHJlbignaW5saW5lV2lkZ2V0VG1wbE5ldycsIHtkZXNjZW5kYW50czogdHJ1ZX0pIGlubGluZVdpZGdldE5ld1RtcGw6IFF1ZXJ5TGlzdDxhbnk+O1xuICAgIEBWaWV3Q2hpbGQoJ2lubGluZUVkaXROZXdWaWV3Jywge3JlYWQ6IFZpZXdDb250YWluZXJSZWZ9KSBpbmxpbmVFZGl0TmV3Vmlld1JlZjogVmlld0NvbnRhaW5lclJlZjtcblxuICAgIEBDb250ZW50Q2hpbGRyZW4oJ2N1c3RvbUV4cHJUbXBsJywge2Rlc2NlbmRhbnRzOiB0cnVlfSkgY3VzdG9tRXhwclRtcGw6IFF1ZXJ5TGlzdDxhbnk+O1xuICAgIEBWaWV3Q2hpbGQoJ2N1c3RvbUV4cHJWaWV3Jywge3JlYWQ6IFZpZXdDb250YWluZXJSZWZ9KSBjdXN0b21FeHByVmlld1JlZjogVmlld0NvbnRhaW5lclJlZjtcblxuICAgIEBDb250ZW50Q2hpbGRyZW4oJ3Jvd0V4cGFuc2lvbkFjdGlvblRtcGwnKSByb3dFeHBhbnNpb25BY3Rpb25UbXBsOiBRdWVyeUxpc3Q8YW55PjtcbiAgICBAQ29udGVudENoaWxkKCdyb3dFeHBhbnNpb25UbXBsJykgcm93RXhwYW5zaW9uVG1wbDogVGVtcGxhdGVSZWY8YW55PjtcbiAgICBAVmlld0NoaWxkKCdyb3dEZXRhaWxWaWV3Jywge3JlYWQ6IFZpZXdDb250YWluZXJSZWZ9KSByb3dEZXRhaWxWaWV3UmVmOiBWaWV3Q29udGFpbmVyUmVmO1xuICAgIEBWaWV3Q2hpbGQoJ3Jvd0V4cGFuc2lvbkFjdGlvblZpZXcnLCB7cmVhZDogVmlld0NvbnRhaW5lclJlZn0pIHJvd0V4cGFuc2lvbkFjdGlvblZpZXdSZWY6IFZpZXdDb250YWluZXJSZWY7XG5cbiAgICBAVmlld0NoaWxkKCdkeW5hbWljVGFibGUnLCB7cmVhZDogVmlld0NvbnRhaW5lclJlZn0pIGR5bmFtaWNUYWJsZVJlZjogVmlld0NvbnRhaW5lclJlZjtcblxuICAgIHByaXZhdGUgcm93QWN0aW9uc0NvbXBpbGVkVGw6IGFueSAgPSB7fTtcbiAgICBwcml2YXRlIHJvd0ZpbHRlckNvbXBsaWVkVGw6IGFueSA9IHt9O1xuICAgIHByaXZhdGUgaW5saW5lQ29tcGxpZWRUbDogYW55ID0ge307XG4gICAgcHJpdmF0ZSBpbmxpbmVOZXdDb21wbGllZFRsOiBhbnkgPSB7fTtcbiAgICBwcml2YXRlIGN1c3RvbUV4cHJDb21waWxlZFRsOiBhbnkgPSB7fTtcbiAgICBwcml2YXRlIHJvd0RlZkluc3RhbmNlcyA9IHt9O1xuICAgIHByaXZhdGUgcm93RGVmTWFwID0ge307XG4gICAgcHJpdmF0ZSByb3dFeHBhbnNpb25BY3Rpb25UbDogYW55ID0ge307XG5cbiAgICBjb2x1bW5zID0ge307XG4gICAgZm9ybWZpZWxkcyA9IHt9O1xuICAgIGRhdGFncmlkRWxlbWVudDtcbiAgICBkYXRhc291cmNlO1xuICAgIGVkaXRtb2RlO1xuICAgIGVuYWJsZWNvbHVtbnNlbGVjdGlvbjtcbiAgICBlbmFibGVzb3J0ID0gdHJ1ZTtcbiAgICBmaWx0ZXJtb2RlO1xuICAgIHNlYXJjaGxhYmVsO1xuICAgIGZvcm1wb3NpdGlvbjtcbiAgICBncmlkY2xhc3M7XG4gICAgZ3JpZGZpcnN0cm93c2VsZWN0O1xuICAgIGljb25jbGFzcztcbiAgICBpc0dyaWRFZGl0TW9kZTtcbiAgICBsb2FkaW5nZGF0YW1zZztcbiAgICBtdWx0aXNlbGVjdDtcbiAgICBuYW1lO1xuICAgIG5hdmlnYXRpb247XG4gICAgbmF2aWdhdGlvblNpemU7XG4gICAgbmF2aWdhdGlvbmFsaWduO1xuICAgIG5vZGF0YW1lc3NhZ2U7XG4gICAgcGFnZXNpemU7XG4gICAgcHJldkRhdGE7XG4gICAgcHJpbWFyeUtleTtcbiAgICByYWRpb3NlbGVjdDtcbiAgICByb3djbGFzcztcbiAgICByb3duZ2NsYXNzO1xuICAgIHNlbGVjdGVkSXRlbXMgPSBbXTtcbiAgICBzaG93aGVhZGVyO1xuICAgIHNob3dyZWNvcmRjb3VudDtcbiAgICBzaG93cm93aW5kZXg7XG4gICAgc3ViaGVhZGluZztcbiAgICB0aXRsZTtcbiAgICBzaG93bmV3cm93O1xuICAgIGRlbGV0ZW9rdGV4dDtcbiAgICBkZWxldGVjYW5jZWx0ZXh0O1xuXG4gICAgc2VsZWN0ZWRJdGVtQ2hhbmdlID0gbmV3IFN1YmplY3QoKTtcbiAgICBzZWxlY3RlZEl0ZW1DaGFuZ2UkID0gdGhpcy5zZWxlY3RlZEl0ZW1DaGFuZ2UuYXNPYnNlcnZhYmxlKCk7XG5cbiAgICBhY3Rpb25zID0gW107XG4gICAgX2FjdGlvbnMgPSB7XG4gICAgICAgICdoZWFkZXInOiBbXSxcbiAgICAgICAgJ2Zvb3Rlcic6IFtdXG4gICAgfTtcbiAgICBleHBvcnRPcHRpb25zID0gW107XG4gICAgZXhwb3J0ZGF0YXNpemU7XG4gICAgZm9ybVdpZGdldHM7XG4gICAgaGVhZGVyQ29uZmlnID0gW107XG4gICAgaXRlbXMgPSBbXTtcbiAgICBuYXZDb250cm9scztcbiAgICByb3dBY3Rpb25zID0gW107XG4gICAgc2VsZWN0ZWRDb2x1bW5zO1xuICAgIHNob3duYXZpZ2F0aW9uID0gZmFsc2U7XG4gICAgZGF0YXNldDtcbiAgICBfbGl2ZVRhYmxlUGFyZW50O1xuICAgIGlzUGFydE9mTGl2ZUdyaWQ7XG4gICAgZ3JpZEVsZW1lbnQ7XG4gICAgaXNNb2JpbGU7XG4gICAgaXNMb2FkaW5nO1xuICAgIGRvY3VtZW50Q2xpY2tCaW5kID0gbm9vcDtcblxuICAgIGZpZWxkRGVmcyA9IFtdO1xuICAgIHJvd0RlZjogYW55ID0ge307XG4gICAgcm93SW5zdGFuY2U6IGFueSA9IHt9O1xuXG4gICAgcHJpdmF0ZSBmdWxsRmllbGREZWZzID0gW107XG4gICAgcHJpdmF0ZSBfX2Z1bGxEYXRhO1xuICAgIHByaXZhdGUgZGF0YU5hdmlnYXRvcldhdGNoZWQ7XG4gICAgcHJpdmF0ZSBuYXZpZ2F0b3JSZXN1bHRXYXRjaDtcbiAgICBwcml2YXRlIG5hdmlnYXRvck1heFJlc3VsdFdhdGNoO1xuICAgIHByaXZhdGUgZmlsdGVySW5mbztcbiAgICBwcml2YXRlIHNvcnRJbmZvO1xuICAgIHByaXZhdGUgc2VydmVyRGF0YTtcbiAgICBwcml2YXRlIGZpbHRlcm51bGxyZWNvcmRzO1xuICAgIHByaXZhdGUgdmFyaWFibGVJbmZsaWdodDtcbiAgICBwcml2YXRlIGlzZHluYW1pY3RhYmxlO1xuICAgIHByaXZhdGUgX2R5bmFtaWNDb250ZXh0O1xuICAgIHByaXZhdGUgbm9PZkNvbHVtbnM7XG5cbiAgICBwcml2YXRlIGFwcGx5UHJvcHMgPSBuZXcgTWFwKCk7XG5cbiAgICByZWRyYXcgPSBfLmRlYm91bmNlKHRoaXMuX3JlZHJhdywgMTUwKTtcbiAgICBkZWJvdW5jZWRIYW5kbGVMb2FkaW5nID0gXy5kZWJvdW5jZSh0aGlzLmhhbmRsZUxvYWRpbmcsIDM1MCk7XG5cbiAgICAvLyBGaWx0ZXIgYW5kIFNvcnQgTWV0aG9kc1xuICAgIHJvd0ZpbHRlcjogYW55ID0ge307XG4gICAgbWF0Y2hNb2RlVHlwZXNNYXA7XG4gICAgbWF0Y2hNb2RlTXNncztcbiAgICBlbXB0eU1hdGNoTW9kZXM7XG4gICAgX3NlYXJjaFNvcnRIYW5kbGVyID0gbm9vcDtcbiAgICBzZWFyY2hTb3J0SGFuZGxlciA9ICguLi5hcmdzKSA9PiB7IHRoaXMuX3NlYXJjaFNvcnRIYW5kbGVyLmFwcGx5KHRoaXMsIGFyZ3MpOyB9O1xuICAgIF9pc1BhZ2VTZWFyY2g7XG4gICAgX2lzQ2xpZW50U2VhcmNoO1xuICAgIGNoZWNrRmlsdGVyc0FwcGxpZWQ6IEZ1bmN0aW9uO1xuICAgIGdldFNlYXJjaFJlc3VsdDogRnVuY3Rpb247XG4gICAgZ2V0U29ydFJlc3VsdDogRnVuY3Rpb247XG4gICAgZ2V0RmlsdGVyRmllbGRzOiBGdW5jdGlvbjtcbiAgICBvblJvd0ZpbHRlckNoYW5nZSA9IG5vb3A7XG4gICAgb25GaWx0ZXJDb25kaXRpb25TZWxlY3QgPSBub29wO1xuICAgIHNob3dDbGVhckljb24gPSBub29wO1xuICAgIGNsZWFyUm93RmlsdGVyID0gbm9vcDtcbiAgICBnZXROYXZpZ2F0aW9uVGFyZ2V0QnlTb3J0SW5mbzogRnVuY3Rpb247XG4gICAgcmVmcmVzaERhdGE6IEZ1bmN0aW9uO1xuICAgIGNsZWFyRmlsdGVyOiBGdW5jdGlvbjtcblxuICAgIC8vIElubGluZSBFZGl0XG4gICAgbmdmb3JtOiBGb3JtR3JvdXA7XG4gICAgdXBkYXRlVmFyaWFibGU6IEZ1bmN0aW9uO1xuICAgIHVwZGF0ZVJlY29yZDogRnVuY3Rpb247XG4gICAgZGVsZXRlUmVjb3JkOiBGdW5jdGlvbjtcbiAgICBpbnNlcnRSZWNvcmQ6IEZ1bmN0aW9uO1xuICAgIGVkaXRSb3c6IEZ1bmN0aW9uO1xuICAgIGFkZE5ld1JvdzogRnVuY3Rpb247XG4gICAgYWRkUm93OiBGdW5jdGlvbjtcbiAgICBkZWxldGVSb3c6IEZ1bmN0aW9uO1xuICAgIG9uUmVjb3JkRGVsZXRlOiBGdW5jdGlvbjtcbiAgICBpbml0aWF0ZVNlbGVjdEl0ZW06IEZ1bmN0aW9uO1xuICAgIGhpZGVFZGl0Um93OiBGdW5jdGlvbjtcbiAgICBzYXZlUm93OiBGdW5jdGlvbjtcbiAgICBjYW5jZWxSb3c6IEZ1bmN0aW9uO1xuXG4gICAgcHJpdmF0ZSBncmlkT3B0aW9ucyA9IHtcbiAgICAgICAgZGF0YTogW10sXG4gICAgICAgIGNvbERlZnM6IFtdLFxuICAgICAgICBzdGFydFJvd0luZGV4OiAxLFxuICAgICAgICBzb3J0SW5mbzoge1xuICAgICAgICAgICAgZmllbGQ6ICcnLFxuICAgICAgICAgICAgZGlyZWN0aW9uOiAnJ1xuICAgICAgICB9LFxuICAgICAgICBmaWx0ZXJtb2RlOiAnJyxcbiAgICAgICAgc2VhcmNoTGFiZWw6ICcnLFxuICAgICAgICByb3dBY3Rpb25zOiBbXSxcbiAgICAgICAgaGVhZGVyQ29uZmlnOiBbXSxcbiAgICAgICAgcm93Q2xhc3M6ICcnLFxuICAgICAgICBlZGl0bW9kZTogJycsXG4gICAgICAgIGZvcm1Qb3NpdGlvbjogJycsXG4gICAgICAgIGlzTW9iaWxlOiBmYWxzZSxcbiAgICAgICAgcm93RXhwYW5zaW9uRW5hYmxlZDogZmFsc2UsXG4gICAgICAgIHJvd0RlZjoge1xuICAgICAgICAgICAgcG9zaXRpb246ICcwJ1xuICAgICAgICB9LFxuICAgICAgICBuYW1lOiAnJyxcbiAgICAgICAgbWVzc2FnZXM6IHtcbiAgICAgICAgICAgIHNlbGVjdEZpZWxkOiAnU2VsZWN0IEZpZWxkJ1xuICAgICAgICB9LFxuICAgICAgICBvbkRhdGFSZW5kZXI6ICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMubmdab25lLnJ1bigoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZ3JpZERhdGEubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW52b2tlRXZlbnRDYWxsYmFjaygnZGF0YXJlbmRlcicsIHskZGF0YTogdGhpcy5ncmlkRGF0YSwgZGF0YTogdGhpcy5ncmlkRGF0YX0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBzZWxlY3Qgcm93cyBzZWxlY3RlZCBpbiBwcmV2aW91cyBwYWdlcy4gKE5vdCBmaW5kaW5nIGludGVyc2VjdGlvbiBvZiBkYXRhIGFuZCBzZWxlY3RlZGl0ZW1zIGFzIGl0IHdpbGwgYmUgaGVhdnkpXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLm11bHRpc2VsZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXRlbXMubGVuZ3RoID0gMDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5jYWxsRGF0YUdyaWRNZXRob2QoJ3NlbGVjdFJvd3MnLCB0aGlzLml0ZW1zKTtcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkSXRlbXMgPSB0aGlzLmNhbGxEYXRhR3JpZE1ldGhvZCgnZ2V0U2VsZWN0ZWRSb3dzJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZEl0ZW1DaGFuZ2UubmV4dCh0aGlzLnNlbGVjdGVkSXRlbXMpO1xuICAgICAgICAgICAgICAgIC8vIE9uIHJlbmRlciwgYXBwbHkgdGhlIGZpbHRlcnMgc2V0IGZvciBxdWVyeSBzZXJ2aWNlIHZhcmlhYmxlXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuX2lzUGFnZVNlYXJjaCAmJiB0aGlzLmZpbHRlckluZm8pIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZWFyY2hTb3J0SGFuZGxlcih0aGlzLmZpbHRlckluZm8sIHVuZGVmaW5lZCwgJ3NlYXJjaCcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBvblJvd1NlbGVjdDogKHJvdywgZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5uZ1pvbmUucnVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkSXRlbXMgPSB0aGlzLmNhbGxEYXRhR3JpZE1ldGhvZCgnZ2V0U2VsZWN0ZWRSb3dzJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZEl0ZW1DaGFuZ2UubmV4dCh0aGlzLnNlbGVjdGVkSXRlbXMpO1xuICAgICAgICAgICAgICAgIGNvbnN0IHJvd0RhdGEgPSB0aGlzLmFkZFJvd0luZGV4KHJvdyk7XG4gICAgICAgICAgICAgICAgdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdyb3dzZWxlY3QnLCB7JGRhdGE6IHJvd0RhdGEsICRldmVudDogZSwgcm93OiByb3dEYXRhfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgLy8gYXNzaWducyB0aGUgaXRlbXMgb24gY2FwdHVyZSBwaGFzZSBvZiB0aGUgY2xpY2sgaGFuZGxlci5cbiAgICAgICAgYXNzaWduU2VsZWN0ZWRJdGVtczogKHJvdywgZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5uZ1pvbmUucnVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgICAqIGluIGNhc2Ugb2Ygc2luZ2xlIHNlbGVjdCwgdXBkYXRlIHRoZSBpdGVtcyB3aXRoIG91dCBjaGFuZ2luZyB0aGUgcmVmZXJlbmNlLlxuICAgICAgICAgICAgICAgICAqIGZvciBtdWx0aSBzZWxlY3QsIGtlZXAgb2xkIHNlbGVjdGVkIGl0ZW1zIGluIHRhY3RcbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5tdWx0aXNlbGVjdCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoXy5maW5kSW5kZXgodGhpcy5pdGVtcywgcm93KSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaXRlbXMucHVzaChyb3cpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pdGVtcy5sZW5ndGggPSAwO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLml0ZW1zLnB1c2gocm93KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgb25Sb3dEYmxDbGljazogKHJvdywgZSkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgcm93RGF0YSA9IHRoaXMuYWRkUm93SW5kZXgocm93KTtcbiAgICAgICAgICAgIHRoaXMuaW52b2tlRXZlbnRDYWxsYmFjaygncm93ZGJsY2xpY2snLCB7JGRhdGE6IHJvd0RhdGEsICRldmVudDogZSwgcm93OiByb3dEYXRhfSk7XG4gICAgICAgIH0sXG4gICAgICAgIG9uUm93RGVzZWxlY3Q6IChyb3csIGUpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLm11bHRpc2VsZWN0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5uZ1pvbmUucnVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pdGVtcyA9IF8ucHVsbEFsbFdpdGgodGhpcy5pdGVtcywgW3Jvd10sIF8uaXNFcXVhbCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRJdGVtcyA9IHRoaXMuY2FsbERhdGFHcmlkTWV0aG9kKCdnZXRTZWxlY3RlZFJvd3MnKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdyb3dkZXNlbGVjdCcsIHskZGF0YTogcm93LCAkZXZlbnQ6IGUsIHJvd30pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBjYWxsT25Sb3dEZXNlbGVjdEV2ZW50OiAocm93LCBlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmludm9rZUV2ZW50Q2FsbGJhY2soJ3Jvd2Rlc2VsZWN0JywgeyRkYXRhOiByb3csICRldmVudDogZSwgcm93fSk7XG4gICAgICAgIH0sXG4gICAgICAgIGNhbGxPblJvd0NsaWNrRXZlbnQ6IChyb3csIGUpID0+IHtcbiAgICAgICAgICAgIC8vIENhbGwgcm93IGNsaWNrIG9ubHkgaWYgY2xpY2sgaXMgdHJpZ2dlcmVkIGJ5IHVzZXJcbiAgICAgICAgICAgIGlmIChlICYmIGUuaGFzT3duUHJvcGVydHkoJ29yaWdpbmFsRXZlbnQnKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJvd0RhdGEgPSB0aGlzLmFkZFJvd0luZGV4KHJvdyk7XG4gICAgICAgICAgICAgICAgdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdyb3djbGljaycsIHskZGF0YTogcm93RGF0YSwgJGV2ZW50OiBlLCByb3c6IHJvd0RhdGF9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgY2xvc2VQb3BvdmVyOiBjbG9zZVBvcG92ZXIsXG4gICAgICAgIG9uQ29sdW1uU2VsZWN0OiAoY29sLCBlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkQ29sdW1ucyA9IHRoaXMuY2FsbERhdGFHcmlkTWV0aG9kKCdnZXRTZWxlY3RlZENvbHVtbnMnKTtcbiAgICAgICAgICAgIHRoaXMuaW52b2tlRXZlbnRDYWxsYmFjaygnY29sdW1uc2VsZWN0JywgeyRkYXRhOiBjb2wsICRldmVudDogZX0pO1xuICAgICAgICB9LFxuICAgICAgICBvbkNvbHVtbkRlc2VsZWN0OiAoY29sLCBlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnNlbGVjdGVkQ29sdW1ucyA9IHRoaXMuY2FsbERhdGFHcmlkTWV0aG9kKCdnZXRTZWxlY3RlZENvbHVtbnMnKTtcbiAgICAgICAgICAgIHRoaXMuaW52b2tlRXZlbnRDYWxsYmFjaygnY29sdW1uZGVzZWxlY3QnLCB7JGRhdGE6IGNvbCwgJGV2ZW50OiBlfSk7XG4gICAgICAgIH0sXG4gICAgICAgIG9uSGVhZGVyQ2xpY2s6IChjb2wsIGUpID0+IHtcbiAgICAgICAgICAgIC8vIGlmIG9uU29ydCBmdW5jdGlvbiBpcyByZWdpc3RlcmVkIGludm9rZSBpdCB3aGVuIHRoZSBjb2x1bW4gaGVhZGVyIGlzIGNsaWNrZWRcbiAgICAgICAgICAgIHRoaXMuaW52b2tlRXZlbnRDYWxsYmFjaygnaGVhZGVyY2xpY2snLCB7JGV2ZW50OiBlLCAkZGF0YTogY29sLCBjb2x1bW46IGNvbH0pO1xuICAgICAgICB9LFxuICAgICAgICBvblJvd0RlbGV0ZTogKHJvdywgY2FuY2VsUm93RGVsZXRlQ2FsbGJhY2ssIGUsIGNhbGxCYWNrLCBvcHRpb25zKSA9PiB7XG4gICAgICAgICAgICB0aGlzLm5nWm9uZS5ydW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuZGVsZXRlUmVjb3JkKF8uZXh0ZW5kKHt9LCBvcHRpb25zLCB7cm93LCAnY2FuY2VsUm93RGVsZXRlQ2FsbGJhY2snOiBjYW5jZWxSb3dEZWxldGVDYWxsYmFjaywgJ2V2dCc6IGUsICdjYWxsQmFjayc6IGNhbGxCYWNrfSkpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIG9uUm93SW5zZXJ0OiAocm93LCBlLCBjYWxsQmFjaywgb3B0aW9ucykgPT4ge1xuICAgICAgICAgICAgdGhpcy5pbnNlcnRSZWNvcmQoXy5leHRlbmQoe30sIG9wdGlvbnMsIHtyb3csIGV2ZW50OiBlLCAnY2FsbEJhY2snOiBjYWxsQmFja30pKTtcbiAgICAgICAgfSxcbiAgICAgICAgYmVmb3JlUm93VXBkYXRlOiAocm93LCBldmVudE5hbWU/KSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5fbGl2ZVRhYmxlUGFyZW50KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fbGl2ZVRhYmxlUGFyZW50LnVwZGF0ZVJvdyhyb3csIGV2ZW50TmFtZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnByZXZEYXRhID0gZ2V0Q2xvbmVkT2JqZWN0KHJvdyk7XG4gICAgICAgIH0sXG4gICAgICAgIGFmdGVyUm93VXBkYXRlOiAocm93LCBlLCBjYWxsQmFjaywgb3B0aW9ucykgPT4ge1xuICAgICAgICAgICAgdGhpcy51cGRhdGVSZWNvcmQoXy5leHRlbmQoe30sIG9wdGlvbnMsIHtyb3csICdwcmV2RGF0YSc6IHRoaXMucHJldkRhdGEsICdldmVudCc6IGUsICdjYWxsQmFjayc6IGNhbGxCYWNrfSkpO1xuICAgICAgICB9LFxuICAgICAgICBvbkJlZm9yZVJvd1VwZGF0ZTogKHJvdywgZSwgb3B0aW9ucykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaW52b2tlRXZlbnRDYWxsYmFjaygnYmVmb3Jlcm93dXBkYXRlJywgeyRldmVudDogZSwgJGRhdGE6IHJvdywgcm93LCBvcHRpb25zOiBvcHRpb25zfSk7XG4gICAgICAgIH0sXG4gICAgICAgIG9uQmVmb3JlUm93SW5zZXJ0OiAocm93LCBlLCBvcHRpb25zKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdiZWZvcmVyb3dpbnNlcnQnLCB7JGV2ZW50OiBlLCAkZGF0YTogcm93LCByb3csIG9wdGlvbnM6IG9wdGlvbnN9KTtcbiAgICAgICAgfSxcbiAgICAgICAgb25CZWZvcmVSb3dEZWxldGU6IChyb3csIGUsIG9wdGlvbnMpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHJvd0RhdGEgPSB0aGlzLmFkZFJvd0luZGV4KHJvdyk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdiZWZvcmVyb3dkZWxldGUnLCB7JGV2ZW50OiBlLCByb3c6IHJvd0RhdGEsIG9wdGlvbnM6IG9wdGlvbnN9KTtcbiAgICAgICAgfSxcbiAgICAgICAgb25Gb3JtUmVuZGVyOiAoJHJvdywgZSwgb3BlcmF0aW9uLCBhbHdheXNOZXdSb3cpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHdpZGdldCA9IGFsd2F5c05ld1JvdyA/ICdpbmxpbmVJbnN0YW5jZU5ldycgOiAnaW5saW5lSW5zdGFuY2UnO1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5mb3JtV2lkZ2V0cyA9IHt9O1xuICAgICAgICAgICAgICAgIHRoaXMuZmllbGREZWZzLmZvckVhY2goY29sID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbFt3aWRnZXRdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmZvcm1XaWRnZXRzW2NvbC5maWVsZF0gPSBjb2xbd2lkZ2V0XTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0RGlzYWJsZWRPbkZpZWxkKG9wZXJhdGlvbiwgY29sLCB3aWRnZXQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdmb3JtcmVuZGVyJywgeyRldmVudDogZSwgZm9ybVdpZGdldHM6IHRoaXMuZm9ybVdpZGdldHMsICRvcGVyYXRpb246IG9wZXJhdGlvbn0pO1xuICAgICAgICAgICAgfSwgMjUwKTtcbiAgICAgICAgfSxcbiAgICAgICAgb25CZWZvcmVGb3JtUmVuZGVyOiAocm93LCBlLCBvcGVyYXRpb24pID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmludm9rZUV2ZW50Q2FsbGJhY2soJ2JlZm9yZWZvcm1yZW5kZXInLCB7JGV2ZW50OiBlLCByb3csICRvcGVyYXRpb246IG9wZXJhdGlvbn0pO1xuICAgICAgICB9LFxuICAgICAgICByZWdpc3RlclJvd05nQ2xhc3NXYXRjaGVyOiAocm93RGF0YSwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgIGlmICghdGhpcy5yb3duZ2NsYXNzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3Qgcm93ID0gdGhpcy5nZXRDbG9uZWRSb3dPYmplY3Qocm93RGF0YSk7XG4gICAgICAgICAgICBjb25zdCB3YXRjaE5hbWUgPSBgJHt0aGlzLndpZGdldElkfV9yb3dOZ0NsYXNzXyR7aW5kZXh9YDtcbiAgICAgICAgICAgICR1bndhdGNoKHdhdGNoTmFtZSk7XG4gICAgICAgICAgICB0aGlzLnJlZ2lzdGVyRGVzdHJveUxpc3RlbmVyKCR3YXRjaCh0aGlzLnJvd25nY2xhc3MsIHRoaXMudmlld1BhcmVudCwge3Jvd30sIChudiwgb3YpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmNhbGxEYXRhR3JpZE1ldGhvZCgnYXBwbHlSb3dOZ0NsYXNzJywgZ2V0Q29uZGl0aW9uYWxDbGFzc2VzKG52LCBvdiksIGluZGV4KTtcbiAgICAgICAgICAgIH0sIHdhdGNoTmFtZSkpO1xuICAgICAgICB9LFxuICAgICAgICByZWdpc3RlckNvbE5nQ2xhc3NXYXRjaGVyOiAocm93RGF0YSwgY29sRGVmLCByb3dJbmRleCwgY29sSW5kZXgpID0+IHtcbiAgICAgICAgICAgIGlmICghY29sRGVmWydjb2wtbmctY2xhc3MnXSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHJvdyA9IHRoaXMuZ2V0Q2xvbmVkUm93T2JqZWN0KHJvd0RhdGEpO1xuICAgICAgICAgICAgY29uc3Qgd2F0Y2hOYW1lID0gYCR7dGhpcy53aWRnZXRJZH1fY29sTmdDbGFzc18ke3Jvd0luZGV4fV8ke2NvbEluZGV4fWA7XG4gICAgICAgICAgICAkdW53YXRjaCh3YXRjaE5hbWUpO1xuICAgICAgICAgICAgdGhpcy5yZWdpc3RlckRlc3Ryb3lMaXN0ZW5lcigkd2F0Y2goY29sRGVmWydjb2wtbmctY2xhc3MnXSwgdGhpcy52aWV3UGFyZW50LCB7cm93fSwgKG52LCBvdikgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuY2FsbERhdGFHcmlkTWV0aG9kKCdhcHBseUNvbE5nQ2xhc3MnLCBnZXRDb25kaXRpb25hbENsYXNzZXMobnYsIG92KSwgcm93SW5kZXgsIGNvbEluZGV4KTtcbiAgICAgICAgICAgIH0sIHdhdGNoTmFtZSkpO1xuICAgICAgICB9LFxuICAgICAgICBjbGVhckN1c3RvbUV4cHJlc3Npb246ICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuY3VzdG9tRXhwclZpZXdSZWYuY2xlYXIoKTtcbiAgICAgICAgICAgIHRoaXMuY3VzdG9tRXhwckNvbXBpbGVkVGwgPSB7fTtcbiAgICAgICAgfSxcbiAgICAgICAgY2xlYXJSb3dEZXRhaWxFeHByZXNzaW9uOiAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnJvd0RldGFpbFZpZXdSZWYuY2xlYXIoKTtcbiAgICAgICAgICAgIHRoaXMucm93RGVmTWFwID0ge307XG4gICAgICAgICAgICB0aGlzLnJvd0RlZkluc3RhbmNlcyA9IHt9O1xuICAgICAgICB9LFxuICAgICAgICBnZW5lcmF0ZUN1c3RvbUV4cHJlc3Npb25zOiAocm93RGF0YSwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHJvdyA9IHRoaXMuZ2V0Q2xvbmVkUm93T2JqZWN0KHJvd0RhdGEpO1xuICAgICAgICAgICAgY29uc3QgY29tcGlsZVRlbXBsYXRlID0gKHRtcGwpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoIXRtcGwpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBjb2xEZWYgPSB7fTtcbiAgICAgICAgICAgICAgICBjb25zdCBjb250ZXh0ID0ge1xuICAgICAgICAgICAgICAgICAgICByb3csXG4gICAgICAgICAgICAgICAgICAgIGNvbERlZlxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdGhpcy5hZGRFdmVudHNUb0NvbnRleHQoY29udGV4dCk7XG4gICAgICAgICAgICAgICAgY29uc3QgY3VzdG9tRXhwclZpZXcgPSB0aGlzLmN1c3RvbUV4cHJWaWV3UmVmLmNyZWF0ZUVtYmVkZGVkVmlldyh0bXBsLCBjb250ZXh0KTtcbiAgICAgICAgICAgICAgICBjb25zdCByb290Tm9kZSA9IGN1c3RvbUV4cHJWaWV3LnJvb3ROb2Rlc1swXTtcbiAgICAgICAgICAgICAgICBjb25zdCBmaWVsZE5hbWUgPSByb290Tm9kZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtY29sLWlkZW50aWZpZXInKTtcbiAgICAgICAgICAgICAgICBfLmV4dGVuZChjb2xEZWYsIHRoaXMuY29sdW1uc1tmaWVsZE5hbWVdKTtcbiAgICAgICAgICAgICAgICB0aGlzLmN1c3RvbUV4cHJDb21waWxlZFRsW2ZpZWxkTmFtZSArIGluZGV4XSA9IHJvb3ROb2RlO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGlmICh0aGlzLmlzZHluYW1pY3RhYmxlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5maWVsZERlZnMuZm9yRWFjaChjb2wgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb21waWxlVGVtcGxhdGUoY29sLmN1c3RvbUV4cHJUbXBsKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBGb3IgYWxsIHRoZSBjb2x1bW5zIGluc2lkZSB0aGUgdGFibGUsIGdlbmVyYXRlIHRoZSBjdXN0b20gZXhwcmVzc2lvblxuICAgICAgICAgICAgdGhpcy5jdXN0b21FeHByVG1wbC5mb3JFYWNoKGNvbXBpbGVUZW1wbGF0ZS5iaW5kKHRoaXMpKTtcbiAgICAgICAgfSxcbiAgICAgICAgZ2VuZXJhdGVSb3dFeHBhbnNpb25DZWxsOiAocm93RGF0YSwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHJvdyA9IHRoaXMuZ2V0Q2xvbmVkUm93T2JqZWN0KHJvd0RhdGEpO1xuICAgICAgICAgICAgLy8gRm9yIGFsbCB0aGUgY29sdW1ucyBpbnNpZGUgdGhlIHRhYmxlLCBnZW5lcmF0ZSB0aGUgaW5saW5lIHdpZGdldFxuICAgICAgICAgICAgdGhpcy5yb3dFeHBhbnNpb25BY3Rpb25UbXBsLmZvckVhY2goKHRtcGwpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnJvd0V4cGFuc2lvbkFjdGlvblRsW2luZGV4XSA9IHRoaXMucm93RXhwYW5zaW9uQWN0aW9uVmlld1JlZi5jcmVhdGVFbWJlZGRlZFZpZXcodG1wbCwge3Jvd30pLnJvb3ROb2RlcztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBnZXRSb3dFeHBhbnNpb25BY3Rpb246IChpbmRleCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucm93RXhwYW5zaW9uQWN0aW9uVGxbaW5kZXhdO1xuICAgICAgICB9LFxuICAgICAgICBnZW5lcmF0ZVJvd0RldGFpbFZpZXc6ICgkZXZlbnQsIHJvd0RhdGEsIHJvd0lkLCAkdGFyZ2V0LCAkb3ZlcmxheSwgY2FsbGJhY2spID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHJvdyA9IHRoaXMuZ2V0Q2xvbmVkUm93T2JqZWN0KHJvd0RhdGEpO1xuICAgICAgICAgICAgY29uc3Qgcm93RGVmID0gZ2V0Q2xvbmVkT2JqZWN0KHRoaXMucm93RGVmKTtcbiAgICAgICAgICAgIGlmICh0aGlzLnJvd0luc3RhbmNlLmludm9rZUV2ZW50Q2FsbGJhY2soJ2JlZm9yZXJvd2V4cGFuZCcsIHskZXZlbnQsICRkYXRhOiByb3dEZWYsIHJvd30pID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghcm93RGVmLmNvbnRlbnQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBFeHBhbmQgdGhlIHJvdyBkZXRhaWxcbiAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICAvLyBSb3cgaXMgYWxyZWFkeSByZW5kZXJlZC4gUmV0dXJuIGhlcmVcbiAgICAgICAgICAgIGlmICh0aGlzLnJvd0RlZk1hcFtyb3dJZF0gJiYgdGhpcy5yb3dEZWZNYXBbcm93SWRdLmNvbnRlbnQgPT09IHJvd0RlZi5jb250ZW50KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yb3dJbnN0YW5jZS5pbnZva2VFdmVudENhbGxiYWNrKCdyb3dleHBhbmQnLCB7JGV2ZW50LCByb3csICRkYXRhOiB0aGlzLnJvd0RlZkluc3RhbmNlc1tyb3dJZF19KTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnJvd0RlZk1hcFtyb3dJZF0gPSByb3dEZWY7XG4gICAgICAgICAgICAkdGFyZ2V0LmVtcHR5KCk7XG4gICAgICAgICAgICAkdGFyZ2V0LmhpZGUoKTtcbiAgICAgICAgICAgICRvdmVybGF5LnNob3coKTtcbiAgICAgICAgICAgIGNvbnN0IGNvbnRleHQgPSB7XG4gICAgICAgICAgICAgICAgICAgIHJvdyxcbiAgICAgICAgICAgICAgICAgICAgcm93RGVmLFxuICAgICAgICAgICAgICAgICAgICBjb250YWluZXJMb2FkOiAod2lkZ2V0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkb3ZlcmxheS5oaWRlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHRhcmdldC5zaG93KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yb3dEZWZJbnN0YW5jZXNbcm93SWRdID0gd2lkZ2V0O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucm93SW5zdGFuY2UuaW52b2tlRXZlbnRDYWxsYmFjaygncm93ZXhwYW5kJywgeyRldmVudCwgcm93LCAkZGF0YTogd2lkZ2V0fSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCA1MDApO1xuICAgICAgICAgICAgICAgICAgICB9fTtcbiAgICAgICAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5yb3dEZXRhaWxWaWV3UmVmLmNyZWF0ZUVtYmVkZGVkVmlldyh0aGlzLnJvd0V4cGFuc2lvblRtcGwsIGNvbnRleHQpLnJvb3ROb2Rlc1swXTtcbiAgICAgICAgICAgICR0YXJnZXRbMF0uYXBwZW5kQ2hpbGQocm9vdE5vZGUpO1xuICAgICAgICAgICAgJGFwcERpZ2VzdCgpO1xuICAgICAgICB9LFxuICAgICAgICBvbkJlZm9yZVJvd0NvbGxhcHNlOiAoJGV2ZW50LCByb3csIHJvd0lkKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5yb3dJbnN0YW5jZS5pbnZva2VFdmVudENhbGxiYWNrKCdiZWZvcmVyb3djb2xsYXBzZScsIHskZXZlbnQsIHJvdywgJGRhdGE6IHRoaXMucm93RGVmSW5zdGFuY2VzW3Jvd0lkXX0pO1xuICAgICAgICB9LFxuICAgICAgICBvblJvd0NvbGxhcHNlOiAoJGV2ZW50LCByb3cpID0+IHtcbiAgICAgICAgICAgIHRoaXMucm93SW5zdGFuY2UuaW52b2tlRXZlbnRDYWxsYmFjaygncm93Y29sbGFwc2UnLCB7JGV2ZW50LCByb3d9KTtcbiAgICAgICAgfSxcbiAgICAgICAgZ2V0Q3VzdG9tRXhwcmVzc2lvbjogKGZpZWxkTmFtZSwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmN1c3RvbUV4cHJDb21waWxlZFRsW2ZpZWxkTmFtZSArIGluZGV4XSB8fCAnJztcbiAgICAgICAgfSxcbiAgICAgICAgY2xlYXJSb3dBY3Rpb25zOiAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnJvd0FjdGlvbnNWaWV3UmVmLmNsZWFyKCk7XG4gICAgICAgICAgICB0aGlzLnJvd0FjdGlvbnNDb21waWxlZFRsID0ge307XG4gICAgICAgICAgICB0aGlzLnJvd0V4cGFuc2lvbkFjdGlvblZpZXdSZWYuY2xlYXIoKTtcbiAgICAgICAgICAgIHRoaXMucm93RXhwYW5zaW9uQWN0aW9uVGwgPSB7fTtcbiAgICAgICAgfSxcbiAgICAgICAgZ2VuZXJhdGVSb3dBY3Rpb25zOiAocm93RGF0YSwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHJvdyA9IHRoaXMuZ2V0Q2xvbmVkUm93T2JqZWN0KHJvd0RhdGEpO1xuICAgICAgICAgICAgdGhpcy5yb3dBY3Rpb25zQ29tcGlsZWRUbFtpbmRleF0gPSBbXTtcbiAgICAgICAgICAgIC8vIEZvciBhbGwgdGhlIGNvbHVtbnMgaW5zaWRlIHRoZSB0YWJsZSwgZ2VuZXJhdGUgdGhlIGlubGluZSB3aWRnZXRcbiAgICAgICAgICAgIHRoaXMucm93QWN0aW9uVG1wbC5mb3JFYWNoKCh0bXBsKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5yb3dBY3Rpb25zQ29tcGlsZWRUbFtpbmRleF0ucHVzaCguLi50aGlzLnJvd0FjdGlvbnNWaWV3UmVmLmNyZWF0ZUVtYmVkZGVkVmlldyh0bXBsLCB7cm93fSkucm9vdE5vZGVzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBnZXRSb3dBY3Rpb246IChpbmRleCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucm93QWN0aW9uc0NvbXBpbGVkVGxbaW5kZXhdO1xuICAgICAgICB9LFxuICAgICAgICBnZW5lcmF0ZUlubGluZUVkaXRSb3c6IChyb3dEYXRhLCBhbHdheXNOZXdSb3cpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHJvdyA9IHRoaXMuZ2V0Q2xvbmVkUm93T2JqZWN0KHJvd0RhdGEpO1xuICAgICAgICAgICAgaWYgKGFsd2F5c05ld1Jvdykge1xuICAgICAgICAgICAgICAgIC8vIENsZWFyIHRoZSB2aWV3IGNvbnRhaW5lciByZWZcbiAgICAgICAgICAgICAgICB0aGlzLmlubGluZUVkaXROZXdWaWV3UmVmLmNsZWFyKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5pbmxpbmVOZXdDb21wbGllZFRsID0ge307XG4gICAgICAgICAgICAgICAgLy8gRm9yIGFsbCB0aGUgY29sdW1ucyBpbnNpZGUgdGhlIHRhYmxlLCBnZW5lcmF0ZSB0aGUgaW5saW5lIHdpZGdldFxuICAgICAgICAgICAgICAgIHRoaXMuaW5saW5lV2lkZ2V0TmV3VG1wbC5mb3JFYWNoKHRtcGwgPT4ge1xuICAgICAgICAgICAgICAgICAgICBsZXQgZmllbGROYW1lO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBjb250ZXh0ID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcm93LFxuICAgICAgICAgICAgICAgICAgICAgICAgZ2V0Q29udHJvbDogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm5nZm9ybS5jb250cm9sc1tmaWVsZE5hbWUgKyAnX25ldyddIHx8IHt9O1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGdldFZhbGlkYXRpb25NZXNzYWdlOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29sdW1uc1tmaWVsZE5hbWVdICYmIHRoaXMuY29sdW1uc1tmaWVsZE5hbWVdLnZhbGlkYXRpb25tZXNzYWdlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuaW5saW5lRWRpdE5ld1ZpZXdSZWYuY3JlYXRlRW1iZWRkZWRWaWV3KHRtcGwsIGNvbnRleHQpLnJvb3ROb2Rlc1swXTtcbiAgICAgICAgICAgICAgICAgICAgZmllbGROYW1lID0gcm9vdE5vZGUuZ2V0QXR0cmlidXRlKCdkYXRhLWNvbC1pZGVudGlmaWVyJyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5saW5lTmV3Q29tcGxpZWRUbFtmaWVsZE5hbWVdID0gcm9vdE5vZGU7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdGhpcy5jbGVhckZvcm0odHJ1ZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gQ2xlYXIgdGhlIHZpZXcgY29udGFpbmVyIHJlZlxuICAgICAgICAgICAgdGhpcy5pbmxpbmVFZGl0Vmlld1JlZi5jbGVhcigpO1xuICAgICAgICAgICAgdGhpcy5pbmxpbmVDb21wbGllZFRsID0ge307XG4gICAgICAgICAgICB0aGlzLmNsZWFyRm9ybSgpO1xuICAgICAgICAgICAgLy8gRm9yIGFsbCB0aGUgY29sdW1ucyBpbnNpZGUgdGhlIHRhYmxlLCBnZW5lcmF0ZSB0aGUgaW5saW5lIHdpZGdldFxuICAgICAgICAgICAgdGhpcy5pbmxpbmVXaWRnZXRUbXBsLmZvckVhY2godG1wbCA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IGZpZWxkTmFtZTtcbiAgICAgICAgICAgICAgICBjb25zdCBjb250ZXh0ID0ge1xuICAgICAgICAgICAgICAgICAgICByb3csXG4gICAgICAgICAgICAgICAgICAgIGdldENvbnRyb2w6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm5nZm9ybS5jb250cm9sc1tmaWVsZE5hbWVdIHx8IHt9O1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBnZXRWYWxpZGF0aW9uTWVzc2FnZTogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuY29sdW1uc1tmaWVsZE5hbWVdICYmIHRoaXMuY29sdW1uc1tmaWVsZE5hbWVdLnZhbGlkYXRpb25tZXNzYWdlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLmlubGluZUVkaXRWaWV3UmVmLmNyZWF0ZUVtYmVkZGVkVmlldyh0bXBsLCBjb250ZXh0KS5yb290Tm9kZXNbMF07XG4gICAgICAgICAgICAgICAgZmllbGROYW1lID0gcm9vdE5vZGUuZ2V0QXR0cmlidXRlKCdkYXRhLWNvbC1pZGVudGlmaWVyJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5pbmxpbmVDb21wbGllZFRsW2ZpZWxkTmFtZV0gPSByb290Tm9kZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBnZXRJbmxpbmVFZGl0V2lkZ2V0OiAoZmllbGROYW1lLCB2YWx1ZSwgYWx3YXlzTmV3Um93KSA9PiB7XG4gICAgICAgICAgICBpZiAoYWx3YXlzTmV3Um93KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5ncmlkT3B0aW9ucy5zZXRGaWVsZFZhbHVlKGZpZWxkTmFtZSArICdfbmV3JywgdmFsdWUpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmlubGluZU5ld0NvbXBsaWVkVGxbZmllbGROYW1lXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuZ3JpZE9wdGlvbnMuc2V0RmllbGRWYWx1ZShmaWVsZE5hbWUsIHZhbHVlKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmlubGluZUNvbXBsaWVkVGxbZmllbGROYW1lXTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0RmllbGRWYWx1ZTogKGZpZWxkTmFtZSwgdmFsdWUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGNvbnRyb2wgPSB0aGlzLm5nZm9ybS5jb250cm9scyAmJiB0aGlzLm5nZm9ybS5jb250cm9sc1tmaWVsZE5hbWVdO1xuICAgICAgICAgICAgaWYgKGNvbnRyb2wpIHtcbiAgICAgICAgICAgICAgICBjb250cm9sLnNldFZhbHVlKHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZ2V0RmllbGRWYWx1ZTogZmllbGROYW1lID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGNvbnRyb2wgPSB0aGlzLm5nZm9ybS5jb250cm9scyAmJiB0aGlzLm5nZm9ybS5jb250cm9sc1tmaWVsZE5hbWVdO1xuICAgICAgICAgICAgcmV0dXJuIGNvbnRyb2wgJiYgY29udHJvbC52YWx1ZTtcbiAgICAgICAgfSxcbiAgICAgICAgZ2VuZXJhdGVGaWx0ZXJSb3c6ICgpID0+IHtcbiAgICAgICAgICAgIC8vIENsZWFyIHRoZSB2aWV3IGNvbnRhaW5lciByZWZcbiAgICAgICAgICAgIHRoaXMuZmlsdGVyVmlld1JlZi5jbGVhcigpO1xuICAgICAgICAgICAgdGhpcy5yb3dGaWx0ZXJDb21wbGllZFRsID0ge307XG4gICAgICAgICAgICAvLyBGb3IgYWxsIHRoZSBjb2x1bW5zIGluc2lkZSB0aGUgdGFibGUsIGdlbmVyYXRlIHRoZSBjb21waWxlZCBmaWx0ZXIgdGVtcGxhdGVcbiAgICAgICAgICAgIHRoaXMuZmlsdGVyVG1wbC5mb3JFYWNoKCh0bXBsKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLmZpbHRlclZpZXdSZWYuY3JlYXRlRW1iZWRkZWRWaWV3KHRtcGwsIHtcbiAgICAgICAgICAgICAgICAgICAgY2hhbmdlRm46IHRoaXMub25Sb3dGaWx0ZXJDaGFuZ2UuYmluZCh0aGlzKSxcbiAgICAgICAgICAgICAgICAgICAgaXNEaXNhYmxlZDogKGZpZWxkTmFtZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZW1wdHlNYXRjaE1vZGVzLmluZGV4T2YodGhpcy5yb3dGaWx0ZXJbZmllbGROYW1lXSAmJiB0aGlzLnJvd0ZpbHRlcltmaWVsZE5hbWVdLm1hdGNoTW9kZSkgPiAtMTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pLnJvb3ROb2Rlc1swXTtcbiAgICAgICAgICAgICAgICB0aGlzLnJvd0ZpbHRlckNvbXBsaWVkVGxbcm9vdE5vZGUuZ2V0QXR0cmlidXRlKCdkYXRhLWNvbC1pZGVudGlmaWVyJyldID0gcm9vdE5vZGU7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgZ2V0RmlsdGVyV2lkZ2V0OiAoZmllbGROYW1lKSA9PiB7XG4gICAgICAgICAgICAvLyBNb3ZlIHRoZSBnZW5lcmF0ZWQgZmlsdGVyIHRlbXBsYXRlIHRvIHRoZSBmaWx0ZXIgcm93XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5yb3dGaWx0ZXJDb21wbGllZFRsW2ZpZWxkTmFtZV07XG4gICAgICAgIH0sXG4gICAgICAgIHNldEdyaWRFZGl0TW9kZTogKHZhbCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5uZ1pvbmUucnVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmlzR3JpZEVkaXRNb2RlID0gdmFsO1xuICAgICAgICAgICAgICAgICRhcHBEaWdlc3QoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBzZXRHcmlkU3RhdGU6ICh2YWwpID0+IHtcbiAgICAgICAgICAgIHRoaXMuaXNMb2FkaW5nID0gdmFsID09PSAnbG9hZGluZyc7XG4gICAgICAgIH0sXG4gICAgICAgIG5vQ2hhbmdlc0RldGVjdGVkOiAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnRvZ2dsZU1lc3NhZ2UodHJ1ZSwgJ2luZm8nLCAnTm8gQ2hhbmdlcyBEZXRlY3RlZCcpO1xuICAgICAgICB9LFxuICAgICAgICAvLyBGdW5jdGlvbiB0byByZWRyYXcgdGhlIHdpZGdldHMgb24gcmVzaXplIG9mIGNvbHVtbnNcbiAgICAgICAgcmVkcmF3V2lkZ2V0czogKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5maWVsZERlZnMuZm9yRWFjaChjb2wgPT4ge1xuICAgICAgICAgICAgICAgIHRyaWdnZXJGbihjb2wuaW5saW5lSW5zdGFuY2UgJiYgY29sLmlubGluZUluc3RhbmNlLnJlZHJhdyk7XG4gICAgICAgICAgICAgICAgdHJpZ2dlckZuKGNvbC5pbmxpbmVJbnN0YW5jZU5ldyAmJiBjb2wuaW5saW5lSW5zdGFuY2VOZXcucmVkcmF3KTtcbiAgICAgICAgICAgICAgICB0cmlnZ2VyRm4oY29sLmZpbHRlckluc3RhbmNlICYmIGNvbC5maWx0ZXJJbnN0YW5jZS5yZWRyYXcpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIHNlYXJjaEhhbmRsZXI6IHRoaXMuc2VhcmNoU29ydEhhbmRsZXIuYmluZCh0aGlzKSxcbiAgICAgICAgc29ydEhhbmRsZXI6IHRoaXMuc2VhcmNoU29ydEhhbmRsZXIuYmluZCh0aGlzKSxcbiAgICAgICAgdGltZW91dENhbGw6IChmbiwgZGVsYXkpID0+IHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoZm4sIGRlbGF5KTtcbiAgICAgICAgfSxcbiAgICAgICAgcnVuSW5OZ1pvbmU6IGZuID0+IHtcbiAgICAgICAgICAgIHRoaXMubmdab25lLnJ1bihmbik7XG4gICAgICAgIH0sXG4gICAgICAgIHNhZmVBcHBseTogKCkgPT4ge1xuICAgICAgICAgICAgJGFwcERpZ2VzdCgpO1xuICAgICAgICB9LFxuICAgICAgICBzZXRUb3VjaGVkOiAobmFtZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgY3RybCA9IHRoaXMubmdmb3JtLmNvbnRyb2xzW25hbWVdO1xuICAgICAgICAgICAgaWYgKGN0cmwpIHtcbiAgICAgICAgICAgICAgICBjdHJsLm1hcmtBc1RvdWNoZWQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgY2xlYXJGb3JtOiB0aGlzLmNsZWFyRm9ybS5iaW5kKHRoaXMpXG4gICAgfTtcblxuICAgIHByaXZhdGUgX2dyaWREYXRhO1xuICAgIHNldCBncmlkRGF0YShuZXdWYWx1ZSkge1xuICAgICAgICB0aGlzLl9ncmlkRGF0YSA9IG5ld1ZhbHVlO1xuICAgICAgICBsZXQgc3RhcnRSb3dJbmRleCA9IDA7XG4gICAgICAgIGxldCBncmlkT3B0aW9ucztcblxuICAgICAgICB0aGlzLl9vbkNoYW5nZShuZXdWYWx1ZSk7XG4gICAgICAgIHRoaXMuX29uVG91Y2hlZCgpO1xuXG4gICAgICAgIGlmIChpc0RlZmluZWQobmV3VmFsdWUpKSB7XG4gICAgICAgICAgICAvKlNldHRpbmcgdGhlIHNlcmlhbCBubydzIG9ubHkgd2hlbiBzaG93IG5hdmlnYXRpb24gaXMgZW5hYmxlZCBhbmQgZGF0YSBuYXZpZ2F0b3IgaXMgY29tcGlsZWRcbiAgICAgICAgICAgICBhbmQgaXRzIGN1cnJlbnQgcGFnZSBpcyBzZXQgcHJvcGVybHkqL1xuICAgICAgICAgICAgaWYgKHRoaXMuaXNOYXZpZ2F0aW9uRW5hYmxlZCgpICYmIHRoaXMuZGF0YU5hdmlnYXRvci5kbi5jdXJyZW50UGFnZSkge1xuICAgICAgICAgICAgICAgIHN0YXJ0Um93SW5kZXggPSAoKHRoaXMuZGF0YU5hdmlnYXRvci5kbi5jdXJyZW50UGFnZSAtIDEpICogKHRoaXMuZGF0YU5hdmlnYXRvci5tYXhSZXN1bHRzIHx8IDEpKSArIDE7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXREYXRhR3JpZE9wdGlvbignc3RhcnRSb3dJbmRleCcsIHN0YXJ0Um93SW5kZXgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLyogSWYgY29sRGVmcyBhcmUgYXZhaWxhYmxlLCBidXQgbm90IGFscmVhZHkgc2V0IG9uIHRoZSBkYXRhZ3JpZCwgdGhlbiBzZXQgdGhlbS5cbiAgICAgICAgICAgICAqIFRoaXMgd2lsbCBoYXBwZW4gd2hpbGUgc3dpdGNoaW5nIGZyb20gbWFya3VwIHRvIGRlc2lnbiB0YWIuICovXG4gICAgICAgICAgICBncmlkT3B0aW9ucyA9IHRoaXMuY2FsbERhdGFHcmlkTWV0aG9kKCdnZXRPcHRpb25zJyk7XG5cbiAgICAgICAgICAgIGlmICghZ3JpZE9wdGlvbnMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghZ3JpZE9wdGlvbnMuY29sRGVmcy5sZW5ndGggJiYgdGhpcy5maWVsZERlZnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXREYXRhR3JpZE9wdGlvbignY29sRGVmcycsIGdldENsb25lZE9iamVjdCh0aGlzLmZpZWxkRGVmcykpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gSWYgZGF0YSBhbmQgY29sRGVmcyBhcmUgcHJlc2VudCwgY2FsbCBvbiBiZWZvcmUgZGF0YSByZW5kZXIgZXZlbnRcbiAgICAgICAgICAgIGlmICghdGhpcy5pc2R5bmFtaWN0YWJsZSAmJiAhXy5pc0VtcHR5KG5ld1ZhbHVlKSAmJiBncmlkT3B0aW9ucy5jb2xEZWZzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHRoaXMuaW52b2tlRXZlbnRDYWxsYmFjaygnYmVmb3JlZGF0YXJlbmRlcicsIHskZGF0YTogbmV3VmFsdWUsICRjb2x1bW5zOiB0aGlzLmNvbHVtbnMsIGRhdGE6IG5ld1ZhbHVlLCBjb2x1bW5zOiB0aGlzLmNvbHVtbnN9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc2V0RGF0YUdyaWRPcHRpb24oJ2RhdGEnLCBnZXRDbG9uZWRPYmplY3QobmV3VmFsdWUpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldCBncmlkRGF0YSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2dyaWREYXRhIHx8IFtdO1xuICAgIH1cblxuICAgIGdldCBzZWxlY3RlZGl0ZW0oKSB7XG4gICAgICAgIGlmICh0aGlzLm11bHRpc2VsZWN0KSB7XG4gICAgICAgICAgICByZXR1cm4gZ2V0Q2xvbmVkT2JqZWN0KHRoaXMuaXRlbXMpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChfLmlzRW1wdHkodGhpcy5pdGVtcykpIHtcbiAgICAgICAgICAgIHJldHVybiB7fTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZ2V0Q2xvbmVkT2JqZWN0KHRoaXMuaXRlbXNbMF0pO1xuICAgIH1cblxuICAgIHNldCBzZWxlY3RlZGl0ZW0odmFsKSB7XG4gICAgICAgIC8vIFNlbGVjdCB0aGUgcm93cyBpbiB0aGUgdGFibGUgYmFzZWQgb24gdGhlIG5ldyBzZWxlY3RlZCBpdGVtcyBwYXNzZWRcbiAgICAgICAgdGhpcy5pdGVtcy5sZW5ndGggPSAwO1xuICAgICAgICB0aGlzLmNhbGxEYXRhR3JpZE1ldGhvZCgnc2VsZWN0Um93cycsIHZhbCk7XG4gICAgfVxuXG4gICAgQEhvc3RMaXN0ZW5lcigna2V5cHJlc3MnLCBbJyRldmVudCddKSBvbktleVByZXNzICgkZXZlbnQ6IGFueSkge1xuICAgICAgICBpZiAoJGV2ZW50LndoaWNoID09PSAxMykge1xuICAgICAgICAgICAgdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdlbnRlcmtleXByZXNzJywgeyRldmVudCwgJGRhdGE6IHRoaXMuZ3JpZERhdGF9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBwdWJsaWMgaW5qOiBJbmplY3RvcixcbiAgICAgICAgcHVibGljIGZiOiBGb3JtQnVpbGRlcixcbiAgICAgICAgcHJpdmF0ZSBhcHA6IEFwcCxcbiAgICAgICAgcHJpdmF0ZSBkeW5hbWljQ29tcG9uZW50UHJvdmlkZXI6IER5bmFtaWNDb21wb25lbnRSZWZQcm92aWRlcixcbiAgICAgICAgQEF0dHJpYnV0ZSgnZGF0YXNldC5iaW5kJykgcHVibGljIGJpbmRkYXRhc2V0LFxuICAgICAgICBAQXR0cmlidXRlKCdkYXRhc291cmNlLmJpbmQnKSBwdWJsaWMgYmluZGRhdGFzb3VyY2UsXG4gICAgICAgIEBBdHRyaWJ1dGUoJ3JlYWRvbmx5Z3JpZCcpIHB1YmxpYyByZWFkb25seWdyaWQsXG4gICAgICAgIHByaXZhdGUgbmdab25lOiBOZ1pvbmVcbiAgICApIHtcbiAgICAgICAgc3VwZXIoaW5qLCBXSURHRVRfQ09ORklHKTtcbiAgICAgICAgc3R5bGVyKHRoaXMubmF0aXZlRWxlbWVudCwgdGhpcyk7XG5cbiAgICAgICAgdGhpcy5uZ2Zvcm0gPSBmYi5ncm91cCh7fSk7XG4gICAgICAgIHRoaXMuYWRkRXZlbnRzVG9Db250ZXh0KHRoaXMuY29udGV4dCk7XG5cbiAgICAgICAgLy8gU2hvdyBsb2FkaW5nIHN0YXR1cyBiYXNlZCBvbiB0aGUgdmFyaWFibGUgbGlmZSBjeWNsZVxuICAgICAgICB0aGlzLmFwcC5zdWJzY3JpYmUoJ3RvZ2dsZS12YXJpYWJsZS1zdGF0ZScsIG9wdGlvbnMgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMuZGF0YXNvdXJjZSAmJiB0aGlzLmRhdGFzb3VyY2UuZXhlY3V0ZShEYXRhU291cmNlLk9wZXJhdGlvbi5JU19BUElfQVdBUkUpICYmIGlzRGF0YVNvdXJjZUVxdWFsKG9wdGlvbnMudmFyaWFibGUsIHRoaXMuZGF0YXNvdXJjZSkpIHtcbiAgICAgICAgICAgICAgICBpc0RlZmluZWQodGhpcy52YXJpYWJsZUluZmxpZ2h0KSA/IHRoaXMuZGVib3VuY2VkSGFuZGxlTG9hZGluZyhvcHRpb25zKSA6IHRoaXMuaGFuZGxlTG9hZGluZyhvcHRpb25zKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5kZWxldGVva3RleHQgPSB0aGlzLmFwcExvY2FsZS5MQUJFTF9PSztcbiAgICAgICAgdGhpcy5kZWxldGVjYW5jZWx0ZXh0ID0gdGhpcy5hcHBMb2NhbGUuTEFCRUxfQ0FOQ0VMO1xuICAgIH1cblxuICAgIG5nQWZ0ZXJDb250ZW50SW5pdCgpIHtcbiAgICAgICAgc3VwZXIubmdBZnRlckNvbnRlbnRJbml0KCk7XG4gICAgICAgIGNvbnN0IHJ1bk1vZGVJbml0aWFsUHJvcGVydGllcyA9IHtcbiAgICAgICAgICAgIHNob3dyb3dpbmRleDogJ3Nob3dSb3dJbmRleCcsXG4gICAgICAgICAgICBtdWx0aXNlbGVjdDogJ211bHRpc2VsZWN0JyxcbiAgICAgICAgICAgIHJhZGlvc2VsZWN0OiAnc2hvd1JhZGlvQ29sdW1uJyxcbiAgICAgICAgICAgIGZpbHRlcm51bGxyZWNvcmRzOiAnZmlsdGVyTnVsbFJlY29yZHMnLFxuICAgICAgICAgICAgZW5hYmxlc29ydDogJ2VuYWJsZVNvcnQnLFxuICAgICAgICAgICAgc2hvd2hlYWRlcjogJ3Nob3dIZWFkZXInLFxuICAgICAgICAgICAgZW5hYmxlY29sdW1uc2VsZWN0aW9uOiAnZW5hYmxlQ29sdW1uU2VsZWN0aW9uJyxcbiAgICAgICAgICAgIHNob3duZXdyb3c6ICdzaG93TmV3Um93JyxcbiAgICAgICAgICAgIGdyaWRmaXJzdHJvd3NlbGVjdDogJ3NlbGVjdEZpcnN0Um93J1xuICAgICAgICB9O1xuXG4gICAgICAgIGlmICh0aGlzLl9saXZlVGFibGVQYXJlbnQpIHtcbiAgICAgICAgICAgIHRoaXMuaXNQYXJ0T2ZMaXZlR3JpZCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5yZWFkb25seWdyaWQgfHwgIXRoaXMuZWRpdG1vZGUpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnJlYWRvbmx5Z3JpZCA9PT0gJ3RydWUnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lZGl0bW9kZSA9ICcnO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5pc1BhcnRPZkxpdmVHcmlkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZWRpdG1vZGUgPSB0aGlzLmlzUGFydE9mTGl2ZUdyaWQuZm9ybWxheW91dCA9PT0gJ2lubGluZScgPyBFRElUX01PREUuRk9STSA6IEVESVRfTU9ERS5ESUFMT0c7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lZGl0bW9kZSA9IHRoaXMucmVhZG9ubHlncmlkID8gRURJVF9NT0RFLklOTElORSA6ICcnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuZ3JpZE9wdGlvbnMuY29sRGVmcyA9IHRoaXMuZnVsbEZpZWxkRGVmcztcbiAgICAgICAgdGhpcy5ncmlkT3B0aW9ucy5yb3dBY3Rpb25zID0gdGhpcy5yb3dBY3Rpb25zO1xuICAgICAgICB0aGlzLmdyaWRPcHRpb25zLmhlYWRlckNvbmZpZyA9IHRoaXMuaGVhZGVyQ29uZmlnO1xuICAgICAgICB0aGlzLmdyaWRPcHRpb25zLnJvd0NsYXNzID0gdGhpcy5yb3djbGFzcztcbiAgICAgICAgdGhpcy5ncmlkT3B0aW9ucy5lZGl0bW9kZSA9IHRoaXMuZWRpdG1vZGU7XG4gICAgICAgIHRoaXMuZ3JpZE9wdGlvbnMuZm9ybVBvc2l0aW9uID0gdGhpcy5mb3JtcG9zaXRpb247XG4gICAgICAgIHRoaXMuZ3JpZE9wdGlvbnMuZmlsdGVybW9kZSA9IHRoaXMuZmlsdGVybW9kZTtcbiAgICAgICAgdGhpcy5ncmlkT3B0aW9ucy5zZWFyY2hMYWJlbCA9IHRoaXMuc2VhcmNobGFiZWw7XG4gICAgICAgIHRoaXMuZ3JpZE9wdGlvbnMuaXNNb2JpbGUgPSBpc01vYmlsZSgpO1xuICAgICAgICB0aGlzLmdyaWRPcHRpb25zLm5hbWUgPSB0aGlzLm5hbWU7XG4gICAgICAgIC8vIFdoZW4gbG9hZG9uZGVtYW5kIHByb3BlcnR5IGlzIGVuYWJsZWQoZGVmZXJsb2FkPVwidHJ1ZVwiKSBhbmQgc2hvdyBpcyB0cnVlLCBvbmx5IHRoZSBjb2x1bW4gdGl0bGVzIG9mIHRoZSBkYXRhdGFibGUgYXJlIHJlbmRlcmVkLCB0aGUgZGF0YShib2R5IG9mIHRoZSBkYXRhdGFibGUpIGlzIG5vdCBhdCBhbGwgcmVuZGVyZWQuXG4gICAgICAgIC8vIEJlY2F1c2UgdGhlIGdyaWRkYXRhIGlzIHNldHRpbmcgYmVmb3JlIHRoZSBkYXRhdGFibGUgZG9tIGlzIHJlbmRlcmVkIGJ1dCB3ZSBhcmUgc2VuZGluZyBlbXB0eSBkYXRhIHRvIHRoZSBkYXRhdGFibGUuXG4gICAgICAgIGlmICghXy5pc0VtcHR5KHRoaXMuZ3JpZERhdGEpKSB7XG4gICAgICAgICAgICB0aGlzLmdyaWRPcHRpb25zLmRhdGEgPSBnZXRDbG9uZWRPYmplY3QodGhpcy5ncmlkRGF0YSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5ncmlkT3B0aW9ucy5tZXNzYWdlcyA9IHtcbiAgICAgICAgICAgICdzZWxlY3RGaWVsZCc6ICdTZWxlY3QgRmllbGQnXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuZGF0YWdyaWRFbGVtZW50ID0gJCh0aGlzLl90YWJsZUVsZW1lbnQubmF0aXZlRWxlbWVudCk7XG5cbiAgICAgICAgdGhpcy5ncmlkRWxlbWVudCA9IHRoaXMuJGVsZW1lbnQ7XG4gICAgICAgIHRoaXMuJGVsZW1lbnQuY3NzKHsncG9zaXRpb24nOiAncmVsYXRpdmUnfSk7XG5cbiAgICAgICAgXy5mb3JFYWNoKHJ1bk1vZGVJbml0aWFsUHJvcGVydGllcywgKHZhbHVlLCBrZXkpID0+IHtcbiAgICAgICAgICAgIGlmIChpc0RlZmluZWQodGhpc1trZXldKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZ3JpZE9wdGlvbnNbdmFsdWVdID0gKHRoaXNba2V5XSA9PT0gJ3RydWUnIHx8IHRoaXNba2V5XSA9PT0gdHJ1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMucmVuZGVyT3BlcmF0aW9uQ29sdW1ucygpO1xuICAgICAgICB0aGlzLmdyaWRPcHRpb25zLmNvbERlZnMgPSB0aGlzLmZpZWxkRGVmcztcblxuICAgICAgICB0aGlzLmRhdGFncmlkRWxlbWVudC5kYXRhdGFibGUodGhpcy5ncmlkT3B0aW9ucyk7XG4gICAgICAgIHRoaXMuY2FsbERhdGFHcmlkTWV0aG9kKCdzZXRTdGF0dXMnLCAnbG9hZGluZycsIHRoaXMubG9hZGluZ2RhdGFtc2cpO1xuXG4gICAgICAgIHRoaXMuYXBwbHlQcm9wcy5mb3JFYWNoKGFyZ3MgPT4gdGhpcy5jYWxsRGF0YUdyaWRNZXRob2QoLi4uYXJncykpO1xuXG4gICAgICAgIGlmICh0aGlzLmVkaXRtb2RlID09PSBFRElUX01PREUuUVVJQ0tfRURJVCkge1xuICAgICAgICAgICAgdGhpcy5kb2N1bWVudENsaWNrQmluZCA9IHRoaXMuX2RvY3VtZW50Q2xpY2tCaW5kLmJpbmQodGhpcyk7XG4gICAgICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuZG9jdW1lbnRDbGlja0JpbmQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgbmdPbkRlc3Ryb3koKSB7XG4gICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdGhpcy5kb2N1bWVudENsaWNrQmluZCk7XG4gICAgICAgIGlmICh0aGlzLm5hdmlnYXRvclJlc3VsdFdhdGNoKSB7XG4gICAgICAgICAgICB0aGlzLm5hdmlnYXRvclJlc3VsdFdhdGNoLnVuc3Vic2NyaWJlKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMubmF2aWdhdG9yTWF4UmVzdWx0V2F0Y2gpIHtcbiAgICAgICAgICAgIHRoaXMubmF2aWdhdG9yTWF4UmVzdWx0V2F0Y2gudW5zdWJzY3JpYmUoKTtcbiAgICAgICAgfVxuICAgICAgICBzdXBlci5uZ09uRGVzdHJveSgpO1xuICAgIH1cblxuICAgIGFkZFJvd0luZGV4KHJvdykge1xuICAgICAgICBjb25zdCByb3dEYXRhID0gZ2V0Q2xvbmVkT2JqZWN0KHJvdyk7XG4gICAgICAgIGNvbnN0IHJvd0luZGV4ID0gXy5pbmRleE9mKHRoaXMuZ3JpZE9wdGlvbnMuZGF0YSwgcm93KTtcbiAgICAgICAgaWYgKHJvd0luZGV4IDwgMCkge1xuICAgICAgICAgICAgcmV0dXJuIHJvdztcbiAgICAgICAgfVxuICAgICAgICByb3dEYXRhLiRpbmRleCA9IHJvd0luZGV4ICsgMTtcbiAgICAgICAgcm93RGF0YS4kaXNGaXJzdCA9IHJvd0RhdGEuJGluZGV4ID09PSAxO1xuICAgICAgICByb3dEYXRhLiRpc0xhc3QgPSB0aGlzLmdyaWREYXRhLmxlbmd0aCA9PT0gcm93RGF0YS4kaW5kZXg7XG4gICAgICAgIHJldHVybiByb3dEYXRhO1xuICAgIH1cblxuICAgIGFkZEV2ZW50c1RvQ29udGV4dChjb250ZXh0KSB7XG4gICAgICAgIGNvbnRleHQuYWRkTmV3Um93ID0gKCkgPT4gdGhpcy5hZGROZXdSb3coKTtcbiAgICAgICAgY29udGV4dC5kZWxldGVSb3cgPSAoKSA9PiB0aGlzLmRlbGV0ZVJvdygpO1xuICAgICAgICBjb250ZXh0LmVkaXRSb3cgPSAoKSA9PiB0aGlzLmVkaXRSb3coKTtcbiAgICB9XG5cbiAgICBleGVjdXRlKG9wZXJhdGlvbiwgb3B0aW9ucykge1xuICAgICAgICBpZiAoW0RhdGFTb3VyY2UuT3BlcmF0aW9uLklTX0FQSV9BV0FSRSwgRGF0YVNvdXJjZS5PcGVyYXRpb24uSVNfUEFHRUFCTEUsIERhdGFTb3VyY2UuT3BlcmF0aW9uLlNVUFBPUlRTX1NFUlZFUl9GSUxURVJdLmluY2x1ZGVzKG9wZXJhdGlvbikpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5kYXRhc291cmNlID8gdGhpcy5kYXRhc291cmNlLmV4ZWN1dGUob3BlcmF0aW9uLCBvcHRpb25zKSA6IHt9O1xuICAgIH1cblxuICAgIGlzTmF2aWdhdGlvbkVuYWJsZWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNob3duYXZpZ2F0aW9uICYmIHRoaXMuZGF0YU5hdmlnYXRvciAmJiB0aGlzLmRhdGFOYXZpZ2F0b3JXYXRjaGVkO1xuICAgIH1cblxuICAgIGdldENsb25lZFJvd09iamVjdChyb3dEYXRhKSB7XG4gICAgICAgIGNvbnN0IHJvdyA9IGdldENsb25lZE9iamVjdChyb3dEYXRhKTtcbiAgICAgICAgcm93LmdldFByb3BlcnR5ID0gZmllbGQgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIF8uZ2V0KHJvdywgZmllbGQpO1xuICAgICAgICB9O1xuICAgICAgICByb3cuJGlzRmlyc3QgPSByb3cuJGluZGV4ID09PSAxO1xuICAgICAgICByb3cuJGlzTGFzdCA9IHRoaXMuZ3JpZERhdGEubGVuZ3RoID09PSByb3cuJGluZGV4O1xuICAgICAgICBkZWxldGUgcm93LiQkaW5kZXg7XG4gICAgICAgIGRlbGV0ZSByb3cuJCRwaztcbiAgICAgICAgcmV0dXJuIHJvdztcbiAgICB9XG5cbiAgICBoYW5kbGVMb2FkaW5nKGRhdGEpIHtcbiAgICAgICAgdGhpcy52YXJpYWJsZUluZmxpZ2h0ID0gZGF0YS5hY3RpdmU7XG4gICAgICAgIC8vIGJhc2VkIG9uIHRoZSBhY3RpdmUgc3RhdGUgYW5kIHJlc3BvbnNlIHRvZ2dsaW5nIHRoZSAnbG9hZGluZyBkYXRhLi4uJyBhbmQgJ25vIGRhdGEgZm91bmQnIG1lc3NhZ2VzLlxuICAgICAgICBpZiAoZGF0YS5hY3RpdmUpIHtcbiAgICAgICAgICAgIHRoaXMuY2FsbERhdGFHcmlkTWV0aG9kKCdzZXRTdGF0dXMnLCAnbG9hZGluZycsIHRoaXMubG9hZGluZ2RhdGFtc2cpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gSWYgZ3JpZCBpcyBpbiBlZGl0IG1vZGUgb3IgZ3JpZCBoYXMgZGF0YSwgZG9udCBzaG93IHRoZSBubyBkYXRhIG1lc3NhZ2VcbiAgICAgICAgICAgIGlmICghdGhpcy5pc0dyaWRFZGl0TW9kZSAmJiBfLmlzRW1wdHkodGhpcy5kYXRhc2V0KSkge1xuICAgICAgICAgICAgICAgIHRoaXMuY2FsbERhdGFHcmlkTWV0aG9kKCdzZXRTdGF0dXMnLCAnbm9kYXRhJywgdGhpcy5ub2RhdGFtZXNzYWdlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jYWxsRGF0YUdyaWRNZXRob2QoJ3NldFN0YXR1cycsICdyZWFkeScpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgc2V0RGlzYWJsZWRPbkZpZWxkKG9wZXJhdGlvbiwgY29sRGVmLCB3aWRnZXRUeXBlKSB7XG4gICAgICAgIGlmIChvcGVyYXRpb24gIT09ICduZXcnICYmIGNvbERlZlsncHJpbWFyeS1rZXknXSAmJiBjb2xEZWYuZ2VuZXJhdG9yID09PSAnYXNzaWduZWQnICYmICFjb2xEZWZbJ3JlbGF0ZWQtZW50aXR5LW5hbWUnXSAmJiAhY29sRGVmLnBlcmlvZCkge1xuICAgICAgICAgICAgY29sRGVmW3dpZGdldFR5cGVdLmRpc2FibGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlc2V0Rm9ybUNvbnRyb2woY3RybCkge1xuICAgICAgICBjdHJsLm1hcmtBc1VudG91Y2hlZCgpO1xuICAgICAgICBjdHJsLm1hcmtBc1ByaXN0aW5lKCk7XG4gICAgfVxuXG4gICAgY2xlYXJGb3JtKG5ld1Jvdz8pIHtcbiAgICAgICAgY29uc3QgY3RybHMgPSB0aGlzLm5nZm9ybS5jb250cm9scztcbiAgICAgICAgXy5rZXlzKHRoaXMubmdmb3JtLmNvbnRyb2xzKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgICAgICAgICAvLyBJZiBuZXcgcm93LCBjbGVhciB0aGUgY29udHJvbHMgaW4gdGhlIG5ldyByb3cuIEVsc2UsIGNsZWFyIHRoZSBjb250cm9scyBpbiBlZGl0IHJvd1xuICAgICAgICAgICAgaWYgKCFrZXkuZW5kc1dpdGgoJ19maWx0ZXInKSAmJiAoKGtleS5lbmRzV2l0aCgnX25ldycpICYmIG5ld1JvdykgfHwgKCFrZXkuZW5kc1dpdGgoJ19uZXcnKSAmJiAhbmV3Um93KSkpIHtcbiAgICAgICAgICAgICAgICBjdHJsc1trZXldLnNldFZhbHVlKCcnKTtcbiAgICAgICAgICAgICAgICB0aGlzLnJlc2V0Rm9ybUNvbnRyb2woY3RybHNba2V5XSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qIENoZWNrIHdoZXRoZXIgaXQgaXMgbm9uLWVtcHR5IHJvdy4gKi9cbiAgICBpc0VtcHR5UmVjb3JkKHJlY29yZCkge1xuICAgICAgICBjb25zdCBwcm9wZXJ0aWVzID0gT2JqZWN0LmtleXMocmVjb3JkKTtcbiAgICAgICAgbGV0IGRhdGEsXG4gICAgICAgICAgICBpc0Rpc3BsYXllZDtcblxuICAgICAgICByZXR1cm4gcHJvcGVydGllcy5ldmVyeSgocHJvcCwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgIGRhdGEgPSByZWNvcmRbcHJvcF07XG4gICAgICAgICAgICAvKiBJZiBmaWVsZERlZnMgYXJlIG1pc3NpbmcsIHNob3cgYWxsIGNvbHVtbnMgaW4gZGF0YS4gKi9cbiAgICAgICAgICAgIGlzRGlzcGxheWVkID0gKHRoaXMuZmllbGREZWZzLmxlbmd0aCAmJiBpc0RlZmluZWQodGhpcy5maWVsZERlZnNbaW5kZXhdKSAmJlxuICAgICAgICAgICAgICAgIChpc01vYmlsZSgpID8gdGhpcy5maWVsZERlZnNbaW5kZXhdLm1vYmlsZURpc3BsYXkgOiB0aGlzLmZpZWxkRGVmc1tpbmRleF0ucGNEaXNwbGF5KSkgfHwgdHJ1ZTtcbiAgICAgICAgICAgIC8qVmFsaWRhdGluZyBvbmx5IHRoZSBkaXNwbGF5ZWQgZmllbGRzKi9cbiAgICAgICAgICAgIGlmIChpc0Rpc3BsYXllZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAoZGF0YSA9PT0gbnVsbCB8fCBkYXRhID09PSB1bmRlZmluZWQgfHwgZGF0YSA9PT0gJycpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qIEZ1bmN0aW9uIHRvIHJlbW92ZSB0aGUgZW1wdHkgZGF0YS4gKi9cbiAgICByZW1vdmVFbXB0eVJlY29yZHMoc2VydmljZURhdGEpIHtcbiAgICAgICAgY29uc3QgYWxsUmVjb3JkcyA9IHNlcnZpY2VEYXRhO1xuICAgICAgICBsZXQgZmlsdGVyZWREYXRhID0gW107XG4gICAgICAgIGlmIChhbGxSZWNvcmRzICYmIGFsbFJlY29yZHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAvKkNvbXBhcmluZyBhbmQgcHVzaGluZyB0aGUgbm9uLWVtcHR5IGRhdGEgY29sdW1ucyovXG4gICAgICAgICAgICBmaWx0ZXJlZERhdGEgPSBhbGxSZWNvcmRzLmZpbHRlcihyZWNvcmQgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiByZWNvcmQgJiYgIXRoaXMuaXNFbXB0eVJlY29yZChyZWNvcmQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZpbHRlcmVkRGF0YTtcbiAgICB9XG5cbiAgICBzZXRHcmlkRGF0YShzZXJ2ZXJEYXRhKSB7XG4gICAgICAgIGNvbnN0IGRhdGEgPSB0aGlzLmZpbHRlcm51bGxyZWNvcmRzID8gIHRoaXMucmVtb3ZlRW1wdHlSZWNvcmRzKHNlcnZlckRhdGEpIDogc2VydmVyRGF0YTtcbiAgICAgICAgaWYgKCF0aGlzLnZhcmlhYmxlSW5mbGlnaHQpIHtcbiAgICAgICAgICAgIGlmIChkYXRhICYmIGRhdGEubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jYWxsRGF0YUdyaWRNZXRob2QoJ3NldFN0YXR1cycsICdub2RhdGEnLCB0aGlzLm5vZGF0YW1lc3NhZ2UpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNhbGxEYXRhR3JpZE1ldGhvZCgnc2V0U3RhdHVzJywgJ3JlYWR5Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5ncmlkRGF0YSA9IGRhdGE7XG4gICAgfVxuXG4gICAgc2V0RGF0YUdyaWRPcHRpb24ob3B0aW9uTmFtZSwgbmV3VmFsLCBmb3JjZVNldCA9IGZhbHNlKSB7XG4gICAgICAgIGlmICghdGhpcy5kYXRhZ3JpZEVsZW1lbnQgfHwgIXRoaXMuZGF0YWdyaWRFbGVtZW50LmRhdGF0YWJsZSB8fCAhdGhpcy5kYXRhZ3JpZEVsZW1lbnQuZGF0YXRhYmxlKCdpbnN0YW5jZScpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3Qgb3B0aW9uID0ge307XG4gICAgICAgIGlmIChpc0RlZmluZWQgJiYgKCFfLmlzRXF1YWwobmV3VmFsLCB0aGlzLmdyaWRPcHRpb25zW29wdGlvbk5hbWVdKSB8fCBmb3JjZVNldCkpIHtcbiAgICAgICAgICAgIG9wdGlvbltvcHRpb25OYW1lXSA9IG5ld1ZhbDtcbiAgICAgICAgICAgIHRoaXMuZGF0YWdyaWRFbGVtZW50LmRhdGF0YWJsZSgnb3B0aW9uJywgb3B0aW9uKTtcbiAgICAgICAgICAgIHRoaXMuZ3JpZE9wdGlvbnNbb3B0aW9uTmFtZV0gPSBuZXdWYWw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjYWxsRGF0YUdyaWRNZXRob2QoLi4uYXJncykge1xuICAgICAgICBpZiAoIXRoaXMuZGF0YWdyaWRFbGVtZW50IHx8ICF0aGlzLmRhdGFncmlkRWxlbWVudC5kYXRhdGFibGUoJ2luc3RhbmNlJykpIHtcbiAgICAgICAgICAgIHRoaXMuYXBwbHlQcm9wcy5zZXQoYXJnc1sxXSwgYXJncyk7XG4gICAgICAgICAgICByZXR1cm47IC8vIElmIGRhdGFncmlkIGlzIG5vdCBpbml0aWxpYXplZCBvciBkZXN0cm95ZWQsIHJldHVybiBoZXJlXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZGF0YWdyaWRFbGVtZW50LmRhdGF0YWJsZS5hcHBseSh0aGlzLmRhdGFncmlkRWxlbWVudCwgYXJncyk7XG4gICAgfVxuXG4gICAgcmVuZGVyT3BlcmF0aW9uQ29sdW1ucygpIHtcbiAgICAgICAgbGV0IHJvd0FjdGlvbkNvbCxcbiAgICAgICAgICAgIGluc2VydFBvc2l0aW9uO1xuXG4gICAgICAgIGNvbnN0IHJvd09wZXJhdGlvbnNDb2x1bW4gPSBnZXRSb3dPcGVyYXRpb25zQ29sdW1uKCksXG4gICAgICAgICAgICBjb25maWcgPSB7XG4gICAgICAgICAgICAgICAgJ25hbWUnOiByb3dPcGVyYXRpb25zQ29sdW1uLmZpZWxkLFxuICAgICAgICAgICAgICAgICdmaWVsZCc6IHJvd09wZXJhdGlvbnNDb2x1bW4uZmllbGQsXG4gICAgICAgICAgICAgICAgJ2lzUHJlZGVmaW5lZCc6IHRydWVcbiAgICAgICAgICAgIH07XG4gICAgICAgIC8vIFJldHVybiBpZiBubyBmaWVsZERlZnMgYXJlIHByZXNlbnRcbiAgICAgICAgaWYgKCF0aGlzLmZpZWxkRGVmcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHJvd0FjdGlvbkNvbCA9IF8uZmluZCh0aGlzLmZ1bGxGaWVsZERlZnMsIHsnZmllbGQnOiBST1dfT1BTX0ZJRUxELCB0eXBlOiAnY3VzdG9tJ30pOyAvLyBDaGVjayBpZiBjb2x1bW4gaXMgZmV0Y2hlZCBmcm9tIG1hcmt1cFxuICAgICAgICBfLnJlbW92ZSh0aGlzLmZpZWxkRGVmcywge3R5cGU6ICdjdXN0b20nLCBmaWVsZDogUk9XX09QU19GSUVMRH0pOyAvLyBSZW1vdmluZyBvcGVyYXRpb25zIGNvbHVtblxuICAgICAgICBfLnJlbW92ZSh0aGlzLmhlYWRlckNvbmZpZywge2ZpZWxkOiByb3dPcGVyYXRpb25zQ29sdW1uLmZpZWxkfSk7XG5cbiAgICAgICAgLypBZGQgdGhlIGNvbHVtbiBmb3Igcm93IG9wZXJhdGlvbnMgb25seSBpZiBhdC1sZWFzdCBvbmUgb3BlcmF0aW9uIGhhcyBiZWVuIGVuYWJsZWQuKi9cbiAgICAgICAgaWYgKHRoaXMucm93QWN0aW9ucy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGlmIChyb3dBY3Rpb25Db2wpIHsgLy8gSWYgY29sdW1uIGlzIHByZXNlbnQgaW4gbWFya3VwLCBwdXNoIHRoZSBjb2x1bW4gb3IgcHVzaCB0aGUgZGVmYXVsdCBjb2x1bW5cbiAgICAgICAgICAgICAgICBpbnNlcnRQb3NpdGlvbiA9IHJvd0FjdGlvbkNvbC5yb3dhY3Rpb25zcG9zaXRpb24gPyBfLnRvTnVtYmVyKHJvd0FjdGlvbkNvbC5yb3dhY3Rpb25zcG9zaXRpb24pIDogdGhpcy5maWVsZERlZnMubGVuZ3RoO1xuICAgICAgICAgICAgICAgIHRoaXMuZmllbGREZWZzLnNwbGljZShpbnNlcnRQb3NpdGlvbiwgMCwgcm93QWN0aW9uQ29sKTtcbiAgICAgICAgICAgICAgICBpZiAoaW5zZXJ0UG9zaXRpb24gPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5oZWFkZXJDb25maWcudW5zaGlmdChjb25maWcpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaGVhZGVyQ29uZmlnLnB1c2goY29uZmlnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuZmllbGREZWZzLnB1c2gocm93T3BlcmF0aW9uc0NvbHVtbik7XG4gICAgICAgICAgICAgICAgdGhpcy5oZWFkZXJDb25maWcucHVzaChjb25maWcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuc2V0RGF0YUdyaWRPcHRpb24oJ2hlYWRlckNvbmZpZycsIHRoaXMuaGVhZGVyQ29uZmlnKTtcbiAgICB9XG5cbiAgICBlbmFibGVQYWdlTmF2aWdhdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMuZGF0YXNldCAmJiB0aGlzLmJpbmRkYXRhc2V0ICYmIHRoaXMuZGF0YU5hdmlnYXRvcikge1xuICAgICAgICAgICAgLypDaGVjayBmb3Igc2FuaXR5Ki9cbiAgICAgICAgICAgIHRoaXMuZGF0YU5hdmlnYXRvcldhdGNoZWQgPSB0cnVlO1xuXG4gICAgICAgICAgICBpZiAodGhpcy5uYXZpZ2F0b3JSZXN1bHRXYXRjaCkge1xuICAgICAgICAgICAgICAgIHRoaXMubmF2aWdhdG9yUmVzdWx0V2F0Y2gudW5zdWJzY3JpYmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8qUmVnaXN0ZXIgYSB3YXRjaCBvbiB0aGUgXCJyZXN1bHRcIiBwcm9wZXJ0eSBvZiB0aGUgXCJkYXRhTmF2aWdhdG9yXCIgc28gdGhhdCB0aGUgcGFnaW5hdGVkIGRhdGEgaXMgZGlzcGxheWVkIGluIHRoZSBsaXZlLWxpc3QuKi9cbiAgICAgICAgICAgIHRoaXMubmF2aWdhdG9yUmVzdWx0V2F0Y2ggPSB0aGlzLmRhdGFOYXZpZ2F0b3IucmVzdWx0RW1pdHRlci5zdWJzY3JpYmUoKG5ld1ZhbCkgPT4ge1xuICAgICAgICAgICAgICAgIC8qIENoZWNrIGZvciBzYW5pdHkuICovXG4gICAgICAgICAgICAgICAgaWYgKGlzRGVmaW5lZChuZXdWYWwpKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFdhdGNoIHdpbGwgbm90IGJlIHRyaWdnZXJlZCBpZiBkYXRhc2V0IGFuZCBuZXcgdmFsdWUgYXJlIGVxdWFsLiBTbyB0cmlnZ2VyIHRoZSBwcm9wZXJ0eSBjaGFuZ2UgaGFuZGxlciBtYW51YWxseVxuICAgICAgICAgICAgICAgICAgICAvLyBUaGlzIGhhcHBlbnMgaW4gY2FzZSwgaWYgZGF0YXNldCBpcyBkaXJlY3RseSB1cGRhdGVkLlxuICAgICAgICAgICAgICAgICAgICBpZiAoXy5pc0VxdWFsKHRoaXMuZGF0YXNldCwgbmV3VmFsKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy53YXRjaFZhcmlhYmxlRGF0YVNldChuZXdWYWwpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKF8uaXNBcnJheShuZXdWYWwpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy53aWRnZXQuZGF0YXNldCA9IFtdLmNvbmNhdChuZXdWYWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChfLmlzT2JqZWN0KG5ld1ZhbCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLndpZGdldC5kYXRhc2V0ID0gXy5leHRlbmQoe30sIG5ld1ZhbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMud2lkZ2V0LmRhdGFzZXQgPSBuZXdWYWw7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLndpZGdldC5kYXRhc2V0ID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIHRydWUpO1xuICAgICAgICAgICAgLypEZS1yZWdpc3RlciB0aGUgd2F0Y2ggaWYgaXQgaXMgZXhpc3RzICovXG4gICAgICAgICAgICBpZiAodGhpcy5uYXZpZ2F0b3JNYXhSZXN1bHRXYXRjaCkge1xuICAgICAgICAgICAgICAgIHRoaXMubmF2aWdhdG9yTWF4UmVzdWx0V2F0Y2gudW5zdWJzY3JpYmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8qUmVnaXN0ZXIgYSB3YXRjaCBvbiB0aGUgXCJtYXhSZXN1bHRzXCIgcHJvcGVydHkgb2YgdGhlIFwiZGF0YU5hdmlnYXRvclwiIHNvIHRoYXQgdGhlIFwicGFnZVNpemVcIiBpcyBkaXNwbGF5ZWQgaW4gdGhlIGxpdmUtbGlzdC4qL1xuICAgICAgICAgICAgdGhpcy5uYXZpZ2F0b3JNYXhSZXN1bHRXYXRjaCA9IHRoaXMuZGF0YU5hdmlnYXRvci5tYXhSZXN1bHRzRW1pdHRlci5zdWJzY3JpYmUoKG5ld1ZhbCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMucGFnZXNpemUgPSBuZXdWYWw7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vIElmIGRhdGFzZXQgaXMgYSBwYWdlYWJsZSBvYmplY3QsIGRhdGEgaXMgcHJlc2VudCBpbnNpZGUgdGhlIGNvbnRlbnQgcHJvcGVydHlcbiAgICAgICAgICAgIHRoaXMuX19mdWxsRGF0YSA9IHRoaXMuZGF0YXNldDtcblxuICAgICAgICAgICAgdGhpcy5kYXRhTmF2aWdhdG9yLndpZGdldC5tYXhSZXN1bHRzID0gdGhpcy5wYWdlc2l6ZSB8fCA1O1xuICAgICAgICAgICAgdGhpcy5kYXRhTmF2aWdhdG9yLm9wdGlvbnMgPSB7XG4gICAgICAgICAgICAgICAgbWF4UmVzdWx0czogdGhpcy5wYWdlc2l6ZSB8fCA1XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVQcm9wZXJ0eUJpbmRpbmcoJ2RhdGFzZXQnKTtcbiAgICAgICAgICAgIHRoaXMuZGF0YU5hdmlnYXRvci5zZXRCaW5kRGF0YVNldCh0aGlzLmJpbmRkYXRhc2V0LCB0aGlzLnZpZXdQYXJlbnQsIHRoaXMuZGF0YXNvdXJjZSwgdGhpcy5kYXRhc2V0LCB0aGlzLmJpbmRkYXRhc291cmNlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlc2V0UGFnZU5hdmlnYXRpb24oKSB7XG4gICAgICAgIC8qQ2hlY2sgZm9yIHNhbml0eSovXG4gICAgICAgIGlmICh0aGlzLmRhdGFOYXZpZ2F0b3IpIHtcbiAgICAgICAgICAgIHRoaXMuZGF0YU5hdmlnYXRvci5yZXNldFBhZ2VOYXZpZ2F0aW9uKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpc0RhdGFWYWxpZCgpIHtcbiAgICAgICAgbGV0IGVycm9yO1xuICAgICAgICBjb25zdCBkYXRhc2V0ID0gdGhpcy5kYXRhc2V0IHx8IHt9O1xuXG4gICAgICAgIC8qSW4gY2FzZSBcImRhdGFcIiBjb250YWlucyBcImVycm9yXCIgJiBcImVycm9yTWVzc2FnZVwiLCB0aGVuIGRpc3BsYXkgdGhlIGVycm9yIG1lc3NhZ2UgaW4gdGhlIGdyaWQuKi9cbiAgICAgICAgaWYgKGRhdGFzZXQuZXJyb3IpIHtcbiAgICAgICAgICAgIGVycm9yID0gZGF0YXNldC5lcnJvcjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZGF0YXNldC5kYXRhICYmIGRhdGFzZXQuZGF0YS5lcnJvcikge1xuICAgICAgICAgICAgaWYgKGRhdGFzZXQuZGF0YS5lcnJvck1lc3NhZ2UpIHtcbiAgICAgICAgICAgICAgICBlcnJvciA9IGRhdGFzZXQuZGF0YS5lcnJvck1lc3NhZ2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVycm9yKSB7XG4gICAgICAgICAgICB0aGlzLnNldEdyaWREYXRhKFtdKTtcbiAgICAgICAgICAgIHRoaXMuY2FsbERhdGFHcmlkTWV0aG9kKCdzZXRTdGF0dXMnLCAnZXJyb3InLCBlcnJvcik7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLy8gRnVuY3Rpb24gdG8gcG9wdWxhdGUgdGhlIGdyaWQgd2l0aCBkYXRhLlxuICAgIHBvcHVsYXRlR3JpZERhdGEoc2VydmljZURhdGEpIHtcbiAgICAgICAgbGV0IGRhdGE7XG4gICAgICAgIHNlcnZpY2VEYXRhID0gdHJhbnNmb3JtRGF0YShzZXJ2aWNlRGF0YSwgdGhpcy5uYW1lKTtcbiAgICAgICAgLy8gQXBwbHkgZmlsdGVyIGFuZCBzb3J0LCBpZiBkYXRhIGlzIHJlZnJlc2hlZCB0aHJvdWdoIFJlZnJlc2ggZGF0YSBtZXRob2RcbiAgICAgICAgaWYgKCF0aGlzLmlzTmF2aWdhdGlvbkVuYWJsZWQoKSAmJiB0aGlzLl9pc0NsaWVudFNlYXJjaCkge1xuICAgICAgICAgICAgZGF0YSA9IGdldENsb25lZE9iamVjdChzZXJ2aWNlRGF0YSk7XG4gICAgICAgICAgICBkYXRhID0gdGhpcy5nZXRTZWFyY2hSZXN1bHQoZGF0YSwgdGhpcy5maWx0ZXJJbmZvKTtcbiAgICAgICAgICAgIGRhdGEgPSB0aGlzLmdldFNvcnRSZXN1bHQoZGF0YSwgdGhpcy5zb3J0SW5mbyk7XG4gICAgICAgICAgICB0aGlzLnNlcnZlckRhdGEgPSBkYXRhO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zZXJ2ZXJEYXRhID0gc2VydmljZURhdGE7XG4gICAgICAgIH1cbiAgICAgICAgLy8gSWYgZmllbGRkZWZzIGFyZSBub3QgcHJlc2VudCwgZ2VuZXJhdGUgZmllbGRkZWZzIGZyb20gZGF0YVxuICAgICAgICAvLyBSZW1vdmluZyBmaWVsZGRlZnMgY2hlY2sgYmVjYXVzZSBXaGVuIGxvYWRvbmRlbWFuZCBwcm9wZXJ0eSBpcyBlbmFibGVkKGRlZmVybG9hZD1cInRydWVcIiksIHRoZSBkYXRhc2V0IHByb3BlcnR5Y2hhbmdlaGFubGRlciBpcyB0cmlnZ2VyZWQgZmlyc3QgYmVmb3JlIHRoZSBkb20gaXMgZ2V0dGluZyByZW5kZXJlZC5cbiAgICAgICAgLy8gU28gYXQgdGhhdCB0aW1lIGZpZWxkZGVmcyBsZW5ndGggaXMgemVybywgZHVlIHRvIHRoaXMgdGhlIGNvbHVtbnMgYXJlIGNyZWF0ZWQgZHluYW1pY2FsbHkuXG4gICAgICAgIGlmICh0aGlzLmlzZHluYW1pY3RhYmxlKSB7XG4gICAgICAgICAgICB0aGlzLmNyZWF0ZUdyaWRDb2x1bW5zKHRoaXMuc2VydmVyRGF0YSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNldEdyaWREYXRhKHRoaXMuc2VydmVyRGF0YSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBGdW5jdGlvbiB0byBnZW5lcmF0ZSBhbmQgY29tcGlsZSB0aGUgZm9ybSBmaWVsZHMgZnJvbSB0aGUgbWV0YWRhdGFcbiAgICBhc3luYyBnZW5lcmF0ZUR5bmFtaWNDb2x1bW5zKGNvbHVtbnMpIHtcbiAgICAgICAgdGhpcy5maWVsZERlZnMgPSBbXTsgLy8gZW1wdHkgdGhlIGZvcm0gZmllbGRzXG4gICAgICAgIC8vIGVtcHR5IHRoZSBmaWx0ZXIgZmllbGQgdGVtcGxhdGUgcmVmcy5cbiAgICAgICAgKHRoaXMuZmlsdGVyVG1wbCBhcyBhbnkpLl9yZXN1bHRzID0gW107XG5cbiAgICAgICAgaWYgKF8uaXNFbXB0eShjb2x1bW5zKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHRtcGwgPSAnJztcbiAgICAgICAgY29sdW1ucy5mb3JFYWNoKGNvbCA9PiB7XG4gICAgICAgICAgICBsZXQgYXR0cnNUbXBsID0gJyc7XG4gICAgICAgICAgICBsZXQgY3VzdG9tVG1wbCA9ICcnO1xuICAgICAgICAgICAgXy5mb3JFYWNoKGNvbCwgKHZhbCwga2V5KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHZhbCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBJZiBjdXN0b20gZXhwcmVzc2lvbiBpcyBwcmVzZW50LCBrZWVwIGl0IGluc2lkZSB0YWJsZSBjb2x1bW4uIEVsc2UsIGtlZXAgYXMgYXR0cmlidXRlXG4gICAgICAgICAgICAgICAgICAgIGlmIChrZXkgPT09ICdjdXN0b21FeHByZXNzaW9uJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3VzdG9tVG1wbCA9IHZhbDtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF0dHJzVG1wbCArPSBgICR7a2V5fT1cIiR7dmFsfVwiYDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdG1wbCArPSBgPHdtLXRhYmxlLWNvbHVtbiAke2F0dHJzVG1wbH0gdGFibGVOYW1lPVwiJHt0aGlzLm5hbWV9XCI+JHtjdXN0b21UbXBsfTwvd20tdGFibGUtY29sdW1uPmA7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmR5bmFtaWNUYWJsZVJlZi5jbGVhcigpO1xuICAgICAgICBpZiAoIXRoaXMuX2R5bmFtaWNDb250ZXh0KSB7XG4gICAgICAgICAgICB0aGlzLl9keW5hbWljQ29udGV4dCA9IE9iamVjdC5jcmVhdGUodGhpcy52aWV3UGFyZW50KTtcbiAgICAgICAgICAgIHRoaXMuX2R5bmFtaWNDb250ZXh0W3RoaXMuZ2V0QXR0cignd21UYWJsZScpXSA9IHRoaXM7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5ub09mQ29sdW1ucyA9IGNvbHVtbnMubGVuZ3RoO1xuICAgICAgICBjb25zdCBjb21wb25lbnRGYWN0b3J5UmVmID0gYXdhaXQgdGhpcy5keW5hbWljQ29tcG9uZW50UHJvdmlkZXIuZ2V0Q29tcG9uZW50RmFjdG9yeVJlZihcbiAgICAgICAgICAgICdhcHAtdGFibGUtZHluYW1pYy0nICsgdGhpcy53aWRnZXRJZCxcbiAgICAgICAgICAgIHRtcGwsXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbm9DYWNoZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICB0cmFuc3BpbGU6IHRydWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICBjb25zdCBjb21wb25lbnQgPSB0aGlzLmR5bmFtaWNUYWJsZVJlZi5jcmVhdGVDb21wb25lbnQoY29tcG9uZW50RmFjdG9yeVJlZiwgMCwgdGhpcy5pbmopO1xuICAgICAgICBleHRlbmRQcm90byhjb21wb25lbnQuaW5zdGFuY2UsIHRoaXMuX2R5bmFtaWNDb250ZXh0KTtcbiAgICAgICAgdGhpcy4kZWxlbWVudC5maW5kKCcuZHluYW1pYy10YWJsZS1jb250YWluZXInKVswXS5hcHBlbmRDaGlsZChjb21wb25lbnQubG9jYXRpb24ubmF0aXZlRWxlbWVudCk7XG4gICAgfVxuXG4gICAgcHJlcGFyZUNvbERlZnMoZGF0YSkge1xuICAgICAgICBsZXQgZGVmYXVsdEZpZWxkRGVmcztcbiAgICAgICAgbGV0IHByb3BlcnRpZXM7XG5cbiAgICAgICAgdGhpcy5maWVsZERlZnMgPSBbXTtcbiAgICAgICAgdGhpcy5oZWFkZXJDb25maWcgPSBbXTtcbiAgICAgICAgdGhpcy5jb2x1bW5zID0ge307XG4gICAgICAgIC8qIGlmIHByb3BlcnRpZXMgbWFwIGlzIGV4aXN0ZWQgdGhlbiBmZXRjaCB0aGUgY29sdW1uIGNvbmZpZ3VyYXRpb24gZm9yIGFsbCBuZXN0ZWQgbGV2ZWxzIHVzaW5nIHV0aWwgZnVuY3Rpb24gKi9cbiAgICAgICAgcHJvcGVydGllcyA9IGRhdGE7XG4gICAgICAgIC8qY2FsbCB1dGlsaXR5IGZ1bmN0aW9uIHRvIHByZXBhcmUgZmllbGREZWZzIGZvciBncmlkIGFnYWluc3QgZ2l2ZW4gZGF0YSAoQSBNQVggT0YgMTAgQ09MVU1OUyBPTkxZKSovXG4gICAgICAgIGRlZmF1bHRGaWVsZERlZnMgPSBwcmVwYXJlRmllbGREZWZzKHByb3BlcnRpZXMpO1xuXG4gICAgICAgIC8qYXBwZW5kIGFkZGl0aW9uYWwgcHJvcGVydGllcyovXG4gICAgICAgIF8uZm9yRWFjaChkZWZhdWx0RmllbGREZWZzLCBjb2x1bW5EZWYgPT4ge1xuICAgICAgICAgICAgY29sdW1uRGVmLmJpbmRpbmcgPSBjb2x1bW5EZWYuZmllbGQ7XG4gICAgICAgICAgICBjb2x1bW5EZWYuY2FwdGlvbiA9IGNvbHVtbkRlZi5kaXNwbGF5TmFtZTtcbiAgICAgICAgICAgIGNvbHVtbkRlZi5wY0Rpc3BsYXkgPSB0cnVlO1xuICAgICAgICAgICAgY29sdW1uRGVmLm1vYmlsZURpc3BsYXkgPSB0cnVlO1xuICAgICAgICAgICAgY29sdW1uRGVmLnNlYXJjaGFibGUgPSB0cnVlO1xuICAgICAgICAgICAgY29sdW1uRGVmLnR5cGUgID0gJ3N0cmluZyc7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGRlZmF1bHRGaWVsZERlZnMuZm9yRWFjaChjb2wgPT4ge1xuICAgICAgICAgICAgdGhpcy5jb2x1bW5zW2NvbC5maWVsZF0gPSBjb2w7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuaW52b2tlRXZlbnRDYWxsYmFjaygnYmVmb3JlZGF0YXJlbmRlcicsIHskZGF0YTogZGF0YSwgJGNvbHVtbnM6IHRoaXMuY29sdW1ucywgZGF0YTogZGF0YSwgY29sdW1uczogdGhpcy5jb2x1bW5zfSk7XG5cbiAgICAgICAgZGVmYXVsdEZpZWxkRGVmcyA9IFtdO1xuICAgICAgICAvLyBBcHBseSB0aGUgY2hhbmdlcyBtYWRlIGJ5IHRoZSB1c2VyXG4gICAgICAgIF8uZm9yRWFjaCh0aGlzLmNvbHVtbnMsIHZhbCA9PiB7XG4gICAgICAgICAgICBkZWZhdWx0RmllbGREZWZzLnB1c2godmFsKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5nZW5lcmF0ZUR5bmFtaWNDb2x1bW5zKGRlZmF1bHRGaWVsZERlZnMpO1xuICAgIH1cblxuICAgIGNyZWF0ZUdyaWRDb2x1bW5zKGRhdGEpIHtcbiAgICAgICAgLyogdGhpcyBjYWxsIGJhY2sgZnVuY3Rpb24gcmVjZWl2ZXMgdGhlIGRhdGEgZnJvbSB0aGUgdmFyaWFibGUgKi9cbiAgICAgICAgLyogY2hlY2sgd2hldGhlciBkYXRhIGlzIHZhbGlkIG9yIG5vdCAqL1xuICAgICAgICBjb25zdCBkYXRhVmFsaWQgPSBkYXRhICYmICFkYXRhLmVycm9yO1xuICAgICAgICAvKmlmIHRoZSBkYXRhIGlzIHR5cGUganNvbiBvYmplY3QsIG1ha2UgaXQgYW4gYXJyYXkgb2YgdGhlIG9iamVjdCovXG4gICAgICAgIGlmIChkYXRhVmFsaWQgJiYgIV8uaXNBcnJheShkYXRhKSkge1xuICAgICAgICAgICAgZGF0YSA9IFtkYXRhXTtcbiAgICAgICAgfVxuICAgICAgICAvKiBpZiB0aGUgZGF0YSBpcyBlbXB0eSwgc2hvdyBub2RhdGFtZXNzYWdlICovXG4gICAgICAgIGlmIChfLmlzRW1wdHkoZGF0YSkpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0R3JpZERhdGEoZGF0YSk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIWRhdGFWYWxpZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8qIGlmIG5ldyBjb2x1bW5zIHRvIGJlIHJlbmRlcmVkLCBwcmVwYXJlIGRlZmF1bHQgZmllbGREZWZzIGZvciB0aGUgZGF0YSBwcm92aWRlZCovXG4gICAgICAgIHRoaXMucHJlcGFyZUNvbERlZnMoZGF0YSk7XG5cbiAgICAgICAgdGhpcy5zZXJ2ZXJEYXRhID0gZGF0YTtcbiAgICAgICAgdGhpcy5zZXRHcmlkRGF0YSh0aGlzLnNlcnZlckRhdGEpO1xuICAgIH1cblxuICAgIGdldFNvcnRFeHByKCkge1xuICAgICAgICBsZXQgc29ydEV4cDtcbiAgICAgICAgbGV0IHBhZ2luZ09wdGlvbnM7XG4gICAgICAgIGlmICh0aGlzLmRhdGFzb3VyY2UgJiYgdGhpcy5kYXRhc291cmNlLmV4ZWN1dGUoRGF0YVNvdXJjZS5PcGVyYXRpb24uSVNfUEFHRUFCTEUpKSB7XG4gICAgICAgICAgICBwYWdpbmdPcHRpb25zID0gdGhpcy5kYXRhc291cmNlLmV4ZWN1dGUoRGF0YVNvdXJjZS5PcGVyYXRpb24uR0VUX1BBR0lOR19PUFRJT05TKTtcbiAgICAgICAgICAgIHNvcnRFeHAgPSBfLmlzRW1wdHkocGFnaW5nT3B0aW9ucykgPyAnJyA6IGdldE9yZGVyQnlFeHByKHBhZ2luZ09wdGlvbnMuc29ydCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHNvcnRFeHAgfHwgJyc7XG4gICAgfVxuXG4gICAgd2F0Y2hWYXJpYWJsZURhdGFTZXQobmV3VmFsKSB7XG4gICAgICAgIGxldCByZXN1bHQ7XG4gICAgICAgIC8vIEFmdGVyIHRoZSBzZXR0aW5nIHRoZSB3YXRjaCBvbiBuYXZpZ2F0b3IsIGRhdGFzZXQgaXMgdHJpZ2dlcmVkIHdpdGggdW5kZWZpbmVkLiBJbiB0aGlzIGNhc2UsIHJldHVybiBoZXJlLlxuICAgICAgICBpZiAodGhpcy5kYXRhTmF2aWdhdG9yV2F0Y2hlZCAmJiBfLmlzVW5kZWZpbmVkKG5ld1ZhbCkgJiYgdGhpcy5fX2Z1bGxEYXRhKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gSWYgdmFyaWFibGUgaXMgaW4gbG9hZGluZyBzdGF0ZSwgc2hvdyBsb2FkaW5nIGljb25cbiAgICAgICAgaWYgKHRoaXMudmFyaWFibGVJbmZsaWdodCkge1xuICAgICAgICAgICAgdGhpcy5jYWxsRGF0YUdyaWRNZXRob2QoJ3NldFN0YXR1cycsICdsb2FkaW5nJywgdGhpcy5sb2FkaW5nZGF0YW1zZyk7XG4gICAgICAgIH1cblxuICAgICAgICByZXN1bHQgPSBnZXRWYWxpZEpTT04obmV3VmFsKTtcblxuICAgICAgICAvLyBDb252ZXJ0aW5nIG5ld3ZhbCB0byBvYmplY3QgaWYgaXQgaXMgYW4gT2JqZWN0IHRoYXQgY29tZXMgYXMgYSBzdHJpbmcgXCJ7XCJkYXRhXCIgOiAxfVwiXG4gICAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgICAgIG5ld1ZhbCA9IHJlc3VsdDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qUmV0dXJuIGlmIGRhdGEgaXMgaW52YWxpZC4qL1xuICAgICAgICBpZiAoIXRoaXMuaXNEYXRhVmFsaWQoKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSWYgdmFsdWUgaXMgZW1wdHkgb3IgaW4gc3R1ZGlvIG1vZGUsIGRvbnQgZW5hYmxlIHRoZSBuYXZpZ2F0aW9uXG4gICAgICAgIGlmIChuZXdWYWwpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnNob3duYXZpZ2F0aW9uICYmICF0aGlzLmRhdGFOYXZpZ2F0b3JXYXRjaGVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lbmFibGVQYWdlTmF2aWdhdGlvbigpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucmVzZXRQYWdlTmF2aWdhdGlvbigpO1xuICAgICAgICAgICAgLypmb3IgcnVuIG1vZGUsIGRpc2FibGluZyB0aGUgbG9hZGVyIGFuZCBzaG93aW5nIG5vIGRhdGEgZm91bmQgbWVzc2FnZSBpZiBkYXRhc2V0IGlzIG5vdCB2YWxpZCovXG4gICAgICAgICAgICBpZiAoIXRoaXMudmFyaWFibGVJbmZsaWdodCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY2FsbERhdGFHcmlkTWV0aG9kKCdzZXRTdGF0dXMnLCAnbm9kYXRhJywgdGhpcy5ub2RhdGFtZXNzYWdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuc2V0RGF0YUdyaWRPcHRpb24oJ3NlbGVjdEZpcnN0Um93JywgdGhpcy5ncmlkZmlyc3Ryb3dzZWxlY3QpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLmlzTmF2aWdhdGlvbkVuYWJsZWQoKSAmJiBuZXdWYWwpIHtcbiAgICAgICAgICAgIHRoaXMuY2hlY2tGaWx0ZXJzQXBwbGllZCh0aGlzLmdldFNvcnRFeHByKCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFfLmlzT2JqZWN0KG5ld1ZhbCkgfHwgbmV3VmFsID09PSAnJyB8fCAobmV3VmFsICYmIG5ld1ZhbC5kYXRhVmFsdWUgPT09ICcnKSkge1xuICAgICAgICAgICAgaWYgKCF0aGlzLnZhcmlhYmxlSW5mbGlnaHQpIHtcbiAgICAgICAgICAgICAgICAvLyBJZiB2YXJpYWJsZSBoYXMgZmluaXNoZWQgbG9hZGluZyBhbmQgcmVzdWx0U2V0IGlzIGVtcHR5LCBlbmRlciBlbXB0eSBkYXRhXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRHcmlkRGF0YShbXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5ld1ZhbCkge1xuICAgICAgICAgICAgdGhpcy5wb3B1bGF0ZUdyaWREYXRhKG5ld1ZhbCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvbkRhdGFTb3VyY2VDaGFuZ2UoKSB7XG4gICAgICAgIHRoaXMuZmllbGREZWZzLmZvckVhY2goY29sID0+IHtcbiAgICAgICAgICAgdHJpZ2dlckZuKGNvbC5vbkRhdGFTb3VyY2VDaGFuZ2UgJiYgY29sLm9uRGF0YVNvdXJjZUNoYW5nZS5iaW5kKGNvbCkpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBvblByb3BlcnR5Q2hhbmdlKGtleTogc3RyaW5nLCBudjogYW55LCBvdj86IGFueSkge1xuICAgICAgICBsZXQgZW5hYmxlTmV3Um93O1xuICAgICAgICBzd2l0Y2ggKGtleSkge1xuICAgICAgICAgICAgY2FzZSAnZGF0YXNvdXJjZSc6XG4gICAgICAgICAgICAgICAgdGhpcy53YXRjaFZhcmlhYmxlRGF0YVNldCh0aGlzLmRhdGFzZXQpO1xuICAgICAgICAgICAgICAgIHRoaXMub25EYXRhU291cmNlQ2hhbmdlKCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdkYXRhc2V0JzpcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5iaW5kZGF0YXNvdXJjZSAmJiAhdGhpcy5kYXRhc291cmNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy53YXRjaFZhcmlhYmxlRGF0YVNldChudik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdmaWx0ZXJtb2RlJzpcbiAgICAgICAgICAgICAgICB0aGlzLnNldERhdGFHcmlkT3B0aW9uKCdmaWx0ZXJtb2RlJywgbnYpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnc2VhcmNobGFiZWwnOlxuICAgICAgICAgICAgICAgIHRoaXMuc2V0RGF0YUdyaWRPcHRpb24oJ3NlYXJjaExhYmVsJywgbnYpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnbmF2aWdhdGlvbic6XG4gICAgICAgICAgICAgICAgaWYgKG52ID09PSAnQWR2YW5jZWQnKSB7IC8vIFN1cHBvcnQgZm9yIG9sZGVyIHByb2plY3RzIHdoZXJlIG5hdmlnYXRpb24gdHlwZSB3YXMgYWR2YW5jZWQgaW5zdGVhZCBvZiBjbGFzaWNcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5uYXZpZ2F0aW9uID0gJ0NsYXNzaWMnO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChudiAhPT0gJ05vbmUnKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2hvd25hdmlnYXRpb24gPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLm5hdkNvbnRyb2xzID0gbnY7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdncmlkZmlyc3Ryb3dzZWxlY3QnOlxuICAgICAgICAgICAgICAgIHRoaXMuc2V0RGF0YUdyaWRPcHRpb24oJ3NlbGVjdEZpcnN0Um93JywgbnYpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnZ3JpZGNsYXNzJzpcbiAgICAgICAgICAgICAgICB0aGlzLmNhbGxEYXRhR3JpZE1ldGhvZCgnb3B0aW9uJywgJ2Nzc0NsYXNzTmFtZXMuZ3JpZCcsIG52KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ25vZGF0YW1lc3NhZ2UnOlxuICAgICAgICAgICAgICAgIHRoaXMuY2FsbERhdGFHcmlkTWV0aG9kKCdvcHRpb24nLCAnZGF0YVN0YXRlcy5ub2RhdGEnLCBudik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdsb2FkaW5nZGF0YW1zZyc6XG4gICAgICAgICAgICAgICAgdGhpcy5jYWxsRGF0YUdyaWRNZXRob2QoJ29wdGlvbicsICdkYXRhU3RhdGVzLmxvYWRpbmcnLCBudik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdsb2FkaW5naWNvbic6XG4gICAgICAgICAgICAgICAgdGhpcy5jYWxsRGF0YUdyaWRNZXRob2QoJ29wdGlvbicsICdsb2FkaW5naWNvbicsIG52KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3NwYWNpbmcnOlxuICAgICAgICAgICAgICAgIHRoaXMuY2FsbERhdGFHcmlkTWV0aG9kKCdvcHRpb24nLCAnc3BhY2luZycsIG52KTtcbiAgICAgICAgICAgICAgICBpZiAobnYgPT09ICdjb25kZW5zZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubmF2aWdhdGlvblNpemUgPSAnc21hbGwnO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubmF2aWdhdGlvblNpemUgPSAnJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdleHBvcnRmb3JtYXQnOlxuICAgICAgICAgICAgICAgIHRoaXMuZXhwb3J0T3B0aW9ucyA9IFtdO1xuICAgICAgICAgICAgICAgIGlmIChudikge1xuICAgICAgICAgICAgICAgICAgICAvLyBQb3B1bGF0ZSBvcHRpb25zIGZvciBleHBvcnQgZHJvcCBkb3duIG1lbnVcbiAgICAgICAgICAgICAgICAgICAgXy5mb3JFYWNoKF8uc3BsaXQobnYsICcsJyksIHR5cGUgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5leHBvcnRPcHRpb25zLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiB0eXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGljb246IGV4cG9ydEljb25NYXBwaW5nW3R5cGVdXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnc2hvd25ld3Jvdyc6XG4gICAgICAgICAgICAgICAgLy8gRW5hYmxlIG5ldyByb3cgaWYgc2hvd25ldyBpcyB0cnVlIG9yIGFkZE5ld1JvdyBidXRvbiBpcyBwcmVzZW50XG4gICAgICAgICAgICAgICAgZW5hYmxlTmV3Um93ID0gbnYgfHwgXy5zb21lKHRoaXMuYWN0aW9ucywgYWN0ID0+IF8uaW5jbHVkZXMoYWN0LmFjdGlvbiwgJ2FkZE5ld1JvdygpJykpO1xuICAgICAgICAgICAgICAgIHRoaXMuY2FsbERhdGFHcmlkTWV0aG9kKCdvcHRpb24nLCAnYWN0aW9uc0VuYWJsZWQubmV3JywgZW5hYmxlTmV3Um93KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3Nob3cnOlxuICAgICAgICAgICAgICAgIGlmIChudikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmludm9rZUV2ZW50Q2FsbGJhY2soJ3Nob3cnKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmludm9rZUV2ZW50Q2FsbGJhY2soJ2hpZGUnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHN1cGVyLm9uUHJvcGVydHlDaGFuZ2Uoa2V5LCBudiwgb3YpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25TdHlsZUNoYW5nZShrZXksIG52LCBvdikge1xuICAgICAgICBzd2l0Y2ggKGtleSkge1xuICAgICAgICAgICAgY2FzZSAnd2lkdGgnOlxuICAgICAgICAgICAgICAgIHRoaXMuY2FsbERhdGFHcmlkTWV0aG9kKCdzZXRHcmlkRGltZW5zaW9ucycsICd3aWR0aCcsIG52KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2hlaWdodCc6XG4gICAgICAgICAgICAgICAgdGhpcy5jYWxsRGF0YUdyaWRNZXRob2QoJ3NldEdyaWREaW1lbnNpb25zJywgJ2hlaWdodCcsIG52KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgICAgIHN1cGVyLm9uU3R5bGVDaGFuZ2Uoa2V5LCBudiwgb3YpO1xuICAgIH1cblxuICAgIHBvcHVsYXRlQWN0aW9ucygpIHtcbiAgICAgICAgdGhpcy5fYWN0aW9ucy5oZWFkZXIgPSBbXTtcbiAgICAgICAgdGhpcy5fYWN0aW9ucy5mb290ZXIgPSBbXTtcbiAgICAgICAgXy5mb3JFYWNoKHRoaXMuYWN0aW9ucywgKGFjdGlvbikgPT4ge1xuICAgICAgICAgICAgaWYgKF8uaW5jbHVkZXMoYWN0aW9uLnBvc2l0aW9uLCAnaGVhZGVyJykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9hY3Rpb25zLmhlYWRlci5wdXNoKGFjdGlvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoXy5pbmNsdWRlcyhhY3Rpb24ucG9zaXRpb24sICdmb290ZXInKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2FjdGlvbnMuZm9vdGVyLnB1c2goYWN0aW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gdGhpcyBtZXRob2Qgd2lsbCByZW5kZXIgdGhlIGZpbHRlciByb3cuXG4gICAgcmVuZGVyRHluYW1pY0ZpbHRlckNvbHVtbihmaWx0ZVRlbVJlZikge1xuICAgICAgICAvLyBGb3IgZHluYW1pYyB0YWJsZSBtYW51YWxseSBwdXNoaW5nIHRoZSBmaWx0ZXJ0ZW1wbGF0ZVJlZiBhcyB0ZW1wbGF0ZVJlZiB3aWxsIG5vdCBiZSBhdmFpbGFibGUgcHJpb3IuXG4gICAgICAgIGlmICh0aGlzLmlzZHluYW1pY3RhYmxlKSB7XG4gICAgICAgICAgICAodGhpcy5maWx0ZXJUbXBsIGFzIGFueSkuX3Jlc3VsdHMucHVzaChmaWx0ZVRlbVJlZik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZWdpc3RlckNvbHVtbnModGFibGVDb2x1bW4pIHtcbiAgICAgICAgaWYgKGlzTW9iaWxlKCkpIHtcbiAgICAgICAgICAgIGlmICghdGFibGVDb2x1bW4ubW9iaWxlRGlzcGxheSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmICghdGFibGVDb2x1bW4ucGNEaXNwbGF5KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGNvbENvdW50ID0gdGhpcy5maWVsZERlZnMucHVzaCh0YWJsZUNvbHVtbik7XG4gICAgICAgIHRoaXMuZnVsbEZpZWxkRGVmcy5wdXNoKHRhYmxlQ29sdW1uKTtcbiAgICAgICAgdGhpcy5yb3dGaWx0ZXJbdGFibGVDb2x1bW4uZmllbGRdID0ge1xuICAgICAgICAgICAgdmFsdWU6IHVuZGVmaW5lZFxuICAgICAgICB9O1xuICAgICAgICB0aGlzLmZpZWxkRGVmcy5mb3JFYWNoKGNvbCA9PiB7XG4gICAgICAgICAgICB0aGlzLmNvbHVtbnNbY29sLmZpZWxkXSA9IGNvbDtcbiAgICAgICAgfSk7XG4gICAgICAgIC8vIElmIGR5bmFtaWMgZGF0YXRhYmxlIGFuZCBsYXN0IGNvbHVtbiwgcGFzcyB0aGUgY29sdW1ucyB0byBqcXVlcnkgZGF0YXRhYmxlXG4gICAgICAgIGlmICh0aGlzLmlzZHluYW1pY3RhYmxlICYmIGNvbENvdW50ID09PSB0aGlzLm5vT2ZDb2x1bW5zKSB7XG4gICAgICAgICAgICB0aGlzLnJlbmRlck9wZXJhdGlvbkNvbHVtbnMoKTtcbiAgICAgICAgICAgIHRoaXMuc2V0RGF0YUdyaWRPcHRpb24oJ2NvbERlZnMnLCB0aGlzLmZpZWxkRGVmcyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZWdpc3RlckZvcm1GaWVsZChuYW1lLCBmb3JtRmllbGQpIHtcbiAgICAgICAgdGhpcy5mb3JtZmllbGRzW25hbWVdID0gZm9ybUZpZWxkO1xuICAgIH1cblxuICAgIHJlZ2lzdGVyQWN0aW9ucyh0YWJsZUFjdGlvbikge1xuICAgICAgICB0aGlzLmFjdGlvbnMucHVzaCh0YWJsZUFjdGlvbik7XG4gICAgICAgIHRoaXMucG9wdWxhdGVBY3Rpb25zKCk7XG4gICAgfVxuXG4gICAgcmVnaXN0ZXJSb3codGFibGVSb3csIHJvd0luc3RhbmNlKSB7XG4gICAgICAgIHRoaXMucm93RGVmID0gdGFibGVSb3c7XG4gICAgICAgIHRoaXMucm93SW5zdGFuY2UgPSByb3dJbnN0YW5jZTtcbiAgICAgICAgdGhpcy5jYWxsRGF0YUdyaWRNZXRob2QoJ29wdGlvbicsICdjc3NDbGFzc05hbWVzLnJvd0V4cGFuZEljb24nLCB0aGlzLnJvd0RlZi5leHBhbmRpY29uKTtcbiAgICAgICAgdGhpcy5jYWxsRGF0YUdyaWRNZXRob2QoJ29wdGlvbicsICdjc3NDbGFzc05hbWVzLnJvd0NvbGxhcHNlSWNvbicsIHRoaXMucm93RGVmLmNvbGxhcHNlaWNvbik7XG4gICAgICAgIHRoaXMuZ3JpZE9wdGlvbnMucm93RXhwYW5zaW9uRW5hYmxlZCA9IHRydWU7XG4gICAgICAgIHRoaXMuZ3JpZE9wdGlvbnMucm93RGVmID0gdGhpcy5yb3dEZWY7XG4gICAgfVxuXG4gICAgcmVnaXN0ZXJSb3dBY3Rpb25zKHRhYmxlUm93QWN0aW9uKSB7XG4gICAgICAgIHRoaXMucm93QWN0aW9ucy5wdXNoKHRhYmxlUm93QWN0aW9uKTtcbiAgICB9XG5cbiAgICBzZWxlY3RJdGVtKGl0ZW0sIGRhdGEpIHtcbiAgICAgICAgLyogc2VydmVyIGlzIG5vdCB1cGRhdGluZyBpbW1lZGlhdGVseSwgc28gc2V0IHRoZSBzZXJ2ZXIgZGF0YSB0byBzdWNjZXNzIGNhbGxiYWNrIGRhdGEgKi9cbiAgICAgICAgaWYgKGRhdGEpIHtcbiAgICAgICAgICAgIHRoaXMuc2VydmVyRGF0YSA9IGRhdGE7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKF8uaXNPYmplY3QoaXRlbSkpIHtcbiAgICAgICAgICAgIGl0ZW0gPSBfLm9taXRCeShpdGVtLCAodmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gXy5pc0FycmF5KHZhbHVlKSAmJiBfLmlzRW1wdHkodmFsdWUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jYWxsRGF0YUdyaWRNZXRob2QoJ3NlbGVjdFJvdycsIGl0ZW0sIHRydWUpO1xuICAgIH1cbiAgICAvKiBkZXNlbGVjdCB0aGUgZ2l2ZW4gaXRlbSovXG4gICAgZGVzZWxlY3RJdGVtKGl0ZW0pIHtcbiAgICAgICAgdGhpcy5jYWxsRGF0YUdyaWRNZXRob2QoJ2Rlc2VsZWN0Um93JywgaXRlbSk7XG4gICAgfVxuXG4gICAgb25EYXRhTmF2aWdhdG9yRGF0YVNldENoYW5nZShudikge1xuICAgICAgICBsZXQgZGF0YTtcbiAgICAgICAgdGhpcy5fX2Z1bGxEYXRhID0gbnY7XG4gICAgICAgIHRoaXMuY2hlY2tGaWx0ZXJzQXBwbGllZCh0aGlzLmdldFNvcnRFeHByKCkpO1xuICAgICAgICBpZiAodGhpcy5faXNDbGllbnRTZWFyY2gpIHtcbiAgICAgICAgICAgIGRhdGEgPSBnZXRDbG9uZWRPYmplY3QodGhpcy5fX2Z1bGxEYXRhKTtcbiAgICAgICAgICAgIGlmIChfLmlzT2JqZWN0KGRhdGEpICYmICFfLmlzQXJyYXkoZGF0YSkpIHtcbiAgICAgICAgICAgICAgICBkYXRhID0gW2RhdGFdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGF0YSA9IHRoaXMuZ2V0U2VhcmNoUmVzdWx0KGRhdGEsIHRoaXMuZmlsdGVySW5mbyk7XG4gICAgICAgICAgICBkYXRhID0gdGhpcy5nZXRTb3J0UmVzdWx0KGRhdGEsIHRoaXMuc29ydEluZm8pO1xuICAgICAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG52O1xuICAgIH1cblxuICAgIHRvZ2dsZU1lc3NhZ2Uoc2hvdywgdHlwZSwgbXNnLCBoZWFkZXI/KSB7XG4gICAgICAgIGlmIChzaG93ICYmIG1zZykge1xuICAgICAgICAgICAgdGhpcy5hcHAubm90aWZ5QXBwKG1zZywgdHlwZSwgaGVhZGVyKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGV4cG9ydCgkaXRlbSkge1xuICAgICAgICBsZXQgZmlsdGVyRmllbGRzO1xuICAgICAgICBjb25zdCBzb3J0T3B0aW9ucyA9IF8uaXNFbXB0eSh0aGlzLnNvcnRJbmZvKSA/ICcnIDogdGhpcy5zb3J0SW5mby5maWVsZCArICcgJyArIHRoaXMuc29ydEluZm8uZGlyZWN0aW9uO1xuICAgICAgICBjb25zdCBjb2x1bW5zID0ge307XG4gICAgICAgIGxldCBpc1ZhbGlkO1xuICAgICAgICBsZXQgcmVxdWVzdERhdGE7XG4gICAgICAgIHRoaXMuZmllbGREZWZzLmZvckVhY2goZmllbGREZWYgPT4ge1xuICAgICAgICAgICAgLy8gRG8gbm90IGFkZCB0aGUgcm93IG9wZXJhdGlvbiBhY3Rpb25zIGNvbHVtbiB0byB0aGUgZXhwb3J0ZWQgZmlsZS5cbiAgICAgICAgICAgIGlmIChmaWVsZERlZi5maWVsZCA9PT0gUk9XX09QU19GSUVMRCB8fCAhZmllbGREZWYuc2hvdykge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IG9wdGlvbiA9IHtcbiAgICAgICAgICAgICAgICAnaGVhZGVyJzogZmllbGREZWYuZGlzcGxheU5hbWVcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICAvLyBJZiBjb2x1bW4gaGFzIGV4cG9ydGV4cHJlc3Npb24sIHRoZW4gc2VuZCBmb3JtIHRoZSBleHByZXNzaW9uIGFzIHJlcXVpcmVkIGJ5IGJhY2tlbmQuXG4gICAgICAgICAgICAvLyBvdGhlcndpc2Ugc2VuZCB0aGUgZmllbGQgbmFtZS5cbiAgICAgICAgICAgIGlmIChmaWVsZERlZi5leHBvcnRleHByZXNzaW9uKSB7XG4gICAgICAgICAgICAgICAgKDxhbnk+b3B0aW9uKS5leHByZXNzaW9uID0gZmllbGREZWYuZXhwb3J0ZXhwcmVzc2lvbjtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgKDxhbnk+b3B0aW9uKS5maWVsZCA9IGZpZWxkRGVmLmZpZWxkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29sdW1uc1tmaWVsZERlZi5maWVsZF0gPSBvcHRpb247XG4gICAgICAgIH0pO1xuICAgICAgICBmaWx0ZXJGaWVsZHMgPSB0aGlzLmdldEZpbHRlckZpZWxkcyh0aGlzLmZpbHRlckluZm8pO1xuICAgICAgICByZXF1ZXN0RGF0YSA9IHtcbiAgICAgICAgICAgIG1hdGNoTW9kZSA6ICdhbnl3aGVyZWlnbm9yZWNhc2UnLFxuICAgICAgICAgICAgZmlsdGVyRmllbGRzIDogZmlsdGVyRmllbGRzLFxuICAgICAgICAgICAgb3JkZXJCeSA6IHNvcnRPcHRpb25zLFxuICAgICAgICAgICAgZXhwb3J0VHlwZSA6ICRpdGVtLmxhYmVsLFxuICAgICAgICAgICAgbG9naWNhbE9wIDogJ0FORCcsXG4gICAgICAgICAgICBleHBvcnRTaXplIDogdGhpcy5leHBvcnRkYXRhc2l6ZSxcbiAgICAgICAgICAgIGNvbHVtbnMgOiBjb2x1bW5zXG4gICAgICAgIH07XG4gICAgICAgIGlzVmFsaWQgPSB0aGlzLmludm9rZUV2ZW50Q2FsbGJhY2soJ2JlZm9yZWV4cG9ydCcsIHskZGF0YTogcmVxdWVzdERhdGF9KTtcbiAgICAgICAgaWYgKGlzVmFsaWQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgcmVxdWVzdERhdGEuZmllbGRzID0gXy52YWx1ZXMocmVxdWVzdERhdGEuY29sdW1ucyk7XG4gICAgICAgIHRoaXMuZGF0YXNvdXJjZS5leGVjdXRlKERhdGFTb3VyY2UuT3BlcmF0aW9uLkRPV05MT0FELCB7ZGF0YTogcmVxdWVzdERhdGF9KTtcbiAgICB9XG5cbiAgICBleHBhbmRSb3cocm93SWQpIHtcbiAgICAgICAgdGhpcy5jYWxsRGF0YUdyaWRNZXRob2QoJ2V4cGFuZFJvdycsIHJvd0lkKTtcbiAgICB9XG5cbiAgICBjb2xsYXBzZVJvdyhyb3dJZCkge1xuICAgICAgICB0aGlzLmNhbGxEYXRhR3JpZE1ldGhvZCgnY29sbGFwc2VSb3cnLCByb3dJZCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfZG9jdW1lbnRDbGlja0JpbmQoZXZlbnQpIHtcbiAgICAgICAgY29uc3QgJHRhcmdldCA9IGV2ZW50LnRhcmdldDtcbiAgICAgICAgLy8gSWYgY2xpY2sgdHJpZ2dlcmVkIGZyb20gc2FtZSBncmlkIG9yIGEgZGlhbG9nLCBkbyBub3Qgc2F2ZSB0aGUgcm93XG4gICAgICAgIGlmICh0aGlzLiRlbGVtZW50WzBdLmNvbnRhaW5zKCR0YXJnZXQpIHx8IGV2ZW50LnRhcmdldC5kb2N0eXBlIHx8IGlzSW5wdXRCb2R5V3JhcHBlcigkKCR0YXJnZXQpKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY2FsbERhdGFHcmlkTWV0aG9kKCdzYXZlUm93Jyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfcmVkcmF3KGZvcmNlUmVuZGVyKSB7XG4gICAgICAgIGlmIChmb3JjZVJlbmRlcikge1xuICAgICAgICAgICAgdGhpcy5kYXRhZ3JpZEVsZW1lbnQuZGF0YXRhYmxlKHRoaXMuZ3JpZE9wdGlvbnMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5jYWxsRGF0YUdyaWRNZXRob2QoJ3NldENvbEdyb3VwV2lkdGhzJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5jYWxsRGF0YUdyaWRNZXRob2QoJ2FkZE9yUmVtb3ZlU2Nyb2xsJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGludm9rZUFjdGlvbkV2ZW50KCRldmVudCwgZXhwcmVzc2lvbjogc3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IGZuID0gJHBhcnNlRXZlbnQoZXhwcmVzc2lvbik7XG4gICAgICAgIGZuKHRoaXMudmlld1BhcmVudCwgT2JqZWN0LmFzc2lnbih0aGlzLmNvbnRleHQsIHskZXZlbnR9KSk7XG4gICAgfVxuXG4gICAgLy8gY2hhbmdlIGFuZCBibHVyIGV2ZW50cyBhcmUgYWRkZWQgZnJvbSB0aGUgdGVtcGxhdGVcbiAgICBwcm90ZWN0ZWQgaGFuZGxlRXZlbnQobm9kZTogSFRNTEVsZW1lbnQsIGV2ZW50TmFtZTogc3RyaW5nLCBjYWxsYmFjazogRnVuY3Rpb24sIGxvY2FsczogYW55KSB7XG4gICAgICAgIGlmIChldmVudE5hbWUgIT09ICdzZWxlY3QnKSB7XG4gICAgICAgICAgICBzdXBlci5oYW5kbGVFdmVudCh0aGlzLm5hdGl2ZUVsZW1lbnQsIGV2ZW50TmFtZSwgY2FsbGJhY2ssIGxvY2Fscyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0cmlnZ2VyVXBsb2FkRXZlbnQoJGV2ZW50LCBldmVudE5hbWUsIGZpZWxkTmFtZSwgcm93KSB7XG4gICAgICAgIGNvbnN0IHBhcmFtczogYW55ID0geyRldmVudCwgcm93fTtcbiAgICAgICAgaWYgKCF0aGlzLmNvbHVtbnNbZmllbGROYW1lXSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChldmVudE5hbWUgPT09ICdjaGFuZ2UnKSB7XG4gICAgICAgICAgICBwYXJhbXMubmV3VmFsID0gJGV2ZW50LnRhcmdldC5maWxlcztcbiAgICAgICAgICAgIHBhcmFtcy5vbGRWYWwgPSB0aGlzLmNvbHVtbnNbZmllbGROYW1lXS5fb2xkVXBsb2FkVmFsO1xuICAgICAgICAgICAgdGhpcy5jb2x1bW5zW2ZpZWxkTmFtZV0uX29sZFVwbG9hZFZhbCA9IHBhcmFtcy5uZXdWYWw7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jb2x1bW5zW2ZpZWxkTmFtZV0uaW52b2tlRXZlbnRDYWxsYmFjayhldmVudE5hbWUsIHBhcmFtcyk7XG4gICAgfVxuXG4gICAgcmVnaXN0ZXJGb3JtV2lkZ2V0KCkge31cblxuICAgIC8vIEZvcm0gY29udHJvbCBhY2Nlc3NvciBtZXRob2RzLiBUaGlzIHdpbGwgYmUgdXNlZCBmb3IgdGFibGUgaW5zaWRlIGZvcm1cbiAgICB3cml0ZVZhbHVlKCkge31cblxuICAgIHByaXZhdGUgX29uQ2hhbmdlOiBhbnkgPSAoKSA9PiB7fTtcbiAgICBwcml2YXRlIF9vblRvdWNoZWQ6IGFueSA9ICgpID0+IHt9O1xuXG4gICAgcmVnaXN0ZXJPbkNoYW5nZShmbikge1xuICAgICAgICB0aGlzLl9vbkNoYW5nZSA9IGZuO1xuICAgIH1cbiAgICByZWdpc3Rlck9uVG91Y2hlZChmbikge1xuICAgICAgICB0aGlzLl9vblRvdWNoZWQgPSBmbjtcbiAgICB9XG59XG4iXX0=