import { Directive, Injector } from '@angular/core';
import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './layout-grid.props';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
const DEFAULT_CLS = 'app-grid-layout clearfix';
const WIDGET_CONFIG = {
    widgetType: 'wm-layoutgrid',
    hostClass: DEFAULT_CLS
};
export class LayoutgridDirective extends StylableComponent {
    constructor(inj) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);
    }
}
LayoutgridDirective.initializeProps = registerProps();
LayoutgridDirective.decorators = [
    { type: Directive, args: [{
                selector: '[wmLayoutGrid]',
                providers: [
                    provideAsWidgetRef(LayoutgridDirective)
                ]
            },] }
];
/** @nocollapse */
LayoutgridDirective.ctorParameters = () => [
    { type: Injector }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGF5b3V0LWdyaWQuZGlyZWN0aXZlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2NvbW1vbi9sYXlvdXQtZ3JpZC9sYXlvdXQtZ3JpZC5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFcEQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBRW5FLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQy9ELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxxQkFBcUIsQ0FBQztBQUNwRCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUVqRSxNQUFNLFdBQVcsR0FBRywwQkFBMEIsQ0FBQztBQUMvQyxNQUFNLGFBQWEsR0FBa0I7SUFDakMsVUFBVSxFQUFFLGVBQWU7SUFDM0IsU0FBUyxFQUFFLFdBQVc7Q0FDekIsQ0FBQztBQVFGLE1BQU0sT0FBTyxtQkFBb0IsU0FBUSxpQkFBaUI7SUFHdEQsWUFBWSxHQUFhO1FBQ3JCLEtBQUssQ0FBQyxHQUFHLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFFMUIsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsSUFBSSxFQUFFLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ2xFLENBQUM7O0FBTk0sbUNBQWUsR0FBRyxhQUFhLEVBQUUsQ0FBQzs7WUFQNUMsU0FBUyxTQUFDO2dCQUNQLFFBQVEsRUFBRSxnQkFBZ0I7Z0JBQzFCLFNBQVMsRUFBRTtvQkFDUCxrQkFBa0IsQ0FBQyxtQkFBbUIsQ0FBQztpQkFDMUM7YUFDSjs7OztZQW5CbUIsUUFBUSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IERpcmVjdGl2ZSwgSW5qZWN0b3IgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgQVBQTFlfU1RZTEVTX1RZUEUsIHN0eWxlciB9IGZyb20gJy4uLy4uL2ZyYW1ld29yay9zdHlsZXInO1xuaW1wb3J0IHsgSVdpZGdldENvbmZpZyB9IGZyb20gJy4uLy4uL2ZyYW1ld29yay90eXBlcyc7XG5pbXBvcnQgeyBTdHlsYWJsZUNvbXBvbmVudCB9IGZyb20gJy4uL2Jhc2Uvc3R5bGFibGUuY29tcG9uZW50JztcbmltcG9ydCB7IHJlZ2lzdGVyUHJvcHMgfSBmcm9tICcuL2xheW91dC1ncmlkLnByb3BzJztcbmltcG9ydCB7IHByb3ZpZGVBc1dpZGdldFJlZiB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL3dpZGdldC11dGlscyc7XG5cbmNvbnN0IERFRkFVTFRfQ0xTID0gJ2FwcC1ncmlkLWxheW91dCBjbGVhcmZpeCc7XG5jb25zdCBXSURHRVRfQ09ORklHOiBJV2lkZ2V0Q29uZmlnID0ge1xuICAgIHdpZGdldFR5cGU6ICd3bS1sYXlvdXRncmlkJyxcbiAgICBob3N0Q2xhc3M6IERFRkFVTFRfQ0xTXG59O1xuXG5ARGlyZWN0aXZlKHtcbiAgICBzZWxlY3RvcjogJ1t3bUxheW91dEdyaWRdJyxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgcHJvdmlkZUFzV2lkZ2V0UmVmKExheW91dGdyaWREaXJlY3RpdmUpXG4gICAgXVxufSlcbmV4cG9ydCBjbGFzcyBMYXlvdXRncmlkRGlyZWN0aXZlIGV4dGVuZHMgU3R5bGFibGVDb21wb25lbnQge1xuICAgIHN0YXRpYyBpbml0aWFsaXplUHJvcHMgPSByZWdpc3RlclByb3BzKCk7XG5cbiAgICBjb25zdHJ1Y3Rvcihpbmo6IEluamVjdG9yKSB7XG4gICAgICAgIHN1cGVyKGluaiwgV0lER0VUX0NPTkZJRyk7XG5cbiAgICAgICAgc3R5bGVyKHRoaXMubmF0aXZlRWxlbWVudCwgdGhpcywgQVBQTFlfU1RZTEVTX1RZUEUuQ09OVEFJTkVSKTtcbiAgICB9XG59XG4iXX0=