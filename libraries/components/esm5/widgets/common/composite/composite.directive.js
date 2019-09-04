import * as tslib_1 from "tslib";
import { ContentChildren, Directive, Injector } from '@angular/core';
import { addForIdAttributes, switchClass } from '@wm/core';
import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { WidgetRef } from '../../framework/types';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './composite.props';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
var DEFAULT_CLS = 'form-group app-composite-widget clearfix';
var WIDGET_CONFIG = {
    widgetType: 'wm-form-group',
    hostClass: DEFAULT_CLS
};
var CAPTION_POSITION = {
    left: 'caption-left',
    right: 'caption-right',
    top: 'caption-top'
};
var CompositeDirective = /** @class */ (function (_super) {
    tslib_1.__extends(CompositeDirective, _super);
    function CompositeDirective(inj) {
        var _this = _super.call(this, inj, WIDGET_CONFIG) || this;
        styler(_this.nativeElement, _this, APPLY_STYLES_TYPE.CONTAINER);
        return _this;
    }
    /**
     * this is onPropertyChange handler for the form-group component
     * @param key
     * @param nv
     * @param ov
     */
    CompositeDirective.prototype.onPropertyChange = function (key, nv, ov) {
        if (key === 'captionposition') {
            switchClass(this.nativeElement, CAPTION_POSITION[nv], CAPTION_POSITION[ov]);
        }
        else if (key === 'required') {
            this.required = nv;
            this.assignRequiredToSubComponents();
        }
        else {
            _super.prototype.onPropertyChange.call(this, key, nv, ov);
        }
    };
    /**
     * this method assigns the required on the component/directive based on the required attribute of the form-group
     */
    CompositeDirective.prototype.assignRequiredToSubComponents = function () {
        var _this = this;
        if (this.required && this.componentRefs) {
            setTimeout(function () {
                _this.componentRefs.forEach(function (componentRef) { return componentRef.widget.required = true; });
            }, 50);
        }
    };
    CompositeDirective.prototype.ngAfterViewInit = function () {
        _super.prototype.ngAfterViewInit.call(this);
        addForIdAttributes(this.nativeElement);
        this.assignRequiredToSubComponents();
    };
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
    CompositeDirective.ctorParameters = function () { return [
        { type: Injector }
    ]; };
    CompositeDirective.propDecorators = {
        componentRefs: [{ type: ContentChildren, args: [WidgetRef, { descendants: true },] }]
    };
    return CompositeDirective;
}(StylableComponent));
export { CompositeDirective };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcG9zaXRlLmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vY29tcG9zaXRlL2NvbXBvc2l0ZS5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBaUIsZUFBZSxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFcEYsT0FBTyxFQUFFLGtCQUFrQixFQUFFLFdBQVcsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUUzRCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDbkUsT0FBTyxFQUFpQixTQUFTLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQztBQUNqRSxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUMvRCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sbUJBQW1CLENBQUM7QUFDbEQsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFJakUsSUFBTSxXQUFXLEdBQUcsMENBQTBDLENBQUM7QUFDL0QsSUFBTSxhQUFhLEdBQWtCO0lBQ2pDLFVBQVUsRUFBRSxlQUFlO0lBQzNCLFNBQVMsRUFBRSxXQUFXO0NBQ3pCLENBQUM7QUFFRixJQUFNLGdCQUFnQixHQUFHO0lBQ3JCLElBQUksRUFBRSxjQUFjO0lBQ3BCLEtBQUssRUFBRSxlQUFlO0lBQ3RCLEdBQUcsRUFBRSxhQUFhO0NBQ3JCLENBQUM7QUFFRjtJQU13Qyw4Q0FBaUI7SUFRckQsNEJBQVksR0FBYTtRQUF6QixZQUNJLGtCQUFNLEdBQUcsRUFBRSxhQUFhLENBQUMsU0FFNUI7UUFERyxNQUFNLENBQUMsS0FBSSxDQUFDLGFBQWEsRUFBRSxLQUFJLEVBQUUsaUJBQWlCLENBQUMsU0FBUyxDQUFDLENBQUM7O0lBQ2xFLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNILDZDQUFnQixHQUFoQixVQUFpQixHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUU7UUFDeEIsSUFBSSxHQUFHLEtBQUssaUJBQWlCLEVBQUU7WUFDM0IsV0FBVyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsZ0JBQWdCLENBQUMsRUFBRSxDQUFDLEVBQUUsZ0JBQWdCLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztTQUMvRTthQUFNLElBQUksR0FBRyxLQUFLLFVBQVUsRUFBRTtZQUMzQixJQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQztZQUNuQixJQUFJLENBQUMsNkJBQTZCLEVBQUUsQ0FBQztTQUN4QzthQUFNO1lBQ0gsaUJBQU0sZ0JBQWdCLFlBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztTQUN2QztJQUNMLENBQUM7SUFFRDs7T0FFRztJQUNPLDBEQUE2QixHQUF2QztRQUFBLGlCQU1DO1FBTEcsSUFBSSxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxhQUFhLEVBQUU7WUFDckMsVUFBVSxDQUFDO2dCQUNQLEtBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLFVBQUEsWUFBWSxJQUFJLE9BQUEsWUFBWSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEdBQUcsSUFBSSxFQUFuQyxDQUFtQyxDQUFDLENBQUM7WUFDcEYsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1NBQ1Y7SUFDTCxDQUFDO0lBRUQsNENBQWUsR0FBZjtRQUNJLGlCQUFNLGVBQWUsV0FBRSxDQUFDO1FBQ3hCLGtCQUFrQixDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUV2QyxJQUFJLENBQUMsNkJBQTZCLEVBQUUsQ0FBQztJQUN6QyxDQUFDO0lBN0NNLGtDQUFlLEdBQUcsYUFBYSxFQUFFLENBQUM7O2dCQVA1QyxTQUFTLFNBQUM7b0JBQ1AsUUFBUSxFQUFFLGtCQUFrQjtvQkFDNUIsU0FBUyxFQUFFO3dCQUNQLGtCQUFrQixDQUFDLGtCQUFrQixDQUFDO3FCQUN6QztpQkFDSjs7OztnQkE3Qm1ELFFBQVE7OztnQ0FrQ3ZELGVBQWUsU0FBQyxTQUFTLEVBQUUsRUFBQyxXQUFXLEVBQUUsSUFBSSxFQUFDOztJQTJDbkQseUJBQUM7Q0FBQSxBQXJERCxDQU13QyxpQkFBaUIsR0ErQ3hEO1NBL0NZLGtCQUFrQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFmdGVyVmlld0luaXQsIENvbnRlbnRDaGlsZHJlbiwgRGlyZWN0aXZlLCBJbmplY3RvciB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBhZGRGb3JJZEF0dHJpYnV0ZXMsIHN3aXRjaENsYXNzIH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5pbXBvcnQgeyBBUFBMWV9TVFlMRVNfVFlQRSwgc3R5bGVyIH0gZnJvbSAnLi4vLi4vZnJhbWV3b3JrL3N0eWxlcic7XG5pbXBvcnQgeyBJV2lkZ2V0Q29uZmlnLCBXaWRnZXRSZWYgfSBmcm9tICcuLi8uLi9mcmFtZXdvcmsvdHlwZXMnO1xuaW1wb3J0IHsgU3R5bGFibGVDb21wb25lbnQgfSBmcm9tICcuLi9iYXNlL3N0eWxhYmxlLmNvbXBvbmVudCc7XG5pbXBvcnQgeyByZWdpc3RlclByb3BzIH0gZnJvbSAnLi9jb21wb3NpdGUucHJvcHMnO1xuaW1wb3J0IHsgcHJvdmlkZUFzV2lkZ2V0UmVmIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvd2lkZ2V0LXV0aWxzJztcblxuZGVjbGFyZSBjb25zdCAkO1xuXG5jb25zdCBERUZBVUxUX0NMUyA9ICdmb3JtLWdyb3VwIGFwcC1jb21wb3NpdGUtd2lkZ2V0IGNsZWFyZml4JztcbmNvbnN0IFdJREdFVF9DT05GSUc6IElXaWRnZXRDb25maWcgPSB7XG4gICAgd2lkZ2V0VHlwZTogJ3dtLWZvcm0tZ3JvdXAnLFxuICAgIGhvc3RDbGFzczogREVGQVVMVF9DTFNcbn07XG5cbmNvbnN0IENBUFRJT05fUE9TSVRJT04gPSB7XG4gICAgbGVmdDogJ2NhcHRpb24tbGVmdCcsXG4gICAgcmlnaHQ6ICdjYXB0aW9uLXJpZ2h0JyxcbiAgICB0b3A6ICdjYXB0aW9uLXRvcCdcbn07XG5cbkBEaXJlY3RpdmUoe1xuICAgIHNlbGVjdG9yOiAnZGl2W3dtQ29tcG9zaXRlXScsXG4gICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIHByb3ZpZGVBc1dpZGdldFJlZihDb21wb3NpdGVEaXJlY3RpdmUpXG4gICAgXVxufSlcbmV4cG9ydCBjbGFzcyBDb21wb3NpdGVEaXJlY3RpdmUgZXh0ZW5kcyBTdHlsYWJsZUNvbXBvbmVudCBpbXBsZW1lbnRzIEFmdGVyVmlld0luaXQge1xuICAgIHN0YXRpYyBpbml0aWFsaXplUHJvcHMgPSByZWdpc3RlclByb3BzKCk7XG5cbiAgICAvLyB0aGlzIGlzIHRoZSByZWZlcmVuY2UgdG8gdGhlIGNvbXBvbmVudCByZWZzIGluc2lkZSB0aGUgZm9ybS1ncm91cFxuICAgIEBDb250ZW50Q2hpbGRyZW4oV2lkZ2V0UmVmLCB7ZGVzY2VuZGFudHM6IHRydWV9KSBjb21wb25lbnRSZWZzO1xuXG4gICAgcHVibGljIHJlcXVpcmVkOiBib29sZWFuO1xuXG4gICAgY29uc3RydWN0b3IoaW5qOiBJbmplY3Rvcikge1xuICAgICAgICBzdXBlcihpbmosIFdJREdFVF9DT05GSUcpO1xuICAgICAgICBzdHlsZXIodGhpcy5uYXRpdmVFbGVtZW50LCB0aGlzLCBBUFBMWV9TVFlMRVNfVFlQRS5DT05UQUlORVIpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHRoaXMgaXMgb25Qcm9wZXJ0eUNoYW5nZSBoYW5kbGVyIGZvciB0aGUgZm9ybS1ncm91cCBjb21wb25lbnRcbiAgICAgKiBAcGFyYW0ga2V5XG4gICAgICogQHBhcmFtIG52XG4gICAgICogQHBhcmFtIG92XG4gICAgICovXG4gICAgb25Qcm9wZXJ0eUNoYW5nZShrZXksIG52LCBvdikge1xuICAgICAgICBpZiAoa2V5ID09PSAnY2FwdGlvbnBvc2l0aW9uJykge1xuICAgICAgICAgICAgc3dpdGNoQ2xhc3ModGhpcy5uYXRpdmVFbGVtZW50LCBDQVBUSU9OX1BPU0lUSU9OW252XSwgQ0FQVElPTl9QT1NJVElPTltvdl0pO1xuICAgICAgICB9IGVsc2UgaWYgKGtleSA9PT0gJ3JlcXVpcmVkJykge1xuICAgICAgICAgICAgdGhpcy5yZXF1aXJlZCA9IG52O1xuICAgICAgICAgICAgdGhpcy5hc3NpZ25SZXF1aXJlZFRvU3ViQ29tcG9uZW50cygpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3VwZXIub25Qcm9wZXJ0eUNoYW5nZShrZXksIG52LCBvdik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiB0aGlzIG1ldGhvZCBhc3NpZ25zIHRoZSByZXF1aXJlZCBvbiB0aGUgY29tcG9uZW50L2RpcmVjdGl2ZSBiYXNlZCBvbiB0aGUgcmVxdWlyZWQgYXR0cmlidXRlIG9mIHRoZSBmb3JtLWdyb3VwXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGFzc2lnblJlcXVpcmVkVG9TdWJDb21wb25lbnRzKCkge1xuICAgICAgICBpZiAodGhpcy5yZXF1aXJlZCAmJiB0aGlzLmNvbXBvbmVudFJlZnMpIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuY29tcG9uZW50UmVmcy5mb3JFYWNoKGNvbXBvbmVudFJlZiA9PiBjb21wb25lbnRSZWYud2lkZ2V0LnJlcXVpcmVkID0gdHJ1ZSk7XG4gICAgICAgICAgICB9LCA1MCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBuZ0FmdGVyVmlld0luaXQoKSB7XG4gICAgICAgIHN1cGVyLm5nQWZ0ZXJWaWV3SW5pdCgpO1xuICAgICAgICBhZGRGb3JJZEF0dHJpYnV0ZXModGhpcy5uYXRpdmVFbGVtZW50KTtcblxuICAgICAgICB0aGlzLmFzc2lnblJlcXVpcmVkVG9TdWJDb21wb25lbnRzKCk7XG4gICAgfVxufVxuIl19