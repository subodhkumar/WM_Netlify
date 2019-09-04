import * as tslib_1 from "tslib";
import { Attribute, Component, Injector } from '@angular/core';
import { getEvaluatedData, PageDirective, provideAsWidgetRef, StylableComponent, styler } from '@wm/components';
import { registerProps } from './tabbar.props';
var DEFAULT_CLS = 'app-tabbar app-top-nav';
var WIDGET_CONFIG = { widgetType: 'wm-mobile-tabbar', hostClass: DEFAULT_CLS };
var MobileTabbarComponent = /** @class */ (function (_super) {
    tslib_1.__extends(MobileTabbarComponent, _super);
    function MobileTabbarComponent(page, inj, binditemlabel, binditemicon, binditemlink) {
        var _this = _super.call(this, inj, WIDGET_CONFIG) || this;
        _this.page = page;
        _this.binditemlabel = binditemlabel;
        _this.binditemicon = binditemicon;
        _this.binditemlink = binditemlink;
        _this.tabItems = [];
        _this.layout = {};
        _this._layouts = [
            { minwidth: 2048, max: 12 },
            { minwidth: 1024, max: 10 },
            { minwidth: 768, max: 7 },
            { minwidth: 480, max: 5 },
            { minwidth: 0, max: 4 }
        ];
        styler(_this.nativeElement, _this);
        page.notify('wmMobileTabbar:ready', _this);
        return _this;
    }
    MobileTabbarComponent.prototype.onPropertyChange = function (key, nv, ov) {
        if (key === 'dataset') {
            if (nv) {
                this.tabItems = this.getTabItems(nv);
            }
        }
        else {
            _super.prototype.onPropertyChange.call(this, key, nv, ov);
        }
    };
    MobileTabbarComponent.prototype.ngAfterViewInit = function () {
        var _this = this;
        setTimeout(function () {
            _this.layout = _this.getSuitableLayout();
            $(window).on('resize.tabbar', _.debounce(function () { return _this.layout = _this.getSuitableLayout(); }, 20));
        });
        _super.prototype.ngAfterViewInit.call(this);
    };
    MobileTabbarComponent.prototype.ngOnDestroy = function () {
        $(window).off('.tabbar');
        _super.prototype.ngOnDestroy.call(this);
    };
    // triggered on item selection
    MobileTabbarComponent.prototype.onItemSelect = function ($event, selectedItem) {
        this.invokeEventCallback('select', { $event: $event, $item: selectedItem.value || selectedItem.label });
    };
    MobileTabbarComponent.prototype.getItems = function (itemArray) {
        return itemArray.map(function (item) { return ({
            label: item,
            icon: 'wi wi-' + item
        }); });
    };
    MobileTabbarComponent.prototype.getSuitableLayout = function () {
        var avaiableWidth = $(this.nativeElement).parent().width();
        return this._layouts.find(function (l) { return avaiableWidth >= l.minwidth; });
    };
    MobileTabbarComponent.prototype.getTabItems = function (value) {
        var _this = this;
        if (_.isArray(value)) {
            if (_.isObject(value[0])) {
                return value.map(function (item) {
                    var link = getEvaluatedData(item, { expression: 'itemlink', 'bindExpression': _this.binditemlink }, _this.viewParent) || item.link;
                    var activePageName = window.location.hash.substr(2);
                    return {
                        label: getEvaluatedData(item, { expression: 'itemlabel', bindExpression: _this.binditemlabel }, _this.viewParent) || item.label,
                        icon: getEvaluatedData(item, { expression: 'itemicon', bindExpression: _this.binditemicon }, _this.viewParent) || item.icon,
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
    };
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
    MobileTabbarComponent.ctorParameters = function () { return [
        { type: PageDirective },
        { type: Injector },
        { type: undefined, decorators: [{ type: Attribute, args: ['itemlabel.bind',] }] },
        { type: undefined, decorators: [{ type: Attribute, args: ['itemicon.bind',] }] },
        { type: undefined, decorators: [{ type: Attribute, args: ['itemicon.bind',] }] }
    ]; };
    return MobileTabbarComponent;
}(StylableComponent));
export { MobileTabbarComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFiYmFyLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9tb2JpbGUvY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvdGFiYmFyL3RhYmJhci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBaUIsU0FBUyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQWEsTUFBTSxlQUFlLENBQUM7QUFFekYsT0FBTyxFQUFFLGdCQUFnQixFQUFpQixhQUFhLEVBQUUsa0JBQWtCLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFL0gsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBSS9DLElBQU0sV0FBVyxHQUFHLHdCQUF3QixDQUFDO0FBQzdDLElBQU0sYUFBYSxHQUFrQixFQUFDLFVBQVUsRUFBRSxrQkFBa0IsRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFDLENBQUM7QUFTOUY7SUFPMkMsaURBQWlCO0lBbUJ4RCwrQkFDWSxJQUFtQixFQUMzQixHQUFhLEVBQ3VCLGFBQWEsRUFDZCxZQUFZLEVBQ1osWUFBWTtRQUxuRCxZQU9JLGtCQUFNLEdBQUcsRUFBRSxhQUFhLENBQUMsU0FHNUI7UUFUVyxVQUFJLEdBQUosSUFBSSxDQUFlO1FBRVMsbUJBQWEsR0FBYixhQUFhLENBQUE7UUFDZCxrQkFBWSxHQUFaLFlBQVksQ0FBQTtRQUNaLGtCQUFZLEdBQVosWUFBWSxDQUFBO1FBckI1QyxjQUFRLEdBQUcsRUFBRSxDQUFDO1FBQ2QsWUFBTSxHQUFRLEVBQUUsQ0FBQztRQU9QLGNBQVEsR0FBRztZQUN4QixFQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBQztZQUN6QixFQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLEVBQUUsRUFBQztZQUN6QixFQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMs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O2lCQUNKOzs7O2dCQXRCeUMsYUFBYTtnQkFGVCxRQUFRO2dEQStDN0MsU0FBUyxTQUFDLGdCQUFnQjtnREFDMUIsU0FBUyxTQUFDLGVBQWU7Z0RBQ3pCLFNBQVMsU0FBQyxlQUFlOztJQW9FbEMsNEJBQUM7Q0FBQSxBQW5HRCxDQU8yQyxpQkFBaUIsR0E0RjNEO1NBNUZZLHFCQUFxQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFmdGVyVmlld0luaXQsIEF0dHJpYnV0ZSwgQ29tcG9uZW50LCBJbmplY3RvciwgT25EZXN0cm95IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IGdldEV2YWx1YXRlZERhdGEsIElXaWRnZXRDb25maWcsIFBhZ2VEaXJlY3RpdmUsIHByb3ZpZGVBc1dpZGdldFJlZiwgU3R5bGFibGVDb21wb25lbnQsIHN0eWxlciB9IGZyb20gJ0B3bS9jb21wb25lbnRzJztcblxuaW1wb3J0IHsgcmVnaXN0ZXJQcm9wcyB9IGZyb20gJy4vdGFiYmFyLnByb3BzJztcblxuZGVjbGFyZSBjb25zdCAkO1xuZGVjbGFyZSBjb25zdCBfO1xuY29uc3QgREVGQVVMVF9DTFMgPSAnYXBwLXRhYmJhciBhcHAtdG9wLW5hdic7XG5jb25zdCBXSURHRVRfQ09ORklHOiBJV2lkZ2V0Q29uZmlnID0ge3dpZGdldFR5cGU6ICd3bS1tb2JpbGUtdGFiYmFyJywgaG9zdENsYXNzOiBERUZBVUxUX0NMU307XG5cbmludGVyZmFjZSBUYWJJdGVtIHtcbiAgICBpY29uOiBzdHJpbmc7XG4gICAgbGFiZWw6IHN0cmluZztcbiAgICBsaW5rPzogc3RyaW5nO1xuICAgIHZhbHVlPzogc3RyaW5nO1xufVxuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ2Rpdlt3bU1vYmlsZVRhYmJhcl0nLFxuICAgIHRlbXBsYXRlVXJsOiAnLi90YWJiYXIuY29tcG9uZW50Lmh0bWwnLFxuICAgIHByb3ZpZGVyczogW1xuICAgICAgICBwcm92aWRlQXNXaWRnZXRSZWYoTW9iaWxlVGFiYmFyQ29tcG9uZW50KVxuICAgIF1cbn0pXG5leHBvcnQgY2xhc3MgTW9iaWxlVGFiYmFyQ29tcG9uZW50IGV4dGVuZHMgU3R5bGFibGVDb21wb25lbnQgaW1wbGVtZW50cyBBZnRlclZpZXdJbml0LCBPbkRlc3Ryb3kge1xuICAgIHN0YXRpYyBpbml0aWFsaXplUHJvcHMgPSByZWdpc3RlclByb3BzKCk7XG5cbiAgICBwdWJsaWMgdGFiSXRlbXMgPSBbXTtcbiAgICBwdWJsaWMgbGF5b3V0OiBhbnkgPSB7fTtcbiAgICBwdWJsaWMgcG9zaXRpb246IGFueTtcbiAgICBwdWJsaWMgYm90dG9tOiBhbnk7XG4gICAgcHVibGljIG1vcmVidXR0b25pY29uY2xhc3M6IGFueTtcbiAgICBwdWJsaWMgbW9yZWJ1dHRvbmxhYmVsOiBhbnk7XG4gICAgcHVibGljIHNob3dNb3JlTWVudTogYW55O1xuXG4gICAgcHJpdmF0ZSByZWFkb25seSBfbGF5b3V0cyA9IFtcbiAgICAgICAge21pbndpZHRoOiAyMDQ4LCBtYXg6IDEyfSxcbiAgICAgICAge21pbndpZHRoOiAxMDI0LCBtYXg6IDEwfSxcbiAgICAgICAge21pbndpZHRoOiA3NjgsIG1heDogN30sXG4gICAgICAgIHttaW53aWR0aDogNDgwLCBtYXg6IDV9LFxuICAgICAgICB7bWlud2lkdGg6IDAsIG1heDogNH1cbiAgICBdO1xuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHByaXZhdGUgcGFnZTogUGFnZURpcmVjdGl2ZSxcbiAgICAgICAgaW5qOiBJbmplY3RvcixcbiAgICAgICAgQEF0dHJpYnV0ZSgnaXRlbWxhYmVsLmJpbmQnKSBwdWJsaWMgYmluZGl0ZW1sYWJlbCxcbiAgICAgICAgQEF0dHJpYnV0ZSgnaXRlbWljb24uYmluZCcpIHB1YmxpYyBiaW5kaXRlbWljb24sXG4gICAgICAgIEBBdHRyaWJ1dGUoJ2l0ZW1pY29uLmJpbmQnKSBwdWJsaWMgYmluZGl0ZW1saW5rXG4gICAgKSB7XG4gICAgICAgIHN1cGVyKGluaiwgV0lER0VUX0NPTkZJRyk7XG4gICAgICAgIHN0eWxlcih0aGlzLm5hdGl2ZUVsZW1lbnQsIHRoaXMpO1xuICAgICAgICBwYWdlLm5vdGlmeSgnd21Nb2JpbGVUYWJiYXI6cmVhZHknLCB0aGlzKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgb25Qcm9wZXJ0eUNoYW5nZShrZXksIG52LCBvdj8pIHtcbiAgICAgICAgaWYgKGtleSA9PT0gJ2RhdGFzZXQnKSB7XG4gICAgICAgICAgICBpZiAobnYpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRhYkl0ZW1zID0gdGhpcy5nZXRUYWJJdGVtcyhudik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdXBlci5vblByb3BlcnR5Q2hhbmdlKGtleSwgbnYsIG92KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBuZ0FmdGVyVmlld0luaXQoKSB7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5sYXlvdXQgPSB0aGlzLmdldFN1aXRhYmxlTGF5b3V0KCk7XG4gICAgICAgICAgICAkKHdpbmRvdykub24oJ3Jlc2l6ZS50YWJiYXInLCBfLmRlYm91bmNlKCgpID0+IHRoaXMubGF5b3V0ID0gdGhpcy5nZXRTdWl0YWJsZUxheW91dCgpLCAyMCkpO1xuICAgICAgICB9KTtcbiAgICAgICAgc3VwZXIubmdBZnRlclZpZXdJbml0KCk7XG4gICAgfVxuXG4gICAgcHVibGljIG5nT25EZXN0cm95KCkge1xuICAgICAgICAkKHdpbmRvdykub2ZmKCcudGFiYmFyJyk7XG4gICAgICAgIHN1cGVyLm5nT25EZXN0cm95KCk7XG4gICAgfVxuXG4gICAgLy8gdHJpZ2dlcmVkIG9uIGl0ZW0gc2VsZWN0aW9uXG4gICAgcHVibGljIG9uSXRlbVNlbGVjdCgkZXZlbnQsIHNlbGVjdGVkSXRlbTogVGFiSXRlbSkge1xuICAgICAgICB0aGlzLmludm9rZUV2ZW50Q2FsbGJhY2soJ3NlbGVjdCcsIHskZXZlbnQsICRpdGVtOiBzZWxlY3RlZEl0ZW0udmFsdWUgfHwgc2VsZWN0ZWRJdGVtLmxhYmVsfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRJdGVtcyhpdGVtQXJyYXk6IGFueVtdKTogVGFiSXRlbVtdIHtcbiAgICAgICAgcmV0dXJuIGl0ZW1BcnJheS5tYXAoaXRlbSA9PiAoe1xuICAgICAgICAgICAgbGFiZWw6IGl0ZW0sXG4gICAgICAgICAgICBpY29uOiAnd2kgd2ktJyArIGl0ZW1cbiAgICAgICAgfSkpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0U3VpdGFibGVMYXlvdXQoKSB7XG4gICAgICAgIGNvbnN0IGF2YWlhYmxlV2lkdGg6IG51bWJlciA9ICQodGhpcy5uYXRpdmVFbGVtZW50KS5wYXJlbnQoKS53aWR0aCgpO1xuICAgICAgICByZXR1cm4gdGhpcy5fbGF5b3V0cy5maW5kKGwgPT4gYXZhaWFibGVXaWR0aCA+PSBsLm1pbndpZHRoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldFRhYkl0ZW1zKHZhbHVlOiBhbnkpOiBUYWJJdGVtW10ge1xuICAgICAgICBpZiAoXy5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgICAgICAgaWYgKF8uaXNPYmplY3QodmFsdWVbMF0pKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICh2YWx1ZSBhcyBhbnlbXSkubWFwKGl0ZW0gPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBsaW5rID0gZ2V0RXZhbHVhdGVkRGF0YShpdGVtLCB7ZXhwcmVzc2lvbjogJ2l0ZW1saW5rJywgJ2JpbmRFeHByZXNzaW9uJzogdGhpcy5iaW5kaXRlbWxpbmt9LCB0aGlzLnZpZXdQYXJlbnQpIHx8IGl0ZW0ubGluaztcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYWN0aXZlUGFnZU5hbWUgPSB3aW5kb3cubG9jYXRpb24uaGFzaC5zdWJzdHIoMik7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogZ2V0RXZhbHVhdGVkRGF0YShpdGVtLCB7ZXhwcmVzc2lvbjogJ2l0ZW1sYWJlbCcsIGJpbmRFeHByZXNzaW9uOiB0aGlzLmJpbmRpdGVtbGFiZWx9LCB0aGlzLnZpZXdQYXJlbnQpIHx8IGl0ZW0ubGFiZWwsXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uOiBnZXRFdmFsdWF0ZWREYXRhKGl0ZW0sIHtleHByZXNzaW9uOiAnaXRlbWljb24nLCBiaW5kRXhwcmVzc2lvbjogdGhpcy5iaW5kaXRlbWljb259LCB0aGlzLnZpZXdQYXJlbnQpIHx8IGl0ZW0uaWNvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIGxpbms6IGxpbmssXG4gICAgICAgICAgICAgICAgICAgICAgICBhY3RpdmU6IF8uaW5jbHVkZXMoW2FjdGl2ZVBhZ2VOYW1lLCAnIycgKyBhY3RpdmVQYWdlTmFtZSwgJyMvJyArIGFjdGl2ZVBhZ2VOYW1lXSwgbGluaylcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0SXRlbXModmFsdWUgYXMgYW55W10pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKF8uaXNTdHJpbmcodmFsdWUpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRJdGVtcygodmFsdWUgYXMgc3RyaW5nKS5zcGxpdCgnLCcpKTtcbiAgICAgICAgfVxuICAgIH1cblxufVxuIl19