export declare const parseConfig: (serviceParams: any) => any;
export declare const generateConnectionParams: (params: any, action: any) => any;
export declare const LVService: {
    searchTableDataWithQuery: (params: any, successCallback: any, failureCallback: any) => any;
    executeAggregateQuery: (params: any, successCallback: any, failureCallback: any) => any;
    searchTableData: (params: any, successCallback: any, failureCallback: any) => any;
    readTableData: (params: any, successCallback: any, failureCallback: any) => any;
    insertTableData: (params: any, successCallback: any, failureCallback: any) => any;
    insertMultiPartTableData: (params: any, successCallback: any, failureCallback: any) => any;
    updateTableData: (params: any, successCallback: any, failureCallback: any) => any;
    updateCompositeTableData: (params: any, successCallback: any, failureCallback: any) => any;
    periodUpdateCompositeTableData: (params: any, successCallback: any, failureCallback: any) => any;
    updateMultiPartTableData: (params: any, successCallback: any, failureCallback: any) => any;
    updateMultiPartCompositeTableData: (params: any, successCallback: any, failureCallback: any) => any;
    deleteTableData: (params: any, successCallback: any, failureCallback: any) => any;
    deleteCompositeTableData: (params: any, successCallback: any, failureCallback: any) => any;
    periodDeleteCompositeTableData: (params: any, successCallback: any, failureCallback: any) => any;
    exportTableData: (params: any) => any;
    getDistinctDataByFields: (params: any) => any;
    countTableDataWithQuery: (params: any, successCallback: any, failureCallback: any) => any;
};
