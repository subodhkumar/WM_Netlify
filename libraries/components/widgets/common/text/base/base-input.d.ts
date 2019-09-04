import { AfterViewInit, ElementRef, Injector } from '@angular/core';
import { NgModel } from '@angular/forms';
import { BaseFormCustomComponent } from '../../base/base-form-custom.component';
import { IWidgetConfig } from '../../../framework/types';
export declare abstract class BaseInput extends BaseFormCustomComponent implements AfterViewInit {
    class: string;
    ngModelOptions: {
        updateOn: string;
    };
    /**
     * Reference to the input element. All the styles and classes will be applied on this node.
     * Input components must override this
     */
    protected abstract inputEl: ElementRef;
    /**
     * Reference to the ngModel directive instance.
     * Used to check the validity of the input
     */
    protected abstract ngModel: NgModel;
    protected onPropertyChange(key: string, nv: any, ov: any): void;
    handleChange(newValue: any): void;
    protected handleEvent(node: HTMLElement, eventName: string, eventCallback: Function, locals: any): void;
    handleBlur($event: any): void;
    flushViewChanges(val: any): void;
    ngAfterViewInit(): void;
    constructor(inj: Injector, config: IWidgetConfig);
}
