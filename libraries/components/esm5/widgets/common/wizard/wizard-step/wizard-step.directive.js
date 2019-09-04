import * as tslib_1 from "tslib";
import { ContentChildren, Directive, HostBinding, Injector, Self } from '@angular/core';
import { NgForm } from '@angular/forms';
import { registerProps } from './wizard-step.props';
import { BaseComponent } from '../../base/base.component';
import { RedrawableDirective } from '../../redraw/redrawable.directive';
import { provideAsWidgetRef } from '../../../../utils/widget-utils';
var DEFAULT_CLS = 'app-wizard-step-content';
var WIDGET_CONFIG = {
    widgetType: 'wm-wizardstep',
    hostClass: DEFAULT_CLS,
};
var WizardStepDirective = /** @class */ (function (_super) {
    tslib_1.__extends(WizardStepDirective, _super);
    function WizardStepDirective(inj, ngForm) {
        var _this = _super.call(this, inj, WIDGET_CONFIG) || this;
        _this.ngForm = ngForm;
        _this.status = 2 /* DISABLED */;
        return _this;
    }
    Object.defineProperty(WizardStepDirective.prototype, "isCurrent", {
        get: function () {
            return this.active;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WizardStepDirective.prototype, "isValid", {
        get: function () {
            return this.ngForm.valid;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WizardStepDirective.prototype, "enableNext", {
        get: function () {
            return !this.disablenext;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WizardStepDirective.prototype, "enableDone", {
        get: function () {
            return !this.disabledone;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WizardStepDirective.prototype, "enablePrev", {
        get: function () {
            return !this.disableprevious;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WizardStepDirective.prototype, "active", {
        get: function () {
            return this.status === 1 /* CURRENT */;
        },
        set: function (nv) {
            var isActive = this.active;
            this.status = 1 /* CURRENT */;
            if (nv && !isActive) {
                this.invokeEventCallback('load');
                this.redrawChildren();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WizardStepDirective.prototype, "done", {
        get: function () {
            return this.status === 3 /* COMPLETED */;
        },
        set: function (nv) {
            if (nv) {
                this.status = 3 /* COMPLETED */;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WizardStepDirective.prototype, "disabled", {
        get: function () {
            return this.status === 2 /* DISABLED */;
        },
        set: function (nv) {
            if (nv) {
                this.status = 2 /* DISABLED */;
            }
        },
        enumerable: true,
        configurable: true
    });
    WizardStepDirective.prototype.onNext = function (index) {
        return this.invokeEventCallback('next', { currentStep: this, stepIndex: index });
    };
    WizardStepDirective.prototype.onPrev = function (index) {
        return this.invokeEventCallback('prev', { currentStep: this, stepIndex: index });
    };
    WizardStepDirective.prototype.onSkip = function (index) {
        return this.invokeEventCallback('skip', { currentStep: this, stepIndex: index });
    };
    // redraw all the projected components which are projected.
    WizardStepDirective.prototype.redrawChildren = function () {
        var _this = this;
        setTimeout(function () {
            if (_this.reDrawableComponents) {
                _this.reDrawableComponents.forEach(function (c) { return c.redraw(); });
            }
        }, 100);
    };
    WizardStepDirective.initializeProps = registerProps();
    WizardStepDirective.decorators = [
        { type: Directive, args: [{
                    selector: 'form[wmWizardStep]',
                    providers: [
                        provideAsWidgetRef(WizardStepDirective)
                    ],
                    exportAs: 'wmWizardStep'
                },] }
    ];
    /** @nocollapse */
    WizardStepDirective.ctorParameters = function () { return [
        { type: Injector },
        { type: NgForm, decorators: [{ type: Self }] }
    ]; };
    WizardStepDirective.propDecorators = {
        reDrawableComponents: [{ type: ContentChildren, args: [RedrawableDirective, { descendants: true },] }],
        isCurrent: [{ type: HostBinding, args: ['class.current',] }]
    };
    return WizardStepDirective;
}(BaseComponent));
export { WizardStepDirective };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2l6YXJkLXN0ZXAuZGlyZWN0aXZlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2NvbW1vbi93aXphcmQvd2l6YXJkLXN0ZXAvd2l6YXJkLXN0ZXAuZGlyZWN0aXZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsZUFBZSxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUUsUUFBUSxFQUFFLElBQUksRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUN4RixPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFHeEMsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLHFCQUFxQixDQUFDO0FBQ3BELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSwyQkFBMkIsQ0FBQztBQUMxRCxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxtQ0FBbUMsQ0FBQztBQUN4RSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSxnQ0FBZ0MsQ0FBQztBQUVwRSxJQUFNLFdBQVcsR0FBRyx5QkFBeUIsQ0FBQztBQUM5QyxJQUFNLGFBQWEsR0FBa0I7SUFDakMsVUFBVSxFQUFFLGVBQWU7SUFDM0IsU0FBUyxFQUFFLFdBQVc7Q0FDekIsQ0FBQztBQVFGO0lBT3lDLCtDQUFhO0lBc0VsRCw2QkFBWSxHQUFhLEVBQWtCLE1BQWM7UUFBekQsWUFDSSxrQkFBTSxHQUFHLEVBQUUsYUFBYSxDQUFDLFNBQzVCO1FBRjBDLFlBQU0sR0FBTixNQUFNLENBQVE7UUEzRGpELFlBQU0sb0JBQXFDOztJQTZEbkQsQ0FBQztJQXhERCxzQkFDSSwwQ0FBUzthQURiO1lBRUksT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQ3ZCLENBQUM7OztPQUFBO0lBRUQsc0JBQVcsd0NBQU87YUFBbEI7WUFDSSxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDO1FBQzdCLENBQUM7OztPQUFBO0lBRUQsc0JBQVcsMkNB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QkFBbUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb250ZW50Q2hpbGRyZW4sIERpcmVjdGl2ZSwgSG9zdEJpbmRpbmcsIEluamVjdG9yLCBTZWxmIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBOZ0Zvcm0gfSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XG5cbmltcG9ydCB7IElXaWRnZXRDb25maWcgfSBmcm9tICcuLi8uLi8uLi9mcmFtZXdvcmsvdHlwZXMnO1xuaW1wb3J0IHsgcmVnaXN0ZXJQcm9wcyB9IGZyb20gJy4vd2l6YXJkLXN0ZXAucHJvcHMnO1xuaW1wb3J0IHsgQmFzZUNvbXBvbmVudCB9IGZyb20gJy4uLy4uL2Jhc2UvYmFzZS5jb21wb25lbnQnO1xuaW1wb3J0IHsgUmVkcmF3YWJsZURpcmVjdGl2ZSB9IGZyb20gJy4uLy4uL3JlZHJhdy9yZWRyYXdhYmxlLmRpcmVjdGl2ZSc7XG5pbXBvcnQgeyBwcm92aWRlQXNXaWRnZXRSZWYgfSBmcm9tICcuLi8uLi8uLi8uLi91dGlscy93aWRnZXQtdXRpbHMnO1xuXG5jb25zdCBERUZBVUxUX0NMUyA9ICdhcHAtd2l6YXJkLXN0ZXAtY29udGVudCc7XG5jb25zdCBXSURHRVRfQ09ORklHOiBJV2lkZ2V0Q29uZmlnID0ge1xuICAgIHdpZGdldFR5cGU6ICd3bS13aXphcmRzdGVwJyxcbiAgICBob3N0Q2xhc3M6IERFRkFVTFRfQ0xTLFxufTtcblxuY29uc3QgZW51bSBTVEVQX1NUQVRVUyB7XG4gICAgQ1VSUkVOVCA9IDEsXG4gICAgRElTQUJMRUQsXG4gICAgQ09NUExFVEVEXG59XG5cbkBEaXJlY3RpdmUoe1xuICAgIHNlbGVjdG9yOiAnZm9ybVt3bVdpemFyZFN0ZXBdJyxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgcHJvdmlkZUFzV2lkZ2V0UmVmKFdpemFyZFN0ZXBEaXJlY3RpdmUpXG4gICAgXSxcbiAgICBleHBvcnRBczogJ3dtV2l6YXJkU3RlcCdcbn0pXG5leHBvcnQgY2xhc3MgV2l6YXJkU3RlcERpcmVjdGl2ZSBleHRlbmRzIEJhc2VDb21wb25lbnQge1xuICAgIHN0YXRpYyBpbml0aWFsaXplUHJvcHMgPSByZWdpc3RlclByb3BzKCk7XG5cbiAgICBwdWJsaWMgc2hvdzogYm9vbGVhbjtcbiAgICBwdWJsaWMgbmFtZTogc3RyaW5nO1xuICAgIHB1YmxpYyBlbmFibGVza2lwOiBhbnk7XG4gICAgcHVibGljIGRpc2FibGVuZXh0OiBib29sZWFuO1xuICAgIHB1YmxpYyBkaXNhYmxlZG9uZTogYm9vbGVhbjtcbiAgICBwdWJsaWMgZGlzYWJsZXByZXZpb3VzOiBib29sZWFuO1xuICAgIHB1YmxpYyBpc0luaXRpYWxpemVkOiBib29sZWFuO1xuXG4gICAgcHJpdmF0ZSBzdGF0dXM6IFNURVBfU1RBVFVTID0gU1RFUF9TVEFUVVMuRElTQUJMRUQ7XG5cbiAgICAvLyByZWZlcmVuY2UgdG8gdGhlIGNvbXBvbmVudHMgd2hpY2ggbmVlZHMgYSByZWRyYXcoZWcsIGdyaWQsIGNoYXJ0KSB3aGVuIHRoZSBoZWlnaHQgb2YgdGhpcyBjb21wb25lbnQgY2hhbmdlc1xuICAgIEBDb250ZW50Q2hpbGRyZW4oUmVkcmF3YWJsZURpcmVjdGl2ZSwge2Rlc2NlbmRhbnRzOiB0cnVlfSkgcmVEcmF3YWJsZUNvbXBvbmVudHM7XG5cbiAgICBASG9zdEJpbmRpbmcoJ2NsYXNzLmN1cnJlbnQnKVxuICAgIGdldCBpc0N1cnJlbnQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmFjdGl2ZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IGlzVmFsaWQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLm5nRm9ybS52YWxpZDtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IGVuYWJsZU5leHQoKSB7XG4gICAgICAgIHJldHVybiAhdGhpcy5kaXNhYmxlbmV4dDtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IGVuYWJsZURvbmUoKSB7XG4gICAgICAgIHJldHVybiAhdGhpcy5kaXNhYmxlZG9uZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IGVuYWJsZVByZXYoKSB7XG4gICAgICAgIHJldHVybiAhdGhpcy5kaXNhYmxlcHJldmlvdXM7XG4gICAgfVxuXG4gICAgcHVibGljIHNldCBhY3RpdmUobnY6IGJvb2xlYW4pIHtcbiAgICAgICAgY29uc3QgaXNBY3RpdmUgPSB0aGlzLmFjdGl2ZTtcbiAgICAgICAgdGhpcy5zdGF0dXMgPSBTVEVQX1NUQVRVUy5DVVJSRU5UO1xuICAgICAgICBpZiAobnYgJiYgIWlzQWN0aXZlKSB7XG4gICAgICAgICAgICB0aGlzLmludm9rZUV2ZW50Q2FsbGJhY2soJ2xvYWQnKTtcbiAgICAgICAgICAgIHRoaXMucmVkcmF3Q2hpbGRyZW4oKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBnZXQgYWN0aXZlKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5zdGF0dXMgPT09IFNURVBfU1RBVFVTLkNVUlJFTlQ7XG4gICAgfVxuXG4gICAgcHVibGljIHNldCBkb25lKG52OiBib29sZWFuKSB7XG4gICAgICAgIGlmIChudikge1xuICAgICAgICAgICAgdGhpcy5zdGF0dXMgPSBTVEVQX1NUQVRVUy5DT01QTEVURUQ7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0IGRvbmUoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0YXR1cyA9PT0gU1RFUF9TVEFUVVMuQ09NUExFVEVEO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXQgZGlzYWJsZWQobnY6IGJvb2xlYW4pIHtcbiAgICAgICAgaWYgKG52KSB7XG4gICAgICAgICAgICB0aGlzLnN0YXR1cyA9IFNURVBfU1RBVFVTLkRJU0FCTEVEO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGdldCBkaXNhYmxlZCgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhdHVzID09PSBTVEVQX1NUQVRVUy5ESVNBQkxFRDtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3Rvcihpbmo6IEluamVjdG9yLCBAU2VsZigpIHByaXZhdGUgbmdGb3JtOiBOZ0Zvcm0pIHtcbiAgICAgICAgc3VwZXIoaW5qLCBXSURHRVRfQ09ORklHKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgb25OZXh0KGluZGV4OiBudW1iZXIpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW52b2tlRXZlbnRDYWxsYmFjaygnbmV4dCcsIHtjdXJyZW50U3RlcDogdGhpcywgc3RlcEluZGV4OiBpbmRleH0pO1xuICAgIH1cblxuICAgIHB1YmxpYyBvblByZXYoaW5kZXg6IG51bWJlcik6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdwcmV2Jywge2N1cnJlbnRTdGVwOiB0aGlzLCBzdGVwSW5kZXg6IGluZGV4fSk7XG4gICAgfVxuXG4gICAgcHVibGljIG9uU2tpcChpbmRleDogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLmludm9rZUV2ZW50Q2FsbGJhY2soJ3NraXAnLCB7Y3VycmVudFN0ZXA6IHRoaXMsIHN0ZXBJbmRleDogaW5kZXh9KTtcbiAgICB9XG5cbiAgICAvLyByZWRyYXcgYWxsIHRoZSBwcm9qZWN0ZWQgY29tcG9uZW50cyB3aGljaCBhcmUgcHJvamVjdGVkLlxuICAgIHByaXZhdGUgcmVkcmF3Q2hpbGRyZW4oKSB7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMucmVEcmF3YWJsZUNvbXBvbmVudHMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlRHJhd2FibGVDb21wb25lbnRzLmZvckVhY2goYyA9PiBjLnJlZHJhdygpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgMTAwKTtcbiAgICB9XG59XG4iXX0=