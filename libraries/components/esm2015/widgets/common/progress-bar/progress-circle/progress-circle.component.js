import { Component, Injector, ViewChild } from '@angular/core';
import { CircleProgressComponent } from 'ng-circle-progress';
import { styler } from '../../../framework/styler';
import { StylableComponent } from '../../base/stylable.component';
import { registerProps } from './progress-circle.props';
import { provideAsWidgetRef } from '../../../../utils/widget-utils';
import { calculatePercent, getDecimalCount, isPercentageValue } from '../progress-utils';
const DEFAULT_CLS = 'progress app-progress circle';
const WIDGET_CONFIG = { widgetType: 'wm-progress-circle', hostClass: DEFAULT_CLS };
const DEFAULT_OPTIONS = {
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
export const TYPE_CLASS_MAP = {
    'default': '',
    'success': 'progress-circle-success',
    'info': 'progress-circle-info',
    'warning': 'progress-circle-warning',
    'danger': 'progress-circle-danger',
};
export class ProgressCircleComponent extends StylableComponent {
    constructor(inj) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this);
        this.options = _.clone(DEFAULT_OPTIONS);
        this.redraw = _.debounce(this._redraw, 100);
    }
    _redraw() {
        this.circleRef.render();
    }
    ngAfterViewInit() {
        super.ngAfterViewInit();
        this.options = Object.assign(this.circleRef.options, this.options);
    }
    updateDisplayValueFormat() {
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
    }
    onPropertyChange(key, nv, ov) {
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
        super.onPropertyChange(key, nv, ov);
    }
}
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
ProgressCircleComponent.ctorParameters = () => [
    { type: Injector }
];
ProgressCircleComponent.propDecorators = {
    circleRef: [{ type: ViewChild, args: [CircleProgressComponent,] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZ3Jlc3MtY2lyY2xlLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vcHJvZ3Jlc3MtYmFyL3Byb2dyZXNzLWNpcmNsZS9wcm9ncmVzcy1jaXJjbGUuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBaUIsU0FBUyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDOUUsT0FBTyxFQUFFLHVCQUF1QixFQUFrQyxNQUFNLG9CQUFvQixDQUFDO0FBRzdGLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUNuRCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSwrQkFBK0IsQ0FBQztBQUNsRSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0seUJBQXlCLENBQUM7QUFDeEQsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sZ0NBQWdDLENBQUM7QUFDcEUsT0FBTyxFQUFFLGdCQUFnQixFQUFFLGVBQWUsRUFBRSxpQkFBaUIsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBSXpGLE1BQU0sV0FBVyxHQUFHLDhCQUE4QixDQUFDO0FBQ25ELE1BQU0sYUFBYSxHQUFrQixFQUFDLFVBQVUsRUFBRSxvQkFBb0IsRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFDLENBQUM7QUFDaEcsTUFBTSxlQUFlLEdBQW9DO0lBQ3JELFVBQVUsRUFBRSxJQUFJO0lBQ2hCLGdCQUFnQixFQUFFLEVBQUU7SUFDcEIsZ0JBQWdCLEVBQUUsRUFBRTtJQUNwQixhQUFhLEVBQUUsSUFBSTtJQUNuQixLQUFLLEVBQUUsQ0FBQyxFQUFFO0lBQ1YsT0FBTyxFQUFFLENBQUM7SUFDVixVQUFVLEVBQUUsR0FBRztJQUNmLFlBQVksRUFBRSxLQUFLO0lBQ25CLFNBQVMsRUFBRSxJQUFJO0lBQ2YsYUFBYSxFQUFFLEtBQUs7SUFDcEIsYUFB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QUFHLGdCQUFnQixDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7aUJBQ3JHO2dCQUNELE1BQU07WUFDVixLQUFLLGVBQWUsQ0FBQztZQUNyQixLQUFLLGtCQUFrQixDQUFDO1lBQ3hCLEtBQUssT0FBTyxDQUFDO1lBQ2IsS0FBSyxVQUFVO2dCQUNYLElBQUksQ0FBQyx3QkFBd0IsRUFBRSxDQUFDO2dCQUNoQyxNQUFNO1NBQ2I7UUFDRCxLQUFLLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUN4QyxDQUFDOztBQXhFTSx1Q0FBZSxHQUFHLGFBQWEsRUFBRSxDQUFDOztZQVI1QyxTQUFTLFNBQUM7Z0JBQ1AsUUFBUSxFQUFFLG9CQUFvQjtnQkFDOUIscUdBQStDO2dCQUMvQyxTQUFTLEVBQUU7b0JBQ1Asa0JBQWtCLENBQUMsdUJBQXVCLENBQUM7aUJBQzlDO2FBQ0o7Ozs7WUEvQ2tDLFFBQVE7Ozt3QkErRHRDLFNBQVMsU0FBQyx1QkFBdUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBZnRlclZpZXdJbml0LCBDb21wb25lbnQsIEluamVjdG9yLCBWaWV3Q2hpbGQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IENpcmNsZVByb2dyZXNzQ29tcG9uZW50LCBDaXJjbGVQcm9ncmVzc09wdGlvbnNJbnRlcmZhY2UgfSBmcm9tICduZy1jaXJjbGUtcHJvZ3Jlc3MnO1xuXG5pbXBvcnQgeyBJUmVkcmF3YWJsZUNvbXBvbmVudCwgSVdpZGdldENvbmZpZyB9IGZyb20gJy4uLy4uLy4uL2ZyYW1ld29yay90eXBlcyc7XG5pbXBvcnQgeyBzdHlsZXIgfSBmcm9tICcuLi8uLi8uLi9mcmFtZXdvcmsvc3R5bGVyJztcbmltcG9ydCB7IFN0eWxhYmxlQ29tcG9uZW50IH0gZnJvbSAnLi4vLi4vYmFzZS9zdHlsYWJsZS5jb21wb25lbnQnO1xuaW1wb3J0IHsgcmVnaXN0ZXJQcm9wcyB9IGZyb20gJy4vcHJvZ3Jlc3MtY2lyY2xlLnByb3BzJztcbmltcG9ydCB7IHByb3ZpZGVBc1dpZGdldFJlZiB9IGZyb20gJy4uLy4uLy4uLy4uL3V0aWxzL3dpZGdldC11dGlscyc7XG5pbXBvcnQgeyBjYWxjdWxhdGVQZXJjZW50LCBnZXREZWNpbWFsQ291bnQsIGlzUGVyY2VudGFnZVZhbHVlIH0gZnJvbSAnLi4vcHJvZ3Jlc3MtdXRpbHMnO1xuXG5kZWNsYXJlIGNvbnN0IF87XG5cbmNvbnN0IERFRkFVTFRfQ0xTID0gJ3Byb2dyZXNzIGFwcC1wcm9ncmVzcyBjaXJjbGUnO1xuY29uc3QgV0lER0VUX0NPTkZJRzogSVdpZGdldENvbmZpZyA9IHt3aWRnZXRUeXBlOiAnd20tcHJvZ3Jlc3MtY2lyY2xlJywgaG9zdENsYXNzOiBERUZBVUxUX0NMU307XG5jb25zdCBERUZBVUxUX09QVElPTlM6IENpcmNsZVByb2dyZXNzT3B0aW9uc0ludGVyZmFjZSAgPSB7XG4gICAgcmVzcG9uc2l2ZTogdHJ1ZSxcbiAgICBpbm5lclN0cm9rZVdpZHRoOiAxMCxcbiAgICBvdXRlclN0cm9rZVdpZHRoOiAxMCxcbiAgICB1bml0c0ZvbnRTaXplOiAnMTUnLFxuICAgIHNwYWNlOiAtMTAsXG4gICAgdG9GaXhlZDogMCxcbiAgICBtYXhQZXJjZW50OiAxMDAsXG4gICAgc2hvd1N1YnRpdGxlOiBmYWxzZSxcbiAgICBjbG9ja3dpc2U6IHRydWUsXG4gICAgc3RhcnRGcm9tWmVybzogZmFsc2UsXG4gICAgcmVuZGVyT25DbGljazogZmFsc2UsXG4gICAgaW5uZXJTdHJva2VDb2xvcjogJycsXG4gICAgb3V0ZXJTdHJva2VDb2xvcjogJydcbn07XG5cbi8vIG1hcCBvZiBwcm9ncmVzcy1iYXIgdHlwZSBhbmQgY2xhc3Nlc1xuZXhwb3J0IGNvbnN0IFRZUEVfQ0xBU1NfTUFQID0ge1xuICAgICdkZWZhdWx0JzogJycsXG4gICAgJ3N1Y2Nlc3MnOiAncHJvZ3Jlc3MtY2lyY2xlLXN1Y2Nlc3MnLFxuICAgICdpbmZvJzogJ3Byb2dyZXNzLWNpcmNsZS1pbmZvJyxcbiAgICAnd2FybmluZyc6ICdwcm9ncmVzcy1jaXJjbGUtd2FybmluZycsXG4gICAgJ2Rhbmdlcic6ICdwcm9ncmVzcy1jaXJjbGUtZGFuZ2VyJyxcbn07XG5cblxuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ1t3bVByb2dyZXNzQ2lyY2xlXScsXG4gICAgdGVtcGxhdGVVcmw6ICcuL3Byb2dyZXNzLWNpcmNsZS5jb21wb25lbnQuaHRtbCcsXG4gICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIHByb3ZpZGVBc1dpZGdldFJlZihQcm9ncmVzc0NpcmNsZUNvbXBvbmVudClcbiAgICBdXG59KVxuZXhwb3J0IGNsYXNzIFByb2dyZXNzQ2lyY2xlQ29tcG9uZW50IGV4dGVuZHMgU3R5bGFibGVDb21wb25lbnQgaW1wbGVtZW50cyBBZnRlclZpZXdJbml0LCBJUmVkcmF3YWJsZUNvbXBvbmVudCB7XG4gICAgc3RhdGljIGluaXRpYWxpemVQcm9wcyA9IHJlZ2lzdGVyUHJvcHMoKTtcblxuICAgIHB1YmxpYyBkaXNwbGF5Zm9ybWF0OiBzdHJpbmc7XG4gICAgcHVibGljIGRhdGF2YWx1ZTogc3RyaW5nO1xuICAgIHB1YmxpYyBtaW52YWx1ZTogbnVtYmVyO1xuICAgIHB1YmxpYyBtYXh2YWx1ZTogbnVtYmVyO1xuICAgIHB1YmxpYyB0eXBlOiBzdHJpbmc7XG4gICAgcHVibGljIHRpdGxlOiBzdHJpbmc7XG4gICAgcHVibGljIHN1YnRpdGxlOiBzdHJpbmc7XG4gICAgcHVibGljIGNhcHRpb25wbGFjZW1lbnQ6IHN0cmluZztcbiAgICBwdWJsaWMgcGVyY2VudGFnZXZhbHVlOiBudW1iZXI7XG4gICAgcHVibGljIHJlZHJhdzogRnVuY3Rpb247XG4gICAgcHVibGljIG9wdGlvbnM6IENpcmNsZVByb2dyZXNzT3B0aW9uc0ludGVyZmFjZTtcblxuICAgIEBWaWV3Q2hpbGQoQ2lyY2xlUHJvZ3Jlc3NDb21wb25lbnQpIGNpcmNsZVJlZjogQ2lyY2xlUHJvZ3Jlc3NDb21wb25lbnQ7XG5cblxuICAgIGNvbnN0cnVjdG9yKGluajogSW5qZWN0b3IpIHtcbiAgICAgICAgc3VwZXIoaW5qLCBXSURHRVRfQ09ORklHKTtcbiAgICAgICAgc3R5bGVyKHRoaXMubmF0aXZlRWxlbWVudCwgdGhpcyk7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IF8uY2xvbmUoREVGQVVMVF9PUFRJT05TKTtcbiAgICAgICAgdGhpcy5yZWRyYXcgPSBfLmRlYm91bmNlKHRoaXMuX3JlZHJhdywgMTAwKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIF9yZWRyYXcgKCkge1xuICAgICAgICB0aGlzLmNpcmNsZVJlZi5yZW5kZXIoKTtcbiAgICB9XG5cbiAgICBuZ0FmdGVyVmlld0luaXQoKSB7XG4gICAgICAgIHN1cGVyLm5nQWZ0ZXJWaWV3SW5pdCgpO1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSBPYmplY3QuYXNzaWduKHRoaXMuY2lyY2xlUmVmLm9wdGlvbnMsIHRoaXMub3B0aW9ucyk7XG4gICAgfVxuXG4gICAgdXBkYXRlRGlzcGxheVZhbHVlRm9ybWF0KCkge1xuICAgICAgICAvLyBzaG93IHRpdGxlIGFuZCBzdWJ0aXRsZSBvbmx5IHdoZW4gY2FwdGlvbnBsYWNlbWVudCBpcyAnaW5zaWRlJ1xuICAgICAgICB0aGlzLm9wdGlvbnMuc2hvd1RpdGxlID0gdGhpcy5vcHRpb25zLnNob3dTdWJ0aXRsZSA9ICh0aGlzLmNhcHRpb25wbGFjZW1lbnQgPT09ICdpbnNpZGUnKTtcblxuICAgICAgICAvLyBzaG93IHVuaXRzIHdoZW4gdGl0bGUgdmFsdWUgaXMgZW1wdHkgYW5kIGNhcHRpb25wbGFjZW1lbnQgaXMgJ2luc2lkZSdcbiAgICAgICAgdGhpcy5vcHRpb25zLnNob3dVbml0cyA9ICF0aGlzLnRpdGxlICYmIHRoaXMub3B0aW9ucy5zaG93VGl0bGUgJiYgaXNQZXJjZW50YWdlVmFsdWUodGhpcy5kaXNwbGF5Zm9ybWF0KTtcbiAgICAgICAgdGhpcy5vcHRpb25zLnRvRml4ZWQgPSBnZXREZWNpbWFsQ291bnQodGhpcy5kaXNwbGF5Zm9ybWF0KTtcblxuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnNob3dUaXRsZSkge1xuICAgICAgICAgICAgdGhpcy5vcHRpb25zLnRpdGxlID0gdGhpcy50aXRsZSB8fCAnYXV0byc7XG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMuc2hvd1N1YnRpdGxlID0gISF0aGlzLnN1YnRpdGxlO1xuICAgICAgICAgICAgdGhpcy5vcHRpb25zLnN1YnRpdGxlID0gdGhpcy5zdWJ0aXRsZSB8fCAnJztcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnJlZHJhdygpO1xuICAgIH1cblxuICAgIG9uUHJvcGVydHlDaGFuZ2Uoa2V5OiBzdHJpbmcsIG52OiBhbnksIG92PzogYW55KSB7XG4gICAgICAgIHN3aXRjaCAoa2V5KSB7XG4gICAgICAgICAgICBjYXNlICd0eXBlJzpcbiAgICAgICAgICAgICAgICB0aGlzLiRlbGVtZW50LnJlbW92ZUNsYXNzKFRZUEVfQ0xBU1NfTUFQW292XSk7XG4gICAgICAgICAgICAgICAgdGhpcy4kZWxlbWVudC5hZGRDbGFzcyhUWVBFX0NMQVNTX01BUFtudl0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnbWludmFsdWUnOlxuICAgICAgICAgICAgY2FzZSAnbWF4dmFsdWUnOlxuICAgICAgICAgICAgY2FzZSAnZGF0YXZhbHVlJzpcbiAgICAgICAgICAgICAgICBpZiAoaXNQZXJjZW50YWdlVmFsdWUodGhpcy5kYXRhdmFsdWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGVyY2VudGFnZXZhbHVlID0gcGFyc2VGbG9hdCh0aGlzLmRhdGF2YWx1ZSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wZXJjZW50YWdldmFsdWUgPSBjYWxjdWxhdGVQZXJjZW50KHBhcnNlRmxvYXQodGhpcy5kYXRhdmFsdWUpLCB0aGlzLm1pbnZhbHVlLCB0aGlzLm1heHZhbHVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICdkaXNwbGF5Zm9ybWF0JzpcbiAgICAgICAgICAgIGNhc2UgJ2NhcHRpb25wbGFjZW1lbnQnOlxuICAgICAgICAgICAgY2FzZSAndGl0bGUnOlxuICAgICAgICAgICAgY2FzZSAnc3VidGl0bGUnOlxuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlRGlzcGxheVZhbHVlRm9ybWF0KCk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgc3VwZXIub25Qcm9wZXJ0eUNoYW5nZShrZXksIG52LCBvdik7XG4gICAgfVxufVxuIl19