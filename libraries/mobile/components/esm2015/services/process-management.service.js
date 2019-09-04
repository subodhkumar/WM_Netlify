import { Injectable } from '@angular/core';
import * as i0 from "@angular/core";
export class ProcessManagementService {
    setUIComponent(processManagerComponent) {
        this.processManagerComponent = processManagerComponent;
    }
    /**
     * Returns a promise that will be resolved when an instance is available. At max, 3 instances can only run
     * in parallel and rest has to wait till a process is completed.
     *
     * A progress instance has the following properties.
     *
     *   1) min {number} minimum value, default value is 0 </br>
     *   2) max {number} maximum value, default value is 100 </br>
     *   3) value {number} progress value </br>
     *   4) progressLabel {string} process name </br>
     *   5) stopButtonLabel {string} label for stop button, default value is 'Cancel' </br>
     *   6) onStop {function} function to invoke when stop button is clicked. </br>
     *
     * A progress instance has 3 methods </br>
     *   1) set(property, value) -- sets value to the corresponding property </br>
     *   2) get(property) -- returns property value </br>
     *   3) destroy() -- closes the instance. </br>
     *
     * A progress instance will get auto closed when value and max are equal or when destroy method is called.
     *
     * @param {string} name name of the process whose progress is going to be shown
     * @param {number} min minimum value
     * @param {number} max maximum value
     *
     * @returns {object} a promise
     */
    createInstance(name, min, max) {
        if (!this.processManagerComponent) {
            return Promise.reject('ProcessManagerComponent is missing');
        }
        return this.processManagerComponent.createInstance(name, min, max);
    }
}
ProcessManagementService.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
ProcessManagementService.ngInjectableDef = i0.defineInjectable({ factory: function ProcessManagementService_Factory() { return new ProcessManagementService(); }, token: ProcessManagementService, providedIn: "root" });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvY2Vzcy1tYW5hZ2VtZW50LnNlcnZpY2UuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vbW9iaWxlL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJzZXJ2aWNlcy9wcm9jZXNzLW1hbmFnZW1lbnQuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDOztBQUszQyxNQUFNLE9BQU8sd0JBQXdCO0lBSWpDLGNBQWMsQ0FBQyx1QkFBZ0Q7UUFDM0QsSUFBSSxDQUFDLHVCQUF1QixHQUFHLHVCQUF1QixDQUFDO0lBQzNELENBQUM7SUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztPQXlCRztJQUNJLGNBQWMsQ0FBQyxJQUFZLEVBQUUsR0FBWSxFQUFFLEdBQVk7UUFDMUQsSUFBSSxDQUFDLElBQUksQ0FBQyx1QkFBdUIsRUFBRTtZQUMvQixPQUFPLE9BQU8sQ0FBQyxNQUFNLENBQUMsb0NBQW9DLENBQUMsQ0FBQztTQUMvRDtRQUNELE9BQU8sSUFBSSxDQUFDLHVCQUF1QixDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ3ZFLENBQUM7OztZQXhDSixVQUFVLFNBQUMsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBQcm9jZXNzTWFuYWdlckNvbXBvbmVudCwgUHJvY2Vzc0FwaSB9IGZyb20gJy4uL3dpZGdldHMvcHJvY2Vzcy1tYW5hZ2VyL3Byb2Nlc3MtbWFuYWdlci5jb21wb25lbnQnO1xuXG5ASW5qZWN0YWJsZSh7IHByb3ZpZGVkSW46ICdyb290JyB9KVxuZXhwb3J0IGNsYXNzIFByb2Nlc3NNYW5hZ2VtZW50U2VydmljZSB7XG5cbiAgICBwcml2YXRlIHByb2Nlc3NNYW5hZ2VyQ29tcG9uZW50OiBQcm9jZXNzTWFuYWdlckNvbXBvbmVudDtcblxuICAgIHNldFVJQ29tcG9uZW50KHByb2Nlc3NNYW5hZ2VyQ29tcG9uZW50OiBQcm9jZXNzTWFuYWdlckNvbXBvbmVudCkge1xuICAgICAgICB0aGlzLnByb2Nlc3NNYW5hZ2VyQ29tcG9uZW50ID0gcHJvY2Vzc01hbmFnZXJDb21wb25lbnQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyBhIHByb21pc2UgdGhhdCB3aWxsIGJlIHJlc29sdmVkIHdoZW4gYW4gaW5zdGFuY2UgaXMgYXZhaWxhYmxlLiBBdCBtYXgsIDMgaW5zdGFuY2VzIGNhbiBvbmx5IHJ1blxuICAgICAqIGluIHBhcmFsbGVsIGFuZCByZXN0IGhhcyB0byB3YWl0IHRpbGwgYSBwcm9jZXNzIGlzIGNvbXBsZXRlZC5cbiAgICAgKlxuICAgICAqIEEgcHJvZ3Jlc3MgaW5zdGFuY2UgaGFzIHRoZSBmb2xsb3dpbmcgcHJvcGVydGllcy5cbiAgICAgKlxuICAgICAqICAgMSkgbWluIHtudW1iZXJ9IG1pbmltdW0gdmFsdWUsIGRlZmF1bHQgdmFsdWUgaXMgMCA8L2JyPlxuICAgICAqICAgMikgbWF4IHtudW1iZXJ9IG1heGltdW0gdmFsdWUsIGRlZmF1bHQgdmFsdWUgaXMgMTAwIDwvYnI+XG4gICAgICogICAzKSB2YWx1ZSB7bnVtYmVyfSBwcm9ncmVzcyB2YWx1ZSA8L2JyPlxuICAgICAqICAgNCkgcHJvZ3Jlc3NMYWJlbCB7c3RyaW5nfSBwcm9jZXNzIG5hbWUgPC9icj5cbiAgICAgKiAgIDUpIHN0b3BCdXR0b25MYWJlbCB7c3RyaW5nfSBsYWJlbCBmb3Igc3RvcCBidXR0b24sIGRlZmF1bHQgdmFsdWUgaXMgJ0NhbmNlbCcgPC9icj5cbiAgICAgKiAgIDYpIG9uU3RvcCB7ZnVuY3Rpb259IGZ1bmN0aW9uIHRvIGludm9rZSB3aGVuIHN0b3AgYnV0dG9uIGlzIGNsaWNrZWQuIDwvYnI+XG4gICAgICpcbiAgICAgKiBBIHByb2dyZXNzIGluc3RhbmNlIGhhcyAzIG1ldGhvZHMgPC9icj5cbiAgICAgKiAgIDEpIHNldChwcm9wZXJ0eSwgdmFsdWUpIC0tIHNldHMgdmFsdWUgdG8gdGhlIGNvcnJlc3BvbmRpbmcgcHJvcGVydHkgPC9icj5cbiAgICAgKiAgIDIpIGdldChwcm9wZXJ0eSkgLS0gcmV0dXJucyBwcm9wZXJ0eSB2YWx1ZSA8L2JyPlxuICAgICAqICAgMykgZGVzdHJveSgpIC0tIGNsb3NlcyB0aGUgaW5zdGFuY2UuIDwvYnI+XG4gICAgICpcbiAgICAgKiBBIHByb2dyZXNzIGluc3RhbmNlIHdpbGwgZ2V0IGF1dG8gY2xvc2VkIHdoZW4gdmFsdWUgYW5kIG1heCBhcmUgZXF1YWwgb3Igd2hlbiBkZXN0cm95IG1ldGhvZCBpcyBjYWxsZWQuXG4gICAgICpcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBuYW1lIG9mIHRoZSBwcm9jZXNzIHdob3NlIHByb2dyZXNzIGlzIGdvaW5nIHRvIGJlIHNob3duXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1pbiBtaW5pbXVtIHZhbHVlXG4gICAgICogQHBhcmFtIHtudW1iZXJ9IG1heCBtYXhpbXVtIHZhbHVlXG4gICAgICpcbiAgICAgKiBAcmV0dXJucyB7b2JqZWN0fSBhIHByb21pc2VcbiAgICAgKi9cbiAgICBwdWJsaWMgY3JlYXRlSW5zdGFuY2UobmFtZTogc3RyaW5nLCBtaW4/OiBudW1iZXIsIG1heD86IG51bWJlcik6IFByb21pc2U8UHJvY2Vzc0FwaT4ge1xuICAgICAgICBpZiAoIXRoaXMucHJvY2Vzc01hbmFnZXJDb21wb25lbnQpIHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlamVjdCgnUHJvY2Vzc01hbmFnZXJDb21wb25lbnQgaXMgbWlzc2luZycpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLnByb2Nlc3NNYW5hZ2VyQ29tcG9uZW50LmNyZWF0ZUluc3RhbmNlKG5hbWUsIG1pbiwgbWF4KTtcbiAgICB9XG59XG4iXX0=