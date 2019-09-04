import { IDataProvider, IDataProviderConfig } from './data-provider';
export declare class RemoteDataProvider implements IDataProvider {
    filter(config: IDataProviderConfig): Promise<any>;
    private filterData;
    protected isLast(page: number, dataSize: number, maxResults: number, currentResults?: number): boolean;
    protected getTransformedData(variable: any, data: any): any;
    protected onFilterFailure(): any[];
    private isLastPageForDistinctApi;
    protected onFilterSuccess(config: IDataProviderConfig, response: any): Promise<any>;
}
