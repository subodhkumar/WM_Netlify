import * as tslib_1 from "tslib";
import { Component, Injector } from '@angular/core';
import { DataSource, validateDataSourceCtx } from '@wm/core';
import { styler } from '../../framework/styler';
import { registerProps } from './spinner.props';
import { StylableComponent } from '../base/stylable.component';
import { ImagePipe } from '../../../pipes/image.pipe';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
var DEFAULT_CLS = 'app-spinner';
var WIDGET_CONFIG = { widgetType: 'wm-spinner', hostClass: DEFAULT_CLS };
var SpinnerComponent = /** @class */ (function (_super) {
    tslib_1.__extends(SpinnerComponent, _super);
    function SpinnerComponent(inj, imagePipe) {
        var _this = _super.call(this, inj, WIDGET_CONFIG) || this;
        _this.imagePipe = imagePipe;
        _this.iconclass = '';
        _this.animation = '';
        _this.showCaption = true;
        styler(_this.nativeElement, _this);
        return _this;
    }
    Object.defineProperty(SpinnerComponent.prototype, "spinnerMessages", {
        get: function () {
            return this._spinnerMessages;
        },
        set: function (newVal) {
            this.showCaption = _.isEmpty(newVal);
            this._spinnerMessages = newVal;
        },
        enumerable: true,
        configurable: true
    });
    SpinnerComponent.prototype.listenOnDataSource = function () {
        var _this = this;
        var variables = _.split(this.servicevariabletotrack, ',');
        this.getAppInstance().subscribe('toggle-variable-state', function (data) {
            var name = data.variable.execute(DataSource.Operation.GET_NAME);
            if (_.includes(variables, name) && validateDataSourceCtx(data.variable, _this.getViewParent())) {
                _this.widget.show = data.active;
            }
        });
    };
    SpinnerComponent.prototype.onPropertyChange = function (key, nv, ov) {
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
            _super.prototype.onPropertyChange.call(this, key, nv, ov);
        }
    };
    SpinnerComponent.prototype.ngOnInit = function () {
        _super.prototype.ngOnInit.call(this);
        // if variables are to be listened to, hide the widget and set the listener
        if (this.servicevariabletotrack) {
            this.widget.show = false;
            this.listenOnDataSource();
        }
    };
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
    SpinnerComponent.ctorParameters = function () { return [
        { type: Injector },
        { type: ImagePipe }
    ]; };
    return SpinnerComponent;
}(StylableComponent));
export { SpinnerComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3Bpbm5lci5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL3NwaW5uZXIvc3Bpbm5lci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFVLE1BQU0sZUFBZSxDQUFDO0FBRTVELE9BQU8sRUFBRSxVQUFVLEVBQUUscUJBQXFCLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFN0QsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBRWhELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUNoRCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUMvRCxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDdEQsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFJakUsSUFBTSxXQUFXLEdBQUcsYUFBYSxDQUFDO0FBQ2xDLElBQU0sYUFBYSxHQUFrQixFQUFDLFVBQVUsRUFBRSxZQUFZLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBQyxDQUFDO0FBRXhGO0lBT3NDLDRDQUFpQjtJQWlDbkQsMEJBQVksR0FBYSxFQUFVLFNBQW9CO1FBQXZELFlBQ0ksa0JBQU0sR0FBRyxFQUFFLGFBQWEsQ0FBQyxTQUU1QjtRQUhrQyxlQUFTLEdBQVQsU0FBUyxDQUFXO1FBOUJoRCxlQUFTLEdBQUcsRUFBRSxDQUFDO1FBQ2YsZUFBUyxHQUFHLEVBQUUsQ0FBQztRQU9mLGlCQUFXLEdBQUcsSUFBSSxDQUFDO1FBd0J0QixNQUFNLENBQUMsS0FBSSxDQUFDLGFBQWEsRUFBRSxLQUFJLENBQUMsQ0FBQzs7SUFDckMsQ0FBQztJQXRCRCxzQkFBVyw2Q0FBZTthQUExQjtZQUNJLE9BQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDO1FBQ2pDLENBQUM7YUFFRCxVQUEyQixNQUFNO1lBQzdCLElBQUksQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNyQyxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsTUFBTSxDQUFDO1FBQ25DLENBQUM7OztPQUxBO0lBT08sNkNBQWtCLEdBQTFCO1FBQUEsaUJBUUM7UUFQRyxJQUFNLFNBQVMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxzQkFBc0IsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUM1RCxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUMsU0FBUyxDQUFDLHVCQUF1QixFQUFFLFVBQUEsSUFBSTtZQUN6RCxJQUFNLElBQUksR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ2xFLElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLElBQUkscUJBQXFCLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxLQUFJLENBQUMsYUFBYSxFQUFFLENBQUMsRUFBRTtnQkFDM0YsS0FBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQzthQUNsQztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQU9ELDJDQUFnQixHQUFoQixVQUFpQixHQUFXLEVBQUUsRUFBTyxFQUFFLEVBQVE7UUFDM0MsSUFBSSxHQUFHLEtBQUssT0FBTyxFQUFFO1lBQ2pCLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDL0M7YUFBTSxJQUFJLEdBQUcsS0FBSyxXQUFXLEVBQUU7WUFDNUIsSUFBSSxFQUFFLEtBQUssTUFBTSxFQUFFO2dCQUNmLElBQUksQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO2FBQzlCO2lCQUFNO2dCQUNILElBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxJQUFJLEVBQUUsQ0FBQzthQUM3QjtTQUNKO2FBQU07WUFDSCxpQkFBTSxnQkFBZ0IsWUFBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1NBQ3ZDO0lBQ0wsQ0FBQztJQUVELG1DQUFRLEdBQVI7UUFDSSxpQkFBTSxRQUFRLFdBQUUsQ0FBQztRQUNqQiwyRUFBMkU7UUFDM0UsSUFBSSxJQUFJLENBQUMsc0JBQXNCLEVBQUU7WUFDN0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDO1lBQ3pCLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1NBQzdCO0lBQ0wsQ0FBQztJQTFETSxnQ0FBZSxHQUFHLGFBQWEsRUFBRSxDQUFDOztnQkFSNUMsU0FBUyxTQUFDO29CQUNQLFFBQVEsRUFBRSxhQUFhO29CQUN2Qiwyd0JBQXVDO29CQUN2QyxTQUFTLEVBQUU7d0JBQ1Asa0JBQWtCLENBQUMsZ0JBQWdCLENBQUM7cUJBQ3ZDO2lCQUNKOzs7O2dCQXRCbUIsUUFBUTtnQkFRbkIsU0FBUzs7SUEyRWxCLHVCQUFDO0NBQUEsQUFuRUQsQ0FPc0MsaUJBQWlCLEdBNER0RDtTQTVEWSxnQkFBZ0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIEluamVjdG9yLCBPbkluaXQgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgRGF0YVNvdXJjZSwgdmFsaWRhdGVEYXRhU291cmNlQ3R4IH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5pbXBvcnQgeyBzdHlsZXIgfSBmcm9tICcuLi8uLi9mcmFtZXdvcmsvc3R5bGVyJztcbmltcG9ydCB7IElXaWRnZXRDb25maWcgfSBmcm9tICcuLi8uLi9mcmFtZXdvcmsvdHlwZXMnO1xuaW1wb3J0IHsgcmVnaXN0ZXJQcm9wcyB9IGZyb20gJy4vc3Bpbm5lci5wcm9wcyc7XG5pbXBvcnQgeyBTdHlsYWJsZUNvbXBvbmVudCB9IGZyb20gJy4uL2Jhc2Uvc3R5bGFibGUuY29tcG9uZW50JztcbmltcG9ydCB7IEltYWdlUGlwZSB9IGZyb20gJy4uLy4uLy4uL3BpcGVzL2ltYWdlLnBpcGUnO1xuaW1wb3J0IHsgcHJvdmlkZUFzV2lkZ2V0UmVmIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvd2lkZ2V0LXV0aWxzJztcblxuZGVjbGFyZSBjb25zdCBfO1xuXG5jb25zdCBERUZBVUxUX0NMUyA9ICdhcHAtc3Bpbm5lcic7XG5jb25zdCBXSURHRVRfQ09ORklHOiBJV2lkZ2V0Q29uZmlnID0ge3dpZGdldFR5cGU6ICd3bS1zcGlubmVyJywgaG9zdENsYXNzOiBERUZBVUxUX0NMU307XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnW3dtU3Bpbm5lcl0nLFxuICAgIHRlbXBsYXRlVXJsOiAnLi9zcGlubmVyLmNvbXBvbmVudC5odG1sJyxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgcHJvdmlkZUFzV2lkZ2V0UmVmKFNwaW5uZXJDb21wb25lbnQpXG4gICAgXVxufSlcbmV4cG9ydCBjbGFzcyBTcGlubmVyQ29tcG9uZW50IGV4dGVuZHMgU3R5bGFibGVDb21wb25lbnQgaW1wbGVtZW50cyBPbkluaXQge1xuICAgIHN0YXRpYyBpbml0aWFsaXplUHJvcHMgPSByZWdpc3RlclByb3BzKCk7XG5cbiAgICBwdWJsaWMgaWNvbmNsYXNzID0gJyc7XG4gICAgcHVibGljIGFuaW1hdGlvbiA9ICcnO1xuICAgIHB1YmxpYyBpbWFnZXdpZHRoO1xuICAgIHB1YmxpYyBpbWFnZWhlaWdodDtcbiAgICBwdWJsaWMgc2VydmljZXZhcmlhYmxldG90cmFjazogc3RyaW5nO1xuICAgIHB1YmxpYyBzaG93OiBib29sZWFuO1xuICAgIHByaXZhdGUgcGljdHVyZTogc3RyaW5nO1xuICAgIHByaXZhdGUgX3NwaW5uZXJNZXNzYWdlcztcbiAgICBwdWJsaWMgc2hvd0NhcHRpb24gPSB0cnVlO1xuICAgIHB1YmxpYyB0eXBlOiBhbnk7XG5cbiAgICBwdWJsaWMgZ2V0IHNwaW5uZXJNZXNzYWdlcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NwaW5uZXJNZXNzYWdlcztcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0IHNwaW5uZXJNZXNzYWdlcyhuZXdWYWwpIHtcbiAgICAgICAgdGhpcy5zaG93Q2FwdGlvbiA9IF8uaXNFbXB0eShuZXdWYWwpO1xuICAgICAgICB0aGlzLl9zcGlubmVyTWVzc2FnZXMgPSBuZXdWYWw7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBsaXN0ZW5PbkRhdGFTb3VyY2UoKSB7XG4gICAgICAgIGNvbnN0IHZhcmlhYmxlcyA9IF8uc3BsaXQodGhpcy5zZXJ2aWNldmFyaWFibGV0b3RyYWNrLCAnLCcpO1xuICAgICAgICB0aGlzLmdldEFwcEluc3RhbmNlKCkuc3Vic2NyaWJlKCd0b2dnbGUtdmFyaWFibGUtc3RhdGUnLCBkYXRhID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5hbWUgPSBkYXRhLnZhcmlhYmxlLmV4ZWN1dGUoRGF0YVNvdXJjZS5PcGVyYXRpb24uR0VUX05BTUUpO1xuICAgICAgICAgICAgaWYgKF8uaW5jbHVkZXModmFyaWFibGVzLCBuYW1lKSAmJiB2YWxpZGF0ZURhdGFTb3VyY2VDdHgoZGF0YS52YXJpYWJsZSwgdGhpcy5nZXRWaWV3UGFyZW50KCkpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy53aWRnZXQuc2hvdyA9IGRhdGEuYWN0aXZlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3Rvcihpbmo6IEluamVjdG9yLCBwcml2YXRlIGltYWdlUGlwZTogSW1hZ2VQaXBlKSB7XG4gICAgICAgIHN1cGVyKGluaiwgV0lER0VUX0NPTkZJRyk7XG4gICAgICAgIHN0eWxlcih0aGlzLm5hdGl2ZUVsZW1lbnQsIHRoaXMpO1xuICAgIH1cblxuICAgIG9uUHJvcGVydHlDaGFuZ2Uoa2V5OiBzdHJpbmcsIG52OiBhbnksIG92PzogYW55KSB7XG4gICAgICAgIGlmIChrZXkgPT09ICdpbWFnZScpIHtcbiAgICAgICAgICAgIHRoaXMucGljdHVyZSA9IHRoaXMuaW1hZ2VQaXBlLnRyYW5zZm9ybShudik7XG4gICAgICAgIH0gZWxzZSBpZiAoa2V5ID09PSAnYW5pbWF0aW9uJykge1xuICAgICAgICAgICAgaWYgKG52ID09PSAnc3BpbicpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFuaW1hdGlvbiA9ICdmYS1zcGluJztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hbmltYXRpb24gPSBudiB8fCAnJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN1cGVyLm9uUHJvcGVydHlDaGFuZ2Uoa2V5LCBudiwgb3YpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgbmdPbkluaXQoKSB7XG4gICAgICAgIHN1cGVyLm5nT25Jbml0KCk7XG4gICAgICAgIC8vIGlmIHZhcmlhYmxlcyBhcmUgdG8gYmUgbGlzdGVuZWQgdG8sIGhpZGUgdGhlIHdpZGdldCBhbmQgc2V0IHRoZSBsaXN0ZW5lclxuICAgICAgICBpZiAodGhpcy5zZXJ2aWNldmFyaWFibGV0b3RyYWNrKSB7XG4gICAgICAgICAgICB0aGlzLndpZGdldC5zaG93ID0gZmFsc2U7XG4gICAgICAgICAgICB0aGlzLmxpc3Rlbk9uRGF0YVNvdXJjZSgpO1xuICAgICAgICB9XG4gICAgfVxufVxuIl19