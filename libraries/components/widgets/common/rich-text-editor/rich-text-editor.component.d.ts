import { Injector, NgZone, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { BaseFormCustomComponent } from '../base/base-form-custom.component';
export declare class RichTextEditorComponent extends BaseFormCustomComponent implements OnInit, OnDestroy {
    private domSanitizer;
    private ngZone;
    static initializeProps: void;
    $richTextEditor: any;
    $hiddenInputEle: any;
    proxyModel: any;
    _operationStack: any[];
    isEditorLoaded: boolean;
    showpreview: any;
    disabled: boolean;
    EDITOR_DEFAULT_OPTIONS: {
        toolbar: (string | string[])[][];
        callbacks: {
            onInit: () => void;
            onChange: (contents: any, editable: any) => void;
        };
        fontNames: string[];
        placeholder: string;
        height: number;
        disableResizeEditor: boolean;
    };
    readonly htmlcontent: any;
    datavalue: any;
    constructor(inj: Injector, domSanitizer: DomSanitizer, ngZone: NgZone);
    ngOnInit(): void;
    initEditor(): void;
    onPropertyChange(key: string, nv: any, ov?: any): void;
    onStyleChange(key: any, nv: any, ov: any): void;
    performEditorOperation(key: any, value?: any): any;
    getCurrentPosition(): any;
    undo(): void;
    focus(): void;
    ngOnDestroy(): void;
}
