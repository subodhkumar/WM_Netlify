import { Attribute, Component, Injector } from '@angular/core';
import { getEvaluatedData, PageDirective, provideAsWidgetRef, StylableComponent, styler } from '@wm/components';
import { registerProps } from './tabbar.props';
const DEFAULT_CLS = 'app-tabbar app-top-nav';
const WIDGET_CONFIG = { widgetType: 'wm-mobile-tabbar', hostClass: DEFAULT_CLS };
export class MobileTabbarComponent extends StylableComponent {
    constructor(page, inj, binditemlabel, binditemicon, binditemlink) {
        super(inj, WIDGET_CONFIG);
        this.page = page;
        this.binditemlabel = binditemlabel;
        this.binditemicon = binditemicon;
        this.binditemlink = binditemlink;
        this.tabItems = [];
        this.layout = {};
        this._layouts = [
            { minwidth: 2048, max: 12 },
            { minwidth: 1024, max: 10 },
            { minwidth: 768, max: 7 },
            { minwidth: 480, max: 5 },
            { minwidth: 0, max: 4 }
        ];
        styler(this.nativeElement, this);
        page.notify('wmMobileTabbar:ready', this);
    }
    onPropertyChange(key, nv, ov) {
        if (key === 'dataset') {
            if (nv) {
                this.tabItems = this.getTabItems(nv);
            }
        }
        else {
            super.onPropertyChange(key, nv, ov);
        }
    }
    ngAfterViewInit() {
        setTimeout(() => {
            this.layout = this.getSuitableLayout();
            $(window).on('resize.tabbar', _.debounce(() => this.layout = this.getSuitableLayout(), 20));
        });
        super.ngAfterViewInit();
    }
    ngOnDestroy() {
        $(window).off('.tabbar');
        super.ngOnDestroy();
    }
    // triggered on item selection
    onItemSelect($event, selectedItem) {
        this.invokeEventCallback('select', { $event, $item: selectedItem.value || selectedItem.label });
    }
    getItems(itemArray) {
        return itemArray.map(item => ({
            label: item,
            icon: 'wi wi-' + item
        }));
    }
    getSuitableLayout() {
        const avaiableWidth = $(this.nativeElement).parent().width();
        return this._layouts.find(l => avaiableWidth >= l.minwidth);
    }
    getTabItems(value) {
        if (_.isArray(value)) {
            if (_.isObject(value[0])) {
                return value.map(item => {
                    const link = getEvaluatedData(item, { expression: 'itemlink', 'bindExpression': this.binditemlink }, this.viewParent) || item.link;
                    const activePageName = window.location.hash.substr(2);
                    return {
                        label: getEvaluatedData(item, { expression: 'itemlabel', bindExpression: this.binditemlabel }, this.viewParent) || item.label,
                        icon: getEvaluatedData(item, { expression: 'itemicon', bindExpression: this.binditemicon }, this.viewParent) || item.icon,
                        link: link,
                        active: _.includes([activePageName, '#' + activePageName, '#/' + activePageName], link)
                    };
                });
            }
            else {
                return this.getItems(value);
            }
        }
        else if (_.isString(value)) {
            return this.getItems(value.split(','));
        }
    }
}
MobileTabbarComponent.initializeProps = registerProps();
MobileTabbarComponent.decorators = [
    { type: Component, args: [{
                selector: 'div[wmMobileTabbar]',
                template: "<nav class=\"navbar navbar-default\">\n    <ul class=\"tab-items nav navbar-nav\">\n        <li class=\"tab-item\" *ngFor=\"let item of tabItems; index as i\" [class.hidden]=\"!(tabItems.length === layout.max || i < layout.max)\" >\n            <a [class.active]=\"item.active\" [href]=\"(item.link || 'javascript:void(0)')| trustAs: 'resource'\" (click)=\"onItemSelect($event, item)\">\n                <i class=\"app-icon\" [ngClass]=\"item.icon\"></i><label>{{item.label}}</label>\n            </a>\n        </li>\n        <li class=\"menu-items dropdown\" [class.hidden]=\"tabItems.length <= layout.max\" [ngClass]=\"{dropup : position === bottom}\">\n            <a (click)=\"showMoreMenu = !showMoreMenu\" href=\"javascript:void(0)\">\n                <i class=\"app-icon {{morebuttoniconclass}}\"></i><label>{{morebuttonlabel}}</label>\n            </a>\n            <ul class=\"dropdown-menu dropdown-menu-right\" [ngClass]=\"{'nav navbar-nav' : menutype === thumbnail}\" *ngIf=\"showMoreMenu\">\n                <li role=\"menuitem\" class=\"menu-item\" *ngFor=\"let item of tabItems;index as i\" [class.hidden]=\"i < layout.max\">\n                    <a [ngClass]=\"{active : item.active}\" [href]=\"(item.link || 'javascript:void(0)')| trustAs: 'resource'\" (click)=\"onItemSelect($event, item)\" class=\"dropdown-item\">\n                        <i class=\"app-icon\" [ngClass]=\"item.icon\"></i><label>{{item.label}}</label>\n                    </a>\n                </li>\n            </ul>\n        </li>\n    </ul>\n</nav>\n",
                providers: [
                    provideAsWidgetRef(MobileTabbarComponent)
                ]
            }] }
];
/** @nocollapse */
MobileTabbarComponent.ctorParameters = () => [
    { type: PageDirective },
    { type: Injector },
    { type: undefined, decorators: [{ type: Attribute, args: ['itemlabel.bind',] }] },
    { type: undefined, decorators: [{ type: Attribute, args: ['itemicon.bind',] }] },
    { type: undefined, decorators: [{ type: Attribute, args: ['itemicon.bind',] }] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFiYmFyLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9tb2JpbGUvY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvdGFiYmFyL3RhYmJhci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFpQixTQUFTLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBYSxNQUFNLGVBQWUsQ0FBQztBQUV6RixPQUFPLEVBQUUsZ0JBQWdCLEVBQWlCLGFBQWEsRUFBRSxrQkFBa0IsRUFBRSxpQkFBaUIsRUFBRSxNQUFNLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUUvSCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFJL0MsTUFBTSxXQUFXLEdBQUcsd0JBQXdCLENBQUM7QUFDN0MsTUFBTSxhQUFhLEdBQWtCLEVBQUMsVUFBVSxFQUFFLGtCQUFrQixFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUMsQ0FBQztBQWdCOUYsTUFBTSxPQUFPLHFCQUFzQixTQUFRLGlCQUFpQjtJQW1CeEQsWUFDWSxJQUFtQixFQUMzQixHQUFhLEVBQ3VCLGFBQWEsRUFDZCxZQUFZLEVBQ1osWUFBWTtRQUUvQyxLQUFLLENBQUMsR0FBRyxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBTmxCLFNBQUksR0FBSixJQUFJLENBQWU7UUFFUyxrQkFBYSxHQUFiLGFBQWEsQ0FBQTtRQUNkLGlCQUFZLEdBQVosWUFBWSxDQUFBO1FBQ1osaUJBQVksR0FBWixZQUFZLENBQUE7UUFyQjVDLGFBQVEsR0FBRyxFQUFFLENBQUM7UUFDZCxXQUFNLEdBQVEsRUFBRSxDQUFDO1FBT1AsYUFBUSxHQUFHO1lBQ3hCLEVBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFDO1lBQ3pCLEVBQUMsUUFBUSxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsRUFBRSxFQUFDO1lBQ3pCLEVBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFDO1lBQ3ZCLEVBQUMsUUFBUSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFDO1lBQ3ZCLEVBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFDO1NBQ3hCLENBQUM7UUFVRSxNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsQ0FBQztRQUNqQyxJQUFJLENBQUMsTUFBTSxDQUFDLHNCQUFzQixFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzlDLENBQUM7SUFFTSxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUc7UUFDaEMsSUFBSSxHQUFHLEtBQUssU0FBUyxFQUFFO1lBQ25CLElBQUksRUFBRSxFQUFFO2dCQUNKLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQyxFQUFFLENBQUMsQ0FBQzthQUN4QztTQUNKO2FBQU07WUFDSCxLQUFLLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztTQUN2QztJQUNMLENBQUM7SUFFTSxlQUFlO1FBQ2xCLFVBQVUsQ0FBQyxHQUFHLEVBQUU7WUFDWixJQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1lBQ3ZDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2hHLENBQUMsQ0FBQyxDQUFDO1FBQ0gsS0FBSyxDQUFDLGVBQWUsRUFBRSxDQUFDO0lBQzVCLENBQUM7SUFFTSxXQUFXO1FBQ2QsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUN6QixLQUFLLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDeEIsQ0FBQztJQUVELDhCQUE4QjtJQUN2QixZQUFZLENBQUMsTUFBTSxFQUFFLFlBQXFCO1FBQzdDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLEVBQUUsRUFBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLFlBQVksQ0FBQyxLQUFLLElBQUksWUFBWSxDQUFDLEtBQUssRUFBQyxDQUFDLENBQUM7SUFDbEcsQ0FBQztJQUVPLFFBQVEsQ0FBQyxTQUFnQjtRQUM3QixPQUFPLFNBQVMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQzFCLEtBQUssRUFBRSxJQUFJO1lBQ1gsSUFBSSxFQUFFLFFBQVEsR0FBRyxJQUFJO1NBQ3hCLENBQUMsQ0FBQyxDQUFDO0lBQ1IsQ0FBQztJQUVPLGlCQUFpQjtRQUNyQixNQUFNLGFBQWEsR0FBVyxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3JFLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxhQUFhLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ2hFLENBQUM7SUFFTyxXQUFXLENBQUMsS0FBVTtRQUMxQixJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUU7WUFDbEIsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFO2dCQUN0QixPQUFRLEtBQWUsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUU7b0JBQy9CLE1BQU0sSUFBSSxHQUFHLGdCQUFnQixDQUFDLElBQUksRUFBRSxFQUFDLFVBQVUsRUFBRSxVQUFVLEVBQUUsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLFlBQVksRUFBQyxFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDO29CQUNqSSxNQUFNLGNBQWMsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3RELE9BQU87d0JBQ0gsS0FBSyxFQUFFLGdCQUFnQixDQUFDLElBQUksRUFBRSxFQUFDLFVBQVUsRUFBRSxXQUFXLEVBQUUsY0FBYyxFQUFFLElBQUksQ0FBQyxhQUFhLEVBQUMsRUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksSUFBSSxDQUFDLEtBQUs7d0JBQzNILElBQUksRUFBRSxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsRUFBQyxVQUFVLEVBQUUsVUFBVSxFQUFFLGNBQWMsRUFBRSxJQUFJLENBQUMsWUFBWSxFQUFDLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLElBQUksQ0FBQyxJQUFJO3dCQUN2SCxJQUFJLEVBQUUsSUFBSTt3QkFDVixNQUFNLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLGNBQWMsRUFBRSxHQUFHLEdBQUcsY0FBYyxFQUFFLElBQUksR0FBRyxjQUFjLENBQUMsRUFBRSxJQUFJLENBQUM7cUJBQzFGLENBQUM7Z0JBQ04sQ0FBQyxDQUFDLENBQUM7YUFDTjtpQkFBTTtnQkFDSCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBYyxDQUFDLENBQUM7YUFDeEM7U0FDSjthQUFNLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUMxQixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUUsS0FBZ0IsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztTQUN0RDtJQUNMLENBQUM7O0FBekZNLHFDQUFlLEdBQUcsYUFBYSxFQUFFLENBQUM7O1lBUjVDLFNBQVMsU0FBQztnQkFDUCxRQUFRLEVBQUUscUJBQXFCO2dCQUMvQixraERBQXNDO2dCQUN0QyxTQUFTLEVBQUU7b0JBQ1Asa0JBQWtCLENBQUMscUJBQXFCLENBQUM7aUJBQzVDO2FBQ0o7Ozs7WUF0QnlDLGFBQWE7WUFGVCxRQUFROzRDQStDN0MsU0FBUyxTQUFDLGdCQUFnQjs0Q0FDMUIsU0FBUyxTQUFDLGVBQWU7NENBQ3pCLFNBQVMsU0FBQyxlQUFlIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQWZ0ZXJWaWV3SW5pdCwgQXR0cmlidXRlLCBDb21wb25lbnQsIEluamVjdG9yLCBPbkRlc3Ryb3kgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgZ2V0RXZhbHVhdGVkRGF0YSwgSVdpZGdldENvbmZpZywgUGFnZURpcmVjdGl2ZSwgcHJvdmlkZUFzV2lkZ2V0UmVmLCBTdHlsYWJsZUNvbXBvbmVudCwgc3R5bGVyIH0gZnJvbSAnQHdtL2NvbXBvbmVudHMnO1xuXG5pbXBvcnQgeyByZWdpc3RlclByb3BzIH0gZnJvbSAnLi90YWJiYXIucHJvcHMnO1xuXG5kZWNsYXJlIGNvbnN0ICQ7XG5kZWNsYXJlIGNvbnN0IF87XG5jb25zdCBERUZBVUxUX0NMUyA9ICdhcHAtdGFiYmFyIGFwcC10b3AtbmF2JztcbmNvbnN0IFdJREdFVF9DT05GSUc6IElXaWRnZXRDb25maWcgPSB7d2lkZ2V0VHlwZTogJ3dtLW1vYmlsZS10YWJiYXInLCBob3N0Q2xhc3M6IERFRkFVTFRfQ0xTfTtcblxuaW50ZXJmYWNlIFRhYkl0ZW0ge1xuICAgIGljb246IHN0cmluZztcbiAgICBsYWJlbDogc3RyaW5nO1xuICAgIGxpbms/OiBzdHJpbmc7XG4gICAgdmFsdWU/OiBzdHJpbmc7XG59XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnZGl2W3dtTW9iaWxlVGFiYmFyXScsXG4gICAgdGVtcGxhdGVVcmw6ICcuL3RhYmJhci5jb21wb25lbnQuaHRtbCcsXG4gICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIHByb3ZpZGVBc1dpZGdldFJlZihNb2JpbGVUYWJiYXJDb21wb25lbnQpXG4gICAgXVxufSlcbmV4cG9ydCBjbGFzcyBNb2JpbGVUYWJiYXJDb21wb25lbnQgZXh0ZW5kcyBTdHlsYWJsZUNvbXBvbmVudCBpbXBsZW1lbnRzIEFmdGVyVmlld0luaXQsIE9uRGVzdHJveSB7XG4gICAgc3RhdGljIGluaXRpYWxpemVQcm9wcyA9IHJlZ2lzdGVyUHJvcHMoKTtcblxuICAgIHB1YmxpYyB0YWJJdGVtcyA9IFtdO1xuICAgIHB1YmxpYyBsYXlvdXQ6IGFueSA9IHt9O1xuICAgIHB1YmxpYyBwb3NpdGlvbjogYW55O1xuICAgIHB1YmxpYyBib3R0b206IGFueTtcbiAgICBwdWJsaWMgbW9yZWJ1dHRvbmljb25jbGFzczogYW55O1xuICAgIHB1YmxpYyBtb3JlYnV0dG9ubGFiZWw6IGFueTtcbiAgICBwdWJsaWMgc2hvd01vcmVNZW51OiBhbnk7XG5cbiAgICBwcml2YXRlIHJlYWRvbmx5IF9sYXlvdXRzID0gW1xuICAgICAgICB7bWlud2lkdGg6IDIwNDgsIG1heDogMTJ9LFxuICAgICAgICB7bWlud2lkdGg6IDEwMjQsIG1heDogMTB9LFxuICAgICAgICB7bWlud2lkdGg6IDc2OCwgbWF4OiA3fSxcbiAgICAgICAge21pbndpZHRoOiA0ODAsIG1heDogNX0sXG4gICAgICAgIHttaW53aWR0aDogMCwgbWF4OiA0fVxuICAgIF07XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgcHJpdmF0ZSBwYWdlOiBQYWdlRGlyZWN0aXZlLFxuICAgICAgICBpbmo6IEluamVjdG9yLFxuICAgICAgICBAQXR0cmlidXRlKCdpdGVtbGFiZWwuYmluZCcpIHB1YmxpYyBiaW5kaXRlbWxhYmVsLFxuICAgICAgICBAQXR0cmlidXRlKCdpdGVtaWNvbi5iaW5kJykgcHVibGljIGJpbmRpdGVtaWNvbixcbiAgICAgICAgQEF0dHJpYnV0ZSgnaXRlbWljb24uYmluZCcpIHB1YmxpYyBiaW5kaXRlbWxpbmtcbiAgICApIHtcbiAgICAgICAgc3VwZXIoaW5qLCBXSURHRVRfQ09ORklHKTtcbiAgICAgICAgc3R5bGVyKHRoaXMubmF0aXZlRWxlbWVudCwgdGhpcyk7XG4gICAgICAgIHBhZ2Uubm90aWZ5KCd3bU1vYmlsZVRhYmJhcjpyZWFkeScsIHRoaXMpO1xuICAgIH1cblxuICAgIHB1YmxpYyBvblByb3BlcnR5Q2hhbmdlKGtleSwgbnYsIG92Pykge1xuICAgICAgICBpZiAoa2V5ID09PSAnZGF0YXNldCcpIHtcbiAgICAgICAgICAgIGlmIChudikge1xuICAgICAgICAgICAgICAgIHRoaXMudGFiSXRlbXMgPSB0aGlzLmdldFRhYkl0ZW1zKG52KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN1cGVyLm9uUHJvcGVydHlDaGFuZ2Uoa2V5LCBudiwgb3YpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmxheW91dCA9IHRoaXMuZ2V0U3VpdGFibGVMYXlvdXQoKTtcbiAgICAgICAgICAgICQod2luZG93KS5vbigncmVzaXplLnRhYmJhcicsIF8uZGVib3VuY2UoKCkgPT4gdGhpcy5sYXlvdXQgPSB0aGlzLmdldFN1aXRhYmxlTGF5b3V0KCksIDIwKSk7XG4gICAgICAgIH0pO1xuICAgICAgICBzdXBlci5uZ0FmdGVyVmlld0luaXQoKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgbmdPbkRlc3Ryb3koKSB7XG4gICAgICAgICQod2luZG93KS5vZmYoJy50YWJiYXInKTtcbiAgICAgICAgc3VwZXIubmdPbkRlc3Ryb3koKTtcbiAgICB9XG5cbiAgICAvLyB0cmlnZ2VyZWQgb24gaXRlbSBzZWxlY3Rpb25cbiAgICBwdWJsaWMgb25JdGVtU2VsZWN0KCRldmVudCwgc2VsZWN0ZWRJdGVtOiBUYWJJdGVtKSB7XG4gICAgICAgIHRoaXMuaW52b2tlRXZlbnRDYWxsYmFjaygnc2VsZWN0JywgeyRldmVudCwgJGl0ZW06IHNlbGVjdGVkSXRlbS52YWx1ZSB8fCBzZWxlY3RlZEl0ZW0ubGFiZWx9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldEl0ZW1zKGl0ZW1BcnJheTogYW55W10pOiBUYWJJdGVtW10ge1xuICAgICAgICByZXR1cm4gaXRlbUFycmF5Lm1hcChpdGVtID0+ICh7XG4gICAgICAgICAgICBsYWJlbDogaXRlbSxcbiAgICAgICAgICAgIGljb246ICd3aSB3aS0nICsgaXRlbVxuICAgICAgICB9KSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRTdWl0YWJsZUxheW91dCgpIHtcbiAgICAgICAgY29uc3QgYXZhaWFibGVXaWR0aDogbnVtYmVyID0gJCh0aGlzLm5hdGl2ZUVsZW1lbnQpLnBhcmVudCgpLndpZHRoKCk7XG4gICAgICAgIHJldHVybiB0aGlzLl9sYXlvdXRzLmZpbmQobCA9PiBhdmFpYWJsZVdpZHRoID49IGwubWlud2lkdGgpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0VGFiSXRlbXModmFsdWU6IGFueSk6IFRhYkl0ZW1bXSB7XG4gICAgICAgIGlmIChfLmlzQXJyYXkodmFsdWUpKSB7XG4gICAgICAgICAgICBpZiAoXy5pc09iamVjdCh2YWx1ZVswXSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKHZhbHVlIGFzIGFueVtdKS5tYXAoaXRlbSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGxpbmsgPSBnZXRFdmFsdWF0ZWREYXRhKGl0ZW0sIHtleHByZXNzaW9uOiAnaXRlbWxpbmsnLCAnYmluZEV4cHJlc3Npb24nOiB0aGlzLmJpbmRpdGVtbGlua30sIHRoaXMudmlld1BhcmVudCkgfHwgaXRlbS5saW5rO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBhY3RpdmVQYWdlTmFtZSA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoLnN1YnN0cigyKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBnZXRFdmFsdWF0ZWREYXRhKGl0ZW0sIHtleHByZXNzaW9uOiAnaXRlbWxhYmVsJywgYmluZEV4cHJlc3Npb246IHRoaXMuYmluZGl0ZW1sYWJlbH0sIHRoaXMudmlld1BhcmVudCkgfHwgaXRlbS5sYWJlbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGljb246IGdldEV2YWx1YXRlZERhdGEoaXRlbSwge2V4cHJlc3Npb246ICdpdGVtaWNvbicsIGJpbmRFeHByZXNzaW9uOiB0aGlzLmJpbmRpdGVtaWNvbn0sIHRoaXMudmlld1BhcmVudCkgfHwgaXRlbS5pY29uLFxuICAgICAgICAgICAgICAgICAgICAgICAgbGluazogbGluayxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGl2ZTogXy5pbmNsdWRlcyhbYWN0aXZlUGFnZU5hbWUsICcjJyArIGFjdGl2ZVBhZ2VOYW1lLCAnIy8nICsgYWN0aXZlUGFnZU5hbWVdLCBsaW5rKVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRJdGVtcyh2YWx1ZSBhcyBhbnlbXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAoXy5pc1N0cmluZyh2YWx1ZSkpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmdldEl0ZW1zKCh2YWx1ZSBhcyBzdHJpbmcpLnNwbGl0KCcsJykpO1xuICAgICAgICB9XG4gICAgfVxuXG59XG4iXX0=