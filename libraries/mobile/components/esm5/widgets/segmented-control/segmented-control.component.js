import * as tslib_1 from "tslib";
import { Component, Injector } from '@angular/core';
import { APPLY_STYLES_TYPE, provideAsWidgetRef, StylableComponent, styler } from '@wm/components';
import { isNumber, setCSS, setCSSFromObj } from '@wm/core';
import { registerProps } from './segmented-control.props';
var DEFAULT_CLS = 'app-segmented-control';
var WIDGET_CONFIG = { widgetType: 'wm-segmented-control', hostClass: DEFAULT_CLS };
var SegmentedControlComponent = /** @class */ (function (_super) {
    tslib_1.__extends(SegmentedControlComponent, _super);
    function SegmentedControlComponent(inj) {
        var _this = _super.call(this, inj, WIDGET_CONFIG) || this;
        _this.contents = [];
        _this.currentSelectedIndex = 0;
        styler(_this.nativeElement, _this, APPLY_STYLES_TYPE.SCROLLABLE_CONTAINER);
        return _this;
    }
    SegmentedControlComponent.prototype.addContent = function (content) {
        this.contents.push(content);
    };
    SegmentedControlComponent.prototype.goToNext = function () {
        this.showContent(this.currentSelectedIndex + 1);
    };
    SegmentedControlComponent.prototype.goToPrev = function () {
        this.showContent(this.currentSelectedIndex - 1);
    };
    SegmentedControlComponent.prototype.ngAfterViewInit = function () {
        var e_1, _a;
        this._$container = this.$element.find('>.app-segments-container');
        var childEls = this._$container.find('>.list-inline >li');
        var maxWidth = this.contents.length * 100 + "%";
        setCSSFromObj(this._$container[0], {
            maxWidth: maxWidth,
            width: maxWidth,
            'white-space': 'nowrap',
            transition: 'transform 0.2s linear'
        });
        var width = 100 / this.contents.length + "%";
        try {
            for (var _b = tslib_1.__values(Array.from(childEls)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var child = _c.value;
                setCSS(child, 'width', width);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        this.showContent(0, undefined, true);
    };
    SegmentedControlComponent.prototype.onPropertyChange = function (key, nv, ov) {
        if (key === 'tabindex') {
            return;
        }
        else {
            _super.prototype.onPropertyChange.call(this, key, nv, ov);
        }
    };
    SegmentedControlComponent.prototype.removeContent = function (content) {
        var index = this.contents.findIndex(function (c) {
            return c === content;
        });
        if (index >= 0) {
            this.contents.splice(index, 1);
            if (index < this.contents.length) {
                this.showContent(index);
            }
            else if (this.contents.length > 0) {
                this.showContent(0);
            }
        }
    };
    SegmentedControlComponent.prototype.showContent = function (content, $event, defaultLoad) {
        var index;
        var selectedContent;
        if (isNumber(content)) {
            index = content;
            if (this.contents.length) {
                selectedContent = this.contents[index];
            }
        }
        else {
            selectedContent = content;
            index = this.contents.findIndex(function (c) {
                return c === content;
            });
        }
        if (selectedContent) {
            selectedContent.loadContent(defaultLoad);
        }
        if (index < 0 || index >= this.contents.length) {
            return;
        }
        if ($event) {
            $event.stopPropagation();
        }
        var eventData = {
            $old: this.currentSelectedIndex,
            $new: index
        };
        this.currentSelectedIndex = index;
        this.invokeEventCallback('beforesegmentchange', eventData);
        setCSS(this._$container[0], 'transform', "translate3d(" + -1 * index / this.contents.length * 100 + "%, 0, 0)");
        this.invokeEventCallback('segmentchange', eventData);
    };
    SegmentedControlComponent.initializeProps = registerProps();
    SegmentedControlComponent.decorators = [
        { type: Component, args: [{
                    selector: '[wmSegmentedControl]',
                    template: "<div class=\"app-segments-container\"> \n    <ul class=\"list-inline\">\n        <ng-content></ng-content>\n    </ul>\n    </div> \n<div class=\"btn-group btn-group-justified\"> \n    <a class=\"btn btn-default\" *ngFor=\"let content of contents; index as i\"\n       [ngClass]=\"{'active btn-primary' : i == currentSelectedIndex}\"\n       (click)=\"showContent(i, $event);\">\n        <i class=\"app-icon\" [ngClass]=\"content.iconclass\"></i>{{content.caption}}\n    </a> \n</div> ",
                    providers: [
                        provideAsWidgetRef(SegmentedControlComponent)
                    ]
                }] }
    ];
    /** @nocollapse */
    SegmentedControlComponent.ctorParameters = function () { return [
        { type: Injector }
    ]; };
    return SegmentedControlComponent;
}(StylableComponent));
export { SegmentedControlComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VnbWVudGVkLWNvbnRyb2wuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL21vYmlsZS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9zZWdtZW50ZWQtY29udHJvbC9zZWdtZW50ZWQtY29udHJvbC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBaUIsU0FBUyxFQUFFLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUVuRSxPQUFPLEVBQUUsaUJBQWlCLEVBQWlCLGtCQUFrQixFQUFFLGlCQUFpQixFQUFFLE1BQU0sRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQ2pILE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLGFBQWEsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUUzRCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sMkJBQTJCLENBQUM7QUFHMUQsSUFBTSxXQUFXLEdBQUcsdUJBQXVCLENBQUM7QUFDNUMsSUFBTSxhQUFhLEdBQWtCLEVBQUMsVUFBVSxFQUFFLHNCQUFzQixFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUMsQ0FBQztBQUVsRztJQU8rQyxxREFBaUI7SUFRNUQsbUNBQVksR0FBYTtRQUF6QixZQUNJLGtCQUFNLEdBQUcsRUFBRSxhQUFhLENBQUMsU0FFNUI7UUFOTSxjQUFRLEdBQThCLEVBQUUsQ0FBQztRQUN6QywwQkFBb0IsR0FBRyxDQUFDLENBQUM7UUFJNUIsTUFBTSxDQUFDLEtBQUksQ0FBQyxhQUFhLEVBQUUsS0FBSSxFQUFFLGlCQUFpQixDQUFDLG9CQUFvQixDQUFDLENBQUM7O0lBQzdFLENBQUM7SUFFTSw4Q0FBVSxHQUFqQixVQUFrQixPQUFnQztRQUM5QyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNoQyxDQUFDO0lBRU0sNENBQVEsR0FBZjtRQUNJLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLG9CQUFvQixHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ3BELENBQUM7SUFFTSw0Q0FBUSxHQUFmO1FBQ0ksSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsb0JBQW9CLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDcEQsQ0FBQztJQUVNLG1EQUFlLEdBQXRCOztRQUNJLElBQUksQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsMEJBQTBCLENBQUMsQ0FBQztRQUNsRSxJQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1FBQzVELElBQU0sUUFBUSxHQUFNLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLEdBQUcsTUFBRyxDQUFDO1FBQ2xELGFBQWEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQy9CLFFBQVEsRUFBRSxRQUFRO1lBQ2xCLEtBQUssRUFBRSxRQUFRO1lBQ2YsYUFBYSxFQUFFLFFBQVE7WUFDdkIsVUFBVSxFQUFFLHVCQUF1QjtTQUN0QyxDQUFDLENBQUM7UUFDSCxJQUFNLEtBQUssR0FBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLE1BQUcsQ0FBQzs7WUFDL0MsS0FBb0IsSUFBQSxLQUFBLGlCQUFBLEtBQUssQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUEsZ0JBQUEsNEJBQUU7Z0JBQXJDLElBQU0sS0FBSyxXQUFBO2dCQUNaLE1BQU0sQ0FBQyxLQUFvQixFQUFFLE9BQU8sRUFBRSxLQUFLLENBQUMsQ0FBQzthQUNoRDs7Ozs7Ozs7O1FBQ0QsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLEVBQUUsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3pDLENBQUM7SUFFTSxvREFBZ0IsR0FBdkIsVUFBd0IsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFHO1FBQ2hDLElBQUksR0FBRyxLQUFLLFVBQVUsRUFBRTtZQUNwQixPQUFPO1NBQ1Y7YUFBTTtZQUNILGlCQUFNLGdCQUFnQixZQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7U0FDdkM7SUFDTCxDQUFDO0lBRU0saURBQWEsR0FBcEIsVUFBcUIsT0FBZ0M7UUFDakQsSUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsVUFBQSxDQUFDO1lBQ25DLE9BQU8sQ0FBQyxLQUFLLE9BQU8sQ0FBQztRQUN6QixDQUFDLENBQUMsQ0FBQztRQUNILElBQUksS0FBSyxJQUFJLENBQUMsRUFBRTtZQUNaLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQztZQUMvQixJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRTtnQkFDOUIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUMzQjtpQkFBTSxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDakMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUN2QjtTQUNKO0lBQ0wsQ0FBQztJQUVNLCtDQUFXLEdBQWxCLFVBQW1CLE9BQXlDLEVBQUcsTUFBWSxFQUFFLFdBQXFCO1FBQzlGLElBQUksS0FBYSxDQUFDO1FBQ2xCLElBQUksZUFBd0MsQ0FBQztRQUM3QyxJQUFJLFFBQVEsQ0FBQyxPQUFPLENBQUMsRUFBRTtZQUNuQixLQUFLLEdBQUcsT0FBaUIsQ0FBQztZQUMxQixJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFO2dCQUN0QixlQUFlLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQzthQUMxQztTQUNKO2FBQU07WUFDSCxlQUFlLEdBQUcsT0FBa0MsQ0FBQztZQUNyRCxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLENBQUMsVUFBQSxDQUFDO2dCQUM3QixPQUFPLENBQUMsS0FBSyxPQUFPLENBQUM7WUFDekIsQ0FBQyxDQUFDLENBQUM7U0FDTjtRQUVELElBQUksZUFBZSxFQUFFO1lBQ2pCLGVBQWUsQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLENBQUM7U0FDNUM7UUFFRCxJQUFJLEtBQUssR0FBRyxDQUFDLElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFO1lBQzVDLE9BQU87U0FDVjtRQUNELElBQUksTUFBTSxFQUFFO1lBQ1IsTUFBTSxDQUFDLGVBQWUsRUFBRSxDQUFDO1NBQzVCO1FBQ0QsSUFBTSxTQUFTLEdBQUc7WUFDVixJQUFJLEVBQUcsSUFBSSxDQUFDLG9CQUFvQjtZQUNoQyxJQUFJLEVBQUcsS0FBSztTQUNmLENBQUM7UUFFTixJQUFJLENBQUMsb0JBQW9CLEdBQUcsS0FBSyxDQUFDO1FBQ2xDLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxxQkFBcUIsRUFBRSxTQUFTLENBQUMsQ0FBQztRQUMzRCxNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFBRSxXQUFXLEVBQUUsaUJBQWUsQ0FBQyxDQUFDLEdBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLEdBQUcsYUFBVSxDQUFDLENBQUM7UUFDNUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLGVBQWUsRUFBRSxTQUFTLENBQUMsQ0FBQztJQUN6RCxDQUFDO0lBakdNLHlDQUFlLEdBQUcsYUFBYSxFQUFFLENBQUM7O2dCQVI1QyxTQUFTLFNBQUM7b0JBQ1AsUUFBUSxFQUFFLHNCQUFzQjtvQkFDaEMsZ2ZBQWlEO29CQUNqRCxTQUFTLEVBQUU7d0JBQ1Asa0JBQWtCLENBQUMseUJBQXlCLENBQUM7cUJBQ2hEO2lCQUNKOzs7O2dCQWpCa0MsUUFBUTs7SUFxSDNDLGdDQUFDO0NBQUEsQUExR0QsQ0FPK0MsaUJBQWlCLEdBbUcvRDtTQW5HWSx5QkFBeUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBZnRlclZpZXdJbml0LCBDb21wb25lbnQsIEluamVjdG9yIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IEFQUExZX1NUWUxFU19UWVBFLCBJV2lkZ2V0Q29uZmlnLCBwcm92aWRlQXNXaWRnZXRSZWYsIFN0eWxhYmxlQ29tcG9uZW50LCBzdHlsZXIgfSBmcm9tICdAd20vY29tcG9uZW50cyc7XG5pbXBvcnQgeyBpc051bWJlciwgc2V0Q1NTLCBzZXRDU1NGcm9tT2JqIH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5pbXBvcnQgeyByZWdpc3RlclByb3BzIH0gZnJvbSAnLi9zZWdtZW50ZWQtY29udHJvbC5wcm9wcyc7XG5pbXBvcnQgeyBTZWdtZW50Q29udGVudENvbXBvbmVudCB9IGZyb20gJy4vc2VnbWVudC1jb250ZW50L3NlZ21lbnQtY29udGVudC5jb21wb25lbnQnO1xuXG5jb25zdCBERUZBVUxUX0NMUyA9ICdhcHAtc2VnbWVudGVkLWNvbnRyb2wnO1xuY29uc3QgV0lER0VUX0NPTkZJRzogSVdpZGdldENvbmZpZyA9IHt3aWRnZXRUeXBlOiAnd20tc2VnbWVudGVkLWNvbnRyb2wnLCBob3N0Q2xhc3M6IERFRkFVTFRfQ0xTfTtcblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdbd21TZWdtZW50ZWRDb250cm9sXScsXG4gICAgdGVtcGxhdGVVcmw6ICcuL3NlZ21lbnRlZC1jb250cm9sLmNvbXBvbmVudC5odG1sJyxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgcHJvdmlkZUFzV2lkZ2V0UmVmKFNlZ21lbnRlZENvbnRyb2xDb21wb25lbnQpXG4gICAgXVxufSlcbmV4cG9ydCBjbGFzcyBTZWdtZW50ZWRDb250cm9sQ29tcG9uZW50IGV4dGVuZHMgU3R5bGFibGVDb21wb25lbnQgaW1wbGVtZW50cyBBZnRlclZpZXdJbml0IHtcbiAgICBzdGF0aWMgaW5pdGlhbGl6ZVByb3BzID0gcmVnaXN0ZXJQcm9wcygpO1xuXG4gICAgcHJpdmF0ZSBfJGNvbnRhaW5lcjtcblxuICAgIHB1YmxpYyBjb250ZW50czogU2VnbWVudENvbnRlbnRDb21wb25lbnRbXSA9IFtdO1xuICAgIHB1YmxpYyBjdXJyZW50U2VsZWN0ZWRJbmRleCA9IDA7XG5cbiAgICBjb25zdHJ1Y3Rvcihpbmo6IEluamVjdG9yKSB7XG4gICAgICAgIHN1cGVyKGluaiwgV0lER0VUX0NPTkZJRyk7XG4gICAgICAgIHN0eWxlcih0aGlzLm5hdGl2ZUVsZW1lbnQsIHRoaXMsIEFQUExZX1NUWUxFU19UWVBFLlNDUk9MTEFCTEVfQ09OVEFJTkVSKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYWRkQ29udGVudChjb250ZW50OiBTZWdtZW50Q29udGVudENvbXBvbmVudCkge1xuICAgICAgICB0aGlzLmNvbnRlbnRzLnB1c2goY29udGVudCk7XG4gICAgfVxuXG4gICAgcHVibGljIGdvVG9OZXh0KCkge1xuICAgICAgICB0aGlzLnNob3dDb250ZW50KHRoaXMuY3VycmVudFNlbGVjdGVkSW5kZXggKyAxKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ29Ub1ByZXYoKSB7XG4gICAgICAgIHRoaXMuc2hvd0NvbnRlbnQodGhpcy5jdXJyZW50U2VsZWN0ZWRJbmRleCAtIDEpO1xuICAgIH1cblxuICAgIHB1YmxpYyBuZ0FmdGVyVmlld0luaXQoKSB7XG4gICAgICAgIHRoaXMuXyRjb250YWluZXIgPSB0aGlzLiRlbGVtZW50LmZpbmQoJz4uYXBwLXNlZ21lbnRzLWNvbnRhaW5lcicpO1xuICAgICAgICBjb25zdCBjaGlsZEVscyA9IHRoaXMuXyRjb250YWluZXIuZmluZCgnPi5saXN0LWlubGluZSA+bGknKTtcbiAgICAgICAgY29uc3QgbWF4V2lkdGggPSBgJHt0aGlzLmNvbnRlbnRzLmxlbmd0aCAqIDEwMH0lYDtcbiAgICAgICAgc2V0Q1NTRnJvbU9iaih0aGlzLl8kY29udGFpbmVyWzBdLCB7XG4gICAgICAgICAgICBtYXhXaWR0aDogbWF4V2lkdGgsXG4gICAgICAgICAgICB3aWR0aDogbWF4V2lkdGgsXG4gICAgICAgICAgICAnd2hpdGUtc3BhY2UnOiAnbm93cmFwJyxcbiAgICAgICAgICAgIHRyYW5zaXRpb246ICd0cmFuc2Zvcm0gMC4ycyBsaW5lYXInXG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCB3aWR0aCA9IGAkezEwMCAvIHRoaXMuY29udGVudHMubGVuZ3RofSVgO1xuICAgICAgICBmb3IgKGNvbnN0IGNoaWxkIG9mIEFycmF5LmZyb20oY2hpbGRFbHMpKSB7XG4gICAgICAgICAgICBzZXRDU1MoY2hpbGQgYXMgSFRNTEVsZW1lbnQsICd3aWR0aCcsIHdpZHRoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNob3dDb250ZW50KDAsIHVuZGVmaW5lZCwgdHJ1ZSk7XG4gICAgfVxuXG4gICAgcHVibGljIG9uUHJvcGVydHlDaGFuZ2Uoa2V5LCBudiwgb3Y/KSB7XG4gICAgICAgIGlmIChrZXkgPT09ICd0YWJpbmRleCcpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN1cGVyLm9uUHJvcGVydHlDaGFuZ2Uoa2V5LCBudiwgb3YpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIHJlbW92ZUNvbnRlbnQoY29udGVudDogU2VnbWVudENvbnRlbnRDb21wb25lbnQpIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSB0aGlzLmNvbnRlbnRzLmZpbmRJbmRleChjID0+IHtcbiAgICAgICAgICAgIHJldHVybiBjID09PSBjb250ZW50O1xuICAgICAgICB9KTtcbiAgICAgICAgaWYgKGluZGV4ID49IDApIHtcbiAgICAgICAgICAgIHRoaXMuY29udGVudHMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgIGlmIChpbmRleCA8IHRoaXMuY29udGVudHMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zaG93Q29udGVudChpbmRleCk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuY29udGVudHMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2hvd0NvbnRlbnQoMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgc2hvd0NvbnRlbnQoY29udGVudDogbnVtYmVyIHwgU2VnbWVudENvbnRlbnRDb21wb25lbnQgLCAkZXZlbnQ/OiBhbnksIGRlZmF1bHRMb2FkPzogYm9vbGVhbikge1xuICAgICAgICBsZXQgaW5kZXg6IG51bWJlcjtcbiAgICAgICAgbGV0IHNlbGVjdGVkQ29udGVudDogU2VnbWVudENvbnRlbnRDb21wb25lbnQ7XG4gICAgICAgIGlmIChpc051bWJlcihjb250ZW50KSkge1xuICAgICAgICAgICAgaW5kZXggPSBjb250ZW50IGFzIG51bWJlcjtcbiAgICAgICAgICAgIGlmICh0aGlzLmNvbnRlbnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHNlbGVjdGVkQ29udGVudCA9IHRoaXMuY29udGVudHNbaW5kZXhdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2VsZWN0ZWRDb250ZW50ID0gY29udGVudCBhcyBTZWdtZW50Q29udGVudENvbXBvbmVudDtcbiAgICAgICAgICAgIGluZGV4ID0gdGhpcy5jb250ZW50cy5maW5kSW5kZXgoYyA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGMgPT09IGNvbnRlbnQ7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzZWxlY3RlZENvbnRlbnQpIHtcbiAgICAgICAgICAgIHNlbGVjdGVkQ29udGVudC5sb2FkQ29udGVudChkZWZhdWx0TG9hZCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaW5kZXggPCAwIHx8IGluZGV4ID49IHRoaXMuY29udGVudHMubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCRldmVudCkge1xuICAgICAgICAgICAgJGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGV2ZW50RGF0YSA9IHtcbiAgICAgICAgICAgICAgICAkb2xkIDogdGhpcy5jdXJyZW50U2VsZWN0ZWRJbmRleCxcbiAgICAgICAgICAgICAgICAkbmV3IDogaW5kZXhcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5jdXJyZW50U2VsZWN0ZWRJbmRleCA9IGluZGV4O1xuICAgICAgICB0aGlzLmludm9rZUV2ZW50Q2FsbGJhY2soJ2JlZm9yZXNlZ21lbnRjaGFuZ2UnLCBldmVudERhdGEpO1xuICAgICAgICBzZXRDU1ModGhpcy5fJGNvbnRhaW5lclswXSwgJ3RyYW5zZm9ybScsIGB0cmFuc2xhdGUzZCgkey0xICogIGluZGV4IC8gdGhpcy5jb250ZW50cy5sZW5ndGggKiAxMDB9JSwgMCwgMClgKTtcbiAgICAgICAgdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdzZWdtZW50Y2hhbmdlJywgZXZlbnREYXRhKTtcbiAgICB9XG59XG4iXX0=