import * as tslib_1 from "tslib";
import { Component, Injector } from '@angular/core';
import { App, switchClass } from '@wm/core';
import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { registerProps } from './page-content.props';
import { StylableComponent } from '../base/stylable.component';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
import { PullToRefresh } from '../pull-to-refresh/pull-to-refresh';
var DEFAULT_CLS = 'app-page-content app-content-column';
var WIDGET_CONFIG = { widgetType: 'wm-page-content', hostClass: DEFAULT_CLS };
var PageContentComponent = /** @class */ (function (_super) {
    tslib_1.__extends(PageContentComponent, _super);
    function PageContentComponent(inj, app) {
        var _this = _super.call(this, inj, WIDGET_CONFIG) || this;
        _this.app = app;
        styler(_this.nativeElement, _this, APPLY_STYLES_TYPE.CONTAINER);
        _this.registerDestroyListener(_this.app.subscribe('pullToRefresh:enable', function () {
            _this.childPullToRefresh = true;
            _this.initPullToRefresh();
        }));
        return _this;
    }
    PageContentComponent.prototype.onPropertyChange = function (key, nv, ov) {
        var _this = this;
        if (key === 'columnwidth') {
            switchClass(this.nativeElement, "col-md-" + nv + " col-sm-" + nv, "col-md-" + ov + " col-sm-" + ov);
        }
        else if (key === 'pulltorefresh' && nv) {
            // creating instance after timeout as the smoothscroll styles where getting added on pull refresh-container
            setTimeout(function () {
                _this.initPullToRefresh();
            });
        }
        else {
            _super.prototype.onPropertyChange.call(this, key, nv, ov);
        }
    };
    // when list component is ready, pulltorefresh instance is created and this appends pullToRefresh element on the page content.
    PageContentComponent.prototype.initPullToRefresh = function () {
        var _this = this;
        var hasPullToRefreshEvent = this.hasEventCallback('pulltorefresh');
        if (!this.pullToRefreshIns && (this.childPullToRefresh || hasPullToRefreshEvent) && this.pulltorefresh) {
            this.pullToRefreshIns = new PullToRefresh($(this.nativeElement), this.app, function () {
                if (hasPullToRefreshEvent) {
                    _this.invokeEventCallback('pulltorefresh');
                }
                else {
                    _this.app.notify('pulltorefresh');
                }
            });
            this.registerDestroyListener(function () {
                if (_this.pullToRefreshIns.cancelSubscription) {
                    _this.pullToRefreshIns.cancelSubscription();
                }
            });
        }
    };
    PageContentComponent.initializeProps = registerProps();
    PageContentComponent.decorators = [
        { type: Component, args: [{
                    selector: '[wmPageContent]',
                    template: "<ng-content></ng-content>",
                    providers: [
                        provideAsWidgetRef(PageContentComponent)
                    ]
                }] }
    ];
    /** @nocollapse */
    PageContentComponent.ctorParameters = function () { return [
        { type: Injector },
        { type: App }
    ]; };
    return PageContentComponent;
}(StylableComponent));
export { PageContentComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFnZS1jb250ZW50LmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vcGFnZS1jb250ZW50L3BhZ2UtY29udGVudC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRXBELE9BQU8sRUFBRSxHQUFHLEVBQUUsV0FBVyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRTVDLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUNuRSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFDckQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDL0QsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDakUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLG9DQUFvQyxDQUFDO0FBRW5FLElBQU0sV0FBVyxHQUFHLHFDQUFxQyxDQUFDO0FBQzFELElBQU0sYUFBYSxHQUFHLEVBQUMsVUFBVSxFQUFFLGlCQUFpQixFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUMsQ0FBQztBQUU5RTtJQU8wQyxnREFBaUI7SUFPdkQsOEJBQVksR0FBYSxFQUFVLEdBQVE7UUFBM0MsWUFDSSxrQkFBTSxHQUFHLEVBQUUsYUFBYSxDQUFDLFNBUTVCO1FBVGtDLFNBQUcsR0FBSCxHQUFHLENBQUs7UUFHdkMsTUFBTSxDQUFDLEtBQUksQ0FBQyxhQUFhLEVBQUUsS0FBSSxFQUFFLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBRTlELEtBQUksQ0FBQyx1QkFBdUIsQ0FBQyxLQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxzQkFBc0IsRUFBRTtZQUNwRSxLQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDO1lBQy9CLEtBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQzdCLENBQUMsQ0FBQyxDQUFDLENBQUM7O0lBQ1IsQ0FBQztJQUVELCtDQUFnQixHQUFoQixVQUFpQixHQUFXLEVBQUUsRUFBTyxFQUFFLEVBQVE7UUFBL0MsaUJBV0M7UUFWRyxJQUFJLEdBQUcsS0FBSyxhQUFhLEVBQUU7WUFDdkIsV0FBVyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsWUFBVSxFQUFFLGdCQUFXLEVBQUksRUFBRSxZQUFVLEVBQUUsZ0JBQVcsRUFBSSxDQUFDLENBQUM7U0FDN0Y7YUFBTSxJQUFJLEdBQUcsS0FBSyxlQUFlLElBQUksRUFBRSxFQUFFO1lBQ3RDLDJHQUEyRztZQUMzRyxVQUFVLENBQUM7Z0JBQ1AsS0FBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7WUFDN0IsQ0FBQyxDQUFDLENBQUM7U0FDTjthQUFNO1lBQ0gsaUJBQU0sZ0JBQWdCLFlBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztTQUN2QztJQUNMLENBQUM7SUFFRCw4SEFBOEg7SUFDdEgsZ0RBQWlCLEdBQXpCO1FBQUEsaUJBZ0JDO1FBZkcsSUFBTSxxQkFBcUIsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDckUsSUFBSSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsSUFBSSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsSUFBSSxxQkFBcUIsQ0FBQyxJQUFJLElBQUksQ0FBQyxhQUFhLEVBQUU7WUFDcEcsSUFBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksYUFBYSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsRUFBRTtnQkFDdkUsSUFBSSxxQkFBcUIsRUFBRTtvQkFDdkIsS0FBSSxDQUFDLG1CQUFtQixDQUFDLGVBQWUsQ0FBQyxDQUFDO2lCQUM3QztxQkFBTTtvQkFDSCxLQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQztpQkFDcEM7WUFDTCxDQUFDLENBQUMsQ0FBQztZQUNILElBQUksQ0FBQyx1QkFBdUIsQ0FBQztnQkFDekIsSUFBSSxLQUFJLENBQUMsZ0JBQWdCLENBQUMsa0JBQWtCLEVBQUU7b0JBQzFDLEtBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO2lCQUM5QztZQUNMLENBQUMsQ0FBQyxDQUFDO1NBQ047SUFDTCxDQUFDO0lBL0NNLG9DQUFlLEdBQUcsYUFBYSxFQUFFLENBQUM7O2dCQVI1QyxTQUFTLFNBQUM7b0JBQ1AsUUFBUSxFQUFFLGlCQUFpQjtvQkFDM0IscUNBQTRDO29CQUM1QyxTQUFTLEVBQUU7d0JBQ1Asa0JBQWtCLENBQUMsb0JBQW9CLENBQUM7cUJBQzNDO2lCQUNKOzs7O2dCQW5CbUIsUUFBUTtnQkFFbkIsR0FBRzs7SUFtRVosMkJBQUM7Q0FBQSxBQXhERCxDQU8wQyxpQkFBaUIsR0FpRDFEO1NBakRZLG9CQUFvQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgSW5qZWN0b3IgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgQXBwLCBzd2l0Y2hDbGFzcyB9IGZyb20gJ0B3bS9jb3JlJztcblxuaW1wb3J0IHsgQVBQTFlfU1RZTEVTX1RZUEUsIHN0eWxlciB9IGZyb20gJy4uLy4uL2ZyYW1ld29yay9zdHlsZXInO1xuaW1wb3J0IHsgcmVnaXN0ZXJQcm9wcyB9IGZyb20gJy4vcGFnZS1jb250ZW50LnByb3BzJztcbmltcG9ydCB7IFN0eWxhYmxlQ29tcG9uZW50IH0gZnJvbSAnLi4vYmFzZS9zdHlsYWJsZS5jb21wb25lbnQnO1xuaW1wb3J0IHsgcHJvdmlkZUFzV2lkZ2V0UmVmIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvd2lkZ2V0LXV0aWxzJztcbmltcG9ydCB7IFB1bGxUb1JlZnJlc2ggfSBmcm9tICcuLi9wdWxsLXRvLXJlZnJlc2gvcHVsbC10by1yZWZyZXNoJztcblxuY29uc3QgREVGQVVMVF9DTFMgPSAnYXBwLXBhZ2UtY29udGVudCBhcHAtY29udGVudC1jb2x1bW4nO1xuY29uc3QgV0lER0VUX0NPTkZJRyA9IHt3aWRnZXRUeXBlOiAnd20tcGFnZS1jb250ZW50JywgaG9zdENsYXNzOiBERUZBVUxUX0NMU307XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnW3dtUGFnZUNvbnRlbnRdJyxcbiAgICB0ZW1wbGF0ZVVybDogJy4vcGFnZS1jb250ZW50LmNvbXBvbmVudC5odG1sJyxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgcHJvdmlkZUFzV2lkZ2V0UmVmKFBhZ2VDb250ZW50Q29tcG9uZW50KVxuICAgIF1cbn0pXG5leHBvcnQgY2xhc3MgUGFnZUNvbnRlbnRDb21wb25lbnQgZXh0ZW5kcyBTdHlsYWJsZUNvbXBvbmVudCB7XG4gICAgc3RhdGljIGluaXRpYWxpemVQcm9wcyA9IHJlZ2lzdGVyUHJvcHMoKTtcblxuICAgIHB1YmxpYyBwdWxsVG9SZWZyZXNoSW5zOiBQdWxsVG9SZWZyZXNoO1xuICAgIHByaXZhdGUgcHVsbHRvcmVmcmVzaDogYm9vbGVhbjtcbiAgICBwcml2YXRlIGNoaWxkUHVsbFRvUmVmcmVzaDogYm9vbGVhbjtcblxuICAgIGNvbnN0cnVjdG9yKGluajogSW5qZWN0b3IsIHByaXZhdGUgYXBwOiBBcHApIHtcbiAgICAgICAgc3VwZXIoaW5qLCBXSURHRVRfQ09ORklHKTtcblxuICAgICAgICBzdHlsZXIodGhpcy5uYXRpdmVFbGVtZW50LCB0aGlzLCBBUFBMWV9TVFlMRVNfVFlQRS5DT05UQUlORVIpO1xuXG4gICAgICAgIHRoaXMucmVnaXN0ZXJEZXN0cm95TGlzdGVuZXIodGhpcy5hcHAuc3Vic2NyaWJlKCdwdWxsVG9SZWZyZXNoOmVuYWJsZScsICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuY2hpbGRQdWxsVG9SZWZyZXNoID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuaW5pdFB1bGxUb1JlZnJlc2goKTtcbiAgICAgICAgfSkpO1xuICAgIH1cblxuICAgIG9uUHJvcGVydHlDaGFuZ2Uoa2V5OiBzdHJpbmcsIG52OiBhbnksIG92PzogYW55KSB7XG4gICAgICAgIGlmIChrZXkgPT09ICdjb2x1bW53aWR0aCcpIHtcbiAgICAgICAgICAgIHN3aXRjaENsYXNzKHRoaXMubmF0aXZlRWxlbWVudCwgYGNvbC1tZC0ke252fSBjb2wtc20tJHtudn1gLCBgY29sLW1kLSR7b3Z9IGNvbC1zbS0ke292fWApO1xuICAgICAgICB9IGVsc2UgaWYgKGtleSA9PT0gJ3B1bGx0b3JlZnJlc2gnICYmIG52KSB7XG4gICAgICAgICAgICAvLyBjcmVhdGluZyBpbnN0YW5jZSBhZnRlciB0aW1lb3V0IGFzIHRoZSBzbW9vdGhzY3JvbGwgc3R5bGVzIHdoZXJlIGdldHRpbmcgYWRkZWQgb24gcHVsbCByZWZyZXNoLWNvbnRhaW5lclxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbml0UHVsbFRvUmVmcmVzaCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdXBlci5vblByb3BlcnR5Q2hhbmdlKGtleSwgbnYsIG92KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIHdoZW4gbGlzdCBjb21wb25lbnQgaXMgcmVhZHksIHB1bGx0b3JlZnJlc2ggaW5zdGFuY2UgaXMgY3JlYXRlZCBhbmQgdGhpcyBhcHBlbmRzIHB1bGxUb1JlZnJlc2ggZWxlbWVudCBvbiB0aGUgcGFnZSBjb250ZW50LlxuICAgIHByaXZhdGUgaW5pdFB1bGxUb1JlZnJlc2goKSB7XG4gICAgICAgIGNvbnN0IGhhc1B1bGxUb1JlZnJlc2hFdmVudCA9IHRoaXMuaGFzRXZlbnRDYWxsYmFjaygncHVsbHRvcmVmcmVzaCcpO1xuICAgICAgICBpZiAoIXRoaXMucHVsbFRvUmVmcmVzaElucyAmJiAodGhpcy5jaGlsZFB1bGxUb1JlZnJlc2ggfHwgaGFzUHVsbFRvUmVmcmVzaEV2ZW50KSAmJiB0aGlzLnB1bGx0b3JlZnJlc2gpIHtcbiAgICAgICAgICAgIHRoaXMucHVsbFRvUmVmcmVzaElucyA9IG5ldyBQdWxsVG9SZWZyZXNoKCQodGhpcy5uYXRpdmVFbGVtZW50KSwgdGhpcy5hcHAsICgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoaGFzUHVsbFRvUmVmcmVzaEV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW52b2tlRXZlbnRDYWxsYmFjaygncHVsbHRvcmVmcmVzaCcpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYXBwLm5vdGlmeSgncHVsbHRvcmVmcmVzaCcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5yZWdpc3RlckRlc3Ryb3lMaXN0ZW5lcigoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucHVsbFRvUmVmcmVzaElucy5jYW5jZWxTdWJzY3JpcHRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wdWxsVG9SZWZyZXNoSW5zLmNhbmNlbFN1YnNjcmlwdGlvbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxufVxuIl19