import { Injector } from '@angular/core';
import { NgForm } from '@angular/forms';
import { BaseComponent } from '../../base/base.component';
export declare class WizardStepDirective extends BaseComponent {
    private ngForm;
    static initializeProps: void;
    show: boolean;
    name: string;
    enableskip: any;
    disablenext: boolean;
    disabledone: boolean;
    disableprevious: boolean;
    isInitialized: boolean;
    private status;
    reDrawableComponents: any;
    readonly isCurrent: boolean;
    readonly isValid: boolean;
    readonly enableNext: boolean;
    readonly enableDone: boolean;
    readonly enablePrev: boolean;
    active: boolean;
    done: boolean;
    disabled: boolean;
    constructor(inj: Injector, ngForm: NgForm);
    onNext(index: number): boolean;
    onPrev(index: number): boolean;
    onSkip(index: number): boolean;
    private redrawChildren;
}
