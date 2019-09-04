import { OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
export declare class FormWidgetDirective implements OnInit {
    componentInstance: any;
    name: any;
    key: any;
    ngform: FormGroup;
    fb: any;
    parent: any;
    constructor(form: any, table: any, componentInstance: any, fb: FormBuilder, name: any, key: any);
    readonly _control: import("@angular/forms").AbstractControl;
    addControl(fieldName: any): void;
    createControl(): any;
    ngOnInit(): void;
}
