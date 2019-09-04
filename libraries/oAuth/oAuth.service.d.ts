import { Observable, Subject } from 'rxjs';
import { AbstractHttpService } from '@wm/core';
export declare class OAuthService {
    private httpService;
    constructor(httpService: AbstractHttpService);
    providers: Subject<{}>;
    providersConfig: any[];
    getOAuthProvidersAsObservable(): Observable<any>;
    addProviderConfig(provider: any): void;
    removeProviderConfig(providerId: any): void;
    perfromOAuthorization(url: any, providerId: any, onSuccess: any, onError: any): void;
    getAccessToken(provider: any, checkLocalStorage: any): string;
    removeAccessToken(provider: any): void;
}
