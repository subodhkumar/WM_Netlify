import { Component, ElementRef, Injector, ViewChild } from '@angular/core';
import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { registerProps } from './card.props';
import { MenuAdapterComponent } from '../base/menu-adapator.component';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
const DEFAULT_CLS = 'app-card card app-panel';
const WIDGET_CONFIG = {
    widgetType: 'wm-card',
    hostClass: DEFAULT_CLS
};
export class CardComponent extends MenuAdapterComponent {
    constructor(inj) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this, APPLY_STYLES_TYPE.SHELL);
    }
    ngAfterViewInit() {
        super.ngAfterViewInit();
        styler(this.cardContainerElRef.nativeElement, this, APPLY_STYLES_TYPE.INNER_SHELL);
    }
    onPropertyChange(key, nv, ov) {
        if (key === 'title' || key === 'subheading' || key === 'iconclass' || key === 'iconurl' || key === 'actions') {
            this.showHeader = !!(this.title || this.subheading || this.iconclass || this.iconurl || this.actions);
        }
        else {
            super.onPropertyChange(key, nv, ov);
        }
    }
}
CardComponent.initializeProps = registerProps();
CardComponent.decorators = [
    { type: Component, args: [{
                selector: '[wmCard]',
                template: "<div class=\"app-card-header panel-heading\" *ngIf=\"showHeader\">\n    <div class=\"app-card-avatar\" *ngIf=\"iconclass || iconurl\">\n        <i class=\"app-icon\" [ngClass]=\"iconclass\" *ngIf=\"iconclass && !iconurl\"></i>\n        <img class=\"img-circle\" [src]=\"iconurl\" *ngIf=\"iconurl\" />\n    </div>\n    <div class=\"app-card-header-text\">\n        <h4 class=\"card-heading\" [textContent]=\"title\"></h4>\n        <h5 class=\"card-subheading text-muted\" [textContent]=\"subheading\"></h5>\n    </div>\n    <div class=\"panel-actions\" *ngIf=\"actions\">\n        <!-- TODO(punith) need to bind autoclose-->\n        <div wmMenu dropdown\n             [autoClose]=\"autoclose !== 'disabled'\"\n             class=\"panel-action\"\n             type=\"anchor\"\n             iconclass=\"wi wi-more-vert\"\n             menuposition=\"down,left\"\n             hint=\"Actions\"\n             caption=\"\"\n             dataset.bind=\"actions\">\n        </div>\n    </div>\n</div>\n<div class=\"app-card-image\" *ngIf=\"picturesource\"  [ngStyle]=\"{'max-height':imageheight}\">\n   <img wmPicture class=\"card-image\" picturesource.bind=\"picturesource\" hint.bind=\"picturetitle\" />\n</div>\n<div #cardContainerWrapper>\n    <ng-content select=\"[wmCardContent]\"></ng-content>\n</div>\n<div>\n    <ng-content select=\"[wmCardActions]\"></ng-content>\n</div>\n<div>\n    <ng-content select=\"[wmCardFooter]\"></ng-content>\n</div>",
                providers: [
                    provideAsWidgetRef(CardComponent)
                ]
            }] }
];
/** @nocollapse */
CardComponent.ctorParameters = () => [
    { type: Injector }
];
CardComponent.propDecorators = {
    cardContainerElRef: [{ type: ViewChild, args: ['cardContainerWrapper',] }]
};
// Todo(swathi) - menu
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FyZC5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL2NhcmQvY2FyZC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFpQixTQUFTLEVBQUUsVUFBVSxFQUFFLFFBQVEsRUFBVSxTQUFTLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFbEcsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBRW5FLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFDN0MsT0FBTyxFQUFFLG9CQUFvQixFQUFFLE1BQU0saUNBQWlDLENBQUM7QUFDdkUsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFFakUsTUFBTSxXQUFXLEdBQUcseUJBQXlCLENBQUM7QUFDOUMsTUFBTSxhQUFhLEdBQWtCO0lBQ2pDLFVBQVUsRUFBRSxTQUFTO0lBQ3JCLFNBQVMsRUFBRSxXQUFXO0NBQ3pCLENBQUM7QUFTRixNQUFNLE9BQU8sYUFBYyxTQUFRLG9CQUFvQjtJQVluRCxZQUFZLEdBQWE7UUFDckIsS0FBSyxDQUFDLEdBQUcsRUFBRSxhQUFhLENBQUMsQ0FBQztRQUMxQixNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLEVBQUUsaUJBQWlCLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDOUQsQ0FBQztJQUVELGVBQWU7UUFDWCxLQUFLLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDeEIsTUFBTSxDQUFDLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxhQUFhLEVBQUUsSUFBSSxFQUFFLGlCQUFpQixDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ3ZGLENBQUM7SUFFRCxnQkFBZ0IsQ0FBQyxHQUFXLEVBQUUsRUFBTyxFQUFFLEVBQVE7UUFDM0MsSUFBSSxHQUFHLEtBQUssT0FBTyxJQUFJLEdBQUcsS0FBSyxZQUFZLElBQUksR0FBRyxLQUFLLFdBQVcsSUFBSSxHQUFHLEtBQUssU0FBUyxJQUFJLEdBQUcsS0FBSyxTQUFTLEVBQUU7WUFDMUcsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxJQUFJLElBQUksQ0FBQyxVQUFVLElBQUksSUFBSSxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsT0FBTyxJQUFJLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUN6RzthQUFNO1lBQ0gsS0FBSyxDQUFDLGdCQUFnQixDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7U0FDdkM7SUFDTCxDQUFDOztBQTNCTSw2QkFBZSxHQUFHLGFBQWEsRUFBRSxDQUFDOztZQVI1QyxTQUFTLFNBQUM7Z0JBQ1AsUUFBUSxFQUFFLFVBQVU7Z0JBQ3BCLG03Q0FBb0M7Z0JBQ3BDLFNBQVMsRUFBRTtvQkFDUCxrQkFBa0IsQ0FBQyxhQUFhLENBQUM7aUJBQ3BDO2FBQ0o7Ozs7WUFwQjhDLFFBQVE7OztpQ0ErQmxELFNBQVMsU0FBQyxzQkFBc0I7O0FBcUJyQyxzQkFBc0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBZnRlclZpZXdJbml0LCBDb21wb25lbnQsIEVsZW1lbnRSZWYsIEluamVjdG9yLCBPbkluaXQsIFZpZXdDaGlsZCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBBUFBMWV9TVFlMRVNfVFlQRSwgc3R5bGVyIH0gZnJvbSAnLi4vLi4vZnJhbWV3b3JrL3N0eWxlcic7XG5pbXBvcnQgeyBJV2lkZ2V0Q29uZmlnIH0gZnJvbSAnLi4vLi4vZnJhbWV3b3JrL3R5cGVzJztcbmltcG9ydCB7IHJlZ2lzdGVyUHJvcHMgfSBmcm9tICcuL2NhcmQucHJvcHMnO1xuaW1wb3J0IHsgTWVudUFkYXB0ZXJDb21wb25lbnQgfSBmcm9tICcuLi9iYXNlL21lbnUtYWRhcGF0b3IuY29tcG9uZW50JztcbmltcG9ydCB7IHByb3ZpZGVBc1dpZGdldFJlZiB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL3dpZGdldC11dGlscyc7XG5cbmNvbnN0IERFRkFVTFRfQ0xTID0gJ2FwcC1jYXJkIGNhcmQgYXBwLXBhbmVsJztcbmNvbnN0IFdJREdFVF9DT05GSUc6IElXaWRnZXRDb25maWcgPSB7XG4gICAgd2lkZ2V0VHlwZTogJ3dtLWNhcmQnLFxuICAgIGhvc3RDbGFzczogREVGQVVMVF9DTFNcbn07XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnW3dtQ2FyZF0nLFxuICAgIHRlbXBsYXRlVXJsOiAnLi9jYXJkLmNvbXBvbmVudC5odG1sJyxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgcHJvdmlkZUFzV2lkZ2V0UmVmKENhcmRDb21wb25lbnQpXG4gICAgXVxufSlcbmV4cG9ydCBjbGFzcyBDYXJkQ29tcG9uZW50IGV4dGVuZHMgTWVudUFkYXB0ZXJDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQsIEFmdGVyVmlld0luaXQge1xuICAgIHN0YXRpYyBpbml0aWFsaXplUHJvcHMgPSByZWdpc3RlclByb3BzKCk7XG5cbiAgICBwdWJsaWMgc2hvd0hlYWRlcjogYm9vbGVhbjtcbiAgICBwdWJsaWMgdGl0bGU6IHN0cmluZztcbiAgICBwdWJsaWMgc3ViaGVhZGluZzogc3RyaW5nO1xuICAgIHB1YmxpYyBpY29uY2xhc3M6IHN0cmluZztcbiAgICBwdWJsaWMgaWNvbnVybDogc3RyaW5nO1xuICAgIHB1YmxpYyBhY3Rpb25zOiBzdHJpbmc7XG5cbiAgICBAVmlld0NoaWxkKCdjYXJkQ29udGFpbmVyV3JhcHBlcicpIHByaXZhdGUgY2FyZENvbnRhaW5lckVsUmVmOiBFbGVtZW50UmVmO1xuXG4gICAgY29uc3RydWN0b3IoaW5qOiBJbmplY3Rvcikge1xuICAgICAgICBzdXBlcihpbmosIFdJREdFVF9DT05GSUcpO1xuICAgICAgICBzdHlsZXIodGhpcy5uYXRpdmVFbGVtZW50LCB0aGlzLCBBUFBMWV9TVFlMRVNfVFlQRS5TSEVMTCk7XG4gICAgfVxuXG4gICAgbmdBZnRlclZpZXdJbml0KCkge1xuICAgICAgICBzdXBlci5uZ0FmdGVyVmlld0luaXQoKTtcbiAgICAgICAgc3R5bGVyKHRoaXMuY2FyZENvbnRhaW5lckVsUmVmLm5hdGl2ZUVsZW1lbnQsIHRoaXMsIEFQUExZX1NUWUxFU19UWVBFLklOTkVSX1NIRUxMKTtcbiAgICB9XG5cbiAgICBvblByb3BlcnR5Q2hhbmdlKGtleTogc3RyaW5nLCBudjogYW55LCBvdj86IGFueSkge1xuICAgICAgICBpZiAoa2V5ID09PSAndGl0bGUnIHx8IGtleSA9PT0gJ3N1YmhlYWRpbmcnIHx8IGtleSA9PT0gJ2ljb25jbGFzcycgfHwga2V5ID09PSAnaWNvbnVybCcgfHwga2V5ID09PSAnYWN0aW9ucycpIHtcbiAgICAgICAgICAgIHRoaXMuc2hvd0hlYWRlciA9ICEhKHRoaXMudGl0bGUgfHwgdGhpcy5zdWJoZWFkaW5nIHx8IHRoaXMuaWNvbmNsYXNzIHx8IHRoaXMuaWNvbnVybCB8fCB0aGlzLmFjdGlvbnMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3VwZXIub25Qcm9wZXJ0eUNoYW5nZShrZXksIG52LCBvdik7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8vIFRvZG8oc3dhdGhpKSAtIG1lbnVcbiJdfQ==