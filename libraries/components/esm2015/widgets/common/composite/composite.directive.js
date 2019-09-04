import { ContentChildren, Directive, Injector } from '@angular/core';
import { addForIdAttributes, switchClass } from '@wm/core';
import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { WidgetRef } from '../../framework/types';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './composite.props';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
const DEFAULT_CLS = 'form-group app-composite-widget clearfix';
const WIDGET_CONFIG = {
    widgetType: 'wm-form-group',
    hostClass: DEFAULT_CLS
};
const CAPTION_POSITION = {
    left: 'caption-left',
    right: 'caption-right',
    top: 'caption-top'
};
export class CompositeDirective extends StylableComponent {
    constructor(inj) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);
    }
    /**
     * this is onPropertyChange handler for the form-group component
     * @param key
     * @param nv
     * @param ov
     */
    onPropertyChange(key, nv, ov) {
        if (key === 'captionposition') {
            switchClass(this.nativeElement, CAPTION_POSITION[nv], CAPTION_POSITION[ov]);
        }
        else if (key === 'required') {
            this.required = nv;
            this.assignRequiredToSubComponents();
        }
        else {
            super.onPropertyChange(key, nv, ov);
        }
    }
    /**
     * this method assigns the required on the component/directive based on the required attribute of the form-group
     */
    assignRequiredToSubComponents() {
        if (this.required && this.componentRefs) {
            setTimeout(() => {
                this.componentRefs.forEach(componentRef => componentRef.widget.required = true);
            }, 50);
        }
    }
    ngAfterViewInit() {
        super.ngAfterViewInit();
        addForIdAttributes(this.nativeElement);
        this.assignRequiredToSubComponents();
    }
}
CompositeDirective.initializeProps = registerProps();
CompositeDirective.decorators = [
    { type: Directive, args: [{
                selector: 'div[wmComposite]',
                providers: [
                    provideAsWidgetRef(CompositeDirective)
                ]
            },] }
];
/** @nocollapse */
CompositeDirective.ctorParameters = () => [
    { type: Injector }
];
CompositeDirective.propDecorators = {
    componentRefs: [{ type: ContentChildren, args: [WidgetRef, { descendants: true },] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9zaXRlLmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vY29tcG9zaXRlL2NvbXBvc2l0ZS5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFpQixlQUFlLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUVwRixPQUFPLEVBQUUsa0JBQWtCLEVBQUUsV0FBVyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRTNELE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUNuRSxPQUFPLEVBQWlCLFNBQVMsRUFBRSxNQUFNLHVCQUF1QixDQUFDO0FBQ2pFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQy9ELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUNsRCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUlqRSxNQUFNLFdBQVcsR0FBRywwQ0FBMEMsQ0FBQztBQUMvRCxNQUFNLGFBQWEsR0FBa0I7SUFDakMsVUFBVSxFQUFFLGVBQWU7SUFDM0IsU0FBUyxFQUFFLFdBQVc7Q0FDekIsQ0FBQztBQUVGLE1BQU0sZ0JBQWdCLEdBQUc7SUFDckIsSUFBSSxFQUFFLGNBQWM7SUFDcEIsS0FBSyxFQUFFLGVBQWU7SUFDdEIsR0FBRyxFQUFFLGFBQWE7Q0FDckIsQ0FBQztBQVFGLE1BQU0sT0FBTyxrQkFBbUIsU0FBUSxpQkFBaUI7SUFRckQsWUFBWSxHQUFhO1FBQ3JCLEtBQUssQ0FBQyxHQUFHLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFDMUIsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsSUFBSSxFQUFFLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ2xFLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILGdCQUFnQixDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRTtRQUN4QixJQUFJLEdBQUcsS0FBSyxpQkFBaUIsRUFBRTtZQUMzQixXQUFXLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxnQkFBZ0IsQ0FBQyxFQUFFLENBQUMsRUFBRSxnQkFBZ0IsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1NBQy9FO2FBQU0sSUFBSSxHQUFHLEtBQUssVUFBVSxFQUFFO1lBQzNCLElBQUksQ0FBQyxRQUFRLEdBQUcsRUFBRSxDQUFDO1lBQ25CLElBQUksQ0FBQyw2QkFBNkIsRUFBRSxDQUFDO1NBQ3hDO2FBQU07WUFDSCxLQUFLLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztTQUN2QztJQUNMLENBQUM7SUFFRDs7T0FFRztJQUNPLDZCQUE2QjtRQUNuQyxJQUFJLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLGFBQWEsRUFBRTtZQUNyQyxVQUFVLENBQUMsR0FBRyxFQUFFO2dCQUNaLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLENBQUM7WUFDcEYsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1NBQ1Y7SUFDTCxDQUFDO0lBRUQsZUFBZTtRQUNYLEtBQUssQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUN4QixrQkFBa0IsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7UUFFdkMsSUFBSSxDQUFDLDZCQUE2QixFQUFFLENBQUM7SUFDekMsQ0FBQzs7QUE3Q00sa0NBQWUsR0FBRyxhQUFhLEVBQUUsQ0FBQzs7WUFQNUMsU0FBUyxTQUFDO2dCQUNQLFFBQVEsRUFBRSxrQkFBa0I7Z0JBQzVCLFNBQVMsRUFBRTtvQkFDUCxrQkFBa0IsQ0FBQyxrQkFBa0IsQ0FBQztpQkFDekM7YUFDSjs7OztZQTdCbUQsUUFBUTs7OzRCQWtDdkQsZUFBZSxTQUFDLFNBQVMsRUFBRSxFQUFDLFdBQVcsRUFBRSxJQUFJLEVBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBZnRlclZpZXdJbml0LCBDb250ZW50Q2hpbGRyZW4sIERpcmVjdGl2ZSwgSW5qZWN0b3IgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgYWRkRm9ySWRBdHRyaWJ1dGVzLCBzd2l0Y2hDbGFzcyB9IGZyb20gJ0B3bS9jb3JlJztcblxuaW1wb3J0IHsgQVBQTFlfU1RZTEVTX1RZUEUsIHN0eWxlciB9IGZyb20gJy4uLy4uL2ZyYW1ld29yay9zdHlsZXInO1xuaW1wb3J0IHsgSVdpZGdldENvbmZpZywgV2lkZ2V0UmVmIH0gZnJvbSAnLi4vLi4vZnJhbWV3b3JrL3R5cGVzJztcbmltcG9ydCB7IFN0eWxhYmxlQ29tcG9uZW50IH0gZnJvbSAnLi4vYmFzZS9zdHlsYWJsZS5jb21wb25lbnQnO1xuaW1wb3J0IHsgcmVnaXN0ZXJQcm9wcyB9IGZyb20gJy4vY29tcG9zaXRlLnByb3BzJztcbmltcG9ydCB7IHByb3ZpZGVBc1dpZGdldFJlZiB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL3dpZGdldC11dGlscyc7XG5cbmRlY2xhcmUgY29uc3QgJDtcblxuY29uc3QgREVGQVVMVF9DTFMgPSAnZm9ybS1ncm91cCBhcHAtY29tcG9zaXRlLXdpZGdldCBjbGVhcmZpeCc7XG5jb25zdCBXSURHRVRfQ09ORklHOiBJV2lkZ2V0Q29uZmlnID0ge1xuICAgIHdpZGdldFR5cGU6ICd3bS1mb3JtLWdyb3VwJyxcbiAgICBob3N0Q2xhc3M6IERFRkFVTFRfQ0xTXG59O1xuXG5jb25zdCBDQVBUSU9OX1BPU0lUSU9OID0ge1xuICAgIGxlZnQ6ICdjYXB0aW9uLWxlZnQnLFxuICAgIHJpZ2h0OiAnY2FwdGlvbi1yaWdodCcsXG4gICAgdG9wOiAnY2FwdGlvbi10b3AnXG59O1xuXG5ARGlyZWN0aXZlKHtcbiAgICBzZWxlY3RvcjogJ2Rpdlt3bUNvbXBvc2l0ZV0nLFxuICAgIHByb3ZpZGVyczogW1xuICAgICAgICBwcm92aWRlQXNXaWRnZXRSZWYoQ29tcG9zaXRlRGlyZWN0aXZlKVxuICAgIF1cbn0pXG5leHBvcnQgY2xhc3MgQ29tcG9zaXRlRGlyZWN0aXZlIGV4dGVuZHMgU3R5bGFibGVDb21wb25lbnQgaW1wbGVtZW50cyBBZnRlclZpZXdJbml0IHtcbiAgICBzdGF0aWMgaW5pdGlhbGl6ZVByb3BzID0gcmVnaXN0ZXJQcm9wcygpO1xuXG4gICAgLy8gdGhpcyBpcyB0aGUgcmVmZXJlbmNlIHRvIHRoZSBjb21wb25lbnQgcmVmcyBpbnNpZGUgdGhlIGZvcm0tZ3JvdXBcbiAgICBAQ29udGVudENoaWxkcmVuKFdpZGdldFJlZiwge2Rlc2NlbmRhbnRzOiB0cnVlfSkgY29tcG9uZW50UmVmcztcblxuICAgIHB1YmxpYyByZXF1aXJlZDogYm9vbGVhbjtcblxuICAgIGNvbnN0cnVjdG9yKGluajogSW5qZWN0b3IpIHtcbiAgICAgICAgc3VwZXIoaW5qLCBXSURHRVRfQ09ORklHKTtcbiAgICAgICAgc3R5bGVyKHRoaXMubmF0aXZlRWxlbWVudCwgdGhpcywgQVBQTFlfU1RZTEVTX1RZUEUuQ09OVEFJTkVSKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiB0aGlzIGlzIG9uUHJvcGVydHlDaGFuZ2UgaGFuZGxlciBmb3IgdGhlIGZvcm0tZ3JvdXAgY29tcG9uZW50XG4gICAgICogQHBhcmFtIGtleVxuICAgICAqIEBwYXJhbSBudlxuICAgICAqIEBwYXJhbSBvdlxuICAgICAqL1xuICAgIG9uUHJvcGVydHlDaGFuZ2Uoa2V5LCBudiwgb3YpIHtcbiAgICAgICAgaWYgKGtleSA9PT0gJ2NhcHRpb25wb3NpdGlvbicpIHtcbiAgICAgICAgICAgIHN3aXRjaENsYXNzKHRoaXMubmF0aXZlRWxlbWVudCwgQ0FQVElPTl9QT1NJVElPTltudl0sIENBUFRJT05fUE9TSVRJT05bb3ZdKTtcbiAgICAgICAgfSBlbHNlIGlmIChrZXkgPT09ICdyZXF1aXJlZCcpIHtcbiAgICAgICAgICAgIHRoaXMucmVxdWlyZWQgPSBudjtcbiAgICAgICAgICAgIHRoaXMuYXNzaWduUmVxdWlyZWRUb1N1YkNvbXBvbmVudHMoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN1cGVyLm9uUHJvcGVydHlDaGFuZ2Uoa2V5LCBudiwgb3YpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogdGhpcyBtZXRob2QgYXNzaWducyB0aGUgcmVxdWlyZWQgb24gdGhlIGNvbXBvbmVudC9kaXJlY3RpdmUgYmFzZWQgb24gdGhlIHJlcXVpcmVkIGF0dHJpYnV0ZSBvZiB0aGUgZm9ybS1ncm91cFxuICAgICAqL1xuICAgIHByb3RlY3RlZCBhc3NpZ25SZXF1aXJlZFRvU3ViQ29tcG9uZW50cygpIHtcbiAgICAgICAgaWYgKHRoaXMucmVxdWlyZWQgJiYgdGhpcy5jb21wb25lbnRSZWZzKSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvbXBvbmVudFJlZnMuZm9yRWFjaChjb21wb25lbnRSZWYgPT4gY29tcG9uZW50UmVmLndpZGdldC5yZXF1aXJlZCA9IHRydWUpO1xuICAgICAgICAgICAgfSwgNTApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgbmdBZnRlclZpZXdJbml0KCkge1xuICAgICAgICBzdXBlci5uZ0FmdGVyVmlld0luaXQoKTtcbiAgICAgICAgYWRkRm9ySWRBdHRyaWJ1dGVzKHRoaXMubmF0aXZlRWxlbWVudCk7XG5cbiAgICAgICAgdGhpcy5hc3NpZ25SZXF1aXJlZFRvU3ViQ29tcG9uZW50cygpO1xuICAgIH1cbn1cbiJdfQ==