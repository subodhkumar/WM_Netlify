import { Directive, Injector, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { $watch } from '@wm/core';
export class LazyLoadDirective {
    constructor(inj, templateRef, viewContainer) {
        this.templateRef = templateRef;
        this.viewContainer = viewContainer;
        this.viewParent = inj.view.component;
        this.context = inj.view.context;
    }
    set lazyLoad(expr) {
        this.unSubscribeFn = $watch(expr, this.viewParent, this.context, (val) => {
            if (!this.embeddedView && val) {
                this.embeddedView = this.viewContainer.createEmbeddedView(this.templateRef, this.context);
                this.unSubscribeFn();
            }
        });
    }
    ngOnDestroy() {
        this.unSubscribeFn();
    }
}
LazyLoadDirective.decorators = [
    { type: Directive, args: [{
                selector: '[lazyLoad]'
            },] }
];
/** @nocollapse */
LazyLoadDirective.ctorParameters = () => [
    { type: Injector },
    { type: TemplateRef },
    { type: ViewContainerRef }
];
LazyLoadDirective.propDecorators = {
    lazyLoad: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGF6eS1sb2FkLmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vbGF6eS1sb2FkL2xhenktbG9hZC5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFhLFdBQVcsRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUVyRyxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBT2xDLE1BQU0sT0FBTyxpQkFBaUI7SUFNMUIsWUFDSSxHQUFhLEVBQ0wsV0FBNkIsRUFDN0IsYUFBK0I7UUFEL0IsZ0JBQVcsR0FBWCxXQUFXLENBQWtCO1FBQzdCLGtCQUFhLEdBQWIsYUFBYSxDQUFrQjtRQUV2QyxJQUFJLENBQUMsVUFBVSxHQUFJLEdBQVcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDO1FBQzlDLElBQUksQ0FBQyxPQUFPLEdBQUksR0FBVyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7SUFDN0MsQ0FBQztJQUVELElBQ0ksUUFBUSxDQUFDLElBQUk7UUFDYixJQUFJLENBQUMsYUFBYSxHQUFHLE1BQU0sQ0FDdkIsSUFBSSxFQUNKLElBQUksQ0FBQyxVQUFVLEVBQ2YsSUFBSSxDQUFDLE9BQU8sRUFDWixDQUFDLEdBQUcsRUFBRSxFQUFFO1lBQ0osSUFBSSxDQUFDLElBQUksQ0FBQyxZQUFZLElBQUksR0FBRyxFQUFFO2dCQUMzQixJQUFJLENBQUMsWUFBWSxHQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQzNGLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQzthQUN4QjtRQUNMLENBQUMsQ0FDSixDQUFDO0lBQ04sQ0FBQztJQUVELFdBQVc7UUFDUCxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7SUFDekIsQ0FBQzs7O1lBbkNKLFNBQVMsU0FBQztnQkFDUCxRQUFRLEVBQUUsWUFBWTthQUN6Qjs7OztZQVJtQixRQUFRO1lBQW9CLFdBQVc7WUFBRSxnQkFBZ0I7Ozt1QkF3QnhFLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEaXJlY3RpdmUsIEluamVjdG9yLCBJbnB1dCwgT25EZXN0cm95LCBUZW1wbGF0ZVJlZiwgVmlld0NvbnRhaW5lclJlZiB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyAkd2F0Y2ggfSBmcm9tICdAd20vY29yZSc7XG5cbmRlY2xhcmUgY29uc3QgXztcblxuQERpcmVjdGl2ZSh7XG4gICAgc2VsZWN0b3I6ICdbbGF6eUxvYWRdJ1xufSlcbmV4cG9ydCBjbGFzcyBMYXp5TG9hZERpcmVjdGl2ZSBpbXBsZW1lbnRzIE9uRGVzdHJveSB7XG4gICAgcHJpdmF0ZSByZWFkb25seSB2aWV3UGFyZW50OiBhbnk7XG4gICAgcHJpdmF0ZSByZWFkb25seSBjb250ZXh0O1xuICAgIHByaXZhdGUgZW1iZWRkZWRWaWV3O1xuICAgIHByaXZhdGUgdW5TdWJzY3JpYmVGbjogRnVuY3Rpb247XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgaW5qOiBJbmplY3RvcixcbiAgICAgICAgcHJpdmF0ZSB0ZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWY8YW55PixcbiAgICAgICAgcHJpdmF0ZSB2aWV3Q29udGFpbmVyOiBWaWV3Q29udGFpbmVyUmVmXG4gICAgKSB7XG4gICAgICAgIHRoaXMudmlld1BhcmVudCA9IChpbmogYXMgYW55KS52aWV3LmNvbXBvbmVudDtcbiAgICAgICAgdGhpcy5jb250ZXh0ID0gKGluaiBhcyBhbnkpLnZpZXcuY29udGV4dDtcbiAgICB9XG5cbiAgICBASW5wdXQoKVxuICAgIHNldCBsYXp5TG9hZChleHByKSB7XG4gICAgICAgIHRoaXMudW5TdWJzY3JpYmVGbiA9ICR3YXRjaChcbiAgICAgICAgICAgIGV4cHIsXG4gICAgICAgICAgICB0aGlzLnZpZXdQYXJlbnQsXG4gICAgICAgICAgICB0aGlzLmNvbnRleHQsXG4gICAgICAgICAgICAodmFsKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmVtYmVkZGVkVmlldyAmJiB2YWwpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lbWJlZGRlZFZpZXcgID0gdGhpcy52aWV3Q29udGFpbmVyLmNyZWF0ZUVtYmVkZGVkVmlldyh0aGlzLnRlbXBsYXRlUmVmLCB0aGlzLmNvbnRleHQpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnVuU3Vic2NyaWJlRm4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgbmdPbkRlc3Ryb3koKSB7XG4gICAgICAgIHRoaXMudW5TdWJzY3JpYmVGbigpO1xuICAgIH1cbn1cbiJdfQ==