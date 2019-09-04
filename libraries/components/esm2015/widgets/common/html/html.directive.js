import { Attribute, Directive, Injector, SecurityContext } from '@angular/core';
import { setCSS, setProperty } from '@wm/core';
import { styler } from '../../framework/styler';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './html.props';
import { TrustAsPipe } from '../../../pipes/trust-as.pipe';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
const DEFAULT_CLS = 'app-html-container';
const WIDGET_CONFIG = {
    widgetType: 'wm-html',
    hostClass: DEFAULT_CLS
};
export class HtmlDirective extends StylableComponent {
    constructor(inj, height, boundContent, trustAsPipe) {
        super(inj, WIDGET_CONFIG);
        this.boundContent = boundContent;
        this.trustAsPipe = trustAsPipe;
        // if the height is provided set the overflow to auto
        if (height) {
            setCSS(this.nativeElement, 'overflow', 'auto');
        }
        styler(this.nativeElement, this);
    }
    ngOnInit() {
        super.ngOnInit();
        if (this.boundContent) {
            this.nativeElement.innerHTML = '';
        }
        if (!this.content && this.nativeElement.innerHTML) {
            this.content = this.nativeElement.innerHTML;
        }
    }
    onPropertyChange(key, nv, ov) {
        if (key === 'content') {
            setProperty(this.nativeElement, 'innerHTML', this.trustAsPipe.transform(nv, SecurityContext.HTML));
        }
        else {
            super.onPropertyChange(key, nv, ov);
        }
    }
}
HtmlDirective.initializeProps = registerProps();
HtmlDirective.decorators = [
    { type: Directive, args: [{
                selector: '[wmHtml]',
                providers: [
                    provideAsWidgetRef(HtmlDirective)
                ]
            },] }
];
/** @nocollapse */
HtmlDirective.ctorParameters = () => [
    { type: Injector },
    { type: String, decorators: [{ type: Attribute, args: ['height',] }] },
    { type: String, decorators: [{ type: Attribute, args: ['content.bind',] }] },
    { type: TrustAsPipe }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHRtbC5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL2h0bWwvaHRtbC5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLGVBQWUsRUFBVSxNQUFNLGVBQWUsQ0FBQztBQUV4RixPQUFPLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUUvQyxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFFaEQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDL0QsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUM3QyxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sOEJBQThCLENBQUM7QUFDM0QsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFFakUsTUFBTSxXQUFXLEdBQUcsb0JBQW9CLENBQUM7QUFDekMsTUFBTSxhQUFhLEdBQWtCO0lBQ2pDLFVBQVUsRUFBRSxTQUFTO0lBQ3JCLFNBQVMsRUFBRSxXQUFXO0NBQ3pCLENBQUM7QUFRRixNQUFNLE9BQU8sYUFBYyxTQUFRLGlCQUFpQjtJQUloRCxZQUNJLEdBQWEsRUFDUSxNQUFjLEVBQ0EsWUFBb0IsRUFDL0MsV0FBd0I7UUFFaEMsS0FBSyxDQUFDLEdBQUcsRUFBRSxhQUFhLENBQUMsQ0FBQztRQUhTLGlCQUFZLEdBQVosWUFBWSxDQUFRO1FBQy9DLGdCQUFXLEdBQVgsV0FBVyxDQUFhO1FBSWhDLHFEQUFxRDtRQUNyRCxJQUFJLE1BQU0sRUFBRTtZQUNSLE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQztTQUNsRDtRQUVELE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUFFRCxRQUFRO1FBQ0osS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ2pCLElBQUksSUFBSSxDQUFDLFlBQVksRUFBRTtZQUNuQixJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7U0FDckM7UUFDRCxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsRUFBRTtZQUMvQyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDO1NBQy9DO0lBQ0wsQ0FBQztJQUVELGdCQUFnQixDQUFDLEdBQVcsRUFBRSxFQUFPLEVBQUUsRUFBUTtRQUMzQyxJQUFJLEdBQUcsS0FBSyxTQUFTLEVBQUU7WUFDbkIsV0FBVyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsV0FBVyxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLEVBQUUsRUFBRSxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztTQUN0RzthQUFNO1lBQ0gsS0FBSyxDQUFDLGdCQUFnQixDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7U0FDdkM7SUFDTCxDQUFDOztBQW5DTSw2QkFBZSxHQUFHLGFBQWEsRUFBRSxDQUFDOztZQVA1QyxTQUFTLFNBQUM7Z0JBQ1AsUUFBUSxFQUFFLFVBQVU7Z0JBQ3BCLFNBQVMsRUFBRTtvQkFDUCxrQkFBa0IsQ0FBQyxhQUFhLENBQUM7aUJBQ3BDO2FBQ0o7Ozs7WUF0QjhCLFFBQVE7eUNBNkI5QixTQUFTLFNBQUMsUUFBUTt5Q0FDbEIsU0FBUyxTQUFDLGNBQWM7WUF0QnhCLFdBQVciLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBdHRyaWJ1dGUsIERpcmVjdGl2ZSwgSW5qZWN0b3IsIFNlY3VyaXR5Q29udGV4dCwgT25Jbml0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IHNldENTUywgc2V0UHJvcGVydHkgfSBmcm9tICdAd20vY29yZSc7XG5cbmltcG9ydCB7IHN0eWxlciB9IGZyb20gJy4uLy4uL2ZyYW1ld29yay9zdHlsZXInO1xuaW1wb3J0IHsgSVdpZGdldENvbmZpZyB9IGZyb20gJy4uLy4uL2ZyYW1ld29yay90eXBlcyc7XG5pbXBvcnQgeyBTdHlsYWJsZUNvbXBvbmVudCB9IGZyb20gJy4uL2Jhc2Uvc3R5bGFibGUuY29tcG9uZW50JztcbmltcG9ydCB7IHJlZ2lzdGVyUHJvcHMgfSBmcm9tICcuL2h0bWwucHJvcHMnO1xuaW1wb3J0IHsgVHJ1c3RBc1BpcGUgfSBmcm9tICcuLi8uLi8uLi9waXBlcy90cnVzdC1hcy5waXBlJztcbmltcG9ydCB7IHByb3ZpZGVBc1dpZGdldFJlZiB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL3dpZGdldC11dGlscyc7XG5cbmNvbnN0IERFRkFVTFRfQ0xTID0gJ2FwcC1odG1sLWNvbnRhaW5lcic7XG5jb25zdCBXSURHRVRfQ09ORklHOiBJV2lkZ2V0Q29uZmlnID0ge1xuICAgIHdpZGdldFR5cGU6ICd3bS1odG1sJyxcbiAgICBob3N0Q2xhc3M6IERFRkFVTFRfQ0xTXG59O1xuXG5ARGlyZWN0aXZlKHtcbiAgICBzZWxlY3RvcjogJ1t3bUh0bWxdJyxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgcHJvdmlkZUFzV2lkZ2V0UmVmKEh0bWxEaXJlY3RpdmUpXG4gICAgXVxufSlcbmV4cG9ydCBjbGFzcyBIdG1sRGlyZWN0aXZlIGV4dGVuZHMgU3R5bGFibGVDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQge1xuICAgIHN0YXRpYyBpbml0aWFsaXplUHJvcHMgPSByZWdpc3RlclByb3BzKCk7XG4gICAgcHVibGljIGNvbnRlbnQ6IHN0cmluZztcblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBpbmo6IEluamVjdG9yLFxuICAgICAgICBAQXR0cmlidXRlKCdoZWlnaHQnKSBoZWlnaHQ6IHN0cmluZyxcbiAgICAgICAgQEF0dHJpYnV0ZSgnY29udGVudC5iaW5kJykgcHJpdmF0ZSBib3VuZENvbnRlbnQ6IHN0cmluZyxcbiAgICAgICAgcHJpdmF0ZSB0cnVzdEFzUGlwZTogVHJ1c3RBc1BpcGUsXG4gICAgKSB7XG4gICAgICAgIHN1cGVyKGluaiwgV0lER0VUX0NPTkZJRyk7XG5cbiAgICAgICAgLy8gaWYgdGhlIGhlaWdodCBpcyBwcm92aWRlZCBzZXQgdGhlIG92ZXJmbG93IHRvIGF1dG9cbiAgICAgICAgaWYgKGhlaWdodCkge1xuICAgICAgICAgICAgc2V0Q1NTKHRoaXMubmF0aXZlRWxlbWVudCwgJ292ZXJmbG93JywgJ2F1dG8nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN0eWxlcih0aGlzLm5hdGl2ZUVsZW1lbnQsIHRoaXMpO1xuICAgIH1cblxuICAgIG5nT25Jbml0KCkge1xuICAgICAgICBzdXBlci5uZ09uSW5pdCgpO1xuICAgICAgICBpZiAodGhpcy5ib3VuZENvbnRlbnQpIHtcbiAgICAgICAgICAgIHRoaXMubmF0aXZlRWxlbWVudC5pbm5lckhUTUwgPSAnJztcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMuY29udGVudCAmJiB0aGlzLm5hdGl2ZUVsZW1lbnQuaW5uZXJIVE1MKSB7XG4gICAgICAgICAgICB0aGlzLmNvbnRlbnQgPSB0aGlzLm5hdGl2ZUVsZW1lbnQuaW5uZXJIVE1MO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25Qcm9wZXJ0eUNoYW5nZShrZXk6IHN0cmluZywgbnY6IGFueSwgb3Y/OiBhbnkpIHtcbiAgICAgICAgaWYgKGtleSA9PT0gJ2NvbnRlbnQnKSB7XG4gICAgICAgICAgICBzZXRQcm9wZXJ0eSh0aGlzLm5hdGl2ZUVsZW1lbnQsICdpbm5lckhUTUwnLCB0aGlzLnRydXN0QXNQaXBlLnRyYW5zZm9ybShudiwgU2VjdXJpdHlDb250ZXh0LkhUTUwpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN1cGVyLm9uUHJvcGVydHlDaGFuZ2Uoa2V5LCBudiwgb3YpO1xuICAgICAgICB9XG4gICAgfVxufVxuIl19