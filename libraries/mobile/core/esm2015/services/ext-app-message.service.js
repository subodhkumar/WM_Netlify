import { Injectable } from '@angular/core';
import { App } from '@wm/core';
import * as i0 from "@angular/core";
import * as i1 from "@wm/core";
export class ExtAppMessageService {
    constructor(app) {
        this.app = app;
        this.handlers = [];
        document.addEventListener('externalAppMessageReceived', e => {
            const message = (e['detail'].message);
            this.handlers.forEach(handler => {
                const matches = handler && message.address.match(handler.pattern);
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
    subscribe(messageAddressPattern, listener) {
        const handler = {
            pattern: new RegExp(messageAddressPattern),
            callBack: listener
        };
        this.handlers.push(handler);
        return () => _.remove(this.handlers, handler);
    }
}
ExtAppMessageService.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
/** @nocollapse */
ExtAppMessageService.ctorParameters = () => [
    { type: App }
];
ExtAppMessageService.ngInjectableDef = i0.defineInjectable({ factory: function ExtAppMessageService_Factory() { return new ExtAppMessageService(i0.inject(i1.App)); }, token: ExtAppMessageService, providedIn: "root" });
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
        const str = subString(url, indexOf(url, '?') + 1, indexOf(url, '#')), data = {};
        _.forEach(_.split(str, '&'), entry => {
            const esplits = entry.split('=');
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
        const handleOpenURL = window['handleOpenURL'];
        if (handleOpenURL.isReady && !_.startsWith(url, 'http')) {
            const message = createMessage(url);
            const e = new window['CustomEvent']('externalAppMessageReceived', {
                'detail': {
                    'message': message
                }
            });
            document.dispatchEvent(e);
        }
        handleOpenURL.lastURL = url;
    };
}(window, document));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXh0LWFwcC1tZXNzYWdlLnNlcnZpY2UuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vbW9iaWxlL2NvcmUvIiwic291cmNlcyI6WyJzZXJ2aWNlcy9leHQtYXBwLW1lc3NhZ2Uuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRTNDLE9BQU8sRUFBRSxHQUFHLEVBQUUsTUFBTSxVQUFVLENBQUM7OztBQWUvQixNQUFNLE9BQU8sb0JBQW9CO0lBSTdCLFlBQW9CLEdBQVE7UUFBUixRQUFHLEdBQUgsR0FBRyxDQUFLO1FBRnBCLGFBQVEsR0FBRyxFQUFFLENBQUM7UUFHbEIsUUFBUSxDQUFDLGdCQUFnQixDQUFDLDRCQUE0QixFQUFFLENBQUMsQ0FBQyxFQUFFO1lBQ3hELE1BQU0sT0FBTyxHQUFHLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLE9BQU8sQ0FBWSxDQUFDO1lBQ2pELElBQUksQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFO2dCQUM1QixNQUFNLE9BQU8sR0FBRyxPQUFPLElBQUksT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUNsRSxJQUFJLE9BQU8sSUFBSSxPQUFPLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtvQkFDL0IsT0FBTyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztpQkFDN0I7WUFDTCxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVEOzs7Ozs7O09BT0c7SUFDSSxTQUFTLENBQUMscUJBQXFCLEVBQUUsUUFBK0I7UUFDbkUsTUFBTSxPQUFPLEdBQUc7WUFDWixPQUFPLEVBQUcsSUFBSSxNQUFNLENBQUMscUJBQXFCLENBQUM7WUFDM0MsUUFBUSxFQUFHLFFBQVE7U0FDdEIsQ0FBQztRQUNGLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzVCLE9BQU8sR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ2xELENBQUM7OztZQWhDSixVQUFVLFNBQUMsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFOzs7O1lBZHpCLEdBQUc7OztBQWtEWixDQUFDLFVBQVUsTUFBTSxFQUFFLFFBQVE7SUFDdkIsWUFBWSxDQUFDO0lBQ2Isa0RBQWtEO0lBQ2xELFNBQVMsU0FBUyxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUUsR0FBRztRQUM5QixHQUFHLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUM7UUFDaEMsT0FBTyxDQUFDLEdBQUcsSUFBSSxLQUFLLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxNQUFNLEdBQUcsS0FBSyxJQUFJLEdBQUcsQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDLElBQUksU0FBUyxDQUFDO0lBQy9GLENBQUM7SUFDRCxTQUFTLE9BQU8sQ0FBQyxHQUFHLEVBQUUsT0FBTztRQUN6QixPQUFPLEdBQUcsSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFDRCxTQUFTLFdBQVcsQ0FBQyxHQUFHO1FBQ3BCLE1BQU0sR0FBRyxHQUFHLFNBQVMsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsT0FBTyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxFQUNoRSxJQUFJLEdBQUcsRUFBRSxDQUFDO1FBQ2QsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxLQUFLLENBQUMsRUFBRTtZQUNqQyxNQUFNLE9BQU8sR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2pDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDbEMsQ0FBQyxDQUFDLENBQUM7UUFDSCxPQUFPLElBQUksQ0FBQztJQUNoQixDQUFDO0lBQ0QsU0FBUyxjQUFjLENBQUMsR0FBRztRQUN2QixPQUFPLFNBQVMsQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUUsT0FBTyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ3RFLENBQUM7SUFDRCxTQUFTLGFBQWEsQ0FBQyxHQUFHO1FBQ3RCLE9BQU87WUFDSCxTQUFTLEVBQUUsY0FBYyxDQUFDLEdBQUcsQ0FBQztZQUM5QixNQUFNLEVBQUUsV0FBVyxDQUFDLEdBQUcsQ0FBQztTQUMzQixDQUFDO0lBQ04sQ0FBQztJQUNELE1BQU0sQ0FBQyxlQUFlLENBQUMsR0FBRyxVQUFVLEdBQUc7UUFDbkMsTUFBTSxhQUFhLEdBQUcsTUFBTSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQzlDLElBQUksYUFBYSxDQUFDLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxFQUFFO1lBQ3JELE1BQU0sT0FBTyxHQUFHLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNuQyxNQUFNLENBQUMsR0FBRyxJQUFJLE1BQU0sQ0FBQyxhQUFhLENBQUMsQ0FBQyw0QkFBNEIsRUFBRTtnQkFDOUQsUUFBUSxFQUFFO29CQUNOLFNBQVMsRUFBRSxPQUFPO2lCQUNyQjthQUNKLENBQUMsQ0FBQztZQUNILFFBQVEsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDN0I7UUFDRCxhQUFhLENBQUMsT0FBTyxHQUFHLEdBQUcsQ0FBQztJQUNoQyxDQUFDLENBQUM7QUFDTixDQUFDLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IEFwcCB9IGZyb20gJ0B3bS9jb3JlJztcblxuZGVjbGFyZSBjb25zdCBfO1xuXG5pbnRlcmZhY2UgTWVzc2FnZSB7XG4gICAgYWRkcmVzczogc3RyaW5nO1xuICAgIGRhdGE6IE1hcDxzdHJpbmcsIHN0cmluZz47XG59XG5cbmludGVyZmFjZSBIYW5kbGVyIHtcbiAgICBwYXR0ZXJuOiBzdHJpbmc7XG4gICAgY2FsbGJhY2s6IChtc2c6IHN0cmluZykgPT4gYW55O1xufVxuXG5ASW5qZWN0YWJsZSh7IHByb3ZpZGVkSW46ICdyb290JyB9KVxuZXhwb3J0IGNsYXNzIEV4dEFwcE1lc3NhZ2VTZXJ2aWNlIHtcblxuICAgIHByaXZhdGUgaGFuZGxlcnMgPSBbXTtcblxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgYXBwOiBBcHApIHtcbiAgICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignZXh0ZXJuYWxBcHBNZXNzYWdlUmVjZWl2ZWQnLCBlID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSAoZVsnZGV0YWlsJ10ubWVzc2FnZSkgYXMgTWVzc2FnZTtcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlcnMuZm9yRWFjaChoYW5kbGVyID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBtYXRjaGVzID0gaGFuZGxlciAmJiBtZXNzYWdlLmFkZHJlc3MubWF0Y2goaGFuZGxlci5wYXR0ZXJuKTtcbiAgICAgICAgICAgICAgICBpZiAobWF0Y2hlcyAmJiBtYXRjaGVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgaGFuZGxlci5jYWxsQmFjayhtZXNzYWdlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogYWRkcyBhIGxpc3RlbmVyIGZvciBhIG1lc3NhZ2Ugd2hvc2UgYWRkcmVzcyBtYXRjaGVzIHdpdGggdGhlIGdpdmVuIHJlZ2V4IHBhdHRlcm4uXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbWVzc2FnZUFkZHJlc3NQYXR0ZXJuIGEgcmVnZXggcGF0dGVybiB0aGF0IGlzIHVzZWQgdG8gdGFyZ2V0IG1lc3NhZ2VzIHRvIGxpc3Rlbi5cbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBsaXN0ZW5lciBmdW5jdGlvbiB0byBpbnZva2Ugd2hlbiBtZXNzYWdlIHRoYXQgbWF0Y2hlcyByZWdleCBpcyByZWNlaXZlZC5cbiAgICAgKiAgICAgICAgICAgICAgICAgIG1lc3NhZ2UgcmVjZWl2ZWQgd2lsbCBiZSBzZW50IGFzIGZpcnN0IGFyZ3VtZW50LlxuICAgICAqIEByZXR1cm5zIHtGdW5jdGlvbn0gYSBmdW5jdGlvbiB3aGljaCByZW1vdmVzIHRoZSBsaXN0ZW5lciB3aGVuIGludm9rZWQuXG4gICAgICovXG4gICAgcHVibGljIHN1YnNjcmliZShtZXNzYWdlQWRkcmVzc1BhdHRlcm4sIGxpc3RlbmVyOiAobXNnOiBNZXNzYWdlKSA9PiBhbnkpIHtcbiAgICAgICAgY29uc3QgaGFuZGxlciA9IHtcbiAgICAgICAgICAgIHBhdHRlcm4gOiBuZXcgUmVnRXhwKG1lc3NhZ2VBZGRyZXNzUGF0dGVybiksXG4gICAgICAgICAgICBjYWxsQmFjayA6IGxpc3RlbmVyXG4gICAgICAgIH07XG4gICAgICAgIHRoaXMuaGFuZGxlcnMucHVzaChoYW5kbGVyKTtcbiAgICAgICAgcmV0dXJuICgpID0+IF8ucmVtb3ZlKHRoaXMuaGFuZGxlcnMsIGhhbmRsZXIpO1xuICAgIH1cblxufVxuXG4oZnVuY3Rpb24gKHdpbmRvdywgZG9jdW1lbnQpIHtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgLy8gbGlzdGVuIGFwcC10by1hcHAgY29tbXVuaWNhdGlvbiB2aWEgdXJsIHNjaGVtZXNcbiAgICBmdW5jdGlvbiBzdWJTdHJpbmcoc3RyLCBiZWdpbiwgZW5kKSB7XG4gICAgICAgIGVuZCA9IGVuZCA8IDAgPyB1bmRlZmluZWQgOiBlbmQ7XG4gICAgICAgIHJldHVybiAoc3RyICYmIGJlZ2luID49IDAgJiYgc3RyLmxlbmd0aCA+IGJlZ2luICYmIHN0ci5zdWJzdHJpbmcoYmVnaW4sIGVuZCkpIHx8IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgZnVuY3Rpb24gaW5kZXhPZihzdHIsIHBhdHRlcm4pIHtcbiAgICAgICAgcmV0dXJuIHN0ciAmJiBzdHIuaW5kZXhPZihwYXR0ZXJuKTtcbiAgICB9XG4gICAgZnVuY3Rpb24gZXh0cmFjdERhdGEodXJsKSB7XG4gICAgICAgIGNvbnN0IHN0ciA9IHN1YlN0cmluZyh1cmwsIGluZGV4T2YodXJsLCAnPycpICsgMSwgaW5kZXhPZih1cmwsICcjJykpLFxuICAgICAgICAgICAgZGF0YSA9IHt9O1xuICAgICAgICBfLmZvckVhY2goXy5zcGxpdChzdHIsICcmJyksIGVudHJ5ID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGVzcGxpdHMgPSBlbnRyeS5zcGxpdCgnPScpO1xuICAgICAgICAgICAgZGF0YVtlc3BsaXRzWzBdXSA9IGVzcGxpdHNbMV07XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gZGF0YTtcbiAgICB9XG4gICAgZnVuY3Rpb24gZXh0cmFjdEFkZHJlc3ModXJsKSB7XG4gICAgICAgIHJldHVybiBzdWJTdHJpbmcodXJsLCBpbmRleE9mKHVybCwgJzovLycpICsgMywgaW5kZXhPZih1cmwsICc/JykpO1xuICAgIH1cbiAgICBmdW5jdGlvbiBjcmVhdGVNZXNzYWdlKHVybCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ2FkZHJlc3MnOiBleHRyYWN0QWRkcmVzcyh1cmwpLFxuICAgICAgICAgICAgJ2RhdGEnOiBleHRyYWN0RGF0YSh1cmwpXG4gICAgICAgIH07XG4gICAgfVxuICAgIHdpbmRvd1snaGFuZGxlT3BlblVSTCddID0gZnVuY3Rpb24gKHVybCkge1xuICAgICAgICBjb25zdCBoYW5kbGVPcGVuVVJMID0gd2luZG93WydoYW5kbGVPcGVuVVJMJ107XG4gICAgICAgIGlmIChoYW5kbGVPcGVuVVJMLmlzUmVhZHkgJiYgIV8uc3RhcnRzV2l0aCh1cmwsICdodHRwJykpIHtcbiAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBjcmVhdGVNZXNzYWdlKHVybCk7XG4gICAgICAgICAgICBjb25zdCBlID0gbmV3IHdpbmRvd1snQ3VzdG9tRXZlbnQnXSgnZXh0ZXJuYWxBcHBNZXNzYWdlUmVjZWl2ZWQnLCB7XG4gICAgICAgICAgICAgICAgJ2RldGFpbCc6IHtcbiAgICAgICAgICAgICAgICAgICAgJ21lc3NhZ2UnOiBtZXNzYWdlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBkb2N1bWVudC5kaXNwYXRjaEV2ZW50KGUpO1xuICAgICAgICB9XG4gICAgICAgIGhhbmRsZU9wZW5VUkwubGFzdFVSTCA9IHVybDtcbiAgICB9O1xufSh3aW5kb3csIGRvY3VtZW50KSk7XG4iXX0=