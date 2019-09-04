import { AfterViewInit, ElementRef, Injector, OnInit } from '@angular/core';
import { NgModel } from '@angular/forms';
import { BaseFormCustomComponent } from '../base/base-form-custom.component';
export declare class CheckboxComponent extends BaseFormCustomComponent implements OnInit, AfterViewInit {
    static initializeProps: void;
    proxyModel: boolean;
    disabled: boolean;
    readonly: boolean;
    required: boolean;
    name: string;
    shortcutkey: string;
    tabindex: any;
    _caption: string;
    private _checkedvalue;
    private _uncheckedvalue;
    ngModel: NgModel;
    checkboxEl: ElementRef;
    datavalue: any;
    constructor(inj: Injector, checkedVal: any, uncheckedVal: any, type: any);
    onPropertyChange(key: any, nv: any, ov: any): void;
    protected handleEvent(node: HTMLElement, eventName: string, callback: Function, locals: any): void;
    handleChange(newVal: boolean): void;
    ngAfterViewInit(): void;
}
