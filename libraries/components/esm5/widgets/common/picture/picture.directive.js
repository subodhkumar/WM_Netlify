import * as tslib_1 from "tslib";
import { Directive, HostBinding, Injector } from '@angular/core';
import { setAttr, setCSS, switchClass } from '@wm/core';
import { styler } from '../../framework/styler';
import { registerProps } from './picture.props';
import { StylableComponent } from '../base/stylable.component';
import { DISPLAY_TYPE } from '../../framework/constants';
import { ImagePipe } from '../../../pipes/image.pipe';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
var DEFAULT_CLS = 'app-picture';
var WIDGET_CONFIG = {
    widgetType: 'wm-picture',
    hostClass: DEFAULT_CLS,
    displayType: DISPLAY_TYPE.INLINE_BLOCK
};
var PictureDirective = /** @class */ (function (_super) {
    tslib_1.__extends(PictureDirective, _super);
    function PictureDirective(inj, imagePipe) {
        var _this = _super.call(this, inj, WIDGET_CONFIG) || this;
        _this.imagePipe = imagePipe;
        styler(_this.nativeElement, _this);
        return _this;
    }
    PictureDirective.prototype.setImgSource = function () {
        this.imgSource = this.imagePipe.transform(this.picturesource, this.encodeurl, this.pictureplaceholder);
    };
    PictureDirective.prototype.onPropertyChange = function (key, nv, ov) {
        if (key === 'pictureaspect') {
            var width = '';
            var height = '';
            switch (nv) {
                case 'None':
                    width = this.width;
                    height = this.height;
                    break;
                case 'H':
                    width = '100%';
                    break;
                case 'V':
                    height = '100%';
                    break;
                case 'Both':
                    width = '100%';
                    height = '100%';
                    break;
            }
            setCSS(this.nativeElement, 'width', width, true);
            setCSS(this.nativeElement, 'height', height, true);
        }
        else if (key === 'encodeurl' || key === 'pictureplaceholder') {
            this.setImgSource();
        }
        else if (key === 'shape') {
            switchClass(this.nativeElement, "img-" + nv, "img-" + ov);
        }
        else if (key === 'hint') {
            setAttr(this.nativeElement, 'alt', nv);
        }
        _super.prototype.onPropertyChange.call(this, key, nv, ov);
    };
    PictureDirective.prototype.onStyleChange = function (key, nv, ov) {
        if (key === 'picturesource') {
            this.setImgSource();
        }
        else {
            _super.prototype.onStyleChange.call(this, key, nv, ov);
        }
    };
    PictureDirective.prototype.ngOnInit = function () {
        this.setImgSource();
        _super.prototype.ngOnInit.call(this);
    };
    PictureDirective.initializeProps = registerProps();
    PictureDirective.decorators = [
        { type: Directive, args: [{
                    selector: 'img[wmPicture]',
                    providers: [
                        provideAsWidgetRef(PictureDirective)
                    ]
                },] }
    ];
    /** @nocollapse */
    PictureDirective.ctorParameters = function () { return [
        { type: Injector },
        { type: ImagePipe }
    ]; };
    PictureDirective.propDecorators = {
        imgSource: [{ type: HostBinding, args: ['src',] }]
    };
    return PictureDirective;
}(StylableComponent));
export { PictureDirective };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGljdHVyZS5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL3BpY3R1cmUvcGljdHVyZS5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBVSxNQUFNLGVBQWUsQ0FBQztBQUV6RSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFeEQsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBRWhELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUNoRCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUMvRCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFDekQsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBQ3RELE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBRWpFLElBQU0sV0FBVyxHQUFHLGFBQWEsQ0FBQztBQUNsQyxJQUFNLGFBQWEsR0FBa0I7SUFDakMsVUFBVSxFQUFFLFlBQVk7SUFDeEIsU0FBUyxFQUFFLFdBQVc7SUFDdEIsV0FBVyxFQUFFLFlBQVksQ0FBQyxZQUFZO0NBQ3pDLENBQUM7QUFFRjtJQU1zQyw0Q0FBaUI7SUFTbkQsMEJBQVksR0FBYSxFQUFVLFNBQW9CO1FBQXZELFlBQ0ksa0JBQU0sR0FBRyxFQUFFLGFBQWEsQ0FBQyxTQUc1QjtRQUprQyxlQUFTLEdBQVQsU0FBUyxDQUFXO1FBR25ELE1BQU0sQ0FBQyxLQUFJLENBQUMsYUFBYSxFQUFFLEtBQUksQ0FBQyxDQUFDOztJQUNyQyxDQUFDO0lBRUQsdUNBQVksR0FBWjtRQUNJLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0lBQzNHLENBQUM7SUFFRCwyQ0FBZ0IsR0FBaEIsVUFBaUIsR0FBVyxFQUFFLEVBQU8sRUFBRSxFQUFPO1FBQzFDLElBQUksR0FBRyxLQUFLLGVBQWUsRUFBRTtZQUN6QixJQUFJLEtBQUssR0FBRyxFQUFFLENBQUM7WUFDZixJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUM7WUFDaEIsUUFBUSxFQUFFLEVBQUU7Z0JBQ1IsS0FBSyxNQUFNO29CQUNQLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO29CQUNuQixNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztvQkFDckIsTUFBTTtnQkFDVixLQUFLLEdBQUc7b0JBQ0osS0FBSyxHQUFHLE1BQU0sQ0FBQztvQkFDZixNQUFNO2dCQUNWLEtBQUssR0FBRztvQkFDSixNQUFNLEdBQUcsTUFBTSxDQUFDO29CQUNoQixNQUFNO2dCQUNWLEtBQUssTUFBTTtvQkFDUCxLQUFLLEdBQUcsTUFBTSxDQUFDO29CQUNmLE1BQU0sR0FBRyxNQUFNLENBQUM7b0JBQ2hCLE1BQU07YUFDYjtZQUNELE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDakQsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztTQUN0RDthQUFNLElBQUksR0FBRyxLQUFLLFdBQVcsSUFBSSxHQUFHLEtBQUssb0JBQW9CLEVBQUU7WUFDNUQsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1NBQ3ZCO2FBQU0sSUFBSSxHQUFHLEtBQUssT0FBTyxFQUFFO1lBQ3hCLFdBQVcsQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLFNBQU8sRUFBSSxFQUFFLFNBQU8sRUFBSSxDQUFDLENBQUM7U0FDN0Q7YUFBTSxJQUFJLEdBQUcsS0FBSyxNQUFNLEVBQUU7WUFDdkIsT0FBTyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1NBQzFDO1FBQ0QsaUJBQU0sZ0JBQWdCLFlBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUN4QyxDQUFDO0lBRUQsd0NBQWEsR0FBYixVQUFjLEdBQVcsRUFBRSxFQUFPLEVBQUUsRUFBUTtRQUN4QyxJQUFJLEdBQUcsS0FBSyxlQUFlLEVBQUU7WUFDekIsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1NBQ3ZCO2FBQU07WUFDSCxpQkFBTSxhQUFhLFlBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztTQUNwQztJQUNMLENBQUM7SUFFRCxtQ0FBUSxHQUFSO1FBQ0ksSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1FBQ3BCLGlCQUFNLFFBQVEsV0FBRSxDQUFDO0lBQ3JCLENBQUM7SUE3RE0sZ0NBQWUsR0FBRyxhQUFhLEVBQUUsQ0FBQzs7Z0JBUDVDLFNBQVMsU0FBQztvQkFDUCxRQUFRLEVBQUUsZ0JBQWdCO29CQUMxQixTQUFTLEVBQUU7d0JBQ1Asa0JBQWtCLENBQUMsZ0JBQWdCLENBQUM7cUJBQ3ZDO2lCQUNKOzs7O2dCQXhCZ0MsUUFBUTtnQkFTaEMsU0FBUzs7OzRCQXVCYixXQUFXLFNBQUMsS0FBSzs7SUF3RHRCLHVCQUFDO0NBQUEsQUFyRUQsQ0FNc0MsaUJBQWlCLEdBK0R0RDtTQS9EWSxnQkFBZ0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEaXJlY3RpdmUsIEhvc3RCaW5kaW5nLCBJbmplY3RvciwgT25Jbml0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IHNldEF0dHIsIHNldENTUywgc3dpdGNoQ2xhc3MgfSBmcm9tICdAd20vY29yZSc7XG5cbmltcG9ydCB7IHN0eWxlciB9IGZyb20gJy4uLy4uL2ZyYW1ld29yay9zdHlsZXInO1xuaW1wb3J0IHsgSVdpZGdldENvbmZpZyB9IGZyb20gJy4uLy4uL2ZyYW1ld29yay90eXBlcyc7XG5pbXBvcnQgeyByZWdpc3RlclByb3BzIH0gZnJvbSAnLi9waWN0dXJlLnByb3BzJztcbmltcG9ydCB7IFN0eWxhYmxlQ29tcG9uZW50IH0gZnJvbSAnLi4vYmFzZS9zdHlsYWJsZS5jb21wb25lbnQnO1xuaW1wb3J0IHsgRElTUExBWV9UWVBFIH0gZnJvbSAnLi4vLi4vZnJhbWV3b3JrL2NvbnN0YW50cyc7XG5pbXBvcnQgeyBJbWFnZVBpcGUgfSBmcm9tICcuLi8uLi8uLi9waXBlcy9pbWFnZS5waXBlJztcbmltcG9ydCB7IHByb3ZpZGVBc1dpZGdldFJlZiB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL3dpZGdldC11dGlscyc7XG5cbmNvbnN0IERFRkFVTFRfQ0xTID0gJ2FwcC1waWN0dXJlJztcbmNvbnN0IFdJREdFVF9DT05GSUc6IElXaWRnZXRDb25maWcgPSB7XG4gICAgd2lkZ2V0VHlwZTogJ3dtLXBpY3R1cmUnLFxuICAgIGhvc3RDbGFzczogREVGQVVMVF9DTFMsXG4gICAgZGlzcGxheVR5cGU6IERJU1BMQVlfVFlQRS5JTkxJTkVfQkxPQ0tcbn07XG5cbkBEaXJlY3RpdmUoe1xuICAgIHNlbGVjdG9yOiAnaW1nW3dtUGljdHVyZV0nLFxuICAgIHByb3ZpZGVyczogW1xuICAgICAgICBwcm92aWRlQXNXaWRnZXRSZWYoUGljdHVyZURpcmVjdGl2ZSlcbiAgICBdXG59KVxuZXhwb3J0IGNsYXNzIFBpY3R1cmVEaXJlY3RpdmUgZXh0ZW5kcyBTdHlsYWJsZUNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCB7XG4gICAgc3RhdGljIGluaXRpYWxpemVQcm9wcyA9IHJlZ2lzdGVyUHJvcHMoKTtcblxuICAgIGVuY29kZXVybDtcbiAgICBwaWN0dXJlc291cmNlO1xuICAgIHBpY3R1cmVwbGFjZWhvbGRlcjtcblxuICAgIEBIb3N0QmluZGluZygnc3JjJykgaW1nU291cmNlOiBzdHJpbmc7XG5cbiAgICBjb25zdHJ1Y3Rvcihpbmo6IEluamVjdG9yLCBwcml2YXRlIGltYWdlUGlwZTogSW1hZ2VQaXBlKSB7XG4gICAgICAgIHN1cGVyKGluaiwgV0lER0VUX0NPTkZJRyk7XG5cbiAgICAgICAgc3R5bGVyKHRoaXMubmF0aXZlRWxlbWVudCwgdGhpcyk7XG4gICAgfVxuXG4gICAgc2V0SW1nU291cmNlKCkge1xuICAgICAgICB0aGlzLmltZ1NvdXJjZSA9IHRoaXMuaW1hZ2VQaXBlLnRyYW5zZm9ybSh0aGlzLnBpY3R1cmVzb3VyY2UsIHRoaXMuZW5jb2RldXJsLCB0aGlzLnBpY3R1cmVwbGFjZWhvbGRlcik7XG4gICAgfVxuXG4gICAgb25Qcm9wZXJ0eUNoYW5nZShrZXk6IHN0cmluZywgbnY6IGFueSwgb3Y6IGFueSkge1xuICAgICAgICBpZiAoa2V5ID09PSAncGljdHVyZWFzcGVjdCcpIHtcbiAgICAgICAgICAgIGxldCB3aWR0aCA9ICcnO1xuICAgICAgICAgICAgbGV0IGhlaWdodCA9ICcnO1xuICAgICAgICAgICAgc3dpdGNoIChudikge1xuICAgICAgICAgICAgICAgIGNhc2UgJ05vbmUnOlxuICAgICAgICAgICAgICAgICAgICB3aWR0aCA9IHRoaXMud2lkdGg7XG4gICAgICAgICAgICAgICAgICAgIGhlaWdodCA9IHRoaXMuaGVpZ2h0O1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlICdIJzpcbiAgICAgICAgICAgICAgICAgICAgd2lkdGggPSAnMTAwJSc7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ1YnOlxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQgPSAnMTAwJSc7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ0JvdGgnOlxuICAgICAgICAgICAgICAgICAgICB3aWR0aCA9ICcxMDAlJztcbiAgICAgICAgICAgICAgICAgICAgaGVpZ2h0ID0gJzEwMCUnO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHNldENTUyh0aGlzLm5hdGl2ZUVsZW1lbnQsICd3aWR0aCcsIHdpZHRoLCB0cnVlKTtcbiAgICAgICAgICAgIHNldENTUyh0aGlzLm5hdGl2ZUVsZW1lbnQsICdoZWlnaHQnLCBoZWlnaHQsIHRydWUpO1xuICAgICAgICB9IGVsc2UgaWYgKGtleSA9PT0gJ2VuY29kZXVybCcgfHwga2V5ID09PSAncGljdHVyZXBsYWNlaG9sZGVyJykge1xuICAgICAgICAgICAgdGhpcy5zZXRJbWdTb3VyY2UoKTtcbiAgICAgICAgfSBlbHNlIGlmIChrZXkgPT09ICdzaGFwZScpIHtcbiAgICAgICAgICAgIHN3aXRjaENsYXNzKHRoaXMubmF0aXZlRWxlbWVudCwgYGltZy0ke252fWAsIGBpbWctJHtvdn1gKTtcbiAgICAgICAgfSBlbHNlIGlmIChrZXkgPT09ICdoaW50Jykge1xuICAgICAgICAgICAgc2V0QXR0cih0aGlzLm5hdGl2ZUVsZW1lbnQsICdhbHQnLCBudik7XG4gICAgICAgIH1cbiAgICAgICAgc3VwZXIub25Qcm9wZXJ0eUNoYW5nZShrZXksIG52LCBvdik7XG4gICAgfVxuXG4gICAgb25TdHlsZUNoYW5nZShrZXk6IHN0cmluZywgbnY6IGFueSwgb3Y/OiBhbnkpIHtcbiAgICAgICAgaWYgKGtleSA9PT0gJ3BpY3R1cmVzb3VyY2UnKSB7XG4gICAgICAgICAgICB0aGlzLnNldEltZ1NvdXJjZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3VwZXIub25TdHlsZUNoYW5nZShrZXksIG52LCBvdik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBuZ09uSW5pdCgpIHtcbiAgICAgICAgdGhpcy5zZXRJbWdTb3VyY2UoKTtcbiAgICAgICAgc3VwZXIubmdPbkluaXQoKTtcbiAgICB9XG59XG4iXX0=