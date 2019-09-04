import { Injectable } from '@angular/core';
import { AbstractI18nService } from '@wm/core';
var I18nResolve = /** @class */ (function () {
    function I18nResolve(i18nService) {
        this.i18nService = i18nService;
    }
    I18nResolve.prototype.resolve = function () {
        return this.i18nService.loadDefaultLocale();
    };
    I18nResolve.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    I18nResolve.ctorParameters = function () { return [
        { type: AbstractI18nService }
    ]; };
    return I18nResolve;
}());
export { I18nResolve };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaTE4bi5yZXNvbHZlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL3J1bnRpbWUvYmFzZS8iLCJzb3VyY2VzIjpbInJlc29sdmVzL2kxOG4ucmVzb2x2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRzNDLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUUvQztJQUdJLHFCQUFvQixXQUFnQztRQUFoQyxnQkFBVyxHQUFYLFdBQVcsQ0FBcUI7SUFBRyxDQUFDO0lBRXhELDZCQUFPLEdBQVA7UUFDSSxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztJQUNoRCxDQUFDOztnQkFQSixVQUFVOzs7O2dCQUZGLG1CQUFtQjs7SUFVNUIsa0JBQUM7Q0FBQSxBQVJELElBUUM7U0FQWSxXQUFXIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgUmVzb2x2ZSB9IGZyb20gJ0Bhbmd1bGFyL3JvdXRlcic7XG5cbmltcG9ydCB7IEFic3RyYWN0STE4blNlcnZpY2UgfSBmcm9tICdAd20vY29yZSc7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBJMThuUmVzb2x2ZSBpbXBsZW1lbnRzIFJlc29sdmU8YW55PiB7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGkxOG5TZXJ2aWNlOiBBYnN0cmFjdEkxOG5TZXJ2aWNlKSB7fVxuXG4gICAgcmVzb2x2ZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaTE4blNlcnZpY2UubG9hZERlZmF1bHRMb2NhbGUoKTtcbiAgICB9XG59XG4iXX0=