import * as tslib_1 from "tslib";
import { Attribute, Component, HostListener, Injector, Optional, Self } from '@angular/core';
import { Router } from '@angular/router';
import { BsDropdownDirective } from 'ngx-bootstrap';
import { $appDigest, addClass, removeClass } from '@wm/core';
import { styler } from '../../framework/styler';
import { isActiveNavItem, provideAsWidgetRef } from '../../../utils/widget-utils';
import { registerProps } from './menu.props';
import { DatasetAwareNavComponent } from '../base/dataset-aware-nav.component';
import { NavComponent } from '../nav/nav.component';
export var KEYBOARD_MOVEMENTS = {
    MOVE_UP: 'UP-ARROW',
    MOVE_LEFT: 'LEFT-ARROW',
    MOVE_RIGHT: 'RIGHT-ARROW',
    MOVE_DOWN: 'DOWN-ARROW',
    ON_ENTER: 'ENTER',
    ON_TAB: 'TAB',
    ON_ESCAPE: 'ESC'
};
export var MENU_POSITION = {
    UP_LEFT: 'up,left',
    UP_RIGHT: 'up,right',
    DOWN_LEFT: 'down,left',
    DOWN_RIGHT: 'down,right',
    INLINE: 'inline'
};
var POSITION = {
    DOWN_RIGHT: 'down,right',
    DOWN_LEFT: 'down,left',
    UP_RIGHT: 'up,right',
    UP_LEFT: 'up,left',
    INLINE: 'inline'
};
var CARET_CLS = {
    UP: 'fa-caret-up',
    DOWN: 'fa-caret-down'
};
var PULL_CLS = {
    LEFT: 'pull-left',
    RIGHT: 'pull-right'
};
var AUTO_OPEN = {
    NEVER: 'never',
    ACTIVE_PAGE: 'activepage',
    ALWAYS: 'always'
};
var WIDGET_CONFIG = { widgetType: 'wm-menu', hostClass: 'dropdown app-menu' };
var MenuComponent = /** @class */ (function (_super) {
    tslib_1.__extends(MenuComponent, _super);
    function MenuComponent(inj, route, bsDropdown, parentNav, selectEventCB) {
        var _this = _super.call(this, inj, WIDGET_CONFIG) || this;
        _this.route = route;
        _this.bsDropdown = bsDropdown;
        _this.parentNav = parentNav;
        _this.selectEventCB = selectEventCB;
        _this.menuCaret = 'fa-caret-down';
        _this._selectFirstItem = false;
        if (parentNav) {
            _this.disableMenuContext = !!parentNav.disableMenuContext;
        }
        else {
            _this.disableMenuContext = !!selectEventCB;
        }
        return _this;
    }
    MenuComponent.prototype.onShow = function () {
        var _this = this;
        if (this._selectFirstItem) {
            setTimeout(function () {
                _this.$element.find('> ul[wmmenudropdown] li.app-menu-item:first > a').focus();
            });
        }
        $appDigest();
    };
    MenuComponent.prototype.onHide = function () {
        this.$element.find('>.dropdown-toggle').focus();
        this.$element.find('li').removeClass('open');
        this._selectFirstItem = false;
        $appDigest();
    };
    MenuComponent.prototype.onKeyDown = function ($event, eventAction) {
        var KEY_MOVEMENTS = _.clone(KEYBOARD_MOVEMENTS);
        if (this.menuposition === MENU_POSITION.UP_RIGHT) {
            KEY_MOVEMENTS.MOVE_UP = 'DOWN-ARROW';
            KEY_MOVEMENTS.MOVE_DOWN = 'UP-ARROW';
        }
        else if (this.menuposition === MENU_POSITION.UP_LEFT) {
            KEY_MOVEMENTS.MOVE_UP = 'DOWN-ARROW';
            KEY_MOVEMENTS.MOVE_DOWN = 'UP-ARROW';
            KEY_MOVEMENTS.MOVE_LEFT = 'RIGHT-ARROW';
            KEY_MOVEMENTS.MOVE_RIGHT = 'LEFT-ARROW';
        }
        else if (this.menuposition === MENU_POSITION.DOWN_LEFT) {
            KEY_MOVEMENTS.MOVE_LEFT = 'RIGHT-ARROW';
            KEY_MOVEMENTS.MOVE_RIGHT = 'LEFT-ARROW';
        }
        if (_.includes([KEY_MOVEMENTS.MOVE_DOWN, KEY_MOVEMENTS.MOVE_RIGHT], eventAction)) {
            if (!this.bsDropdown.isOpen) {
                this._selectFirstItem = true;
                this.bsDropdown.show();
            }
            else {
                this.$element.find('> ul[wmmenudropdown] li.app-menu-item:first > a').focus();
            }
        }
        else if (eventAction === KEY_MOVEMENTS.ON_ENTER) {
            this.bsDropdown.toggle(true);
        }
        else if (_.includes([KEY_MOVEMENTS.MOVE_UP, KEY_MOVEMENTS.MOVE_LEFT], eventAction)) {
            this.bsDropdown.hide();
        }
        $event.preventDefault();
    };
    /**
     * returns true if the menu has link to the current page.
     * @param nodes
     */
    MenuComponent.prototype.hasLinkToCurrentPage = function (nodes) {
        var _this = this;
        return nodes.some(function (node) {
            if (isActiveNavItem(node.link, _this.route.url)) {
                return true;
            }
            if (node.children) {
                return _this.hasLinkToCurrentPage(node.children);
            }
        });
    };
    MenuComponent.prototype.resetNodes = function () {
        _super.prototype.resetNodes.call(this);
        // open the menu if any of its menu items has link to current page and if autoopen value is 'active page'
        if ((this.autoopen === AUTO_OPEN.ACTIVE_PAGE && this.hasLinkToCurrentPage(this.nodes)) || this.autoopen === AUTO_OPEN.ALWAYS) {
            this.bsDropdown.show();
        }
    };
    MenuComponent.prototype.ngOnInit = function () {
        _super.prototype.ngOnInit.call(this);
        this.setMenuPosition();
    };
    MenuComponent.prototype.onPropertyChange = function (key, nv, ov) {
        if (key === 'tabindex') {
            return;
        }
        if (key === 'autoclose') {
            this.bsDropdown.autoClose = nv !== 'disabled';
        }
        else {
            _super.prototype.onPropertyChange.call(this, key, nv, ov);
        }
    };
    MenuComponent.prototype.setMenuPosition = function () {
        switch (this.menuposition) {
            case POSITION.DOWN_RIGHT:
                removeClass(this.nativeElement, 'dropup');
                this.menualign = PULL_CLS.LEFT;
                this.menuCaret = CARET_CLS.DOWN;
                break;
            case POSITION.DOWN_LEFT:
                removeClass(this.nativeElement, 'dropup');
                this.menualign = PULL_CLS.RIGHT;
                this.menuCaret = CARET_CLS.DOWN;
                break;
            case POSITION.UP_LEFT:
                addClass(this.nativeElement, 'dropup');
                this.menualign = PULL_CLS.RIGHT;
                this.menuCaret = CARET_CLS.UP;
                break;
            case POSITION.UP_RIGHT:
                addClass(this.nativeElement, 'dropup');
                this.menualign = PULL_CLS.LEFT;
                this.menuCaret = CARET_CLS.UP;
                break;
            case POSITION.INLINE:
                this.menualign = 'dropinline-menu';
                break;
        }
    };
    MenuComponent.prototype.onMenuItemSelect = function (args) {
        var $event = args.$event;
        var $item = args.$item.value;
        this.invokeEventCallback('select', { $event: $event, $item: $item });
    };
    MenuComponent.prototype.ngAfterViewInit = function () {
        _super.prototype.ngAfterViewInit.call(this);
        styler(this.nativeElement.querySelector('.dropdown-toggle'), this);
    };
    MenuComponent.initializeProps = registerProps();
    MenuComponent.decorators = [
        { type: Component, args: [{
                    selector: '[wmMenu]',
                    template: "<ng-template #menuTemplate>\n    <button wmButton\n            dropdownToggle\n            aria-haspopup=\"true\"\n            aria-expanded=\"false\"\n\n            class=\"btn app-button dropdown-toggle {{menuclass}}\"\n            hint.bind=\"hint\"\n            shortcutkey.bind=\"shortcutkey\"\n            tabindex.bind=\"tabindex\"\n            caption.bind=\"caption\"\n            iconclass.bind=\"iconclass\"\n            iconposition.bind=\"iconposition\">\n        <span class=\"pull-right caret fa {{menuCaret}}\"></span>\n    </button>\n</ng-template>\n\n<ng-template #innerTemplate>\n    <i class=\"app-icon {{iconclass}}\"></i>\n    <span class=\"caption\" [textContent]=\"caption\"></span>\n    <span class=\"pull-right caret fa {{menuCaret}}\"></span>\n</ng-template>\n\n<ng-container *ngIf=\"type === 'anchor'; else menuTemplate\">\n    <a wmAnchor\n       dropdownToggle\n\n       href=\"javascript:void(0);\"\n       role=\"button\"\n       aria-haspopup=\"true\"\n       aria-expanded=\"false\"\n\n       hint.bind=\"hint\"\n       class=\"dropdown-toggle {{menuclass}}\"\n       shortcutkey.bind=\"shortcutkey\"\n       tabindex.bind=\"tabindex\"\n       caption.bind=\"caption\"\n       iconclass.bind=\"iconclass\"\n       iconposition.bind=\"iconposition\"\n    >\n        <span class=\"pull-right caret fa {{menuCaret}}\"></span>\n    </a>\n</ng-container>\n\n<ul wmMenuDropdown [items]=\"nodes\" [ngClass]=\"menulayout\" class=\"icon-position-{{iconposition}}\" *dropdownMenu aria-labelledby=\"dropdownmenu\"></ul>\n",
                    providers: [
                        provideAsWidgetRef(MenuComponent)
                    ]
                }] }
    ];
    /** @nocollapse */
    MenuComponent.ctorParameters = function () { return [
        { type: Injector },
        { type: Router },
        { type: BsDropdownDirective, decorators: [{ type: Self }, { type: Optional }] },
        { type: NavComponent, decorators: [{ type: Optional }] },
        { type: String, decorators: [{ type: Attribute, args: ['select.event',] }] }
    ]; };
    MenuComponent.propDecorators = {
        onShow: [{ type: HostListener, args: ['onShown',] }],
        onHide: [{ type: HostListener, args: ['onHidden',] }],
        onKeyDown: [{ type: HostListener, args: ['keydown.arrowup', ['$event', '"UP-ARROW"'],] }, { type: HostListener, args: ['keydown.arrowdown', ['$event', '"DOWN-ARROW"'],] }, { type: HostListener, args: ['keydown.arrowright', ['$event', '"RIGHT-ARROW"'],] }, { type: HostListener, args: ['keydown.arrowleft', ['$event', '"LEFT-ARROW"'],] }, { type: HostListener, args: ['keydown.enter', ['$event', '"ENTER"'],] }]
    };
    return MenuComponent;
}(DatasetAwareNavComponent));
export { MenuComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL21lbnUvbWVudS5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBaUIsU0FBUyxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQUUsUUFBUSxFQUFxQixRQUFRLEVBQUUsSUFBSSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQy9ILE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUV6QyxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFcEQsT0FBTyxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRTdELE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUNoRCxPQUFPLEVBQUUsZUFBZSxFQUFFLGtCQUFrQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDbEYsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUM3QyxPQUFPLEVBQUUsd0JBQXdCLEVBQVcsTUFBTSxxQ0FBcUMsQ0FBQztBQUN4RixPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sc0JBQXNCLENBQUM7QUFJcEQsTUFBTSxDQUFDLElBQU0sa0JBQWtCLEdBQUc7SUFDOUIsT0FBTyxFQUFFLFVBQVU7SUFDbkIsU0FBUyxFQUFHLFlBQVk7SUFDeEIsVUFBVSxFQUFHLGFBQWE7SUFDMUIsU0FBUyxFQUFHLFlBQVk7SUFDeEIsUUFBUSxFQUFHLE9BQU87SUFDbEIsTUFBTSxFQUFHLEtBQUs7SUFDZCxTQUFTLEVBQUcsS0FBSztDQUNwQixDQUFDO0FBRUYsTUFBTSxDQUFDLElBQU0sYUFBYSxHQUFHO0lBQ3pCLE9BQU8sRUFBRSxTQUFTO0lBQ2xCLFFBQVEsRUFBRSxVQUFVO0lBQ3BCLFNBQVMsRUFBRSxXQUFX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QyxDQUFDO0lBQ3hELENBQUM7SUFFRCx1Q0FBZSxHQUFmO1FBQ0ksaUJBQU0sZUFBZSxXQUFFLENBQUM7UUFDeEIsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLGtCQUFrQixDQUFnQixFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3RGLENBQUM7SUFoS00sNkJBQWUsR0FBRyxhQUFhLEVBQUUsQ0FBQzs7Z0JBUjVDLFNBQVMsU0FBQztvQkFDUCxRQUFRLEVBQUUsVUFBVTtvQkFDcEIsb2hEQUFvQztvQkFDcEMsU0FBUyxFQUFFO3dCQUNQLGtCQUFrQixDQUFDLGFBQWEsQ0FBQztxQkFDcEM7aUJBQ0o7Ozs7Z0JBOUQyRCxRQUFRO2dCQUMzRCxNQUFNO2dCQUVOLG1CQUFtQix1QkFtSW5CLElBQUksWUFBSSxRQUFRO2dCQTNIaEIsWUFBWSx1QkE0SFosUUFBUTs2Q0FDUixTQUFTLFNBQUMsY0FBYzs7O3lCQXRENUIsWUFBWSxTQUFDLFNBQVM7eUJBUXRCLFlBQVksU0FBQyxVQUFVOzRCQU92QixZQUFZLFNBQUMsaUJBQWlCLEVBQUUsQ0FBQyxRQUFRLEVBQUUsWUFBWSxDQUFDLGNBQ3hELFlBQVksU0FBQyxtQkFBbUIsRUFBRSxDQUFDLFFBQVEsRUFBRSxjQUFjLENBQUMsY0FDNUQsWUFBWSxTQUFDLG9CQUFvQixFQUFFLENBQUMsUUFBUSxFQUFFLGVBQWUsQ0FBQyxjQUM5RCxZQUFZLFNBQUMsbUJBQW1CLEVBQUUsQ0FBQyxRQUFRLEVBQUUsY0FBYyxDQUFDLGNBQzVELFlBQVksU0FBQyxlQUFlLEVBQUUsQ0FBQyxRQUFRLEVBQUUsU0FBUyxDQUFDOztJQTRIeEQsb0JBQUM7Q0FBQSxBQXpLRCxDQU9tQyx3QkFBd0IsR0FrSzFEO1NBbEtZLGFBQWEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBZnRlclZpZXdJbml0LCBBdHRyaWJ1dGUsIENvbXBvbmVudCwgSG9zdExpc3RlbmVyLCBJbmplY3RvciwgT25EZXN0cm95LCBPbkluaXQsIE9wdGlvbmFsLCBTZWxmIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBSb3V0ZXIgfSBmcm9tICdAYW5ndWxhci9yb3V0ZXInO1xuXG5pbXBvcnQgeyBCc0Ryb3Bkb3duRGlyZWN0aXZlIH0gZnJvbSAnbmd4LWJvb3RzdHJhcCc7XG5cbmltcG9ydCB7ICRhcHBEaWdlc3QsIGFkZENsYXNzLCByZW1vdmVDbGFzcyB9IGZyb20gJ0B3bS9jb3JlJztcblxuaW1wb3J0IHsgc3R5bGVyIH0gZnJvbSAnLi4vLi4vZnJhbWV3b3JrL3N0eWxlcic7XG5pbXBvcnQgeyBpc0FjdGl2ZU5hdkl0ZW0sIHByb3ZpZGVBc1dpZGdldFJlZiB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL3dpZGdldC11dGlscyc7XG5pbXBvcnQgeyByZWdpc3RlclByb3BzIH0gZnJvbSAnLi9tZW51LnByb3BzJztcbmltcG9ydCB7IERhdGFzZXRBd2FyZU5hdkNvbXBvbmVudCwgTmF2Tm9kZSB9IGZyb20gJy4uL2Jhc2UvZGF0YXNldC1hd2FyZS1uYXYuY29tcG9uZW50JztcbmltcG9ydCB7IE5hdkNvbXBvbmVudCB9IGZyb20gJy4uL25hdi9uYXYuY29tcG9uZW50JztcblxuZGVjbGFyZSBjb25zdCBfO1xuXG5leHBvcnQgY29uc3QgS0VZQk9BUkRfTU9WRU1FTlRTID0ge1xuICAgIE1PVkVfVVA6ICdVUC1BUlJPVycsXG4gICAgTU9WRV9MRUZUIDogJ0xFRlQtQVJST1cnLFxuICAgIE1PVkVfUklHSFQgOiAnUklHSFQtQVJST1cnLFxuICAgIE1PVkVfRE9XTiA6ICdET1dOLUFSUk9XJyxcbiAgICBPTl9FTlRFUiA6ICdFTlRFUicsXG4gICAgT05fVEFCIDogJ1RBQicsXG4gICAgT05fRVNDQVBFIDogJ0VTQydcbn07XG5cbmV4cG9ydCBjb25zdCBNRU5VX1BPU0lUSU9OID0ge1xuICAgIFVQX0xFRlQ6ICd1cCxsZWZ0JyxcbiAgICBVUF9SSUdIVDogJ3VwLHJpZ2h0JyxcbiAgICBET1dOX0xFRlQ6ICdkb3duLGxlZnQnLFxuICAgIERPV05fUklHSFQ6ICdkb3duLHJpZ2h0JyxcbiAgICBJTkxJTkU6ICdpbmxpbmUnXG59O1xuXG5jb25zdCBQT1NJVElPTiA9IHtcbiAgICBET1dOX1JJR0hUOiAnZG93bixyaWdodCcsXG4gICAgRE9XTl9MRUZUOiAnZG93bixsZWZ0JyxcbiAgICBVUF9SSUdIVDogJ3VwLHJpZ2h0JyxcbiAgICBVUF9MRUZUOiAndXAsbGVmdCcsXG4gICAgSU5MSU5FOiAnaW5saW5lJ1xufTtcbmNvbnN0IENBUkVUX0NMUyA9IHtcbiAgICBVUDogJ2ZhLWNhcmV0LXVwJyxcbiAgICBET1dOOiAnZmEtY2FyZXQtZG93bidcbn07XG5jb25zdCBQVUxMX0NMUyA9IHtcbiAgICBMRUZUOiAncHVsbC1sZWZ0JyxcbiAgICBSSUdIVDogJ3B1bGwtcmlnaHQnXG59O1xuXG5jb25zdCBBVVRPX09QRU4gPSB7XG4gICAgTkVWRVI6ICduZXZlcicsXG4gICAgQUNUSVZFX1BBR0U6ICdhY3RpdmVwYWdlJyxcbiAgICBBTFdBWVM6ICdhbHdheXMnXG59O1xuXG5jb25zdCBXSURHRVRfQ09ORklHID0ge3dpZGdldFR5cGU6ICd3bS1tZW51JywgaG9zdENsYXNzOiAnZHJvcGRvd24gYXBwLW1lbnUnfTtcbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnW3dtTWVudV0nLFxuICAgIHRlbXBsYXRlVXJsOiAnLi9tZW51LmNvbXBvbmVudC5odG1sJyxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgcHJvdmlkZUFzV2lkZ2V0UmVmKE1lbnVDb21wb25lbnQpXG4gICAgXVxufSlcbmV4cG9ydCBjbGFzcyBNZW51Q29tcG9uZW50IGV4dGVuZHMgRGF0YXNldEF3YXJlTmF2Q29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0LCBPbkRlc3Ryb3ksIEFmdGVyVmlld0luaXQge1xuICAgIHN0YXRpYyBpbml0aWFsaXplUHJvcHMgPSByZWdpc3RlclByb3BzKCk7XG5cbiAgICBwdWJsaWMgbWVudWFsaWduOiBzdHJpbmc7XG4gICAgcHVibGljIG1lbnVwb3NpdGlvbjogc3RyaW5nO1xuICAgIHB1YmxpYyBtZW51bGF5b3V0OiBzdHJpbmc7XG4gICAgcHVibGljIG1lbnVjbGFzczogc3RyaW5nO1xuICAgIHB1YmxpYyBsaW5rdGFyZ2V0OiBzdHJpbmc7XG4gICAgcHVibGljIGljb25jbGFzczogc3RyaW5nO1xuICAgIHB1YmxpYyBhbmltYXRlaXRlbXM6IHN0cmluZztcbiAgICBwdWJsaWMgZGlzYWJsZU1lbnVDb250ZXh0OiBib29sZWFuO1xuICAgIHB1YmxpYyBhdXRvY2xvc2U6IHN0cmluZztcbiAgICBwdWJsaWMgYXV0b29wZW46IHN0cmluZztcblxuICAgIHByaXZhdGUgbWVudUNhcmV0ID0gJ2ZhLWNhcmV0LWRvd24nO1xuICAgIHByaXZhdGUgX3NlbGVjdEZpcnN0SXRlbSA9IGZhbHNlO1xuXG4gICAgcHVibGljIHR5cGU6IGFueTtcblxuICAgIEBIb3N0TGlzdGVuZXIoJ29uU2hvd24nKSBvblNob3coKSB7XG4gICAgICAgIGlmICh0aGlzLl9zZWxlY3RGaXJzdEl0ZW0pIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuJGVsZW1lbnQuZmluZCgnPiB1bFt3bW1lbnVkcm9wZG93bl0gbGkuYXBwLW1lbnUtaXRlbTpmaXJzdCA+IGEnKS5mb2N1cygpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgJGFwcERpZ2VzdCgpO1xuICAgIH1cbiAgICBASG9zdExpc3RlbmVyKCdvbkhpZGRlbicpIG9uSGlkZSAoKSB7XG4gICAgICAgIHRoaXMuJGVsZW1lbnQuZmluZCgnPi5kcm9wZG93bi10b2dnbGUnKS5mb2N1cygpO1xuICAgICAgICB0aGlzLiRlbGVtZW50LmZpbmQoJ2xpJykucmVtb3ZlQ2xhc3MoJ29wZW4nKTtcbiAgICAgICAgdGhpcy5fc2VsZWN0Rmlyc3RJdGVtID0gZmFsc2U7XG4gICAgICAgICRhcHBEaWdlc3QoKTtcbiAgICB9XG5cbiAgICBASG9zdExpc3RlbmVyKCdrZXlkb3duLmFycm93dXAnLCBbJyRldmVudCcsICdcIlVQLUFSUk9XXCInXSlcbiAgICBASG9zdExpc3RlbmVyKCdrZXlkb3duLmFycm93ZG93bicsIFsnJGV2ZW50JywgJ1wiRE9XTi1BUlJPV1wiJ10pXG4gICAgQEhvc3RMaXN0ZW5lcigna2V5ZG93bi5hcnJvd3JpZ2h0JywgWyckZXZlbnQnLCAnXCJSSUdIVC1BUlJPV1wiJ10pXG4gICAgQEhvc3RMaXN0ZW5lcigna2V5ZG93bi5hcnJvd2xlZnQnLCBbJyRldmVudCcsICdcIkxFRlQtQVJST1dcIiddKVxuICAgIEBIb3N0TGlzdGVuZXIoJ2tleWRvd24uZW50ZXInLCBbJyRldmVudCcsICdcIkVOVEVSXCInXSkgb25LZXlEb3duKCRldmVudCwgZXZlbnRBY3Rpb24pIHtcbiAgICAgICAgY29uc3QgS0VZX01PVkVNRU5UUyA9IF8uY2xvbmUoS0VZQk9BUkRfTU9WRU1FTlRTKTtcbiAgICAgICAgaWYgKHRoaXMubWVudXBvc2l0aW9uID09PSBNRU5VX1BPU0lUSU9OLlVQX1JJR0hUKSB7XG4gICAgICAgICAgICBLRVlfTU9WRU1FTlRTLk1PVkVfVVAgPSAnRE9XTi1BUlJPVyc7XG4gICAgICAgICAgICBLRVlfTU9WRU1FTlRTLk1PVkVfRE9XTiA9ICdVUC1BUlJPVyc7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5tZW51cG9zaXRpb24gPT09IE1FTlVfUE9TSVRJT04uVVBfTEVGVCkge1xuICAgICAgICAgICAgS0VZX01PVkVNRU5UUy5NT1ZFX1VQID0gJ0RPV04tQVJST1cnO1xuICAgICAgICAgICAgS0VZX01PVkVNRU5UUy5NT1ZFX0RPV04gPSAnVVAtQVJST1cnO1xuICAgICAgICAgICAgS0VZX01PVkVNRU5UUy5NT1ZFX0xFRlQgPSAnUklHSFQtQVJST1cnO1xuICAgICAgICAgICAgS0VZX01PVkVNRU5UUy5NT1ZFX1JJR0hUID0gJ0xFRlQtQVJST1cnO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMubWVudXBvc2l0aW9uID09PSBNRU5VX1BPU0lUSU9OLkRPV05fTEVGVCkge1xuICAgICAgICAgICAgS0VZX01PVkVNRU5UUy5NT1ZFX0xFRlQgPSAnUklHSFQtQVJST1cnO1xuICAgICAgICAgICAgS0VZX01PVkVNRU5UUy5NT1ZFX1JJR0hUID0gJ0xFRlQtQVJST1cnO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKF8uaW5jbHVkZXMoW0tFWV9NT1ZFTUVOVFMuTU9WRV9ET1dOLCBLRVlfTU9WRU1FTlRTLk1PVkVfUklHSFRdLCBldmVudEFjdGlvbikpIHtcbiAgICAgICAgICAgIGlmICghdGhpcy5ic0Ryb3Bkb3duLmlzT3Blbikge1xuICAgICAgICAgICAgICAgIHRoaXMuX3NlbGVjdEZpcnN0SXRlbSA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5ic0Ryb3Bkb3duLnNob3coKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kZWxlbWVudC5maW5kKCc+IHVsW3dtbWVudWRyb3Bkb3duXSBsaS5hcHAtbWVudS1pdGVtOmZpcnN0ID4gYScpLmZvY3VzKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoZXZlbnRBY3Rpb24gPT09IEtFWV9NT1ZFTUVOVFMuT05fRU5URVIpIHtcbiAgICAgICAgICAgIHRoaXMuYnNEcm9wZG93bi50b2dnbGUodHJ1ZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoXy5pbmNsdWRlcyhbS0VZX01PVkVNRU5UUy5NT1ZFX1VQLCBLRVlfTU9WRU1FTlRTLk1PVkVfTEVGVF0sIGV2ZW50QWN0aW9uKSkge1xuICAgICAgICAgICAgdGhpcy5ic0Ryb3Bkb3duLmhpZGUoKTtcbiAgICAgICAgfVxuICAgICAgICAkZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgaW5qOiBJbmplY3RvcixcbiAgICAgICAgcHVibGljIHJvdXRlOiBSb3V0ZXIsXG4gICAgICAgIEBTZWxmKCkgQE9wdGlvbmFsKCkgcHVibGljIGJzRHJvcGRvd246IEJzRHJvcGRvd25EaXJlY3RpdmUsXG4gICAgICAgIEBPcHRpb25hbCgpIHByaXZhdGUgcGFyZW50TmF2OiBOYXZDb21wb25lbnQsXG4gICAgICAgIEBBdHRyaWJ1dGUoJ3NlbGVjdC5ldmVudCcpIHB1YmxpYyBzZWxlY3RFdmVudENCOiBzdHJpbmdcbiAgICApIHtcbiAgICAgICAgc3VwZXIoaW5qLCBXSURHRVRfQ09ORklHKTtcbiAgICAgICAgaWYgKHBhcmVudE5hdikge1xuICAgICAgICAgICAgdGhpcy5kaXNhYmxlTWVudUNvbnRleHQgPSAhIXBhcmVudE5hdi5kaXNhYmxlTWVudUNvbnRleHQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmRpc2FibGVNZW51Q29udGV4dCA9ICEhc2VsZWN0RXZlbnRDQjtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHJldHVybnMgdHJ1ZSBpZiB0aGUgbWVudSBoYXMgbGluayB0byB0aGUgY3VycmVudCBwYWdlLlxuICAgICAqIEBwYXJhbSBub2Rlc1xuICAgICAqL1xuICAgIHByaXZhdGUgaGFzTGlua1RvQ3VycmVudFBhZ2Uobm9kZXM6IEFycmF5PE5hdk5vZGU+KSB7XG4gICAgICAgIHJldHVybiBub2Rlcy5zb21lKG5vZGUgPT4ge1xuICAgICAgICAgICAgaWYgKGlzQWN0aXZlTmF2SXRlbShub2RlLmxpbmssIHRoaXMucm91dGUudXJsKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG5vZGUuY2hpbGRyZW4pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5oYXNMaW5rVG9DdXJyZW50UGFnZShub2RlLmNoaWxkcmVuKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJvdGVjdGVkIHJlc2V0Tm9kZXMoKSB7XG4gICAgICAgIHN1cGVyLnJlc2V0Tm9kZXMoKTtcbiAgICAgICAgLy8gb3BlbiB0aGUgbWVudSBpZiBhbnkgb2YgaXRzIG1lbnUgaXRlbXMgaGFzIGxpbmsgdG8gY3VycmVudCBwYWdlIGFuZCBpZiBhdXRvb3BlbiB2YWx1ZSBpcyAnYWN0aXZlIHBhZ2UnXG4gICAgICAgIGlmICgodGhpcy5hdXRvb3BlbiA9PT0gQVVUT19PUEVOLkFDVElWRV9QQUdFICYmIHRoaXMuaGFzTGlua1RvQ3VycmVudFBhZ2UodGhpcy5ub2RlcykpIHx8IHRoaXMuYXV0b29wZW4gPT09IEFVVE9fT1BFTi5BTFdBWVMpIHtcbiAgICAgICAgICAgIHRoaXMuYnNEcm9wZG93bi5zaG93KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBuZ09uSW5pdCgpIHtcbiAgICAgICAgc3VwZXIubmdPbkluaXQoKTtcbiAgICAgICAgdGhpcy5zZXRNZW51UG9zaXRpb24oKTtcbiAgICB9XG5cbiAgICBvblByb3BlcnR5Q2hhbmdlKGtleTogc3RyaW5nLCBudjogYW55LCBvdj86IGFueSkge1xuXG4gICAgICAgIGlmIChrZXkgPT09ICd0YWJpbmRleCcpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChrZXkgPT09ICdhdXRvY2xvc2UnKSB7XG4gICAgICAgICAgICB0aGlzLmJzRHJvcGRvd24uYXV0b0Nsb3NlID0gbnYgIT09ICdkaXNhYmxlZCc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdXBlci5vblByb3BlcnR5Q2hhbmdlKGtleSwgbnYsIG92KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgc2V0TWVudVBvc2l0aW9uKCkge1xuICAgICAgICBzd2l0Y2ggKHRoaXMubWVudXBvc2l0aW9uKSB7XG4gICAgICAgICAgICBjYXNlIFBPU0lUSU9OLkRPV05fUklHSFQ6XG4gICAgICAgICAgICAgICAgcmVtb3ZlQ2xhc3ModGhpcy5uYXRpdmVFbGVtZW50LCAnZHJvcHVwJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5tZW51YWxpZ24gPSBQVUxMX0NMUy5MRUZUO1xuICAgICAgICAgICAgICAgIHRoaXMubWVudUNhcmV0ID0gQ0FSRVRfQ0xTLkRPV047XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFBPU0lUSU9OLkRPV05fTEVGVDpcbiAgICAgICAgICAgICAgICByZW1vdmVDbGFzcyh0aGlzLm5hdGl2ZUVsZW1lbnQsICdkcm9wdXAnKTtcbiAgICAgICAgICAgICAgICB0aGlzLm1lbnVhbGlnbiA9IFBVTExfQ0xTLlJJR0hUO1xuICAgICAgICAgICAgICAgIHRoaXMubWVudUNhcmV0ID0gQ0FSRVRfQ0xTLkRPV047XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFBPU0lUSU9OLlVQX0xFRlQ6XG4gICAgICAgICAgICAgICAgYWRkQ2xhc3ModGhpcy5uYXRpdmVFbGVtZW50LCAnZHJvcHVwJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5tZW51YWxpZ24gPSBQVUxMX0NMUy5SSUdIVDtcbiAgICAgICAgICAgICAgICB0aGlzLm1lbnVDYXJldCA9IENBUkVUX0NMUy5VUDtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgUE9TSVRJT04uVVBfUklHSFQ6XG4gICAgICAgICAgICAgICAgYWRkQ2xhc3ModGhpcy5uYXRpdmVFbGVtZW50LCAnZHJvcHVwJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5tZW51YWxpZ24gPSBQVUxMX0NMUy5MRUZUO1xuICAgICAgICAgICAgICAgIHRoaXMubWVudUNhcmV0ID0gQ0FSRVRfQ0xTLlVQO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBQT1NJVElPTi5JTkxJTkU6XG4gICAgICAgICAgICAgICAgdGhpcy5tZW51YWxpZ24gPSAnZHJvcGlubGluZS1tZW51JztcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBvbk1lbnVJdGVtU2VsZWN0KGFyZ3MpIHtcbiAgICAgICAgY29uc3QgeyRldmVudH0gPSBhcmdzO1xuICAgICAgICBjb25zdCAkaXRlbSA9IGFyZ3MuJGl0ZW0udmFsdWU7XG4gICAgICAgIHRoaXMuaW52b2tlRXZlbnRDYWxsYmFjaygnc2VsZWN0JywgeyRldmVudCwgJGl0ZW19KTtcbiAgICB9XG5cbiAgICBuZ0FmdGVyVmlld0luaXQoKSB7XG4gICAgICAgIHN1cGVyLm5nQWZ0ZXJWaWV3SW5pdCgpO1xuICAgICAgICBzdHlsZXIodGhpcy5uYXRpdmVFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5kcm9wZG93bi10b2dnbGUnKSBhcyBIVE1MRWxlbWVudCwgdGhpcyk7XG4gICAgfVxufVxuIl19