import { Directive, Injector, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { $watch } from '@wm/core';
var LazyLoadDirective = /** @class */ (function () {
    function LazyLoadDirective(inj, templateRef, viewContainer) {
        this.templateRef = templateRef;
        this.viewContainer = viewContainer;
        this.viewParent = inj.view.component;
        this.context = inj.view.context;
    }
    Object.defineProperty(LazyLoadDirective.prototype, "lazyLoad", {
        set: function (expr) {
            var _this = this;
            this.unSubscribeFn = $watch(expr, this.viewParent, this.context, function (val) {
                if (!_this.embeddedView && val) {
                    _this.embeddedView = _this.viewContainer.createEmbeddedView(_this.templateRef, _this.context);
                    _this.unSubscribeFn();
                }
            });
        },
        enumerable: true,
        configurable: true
    });
    LazyLoadDirective.prototype.ngOnDestroy = function () {
        this.unSubscribeFn();
    };
    LazyLoadDirective.decorators = [
        { type: Directive, args: [{
                    selector: '[lazyLoad]'
                },] }
    ];
    /** @nocollapse */
    LazyLoadDirective.ctorParameters = function () { return [
        { type: Injector },
        { type: TemplateRef },
        { type: ViewContainerRef }
    ]; };
    LazyLoadDirective.propDecorators = {
        lazyLoad: [{ type: Input }]
    };
    return LazyLoadDirective;
}());
export { LazyLoadDirective };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGF6eS1sb2FkLmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vbGF6eS1sb2FkL2xhenktbG9hZC5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFhLFdBQVcsRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUVyRyxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBSWxDO0lBU0ksMkJBQ0ksR0FBYSxFQUNMLFdBQTZCLEVBQzdCLGFBQStCO1FBRC9CLGdCQUFXLEdBQVgsV0FBVyxDQUFrQjtRQUM3QixrQkFBYSxHQUFiLGFBQWEsQ0FBa0I7UUFFdkMsSUFBSSxDQUFDLFVBQVUsR0FBSSxHQUFXLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQztRQUM5QyxJQUFJLENBQUMsT0FBTyxHQUFJLEdBQVcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO0lBQzdDLENBQUM7SUFFRCxzQkFDSSx1Q0FBUTthQURaLFVBQ2EsSUFBSTtZQURqQixpQkFhQztZQVhHLElBQUksQ0FBQyxhQUFhLEdBQUcsTUFBTSxDQUN2QixJQUFJLEVBQ0osSUFBSSxDQUFDLFVBQVUsRUFDZixJQUFJLENBQUMsT0FBTyxFQUNaLFVBQUMsR0FBRztnQkFDQSxJQUFJLENBQUMsS0FBSSxDQUFDLFlBQVksSUFBSSxHQUFHLEVBQUU7b0JBQzNCLEtBQUksQ0FBQyxZQUFZLEdBQUksS0FBSSxDQUFDLGFBQWEsQ0FBQyxrQkFBa0IsQ0FBQyxLQUFJLENBQUMsV0FBVyxFQUFFLEtBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztvQkFDM0YsS0FBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO2lCQUN4QjtZQUNMLENBQUMsQ0FDSixDQUFDO1FBQ04sQ0FBQzs7O09BQUE7SUFFRCx1Q0FBVyxHQUFYO1FBQ0ksSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO0lBQ3pCLENBQUM7O2dCQW5DSixTQUFTLFNBQUM7b0JBQ1AsUUFBUSxFQUFFLFlBQVk7aUJBQ3pCOzs7O2dCQVJtQixRQUFRO2dCQUFvQixXQUFXO2dCQUFFLGdCQUFnQjs7OzJCQXdCeEUsS0FBSzs7SUFrQlYsd0JBQUM7Q0FBQSxBQXBDRCxJQW9DQztTQWpDWSxpQkFBaUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEaXJlY3RpdmUsIEluamVjdG9yLCBJbnB1dCwgT25EZXN0cm95LCBUZW1wbGF0ZVJlZiwgVmlld0NvbnRhaW5lclJlZiB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyAkd2F0Y2ggfSBmcm9tICdAd20vY29yZSc7XG5cbmRlY2xhcmUgY29uc3QgXztcblxuQERpcmVjdGl2ZSh7XG4gICAgc2VsZWN0b3I6ICdbbGF6eUxvYWRdJ1xufSlcbmV4cG9ydCBjbGFzcyBMYXp5TG9hZERpcmVjdGl2ZSBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XG4gICAgcHJpdmF0ZSByZWFkb25seSB2aWV3UGFyZW50OiBhbnk7XG4gICAgcHJpdmF0ZSByZWFkb25seSBjb250ZXh0O1xuICAgIHByaXZhdGUgZW1iZWRkZWRWaWV3O1xuICAgIHByaXZhdGUgdW5TdWJzY3JpYmVGbjogRnVuY3Rpb247XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgaW5qOiBJbmplY3RvcixcbiAgICAgICAgcHJpdmF0ZSB0ZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWY8YW55PixcbiAgICAgICAgcHJpdmF0ZSB2aWV3Q29udGFpbmVyOiBWaWV3Q29udGFpbmVyUmVmXG4gICAgKSB7XG4gICAgICAgIHRoaXMudmlld1BhcmVudCA9IChpbmogYXMgYW55KS52aWV3LmNvbXBvbmVudDtcbiAgICAgICAgdGhpcy5jb250ZXh0ID0gKGluaiBhcyBhbnkpLnZpZXcuY29udGV4dDtcbiAgICB9XG5cbiAgICBASW5wdXQoKVxuICAgIHNldCBsYXp5TG9hZChleHByKSB7XG4gICAgICAgIHRoaXMudW5TdWJzY3JpYmVGbiA9ICR3YXRjaChcbiAgICAgICAgICAgIGV4cHIsXG4gICAgICAgICAgICB0aGlzLnZpZXdQYXJlbnQsXG4gICAgICAgICAgICB0aGlzLmNvbnRleHQsXG4gICAgICAgICAgICAodmFsKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmVtYmVkZGVkVmlldyAmJiB2YWwpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbWJlZGRlZFZpZXcgID0gdGhpcy52aWV3Q29udGFpbmVyLmNyZWF0ZUVtYmVkZGVkVmlldyh0aGlzLnRlbXBsYXRlUmVmLCB0aGlzLmNvbnRleHQpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnVuU3Vic2NyaWJlRm4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgbmdPbkRlc3Ryb3koKSB7XG4gICAgICAgIHRoaXMudW5TdWJzY3JpYmVGbigpO1xuICAgIH1cbn1cbiJdfQ==