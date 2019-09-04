import * as tslib_1 from "tslib";
import { Attribute, Directive, Injector, SecurityContext } from '@angular/core';
import { setCSS, setProperty } from '@wm/core';
import { styler } from '../../framework/styler';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './html.props';
import { TrustAsPipe } from '../../../pipes/trust-as.pipe';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
var DEFAULT_CLS = 'app-html-container';
var WIDGET_CONFIG = {
    widgetType: 'wm-html',
    hostClass: DEFAULT_CLS
};
var HtmlDirective = /** @class */ (function (_super) {
    tslib_1.__extends(HtmlDirective, _super);
    function HtmlDirective(inj, height, boundContent, trustAsPipe) {
        var _this = _super.call(this, inj, WIDGET_CONFIG) || this;
        _this.boundContent = boundContent;
        _this.trustAsPipe = trustAsPipe;
        // if the height is provided set the overflow to auto
        if (height) {
            setCSS(_this.nativeElement, 'overflow', 'auto');
        }
        styler(_this.nativeElement, _this);
        return _this;
    }
    HtmlDirective.prototype.ngOnInit = function () {
        _super.prototype.ngOnInit.call(this);
        if (this.boundContent) {
            this.nativeElement.innerHTML = '';
        }
        if (!this.content && this.nativeElement.innerHTML) {
            this.content = this.nativeElement.innerHTML;
        }
    };
    HtmlDirective.prototype.onPropertyChange = function (key, nv, ov) {
        if (key === 'content') {
            setProperty(this.nativeElement, 'innerHTML', this.trustAsPipe.transform(nv, SecurityContext.HTML));
        }
        else {
            _super.prototype.onPropertyChange.call(this, key, nv, ov);
        }
    };
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
    HtmlDirective.ctorParameters = function () { return [
        { type: Injector },
        { type: String, decorators: [{ type: Attribute, args: ['height',] }] },
        { type: String, decorators: [{ type: Attribute, args: ['content.bind',] }] },
        { type: TrustAsPipe }
    ]; };
    return HtmlDirective;
}(StylableComponent));
export { HtmlDirective };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHRtbC5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL2h0bWwvaHRtbC5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxlQUFlLEVBQVUsTUFBTSxlQUFlLENBQUM7QUFFeEYsT0FBTyxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFL0MsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBRWhELE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQy9ELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFDN0MsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQzNELE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBRWpFLElBQU0sV0FBVyxHQUFHLG9CQUFvQixDQUFDO0FBQ3pDLElBQU0sYUFBYSxHQUFrQjtJQUNqQyxVQUFVLEVBQUUsU0FBUztJQUNyQixTQUFTLEVBQUUsV0FBVztDQUN6QixDQUFDO0FBRUY7SUFNbUMseUNBQWlCO0lBSWhELHVCQUNJLEdBQWEsRUFDUSxNQUFjLEVBQ0EsWUFBb0IsRUFDL0MsV0FBd0I7UUFKcEMsWUFNSSxrQkFBTSxHQUFHLEVBQUUsYUFBYSxDQUFDLFNBUTVCO1FBWHNDLGtCQUFZLEdBQVosWUFBWSxDQUFRO1FBQy9DLGlCQUFXLEdBQVgsV0FBVyxDQUFhO1FBSWhDLHFEQUFxRDtRQUNyRCxJQUFJLE1BQU0sRUFBRTtZQUNSLE1BQU0sQ0FBQyxLQUFJLENBQUMsYUFBYSxFQUFFLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQztTQUNsRDtRQUVELE1BQU0sQ0FBQyxLQUFJLENBQUMsYUFBYSxFQUFFLEtBQUksQ0FBQyxDQUFDOztJQUNyQyxDQUFDO0lBRUQsZ0NBQVEsR0FBUjtRQUNJLGlCQUFNLFFBQVEsV0FBRSxDQUFDO1FBQ2pCLElBQUksSUFBSSxDQUFDLFlBQVksRUFBRTtZQUNuQixJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUM7U0FDckM7UUFDRCxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsYUFBYSxDQUFDLFNBQVMsRUFBRTtZQUMvQyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDO1NBQy9DO0lBQ0wsQ0FBQztJQUVELHdDQUFnQixHQUFoQixVQUFpQixHQUFXLEVBQUUsRUFBTyxFQUFFLEVBQVE7UUFDM0MsSUFBSSxHQUFHLEtBQUssU0FBUyxFQUFFO1lBQ25CLFdBQVcsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLFdBQVcsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxFQUFFLEVBQUUsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7U0FDdEc7YUFBTTtZQUNILGlCQUFNLGdCQUFnQixZQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7U0FDdkM7SUFDTCxDQUFDO0lBbkNNLDZCQUFlLEdBQUcsYUFBYSxFQUFFLENBQUM7O2dCQVA1QyxTQUFTLFNBQUM7b0JBQ1AsUUFBUSxFQUFFLFVBQVU7b0JBQ3BCLFNBQVMsRUFBRTt3QkFDUCxrQkFBa0IsQ0FBQyxhQUFhLENBQUM7cUJBQ3BDO2lCQUNKOzs7O2dCQXRCOEIsUUFBUTs2Q0E2QjlCLFNBQVMsU0FBQyxRQUFROzZDQUNsQixTQUFTLFNBQUMsY0FBYztnQkF0QnhCLFdBQVc7O0lBb0RwQixvQkFBQztDQUFBLEFBM0NELENBTW1DLGlCQUFpQixHQXFDbkQ7U0FyQ1ksYUFBYSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEF0dHJpYnV0ZSwgRGlyZWN0aXZlLCBJbmplY3RvciwgU2VjdXJpdHlDb250ZXh0LCBPbkluaXQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgc2V0Q1NTLCBzZXRQcm9wZXJ0eSB9IGZyb20gJ0B3bS9jb3JlJztcblxuaW1wb3J0IHsgc3R5bGVyIH0gZnJvbSAnLi4vLi4vZnJhbWV3b3JrL3N0eWxlcic7XG5pbXBvcnQgeyBJV2lkZ2V0Q29uZmlnIH0gZnJvbSAnLi4vLi4vZnJhbWV3b3JrL3R5cGVzJztcbmltcG9ydCB7IFN0eWxhYmxlQ29tcG9uZW50IH0gZnJvbSAnLi4vYmFzZS9zdHlsYWJsZS5jb21wb25lbnQnO1xuaW1wb3J0IHsgcmVnaXN0ZXJQcm9wcyB9IGZyb20gJy4vaHRtbC5wcm9wcyc7XG5pbXBvcnQgeyBUcnVzdEFzUGlwZSB9IGZyb20gJy4uLy4uLy4uL3BpcGVzL3RydXN0LWFzLnBpcGUnO1xuaW1wb3J0IHsgcHJvdmlkZUFzV2lkZ2V0UmVmIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvd2lkZ2V0LXV0aWxzJztcblxuY29uc3QgREVGQVVMVF9DTFMgPSAnYXBwLWh0bWwtY29udGFpbmVyJztcbmNvbnN0IFdJREdFVF9DT05GSUc6IElXaWRnZXRDb25maWcgPSB7XG4gICAgd2lkZ2V0VHlwZTogJ3dtLWh0bWwnLFxuICAgIGhvc3RDbGFzczogREVGQVVMVF9DTFNcbn07XG5cbkBEaXJlY3RpdmUoe1xuICAgIHNlbGVjdG9yOiAnW3dtSHRtbF0nLFxuICAgIHByb3ZpZGVyczogW1xuICAgICAgICBwcm92aWRlQXNXaWRnZXRSZWYoSHRtbERpcmVjdGl2ZSlcbiAgICBdXG59KVxuZXhwb3J0IGNsYXNzIEh0bWxEaXJlY3RpdmUgZXh0ZW5kcyBTdHlsYWJsZUNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCB7XG4gICAgc3RhdGljIGluaXRpYWxpemVQcm9wcyA9IHJlZ2lzdGVyUHJvcHMoKTtcbiAgICBwdWJsaWMgY29udGVudDogc3RyaW5nO1xuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIGluajogSW5qZWN0b3IsXG4gICAgICAgIEBBdHRyaWJ1dGUoJ2hlaWdodCcpIGhlaWdodDogc3RyaW5nLFxuICAgICAgICBAQXR0cmlidXRlKCdjb250ZW50LmJpbmQnKSBwcml2YXRlIGJvdW5kQ29udGVudDogc3RyaW5nLFxuICAgICAgICBwcml2YXRlIHRydXN0QXNQaXBlOiBUcnVzdEFzUGlwZSxcbiAgICApIHtcbiAgICAgICAgc3VwZXIoaW5qLCBXSURHRVRfQ09ORklHKTtcblxuICAgICAgICAvLyBpZiB0aGUgaGVpZ2h0IGlzIHByb3ZpZGVkIHNldCB0aGUgb3ZlcmZsb3cgdG8gYXV0b1xuICAgICAgICBpZiAoaGVpZ2h0KSB7XG4gICAgICAgICAgICBzZXRDU1ModGhpcy5uYXRpdmVFbGVtZW50LCAnb3ZlcmZsb3cnLCAnYXV0bycpO1xuICAgICAgICB9XG5cbiAgICAgICAgc3R5bGVyKHRoaXMubmF0aXZlRWxlbWVudCwgdGhpcyk7XG4gICAgfVxuXG4gICAgbmdPbkluaXQoKSB7XG4gICAgICAgIHN1cGVyLm5nT25Jbml0KCk7XG4gICAgICAgIGlmICh0aGlzLmJvdW5kQ29udGVudCkge1xuICAgICAgICAgICAgdGhpcy5uYXRpdmVFbGVtZW50LmlubmVySFRNTCA9ICcnO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5jb250ZW50ICYmIHRoaXMubmF0aXZlRWxlbWVudC5pbm5lckhUTUwpIHtcbiAgICAgICAgICAgIHRoaXMuY29udGVudCA9IHRoaXMubmF0aXZlRWxlbWVudC5pbm5lckhUTUw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBvblByb3BlcnR5Q2hhbmdlKGtleTogc3RyaW5nLCBudjogYW55LCBvdj86IGFueSkge1xuICAgICAgICBpZiAoa2V5ID09PSAnY29udGVudCcpIHtcbiAgICAgICAgICAgIHNldFByb3BlcnR5KHRoaXMubmF0aXZlRWxlbWVudCwgJ2lubmVySFRNTCcsIHRoaXMudHJ1c3RBc1BpcGUudHJhbnNmb3JtKG52LCBTZWN1cml0eUNvbnRleHQuSFRNTCkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3VwZXIub25Qcm9wZXJ0eUNoYW5nZShrZXksIG52LCBvdik7XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=