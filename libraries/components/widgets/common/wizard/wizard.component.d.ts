import { AfterContentInit, AfterViewInit, Injector, OnInit, QueryList } from '@angular/core';
import { StylableComponent } from '../base/stylable.component';
import { WizardStepDirective } from './wizard-step/wizard-step.directive';
export declare class WizardComponent extends StylableComponent implements OnInit, AfterContentInit, AfterViewInit {
    static initializeProps: void;
    steps: QueryList<WizardStepDirective>;
    message: {
        caption: string;
        type: string;
    };
    currentStep: WizardStepDirective;
    stepClass: string;
    private readonly promiseResolverFn;
    actionsalignment: any;
    cancelable: any;
    readonly hasPrevStep: boolean;
    readonly hasNextStep: boolean;
    readonly showDoneBtn: boolean;
    readonly enablePrev: boolean;
    readonly enableNext: boolean;
    readonly enableDone: boolean;
    constructor(inj: Injector);
    /**
     * returns next valid step. the index passed is also checked if its valid step
     * @param index
     * @returns {WizardStepDirective}
     */
    private getNextValidStepFormIndex;
    /**
     * returns previous valid step. the index passed is also checked if its valid step
     * @param index
     * @returns {WizardStepDirective}
     */
    private getPreviousValidStepFormIndex;
    /**
     * returns current step index value.
     * @returns {number}
     */
    private getCurrentStepIndex;
    /**
     * returns stepRef when index is passed.
     * @param {number} index
     * @returns {WizardStepDirective}
     */
    private getStepRefByIndex;
    /**
     * returns the index value of the step.
     * @param {WizardStepDirective} wizardStep
     * @returns {number}
     */
    private getStepIndexByRef;
    /**
     * gets stepRef by searching on the name property.
     * @param {string} name
     * @returns {WizardStepDirective}
     */
    private getStepRefByName;
    /**
     * sets default step as current step if configured
     * or finds first valid step and set it as current step.
     * @param {WizardStepDirective} step
     */
    private setDefaultStep;
    /**
     * Selects the associated step when the wizard header is clicked.
     * @param $event
     * @param {WizardStepDirective} currentStep
     */
    private onWizardHeaderClick;
    next(eventName?: string): void;
    prev(): void;
    skip(): void;
    done(): void;
    cancel(): void;
    private isFirstStep;
    private isLastStep;
    onPropertyChange(key: string, nv: any, ov?: any): void;
    ngAfterContentInit(): void;
    ngAfterViewInit(): void;
}
