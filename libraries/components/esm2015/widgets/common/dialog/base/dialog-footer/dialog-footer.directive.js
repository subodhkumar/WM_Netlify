import { Directive, Injector } from '@angular/core';
import { BaseComponent } from '../../../base/base.component';
import { registerProps } from './dialog-footer.props';
import { provideAsWidgetRef } from '../../../../../utils/widget-utils';
const WIDGET_INFO = {
    widgetType: 'wm-dialogfooter',
    hostClass: 'app-dialog-footer modal-footer'
};
export class DialogFooterDirective extends BaseComponent {
    constructor(inj) {
        super(inj, WIDGET_INFO);
    }
}
DialogFooterDirective.initializeProps = registerProps();
DialogFooterDirective.decorators = [
    { type: Directive, args: [{
                selector: 'div[wmDialogFooter]',
                providers: [
                    provideAsWidgetRef(DialogFooterDirective)
                ]
            },] }
];
/** @nocollapse */
DialogFooterDirective.ctorParameters = () => [
    { type: Injector }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nLWZvb3Rlci5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL2RpYWxvZy9iYXNlL2RpYWxvZy1mb290ZXIvZGlhbG9nLWZvb3Rlci5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFHcEQsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBQzdELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUN0RCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxtQ0FBbUMsQ0FBQztBQUV2RSxNQUFNLFdBQVcsR0FBa0I7SUFDL0IsVUFBVSxFQUFFLGlCQUFpQjtJQUM3QixTQUFTLEVBQUUsZ0NBQWdDO0NBQzlDLENBQUM7QUFRRixNQUFNLE9BQU8scUJBQXNCLFNBQVEsYUFBYTtJQUdwRCxZQUFZLEdBQWE7UUFDckIsS0FBSyxDQUFDLEdBQUcsRUFBRSxXQUFXLENBQUMsQ0FBQztJQUM1QixDQUFDOztBQUpNLHFDQUFlLEdBQUcsYUFBYSxFQUFFLENBQUM7O1lBUDVDLFNBQVMsU0FBQztnQkFDUCxRQUFRLEVBQUUscUJBQXFCO2dCQUMvQixTQUFTLEVBQUU7b0JBQ1Asa0JBQWtCLENBQUMscUJBQXFCLENBQUM7aUJBQzVDO2FBQ0o7Ozs7WUFqQm1CLFFBQVEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEaXJlY3RpdmUsIEluamVjdG9yIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IElXaWRnZXRDb25maWcgfSBmcm9tICcuLi8uLi8uLi8uLi9mcmFtZXdvcmsvdHlwZXMnO1xuaW1wb3J0IHsgQmFzZUNvbXBvbmVudCB9IGZyb20gJy4uLy4uLy4uL2Jhc2UvYmFzZS5jb21wb25lbnQnO1xuaW1wb3J0IHsgcmVnaXN0ZXJQcm9wcyB9IGZyb20gJy4vZGlhbG9nLWZvb3Rlci5wcm9wcyc7XG5pbXBvcnQgeyBwcm92aWRlQXNXaWRnZXRSZWYgfSBmcm9tICcuLi8uLi8uLi8uLi8uLi91dGlscy93aWRnZXQtdXRpbHMnO1xuXG5jb25zdCBXSURHRVRfSU5GTzogSVdpZGdldENvbmZpZyA9IHtcbiAgICB3aWRnZXRUeXBlOiAnd20tZGlhbG9nZm9vdGVyJyxcbiAgICBob3N0Q2xhc3M6ICdhcHAtZGlhbG9nLWZvb3RlciBtb2RhbC1mb290ZXInXG59O1xuXG5ARGlyZWN0aXZlKHtcbiAgICBzZWxlY3RvcjogJ2Rpdlt3bURpYWxvZ0Zvb3Rlcl0nLFxuICAgIHByb3ZpZGVyczogW1xuICAgICAgICBwcm92aWRlQXNXaWRnZXRSZWYoRGlhbG9nRm9vdGVyRGlyZWN0aXZlKVxuICAgIF1cbn0pXG5leHBvcnQgY2xhc3MgRGlhbG9nRm9vdGVyRGlyZWN0aXZlIGV4dGVuZHMgQmFzZUNvbXBvbmVudCB7XG4gICAgc3RhdGljIGluaXRpYWxpemVQcm9wcyA9IHJlZ2lzdGVyUHJvcHMoKTtcblxuICAgIGNvbnN0cnVjdG9yKGluajogSW5qZWN0b3IpIHtcbiAgICAgICAgc3VwZXIoaW5qLCBXSURHRVRfSU5GTyk7XG4gICAgfVxufVxuIl19