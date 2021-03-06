import { Injectable } from '@angular/core';
var AppDefaultsService = /** @class */ (function () {
    function AppDefaultsService() {
    }
    AppDefaultsService.prototype.setFormats = function (formats) {
        var dateFormat = formats.date;
        var timeFormat = formats.time;
        var dateTimeFormat = (dateFormat && timeFormat) ? dateFormat + ' ' + timeFormat : undefined;
        this.dateFormat = dateFormat;
        this.timeFormat = timeFormat;
        this.dateTimeFormat = dateTimeFormat;
    };
    AppDefaultsService.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    AppDefaultsService.ctorParameters = function () { return []; };
    return AppDefaultsService;
}());
export { AppDefaultsService };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBwLWRlZmF1bHRzLnNlcnZpY2UuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vcnVudGltZS9iYXNlLyIsInNvdXJjZXMiOlsic2VydmljZXMvYXBwLWRlZmF1bHRzLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQU0zQztJQUdJO0lBQ0EsQ0FBQztJQU1ELHVDQUFVLEdBQVYsVUFBVyxPQUFZO1FBQ25CLElBQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUM7UUFDaEMsSUFBTSxVQUFVLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQztRQUNoQyxJQUFNLGNBQWMsR0FBRyxDQUFDLFVBQVUsSUFBSSxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxHQUFHLEdBQUcsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztRQUU5RixJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztRQUM3QixJQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQztRQUM3QixJQUFJLENBQUMsY0FBYyxHQUFHLGNBQWMsQ0FBQztJQUN6QyxDQUFDOztnQkFsQkosVUFBVTs7OztJQW1CWCx5QkFBQztDQUFBLEFBbkJELElBbUJDO1NBbEJZLGtCQUFrQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgQXBwRGVmYXVsdHMgfSBmcm9tICdAd20vY29yZSc7XG5cbmRlY2xhcmUgY29uc3QgXztcblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEFwcERlZmF1bHRzU2VydmljZSBpbXBsZW1lbnRzIEFwcERlZmF1bHRzIHtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgIH1cblxuICAgIGRhdGVGb3JtYXQ6IHN0cmluZztcbiAgICB0aW1lRm9ybWF0OiBzdHJpbmc7XG4gICAgZGF0ZVRpbWVGb3JtYXQ6IHN0cmluZztcblxuICAgIHNldEZvcm1hdHMoZm9ybWF0czogYW55KSB7XG4gICAgICAgIGNvbnN0IGRhdGVGb3JtYXQgPSBmb3JtYXRzLmRhdGU7XG4gICAgICAgIGNvbnN0IHRpbWVGb3JtYXQgPSBmb3JtYXRzLnRpbWU7XG4gICAgICAgIGNvbnN0IGRhdGVUaW1lRm9ybWF0ID0gKGRhdGVGb3JtYXQgJiYgdGltZUZvcm1hdCkgPyBkYXRlRm9ybWF0ICsgJyAnICsgdGltZUZvcm1hdCA6IHVuZGVmaW5lZDtcblxuICAgICAgICB0aGlzLmRhdGVGb3JtYXQgPSBkYXRlRm9ybWF0O1xuICAgICAgICB0aGlzLnRpbWVGb3JtYXQgPSB0aW1lRm9ybWF0O1xuICAgICAgICB0aGlzLmRhdGVUaW1lRm9ybWF0ID0gZGF0ZVRpbWVGb3JtYXQ7XG4gICAgfVxufSJdfQ==