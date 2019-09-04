import { Component, ElementRef, Injector, ViewChild } from '@angular/core';
import { APPLY_STYLES_TYPE, styler } from '../../../framework/styler';
import { StylableComponent } from '../../base/stylable.component';
import { registerProps } from './card-content.props';
import { provideAsWidgetRef } from '../../../../utils/widget-utils';
const DEFAULT_CLS = 'app-card-content card-body card-block';
const WIDGET_CONFIG = {
    widgetType: 'wm-card-content',
    hostClass: DEFAULT_CLS
};
export class CardContentComponent extends StylableComponent {
    constructor(inj) {
        super(inj, WIDGET_CONFIG);
    }
    ngAfterViewInit() {
        super.ngAfterViewInit();
        styler(this.cardContentContainerElRef.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);
    }
}
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
CardContentComponent.ctorParameters = () => [
    { type: Injector }
];
CardContentComponent.propDecorators = {
    cardContentContainerElRef: [{ type: ViewChild, args: ['cardContentContainer',] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FyZC1jb250ZW50LmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vY2FyZC9jYXJkLWNvbnRlbnQvY2FyZC1jb250ZW50LmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQWlCLFNBQVMsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUUxRixPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFFdEUsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFDbEUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLHNCQUFzQixDQUFDO0FBQ3JELE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBRXBFLE1BQU0sV0FBVyxHQUFHLHVDQUF1QyxDQUFDO0FBQzVELE1BQU0sYUFBYSxHQUFrQjtJQUNqQyxVQUFVLEVBQUUsaUJBQWlCO0lBQzdCLFNBQVMsRUFBRSxXQUFXO0NBQ3pCLENBQUM7QUFTRixNQUFNLE9BQU8sb0JBQXFCLFNBQVEsaUJBQWlCO0lBS3ZELFlBQVksR0FBYTtRQUNyQixLQUFLLENBQUMsR0FBRyxFQUFFLGFBQWEsQ0FBQyxDQUFDO0lBQzlCLENBQUM7SUFFRCxlQUFlO1FBQ1gsS0FBSyxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQ3hCLE1BQU0sQ0FBQyxJQUFJLENBQUMseUJBQXlCLENBQUMsYUFBYSxFQUFFLElBQUksRUFBRSxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUM1RixDQUFDOztBQVhNLG9DQUFlLEdBQUcsYUFBYSxFQUFFLENBQUM7O1lBUjVDLFNBQVMsU0FBQztnQkFDUCxRQUFRLEVBQUUsb0JBQW9CO2dCQUM5Qix1R0FBNEM7Z0JBQzVDLFNBQVMsRUFBRTtvQkFDUCxrQkFBa0IsQ0FBQyxvQkFBb0IsQ0FBQztpQkFDM0M7YUFDSjs7OztZQXBCOEMsUUFBUTs7O3dDQXdCbEQsU0FBUyxTQUFDLHNCQUFzQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFmdGVyVmlld0luaXQsIENvbXBvbmVudCwgRWxlbWVudFJlZiwgSW5qZWN0b3IsIFZpZXdDaGlsZCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBBUFBMWV9TVFlMRVNfVFlQRSwgc3R5bGVyIH0gZnJvbSAnLi4vLi4vLi4vZnJhbWV3b3JrL3N0eWxlcic7XG5pbXBvcnQgeyBJV2lkZ2V0Q29uZmlnIH0gZnJvbSAnLi4vLi4vLi4vZnJhbWV3b3JrL3R5cGVzJztcbmltcG9ydCB7IFN0eWxhYmxlQ29tcG9uZW50IH0gZnJvbSAnLi4vLi4vYmFzZS9zdHlsYWJsZS5jb21wb25lbnQnO1xuaW1wb3J0IHsgcmVnaXN0ZXJQcm9wcyB9IGZyb20gJy4vY2FyZC1jb250ZW50LnByb3BzJztcbmltcG9ydCB7IHByb3ZpZGVBc1dpZGdldFJlZiB9IGZyb20gJy4uLy4uLy4uLy4uL3V0aWxzL3dpZGdldC11dGlscyc7XG5cbmNvbnN0IERFRkFVTFRfQ0xTID0gJ2FwcC1jYXJkLWNvbnRlbnQgY2FyZC1ib2R5IGNhcmQtYmxvY2snO1xuY29uc3QgV0lER0VUX0NPTkZJRzogSVdpZGdldENvbmZpZyA9IHtcbiAgICB3aWRnZXRUeXBlOiAnd20tY2FyZC1jb250ZW50JyxcbiAgICBob3N0Q2xhc3M6IERFRkFVTFRfQ0xTXG59O1xuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ2Rpdlt3bUNhcmRDb250ZW50XScsXG4gICAgdGVtcGxhdGVVcmw6ICcuL2NhcmQtY29udGVudC5jb21wb25lbnQuaHRtbCcsXG4gICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIHByb3ZpZGVBc1dpZGdldFJlZihDYXJkQ29udGVudENvbXBvbmVudClcbiAgICBdXG59KVxuZXhwb3J0IGNsYXNzIENhcmRDb250ZW50Q29tcG9uZW50IGV4dGVuZHMgU3R5bGFibGVDb21wb25lbnQgaW1wbGVtZW50cyBBZnRlclZpZXdJbml0IHtcbiAgICBzdGF0aWMgaW5pdGlhbGl6ZVByb3BzID0gcmVnaXN0ZXJQcm9wcygpO1xuXG4gICAgQFZpZXdDaGlsZCgnY2FyZENvbnRlbnRDb250YWluZXInKSBwcml2YXRlIGNhcmRDb250ZW50Q29udGFpbmVyRWxSZWY6IEVsZW1lbnRSZWY7XG5cbiAgICBjb25zdHJ1Y3Rvcihpbmo6IEluamVjdG9yKSB7XG4gICAgICAgIHN1cGVyKGluaiwgV0lER0VUX0NPTkZJRyk7XG4gICAgfVxuXG4gICAgbmdBZnRlclZpZXdJbml0KCkge1xuICAgICAgICBzdXBlci5uZ0FmdGVyVmlld0luaXQoKTtcbiAgICAgICAgc3R5bGVyKHRoaXMuY2FyZENvbnRlbnRDb250YWluZXJFbFJlZi5uYXRpdmVFbGVtZW50LCB0aGlzLCBBUFBMWV9TVFlMRVNfVFlQRS5DT05UQUlORVIpO1xuICAgIH1cbn1cbiJdfQ==