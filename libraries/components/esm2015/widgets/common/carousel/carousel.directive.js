import { ContentChildren, Directive, Injector, NgZone, QueryList } from '@angular/core';
import { CarouselComponent, SlideComponent } from 'ngx-bootstrap';
import { styler } from '../../framework/styler';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './carousel.props';
import { CarouselAnimator } from './carousel.animator';
import { createArrayFrom } from '../../../utils/data-utils';
const WIDGET_CONFIG = {
    widgetType: 'wm-carousel'
};
const navigationClassMap = {
    indicators: 'hide-navs',
    navs: 'hide-indicators',
    none: 'hide-both'
};
export class CarouselDirective extends StylableComponent {
    constructor(component, inj, ngZone) {
        super(inj, WIDGET_CONFIG);
        this.component = component;
        this.ngZone = ngZone;
        styler(this.nativeElement, this);
    }
    onDataChange(newVal) {
        this.fieldDefs = createArrayFrom(newVal);
    }
    stopAnimation() {
        if (this.animator) {
            this.animator.stop();
        }
    }
    startAnimation() {
        if (this.animator) {
            this.animator.interval = this.animationinterval * 1000;
            this.animator.start();
        }
    }
    onSlidesRender(slides) {
        // if dynamic carousel, initialize the 'currentslide' property as the first object
        if (this.fieldDefs && this.fieldDefs.length) {
            this.currentslide = this.fieldDefs[0];
        }
        setTimeout(() => {
            this.animator = new CarouselAnimator(this, this.interval, this.ngZone);
        }, 50);
    }
    setupHandlers() {
        this.slides.changes.subscribe(slides => {
            this.stopAnimation();
            this.onSlidesRender(slides);
        });
        this.slides.setDirty();
    }
    onChangeCB(newIndex, oldIndex) {
        // assign current and previous slides on widget. In case of static carousel, fieldDefs will be undefined, hence the check
        this.currentslide = this.fieldDefs && this.fieldDefs[newIndex];
        this.previousslide = this.fieldDefs && this.fieldDefs[oldIndex];
        this.invokeEventCallback('change', { newIndex: newIndex, oldIndex: oldIndex });
    }
    ngAfterContentInit() {
        this.setupHandlers();
    }
    ngOnDestroy() {
        this.stopAnimation();
        super.ngOnDestroy();
    }
    ngOnInit() {
        super.ngOnInit();
        // Calculating animation interval if animation is enabled
        this.animation === 'auto' ? this.interval = this.animationinterval * 1000 : this.interval = 0;
        // TODO transition is pending
    }
    // on property change handler
    onPropertyChange(key, nv, ov) {
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
            super.onPropertyChange(key, nv, ov);
        }
    }
}
CarouselDirective.initializeProps = registerProps();
CarouselDirective.decorators = [
    { type: Directive, args: [{
                selector: '[wmCarousel]',
                exportAs: 'wmCarousel'
            },] }
];
/** @nocollapse */
CarouselDirective.ctorParameters = () => [
    { type: CarouselComponent },
    { type: Injector },
    { type: NgZone }
];
CarouselDirective.propDecorators = {
    slides: [{ type: ContentChildren, args: [SlideComponent,] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2Fyb3VzZWwuZGlyZWN0aXZlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2NvbW1vbi9jYXJvdXNlbC9jYXJvdXNlbC5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFvQixlQUFlLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQXFCLFNBQVMsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUU3SCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsY0FBYyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRWxFLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUNoRCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUUvRCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFDakQsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0scUJBQXFCLENBQUM7QUFDdkQsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBSTVELE1BQU0sYUFBYSxHQUFrQjtJQUNqQyxVQUFVLEVBQUUsYUFBYTtDQUM1QixDQUFDO0FBRUYsTUFBTSxrQkFBa0IsR0FBRztJQUN2QixVQUFVLEVBQUUsV0FBVztJQUN2QixJQUFJLEVBQUUsaUJBQWlCO0lBQ3ZCLElBQUksRUFBRSxXQUFXO0NBQ3BCLENBQUM7QUFNRixNQUFNLE9BQU8saUJBQWtCLFNBQVEsaUJBQWlCO0lBZ0JwRCxZQUFtQixTQUE0QixFQUFFLEdBQWEsRUFBVSxNQUFjO1FBQ2xGLEtBQUssQ0FBQyxHQUFHLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFEWCxjQUFTLEdBQVQsU0FBUyxDQUFtQjtRQUF5QixXQUFNLEdBQU4sTUFBTSxDQUFRO1FBRWxGLE1BQU0sQ0FBQyxJQUFJLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3JDLENBQUM7SUFF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QUFLLFdBQVcsSUFBSSxHQUFHLEtBQUssbUJBQW1CLEVBQUU7WUFDNUQsSUFBSSxDQUFDLFNBQVMsS0FBSyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLENBQUUsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO1NBQzdFO2FBQU07WUFDSCxLQUFLLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztTQUN2QztJQUNMLENBQUM7O0FBNUZNLGlDQUFlLEdBQUcsYUFBYSxFQUFFLENBQUM7O1lBTDVDLFNBQVMsU0FBQztnQkFDUCxRQUFRLEVBQUUsY0FBYztnQkFDeEIsUUFBUSxFQUFFLFlBQVk7YUFDekI7Ozs7WUF4QlEsaUJBQWlCO1lBRjZCLFFBQVE7WUFBRSxNQUFNOzs7cUJBeUNsRSxlQUFlLFNBQUMsY0FBYyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFmdGVyQ29udGVudEluaXQsIENvbnRlbnRDaGlsZHJlbiwgRGlyZWN0aXZlLCBJbmplY3RvciwgTmdab25lLCBPbkRlc3Ryb3ksIE9uSW5pdCwgUXVlcnlMaXN0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IENhcm91c2VsQ29tcG9uZW50LCBTbGlkZUNvbXBvbmVudCB9IGZyb20gJ25neC1ib290c3RyYXAnO1xuXG5pbXBvcnQgeyBzdHlsZXIgfSBmcm9tICcuLi8uLi9mcmFtZXdvcmsvc3R5bGVyJztcbmltcG9ydCB7IFN0eWxhYmxlQ29tcG9uZW50IH0gZnJvbSAnLi4vYmFzZS9zdHlsYWJsZS5jb21wb25lbnQnO1xuaW1wb3J0IHsgSVdpZGdldENvbmZpZyB9IGZyb20gJy4uLy4uL2ZyYW1ld29yay90eXBlcyc7XG5pbXBvcnQgeyByZWdpc3RlclByb3BzIH0gZnJvbSAnLi9jYXJvdXNlbC5wcm9wcyc7XG5pbXBvcnQgeyBDYXJvdXNlbEFuaW1hdG9yIH0gZnJvbSAnLi9jYXJvdXNlbC5hbmltYXRvcic7XG5pbXBvcnQgeyBjcmVhdGVBcnJheUZyb20gfSBmcm9tICcuLi8uLi8uLi91dGlscy9kYXRhLXV0aWxzJztcblxuZGVjbGFyZSBjb25zdCBfO1xuXG5jb25zdCBXSURHRVRfQ09ORklHOiBJV2lkZ2V0Q29uZmlnID0ge1xuICAgIHdpZGdldFR5cGU6ICd3bS1jYXJvdXNlbCdcbn07XG5cbmNvbnN0IG5hdmlnYXRpb25DbGFzc01hcCA9IHtcbiAgICBpbmRpY2F0b3JzOiAnaGlkZS1uYXZzJyxcbiAgICBuYXZzOiAnaGlkZS1pbmRpY2F0b3JzJyxcbiAgICBub25lOiAnaGlkZS1ib3RoJ1xufTtcblxuQERpcmVjdGl2ZSh7XG4gICAgc2VsZWN0b3I6ICdbd21DYXJvdXNlbF0nLFxuICAgIGV4cG9ydEFzOiAnd21DYXJvdXNlbCdcbn0pXG5leHBvcnQgY2xhc3MgQ2Fyb3VzZWxEaXJlY3RpdmUgZXh0ZW5kcyBTdHlsYWJsZUNvbXBvbmVudCBpbXBsZW1lbnRzIEFmdGVyQ29udGVudEluaXQsIE9uRGVzdHJveSwgT25Jbml0IHtcbiAgICBzdGF0aWMgaW5pdGlhbGl6ZVByb3BzID0gcmVnaXN0ZXJQcm9wcygpO1xuXG4gICAgcHJpdmF0ZSBhbmltYXRvcjtcbiAgICBwcml2YXRlIG5hdmlnYXRpb25DbGFzcztcbiAgICBwcml2YXRlIGZpZWxkRGVmcztcbiAgICBwcml2YXRlIGludGVydmFsO1xuXG4gICAgcHVibGljIGFuaW1hdGlvbmludGVydmFsO1xuICAgIHB1YmxpYyBhbmltYXRpb247XG4gICAgcHVibGljIGNvbnRyb2xzO1xuICAgIHB1YmxpYyBjdXJyZW50c2xpZGU7XG4gICAgcHVibGljIHByZXZpb3Vzc2xpZGU7XG5cbiAgICBAQ29udGVudENoaWxkcmVuKFNsaWRlQ29tcG9uZW50KSBzbGlkZXM6IFF1ZXJ5TGlzdDxTbGlkZUNvbXBvbmVudD47XG5cbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgY29tcG9uZW50OiBDYXJvdXNlbENvbXBvbmVudCwgaW5qOiBJbmplY3RvciwgcHJpdmF0ZSBuZ1pvbmU6IE5nWm9uZSkge1xuICAgICAgICBzdXBlcihpbmosIFdJREdFVF9DT05GSUcpO1xuICAgICAgICBzdHlsZXIodGhpcy5uYXRpdmVFbGVtZW50LCB0aGlzKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uRGF0YUNoYW5nZShuZXdWYWwpIHtcbiAgICAgICAgdGhpcy5maWVsZERlZnMgPSBjcmVhdGVBcnJheUZyb20obmV3VmFsKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHN0b3BBbmltYXRpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLmFuaW1hdG9yKSB7XG4gICAgICAgICAgICB0aGlzLmFuaW1hdG9yLnN0b3AoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgc3RhcnRBbmltYXRpb24oKSB7XG4gICAgICAgIGlmICh0aGlzLmFuaW1hdG9yKSB7XG4gICAgICAgICAgICB0aGlzLmFuaW1hdG9yLmludGVydmFsID0gdGhpcy5hbmltYXRpb25pbnRlcnZhbCAqIDEwMDA7XG4gICAgICAgICAgICB0aGlzLmFuaW1hdG9yLnN0YXJ0KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIG9uU2xpZGVzUmVuZGVyKHNsaWRlcykge1xuICAgICAgICAvLyBpZiBkeW5hbWljIGNhcm91c2VsLCBpbml0aWFsaXplIHRoZSAnY3VycmVudHNsaWRlJyBwcm9wZXJ0eSBhcyB0aGUgZmlyc3Qgb2JqZWN0XG4gICAgICAgIGlmICh0aGlzLmZpZWxkRGVmcyAmJiB0aGlzLmZpZWxkRGVmcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudHNsaWRlID0gdGhpcy5maWVsZERlZnNbMF07XG4gICAgICAgIH1cbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICB0aGlzLmFuaW1hdG9yID0gbmV3IENhcm91c2VsQW5pbWF0b3IodGhpcywgdGhpcy5pbnRlcnZhbCwgdGhpcy5uZ1pvbmUpO1xuICAgICAgICB9LCA1MCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzZXR1cEhhbmRsZXJzKCkge1xuICAgICAgICB0aGlzLnNsaWRlcy5jaGFuZ2VzLnN1YnNjcmliZSggc2xpZGVzID0+IHtcbiAgICAgICAgICAgIHRoaXMuc3RvcEFuaW1hdGlvbigpO1xuICAgICAgICAgICAgdGhpcy5vblNsaWRlc1JlbmRlcihzbGlkZXMpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5zbGlkZXMuc2V0RGlydHkoKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgb25DaGFuZ2VDQihuZXdJbmRleCwgb2xkSW5kZXgpIHtcbiAgICAgICAgLy8gYXNzaWduIGN1cnJlbnQgYW5kIHByZXZpb3VzIHNsaWRlcyBvbiB3aWRnZXQuIEluIGNhc2Ugb2Ygc3RhdGljIGNhcm91c2VsLCBmaWVsZERlZnMgd2lsbCBiZSB1bmRlZmluZWQsIGhlbmNlIHRoZSBjaGVja1xuICAgICAgICB0aGlzLmN1cnJlbnRzbGlkZSA9IHRoaXMuZmllbGREZWZzICYmIHRoaXMuZmllbGREZWZzW25ld0luZGV4XTtcbiAgICAgICAgdGhpcy5wcmV2aW91c3NsaWRlID0gdGhpcy5maWVsZERlZnMgJiYgdGhpcy5maWVsZERlZnNbb2xkSW5kZXhdO1xuICAgICAgICB0aGlzLmludm9rZUV2ZW50Q2FsbGJhY2soJ2NoYW5nZScsIHtuZXdJbmRleDogbmV3SW5kZXgsIG9sZEluZGV4OiBvbGRJbmRleH0pO1xuICAgIH1cblxuICAgIG5nQWZ0ZXJDb250ZW50SW5pdCgpIHtcbiAgICAgICAgdGhpcy5zZXR1cEhhbmRsZXJzKCk7XG4gICAgfVxuXG4gICAgbmdPbkRlc3Ryb3koKSB7XG4gICAgICAgIHRoaXMuc3RvcEFuaW1hdGlvbigpO1xuICAgICAgICBzdXBlci5uZ09uRGVzdHJveSgpO1xuICAgIH1cblxuICAgIG5nT25Jbml0KCkge1xuICAgICAgICBzdXBlci5uZ09uSW5pdCgpO1xuXG4gICAgICAgIC8vIENhbGN1bGF0aW5nIGFuaW1hdGlvbiBpbnRlcnZhbCBpZiBhbmltYXRpb24gaXMgZW5hYmxlZFxuICAgICAgICB0aGlzLmFuaW1hdGlvbiA9PT0gJ2F1dG8nID8gdGhpcy5pbnRlcnZhbCA9IHRoaXMuYW5pbWF0aW9uaW50ZXJ2YWwgKiAxMDAwIDogdGhpcy5pbnRlcnZhbCA9IDAgO1xuICAgICAgICAvLyBUT0RPIHRyYW5zaXRpb24gaXMgcGVuZGluZ1xuXG4gICAgfVxuXG4gICAgLy8gb24gcHJvcGVydHkgY2hhbmdlIGhhbmRsZXJcbiAgICBvblByb3BlcnR5Q2hhbmdlKGtleTogc3RyaW5nLCBudjogYW55LCBvdj86IGFueSkge1xuICAgICAgICBpZiAoa2V5ID09PSAnZGF0YXNldCcpIHtcbiAgICAgICAgICAgIHRoaXMub25EYXRhQ2hhbmdlKG52KTtcbiAgICAgICAgfSBlbHNlIGlmIChrZXkgPT09ICdjb250cm9scycpIHtcbiAgICAgICAgICAgIC8vIEZvciBzaG93aW5nIGNvbnRyb2xzXG4gICAgICAgICAgICB0aGlzLm5hdmlnYXRpb25DbGFzcyA9IG5hdmlnYXRpb25DbGFzc01hcFt0aGlzLmNvbnRyb2xzXTtcbiAgICAgICAgfSAgZWxzZSBpZiAoa2V5ID09PSAnYW5pbWF0aW9uJyB8fCBrZXkgPT09ICdhbmltYXRpb25pbnRlcnZhbCcpIHtcbiAgICAgICAgICAgIHRoaXMuYW5pbWF0aW9uID09PSAnbm9uZScgPyB0aGlzLnN0b3BBbmltYXRpb24oKSA6ICB0aGlzLnN0YXJ0QW5pbWF0aW9uKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdXBlci5vblByb3BlcnR5Q2hhbmdlKGtleSwgbnYsIG92KTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==