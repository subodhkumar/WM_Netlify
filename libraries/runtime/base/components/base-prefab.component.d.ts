import { AfterViewInit, Injector, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { AbstractI18nService, App } from '@wm/core';
import { PrefabManagerService } from '../services/prefab-manager.service';
import { FragmentMonitor } from "../util/fragment-monitor";
export declare abstract class BasePrefabComponent extends FragmentMonitor implements AfterViewInit, OnDestroy {
    Widgets: any;
    Variables: any;
    Actions: any;
    App: App;
    injector: Injector;
    containerWidget: any;
    prefabMngr: PrefabManagerService;
    displayName: string;
    prefabName: string;
    i18nService: AbstractI18nService;
    appLocale: any;
    destroy$: Subject<{}>;
    viewInit$: Subject<{}>;
    abstract evalUserScript(prefabContext: any, appContext: any, utils: any): any;
    abstract getVariables(): any;
    getContainerWidgetInjector(): any;
    init(): void;
    registerWidgets(): void;
    initUserScript(): void;
    registerChangeListeners(): void;
    registerDestroyListener(fn: Function): void;
    defineI18nProps(): void;
    registerProps(): void;
    initVariables(): void;
    invokeOnReady(): void;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    onPropertyChange(): void;
    onReady(): void;
}
