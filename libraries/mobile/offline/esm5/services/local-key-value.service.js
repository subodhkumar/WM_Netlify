import { Injectable } from '@angular/core';
import * as i0 from "@angular/core";
var LocalKeyValueService = /** @class */ (function () {
    function LocalKeyValueService() {
    }
    /**
     * retrieves the value mapped to the key.
     *
     * @param {string} key key
     * @returns {object} a promise that is resolved when value is retrieved from store.
     */
    LocalKeyValueService.prototype.get = function (key) {
        return this.fetchEntry(key)
            .then(function (result) {
            var value;
            if (result && result.length > 0) {
                value = result[0].value;
                if (value) {
                    value = JSON.parse(value);
                }
            }
            return value;
        });
    };
    /**
     * Initializes the service with the given store.
     *
     * @param {object} storeToUse a store with id, key, value with fields.
     * @returns {object} a promise that is resolved when data is persisted.
     */
    LocalKeyValueService.prototype.init = function (storeToUse) {
        this.store = storeToUse;
    };
    /**
     * clear data in all databases.
     *
     * @param {string} key key
     * @param {string} value value
     * @returns {object} a promise that is resolved when data is persisted.
     */
    LocalKeyValueService.prototype.put = function (key, value) {
        var _this = this;
        if (value) {
            value = JSON.stringify(value);
        }
        return this.fetchEntry(key).then(function (result) {
            if (result && result.length > 0) {
                return _this.store.save({
                    'id': result[0].id,
                    'key': key,
                    'value': value
                });
            }
            return _this.store.add({
                'key': key,
                'value': value
            });
        });
    };
    /**
     * clear data in all databases.
     *
     * @param {string} key key
     * @returns {object} a promise that is resolved when respective value is removed from store.
     */
    LocalKeyValueService.prototype.remove = function (key) {
        var _this = this;
        return this.fetchEntry(key).then(function (result) {
            if (result && result.length > 0) {
                return _this.store.delete(result[0].id);
            }
        });
    };
    LocalKeyValueService.prototype.fetchEntry = function (key) {
        var filterCriteria = [{
                'attributeName': 'key',
                'attributeValue': key,
                'attributeType': 'STRING',
                'filterCondition': 'EQUALS'
            }];
        return this.store.filter(filterCriteria);
    };
    LocalKeyValueService.decorators = [
        { type: Injectable, args: [{ providedIn: 'root' },] }
    ];
    LocalKeyValueService.ngInjectableDef = i0.defineInjectable({ factory: function LocalKeyValueService_Factory() { return new LocalKeyValueService(); }, token: LocalKeyValueService, providedIn: "root" });
    return LocalKeyValueService;
}());
export { LocalKeyValueService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYWwta2V5LXZhbHVlLnNlcnZpY2UuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vbW9iaWxlL29mZmxpbmUvIiwic291cmNlcyI6WyJzZXJ2aWNlcy9sb2NhbC1rZXktdmFsdWUuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDOztBQUkzQztJQUFBO0tBb0ZDO0lBL0VHOzs7OztPQUtHO0lBQ0ksa0NBQUcsR0FBVixVQUFXLEdBQVc7UUFDbEIsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQzthQUN0QixJQUFJLENBQUMsVUFBQSxNQUFNO1lBQ1IsSUFBSSxLQUFLLENBQUM7WUFDVixJQUFJLE1BQU0sSUFBSSxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDN0IsS0FBSyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7Z0JBQ3hCLElBQUksS0FBSyxFQUFFO29CQUNQLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO2lCQUM3QjthQUNKO1lBQ0QsT0FBTyxLQUFLLENBQUM7UUFDakIsQ0FBQyxDQUFDLENBQUM7SUFDWCxDQUFDO0lBRUQ7Ozs7O09BS0c7SUFDSSxtQ0FBSSxHQUFYLFVBQVksVUFBd0I7UUFDaEMsSUFBSSxDQUFDLEtBQUssR0FBRyxVQUFVLENBQUM7SUFDNUIsQ0FBQztJQUVEOzs7Ozs7T0FNRztJQUNJLGtDQUFHLEdBQVYsVUFBVyxHQUFHLEVBQUUsS0FBSztRQUFyQixpQkFpQkM7UUFoQkcsSUFBSSxLQUFLLEVBQUU7WUFDUCxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUNqQztRQUNELE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBQSxNQUFNO1lBQ25DLElBQUksTUFBTSxJQUFJLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUM3QixPQUFPLEtBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO29CQUNuQixJQUFJLEVBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7b0JBQ25CLEtBQUssRUFBRyxHQUFHO29CQUNYLE9BQU8sRUFBRyxLQUFLO2lCQUNsQixDQUFDLENBQUM7YUFDTjtZQUNELE9BQU8sS0FBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUM7Z0JBQ2xCLEtBQUssRUFBRyxHQUFHO2dCQUNYLE9BQU8sRUFBRyxLQUFLO2FBQ2xCLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0kscUNBQU0sR0FBYixVQUFjLEdBQUc7UUFBakIsaUJBTUM7UUFMRyxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQUEsTUFBTTtZQUNuQyxJQUFJLE1BQU0sSUFBSSxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDN0IsT0FBTyxLQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7YUFDMUM7UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTyx5Q0FBVSxHQUFsQixVQUFtQixHQUFHO1FBQ2xCLElBQU0sY0FBYyxHQUFHLENBQUM7Z0JBQ3BCLGVBQWUsRUFBRyxLQUFLO2dCQUN2QixnQkFBZ0IsRUFBRyxHQUFHO2dCQUN0QixlQUFlLEVBQUcsUUFBUTtnQkFDMUIsaUJBQWlCLEVBQUcsUUFBUTthQUMvQixDQUFDLENBQUM7UUFDSCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQzdDLENBQUM7O2dCQW5GSixVQUFVLFNBQUMsRUFBQyxVQUFVLEVBQUUsTUFBTSxFQUFDOzs7K0JBSmhDO0NBd0ZDLEFBcEZELElBb0ZDO1NBbkZZLG9CQUFvQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgTG9jYWxEQlN0b3JlIH0gZnJvbSAnLi4vbW9kZWxzL2xvY2FsLWRiLXN0b3JlJztcblxuQEluamVjdGFibGUoe3Byb3ZpZGVkSW46ICdyb290J30pXG5leHBvcnQgY2xhc3MgTG9jYWxLZXlWYWx1ZVNlcnZpY2Uge1xuXG4gICAgcHJpdmF0ZSBzdG9yZTogTG9jYWxEQlN0b3JlO1xuXG4gICAgLyoqXG4gICAgICogcmV0cmlldmVzIHRoZSB2YWx1ZSBtYXBwZWQgdG8gdGhlIGtleS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSBrZXkga2V5XG4gICAgICogQHJldHVybnMge29iamVjdH0gYSBwcm9taXNlIHRoYXQgaXMgcmVzb2x2ZWQgd2hlbiB2YWx1ZSBpcyByZXRyaWV2ZWQgZnJvbSBzdG9yZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0KGtleTogc3RyaW5nKTogYW55IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2hFbnRyeShrZXkpXG4gICAgICAgICAgICAudGhlbihyZXN1bHQgPT4ge1xuICAgICAgICAgICAgICAgIGxldCB2YWx1ZTtcbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0ICYmIHJlc3VsdC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlID0gcmVzdWx0WzBdLnZhbHVlO1xuICAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gSlNPTi5wYXJzZSh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZXMgdGhlIHNlcnZpY2Ugd2l0aCB0aGUgZ2l2ZW4gc3RvcmUuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gc3RvcmVUb1VzZSBhIHN0b3JlIHdpdGggaWQsIGtleSwgdmFsdWUgd2l0aCBmaWVsZHMuXG4gICAgICogQHJldHVybnMge29iamVjdH0gYSBwcm9taXNlIHRoYXQgaXMgcmVzb2x2ZWQgd2hlbiBkYXRhIGlzIHBlcnNpc3RlZC5cbiAgICAgKi9cbiAgICBwdWJsaWMgaW5pdChzdG9yZVRvVXNlOiBMb2NhbERCU3RvcmUpIHtcbiAgICAgICAgdGhpcy5zdG9yZSA9IHN0b3JlVG9Vc2U7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogY2xlYXIgZGF0YSBpbiBhbGwgZGF0YWJhc2VzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGtleSBrZXlcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gdmFsdWUgdmFsdWVcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBhIHByb21pc2UgdGhhdCBpcyByZXNvbHZlZCB3aGVuIGRhdGEgaXMgcGVyc2lzdGVkLlxuICAgICAqL1xuICAgIHB1YmxpYyBwdXQoa2V5LCB2YWx1ZSkge1xuICAgICAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgICAgIHZhbHVlID0gSlNPTi5zdHJpbmdpZnkodmFsdWUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoRW50cnkoa2V5KS50aGVuKHJlc3VsdCA9PiB7XG4gICAgICAgICAgICBpZiAocmVzdWx0ICYmIHJlc3VsdC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3RvcmUuc2F2ZSh7XG4gICAgICAgICAgICAgICAgICAgICdpZCcgOiByZXN1bHRbMF0uaWQsXG4gICAgICAgICAgICAgICAgICAgICdrZXknIDoga2V5LFxuICAgICAgICAgICAgICAgICAgICAndmFsdWUnIDogdmFsdWVcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0aGlzLnN0b3JlLmFkZCh7XG4gICAgICAgICAgICAgICAgJ2tleScgOiBrZXksXG4gICAgICAgICAgICAgICAgJ3ZhbHVlJyA6IHZhbHVlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogY2xlYXIgZGF0YSBpbiBhbGwgZGF0YWJhc2VzLlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGtleSBrZXlcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBhIHByb21pc2UgdGhhdCBpcyByZXNvbHZlZCB3aGVuIHJlc3BlY3RpdmUgdmFsdWUgaXMgcmVtb3ZlZCBmcm9tIHN0b3JlLlxuICAgICAqL1xuICAgIHB1YmxpYyByZW1vdmUoa2V5KSB7XG4gICAgICAgIHJldHVybiB0aGlzLmZldGNoRW50cnkoa2V5KS50aGVuKHJlc3VsdCA9PiB7XG4gICAgICAgICAgICBpZiAocmVzdWx0ICYmIHJlc3VsdC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3RvcmUuZGVsZXRlKHJlc3VsdFswXS5pZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgZmV0Y2hFbnRyeShrZXkpIHtcbiAgICAgICAgY29uc3QgZmlsdGVyQ3JpdGVyaWEgPSBbe1xuICAgICAgICAgICAgJ2F0dHJpYnV0ZU5hbWUnIDogJ2tleScsXG4gICAgICAgICAgICAnYXR0cmlidXRlVmFsdWUnIDoga2V5LFxuICAgICAgICAgICAgJ2F0dHJpYnV0ZVR5cGUnIDogJ1NUUklORycsXG4gICAgICAgICAgICAnZmlsdGVyQ29uZGl0aW9uJyA6ICdFUVVBTFMnXG4gICAgICAgIH1dO1xuICAgICAgICByZXR1cm4gdGhpcy5zdG9yZS5maWx0ZXIoZmlsdGVyQ3JpdGVyaWEpO1xuICAgIH1cbn1cbiJdfQ==