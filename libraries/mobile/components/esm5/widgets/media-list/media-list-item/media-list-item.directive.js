import { Directive, Input } from '@angular/core';
import { provideAsWidgetRef } from '@wm/components';
var MediaListItemDirective = /** @class */ (function () {
    function MediaListItemDirective() {
    }
    Object.defineProperty(MediaListItemDirective.prototype, "wmMediaListItem", {
        set: function (val) {
            this.item = val;
        },
        enumerable: true,
        configurable: true
    });
    MediaListItemDirective.decorators = [
        { type: Directive, args: [{
                    selector: '[wmMediaListItem]',
                    providers: [
                        provideAsWidgetRef(MediaListItemDirective)
                    ]
                },] }
    ];
    MediaListItemDirective.propDecorators = {
        wmMediaListItem: [{ type: Input }]
    };
    return MediaListItemDirective;
}());
export { MediaListItemDirective };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVkaWEtbGlzdC1pdGVtLmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9tb2JpbGUvY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvbWVkaWEtbGlzdC9tZWRpYS1saXN0LWl0ZW0vbWVkaWEtbGlzdC1pdGVtLmRpcmVjdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUVqRCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUVwRDtJQUFBO0lBY0EsQ0FBQztJQUhHLHNCQUFhLG1EQUFlO2FBQTVCLFVBQTZCLEdBQUc7WUFDNUIsSUFBSSxDQUFDLElBQUksR0FBRyxHQUFHLENBQUM7UUFDcEIsQ0FBQzs7O09BQUE7O2dCQWJKLFNBQVMsU0FBQztvQkFDUCxRQUFRLEVBQUUsbUJBQW1CO29CQUM3QixTQUFTLEVBQUU7d0JBQ1Asa0JBQWtCLENBQUMsc0JBQXNCLENBQUM7cUJBQzdDO2lCQUNKOzs7a0NBTUksS0FBSzs7SUFHViw2QkFBQztDQUFBLEFBZEQsSUFjQztTQVJZLHNCQUFzQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERpcmVjdGl2ZSwgSW5wdXQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgcHJvdmlkZUFzV2lkZ2V0UmVmIH0gZnJvbSAnQHdtL2NvbXBvbmVudHMnO1xuXG5ARGlyZWN0aXZlKHtcbiAgICBzZWxlY3RvcjogJ1t3bU1lZGlhTGlzdEl0ZW1dJyxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgcHJvdmlkZUFzV2lkZ2V0UmVmKE1lZGlhTGlzdEl0ZW1EaXJlY3RpdmUpXG4gICAgXVxufSlcbmV4cG9ydCBjbGFzcyBNZWRpYUxpc3RJdGVtRGlyZWN0aXZlIHtcblxuICAgIHB1YmxpYyBpbmRleDtcbiAgICBwdWJsaWMgaXRlbTtcblxuICAgIEBJbnB1dCgpIHNldCB3bU1lZGlhTGlzdEl0ZW0odmFsKSB7XG4gICAgICAgIHRoaXMuaXRlbSA9IHZhbDtcbiAgICB9XG59XG4iXX0=