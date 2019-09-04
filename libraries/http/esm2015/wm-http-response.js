/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
import { WmHttpRequest } from './wm-http-request';
import { HttpResponse } from '@angular/common/http';
/**
 * This class creates a custom WmHttpRequest.
 */
export class WmHttpResponse extends WmHttpRequest {
    constructor() {
        super();
    }
    /**
     * This method converts the given wm HttpResponse to angular HttpResponse
     * @param {?} respObj
     * @return {?}
     */
    wmToAngularResponse(respObj) {
        /** @type {?} */
        let angResp;
        angResp = new HttpResponse();
        angResp = angResp.clone();
        angResp.body = respObj.body;
        angResp.error = respObj.error;
        angResp.message = respObj.message;
        angResp.url = respObj.url;
        angResp.ok = respObj.ok;
        angResp.status = respObj.status;
        angResp.statusText = respObj.statusText;
        respObj.headers.forEach((value, header) => {
            angResp.headers = angResp.headers.append(header, value);
        });
        return angResp;
    }
    /**
     * This method converts the given wm HttpResponse to angular HttpResponse
     * @param {?} respObj
     * @return {?}
     */
    angularToWmResponse(respObj) {
        /** @type {?} */
        let wmResp;
        /** @type {?} */
        let headerMap = new Map();
        wmResp = new WmHttpResponse();
        wmResp.body = respObj.body;
        wmResp.error = respObj.error;
        wmResp.message = respObj.message;
        wmResp.url = respObj.url;
        wmResp.ok = respObj.ok;
        wmResp.status = respObj.status;
        wmResp.statusText = respObj.statusText;
        respObj.headers.keys().forEach((header) => {
            headerMap.set(header, respObj.headers.headers.get(header.toLowerCase())[0]);
        });
        wmResp.headers = headerMap;
        return wmResp;
    }
}
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid20taHR0cC1yZXNwb25zZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9odHRwLyIsInNvdXJjZXMiOlsid20taHR0cC1yZXNwb25zZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7O0FBQUEsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQ2xELE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQzs7OztBQVFwRCxNQUFNLE9BQU8sY0FBZSxTQUFRLGFBQWE7SUFRN0M7UUFDSSxLQUFLLEVBQUUsQ0FBQztJQUNaLENBQUM7Ozs7OztJQU1ELG1CQUFtQixDQUFDLE9BQU87O1lBQ25CLE9BQU87UUFDWCxPQUFPLEdBQUcsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQUM3QixPQUFPLEdBQUcsT0FBTyxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQzFCLE9BQU8sQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQztRQUM1QixPQUFPLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUM7UUFDOUIsT0FBTyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDO1FBQ2xDLE9BQU8sQ0FBQyxHQUFHLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQztRQUMxQixPQUFPLENBQUMsRUFBRSxHQUFHLE9BQU8sQ0FBQyxFQUFFLENBQUM7UUFDeEIsT0FBTyxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO1FBQ2hDLE9BQU8sQ0FBQyxVQUFVLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQztRQUN4QyxPQUFPLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUMsRUFBRTtZQUNyQyxPQUFPLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM1RCxDQUFDLENBQUMsQ0FBQztRQUNILE9BQU8sT0FBTyxDQUFDO0lBQ25CLENBQUM7Ozs7OztJQU1ELG1CQUFtQixDQUFDLE9BQU87O1lBQ25CLE1BQU07O1lBQ04sU0FBUyxHQUFHLElBQUksR0FBRyxFQUFFO1FBQ3pCLE1BQU0sR0FBRyxJQUFJLGNBQWMsRUFBRSxDQUFDO1FBQzlCLE1BQU0sQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQztRQUMzQixNQUFNLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUM7UUFDN0IsTUFBTSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDO1FBQ2pDLE1BQU0sQ0FBQyxHQUFHLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQztRQUN6QixNQUFNLENBQUMsRUFBRSxHQUFHLE9BQU8sQ0FBQyxFQUFFLENBQUM7UUFDdkIsTUFBTSxDQUFDLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDO1FBQy9CLE1BQU0sQ0FBQyxVQUFVLEdBQUcsT0FBTyxDQUFDLFVBQVUsQ0FBQztRQUN2QyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sRUFBRSxFQUFFO1lBQ3RDLFNBQVMsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2hGLENBQUMsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxDQUFDLE9BQU8sR0FBRyxTQUFTLENBQUM7UUFDM0IsT0FBTyxNQUFNLENBQUM7SUFDbEIsQ0FBQztDQUNKOzs7SUFwREcsK0JBQVc7O0lBQ1gsaUNBQWdCOztJQUNoQiw0QkFBWTs7SUFDWixnQ0FBZTs7SUFDZixvQ0FBbUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBXbUh0dHBSZXF1ZXN0IH0gZnJvbSAnLi93bS1odHRwLXJlcXVlc3QnO1xuaW1wb3J0IHsgSHR0cFJlc3BvbnNlIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uL2h0dHAnO1xuXG5cbmRlY2xhcmUgY29uc3QgXztcblxuLyoqXG4gKiBUaGlzIGNsYXNzIGNyZWF0ZXMgYSBjdXN0b20gV21IdHRwUmVxdWVzdC5cbiAqL1xuZXhwb3J0IGNsYXNzIFdtSHR0cFJlc3BvbnNlIGV4dGVuZHMgV21IdHRwUmVxdWVzdHtcblxuICAgIGVycm9yOiBhbnk7XG4gICAgbWVzc2FnZTogc3RyaW5nO1xuICAgIG9rOiBib29sZWFuO1xuICAgIHN0YXR1czogbnVtYmVyO1xuICAgIHN0YXR1c1RleHQ6IHN0cmluZztcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRoaXMgbWV0aG9kIGNvbnZlcnRzIHRoZSBnaXZlbiB3bSBIdHRwUmVzcG9uc2UgdG8gYW5ndWxhciBIdHRwUmVzcG9uc2VcbiAgICAgKiBAcGFyYW0gcmVzcE9iaiwgdGhlIHdtIEh0dHBSZXNwb25zZVxuICAgICAqL1xuICAgIHdtVG9Bbmd1bGFyUmVzcG9uc2UocmVzcE9iaikge1xuICAgICAgICBsZXQgYW5nUmVzcDtcbiAgICAgICAgYW5nUmVzcCA9IG5ldyBIdHRwUmVzcG9uc2UoKTtcbiAgICAgICAgYW5nUmVzcCA9IGFuZ1Jlc3AuY2xvbmUoKTtcbiAgICAgICAgYW5nUmVzcC5ib2R5ID0gcmVzcE9iai5ib2R5O1xuICAgICAgICBhbmdSZXNwLmVycm9yID0gcmVzcE9iai5lcnJvcjtcbiAgICAgICAgYW5nUmVzcC5tZXNzYWdlID0gcmVzcE9iai5tZXNzYWdlO1xuICAgICAgICBhbmdSZXNwLnVybCA9IHJlc3BPYmoudXJsO1xuICAgICAgICBhbmdSZXNwLm9rID0gcmVzcE9iai5vaztcbiAgICAgICAgYW5nUmVzcC5zdGF0dXMgPSByZXNwT2JqLnN0YXR1cztcbiAgICAgICAgYW5nUmVzcC5zdGF0dXNUZXh0ID0gcmVzcE9iai5zdGF0dXNUZXh0O1xuICAgICAgICByZXNwT2JqLmhlYWRlcnMuZm9yRWFjaCgodmFsdWUsIGhlYWRlcik9PntcbiAgICAgICAgICAgIGFuZ1Jlc3AuaGVhZGVycyA9IGFuZ1Jlc3AuaGVhZGVycy5hcHBlbmQoaGVhZGVyLCB2YWx1ZSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gYW5nUmVzcDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBUaGlzIG1ldGhvZCBjb252ZXJ0cyB0aGUgZ2l2ZW4gd20gSHR0cFJlc3BvbnNlIHRvIGFuZ3VsYXIgSHR0cFJlc3BvbnNlXG4gICAgICogQHBhcmFtIHJlc3BPYmosIHRoZSBhbmd1bGFyIEh0dHBSZXNwb25zZVxuICAgICAqL1xuICAgIGFuZ3VsYXJUb1dtUmVzcG9uc2UocmVzcE9iaikge1xuICAgICAgICBsZXQgd21SZXNwO1xuICAgICAgICBsZXQgaGVhZGVyTWFwID0gbmV3IE1hcCgpO1xuICAgICAgICB3bVJlc3AgPSBuZXcgV21IdHRwUmVzcG9uc2UoKTtcbiAgICAgICAgd21SZXNwLmJvZHkgPSByZXNwT2JqLmJvZHk7XG4gICAgICAgIHdtUmVzcC5lcnJvciA9IHJlc3BPYmouZXJyb3I7XG4gICAgICAgIHdtUmVzcC5tZXNzYWdlID0gcmVzcE9iai5tZXNzYWdlO1xuICAgICAgICB3bVJlc3AudXJsID0gcmVzcE9iai51cmw7XG4gICAgICAgIHdtUmVzcC5vayA9IHJlc3BPYmoub2s7XG4gICAgICAgIHdtUmVzcC5zdGF0dXMgPSByZXNwT2JqLnN0YXR1cztcbiAgICAgICAgd21SZXNwLnN0YXR1c1RleHQgPSByZXNwT2JqLnN0YXR1c1RleHQ7XG4gICAgICAgIHJlc3BPYmouaGVhZGVycy5rZXlzKCkuZm9yRWFjaCgoaGVhZGVyKSA9PiB7XG4gICAgICAgICAgICBoZWFkZXJNYXAuc2V0KGhlYWRlciwgcmVzcE9iai5oZWFkZXJzLmhlYWRlcnMuZ2V0KGhlYWRlci50b0xvd2VyQ2FzZSgpKVswXSk7XG4gICAgICAgIH0pO1xuICAgICAgICB3bVJlc3AuaGVhZGVycyA9IGhlYWRlck1hcDtcbiAgICAgICAgcmV0dXJuIHdtUmVzcDtcbiAgICB9XG59Il19