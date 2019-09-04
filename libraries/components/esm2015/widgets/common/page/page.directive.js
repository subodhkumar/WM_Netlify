import { Directive, Injector } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { EventNotifier } from '@wm/core';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './page.props';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
import { updateDeviceView } from '../../framework/deviceview';
const DEFAULT_CLS = 'app-page container';
const WIDGET_CONFIG = { widgetType: 'wm-page', hostClass: DEFAULT_CLS };
export class PageDirective extends StylableComponent {
    constructor(inj, titleService) {
        super(inj, WIDGET_CONFIG);
        this.titleService = titleService;
        this._eventNotifier = new EventNotifier(false);
    }
    onPropertyChange(key, nv, ov) {
        if (key === 'pagetitle') {
            this.titleService.setTitle(nv);
        }
        else {
            super.onPropertyChange(key, nv, ov);
        }
    }
    /**
     * A child component can notify page using this method. Notified event will be passed to
     * subscribed children only after page initialization.
     *
     * @param {string} eventName
     * @param data
     */
    notify(eventName, ...data) {
        this._eventNotifier.notify.apply(this._eventNotifier, arguments);
    }
    /**
     * The main purpose of this function is to provide communication between page children objects.
     * Child component can subscribe for an event that will be emitted by another child component.
     *
     * @param eventName
     * @param {(data: any) => void} callback
     * @returns {any}
     */
    subscribe(eventName, callback) {
        return this._eventNotifier.subscribe(eventName, callback);
    }
    ngAfterViewInit() {
        setTimeout(() => {
            this._eventNotifier.start();
            updateDeviceView(this.nativeElement, this.getAppInstance().isTabletApplicationType);
        }, 1);
    }
    ngOnDestroy() {
        this._eventNotifier.destroy();
    }
}
PageDirective.initializeProps = registerProps();
PageDirective.decorators = [
    { type: Directive, args: [{
                selector: '[wmPage]',
                providers: [
                    provideAsWidgetRef(PageDirective)
                ]
            },] }
];
/** @nocollapse */
PageDirective.ctorParameters = () => [
    { type: Injector },
    { type: Title }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFnZS5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL3BhZ2UvcGFnZS5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFpQixTQUFTLEVBQUUsUUFBUSxFQUFhLE1BQU0sZUFBZSxDQUFDO0FBQzlFLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUVsRCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRXpDLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQy9ELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFDN0MsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDakUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFFOUQsTUFBTSxXQUFXLEdBQUcsb0JBQW9CLENBQUM7QUFDekMsTUFBTSxhQUFhLEdBQUcsRUFBQyxVQUFVLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUMsQ0FBQztBQVF0RSxNQUFNLE9BQU8sYUFBYyxTQUFRLGlCQUFpQjtJQWFoRCxZQUFZLEdBQWEsRUFBVSxZQUFtQjtRQUNsRCxLQUFLLENBQUMsR0FBRyxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBREssaUJBQVksR0FBWixZQUFZLENBQU87UUFWOUMsbUJBQWMsR0FBRyxJQUFJLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQVlsRCxDQUFDO0lBVkQsZ0JBQWdCLENBQUMsR0FBVyxFQUFFLEVBQU8sRUFBRSxFQUFRO1FBQzNDLElBQUksR0FBRyxLQUFLLFdBQVcsRUFBRTtZQUNyQixJQUFJLENBQUMsWUFBWSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztTQUNsQzthQUFNO1lBQ0gsS0FBSyxDQUFDLGdCQUFnQixDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7U0FDdkM7SUFDTCxDQUFDO0lBTUQ7Ozs7OztPQU1HO0lBQ0ksTUFBTSxDQUFDLFNBQWlCLEVBQUUsR0FBRyxJQUFnQjtRQUNoRCxJQUFJLENBQUMsY0FBYyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxTQUFTLENBQUMsQ0FBQztJQUNyRSxDQUFDO0lBRUQ7Ozs7Ozs7T0FPRztJQUNJLFNBQVMsQ0FBQyxTQUFTLEVBQUUsUUFBNkI7UUFDckQsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDOUQsQ0FBQztJQUVNLGVBQWU7UUFDbEIsVUFBVSxDQUFDLEdBQUcsRUFBRTtZQUNaLElBQUksQ0FBQyxjQUFjLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDNUIsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUMsdUJBQXVCLENBQUMsQ0FBQztRQUN4RixDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDVixDQUFDO0lBRU0sV0FBVztRQUNkLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDbEMsQ0FBQzs7QUFoRE0sNkJBQWUsR0FBRyxhQUFhLEVBQUUsQ0FBQzs7WUFQNUMsU0FBUyxTQUFDO2dCQUNQLFFBQVEsRUFBRSxVQUFVO2dCQUNwQixTQUFTLEVBQUU7b0JBQ1Asa0JBQWtCLENBQUMsYUFBYSxDQUFDO2lCQUNwQzthQUNKOzs7O1lBbEJrQyxRQUFRO1lBQ2xDLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBZnRlclZpZXdJbml0LCBEaXJlY3RpdmUsIEluamVjdG9yLCBPbkRlc3Ryb3kgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFRpdGxlIH0gZnJvbSAnQGFuZ3VsYXIvcGxhdGZvcm0tYnJvd3Nlcic7XG5cbmltcG9ydCB7IEV2ZW50Tm90aWZpZXIgfSBmcm9tICdAd20vY29yZSc7XG5cbmltcG9ydCB7IFN0eWxhYmxlQ29tcG9uZW50IH0gZnJvbSAnLi4vYmFzZS9zdHlsYWJsZS5jb21wb25lbnQnO1xuaW1wb3J0IHsgcmVnaXN0ZXJQcm9wcyB9IGZyb20gJy4vcGFnZS5wcm9wcyc7XG5pbXBvcnQgeyBwcm92aWRlQXNXaWRnZXRSZWYgfSBmcm9tICcuLi8uLi8uLi91dGlscy93aWRnZXQtdXRpbHMnO1xuaW1wb3J0IHsgdXBkYXRlRGV2aWNlVmlldyB9IGZyb20gJy4uLy4uL2ZyYW1ld29yay9kZXZpY2V2aWV3JztcblxuY29uc3QgREVGQVVMVF9DTFMgPSAnYXBwLXBhZ2UgY29udGFpbmVyJztcbmNvbnN0IFdJREdFVF9DT05GSUcgPSB7d2lkZ2V0VHlwZTogJ3dtLXBhZ2UnLCBob3N0Q2xhc3M6IERFRkFVTFRfQ0xTfTtcblxuQERpcmVjdGl2ZSh7XG4gICAgc2VsZWN0b3I6ICdbd21QYWdlXScsXG4gICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIHByb3ZpZGVBc1dpZGdldFJlZihQYWdlRGlyZWN0aXZlKVxuICAgIF1cbn0pXG5leHBvcnQgY2xhc3MgUGFnZURpcmVjdGl2ZSBleHRlbmRzIFN0eWxhYmxlQ29tcG9uZW50IGltcGxlbWVudHMgQWZ0ZXJWaWV3SW5pdCwgT25EZXN0cm95IHtcbiAgICBzdGF0aWMgaW5pdGlhbGl6ZVByb3BzID0gcmVnaXN0ZXJQcm9wcygpO1xuXG4gICAgcHJpdmF0ZSBfZXZlbnROb3RpZmllciA9IG5ldyBFdmVudE5vdGlmaWVyKGZhbHNlKTtcblxuICAgIG9uUHJvcGVydHlDaGFuZ2Uoa2V5OiBzdHJpbmcsIG52OiBhbnksIG92PzogYW55KSB7XG4gICAgICAgIGlmIChrZXkgPT09ICdwYWdldGl0bGUnKSB7XG4gICAgICAgICAgICB0aGlzLnRpdGxlU2VydmljZS5zZXRUaXRsZShudik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdXBlci5vblByb3BlcnR5Q2hhbmdlKGtleSwgbnYsIG92KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKGluajogSW5qZWN0b3IsIHByaXZhdGUgdGl0bGVTZXJ2aWNlOiBUaXRsZSkge1xuICAgICAgICBzdXBlcihpbmosIFdJREdFVF9DT05GSUcpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEEgY2hpbGQgY29tcG9uZW50IGNhbiBub3RpZnkgcGFnZSB1c2luZyB0aGlzIG1ldGhvZC4gTm90aWZpZWQgZXZlbnQgd2lsbCBiZSBwYXNzZWQgdG9cbiAgICAgKiBzdWJzY3JpYmVkIGNoaWxkcmVuIG9ubHkgYWZ0ZXIgcGFnZSBpbml0aWFsaXphdGlvbi5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBldmVudE5hbWVcbiAgICAgKiBAcGFyYW0gZGF0YVxuICAgICAqL1xuICAgIHB1YmxpYyBub3RpZnkoZXZlbnROYW1lOiBzdHJpbmcsIC4uLmRhdGE6IEFycmF5PGFueT4pIHtcbiAgICAgICAgdGhpcy5fZXZlbnROb3RpZmllci5ub3RpZnkuYXBwbHkodGhpcy5fZXZlbnROb3RpZmllciwgYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGUgbWFpbiBwdXJwb3NlIG9mIHRoaXMgZnVuY3Rpb24gaXMgdG8gcHJvdmlkZSBjb21tdW5pY2F0aW9uIGJldHdlZW4gcGFnZSBjaGlsZHJlbiBvYmplY3RzLlxuICAgICAqIENoaWxkIGNvbXBvbmVudCBjYW4gc3Vic2NyaWJlIGZvciBhbiBldmVudCB0aGF0IHdpbGwgYmUgZW1pdHRlZCBieSBhbm90aGVyIGNoaWxkIGNvbXBvbmVudC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBldmVudE5hbWVcbiAgICAgKiBAcGFyYW0geyhkYXRhOiBhbnkpID0+IHZvaWR9IGNhbGxiYWNrXG4gICAgICogQHJldHVybnMge2FueX1cbiAgICAgKi9cbiAgICBwdWJsaWMgc3Vic2NyaWJlKGV2ZW50TmFtZSwgY2FsbGJhY2s6IChkYXRhOiBhbnkpID0+IHZvaWQpOiAoKSA9PiB2b2lkIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2V2ZW50Tm90aWZpZXIuc3Vic2NyaWJlKGV2ZW50TmFtZSwgY2FsbGJhY2spO1xuICAgIH1cblxuICAgIHB1YmxpYyBuZ0FmdGVyVmlld0luaXQoKSB7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5fZXZlbnROb3RpZmllci5zdGFydCgpO1xuICAgICAgICAgICAgdXBkYXRlRGV2aWNlVmlldyh0aGlzLm5hdGl2ZUVsZW1lbnQsIHRoaXMuZ2V0QXBwSW5zdGFuY2UoKS5pc1RhYmxldEFwcGxpY2F0aW9uVHlwZSk7XG4gICAgICAgIH0sIDEpO1xuICAgIH1cblxuICAgIHB1YmxpYyBuZ09uRGVzdHJveSgpIHtcbiAgICAgICAgdGhpcy5fZXZlbnROb3RpZmllci5kZXN0cm95KCk7XG4gICAgfVxufVxuIl19