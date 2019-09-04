import { Component, Injector } from '@angular/core';
import { APPLY_STYLES_TYPE, provideAsWidgetRef, StylableComponent, styler } from '@wm/components';
import { registerProps } from './segment-content.props';
import { SegmentedControlComponent } from '../segmented-control.component';
const DEFAULT_CLS = 'app-segment-content clearfix';
const WIDGET_CONFIG = { widgetType: 'wm-segment-content', hostClass: DEFAULT_CLS };
export class SegmentContentComponent extends StylableComponent {
    constructor(segmentedControl, inj) {
        super(inj, WIDGET_CONFIG);
        this.segmentedControl = segmentedControl;
        this.compile = false;
        styler(this.nativeElement, this, APPLY_STYLES_TYPE.SCROLLABLE_CONTAINER);
        segmentedControl.addContent(this);
    }
    ngAfterViewInit() {
        // load the content on demand when loadmode is not specified
        if (!this.loadmode) {
            this.loadContent(true);
        }
    }
    navigate() {
        this.segmentedControl.showContent(this);
    }
    // sets the compile flag to load the content
    _loadContent() {
        if (!this.compile) {
            this.compile = true;
            this.invokeEventCallback('ready');
        }
    }
    loadContent(defaultLoad) {
        if (this.loadmode === 'after-delay' || defaultLoad) {
            setTimeout(this._loadContent.bind(this), defaultLoad ? 0 : this.loaddelay);
        }
        else {
            this._loadContent();
        }
    }
}
SegmentContentComponent.initializeProps = registerProps();
SegmentContentComponent.decorators = [
    { type: Component, args: [{
                selector: '[wmSegmentContent]',
                template: "<ng-content *ngIf=\"compile\"></ng-content>",
                providers: [
                    provideAsWidgetRef(SegmentContentComponent)
                ]
            }] }
];
/** @nocollapse */
SegmentContentComponent.ctorParameters = () => [
    { type: SegmentedControlComponent },
    { type: Injector }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VnbWVudC1jb250ZW50LmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9tb2JpbGUvY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvc2VnbWVudGVkLWNvbnRyb2wvc2VnbWVudC1jb250ZW50L3NlZ21lbnQtY29udGVudC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFpQixTQUFTLEVBQUUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRW5FLE9BQU8sRUFBRSxpQkFBaUIsRUFBaUIsa0JBQWtCLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFakgsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ3hELE9BQU8sRUFBRSx5QkFBeUIsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBSTNFLE1BQU0sV0FBVyxHQUFHLDhCQUE4QixDQUFDO0FBQ25ELE1BQU0sYUFBYSxHQUFrQixFQUFDLFVBQVUsRUFBRSxvQkFBb0IsRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFDLENBQUM7QUFTaEcsTUFBTSxPQUFPLHVCQUF3QixTQUFRLGlCQUFpQjtJQU8xRCxZQUFvQixnQkFBMkMsRUFBRSxHQUFhO1FBQzFFLEtBQUssQ0FBQyxHQUFHLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFEVixxQkFBZ0IsR0FBaEIsZ0JBQWdCLENBQTJCO1FBSHhELFlBQU8sR0FBRyxLQUFLLENBQUM7UUFLbkIsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsSUFBSSxFQUFFLGlCQUFpQixDQUFDLG9CQUFvQixDQUFDLENBQUM7UUFDekUsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3RDLENBQUM7SUFFTSxlQUFlO1FBQ2xCLDREQUE0RDtRQUM1RCxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUNoQixJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQzFCO0lBQ0wsQ0FBQztJQUVNLFFBQVE7UUFDWCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzVDLENBQUM7SUFFRCw0Q0FBNEM7SUFDcEMsWUFBWTtRQUNoQixJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRTtZQUNmLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO1lBQ3BCLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUNyQztJQUNMLENBQUM7SUFFTSxXQUFXLENBQUMsV0FBVztRQUMxQixJQUFJLElBQUksQ0FBQyxRQUFRLEtBQUssYUFBYSxJQUFJLFdBQVcsRUFBRTtZQUNoRCxVQUFVLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztTQUM5RTthQUFNO1lBQ0gsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1NBQ3ZCO0lBQ0wsQ0FBQzs7QUFyQ00sdUNBQWUsR0FBRyxhQUFhLEVBQUUsQ0FBQzs7WUFSNUMsU0FBUyxTQUFDO2dCQUNQLFFBQVEsRUFBRSxvQkFBb0I7Z0JBQzlCLHVEQUErQztnQkFDL0MsU0FBUyxFQUFFO29CQUNQLGtCQUFrQixDQUFDLHVCQUF1QixDQUFDO2lCQUM5QzthQUNKOzs7O1lBYlEseUJBQXlCO1lBTEMsUUFBUSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFmdGVyVmlld0luaXQsIENvbXBvbmVudCwgSW5qZWN0b3IgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgQVBQTFlfU1RZTEVTX1RZUEUsIElXaWRnZXRDb25maWcsIHByb3ZpZGVBc1dpZGdldFJlZiwgU3R5bGFibGVDb21wb25lbnQsIHN0eWxlciB9IGZyb20gJ0B3bS9jb21wb25lbnRzJztcblxuaW1wb3J0IHsgcmVnaXN0ZXJQcm9wcyB9IGZyb20gJy4vc2VnbWVudC1jb250ZW50LnByb3BzJztcbmltcG9ydCB7IFNlZ21lbnRlZENvbnRyb2xDb21wb25lbnQgfSBmcm9tICcuLi9zZWdtZW50ZWQtY29udHJvbC5jb21wb25lbnQnO1xuXG5kZWNsYXJlIGNvbnN0IF87XG5cbmNvbnN0IERFRkFVTFRfQ0xTID0gJ2FwcC1zZWdtZW50LWNvbnRlbnQgY2xlYXJmaXgnO1xuY29uc3QgV0lER0VUX0NPTkZJRzogSVdpZGdldENvbmZpZyA9IHt3aWRnZXRUeXBlOiAnd20tc2VnbWVudC1jb250ZW50JywgaG9zdENsYXNzOiBERUZBVUxUX0NMU307XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnW3dtU2VnbWVudENvbnRlbnRdJyxcbiAgICB0ZW1wbGF0ZVVybDogJy4vc2VnbWVudC1jb250ZW50LmNvbXBvbmVudC5odG1sJyxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgcHJvdmlkZUFzV2lkZ2V0UmVmKFNlZ21lbnRDb250ZW50Q29tcG9uZW50KVxuICAgIF1cbn0pXG5leHBvcnQgY2xhc3MgU2VnbWVudENvbnRlbnRDb21wb25lbnQgZXh0ZW5kcyBTdHlsYWJsZUNvbXBvbmVudCBpbXBsZW1lbnRzIEFmdGVyVmlld0luaXQge1xuICAgIHN0YXRpYyBpbml0aWFsaXplUHJvcHMgPSByZWdpc3RlclByb3BzKCk7XG5cbiAgICBwcml2YXRlIGxvYWRtb2RlOiBzdHJpbmc7XG4gICAgcHVibGljIGNvbXBpbGUgPSBmYWxzZTtcbiAgICBwcml2YXRlIGxvYWRkZWxheTogbnVtYmVyO1xuXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBzZWdtZW50ZWRDb250cm9sOiBTZWdtZW50ZWRDb250cm9sQ29tcG9uZW50LCBpbmo6IEluamVjdG9yKSB7XG4gICAgICAgIHN1cGVyKGluaiwgV0lER0VUX0NPTkZJRyk7XG4gICAgICAgIHN0eWxlcih0aGlzLm5hdGl2ZUVsZW1lbnQsIHRoaXMsIEFQUExZX1NUWUxFU19UWVBFLlNDUk9MTEFCTEVfQ09OVEFJTkVSKTtcbiAgICAgICAgc2VnbWVudGVkQ29udHJvbC5hZGRDb250ZW50KHRoaXMpO1xuICAgIH1cblxuICAgIHB1YmxpYyBuZ0FmdGVyVmlld0luaXQoKSB7XG4gICAgICAgIC8vIGxvYWQgdGhlIGNvbnRlbnQgb24gZGVtYW5kIHdoZW4gbG9hZG1vZGUgaXMgbm90IHNwZWNpZmllZFxuICAgICAgICBpZiAoIXRoaXMubG9hZG1vZGUpIHtcbiAgICAgICAgICAgIHRoaXMubG9hZENvbnRlbnQodHJ1ZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgbmF2aWdhdGUoKSB7XG4gICAgICAgIHRoaXMuc2VnbWVudGVkQ29udHJvbC5zaG93Q29udGVudCh0aGlzKTtcbiAgICB9XG5cbiAgICAvLyBzZXRzIHRoZSBjb21waWxlIGZsYWcgdG8gbG9hZCB0aGUgY29udGVudFxuICAgIHByaXZhdGUgX2xvYWRDb250ZW50KCkge1xuICAgICAgICBpZiAoIXRoaXMuY29tcGlsZSkge1xuICAgICAgICAgICAgdGhpcy5jb21waWxlID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuaW52b2tlRXZlbnRDYWxsYmFjaygncmVhZHknKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBsb2FkQ29udGVudChkZWZhdWx0TG9hZCkge1xuICAgICAgICBpZiAodGhpcy5sb2FkbW9kZSA9PT0gJ2FmdGVyLWRlbGF5JyB8fCBkZWZhdWx0TG9hZCkge1xuICAgICAgICAgICAgc2V0VGltZW91dCh0aGlzLl9sb2FkQ29udGVudC5iaW5kKHRoaXMpLCBkZWZhdWx0TG9hZCA/IDAgOiB0aGlzLmxvYWRkZWxheSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9sb2FkQ29udGVudCgpO1xuICAgICAgICB9XG4gICAgfVxufVxuIl19