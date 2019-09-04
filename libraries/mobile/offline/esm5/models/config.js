var DBInfo = /** @class */ (function () {
    function DBInfo() {
        this.schema = {
            name: '',
            isInternal: false,
            entities: new Map()
        };
        this.stores = new Map();
        this.queries = new Map();
    }
    return DBInfo;
}());
export { DBInfo };
var EntityInfo = /** @class */ (function () {
    function EntityInfo(name, entityName) {
        this.name = name;
        this.entityName = entityName;
        this.columns = new Array();
        this.entityName = this.entityName || this.name;
    }
    return EntityInfo;
}());
export { EntityInfo };
var ColumnInfo = /** @class */ (function () {
    function ColumnInfo(name, fieldName) {
        this.name = name;
        this.fieldName = fieldName;
        this.primaryKey = false;
        this.fieldName = this.fieldName || this.name;
    }
    return ColumnInfo;
}());
export { ColumnInfo };
var ForeignRelationInfo = /** @class */ (function () {
    function ForeignRelationInfo() {
    }
    return ForeignRelationInfo;
}());
export { ForeignRelationInfo };
var NamedQueryInfo = /** @class */ (function () {
    function NamedQueryInfo(name, query) {
        this.name = name;
        this.query = query;
        this.response = {
            properties: []
        };
    }
    return NamedQueryInfo;
}());
export { NamedQueryInfo };
var NamedQueryParamInfo = /** @class */ (function () {
    function NamedQueryParamInfo(name, type, variableType) {
        this.name = name;
        this.type = type;
        this.variableType = variableType;
    }
    return NamedQueryParamInfo;
}());
export { NamedQueryParamInfo };
var PullConfig = /** @class */ (function () {
    function PullConfig() {
    }
    return PullConfig;
}());
export { PullConfig };
export var PullType;
(function (PullType) {
    PullType["LIVE"] = "LIVE";
    PullType["BUNDLED"] = "BUNDLED";
    PullType["APP_START"] = "APP_START";
})(PullType || (PullType = {}));
var OfflineDataFilter = /** @class */ (function () {
    function OfflineDataFilter() {
    }
    return OfflineDataFilter;
}());
export { OfflineDataFilter };
var PushConfig = /** @class */ (function () {
    function PushConfig() {
        this.insertEnabled = false;
        this.updateEnabled = false;
        this.deleteEnabled = false;
        this.readEnabled = true;
    }
    return PushConfig;
}());
export { PushConfig };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL21vYmlsZS9vZmZsaW5lLyIsInNvdXJjZXMiOlsibW9kZWxzL2NvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFJQTtJQUFBO1FBQ1csV0FBTSxHQUFHO1lBQ1osSUFBSSxFQUFFLEVBQUU7WUFDUixVQUFVLEVBQUUsS0FBSztZQUNqQixRQUFRLEVBQUUsSUFBSSxHQUFHLEVBQXNCO1NBQzFDLENBQUM7UUFDSyxXQUFNLEdBQUcsSUFBSSxHQUFHLEVBQXdCLENBQUM7UUFDekMsWUFBTyxHQUFHLElBQUksR0FBRyxFQUEwQixDQUFDO0lBRXZELENBQUM7SUFBRCxhQUFDO0FBQUQsQ0FBQyxBQVRELElBU0M7O0FBRUQ7SUFLSSxvQkFBbUIsSUFBWSxFQUFTLFVBQW1CO1FBQXhDLFNBQUksR0FBSixJQUFJLENBQVE7UUFBUyxlQUFVLEdBQVYsVUFBVSxDQUFTO1FBSnBELFlBQU8sR0FBRyxJQUFJLEtBQUssRUFBYyxDQUFDO1FBS3JDLElBQUksQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDO0lBQ25ELENBQUM7SUFDTCxpQkFBQztBQUFELENBQUMsQUFSRCxJQVFDOztBQUVEO0lBT0ksb0JBQW1CLElBQVksRUFBUyxTQUFrQjtRQUF2QyxTQUFJLEdBQUosSUFBSSxDQUFRO1FBQVMsY0FBUyxHQUFULFNBQVMsQ0FBUztRQUpuRCxlQUFVLEdBQUcsS0FBSyxDQUFDO1FBS3RCLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDO0lBQ2pELENBQUM7SUFDTCxpQkFBQztBQUFELENBQUMsQUFWRCxJQVVDOztBQUVEO0lBQUE7SUFRQSxDQUFDO0lBQUQsMEJBQUM7QUFBRCxDQUFDLEFBUkQsSUFRQzs7QUFFRDtJQUtJLHdCQUFtQixJQUFZLEVBQVMsS0FBYTtRQUFsQyxTQUFJLEdBQUosSUFBSSxDQUFRO1FBQVMsVUFBSyxHQUFMLEtBQUssQ0FBUTtRQUg5QyxhQUFRLEdBQUc7WUFDZCxVQUFVLEVBQUUsRUFBRTtTQUNqQixDQUFDO0lBR0YsQ0FBQztJQUNMLHFCQUFDO0FBQUQsQ0FBQyxBQVJELElBUUM7O0FBRUQ7SUFDSSw2QkFBbUIsSUFBWSxFQUFTLElBQWEsRUFBUyxZQUFxQjtRQUFoRSxTQUFJLEdBQUosSUFBSSxDQUFRO1FBQVMsU0FBSSxHQUFKLElBQUksQ0FBUztRQUFTLGlCQUFZLEdBQVosWUFBWSxDQUFTO0lBRW5GLENBQUM7SUFDTCwwQkFBQztBQUFELENBQUMsQUFKRCxJQUlDOztBQUVEO0lBQUE7SUFRQSxDQUFDO0lBQUQsaUJBQUM7QUFBRCxDQUFDLEFBUkQsSUFRQzs7QUFFRCxNQUFNLENBQU4sSUFBWSxRQUlYO0FBSkQsV0FBWSxRQUFRO0lBQ2hCLHlCQUFhLENBQUE7SUFDYiwrQkFBbUIsQ0FBQTtJQUNuQixtQ0FBdUIsQ0FBQTtBQUMzQixDQUFDLEVBSlcsUUFBUSxLQUFSLFFBQVEsUUFJbkI7QUFFRDtJQUFBO0lBS0EsQ0FBQztJQUFELHdCQUFDO0FBQUQsQ0FBQyxBQUxELElBS0M7O0FBRUQ7SUFBQTtRQUNXLGtCQUFhLEdBQUcsS0FBSyxDQUFDO1FBQ3RCLGtCQUFhLEdBQUcsS0FBSyxDQUFDO1FBQ3RCLGtCQUFhLEdBQUcsS0FBSyxDQUFDO1FBQ3RCLGdCQUFXLEdBQUcsSUFBSSxDQUFDO0lBQzlCLENBQUM7SUFBRCxpQkFBQztBQUFELENBQUMsQUFMRCxJQUtDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgU1FMaXRlT2JqZWN0IH0gZnJvbSAnQGlvbmljLW5hdGl2ZS9zcWxpdGUnO1xuXG5pbXBvcnQgeyBMb2NhbERCU3RvcmUgfSBmcm9tICcuL2xvY2FsLWRiLXN0b3JlJztcblxuZXhwb3J0IGNsYXNzIERCSW5mbyB7XG4gICAgcHVibGljIHNjaGVtYSA9IHtcbiAgICAgICAgbmFtZTogJycsXG4gICAgICAgIGlzSW50ZXJuYWw6IGZhbHNlLFxuICAgICAgICBlbnRpdGllczogbmV3IE1hcDxzdHJpbmcsIEVudGl0eUluZm8+KClcbiAgICB9O1xuICAgIHB1YmxpYyBzdG9yZXMgPSBuZXcgTWFwPHN0cmluZywgTG9jYWxEQlN0b3JlPigpO1xuICAgIHB1YmxpYyBxdWVyaWVzID0gbmV3IE1hcDxzdHJpbmcsIE5hbWVkUXVlcnlJbmZvPigpO1xuICAgIHB1YmxpYyBzcWxpdGVPYmplY3Q6IFNRTGl0ZU9iamVjdDtcbn1cblxuZXhwb3J0IGNsYXNzIEVudGl0eUluZm8ge1xuICAgIHB1YmxpYyBjb2x1bW5zID0gbmV3IEFycmF5PENvbHVtbkluZm8+KCk7XG4gICAgcHVibGljIHB1bGxDb25maWc6IFB1bGxDb25maWc7XG4gICAgcHVibGljIHB1c2hDb25maWc6IFB1c2hDb25maWc7XG5cbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgbmFtZTogc3RyaW5nLCBwdWJsaWMgZW50aXR5TmFtZT86IHN0cmluZykge1xuICAgICAgICB0aGlzLmVudGl0eU5hbWUgPSB0aGlzLmVudGl0eU5hbWUgfHwgdGhpcy5uYW1lO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIENvbHVtbkluZm8ge1xuICAgIHB1YmxpYyBnZW5lcmF0b3JUeXBlOiBzdHJpbmc7XG4gICAgcHVibGljIHNxbFR5cGU6IHN0cmluZztcbiAgICBwdWJsaWMgcHJpbWFyeUtleSA9IGZhbHNlO1xuICAgIHB1YmxpYyBkZWZhdWx0VmFsdWU6IGFueTtcbiAgICBwdWJsaWMgZm9yZWlnblJlbGF0aW9ucz86IEZvcmVpZ25SZWxhdGlvbkluZm9bXTtcblxuICAgIGNvbnN0cnVjdG9yKHB1YmxpYyBuYW1lOiBzdHJpbmcsIHB1YmxpYyBmaWVsZE5hbWU/OiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5maWVsZE5hbWUgPSB0aGlzLmZpZWxkTmFtZSB8fCB0aGlzLm5hbWU7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgRm9yZWlnblJlbGF0aW9uSW5mbyB7XG4gICAgcHVibGljIHNvdXJjZUZpZWxkTmFtZTogc3RyaW5nO1xuICAgIHB1YmxpYyB0YXJnZXRFbnRpdHk6IHN0cmluZztcbiAgICBwdWJsaWMgdGFyZ2V0VGFibGU6IHN0cmluZztcbiAgICBwdWJsaWMgdGFyZ2V0Q29sdW1uOiBzdHJpbmc7XG4gICAgcHVibGljIHRhcmdldEZpZWxkTmFtZTogc3RyaW5nO1xuICAgIHB1YmxpYyB0YXJnZXRQYXRoOiBzdHJpbmc7XG4gICAgcHVibGljIGRhdGFNYXBwZXI6IEFycmF5PENvbHVtbkluZm8+O1xufVxuXG5leHBvcnQgY2xhc3MgTmFtZWRRdWVyeUluZm8ge1xuICAgIHB1YmxpYyBwYXJhbXM6IE5hbWVkUXVlcnlQYXJhbUluZm9bXTtcbiAgICBwdWJsaWMgcmVzcG9uc2UgPSB7XG4gICAgICAgIHByb3BlcnRpZXM6IFtdXG4gICAgfTtcbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgbmFtZTogc3RyaW5nLCBwdWJsaWMgcXVlcnk6IHN0cmluZykge1xuXG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgTmFtZWRRdWVyeVBhcmFtSW5mbyB7XG4gICAgY29uc3RydWN0b3IocHVibGljIG5hbWU6IHN0cmluZywgcHVibGljIHR5cGU/OiBzdHJpbmcsIHB1YmxpYyB2YXJpYWJsZVR5cGU/OiBzdHJpbmcpIHtcblxuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIFB1bGxDb25maWcge1xuICAgIHB1YmxpYyBzaXplOiBudW1iZXI7XG4gICAgcHVibGljIHF1ZXJ5OiBzdHJpbmc7XG4gICAgcHVibGljIG9yZGVyQnk6IHN0cmluZztcbiAgICBwdWJsaWMgbWF4Tm9PZlJlY29yZHM6IG51bWJlcjtcbiAgICBwdWJsaWMgZGVmYXVsdFR5cGU6IHN0cmluZztcbiAgICBwdWJsaWMgcHVsbFR5cGU6IFB1bGxUeXBlO1xuICAgIHB1YmxpYyBmaWx0ZXI6IE9mZmxpbmVEYXRhRmlsdGVyW107XG59XG5cbmV4cG9ydCBlbnVtIFB1bGxUeXBlIHtcbiAgICBMSVZFID0gJ0xJVkUnLFxuICAgIEJVTkRMRUQgPSAnQlVORExFRCcsXG4gICAgQVBQX1NUQVJUID0gJ0FQUF9TVEFSVCdcbn1cblxuZXhwb3J0IGNsYXNzIE9mZmxpbmVEYXRhRmlsdGVyIHtcbiAgICBwdWJsaWMgYXR0cmlidXRlTmFtZTogc3RyaW5nO1xuICAgIHB1YmxpYyBhdHRyaWJ1dGVWYWx1ZTogYW55O1xuICAgIHB1YmxpYyBhdHRyaWJ1dGVUeXBlOiBzdHJpbmc7XG4gICAgcHVibGljIGZpbHRlckNvbmRpdGlvbjogc3RyaW5nO1xufVxuXG5leHBvcnQgY2xhc3MgUHVzaENvbmZpZyB7XG4gICAgcHVibGljIGluc2VydEVuYWJsZWQgPSBmYWxzZTtcbiAgICBwdWJsaWMgdXBkYXRlRW5hYmxlZCA9IGZhbHNlO1xuICAgIHB1YmxpYyBkZWxldGVFbmFibGVkID0gZmFsc2U7XG4gICAgcHVibGljIHJlYWRFbmFibGVkID0gdHJ1ZTtcbn1cbiJdfQ==