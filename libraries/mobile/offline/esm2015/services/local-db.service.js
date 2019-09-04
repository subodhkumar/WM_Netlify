import { Injectable } from '@angular/core';
import { LocalDBManagementService } from './local-db-management.service';
import * as i0 from "@angular/core";
import * as i1 from "./local-db-management.service";
export class LocalDbService {
    constructor(localDBManagementService) {
        this.localDBManagementService = localDBManagementService;
        this.searchTableData = this.readTableData.bind(this);
        this.searchTableDataWithQuery = this.readTableData.bind(this);
        this.getDistinctDataByFields = this.readTableData.bind(this);
    }
    getStore(params) {
        return this.localDBManagementService.getStore(params.dataModelName, params.entityName);
    }
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
    insertTableData(params, successCallback, failureCallback) {
        this.getStore(params).then(store => {
            const isPKAutoIncremented = (store.primaryKeyField && store.primaryKeyField.generatorType === 'identity');
            if (isPKAutoIncremented && params.data[store.primaryKeyName]) {
                delete params.data[store.primaryKeyName];
            }
            return store.add(params.data).then(() => {
                store.refresh(params.data).then(successCallback);
            });
        }).catch(failureCallback);
    }
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
    insertMultiPartTableData(params, successCallback, failureCallback) {
        this.getStore(params).then(store => {
            store.serialize(params.data).then(data => {
                params.data = data;
                this.insertTableData(params, successCallback, failureCallback);
            });
        }).catch(failureCallback);
    }
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
    updateTableData(params, successCallback, failureCallback) {
        this.getStore(params).then(store => {
            return store.save(params.data)
                .then(() => {
                store.refresh(params.data).then(successCallback);
            });
        }).catch(failureCallback);
    }
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
    updateMultiPartTableData(params, successCallback, failureCallback) {
        const data = (params.data && params.data.rowData) || params.data;
        this.getStore(params).then(store => {
            return store.save(data);
        }).then(() => {
            if (successCallback) {
                successCallback(data);
            }
        }).catch(failureCallback);
    }
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
    deleteTableData(params, successCallback, failureCallback) {
        this.getStore(params).then(store => {
            const pkField = store.primaryKeyField, id = params[pkField.fieldName] || params[pkField.name] || (params.data && params.data[pkField.fieldName]) || params.id;
            store.delete(id).then(successCallback);
        }).catch(failureCallback);
    }
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
    readTableData(params, successCallback, failureCallback) {
        this.getStore(params).then(store => {
            let filter = params.filter((filterGroup, filterFields) => {
                this.convertFieldNameToColumnName(store, filterGroup, filterFields);
            }, true);
            // convert wm_bool function with boolean value to 0/1
            filter = filter.replace(/wm_bool\('true'\)/g, 1).replace(/wm_bool\('false'\)/g, 0);
            return store.count(filter).then(totalElements => {
                const sort = params.sort.split('=')[1];
                return store.filter(filter, sort, {
                    offset: (params.page - 1) * params.size,
                    limit: params.size
                }).then(data => {
                    const totalPages = Math.ceil(totalElements / params.size);
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
    }
    escapeName(name) {
        if (name) {
            name = name.replace(/"/g, '""');
            return '"' + name.replace(/\./g, '"."') + '"';
        }
        return name;
    }
    // returns the columnName appending with the schema name.
    getColumnName(store, fieldName) {
        if (store.fieldToColumnMapping[fieldName]) {
            const columnName = this.escapeName(store.fieldToColumnMapping[fieldName]);
            if (columnName.indexOf('.') < 0) {
                return this.escapeName(store.entitySchema.name) + '.' + columnName;
            }
            return columnName;
        }
        return fieldName;
    }
    convertFieldNameToColumnName(store, filterGroup, options) {
        _.forEach(filterGroup.rules, rule => {
            if (rule.rules) {
                this.convertFieldNameToColumnName(store, rule);
            }
            else {
                rule.target = this.getColumnName(store, rule.target);
            }
        });
        // handling the scenario where variable options can have filterField. For example: search filter query
        if (options && options.filterFields) {
            options.filterFields = _.mapKeys(options.filterFields, (v, k) => {
                return this.getColumnName(store, k);
            });
        }
    }
}
LocalDbService.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
/** @nocollapse */
LocalDbService.ctorParameters = () => [
    { type: LocalDBManagementService }
];
LocalDbService.ngInjectableDef = i0.defineInjectable({ factory: function LocalDbService_Factory() { return new LocalDbService(i0.inject(i1.LocalDBManagementService)); }, token: LocalDbService, providedIn: "root" });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYWwtZGIuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9tb2JpbGUvb2ZmbGluZS8iLCJzb3VyY2VzIjpbInNlcnZpY2VzL2xvY2FsLWRiLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUUzQyxPQUFPLEVBQUUsd0JBQXdCLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQzs7O0FBTXpFLE1BQU0sT0FBTyxjQUFjO0lBTXZCLFlBQW9CLHdCQUFrRDtRQUFsRCw2QkFBd0IsR0FBeEIsd0JBQXdCLENBQTBCO1FBQ2xFLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDckQsSUFBSSxDQUFDLHdCQUF3QixHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzlELElBQUksQ0FBQyx1QkFBdUIsR0FBRyxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNqRSxDQUFDO0lBRU0sUUFBUSxDQUFDLE1BQVc7UUFDdkIsT0FBTyxJQUFJLENBQUMsd0JBQXdCLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxhQUFhLEVBQUUsTUFBTSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQzNGLENBQUM7SUFFRDs7Ozs7Ozs7O09BU0c7SUFDSSxlQUFlLENBQUMsTUFBVyxFQUFFLGVBQXFCLEVBQUUsZUFBcUI7UUFDNUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDL0IsTUFBTSxtQkFBbUIsR0FBRyxDQUFDLEtBQUssQ0FBQyxlQUFlLElBQUksS0FBSyxDQUFDLGVBQWUsQ0FBQyxhQUFhLEtBQUssVUFBVSxDQUFDLENBQUM7WUFDMUcsSUFBSSxtQkFBbUIsSUFBSSxNQUFN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LCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IExvY2FsREJNYW5hZ2VtZW50U2VydmljZSB9IGZyb20gJy4vbG9jYWwtZGItbWFuYWdlbWVudC5zZXJ2aWNlJztcbmltcG9ydCB7IExvY2FsREJTdG9yZSB9IGZyb20gJy4uL21vZGVscy9sb2NhbC1kYi1zdG9yZSc7XG5cbmRlY2xhcmUgY29uc3QgXztcblxuQEluamVjdGFibGUoe3Byb3ZpZGVkSW46ICdyb290J30pXG5leHBvcnQgY2xhc3MgTG9jYWxEYlNlcnZpY2Uge1xuXG4gICAgcHJpdmF0ZSBzZWFyY2hUYWJsZURhdGE7XG4gICAgcHJpdmF0ZSBzZWFyY2hUYWJsZURhdGFXaXRoUXVlcnk7XG4gICAgcHJpdmF0ZSBnZXREaXN0aW5jdERhdGFCeUZpZWxkcztcblxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgbG9jYWxEQk1hbmFnZW1lbnRTZXJ2aWNlOiBMb2NhbERCTWFuYWdlbWVudFNlcnZpY2UpIHtcbiAgICAgICAgdGhpcy5zZWFyY2hUYWJsZURhdGEgPSB0aGlzLnJlYWRUYWJsZURhdGEuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5zZWFyY2hUYWJsZURhdGFXaXRoUXVlcnkgPSB0aGlzLnJlYWRUYWJsZURhdGEuYmluZCh0aGlzKTtcbiAgICAgICAgdGhpcy5nZXREaXN0aW5jdERhdGFCeUZpZWxkcyA9IHRoaXMucmVhZFRhYmxlRGF0YS5iaW5kKHRoaXMpO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRTdG9yZShwYXJhbXM6IGFueSk6IFByb21pc2U8TG9jYWxEQlN0b3JlPiB7XG4gICAgICAgIHJldHVybiB0aGlzLmxvY2FsREJNYW5hZ2VtZW50U2VydmljZS5nZXRTdG9yZShwYXJhbXMuZGF0YU1vZGVsTmFtZSwgcGFyYW1zLmVudGl0eU5hbWUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE1ldGhvZCB0byBpbnNlcnQgZGF0YSBpbnRvIHRoZSBzcGVjaWZpZWQgdGFibGUuIFRoaXMgbW9kaWZpY2F0aW9uIHdpbGwgYmUgYWRkZWQgdG8gb2ZmbGluZSBjaGFuZ2UgbG9nLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtc1xuICAgICAqICAgICAgICAgICAgICAgICBPYmplY3QgY29udGFpbmluZyBuYW1lIG9mIHRoZSBwcm9qZWN0ICYgdGFibGUgZGF0YSB0byBiZSBpbnNlcnRlZC5cbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uPX0gc3VjY2Vzc0NhbGxiYWNrXG4gICAgICogICAgICAgICAgICAgICAgICAgIENhbGxiYWNrIGZ1bmN0aW9uIHRvIGJlIHRyaWdnZXJlZCBvbiBzdWNjZXNzLlxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb249fSBmYWlsdXJlQ2FsbGJhY2tcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgQ2FsbGJhY2sgZnVuY3Rpb24gdG8gYmUgdHJpZ2dlcmVkIG9uIGZhaWx1cmUuXG4gICAgICovXG4gICAgcHVibGljIGluc2VydFRhYmxlRGF0YShwYXJhbXM6IGFueSwgc3VjY2Vzc0NhbGxiYWNrPzogYW55LCBmYWlsdXJlQ2FsbGJhY2s/OiBhbnkpIHtcbiAgICAgICAgdGhpcy5nZXRTdG9yZShwYXJhbXMpLnRoZW4oc3RvcmUgPT4ge1xuICAgICAgICAgICAgY29uc3QgaXNQS0F1dG9JbmNyZW1lbnRlZCA9IChzdG9yZS5wcmltYXJ5S2V5RmllbGQgJiYgc3RvcmUucHJpbWFyeUtleUZpZWxkLmdlbmVyYXRvclR5cGUgPT09ICdpZGVudGl0eScpO1xuICAgICAgICAgICAgaWYgKGlzUEtBdXRvSW5jcmVtZW50ZWQgJiYgcGFyYW1zLmRhdGFbc3RvcmUucHJpbWFyeUtleU5hbWVdKSB7XG4gICAgICAgICAgICAgICAgZGVsZXRlIHBhcmFtcy5kYXRhW3N0b3JlLnByaW1hcnlLZXlOYW1lXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBzdG9yZS5hZGQocGFyYW1zLmRhdGEpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIHN0b3JlLnJlZnJlc2gocGFyYW1zLmRhdGEpLnRoZW4oc3VjY2Vzc0NhbGxiYWNrKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KS5jYXRjaChmYWlsdXJlQ2FsbGJhY2spO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE1ldGhvZCB0byBpbnNlcnQgbXVsdGkgcGFydCBkYXRhIGludG8gdGhlIHNwZWNpZmllZCB0YWJsZS4gVGhpcyBtb2RpZmljYXRpb24gd2lsbCBiZSBhZGRlZCB0byBvZmZsaW5lIGNoYW5nZSBsb2cuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gcGFyYW1zXG4gICAgICogICAgICAgICAgICAgICAgIE9iamVjdCBjb250YWluaW5nIG5hbWUgb2YgdGhlIHByb2plY3QgJiB0YWJsZSBkYXRhIHRvIGJlIGluc2VydGVkLlxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb249fSBzdWNjZXNzQ2FsbGJhY2tcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgQ2FsbGJhY2sgZnVuY3Rpb24gdG8gYmUgdHJpZ2dlcmVkIG9uIHN1Y2Nlc3MuXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbj19IGZhaWx1cmVDYWxsYmFja1xuICAgICAqICAgICAgICAgICAgICAgICAgICBDYWxsYmFjayBmdW5jdGlvbiB0byBiZSB0cmlnZ2VyZWQgb24gZmFpbHVyZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgaW5zZXJ0TXVsdGlQYXJ0VGFibGVEYXRhKHBhcmFtczogYW55LCBzdWNjZXNzQ2FsbGJhY2s/OiBhbnksIGZhaWx1cmVDYWxsYmFjaz86IGFueSkge1xuICAgICAgICB0aGlzLmdldFN0b3JlKHBhcmFtcykudGhlbihzdG9yZSA9PiB7XG4gICAgICAgICAgICBzdG9yZS5zZXJpYWxpemUocGFyYW1zLmRhdGEpLnRoZW4oZGF0YSA9PiB7XG4gICAgICAgICAgICAgICAgcGFyYW1zLmRhdGEgPSBkYXRhO1xuICAgICAgICAgICAgICAgIHRoaXMuaW5zZXJ0VGFibGVEYXRhKHBhcmFtcywgc3VjY2Vzc0NhbGxiYWNrLCBmYWlsdXJlQ2FsbGJhY2spO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pLmNhdGNoKGZhaWx1cmVDYWxsYmFjayk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTWV0aG9kIHRvIHVwZGF0ZSBkYXRhIGluIHRoZSBzcGVjaWZpZWQgdGFibGUuIFRoaXMgbW9kaWZpY2F0aW9uIHdpbGwgYmUgYWRkZWQgdG8gb2ZmbGluZSBjaGFuZ2UgbG9nLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtc1xuICAgICAqICAgICAgICAgICAgICAgICBPYmplY3QgY29udGFpbmluZyBuYW1lIG9mIHRoZSBwcm9qZWN0ICYgdGFibGUgZGF0YSB0byBiZSB1cGRhdGVkLlxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb249fSBzdWNjZXNzQ2FsbGJhY2tcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgQ2FsbGJhY2sgZnVuY3Rpb24gdG8gYmUgdHJpZ2dlcmVkIG9uIHN1Y2Nlc3MuXG4gICAgICogQHBhcmFtIHtmdW5jdGlvbj19IGZhaWx1cmVDYWxsYmFja1xuICAgICAqICAgICAgICAgICAgICAgICAgICBDYWxsYmFjayBmdW5jdGlvbiB0byBiZSB0cmlnZ2VyZWQgb24gZmFpbHVyZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgdXBkYXRlVGFibGVEYXRhKHBhcmFtczogYW55LCBzdWNjZXNzQ2FsbGJhY2s/OiBhbnksIGZhaWx1cmVDYWxsYmFjaz86IGFueSkge1xuICAgICAgICB0aGlzLmdldFN0b3JlKHBhcmFtcykudGhlbihzdG9yZSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gc3RvcmUuc2F2ZShwYXJhbXMuZGF0YSlcbiAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHN0b3JlLnJlZnJlc2gocGFyYW1zLmRhdGEpLnRoZW4oc3VjY2Vzc0NhbGxiYWNrKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfSkuY2F0Y2goZmFpbHVyZUNhbGxiYWNrKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBNZXRob2QgdG8gdXBkYXRlIG11bHRpIHBhcnQgZGF0YSBpbiB0aGUgc3BlY2lmaWVkIHRhYmxlLiBUaGlzIG1vZGlmaWNhdGlvbiB3aWxsIGJlIGFkZGVkIHRvIG9mZmxpbmUgY2hhbmdlIGxvZy5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBwYXJhbXNcbiAgICAgKiAgICAgICAgICAgICAgICAgT2JqZWN0IGNvbnRhaW5pbmcgbmFtZSBvZiB0aGUgcHJvamVjdCAmIHRhYmxlIGRhdGEgdG8gYmUgdXBkYXRlZC5cbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uPX0gc3VjY2Vzc0NhbGxiYWNrXG4gICAgICogICAgICAgICAgICAgICAgICAgIENhbGxiYWNrIGZ1bmN0aW9uIHRvIGJlIHRyaWdnZXJlZCBvbiBzdWNjZXNzLlxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb249fSBmYWlsdXJlQ2FsbGJhY2tcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgQ2FsbGJhY2sgZnVuY3Rpb24gdG8gYmUgdHJpZ2dlcmVkIG9uIGZhaWx1cmUuXG4gICAgICovXG4gICAgcHVibGljIHVwZGF0ZU11bHRpUGFydFRhYmxlRGF0YShwYXJhbXM6IGFueSwgc3VjY2Vzc0NhbGxiYWNrPzogYW55LCBmYWlsdXJlQ2FsbGJhY2s/OiBhbnkpICB7XG4gICAgICAgIGNvbnN0IGRhdGEgPSAocGFyYW1zLmRhdGEgJiYgcGFyYW1zLmRhdGEucm93RGF0YSkgfHwgcGFyYW1zLmRhdGE7XG4gICAgICAgIHRoaXMuZ2V0U3RvcmUocGFyYW1zKS50aGVuKHN0b3JlID0+IHtcbiAgICAgICAgICAgIHJldHVybiBzdG9yZS5zYXZlKGRhdGEpO1xuICAgICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIGlmIChzdWNjZXNzQ2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBzdWNjZXNzQ2FsbGJhY2soZGF0YSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pLmNhdGNoKGZhaWx1cmVDYWxsYmFjayk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTWV0aG9kIHRvIGRlbGV0ZSBkYXRhIGluIHRoZSBzcGVjaWZpZWQgdGFibGUuIFRoaXMgbW9kaWZpY2F0aW9uIHdpbGwgYmUgYWRkZWQgdG8gb2ZmbGluZSBjaGFuZ2UgbG9nLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtc1xuICAgICAqICAgICAgICAgICAgICAgICBPYmplY3QgY29udGFpbmluZyBuYW1lIG9mIHRoZSBwcm9qZWN0ICYgdGFibGUgZGF0YSB0byBiZSBpbnNlcnRlZC5cbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uPX0gc3VjY2Vzc0NhbGxiYWNrXG4gICAgICogICAgICAgICAgICAgICAgICAgIENhbGxiYWNrIGZ1bmN0aW9uIHRvIGJlIHRyaWdnZXJlZCBvbiBzdWNjZXNzLlxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb249fSBmYWlsdXJlQ2FsbGJhY2tcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgQ2FsbGJhY2sgZnVuY3Rpb24gdG8gYmUgdHJpZ2dlcmVkIG9uIGZhaWx1cmUuXG4gICAgICovXG4gICAgcHVibGljIGRlbGV0ZVRhYmxlRGF0YShwYXJhbXM6IGFueSwgc3VjY2Vzc0NhbGxiYWNrPzogYW55LCBmYWlsdXJlQ2FsbGJhY2s/OiBhbnkpIHtcbiAgICAgICAgdGhpcy5nZXRTdG9yZShwYXJhbXMpLnRoZW4oc3RvcmUgPT4ge1xuICAgICAgICAgICAgY29uc3QgcGtGaWVsZCA9IHN0b3JlLnByaW1hcnlLZXlGaWVsZCxcbiAgICAgICAgICAgICAgICBpZCA9IHBhcmFtc1twa0ZpZWxkLmZpZWxkTmFtZV0gfHwgcGFyYW1zW3BrRmllbGQubmFtZV0gfHwgKHBhcmFtcy5kYXRhICYmIHBhcmFtcy5kYXRhW3BrRmllbGQuZmllbGROYW1lXSkgfHwgcGFyYW1zLmlkO1xuICAgICAgICAgICAgc3RvcmUuZGVsZXRlKGlkKS50aGVuKHN1Y2Nlc3NDYWxsYmFjayk7XG4gICAgICAgIH0pLmNhdGNoKGZhaWx1cmVDYWxsYmFjayk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogTWV0aG9kIHRvIHJlYWQgZGF0YSBmcm9tIGEgc3BlY2lmaWVkIHRhYmxlLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtvYmplY3R9IHBhcmFtc1xuICAgICAqICAgICAgICAgICAgICAgICBPYmplY3QgY29udGFpbmluZyBuYW1lIG9mIHRoZSBwcm9qZWN0ICYgdGFibGUgZGF0YSB0byBiZSBpbnNlcnRlZC5cbiAgICAgKiBAcGFyYW0ge2Z1bmN0aW9uPX0gc3VjY2Vzc0NhbGxiYWNrXG4gICAgICogICAgICAgICAgICAgICAgICAgIENhbGxiYWNrIGZ1bmN0aW9uIHRvIGJlIHRyaWdnZXJlZCBvbiBzdWNjZXNzLlxuICAgICAqIEBwYXJhbSB7ZnVuY3Rpb249fSBmYWlsdXJlQ2FsbGJhY2tcbiAgICAgKiAgICAgICAgICAgICAgICAgICAgQ2FsbGJhY2sgZnVuY3Rpb24gdG8gYmUgdHJpZ2dlcmVkIG9uIGZhaWx1cmUuXG4gICAgICovXG4gICAgcHVibGljIHJlYWRUYWJsZURhdGEocGFyYW1zOiBhbnksIHN1Y2Nlc3NDYWxsYmFjaz86IGFueSwgZmFpbHVyZUNhbGxiYWNrPzogYW55KSB7XG4gICAgICAgIHRoaXMuZ2V0U3RvcmUocGFyYW1zKS50aGVuKHN0b3JlID0+IHtcbiAgICAgICAgICAgIGxldCBmaWx0ZXIgPSBwYXJhbXMuZmlsdGVyKChmaWx0ZXJHcm91cCwgZmlsdGVyRmllbGRzKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb252ZXJ0RmllbGROYW1lVG9Db2x1bW5OYW1lKHN0b3JlLCBmaWx0ZXJHcm91cCwgZmlsdGVyRmllbGRzKTtcbiAgICAgICAgICAgIH0sIHRydWUpO1xuICAgICAgICAgICAgLy8gY29udmVydCB3bV9ib29sIGZ1bmN0aW9uIHdpdGggYm9vbGVhbiB2YWx1ZSB0byAwLzFcbiAgICAgICAgICAgIGZpbHRlciA9IGZpbHRlci5yZXBsYWNlKC93bV9ib29sXFwoJ3RydWUnXFwpL2csIDEpLnJlcGxhY2UoL3dtX2Jvb2xcXCgnZmFsc2UnXFwpL2csIDApO1xuICAgICAgICAgICAgcmV0dXJuIHN0b3JlLmNvdW50KGZpbHRlcikudGhlbih0b3RhbEVsZW1lbnRzID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBzb3J0ID0gcGFyYW1zLnNvcnQuc3BsaXQoJz0nKVsxXTtcbiAgICAgICAgICAgICAgICByZXR1cm4gc3RvcmUuZmlsdGVyKGZpbHRlciwgc29ydCwge1xuICAgICAgICAgICAgICAgICAgICBvZmZzZXQ6IChwYXJhbXMucGFnZSAtIDEpICogcGFyYW1zLnNpemUsXG4gICAgICAgICAgICAgICAgICAgIGxpbWl0OiBwYXJhbXMuc2l6ZVxuICAgICAgICAgICAgICAgIH0pLnRoZW4oZGF0YSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHRvdGFsUGFnZXMgPSBNYXRoLmNlaWwodG90YWxFbGVtZW50cyAvIHBhcmFtcy5zaXplKTtcbiAgICAgICAgICAgICAgICAgICAgc3VjY2Vzc0NhbGxiYWNrKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICdjb250ZW50JyAgICAgICAgIDogZGF0YSxcbiAgICAgICAgICAgICAgICAgICAgICAgICdmaXJzdCcgICAgICAgICAgIDogKHBhcmFtcy5wYWdlID09PSAxKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICdsYXN0JyAgICAgICAgICAgIDogKHBhcmFtcy5wYWdlID09PSB0b3RhbFBhZ2VzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICdudW1iZXInICAgICAgICAgIDogKHBhcmFtcy5wYWdlIC0gMSksXG4gICAgICAgICAgICAgICAgICAgICAgICAnbnVtYmVyT2ZFbGVtZW50cyc6IGRhdGEubGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ3NpemUnICAgICAgICAgICAgOiBwYXJhbXMuc2l6ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICdzb3J0JyAgICAgICAgICAgIDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdzb3J0ZWQnIDogISFzb3J0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICd1bnNvcnRlZCcgOiAhc29ydFxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICd0b3RhbEVsZW1lbnRzJyAgIDogdG90YWxFbGVtZW50cyxcbiAgICAgICAgICAgICAgICAgICAgICAgICd0b3RhbFBhZ2VzJyAgICAgIDogdG90YWxQYWdlc1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KS5jYXRjaChmYWlsdXJlQ2FsbGJhY2spO1xuICAgIH1cblxuICAgIHByaXZhdGUgZXNjYXBlTmFtZShuYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgICAgICBpZiAobmFtZSkge1xuICAgICAgICAgICAgbmFtZSA9IG5hbWUucmVwbGFjZSgvXCIvZywgJ1wiXCInKTtcbiAgICAgICAgICAgIHJldHVybiAnXCInICsgbmFtZS5yZXBsYWNlKC9cXC4vZywgJ1wiLlwiJykgKyAnXCInO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuYW1lO1xuICAgIH1cblxuICAgIC8vIHJldHVybnMgdGhlIGNvbHVtbk5hbWUgYXBwZW5kaW5nIHdpdGggdGhlIHNjaGVtYSBuYW1lLlxuICAgIHByaXZhdGUgZ2V0Q29sdW1uTmFtZShzdG9yZSwgZmllbGROYW1lKSB7XG4gICAgICAgIGlmIChzdG9yZS5maWVsZFRvQ29sdW1uTWFwcGluZ1tmaWVsZE5hbWVdKSB7XG4gICAgICAgICAgICBjb25zdCBjb2x1bW5OYW1lID0gdGhpcy5lc2NhcGVOYW1lKHN0b3JlLmZpZWxkVG9Db2x1bW5NYXBwaW5nW2ZpZWxkTmFtZV0pO1xuICAgICAgICAgICAgaWYgKGNvbHVtbk5hbWUuaW5kZXhPZignLicpIDwgMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmVzY2FwZU5hbWUoc3RvcmUuZW50aXR5U2NoZW1hLm5hbWUpICsgJy4nICsgY29sdW1uTmFtZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBjb2x1bW5OYW1lO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmaWVsZE5hbWU7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjb252ZXJ0RmllbGROYW1lVG9Db2x1bW5OYW1lKHN0b3JlOiBMb2NhbERCU3RvcmUsIGZpbHRlckdyb3VwOiBhbnksIG9wdGlvbnM/OiBhbnkpIHtcbiAgICAgICAgXy5mb3JFYWNoKGZpbHRlckdyb3VwLnJ1bGVzLCBydWxlID0+IHtcbiAgICAgICAgICAgIGlmIChydWxlLnJ1bGVzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb252ZXJ0RmllbGROYW1lVG9Db2x1bW5OYW1lKHN0b3JlLCBydWxlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcnVsZS50YXJnZXQgPSB0aGlzLmdldENvbHVtbk5hbWUoc3RvcmUsIHJ1bGUudGFyZ2V0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIC8vIGhhbmRsaW5nIHRoZSBzY2VuYXJpbyB3aGVyZSB2YXJpYWJsZSBvcHRpb25zIGNhbiBoYXZlIGZpbHRlckZpZWxkLiBGb3IgZXhhbXBsZTogc2VhcmNoIGZpbHRlciBxdWVyeVxuICAgICAgICBpZiAob3B0aW9ucyAmJiBvcHRpb25zLmZpbHRlckZpZWxkcykge1xuICAgICAgICAgICAgb3B0aW9ucy5maWx0ZXJGaWVsZHMgPSBfLm1hcEtleXMob3B0aW9ucy5maWx0ZXJGaWVsZHMsICh2LCBrKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Q29sdW1uTmFtZShzdG9yZSwgayk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==