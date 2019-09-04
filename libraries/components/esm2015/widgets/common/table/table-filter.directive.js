import { Directive, Inject, Self } from '@angular/core';
import { $appDigest, DataSource, DataType, FormWidgetType, getClonedObject, isDefined, isNumberType } from '@wm/core';
import { TableComponent } from './table.component';
import { refreshDataSource } from '../../../utils/data-utils';
import { getMatchModeMsgs, getMatchModeTypesMap, isDataSetWidget } from '../../../utils/widget-utils';
const emptyMatchModes = ['null', 'empty', 'nullorempty', 'isnotnull', 'isnotempty'];
// Get search value based on the time
const getSearchValue = (value, type) => {
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
const ɵ0 = getSearchValue;
// Filter the data based on the search value and conditions
const getFilteredData = (data, searchObj) => {
    const searchVal = getSearchValue(searchObj.value, searchObj.type);
    let currentVal;
    if (!isDefined(searchVal) && !_.includes(emptyMatchModes, searchObj.matchMode)) {
        return data;
    }
    data = data.filter((obj) => {
        let isExists;
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
const ɵ1 = getFilteredData;
// Set the filter fields as required by datasource
const setFilterFields = (filterFields, searchObj) => {
    const field = searchObj && searchObj.field;
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
const ɵ2 = setFilterFields;
// Transform filter fields from array to object having field names as keys
const transformFilterField = (userFilters, filterField) => {
    if (filterField.field) {
        userFilters[filterField.field] = {
            value: filterField.value,
            matchMode: filterField.matchMode,
            type: filterField.type
        };
    }
};
const ɵ3 = transformFilterField;
export class TableFilterSortDirective {
    constructor(table) {
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
    getNavigationTargetBySortInfo() {
        return this.table.sortInfo && this.table.sortInfo.direction === 'desc' &&
            _.includes(this.table.primaryKey, this.table.sortInfo.field) ? 'first' : 'last';
    }
    // Get the filter fields as required by datasource
    getFilterFields(searchObj) {
        const filterFields = {};
        if (_.isArray(searchObj)) {
            _.forEach(searchObj, obj => {
                setFilterFields(filterFields, obj);
            });
        }
        else {
            setFilterFields(filterFields, searchObj);
        }
        return filterFields;
    }
    // Reset the sort based on sort returned by the call
    resetSortStatus(variableSort) {
        let gridSortString;
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
    }
    // Clear the all the filters applied
    clearFilter(skipFilter) {
        let $gridElement;
        this.table.filterInfo = {};
        if (this.table.filtermode === 'multicolumn') {
            this.table.fieldDefs.forEach(col => {
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
    }
    // Check the filters applied and remove if dat does not contain any filters
    checkFiltersApplied(variableSort) {
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
    }
    // Returns data filtered using searchObj
    getSearchResult(data, searchObj) {
        if (!searchObj) {
            return data;
        }
        if (_.isArray(searchObj)) {
            searchObj.forEach((obj) => {
                data = getFilteredData(data, obj);
            });
        }
        else {
            data = getFilteredData(data, searchObj);
        }
        return data;
    }
    // Returns data sorted using sortObj
    getSortResult(data, sortObj) {
        if (sortObj && sortObj.direction) {
            data = _.orderBy(data, sortObj.field, sortObj.direction);
        }
        return data;
    }
    // This method handles the client side sort and search
    handleClientSideSortSearch(searchSortObj, e, type) {
        this.table._isClientSearch = true;
        let data;
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
    }
    // This method handles the search for pageable datasource
    handleSinglePageSearch(searchObj) {
        this.table._isPageSearch = true;
        let data = getClonedObject(this.table.gridData);
        const $rows = this.table.datagridElement.find('tbody tr.app-datagrid-row');
        this.table.filterInfo = searchObj;
        data = this.getSearchResult(data, searchObj);
        // Compared the filtered data and original data, to show or hide the rows
        _.forEach(this.table.gridData, (value, index) => {
            const $row = $($rows[index]);
            if (_.find(data, obj => _.isEqual(obj, value))) {
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
    }
    // This method handles the search for server side variables
    handleServerSideSearch(searchObj) {
        this.table.filterInfo = searchObj;
        if (!this.table.datasource) {
            return;
        }
        const sortInfo = this.table.sortInfo;
        const sortOptions = sortInfo && sortInfo.direction ? (sortInfo.field + ' ' + sortInfo.direction) : '';
        const filterFields = this.getFilterFields(searchObj);
        refreshDataSource(this.table.datasource, {
            page: 1,
            filterFields: filterFields,
            orderBy: sortOptions
        }).then(() => {
            $appDigest();
        }, () => {
            this.table.toggleMessage(true, 'error', this.table.nodatamessage);
        });
    }
    // This method handles the sort for server side variables
    handleSeverSideSort(sortObj, e) {
        // Update the sort info for passing to datagrid
        this.table.gridOptions.sortInfo.field = sortObj.field;
        this.table.gridOptions.sortInfo.direction = sortObj.direction;
        this.table.sortInfo = getClonedObject(sortObj);
        const sortOptions = sortObj && sortObj.direction ? (sortObj.field + ' ' + sortObj.direction) : '';
        const filterFields = this.getFilterFields(this.table.filterInfo);
        refreshDataSource(this.table.datasource, {
            page: 1,
            filterFields: filterFields,
            orderBy: sortOptions
        }).then((response) => {
            $appDigest();
            const data = (response && response.data) ? response.data : response;
            this.table.invokeEventCallback('sort', { $event: e, $data: {
                    data,
                    sortDirection: sortObj.direction,
                    colDef: this.table.columns[sortObj.field]
                } });
        });
    }
    searchHandler(searchSortObj, e, type) {
        let filterFields = getClonedObject(searchSortObj);
        const dataSource = this.table.datasource;
        if (!dataSource) {
            return;
        }
        let output;
        const userFilters = {};
        // Transform filter fields from array to object having field names as keys
        if (_.isArray(filterFields)) {
            filterFields.forEach(filterField => {
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
        _.forEach(userFilters, (val, key) => {
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
    }
    sortHandler(searchSortObj, e, type) {
        const dataSource = this.table.datasource;
        if (!dataSource) {
            return;
        }
        if (dataSource.execute(DataSource.Operation.IS_PAGEABLE)) {
            this.handleSeverSideSort(searchSortObj, e);
        }
        else {
            this.handleClientSideSortSearch(searchSortObj, e, type);
        }
    }
    // This method is triggered by jquery table
    searchSortHandler(searchSortObj, e, type) {
        if (type === 'search') {
            this.searchHandler(searchSortObj, e, type);
        }
        else {
            this.sortHandler(searchSortObj, e, type);
        }
    }
    // Method to show/hide clear icon in multi column filter
    showClearIcon(fieldName) {
        const value = this.table.rowFilter[fieldName] && this.table.rowFilter[fieldName].value;
        return isDefined(value) && value !== '' && value !== null;
    }
    // Method clear the filter value in multi column filter
    clearRowFilter(fieldName) {
        if (this.table.rowFilter && this.table.rowFilter[fieldName]) {
            this.table.columns[fieldName].resetFilter();
            this.onRowFilterChange(fieldName);
        }
    }
    // This method is triggered on select of condition in multi column filter
    onFilterConditionSelect(fieldName, condition) {
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
                setTimeout(() => {
                    this.table.columns[fieldName].filterInstance.focus();
                });
            }
        }
    }
    // Method to get the updated values when filter on field is changed for multicolumn filter
    getFilterOnFieldValues(filterDef) {
        if (!this.table.datasource || !this.table.datasource.execute(DataSource.Operation.SUPPORTS_DISTINCT_API)) {
            return;
        }
        const fieldName = filterDef.field;
        const formFields = this.table.fullFieldDefs;
        const filterOnFields = _.filter(formFields, { 'filteronfilter': fieldName });
        const newVal = _.get(this.table.rowFilter, [fieldName, 'value']);
        // Loop over the fields for which the current field is filter on field
        _.forEach(filterOnFields, filterField => {
            const filterOn = filterField.filteronfilter;
            const filterKey = filterField.field;
            const filterFields = {};
            const filterWidget = filterField.filterwidget;
            if (!isDataSetWidget(filterWidget) || filterOn === filterKey || filterField.isFilterDataSetBound) {
                return;
            }
            filterFields[filterOn] = (isDefined(newVal) && newVal !== '' && newVal !== null) ? { 'value': newVal } : {};
            if (filterWidget === FormWidgetType.AUTOCOMPLETE && filterField.filterInstance.dataoptions) {
                filterField.filterInstance.dataoptions.filterFields = filterFields;
            }
            else {
                this.table.datasource.execute(DataSource.Operation.GET_DISTINCT_DATA_BY_FIELDS, {
                    'fields': filterKey,
                    'filterFields': filterFields
                }).then(data => {
                    filterField.filterdataset = data.data;
                });
            }
        });
    }
    // This method is triggered on value change in multi column filter
    onRowFilterChange(fieldName) {
        const searchObj = [];
        const field = _.find(this.table.fullFieldDefs, { 'field': fieldName });
        // Convert row filters to a search object and call search handler
        _.forEach(this.table.rowFilter, (value, key) => {
            if ((isDefined(value.value) && value.value !== '') || _.includes(this.table.emptyMatchModes, value.matchMode)) {
                if (field && key === field.field) {
                    value.type = value.type || field.type;
                    value.matchMode = value.matchMode || _.get(this.table.matchModeTypesMap[value.type], 0);
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
    }
    refreshData(isSamePage) {
        if (!this.table.datasource) {
            return;
        }
        const page = isSamePage ? this.table.dataNavigator.dn.currentPage : 1;
        const sortInfo = this.table.sortInfo;
        const sortOptions = sortInfo && sortInfo.direction ? (sortInfo.field + ' ' + sortInfo.direction) : '';
        const filterFields = this.getFilterFields(this.table.filterInfo);
        refreshDataSource(this.table.datasource, {
            page: page,
            filterFields: filterFields,
            orderBy: sortOptions
        });
    }
}
TableFilterSortDirective.decorators = [
    { type: Directive, args: [{
                selector: '[wmTableFilterSort]'
            },] }
];
/** @nocollapse */
TableFilterSortDirective.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Self }, { type: Inject, args: [TableComponent,] }] }
];
export { ɵ0, ɵ1, ɵ2, ɵ3 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibGUtZmlsdGVyLmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vdGFibGUvdGFibGUtZmlsdGVyLmRpcmVjdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFeEQsT0FBTyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLGNBQWMsRUFBRSxlQUFlLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUV0SCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDbkQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDOUQsT0FBTyxFQUFFLGdCQUFnQixFQUFFLG9CQUFvQixFQUFFLGVBQWUsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBS3RHLE1BQU0sZUFBZSxHQUFHLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxhQUFhLEVBQUUsV0FBVyxFQUFFLFlBQVksQ0FBQyxDQUFDO0FBRXBGLHFDQUFxQztBQUNyQyxNQUFNLGNBQWMsR0FBRyxDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsRUFBRTtJQUNuQyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxJQUFJLEtBQUssS0FBSyxFQUFFLEVBQUU7UUFDbkMsT0FBTyxTQUFTLENBQUM7S0FDcEI7SUFDRCxJQUFJLFlBQVksQ0FBQyxJQUFJLENBQUMsRUFBRTtRQUNwQixPQUFPLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDNUI7SUFDRCxJQUFJLElBQUksS0FBSyxRQUFRLENBQUMsUUFBUSxFQUFFO1FBQzVCLE9BQU8sTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQ2xD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Q0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssR0FBRyxHQUFHLEdBQUcsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDdkcsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBQ2pFLGlCQUFpQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFO1lBQ3JDLElBQUksRUFBRSxJQUFJO1lBQ1YsWUFBWSxFQUFHLFlBQVk7WUFDM0IsT0FBTyxFQUFHLFdBQVc7U0FDeEIsQ0FBQyxDQUFDO0lBQ1AsQ0FBQzs7O1lBMVpKLFNBQVMsU0FBQztnQkFDUCxRQUFRLEVBQUUscUJBQXFCO2FBQ2xDOzs7OzRDQUdnQixJQUFJLFlBQUksTUFBTSxTQUFDLGNBQWMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEaXJlY3RpdmUsIEluamVjdCwgU2VsZiB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyAkYXBwRGlnZXN0LCBEYXRhU291cmNlLCBEYXRhVHlwZSwgRm9ybVdpZGdldFR5cGUsIGdldENsb25lZE9iamVjdCwgaXNEZWZpbmVkLCBpc051bWJlclR5cGUgfSBmcm9tICdAd20vY29yZSc7XG5cbmltcG9ydCB7IFRhYmxlQ29tcG9uZW50IH0gZnJvbSAnLi90YWJsZS5jb21wb25lbnQnO1xuaW1wb3J0IHsgcmVmcmVzaERhdGFTb3VyY2UgfSBmcm9tICcuLi8uLi8uLi91dGlscy9kYXRhLXV0aWxzJztcbmltcG9ydCB7IGdldE1hdGNoTW9kZU1zZ3MsIGdldE1hdGNoTW9kZVR5cGVzTWFwLCBpc0RhdGFTZXRXaWRnZXQgfSBmcm9tICcuLi8uLi8uLi91dGlscy93aWRnZXQtdXRpbHMnO1xuXG5kZWNsYXJlIGNvbnN0IF8sICQ7XG5kZWNsYXJlIGNvbnN0IG1vbWVudDtcblxuY29uc3QgZW1wdHlNYXRjaE1vZGVzID0gWydudWxsJywgJ2VtcHR5JywgJ251bGxvcmVtcHR5JywgJ2lzbm90bnVsbCcsICdpc25vdGVtcHR5J107XG5cbi8vIEdldCBzZWFyY2ggdmFsdWUgYmFzZWQgb24gdGhlIHRpbWVcbmNvbnN0IGdldFNlYXJjaFZhbHVlID0gKHZhbHVlLCB0eXBlKSA9PiB7XG4gICAgaWYgKCFpc0RlZmluZWQodmFsdWUpIHx8IHZhbHVlID09PSAnJykge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBpZiAoaXNOdW1iZXJUeXBlKHR5cGUpKSB7XG4gICAgICAgIHJldHVybiBfLnRvTnVtYmVyKHZhbHVlKTtcbiAgICB9XG4gICAgaWYgKHR5cGUgPT09IERhdGFUeXBlLkRBVEVUSU1FKSB7XG4gICAgICAgIHJldHVybiBtb21lbnQodmFsdWUpLnZhbHVlT2YoKTtcbiAgICB9XG4gICAgcmV0dXJuIF8udG9TdHJpbmcodmFsdWUpLnRvTG93ZXJDYXNlKCk7XG59O1xuXG4vLyBGaWx0ZXIgdGhlIGRhdGEgYmFzZWQgb24gdGhlIHNlYXJjaCB2YWx1ZSBhbmQgY29uZGl0aW9uc1xuY29uc3QgZ2V0RmlsdGVyZWREYXRhID0gKGRhdGEsIHNlYXJjaE9iaikgPT4ge1xuICAgIGNvbnN0IHNlYXJjaFZhbCA9IGdldFNlYXJjaFZhbHVlKHNlYXJjaE9iai52YWx1ZSwgc2VhcmNoT2JqLnR5cGUpO1xuICAgIGxldCBjdXJyZW50VmFsO1xuICAgIGlmICghaXNEZWZpbmVkKHNlYXJjaFZhbCkgJiYgIV8uaW5jbHVkZXMoZW1wdHlNYXRjaE1vZGVzLCBzZWFyY2hPYmoubWF0Y2hNb2RlKSkge1xuICAgICAgICByZXR1cm4gZGF0YTtcbiAgICB9XG4gICAgZGF0YSA9IGRhdGEuZmlsdGVyKChvYmopID0+IHtcbiAgICAgICAgbGV0IGlzRXhpc3RzO1xuICAgICAgICBpZiAoc2VhcmNoT2JqLmZpZWxkKSB7XG4gICAgICAgICAgICBjdXJyZW50VmFsID0gZ2V0U2VhcmNoVmFsdWUoXy5nZXQob2JqLCBzZWFyY2hPYmouZmllbGQpLCBzZWFyY2hPYmoudHlwZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjdXJyZW50VmFsID0gXy52YWx1ZXMob2JqKS5qb2luKCcgJykudG9Mb3dlckNhc2UoKTsgLy8gSWYgZmllbGQgaXMgbm90IHRoZXJlLCBzZWFyY2ggb24gYWxsIHRoZSBjb2x1bW5zXG4gICAgICAgIH1cbiAgICAgICAgc3dpdGNoIChzZWFyY2hPYmoubWF0Y2hNb2RlKSB7XG4gICAgICAgICAgICBjYXNlICdzdGFydCc6XG4gICAgICAgICAgICAgICAgaXNFeGlzdHMgPSBfLnN0YXJ0c1dpdGgoY3VycmVudFZhbCwgc2VhcmNoVmFsIGFzIHN0cmluZyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdlbmQnOlxuICAgICAgICAgICAgICAgIGlzRXhpc3RzID0gXy5lbmRzV2l0aChjdXJyZW50VmFsLCBzZWFyY2hWYWwgYXMgc3RyaW5nKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2V4YWN0JzpcbiAgICAgICAgICAgICAgICBpc0V4aXN0cyA9IF8uaXNFcXVhbChjdXJyZW50VmFsLCBzZWFyY2hWYWwpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnbm90ZXF1YWxzJzpcbiAgICAgICAgICAgICAgICBpc0V4aXN0cyA9ICFfLmlzRXF1YWwoY3VycmVudFZhbCwgc2VhcmNoVmFsKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ251bGwnOlxuICAgICAgICAgICAgICAgIGlzRXhpc3RzID0gXy5pc051bGwoY3VycmVudFZhbCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdpc25vdG51bGwnOlxuICAgICAgICAgICAgICAgIGlzRXhpc3RzID0gIV8uaXNOdWxsKGN1cnJlbnRWYWwpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnZW1wdHknOlxuICAgICAgICAgICAgICAgIGlzRXhpc3RzID0gXy5pc0VtcHR5KGN1cnJlbnRWYWwpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnaXNub3RlbXB0eSc6XG4gICAgICAgICAgICAgICAgaXNFeGlzdHMgPSAhXy5pc0VtcHR5KGN1cnJlbnRWYWwpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnbnVsbG9yZW1wdHknOlxuICAgICAgICAgICAgICAgIGlzRXhpc3RzID0gXy5pc051bGwoY3VycmVudFZhbCkgfHwgXy5pc0VtcHR5KGN1cnJlbnRWYWwpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnbGVzc3RoYW4nOlxuICAgICAgICAgICAgICAgIGlzRXhpc3RzID0gY3VycmVudFZhbCA8IHNlYXJjaFZhbDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ2xlc3N0aGFuZXF1YWwnOlxuICAgICAgICAgICAgICAgIGlzRXhpc3RzID0gY3VycmVudFZhbCA8PSBzZWFyY2hWYWw7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdncmVhdGVydGhhbic6XG4gICAgICAgICAgICAgICAgaXNFeGlzdHMgPSBjdXJyZW50VmFsID4gc2VhcmNoVmFsO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnZ3JlYXRlcnRoYW5lcXVhbCc6XG4gICAgICAgICAgICAgICAgaXNFeGlzdHMgPSBjdXJyZW50VmFsID49IHNlYXJjaFZhbDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgaXNFeGlzdHMgPSBpc051bWJlclR5cGUoc2VhcmNoT2JqLnR5cGUpID8gXy5pc0VxdWFsKGN1cnJlbnRWYWwsIHNlYXJjaFZhbCkgOiBfLmluY2x1ZGVzKGN1cnJlbnRWYWwsIHNlYXJjaFZhbCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGlzRXhpc3RzO1xuICAgIH0pO1xuICAgIHJldHVybiBkYXRhO1xufTtcblxuLy8gU2V0IHRoZSBmaWx0ZXIgZmllbGRzIGFzIHJlcXVpcmVkIGJ5IGRhdGFzb3VyY2VcbmNvbnN0IHNldEZpbHRlckZpZWxkcyA9IChmaWx0ZXJGaWVsZHMsIHNlYXJjaE9iaikgPT4ge1xuICAgIGNvbnN0IGZpZWxkID0gc2VhcmNoT2JqICYmIHNlYXJjaE9iai5maWVsZDtcbiAgICAvKlNldCB0aGUgZmlsdGVyIG9wdGlvbnMgb25seSB3aGVuIGEgZmllbGQvY29sdW1uIGhhcyBiZWVuIHNlbGVjdGVkLiovXG4gICAgaWYgKGZpZWxkKSB7XG4gICAgICAgIGZpbHRlckZpZWxkc1tmaWVsZF0gPSB7XG4gICAgICAgICAgICAndmFsdWUnICAgICA6IHNlYXJjaE9iai52YWx1ZSxcbiAgICAgICAgICAgICdsb2dpY2FsT3AnIDogJ0FORCdcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHNlYXJjaE9iai5tYXRjaE1vZGUpIHtcbiAgICAgICAgICAgIGZpbHRlckZpZWxkc1tmaWVsZF0ubWF0Y2hNb2RlID0gc2VhcmNoT2JqLm1hdGNoTW9kZTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbi8vIFRyYW5zZm9ybSBmaWx0ZXIgZmllbGRzIGZyb20gYXJyYXkgdG8gb2JqZWN0IGhhdmluZyBmaWVsZCBuYW1lcyBhcyBrZXlzXG5jb25zdCB0cmFuc2Zvcm1GaWx0ZXJGaWVsZCA9ICh1c2VyRmlsdGVycywgZmlsdGVyRmllbGQpID0+IHtcbiAgICBpZiAoZmlsdGVyRmllbGQuZmllbGQpIHtcbiAgICAgICAgdXNlckZpbHRlcnNbZmlsdGVyRmllbGQuZmllbGRdID0ge1xuICAgICAgICAgICAgdmFsdWU6IGZpbHRlckZpZWxkLnZhbHVlLFxuICAgICAgICAgICAgbWF0Y2hNb2RlOiBmaWx0ZXJGaWVsZC5tYXRjaE1vZGUsXG4gICAgICAgICAgICB0eXBlOiBmaWx0ZXJGaWVsZC50eXBlXG4gICAgICAgIH07XG4gICAgfVxufTtcblxuQERpcmVjdGl2ZSh7XG4gICAgc2VsZWN0b3I6ICdbd21UYWJsZUZpbHRlclNvcnRdJ1xufSlcbmV4cG9ydCBjbGFzcyBUYWJsZUZpbHRlclNvcnREaXJlY3RpdmUge1xuXG4gICAgY29uc3RydWN0b3IoQFNlbGYoKSBASW5qZWN0KFRhYmxlQ29tcG9uZW50KSBwcml2YXRlIHRhYmxlKSB7XG4gICAgICAgIHRhYmxlLl9zZWFyY2hTb3J0SGFuZGxlciA9IHRoaXMuc2VhcmNoU29ydEhhbmRsZXIuYmluZCh0aGlzKTtcbiAgICAgICAgdGFibGUuZ2V0U2VhcmNoUmVzdWx0ID0gdGhpcy5nZXRTZWFyY2hSZXN1bHQuYmluZCh0aGlzKTtcbiAgICAgICAgdGFibGUuZ2V0U29ydFJlc3VsdCA9IHRoaXMuZ2V0U29ydFJlc3VsdC5iaW5kKHRoaXMpO1xuICAgICAgICB0YWJsZS5jaGVja0ZpbHRlcnNBcHBsaWVkID0gdGhpcy5jaGVja0ZpbHRlcnNBcHBsaWVkLmJpbmQodGhpcyk7XG4gICAgICAgIHRhYmxlLmdldEZpbHRlckZpZWxkcyA9IHRoaXMuZ2V0RmlsdGVyRmllbGRzLmJpbmQodGhpcyk7XG4gICAgICAgIHRhYmxlLm9uUm93RmlsdGVyQ2hhbmdlID0gdGhpcy5vblJvd0ZpbHRlckNoYW5nZS5iaW5kKHRoaXMpO1xuICAgICAgICB0YWJsZS5vbkZpbHRlckNvbmRpdGlvblNlbGVjdCA9IHRoaXMub25GaWx0ZXJDb25kaXRpb25TZWxlY3QuYmluZCh0aGlzKTtcbiAgICAgICAgdGFibGUuc2hvd0NsZWFySWNvbiA9IHRoaXMuc2hvd0NsZWFySWNvbi5iaW5kKHRoaXMpO1xuICAgICAgICB0YWJsZS5jbGVhclJvd0ZpbHRlciA9IHRoaXMuY2xlYXJSb3dGaWx0ZXIuYmluZCh0aGlzKTtcbiAgICAgICAgdGFibGUubWF0Y2hNb2RlVHlwZXNNYXAgPSBnZXRNYXRjaE1vZGVUeXBlc01hcCgpO1xuICAgICAgICB0YWJsZS5tYXRjaE1vZGVNc2dzID0gZ2V0TWF0Y2hNb2RlTXNncyh0YWJsZS5hcHBMb2NhbGUpO1xuICAgICAgICB0YWJsZS5lbXB0eU1hdGNoTW9kZXMgPSBlbXB0eU1hdGNoTW9kZXM7XG4gICAgICAgIHRhYmxlLmdldE5hdmlnYXRpb25UYXJnZXRCeVNvcnRJbmZvID0gdGhpcy5nZXROYXZpZ2F0aW9uVGFyZ2V0QnlTb3J0SW5mby5iaW5kKHRoaXMpO1xuICAgICAgICB0YWJsZS5yZWZyZXNoRGF0YSA9IHRoaXMucmVmcmVzaERhdGEuYmluZCh0aGlzKTtcbiAgICAgICAgdGFibGUuY2xlYXJGaWx0ZXIgPSB0aGlzLmNsZWFyRmlsdGVyLmJpbmQodGhpcyk7XG4gICAgfVxuXG4gICAgLy8gR2V0IGZpcnN0IG9yIGxhc3QgcGFnZSBiYXNlZCBvbiBzb3J0IGluZm8gb2YgcHJpbWFyeSBrZXlcbiAgICBnZXROYXZpZ2F0aW9uVGFyZ2V0QnlTb3J0SW5mbygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGFibGUuc29ydEluZm8gJiYgdGhpcy50YWJsZS5zb3J0SW5mby5kaXJlY3Rpb24gPT09ICdkZXNjJyAmJlxuICAgICAgICAgICAgICAgICAgICBfLmluY2x1ZGVzKHRoaXMudGFibGUucHJpbWFyeUtleSwgdGhpcy50YWJsZS5zb3J0SW5mby5maWVsZCkgPyAnZmlyc3QnIDogJ2xhc3QnO1xuICAgIH1cblxuICAgIC8vIEdldCB0aGUgZmlsdGVyIGZpZWxkcyBhcyByZXF1aXJlZCBieSBkYXRhc291cmNlXG4gICAgZ2V0RmlsdGVyRmllbGRzKHNlYXJjaE9iaikge1xuICAgICAgICBjb25zdCBmaWx0ZXJGaWVsZHMgPSB7fTtcbiAgICAgICAgaWYgKF8uaXNBcnJheShzZWFyY2hPYmopKSB7XG4gICAgICAgICAgICBfLmZvckVhY2goc2VhcmNoT2JqLCAgb2JqID0+IHtcbiAgICAgICAgICAgICAgICBzZXRGaWx0ZXJGaWVsZHMoZmlsdGVyRmllbGRzLCBvYmopO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzZXRGaWx0ZXJGaWVsZHMoZmlsdGVyRmllbGRzLCBzZWFyY2hPYmopO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmaWx0ZXJGaWVsZHM7XG4gICAgfVxuXG4gICAgLy8gUmVzZXQgdGhlIHNvcnQgYmFzZWQgb24gc29ydCByZXR1cm5lZCBieSB0aGUgY2FsbFxuICAgIHJlc2V0U29ydFN0YXR1cyh2YXJpYWJsZVNvcnQpIHtcbiAgICAgICAgbGV0IGdyaWRTb3J0U3RyaW5nO1xuICAgICAgICBpZiAoIV8uaXNFbXB0eSh0aGlzLnRhYmxlLnNvcnRJbmZvKSAmJiB0aGlzLnRhYmxlLmRhdGFzb3VyY2UpIHtcbiAgICAgICAgICAgIGdyaWRTb3J0U3RyaW5nID0gdGhpcy50YWJsZS5zb3J0SW5mby5maWVsZCArICcgJyArIHRoaXMudGFibGUuc29ydEluZm8uZGlyZWN0aW9uO1xuICAgICAgICAgICAgdmFyaWFibGVTb3J0ID0gdGhpcy50YWJsZS5kYXRhc291cmNlLmV4ZWN1dGUoRGF0YVNvdXJjZS5PcGVyYXRpb24uR0VUX09QVElPTlMpLm9yZGVyQnkgfHwgdmFyaWFibGVTb3J0O1xuICAgICAgICAgICAgaWYgKHZhcmlhYmxlU29ydCkgeyAvLyBJZiBtdWx0aXBsZSBvcmRlciBieSBmaWVsZHMgYXJlIHByZXNlbnQsIGNvbXBhcmUgd2l0aCB0aGUgZmlyc3Qgb25lXG4gICAgICAgICAgICAgICAgdmFyaWFibGVTb3J0ID0gXy5oZWFkKF8uc3BsaXQodmFyaWFibGVTb3J0LCAnLCcpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChncmlkU29ydFN0cmluZyAhPT0gdmFyaWFibGVTb3J0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy50YWJsZS5jYWxsRGF0YUdyaWRNZXRob2QoJ3Jlc2V0U29ydEljb25zJyk7XG4gICAgICAgICAgICAgICAgdGhpcy50YWJsZS5zb3J0SW5mbyA9IHt9O1xuICAgICAgICAgICAgICAgIHRoaXMudGFibGUuc2V0RGF0YUdyaWRPcHRpb24oJ3NvcnRJbmZvJywge30pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gQ2xlYXIgdGhlIGFsbCB0aGUgZmlsdGVycyBhcHBsaWVkXG4gICAgY2xlYXJGaWx0ZXIoc2tpcEZpbHRlcikge1xuICAgICAgICBsZXQgJGdyaWRFbGVtZW50O1xuICAgICAgICB0aGlzLnRhYmxlLmZpbHRlckluZm8gPSB7fTtcbiAgICAgICAgaWYgKHRoaXMudGFibGUuZmlsdGVybW9kZSA9PT0gJ211bHRpY29sdW1uJykge1xuICAgICAgICAgICAgdGhpcy50YWJsZS5maWVsZERlZnMuZm9yRWFjaChjb2wgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChjb2wucmVzZXRGaWx0ZXIpIHtcbiAgICAgICAgICAgICAgICAgICAgY29sLnJlc2V0RmlsdGVyKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoIXNraXBGaWx0ZXIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRhYmxlLm9uUm93RmlsdGVyQ2hhbmdlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy50YWJsZS5maWx0ZXJtb2RlID09PSAnc2VhcmNoJykge1xuICAgICAgICAgICAgJGdyaWRFbGVtZW50ID0gdGhpcy50YWJsZS5kYXRhZ3JpZEVsZW1lbnQ7XG4gICAgICAgICAgICAkZ3JpZEVsZW1lbnQuZmluZCgnW2RhdGEtZWxlbWVudD1cImRnU2VhcmNoVGV4dFwiXScpLnZhbCgnJyk7XG4gICAgICAgICAgICAkZ3JpZEVsZW1lbnQuZmluZCgnW2RhdGEtZWxlbWVudD1cImRnRmlsdGVyVmFsdWVcIl0nKS52YWwoJycpO1xuICAgICAgICAgICAgaWYgKCFza2lwRmlsdGVyKSB7XG4gICAgICAgICAgICAgICAgJGdyaWRFbGVtZW50LmZpbmQoJy5hcHAtc2VhcmNoLWJ1dHRvbicpLnRyaWdnZXIoJ2NsaWNrJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBDaGVjayB0aGUgZmlsdGVycyBhcHBsaWVkIGFuZCByZW1vdmUgaWYgZGF0IGRvZXMgbm90IGNvbnRhaW4gYW55IGZpbHRlcnNcbiAgICBjaGVja0ZpbHRlcnNBcHBsaWVkKHZhcmlhYmxlU29ydCkge1xuICAgICAgICBpZiAoIXRoaXMudGFibGUuZGF0YXNvdXJjZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnRhYmxlLmRhdGFzb3VyY2UuZXhlY3V0ZShEYXRhU291cmNlLk9wZXJhdGlvbi5TVVBQT1JUU19TRVJWRVJfRklMVEVSKSkge1xuICAgICAgICAgICAgaWYgKF8uaXNFbXB0eSh0aGlzLnRhYmxlLmRhdGFzb3VyY2UuZXhlY3V0ZShEYXRhU291cmNlLk9wZXJhdGlvbi5HRVRfT1BUSU9OUykuZmlsdGVyRmllbGRzKSAmJiBfLmlzRW1wdHkodGhpcy50YWJsZS5maWx0ZXJJbmZvKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuY2xlYXJGaWx0ZXIodHJ1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnJlc2V0U29ydFN0YXR1cyh2YXJpYWJsZVNvcnQpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnRhYmxlLmRhdGFzb3VyY2UuZXhlY3V0ZShEYXRhU291cmNlLk9wZXJhdGlvbi5JU19QQUdFQUJMRSkpIHtcbiAgICAgICAgICAgIHRoaXMucmVzZXRTb3J0U3RhdHVzKHZhcmlhYmxlU29ydCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBSZXR1cm5zIGRhdGEgZmlsdGVyZWQgdXNpbmcgc2VhcmNoT2JqXG4gICAgZ2V0U2VhcmNoUmVzdWx0KGRhdGEsIHNlYXJjaE9iaikge1xuICAgICAgICBpZiAoIXNlYXJjaE9iaikge1xuICAgICAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKF8uaXNBcnJheShzZWFyY2hPYmopKSB7XG4gICAgICAgICAgICBzZWFyY2hPYmouZm9yRWFjaCgob2JqKSA9PiB7XG4gICAgICAgICAgICAgICAgZGF0YSA9IGdldEZpbHRlcmVkRGF0YShkYXRhLCBvYmopO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkYXRhID0gZ2V0RmlsdGVyZWREYXRhKGRhdGEsIHNlYXJjaE9iaik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfVxuXG4gICAgLy8gUmV0dXJucyBkYXRhIHNvcnRlZCB1c2luZyBzb3J0T2JqXG4gICAgZ2V0U29ydFJlc3VsdChkYXRhLCBzb3J0T2JqKSB7XG4gICAgICAgIGlmIChzb3J0T2JqICYmIHNvcnRPYmouZGlyZWN0aW9uKSB7XG4gICAgICAgICAgICBkYXRhID0gXy5vcmRlckJ5KGRhdGEsIHNvcnRPYmouZmllbGQsIHNvcnRPYmouZGlyZWN0aW9uKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGF0YTtcbiAgICB9XG5cbiAgICAvLyBUaGlzIG1ldGhvZCBoYW5kbGVzIHRoZSBjbGllbnQgc2lkZSBzb3J0IGFuZCBzZWFyY2hcbiAgICBwcml2YXRlIGhhbmRsZUNsaWVudFNpZGVTb3J0U2VhcmNoKHNlYXJjaFNvcnRPYmosIGUsIHR5cGUpIHtcbiAgICAgICAgdGhpcy50YWJsZS5faXNDbGllbnRTZWFyY2ggPSB0cnVlO1xuXG4gICAgICAgIGxldCBkYXRhO1xuICAgICAgICBkYXRhID0gdGhpcy50YWJsZS5pc05hdmlnYXRpb25FbmFibGVkKCkgPyBnZXRDbG9uZWRPYmplY3QodGhpcy50YWJsZS5fX2Z1bGxEYXRhKSA6IGdldENsb25lZE9iamVjdCh0aGlzLnRhYmxlLmRhdGFzZXQpO1xuICAgICAgICBpZiAodHlwZSA9PT0gJ3NlYXJjaCcpIHtcbiAgICAgICAgICAgIHRoaXMudGFibGUuZmlsdGVySW5mbyA9IHNlYXJjaFNvcnRPYmo7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnRhYmxlLnNvcnRJbmZvID0gc2VhcmNoU29ydE9iajtcbiAgICAgICAgfVxuICAgICAgICBpZiAoXy5pc09iamVjdChkYXRhKSAmJiAhXy5pc0FycmF5KGRhdGEpKSB7XG4gICAgICAgICAgICBkYXRhID0gW2RhdGFdO1xuICAgICAgICB9XG4gICAgICAgIC8qQm90aCB0aGUgZnVuY3Rpb25zIHJldHVybiBzYW1lICdkYXRhJyBpZiBhcmd1bWVudHMgYXJlIHVuZGVmaW5lZCovXG4gICAgICAgIGRhdGEgPSB0aGlzLmdldFNlYXJjaFJlc3VsdChkYXRhLCB0aGlzLnRhYmxlLmZpbHRlckluZm8pO1xuICAgICAgICBkYXRhID0gdGhpcy5nZXRTb3J0UmVzdWx0KGRhdGEsIHRoaXMudGFibGUuc29ydEluZm8pO1xuICAgICAgICB0aGlzLnRhYmxlLnNlcnZlckRhdGEgPSBkYXRhO1xuXG4gICAgICAgIGlmICh0eXBlID09PSAnc29ydCcpIHtcbiAgICAgICAgICAgIC8vIENhbGxpbmcgJ29uU29ydCcgZXZlbnRcbiAgICAgICAgICAgIHRoaXMudGFibGUuaW52b2tlRXZlbnRDYWxsYmFjaygnc29ydCcsIHskZXZlbnQ6IGUsICRkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHRoaXMudGFibGUuc2VydmVyRGF0YSxcbiAgICAgICAgICAgICAgICAgICAgc29ydERpcmVjdGlvbjogdGhpcy50YWJsZS5zb3J0SW5mby5kaXJlY3Rpb24sXG4gICAgICAgICAgICAgICAgICAgIGNvbERlZjogdGhpcy50YWJsZS5jb2x1bW5zW3RoaXMudGFibGUuc29ydEluZm8uZmllbGRdXG4gICAgICAgICAgICAgICAgfX0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMudGFibGUuaXNOYXZpZ2F0aW9uRW5hYmxlZCgpKSB7XG4gICAgICAgICAgICAvLyBSZXNldCB0aGUgcGFnZSBudW1iZXIgdG8gMVxuICAgICAgICAgICAgdGhpcy50YWJsZS5kYXRhTmF2aWdhdG9yLmRuLmN1cnJlbnRQYWdlID0gMTtcbiAgICAgICAgICAgIHRoaXMudGFibGUuZGF0YU5hdmlnYXRvci5zZXRQYWdpbmdWYWx1ZXMoZGF0YSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnRhYmxlLnNldEdyaWREYXRhKHRoaXMudGFibGUuc2VydmVyRGF0YSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBUaGlzIG1ldGhvZCBoYW5kbGVzIHRoZSBzZWFyY2ggZm9yIHBhZ2VhYmxlIGRhdGFzb3VyY2VcbiAgICBwcml2YXRlIGhhbmRsZVNpbmdsZVBhZ2VTZWFyY2goc2VhcmNoT2JqKSB7XG4gICAgICAgIHRoaXMudGFibGUuX2lzUGFnZVNlYXJjaCA9IHRydWU7XG5cbiAgICAgICAgbGV0IGRhdGEgID0gZ2V0Q2xvbmVkT2JqZWN0KHRoaXMudGFibGUuZ3JpZERhdGEpO1xuICAgICAgICBjb25zdCAkcm93cyA9IHRoaXMudGFibGUuZGF0YWdyaWRFbGVtZW50LmZpbmQoJ3Rib2R5IHRyLmFwcC1kYXRhZ3JpZC1yb3cnKTtcbiAgICAgICAgdGhpcy50YWJsZS5maWx0ZXJJbmZvID0gc2VhcmNoT2JqO1xuICAgICAgICBkYXRhID0gdGhpcy5nZXRTZWFyY2hSZXN1bHQoZGF0YSwgc2VhcmNoT2JqKTtcbiAgICAgICAgLy8gQ29tcGFyZWQgdGhlIGZpbHRlcmVkIGRhdGEgYW5kIG9yaWdpbmFsIGRhdGEsIHRvIHNob3cgb3IgaGlkZSB0aGUgcm93c1xuICAgICAgICBfLmZvckVhY2godGhpcy50YWJsZS5ncmlkRGF0YSwgKHZhbHVlLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgJHJvdyA9ICQoJHJvd3NbaW5kZXhdKTtcbiAgICAgICAgICAgIGlmIChfLmZpbmQoZGF0YSwgb2JqID0+IF8uaXNFcXVhbChvYmosIHZhbHVlKSkpIHtcbiAgICAgICAgICAgICAgICAkcm93LnNob3coKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgJHJvdy5oaWRlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoZGF0YSAmJiBkYXRhLmxlbmd0aCkge1xuICAgICAgICAgICAgdGhpcy50YWJsZS5jYWxsRGF0YUdyaWRNZXRob2QoJ3NldFN0YXR1cycsICdyZWFkeScpO1xuICAgICAgICAgICAgLy8gU2VsZWN0IHRoZSBmaXJzdCByb3cgYWZ0ZXIgdGhlIHNlYXJjaCBmb3Igc2luZ2xlIHNlbGVjdFxuICAgICAgICAgICAgaWYgKHRoaXMudGFibGUuZ3JpZGZpcnN0cm93c2VsZWN0ICYmICF0aGlzLnRhYmxlLm11bHRpc2VsZWN0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy50YWJsZS5jYWxsRGF0YUdyaWRNZXRob2QoJ3NlbGVjdEZpcnN0Um93JywgdHJ1ZSwgdHJ1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnRhYmxlLmNhbGxEYXRhR3JpZE1ldGhvZCgnc2V0U3RhdHVzJywgJ25vZGF0YScsIHRoaXMudGFibGUubm9kYXRhbWVzc2FnZSk7XG4gICAgICAgICAgICB0aGlzLnRhYmxlLnNlbGVjdGVkaXRlbSA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnRhYmxlLmNhbGxEYXRhR3JpZE1ldGhvZCgndXBkYXRlU2VsZWN0QWxsQ2hlY2tib3hTdGF0ZScpO1xuICAgIH1cblxuICAgIC8vIFRoaXMgbWV0aG9kIGhhbmRsZXMgdGhlIHNlYXJjaCBmb3Igc2VydmVyIHNpZGUgdmFyaWFibGVzXG4gICAgcHJpdmF0ZSBoYW5kbGVTZXJ2ZXJTaWRlU2VhcmNoKHNlYXJjaE9iaikge1xuICAgICAgICB0aGlzLnRhYmxlLmZpbHRlckluZm8gPSBzZWFyY2hPYmo7XG5cbiAgICAgICAgaWYgKCF0aGlzLnRhYmxlLmRhdGFzb3VyY2UpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHNvcnRJbmZvICAgICA9IHRoaXMudGFibGUuc29ydEluZm87XG4gICAgICAgIGNvbnN0IHNvcnRPcHRpb25zICA9IHNvcnRJbmZvICYmIHNvcnRJbmZvLmRpcmVjdGlvbiA/IChzb3J0SW5mby5maWVsZCArICcgJyArIHNvcnRJbmZvLmRpcmVjdGlvbikgOiAnJztcbiAgICAgICAgY29uc3QgZmlsdGVyRmllbGRzID0gdGhpcy5nZXRGaWx0ZXJGaWVsZHMoc2VhcmNoT2JqKTtcbiAgICAgICAgcmVmcmVzaERhdGFTb3VyY2UodGhpcy50YWJsZS5kYXRhc291cmNlLCB7XG4gICAgICAgICAgICBwYWdlOiAxLFxuICAgICAgICAgICAgZmlsdGVyRmllbGRzIDogZmlsdGVyRmllbGRzLFxuICAgICAgICAgICAgb3JkZXJCeSA6IHNvcnRPcHRpb25zXG4gICAgICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgJGFwcERpZ2VzdCgpO1xuICAgICAgICB9LCAoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLnRhYmxlLnRvZ2dsZU1lc3NhZ2UodHJ1ZSwgJ2Vycm9yJywgdGhpcy50YWJsZS5ub2RhdGFtZXNzYWdlKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gVGhpcyBtZXRob2QgaGFuZGxlcyB0aGUgc29ydCBmb3Igc2VydmVyIHNpZGUgdmFyaWFibGVzXG4gICAgcHJpdmF0ZSBoYW5kbGVTZXZlclNpZGVTb3J0KHNvcnRPYmosIGUpIHtcbiAgICAgICAgLy8gVXBkYXRlIHRoZSBzb3J0IGluZm8gZm9yIHBhc3NpbmcgdG8gZGF0YWdyaWRcbiAgICAgICAgdGhpcy50YWJsZS5ncmlkT3B0aW9ucy5zb3J0SW5mby5maWVsZCA9IHNvcnRPYmouZmllbGQ7XG4gICAgICAgIHRoaXMudGFibGUuZ3JpZE9wdGlvbnMuc29ydEluZm8uZGlyZWN0aW9uID0gc29ydE9iai5kaXJlY3Rpb247XG4gICAgICAgIHRoaXMudGFibGUuc29ydEluZm8gPSBnZXRDbG9uZWRPYmplY3Qoc29ydE9iaik7XG5cbiAgICAgICAgY29uc3Qgc29ydE9wdGlvbnMgID0gc29ydE9iaiAmJiBzb3J0T2JqLmRpcmVjdGlvbiA/IChzb3J0T2JqLmZpZWxkICsgJyAnICsgc29ydE9iai5kaXJlY3Rpb24pIDogJyc7XG4gICAgICAgIGNvbnN0IGZpbHRlckZpZWxkcyA9IHRoaXMuZ2V0RmlsdGVyRmllbGRzKHRoaXMudGFibGUuZmlsdGVySW5mbyk7XG5cbiAgICAgICAgcmVmcmVzaERhdGFTb3VyY2UodGhpcy50YWJsZS5kYXRhc291cmNlLCB7XG4gICAgICAgICAgICBwYWdlIDogMSxcbiAgICAgICAgICAgIGZpbHRlckZpZWxkcyA6IGZpbHRlckZpZWxkcyxcbiAgICAgICAgICAgIG9yZGVyQnkgOiBzb3J0T3B0aW9uc1xuICAgICAgICB9KS50aGVuKChyZXNwb25zZSkgPT4ge1xuICAgICAgICAgICAgJGFwcERpZ2VzdCgpO1xuICAgICAgICAgICAgY29uc3QgZGF0YSA9IChyZXNwb25zZSAmJiByZXNwb25zZS5kYXRhKSA/IHJlc3BvbnNlLmRhdGEgOiByZXNwb25zZTtcbiAgICAgICAgICAgIHRoaXMudGFibGUuaW52b2tlRXZlbnRDYWxsYmFjaygnc29ydCcsIHskZXZlbnQ6IGUsICRkYXRhOiB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGEsXG4gICAgICAgICAgICAgICAgICAgIHNvcnREaXJlY3Rpb246IHNvcnRPYmouZGlyZWN0aW9uLFxuICAgICAgICAgICAgICAgICAgICBjb2xEZWY6IHRoaXMudGFibGUuY29sdW1uc1tzb3J0T2JqLmZpZWxkXVxuICAgICAgICAgICAgICAgIH19KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzZWFyY2hIYW5kbGVyKHNlYXJjaFNvcnRPYmosIGUsIHR5cGUpIHtcbiAgICAgICAgbGV0IGZpbHRlckZpZWxkcyA9IGdldENsb25lZE9iamVjdChzZWFyY2hTb3J0T2JqKTtcbiAgICAgICAgY29uc3QgZGF0YVNvdXJjZSA9IHRoaXMudGFibGUuZGF0YXNvdXJjZTtcbiAgICAgICAgaWYgKCFkYXRhU291cmNlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgbGV0IG91dHB1dDtcbiAgICAgICAgY29uc3QgdXNlckZpbHRlcnMgPSB7fTtcbiAgICAgICAgLy8gVHJhbnNmb3JtIGZpbHRlciBmaWVsZHMgZnJvbSBhcnJheSB0byBvYmplY3QgaGF2aW5nIGZpZWxkIG5hbWVzIGFzIGtleXNcbiAgICAgICAgaWYgKF8uaXNBcnJheShmaWx0ZXJGaWVsZHMpKSB7XG4gICAgICAgICAgICBmaWx0ZXJGaWVsZHMuZm9yRWFjaChmaWx0ZXJGaWVsZCA9PiB7XG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtRmlsdGVyRmllbGQodXNlckZpbHRlcnMsIGZpbHRlckZpZWxkKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdHJhbnNmb3JtRmlsdGVyRmllbGQodXNlckZpbHRlcnMsIGZpbHRlckZpZWxkcyk7XG4gICAgICAgIH1cbiAgICAgICAgb3V0cHV0ID0gdGhpcy50YWJsZS5pbnZva2VFdmVudENhbGxiYWNrKCdiZWZvcmVmaWx0ZXInLCB7JGV2ZW50OiBlLCAkZGF0YTogdXNlckZpbHRlcnMsIGNvbHVtbnM6IHVzZXJGaWx0ZXJzfSk7XG4gICAgICAgIC8vIElmIGNhbGxiYWNrIHJldHVybnMgZmFsc2UsIGRvbid0IHRyaWdnZXIgdGhlIGZpbHRlciBjYWxsXG4gICAgICAgIGlmIChvdXRwdXQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgLy8gVHJhbnNmb3JtIGJhY2sgdGhlIGZpbHRlciBmaWVsZHMgZnJvbSBvYmplY3QgdG8gYXJyYXlcbiAgICAgICAgZmlsdGVyRmllbGRzID0gW107XG4gICAgICAgIF8uZm9yRWFjaCh1c2VyRmlsdGVycywgKHZhbCwga2V5KSA9PiB7XG4gICAgICAgICAgICBmaWx0ZXJGaWVsZHMucHVzaCh7XG4gICAgICAgICAgICAgICAgZmllbGQ6IGtleSxcbiAgICAgICAgICAgICAgICBtYXRjaE1vZGU6IHZhbC5tYXRjaE1vZGUsXG4gICAgICAgICAgICAgICAgdHlwZTogdmFsLnR5cGUsXG4gICAgICAgICAgICAgICAgdmFsdWU6IHZhbC52YWx1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoZGF0YVNvdXJjZS5leGVjdXRlKERhdGFTb3VyY2UuT3BlcmF0aW9uLlNVUFBPUlRTX1NFUlZFUl9GSUxURVIpKSB7XG4gICAgICAgICAgICB0aGlzLmhhbmRsZVNlcnZlclNpZGVTZWFyY2goZmlsdGVyRmllbGRzKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZGF0YVNvdXJjZS5leGVjdXRlKERhdGFTb3VyY2UuT3BlcmF0aW9uLklTX0FQSV9BV0FSRSkgJiYgZGF0YVNvdXJjZS5leGVjdXRlKERhdGFTb3VyY2UuT3BlcmF0aW9uLklTX1BBR0VBQkxFKSkge1xuICAgICAgICAgICAgdGhpcy5oYW5kbGVTaW5nbGVQYWdlU2VhcmNoKGZpbHRlckZpZWxkcyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmhhbmRsZUNsaWVudFNpZGVTb3J0U2VhcmNoKGZpbHRlckZpZWxkcywgZSwgdHlwZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHNvcnRIYW5kbGVyKHNlYXJjaFNvcnRPYmosIGUsIHR5cGUpIHtcbiAgICAgICAgY29uc3QgZGF0YVNvdXJjZSA9IHRoaXMudGFibGUuZGF0YXNvdXJjZTtcbiAgICAgICAgaWYgKCFkYXRhU291cmNlKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRhdGFTb3VyY2UuZXhlY3V0ZShEYXRhU291cmNlLk9wZXJhdGlvbi5JU19QQUdFQUJMRSkpIHtcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlU2V2ZXJTaWRlU29ydChzZWFyY2hTb3J0T2JqLCBlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlQ2xpZW50U2lkZVNvcnRTZWFyY2goc2VhcmNoU29ydE9iaiwgZSwgdHlwZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBUaGlzIG1ldGhvZCBpcyB0cmlnZ2VyZWQgYnkganF1ZXJ5IHRhYmxlXG4gICAgc2VhcmNoU29ydEhhbmRsZXIoc2VhcmNoU29ydE9iaiwgZSwgdHlwZSkge1xuICAgICAgICBpZiAodHlwZSA9PT0gJ3NlYXJjaCcpIHtcbiAgICAgICAgICAgIHRoaXMuc2VhcmNoSGFuZGxlcihzZWFyY2hTb3J0T2JqLCBlLCB0eXBlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuc29ydEhhbmRsZXIoc2VhcmNoU29ydE9iaiwgZSwgdHlwZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBNZXRob2QgdG8gc2hvdy9oaWRlIGNsZWFyIGljb24gaW4gbXVsdGkgY29sdW1uIGZpbHRlclxuICAgIHNob3dDbGVhckljb24oZmllbGROYW1lKSB7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy50YWJsZS5yb3dGaWx0ZXJbZmllbGROYW1lXSAmJiB0aGlzLnRhYmxlLnJvd0ZpbHRlcltmaWVsZE5hbWVdLnZhbHVlO1xuICAgICAgICByZXR1cm4gaXNEZWZpbmVkKHZhbHVlKSAmJiB2YWx1ZSAhPT0gJycgJiYgdmFsdWUgIT09IG51bGw7XG4gICAgfVxuXG4gICAgLy8gTWV0aG9kIGNsZWFyIHRoZSBmaWx0ZXIgdmFsdWUgaW4gbXVsdGkgY29sdW1uIGZpbHRlclxuICAgIGNsZWFyUm93RmlsdGVyKGZpZWxkTmFtZSkge1xuICAgICAgICBpZiAodGhpcy50YWJsZS5yb3dGaWx0ZXIgJiYgdGhpcy50YWJsZS5yb3dGaWx0ZXJbZmllbGROYW1lXSkge1xuICAgICAgICAgICAgdGhpcy50YWJsZS5jb2x1bW5zW2ZpZWxkTmFtZV0ucmVzZXRGaWx0ZXIoKTtcbiAgICAgICAgICAgIHRoaXMub25Sb3dGaWx0ZXJDaGFuZ2UoZmllbGROYW1lKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFRoaXMgbWV0aG9kIGlzIHRyaWdnZXJlZCBvbiBzZWxlY3Qgb2YgY29uZGl0aW9uIGluIG11bHRpIGNvbHVtbiBmaWx0ZXJcbiAgICBvbkZpbHRlckNvbmRpdGlvblNlbGVjdChmaWVsZE5hbWUsIGNvbmRpdGlvbikge1xuICAgICAgICB0aGlzLnRhYmxlLnJvd0ZpbHRlcltmaWVsZE5hbWVdID0gdGhpcy50YWJsZS5yb3dGaWx0ZXJbZmllbGROYW1lXSB8fCB7fTtcbiAgICAgICAgdGhpcy50YWJsZS5yb3dGaWx0ZXJbZmllbGROYW1lXS5tYXRjaE1vZGUgPSBjb25kaXRpb247XG4gICAgICAgIC8vIEZvciBlbXB0eSBtYXRjaCBtb2RlcywgY2xlYXIgb2ZmIHRoZSB2YWx1ZSBhbmQgY2FsbCBmaWx0ZXJcbiAgICAgICAgaWYgKF8uaW5jbHVkZXModGhpcy50YWJsZS5lbXB0eU1hdGNoTW9kZXMsIGNvbmRpdGlvbikpIHtcbiAgICAgICAgICAgIHRoaXMudGFibGUuY29sdW1uc1tmaWVsZE5hbWVdLnJlc2V0RmlsdGVyKCk7XG4gICAgICAgICAgICB0aGlzLnRhYmxlLm9uUm93RmlsdGVyQ2hhbmdlKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBJZiB2YWx1ZSBpcyBwcmVzZW50LCBjYWxsIHRoZSBmaWx0ZXIuIEVsc2UsIGZvY3VzIG9uIHRoZSBmaWVsZFxuICAgICAgICAgICAgaWYgKGlzRGVmaW5lZCh0aGlzLnRhYmxlLnJvd0ZpbHRlcltmaWVsZE5hbWVdLnZhbHVlKSAmJiB0aGlzLnRhYmxlLnJvd0ZpbHRlcltmaWVsZE5hbWVdLnZhbHVlICE9PSAnJykge1xuICAgICAgICAgICAgICAgIHRoaXMudGFibGUub25Sb3dGaWx0ZXJDaGFuZ2UoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGFibGUuY29sdW1uc1tmaWVsZE5hbWVdLmZpbHRlckluc3RhbmNlLmZvY3VzKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBNZXRob2QgdG8gZ2V0IHRoZSB1cGRhdGVkIHZhbHVlcyB3aGVuIGZpbHRlciBvbiBmaWVsZCBpcyBjaGFuZ2VkIGZvciBtdWx0aWNvbHVtbiBmaWx0ZXJcbiAgICBwcml2YXRlIGdldEZpbHRlck9uRmllbGRWYWx1ZXMoZmlsdGVyRGVmKSB7XG4gICAgICAgIGlmICghdGhpcy50YWJsZS5kYXRhc291cmNlIHx8ICF0aGlzLnRhYmxlLmRhdGFzb3VyY2UuZXhlY3V0ZShEYXRhU291cmNlLk9wZXJhdGlvbi5TVVBQT1JUU19ESVNUSU5DVF9BUEkpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBmaWVsZE5hbWUgPSBmaWx0ZXJEZWYuZmllbGQ7XG4gICAgICAgIGNvbnN0IGZvcm1GaWVsZHMgPSB0aGlzLnRhYmxlLmZ1bGxGaWVsZERlZnM7XG4gICAgICAgIGNvbnN0IGZpbHRlck9uRmllbGRzID0gXy5maWx0ZXIoZm9ybUZpZWxkcywgeydmaWx0ZXJvbmZpbHRlcic6IGZpZWxkTmFtZX0pO1xuICAgICAgICBjb25zdCBuZXdWYWwgPSBfLmdldCh0aGlzLnRhYmxlLnJvd0ZpbHRlciwgW2ZpZWxkTmFtZSwgJ3ZhbHVlJ10pO1xuXG4gICAgICAgIC8vIExvb3Agb3ZlciB0aGUgZmllbGRzIGZvciB3aGljaCB0aGUgY3VycmVudCBmaWVsZCBpcyBmaWx0ZXIgb24gZmllbGRcbiAgICAgICAgXy5mb3JFYWNoKGZpbHRlck9uRmllbGRzLCBmaWx0ZXJGaWVsZCA9PiB7XG4gICAgICAgICAgICBjb25zdCBmaWx0ZXJPbiA9IGZpbHRlckZpZWxkLmZpbHRlcm9uZmlsdGVyO1xuICAgICAgICAgICAgY29uc3QgZmlsdGVyS2V5ID0gZmlsdGVyRmllbGQuZmllbGQ7XG4gICAgICAgICAgICBjb25zdCBmaWx0ZXJGaWVsZHMgPSB7fTtcbiAgICAgICAgICAgIGNvbnN0IGZpbHRlcldpZGdldCA9IGZpbHRlckZpZWxkLmZpbHRlcndpZGdldDtcblxuICAgICAgICAgICAgaWYgKCFpc0RhdGFTZXRXaWRnZXQoZmlsdGVyV2lkZ2V0KSB8fCBmaWx0ZXJPbiA9PT0gZmlsdGVyS2V5IHx8IGZpbHRlckZpZWxkLmlzRmlsdGVyRGF0YVNldEJvdW5kKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmaWx0ZXJGaWVsZHNbZmlsdGVyT25dID0gKGlzRGVmaW5lZChuZXdWYWwpICYmIG5ld1ZhbCAhPT0gJycgJiYgbmV3VmFsICE9PSBudWxsKSA/IHsndmFsdWUnIDogbmV3VmFsfSA6IHt9O1xuXG4gICAgICAgICAgICBpZiAoZmlsdGVyV2lkZ2V0ID09PSBGb3JtV2lkZ2V0VHlwZS5BVVRPQ09NUExFVEUgJiYgZmlsdGVyRmllbGQuZmlsdGVySW5zdGFuY2UuZGF0YW9wdGlvbnMpIHtcbiAgICAgICAgICAgICAgICBmaWx0ZXJGaWVsZC5maWx0ZXJJbnN0YW5jZS5kYXRhb3B0aW9ucy5maWx0ZXJGaWVsZHMgPSBmaWx0ZXJGaWVsZHM7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMudGFibGUuZGF0YXNvdXJjZS5leGVjdXRlKERhdGFTb3VyY2UuT3BlcmF0aW9uLkdFVF9ESVNUSU5DVF9EQVRBX0JZX0ZJRUxEUywge1xuICAgICAgICAgICAgICAgICAgICAnZmllbGRzJyAgICAgICAgIDogZmlsdGVyS2V5LFxuICAgICAgICAgICAgICAgICAgICAnZmlsdGVyRmllbGRzJyAgIDogZmlsdGVyRmllbGRzXG4gICAgICAgICAgICAgICAgfSkudGhlbihkYXRhID0+IHtcbiAgICAgICAgICAgICAgICAgICAgZmlsdGVyRmllbGQuZmlsdGVyZGF0YXNldCA9IGRhdGEuZGF0YTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gVGhpcyBtZXRob2QgaXMgdHJpZ2dlcmVkIG9uIHZhbHVlIGNoYW5nZSBpbiBtdWx0aSBjb2x1bW4gZmlsdGVyXG4gICAgb25Sb3dGaWx0ZXJDaGFuZ2UoZmllbGROYW1lKSB7XG4gICAgICAgIGNvbnN0IHNlYXJjaE9iaiA9IFtdO1xuICAgICAgICBjb25zdCBmaWVsZCA9IF8uZmluZCh0aGlzLnRhYmxlLmZ1bGxGaWVsZERlZnMsIHsnZmllbGQnOiBmaWVsZE5hbWV9KTtcbiAgICAgICAgLy8gQ29udmVydCByb3cgZmlsdGVycyB0byBhIHNlYXJjaCBvYmplY3QgYW5kIGNhbGwgc2VhcmNoIGhhbmRsZXJcbiAgICAgICAgXy5mb3JFYWNoKHRoaXMudGFibGUucm93RmlsdGVyLCAodmFsdWUsIGtleSkgPT4ge1xuICAgICAgICAgICAgaWYgKChpc0RlZmluZWQodmFsdWUudmFsdWUpICYmIHZhbHVlLnZhbHVlICE9PSAnJykgfHwgXy5pbmNsdWRlcyh0aGlzLnRhYmxlLmVtcHR5TWF0Y2hNb2RlcywgdmFsdWUubWF0Y2hNb2RlKSkge1xuICAgICAgICAgICAgICAgIGlmIChmaWVsZCAmJiBrZXkgPT09IGZpZWxkLmZpZWxkKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlLnR5cGUgICAgICA9IHZhbHVlLnR5cGUgfHwgZmllbGQudHlwZTtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUubWF0Y2hNb2RlID0gdmFsdWUubWF0Y2hNb2RlIHx8IF8uZ2V0KHRoaXMudGFibGUubWF0Y2hNb2RlVHlwZXNNYXBbdmFsdWUudHlwZV0sIDApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzZWFyY2hPYmoucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIGZpZWxkOiBrZXksXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiB2YWx1ZS52YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgbWF0Y2hNb2RlOiB2YWx1ZS5tYXRjaE1vZGUsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IHZhbHVlLnR5cGVcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMudGFibGUuZ3JpZE9wdGlvbnMuc2VhcmNoSGFuZGxlcihzZWFyY2hPYmosIHVuZGVmaW5lZCwgJ3NlYXJjaCcpO1xuXG4gICAgICAgIC8vIElmIGZpZWxkIGlzIHBhc3NlZCwgdXBkYXRlIGFueSBmaWx0ZXIgb24gZmllbGQgdmFsdWVzIGlmIHByZXNlbnRcbiAgICAgICAgaWYgKGZpZWxkKSB7XG4gICAgICAgICAgICB0aGlzLmdldEZpbHRlck9uRmllbGRWYWx1ZXMoZmllbGQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVmcmVzaERhdGEoaXNTYW1lUGFnZSkge1xuICAgICAgICBpZiAoIXRoaXMudGFibGUuZGF0YXNvdXJjZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHBhZ2UgPSBpc1NhbWVQYWdlID8gdGhpcy50YWJsZS5kYXRhTmF2aWdhdG9yLmRuLmN1cnJlbnRQYWdlIDogMTtcbiAgICAgICAgY29uc3Qgc29ydEluZm8gICAgID0gdGhpcy50YWJsZS5zb3J0SW5mbztcbiAgICAgICAgY29uc3Qgc29ydE9wdGlvbnMgID0gc29ydEluZm8gJiYgc29ydEluZm8uZGlyZWN0aW9uID8gKHNvcnRJbmZvLmZpZWxkICsgJyAnICsgc29ydEluZm8uZGlyZWN0aW9uKSA6ICcnO1xuICAgICAgICBjb25zdCBmaWx0ZXJGaWVsZHMgPSB0aGlzLmdldEZpbHRlckZpZWxkcyh0aGlzLnRhYmxlLmZpbHRlckluZm8pO1xuICAgICAgICByZWZyZXNoRGF0YVNvdXJjZSh0aGlzLnRhYmxlLmRhdGFzb3VyY2UsIHtcbiAgICAgICAgICAgIHBhZ2U6IHBhZ2UsXG4gICAgICAgICAgICBmaWx0ZXJGaWVsZHMgOiBmaWx0ZXJGaWVsZHMsXG4gICAgICAgICAgICBvcmRlckJ5IDogc29ydE9wdGlvbnNcbiAgICAgICAgfSk7XG4gICAgfVxufVxuIl19