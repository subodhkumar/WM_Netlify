/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { HttpRequest } from '@angular/common/http';
/**
 * This class creates a custom WmHttpRequest.
 */
export class WmHttpRequest {
    constructor() {
        this.headers = [];
    }
    /**
     * This method converts the given wm HttpRequest to angular HttpRequest
     * @param {?} reqObj
     * @return {?}
     */
    wmToAngularRequest(reqObj) {
        /** @type {?} */
        let angReq;
        angReq = new HttpRequest(reqObj.method, reqObj.url);
        angReq = angReq.clone();
        angReq.body = reqObj.body;
        angReq.method = reqObj.method;
        angReq.responseType = reqObj.responseType;
        angReq.urlWithParams = reqObj.url;
        angReq.withCredentials = reqObj.withCredentials;
        reqObj.headers.forEach((value, header) => {
            angReq.headers = angReq.headers.append(header, value);
        });
        return angReq;
    }
    /**
     * This method converts the given angular HttpRequest to wm HttpRequest
     * @param {?} req
     * @return {?}
     */
    angularToWmRequest(req) {
        /** @type {?} */
        let wmReq = new WmHttpRequest();
        /** @type {?} */
        let headerMap = new Map();
        wmReq.body = req.body;
        wmReq.method = req.method;
        wmReq.responseType = req.responseType;
        wmReq.url = req.urlWithParams;
        wmReq.withCredentials = req.withCredentials;
        req.headers.keys().forEach((header) => {
            headerMap.set(header, req.headers.headers.get(header.toLowerCase())[0]);
        });
        wmReq.headers = headerMap;
        return wmReq;
    }
}
if (false) {
    /** @type {?} */
    WmHttpRequest.prototype.method;
    /** @type {?} */
    WmHttpRequest.prototype.url;
    /** @type {?} */
    WmHttpRequest.prototype.headers;
    /** @type {?} */
    WmHttpRequest.prototype.responseType;
    /** @type {?} */
    WmHttpRequest.prototype.withCredentials;
    /** @type {?} */
    WmHttpRequest.prototype.urlWithParams;
    /** @type {?} */
    WmHttpRequest.prototype.body;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid20taHR0cC1yZXF1ZXN0LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2h0dHAvIiwic291cmNlcyI6WyJ3bS1odHRwLXJlcXVlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQzs7OztBQU9uRCxNQUFNLE9BQU8sYUFBYTtJQVV0QjtRQU5BLFlBQU8sR0FBUSxFQUFFLENBQUM7SUFNSCxDQUFDOzs7Ozs7SUFNaEIsa0JBQWtCLENBQUMsTUFBTTs7WUFDakIsTUFBTTtRQUNWLE1BQU0sR0FBRyxJQUFJLFdBQVcsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNwRCxNQUFNLEdBQUcsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ3hCLE1BQU0sQ0FBQyxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQztRQUMxQixNQUFNLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7UUFDOUIsTUFBTSxDQUFDLFlBQVksR0FBSSxNQUFNLENBQUMsWUFBWSxDQUFDO1FBQzNDLE1BQU0sQ0FBQyxhQUFhLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQztRQUNsQyxNQUFNLENBQUMsZUFBZSxHQUFJLE1BQU0sQ0FBQyxlQUFlLENBQUM7UUFDakQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxLQUFLLEVBQUUsTUFBTSxFQUFDLEVBQUU7WUFDcEMsTUFBTSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDMUQsQ0FBQyxDQUFDLENBQUM7UUFDSCxPQUFPLE1BQU0sQ0FBQztJQUNsQixDQUFDOzs7Ozs7SUFNRCxrQkFBa0IsQ0FBQyxHQUFHOztZQUNkLEtBQUssR0FBRyxJQUFJLGFBQWEsRUFBRTs7WUFDM0IsU0FBUyxHQUFHLElBQUksR0FBRyxFQUFFO1FBQ3pCLEtBQUssQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQztRQUN0QixLQUFLLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUM7UUFDMUIsS0FBSyxDQUFDLFlBQVksR0FBRyxHQUFHLENBQUMsWUFBWSxDQUFDO1FBQ3RDLEtBQUssQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLGFBQWEsQ0FBQztRQUM5QixLQUFLLENBQUMsZUFBZSxHQUFHLEdBQUcsQ0FBQyxlQUFlLENBQUM7UUFDNUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRTtZQUNsQyxTQUFTLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUM1RSxDQUFDLENBQUMsQ0FBQztRQUNILEtBQUssQ0FBQyxPQUFPLEdBQUcsU0FBUyxDQUFDO1FBQzFCLE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUM7Q0FDSjs7O0lBL0NHLCtCQUFlOztJQUNmLDRCQUFZOztJQUNaLGdDQUFrQjs7SUFDbEIscUNBQXFCOztJQUNyQix3Q0FBeUI7O0lBQ3pCLHNDQUFzQjs7SUFDdEIsNkJBQVUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBIdHRwUmVxdWVzdCB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbi9odHRwJztcblxuZGVjbGFyZSBjb25zdCBfO1xuXG4vKipcbiAqIFRoaXMgY2xhc3MgY3JlYXRlcyBhIGN1c3RvbSBXbUh0dHBSZXF1ZXN0LlxuICovXG5leHBvcnQgY2xhc3MgV21IdHRwUmVxdWVzdCB7XG5cbiAgICBtZXRob2Q6IHN0cmluZztcbiAgICB1cmw6IHN0cmluZztcbiAgICBoZWFkZXJzOiBhbnkgPSBbXTtcbiAgICByZXNwb25zZVR5cGU6IHN0cmluZztcbiAgICB3aXRoQ3JlZGVudGlhbHM6IGJvb2xlYW47XG4gICAgdXJsV2l0aFBhcmFtczogc3RyaW5nO1xuICAgIGJvZHk6IGFueTtcblxuICAgIGNvbnN0cnVjdG9yKCkge31cblxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIGNvbnZlcnRzIHRoZSBnaXZlbiB3bSBIdHRwUmVxdWVzdCB0byBhbmd1bGFyIEh0dHBSZXF1ZXN0XG4gICAgICogQHBhcmFtIHJlcU9iaiwgdGhlIHdtIEh0dHBSZXF1ZXN0XG4gICAgICovXG4gICAgd21Ub0FuZ3VsYXJSZXF1ZXN0KHJlcU9iaikge1xuICAgICAgICBsZXQgYW5nUmVxO1xuICAgICAgICBhbmdSZXEgPSBuZXcgSHR0cFJlcXVlc3QocmVxT2JqLm1ldGhvZCwgcmVxT2JqLnVybCk7XG4gICAgICAgIGFuZ1JlcSA9IGFuZ1JlcS5jbG9uZSgpO1xuICAgICAgICBhbmdSZXEuYm9keSA9IHJlcU9iai5ib2R5O1xuICAgICAgICBhbmdSZXEubWV0aG9kID0gcmVxT2JqLm1ldGhvZDtcbiAgICAgICAgYW5nUmVxLnJlc3BvbnNlVHlwZSA9ICByZXFPYmoucmVzcG9uc2VUeXBlO1xuICAgICAgICBhbmdSZXEudXJsV2l0aFBhcmFtcyA9IHJlcU9iai51cmw7XG4gICAgICAgIGFuZ1JlcS53aXRoQ3JlZGVudGlhbHMgPSAgcmVxT2JqLndpdGhDcmVkZW50aWFscztcbiAgICAgICAgcmVxT2JqLmhlYWRlcnMuZm9yRWFjaCgodmFsdWUsIGhlYWRlcik9PntcbiAgICAgICAgICAgIGFuZ1JlcS5oZWFkZXJzID0gYW5nUmVxLmhlYWRlcnMuYXBwZW5kKGhlYWRlciwgdmFsdWUpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGFuZ1JlcTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIG1ldGhvZCBjb252ZXJ0cyB0aGUgZ2l2ZW4gYW5ndWxhciBIdHRwUmVxdWVzdCB0byB3bSBIdHRwUmVxdWVzdFxuICAgICAqIEBwYXJhbSByZXEsIHRoZSBhbmd1bGFyIEh0dHBSZXF1ZXN0XG4gICAgICovXG4gICAgYW5ndWxhclRvV21SZXF1ZXN0KHJlcSkge1xuICAgICAgICBsZXQgd21SZXEgPSBuZXcgV21IdHRwUmVxdWVzdCgpO1xuICAgICAgICBsZXQgaGVhZGVyTWFwID0gbmV3IE1hcCgpO1xuICAgICAgICB3bVJlcS5ib2R5ID0gcmVxLmJvZHk7XG4gICAgICAgIHdtUmVxLm1ldGhvZCA9IHJlcS5tZXRob2Q7XG4gICAgICAgIHdtUmVxLnJlc3BvbnNlVHlwZSA9IHJlcS5yZXNwb25zZVR5cGU7XG4gICAgICAgIHdtUmVxLnVybCA9IHJlcS51cmxXaXRoUGFyYW1zO1xuICAgICAgICB3bVJlcS53aXRoQ3JlZGVudGlhbHMgPSByZXEud2l0aENyZWRlbnRpYWxzO1xuICAgICAgICByZXEuaGVhZGVycy5rZXlzKCkuZm9yRWFjaCgoaGVhZGVyKSA9PiB7XG4gICAgICAgICAgICBoZWFkZXJNYXAuc2V0KGhlYWRlciwgcmVxLmhlYWRlcnMuaGVhZGVycy5nZXQoaGVhZGVyLnRvTG93ZXJDYXNlKCkpWzBdKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHdtUmVxLmhlYWRlcnMgPSBoZWFkZXJNYXA7XG4gICAgICAgIHJldHVybiB3bVJlcTtcbiAgICB9XG59Il19