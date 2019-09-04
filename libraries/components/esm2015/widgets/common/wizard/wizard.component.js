import { Component, ContentChildren, Injector, QueryList } from '@angular/core';
import { noop } from '@wm/core';
import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { registerProps } from './wizard.props';
import { StylableComponent } from '../base/stylable.component';
import { WizardStepDirective } from './wizard-step/wizard-step.directive';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
const DEFAULT_CLS = 'app-wizard panel clearfix';
const WIDGET_CONFIG = {
    widgetType: 'wm-wizard',
    hostClass: DEFAULT_CLS
};
export class WizardComponent extends StylableComponent {
    constructor(inj) {
        let resolveFn = noop;
        super(inj, WIDGET_CONFIG, new Promise(res => resolveFn = res));
        styler(this.nativeElement, this, APPLY_STYLES_TYPE.SHELL);
        this.promiseResolverFn = resolveFn;
        // initialize the message object with default values
        this.message = {
            caption: '',
            type: ''
        };
    }
    get hasPrevStep() {
        return !this.isFirstStep(this.currentStep);
    }
    get hasNextStep() {
        return !this.isLastStep(this.currentStep);
    }
    get showDoneBtn() {
        if (!this.currentStep) {
            return;
        }
        return !this.hasNextStep && this.currentStep.enableDone;
    }
    get enablePrev() {
        if (!this.currentStep) {
            return;
        }
        return this.currentStep.enablePrev;
    }
    get enableNext() {
        if (!this.currentStep) {
            return;
        }
        return this.currentStep.enableNext && this.currentStep.isValid;
    }
    get enableDone() {
        if (!this.currentStep) {
            return;
        }
        return this.currentStep.enableDone && this.currentStep.isValid;
    }
    /**
     * returns next valid step. the index passed is also checked if its valid step
     * @param index
     * @returns {WizardStepDirective}
     */
    getNextValidStepFormIndex(index) {
        for (let i = index; i < this.steps.length; i++) {
            const step = this.getStepRefByIndex(i);
            if (step.show) {
                return step;
            }
        }
    }
    /**
     * returns previous valid step. the index passed is also checked if its valid step
     * @param index
     * @returns {WizardStepDirective}
     */
    getPreviousValidStepFormIndex(index) {
        for (let i = index; i >= 0; i--) {
            const step = this.getStepRefByIndex(i);
            if (step.show) {
                return step;
            }
        }
    }
    /**
     * returns current step index value.
     * @returns {number}
     */
    getCurrentStepIndex() {
        return this.getStepIndexByRef(this.currentStep);
    }
    /**
     * returns stepRef when index is passed.
     * @param {number} index
     * @returns {WizardStepDirective}
     */
    getStepRefByIndex(index) {
        return this.steps.toArray()[index];
    }
    /**
     * returns the index value of the step.
     * @param {WizardStepDirective} wizardStep
     * @returns {number}
     */
    getStepIndexByRef(wizardStep) {
        return this.steps.toArray().indexOf(wizardStep);
    }
    /**
     * gets stepRef by searching on the name property.
     * @param {string} name
     * @returns {WizardStepDirective}
     */
    getStepRefByName(name) {
        return this.steps.find(step => step.name === name);
    }
    /**
     * sets default step as current step if configured
     * or finds first valid step and set it as current step.
     * @param {WizardStepDirective} step
     */
    setDefaultStep(step) {
        // If the default step has show true then only update the currentStep
        if (step && step.show) {
            this.currentStep = step;
            step.active = true;
            step.isInitialized = true;
            // Mark all previous step status COMPLETED
            let index = this.getStepIndexByRef(step) - 1;
            while (index >= 0) {
                const prevStep = this.getStepRefByIndex(index);
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
    }
    /**
     * Selects the associated step when the wizard header is clicked.
     * @param $event
     * @param {WizardStepDirective} currentStep
     */
    onWizardHeaderClick($event, currentStep) {
        // select the step if it's status is done
        if (currentStep.done) {
            // set all the next steps status as disabled and previous steps as done
            this.steps.forEach((step, index) => {
                if (index < this.getStepIndexByRef(currentStep)) {
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
    }
    // Method to navigate to next step
    next(eventName = 'next') {
        const currentStep = this.currentStep;
        const currentStepIndex = this.getCurrentStepIndex();
        let nextStep;
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
    }
    // Method to navigate to previous step
    prev() {
        const currentStep = this.currentStep;
        const currentStepIndex = this.getCurrentStepIndex();
        let prevStep;
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
    }
    skip() {
        this.next('skip');
    }
    // Method to invoke on-Done event on wizard
    done() {
        this.invokeEventCallback('done', { steps: this.steps.toArray() });
    }
    // Method to invoke on-Cancel event on wizard
    cancel() {
        this.invokeEventCallback('cancel', { steps: this.steps.toArray() });
    }
    isFirstStep(stepRef) {
        return this.steps.first === stepRef;
    }
    isLastStep(stepRef) {
        return this.steps.last === stepRef;
    }
    // Define the property change handler. This Method will be triggered when there is a change in the widget property
    onPropertyChange(key, nv, ov) {
        // Monitoring changes for properties and accordingly handling respective changes
        if (key === 'stepstyle') {
            this.stepClass = nv === 'justified' ? 'nav-justified' : '';
        }
        else if (key === 'defaultstep') {
            this.setDefaultStep(this.getStepRefByName(nv));
        }
        else {
            super.onPropertyChange(key, nv, ov);
        }
    }
    ngAfterContentInit() {
        super.ngAfterContentInit();
        this.promiseResolverFn();
    }
    ngAfterViewInit() {
        super.ngAfterViewInit();
        styler(this.nativeElement.querySelector('.panel-body'), this, APPLY_STYLES_TYPE.INNER_SHELL);
    }
}
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
WizardComponent.ctorParameters = () => [
    { type: Injector }
];
WizardComponent.propDecorators = {
    steps: [{ type: ContentChildren, args: [WizardStepDirective,] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2l6YXJkLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vd2l6YXJkL3dpemFyZC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFtQyxTQUFTLEVBQUUsZUFBZSxFQUFFLFFBQVEsRUFBVSxTQUFTLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFekgsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUVoQyxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxFQUFFLE1BQU0sd0JBQXdCLENBQUM7QUFFbkUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQy9DLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQy9ELE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLHFDQUFxQyxDQUFDO0FBQzFFLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLDZCQUE2QixDQUFDO0FBRWpFLE1BQU0sV0FBVyxHQUFHLDJCQUEyQixDQUFDO0FBQ2hELE1BQU0sYUFBYSxHQUFrQjtJQUNqQyxVQUFVLEVBQUUsV0FBVztJQUN2QixTQUFTLEVBQUUsV0FBVztDQUN6QixDQUFDO0FBU0YsTUFBTSxPQUFPLGVBQWdCLFNBQVEsaUJBQWlCO0lBaURsRCxZQUFZLEdBQWE7UUFDckIsSUFBSSxTQUFTLEdBQWEsSUFBSSxDQUFDO1FBRS9CLEtBQUssQ0FBQyxHQUFHLEVBQUUsYUFBYSxFQUFFLElBQUksT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsU0FBUyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFDL0QsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsSUFBSSxFQUFFLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBRTFELElBQUksQ0FBQyxpQkFBaUIsR0FBRyxTQUFTLENB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UUFFaEYsSUFBSSxHQUFHLEtBQUssV0FBVyxFQUFFO1lBQ3JCLElBQUksQ0FBQyxTQUFTLEdBQUksRUFBRSxLQUFLLFdBQVcsQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7U0FDL0Q7YUFBTSxJQUFJLEdBQUcsS0FBSyxhQUFhLEVBQUU7WUFDOUIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztTQUNsRDthQUFNO1lBQ0gsS0FBSyxDQUFDLGdCQUFnQixDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUM7U0FDdkM7SUFDTCxDQUFDO0lBRUQsa0JBQWtCO1FBQ2QsS0FBSyxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDM0IsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7SUFDN0IsQ0FBQztJQUVELGVBQWU7UUFDWCxLQUFLLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDeEIsTUFBTSxDQUNGLElBQUksQ0FBQyxhQUFhLENBQUMsYUFBYSxDQUFDLGFBQWEsQ0FBZ0IsRUFDOUQsSUFBSSxFQUNKLGlCQUFpQixDQUFDLFdBQVcsQ0FDaEMsQ0FBQztJQUNOLENBQUM7O0FBL1FNLCtCQUFlLEdBQUcsYUFBYSxFQUFFLENBQUM7O1lBUjVDLFNBQVMsU0FBQztnQkFDUCxRQUFRLEVBQUUsZUFBZTtnQkFDekIsOCtFQUFzQztnQkFDdEMsU0FBUyxFQUFFO29CQUNQLGtCQUFrQixDQUFDLGVBQWUsQ0FBQztpQkFDdEM7YUFDSjs7OztZQXZCcUUsUUFBUTs7O29CQTJCekUsZUFBZSxTQUFDLG1CQUFtQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFmdGVyQ29udGVudEluaXQsIEFmdGVyVmlld0luaXQsIENvbXBvbmVudCwgQ29udGVudENoaWxkcmVuLCBJbmplY3RvciwgT25Jbml0LCBRdWVyeUxpc3QgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgbm9vcCB9IGZyb20gJ0B3bS9jb3JlJztcblxuaW1wb3J0IHsgQVBQTFlfU1RZTEVTX1RZUEUsIHN0eWxlciB9IGZyb20gJy4uLy4uL2ZyYW1ld29yay9zdHlsZXInO1xuaW1wb3J0IHsgSVdpZGdldENvbmZpZyB9IGZyb20gJy4uLy4uL2ZyYW1ld29yay90eXBlcyc7XG5pbXBvcnQgeyByZWdpc3RlclByb3BzIH0gZnJvbSAnLi93aXphcmQucHJvcHMnO1xuaW1wb3J0IHsgU3R5bGFibGVDb21wb25lbnQgfSBmcm9tICcuLi9iYXNlL3N0eWxhYmxlLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBXaXphcmRTdGVwRGlyZWN0aXZlIH0gZnJvbSAnLi93aXphcmQtc3RlcC93aXphcmQtc3RlcC5kaXJlY3RpdmUnO1xuaW1wb3J0IHsgcHJvdmlkZUFzV2lkZ2V0UmVmIH0gZnJvbSAnLi4vLi4vLi4vdXRpbHMvd2lkZ2V0LXV0aWxzJztcblxuY29uc3QgREVGQVVMVF9DTFMgPSAnYXBwLXdpemFyZCBwYW5lbCBjbGVhcmZpeCc7XG5jb25zdCBXSURHRVRfQ09ORklHOiBJV2lkZ2V0Q29uZmlnID0ge1xuICAgIHdpZGdldFR5cGU6ICd3bS13aXphcmQnLFxuICAgIGhvc3RDbGFzczogREVGQVVMVF9DTFNcbn07XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnZGl2W3dtV2l6YXJkXScsXG4gICAgdGVtcGxhdGVVcmw6ICcuL3dpemFyZC5jb21wb25lbnQuaHRtbCcsXG4gICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIHByb3ZpZGVBc1dpZGdldFJlZihXaXphcmRDb21wb25lbnQpXG4gICAgXVxufSlcbmV4cG9ydCBjbGFzcyBXaXphcmRDb21wb25lbnQgZXh0ZW5kcyBTdHlsYWJsZUNvbXBvbmVudCBpbXBsZW1lbnRzIE9uSW5pdCwgQWZ0ZXJDb250ZW50SW5pdCwgQWZ0ZXJWaWV3SW5pdCB7XG4gICAgc3RhdGljIGluaXRpYWxpemVQcm9wcyA9IHJlZ2lzdGVyUHJvcHMoKTtcblxuICAgIEBDb250ZW50Q2hpbGRyZW4oV2l6YXJkU3RlcERpcmVjdGl2ZSkgc3RlcHM6IFF1ZXJ5TGlzdDxXaXphcmRTdGVwRGlyZWN0aXZlPjtcblxuICAgIHB1YmxpYyBtZXNzYWdlOiB7Y2FwdGlvbjogc3RyaW5nLCB0eXBlOiBzdHJpbmd9O1xuICAgIHB1YmxpYyBjdXJyZW50U3RlcDogV2l6YXJkU3RlcERpcmVjdGl2ZTtcblxuICAgIHB1YmxpYyBzdGVwQ2xhc3M6IHN0cmluZztcbiAgICBwcml2YXRlIHJlYWRvbmx5IHByb21pc2VSZXNvbHZlckZuOiBGdW5jdGlvbjtcbiAgICBwdWJsaWMgYWN0aW9uc2FsaWdubWVudDogYW55O1xuICAgIHB1YmxpYyBjYW5jZWxhYmxlOiBhbnk7XG5cbiAgICBnZXQgaGFzUHJldlN0ZXAoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiAhdGhpcy5pc0ZpcnN0U3RlcCh0aGlzLmN1cnJlbnRTdGVwKTtcbiAgICB9XG5cbiAgICBnZXQgaGFzTmV4dFN0ZXAoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiAhdGhpcy5pc0xhc3RTdGVwKHRoaXMuY3VycmVudFN0ZXApO1xuICAgIH1cblxuICAgIGdldCBzaG93RG9uZUJ0bigpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKCF0aGlzLmN1cnJlbnRTdGVwKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICF0aGlzLmhhc05leHRTdGVwICYmIHRoaXMuY3VycmVudFN0ZXAuZW5hYmxlRG9uZTtcbiAgICB9XG5cbiAgICBnZXQgZW5hYmxlUHJldigpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKCF0aGlzLmN1cnJlbnRTdGVwKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuY3VycmVudFN0ZXAuZW5hYmxlUHJldjtcbiAgICB9XG5cbiAgICBnZXQgZW5hYmxlTmV4dCgpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKCF0aGlzLmN1cnJlbnRTdGVwKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuY3VycmVudFN0ZXAuZW5hYmxlTmV4dCAmJiB0aGlzLmN1cnJlbnRTdGVwLmlzVmFsaWQ7XG4gICAgfVxuXG4gICAgZ2V0IGVuYWJsZURvbmUoKTogYm9vbGVhbiB7XG4gICAgICAgIGlmICghdGhpcy5jdXJyZW50U3RlcCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnRTdGVwLmVuYWJsZURvbmUgJiYgdGhpcy5jdXJyZW50U3RlcC5pc1ZhbGlkO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKGluajogSW5qZWN0b3IpIHtcbiAgICAgICAgbGV0IHJlc29sdmVGbjogRnVuY3Rpb24gPSBub29wO1xuXG4gICAgICAgIHN1cGVyKGluaiwgV0lER0VUX0NPTkZJRywgbmV3IFByb21pc2UocmVzID0+IHJlc29sdmVGbiA9IHJlcykpO1xuICAgICAgICBzdHlsZXIodGhpcy5uYXRpdmVFbGVtZW50LCB0aGlzLCBBUFBMWV9TVFlMRVNfVFlQRS5TSEVMTCk7XG5cbiAgICAgICAgdGhpcy5wcm9taXNlUmVzb2x2ZXJGbiA9IHJlc29sdmVGbjtcblxuICAgICAgICAvLyBpbml0aWFsaXplIHRoZSBtZXNzYWdlIG9iamVjdCB3aXRoIGRlZmF1bHQgdmFsdWVzXG4gICAgICAgIHRoaXMubWVzc2FnZSA9IHtcbiAgICAgICAgICAgIGNhcHRpb246ICcnLFxuICAgICAgICAgICAgdHlwZTogJydcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiByZXR1cm5zIG5leHQgdmFsaWQgc3RlcC4gdGhlIGluZGV4IHBhc3NlZCBpcyBhbHNvIGNoZWNrZWQgaWYgaXRzIHZhbGlkIHN0ZXBcbiAgICAgKiBAcGFyYW0gaW5kZXhcbiAgICAgKiBAcmV0dXJucyB7V2l6YXJkU3RlcERpcmVjdGl2ZX1cbiAgICAgKi9cbiAgICBwcml2YXRlIGdldE5leHRWYWxpZFN0ZXBGb3JtSW5kZXgoaW5kZXg6IG51bWJlcik6IFdpemFyZFN0ZXBEaXJlY3RpdmUge1xuICAgICAgICBmb3IgKGxldCBpID0gaW5kZXg7IGkgPCB0aGlzLnN0ZXBzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBzdGVwID0gdGhpcy5nZXRTdGVwUmVmQnlJbmRleChpKTtcbiAgICAgICAgICAgIGlmIChzdGVwLnNob3cpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc3RlcDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIHJldHVybnMgcHJldmlvdXMgdmFsaWQgc3RlcC4gdGhlIGluZGV4IHBhc3NlZCBpcyBhbHNvIGNoZWNrZWQgaWYgaXRzIHZhbGlkIHN0ZXBcbiAgICAgKiBAcGFyYW0gaW5kZXhcbiAgICAgKiBAcmV0dXJucyB7V2l6YXJkU3RlcERpcmVjdGl2ZX1cbiAgICAgKi9cbiAgICBwcml2YXRlIGdldFByZXZpb3VzVmFsaWRTdGVwRm9ybUluZGV4KGluZGV4OiBudW1iZXIpOiBXaXphcmRTdGVwRGlyZWN0aXZlIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IGluZGV4OyBpID49IDA7IGktLSkge1xuICAgICAgICAgICAgY29uc3Qgc3RlcCA9IHRoaXMuZ2V0U3RlcFJlZkJ5SW5kZXgoaSk7XG4gICAgICAgICAgICBpZiAoc3RlcC5zaG93KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0ZXA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiByZXR1cm5zIGN1cnJlbnQgc3RlcCBpbmRleCB2YWx1ZS5cbiAgICAgKiBAcmV0dXJucyB7bnVtYmVyfVxuICAgICAqL1xuICAgIHByaXZhdGUgZ2V0Q3VycmVudFN0ZXBJbmRleCgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRTdGVwSW5kZXhCeVJlZih0aGlzLmN1cnJlbnRTdGVwKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiByZXR1cm5zIHN0ZXBSZWYgd2hlbiBpbmRleCBpcyBwYXNzZWQuXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IGluZGV4XG4gICAgICogQHJldHVybnMge1dpemFyZFN0ZXBEaXJlY3RpdmV9XG4gICAgICovXG4gICAgcHJpdmF0ZSBnZXRTdGVwUmVmQnlJbmRleChpbmRleDogbnVtYmVyKTogV2l6YXJkU3RlcERpcmVjdGl2ZSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0ZXBzLnRvQXJyYXkoKVtpbmRleF07XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogcmV0dXJucyB0aGUgaW5kZXggdmFsdWUgb2YgdGhlIHN0ZXAuXG4gICAgICogQHBhcmFtIHtXaXphcmRTdGVwRGlyZWN0aXZlfSB3aXphcmRTdGVwXG4gICAgICogQHJldHVybnMge251bWJlcn1cbiAgICAgKi9cbiAgICBwcml2YXRlIGdldFN0ZXBJbmRleEJ5UmVmKHdpemFyZFN0ZXA6IFdpemFyZFN0ZXBEaXJlY3RpdmUpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5zdGVwcy50b0FycmF5KCkuaW5kZXhPZih3aXphcmRTdGVwKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBnZXRzIHN0ZXBSZWYgYnkgc2VhcmNoaW5nIG9uIHRoZSBuYW1lIHByb3BlcnR5LlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBuYW1lXG4gICAgICogQHJldHVybnMge1dpemFyZFN0ZXBEaXJlY3RpdmV9XG4gICAgICovXG4gICAgcHJpdmF0ZSBnZXRTdGVwUmVmQnlOYW1lKG5hbWU6IHN0cmluZyk6IFdpemFyZFN0ZXBEaXJlY3RpdmUge1xuICAgICAgICByZXR1cm4gdGhpcy5zdGVwcy5maW5kKHN0ZXAgPT4gc3RlcC5uYW1lID09PSBuYW1lKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBzZXRzIGRlZmF1bHQgc3RlcCBhcyBjdXJyZW50IHN0ZXAgaWYgY29uZmlndXJlZFxuICAgICAqIG9yIGZpbmRzIGZpcnN0IHZhbGlkIHN0ZXAgYW5kIHNldCBpdCBhcyBjdXJyZW50IHN0ZXAuXG4gICAgICogQHBhcmFtIHtXaXphcmRTdGVwRGlyZWN0aXZlfSBzdGVwXG4gICAgICovXG4gICAgcHJpdmF0ZSBzZXREZWZhdWx0U3RlcChzdGVwOiBXaXphcmRTdGVwRGlyZWN0aXZlKSB7XG4gICAgICAgIC8vIElmIHRoZSBkZWZhdWx0IHN0ZXAgaGFzIHNob3cgdHJ1ZSB0aGVuIG9ubHkgdXBkYXRlIHRoZSBjdXJyZW50U3RlcFxuICAgICAgICBpZiAoc3RlcCAmJiBzdGVwLnNob3cpIHtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFN0ZXAgPSBzdGVwO1xuICAgICAgICAgICAgc3RlcC5hY3RpdmUgPSB0cnVlO1xuICAgICAgICAgICAgc3RlcC5pc0luaXRpYWxpemVkID0gdHJ1ZTtcbiAgICAgICAgICAgIC8vIE1hcmsgYWxsIHByZXZpb3VzIHN0ZXAgc3RhdHVzIENPTVBMRVRFRFxuICAgICAgICAgICAgbGV0IGluZGV4ID0gdGhpcy5nZXRTdGVwSW5kZXhCeVJlZihzdGVwKSAtIDE7XG4gICAgICAgICAgICB3aGlsZSAoaW5kZXggPj0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHByZXZTdGVwID0gdGhpcy5nZXRTdGVwUmVmQnlJbmRleChpbmRleCk7XG4gICAgICAgICAgICAgICAgcHJldlN0ZXAuZG9uZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgcHJldlN0ZXAuaXNJbml0aWFsaXplZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgaW5kZXgtLTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIHNldCBuZXh0IHZhbGlkIHN0ZXAgYXMgY3VycmVudCBzdGVwXG4gICAgICAgICAgICBzdGVwID0gdGhpcy5nZXROZXh0VmFsaWRTdGVwRm9ybUluZGV4KDApO1xuICAgICAgICAgICAgaWYgKHN0ZXApIHtcbiAgICAgICAgICAgICAgICB0aGlzLnNldERlZmF1bHRTdGVwKHN0ZXApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogU2VsZWN0cyB0aGUgYXNzb2NpYXRlZCBzdGVwIHdoZW4gdGhlIHdpemFyZCBoZWFkZXIgaXMgY2xpY2tlZC5cbiAgICAgKiBAcGFyYW0gJGV2ZW50XG4gICAgICogQHBhcmFtIHtXaXphcmRTdGVwRGlyZWN0aXZlfSBjdXJyZW50U3RlcFxuICAgICAqL1xuICAgIHByaXZhdGUgb25XaXphcmRIZWFkZXJDbGljaygkZXZlbnQ6IEV2ZW50LCBjdXJyZW50U3RlcDogV2l6YXJkU3RlcERpcmVjdGl2ZSkge1xuICAgICAgICAvLyBzZWxlY3QgdGhlIHN0ZXAgaWYgaXQncyBzdGF0dXMgaXMgZG9uZVxuICAgICAgICBpZiAoY3VycmVudFN0ZXAuZG9uZSkge1xuICAgICAgICAgICAgLy8gc2V0IGFsbCB0aGUgbmV4dCBzdGVwcyBzdGF0dXMgYXMgZGlzYWJsZWQgYW5kIHByZXZpb3VzIHN0ZXBzIGFzIGRvbmVcbiAgICAgICAgICAgIHRoaXMuc3RlcHMuZm9yRWFjaCgoc3RlcCwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoaW5kZXggPCB0aGlzLmdldFN0ZXBJbmRleEJ5UmVmKGN1cnJlbnRTdGVwKSkge1xuICAgICAgICAgICAgICAgICAgIHN0ZXAuZG9uZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc3RlcC5kaXNhYmxlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvLyBzZXQgdGhlIHNlbGVjdGVkIHN0ZXAgYXMgY3VycmVudCBzdGVwIGFuZCBtYWtlIGl0IGFjdGl2ZVxuICAgICAgICAgICAgdGhpcy5jdXJyZW50U3RlcCA9IGN1cnJlbnRTdGVwO1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50U3RlcC5hY3RpdmUgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gTWV0aG9kIHRvIG5hdmlnYXRlIHRvIG5leHQgc3RlcFxuICAgIHB1YmxpYyBuZXh0KGV2ZW50TmFtZTogc3RyaW5nID0gJ25leHQnKSB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRTdGVwID0gdGhpcy5jdXJyZW50U3RlcDtcbiAgICAgICAgY29uc3QgY3VycmVudFN0ZXBJbmRleCA9IHRoaXMuZ2V0Q3VycmVudFN0ZXBJbmRleCgpO1xuXG4gICAgICAgIGxldCBuZXh0U3RlcDogV2l6YXJkU3RlcERpcmVjdGl2ZTtcblxuICAgICAgICAvLyBhYm9ydCBpZiBvblNraXAgbWV0aG9kIHJldHVybnMgZmFsc2VcbiAgICAgICAgaWYgKGV2ZW50TmFtZSA9PT0gJ3NraXAnKSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudFN0ZXAub25Ta2lwKGN1cnJlbnRTdGVwSW5kZXgpID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChldmVudE5hbWUgPT09ICduZXh0Jykge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRTdGVwLm9uTmV4dChjdXJyZW50U3RlcEluZGV4KSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgbmV4dFN0ZXAgPSB0aGlzLmdldE5leHRWYWxpZFN0ZXBGb3JtSW5kZXgoY3VycmVudFN0ZXBJbmRleCArIDEpO1xuICAgICAgICBuZXh0U3RlcC5pc0luaXRpYWxpemVkID0gdHJ1ZTtcblxuICAgICAgICAvLyBJZiB0aGVyZSBhcmUgYW55IHN0ZXBzIHdoaWNoIGhhcyBzaG93IHRoZW4gb25seSBjaGFuZ2Ugc3RhdGUgb2YgY3VycmVudCBzdGVwIGVsc2UgcmVtYWluIHNhbWVcbiAgICAgICAgaWYgKG5leHRTdGVwKSB7XG4gICAgICAgICAgICBjdXJyZW50U3RlcC5kb25lID0gdHJ1ZTtcbiAgICAgICAgICAgIG5leHRTdGVwLmFjdGl2ZSA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTdGVwID0gbmV4dFN0ZXA7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy8gTWV0aG9kIHRvIG5hdmlnYXRlIHRvIHByZXZpb3VzIHN0ZXBcbiAgICBwdWJsaWMgcHJldigpIHtcbiAgICAgICAgY29uc3QgY3VycmVudFN0ZXAgPSB0aGlzLmN1cnJlbnRTdGVwO1xuICAgICAgICBjb25zdCBjdXJyZW50U3RlcEluZGV4ID0gdGhpcy5nZXRDdXJyZW50U3RlcEluZGV4KCk7XG5cbiAgICAgICAgbGV0IHByZXZTdGVwOiBXaXphcmRTdGVwRGlyZWN0aXZlO1xuXG4gICAgICAgIC8vIGFib3J0IGlmIG9uUHJldiBtZXRob2QgcmV0dXJucyBmYWxzZS5cbiAgICAgICAgaWYgKGN1cnJlbnRTdGVwLm9uUHJldihjdXJyZW50U3RlcEluZGV4KSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHByZXZTdGVwID0gdGhpcy5nZXRQcmV2aW91c1ZhbGlkU3RlcEZvcm1JbmRleChjdXJyZW50U3RlcEluZGV4IC0gMSk7XG5cbiAgICAgICAgLy8gSWYgdGhlcmUgYXJlIGFueSBzdGVwcyB3aGljaCBoYXMgc2hvdyB0aGVuIG9ubHkgY2hhbmdlIHN0YXRlIG9mIGN1cnJlbnQgc3RlcCBlbHNlIHJlbWFpbiBzYW1lXG4gICAgICAgIGlmIChwcmV2U3RlcCkge1xuICAgICAgICAgICAgY3VycmVudFN0ZXAuZGlzYWJsZWQgPSB0cnVlO1xuICAgICAgICAgICAgcHJldlN0ZXAuYWN0aXZlID0gdHJ1ZTtcbiAgICAgICAgICAgIHRoaXMuY3VycmVudFN0ZXAgPSBwcmV2U3RlcDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBza2lwKCkge1xuICAgICAgICB0aGlzLm5leHQoJ3NraXAnKTtcbiAgICB9XG5cbiAgICAvLyBNZXRob2QgdG8gaW52b2tlIG9uLURvbmUgZXZlbnQgb24gd2l6YXJkXG4gICAgcHVibGljIGRvbmUoKSB7XG4gICAgICAgIHRoaXMuaW52b2tlRXZlbnRDYWxsYmFjaygnZG9uZScsIHtzdGVwczogdGhpcy5zdGVwcy50b0FycmF5KCl9KTtcbiAgICB9XG4gICAgLy8gTWV0aG9kIHRvIGludm9rZSBvbi1DYW5jZWwgZXZlbnQgb24gd2l6YXJkXG4gICAgcHVibGljIGNhbmNlbCAoKSB7XG4gICAgICAgIHRoaXMuaW52b2tlRXZlbnRDYWxsYmFjaygnY2FuY2VsJywge3N0ZXBzOiB0aGlzLnN0ZXBzLnRvQXJyYXkoKX0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgaXNGaXJzdFN0ZXAoc3RlcFJlZjogV2l6YXJkU3RlcERpcmVjdGl2ZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5zdGVwcy5maXJzdCA9PT0gc3RlcFJlZjtcbiAgICB9XG5cbiAgICBwcml2YXRlIGlzTGFzdFN0ZXAoc3RlcFJlZjogV2l6YXJkU3RlcERpcmVjdGl2ZSkge1xuICAgICAgICByZXR1cm4gdGhpcy5zdGVwcy5sYXN0ID09PSBzdGVwUmVmO1xuICAgIH1cblxuICAgIC8vIERlZmluZSB0aGUgcHJvcGVydHkgY2hhbmdlIGhhbmRsZXIuIFRoaXMgTWV0aG9kIHdpbGwgYmUgdHJpZ2dlcmVkIHdoZW4gdGhlcmUgaXMgYSBjaGFuZ2UgaW4gdGhlIHdpZGdldCBwcm9wZXJ0eVxuICAgIG9uUHJvcGVydHlDaGFuZ2Uoa2V5OiBzdHJpbmcsIG52OiBhbnksIG92PzogYW55KSB7XG4gICAgICAgIC8vIE1vbml0b3JpbmcgY2hhbmdlcyBmb3IgcHJvcGVydGllcyBhbmQgYWNjb3JkaW5nbHkgaGFuZGxpbmcgcmVzcGVjdGl2ZSBjaGFuZ2VzXG5cbiAgICAgICAgaWYgKGtleSA9PT0gJ3N0ZXBzdHlsZScpIHtcbiAgICAgICAgICAgIHRoaXMuc3RlcENsYXNzID0gIG52ID09PSAnanVzdGlmaWVkJyA/ICduYXYtanVzdGlmaWVkJyA6ICcnO1xuICAgICAgICB9IGVsc2UgaWYgKGtleSA9PT0gJ2RlZmF1bHRzdGVwJykge1xuICAgICAgICAgICAgdGhpcy5zZXREZWZhdWx0U3RlcCh0aGlzLmdldFN0ZXBSZWZCeU5hbWUobnYpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHN1cGVyLm9uUHJvcGVydHlDaGFuZ2Uoa2V5LCBudiwgb3YpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgbmdBZnRlckNvbnRlbnRJbml0KCkge1xuICAgICAgICBzdXBlci5uZ0FmdGVyQ29udGVudEluaXQoKTtcbiAgICAgICAgdGhpcy5wcm9taXNlUmVzb2x2ZXJGbigpO1xuICAgIH1cblxuICAgIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcbiAgICAgICAgc3VwZXIubmdBZnRlclZpZXdJbml0KCk7XG4gICAgICAgIHN0eWxlcihcbiAgICAgICAgICAgIHRoaXMubmF0aXZlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcucGFuZWwtYm9keScpIGFzIEhUTUxFbGVtZW50LFxuICAgICAgICAgICAgdGhpcyxcbiAgICAgICAgICAgIEFQUExZX1NUWUxFU19UWVBFLklOTkVSX1NIRUxMXG4gICAgICAgICk7XG4gICAgfVxufVxuIl19