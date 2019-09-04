import * as tslib_1 from "tslib";
import { Attribute, ComponentFactoryResolver, Directive, ElementRef, Inject, Injector, Self, ViewContainerRef } from '@angular/core';
import { debounceTime, filter } from 'rxjs/operators';
import { App, $invokeWatchers, noop } from '@wm/core';
import { WidgetRef } from '@wm/components';
import { ComponentRefProvider, ComponentType, PartialRefProvider } from '../types/types';
export class PartialContainerDirective {
    constructor(componentInstance, vcRef, elRef, inj, app, _content, resolver, componentRefProvider, partialRefProvider) {
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
        componentInstance.registerPropertyChangeListener((key, nv, ov) => {
            if (key === 'content') {
                if (componentInstance.$lazyLoad) {
                    componentInstance.$lazyLoad = () => {
                        this.renderPartial(nv);
                        componentInstance.$lazyLoad = noop;
                    };
                }
                else {
                    this.renderPartial(nv);
                }
            }
        });
        const subscription = componentInstance.params$
            .pipe(filter(() => this.contentInitialized), debounceTime(200))
            .subscribe(() => this.renderPartial(componentInstance.content));
        // reload the partial content on partial param change
        componentInstance.registerDestroyListener(() => subscription.unsubscribe());
    }
    get name() {
        return this.componentInstance.name;
    }
    _renderPartial(nv) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            // destroy the existing partial
            this.vcRef.clear();
            // when the container-target is inside the component template, it can be queried after viewInit of the component.
            $invokeWatchers(true);
            const componentFactory = yield this.partialRefProvider.getComponentFactoryRef(nv, ComponentType.PARTIAL);
            if (componentFactory) {
                const instanceRef = this.vcRef.createComponent(componentFactory, 0, this.inj);
                if (!this.$target) {
                    this.$target = this.elRef.nativeElement.querySelector('[partial-container-target]') || this.elRef.nativeElement;
                }
                this.$target.innerHTML = '';
                this.$target.appendChild(instanceRef.location.nativeElement);
                this.contentInitialized = true;
                setTimeout(() => this.onLoadSuccess(), 200);
            }
        });
    }
    onLoadSuccess() {
        this.componentInstance.invokeEventCallback('load');
        this.app.notify('partialLoaded');
    }
}
PartialContainerDirective.decorators = [
    { type: Directive, args: [{
                selector: '[partialContainer]'
            },] }
];
/** @nocollapse */
PartialContainerDirective.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Self }, { type: Inject, args: [WidgetRef,] }] },
    { type: ViewContainerRef },
    { type: ElementRef },
    { type: Injector },
    { type: App },
    { type: String, decorators: [{ type: Attribute, args: ['content',] }] },
    { type: ComponentFactoryResolver },
    { type: ComponentRefProvider },
    { type: PartialRefProvider }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFydGlhbC1jb250YWluZXIuZGlyZWN0aXZlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL3J1bnRpbWUvYmFzZS8iLCJzb3VyY2VzIjpbImRpcmVjdGl2ZXMvcGFydGlhbC1jb250YWluZXIuZGlyZWN0aXZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLHdCQUF3QixFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFckksT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUV0RCxPQUFPLEVBQUUsR0FBRyxFQUFFLGVBQWUsRUFBRSxJQUFJLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFdEQsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRTNDLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxhQUFhLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQU96RixNQUFNLE9BQU8seUJBQXlCO0lBc0NsQyxZQUNzQyxpQkFBaUIsRUFDNUMsS0FBdUIsRUFDdkIsS0FBaUIsRUFDakIsR0FBYSxFQUNaLEdBQVEsRUFDTSxRQUFnQixFQUM5QixRQUFrQyxFQUNsQyxvQkFBMEMsRUFDMUMsa0JBQXNDO1FBUlosc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFBO1FBQzVDLFVBQUssR0FBTCxLQUFLLENBQWtCO1FBQ3ZCLFVBQUssR0FBTCxLQUFLLENBQVk7UUFDakIsUUFBRyxHQUFILEdBQUcsQ0FBVTtRQUNaLFFBQUcsR0FBSCxHQUFHLENBQUs7UUFFUixhQUFRLEdBQVIsUUFBUSxDQUEwQjtRQUNsQyx5QkFBb0IsR0FBcEIsb0JBQW9CLENBQXNCO1FBQzFDLHVCQUFrQixHQUFsQixrQkFBa0IsQ0FBb0I7UUE3QzFDLHVCQUFrQixHQUFHLEtBQUssQ0FBQztR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RCxnQkFBZ0I7WUFBcEQsVUFBVTtZQUFVLFFBQVE7WUFJNUUsR0FBRzt5Q0F1REgsU0FBUyxTQUFDLFNBQVM7WUEzRFIsd0JBQXdCO1lBUW5DLG9CQUFvQjtZQUFpQixrQkFBa0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBdHRyaWJ1dGUsIENvbXBvbmVudEZhY3RvcnlSZXNvbHZlciwgRGlyZWN0aXZlLCBFbGVtZW50UmVmLCBJbmplY3QsIEluamVjdG9yLCBTZWxmLCBWaWV3Q29udGFpbmVyUmVmIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IGRlYm91bmNlVGltZSwgZmlsdGVyIH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG5pbXBvcnQgeyBBcHAsICRpbnZva2VXYXRjaGVycywgbm9vcCB9IGZyb20gJ0B3bS9jb3JlJztcblxuaW1wb3J0IHsgV2lkZ2V0UmVmIH0gZnJvbSAnQHdtL2NvbXBvbmVudHMnO1xuXG5pbXBvcnQgeyBDb21wb25lbnRSZWZQcm92aWRlciwgQ29tcG9uZW50VHlwZSwgUGFydGlhbFJlZlByb3ZpZGVyIH0gZnJvbSAnLi4vdHlwZXMvdHlwZXMnO1xuXG5kZWNsYXJlIGNvbnN0IF87XG5cbkBEaXJlY3RpdmUoe1xuICAgIHNlbGVjdG9yOiAnW3BhcnRpYWxDb250YWluZXJdJ1xufSlcbmV4cG9ydCBjbGFzcyBQYXJ0aWFsQ29udGFpbmVyRGlyZWN0aXZlIHtcblxuICAgIHByaXZhdGUgY29udGVudEluaXRpYWxpemVkID0gZmFsc2U7XG4gICAgcHJpdmF0ZSAkdGFyZ2V0O1xuXG4gICAgZ2V0IG5hbWUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbXBvbmVudEluc3RhbmNlLm5hbWU7XG4gICAgfVxuXG4gICAgYXN5bmMgX3JlbmRlclBhcnRpYWwobnYpIHtcbiAgICAgICAgLy8gZGVzdHJveSB0aGUgZXhpc3RpbmcgcGFydGlhbFxuICAgICAgICB0aGlzLnZjUmVmLmNsZWFyKCk7XG4gICAgICAgIC8vIHdoZW4gdGhlIGNvbnRhaW5lci10YXJnZXQgaXMgaW5zaWRlIHRoZSBjb21wb25lbnQgdGVtcGxhdGUsIGl0IGNhbiBiZSBxdWVyaWVkIGFmdGVyIHZpZXdJbml0IG9mIHRoZSBjb21wb25lbnQuXG4gICAgICAgICRpbnZva2VXYXRjaGVycyh0cnVlKTtcblxuICAgICAgICBjb25zdCBjb21wb25lbnRGYWN0b3J5ID0gYXdhaXQgdGhpcy5wYXJ0aWFsUmVmUHJvdmlkZXIuZ2V0Q29tcG9uZW50RmFjdG9yeVJlZihudiwgQ29tcG9uZW50VHlwZS5QQVJUSUFMKTtcbiAgICAgICAgaWYgKGNvbXBvbmVudEZhY3RvcnkpIHtcbiAgICAgICAgICAgIGNvbnN0IGluc3RhbmNlUmVmID0gdGhpcy52Y1JlZi5jcmVhdGVDb21wb25lbnQoY29tcG9uZW50RmFjdG9yeSwgMCwgdGhpcy5pbmopO1xuXG4gICAgICAgICAgICBpZiAoIXRoaXMuJHRhcmdldCkge1xuICAgICAgICAgICAgICAgIHRoaXMuJHRhcmdldCA9IHRoaXMuZWxSZWYubmF0aXZlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCdbcGFydGlhbC1jb250YWluZXItdGFyZ2V0XScpIHx8IHRoaXMuZWxSZWYubmF0aXZlRWxlbWVudDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy4kdGFyZ2V0LmlubmVySFRNTCA9ICcnO1xuICAgICAgICAgICAgdGhpcy4kdGFyZ2V0LmFwcGVuZENoaWxkKGluc3RhbmNlUmVmLmxvY2F0aW9uLm5hdGl2ZUVsZW1lbnQpO1xuICAgICAgICAgICAgdGhpcy5jb250ZW50SW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB0aGlzLm9uTG9hZFN1Y2Nlc3MoKSwgMjAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlbmRlclBhcnRpYWwgPSBfLmRlYm91bmNlKHRoaXMuX3JlbmRlclBhcnRpYWwsIDIwMCwge2xlYWRpbmc6IHRydWV9KTtcblxuICAgIG9uTG9hZFN1Y2Nlc3MoKSB7XG4gICAgICAgIHRoaXMuY29tcG9uZW50SW5zdGFuY2UuaW52b2tlRXZlbnRDYWxsYmFjaygnbG9hZCcpO1xuXG4gICAgICAgIHRoaXMuYXBwLm5vdGlmeSgncGFydGlhbExvYWRlZCcpO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBAU2VsZigpIEBJbmplY3QoV2lkZ2V0UmVmKSBwdWJsaWMgY29tcG9uZW50SW5zdGFuY2UsXG4gICAgICAgIHB1YmxpYyB2Y1JlZjogVmlld0NvbnRhaW5lclJlZixcbiAgICAgICAgcHVibGljIGVsUmVmOiBFbGVtZW50UmVmLFxuICAgICAgICBwdWJsaWMgaW5qOiBJbmplY3RvcixcbiAgICAgICAgcHJpdmF0ZSBhcHA6IEFwcCxcbiAgICAgICAgQEF0dHJpYnV0ZSgnY29udGVudCcpIF9jb250ZW50OiBzdHJpbmcsXG4gICAgICAgIHByaXZhdGUgcmVzb2x2ZXI6IENvbXBvbmVudEZhY3RvcnlSZXNvbHZlcixcbiAgICAgICAgcHJpdmF0ZSBjb21wb25lbnRSZWZQcm92aWRlcjogQ29tcG9uZW50UmVmUHJvdmlkZXIsXG4gICAgICAgIHByaXZhdGUgcGFydGlhbFJlZlByb3ZpZGVyOiBQYXJ0aWFsUmVmUHJvdmlkZXJcbiAgICApIHtcblxuICAgICAgICBjb21wb25lbnRJbnN0YW5jZS5yZWdpc3RlclByb3BlcnR5Q2hhbmdlTGlzdGVuZXIoKGtleTogc3RyaW5nLCBudjogYW55LCBvdj86IGFueSkgPT4ge1xuICAgICAgICAgICAgaWYgKGtleSA9PT0gJ2NvbnRlbnQnKSB7XG4gICAgICAgICAgICAgICAgaWYgKGNvbXBvbmVudEluc3RhbmNlLiRsYXp5TG9hZCkge1xuICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRJbnN0YW5jZS4kbGF6eUxvYWQgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbmRlclBhcnRpYWwobnYpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50SW5zdGFuY2UuJGxhenlMb2FkID0gbm9vcDtcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbmRlclBhcnRpYWwobnYpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgY29uc3Qgc3Vic2NyaXB0aW9uID0gY29tcG9uZW50SW5zdGFuY2UucGFyYW1zJFxuICAgICAgICAgICAgLnBpcGUoXG4gICAgICAgICAgICAgICAgZmlsdGVyKCgpID0+IHRoaXMuY29udGVudEluaXRpYWxpemVkKSxcbiAgICAgICAgICAgICAgICBkZWJvdW5jZVRpbWUoMjAwKVxuICAgICAgICAgICAgKVxuICAgICAgICAgICAgLnN1YnNjcmliZSgoKSA9PiB0aGlzLnJlbmRlclBhcnRpYWwoY29tcG9uZW50SW5zdGFuY2UuY29udGVudCkpO1xuICAgICAgICAvLyByZWxvYWQgdGhlIHBhcnRpYWwgY29udGVudCBvbiBwYXJ0aWFsIHBhcmFtIGNoYW5nZVxuICAgICAgICBjb21wb25lbnRJbnN0YW5jZS5yZWdpc3RlckRlc3Ryb3lMaXN0ZW5lcigoKSA9PiBzdWJzY3JpcHRpb24udW5zdWJzY3JpYmUoKSk7XG4gICAgfVxufVxuIl19