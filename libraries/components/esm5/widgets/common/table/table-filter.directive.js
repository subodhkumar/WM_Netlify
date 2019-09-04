import { Directive, Inject, Self } from '@angular/core';
import { $appDigest, DataSource, DataType, FormWidgetType, getClonedObject, isDefined, isNumberType } from '@wm/core';
import { TableComponent } from './table.component';
import { refreshDataSource } from '../../../utils/data-utils';
import { getMatchModeMsgs, getMatchModeTypesMap, isDataSetWidget } from '../../../utils/widget-utils';
var emptyMatchModes = ['null', 'empty', 'nullorempty', 'isnotnull', 'isnotempty'];
// Get search value based on the time
var getSearchValue = function (value, type) {
    if (!isDefined(value) || value === '') {
        return undefined;
    }
    if (isNumberType(type)) {
        return _.toNumber(value);
    }
    if (type === DataType.DATETIME) {
        return moment(value).valueOf();
    }
    return _.toString(value).toLowerCase();
};
var ɵ0 = getSearchValue;
// Filter the data based on the search value and conditions
var getFilteredData = function (data, searchObj) {
    var searchVal = getSearchValue(searchObj.value, searchObj.type);
    var currentVal;
    if (!isDefined(searchVal) && !_.includes(emptyMatchModes, searchObj.matchMode)) {
        return data;
    }
    data = data.filter(function (obj) {
        var isExists;
        if (searchObj.field) {
            currentVal = getSearchValue(_.get(obj, searchObj.field), searchObj.type);
        }
        else {
            currentVal = _.values(obj).join(' ').toLowerCase(); // If field is not there, search on all the columns
        }
        switch (searchObj.matchMode) {
            case 'start':
                isExists = _.startsWith(currentVal, searchVal);
                break;
            case 'end':
                isExists = _.endsWith(currentVal, searchVal);
                break;
            case 'exact':
                isExists = _.isEqual(currentVal, searchVal);
                break;
            case 'notequals':
                isExists = !_.isEqual(currentVal, searchVal);
                break;
            case 'null':
                isExists = _.isNull(currentVal);
                break;
            case 'isnotnull':
                isExists = !_.isNull(currentVal);
                break;
            case 'empty':
                isExists = _.isEmpty(currentVal);
                break;
            case 'isnotempty':
                isExists = !_.isEmpty(currentVal);
                break;
            case 'nullorempty':
                isExists = _.isNull(currentVal) || _.isEmpty(currentVal);
                break;
            case 'lessthan':
                isExists = currentVal < searchVal;
                break;
            case 'lessthanequal':
                isExists = currentVal <= searchVal;
                break;
            case 'greaterthan':
                isExists = currentVal > searchVal;
                break;
            case 'greaterthanequal':
                isExists = currentVal >= searchVal;
                break;
            default:
                isExists = isNumberType(searchObj.type) ? _.isEqual(currentVal, searchVal) : _.includes(currentVal, searchVal);
                break;
        }
        return isExists;
    });
    return data;
};
var ɵ1 = getFilteredData;
// Set the filter fields as required by datasource
var setFilterFields = function (filterFields, searchObj) {
    var field = searchObj && searchObj.field;
    /*Set the filter options only when a field/column has been selected.*/
    if (field) {
        filterFields[field] = {
            'value': searchObj.value,
            'logicalOp': 'AND'
        };
        if (searchObj.matchMode) {
            filterFields[field].matchMode = searchObj.matchMode;
        }
    }
};
var ɵ2 = setFilterFields;
// Transform filter fields from array to object having field names as keys
var transformFilterField = function (userFilters, filterField) {
    if (filterField.field) {
        userFilters[filterField.field] = {
            value: filterField.value,
            matchMode: filterField.matchMode,
            type: filterField.type
        };
    }
};
var ɵ3 = transformFilterField;
var TableFilterSortDirective = /** @class */ (function () {
    function TableFilterSortDirective(table) {
        this.table = table;
        table._searchSortHandler = this.searchSortHandler.bind(this);
        table.getSearchResult = this.getSearchResult.bind(this);
        table.getSortResult = this.getSortResult.bind(this);
        table.checkFiltersApplied = this.checkFiltersApplied.bind(this);
        table.getFilterFields = this.getFilterFields.bind(this);
        table.onRowFilterChange = this.onRowFilterChange.bind(this);
        table.onFilterConditionSelect = this.onFilterConditionSelect.bind(this);
        table.showClearIcon = this.showClearIcon.bind(this);
        table.clearRowFilter = this.clearRowFilter.bind(this);
        table.matchModeTypesMap = getMatchModeTypesMap();
        table.matchModeMsgs = getMatchModeMsgs(table.appLocale);
        table.emptyMatchModes = emptyMatchModes;
        table.getNavigationTargetBySortInfo = this.getNavigationTargetBySortInfo.bind(this);
        table.refreshData = this.refreshData.bind(this);
        table.clearFilter = this.clearFilter.bind(this);
    }
    // Get first or last page based on sort info of primary key
    TableFilterSortDirective.prototype.getNavigationTargetBySortInfo = function () {
        return this.table.sortInfo && this.table.sortInfo.direction === 'desc' &&
            _.includes(this.table.primaryKey, this.table.sortInfo.field) ? 'first' : 'last';
    };
    // Get the filter fields as required by datasource
    TableFilterSortDirective.prototype.getFilterFields = function (searchObj) {
        var filterFields = {};
        if (_.isArray(searchObj)) {
            _.forEach(searchObj, function (obj) {
                setFilterFields(filterFields, obj);
            });
        }
        else {
            setFilterFields(filterFields, searchObj);
        }
        return filterFields;
    };
    // Reset the sort based on sort returned by the call
    TableFilterSortDirective.prototype.resetSortStatus = function (variableSort) {
        var gridSortString;
        if (!_.isEmpty(this.table.sortInfo) && this.table.datasource) {
            gridSortString = this.table.sortInfo.field + ' ' + this.table.sortInfo.direction;
            variableSort = this.table.datasource.execute(DataSource.Operation.GET_OPTIONS).orderBy || variableSort;
            if (variableSort) { // If multiple order by fields are present, compare with the first one
                variableSort = _.head(_.split(variableSort, ','));
            }
            if (gridSortString !== variableSort) {
                this.table.callDataGridMethod('resetSortIcons');
                this.table.sortInfo = {};
                this.table.setDataGridOption('sortInfo', {});
            }
        }
    };
    // Clear the all the filters applied
    TableFilterSortDirective.prototype.clearFilter = function (skipFilter) {
        var $gridElement;
        this.table.filterInfo = {};
        if (this.table.filtermode === 'multicolumn') {
            this.table.fieldDefs.forEach(function (col) {
                if (col.resetFilter) {
                    col.resetFilter();
                }
            });
            if (!skipFilter) {
                this.table.onRowFilterChange();
            }
        }
        else if (this.table.filtermode === 'search') {
            $gridElement = this.table.datagridElement;
            $gridElement.find('[data-element="dgSearchText"]').val('');
            $gridElement.find('[data-element="dgFilterValue"]').val('');
            if (!skipFilter) {
                $gridElement.find('.app-search-button').trigger('click');
            }
        }
    };
    // Check the filters applied and remove if dat does not contain any filters
    TableFilterSortDirective.prototype.checkFiltersApplied = function (variableSort) {
        if (!this.table.datasource) {
            return;
        }
        if (this.table.datasource.execute(DataSource.Operation.SUPPORTS_SERVER_FILTER)) {
            if (_.isEmpty(this.table.datasource.execute(DataSource.Operation.GET_OPTIONS).filterFields) && _.isEmpty(this.table.filterInfo)) {
                this.clearFilter(true);
            }
            this.resetSortStatus(variableSort);
            return;
        }
        if (this.table.datasource.execute(DataSource.Operation.IS_PAGEABLE)) {
            this.resetSortStatus(variableSort);
        }
    };
    // Returns data filtered using searchObj
    TableFilterSortDirective.prototype.getSearchResult = function (data, searchObj) {
        if (!searchObj) {
            return data;
        }
        if (_.isArray(searchObj)) {
            searchObj.forEach(function (obj) {
                data = getFilteredData(data, obj);
            });
        }
        else {
            data = getFilteredData(data, searchObj);
        }
        return data;
    };
    // Returns data sorted using sortObj
    TableFilterSortDirective.prototype.getSortResult = function (data, sortObj) {
        if (sortObj && sortObj.direction) {
            data = _.orderBy(data, sortObj.field, sortObj.direction);
        }
        return data;
    };
    // This method handles the client side sort and search
    TableFilterSortDirective.prototype.handleClientSideSortSearch = function (searchSortObj, e, type) {
        this.table._isClientSearch = true;
        var data;
        data = this.table.isNavigationEnabled() ? getClonedObject(this.table.__fullData) : getClonedObject(this.table.dataset);
        if (type === 'search') {
            this.table.filterInfo = searchSortObj;
        }
        else {
            this.table.sortInfo = searchSortObj;
        }
        if (_.isObject(data) && !_.isArray(data)) {
            data = [data];
        }
        /*Both the functions return same 'data' if arguments are undefined*/
        data = this.getSearchResult(data, this.table.filterInfo);
        data = this.getSortResult(data, this.table.sortInfo);
        this.table.serverData = data;
        if (type === 'sort') {
            // Calling 'onSort' event
            this.table.invokeEventCallback('sort', { $event: e, $data: {
                    data: this.table.serverData,
                    sortDirection: this.table.sortInfo.direction,
                    colDef: this.table.columns[this.table.sortInfo.field]
                } });
        }
        if (this.table.isNavigationEnabled()) {
            // Reset the page number to 1
            this.table.dataNavigator.dn.currentPage = 1;
            this.table.dataNavigator.setPagingValues(data);
        }
        else {
            this.table.setGridData(this.table.serverData);
        }
    };
    // This method handles the search for pageable datasource
    TableFilterSortDirective.prototype.handleSinglePageSearch = function (searchObj) {
        this.table._isPageSearch = true;
        var data = getClonedObject(this.table.gridData);
        var $rows = this.table.datagridElement.find('tbody tr.app-datagrid-row');
        this.table.filterInfo = searchObj;
        data = this.getSearchResult(data, searchObj);
        // Compared the filtered data and original data, to show or hide the rows
        _.forEach(this.table.gridData, function (value, index) {
            var $row = $($rows[index]);
            if (_.find(data, function (obj) { return _.isEqual(obj, value); })) {
                $row.show();
            }
            else {
                $row.hide();
            }
        });
        if (data && data.length) {
            this.table.callDataGridMethod('setStatus', 'ready');
            // Select the first row after the search for single select
            if (this.table.gridfirstrowselect && !this.table.multiselect) {
                this.table.callDataGridMethod('selectFirstRow', true, true);
            }
        }
        else {
            this.table.callDataGridMethod('setStatus', 'nodata', this.table.nodatamessage);
            this.table.selecteditem = undefined;
        }
        this.table.callDataGridMethod('updateSelectAllCheckboxState');
    };
    // This method handles the search for server side variables
    TableFilterSortDirective.prototype.handleServerSideSearch = function (searchObj) {
        var _this = this;
        this.table.filterInfo = searchObj;
        if (!this.table.datasource) {
            return;
        }
        var sortInfo = this.table.sortInfo;
        var sortOptions = sortInfo && sortInfo.direction ? (sortInfo.field + ' ' + sortInfo.direction) : '';
        var filterFields = this.getFilterFields(searchObj);
        refreshDataSource(this.table.datasource, {
            page: 1,
            filterFields: filterFields,
            orderBy: sortOptions
        }).then(function () {
            $appDigest();
        }, function () {
            _this.table.toggleMessage(true, 'error', _this.table.nodatamessage);
        });
    };
    // This method handles the sort for server side variables
    TableFilterSortDirective.prototype.handleSeverSideSort = function (sortObj, e) {
        var _this = this;
        // Update the sort info for passing to datagrid
        this.table.gridOptions.sortInfo.field = sortObj.field;
        this.table.gridOptions.sortInfo.direction = sortObj.direction;
        this.table.sortInfo = getClonedObject(sortObj);
        var sortOptions = sortObj && sortObj.direction ? (sortObj.field + ' ' + sortObj.direction) : '';
        var filterFields = this.getFilterFields(this.table.filterInfo);
        refreshDataSource(this.table.datasource, {
            page: 1,
            filterFields: filterFields,
            orderBy: sortOptions
        }).then(function (response) {
            $appDigest();
            var data = (response && response.data) ? response.data : response;
            _this.table.invokeEventCallback('sort', { $event: e, $data: {
                    data: data,
                    sortDirection: sortObj.direction,
                    colDef: _this.table.columns[sortObj.field]
                } });
        });
    };
    TableFilterSortDirective.prototype.searchHandler = function (searchSortObj, e, type) {
        var filterFields = getClonedObject(searchSortObj);
        var dataSource = this.table.datasource;
        if (!dataSource) {
            return;
        }
        var output;
        var userFilters = {};
        // Transform filter fields from array to object having field names as keys
        if (_.isArray(filterFields)) {
            filterFields.forEach(function (filterField) {
                transformFilterField(userFilters, filterField);
            });
        }
        else {
            transformFilterField(userFilters, filterFields);
        }
        output = this.table.invokeEventCallback('beforefilter', { $event: e, $data: userFilters, columns: userFilters });
        // If callback returns false, don't trigger the filter call
        if (output === false) {
            return;
        }
        // Transform back the filter fields from object to array
        filterFields = [];
        _.forEach(userFilters, function (val, key) {
            filterFields.push({
                field: key,
                matchMode: val.matchMode,
                type: val.type,
                value: val.value
            });
        });
        if (dataSource.execute(DataSource.Operation.SUPPORTS_SERVER_FILTER)) {
            this.handleServerSideSearch(filterFields);
            return;
        }
        if (dataSource.execute(DataSource.Operation.IS_API_AWARE) && dataSource.execute(DataSource.Operation.IS_PAGEABLE)) {
            this.handleSinglePageSearch(filterFields);
        }
        else {
            this.handleClientSideSortSearch(filterFields, e, type);
        }
    };
    TableFilterSortDirective.prototype.sortHandler = function (searchSortObj, e, type) {
        var dataSource = this.table.datasource;
        if (!dataSource) {
            return;
        }
        if (dataSource.execute(DataSource.Operation.IS_PAGEABLE)) {
            this.handleSeverSideSort(searchSortObj, e);
        }
        else {
            this.handleClientSideSortSearch(searchSortObj, e, type);
        }
    };
    // This method is triggered by jquery table
    TableFilterSortDirective.prototype.searchSortHandler = function (searchSortObj, e, type) {
        if (type === 'search') {
            this.searchHandler(searchSortObj, e, type);
        }
        else {
            this.sortHandler(searchSortObj, e, type);
        }
    };
    // Method to show/hide clear icon in multi column filter
    TableFilterSortDirective.prototype.showClearIcon = function (fieldName) {
        var value = this.table.rowFilter[fieldName] && this.table.rowFilter[fieldName].value;
        return isDefined(value) && value !== '' && value !== null;
    };
    // Method clear the filter value in multi column filter
    TableFilterSortDirective.prototype.clearRowFilter = function (fieldName) {
        if (this.table.rowFilter && this.table.rowFilter[fieldName]) {
            this.table.columns[fieldName].resetFilter();
            this.onRowFilterChange(fieldName);
        }
    };
    // This method is triggered on select of condition in multi column filter
    TableFilterSortDirective.prototype.onFilterConditionSelect = function (fieldName, condition) {
        var _this = this;
        this.table.rowFilter[fieldName] = this.table.rowFilter[fieldName] || {};
        this.table.rowFilter[fieldName].matchMode = condition;
        // For empty match modes, clear off the value and call filter
        if (_.includes(this.table.emptyMatchModes, condition)) {
            this.table.columns[fieldName].resetFilter();
            this.table.onRowFilterChange();
        }
        else {
            // If value is present, call the filter. Else, focus on the field
            if (isDefined(this.table.rowFilter[fieldName].value) && this.table.rowFilter[fieldName].value !== '') {
                this.table.onRowFilterChange();
            }
            else {
                setTimeout(function () {
                    _this.table.columns[fieldName].filterInstance.focus();
                });
            }
        }
    };
    // Method to get the updated values when filter on field is changed for multicolumn filter
    TableFilterSortDirective.prototype.getFilterOnFieldValues = function (filterDef) {
        var _this = this;
        if (!this.table.datasource || !this.table.datasource.execute(DataSource.Operation.SUPPORTS_DISTINCT_API)) {
            return;
        }
        var fieldName = filterDef.field;
        var formFields = this.table.fullFieldDefs;
        var filterOnFields = _.filter(formFields, { 'filteronfilter': fieldName });
        var newVal = _.get(this.table.rowFilter, [fieldName, 'value']);
        // Loop over the fields for which the current field is filter on field
        _.forEach(filterOnFields, function (filterField) {
            var filterOn = filterField.filteronfilter;
            var filterKey = filterField.field;
            var filterFields = {};
            var filterWidget = filterField.filterwidget;
            if (!isDataSetWidget(filterWidget) || filterOn === filterKey || filterField.isFilterDataSetBound) {
                return;
            }
            filterFields[filterOn] = (isDefined(newVal) && newVal !== '' && newVal !== null) ? { 'value': newVal } : {};
            if (filterWidget === FormWidgetType.AUTOCOMPLETE && filterField.filterInstance.dataoptions) {
                filterField.filterInstance.dataoptions.filterFields = filterFields;
            }
            else {
                _this.table.datasource.execute(DataSource.Operation.GET_DISTINCT_DATA_BY_FIELDS, {
                    'fields': filterKey,
                    'filterFields': filterFields
                }).then(function (data) {
                    filterField.filterdataset = data.data;
                });
            }
        });
    };
    // This method is triggered on value change in multi column filter
    TableFilterSortDirective.prototype.onRowFilterChange = function (fieldName) {
        var _this = this;
        var searchObj = [];
        var field = _.find(this.table.fullFieldDefs, { 'field': fieldName });
        // Convert row filters to a search object and call search handler
        _.forEach(this.table.rowFilter, function (value, key) {
            if ((isDefined(value.value) && value.value !== '') || _.includes(_this.table.emptyMatchModes, value.matchMode)) {
                if (field && key === field.field) {
                    value.type = value.type || field.type;
                    value.matchMode = value.matchMode || _.get(_this.table.matchModeTypesMap[value.type], 0);
                }
                searchObj.push({
                    field: key,
                    value: value.value,
                    matchMode: value.matchMode,
                    type: value.type
                });
            }
        });
        this.table.gridOptions.searchHandler(searchObj, undefined, 'search');
        // If field is passed, update any filter on field values if present
        if (field) {
            this.getFilterOnFieldValues(field);
        }
    };
    TableFilterSortDirective.prototype.refreshData = function (isSamePage) {
        if (!this.table.datasource) {
            return;
        }
        var page = isSamePage ? this.table.dataNavigator.dn.currentPage : 1;
        var sortInfo = this.table.sortInfo;
        var sortOptions = sortInfo && sortInfo.direction ? (sortInfo.field + ' ' + sortInfo.direction) : '';
        var filterFields = this.getFilterFields(this.table.filterInfo);
        refreshDataSource(this.table.datasource, {
            page: page,
            filterFields: filterFields,
            orderBy: sortOptions
        });
    };
    TableFilterSortDirective.decorators = [
        { type: Directive, args: [{
                    selector: '[wmTableFilterSort]'
                },] }
    ];
    /** @nocollapse */
    TableFilterSortDirective.ctorParameters = function () { return [
        { type: undefined, decorators: [{ type: Self }, { type: Inject, args: [TableComponent,] }] }
    ]; };
    return TableFilterSortDirective;
}());
export { TableFilterSortDirective };
export { ɵ0, ɵ1, ɵ2, ɵ3 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibGUtZmlsdGVyLmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vdGFibGUvdGFibGUtZmlsdGVyLmRpcmVjdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFeEQsT0FBTyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLGNBQWMsRUFBRSxlQUFlLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUV0SCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDbkQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDOUQsT0FBTyxFQUFFLGdCQUFnQixFQUFFLG9CQUFvQixFQUFFLGVBQWUsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBS3RHLElBQU0sZUFBZSxHQUFHLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxhQUFhLEVBQUUsV0FBVyxFQUFFLFlBQVksQ0FBQyxDQUFDO0FBRXBGLHFDQUFxQztBQUNyQyxJQUFNLGNBQWMsR0FBRyxVQUFDLEtBQUssRUFBRSxJQUFJO0lBQy9CLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLElBQUksS0FBSyxLQUFLLEVBQUUsRUFBRTtRQUNuQyxPQUFPLFNBQVMsQ0FBQztLQUNwQjtJQUNELElBQUksWUFBWSxDQUFDLElBQUksQ0FBQyxFQUFFO1FBQ3BCLE9BQU8sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUM1QjtJQUNELElBQUksSUFBSSxLQUFLLFFBQVEsQ0FBQyxRQUFRLEVBQUU7UUFDNUIsT0FBTyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDbEM7SUFDRCxPQUFP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QUFNLFdBQVcsR0FBSSxRQUFRLElBQUksUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxHQUFHLEdBQUcsR0FBRyxRQUFRLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUN2RyxJQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDakUsaUJBQWlCLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLEVBQUU7WUFDckMsSUFBSSxFQUFFLElBQUk7WUFDVixZQUFZLEVBQUcsWUFBWTtZQUMzQixPQUFPLEVBQUcsV0FBVztTQUN4QixDQUFDLENBQUM7SUFDUCxDQUFDOztnQkExWkosU0FBUyxTQUFDO29CQUNQLFFBQVEsRUFBRSxxQkFBcUI7aUJBQ2xDOzs7O2dEQUdnQixJQUFJLFlBQUksTUFBTSxTQUFDLGNBQWM7O0lBc1o5QywrQkFBQztDQUFBLEFBM1pELElBMlpDO1NBeFpZLHdCQUF3QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERpcmVjdGl2ZSwgSW5qZWN0LCBTZWxmIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7ICRhcHBEaWdlc3QsIERhdGFTb3VyY2UsIERhdGFUeXBlLCBGb3JtV2lkZ2V0VHlwZSwgZ2V0Q2xvbmVkT2JqZWN0LCBpc0RlZmluZWQsIGlzTnVtYmVyVHlwZSB9IGZyb20gJ0B3bS9jb3JlJztcblxuaW1wb3J0IHsgVGFibGVDb21wb25lbnQgfSBmcm9tICcuL3RhYmxlLmNvbXBvbmVudCc7XG5pbXBvcnQgeyByZWZyZXNoRGF0YVNvdXJjZSB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL2RhdGEtdXRpbHMnO1xuaW1wb3J0IHsgZ2V0TWF0Y2hNb2RlTXNncywgZ2V0TWF0Y2hNb2RlVHlwZXNNYXAsIGlzRGF0YVNldFdpZGdldCB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL3dpZGdldC11dGlscyc7XG5cbmRlY2xhcmUgY29uc3QgXywgJDtcbmRlY2xhcmUgY29uc3QgbW9tZW50O1xuXG5jb25zdCBlbXB0eU1hdGNoTW9kZXMgPSBbJ251bGwnLCAnZW1wdHknLCAnbnVsbG9yZW1wdHknLCAnaXNub3RudWxsJywgJ2lzbm90ZW1wdHknXTtcblxuLy8gR2V0IHNlYXJjaCB2YWx1ZSBiYXNlZCBvbiB0aGUgdGltZVxuY29uc3QgZ2V0U2VhcmNoVmFsdWUgPSAodmFsdWUsIHR5cGUpID0+IHtcbiAgICBpZiAoIWlzRGVmaW5lZCh2YWx1ZSkgfHwgdmFsdWUgPT09ICcnKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGlmIChpc051bWJlclR5cGUodHlwZSkpIHtcbiAgICAgICAgcmV0dXJuIF8udG9OdW1iZXIodmFsdWUpO1xuICAgIH1cbiAgICBpZiAodHlwZSA9PT0gRGF0YVR5cGUuREFURVRJTUUpIHtcbiAgICAgICAgcmV0dXJuIG1vbWVudCh2YWx1ZSkudmFsdWVPZigpO1xuICAgIH1cbiAgICByZXR1cm4gXy50b1N0cmluZyh2YWx1ZSkudG9Mb3dlckNhc2UoKTtcbn07XG5cbi8vIEZpbHRlciB0aGUgZGF0YSBiYXNlZCBvbiB0aGUgc2VhcmNoIHZhbHVlIGFuZCBjb25kaXRpb25zXG5jb25zdCBnZXRGaWx0ZXJlZERhdGEgPSAoZGF0YSwgc2VhcmNoT2JqKSA9PiB7XG4gICAgY29uc3Qgc2VhcmNoVmFsID0gZ2V0U2VhcmNoVmFsdWUoc2VhcmNoT2JqLnZhbHVlLCBzZWFyY2hPYmoudHlwZSk7XG4gICAgbGV0IGN1cnJlbnRWYWw7XG4gICAgaWYgKCFpc0RlZmluZWQoc2VhcmNoVmFsKSAmJiAhXy5pbmNsdWRlcyhlbXB0eU1hdGNoTW9kZXMsIHNlYXJjaE9iai5tYXRjaE1vZGUpKSB7XG4gICAgICAgIHJldHVybiBkYXRhO1xuICAgIH1cbiAgICBkYXRhID0gZGF0YS5maWx0ZXIoKG9iaikgPT4ge1xuICAgICAgICBsZXQgaXNFeGlzdHM7XG4gICAgICAgIGlmIChzZWFyY2hPYmouZmllbGQpIHtcbiAgICAgICAgICAgIGN1cnJlbnRWYWwgPSBnZXRTZWFyY2hWYWx1ZShfLmdldChvYmosIHNlYXJjaE9iai5maWVsZCksIHNlYXJjaE9iai50eXBlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGN1cnJlbnRWYWwgPSBfLnZhbHVlcyhvYmopLmpvaW4oJyAnKS50b0xvd2VyQ2FzZSgpOyAvLyBJZiBmaWVsZCBpcyBub3QgdGhlcmUsIHNlYXJjaCBvbiBhbGwgdGhlIGNvbHVtbnNcbiAgICAgICAgfVxuICAgICAgICBzd2l0Y2ggKHNlYXJjaE9iai5tYXRjaE1vZGUpIHtcbiAgICAgICAgICAgIGNhc2UgJ3N0YXJ0JzpcbiAgICAgICAgICAgICAgICBpc0V4aXN0cyA9IF8uc3RhcnRzV2l0aChjdXJyZW50VmFsLCBzZWFyY2hWYWwgYXMgc3RyaW5nKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2VuZCc6XG4gICAgICAgICAgICAgICAgaXNFeGlzdHMgPSBfLmVuZHNXaXRoKGN1cnJlbnRWYWwsIHNlYXJjaFZhbCBhcyBzdHJpbmcpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnZXhhY3QnOlxuICAgICAgICAgICAgICAgIGlzRXhpc3RzID0gXy5pc0VxdWFsKGN1cnJlbnRWYWwsIHNlYXJjaFZhbCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdub3RlcXVhbHMnOlxuICAgICAgICAgICAgICAgIGlzRXhpc3RzID0gIV8uaXNFcXVhbChjdXJyZW50VmFsLCBzZWFyY2hWYWwpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnbnVsbCc6XG4gICAgICAgICAgICAgICAgaXNFeGlzdHMgPSBfLmlzTnVsbChjdXJyZW50VmFsKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2lzbm90bnVsbCc6XG4gICAgICAgICAgICAgICAgaXNFeGlzdHMgPSAhXy5pc051bGwoY3VycmVudFZhbCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdlbXB0eSc6XG4gICAgICAgICAgICAgICAgaXNFeGlzdHMgPSBfLmlzRW1wdHkoY3VycmVudFZhbCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdpc25vdGVtcHR5JzpcbiAgICAgICAgICAgICAgICBpc0V4aXN0cyA9ICFfLmlzRW1wdHkoY3VycmVudFZhbCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdudWxsb3JlbXB0eSc6XG4gICAgICAgICAgICAgICAgaXNFeGlzdHMgPSBfLmlzTnVsbChjdXJyZW50VmFsKSB8fCBfLmlzRW1wdHkoY3VycmVudFZhbCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdsZXNzdGhhbic6XG4gICAgICAgICAgICAgICAgaXNFeGlzdHMgPSBjdXJyZW50VmFsIDwgc2VhcmNoVmFsO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnbGVzc3RoYW5lcXVhbCc6XG4gICAgICAgICAgICAgICAgaXNFeGlzdHMgPSBjdXJyZW50VmFsIDw9IHNlYXJjaFZhbDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2dyZWF0ZXJ0aGFuJzpcbiAgICAgICAgICAgICAgICBpc0V4aXN0cyA9IGN1cnJlbnRWYWwgPiBzZWFyY2hWYWw7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdncmVhdGVydGhhbmVxdWFsJzpcbiAgICAgICAgICAgICAgICBpc0V4aXN0cyA9IGN1cnJlbnRWYWwgPj0gc2VhcmNoVmFsO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBpc0V4aXN0cyA9IGlzTnVtYmVyVHlwZShzZWFyY2hPYmoudHlwZSkgPyBfLmlzRXF1YWwoY3VycmVudFZhbCwgc2VhcmNoVmFsKSA6IF8uaW5jbHVkZXMoY3VycmVudFZhbCwgc2VhcmNoVmFsKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaXNFeGlzdHM7XG4gICAgfSk7XG4gICAgcmV0dXJuIGRhdGE7XG59O1xuXG4vLyBTZXQgdGhlIGZpbHRlciBmaWVsZHMgYXMgcmVxdWlyZWQgYnkgZGF0YXNvdXJjZVxuY29uc3Qgc2V0RmlsdGVyRmllbGRzID0gKGZpbHRlckZpZWxkcywgc2VhcmNoT2JqKSA9PiB7XG4gICAgY29uc3QgZmllbGQgPSBzZWFyY2hPYmogJiYgc2VhcmNoT2JqLmZpZWxkO1xuICAgIC8qU2V0IHRoZSBmaWx0ZXIgb3B0aW9ucyBvbmx5IHdoZW4gYSBmaWVsZC9jb2x1bW4gaGFzIGJlZW4gc2VsZWN0ZWQuKi9cbiAgICBpZiAoZmllbGQpIHtcbiAgICAgICAgZmlsdGVyRmllbGRzW2ZpZWxkXSA9IHtcbiAgICAgICAgICAgICd2YWx1ZScgICAgIDogc2VhcmNoT2JqLnZhbHVlLFxuICAgICAgICAgICAgJ2xvZ2ljYWxPcCcgOiAnQU5EJ1xuICAgICAgICB9O1xuICAgICAgICBpZiAoc2VhcmNoT2JqLm1hdGNoTW9kZSkge1xuICAgICAgICAgICAgZmlsdGVyRmllbGRzW2ZpZWxkXS5tYXRjaE1vZGUgPSBzZWFyY2hPYmoubWF0Y2hNb2RlO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuLy8gVHJhbnNmb3JtIGZpbHRlciBmaWVsZHMgZnJvbSBhcnJheSB0byBvYmplY3QgaGF2aW5nIGZpZWxkIG5hbWVzIGFzIGtleXNcbmNvbnN0IHRyYW5zZm9ybUZpbHRlckZpZWxkID0gKHVzZXJGaWx0ZXJzLCBmaWx0ZXJGaWVsZCkgPT4ge1xuICAgIGlmIChmaWx0ZXJGaWVsZC5maWVsZCkge1xuICAgICAgICB1c2VyRmlsdGVyc1tmaWx0ZXJGaWVsZC5maWVsZF0gPSB7XG4gICAgICAgICAgICB2YWx1ZTogZmlsdGVyRmllbGQudmFsdWUsXG4gICAgICAgICAgICBtYXRjaE1vZGU6IGZpbHRlckZpZWxkLm1hdGNoTW9kZSxcbiAgICAgICAgICAgIHR5cGU6IGZpbHRlckZpZWxkLnR5cGVcbiAgICAgICAgfTtcbiAgICB9XG59O1xuXG5ARGlyZWN0aXZlKHtcbiAgICBzZWxlY3RvcjogJ1t3bVRhYmxlRmlsdGVyU29ydF0nXG59KVxuZXhwb3J0IGNsYXNzIFRhYmxlRmlsdGVyU29ydERpcmVjdGl2ZSB7XG5cbiAgICBjb25zdHJ1Y3RvcihAU2VsZigpIEBJbmplY3QoVGFibGVDb21wb25lbnQpIHByaXZhdGUgdGFibGUpIHtcbiAgICAgICAgdGFibGUuX3NlYXJjaFNvcnRIYW5kbGVyID0gdGhpcy5zZWFyY2hTb3J0SGFuZGxlci5iaW5kKHRoaXMpO1xuICAgICAgICB0YWJsZS5nZXRTZWFyY2hSZXN1bHQgPSB0aGlzLmdldFNlYXJjaFJlc3VsdC5iaW5kKHRoaXMpO1xuICAgICAgICB0YWJsZS5nZXRTb3J0UmVzdWx0ID0gdGhpcy5nZXRTb3J0UmVzdWx0LmJpbmQodGhpcyk7XG4gICAgICAgIHRhYmxlLmNoZWNrRmlsdGVyc0FwcGxpZWQgPSB0aGlzLmNoZWNrRmlsdGVyc0FwcGxpZWQuYmluZCh0aGlzKTtcbiAgICAgICAgdGFibGUuZ2V0RmlsdGVyRmllbGRzID0gdGhpcy5nZXRGaWx0ZXJGaWVsZHMuYmluZCh0aGlzKTtcbiAgICAgICAgdGFibGUub25Sb3dGaWx0ZXJDaGFuZ2UgPSB0aGlzLm9uUm93RmlsdGVyQ2hhbmdlLmJpbmQodGhpcyk7XG4gICAgICAgIHRhYmxlLm9uRmlsdGVyQ29uZGl0aW9uU2VsZWN0ID0gdGhpcy5vbkZpbHRlckNvbmRpdGlvblNlbGVjdC5iaW5kKHRoaXMpO1xuICAgICAgICB0YWJsZS5zaG93Q2xlYXJJY29uID0gdGhpcy5zaG93Q2xlYXJJY29uLmJpbmQodGhpcyk7XG4gICAgICAgIHRhYmxlLmNsZWFyUm93RmlsdGVyID0gdGhpcy5jbGVhclJvd0ZpbHRlci5iaW5kKHRoaXMpO1xuICAgICAgICB0YWJsZS5tYXRjaE1vZGVUeXBlc01hcCA9IGdldE1hdGNoTW9kZVR5cGVzTWFwKCk7XG4gICAgICAgIHRhYmxlLm1hdGNoTW9kZU1zZ3MgPSBnZXRNYXRjaE1vZGVNc2dzKHRhYmxlLmFwcExvY2FsZSk7XG4gICAgICAgIHRhYmxlLmVtcHR5TWF0Y2hNb2RlcyA9IGVtcHR5TWF0Y2hNb2RlcztcbiAgICAgICAgdGFibGUuZ2V0TmF2aWdhdGlvblRhcmdldEJ5U29ydEluZm8gPSB0aGlzLmdldE5hdmlnYXRpb25UYXJnZXRCeVNvcnRJbmZvLmJpbmQodGhpcyk7XG4gICAgICAgIHRhYmxlLnJlZnJlc2hEYXRhID0gdGhpcy5yZWZyZXNoRGF0YS5iaW5kKHRoaXMpO1xuICAgICAgICB0YWJsZS5jbGVhckZpbHRlciA9IHRoaXMuY2xlYXJGaWx0ZXIuYmluZCh0aGlzKTtcbiAgICB9XG5cbiAgICAvLyBHZXQgZmlyc3Qgb3IgbGFzdCBwYWdlIGJhc2VkIG9uIHNvcnQgaW5mbyBvZiBwcmltYXJ5IGtleVxuICAgIGdldE5hdmlnYXRpb25UYXJnZXRCeVNvcnRJbmZvKCkge1xuICAgICAgICByZXR1cm4gdGhpcy50YWJsZS5zb3J0SW5mbyAmJiB0aGlzLnRhYmxlLnNvcnRJbmZvLmRpcmVjdGlvbiA9PT0gJ2Rlc2MnICYmXG4gICAgICAgICAgICAgICAgICAgIF8uaW5jbHVkZXModGhpcy50YWJsZS5wcmltYXJ5S2V5LCB0aGlzLnRhYmxlLnNvcnRJbmZvLmZpZWxkKSA/ICdmaXJzdCcgOiAnbGFzdCc7XG4gICAgfVxuXG4gICAgLy8gR2V0IHRoZSBmaWx0ZXIgZmllbGRzIGFzIHJlcXVpcmVkIGJ5IGRhdGFzb3VyY2VcbiAgICBnZXRGaWx0ZXJGaWVsZHMoc2VhcmNoT2JqKSB7XG4gICAgICAgIGNvbnN0IGZpbHRlckZpZWxkcyA9IHt9O1xuICAgICAgICBpZiAoXy5pc0FycmF5KHNlYXJjaE9iaikpIHtcbiAgICAgICAgICAgIF8uZm9yRWFjaChzZWFyY2hPYmosICBvYmogPT4ge1xuICAgICAgICAgICAgICAgIHNldEZpbHRlckZpZWxkcyhmaWx0ZXJGaWVsZHMsIG9iaik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNldEZpbHRlckZpZWxkcyhmaWx0ZXJGaWVsZHMsIHNlYXJjaE9iaik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZpbHRlckZpZWxkcztcbiAgICB9XG5cbiAgICAvLyBSZXNldCB0aGUgc29ydCBiYXNlZCBvbiBzb3J0IHJldHVybmVkIGJ5IHRoZSBjYWxsXG4gICAgcmVzZXRTb3J0U3RhdHVzKHZhcmlhYmxlU29ydCkge1xuICAgICAgICBsZXQgZ3JpZFNvcnRTdHJpbmc7XG4gICAgICAgIGlmICghXy5pc0VtcHR5KHRoaXMudGFibGUuc29ydEluZm8pICYmIHRoaXMudGFibGUuZGF0YXNvdXJjZSkge1xuICAgICAgICAgICAgZ3JpZFNvcnRTdHJpbmcgPSB0aGlzLnRhYmxlLnNvcnRJbmZvLmZpZWxkICsgJyAnICsgdGhpcy50YWJsZS5zb3J0SW5mby5kaXJlY3Rpb247XG4gICAgICAgICAgICB2YXJpYWJsZVNvcnQgPSB0aGlzLnRhYmxlLmRhdGFzb3VyY2UuZXhlY3V0ZShEYXRhU291cmNlLk9wZXJhdGlvbi5HRVRfT1BUSU9OUykub3JkZXJCeSB8fCB2YXJpYWJsZVNvcnQ7XG4gICAgICAgICAgICBpZiAodmFyaWFibGVTb3J0KSB7IC8vIElmIG11bHRpcGxlIG9yZGVyIGJ5IGZpZWxkcyBhcmUgcHJlc2VudCwgY29tcGFyZSB3aXRoIHRoZSBmaXJzdCBvbmVcbiAgICAgICAgICAgICAgICB2YXJpYWJsZVNvcnQgPSBfLmhlYWQoXy5zcGxpdCh2YXJpYWJsZVNvcnQsICcsJykpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGdyaWRTb3J0U3RyaW5nICE9PSB2YXJpYWJsZVNvcnQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRhYmxlLmNhbGxEYXRhR3JpZE1ldGhvZCgncmVzZXRTb3J0SWNvbnMnKTtcbiAgICAgICAgICAgICAgICB0aGlzLnRhYmxlLnNvcnRJbmZvID0ge307XG4gICAgICAgICAgICAgICAgdGhpcy50YWJsZS5zZXREYXRhR3JpZE9wdGlvbignc29ydEluZm8nLCB7fSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBDbGVhciB0aGUgYWxsIHRoZSBmaWx0ZXJzIGFwcGxpZWRcbiAgICBjbGVhckZpbHRlcihza2lwRmlsdGVyKSB7XG4gICAgICAgIGxldCAkZ3JpZEVsZW1lbnQ7XG4gICAgICAgIHRoaXMudGFibGUuZmlsdGVySW5mbyA9IHt9O1xuICAgICAgICBpZiAodGhpcy50YWJsZS5maWx0ZXJtb2RlID09PSAnbXVsdGljb2x1bW4nKSB7XG4gICAgICAgICAgICB0aGlzLnRhYmxlLmZpZWxkRGVmcy5mb3JFYWNoKGNvbCA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGNvbC5yZXNldEZpbHRlcikge1xuICAgICAgICAgICAgICAgICAgICBjb2wucmVzZXRGaWx0ZXIoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmICghc2tpcEZpbHRlcikge1xuICAgICAgICAgICAgICAgIHRoaXMudGFibGUub25Sb3dGaWx0ZXJDaGFuZ2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLnRhYmxlLmZpbHRlcm1vZGUgPT09ICdzZWFyY2gnKSB7XG4gICAgICAgICAgICAkZ3JpZEVsZW1lbnQgPSB0aGlzLnRhYmxlLmRhdGFncmlkRWxlbWVudDtcbiAgICAgICAgICAgICRncmlkRWxlbWVudC5maW5kKCdbZGF0YS1lbGVtZW50PVwiZGdTZWFyY2hUZXh0XCJdJykudmFsKCcnKTtcbiAgICAgICAgICAgICRncmlkRWxlbWVudC5maW5kKCdbZGF0YS1lbGVtZW50PVwiZGdGaWx0ZXJWYWx1ZVwiXScpLnZhbCgnJyk7XG4gICAgICAgICAgICBpZiAoIXNraXBGaWx0ZXIpIHtcbiAgICAgICAgICAgICAgICAkZ3JpZEVsZW1lbnQuZmluZCgnLmFwcC1zZWFyY2gtYnV0dG9uJykudHJpZ2dlcignY2xpY2snKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIENoZWNrIHRoZSBmaWx0ZXJzIGFwcGxpZWQgYW5kIHJlbW92ZSBpZiBkYXQgZG9lcyBub3QgY29udGFpbiBhbnkgZmlsdGVyc1xuICAgIGNoZWNrRmlsdGVyc0FwcGxpZWQodmFyaWFibGVTb3J0KSB7XG4gICAgICAgIGlmICghdGhpcy50YWJsZS5kYXRhc291cmNlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMudGFibGUuZGF0YXNvdXJjZS5leGVjdXRlKERhdGFTb3VyY2UuT3BlcmF0aW9uLlNVUFBPUlRTX1NFUlZFUl9GSUxURVIpKSB7XG4gICAgICAgICAgICBpZiAoXy5pc0VtcHR5KHRoaXMudGFibGUuZGF0YXNvdXJjZS5leGVjdXRlKERhdGFTb3VyY2UuT3BlcmF0aW9uLkdFVF9PUFRJT05TKS5maWx0ZXJGaWVsZHMpICYmIF8uaXNFbXB0eSh0aGlzLnRhYmxlLmZpbHRlckluZm8pKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jbGVhckZpbHRlcih0cnVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMucmVzZXRTb3J0U3RhdHVzKHZhcmlhYmxlU29ydCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMudGFibGUuZGF0YXNvdXJjZS5leGVjdXRlKERhdGFTb3VyY2UuT3BlcmF0aW9uLklTX1BBR0VBQkxFKSkge1xuICAgICAgICAgICAgdGhpcy5yZXNldFNvcnRTdGF0dXModmFyaWFibGVTb3J0KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFJldHVybnMgZGF0YSBmaWx0ZXJlZCB1c2luZyBzZWFyY2hPYmpcbiAgICBnZXRTZWFyY2hSZXN1bHQoZGF0YSwgc2VhcmNoT2JqKSB7XG4gICAgICAgIGlmICghc2VhcmNoT2JqKSB7XG4gICAgICAgICAgICByZXR1cm4gZGF0YTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoXy5pc0FycmF5KHNlYXJjaE9iaikpIHtcbiAgICAgICAgICAgIHNlYXJjaE9iai5mb3JFYWNoKChvYmopID0+IHtcbiAgICAgICAgICAgICAgICBkYXRhID0gZ2V0RmlsdGVyZWREYXRhKGRhdGEsIG9iaik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRhdGEgPSBnZXRGaWx0ZXJlZERhdGEoZGF0YSwgc2VhcmNoT2JqKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGF0YTtcbiAgICB9XG5cbiAgICAvLyBSZXR1cm5zIGRhdGEgc29ydGVkIHVzaW5nIHNvcnRPYmpcbiAgICBnZXRTb3J0UmVzdWx0KGRhdGEsIHNvcnRPYmopIHtcbiAgICAgICAgaWYgKHNvcnRPYmogJiYgc29ydE9iai5kaXJlY3Rpb24pIHtcbiAgICAgICAgICAgIGRhdGEgPSBfLm9yZGVyQnkoZGF0YSwgc29ydE9iai5maWVsZCwgc29ydE9iai5kaXJlY3Rpb24pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkYXRhO1xuICAgIH1cblxuICAgIC8vIFRoaXMgbWV0aG9kIGhhbmRsZXMgdGhlIGNsaWVudCBzaWRlIHNvcnQgYW5kIHNlYXJjaFxuICAgIHByaXZhdGUgaGFuZGxlQ2xpZW50U2lkZVNvcnRTZWFyY2goc2VhcmNoU29ydE9iaiwgZSwgdHlwZSkge1xuICAgICAgICB0aGlzLnRhYmxlLl9pc0NsaWVudFNlYXJjaCA9IHRydWU7XG5cbiAgICAgICAgbGV0IGRhdGE7XG4gICAgICAgIGRhdGEgPSB0aGlzLnRhYmxlLmlzTmF2aWdhdGlvbkVuYWJsZWQoKSA/IGdldENsb25lZE9iamVjdCh0aGlzLnRhYmxlLl9fZnVsbERhdGEpIDogZ2V0Q2xvbmVkT2JqZWN0KHRoaXMudGFibGUuZGF0YXNldCk7XG4gICAgICAgIGlmICh0eXBlID09PSAnc2VhcmNoJykge1xuICAgICAgICAgICAgdGhpcy50YWJsZS5maWx0ZXJJbmZvID0gc2VhcmNoU29ydE9iajtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMudGFibGUuc29ydEluZm8gPSBzZWFyY2hTb3J0T2JqO1xuICAgICAgICB9XG4gICAgICAgIGlmIChfLmlzT2JqZWN0KGRhdGEpICYmICFfLmlzQXJyYXkoZGF0YSkpIHtcbiAgICAgICAgICAgIGRhdGEgPSBbZGF0YV07XG4gICAgICAgIH1cbiAgICAgICAgLypCb3RoIHRoZSBmdW5jdGlvbnMgcmV0dXJuIHNhbWUgJ2RhdGEnIGlmIGFyZ3VtZW50cyBhcmUgdW5kZWZpbmVkKi9cbiAgICAgICAgZGF0YSA9IHRoaXMuZ2V0U2VhcmNoUmVzdWx0KGRhdGEsIHRoaXMudGFibGUuZmlsdGVySW5mbyk7XG4gICAgICAgIGRhdGEgPSB0aGlzLmdldFNvcnRSZXN1bHQoZGF0YSwgdGhpcy50YWJsZS5zb3J0SW5mbyk7XG4gICAgICAgIHRoaXMudGFibGUuc2VydmVyRGF0YSA9IGRhdGE7XG5cbiAgICAgICAgaWYgKHR5cGUgPT09ICdzb3J0Jykge1xuICAgICAgICAgICAgLy8gQ2FsbGluZyAnb25Tb3J0JyBldmVudFxuICAgICAgICAgICAgdGhpcy50YWJsZS5pbnZva2VFdmVudENhbGxiYWNrKCdzb3J0JywgeyRldmVudDogZSwgJGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogdGhpcy50YWJsZS5zZXJ2ZXJEYXRhLFxuICAgICAgICAgICAgICAgICAgICBzb3J0RGlyZWN0aW9uOiB0aGlzLnRhYmxlLnNvcnRJbmZvLmRpcmVjdGlvbixcbiAgICAgICAgICAgICAgICAgICAgY29sRGVmOiB0aGlzLnRhYmxlLmNvbHVtbnNbdGhpcy50YWJsZS5zb3J0SW5mby5maWVsZF1cbiAgICAgICAgICAgICAgICB9fSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy50YWJsZS5pc05hdmlnYXRpb25FbmFibGVkKCkpIHtcbiAgICAgICAgICAgIC8vIFJlc2V0IHRoZSBwYWdlIG51bWJlciB0byAxXG4gICAgICAgICAgICB0aGlzLnRhYmxlLmRhdGFOYXZpZ2F0b3IuZG4uY3VycmVudFBhZ2UgPSAxO1xuICAgICAgICAgICAgdGhpcy50YWJsZS5kYXRhTmF2aWdhdG9yLnNldFBhZ2luZ1ZhbHVlcyhkYXRhKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMudGFibGUuc2V0R3JpZERhdGEodGhpcy50YWJsZS5zZXJ2ZXJEYXRhKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFRoaXMgbWV0aG9kIGhhbmRsZXMgdGhlIHNlYXJjaCBmb3IgcGFnZWFibGUgZGF0YXNvdXJjZVxuICAgIHByaXZhdGUgaGFuZGxlU2luZ2xlUGFnZVNlYXJjaChzZWFyY2hPYmopIHtcbiAgICAgICAgdGhpcy50YWJsZS5faXNQYWdlU2VhcmNoID0gdHJ1ZTtcblxuICAgICAgICBsZXQgZGF0YSAgPSBnZXRDbG9uZWRPYmplY3QodGhpcy50YWJsZS5ncmlkRGF0YSk7XG4gICAgICAgIGNvbnN0ICRyb3dzID0gdGhpcy50YWJsZS5kYXRhZ3JpZEVsZW1lbnQuZmluZCgndGJvZHkgdHIuYXBwLWRhdGFncmlkLXJvdycpO1xuICAgICAgICB0aGlzLnRhYmxlLmZpbHRlckluZm8gPSBzZWFyY2hPYmo7XG4gICAgICAgIGRhdGEgPSB0aGlzLmdldFNlYXJjaFJlc3VsdChkYXRhLCBzZWFyY2hPYmopO1xuICAgICAgICAvLyBDb21wYXJlZCB0aGUgZmlsdGVyZWQgZGF0YSBhbmQgb3JpZ2luYWwgZGF0YSwgdG8gc2hvdyBvciBoaWRlIHRoZSByb3dzXG4gICAgICAgIF8uZm9yRWFjaCh0aGlzLnRhYmxlLmdyaWREYXRhLCAodmFsdWUsIGluZGV4KSA9PiB7XG4gICAgICAgICAgICBjb25zdCAkcm93ID0gJCgkcm93c1tpbmRleF0pO1xuICAgICAgICAgICAgaWYgKF8uZmluZChkYXRhLCBvYmogPT4gXy5pc0VxdWFsKG9iaiwgdmFsdWUpKSkge1xuICAgICAgICAgICAgICAgICRyb3cuc2hvdygpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAkcm93LmhpZGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChkYXRhICYmIGRhdGEubGVuZ3RoKSB7XG4gICAgICAgICAgICB0aGlzLnRhYmxlLmNhbGxEYXRhR3JpZE1ldGhvZCgnc2V0U3RhdHVzJywgJ3JlYWR5Jyk7XG4gICAgICAgICAgICAvLyBTZWxlY3QgdGhlIGZpcnN0IHJvdyBhZnRlciB0aGUgc2VhcmNoIGZvciBzaW5nbGUgc2VsZWN0XG4gICAgICAgICAgICBpZiAodGhpcy50YWJsZS5ncmlkZmlyc3Ryb3dzZWxlY3QgJiYgIXRoaXMudGFibGUubXVsdGlzZWxlY3QpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRhYmxlLmNhbGxEYXRhR3JpZE1ldGhvZCgnc2VsZWN0Rmlyc3RSb3cnLCB0cnVlLCB0cnVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMudGFibGUuY2FsbERhdGFHcmlkTWV0aG9kKCdzZXRTdGF0dXMnLCAnbm9kYXRhJywgdGhpcy50YWJsZS5ub2RhdGFtZXNzYWdlKTtcbiAgICAgICAgICAgIHRoaXMudGFibGUuc2VsZWN0ZWRpdGVtID0gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudGFibGUuY2FsbERhdGFHcmlkTWV0aG9kKCd1cGRhdGVTZWxlY3RBbGxDaGVja2JveFN0YXRlJyk7XG4gICAgfVxuXG4gICAgLy8gVGhpcyBtZXRob2QgaGFuZGxlcyB0aGUgc2VhcmNoIGZvciBzZXJ2ZXIgc2lkZSB2YXJpYWJsZXNcbiAgICBwcml2YXRlIGhhbmRsZVNlcnZlclNpZGVTZWFyY2goc2VhcmNoT2JqKSB7XG4gICAgICAgIHRoaXMudGFibGUuZmlsdGVySW5mbyA9IHNlYXJjaE9iajtcblxuICAgICAgICBpZiAoIXRoaXMudGFibGUuZGF0YXNvdXJjZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc29ydEluZm8gICAgID0gdGhpcy50YWJsZS5zb3J0SW5mbztcbiAgICAgICAgY29uc3Qgc29ydE9wdGlvbnMgID0gc29ydEluZm8gJiYgc29ydEluZm8uZGlyZWN0aW9uID8gKHNvcnRJbmZvLmZpZWxkICsgJyAnICsgc29ydEluZm8uZGlyZWN0aW9uKSA6ICcnO1xuICAgICAgICBjb25zdCBmaWx0ZXJGaWVsZHMgPSB0aGlzLmdldEZpbHRlckZpZWxkcyhzZWFyY2hPYmopO1xuICAgICAgICByZWZyZXNoRGF0YVNvdXJjZSh0aGlzLnRhYmxlLmRhdGFzb3VyY2UsIHtcbiAgICAgICAgICAgIHBhZ2U6IDEsXG4gICAgICAgICAgICBmaWx0ZXJGaWVsZHMgOiBmaWx0ZXJGaWVsZHMsXG4gICAgICAgICAgICBvcmRlckJ5IDogc29ydE9wdGlvbnNcbiAgICAgICAgfSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAkYXBwRGlnZXN0KCk7XG4gICAgICAgIH0sICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMudGFibGUudG9nZ2xlTWVzc2FnZSh0cnVlLCAnZXJyb3InLCB0aGlzLnRhYmxlLm5vZGF0YW1lc3NhZ2UpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBUaGlzIG1ldGhvZCBoYW5kbGVzIHRoZSBzb3J0IGZvciBzZXJ2ZXIgc2lkZSB2YXJpYWJsZXNcbiAgICBwcml2YXRlIGhhbmRsZVNldmVyU2lkZVNvcnQoc29ydE9iaiwgZSkge1xuICAgICAgICAvLyBVcGRhdGUgdGhlIHNvcnQgaW5mbyBmb3IgcGFzc2luZyB0byBkYXRhZ3JpZFxuICAgICAgICB0aGlzLnRhYmxlLmdyaWRPcHRpb25zLnNvcnRJbmZvLmZpZWxkID0gc29ydE9iai5maWVsZDtcbiAgICAgICAgdGhpcy50YWJsZS5ncmlkT3B0aW9ucy5zb3J0SW5mby5kaXJlY3Rpb24gPSBzb3J0T2JqLmRpcmVjdGlvbjtcbiAgICAgICAgdGhpcy50YWJsZS5zb3J0SW5mbyA9IGdldENsb25lZE9iamVjdChzb3J0T2JqKTtcblxuICAgICAgICBjb25zdCBzb3J0T3B0aW9ucyAgPSBzb3J0T2JqICYmIHNvcnRPYmouZGlyZWN0aW9uID8gKHNvcnRPYmouZmllbGQgKyAnICcgKyBzb3J0T2JqLmRpcmVjdGlvbikgOiAnJztcbiAgICAgICAgY29uc3QgZmlsdGVyRmllbGRzID0gdGhpcy5nZXRGaWx0ZXJGaWVsZHModGhpcy50YWJsZS5maWx0ZXJJbmZvKTtcblxuICAgICAgICByZWZyZXNoRGF0YVNvdXJjZSh0aGlzLnRhYmxlLmRhdGFzb3VyY2UsIHtcbiAgICAgICAgICAgIHBhZ2UgOiAxLFxuICAgICAgICAgICAgZmlsdGVyRmllbGRzIDogZmlsdGVyRmllbGRzLFxuICAgICAgICAgICAgb3JkZXJCeSA6IHNvcnRPcHRpb25zXG4gICAgICAgIH0pLnRoZW4oKHJlc3BvbnNlKSA9PiB7XG4gICAgICAgICAgICAkYXBwRGlnZXN0KCk7XG4gICAgICAgICAgICBjb25zdCBkYXRhID0gKHJlc3BvbnNlICYmIHJlc3BvbnNlLmRhdGEpID8gcmVzcG9uc2UuZGF0YSA6IHJlc3BvbnNlO1xuICAgICAgICAgICAgdGhpcy50YWJsZS5pbnZva2VFdmVudENhbGxiYWNrKCdzb3J0JywgeyRldmVudDogZSwgJGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YSxcbiAgICAgICAgICAgICAgICAgICAgc29ydERpcmVjdGlvbjogc29ydE9iai5kaXJlY3Rpb24sXG4gICAgICAgICAgICAgICAgICAgIGNvbERlZjogdGhpcy50YWJsZS5jb2x1bW5zW3NvcnRPYmouZmllbGRdXG4gICAgICAgICAgICAgICAgfX0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNlYXJjaEhhbmRsZXIoc2VhcmNoU29ydE9iaiwgZSwgdHlwZSkge1xuICAgICAgICBsZXQgZmlsdGVyRmllbGRzID0gZ2V0Q2xvbmVkT2JqZWN0KHNlYXJjaFNvcnRPYmopO1xuICAgICAgICBjb25zdCBkYXRhU291cmNlID0gdGhpcy50YWJsZS5kYXRhc291cmNlO1xuICAgICAgICBpZiAoIWRhdGFTb3VyY2UpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBsZXQgb3V0cHV0O1xuICAgICAgICBjb25zdCB1c2VyRmlsdGVycyA9IHt9O1xuICAgICAgICAvLyBUcmFuc2Zvcm0gZmlsdGVyIGZpZWxkcyBmcm9tIGFycmF5IHRvIG9iamVjdCBoYXZpbmcgZmllbGQgbmFtZXMgYXMga2V5c1xuICAgICAgICBpZiAoXy5pc0FycmF5KGZpbHRlckZpZWxkcykpIHtcbiAgICAgICAgICAgIGZpbHRlckZpZWxkcy5mb3JFYWNoKGZpbHRlckZpZWxkID0+IHtcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm1GaWx0ZXJGaWVsZCh1c2VyRmlsdGVycywgZmlsdGVyRmllbGQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0cmFuc2Zvcm1GaWx0ZXJGaWVsZCh1c2VyRmlsdGVycywgZmlsdGVyRmllbGRzKTtcbiAgICAgICAgfVxuICAgICAgICBvdXRwdXQgPSB0aGlzLnRhYmxlLmludm9rZUV2ZW50Q2FsbGJhY2soJ2JlZm9yZWZpbHRlcicsIHskZXZlbnQ6IGUsICRkYXRhOiB1c2VyRmlsdGVycywgY29sdW1uczogdXNlckZpbHRlcnN9KTtcbiAgICAgICAgLy8gSWYgY2FsbGJhY2sgcmV0dXJucyBmYWxzZSwgZG9uJ3QgdHJpZ2dlciB0aGUgZmlsdGVyIGNhbGxcbiAgICAgICAgaWYgKG91dHB1dCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyBUcmFuc2Zvcm0gYmFjayB0aGUgZmlsdGVyIGZpZWxkcyBmcm9tIG9iamVjdCB0byBhcnJheVxuICAgICAgICBmaWx0ZXJGaWVsZHMgPSBbXTtcbiAgICAgICAgXy5mb3JFYWNoKHVzZXJGaWx0ZXJzLCAodmFsLCBrZXkpID0+IHtcbiAgICAgICAgICAgIGZpbHRlckZpZWxkcy5wdXNoKHtcbiAgICAgICAgICAgICAgICBmaWVsZDoga2V5LFxuICAgICAgICAgICAgICAgIG1hdGNoTW9kZTogdmFsLm1hdGNoTW9kZSxcbiAgICAgICAgICAgICAgICB0eXBlOiB2YWwudHlwZSxcbiAgICAgICAgICAgICAgICB2YWx1ZTogdmFsLnZhbHVlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChkYXRhU291cmNlLmV4ZWN1dGUoRGF0YVNvdXJjZS5PcGVyYXRpb24uU1VQUE9SVFNfU0VSVkVSX0ZJTFRFUikpIHtcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlU2VydmVyU2lkZVNlYXJjaChmaWx0ZXJGaWVsZHMpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChkYXRhU291cmNlLmV4ZWN1dGUoRGF0YVNvdXJjZS5PcGVyYXRpb24uSVNfQVBJX0FXQVJFKSAmJiBkYXRhU291cmNlLmV4ZWN1dGUoRGF0YVNvdXJjZS5PcGVyYXRpb24uSVNfUEFHRUFCTEUpKSB7XG4gICAgICAgICAgICB0aGlzLmhhbmRsZVNpbmdsZVBhZ2VTZWFyY2goZmlsdGVyRmllbGRzKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlQ2xpZW50U2lkZVNvcnRTZWFyY2goZmlsdGVyRmllbGRzLCBlLCB0eXBlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgc29ydEhhbmRsZXIoc2VhcmNoU29ydE9iaiwgZSwgdHlwZSkge1xuICAgICAgICBjb25zdCBkYXRhU291cmNlID0gdGhpcy50YWJsZS5kYXRhc291cmNlO1xuICAgICAgICBpZiAoIWRhdGFTb3VyY2UpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZGF0YVNvdXJjZS5leGVjdXRlKERhdGFTb3VyY2UuT3BlcmF0aW9uLklTX1BBR0VBQkxFKSkge1xuICAgICAgICAgICAgdGhpcy5oYW5kbGVTZXZlclNpZGVTb3J0KHNlYXJjaFNvcnRPYmosIGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5oYW5kbGVDbGllbnRTaWRlU29ydFNlYXJjaChzZWFyY2hTb3J0T2JqLCBlLCB0eXBlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFRoaXMgbWV0aG9kIGlzIHRyaWdnZXJlZCBieSBqcXVlcnkgdGFibGVcbiAgICBzZWFyY2hTb3J0SGFuZGxlcihzZWFyY2hTb3J0T2JqLCBlLCB0eXBlKSB7XG4gICAgICAgIGlmICh0eXBlID09PSAnc2VhcmNoJykge1xuICAgICAgICAgICAgdGhpcy5zZWFyY2hIYW5kbGVyKHNlYXJjaFNvcnRPYmosIGUsIHR5cGUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5zb3J0SGFuZGxlcihzZWFyY2hTb3J0T2JqLCBlLCB0eXBlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIE1ldGhvZCB0byBzaG93L2hpZGUgY2xlYXIgaWNvbiBpbiBtdWx0aSBjb2x1bW4gZmlsdGVyXG4gICAgc2hvd0NsZWFySWNvbihmaWVsZE5hbWUpIHtcbiAgICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLnRhYmxlLnJvd0ZpbHRlcltmaWVsZE5hbWVdICYmIHRoaXMudGFibGUucm93RmlsdGVyW2ZpZWxkTmFtZV0udmFsdWU7XG4gICAgICAgIHJldHVybiBpc0RlZmluZWQodmFsdWUpICYmIHZhbHVlICE9PSAnJyAmJiB2YWx1ZSAhPT0gbnVsbDtcbiAgICB9XG5cbiAgICAvLyBNZXRob2QgY2xlYXIgdGhlIGZpbHRlciB2YWx1ZSBpbiBtdWx0aSBjb2x1bW4gZmlsdGVyXG4gICAgY2xlYXJSb3dGaWx0ZXIoZmllbGROYW1lKSB7XG4gICAgICAgIGlmICh0aGlzLnRhYmxlLnJvd0ZpbHRlciAmJiB0aGlzLnRhYmxlLnJvd0ZpbHRlcltmaWVsZE5hbWVdKSB7XG4gICAgICAgICAgICB0aGlzLnRhYmxlLmNvbHVtbnNbZmllbGROYW1lXS5yZXNldEZpbHRlcigpO1xuICAgICAgICAgICAgdGhpcy5vblJvd0ZpbHRlckNoYW5nZShmaWVsZE5hbWUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gVGhpcyBtZXRob2QgaXMgdHJpZ2dlcmVkIG9uIHNlbGVjdCBvZiBjb25kaXRpb24gaW4gbXVsdGkgY29sdW1uIGZpbHRlclxuICAgIG9uRmlsdGVyQ29uZGl0aW9uU2VsZWN0KGZpZWxkTmFtZSwgY29uZGl0aW9uKSB7XG4gICAgICAgIHRoaXMudGFibGUucm93RmlsdGVyW2ZpZWxkTmFtZV0gPSB0aGlzLnRhYmxlLnJvd0ZpbHRlcltmaWVsZE5hbWVdIHx8IHt9O1xuICAgICAgICB0aGlzLnRhYmxlLnJvd0ZpbHRlcltmaWVsZE5hbWVdLm1hdGNoTW9kZSA9IGNvbmRpdGlvbjtcbiAgICAgICAgLy8gRm9yIGVtcHR5IG1hdGNoIG1vZGVzLCBjbGVhciBvZmYgdGhlIHZhbHVlIGFuZCBjYWxsIGZpbHRlclxuICAgICAgICBpZiAoXy5pbmNsdWRlcyh0aGlzLnRhYmxlLmVtcHR5TWF0Y2hNb2RlcywgY29uZGl0aW9uKSkge1xuICAgICAgICAgICAgdGhpcy50YWJsZS5jb2x1bW5zW2ZpZWxkTmFtZV0ucmVzZXRGaWx0ZXIoKTtcbiAgICAgICAgICAgIHRoaXMudGFibGUub25Sb3dGaWx0ZXJDaGFuZ2UoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIElmIHZhbHVlIGlzIHByZXNlbnQsIGNhbGwgdGhlIGZpbHRlci4gRWxzZSwgZm9jdXMgb24gdGhlIGZpZWxkXG4gICAgICAgICAgICBpZiAoaXNEZWZpbmVkKHRoaXMudGFibGUucm93RmlsdGVyW2ZpZWxkTmFtZV0udmFsdWUpICYmIHRoaXMudGFibGUucm93RmlsdGVyW2ZpZWxkTmFtZV0udmFsdWUgIT09ICcnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50YWJsZS5vblJvd0ZpbHRlckNoYW5nZSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50YWJsZS5jb2x1bW5zW2ZpZWxkTmFtZV0uZmlsdGVySW5zdGFuY2UuZm9jdXMoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIE1ldGhvZCB0byBnZXQgdGhlIHVwZGF0ZWQgdmFsdWVzIHdoZW4gZmlsdGVyIG9uIGZpZWxkIGlzIGNoYW5nZWQgZm9yIG11bHRpY29sdW1uIGZpbHRlclxuICAgIHByaXZhdGUgZ2V0RmlsdGVyT25GaWVsZFZhbHVlcyhmaWx0ZXJEZWYpIHtcbiAgICAgICAgaWYgKCF0aGlzLnRhYmxlLmRhdGFzb3VyY2UgfHwgIXRoaXMudGFibGUuZGF0YXNvdXJjZS5leGVjdXRlKERhdGFTb3VyY2UuT3BlcmF0aW9uLlNVUFBPUlRTX0RJU1RJTkNUX0FQSSkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGZpZWxkTmFtZSA9IGZpbHRlckRlZi5maWVsZDtcbiAgICAgICAgY29uc3QgZm9ybUZpZWxkcyA9IHRoaXMudGFibGUuZnVsbEZpZWxkRGVmcztcbiAgICAgICAgY29uc3QgZmlsdGVyT25GaWVsZHMgPSBfLmZpbHRlcihmb3JtRmllbGRzLCB7J2ZpbHRlcm9uZmlsdGVyJzogZmllbGROYW1lfSk7XG4gICAgICAgIGNvbnN0IG5ld1ZhbCA9IF8uZ2V0KHRoaXMudGFibGUucm93RmlsdGVyLCBbZmllbGROYW1lLCAndmFsdWUnXSk7XG5cbiAgICAgICAgLy8gTG9vcCBvdmVyIHRoZSBmaWVsZHMgZm9yIHdoaWNoIHRoZSBjdXJyZW50IGZpZWxkIGlzIGZpbHRlciBvbiBmaWVsZFxuICAgICAgICBfLmZvckVhY2goZmlsdGVyT25GaWVsZHMsIGZpbHRlckZpZWxkID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGZpbHRlck9uID0gZmlsdGVyRmllbGQuZmlsdGVyb25maWx0ZXI7XG4gICAgICAgICAgICBjb25zdCBmaWx0ZXJLZXkgPSBmaWx0ZXJGaWVsZC5maWVsZDtcbiAgICAgICAgICAgIGNvbnN0IGZpbHRlckZpZWxkcyA9IHt9O1xuICAgICAgICAgICAgY29uc3QgZmlsdGVyV2lkZ2V0ID0gZmlsdGVyRmllbGQuZmlsdGVyd2lkZ2V0O1xuXG4gICAgICAgICAgICBpZiAoIWlzRGF0YVNldFdpZGdldChmaWx0ZXJXaWRnZXQpIHx8IGZpbHRlck9uID09PSBmaWx0ZXJLZXkgfHwgZmlsdGVyRmllbGQuaXNGaWx0ZXJEYXRhU2V0Qm91bmQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZpbHRlckZpZWxkc1tmaWx0ZXJPbl0gPSAoaXNEZWZpbmVkKG5ld1ZhbCkgJiYgbmV3VmFsICE9PSAnJyAmJiBuZXdWYWwgIT09IG51bGwpID8geyd2YWx1ZScgOiBuZXdWYWx9IDoge307XG5cbiAgICAgICAgICAgIGlmIChmaWx0ZXJXaWRnZXQgPT09IEZvcm1XaWRnZXRUeXBlLkFVVE9DT01QTEVURSAmJiBmaWx0ZXJGaWVsZC5maWx0ZXJJbnN0YW5jZS5kYXRhb3B0aW9ucykge1xuICAgICAgICAgICAgICAgIGZpbHRlckZpZWxkLmZpbHRlckluc3RhbmNlLmRhdGFvcHRpb25zLmZpbHRlckZpZWxkcyA9IGZpbHRlckZpZWxkcztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy50YWJsZS5kYXRhc291cmNlLmV4ZWN1dGUoRGF0YVNvdXJjZS5PcGVyYXRpb24uR0VUX0RJU1RJTkNUX0RBVEFfQllfRklFTERTLCB7XG4gICAgICAgICAgICAgICAgICAgICdmaWVsZHMnICAgICAgICAgOiBmaWx0ZXJLZXksXG4gICAgICAgICAgICAgICAgICAgICdmaWx0ZXJGaWVsZHMnICAgOiBmaWx0ZXJGaWVsZHNcbiAgICAgICAgICAgICAgICB9KS50aGVuKGRhdGEgPT4ge1xuICAgICAgICAgICAgICAgICAgICBmaWx0ZXJGaWVsZC5maWx0ZXJkYXRhc2V0ID0gZGF0YS5kYXRhO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvLyBUaGlzIG1ldGhvZCBpcyB0cmlnZ2VyZWQgb24gdmFsdWUgY2hhbmdlIGluIG11bHRpIGNvbHVtbiBmaWx0ZXJcbiAgICBvblJvd0ZpbHRlckNoYW5nZShmaWVsZE5hbWUpIHtcbiAgICAgICAgY29uc3Qgc2VhcmNoT2JqID0gW107XG4gICAgICAgIGNvbnN0IGZpZWxkID0gXy5maW5kKHRoaXMudGFibGUuZnVsbEZpZWxkRGVmcywgeydmaWVsZCc6IGZpZWxkTmFtZX0pO1xuICAgICAgICAvLyBDb252ZXJ0IHJvdyBmaWx0ZXJzIHRvIGEgc2VhcmNoIG9iamVjdCBhbmQgY2FsbCBzZWFyY2ggaGFuZGxlclxuICAgICAgICBfLmZvckVhY2godGhpcy50YWJsZS5yb3dGaWx0ZXIsICh2YWx1ZSwga2V5KSA9PiB7XG4gICAgICAgICAgICBpZiAoKGlzRGVmaW5lZCh2YWx1ZS52YWx1ZSkgJiYgdmFsdWUudmFsdWUgIT09ICcnKSB8fCBfLmluY2x1ZGVzKHRoaXMudGFibGUuZW1wdHlNYXRjaE1vZGVzLCB2YWx1ZS5tYXRjaE1vZGUpKSB7XG4gICAgICAgICAgICAgICAgaWYgKGZpZWxkICYmIGtleSA9PT0gZmllbGQuZmllbGQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUudHlwZSAgICAgID0gdmFsdWUudHlwZSB8fCBmaWVsZC50eXBlO1xuICAgICAgICAgICAgICAgICAgICB2YWx1ZS5tYXRjaE1vZGUgPSB2YWx1ZS5tYXRjaE1vZGUgfHwgXy5nZXQodGhpcy50YWJsZS5tYXRjaE1vZGVUeXBlc01hcFt2YWx1ZS50eXBlXSwgMCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHNlYXJjaE9iai5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgZmllbGQ6IGtleSxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHZhbHVlLnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICBtYXRjaE1vZGU6IHZhbHVlLm1hdGNoTW9kZSxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogdmFsdWUudHlwZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy50YWJsZS5ncmlkT3B0aW9ucy5zZWFyY2hIYW5kbGVyKHNlYXJjaE9iaiwgdW5kZWZpbmVkLCAnc2VhcmNoJyk7XG5cbiAgICAgICAgLy8gSWYgZmllbGQgaXMgcGFzc2VkLCB1cGRhdGUgYW55IGZpbHRlciBvbiBmaWVsZCB2YWx1ZXMgaWYgcHJlc2VudFxuICAgICAgICBpZiAoZmllbGQpIHtcbiAgICAgICAgICAgIHRoaXMuZ2V0RmlsdGVyT25GaWVsZFZhbHVlcyhmaWVsZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZWZyZXNoRGF0YShpc1NhbWVQYWdlKSB7XG4gICAgICAgIGlmICghdGhpcy50YWJsZS5kYXRhc291cmNlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcGFnZSA9IGlzU2FtZVBhZ2UgPyB0aGlzLnRhYmxlLmRhdGFOYXZpZ2F0b3IuZG4uY3VycmVudFBhZ2UgOiAxO1xuICAgICAgICBjb25zdCBzb3J0SW5mbyAgICAgPSB0aGlzLnRhYmxlLnNvcnRJbmZvO1xuICAgICAgICBjb25zdCBzb3J0T3B0aW9ucyAgPSBzb3J0SW5mbyAmJiBzb3J0SW5mby5kaXJlY3Rpb24gPyAoc29ydEluZm8uZmllbGQgKyAnICcgKyBzb3J0SW5mby5kaXJlY3Rpb24pIDogJyc7XG4gICAgICAgIGNvbnN0IGZpbHRlckZpZWxkcyA9IHRoaXMuZ2V0RmlsdGVyRmllbGRzKHRoaXMudGFibGUuZmlsdGVySW5mbyk7XG4gICAgICAgIHJlZnJlc2hEYXRhU291cmNlKHRoaXMudGFibGUuZGF0YXNvdXJjZSwge1xuICAgICAgICAgICAgcGFnZTogcGFnZSxcbiAgICAgICAgICAgIGZpbHRlckZpZWxkcyA6IGZpbHRlckZpZWxkcyxcbiAgICAgICAgICAgIG9yZGVyQnkgOiBzb3J0T3B0aW9uc1xuICAgICAgICB9KTtcbiAgICB9XG59XG4iXX0=