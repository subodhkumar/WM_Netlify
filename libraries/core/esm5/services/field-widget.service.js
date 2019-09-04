import { Injectable } from '@angular/core';
import * as i0 from "@angular/core";
var FieldWidgetService = /** @class */ (function () {
    function FieldWidgetService() {
        _.assign(this, {
            TEXT: 'text',
            NUMBER: 'number',
            TEXTAREA: 'textarea',
            PASSWORD: 'password',
            CHECKBOX: 'checkbox',
            SLIDER: 'slider',
            RICHTEXT: 'richtext',
            CURRENCY: 'currency',
            SWITCH: 'switch',
            SELECT: 'select',
            CHECKBOXSET: 'checkboxset',
            RADIOSET: 'radioset',
            DATE: 'date',
            TIME: 'time',
            TIMESTAMP: 'timestamp',
            UPLOAD: 'upload',
            RATING: 'rating',
            DATETIME: 'datetime',
            AUTOCOMPLETE: 'autocomplete',
            CHIPS: 'chips',
            COLORPICKER: 'colorpicker'
        });
    }
    FieldWidgetService.decorators = [
        { type: Injectable, args: [{ providedIn: 'root' },] }
    ];
    /** @nocollapse */
    FieldWidgetService.ctorParameters = function () { return []; };
    FieldWidgetService.ngInjectableDef = i0.defineInjectable({ factory: function FieldWidgetService_Factory() { return new FieldWidgetService(); }, token: FieldWidgetService, providedIn: "root" });
    return FieldWidgetService;
}());
export { FieldWidgetService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmllbGQtd2lkZ2V0LnNlcnZpY2UuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29yZS8iLCJzb3VyY2VzIjpbInNlcnZpY2VzL2ZpZWxkLXdpZGdldC5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7O0FBSTNDO0lBRUk7UUFDSSxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRTtZQUNYLElBQUksRUFBRyxNQUFNO1lBQ2IsTUFBTSxFQUFHLFFBQVE7WUFDakIsUUFBUSxFQUFHLFVBQVU7WUFDckIsUUFBUSxFQUFHLFVBQVU7WUFDckIsUUFBUSxFQUFHLFVBQVU7WUFDckIsTUFBTSxFQUFHLFFBQVE7WUFDakIsUUFBUSxFQUFHLFVBQVU7WUFDckIsUUFBUSxFQUFHLFVBQVU7WUFDckIsTUFBTSxFQUFHLFFBQVE7WUFDakIsTUFBTSxFQUFHLFFBQVE7WUFDakIsV0FBVyxFQUFHLGFBQWE7WUFDM0IsUUFBUSxFQUFHLFVBQVU7WUFDckIsSUFBSSxFQUFHLE1BQU07WUFDYixJQUFJLEVBQUcsTUFBTTtZQUNiLFNBQVMsRUFBRyxXQUFXO1lBQ3ZCLE1BQU0sRUFBRyxRQUFRO1lBQ2pCLE1BQU0sRUFBRyxRQUFRO1lBQ2pCLFFBQVEsRUFBRyxVQUFVO1lBQ3JCLFlBQVksRUFBRyxjQUFjO1lBQzdCLEtBQUssRUFBRyxPQUFPO1lBQ2YsV0FBVyxFQUFHLGFBQWE7U0FDOUIsQ0FBQyxDQUFDO0lBQ1AsQ0FBQzs7Z0JBMUJKLFVBQVUsU0FBQyxFQUFDLFVBQVUsRUFBRSxNQUFNLEVBQUM7Ozs7OzZCQUpoQztDQStCQyxBQTNCRCxJQTJCQztTQTFCWSxrQkFBa0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmRlY2xhcmUgY29uc3QgXztcblxuQEluamVjdGFibGUoe3Byb3ZpZGVkSW46ICdyb290J30pXG5leHBvcnQgY2xhc3MgRmllbGRXaWRnZXRTZXJ2aWNlIHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgXy5hc3NpZ24odGhpcywge1xuICAgICAgICAgICAgVEVYVCA6ICd0ZXh0JyxcbiAgICAgICAgICAgIE5VTUJFUiA6ICdudW1iZXInLFxuICAgICAgICAgICAgVEVYVEFSRUEgOiAndGV4dGFyZWEnLFxuICAgICAgICAgICAgUEFTU1dPUkQgOiAncGFzc3dvcmQnLFxuICAgICAgICAgICAgQ0hFQ0tCT1ggOiAnY2hlY2tib3gnLFxuICAgICAgICAgICAgU0xJREVSIDogJ3NsaWRlcicsXG4gICAgICAgICAgICBSSUNIVEVYVCA6ICdyaWNodGV4dCcsXG4gICAgICAgICAgICBDVVJSRU5DWSA6ICdjdXJyZW5jeScsXG4gICAgICAgICAgICBTV0lUQ0ggOiAnc3dpdGNoJyxcbiAgICAgICAgICAgIFNFTEVDVCA6ICdzZWxlY3QnLFxuICAgICAgICAgICAgQ0hFQ0tCT1hTRVQgOiAnY2hlY2tib3hzZXQnLFxuICAgICAgICAgICAgUkFESU9TRVQgOiAncmFkaW9zZXQnLFxuICAgICAgICAgICAgREFURSA6ICdkYXRlJyxcbiAgICAgICAgICAgIFRJTUUgOiAndGltZScsXG4gICAgICAgICAgICBUSU1FU1RBTVAgOiAndGltZXN0YW1wJyxcbiAgICAgICAgICAgIFVQTE9BRCA6ICd1cGxvYWQnLFxuICAgICAgICAgICAgUkFUSU5HIDogJ3JhdGluZycsXG4gICAgICAgICAgICBEQVRFVElNRSA6ICdkYXRldGltZScsXG4gICAgICAgICAgICBBVVRPQ09NUExFVEUgOiAnYXV0b2NvbXBsZXRlJyxcbiAgICAgICAgICAgIENISVBTIDogJ2NoaXBzJyxcbiAgICAgICAgICAgIENPTE9SUElDS0VSIDogJ2NvbG9ycGlja2VyJ1xuICAgICAgICB9KTtcbiAgICB9XG59XG4iXX0=