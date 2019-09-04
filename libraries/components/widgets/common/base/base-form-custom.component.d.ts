import { ControlValueAccessor } from '@angular/forms';
import { OnInit } from '@angular/core';
import { BaseFormComponent } from './base-form.component';
export declare abstract class BaseFormCustomComponent extends BaseFormComponent implements ControlValueAccessor, OnInit {
    private _formControl;
    protected _onChange: any;
    private _onTouched;
    ngOnInit(): void;
    registerOnChange(fn: any): void;
    registerOnTouched(fn: any): void;
    writeValue(value: any): void;
    invokeOnChange(value: any, $event?: Event | any, valid?: boolean): void;
    invokeOnTouched($event?: Event): void;
    protected invokeOnFocus($event: Event): void;
}
