import * as tslib_1 from "tslib";
import { Attribute, ChangeDetectorRef, Component, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { $parseEvent, addClass, App, getRouteNameFromLink, getUrlParams, openLink, removeClass, UserDefinedExecutionContext } from '@wm/core';
import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { registerProps } from './nav.props';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
import { DatasetAwareNavComponent } from '../base/dataset-aware-nav.component';
var DEFAULT_CLS = 'nav app-nav';
var WIDGET_CONFIG = { widgetType: 'wm-nav', hostClass: DEFAULT_CLS };
var NavClassMap = {
    pills: 'nav-pills',
    tabs: 'nav-tabs',
    navbar: 'navbar-nav'
};
var NavComponent = /** @class */ (function (_super) {
    tslib_1.__extends(NavComponent, _super);
    function NavComponent(inj, cdRef, router, userDefinedExecutionContext, app, selectEventCB) {
        var _this = _super.call(this, inj, WIDGET_CONFIG) || this;
        _this.cdRef = cdRef;
        _this.router = router;
        _this.userDefinedExecutionContext = userDefinedExecutionContext;
        _this.app = app;
        styler(_this.nativeElement, _this, APPLY_STYLES_TYPE.CONTAINER);
        _this.disableMenuContext = !!selectEventCB;
        _this.pageScope = _this.viewParent;
        return _this;
    }
    Object.defineProperty(NavComponent.prototype, "activePageName", {
        get: function () {
            return this.app.activePageName;
        },
        enumerable: true,
        configurable: true
    });
    NavComponent.prototype.setNavType = function (type) {
        addClass(this.nativeElement, NavClassMap[type]);
    };
    NavComponent.prototype.setNavLayout = function (layout) {
        addClass(this.nativeElement, "nav-" + layout);
    };
    NavComponent.prototype.onNavSelect = function ($event, item, liRef) {
        $event.preventDefault();
        if (this.activeNavLINode) {
            removeClass(this.activeNavLINode, 'active');
        }
        this.activeNavLINode = liRef;
        addClass(liRef, 'active');
        this.selecteditem = item;
        this.invokeEventCallback('select', { $event: $event, $item: item.value });
        var itemLink = item.link;
        var itemAction = item.action;
        var linkTarget = item.target;
        if (itemAction) {
            if (!this.itemActionFn) {
                this.itemActionFn = $parseEvent(itemAction);
            }
            this.itemActionFn(this.userDefinedExecutionContext, Object.create(item));
        }
        if (itemLink) {
            if (itemLink.startsWith('#/') && (!linkTarget || linkTarget === '_self')) {
                var queryParams = getUrlParams(itemLink);
                itemLink = getRouteNameFromLink(itemLink);
                this.router.navigate([itemLink], { queryParams: queryParams });
            }
            else {
                openLink(itemLink, linkTarget);
            }
        }
    };
    NavComponent.prototype.ngOnInit = function () {
        _super.prototype.ngOnInit.call(this);
        this.setNavType(this.type);
        this.setNavLayout(this.layout);
    };
    /**
     * invoked from the menu widget when a menu item is selected.
     * @param $event
     * @param widget
     * @param $item
     */
    NavComponent.prototype.onMenuItemSelect = function ($event, widget, $item) {
        this.selecteditem = _.omit($item, ['children', 'value']);
        this.invokeEventCallback('select', { $event: $event, $item: this.selecteditem });
    };
    NavComponent.initializeProps = registerProps();
    NavComponent.decorators = [
        { type: Component, args: [{
                    selector: '[wmNav]',
                    template: "<ng-template #menuRef let-item=\"item\" let-index=\"index\">\n    <div wmMenu dropdown\n         type=\"anchor\"\n         autoclose.bind=\"autoclose\"\n         iconclass.bind=\"item.icon\"\n         autoopen.bind=\"autoopen\"\n         caption.bind=\"item.label\"\n         dataset.bind=\"item.children\"\n         iconposition.bind=\"iconposition\"\n         select.event=\"onMenuItemSelect($event, widget, $item)\"></div>\n</ng-template>\n\n<ng-template #anchorRef let-item=\"item\" let-index=\"index\" let-liRef=\"liRef\">\n    <a wmAnchor\n       [disableMenuContext]=\"disableMenuContext || !!item.action\"\n       [wmNavigationControl]=\"item.link\"\n       caption.bind=\"item.label\"\n       iconclass.bind=\"item.icon\"\n       badgevalue.bind=\"item.badge\"\n       iconposition.bind=\"iconposition\"\n       click.event=\"onNavSelect($event, item, liRef)\"></a>\n</ng-template>\n\n<li class=\"app-nav-item {{item.class}}\" *ngFor=\"let item of nodes; let index = index;\" #liRef [ngClass]=\"{active: item.link === '#/' + activePageName}\">\n    <ng-container [ngTemplateOutlet]=\"anchorRef\" [ngTemplateOutletContext]=\"{item: item, index:index, liRef: liRef}\" *ngIf=\"!item.children.length\"></ng-container>\n    <ng-container [ngTemplateOutlet]=\"menuRef\" [ngTemplateOutletContext]=\"{item: item, index:index}\"  *ngIf=\"item.children.length\"></ng-container>\n</li>\n\n<ng-content *ngIf=\"!nodes.length\" select=\"[wmNavItem]\"></ng-content>",
                    providers: [
                        provideAsWidgetRef(NavComponent)
                    ]
                }] }
    ];
    /** @nocollapse */
    NavComponent.ctorParameters = function () { return [
        { type: Injector },
        { type: ChangeDetectorRef },
        { type: Router },
        { type: UserDefinedExecutionContext },
        { type: App },
        { type: undefined, decorators: [{ type: Attribute, args: ['select.event',] }] }
    ]; };
    return NavComponent;
}(DatasetAwareNavComponent));
export { NavComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmF2LmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vbmF2L25hdi5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsaUJBQWlCLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBVSxNQUFNLGVBQWUsQ0FBQztBQUMxRixPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFFekMsT0FBTyxFQUFFLFdBQVcsRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLG9CQUFvQixFQUFFLFlBQVksRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLDJCQUEyQixFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRTlJLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUNuRSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sYUFBYSxDQUFDO0FBQzVDLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBQ2pFLE9BQU8sRUFBRSx3QkFBd0IsRUFBRSxNQUFNLHFDQUFxQyxDQUFDO0FBSS9FLElBQU0sV0FBVyxHQUFHLGFBQWEsQ0FBQztBQUNsQyxJQUFNLGFBQWEsR0FBRyxFQUFDLFVBQVUsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBQyxDQUFDO0FBRXJFLElBQU0sV0FBVyxHQUFHO0lBQ2hCLEtBQUssRUFBRSxXQUFXO0lBQ2xCLElBQUksRUFBRSxVQUFVO0lBQ2hCLE1BQU0sRUFBRSxZQUFZO0NBQ3ZCLENBQUM7QUFFRjtJQU9rQyx3Q0FBd0I7SUFldEQsc0JBQ0ksR0FBYSxFQUNMLEtBQXdCLEVBQ3hCLE1BQWMsRUFDZCwyQkFBd0QsRUFDeEQsR0FBUSxFQUNXLGFBQWE7UUFONUMsWUFRSSxrQkFBTSxHQUFHLEVBQUUsYUFBYSxDQUFDLFNBSTVCO1FBVlcs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T0FLRztJQUNILHVDQUFnQixHQUFoQixVQUFpQixNQUFNLEVBQUUsTUFBTSxFQUFFLEtBQUs7UUFDbEMsSUFBSSxDQUFDLFlBQVksR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQ3pELElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLEVBQUUsRUFBQyxNQUFNLFFBQUEsRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLFlBQVksRUFBQyxDQUFDLENBQUM7SUFDM0UsQ0FBQztJQXhGTSw0QkFBZSxHQUFHLGFBQWEsRUFBRSxDQUFDOztnQkFSNUMsU0FBUyxTQUFDO29CQUNQLFFBQVEsRUFBRSxTQUFTO29CQUNuQiwrN0NBQW1DO29CQUNuQyxTQUFTLEVBQUU7d0JBQ1Asa0JBQWtCLENBQUMsWUFBWSxDQUFDO3FCQUNuQztpQkFDSjs7OztnQkEzQmlELFFBQVE7Z0JBQXRDLGlCQUFpQjtnQkFDNUIsTUFBTTtnQkFFaUYsMkJBQTJCO2dCQUEzRixHQUFHO2dEQThDMUIsU0FBUyxTQUFDLGNBQWM7O0lBcUVqQyxtQkFBQztDQUFBLEFBakdELENBT2tDLHdCQUF3QixHQTBGekQ7U0ExRlksWUFBWSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEF0dHJpYnV0ZSwgQ2hhbmdlRGV0ZWN0b3JSZWYsIENvbXBvbmVudCwgSW5qZWN0b3IsIE9uSW5pdCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgUm91dGVyIH0gZnJvbSAnQGFuZ3VsYXIvcm91dGVyJztcblxuaW1wb3J0IHsgJHBhcnNlRXZlbnQsIGFkZENsYXNzLCBBcHAsIGdldFJvdXRlTmFtZUZyb21MaW5rLCBnZXRVcmxQYXJhbXMsIG9wZW5MaW5rLCByZW1vdmVDbGFzcywgVXNlckRlZmluZWRFeGVjdXRpb25Db250ZXh0IH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5pbXBvcnQgeyBBUFBMWV9TVFlMRVNfVFlQRSwgc3R5bGVyIH0gZnJvbSAnLi4vLi4vZnJhbWV3b3JrL3N0eWxlcic7XG5pbXBvcnQgeyByZWdpc3RlclByb3BzIH0gZnJvbSAnLi9uYXYucHJvcHMnO1xuaW1wb3J0IHsgcHJvdmlkZUFzV2lkZ2V0UmVmIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvd2lkZ2V0LXV0aWxzJztcbmltcG9ydCB7IERhdGFzZXRBd2FyZU5hdkNvbXBvbmVudCB9IGZyb20gJy4uL2Jhc2UvZGF0YXNldC1hd2FyZS1uYXYuY29tcG9uZW50JztcblxuZGVjbGFyZSBjb25zdCBfO1xuXG5jb25zdCBERUZBVUxUX0NMUyA9ICduYXYgYXBwLW5hdic7XG5jb25zdCBXSURHRVRfQ09ORklHID0ge3dpZGdldFR5cGU6ICd3bS1uYXYnLCBob3N0Q2xhc3M6IERFRkFVTFRfQ0xTfTtcblxuY29uc3QgTmF2Q2xhc3NNYXAgPSB7XG4gICAgcGlsbHM6ICduYXYtcGlsbHMnLFxuICAgIHRhYnM6ICduYXYtdGFicycsXG4gICAgbmF2YmFyOiAnbmF2YmFyLW5hdidcbn07XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnW3dtTmF2XScsXG4gICAgdGVtcGxhdGVVcmw6ICcuL25hdi5jb21wb25lbnQuaHRtbCcsXG4gICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIHByb3ZpZGVBc1dpZGdldFJlZihOYXZDb21wb25lbnQpXG4gICAgXVxufSlcbmV4cG9ydCBjbGFzcyBOYXZDb21wb25lbnQgZXh0ZW5kcyBEYXRhc2V0QXdhcmVOYXZDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQge1xuICAgIHN0YXRpYyBpbml0aWFsaXplUHJvcHMgPSByZWdpc3RlclByb3BzKCk7XG5cbiAgICBwdWJsaWMgc2VsZWN0ZWRpdGVtO1xuICAgIHB1YmxpYyB0eXBlO1xuICAgIHB1YmxpYyBkaXNhYmxlTWVudUNvbnRleHQ6IGJvb2xlYW47XG4gICAgcHVibGljIGxheW91dDtcblxuICAgIHByaXZhdGUgYWN0aXZlTmF2TElOb2RlOiBIVE1MRWxlbWVudDtcbiAgICBwcml2YXRlIGl0ZW1BY3Rpb25GbjogRnVuY3Rpb247XG4gICAgcHJpdmF0ZSBwYWdlU2NvcGU6IGFueTtcbiAgICBwcml2YXRlIGdldCBhY3RpdmVQYWdlTmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXBwLmFjdGl2ZVBhZ2VOYW1lO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBpbmo6IEluamVjdG9yLFxuICAgICAgICBwcml2YXRlIGNkUmVmOiBDaGFuZ2VEZXRlY3RvclJlZixcbiAgICAgICAgcHJpdmF0ZSByb3V0ZXI6IFJvdXRlcixcbiAgICAgICAgcHJpdmF0ZSB1c2VyRGVmaW5lZEV4ZWN1dGlvbkNvbnRleHQ6IFVzZXJEZWZpbmVkRXhlY3V0aW9uQ29udGV4dCxcbiAgICAgICAgcHJpdmF0ZSBhcHA6IEFwcCxcbiAgICAgICAgQEF0dHJpYnV0ZSgnc2VsZWN0LmV2ZW50Jykgc2VsZWN0RXZlbnRDQlxuICAgICkge1xuICAgICAgICBzdXBlcihpbmosIFdJREdFVF9DT05GSUcpO1xuICAgICAgICBzdHlsZXIodGhpcy5uYXRpdmVFbGVtZW50LCB0aGlzLCBBUFBMWV9TVFlMRVNfVFlQRS5DT05UQUlORVIpO1xuICAgICAgICB0aGlzLmRpc2FibGVNZW51Q29udGV4dCA9ICEhc2VsZWN0RXZlbnRDQjtcbiAgICAgICAgdGhpcy5wYWdlU2NvcGUgPSB0aGlzLnZpZXdQYXJlbnQ7XG4gICAgfVxuXG5cbiAgICBwcml2YXRlIHNldE5hdlR5cGUodHlwZSkge1xuICAgICAgICBhZGRDbGFzcyh0aGlzLm5hdGl2ZUVsZW1lbnQsIE5hdkNsYXNzTWFwW3R5cGVdKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHNldE5hdkxheW91dChsYXlvdXQpIHtcbiAgICAgICAgYWRkQ2xhc3ModGhpcy5uYXRpdmVFbGVtZW50LCBgbmF2LSR7bGF5b3V0fWApO1xuICAgIH1cblxuICAgIHB1YmxpYyBvbk5hdlNlbGVjdCgkZXZlbnQ6IEV2ZW50LCBpdGVtOiBhbnksIGxpUmVmOiBIVE1MRWxlbWVudCkge1xuICAgICAgICAkZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICBpZiAodGhpcy5hY3RpdmVOYXZMSU5vZGUpIHtcbiAgICAgICAgICAgIHJlbW92ZUNsYXNzKHRoaXMuYWN0aXZlTmF2TElOb2RlLCAnYWN0aXZlJyk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmFjdGl2ZU5hdkxJTm9kZSA9IGxpUmVmO1xuXG4gICAgICAgIGFkZENsYXNzKGxpUmVmLCAnYWN0aXZlJyk7XG5cbiAgICAgICAgdGhpcy5zZWxlY3RlZGl0ZW0gPSBpdGVtO1xuXG4gICAgICAgIHRoaXMuaW52b2tlRXZlbnRDYWxsYmFjaygnc2VsZWN0JywgeyRldmVudCwgJGl0ZW06IGl0ZW0udmFsdWV9KTtcblxuICAgICAgICBsZXQgaXRlbUxpbmsgPSBpdGVtLmxpbms7XG4gICAgICAgIGNvbnN0IGl0ZW1BY3Rpb24gPSBpdGVtLmFjdGlvbjtcbiAgICAgICAgY29uc3QgbGlua1RhcmdldCA9IGl0ZW0udGFyZ2V0O1xuICAgICAgICBpZiAoaXRlbUFjdGlvbikge1xuICAgICAgICAgICAgaWYgKCF0aGlzLml0ZW1BY3Rpb25Gbikge1xuICAgICAgICAgICAgICAgIHRoaXMuaXRlbUFjdGlvbkZuID0gJHBhcnNlRXZlbnQoaXRlbUFjdGlvbik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuaXRlbUFjdGlvbkZuKHRoaXMudXNlckRlZmluZWRFeGVjdXRpb25Db250ZXh0LCBPYmplY3QuY3JlYXRlKGl0ZW0pKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaXRlbUxpbmspIHtcbiAgICAgICAgICAgIGlmIChpdGVtTGluay5zdGFydHNXaXRoKCcjLycpICYmICghbGlua1RhcmdldCB8fCBsaW5rVGFyZ2V0ID09PSAnX3NlbGYnKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHF1ZXJ5UGFyYW1zID0gZ2V0VXJsUGFyYW1zKGl0ZW1MaW5rKTtcbiAgICAgICAgICAgICAgICBpdGVtTGluayA9IGdldFJvdXRlTmFtZUZyb21MaW5rKGl0ZW1MaW5rKTtcbiAgICAgICAgICAgICAgICB0aGlzLnJvdXRlci5uYXZpZ2F0ZShbaXRlbUxpbmtdLCB7cXVlcnlQYXJhbXN9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgb3BlbkxpbmsoaXRlbUxpbmssIGxpbmtUYXJnZXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgbmdPbkluaXQoKSB7XG4gICAgICAgIHN1cGVyLm5nT25Jbml0KCk7XG4gICAgICAgIHRoaXMuc2V0TmF2VHlwZSh0aGlzLnR5cGUpO1xuICAgICAgICB0aGlzLnNldE5hdkxheW91dCh0aGlzLmxheW91dCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogaW52b2tlZCBmcm9tIHRoZSBtZW51IHdpZGdldCB3aGVuIGEgbWVudSBpdGVtIGlzIHNlbGVjdGVkLlxuICAgICAqIEBwYXJhbSAkZXZlbnRcbiAgICAgKiBAcGFyYW0gd2lkZ2V0XG4gICAgICogQHBhcmFtICRpdGVtXG4gICAgICovXG4gICAgb25NZW51SXRlbVNlbGVjdCgkZXZlbnQsIHdpZGdldCwgJGl0ZW0pIHtcbiAgICAgICAgdGhpcy5zZWxlY3RlZGl0ZW0gPSBfLm9taXQoJGl0ZW0sIFsnY2hpbGRyZW4nLCAndmFsdWUnXSk7XG4gICAgICAgIHRoaXMuaW52b2tlRXZlbnRDYWxsYmFjaygnc2VsZWN0JywgeyRldmVudCwgJGl0ZW06IHRoaXMuc2VsZWN0ZWRpdGVtfSk7XG4gICAgfVxufVxuIl19