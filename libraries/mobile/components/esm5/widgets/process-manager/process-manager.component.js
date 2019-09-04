import { Component, ElementRef } from '@angular/core';
import { addClass, removeAttr, setAttr } from '@wm/core';
import { provideAsWidgetRef } from '@wm/components';
var MAX_PROCESS = 3;
var ProcessManagerComponent = /** @class */ (function () {
    function ProcessManagerComponent(el) {
        this.el = el;
        this.isVisible = true;
        this.instances = [];
        this.queue = [];
        addClass(this.el.nativeElement, 'app-global-progress-bar modal default');
    }
    ProcessManagerComponent.prototype.createInstance = function (name, min, max) {
        var _this = this;
        if (min === void 0) { min = 0; }
        if (max === void 0) { max = 100; }
        var instance = {
            max: max,
            min: min,
            name: name,
            onStop: null,
            progressLabel: '',
            show: min !== max,
            stopButtonLabel: 'Cancel',
            value: 0
        };
        var api = {
            get: function (propertyName) { return instance[propertyName]; },
            set: function (propertyName, propertyValue) { return _this.setInstaceProperty(instance, propertyName, propertyValue); },
            destroy: function () { return _this.removeInstance(instance); }
        };
        return this.addToQueue(instance).then(function () { return api; });
    };
    ProcessManagerComponent.prototype.getVisibleInstances = function () {
        return this.instances.filter(function (i) { return i.show; });
    };
    ProcessManagerComponent.prototype.ngDoCheck = function () {
        var hasInstancesToShow = !!this.instances.find(function (i) { return i.show; });
        if (this.isVisible && !hasInstancesToShow) {
            setAttr(this.el.nativeElement, 'hidden', 'true');
            this.isVisible = false;
        }
        else if (!this.isVisible && hasInstancesToShow) {
            removeAttr(this.el.nativeElement, 'hidden');
            this.isVisible = true;
        }
    };
    ProcessManagerComponent.prototype.addToQueue = function (instance) {
        var _this = this;
        return new Promise(function (resolve) {
            _this.queue.push(function () {
                if (_this.instances.length < MAX_PROCESS) {
                    _this.instances.push(instance);
                    resolve(instance);
                }
                else {
                    return false;
                }
            });
            _this.flushQueue();
        });
    };
    ProcessManagerComponent.prototype.flushQueue = function () {
        if (this.queue.length > 0 && this.queue[0]() !== false) {
            this.queue.shift();
            this.flushQueue();
        }
    };
    ProcessManagerComponent.prototype.removeInstance = function (instance) {
        var _this = this;
        return new Promise(function (resolve) {
            setTimeout(function () {
                _.remove(_this.instances, instance);
                _this.flushQueue();
                resolve();
            }, 1000);
        });
    };
    ProcessManagerComponent.prototype.setInstaceProperty = function (instance, propertyName, propertyValue) {
        var _this = this;
        if (propertyName === 'value') {
            if (instance.value >= instance.max) {
                propertyValue = instance.max;
            }
            instance.value = propertyValue;
            instance.progressLabel = instance.value + '/' + instance.max;
        }
        else if (propertyName === 'onStop' && _.isFunction(propertyValue)) {
            instance.onStop = function () {
                propertyValue();
                return _this.removeInstance(instance);
            };
        }
        else {
            instance[propertyName] = propertyValue;
        }
        instance.show = instance.min !== instance.max;
    };
    ProcessManagerComponent.decorators = [
        { type: Component, args: [{
                    selector: '[wmProcessManager]',
                    template: "<ng-container *ngIf=\"instances.length > 0\">\n   <div class=\"modal-dialog app-dialog\">\n       <div class=\"modal-content\">\n           <ul class=\"instance-list list-unstyled\">\n               <li *ngFor=\"let instance of getVisibleInstances(instances); index as i\" class=\"instance-list-item\">\n                   <div class=\"row\">\n                       <div class=\"col-xs-8\">\n                           <label class=\"app-global-progress-bar-name h6\">{{instance.name}}</label>\n                       </div>\n                       <div class=\"col-xs-4 app-global-progress-bar-progress-label-col\">\n                           <label class=\"app-global-progress-bar-progress-label h6\">\n                                   {{instance.progressLabel}}</label>\n                       </div>\n                   </div>\n                   <ng-template [ngTemplateOutlet]=\"progressTemplate\" [ngTemplateOutletContext]=\"{instance: instance}\"></ng-template>\n                   <button class=\"btn btn-secondary pull-right stop-btn\" *ngIf=\"instance.onStop\" (click)=\"instance.onStop();\">\n                       {{instance.stopButtonLabel}}\n                   </button>\n                   <div style=\"clear: both;\"></div>\n               </li>\n               <li class=\"instance-list-item\" *ngIf=\"queue.length > 0\">\n                   <label class=\"global-progress-bar-ui-primary-label h6\">\n                       ({{queue.length}}) queued\n                   </label>\n               </li>\n           </ul>\n       </div>\n   </div>\n</ng-container>\n<ng-template #progressTemplate let-instance=\"instance\">\n    <div wmProgressBar minvalue.bind=\"instance.min\" maxvalue.bind=\"instance.max\" datavalue.bind=\"instance.value\"></div>\n</ng-template>",
                    providers: [
                        provideAsWidgetRef(ProcessManagerComponent)
                    ]
                }] }
    ];
    /** @nocollapse */
    ProcessManagerComponent.ctorParameters = function () { return [
        { type: ElementRef }
    ]; };
    return ProcessManagerComponent;
}());
export { ProcessManagerComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvY2Vzcy1tYW5hZ2VyLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9tb2JpbGUvY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvcHJvY2Vzcy1tYW5hZ2VyL3Byb2Nlc3MtbWFuYWdlci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBVyxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFL0QsT0FBTyxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBQ3pELE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBcUJwRCxJQUFNLFdBQVcsR0FBRyxDQUFDLENBQUM7QUFFdEI7SUFjSSxpQ0FBb0IsRUFBYztRQUFkLE9BQUUsR0FBRixFQUFFLENBQVk7UUFMMUIsY0FBUyxHQUFHLElBQUksQ0FBQztRQUVsQixjQUFTLEdBQWMsRUFBRSxDQUFDO1FBQzFCLFVBQUssR0FBRyxFQUFFLENBQUM7UUFHZCxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxhQUFhLEVBQUUsdUNBQXVDLENBQUMsQ0FBQztJQUM3RSxDQUFDO0lBRU0sZ0RBQWMsR0FBckIsVUFBc0IsSUFBWSxFQUFFLEdBQU8sRUFBRSxHQUFTO1FBQXRELGlCQWlCQztRQWpCbUMsb0JBQUEsRUFBQSxPQUFPO1FBQUUsb0JBQUEsRUFBQSxTQUFTO1FBQ2xELElBQU0sUUFBUSxHQUFZO1lBQ3RCLEdBQUcsRUFBRSxHQUFHO1lBQ1IsR0FBRyxFQUFFLEdBQUc7WUFDUixJQUFJLEVBQUUsSUFBSTtZQUNWLE1BQU0sRUFBRSxJQUFJO1lBQ1osYUFBYSxFQUFFLEVBQUU7WUFDakIsSUFBSSxFQUFFLEdBQUcsS0FBSyxHQUFHO1lBQ2pCLGVBQWUsRUFBRyxRQUFRO1lBQzFCLEtBQUssRUFBRSxDQUFDO1NBQ1gsQ0FBQztRQUNGLElBQU0sR0FBRyxHQUFH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LFFBQWlCLEVBQUUsWUFBb0IsRUFBRSxhQUFrQjtRQUF0RixpQkFnQkM7UUFmRyxJQUFJLFlBQVksS0FBSyxPQUFPLEVBQUU7WUFDMUIsSUFBSSxRQUFRLENBQUMsS0FBSyxJQUFJLFFBQVEsQ0FBQyxHQUFHLEVBQUU7Z0JBQ2hDLGFBQWEsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDO2FBQ2hDO1lBQ0QsUUFBUSxDQUFDLEtBQUssR0FBRyxhQUFhLENBQUM7WUFDL0IsUUFBUSxDQUFDLGFBQWEsR0FBRyxRQUFRLENBQUMsS0FBSyxHQUFHLEdBQUcsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDO1NBQ2hFO2FBQU0sSUFBSSxZQUFZLEtBQUssUUFBUSxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLEVBQUU7WUFDakUsUUFBUSxDQUFDLE1BQU0sR0FBRztnQkFDZCxhQUFhLEVBQUUsQ0FBQztnQkFDaEIsT0FBTyxLQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3pDLENBQUMsQ0FBQztTQUNMO2FBQU07WUFDSCxRQUFRLENBQUMsWUFBWSxDQUFDLEdBQUcsYUFBYSxDQUFDO1NBQzFDO1FBQ0QsUUFBUSxDQUFDLElBQUksR0FBRyxRQUFRLENBQUMsR0FBRyxLQUFLLFFBQVEsQ0FBQyxHQUFHLENBQUM7SUFDbEQsQ0FBQzs7Z0JBbkdKLFNBQVMsU0FBQztvQkFDUCxRQUFRLEVBQUUsb0JBQW9CO29CQUM5Qixzd0RBQStDO29CQUMvQyxTQUFTLEVBQUU7d0JBQ1Asa0JBQWtCLENBQUMsdUJBQXVCLENBQUM7cUJBQzlDO2lCQUNKOzs7O2dCQWhDNEIsVUFBVTs7SUE4SHZDLDhCQUFDO0NBQUEsQUFwR0QsSUFvR0M7U0E3RlksdUJBQXVCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50LCBEb0NoZWNrLCBFbGVtZW50UmVmIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IGFkZENsYXNzLCByZW1vdmVBdHRyLCBzZXRBdHRyIH0gZnJvbSAnQHdtL2NvcmUnO1xuaW1wb3J0IHsgcHJvdmlkZUFzV2lkZ2V0UmVmIH0gZnJvbSAnQHdtL2NvbXBvbmVudHMnO1xuXG5kZWNsYXJlIGNvbnN0IF87XG5cbmV4cG9ydCBpbnRlcmZhY2UgUHJvY2VzcyB7XG4gICAgbWF4OiBudW1iZXI7XG4gICAgbWluOiBudW1iZXI7XG4gICAgbmFtZTogc3RyaW5nO1xuICAgIG9uU3RvcDogKCkgPT4gdm9pZDtcbiAgICBwcm9ncmVzc0xhYmVsOiBzdHJpbmc7XG4gICAgc2hvdzogYm9vbGVhbjtcbiAgICBzdG9wQnV0dG9uTGFiZWw6IHN0cmluZztcbiAgICB2YWx1ZTogbnVtYmVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFByb2Nlc3NBcGkge1xuICAgIGRlc3Ryb3k6ICgpID0+IFByb21pc2U8dm9pZD47XG4gICAgZ2V0OiAocHJvcGVydHlOYW1lOiBzdHJpbmcpID0+IHN0cmluZztcbiAgICBzZXQ6IChwcm9wZXJ0eU5hbWU6IHN0cmluZywgcHJvcGVydHlWYWx1ZTogYW55KSA9PiB2b2lkO1xufVxuXG5jb25zdCBNQVhfUFJPQ0VTUyA9IDM7XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnW3dtUHJvY2Vzc01hbmFnZXJdJyxcbiAgICB0ZW1wbGF0ZVVybDogJy4vcHJvY2Vzcy1tYW5hZ2VyLmNvbXBvbmVudC5odG1sJyxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgcHJvdmlkZUFzV2lkZ2V0UmVmKFByb2Nlc3NNYW5hZ2VyQ29tcG9uZW50KVxuICAgIF1cbn0pXG5leHBvcnQgY2xhc3MgUHJvY2Vzc01hbmFnZXJDb21wb25lbnQgaW1wbGVtZW50cyBEb0NoZWNrIHtcblxuICAgIHByaXZhdGUgaXNWaXNpYmxlID0gdHJ1ZTtcblxuICAgIHB1YmxpYyBpbnN0YW5jZXM6IFByb2Nlc3NbXSA9IFtdO1xuICAgIHB1YmxpYyBxdWV1ZSA9IFtdO1xuXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBlbDogRWxlbWVudFJlZikge1xuICAgICAgICBhZGRDbGFzcyh0aGlzLmVsLm5hdGl2ZUVsZW1lbnQsICdhcHAtZ2xvYmFsLXByb2dyZXNzLWJhciBtb2RhbCBkZWZhdWx0Jyk7XG4gICAgfVxuXG4gICAgcHVibGljIGNyZWF0ZUluc3RhbmNlKG5hbWU6IHN0cmluZywgbWluID0gMCwgbWF4ID0gMTAwKTogUHJvbWlzZTxQcm9jZXNzQXBpPiB7XG4gICAgICAgIGNvbnN0IGluc3RhbmNlOiBQcm9jZXNzID0ge1xuICAgICAgICAgICAgbWF4OiBtYXgsXG4gICAgICAgICAgICBtaW46IG1pbixcbiAgICAgICAgICAgIG5hbWU6IG5hbWUsXG4gICAgICAgICAgICBvblN0b3A6IG51bGwsXG4gICAgICAgICAgICBwcm9ncmVzc0xhYmVsOiAnJyxcbiAgICAgICAgICAgIHNob3c6IG1pbiAhPT0gbWF4LFxuICAgICAgICAgICAgc3RvcEJ1dHRvbkxhYmVsIDogJ0NhbmNlbCcsXG4gICAgICAgICAgICB2YWx1ZTogMFxuICAgICAgICB9O1xuICAgICAgICBjb25zdCBhcGkgPSB7XG4gICAgICAgICAgICBnZXQ6IChwcm9wZXJ0eU5hbWUpID0+IGluc3RhbmNlW3Byb3BlcnR5TmFtZV0sXG4gICAgICAgICAgICBzZXQ6IChwcm9wZXJ0eU5hbWUsIHByb3BlcnR5VmFsdWUpID0+IHRoaXMuc2V0SW5zdGFjZVByb3BlcnR5KGluc3RhbmNlLCBwcm9wZXJ0eU5hbWUsIHByb3BlcnR5VmFsdWUpLFxuICAgICAgICAgICAgZGVzdHJveTogKCkgPT4gdGhpcy5yZW1vdmVJbnN0YW5jZShpbnN0YW5jZSlcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWRkVG9RdWV1ZShpbnN0YW5jZSkudGhlbigoKSA9PiBhcGkpO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRWaXNpYmxlSW5zdGFuY2VzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5pbnN0YW5jZXMuZmlsdGVyKGkgPT4gaS5zaG93KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgbmdEb0NoZWNrKCkge1xuICAgICAgICBjb25zdCBoYXNJbnN0YW5jZXNUb1Nob3cgPSAhIXRoaXMuaW5zdGFuY2VzLmZpbmQoaSA9PiBpLnNob3cpO1xuICAgICAgICBpZiAodGhpcy5pc1Zpc2libGUgJiYgIWhhc0luc3RhbmNlc1RvU2hvdykge1xuICAgICAgICAgICAgc2V0QXR0cih0aGlzLmVsLm5hdGl2ZUVsZW1lbnQsICdoaWRkZW4nLCAndHJ1ZScpO1xuICAgICAgICAgICAgdGhpcy5pc1Zpc2libGUgPSBmYWxzZTtcbiAgICAgICAgfSBlbHNlIGlmICghdGhpcy5pc1Zpc2libGUgJiYgaGFzSW5zdGFuY2VzVG9TaG93KSB7XG4gICAgICAgICAgICByZW1vdmVBdHRyKHRoaXMuZWwubmF0aXZlRWxlbWVudCwgJ2hpZGRlbicpO1xuICAgICAgICAgICAgdGhpcy5pc1Zpc2libGUgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBhZGRUb1F1ZXVlKGluc3RhbmNlKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZSggcmVzb2x2ZSA9PiB7XG4gICAgICAgICAgICB0aGlzLnF1ZXVlLnB1c2goKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmluc3RhbmNlcy5sZW5ndGggPCBNQVhfUFJPQ0VTUykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmluc3RhbmNlcy5wdXNoKGluc3RhbmNlKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShpbnN0YW5jZSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5mbHVzaFF1ZXVlKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgZmx1c2hRdWV1ZSgpIHtcbiAgICAgICAgaWYgKHRoaXMucXVldWUubGVuZ3RoID4gMCAmJiB0aGlzLnF1ZXVlWzBdKCkgIT09IGZhbHNlKSB7XG4gICAgICAgICAgICB0aGlzLnF1ZXVlLnNoaWZ0KCk7XG4gICAgICAgICAgICB0aGlzLmZsdXNoUXVldWUoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgcmVtb3ZlSW5zdGFuY2UoaW5zdGFuY2U6IFByb2Nlc3MpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKCByZXNvbHZlID0+IHtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIF8ucmVtb3ZlKHRoaXMuaW5zdGFuY2VzLCBpbnN0YW5jZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5mbHVzaFF1ZXVlKCk7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgfSwgMTAwMCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgc2V0SW5zdGFjZVByb3BlcnR5KGluc3RhbmNlOiBQcm9jZXNzLCBwcm9wZXJ0eU5hbWU6IHN0cmluZywgcHJvcGVydHlWYWx1ZTogYW55KSB7XG4gICAgICAgIGlmIChwcm9wZXJ0eU5hbWUgPT09ICd2YWx1ZScpIHtcbiAgICAgICAgICAgIGlmIChpbnN0YW5jZS52YWx1ZSA+PSBpbnN0YW5jZS5tYXgpIHtcbiAgICAgICAgICAgICAgICBwcm9wZXJ0eVZhbHVlID0gaW5zdGFuY2UubWF4O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaW5zdGFuY2UudmFsdWUgPSBwcm9wZXJ0eVZhbHVlO1xuICAgICAgICAgICAgaW5zdGFuY2UucHJvZ3Jlc3NMYWJlbCA9IGluc3RhbmNlLnZhbHVlICsgJy8nICsgaW5zdGFuY2UubWF4O1xuICAgICAgICB9IGVsc2UgaWYgKHByb3BlcnR5TmFtZSA9PT0gJ29uU3RvcCcgJiYgXy5pc0Z1bmN0aW9uKHByb3BlcnR5VmFsdWUpKSB7XG4gICAgICAgICAgICBpbnN0YW5jZS5vblN0b3AgPSAoKSA9PiB7XG4gICAgICAgICAgICAgICAgcHJvcGVydHlWYWx1ZSgpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnJlbW92ZUluc3RhbmNlKGluc3RhbmNlKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpbnN0YW5jZVtwcm9wZXJ0eU5hbWVdID0gcHJvcGVydHlWYWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBpbnN0YW5jZS5zaG93ID0gaW5zdGFuY2UubWluICE9PSBpbnN0YW5jZS5tYXg7XG4gICAgfVxufVxuIl19