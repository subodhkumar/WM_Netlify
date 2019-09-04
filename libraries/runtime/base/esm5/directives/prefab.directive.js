import * as tslib_1 from "tslib";
import { ComponentFactoryResolver, Directive, ElementRef, Inject, Injector, Self, ViewContainerRef } from '@angular/core';
import { WidgetRef } from '@wm/components';
import { PrefabManagerService } from '../services/prefab-manager.service';
import { ComponentRefProvider, ComponentType } from '../types/types';
var PrefabDirective = /** @class */ (function () {
    function PrefabDirective(componentInstance, vcRef, elRef, prefabMngr, resolver, injector, componentRefProvider) {
        var _this = this;
        this.componentInstance = componentInstance;
        this.vcRef = vcRef;
        this.elRef = elRef;
        this.prefabMngr = prefabMngr;
        this.resolver = resolver;
        this.injector = injector;
        this.componentRefProvider = componentRefProvider;
        var prefabName = this.componentInstance.prefabName;
        this.prefabMngr.loadDependencies(prefabName)
            .then(function () { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var componentFactory, instanceRef;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.componentRefProvider.getComponentFactoryRef(prefabName, ComponentType.PREFAB)];
                    case 1:
                        componentFactory = _a.sent();
                        if (componentFactory) {
                            instanceRef = this.vcRef.createComponent(componentFactory, 0, injector);
                            this.elRef.nativeElement.appendChild(instanceRef.location.nativeElement);
                        }
                        return [2 /*return*/];
                }
            });
        }); });
    }
    PrefabDirective.decorators = [
        { type: Directive, args: [{
                    selector: '[wmPrefab][prefabname]'
                },] }
    ];
    /** @nocollapse */
    PrefabDirective.ctorParameters = function () { return [
        { type: undefined, decorators: [{ type: Self }, { type: Inject, args: [WidgetRef,] }] },
        { type: ViewContainerRef },
        { type: ElementRef },
        { type: PrefabManagerService },
        { type: ComponentFactoryResolver },
        { type: Injector },
        { type: ComponentRefProvider }
    ]; };
    return PrefabDirective;
}());
export { PrefabDirective };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlZmFiLmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9ydW50aW1lL2Jhc2UvIiwic291cmNlcyI6WyJkaXJlY3RpdmVzL3ByZWZhYi5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFDSCx3QkFBd0IsRUFDeEIsU0FBUyxFQUNULFVBQVUsRUFDVixNQUFNLEVBQ04sUUFBUSxFQUNSLElBQUksRUFDSixnQkFBZ0IsRUFDbkIsTUFBTSxlQUFlLENBQUM7QUFFdkIsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRTNDLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLG9DQUFvQyxDQUFDO0FBQzFFLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxhQUFhLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUVyRTtJQUtJLHlCQUNzQyxpQkFBaUIsRUFDNUMsS0FBdUIsRUFDdkIsS0FBaUIsRUFDaEIsVUFBZ0MsRUFDaEMsUUFBa0MsRUFDbEMsUUFBa0IsRUFDbEIsb0JBQTBDO1FBUHRELGlCQW1CQztRQWxCcUMsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFBO1FBQzVDLFVBQUssR0FBTCxLQUFLLENBQWtCO1FBQ3ZCLFVBQUssR0FBTCxLQUFLLENBQVk7UUFDaEIsZUFBVSxHQUFWLFVBQVUsQ0FBc0I7UUFDaEMsYUFBUSxHQUFSLFFBQVEsQ0FBMEI7UUFDbEMsYUFBUSxHQUFSLFFBQVEsQ0FBVTtRQUNsQix5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXNCO1FBRWxELElBQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxVQUFVLENBQUM7UUFFckQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLENBQUM7YUFDdkMsSUFBSSxDQUFDOzs7OzRCQUN1QixxQkFBTSxJQUFJLENBQUMsb0JBQW9CLENBQUMsc0JBQXNCLENBQUMsVUFBVSxFQUFFLGFBQWEsQ0FBQyxNQUFNLENBQUMsRUFBQTs7d0JBQTNHLGdCQUFnQixHQUFHLFNBQXdGO3dCQUNqSCxJQUFJLGdCQUFnQixFQUFFOzRCQUNaLFdBQVcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUM7NEJBQzlFLElBQUksQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxDQUFDO3lCQUM1RTs7OzthQUNKLENBQUMsQ0FBQztJQUNYLENBQUM7O2dCQXhCSixTQUFTLFNBQUM7b0JBQ1AsUUFBUSxFQUFFLHdCQUF3QjtpQkFDckM7Ozs7Z0RBSVEsSUFBSSxZQUFJLE1BQU0sU0FBQyxTQUFTO2dCQWQ3QixnQkFBZ0I7Z0JBSmhCLFVBQVU7Z0JBU0wsb0JBQW9CO2dCQVh6Qix3QkFBd0I7Z0JBSXhCLFFBQVE7Z0JBUUgsb0JBQW9COztJQTJCN0Isc0JBQUM7Q0FBQSxBQXpCRCxJQXlCQztTQXRCWSxlQUFlIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgICBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIsXG4gICAgRGlyZWN0aXZlLFxuICAgIEVsZW1lbnRSZWYsXG4gICAgSW5qZWN0LFxuICAgIEluamVjdG9yLFxuICAgIFNlbGYsXG4gICAgVmlld0NvbnRhaW5lclJlZlxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgV2lkZ2V0UmVmIH0gZnJvbSAnQHdtL2NvbXBvbmVudHMnO1xuXG5pbXBvcnQgeyBQcmVmYWJNYW5hZ2VyU2VydmljZSB9IGZyb20gJy4uL3NlcnZpY2VzL3ByZWZhYi1tYW5hZ2VyLnNlcnZpY2UnO1xuaW1wb3J0IHsgQ29tcG9uZW50UmVmUHJvdmlkZXIsIENvbXBvbmVudFR5cGUgfSBmcm9tICcuLi90eXBlcy90eXBlcyc7XG5cbkBEaXJlY3RpdmUoe1xuICAgIHNlbGVjdG9yOiAnW3dtUHJlZmFiXVtwcmVmYWJuYW1lXSdcbn0pXG5leHBvcnQgY2xhc3MgUHJlZmFiRGlyZWN0aXZlIHtcblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBAU2VsZigpIEBJbmplY3QoV2lkZ2V0UmVmKSBwdWJsaWMgY29tcG9uZW50SW5zdGFuY2UsXG4gICAgICAgIHB1YmxpYyB2Y1JlZjogVmlld0NvbnRhaW5lclJlZixcbiAgICAgICAgcHVibGljIGVsUmVmOiBFbGVtZW50UmVmLFxuICAgICAgICBwcml2YXRlIHByZWZhYk1uZ3I6IFByZWZhYk1hbmFnZXJTZXJ2aWNlLFxuICAgICAgICBwcml2YXRlIHJlc29sdmVyOiBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIsXG4gICAgICAgIHByaXZhdGUgaW5qZWN0b3I6IEluamVjdG9yLFxuICAgICAgICBwcml2YXRlIGNvbXBvbmVudFJlZlByb3ZpZGVyOiBDb21wb25lbnRSZWZQcm92aWRlclxuICAgICkge1xuICAgICAgICBjb25zdCBwcmVmYWJOYW1lID0gdGhpcy5jb21wb25lbnRJbnN0YW5jZS5wcmVmYWJOYW1lO1xuXG4gICAgICAgIHRoaXMucHJlZmFiTW5nci5sb2FkRGVwZW5kZW5jaWVzKHByZWZhYk5hbWUpXG4gICAgICAgICAgICAudGhlbihhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgY29tcG9uZW50RmFjdG9yeSA9IGF3YWl0IHRoaXMuY29tcG9uZW50UmVmUHJvdmlkZXIuZ2V0Q29tcG9uZW50RmFjdG9yeVJlZihwcmVmYWJOYW1lLCBDb21wb25lbnRUeXBlLlBSRUZBQik7XG4gICAgICAgICAgICAgICAgaWYgKGNvbXBvbmVudEZhY3RvcnkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaW5zdGFuY2VSZWYgPSB0aGlzLnZjUmVmLmNyZWF0ZUNvbXBvbmVudChjb21wb25lbnRGYWN0b3J5LCAwLCBpbmplY3Rvcik7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZWxSZWYubmF0aXZlRWxlbWVudC5hcHBlbmRDaGlsZChpbnN0YW5jZVJlZi5sb2NhdGlvbi5uYXRpdmVFbGVtZW50KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICB9XG59XG4iXX0=