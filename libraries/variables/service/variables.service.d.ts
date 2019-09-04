import { Router } from '@angular/router';
import { AbstractDialogService, AbstractHttpService, AbstractNavigationService, AbstractToasterService } from '@wm/core';
import { OAuthService } from '@wm/oAuth';
import { SecurityService } from '@wm/security';
import { MetadataService } from './metadata-service/metadata.service';
export declare class VariablesService {
    private httpService;
    private metadataService;
    private navigationService;
    private routerService;
    private toasterService;
    private oAuthService;
    private securityService;
    private dialogService;
    constructor(httpService: AbstractHttpService, metadataService: MetadataService, navigationService: AbstractNavigationService, routerService: Router, toasterService: AbstractToasterService, oAuthService: OAuthService, securityService: SecurityService, dialogService: AbstractDialogService);
    /**
     * loop through a collection of variables/actions
     * trigger cancel on each (of exists)
     * @param collection
     */
    bulkCancel(collection: any): void;
    /**
     * loops over the variable/actions collection and trigger invoke on it if startUpdate on it is true
     * @param collection
     */
    triggerStartUpdate(collection: any): Promise<any[]>;
    /**
     * Takes the raw variables and actions json as input
     * Initialize the variable and action instances through the factory
     * collect the variables and actions in separate maps and return the collection
     * @param {string} page
     * @param variablesJson
     * @param scope
     * @returns {Variables , Actions}
     */
    register(page: string, variablesJson: any, scope: any): {
        Variables: {};
        Actions: {};
        callback: (collection: any) => Promise<any[]>;
    };
    destroy(): void;
    registerDependency(name: any, ref: any): void;
}
