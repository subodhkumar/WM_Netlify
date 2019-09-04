import * as tslib_1 from "tslib";
import { Component, ElementRef, Injector, ViewChild } from '@angular/core';
import { APPLY_STYLES_TYPE, styler } from '../../../framework/styler';
import { StylableComponent } from '../../base/stylable.component';
import { registerProps } from './card-content.props';
import { provideAsWidgetRef } from '../../../../utils/widget-utils';
var DEFAULT_CLS = 'app-card-content card-body card-block';
var WIDGET_CONFIG = {
    widgetType: 'wm-card-content',
    hostClass: DEFAULT_CLS
};
var CardContentComponent = /** @class */ (function (_super) {
    tslib_1.__extends(CardContentComponent, _super);
    function CardContentComponent(inj) {
        return _super.call(this, inj, WIDGET_CONFIG) || this;
    }
    CardContentComponent.prototype.ngAfterViewInit = function () {
        _super.prototype.ngAfterViewInit.call(this);
        styler(this.cardContentContainerElRef.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);
    };
    CardContentComponent.initializeProps = registerProps();
    CardContentComponent.decorators = [
        { type: Component, args: [{
                    selector: 'div[wmCardContent]',
                    template: "<div partial-container-target #cardContentContainer>\n    <ng-content></ng-content>\n</div>",
                    providers: [
                        provideAsWidgetRef(CardContentComponent)
                    ]
                }] }
    ];
    /** @nocollapse */
    CardContentComponent.ctorParameters = function () { return [
        { type: Injector }
    ]; };
    CardContentComponent.propDecorators = {
        cardContentContainerElRef: [{ type: ViewChild, args: ['cardContentContainer',] }]
    };
    return CardContentComponent;
}(StylableComponent));
export { CardContentComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FyZC1jb250ZW50LmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vY2FyZC9jYXJkLWNvbnRlbnQvY2FyZC1jb250ZW50LmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsT0FBTyxFQUFpQixTQUFTLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFMUYsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBRXRFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLCtCQUErQixDQUFDO0FBQ2xFLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUNyRCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUVwRSxJQUFNLFdBQVcsR0FBRyx1Q0FBdUMsQ0FBQztBQUM1RCxJQUFNLGFBQWEsR0FBa0I7SUFDakMsVUFBVSxFQUFFLGlCQUFpQjtJQUM3QixTQUFTLEVBQUUsV0FBVztDQUN6QixDQUFDO0FBRUY7SUFPMEMsZ0RBQWlCO0lBS3ZELDhCQUFZLEdBQWE7ZUFDckIsa0JBQU0sR0FBRyxFQUFFLGFBQWEsQ0FBQztJQUM3QixDQUFDO0lBRUQsOENBQWUsR0FBZjtRQUNJLGlCQUFNLGVBQWUsV0FBRSxDQUFDO1FBQ3hCLE1BQU0sQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUMsYUFBYSxFQUFFLElBQUksRUFBRSxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUM1RixDQUFDO0lBWE0sb0NBQWUsR0FBRyxhQUFhLEVBQUUsQ0FBQzs7Z0JBUjVDLFNBQVMsU0FBQztvQkFDUCxRQUFRLEVBQUUsb0JBQW9CO29CQUM5Qix1R0FBNEM7b0JBQzVDLFNBQVMsRUFBRTt3QkFDUCxrQkFBa0IsQ0FBQyxvQkFBb0IsQ0FBQztxQkFDM0M7aUJBQ0o7Ozs7Z0JBcEI4QyxRQUFROzs7NENBd0JsRCxTQUFTLFNBQUMsc0JBQXNCOztJQVVyQywyQkFBQztDQUFBLEFBcEJELENBTzBDLGlCQUFpQixHQWExRDtTQWJZLG9CQUFvQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFmdGVyVmlld0luaXQsIENvbXBvbmVudCwgRWxlbWVudFJlZiwgSW5qZWN0b3IsIFZpZXdDaGlsZCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBBUFBMWV9TVFlMRVNfVFlQRSwgc3R5bGVyIH0gZnJvbSAnLi4vLi4vLi4vZnJhbWV3b3JrL3N0eWxlcic7XG5pbXBvcnQgeyBJV2lkZ2V0Q29uZmlnIH0gZnJvbSAnLi4vLi4vLi4vZnJhbWV3b3JrL3R5cGVzJztcbmltcG9ydCB7IFN0eWxhYmxlQ29tcG9uZW50IH0gZnJvbSAnLi4vLi4vYmFzZS9zdHlsYWJsZS5jb21wb25lbnQnO1xuaW1wb3J0IHsgcmVnaXN0ZXJQcm9wcyB9IGZyb20gJy4vY2FyZC1jb250ZW50LnByb3BzJztcbmltcG9ydCB7IHByb3ZpZGVBc1dpZGdldFJlZiB9IGZyb20gJy4uLy4uLy4uLy4uL3V0aWxzL3dpZGdldC11dGlscyc7XG5cbmNvbnN0IERFRkFVTFRfQ0xTID0gJ2FwcC1jYXJkLWNvbnRlbnQgY2FyZC1ib2R5IGNhcmQtYmxvY2snO1xuY29uc3QgV0lER0VUX0NPTkZJRzogSVdpZGdldENvbmZpZyA9IHtcbiAgICB3aWRnZXRUeXBlOiAnd20tY2FyZC1jb250ZW50JyxcbiAgICBob3N0Q2xhc3M6IERFRkFVTFRfQ0xTXG59O1xuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ2Rpdlt3bUNhcmRDb250ZW50XScsXG4gICAgdGVtcGxhdGVVcmw6ICcuL2NhcmQtY29udGVudC5jb21wb25lbnQuaHRtbCcsXG4gICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIHByb3ZpZGVBc1dpZGdldFJlZihDYXJkQ29udGVudENvbXBvbmVudClcbiAgICBdXG59KVxuZXhwb3J0IGNsYXNzIENhcmRDb250ZW50Q29tcG9uZW50IGV4dGVuZHMgU3R5bGFibGVDb21wb25lbnQgaW1wbGVtZW50cyBBZnRlclZpZXdJbml0IHtcbiAgICBzdGF0aWMgaW5pdGlhbGl6ZVByb3BzID0gcmVnaXN0ZXJQcm9wcygpO1xuXG4gICAgQFZpZXdDaGlsZCgnY2FyZENvbnRlbnRDb250YWluZXInKSBwcml2YXRlIGNhcmRDb250ZW50Q29udGFpbmVyRWxSZWY6IEVsZW1lbnRSZWY7XG5cbiAgICBjb25zdHJ1Y3Rvcihpbmo6IEluamVjdG9yKSB7XG4gICAgICAgIHN1cGVyKGluaiwgV0lER0VUX0NPTkZJRyk7XG4gICAgfVxuXG4gICAgbmdBZnRlclZpZXdJbml0KCkge1xuICAgICAgICBzdXBlci5uZ0FmdGVyVmlld0luaXQoKTtcbiAgICAgICAgc3R5bGVyKHRoaXMuY2FyZENvbnRlbnRDb250YWluZXJFbFJlZi5uYXRpdmVFbGVtZW50LCB0aGlzLCBBUFBMWV9TVFlMRVNfVFlQRS5DT05UQUlORVIpO1xuICAgIH1cbn1cbiJdfQ==