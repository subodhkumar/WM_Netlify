export declare class TableFilterSortDirective {
    private table;
    constructor(table: any);
    getNavigationTargetBySortInfo(): "last" | "first";
    getFilterFields(searchObj: any): {};
    resetSortStatus(variableSort: any): void;
    clearFilter(skipFilter: any): void;
    checkFiltersApplied(variableSort: any): void;
    getSearchResult(data: any, searchObj: any): any;
    getSortResult(data: any, sortObj: any): any;
    private handleClientSideSortSearch;
    private handleSinglePageSearch;
    private handleServerSideSearch;
    private handleSeverSideSort;
    private searchHandler;
    private sortHandler;
    searchSortHandler(searchSortObj: any, e: any, type: any): void;
    showClearIcon(fieldName: any): boolean;
    clearRowFilter(fieldName: any): void;
    onFilterConditionSelect(fieldName: any, condition: any): void;
    private getFilterOnFieldValues;
    onRowFilterChange(fieldName: any): void;
    refreshData(isSamePage: any): void;
}
