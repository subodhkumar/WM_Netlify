import { Compiler, Injector, Pipe } from '@angular/core';
export declare class PipeProvider {
    private compiler;
    private injector;
    _pipeMeta: any;
    _locale: string;
    preparePipeMeta: (reference: Pipe, name: string, pure: boolean, diDeps?: any[]) => {
        type: {
            reference: Pipe;
            diDeps: any[];
        };
        name: string;
        pure: boolean;
    };
    _pipeData: {
        type: {
            reference: Pipe;
            diDeps: any[];
        };
        name: string;
        pure: boolean;
    }[];
    unknownPipe(name: any): void;
    constructor(compiler: Compiler, injector: Injector);
    meta(name: any): any;
    getPipeNameVsIsPureMap(): Map<any, any>;
    resolveDep(dep: any): any;
    getInstance(name: any): any;
}
