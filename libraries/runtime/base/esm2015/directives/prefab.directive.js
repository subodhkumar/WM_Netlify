import * as tslib_1 from "tslib";
import { ComponentFactoryResolver, Directive, ElementRef, Inject, Injector, Self, ViewContainerRef } from '@angular/core';
import { WidgetRef } from '@wm/components';
import { PrefabManagerService } from '../services/prefab-manager.service';
import { ComponentRefProvider, ComponentType } from '../types/types';
export class PrefabDirective {
    constructor(componentInstance, vcRef, elRef, prefabMngr, resolver, injector, componentRefProvider) {
        this.componentInstance = componentInstance;
        this.vcRef = vcRef;
        this.elRef = elRef;
        this.prefabMngr = prefabMngr;
        this.resolver = resolver;
        this.injector = injector;
        this.componentRefProvider = componentRefProvider;
        const prefabName = this.componentInstance.prefabName;
        this.prefabMngr.loadDependencies(prefabName)
            .then(() => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const componentFactory = yield this.componentRefProvider.getComponentFactoryRef(prefabName, ComponentType.PREFAB);
            if (componentFactory) {
                const instanceRef = this.vcRef.createComponent(componentFactory, 0, injector);
                this.elRef.nativeElement.appendChild(instanceRef.location.nativeElement);
            }
        }));
    }
}
PrefabDirective.decorators = [
    { type: Directive, args: [{
                selector: '[wmPrefab][prefabname]'
            },] }
];
/** @nocollapse */
PrefabDirective.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Self }, { type: Inject, args: [WidgetRef,] }] },
    { type: ViewContainerRef },
    { type: ElementRef },
    { type: PrefabManagerService },
    { type: ComponentFactoryResolver },
    { type: Injector },
    { type: ComponentRefProvider }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlZmFiLmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9ydW50aW1lL2Jhc2UvIiwic291cmNlcyI6WyJkaXJlY3RpdmVzL3ByZWZhYi5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFDSCx3QkFBd0IsRUFDeEIsU0FBUyxFQUNULFVBQVUsRUFDVixNQUFNLEVBQ04sUUFBUSxFQUNSLElBQUksRUFDSixnQkFBZ0IsRUFDbkIsTUFBTSxlQUFlLENBQUM7QUFFdkIsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRTNDLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxNQUFNLG9DQUFvQyxDQUFDO0FBQzFFLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxhQUFhLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUtyRSxNQUFNLE9BQU8sZUFBZTtJQUV4QixZQUNzQyxpQkFBaUIsRUFDNUMsS0FBdUIsRUFDdkIsS0FBaUIsRUFDaEIsVUFBZ0MsRUFDaEMsUUFBa0MsRUFDbEMsUUFBa0IsRUFDbEIsb0JBQTBDO1FBTmhCLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBQTtRQUM1QyxVQUFLLEdBQUwsS0FBSyxDQUFrQjtRQUN2QixVQUFLLEdBQUwsS0FBSyxDQUFZO1FBQ2hCLGVBQVUsR0FBVixVQUFVLENBQXNCO1FBQ2hDLGFBQVEsR0FBUixRQUFRLENBQTBCO1FBQ2xDLGFBQVEsR0FBUixRQUFRLENBQVU7UUFDbEIseUJBQW9CLEdBQXBCLG9CQUFvQixDQUFzQjtRQUVsRCxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsVUFBVSxDQUFDO1FBRXJELElBQUksQ0FBQyxVQUFVLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxDQUFDO2FBQ3ZDLElBQUksQ0FBQyxHQUFTLEVBQUU7WUFDYixNQUFNLGdCQUFnQixHQUFHLE1BQU0sSUFBSSxDQUFDLG9CQUFvQixDQUFDLHNCQUFzQixDQUFDLFVBQVUsRUFBRSxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDbEgsSUFBSSxnQkFBZ0IsRUFBRTtnQkFDbEIsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxlQUFlLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDO2dCQUM5RSxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQzthQUM1RTtRQUNMLENBQUMsQ0FBQSxDQUFDLENBQUM7SUFDWCxDQUFDOzs7WUF4QkosU0FBUyxTQUFDO2dCQUNQLFFBQVEsRUFBRSx3QkFBd0I7YUFDckM7Ozs7NENBSVEsSUFBSSxZQUFJLE1BQU0sU0FBQyxTQUFTO1lBZDdCLGdCQUFnQjtZQUpoQixVQUFVO1lBU0wsb0JBQW9CO1lBWHpCLHdCQUF3QjtZQUl4QixRQUFRO1lBUUgsb0JBQW9CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtcbiAgICBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIsXG4gICAgRGlyZWN0aXZlLFxuICAgIEVsZW1lbnRSZWYsXG4gICAgSW5qZWN0LFxuICAgIEluamVjdG9yLFxuICAgIFNlbGYsXG4gICAgVmlld0NvbnRhaW5lclJlZlxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgV2lkZ2V0UmVmIH0gZnJvbSAnQHdtL2NvbXBvbmVudHMnO1xuXG5pbXBvcnQgeyBQcmVmYWJNYW5hZ2VyU2VydmljZSB9IGZyb20gJy4uL3NlcnZpY2VzL3ByZWZhYi1tYW5hZ2VyLnNlcnZpY2UnO1xuaW1wb3J0IHsgQ29tcG9uZW50UmVmUHJvdmlkZXIsIENvbXBvbmVudFR5cGUgfSBmcm9tICcuLi90eXBlcy90eXBlcyc7XG5cbkBEaXJlY3RpdmUoe1xuICAgIHNlbGVjdG9yOiAnW3dtUHJlZmFiXVtwcmVmYWJuYW1lXSdcbn0pXG5leHBvcnQgY2xhc3MgUHJlZmFiRGlyZWN0aXZlIHtcblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBAU2VsZigpIEBJbmplY3QoV2lkZ2V0UmVmKSBwdWJsaWMgY29tcG9uZW50SW5zdGFuY2UsXG4gICAgICAgIHB1YmxpYyB2Y1JlZjogVmlld0NvbnRhaW5lclJlZixcbiAgICAgICAgcHVibGljIGVsUmVmOiBFbGVtZW50UmVmLFxuICAgICAgICBwcml2YXRlIHByZWZhYk1uZ3I6IFByZWZhYk1hbmFnZXJTZXJ2aWNlLFxuICAgICAgICBwcml2YXRlIHJlc29sdmVyOiBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXIsXG4gICAgICAgIHByaXZhdGUgaW5qZWN0b3I6IEluamVjdG9yLFxuICAgICAgICBwcml2YXRlIGNvbXBvbmVudFJlZlByb3ZpZGVyOiBDb21wb25lbnRSZWZQcm92aWRlclxuICAgICkge1xuICAgICAgICBjb25zdCBwcmVmYWJOYW1lID0gdGhpcy5jb21wb25lbnRJbnN0YW5jZS5wcmVmYWJOYW1lO1xuXG4gICAgICAgIHRoaXMucHJlZmFiTW5nci5sb2FkRGVwZW5kZW5jaWVzKHByZWZhYk5hbWUpXG4gICAgICAgICAgICAudGhlbihhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgY29tcG9uZW50RmFjdG9yeSA9IGF3YWl0IHRoaXMuY29tcG9uZW50UmVmUHJvdmlkZXIuZ2V0Q29tcG9uZW50RmFjdG9yeVJlZihwcmVmYWJOYW1lLCBDb21wb25lbnRUeXBlLlBSRUZBQik7XG4gICAgICAgICAgICAgICAgaWYgKGNvbXBvbmVudEZhY3RvcnkpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaW5zdGFuY2VSZWYgPSB0aGlzLnZjUmVmLmNyZWF0ZUNvbXBvbmVudChjb21wb25lbnRGYWN0b3J5LCAwLCBpbmplY3Rvcik7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZWxSZWYubmF0aXZlRWxlbWVudC5hcHBlbmRDaGlsZChpbnN0YW5jZVJlZi5sb2NhdGlvbi5uYXRpdmVFbGVtZW50KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICB9XG59XG4iXX0=