/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import * as tslib_1 from "tslib";
import { WmHttpRequest } from './wm-http-request';
import { HttpResponse } from '@angular/common/http';
/**
 * This class creates a custom WmHttpRequest.
 */
var /**
 * This class creates a custom WmHttpRequest.
 */
WmHttpResponse = /** @class */ (function (_super) {
    tslib_1.__extends(WmHttpResponse, _super);
    function WmHttpResponse() {
        return _super.call(this) || this;
    }
    /**
     * This method converts the given wm HttpResponse to angular HttpResponse
     * @param respObj, the wm HttpResponse
     */
    /**
     * This method converts the given wm HttpResponse to angular HttpResponse
     * @param {?} respObj
     * @return {?}
     */
    WmHttpResponse.prototype.wmToAngularResponse = /**
     * This method converts the given wm HttpResponse to angular HttpResponse
     * @param {?} respObj
     * @return {?}
     */
    function (respObj) {
        /** @type {?} */
        var angResp;
        angResp = new HttpResponse();
        angResp = angResp.clone();
        angResp.body = respObj.body;
        angResp.error = respObj.error;
        angResp.message = respObj.message;
        angResp.url = respObj.url;
        angResp.ok = respObj.ok;
        angResp.status = respObj.status;
        angResp.statusText = respObj.statusText;
        respObj.headers.forEach(function (value, header) {
            angResp.headers = angResp.headers.append(header, value);
        });
        return angResp;
    };
    /**
     * This method converts the given wm HttpResponse to angular HttpResponse
     * @param respObj, the angular HttpResponse
     */
    /**
     * This method converts the given wm HttpResponse to angular HttpResponse
     * @param {?} respObj
     * @return {?}
     */
    WmHttpResponse.prototype.angularToWmResponse = /**
     * This method converts the given wm HttpResponse to angular HttpResponse
     * @param {?} respObj
     * @return {?}
     */
    function (respObj) {
        /** @type {?} */
        var wmResp;
        /** @type {?} */
        var headerMap = new Map();
        wmResp = new WmHttpResponse();
        wmResp.body = respObj.body;
        wmResp.error = respObj.error;
        wmResp.message = respObj.message;
        wmResp.url = respObj.url;
        wmResp.ok = respObj.ok;
        wmResp.status = respObj.status;
        wmResp.statusText = respObj.statusText;
        respObj.headers.keys().forEach(function (header) {
            headerMap.set(header, respObj.headers.headers.get(header.toLowerCase())[0]);
        });
        wmResp.headers = headerMap;
        return wmResp;
    };
    return WmHttpResponse;
}(WmHttpRequest));
/**
 * This class creates a custom WmHttpRequest.
 */
export { WmHttpResponse };
if (false) {
    /** @type {?} */
    WmHttpResponse.prototype.error;
    /** @type {?} */
    WmHttpResponse.prototype.message;
    /** @type {?} */
    WmHttpResponse.prototype.ok;
    /** @type {?} */
    WmHttpResponse.prototype.status;
    /** @type {?} */
    WmHttpResponse.prototype.statusText;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid20taHR0cC1yZXNwb25zZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9odHRwLyIsInNvdXJjZXMiOlsid20taHR0cC1yZXNwb25zZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQztBQUNsRCxPQUFPLEVBQUUsWUFBWSxFQUFFLE1BQU0sc0JBQXNCLENBQUM7Ozs7QUFRcEQ7Ozs7SUFBb0MsMENBQWE7SUFRN0M7ZUFDSSxpQkFBTztJQUNYLENBQUM7SUFFRDs7O09BR0c7Ozs7OztJQUNILDRDQUFtQjs7Ozs7SUFBbkIsVUFBb0IsT0FBTzs7WUFDbkIsT0FBTztRQUNYLE9BQU8sR0FBRyxJQUFJLFlBQVksRUFBRSxDQUFDO1FBQzdCLE9BQU8sR0FBRyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDMUIsT0FBTyxDQUFDLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDO1FBQzVCLE9BQU8sQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQztRQUM5QixPQUFPLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUM7UUFDbEMsT0FBTyxDQUFDLEdBQUcsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDO1FBQzFCLE9BQU8sQ0FBQyxFQUFFLEdBQUcsT0FBTyxDQUFDLEVBQUUsQ0FBQztRQUN4QixPQUFPLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7UUFDaEMsT0FBTyxDQUFDLFVBQVUsR0FBRyxPQUFPLENBQUMsVUFBVSxDQUFDO1FBQ3hDLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFVBQUMsS0FBSyxFQUFFLE1BQU07WUFDbEMsT0FBTyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDNUQsQ0FBQyxDQUFDLENBQUM7UUFDSCxPQUFPLE9BQU8sQ0FBQztJQUNuQixDQUFDO0lBRUQ7OztPQUdHOzs7Ozs7SUFDSCw0Q0FBbUI7Ozs7O0lBQW5CLFVBQW9CLE9BQU87O1lBQ25CLE1BQU07O1lBQ04sU0FBUyxHQUFHLElBQUksR0FBRyxFQUFFO1FBQ3pCLE1BQU0sR0FBRyxJQUFJLGNBQWMsRUFBRSxDQUFDO1FBQzlCLE1BQU0sQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQztRQUMzQixNQUFNLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUM7UUFDN0IsTUFBTSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDO1FBQ2pDLE1BQU0sQ0FBQyxHQUFHLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQztRQUN6QixNQUFNLENBQUMsRUFBRSxHQUFHLE9BQU8sQ0FBQyxFQUFFLENBQUM7UUFDdkIsTUFBTSxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO1FBQy9CLE1BQU0sQ0FBQyxVQUFVLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQztRQUN2QyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFDLE1BQU07WUFDbEMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDaEYsQ0FBQyxDQUFDLENBQUM7UUFDSCxNQUFNLENBQUMsT0FBTyxHQUFHLFNBQVMsQ0FBQztRQUMzQixPQUFPLE1BQU0sQ0FBQztJQUNsQixDQUFDO0lBQ0wscUJBQUM7QUFBRCxDQUFDLEFBdERELENBQW9DLGFBQWEsR0FzRGhEOzs7Ozs7O0lBcERHLCtCQUFXOztJQUNYLGlDQUFnQjs7SUFDaEIsNEJBQVk7O0lBQ1osZ0NBQWU7O0lBQ2Ysb0NBQW1CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgV21IdHRwUmVxdWVzdCB9IGZyb20gJy4vd20taHR0cC1yZXF1ZXN0JztcbmltcG9ydCB7IEh0dHBSZXNwb25zZSB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbi9odHRwJztcblxuXG5kZWNsYXJlIGNvbnN0IF87XG5cbi8qKlxuICogVGhpcyBjbGFzcyBjcmVhdGVzIGEgY3VzdG9tIFdtSHR0cFJlcXVlc3QuXG4gKi9cbmV4cG9ydCBjbGFzcyBXbUh0dHBSZXNwb25zZSBleHRlbmRzIFdtSHR0cFJlcXVlc3R7XG5cbiAgICBlcnJvcjogYW55O1xuICAgIG1lc3NhZ2U6IHN0cmluZztcbiAgICBvazogYm9vbGVhbjtcbiAgICBzdGF0dXM6IG51bWJlcjtcbiAgICBzdGF0dXNUZXh0OiBzdHJpbmc7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIG1ldGhvZCBjb252ZXJ0cyB0aGUgZ2l2ZW4gd20gSHR0cFJlc3BvbnNlIHRvIGFuZ3VsYXIgSHR0cFJlc3BvbnNlXG4gICAgICogQHBhcmFtIHJlc3BPYmosIHRoZSB3bSBIdHRwUmVzcG9uc2VcbiAgICAgKi9cbiAgICB3bVRvQW5ndWxhclJlc3BvbnNlKHJlc3BPYmopIHtcbiAgICAgICAgbGV0IGFuZ1Jlc3A7XG4gICAgICAgIGFuZ1Jlc3AgPSBuZXcgSHR0cFJlc3BvbnNlKCk7XG4gICAgICAgIGFuZ1Jlc3AgPSBhbmdSZXNwLmNsb25lKCk7XG4gICAgICAgIGFuZ1Jlc3AuYm9keSA9IHJlc3BPYmouYm9keTtcbiAgICAgICAgYW5nUmVzcC5lcnJvciA9IHJlc3BPYmouZXJyb3I7XG4gICAgICAgIGFuZ1Jlc3AubWVzc2FnZSA9IHJlc3BPYmoubWVzc2FnZTtcbiAgICAgICAgYW5nUmVzcC51cmwgPSByZXNwT2JqLnVybDtcbiAgICAgICAgYW5nUmVzcC5vayA9IHJlc3BPYmoub2s7XG4gICAgICAgIGFuZ1Jlc3Auc3RhdHVzID0gcmVzcE9iai5zdGF0dXM7XG4gICAgICAgIGFuZ1Jlc3Auc3RhdHVzVGV4dCA9IHJlc3BPYmouc3RhdHVzVGV4dDtcbiAgICAgICAgcmVzcE9iai5oZWFkZXJzLmZvckVhY2goKHZhbHVlLCBoZWFkZXIpPT57XG4gICAgICAgICAgICBhbmdSZXNwLmhlYWRlcnMgPSBhbmdSZXNwLmhlYWRlcnMuYXBwZW5kKGhlYWRlciwgdmFsdWUpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGFuZ1Jlc3A7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogVGhpcyBtZXRob2QgY29udmVydHMgdGhlIGdpdmVuIHdtIEh0dHBSZXNwb25zZSB0byBhbmd1bGFyIEh0dHBSZXNwb25zZVxuICAgICAqIEBwYXJhbSByZXNwT2JqLCB0aGUgYW5ndWxhciBIdHRwUmVzcG9uc2VcbiAgICAgKi9cbiAgICBhbmd1bGFyVG9XbVJlc3BvbnNlKHJlc3BPYmopIHtcbiAgICAgICAgbGV0IHdtUmVzcDtcbiAgICAgICAgbGV0IGhlYWRlck1hcCA9IG5ldyBNYXAoKTtcbiAgICAgICAgd21SZXNwID0gbmV3IFdtSHR0cFJlc3BvbnNlKCk7XG4gICAgICAgIHdtUmVzcC5ib2R5ID0gcmVzcE9iai5ib2R5O1xuICAgICAgICB3bVJlc3AuZXJyb3IgPSByZXNwT2JqLmVycm9yO1xuICAgICAgICB3bVJlc3AubWVzc2FnZSA9IHJlc3BPYmoubWVzc2FnZTtcbiAgICAgICAgd21SZXNwLnVybCA9IHJlc3BPYmoudXJsO1xuICAgICAgICB3bVJlc3Aub2sgPSByZXNwT2JqLm9rO1xuICAgICAgICB3bVJlc3Auc3RhdHVzID0gcmVzcE9iai5zdGF0dXM7XG4gICAgICAgIHdtUmVzcC5zdGF0dXNUZXh0ID0gcmVzcE9iai5zdGF0dXNUZXh0O1xuICAgICAgICByZXNwT2JqLmhlYWRlcnMua2V5cygpLmZvckVhY2goKGhlYWRlcikgPT4ge1xuICAgICAgICAgICAgaGVhZGVyTWFwLnNldChoZWFkZXIsIHJlc3BPYmouaGVhZGVycy5oZWFkZXJzLmdldChoZWFkZXIudG9Mb3dlckNhc2UoKSlbMF0pO1xuICAgICAgICB9KTtcbiAgICAgICAgd21SZXNwLmhlYWRlcnMgPSBoZWFkZXJNYXA7XG4gICAgICAgIHJldHVybiB3bVJlc3A7XG4gICAgfVxufSJdfQ==