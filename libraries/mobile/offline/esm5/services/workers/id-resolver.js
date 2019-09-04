import { Injectable } from '@angular/core';
import { isDefined, noop } from '@wm/core';
import { LocalDBManagementService } from './../local-db-management.service';
var STORE_KEY = 'idConflictResolution';
/**
 * In offline database, a insert could generate the Id of an entity. During flush, id of that entity might get changed.
 * Due to that, relationship inconsistency arises. To prevent that, wherever this entity is referred in the next flush
 * call, Id has to be replaced with that of new one.
 */
var IdResolver = /** @class */ (function () {
    function IdResolver(localDBManagementService) {
        this.localDBManagementService = localDBManagementService;
        this.logger = window.console;
    }
    IdResolver.prototype.preFlush = function (context) {
        this.idStore = context.get(STORE_KEY);
    };
    // Exchane Ids, Before any database operation.
    IdResolver.prototype.preCall = function (change) {
        var _this = this;
        if (change && change.service === 'DatabaseService') {
            var entityName_1 = change.params.entityName;
            var dataModelName_1 = change.params.dataModelName;
            switch (change.operation) {
                case 'insertTableData':
                case 'insertMultiPartTableData':
                    change.params.skipLocalDB = true;
                    return this.localDBManagementService.getStore(dataModelName_1, entityName_1)
                        .then(function (store) {
                        var primaryKeyName = store.primaryKeyName;
                        if (primaryKeyName) {
                            _this.transactionLocalId = change.params.data[primaryKeyName];
                            change['dataLocalId'] = _this.transactionLocalId;
                        }
                        return _this.exchangeIds(store, dataModelName_1, entityName_1, change.params.data)
                            .then(function () {
                            if (store.primaryKeyField && store.primaryKeyField.generatorType === 'identity') {
                                delete change.params.data[primaryKeyName];
                            }
                            else {
                                var relationalPrimaryKeyValue = store.getValue(change.params.data, store.primaryKeyName);
                                // for the data referring to the relational table based on primary key assign the primaryField values to the relationalPrimaryKeyValue
                                if (isDefined(relationalPrimaryKeyValue)) {
                                    change.params.data[primaryKeyName] = relationalPrimaryKeyValue;
                                    if (_this.transactionLocalId !== null) {
                                        _this.pushIdToStore(dataModelName_1, entityName_1, _this.transactionLocalId, relationalPrimaryKeyValue);
                                    }
                                }
                                _this.transactionLocalId = null;
                            }
                        });
                    });
                case 'updateTableData':
                case 'updateMultiPartTableData':
                case 'deleteTableData':
                    return this.localDBManagementService.getStore(dataModelName_1, entityName_1).then(function (store) {
                        // on update call, passing id to exchangeId as change.params id(local value 10000000+) is not updated with the latest id from db
                        _this.exchangeId(store, dataModelName_1, entityName_1, change.params, 'id');
                        if (change.params.data) {
                            return _this.exchangeIds(store, dataModelName_1, entityName_1, change.params.data);
                        }
                    });
            }
        }
    };
    // After every database insert, track the Id change.
    IdResolver.prototype.postCallSuccess = function (change, response) {
        var _this = this;
        if (change && change.service === 'DatabaseService'
            && (change.operation === 'insertTableData' || change.operation === 'insertMultiPartTableData')
            && this.transactionLocalId) {
            var data_1 = response[0].body;
            var entityName_2 = change.params.entityName;
            var dataModelName_2 = change.params.dataModelName;
            return this.localDBManagementService.getStore(dataModelName_2, entityName_2).then(function (store) {
                _this.pushIdToStore(dataModelName_2, entityName_2, _this.transactionLocalId, data_1[store.primaryKeyName]);
                return store.delete(_this.transactionLocalId).catch(noop).then(function () {
                    _this.transactionLocalId = null;
                    return store.save(data_1);
                });
            });
        }
    };
    // store error entity id
    IdResolver.prototype.postCallError = function (change) {
        var _this = this;
        if (change && change.service === 'DatabaseService'
            && (change.operation === 'insertTableData' || change.operation === 'insertMultiPartTableData')
            && this.transactionLocalId) {
            var entityName = change.params.entityName;
            var dataModelName = change.params.dataModelName;
            return this.localDBManagementService.getStore(dataModelName, entityName).then(function (store) {
                change.params.data[store.primaryKeyName] = _this.transactionLocalId;
            });
        }
    };
    IdResolver.prototype.getEntityIdStore = function (dataModelName, entityName) {
        this.idStore[dataModelName] = this.idStore[dataModelName] || {};
        this.idStore[dataModelName][entityName] = this.idStore[dataModelName][entityName] || {};
        return this.idStore[dataModelName][entityName];
    };
    // if local id is different, then create a mapping for exchange.
    IdResolver.prototype.pushIdToStore = function (dataModelName, entityName, transactionLocalId, remoteId) {
        if (transactionLocalId !== remoteId) {
            this.getEntityIdStore(dataModelName, entityName)[transactionLocalId] = remoteId;
            this.logger.debug('Conflict found for entity (%s) with local id (%i) and remote Id (%i)', entityName, transactionLocalId, remoteId);
        }
    };
    IdResolver.prototype.logResolution = function (entityName, localId, remoteId) {
        this.logger.debug('Conflict resolved found for entity (%s) with local id (%i) and remote Id (%i)', entityName, localId, remoteId);
    };
    // Exchange primary key  of the given entity
    IdResolver.prototype.exchangeId = function (store, dataModelName, entityName, data, keyName) {
        var primaryKeyName = keyName || store.primaryKeyName;
        var entityIdStore = this.getEntityIdStore(dataModelName, entityName);
        if (data && primaryKeyName) {
            var localId = data[primaryKeyName];
            var remoteId = localId;
            while (entityIdStore[remoteId]) {
                remoteId = entityIdStore[remoteId];
            }
            if (remoteId !== localId) {
                data[primaryKeyName] = remoteId;
                this.logResolution(entityName, localId, remoteId);
            }
        }
    };
    // Looks primary key changes in the given entity or in the relations
    IdResolver.prototype.exchangeIds = function (store, dataModelName, entityName, data) {
        var _this = this;
        this.exchangeId(store, dataModelName, entityName, data);
        var exchangeIdPromises = [];
        store.entitySchema.columns.forEach(function (col) {
            if (col.foreignRelations) {
                col.foreignRelations.forEach(function (foreignRelation) {
                    if (data[col.fieldName]) { // if id value
                        _this.exchangeId(store, dataModelName, foreignRelation.targetEntity, data, col.fieldName);
                    }
                    if (data[foreignRelation.sourceFieldName]) { // if object reference
                        exchangeIdPromises.push(_this.localDBManagementService.getStore(dataModelName, foreignRelation.targetEntity)
                            .then(function (refStore) {
                            return _this.exchangeIds(refStore, dataModelName, foreignRelation.targetEntity, data[foreignRelation.sourceFieldName]);
                        }));
                    }
                });
            }
        });
        return Promise.all(exchangeIdPromises);
    };
    IdResolver.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    IdResolver.ctorParameters = function () { return [
        { type: LocalDBManagementService }
    ]; };
    return IdResolver;
}());
export { IdResolver };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWQtcmVzb2x2ZXIuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vbW9iaWxlL29mZmxpbmUvIiwic291cmNlcyI6WyJzZXJ2aWNlcy93b3JrZXJzL2lkLXJlc29sdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFM0MsT0FBTyxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFHM0MsT0FBTyxFQUFFLHdCQUF3QixFQUFFLE1BQU0sa0NBQWtDLENBQUM7QUFHNUUsSUFBTSxTQUFTLEdBQUksc0JBQXNCLENBQUM7QUFFMUM7Ozs7R0FJRztBQUNIO0lBT0ksb0JBQW9CLHdCQUFrRDtRQUFsRCw2QkFBd0IsR0FBeEIsd0JBQXdCLENBQTBCO1FBQ2xFLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQztJQUNqQyxDQUFDO0lBRU0sNkJBQVEsR0FBZixVQUFnQixPQUFxQjtRQUNqQyxJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDMUMsQ0FBQztJQUVELDhDQUE4QztJQUN2Qyw0QkFBTyxHQUFkLFVBQWUsTUFBYztRQUE3QixpQkE0Q0M7UUEzQ0csSUFBSSxNQUFNLElBQUksTUFBTSxDQUFDLE9BQU8sS0FBSyxpQkFBaUIsRUFBRTtZQUNoRCxJQUFNLFlBQVUsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQztZQUM1QyxJQUFNLGVBQWEsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQztZQUNsRCxRQUFRLE1BQU0sQ0FBQyxTQUFTLEVBQUU7Z0JBQ3RCLEtBQUssaUJBQWlCLENBQUM7Z0JBQ3ZCLEtBQUssMEJBQTBCO29CQUMzQixNQUFNLENBQUMsTUFBTSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUU7b0JBQ2xDLE9BQU8sSUFBSSxDQUFDLHdCQUF3QixD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Q0FBQztxQkFDNUY7b0JBQ0QsSUFBSSxJQUFJLENBQUMsZUFBZSxDQUFDLGVBQWUsQ0FBQyxFQUFFLEVBQUMsc0JBQXNCO3dCQUM5RCxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsS0FBSSxDQUFDLHdCQUF3QixDQUFDLFFBQVEsQ0FBQyxhQUFhLEVBQUUsZUFBZSxDQUFDLFlBQVksQ0FBQzs2QkFDdEcsSUFBSSxDQUFDLFVBQUEsUUFBUTs0QkFDVixPQUFPLEtBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLGFBQWEsRUFBRSxlQUFlLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQzt3QkFDMUgsQ0FBQyxDQUFDLENBQUMsQ0FBQztxQkFDWDtnQkFDTCxDQUFDLENBQUMsQ0FBQzthQUNOO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFDSCxPQUFPLE9BQU8sQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsQ0FBQztJQUMzQyxDQUFDOztnQkFsSkosVUFBVTs7OztnQkFWRix3QkFBd0I7O0lBNkpqQyxpQkFBQztDQUFBLEFBbkpELElBbUpDO1NBbEpZLFVBQVUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IGlzRGVmaW5lZCwgbm9vcCB9IGZyb20gJ0B3bS9jb3JlJztcblxuaW1wb3J0IHsgQ2hhbmdlLCBGbHVzaENvbnRleHQsIFdvcmtlciB9IGZyb20gJy4vLi4vY2hhbmdlLWxvZy5zZXJ2aWNlJztcbmltcG9ydCB7IExvY2FsREJNYW5hZ2VtZW50U2VydmljZSB9IGZyb20gJy4vLi4vbG9jYWwtZGItbWFuYWdlbWVudC5zZXJ2aWNlJztcbmltcG9ydCB7IExvY2FsREJTdG9yZSB9IGZyb20gJy4vLi4vLi4vbW9kZWxzL2xvY2FsLWRiLXN0b3JlJztcblxuY29uc3QgU1RPUkVfS0VZICA9ICdpZENvbmZsaWN0UmVzb2x1dGlvbic7XG5cbi8qKlxuICogSW4gb2ZmbGluZSBkYXRhYmFzZSwgYSBpbnNlcnQgY291bGQgZ2VuZXJhdGUgdGhlIElkIG9mIGFuIGVudGl0eS4gRHVyaW5nIGZsdXNoLCBpZCBvZiB0aGF0IGVudGl0eSBtaWdodCBnZXQgY2hhbmdlZC5cbiAqIER1ZSB0byB0aGF0LCByZWxhdGlvbnNoaXAgaW5jb25zaXN0ZW5jeSBhcmlzZXMuIFRvIHByZXZlbnQgdGhhdCwgd2hlcmV2ZXIgdGhpcyBlbnRpdHkgaXMgcmVmZXJyZWQgaW4gdGhlIG5leHQgZmx1c2hcbiAqIGNhbGwsIElkIGhhcyB0byBiZSByZXBsYWNlZCB3aXRoIHRoYXQgb2YgbmV3IG9uZS5cbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIElkUmVzb2x2ZXIgaW1wbGVtZW50cyBXb3JrZXIge1xuXG4gICAgcHJpdmF0ZSBpZFN0b3JlO1xuICAgIHByaXZhdGUgbG9nZ2VyO1xuICAgIHByaXZhdGUgdHJhbnNhY3Rpb25Mb2NhbElkO1xuXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBsb2NhbERCTWFuYWdlbWVudFNlcnZpY2U6IExvY2FsREJNYW5hZ2VtZW50U2VydmljZSkge1xuICAgICAgICB0aGlzLmxvZ2dlciA9IHdpbmRvdy5jb25zb2xlO1xuICAgIH1cblxuICAgIHB1YmxpYyBwcmVGbHVzaChjb250ZXh0OiBGbHVzaENvbnRleHQpIHtcbiAgICAgICAgdGhpcy5pZFN0b3JlID0gY29udGV4dC5nZXQoU1RPUkVfS0VZKTtcbiAgICB9XG5cbiAgICAvLyBFeGNoYW5lIElkcywgQmVmb3JlIGFueSBkYXRhYmFzZSBvcGVyYXRpb24uXG4gICAgcHVibGljIHByZUNhbGwoY2hhbmdlOiBDaGFuZ2UpIHtcbiAgICAgICAgaWYgKGNoYW5nZSAmJiBjaGFuZ2Uuc2VydmljZSA9PT0gJ0RhdGFiYXNlU2VydmljZScpIHtcbiAgICAgICAgICAgIGNvbnN0IGVudGl0eU5hbWUgPSBjaGFuZ2UucGFyYW1zLmVudGl0eU5hbWU7XG4gICAgICAgICAgICBjb25zdCBkYXRhTW9kZWxOYW1lID0gY2hhbmdlLnBhcmFtcy5kYXRhTW9kZWxOYW1lO1xuICAgICAgICAgICAgc3dpdGNoIChjaGFuZ2Uub3BlcmF0aW9uKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnaW5zZXJ0VGFibGVEYXRhJzpcbiAgICAgICAgICAgICAgICBjYXNlICdpbnNlcnRNdWx0aVBhcnRUYWJsZURhdGEnOlxuICAgICAgICAgICAgICAgICAgICBjaGFuZ2UucGFyYW1zLnNraXBMb2NhbERCID0gdHJ1ZSA7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmxvY2FsREJNYW5hZ2VtZW50U2VydmljZS5nZXRTdG9yZShkYXRhTW9kZWxOYW1lLCBlbnRpdHlOYW1lKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oc3RvcmUgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHByaW1hcnlLZXlOYW1lID0gc3RvcmUucHJpbWFyeUtleU5hbWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHByaW1hcnlLZXlOYW1lKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudHJhbnNhY3Rpb25Mb2NhbElkID0gY2hhbmdlLnBhcmFtcy5kYXRhW3ByaW1hcnlLZXlOYW1lXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhbmdlWydkYXRhTG9jYWxJZCddID0gdGhpcy50cmFuc2FjdGlvbkxvY2FsSWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmV4Y2hhbmdlSWRzKHN0b3JlLCBkYXRhTW9kZWxOYW1lLCBlbnRpdHlOYW1lLCBjaGFuZ2UucGFyYW1zLmRhdGEpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzdG9yZS5wcmltYXJ5S2V5RmllbGQgJiYgc3RvcmUucHJpbWFyeUtleUZpZWxkLmdlbmVyYXRvclR5cGUgPT09ICdpZGVudGl0eScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgY2hhbmdlLnBhcmFtcy5kYXRhW3ByaW1hcnlLZXlOYW1lXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmVsYXRpb25hbFByaW1hcnlLZXlWYWx1ZSA9IHN0b3JlLmdldFZhbHVlKGNoYW5nZS5wYXJhbXMuZGF0YSwgc3RvcmUucHJpbWFyeUtleU5hbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGZvciB0aGUgZGF0YSByZWZlcnJpbmcgdG8gdGhlIHJlbGF0aW9uYWwgdGFibGUgYmFzZWQgb24gcHJpbWFyeSBrZXkgYXNzaWduIHRoZSBwcmltYXJ5RmllbGQgdmFsdWVzIHRvIHRoZSByZWxhdGlvbmFsUHJpbWFyeUtleVZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlzRGVmaW5lZChyZWxhdGlvbmFsUHJpbWFyeUtleVZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGFuZ2UucGFyYW1zLmRhdGFbcHJpbWFyeUtleU5hbWVdID0gcmVsYXRpb25hbFByaW1hcnlLZXlWYWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMudHJhbnNhY3Rpb25Mb2NhbElkICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnB1c2hJZFRvU3RvcmUoZGF0YU1vZGVsTmFtZSwgZW50aXR5TmFtZSwgdGhpcy50cmFuc2FjdGlvbkxvY2FsSWQsIHJlbGF0aW9uYWxQcmltYXJ5S2V5VmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudHJhbnNhY3Rpb25Mb2NhbElkID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGNhc2UgJ3VwZGF0ZVRhYmxlRGF0YSc6XG4gICAgICAgICAgICAgICAgY2FzZSAndXBkYXRlTXVsdGlQYXJ0VGFibGVEYXRhJzpcbiAgICAgICAgICAgICAgICBjYXNlICdkZWxldGVUYWJsZURhdGEnOlxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5sb2NhbERCTWFuYWdlbWVudFNlcnZpY2UuZ2V0U3RvcmUoZGF0YU1vZGVsTmFtZSwgZW50aXR5TmFtZSkudGhlbihzdG9yZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBvbiB1cGRhdGUgY2FsbCwgcGFzc2luZyBpZCB0byBleGNoYW5nZUlkIGFzIGNoYW5nZS5wYXJhbXMgaWQobG9jYWwgdmFsdWUgMTAwMDAwMDArKSBpcyBub3QgdXBkYXRlZCB3aXRoIHRoZSBsYXRlc3QgaWQgZnJvbSBkYlxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5leGNoYW5nZUlkKHN0b3JlLCBkYXRhTW9kZWxOYW1lLCBlbnRpdHlOYW1lLCBjaGFuZ2UucGFyYW1zLCAnaWQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGFuZ2UucGFyYW1zLmRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5leGNoYW5nZUlkcyhzdG9yZSwgZGF0YU1vZGVsTmFtZSwgZW50aXR5TmFtZSwgY2hhbmdlLnBhcmFtcy5kYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gQWZ0ZXIgZXZlcnkgZGF0YWJhc2UgaW5zZXJ0LCB0cmFjayB0aGUgSWQgY2hhbmdlLlxuICAgIHB1YmxpYyBwb3N0Q2FsbFN1Y2Nlc3MoY2hhbmdlOiBDaGFuZ2UsIHJlc3BvbnNlOiBhbnkpIHtcbiAgICAgICAgaWYgKGNoYW5nZSAmJiBjaGFuZ2Uuc2VydmljZSA9PT0gJ0RhdGFiYXNlU2VydmljZSdcbiAgICAgICAgICAgICYmIChjaGFuZ2Uub3BlcmF0aW9uID09PSAnaW5zZXJ0VGFibGVEYXRhJyB8fCBjaGFuZ2Uub3BlcmF0aW9uID09PSAnaW5zZXJ0TXVsdGlQYXJ0VGFibGVEYXRhJylcbiAgICAgICAgICAgICYmIHRoaXMudHJhbnNhY3Rpb25Mb2NhbElkKSB7XG4gICAgICAgICAgICBjb25zdCBkYXRhID0gcmVzcG9uc2VbMF0uYm9keTtcbiAgICAgICAgICAgIGNvbnN0IGVudGl0eU5hbWUgPSBjaGFuZ2UucGFyYW1zLmVudGl0eU5hbWU7XG4gICAgICAgICAgICBjb25zdCBkYXRhTW9kZWxOYW1lID0gY2hhbmdlLnBhcmFtcy5kYXRhTW9kZWxOYW1lO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMubG9jYWxEQk1hbmFnZW1lbnRTZXJ2aWNlLmdldFN0b3JlKGRhdGFNb2RlbE5hbWUsIGVudGl0eU5hbWUpLnRoZW4oc3RvcmUgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMucHVzaElkVG9TdG9yZShkYXRhTW9kZWxOYW1lLCBlbnRpdHlOYW1lLCB0aGlzLnRyYW5zYWN0aW9uTG9jYWxJZCwgZGF0YVtzdG9yZS5wcmltYXJ5S2V5TmFtZV0pO1xuICAgICAgICAgICAgICAgIHJldHVybiBzdG9yZS5kZWxldGUodGhpcy50cmFuc2FjdGlvbkxvY2FsSWQpLmNhdGNoKG5vb3ApLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRyYW5zYWN0aW9uTG9jYWxJZCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzdG9yZS5zYXZlKGRhdGEpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gc3RvcmUgZXJyb3IgZW50aXR5IGlkXG4gICAgcHVibGljIHBvc3RDYWxsRXJyb3IoY2hhbmdlOiBDaGFuZ2UpIHtcbiAgICAgICAgaWYgKGNoYW5nZSAmJiBjaGFuZ2Uuc2VydmljZSA9PT0gJ0RhdGFiYXNlU2VydmljZSdcbiAgICAgICAgICAgICYmIChjaGFuZ2Uub3BlcmF0aW9uID09PSAnaW5zZXJ0VGFibGVEYXRhJyB8fCBjaGFuZ2Uub3BlcmF0aW9uID09PSAnaW5zZXJ0TXVsdGlQYXJ0VGFibGVEYXRhJylcbiAgICAgICAgICAgICYmIHRoaXMudHJhbnNhY3Rpb25Mb2NhbElkKSB7XG4gICAgICAgICAgICBjb25zdCBlbnRpdHlOYW1lID0gY2hhbmdlLnBhcmFtcy5lbnRpdHlOYW1lO1xuICAgICAgICAgICAgY29uc3QgZGF0YU1vZGVsTmFtZSA9IGNoYW5nZS5wYXJhbXMuZGF0YU1vZGVsTmFtZTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmxvY2FsREJNYW5hZ2VtZW50U2VydmljZS5nZXRTdG9yZShkYXRhTW9kZWxOYW1lLCBlbnRpdHlOYW1lKS50aGVuKHN0b3JlID0+IHtcbiAgICAgICAgICAgICAgICBjaGFuZ2UucGFyYW1zLmRhdGFbc3RvcmUucHJpbWFyeUtleU5hbWVdID0gdGhpcy50cmFuc2FjdGlvbkxvY2FsSWQ7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0RW50aXR5SWRTdG9yZShkYXRhTW9kZWxOYW1lOiBzdHJpbmcsIGVudGl0eU5hbWU6IHN0cmluZykge1xuICAgICAgICB0aGlzLmlkU3RvcmVbZGF0YU1vZGVsTmFtZV0gPSB0aGlzLmlkU3RvcmVbZGF0YU1vZGVsTmFtZV0gfHwge307XG4gICAgICAgIHRoaXMuaWRTdG9yZVtkYXRhTW9kZWxOYW1lXVtlbnRpdHlOYW1lXSA9IHRoaXMuaWRTdG9yZVtkYXRhTW9kZWxOYW1lXVtlbnRpdHlOYW1lXSB8fCB7fTtcbiAgICAgICAgcmV0dXJuIHRoaXMuaWRTdG9yZVtkYXRhTW9kZWxOYW1lXVtlbnRpdHlOYW1lXTtcbiAgICB9XG5cbiAgICAvLyBpZiBsb2NhbCBpZCBpcyBkaWZmZXJlbnQsIHRoZW4gY3JlYXRlIGEgbWFwcGluZyBmb3IgZXhjaGFuZ2UuXG4gICAgcHJpdmF0ZSBwdXNoSWRUb1N0b3JlKGRhdGFNb2RlbE5hbWU6IHN0cmluZywgZW50aXR5TmFtZTogc3RyaW5nLCB0cmFuc2FjdGlvbkxvY2FsSWQ6IGFueSwgcmVtb3RlSWQ6IGFueSkge1xuICAgICAgICBpZiAodHJhbnNhY3Rpb25Mb2NhbElkICE9PSByZW1vdGVJZCkge1xuICAgICAgICAgICAgdGhpcy5nZXRFbnRpdHlJZFN0b3JlKGRhdGFNb2RlbE5hbWUsIGVudGl0eU5hbWUpW3RyYW5zYWN0aW9uTG9jYWxJZF0gPSByZW1vdGVJZDtcbiAgICAgICAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdDb25mbGljdCBmb3VuZCBmb3IgZW50aXR5ICglcykgd2l0aCBsb2NhbCBpZCAoJWkpIGFuZCByZW1vdGUgSWQgKCVpKScsIGVudGl0eU5hbWUsIHRyYW5zYWN0aW9uTG9jYWxJZCwgcmVtb3RlSWQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBsb2dSZXNvbHV0aW9uKGVudGl0eU5hbWU6IHN0cmluZywgbG9jYWxJZDogYW55LCByZW1vdGVJZDogYW55KSB7XG4gICAgICAgIHRoaXMubG9nZ2VyLmRlYnVnKCdDb25mbGljdCByZXNvbHZlZCBmb3VuZCBmb3IgZW50aXR5ICglcykgd2l0aCBsb2NhbCBpZCAoJWkpIGFuZCByZW1vdGUgSWQgKCVpKScsIGVudGl0eU5hbWUsIGxvY2FsSWQsIHJlbW90ZUlkKTtcbiAgICB9XG5cbiAgICAvLyBFeGNoYW5nZSBwcmltYXJ5IGtleSAgb2YgdGhlIGdpdmVuIGVudGl0eVxuICAgIHByaXZhdGUgZXhjaGFuZ2VJZChzdG9yZTogTG9jYWxEQlN0b3JlLCBkYXRhTW9kZWxOYW1lOiBzdHJpbmcsIGVudGl0eU5hbWU6IHN0cmluZywgZGF0YT86IGFueSwga2V5TmFtZT86IHN0cmluZykge1xuICAgICAgICBjb25zdCBwcmltYXJ5S2V5TmFtZSA9IGtleU5hbWUgfHwgc3RvcmUucHJpbWFyeUtleU5hbWU7XG4gICAgICAgIGNvbnN0IGVudGl0eUlkU3RvcmUgPSB0aGlzLmdldEVudGl0eUlkU3RvcmUoZGF0YU1vZGVsTmFtZSwgZW50aXR5TmFtZSk7XG4gICAgICAgIGlmIChkYXRhICYmIHByaW1hcnlLZXlOYW1lKSB7XG4gICAgICAgICAgICBjb25zdCBsb2NhbElkID0gZGF0YVtwcmltYXJ5S2V5TmFtZV07XG4gICAgICAgICAgICBsZXQgcmVtb3RlSWQgPSBsb2NhbElkO1xuICAgICAgICAgICAgd2hpbGUgKGVudGl0eUlkU3RvcmVbcmVtb3RlSWRdKSB7XG4gICAgICAgICAgICAgICAgcmVtb3RlSWQgPSBlbnRpdHlJZFN0b3JlW3JlbW90ZUlkXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChyZW1vdGVJZCAhPT0gbG9jYWxJZCkge1xuICAgICAgICAgICAgICAgIGRhdGFbcHJpbWFyeUtleU5hbWVdID0gcmVtb3RlSWQ7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2dSZXNvbHV0aW9uKGVudGl0eU5hbWUsIGxvY2FsSWQsIHJlbW90ZUlkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIExvb2tzIHByaW1hcnkga2V5IGNoYW5nZXMgaW4gdGhlIGdpdmVuIGVudGl0eSBvciBpbiB0aGUgcmVsYXRpb25zXG4gICAgcHJpdmF0ZSBleGNoYW5nZUlkcyhzdG9yZTogTG9jYWxEQlN0b3JlLCBkYXRhTW9kZWxOYW1lOiBzdHJpbmcsIGVudGl0eU5hbWU6IHN0cmluZywgZGF0YTogYW55KTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgdGhpcy5leGNoYW5nZUlkKHN0b3JlLCBkYXRhTW9kZWxOYW1lLCBlbnRpdHlOYW1lLCBkYXRhKTtcbiAgICAgICAgY29uc3QgZXhjaGFuZ2VJZFByb21pc2VzID0gW107XG4gICAgICAgIHN0b3JlLmVudGl0eVNjaGVtYS5jb2x1bW5zLmZvckVhY2goY29sID0+IHtcbiAgICAgICAgICAgIGlmIChjb2wuZm9yZWlnblJlbGF0aW9ucykge1xuICAgICAgICAgICAgICAgIGNvbC5mb3JlaWduUmVsYXRpb25zLmZvckVhY2goIGZvcmVpZ25SZWxhdGlvbiA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkYXRhW2NvbC5maWVsZE5hbWVdKSB7Ly8gaWYgaWQgdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZXhjaGFuZ2VJZChzdG9yZSwgZGF0YU1vZGVsTmFtZSwgZm9yZWlnblJlbGF0aW9uLnRhcmdldEVudGl0eSwgZGF0YSwgY29sLmZpZWxkTmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGFbZm9yZWlnblJlbGF0aW9uLnNvdXJjZUZpZWxkTmFtZV0pIHsvLyBpZiBvYmplY3QgcmVmZXJlbmNlXG4gICAgICAgICAgICAgICAgICAgICAgICBleGNoYW5nZUlkUHJvbWlzZXMucHVzaCh0aGlzLmxvY2FsREJNYW5hZ2VtZW50U2VydmljZS5nZXRTdG9yZShkYXRhTW9kZWxOYW1lLCBmb3JlaWduUmVsYXRpb24udGFyZ2V0RW50aXR5KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKHJlZlN0b3JlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZXhjaGFuZ2VJZHMocmVmU3RvcmUsIGRhdGFNb2RlbE5hbWUsIGZvcmVpZ25SZWxhdGlvbi50YXJnZXRFbnRpdHksIGRhdGFbZm9yZWlnblJlbGF0aW9uLnNvdXJjZUZpZWxkTmFtZV0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIFByb21pc2UuYWxsKGV4Y2hhbmdlSWRQcm9taXNlcyk7XG4gICAgfVxufVxuIl19