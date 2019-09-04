export declare const parseConfig: (serviceParams: any) => any;
/**
 * This function remove the accessToken for a provider
 * @param provider
 */
export declare const removeAccessToken: (provider: any) => void;
/**
 * this function retrieves the accessToken based on the run/studiomode
 * @param provider
 * @returns {*}
 */
export declare const getAccessToken: (provider: any, checkLocalStorage: any) => string;
/**
 * this function is used to perform the authorization by opening the window and having active listeners
 * @param url
 * @param providerId
 * @param onSuccess
 * @returns {*}
 */
export declare const performAuthorization: (url: any, providerId: any, onSuccess: any, onError: any, http: any, addProviderConfigCallBack: any, removeProviderConfigCallBack: any) => any;
