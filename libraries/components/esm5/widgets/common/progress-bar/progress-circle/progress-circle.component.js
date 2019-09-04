import * as tslib_1 from "tslib";
import { Component, Injector, ViewChild } from '@angular/core';
import { CircleProgressComponent } from 'ng-circle-progress';
import { styler } from '../../../framework/styler';
import { StylableComponent } from '../../base/stylable.component';
import { registerProps } from './progress-circle.props';
import { provideAsWidgetRef } from '../../../../utils/widget-utils';
import { calculatePercent, getDecimalCount, isPercentageValue } from '../progress-utils';
var DEFAULT_CLS = 'progress app-progress circle';
var WIDGET_CONFIG = { widgetType: 'wm-progress-circle', hostClass: DEFAULT_CLS };
var DEFAULT_OPTIONS = {
    responsive: true,
    innerStrokeWidth: 10,
    outerStrokeWidth: 10,
    unitsFontSize: '15',
    space: -10,
    toFixed: 0,
    maxPercent: 100,
    showSubtitle: false,
    clockwise: true,
    startFromZero: false,
    renderOnClick: false,
    innerStrokeColor: '',
    outerStrokeColor: ''
};
// map of progress-bar type and classes
export var TYPE_CLASS_MAP = {
    'default': '',
    'success': 'progress-circle-success',
    'info': 'progress-circle-info',
    'warning': 'progress-circle-warning',
    'danger': 'progress-circle-danger',
};
var ProgressCircleComponent = /** @class */ (function (_super) {
    tslib_1.__extends(ProgressCircleComponent, _super);
    function ProgressCircleComponent(inj) {
        var _this = _super.call(this, inj, WIDGET_CONFIG) || this;
        styler(_this.nativeElement, _this);
        _this.options = _.clone(DEFAULT_OPTIONS);
        _this.redraw = _.debounce(_this._redraw, 100);
        return _this;
    }
    ProgressCircleComponent.prototype._redraw = function () {
        this.circleRef.render();
    };
    ProgressCircleComponent.prototype.ngAfterViewInit = function () {
        _super.prototype.ngAfterViewInit.call(this);
        this.options = Object.assign(this.circleRef.options, this.options);
    };
    ProgressCircleComponent.prototype.updateDisplayValueFormat = function () {
        // show title and subtitle only when captionplacement is 'inside'
        this.options.showTitle = this.options.showSubtitle = (this.captionplacement === 'inside');
        // show units when title value is empty and captionplacement is 'inside'
        this.options.showUnits = !this.title && this.options.showTitle && isPercentageValue(this.displayformat);
        this.options.toFixed = getDecimalCount(this.displayformat);
        if (this.options.showTitle) {
            this.options.title = this.title || 'auto';
            this.options.showSubtitle = !!this.subtitle;
            this.options.subtitle = this.subtitle || '';
        }
        this.redraw();
    };
    ProgressCircleComponent.prototype.onPropertyChange = function (key, nv, ov) {
        switch (key) {
            case 'type':
                this.$element.removeClass(TYPE_CLASS_MAP[ov]);
                this.$element.addClass(TYPE_CLASS_MAP[nv]);
                break;
            case 'minvalue':
            case 'maxvalue':
            case 'datavalue':
                if (isPercentageValue(this.datavalue)) {
                    this.percentagevalue = parseFloat(this.datavalue);
                }
                else {
                    this.percentagevalue = calculatePercent(parseFloat(this.datavalue), this.minvalue, this.maxvalue);
                }
                break;
            case 'displayformat':
            case 'captionplacement':
            case 'title':
            case 'subtitle':
                this.updateDisplayValueFormat();
                break;
        }
        _super.prototype.onPropertyChange.call(this, key, nv, ov);
    };
    ProgressCircleComponent.initializeProps = registerProps();
    ProgressCircleComponent.decorators = [
        { type: Component, args: [{
                    selector: '[wmProgressCircle]',
                    template: "<circle-progress [percent]=\"percentagevalue\" [options]=\"options\"></circle-progress>\n",
                    providers: [
                        provideAsWidgetRef(ProgressCircleComponent)
                    ]
                }] }
    ];
    /** @nocollapse */
    ProgressCircleComponent.ctorParameters = function () { return [
        { type: Injector }
    ]; };
    ProgressCircleComponent.propDecorators = {
        circleRef: [{ type: ViewChild, args: [CircleProgressComponent,] }]
    };
    return ProgressCircleComponent;
}(StylableComponent));
export { ProgressCircleComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZ3Jlc3MtY2lyY2xlLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vcHJvZ3Jlc3MtYmFyL3Byb2dyZXNzLWNpcmNsZS9wcm9ncmVzcy1jaXJjbGUuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQWlCLFNBQVMsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzlFLE9BQU8sRUFBRSx1QkFBdUIsRUFBa0MsTUFBTSxvQkFBb0IsQ0FBQztBQUc3RixPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDbkQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sK0JBQStCLENBQUM7QUFDbEUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBQ3hELE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGdDQUFnQyxDQUFDO0FBQ3BFLE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxlQUFlLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUl6RixJQUFNLFdBQVcsR0FBRyw4QkFBOEIsQ0FBQztBQUNuRCxJQUFNLGFBQWEsR0FBa0IsRUFBQyxVQUFVLEVBQUUsb0JBQW9CLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBQyxDQUFDO0FBQ2hHLElBQU0sZUFBZSxHQUFvQztJQUNyRCxVQUFVLEVBQUUsSUFBSTtJQUNoQixnQkFBZ0IsRUFBRSxFQUFFO0lBQ3BCLGdCQUFnQixFQUFFLEVBQUU7SUFDcEIsYUFBYSxFQUFFLElBQUk7SUFDbkIsS0FBSyxFQUFFLENBQUMsRUFBRTtJQUNWLE9BQU8sRUFBRSxDQUFDO0lBQ1YsVUFBVSxFQUFFLEdBQUc7SUFDZixZQUFZLEVBQUUsS0FBSztJQUNuQixTQUFTLEVBQUUsSUFBSTtJQUNmLGFBQWEsRUFBRSxLQUFLO0lBQ3BCLGFB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QyxlQUFlLEdBQUcsZ0JBQWdCLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztpQkFDckc7Z0JBQ0QsTUFBTTtZQUNWLEtBQUssZUFBZSxDQUFDO1lBQ3JCLEtBQUssa0JBQWtCLENBQUM7WUFDeEIsS0FBSyxPQUFPLENBQUM7WUFDYixLQUFLLFVBQVU7Z0JBQ1gsSUFBSSxDQUFDLHdCQUF3QixFQUFFLENBQUM7Z0JBQ2hDLE1BQU07U0FDYjtRQUNELGlCQUFNLGdCQUFnQixZQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDeEMsQ0FBQztJQXhFTSx1Q0FBZSxHQUFHLGFBQWEsRUFBRSxDQUFDOztnQkFSNUMsU0FBUyxTQUFDO29CQUNQLFFBQVEsRUFBRSxvQkFBb0I7b0JBQzlCLHFHQUErQztvQkFDL0MsU0FBUyxFQUFFO3dCQUNQLGtCQUFrQixDQUFDLHVCQUF1QixDQUFDO3FCQUM5QztpQkFDSjs7OztnQkEvQ2tDLFFBQVE7Ozs0QkErRHRDLFNBQVMsU0FBQyx1QkFBdUI7O0lBMkR0Qyw4QkFBQztDQUFBLEFBakZELENBTzZDLGlCQUFpQixHQTBFN0Q7U0ExRVksdUJBQXVCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQWZ0ZXJWaWV3SW5pdCwgQ29tcG9uZW50LCBJbmplY3RvciwgVmlld0NoaWxkIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBDaXJjbGVQcm9ncmVzc0NvbXBvbmVudCwgQ2lyY2xlUHJvZ3Jlc3NPcHRpb25zSW50ZXJmYWNlIH0gZnJvbSAnbmctY2lyY2xlLXByb2dyZXNzJztcblxuaW1wb3J0IHsgSVJlZHJhd2FibGVDb21wb25lbnQsIElXaWRnZXRDb25maWcgfSBmcm9tICcuLi8uLi8uLi9mcmFtZXdvcmsvdHlwZXMnO1xuaW1wb3J0IHsgc3R5bGVyIH0gZnJvbSAnLi4vLi4vLi4vZnJhbWV3b3JrL3N0eWxlcic7XG5pbXBvcnQgeyBTdHlsYWJsZUNvbXBvbmVudCB9IGZyb20gJy4uLy4uL2Jhc2Uvc3R5bGFibGUuY29tcG9uZW50JztcbmltcG9ydCB7IHJlZ2lzdGVyUHJvcHMgfSBmcm9tICcuL3Byb2dyZXNzLWNpcmNsZS5wcm9wcyc7XG5pbXBvcnQgeyBwcm92aWRlQXNXaWRnZXRSZWYgfSBmcm9tICcuLi8uLi8uLi8uLi91dGlscy93aWRnZXQtdXRpbHMnO1xuaW1wb3J0IHsgY2FsY3VsYXRlUGVyY2VudCwgZ2V0RGVjaW1hbENvdW50LCBpc1BlcmNlbnRhZ2VWYWx1ZSB9IGZyb20gJy4uL3Byb2dyZXNzLXV0aWxzJztcblxuZGVjbGFyZSBjb25zdCBfO1xuXG5jb25zdCBERUZBVUxUX0NMUyA9ICdwcm9ncmVzcyBhcHAtcHJvZ3Jlc3MgY2lyY2xlJztcbmNvbnN0IFdJREdFVF9DT05GSUc6IElXaWRnZXRDb25maWcgPSB7d2lkZ2V0VHlwZTogJ3dtLXByb2dyZXNzLWNpcmNsZScsIGhvc3RDbGFzczogREVGQVVMVF9DTFN9O1xuY29uc3QgREVGQVVMVF9PUFRJT05TOiBDaXJjbGVQcm9ncmVzc09wdGlvbnNJbnRlcmZhY2UgID0ge1xuICAgIHJlc3BvbnNpdmU6IHRydWUsXG4gICAgaW5uZXJTdHJva2VXaWR0aDogMTAsXG4gICAgb3V0ZXJTdHJva2VXaWR0aDogMTAsXG4gICAgdW5pdHNGb250U2l6ZTogJzE1JyxcbiAgICBzcGFjZTogLTEwLFxuICAgIHRvRml4ZWQ6IDAsXG4gICAgbWF4UGVyY2VudDogMTAwLFxuICAgIHNob3dTdWJ0aXRsZTogZmFsc2UsXG4gICAgY2xvY2t3aXNlOiB0cnVlLFxuICAgIHN0YXJ0RnJvbVplcm86IGZhbHNlLFxuICAgIHJlbmRlck9uQ2xpY2s6IGZhbHNlLFxuICAgIGlubmVyU3Ryb2tlQ29sb3I6ICcnLFxuICAgIG91dGVyU3Ryb2tlQ29sb3I6ICcnXG59O1xuXG4vLyBtYXAgb2YgcHJvZ3Jlc3MtYmFyIHR5cGUgYW5kIGNsYXNzZXNcbmV4cG9ydCBjb25zdCBUWVBFX0NMQVNTX01BUCA9IHtcbiAgICAnZGVmYXVsdCc6ICcnLFxuICAgICdzdWNjZXNzJzogJ3Byb2dyZXNzLWNpcmNsZS1zdWNjZXNzJyxcbiAgICAnaW5mbyc6ICdwcm9ncmVzcy1jaXJjbGUtaW5mbycsXG4gICAgJ3dhcm5pbmcnOiAncHJvZ3Jlc3MtY2lyY2xlLXdhcm5pbmcnLFxuICAgICdkYW5nZXInOiAncHJvZ3Jlc3MtY2lyY2xlLWRhbmdlcicsXG59O1xuXG5cblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdbd21Qcm9ncmVzc0NpcmNsZV0nLFxuICAgIHRlbXBsYXRlVXJsOiAnLi9wcm9ncmVzcy1jaXJjbGUuY29tcG9uZW50Lmh0bWwnLFxuICAgIHByb3ZpZGVyczogW1xuICAgICAgICBwcm92aWRlQXNXaWRnZXRSZWYoUHJvZ3Jlc3NDaXJjbGVDb21wb25lbnQpXG4gICAgXVxufSlcbmV4cG9ydCBjbGFzcyBQcm9ncmVzc0NpcmNsZUNvbXBvbmVudCBleHRlbmRzIFN0eWxhYmxlQ29tcG9uZW50IGltcGxlbWVudHMgQWZ0ZXJWaWV3SW5pdCwgSVJlZHJhd2FibGVDb21wb25lbnQge1xuICAgIHN0YXRpYyBpbml0aWFsaXplUHJvcHMgPSByZWdpc3RlclByb3BzKCk7XG5cbiAgICBwdWJsaWMgZGlzcGxheWZvcm1hdDogc3RyaW5nO1xuICAgIHB1YmxpYyBkYXRhdmFsdWU6IHN0cmluZztcbiAgICBwdWJsaWMgbWludmFsdWU6IG51bWJlcjtcbiAgICBwdWJsaWMgbWF4dmFsdWU6IG51bWJlcjtcbiAgICBwdWJsaWMgdHlwZTogc3RyaW5nO1xuICAgIHB1YmxpYyB0aXRsZTogc3RyaW5nO1xuICAgIHB1YmxpYyBzdWJ0aXRsZTogc3RyaW5nO1xuICAgIHB1YmxpYyBjYXB0aW9ucGxhY2VtZW50OiBzdHJpbmc7XG4gICAgcHVibGljIHBlcmNlbnRhZ2V2YWx1ZTogbnVtYmVyO1xuICAgIHB1YmxpYyByZWRyYXc6IEZ1bmN0aW9uO1xuICAgIHB1YmxpYyBvcHRpb25zOiBDaXJjbGVQcm9ncmVzc09wdGlvbnNJbnRlcmZhY2U7XG5cbiAgICBAVmlld0NoaWxkKENpcmNsZVByb2dyZXNzQ29tcG9uZW50KSBjaXJjbGVSZWY6IENpcmNsZVByb2dyZXNzQ29tcG9uZW50O1xuXG5cbiAgICBjb25zdHJ1Y3Rvcihpbmo6IEluamVjdG9yKSB7XG4gICAgICAgIHN1cGVyKGluaiwgV0lER0VUX0NPTkZJRyk7XG4gICAgICAgIHN0eWxlcih0aGlzLm5hdGl2ZUVsZW1lbnQsIHRoaXMpO1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBfLmNsb25lKERFRkFVTFRfT1BUSU9OUyk7XG4gICAgICAgIHRoaXMucmVkcmF3ID0gXy5kZWJvdW5jZSh0aGlzLl9yZWRyYXcsIDEwMCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBfcmVkcmF3ICgpIHtcbiAgICAgICAgdGhpcy5jaXJjbGVSZWYucmVuZGVyKCk7XG4gICAgfVxuXG4gICAgbmdBZnRlclZpZXdJbml0KCkge1xuICAgICAgICBzdXBlci5uZ0FmdGVyVmlld0luaXQoKTtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gT2JqZWN0LmFzc2lnbih0aGlzLmNpcmNsZVJlZi5vcHRpb25zLCB0aGlzLm9wdGlvbnMpO1xuICAgIH1cblxuICAgIHVwZGF0ZURpc3BsYXlWYWx1ZUZvcm1hdCgpIHtcbiAgICAgICAgLy8gc2hvdyB0aXRsZSBhbmQgc3VidGl0bGUgb25seSB3aGVuIGNhcHRpb25wbGFjZW1lbnQgaXMgJ2luc2lkZSdcbiAgICAgICAgdGhpcy5vcHRpb25zLnNob3dUaXRsZSA9IHRoaXMub3B0aW9ucy5zaG93U3VidGl0bGUgPSAodGhpcy5jYXB0aW9ucGxhY2VtZW50ID09PSAnaW5zaWRlJyk7XG5cbiAgICAgICAgLy8gc2hvdyB1bml0cyB3aGVuIHRpdGxlIHZhbHVlIGlzIGVtcHR5IGFuZCBjYXB0aW9ucGxhY2VtZW50IGlzICdpbnNpZGUnXG4gICAgICAgIHRoaXMub3B0aW9ucy5zaG93VW5pdHMgPSAhdGhpcy50aXRsZSAmJiB0aGlzLm9wdGlvbnMuc2hvd1RpdGxlICYmIGlzUGVyY2VudGFnZVZhbHVlKHRoaXMuZGlzcGxheWZvcm1hdCk7XG4gICAgICAgIHRoaXMub3B0aW9ucy50b0ZpeGVkID0gZ2V0RGVjaW1hbENvdW50KHRoaXMuZGlzcGxheWZvcm1hdCk7XG5cbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5zaG93VGl0bGUpIHtcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy50aXRsZSA9IHRoaXMudGl0bGUgfHwgJ2F1dG8nO1xuICAgICAgICAgICAgdGhpcy5vcHRpb25zLnNob3dTdWJ0aXRsZSA9ICEhdGhpcy5zdWJ0aXRsZTtcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5zdWJ0aXRsZSA9IHRoaXMuc3VidGl0bGUgfHwgJyc7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5yZWRyYXcoKTtcbiAgICB9XG5cbiAgICBvblByb3BlcnR5Q2hhbmdlKGtleTogc3RyaW5nLCBudjogYW55LCBvdj86IGFueSkge1xuICAgICAgICBzd2l0Y2ggKGtleSkge1xuICAgICAgICAgICAgY2FzZSAndHlwZSc6XG4gICAgICAgICAgICAgICAgdGhpcy4kZWxlbWVudC5yZW1vdmVDbGFzcyhUWVBFX0NMQVNTX01BUFtvdl0pO1xuICAgICAgICAgICAgICAgIHRoaXMuJGVsZW1lbnQuYWRkQ2xhc3MoVFlQRV9DTEFTU19NQVBbbnZdKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ21pbnZhbHVlJzpcbiAgICAgICAgICAgIGNhc2UgJ21heHZhbHVlJzpcbiAgICAgICAgICAgIGNhc2UgJ2RhdGF2YWx1ZSc6XG4gICAgICAgICAgICAgICAgaWYgKGlzUGVyY2VudGFnZVZhbHVlKHRoaXMuZGF0YXZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnBlcmNlbnRhZ2V2YWx1ZSA9IHBhcnNlRmxvYXQodGhpcy5kYXRhdmFsdWUpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGVyY2VudGFnZXZhbHVlID0gY2FsY3VsYXRlUGVyY2VudChwYXJzZUZsb2F0KHRoaXMuZGF0YXZhbHVlKSwgdGhpcy5taW52YWx1ZSwgdGhpcy5tYXh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnZGlzcGxheWZvcm1hdCc6XG4gICAgICAgICAgICBjYXNlICdjYXB0aW9ucGxhY2VtZW50JzpcbiAgICAgICAgICAgIGNhc2UgJ3RpdGxlJzpcbiAgICAgICAgICAgIGNhc2UgJ3N1YnRpdGxlJzpcbiAgICAgICAgICAgICAgICB0aGlzLnVwZGF0ZURpc3BsYXlWYWx1ZUZvcm1hdCgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHN1cGVyLm9uUHJvcGVydHlDaGFuZ2Uoa2V5LCBudiwgb3YpO1xuICAgIH1cbn1cbiJdfQ==