import * as tslib_1 from "tslib";
import { Component, ContentChild, Injector, TemplateRef } from '@angular/core';
import { $appDigest, $parseExpr, addClass, isArray, isObject, isString, removeClass } from '@wm/core';
import { APPLY_STYLES_TYPE, provideAsWidgetRef, StylableComponent, styler } from '@wm/components';
import { registerProps } from './media-list.props';
var DEFAULT_CLS = 'app-medialist';
var WIDGET_CONFIG = { widgetType: 'wm-media-list', hostClass: DEFAULT_CLS };
var Layout;
(function (Layout) {
    Layout["SINGLE_ROW"] = "Single-row";
    Layout["MULTI_ROW"] = "Multi-row";
})(Layout || (Layout = {}));
var MediaListComponent = /** @class */ (function (_super) {
    tslib_1.__extends(MediaListComponent, _super);
    function MediaListComponent(inj) {
        var _this = _super.call(this, inj, WIDGET_CONFIG) || this;
        _this.selectedMediaIndex = -1;
        styler(_this.nativeElement, _this, APPLY_STYLES_TYPE.SCROLLABLE_CONTAINER);
        return _this;
    }
    MediaListComponent.prototype.appendToBody = function () {
        var _this = this;
        if (!this.$fullScreenEle) {
            setTimeout(function () {
                _this.$fullScreenEle = _this.$element.find('>.app-media-fullscreen');
                _this.$fullScreenEle.appendTo('body:first');
            }, 100);
        }
        return true;
    };
    MediaListComponent.prototype.onPropertyChange = function (key, nv, ov) {
        if (key === 'dataset') {
            this.onDataChange(nv);
        }
        else if (key === 'layout') {
            if (nv === Layout.SINGLE_ROW) {
                addClass(this.nativeElement, 'singlerow');
            }
            else {
                removeClass(this.nativeElement, 'singlerow');
            }
        }
        else {
            _super.prototype.onPropertyChange.call(this, key, nv, ov);
        }
    };
    MediaListComponent.prototype.exitFullScreen = function () {
        this.selectedMediaIndex = -1;
        this.$fullScreenEle.appendTo(this.$element);
        this.$fullScreenEle = null;
        $appDigest();
    };
    MediaListComponent.prototype.getPicTitle = function () {
        return this.selectedMediaIndex + 1 + '/' + this.fieldDefs.length;
    };
    MediaListComponent.prototype.showFullScreen = function (i) {
        this.selectedMediaIndex = i;
        $appDigest();
    };
    MediaListComponent.prototype.showNext = function () {
        if (this.selectedMediaIndex < this.fieldDefs.length - 1) {
            this.selectedMediaIndex++;
            $appDigest();
        }
    };
    // Returns the field value (src) from the fieldDefs
    MediaListComponent.prototype.getSrc = function (field) {
        if (field) {
            return this.fieldDefs[this.selectedMediaIndex][field];
        }
        return '';
    };
    MediaListComponent.prototype.showPrev = function () {
        if (this.selectedMediaIndex > 0) {
            this.selectedMediaIndex--;
            $appDigest();
        }
    };
    MediaListComponent.prototype.onDataChange = function (nv) {
        if (nv) {
            if (isObject(nv) && !isArray(nv)) {
                nv = [nv];
            }
            if (!this.binddataset) {
                if (isString(nv)) {
                    nv = nv.split(',');
                }
            }
            if (isArray(nv)) {
                this.updateFieldDefs(nv);
            }
        }
        else {
            this.updateFieldDefs([]);
        }
    };
    /** With given data, creates media list items*/
    MediaListComponent.prototype.updateFieldDefs = function (data) {
        var _this = this;
        this.fieldDefs = data;
        data.forEach(function (field) {
            field.mediaUrlVal = $parseExpr(_this.mediaurl)(field);
            field.thumbnailUrlVal = $parseExpr(_this.thumbnailurl)(field);
        });
        this.fieldDefs = data;
    };
    /**
     * used to track list items by Index.
     * @param {number} index value of the list item
     * @returns {number} index.
     */
    MediaListComponent.prototype.listTrackByFn = function (index) {
        return index;
    };
    MediaListComponent.initializeProps = registerProps();
    MediaListComponent.decorators = [
        { type: Component, args: [{
                    selector: '[wmMediaList]',
                    template: "<ul class=\"list-unstyled list-inline app-media-thumbnail\">\n    <li *ngFor=\"let item of fieldDefs; index as index;\" [ngStyle]=\"{width: thumbnailwidth, height: thumbnailheight}\" (click)=\"showFullScreen(index)\">\n        <div class=\"thumbnail\">\n            <ng-container [ngTemplateOutlet]=\"imgTemplate\"\n                          [ngTemplateOutletContext]=\"{src: item.thumbnailUrlVal, class: 'thumbnail-image'}\">\n            </ng-container>\n            <div class=\"thumbnail-details\">\n                <ng-container [ngTemplateOutlet]=\"mediaListTemplate\" [ngTemplateOutletContext]=\"{item:item, index:index}\" [wmMediaListItem]=\"item\">\n                </ng-container>\n            </div>\n        </div>\n    </li>\n</ul>\n<div class=\"app-media-fullscreen\" *ngIf=\"selectedMediaIndex >= 0 && appendToBody()\">\n    <header wmMobileNavbar\n            backbutton=\"true\"\n            backbtnclick.event=\"exitFullScreen()\"\n            showLeftnavbtn=\"false\"\n            backbuttoniconclass.event=\"wi wi-chevron-left\"\n            title.bind=\"getPicTitle()\">\n    </header>\n    <div wmContent>\n        <div wmPageContent>\n            <div class=\"media-content\">\n                <div class=\"image-container\"  (swipeleft)=\"showNext()\" (swiperight)=\"showPrev()\">\n                    <ng-container [ngTemplateOutlet]=\"imgTemplate\"\n                                  [ngTemplateOutletContext]=\"{field: 'mediaUrlVal', class: 'center-block'}\">\n                    </ng-container>\n                    <a class=\"app-media-fullscreen-nav-control left\" [hidden]=\"!(selectedMediaIndex > 0)\" (click)=\"showPrev()\">\n                        <i class=\"wi wi-chevron-left\"></i>\n                    </a>\n                    <a class=\"app-media-fullscreen-nav-control right\" [hidden]=\"!(selectedMediaIndex < fieldDefs.length-1)\" (click)=\"showNext()\">\n                        <i class=\"wi wi-chevron-right\"></i>\n                    </a>\n                </div>\n            </div>\n        </div>\n    </div>\n</div>\n\n<ng-template #imgTemplate let-src=\"src\" let-classname=\"class\" let-field=\"field\">\n    <img wmPicture class=\"{{classname}}\" picturesource.bind=\"src || getSrc(field)\" wmImageCache=\"{{offline}}\" />\n</ng-template>",
                    providers: [
                        provideAsWidgetRef(MediaListComponent)
                    ]
                }] }
    ];
    /** @nocollapse */
    MediaListComponent.ctorParameters = function () { return [
        { type: Injector }
    ]; };
    MediaListComponent.propDecorators = {
        mediaListTemplate: [{ type: ContentChild, args: ['mediaListTemplate',] }]
    };
    return MediaListComponent;
}(StylableComponent));
export { MediaListComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVkaWEtbGlzdC5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vbW9iaWxlL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL21lZGlhLWxpc3QvbWVkaWEtbGlzdC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsWUFBWSxFQUFjLFFBQVEsRUFBRSxXQUFXLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFM0YsT0FBTyxFQUFFLFVBQVUsRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUN0RyxPQUFPLEVBQUUsaUJBQWlCLEVBQWlCLGtCQUFrQixFQUFFLGlCQUFpQixFQUFFLE1BQU0sRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBRWpILE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUVuRCxJQUFNLFdBQVcsR0FBRyxlQUFlLENBQUM7QUFDcEMsSUFBTSxhQUFhLEdBQWtCLEVBQUMsVUFBVSxFQUFFLGVBQWUsRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFDLENBQUM7QUFFM0YsSUFBSyxNQUdKO0FBSEQsV0FBSyxNQUFNO0lBQ1AsbUNBQXlCLENBQUE7SUFDekIsaUNBQXVCLENBQUE7QUFDM0IsQ0FBQyxFQUhJLE1BQU0sS0FBTixNQUFNLFFBR1Y7QUFFRDtJQU93Qyw4Q0FBaUI7SUFZckQsNEJBQVksR0FBYTtRQUF6QixZQUNJLGtCQUFNLEdBQUcsRUFBRSxhQUFhLENBQUMsU0FFNUI7UUFQTSx3QkFBa0IsR0FBRyxDQUFDLENBQUMsQ0FBQztRQU0zQixNQUFNLENBQUMsS0FBSSxDQUFDLGFBQWEsRUFBRSxLQUFJLEVBQUUsaUJBQWlCLENBQUMsb0JBQW9CLENBQUMsQ0FBQzs7SUFDN0UsQ0FBQztJQUVNLHlDQUFZLEdBQW5CO1FBQUEsaUJBUUM7UUFQRyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRTtZQUN0QixVQUFVLENBQUM7Z0JBQ1AsS0FBSSxDQUFDLGNBQWMsR0FBRyxLQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDO2dCQUNuRSxLQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUMvQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7U0FDWDtRQUNELE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUM7SUFFTSw2Q0FBZ0IsR0FBdkIsVUFBd0IsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFHO1FBQ2hDLElBQUksR0FBRyxLQUFLLFNBQVMsRUFBRTtZQUNuQixJQUFJLENBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQ3pCO2FBQU0sSUFBSSxHQUFHLEtBQUssUUFBUSxFQUFFO1lBQ3pCLElBQUksRUFBRSxLQUFLLE1BQU0sQ0FBQyxVQUFVLEVBQUU7Z0JBQzFCLFFBQVEsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLFdBQVcsQ0FBQyxDQUFDO2FBQzdDO2lCQUFNO2dCQUNILFdBQVcsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLFdBQVcsQ0FBQyxDQUFDO2FBQ2hEO1NBQ0o7YUFBTTtZQUNILGlCQUFNLGdCQUFnQixZQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7U0FDdkM7SUFDTCxDQUFDO0lBRU0sMkNBQWMsR0FBckI7UUFDSSxJQUFJLENBQUMsa0JBQWtCLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDN0IsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzVDLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDO1FBQzNCLFVBQVUsRUFBRSxDQUFDO0lBQ2pCLENBQUM7SUFFTSx3Q0FBVyxHQUFsQjtRQUNJLE9BQU8sSUFBSSxDQUFDLGtCQUFrQixHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUM7SUFDckUsQ0FBQztJQUVNLDJDQUFjLEdBQXJCLFVBQXNCLENBQUM7UUFDbkIsSUFBSSxDQUFDLGtCQUFrQixHQUFHLENBQUMsQ0FBQztRQUM1QixVQUFVLEVBQUUsQ0FBQztJQUNqQixDQUFDO0lBRU0scUNBQVEsR0FBZjtRQUNJLElBQUksSUFBSSxDQUFDLGtCQUFrQixHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtZQUNyRCxJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztZQUMxQixVQUFVLEVBQUUsQ0FBQztTQUNoQjtJQUNMLENBQUM7SUFFRCxtREFBbUQ7SUFDM0MsbUNBQU0sR0FBZCxVQUFlLEtBQUs7UUFDaEIsSUFBSSxLQUFLLEVBQUU7WUFDUCxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDekQ7UUFDRCxPQUFPLEVBQUUsQ0FBQztJQUNkLENBQUM7SUFFTSxxQ0FBUSxHQUFmO1FBQ0ksSUFBSSxJQUFJLENBQUMsa0JBQWtCLEdBQUcsQ0FBQyxFQUFFO1lBQzdCLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1lBQzFCLFVBQVUsRUFBRSxDQUFDO1NBQ2hCO0lBQ0wsQ0FBQztJQUVPLHlDQUFZLEdBQXBCLFVBQXFCLEVBQU87UUFDeEIsSUFBSSxFQUFFLEVBQUU7WUFFSixJQUFJLFFBQVEsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFBRTtnQkFDOUIsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLENBQUM7YUFDYjtZQUNELElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFO2dCQUNuQixJQUFJLFFBQVEsQ0FBQyxFQUFFLENBQUMsRUFBRTtvQkFDZCxFQUFFLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztpQkFDdEI7YUFDSjtZQUNELElBQUksT0FBTyxDQUFDLEVBQUUsQ0FBQyxFQUFFO2dCQUNiLElBQUksQ0FBQyxlQUFlLENBQUMsRUFBVyxDQUFDLENBQUM7YUFDckM7U0FDSjthQUFNO1lBQ0gsSUFBSSxDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUMsQ0FBQztTQUM1QjtJQUNMLENBQUM7SUFFRCwrQ0FBK0M7SUFDdkMsNENBQWUsR0FBdkIsVUFBd0IsSUFBVztRQUFuQyxpQkFPQztRQU5HLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO1FBQ3RCLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBQSxLQUFLO1lBQ2QsS0FBSyxDQUFDLFdBQVcsR0FBTyxVQUFVLENBQUMsS0FBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ3pELEtBQUssQ0FBQyxlQUFlLEdBQUcsVUFBVSxDQUFDLEtBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNqRSxDQUFDLENBQUMsQ0FBQztRQUNILElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO0lBQzFCLENBQUM7SUFFRDs7OztPQUlHO0lBQ0ssMENBQWEsR0FBckIsVUFBc0IsS0FBYTtRQUMvQixPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBbEhNLGtDQUFlLEdBQUcsYUFBYSxFQUFFLENBQUM7O2dCQVI1QyxTQUFTLFNBQUM7b0JBQ1AsUUFBUSxFQUFFLGVBQWU7b0JBQ3pCLGt3RUFBMEM7b0JBQzFDLFNBQVMsRUFBRTt3QkFDUCxrQkFBa0IsQ0FBQyxrQkFBa0IsQ0FBQztxQkFDekM7aUJBQ0o7Ozs7Z0JBckI2QyxRQUFROzs7b0NBZ0NqRCxZQUFZLFNBQUMsbUJBQW1COztJQTBHckMseUJBQUM7Q0FBQSxBQTNIRCxDQU93QyxpQkFBaUIsR0FvSHhEO1NBcEhZLGtCQUFrQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgQ29udGVudENoaWxkLCBFbGVtZW50UmVmLCBJbmplY3RvciwgVGVtcGxhdGVSZWYgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgJGFwcERpZ2VzdCwgJHBhcnNlRXhwciwgYWRkQ2xhc3MsIGlzQXJyYXksIGlzT2JqZWN0LCBpc1N0cmluZywgcmVtb3ZlQ2xhc3MgfSBmcm9tICdAd20vY29yZSc7XG5pbXBvcnQgeyBBUFBMWV9TVFlMRVNfVFlQRSwgSVdpZGdldENvbmZpZywgcHJvdmlkZUFzV2lkZ2V0UmVmLCBTdHlsYWJsZUNvbXBvbmVudCwgc3R5bGVyIH0gZnJvbSAnQHdtL2NvbXBvbmVudHMnO1xuXG5pbXBvcnQgeyByZWdpc3RlclByb3BzIH0gZnJvbSAnLi9tZWRpYS1saXN0LnByb3BzJztcblxuY29uc3QgREVGQVVMVF9DTFMgPSAnYXBwLW1lZGlhbGlzdCc7XG5jb25zdCBXSURHRVRfQ09ORklHOiBJV2lkZ2V0Q29uZmlnID0ge3dpZGdldFR5cGU6ICd3bS1tZWRpYS1saXN0JywgaG9zdENsYXNzOiBERUZBVUxUX0NMU307XG5cbmVudW0gTGF5b3V0IHtcbiAgICBTSU5HTEVfUk9XID0gJ1NpbmdsZS1yb3cnLFxuICAgIE1VTFRJX1JPVyA9ICdNdWx0aS1yb3cnXG59XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnW3dtTWVkaWFMaXN0XScsXG4gICAgdGVtcGxhdGVVcmw6ICcuL21lZGlhLWxpc3QuY29tcG9uZW50Lmh0bWwnLFxuICAgIHByb3ZpZGVyczogW1xuICAgICAgICBwcm92aWRlQXNXaWRnZXRSZWYoTWVkaWFMaXN0Q29tcG9uZW50KVxuICAgIF1cbn0pXG5leHBvcnQgY2xhc3MgTWVkaWFMaXN0Q29tcG9uZW50IGV4dGVuZHMgU3R5bGFibGVDb21wb25lbnQge1xuICAgIHN0YXRpYyBpbml0aWFsaXplUHJvcHMgPSByZWdpc3RlclByb3BzKCk7XG5cbiAgICBwcml2YXRlICRmdWxsU2NyZWVuRWxlO1xuICAgIHB1YmxpYyBiaW5kZGF0YXNldDtcbiAgICBwdWJsaWMgZmllbGREZWZzOiBhbnlbXSAgW107XG4gICAgcHVibGljIG1lZGlhdXJsOiBzdHJpbmc7XG4gICAgcHVibGljIHRodW1ibmFpbHVybDogc3RyaW5nO1xuICAgIHB1YmxpYyBzZWxlY3RlZE1lZGlhSW5kZXggPSAtMTtcblxuICAgIEBDb250ZW50Q2hpbGQoJ21lZGlhTGlzdFRlbXBsYXRlJykgbWVkaWFMaXN0VGVtcGxhdGU6IFRlbXBsYXRlUmVmPEVsZW1lbnRSZWY+O1xuXG4gICAgY29uc3RydWN0b3IoaW5qOiBJbmplY3Rvcikge1xuICAgICAgICBzdXBlcihpbmosIFdJREdFVF9DT05GSUcpO1xuICAgICAgICBzdHlsZXIodGhpcy5uYXRpdmVFbGVtZW50LCB0aGlzLCBBUFBMWV9TVFlMRVNfVFlQRS5TQ1JPTExBQkxFX0NPTlRBSU5FUik7XG4gICAgfVxuXG4gICAgcHVibGljIGFwcGVuZFRvQm9keSgpIHtcbiAgICAgICAgaWYgKCF0aGlzLiRmdWxsU2NyZWVuRWxlKSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLiRmdWxsU2NyZWVuRWxlID0gdGhpcy4kZWxlbWVudC5maW5kKCc+LmFwcC1tZWRpYS1mdWxsc2NyZWVuJyk7XG4gICAgICAgICAgICAgICAgdGhpcy4kZnVsbFNjcmVlbkVsZS5hcHBlbmRUbygnYm9keTpmaXJzdCcpO1xuICAgICAgICAgICAgfSwgMTAwKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgb25Qcm9wZXJ0eUNoYW5nZShrZXksIG52LCBvdj8pIHtcbiAgICAgICAgaWYgKGtleSA9PT0gJ2RhdGFzZXQnKSB7XG4gICAgICAgICAgICB0aGlzLm9uRGF0YUNoYW5nZShudik7XG4gICAgICAgIH0gZWxzZSBpZiAoa2V5ID09PSAnbGF5b3V0Jykge1xuICAgICAgICAgICAgaWYgKG52ID09PSBMYXlvdXQuU0lOR0xFX1JPVykge1xuICAgICAgICAgICAgICAgIGFkZENsYXNzKHRoaXMubmF0aXZlRWxlbWVudCwgJ3NpbmdsZXJvdycpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZW1vdmVDbGFzcyh0aGlzLm5hdGl2ZUVsZW1lbnQsICdzaW5nbGVyb3cnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN1cGVyLm9uUHJvcGVydHlDaGFuZ2Uoa2V5LCBudiwgb3YpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGV4aXRGdWxsU2NyZWVuKCkge1xuICAgICAgICB0aGlzLnNlbGVjdGVkTWVkaWFJbmRleCA9IC0xO1xuICAgICAgICB0aGlzLiRmdWxsU2NyZWVuRWxlLmFwcGVuZFRvKHRoaXMuJGVsZW1lbnQpO1xuICAgICAgICB0aGlzLiRmdWxsU2NyZWVuRWxlID0gbnVsbDtcbiAgICAgICAgJGFwcERpZ2VzdCgpO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRQaWNUaXRsZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2VsZWN0ZWRNZWRpYUluZGV4ICsgMSArICcvJyArIHRoaXMuZmllbGREZWZzLmxlbmd0aDtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2hvd0Z1bGxTY3JlZW4oaSkge1xuICAgICAgICB0aGlzLnNlbGVjdGVkTWVkaWFJbmRleCA9IGk7XG4gICAgICAgICRhcHBEaWdlc3QoKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2hvd05leHQoKSB7XG4gICAgICAgIGlmICh0aGlzLnNlbGVjdGVkTWVkaWFJbmRleCA8IHRoaXMuZmllbGREZWZzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRNZWRpYUluZGV4Kys7XG4gICAgICAgICAgICAkYXBwRGlnZXN0KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBSZXR1cm5zIHRoZSBmaWVsZCB2YWx1ZSAoc3JjKSBmcm9tIHRoZSBmaWVsZERlZnNcbiAgICBwcml2YXRlIGdldFNyYyhmaWVsZCkge1xuICAgICAgICBpZiAoZmllbGQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZpZWxkRGVmc1t0aGlzLnNlbGVjdGVkTWVkaWFJbmRleF1bZmllbGRdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAnJztcbiAgICB9XG5cbiAgICBwdWJsaWMgc2hvd1ByZXYoKSB7XG4gICAgICAgIGlmICh0aGlzLnNlbGVjdGVkTWVkaWFJbmRleCA+IDApIHtcbiAgICAgICAgICAgIHRoaXMuc2VsZWN0ZWRNZWRpYUluZGV4LS07XG4gICAgICAgICAgICAkYXBwRGlnZXN0KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIG9uRGF0YUNoYW5nZShudjogYW55KSB7XG4gICAgICAgIGlmIChudikge1xuXG4gICAgICAgICAgICBpZiAoaXNPYmplY3QobnYpICYmICFpc0FycmF5KG52KSkge1xuICAgICAgICAgICAgICAgIG52ID0gW252XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghdGhpcy5iaW5kZGF0YXNldCkge1xuICAgICAgICAgICAgICAgIGlmIChpc1N0cmluZyhudikpIHtcbiAgICAgICAgICAgICAgICAgICAgbnYgPSBudi5zcGxpdCgnLCcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpc0FycmF5KG52KSkge1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlRmllbGREZWZzKG52IGFzIGFueVtdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlRmllbGREZWZzKFtdKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiBXaXRoIGdpdmVuIGRhdGEsIGNyZWF0ZXMgbWVkaWEgbGlzdCBpdGVtcyovXG4gICAgcHJpdmF0ZSB1cGRhdGVGaWVsZERlZnMoZGF0YTogYW55W10pIHtcbiAgICAgICAgdGhpcy5maWVsZERlZnMgPSBkYXRhO1xuICAgICAgICBkYXRhLmZvckVhY2goZmllbGQgPT4ge1xuICAgICAgICAgICAgZmllbGQubWVkaWFVcmxWYWwgICAgID0gJHBhcnNlRXhwcih0aGlzLm1lZGlhdXJsKShmaWVsZCk7XG4gICAgICAgICAgICBmaWVsZC50aHVtYm5haWxVcmxWYWwgPSAkcGFyc2VFeHByKHRoaXMudGh1bWJuYWlsdXJsKShmaWVsZCk7XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLmZpZWxkRGVmcyA9IGRhdGE7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogdXNlZCB0byB0cmFjayBsaXN0IGl0ZW1zIGJ5IEluZGV4LlxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSBpbmRleCB2YWx1ZSBvZiB0aGUgbGlzdCBpdGVtXG4gICAgICogQHJldHVybnMge251bWJlcn0gaW5kZXguXG4gICAgICovXG4gICAgcHJpdmF0ZSBsaXN0VHJhY2tCeUZuKGluZGV4OiBudW1iZXIpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gaW5kZXg7XG4gICAgfVxufVxuIl19