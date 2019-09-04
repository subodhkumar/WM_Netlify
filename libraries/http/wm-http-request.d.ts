/**
 * This class creates a custom WmHttpRequest.
 */
export declare class WmHttpRequest {
    method: string;
    url: string;
    headers: any;
    responseType: string;
    withCredentials: boolean;
    urlWithParams: string;
    body: any;
    constructor();
    /**
     * This method converts the given wm HttpRequest to angular HttpRequest
     * @param reqObj, the wm HttpRequest
     */
    wmToAngularRequest(reqObj: any): any;
    /**
     * This method converts the given angular HttpRequest to wm HttpRequest
     * @param req, the angular HttpRequest
     */
    angularToWmRequest(req: any): WmHttpRequest;
}
