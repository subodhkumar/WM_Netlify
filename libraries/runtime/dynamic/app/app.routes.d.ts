import { AppJSResolve, MetadataResolve } from '@wm/runtime/base';
import { SecurityConfigResolve, PrefabPreviewComponent, CanDeactivatePageGuard, EmptyPageComponent } from '@wm/runtime/base';
import { PageWrapperComponent } from './components/page-wrapper.component';
export declare const routes: ({
    path: string;
    pathMatch: string;
    resolve: {
        securityConfig: typeof SecurityConfigResolve;
        metadata: typeof MetadataResolve;
        appJS: typeof AppJSResolve;
    };
    component: typeof EmptyPageComponent;
    canDeactivate?: undefined;
} | {
    path: string;
    pathMatch: string;
    resolve: {
        securityConfig: typeof SecurityConfigResolve;
        metadata: typeof MetadataResolve;
        appJS: typeof AppJSResolve;
    };
    component: typeof PrefabPreviewComponent;
    canDeactivate?: undefined;
} | {
    path: string;
    pathMatch: string;
    resolve: {
        securityConfig: typeof SecurityConfigResolve;
        metadata: typeof MetadataResolve;
        appJS: typeof AppJSResolve;
    };
    component: typeof PageWrapperComponent;
    canDeactivate: (typeof CanDeactivatePageGuard)[];
})[];
