import * as tslib_1 from "tslib";
import { Attribute, Component, Injector, ViewChild } from '@angular/core';
import { AbstractNavigationService, App } from '@wm/core';
import { BaseComponent, getImageUrl, PageDirective, provideAsWidgetRef, SearchComponent } from '@wm/components';
import { DeviceService } from '@wm/mobile/core';
import { registerProps } from './mobile-navbar.props';
var DEFAULT_CLS = 'app-mobile-header app-mobile-navbar';
var WIDGET_CONFIG = { widgetType: 'wm-mobile-navbar', hostClass: DEFAULT_CLS };
var MobileNavbarComponent = /** @class */ (function (_super) {
    tslib_1.__extends(MobileNavbarComponent, _super);
    function MobileNavbarComponent(app, page, deviceService, navigationService, inj, backbtnClickEvt) {
        var _this = _super.call(this, inj, WIDGET_CONFIG) || this;
        _this.page = page;
        _this.deviceService = deviceService;
        _this.navigationService = navigationService;
        _this.backbtnClickEvt = backbtnClickEvt;
        _this._isReady = false;
        page.subscribe('wmLeftPanel:ready', function (leftNavPanel) {
            if (_this.showLeftnavbtn) {
                _this.leftNavPanel = leftNavPanel;
            }
        });
        _this._backBtnListenerDestroyer = deviceService.onBackButtonTap(function ($event) {
            if (_this._isReady) {
                if (_this.backbtnClickEvt) {
                    _this.invokeEventCallback('backbtnclick', { $event: $event });
                    return false;
                }
            }
        });
        setTimeout(function () { return _this._isReady = true; }, 1000);
        return _this;
    }
    Object.defineProperty(MobileNavbarComponent.prototype, "datasource", {
        // getter setter is added to pass the datasource to searchcomponent.
        get: function () {
            return this._datasource;
        },
        set: function (nv) {
            this._datasource = nv;
            this.searchComponent.datasource = nv;
        },
        enumerable: true,
        configurable: true
    });
    MobileNavbarComponent.prototype.ngAfterViewInit = function () {
        this.searchComponent.binddisplayimagesrc = this.binddisplayimagesrc;
        this.searchComponent.displayimagesrc = this.binddisplayimagesrc ? this.binddisplayimagesrc : this.displayimagesrc;
        this.searchComponent.displaylabel = this.binddisplaylabel ? this.binddisplaylabel : this.displaylabel;
        this.searchComponent.datafield = this.datafield;
        this.searchComponent.binddataset = this.binddataset;
        this.searchComponent.dataset = this.dataset;
        this.searchComponent.searchkey = this.searchkey;
        this.searchComponent.datasource = this.datasource;
        this.searchComponent.matchmode = this.matchmode;
    };
    MobileNavbarComponent.prototype.goBack = function ($event) {
        /**
         * TODO: while trying navigating from details page to edit page in wavereads, app is navigating
         * as details -> editPage -> details. For now, keeping this callback to react after 1 second.
         */
        this.deviceService.executeBackTapListeners($event);
    };
    MobileNavbarComponent.prototype.ngOnDestroy = function () {
        this._backBtnListenerDestroyer();
        _super.prototype.ngOnDestroy.call(this);
    };
    MobileNavbarComponent.prototype.onPropertyChange = function (key, nv, ov) {
        if (this.searchComponent) {
            if (key === 'datafield') {
                this.searchComponent.datafield = this.datafield;
            }
            if (key === 'displaylabel') {
                this.searchComponent.displaylabel = this.binddisplaylabel ? this.binddisplaylabel : this.displaylabel;
            }
        }
        if (key === 'imgsrc') {
            this.imagesrc = getImageUrl(nv);
        }
        else if (key === 'dataset') {
            // $is._dataset = nv;
        }
        else if (key === 'defaultview') {
            this.showSearchbar = (nv === 'searchview');
        }
        else if (key === 'datavalue') {
            this.query = nv;
        }
        else {
            _super.prototype.onPropertyChange.call(this, key, nv, ov);
        }
    };
    MobileNavbarComponent.prototype.onSubmission = function ($event) {
        this.invokeEventCallback('search', { $event: $event });
    };
    // switches the view based on defaultview
    MobileNavbarComponent.prototype.switchView = function (view) {
        this.showSearchbar = (view !== 'actionview');
    };
    // goto previous view or page
    MobileNavbarComponent.prototype.goBacktoPreviousView = function ($event) {
        if (this.defaultview === 'actionview') {
            // switches the view from search to action or action to search.
            this.switchView('actionview');
        }
        else {
            // goes back to the previous visited page.
            this.goBack($event);
        }
    };
    MobileNavbarComponent.prototype.onSelect = function ($event, widget, selectedValue) {
        this.datavalue = selectedValue;
        this.query = widget.query;
        this.invokeEventCallback('change', {
            $event: $event,
            newVal: selectedValue,
            oldVal: widget.prevDatavalue
        });
    };
    MobileNavbarComponent.prototype.onClear = function () {
        this.datavalue = '';
        this.query = '';
    };
    MobileNavbarComponent.initializeProps = registerProps();
    MobileNavbarComponent.decorators = [
        { type: Component, args: [{
                    selector: 'header[wmMobileNavbar]',
                    template: "<nav class=\"navbar\" *ngIf=\"!showSearchbar\">\n    <div class=\"mobile-navbar-left\">\n        <ul class=\"nav navbar-nav navbar-left\">\n            <li *ngIf=\"leftNavPanel\" >\n                <a (click)=\"leftNavPanel.toggle();\"  href=\"javascript: void(0);\">\n                    <i [ngClass]=\"leftnavpaneliconclass\"></i>\n                    </a>\n                </li>\n            <li *ngIf=\"backbutton\">\n                <a class=\"btn-back\" type=\"button\" (click)=\"goBack($event)\"  href=\"javascript: void(0);\">\n                    <i [ngClass]=\"backbuttoniconclass\"></i><span [innerText]=\"backbuttonlabel\"></span>\n                </a>\n            </li>\n        </ul>\n    </div>\n    <div class=\"mobile-navbar-center\">\n        <div class=\"navbar-header\">\n            <h1 class=\"navbar-brand\">\n                <img data-identifier=\"img\" class=\"brand-image\" [alt]=\"title\" width=\"32\" height=\"32\" *ngIf=\"imgsrc\" [src]=\"imgsrc\"/>\n                <span class=\"title\" [innerText]=\"title || ''\"></span>\n                </h1>\n            </div>\n        </div>\n    <div class=\"mobile-navbar-right\">\n        <ul class=\"nav navbar-nav navbar-right\">\n            <li>\n                <ng-content></ng-content>\n            </li>\n            <li *ngIf=\"searchbutton\">\n                <a class=\"btn-search btn-transparent\" type=\"button\" (click)=\"showSearchbar = true\"  href=\"javascript: void(0);\">\n                    <i [ngClass]=\"searchbuttoniconclass\"></i><span [innerText]=\"searchbuttonlabel\"></span>\n                </a>\n            </li>\n        </ul>\n    </div>\n</nav>\n<nav class=\"navbar searchbar\" [hidden]=\"!showSearchbar\">\n    <div class=\"mobile-navbar-left\">\n        <ul class=\"nav navbar-nav navbar-left\">\n            <li>\n                <a class=\"btn-back\" type=\"button\" (click)=\"goBacktoPreviousView($event)\" href=\"javascript:void(0);\">\n                    <i [ngClass]=\"backbuttoniconclass\"></i>\n                </a>\n            </li>\n        </ul>\n    </div>\n    <div class=\"mobile-navbar-center search-container\">\n        <div wmSearch query.bind=\"query\"\n             clearsearch.event=\"onClear();\"\n             select.event=\"onSelect($event, widget, selectedValue)\"\n             searchkey.bind=\"searchkey\"\n             dataset.bind=\"dataset\"\n             displayimagesrc.bind=\"displayimagesrc\"\n             datavalue.bind=\"datavalue\"\n             submit.event=\"onSubmission($event, widget, value)\"\n             placeholder.bind=\"searchplaceholder\"\n             navsearchbar=\"true\"\n             readonly.bind=\"readonlySearchBar\">\n        </div>\n    </div>\n    <div class=\"mobile-navbar-right\">\n        <ul class=\"nav navbar-nav navbar-right\">\n            <li>\n                <a class=\"btn-cancel btn-transparent\" type=\"button\" (click)=\"showSearchbar = false;\"  href=\"javascript: void(0);\"> Cancel </a>\n            </li>\n        </ul>\n    </div>\n</nav>",
                    providers: [
                        provideAsWidgetRef(MobileNavbarComponent)
                    ]
                }] }
    ];
    /** @nocollapse */
    MobileNavbarComponent.ctorParameters = function () { return [
        { type: App },
        { type: PageDirective },
        { type: DeviceService },
        { type: AbstractNavigationService },
        { type: Injector },
        { type: undefined, decorators: [{ type: Attribute, args: ['backbtnclick.event',] }] }
    ]; };
    MobileNavbarComponent.propDecorators = {
        searchComponent: [{ type: ViewChild, args: [SearchComponent,] }]
    };
    return MobileNavbarComponent;
}(BaseComponent));
export { MobileNavbarComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9iaWxlLW5hdmJhci5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vbW9iaWxlL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL21vYmlsZS1uYXZiYXIvbW9iaWxlLW5hdmJhci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBaUIsU0FBUyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQWEsU0FBUyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRXBHLE9BQU8sRUFBRSx5QkFBeUIsRUFBRSxHQUFHLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFDMUQsT0FBTyxFQUFFLGFBQWEsRUFBRSxXQUFXLEVBQXFDLGFBQWEsRUFBRSxrQkFBa0IsRUFBRSxlQUFlLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUNuSixPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFFaEQsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBRXRELElBQU0sV0FBVyxHQUFHLHFDQUFxQyxDQUFDO0FBQzFELElBQU0sYUFBYSxHQUFrQixFQUFDLFVBQVUsRUFBRSxrQkFBa0IsRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFDLENBQUM7QUFFOUY7SUFPMkMsaURBQWE7SUFxQ3BELCtCQUNJLEdBQVEsRUFDQSxJQUFtQixFQUNuQixhQUE0QixFQUM1QixpQkFBNEMsRUFDcEQsR0FBYSxFQUM0QixlQUFlO1FBTjVELFlBUUksa0JBQU0sR0FBRyxFQUFFLGFBQWEsQ0FBQyxTQWU1QjtRQXJCVyxVQUFJLEdBQUosSUFBSSxDQUFlO1FBQ25CLG1CQUFhLEdBQWIsYUFBYSxDQUFlO1FBQzVCLHVCQUFpQixHQUFqQixpQkFBaUIsQ0FBMkI7UUFFWCxxQkFBZSxHQUFmLGVBQWUsQ0FBQTtRQXhDcEQsY0FBUSxHQUFHLEtBQUssQ0FBQztRQTJDckIsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsRUFBRSxVQUFD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YUFBYSxDQUFDO1FBQy9CLElBQUksQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQztRQUMxQixJQUFJLENBQUMsbUJBQW1CLENBQUMsUUFBUSxFQUFFO1lBQy9CLE1BQU0sUUFBQTtZQUNOLE1BQU0sRUFBRSxhQUFhO1lBQ3JCLE1BQU0sRUFBRSxNQUFNLENBQUMsYUFBYTtTQUMvQixDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU8sdUNBQU8sR0FBZjtRQUNJLElBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO1FBQ3BCLElBQUksQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO0lBQ3BCLENBQUM7SUEvSU0scUNBQWUsR0FBRyxhQUFhLEVBQUUsQ0FBQzs7Z0JBUjVDLFNBQVMsU0FBQztvQkFDUCxRQUFRLEVBQUUsd0JBQXdCO29CQUNsQyxzK0ZBQTZDO29CQUM3QyxTQUFTLEVBQUU7d0JBQ1Asa0JBQWtCLENBQUMscUJBQXFCLENBQUM7cUJBQzVDO2lCQUNKOzs7O2dCQWZtQyxHQUFHO2dCQUNpQyxhQUFhO2dCQUM1RSxhQUFhO2dCQUZiLHlCQUF5QjtnQkFGWSxRQUFRO2dEQTZEN0MsU0FBUyxTQUFDLG9CQUFvQjs7O2tDQTdCbEMsU0FBUyxTQUFDLGVBQWU7O0lBbUk5Qiw0QkFBQztDQUFBLEFBeEpELENBTzJDLGFBQWEsR0FpSnZEO1NBakpZLHFCQUFxQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFmdGVyVmlld0luaXQsIEF0dHJpYnV0ZSwgQ29tcG9uZW50LCBJbmplY3RvciwgT25EZXN0cm95LCBWaWV3Q2hpbGQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgQWJzdHJhY3ROYXZpZ2F0aW9uU2VydmljZSwgQXBwIH0gZnJvbSAnQHdtL2NvcmUnO1xuaW1wb3J0IHsgQmFzZUNvbXBvbmVudCwgZ2V0SW1hZ2VVcmwsIElXaWRnZXRDb25maWcsIExlZnRQYW5lbERpcmVjdGl2ZSwgUGFnZURpcmVjdGl2ZSwgcHJvdmlkZUFzV2lkZ2V0UmVmLCBTZWFyY2hDb21wb25lbnQgfSBmcm9tICdAd20vY29tcG9uZW50cyc7XG5pbXBvcnQgeyBEZXZpY2VTZXJ2aWNlIH0gZnJvbSAnQHdtL21vYmlsZS9jb3JlJztcblxuaW1wb3J0IHsgcmVnaXN0ZXJQcm9wcyB9IGZyb20gJy4vbW9iaWxlLW5hdmJhci5wcm9wcyc7XG5cbmNvbnN0IERFRkFVTFRfQ0xTID0gJ2FwcC1tb2JpbGUtaGVhZGVyIGFwcC1tb2JpbGUtbmF2YmFyJztcbmNvbnN0IFdJREdFVF9DT05GSUc6IElXaWRnZXRDb25maWcgPSB7d2lkZ2V0VHlwZTogJ3dtLW1vYmlsZS1uYXZiYXInLCBob3N0Q2xhc3M6IERFRkFVTFRfQ0xTfTtcblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdoZWFkZXJbd21Nb2JpbGVOYXZiYXJdJyxcbiAgICB0ZW1wbGF0ZVVybDogJy4vbW9iaWxlLW5hdmJhci5jb21wb25lbnQuaHRtbCcsXG4gICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIHByb3ZpZGVBc1dpZGdldFJlZihNb2JpbGVOYXZiYXJDb21wb25lbnQpXG4gICAgXVxufSlcbmV4cG9ydCBjbGFzcyBNb2JpbGVOYXZiYXJDb21wb25lbnQgZXh0ZW5kcyBCYXNlQ29tcG9uZW50IGltcGxlbWVudHMgT25EZXN0cm95LCBBZnRlclZpZXdJbml0IHtcbiAgICBzdGF0aWMgaW5pdGlhbGl6ZVByb3BzID0gcmVnaXN0ZXJQcm9wcygpO1xuXG4gICAgcHJpdmF0ZSBfaXNSZWFkeSA9IGZhbHNlO1xuICAgIHB1YmxpYyBkYXRhdmFsdWU6IHN0cmluZztcbiAgICBwdWJsaWMgaW1hZ2VzcmM6IHN0cmluZztcbiAgICBwdWJsaWMgcXVlcnk6IHN0cmluZztcbiAgICBwdWJsaWMgbGVmdE5hdlBhbmVsOiBMZWZ0UGFuZWxEaXJlY3RpdmU7XG4gICAgcHVibGljIHNob3dMZWZ0bmF2YnRuOiBib29sZWFuO1xuICAgIHB1YmxpYyBzaG93U2VhcmNoYmFyOiBib29sZWFuO1xuICAgIHB1YmxpYyBiYWNrYnV0dG9uaWNvbmNsYXNzOiBhbnk7XG5cbiAgICBwcml2YXRlIF9iYWNrQnRuTGlzdGVuZXJEZXN0cm95ZXI7XG5cbiAgICBAVmlld0NoaWxkKFNlYXJjaENvbXBvbmVudCkgc2VhcmNoQ29tcG9uZW50OiBTZWFyY2hDb21wb25lbnQ7XG4gICAgcHJpdmF0ZSBzZWFyY2hrZXk6IHN0cmluZztcbiAgICBwcml2YXRlIGRhdGFzZXQ6IGFueTtcbiAgICBwcml2YXRlIGJpbmRkYXRhc2V0OiBhbnk7XG4gICAgcHJpdmF0ZSBkYXRhZmllbGQ6IHN0cmluZztcbiAgICBwcml2YXRlIGJpbmRkaXNwbGF5bGFiZWw6IHN0cmluZztcbiAgICBwcml2YXRlIGRpc3BsYXlsYWJlbDogc3RyaW5nO1xuICAgIHByaXZhdGUgYmluZGRpc3BsYXlpbWFnZXNyYzogc3RyaW5nO1xuICAgIHByaXZhdGUgZGlzcGxheWltYWdlc3JjOiBzdHJpbmc7XG4gICAgcHJpdmF0ZSBfZGF0YXNvdXJjZTogYW55O1xuICAgIHByaXZhdGUgZGVmYXVsdHZpZXc6IHN0cmluZztcbiAgICBwcml2YXRlIG1hdGNobW9kZTogc3RyaW5nO1xuXG4gICAgLy8gZ2V0dGVyIHNldHRlciBpcyBhZGRlZCB0byBwYXNzIHRoZSBkYXRhc291cmNlIHRvIHNlYXJjaGNvbXBvbmVudC5cbiAgICBnZXQgZGF0YXNvdXJjZSAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kYXRhc291cmNlO1xuICAgIH1cblxuICAgIHNldCBkYXRhc291cmNlKG52KSB7XG4gICAgICAgIHRoaXMuX2RhdGFzb3VyY2UgPSBudjtcbiAgICAgICAgdGhpcy5zZWFyY2hDb21wb25lbnQuZGF0YXNvdXJjZSA9IG52O1xuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBhcHA6IEFwcCxcbiAgICAgICAgcHJpdmF0ZSBwYWdlOiBQYWdlRGlyZWN0aXZlLFxuICAgICAgICBwcml2YXRlIGRldmljZVNlcnZpY2U6IERldmljZVNlcnZpY2UsXG4gICAgICAgIHByaXZhdGUgbmF2aWdhdGlvblNlcnZpY2U6IEFic3RyYWN0TmF2aWdhdGlvblNlcnZpY2UsXG4gICAgICAgIGluajogSW5qZWN0b3IsXG4gICAgICAgIEBBdHRyaWJ1dGUoJ2JhY2tidG5jbGljay5ldmVudCcpIHByaXZhdGUgYmFja2J0bkNsaWNrRXZ0XG4gICAgKSB7XG4gICAgICAgIHN1cGVyKGluaiwgV0lER0VUX0NPTkZJRyk7XG4gICAgICAgIHBhZ2Uuc3Vic2NyaWJlKCd3bUxlZnRQYW5lbDpyZWFkeScsIChsZWZ0TmF2UGFuZWw6IExlZnRQYW5lbERpcmVjdGl2ZSkgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMuc2hvd0xlZnRuYXZidG4pIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxlZnROYXZQYW5lbCA9IGxlZnROYXZQYW5lbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuX2JhY2tCdG5MaXN0ZW5lckRlc3Ryb3llciA9IGRldmljZVNlcnZpY2Uub25CYWNrQnV0dG9uVGFwKCRldmVudCA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5faXNSZWFkeSkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmJhY2tidG5DbGlja0V2dCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmludm9rZUV2ZW50Q2FsbGJhY2soJ2JhY2tidG5jbGljaycsIHskZXZlbnR9KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4gdGhpcy5faXNSZWFkeSA9IHRydWUsIDEwMDApO1xuICAgIH1cblxuICAgIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcbiAgICAgICAgdGhpcy5zZWFyY2hDb21wb25lbnQuYmluZGRpc3BsYXlpbWFnZXNyYyA9IHRoaXMuYmluZGRpc3BsYXlpbWFnZXNyYztcbiAgICAgICAgdGhpcy5zZWFyY2hDb21wb25lbnQuZGlzcGxheWltYWdlc3JjID0gdGhpcy5iaW5kZGlzcGxheWltYWdlc3JjID8gdGhpcy5iaW5kZGlzcGxheWltYWdlc3JjIDogdGhpcy5kaXNwbGF5aW1hZ2VzcmM7XG4gICAgICAgIHRoaXMuc2VhcmNoQ29tcG9uZW50LmRpc3BsYXlsYWJlbCA9IHRoaXMuYmluZGRpc3BsYXlsYWJlbCA/IHRoaXMuYmluZGRpc3BsYXlsYWJlbCA6IHRoaXMuZGlzcGxheWxhYmVsO1xuICAgICAgICB0aGlzLnNlYXJjaENvbXBvbmVudC5kYXRhZmllbGQgPSB0aGlzLmRhdGFmaWVsZDtcbiAgICAgICAgdGhpcy5zZWFyY2hDb21wb25lbnQuYmluZGRhdGFzZXQgPSB0aGlzLmJpbmRkYXRhc2V0O1xuICAgICAgICB0aGlzLnNlYXJjaENvbXBvbmVudC5kYXRhc2V0ID0gdGhpcy5kYXRhc2V0O1xuICAgICAgICB0aGlzLnNlYXJjaENvbXBvbmVudC5zZWFyY2hrZXkgPSB0aGlzLnNlYXJjaGtleTtcbiAgICAgICAgdGhpcy5zZWFyY2hDb21wb25lbnQuZGF0YXNvdXJjZSA9IHRoaXMuZGF0YXNvdXJjZTtcbiAgICAgICAgdGhpcy5zZWFyY2hDb21wb25lbnQubWF0Y2htb2RlID0gdGhpcy5tYXRjaG1vZGU7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgZ29CYWNrKCRldmVudCk6IHZvaWQge1xuICAgICAgICAgLyoqXG4gICAgICAgICAgKiBUT0RPOiB3aGlsZSB0cnlpbmcgbmF2aWdhdGluZyBmcm9tIGRldGFpbHMgcGFnZSB0byBlZGl0IHBhZ2UgaW4gd2F2ZXJlYWRzLCBhcHAgaXMgbmF2aWdhdGluZ1xuICAgICAgICAgICogYXMgZGV0YWlscyAtPiBlZGl0UGFnZSAtPiBkZXRhaWxzLiBGb3Igbm93LCBrZWVwaW5nIHRoaXMgY2FsbGJhY2sgdG8gcmVhY3QgYWZ0ZXIgMSBzZWNvbmQuXG4gICAgICAgICAgKi9cbiAgICAgICAgIHRoaXMuZGV2aWNlU2VydmljZS5leGVjdXRlQmFja1RhcExpc3RlbmVycygkZXZlbnQpO1xuICAgIH1cblxuICAgIHB1YmxpYyBuZ09uRGVzdHJveSgpIHtcbiAgICAgICAgdGhpcy5fYmFja0J0bkxpc3RlbmVyRGVzdHJveWVyKCk7XG4gICAgICAgIHN1cGVyLm5nT25EZXN0cm95KCk7XG4gICAgfVxuXG4gICAgcHVibGljIG9uUHJvcGVydHlDaGFuZ2Uoa2V5LCBudiwgb3Y/KSB7XG4gICAgICAgIGlmICh0aGlzLnNlYXJjaENvbXBvbmVudCkge1xuICAgICAgICAgICAgaWYgKGtleSA9PT0gJ2RhdGFmaWVsZCcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNlYXJjaENvbXBvbmVudC5kYXRhZmllbGQgPSB0aGlzLmRhdGFmaWVsZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChrZXkgPT09ICdkaXNwbGF5bGFiZWwnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZWFyY2hDb21wb25lbnQuZGlzcGxheWxhYmVsID0gdGhpcy5iaW5kZGlzcGxheWxhYmVsID8gdGhpcy5iaW5kZGlzcGxheWxhYmVsIDogdGhpcy5kaXNwbGF5bGFiZWw7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoa2V5ID09PSAnaW1nc3JjJykge1xuICAgICAgICAgICAgdGhpcy5pbWFnZXNyYyA9IGdldEltYWdlVXJsKG52KTtcbiAgICAgICAgfSBlbHNlIGlmIChrZXkgPT09ICdkYXRhc2V0Jykge1xuICAgICAgICAgICAgLy8gJGlzLl9kYXRhc2V0ID0gbnY7XG4gICAgICAgIH0gZWxzZSBpZiAoa2V5ID09PSAnZGVmYXVsdHZpZXcnKSB7XG4gICAgICAgICAgICB0aGlzLnNob3dTZWFyY2hiYXIgPSAobnYgPT09ICdzZWFyY2h2aWV3Jyk7XG4gICAgICAgIH0gZWxzZSBpZiAoa2V5ID09PSAnZGF0YXZhbHVlJykge1xuICAgICAgICAgICAgdGhpcy5xdWVyeSA9IG52O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3VwZXIub25Qcm9wZXJ0eUNoYW5nZShrZXksIG52LCBvdik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgb25TdWJtaXNzaW9uKCRldmVudCk6IHZvaWQge1xuICAgICAgICB0aGlzLmludm9rZUV2ZW50Q2FsbGJhY2soJ3NlYXJjaCcsIHskZXZlbnR9KTtcbiAgICB9XG5cbiAgICAvLyBzd2l0Y2hlcyB0aGUgdmlldyBiYXNlZCBvbiBkZWZhdWx0dmlld1xuICAgIHByaXZhdGUgc3dpdGNoVmlldyh2aWV3KSB7XG4gICAgICAgIHRoaXMuc2hvd1NlYXJjaGJhciA9ICh2aWV3ICE9PSAnYWN0aW9udmlldycpO1xuICAgIH1cblxuICAgIC8vIGdvdG8gcHJldmlvdXMgdmlldyBvciBwYWdlXG4gICAgcHVibGljIGdvQmFja3RvUHJldmlvdXNWaWV3KCRldmVudCkge1xuICAgICAgICBpZiAodGhpcy5kZWZhdWx0dmlldyA9PT0gJ2FjdGlvbnZpZXcnKSB7XG4gICAgICAgICAgICAvLyBzd2l0Y2hlcyB0aGUgdmlldyBmcm9tIHNlYXJjaCB0byBhY3Rpb24gb3IgYWN0aW9uIHRvIHNlYXJjaC5cbiAgICAgICAgICAgIHRoaXMuc3dpdGNoVmlldygnYWN0aW9udmlldycpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gZ29lcyBiYWNrIHRvIHRoZSBwcmV2aW91cyB2aXNpdGVkIHBhZ2UuXG4gICAgICAgICAgICB0aGlzLmdvQmFjaygkZXZlbnQpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvblNlbGVjdCgkZXZlbnQsIHdpZGdldCwgc2VsZWN0ZWRWYWx1ZSkge1xuICAgICAgICB0aGlzLmRhdGF2YWx1ZSA9IHNlbGVjdGVkVmFsdWU7XG4gICAgICAgIHRoaXMucXVlcnkgPSB3aWRnZXQucXVlcnk7XG4gICAgICAgIHRoaXMuaW52b2tlRXZlbnRDYWxsYmFjaygnY2hhbmdlJywge1xuICAgICAgICAgICAgJGV2ZW50LFxuICAgICAgICAgICAgbmV3VmFsOiBzZWxlY3RlZFZhbHVlLFxuICAgICAgICAgICAgb2xkVmFsOiB3aWRnZXQucHJldkRhdGF2YWx1ZVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uQ2xlYXIoKSB7XG4gICAgICAgIHRoaXMuZGF0YXZhbHVlID0gJyc7XG4gICAgICAgIHRoaXMucXVlcnkgPSAnJztcbiAgICB9XG59XG4iXX0=