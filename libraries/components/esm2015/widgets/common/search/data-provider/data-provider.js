import { DataSource } from '@wm/core';
import { LocalDataProvider } from './local-data-provider';
import { RemoteDataProvider } from './remote-data-provider';
export class DataProvider {
    filter(config) {
        let promise;
        /**
         * Make call to remoteDataProvider when searchkey is available and data is not from local / model variable.
         * Otherwise use localDataProvider
         * If datasource is a serviceVariable with no input params, then perform local search.
         * when there is no dataset on the datasource when first time make a remote call to set the dataset for service variable.
         */
        const hasNoVariableDataset = config.datasource && config.datasource.execute(DataSource.Operation.IS_UPDATE_REQUIRED, config.hasData);
        if (!config.isLocalFilter && (config.dataoptions || ((config.datasource && config.datasource.execute(DataSource.Operation.IS_API_AWARE))
            && config.searchKey
            && hasNoVariableDataset))) {
            promise = DataProvider.remoteDataProvider.filter(config);
        }
        else {
            promise = DataProvider.localDataProvider.filter(config);
        }
        return promise.then(response => {
            this.updateDataset = config.datasource && !config.datasource.execute(DataSource.Operation.SUPPORTS_CRUD) && hasNoVariableDataset;
            this.hasMoreData = response.hasMoreData;
            this.isLastPage = response.isLastPage;
            this.page = response.page;
            this.isPaginatedData = response.isPaginatedData;
            return response;
        });
    }
}
DataProvider.remoteDataProvider = new RemoteDataProvider();
DataProvider.localDataProvider = new LocalDataProvider();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YS1wcm92aWRlci5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vc2VhcmNoL2RhdGEtcHJvdmlkZXIvZGF0YS1wcm92aWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRXRDLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBQzFELE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBcUM1RCxNQUFNLE9BQU8sWUFBWTtJQVdkLE1BQU0sQ0FBQyxNQUEyQjtRQUVyQyxJQUFJLE9BQXFCLENBQUM7UUFFMUI7Ozs7O1dBS0c7UUFDSCxNQUFNLG9CQUFvQixHQUFHLE1BQU0sQ0FBQyxVQUFVLElBQUksTUFBTSxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxrQkFBa0IsRUFBRSxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDckksSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsVUFBVSxJQUFJLE1BQU0sQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDLENBQUM7ZUFDakksTUFBTSxDQUFDLFNBQVM7ZUFDaEIsb0JBQW9CLENBQUMsQ0FBQyxFQUFFO1lBQzNCLE9BQU8sR0FBRyxZQUFZLENBQUMsa0JBQWtCLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQzVEO2FBQU07WUFDSCxPQUFPLEdBQUcsWUFBWSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUMzRDtRQUVELE9BQU8sT0FBTyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRTtZQUMzQixJQUFJLENBQUMsYUFBYSxHQUFHLE1BQU0sQ0FBQyxVQUFVLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxJQUFJLG9CQUFvQixDQUFDO1lBQ2pJLElBQUksQ0FBQyxXQUFXLEdBQUcsUUFBUSxDQUFDLFdBQVcsQ0FBQztZQUN4QyxJQUFJLENBQUMsVUFBVSxHQUFHLFFBQVEsQ0FBQyxVQUFVLENBQUM7WUFDdEMsSUFBSSxDQUFDLElBQUksR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDO1lBQzFCLElBQUksQ0FBQyxlQUFlLEdBQUcsUUFBUSxDQUFDLGVBQWUsQ0FBQztZQUVoRCxPQUFPLFFBQVEsQ0FBQztRQUNwQixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7O0FBL0JNLCtCQUFrQixHQUFHLElBQUksa0JBQWtCLEVBQUUsQ0FBQztBQUM5Qyw4QkFBaUIsR0FBRyxJQUFJLGlCQUFpQixFQUFFLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEYXRhU291cmNlIH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5pbXBvcnQgeyBMb2NhbERhdGFQcm92aWRlciB9IGZyb20gJy4vbG9jYWwtZGF0YS1wcm92aWRlcic7XG5pbXBvcnQgeyBSZW1vdGVEYXRhUHJvdmlkZXIgfSBmcm9tICcuL3JlbW90ZS1kYXRhLXByb3ZpZGVyJztcblxuZGVjbGFyZSBjb25zdCBfO1xuXG5leHBvcnQgaW50ZXJmYWNlIElEYXRhUHJvdmlkZXJDb25maWcge1xuICAgIGRhdGFvcHRpb25zPzogYW55O1xuICAgIHZpZXdQYXJlbnQ/OiBhbnk7XG4gICAgZGF0YXNldDogYW55O1xuICAgIGRhdGFmaWVsZDogc3RyaW5nO1xuICAgIGJpbmRkYXRhc2V0Pzogc3RyaW5nO1xuICAgIGRhdGFzb3VyY2U/OiBhbnk7XG4gICAgaGFzRGF0YTogYm9vbGVhbjtcbiAgICBxdWVyeTogQXJyYXk8c3RyaW5nPiB8IHN0cmluZztcbiAgICBpc0xvY2FsRmlsdGVyOiBib29sZWFuO1xuICAgIHNlYXJjaEtleT86IHN0cmluZztcbiAgICBtYXRjaE1vZGU/OiBzdHJpbmc7XG4gICAgY2FzZXNlbnNpdGl2ZT86IGJvb2xlYW47XG4gICAgaXNmb3JtZmllbGQ/OiBib29sZWFuO1xuICAgIG9yZGVyYnk/OiBzdHJpbmc7XG4gICAgbGltaXQ/OiBudW1iZXI7XG4gICAgcGFnZXNpemU/OiBudW1iZXI7XG4gICAgcGFnZTogbnVtYmVyO1xuICAgIG5vTW9yZWRhdGE/OiBib29sZWFuO1xuICAgIG9uQmVmb3Jlc2VydmljZWNhbGw/OiBGdW5jdGlvbjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJRGF0YVByb3ZpZGVyIHtcbiAgICBoYXNNb3JlRGF0YT86IGJvb2xlYW47XG4gICAgaXNMYXN0UGFnZT86IGJvb2xlYW47XG4gICAgaGFzTm9Nb3JlRGF0YT86IGJvb2xlYW47XG4gICAgaXNQYWdpbmF0ZWREYXRhPzogYm9vbGVhbjtcbiAgICBwYWdlPzogbnVtYmVyO1xuICAgIHVwZGF0ZURhdGFzZXQ/OiBib29sZWFuO1xuXG4gICAgZmlsdGVyKGNvbmZpZzogSURhdGFQcm92aWRlckNvbmZpZyk6IFByb21pc2U8YW55Pjtcbn1cblxuZXhwb3J0IGNsYXNzIERhdGFQcm92aWRlciBpbXBsZW1lbnRzIElEYXRhUHJvdmlkZXIge1xuXG4gICAgcHVibGljIGhhc01vcmVEYXRhOiBib29sZWFuO1xuICAgIHB1YmxpYyBpc0xhc3RQYWdlOiBib29sZWFuO1xuICAgIHB1YmxpYyBwYWdlOiBudW1iZXI7XG4gICAgcHVibGljIGlzUGFnaW5hdGVkRGF0YTogYm9vbGVhbjtcbiAgICBwdWJsaWMgdXBkYXRlRGF0YXNldDogYm9vbGVhbjtcblxuICAgIHN0YXRpYyByZW1vdGVEYXRhUHJvdmlkZXIgPSBuZXcgUmVtb3RlRGF0YVByb3ZpZGVyKCk7XG4gICAgc3RhdGljIGxvY2FsRGF0YVByb3ZpZGVyID0gbmV3IExvY2FsRGF0YVByb3ZpZGVyKCk7XG5cbiAgICBwdWJsaWMgZmlsdGVyKGNvbmZpZzogSURhdGFQcm92aWRlckNvbmZpZyk6IFByb21pc2U8YW55PiB7XG5cbiAgICAgICAgbGV0IHByb21pc2U6IFByb21pc2U8YW55PjtcblxuICAgICAgICAvKipcbiAgICAgICAgICogTWFrZSBjYWxsIHRvIHJlbW90ZURhdGFQcm92aWRlciB3aGVuIHNlYXJjaGtleSBpcyBhdmFpbGFibGUgYW5kIGRhdGEgaXMgbm90IGZyb20gbG9jYWwgLyBtb2RlbCB2YXJpYWJsZS5cbiAgICAgICAgICogT3RoZXJ3aXNlIHVzZSBsb2NhbERhdGFQcm92aWRlclxuICAgICAgICAgKiBJZiBkYXRhc291cmNlIGlzIGEgc2VydmljZVZhcmlhYmxlIHdpdGggbm8gaW5wdXQgcGFyYW1zLCB0aGVuIHBlcmZvcm0gbG9jYWwgc2VhcmNoLlxuICAgICAgICAgKiB3aGVuIHRoZXJlIGlzIG5vIGRhdGFzZXQgb24gdGhlIGRhdGFzb3VyY2Ugd2hlbiBmaXJzdCB0aW1lIG1ha2UgYSByZW1vdGUgY2FsbCB0byBzZXQgdGhlIGRhdGFzZXQgZm9yIHNlcnZpY2UgdmFyaWFibGUuXG4gICAgICAgICAqL1xuICAgICAgICBjb25zdCBoYXNOb1ZhcmlhYmxlRGF0YXNldCA9IGNvbmZpZy5kYXRhc291cmNlICYmIGNvbmZpZy5kYXRhc291cmNlLmV4ZWN1dGUoRGF0YVNvdXJjZS5PcGVyYXRpb24uSVNfVVBEQVRFX1JFUVVJUkVELCBjb25maWcuaGFzRGF0YSk7XG4gICAgICAgIGlmICghY29uZmlnLmlzTG9jYWxGaWx0ZXIgJiYgKGNvbmZpZy5kYXRhb3B0aW9ucyB8fCAoKGNvbmZpZy5kYXRhc291cmNlICYmIGNvbmZpZy5kYXRhc291cmNlLmV4ZWN1dGUoRGF0YVNvdXJjZS5PcGVyYXRpb24uSVNfQVBJX0FXQVJFKSlcbiAgICAgICAgICAgICYmIGNvbmZpZy5zZWFyY2hLZXlcbiAgICAgICAgICAgICYmIGhhc05vVmFyaWFibGVEYXRhc2V0KSkpIHtcbiAgICAgICAgICAgIHByb21pc2UgPSBEYXRhUHJvdmlkZXIucmVtb3RlRGF0YVByb3ZpZGVyLmZpbHRlcihjb25maWcpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcHJvbWlzZSA9IERhdGFQcm92aWRlci5sb2NhbERhdGFQcm92aWRlci5maWx0ZXIoY29uZmlnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwcm9taXNlLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgdGhpcy51cGRhdGVEYXRhc2V0ID0gY29uZmlnLmRhdGFzb3VyY2UgJiYgIWNvbmZpZy5kYXRhc291cmNlLmV4ZWN1dGUoRGF0YVNvdXJjZS5PcGVyYXRpb24uU1VQUE9SVFNfQ1JVRCkgJiYgaGFzTm9WYXJpYWJsZURhdGFzZXQ7XG4gICAgICAgICAgICB0aGlzLmhhc01vcmVEYXRhID0gcmVzcG9uc2UuaGFzTW9yZURhdGE7XG4gICAgICAgICAgICB0aGlzLmlzTGFzdFBhZ2UgPSByZXNwb25zZS5pc0xhc3RQYWdlO1xuICAgICAgICAgICAgdGhpcy5wYWdlID0gcmVzcG9uc2UucGFnZTtcbiAgICAgICAgICAgIHRoaXMuaXNQYWdpbmF0ZWREYXRhID0gcmVzcG9uc2UuaXNQYWdpbmF0ZWREYXRhO1xuXG4gICAgICAgICAgICByZXR1cm4gcmVzcG9uc2U7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiJdfQ==