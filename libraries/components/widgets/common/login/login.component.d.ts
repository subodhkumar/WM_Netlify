import { AfterViewInit, Injector, QueryList } from '@angular/core';
import { StylableComponent } from '../base/stylable.component';
import { ButtonComponent } from '../button/button.component';
import { FormComponent } from '../form/form.component';
export declare class LoginComponent extends StylableComponent implements AfterViewInit {
    static initializeProps: void;
    loginBtnCmp: ButtonComponent;
    formCmp: FormComponent;
    buttonComponents: QueryList<ButtonComponent>;
    loginMessage: {
        type?: string;
        caption?: any;
        show?: boolean;
    };
    errormessage: any;
    eventsource: any;
    constructor(inj: Injector);
    onSuccessCB(): void;
    onErrorCB(error?: any): void;
    getLoginDetails(): any;
    doLogin(): void;
    initLoginButtonActions(): void;
    ngAfterViewInit(): void;
}
