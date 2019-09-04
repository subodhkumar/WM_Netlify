import * as tslib_1 from "tslib";
import { ContentChildren, Directive, Injector, NgZone, QueryList } from '@angular/core';
import { CarouselComponent, SlideComponent } from 'ngx-bootstrap';
import { styler } from '../../framework/styler';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './carousel.props';
import { CarouselAnimator } from './carousel.animator';
import { createArrayFrom } from '../../../utils/data-utils';
var WIDGET_CONFIG = {
    widgetType: 'wm-carousel'
};
var navigationClassMap = {
    indicators: 'hide-navs',
    navs: 'hide-indicators',
    none: 'hide-both'
};
var CarouselDirective = /** @class */ (function (_super) {
    tslib_1.__extends(CarouselDirective, _super);
    function CarouselDirective(component, inj, ngZone) {
        var _this = _super.call(this, inj, WIDGET_CONFIG) || this;
        _this.component = component;
        _this.ngZone = ngZone;
        styler(_this.nativeElement, _this);
        return _this;
    }
    CarouselDirective.prototype.onDataChange = function (newVal) {
        this.fieldDefs = createArrayFrom(newVal);
    };
    CarouselDirective.prototype.stopAnimation = function () {
        if (this.animator) {
            this.animator.stop();
        }
    };
    CarouselDirective.prototype.startAnimation = function () {
        if (this.animator) {
            this.animator.interval = this.animationinterval * 1000;
            this.animator.start();
        }
    };
    CarouselDirective.prototype.onSlidesRender = function (slides) {
        var _this = this;
        // if dynamic carousel, initialize the 'currentslide' property as the first object
        if (this.fieldDefs && this.fieldDefs.length) {
            this.currentslide = this.fieldDefs[0];
        }
        setTimeout(function () {
            _this.animator = new CarouselAnimator(_this, _this.interval, _this.ngZone);
        }, 50);
    };
    CarouselDirective.prototype.setupHandlers = function () {
        var _this = this;
        this.slides.changes.subscribe(function (slides) {
            _this.stopAnimation();
            _this.onSlidesRender(slides);
        });
        this.slides.setDirty();
    };
    CarouselDirective.prototype.onChangeCB = function (newIndex, oldIndex) {
        // assign current and previous slides on widget. In case of static carousel, fieldDefs will be undefined, hence the check
        this.currentslide = this.fieldDefs && this.fieldDefs[newIndex];
        this.previousslide = this.fieldDefs && this.fieldDefs[oldIndex];
        this.invokeEventCallback('change', { newIndex: newIndex, oldIndex: oldIndex });
    };
    CarouselDirective.prototype.ngAfterContentInit = function () {
        this.setupHandlers();
    };
    CarouselDirective.prototype.ngOnDestroy = function () {
        this.stopAnimation();
        _super.prototype.ngOnDestroy.call(this);
    };
    CarouselDirective.prototype.ngOnInit = function () {
        _super.prototype.ngOnInit.call(this);
        // Calculating animation interval if animation is enabled
        this.animation === 'auto' ? this.interval = this.animationinterval * 1000 : this.interval = 0;
        // TODO transition is pending
    };
    // on property change handler
    CarouselDirective.prototype.onPropertyChange = function (key, nv, ov) {
        if (key === 'dataset') {
            this.onDataChange(nv);
        }
        else if (key === 'controls') {
            // For showing controls
            this.navigationClass = navigationClassMap[this.controls];
        }
        else if (key === 'animation' || key === 'animationinterval') {
            this.animation === 'none' ? this.stopAnimation() : this.startAnimation();
        }
        else {
            _super.prototype.onPropertyChange.call(this, key, nv, ov);
        }
    };
    CarouselDirective.initializeProps = registerProps();
    CarouselDirective.decorators = [
        { type: Directive, args: [{
                    selector: '[wmCarousel]',
                    exportAs: 'wmCarousel'
                },] }
    ];
    /** @nocollapse */
    CarouselDirective.ctorParameters = function () { return [
        { type: CarouselComponent },
        { type: Injector },
        { type: NgZone }
    ]; };
    CarouselDirective.propDecorators = {
        slides: [{ type: ContentChildren, args: [SlideComponent,] }]
    };
    return CarouselDirective;
}(StylableComponent));
export { CarouselDirective };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2Fyb3VzZWwuZGlyZWN0aXZlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2NvbW1vbi9jYXJvdXNlbC9jYXJvdXNlbC5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBb0IsZUFBZSxFQUFFLFNBQVMsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFxQixTQUFTLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFN0gsT0FBTyxFQUFFLGlCQUFpQixFQUFFLGNBQWMsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUVsRSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFDaEQsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sNEJBQTRCLENBQUM7QUFFL0QsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQ2pELE9BQU8sRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQ3ZELE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUk1RCxJQUFNLGFBQWEsR0FBa0I7SUFDakMsVUFBVSxFQUFFLGFBQWE7Q0FDNUIsQ0FBQztBQUVGLElBQU0sa0JBQWtCLEdBQUc7SUFDdkIsVUFBVSxFQUFFLFdBQVc7SUFDdkIsSUFBSSxFQUFFLGlCQUFpQjtJQUN2QixJQUFJLEVBQUUsV0FBVztDQUNwQixDQUFDO0FBRUY7SUFJdUMsNkNBQWlCO0lBZ0JwRCwyQkFBbUIsU0FBNEIsRUFBRSxHQUFhLEVBQVUsTUFBYztRQUF0RixZQUNJLGtCQUFNLEdBQUcsRUFBRSxhQUFhLENBQUMsU0FFNUI7UUFIa0IsZUFBUyxHQUFULFNBQVMsQ0FBbUI7UUFBeUIsWUFBTSxHQUFOLE1BQU0sQ0FBUTtRQUVsRixNQUFNLENBQUMsS0FBSSxDQUFDLGFBQWEsRUFBRSxLQUFJLENBQUMsQ0FBQzs7SUFDckMsQ0FBQztJQUVPLHdDQUFZLEdB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QWtCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQzVEO2FBQU8sSUFBSSxHQUFHLEtBQUssV0FBVyxJQUFJLEdBQUcsS0FBSyxtQkFBbUIsRUFBRTtZQUM1RCxJQUFJLENBQUMsU0FBUyxLQUFLLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDLENBQUMsQ0FBRSxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7U0FDN0U7YUFBTTtZQUNILGlCQUFNLGdCQUFnQixZQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7U0FDdkM7SUFDTCxDQUFDO0lBNUZNLGlDQUFlLEdBQUcsYUFBYSxFQUFFLENBQUM7O2dCQUw1QyxTQUFTLFNBQUM7b0JBQ1AsUUFBUSxFQUFFLGNBQWM7b0JBQ3hCLFFBQVEsRUFBRSxZQUFZO2lCQUN6Qjs7OztnQkF4QlEsaUJBQWlCO2dCQUY2QixRQUFRO2dCQUFFLE1BQU07Ozt5QkF5Q2xFLGVBQWUsU0FBQyxjQUFjOztJQWdGbkMsd0JBQUM7Q0FBQSxBQWxHRCxDQUl1QyxpQkFBaUIsR0E4RnZEO1NBOUZZLGlCQUFpQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFmdGVyQ29udGVudEluaXQsIENvbnRlbnRDaGlsZHJlbiwgRGlyZWN0aXZlLCBJbmplY3RvciwgTmdab25lLCBPbkRlc3Ryb3ksIE9uSW5pdCwgUXVlcnlMaXN0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IENhcm91c2VsQ29tcG9uZW50LCBTbGlkZUNvbXBvbmVudCB9IGZyb20gJ25neC1ib290c3RyYXAnO1xuXG5pbXBvcnQgeyBzdHlsZXIgfSBmcm9tICcuLi8uLi9mcmFtZXdvcmsvc3R5bGVyJztcbmltcG9ydCB7IFN0eWxhYmxlQ29tcG9uZW50IH0gZnJvbSAnLi4vYmFzZS9zdHlsYWJsZS5jb21wb25lbnQnO1xuaW1wb3J0IHsgSVdpZGdldENvbmZpZyB9IGZyb20gJy4uLy4uL2ZyYW1ld29yay90eXBlcyc7XG5pbXBvcnQgeyByZWdpc3RlclByb3BzIH0gZnJvbSAnLi9jYXJvdXNlbC5wcm9wcyc7XG5pbXBvcnQgeyBDYXJvdXNlbEFuaW1hdG9yIH0gZnJvbSAnLi9jYXJvdXNlbC5hbmltYXRvcic7XG5pbXBvcnQgeyBjcmVhdGVBcnJheUZyb20gfSBmcm9tICcuLi8uLi8uLi91dGlscy9kYXRhLXV0aWxzJztcblxuZGVjbGFyZSBjb25zdCBfO1xuXG5jb25zdCBXSURHRVRfQ09ORklHOiBJV2lkZ2V0Q29uZmlnID0ge1xuICAgIHdpZGdldFR5cGU6ICd3bS1jYXJvdXNlbCdcbn07XG5cbmNvbnN0IG5hdmlnYXRpb25DbGFzc01hcCA9IHtcbiAgICBpbmRpY2F0b3JzOiAnaGlkZS1uYXZzJyxcbiAgICBuYXZzOiAnaGlkZS1pbmRpY2F0b3JzJyxcbiAgICBub25lOiAnaGlkZS1ib3RoJ1xufTtcblxuQERpcmVjdGl2ZSh7XG4gICAgc2VsZWN0b3I6ICdbd21DYXJvdXNlbF0nLFxuICAgIGV4cG9ydEFzOiAnd21DYXJvdXNlbCdcbn0pXG5leHBvcnQgY2xhc3MgQ2Fyb3VzZWxEaXJlY3RpdmUgZXh0ZW5kcyBTdHlsYWJsZUNvbXBvbmVudCBpbXBsZW1lbnRzIEFmdGVyQ29udGVudEluaXQsIE9uRGVzdHJveSwgT25Jbml0IHtcbiAgICBzdGF0aWMgaW5pdGlhbGl6ZVByb3BzID0gcmVnaXN0ZXJQcm9wcygpO1xuXG4gICAgcHJpdmF0ZSBhbmltYXRvcjtcbiAgICBwcml2YXRlIG5hdmlnYXRpb25DbGFzcztcbiAgICBwcml2YXRlIGZpZWxkRGVmcztcbiAgICBwcml2YXRlIGludGVydmFsO1xuXG4gICAgcHVibGljIGFuaW1hdGlvbmludGVydmFsO1xuICAgIHB1YmxpYyBhbmltYXRpb247XG4gICAgcHVibGljIGNvbnRyb2xzO1xuICAgIHB1YmxpYyBjdXJyZW50c2xpZGU7XG4gICAgcHVibGljIHByZXZpb3Vzc2xpZGU7XG5cbiAgICBAQ29udGVudENoaWxkcmVuKFNsaWRlQ29tcG9uZW50KSBzbGlkZXM6IFF1ZXJ5TGlzdDxTbGlkZUNvbXBvbmVudD47XG5cbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgY29tcG9uZW50OiBDYXJvdXNlbENvbXBvbmVudCwgaW5qOiBJbmplY3RvciwgcHJpdmF0ZSBuZ1pvbmU6IE5nWm9uZSkge1xuICAgICAgICBzdXBlcihpbmosIFdJREdFVF9DT05GSUcpO1xuICAgICAgICBzdHlsZXIodGhpcy5uYXRpdmVFbGVtZW50LCB0aGlzKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uRGF0YUNoYW5nZShuZXdWYWwpIHtcbiAgICAgICAgdGhpcy5maWVsZERlZnMgPSBjcmVhdGVBcnJheUZyb20obmV3VmFsKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHN0b3BBbmltYXRpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLmFuaW1hdG9yKSB7XG4gICAgICAgICAgICB0aGlzLmFuaW1hdG9yLnN0b3AoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgc3RhcnRBbmltYXRpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLmFuaW1hdG9yKSB7XG4gICAgICAgICAgICB0aGlzLmFuaW1hdG9yLmludGVydmFsID0gdGhpcy5hbmltYXRpb25pbnRlcnZhbCAqIDEwMDA7XG4gICAgICAgICAgICB0aGlzLmFuaW1hdG9yLnN0YXJ0KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIG9uU2xpZGVzUmVuZGVyKHNsaWRlcykge1xuICAgICAgICAvLyBpZiBkeW5hbWljIGNhcm91c2VsLCBpbml0aWFsaXplIHRoZSAnY3VycmVudHNsaWRlJyBwcm9wZXJ0eSBhcyB0aGUgZmlyc3Qgb2JqZWN0XG4gICAgICAgIGlmICh0aGlzLmZpZWxkRGVmcyAmJiB0aGlzLmZpZWxkRGVmcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudHNsaWRlID0gdGhpcy5maWVsZERlZnNbMF07XG4gICAgICAgIH1cbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmFuaW1hdG9yID0gbmV3IENhcm91c2VsQW5pbWF0b3IodGhpcywgdGhpcy5pbnRlcnZhbCwgdGhpcy5uZ1pvbmUpO1xuICAgICAgICB9LCA1MCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzZXR1cEhhbmRsZXJzKCkge1xuICAgICAgICB0aGlzLnNsaWRlcy5jaGFuZ2VzLnN1YnNjcmliZSggc2xpZGVzID0+IHtcbiAgICAgICAgICAgIHRoaXMuc3RvcEFuaW1hdGlvbigpO1xuICAgICAgICAgICAgdGhpcy5vblNsaWRlc1JlbmRlcihzbGlkZXMpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5zbGlkZXMuc2V0RGlydHkoKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgb25DaGFuZ2VDQihuZXdJbmRleCwgb2xkSW5kZXgpIHtcbiAgICAgICAgLy8gYXNzaWduIGN1cnJlbnQgYW5kIHByZXZpb3VzIHNsaWRlcyBvbiB3aWRnZXQuIEluIGNhc2Ugb2Ygc3RhdGljIGNhcm91c2VsLCBmaWVsZERlZnMgd2lsbCBiZSB1bmRlZmluZWQsIGhlbmNlIHRoZSBjaGVja1xuICAgICAgICB0aGlzLmN1cnJlbnRzbGlkZSA9IHRoaXMuZmllbGREZWZzICYmIHRoaXMuZmllbGREZWZzW25ld0luZGV4XTtcbiAgICAgICAgdGhpcy5wcmV2aW91c3NsaWRlID0gdGhpcy5maWVsZERlZnMgJiYgdGhpcy5maWVsZERlZnNbb2xkSW5kZXhdO1xuICAgICAgICB0aGlzLmludm9rZUV2ZW50Q2FsbGJhY2soJ2NoYW5nZScsIHtuZXdJbmRleDogbmV3SW5kZXgsIG9sZEluZGV4OiBvbGRJbmRleH0pO1xuICAgIH1cblxuICAgIG5nQWZ0ZXJDb250ZW50SW5pdCgpIHtcbiAgICAgICAgdGhpcy5zZXR1cEhhbmRsZXJzKCk7XG4gICAgfVxuXG4gICAgbmdPbkRlc3Ryb3koKSB7XG4gICAgICAgIHRoaXMuc3RvcEFuaW1hdGlvbigpO1xuICAgICAgICBzdXBlci5uZ09uRGVzdHJveSgpO1xuICAgIH1cblxuICAgIG5nT25Jbml0KCkge1xuICAgICAgICBzdXBlci5uZ09uSW5pdCgpO1xuXG4gICAgICAgIC8vIENhbGN1bGF0aW5nIGFuaW1hdGlvbiBpbnRlcnZhbCBpZiBhbmltYXRpb24gaXMgZW5hYmxlZFxuICAgICAgICB0aGlzLmFuaW1hdGlvbiA9PT0gJ2F1dG8nID8gdGhpcy5pbnRlcnZhbCA9IHRoaXMuYW5pbWF0aW9uaW50ZXJ2YWwgKiAxMDAwIDogdGhpcy5pbnRlcnZhbCA9IDAgO1xuICAgICAgICAvLyBUT0RPIHRyYW5zaXRpb24gaXMgcGVuZGluZ1xuXG4gICAgfVxuXG4gICAgLy8gb24gcHJvcGVydHkgY2hhbmdlIGhhbmRsZXJcbiAgICBvblByb3BlcnR5Q2hhbmdlKGtleTogc3RyaW5nLCBudjogYW55LCBvdj86IGFueSkge1xuICAgICAgICBpZiAoa2V5ID09PSAnZGF0YXNldCcpIHtcbiAgICAgICAgICAgIHRoaXMub25EYXRhQ2hhbmdlKG52KTtcbiAgICAgICAgfSBlbHNlIGlmIChrZXkgPT09ICdjb250cm9scycpIHtcbiAgICAgICAgICAgIC8vIEZvciBzaG93aW5nIGNvbnRyb2xzXG4gICAgICAgICAgICB0aGlzLm5hdmlnYXRpb25DbGFzcyA9IG5hdmlnYXRpb25DbGFzc01hcFt0aGlzLmNvbnRyb2xzXTtcbiAgICAgICAgfSAgZWxzZSBpZiAoa2V5ID09PSAnYW5pbWF0aW9uJyB8fCBrZXkgPT09ICdhbmltYXRpb25pbnRlcnZhbCcpIHtcbiAgICAgICAgICAgIHRoaXMuYW5pbWF0aW9uID09PSAnbm9uZScgPyB0aGlzLnN0b3BBbmltYXRpb24oKSA6ICB0aGlzLnN0YXJ0QW5pbWF0aW9uKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdXBlci5vblByb3BlcnR5Q2hhbmdlKGtleSwgbnYsIG92KTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==