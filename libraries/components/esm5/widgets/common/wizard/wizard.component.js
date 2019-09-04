import * as tslib_1 from "tslib";
import { Component, ContentChildren, Injector, QueryList } from '@angular/core';
import { noop } from '@wm/core';
import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { registerProps } from './wizard.props';
import { StylableComponent } from '../base/stylable.component';
import { WizardStepDirective } from './wizard-step/wizard-step.directive';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
var DEFAULT_CLS = 'app-wizard panel clearfix';
var WIDGET_CONFIG = {
    widgetType: 'wm-wizard',
    hostClass: DEFAULT_CLS
};
var WizardComponent = /** @class */ (function (_super) {
    tslib_1.__extends(WizardComponent, _super);
    function WizardComponent(inj) {
        var _this = this;
        var resolveFn = noop;
        _this = _super.call(this, inj, WIDGET_CONFIG, new Promise(function (res) { return resolveFn = res; })) || this;
        styler(_this.nativeElement, _this, APPLY_STYLES_TYPE.SHELL);
        _this.promiseResolverFn = resolveFn;
        // initialize the message object with default values
        _this.message = {
            caption: '',
            type: ''
        };
        return _this;
    }
    Object.defineProperty(WizardComponent.prototype, "hasPrevStep", {
        get: function () {
            return !this.isFirstStep(this.currentStep);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WizardComponent.prototype, "hasNextStep", {
        get: function () {
            return !this.isLastStep(this.currentStep);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WizardComponent.prototype, "showDoneBtn", {
        get: function () {
            if (!this.currentStep) {
                return;
            }
            return !this.hasNextStep && this.currentStep.enableDone;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WizardComponent.prototype, "enablePrev", {
        get: function () {
            if (!this.currentStep) {
                return;
            }
            return this.currentStep.enablePrev;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WizardComponent.prototype, "enableNext", {
        get: function () {
            if (!this.currentStep) {
                return;
            }
            return this.currentStep.enableNext && this.currentStep.isValid;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WizardComponent.prototype, "enableDone", {
        get: function () {
            if (!this.currentStep) {
                return;
            }
            return this.currentStep.enableDone && this.currentStep.isValid;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * returns next valid step. the index passed is also checked if its valid step
     * @param index
     * @returns {WizardStepDirective}
     */
    WizardComponent.prototype.getNextValidStepFormIndex = function (index) {
        for (var i = index; i < this.steps.length; i++) {
            var step = this.getStepRefByIndex(i);
            if (step.show) {
                return step;
            }
        }
    };
    /**
     * returns previous valid step. the index passed is also checked if its valid step
     * @param index
     * @returns {WizardStepDirective}
     */
    WizardComponent.prototype.getPreviousValidStepFormIndex = function (index) {
        for (var i = index; i >= 0; i--) {
            var step = this.getStepRefByIndex(i);
            if (step.show) {
                return step;
            }
        }
    };
    /**
     * returns current step index value.
     * @returns {number}
     */
    WizardComponent.prototype.getCurrentStepIndex = function () {
        return this.getStepIndexByRef(this.currentStep);
    };
    /**
     * returns stepRef when index is passed.
     * @param {number} index
     * @returns {WizardStepDirective}
     */
    WizardComponent.prototype.getStepRefByIndex = function (index) {
        return this.steps.toArray()[index];
    };
    /**
     * returns the index value of the step.
     * @param {WizardStepDirective} wizardStep
     * @returns {number}
     */
    WizardComponent.prototype.getStepIndexByRef = function (wizardStep) {
        return this.steps.toArray().indexOf(wizardStep);
    };
    /**
     * gets stepRef by searching on the name property.
     * @param {string} name
     * @returns {WizardStepDirective}
     */
    WizardComponent.prototype.getStepRefByName = function (name) {
        return this.steps.find(function (step) { return step.name === name; });
    };
    /**
     * sets default step as current step if configured
     * or finds first valid step and set it as current step.
     * @param {WizardStepDirective} step
     */
    WizardComponent.prototype.setDefaultStep = function (step) {
        // If the default step has show true then only update the currentStep
        if (step && step.show) {
            this.currentStep = step;
            step.active = true;
            step.isInitialized = true;
            // Mark all previous step status COMPLETED
            var index = this.getStepIndexByRef(step) - 1;
            while (index >= 0) {
                var prevStep = this.getStepRefByIndex(index);
                prevStep.done = true;
                prevStep.isInitialized = true;
                index--;
            }
        }
        else {
            // set next valid step as current step
            step = this.getNextValidStepFormIndex(0);
            if (step) {
                this.setDefaultStep(step);
            }
        }
    };
    /**
     * Selects the associated step when the wizard header is clicked.
     * @param $event
     * @param {WizardStepDirective} currentStep
     */
    WizardComponent.prototype.onWizardHeaderClick = function ($event, currentStep) {
        var _this = this;
        // select the step if it's status is done
        if (currentStep.done) {
            // set all the next steps status as disabled and previous steps as done
            this.steps.forEach(function (step, index) {
                if (index < _this.getStepIndexByRef(currentStep)) {
                    step.done = true;
                }
                else {
                    step.disabled = true;
                }
            });
            // set the selected step as current step and make it active
            this.currentStep = currentStep;
            this.currentStep.active = true;
        }
    };
    // Method to navigate to next step
    WizardComponent.prototype.next = function (eventName) {
        if (eventName === void 0) { eventName = 'next'; }
        var currentStep = this.currentStep;
        var currentStepIndex = this.getCurrentStepIndex();
        var nextStep;
        // abort if onSkip method returns false
        if (eventName === 'skip') {
            if (currentStep.onSkip(currentStepIndex) === false) {
                return;
            }
        }
        else if (eventName === 'next') {
            if (currentStep.onNext(currentStepIndex) === false) {
                return;
            }
        }
        nextStep = this.getNextValidStepFormIndex(currentStepIndex + 1);
        nextStep.isInitialized = true;
        // If there are any steps which has show then only change state of current step else remain same
        if (nextStep) {
            currentStep.done = true;
            nextStep.active = true;
            this.currentStep = nextStep;
        }
    };
    // Method to navigate to previous step
    WizardComponent.prototype.prev = function () {
        var currentStep = this.currentStep;
        var currentStepIndex = this.getCurrentStepIndex();
        var prevStep;
        // abort if onPrev method returns false.
        if (currentStep.onPrev(currentStepIndex) === false) {
            return;
        }
        prevStep = this.getPreviousValidStepFormIndex(currentStepIndex - 1);
        // If there are any steps which has show then only change state of current step else remain same
        if (prevStep) {
            currentStep.disabled = true;
            prevStep.active = true;
            this.currentStep = prevStep;
        }
    };
    WizardComponent.prototype.skip = function () {
        this.next('skip');
    };
    // Method to invoke on-Done event on wizard
    WizardComponent.prototype.done = function () {
        this.invokeEventCallback('done', { steps: this.steps.toArray() });
    };
    // Method to invoke on-Cancel event on wizard
    WizardComponent.prototype.cancel = function () {
        this.invokeEventCallback('cancel', { steps: this.steps.toArray() });
    };
    WizardComponent.prototype.isFirstStep = function (stepRef) {
        return this.steps.first === stepRef;
    };
    WizardComponent.prototype.isLastStep = function (stepRef) {
        return this.steps.last === stepRef;
    };
    // Define the property change handler. This Method will be triggered when there is a change in the widget property
    WizardComponent.prototype.onPropertyChange = function (key, nv, ov) {
        // Monitoring changes for properties and accordingly handling respective changes
        if (key === 'stepstyle') {
            this.stepClass = nv === 'justified' ? 'nav-justified' : '';
        }
        else if (key === 'defaultstep') {
            this.setDefaultStep(this.getStepRefByName(nv));
        }
        else {
            _super.prototype.onPropertyChange.call(this, key, nv, ov);
        }
    };
    WizardComponent.prototype.ngAfterContentInit = function () {
        _super.prototype.ngAfterContentInit.call(this);
        this.promiseResolverFn();
    };
    WizardComponent.prototype.ngAfterViewInit = function () {
        _super.prototype.ngAfterViewInit.call(this);
        styler(this.nativeElement.querySelector('.panel-body'), this, APPLY_STYLES_TYPE.INNER_SHELL);
    };
    WizardComponent.initializeProps = registerProps();
    WizardComponent.decorators = [
        { type: Component, args: [{
                    selector: 'div[wmWizard]',
                    template: "<div class=\"app-wizard-heading\" role=\"tab\">\n    <ul class=\"app-wizard-steps nav nav-pills {{stepClass}}\">\n        <li class=\"app-wizard-step\" *ngFor=\"let step of steps\" [hidden]=\"!step.show\"\n            [ngClass]=\"{active: step.done, current: step.active, disabled: step.disabled}\"\n            (click)=\"onWizardHeaderClick($event, step)\">\n            <a href=\"javascript:void(0)\" [attr.aria-label]=\"step.title\" [attr.title]=\"step.title\">\n                <span class=\"arrow\"></span>\n                <i class=\"app-icon {{step.iconclass}}\" *ngIf=\"step.iconclass\"></i>\n                <span class=\"step-title\" [textContent]=\"step.title\"></span>\n            </a>\n        </li>\n    </ul>\n</div>\n<div class=\"app-wizard-body panel-body\" role=\"tabpanel\">\n    <p wmMessage *ngIf=\"message.caption\" caption.bind=\"message.caption\" type.bind=\"message.type\"></p>\n    <ng-content select=\"form[wmWizardStep]\"></ng-content>\n</div>\n<div class=\"app-wizard-actions panel-footer {{actionsalignment}}\">\n    <a class=\"app-wizard-skip\" name=\"skipStep_{{name}}\" *ngIf=\"currentStep?.enableskip\" title=\"Skip step\" (click)=\"skip()\">Skip &raquo;</a>\n    <div class=\"app-wizard-actions-right\">\n        <button type=\"button\" name=\"cancelBtn_{{name}}\" class=\"btn app-button btn-secondary\" *ngIf=\"cancelable\"\n                (click)=\"cancel()\" [title]=\"cancelbtnlabel\" [textContent]=\"cancelbtnlabel\"></button>\n        <button type=\"button\" name=\"previousBtn_{{name}}\" class=\"btn app-button btn-secondary\"\n                *ngIf=\"hasPrevStep\" (click)=\"prev()\" [disabled]=\"!enablePrev\">\n            <i class=\"app-icon wi wi-chevron-left\"></i>\n            <span class=\"btn-caption\" [textContent]=\"previousbtnlabel\"></span>\n        </button>\n        <button type=\"button\" name=\"nextBtn_{{name}}\" class=\"btn app-button btn-primary\"\n                *ngIf=\"hasNextStep\" (click)=\"next()\" [disabled]=\"!enableNext\">\n            <span class=\"btn-caption\" [textContent]=\"nextbtnlabel\"></span>\n            <i class=\"app-icon wi wi-chevron-right\"></i>\n        </button>\n        <button type=\"button\" name=\"doneBtn_{{name}}\" class=\"btn app-button btn-success\"\n                *ngIf=\"showDoneBtn\" (click)=\"done()\"\n                [disabled]=\"!enableDone\">\n            <i class=\"app-icon wi wi-done\"></i>\n            <span class=\"btn-caption\" [textContent]=\"donebtnlabel\"></span>\n        </button>\n    </div>\n</div>\n",
                    providers: [
                        provideAsWidgetRef(WizardComponent)
                    ]
                }] }
    ];
    /** @nocollapse */
    WizardComponent.ctorParameters = function () { return [
        { type: Injector }
    ]; };
    WizardComponent.propDecorators = {
        steps: [{ type: ContentChildren, args: [WizardStepDirective,] }]
    };
    return WizardComponent;
}(StylableComponent));
export { WizardComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2l6YXJkLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vd2l6YXJkL3dpemFyZC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBbUMsU0FBUyxFQUFFLGVBQWUsRUFBRSxRQUFRLEVBQVUsU0FBUyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRXpILE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFaEMsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBRW5FLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUMvQyxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUMvRCxPQUFPLEVBQUUsbUJBQW1CLEVBQUUsTUFBTSxxQ0FBcUMsQ0FBQztBQUMxRSxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUVqRSxJQUFNLFdBQVcsR0FBRywyQkFBMkIsQ0FBQztBQUNoRCxJQUFNLGFBQWEsR0FBa0I7SUFDakMsVUFBVSxFQUFFLFdBQVc7SUFDdkIsU0FBUyxFQUFFLFdBQVc7Q0FDekIsQ0FBQztBQUVGO0lBT3FDLDJDQUFpQjtJQWlEbEQseUJBQVksR0FBYTtRQUF6QixpQkFhQztRQVpHLElBQUksU0FBUyxHQUFhLElBQUksQ0FBQztRQUUvQixRQUFBLGtCQUFNLEdBQUcsRUFBRSxhQUFhLEVBQUUsSUFBSSxPQUFPLENBQUMsVUFBQSxHQUFHLElBQUksT0FBQSxTQUFTLEdBQUcsR0FBRyxFQUFmLENBQWUsQ0FBQyxDQUFDLFNBQUM7UUFDL0QsTUFBTSxDQUFDLEtBQUksQ0FBQyxhQUFhLEVBQUUsS0FBSSxFQUFFLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRTFELEtBQUksQ0FBQyxpQkFBaUIsR0FB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a0IsQ0FBQyxlQUFlLENBQUM7cUJBQ3RDO2lCQUNKOzs7O2dCQXZCcUUsUUFBUTs7O3dCQTJCekUsZUFBZSxTQUFDLG1CQUFtQjs7SUE4UXhDLHNCQUFDO0NBQUEsQUF4UkQsQ0FPcUMsaUJBQWlCLEdBaVJyRDtTQWpSWSxlQUFlIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQWZ0ZXJDb250ZW50SW5pdCwgQWZ0ZXJWaWV3SW5pdCwgQ29tcG9uZW50LCBDb250ZW50Q2hpbGRyZW4sIEluamVjdG9yLCBPbkluaXQsIFF1ZXJ5TGlzdCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBub29wIH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5pbXBvcnQgeyBBUFBMWV9TVFlMRVNfVFlQRSwgc3R5bGVyIH0gZnJvbSAnLi4vLi4vZnJhbWV3b3JrL3N0eWxlcic7XG5pbXBvcnQgeyBJV2lkZ2V0Q29uZmlnIH0gZnJvbSAnLi4vLi4vZnJhbWV3b3JrL3R5cGVzJztcbmltcG9ydCB7IHJlZ2lzdGVyUHJvcHMgfSBmcm9tICcuL3dpemFyZC5wcm9wcyc7XG5pbXBvcnQgeyBTdHlsYWJsZUNvbXBvbmVudCB9IGZyb20gJy4uL2Jhc2Uvc3R5bGFibGUuY29tcG9uZW50JztcbmltcG9ydCB7IFdpemFyZFN0ZXBEaXJlY3RpdmUgfSBmcm9tICcuL3dpemFyZC1zdGVwL3dpemFyZC1zdGVwLmRpcmVjdGl2ZSc7XG5pbXBvcnQgeyBwcm92aWRlQXNXaWRnZXRSZWYgfSBmcm9tICcuLi8uLi8uLi91dGlscy93aWRnZXQtdXRpbHMnO1xuXG5jb25zdCBERUZBVUxUX0NMUyA9ICdhcHAtd2l6YXJkIHBhbmVsIGNsZWFyZml4JztcbmNvbnN0IFdJREdFVF9DT05GSUc6IElXaWRnZXRDb25maWcgPSB7XG4gICAgd2lkZ2V0VHlwZTogJ3dtLXdpemFyZCcsXG4gICAgaG9zdENsYXNzOiBERUZBVUxUX0NMU1xufTtcblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdkaXZbd21XaXphcmRdJyxcbiAgICB0ZW1wbGF0ZVVybDogJy4vd2l6YXJkLmNvbXBvbmVudC5odG1sJyxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgcHJvdmlkZUFzV2lkZ2V0UmVmKFdpemFyZENvbXBvbmVudClcbiAgICBdXG59KVxuZXhwb3J0IGNsYXNzIFdpemFyZENvbXBvbmVudCBleHRlbmRzIFN0eWxhYmxlQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0LCBBZnRlckNvbnRlbnRJbml0LCBBZnRlclZpZXdJbml0IHtcbiAgICBzdGF0aWMgaW5pdGlhbGl6ZVByb3BzID0gcmVnaXN0ZXJQcm9wcygpO1xuXG4gICAgQENvbnRlbnRDaGlsZHJlbihXaXphcmRTdGVwRGlyZWN0aXZlKSBzdGVwczogUXVlcnlMaXN0PFdpemFyZFN0ZXBEaXJlY3RpdmU+O1xuXG4gICAgcHVibGljIG1lc3NhZ2U6IHtjYXB0aW9uOiBzdHJpbmcsIHR5cGU6IHN0cmluZ307XG4gICAgcHVibGljIGN1cnJlbnRTdGVwOiBXaXphcmRTdGVwRGlyZWN0aXZlO1xuXG4gICAgcHVibGljIHN0ZXBDbGFzczogc3RyaW5nO1xuICAgIHByaXZhdGUgcmVhZG9ubHkgcHJvbWlzZVJlc29sdmVyRm46IEZ1bmN0aW9uO1xuICAgIHB1YmxpYyBhY3Rpb25zYWxpZ25tZW50OiBhbnk7XG4gICAgcHVibGljIGNhbmNlbGFibGU6IGFueTtcblxuICAgIGdldCBoYXNQcmV2U3RlcCgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuICF0aGlzLmlzRmlyc3RTdGVwKHRoaXMuY3VycmVudFN0ZXApO1xuICAgIH1cblxuICAgIGdldCBoYXNOZXh0U3RlcCgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuICF0aGlzLmlzTGFzdFN0ZXAodGhpcy5jdXJyZW50U3RlcCk7XG4gICAgfVxuXG4gICAgZ2V0IHNob3dEb25lQnRuKCk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAoIXRoaXMuY3VycmVudFN0ZXApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gIXRoaXMuaGFzTmV4dFN0ZXAgJiYgdGhpcy5jdXJyZW50U3RlcC5lbmFibGVEb25lO1xuICAgIH1cblxuICAgIGdldCBlbmFibGVQcmV2KCk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAoIXRoaXMuY3VycmVudFN0ZXApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5jdXJyZW50U3RlcC5lbmFibGVQcmV2O1xuICAgIH1cblxuICAgIGdldCBlbmFibGVOZXh0KCk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAoIXRoaXMuY3VycmVudFN0ZXApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5jdXJyZW50U3RlcC5lbmFibGVOZXh0ICYmIHRoaXMuY3VycmVudFN0ZXAuaXNWYWxpZDtcbiAgICB9XG5cbiAgICBnZXQgZW5hYmxlRG9uZSgpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKCF0aGlzLmN1cnJlbnRTdGVwKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuY3VycmVudFN0ZXAuZW5hYmxlRG9uZSAmJiB0aGlzLmN1cnJlbnRTdGVwLmlzVmFsaWQ7XG4gICAgfVxuXG4gICAgY29uc3RydWN0b3IoaW5qOiBJbmplY3Rvcikge1xuICAgICAgICBsZXQgcmVzb2x2ZUZuOiBGdW5jdGlvbiA9IG5vb3A7XG5cbiAgICAgICAgc3VwZXIoaW5qLCBXSURHRVRfQ09ORklHLCBuZXcgUHJvbWlzZShyZXMgPT4gcmVzb2x2ZUZuID0gcmVzKSk7XG4gICAgICAgIHN0eWxlcih0aGlzLm5hdGl2ZUVsZW1lbnQsIHRoaXMsIEFQUExZX1NUWUxFU19UWVBFLlNIRUxMKTtcblxuICAgICAgICB0aGlzLnByb21pc2VSZXNvbHZlckZuID0gcmVzb2x2ZUZuO1xuXG4gICAgICAgIC8vIGluaXRpYWxpemUgdGhlIG1lc3NhZ2Ugb2JqZWN0IHdpdGggZGVmYXVsdCB2YWx1ZXNcbiAgICAgICAgdGhpcy5tZXNzYWdlID0ge1xuICAgICAgICAgICAgY2FwdGlvbjogJycsXG4gICAgICAgICAgICB0eXBlOiAnJ1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHJldHVybnMgbmV4dCB2YWxpZCBzdGVwLiB0aGUgaW5kZXggcGFzc2VkIGlzIGFsc28gY2hlY2tlZCBpZiBpdHMgdmFsaWQgc3RlcFxuICAgICAqIEBwYXJhbSBpbmRleFxuICAgICAqIEByZXR1cm5zIHtXaXphcmRTdGVwRGlyZWN0aXZlfVxuICAgICAqL1xuICAgIHByaXZhdGUgZ2V0TmV4dFZhbGlkU3RlcEZvcm1JbmRleChpbmRleDogbnVtYmVyKTogV2l6YXJkU3RlcERpcmVjdGl2ZSB7XG4gICAgICAgIGZvciAobGV0IGkgPSBpbmRleDsgaSA8IHRoaXMuc3RlcHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IHN0ZXAgPSB0aGlzLmdldFN0ZXBSZWZCeUluZGV4KGkpO1xuICAgICAgICAgICAgaWYgKHN0ZXAuc2hvdykge1xuICAgICAgICAgICAgICAgIHJldHVybiBzdGVwO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogcmV0dXJucyBwcmV2aW91cyB2YWxpZCBzdGVwLiB0aGUgaW5kZXggcGFzc2VkIGlzIGFsc28gY2hlY2tlZCBpZiBpdHMgdmFsaWQgc3RlcFxuICAgICAqIEBwYXJhbSBpbmRleFxuICAgICAqIEByZXR1cm5zIHtXaXphcmRTdGVwRGlyZWN0aXZlfVxuICAgICAqL1xuICAgIHByaXZhdGUgZ2V0UHJldmlvdXNWYWxpZFN0ZXBGb3JtSW5kZXgoaW5kZXg6IG51bWJlcik6IFdpemFyZFN0ZXBEaXJlY3RpdmUge1xuICAgICAgICBmb3IgKGxldCBpID0gaW5kZXg7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgICBjb25zdCBzdGVwID0gdGhpcy5nZXRTdGVwUmVmQnlJbmRleChpKTtcbiAgICAgICAgICAgIGlmIChzdGVwLnNob3cpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc3RlcDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHJldHVybnMgY3VycmVudCBzdGVwIGluZGV4IHZhbHVlLlxuICAgICAqIEByZXR1cm5zIHtudW1iZXJ9XG4gICAgICovXG4gICAgcHJpdmF0ZSBnZXRDdXJyZW50U3RlcEluZGV4KCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFN0ZXBJbmRleEJ5UmVmKHRoaXMuY3VycmVudFN0ZXApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHJldHVybnMgc3RlcFJlZiB3aGVuIGluZGV4IGlzIHBhc3NlZC5cbiAgICAgKiBAcGFyYW0ge251bWJlcn0gaW5kZXhcbiAgICAgKiBAcmV0dXJucyB7V2l6YXJkU3RlcERpcmVjdGl2ZX1cbiAgICAgKi9cbiAgICBwcml2YXRlIGdldFN0ZXBSZWZCeUluZGV4KGluZGV4OiBudW1iZXIpOiBXaXphcmRTdGVwRGlyZWN0aXZlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RlcHMudG9BcnJheSgpW2luZGV4XTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiByZXR1cm5zIHRoZSBpbmRleCB2YWx1ZSBvZiB0aGUgc3RlcC5cbiAgICAgKiBAcGFyYW0ge1dpemFyZFN0ZXBEaXJlY3RpdmV9IHdpemFyZFN0ZXBcbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgICAqL1xuICAgIHByaXZhdGUgZ2V0U3RlcEluZGV4QnlSZWYod2l6YXJkU3RlcDogV2l6YXJkU3RlcERpcmVjdGl2ZSk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0ZXBzLnRvQXJyYXkoKS5pbmRleE9mKHdpemFyZFN0ZXApO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGdldHMgc3RlcFJlZiBieSBzZWFyY2hpbmcgb24gdGhlIG5hbWUgcHJvcGVydHkuXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAgICAgKiBAcmV0dXJucyB7V2l6YXJkU3RlcERpcmVjdGl2ZX1cbiAgICAgKi9cbiAgICBwcml2YXRlIGdldFN0ZXBSZWZCeU5hbWUobmFtZTogc3RyaW5nKTogV2l6YXJkU3RlcERpcmVjdGl2ZSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0ZXBzLmZpbmQoc3RlcCA9PiBzdGVwLm5hbWUgPT09IG5hbWUpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHNldHMgZGVmYXVsdCBzdGVwIGFzIGN1cnJlbnQgc3RlcCBpZiBjb25maWd1cmVkXG4gICAgICogb3IgZmluZHMgZmlyc3QgdmFsaWQgc3RlcCBhbmQgc2V0IGl0IGFzIGN1cnJlbnQgc3RlcC5cbiAgICAgKiBAcGFyYW0ge1dpemFyZFN0ZXBEaXJlY3RpdmV9IHN0ZXBcbiAgICAgKi9cbiAgICBwcml2YXRlIHNldERlZmF1bHRTdGVwKHN0ZXA6IFdpemFyZFN0ZXBEaXJlY3RpdmUpIHtcbiAgICAgICAgLy8gSWYgdGhlIGRlZmF1bHQgc3RlcCBoYXMgc2hvdyB0cnVlIHRoZW4gb25seSB1cGRhdGUgdGhlIGN1cnJlbnRTdGVwXG4gICAgICAgIGlmIChzdGVwICYmIHN0ZXAuc2hvdykge1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50U3RlcCA9IHN0ZXA7XG4gICAgICAgICAgICBzdGVwLmFjdGl2ZSA9IHRydWU7XG4gICAgICAgICAgICBzdGVwLmlzSW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgICAgICAgICAgLy8gTWFyayBhbGwgcHJldmlvdXMgc3RlcCBzdGF0dXMgQ09NUExFVEVEXG4gICAgICAgICAgICBsZXQgaW5kZXggPSB0aGlzLmdldFN0ZXBJbmRleEJ5UmVmKHN0ZXApIC0gMTtcbiAgICAgICAgICAgIHdoaWxlIChpbmRleCA+PSAwKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcHJldlN0ZXAgPSB0aGlzLmdldFN0ZXBSZWZCeUluZGV4KGluZGV4KTtcbiAgICAgICAgICAgICAgICBwcmV2U3RlcC5kb25lID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBwcmV2U3RlcC5pc0luaXRpYWxpemVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBpbmRleC0tO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gc2V0IG5leHQgdmFsaWQgc3RlcCBhcyBjdXJyZW50IHN0ZXBcbiAgICAgICAgICAgIHN0ZXAgPSB0aGlzLmdldE5leHRWYWxpZFN0ZXBGb3JtSW5kZXgoMCk7XG4gICAgICAgICAgICBpZiAoc3RlcCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc2V0RGVmYXVsdFN0ZXAoc3RlcCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZWxlY3RzIHRoZSBhc3NvY2lhdGVkIHN0ZXAgd2hlbiB0aGUgd2l6YXJkIGhlYWRlciBpcyBjbGlja2VkLlxuICAgICAqIEBwYXJhbSAkZXZlbnRcbiAgICAgKiBAcGFyYW0ge1dpemFyZFN0ZXBEaXJlY3RpdmV9IGN1cnJlbnRTdGVwXG4gICAgICovXG4gICAgcHJpdmF0ZSBvbldpemFyZEhlYWRlckNsaWNrKCRldmVudDogRXZlbnQsIGN1cnJlbnRTdGVwOiBXaXphcmRTdGVwRGlyZWN0aXZlKSB7XG4gICAgICAgIC8vIHNlbGVjdCB0aGUgc3RlcCBpZiBpdCdzIHN0YXR1cyBpcyBkb25lXG4gICAgICAgIGlmIChjdXJyZW50U3RlcC5kb25lKSB7XG4gICAgICAgICAgICAvLyBzZXQgYWxsIHRoZSBuZXh0IHN0ZXBzIHN0YXR1cyBhcyBkaXNhYmxlZCBhbmQgcHJldmlvdXMgc3RlcHMgYXMgZG9uZVxuICAgICAgICAgICAgdGhpcy5zdGVwcy5mb3JFYWNoKChzdGVwLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChpbmRleCA8IHRoaXMuZ2V0U3RlcEluZGV4QnlSZWYoY3VycmVudFN0ZXApKSB7XG4gICAgICAgICAgICAgICAgICAgc3RlcC5kb25lID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzdGVwLmRpc2FibGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vIHNldCB0aGUgc2VsZWN0ZWQgc3RlcCBhcyBjdXJyZW50IHN0ZXAgYW5kIG1ha2UgaXQgYWN0aXZlXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTdGVwID0gY3VycmVudFN0ZXA7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTdGVwLmFjdGl2ZSA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBNZXRob2QgdG8gbmF2aWdhdGUgdG8gbmV4dCBzdGVwXG4gICAgcHVibGljIG5leHQoZXZlbnROYW1lOiBzdHJpbmcgPSAnbmV4dCcpIHtcbiAgICAgICAgY29uc3QgY3VycmVudFN0ZXAgPSB0aGlzLmN1cnJlbnRTdGVwO1xuICAgICAgICBjb25zdCBjdXJyZW50U3RlcEluZGV4ID0gdGhpcy5nZXRDdXJyZW50U3RlcEluZGV4KCk7XG5cbiAgICAgICAgbGV0IG5leHRTdGVwOiBXaXphcmRTdGVwRGlyZWN0aXZlO1xuXG4gICAgICAgIC8vIGFib3J0IGlmIG9uU2tpcCBtZXRob2QgcmV0dXJucyBmYWxzZVxuICAgICAgICBpZiAoZXZlbnROYW1lID09PSAnc2tpcCcpIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50U3RlcC5vblNraXAoY3VycmVudFN0ZXBJbmRleCkgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGV2ZW50TmFtZSA9PT0gJ25leHQnKSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudFN0ZXAub25OZXh0KGN1cnJlbnRTdGVwSW5kZXgpID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBuZXh0U3RlcCA9IHRoaXMuZ2V0TmV4dFZhbGlkU3RlcEZvcm1JbmRleChjdXJyZW50U3RlcEluZGV4ICsgMSk7XG4gICAgICAgIG5leHRTdGVwLmlzSW5pdGlhbGl6ZWQgPSB0cnVlO1xuXG4gICAgICAgIC8vIElmIHRoZXJlIGFyZSBhbnkgc3RlcHMgd2hpY2ggaGFzIHNob3cgdGhlbiBvbmx5IGNoYW5nZSBzdGF0ZSBvZiBjdXJyZW50IHN0ZXAgZWxzZSByZW1haW4gc2FtZVxuICAgICAgICBpZiAobmV4dFN0ZXApIHtcbiAgICAgICAgICAgIGN1cnJlbnRTdGVwLmRvbmUgPSB0cnVlO1xuICAgICAgICAgICAgbmV4dFN0ZXAuYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFN0ZXAgPSBuZXh0U3RlcDtcbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBNZXRob2QgdG8gbmF2aWdhdGUgdG8gcHJldmlvdXMgc3RlcFxuICAgIHB1YmxpYyBwcmV2KCkge1xuICAgICAgICBjb25zdCBjdXJyZW50U3RlcCA9IHRoaXMuY3VycmVudFN0ZXA7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRTdGVwSW5kZXggPSB0aGlzLmdldEN1cnJlbnRTdGVwSW5kZXgoKTtcblxuICAgICAgICBsZXQgcHJldlN0ZXA6IFdpemFyZFN0ZXBEaXJlY3RpdmU7XG5cbiAgICAgICAgLy8gYWJvcnQgaWYgb25QcmV2IG1ldGhvZCByZXR1cm5zIGZhbHNlLlxuICAgICAgICBpZiAoY3VycmVudFN0ZXAub25QcmV2KGN1cnJlbnRTdGVwSW5kZXgpID09PSBmYWxzZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgcHJldlN0ZXAgPSB0aGlzLmdldFByZXZpb3VzVmFsaWRTdGVwRm9ybUluZGV4KGN1cnJlbnRTdGVwSW5kZXggLSAxKTtcblxuICAgICAgICAvLyBJZiB0aGVyZSBhcmUgYW55IHN0ZXBzIHdoaWNoIGhhcyBzaG93IHRoZW4gb25seSBjaGFuZ2Ugc3RhdGUgb2YgY3VycmVudCBzdGVwIGVsc2UgcmVtYWluIHNhbWVcbiAgICAgICAgaWYgKHByZXZTdGVwKSB7XG4gICAgICAgICAgICBjdXJyZW50U3RlcC5kaXNhYmxlZCA9IHRydWU7XG4gICAgICAgICAgICBwcmV2U3RlcC5hY3RpdmUgPSB0cnVlO1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50U3RlcCA9IHByZXZTdGVwO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIHNraXAoKSB7XG4gICAgICAgIHRoaXMubmV4dCgnc2tpcCcpO1xuICAgIH1cblxuICAgIC8vIE1ldGhvZCB0byBpbnZva2Ugb24tRG9uZSBldmVudCBvbiB3aXphcmRcbiAgICBwdWJsaWMgZG9uZSgpIHtcbiAgICAgICAgdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdkb25lJywge3N0ZXBzOiB0aGlzLnN0ZXBzLnRvQXJyYXkoKX0pO1xuICAgIH1cbiAgICAvLyBNZXRob2QgdG8gaW52b2tlIG9uLUNhbmNlbCBldmVudCBvbiB3aXphcmRcbiAgICBwdWJsaWMgY2FuY2VsICgpIHtcbiAgICAgICAgdGhpcy5pbnZva2VFdmVudENhbGxiYWNrKCdjYW5jZWwnLCB7c3RlcHM6IHRoaXMuc3RlcHMudG9BcnJheSgpfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpc0ZpcnN0U3RlcChzdGVwUmVmOiBXaXphcmRTdGVwRGlyZWN0aXZlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0ZXBzLmZpcnN0ID09PSBzdGVwUmVmO1xuICAgIH1cblxuICAgIHByaXZhdGUgaXNMYXN0U3RlcChzdGVwUmVmOiBXaXphcmRTdGVwRGlyZWN0aXZlKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0ZXBzLmxhc3QgPT09IHN0ZXBSZWY7XG4gICAgfVxuXG4gICAgLy8gRGVmaW5lIHRoZSBwcm9wZXJ0eSBjaGFuZ2UgaGFuZGxlci4gVGhpcyBNZXRob2Qgd2lsbCBiZSB0cmlnZ2VyZWQgd2hlbiB0aGVyZSBpcyBhIGNoYW5nZSBpbiB0aGUgd2lkZ2V0IHByb3BlcnR5XG4gICAgb25Qcm9wZXJ0eUNoYW5nZShrZXk6IHN0cmluZywgbnY6IGFueSwgb3Y/OiBhbnkpIHtcbiAgICAgICAgLy8gTW9uaXRvcmluZyBjaGFuZ2VzIGZvciBwcm9wZXJ0aWVzIGFuZCBhY2NvcmRpbmdseSBoYW5kbGluZyByZXNwZWN0aXZlIGNoYW5nZXNcblxuICAgICAgICBpZiAoa2V5ID09PSAnc3RlcHN0eWxlJykge1xuICAgICAgICAgICAgdGhpcy5zdGVwQ2xhc3MgPSAgbnYgPT09ICdqdXN0aWZpZWQnID8gJ25hdi1qdXN0aWZpZWQnIDogJyc7XG4gICAgICAgIH0gZWxzZSBpZiAoa2V5ID09PSAnZGVmYXVsdHN0ZXAnKSB7XG4gICAgICAgICAgICB0aGlzLnNldERlZmF1bHRTdGVwKHRoaXMuZ2V0U3RlcFJlZkJ5TmFtZShudikpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc3VwZXIub25Qcm9wZXJ0eUNoYW5nZShrZXksIG52LCBvdik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBuZ0FmdGVyQ29udGVudEluaXQoKSB7XG4gICAgICAgIHN1cGVyLm5nQWZ0ZXJDb250ZW50SW5pdCgpO1xuICAgICAgICB0aGlzLnByb21pc2VSZXNvbHZlckZuKCk7XG4gICAgfVxuXG4gICAgbmdBZnRlclZpZXdJbml0KCkge1xuICAgICAgICBzdXBlci5uZ0FmdGVyVmlld0luaXQoKTtcbiAgICAgICAgc3R5bGVyKFxuICAgICAgICAgICAgdGhpcy5uYXRpdmVFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5wYW5lbC1ib2R5JykgYXMgSFRNTEVsZW1lbnQsXG4gICAgICAgICAgICB0aGlzLFxuICAgICAgICAgICAgQVBQTFlfU1RZTEVTX1RZUEUuSU5ORVJfU0hFTExcbiAgICAgICAgKTtcbiAgICB9XG59XG4iXX0=