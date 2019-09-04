import { Injectable } from '@angular/core';
import { App } from '@wm/core';
import * as i0 from "@angular/core";
import * as i1 from "@wm/core";
var ExtAppMessageService = /** @class */ (function () {
    function ExtAppMessageService(app) {
        var _this = this;
        this.app = app;
        this.handlers = [];
        document.addEventListener('externalAppMessageReceived', function (e) {
            var message = (e['detail'].message);
            _this.handlers.forEach(function (handler) {
                var matches = handler && message.address.match(handler.pattern);
                if (matches && matches.length > 0) {
                    handler.callBack(message);
                }
            });
        });
    }
    /**
     * adds a listener for a message whose address matches with the given regex pattern.
     *
     * @param {string} messageAddressPattern a regex pattern that is used to target messages to listen.
     * @param {Function} listener function to invoke when message that matches regex is received.
     *                  message received will be sent as first argument.
     * @returns {Function} a function which removes the listener when invoked.
     */
    ExtAppMessageService.prototype.subscribe = function (messageAddressPattern, listener) {
        var _this = this;
        var handler = {
            pattern: new RegExp(messageAddressPattern),
            callBack: listener
        };
        this.handlers.push(handler);
        return function () { return _.remove(_this.handlers, handler); };
    };
    ExtAppMessageService.decorators = [
        { type: Injectable, args: [{ providedIn: 'root' },] }
    ];
    /** @nocollapse */
    ExtAppMessageService.ctorParameters = function () { return [
        { type: App }
    ]; };
    ExtAppMessageService.ngInjectableDef = i0.defineInjectable({ factory: function ExtAppMessageService_Factory() { return new ExtAppMessageService(i0.inject(i1.App)); }, token: ExtAppMessageService, providedIn: "root" });
    return ExtAppMessageService;
}());
export { ExtAppMessageService };
(function (window, document) {
    'use strict';
    // listen app-to-app communication via url schemes
    function subString(str, begin, end) {
        end = end < 0 ? undefined : end;
        return (str && begin >= 0 && str.length > begin && str.substring(begin, end)) || undefined;
    }
    function indexOf(str, pattern) {
        return str && str.indexOf(pattern);
    }
    function extractData(url) {
        var str = subString(url, indexOf(url, '?') + 1, indexOf(url, '#')), data = {};
        _.forEach(_.split(str, '&'), function (entry) {
            var esplits = entry.split('=');
            data[esplits[0]] = esplits[1];
        });
        return data;
    }
    function extractAddress(url) {
        return subString(url, indexOf(url, '://') + 3, indexOf(url, '?'));
    }
    function createMessage(url) {
        return {
            'address': extractAddress(url),
            'data': extractData(url)
        };
    }
    window['handleOpenURL'] = function (url) {
        var handleOpenURL = window['handleOpenURL'];
        if (handleOpenURL.isReady && !_.startsWith(url, 'http')) {
            var message = createMessage(url);
            var e = new window['CustomEvent']('externalAppMessageReceived', {
                'detail': {
                    'message': message
                }
            });
            document.dispatchEvent(e);
        }
        handleOpenURL.lastURL = url;
    };
}(window, document));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0LWFwcC1tZXNzYWdlLnNlcnZpY2UuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vbW9iaWxlL2NvcmUvIiwic291cmNlcyI6WyJzZXJ2aWNlcy9leHQtYXBwLW1lc3NhZ2Uuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRTNDLE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxVQUFVLENBQUM7OztBQWMvQjtJQUtJLDhCQUFvQixHQUFRO1FBQTVCLGlCQVVDO1FBVm1CLFFBQUcsR0FBSCxHQUFHLENBQUs7UUFGcEIsYUFBUSxHQUFHLEVBQUUsQ0FBQztRQUdsQixRQUFRLENBQUMsZ0JBQWdCLENBQUMsNEJBQTRCLEVBQUUsVUFBQSxDQUFDO1lBQ3JELElBQU0sT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLE9BQU8sQ0FBWSxDQUFDO1lBQ2pELEtBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLFVBQUEsT0FBTztnQkFDekIsSUFBTSxPQUFPLEdBQUcsT0FBTyxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDbEUsSUFBSSxPQUFPLElBQUksT0FBTyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7b0JBQy9CLE9BQU8sQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLENBQUM7aUJBQzdCO1lBQ0wsQ0FBQyxDQUFDLENBQUM7UUFDUCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRDs7Ozs7OztPQU9HO0lBQ0ksd0NBQVMsR0FBaEIsVUFBaUIscUJBQXFCLEVBQUUsUUFBK0I7UUFBdkUsaUJBT0M7UUFORyxJQUFNLE9BQU8sR0FBRztZQUNaLE9BQU8sRUFBRyxJQUFJLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQztZQUMzQyxRQUFRLEVBQUcsUUFBUTtTQUN0QixDQUFDO1FBQ0YsSUFB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aEMsQ0FBQyxDQUFDO0FBQ04sQ0FBQyxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBBcHAgfSBmcm9tICdAd20vY29yZSc7XG5cbmRlY2xhcmUgY29uc3QgXztcblxuaW50ZXJmYWNlIE1lc3NhZ2Uge1xuICAgIGFkZHJlc3M6IHN0cmluZztcbiAgICBkYXRhOiBNYXA8c3RyaW5nLCBzdHJpbmc+O1xufVxuXG5pbnRlcmZhY2UgSGFuZGxlciB7XG4gICAgcGF0dGVybjogc3RyaW5nO1xuICAgIGNhbGxiYWNrOiAobXNnOiBzdHJpbmcpID0+IGFueTtcbn1cblxuQEluamVjdGFibGUoeyBwcm92aWRlZEluOiAncm9vdCcgfSlcbmV4cG9ydCBjbGFzcyBFeHRBcHBNZXNzYWdlU2VydmljZSB7XG5cbiAgICBwcml2YXRlIGhhbmRsZXJzID0gW107XG5cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGFwcDogQXBwKSB7XG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2V4dGVybmFsQXBwTWVzc2FnZVJlY2VpdmVkJywgZSA9PiB7XG4gICAgICAgICAgICBjb25zdCBtZXNzYWdlID0gKGVbJ2RldGFpbCddLm1lc3NhZ2UpIGFzIE1lc3NhZ2U7XG4gICAgICAgICAgICB0aGlzLmhhbmRsZXJzLmZvckVhY2goaGFuZGxlciA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgbWF0Y2hlcyA9IGhhbmRsZXIgJiYgbWVzc2FnZS5hZGRyZXNzLm1hdGNoKGhhbmRsZXIucGF0dGVybik7XG4gICAgICAgICAgICAgICAgaWYgKG1hdGNoZXMgJiYgbWF0Y2hlcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGhhbmRsZXIuY2FsbEJhY2sobWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGFkZHMgYSBsaXN0ZW5lciBmb3IgYSBtZXNzYWdlIHdob3NlIGFkZHJlc3MgbWF0Y2hlcyB3aXRoIHRoZSBnaXZlbiByZWdleCBwYXR0ZXJuLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG1lc3NhZ2VBZGRyZXNzUGF0dGVybiBhIHJlZ2V4IHBhdHRlcm4gdGhhdCBpcyB1c2VkIHRvIHRhcmdldCBtZXNzYWdlcyB0byBsaXN0ZW4uXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gbGlzdGVuZXIgZnVuY3Rpb24gdG8gaW52b2tlIHdoZW4gbWVzc2FnZSB0aGF0IG1hdGNoZXMgcmVnZXggaXMgcmVjZWl2ZWQuXG4gICAgICogICAgICAgICAgICAgICAgICBtZXNzYWdlIHJlY2VpdmVkIHdpbGwgYmUgc2VudCBhcyBmaXJzdCBhcmd1bWVudC5cbiAgICAgKiBAcmV0dXJucyB7RnVuY3Rpb259IGEgZnVuY3Rpb24gd2hpY2ggcmVtb3ZlcyB0aGUgbGlzdGVuZXIgd2hlbiBpbnZva2VkLlxuICAgICAqL1xuICAgIHB1YmxpYyBzdWJzY3JpYmUobWVzc2FnZUFkZHJlc3NQYXR0ZXJuLCBsaXN0ZW5lcjogKG1zZzogTWVzc2FnZSkgPT4gYW55KSB7XG4gICAgICAgIGNvbnN0IGhhbmRsZXIgPSB7XG4gICAgICAgICAgICBwYXR0ZXJuIDogbmV3IFJlZ0V4cChtZXNzYWdlQWRkcmVzc1BhdHRlcm4pLFxuICAgICAgICAgICAgY2FsbEJhY2sgOiBsaXN0ZW5lclxuICAgICAgICB9O1xuICAgICAgICB0aGlzLmhhbmRsZXJzLnB1c2goaGFuZGxlcik7XG4gICAgICAgIHJldHVybiAoKSA9PiBfLnJlbW92ZSh0aGlzLmhhbmRsZXJzLCBoYW5kbGVyKTtcbiAgICB9XG5cbn1cblxuKGZ1bmN0aW9uICh3aW5kb3csIGRvY3VtZW50KSB7XG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIC8vIGxpc3RlbiBhcHAtdG8tYXBwIGNvbW11bmljYXRpb24gdmlhIHVybCBzY2hlbWVzXG4gICAgZnVuY3Rpb24gc3ViU3RyaW5nKHN0ciwgYmVnaW4sIGVuZCkge1xuICAgICAgICBlbmQgPSBlbmQgPCAwID8gdW5kZWZpbmVkIDogZW5kO1xuICAgICAgICByZXR1cm4gKHN0ciAmJiBiZWdpbiA+PSAwICYmIHN0ci5sZW5ndGggPiBiZWdpbiAmJiBzdHIuc3Vic3RyaW5nKGJlZ2luLCBlbmQpKSB8fCB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGluZGV4T2Yoc3RyLCBwYXR0ZXJuKSB7XG4gICAgICAgIHJldHVybiBzdHIgJiYgc3RyLmluZGV4T2YocGF0dGVybik7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGV4dHJhY3REYXRhKHVybCkge1xuICAgICAgICBjb25zdCBzdHIgPSBzdWJTdHJpbmcodXJsLCBpbmRleE9mKHVybCwgJz8nKSArIDEsIGluZGV4T2YodXJsLCAnIycpKSxcbiAgICAgICAgICAgIGRhdGEgPSB7fTtcbiAgICAgICAgXy5mb3JFYWNoKF8uc3BsaXQoc3RyLCAnJicpLCBlbnRyeSA9PiB7XG4gICAgICAgICAgICBjb25zdCBlc3BsaXRzID0gZW50cnkuc3BsaXQoJz0nKTtcbiAgICAgICAgICAgIGRhdGFbZXNwbGl0c1swXV0gPSBlc3BsaXRzWzFdO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGRhdGE7XG4gICAgfVxuICAgIGZ1bmN0aW9uIGV4dHJhY3RBZGRyZXNzKHVybCkge1xuICAgICAgICByZXR1cm4gc3ViU3RyaW5nKHVybCwgaW5kZXhPZih1cmwsICc6Ly8nKSArIDMsIGluZGV4T2YodXJsLCAnPycpKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gY3JlYXRlTWVzc2FnZSh1cmwpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICdhZGRyZXNzJzogZXh0cmFjdEFkZHJlc3ModXJsKSxcbiAgICAgICAgICAgICdkYXRhJzogZXh0cmFjdERhdGEodXJsKVxuICAgICAgICB9O1xuICAgIH1cbiAgICB3aW5kb3dbJ2hhbmRsZU9wZW5VUkwnXSA9IGZ1bmN0aW9uICh1cmwpIHtcbiAgICAgICAgY29uc3QgaGFuZGxlT3BlblVSTCA9IHdpbmRvd1snaGFuZGxlT3BlblVSTCddO1xuICAgICAgICBpZiAoaGFuZGxlT3BlblVSTC5pc1JlYWR5ICYmICFfLnN0YXJ0c1dpdGgodXJsLCAnaHR0cCcpKSB7XG4gICAgICAgICAgICBjb25zdCBtZXNzYWdlID0gY3JlYXRlTWVzc2FnZSh1cmwpO1xuICAgICAgICAgICAgY29uc3QgZSA9IG5ldyB3aW5kb3dbJ0N1c3RvbUV2ZW50J10oJ2V4dGVybmFsQXBwTWVzc2FnZVJlY2VpdmVkJywge1xuICAgICAgICAgICAgICAgICdkZXRhaWwnOiB7XG4gICAgICAgICAgICAgICAgICAgICdtZXNzYWdlJzogbWVzc2FnZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgZG9jdW1lbnQuZGlzcGF0Y2hFdmVudChlKTtcbiAgICAgICAgfVxuICAgICAgICBoYW5kbGVPcGVuVVJMLmxhc3RVUkwgPSB1cmw7XG4gICAgfTtcbn0od2luZG93LCBkb2N1bWVudCkpO1xuIl19