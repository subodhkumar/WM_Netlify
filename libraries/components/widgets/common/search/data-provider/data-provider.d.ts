import { LocalDataProvider } from './local-data-provider';
import { RemoteDataProvider } from './remote-data-provider';
export interface IDataProviderConfig {
    dataoptions?: any;
    viewParent?: any;
    dataset: any;
    datafield: string;
    binddataset?: string;
    datasource?: any;
    hasData: boolean;
    query: Array<string> | string;
    isLocalFilter: boolean;
    searchKey?: string;
    matchMode?: string;
    casesensitive?: boolean;
    isformfield?: boolean;
    orderby?: string;
    limit?: number;
    pagesize?: number;
    page: number;
    noMoredata?: boolean;
    onBeforeservicecall?: Function;
}
export interface IDataProvider {
    hasMoreData?: boolean;
    isLastPage?: boolean;
    hasNoMoreData?: boolean;
    isPaginatedData?: boolean;
    page?: number;
    updateDataset?: boolean;
    filter(config: IDataProviderConfig): Promise<any>;
}
export declare class DataProvider implements IDataProvider {
    hasMoreData: boolean;
    isLastPage: boolean;
    page: number;
    isPaginatedData: boolean;
    updateDataset: boolean;
    static remoteDataProvider: RemoteDataProvider;
    static localDataProvider: LocalDataProvider;
    filter(config: IDataProviderConfig): Promise<any>;
}
