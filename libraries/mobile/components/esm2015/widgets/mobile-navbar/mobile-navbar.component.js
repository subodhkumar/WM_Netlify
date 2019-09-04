import { Attribute, Component, Injector, ViewChild } from '@angular/core';
import { AbstractNavigationService, App } from '@wm/core';
import { BaseComponent, getImageUrl, PageDirective, provideAsWidgetRef, SearchComponent } from '@wm/components';
import { DeviceService } from '@wm/mobile/core';
import { registerProps } from './mobile-navbar.props';
const DEFAULT_CLS = 'app-mobile-header app-mobile-navbar';
const WIDGET_CONFIG = { widgetType: 'wm-mobile-navbar', hostClass: DEFAULT_CLS };
export class MobileNavbarComponent extends BaseComponent {
    constructor(app, page, deviceService, navigationService, inj, backbtnClickEvt) {
        super(inj, WIDGET_CONFIG);
        this.page = page;
        this.deviceService = deviceService;
        this.navigationService = navigationService;
        this.backbtnClickEvt = backbtnClickEvt;
        this._isReady = false;
        page.subscribe('wmLeftPanel:ready', (leftNavPanel) => {
            if (this.showLeftnavbtn) {
                this.leftNavPanel = leftNavPanel;
            }
        });
        this._backBtnListenerDestroyer = deviceService.onBackButtonTap($event => {
            if (this._isReady) {
                if (this.backbtnClickEvt) {
                    this.invokeEventCallback('backbtnclick', { $event });
                    return false;
                }
            }
        });
        setTimeout(() => this._isReady = true, 1000);
    }
    // getter setter is added to pass the datasource to searchcomponent.
    get datasource() {
        return this._datasource;
    }
    set datasource(nv) {
        this._datasource = nv;
        this.searchComponent.datasource = nv;
    }
    ngAfterViewInit() {
        this.searchComponent.binddisplayimagesrc = this.binddisplayimagesrc;
        this.searchComponent.displayimagesrc = this.binddisplayimagesrc ? this.binddisplayimagesrc : this.displayimagesrc;
        this.searchComponent.displaylabel = this.binddisplaylabel ? this.binddisplaylabel : this.displaylabel;
        this.searchComponent.datafield = this.datafield;
        this.searchComponent.binddataset = this.binddataset;
        this.searchComponent.dataset = this.dataset;
        this.searchComponent.searchkey = this.searchkey;
        this.searchComponent.datasource = this.datasource;
        this.searchComponent.matchmode = this.matchmode;
    }
    goBack($event) {
        /**
         * TODO: while trying navigating from details page to edit page in wavereads, app is navigating
         * as details -> editPage -> details. For now, keeping this callback to react after 1 second.
         */
        this.deviceService.executeBackTapListeners($event);
    }
    ngOnDestroy() {
        this._backBtnListenerDestroyer();
        super.ngOnDestroy();
    }
    onPropertyChange(key, nv, ov) {
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
            super.onPropertyChange(key, nv, ov);
        }
    }
    onSubmission($event) {
        this.invokeEventCallback('search', { $event });
    }
    // switches the view based on defaultview
    switchView(view) {
        this.showSearchbar = (view !== 'actionview');
    }
    // goto previous view or page
    goBacktoPreviousView($event) {
        if (this.defaultview === 'actionview') {
            // switches the view from search to action or action to search.
            this.switchView('actionview');
        }
        else {
            // goes back to the previous visited page.
            this.goBack($event);
        }
    }
    onSelect($event, widget, selectedValue) {
        this.datavalue = selectedValue;
        this.query = widget.query;
        this.invokeEventCallback('change', {
            $event,
            newVal: selectedValue,
            oldVal: widget.prevDatavalue
        });
    }
    onClear() {
        this.datavalue = '';
        this.query = '';
    }
}
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
MobileNavbarComponent.ctorParameters = () => [
    { type: App },
    { type: PageDirective },
    { type: DeviceService },
    { type: AbstractNavigationService },
    { type: Injector },
    { type: undefined, decorators: [{ type: Attribute, args: ['backbtnclick.event',] }] }
];
MobileNavbarComponent.propDecorators = {
    searchComponent: [{ type: ViewChild, args: [SearchComponent,] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9iaWxlLW5hdmJhci5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vbW9iaWxlL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL21vYmlsZS1uYXZiYXIvbW9iaWxlLW5hdmJhci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFpQixTQUFTLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBYSxTQUFTLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFcEcsT0FBTyxFQUFFLHlCQUF5QixFQUFFLEdBQUcsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUMxRCxPQUFPLEVBQUUsYUFBYSxFQUFFLFdBQVcsRUFBcUMsYUFBYSxFQUFFLGtCQUFrQixFQUFFLGVBQWUsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQ25KLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUVoRCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFFdEQsTUFBTSxXQUFXLEdBQUcscUNBQXFDLENBQUM7QUFDMUQsTUFBTSxhQUFhLEdBQWtCLEVBQUMsVUFBVSxFQUFFLGtCQUFrQixFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUMsQ0FBQztBQVM5RixNQUFNLE9BQU8scUJBQXNCLFNBQVEsYUFBYTtJQXFDcEQsWUFDSSxHQUFRLEVBQ0EsSUFBbUIsRUFDbkIsYUFBNEIsRUFDNUIsaUJBQTRDLEVBQ3BELEdBQWEsRUFDNEIsZUFBZTtRQUV4RCxLQUFLLENBQUMsR0FBRyxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBTmxCLFNBQUksR0FBSixJQUFJLENBQWU7UUFDbkIsa0JBQWEsR0FBYixhQUFhLENBQWU7UUFDNUIsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUEyQjtRQUVYLG9CQUFlLEdBQWYsZUFBZSxDQUFBO1FBeENwRCxhQUFRLEdBQUcsS0FBSyxDQUFDO1FBMkNyQixJQUFJLENBQUMsU0FBUyxDQUFDLG1CQUFtQixFQUFFLENBQUMsWUFBZ0MsRUFBRSxFQUFFO1lBQ3JFLElBQUksSUFBSSxDQUFDLGNBQWMsRUFBRTtnQkFDckIsSUFBSSxDQUFDLFlBQVksR0FBRyxZQUFZLENBQUM7YUFDcEM7UUFDTCxDQUFDLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyx5QkFBeUIsR0FBRyxhQUFhLENBQUMsZUFBZSxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQ3BFLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRTtnQkFDZixJQUFJLElBQUksQ0FBQyxlQUFlLEVBQUU7b0JBQ3RCLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxjQUFjLEVBQUUsRUFBQyxNQUFNLEVBQUMsQ0FBQyxDQUFDO29CQUNuRCxPQUFPLEtBQUssQ0FBQztpQkFDaEI7YUFDSjtRQUNMLENBQUMsQ0FBQyxDQUFDO1FBQ0gsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ2pELENBQUM7SUFqQ0Qsb0VBQW9FO0lBQ3BFLElBQUksVUFBVTtRQUNWLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQztJQUM1QixDQUFDO0lBRUQsSUFBSSxVQUFVLENBQUMsRUFBRTtRQUNiLElBQUksQ0FBQyxXQUFXLEdBQUcsRUFBRSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxlQUFlLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQztJQUN6QyxDQUFDO0lBMkJELGVBQWU7UUFDWCxJQUFJLENBQUMsZUFBZSxDQUFDLG1CQUFtQixHQUFHLElBQUksQ0FBQyxtQkFBbUIsQ0FBQztRQUNwRSxJQUFJLENBQUMsZUFBZSxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQztRQUNsSCxJQUFJLENBQUMsZUFBZSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQztRQUN0RyxJQUFJLENBQUMsZUFBZSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQ2hELElBQUksQ0FBQyxlQUFlLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxXQUFXLENBQUM7UUFDcEQsSUFBSSxDQUFDLGVBQWUsQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztRQUM1QyxJQUFJLENBQUMsZUFBZSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQ2hELElBQUksQ0FBQyxlQUFlLENBQUMsVUFBVSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7UUFDbEQsSUFBSSxDQUFDLGVBQWUsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztJQUNwRCxDQUFDO0lBR00sTUFBTSxDQUFDLE1BQU07UUFDZjs7O1dBR0c7UUFDSCxJQUFJLENBQUMsYUFBYSxDQUFDLHVCQUF1QixDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3hELENBQUM7SUFFTSxXQUFXO1FBQ2QsSUFBSSxDQUFDLHlCQUF5QixFQUFFLENBQUM7UUFDakMsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ3hCLENBQUM7SUFFTSxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUc7UUFDaEMsSUFBSSxJQUFJLENBQUMsZUFBZSxFQUFFO1lBQ3RCLElBQUksR0FBRyxLQUFLLFdBQVcsRUFBRTtnQkFDckIsSUFBSSxDQUFDLGVBQWUsQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQzthQUNuRDtZQUNELElBQUksR0FBRyxLQUFLLGNBQWMsRUFBRTtnQkFDeEIsSUFBSSxDQUFDLGVBQWUsQ0FBQyxZQUFZLEdBQUcsSUFBSSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUM7YUFDekc7U0FDSjtRQUVELElBQUksR0FBRyxLQUFLLFFBQVEsRUFBRTtZQUNsQixJQUFJLENBQUMsUUFBUSxHQUFHLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQztTQUNuQzthQUFNLElBQUksR0FBRyxLQUFLLFNBQVMsRUFBRTtZQUMxQixxQkFBcUI7U0FDeEI7YUFBTSxJQUFJLEdBQUcsS0FBSyxhQUFhLEVBQUU7WUFDOUIsSUFBSSxDQUFDLGFBQWEsR0FBRyxDQUFDLEVBQUUsS0FBSyxZQUFZLENBQUMsQ0FBQztTQUM5QzthQUFNLElBQUksR0FBRyxLQUFLLFdBQVcsRUFBRTtZQUM1QixJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztTQUNuQjthQUFNO1lBQ0gsS0FBSyxDQUFDLGdCQUFnQixDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7U0FDdkM7SUFDTCxDQUFDO0lBRU0sWUFBWSxDQUFDLE1BQU07UUFDdEIsSUFBSSxDQUFDLG1CQUFtQixDQUFDLFFBQVEsRUFBRSxFQUFDLE1BQU0sRUFBQyxDQUFDLENBQUM7SUFDakQsQ0FBQztJQUVELHlDQUF5QztJQUNqQyxVQUFVLENBQUMsSUFBSTtRQUNuQixJQUFJLENBQUMsYUFBYSxHQUFHLENBQUMsSUFBSSxLQUFLLFlBQVksQ0FBQyxDQUFDO0lBQ2pELENBQUM7SUFFRCw2QkFBNkI7SUFDdEIsb0JBQW9CLENBQUMsTUFBTTtRQUM5QixJQUFJLElBQUksQ0FBQyxXQUFXLEtBQUssWUFBWSxFQUFFO1lBQ25DLCtEQUErRDtZQUMvRCxJQUFJLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxDQUFDO1NBQ2pDO2FBQU07WUFDSCwwQ0FBMEM7WUFDMUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztTQUN2QjtJQUNMLENBQUM7SUFFTyxRQUFRLENBQUMsTUFBTSxFQUFFLE1BQU0sRUFBRSxhQUFhO1FBQzFDLElBQUksQ0FBQyxTQUFTLEdBQUcsYUFBYSxDQUFDO1FBQy9CLElBQUksQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQztRQUMxQixJQUFJLENBQUMsbUJBQW1CLENBQUMsUUFBUSxFQUFFO1lBQy9CLE1BQU07WUFDTixNQUFNLEVBQUUsYUFBYTtZQUNyQixNQUFNLEVBQUUsTUFBTSxDQUFDLGFBQWE7U0FDL0IsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVPLE9BQU87UUFDWCxJQUFJLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztRQUNwQixJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztJQUNwQixDQUFDOztBQS9JTSxxQ0FBZSxHQUFHLGFBQWEsRUFBRSxDQUFDOztZQVI1QyxTQUFTLFNBQUM7Z0JBQ1AsUUFBUSxFQUFFLHdCQUF3QjtnQkFDbEMscytGQUE2QztnQkFDN0MsU0FBUyxFQUFFO29CQUNQLGtCQUFrQixDQUFDLHFCQUFxQixDQUFDO2lCQUM1QzthQUNKOzs7O1lBZm1DLEdBQUc7WUFDaUMsYUFBYTtZQUM1RSxhQUFhO1lBRmIseUJBQXlCO1lBRlksUUFBUTs0Q0E2RDdDLFNBQVMsU0FBQyxvQkFBb0I7Ozs4QkE3QmxDLFNBQVMsU0FBQyxlQUFlIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQWZ0ZXJWaWV3SW5pdCwgQXR0cmlidXRlLCBDb21wb25lbnQsIEluamVjdG9yLCBPbkRlc3Ryb3ksIFZpZXdDaGlsZCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBBYnN0cmFjdE5hdmlnYXRpb25TZXJ2aWNlLCBBcHAgfSBmcm9tICdAd20vY29yZSc7XG5pbXBvcnQgeyBCYXNlQ29tcG9uZW50LCBnZXRJbWFnZVVybCwgSVdpZGdldENvbmZpZywgTGVmdFBhbmVsRGlyZWN0aXZlLCBQYWdlRGlyZWN0aXZlLCBwcm92aWRlQXNXaWRnZXRSZWYsIFNlYXJjaENvbXBvbmVudCB9IGZyb20gJ0B3bS9jb21wb25lbnRzJztcbmltcG9ydCB7IERldmljZVNlcnZpY2UgfSBmcm9tICdAd20vbW9iaWxlL2NvcmUnO1xuXG5pbXBvcnQgeyByZWdpc3RlclByb3BzIH0gZnJvbSAnLi9tb2JpbGUtbmF2YmFyLnByb3BzJztcblxuY29uc3QgREVGQVVMVF9DTFMgPSAnYXBwLW1vYmlsZS1oZWFkZXIgYXBwLW1vYmlsZS1uYXZiYXInO1xuY29uc3QgV0lER0VUX0NPTkZJRzogSVdpZGdldENvbmZpZyA9IHt3aWRnZXRUeXBlOiAnd20tbW9iaWxlLW5hdmJhcicsIGhvc3RDbGFzczogREVGQVVMVF9DTFN9O1xuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ2hlYWRlclt3bU1vYmlsZU5hdmJhcl0nLFxuICAgIHRlbXBsYXRlVXJsOiAnLi9tb2JpbGUtbmF2YmFyLmNvbXBvbmVudC5odG1sJyxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgcHJvdmlkZUFzV2lkZ2V0UmVmKE1vYmlsZU5hdmJhckNvbXBvbmVudClcbiAgICBdXG59KVxuZXhwb3J0IGNsYXNzIE1vYmlsZU5hdmJhckNvbXBvbmVudCBleHRlbmRzIEJhc2VDb21wb25lbnQgaW1wbGVtZW50cyBPbkRlc3Ryb3ksIEFmdGVyVmlld0luaXQge1xuICAgIHN0YXRpYyBpbml0aWFsaXplUHJvcHMgPSByZWdpc3RlclByb3BzKCk7XG5cbiAgICBwcml2YXRlIF9pc1JlYWR5ID0gZmFsc2U7XG4gICAgcHVibGljIGRhdGF2YWx1ZTogc3RyaW5nO1xuICAgIHB1YmxpYyBpbWFnZXNyYzogc3RyaW5nO1xuICAgIHB1YmxpYyBxdWVyeTogc3RyaW5nO1xuICAgIHB1YmxpYyBsZWZ0TmF2UGFuZWw6IExlZnRQYW5lbERpcmVjdGl2ZTtcbiAgICBwdWJsaWMgc2hvd0xlZnRuYXZidG46IGJvb2xlYW47XG4gICAgcHVibGljIHNob3dTZWFyY2hiYXI6IGJvb2xlYW47XG4gICAgcHVibGljIGJhY2tidXR0b25pY29uY2xhc3M6IGFueTtcblxuICAgIHByaXZhdGUgX2JhY2tCdG5MaXN0ZW5lckRlc3Ryb3llcjtcblxuICAgIEBWaWV3Q2hpbGQoU2VhcmNoQ29tcG9uZW50KSBzZWFyY2hDb21wb25lbnQ6IFNlYXJjaENvbXBvbmVudDtcbiAgICBwcml2YXRlIHNlYXJjaGtleTogc3RyaW5nO1xuICAgIHByaXZhdGUgZGF0YXNldDogYW55O1xuICAgIHByaXZhdGUgYmluZGRhdGFzZXQ6IGFueTtcbiAgICBwcml2YXRlIGRhdGFmaWVsZDogc3RyaW5nO1xuICAgIHByaXZhdGUgYmluZGRpc3BsYXlsYWJlbDogc3RyaW5nO1xuICAgIHByaXZhdGUgZGlzcGxheWxhYmVsOiBzdHJpbmc7XG4gICAgcHJpdmF0ZSBiaW5kZGlzcGxheWltYWdlc3JjOiBzdHJpbmc7XG4gICAgcHJpdmF0ZSBkaXNwbGF5aW1hZ2VzcmM6IHN0cmluZztcbiAgICBwcml2YXRlIF9kYXRhc291cmNlOiBhbnk7XG4gICAgcHJpdmF0ZSBkZWZhdWx0dmlldzogc3RyaW5nO1xuICAgIHByaXZhdGUgbWF0Y2htb2RlOiBzdHJpbmc7XG5cbiAgICAvLyBnZXR0ZXIgc2V0dGVyIGlzIGFkZGVkIHRvIHBhc3MgdGhlIGRhdGFzb3VyY2UgdG8gc2VhcmNoY29tcG9uZW50LlxuICAgIGdldCBkYXRhc291cmNlICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2RhdGFzb3VyY2U7XG4gICAgfVxuXG4gICAgc2V0IGRhdGFzb3VyY2UobnYpIHtcbiAgICAgICAgdGhpcy5fZGF0YXNvdXJjZSA9IG52O1xuICAgICAgICB0aGlzLnNlYXJjaENvbXBvbmVudC5kYXRhc291cmNlID0gbnY7XG4gICAgfVxuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIGFwcDogQXBwLFxuICAgICAgICBwcml2YXRlIHBhZ2U6IFBhZ2VEaXJlY3RpdmUsXG4gICAgICAgIHByaXZhdGUgZGV2aWNlU2VydmljZTogRGV2aWNlU2VydmljZSxcbiAgICAgICAgcHJpdmF0ZSBuYXZpZ2F0aW9uU2VydmljZTogQWJzdHJhY3ROYXZpZ2F0aW9uU2VydmljZSxcbiAgICAgICAgaW5qOiBJbmplY3RvcixcbiAgICAgICAgQEF0dHJpYnV0ZSgnYmFja2J0bmNsaWNrLmV2ZW50JykgcHJpdmF0ZSBiYWNrYnRuQ2xpY2tFdnRcbiAgICApIHtcbiAgICAgICAgc3VwZXIoaW5qLCBXSURHRVRfQ09ORklHKTtcbiAgICAgICAgcGFnZS5zdWJzY3JpYmUoJ3dtTGVmdFBhbmVsOnJlYWR5JywgKGxlZnROYXZQYW5lbDogTGVmdFBhbmVsRGlyZWN0aXZlKSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5zaG93TGVmdG5hdmJ0bikge1xuICAgICAgICAgICAgICAgIHRoaXMubGVmdE5hdlBhbmVsID0gbGVmdE5hdlBhbmVsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5fYmFja0J0bkxpc3RlbmVyRGVzdHJveWVyID0gZGV2aWNlU2VydmljZS5vbkJhY2tCdXR0b25UYXAoJGV2ZW50ID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9pc1JlYWR5KSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuYmFja2J0bkNsaWNrRXZ0KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW52b2tlRXZlbnRDYWxsYmFjaygnYmFja2J0bmNsaWNrJywgeyRldmVudH0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB0aGlzLl9pc1JlYWR5ID0gdHJ1ZSwgMTAwMCk7XG4gICAgfVxuXG4gICAgbmdBZnRlclZpZXdJbml0KCkge1xuICAgICAgICB0aGlzLnNlYXJjaENvbXBvbmVudC5iaW5kZGlzcGxheWltYWdlc3JjID0gdGhpcy5iaW5kZGlzcGxheWltYWdlc3JjO1xuICAgICAgICB0aGlzLnNlYXJjaENvbXBvbmVudC5kaXNwbGF5aW1hZ2VzcmMgPSB0aGlzLmJpbmRkaXNwbGF5aW1hZ2VzcmMgPyB0aGlzLmJpbmRkaXNwbGF5aW1hZ2VzcmMgOiB0aGlzLmRpc3BsYXlpbWFnZXNyYztcbiAgICAgICAgdGhpcy5zZWFyY2hDb21wb25lbnQuZGlzcGxheWxhYmVsID0gdGhpcy5iaW5kZGlzcGxheWxhYmVsID8gdGhpcy5iaW5kZGlzcGxheWxhYmVsIDogdGhpcy5kaXNwbGF5bGFiZWw7XG4gICAgICAgIHRoaXMuc2VhcmNoQ29tcG9uZW50LmRhdGFmaWVsZCA9IHRoaXMuZGF0YWZpZWxkO1xuICAgICAgICB0aGlzLnNlYXJjaENvbXBvbmVudC5iaW5kZGF0YXNldCA9IHRoaXMuYmluZGRhdGFzZXQ7XG4gICAgICAgIHRoaXMuc2VhcmNoQ29tcG9uZW50LmRhdGFzZXQgPSB0aGlzLmRhdGFzZXQ7XG4gICAgICAgIHRoaXMuc2VhcmNoQ29tcG9uZW50LnNlYXJjaGtleSA9IHRoaXMuc2VhcmNoa2V5O1xuICAgICAgICB0aGlzLnNlYXJjaENvbXBvbmVudC5kYXRhc291cmNlID0gdGhpcy5kYXRhc291cmNlO1xuICAgICAgICB0aGlzLnNlYXJjaENvbXBvbmVudC5tYXRjaG1vZGUgPSB0aGlzLm1hdGNobW9kZTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBnb0JhY2soJGV2ZW50KTogdm9pZCB7XG4gICAgICAgICAvKipcbiAgICAgICAgICAqIFRPRE86IHdoaWxlIHRyeWluZyBuYXZpZ2F0aW5nIGZyb20gZGV0YWlscyBwYWdlIHRvIGVkaXQgcGFnZSBpbiB3YXZlcmVhZHMsIGFwcCBpcyBuYXZpZ2F0aW5nXG4gICAgICAgICAgKiBhcyBkZXRhaWxzIC0+IGVkaXRQYWdlIC0+IGRldGFpbHMuIEZvciBub3csIGtlZXBpbmcgdGhpcyBjYWxsYmFjayB0byByZWFjdCBhZnRlciAxIHNlY29uZC5cbiAgICAgICAgICAqL1xuICAgICAgICAgdGhpcy5kZXZpY2VTZXJ2aWNlLmV4ZWN1dGVCYWNrVGFwTGlzdGVuZXJzKCRldmVudCk7XG4gICAgfVxuXG4gICAgcHVibGljIG5nT25EZXN0cm95KCkge1xuICAgICAgICB0aGlzLl9iYWNrQnRuTGlzdGVuZXJEZXN0cm95ZXIoKTtcbiAgICAgICAgc3VwZXIubmdPbkRlc3Ryb3koKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgb25Qcm9wZXJ0eUNoYW5nZShrZXksIG52LCBvdj8pIHtcbiAgICAgICAgaWYgKHRoaXMuc2VhcmNoQ29tcG9uZW50KSB7XG4gICAgICAgICAgICBpZiAoa2V5ID09PSAnZGF0YWZpZWxkJykge1xuICAgICAgICAgICAgICAgIHRoaXMuc2VhcmNoQ29tcG9uZW50LmRhdGFmaWVsZCA9IHRoaXMuZGF0YWZpZWxkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGtleSA9PT0gJ2Rpc3BsYXlsYWJlbCcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNlYXJjaENvbXBvbmVudC5kaXNwbGF5bGFiZWwgPSB0aGlzLmJpbmRkaXNwbGF5bGFiZWwgPyB0aGlzLmJpbmRkaXNwbGF5bGFiZWwgOiB0aGlzLmRpc3BsYXlsYWJlbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChrZXkgPT09ICdpbWdzcmMnKSB7XG4gICAgICAgICAgICB0aGlzLmltYWdlc3JjID0gZ2V0SW1hZ2VVcmwobnYpO1xuICAgICAgICB9IGVsc2UgaWYgKGtleSA9PT0gJ2RhdGFzZXQnKSB7XG4gICAgICAgICAgICAvLyAkaXMuX2RhdGFzZXQgPSBudjtcbiAgICAgICAgfSBlbHNlIGlmIChrZXkgPT09ICdkZWZhdWx0dmlldycpIHtcbiAgICAgICAgICAgIHRoaXMuc2hvd1NlYXJjaGJhciA9IChudiA9PT0gJ3NlYXJjaHZpZXcnKTtcbiAgICAgICAgfSBlbHNlIGlmIChrZXkgPT09ICdkYXRhdmFsdWUnKSB7XG4gICAgICAgICAgICB0aGlzLnF1ZXJ5ID0gbnY7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdXBlci5vblByb3BlcnR5Q2hhbmdlKGtleSwgbnYsIG92KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBvblN1Ym1pc3Npb24oJGV2ZW50KTogdm9pZCB7XG4gICAgICAgIHRoaXMuaW52b2tlRXZlbnRDYWxsYmFjaygnc2VhcmNoJywgeyRldmVudH0pO1xuICAgIH1cblxuICAgIC8vIHN3aXRjaGVzIHRoZSB2aWV3IGJhc2VkIG9uIGRlZmF1bHR2aWV3XG4gICAgcHJpdmF0ZSBzd2l0Y2hWaWV3KHZpZXcpIHtcbiAgICAgICAgdGhpcy5zaG93U2VhcmNoYmFyID0gKHZpZXcgIT09ICdhY3Rpb252aWV3Jyk7XG4gICAgfVxuXG4gICAgLy8gZ290byBwcmV2aW91cyB2aWV3IG9yIHBhZ2VcbiAgICBwdWJsaWMgZ29CYWNrdG9QcmV2aW91c1ZpZXcoJGV2ZW50KSB7XG4gICAgICAgIGlmICh0aGlzLmRlZmF1bHR2aWV3ID09PSAnYWN0aW9udmlldycpIHtcbiAgICAgICAgICAgIC8vIHN3aXRjaGVzIHRoZSB2aWV3IGZyb20gc2VhcmNoIHRvIGFjdGlvbiBvciBhY3Rpb24gdG8gc2VhcmNoLlxuICAgICAgICAgICAgdGhpcy5zd2l0Y2hWaWV3KCdhY3Rpb252aWV3Jyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBnb2VzIGJhY2sgdG8gdGhlIHByZXZpb3VzIHZpc2l0ZWQgcGFnZS5cbiAgICAgICAgICAgIHRoaXMuZ29CYWNrKCRldmVudCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIG9uU2VsZWN0KCRldmVudCwgd2lkZ2V0LCBzZWxlY3RlZFZhbHVlKSB7XG4gICAgICAgIHRoaXMuZGF0YXZhbHVlID0gc2VsZWN0ZWRWYWx1ZTtcbiAgICAgICAgdGhpcy5xdWVyeSA9IHdpZGdldC5xdWVyeTtcbiAgICAgICAgdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdjaGFuZ2UnLCB7XG4gICAgICAgICAgICAkZXZlbnQsXG4gICAgICAgICAgICBuZXdWYWw6IHNlbGVjdGVkVmFsdWUsXG4gICAgICAgICAgICBvbGRWYWw6IHdpZGdldC5wcmV2RGF0YXZhbHVlXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgb25DbGVhcigpIHtcbiAgICAgICAgdGhpcy5kYXRhdmFsdWUgPSAnJztcbiAgICAgICAgdGhpcy5xdWVyeSA9ICcnO1xuICAgIH1cbn1cbiJdfQ==