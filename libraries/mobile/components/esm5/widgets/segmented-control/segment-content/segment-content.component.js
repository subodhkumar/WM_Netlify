import * as tslib_1 from "tslib";
import { Component, Injector } from '@angular/core';
import { APPLY_STYLES_TYPE, provideAsWidgetRef, StylableComponent, styler } from '@wm/components';
import { registerProps } from './segment-content.props';
import { SegmentedControlComponent } from '../segmented-control.component';
var DEFAULT_CLS = 'app-segment-content clearfix';
var WIDGET_CONFIG = { widgetType: 'wm-segment-content', hostClass: DEFAULT_CLS };
var SegmentContentComponent = /** @class */ (function (_super) {
    tslib_1.__extends(SegmentContentComponent, _super);
    function SegmentContentComponent(segmentedControl, inj) {
        var _this = _super.call(this, inj, WIDGET_CONFIG) || this;
        _this.segmentedControl = segmentedControl;
        _this.compile = false;
        styler(_this.nativeElement, _this, APPLY_STYLES_TYPE.SCROLLABLE_CONTAINER);
        segmentedControl.addContent(_this);
        return _this;
    }
    SegmentContentComponent.prototype.ngAfterViewInit = function () {
        // load the content on demand when loadmode is not specified
        if (!this.loadmode) {
            this.loadContent(true);
        }
    };
    SegmentContentComponent.prototype.navigate = function () {
        this.segmentedControl.showContent(this);
    };
    // sets the compile flag to load the content
    SegmentContentComponent.prototype._loadContent = function () {
        if (!this.compile) {
            this.compile = true;
            this.invokeEventCallback('ready');
        }
    };
    SegmentContentComponent.prototype.loadContent = function (defaultLoad) {
        if (this.loadmode === 'after-delay' || defaultLoad) {
            setTimeout(this._loadContent.bind(this), defaultLoad ? 0 : this.loaddelay);
        }
        else {
            this._loadContent();
        }
    };
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
    SegmentContentComponent.ctorParameters = function () { return [
        { type: SegmentedControlComponent },
        { type: Injector }
    ]; };
    return SegmentContentComponent;
}(StylableComponent));
export { SegmentContentComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VnbWVudC1jb250ZW50LmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9tb2JpbGUvY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvc2VnbWVudGVkLWNvbnRyb2wvc2VnbWVudC1jb250ZW50L3NlZ21lbnQtY29udGVudC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBaUIsU0FBUyxFQUFFLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUVuRSxPQUFPLEVBQUUsaUJBQWlCLEVBQWlCLGtCQUFrQixFQUFFLGlCQUFpQixFQUFFLE1BQU0sRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRWpILE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSx5QkFBeUIsQ0FBQztBQUN4RCxPQUFPLEVBQUUseUJBQXlCLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUkzRSxJQUFNLFdBQVcsR0FBRyw4QkFBOEIsQ0FBQztBQUNuRCxJQUFNLGFBQWEsR0FBa0IsRUFBQyxVQUFVLEVBQUUsb0JBQW9CLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBQyxDQUFDO0FBRWhHO0lBTzZDLG1EQUFpQjtJQU8xRCxpQ0FBb0IsZ0JBQTJDLEVBQUUsR0FBYTtRQUE5RSxZQUNJLGtCQUFNLEdBQUcsRUFBRSxhQUFhLENBQUMsU0FHNUI7UUFKbUIsc0JBQWdCLEdBQWhCLGdCQUFnQixDQUEyQjtRQUh4RCxhQUFPLEdBQUcsS0FBSyxDQUFDO1FBS25CLE1BQU0sQ0FBQyxLQUFJLENBQUMsYUFBYSxFQUFFLEtBQUksRUFBRSxpQkFBaUIsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1FBQ3pFLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxLQUFJLENBQUMsQ0FBQzs7SUFDdEMsQ0FBQztJQUVNLGlEQUFlLEdBQXRCO1FBQ0ksNERBQTREO1FBQzVELElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ2hCLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7U0FDMUI7SUFDTCxDQUFDO0lBRU0sMENBQVEsR0FBZjtRQUNJLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUVELDRDQUE0QztJQUNwQyw4Q0FBWSxHQUFwQjtRQUNJLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ2YsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUM7WUFDcEIsSUFBSSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQ3JDO0lBQ0wsQ0FBQztJQUVNLDZDQUFXLEdBQWxCLFVBQW1CLFdBQVc7UUFDMUIsSUFBSSxJQUFJLENBQUMsUUFBUSxLQUFLLGFBQWEsSUFBSSxXQUFXLEVBQUU7WUFDaEQsVUFBVSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDOUU7YUFBTTtZQUNILElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztTQUN2QjtJQUNMLENBQUM7SUFyQ00sdUNBQWUsR0FBRyxhQUFhLEVBQUUsQ0FBQzs7Z0JBUjVDLFNBQVMsU0FBQztvQkFDUCxRQUFRLEVBQUUsb0JBQW9CO29CQUM5Qix1REFBK0M7b0JBQy9DLFNBQVMsRUFBRTt3QkFDUCxrQkFBa0IsQ0FBQyx1QkFBdUIsQ0FBQztxQkFDOUM7aUJBQ0o7Ozs7Z0JBYlEseUJBQXlCO2dCQUxDLFFBQVE7O0lBMEQzQyw4QkFBQztDQUFBLEFBOUNELENBTzZDLGlCQUFpQixHQXVDN0Q7U0F2Q1ksdUJBQXVCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQWZ0ZXJWaWV3SW5pdCwgQ29tcG9uZW50LCBJbmplY3RvciB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBBUFBMWV9TVFlMRVNfVFlQRSwgSVdpZGdldENvbmZpZywgcHJvdmlkZUFzV2lkZ2V0UmVmLCBTdHlsYWJsZUNvbXBvbmVudCwgc3R5bGVyIH0gZnJvbSAnQHdtL2NvbXBvbmVudHMnO1xuXG5pbXBvcnQgeyByZWdpc3RlclByb3BzIH0gZnJvbSAnLi9zZWdtZW50LWNvbnRlbnQucHJvcHMnO1xuaW1wb3J0IHsgU2VnbWVudGVkQ29udHJvbENvbXBvbmVudCB9IGZyb20gJy4uL3NlZ21lbnRlZC1jb250cm9sLmNvbXBvbmVudCc7XG5cbmRlY2xhcmUgY29uc3QgXztcblxuY29uc3QgREVGQVVMVF9DTFMgPSAnYXBwLXNlZ21lbnQtY29udGVudCBjbGVhcmZpeCc7XG5jb25zdCBXSURHRVRfQ09ORklHOiBJV2lkZ2V0Q29uZmlnID0ge3dpZGdldFR5cGU6ICd3bS1zZWdtZW50LWNvbnRlbnQnLCBob3N0Q2xhc3M6IERFRkFVTFRfQ0xTfTtcblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdbd21TZWdtZW50Q29udGVudF0nLFxuICAgIHRlbXBsYXRlVXJsOiAnLi9zZWdtZW50LWNvbnRlbnQuY29tcG9uZW50Lmh0bWwnLFxuICAgIHByb3ZpZGVyczogW1xuICAgICAgICBwcm92aWRlQXNXaWRnZXRSZWYoU2VnbWVudENvbnRlbnRDb21wb25lbnQpXG4gICAgXVxufSlcbmV4cG9ydCBjbGFzcyBTZWdtZW50Q29udGVudENvbXBvbmVudCBleHRlbmRzIFN0eWxhYmxlQ29tcG9uZW50IGltcGxlbWVudHMgQWZ0ZXJWaWV3SW5pdCB7XG4gICAgc3RhdGljIGluaXRpYWxpemVQcm9wcyA9IHJlZ2lzdGVyUHJvcHMoKTtcblxuICAgIHByaXZhdGUgbG9hZG1vZGU6IHN0cmluZztcbiAgICBwdWJsaWMgY29tcGlsZSA9IGZhbHNlO1xuICAgIHByaXZhdGUgbG9hZGRlbGF5OiBudW1iZXI7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIHNlZ21lbnRlZENvbnRyb2w6IFNlZ21lbnRlZENvbnRyb2xDb21wb25lbnQsIGluajogSW5qZWN0b3IpIHtcbiAgICAgICAgc3VwZXIoaW5qLCBXSURHRVRfQ09ORklHKTtcbiAgICAgICAgc3R5bGVyKHRoaXMubmF0aXZlRWxlbWVudCwgdGhpcywgQVBQTFlfU1RZTEVTX1RZUEUuU0NST0xMQUJMRV9DT05UQUlORVIpO1xuICAgICAgICBzZWdtZW50ZWRDb250cm9sLmFkZENvbnRlbnQodGhpcyk7XG4gICAgfVxuXG4gICAgcHVibGljIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcbiAgICAgICAgLy8gbG9hZCB0aGUgY29udGVudCBvbiBkZW1hbmQgd2hlbiBsb2FkbW9kZSBpcyBub3Qgc3BlY2lmaWVkXG4gICAgICAgIGlmICghdGhpcy5sb2FkbW9kZSkge1xuICAgICAgICAgICAgdGhpcy5sb2FkQ29udGVudCh0cnVlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBuYXZpZ2F0ZSgpIHtcbiAgICAgICAgdGhpcy5zZWdtZW50ZWRDb250cm9sLnNob3dDb250ZW50KHRoaXMpO1xuICAgIH1cblxuICAgIC8vIHNldHMgdGhlIGNvbXBpbGUgZmxhZyB0byBsb2FkIHRoZSBjb250ZW50XG4gICAgcHJpdmF0ZSBfbG9hZENvbnRlbnQoKSB7XG4gICAgICAgIGlmICghdGhpcy5jb21waWxlKSB7XG4gICAgICAgICAgICB0aGlzLmNvbXBpbGUgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdyZWFkeScpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGxvYWRDb250ZW50KGRlZmF1bHRMb2FkKSB7XG4gICAgICAgIGlmICh0aGlzLmxvYWRtb2RlID09PSAnYWZ0ZXItZGVsYXknIHx8IGRlZmF1bHRMb2FkKSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KHRoaXMuX2xvYWRDb250ZW50LmJpbmQodGhpcyksIGRlZmF1bHRMb2FkID8gMCA6IHRoaXMubG9hZGRlbGF5KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX2xvYWRDb250ZW50KCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=