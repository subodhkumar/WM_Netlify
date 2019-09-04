import { Injectable } from '@angular/core';
import * as i0 from "@angular/core";
var FieldTypeService = /** @class */ (function () {
    function FieldTypeService() {
        _.assign(this, {
            INTEGER: 'integer',
            BIG_INTEGER: 'big_integer',
            SHORT: 'short',
            FLOAT: 'float',
            BIG_DECIMAL: 'big_decimal',
            DOUBLE: 'double',
            LONG: 'long',
            BYTE: 'byte',
            STRING: 'string',
            CHARACTER: 'character',
            TEXT: 'text',
            DATE: 'date',
            TIME: 'time',
            TIMESTAMP: 'timestamp',
            DATETIME: 'datetime',
            BOOLEAN: 'boolean',
            LIST: 'list',
            CLOB: 'clob',
            BLOB: 'blob'
        });
    }
    FieldTypeService.decorators = [
        { type: Injectable, args: [{ providedIn: 'root' },] }
    ];
    /** @nocollapse */
    FieldTypeService.ctorParameters = function () { return []; };
    FieldTypeService.ngInjectableDef = i0.defineInjectable({ factory: function FieldTypeService_Factory() { return new FieldTypeService(); }, token: FieldTypeService, providedIn: "root" });
    return FieldTypeService;
}());
export { FieldTypeService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmllbGQtdHlwZS5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvcmUvIiwic291cmNlcyI6WyJzZXJ2aWNlcy9maWVsZC10eXBlLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQzs7QUFJM0M7SUFFSTtRQUNJLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFO1lBQ1gsT0FBTyxFQUFHLFNBQVM7WUFDbkIsV0FBVyxFQUFHLGFBQWE7WUFDM0IsS0FBSyxFQUFHLE9BQU87WUFDZixLQUFLLEVBQUcsT0FBTztZQUNmLFdBQVcsRUFBRyxhQUFhO1lBQzNCLE1BQU0sRUFBRyxRQUFRO1lBQ2pCLElBQUksRUFBRyxNQUFNO1lBQ2IsSUFBSSxFQUFHLE1BQU07WUFDYixNQUFNLEVBQUcsUUFBUTtZQUNqQixTQUFTLEVBQUcsV0FBVztZQUN2QixJQUFJLEVBQUcsTUFBTTtZQUNiLElBQUksRUFBRyxNQUFNO1lBQ2IsSUFBSSxFQUFHLE1BQU07WUFDYixTQUFTLEVBQUcsV0FBVztZQUN2QixRQUFRLEVBQUcsVUFBVTtZQUNyQixPQUFPLEVBQUUsU0FBUztZQUNsQixJQUFJLEVBQUcsTUFBTTtZQUNiLElBQUksRUFBRyxNQUFNO1lBQ2IsSUFBSSxFQUFHLE1BQU07U0FDaEIsQ0FBQyxDQUFDO0lBQ1AsQ0FBQzs7Z0JBeEJKLFVBQVUsU0FBQyxFQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUM7Ozs7OzJCQUpoQztDQTZCQyxBQXpCRCxJQXlCQztTQXhCWSxnQkFBZ0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmRlY2xhcmUgY29uc3QgXztcblxuQEluamVjdGFibGUoe3Byb3ZpZGVkSW46ICdyb290J30pXG5leHBvcnQgY2xhc3MgRmllbGRUeXBlU2VydmljZSB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIF8uYXNzaWduKHRoaXMsIHtcbiAgICAgICAgICAgIElOVEVHRVIgOiAnaW50ZWdlcicsXG4gICAgICAgICAgICBCSUdfSU5URUdFUiA6ICdiaWdfaW50ZWdlcicsXG4gICAgICAgICAgICBTSE9SVCA6ICdzaG9ydCcsXG4gICAgICAgICAgICBGTE9BVCA6ICdmbG9hdCcsXG4gICAgICAgICAgICBCSUdfREVDSU1BTCA6ICdiaWdfZGVjaW1hbCcsXG4gICAgICAgICAgICBET1VCTEUgOiAnZG91YmxlJyxcbiAgICAgICAgICAgIExPTkcgOiAnbG9uZycsXG4gICAgICAgICAgICBCWVRFIDogJ2J5dGUnLFxuICAgICAgICAgICAgU1RSSU5HIDogJ3N0cmluZycsXG4gICAgICAgICAgICBDSEFSQUNURVIgOiAnY2hhcmFjdGVyJyxcbiAgICAgICAgICAgIFRFWFQgOiAndGV4dCcsXG4gICAgICAgICAgICBEQVRFIDogJ2RhdGUnLFxuICAgICAgICAgICAgVElNRSA6ICd0aW1lJyxcbiAgICAgICAgICAgIFRJTUVTVEFNUCA6ICd0aW1lc3RhbXAnLFxuICAgICAgICAgICAgREFURVRJTUUgOiAnZGF0ZXRpbWUnLFxuICAgICAgICAgICAgQk9PTEVBTjogJ2Jvb2xlYW4nLFxuICAgICAgICAgICAgTElTVCA6ICdsaXN0JyxcbiAgICAgICAgICAgIENMT0IgOiAnY2xvYicsXG4gICAgICAgICAgICBCTE9CIDogJ2Jsb2InXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiJdfQ==