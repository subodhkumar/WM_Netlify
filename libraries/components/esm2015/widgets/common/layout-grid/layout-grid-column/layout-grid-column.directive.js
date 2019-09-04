import { Attribute, Directive, Injector } from '@angular/core';
import { isMobileApp, setCSS, switchClass } from '@wm/core';
import { APPLY_STYLES_TYPE, styler } from '../../../framework/styler';
import { StylableComponent } from '../../base/stylable.component';
import { registerProps } from './layout-grid-column.props';
import { provideAsWidgetRef } from '../../../../utils/widget-utils';
const DEFAULT_CLS = 'app-grid-column';
const WIDGET_CONFIG = {
    widgetType: 'wm-gridcolumn',
    hostClass: DEFAULT_CLS
};
export class LayoutGridColumnDirective extends StylableComponent {
    constructor(inj, height) {
        super(inj, WIDGET_CONFIG);
        // if the height is provided set the overflow to auto
        if (height) {
            setCSS(this.nativeElement, 'overflow', 'auto');
        }
        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);
    }
    onPropertyChange(key, nv, ov) {
        const prefix = isMobileApp() ? 'xs' : 'sm';
        if (key === 'columnwidth') {
            switchClass(this.nativeElement, `col-${prefix}-${nv}`, ov ? `col-${prefix}-${ov}` : '');
        }
        else {
            super.onPropertyChange(key, nv, ov);
        }
    }
}
LayoutGridColumnDirective.initializeProps = registerProps();
LayoutGridColumnDirective.decorators = [
    { type: Directive, args: [{
                selector: '[wmLayoutGridColumn]',
                providers: [
                    provideAsWidgetRef(LayoutGridColumnDirective)
                ]
            },] }
];
/** @nocollapse */
LayoutGridColumnDirective.ctorParameters = () => [
    { type: Injector },
    { type: undefined, decorators: [{ type: Attribute, args: ['height',] }] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGF5b3V0LWdyaWQtY29sdW1uLmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vbGF5b3V0LWdyaWQvbGF5b3V0LWdyaWQtY29sdW1uL2xheW91dC1ncmlkLWNvbHVtbi5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRS9ELE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxFQUFFLFdBQVcsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUU1RCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFFdEUsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFDbEUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQzNELE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBRXBFLE1BQU0sV0FBVyxHQUFHLGlCQUFpQixDQUFDO0FBQ3RDLE1BQU0sYUFBYSxHQUFrQjtJQUNqQyxVQUFVLEVBQUUsZUFBZTtJQUMzQixTQUFTLEVBQUUsV0FBVztDQUN6QixDQUFDO0FBUUYsTUFBTSxPQUFPLHlCQUEwQixTQUFRLGlCQUFpQjtJQUU1RCxZQUFZLEdBQWEsRUFBdUIsTUFBTTtRQUNsRCxLQUFLLENBQUMsR0FBRyxFQUFFLGFBQWEsQ0FBQyxDQUFDO1FBRTFCLHFEQUFxRDtRQUNyRCxJQUFJLE1BQU0sRUFBRTtZQUNSLE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLFVBQVUsRUFBRSxNQUFNLENBQUMsQ0FBQztTQUNsRDtRQUVELE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLElBQUksRUFBRSxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNsRSxDQUFDO0lBRUQsZ0JBQWdCLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFHO1FBQ3pCLE1BQU0sTUFBTSxHQUFHLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztRQUMzQyxJQUFJLEdBQUcsS0FBSyxhQUFhLEVBQUU7WUFDdkIsV0FBVyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsT0FBTyxNQUFNLElBQUksRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxPQUFPLE1BQU0sSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDM0Y7YUFBTTtZQUNILEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1NBQ3ZDO0lBQ0wsQ0FBQzs7QUFuQk0seUNBQWUsR0FBRyxhQUFhLEVBQUUsQ0FBQzs7WUFQNUMsU0FBUyxTQUFDO2dCQUNQLFFBQVEsRUFBRSxzQkFBc0I7Z0JBQ2hDLFNBQVMsRUFBRTtvQkFDUCxrQkFBa0IsQ0FBQyx5QkFBeUIsQ0FBQztpQkFDaEQ7YUFDSjs7OztZQXJCOEIsUUFBUTs0Q0F3QlAsU0FBUyxTQUFDLFFBQVEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBdHRyaWJ1dGUsIERpcmVjdGl2ZSwgSW5qZWN0b3IgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgaXNNb2JpbGVBcHAsIHNldENTUywgc3dpdGNoQ2xhc3MgfSBmcm9tICdAd20vY29yZSc7XG5cbmltcG9ydCB7IEFQUExZX1NUWUxFU19UWVBFLCBzdHlsZXIgfSBmcm9tICcuLi8uLi8uLi9mcmFtZXdvcmsvc3R5bGVyJztcbmltcG9ydCB7IElXaWRnZXRDb25maWcgfSBmcm9tICcuLi8uLi8uLi9mcmFtZXdvcmsvdHlwZXMnO1xuaW1wb3J0IHsgU3R5bGFibGVDb21wb25lbnQgfSBmcm9tICcuLi8uLi9iYXNlL3N0eWxhYmxlLmNvbXBvbmVudCc7XG5pbXBvcnQgeyByZWdpc3RlclByb3BzIH0gZnJvbSAnLi9sYXlvdXQtZ3JpZC1jb2x1bW4ucHJvcHMnO1xuaW1wb3J0IHsgcHJvdmlkZUFzV2lkZ2V0UmVmIH0gZnJvbSAnLi4vLi4vLi4vLi4vdXRpbHMvd2lkZ2V0LXV0aWxzJztcblxuY29uc3QgREVGQVVMVF9DTFMgPSAnYXBwLWdyaWQtY29sdW1uJztcbmNvbnN0IFdJREdFVF9DT05GSUc6IElXaWRnZXRDb25maWcgPSB7XG4gICAgd2lkZ2V0VHlwZTogJ3dtLWdyaWRjb2x1bW4nLFxuICAgIGhvc3RDbGFzczogREVGQVVMVF9DTFNcbn07XG5cbkBEaXJlY3RpdmUoe1xuICAgIHNlbGVjdG9yOiAnW3dtTGF5b3V0R3JpZENvbHVtbl0nLFxuICAgIHByb3ZpZGVyczogW1xuICAgICAgICBwcm92aWRlQXNXaWRnZXRSZWYoTGF5b3V0R3JpZENvbHVtbkRpcmVjdGl2ZSlcbiAgICBdXG59KVxuZXhwb3J0IGNsYXNzIExheW91dEdyaWRDb2x1bW5EaXJlY3RpdmUgZXh0ZW5kcyBTdHlsYWJsZUNvbXBvbmVudCB7XG4gICAgc3RhdGljIGluaXRpYWxpemVQcm9wcyA9IHJlZ2lzdGVyUHJvcHMoKTtcbiAgICBjb25zdHJ1Y3Rvcihpbmo6IEluamVjdG9yLCBAQXR0cmlidXRlKCdoZWlnaHQnKSBoZWlnaHQpIHtcbiAgICAgICAgc3VwZXIoaW5qLCBXSURHRVRfQ09ORklHKTtcblxuICAgICAgICAvLyBpZiB0aGUgaGVpZ2h0IGlzIHByb3ZpZGVkIHNldCB0aGUgb3ZlcmZsb3cgdG8gYXV0b1xuICAgICAgICBpZiAoaGVpZ2h0KSB7XG4gICAgICAgICAgICBzZXRDU1ModGhpcy5uYXRpdmVFbGVtZW50LCAnb3ZlcmZsb3cnLCAnYXV0bycpO1xuICAgICAgICB9XG5cbiAgICAgICAgc3R5bGVyKHRoaXMubmF0aXZlRWxlbWVudCwgdGhpcywgQVBQTFlfU1RZTEVTX1RZUEUuQ09OVEFJTkVSKTtcbiAgICB9XG5cbiAgICBvblByb3BlcnR5Q2hhbmdlKGtleSwgbnYsIG92Pykge1xuICAgICAgICBjb25zdCBwcmVmaXggPSBpc01vYmlsZUFwcCgpID8gJ3hzJyA6ICdzbSc7XG4gICAgICAgIGlmIChrZXkgPT09ICdjb2x1bW53aWR0aCcpIHtcbiAgICAgICAgICAgIHN3aXRjaENsYXNzKHRoaXMubmF0aXZlRWxlbWVudCwgYGNvbC0ke3ByZWZpeH0tJHtudn1gLCBvdiA/IGBjb2wtJHtwcmVmaXh9LSR7b3Z9YCA6ICcnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN1cGVyLm9uUHJvcGVydHlDaGFuZ2Uoa2V5LCBudiwgb3YpO1xuICAgICAgICB9XG4gICAgfVxufVxuIl19