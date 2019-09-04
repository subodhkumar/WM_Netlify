import { Component, Injector } from '@angular/core';
import { App, switchClass } from '@wm/core';
import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { registerProps } from './page-content.props';
import { StylableComponent } from '../base/stylable.component';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
import { PullToRefresh } from '../pull-to-refresh/pull-to-refresh';
const DEFAULT_CLS = 'app-page-content app-content-column';
const WIDGET_CONFIG = { widgetType: 'wm-page-content', hostClass: DEFAULT_CLS };
export class PageContentComponent extends StylableComponent {
    constructor(inj, app) {
        super(inj, WIDGET_CONFIG);
        this.app = app;
        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);
        this.registerDestroyListener(this.app.subscribe('pullToRefresh:enable', () => {
            this.childPullToRefresh = true;
            this.initPullToRefresh();
        }));
    }
    onPropertyChange(key, nv, ov) {
        if (key === 'columnwidth') {
            switchClass(this.nativeElement, `col-md-${nv} col-sm-${nv}`, `col-md-${ov} col-sm-${ov}`);
        }
        else if (key === 'pulltorefresh' && nv) {
            // creating instance after timeout as the smoothscroll styles where getting added on pull refresh-container
            setTimeout(() => {
                this.initPullToRefresh();
            });
        }
        else {
            super.onPropertyChange(key, nv, ov);
        }
    }
    // when list component is ready, pulltorefresh instance is created and this appends pullToRefresh element on the page content.
    initPullToRefresh() {
        const hasPullToRefreshEvent = this.hasEventCallback('pulltorefresh');
        if (!this.pullToRefreshIns && (this.childPullToRefresh || hasPullToRefreshEvent) && this.pulltorefresh) {
            this.pullToRefreshIns = new PullToRefresh($(this.nativeElement), this.app, () => {
                if (hasPullToRefreshEvent) {
                    this.invokeEventCallback('pulltorefresh');
                }
                else {
                    this.app.notify('pulltorefresh');
                }
            });
            this.registerDestroyListener(() => {
                if (this.pullToRefreshIns.cancelSubscription) {
                    this.pullToRefreshIns.cancelSubscription();
                }
            });
        }
    }
}
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
PageContentComponent.ctorParameters = () => [
    { type: Injector },
    { type: App }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFnZS1jb250ZW50LmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vcGFnZS1jb250ZW50L3BhZ2UtY29udGVudC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFcEQsT0FBTyxFQUFFLEdBQUcsRUFBRSxXQUFXLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFNUMsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQ25FLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUNyRCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUMvRCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUNqRSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sb0NBQW9DLENBQUM7QUFFbkUsTUFBTSxXQUFXLEdBQUcscUNBQXFDLENBQUM7QUFDMUQsTUFBTSxhQUFhLEdBQUcsRUFBQyxVQUFVLEVBQUUsaUJBQWlCLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBQyxDQUFDO0FBUzlFLE1BQU0sT0FBTyxvQkFBcUIsU0FBUSxpQkFBaUI7SUFPdkQsWUFBWSxHQUFhLEVBQVUsR0FBUTtRQUN2QyxLQUFLLENBQUMsR0FBRyxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBREssUUFBRyxHQUFILEdBQUcsQ0FBSztRQUd2QyxNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLEVBQUUsaUJBQWlCLENBQUMsU0FBUyxDQUFDLENBQUM7UUFFOUQsSUFBSSxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLHNCQUFzQixFQUFFLEdBQUcsRUFBRTtZQUN6RSxJQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxDQUFDO1lBQy9CLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1FBQzdCLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDUixDQUFDO0lBRUQsZ0JBQWdCLENBQUMsR0FBVyxFQUFFLEVBQU8sRUFBRSxFQUFRO1FBQzNDLElBQUksR0FBRyxLQUFLLGFBQWEsRUFBRTtZQUN2QixXQUFXLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxVQUFVLEVBQUUsV0FBVyxFQUFFLEVBQUUsRUFBRSxVQUFVLEVBQUUsV0FBVyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1NBQzdGO2FBQU0sSUFBSSxHQUFHLEtBQUssZUFBZSxJQUFJLEVBQUUsRUFBRTtZQUN0QywyR0FBMkc7WUFDM0csVUFBVSxDQUFDLEdBQUcsRUFBRTtnQkFDWixJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztZQUM3QixDQUFDLENBQUMsQ0FBQztTQUNOO2FBQU07WUFDSCxLQUFLLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztTQUN2QztJQUNMLENBQUM7SUFFRCw4SEFBOEg7SUFDdEgsaUJBQWlCO1FBQ3JCLE1BQU0scUJBQXFCLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQ3JFLElBQUksQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLElBQUksQ0FBQyxJQUFJLENBQUMsa0JBQWtCLElBQUkscUJBQXFCLENBQUMsSUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFO1lBQ3BHLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxJQUFJLGFBQWEsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFO2dCQUM1RSxJQUFJLHFCQUFxQixFQUFFO29CQUN2QixJQUFJLENBQUMsbUJBQW1CLENBQUMsZUFBZSxDQUFDLENBQUM7aUJBQzdDO3FCQUFNO29CQUNILElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDO2lCQUNwQztZQUNMLENBQUMsQ0FBQyxDQUFDO1lBQ0gsSUFBSSxDQUFDLHVCQUF1QixDQUFDLEdBQUcsRUFBRTtnQkFDOUIsSUFBSSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsa0JBQWtCLEVBQUU7b0JBQzFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO2lCQUM5QztZQUNMLENBQUMsQ0FBQyxDQUFDO1NBQ047SUFDTCxDQUFDOztBQS9DTSxvQ0FBZSxHQUFHLGFBQWEsRUFBRSxDQUFDOztZQVI1QyxTQUFTLFNBQUM7Z0JBQ1AsUUFBUSxFQUFFLGlCQUFpQjtnQkFDM0IscUNBQTRDO2dCQUM1QyxTQUFTLEVBQUU7b0JBQ1Asa0JBQWtCLENBQUMsb0JBQW9CLENBQUM7aUJBQzNDO2FBQ0o7Ozs7WUFuQm1CLFFBQVE7WUFFbkIsR0FBRyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgSW5qZWN0b3IgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgQXBwLCBzd2l0Y2hDbGFzcyB9IGZyb20gJ0B3bS9jb3JlJztcblxuaW1wb3J0IHsgQVBQTFlfU1RZTEVTX1RZUEUsIHN0eWxlciB9IGZyb20gJy4uLy4uL2ZyYW1ld29yay9zdHlsZXInO1xuaW1wb3J0IHsgcmVnaXN0ZXJQcm9wcyB9IGZyb20gJy4vcGFnZS1jb250ZW50LnByb3BzJztcbmltcG9ydCB7IFN0eWxhYmxlQ29tcG9uZW50IH0gZnJvbSAnLi4vYmFzZS9zdHlsYWJsZS5jb21wb25lbnQnO1xuaW1wb3J0IHsgcHJvdmlkZUFzV2lkZ2V0UmVmIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvd2lkZ2V0LXV0aWxzJztcbmltcG9ydCB7IFB1bGxUb1JlZnJlc2ggfSBmcm9tICcuLi9wdWxsLXRvLXJlZnJlc2gvcHVsbC10by1yZWZyZXNoJztcblxuY29uc3QgREVGQVVMVF9DTFMgPSAnYXBwLXBhZ2UtY29udGVudCBhcHAtY29udGVudC1jb2x1bW4nO1xuY29uc3QgV0lER0VUX0NPTkZJRyA9IHt3aWRnZXRUeXBlOiAnd20tcGFnZS1jb250ZW50JywgaG9zdENsYXNzOiBERUZBVUxUX0NMU307XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnW3dtUGFnZUNvbnRlbnRdJyxcbiAgICB0ZW1wbGF0ZVVybDogJy4vcGFnZS1jb250ZW50LmNvbXBvbmVudC5odG1sJyxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgcHJvdmlkZUFzV2lkZ2V0UmVmKFBhZ2VDb250ZW50Q29tcG9uZW50KVxuICAgIF1cbn0pXG5leHBvcnQgY2xhc3MgUGFnZUNvbnRlbnRDb21wb25lbnQgZXh0ZW5kcyBTdHlsYWJsZUNvbXBvbmVudCB7XG4gICAgc3RhdGljIGluaXRpYWxpemVQcm9wcyA9IHJlZ2lzdGVyUHJvcHMoKTtcblxuICAgIHB1YmxpYyBwdWxsVG9SZWZyZXNoSW5zOiBQdWxsVG9SZWZyZXNoO1xuICAgIHByaXZhdGUgcHVsbHRvcmVmcmVzaDogYm9vbGVhbjtcbiAgICBwcml2YXRlIGNoaWxkUHVsbFRvUmVmcmVzaDogYm9vbGVhbjtcblxuICAgIGNvbnN0cnVjdG9yKGluajogSW5qZWN0b3IsIHByaXZhdGUgYXBwOiBBcHApIHtcbiAgICAgICAgc3VwZXIoaW5qLCBXSURHRVRfQ09ORklHKTtcblxuICAgICAgICBzdHlsZXIodGhpcy5uYXRpdmVFbGVtZW50LCB0aGlzLCBBUFBMWV9TVFlMRVNfVFlQRS5DT05UQUlORVIpO1xuXG4gICAgICAgIHRoaXMucmVnaXN0ZXJEZXN0cm95TGlzdGVuZXIodGhpcy5hcHAuc3Vic2NyaWJlKCdwdWxsVG9SZWZyZXNoOmVuYWJsZScsICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuY2hpbGRQdWxsVG9SZWZyZXNoID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuaW5pdFB1bGxUb1JlZnJlc2goKTtcbiAgICAgICAgfSkpO1xuICAgIH1cblxuICAgIG9uUHJvcGVydHlDaGFuZ2Uoa2V5OiBzdHJpbmcsIG52OiBhbnksIG92PzogYW55KSB7XG4gICAgICAgIGlmIChrZXkgPT09ICdjb2x1bW53aWR0aCcpIHtcbiAgICAgICAgICAgIHN3aXRjaENsYXNzKHRoaXMubmF0aXZlRWxlbWVudCwgYGNvbC1tZC0ke252fSBjb2wtc20tJHtudn1gLCBgY29sLW1kLSR7b3Z9IGNvbC1zbS0ke292fWApO1xuICAgICAgICB9IGVsc2UgaWYgKGtleSA9PT0gJ3B1bGx0b3JlZnJlc2gnICYmIG52KSB7XG4gICAgICAgICAgICAvLyBjcmVhdGluZyBpbnN0YW5jZSBhZnRlciB0aW1lb3V0IGFzIHRoZSBzbW9vdGhzY3JvbGwgc3R5bGVzIHdoZXJlIGdldHRpbmcgYWRkZWQgb24gcHVsbCByZWZyZXNoLWNvbnRhaW5lclxuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbml0UHVsbFRvUmVmcmVzaCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdXBlci5vblByb3BlcnR5Q2hhbmdlKGtleSwgbnYsIG92KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIHdoZW4gbGlzdCBjb21wb25lbnQgaXMgcmVhZHksIHB1bGx0b3JlZnJlc2ggaW5zdGFuY2UgaXMgY3JlYXRlZCBhbmQgdGhpcyBhcHBlbmRzIHB1bGxUb1JlZnJlc2ggZWxlbWVudCBvbiB0aGUgcGFnZSBjb250ZW50LlxuICAgIHByaXZhdGUgaW5pdFB1bGxUb1JlZnJlc2goKSB7XG4gICAgICAgIGNvbnN0IGhhc1B1bGxUb1JlZnJlc2hFdmVudCA9IHRoaXMuaGFzRXZlbnRDYWxsYmFjaygncHVsbHRvcmVmcmVzaCcpO1xuICAgICAgICBpZiAoIXRoaXMucHVsbFRvUmVmcmVzaElucyAmJiAodGhpcy5jaGlsZFB1bGxUb1JlZnJlc2ggfHwgaGFzUHVsbFRvUmVmcmVzaEV2ZW50KSAmJiB0aGlzLnB1bGx0b3JlZnJlc2gpIHtcbiAgICAgICAgICAgIHRoaXMucHVsbFRvUmVmcmVzaElucyA9IG5ldyBQdWxsVG9SZWZyZXNoKCQodGhpcy5uYXRpdmVFbGVtZW50KSwgdGhpcy5hcHAsICgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoaGFzUHVsbFRvUmVmcmVzaEV2ZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW52b2tlRXZlbnRDYWxsYmFjaygncHVsbHRvcmVmcmVzaCcpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYXBwLm5vdGlmeSgncHVsbHRvcmVmcmVzaCcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5yZWdpc3RlckRlc3Ryb3lMaXN0ZW5lcigoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMucHVsbFRvUmVmcmVzaElucy5jYW5jZWxTdWJzY3JpcHRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wdWxsVG9SZWZyZXNoSW5zLmNhbmNlbFN1YnNjcmlwdGlvbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxufVxuIl19