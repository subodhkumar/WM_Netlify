import * as tslib_1 from "tslib";
import { Component, ViewChild, ViewContainerRef, TemplateRef } from '@angular/core';
import { Toast, ToastPackage, ToastrService } from 'ngx-toastr';
import { $watch, $appDigest } from '@wm/core';
export class CustomToasterComponent extends Toast {
    // constructor is only necessary when not using AoT
    constructor(toastrService, toastPackage) {
        super(toastrService, toastPackage);
        this.toastrService = toastrService;
        this.toastPackage = toastPackage;
        this.watchers = [];
        this.params = {};
        this.pagename = this.message || '';
        this.generateParams();
    }
    // Generate the params for partial page. If bound, watch the expression and set the value
    generateParams() {
        _.forEach(this.options.partialParams, (param) => {
            if (_.isString(param.value) && param.value.indexOf('bind:') === 0) {
                this.watchers.push($watch(param.value.substr(5), this.options.context, {}, nv => {
                    this.params[param.name] = nv;
                    $appDigest();
                }));
            }
            else {
                this.params[param.name] = param.value;
            }
        });
    }
    generateDynamicComponent() {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const $targetLayout = $('.parent-custom-toast');
            this.customToastRef.clear();
            $targetLayout[0].appendChild(this.customToastRef.createEmbeddedView(this.customToastTmpl).rootNodes[0]);
        });
    }
    ngAfterViewInit() {
        this.generateDynamicComponent();
    }
    ngOnDestroy() {
        _.forEach(this.watchers, watcher => watcher());
    }
}
CustomToasterComponent.decorators = [
    { type: Component, args: [{
                selector: '[custom-toaster-component]',
                template: `
        <div class="parent-custom-toast"></div>
        <ng-container #customToast></ng-container>
        <ng-template #customToastTmpl>
            <div wmContainer partialContainer content.bind="pagename">
                <div *ngFor="let param of params | keyvalue" wmParam hidden
                    [name]="param.key" [value]="param.value"></div>
            </div>
        </ng-template>`,
                preserveWhitespaces: false
            }] }
];
/** @nocollapse */
CustomToasterComponent.ctorParameters = () => [
    { type: ToastrService },
    { type: ToastPackage }
];
CustomToasterComponent.propDecorators = {
    customToastRef: [{ type: ViewChild, args: ['customToast', { read: ViewContainerRef },] }],
    customToastTmpl: [{ type: ViewChild, args: ['customToastTmpl',] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3VzdG9tLXRvYXN0ZXIuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL3J1bnRpbWUvYmFzZS8iLCJzb3VyY2VzIjpbImNvbXBvbmVudHMvY3VzdG9tLXRvYXN0ZXIuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQWlCLFNBQVMsRUFBRSxTQUFTLEVBQUUsZ0JBQWdCLEVBQUUsV0FBVyxFQUFhLE1BQU0sZUFBZSxDQUFDO0FBRTlHLE9BQU8sRUFBRSxLQUFLLEVBQUUsWUFBWSxFQUFFLGFBQWEsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUVoRSxPQUFPLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQWlCOUMsTUFBTSxPQUFPLHNCQUF1QixTQUFRLEtBQUs7SUFRN0MsbURBQW1EO0lBQ25ELFlBQ2MsYUFBNEIsRUFDL0IsWUFBMEI7UUFFakMsS0FBSyxDQUFDLGFBQWEsRUFBRSxZQUFZLENBQUMsQ0FBQztRQUh6QixrQkFBYSxHQUFiLGFBQWEsQ0FBZTtRQUMvQixpQkFBWSxHQUFaLFlBQVksQ0FBYztRQU5yQyxhQUFRLEdBQVEsRUFBRSxDQUFDO1FBQ25CLFdBQU0sR0FBUSxFQUFFLENBQUM7UUFRYixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxPQUFPLElBQUksRUFBRSxDQUFDO1FBQ25DLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztJQUMxQixDQUFDO0lBRUQseUZBQXlGO0lBQ3pGLGNBQWM7UUFDVixDQUFDLENBQUMsT0FBTyxDQUFPLElBQUksQ0FBQyxPQUFRLENBQUMsYUFBYSxFQUFFLENBQUMsS0FBSyxFQUFFLEVBQUU7WUFDbkQsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxLQUFLLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQy9ELElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FDckIsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQ2YsSUFBSSxDQUFDLE9BQVEsQ0FBQyxPQUFPLEVBQzNCLEVBQUUsRUFDRixFQUFFLENBQUMsRUFBRTtvQkFDRCxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7b0JBQzdCLFVBQVUsRUFBRSxDQUFDO2dCQUNqQixDQUFDLENBQ0osQ0FBQyxDQUFDO2FBQ047aUJBQU07Z0JBQ0gsSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQzthQUN6QztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVLLHdCQUF3Qjs7WUFDMUIsTUFBTSxhQUFhLEdBQUcsQ0FBQyxDQUFDLHNCQUFzQixDQUFDLENBQUM7WUFFaEQsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUU1QixhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVHLENBQUM7S0FBQTtJQUVELGVBQWU7UUFDWCxJQUFJLENBQUMsd0JBQXdCLEVBQUUsQ0FBQztJQUNwQyxDQUFDO0lBRUQsV0FBVztRQUNQLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7SUFDbkQsQ0FBQzs7O1lBaEVKLFNBQVMsU0FBQztnQkFDUCxRQUFRLEVBQUUsNEJBQTRCO2dCQUN0QyxRQUFRLEVBQUU7Ozs7Ozs7O3VCQVFTO2dCQUNuQixtQkFBbUIsRUFBRSxLQUFLO2FBQzdCOzs7O1lBbEI2QixhQUFhO1lBQTNCLFlBQVk7Ozs2QkFxQnZCLFNBQVMsU0FBQyxhQUFhLEVBQUUsRUFBQyxJQUFJLEVBQUUsZ0JBQWdCLEVBQUM7OEJBQ2pELFNBQVMsU0FBQyxpQkFBaUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBZnRlclZpZXdJbml0LCBDb21wb25lbnQsIFZpZXdDaGlsZCwgVmlld0NvbnRhaW5lclJlZiwgVGVtcGxhdGVSZWYsIE9uRGVzdHJveSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBUb2FzdCwgVG9hc3RQYWNrYWdlLCBUb2FzdHJTZXJ2aWNlIH0gZnJvbSAnbmd4LXRvYXN0cic7XG5cbmltcG9ydCB7ICR3YXRjaCwgJGFwcERpZ2VzdCB9IGZyb20gJ0B3bS9jb3JlJztcblxuZGVjbGFyZSBjb25zdCBfLCAkO1xuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ1tjdXN0b20tdG9hc3Rlci1jb21wb25lbnRdJyxcbiAgICB0ZW1wbGF0ZTogYFxuICAgICAgICA8ZGl2IGNsYXNzPVwicGFyZW50LWN1c3RvbS10b2FzdFwiPjwvZGl2PlxuICAgICAgICA8bmctY29udGFpbmVyICNjdXN0b21Ub2FzdD48L25nLWNvbnRhaW5lcj5cbiAgICAgICAgPG5nLXRlbXBsYXRlICNjdXN0b21Ub2FzdFRtcGw+XG4gICAgICAgICAgICA8ZGl2IHdtQ29udGFpbmVyIHBhcnRpYWxDb250YWluZXIgY29udGVudC5iaW5kPVwicGFnZW5hbWVcIj5cbiAgICAgICAgICAgICAgICA8ZGl2ICpuZ0Zvcj1cImxldCBwYXJhbSBvZiBwYXJhbXMgfCBrZXl2YWx1ZVwiIHdtUGFyYW0gaGlkZGVuXG4gICAgICAgICAgICAgICAgICAgIFtuYW1lXT1cInBhcmFtLmtleVwiIFt2YWx1ZV09XCJwYXJhbS52YWx1ZVwiPjwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgIDwvbmctdGVtcGxhdGU+YCxcbiAgICBwcmVzZXJ2ZVdoaXRlc3BhY2VzOiBmYWxzZVxufSlcbmV4cG9ydCBjbGFzcyBDdXN0b21Ub2FzdGVyQ29tcG9uZW50IGV4dGVuZHMgVG9hc3QgaW1wbGVtZW50cyBBZnRlclZpZXdJbml0LCBPbkRlc3Ryb3kge1xuXG4gICAgQFZpZXdDaGlsZCgnY3VzdG9tVG9hc3QnLCB7cmVhZDogVmlld0NvbnRhaW5lclJlZn0pIGN1c3RvbVRvYXN0UmVmOiBWaWV3Q29udGFpbmVyUmVmO1xuICAgIEBWaWV3Q2hpbGQoJ2N1c3RvbVRvYXN0VG1wbCcpIGN1c3RvbVRvYXN0VG1wbDogVGVtcGxhdGVSZWY8YW55PjtcbiAgICBwYWdlbmFtZTogYW55O1xuICAgIHdhdGNoZXJzOiBhbnkgPSBbXTtcbiAgICBwYXJhbXM6IGFueSA9IHt9O1xuXG4gICAgLy8gY29uc3RydWN0b3IgaXMgb25seSBuZWNlc3Nhcnkgd2hlbiBub3QgdXNpbmcgQW9UXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHByb3RlY3RlZCB0b2FzdHJTZXJ2aWNlOiBUb2FzdHJTZXJ2aWNlLFxuICAgICAgICBwdWJsaWMgdG9hc3RQYWNrYWdlOiBUb2FzdFBhY2thZ2VcbiAgICApIHtcbiAgICAgICAgc3VwZXIodG9hc3RyU2VydmljZSwgdG9hc3RQYWNrYWdlKTtcbiAgICAgICAgdGhpcy5wYWdlbmFtZSA9IHRoaXMubWVzc2FnZSB8fCAnJztcbiAgICAgICAgdGhpcy5nZW5lcmF0ZVBhcmFtcygpO1xuICAgIH1cblxuICAgIC8vIEdlbmVyYXRlIHRoZSBwYXJhbXMgZm9yIHBhcnRpYWwgcGFnZS4gSWYgYm91bmQsIHdhdGNoIHRoZSBleHByZXNzaW9uIGFuZCBzZXQgdGhlIHZhbHVlXG4gICAgZ2VuZXJhdGVQYXJhbXMoKSB7XG4gICAgICAgIF8uZm9yRWFjaCgoPGFueT50aGlzLm9wdGlvbnMpLnBhcnRpYWxQYXJhbXMsIChwYXJhbSkgPT4ge1xuICAgICAgICAgICAgaWYgKF8uaXNTdHJpbmcocGFyYW0udmFsdWUpICYmIHBhcmFtLnZhbHVlLmluZGV4T2YoJ2JpbmQ6JykgPT09IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLndhdGNoZXJzLnB1c2goJHdhdGNoKFxuICAgICAgICAgICAgICAgICAgICBwYXJhbS52YWx1ZS5zdWJzdHIoNSksXG4gICAgICAgICAgICAgICAgICAgICg8YW55PnRoaXMub3B0aW9ucykuY29udGV4dCxcbiAgICAgICAgICAgICAgICAgICAge30sXG4gICAgICAgICAgICAgICAgICAgIG52ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGFyYW1zW3BhcmFtLm5hbWVdID0gbnY7XG4gICAgICAgICAgICAgICAgICAgICAgICAkYXBwRGlnZXN0KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICApKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wYXJhbXNbcGFyYW0ubmFtZV0gPSBwYXJhbS52YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYXN5bmMgZ2VuZXJhdGVEeW5hbWljQ29tcG9uZW50KCkge1xuICAgICAgICBjb25zdCAkdGFyZ2V0TGF5b3V0ID0gJCgnLnBhcmVudC1jdXN0b20tdG9hc3QnKTtcblxuICAgICAgICB0aGlzLmN1c3RvbVRvYXN0UmVmLmNsZWFyKCk7XG5cbiAgICAgICAgJHRhcmdldExheW91dFswXS5hcHBlbmRDaGlsZCh0aGlzLmN1c3RvbVRvYXN0UmVmLmNyZWF0ZUVtYmVkZGVkVmlldyh0aGlzLmN1c3RvbVRvYXN0VG1wbCkucm9vdE5vZGVzWzBdKTtcbiAgICB9XG5cbiAgICBuZ0FmdGVyVmlld0luaXQoKSB7XG4gICAgICAgIHRoaXMuZ2VuZXJhdGVEeW5hbWljQ29tcG9uZW50KCk7XG4gICAgfVxuXG4gICAgbmdPbkRlc3Ryb3koKSB7XG4gICAgICAgIF8uZm9yRWFjaCh0aGlzLndhdGNoZXJzLCB3YXRjaGVyID0+IHdhdGNoZXIoKSk7XG4gICAgfVxufVxuIl19