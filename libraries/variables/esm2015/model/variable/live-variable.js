import { DataSource, isDefined } from '@wm/core';
import { VariableManagerFactory } from '../../factory/variable-manager.factory';
import { ApiAwareVariable } from './api-aware-variable';
import { VARIABLE_CONSTANTS } from '../../constants/variables.constants';
const getManager = () => {
    return VariableManagerFactory.get(VARIABLE_CONSTANTS.CATEGORY.LIVE);
};
const ɵ0 = getManager;
export class LiveVariable extends ApiAwareVariable {
    constructor(variable) {
        super();
        Object.assign(this, variable);
    }
    execute(operation, options) {
        let returnVal = super.execute(operation, options);
        if (isDefined(returnVal)) {
            return returnVal;
        }
        switch (operation) {
            case DataSource.Operation.IS_API_AWARE:
                returnVal = true;
                break;
            case DataSource.Operation.SUPPORTS_CRUD:
                returnVal = true;
                break;
            case DataSource.Operation.SUPPORTS_DISTINCT_API:
                returnVal = true;
                break;
            case DataSource.Operation.IS_PAGEABLE:
                returnVal = true;
                break;
            case DataSource.Operation.SUPPORTS_SERVER_FILTER:
                returnVal = true;
                break;
            case DataSource.Operation.GET_OPERATION_TYPE:
                returnVal = this.operation;
                break;
            case DataSource.Operation.GET_RELATED_PRIMARY_KEYS:
                returnVal = this.getRelatedTablePrimaryKeys(options);
                break;
            case DataSource.Operation.GET_ENTITY_NAME:
                returnVal = this.propertiesMap.entityName;
                break;
            case DataSource.Operation.LIST_RECORDS:
                returnVal = this.listRecords(options);
                break;
            case DataSource.Operation.UPDATE_RECORD:
                returnVal = this.updateRecord(options);
                break;
            case DataSource.Operation.INSERT_RECORD:
                returnVal = this.insertRecord(options);
                break;
            case DataSource.Operation.DELETE_RECORD:
                returnVal = this.deleteRecord(options);
                break;
            case DataSource.Operation.INVOKE:
                returnVal = this.invoke(options);
                break;
            case DataSource.Operation.UPDATE:
                returnVal = this.update(options);
                break;
            case DataSource.Operation.GET_RELATED_TABLE_DATA:
                returnVal = this.getRelatedTableData(options.relatedField, options);
                break;
            case DataSource.Operation.GET_DISTINCT_DATA_BY_FIELDS:
                returnVal = this.getDistinctDataByFields(options);
                break;
            case DataSource.Operation.GET_AGGREGATED_DATA:
                returnVal = this.getAggregatedData(options);
                break;
            case DataSource.Operation.GET_MATCH_MODE:
                returnVal = this.matchMode;
                break;
            case DataSource.Operation.DOWNLOAD:
                returnVal = this.download(options);
                break;
            case DataSource.Operation.GET_PROPERTIES_MAP:
                returnVal = this.propertiesMap;
                break;
            case DataSource.Operation.GET_PRIMARY_KEY:
                returnVal = this.getPrimaryKey();
                break;
            case DataSource.Operation.GET_BLOB_URL:
                returnVal = `services/${this.liveSource}/${this.type}/${options.primaryValue}/content/${options.columnName}`;
                break;
            case DataSource.Operation.GET_OPTIONS:
                returnVal = this._options || {};
                break;
            case DataSource.Operation.SEARCH_RECORDS:
                returnVal = this.searchRecords(options);
                break;
            case DataSource.Operation.GET_REQUEST_PARAMS:
                returnVal = this.getRequestParams(options);
                break;
            case DataSource.Operation.GET_PAGING_OPTIONS:
                returnVal = this.pagination;
                break;
            case DataSource.Operation.IS_UPDATE_REQUIRED:
                returnVal = true;
                break;
            case DataSource.Operation.IS_BOUND_TO_LOCALE:
                returnVal = false;
                break;
            case DataSource.Operation.CANCEL:
                returnVal = false;
                break;
            default:
                returnVal = {};
                break;
        }
        return returnVal;
    }
    listRecords(options, success, error) {
        return getManager().listRecords(this, options, success, error);
    }
    updateRecord(options, success, error) {
        return getManager().updateRecord(this, options, success, error);
    }
    insertRecord(options, success, error) {
        return getManager().insertRecord(this, options, success, error);
    }
    deleteRecord(options, success, error) {
        return getManager().deleteRecord(this, options, success, error);
    }
    setInput(key, val, options) {
        return getManager().setInput(this, key, val, options);
    }
    setFilter(key, val) {
        return getManager().setFilter(this, key, val);
    }
    download(options, success, error) {
        return getManager().download(this, options, success, error);
    }
    invoke(options, success, error) {
        switch (this.operation) {
            case 'insert':
                return this.insertRecord(options, success, error);
            case 'update':
                return this.updateRecord(options, success, error);
            case 'delete':
                return this.deleteRecord(options, success, error);
            default:
                return this.listRecords(options, success, error);
        }
    }
    getRelatedTablePrimaryKeys(columnName) {
        return getManager().getRelatedTablePrimaryKeys(this, columnName);
    }
    getRelatedTableData(columnName, options, success, error) {
        return getManager().getRelatedTableData(this, columnName, options, success, error);
    }
    getDistinctDataByFields(options, success, error) {
        return getManager().getDistinctDataByFields(this, options, success, error);
    }
    getAggregatedData(options, success, error) {
        return getManager().getAggregatedData(this, options, success, error);
    }
    getPrimaryKey() {
        return getManager().getPrimaryKey(this);
    }
    searchRecords(options, success, error) {
        return getManager().searchRecords(this, options, success, error);
    }
    getRequestParams(options) {
        return getManager().prepareRequestParams(options);
    }
    _downgradeInputData(data) {
        return getManager().downgradeFilterExpressionsToInputData(this, data);
    }
    _upgradeInputData(response, data) {
        return getManager().upgradeInputDataToFilterExpressions(this, response, data);
    }
    setOrderBy(expression) {
        this.orderBy = expression;
        /* update the variable if autoUpdate flag is set */
        if (this.autoUpdate) {
            this.update();
        }
        return this.orderBy;
    }
    // legacy method
    update(options, success, error) {
        return this.invoke(options, success, error);
    }
    createRecord(options, success, error) {
        return this.insertRecord(options, success, error);
    }
    init() {
        getManager().initBinding(this, 'dataBinding', this.operation === 'read' ? 'filterFields' : 'inputFields');
        if (this.operation === 'read') {
            getManager().initFilterExpressionBinding(this);
        }
        getManager().defineFirstLastRecord(this);
    }
    cancel(options) {
        return getManager().cancel(this, options);
    }
}
export { ɵ0 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGl2ZS12YXJpYWJsZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS92YXJpYWJsZXMvIiwic291cmNlcyI6WyJtb2RlbC92YXJpYWJsZS9saXZlLXZhcmlhYmxlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQWUsU0FBUyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRTlELE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLHdDQUF3QyxDQUFDO0FBQ2hGLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ3hELE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLHFDQUFxQyxDQUFDO0FBR3pFLE1BQU0sVUFBVSxHQUFHLEdBQXdCLEVBQUU7SUFDekMsT0FBTyxzQkFBc0IsQ0FBQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3hFLENBQUMsQ0FBQzs7QUFFRixNQUFNLE9BQU8sWUFBYSxTQUFRLGdCQUFnQjtJQVk5QyxZQUFZLFFBQWE7UUFDckIsS0FBSyxFQUFFLENBQUM7UUFDUixNQUFNLENBQUMsTUFBTSxDQUFDLElBQVcsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUN6QyxDQUFDO0lBRUQsT0FBTyxDQUFDLFNBQVMsRUFBRSxPQUFPO1FBQ3RCLElBQUksU0FBUyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsU0FBUyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ2xELElBQUksU0FBUyxDQUFDLFNBQVMsQ0FBQyxFQUFFO1lBQ3RCLE9BQU8sU0FBUyxDQUFDO1NBQ3BCO1FBRUQsUUFBUSxTQUFTLEVBQUU7WUFDZixLQUFLLFVBQVUsQ0FBQyxTQUFTLENBQUMsWUFBWTtnQkFDbEMsU0FBUyxHQUFHLElBQUksQ0FBQztnQkFDakIsTUFBTTtZQUNWLEtBQUssVUFBVSxDQUFDLFNBQVMsQ0FBQyxhQUFhO2dCQUNuQyxTQUFTLEdBQUcsSUFBSSxDQUFDO2dCQUNqQixN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V0FBVyxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ25FLENBQUM7SUFFRCxZQUFZLENBQUMsT0FBUSxFQUFFLE9BQVEsRUFBRSxLQUFNO1FBQ25DLE9BQU8sVUFBVSxFQUFFLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3BFLENBQUM7SUFFRCxZQUFZLENBQUMsT0FBUSxFQUFFLE9BQVEsRUFBRSxLQUFNO1FBQ25DLE9BQU8sVUFBVSxFQUFFLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3BFLENBQUM7SUFFRCxZQUFZLENBQUMsT0FBUSxFQUFFLE9BQVEsRUFBRSxLQUFNO1FBQ25DLE9BQU8sVUFBVSxFQUFFLENBQUMsWUFBWSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ3BFLENBQUM7SUFFRCxRQUFRLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxPQUFPO1FBQ3RCLE9BQU8sVUFBVSxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzFELENBQUM7SUFFRCxTQUFTLENBQUMsR0FBRyxFQUFFLEdBQUc7UUFDZCxPQUFPLFVBQVUsRUFBRSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ2xELENBQUM7SUFFRCxRQUFRLENBQUMsT0FBTyxFQUFFLE9BQVEsRUFBRSxLQUFNO1FBQzlCLE9BQU8sVUFBVSxFQUFFLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQ2hFLENBQUM7SUFFRCxNQUFNLENBQUMsT0FBUSxFQUFFLE9BQVEsRUFBRSxLQUFNO1FBQzdCLFFBQVEsSUFBSSxDQUFDLFNB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STtRQUNBLFVBQVUsRUFBRSxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUUsYUFBYSxFQUFFLElBQUksQ0FBQyxTQUFTLEtBQUssTUFBTSxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQzFHLElBQUksSUFBSSxDQUFDLFNBQVMsS0FBSyxNQUFNLEVBQUU7WUFDM0IsVUFBVSxFQUFFLENBQUMsMkJBQTJCLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDbEQ7UUFDRCxVQUFVLEVBQUUsQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUM3QyxDQUFDO0lBRUQsTUFBTSxDQUFDLE9BQVE7UUFDWCxPQUFPLFVBQVUsRUFBRSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDOUMsQ0FBQztDQUNKIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGF0YVNvdXJjZSwgSURhdGFTb3VyY2UsIGlzRGVmaW5lZCB9IGZyb20gJ0B3bS9jb3JlJztcblxuaW1wb3J0IHsgVmFyaWFibGVNYW5hZ2VyRmFjdG9yeSB9IGZyb20gJy4uLy4uL2ZhY3RvcnkvdmFyaWFibGUtbWFuYWdlci5mYWN0b3J5JztcbmltcG9ydCB7IEFwaUF3YXJlVmFyaWFibGUgfSBmcm9tICcuL2FwaS1hd2FyZS12YXJpYWJsZSc7XG5pbXBvcnQgeyBWQVJJQUJMRV9DT05TVEFOVFMgfSBmcm9tICcuLi8uLi9jb25zdGFudHMvdmFyaWFibGVzLmNvbnN0YW50cyc7XG5pbXBvcnQgeyBMaXZlVmFyaWFibGVNYW5hZ2VyIH0gZnJvbSAnLi4vLi4vbWFuYWdlci92YXJpYWJsZS9saXZlLXZhcmlhYmxlLm1hbmFnZXInO1xuXG5jb25zdCBnZXRNYW5hZ2VyID0gKCk6IExpdmVWYXJpYWJsZU1hbmFnZXIgPT4ge1xuICAgIHJldHVybiBWYXJpYWJsZU1hbmFnZXJGYWN0b3J5LmdldChWQVJJQUJMRV9DT05TVEFOVFMuQ0FURUdPUlkuTElWRSk7XG59O1xuXG5leHBvcnQgY2xhc3MgTGl2ZVZhcmlhYmxlIGV4dGVuZHMgQXBpQXdhcmVWYXJpYWJsZSBpbXBsZW1lbnRzIElEYXRhU291cmNlIHtcblxuICAgIG1hdGNoTW9kZTtcbiAgICBsaXZlU291cmNlO1xuICAgIHByb3BlcnRpZXNNYXA7XG4gICAgcGFnaW5hdGlvbjtcbiAgICB0eXBlO1xuICAgIG9yZGVyQnk7XG4gICAgX29wdGlvbnM7XG4gICAgLy8gVXNlZCB0byB0cmFjayBhIHZhcmlhYmxlIGh0dHAgY2FsbCwgc28gdGhhdCBpdCBjYW4gYmUgY2FuY2VsbGVkIGF0IGFueSBwb2ludCBvZiB0aW1lIGR1cmluZyBpdHMgZXhlY3V0aW9uXG4gICAgX29ic2VydmFibGU7XG5cbiAgICBjb25zdHJ1Y3Rvcih2YXJpYWJsZTogYW55KSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcyBhcyBhbnksIHZhcmlhYmxlKTtcbiAgICB9XG5cbiAgICBleGVjdXRlKG9wZXJhdGlvbiwgb3B0aW9ucykge1xuICAgICAgICBsZXQgcmV0dXJuVmFsID0gc3VwZXIuZXhlY3V0ZShvcGVyYXRpb24sIG9wdGlvbnMpO1xuICAgICAgICBpZiAoaXNEZWZpbmVkKHJldHVyblZhbCkpIHtcbiAgICAgICAgICAgIHJldHVybiByZXR1cm5WYWw7XG4gICAgICAgIH1cblxuICAgICAgICBzd2l0Y2ggKG9wZXJhdGlvbikge1xuICAgICAgICAgICAgY2FzZSBEYXRhU291cmNlLk9wZXJhdGlvbi5JU19BUElfQVdBUkU6XG4gICAgICAgICAgICAgICAgcmV0dXJuVmFsID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgRGF0YVNvdXJjZS5PcGVyYXRpb24uU1VQUE9SVFNfQ1JVRDpcbiAgICAgICAgICAgICAgICByZXR1cm5WYWwgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBEYXRhU291cmNlLk9wZXJhdGlvbi5TVVBQT1JUU19ESVNUSU5DVF9BUEk6XG4gICAgICAgICAgICAgICAgcmV0dXJuVmFsID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgRGF0YVNvdXJjZS5PcGVyYXRpb24uSVNfUEFHRUFCTEU6XG4gICAgICAgICAgICAgICAgcmV0dXJuVmFsID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgRGF0YVNvdXJjZS5PcGVyYXRpb24uU1VQUE9SVFNfU0VSVkVSX0ZJTFRFUjpcbiAgICAgICAgICAgICAgICByZXR1cm5WYWwgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBEYXRhU291cmNlLk9wZXJhdGlvbi5HRVRfT1BFUkFUSU9OX1RZUEU6XG4gICAgICAgICAgICAgICAgcmV0dXJuVmFsID0gdGhpcy5vcGVyYXRpb247XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIERhdGFTb3VyY2UuT3BlcmF0aW9uLkdFVF9SRUxBVEVEX1BSSU1BUllfS0VZUzpcbiAgICAgICAgICAgICAgICByZXR1cm5WYWwgPSB0aGlzLmdldFJlbGF0ZWRUYWJsZVByaW1hcnlLZXlzKG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBEYXRhU291cmNlLk9wZXJhdGlvbi5HRVRfRU5USVRZX05BTUU6XG4gICAgICAgICAgICAgICAgcmV0dXJuVmFsID0gdGhpcy5wcm9wZXJ0aWVzTWFwLmVudGl0eU5hbWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIERhdGFTb3VyY2UuT3BlcmF0aW9uLkxJU1RfUkVDT1JEUzpcbiAgICAgICAgICAgICAgICByZXR1cm5WYWwgPSB0aGlzLmxpc3RSZWNvcmRzKG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBEYXRhU291cmNlLk9wZXJhdGlvbi5VUERBVEVfUkVDT1JEIDpcbiAgICAgICAgICAgICAgICByZXR1cm5WYWwgPSB0aGlzLnVwZGF0ZVJlY29yZChvcHRpb25zKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgRGF0YVNvdXJjZS5PcGVyYXRpb24uSU5TRVJUX1JFQ09SRCA6XG4gICAgICAgICAgICAgICAgcmV0dXJuVmFsID0gdGhpcy5pbnNlcnRSZWNvcmQob3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIERhdGFTb3VyY2UuT3BlcmF0aW9uLkRFTEVURV9SRUNPUkQgOlxuICAgICAgICAgICAgICAgIHJldHVyblZhbCA9IHRoaXMuZGVsZXRlUmVjb3JkKG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBEYXRhU291cmNlLk9wZXJhdGlvbi5JTlZPS0UgOlxuICAgICAgICAgICAgICAgIHJldHVyblZhbCA9IHRoaXMuaW52b2tlKG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBEYXRhU291cmNlLk9wZXJhdGlvbi5VUERBVEUgOlxuICAgICAgICAgICAgICAgIHJldHVyblZhbCA9IHRoaXMudXBkYXRlKG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBEYXRhU291cmNlLk9wZXJhdGlvbi5HRVRfUkVMQVRFRF9UQUJMRV9EQVRBOlxuICAgICAgICAgICAgICAgIHJldHVyblZhbCA9IHRoaXMuZ2V0UmVsYXRlZFRhYmxlRGF0YShvcHRpb25zLnJlbGF0ZWRGaWVsZCwgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIERhdGFTb3VyY2UuT3BlcmF0aW9uLkdFVF9ESVNUSU5DVF9EQVRBX0JZX0ZJRUxEUzpcbiAgICAgICAgICAgICAgICByZXR1cm5WYWwgPSB0aGlzLmdldERpc3RpbmN0RGF0YUJ5RmllbGRzKG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBEYXRhU291cmNlLk9wZXJhdGlvbi5HRVRfQUdHUkVHQVRFRF9EQVRBOlxuICAgICAgICAgICAgICAgIHJldHVyblZhbCA9IHRoaXMuZ2V0QWdncmVnYXRlZERhdGEob3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIERhdGFTb3VyY2UuT3BlcmF0aW9uLkdFVF9NQVRDSF9NT0RFOlxuICAgICAgICAgICAgICAgIHJldHVyblZhbCA9IHRoaXMubWF0Y2hNb2RlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBEYXRhU291cmNlLk9wZXJhdGlvbi5ET1dOTE9BRDpcbiAgICAgICAgICAgICAgICByZXR1cm5WYWwgPSB0aGlzLmRvd25sb2FkKG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBEYXRhU291cmNlLk9wZXJhdGlvbi5HRVRfUFJPUEVSVElFU19NQVA6XG4gICAgICAgICAgICAgICAgcmV0dXJuVmFsID0gdGhpcy5wcm9wZXJ0aWVzTWFwO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBEYXRhU291cmNlLk9wZXJhdGlvbi5HRVRfUFJJTUFSWV9LRVk6XG4gICAgICAgICAgICAgICAgcmV0dXJuVmFsID0gdGhpcy5nZXRQcmltYXJ5S2V5KCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIERhdGFTb3VyY2UuT3BlcmF0aW9uLkdFVF9CTE9CX1VSTDpcbiAgICAgICAgICAgICAgICByZXR1cm5WYWwgPSBgc2VydmljZXMvJHt0aGlzLmxpdmVTb3VyY2V9LyR7dGhpcy50eXBlfS8ke29wdGlvbnMucHJpbWFyeVZhbHVlfS9jb250ZW50LyR7b3B0aW9ucy5jb2x1bW5OYW1lfWA7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIERhdGFTb3VyY2UuT3BlcmF0aW9uLkdFVF9PUFRJT05TOlxuICAgICAgICAgICAgICAgIHJldHVyblZhbCA9IHRoaXMuX29wdGlvbnMgfHwge307XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIERhdGFTb3VyY2UuT3BlcmF0aW9uLlNFQVJDSF9SRUNPUkRTOlxuICAgICAgICAgICAgICAgIHJldHVyblZhbCA9IHRoaXMuc2VhcmNoUmVjb3JkcyhvcHRpb25zKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgRGF0YVNvdXJjZS5PcGVyYXRpb24uR0VUX1JFUVVFU1RfUEFSQU1TOlxuICAgICAgICAgICAgICAgIHJldHVyblZhbCA9IHRoaXMuZ2V0UmVxdWVzdFBhcmFtcyhvcHRpb25zKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgRGF0YVNvdXJjZS5PcGVyYXRpb24uR0VUX1BBR0lOR19PUFRJT05TOlxuICAgICAgICAgICAgICAgIHJldHVyblZhbCA9IHRoaXMucGFnaW5hdGlvbjtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgRGF0YVNvdXJjZS5PcGVyYXRpb24uSVNfVVBEQVRFX1JFUVVJUkVEOlxuICAgICAgICAgICAgICAgIHJldHVyblZhbCA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIERhdGFTb3VyY2UuT3BlcmF0aW9uLklTX0JPVU5EX1RPX0xPQ0FMRTpcbiAgICAgICAgICAgICAgICByZXR1cm5WYWwgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgRGF0YVNvdXJjZS5PcGVyYXRpb24uQ0FOQ0VMOlxuICAgICAgICAgICAgICAgIHJldHVyblZhbCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICByZXR1cm5WYWwgPSB7fTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmV0dXJuVmFsO1xuICAgIH1cblxuICAgIGxpc3RSZWNvcmRzKG9wdGlvbnM/LCBzdWNjZXNzPywgZXJyb3I/KSB7XG4gICAgICAgIHJldHVybiBnZXRNYW5hZ2VyKCkubGlzdFJlY29yZHModGhpcywgb3B0aW9ucywgc3VjY2VzcywgZXJyb3IpO1xuICAgIH1cblxuICAgIHVwZGF0ZVJlY29yZChvcHRpb25zPywgc3VjY2Vzcz8sIGVycm9yPykge1xuICAgICAgICByZXR1cm4gZ2V0TWFuYWdlcigpLnVwZGF0ZVJlY29yZCh0aGlzLCBvcHRpb25zLCBzdWNjZXNzLCBlcnJvcik7XG4gICAgfVxuXG4gICAgaW5zZXJ0UmVjb3JkKG9wdGlvbnM/LCBzdWNjZXNzPywgZXJyb3I/KSB7XG4gICAgICAgIHJldHVybiBnZXRNYW5hZ2VyKCkuaW5zZXJ0UmVjb3JkKHRoaXMsIG9wdGlvbnMsIHN1Y2Nlc3MsIGVycm9yKTtcbiAgICB9XG5cbiAgICBkZWxldGVSZWNvcmQob3B0aW9ucz8sIHN1Y2Nlc3M/LCBlcnJvcj8pIHtcbiAgICAgICAgcmV0dXJuIGdldE1hbmFnZXIoKS5kZWxldGVSZWNvcmQodGhpcywgb3B0aW9ucywgc3VjY2VzcywgZXJyb3IpO1xuICAgIH1cblxuICAgIHNldElucHV0KGtleSwgdmFsLCBvcHRpb25zKSB7XG4gICAgICAgIHJldHVybiBnZXRNYW5hZ2VyKCkuc2V0SW5wdXQodGhpcywga2V5LCB2YWwsIG9wdGlvbnMpO1xuICAgIH1cblxuICAgIHNldEZpbHRlcihrZXksIHZhbCkge1xuICAgICAgICByZXR1cm4gZ2V0TWFuYWdlcigpLnNldEZpbHRlcih0aGlzLCBrZXksIHZhbCk7XG4gICAgfVxuXG4gICAgZG93bmxvYWQob3B0aW9ucywgc3VjY2Vzcz8sIGVycm9yPykge1xuICAgICAgICByZXR1cm4gZ2V0TWFuYWdlcigpLmRvd25sb2FkKHRoaXMsIG9wdGlvbnMsIHN1Y2Nlc3MsIGVycm9yKTtcbiAgICB9XG5cbiAgICBpbnZva2Uob3B0aW9ucz8sIHN1Y2Nlc3M/LCBlcnJvcj8pIHtcbiAgICAgICAgc3dpdGNoICh0aGlzLm9wZXJhdGlvbikge1xuICAgICAgICAgICAgY2FzZSAnaW5zZXJ0JzpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5pbnNlcnRSZWNvcmQob3B0aW9ucywgc3VjY2VzcywgZXJyb3IpO1xuICAgICAgICAgICAgY2FzZSAndXBkYXRlJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy51cGRhdGVSZWNvcmQob3B0aW9ucywgc3VjY2VzcywgZXJyb3IpO1xuICAgICAgICAgICAgY2FzZSAnZGVsZXRlJzpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5kZWxldGVSZWNvcmQob3B0aW9ucywgc3VjY2VzcywgZXJyb3IpO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5saXN0UmVjb3JkcyhvcHRpb25zLCBzdWNjZXNzLCBlcnJvcik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRSZWxhdGVkVGFibGVQcmltYXJ5S2V5cyhjb2x1bW5OYW1lKSB7XG4gICAgICAgIHJldHVybiBnZXRNYW5hZ2VyKCkuZ2V0UmVsYXRlZFRhYmxlUHJpbWFyeUtleXModGhpcywgY29sdW1uTmFtZSk7XG4gICAgfVxuXG4gICAgZ2V0UmVsYXRlZFRhYmxlRGF0YShjb2x1bW5OYW1lLCBvcHRpb25zLCBzdWNjZXNzPywgZXJyb3I/KSB7XG4gICAgICAgIHJldHVybiBnZXRNYW5hZ2VyKCkuZ2V0UmVsYXRlZFRhYmxlRGF0YSh0aGlzLCBjb2x1bW5OYW1lLCBvcHRpb25zLCBzdWNjZXNzLCBlcnJvcik7XG4gICAgfVxuXG4gICAgZ2V0RGlzdGluY3REYXRhQnlGaWVsZHMob3B0aW9ucywgc3VjY2Vzcz8sIGVycm9yPykge1xuICAgICAgICByZXR1cm4gZ2V0TWFuYWdlcigpLmdldERpc3RpbmN0RGF0YUJ5RmllbGRzKHRoaXMsIG9wdGlvbnMsIHN1Y2Nlc3MsIGVycm9yKTtcbiAgICB9XG5cbiAgICBnZXRBZ2dyZWdhdGVkRGF0YShvcHRpb25zLCBzdWNjZXNzPywgZXJyb3I/KSB7XG4gICAgICAgIHJldHVybiBnZXRNYW5hZ2VyKCkuZ2V0QWdncmVnYXRlZERhdGEodGhpcywgb3B0aW9ucywgc3VjY2VzcywgZXJyb3IpO1xuICAgIH1cblxuICAgIGdldFByaW1hcnlLZXkoKSB7XG4gICAgICAgIHJldHVybiBnZXRNYW5hZ2VyKCkuZ2V0UHJpbWFyeUtleSh0aGlzKTtcbiAgICB9XG5cbiAgICBzZWFyY2hSZWNvcmRzKG9wdGlvbnMsIHN1Y2Nlc3M/LCBlcnJvcj8pIHtcbiAgICAgICAgcmV0dXJuIGdldE1hbmFnZXIoKS5zZWFyY2hSZWNvcmRzKHRoaXMsIG9wdGlvbnMsIHN1Y2Nlc3MsIGVycm9yKTtcbiAgICB9XG5cbiAgICBnZXRSZXF1ZXN0UGFyYW1zKG9wdGlvbnMpIHtcbiAgICAgICAgcmV0dXJuIGdldE1hbmFnZXIoKS5wcmVwYXJlUmVxdWVzdFBhcmFtcyhvcHRpb25zKTtcbiAgICB9XG5cbiAgICBfZG93bmdyYWRlSW5wdXREYXRhKGRhdGEpIHtcbiAgICAgICAgcmV0dXJuIGdldE1hbmFnZXIoKS5kb3duZ3JhZGVGaWx0ZXJFeHByZXNzaW9uc1RvSW5wdXREYXRhKHRoaXMsIGRhdGEpO1xuICAgIH1cblxuICAgIF91cGdyYWRlSW5wdXREYXRhKHJlc3BvbnNlLCBkYXRhKSB7XG4gICAgICAgIHJldHVybiBnZXRNYW5hZ2VyKCkudXBncmFkZUlucHV0RGF0YVRvRmlsdGVyRXhwcmVzc2lvbnModGhpcywgcmVzcG9uc2UsIGRhdGEpO1xuICAgIH1cblxuICAgIHNldE9yZGVyQnkoZXhwcmVzc2lvbikge1xuICAgICAgICB0aGlzLm9yZGVyQnkgPSBleHByZXNzaW9uO1xuXG4gICAgICAgIC8qIHVwZGF0ZSB0aGUgdmFyaWFibGUgaWYgYXV0b1VwZGF0ZSBmbGFnIGlzIHNldCAqL1xuICAgICAgICBpZiAodGhpcy5hdXRvVXBkYXRlKSB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMub3JkZXJCeTtcbiAgICB9XG5cbiAgICAvLyBsZWdhY3kgbWV0aG9kXG4gICAgdXBkYXRlKG9wdGlvbnM/LCBzdWNjZXNzPywgZXJyb3I/KSB7XG4gICAgICAgIHJldHVybiB0aGlzLmludm9rZShvcHRpb25zLCBzdWNjZXNzLCBlcnJvcik7XG4gICAgfVxuXG4gICAgY3JlYXRlUmVjb3JkKG9wdGlvbnM/LCBzdWNjZXNzPywgZXJyb3I/KSB7XG4gICAgICAgIHJldHVybiB0aGlzLmluc2VydFJlY29yZChvcHRpb25zLCBzdWNjZXNzLCBlcnJvcik7XG4gICAgfVxuXG4gICAgaW5pdCgpIHtcbiAgICAgICAgZ2V0TWFuYWdlcigpLmluaXRCaW5kaW5nKHRoaXMsICdkYXRhQmluZGluZycsIHRoaXMub3BlcmF0aW9uID09PSAncmVhZCcgPyAnZmlsdGVyRmllbGRzJyA6ICdpbnB1dEZpZWxkcycpO1xuICAgICAgICBpZiAodGhpcy5vcGVyYXRpb24gPT09ICdyZWFkJykge1xuICAgICAgICAgICAgZ2V0TWFuYWdlcigpLmluaXRGaWx0ZXJFeHByZXNzaW9uQmluZGluZyh0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICBnZXRNYW5hZ2VyKCkuZGVmaW5lRmlyc3RMYXN0UmVjb3JkKHRoaXMpO1xuICAgIH1cblxuICAgIGNhbmNlbChvcHRpb25zPykge1xuICAgICAgICByZXR1cm4gZ2V0TWFuYWdlcigpLmNhbmNlbCh0aGlzLCBvcHRpb25zKTtcbiAgICB9XG59XG4iXX0=