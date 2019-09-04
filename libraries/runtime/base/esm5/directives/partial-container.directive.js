import * as tslib_1 from "tslib";
import { Attribute, ComponentFactoryResolver, Directive, ElementRef, Inject, Injector, Self, ViewContainerRef } from '@angular/core';
import { debounceTime, filter } from 'rxjs/operators';
import { App, $invokeWatchers, noop } from '@wm/core';
import { WidgetRef } from '@wm/components';
import { ComponentRefProvider, ComponentType, PartialRefProvider } from '../types/types';
var PartialContainerDirective = /** @class */ (function () {
    function PartialContainerDirective(componentInstance, vcRef, elRef, inj, app, _content, resolver, componentRefProvider, partialRefProvider) {
        var _this = this;
        this.componentInstance = componentInstance;
        this.vcRef = vcRef;
        this.elRef = elRef;
        this.inj = inj;
        this.app = app;
        this.resolver = resolver;
        this.componentRefProvider = componentRefProvider;
        this.partialRefProvider = partialRefProvider;
        this.contentInitialized = false;
        this.renderPartial = _.debounce(this._renderPartial, 200, { leading: true });
        componentInstance.registerPropertyChangeListener(function (key, nv, ov) {
            if (key === 'content') {
                if (componentInstance.$lazyLoad) {
                    componentInstance.$lazyLoad = function () {
                        _this.renderPartial(nv);
                        componentInstance.$lazyLoad = noop;
                    };
                }
                else {
                    _this.renderPartial(nv);
                }
            }
        });
        var subscription = componentInstance.params$
            .pipe(filter(function () { return _this.contentInitialized; }), debounceTime(200))
            .subscribe(function () { return _this.renderPartial(componentInstance.content); });
        // reload the partial content on partial param change
        componentInstance.registerDestroyListener(function () { return subscription.unsubscribe(); });
    }
    Object.defineProperty(PartialContainerDirective.prototype, "name", {
        get: function () {
            return this.componentInstance.name;
        },
        enumerable: true,
        configurable: true
    });
    PartialContainerDirective.prototype._renderPartial = function (nv) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var componentFactory, instanceRef;
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // destroy the existing partial
                        this.vcRef.clear();
                        // when the container-target is inside the component template, it can be queried after viewInit of the component.
                        $invokeWatchers(true);
                        return [4 /*yield*/, this.partialRefProvider.getComponentFactoryRef(nv, ComponentType.PARTIAL)];
                    case 1:
                        componentFactory = _a.sent();
                        if (componentFactory) {
                            instanceRef = this.vcRef.createComponent(componentFactory, 0, this.inj);
                            if (!this.$target) {
                                this.$target = this.elRef.nativeElement.querySelector('[partial-container-target]') || this.elRef.nativeElement;
                            }
                            this.$target.innerHTML = '';
                            this.$target.appendChild(instanceRef.location.nativeElement);
                            this.contentInitialized = true;
                            setTimeout(function () { return _this.onLoadSuccess(); }, 200);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    PartialContainerDirective.prototype.onLoadSuccess = function () {
        this.componentInstance.invokeEventCallback('load');
        this.app.notify('partialLoaded');
    };
    PartialContainerDirective.decorators = [
        { type: Directive, args: [{
                    selector: '[partialContainer]'
                },] }
    ];
    /** @nocollapse */
    PartialContainerDirective.ctorParameters = function () { return [
        { type: undefined, decorators: [{ type: Self }, { type: Inject, args: [WidgetRef,] }] },
        { type: ViewContainerRef },
        { type: ElementRef },
        { type: Injector },
        { type: App },
        { type: String, decorators: [{ type: Attribute, args: ['content',] }] },
        { type: ComponentFactoryResolver },
        { type: ComponentRefProvider },
        { type: PartialRefProvider }
    ]; };
    return PartialContainerDirective;
}());
export { PartialContainerDirective };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFydGlhbC1jb250YWluZXIuZGlyZWN0aXZlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL3J1bnRpbWUvYmFzZS8iLCJzb3VyY2VzIjpbImRpcmVjdGl2ZXMvcGFydGlhbC1jb250YWluZXIuZGlyZWN0aXZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLHdCQUF3QixFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFckksT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUV0RCxPQUFPLEVBQUUsR0FBRyxFQUFFLGVBQWUsRUFBRSxJQUFJLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFdEQsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRTNDLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxhQUFhLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUl6RjtJQXlDSSxtQ0FDc0MsaUJBQWlCLEVBQzVDLEtBQXVCLEVBQ3ZCLEtBQWlCLEVBQ2pCLEdBQWEsRUFDWixHQUFRLEVBQ00sUUFBZ0IsRUFDOUIsUUFBa0MsRUFDbEMsb0JBQTBDLEVBQzFDLGtCQUFzQztRQVRsRCxpQkFpQ0M7UUFoQ3FDLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBQTtRQUM1QyxVQUFLLEdBQUwsS0FBSyxDQUFrQjtRQUN2QixVQUFLLEdBQUwsS0FBSyxDQUFZO1FBQ2pCLFFBQUcsR0FBSCxHQUFHLENBQVU7UUFDWixRQUFHLEdBQUgsR0FBRyxDQUFLO1FBRVIsYUFBUSxHQUFSLFFBQVEsQ0FBMEI7UUFDbEMseUJBQW9CLEdBQXBCLG9CQUFvQixDQUFzQjtRQUMxQyx1QkFBa0IsR0FBbEIsa0JBQWtCLENBQW9CO1FBN0MxQyx1QkFBa0IsR0FBRyxLQUFLLENBQUM7UUE0Qm5DLGtCQUFhLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLEdBQUcsRUFBRSxFQUFDLE9BQU8sRUFBRSxJQUFJLEVBQUMsQ0FBQyxDQUFDO1FBb0JsRSxpQkFBaUIsQ0FBQyw4QkFBOEIsQ0FBQyxVQUFDLEdBQVcsRUFBRSxFQUFPLEVBQUUsRUFBUTtZQUM1RSxJQUFJLEdBQUcsS0FBSyxTQUFTLEVBQUU7Z0JBQ25CLElBQUksaUJBQWlCLENBQUMsU0FBUyxFQUFFO29CQUM3QixpQkFBaUIsQ0FBQyxTQUFTLEdBQUc7d0JBQzFCLEtBQUksQ0FBQyxhQUFhLENBQUMsRUFBRSxDQUFDLENBQUM7d0JBQ3ZCLGlCQUFpQixDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7b0JBQ3ZDLENBQUMsQ0FBQztpQkFDTDtxQkFBTTtvQkFDSCxLQUFJLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2lCQUMxQjthQUNKO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFNLFlBQVksR0FBRyxpQkFBaUIsQ0FBQyxPQUFPO2FBQ3pDLElBQUksQ0FDRCxNQUFNLENBQUMsY0FBTSxPQUFBLEtBQUksQ0FBQyxrQkFBa0IsRUFBdkIsQ0FBdUIsQ0FBQyxFQUNyQyxZQUFZLENBQUMsR0FBRyxDQUFDLENBQ3BCO2FBQ0EsU0FBUyxDQUFDLGNBQU0sT0FBQSxLQUFJLENBQUMsYUFBYSxDQUFDLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxFQUE3QyxDQUE2QyxDQUFDLENBQUM7UUFDcEUscURBQXFEO1FBQ3JELGlCQUFpQixDQUFDLHVCQUF1QixDQUFDLGNBQU0sT0FBQSxZQUFZLENBQUMsV0FBVyxFQUFFLEVBQTFCLENBQTBCLENBQUMsQ0FBQztJQUNoRixDQUFDO0lBbEVELHNCQUFJLDJDQUFJO2FBQVI7WUFDSSxPQUFPLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUM7UUFDdkMsQ0FBQzs7O09BQUE7SUFFSyxrREFBYyxHQUFwQixVQUFxQixFQUFFOzs7Ozs7O3dCQUNuQiwrQkFBK0I7d0JBQy9CLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7d0JBQ25CLGlIQUFpSDt3QkFDakgsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO3dCQUVHLHFCQUFNLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxzQkFBc0IsQ0FBQyxFQUFFLEVBQUUsYUFBYSxDQUFDLE9BQU8sQ0FBQyxFQUFBOzt3QkFBbEcsZ0JBQWdCLEdBQUcsU0FBK0U7d0JBQ3hHLElBQUksZ0JBQWdCLEVBQUU7NEJBQ1osV0FBVyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsZUFBZSxDQUFDLGdCQUFnQixFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7NEJBRTlFLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFO2dDQUNmLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLDRCQUE0QixDQUFDLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUM7NkJBQ25IOzRCQUVELElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQzs0QkFDNUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQzs0QkFDN0QsSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQzs0QkFDL0IsVUFBVSxDQUFDLGNBQU0sT0FBQSxLQUFJLENBQUMsYUFBYSxFQUFFLEVBQXBCLENBQW9CLEVBQUUsR0FBRyxDQUFDLENBQUM7eUJBQy9DOzs7OztLQUNKO0lBSUQsaURBQWEsR0FBYjtRQUNJLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxtQkFBbUIsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUVuRCxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUNyQyxDQUFDOztnQkF2Q0osU0FBUyxTQUFDO29CQUNQLFFBQVEsRUFBRSxvQkFBb0I7aUJBQ2pDOzs7O2dEQXdDUSxJQUFJLFlBQUksTUFBTSxTQUFDLFNBQVM7Z0JBdEQ0RCxnQkFBZ0I7Z0JBQXBELFVBQVU7Z0JBQVUsUUFBUTtnQkFJNUUsR0FBRzs2Q0F1REgsU0FBUyxTQUFDLFNBQVM7Z0JBM0RSLHdCQUF3QjtnQkFRbkMsb0JBQW9CO2dCQUFpQixrQkFBa0I7O0lBK0VoRSxnQ0FBQztDQUFBLEFBM0VELElBMkVDO1NBeEVZLHlCQUF5QiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEF0dHJpYnV0ZSwgQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyLCBEaXJlY3RpdmUsIEVsZW1lbnRSZWYsIEluamVjdCwgSW5qZWN0b3IsIFNlbGYsIFZpZXdDb250YWluZXJSZWYgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgZGVib3VuY2VUaW1lLCBmaWx0ZXIgfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmltcG9ydCB7IEFwcCwgJGludm9rZVdhdGNoZXJzLCBub29wIH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5pbXBvcnQgeyBXaWRnZXRSZWYgfSBmcm9tICdAd20vY29tcG9uZW50cyc7XG5cbmltcG9ydCB7IENvbXBvbmVudFJlZlByb3ZpZGVyLCBDb21wb25lbnRUeXBlLCBQYXJ0aWFsUmVmUHJvdmlkZXIgfSBmcm9tICcuLi90eXBlcy90eXBlcyc7XG5cbmRlY2xhcmUgY29uc3QgXztcblxuQERpcmVjdGl2ZSh7XG4gICAgc2VsZWN0b3I6ICdbcGFydGlhbENvbnRhaW5lcl0nXG59KVxuZXhwb3J0IGNsYXNzIFBhcnRpYWxDb250YWluZXJEaXJlY3RpdmUge1xuXG4gICAgcHJpdmF0ZSBjb250ZW50SW5pdGlhbGl6ZWQgPSBmYWxzZTtcbiAgICBwcml2YXRlICR0YXJnZXQ7XG5cbiAgICBnZXQgbmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29tcG9uZW50SW5zdGFuY2UubmFtZTtcbiAgICB9XG5cbiAgICBhc3luYyBfcmVuZGVyUGFydGlhbChudikge1xuICAgICAgICAvLyBkZXN0cm95IHRoZSBleGlzdGluZyBwYXJ0aWFsXG4gICAgICAgIHRoaXMudmNSZWYuY2xlYXIoKTtcbiAgICAgICAgLy8gd2hlbiB0aGUgY29udGFpbmVyLXRhcmdldCBpcyBpbnNpZGUgdGhlIGNvbXBvbmVudCB0ZW1wbGF0ZSwgaXQgY2FuIGJlIHF1ZXJpZWQgYWZ0ZXIgdmlld0luaXQgb2YgdGhlIGNvbXBvbmVudC5cbiAgICAgICAgJGludm9rZVdhdGNoZXJzKHRydWUpO1xuXG4gICAgICAgIGNvbnN0IGNvbXBvbmVudEZhY3RvcnkgPSBhd2FpdCB0aGlzLnBhcnRpYWxSZWZQcm92aWRlci5nZXRDb21wb25lbnRGYWN0b3J5UmVmKG52LCBDb21wb25lbnRUeXBlLlBBUlRJQUwpO1xuICAgICAgICBpZiAoY29tcG9uZW50RmFjdG9yeSkge1xuICAgICAgICAgICAgY29uc3QgaW5zdGFuY2VSZWYgPSB0aGlzLnZjUmVmLmNyZWF0ZUNvbXBvbmVudChjb21wb25lbnRGYWN0b3J5LCAwLCB0aGlzLmluaik7XG5cbiAgICAgICAgICAgIGlmICghdGhpcy4kdGFyZ2V0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy4kdGFyZ2V0ID0gdGhpcy5lbFJlZi5uYXRpdmVFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ1twYXJ0aWFsLWNvbnRhaW5lci10YXJnZXRdJykgfHwgdGhpcy5lbFJlZi5uYXRpdmVFbGVtZW50O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLiR0YXJnZXQuaW5uZXJIVE1MID0gJyc7XG4gICAgICAgICAgICB0aGlzLiR0YXJnZXQuYXBwZW5kQ2hpbGQoaW5zdGFuY2VSZWYubG9jYXRpb24ubmF0aXZlRWxlbWVudCk7XG4gICAgICAgICAgICB0aGlzLmNvbnRlbnRJbml0aWFsaXplZCA9IHRydWU7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHRoaXMub25Mb2FkU3VjY2VzcygpLCAyMDApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmVuZGVyUGFydGlhbCA9IF8uZGVib3VuY2UodGhpcy5fcmVuZGVyUGFydGlhbCwgMjAwLCB7bGVhZGluZzogdHJ1ZX0pO1xuXG4gICAgb25Mb2FkU3VjY2VzcygpIHtcbiAgICAgICAgdGhpcy5jb21wb25lbnRJbnN0YW5jZS5pbnZva2VFdmVudENhbGxiYWNrKCdsb2FkJyk7XG5cbiAgICAgICAgdGhpcy5hcHAubm90aWZ5KCdwYXJ0aWFsTG9hZGVkJyk7XG4gICAgfVxuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIEBTZWxmKCkgQEluamVjdChXaWRnZXRSZWYpIHB1YmxpYyBjb21wb25lbnRJbnN0YW5jZSxcbiAgICAgICAgcHVibGljIHZjUmVmOiBWaWV3Q29udGFpbmVyUmVmLFxuICAgICAgICBwdWJsaWMgZWxSZWY6IEVsZW1lbnRSZWYsXG4gICAgICAgIHB1YmxpYyBpbmo6IEluamVjdG9yLFxuICAgICAgICBwcml2YXRlIGFwcDogQXBwLFxuICAgICAgICBAQXR0cmlidXRlKCdjb250ZW50JykgX2NvbnRlbnQ6IHN0cmluZyxcbiAgICAgICAgcHJpdmF0ZSByZXNvbHZlcjogQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyLFxuICAgICAgICBwcml2YXRlIGNvbXBvbmVudFJlZlByb3ZpZGVyOiBDb21wb25lbnRSZWZQcm92aWRlcixcbiAgICAgICAgcHJpdmF0ZSBwYXJ0aWFsUmVmUHJvdmlkZXI6IFBhcnRpYWxSZWZQcm92aWRlclxuICAgICkge1xuXG4gICAgICAgIGNvbXBvbmVudEluc3RhbmNlLnJlZ2lzdGVyUHJvcGVydHlDaGFuZ2VMaXN0ZW5lcigoa2V5OiBzdHJpbmcsIG52OiBhbnksIG92PzogYW55KSA9PiB7XG4gICAgICAgICAgICBpZiAoa2V5ID09PSAnY29udGVudCcpIHtcbiAgICAgICAgICAgICAgICBpZiAoY29tcG9uZW50SW5zdGFuY2UuJGxhenlMb2FkKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudEluc3RhbmNlLiRsYXp5TG9hZCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyUGFydGlhbChudik7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRJbnN0YW5jZS4kbGF6eUxvYWQgPSBub29wO1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyUGFydGlhbChudik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBjb25zdCBzdWJzY3JpcHRpb24gPSBjb21wb25lbnRJbnN0YW5jZS5wYXJhbXMkXG4gICAgICAgICAgICAucGlwZShcbiAgICAgICAgICAgICAgICBmaWx0ZXIoKCkgPT4gdGhpcy5jb250ZW50SW5pdGlhbGl6ZWQpLFxuICAgICAgICAgICAgICAgIGRlYm91bmNlVGltZSgyMDApXG4gICAgICAgICAgICApXG4gICAgICAgICAgICAuc3Vic2NyaWJlKCgpID0+IHRoaXMucmVuZGVyUGFydGlhbChjb21wb25lbnRJbnN0YW5jZS5jb250ZW50KSk7XG4gICAgICAgIC8vIHJlbG9hZCB0aGUgcGFydGlhbCBjb250ZW50IG9uIHBhcnRpYWwgcGFyYW0gY2hhbmdlXG4gICAgICAgIGNvbXBvbmVudEluc3RhbmNlLnJlZ2lzdGVyRGVzdHJveUxpc3RlbmVyKCgpID0+IHN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpKTtcbiAgICB9XG59XG4iXX0=