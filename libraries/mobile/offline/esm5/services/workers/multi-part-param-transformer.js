var MultiPartParamTransformer = /** @class */ (function () {
    function MultiPartParamTransformer(deviceFileService, localDBManagementService) {
        this.deviceFileService = deviceFileService;
        this.localDBManagementService = localDBManagementService;
    }
    MultiPartParamTransformer.prototype.postCallSuccess = function (change) {
        var _this = this;
        if (change && change.service === 'DatabaseService') {
            switch (change.operation) {
                case 'insertMultiPartTableData':
                case 'updateMultiPartTableData':
                    // clean up files
                    _.forEach(change.params.data, function (v) {
                        if (_.isObject(v) && v.wmLocalPath) {
                            _this.deviceFileService.removeFile(v.wmLocalPath);
                        }
                    });
                    break;
            }
        }
    };
    MultiPartParamTransformer.prototype.transformParamsFromMap = function (change) {
        if (change && change.service === 'DatabaseService') {
            switch (change.operation) {
                case 'insertMultiPartTableData':
                case 'updateMultiPartTableData':
                    return this.localDBManagementService.getStore(change.params.dataModelName, change.params.entityName)
                        .then(function (store) {
                        // construct Form data
                        return store.deserialize(change.params.data).then(function (formData) {
                            change.params.data = formData;
                        });
                    });
            }
        }
    };
    MultiPartParamTransformer.prototype.transformParamsToMap = function (change) {
        if (change && change.service === 'DatabaseService') {
            switch (change.operation) {
                case 'insertMultiPartTableData':
                case 'updateMultiPartTableData':
                    return this.localDBManagementService.getStore(change.params.dataModelName, change.params.entityName)
                        .then(function (store) {
                        return store.serialize(change.params.data).then(function (map) {
                            change.params.data = map;
                            /**
                             * As save method called with FormData object, empty row is inserted.
                             * Since FormData is converted to map, update the record details now.
                             */
                            store.save(_.mapValues(map, function (v) {
                                return (_.isObject(v) && v.wmLocalPath) || v;
                            }));
                            return map;
                        });
                    });
            }
        }
    };
    return MultiPartParamTransformer;
}());
export { MultiPartParamTransformer };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibXVsdGktcGFydC1wYXJhbS10cmFuc2Zvcm1lci5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9tb2JpbGUvb2ZmbGluZS8iLCJzb3VyY2VzIjpbInNlcnZpY2VzL3dvcmtlcnMvbXVsdGktcGFydC1wYXJhbS10cmFuc2Zvcm1lci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFPQTtJQUVJLG1DQUNZLGlCQUFvQyxFQUNwQyx3QkFBa0Q7UUFEbEQsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFtQjtRQUNwQyw2QkFBd0IsR0FBeEIsd0JBQXdCLENBQTBCO0lBQzNELENBQUM7SUFFRyxtREFBZSxHQUF0QixVQUF1QixNQUFjO1FBQXJDLGlCQWNDO1FBYkcsSUFBSSxNQUFNLElBQUksTUFBTSxDQUFDLE9BQU8sS0FBSyxpQkFBaUIsRUFBRTtZQUNoRCxRQUFRLE1BQU0sQ0FBQyxTQUFTLEVBQUU7Z0JBQ3RCLEtBQUssMEJBQTBCLENBQUM7Z0JBQ2hDLEtBQUssMEJBQTBCO29CQUMzQixpQkFBaUI7b0JBQ2pCLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsVUFBQSxDQUFDO3dCQUMzQixJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLFdBQVcsRUFBRTs0QkFDaEMsS0FBSSxDQUFDLGlCQUFpQixDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQUM7eUJBQ3BEO29CQUNMLENBQUMsQ0FBQyxDQUFDO29CQUNILE1BQU07YUFDYjtTQUNKO0lBQ0wsQ0FBQztJQUVNLDBEQUFzQixHQUE3QixVQUE4QixNQUFjO1FBQ3hDLElBQUksTUFBTSxJQUFJLE1BQU0sQ0FBQyxPQUFPLEtBQUssaUJBQWlCLEVBQUU7WUFDaEQsUUFBUSxNQUFNLENBQUMsU0FBUyxFQUFFO2dCQUN0QixLQUFLLDBCQUEwQixDQUFDO2dCQUNoQyxLQUFLLDBCQUEwQjtvQkFDM0IsT0FBTyxJQUFJLENBQUMsd0JBQXdCLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDO3lCQUMvRixJQUFJLENBQUUsVUFBQSxLQUFLO3dCQUNSLHNCQUFzQjt3QkFDdEIsT0FBTyxLQUFLLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsUUFBUTs0QkFDaEUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsUUFBUSxDQUFDO3dCQUNsQyxDQUFDLENBQUMsQ0FBQztvQkFDUCxDQUFDLENBQUMsQ0FBQzthQUNkO1NBQ0o7SUFDTCxDQUFDO0lBRU0sd0RBQW9CLEdBQTNCLFVBQTRCLE1BQWM7UUFDdEMsSUFBSSxNQUFNLElBQUksTUFBTSxDQUFDLE9BQU8sS0FBSyxpQkFBaUIsRUFBRTtZQUNoRCxRQUFRLE1BQU0sQ0FBQyxTQUFTLEVBQUU7Z0JBQ3RCLEtBQUssMEJBQTBCLENBQUM7Z0JBQ2hDLEtBQUssMEJBQTBCO29CQUMzQixPQUFPLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUM7eUJBQy9GLElBQUksQ0FBRSxVQUFBLEtBQUs7d0JBQ1IsT0FBTyxLQUFLLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsR0FBRzs0QkFDekQsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDOzRCQUN6Qjs7OytCQUdHOzRCQUNILEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsVUFBVSxDQUFDO2dDQUNuQyxPQUFPLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDOzRCQUNqRCxDQUFDLENBQUMsQ0FBQyxDQUFDOzRCQUNKLE9BQU8sR0FBRyxDQUFDO3dCQUNmLENBQUMsQ0FBQyxDQUFDO29CQUNQLENBQUMsQ0FBQyxDQUFDO2FBQ2Q7U0FDSjtJQUNMLENBQUM7SUFDTCxnQ0FBQztBQUFELENBQUMsQUE3REQsSUE2REMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEZXZpY2VGaWxlU2VydmljZSB9IGZyb20gJ0B3bS9tb2JpbGUvY29yZSc7XG5cbmltcG9ydCB7IENoYW5nZSwgV29ya2VyIH0gZnJvbSAnLi4vY2hhbmdlLWxvZy5zZXJ2aWNlJztcbmltcG9ydCB7IExvY2FsREJNYW5hZ2VtZW50U2VydmljZSB9IGZyb20gJy4uL2xvY2FsLWRiLW1hbmFnZW1lbnQuc2VydmljZSc7XG5cbmRlY2xhcmUgY29uc3QgXztcblxuZXhwb3J0IGNsYXNzIE11bHRpUGFydFBhcmFtVHJhbnNmb3JtZXIgaW1wbGVtZW50cyBXb3JrZXIge1xuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHByaXZhdGUgZGV2aWNlRmlsZVNlcnZpY2U6IERldmljZUZpbGVTZXJ2aWNlLFxuICAgICAgICBwcml2YXRlIGxvY2FsREJNYW5hZ2VtZW50U2VydmljZTogTG9jYWxEQk1hbmFnZW1lbnRTZXJ2aWNlXG4gICAgKSB7fVxuXG4gICAgcHVibGljIHBvc3RDYWxsU3VjY2VzcyhjaGFuZ2U6IENoYW5nZSkge1xuICAgICAgICBpZiAoY2hhbmdlICYmIGNoYW5nZS5zZXJ2aWNlID09PSAnRGF0YWJhc2VTZXJ2aWNlJykge1xuICAgICAgICAgICAgc3dpdGNoIChjaGFuZ2Uub3BlcmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnaW5zZXJ0TXVsdGlQYXJ0VGFibGVEYXRhJzpcbiAgICAgICAgICAgICAgICBjYXNlICd1cGRhdGVNdWx0aVBhcnRUYWJsZURhdGEnOlxuICAgICAgICAgICAgICAgICAgICAvLyBjbGVhbiB1cCBmaWxlc1xuICAgICAgICAgICAgICAgICAgICBfLmZvckVhY2goY2hhbmdlLnBhcmFtcy5kYXRhLCB2ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChfLmlzT2JqZWN0KHYpICYmIHYud21Mb2NhbFBhdGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmRldmljZUZpbGVTZXJ2aWNlLnJlbW92ZUZpbGUodi53bUxvY2FsUGF0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyB0cmFuc2Zvcm1QYXJhbXNGcm9tTWFwKGNoYW5nZTogQ2hhbmdlKSB7XG4gICAgICAgIGlmIChjaGFuZ2UgJiYgY2hhbmdlLnNlcnZpY2UgPT09ICdEYXRhYmFzZVNlcnZpY2UnKSB7XG4gICAgICAgICAgICBzd2l0Y2ggKGNoYW5nZS5vcGVyYXRpb24pIHtcbiAgICAgICAgICAgICAgICBjYXNlICdpbnNlcnRNdWx0aVBhcnRUYWJsZURhdGEnOlxuICAgICAgICAgICAgICAgIGNhc2UgJ3VwZGF0ZU11bHRpUGFydFRhYmxlRGF0YSc6XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmxvY2FsREJNYW5hZ2VtZW50U2VydmljZS5nZXRTdG9yZShjaGFuZ2UucGFyYW1zLmRhdGFNb2RlbE5hbWUsIGNoYW5nZS5wYXJhbXMuZW50aXR5TmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCBzdG9yZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gY29uc3RydWN0IEZvcm0gZGF0YVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzdG9yZS5kZXNlcmlhbGl6ZShjaGFuZ2UucGFyYW1zLmRhdGEpLnRoZW4oZnVuY3Rpb24gKGZvcm1EYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoYW5nZS5wYXJhbXMuZGF0YSA9IGZvcm1EYXRhO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgdHJhbnNmb3JtUGFyYW1zVG9NYXAoY2hhbmdlOiBDaGFuZ2UpIHtcbiAgICAgICAgaWYgKGNoYW5nZSAmJiBjaGFuZ2Uuc2VydmljZSA9PT0gJ0RhdGFiYXNlU2VydmljZScpIHtcbiAgICAgICAgICAgIHN3aXRjaCAoY2hhbmdlLm9wZXJhdGlvbikge1xuICAgICAgICAgICAgICAgIGNhc2UgJ2luc2VydE11bHRpUGFydFRhYmxlRGF0YSc6XG4gICAgICAgICAgICAgICAgY2FzZSAndXBkYXRlTXVsdGlQYXJ0VGFibGVEYXRhJzpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubG9jYWxEQk1hbmFnZW1lbnRTZXJ2aWNlLmdldFN0b3JlKGNoYW5nZS5wYXJhbXMuZGF0YU1vZGVsTmFtZSwgY2hhbmdlLnBhcmFtcy5lbnRpdHlOYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oIHN0b3JlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RvcmUuc2VyaWFsaXplKGNoYW5nZS5wYXJhbXMuZGF0YSkudGhlbihmdW5jdGlvbiAobWFwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoYW5nZS5wYXJhbXMuZGF0YSA9IG1hcDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAqIEFzIHNhdmUgbWV0aG9kIGNhbGxlZCB3aXRoIEZvcm1EYXRhIG9iamVjdCwgZW1wdHkgcm93IGlzIGluc2VydGVkLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgKiBTaW5jZSBGb3JtRGF0YSBpcyBjb252ZXJ0ZWQgdG8gbWFwLCB1cGRhdGUgdGhlIHJlY29yZCBkZXRhaWxzIG5vdy5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0b3JlLnNhdmUoXy5tYXBWYWx1ZXMobWFwLCBmdW5jdGlvbiAodikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChfLmlzT2JqZWN0KHYpICYmIHYud21Mb2NhbFBhdGgpIHx8IHY7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1hcDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuIl19