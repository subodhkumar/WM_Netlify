import { Attribute, ChangeDetectorRef, Component, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { $parseEvent, addClass, App, getRouteNameFromLink, getUrlParams, openLink, removeClass, UserDefinedExecutionContext } from '@wm/core';
import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { registerProps } from './nav.props';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
import { DatasetAwareNavComponent } from '../base/dataset-aware-nav.component';
const DEFAULT_CLS = 'nav app-nav';
const WIDGET_CONFIG = { widgetType: 'wm-nav', hostClass: DEFAULT_CLS };
const NavClassMap = {
    pills: 'nav-pills',
    tabs: 'nav-tabs',
    navbar: 'navbar-nav'
};
export class NavComponent extends DatasetAwareNavComponent {
    constructor(inj, cdRef, router, userDefinedExecutionContext, app, selectEventCB) {
        super(inj, WIDGET_CONFIG);
        this.cdRef = cdRef;
        this.router = router;
        this.userDefinedExecutionContext = userDefinedExecutionContext;
        this.app = app;
        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);
        this.disableMenuContext = !!selectEventCB;
        this.pageScope = this.viewParent;
    }
    get activePageName() {
        return this.app.activePageName;
    }
    setNavType(type) {
        addClass(this.nativeElement, NavClassMap[type]);
    }
    setNavLayout(layout) {
        addClass(this.nativeElement, `nav-${layout}`);
    }
    onNavSelect($event, item, liRef) {
        $event.preventDefault();
        if (this.activeNavLINode) {
            removeClass(this.activeNavLINode, 'active');
        }
        this.activeNavLINode = liRef;
        addClass(liRef, 'active');
        this.selecteditem = item;
        this.invokeEventCallback('select', { $event, $item: item.value });
        let itemLink = item.link;
        const itemAction = item.action;
        const linkTarget = item.target;
        if (itemAction) {
            if (!this.itemActionFn) {
                this.itemActionFn = $parseEvent(itemAction);
            }
            this.itemActionFn(this.userDefinedExecutionContext, Object.create(item));
        }
        if (itemLink) {
            if (itemLink.startsWith('#/') && (!linkTarget || linkTarget === '_self')) {
                const queryParams = getUrlParams(itemLink);
                itemLink = getRouteNameFromLink(itemLink);
                this.router.navigate([itemLink], { queryParams });
            }
            else {
                openLink(itemLink, linkTarget);
            }
        }
    }
    ngOnInit() {
        super.ngOnInit();
        this.setNavType(this.type);
        this.setNavLayout(this.layout);
    }
    /**
     * invoked from the menu widget when a menu item is selected.
     * @param $event
     * @param widget
     * @param $item
     */
    onMenuItemSelect($event, widget, $item) {
        this.selecteditem = _.omit($item, ['children', 'value']);
        this.invokeEventCallback('select', { $event, $item: this.selecteditem });
    }
}
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
NavComponent.ctorParameters = () => [
    { type: Injector },
    { type: ChangeDetectorRef },
    { type: Router },
    { type: UserDefinedExecutionContext },
    { type: App },
    { type: undefined, decorators: [{ type: Attribute, args: ['select.event',] }] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmF2LmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vbmF2L25hdi5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxpQkFBaUIsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFVLE1BQU0sZUFBZSxDQUFDO0FBQzFGLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUV6QyxPQUFPLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUUsb0JBQW9CLEVBQUUsWUFBWSxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsMkJBQTJCLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFOUksT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQ25FLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFDNUMsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDakUsT0FBTyxFQUFFLHdCQUF3QixFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFJL0UsTUFBTSxXQUFXLEdBQUcsYUFBYSxDQUFDO0FBQ2xDLE1BQU0sYUFBYSxHQUFHLEVBQUMsVUFBVSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFDLENBQUM7QUFFckUsTUFBTSxXQUFXLEdBQUc7SUFDaEIsS0FBSyxFQUFFLFdBQVc7SUFDbEIsSUFBSSxFQUFFLFVBQVU7SUFDaEIsTUFBTSxFQUFFLFlBQVk7Q0FDdkIsQ0FBQztBQVNGLE1BQU0sT0FBTyxZQUFhLFNBQVEsd0JBQXdCO0lBZXRELFlBQ0ksR0FBYSxFQUNMLEtBQXdCLEVBQ3hCLE1BQWMsRUFDZCwyQkFBd0QsRUFDeEQsR0FBUSxFQUNXLGFBQWE7UUFFeEMsS0FBSyxDQUFDLEdBQUcsRUFBRSxhQUFhLENBQUMs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TSxFQUFFLEtBQUs7UUFDbEMsSUFBSSxDQUFDLFlBQVksR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDO1FBQ3pELElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLEVBQUUsRUFBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxZQUFZLEVBQUMsQ0FBQyxDQUFDO0lBQzNFLENBQUM7O0FBeEZNLDRCQUFlLEdBQUcsYUFBYSxFQUFFLENBQUM7O1lBUjVDLFNBQVMsU0FBQztnQkFDUCxRQUFRLEVBQUUsU0FBUztnQkFDbkIsKzdDQUFtQztnQkFDbkMsU0FBUyxFQUFFO29CQUNQLGtCQUFrQixDQUFDLFlBQVksQ0FBQztpQkFDbkM7YUFDSjs7OztZQTNCaUQsUUFBUTtZQUF0QyxpQkFBaUI7WUFDNUIsTUFBTTtZQUVpRiwyQkFBMkI7WUFBM0YsR0FBRzs0Q0E4QzFCLFNBQVMsU0FBQyxjQUFjIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXR0cmlidXRlLCBDaGFuZ2VEZXRlY3RvclJlZiwgQ29tcG9uZW50LCBJbmplY3RvciwgT25Jbml0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBSb3V0ZXIgfSBmcm9tICdAYW5ndWxhci9yb3V0ZXInO1xuXG5pbXBvcnQgeyAkcGFyc2VFdmVudCwgYWRkQ2xhc3MsIEFwcCwgZ2V0Um91dGVOYW1lRnJvbUxpbmssIGdldFVybFBhcmFtcywgb3BlbkxpbmssIHJlbW92ZUNsYXNzLCBVc2VyRGVmaW5lZEV4ZWN1dGlvbkNvbnRleHQgfSBmcm9tICdAd20vY29yZSc7XG5cbmltcG9ydCB7IEFQUExZX1NUWUxFU19UWVBFLCBzdHlsZXIgfSBmcm9tICcuLi8uLi9mcmFtZXdvcmsvc3R5bGVyJztcbmltcG9ydCB7IHJlZ2lzdGVyUHJvcHMgfSBmcm9tICcuL25hdi5wcm9wcyc7XG5pbXBvcnQgeyBwcm92aWRlQXNXaWRnZXRSZWYgfSBmcm9tICcuLi8uLi8uLi91dGlscy93aWRnZXQtdXRpbHMnO1xuaW1wb3J0IHsgRGF0YXNldEF3YXJlTmF2Q29tcG9uZW50IH0gZnJvbSAnLi4vYmFzZS9kYXRhc2V0LWF3YXJlLW5hdi5jb21wb25lbnQnO1xuXG5kZWNsYXJlIGNvbnN0IF87XG5cbmNvbnN0IERFRkFVTFRfQ0xTID0gJ25hdiBhcHAtbmF2JztcbmNvbnN0IFdJREdFVF9DT05GSUcgPSB7d2lkZ2V0VHlwZTogJ3dtLW5hdicsIGhvc3RDbGFzczogREVGQVVMVF9DTFN9O1xuXG5jb25zdCBOYXZDbGFzc01hcCA9IHtcbiAgICBwaWxsczogJ25hdi1waWxscycsXG4gICAgdGFiczogJ25hdi10YWJzJyxcbiAgICBuYXZiYXI6ICduYXZiYXItbmF2J1xufTtcblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdbd21OYXZdJyxcbiAgICB0ZW1wbGF0ZVVybDogJy4vbmF2LmNvbXBvbmVudC5odG1sJyxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgcHJvdmlkZUFzV2lkZ2V0UmVmKE5hdkNvbXBvbmVudClcbiAgICBdXG59KVxuZXhwb3J0IGNsYXNzIE5hdkNvbXBvbmVudCBleHRlbmRzIERhdGFzZXRBd2FyZU5hdkNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCB7XG4gICAgc3RhdGljIGluaXRpYWxpemVQcm9wcyA9IHJlZ2lzdGVyUHJvcHMoKTtcblxuICAgIHB1YmxpYyBzZWxlY3RlZGl0ZW07XG4gICAgcHVibGljIHR5cGU7XG4gICAgcHVibGljIGRpc2FibGVNZW51Q29udGV4dDogYm9vbGVhbjtcbiAgICBwdWJsaWMgbGF5b3V0O1xuXG4gICAgcHJpdmF0ZSBhY3RpdmVOYXZMSU5vZGU6IEhUTUxFbGVtZW50O1xuICAgIHByaXZhdGUgaXRlbUFjdGlvbkZuOiBGdW5jdGlvbjtcbiAgICBwcml2YXRlIHBhZ2VTY29wZTogYW55O1xuICAgIHByaXZhdGUgZ2V0IGFjdGl2ZVBhZ2VOYW1lKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hcHAuYWN0aXZlUGFnZU5hbWU7XG4gICAgfVxuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIGluajogSW5qZWN0b3IsXG4gICAgICAgIHByaXZhdGUgY2RSZWY6IENoYW5nZURldGVjdG9yUmVmLFxuICAgICAgICBwcml2YXRlIHJvdXRlcjogUm91dGVyLFxuICAgICAgICBwcml2YXRlIHVzZXJEZWZpbmVkRXhlY3V0aW9uQ29udGV4dDogVXNlckRlZmluZWRFeGVjdXRpb25Db250ZXh0LFxuICAgICAgICBwcml2YXRlIGFwcDogQXBwLFxuICAgICAgICBAQXR0cmlidXRlKCdzZWxlY3QuZXZlbnQnKSBzZWxlY3RFdmVudENCXG4gICAgKSB7XG4gICAgICAgIHN1cGVyKGluaiwgV0lER0VUX0NPTkZJRyk7XG4gICAgICAgIHN0eWxlcih0aGlzLm5hdGl2ZUVsZW1lbnQsIHRoaXMsIEFQUExZX1NUWUxFU19UWVBFLkNPTlRBSU5FUik7XG4gICAgICAgIHRoaXMuZGlzYWJsZU1lbnVDb250ZXh0ID0gISFzZWxlY3RFdmVudENCO1xuICAgICAgICB0aGlzLnBhZ2VTY29wZSA9IHRoaXMudmlld1BhcmVudDtcbiAgICB9XG5cblxuICAgIHByaXZhdGUgc2V0TmF2VHlwZSh0eXBlKSB7XG4gICAgICAgIGFkZENsYXNzKHRoaXMubmF0aXZlRWxlbWVudCwgTmF2Q2xhc3NNYXBbdHlwZV0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgc2V0TmF2TGF5b3V0KGxheW91dCkge1xuICAgICAgICBhZGRDbGFzcyh0aGlzLm5hdGl2ZUVsZW1lbnQsIGBuYXYtJHtsYXlvdXR9YCk7XG4gICAgfVxuXG4gICAgcHVibGljIG9uTmF2U2VsZWN0KCRldmVudDogRXZlbnQsIGl0ZW06IGFueSwgbGlSZWY6IEhUTUxFbGVtZW50KSB7XG4gICAgICAgICRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIGlmICh0aGlzLmFjdGl2ZU5hdkxJTm9kZSkge1xuICAgICAgICAgICAgcmVtb3ZlQ2xhc3ModGhpcy5hY3RpdmVOYXZMSU5vZGUsICdhY3RpdmUnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuYWN0aXZlTmF2TElOb2RlID0gbGlSZWY7XG5cbiAgICAgICAgYWRkQ2xhc3MobGlSZWYsICdhY3RpdmUnKTtcblxuICAgICAgICB0aGlzLnNlbGVjdGVkaXRlbSA9IGl0ZW07XG5cbiAgICAgICAgdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdzZWxlY3QnLCB7JGV2ZW50LCAkaXRlbTogaXRlbS52YWx1ZX0pO1xuXG4gICAgICAgIGxldCBpdGVtTGluayA9IGl0ZW0ubGluaztcbiAgICAgICAgY29uc3QgaXRlbUFjdGlvbiA9IGl0ZW0uYWN0aW9uO1xuICAgICAgICBjb25zdCBsaW5rVGFyZ2V0ID0gaXRlbS50YXJnZXQ7XG4gICAgICAgIGlmIChpdGVtQWN0aW9uKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuaXRlbUFjdGlvbkZuKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pdGVtQWN0aW9uRm4gPSAkcGFyc2VFdmVudChpdGVtQWN0aW9uKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5pdGVtQWN0aW9uRm4odGhpcy51c2VyRGVmaW5lZEV4ZWN1dGlvbkNvbnRleHQsIE9iamVjdC5jcmVhdGUoaXRlbSkpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChpdGVtTGluaykge1xuICAgICAgICAgICAgaWYgKGl0ZW1MaW5rLnN0YXJ0c1dpdGgoJyMvJykgJiYgKCFsaW5rVGFyZ2V0IHx8IGxpbmtUYXJnZXQgPT09ICdfc2VsZicpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcXVlcnlQYXJhbXMgPSBnZXRVcmxQYXJhbXMoaXRlbUxpbmspO1xuICAgICAgICAgICAgICAgIGl0ZW1MaW5rID0gZ2V0Um91dGVOYW1lRnJvbUxpbmsoaXRlbUxpbmspO1xuICAgICAgICAgICAgICAgIHRoaXMucm91dGVyLm5hdmlnYXRlKFtpdGVtTGlua10sIHtxdWVyeVBhcmFtc30pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBvcGVuTGluayhpdGVtTGluaywgbGlua1RhcmdldCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBuZ09uSW5pdCgpIHtcbiAgICAgICAgc3VwZXIubmdPbkluaXQoKTtcbiAgICAgICAgdGhpcy5zZXROYXZUeXBlKHRoaXMudHlwZSk7XG4gICAgICAgIHRoaXMuc2V0TmF2TGF5b3V0KHRoaXMubGF5b3V0KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBpbnZva2VkIGZyb20gdGhlIG1lbnUgd2lkZ2V0IHdoZW4gYSBtZW51IGl0ZW0gaXMgc2VsZWN0ZWQuXG4gICAgICogQHBhcmFtICRldmVudFxuICAgICAqIEBwYXJhbSB3aWRnZXRcbiAgICAgKiBAcGFyYW0gJGl0ZW1cbiAgICAgKi9cbiAgICBvbk1lbnVJdGVtU2VsZWN0KCRldmVudCwgd2lkZ2V0LCAkaXRlbSkge1xuICAgICAgICB0aGlzLnNlbGVjdGVkaXRlbSA9IF8ub21pdCgkaXRlbSwgWydjaGlsZHJlbicsICd2YWx1ZSddKTtcbiAgICAgICAgdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdzZWxlY3QnLCB7JGV2ZW50LCAkaXRlbTogdGhpcy5zZWxlY3RlZGl0ZW19KTtcbiAgICB9XG59XG4iXX0=