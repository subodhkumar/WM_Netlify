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
var DEFAULT_CLS = 'app-grid app-panel panel';
var WIDGET_CONFIG = { widgetType: 'wm-table', hostClass: DEFAULT_CLS };
var exportIconMapping = {
    EXCEL: 'fa fa-file-excel-o',
    CSV: 'fa fa-file-text-o'
};
var ROW_OPS_FIELD = 'rowOperations';
var noop = function () { };
var ɵ0 = noop;
var isInputBodyWrapper = function (target) {
    var classes = ['.dropdown-menu', '.uib-typeahead-match', '.modal-dialog', '.toast'];
    var isInput = false;
    classes.forEach(function (cls) {
        if (target.closest(cls).length) {
            isInput = true;
            return false;
        }
    });
    var attrs = ['bsdatepickerdaydecorator'];
    if (!isInput) {
        attrs.forEach(function (attr) {
            if (target[0].hasAttribute(attr)) {
                isInput = true;
                return false;
            }
        });
    }
    return isInput;
};
var ɵ1 = isInputBodyWrapper;
var TableComponent = /** @class */ (function (_super) {
    tslib_1.__extends(TableComponent, _super);
    function TableComponent(inj, fb, app, dynamicComponentProvider, binddataset, binddatasource, readonlygrid, ngZone) {
        var _this = _super.call(this, inj, WIDGET_CONFIG) || this;
        _this.inj = inj;
        _this.fb = fb;
        _this.app = app;
        _this.dynamicComponentProvider = dynamicComponentProvider;
        _this.binddataset = binddataset;
        _this.binddatasource = binddatasource;
        _this.readonlygrid = readonlygrid;
        _this.ngZone = ngZone;
        _this.rowActionsCompiledTl = {};
        _this.rowFilterCompliedTl = {};
        _this.inlineCompliedTl = {};
        _this.inlineNewCompliedTl = {};
        _this.customExprCompiledTl = {};
        _this.rowDefInstances = {};
        _this.rowDefMap = {};
        _this.rowExpansionActionTl = {};
        _this.columns = {};
        _this.formfields = {};
        _this.enablesort = true;
        _this.selectedItems = [];
        _this.selectedItemChange = new Subject();
        _this.selectedItemChange$ = _this.selectedItemChange.asObservable();
        _this.actions = [];
        _this._actions = {
            'header': [],
            'footer': []
        };
        _this.exportOptions = [];
        _this.headerConfig = [];
        _this.items = [];
        _this.rowActions = [];
        _this.shownavigation = false;
        _this.documentClickBind = noop;
        _this.fieldDefs = [];
        _this.rowDef = {};
        _this.rowInstance = {};
        _this.fullFieldDefs = [];
        _this.applyProps = new Map();
        _this.redraw = _.debounce(_this._redraw, 150);
        _this.debouncedHandleLoading = _.debounce(_this.handleLoading, 350);
        // Filter and Sort Methods
        _this.rowFilter = {};
        _this._searchSortHandler = noop;
        _this.searchSortHandler = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            _this._searchSortHandler.apply(_this, args);
        };
        _this.onRowFilterChange = noop;
        _this.onFilterConditionSelect = noop;
        _this.showClearIcon = noop;
        _this.clearRowFilter = noop;
        _this.gridOptions = {
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
            onDataRender: function () {
                _this.ngZone.run(function () {
                    if (_this.gridData.length) {
                        _this.invokeEventCallback('datarender', { $data: _this.gridData, data: _this.gridData });
                    }
                    // select rows selected in previous pages. (Not finding intersection of data and selecteditems as it will be heavy)
                    if (!_this.multiselect) {
                        _this.items.length = 0;
                    }
                    _this.callDataGridMethod('selectRows', _this.items);
                    _this.selectedItems = _this.callDataGridMethod('getSelectedRows');
                    _this.selectedItemChange.next(_this.selectedItems);
                    // On render, apply the filters set for query service variable
                    if (_this._isPageSearch && _this.filterInfo) {
                        _this.searchSortHandler(_this.filterInfo, undefined, 'search');
                    }
                });
            },
            onRowSelect: function (row, e) {
                _this.ngZone.run(function () {
                    _this.selectedItems = _this.callDataGridMethod('getSelectedRows');
                    _this.selectedItemChange.next(_this.selectedItems);
                    var rowData = _this.addRowIndex(row);
                    _this.invokeEventCallback('rowselect', { $data: rowData, $event: e, row: rowData });
                });
            },
            // assigns the items on capture phase of the click handler.
            assignSelectedItems: function (row, e) {
                _this.ngZone.run(function () {
                    /*
                     * in case of single select, update the items with out changing the reference.
                     * for multi select, keep old selected items in tact
                     */
                    if (_this.multiselect) {
                        if (_.findIndex(_this.items, row) === -1) {
                            _this.items.push(row);
                        }
                    }
                    else {
                        _this.items.length = 0;
                        _this.items.push(row);
                    }
                });
            },
            onRowDblClick: function (row, e) {
                var rowData = _this.addRowIndex(row);
                _this.invokeEventCallback('rowdblclick', { $data: rowData, $event: e, row: rowData });
            },
            onRowDeselect: function (row, e) {
                if (_this.multiselect) {
                    _this.ngZone.run(function () {
                        _this.items = _.pullAllWith(_this.items, [row], _.isEqual);
                        _this.selectedItems = _this.callDataGridMethod('getSelectedRows');
                        _this.invokeEventCallback('rowdeselect', { $data: row, $event: e, row: row });
                    });
                }
            },
            callOnRowDeselectEvent: function (row, e) {
                _this.invokeEventCallback('rowdeselect', { $data: row, $event: e, row: row });
            },
            callOnRowClickEvent: function (row, e) {
                // Call row click only if click is triggered by user
                if (e && e.hasOwnProperty('originalEvent')) {
                    var rowData = _this.addRowIndex(row);
                    _this.invokeEventCallback('rowclick', { $data: rowData, $event: e, row: rowData });
                }
            },
            closePopover: closePopover,
            onColumnSelect: function (col, e) {
                _this.selectedColumns = _this.callDataGridMethod('getSelectedColumns');
                _this.invokeEventCallback('columnselect', { $data: col, $event: e });
            },
            onColumnDeselect: function (col, e) {
                _this.selectedColumns = _this.callDataGridMethod('getSelectedColumns');
                _this.invokeEventCallback('columndeselect', { $data: col, $event: e });
            },
            onHeaderClick: function (col, e) {
                // if onSort function is registered invoke it when the column header is clicked
                _this.invokeEventCallback('headerclick', { $event: e, $data: col, column: col });
            },
            onRowDelete: function (row, cancelRowDeleteCallback, e, callBack, options) {
                _this.ngZone.run(function () {
                    _this.deleteRecord(_.extend({}, options, { row: row, 'cancelRowDeleteCallback': cancelRowDeleteCallback, 'evt': e, 'callBack': callBack }));
                });
            },
            onRowInsert: function (row, e, callBack, options) {
                _this.insertRecord(_.extend({}, options, { row: row, event: e, 'callBack': callBack }));
            },
            beforeRowUpdate: function (row, eventName) {
                if (_this._liveTableParent) {
                    _this._liveTableParent.updateRow(row, eventName);
                }
                _this.prevData = getClonedObject(row);
            },
            afterRowUpdate: function (row, e, callBack, options) {
                _this.updateRecord(_.extend({}, options, { row: row, 'prevData': _this.prevData, 'event': e, 'callBack': callBack }));
            },
            onBeforeRowUpdate: function (row, e, options) {
                return _this.invokeEventCallback('beforerowupdate', { $event: e, $data: row, row: row, options: options });
            },
            onBeforeRowInsert: function (row, e, options) {
                return _this.invokeEventCallback('beforerowinsert', { $event: e, $data: row, row: row, options: options });
            },
            onBeforeRowDelete: function (row, e, options) {
                var rowData = _this.addRowIndex(row);
                return _this.invokeEventCallback('beforerowdelete', { $event: e, row: rowData, options: options });
            },
            onFormRender: function ($row, e, operation, alwaysNewRow) {
                var widget = alwaysNewRow ? 'inlineInstanceNew' : 'inlineInstance';
                setTimeout(function () {
                    _this.formWidgets = {};
                    _this.fieldDefs.forEach(function (col) {
                        if (col[widget]) {
                            _this.formWidgets[col.field] = col[widget];
                            _this.setDisabledOnField(operation, col, widget);
                        }
                    });
                    _this.invokeEventCallback('formrender', { $event: e, formWidgets: _this.formWidgets, $operation: operation });
                }, 250);
            },
            onBeforeFormRender: function (row, e, operation) {
                return _this.invokeEventCallback('beforeformrender', { $event: e, row: row, $operation: operation });
            },
            registerRowNgClassWatcher: function (rowData, index) {
                if (!_this.rowngclass) {
                    return;
                }
                var row = _this.getClonedRowObject(rowData);
                var watchName = _this.widgetId + "_rowNgClass_" + index;
                $unwatch(watchName);
                _this.registerDestroyListener($watch(_this.rowngclass, _this.viewParent, { row: row }, function (nv, ov) {
                    _this.callDataGridMethod('applyRowNgClass', getConditionalClasses(nv, ov), index);
                }, watchName));
            },
            registerColNgClassWatcher: function (rowData, colDef, rowIndex, colIndex) {
                if (!colDef['col-ng-class']) {
                    return;
                }
                var row = _this.getClonedRowObject(rowData);
                var watchName = _this.widgetId + "_colNgClass_" + rowIndex + "_" + colIndex;
                $unwatch(watchName);
                _this.registerDestroyListener($watch(colDef['col-ng-class'], _this.viewParent, { row: row }, function (nv, ov) {
                    _this.callDataGridMethod('applyColNgClass', getConditionalClasses(nv, ov), rowIndex, colIndex);
                }, watchName));
            },
            clearCustomExpression: function () {
                _this.customExprViewRef.clear();
                _this.customExprCompiledTl = {};
            },
            clearRowDetailExpression: function () {
                _this.rowDetailViewRef.clear();
                _this.rowDefMap = {};
                _this.rowDefInstances = {};
            },
            generateCustomExpressions: function (rowData, index) {
                var row = _this.getClonedRowObject(rowData);
                var compileTemplate = function (tmpl) {
                    if (!tmpl) {
                        return;
                    }
                    var colDef = {};
                    var context = {
                        row: row,
                        colDef: colDef
                    };
                    _this.addEventsToContext(context);
                    var customExprView = _this.customExprViewRef.createEmbeddedView(tmpl, context);
                    var rootNode = customExprView.rootNodes[0];
                    var fieldName = rootNode.getAttribute('data-col-identifier');
                    _.extend(colDef, _this.columns[fieldName]);
                    _this.customExprCompiledTl[fieldName + index] = rootNode;
                };
                if (_this.isdynamictable) {
                    _this.fieldDefs.forEach(function (col) {
                        compileTemplate(col.customExprTmpl);
                    });
                    return;
                }
                // For all the columns inside the table, generate the custom expression
                _this.customExprTmpl.forEach(compileTemplate.bind(_this));
            },
            generateRowExpansionCell: function (rowData, index) {
                var row = _this.getClonedRowObject(rowData);
                // For all the columns inside the table, generate the inline widget
                _this.rowExpansionActionTmpl.forEach(function (tmpl) {
                    _this.rowExpansionActionTl[index] = _this.rowExpansionActionViewRef.createEmbeddedView(tmpl, { row: row }).rootNodes;
                });
            },
            getRowExpansionAction: function (index) {
                return _this.rowExpansionActionTl[index];
            },
            generateRowDetailView: function ($event, rowData, rowId, $target, $overlay, callback) {
                var row = _this.getClonedRowObject(rowData);
                var rowDef = getClonedObject(_this.rowDef);
                if (_this.rowInstance.invokeEventCallback('beforerowexpand', { $event: $event, $data: rowDef, row: row }) === false) {
                    return;
                }
                if (!rowDef.content) {
                    return;
                }
                // Expand the row detail
                callback();
                // Row is already rendered. Return here
                if (_this.rowDefMap[rowId] && _this.rowDefMap[rowId].content === rowDef.content) {
                    _this.rowInstance.invokeEventCallback('rowexpand', { $event: $event, row: row, $data: _this.rowDefInstances[rowId] });
                    return;
                }
                _this.rowDefMap[rowId] = rowDef;
                $target.empty();
                $target.hide();
                $overlay.show();
                var context = {
                    row: row,
                    rowDef: rowDef,
                    containerLoad: function (widget) {
                        setTimeout(function () {
                            $overlay.hide();
                            $target.show();
                            _this.rowDefInstances[rowId] = widget;
                            _this.rowInstance.invokeEventCallback('rowexpand', { $event: $event, row: row, $data: widget });
                        }, 500);
                    }
                };
                var rootNode = _this.rowDetailViewRef.createEmbeddedView(_this.rowExpansionTmpl, context).rootNodes[0];
                $target[0].appendChild(rootNode);
                $appDigest();
            },
            onBeforeRowCollapse: function ($event, row, rowId) {
                return _this.rowInstance.invokeEventCallback('beforerowcollapse', { $event: $event, row: row, $data: _this.rowDefInstances[rowId] });
            },
            onRowCollapse: function ($event, row) {
                _this.rowInstance.invokeEventCallback('rowcollapse', { $event: $event, row: row });
            },
            getCustomExpression: function (fieldName, index) {
                return _this.customExprCompiledTl[fieldName + index] || '';
            },
            clearRowActions: function () {
                _this.rowActionsViewRef.clear();
                _this.rowActionsCompiledTl = {};
                _this.rowExpansionActionViewRef.clear();
                _this.rowExpansionActionTl = {};
            },
            generateRowActions: function (rowData, index) {
                var row = _this.getClonedRowObject(rowData);
                _this.rowActionsCompiledTl[index] = [];
                // For all the columns inside the table, generate the inline widget
                _this.rowActionTmpl.forEach(function (tmpl) {
                    var _a;
                    (_a = _this.rowActionsCompiledTl[index]).push.apply(_a, tslib_1.__spread(_this.rowActionsViewRef.createEmbeddedView(tmpl, { row: row }).rootNodes));
                });
            },
            getRowAction: function (index) {
                return _this.rowActionsCompiledTl[index];
            },
            generateInlineEditRow: function (rowData, alwaysNewRow) {
                var row = _this.getClonedRowObject(rowData);
                if (alwaysNewRow) {
                    // Clear the view container ref
                    _this.inlineEditNewViewRef.clear();
                    _this.inlineNewCompliedTl = {};
                    // For all the columns inside the table, generate the inline widget
                    _this.inlineWidgetNewTmpl.forEach(function (tmpl) {
                        var fieldName;
                        var context = {
                            row: row,
                            getControl: function () {
                                return _this.ngform.controls[fieldName + '_new'] || {};
                            },
                            getValidationMessage: function () {
                                return _this.columns[fieldName] && _this.columns[fieldName].validationmessage;
                            }
                        };
                        var rootNode = _this.inlineEditNewViewRef.createEmbeddedView(tmpl, context).rootNodes[0];
                        fieldName = rootNode.getAttribute('data-col-identifier');
                        _this.inlineNewCompliedTl[fieldName] = rootNode;
                    });
                    _this.clearForm(true);
                    return;
                }
                // Clear the view container ref
                _this.inlineEditViewRef.clear();
                _this.inlineCompliedTl = {};
                _this.clearForm();
                // For all the columns inside the table, generate the inline widget
                _this.inlineWidgetTmpl.forEach(function (tmpl) {
                    var fieldName;
                    var context = {
                        row: row,
                        getControl: function () {
                            return _this.ngform.controls[fieldName] || {};
                        },
                        getValidationMessage: function () {
                            return _this.columns[fieldName] && _this.columns[fieldName].validationmessage;
                        }
                    };
                    var rootNode = _this.inlineEditViewRef.createEmbeddedView(tmpl, context).rootNodes[0];
                    fieldName = rootNode.getAttribute('data-col-identifier');
                    _this.inlineCompliedTl[fieldName] = rootNode;
                });
            },
            getInlineEditWidget: function (fieldName, value, alwaysNewRow) {
                if (alwaysNewRow) {
                    _this.gridOptions.setFieldValue(fieldName + '_new', value);
                    return _this.inlineNewCompliedTl[fieldName];
                }
                _this.gridOptions.setFieldValue(fieldName, value);
                return _this.inlineCompliedTl[fieldName];
            },
            setFieldValue: function (fieldName, value) {
                var control = _this.ngform.controls && _this.ngform.controls[fieldName];
                if (control) {
                    control.setValue(value);
                }
            },
            getFieldValue: function (fieldName) {
                var control = _this.ngform.controls && _this.ngform.controls[fieldName];
                return control && control.value;
            },
            generateFilterRow: function () {
                // Clear the view container ref
                _this.filterViewRef.clear();
                _this.rowFilterCompliedTl = {};
                // For all the columns inside the table, generate the compiled filter template
                _this.filterTmpl.forEach(function (tmpl) {
                    var rootNode = _this.filterViewRef.createEmbeddedView(tmpl, {
                        changeFn: _this.onRowFilterChange.bind(_this),
                        isDisabled: function (fieldName) {
                            return _this.emptyMatchModes.indexOf(_this.rowFilter[fieldName] && _this.rowFilter[fieldName].matchMode) > -1;
                        }
                    }).rootNodes[0];
                    _this.rowFilterCompliedTl[rootNode.getAttribute('data-col-identifier')] = rootNode;
                });
            },
            getFilterWidget: function (fieldName) {
                // Move the generated filter template to the filter row
                return _this.rowFilterCompliedTl[fieldName];
            },
            setGridEditMode: function (val) {
                _this.ngZone.run(function () {
                    _this.isGridEditMode = val;
                    $appDigest();
                });
            },
            setGridState: function (val) {
                _this.isLoading = val === 'loading';
            },
            noChangesDetected: function () {
                _this.toggleMessage(true, 'info', 'No Changes Detected');
            },
            // Function to redraw the widgets on resize of columns
            redrawWidgets: function () {
                _this.fieldDefs.forEach(function (col) {
                    triggerFn(col.inlineInstance && col.inlineInstance.redraw);
                    triggerFn(col.inlineInstanceNew && col.inlineInstanceNew.redraw);
                    triggerFn(col.filterInstance && col.filterInstance.redraw);
                });
            },
            searchHandler: _this.searchSortHandler.bind(_this),
            sortHandler: _this.searchSortHandler.bind(_this),
            timeoutCall: function (fn, delay) {
                setTimeout(fn, delay);
            },
            runInNgZone: function (fn) {
                _this.ngZone.run(fn);
            },
            safeApply: function () {
                $appDigest();
            },
            setTouched: function (name) {
                var ctrl = _this.ngform.controls[name];
                if (ctrl) {
                    ctrl.markAsTouched();
                }
            },
            clearForm: _this.clearForm.bind(_this)
        };
        _this._onChange = function () { };
        _this._onTouched = function () { };
        styler(_this.nativeElement, _this);
        _this.ngform = fb.group({});
        _this.addEventsToContext(_this.context);
        // Show loading status based on the variable life cycle
        _this.app.subscribe('toggle-variable-state', function (options) {
            if (_this.datasource && _this.datasource.execute(DataSource.Operation.IS_API_AWARE) && isDataSourceEqual(options.variable, _this.datasource)) {
                isDefined(_this.variableInflight) ? _this.debouncedHandleLoading(options) : _this.handleLoading(options);
            }
        });
        _this.deleteoktext = _this.appLocale.LABEL_OK;
        _this.deletecanceltext = _this.appLocale.LABEL_CANCEL;
        return _this;
    }
    Object.defineProperty(TableComponent.prototype, "gridData", {
        get: function () {
            return this._gridData || [];
        },
        set: function (newValue) {
            this._gridData = newValue;
            var startRowIndex = 0;
            var gridOptions;
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
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TableComponent.prototype, "selecteditem", {
        get: function () {
            if (this.multiselect) {
                return getClonedObject(this.items);
            }
            if (_.isEmpty(this.items)) {
                return {};
            }
            return getClonedObject(this.items[0]);
        },
        set: function (val) {
            // Select the rows in the table based on the new selected items passed
            this.items.length = 0;
            this.callDataGridMethod('selectRows', val);
        },
        enumerable: true,
        configurable: true
    });
    TableComponent.prototype.onKeyPress = function ($event) {
        if ($event.which === 13) {
            this.invokeEventCallback('enterkeypress', { $event: $event, $data: this.gridData });
        }
    };
    TableComponent.prototype.ngAfterContentInit = function () {
        var _this = this;
        _super.prototype.ngAfterContentInit.call(this);
        var runModeInitialProperties = {
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
        _.forEach(runModeInitialProperties, function (value, key) {
            if (isDefined(_this[key])) {
                _this.gridOptions[value] = (_this[key] === 'true' || _this[key] === true);
            }
        });
        this.renderOperationColumns();
        this.gridOptions.colDefs = this.fieldDefs;
        this.datagridElement.datatable(this.gridOptions);
        this.callDataGridMethod('setStatus', 'loading', this.loadingdatamsg);
        this.applyProps.forEach(function (args) { return _this.callDataGridMethod.apply(_this, tslib_1.__spread(args)); });
        if (this.editmode === EDIT_MODE.QUICK_EDIT) {
            this.documentClickBind = this._documentClickBind.bind(this);
            document.addEventListener('click', this.documentClickBind);
        }
    };
    TableComponent.prototype.ngOnDestroy = function () {
        document.removeEventListener('click', this.documentClickBind);
        if (this.navigatorResultWatch) {
            this.navigatorResultWatch.unsubscribe();
        }
        if (this.navigatorMaxResultWatch) {
            this.navigatorMaxResultWatch.unsubscribe();
        }
        _super.prototype.ngOnDestroy.call(this);
    };
    TableComponent.prototype.addRowIndex = function (row) {
        var rowData = getClonedObject(row);
        var rowIndex = _.indexOf(this.gridOptions.data, row);
        if (rowIndex < 0) {
            return row;
        }
        rowData.$index = rowIndex + 1;
        rowData.$isFirst = rowData.$index === 1;
        rowData.$isLast = this.gridData.length === rowData.$index;
        return rowData;
    };
    TableComponent.prototype.addEventsToContext = function (context) {
        var _this = this;
        context.addNewRow = function () { return _this.addNewRow(); };
        context.deleteRow = function () { return _this.deleteRow(); };
        context.editRow = function () { return _this.editRow(); };
    };
    TableComponent.prototype.execute = function (operation, options) {
        if ([DataSource.Operation.IS_API_AWARE, DataSource.Operation.IS_PAGEABLE, DataSource.Operation.SUPPORTS_SERVER_FILTER].includes(operation)) {
            return false;
        }
        return this.datasource ? this.datasource.execute(operation, options) : {};
    };
    TableComponent.prototype.isNavigationEnabled = function () {
        return this.shownavigation && this.dataNavigator && this.dataNavigatorWatched;
    };
    TableComponent.prototype.getClonedRowObject = function (rowData) {
        var row = getClonedObject(rowData);
        row.getProperty = function (field) {
            return _.get(row, field);
        };
        row.$isFirst = row.$index === 1;
        row.$isLast = this.gridData.length === row.$index;
        delete row.$$index;
        delete row.$$pk;
        return row;
    };
    TableComponent.prototype.handleLoading = function (data) {
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
    };
    TableComponent.prototype.setDisabledOnField = function (operation, colDef, widgetType) {
        if (operation !== 'new' && colDef['primary-key'] && colDef.generator === 'assigned' && !colDef['related-entity-name'] && !colDef.period) {
            colDef[widgetType].disabled = true;
        }
    };
    TableComponent.prototype.resetFormControl = function (ctrl) {
        ctrl.markAsUntouched();
        ctrl.markAsPristine();
    };
    TableComponent.prototype.clearForm = function (newRow) {
        var _this = this;
        var ctrls = this.ngform.controls;
        _.keys(this.ngform.controls).forEach(function (key) {
            // If new row, clear the controls in the new row. Else, clear the controls in edit row
            if (!key.endsWith('_filter') && ((key.endsWith('_new') && newRow) || (!key.endsWith('_new') && !newRow))) {
                ctrls[key].setValue('');
                _this.resetFormControl(ctrls[key]);
            }
        });
    };
    /* Check whether it is non-empty row. */
    TableComponent.prototype.isEmptyRecord = function (record) {
        var _this = this;
        var properties = Object.keys(record);
        var data, isDisplayed;
        return properties.every(function (prop, index) {
            data = record[prop];
            /* If fieldDefs are missing, show all columns in data. */
            isDisplayed = (_this.fieldDefs.length && isDefined(_this.fieldDefs[index]) &&
                (isMobile() ? _this.fieldDefs[index].mobileDisplay : _this.fieldDefs[index].pcDisplay)) || true;
            /*Validating only the displayed fields*/
            if (isDisplayed) {
                return (data === null || data === undefined || data === '');
            }
            return true;
        });
    };
    /* Function to remove the empty data. */
    TableComponent.prototype.removeEmptyRecords = function (serviceData) {
        var _this = this;
        var allRecords = serviceData;
        var filteredData = [];
        if (allRecords && allRecords.length) {
            /*Comparing and pushing the non-empty data columns*/
            filteredData = allRecords.filter(function (record) {
                return record && !_this.isEmptyRecord(record);
            });
        }
        return filteredData;
    };
    TableComponent.prototype.setGridData = function (serverData) {
        var data = this.filternullrecords ? this.removeEmptyRecords(serverData) : serverData;
        if (!this.variableInflight) {
            if (data && data.length === 0) {
                this.callDataGridMethod('setStatus', 'nodata', this.nodatamessage);
            }
            else {
                this.callDataGridMethod('setStatus', 'ready');
            }
        }
        this.gridData = data;
    };
    TableComponent.prototype.setDataGridOption = function (optionName, newVal, forceSet) {
        if (forceSet === void 0) { forceSet = false; }
        if (!this.datagridElement || !this.datagridElement.datatable || !this.datagridElement.datatable('instance')) {
            return;
        }
        var option = {};
        if (isDefined && (!_.isEqual(newVal, this.gridOptions[optionName]) || forceSet)) {
            option[optionName] = newVal;
            this.datagridElement.datatable('option', option);
            this.gridOptions[optionName] = newVal;
        }
    };
    TableComponent.prototype.callDataGridMethod = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        if (!this.datagridElement || !this.datagridElement.datatable('instance')) {
            this.applyProps.set(args[1], args);
            return; // If datagrid is not initiliazed or destroyed, return here
        }
        return this.datagridElement.datatable.apply(this.datagridElement, args);
    };
    TableComponent.prototype.renderOperationColumns = function () {
        var rowActionCol, insertPosition;
        var rowOperationsColumn = getRowOperationsColumn(), config = {
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
    };
    TableComponent.prototype.enablePageNavigation = function () {
        var _this = this;
        if (this.dataset && this.binddataset && this.dataNavigator) {
            /*Check for sanity*/
            this.dataNavigatorWatched = true;
            if (this.navigatorResultWatch) {
                this.navigatorResultWatch.unsubscribe();
            }
            /*Register a watch on the "result" property of the "dataNavigator" so that the paginated data is displayed in the live-list.*/
            this.navigatorResultWatch = this.dataNavigator.resultEmitter.subscribe(function (newVal) {
                /* Check for sanity. */
                if (isDefined(newVal)) {
                    // Watch will not be triggered if dataset and new value are equal. So trigger the property change handler manually
                    // This happens in case, if dataset is directly updated.
                    if (_.isEqual(_this.dataset, newVal)) {
                        _this.watchVariableDataSet(newVal);
                    }
                    else {
                        if (_.isArray(newVal)) {
                            _this.widget.dataset = [].concat(newVal);
                        }
                        else if (_.isObject(newVal)) {
                            _this.widget.dataset = _.extend({}, newVal);
                        }
                        else {
                            _this.widget.dataset = newVal;
                        }
                    }
                }
                else {
                    _this.widget.dataset = undefined;
                }
            }, true);
            /*De-register the watch if it is exists */
            if (this.navigatorMaxResultWatch) {
                this.navigatorMaxResultWatch.unsubscribe();
            }
            /*Register a watch on the "maxResults" property of the "dataNavigator" so that the "pageSize" is displayed in the live-list.*/
            this.navigatorMaxResultWatch = this.dataNavigator.maxResultsEmitter.subscribe(function (newVal) {
                _this.pagesize = newVal;
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
    };
    TableComponent.prototype.resetPageNavigation = function () {
        /*Check for sanity*/
        if (this.dataNavigator) {
            this.dataNavigator.resetPageNavigation();
        }
    };
    TableComponent.prototype.isDataValid = function () {
        var error;
        var dataset = this.dataset || {};
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
    };
    // Function to populate the grid with data.
    TableComponent.prototype.populateGridData = function (serviceData) {
        var data;
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
    };
    // Function to generate and compile the form fields from the metadata
    TableComponent.prototype.generateDynamicColumns = function (columns) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var tmpl, componentFactoryRef, component;
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.fieldDefs = []; // empty the form fields
                        // empty the filter field template refs.
                        this.filterTmpl._results = [];
                        if (_.isEmpty(columns)) {
                            return [2 /*return*/];
                        }
                        tmpl = '';
                        columns.forEach(function (col) {
                            var attrsTmpl = '';
                            var customTmpl = '';
                            _.forEach(col, function (val, key) {
                                if (val) {
                                    // If custom expression is present, keep it inside table column. Else, keep as attribute
                                    if (key === 'customExpression') {
                                        customTmpl = val;
                                    }
                                    else {
                                        attrsTmpl += " " + key + "=\"" + val + "\"";
                                    }
                                }
                            });
                            tmpl += "<wm-table-column " + attrsTmpl + " tableName=\"" + _this.name + "\">" + customTmpl + "</wm-table-column>";
                        });
                        this.dynamicTableRef.clear();
                        if (!this._dynamicContext) {
                            this._dynamicContext = Object.create(this.viewParent);
                            this._dynamicContext[this.getAttr('wmTable')] = this;
                        }
                        this.noOfColumns = columns.length;
                        return [4 /*yield*/, this.dynamicComponentProvider.getComponentFactoryRef('app-table-dynamic-' + this.widgetId, tmpl, {
                                noCache: true,
                                transpile: true
                            })];
                    case 1:
                        componentFactoryRef = _a.sent();
                        component = this.dynamicTableRef.createComponent(componentFactoryRef, 0, this.inj);
                        extendProto(component.instance, this._dynamicContext);
                        this.$element.find('.dynamic-table-container')[0].appendChild(component.location.nativeElement);
                        return [2 /*return*/];
                }
            });
        });
    };
    TableComponent.prototype.prepareColDefs = function (data) {
        var _this = this;
        var defaultFieldDefs;
        var properties;
        this.fieldDefs = [];
        this.headerConfig = [];
        this.columns = {};
        /* if properties map is existed then fetch the column configuration for all nested levels using util function */
        properties = data;
        /*call utility function to prepare fieldDefs for grid against given data (A MAX OF 10 COLUMNS ONLY)*/
        defaultFieldDefs = prepareFieldDefs(properties);
        /*append additional properties*/
        _.forEach(defaultFieldDefs, function (columnDef) {
            columnDef.binding = columnDef.field;
            columnDef.caption = columnDef.displayName;
            columnDef.pcDisplay = true;
            columnDef.mobileDisplay = true;
            columnDef.searchable = true;
            columnDef.type = 'string';
        });
        defaultFieldDefs.forEach(function (col) {
            _this.columns[col.field] = col;
        });
        this.invokeEventCallback('beforedatarender', { $data: data, $columns: this.columns, data: data, columns: this.columns });
        defaultFieldDefs = [];
        // Apply the changes made by the user
        _.forEach(this.columns, function (val) {
            defaultFieldDefs.push(val);
        });
        this.generateDynamicColumns(defaultFieldDefs);
    };
    TableComponent.prototype.createGridColumns = function (data) {
        /* this call back function receives the data from the variable */
        /* check whether data is valid or not */
        var dataValid = data && !data.error;
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
    };
    TableComponent.prototype.getSortExpr = function () {
        var sortExp;
        var pagingOptions;
        if (this.datasource && this.datasource.execute(DataSource.Operation.IS_PAGEABLE)) {
            pagingOptions = this.datasource.execute(DataSource.Operation.GET_PAGING_OPTIONS);
            sortExp = _.isEmpty(pagingOptions) ? '' : getOrderByExpr(pagingOptions.sort);
        }
        return sortExp || '';
    };
    TableComponent.prototype.watchVariableDataSet = function (newVal) {
        var result;
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
    };
    TableComponent.prototype.onDataSourceChange = function () {
        this.fieldDefs.forEach(function (col) {
            triggerFn(col.onDataSourceChange && col.onDataSourceChange.bind(col));
        });
    };
    TableComponent.prototype.onPropertyChange = function (key, nv, ov) {
        var _this = this;
        var enableNewRow;
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
                    _.forEach(_.split(nv, ','), function (type) {
                        _this.exportOptions.push({
                            label: type,
                            icon: exportIconMapping[type]
                        });
                    });
                }
                break;
            case 'shownewrow':
                // Enable new row if shownew is true or addNewRow buton is present
                enableNewRow = nv || _.some(this.actions, function (act) { return _.includes(act.action, 'addNewRow()'); });
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
                _super.prototype.onPropertyChange.call(this, key, nv, ov);
        }
    };
    TableComponent.prototype.onStyleChange = function (key, nv, ov) {
        switch (key) {
            case 'width':
                this.callDataGridMethod('setGridDimensions', 'width', nv);
                break;
            case 'height':
                this.callDataGridMethod('setGridDimensions', 'height', nv);
                break;
        }
        _super.prototype.onStyleChange.call(this, key, nv, ov);
    };
    TableComponent.prototype.populateActions = function () {
        var _this = this;
        this._actions.header = [];
        this._actions.footer = [];
        _.forEach(this.actions, function (action) {
            if (_.includes(action.position, 'header')) {
                _this._actions.header.push(action);
            }
            if (_.includes(action.position, 'footer')) {
                _this._actions.footer.push(action);
            }
        });
    };
    // this method will render the filter row.
    TableComponent.prototype.renderDynamicFilterColumn = function (filteTemRef) {
        // For dynamic table manually pushing the filtertemplateRef as templateRef will not be available prior.
        if (this.isdynamictable) {
            this.filterTmpl._results.push(filteTemRef);
        }
    };
    TableComponent.prototype.registerColumns = function (tableColumn) {
        var _this = this;
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
        var colCount = this.fieldDefs.push(tableColumn);
        this.fullFieldDefs.push(tableColumn);
        this.rowFilter[tableColumn.field] = {
            value: undefined
        };
        this.fieldDefs.forEach(function (col) {
            _this.columns[col.field] = col;
        });
        // If dynamic datatable and last column, pass the columns to jquery datatable
        if (this.isdynamictable && colCount === this.noOfColumns) {
            this.renderOperationColumns();
            this.setDataGridOption('colDefs', this.fieldDefs);
        }
    };
    TableComponent.prototype.registerFormField = function (name, formField) {
        this.formfields[name] = formField;
    };
    TableComponent.prototype.registerActions = function (tableAction) {
        this.actions.push(tableAction);
        this.populateActions();
    };
    TableComponent.prototype.registerRow = function (tableRow, rowInstance) {
        this.rowDef = tableRow;
        this.rowInstance = rowInstance;
        this.callDataGridMethod('option', 'cssClassNames.rowExpandIcon', this.rowDef.expandicon);
        this.callDataGridMethod('option', 'cssClassNames.rowCollapseIcon', this.rowDef.collapseicon);
        this.gridOptions.rowExpansionEnabled = true;
        this.gridOptions.rowDef = this.rowDef;
    };
    TableComponent.prototype.registerRowActions = function (tableRowAction) {
        this.rowActions.push(tableRowAction);
    };
    TableComponent.prototype.selectItem = function (item, data) {
        /* server is not updating immediately, so set the server data to success callback data */
        if (data) {
            this.serverData = data;
        }
        if (_.isObject(item)) {
            item = _.omitBy(item, function (value) {
                return _.isArray(value) && _.isEmpty(value);
            });
        }
        this.callDataGridMethod('selectRow', item, true);
    };
    /* deselect the given item*/
    TableComponent.prototype.deselectItem = function (item) {
        this.callDataGridMethod('deselectRow', item);
    };
    TableComponent.prototype.onDataNavigatorDataSetChange = function (nv) {
        var data;
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
    };
    TableComponent.prototype.toggleMessage = function (show, type, msg, header) {
        if (show && msg) {
            this.app.notifyApp(msg, type, header);
        }
    };
    TableComponent.prototype.export = function ($item) {
        var filterFields;
        var sortOptions = _.isEmpty(this.sortInfo) ? '' : this.sortInfo.field + ' ' + this.sortInfo.direction;
        var columns = {};
        var isValid;
        var requestData;
        this.fieldDefs.forEach(function (fieldDef) {
            // Do not add the row operation actions column to the exported file.
            if (fieldDef.field === ROW_OPS_FIELD || !fieldDef.show) {
                return;
            }
            var option = {
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
    };
    TableComponent.prototype.expandRow = function (rowId) {
        this.callDataGridMethod('expandRow', rowId);
    };
    TableComponent.prototype.collapseRow = function (rowId) {
        this.callDataGridMethod('collapseRow', rowId);
    };
    TableComponent.prototype._documentClickBind = function (event) {
        var $target = event.target;
        // If click triggered from same grid or a dialog, do not save the row
        if (this.$element[0].contains($target) || event.target.doctype || isInputBodyWrapper($($target))) {
            return;
        }
        this.callDataGridMethod('saveRow');
    };
    TableComponent.prototype._redraw = function (forceRender) {
        var _this = this;
        if (forceRender) {
            this.datagridElement.datatable(this.gridOptions);
        }
        else {
            setTimeout(function () {
                _this.callDataGridMethod('setColGroupWidths');
                _this.callDataGridMethod('addOrRemoveScroll');
            });
        }
    };
    TableComponent.prototype.invokeActionEvent = function ($event, expression) {
        var fn = $parseEvent(expression);
        fn(this.viewParent, Object.assign(this.context, { $event: $event }));
    };
    // change and blur events are added from the template
    TableComponent.prototype.handleEvent = function (node, eventName, callback, locals) {
        if (eventName !== 'select') {
            _super.prototype.handleEvent.call(this, this.nativeElement, eventName, callback, locals);
        }
    };
    TableComponent.prototype.triggerUploadEvent = function ($event, eventName, fieldName, row) {
        var params = { $event: $event, row: row };
        if (!this.columns[fieldName]) {
            return;
        }
        if (eventName === 'change') {
            params.newVal = $event.target.files;
            params.oldVal = this.columns[fieldName]._oldUploadVal;
            this.columns[fieldName]._oldUploadVal = params.newVal;
        }
        this.columns[fieldName].invokeEventCallback(eventName, params);
    };
    TableComponent.prototype.registerFormWidget = function () { };
    // Form control accessor methods. This will be used for table inside form
    TableComponent.prototype.writeValue = function () { };
    TableComponent.prototype.registerOnChange = function (fn) {
        this._onChange = fn;
    };
    TableComponent.prototype.registerOnTouched = function (fn) {
        this._onTouched = fn;
    };
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
    TableComponent.ctorParameters = function () { return [
        { type: Injector },
        { type: FormBuilder },
        { type: App },
        { type: DynamicComponentRefProvider },
        { type: undefined, decorators: [{ type: Attribute, args: ['dataset.bind',] }] },
        { type: undefined, decorators: [{ type: Attribute, args: ['datasource.bind',] }] },
        { type: undefined, decorators: [{ type: Attribute, args: ['readonlygrid',] }] },
        { type: NgZone }
    ]; };
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
    return TableComponent;
}(StylableComponent));
export { TableComponent };
export { ɵ0, ɵ1 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibGUuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2NvbW1vbi90YWJsZS90YWJsZS5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBb0IsU0FBUyxFQUFFLFNBQVMsRUFBRSxlQUFlLEVBQUUsWUFBWSxFQUFFLFVBQVUsRUFBRSxZQUFZLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBYSxTQUFTLEVBQUUsU0FBUyxFQUFFLGdCQUFnQixFQUFFLFdBQVcsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUNsTixPQUFPLEVBQXdCLFdBQVcsRUFBYSxNQUFNLGdCQUFnQixDQUFDO0FBRTlFLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFFL0IsT0FBTyxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsWUFBWSxFQUFFLFVBQVUsRUFBRSxlQUFlLEVBQUUsWUFBWSxFQUFlLGlCQUFpQixFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLDJCQUEyQixFQUFFLFdBQVcsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUU3TyxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDaEQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDL0QsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sb0NBQW9DLENBQUM7QUFDekUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUM5QyxPQUFPLEVBQUUsU0FBUyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDOUUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQzFELE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxjQUFjLEVBQUUsZ0JBQWdCLEVBQUUs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LEVBQUMsSUFBSSxFQUFFLGdCQUFnQixFQUFDOzZCQTBrQmxELFlBQVksU0FBQyxVQUFVLEVBQUUsQ0FBQyxRQUFRLENBQUM7O0lBKzJCeEMscUJBQUM7Q0FBQSxBQTM5Q0QsQ0FRb0MsaUJBQWlCLEdBbTlDcEQ7U0FuOUNZLGNBQWMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBZnRlckNvbnRlbnRJbml0LCBBdHRyaWJ1dGUsIENvbXBvbmVudCwgQ29udGVudENoaWxkcmVuLCBDb250ZW50Q2hpbGQsIEVsZW1lbnRSZWYsIEhvc3RMaXN0ZW5lciwgSW5qZWN0b3IsIE5nWm9uZSwgT25EZXN0cm95LCBRdWVyeUxpc3QsIFZpZXdDaGlsZCwgVmlld0NvbnRhaW5lclJlZiwgVGVtcGxhdGVSZWYgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IENvbnRyb2xWYWx1ZUFjY2Vzc29yLCBGb3JtQnVpbGRlciwgRm9ybUdyb3VwIH0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuXG5pbXBvcnQgeyBTdWJqZWN0IH0gZnJvbSAncnhqcyc7XG5cbmltcG9ydCB7ICRhcHBEaWdlc3QsICRwYXJzZUV2ZW50LCAkdW53YXRjaCwgJHdhdGNoLCBBcHAsIGNsb3NlUG9wb3ZlciwgRGF0YVNvdXJjZSwgZ2V0Q2xvbmVkT2JqZWN0LCBnZXRWYWxpZEpTT04sIElER2VuZXJhdG9yLCBpc0RhdGFTb3VyY2VFcXVhbCwgaXNEZWZpbmVkLCBpc01vYmlsZSwgdHJpZ2dlckZuLCBEeW5hbWljQ29tcG9uZW50UmVmUHJvdmlkZXIsIGV4dGVuZFByb3RvIH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5pbXBvcnQgeyBzdHlsZXIgfSBmcm9tICcuLi8uLi9mcmFtZXdvcmsvc3R5bGVyJztcbmltcG9ydCB7IFN0eWxhYmxlQ29tcG9uZW50IH0gZnJvbSAnLi4vYmFzZS9zdHlsYWJsZS5jb21wb25lbnQnO1xuaW1wb3J0IHsgUGFnaW5hdGlvbkNvbXBvbmVudCB9IGZyb20gJy4uL3BhZ2luYXRpb24vcGFnaW5hdGlvbi5jb21wb25lbnQnO1xuaW1wb3J0IHsgcmVnaXN0ZXJQcm9wcyB9IGZyb20gJy4vdGFibGUucHJvcHMnO1xuaW1wb3J0IHsgRURJVF9NT0RFLCBnZXRSb3dPcGVyYXRpb25zQ29sdW1uIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvbGl2ZS11dGlscyc7XG5pbXBvcnQgeyB0cmFuc2Zvcm1EYXRhIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvZGF0YS11dGlscyc7XG5pbXBvcnQgeyBnZXRDb25kaXRpb25hbENsYXNzZXMsIGdldE9yZGVyQnlFeHByLCBwcmVwYXJlRmllbGREZWZzLCBwcm92aWRlQXNOZ1ZhbHVlQWNjZXNzb3IsIHByb3ZpZGVBc1dpZGdldFJlZiB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL3dpZGdldC11dGlscyc7XG5cbmRlY2xhcmUgY29uc3QgXywgJDtcblxuY29uc3QgREVGQVVMVF9DTFMgPSAnYXBwLWdyaWQgYXBwLXBhbmVsIHBhbmVsJztcbmNvbnN0IFdJREdFVF9DT05GSUcgPSB7d2lkZ2V0VHlwZTogJ3dtLXRhYmxlJywgaG9zdENsYXNzOiBERUZBVUxUX0NMU307XG5cbmNvbnN0IGV4cG9ydEljb25NYXBwaW5nID0ge1xuICAgIEVYQ0VMOiAnZmEgZmEtZmlsZS1leGNlbC1vJyxcbiAgICBDU1Y6ICdmYSBmYS1maWxlLXRleHQtbydcbn07XG5cbmNvbnN0IFJPV19PUFNfRklFTEQgPSAncm93T3BlcmF0aW9ucyc7XG5cbmNvbnN0IG5vb3AgPSAoKSA9PiB7fTtcblxuY29uc3QgaXNJbnB1dEJvZHlXcmFwcGVyID0gdGFyZ2V0ID0+IHtcbiAgICBjb25zdCBjbGFzc2VzID0gWycuZHJvcGRvd24tbWVudScsICcudWliLXR5cGVhaGVhZC1tYXRjaCcsICcubW9kYWwtZGlhbG9nJywgJy50b2FzdCddO1xuICAgIGxldCBpc0lucHV0ID0gZmFsc2U7XG4gICAgY2xhc3Nlcy5mb3JFYWNoKGNscyA9PiB7XG4gICAgICAgIGlmICh0YXJnZXQuY2xvc2VzdChjbHMpLmxlbmd0aCkge1xuICAgICAgICAgICAgaXNJbnB1dCA9IHRydWU7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBjb25zdCBhdHRycyA9IFsnYnNkYXRlcGlja2VyZGF5ZGVjb3JhdG9yJ107XG4gICAgaWYgKCFpc0lucHV0KSB7XG4gICAgICAgIGF0dHJzLmZvckVhY2goYXR0ciA9PiB7XG4gICAgICAgICAgICBpZiAodGFyZ2V0WzBdLmhhc0F0dHJpYnV0ZShhdHRyKSkge1xuICAgICAgICAgICAgICAgIGlzSW5wdXQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiBpc0lucHV0O1xufTtcblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdbd21UYWJsZV0nLFxuICAgIHRlbXBsYXRlVXJsOiAnLi90YWJsZS5jb21wb25lbnQuaHRtbCcsXG4gICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIHByb3ZpZGVBc05nVmFsdWVBY2Nlc3NvcihUYWJsZUNvbXBvbmVudCksXG4gICAgICAgIHByb3ZpZGVBc1dpZGdldFJlZihUYWJsZUNvbXBvbmVudClcbiAgICBdXG59KVxuZXhwb3J0IGNsYXNzIFRhYmxlQ29tcG9uZW50IGV4dGVuZHMgU3R5bGFibGVDb21wb25lbnQgaW1wbGVtZW50cyBBZnRlckNvbnRlbnRJbml0LCBPbkRlc3Ryb3ksIENvbnRyb2xWYWx1ZUFjY2Vzc29yIHtcbiAgICBzdGF0aWMgaW5pdGlhbGl6ZVByb3BzID0gcmVnaXN0ZXJQcm9wcygpO1xuICAgIEBWaWV3Q2hpbGQoUGFnaW5hdGlvbkNvbXBvbmVudCkgZGF0YU5hdmlnYXRvcjtcblxuICAgIEBWaWV3Q2hpbGQoJ2RhdGFncmlkRWxlbWVudCcpIHByaXZhdGUgX3RhYmxlRWxlbWVudDogRWxlbWVudFJlZjtcblxuICAgIEBDb250ZW50Q2hpbGRyZW4oJ3Jvd0FjdGlvblRtcGwnKSByb3dBY3Rpb25UbXBsOiBRdWVyeUxpc3Q8YW55PjtcbiAgICBAVmlld0NoaWxkKCdyb3dBY3Rpb25zVmlldycsIHtyZWFkOiBWaWV3Q29udGFpbmVyUmVmfSkgcm93QWN0aW9uc1ZpZXdSZWY6IFZpZXdDb250YWluZXJSZWY7XG5cbiAgICBAQ29udGVudENoaWxkcmVuKCdmaWx0ZXJUbXBsJywge2Rlc2NlbmRhbnRzOiB0cnVlfSkgZmlsdGVyVG1wbDogUXVlcnlMaXN0PGFueT47XG4gICAgQFZpZXdDaGlsZCgnbXVsdGlDb2x1bW5GaWx0ZXJWaWV3Jywge3JlYWQ6IFZpZXdDb250YWluZXJSZWZ9KSBmaWx0ZXJWaWV3UmVmOiBWaWV3Q29udGFpbmVyUmVmO1xuXG4gICAgQENvbnRlbnRDaGlsZHJlbignaW5saW5lV2lkZ2V0VG1wbCcsIHtkZXNjZW5kYW50czogdHJ1ZX0pIGlubGluZVdpZGdldFRtcGw6IFF1ZXJ5TGlzdDxhbnk+O1xuICAgIEBWaWV3Q2hpbGQoJ2lubGluZUVkaXRWaWV3Jywge3JlYWQ6IFZpZXdDb250YWluZXJSZWZ9KSBpbmxpbmVFZGl0Vmlld1JlZjogVmlld0NvbnRhaW5lclJlZjtcblxuICAgIEBDb250ZW50Q2hpbGRyZW4oJ2lubGluZVdpZGdldFRtcGxOZXcnLCB7ZGVzY2VuZGFudHM6IHRydWV9KSBpbmxpbmVXaWRnZXROZXdUbXBsOiBRdWVyeUxpc3Q8YW55PjtcbiAgICBAVmlld0NoaWxkKCdpbmxpbmVFZGl0TmV3VmlldycsIHtyZWFkOiBWaWV3Q29udGFpbmVyUmVmfSkgaW5saW5lRWRpdE5ld1ZpZXdSZWY6IFZpZXdDb250YWluZXJSZWY7XG5cbiAgICBAQ29udGVudENoaWxkcmVuKCdjdXN0b21FeHByVG1wbCcsIHtkZXNjZW5kYW50czogdHJ1ZX0pIGN1c3RvbUV4cHJUbXBsOiBRdWVyeUxpc3Q8YW55PjtcbiAgICBAVmlld0NoaWxkKCdjdXN0b21FeHByVmlldycsIHtyZWFkOiBWaWV3Q29udGFpbmVyUmVmfSkgY3VzdG9tRXhwclZpZXdSZWY6IFZpZXdDb250YWluZXJSZWY7XG5cbiAgICBAQ29udGVudENoaWxkcmVuKCdyb3dFeHBhbnNpb25BY3Rpb25UbXBsJykgcm93RXhwYW5zaW9uQWN0aW9uVG1wbDogUXVlcnlMaXN0PGFueT47XG4gICAgQENvbnRlbnRDaGlsZCgncm93RXhwYW5zaW9uVG1wbCcpIHJvd0V4cGFuc2lvblRtcGw6IFRlbXBsYXRlUmVmPGFueT47XG4gICAgQFZpZXdDaGlsZCgncm93RGV0YWlsVmlldycsIHtyZWFkOiBWaWV3Q29udGFpbmVyUmVmfSkgcm93RGV0YWlsVmlld1JlZjogVmlld0NvbnRhaW5lclJlZjtcbiAgICBAVmlld0NoaWxkKCdyb3dFeHBhbnNpb25BY3Rpb25WaWV3Jywge3JlYWQ6IFZpZXdDb250YWluZXJSZWZ9KSByb3dFeHBhbnNpb25BY3Rpb25WaWV3UmVmOiBWaWV3Q29udGFpbmVyUmVmO1xuXG4gICAgQFZpZXdDaGlsZCgnZHluYW1pY1RhYmxlJywge3JlYWQ6IFZpZXdDb250YWluZXJSZWZ9KSBkeW5hbWljVGFibGVSZWY6IFZpZXdDb250YWluZXJSZWY7XG5cbiAgICBwcml2YXRlIHJvd0FjdGlvbnNDb21waWxlZFRsOiBhbnkgID0ge307XG4gICAgcHJpdmF0ZSByb3dGaWx0ZXJDb21wbGllZFRsOiBhbnkgPSB7fTtcbiAgICBwcml2YXRlIGlubGluZUNvbXBsaWVkVGw6IGFueSA9IHt9O1xuICAgIHByaXZhdGUgaW5saW5lTmV3Q29tcGxpZWRUbDogYW55ID0ge307XG4gICAgcHJpdmF0ZSBjdXN0b21FeHByQ29tcGlsZWRUbDogYW55ID0ge307XG4gICAgcHJpdmF0ZSByb3dEZWZJbnN0YW5jZXMgPSB7fTtcbiAgICBwcml2YXRlIHJvd0RlZk1hcCA9IHt9O1xuICAgIHByaXZhdGUgcm93RXhwYW5zaW9uQWN0aW9uVGw6IGFueSA9IHt9O1xuXG4gICAgY29sdW1ucyA9IHt9O1xuICAgIGZvcm1maWVsZHMgPSB7fTtcbiAgICBkYXRhZ3JpZEVsZW1lbnQ7XG4gICAgZGF0YXNvdXJjZTtcbiAgICBlZGl0bW9kZTtcbiAgICBlbmFibGVjb2x1bW5zZWxlY3Rpb247XG4gICAgZW5hYmxlc29ydCA9IHRydWU7XG4gICAgZmlsdGVybW9kZTtcbiAgICBzZWFyY2hsYWJlbDtcbiAgICBmb3JtcG9zaXRpb247XG4gICAgZ3JpZGNsYXNzO1xuICAgIGdyaWRmaXJzdHJvd3NlbGVjdDtcbiAgICBpY29uY2xhc3M7XG4gICAgaXNHcmlkRWRpdE1vZGU7XG4gICAgbG9hZGluZ2RhdGFtc2c7XG4gICAgbXVsdGlzZWxlY3Q7XG4gICAgbmFtZTtcbiAgICBuYXZpZ2F0aW9uO1xuICAgIG5hdmlnYXRpb25TaXplO1xuICAgIG5hdmlnYXRpb25hbGlnbjtcbiAgICBub2RhdGFtZXNzYWdlO1xuICAgIHBhZ2VzaXplO1xuICAgIHByZXZEYXRhO1xuICAgIHByaW1hcnlLZXk7XG4gICAgcmFkaW9zZWxlY3Q7XG4gICAgcm93Y2xhc3M7XG4gICAgcm93bmdjbGFzcztcbiAgICBzZWxlY3RlZEl0ZW1zID0gW107XG4gICAgc2hvd2hlYWRlcjtcbiAgICBzaG93cmVjb3JkY291bnQ7XG4gICAgc2hvd3Jvd2luZGV4O1xuICAgIHN1YmhlYWRpbmc7XG4gICAgdGl0bGU7XG4gICAgc2hvd25ld3JvdztcbiAgICBkZWxldGVva3RleHQ7XG4gICAgZGVsZXRlY2FuY2VsdGV4dDtcblxuICAgIHNlbGVjdGVkSXRlbUNoYW5nZSA9IG5ldyBTdWJqZWN0KCk7XG4gICAgc2VsZWN0ZWRJdGVtQ2hhbmdlJCA9IHRoaXMuc2VsZWN0ZWRJdGVtQ2hhbmdlLmFzT2JzZXJ2YWJsZSgpO1xuXG4gICAgYWN0aW9ucyA9IFtdO1xuICAgIF9hY3Rpb25zID0ge1xuICAgICAgICAnaGVhZGVyJzogW10sXG4gICAgICAgICdmb290ZXInOiBbXVxuICAgIH07XG4gICAgZXhwb3J0T3B0aW9ucyA9IFtdO1xuICAgIGV4cG9ydGRhdGFzaXplO1xuICAgIGZvcm1XaWRnZXRzO1xuICAgIGhlYWRlckNvbmZpZyA9IFtdO1xuICAgIGl0ZW1zID0gW107XG4gICAgbmF2Q29udHJvbHM7XG4gICAgcm93QWN0aW9ucyA9IFtdO1xuICAgIHNlbGVjdGVkQ29sdW1ucztcbiAgICBzaG93bmF2aWdhdGlvbiA9IGZhbHNlO1xuICAgIGRhdGFzZXQ7XG4gICAgX2xpdmVUYWJsZVBhcmVudDtcbiAgICBpc1BhcnRPZkxpdmVHcmlkO1xuICAgIGdyaWRFbGVtZW50O1xuICAgIGlzTW9iaWxlO1xuICAgIGlzTG9hZGluZztcbiAgICBkb2N1bWVudENsaWNrQmluZCA9IG5vb3A7XG5cbiAgICBmaWVsZERlZnMgPSBbXTtcbiAgICByb3dEZWY6IGFueSA9IHt9O1xuICAgIHJvd0luc3RhbmNlOiBhbnkgPSB7fTtcblxuICAgIHByaXZhdGUgZnVsbEZpZWxkRGVmcyA9IFtdO1xuICAgIHByaXZhdGUgX19mdWxsRGF0YTtcbiAgICBwcml2YXRlIGRhdGFOYXZpZ2F0b3JXYXRjaGVkO1xuICAgIHByaXZhdGUgbmF2aWdhdG9yUmVzdWx0V2F0Y2g7XG4gICAgcHJpdmF0ZSBuYXZpZ2F0b3JNYXhSZXN1bHRXYXRjaDtcbiAgICBwcml2YXRlIGZpbHRlckluZm87XG4gICAgcHJpdmF0ZSBzb3J0SW5mbztcbiAgICBwcml2YXRlIHNlcnZlckRhdGE7XG4gICAgcHJpdmF0ZSBmaWx0ZXJudWxscmVjb3JkcztcbiAgICBwcml2YXRlIHZhcmlhYmxlSW5mbGlnaHQ7XG4gICAgcHJpdmF0ZSBpc2R5bmFtaWN0YWJsZTtcbiAgICBwcml2YXRlIF9keW5hbWljQ29udGV4dDtcbiAgICBwcml2YXRlIG5vT2ZDb2x1bW5zO1xuXG4gICAgcHJpdmF0ZSBhcHBseVByb3BzID0gbmV3IE1hcCgpO1xuXG4gICAgcmVkcmF3ID0gXy5kZWJvdW5jZSh0aGlzLl9yZWRyYXcsIDE1MCk7XG4gICAgZGVib3VuY2VkSGFuZGxlTG9hZGluZyA9IF8uZGVib3VuY2UodGhpcy5oYW5kbGVMb2FkaW5nLCAzNTApO1xuXG4gICAgLy8gRmlsdGVyIGFuZCBTb3J0IE1ldGhvZHNcbiAgICByb3dGaWx0ZXI6IGFueSA9IHt9O1xuICAgIG1hdGNoTW9kZVR5cGVzTWFwO1xuICAgIG1hdGNoTW9kZU1zZ3M7XG4gICAgZW1wdHlNYXRjaE1vZGVzO1xuICAgIF9zZWFyY2hTb3J0SGFuZGxlciA9IG5vb3A7XG4gICAgc2VhcmNoU29ydEhhbmRsZXIgPSAoLi4uYXJncykgPT4geyB0aGlzLl9zZWFyY2hTb3J0SGFuZGxlci5hcHBseSh0aGlzLCBhcmdzKTsgfTtcbiAgICBfaXNQYWdlU2VhcmNoO1xuICAgIF9pc0NsaWVudFNlYXJjaDtcbiAgICBjaGVja0ZpbHRlcnNBcHBsaWVkOiBGdW5jdGlvbjtcbiAgICBnZXRTZWFyY2hSZXN1bHQ6IEZ1bmN0aW9uO1xuICAgIGdldFNvcnRSZXN1bHQ6IEZ1bmN0aW9uO1xuICAgIGdldEZpbHRlckZpZWxkczogRnVuY3Rpb247XG4gICAgb25Sb3dGaWx0ZXJDaGFuZ2UgPSBub29wO1xuICAgIG9uRmlsdGVyQ29uZGl0aW9uU2VsZWN0ID0gbm9vcDtcbiAgICBzaG93Q2xlYXJJY29uID0gbm9vcDtcbiAgICBjbGVhclJvd0ZpbHRlciA9IG5vb3A7XG4gICAgZ2V0TmF2aWdhdGlvblRhcmdldEJ5U29ydEluZm86IEZ1bmN0aW9uO1xuICAgIHJlZnJlc2hEYXRhOiBGdW5jdGlvbjtcbiAgICBjbGVhckZpbHRlcjogRnVuY3Rpb247XG5cbiAgICAvLyBJbmxpbmUgRWRpdFxuICAgIG5nZm9ybTogRm9ybUdyb3VwO1xuICAgIHVwZGF0ZVZhcmlhYmxlOiBGdW5jdGlvbjtcbiAgICB1cGRhdGVSZWNvcmQ6IEZ1bmN0aW9uO1xuICAgIGRlbGV0ZVJlY29yZDogRnVuY3Rpb247XG4gICAgaW5zZXJ0UmVjb3JkOiBGdW5jdGlvbjtcbiAgICBlZGl0Um93OiBGdW5jdGlvbjtcbiAgICBhZGROZXdSb3c6IEZ1bmN0aW9uO1xuICAgIGFkZFJvdzogRnVuY3Rpb247XG4gICAgZGVsZXRlUm93OiBGdW5jdGlvbjtcbiAgICBvblJlY29yZERlbGV0ZTogRnVuY3Rpb247XG4gICAgaW5pdGlhdGVTZWxlY3RJdGVtOiBGdW5jdGlvbjtcbiAgICBoaWRlRWRpdFJvdzogRnVuY3Rpb247XG4gICAgc2F2ZVJvdzogRnVuY3Rpb247XG4gICAgY2FuY2VsUm93OiBGdW5jdGlvbjtcblxuICAgIHByaXZhdGUgZ3JpZE9wdGlvbnMgPSB7XG4gICAgICAgIGRhdGE6IFtdLFxuICAgICAgICBjb2xEZWZzOiBbXSxcbiAgICAgICAgc3RhcnRSb3dJbmRleDogMSxcbiAgICAgICAgc29ydEluZm86IHtcbiAgICAgICAgICAgIGZpZWxkOiAnJyxcbiAgICAgICAgICAgIGRpcmVjdGlvbjogJydcbiAgICAgICAgfSxcbiAgICAgICAgZmlsdGVybW9kZTogJycsXG4gICAgICAgIHNlYXJjaExhYmVsOiAnJyxcbiAgICAgICAgcm93QWN0aW9uczogW10sXG4gICAgICAgIGhlYWRlckNvbmZpZzogW10sXG4gICAgICAgIHJvd0NsYXNzOiAnJyxcbiAgICAgICAgZWRpdG1vZGU6ICcnLFxuICAgICAgICBmb3JtUG9zaXRpb246ICcnLFxuICAgICAgICBpc01vYmlsZTogZmFsc2UsXG4gICAgICAgIHJvd0V4cGFuc2lvbkVuYWJsZWQ6IGZhbHNlLFxuICAgICAgICByb3dEZWY6IHtcbiAgICAgICAgICAgIHBvc2l0aW9uOiAnMCdcbiAgICAgICAgfSxcbiAgICAgICAgbmFtZTogJycsXG4gICAgICAgIG1lc3NhZ2VzOiB7XG4gICAgICAgICAgICBzZWxlY3RGaWVsZDogJ1NlbGVjdCBGaWVsZCdcbiAgICAgICAgfSxcbiAgICAgICAgb25EYXRhUmVuZGVyOiAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLm5nWm9uZS5ydW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmdyaWREYXRhLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmludm9rZUV2ZW50Q2FsbGJhY2soJ2RhdGFyZW5kZXInLCB7JGRhdGE6IHRoaXMuZ3JpZERhdGEsIGRhdGE6IHRoaXMuZ3JpZERhdGF9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gc2VsZWN0IHJvd3Mgc2VsZWN0ZWQgaW4gcHJldmlvdXMgcGFnZXMuIChOb3QgZmluZGluZyBpbnRlcnNlY3Rpb24gb2YgZGF0YSBhbmQgc2VsZWN0ZWRpdGVtcyBhcyBpdCB3aWxsIGJlIGhlYXZ5KVxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5tdWx0aXNlbGVjdCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLml0ZW1zLmxlbmd0aCA9IDA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuY2FsbERhdGFHcmlkTWV0aG9kKCdzZWxlY3RSb3dzJywgdGhpcy5pdGVtcyk7XG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZEl0ZW1zID0gdGhpcy5jYWxsRGF0YUdyaWRNZXRob2QoJ2dldFNlbGVjdGVkUm93cycpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRJdGVtQ2hhbmdlLm5leHQodGhpcy5zZWxlY3RlZEl0ZW1zKTtcbiAgICAgICAgICAgICAgICAvLyBPbiByZW5kZXIsIGFwcGx5IHRoZSBmaWx0ZXJzIHNldCBmb3IgcXVlcnkgc2VydmljZSB2YXJpYWJsZVxuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9pc1BhZ2VTZWFyY2ggJiYgdGhpcy5maWx0ZXJJbmZvKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2VhcmNoU29ydEhhbmRsZXIodGhpcy5maWx0ZXJJbmZvLCB1bmRlZmluZWQsICdzZWFyY2gnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgb25Sb3dTZWxlY3Q6IChyb3csIGUpID0+IHtcbiAgICAgICAgICAgIHRoaXMubmdab25lLnJ1bigoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZWxlY3RlZEl0ZW1zID0gdGhpcy5jYWxsRGF0YUdyaWRNZXRob2QoJ2dldFNlbGVjdGVkUm93cycpO1xuICAgICAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRJdGVtQ2hhbmdlLm5leHQodGhpcy5zZWxlY3RlZEl0ZW1zKTtcbiAgICAgICAgICAgICAgICBjb25zdCByb3dEYXRhID0gdGhpcy5hZGRSb3dJbmRleChyb3cpO1xuICAgICAgICAgICAgICAgIHRoaXMuaW52b2tlRXZlbnRDYWxsYmFjaygncm93c2VsZWN0JywgeyRkYXRhOiByb3dEYXRhLCAkZXZlbnQ6IGUsIHJvdzogcm93RGF0YX0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIC8vIGFzc2lnbnMgdGhlIGl0ZW1zIG9uIGNhcHR1cmUgcGhhc2Ugb2YgdGhlIGNsaWNrIGhhbmRsZXIuXG4gICAgICAgIGFzc2lnblNlbGVjdGVkSXRlbXM6IChyb3csIGUpID0+IHtcbiAgICAgICAgICAgIHRoaXMubmdab25lLnJ1bigoKSA9PiB7XG4gICAgICAgICAgICAgICAgLypcbiAgICAgICAgICAgICAgICAgKiBpbiBjYXNlIG9mIHNpbmdsZSBzZWxlY3QsIHVwZGF0ZSB0aGUgaXRlbXMgd2l0aCBvdXQgY2hhbmdpbmcgdGhlIHJlZmVyZW5jZS5cbiAgICAgICAgICAgICAgICAgKiBmb3IgbXVsdGkgc2VsZWN0LCBrZWVwIG9sZCBzZWxlY3RlZCBpdGVtcyBpbiB0YWN0XG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubXVsdGlzZWxlY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKF8uZmluZEluZGV4KHRoaXMuaXRlbXMsIHJvdykgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLml0ZW1zLnB1c2gocm93KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXRlbXMubGVuZ3RoID0gMDtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pdGVtcy5wdXNoKHJvdyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIG9uUm93RGJsQ2xpY2s6IChyb3csIGUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHJvd0RhdGEgPSB0aGlzLmFkZFJvd0luZGV4KHJvdyk7XG4gICAgICAgICAgICB0aGlzLmludm9rZUV2ZW50Q2FsbGJhY2soJ3Jvd2RibGNsaWNrJywgeyRkYXRhOiByb3dEYXRhLCAkZXZlbnQ6IGUsIHJvdzogcm93RGF0YX0pO1xuICAgICAgICB9LFxuICAgICAgICBvblJvd0Rlc2VsZWN0OiAocm93LCBlKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5tdWx0aXNlbGVjdCkge1xuICAgICAgICAgICAgICAgIHRoaXMubmdab25lLnJ1bigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaXRlbXMgPSBfLnB1bGxBbGxXaXRoKHRoaXMuaXRlbXMsIFtyb3ddLCBfLmlzRXF1YWwpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNlbGVjdGVkSXRlbXMgPSB0aGlzLmNhbGxEYXRhR3JpZE1ldGhvZCgnZ2V0U2VsZWN0ZWRSb3dzJyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW52b2tlRXZlbnRDYWxsYmFjaygncm93ZGVzZWxlY3QnLCB7JGRhdGE6IHJvdywgJGV2ZW50OiBlLCByb3d9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgY2FsbE9uUm93RGVzZWxlY3RFdmVudDogKHJvdywgZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdyb3dkZXNlbGVjdCcsIHskZGF0YTogcm93LCAkZXZlbnQ6IGUsIHJvd30pO1xuICAgICAgICB9LFxuICAgICAgICBjYWxsT25Sb3dDbGlja0V2ZW50OiAocm93LCBlKSA9PiB7XG4gICAgICAgICAgICAvLyBDYWxsIHJvdyBjbGljayBvbmx5IGlmIGNsaWNrIGlzIHRyaWdnZXJlZCBieSB1c2VyXG4gICAgICAgICAgICBpZiAoZSAmJiBlLmhhc093blByb3BlcnR5KCdvcmlnaW5hbEV2ZW50JykpIHtcbiAgICAgICAgICAgICAgICBjb25zdCByb3dEYXRhID0gdGhpcy5hZGRSb3dJbmRleChyb3cpO1xuICAgICAgICAgICAgICAgIHRoaXMuaW52b2tlRXZlbnRDYWxsYmFjaygncm93Y2xpY2snLCB7JGRhdGE6IHJvd0RhdGEsICRldmVudDogZSwgcm93OiByb3dEYXRhfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGNsb3NlUG9wb3ZlcjogY2xvc2VQb3BvdmVyLFxuICAgICAgICBvbkNvbHVtblNlbGVjdDogKGNvbCwgZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZENvbHVtbnMgPSB0aGlzLmNhbGxEYXRhR3JpZE1ldGhvZCgnZ2V0U2VsZWN0ZWRDb2x1bW5zJyk7XG4gICAgICAgICAgICB0aGlzLmludm9rZUV2ZW50Q2FsbGJhY2soJ2NvbHVtbnNlbGVjdCcsIHskZGF0YTogY29sLCAkZXZlbnQ6IGV9KTtcbiAgICAgICAgfSxcbiAgICAgICAgb25Db2x1bW5EZXNlbGVjdDogKGNvbCwgZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZENvbHVtbnMgPSB0aGlzLmNhbGxEYXRhR3JpZE1ldGhvZCgnZ2V0U2VsZWN0ZWRDb2x1bW5zJyk7XG4gICAgICAgICAgICB0aGlzLmludm9rZUV2ZW50Q2FsbGJhY2soJ2NvbHVtbmRlc2VsZWN0JywgeyRkYXRhOiBjb2wsICRldmVudDogZX0pO1xuICAgICAgICB9LFxuICAgICAgICBvbkhlYWRlckNsaWNrOiAoY29sLCBlKSA9PiB7XG4gICAgICAgICAgICAvLyBpZiBvblNvcnQgZnVuY3Rpb24gaXMgcmVnaXN0ZXJlZCBpbnZva2UgaXQgd2hlbiB0aGUgY29sdW1uIGhlYWRlciBpcyBjbGlja2VkXG4gICAgICAgICAgICB0aGlzLmludm9rZUV2ZW50Q2FsbGJhY2soJ2hlYWRlcmNsaWNrJywgeyRldmVudDogZSwgJGRhdGE6IGNvbCwgY29sdW1uOiBjb2x9KTtcbiAgICAgICAgfSxcbiAgICAgICAgb25Sb3dEZWxldGU6IChyb3csIGNhbmNlbFJvd0RlbGV0ZUNhbGxiYWNrLCBlLCBjYWxsQmFjaywgb3B0aW9ucykgPT4ge1xuICAgICAgICAgICAgdGhpcy5uZ1pvbmUucnVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmRlbGV0ZVJlY29yZChfLmV4dGVuZCh7fSwgb3B0aW9ucywge3JvdywgJ2NhbmNlbFJvd0RlbGV0ZUNhbGxiYWNrJzogY2FuY2VsUm93RGVsZXRlQ2FsbGJhY2ssICdldnQnOiBlLCAnY2FsbEJhY2snOiBjYWxsQmFja30pKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBvblJvd0luc2VydDogKHJvdywgZSwgY2FsbEJhY2ssIG9wdGlvbnMpID0+IHtcbiAgICAgICAgICAgIHRoaXMuaW5zZXJ0UmVjb3JkKF8uZXh0ZW5kKHt9LCBvcHRpb25zLCB7cm93LCBldmVudDogZSwgJ2NhbGxCYWNrJzogY2FsbEJhY2t9KSk7XG4gICAgICAgIH0sXG4gICAgICAgIGJlZm9yZVJvd1VwZGF0ZTogKHJvdywgZXZlbnROYW1lPykgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMuX2xpdmVUYWJsZVBhcmVudCkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2xpdmVUYWJsZVBhcmVudC51cGRhdGVSb3cocm93LCBldmVudE5hbWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5wcmV2RGF0YSA9IGdldENsb25lZE9iamVjdChyb3cpO1xuICAgICAgICB9LFxuICAgICAgICBhZnRlclJvd1VwZGF0ZTogKHJvdywgZSwgY2FsbEJhY2ssIG9wdGlvbnMpID0+IHtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlUmVjb3JkKF8uZXh0ZW5kKHt9LCBvcHRpb25zLCB7cm93LCAncHJldkRhdGEnOiB0aGlzLnByZXZEYXRhLCAnZXZlbnQnOiBlLCAnY2FsbEJhY2snOiBjYWxsQmFja30pKTtcbiAgICAgICAgfSxcbiAgICAgICAgb25CZWZvcmVSb3dVcGRhdGU6IChyb3csIGUsIG9wdGlvbnMpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmludm9rZUV2ZW50Q2FsbGJhY2soJ2JlZm9yZXJvd3VwZGF0ZScsIHskZXZlbnQ6IGUsICRkYXRhOiByb3csIHJvdywgb3B0aW9uczogb3B0aW9uc30pO1xuICAgICAgICB9LFxuICAgICAgICBvbkJlZm9yZVJvd0luc2VydDogKHJvdywgZSwgb3B0aW9ucykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaW52b2tlRXZlbnRDYWxsYmFjaygnYmVmb3Jlcm93aW5zZXJ0JywgeyRldmVudDogZSwgJGRhdGE6IHJvdywgcm93LCBvcHRpb25zOiBvcHRpb25zfSk7XG4gICAgICAgIH0sXG4gICAgICAgIG9uQmVmb3JlUm93RGVsZXRlOiAocm93LCBlLCBvcHRpb25zKSA9PiB7XG4gICAgICAgICAgICBjb25zdCByb3dEYXRhID0gdGhpcy5hZGRSb3dJbmRleChyb3cpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaW52b2tlRXZlbnRDYWxsYmFjaygnYmVmb3Jlcm93ZGVsZXRlJywgeyRldmVudDogZSwgcm93OiByb3dEYXRhLCBvcHRpb25zOiBvcHRpb25zfSk7XG4gICAgICAgIH0sXG4gICAgICAgIG9uRm9ybVJlbmRlcjogKCRyb3csIGUsIG9wZXJhdGlvbiwgYWx3YXlzTmV3Um93KSA9PiB7XG4gICAgICAgICAgICBjb25zdCB3aWRnZXQgPSBhbHdheXNOZXdSb3cgPyAnaW5saW5lSW5zdGFuY2VOZXcnIDogJ2lubGluZUluc3RhbmNlJztcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuZm9ybVdpZGdldHMgPSB7fTtcbiAgICAgICAgICAgICAgICB0aGlzLmZpZWxkRGVmcy5mb3JFYWNoKGNvbCA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb2xbd2lkZ2V0XSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5mb3JtV2lkZ2V0c1tjb2wuZmllbGRdID0gY29sW3dpZGdldF07XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNldERpc2FibGVkT25GaWVsZChvcGVyYXRpb24sIGNvbCwgd2lkZ2V0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHRoaXMuaW52b2tlRXZlbnRDYWxsYmFjaygnZm9ybXJlbmRlcicsIHskZXZlbnQ6IGUsIGZvcm1XaWRnZXRzOiB0aGlzLmZvcm1XaWRnZXRzLCAkb3BlcmF0aW9uOiBvcGVyYXRpb259KTtcbiAgICAgICAgICAgIH0sIDI1MCk7XG4gICAgICAgIH0sXG4gICAgICAgIG9uQmVmb3JlRm9ybVJlbmRlcjogKHJvdywgZSwgb3BlcmF0aW9uKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdiZWZvcmVmb3JtcmVuZGVyJywgeyRldmVudDogZSwgcm93LCAkb3BlcmF0aW9uOiBvcGVyYXRpb259KTtcbiAgICAgICAgfSxcbiAgICAgICAgcmVnaXN0ZXJSb3dOZ0NsYXNzV2F0Y2hlcjogKHJvd0RhdGEsIGluZGV4KSA9PiB7XG4gICAgICAgICAgICBpZiAoIXRoaXMucm93bmdjbGFzcykge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHJvdyA9IHRoaXMuZ2V0Q2xvbmVkUm93T2JqZWN0KHJvd0RhdGEpO1xuICAgICAgICAgICAgY29uc3Qgd2F0Y2hOYW1lID0gYCR7dGhpcy53aWRnZXRJZH1fcm93TmdDbGFzc18ke2luZGV4fWA7XG4gICAgICAgICAgICAkdW53YXRjaCh3YXRjaE5hbWUpO1xuICAgICAgICAgICAgdGhpcy5yZWdpc3RlckRlc3Ryb3lMaXN0ZW5lcigkd2F0Y2godGhpcy5yb3duZ2NsYXNzLCB0aGlzLnZpZXdQYXJlbnQsIHtyb3d9LCAobnYsIG92KSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5jYWxsRGF0YUdyaWRNZXRob2QoJ2FwcGx5Um93TmdDbGFzcycsIGdldENvbmRpdGlvbmFsQ2xhc3Nlcyhudiwgb3YpLCBpbmRleCk7XG4gICAgICAgICAgICB9LCB3YXRjaE5hbWUpKTtcbiAgICAgICAgfSxcbiAgICAgICAgcmVnaXN0ZXJDb2xOZ0NsYXNzV2F0Y2hlcjogKHJvd0RhdGEsIGNvbERlZiwgcm93SW5kZXgsIGNvbEluZGV4KSA9PiB7XG4gICAgICAgICAgICBpZiAoIWNvbERlZlsnY29sLW5nLWNsYXNzJ10pIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCByb3cgPSB0aGlzLmdldENsb25lZFJvd09iamVjdChyb3dEYXRhKTtcbiAgICAgICAgICAgIGNvbnN0IHdhdGNoTmFtZSA9IGAke3RoaXMud2lkZ2V0SWR9X2NvbE5nQ2xhc3NfJHtyb3dJbmRleH1fJHtjb2xJbmRleH1gO1xuICAgICAgICAgICAgJHVud2F0Y2god2F0Y2hOYW1lKTtcbiAgICAgICAgICAgIHRoaXMucmVnaXN0ZXJEZXN0cm95TGlzdGVuZXIoJHdhdGNoKGNvbERlZlsnY29sLW5nLWNsYXNzJ10sIHRoaXMudmlld1BhcmVudCwge3Jvd30sIChudiwgb3YpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmNhbGxEYXRhR3JpZE1ldGhvZCgnYXBwbHlDb2xOZ0NsYXNzJywgZ2V0Q29uZGl0aW9uYWxDbGFzc2VzKG52LCBvdiksIHJvd0luZGV4LCBjb2xJbmRleCk7XG4gICAgICAgICAgICB9LCB3YXRjaE5hbWUpKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2xlYXJDdXN0b21FeHByZXNzaW9uOiAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmN1c3RvbUV4cHJWaWV3UmVmLmNsZWFyKCk7XG4gICAgICAgICAgICB0aGlzLmN1c3RvbUV4cHJDb21waWxlZFRsID0ge307XG4gICAgICAgIH0sXG4gICAgICAgIGNsZWFyUm93RGV0YWlsRXhwcmVzc2lvbjogKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5yb3dEZXRhaWxWaWV3UmVmLmNsZWFyKCk7XG4gICAgICAgICAgICB0aGlzLnJvd0RlZk1hcCA9IHt9O1xuICAgICAgICAgICAgdGhpcy5yb3dEZWZJbnN0YW5jZXMgPSB7fTtcbiAgICAgICAgfSxcbiAgICAgICAgZ2VuZXJhdGVDdXN0b21FeHByZXNzaW9uczogKHJvd0RhdGEsIGluZGV4KSA9PiB7XG4gICAgICAgICAgICBjb25zdCByb3cgPSB0aGlzLmdldENsb25lZFJvd09iamVjdChyb3dEYXRhKTtcbiAgICAgICAgICAgIGNvbnN0IGNvbXBpbGVUZW1wbGF0ZSA9ICh0bXBsKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCF0bXBsKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3QgY29sRGVmID0ge307XG4gICAgICAgICAgICAgICAgY29uc3QgY29udGV4dCA9IHtcbiAgICAgICAgICAgICAgICAgICAgcm93LFxuICAgICAgICAgICAgICAgICAgICBjb2xEZWZcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHRoaXMuYWRkRXZlbnRzVG9Db250ZXh0KGNvbnRleHQpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGN1c3RvbUV4cHJWaWV3ID0gdGhpcy5jdXN0b21FeHByVmlld1JlZi5jcmVhdGVFbWJlZGRlZFZpZXcodG1wbCwgY29udGV4dCk7XG4gICAgICAgICAgICAgICAgY29uc3Qgcm9vdE5vZGUgPSBjdXN0b21FeHByVmlldy5yb290Tm9kZXNbMF07XG4gICAgICAgICAgICAgICAgY29uc3QgZmllbGROYW1lID0gcm9vdE5vZGUuZ2V0QXR0cmlidXRlKCdkYXRhLWNvbC1pZGVudGlmaWVyJyk7XG4gICAgICAgICAgICAgICAgXy5leHRlbmQoY29sRGVmLCB0aGlzLmNvbHVtbnNbZmllbGROYW1lXSk7XG4gICAgICAgICAgICAgICAgdGhpcy5jdXN0b21FeHByQ29tcGlsZWRUbFtmaWVsZE5hbWUgKyBpbmRleF0gPSByb290Tm9kZTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBpZiAodGhpcy5pc2R5bmFtaWN0YWJsZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZmllbGREZWZzLmZvckVhY2goY29sID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29tcGlsZVRlbXBsYXRlKGNvbC5jdXN0b21FeHByVG1wbCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gRm9yIGFsbCB0aGUgY29sdW1ucyBpbnNpZGUgdGhlIHRhYmxlLCBnZW5lcmF0ZSB0aGUgY3VzdG9tIGV4cHJlc3Npb25cbiAgICAgICAgICAgIHRoaXMuY3VzdG9tRXhwclRtcGwuZm9yRWFjaChjb21waWxlVGVtcGxhdGUuYmluZCh0aGlzKSk7XG4gICAgICAgIH0sXG4gICAgICAgIGdlbmVyYXRlUm93RXhwYW5zaW9uQ2VsbDogKHJvd0RhdGEsIGluZGV4KSA9PiB7XG4gICAgICAgICAgICBjb25zdCByb3cgPSB0aGlzLmdldENsb25lZFJvd09iamVjdChyb3dEYXRhKTtcbiAgICAgICAgICAgIC8vIEZvciBhbGwgdGhlIGNvbHVtbnMgaW5zaWRlIHRoZSB0YWJsZSwgZ2VuZXJhdGUgdGhlIGlubGluZSB3aWRnZXRcbiAgICAgICAgICAgIHRoaXMucm93RXhwYW5zaW9uQWN0aW9uVG1wbC5mb3JFYWNoKCh0bXBsKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5yb3dFeHBhbnNpb25BY3Rpb25UbFtpbmRleF0gPSB0aGlzLnJvd0V4cGFuc2lvbkFjdGlvblZpZXdSZWYuY3JlYXRlRW1iZWRkZWRWaWV3KHRtcGwsIHtyb3d9KS5yb290Tm9kZXM7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgZ2V0Um93RXhwYW5zaW9uQWN0aW9uOiAoaW5kZXgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnJvd0V4cGFuc2lvbkFjdGlvblRsW2luZGV4XTtcbiAgICAgICAgfSxcbiAgICAgICAgZ2VuZXJhdGVSb3dEZXRhaWxWaWV3OiAoJGV2ZW50LCByb3dEYXRhLCByb3dJZCwgJHRhcmdldCwgJG92ZXJsYXksIGNhbGxiYWNrKSA9PiB7XG4gICAgICAgICAgICBjb25zdCByb3cgPSB0aGlzLmdldENsb25lZFJvd09iamVjdChyb3dEYXRhKTtcbiAgICAgICAgICAgIGNvbnN0IHJvd0RlZiA9IGdldENsb25lZE9iamVjdCh0aGlzLnJvd0RlZik7XG4gICAgICAgICAgICBpZiAodGhpcy5yb3dJbnN0YW5jZS5pbnZva2VFdmVudENhbGxiYWNrKCdiZWZvcmVyb3dleHBhbmQnLCB7JGV2ZW50LCAkZGF0YTogcm93RGVmLCByb3d9KSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIXJvd0RlZi5jb250ZW50KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gRXhwYW5kIHRoZSByb3cgZGV0YWlsXG4gICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgLy8gUm93IGlzIGFscmVhZHkgcmVuZGVyZWQuIFJldHVybiBoZXJlXG4gICAgICAgICAgICBpZiAodGhpcy5yb3dEZWZNYXBbcm93SWRdICYmIHRoaXMucm93RGVmTWFwW3Jvd0lkXS5jb250ZW50ID09PSByb3dEZWYuY29udGVudCkge1xuICAgICAgICAgICAgICAgIHRoaXMucm93SW5zdGFuY2UuaW52b2tlRXZlbnRDYWxsYmFjaygncm93ZXhwYW5kJywgeyRldmVudCwgcm93LCAkZGF0YTogdGhpcy5yb3dEZWZJbnN0YW5jZXNbcm93SWRdfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5yb3dEZWZNYXBbcm93SWRdID0gcm93RGVmO1xuICAgICAgICAgICAgJHRhcmdldC5lbXB0eSgpO1xuICAgICAgICAgICAgJHRhcmdldC5oaWRlKCk7XG4gICAgICAgICAgICAkb3ZlcmxheS5zaG93KCk7XG4gICAgICAgICAgICBjb25zdCBjb250ZXh0ID0ge1xuICAgICAgICAgICAgICAgICAgICByb3csXG4gICAgICAgICAgICAgICAgICAgIHJvd0RlZixcbiAgICAgICAgICAgICAgICAgICAgY29udGFpbmVyTG9hZDogKHdpZGdldCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJG92ZXJsYXkuaGlkZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICR0YXJnZXQuc2hvdygpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucm93RGVmSW5zdGFuY2VzW3Jvd0lkXSA9IHdpZGdldDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJvd0luc3RhbmNlLmludm9rZUV2ZW50Q2FsbGJhY2soJ3Jvd2V4cGFuZCcsIHskZXZlbnQsIHJvdywgJGRhdGE6IHdpZGdldH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwgNTAwKTtcbiAgICAgICAgICAgICAgICAgICAgfX07XG4gICAgICAgICAgICBjb25zdCByb290Tm9kZSA9IHRoaXMucm93RGV0YWlsVmlld1JlZi5jcmVhdGVFbWJlZGRlZFZpZXcodGhpcy5yb3dFeHBhbnNpb25UbXBsLCBjb250ZXh0KS5yb290Tm9kZXNbMF07XG4gICAgICAgICAgICAkdGFyZ2V0WzBdLmFwcGVuZENoaWxkKHJvb3ROb2RlKTtcbiAgICAgICAgICAgICRhcHBEaWdlc3QoKTtcbiAgICAgICAgfSxcbiAgICAgICAgb25CZWZvcmVSb3dDb2xsYXBzZTogKCRldmVudCwgcm93LCByb3dJZCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucm93SW5zdGFuY2UuaW52b2tlRXZlbnRDYWxsYmFjaygnYmVmb3Jlcm93Y29sbGFwc2UnLCB7JGV2ZW50LCByb3csICRkYXRhOiB0aGlzLnJvd0RlZkluc3RhbmNlc1tyb3dJZF19KTtcbiAgICAgICAgfSxcbiAgICAgICAgb25Sb3dDb2xsYXBzZTogKCRldmVudCwgcm93KSA9PiB7XG4gICAgICAgICAgICB0aGlzLnJvd0luc3RhbmNlLmludm9rZUV2ZW50Q2FsbGJhY2soJ3Jvd2NvbGxhcHNlJywgeyRldmVudCwgcm93fSk7XG4gICAgICAgIH0sXG4gICAgICAgIGdldEN1c3RvbUV4cHJlc3Npb246IChmaWVsZE5hbWUsIGluZGV4KSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jdXN0b21FeHByQ29tcGlsZWRUbFtmaWVsZE5hbWUgKyBpbmRleF0gfHwgJyc7XG4gICAgICAgIH0sXG4gICAgICAgIGNsZWFyUm93QWN0aW9uczogKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5yb3dBY3Rpb25zVmlld1JlZi5jbGVhcigpO1xuICAgICAgICAgICAgdGhpcy5yb3dBY3Rpb25zQ29tcGlsZWRUbCA9IHt9O1xuICAgICAgICAgICAgdGhpcy5yb3dFeHBhbnNpb25BY3Rpb25WaWV3UmVmLmNsZWFyKCk7XG4gICAgICAgICAgICB0aGlzLnJvd0V4cGFuc2lvbkFjdGlvblRsID0ge307XG4gICAgICAgIH0sXG4gICAgICAgIGdlbmVyYXRlUm93QWN0aW9uczogKHJvd0RhdGEsIGluZGV4KSA9PiB7XG4gICAgICAgICAgICBjb25zdCByb3cgPSB0aGlzLmdldENsb25lZFJvd09iamVjdChyb3dEYXRhKTtcbiAgICAgICAgICAgIHRoaXMucm93QWN0aW9uc0NvbXBpbGVkVGxbaW5kZXhdID0gW107XG4gICAgICAgICAgICAvLyBGb3IgYWxsIHRoZSBjb2x1bW5zIGluc2lkZSB0aGUgdGFibGUsIGdlbmVyYXRlIHRoZSBpbmxpbmUgd2lkZ2V0XG4gICAgICAgICAgICB0aGlzLnJvd0FjdGlvblRtcGwuZm9yRWFjaCgodG1wbCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMucm93QWN0aW9uc0NvbXBpbGVkVGxbaW5kZXhdLnB1c2goLi4udGhpcy5yb3dBY3Rpb25zVmlld1JlZi5jcmVhdGVFbWJlZGRlZFZpZXcodG1wbCwge3Jvd30pLnJvb3ROb2Rlcyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgZ2V0Um93QWN0aW9uOiAoaW5kZXgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnJvd0FjdGlvbnNDb21waWxlZFRsW2luZGV4XTtcbiAgICAgICAgfSxcbiAgICAgICAgZ2VuZXJhdGVJbmxpbmVFZGl0Um93OiAocm93RGF0YSwgYWx3YXlzTmV3Um93KSA9PiB7XG4gICAgICAgICAgICBjb25zdCByb3cgPSB0aGlzLmdldENsb25lZFJvd09iamVjdChyb3dEYXRhKTtcbiAgICAgICAgICAgIGlmIChhbHdheXNOZXdSb3cpIHtcbiAgICAgICAgICAgICAgICAvLyBDbGVhciB0aGUgdmlldyBjb250YWluZXIgcmVmXG4gICAgICAgICAgICAgICAgdGhpcy5pbmxpbmVFZGl0TmV3Vmlld1JlZi5jbGVhcigpO1xuICAgICAgICAgICAgICAgIHRoaXMuaW5saW5lTmV3Q29tcGxpZWRUbCA9IHt9O1xuICAgICAgICAgICAgICAgIC8vIEZvciBhbGwgdGhlIGNvbHVtbnMgaW5zaWRlIHRoZSB0YWJsZSwgZ2VuZXJhdGUgdGhlIGlubGluZSB3aWRnZXRcbiAgICAgICAgICAgICAgICB0aGlzLmlubGluZVdpZGdldE5ld1RtcGwuZm9yRWFjaCh0bXBsID0+IHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGZpZWxkTmFtZTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29udGV4dCA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvdyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGdldENvbnRyb2w6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5uZ2Zvcm0uY29udHJvbHNbZmllbGROYW1lICsgJ19uZXcnXSB8fCB7fTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBnZXRWYWxpZGF0aW9uTWVzc2FnZTogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbHVtbnNbZmllbGROYW1lXSAmJiB0aGlzLmNvbHVtbnNbZmllbGROYW1lXS52YWxpZGF0aW9ubWVzc2FnZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLmlubGluZUVkaXROZXdWaWV3UmVmLmNyZWF0ZUVtYmVkZGVkVmlldyh0bXBsLCBjb250ZXh0KS5yb290Tm9kZXNbMF07XG4gICAgICAgICAgICAgICAgICAgIGZpZWxkTmFtZSA9IHJvb3ROb2RlLmdldEF0dHJpYnV0ZSgnZGF0YS1jb2wtaWRlbnRpZmllcicpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmlubGluZU5ld0NvbXBsaWVkVGxbZmllbGROYW1lXSA9IHJvb3ROb2RlO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJGb3JtKHRydWUpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIENsZWFyIHRoZSB2aWV3IGNvbnRhaW5lciByZWZcbiAgICAgICAgICAgIHRoaXMuaW5saW5lRWRpdFZpZXdSZWYuY2xlYXIoKTtcbiAgICAgICAgICAgIHRoaXMuaW5saW5lQ29tcGxpZWRUbCA9IHt9O1xuICAgICAgICAgICAgdGhpcy5jbGVhckZvcm0oKTtcbiAgICAgICAgICAgIC8vIEZvciBhbGwgdGhlIGNvbHVtbnMgaW5zaWRlIHRoZSB0YWJsZSwgZ2VuZXJhdGUgdGhlIGlubGluZSB3aWRnZXRcbiAgICAgICAgICAgIHRoaXMuaW5saW5lV2lkZ2V0VG1wbC5mb3JFYWNoKHRtcGwgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBmaWVsZE5hbWU7XG4gICAgICAgICAgICAgICAgY29uc3QgY29udGV4dCA9IHtcbiAgICAgICAgICAgICAgICAgICAgcm93LFxuICAgICAgICAgICAgICAgICAgICBnZXRDb250cm9sOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5uZ2Zvcm0uY29udHJvbHNbZmllbGROYW1lXSB8fCB7fTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgZ2V0VmFsaWRhdGlvbk1lc3NhZ2U6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbHVtbnNbZmllbGROYW1lXSAmJiB0aGlzLmNvbHVtbnNbZmllbGROYW1lXS52YWxpZGF0aW9ubWVzc2FnZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5pbmxpbmVFZGl0Vmlld1JlZi5jcmVhdGVFbWJlZGRlZFZpZXcodG1wbCwgY29udGV4dCkucm9vdE5vZGVzWzBdO1xuICAgICAgICAgICAgICAgIGZpZWxkTmFtZSA9IHJvb3ROb2RlLmdldEF0dHJpYnV0ZSgnZGF0YS1jb2wtaWRlbnRpZmllcicpO1xuICAgICAgICAgICAgICAgIHRoaXMuaW5saW5lQ29tcGxpZWRUbFtmaWVsZE5hbWVdID0gcm9vdE5vZGU7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgZ2V0SW5saW5lRWRpdFdpZGdldDogKGZpZWxkTmFtZSwgdmFsdWUsIGFsd2F5c05ld1JvdykgPT4ge1xuICAgICAgICAgICAgaWYgKGFsd2F5c05ld1Jvdykge1xuICAgICAgICAgICAgICAgIHRoaXMuZ3JpZE9wdGlvbnMuc2V0RmllbGRWYWx1ZShmaWVsZE5hbWUgKyAnX25ldycsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5pbmxpbmVOZXdDb21wbGllZFRsW2ZpZWxkTmFtZV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmdyaWRPcHRpb25zLnNldEZpZWxkVmFsdWUoZmllbGROYW1lLCB2YWx1ZSk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5pbmxpbmVDb21wbGllZFRsW2ZpZWxkTmFtZV07XG4gICAgICAgIH0sXG4gICAgICAgIHNldEZpZWxkVmFsdWU6IChmaWVsZE5hbWUsIHZhbHVlKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBjb250cm9sID0gdGhpcy5uZ2Zvcm0uY29udHJvbHMgJiYgdGhpcy5uZ2Zvcm0uY29udHJvbHNbZmllbGROYW1lXTtcbiAgICAgICAgICAgIGlmIChjb250cm9sKSB7XG4gICAgICAgICAgICAgICAgY29udHJvbC5zZXRWYWx1ZSh2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGdldEZpZWxkVmFsdWU6IGZpZWxkTmFtZSA9PiB7XG4gICAgICAgICAgICBjb25zdCBjb250cm9sID0gdGhpcy5uZ2Zvcm0uY29udHJvbHMgJiYgdGhpcy5uZ2Zvcm0uY29udHJvbHNbZmllbGROYW1lXTtcbiAgICAgICAgICAgIHJldHVybiBjb250cm9sICYmIGNvbnRyb2wudmFsdWU7XG4gICAgICAgIH0sXG4gICAgICAgIGdlbmVyYXRlRmlsdGVyUm93OiAoKSA9PiB7XG4gICAgICAgICAgICAvLyBDbGVhciB0aGUgdmlldyBjb250YWluZXIgcmVmXG4gICAgICAgICAgICB0aGlzLmZpbHRlclZpZXdSZWYuY2xlYXIoKTtcbiAgICAgICAgICAgIHRoaXMucm93RmlsdGVyQ29tcGxpZWRUbCA9IHt9O1xuICAgICAgICAgICAgLy8gRm9yIGFsbCB0aGUgY29sdW1ucyBpbnNpZGUgdGhlIHRhYmxlLCBnZW5lcmF0ZSB0aGUgY29tcGlsZWQgZmlsdGVyIHRlbXBsYXRlXG4gICAgICAgICAgICB0aGlzLmZpbHRlclRtcGwuZm9yRWFjaCgodG1wbCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5maWx0ZXJWaWV3UmVmLmNyZWF0ZUVtYmVkZGVkVmlldyh0bXBsLCB7XG4gICAgICAgICAgICAgICAgICAgIGNoYW5nZUZuOiB0aGlzLm9uUm93RmlsdGVyQ2hhbmdlLmJpbmQodGhpcyksXG4gICAgICAgICAgICAgICAgICAgIGlzRGlzYWJsZWQ6IChmaWVsZE5hbWUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmVtcHR5TWF0Y2hNb2Rlcy5pbmRleE9mKHRoaXMucm93RmlsdGVyW2ZpZWxkTmFtZV0gJiYgdGhpcy5yb3dGaWx0ZXJbZmllbGROYW1lXS5tYXRjaE1vZGUpID4gLTE7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KS5yb290Tm9kZXNbMF07XG4gICAgICAgICAgICAgICAgdGhpcy5yb3dGaWx0ZXJDb21wbGllZFRsW3Jvb3ROb2RlLmdldEF0dHJpYnV0ZSgnZGF0YS1jb2wtaWRlbnRpZmllcicpXSA9IHJvb3ROb2RlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGdldEZpbHRlcldpZGdldDogKGZpZWxkTmFtZSkgPT4ge1xuICAgICAgICAgICAgLy8gTW92ZSB0aGUgZ2VuZXJhdGVkIGZpbHRlciB0ZW1wbGF0ZSB0byB0aGUgZmlsdGVyIHJvd1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucm93RmlsdGVyQ29tcGxpZWRUbFtmaWVsZE5hbWVdO1xuICAgICAgICB9LFxuICAgICAgICBzZXRHcmlkRWRpdE1vZGU6ICh2YWwpID0+IHtcbiAgICAgICAgICAgIHRoaXMubmdab25lLnJ1bigoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5pc0dyaWRFZGl0TW9kZSA9IHZhbDtcbiAgICAgICAgICAgICAgICAkYXBwRGlnZXN0KCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0R3JpZFN0YXRlOiAodmFsKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmlzTG9hZGluZyA9IHZhbCA9PT0gJ2xvYWRpbmcnO1xuICAgICAgICB9LFxuICAgICAgICBub0NoYW5nZXNEZXRlY3RlZDogKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy50b2dnbGVNZXNzYWdlKHRydWUsICdpbmZvJywgJ05vIENoYW5nZXMgRGV0ZWN0ZWQnKTtcbiAgICAgICAgfSxcbiAgICAgICAgLy8gRnVuY3Rpb24gdG8gcmVkcmF3IHRoZSB3aWRnZXRzIG9uIHJlc2l6ZSBvZiBjb2x1bW5zXG4gICAgICAgIHJlZHJhd1dpZGdldHM6ICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZmllbGREZWZzLmZvckVhY2goY29sID0+IHtcbiAgICAgICAgICAgICAgICB0cmlnZ2VyRm4oY29sLmlubGluZUluc3RhbmNlICYmIGNvbC5pbmxpbmVJbnN0YW5jZS5yZWRyYXcpO1xuICAgICAgICAgICAgICAgIHRyaWdnZXJGbihjb2wuaW5saW5lSW5zdGFuY2VOZXcgJiYgY29sLmlubGluZUluc3RhbmNlTmV3LnJlZHJhdyk7XG4gICAgICAgICAgICAgICAgdHJpZ2dlckZuKGNvbC5maWx0ZXJJbnN0YW5jZSAmJiBjb2wuZmlsdGVySW5zdGFuY2UucmVkcmF3KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICBzZWFyY2hIYW5kbGVyOiB0aGlzLnNlYXJjaFNvcnRIYW5kbGVyLmJpbmQodGhpcyksXG4gICAgICAgIHNvcnRIYW5kbGVyOiB0aGlzLnNlYXJjaFNvcnRIYW5kbGVyLmJpbmQodGhpcyksXG4gICAgICAgIHRpbWVvdXRDYWxsOiAoZm4sIGRlbGF5KSA9PiB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZuLCBkZWxheSk7XG4gICAgICAgIH0sXG4gICAgICAgIHJ1bkluTmdab25lOiBmbiA9PiB7XG4gICAgICAgICAgICB0aGlzLm5nWm9uZS5ydW4oZm4pO1xuICAgICAgICB9LFxuICAgICAgICBzYWZlQXBwbHk6ICgpID0+IHtcbiAgICAgICAgICAgICRhcHBEaWdlc3QoKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0VG91Y2hlZDogKG5hbWUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGN0cmwgPSB0aGlzLm5nZm9ybS5jb250cm9sc1tuYW1lXTtcbiAgICAgICAgICAgIGlmIChjdHJsKSB7XG4gICAgICAgICAgICAgICAgY3RybC5tYXJrQXNUb3VjaGVkKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGNsZWFyRm9ybTogdGhpcy5jbGVhckZvcm0uYmluZCh0aGlzKVxuICAgIH07XG5cbiAgICBwcml2YXRlIF9ncmlkRGF0YTtcbiAgICBzZXQgZ3JpZERhdGEobmV3VmFsdWUpIHtcbiAgICAgICAgdGhpcy5fZ3JpZERhdGEgPSBuZXdWYWx1ZTtcbiAgICAgICAgbGV0IHN0YXJ0Um93SW5kZXggPSAwO1xuICAgICAgICBsZXQgZ3JpZE9wdGlvbnM7XG5cbiAgICAgICAgdGhpcy5fb25DaGFuZ2UobmV3VmFsdWUpO1xuICAgICAgICB0aGlzLl9vblRvdWNoZWQoKTtcblxuICAgICAgICBpZiAoaXNEZWZpbmVkKG5ld1ZhbHVlKSkge1xuICAgICAgICAgICAgLypTZXR0aW5nIHRoZSBzZXJpYWwgbm8ncyBvbmx5IHdoZW4gc2hvdyBuYXZpZ2F0aW9uIGlzIGVuYWJsZWQgYW5kIGRhdGEgbmF2aWdhdG9yIGlzIGNvbXBpbGVkXG4gICAgICAgICAgICAgYW5kIGl0cyBjdXJyZW50IHBhZ2UgaXMgc2V0IHByb3Blcmx5Ki9cbiAgICAgICAgICAgIGlmICh0aGlzLmlzTmF2aWdhdGlvbkVuYWJsZWQoKSAmJiB0aGlzLmRhdGFOYXZpZ2F0b3IuZG4uY3VycmVudFBhZ2UpIHtcbiAgICAgICAgICAgICAgICBzdGFydFJvd0luZGV4ID0gKCh0aGlzLmRhdGFOYXZpZ2F0b3IuZG4uY3VycmVudFBhZ2UgLSAxKSAqICh0aGlzLmRhdGFOYXZpZ2F0b3IubWF4UmVzdWx0cyB8fCAxKSkgKyAxO1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0RGF0YUdyaWRPcHRpb24oJ3N0YXJ0Um93SW5kZXgnLCBzdGFydFJvd0luZGV4KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8qIElmIGNvbERlZnMgYXJlIGF2YWlsYWJsZSwgYnV0IG5vdCBhbHJlYWR5IHNldCBvbiB0aGUgZGF0YWdyaWQsIHRoZW4gc2V0IHRoZW0uXG4gICAgICAgICAgICAgKiBUaGlzIHdpbGwgaGFwcGVuIHdoaWxlIHN3aXRjaGluZyBmcm9tIG1hcmt1cCB0byBkZXNpZ24gdGFiLiAqL1xuICAgICAgICAgICAgZ3JpZE9wdGlvbnMgPSB0aGlzLmNhbGxEYXRhR3JpZE1ldGhvZCgnZ2V0T3B0aW9ucycpO1xuXG4gICAgICAgICAgICBpZiAoIWdyaWRPcHRpb25zKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIWdyaWRPcHRpb25zLmNvbERlZnMubGVuZ3RoICYmIHRoaXMuZmllbGREZWZzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0RGF0YUdyaWRPcHRpb24oJ2NvbERlZnMnLCBnZXRDbG9uZWRPYmplY3QodGhpcy5maWVsZERlZnMpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIElmIGRhdGEgYW5kIGNvbERlZnMgYXJlIHByZXNlbnQsIGNhbGwgb24gYmVmb3JlIGRhdGEgcmVuZGVyIGV2ZW50XG4gICAgICAgICAgICBpZiAoIXRoaXMuaXNkeW5hbWljdGFibGUgJiYgIV8uaXNFbXB0eShuZXdWYWx1ZSkgJiYgZ3JpZE9wdGlvbnMuY29sRGVmcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmludm9rZUV2ZW50Q2FsbGJhY2soJ2JlZm9yZWRhdGFyZW5kZXInLCB7JGRhdGE6IG5ld1ZhbHVlLCAkY29sdW1uczogdGhpcy5jb2x1bW5zLCBkYXRhOiBuZXdWYWx1ZSwgY29sdW1uczogdGhpcy5jb2x1bW5zfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnNldERhdGFHcmlkT3B0aW9uKCdkYXRhJywgZ2V0Q2xvbmVkT2JqZWN0KG5ld1ZhbHVlKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXQgZ3JpZERhdGEoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9ncmlkRGF0YSB8fCBbXTtcbiAgICB9XG5cbiAgICBnZXQgc2VsZWN0ZWRpdGVtKCkge1xuICAgICAgICBpZiAodGhpcy5tdWx0aXNlbGVjdCkge1xuICAgICAgICAgICAgcmV0dXJuIGdldENsb25lZE9iamVjdCh0aGlzLml0ZW1zKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoXy5pc0VtcHR5KHRoaXMuaXRlbXMpKSB7XG4gICAgICAgICAgICByZXR1cm4ge307XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGdldENsb25lZE9iamVjdCh0aGlzLml0ZW1zWzBdKTtcbiAgICB9XG5cbiAgICBzZXQgc2VsZWN0ZWRpdGVtKHZhbCkge1xuICAgICAgICAvLyBTZWxlY3QgdGhlIHJvd3MgaW4gdGhlIHRhYmxlIGJhc2VkIG9uIHRoZSBuZXcgc2VsZWN0ZWQgaXRlbXMgcGFzc2VkXG4gICAgICAgIHRoaXMuaXRlbXMubGVuZ3RoID0gMDtcbiAgICAgICAgdGhpcy5jYWxsRGF0YUdyaWRNZXRob2QoJ3NlbGVjdFJvd3MnLCB2YWwpO1xuICAgIH1cblxuICAgIEBIb3N0TGlzdGVuZXIoJ2tleXByZXNzJywgWyckZXZlbnQnXSkgb25LZXlQcmVzcyAoJGV2ZW50OiBhbnkpIHtcbiAgICAgICAgaWYgKCRldmVudC53aGljaCA9PT0gMTMpIHtcbiAgICAgICAgICAgIHRoaXMuaW52b2tlRXZlbnRDYWxsYmFjaygnZW50ZXJrZXlwcmVzcycsIHskZXZlbnQsICRkYXRhOiB0aGlzLmdyaWREYXRhfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgcHVibGljIGluajogSW5qZWN0b3IsXG4gICAgICAgIHB1YmxpYyBmYjogRm9ybUJ1aWxkZXIsXG4gICAgICAgIHByaXZhdGUgYXBwOiBBcHAsXG4gICAgICAgIHByaXZhdGUgZHluYW1pY0NvbXBvbmVudFByb3ZpZGVyOiBEeW5hbWljQ29tcG9uZW50UmVmUHJvdmlkZXIsXG4gICAgICAgIEBBdHRyaWJ1dGUoJ2RhdGFzZXQuYmluZCcpIHB1YmxpYyBiaW5kZGF0YXNldCxcbiAgICAgICAgQEF0dHJpYnV0ZSgnZGF0YXNvdXJjZS5iaW5kJykgcHVibGljIGJpbmRkYXRhc291cmNlLFxuICAgICAgICBAQXR0cmlidXRlKCdyZWFkb25seWdyaWQnKSBwdWJsaWMgcmVhZG9ubHlncmlkLFxuICAgICAgICBwcml2YXRlIG5nWm9uZTogTmdab25lXG4gICAgKSB7XG4gICAgICAgIHN1cGVyKGluaiwgV0lER0VUX0NPTkZJRyk7XG4gICAgICAgIHN0eWxlcih0aGlzLm5hdGl2ZUVsZW1lbnQsIHRoaXMpO1xuXG4gICAgICAgIHRoaXMubmdmb3JtID0gZmIuZ3JvdXAoe30pO1xuICAgICAgICB0aGlzLmFkZEV2ZW50c1RvQ29udGV4dCh0aGlzLmNvbnRleHQpO1xuXG4gICAgICAgIC8vIFNob3cgbG9hZGluZyBzdGF0dXMgYmFzZWQgb24gdGhlIHZhcmlhYmxlIGxpZmUgY3ljbGVcbiAgICAgICAgdGhpcy5hcHAuc3Vic2NyaWJlKCd0b2dnbGUtdmFyaWFibGUtc3RhdGUnLCBvcHRpb25zID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLmRhdGFzb3VyY2UgJiYgdGhpcy5kYXRhc291cmNlLmV4ZWN1dGUoRGF0YVNvdXJjZS5PcGVyYXRpb24uSVNfQVBJX0FXQVJFKSAmJiBpc0RhdGFTb3VyY2VFcXVhbChvcHRpb25zLnZhcmlhYmxlLCB0aGlzLmRhdGFzb3VyY2UpKSB7XG4gICAgICAgICAgICAgICAgaXNEZWZpbmVkKHRoaXMudmFyaWFibGVJbmZsaWdodCkgPyB0aGlzLmRlYm91bmNlZEhhbmRsZUxvYWRpbmcob3B0aW9ucykgOiB0aGlzLmhhbmRsZUxvYWRpbmcob3B0aW9ucyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuZGVsZXRlb2t0ZXh0ID0gdGhpcy5hcHBMb2NhbGUuTEFCRUxfT0s7XG4gICAgICAgIHRoaXMuZGVsZXRlY2FuY2VsdGV4dCA9IHRoaXMuYXBwTG9jYWxlLkxBQkVMX0NBTkNFTDtcbiAgICB9XG5cbiAgICBuZ0FmdGVyQ29udGVudEluaXQoKSB7XG4gICAgICAgIHN1cGVyLm5nQWZ0ZXJDb250ZW50SW5pdCgpO1xuICAgICAgICBjb25zdCBydW5Nb2RlSW5pdGlhbFByb3BlcnRpZXMgPSB7XG4gICAgICAgICAgICBzaG93cm93aW5kZXg6ICdzaG93Um93SW5kZXgnLFxuICAgICAgICAgICAgbXVsdGlzZWxlY3Q6ICdtdWx0aXNlbGVjdCcsXG4gICAgICAgICAgICByYWRpb3NlbGVjdDogJ3Nob3dSYWRpb0NvbHVtbicsXG4gICAgICAgICAgICBmaWx0ZXJudWxscmVjb3JkczogJ2ZpbHRlck51bGxSZWNvcmRzJyxcbiAgICAgICAgICAgIGVuYWJsZXNvcnQ6ICdlbmFibGVTb3J0JyxcbiAgICAgICAgICAgIHNob3doZWFkZXI6ICdzaG93SGVhZGVyJyxcbiAgICAgICAgICAgIGVuYWJsZWNvbHVtbnNlbGVjdGlvbjogJ2VuYWJsZUNvbHVtblNlbGVjdGlvbicsXG4gICAgICAgICAgICBzaG93bmV3cm93OiAnc2hvd05ld1JvdycsXG4gICAgICAgICAgICBncmlkZmlyc3Ryb3dzZWxlY3Q6ICdzZWxlY3RGaXJzdFJvdydcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAodGhpcy5fbGl2ZVRhYmxlUGFyZW50KSB7XG4gICAgICAgICAgICB0aGlzLmlzUGFydE9mTGl2ZUdyaWQgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMucmVhZG9ubHlncmlkIHx8ICF0aGlzLmVkaXRtb2RlKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5yZWFkb25seWdyaWQgPT09ICd0cnVlJykge1xuICAgICAgICAgICAgICAgIHRoaXMuZWRpdG1vZGUgPSAnJztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaXNQYXJ0T2ZMaXZlR3JpZCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmVkaXRtb2RlID0gdGhpcy5pc1BhcnRPZkxpdmVHcmlkLmZvcm1sYXlvdXQgPT09ICdpbmxpbmUnID8gRURJVF9NT0RFLkZPUk0gOiBFRElUX01PREUuRElBTE9HO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZWRpdG1vZGUgPSB0aGlzLnJlYWRvbmx5Z3JpZCA/IEVESVRfTU9ERS5JTkxJTkUgOiAnJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmdyaWRPcHRpb25zLmNvbERlZnMgPSB0aGlzLmZ1bGxGaWVsZERlZnM7XG4gICAgICAgIHRoaXMuZ3JpZE9wdGlvbnMucm93QWN0aW9ucyA9IHRoaXMucm93QWN0aW9ucztcbiAgICAgICAgdGhpcy5ncmlkT3B0aW9ucy5oZWFkZXJDb25maWcgPSB0aGlzLmhlYWRlckNvbmZpZztcbiAgICAgICAgdGhpcy5ncmlkT3B0aW9ucy5yb3dDbGFzcyA9IHRoaXMucm93Y2xhc3M7XG4gICAgICAgIHRoaXMuZ3JpZE9wdGlvbnMuZWRpdG1vZGUgPSB0aGlzLmVkaXRtb2RlO1xuICAgICAgICB0aGlzLmdyaWRPcHRpb25zLmZvcm1Qb3NpdGlvbiA9IHRoaXMuZm9ybXBvc2l0aW9uO1xuICAgICAgICB0aGlzLmdyaWRPcHRpb25zLmZpbHRlcm1vZGUgPSB0aGlzLmZpbHRlcm1vZGU7XG4gICAgICAgIHRoaXMuZ3JpZE9wdGlvbnMuc2VhcmNoTGFiZWwgPSB0aGlzLnNlYXJjaGxhYmVsO1xuICAgICAgICB0aGlzLmdyaWRPcHRpb25zLmlzTW9iaWxlID0gaXNNb2JpbGUoKTtcbiAgICAgICAgdGhpcy5ncmlkT3B0aW9ucy5uYW1lID0gdGhpcy5uYW1lO1xuICAgICAgICAvLyBXaGVuIGxvYWRvbmRlbWFuZCBwcm9wZXJ0eSBpcyBlbmFibGVkKGRlZmVybG9hZD1cInRydWVcIikgYW5kIHNob3cgaXMgdHJ1ZSwgb25seSB0aGUgY29sdW1uIHRpdGxlcyBvZiB0aGUgZGF0YXRhYmxlIGFyZSByZW5kZXJlZCwgdGhlIGRhdGEoYm9keSBvZiB0aGUgZGF0YXRhYmxlKSBpcyBub3QgYXQgYWxsIHJlbmRlcmVkLlxuICAgICAgICAvLyBCZWNhdXNlIHRoZSBncmlkZGF0YSBpcyBzZXR0aW5nIGJlZm9yZSB0aGUgZGF0YXRhYmxlIGRvbSBpcyByZW5kZXJlZCBidXQgd2UgYXJlIHNlbmRpbmcgZW1wdHkgZGF0YSB0byB0aGUgZGF0YXRhYmxlLlxuICAgICAgICBpZiAoIV8uaXNFbXB0eSh0aGlzLmdyaWREYXRhKSkge1xuICAgICAgICAgICAgdGhpcy5ncmlkT3B0aW9ucy5kYXRhID0gZ2V0Q2xvbmVkT2JqZWN0KHRoaXMuZ3JpZERhdGEpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZ3JpZE9wdGlvbnMubWVzc2FnZXMgPSB7XG4gICAgICAgICAgICAnc2VsZWN0RmllbGQnOiAnU2VsZWN0IEZpZWxkJ1xuICAgICAgICB9O1xuICAgICAgICB0aGlzLmRhdGFncmlkRWxlbWVudCA9ICQodGhpcy5fdGFibGVFbGVtZW50Lm5hdGl2ZUVsZW1lbnQpO1xuXG4gICAgICAgIHRoaXMuZ3JpZEVsZW1lbnQgPSB0aGlzLiRlbGVtZW50O1xuICAgICAgICB0aGlzLiRlbGVtZW50LmNzcyh7J3Bvc2l0aW9uJzogJ3JlbGF0aXZlJ30pO1xuXG4gICAgICAgIF8uZm9yRWFjaChydW5Nb2RlSW5pdGlhbFByb3BlcnRpZXMsICh2YWx1ZSwga2V5KSA9PiB7XG4gICAgICAgICAgICBpZiAoaXNEZWZpbmVkKHRoaXNba2V5XSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmdyaWRPcHRpb25zW3ZhbHVlXSA9ICh0aGlzW2tleV0gPT09ICd0cnVlJyB8fCB0aGlzW2tleV0gPT09IHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnJlbmRlck9wZXJhdGlvbkNvbHVtbnMoKTtcbiAgICAgICAgdGhpcy5ncmlkT3B0aW9ucy5jb2xEZWZzID0gdGhpcy5maWVsZERlZnM7XG5cbiAgICAgICAgdGhpcy5kYXRhZ3JpZEVsZW1lbnQuZGF0YXRhYmxlKHRoaXMuZ3JpZE9wdGlvbnMpO1xuICAgICAgICB0aGlzLmNhbGxEYXRhR3JpZE1ldGhvZCgnc2V0U3RhdHVzJywgJ2xvYWRpbmcnLCB0aGlzLmxvYWRpbmdkYXRhbXNnKTtcblxuICAgICAgICB0aGlzLmFwcGx5UHJvcHMuZm9yRWFjaChhcmdzID0+IHRoaXMuY2FsbERhdGFHcmlkTWV0aG9kKC4uLmFyZ3MpKTtcblxuICAgICAgICBpZiAodGhpcy5lZGl0bW9kZSA9PT0gRURJVF9NT0RFLlFVSUNLX0VESVQpIHtcbiAgICAgICAgICAgIHRoaXMuZG9jdW1lbnRDbGlja0JpbmQgPSB0aGlzLl9kb2N1bWVudENsaWNrQmluZC5iaW5kKHRoaXMpO1xuICAgICAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0aGlzLmRvY3VtZW50Q2xpY2tCaW5kKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG5nT25EZXN0cm95KCkge1xuICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHRoaXMuZG9jdW1lbnRDbGlja0JpbmQpO1xuICAgICAgICBpZiAodGhpcy5uYXZpZ2F0b3JSZXN1bHRXYXRjaCkge1xuICAgICAgICAgICAgdGhpcy5uYXZpZ2F0b3JSZXN1bHRXYXRjaC51bnN1YnNjcmliZSgpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLm5hdmlnYXRvck1heFJlc3VsdFdhdGNoKSB7XG4gICAgICAgICAgICB0aGlzLm5hdmlnYXRvck1heFJlc3VsdFdhdGNoLnVuc3Vic2NyaWJlKCk7XG4gICAgICAgIH1cbiAgICAgICAgc3VwZXIubmdPbkRlc3Ryb3koKTtcbiAgICB9XG5cbiAgICBhZGRSb3dJbmRleChyb3cpIHtcbiAgICAgICAgY29uc3Qgcm93RGF0YSA9IGdldENsb25lZE9iamVjdChyb3cpO1xuICAgICAgICBjb25zdCByb3dJbmRleCA9IF8uaW5kZXhPZih0aGlzLmdyaWRPcHRpb25zLmRhdGEsIHJvdyk7XG4gICAgICAgIGlmIChyb3dJbmRleCA8IDApIHtcbiAgICAgICAgICAgIHJldHVybiByb3c7XG4gICAgICAgIH1cbiAgICAgICAgcm93RGF0YS4kaW5kZXggPSByb3dJbmRleCArIDE7XG4gICAgICAgIHJvd0RhdGEuJGlzRmlyc3QgPSByb3dEYXRhLiRpbmRleCA9PT0gMTtcbiAgICAgICAgcm93RGF0YS4kaXNMYXN0ID0gdGhpcy5ncmlkRGF0YS5sZW5ndGggPT09IHJvd0RhdGEuJGluZGV4O1xuICAgICAgICByZXR1cm4gcm93RGF0YTtcbiAgICB9XG5cbiAgICBhZGRFdmVudHNUb0NvbnRleHQoY29udGV4dCkge1xuICAgICAgICBjb250ZXh0LmFkZE5ld1JvdyA9ICgpID0+IHRoaXMuYWRkTmV3Um93KCk7XG4gICAgICAgIGNvbnRleHQuZGVsZXRlUm93ID0gKCkgPT4gdGhpcy5kZWxldGVSb3coKTtcbiAgICAgICAgY29udGV4dC5lZGl0Um93ID0gKCkgPT4gdGhpcy5lZGl0Um93KCk7XG4gICAgfVxuXG4gICAgZXhlY3V0ZShvcGVyYXRpb24sIG9wdGlvbnMpIHtcbiAgICAgICAgaWYgKFtEYXRhU291cmNlLk9wZXJhdGlvbi5JU19BUElfQVdBUkUsIERhdGFTb3VyY2UuT3BlcmF0aW9uLklTX1BBR0VBQkxFLCBEYXRhU291cmNlLk9wZXJhdGlvbi5TVVBQT1JUU19TRVJWRVJfRklMVEVSXS5pbmNsdWRlcyhvcGVyYXRpb24pKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZGF0YXNvdXJjZSA/IHRoaXMuZGF0YXNvdXJjZS5leGVjdXRlKG9wZXJhdGlvbiwgb3B0aW9ucykgOiB7fTtcbiAgICB9XG5cbiAgICBpc05hdmlnYXRpb25FbmFibGVkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zaG93bmF2aWdhdGlvbiAmJiB0aGlzLmRhdGFOYXZpZ2F0b3IgJiYgdGhpcy5kYXRhTmF2aWdhdG9yV2F0Y2hlZDtcbiAgICB9XG5cbiAgICBnZXRDbG9uZWRSb3dPYmplY3Qocm93RGF0YSkge1xuICAgICAgICBjb25zdCByb3cgPSBnZXRDbG9uZWRPYmplY3Qocm93RGF0YSk7XG4gICAgICAgIHJvdy5nZXRQcm9wZXJ0eSA9IGZpZWxkID0+IHtcbiAgICAgICAgICAgIHJldHVybiBfLmdldChyb3csIGZpZWxkKTtcbiAgICAgICAgfTtcbiAgICAgICAgcm93LiRpc0ZpcnN0ID0gcm93LiRpbmRleCA9PT0gMTtcbiAgICAgICAgcm93LiRpc0xhc3QgPSB0aGlzLmdyaWREYXRhLmxlbmd0aCA9PT0gcm93LiRpbmRleDtcbiAgICAgICAgZGVsZXRlIHJvdy4kJGluZGV4O1xuICAgICAgICBkZWxldGUgcm93LiQkcGs7XG4gICAgICAgIHJldHVybiByb3c7XG4gICAgfVxuXG4gICAgaGFuZGxlTG9hZGluZyhkYXRhKSB7XG4gICAgICAgIHRoaXMudmFyaWFibGVJbmZsaWdodCA9IGRhdGEuYWN0aXZlO1xuICAgICAgICAvLyBiYXNlZCBvbiB0aGUgYWN0aXZlIHN0YXRlIGFuZCByZXNwb25zZSB0b2dnbGluZyB0aGUgJ2xvYWRpbmcgZGF0YS4uLicgYW5kICdubyBkYXRhIGZvdW5kJyBtZXNzYWdlcy5cbiAgICAgICAgaWYgKGRhdGEuYWN0aXZlKSB7XG4gICAgICAgICAgICB0aGlzLmNhbGxEYXRhR3JpZE1ldGhvZCgnc2V0U3RhdHVzJywgJ2xvYWRpbmcnLCB0aGlzLmxvYWRpbmdkYXRhbXNnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIElmIGdyaWQgaXMgaW4gZWRpdCBtb2RlIG9yIGdyaWQgaGFzIGRhdGEsIGRvbnQgc2hvdyB0aGUgbm8gZGF0YSBtZXNzYWdlXG4gICAgICAgICAgICBpZiAoIXRoaXMuaXNHcmlkRWRpdE1vZGUgJiYgXy5pc0VtcHR5KHRoaXMuZGF0YXNldCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNhbGxEYXRhR3JpZE1ldGhvZCgnc2V0U3RhdHVzJywgJ25vZGF0YScsIHRoaXMubm9kYXRhbWVzc2FnZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuY2FsbERhdGFHcmlkTWV0aG9kKCdzZXRTdGF0dXMnLCAncmVhZHknKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHNldERpc2FibGVkT25GaWVsZChvcGVyYXRpb24sIGNvbERlZiwgd2lkZ2V0VHlwZSkge1xuICAgICAgICBpZiAob3BlcmF0aW9uICE9PSAnbmV3JyAmJiBjb2xEZWZbJ3ByaW1hcnkta2V5J10gJiYgY29sRGVmLmdlbmVyYXRvciA9PT0gJ2Fzc2lnbmVkJyAmJiAhY29sRGVmWydyZWxhdGVkLWVudGl0eS1uYW1lJ10gJiYgIWNvbERlZi5wZXJpb2QpIHtcbiAgICAgICAgICAgIGNvbERlZlt3aWRnZXRUeXBlXS5kaXNhYmxlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXNldEZvcm1Db250cm9sKGN0cmwpIHtcbiAgICAgICAgY3RybC5tYXJrQXNVbnRvdWNoZWQoKTtcbiAgICAgICAgY3RybC5tYXJrQXNQcmlzdGluZSgpO1xuICAgIH1cblxuICAgIGNsZWFyRm9ybShuZXdSb3c/KSB7XG4gICAgICAgIGNvbnN0IGN0cmxzID0gdGhpcy5uZ2Zvcm0uY29udHJvbHM7XG4gICAgICAgIF8ua2V5cyh0aGlzLm5nZm9ybS5jb250cm9scykuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgICAgICAgLy8gSWYgbmV3IHJvdywgY2xlYXIgdGhlIGNvbnRyb2xzIGluIHRoZSBuZXcgcm93LiBFbHNlLCBjbGVhciB0aGUgY29udHJvbHMgaW4gZWRpdCByb3dcbiAgICAgICAgICAgIGlmICgha2V5LmVuZHNXaXRoKCdfZmlsdGVyJykgJiYgKChrZXkuZW5kc1dpdGgoJ19uZXcnKSAmJiBuZXdSb3cpIHx8ICgha2V5LmVuZHNXaXRoKCdfbmV3JykgJiYgIW5ld1JvdykpKSB7XG4gICAgICAgICAgICAgICAgY3RybHNba2V5XS5zZXRWYWx1ZSgnJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5yZXNldEZvcm1Db250cm9sKGN0cmxzW2tleV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKiBDaGVjayB3aGV0aGVyIGl0IGlzIG5vbi1lbXB0eSByb3cuICovXG4gICAgaXNFbXB0eVJlY29yZChyZWNvcmQpIHtcbiAgICAgICAgY29uc3QgcHJvcGVydGllcyA9IE9iamVjdC5rZXlzKHJlY29yZCk7XG4gICAgICAgIGxldCBkYXRhLFxuICAgICAgICAgICAgaXNEaXNwbGF5ZWQ7XG5cbiAgICAgICAgcmV0dXJuIHByb3BlcnRpZXMuZXZlcnkoKHByb3AsIGluZGV4KSA9PiB7XG4gICAgICAgICAgICBkYXRhID0gcmVjb3JkW3Byb3BdO1xuICAgICAgICAgICAgLyogSWYgZmllbGREZWZzIGFyZSBtaXNzaW5nLCBzaG93IGFsbCBjb2x1bW5zIGluIGRhdGEuICovXG4gICAgICAgICAgICBpc0Rpc3BsYXllZCA9ICh0aGlzLmZpZWxkRGVmcy5sZW5ndGggJiYgaXNEZWZpbmVkKHRoaXMuZmllbGREZWZzW2luZGV4XSkgJiZcbiAgICAgICAgICAgICAgICAoaXNNb2JpbGUoKSA/IHRoaXMuZmllbGREZWZzW2luZGV4XS5tb2JpbGVEaXNwbGF5IDogdGhpcy5maWVsZERlZnNbaW5kZXhdLnBjRGlzcGxheSkpIHx8IHRydWU7XG4gICAgICAgICAgICAvKlZhbGlkYXRpbmcgb25seSB0aGUgZGlzcGxheWVkIGZpZWxkcyovXG4gICAgICAgICAgICBpZiAoaXNEaXNwbGF5ZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKGRhdGEgPT09IG51bGwgfHwgZGF0YSA9PT0gdW5kZWZpbmVkIHx8IGRhdGEgPT09ICcnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKiBGdW5jdGlvbiB0byByZW1vdmUgdGhlIGVtcHR5IGRhdGEuICovXG4gICAgcmVtb3ZlRW1wdHlSZWNvcmRzKHNlcnZpY2VEYXRhKSB7XG4gICAgICAgIGNvbnN0IGFsbFJlY29yZHMgPSBzZXJ2aWNlRGF0YTtcbiAgICAgICAgbGV0IGZpbHRlcmVkRGF0YSA9IFtdO1xuICAgICAgICBpZiAoYWxsUmVjb3JkcyAmJiBhbGxSZWNvcmRzLmxlbmd0aCkge1xuICAgICAgICAgICAgLypDb21wYXJpbmcgYW5kIHB1c2hpbmcgdGhlIG5vbi1lbXB0eSBkYXRhIGNvbHVtbnMqL1xuICAgICAgICAgICAgZmlsdGVyZWREYXRhID0gYWxsUmVjb3Jkcy5maWx0ZXIocmVjb3JkID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVjb3JkICYmICF0aGlzLmlzRW1wdHlSZWNvcmQocmVjb3JkKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmaWx0ZXJlZERhdGE7XG4gICAgfVxuXG4gICAgc2V0R3JpZERhdGEoc2VydmVyRGF0YSkge1xuICAgICAgICBjb25zdCBkYXRhID0gdGhpcy5maWx0ZXJudWxscmVjb3JkcyA/ICB0aGlzLnJlbW92ZUVtcHR5UmVjb3JkcyhzZXJ2ZXJEYXRhKSA6IHNlcnZlckRhdGE7XG4gICAgICAgIGlmICghdGhpcy52YXJpYWJsZUluZmxpZ2h0KSB7XG4gICAgICAgICAgICBpZiAoZGF0YSAmJiBkYXRhLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY2FsbERhdGFHcmlkTWV0aG9kKCdzZXRTdGF0dXMnLCAnbm9kYXRhJywgdGhpcy5ub2RhdGFtZXNzYWdlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jYWxsRGF0YUdyaWRNZXRob2QoJ3NldFN0YXR1cycsICdyZWFkeScpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuZ3JpZERhdGEgPSBkYXRhO1xuICAgIH1cblxuICAgIHNldERhdGFHcmlkT3B0aW9uKG9wdGlvbk5hbWUsIG5ld1ZhbCwgZm9yY2VTZXQgPSBmYWxzZSkge1xuICAgICAgICBpZiAoIXRoaXMuZGF0YWdyaWRFbGVtZW50IHx8ICF0aGlzLmRhdGFncmlkRWxlbWVudC5kYXRhdGFibGUgfHwgIXRoaXMuZGF0YWdyaWRFbGVtZW50LmRhdGF0YWJsZSgnaW5zdGFuY2UnKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG9wdGlvbiA9IHt9O1xuICAgICAgICBpZiAoaXNEZWZpbmVkICYmICghXy5pc0VxdWFsKG5ld1ZhbCwgdGhpcy5ncmlkT3B0aW9uc1tvcHRpb25OYW1lXSkgfHwgZm9yY2VTZXQpKSB7XG4gICAgICAgICAgICBvcHRpb25bb3B0aW9uTmFtZV0gPSBuZXdWYWw7XG4gICAgICAgICAgICB0aGlzLmRhdGFncmlkRWxlbWVudC5kYXRhdGFibGUoJ29wdGlvbicsIG9wdGlvbik7XG4gICAgICAgICAgICB0aGlzLmdyaWRPcHRpb25zW29wdGlvbk5hbWVdID0gbmV3VmFsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY2FsbERhdGFHcmlkTWV0aG9kKC4uLmFyZ3MpIHtcbiAgICAgICAgaWYgKCF0aGlzLmRhdGFncmlkRWxlbWVudCB8fCAhdGhpcy5kYXRhZ3JpZEVsZW1lbnQuZGF0YXRhYmxlKCdpbnN0YW5jZScpKSB7XG4gICAgICAgICAgICB0aGlzLmFwcGx5UHJvcHMuc2V0KGFyZ3NbMV0sIGFyZ3MpO1xuICAgICAgICAgICAgcmV0dXJuOyAvLyBJZiBkYXRhZ3JpZCBpcyBub3QgaW5pdGlsaWF6ZWQgb3IgZGVzdHJveWVkLCByZXR1cm4gaGVyZVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmRhdGFncmlkRWxlbWVudC5kYXRhdGFibGUuYXBwbHkodGhpcy5kYXRhZ3JpZEVsZW1lbnQsIGFyZ3MpO1xuICAgIH1cblxuICAgIHJlbmRlck9wZXJhdGlvbkNvbHVtbnMoKSB7XG4gICAgICAgIGxldCByb3dBY3Rpb25Db2wsXG4gICAgICAgICAgICBpbnNlcnRQb3NpdGlvbjtcblxuICAgICAgICBjb25zdCByb3dPcGVyYXRpb25zQ29sdW1uID0gZ2V0Um93T3BlcmF0aW9uc0NvbHVtbigpLFxuICAgICAgICAgICAgY29uZmlnID0ge1xuICAgICAgICAgICAgICAgICduYW1lJzogcm93T3BlcmF0aW9uc0NvbHVtbi5maWVsZCxcbiAgICAgICAgICAgICAgICAnZmllbGQnOiByb3dPcGVyYXRpb25zQ29sdW1uLmZpZWxkLFxuICAgICAgICAgICAgICAgICdpc1ByZWRlZmluZWQnOiB0cnVlXG4gICAgICAgICAgICB9O1xuICAgICAgICAvLyBSZXR1cm4gaWYgbm8gZmllbGREZWZzIGFyZSBwcmVzZW50XG4gICAgICAgIGlmICghdGhpcy5maWVsZERlZnMubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICByb3dBY3Rpb25Db2wgPSBfLmZpbmQodGhpcy5mdWxsRmllbGREZWZzLCB7J2ZpZWxkJzogUk9XX09QU19GSUVMRCwgdHlwZTogJ2N1c3RvbSd9KTsgLy8gQ2hlY2sgaWYgY29sdW1uIGlzIGZldGNoZWQgZnJvbSBtYXJrdXBcbiAgICAgICAgXy5yZW1vdmUodGhpcy5maWVsZERlZnMsIHt0eXBlOiAnY3VzdG9tJywgZmllbGQ6IFJPV19PUFNfRklFTER9KTsgLy8gUmVtb3Zpbmcgb3BlcmF0aW9ucyBjb2x1bW5cbiAgICAgICAgXy5yZW1vdmUodGhpcy5oZWFkZXJDb25maWcsIHtmaWVsZDogcm93T3BlcmF0aW9uc0NvbHVtbi5maWVsZH0pO1xuXG4gICAgICAgIC8qQWRkIHRoZSBjb2x1bW4gZm9yIHJvdyBvcGVyYXRpb25zIG9ubHkgaWYgYXQtbGVhc3Qgb25lIG9wZXJhdGlvbiBoYXMgYmVlbiBlbmFibGVkLiovXG4gICAgICAgIGlmICh0aGlzLnJvd0FjdGlvbnMubGVuZ3RoKSB7XG4gICAgICAgICAgICBpZiAocm93QWN0aW9uQ29sKSB7IC8vIElmIGNvbHVtbiBpcyBwcmVzZW50IGluIG1hcmt1cCwgcHVzaCB0aGUgY29sdW1uIG9yIHB1c2ggdGhlIGRlZmF1bHQgY29sdW1uXG4gICAgICAgICAgICAgICAgaW5zZXJ0UG9zaXRpb24gPSByb3dBY3Rpb25Db2wucm93YWN0aW9uc3Bvc2l0aW9uID8gXy50b051bWJlcihyb3dBY3Rpb25Db2wucm93YWN0aW9uc3Bvc2l0aW9uKSA6IHRoaXMuZmllbGREZWZzLmxlbmd0aDtcbiAgICAgICAgICAgICAgICB0aGlzLmZpZWxkRGVmcy5zcGxpY2UoaW5zZXJ0UG9zaXRpb24sIDAsIHJvd0FjdGlvbkNvbCk7XG4gICAgICAgICAgICAgICAgaWYgKGluc2VydFBvc2l0aW9uID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaGVhZGVyQ29uZmlnLnVuc2hpZnQoY29uZmlnKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmhlYWRlckNvbmZpZy5wdXNoKGNvbmZpZyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmZpZWxkRGVmcy5wdXNoKHJvd09wZXJhdGlvbnNDb2x1bW4pO1xuICAgICAgICAgICAgICAgIHRoaXMuaGVhZGVyQ29uZmlnLnB1c2goY29uZmlnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNldERhdGFHcmlkT3B0aW9uKCdoZWFkZXJDb25maWcnLCB0aGlzLmhlYWRlckNvbmZpZyk7XG4gICAgfVxuXG4gICAgZW5hYmxlUGFnZU5hdmlnYXRpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLmRhdGFzZXQgJiYgdGhpcy5iaW5kZGF0YXNldCAmJiB0aGlzLmRhdGFOYXZpZ2F0b3IpIHtcbiAgICAgICAgICAgIC8qQ2hlY2sgZm9yIHNhbml0eSovXG4gICAgICAgICAgICB0aGlzLmRhdGFOYXZpZ2F0b3JXYXRjaGVkID0gdHJ1ZTtcblxuICAgICAgICAgICAgaWYgKHRoaXMubmF2aWdhdG9yUmVzdWx0V2F0Y2gpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm5hdmlnYXRvclJlc3VsdFdhdGNoLnVuc3Vic2NyaWJlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvKlJlZ2lzdGVyIGEgd2F0Y2ggb24gdGhlIFwicmVzdWx0XCIgcHJvcGVydHkgb2YgdGhlIFwiZGF0YU5hdmlnYXRvclwiIHNvIHRoYXQgdGhlIHBhZ2luYXRlZCBkYXRhIGlzIGRpc3BsYXllZCBpbiB0aGUgbGl2ZS1saXN0LiovXG4gICAgICAgICAgICB0aGlzLm5hdmlnYXRvclJlc3VsdFdhdGNoID0gdGhpcy5kYXRhTmF2aWdhdG9yLnJlc3VsdEVtaXR0ZXIuc3Vic2NyaWJlKChuZXdWYWwpID0+IHtcbiAgICAgICAgICAgICAgICAvKiBDaGVjayBmb3Igc2FuaXR5LiAqL1xuICAgICAgICAgICAgICAgIGlmIChpc0RlZmluZWQobmV3VmFsKSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBXYXRjaCB3aWxsIG5vdCBiZSB0cmlnZ2VyZWQgaWYgZGF0YXNldCBhbmQgbmV3IHZhbHVlIGFyZSBlcXVhbC4gU28gdHJpZ2dlciB0aGUgcHJvcGVydHkgY2hhbmdlIGhhbmRsZXIgbWFudWFsbHlcbiAgICAgICAgICAgICAgICAgICAgLy8gVGhpcyBoYXBwZW5zIGluIGNhc2UsIGlmIGRhdGFzZXQgaXMgZGlyZWN0bHkgdXBkYXRlZC5cbiAgICAgICAgICAgICAgICAgICAgaWYgKF8uaXNFcXVhbCh0aGlzLmRhdGFzZXQsIG5ld1ZhbCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMud2F0Y2hWYXJpYWJsZURhdGFTZXQobmV3VmFsKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChfLmlzQXJyYXkobmV3VmFsKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMud2lkZ2V0LmRhdGFzZXQgPSBbXS5jb25jYXQobmV3VmFsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoXy5pc09iamVjdChuZXdWYWwpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy53aWRnZXQuZGF0YXNldCA9IF8uZXh0ZW5kKHt9LCBuZXdWYWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLndpZGdldC5kYXRhc2V0ID0gbmV3VmFsO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy53aWRnZXQuZGF0YXNldCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCB0cnVlKTtcbiAgICAgICAgICAgIC8qRGUtcmVnaXN0ZXIgdGhlIHdhdGNoIGlmIGl0IGlzIGV4aXN0cyAqL1xuICAgICAgICAgICAgaWYgKHRoaXMubmF2aWdhdG9yTWF4UmVzdWx0V2F0Y2gpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm5hdmlnYXRvck1heFJlc3VsdFdhdGNoLnVuc3Vic2NyaWJlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvKlJlZ2lzdGVyIGEgd2F0Y2ggb24gdGhlIFwibWF4UmVzdWx0c1wiIHByb3BlcnR5IG9mIHRoZSBcImRhdGFOYXZpZ2F0b3JcIiBzbyB0aGF0IHRoZSBcInBhZ2VTaXplXCIgaXMgZGlzcGxheWVkIGluIHRoZSBsaXZlLWxpc3QuKi9cbiAgICAgICAgICAgIHRoaXMubmF2aWdhdG9yTWF4UmVzdWx0V2F0Y2ggPSB0aGlzLmRhdGFOYXZpZ2F0b3IubWF4UmVzdWx0c0VtaXR0ZXIuc3Vic2NyaWJlKChuZXdWYWwpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnBhZ2VzaXplID0gbmV3VmFsO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvLyBJZiBkYXRhc2V0IGlzIGEgcGFnZWFibGUgb2JqZWN0LCBkYXRhIGlzIHByZXNlbnQgaW5zaWRlIHRoZSBjb250ZW50IHByb3BlcnR5XG4gICAgICAgICAgICB0aGlzLl9fZnVsbERhdGEgPSB0aGlzLmRhdGFzZXQ7XG5cbiAgICAgICAgICAgIHRoaXMuZGF0YU5hdmlnYXRvci53aWRnZXQubWF4UmVzdWx0cyA9IHRoaXMucGFnZXNpemUgfHwgNTtcbiAgICAgICAgICAgIHRoaXMuZGF0YU5hdmlnYXRvci5vcHRpb25zID0ge1xuICAgICAgICAgICAgICAgIG1heFJlc3VsdHM6IHRoaXMucGFnZXNpemUgfHwgNVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlUHJvcGVydHlCaW5kaW5nKCdkYXRhc2V0Jyk7XG4gICAgICAgICAgICB0aGlzLmRhdGFOYXZpZ2F0b3Iuc2V0QmluZERhdGFTZXQodGhpcy5iaW5kZGF0YXNldCwgdGhpcy52aWV3UGFyZW50LCB0aGlzLmRhdGFzb3VyY2UsIHRoaXMuZGF0YXNldCwgdGhpcy5iaW5kZGF0YXNvdXJjZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXNldFBhZ2VOYXZpZ2F0aW9uKCkge1xuICAgICAgICAvKkNoZWNrIGZvciBzYW5pdHkqL1xuICAgICAgICBpZiAodGhpcy5kYXRhTmF2aWdhdG9yKSB7XG4gICAgICAgICAgICB0aGlzLmRhdGFOYXZpZ2F0b3IucmVzZXRQYWdlTmF2aWdhdGlvbigpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaXNEYXRhVmFsaWQoKSB7XG4gICAgICAgIGxldCBlcnJvcjtcbiAgICAgICAgY29uc3QgZGF0YXNldCA9IHRoaXMuZGF0YXNldCB8fCB7fTtcblxuICAgICAgICAvKkluIGNhc2UgXCJkYXRhXCIgY29udGFpbnMgXCJlcnJvclwiICYgXCJlcnJvck1lc3NhZ2VcIiwgdGhlbiBkaXNwbGF5IHRoZSBlcnJvciBtZXNzYWdlIGluIHRoZSBncmlkLiovXG4gICAgICAgIGlmIChkYXRhc2V0LmVycm9yKSB7XG4gICAgICAgICAgICBlcnJvciA9IGRhdGFzZXQuZXJyb3I7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRhdGFzZXQuZGF0YSAmJiBkYXRhc2V0LmRhdGEuZXJyb3IpIHtcbiAgICAgICAgICAgIGlmIChkYXRhc2V0LmRhdGEuZXJyb3JNZXNzYWdlKSB7XG4gICAgICAgICAgICAgICAgZXJyb3IgPSBkYXRhc2V0LmRhdGEuZXJyb3JNZXNzYWdlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChlcnJvcikge1xuICAgICAgICAgICAgdGhpcy5zZXRHcmlkRGF0YShbXSk7XG4gICAgICAgICAgICB0aGlzLmNhbGxEYXRhR3JpZE1ldGhvZCgnc2V0U3RhdHVzJywgJ2Vycm9yJywgZXJyb3IpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8vIEZ1bmN0aW9uIHRvIHBvcHVsYXRlIHRoZSBncmlkIHdpdGggZGF0YS5cbiAgICBwb3B1bGF0ZUdyaWREYXRhKHNlcnZpY2VEYXRhKSB7XG4gICAgICAgIGxldCBkYXRhO1xuICAgICAgICBzZXJ2aWNlRGF0YSA9IHRyYW5zZm9ybURhdGEoc2VydmljZURhdGEsIHRoaXMubmFtZSk7XG4gICAgICAgIC8vIEFwcGx5IGZpbHRlciBhbmQgc29ydCwgaWYgZGF0YSBpcyByZWZyZXNoZWQgdGhyb3VnaCBSZWZyZXNoIGRhdGEgbWV0aG9kXG4gICAgICAgIGlmICghdGhpcy5pc05hdmlnYXRpb25FbmFibGVkKCkgJiYgdGhpcy5faXNDbGllbnRTZWFyY2gpIHtcbiAgICAgICAgICAgIGRhdGEgPSBnZXRDbG9uZWRPYmplY3Qoc2VydmljZURhdGEpO1xuICAgICAgICAgICAgZGF0YSA9IHRoaXMuZ2V0U2VhcmNoUmVzdWx0KGRhdGEsIHRoaXMuZmlsdGVySW5mbyk7XG4gICAgICAgICAgICBkYXRhID0gdGhpcy5nZXRTb3J0UmVzdWx0KGRhdGEsIHRoaXMuc29ydEluZm8pO1xuICAgICAgICAgICAgdGhpcy5zZXJ2ZXJEYXRhID0gZGF0YTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc2VydmVyRGF0YSA9IHNlcnZpY2VEYXRhO1xuICAgICAgICB9XG4gICAgICAgIC8vIElmIGZpZWxkZGVmcyBhcmUgbm90IHByZXNlbnQsIGdlbmVyYXRlIGZpZWxkZGVmcyBmcm9tIGRhdGFcbiAgICAgICAgLy8gUmVtb3ZpbmcgZmllbGRkZWZzIGNoZWNrIGJlY2F1c2UgV2hlbiBsb2Fkb25kZW1hbmQgcHJvcGVydHkgaXMgZW5hYmxlZChkZWZlcmxvYWQ9XCJ0cnVlXCIpLCB0aGUgZGF0YXNldCBwcm9wZXJ0eWNoYW5nZWhhbmxkZXIgaXMgdHJpZ2dlcmVkIGZpcnN0IGJlZm9yZSB0aGUgZG9tIGlzIGdldHRpbmcgcmVuZGVyZWQuXG4gICAgICAgIC8vIFNvIGF0IHRoYXQgdGltZSBmaWVsZGRlZnMgbGVuZ3RoIGlzIHplcm8sIGR1ZSB0byB0aGlzIHRoZSBjb2x1bW5zIGFyZSBjcmVhdGVkIGR5bmFtaWNhbGx5LlxuICAgICAgICBpZiAodGhpcy5pc2R5bmFtaWN0YWJsZSkge1xuICAgICAgICAgICAgdGhpcy5jcmVhdGVHcmlkQ29sdW1ucyh0aGlzLnNlcnZlckRhdGEpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zZXRHcmlkRGF0YSh0aGlzLnNlcnZlckRhdGEpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gRnVuY3Rpb24gdG8gZ2VuZXJhdGUgYW5kIGNvbXBpbGUgdGhlIGZvcm0gZmllbGRzIGZyb20gdGhlIG1ldGFkYXRhXG4gICAgYXN5bmMgZ2VuZXJhdGVEeW5hbWljQ29sdW1ucyhjb2x1bW5zKSB7XG4gICAgICAgIHRoaXMuZmllbGREZWZzID0gW107IC8vIGVtcHR5IHRoZSBmb3JtIGZpZWxkc1xuICAgICAgICAvLyBlbXB0eSB0aGUgZmlsdGVyIGZpZWxkIHRlbXBsYXRlIHJlZnMuXG4gICAgICAgICh0aGlzLmZpbHRlclRtcGwgYXMgYW55KS5fcmVzdWx0cyA9IFtdO1xuXG4gICAgICAgIGlmIChfLmlzRW1wdHkoY29sdW1ucykpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCB0bXBsID0gJyc7XG4gICAgICAgIGNvbHVtbnMuZm9yRWFjaChjb2wgPT4ge1xuICAgICAgICAgICAgbGV0IGF0dHJzVG1wbCA9ICcnO1xuICAgICAgICAgICAgbGV0IGN1c3RvbVRtcGwgPSAnJztcbiAgICAgICAgICAgIF8uZm9yRWFjaChjb2wsICh2YWwsIGtleSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh2YWwpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgY3VzdG9tIGV4cHJlc3Npb24gaXMgcHJlc2VudCwga2VlcCBpdCBpbnNpZGUgdGFibGUgY29sdW1uLiBFbHNlLCBrZWVwIGFzIGF0dHJpYnV0ZVxuICAgICAgICAgICAgICAgICAgICBpZiAoa2V5ID09PSAnY3VzdG9tRXhwcmVzc2lvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1c3RvbVRtcGwgPSB2YWw7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhdHRyc1RtcGwgKz0gYCAke2tleX09XCIke3ZhbH1cImA7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRtcGwgKz0gYDx3bS10YWJsZS1jb2x1bW4gJHthdHRyc1RtcGx9IHRhYmxlTmFtZT1cIiR7dGhpcy5uYW1lfVwiPiR7Y3VzdG9tVG1wbH08L3dtLXRhYmxlLWNvbHVtbj5gO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5keW5hbWljVGFibGVSZWYuY2xlYXIoKTtcbiAgICAgICAgaWYgKCF0aGlzLl9keW5hbWljQ29udGV4dCkge1xuICAgICAgICAgICAgdGhpcy5fZHluYW1pY0NvbnRleHQgPSBPYmplY3QuY3JlYXRlKHRoaXMudmlld1BhcmVudCk7XG4gICAgICAgICAgICB0aGlzLl9keW5hbWljQ29udGV4dFt0aGlzLmdldEF0dHIoJ3dtVGFibGUnKV0gPSB0aGlzO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubm9PZkNvbHVtbnMgPSBjb2x1bW5zLmxlbmd0aDtcbiAgICAgICAgY29uc3QgY29tcG9uZW50RmFjdG9yeVJlZiA9IGF3YWl0IHRoaXMuZHluYW1pY0NvbXBvbmVudFByb3ZpZGVyLmdldENvbXBvbmVudEZhY3RvcnlSZWYoXG4gICAgICAgICAgICAnYXBwLXRhYmxlLWR5bmFtaWMtJyArIHRoaXMud2lkZ2V0SWQsXG4gICAgICAgICAgICB0bXBsLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIG5vQ2FjaGU6IHRydWUsXG4gICAgICAgICAgICAgICAgdHJhbnNwaWxlOiB0cnVlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgY29tcG9uZW50ID0gdGhpcy5keW5hbWljVGFibGVSZWYuY3JlYXRlQ29tcG9uZW50KGNvbXBvbmVudEZhY3RvcnlSZWYsIDAsIHRoaXMuaW5qKTtcbiAgICAgICAgZXh0ZW5kUHJvdG8oY29tcG9uZW50Lmluc3RhbmNlLCB0aGlzLl9keW5hbWljQ29udGV4dCk7XG4gICAgICAgIHRoaXMuJGVsZW1lbnQuZmluZCgnLmR5bmFtaWMtdGFibGUtY29udGFpbmVyJylbMF0uYXBwZW5kQ2hpbGQoY29tcG9uZW50LmxvY2F0aW9uLm5hdGl2ZUVsZW1lbnQpO1xuICAgIH1cblxuICAgIHByZXBhcmVDb2xEZWZzKGRhdGEpIHtcbiAgICAgICAgbGV0IGRlZmF1bHRGaWVsZERlZnM7XG4gICAgICAgIGxldCBwcm9wZXJ0aWVzO1xuXG4gICAgICAgIHRoaXMuZmllbGREZWZzID0gW107XG4gICAgICAgIHRoaXMuaGVhZGVyQ29uZmlnID0gW107XG4gICAgICAgIHRoaXMuY29sdW1ucyA9IHt9O1xuICAgICAgICAvKiBpZiBwcm9wZXJ0aWVzIG1hcCBpcyBleGlzdGVkIHRoZW4gZmV0Y2ggdGhlIGNvbHVtbiBjb25maWd1cmF0aW9uIGZvciBhbGwgbmVzdGVkIGxldmVscyB1c2luZyB1dGlsIGZ1bmN0aW9uICovXG4gICAgICAgIHByb3BlcnRpZXMgPSBkYXRhO1xuICAgICAgICAvKmNhbGwgdXRpbGl0eSBmdW5jdGlvbiB0byBwcmVwYXJlIGZpZWxkRGVmcyBmb3IgZ3JpZCBhZ2FpbnN0IGdpdmVuIGRhdGEgKEEgTUFYIE9GIDEwIENPTFVNTlMgT05MWSkqL1xuICAgICAgICBkZWZhdWx0RmllbGREZWZzID0gcHJlcGFyZUZpZWxkRGVmcyhwcm9wZXJ0aWVzKTtcblxuICAgICAgICAvKmFwcGVuZCBhZGRpdGlvbmFsIHByb3BlcnRpZXMqL1xuICAgICAgICBfLmZvckVhY2goZGVmYXVsdEZpZWxkRGVmcywgY29sdW1uRGVmID0+IHtcbiAgICAgICAgICAgIGNvbHVtbkRlZi5iaW5kaW5nID0gY29sdW1uRGVmLmZpZWxkO1xuICAgICAgICAgICAgY29sdW1uRGVmLmNhcHRpb24gPSBjb2x1bW5EZWYuZGlzcGxheU5hbWU7XG4gICAgICAgICAgICBjb2x1bW5EZWYucGNEaXNwbGF5ID0gdHJ1ZTtcbiAgICAgICAgICAgIGNvbHVtbkRlZi5tb2JpbGVEaXNwbGF5ID0gdHJ1ZTtcbiAgICAgICAgICAgIGNvbHVtbkRlZi5zZWFyY2hhYmxlID0gdHJ1ZTtcbiAgICAgICAgICAgIGNvbHVtbkRlZi50eXBlICA9ICdzdHJpbmcnO1xuICAgICAgICB9KTtcblxuICAgICAgICBkZWZhdWx0RmllbGREZWZzLmZvckVhY2goY29sID0+IHtcbiAgICAgICAgICAgIHRoaXMuY29sdW1uc1tjb2wuZmllbGRdID0gY29sO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmludm9rZUV2ZW50Q2FsbGJhY2soJ2JlZm9yZWRhdGFyZW5kZXInLCB7JGRhdGE6IGRhdGEsICRjb2x1bW5zOiB0aGlzLmNvbHVtbnMsIGRhdGE6IGRhdGEsIGNvbHVtbnM6IHRoaXMuY29sdW1uc30pO1xuXG4gICAgICAgIGRlZmF1bHRGaWVsZERlZnMgPSBbXTtcbiAgICAgICAgLy8gQXBwbHkgdGhlIGNoYW5nZXMgbWFkZSBieSB0aGUgdXNlclxuICAgICAgICBfLmZvckVhY2godGhpcy5jb2x1bW5zLCB2YWwgPT4ge1xuICAgICAgICAgICAgZGVmYXVsdEZpZWxkRGVmcy5wdXNoKHZhbCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuZ2VuZXJhdGVEeW5hbWljQ29sdW1ucyhkZWZhdWx0RmllbGREZWZzKTtcbiAgICB9XG5cbiAgICBjcmVhdGVHcmlkQ29sdW1ucyhkYXRhKSB7XG4gICAgICAgIC8qIHRoaXMgY2FsbCBiYWNrIGZ1bmN0aW9uIHJlY2VpdmVzIHRoZSBkYXRhIGZyb20gdGhlIHZhcmlhYmxlICovXG4gICAgICAgIC8qIGNoZWNrIHdoZXRoZXIgZGF0YSBpcyB2YWxpZCBvciBub3QgKi9cbiAgICAgICAgY29uc3QgZGF0YVZhbGlkID0gZGF0YSAmJiAhZGF0YS5lcnJvcjtcbiAgICAgICAgLyppZiB0aGUgZGF0YSBpcyB0eXBlIGpzb24gb2JqZWN0LCBtYWtlIGl0IGFuIGFycmF5IG9mIHRoZSBvYmplY3QqL1xuICAgICAgICBpZiAoZGF0YVZhbGlkICYmICFfLmlzQXJyYXkoZGF0YSkpIHtcbiAgICAgICAgICAgIGRhdGEgPSBbZGF0YV07XG4gICAgICAgIH1cbiAgICAgICAgLyogaWYgdGhlIGRhdGEgaXMgZW1wdHksIHNob3cgbm9kYXRhbWVzc2FnZSAqL1xuICAgICAgICBpZiAoXy5pc0VtcHR5KGRhdGEpKSB7XG4gICAgICAgICAgICB0aGlzLnNldEdyaWREYXRhKGRhdGEpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCFkYXRhVmFsaWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvKiBpZiBuZXcgY29sdW1ucyB0byBiZSByZW5kZXJlZCwgcHJlcGFyZSBkZWZhdWx0IGZpZWxkRGVmcyBmb3IgdGhlIGRhdGEgcHJvdmlkZWQqL1xuICAgICAgICB0aGlzLnByZXBhcmVDb2xEZWZzKGRhdGEpO1xuXG4gICAgICAgIHRoaXMuc2VydmVyRGF0YSA9IGRhdGE7XG4gICAgICAgIHRoaXMuc2V0R3JpZERhdGEodGhpcy5zZXJ2ZXJEYXRhKTtcbiAgICB9XG5cbiAgICBnZXRTb3J0RXhwcigpIHtcbiAgICAgICAgbGV0IHNvcnRFeHA7XG4gICAgICAgIGxldCBwYWdpbmdPcHRpb25zO1xuICAgICAgICBpZiAodGhpcy5kYXRhc291cmNlICYmIHRoaXMuZGF0YXNvdXJjZS5leGVjdXRlKERhdGFTb3VyY2UuT3BlcmF0aW9uLklTX1BBR0VBQkxFKSkge1xuICAgICAgICAgICAgcGFnaW5nT3B0aW9ucyA9IHRoaXMuZGF0YXNvdXJjZS5leGVjdXRlKERhdGFTb3VyY2UuT3BlcmF0aW9uLkdFVF9QQUdJTkdfT1BUSU9OUyk7XG4gICAgICAgICAgICBzb3J0RXhwID0gXy5pc0VtcHR5KHBhZ2luZ09wdGlvbnMpID8gJycgOiBnZXRPcmRlckJ5RXhwcihwYWdpbmdPcHRpb25zLnNvcnQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzb3J0RXhwIHx8ICcnO1xuICAgIH1cblxuICAgIHdhdGNoVmFyaWFibGVEYXRhU2V0KG5ld1ZhbCkge1xuICAgICAgICBsZXQgcmVzdWx0O1xuICAgICAgICAvLyBBZnRlciB0aGUgc2V0dGluZyB0aGUgd2F0Y2ggb24gbmF2aWdhdG9yLCBkYXRhc2V0IGlzIHRyaWdnZXJlZCB3aXRoIHVuZGVmaW5lZC4gSW4gdGhpcyBjYXNlLCByZXR1cm4gaGVyZS5cbiAgICAgICAgaWYgKHRoaXMuZGF0YU5hdmlnYXRvcldhdGNoZWQgJiYgXy5pc1VuZGVmaW5lZChuZXdWYWwpICYmIHRoaXMuX19mdWxsRGF0YSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIElmIHZhcmlhYmxlIGlzIGluIGxvYWRpbmcgc3RhdGUsIHNob3cgbG9hZGluZyBpY29uXG4gICAgICAgIGlmICh0aGlzLnZhcmlhYmxlSW5mbGlnaHQpIHtcbiAgICAgICAgICAgIHRoaXMuY2FsbERhdGFHcmlkTWV0aG9kKCdzZXRTdGF0dXMnLCAnbG9hZGluZycsIHRoaXMubG9hZGluZ2RhdGFtc2cpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVzdWx0ID0gZ2V0VmFsaWRKU09OKG5ld1ZhbCk7XG5cbiAgICAgICAgLy8gQ29udmVydGluZyBuZXd2YWwgdG8gb2JqZWN0IGlmIGl0IGlzIGFuIE9iamVjdCB0aGF0IGNvbWVzIGFzIGEgc3RyaW5nIFwie1wiZGF0YVwiIDogMX1cIlxuICAgICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgICAgICBuZXdWYWwgPSByZXN1bHQ7XG4gICAgICAgIH1cblxuICAgICAgICAvKlJldHVybiBpZiBkYXRhIGlzIGludmFsaWQuKi9cbiAgICAgICAgaWYgKCF0aGlzLmlzRGF0YVZhbGlkKCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIElmIHZhbHVlIGlzIGVtcHR5IG9yIGluIHN0dWRpbyBtb2RlLCBkb250IGVuYWJsZSB0aGUgbmF2aWdhdGlvblxuICAgICAgICBpZiAobmV3VmFsKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5zaG93bmF2aWdhdGlvbiAmJiAhdGhpcy5kYXRhTmF2aWdhdG9yV2F0Y2hlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZW5hYmxlUGFnZU5hdmlnYXRpb24oKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnJlc2V0UGFnZU5hdmlnYXRpb24oKTtcbiAgICAgICAgICAgIC8qZm9yIHJ1biBtb2RlLCBkaXNhYmxpbmcgdGhlIGxvYWRlciBhbmQgc2hvd2luZyBubyBkYXRhIGZvdW5kIG1lc3NhZ2UgaWYgZGF0YXNldCBpcyBub3QgdmFsaWQqL1xuICAgICAgICAgICAgaWYgKCF0aGlzLnZhcmlhYmxlSW5mbGlnaHQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNhbGxEYXRhR3JpZE1ldGhvZCgnc2V0U3RhdHVzJywgJ25vZGF0YScsIHRoaXMubm9kYXRhbWVzc2FnZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnNldERhdGFHcmlkT3B0aW9uKCdzZWxlY3RGaXJzdFJvdycsIHRoaXMuZ3JpZGZpcnN0cm93c2VsZWN0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy5pc05hdmlnYXRpb25FbmFibGVkKCkgJiYgbmV3VmFsKSB7XG4gICAgICAgICAgICB0aGlzLmNoZWNrRmlsdGVyc0FwcGxpZWQodGhpcy5nZXRTb3J0RXhwcigpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghXy5pc09iamVjdChuZXdWYWwpIHx8IG5ld1ZhbCA9PT0gJycgfHwgKG5ld1ZhbCAmJiBuZXdWYWwuZGF0YVZhbHVlID09PSAnJykpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy52YXJpYWJsZUluZmxpZ2h0KSB7XG4gICAgICAgICAgICAgICAgLy8gSWYgdmFyaWFibGUgaGFzIGZpbmlzaGVkIGxvYWRpbmcgYW5kIHJlc3VsdFNldCBpcyBlbXB0eSwgZW5kZXIgZW1wdHkgZGF0YVxuICAgICAgICAgICAgICAgIHRoaXMuc2V0R3JpZERhdGEoW10pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChuZXdWYWwpIHtcbiAgICAgICAgICAgIHRoaXMucG9wdWxhdGVHcmlkRGF0YShuZXdWYWwpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25EYXRhU291cmNlQ2hhbmdlKCkge1xuICAgICAgICB0aGlzLmZpZWxkRGVmcy5mb3JFYWNoKGNvbCA9PiB7XG4gICAgICAgICAgIHRyaWdnZXJGbihjb2wub25EYXRhU291cmNlQ2hhbmdlICYmIGNvbC5vbkRhdGFTb3VyY2VDaGFuZ2UuYmluZChjb2wpKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgb25Qcm9wZXJ0eUNoYW5nZShrZXk6IHN0cmluZywgbnY6IGFueSwgb3Y/OiBhbnkpIHtcbiAgICAgICAgbGV0IGVuYWJsZU5ld1JvdztcbiAgICAgICAgc3dpdGNoIChrZXkpIHtcbiAgICAgICAgICAgIGNhc2UgJ2RhdGFzb3VyY2UnOlxuICAgICAgICAgICAgICAgIHRoaXMud2F0Y2hWYXJpYWJsZURhdGFTZXQodGhpcy5kYXRhc2V0KTtcbiAgICAgICAgICAgICAgICB0aGlzLm9uRGF0YVNvdXJjZUNoYW5nZSgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnZGF0YXNldCc6XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuYmluZGRhdGFzb3VyY2UgJiYgIXRoaXMuZGF0YXNvdXJjZSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMud2F0Y2hWYXJpYWJsZURhdGFTZXQobnYpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnZmlsdGVybW9kZSc6XG4gICAgICAgICAgICAgICAgdGhpcy5zZXREYXRhR3JpZE9wdGlvbignZmlsdGVybW9kZScsIG52KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3NlYXJjaGxhYmVsJzpcbiAgICAgICAgICAgICAgICB0aGlzLnNldERhdGFHcmlkT3B0aW9uKCdzZWFyY2hMYWJlbCcsIG52KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ25hdmlnYXRpb24nOlxuICAgICAgICAgICAgICAgIGlmIChudiA9PT0gJ0FkdmFuY2VkJykgeyAvLyBTdXBwb3J0IGZvciBvbGRlciBwcm9qZWN0cyB3aGVyZSBuYXZpZ2F0aW9uIHR5cGUgd2FzIGFkdmFuY2VkIGluc3RlYWQgb2YgY2xhc2ljXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubmF2aWdhdGlvbiA9ICdDbGFzc2ljJztcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAobnYgIT09ICdOb25lJykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNob3duYXZpZ2F0aW9uID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5uYXZDb250cm9scyA9IG52O1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnZ3JpZGZpcnN0cm93c2VsZWN0JzpcbiAgICAgICAgICAgICAgICB0aGlzLnNldERhdGFHcmlkT3B0aW9uKCdzZWxlY3RGaXJzdFJvdycsIG52KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2dyaWRjbGFzcyc6XG4gICAgICAgICAgICAgICAgdGhpcy5jYWxsRGF0YUdyaWRNZXRob2QoJ29wdGlvbicsICdjc3NDbGFzc05hbWVzLmdyaWQnLCBudik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdub2RhdGFtZXNzYWdlJzpcbiAgICAgICAgICAgICAgICB0aGlzLmNhbGxEYXRhR3JpZE1ldGhvZCgnb3B0aW9uJywgJ2RhdGFTdGF0ZXMubm9kYXRhJywgbnYpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnbG9hZGluZ2RhdGFtc2cnOlxuICAgICAgICAgICAgICAgIHRoaXMuY2FsbERhdGFHcmlkTWV0aG9kKCdvcHRpb24nLCAnZGF0YVN0YXRlcy5sb2FkaW5nJywgbnYpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnbG9hZGluZ2ljb24nOlxuICAgICAgICAgICAgICAgIHRoaXMuY2FsbERhdGFHcmlkTWV0aG9kKCdvcHRpb24nLCAnbG9hZGluZ2ljb24nLCBudik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdzcGFjaW5nJzpcbiAgICAgICAgICAgICAgICB0aGlzLmNhbGxEYXRhR3JpZE1ldGhvZCgnb3B0aW9uJywgJ3NwYWNpbmcnLCBudik7XG4gICAgICAgICAgICAgICAgaWYgKG52ID09PSAnY29uZGVuc2VkJykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm5hdmlnYXRpb25TaXplID0gJ3NtYWxsJztcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm5hdmlnYXRpb25TaXplID0gJyc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnZXhwb3J0Zm9ybWF0JzpcbiAgICAgICAgICAgICAgICB0aGlzLmV4cG9ydE9wdGlvbnMgPSBbXTtcbiAgICAgICAgICAgICAgICBpZiAobnYpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gUG9wdWxhdGUgb3B0aW9ucyBmb3IgZXhwb3J0IGRyb3AgZG93biBtZW51XG4gICAgICAgICAgICAgICAgICAgIF8uZm9yRWFjaChfLnNwbGl0KG52LCAnLCcpLCB0eXBlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZXhwb3J0T3B0aW9ucy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogdHlwZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpY29uOiBleHBvcnRJY29uTWFwcGluZ1t0eXBlXVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3Nob3duZXdyb3cnOlxuICAgICAgICAgICAgICAgIC8vIEVuYWJsZSBuZXcgcm93IGlmIHNob3duZXcgaXMgdHJ1ZSBvciBhZGROZXdSb3cgYnV0b24gaXMgcHJlc2VudFxuICAgICAgICAgICAgICAgIGVuYWJsZU5ld1JvdyA9IG52IHx8IF8uc29tZSh0aGlzLmFjdGlvbnMsIGFjdCA9PiBfLmluY2x1ZGVzKGFjdC5hY3Rpb24sICdhZGROZXdSb3coKScpKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNhbGxEYXRhR3JpZE1ldGhvZCgnb3B0aW9uJywgJ2FjdGlvbnNFbmFibGVkLm5ldycsIGVuYWJsZU5ld1Jvdyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdzaG93JzpcbiAgICAgICAgICAgICAgICBpZiAobnYpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdzaG93Jyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdoaWRlJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBzdXBlci5vblByb3BlcnR5Q2hhbmdlKGtleSwgbnYsIG92KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG9uU3R5bGVDaGFuZ2Uoa2V5LCBudiwgb3YpIHtcbiAgICAgICAgc3dpdGNoIChrZXkpIHtcbiAgICAgICAgICAgIGNhc2UgJ3dpZHRoJzpcbiAgICAgICAgICAgICAgICB0aGlzLmNhbGxEYXRhR3JpZE1ldGhvZCgnc2V0R3JpZERpbWVuc2lvbnMnLCAnd2lkdGgnLCBudik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdoZWlnaHQnOlxuICAgICAgICAgICAgICAgIHRoaXMuY2FsbERhdGFHcmlkTWV0aG9kKCdzZXRHcmlkRGltZW5zaW9ucycsICdoZWlnaHQnLCBudik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBzdXBlci5vblN0eWxlQ2hhbmdlKGtleSwgbnYsIG92KTtcbiAgICB9XG5cbiAgICBwb3B1bGF0ZUFjdGlvbnMoKSB7XG4gICAgICAgIHRoaXMuX2FjdGlvbnMuaGVhZGVyID0gW107XG4gICAgICAgIHRoaXMuX2FjdGlvbnMuZm9vdGVyID0gW107XG4gICAgICAgIF8uZm9yRWFjaCh0aGlzLmFjdGlvbnMsIChhY3Rpb24pID0+IHtcbiAgICAgICAgICAgIGlmIChfLmluY2x1ZGVzKGFjdGlvbi5wb3NpdGlvbiwgJ2hlYWRlcicpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fYWN0aW9ucy5oZWFkZXIucHVzaChhY3Rpb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKF8uaW5jbHVkZXMoYWN0aW9uLnBvc2l0aW9uLCAnZm9vdGVyJykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9hY3Rpb25zLmZvb3Rlci5wdXNoKGFjdGlvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8vIHRoaXMgbWV0aG9kIHdpbGwgcmVuZGVyIHRoZSBmaWx0ZXIgcm93LlxuICAgIHJlbmRlckR5bmFtaWNGaWx0ZXJDb2x1bW4oZmlsdGVUZW1SZWYpIHtcbiAgICAgICAgLy8gRm9yIGR5bmFtaWMgdGFibGUgbWFudWFsbHkgcHVzaGluZyB0aGUgZmlsdGVydGVtcGxhdGVSZWYgYXMgdGVtcGxhdGVSZWYgd2lsbCBub3QgYmUgYXZhaWxhYmxlIHByaW9yLlxuICAgICAgICBpZiAodGhpcy5pc2R5bmFtaWN0YWJsZSkge1xuICAgICAgICAgICAgKHRoaXMuZmlsdGVyVG1wbCBhcyBhbnkpLl9yZXN1bHRzLnB1c2goZmlsdGVUZW1SZWYpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVnaXN0ZXJDb2x1bW5zKHRhYmxlQ29sdW1uKSB7XG4gICAgICAgIGlmIChpc01vYmlsZSgpKSB7XG4gICAgICAgICAgICBpZiAoIXRhYmxlQ29sdW1uLm1vYmlsZURpc3BsYXkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAoIXRhYmxlQ29sdW1uLnBjRGlzcGxheSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjb25zdCBjb2xDb3VudCA9IHRoaXMuZmllbGREZWZzLnB1c2godGFibGVDb2x1bW4pO1xuICAgICAgICB0aGlzLmZ1bGxGaWVsZERlZnMucHVzaCh0YWJsZUNvbHVtbik7XG4gICAgICAgIHRoaXMucm93RmlsdGVyW3RhYmxlQ29sdW1uLmZpZWxkXSA9IHtcbiAgICAgICAgICAgIHZhbHVlOiB1bmRlZmluZWRcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy5maWVsZERlZnMuZm9yRWFjaChjb2wgPT4ge1xuICAgICAgICAgICAgdGhpcy5jb2x1bW5zW2NvbC5maWVsZF0gPSBjb2w7XG4gICAgICAgIH0pO1xuICAgICAgICAvLyBJZiBkeW5hbWljIGRhdGF0YWJsZSBhbmQgbGFzdCBjb2x1bW4sIHBhc3MgdGhlIGNvbHVtbnMgdG8ganF1ZXJ5IGRhdGF0YWJsZVxuICAgICAgICBpZiAodGhpcy5pc2R5bmFtaWN0YWJsZSAmJiBjb2xDb3VudCA9PT0gdGhpcy5ub09mQ29sdW1ucykge1xuICAgICAgICAgICAgdGhpcy5yZW5kZXJPcGVyYXRpb25Db2x1bW5zKCk7XG4gICAgICAgICAgICB0aGlzLnNldERhdGFHcmlkT3B0aW9uKCdjb2xEZWZzJywgdGhpcy5maWVsZERlZnMpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVnaXN0ZXJGb3JtRmllbGQobmFtZSwgZm9ybUZpZWxkKSB7XG4gICAgICAgIHRoaXMuZm9ybWZpZWxkc1tuYW1lXSA9IGZvcm1GaWVsZDtcbiAgICB9XG5cbiAgICByZWdpc3RlckFjdGlvbnModGFibGVBY3Rpb24pIHtcbiAgICAgICAgdGhpcy5hY3Rpb25zLnB1c2godGFibGVBY3Rpb24pO1xuICAgICAgICB0aGlzLnBvcHVsYXRlQWN0aW9ucygpO1xuICAgIH1cblxuICAgIHJlZ2lzdGVyUm93KHRhYmxlUm93LCByb3dJbnN0YW5jZSkge1xuICAgICAgICB0aGlzLnJvd0RlZiA9IHRhYmxlUm93O1xuICAgICAgICB0aGlzLnJvd0luc3RhbmNlID0gcm93SW5zdGFuY2U7XG4gICAgICAgIHRoaXMuY2FsbERhdGFHcmlkTWV0aG9kKCdvcHRpb24nLCAnY3NzQ2xhc3NOYW1lcy5yb3dFeHBhbmRJY29uJywgdGhpcy5yb3dEZWYuZXhwYW5kaWNvbik7XG4gICAgICAgIHRoaXMuY2FsbERhdGFHcmlkTWV0aG9kKCdvcHRpb24nLCAnY3NzQ2xhc3NOYW1lcy5yb3dDb2xsYXBzZUljb24nLCB0aGlzLnJvd0RlZi5jb2xsYXBzZWljb24pO1xuICAgICAgICB0aGlzLmdyaWRPcHRpb25zLnJvd0V4cGFuc2lvbkVuYWJsZWQgPSB0cnVlO1xuICAgICAgICB0aGlzLmdyaWRPcHRpb25zLnJvd0RlZiA9IHRoaXMucm93RGVmO1xuICAgIH1cblxuICAgIHJlZ2lzdGVyUm93QWN0aW9ucyh0YWJsZVJvd0FjdGlvbikge1xuICAgICAgICB0aGlzLnJvd0FjdGlvbnMucHVzaCh0YWJsZVJvd0FjdGlvbik7XG4gICAgfVxuXG4gICAgc2VsZWN0SXRlbShpdGVtLCBkYXRhKSB7XG4gICAgICAgIC8qIHNlcnZlciBpcyBub3QgdXBkYXRpbmcgaW1tZWRpYXRlbHksIHNvIHNldCB0aGUgc2VydmVyIGRhdGEgdG8gc3VjY2VzcyBjYWxsYmFjayBkYXRhICovXG4gICAgICAgIGlmIChkYXRhKSB7XG4gICAgICAgICAgICB0aGlzLnNlcnZlckRhdGEgPSBkYXRhO1xuICAgICAgICB9XG4gICAgICAgIGlmIChfLmlzT2JqZWN0KGl0ZW0pKSB7XG4gICAgICAgICAgICBpdGVtID0gXy5vbWl0QnkoaXRlbSwgKHZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF8uaXNBcnJheSh2YWx1ZSkgJiYgXy5pc0VtcHR5KHZhbHVlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY2FsbERhdGFHcmlkTWV0aG9kKCdzZWxlY3RSb3cnLCBpdGVtLCB0cnVlKTtcbiAgICB9XG4gICAgLyogZGVzZWxlY3QgdGhlIGdpdmVuIGl0ZW0qL1xuICAgIGRlc2VsZWN0SXRlbShpdGVtKSB7XG4gICAgICAgIHRoaXMuY2FsbERhdGFHcmlkTWV0aG9kKCdkZXNlbGVjdFJvdycsIGl0ZW0pO1xuICAgIH1cblxuICAgIG9uRGF0YU5hdmlnYXRvckRhdGFTZXRDaGFuZ2UobnYpIHtcbiAgICAgICAgbGV0IGRhdGE7XG4gICAgICAgIHRoaXMuX19mdWxsRGF0YSA9IG52O1xuICAgICAgICB0aGlzLmNoZWNrRmlsdGVyc0FwcGxpZWQodGhpcy5nZXRTb3J0RXhwcigpKTtcbiAgICAgICAgaWYgKHRoaXMuX2lzQ2xpZW50U2VhcmNoKSB7XG4gICAgICAgICAgICBkYXRhID0gZ2V0Q2xvbmVkT2JqZWN0KHRoaXMuX19mdWxsRGF0YSk7XG4gICAgICAgICAgICBpZiAoXy5pc09iamVjdChkYXRhKSAmJiAhXy5pc0FycmF5KGRhdGEpKSB7XG4gICAgICAgICAgICAgICAgZGF0YSA9IFtkYXRhXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRhdGEgPSB0aGlzLmdldFNlYXJjaFJlc3VsdChkYXRhLCB0aGlzLmZpbHRlckluZm8pO1xuICAgICAgICAgICAgZGF0YSA9IHRoaXMuZ2V0U29ydFJlc3VsdChkYXRhLCB0aGlzLnNvcnRJbmZvKTtcbiAgICAgICAgICAgIHJldHVybiBkYXRhO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudjtcbiAgICB9XG5cbiAgICB0b2dnbGVNZXNzYWdlKHNob3csIHR5cGUsIG1zZywgaGVhZGVyPykge1xuICAgICAgICBpZiAoc2hvdyAmJiBtc2cpIHtcbiAgICAgICAgICAgIHRoaXMuYXBwLm5vdGlmeUFwcChtc2csIHR5cGUsIGhlYWRlcik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBleHBvcnQoJGl0ZW0pIHtcbiAgICAgICAgbGV0IGZpbHRlckZpZWxkcztcbiAgICAgICAgY29uc3Qgc29ydE9wdGlvbnMgPSBfLmlzRW1wdHkodGhpcy5zb3J0SW5mbykgPyAnJyA6IHRoaXMuc29ydEluZm8uZmllbGQgKyAnICcgKyB0aGlzLnNvcnRJbmZvLmRpcmVjdGlvbjtcbiAgICAgICAgY29uc3QgY29sdW1ucyA9IHt9O1xuICAgICAgICBsZXQgaXNWYWxpZDtcbiAgICAgICAgbGV0IHJlcXVlc3REYXRhO1xuICAgICAgICB0aGlzLmZpZWxkRGVmcy5mb3JFYWNoKGZpZWxkRGVmID0+IHtcbiAgICAgICAgICAgIC8vIERvIG5vdCBhZGQgdGhlIHJvdyBvcGVyYXRpb24gYWN0aW9ucyBjb2x1bW4gdG8gdGhlIGV4cG9ydGVkIGZpbGUuXG4gICAgICAgICAgICBpZiAoZmllbGREZWYuZmllbGQgPT09IFJPV19PUFNfRklFTEQgfHwgIWZpZWxkRGVmLnNob3cpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBvcHRpb24gPSB7XG4gICAgICAgICAgICAgICAgJ2hlYWRlcic6IGZpZWxkRGVmLmRpc3BsYXlOYW1lXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgLy8gSWYgY29sdW1uIGhhcyBleHBvcnRleHByZXNzaW9uLCB0aGVuIHNlbmQgZm9ybSB0aGUgZXhwcmVzc2lvbiBhcyByZXF1aXJlZCBieSBiYWNrZW5kLlxuICAgICAgICAgICAgLy8gb3RoZXJ3aXNlIHNlbmQgdGhlIGZpZWxkIG5hbWUuXG4gICAgICAgICAgICBpZiAoZmllbGREZWYuZXhwb3J0ZXhwcmVzc2lvbikge1xuICAgICAgICAgICAgICAgICg8YW55Pm9wdGlvbikuZXhwcmVzc2lvbiA9IGZpZWxkRGVmLmV4cG9ydGV4cHJlc3Npb247XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICg8YW55Pm9wdGlvbikuZmllbGQgPSBmaWVsZERlZi5maWVsZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbHVtbnNbZmllbGREZWYuZmllbGRdID0gb3B0aW9uO1xuICAgICAgICB9KTtcbiAgICAgICAgZmlsdGVyRmllbGRzID0gdGhpcy5nZXRGaWx0ZXJGaWVsZHModGhpcy5maWx0ZXJJbmZvKTtcbiAgICAgICAgcmVxdWVzdERhdGEgPSB7XG4gICAgICAgICAgICBtYXRjaE1vZGUgOiAnYW55d2hlcmVpZ25vcmVjYXNlJyxcbiAgICAgICAgICAgIGZpbHRlckZpZWxkcyA6IGZpbHRlckZpZWxkcyxcbiAgICAgICAgICAgIG9yZGVyQnkgOiBzb3J0T3B0aW9ucyxcbiAgICAgICAgICAgIGV4cG9ydFR5cGUgOiAkaXRlbS5sYWJlbCxcbiAgICAgICAgICAgIGxvZ2ljYWxPcCA6ICdBTkQnLFxuICAgICAgICAgICAgZXhwb3J0U2l6ZSA6IHRoaXMuZXhwb3J0ZGF0YXNpemUsXG4gICAgICAgICAgICBjb2x1bW5zIDogY29sdW1uc1xuICAgICAgICB9O1xuICAgICAgICBpc1ZhbGlkID0gdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdiZWZvcmVleHBvcnQnLCB7JGRhdGE6IHJlcXVlc3REYXRhfSk7XG4gICAgICAgIGlmIChpc1ZhbGlkID09PSBmYWxzZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHJlcXVlc3REYXRhLmZpZWxkcyA9IF8udmFsdWVzKHJlcXVlc3REYXRhLmNvbHVtbnMpO1xuICAgICAgICB0aGlzLmRhdGFzb3VyY2UuZXhlY3V0ZShEYXRhU291cmNlLk9wZXJhdGlvbi5ET1dOTE9BRCwge2RhdGE6IHJlcXVlc3REYXRhfSk7XG4gICAgfVxuXG4gICAgZXhwYW5kUm93KHJvd0lkKSB7XG4gICAgICAgIHRoaXMuY2FsbERhdGFHcmlkTWV0aG9kKCdleHBhbmRSb3cnLCByb3dJZCk7XG4gICAgfVxuXG4gICAgY29sbGFwc2VSb3cocm93SWQpIHtcbiAgICAgICAgdGhpcy5jYWxsRGF0YUdyaWRNZXRob2QoJ2NvbGxhcHNlUm93Jywgcm93SWQpO1xuICAgIH1cblxuICAgIHByaXZhdGUgX2RvY3VtZW50Q2xpY2tCaW5kKGV2ZW50KSB7XG4gICAgICAgIGNvbnN0ICR0YXJnZXQgPSBldmVudC50YXJnZXQ7XG4gICAgICAgIC8vIElmIGNsaWNrIHRyaWdnZXJlZCBmcm9tIHNhbWUgZ3JpZCBvciBhIGRpYWxvZywgZG8gbm90IHNhdmUgdGhlIHJvd1xuICAgICAgICBpZiAodGhpcy4kZWxlbWVudFswXS5jb250YWlucygkdGFyZ2V0KSB8fCBldmVudC50YXJnZXQuZG9jdHlwZSB8fCBpc0lucHV0Qm9keVdyYXBwZXIoJCgkdGFyZ2V0KSkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNhbGxEYXRhR3JpZE1ldGhvZCgnc2F2ZVJvdycpO1xuICAgIH1cblxuICAgIHByaXZhdGUgX3JlZHJhdyhmb3JjZVJlbmRlcikge1xuICAgICAgICBpZiAoZm9yY2VSZW5kZXIpIHtcbiAgICAgICAgICAgIHRoaXMuZGF0YWdyaWRFbGVtZW50LmRhdGF0YWJsZSh0aGlzLmdyaWRPcHRpb25zKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuY2FsbERhdGFHcmlkTWV0aG9kKCdzZXRDb2xHcm91cFdpZHRocycpO1xuICAgICAgICAgICAgICAgIHRoaXMuY2FsbERhdGFHcmlkTWV0aG9kKCdhZGRPclJlbW92ZVNjcm9sbCcpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpbnZva2VBY3Rpb25FdmVudCgkZXZlbnQsIGV4cHJlc3Npb246IHN0cmluZykge1xuICAgICAgICBjb25zdCBmbiA9ICRwYXJzZUV2ZW50KGV4cHJlc3Npb24pO1xuICAgICAgICBmbih0aGlzLnZpZXdQYXJlbnQsIE9iamVjdC5hc3NpZ24odGhpcy5jb250ZXh0LCB7JGV2ZW50fSkpO1xuICAgIH1cblxuICAgIC8vIGNoYW5nZSBhbmQgYmx1ciBldmVudHMgYXJlIGFkZGVkIGZyb20gdGhlIHRlbXBsYXRlXG4gICAgcHJvdGVjdGVkIGhhbmRsZUV2ZW50KG5vZGU6IEhUTUxFbGVtZW50LCBldmVudE5hbWU6IHN0cmluZywgY2FsbGJhY2s6IEZ1bmN0aW9uLCBsb2NhbHM6IGFueSkge1xuICAgICAgICBpZiAoZXZlbnROYW1lICE9PSAnc2VsZWN0Jykge1xuICAgICAgICAgICAgc3VwZXIuaGFuZGxlRXZlbnQodGhpcy5uYXRpdmVFbGVtZW50LCBldmVudE5hbWUsIGNhbGxiYWNrLCBsb2NhbHMpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdHJpZ2dlclVwbG9hZEV2ZW50KCRldmVudCwgZXZlbnROYW1lLCBmaWVsZE5hbWUsIHJvdykge1xuICAgICAgICBjb25zdCBwYXJhbXM6IGFueSA9IHskZXZlbnQsIHJvd307XG4gICAgICAgIGlmICghdGhpcy5jb2x1bW5zW2ZpZWxkTmFtZV0pIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZXZlbnROYW1lID09PSAnY2hhbmdlJykge1xuICAgICAgICAgICAgcGFyYW1zLm5ld1ZhbCA9ICRldmVudC50YXJnZXQuZmlsZXM7XG4gICAgICAgICAgICBwYXJhbXMub2xkVmFsID0gdGhpcy5jb2x1bW5zW2ZpZWxkTmFtZV0uX29sZFVwbG9hZFZhbDtcbiAgICAgICAgICAgIHRoaXMuY29sdW1uc1tmaWVsZE5hbWVdLl9vbGRVcGxvYWRWYWwgPSBwYXJhbXMubmV3VmFsO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY29sdW1uc1tmaWVsZE5hbWVdLmludm9rZUV2ZW50Q2FsbGJhY2soZXZlbnROYW1lLCBwYXJhbXMpO1xuICAgIH1cblxuICAgIHJlZ2lzdGVyRm9ybVdpZGdldCgpIHt9XG5cbiAgICAvLyBGb3JtIGNvbnRyb2wgYWNjZXNzb3IgbWV0aG9kcy4gVGhpcyB3aWxsIGJlIHVzZWQgZm9yIHRhYmxlIGluc2lkZSBmb3JtXG4gICAgd3JpdGVWYWx1ZSgpIHt9XG5cbiAgICBwcml2YXRlIF9vbkNoYW5nZTogYW55ID0gKCkgPT4ge307XG4gICAgcHJpdmF0ZSBfb25Ub3VjaGVkOiBhbnkgPSAoKSA9PiB7fTtcblxuICAgIHJlZ2lzdGVyT25DaGFuZ2UoZm4pIHtcbiAgICAgICAgdGhpcy5fb25DaGFuZ2UgPSBmbjtcbiAgICB9XG4gICAgcmVnaXN0ZXJPblRvdWNoZWQoZm4pIHtcbiAgICAgICAgdGhpcy5fb25Ub3VjaGVkID0gZm47XG4gICAgfVxufVxuIl19