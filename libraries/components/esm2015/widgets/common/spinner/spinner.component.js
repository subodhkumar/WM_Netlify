import { Component, Injector } from '@angular/core';
import { DataSource, validateDataSourceCtx } from '@wm/core';
import { styler } from '../../framework/styler';
import { registerProps } from './spinner.props';
import { StylableComponent } from '../base/stylable.component';
import { ImagePipe } from '../../../pipes/image.pipe';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
const DEFAULT_CLS = 'app-spinner';
const WIDGET_CONFIG = { widgetType: 'wm-spinner', hostClass: DEFAULT_CLS };
export class SpinnerComponent extends StylableComponent {
    constructor(inj, imagePipe) {
        super(inj, WIDGET_CONFIG);
        this.imagePipe = imagePipe;
        this.iconclass = '';
        this.animation = '';
        this.showCaption = true;
        styler(this.nativeElement, this);
    }
    get spinnerMessages() {
        return this._spinnerMessages;
    }
    set spinnerMessages(newVal) {
        this.showCaption = _.isEmpty(newVal);
        this._spinnerMessages = newVal;
    }
    listenOnDataSource() {
        const variables = _.split(this.servicevariabletotrack, ',');
        this.getAppInstance().subscribe('toggle-variable-state', data => {
            const name = data.variable.execute(DataSource.Operation.GET_NAME);
            if (_.includes(variables, name) && validateDataSourceCtx(data.variable, this.getViewParent())) {
                this.widget.show = data.active;
            }
        });
    }
    onPropertyChange(key, nv, ov) {
        if (key === 'image') {
            this.picture = this.imagePipe.transform(nv);
        }
        else if (key === 'animation') {
            if (nv === 'spin') {
                this.animation = 'fa-spin';
            }
            else {
                this.animation = nv || '';
            }
        }
        else {
            super.onPropertyChange(key, nv, ov);
        }
    }
    ngOnInit() {
        super.ngOnInit();
        // if variables are to be listened to, hide the widget and set the listener
        if (this.servicevariabletotrack) {
            this.widget.show = false;
            this.listenOnDataSource();
        }
    }
}
SpinnerComponent.initializeProps = registerProps();
SpinnerComponent.decorators = [
    { type: Component, args: [{
                selector: '[wmSpinner]',
                template: "<div class=\"spinner-message\" aria-label=\"loading gif\">\n    <span class=\"spinner-image animated infinite\" [ngClass]=\"animation\" aria-hidden=\"true\"\n        [ngStyle]=\"{width: imagewidth, height: imageheight, backgroundImage: 'url(' + picture + ')', backgroundSize: imagewidth}\"\n        *ngIf=\"type === 'image'\"></span>\n    <i class=\"spinner-image animated infinite\" [ngClass]=\"[iconclass, animation]\" [style.fonSize]=\"iconsize\" *ngIf=\"type === 'icon'\"></i>\n    <span class=\"spinner-text\" [innerHTML]=\"caption | trustAs: 'html'\" *ngIf=\"showCaption\"></span>\n    <div class=\"spinner-messages\" *ngIf=\"!showCaption && spinnerMessages\">\n        <p *ngFor=\"let value of spinnerMessages\" [textContent]=\"value\"></p>\n    </div>\n</div>",
                providers: [
                    provideAsWidgetRef(SpinnerComponent)
                ]
            }] }
];
/** @nocollapse */
SpinnerComponent.ctorParameters = () => [
    { type: Injector },
    { type: ImagePipe }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3Bpbm5lci5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL3NwaW5uZXIvc3Bpbm5lci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQVUsTUFBTSxlQUFlLENBQUM7QUFFNUQsT0FBTyxFQUFFLFVBQVUsRUFBRSxxQkFBcUIsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUU3RCxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFFaEQsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQ2hELE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQy9ELE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUN0RCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUlqRSxNQUFNLFdBQVcsR0FBRyxhQUFhLENBQUM7QUFDbEMsTUFBTSxhQUFhLEdBQWtCLEVBQUMsVUFBVSxFQUFFLFlBQVksRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFDLENBQUM7QUFTeEYsTUFBTSxPQUFPLGdCQUFpQixTQUFRLGlCQUFpQjtJQWlDbkQsWUFBWSxHQUFhLEVBQVUsU0FBb0I7UUFDbkQsS0FBSyxDQUFDLEdBQUcsRUFBRSxhQUFhLENBQUMsQ0FBQztRQURLLGNBQVMsR0FBVCxTQUFTLENBQVc7UUE5QmhELGNBQVMsR0FBRyxFQUFFLENBQUM7UUFDZixjQUFTLEdBQUcsRUFBRSxDQUFDO1FBT2YsZ0JBQVcsR0FBRyxJQUFJLENBQUM7UUF3QnRCLE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUF0QkQsSUFBVyxlQUFlO1FBQ3RCLE9BQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDO0lBQ2pDLENBQUM7SUFFRCxJQUFXLGVBQWUsQ0FBQyxNQUFNO1FBQzdCLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNyQyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsTUFBTSxDQUFDO0lBQ25DLENBQUM7SUFFTyxrQkFBa0I7UUFDdEIsTUFBTSxTQUFTLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsc0JBQXNCLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDNUQsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDLFNBQVMsQ0FBQyx1QkFBdUIsRUFBRSxJQUFJLENBQUMsRUFBRTtZQUM1RCxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ2xFLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLElBQUkscUJBQXFCLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUMsRUFBRTtnQkFDM0YsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQzthQUNsQztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQU9ELGdCQUFnQixDQUFDLEdBQVcsRUFBRSxFQUFPLEVBQUUsRUFBUTtRQUMzQyxJQUFJLEdBQUcsS0FBSyxPQUFPLEVBQUU7WUFDakIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsQ0FBQztTQUMvQzthQUFNLElBQUksR0FBRyxLQUFLLFdBQVcsRUFBRTtZQUM1QixJQUFJLEVBQUUsS0FBSyxNQUFNLEVBQUU7Z0JBQ2YsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7YUFDOUI7aUJBQU07Z0JBQ0gsSUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLElBQUksRUFBRSxDQUFDO2FBQzdCO1NBQ0o7YUFBTTtZQUNILEtBQUssQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1NBQ3ZDO0lBQ0wsQ0FBQztJQUVELFFBQVE7UUFDSixLQUFLLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDakIsMkVBQTJFO1FBQzNFLElBQUksSUFBSSxDQUFDLHNCQUFzQixFQUFFO1lBQzdCLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxHQUFHLEtBQUssQ0FBQztZQUN6QixJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztTQUM3QjtJQUNMLENBQUM7O0FBMURNLGdDQUFlLEdBQUcsYUFBYSxFQUFFLENBQUM7O1lBUjVDLFNBQVMsU0FBQztnQkFDUCxRQUFRLEVBQUUsYUFBYTtnQkFDdkIsMndCQUF1QztnQkFDdkMsU0FBUyxFQUFFO29CQUNQLGtCQUFrQixDQUFDLGdCQUFnQixDQUFDO2lCQUN2QzthQUNKOzs7O1lBdEJtQixRQUFRO1lBUW5CLFNBQVMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIEluamVjdG9yLCBPbkluaXQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgRGF0YVNvdXJjZSwgdmFsaWRhdGVEYXRhU291cmNlQ3R4IH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5pbXBvcnQgeyBzdHlsZXIgfSBmcm9tICcuLi8uLi9mcmFtZXdvcmsvc3R5bGVyJztcbmltcG9ydCB7IElXaWRnZXRDb25maWcgfSBmcm9tICcuLi8uLi9mcmFtZXdvcmsvdHlwZXMnO1xuaW1wb3J0IHsgcmVnaXN0ZXJQcm9wcyB9IGZyb20gJy4vc3Bpbm5lci5wcm9wcyc7XG5pbXBvcnQgeyBTdHlsYWJsZUNvbXBvbmVudCB9IGZyb20gJy4uL2Jhc2Uvc3R5bGFibGUuY29tcG9uZW50JztcbmltcG9ydCB7IEltYWdlUGlwZSB9IGZyb20gJy4uLy4uLy4uL3BpcGVzL2ltYWdlLnBpcGUnO1xuaW1wb3J0IHsgcHJvdmlkZUFzV2lkZ2V0UmVmIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvd2lkZ2V0LXV0aWxzJztcblxuZGVjbGFyZSBjb25zdCBfO1xuXG5jb25zdCBERUZBVUxUX0NMUyA9ICdhcHAtc3Bpbm5lcic7XG5jb25zdCBXSURHRVRfQ09ORklHOiBJV2lkZ2V0Q29uZmlnID0ge3dpZGdldFR5cGU6ICd3bS1zcGlubmVyJywgaG9zdENsYXNzOiBERUZBVUxUX0NMU307XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnW3dtU3Bpbm5lcl0nLFxuICAgIHRlbXBsYXRlVXJsOiAnLi9zcGlubmVyLmNvbXBvbmVudC5odG1sJyxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgcHJvdmlkZUFzV2lkZ2V0UmVmKFNwaW5uZXJDb21wb25lbnQpXG4gICAgXVxufSlcbmV4cG9ydCBjbGFzcyBTcGlubmVyQ29tcG9uZW50IGV4dGVuZHMgU3R5bGFibGVDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQge1xuICAgIHN0YXRpYyBpbml0aWFsaXplUHJvcHMgPSByZWdpc3RlclByb3BzKCk7XG5cbiAgICBwdWJsaWMgaWNvbmNsYXNzID0gJyc7XG4gICAgcHVibGljIGFuaW1hdGlvbiA9ICcnO1xuICAgIHB1YmxpYyBpbWFnZXdpZHRoO1xuICAgIHB1YmxpYyBpbWFnZWhlaWdodDtcbiAgICBwdWJsaWMgc2VydmljZXZhcmlhYmxldG90cmFjazogc3RyaW5nO1xuICAgIHB1YmxpYyBzaG93OiBib29sZWFuO1xuICAgIHByaXZhdGUgcGljdHVyZTogc3RyaW5nO1xuICAgIHByaXZhdGUgX3NwaW5uZXJNZXNzYWdlcztcbiAgICBwdWJsaWMgc2hvd0NhcHRpb24gPSB0cnVlO1xuICAgIHB1YmxpYyB0eXBlOiBhbnk7XG5cbiAgICBwdWJsaWMgZ2V0IHNwaW5uZXJNZXNzYWdlcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NwaW5uZXJNZXNzYWdlcztcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0IHNwaW5uZXJNZXNzYWdlcyhuZXdWYWwpIHtcbiAgICAgICAgdGhpcy5zaG93Q2FwdGlvbiA9IF8uaXNFbXB0eShuZXdWYWwpO1xuICAgICAgICB0aGlzLl9zcGlubmVyTWVzc2FnZXMgPSBuZXdWYWw7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBsaXN0ZW5PbkRhdGFTb3VyY2UoKSB7XG4gICAgICAgIGNvbnN0IHZhcmlhYmxlcyA9IF8uc3BsaXQodGhpcy5zZXJ2aWNldmFyaWFibGV0b3RyYWNrLCAnLCcpO1xuICAgICAgICB0aGlzLmdldEFwcEluc3RhbmNlKCkuc3Vic2NyaWJlKCd0b2dnbGUtdmFyaWFibGUtc3RhdGUnLCBkYXRhID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5hbWUgPSBkYXRhLnZhcmlhYmxlLmV4ZWN1dGUoRGF0YVNvdXJjZS5PcGVyYXRpb24uR0VUX05BTUUpO1xuICAgICAgICAgICAgaWYgKF8uaW5jbHVkZXModmFyaWFibGVzLCBuYW1lKSAmJiB2YWxpZGF0ZURhdGFTb3VyY2VDdHgoZGF0YS52YXJpYWJsZSwgdGhpcy5nZXRWaWV3UGFyZW50KCkpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy53aWRnZXQuc2hvdyA9IGRhdGEuYWN0aXZlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3Rvcihpbmo6IEluamVjdG9yLCBwcml2YXRlIGltYWdlUGlwZTogSW1hZ2VQaXBlKSB7XG4gICAgICAgIHN1cGVyKGluaiwgV0lER0VUX0NPTkZJRyk7XG4gICAgICAgIHN0eWxlcih0aGlzLm5hdGl2ZUVsZW1lbnQsIHRoaXMpO1xuICAgIH1cblxuICAgIG9uUHJvcGVydHlDaGFuZ2Uoa2V5OiBzdHJpbmcsIG52OiBhbnksIG92PzogYW55KSB7XG4gICAgICAgIGlmIChrZXkgPT09ICdpbWFnZScpIHtcbiAgICAgICAgICAgIHRoaXMucGljdHVyZSA9IHRoaXMuaW1hZ2VQaXBlLnRyYW5zZm9ybShudik7XG4gICAgICAgIH0gZWxzZSBpZiAoa2V5ID09PSAnYW5pbWF0aW9uJykge1xuICAgICAgICAgICAgaWYgKG52ID09PSAnc3BpbicpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFuaW1hdGlvbiA9ICdmYS1zcGluJztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hbmltYXRpb24gPSBudiB8fCAnJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN1cGVyLm9uUHJvcGVydHlDaGFuZ2Uoa2V5LCBudiwgb3YpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgbmdPbkluaXQoKSB7XG4gICAgICAgIHN1cGVyLm5nT25Jbml0KCk7XG4gICAgICAgIC8vIGlmIHZhcmlhYmxlcyBhcmUgdG8gYmUgbGlzdGVuZWQgdG8sIGhpZGUgdGhlIHdpZGdldCBhbmQgc2V0IHRoZSBsaXN0ZW5lclxuICAgICAgICBpZiAodGhpcy5zZXJ2aWNldmFyaWFibGV0b3RyYWNrKSB7XG4gICAgICAgICAgICB0aGlzLndpZGdldC5zaG93ID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmxpc3Rlbk9uRGF0YVNvdXJjZSgpO1xuICAgICAgICB9XG4gICAgfVxufVxuIl19