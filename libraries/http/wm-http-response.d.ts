import { WmHttpRequest } from './wm-http-request';
/**
 * This class creates a custom WmHttpRequest.
 */
export declare class WmHttpResponse extends WmHttpRequest {
    error: any;
    message: string;
    ok: boolean;
    status: number;
    statusText: string;
    constructor();
    /**
     * This method converts the given wm HttpResponse to angular HttpResponse
     * @param respObj, the wm HttpResponse
     */
    wmToAngularResponse(respObj: any): any;
    /**
     * This method converts the given wm HttpResponse to angular HttpResponse
     * @param respObj, the angular HttpResponse
     */
    angularToWmResponse(respObj: any): any;
}
