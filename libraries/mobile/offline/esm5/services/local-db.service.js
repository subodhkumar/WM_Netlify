import { Injectable } from '@angular/core';
import { LocalDBManagementService } from './local-db-management.service';
import * as i0 from "@angular/core";
import * as i1 from "./local-db-management.service";
var LocalDbService = /** @class */ (function () {
    function LocalDbService(localDBManagementService) {
        this.localDBManagementService = localDBManagementService;
        this.searchTableData = this.readTableData.bind(this);
        this.searchTableDataWithQuery = this.readTableData.bind(this);
        this.getDistinctDataByFields = this.readTableData.bind(this);
    }
    LocalDbService.prototype.getStore = function (params) {
        return this.localDBManagementService.getStore(params.dataModelName, params.entityName);
    };
    /**
     * Method to insert data into the specified table. This modification will be added to offline change log.
     *
     * @param {object} params
     *                 Object containing name of the project & table data to be inserted.
     * @param {function=} successCallback
     *                    Callback function to be triggered on success.
     * @param {function=} failureCallback
     *                    Callback function to be triggered on failure.
     */
    LocalDbService.prototype.insertTableData = function (params, successCallback, failureCallback) {
        this.getStore(params).then(function (store) {
            var isPKAutoIncremented = (store.primaryKeyField && store.primaryKeyField.generatorType === 'identity');
            if (isPKAutoIncremented && params.data[store.primaryKeyName]) {
                delete params.data[store.primaryKeyName];
            }
            return store.add(params.data).then(function () {
                store.refresh(params.data).then(successCallback);
            });
        }).catch(failureCallback);
    };
    /**
     * Method to insert multi part data into the specified table. This modification will be added to offline change log.
     *
     * @param {object} params
     *                 Object containing name of the project & table data to be inserted.
     * @param {function=} successCallback
     *                    Callback function to be triggered on success.
     * @param {function=} failureCallback
     *                    Callback function to be triggered on failure.
     */
    LocalDbService.prototype.insertMultiPartTableData = function (params, successCallback, failureCallback) {
        var _this = this;
        this.getStore(params).then(function (store) {
            store.serialize(params.data).then(function (data) {
                params.data = data;
                _this.insertTableData(params, successCallback, failureCallback);
            });
        }).catch(failureCallback);
    };
    /**
     * Method to update data in the specified table. This modification will be added to offline change log.
     *
     * @param {object} params
     *                 Object containing name of the project & table data to be updated.
     * @param {function=} successCallback
     *                    Callback function to be triggered on success.
     * @param {function=} failureCallback
     *                    Callback function to be triggered on failure.
     */
    LocalDbService.prototype.updateTableData = function (params, successCallback, failureCallback) {
        this.getStore(params).then(function (store) {
            return store.save(params.data)
                .then(function () {
                store.refresh(params.data).then(successCallback);
            });
        }).catch(failureCallback);
    };
    /**
     * Method to update multi part data in the specified table. This modification will be added to offline change log.
     *
     * @param {object} params
     *                 Object containing name of the project & table data to be updated.
     * @param {function=} successCallback
     *                    Callback function to be triggered on success.
     * @param {function=} failureCallback
     *                    Callback function to be triggered on failure.
     */
    LocalDbService.prototype.updateMultiPartTableData = function (params, successCallback, failureCallback) {
        var data = (params.data && params.data.rowData) || params.data;
        this.getStore(params).then(function (store) {
            return store.save(data);
        }).then(function () {
            if (successCallback) {
                successCallback(data);
            }
        }).catch(failureCallback);
    };
    /**
     * Method to delete data in the specified table. This modification will be added to offline change log.
     *
     * @param {object} params
     *                 Object containing name of the project & table data to be inserted.
     * @param {function=} successCallback
     *                    Callback function to be triggered on success.
     * @param {function=} failureCallback
     *                    Callback function to be triggered on failure.
     */
    LocalDbService.prototype.deleteTableData = function (params, successCallback, failureCallback) {
        this.getStore(params).then(function (store) {
            var pkField = store.primaryKeyField, id = params[pkField.fieldName] || params[pkField.name] || (params.data && params.data[pkField.fieldName]) || params.id;
            store.delete(id).then(successCallback);
        }).catch(failureCallback);
    };
    /**
     * Method to read data from a specified table.
     *
     * @param {object} params
     *                 Object containing name of the project & table data to be inserted.
     * @param {function=} successCallback
     *                    Callback function to be triggered on success.
     * @param {function=} failureCallback
     *                    Callback function to be triggered on failure.
     */
    LocalDbService.prototype.readTableData = function (params, successCallback, failureCallback) {
        var _this = this;
        this.getStore(params).then(function (store) {
            var filter = params.filter(function (filterGroup, filterFields) {
                _this.convertFieldNameToColumnName(store, filterGroup, filterFields);
            }, true);
            // convert wm_bool function with boolean value to 0/1
            filter = filter.replace(/wm_bool\('true'\)/g, 1).replace(/wm_bool\('false'\)/g, 0);
            return store.count(filter).then(function (totalElements) {
                var sort = params.sort.split('=')[1];
                return store.filter(filter, sort, {
                    offset: (params.page - 1) * params.size,
                    limit: params.size
                }).then(function (data) {
                    var totalPages = Math.ceil(totalElements / params.size);
                    successCallback({
                        'content': data,
                        'first': (params.page === 1),
                        'last': (params.page === totalPages),
                        'number': (params.page - 1),
                        'numberOfElements': data.length,
                        'size': params.size,
                        'sort': {
                            'sorted': !!sort,
                            'unsorted': !sort
                        },
                        'totalElements': totalElements,
                        'totalPages': totalPages
                    });
                });
            });
        }).catch(failureCallback);
    };
    LocalDbService.prototype.escapeName = function (name) {
        if (name) {
            name = name.replace(/"/g, '""');
            return '"' + name.replace(/\./g, '"."') + '"';
        }
        return name;
    };
    // returns the columnName appending with the schema name.
    LocalDbService.prototype.getColumnName = function (store, fieldName) {
        if (store.fieldToColumnMapping[fieldName]) {
            var columnName = this.escapeName(store.fieldToColumnMapping[fieldName]);
            if (columnName.indexOf('.') < 0) {
                return this.escapeName(store.entitySchema.name) + '.' + columnName;
            }
            return columnName;
        }
        return fieldName;
    };
    LocalDbService.prototype.convertFieldNameToColumnName = function (store, filterGroup, options) {
        var _this = this;
        _.forEach(filterGroup.rules, function (rule) {
            if (rule.rules) {
                _this.convertFieldNameToColumnName(store, rule);
            }
            else {
                rule.target = _this.getColumnName(store, rule.target);
            }
        });
        // handling the scenario where variable options can have filterField. For example: search filter query
        if (options && options.filterFields) {
            options.filterFields = _.mapKeys(options.filterFields, function (v, k) {
                return _this.getColumnName(store, k);
            });
        }
    };
    LocalDbService.decorators = [
        { type: Injectable, args: [{ providedIn: 'root' },] }
    ];
    /** @nocollapse */
    LocalDbService.ctorParameters = function () { return [
        { type: LocalDBManagementService }
    ]; };
    LocalDbService.ngInjectableDef = i0.defineInjectable({ factory: function LocalDbService_Factory() { return new LocalDbService(i0.inject(i1.LocalDBManagementService)); }, token: LocalDbService, providedIn: "root" });
    return LocalDbService;
}());
export { LocalDbService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYWwtZGIuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9tb2JpbGUvb2ZmbGluZS8iLCJzb3VyY2VzIjpbInNlcnZpY2VzL2xvY2FsLWRiLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUUzQyxPQUFPLEVBQUUsd0JBQXdCLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQzs7O0FBS3pFO0lBT0ksd0JBQW9CLHdCQUFrRDtRQUFsRCw2QkFBd0IsR0FBeEIsd0JBQXdCLENBQTBCO1FBQ2xFLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDckQsSUFBSSxDQUFDLHdCQUF3QixHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzlELElBQUksQ0FBQyx1QkFBdUIsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNqRSxDQUFDO0lBRU0saUNBQVEsR0FBZixVQUFnQixNQUFXO1FBQ3ZCLE9BQU8sSUFBSSxDQUFDLHdCQUF3QixDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsYUFBYSxFQUFFLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztJQUMzRixDQUFDO0lBRUQ7Ozs7Ozs7OztPQVNHO0lBQ0ksd0NBQWUsR0FBdEIsVUFBdUIsTUFBVyxFQUFFLGVBQXFCLEVBQUUsZUFBcUI7UUFDNUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQSxLQUFLO1lBQzVCLElBQU0sbUJBQW1CLEdBQUcsQ0FBQyxLQUFLLENBQUMsZUFBZSxJQUFJLEtBQUssQ0FBQyxlQUFlLENBQUMsYUFBYSxLQUFLLFVBQVUsQ0FBQyxDQUFDO1lBQzFHLElBQUksbUJBQW1CLElBQUksTUFBTSxDQUFD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QkFGakM7Q0F5TUMsQUFsTUQsSUFrTUM7U0FqTVksY0FBYyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgTG9jYWxEQk1hbmFnZW1lbnRTZXJ2aWNlIH0gZnJvbSAnLi9sb2NhbC1kYi1tYW5hZ2VtZW50LnNlcnZpY2UnO1xuaW1wb3J0IHsgTG9jYWxEQlN0b3JlIH0gZnJvbSAnLi4vbW9kZWxzL2xvY2FsLWRiLXN0b3JlJztcblxuZGVjbGFyZSBjb25zdCBfO1xuXG5ASW5qZWN0YWJsZSh7cHJvdmlkZWRJbjogJ3Jvb3QnfSlcbmV4cG9ydCBjbGFzcyBMb2NhbERiU2VydmljZSB7XG5cbiAgICBwcml2YXRlIHNlYXJjaFRhYmxlRGF0YTtcbiAgICBwcml2YXRlIHNlYXJjaFRhYmxlRGF0YVdpdGhRdWVyeTtcbiAgICBwcml2YXRlIGdldERpc3RpbmN0RGF0YUJ5RmllbGRzO1xuXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBsb2NhbERCTWFuYWdlbWVudFNlcnZpY2U6IExvY2FsREJNYW5hZ2VtZW50U2VydmljZSkge1xuICAgICAgICB0aGlzLnNlYXJjaFRhYmxlRGF0YSA9IHRoaXMucmVhZFRhYmxlRGF0YS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLnNlYXJjaFRhYmxlRGF0YVdpdGhRdWVyeSA9IHRoaXMucmVhZFRhYmxlRGF0YS5iaW5kKHRoaXMpO1xuICAgICAgICB0aGlzLmdldERpc3RpbmN0RGF0YUJ5RmllbGRzID0gdGhpcy5yZWFkVGFibGVEYXRhLmJpbmQodGhpcyk7XG4gICAgfVxuXG4gICAgcHVibGljIGdldFN0b3JlKHBhcmFtczogYW55KTogUHJvbWlzZTxMb2NhbERCU3RvcmU+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMubG9jYWxEQk1hbmFnZW1lbnRTZXJ2aWNlLmdldFN0b3JlKHBhcmFtcy5kYXRhTW9kZWxOYW1lLCBwYXJhbXMuZW50aXR5TmFtZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTWV0aG9kIHRvIGluc2VydCBkYXRhIGludG8gdGhlIHNwZWNpZmllZCB0YWJsZS4gVGhpcyBtb2RpZmljYXRpb24gd2lsbCBiZSBhZGRlZCB0byBvZmZsaW5lIGNoYW5nZSBsb2cuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zXG4gICAgICogICAgICAgICAgICAgICAgIE9iamVjdCBjb250YWluaW5nIG5hbWUgb2YgdGhlIHByb2plY3QgJiB0YWJsZSBkYXRhIHRvIGJlIGluc2VydGVkLlxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb249fSBzdWNjZXNzQ2FsbGJhY2tcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgQ2FsbGJhY2sgZnVuY3Rpb24gdG8gYmUgdHJpZ2dlcmVkIG9uIHN1Y2Nlc3MuXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbj19IGZhaWx1cmVDYWxsYmFja1xuICAgICAqICAgICAgICAgICAgICAgICAgICBDYWxsYmFjayBmdW5jdGlvbiB0byBiZSB0cmlnZ2VyZWQgb24gZmFpbHVyZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgaW5zZXJ0VGFibGVEYXRhKHBhcmFtczogYW55LCBzdWNjZXNzQ2FsbGJhY2s/OiBhbnksIGZhaWx1cmVDYWxsYmFjaz86IGFueSkge1xuICAgICAgICB0aGlzLmdldFN0b3JlKHBhcmFtcykudGhlbihzdG9yZSA9PiB7XG4gICAgICAgICAgICBjb25zdCBpc1BLQXV0b0luY3JlbWVudGVkID0gKHN0b3JlLnByaW1hcnlLZXlGaWVsZCAmJiBzdG9yZS5wcmltYXJ5S2V5RmllbGQuZ2VuZXJhdG9yVHlwZSA9PT0gJ2lkZW50aXR5Jyk7XG4gICAgICAgICAgICBpZiAoaXNQS0F1dG9JbmNyZW1lbnRlZCAmJiBwYXJhbXMuZGF0YVtzdG9yZS5wcmltYXJ5S2V5TmFtZV0pIHtcbiAgICAgICAgICAgICAgICBkZWxldGUgcGFyYW1zLmRhdGFbc3RvcmUucHJpbWFyeUtleU5hbWVdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHN0b3JlLmFkZChwYXJhbXMuZGF0YSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgc3RvcmUucmVmcmVzaChwYXJhbXMuZGF0YSkudGhlbihzdWNjZXNzQ2FsbGJhY2spO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pLmNhdGNoKGZhaWx1cmVDYWxsYmFjayk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTWV0aG9kIHRvIGluc2VydCBtdWx0aSBwYXJ0IGRhdGEgaW50byB0aGUgc3BlY2lmaWVkIHRhYmxlLiBUaGlzIG1vZGlmaWNhdGlvbiB3aWxsIGJlIGFkZGVkIHRvIG9mZmxpbmUgY2hhbmdlIGxvZy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXNcbiAgICAgKiAgICAgICAgICAgICAgICAgT2JqZWN0IGNvbnRhaW5pbmcgbmFtZSBvZiB0aGUgcHJvamVjdCAmIHRhYmxlIGRhdGEgdG8gYmUgaW5zZXJ0ZWQuXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbj19IHN1Y2Nlc3NDYWxsYmFja1xuICAgICAqICAgICAgICAgICAgICAgICAgICBDYWxsYmFjayBmdW5jdGlvbiB0byBiZSB0cmlnZ2VyZWQgb24gc3VjY2Vzcy5cbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uPX0gZmFpbHVyZUNhbGxiYWNrXG4gICAgICogICAgICAgICAgICAgICAgICAgIENhbGxiYWNrIGZ1bmN0aW9uIHRvIGJlIHRyaWdnZXJlZCBvbiBmYWlsdXJlLlxuICAgICAqL1xuICAgIHB1YmxpYyBpbnNlcnRNdWx0aVBhcnRUYWJsZURhdGEocGFyYW1zOiBhbnksIHN1Y2Nlc3NDYWxsYmFjaz86IGFueSwgZmFpbHVyZUNhbGxiYWNrPzogYW55KSB7XG4gICAgICAgIHRoaXMuZ2V0U3RvcmUocGFyYW1zKS50aGVuKHN0b3JlID0+IHtcbiAgICAgICAgICAgIHN0b3JlLnNlcmlhbGl6ZShwYXJhbXMuZGF0YSkudGhlbihkYXRhID0+IHtcbiAgICAgICAgICAgICAgICBwYXJhbXMuZGF0YSA9IGRhdGE7XG4gICAgICAgICAgICAgICAgdGhpcy5pbnNlcnRUYWJsZURhdGEocGFyYW1zLCBzdWNjZXNzQ2FsbGJhY2ssIGZhaWx1cmVDYWxsYmFjayk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSkuY2F0Y2goZmFpbHVyZUNhbGxiYWNrKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBNZXRob2QgdG8gdXBkYXRlIGRhdGEgaW4gdGhlIHNwZWNpZmllZCB0YWJsZS4gVGhpcyBtb2RpZmljYXRpb24gd2lsbCBiZSBhZGRlZCB0byBvZmZsaW5lIGNoYW5nZSBsb2cuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zXG4gICAgICogICAgICAgICAgICAgICAgIE9iamVjdCBjb250YWluaW5nIG5hbWUgb2YgdGhlIHByb2plY3QgJiB0YWJsZSBkYXRhIHRvIGJlIHVwZGF0ZWQuXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbj19IHN1Y2Nlc3NDYWxsYmFja1xuICAgICAqICAgICAgICAgICAgICAgICAgICBDYWxsYmFjayBmdW5jdGlvbiB0byBiZSB0cmlnZ2VyZWQgb24gc3VjY2Vzcy5cbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uPX0gZmFpbHVyZUNhbGxiYWNrXG4gICAgICogICAgICAgICAgICAgICAgICAgIENhbGxiYWNrIGZ1bmN0aW9uIHRvIGJlIHRyaWdnZXJlZCBvbiBmYWlsdXJlLlxuICAgICAqL1xuICAgIHB1YmxpYyB1cGRhdGVUYWJsZURhdGEocGFyYW1zOiBhbnksIHN1Y2Nlc3NDYWxsYmFjaz86IGFueSwgZmFpbHVyZUNhbGxiYWNrPzogYW55KSB7XG4gICAgICAgIHRoaXMuZ2V0U3RvcmUocGFyYW1zKS50aGVuKHN0b3JlID0+IHtcbiAgICAgICAgICAgIHJldHVybiBzdG9yZS5zYXZlKHBhcmFtcy5kYXRhKVxuICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgc3RvcmUucmVmcmVzaChwYXJhbXMuZGF0YSkudGhlbihzdWNjZXNzQ2FsbGJhY2spO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9KS5jYXRjaChmYWlsdXJlQ2FsbGJhY2spO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE1ldGhvZCB0byB1cGRhdGUgbXVsdGkgcGFydCBkYXRhIGluIHRoZSBzcGVjaWZpZWQgdGFibGUuIFRoaXMgbW9kaWZpY2F0aW9uIHdpbGwgYmUgYWRkZWQgdG8gb2ZmbGluZSBjaGFuZ2UgbG9nLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtc1xuICAgICAqICAgICAgICAgICAgICAgICBPYmplY3QgY29udGFpbmluZyBuYW1lIG9mIHRoZSBwcm9qZWN0ICYgdGFibGUgZGF0YSB0byBiZSB1cGRhdGVkLlxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb249fSBzdWNjZXNzQ2FsbGJhY2tcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgQ2FsbGJhY2sgZnVuY3Rpb24gdG8gYmUgdHJpZ2dlcmVkIG9uIHN1Y2Nlc3MuXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbj19IGZhaWx1cmVDYWxsYmFja1xuICAgICAqICAgICAgICAgICAgICAgICAgICBDYWxsYmFjayBmdW5jdGlvbiB0byBiZSB0cmlnZ2VyZWQgb24gZmFpbHVyZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgdXBkYXRlTXVsdGlQYXJ0VGFibGVEYXRhKHBhcmFtczogYW55LCBzdWNjZXNzQ2FsbGJhY2s/OiBhbnksIGZhaWx1cmVDYWxsYmFjaz86IGFueSkgIHtcbiAgICAgICAgY29uc3QgZGF0YSA9IChwYXJhbXMuZGF0YSAmJiBwYXJhbXMuZGF0YS5yb3dEYXRhKSB8fCBwYXJhbXMuZGF0YTtcbiAgICAgICAgdGhpcy5nZXRTdG9yZShwYXJhbXMpLnRoZW4oc3RvcmUgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHN0b3JlLnNhdmUoZGF0YSk7XG4gICAgICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgaWYgKHN1Y2Nlc3NDYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIHN1Y2Nlc3NDYWxsYmFjayhkYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkuY2F0Y2goZmFpbHVyZUNhbGxiYWNrKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBNZXRob2QgdG8gZGVsZXRlIGRhdGEgaW4gdGhlIHNwZWNpZmllZCB0YWJsZS4gVGhpcyBtb2RpZmljYXRpb24gd2lsbCBiZSBhZGRlZCB0byBvZmZsaW5lIGNoYW5nZSBsb2cuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zXG4gICAgICogICAgICAgICAgICAgICAgIE9iamVjdCBjb250YWluaW5nIG5hbWUgb2YgdGhlIHByb2plY3QgJiB0YWJsZSBkYXRhIHRvIGJlIGluc2VydGVkLlxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb249fSBzdWNjZXNzQ2FsbGJhY2tcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgQ2FsbGJhY2sgZnVuY3Rpb24gdG8gYmUgdHJpZ2dlcmVkIG9uIHN1Y2Nlc3MuXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbj19IGZhaWx1cmVDYWxsYmFja1xuICAgICAqICAgICAgICAgICAgICAgICAgICBDYWxsYmFjayBmdW5jdGlvbiB0byBiZSB0cmlnZ2VyZWQgb24gZmFpbHVyZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgZGVsZXRlVGFibGVEYXRhKHBhcmFtczogYW55LCBzdWNjZXNzQ2FsbGJhY2s/OiBhbnksIGZhaWx1cmVDYWxsYmFjaz86IGFueSkge1xuICAgICAgICB0aGlzLmdldFN0b3JlKHBhcmFtcykudGhlbihzdG9yZSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwa0ZpZWxkID0gc3RvcmUucHJpbWFyeUtleUZpZWxkLFxuICAgICAgICAgICAgICAgIGlkID0gcGFyYW1zW3BrRmllbGQuZmllbGROYW1lXSB8fCBwYXJhbXNbcGtGaWVsZC5uYW1lXSB8fCAocGFyYW1zLmRhdGEgJiYgcGFyYW1zLmRhdGFbcGtGaWVsZC5maWVsZE5hbWVdKSB8fCBwYXJhbXMuaWQ7XG4gICAgICAgICAgICBzdG9yZS5kZWxldGUoaWQpLnRoZW4oc3VjY2Vzc0NhbGxiYWNrKTtcbiAgICAgICAgfSkuY2F0Y2goZmFpbHVyZUNhbGxiYWNrKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBNZXRob2QgdG8gcmVhZCBkYXRhIGZyb20gYSBzcGVjaWZpZWQgdGFibGUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zXG4gICAgICogICAgICAgICAgICAgICAgIE9iamVjdCBjb250YWluaW5nIG5hbWUgb2YgdGhlIHByb2plY3QgJiB0YWJsZSBkYXRhIHRvIGJlIGluc2VydGVkLlxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb249fSBzdWNjZXNzQ2FsbGJhY2tcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgQ2FsbGJhY2sgZnVuY3Rpb24gdG8gYmUgdHJpZ2dlcmVkIG9uIHN1Y2Nlc3MuXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbj19IGZhaWx1cmVDYWxsYmFja1xuICAgICAqICAgICAgICAgICAgICAgICAgICBDYWxsYmFjayBmdW5jdGlvbiB0byBiZSB0cmlnZ2VyZWQgb24gZmFpbHVyZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgcmVhZFRhYmxlRGF0YShwYXJhbXM6IGFueSwgc3VjY2Vzc0NhbGxiYWNrPzogYW55LCBmYWlsdXJlQ2FsbGJhY2s/OiBhbnkpIHtcbiAgICAgICAgdGhpcy5nZXRTdG9yZShwYXJhbXMpLnRoZW4oc3RvcmUgPT4ge1xuICAgICAgICAgICAgbGV0IGZpbHRlciA9IHBhcmFtcy5maWx0ZXIoKGZpbHRlckdyb3VwLCBmaWx0ZXJGaWVsZHMpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbnZlcnRGaWVsZE5hbWVUb0NvbHVtbk5hbWUoc3RvcmUsIGZpbHRlckdyb3VwLCBmaWx0ZXJGaWVsZHMpO1xuICAgICAgICAgICAgfSwgdHJ1ZSk7XG4gICAgICAgICAgICAvLyBjb252ZXJ0IHdtX2Jvb2wgZnVuY3Rpb24gd2l0aCBib29sZWFuIHZhbHVlIHRvIDAvMVxuICAgICAgICAgICAgZmlsdGVyID0gZmlsdGVyLnJlcGxhY2UoL3dtX2Jvb2xcXCgndHJ1ZSdcXCkvZywgMSkucmVwbGFjZSgvd21fYm9vbFxcKCdmYWxzZSdcXCkvZywgMCk7XG4gICAgICAgICAgICByZXR1cm4gc3RvcmUuY291bnQoZmlsdGVyKS50aGVuKHRvdGFsRWxlbWVudHMgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHNvcnQgPSBwYXJhbXMuc29ydC5zcGxpdCgnPScpWzFdO1xuICAgICAgICAgICAgICAgIHJldHVybiBzdG9yZS5maWx0ZXIoZmlsdGVyLCBzb3J0LCB7XG4gICAgICAgICAgICAgICAgICAgIG9mZnNldDogKHBhcmFtcy5wYWdlIC0gMSkgKiBwYXJhbXMuc2l6ZSxcbiAgICAgICAgICAgICAgICAgICAgbGltaXQ6IHBhcmFtcy5zaXplXG4gICAgICAgICAgICAgICAgfSkudGhlbihkYXRhID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdG90YWxQYWdlcyA9IE1hdGguY2VpbCh0b3RhbEVsZW1lbnRzIC8gcGFyYW1zLnNpemUpO1xuICAgICAgICAgICAgICAgICAgICBzdWNjZXNzQ2FsbGJhY2soe1xuICAgICAgICAgICAgICAgICAgICAgICAgJ2NvbnRlbnQnICAgICAgICAgOiBkYXRhLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2ZpcnN0JyAgICAgICAgICAgOiAocGFyYW1zLnBhZ2UgPT09IDEpLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2xhc3QnICAgICAgICAgICAgOiAocGFyYW1zLnBhZ2UgPT09IHRvdGFsUGFnZXMpLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ251bWJlcicgICAgICAgICAgOiAocGFyYW1zLnBhZ2UgLSAxKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICdudW1iZXJPZkVsZW1lbnRzJzogZGF0YS5sZW5ndGgsXG4gICAgICAgICAgICAgICAgICAgICAgICAnc2l6ZScgICAgICAgICAgICA6IHBhcmFtcy5zaXplLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ3NvcnQnICAgICAgICAgICAgOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3NvcnRlZCcgOiAhIXNvcnQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3Vuc29ydGVkJyA6ICFzb3J0XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgJ3RvdGFsRWxlbWVudHMnICAgOiB0b3RhbEVsZW1lbnRzLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ3RvdGFsUGFnZXMnICAgICAgOiB0b3RhbFBhZ2VzXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pLmNhdGNoKGZhaWx1cmVDYWxsYmFjayk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBlc2NhcGVOYW1lKG5hbWU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgICAgIGlmIChuYW1lKSB7XG4gICAgICAgICAgICBuYW1lID0gbmFtZS5yZXBsYWNlKC9cIi9nLCAnXCJcIicpO1xuICAgICAgICAgICAgcmV0dXJuICdcIicgKyBuYW1lLnJlcGxhY2UoL1xcLi9nLCAnXCIuXCInKSArICdcIic7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5hbWU7XG4gICAgfVxuXG4gICAgLy8gcmV0dXJucyB0aGUgY29sdW1uTmFtZSBhcHBlbmRpbmcgd2l0aCB0aGUgc2NoZW1hIG5hbWUuXG4gICAgcHJpdmF0ZSBnZXRDb2x1bW5OYW1lKHN0b3JlLCBmaWVsZE5hbWUpIHtcbiAgICAgICAgaWYgKHN0b3JlLmZpZWxkVG9Db2x1bW5NYXBwaW5nW2ZpZWxkTmFtZV0pIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbHVtbk5hbWUgPSB0aGlzLmVzY2FwZU5hbWUoc3RvcmUuZmllbGRUb0NvbHVtbk1hcHBpbmdbZmllbGROYW1lXSk7XG4gICAgICAgICAgICBpZiAoY29sdW1uTmFtZS5pbmRleE9mKCcuJykgPCAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZXNjYXBlTmFtZShzdG9yZS5lbnRpdHlTY2hlbWEubmFtZSkgKyAnLicgKyBjb2x1bW5OYW1lO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGNvbHVtbk5hbWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZpZWxkTmFtZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNvbnZlcnRGaWVsZE5hbWVUb0NvbHVtbk5hbWUoc3RvcmU6IExvY2FsREJTdG9yZSwgZmlsdGVyR3JvdXA6IGFueSwgb3B0aW9ucz86IGFueSkge1xuICAgICAgICBfLmZvckVhY2goZmlsdGVyR3JvdXAucnVsZXMsIHJ1bGUgPT4ge1xuICAgICAgICAgICAgaWYgKHJ1bGUucnVsZXMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbnZlcnRGaWVsZE5hbWVUb0NvbHVtbk5hbWUoc3RvcmUsIHJ1bGUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBydWxlLnRhcmdldCA9IHRoaXMuZ2V0Q29sdW1uTmFtZShzdG9yZSwgcnVsZS50YXJnZXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgLy8gaGFuZGxpbmcgdGhlIHNjZW5hcmlvIHdoZXJlIHZhcmlhYmxlIG9wdGlvbnMgY2FuIGhhdmUgZmlsdGVyRmllbGQuIEZvciBleGFtcGxlOiBzZWFyY2ggZmlsdGVyIHF1ZXJ5XG4gICAgICAgIGlmIChvcHRpb25zICYmIG9wdGlvbnMuZmlsdGVyRmllbGRzKSB7XG4gICAgICAgICAgICBvcHRpb25zLmZpbHRlckZpZWxkcyA9IF8ubWFwS2V5cyhvcHRpb25zLmZpbHRlckZpZWxkcywgKHYsIGspID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRDb2x1bW5OYW1lKHN0b3JlLCBrKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxufVxuIl19