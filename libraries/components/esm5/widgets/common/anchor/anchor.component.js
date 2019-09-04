import * as tslib_1 from "tslib";
import { Component, HostBinding, Injector, Optional } from '@angular/core';
import { addClass, App, encodeUrl, getRouteNameFromLink, setAttr } from '@wm/core';
import { styler } from '../../framework/styler';
import { DISPLAY_TYPE } from '../../framework/constants';
import { registerProps } from './anchor.props';
import { StylableComponent } from '../base/stylable.component';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
import { NavItemDirective } from '../nav/nav-item/nav-item.directive';
import { disableContextMenu } from '../nav/navigation-control.directive';
var DEFAULT_CLS = 'app-anchor';
var WIDGET_CONFIG = {
    widgetType: 'wm-anchor',
    hostClass: DEFAULT_CLS,
    displayType: DISPLAY_TYPE.INLINE_BLOCK
};
var regex = /Actions.goToPage_(\w+)\.invoke\(\)/g;
var AnchorComponent = /** @class */ (function (_super) {
    tslib_1.__extends(AnchorComponent, _super);
    function AnchorComponent(inj, navItemRef, app) {
        var _this = _super.call(this, inj, WIDGET_CONFIG) || this;
        _this.navItemRef = navItemRef;
        _this.app = app;
        styler(_this.nativeElement, _this);
        return _this;
    }
    AnchorComponent.prototype.processEventAttr = function (eventName, expr, meta) {
        var _this = this;
        _super.prototype.processEventAttr.call(this, eventName, expr, meta);
        if (!this.hasNavigationToCurrentPageExpr) {
            var app_1 = this.inj.get(App);
            var fns = expr.split(';').map(Function.prototype.call, String.prototype.trim);
            if (fns.some(function (fn) {
                regex.lastIndex = 0;
                var matches = regex.exec(fn);
                _this.hasGoToPageExpr = matches && (matches.length > 0);
                return _this.hasGoToPageExpr && matches[1] === app_1.activePageName;
            })) {
                this.hasNavigationToCurrentPageExpr = true;
            }
        }
    };
    AnchorComponent.prototype.setNavItemActive = function () {
        if (this.navItemRef) {
            addClass(this.navItemRef.getNativeElement(), 'active');
        }
    };
    AnchorComponent.prototype.handleEvent = function (node, eventName, eventCallback, locals, meta) {
        var _this = this;
        _super.prototype.handleEvent.call(this, node, eventName, function (e) {
            if (_this.hasGoToPageExpr && locals.$event) {
                locals.$event.preventDefault();
            }
            eventCallback();
        }, locals, meta);
    };
    AnchorComponent.prototype.onPropertyChange = function (key, nv, ov) {
        if (key === 'hyperlink') {
            if (!nv) {
                setAttr(this.nativeElement, 'href', 'javascript:void(0)');
                this.nativeElement.addEventListener('contextmenu', disableContextMenu);
                return;
            }
            if (this.encodeurl) {
                nv = encodeUrl(nv);
            }
            // if hyperlink starts with 'www.' append '//' in the beginning
            if (nv.startsWith('www.')) {
                nv = "//" + nv;
            }
            setAttr(this.nativeElement, 'href', nv);
            this.nativeElement.removeEventListener('contextmenu', disableContextMenu);
        }
        else {
            _super.prototype.onPropertyChange.call(this, key, nv, ov);
        }
    };
    AnchorComponent.prototype.ngAfterViewInit = function () {
        var _this = this;
        _super.prototype.ngAfterViewInit.call(this);
        if (this.hasNavigationToCurrentPageExpr) {
            addClass(this.nativeElement, 'active');
        }
        if (this.navItemRef) {
            setTimeout(function () {
                if (_this.hyperlink && getRouteNameFromLink(_this.hyperlink) === "/" + _this.app.activePageName) {
                    _this.setNavItemActive();
                }
                else if (_this.hasNavigationToCurrentPageExpr) {
                    _this.setNavItemActive();
                }
            });
        }
    };
    AnchorComponent.initializeProps = registerProps();
    AnchorComponent.decorators = [
        { type: Component, args: [{
                    selector: 'a[wmAnchor]',
                    template: "<img data-identifier=\"img\" alt=\"Image\" class=\"anchor-image-icon\" [src]=\"iconurl | image\" *ngIf=\"iconurl\" [ngStyle]=\"{width:iconwidth, height:iconheight, margin:iconmargin}\"/>\n<i class=\"app-icon {{iconclass}}\" aria-hidden=\"true\" [ngStyle]=\"{width:iconwidth, height:iconheight, margin:iconmargin}\" *ngIf=\"iconclass\"></i>\n<span class=\"sr-only\" *ngIf=\"iconclass\">{{caption | trustAs:'html'}} {{appLocale.LABEL_ICON}}</span>\n<span class=\"anchor-caption\" [innerHTML]=\"caption | trustAs:'html'\"></span>\n<ng-content select=\".caret\"></ng-content>\n<span *ngIf=\"badgevalue\" class=\"badge pull-right\" [textContent]=\"badgevalue\"></span>",
                    providers: [
                        provideAsWidgetRef(AnchorComponent)
                    ]
                }] }
    ];
    /** @nocollapse */
    AnchorComponent.ctorParameters = function () { return [
        { type: Injector },
        { type: NavItemDirective, decorators: [{ type: Optional }] },
        { type: App }
    ]; };
    AnchorComponent.propDecorators = {
        target: [{ type: HostBinding, args: ['target',] }],
        shortcutkey: [{ type: HostBinding, args: ['attr.accesskey',] }],
        iconposition: [{ type: HostBinding, args: ['attr.icon-position',] }]
    };
    return AnchorComponent;
}(StylableComponent));
export { AnchorComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5jaG9yLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vYW5jaG9yL2FuY2hvci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBaUIsU0FBUyxFQUFFLFdBQVcsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRTFGLE9BQU8sRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLFNBQVMsRUFBRSxvQkFBb0IsRUFBRSxPQUFPLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFbkYsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBRWhELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUN6RCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDL0MsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFDL0QsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDakUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sb0NBQW9DLENBQUM7QUFDdEUsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFFekUsSUFBTSxXQUFXLEdBQUcsWUFBWSxDQUFDO0FBQ2pDLElBQU0sYUFBYSxHQUFrQjtJQUNqQyxVQUFVLEVBQUUsV0FBVztJQUN2QixTQUFTLEVBQUUsV0FBVztJQUN0QixXQUFXLEVBQUUsWUFBWSxDQUFDLFlBQVk7Q0FDekMsQ0FBQztBQUVGLElBQU0sS0FBSyxHQUFHLHFDQUFxQyxDQUFDO0FBRXBEO0lBT3FDLDJDQUFpQjtJQWtCbEQseUJBQ0ksR0FBYSxFQUNPLFVBQTRCLEVBQ3hDLEdBQVE7UUFIcEIsWUFLSSxrQkFBTSxHQUFHLEVBQUUsYUFBYSxDQUFDLFNBRTVCO1FBTHVCLGdC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cnQgeyBBZnRlclZpZXdJbml0LCBDb21wb25lbnQsIEhvc3RCaW5kaW5nLCBJbmplY3RvciwgT3B0aW9uYWwgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgYWRkQ2xhc3MsIEFwcCwgZW5jb2RlVXJsLCBnZXRSb3V0ZU5hbWVGcm9tTGluaywgc2V0QXR0ciB9IGZyb20gJ0B3bS9jb3JlJztcblxuaW1wb3J0IHsgc3R5bGVyIH0gZnJvbSAnLi4vLi4vZnJhbWV3b3JrL3N0eWxlcic7XG5pbXBvcnQgeyBJV2lkZ2V0Q29uZmlnIH0gZnJvbSAnLi4vLi4vZnJhbWV3b3JrL3R5cGVzJztcbmltcG9ydCB7IERJU1BMQVlfVFlQRSB9IGZyb20gJy4uLy4uL2ZyYW1ld29yay9jb25zdGFudHMnO1xuaW1wb3J0IHsgcmVnaXN0ZXJQcm9wcyB9IGZyb20gJy4vYW5jaG9yLnByb3BzJztcbmltcG9ydCB7IFN0eWxhYmxlQ29tcG9uZW50IH0gZnJvbSAnLi4vYmFzZS9zdHlsYWJsZS5jb21wb25lbnQnO1xuaW1wb3J0IHsgcHJvdmlkZUFzV2lkZ2V0UmVmIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvd2lkZ2V0LXV0aWxzJztcbmltcG9ydCB7IE5hdkl0ZW1EaXJlY3RpdmUgfSBmcm9tICcuLi9uYXYvbmF2LWl0ZW0vbmF2LWl0ZW0uZGlyZWN0aXZlJztcbmltcG9ydCB7IGRpc2FibGVDb250ZXh0TWVudSB9IGZyb20gJy4uL25hdi9uYXZpZ2F0aW9uLWNvbnRyb2wuZGlyZWN0aXZlJztcblxuY29uc3QgREVGQVVMVF9DTFMgPSAnYXBwLWFuY2hvcic7XG5jb25zdCBXSURHRVRfQ09ORklHOiBJV2lkZ2V0Q29uZmlnID0ge1xuICAgIHdpZGdldFR5cGU6ICd3bS1hbmNob3InLFxuICAgIGhvc3RDbGFzczogREVGQVVMVF9DTFMsXG4gICAgZGlzcGxheVR5cGU6IERJU1BMQVlfVFlQRS5JTkxJTkVfQkxPQ0tcbn07XG5cbmNvbnN0IHJlZ2V4ID0gL0FjdGlvbnMuZ29Ub1BhZ2VfKFxcdyspXFwuaW52b2tlXFwoXFwpL2c7XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnYVt3bUFuY2hvcl0nLFxuICAgIHRlbXBsYXRlVXJsOiAnLi9hbmNob3IuY29tcG9uZW50Lmh0bWwnLFxuICAgIHByb3ZpZGVyczogW1xuICAgICAgICBwcm92aWRlQXNXaWRnZXRSZWYoQW5jaG9yQ29tcG9uZW50KVxuICAgIF1cbn0pXG5leHBvcnQgY2xhc3MgQW5jaG9yQ29tcG9uZW50IGV4dGVuZHMgU3R5bGFibGVDb21wb25lbnQgaW1wbGVtZW50cyBBZnRlclZpZXdJbml0IHtcbiAgICBzdGF0aWMgaW5pdGlhbGl6ZVByb3BzID0gcmVnaXN0ZXJQcm9wcygpO1xuXG4gICAgcHJpdmF0ZSBoYXNOYXZpZ2F0aW9uVG9DdXJyZW50UGFnZUV4cHI6IGJvb2xlYW47XG4gICAgcHJpdmF0ZSBoYXNHb1RvUGFnZUV4cHI6IGJvb2xlYW47XG5cbiAgICBwdWJsaWMgZW5jb2RldXJsO1xuICAgIHB1YmxpYyBoeXBlcmxpbms7XG4gICAgcHVibGljIGljb25oZWlnaHQ6IHN0cmluZztcbiAgICBwdWJsaWMgaWNvbndpZHRoOiBzdHJpbmc7XG4gICAgcHVibGljIGljb251cmw6IHN0cmluZztcbiAgICBwdWJsaWMgaWNvbmNsYXNzOiBzdHJpbmc7XG4gICAgcHVibGljIGNhcHRpb246IGFueTtcbiAgICBwdWJsaWMgYmFkZ2V2YWx1ZTogc3RyaW5nO1xuICAgIEBIb3N0QmluZGluZygndGFyZ2V0JykgdGFyZ2V0OiBzdHJpbmc7XG4gICAgQEhvc3RCaW5kaW5nKCdhdHRyLmFjY2Vzc2tleScpIHNob3J0Y3V0a2V5OiBzdHJpbmc7XG4gICAgQEhvc3RCaW5kaW5nKCdhdHRyLmljb24tcG9zaXRpb24nKSBpY29ucG9zaXRpb246IHN0cmluZztcblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBpbmo6IEluamVjdG9yLFxuICAgICAgICBAT3B0aW9uYWwoKSBwcml2YXRlIG5hdkl0ZW1SZWY6IE5hdkl0ZW1EaXJlY3RpdmUsXG4gICAgICAgIHByaXZhdGUgYXBwOiBBcHBcbiAgICApIHtcbiAgICAgICAgc3VwZXIoaW5qLCBXSURHRVRfQ09ORklHKTtcbiAgICAgICAgc3R5bGVyKHRoaXMubmF0aXZlRWxlbWVudCwgdGhpcyk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIHByb2Nlc3NFdmVudEF0dHIoZXZlbnROYW1lOiBzdHJpbmcsIGV4cHI6IHN0cmluZywgbWV0YT86IHN0cmluZykge1xuXG4gICAgICAgIHN1cGVyLnByb2Nlc3NFdmVudEF0dHIoZXZlbnROYW1lLCBleHByLCBtZXRhKTtcblxuICAgICAgICBpZiAoIXRoaXMuaGFzTmF2aWdhdGlvblRvQ3VycmVudFBhZ2VFeHByKSB7XG4gICAgICAgICAgICBjb25zdCBhcHAgPSB0aGlzLmluai5nZXQoQXBwKTtcbiAgICAgICAgICAgIGNvbnN0IGZucyA9IGV4cHIuc3BsaXQoJzsnKS5tYXAoRnVuY3Rpb24ucHJvdG90eXBlLmNhbGwsIFN0cmluZy5wcm90b3R5cGUudHJpbSk7XG4gICAgICAgICAgICBpZiAoZm5zLnNvbWUoZm4gPT4ge1xuICAgICAgICAgICAgICAgIHJlZ2V4Lmxhc3RJbmRleCA9IDA7XG4gICAgICAgICAgICAgICAgY29uc3QgbWF0Y2hlcyA9IHJlZ2V4LmV4ZWMoZm4pO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5oYXNHb1RvUGFnZUV4cHIgPSBtYXRjaGVzICYmIChtYXRjaGVzLmxlbmd0aCA+IDApO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuaGFzR29Ub1BhZ2VFeHByICYmIG1hdGNoZXNbMV0gPT09IGFwcC5hY3RpdmVQYWdlTmFtZTtcbiAgICAgICAgICAgIH0pKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5oYXNOYXZpZ2F0aW9uVG9DdXJyZW50UGFnZUV4cHIgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzZXROYXZJdGVtQWN0aXZlKCkge1xuICAgICAgICBpZiAodGhpcy5uYXZJdGVtUmVmKSB7XG4gICAgICAgICAgICBhZGRDbGFzcyh0aGlzLm5hdkl0ZW1SZWYuZ2V0TmF0aXZlRWxlbWVudCgpLCAnYWN0aXZlJyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgaGFuZGxlRXZlbnQobm9kZTogSFRNTEVsZW1lbnQsIGV2ZW50TmFtZTogc3RyaW5nLCBldmVudENhbGxiYWNrOiBGdW5jdGlvbiwgbG9jYWxzOiBhbnksIG1ldGE/OiBzdHJpbmcpIHtcbiAgICAgICAgc3VwZXIuaGFuZGxlRXZlbnQoXG4gICAgICAgICAgICBub2RlLFxuICAgICAgICAgICAgZXZlbnROYW1lLFxuICAgICAgICAgICAgZSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaGFzR29Ub1BhZ2VFeHByICYmIGxvY2Fscy4kZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgbG9jYWxzLiRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBldmVudENhbGxiYWNrKCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbG9jYWxzLFxuICAgICAgICAgICAgbWV0YVxuICAgICAgICApO1xuICAgIH1cblxuICAgIG9uUHJvcGVydHlDaGFuZ2Uoa2V5OiBzdHJpbmcsIG52OiBhbnksIG92PzogYW55KSB7XG4gICAgICAgIGlmIChrZXkgPT09ICdoeXBlcmxpbmsnKSB7XG4gICAgICAgICAgICBpZiAoIW52KSB7XG4gICAgICAgICAgICAgICAgc2V0QXR0cih0aGlzLm5hdGl2ZUVsZW1lbnQsICdocmVmJywgJ2phdmFzY3JpcHQ6dm9pZCgwKScpO1xuICAgICAgICAgICAgICAgIHRoaXMubmF0aXZlRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjb250ZXh0bWVudScsIGRpc2FibGVDb250ZXh0TWVudSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMuZW5jb2RldXJsKSB7XG4gICAgICAgICAgICAgICAgbnYgPSBlbmNvZGVVcmwobnYpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gaWYgaHlwZXJsaW5rIHN0YXJ0cyB3aXRoICd3d3cuJyBhcHBlbmQgJy8vJyBpbiB0aGUgYmVnaW5uaW5nXG4gICAgICAgICAgICBpZiAobnYuc3RhcnRzV2l0aCgnd3d3LicpKSB7XG4gICAgICAgICAgICAgICAgbnYgPSBgLy8ke252fWA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZXRBdHRyKHRoaXMubmF0aXZlRWxlbWVudCwgJ2hyZWYnLCBudik7XG4gICAgICAgICAgICB0aGlzLm5hdGl2ZUVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignY29udGV4dG1lbnUnLCBkaXNhYmxlQ29udGV4dE1lbnUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3VwZXIub25Qcm9wZXJ0eUNoYW5nZShrZXksIG52LCBvdik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBuZ0FmdGVyVmlld0luaXQoKSB7XG4gICAgICAgIHN1cGVyLm5nQWZ0ZXJWaWV3SW5pdCgpO1xuICAgICAgICBpZiAodGhpcy5oYXNOYXZpZ2F0aW9uVG9DdXJyZW50UGFnZUV4cHIpIHtcbiAgICAgICAgICAgIGFkZENsYXNzKHRoaXMubmF0aXZlRWxlbWVudCwgJ2FjdGl2ZScpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLm5hdkl0ZW1SZWYpIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmh5cGVybGluayAmJiBnZXRSb3V0ZU5hbWVGcm9tTGluayh0aGlzLmh5cGVybGluaykgPT09IGAvJHt0aGlzLmFwcC5hY3RpdmVQYWdlTmFtZX1gKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0TmF2SXRlbUFjdGl2ZSgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5oYXNOYXZpZ2F0aW9uVG9DdXJyZW50UGFnZUV4cHIpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXROYXZJdGVtQWN0aXZlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgIH1cbn1cbiJdfQ==