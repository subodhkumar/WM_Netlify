import { Injectable } from '@angular/core';
import { AbstractHttpService } from '@wm/core';
const cache = new Map();
export class AppResourceManagerService {
    constructor($http) {
        this.$http = $http;
    }
    get(url, useCache) {
        const cachedResponse = cache.get(url);
        if (cachedResponse) {
            return Promise.resolve(cachedResponse);
        }
        return this.$http.get(url).then(response => {
            if (useCache) {
                cache.set(url, response);
            }
            return response;
        });
    }
    clearCache() {
        cache.clear();
    }
}
AppResourceManagerService.decorators = [
    { type: Injectable }
];
/** @nocollapse */
AppResourceManagerService.ctorParameters = () => [
    { type: AbstractHttpService }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLXJlc291cmNlLW1hbmFnZXIuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9ydW50aW1lL2R5bmFtaWMvIiwic291cmNlcyI6WyJhcHAvc2VydmljZXMvYXBwLXJlc291cmNlLW1hbmFnZXIuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRTNDLE9BQU8sRUFBRSxtQkFBbUIsRUFBTyxNQUFNLFVBQVUsQ0FBQztBQUVwRCxNQUFNLEtBQUssR0FBRyxJQUFJLEdBQUcsRUFBa0IsQ0FBQztBQUd4QyxNQUFNLE9BQU8seUJBQXlCO0lBcUJsQyxZQUFvQixLQUEwQjtRQUExQixVQUFLLEdBQUwsS0FBSyxDQUFxQjtJQUFHLENBQUM7SUFuQmxELEdBQUcsQ0FBQyxHQUFXLEVBQUUsUUFBa0I7UUFDL0IsTUFBTSxjQUFjLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUV0QyxJQUFJLGNBQWMsRUFBRTtZQUNoQixPQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7U0FDMUM7UUFFRCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRTtZQUN2QyxJQUFJLFFBQVEsRUFBRTtnQkFDVixLQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUMsQ0FBQzthQUM1QjtZQUNELE9BQU8sUUFBUSxDQUFDO1FBQ3BCLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVNLFVBQVU7UUFDYixLQUFLLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDbEIsQ0FBQzs7O1lBcEJKLFVBQVU7Ozs7WUFKRixtQkFBbUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBJbmplY3RhYmxlIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IEFic3RyYWN0SHR0cFNlcnZpY2UsIEFwcCB9IGZyb20gJ0B3bS9jb3JlJztcblxuY29uc3QgY2FjaGUgPSBuZXcgTWFwPHN0cmluZywgc3RyaW5nPigpO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgQXBwUmVzb3VyY2VNYW5hZ2VyU2VydmljZSB7XG5cbiAgICBnZXQodXJsOiBzdHJpbmcsIHVzZUNhY2hlPzogYm9vbGVhbik6IHN0cmluZyB8IGFueSB7XG4gICAgICAgIGNvbnN0IGNhY2hlZFJlc3BvbnNlID0gY2FjaGUuZ2V0KHVybCk7XG5cbiAgICAgICAgaWYgKGNhY2hlZFJlc3BvbnNlKSB7XG4gICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGNhY2hlZFJlc3BvbnNlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLiRodHRwLmdldCh1cmwpLnRoZW4ocmVzcG9uc2UgPT4ge1xuICAgICAgICAgICAgaWYgKHVzZUNhY2hlKSB7XG4gICAgICAgICAgICAgICAgY2FjaGUuc2V0KHVybCwgcmVzcG9uc2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY2xlYXJDYWNoZSgpIHtcbiAgICAgICAgY2FjaGUuY2xlYXIoKTtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlICRodHRwOiBBYnN0cmFjdEh0dHBTZXJ2aWNlKSB7fVxufVxuIl19