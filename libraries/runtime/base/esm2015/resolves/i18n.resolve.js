import { Injectable } from '@angular/core';
import { AbstractI18nService } from '@wm/core';
export class I18nResolve {
    constructor(i18nService) {
        this.i18nService = i18nService;
    }
    resolve() {
        return this.i18nService.loadDefaultLocale();
    }
}
I18nResolve.decorators = [
    { type: Injectable }
];
/** @nocollapse */
I18nResolve.ctorParameters = () => [
    { type: AbstractI18nService }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaTE4bi5yZXNvbHZlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL3J1bnRpbWUvYmFzZS8iLCJzb3VyY2VzIjpbInJlc29sdmVzL2kxOG4ucmVzb2x2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRzNDLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUcvQyxNQUFNLE9BQU8sV0FBVztJQUVwQixZQUFvQixXQUFnQztRQUFoQyxnQkFBVyxHQUFYLFdBQVcsQ0FBcUI7SUFBRyxDQUFDO0lBRXhELE9BQU87UUFDSCxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztJQUNoRCxDQUFDOzs7WUFQSixVQUFVOzs7O1lBRkYsbUJBQW1CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgUmVzb2x2ZSB9IGZyb20gJ0Bhbmd1bGFyL3JvdXRlcic7XG5cbmltcG9ydCB7IEFic3RyYWN0STE4blNlcnZpY2UgfSBmcm9tICdAd20vY29yZSc7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBJMThuUmVzb2x2ZSBpbXBsZW1lbnRzIFJlc29sdmU8YW55PiB7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGkxOG5TZXJ2aWNlOiBBYnN0cmFjdEkxOG5TZXJ2aWNlKSB7fVxuXG4gICAgcmVzb2x2ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaTE4blNlcnZpY2UubG9hZERlZmF1bHRMb2NhbGUoKTtcbiAgICB9XG59XG4iXX0=