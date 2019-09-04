import { IDataProvider, IDataProviderConfig } from './data-provider';
export declare class LocalDataProvider implements IDataProvider {
    filter(config: IDataProviderConfig): Promise<any>;
}
