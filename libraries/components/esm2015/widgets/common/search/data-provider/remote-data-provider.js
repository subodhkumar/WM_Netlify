import { AppConstants, DataSource, findValueOf, getClonedObject } from '@wm/core';
import { interpolateBindExpressions } from '../../../../utils/data-utils';
export class RemoteDataProvider {
    filter(config) {
        return this.filterData(config).then(response => this.onFilterSuccess(config, response), () => this.onFilterFailure());
    }
    filterData(config) {
        if (config.dataoptions) {
            const dataoptions = config.dataoptions;
            const requestParams = config.datasource.execute(DataSource.Operation.GET_REQUEST_PARAMS, config);
            // If options are specified, make specifics calls to fetch the results
            // Fetch the related field data
            if (dataoptions.relatedField) {
                return new Promise((resolve, reject) => {
                    interpolateBindExpressions(config.viewParent, dataoptions.filterExpr, (filterexpressions) => {
                        requestParams.filterExpr = dataoptions.filterExpr = filterexpressions;
                        dataoptions.filterExpr = filterexpressions;
                        config.datasource.execute(DataSource.Operation.GET_RELATED_TABLE_DATA, _.assign({ relatedField: dataoptions.relatedField }, requestParams)).then(resolve, reject);
                    });
                });
            }
            // Fetch the distinct data
            if (dataoptions.distinctField) {
                return config.datasource.execute(DataSource.Operation.GET_DISTINCT_DATA_BY_FIELDS, {
                    pagesize: config.limit || config.pagesize,
                    page: config.page,
                    fields: dataoptions.distinctField,
                    entityName: dataoptions.tableName,
                    filterFields: _.assign(dataoptions.filterFields, requestParams.filterFields),
                    filterExpr: getClonedObject(dataoptions.filterExpr || {})
                });
            }
        }
        // search records using the searchkey
        return config.datasource.execute(DataSource.Operation.SEARCH_RECORDS, config);
    }
    // Check if the page retrieved currently is the last page. If last page, don't send any more request
    isLast(page, dataSize, maxResults, currentResults) {
        // if last page info is not returned by backend and current results is less than max results, this is the last page
        if (dataSize === AppConstants.INT_MAX_VALUE) {
            return currentResults !== 0 && currentResults < maxResults;
        }
        const pageCount = ((dataSize > maxResults) ? (Math.ceil(dataSize / maxResults)) : (dataSize < 0 ? 0 : 1));
        return page === pageCount;
    }
    // this function transform the response data in case it is not an array
    getTransformedData(variable, data) {
        const operationResult = variable.operation + 'Result'; // when output is only string it is available as oprationNameResult
        const tempResponse = data[operationResult];
        // in case data received is value as string then add that string value to object and convert object into array
        if (tempResponse) {
            const tempObj = {};
            _.set(tempObj, operationResult, tempResponse);
            data = [tempObj]; // convert data into an array having tempObj
        }
        else {
            // in case data received is already an object then convert it into an array
            data = [data];
        }
        return data;
    }
    onFilterFailure() {
        return [];
    }
    isLastPageForDistinctApi(data, page, totalElements, _isLastPage) {
        return page > 1 && !_isLastPage && _.isEmpty(data) && totalElements === AppConstants.INT_MAX_VALUE;
    }
    // this function processes the response depending on pageOptions, isPageable and prepares the formattedDataset.
    onFilterSuccess(config, response) {
        let data = response.data;
        let formattedData;
        let _isLastPage;
        let page;
        let isPaginatedData;
        const expressionArray = _.split(config.binddataset, '.');
        const dataExpression = _.slice(expressionArray, _.indexOf(expressionArray, 'dataSet') + 1).join('.');
        const $I = '[$i]';
        return new Promise((resolve, reject) => {
            const pageOptions = response.pagination;
            if (config.datasource.execute(DataSource.Operation.IS_PAGEABLE)) {
                page = pageOptions.number + 1;
                _isLastPage = this.isLast(page, (config.limit > 0 && config.limit) || pageOptions.totalElements, pageOptions.size, pageOptions.numberOfElements);
                isPaginatedData = true;
                if (this.isLastPageForDistinctApi(data, page, pageOptions.totalElements, _isLastPage)) {
                    _isLastPage = true;
                    resolve({
                        data: [],
                        isLastPage: _isLastPage,
                        hasMoreData: page > 1,
                        isPaginatedData,
                        page
                    });
                    return;
                }
            }
            // if data expression exists, extract the data from the expression path
            if (dataExpression) {
                const index = dataExpression.lastIndexOf($I);
                const restExpr = dataExpression.substr(index + 5);
                if (_.isArray(data)) {
                    formattedData = data.map(datum => findValueOf(datum, restExpr));
                }
                else if (_.isObject(data)) {
                    formattedData = _.get(data, dataExpression);
                }
                data = formattedData || data;
            }
            if (!_.isArray(data)) {
                data = this.getTransformedData(config.datasource, data);
            }
            // in case of no data received, resolve the promise with empty array
            if (!data.length) {
                resolve({ data: [], isLastPage: _isLastPage, hasMoreData: page > 1, isPaginatedData, page });
            }
            else {
                resolve({ data: data, isLastPage: _isLastPage, hasMoreData: page > 1, isPaginatedData, page });
            }
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3RlLWRhdGEtcHJvdmlkZXIuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL3NlYXJjaC9kYXRhLXByb3ZpZGVyL3JlbW90ZS1kYXRhLXByb3ZpZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxZQUFZLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxlQUFlLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFJbEYsT0FBTyxFQUFFLDBCQUEwQixFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFJMUUsTUFBTSxPQUFPLGtCQUFrQjtJQUNwQixNQUFNLENBQUMsTUFBMkI7UUFDckMsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQyxDQUFDO0lBQzFILENBQUM7SUFFTyxVQUFVLENBQUMsTUFBTTtRQUNyQixJQUFJLE1BQU0sQ0FBQyxXQUFXLEVBQUU7WUFDcEIsTUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLFdBQVcsQ0FBQztZQUV2QyxNQUFNLGFBQWEsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLGtCQUFrQixFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBRWpHLHNFQUFzRTtZQUN0RSwrQkFBK0I7WUFDL0IsSUFBSSxXQUFXLENBQUMsWUFBWSxFQUFFO2dCQUMxQixPQUFPLElBQUksT0FBTyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxFQUFFO29CQUNuQywwQkFBMEIsQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFLFdBQVcsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxpQkFBaUIsRUFBRSxFQUFF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VUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO2FBQzNEO1lBQ0Qsb0VBQW9FO1lBQ3BFLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUNkLE9BQU8sQ0FBQyxFQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsSUFBSSxHQUFHLENBQUMsRUFBRSxlQUFlLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQzthQUM5RjtpQkFBTTtnQkFDSCxPQUFPLENBQUMsRUFBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLElBQUksR0FBRyxDQUFDLEVBQUUsZUFBZSxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7YUFDaEc7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7Q0FDSiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFwcENvbnN0YW50cywgRGF0YVNvdXJjZSwgZmluZFZhbHVlT2YsIGdldENsb25lZE9iamVjdCB9IGZyb20gJ0B3bS9jb3JlJztcblxuaW1wb3J0IHsgY29udmVydERhdGFUb09iamVjdCB9IGZyb20gJy4uLy4uLy4uLy4uL3V0aWxzL2Zvcm0tdXRpbHMnO1xuaW1wb3J0IHsgSURhdGFQcm92aWRlciwgSURhdGFQcm92aWRlckNvbmZpZyB9IGZyb20gJy4vZGF0YS1wcm92aWRlcic7XG5pbXBvcnQgeyBpbnRlcnBvbGF0ZUJpbmRFeHByZXNzaW9ucyB9IGZyb20gJy4uLy4uLy4uLy4uL3V0aWxzL2RhdGEtdXRpbHMnO1xuXG5kZWNsYXJlIGNvbnN0IF87XG5cbmV4cG9ydCBjbGFzcyBSZW1vdGVEYXRhUHJvdmlkZXIgaW1wbGVtZW50cyBJRGF0YVByb3ZpZGVyIHtcbiAgICBwdWJsaWMgZmlsdGVyKGNvbmZpZzogSURhdGFQcm92aWRlckNvbmZpZyk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIHJldHVybiB0aGlzLmZpbHRlckRhdGEoY29uZmlnKS50aGVuKHJlc3BvbnNlID0+IHRoaXMub25GaWx0ZXJTdWNjZXNzKGNvbmZpZywgcmVzcG9uc2UpLCAoKSA9PiB0aGlzLm9uRmlsdGVyRmFpbHVyZSgpKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGZpbHRlckRhdGEoY29uZmlnKSB7XG4gICAgICAgIGlmIChjb25maWcuZGF0YW9wdGlvbnMpIHtcbiAgICAgICAgICAgIGNvbnN0IGRhdGFvcHRpb25zID0gY29uZmlnLmRhdGFvcHRpb25zO1xuXG4gICAgICAgICAgICBjb25zdCByZXF1ZXN0UGFyYW1zID0gY29uZmlnLmRhdGFzb3VyY2UuZXhlY3V0ZShEYXRhU291cmNlLk9wZXJhdGlvbi5HRVRfUkVRVUVTVF9QQVJBTVMsIGNvbmZpZyk7XG5cbiAgICAgICAgICAgIC8vIElmIG9wdGlvbnMgYXJlIHNwZWNpZmllZCwgbWFrZSBzcGVjaWZpY3MgY2FsbHMgdG8gZmV0Y2ggdGhlIHJlc3VsdHNcbiAgICAgICAgICAgIC8vIEZldGNoIHRoZSByZWxhdGVkIGZpZWxkIGRhdGFcbiAgICAgICAgICAgIGlmIChkYXRhb3B0aW9ucy5yZWxhdGVkRmllbGQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpbnRlcnBvbGF0ZUJpbmRFeHByZXNzaW9ucyhjb25maWcudmlld1BhcmVudCwgZGF0YW9wdGlvbnMuZmlsdGVyRXhwciwgKGZpbHRlcmV4cHJlc3Npb25zKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXF1ZXN0UGFyYW1zLmZpbHRlckV4cHIgPSBkYXRhb3B0aW9ucy5maWx0ZXJFeHByID0gZmlsdGVyZXhwcmVzc2lvbnM7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhb3B0aW9ucy5maWx0ZXJFeHByID0gZmlsdGVyZXhwcmVzc2lvbnM7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbmZpZy5kYXRhc291cmNlLmV4ZWN1dGUoXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgRGF0YVNvdXJjZS5PcGVyYXRpb24uR0VUX1JFTEFURURfVEFCTEVfREFUQSwgXy5hc3NpZ24oe3JlbGF0ZWRGaWVsZDogZGF0YW9wdGlvbnMucmVsYXRlZEZpZWxkfSwgcmVxdWVzdFBhcmFtcylcbiAgICAgICAgICAgICAgICAgICAgICAgICkudGhlbihyZXNvbHZlLCByZWplY3QpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIEZldGNoIHRoZSBkaXN0aW5jdCBkYXRhXG4gICAgICAgICAgICBpZiAoZGF0YW9wdGlvbnMuZGlzdGluY3RGaWVsZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjb25maWcuZGF0YXNvdXJjZS5leGVjdXRlKFxuICAgICAgICAgICAgICAgICAgICBEYXRhU291cmNlLk9wZXJhdGlvbi5HRVRfRElTVElOQ1RfREFUQV9CWV9GSUVMRFMsXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhZ2VzaXplOiBjb25maWcubGltaXQgfHwgY29uZmlnLnBhZ2VzaXplLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFnZTogY29uZmlnLnBhZ2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWVsZHM6IGRhdGFvcHRpb25zLmRpc3RpbmN0RmllbGQsXG4gICAgICAgICAgICAgICAgICAgICAgICBlbnRpdHlOYW1lOiBkYXRhb3B0aW9ucy50YWJsZU5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXJGaWVsZHM6IF8uYXNzaWduKGRhdGFvcHRpb25zLmZpbHRlckZpZWxkcywgcmVxdWVzdFBhcmFtcy5maWx0ZXJGaWVsZHMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyRXhwcjogZ2V0Q2xvbmVkT2JqZWN0KGRhdGFvcHRpb25zLmZpbHRlckV4cHIgfHwge30pXG5cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBzZWFyY2ggcmVjb3JkcyB1c2luZyB0aGUgc2VhcmNoa2V5XG4gICAgICAgIHJldHVybiBjb25maWcuZGF0YXNvdXJjZS5leGVjdXRlKFxuICAgICAgICAgICAgRGF0YVNvdXJjZS5PcGVyYXRpb24uU0VBUkNIX1JFQ09SRFMsIGNvbmZpZ1xuICAgICAgICApO1xuICAgIH1cblxuXG4gICAgLy8gQ2hlY2sgaWYgdGhlIHBhZ2UgcmV0cmlldmVkIGN1cnJlbnRseSBpcyB0aGUgbGFzdCBwYWdlLiBJZiBsYXN0IHBhZ2UsIGRvbid0IHNlbmQgYW55IG1vcmUgcmVxdWVzdFxuICAgIHByb3RlY3RlZCBpc0xhc3QocGFnZTogbnVtYmVyLCBkYXRhU2l6ZTogbnVtYmVyLCBtYXhSZXN1bHRzOiBudW1iZXIsIGN1cnJlbnRSZXN1bHRzPzogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgICAgIC8vIGlmIGxhc3QgcGFnZSBpbmZvIGlzIG5vdCByZXR1cm5lZCBieSBiYWNrZW5kIGFuZCBjdXJyZW50IHJlc3VsdHMgaXMgbGVzcyB0aGFuIG1heCByZXN1bHRzLCB0aGlzIGlzIHRoZSBsYXN0IHBhZ2VcbiAgICAgICAgaWYgKGRhdGFTaXplID09PSBBcHBDb25zdGFudHMuSU5UX01BWF9WQUxVRSkge1xuICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnRSZXN1bHRzICE9PSAwICYmIGN1cnJlbnRSZXN1bHRzIDwgbWF4UmVzdWx0cztcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwYWdlQ291bnQgPSAoKGRhdGFTaXplID4gbWF4UmVzdWx0cykgPyAoTWF0aC5jZWlsKGRhdGFTaXplIC8gbWF4UmVzdWx0cykpIDogKGRhdGFTaXplIDwgMCA/IDAgOiAxKSk7XG4gICAgICAgIHJldHVybiBwYWdlID09PSBwYWdlQ291bnQ7XG4gICAgfVxuXG4gICAgLy8gdGhpcyBmdW5jdGlvbiB0cmFuc2Zvcm0gdGhlIHJlc3BvbnNlIGRhdGEgaW4gY2FzZSBpdCBpcyBub3QgYW4gYXJyYXlcbiAgICBwcm90ZWN0ZWQgZ2V0VHJhbnNmb3JtZWREYXRhKHZhcmlhYmxlOiBhbnksIGRhdGE6IGFueSk6IGFueSB7XG4gICAgICAgIGNvbnN0IG9wZXJhdGlvblJlc3VsdCA9IHZhcmlhYmxlLm9wZXJhdGlvbiArICdSZXN1bHQnOyAvLyB3aGVuIG91dHB1dCBpcyBvbmx5IHN0cmluZyBpdCBpcyBhdmFpbGFibGUgYXMgb3ByYXRpb25OYW1lUmVzdWx0XG4gICAgICAgIGNvbnN0IHRlbXBSZXNwb25zZSA9IGRhdGFbb3BlcmF0aW9uUmVzdWx0XTtcblxuICAgICAgICAvLyBpbiBjYXNlIGRhdGEgcmVjZWl2ZWQgaXMgdmFsdWUgYXMgc3RyaW5nIHRoZW4gYWRkIHRoYXQgc3RyaW5nIHZhbHVlIHRvIG9iamVjdCBhbmQgY29udmVydCBvYmplY3QgaW50byBhcnJheVxuICAgICAgICBpZiAodGVtcFJlc3BvbnNlKSB7XG4gICAgICAgICAgICBjb25zdCB0ZW1wT2JqID0ge307XG4gICAgICAgICAgICBfLnNldCh0ZW1wT2JqLCBvcGVyYXRpb25SZXN1bHQsIHRlbXBSZXNwb25zZSk7XG4gICAgICAgICAgICBkYXRhID0gW3RlbXBPYmpdOyAvLyBjb252ZXJ0IGRhdGEgaW50byBhbiBhcnJheSBoYXZpbmcgdGVtcE9ialxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gaW4gY2FzZSBkYXRhIHJlY2VpdmVkIGlzIGFscmVhZHkgYW4gb2JqZWN0IHRoZW4gY29udmVydCBpdCBpbnRvIGFuIGFycmF5XG4gICAgICAgICAgICBkYXRhID0gW2RhdGFdO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIG9uRmlsdGVyRmFpbHVyZSgpIHtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgIH1cblxuICAgIHByaXZhdGUgaXNMYXN0UGFnZUZvckRpc3RpbmN0QXBpKGRhdGEsIHBhZ2UsIHRvdGFsRWxlbWVudHMsIF9pc0xhc3RQYWdlKSB7XG4gICAgICAgIHJldHVybiBwYWdlID4gMSAmJiAhX2lzTGFzdFBhZ2UgJiYgXy5pc0VtcHR5KGRhdGEpICYmIHRvdGFsRWxlbWVudHMgPT09IEFwcENvbnN0YW50cy5JTlRfTUFYX1ZBTFVFO1xuICAgIH1cblxuXG4gICAgLy8gdGhpcyBmdW5jdGlvbiBwcm9jZXNzZXMgdGhlIHJlc3BvbnNlIGRlcGVuZGluZyBvbiBwYWdlT3B0aW9ucywgaXNQYWdlYWJsZSBhbmQgcHJlcGFyZXMgdGhlIGZvcm1hdHRlZERhdGFzZXQuXG4gICAgcHJvdGVjdGVkIG9uRmlsdGVyU3VjY2Vzcyhjb25maWc6IElEYXRhUHJvdmlkZXJDb25maWcsIHJlc3BvbnNlKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgbGV0IGRhdGE6IGFueSA9IHJlc3BvbnNlLmRhdGE7XG4gICAgICAgIGxldCBmb3JtYXR0ZWREYXRhOiBhbnk7XG4gICAgICAgIGxldCBfaXNMYXN0UGFnZTogYm9vbGVhbjtcbiAgICAgICAgbGV0IHBhZ2U6IG51bWJlcjtcbiAgICAgICAgbGV0IGlzUGFnaW5hdGVkRGF0YTogYm9vbGVhbjtcblxuICAgICAgICBjb25zdCBleHByZXNzaW9uQXJyYXkgPSBfLnNwbGl0KGNvbmZpZy5iaW5kZGF0YXNldCwgJy4nKTtcbiAgICAgICAgY29uc3QgZGF0YUV4cHJlc3Npb24gPSBfLnNsaWNlKGV4cHJlc3Npb25BcnJheSwgXy5pbmRleE9mKGV4cHJlc3Npb25BcnJheSwgJ2RhdGFTZXQnKSArIDEpLmpvaW4oJy4nKTtcbiAgICAgICAgY29uc3QgJEkgPSAnWyRpXSc7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHBhZ2VPcHRpb25zID0gcmVzcG9uc2UucGFnaW5hdGlvbjtcblxuICAgICAgICAgICAgaWYgKGNvbmZpZy5kYXRhc291cmNlLmV4ZWN1dGUoRGF0YVNvdXJjZS5PcGVyYXRpb24uSVNfUEFHRUFCTEUpKSB7XG4gICAgICAgICAgICAgICAgcGFnZSA9IHBhZ2VPcHRpb25zLm51bWJlciArIDE7XG4gICAgICAgICAgICAgICAgX2lzTGFzdFBhZ2UgPSB0aGlzLmlzTGFzdChwYWdlLCAoY29uZmlnLmxpbWl0ID4gMCAmJiBjb25maWcubGltaXQpIHx8IHBhZ2VPcHRpb25zLnRvdGFsRWxlbWVudHMsIHBhZ2VPcHRpb25zLnNpemUsIHBhZ2VPcHRpb25zLm51bWJlck9mRWxlbWVudHMpO1xuICAgICAgICAgICAgICAgIGlzUGFnaW5hdGVkRGF0YSA9IHRydWU7XG5cbiAgICAgICAgICAgICAgICBpZiAodGhpcy5pc0xhc3RQYWdlRm9yRGlzdGluY3RBcGkoZGF0YSwgcGFnZSwgcGFnZU9wdGlvbnMudG90YWxFbGVtZW50cywgX2lzTGFzdFBhZ2UpKSB7XG4gICAgICAgICAgICAgICAgICAgIF9pc0xhc3RQYWdlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhOiBbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzTGFzdFBhZ2U6IF9pc0xhc3RQYWdlLFxuICAgICAgICAgICAgICAgICAgICAgICAgaGFzTW9yZURhdGE6IHBhZ2UgPiAxLFxuICAgICAgICAgICAgICAgICAgICAgICAgaXNQYWdpbmF0ZWREYXRhLFxuICAgICAgICAgICAgICAgICAgICAgICAgcGFnZVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGlmIGRhdGEgZXhwcmVzc2lvbiBleGlzdHMsIGV4dHJhY3QgdGhlIGRhdGEgZnJvbSB0aGUgZXhwcmVzc2lvbiBwYXRoXG4gICAgICAgICAgICBpZiAoZGF0YUV4cHJlc3Npb24pIHtcbiAgICAgICAgICAgICAgICBjb25zdCBpbmRleCA9IGRhdGFFeHByZXNzaW9uLmxhc3RJbmRleE9mKCRJKTtcbiAgICAgICAgICAgICAgICBjb25zdCByZXN0RXhwciA9IGRhdGFFeHByZXNzaW9uLnN1YnN0cihpbmRleCArIDUpO1xuXG4gICAgICAgICAgICAgICAgaWYgKF8uaXNBcnJheShkYXRhKSkge1xuICAgICAgICAgICAgICAgICAgICBmb3JtYXR0ZWREYXRhID0gZGF0YS5tYXAoZGF0dW0gPT4gZmluZFZhbHVlT2YoZGF0dW0sIHJlc3RFeHByKSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChfLmlzT2JqZWN0KGRhdGEpKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvcm1hdHRlZERhdGEgPSBfLmdldChkYXRhLCBkYXRhRXhwcmVzc2lvbik7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZGF0YSA9IGZvcm1hdHRlZERhdGEgfHwgZGF0YTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghXy5pc0FycmF5KGRhdGEpKSB7XG4gICAgICAgICAgICAgICAgZGF0YSA9IHRoaXMuZ2V0VHJhbnNmb3JtZWREYXRhKGNvbmZpZy5kYXRhc291cmNlLCBkYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGluIGNhc2Ugb2Ygbm8gZGF0YSByZWNlaXZlZCwgcmVzb2x2ZSB0aGUgcHJvbWlzZSB3aXRoIGVtcHR5IGFycmF5XG4gICAgICAgICAgICBpZiAoIWRhdGEubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSh7ZGF0YTogW10sIGlzTGFzdFBhZ2U6IF9pc0xhc3RQYWdlLCBoYXNNb3JlRGF0YTogcGFnZSA+IDEsIGlzUGFnaW5hdGVkRGF0YSwgcGFnZX0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHtkYXRhOiBkYXRhLCBpc0xhc3RQYWdlOiBfaXNMYXN0UGFnZSwgaGFzTW9yZURhdGE6IHBhZ2UgPiAxLCBpc1BhZ2luYXRlZERhdGEsIHBhZ2V9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufVxuIl19