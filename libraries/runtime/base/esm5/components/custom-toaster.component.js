import * as tslib_1 from "tslib";
import { Component, ViewChild, ViewContainerRef, TemplateRef } from '@angular/core';
import { Toast, ToastPackage, ToastrService } from 'ngx-toastr';
import { $watch, $appDigest } from '@wm/core';
var CustomToasterComponent = /** @class */ (function (_super) {
    tslib_1.__extends(CustomToasterComponent, _super);
    // constructor is only necessary when not using AoT
    function CustomToasterComponent(toastrService, toastPackage) {
        var _this = _super.call(this, toastrService, toastPackage) || this;
        _this.toastrService = toastrService;
        _this.toastPackage = toastPackage;
        _this.watchers = [];
        _this.params = {};
        _this.pagename = _this.message || '';
        _this.generateParams();
        return _this;
    }
    // Generate the params for partial page. If bound, watch the expression and set the value
    CustomToasterComponent.prototype.generateParams = function () {
        var _this = this;
        _.forEach(this.options.partialParams, function (param) {
            if (_.isString(param.value) && param.value.indexOf('bind:') === 0) {
                _this.watchers.push($watch(param.value.substr(5), _this.options.context, {}, function (nv) {
                    _this.params[param.name] = nv;
                    $appDigest();
                }));
            }
            else {
                _this.params[param.name] = param.value;
            }
        });
    };
    CustomToasterComponent.prototype.generateDynamicComponent = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var $targetLayout;
            return tslib_1.__generator(this, function (_a) {
                $targetLayout = $('.parent-custom-toast');
                this.customToastRef.clear();
                $targetLayout[0].appendChild(this.customToastRef.createEmbeddedView(this.customToastTmpl).rootNodes[0]);
                return [2 /*return*/];
            });
        });
    };
    CustomToasterComponent.prototype.ngAfterViewInit = function () {
        this.generateDynamicComponent();
    };
    CustomToasterComponent.prototype.ngOnDestroy = function () {
        _.forEach(this.watchers, function (watcher) { return watcher(); });
    };
    CustomToasterComponent.decorators = [
        { type: Component, args: [{
                    selector: '[custom-toaster-component]',
                    template: "\n        <div class=\"parent-custom-toast\"></div>\n        <ng-container #customToast></ng-container>\n        <ng-template #customToastTmpl>\n            <div wmContainer partialContainer content.bind=\"pagename\">\n                <div *ngFor=\"let param of params | keyvalue\" wmParam hidden\n                    [name]=\"param.key\" [value]=\"param.value\"></div>\n            </div>\n        </ng-template>",
                    preserveWhitespaces: false
                }] }
    ];
    /** @nocollapse */
    CustomToasterComponent.ctorParameters = function () { return [
        { type: ToastrService },
        { type: ToastPackage }
    ]; };
    CustomToasterComponent.propDecorators = {
        customToastRef: [{ type: ViewChild, args: ['customToast', { read: ViewContainerRef },] }],
        customToastTmpl: [{ type: ViewChild, args: ['customToastTmpl',] }]
    };
    return CustomToasterComponent;
}(Toast));
export { CustomToasterComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3VzdG9tLXRvYXN0ZXIuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL3J1bnRpbWUvYmFzZS8iLCJzb3VyY2VzIjpbImNvbXBvbmVudHMvY3VzdG9tLXRvYXN0ZXIuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQWlCLFNBQVMsRUFBRSxTQUFTLEVBQUUsZ0JBQWdCLEVBQUUsV0FBVyxFQUFhLE1BQU0sZUFBZSxDQUFDO0FBRTlHLE9BQU8sRUFBRSxLQUFLLEVBQUUsWUFBWSxFQUFFLGFBQWEsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUVoRSxPQUFPLEVBQUUsTUFBTSxFQUFFLFVBQVUsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUk5QztJQWE0QyxrREFBSztJQVE3QyxtREFBbUQ7SUFDbkQsZ0NBQ2MsYUFBNEIsRUFDL0IsWUFBMEI7UUFGckMsWUFJSSxrQkFBTSxhQUFhLEVBQUUsWUFBWSxDQUFDLFNBR3JDO1FBTmEsbUJBQWEsR0FBYixhQUFhLENBQWU7UUFDL0Isa0JBQVksR0FBWixZQUFZLENBQWM7UUFOckMsY0FBUSxHQUFRLEVBQUUsQ0FBQztRQUNuQixZQUFNLEdBQVEsRUFBRSxDQUFDO1FBUWIsS0FBSSxDQUFDLFFBQVEsR0FBRyxLQUFJLENBQUMsT0FBTyxJQUFJLEVBQUUsQ0FBQztRQUNuQyxLQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7O0lBQzFCLENBQUM7SUFFRCx5RkFBeUY7SUFDekYsK0NBQWMsR0FBZDtRQUFBLGlCQWdCQztRQWZHLENBQUMsQ0FBQyxPQUFPLENBQU8sSUFBSSxDQUFDLE9BQVEsQ0FBQyxhQUFhLEVBQUUsVUFBQyxLQUFLO1lBQy9DLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksS0FBSyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFO2dCQUMvRCxLQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQ3JCLEtBQUssQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUNmLEtBQUksQ0FBQyxPQUFRLENBQUMsT0FBTyxFQUMzQixFQUFFLEVBQ0YsVUFBQSxFQUFFO29CQUNFLEtBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztvQkFDN0IsVUFBVSxFQUFFLENBQUM7Z0JBQ2pCLENBQUMsQ0FDSixDQUFDLENBQUM7YUFDTjtpQkFBTTtnQkFDSCxLQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDO2FBQ3pDO1FBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUsseURBQXdCLEdBQTlCOzs7O2dCQUNVLGFBQWEsR0FBRyxDQUFDLENBQUMsc0JBQXNCLENBQUMsQ0FBQztnQkFFaEQsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFFNUIsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7OztLQUMzRztJQUVELGdEQUFlLEdBQWY7UUFDSSxJQUFJLENBQUMsd0JBQXdCLEVBQUUsQ0FBQztJQUNwQyxDQUFDO0lBRUQsNENBQVcsR0FBWDtRQUNJLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxVQUFBLE9BQU8sSUFBSSxPQUFBLE9BQU8sRUFBRSxFQUFULENBQVMsQ0FBQyxDQUFDO0lBQ25ELENBQUM7O2dCQWhFSixTQUFTLFNBQUM7b0JBQ1AsUUFBUSxFQUFFLDRCQUE0QjtvQkFDdEMsUUFBUSxFQUFFLCtaQVFTO29CQUNuQixtQkFBbUIsRUFBRSxLQUFLO2lCQUM3Qjs7OztnQkFsQjZCLGFBQWE7Z0JBQTNCLFlBQVk7OztpQ0FxQnZCLFNBQVMsU0FBQyxhQUFhLEVBQUUsRUFBQyxJQUFJLEVBQUUsZ0JBQWdCLEVBQUM7a0NBQ2pELFNBQVMsU0FBQyxpQkFBaUI7O0lBaURoQyw2QkFBQztDQUFBLEFBakVELENBYTRDLEtBQUssR0FvRGhEO1NBcERZLHNCQUFzQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFmdGVyVmlld0luaXQsIENvbXBvbmVudCwgVmlld0NoaWxkLCBWaWV3Q29udGFpbmVyUmVmLCBUZW1wbGF0ZVJlZiwgT25EZXN0cm95IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IFRvYXN0LCBUb2FzdFBhY2thZ2UsIFRvYXN0clNlcnZpY2UgfSBmcm9tICduZ3gtdG9hc3RyJztcblxuaW1wb3J0IHsgJHdhdGNoLCAkYXBwRGlnZXN0IH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5kZWNsYXJlIGNvbnN0IF8sICQ7XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnW2N1c3RvbS10b2FzdGVyLWNvbXBvbmVudF0nLFxuICAgIHRlbXBsYXRlOiBgXG4gICAgICAgIDxkaXYgY2xhc3M9XCJwYXJlbnQtY3VzdG9tLXRvYXN0XCI+PC9kaXY+XG4gICAgICAgIDxuZy1jb250YWluZXIgI2N1c3RvbVRvYXN0PjwvbmctY29udGFpbmVyPlxuICAgICAgICA8bmctdGVtcGxhdGUgI2N1c3RvbVRvYXN0VG1wbD5cbiAgICAgICAgICAgIDxkaXYgd21Db250YWluZXIgcGFydGlhbENvbnRhaW5lciBjb250ZW50LmJpbmQ9XCJwYWdlbmFtZVwiPlxuICAgICAgICAgICAgICAgIDxkaXYgKm5nRm9yPVwibGV0IHBhcmFtIG9mIHBhcmFtcyB8IGtleXZhbHVlXCIgd21QYXJhbSBoaWRkZW5cbiAgICAgICAgICAgICAgICAgICAgW25hbWVdPVwicGFyYW0ua2V5XCIgW3ZhbHVlXT1cInBhcmFtLnZhbHVlXCI+PC9kaXY+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9uZy10ZW1wbGF0ZT5gLFxuICAgIHByZXNlcnZlV2hpdGVzcGFjZXM6IGZhbHNlXG59KVxuZXhwb3J0IGNsYXNzIEN1c3RvbVRvYXN0ZXJDb21wb25lbnQgZXh0ZW5kcyBUb2FzdCBpbXBsZW1lbnRzIEFmdGVyVmlld0luaXQsIE9uRGVzdHJveSB7XG5cbiAgICBAVmlld0NoaWxkKCdjdXN0b21Ub2FzdCcsIHtyZWFkOiBWaWV3Q29udGFpbmVyUmVmfSkgY3VzdG9tVG9hc3RSZWY6IFZpZXdDb250YWluZXJSZWY7XG4gICAgQFZpZXdDaGlsZCgnY3VzdG9tVG9hc3RUbXBsJykgY3VzdG9tVG9hc3RUbXBsOiBUZW1wbGF0ZVJlZjxhbnk+O1xuICAgIHBhZ2VuYW1lOiBhbnk7XG4gICAgd2F0Y2hlcnM6IGFueSA9IFtdO1xuICAgIHBhcmFtczogYW55ID0ge307XG5cbiAgICAvLyBjb25zdHJ1Y3RvciBpcyBvbmx5IG5lY2Vzc2FyeSB3aGVuIG5vdCB1c2luZyBBb1RcbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgcHJvdGVjdGVkIHRvYXN0clNlcnZpY2U6IFRvYXN0clNlcnZpY2UsXG4gICAgICAgIHB1YmxpYyB0b2FzdFBhY2thZ2U6IFRvYXN0UGFja2FnZVxuICAgICkge1xuICAgICAgICBzdXBlcih0b2FzdHJTZXJ2aWNlLCB0b2FzdFBhY2thZ2UpO1xuICAgICAgICB0aGlzLnBhZ2VuYW1lID0gdGhpcy5tZXNzYWdlIHx8ICcnO1xuICAgICAgICB0aGlzLmdlbmVyYXRlUGFyYW1zKCk7XG4gICAgfVxuXG4gICAgLy8gR2VuZXJhdGUgdGhlIHBhcmFtcyBmb3IgcGFydGlhbCBwYWdlLiBJZiBib3VuZCwgd2F0Y2ggdGhlIGV4cHJlc3Npb24gYW5kIHNldCB0aGUgdmFsdWVcbiAgICBnZW5lcmF0ZVBhcmFtcygpIHtcbiAgICAgICAgXy5mb3JFYWNoKCg8YW55PnRoaXMub3B0aW9ucykucGFydGlhbFBhcmFtcywgKHBhcmFtKSA9PiB7XG4gICAgICAgICAgICBpZiAoXy5pc1N0cmluZyhwYXJhbS52YWx1ZSkgJiYgcGFyYW0udmFsdWUuaW5kZXhPZignYmluZDonKSA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMud2F0Y2hlcnMucHVzaCgkd2F0Y2goXG4gICAgICAgICAgICAgICAgICAgIHBhcmFtLnZhbHVlLnN1YnN0cig1KSxcbiAgICAgICAgICAgICAgICAgICAgKDxhbnk+dGhpcy5vcHRpb25zKS5jb250ZXh0LFxuICAgICAgICAgICAgICAgICAgICB7fSxcbiAgICAgICAgICAgICAgICAgICAgbnYgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJhbXNbcGFyYW0ubmFtZV0gPSBudjtcbiAgICAgICAgICAgICAgICAgICAgICAgICRhcHBEaWdlc3QoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICkpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmFtc1twYXJhbS5uYW1lXSA9IHBhcmFtLnZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhc3luYyBnZW5lcmF0ZUR5bmFtaWNDb21wb25lbnQoKSB7XG4gICAgICAgIGNvbnN0ICR0YXJnZXRMYXlvdXQgPSAkKCcucGFyZW50LWN1c3RvbS10b2FzdCcpO1xuXG4gICAgICAgIHRoaXMuY3VzdG9tVG9hc3RSZWYuY2xlYXIoKTtcblxuICAgICAgICAkdGFyZ2V0TGF5b3V0WzBdLmFwcGVuZENoaWxkKHRoaXMuY3VzdG9tVG9hc3RSZWYuY3JlYXRlRW1iZWRkZWRWaWV3KHRoaXMuY3VzdG9tVG9hc3RUbXBsKS5yb290Tm9kZXNbMF0pO1xuICAgIH1cblxuICAgIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcbiAgICAgICAgdGhpcy5nZW5lcmF0ZUR5bmFtaWNDb21wb25lbnQoKTtcbiAgICB9XG5cbiAgICBuZ09uRGVzdHJveSgpIHtcbiAgICAgICAgXy5mb3JFYWNoKHRoaXMud2F0Y2hlcnMsIHdhdGNoZXIgPT4gd2F0Y2hlcigpKTtcbiAgICB9XG59XG4iXX0=