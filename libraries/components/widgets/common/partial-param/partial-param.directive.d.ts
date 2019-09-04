import { OnInit } from '@angular/core';
export declare class PartialParamHandlerDirective {
    private widgetRef;
    constructor(widgetRef: any);
    registerParams(name: string, value: string, bindExpr: string, type: string): void;
}
export declare class PartialParamDirective implements OnInit {
    bindValue: any;
    type: any;
    private partialParamsProvider;
    name: string;
    value: any;
    constructor(bindValue: any, type: any, partialParamsProvider: PartialParamHandlerDirective);
    ngOnInit(): void;
}
