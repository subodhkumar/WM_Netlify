import { Component, HostBinding, Injector, Optional } from '@angular/core';
import { addClass, App, encodeUrl, getRouteNameFromLink, setAttr } from '@wm/core';
import { styler } from '../../framework/styler';
import { DISPLAY_TYPE } from '../../framework/constants';
import { registerProps } from './anchor.props';
import { StylableComponent } from '../base/stylable.component';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
import { NavItemDirective } from '../nav/nav-item/nav-item.directive';
import { disableContextMenu } from '../nav/navigation-control.directive';
const DEFAULT_CLS = 'app-anchor';
const WIDGET_CONFIG = {
    widgetType: 'wm-anchor',
    hostClass: DEFAULT_CLS,
    displayType: DISPLAY_TYPE.INLINE_BLOCK
};
const regex = /Actions.goToPage_(\w+)\.invoke\(\)/g;
export class AnchorComponent extends StylableComponent {
    constructor(inj, navItemRef, app) {
        super(inj, WIDGET_CONFIG);
        this.navItemRef = navItemRef;
        this.app = app;
        styler(this.nativeElement, this);
    }
    processEventAttr(eventName, expr, meta) {
        super.processEventAttr(eventName, expr, meta);
        if (!this.hasNavigationToCurrentPageExpr) {
            const app = this.inj.get(App);
            const fns = expr.split(';').map(Function.prototype.call, String.prototype.trim);
            if (fns.some(fn => {
                regex.lastIndex = 0;
                const matches = regex.exec(fn);
                this.hasGoToPageExpr = matches && (matches.length > 0);
                return this.hasGoToPageExpr && matches[1] === app.activePageName;
            })) {
                this.hasNavigationToCurrentPageExpr = true;
            }
        }
    }
    setNavItemActive() {
        if (this.navItemRef) {
            addClass(this.navItemRef.getNativeElement(), 'active');
        }
    }
    handleEvent(node, eventName, eventCallback, locals, meta) {
        super.handleEvent(node, eventName, e => {
            if (this.hasGoToPageExpr && locals.$event) {
                locals.$event.preventDefault();
            }
            eventCallback();
        }, locals, meta);
    }
    onPropertyChange(key, nv, ov) {
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
                nv = `//${nv}`;
            }
            setAttr(this.nativeElement, 'href', nv);
            this.nativeElement.removeEventListener('contextmenu', disableContextMenu);
        }
        else {
            super.onPropertyChange(key, nv, ov);
        }
    }
    ngAfterViewInit() {
        super.ngAfterViewInit();
        if (this.hasNavigationToCurrentPageExpr) {
            addClass(this.nativeElement, 'active');
        }
        if (this.navItemRef) {
            setTimeout(() => {
                if (this.hyperlink && getRouteNameFromLink(this.hyperlink) === `/${this.app.activePageName}`) {
                    this.setNavItemActive();
                }
                else if (this.hasNavigationToCurrentPageExpr) {
                    this.setNavItemActive();
                }
            });
        }
    }
}
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
AnchorComponent.ctorParameters = () => [
    { type: Injector },
    { type: NavItemDirective, decorators: [{ type: Optional }] },
    { type: App }
];
AnchorComponent.propDecorators = {
    target: [{ type: HostBinding, args: ['target',] }],
    shortcutkey: [{ type: HostBinding, args: ['attr.accesskey',] }],
    iconposition: [{ type: HostBinding, args: ['attr.icon-position',] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5jaG9yLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vYW5jaG9yL2FuY2hvci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFpQixTQUFTLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFMUYsT0FBTyxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLG9CQUFvQixFQUFFLE9BQU8sRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUVuRixPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFFaEQsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQ3pELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUMvQyxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUMvRCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUNqRSxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxvQ0FBb0MsQ0FBQztBQUN0RSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxxQ0FBcUMsQ0FBQztBQUV6RSxNQUFNLFdBQVcsR0FBRyxZQUFZLENBQUM7QUFDakMsTUFBTSxhQUFhLEdBQWtCO0lBQ2pDLFVBQVUsRUFBRSxXQUFXO0lBQ3ZCLFNBQVMsRUFBRSxXQUFXO0lBQ3RCLFdBQVcsRUFBRSxZQUFZLENBQUMsWUFBWTtDQUN6QyxDQUFDO0FBRUYsTUFBTSxLQUFLLEdBQUcscUNBQXFDLENBQUM7QUFTcEQsTUFBTSxPQUFPLGVBQWdCLFNBQVEsaUJBQWlCO0lBa0JsRCxZQUNJLEdBQWEsRUFDTyxVQUE0QixFQUN4QyxHQUFRO1FBRWhCLEtBQUssQ0FBQyxHQUFHLEVBQUUsYUFBYSxDQUFDLENB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U0FDN0U7YUFBTTtZQUNILEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1NBQ3ZDO0lBQ0wsQ0FBQztJQUVELGVBQWU7UUFDWCxLQUFLLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDeEIsSUFBSSxJQUFJLENBQUMsOEJBQThCLEVBQUU7WUFDckMsUUFBUSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsUUFBUSxDQUFDLENBQUM7U0FDMUM7UUFDRCxJQUFJLElBQUksQ0FBQyxVQUFVLEVBQUU7WUFDakIsVUFBVSxDQUFDLEdBQUcsRUFBRTtnQkFDWixJQUFJLElBQUksQ0FBQyxTQUFTLElBQUksb0JBQW9CLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxjQUFjLEVBQUUsRUFBRTtvQkFDMUYsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7aUJBQzNCO3FCQUFNLElBQUksSUFBSSxDQUFDLDhCQUE4QixFQUFFO29CQUM1QyxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztpQkFDM0I7WUFDTCxDQUFDLENBQUMsQ0FBQztTQUNOO0lBRUwsQ0FBQzs7QUF2R00sK0JBQWUsR0FBRyxhQUFhLEVBQUUsQ0FBQzs7WUFSNUMsU0FBUyxTQUFDO2dCQUNQLFFBQVEsRUFBRSxhQUFhO2dCQUN2QixtcUJBQXNDO2dCQUN0QyxTQUFTLEVBQUU7b0JBQ1Asa0JBQWtCLENBQUMsZUFBZSxDQUFDO2lCQUN0QzthQUNKOzs7O1lBNUIrQyxRQUFRO1lBVS9DLGdCQUFnQix1QkF1Q2hCLFFBQVE7WUEvQ0UsR0FBRzs7O3FCQXlDakIsV0FBVyxTQUFDLFFBQVE7MEJBQ3BCLFdBQVcsU0FBQyxnQkFBZ0I7MkJBQzVCLFdBQVcsU0FBQyxvQkFBb0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBZnRlclZpZXdJbml0LCBDb21wb25lbnQsIEhvc3RCaW5kaW5nLCBJbmplY3RvciwgT3B0aW9uYWwgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgYWRkQ2xhc3MsIEFwcCwgZW5jb2RlVXJsLCBnZXRSb3V0ZU5hbWVGcm9tTGluaywgc2V0QXR0ciB9IGZyb20gJ0B3bS9jb3JlJztcblxuaW1wb3J0IHsgc3R5bGVyIH0gZnJvbSAnLi4vLi4vZnJhbWV3b3JrL3N0eWxlcic7XG5pbXBvcnQgeyBJV2lkZ2V0Q29uZmlnIH0gZnJvbSAnLi4vLi4vZnJhbWV3b3JrL3R5cGVzJztcbmltcG9ydCB7IERJU1BMQVlfVFlQRSB9IGZyb20gJy4uLy4uL2ZyYW1ld29yay9jb25zdGFudHMnO1xuaW1wb3J0IHsgcmVnaXN0ZXJQcm9wcyB9IGZyb20gJy4vYW5jaG9yLnByb3BzJztcbmltcG9ydCB7IFN0eWxhYmxlQ29tcG9uZW50IH0gZnJvbSAnLi4vYmFzZS9zdHlsYWJsZS5jb21wb25lbnQnO1xuaW1wb3J0IHsgcHJvdmlkZUFzV2lkZ2V0UmVmIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvd2lkZ2V0LXV0aWxzJztcbmltcG9ydCB7IE5hdkl0ZW1EaXJlY3RpdmUgfSBmcm9tICcuLi9uYXYvbmF2LWl0ZW0vbmF2LWl0ZW0uZGlyZWN0aXZlJztcbmltcG9ydCB7IGRpc2FibGVDb250ZXh0TWVudSB9IGZyb20gJy4uL25hdi9uYXZpZ2F0aW9uLWNvbnRyb2wuZGlyZWN0aXZlJztcblxuY29uc3QgREVGQVVMVF9DTFMgPSAnYXBwLWFuY2hvcic7XG5jb25zdCBXSURHRVRfQ09ORklHOiBJV2lkZ2V0Q29uZmlnID0ge1xuICAgIHdpZGdldFR5cGU6ICd3bS1hbmNob3InLFxuICAgIGhvc3RDbGFzczogREVGQVVMVF9DTFMsXG4gICAgZGlzcGxheVR5cGU6IERJU1BMQVlfVFlQRS5JTkxJTkVfQkxPQ0tcbn07XG5cbmNvbnN0IHJlZ2V4ID0gL0FjdGlvbnMuZ29Ub1BhZ2VfKFxcdyspXFwuaW52b2tlXFwoXFwpL2c7XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnYVt3bUFuY2hvcl0nLFxuICAgIHRlbXBsYXRlVXJsOiAnLi9hbmNob3IuY29tcG9uZW50Lmh0bWwnLFxuICAgIHByb3ZpZGVyczogW1xuICAgICAgICBwcm92aWRlQXNXaWRnZXRSZWYoQW5jaG9yQ29tcG9uZW50KVxuICAgIF1cbn0pXG5leHBvcnQgY2xhc3MgQW5jaG9yQ29tcG9uZW50IGV4dGVuZHMgU3R5bGFibGVDb21wb25lbnQgaW1wbGVtZW50cyBBZnRlclZpZXdJbml0IHtcbiAgICBzdGF0aWMgaW5pdGlhbGl6ZVByb3BzID0gcmVnaXN0ZXJQcm9wcygpO1xuXG4gICAgcHJpdmF0ZSBoYXNOYXZpZ2F0aW9uVG9DdXJyZW50UGFnZUV4cHI6IGJvb2xlYW47XG4gICAgcHJpdmF0ZSBoYXNHb1RvUGFnZUV4cHI6IGJvb2xlYW47XG5cbiAgICBwdWJsaWMgZW5jb2RldXJsO1xuICAgIHB1YmxpYyBoeXBlcmxpbms7XG4gICAgcHVibGljIGljb25oZWlnaHQ6IHN0cmluZztcbiAgICBwdWJsaWMgaWNvbndpZHRoOiBzdHJpbmc7XG4gICAgcHVibGljIGljb251cmw6IHN0cmluZztcbiAgICBwdWJsaWMgaWNvbmNsYXNzOiBzdHJpbmc7XG4gICAgcHVibGljIGNhcHRpb246IGFueTtcbiAgICBwdWJsaWMgYmFkZ2V2YWx1ZTogc3RyaW5nO1xuICAgIEBIb3N0QmluZGluZygndGFyZ2V0JykgdGFyZ2V0OiBzdHJpbmc7XG4gICAgQEhvc3RCaW5kaW5nKCdhdHRyLmFjY2Vzc2tleScpIHNob3J0Y3V0a2V5OiBzdHJpbmc7XG4gICAgQEhvc3RCaW5kaW5nKCdhdHRyLmljb24tcG9zaXRpb24nKSBpY29ucG9zaXRpb246IHN0cmluZztcblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBpbmo6IEluamVjdG9yLFxuICAgICAgICBAT3B0aW9uYWwoKSBwcml2YXRlIG5hdkl0ZW1SZWY6IE5hdkl0ZW1EaXJlY3RpdmUsXG4gICAgICAgIHByaXZhdGUgYXBwOiBBcHBcbiAgICApIHtcbiAgICAgICAgc3VwZXIoaW5qLCBXSURHRVRfQ09ORklHKTtcbiAgICAgICAgc3R5bGVyKHRoaXMubmF0aXZlRWxlbWVudCwgdGhpcyk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIHByb2Nlc3NFdmVudEF0dHIoZXZlbnROYW1lOiBzdHJpbmcsIGV4cHI6IHN0cmluZywgbWV0YT86IHN0cmluZykge1xuXG4gICAgICAgIHN1cGVyLnByb2Nlc3NFdmVudEF0dHIoZXZlbnROYW1lLCBleHByLCBtZXRhKTtcblxuICAgICAgICBpZiAoIXRoaXMuaGFzTmF2aWdhdGlvblRvQ3VycmVudFBhZ2VFeHByKSB7XG4gICAgICAgICAgICBjb25zdCBhcHAgPSB0aGlzLmluai5nZXQoQXBwKTtcbiAgICAgICAgICAgIGNvbnN0IGZucyA9IGV4cHIuc3BsaXQoJzsnKS5tYXAoRnVuY3Rpb24ucHJvdG90eXBlLmNhbGwsIFN0cmluZy5wcm90b3R5cGUudHJpbSk7XG4gICAgICAgICAgICBpZiAoZm5zLnNvbWUoZm4gPT4ge1xuICAgICAgICAgICAgICAgIHJlZ2V4Lmxhc3RJbmRleCA9IDA7XG4gICAgICAgICAgICAgICAgY29uc3QgbWF0Y2hlcyA9IHJlZ2V4LmV4ZWMoZm4pO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5oYXNHb1RvUGFnZUV4cHIgPSBtYXRjaGVzICYmIChtYXRjaGVzLmxlbmd0aCA+IDApO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuaGFzR29Ub1BhZ2VFeHByICYmIG1hdGNoZXNbMV0gPT09IGFwcC5hY3RpdmVQYWdlTmFtZTtcbiAgICAgICAgICAgIH0pKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5oYXNOYXZpZ2F0aW9uVG9DdXJyZW50UGFnZUV4cHIgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzZXROYXZJdGVtQWN0aXZlKCkge1xuICAgICAgICBpZiAodGhpcy5uYXZJdGVtUmVmKSB7XG4gICAgICAgICAgICBhZGRDbGFzcyh0aGlzLm5hdkl0ZW1SZWYuZ2V0TmF0aXZlRWxlbWVudCgpLCAnYWN0aXZlJyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcm90ZWN0ZWQgaGFuZGxlRXZlbnQobm9kZTogSFRNTEVsZW1lbnQsIGV2ZW50TmFtZTogc3RyaW5nLCBldmVudENhbGxiYWNrOiBGdW5jdGlvbiwgbG9jYWxzOiBhbnksIG1ldGE/OiBzdHJpbmcpIHtcbiAgICAgICAgc3VwZXIuaGFuZGxlRXZlbnQoXG4gICAgICAgICAgICBub2RlLFxuICAgICAgICAgICAgZXZlbnROYW1lLFxuICAgICAgICAgICAgZSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaGFzR29Ub1BhZ2VFeHByICYmIGxvY2Fscy4kZXZlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgbG9jYWxzLiRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBldmVudENhbGxiYWNrKCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbG9jYWxzLFxuICAgICAgICAgICAgbWV0YVxuICAgICAgICApO1xuICAgIH1cblxuICAgIG9uUHJvcGVydHlDaGFuZ2Uoa2V5OiBzdHJpbmcsIG52OiBhbnksIG92PzogYW55KSB7XG4gICAgICAgIGlmIChrZXkgPT09ICdoeXBlcmxpbmsnKSB7XG4gICAgICAgICAgICBpZiAoIW52KSB7XG4gICAgICAgICAgICAgICAgc2V0QXR0cih0aGlzLm5hdGl2ZUVsZW1lbnQsICdocmVmJywgJ2phdmFzY3JpcHQ6dm9pZCgwKScpO1xuICAgICAgICAgICAgICAgIHRoaXMubmF0aXZlRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdjb250ZXh0bWVudScsIGRpc2FibGVDb250ZXh0TWVudSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHRoaXMuZW5jb2RldXJsKSB7XG4gICAgICAgICAgICAgICAgbnYgPSBlbmNvZGVVcmwobnYpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gaWYgaHlwZXJsaW5rIHN0YXJ0cyB3aXRoICd3d3cuJyBhcHBlbmQgJy8vJyBpbiB0aGUgYmVnaW5uaW5nXG4gICAgICAgICAgICBpZiAobnYuc3RhcnRzV2l0aCgnd3d3LicpKSB7XG4gICAgICAgICAgICAgICAgbnYgPSBgLy8ke252fWA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzZXRBdHRyKHRoaXMubmF0aXZlRWxlbWVudCwgJ2hyZWYnLCBudik7XG4gICAgICAgICAgICB0aGlzLm5hdGl2ZUVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignY29udGV4dG1lbnUnLCBkaXNhYmxlQ29udGV4dE1lbnUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3VwZXIub25Qcm9wZXJ0eUNoYW5nZShrZXksIG52LCBvdik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBuZ0FmdGVyVmlld0luaXQoKSB7XG4gICAgICAgIHN1cGVyLm5nQWZ0ZXJWaWV3SW5pdCgpO1xuICAgICAgICBpZiAodGhpcy5oYXNOYXZpZ2F0aW9uVG9DdXJyZW50UGFnZUV4cHIpIHtcbiAgICAgICAgICAgIGFkZENsYXNzKHRoaXMubmF0aXZlRWxlbWVudCwgJ2FjdGl2ZScpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLm5hdkl0ZW1SZWYpIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmh5cGVybGluayAmJiBnZXRSb3V0ZU5hbWVGcm9tTGluayh0aGlzLmh5cGVybGluaykgPT09IGAvJHt0aGlzLmFwcC5hY3RpdmVQYWdlTmFtZX1gKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0TmF2SXRlbUFjdGl2ZSgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5oYXNOYXZpZ2F0aW9uVG9DdXJyZW50UGFnZUV4cHIpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXROYXZJdGVtQWN0aXZlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgIH1cbn1cbiJdfQ==