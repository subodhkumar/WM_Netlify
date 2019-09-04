import * as tslib_1 from "tslib";
import { Component, ElementRef, Injector, ViewChild } from '@angular/core';
import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { registerProps } from './card.props';
import { MenuAdapterComponent } from '../base/menu-adapator.component';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
var DEFAULT_CLS = 'app-card card app-panel';
var WIDGET_CONFIG = {
    widgetType: 'wm-card',
    hostClass: DEFAULT_CLS
};
var CardComponent = /** @class */ (function (_super) {
    tslib_1.__extends(CardComponent, _super);
    function CardComponent(inj) {
        var _this = _super.call(this, inj, WIDGET_CONFIG) || this;
        styler(_this.nativeElement, _this, APPLY_STYLES_TYPE.SHELL);
        return _this;
    }
    CardComponent.prototype.ngAfterViewInit = function () {
        _super.prototype.ngAfterViewInit.call(this);
        styler(this.cardContainerElRef.nativeElement, this, APPLY_STYLES_TYPE.INNER_SHELL);
    };
    CardComponent.prototype.onPropertyChange = function (key, nv, ov) {
        if (key === 'title' || key === 'subheading' || key === 'iconclass' || key === 'iconurl' || key === 'actions') {
            this.showHeader = !!(this.title || this.subheading || this.iconclass || this.iconurl || this.actions);
        }
        else {
            _super.prototype.onPropertyChange.call(this, key, nv, ov);
        }
    };
    CardComponent.initializeProps = registerProps();
    CardComponent.decorators = [
        { type: Component, args: [{
                    selector: '[wmCard]',
                    template: "<div class=\"app-card-header panel-heading\" *ngIf=\"showHeader\">\n    <div class=\"app-card-avatar\" *ngIf=\"iconclass || iconurl\">\n        <i class=\"app-icon\" [ngClass]=\"iconclass\" *ngIf=\"iconclass && !iconurl\"></i>\n        <img class=\"img-circle\" [src]=\"iconurl\" *ngIf=\"iconurl\" />\n    </div>\n    <div class=\"app-card-header-text\">\n        <h4 class=\"card-heading\" [textContent]=\"title\"></h4>\n        <h5 class=\"card-subheading text-muted\" [textContent]=\"subheading\"></h5>\n    </div>\n    <div class=\"panel-actions\" *ngIf=\"actions\">\n        <!-- TODO(punith) need to bind autoclose-->\n        <div wmMenu dropdown\n             [autoClose]=\"autoclose !== 'disabled'\"\n             class=\"panel-action\"\n             type=\"anchor\"\n             iconclass=\"wi wi-more-vert\"\n             menuposition=\"down,left\"\n             hint=\"Actions\"\n             caption=\"\"\n             dataset.bind=\"actions\">\n        </div>\n    </div>\n</div>\n<div class=\"app-card-image\" *ngIf=\"picturesource\"  [ngStyle]=\"{'max-height':imageheight}\">\n   <img wmPicture class=\"card-image\" picturesource.bind=\"picturesource\" hint.bind=\"picturetitle\" />\n</div>\n<div #cardContainerWrapper>\n    <ng-content select=\"[wmCardContent]\"></ng-content>\n</div>\n<div>\n    <ng-content select=\"[wmCardActions]\"></ng-content>\n</div>\n<div>\n    <ng-content select=\"[wmCardFooter]\"></ng-content>\n</div>",
                    providers: [
                        provideAsWidgetRef(CardComponent)
                    ]
                }] }
    ];
    /** @nocollapse */
    CardComponent.ctorParameters = function () { return [
        { type: Injector }
    ]; };
    CardComponent.propDecorators = {
        cardContainerElRef: [{ type: ViewChild, args: ['cardContainerWrapper',] }]
    };
    return CardComponent;
}(MenuAdapterComponent));
export { CardComponent };
// Todo(swathi) - menu
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FyZC5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL2NhcmQvY2FyZC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBaUIsU0FBUyxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQVUsU0FBUyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRWxHLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUVuRSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sY0FBYyxDQUFDO0FBQzdDLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLGlDQUFpQyxDQUFDO0FBQ3ZFLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBRWpFLElBQU0sV0FBVyxHQUFHLHlCQUF5QixDQUFDO0FBQzlDLElBQU0sYUFBYSxHQUFrQjtJQUNqQyxVQUFVLEVBQUUsU0FBUztJQUNyQixTQUFTLEVBQUUsV0FBVztDQUN6QixDQUFDO0FBRUY7SUFPbUMseUNBQW9CO0lBWW5ELHVCQUFZLEdBQWE7UUFBekIsWUFDSSxrQkFBTSxHQUFHLEVBQUUsYUFBYSxDQUFDLFNBRTVCO1FBREcsTUFBTSxDQUFDLEtBQUksQ0FBQyxhQUFhLEVBQUUsS0FBSSxFQUFFLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxDQUFDOztJQUM5RCxDQUFDO0lBRUQsdUNBQWUsR0FBZjtRQUNJLGlCQUFNLGVBQWUsV0FBRSxDQUFDO1FBQ3hCLE1BQU0sQ0FBQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsYUFBYSxFQUFFLElBQUksRUFBRSxpQkFBaUIsQ0FBQyxXQUFXLENBQUMsQ0FBQztJQUN2RixDQUFDO0lBRUQsd0NBQWdCLEdBQWhCLFVBQWlCLEdBQVcsRUFBRSxFQUFPLEVBQUUsRUFBUTtRQUMzQyxJQUFJLEdBQUcsS0FBSyxPQUFPLElBQUksR0FBRyxLQUFLLFlBQVksSUFBSSxHQUFHLEtBQUssV0FBVyxJQUFJLEdBQUcsS0FBSyxTQUFTLElBQUksR0FBRyxLQUFLLFNBQVMsRUFBRTtZQUMxRyxJQUFJLENBQUMsVUFBVSxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLFVBQVUsSUFBSSxJQUFJLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxPQUFPLElBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQ3pHO2FBQU07WUFDSCxpQkFBTSxnQkFBZ0IsWUFBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1NBQ3ZDO0lBQ0wsQ0FBQztJQTNCTSw2QkFBZSxHQUFHLGFBQWEsRUFBRSxDQUFDOztnQkFSNUMsU0FBUyxTQUFDO29CQUNQLFFBQVEsRUFBRSxVQUFVO29CQUNwQixtN0NBQW9DO29CQUNwQyxTQUFTLEVBQUU7d0JBQ1Asa0JBQWtCLENBQUMsYUFBYSxDQUFDO3FCQUNwQztpQkFDSjs7OztnQkFwQjhDLFFBQVE7OztxQ0ErQmxELFNBQVMsU0FBQyxzQkFBc0I7O0lBbUJyQyxvQkFBQztDQUFBLEFBcENELENBT21DLG9CQUFvQixHQTZCdEQ7U0E3QlksYUFBYTtBQStCMUIsc0JBQXNCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQWZ0ZXJWaWV3SW5pdCwgQ29tcG9uZW50LCBFbGVtZW50UmVmLCBJbmplY3RvciwgT25Jbml0LCBWaWV3Q2hpbGQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgQVBQTFlfU1RZTEVTX1RZUEUsIHN0eWxlciB9IGZyb20gJy4uLy4uL2ZyYW1ld29yay9zdHlsZXInO1xuaW1wb3J0IHsgSVdpZGdldENvbmZpZyB9IGZyb20gJy4uLy4uL2ZyYW1ld29yay90eXBlcyc7XG5pbXBvcnQgeyByZWdpc3RlclByb3BzIH0gZnJvbSAnLi9jYXJkLnByb3BzJztcbmltcG9ydCB7IE1lbnVBZGFwdGVyQ29tcG9uZW50IH0gZnJvbSAnLi4vYmFzZS9tZW51LWFkYXBhdG9yLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBwcm92aWRlQXNXaWRnZXRSZWYgfSBmcm9tICcuLi8uLi8uLi91dGlscy93aWRnZXQtdXRpbHMnO1xuXG5jb25zdCBERUZBVUxUX0NMUyA9ICdhcHAtY2FyZCBjYXJkIGFwcC1wYW5lbCc7XG5jb25zdCBXSURHRVRfQ09ORklHOiBJV2lkZ2V0Q29uZmlnID0ge1xuICAgIHdpZGdldFR5cGU6ICd3bS1jYXJkJyxcbiAgICBob3N0Q2xhc3M6IERFRkFVTFRfQ0xTXG59O1xuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ1t3bUNhcmRdJyxcbiAgICB0ZW1wbGF0ZVVybDogJy4vY2FyZC5jb21wb25lbnQuaHRtbCcsXG4gICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIHByb3ZpZGVBc1dpZGdldFJlZihDYXJkQ29tcG9uZW50KVxuICAgIF1cbn0pXG5leHBvcnQgY2xhc3MgQ2FyZENvbXBvbmVudCBleHRlbmRzIE1lbnVBZGFwdGVyQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0LCBBZnRlclZpZXdJbml0IHtcbiAgICBzdGF0aWMgaW5pdGlhbGl6ZVByb3BzID0gcmVnaXN0ZXJQcm9wcygpO1xuXG4gICAgcHVibGljIHNob3dIZWFkZXI6IGJvb2xlYW47XG4gICAgcHVibGljIHRpdGxlOiBzdHJpbmc7XG4gICAgcHVibGljIHN1YmhlYWRpbmc6IHN0cmluZztcbiAgICBwdWJsaWMgaWNvbmNsYXNzOiBzdHJpbmc7XG4gICAgcHVibGljIGljb251cmw6IHN0cmluZztcbiAgICBwdWJsaWMgYWN0aW9uczogc3RyaW5nO1xuXG4gICAgQFZpZXdDaGlsZCgnY2FyZENvbnRhaW5lcldyYXBwZXInKSBwcml2YXRlIGNhcmRDb250YWluZXJFbFJlZjogRWxlbWVudFJlZjtcblxuICAgIGNvbnN0cnVjdG9yKGluajogSW5qZWN0b3IpIHtcbiAgICAgICAgc3VwZXIoaW5qLCBXSURHRVRfQ09ORklHKTtcbiAgICAgICAgc3R5bGVyKHRoaXMubmF0aXZlRWxlbWVudCwgdGhpcywgQVBQTFlfU1RZTEVTX1RZUEUuU0hFTEwpO1xuICAgIH1cblxuICAgIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcbiAgICAgICAgc3VwZXIubmdBZnRlclZpZXdJbml0KCk7XG4gICAgICAgIHN0eWxlcih0aGlzLmNhcmRDb250YWluZXJFbFJlZi5uYXRpdmVFbGVtZW50LCB0aGlzLCBBUFBMWV9TVFlMRVNfVFlQRS5JTk5FUl9TSEVMTCk7XG4gICAgfVxuXG4gICAgb25Qcm9wZXJ0eUNoYW5nZShrZXk6IHN0cmluZywgbnY6IGFueSwgb3Y/OiBhbnkpIHtcbiAgICAgICAgaWYgKGtleSA9PT0gJ3RpdGxlJyB8fCBrZXkgPT09ICdzdWJoZWFkaW5nJyB8fCBrZXkgPT09ICdpY29uY2xhc3MnIHx8IGtleSA9PT0gJ2ljb251cmwnIHx8IGtleSA9PT0gJ2FjdGlvbnMnKSB7XG4gICAgICAgICAgICB0aGlzLnNob3dIZWFkZXIgPSAhISh0aGlzLnRpdGxlIHx8IHRoaXMuc3ViaGVhZGluZyB8fCB0aGlzLmljb25jbGFzcyB8fCB0aGlzLmljb251cmwgfHwgdGhpcy5hY3Rpb25zKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN1cGVyLm9uUHJvcGVydHlDaGFuZ2Uoa2V5LCBudiwgb3YpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG4vLyBUb2RvKHN3YXRoaSkgLSBtZW51XG4iXX0=