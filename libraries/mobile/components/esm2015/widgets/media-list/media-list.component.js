import { Component, ContentChild, Injector, TemplateRef } from '@angular/core';
import { $appDigest, $parseExpr, addClass, isArray, isObject, isString, removeClass } from '@wm/core';
import { APPLY_STYLES_TYPE, provideAsWidgetRef, StylableComponent, styler } from '@wm/components';
import { registerProps } from './media-list.props';
const DEFAULT_CLS = 'app-medialist';
const WIDGET_CONFIG = { widgetType: 'wm-media-list', hostClass: DEFAULT_CLS };
var Layout;
(function (Layout) {
    Layout["SINGLE_ROW"] = "Single-row";
    Layout["MULTI_ROW"] = "Multi-row";
})(Layout || (Layout = {}));
export class MediaListComponent extends StylableComponent {
    constructor(inj) {
        super(inj, WIDGET_CONFIG);
        this.selectedMediaIndex = -1;
        styler(this.nativeElement, this, APPLY_STYLES_TYPE.SCROLLABLE_CONTAINER);
    }
    appendToBody() {
        if (!this.$fullScreenEle) {
            setTimeout(() => {
                this.$fullScreenEle = this.$element.find('>.app-media-fullscreen');
                this.$fullScreenEle.appendTo('body:first');
            }, 100);
        }
        return true;
    }
    onPropertyChange(key, nv, ov) {
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
            super.onPropertyChange(key, nv, ov);
        }
    }
    exitFullScreen() {
        this.selectedMediaIndex = -1;
        this.$fullScreenEle.appendTo(this.$element);
        this.$fullScreenEle = null;
        $appDigest();
    }
    getPicTitle() {
        return this.selectedMediaIndex + 1 + '/' + this.fieldDefs.length;
    }
    showFullScreen(i) {
        this.selectedMediaIndex = i;
        $appDigest();
    }
    showNext() {
        if (this.selectedMediaIndex < this.fieldDefs.length - 1) {
            this.selectedMediaIndex++;
            $appDigest();
        }
    }
    // Returns the field value (src) from the fieldDefs
    getSrc(field) {
        if (field) {
            return this.fieldDefs[this.selectedMediaIndex][field];
        }
        return '';
    }
    showPrev() {
        if (this.selectedMediaIndex > 0) {
            this.selectedMediaIndex--;
            $appDigest();
        }
    }
    onDataChange(nv) {
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
    }
    /** With given data, creates media list items*/
    updateFieldDefs(data) {
        this.fieldDefs = data;
        data.forEach(field => {
            field.mediaUrlVal = $parseExpr(this.mediaurl)(field);
            field.thumbnailUrlVal = $parseExpr(this.thumbnailurl)(field);
        });
        this.fieldDefs = data;
    }
    /**
     * used to track list items by Index.
     * @param {number} index value of the list item
     * @returns {number} index.
     */
    listTrackByFn(index) {
        return index;
    }
}
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
MediaListComponent.ctorParameters = () => [
    { type: Injector }
];
MediaListComponent.propDecorators = {
    mediaListTemplate: [{ type: ContentChild, args: ['mediaListTemplate',] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVkaWEtbGlzdC5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vbW9iaWxlL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL21lZGlhLWxpc3QvbWVkaWEtbGlzdC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxZQUFZLEVBQWMsUUFBUSxFQUFFLFdBQVcsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUUzRixPQUFPLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBQ3RHLE9BQU8sRUFBRSxpQkFBaUIsRUFBaUIsa0JBQWtCLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFFakgsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBRW5ELE1BQU0sV0FBVyxHQUFHLGVBQWUsQ0FBQztBQUNwQyxNQUFNLGFBQWEsR0FBa0IsRUFBQyxVQUFVLEVBQUUsZUFBZSxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUMsQ0FBQztBQUUzRixJQUFLLE1BR0o7QUFIRCxXQUFLLE1BQU07SUFDUCxtQ0FBeUIsQ0FBQTtJQUN6QixpQ0FBdUIsQ0FBQTtBQUMzQixDQUFDLEVBSEksTUFBTSxLQUFOLE1BQU0sUUFHVjtBQVNELE1BQU0sT0FBTyxrQkFBbUIsU0FBUSxpQkFBaUI7SUFZckQsWUFBWSxHQUFhO1FBQ3JCLEtBQUssQ0FBQyxHQUFHLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFMdkIsdUJBQWtCLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFNM0IsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsSUFBSSxFQUFFLGlCQUFpQixDQUFDLG9CQUFvQixDQUFDLENBQUM7SUFDN0UsQ0FBQztJQUVNLFlBQVk7UUFDZixJQUFJLENB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LENBQUMsQ0FBQzthQUNyQztTQUNKO2FBQU07WUFDSCxJQUFJLENBQUMsZUFBZSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQzVCO0lBQ0wsQ0FBQztJQUVELCtDQUErQztJQUN2QyxlQUFlLENBQUMsSUFBVztRQUMvQixJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztRQUN0QixJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ2pCLEtBQUssQ0FBQyxXQUFXLEdBQU8sVUFBVSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN6RCxLQUFLLENBQUMsZUFBZSxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDakUsQ0FBQyxDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztJQUMxQixDQUFDO0lBRUQ7Ozs7T0FJRztJQUNLLGFBQWEsQ0FBQyxLQUFhO1FBQy9CLE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7O0FBbEhNLGtDQUFlLEdBQUcsYUFBYSxFQUFFLENBQUM7O1lBUjVDLFNBQVMsU0FBQztnQkFDUCxRQUFRLEVBQUUsZUFBZTtnQkFDekIsa3dFQUEwQztnQkFDMUMsU0FBUyxFQUFFO29CQUNQLGtCQUFrQixDQUFDLGtCQUFrQixDQUFDO2lCQUN6QzthQUNKOzs7O1lBckI2QyxRQUFROzs7Z0NBZ0NqRCxZQUFZLFNBQUMsbUJBQW1CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBDb250ZW50Q2hpbGQsIEVsZW1lbnRSZWYsIEluamVjdG9yLCBUZW1wbGF0ZVJlZiB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyAkYXBwRGlnZXN0LCAkcGFyc2VFeHByLCBhZGRDbGFzcywgaXNBcnJheSwgaXNPYmplY3QsIGlzU3RyaW5nLCByZW1vdmVDbGFzcyB9IGZyb20gJ0B3bS9jb3JlJztcbmltcG9ydCB7IEFQUExZX1NUWUxFU19UWVBFLCBJV2lkZ2V0Q29uZmlnLCBwcm92aWRlQXNXaWRnZXRSZWYsIFN0eWxhYmxlQ29tcG9uZW50LCBzdHlsZXIgfSBmcm9tICdAd20vY29tcG9uZW50cyc7XG5cbmltcG9ydCB7IHJlZ2lzdGVyUHJvcHMgfSBmcm9tICcuL21lZGlhLWxpc3QucHJvcHMnO1xuXG5jb25zdCBERUZBVUxUX0NMUyA9ICdhcHAtbWVkaWFsaXN0JztcbmNvbnN0IFdJREdFVF9DT05GSUc6IElXaWRnZXRDb25maWcgPSB7d2lkZ2V0VHlwZTogJ3dtLW1lZGlhLWxpc3QnLCBob3N0Q2xhc3M6IERFRkFVTFRfQ0xTfTtcblxuZW51bSBMYXlvdXQge1xuICAgIFNJTkdMRV9ST1cgPSAnU2luZ2xlLXJvdycsXG4gICAgTVVMVElfUk9XID0gJ011bHRpLXJvdydcbn1cblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdbd21NZWRpYUxpc3RdJyxcbiAgICB0ZW1wbGF0ZVVybDogJy4vbWVkaWEtbGlzdC5jb21wb25lbnQuaHRtbCcsXG4gICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIHByb3ZpZGVBc1dpZGdldFJlZihNZWRpYUxpc3RDb21wb25lbnQpXG4gICAgXVxufSlcbmV4cG9ydCBjbGFzcyBNZWRpYUxpc3RDb21wb25lbnQgZXh0ZW5kcyBTdHlsYWJsZUNvbXBvbmVudCB7XG4gICAgc3RhdGljIGluaXRpYWxpemVQcm9wcyA9IHJlZ2lzdGVyUHJvcHMoKTtcblxuICAgIHByaXZhdGUgJGZ1bGxTY3JlZW5FbGU7XG4gICAgcHVibGljIGJpbmRkYXRhc2V0O1xuICAgIHB1YmxpYyBmaWVsZERlZnM6IGFueVtdICBbXTtcbiAgICBwdWJsaWMgbWVkaWF1cmw6IHN0cmluZztcbiAgICBwdWJsaWMgdGh1bWJuYWlsdXJsOiBzdHJpbmc7XG4gICAgcHVibGljIHNlbGVjdGVkTWVkaWFJbmRleCA9IC0xO1xuXG4gICAgQENvbnRlbnRDaGlsZCgnbWVkaWFMaXN0VGVtcGxhdGUnKSBtZWRpYUxpc3RUZW1wbGF0ZTogVGVtcGxhdGVSZWY8RWxlbWVudFJlZj47XG5cbiAgICBjb25zdHJ1Y3Rvcihpbmo6IEluamVjdG9yKSB7XG4gICAgICAgIHN1cGVyKGluaiwgV0lER0VUX0NPTkZJRyk7XG4gICAgICAgIHN0eWxlcih0aGlzLm5hdGl2ZUVsZW1lbnQsIHRoaXMsIEFQUExZX1NUWUxFU19UWVBFLlNDUk9MTEFCTEVfQ09OVEFJTkVSKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYXBwZW5kVG9Cb2R5KCkge1xuICAgICAgICBpZiAoIXRoaXMuJGZ1bGxTY3JlZW5FbGUpIHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuJGZ1bGxTY3JlZW5FbGUgPSB0aGlzLiRlbGVtZW50LmZpbmQoJz4uYXBwLW1lZGlhLWZ1bGxzY3JlZW4nKTtcbiAgICAgICAgICAgICAgICB0aGlzLiRmdWxsU2NyZWVuRWxlLmFwcGVuZFRvKCdib2R5OmZpcnN0Jyk7XG4gICAgICAgICAgICB9LCAxMDApO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHB1YmxpYyBvblByb3BlcnR5Q2hhbmdlKGtleSwgbnYsIG92Pykge1xuICAgICAgICBpZiAoa2V5ID09PSAnZGF0YXNldCcpIHtcbiAgICAgICAgICAgIHRoaXMub25EYXRhQ2hhbmdlKG52KTtcbiAgICAgICAgfSBlbHNlIGlmIChrZXkgPT09ICdsYXlvdXQnKSB7XG4gICAgICAgICAgICBpZiAobnYgPT09IExheW91dC5TSU5HTEVfUk9XKSB7XG4gICAgICAgICAgICAgICAgYWRkQ2xhc3ModGhpcy5uYXRpdmVFbGVtZW50LCAnc2luZ2xlcm93Jyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlbW92ZUNsYXNzKHRoaXMubmF0aXZlRWxlbWVudCwgJ3NpbmdsZXJvdycpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3VwZXIub25Qcm9wZXJ0eUNoYW5nZShrZXksIG52LCBvdik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgZXhpdEZ1bGxTY3JlZW4oKSB7XG4gICAgICAgIHRoaXMuc2VsZWN0ZWRNZWRpYUluZGV4ID0gLTE7XG4gICAgICAgIHRoaXMuJGZ1bGxTY3JlZW5FbGUuYXBwZW5kVG8odGhpcy4kZWxlbWVudCk7XG4gICAgICAgIHRoaXMuJGZ1bGxTY3JlZW5FbGUgPSBudWxsO1xuICAgICAgICAkYXBwRGlnZXN0KCk7XG4gICAgfVxuXG4gICAgcHVibGljIGdldFBpY1RpdGxlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZWxlY3RlZE1lZGlhSW5kZXggKyAxICsgJy8nICsgdGhpcy5maWVsZERlZnMubGVuZ3RoO1xuICAgIH1cblxuICAgIHB1YmxpYyBzaG93RnVsbFNjcmVlbihpKSB7XG4gICAgICAgIHRoaXMuc2VsZWN0ZWRNZWRpYUluZGV4ID0gaTtcbiAgICAgICAgJGFwcERpZ2VzdCgpO1xuICAgIH1cblxuICAgIHB1YmxpYyBzaG93TmV4dCgpIHtcbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0ZWRNZWRpYUluZGV4IDwgdGhpcy5maWVsZERlZnMubGVuZ3RoIC0gMSkge1xuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZE1lZGlhSW5kZXgrKztcbiAgICAgICAgICAgICRhcHBEaWdlc3QoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFJldHVybnMgdGhlIGZpZWxkIHZhbHVlIChzcmMpIGZyb20gdGhlIGZpZWxkRGVmc1xuICAgIHByaXZhdGUgZ2V0U3JjKGZpZWxkKSB7XG4gICAgICAgIGlmIChmaWVsZCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmllbGREZWZzW3RoaXMuc2VsZWN0ZWRNZWRpYUluZGV4XVtmaWVsZF07XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICcnO1xuICAgIH1cblxuICAgIHB1YmxpYyBzaG93UHJldigpIHtcbiAgICAgICAgaWYgKHRoaXMuc2VsZWN0ZWRNZWRpYUluZGV4ID4gMCkge1xuICAgICAgICAgICAgdGhpcy5zZWxlY3RlZE1lZGlhSW5kZXgtLTtcbiAgICAgICAgICAgICRhcHBEaWdlc3QoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgb25EYXRhQ2hhbmdlKG52OiBhbnkpIHtcbiAgICAgICAgaWYgKG52KSB7XG5cbiAgICAgICAgICAgIGlmIChpc09iamVjdChudikgJiYgIWlzQXJyYXkobnYpKSB7XG4gICAgICAgICAgICAgICAgbnYgPSBbbnZdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCF0aGlzLmJpbmRkYXRhc2V0KSB7XG4gICAgICAgICAgICAgICAgaWYgKGlzU3RyaW5nKG52KSkge1xuICAgICAgICAgICAgICAgICAgICBudiA9IG52LnNwbGl0KCcsJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGlzQXJyYXkobnYpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVGaWVsZERlZnMobnYgYXMgYW55W10pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy51cGRhdGVGaWVsZERlZnMoW10pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqIFdpdGggZ2l2ZW4gZGF0YSwgY3JlYXRlcyBtZWRpYSBsaXN0IGl0ZW1zKi9cbiAgICBwcml2YXRlIHVwZGF0ZUZpZWxkRGVmcyhkYXRhOiBhbnlbXSkge1xuICAgICAgICB0aGlzLmZpZWxkRGVmcyA9IGRhdGE7XG4gICAgICAgIGRhdGEuZm9yRWFjaChmaWVsZCA9PiB7XG4gICAgICAgICAgICBmaWVsZC5tZWRpYVVybFZhbCAgICAgPSAkcGFyc2VFeHByKHRoaXMubWVkaWF1cmwpKGZpZWxkKTtcbiAgICAgICAgICAgIGZpZWxkLnRodW1ibmFpbFVybFZhbCA9ICRwYXJzZUV4cHIodGhpcy50aHVtYm5haWx1cmwpKGZpZWxkKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuZmllbGREZWZzID0gZGF0YTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiB1c2VkIHRvIHRyYWNrIGxpc3QgaXRlbXMgYnkgSW5kZXguXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4IHZhbHVlIG9mIHRoZSBsaXN0IGl0ZW1cbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfSBpbmRleC5cbiAgICAgKi9cbiAgICBwcml2YXRlIGxpc3RUcmFja0J5Rm4oaW5kZXg6IG51bWJlcik6IG51bWJlciB7XG4gICAgICAgIHJldHVybiBpbmRleDtcbiAgICB9XG59XG4iXX0=