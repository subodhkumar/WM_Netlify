import { Injectable } from '@angular/core';
import { AbstractHttpService } from '@wm/core';
var cache = new Map();
var AppResourceManagerService = /** @class */ (function () {
    function AppResourceManagerService($http) {
        this.$http = $http;
    }
    AppResourceManagerService.prototype.get = function (url, useCache) {
        var cachedResponse = cache.get(url);
        if (cachedResponse) {
            return Promise.resolve(cachedResponse);
        }
        return this.$http.get(url).then(function (response) {
            if (useCache) {
                cache.set(url, response);
            }
            return response;
        });
    };
    AppResourceManagerService.prototype.clearCache = function () {
        cache.clear();
    };
    AppResourceManagerService.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    AppResourceManagerService.ctorParameters = function () { return [
        { type: AbstractHttpService }
    ]; };
    return AppResourceManagerService;
}());
export { AppResourceManagerService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLXJlc291cmNlLW1hbmFnZXIuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9ydW50aW1lL2R5bmFtaWMvIiwic291cmNlcyI6WyJhcHAvc2VydmljZXMvYXBwLXJlc291cmNlLW1hbmFnZXIuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRTNDLE9BQU8sRUFBRSxtQkFBbUIsRUFBTyxNQUFNLFVBQVUsQ0FBQztBQUVwRCxJQUFNLEtBQUssR0FBRyxJQUFJLEdBQUcsRUFBa0IsQ0FBQztBQUV4QztJQXNCSSxtQ0FBb0IsS0FBMEI7UUFBMUIsVUFBSyxHQUFMLEtBQUssQ0FBcUI7SUFBRyxDQUFDO0lBbkJsRCx1Q0FBRyxHQUFILFVBQUksR0FBVyxFQUFFLFFBQWtCO1FBQy9CLElBQU0sY0FBYyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7UUFFdEMsSUFBSSxjQUFjLEVBQUU7WUFDaEIsT0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxDQUFDO1NBQzFDO1FBRUQsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQSxRQUFRO1lBQ3BDLElBQUksUUFBUSxFQUFFO2dCQUNWLEtBQUssQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQyxDQUFDO2FBQzVCO1lBQ0QsT0FBTyxRQUFRLENBQUM7UUFDcEIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBRU0sOENBQVUsR0FBakI7UUFDSSxLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDbEIsQ0FBQzs7Z0JBcEJKLFVBQVU7Ozs7Z0JBSkYsbUJBQW1COztJQTJCNUIsZ0NBQUM7Q0FBQSxBQXZCRCxJQXVCQztTQXRCWSx5QkFBeUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IEFic3RyYWN0SHR0cFNlcnZpY2UsIEFwcCB9IGZyb20gJ0B3bS9jb3JlJztcblxuY29uc3QgY2FjaGUgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nPigpO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgQXBwUmVzb3VyY2VNYW5hZ2VyU2VydmljZSB7XG5cbiAgICBnZXQodXJsOiBzdHJpbmcsIHVzZUNhY2hlPzogYm9vbGVhbik6IHN0cmluZyB8IGFueSB7XG4gICAgICAgIGNvbnN0IGNhY2hlZFJlc3BvbnNlID0gY2FjaGUuZ2V0KHVybCk7XG5cbiAgICAgICAgaWYgKGNhY2hlZFJlc3BvbnNlKSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGNhY2hlZFJlc3BvbnNlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLiRodHRwLmdldCh1cmwpLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgaWYgKHVzZUNhY2hlKSB7XG4gICAgICAgICAgICAgICAgY2FjaGUuc2V0KHVybCwgcmVzcG9uc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY2xlYXJDYWNoZSgpIHtcbiAgICAgICAgY2FjaGUuY2xlYXIoKTtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlICRodHRwOiBBYnN0cmFjdEh0dHBTZXJ2aWNlKSB7fVxufVxuIl19