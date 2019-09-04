import * as tslib_1 from "tslib";
import { QueryList, ViewChildren } from '@angular/core';
import { StylableComponent } from './stylable.component';
import { MenuComponent } from '../menu/menu.component';
var menuProps = ['itemlabel', 'itemicon', 'itemlink', 'itemaction', 'itemchildren', 'userrole'];
var MenuAdapterComponent = /** @class */ (function (_super) {
    tslib_1.__extends(MenuAdapterComponent, _super);
    function MenuAdapterComponent(inj, WIDGET_CONFIG) {
        var _this = _super.call(this, inj, WIDGET_CONFIG) || this;
        _this.pageScope = _this.viewParent;
        _this.binditemlabel = _this.nativeElement.getAttribute('itemlabel.bind');
        _this.binditemicon = _this.nativeElement.getAttribute('itemicon.bind');
        _this.binditemaction = _this.nativeElement.getAttribute('itemaction.bind');
        _this.binditemlink = _this.nativeElement.getAttribute('itemlink.bind');
        _this.binduserrole = _this.nativeElement.getAttribute('userrole.bind');
        _this.binditemchildren = _this.nativeElement.getAttribute('itemchildren.bind');
        return _this;
    }
    MenuAdapterComponent.prototype.onPropertyChange = function (key, nv, ov) {
        if (_.includes(menuProps, key) && this.menuRef) {
            this.menuRef.itemlabel = nv;
        }
        else {
            _super.prototype.onPropertyChange.call(this, key, nv, ov);
        }
    };
    MenuAdapterComponent.prototype.ngAfterViewInit = function () {
        var _this = this;
        _super.prototype.ngAfterViewInit.call(this);
        var subscriber = this.menuRefQL.changes.subscribe(function (menuRefQL) {
            if (menuRefQL.first) {
                _this.menuRef = menuRefQL.first;
                menuProps.forEach(function (prop) {
                    var bindProp = "bind" + prop;
                    if (_this[bindProp]) {
                        _this.menuRef[bindProp] = _this[bindProp];
                    }
                    _this.menuRef[prop] = _this[prop];
                });
                subscriber.unsubscribe();
            }
        });
    };
    MenuAdapterComponent.propDecorators = {
        menuRefQL: [{ type: ViewChildren, args: [MenuComponent,] }]
    };
    return MenuAdapterComponent;
}(StylableComponent));
export { MenuAdapterComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1hZGFwYXRvci5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL2Jhc2UvbWVudS1hZGFwYXRvci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBaUIsU0FBUyxFQUFFLFlBQVksRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUV2RSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQztBQUN6RCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFJdkQsSUFBTSxTQUFTLEdBQUcsQ0FBQyxXQUFXLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxZQUFZLEVBQUUsY0FBYyxFQUFFLFVBQVUsQ0FBQyxDQUFDO0FBRWxHO0lBQTBDLGdEQUFpQjtJQWV2RCw4QkFDSSxHQUFHLEVBQ0gsYUFBYTtRQUZqQixZQUlJLGtCQUFNLEdBQUcsRUFBRSxhQUFhLENBQUMsU0FTNUI7UUFQRyxLQUFJLENBQUMsU0FBUyxHQUFHLEtBQUksQ0FBQyxVQUFVLENBQUM7UUFDakMsS0FBSSxDQUFDLGFBQWEsR0FBRyxLQUFJLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1FBQ3ZFLEtBQUksQ0FBQyxZQUFZLEdBQUcsS0FBSSxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDckUsS0FBSSxDQUFDLGNBQWMsR0FBRyxLQUFJLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQ3pFLEtBQUksQ0FBQyxZQUFZLEdBQUcsS0FBSSxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsZUFBZSxDQUFDLENBQUM7UUFDckUsS0FBSSxDQUFDLFlBQVksR0FBRyxLQUFJLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUNyRSxLQUFJLENBQUMsZ0JBQWdCLEdBQUcsS0FBSSxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsbUJBQW1CLENBQUMsQ0FBQzs7SUFDakYsQ0FBQztJQUVELCtDQUFnQixHQUFoQixVQUFpQixHQUFXLEVBQUUsRUFBTyxFQUFFLEVBQVE7UUFDM0MsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBRSxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQzVDLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQztTQUMvQjthQUFNO1lBQ0gsaUJBQU0sZ0JBQWdCLFlBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztTQUN2QztJQUNMLENBQUM7SUFFRCw4Q0FBZSxHQUFmO1FBQUEsaUJBZUM7UUFkRyxpQkFBTSxlQUFlLFdBQUUsQ0FBQztRQUN4QixJQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsVUFBQyxTQUFtQztZQUNwRixJQUFJLFNBQVMsQ0FBQyxLQUFLLEVBQUU7Z0JBQ2pCLEtBQUksQ0FBQyxPQUFPLEdBQUcsU0FBUyxDQUFDLEtBQUssQ0FBQztnQkFDL0IsU0FBUyxDQUFDLE9BQU8sQ0FBQyxVQUFDLElBQUk7b0JBQ25CLElBQU0sUUFBUSxHQUFHLFNBQU8sSUFBTSxDQUFDO29CQUMvQixJQUFJLEtBQUksQ0FBQyxRQUFRLENBQUMsRUFBRTt3QkFDaEIsS0FBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsR0FBRyxLQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7cUJBQzNDO29CQUNELEtBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsS0FBSSxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNwQyxDQUFDLENBQUMsQ0FBQztnQkFDSCxVQUFVLENBQUMsV0FBVyxFQUFFLENBQUM7YUFDNUI7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7OzRCQXhDQSxZQUFZLFNBQUMsYUFBYTs7SUF5Qy9CLDJCQUFDO0NBQUEsQUF0REQsQ0FBMEMsaUJBQWlCLEdBc0QxRDtTQXREWSxvQkFBb0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBZnRlclZpZXdJbml0LCBRdWVyeUxpc3QsIFZpZXdDaGlsZHJlbiB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBTdHlsYWJsZUNvbXBvbmVudCB9IGZyb20gJy4vc3R5bGFibGUuY29tcG9uZW50JztcbmltcG9ydCB7IE1lbnVDb21wb25lbnQgfSBmcm9tICcuLi9tZW51L21lbnUuY29tcG9uZW50JztcblxuZGVjbGFyZSBjb25zdCBfO1xuXG5jb25zdCBtZW51UHJvcHMgPSBbJ2l0ZW1sYWJlbCcsICdpdGVtaWNvbicsICdpdGVtbGluaycsICdpdGVtYWN0aW9uJywgJ2l0ZW1jaGlsZHJlbicsICd1c2Vycm9sZSddO1xuXG5leHBvcnQgY2xhc3MgTWVudUFkYXB0ZXJDb21wb25lbnQgZXh0ZW5kcyBTdHlsYWJsZUNvbXBvbmVudCBpbXBsZW1lbnRzIEFmdGVyVmlld0luaXQge1xuXG4gICAgcHJpdmF0ZSBpdGVtbGFiZWw7XG4gICAgcHJpdmF0ZSBtZW51UmVmO1xuICAgIHByaXZhdGUgcGFnZVNjb3BlO1xuXG4gICAgcHJpdmF0ZSBiaW5kaXRlbWxhYmVsO1xuICAgIHByaXZhdGUgYmluZGl0ZW1pY29uO1xuICAgIHByaXZhdGUgYmluZGl0ZW1hY3Rpb247XG4gICAgcHJpdmF0ZSBiaW5kaXRlbWNoaWxkcmVuO1xuICAgIHByaXZhdGUgYmluZGl0ZW1saW5rO1xuICAgIHByaXZhdGUgYmluZHVzZXJyb2xlO1xuXG4gICAgQFZpZXdDaGlsZHJlbihNZW51Q29tcG9uZW50KSBwcml2YXRlIG1lbnVSZWZRTDogUXVlcnlMaXN0PE1lbnVDb21wb25lbnQ+O1xuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIGluaixcbiAgICAgICAgV0lER0VUX0NPTkZJRyxcbiAgICApIHtcbiAgICAgICAgc3VwZXIoaW5qLCBXSURHRVRfQ09ORklHKTtcblxuICAgICAgICB0aGlzLnBhZ2VTY29wZSA9IHRoaXMudmlld1BhcmVudDtcbiAgICAgICAgdGhpcy5iaW5kaXRlbWxhYmVsID0gdGhpcy5uYXRpdmVFbGVtZW50LmdldEF0dHJpYnV0ZSgnaXRlbWxhYmVsLmJpbmQnKTtcbiAgICAgICAgdGhpcy5iaW5kaXRlbWljb24gPSB0aGlzLm5hdGl2ZUVsZW1lbnQuZ2V0QXR0cmlidXRlKCdpdGVtaWNvbi5iaW5kJyk7XG4gICAgICAgIHRoaXMuYmluZGl0ZW1hY3Rpb24gPSB0aGlzLm5hdGl2ZUVsZW1lbnQuZ2V0QXR0cmlidXRlKCdpdGVtYWN0aW9uLmJpbmQnKTtcbiAgICAgICAgdGhpcy5iaW5kaXRlbWxpbmsgPSB0aGlzLm5hdGl2ZUVsZW1lbnQuZ2V0QXR0cmlidXRlKCdpdGVtbGluay5iaW5kJyk7XG4gICAgICAgIHRoaXMuYmluZHVzZXJyb2xlID0gdGhpcy5uYXRpdmVFbGVtZW50LmdldEF0dHJpYnV0ZSgndXNlcnJvbGUuYmluZCcpO1xuICAgICAgICB0aGlzLmJpbmRpdGVtY2hpbGRyZW4gPSB0aGlzLm5hdGl2ZUVsZW1lbnQuZ2V0QXR0cmlidXRlKCdpdGVtY2hpbGRyZW4uYmluZCcpO1xuICAgIH1cblxuICAgIG9uUHJvcGVydHlDaGFuZ2Uoa2V5OiBzdHJpbmcsIG52OiBhbnksIG92PzogYW55KSB7XG4gICAgICAgIGlmIChfLmluY2x1ZGVzKG1lbnVQcm9wcywga2V5KSAmJiB0aGlzLm1lbnVSZWYpIHtcbiAgICAgICAgICAgIHRoaXMubWVudVJlZi5pdGVtbGFiZWwgPSBudjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN1cGVyLm9uUHJvcGVydHlDaGFuZ2Uoa2V5LCBudiwgb3YpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgbmdBZnRlclZpZXdJbml0KCkge1xuICAgICAgICBzdXBlci5uZ0FmdGVyVmlld0luaXQoKTtcbiAgICAgICAgY29uc3Qgc3Vic2NyaWJlciA9IHRoaXMubWVudVJlZlFMLmNoYW5nZXMuc3Vic2NyaWJlKChtZW51UmVmUUw6IFF1ZXJ5TGlzdDxNZW51Q29tcG9uZW50PikgPT4ge1xuICAgICAgICAgICAgaWYgKG1lbnVSZWZRTC5maXJzdCkge1xuICAgICAgICAgICAgICAgIHRoaXMubWVudVJlZiA9IG1lbnVSZWZRTC5maXJzdDtcbiAgICAgICAgICAgICAgICBtZW51UHJvcHMuZm9yRWFjaCgocHJvcCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBiaW5kUHJvcCA9IGBiaW5kJHtwcm9wfWA7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aGlzW2JpbmRQcm9wXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tZW51UmVmW2JpbmRQcm9wXSA9IHRoaXNbYmluZFByb3BdO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWVudVJlZltwcm9wXSA9IHRoaXNbcHJvcF07XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgc3Vic2NyaWJlci51bnN1YnNjcmliZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59XG4iXX0=