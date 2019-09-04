import { Injectable } from '@angular/core';
import { isDefined, noop } from '@wm/core';
import { LocalDBManagementService } from './../local-db-management.service';
const STORE_KEY = 'idConflictResolution';
/**
 * In offline database, a insert could generate the Id of an entity. During flush, id of that entity might get changed.
 * Due to that, relationship inconsistency arises. To prevent that, wherever this entity is referred in the next flush
 * call, Id has to be replaced with that of new one.
 */
export class IdResolver {
    constructor(localDBManagementService) {
        this.localDBManagementService = localDBManagementService;
        this.logger = window.console;
    }
    preFlush(context) {
        this.idStore = context.get(STORE_KEY);
    }
    // Exchane Ids, Before any database operation.
    preCall(change) {
        if (change && change.service === 'DatabaseService') {
            const entityName = change.params.entityName;
            const dataModelName = change.params.dataModelName;
            switch (change.operation) {
                case 'insertTableData':
                case 'insertMultiPartTableData':
                    change.params.skipLocalDB = true;
                    return this.localDBManagementService.getStore(dataModelName, entityName)
                        .then(store => {
                        const primaryKeyName = store.primaryKeyName;
                        if (primaryKeyName) {
                            this.transactionLocalId = change.params.data[primaryKeyName];
                            change['dataLocalId'] = this.transactionLocalId;
                        }
                        return this.exchangeIds(store, dataModelName, entityName, change.params.data)
                            .then(() => {
                            if (store.primaryKeyField && store.primaryKeyField.generatorType === 'identity') {
                                delete change.params.data[primaryKeyName];
                            }
                            else {
                                const relationalPrimaryKeyValue = store.getValue(change.params.data, store.primaryKeyName);
                                // for the data referring to the relational table based on primary key assign the primaryField values to the relationalPrimaryKeyValue
                                if (isDefined(relationalPrimaryKeyValue)) {
                                    change.params.data[primaryKeyName] = relationalPrimaryKeyValue;
                                    if (this.transactionLocalId !== null) {
                                        this.pushIdToStore(dataModelName, entityName, this.transactionLocalId, relationalPrimaryKeyValue);
                                    }
                                }
                                this.transactionLocalId = null;
                            }
                        });
                    });
                case 'updateTableData':
                case 'updateMultiPartTableData':
                case 'deleteTableData':
                    return this.localDBManagementService.getStore(dataModelName, entityName).then(store => {
                        // on update call, passing id to exchangeId as change.params id(local value 10000000+) is not updated with the latest id from db
                        this.exchangeId(store, dataModelName, entityName, change.params, 'id');
                        if (change.params.data) {
                            return this.exchangeIds(store, dataModelName, entityName, change.params.data);
                        }
                    });
            }
        }
    }
    // After every database insert, track the Id change.
    postCallSuccess(change, response) {
        if (change && change.service === 'DatabaseService'
            && (change.operation === 'insertTableData' || change.operation === 'insertMultiPartTableData')
            && this.transactionLocalId) {
            const data = response[0].body;
            const entityName = change.params.entityName;
            const dataModelName = change.params.dataModelName;
            return this.localDBManagementService.getStore(dataModelName, entityName).then(store => {
                this.pushIdToStore(dataModelName, entityName, this.transactionLocalId, data[store.primaryKeyName]);
                return store.delete(this.transactionLocalId).catch(noop).then(() => {
                    this.transactionLocalId = null;
                    return store.save(data);
                });
            });
        }
    }
    // store error entity id
    postCallError(change) {
        if (change && change.service === 'DatabaseService'
            && (change.operation === 'insertTableData' || change.operation === 'insertMultiPartTableData')
            && this.transactionLocalId) {
            const entityName = change.params.entityName;
            const dataModelName = change.params.dataModelName;
            return this.localDBManagementService.getStore(dataModelName, entityName).then(store => {
                change.params.data[store.primaryKeyName] = this.transactionLocalId;
            });
        }
    }
    getEntityIdStore(dataModelName, entityName) {
        this.idStore[dataModelName] = this.idStore[dataModelName] || {};
        this.idStore[dataModelName][entityName] = this.idStore[dataModelName][entityName] || {};
        return this.idStore[dataModelName][entityName];
    }
    // if local id is different, then create a mapping for exchange.
    pushIdToStore(dataModelName, entityName, transactionLocalId, remoteId) {
        if (transactionLocalId !== remoteId) {
            this.getEntityIdStore(dataModelName, entityName)[transactionLocalId] = remoteId;
            this.logger.debug('Conflict found for entity (%s) with local id (%i) and remote Id (%i)', entityName, transactionLocalId, remoteId);
        }
    }
    logResolution(entityName, localId, remoteId) {
        this.logger.debug('Conflict resolved found for entity (%s) with local id (%i) and remote Id (%i)', entityName, localId, remoteId);
    }
    // Exchange primary key  of the given entity
    exchangeId(store, dataModelName, entityName, data, keyName) {
        const primaryKeyName = keyName || store.primaryKeyName;
        const entityIdStore = this.getEntityIdStore(dataModelName, entityName);
        if (data && primaryKeyName) {
            const localId = data[primaryKeyName];
            let remoteId = localId;
            while (entityIdStore[remoteId]) {
                remoteId = entityIdStore[remoteId];
            }
            if (remoteId !== localId) {
                data[primaryKeyName] = remoteId;
                this.logResolution(entityName, localId, remoteId);
            }
        }
    }
    // Looks primary key changes in the given entity or in the relations
    exchangeIds(store, dataModelName, entityName, data) {
        this.exchangeId(store, dataModelName, entityName, data);
        const exchangeIdPromises = [];
        store.entitySchema.columns.forEach(col => {
            if (col.foreignRelations) {
                col.foreignRelations.forEach(foreignRelation => {
                    if (data[col.fieldName]) { // if id value
                        this.exchangeId(store, dataModelName, foreignRelation.targetEntity, data, col.fieldName);
                    }
                    if (data[foreignRelation.sourceFieldName]) { // if object reference
                        exchangeIdPromises.push(this.localDBManagementService.getStore(dataModelName, foreignRelation.targetEntity)
                            .then(refStore => {
                            return this.exchangeIds(refStore, dataModelName, foreignRelation.targetEntity, data[foreignRelation.sourceFieldName]);
                        }));
                    }
                });
            }
        });
        return Promise.all(exchangeIdPromises);
    }
}
IdResolver.decorators = [
    { type: Injectable }
];
/** @nocollapse */
IdResolver.ctorParameters = () => [
    { type: LocalDBManagementService }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWQtcmVzb2x2ZXIuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vbW9iaWxlL29mZmxpbmUvIiwic291cmNlcyI6WyJzZXJ2aWNlcy93b3JrZXJzL2lkLXJlc29sdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFM0MsT0FBTyxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFHM0MsT0FBTyxFQUFFLHdCQUF3QixFQUFFLE1BQU0sa0NBQWtDLENBQUM7QUFHNUUsTUFBTSxTQUFTLEdBQUksc0JBQXNCLENBQUM7QUFFMUM7Ozs7R0FJRztBQUVILE1BQU0sT0FBTyxVQUFVO0lBTW5CLFlBQW9CLHdCQUFrRDtRQUFsRCw2QkFBd0IsR0FBeEIsd0JBQXdCLENBQTBCO1FBQ2xFLElBQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQztJQUNqQyxDQUFDO0lBRU0sUUFBUSxDQUFDLE9BQXFCO1FBQ2pDLElBQUksQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUMxQyxDQUFDO0lBRUQsOENBQThDO0lBQ3ZDLE9BQU8sQ0FBQyxNQUFjO1FBQ3pCLElBQUksTUFBTSxJQUFJLE1BQU0sQ0FBQyxPQUFPLEtBQUssaUJBQWlCLEVBQUU7WUFDaEQsTUFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUM7WUFDNUMsTUFBTSxhQUFhLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUM7WUFDbEQsUUFBUSxNQUFNLENBQUMsU0FBUyxFQUFFO2dCQUN0QixLQUFLLGlCQUFpQixDQUFDO2dCQUN2QixLQUFLLDBCQUEwQjtvQkFDM0IsTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFFO29CQUNsQyxPQUFPLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxRQUFRLENB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QyxFQUFFLEVBQUMsc0JBQXNCO3dCQUM5RCxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLHdCQUF3QixDQUFDLFFBQVEsQ0FBQyxhQUFhLEVBQUUsZUFBZSxDQUFDLFlBQVksQ0FBQzs2QkFDdEcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFOzRCQUNiLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsYUFBYSxFQUFFLGVBQWUsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO3dCQUMxSCxDQUFDLENBQUMsQ0FBQyxDQUFDO3FCQUNYO2dCQUNMLENBQUMsQ0FBQyxDQUFDO2FBQ047UUFDTCxDQUFDLENBQUMsQ0FBQztRQUNILE9BQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0lBQzNDLENBQUM7OztZQWxKSixVQUFVOzs7O1lBVkYsd0JBQXdCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBpc0RlZmluZWQsIG5vb3AgfSBmcm9tICdAd20vY29yZSc7XG5cbmltcG9ydCB7IENoYW5nZSwgRmx1c2hDb250ZXh0LCBXb3JrZXIgfSBmcm9tICcuLy4uL2NoYW5nZS1sb2cuc2VydmljZSc7XG5pbXBvcnQgeyBMb2NhbERCTWFuYWdlbWVudFNlcnZpY2UgfSBmcm9tICcuLy4uL2xvY2FsLWRiLW1hbmFnZW1lbnQuc2VydmljZSc7XG5pbXBvcnQgeyBMb2NhbERCU3RvcmUgfSBmcm9tICcuLy4uLy4uL21vZGVscy9sb2NhbC1kYi1zdG9yZSc7XG5cbmNvbnN0IFNUT1JFX0tFWSAgPSAnaWRDb25mbGljdFJlc29sdXRpb24nO1xuXG4vKipcbiAqIEluIG9mZmxpbmUgZGF0YWJhc2UsIGEgaW5zZXJ0IGNvdWxkIGdlbmVyYXRlIHRoZSBJZCBvZiBhbiBlbnRpdHkuIER1cmluZyBmbHVzaCwgaWQgb2YgdGhhdCBlbnRpdHkgbWlnaHQgZ2V0IGNoYW5nZWQuXG4gKiBEdWUgdG8gdGhhdCwgcmVsYXRpb25zaGlwIGluY29uc2lzdGVuY3kgYXJpc2VzLiBUbyBwcmV2ZW50IHRoYXQsIHdoZXJldmVyIHRoaXMgZW50aXR5IGlzIHJlZmVycmVkIGluIHRoZSBuZXh0IGZsdXNoXG4gKiBjYWxsLCBJZCBoYXMgdG8gYmUgcmVwbGFjZWQgd2l0aCB0aGF0IG9mIG5ldyBvbmUuXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBJZFJlc29sdmVyIGltcGxlbWVudHMgV29ya2VyIHtcblxuICAgIHByaXZhdGUgaWRTdG9yZTtcbiAgICBwcml2YXRlIGxvZ2dlcjtcbiAgICBwcml2YXRlIHRyYW5zYWN0aW9uTG9jYWxJZDtcblxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgbG9jYWxEQk1hbmFnZW1lbnRTZXJ2aWNlOiBMb2NhbERCTWFuYWdlbWVudFNlcnZpY2UpIHtcbiAgICAgICAgdGhpcy5sb2dnZXIgPSB3aW5kb3cuY29uc29sZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgcHJlRmx1c2goY29udGV4dDogRmx1c2hDb250ZXh0KSB7XG4gICAgICAgIHRoaXMuaWRTdG9yZSA9IGNvbnRleHQuZ2V0KFNUT1JFX0tFWSk7XG4gICAgfVxuXG4gICAgLy8gRXhjaGFuZSBJZHMsIEJlZm9yZSBhbnkgZGF0YWJhc2Ugb3BlcmF0aW9uLlxuICAgIHB1YmxpYyBwcmVDYWxsKGNoYW5nZTogQ2hhbmdlKSB7XG4gICAgICAgIGlmIChjaGFuZ2UgJiYgY2hhbmdlLnNlcnZpY2UgPT09ICdEYXRhYmFzZVNlcnZpY2UnKSB7XG4gICAgICAgICAgICBjb25zdCBlbnRpdHlOYW1lID0gY2hhbmdlLnBhcmFtcy5lbnRpdHlOYW1lO1xuICAgICAgICAgICAgY29uc3QgZGF0YU1vZGVsTmFtZSA9IGNoYW5nZS5wYXJhbXMuZGF0YU1vZGVsTmFtZTtcbiAgICAgICAgICAgIHN3aXRjaCAoY2hhbmdlLm9wZXJhdGlvbikge1xuICAgICAgICAgICAgICAgIGNhc2UgJ2luc2VydFRhYmxlRGF0YSc6XG4gICAgICAgICAgICAgICAgY2FzZSAnaW5zZXJ0TXVsdGlQYXJ0VGFibGVEYXRhJzpcbiAgICAgICAgICAgICAgICAgICAgY2hhbmdlLnBhcmFtcy5za2lwTG9jYWxEQiA9IHRydWUgO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5sb2NhbERCTWFuYWdlbWVudFNlcnZpY2UuZ2V0U3RvcmUoZGF0YU1vZGVsTmFtZSwgZW50aXR5TmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKHN0b3JlID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBwcmltYXJ5S2V5TmFtZSA9IHN0b3JlLnByaW1hcnlLZXlOYW1lO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwcmltYXJ5S2V5TmFtZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRyYW5zYWN0aW9uTG9jYWxJZCA9IGNoYW5nZS5wYXJhbXMuZGF0YVtwcmltYXJ5S2V5TmFtZV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoYW5nZVsnZGF0YUxvY2FsSWQnXSA9IHRoaXMudHJhbnNhY3Rpb25Mb2NhbElkO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5leGNoYW5nZUlkcyhzdG9yZSwgZGF0YU1vZGVsTmFtZSwgZW50aXR5TmFtZSwgY2hhbmdlLnBhcmFtcy5kYXRhKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3RvcmUucHJpbWFyeUtleUZpZWxkICYmIHN0b3JlLnByaW1hcnlLZXlGaWVsZC5nZW5lcmF0b3JUeXBlID09PSAnaWRlbnRpdHknKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIGNoYW5nZS5wYXJhbXMuZGF0YVtwcmltYXJ5S2V5TmFtZV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJlbGF0aW9uYWxQcmltYXJ5S2V5VmFsdWUgPSBzdG9yZS5nZXRWYWx1ZShjaGFuZ2UucGFyYW1zLmRhdGEsIHN0b3JlLnByaW1hcnlLZXlOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBmb3IgdGhlIGRhdGEgcmVmZXJyaW5nIHRvIHRoZSByZWxhdGlvbmFsIHRhYmxlIGJhc2VkIG9uIHByaW1hcnkga2V5IGFzc2lnbiB0aGUgcHJpbWFyeUZpZWxkIHZhbHVlcyB0byB0aGUgcmVsYXRpb25hbFByaW1hcnlLZXlWYWx1ZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc0RlZmluZWQocmVsYXRpb25hbFByaW1hcnlLZXlWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhbmdlLnBhcmFtcy5kYXRhW3ByaW1hcnlLZXlOYW1lXSA9IHJlbGF0aW9uYWxQcmltYXJ5S2V5VmFsdWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0aGlzLnRyYW5zYWN0aW9uTG9jYWxJZCAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wdXNoSWRUb1N0b3JlKGRhdGFNb2RlbE5hbWUsIGVudGl0eU5hbWUsIHRoaXMudHJhbnNhY3Rpb25Mb2NhbElkLCByZWxhdGlvbmFsUHJpbWFyeUtleVZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRyYW5zYWN0aW9uTG9jYWxJZCA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBjYXNlICd1cGRhdGVUYWJsZURhdGEnOlxuICAgICAgICAgICAgICAgIGNhc2UgJ3VwZGF0ZU11bHRpUGFydFRhYmxlRGF0YSc6XG4gICAgICAgICAgICAgICAgY2FzZSAnZGVsZXRlVGFibGVEYXRhJzpcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMubG9jYWxEQk1hbmFnZW1lbnRTZXJ2aWNlLmdldFN0b3JlKGRhdGFNb2RlbE5hbWUsIGVudGl0eU5hbWUpLnRoZW4oc3RvcmUgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gb24gdXBkYXRlIGNhbGwsIHBhc3NpbmcgaWQgdG8gZXhjaGFuZ2VJZCBhcyBjaGFuZ2UucGFyYW1zIGlkKGxvY2FsIHZhbHVlIDEwMDAwMDAwKykgaXMgbm90IHVwZGF0ZWQgd2l0aCB0aGUgbGF0ZXN0IGlkIGZyb20gZGJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuZXhjaGFuZ2VJZChzdG9yZSwgZGF0YU1vZGVsTmFtZSwgZW50aXR5TmFtZSwgY2hhbmdlLnBhcmFtcywgJ2lkJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2hhbmdlLnBhcmFtcy5kYXRhKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZXhjaGFuZ2VJZHMoc3RvcmUsIGRhdGFNb2RlbE5hbWUsIGVudGl0eU5hbWUsIGNoYW5nZS5wYXJhbXMuZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIC8vIEFmdGVyIGV2ZXJ5IGRhdGFiYXNlIGluc2VydCwgdHJhY2sgdGhlIElkIGNoYW5nZS5cbiAgICBwdWJsaWMgcG9zdENhbGxTdWNjZXNzKGNoYW5nZTogQ2hhbmdlLCByZXNwb25zZTogYW55KSB7XG4gICAgICAgIGlmIChjaGFuZ2UgJiYgY2hhbmdlLnNlcnZpY2UgPT09ICdEYXRhYmFzZVNlcnZpY2UnXG4gICAgICAgICAgICAmJiAoY2hhbmdlLm9wZXJhdGlvbiA9PT0gJ2luc2VydFRhYmxlRGF0YScgfHwgY2hhbmdlLm9wZXJhdGlvbiA9PT0gJ2luc2VydE11bHRpUGFydFRhYmxlRGF0YScpXG4gICAgICAgICAgICAmJiB0aGlzLnRyYW5zYWN0aW9uTG9jYWxJZCkge1xuICAgICAgICAgICAgY29uc3QgZGF0YSA9IHJlc3BvbnNlWzBdLmJvZHk7XG4gICAgICAgICAgICBjb25zdCBlbnRpdHlOYW1lID0gY2hhbmdlLnBhcmFtcy5lbnRpdHlOYW1lO1xuICAgICAgICAgICAgY29uc3QgZGF0YU1vZGVsTmFtZSA9IGNoYW5nZS5wYXJhbXMuZGF0YU1vZGVsTmFtZTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmxvY2FsREJNYW5hZ2VtZW50U2VydmljZS5nZXRTdG9yZShkYXRhTW9kZWxOYW1lLCBlbnRpdHlOYW1lKS50aGVuKHN0b3JlID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnB1c2hJZFRvU3RvcmUoZGF0YU1vZGVsTmFtZSwgZW50aXR5TmFtZSwgdGhpcy50cmFuc2FjdGlvbkxvY2FsSWQsIGRhdGFbc3RvcmUucHJpbWFyeUtleU5hbWVdKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gc3RvcmUuZGVsZXRlKHRoaXMudHJhbnNhY3Rpb25Mb2NhbElkKS5jYXRjaChub29wKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50cmFuc2FjdGlvbkxvY2FsSWQgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RvcmUuc2F2ZShkYXRhKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8vIHN0b3JlIGVycm9yIGVudGl0eSBpZFxuICAgIHB1YmxpYyBwb3N0Q2FsbEVycm9yKGNoYW5nZTogQ2hhbmdlKSB7XG4gICAgICAgIGlmIChjaGFuZ2UgJiYgY2hhbmdlLnNlcnZpY2UgPT09ICdEYXRhYmFzZVNlcnZpY2UnXG4gICAgICAgICAgICAmJiAoY2hhbmdlLm9wZXJhdGlvbiA9PT0gJ2luc2VydFRhYmxlRGF0YScgfHwgY2hhbmdlLm9wZXJhdGlvbiA9PT0gJ2luc2VydE11bHRpUGFydFRhYmxlRGF0YScpXG4gICAgICAgICAgICAmJiB0aGlzLnRyYW5zYWN0aW9uTG9jYWxJZCkge1xuICAgICAgICAgICAgY29uc3QgZW50aXR5TmFtZSA9IGNoYW5nZS5wYXJhbXMuZW50aXR5TmFtZTtcbiAgICAgICAgICAgIGNvbnN0IGRhdGFNb2RlbE5hbWUgPSBjaGFuZ2UucGFyYW1zLmRhdGFNb2RlbE5hbWU7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5sb2NhbERCTWFuYWdlbWVudFNlcnZpY2UuZ2V0U3RvcmUoZGF0YU1vZGVsTmFtZSwgZW50aXR5TmFtZSkudGhlbihzdG9yZSA9PiB7XG4gICAgICAgICAgICAgICAgY2hhbmdlLnBhcmFtcy5kYXRhW3N0b3JlLnByaW1hcnlLZXlOYW1lXSA9IHRoaXMudHJhbnNhY3Rpb25Mb2NhbElkO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGdldEVudGl0eUlkU3RvcmUoZGF0YU1vZGVsTmFtZTogc3RyaW5nLCBlbnRpdHlOYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5pZFN0b3JlW2RhdGFNb2RlbE5hbWVdID0gdGhpcy5pZFN0b3JlW2RhdGFNb2RlbE5hbWVdIHx8IHt9O1xuICAgICAgICB0aGlzLmlkU3RvcmVbZGF0YU1vZGVsTmFtZV1bZW50aXR5TmFtZV0gPSB0aGlzLmlkU3RvcmVbZGF0YU1vZGVsTmFtZV1bZW50aXR5TmFtZV0gfHwge307XG4gICAgICAgIHJldHVybiB0aGlzLmlkU3RvcmVbZGF0YU1vZGVsTmFtZV1bZW50aXR5TmFtZV07XG4gICAgfVxuXG4gICAgLy8gaWYgbG9jYWwgaWQgaXMgZGlmZmVyZW50LCB0aGVuIGNyZWF0ZSBhIG1hcHBpbmcgZm9yIGV4Y2hhbmdlLlxuICAgIHByaXZhdGUgcHVzaElkVG9TdG9yZShkYXRhTW9kZWxOYW1lOiBzdHJpbmcsIGVudGl0eU5hbWU6IHN0cmluZywgdHJhbnNhY3Rpb25Mb2NhbElkOiBhbnksIHJlbW90ZUlkOiBhbnkpIHtcbiAgICAgICAgaWYgKHRyYW5zYWN0aW9uTG9jYWxJZCAhPT0gcmVtb3RlSWQpIHtcbiAgICAgICAgICAgIHRoaXMuZ2V0RW50aXR5SWRTdG9yZShkYXRhTW9kZWxOYW1lLCBlbnRpdHlOYW1lKVt0cmFuc2FjdGlvbkxvY2FsSWRdID0gcmVtb3RlSWQ7XG4gICAgICAgICAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnQ29uZmxpY3QgZm91bmQgZm9yIGVudGl0eSAoJXMpIHdpdGggbG9jYWwgaWQgKCVpKSBhbmQgcmVtb3RlIElkICglaSknLCBlbnRpdHlOYW1lLCB0cmFuc2FjdGlvbkxvY2FsSWQsIHJlbW90ZUlkKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgbG9nUmVzb2x1dGlvbihlbnRpdHlOYW1lOiBzdHJpbmcsIGxvY2FsSWQ6IGFueSwgcmVtb3RlSWQ6IGFueSkge1xuICAgICAgICB0aGlzLmxvZ2dlci5kZWJ1ZygnQ29uZmxpY3QgcmVzb2x2ZWQgZm91bmQgZm9yIGVudGl0eSAoJXMpIHdpdGggbG9jYWwgaWQgKCVpKSBhbmQgcmVtb3RlIElkICglaSknLCBlbnRpdHlOYW1lLCBsb2NhbElkLCByZW1vdGVJZCk7XG4gICAgfVxuXG4gICAgLy8gRXhjaGFuZ2UgcHJpbWFyeSBrZXkgIG9mIHRoZSBnaXZlbiBlbnRpdHlcbiAgICBwcml2YXRlIGV4Y2hhbmdlSWQoc3RvcmU6IExvY2FsREJTdG9yZSwgZGF0YU1vZGVsTmFtZTogc3RyaW5nLCBlbnRpdHlOYW1lOiBzdHJpbmcsIGRhdGE/OiBhbnksIGtleU5hbWU/OiBzdHJpbmcpIHtcbiAgICAgICAgY29uc3QgcHJpbWFyeUtleU5hbWUgPSBrZXlOYW1lIHx8IHN0b3JlLnByaW1hcnlLZXlOYW1lO1xuICAgICAgICBjb25zdCBlbnRpdHlJZFN0b3JlID0gdGhpcy5nZXRFbnRpdHlJZFN0b3JlKGRhdGFNb2RlbE5hbWUsIGVudGl0eU5hbWUpO1xuICAgICAgICBpZiAoZGF0YSAmJiBwcmltYXJ5S2V5TmFtZSkge1xuICAgICAgICAgICAgY29uc3QgbG9jYWxJZCA9IGRhdGFbcHJpbWFyeUtleU5hbWVdO1xuICAgICAgICAgICAgbGV0IHJlbW90ZUlkID0gbG9jYWxJZDtcbiAgICAgICAgICAgIHdoaWxlIChlbnRpdHlJZFN0b3JlW3JlbW90ZUlkXSkge1xuICAgICAgICAgICAgICAgIHJlbW90ZUlkID0gZW50aXR5SWRTdG9yZVtyZW1vdGVJZF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAocmVtb3RlSWQgIT09IGxvY2FsSWQpIHtcbiAgICAgICAgICAgICAgICBkYXRhW3ByaW1hcnlLZXlOYW1lXSA9IHJlbW90ZUlkO1xuICAgICAgICAgICAgICAgIHRoaXMubG9nUmVzb2x1dGlvbihlbnRpdHlOYW1lLCBsb2NhbElkLCByZW1vdGVJZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBMb29rcyBwcmltYXJ5IGtleSBjaGFuZ2VzIGluIHRoZSBnaXZlbiBlbnRpdHkgb3IgaW4gdGhlIHJlbGF0aW9uc1xuICAgIHByaXZhdGUgZXhjaGFuZ2VJZHMoc3RvcmU6IExvY2FsREJTdG9yZSwgZGF0YU1vZGVsTmFtZTogc3RyaW5nLCBlbnRpdHlOYW1lOiBzdHJpbmcsIGRhdGE6IGFueSk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIHRoaXMuZXhjaGFuZ2VJZChzdG9yZSwgZGF0YU1vZGVsTmFtZSwgZW50aXR5TmFtZSwgZGF0YSk7XG4gICAgICAgIGNvbnN0IGV4Y2hhbmdlSWRQcm9taXNlcyA9IFtdO1xuICAgICAgICBzdG9yZS5lbnRpdHlTY2hlbWEuY29sdW1ucy5mb3JFYWNoKGNvbCA9PiB7XG4gICAgICAgICAgICBpZiAoY29sLmZvcmVpZ25SZWxhdGlvbnMpIHtcbiAgICAgICAgICAgICAgICBjb2wuZm9yZWlnblJlbGF0aW9ucy5mb3JFYWNoKCBmb3JlaWduUmVsYXRpb24gPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YVtjb2wuZmllbGROYW1lXSkgey8vIGlmIGlkIHZhbHVlXG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmV4Y2hhbmdlSWQoc3RvcmUsIGRhdGFNb2RlbE5hbWUsIGZvcmVpZ25SZWxhdGlvbi50YXJnZXRFbnRpdHksIGRhdGEsIGNvbC5maWVsZE5hbWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChkYXRhW2ZvcmVpZ25SZWxhdGlvbi5zb3VyY2VGaWVsZE5hbWVdKSB7Ly8gaWYgb2JqZWN0IHJlZmVyZW5jZVxuICAgICAgICAgICAgICAgICAgICAgICAgZXhjaGFuZ2VJZFByb21pc2VzLnB1c2godGhpcy5sb2NhbERCTWFuYWdlbWVudFNlcnZpY2UuZ2V0U3RvcmUoZGF0YU1vZGVsTmFtZSwgZm9yZWlnblJlbGF0aW9uLnRhcmdldEVudGl0eSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbihyZWZTdG9yZSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmV4Y2hhbmdlSWRzKHJlZlN0b3JlLCBkYXRhTW9kZWxOYW1lLCBmb3JlaWduUmVsYXRpb24udGFyZ2V0RW50aXR5LCBkYXRhW2ZvcmVpZ25SZWxhdGlvbi5zb3VyY2VGaWVsZE5hbWVdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBQcm9taXNlLmFsbChleGNoYW5nZUlkUHJvbWlzZXMpO1xuICAgIH1cbn1cbiJdfQ==