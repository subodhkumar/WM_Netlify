/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { HttpRequest } from '@angular/common/http';
/**
 * This class creates a custom WmHttpRequest.
 */
var /**
 * This class creates a custom WmHttpRequest.
 */
WmHttpRequest = /** @class */ (function () {
    function WmHttpRequest() {
        this.headers = [];
    }
    /**
     * This method converts the given wm HttpRequest to angular HttpRequest
     * @param reqObj, the wm HttpRequest
     */
    /**
     * This method converts the given wm HttpRequest to angular HttpRequest
     * @param {?} reqObj
     * @return {?}
     */
    WmHttpRequest.prototype.wmToAngularRequest = /**
     * This method converts the given wm HttpRequest to angular HttpRequest
     * @param {?} reqObj
     * @return {?}
     */
    function (reqObj) {
        /** @type {?} */
        var angReq;
        angReq = new HttpRequest(reqObj.method, reqObj.url);
        angReq = angReq.clone();
        angReq.body = reqObj.body;
        angReq.method = reqObj.method;
        angReq.responseType = reqObj.responseType;
        angReq.urlWithParams = reqObj.url;
        angReq.withCredentials = reqObj.withCredentials;
        reqObj.headers.forEach(function (value, header) {
            angReq.headers = angReq.headers.append(header, value);
        });
        return angReq;
    };
    /**
     * This method converts the given angular HttpRequest to wm HttpRequest
     * @param req, the angular HttpRequest
     */
    /**
     * This method converts the given angular HttpRequest to wm HttpRequest
     * @param {?} req
     * @return {?}
     */
    WmHttpRequest.prototype.angularToWmRequest = /**
     * This method converts the given angular HttpRequest to wm HttpRequest
     * @param {?} req
     * @return {?}
     */
    function (req) {
        /** @type {?} */
        var wmReq = new WmHttpRequest();
        /** @type {?} */
        var headerMap = new Map();
        wmReq.body = req.body;
        wmReq.method = req.method;
        wmReq.responseType = req.responseType;
        wmReq.url = req.urlWithParams;
        wmReq.withCredentials = req.withCredentials;
        req.headers.keys().forEach(function (header) {
            headerMap.set(header, req.headers.headers.get(header.toLowerCase())[0]);
        });
        wmReq.headers = headerMap;
        return wmReq;
    };
    return WmHttpRequest;
}());
/**
 * This class creates a custom WmHttpRequest.
 */
export { WmHttpRequest };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid20taHR0cC1yZXF1ZXN0LmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2h0dHAvIiwic291cmNlcyI6WyJ3bS1odHRwLXJlcXVlc3QudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7OztBQUFBLE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQzs7OztBQU9uRDs7OztJQVVJO1FBTkEsWUFBTyxHQUFRLEVBQUUsQ0FBQztJQU1ILENBQUM7SUFFaEI7OztPQUdHOzs7Ozs7SUFDSCwwQ0FBa0I7Ozs7O0lBQWxCLFVBQW1CLE1BQU07O1lBQ2pCLE1BQU07UUFDVixNQUFNLEdBQUcsSUFBSSxXQUFXLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDcEQsTUFBTSxHQUFHLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUN4QixNQUFNLENBQUMsSUFBSSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUM7UUFDMUIsTUFBTSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDO1FBQzlCLE1BQU0sQ0FBQyxZQUFZLEdBQUksTUFBTSxDQUFDLFlBQVksQ0FBQztRQUMzQyxNQUFNLENBQUMsYUFBYSxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUM7UUFDbEMsTUFBTSxDQUFDLGVBQWUsR0FBSSxNQUFNLENBQUMsZUFBZSxDQUFDO1FBQ2pELE1BQU0sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFVBQUMsS0FBSyxFQUFFLE1BQU07WUFDakMsTUFBTSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDMUQsQ0FBQyxDQUFDLENBQUM7UUFDSCxPQUFPLE1BQU0sQ0FBQztJQUNsQixDQUFDO0lBRUQ7OztPQUdHOzs7Ozs7SUFDSCwwQ0FBa0I7Ozs7O0lBQWxCLFVBQW1CLEdBQUc7O1lBQ2QsS0FBSyxHQUFHLElBQUksYUFBYSxFQUFFOztZQUMzQixTQUFTLEdBQUcsSUFBSSxHQUFHLEVBQUU7UUFDekIsS0FBSyxDQUFDLElBQUksR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDO1FBQ3RCLEtBQUssQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQztRQUMxQixLQUFLLENBQUMsWUFBWSxHQUFHLEdBQUcsQ0FBQyxZQUFZLENBQUM7UUFDdEMsS0FBSyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsYUFBYSxDQUFDO1FBQzlCLEtBQUssQ0FBQyxlQUFlLEdBQUcsR0FBRyxDQUFDLGVBQWUsQ0FBQztRQUM1QyxHQUFHLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFDLE1BQU07WUFDOUIsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDNUUsQ0FBQyxDQUFDLENBQUM7UUFDSCxLQUFLLENBQUMsT0FBTyxHQUFHLFNBQVMsQ0FBQztRQUMxQixPQUFPLEtBQUssQ0FBQztJQUNqQixDQUFDO0lBQ0wsb0JBQUM7QUFBRCxDQUFDLEFBakRELElBaURDOzs7Ozs7O0lBL0NHLCtCQUFlOztJQUNmLDRCQUFZOztJQUNaLGdDQUFrQjs7SUFDbEIscUNBQXFCOztJQUNyQix3Q0FBeUI7O0lBQ3pCLHNDQUFzQjs7SUFDdEIsNkJBQVUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBIdHRwUmVxdWVzdCB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbi9odHRwJztcblxuZGVjbGFyZSBjb25zdCBfO1xuXG4vKipcbiAqIFRoaXMgY2xhc3MgY3JlYXRlcyBhIGN1c3RvbSBXbUh0dHBSZXF1ZXN0LlxuICovXG5leHBvcnQgY2xhc3MgV21IdHRwUmVxdWVzdCB7XG5cbiAgICBtZXRob2Q6IHN0cmluZztcbiAgICB1cmw6IHN0cmluZztcbiAgICBoZWFkZXJzOiBhbnkgPSBbXTtcbiAgICByZXNwb25zZVR5cGU6IHN0cmluZztcbiAgICB3aXRoQ3JlZGVudGlhbHM6IGJvb2xlYW47XG4gICAgdXJsV2l0aFBhcmFtczogc3RyaW5nO1xuICAgIGJvZHk6IGFueTtcblxuICAgIGNvbnN0cnVjdG9yKCkge31cblxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIGNvbnZlcnRzIHRoZSBnaXZlbiB3bSBIdHRwUmVxdWVzdCB0byBhbmd1bGFyIEh0dHBSZXF1ZXN0XG4gICAgICogQHBhcmFtIHJlcU9iaiwgdGhlIHdtIEh0dHBSZXF1ZXN0XG4gICAgICovXG4gICAgd21Ub0FuZ3VsYXJSZXF1ZXN0KHJlcU9iaikge1xuICAgICAgICBsZXQgYW5nUmVxO1xuICAgICAgICBhbmdSZXEgPSBuZXcgSHR0cFJlcXVlc3QocmVxT2JqLm1ldGhvZCwgcmVxT2JqLnVybCk7XG4gICAgICAgIGFuZ1JlcSA9IGFuZ1JlcS5jbG9uZSgpO1xuICAgICAgICBhbmdSZXEuYm9keSA9IHJlcU9iai5ib2R5O1xuICAgICAgICBhbmdSZXEubWV0aG9kID0gcmVxT2JqLm1ldGhvZDtcbiAgICAgICAgYW5nUmVxLnJlc3BvbnNlVHlwZSA9ICByZXFPYmoucmVzcG9uc2VUeXBlO1xuICAgICAgICBhbmdSZXEudXJsV2l0aFBhcmFtcyA9IHJlcU9iai51cmw7XG4gICAgICAgIGFuZ1JlcS53aXRoQ3JlZGVudGlhbHMgPSAgcmVxT2JqLndpdGhDcmVkZW50aWFscztcbiAgICAgICAgcmVxT2JqLmhlYWRlcnMuZm9yRWFjaCgodmFsdWUsIGhlYWRlcik9PntcbiAgICAgICAgICAgIGFuZ1JlcS5oZWFkZXJzID0gYW5nUmVxLmhlYWRlcnMuYXBwZW5kKGhlYWRlciwgdmFsdWUpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGFuZ1JlcTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIG1ldGhvZCBjb252ZXJ0cyB0aGUgZ2l2ZW4gYW5ndWxhciBIdHRwUmVxdWVzdCB0byB3bSBIdHRwUmVxdWVzdFxuICAgICAqIEBwYXJhbSByZXEsIHRoZSBhbmd1bGFyIEh0dHBSZXF1ZXN0XG4gICAgICovXG4gICAgYW5ndWxhclRvV21SZXF1ZXN0KHJlcSkge1xuICAgICAgICBsZXQgd21SZXEgPSBuZXcgV21IdHRwUmVxdWVzdCgpO1xuICAgICAgICBsZXQgaGVhZGVyTWFwID0gbmV3IE1hcCgpO1xuICAgICAgICB3bVJlcS5ib2R5ID0gcmVxLmJvZHk7XG4gICAgICAgIHdtUmVxLm1ldGhvZCA9IHJlcS5tZXRob2Q7XG4gICAgICAgIHdtUmVxLnJlc3BvbnNlVHlwZSA9IHJlcS5yZXNwb25zZVR5cGU7XG4gICAgICAgIHdtUmVxLnVybCA9IHJlcS51cmxXaXRoUGFyYW1zO1xuICAgICAgICB3bVJlcS53aXRoQ3JlZGVudGlhbHMgPSByZXEud2l0aENyZWRlbnRpYWxzO1xuICAgICAgICByZXEuaGVhZGVycy5rZXlzKCkuZm9yRWFjaCgoaGVhZGVyKSA9PiB7XG4gICAgICAgICAgICBoZWFkZXJNYXAuc2V0KGhlYWRlciwgcmVxLmhlYWRlcnMuaGVhZGVycy5nZXQoaGVhZGVyLnRvTG93ZXJDYXNlKCkpWzBdKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHdtUmVxLmhlYWRlcnMgPSBoZWFkZXJNYXA7XG4gICAgICAgIHJldHVybiB3bVJlcTtcbiAgICB9XG59Il19