var LocalDataProvider = /** @class */ (function () {
    function LocalDataProvider() {
    }
    // LocalData filtering is done based on the searchkey.
    LocalDataProvider.prototype.filter = function (config) {
        var entries = config.dataset;
        var casesensitive = config.casesensitive;
        var queryText = config.query, filteredData;
        return new Promise(function (resolve, reject) {
            /**
             * If searchKey is defined, then check for match string against each item in the dataset with item's field name as the searchKey
             * return the filtered data containing the matching string.
             */
            if (config.searchKey) {
                var keys_1 = _.split(config.searchKey, ',');
                filteredData = _.filter(config.dataset, function (item) {
                    return keys_1.some(function (key) {
                        var a = _.get(item, key), b = queryText;
                        if (!casesensitive) {
                            a = _.toLower(_.toString(a));
                            b = _.toLower(_.toString(b));
                        }
                        return _.includes(a, b);
                    });
                });
            }
            else {
                // local search on data with array of objects.
                // Iterate over each item and return the filtered data containing the matching string.
                if (_.isArray(entries) && _.isObject(entries[0])) {
                    filteredData = _.filter(entries, function (entry) {
                        return (_.includes(_.toLower(_.values(entry).join(' ')), _.toLower(queryText)));
                    });
                }
                else {
                    filteredData = _.filter(entries, function (entry) {
                        if (!casesensitive) {
                            entry = _.toLower(entry);
                            queryText = _.toLower(queryText);
                        }
                        return _.includes(entry, queryText);
                    });
                }
            }
            resolve({
                data: filteredData,
                hasMoreData: false,
                isLastPage: true
            });
        });
    };
    return LocalDataProvider;
}());
export { LocalDataProvider };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYWwtZGF0YS1wcm92aWRlci5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vc2VhcmNoL2RhdGEtcHJvdmlkZXIvbG9jYWwtZGF0YS1wcm92aWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFJQTtJQUFBO0lBbURBLENBQUM7SUFsREcsc0RBQXNEO0lBQy9DLGtDQUFNLEdBQWIsVUFBYyxNQUEyQjtRQUNyQyxJQUFNLE9BQU8sR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDO1FBQy9CLElBQU0sYUFBYSxHQUFHLE1BQU0sQ0FBQyxhQUFhLENBQUM7UUFDM0MsSUFBSSxTQUFTLEdBQUcsTUFBTSxDQUFDLEtBQUssRUFDNUIsWUFBWSxDQUFDO1FBRWIsT0FBTyxJQUFJLE9BQU8sQ0FBQyxVQUFDLE9BQU8sRUFBRSxNQUFNO1lBQy9COzs7ZUFHRztZQUNILElBQUksTUFBTSxDQUFDLFNBQVMsRUFBRTtnQkFDbEIsSUFBTSxNQUFJLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxDQUFDO2dCQUU1QyxZQUFZLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLFVBQUMsSUFBUztvQkFDOUMsT0FBTyxNQUFJLENBQUMsSUFBSSxDQUFDLFVBQUEsR0FBRzt3QkFDaEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLEVBQ3BCLENBQUMsR0FBRyxTQUFTLENBQUM7d0JBQ2xCLElBQUksQ0FBQyxhQUFhLEVBQUU7NEJBQ2hCLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs0QkFDN0IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO3lCQUNoQzt3QkFDRCxPQUFPLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO29CQUM1QixDQUFDLENBQUMsQ0FBQztnQkFDUCxDQUFDLENBQUMsQ0FBQzthQUNOO2lCQUFNO2dCQUNILDhDQUE4QztnQkFDOUMsc0ZBQXNGO2dCQUN0RixJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtvQkFDOUMsWUFBWSxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLFVBQUEsS0FBSzt3QkFDbEMsT0FBTyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNwRixDQUFDLENBQUMsQ0FBQztpQkFDTjtxQkFBTTtvQkFDSCxZQUFZLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsVUFBQSxLQUFLO3dCQUNsQyxJQUFJLENBQUMsYUFBYSxFQUFFOzRCQUNoQixLQUFLLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQzs0QkFDekIsU0FBUyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7eUJBQ3BDO3dCQUNELE9BQU8sQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUM7b0JBQ3hDLENBQUMsQ0FBQyxDQUFDO2lCQUNOO2FBQ0o7WUFDRCxPQUFPLENBQUM7Z0JBQ0osSUFBSSxFQUFFLFlBQVk7Z0JBQ2xCLFdBQVcsRUFBRSxLQUFLO2dCQUNsQixVQUFVLEVBQUUsSUFBSTthQUNuQixDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFDTCx3QkFBQztBQUFELENBQUMsQUFuREQsSUFtREMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJRGF0YVByb3ZpZGVyLCBJRGF0YVByb3ZpZGVyQ29uZmlnIH0gZnJvbSAnLi9kYXRhLXByb3ZpZGVyJztcblxuZGVjbGFyZSBjb25zdCBfO1xuXG5leHBvcnQgY2xhc3MgTG9jYWxEYXRhUHJvdmlkZXIgaW1wbGVtZW50cyBJRGF0YVByb3ZpZGVyIHtcbiAgICAvLyBMb2NhbERhdGEgZmlsdGVyaW5nIGlzIGRvbmUgYmFzZWQgb24gdGhlIHNlYXJjaGtleS5cbiAgICBwdWJsaWMgZmlsdGVyKGNvbmZpZzogSURhdGFQcm92aWRlckNvbmZpZyk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIGNvbnN0IGVudHJpZXMgPSBjb25maWcuZGF0YXNldDtcbiAgICAgICAgY29uc3QgY2FzZXNlbnNpdGl2ZSA9IGNvbmZpZy5jYXNlc2Vuc2l0aXZlO1xuICAgICAgICBsZXQgcXVlcnlUZXh0ID0gY29uZmlnLnF1ZXJ5LFxuICAgICAgICBmaWx0ZXJlZERhdGE7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICogSWYgc2VhcmNoS2V5IGlzIGRlZmluZWQsIHRoZW4gY2hlY2sgZm9yIG1hdGNoIHN0cmluZyBhZ2FpbnN0IGVhY2ggaXRlbSBpbiB0aGUgZGF0YXNldCB3aXRoIGl0ZW0ncyBmaWVsZCBuYW1lIGFzIHRoZSBzZWFyY2hLZXlcbiAgICAgICAgICAgICAqIHJldHVybiB0aGUgZmlsdGVyZWQgZGF0YSBjb250YWluaW5nIHRoZSBtYXRjaGluZyBzdHJpbmcuXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGlmIChjb25maWcuc2VhcmNoS2V5KSB7XG4gICAgICAgICAgICAgICAgY29uc3Qga2V5cyA9IF8uc3BsaXQoY29uZmlnLnNlYXJjaEtleSwgJywnKTtcblxuICAgICAgICAgICAgICAgIGZpbHRlcmVkRGF0YSA9IF8uZmlsdGVyKGNvbmZpZy5kYXRhc2V0LCAoaXRlbTogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBrZXlzLnNvbWUoa2V5ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBhID0gXy5nZXQoaXRlbSwga2V5KSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiID0gcXVlcnlUZXh0O1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFjYXNlc2Vuc2l0aXZlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYSA9IF8udG9Mb3dlcihfLnRvU3RyaW5nKGEpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiID0gXy50b0xvd2VyKF8udG9TdHJpbmcoYikpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF8uaW5jbHVkZXMoYSwgYik7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBsb2NhbCBzZWFyY2ggb24gZGF0YSB3aXRoIGFycmF5IG9mIG9iamVjdHMuXG4gICAgICAgICAgICAgICAgLy8gSXRlcmF0ZSBvdmVyIGVhY2ggaXRlbSBhbmQgcmV0dXJuIHRoZSBmaWx0ZXJlZCBkYXRhIGNvbnRhaW5pbmcgdGhlIG1hdGNoaW5nIHN0cmluZy5cbiAgICAgICAgICAgICAgICBpZiAoXy5pc0FycmF5KGVudHJpZXMpICYmIF8uaXNPYmplY3QoZW50cmllc1swXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgZmlsdGVyZWREYXRhID0gXy5maWx0ZXIoZW50cmllcywgZW50cnkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChfLmluY2x1ZGVzKF8udG9Mb3dlcihfLnZhbHVlcyhlbnRyeSkuam9pbignICcpKSwgXy50b0xvd2VyKHF1ZXJ5VGV4dCkpKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZmlsdGVyZWREYXRhID0gXy5maWx0ZXIoZW50cmllcywgZW50cnkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFjYXNlc2Vuc2l0aXZlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZW50cnkgPSBfLnRvTG93ZXIoZW50cnkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHF1ZXJ5VGV4dCA9IF8udG9Mb3dlcihxdWVyeVRleHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIF8uaW5jbHVkZXMoZW50cnksIHF1ZXJ5VGV4dCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlc29sdmUoe1xuICAgICAgICAgICAgICAgIGRhdGE6IGZpbHRlcmVkRGF0YSxcbiAgICAgICAgICAgICAgICBoYXNNb3JlRGF0YTogZmFsc2UsXG4gICAgICAgICAgICAgICAgaXNMYXN0UGFnZTogdHJ1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiJdfQ==