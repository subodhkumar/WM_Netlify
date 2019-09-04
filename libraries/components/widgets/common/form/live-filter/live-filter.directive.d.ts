export declare class LiveFilterDirective {
    private form;
    static initializeProps: void;
    private _options;
    orderBy: any;
    _filter: (...args: any[]) => void;
    constructor(form: any);
    execute(operation: any, options: any): any;
    onFieldDefaultValueChange(field: any, nv: any): void;
    onFieldValueChange(field: any, nv: any): void;
    onMaxDefaultValueChange(): void;
    onDataSourceChange(): void;
    clearFilter(): void;
    submitForm(): void;
    applyFilter(options: any): any;
    filter(options?: any): any;
    filterOnDefault(): void;
    registerFormWidget(widget: any): void;
}
