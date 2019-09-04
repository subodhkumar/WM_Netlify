import { Injectable } from '@angular/core';
import * as i0 from "@angular/core";
export class LocalKeyValueService {
    /**
     * retrieves the value mapped to the key.
     *
     * @param {string} key key
     * @returns {object} a promise that is resolved when value is retrieved from store.
     */
    get(key) {
        return this.fetchEntry(key)
            .then(result => {
            let value;
            if (result && result.length > 0) {
                value = result[0].value;
                if (value) {
                    value = JSON.parse(value);
                }
            }
            return value;
        });
    }
    /**
     * Initializes the service with the given store.
     *
     * @param {object} storeToUse a store with id, key, value with fields.
     * @returns {object} a promise that is resolved when data is persisted.
     */
    init(storeToUse) {
        this.store = storeToUse;
    }
    /**
     * clear data in all databases.
     *
     * @param {string} key key
     * @param {string} value value
     * @returns {object} a promise that is resolved when data is persisted.
     */
    put(key, value) {
        if (value) {
            value = JSON.stringify(value);
        }
        return this.fetchEntry(key).then(result => {
            if (result && result.length > 0) {
                return this.store.save({
                    'id': result[0].id,
                    'key': key,
                    'value': value
                });
            }
            return this.store.add({
                'key': key,
                'value': value
            });
        });
    }
    /**
     * clear data in all databases.
     *
     * @param {string} key key
     * @returns {object} a promise that is resolved when respective value is removed from store.
     */
    remove(key) {
        return this.fetchEntry(key).then(result => {
            if (result && result.length > 0) {
                return this.store.delete(result[0].id);
            }
        });
    }
    fetchEntry(key) {
        const filterCriteria = [{
                'attributeName': 'key',
                'attributeValue': key,
                'attributeType': 'STRING',
                'filterCondition': 'EQUALS'
            }];
        return this.store.filter(filterCriteria);
    }
}
LocalKeyValueService.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
LocalKeyValueService.ngInjectableDef = i0.defineInjectable({ factory: function LocalKeyValueService_Factory() { return new LocalKeyValueService(); }, token: LocalKeyValueService, providedIn: "root" });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYWwta2V5LXZhbHVlLnNlcnZpY2UuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vbW9iaWxlL29mZmxpbmUvIiwic291cmNlcyI6WyJzZXJ2aWNlcy9sb2NhbC1rZXktdmFsdWUuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDOztBQUszQyxNQUFNLE9BQU8sb0JBQW9CO0lBSTdCOzs7OztPQUtHO0lBQ0ksR0FBRyxDQUFDLEdBQVc7UUFDbEIsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQzthQUN0QixJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDWCxJQUFJLEtBQUssQ0FBQztZQUNWLElBQUksTUFBTSxJQUFJLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUM3QixLQUFLLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztnQkFDeEIsSUFBSSxLQUFLLEVBQUU7b0JBQ1AsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7aUJBQzdCO2FBQ0o7WUFDRCxPQUFPLEtBQUssQ0FBQztRQUNqQixDQUFDLENBQUMsQ0FBQztJQUNYLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNJLElBQUksQ0FBQyxVQUF3QjtRQUNoQyxJQUFJLENBQUMsS0FBSyxHQUFHLFVBQVUsQ0FBQztJQUM1QixDQUFDO0lBRUQ7Ozs7OztPQU1HO0lBQ0ksR0FBRyxDQUFDLEdBQUcsRUFBRSxLQUFLO1FBQ2pCLElBQUksS0FBSyxFQUFFO1lBQ1AsS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7U0FDakM7UUFDRCxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQ3RDLElBQUksTUFBTSxJQUFJLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUM3QixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO29CQUNuQixJQUFJLEVBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7b0JBQ25CLEtBQUssRUFBRyxHQUFHO29CQUNYLE9BQU8sRUFBRyxLQUFLO2lCQUNsQixDQUFDLENBQUM7YUFDTjtZQUNELE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUM7Z0JBQ2xCLEtBQUssRUFBRyxHQUFHO2dCQUNYLE9BQU8sRUFBRyxLQUFLO2FBQ2xCLENBQUMsQ0FBQztRQUNQLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVEOzs7OztPQUtHO0lBQ0ksTUFBTSxDQUFDLEdBQUc7UUFDYixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFFO1lBQ3RDLElBQUksTUFBTSxJQUFJLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO2dCQUM3QixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQzthQUMxQztRQUNMLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVPLFVBQVUsQ0FBQyxHQUFHO1FBQ2xCLE1BQU0sY0FBYyxHQUFHLENBQUM7Z0JBQ3BCLGVBQWUsRUFBRyxLQUFLO2dCQUN2QixnQkFBZ0IsRUFBRyxHQUFHO2dCQUN0QixlQUFlLEVBQUcsUUFBUTtnQkFDMUIsaUJBQWlCLEVBQUcsUUFBUTthQUMvQixDQUFDLENBQUM7UUFDSCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQzdDLENBQUM7OztZQW5GSixVQUFVLFNBQUMsRUFBQyxVQUFVLEVBQUUsTUFBTSxFQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBMb2NhbERCU3RvcmUgfSBmcm9tICcuLi9tb2RlbHMvbG9jYWwtZGItc3RvcmUnO1xuXG5ASW5qZWN0YWJsZSh7cHJvdmlkZWRJbjogJ3Jvb3QnfSlcbmV4cG9ydCBjbGFzcyBMb2NhbEtleVZhbHVlU2VydmljZSB7XG5cbiAgICBwcml2YXRlIHN0b3JlOiBMb2NhbERCU3RvcmU7XG5cbiAgICAvKipcbiAgICAgKiByZXRyaWV2ZXMgdGhlIHZhbHVlIG1hcHBlZCB0byB0aGUga2V5LlxuICAgICAqXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IGtleSBrZXlcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBhIHByb21pc2UgdGhhdCBpcyByZXNvbHZlZCB3aGVuIHZhbHVlIGlzIHJldHJpZXZlZCBmcm9tIHN0b3JlLlxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQoa2V5OiBzdHJpbmcpOiBhbnkge1xuICAgICAgICByZXR1cm4gdGhpcy5mZXRjaEVudHJ5KGtleSlcbiAgICAgICAgICAgIC50aGVuKHJlc3VsdCA9PiB7XG4gICAgICAgICAgICAgICAgbGV0IHZhbHVlO1xuICAgICAgICAgICAgICAgIGlmIChyZXN1bHQgJiYgcmVzdWx0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSByZXN1bHRbMF0udmFsdWU7XG4gICAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBKU09OLnBhcnNlKHZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplcyB0aGUgc2VydmljZSB3aXRoIHRoZSBnaXZlbiBzdG9yZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBzdG9yZVRvVXNlIGEgc3RvcmUgd2l0aCBpZCwga2V5LCB2YWx1ZSB3aXRoIGZpZWxkcy5cbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBhIHByb21pc2UgdGhhdCBpcyByZXNvbHZlZCB3aGVuIGRhdGEgaXMgcGVyc2lzdGVkLlxuICAgICAqL1xuICAgIHB1YmxpYyBpbml0KHN0b3JlVG9Vc2U6IExvY2FsREJTdG9yZSkge1xuICAgICAgICB0aGlzLnN0b3JlID0gc3RvcmVUb1VzZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBjbGVhciBkYXRhIGluIGFsbCBkYXRhYmFzZXMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30ga2V5IGtleVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZSB2YWx1ZVxuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IGEgcHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIHdoZW4gZGF0YSBpcyBwZXJzaXN0ZWQuXG4gICAgICovXG4gICAgcHVibGljIHB1dChrZXksIHZhbHVlKSB7XG4gICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgdmFsdWUgPSBKU09OLnN0cmluZ2lmeSh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2hFbnRyeShrZXkpLnRoZW4ocmVzdWx0ID0+IHtcbiAgICAgICAgICAgIGlmIChyZXN1bHQgJiYgcmVzdWx0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zdG9yZS5zYXZlKHtcbiAgICAgICAgICAgICAgICAgICAgJ2lkJyA6IHJlc3VsdFswXS5pZCxcbiAgICAgICAgICAgICAgICAgICAgJ2tleScgOiBrZXksXG4gICAgICAgICAgICAgICAgICAgICd2YWx1ZScgOiB2YWx1ZVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuc3RvcmUuYWRkKHtcbiAgICAgICAgICAgICAgICAna2V5JyA6IGtleSxcbiAgICAgICAgICAgICAgICAndmFsdWUnIDogdmFsdWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBjbGVhciBkYXRhIGluIGFsbCBkYXRhYmFzZXMuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30ga2V5IGtleVxuICAgICAqIEByZXR1cm5zIHtvYmplY3R9IGEgcHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIHdoZW4gcmVzcGVjdGl2ZSB2YWx1ZSBpcyByZW1vdmVkIGZyb20gc3RvcmUuXG4gICAgICovXG4gICAgcHVibGljIHJlbW92ZShrZXkpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZmV0Y2hFbnRyeShrZXkpLnRoZW4ocmVzdWx0ID0+IHtcbiAgICAgICAgICAgIGlmIChyZXN1bHQgJiYgcmVzdWx0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zdG9yZS5kZWxldGUocmVzdWx0WzBdLmlkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBmZXRjaEVudHJ5KGtleSkge1xuICAgICAgICBjb25zdCBmaWx0ZXJDcml0ZXJpYSA9IFt7XG4gICAgICAgICAgICAnYXR0cmlidXRlTmFtZScgOiAna2V5JyxcbiAgICAgICAgICAgICdhdHRyaWJ1dGVWYWx1ZScgOiBrZXksXG4gICAgICAgICAgICAnYXR0cmlidXRlVHlwZScgOiAnU1RSSU5HJyxcbiAgICAgICAgICAgICdmaWx0ZXJDb25kaXRpb24nIDogJ0VRVUFMUydcbiAgICAgICAgfV07XG4gICAgICAgIHJldHVybiB0aGlzLnN0b3JlLmZpbHRlcihmaWx0ZXJDcml0ZXJpYSk7XG4gICAgfVxufVxuIl19