import { Subject } from 'rxjs';
export declare abstract class FragmentMonitor {
    fragments: number;
    viewInit$: Subject<any>;
    isViewInitialized: boolean;
    fragmentsLoaded$: Subject<{}>;
    constructor();
    init(): void;
    registerFragment(): void;
    resolveFragment(): void;
    isReady(): void;
}
