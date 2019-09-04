import { Component, ElementRef } from '@angular/core';
import { addClass, removeAttr, setAttr } from '@wm/core';
import { provideAsWidgetRef } from '@wm/components';
const MAX_PROCESS = 3;
export class ProcessManagerComponent {
    constructor(el) {
        this.el = el;
        this.isVisible = true;
        this.instances = [];
        this.queue = [];
        addClass(this.el.nativeElement, 'app-global-progress-bar modal default');
    }
    createInstance(name, min = 0, max = 100) {
        const instance = {
            max: max,
            min: min,
            name: name,
            onStop: null,
            progressLabel: '',
            show: min !== max,
            stopButtonLabel: 'Cancel',
            value: 0
        };
        const api = {
            get: (propertyName) => instance[propertyName],
            set: (propertyName, propertyValue) => this.setInstaceProperty(instance, propertyName, propertyValue),
            destroy: () => this.removeInstance(instance)
        };
        return this.addToQueue(instance).then(() => api);
    }
    getVisibleInstances() {
        return this.instances.filter(i => i.show);
    }
    ngDoCheck() {
        const hasInstancesToShow = !!this.instances.find(i => i.show);
        if (this.isVisible && !hasInstancesToShow) {
            setAttr(this.el.nativeElement, 'hidden', 'true');
            this.isVisible = false;
        }
        else if (!this.isVisible && hasInstancesToShow) {
            removeAttr(this.el.nativeElement, 'hidden');
            this.isVisible = true;
        }
    }
    addToQueue(instance) {
        return new Promise(resolve => {
            this.queue.push(() => {
                if (this.instances.length < MAX_PROCESS) {
                    this.instances.push(instance);
                    resolve(instance);
                }
                else {
                    return false;
                }
            });
            this.flushQueue();
        });
    }
    flushQueue() {
        if (this.queue.length > 0 && this.queue[0]() !== false) {
            this.queue.shift();
            this.flushQueue();
        }
    }
    removeInstance(instance) {
        return new Promise(resolve => {
            setTimeout(() => {
                _.remove(this.instances, instance);
                this.flushQueue();
                resolve();
            }, 1000);
        });
    }
    setInstaceProperty(instance, propertyName, propertyValue) {
        if (propertyName === 'value') {
            if (instance.value >= instance.max) {
                propertyValue = instance.max;
            }
            instance.value = propertyValue;
            instance.progressLabel = instance.value + '/' + instance.max;
        }
        else if (propertyName === 'onStop' && _.isFunction(propertyValue)) {
            instance.onStop = () => {
                propertyValue();
                return this.removeInstance(instance);
            };
        }
        else {
            instance[propertyName] = propertyValue;
        }
        instance.show = instance.min !== instance.max;
    }
}
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
ProcessManagerComponent.ctorParameters = () => [
    { type: ElementRef }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvY2Vzcy1tYW5hZ2VyLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9tb2JpbGUvY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvcHJvY2Vzcy1tYW5hZ2VyL3Byb2Nlc3MtbWFuYWdlci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBVyxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFL0QsT0FBTyxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBQ3pELE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBcUJwRCxNQUFNLFdBQVcsR0FBRyxDQUFDLENBQUM7QUFTdEIsTUFBTSxPQUFPLHVCQUF1QjtJQU9oQyxZQUFvQixFQUFjO1FBQWQsT0FBRSxHQUFGLEVBQUUsQ0FBWTtRQUwxQixjQUFTLEdBQUcsSUFBSSxDQUFDO1FBRWxCLGNBQVMsR0FBYyxFQUFFLENBQUM7UUFDMUIsVUFBSyxHQUFHLEVBQUUsQ0FBQztRQUdkLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLGFBQWEsRUFBRSx1Q0FBdUMsQ0FBQyxDQUFDO0lBQzdFLENBQUM7SUFFTSxjQUFjLENBQUMsSUFBWSxFQUFFLEdBQUcsR0FBRyxDQUFDLEVBQUUsR0FBRyxHQUFHLEdBQUc7UUFDbEQsTUFBTSxRQUFRLEdBQVk7WUFDdEIsR0FBRyxFQUFFLEdBQUc7WUFDUixHQUFHLEVBQUUsR0FBRztZQUNSLElBQUksRUFBRSxJQUFJO1lBQ1YsTUFBTSxFQUFFLElBQUk7WUFDWixhQUFhLEVBQUUsRUFBRTtZQUNqQixJQUFJLEVBQUUsR0FBRyxLQUFLLEdBQUc7WUFDakIsZUFBZSxFQUFHLFFBQVE7WUFDMUIsS0FBSyxFQUFFLENBQUM7U0FDWCxDQUFDO1FBQ0YsTUFBTSxHQUFHLEdBQUc7WUFDUixHQUFHLEVBQUUsQ0FBQyxZQUFZLEVB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QUFFO2dCQUNoQyxhQUFhLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQzthQUNoQztZQUNELFFBQVEsQ0FBQyxLQUFLLEdBQUcsYUFBYSxDQUFDO1lBQy9CLFFBQVEsQ0FBQyxhQUFhLEdBQUcsUUFBUSxDQUFDLEtBQUssR0FBRyxHQUFHLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQztTQUNoRTthQUFNLElBQUksWUFBWSxLQUFLLFFBQVEsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDLGFBQWEsQ0FBQyxFQUFFO1lBQ2pFLFFBQVEsQ0FBQyxNQUFNLEdBQUcsR0FBRyxFQUFFO2dCQUNuQixhQUFhLEVBQUUsQ0FBQztnQkFDaEIsT0FBTyxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3pDLENBQUMsQ0FBQztTQUNMO2FBQU07WUFDSCxRQUFRLENBQUMsWUFBWSxDQUFDLEdBQUcsYUFBYSxDQUFDO1NBQzFDO1FBQ0QsUUFBUSxDQUFDLElBQUksR0FBRyxRQUFRLENBQUMsR0FBRyxLQUFLLFFBQVEsQ0FBQyxHQUFHLENBQUM7SUFDbEQsQ0FBQzs7O1lBbkdKLFNBQVMsU0FBQztnQkFDUCxRQUFRLEVBQUUsb0JBQW9CO2dCQUM5Qixzd0RBQStDO2dCQUMvQyxTQUFTLEVBQUU7b0JBQ1Asa0JBQWtCLENBQUMsdUJBQXVCLENBQUM7aUJBQzlDO2FBQ0o7Ozs7WUFoQzRCLFVBQVUiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21wb25lbnQsIERvQ2hlY2ssIEVsZW1lbnRSZWYgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgYWRkQ2xhc3MsIHJlbW92ZUF0dHIsIHNldEF0dHIgfSBmcm9tICdAd20vY29yZSc7XG5pbXBvcnQgeyBwcm92aWRlQXNXaWRnZXRSZWYgfSBmcm9tICdAd20vY29tcG9uZW50cyc7XG5cbmRlY2xhcmUgY29uc3QgXztcblxuZXhwb3J0IGludGVyZmFjZSBQcm9jZXNzIHtcbiAgICBtYXg6IG51bWJlcjtcbiAgICBtaW46IG51bWJlcjtcbiAgICBuYW1lOiBzdHJpbmc7XG4gICAgb25TdG9wOiAoKSA9PiB2b2lkO1xuICAgIHByb2dyZXNzTGFiZWw6IHN0cmluZztcbiAgICBzaG93OiBib29sZWFuO1xuICAgIHN0b3BCdXR0b25MYWJlbDogc3RyaW5nO1xuICAgIHZhbHVlOiBudW1iZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUHJvY2Vzc0FwaSB7XG4gICAgZGVzdHJveTogKCkgPT4gUHJvbWlzZTx2b2lkPjtcbiAgICBnZXQ6IChwcm9wZXJ0eU5hbWU6IHN0cmluZykgPT4gc3RyaW5nO1xuICAgIHNldDogKHByb3BlcnR5TmFtZTogc3RyaW5nLCBwcm9wZXJ0eVZhbHVlOiBhbnkpID0+IHZvaWQ7XG59XG5cbmNvbnN0IE1BWF9QUk9DRVNTID0gMztcblxuQENvbXBvbmVudCh7XG4gICAgc2VsZWN0b3I6ICdbd21Qcm9jZXNzTWFuYWdlcl0nLFxuICAgIHRlbXBsYXRlVXJsOiAnLi9wcm9jZXNzLW1hbmFnZXIuY29tcG9uZW50Lmh0bWwnLFxuICAgIHByb3ZpZGVyczogW1xuICAgICAgICBwcm92aWRlQXNXaWRnZXRSZWYoUHJvY2Vzc01hbmFnZXJDb21wb25lbnQpXG4gICAgXVxufSlcbmV4cG9ydCBjbGFzcyBQcm9jZXNzTWFuYWdlckNvbXBvbmVudCBpbXBsZW1lbnRzIERvQ2hlY2sge1xuXG4gICAgcHJpdmF0ZSBpc1Zpc2libGUgPSB0cnVlO1xuXG4gICAgcHVibGljIGluc3RhbmNlczogUHJvY2Vzc1tdID0gW107XG4gICAgcHVibGljIHF1ZXVlID0gW107XG5cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGVsOiBFbGVtZW50UmVmKSB7XG4gICAgICAgIGFkZENsYXNzKHRoaXMuZWwubmF0aXZlRWxlbWVudCwgJ2FwcC1nbG9iYWwtcHJvZ3Jlc3MtYmFyIG1vZGFsIGRlZmF1bHQnKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY3JlYXRlSW5zdGFuY2UobmFtZTogc3RyaW5nLCBtaW4gPSAwLCBtYXggPSAxMDApOiBQcm9taXNlPFByb2Nlc3NBcGk+IHtcbiAgICAgICAgY29uc3QgaW5zdGFuY2U6IFByb2Nlc3MgPSB7XG4gICAgICAgICAgICBtYXg6IG1heCxcbiAgICAgICAgICAgIG1pbjogbWluLFxuICAgICAgICAgICAgbmFtZTogbmFtZSxcbiAgICAgICAgICAgIG9uU3RvcDogbnVsbCxcbiAgICAgICAgICAgIHByb2dyZXNzTGFiZWw6ICcnLFxuICAgICAgICAgICAgc2hvdzogbWluICE9PSBtYXgsXG4gICAgICAgICAgICBzdG9wQnV0dG9uTGFiZWwgOiAnQ2FuY2VsJyxcbiAgICAgICAgICAgIHZhbHVlOiAwXG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IGFwaSA9IHtcbiAgICAgICAgICAgIGdldDogKHByb3BlcnR5TmFtZSkgPT4gaW5zdGFuY2VbcHJvcGVydHlOYW1lXSxcbiAgICAgICAgICAgIHNldDogKHByb3BlcnR5TmFtZSwgcHJvcGVydHlWYWx1ZSkgPT4gdGhpcy5zZXRJbnN0YWNlUHJvcGVydHkoaW5zdGFuY2UsIHByb3BlcnR5TmFtZSwgcHJvcGVydHlWYWx1ZSksXG4gICAgICAgICAgICBkZXN0cm95OiAoKSA9PiB0aGlzLnJlbW92ZUluc3RhbmNlKGluc3RhbmNlKVxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gdGhpcy5hZGRUb1F1ZXVlKGluc3RhbmNlKS50aGVuKCgpID0+IGFwaSk7XG4gICAgfVxuXG4gICAgcHVibGljIGdldFZpc2libGVJbnN0YW5jZXMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmluc3RhbmNlcy5maWx0ZXIoaSA9PiBpLnNob3cpO1xuICAgIH1cblxuICAgIHB1YmxpYyBuZ0RvQ2hlY2soKSB7XG4gICAgICAgIGNvbnN0IGhhc0luc3RhbmNlc1RvU2hvdyA9ICEhdGhpcy5pbnN0YW5jZXMuZmluZChpID0+IGkuc2hvdyk7XG4gICAgICAgIGlmICh0aGlzLmlzVmlzaWJsZSAmJiAhaGFzSW5zdGFuY2VzVG9TaG93KSB7XG4gICAgICAgICAgICBzZXRBdHRyKHRoaXMuZWwubmF0aXZlRWxlbWVudCwgJ2hpZGRlbicsICd0cnVlJyk7XG4gICAgICAgICAgICB0aGlzLmlzVmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICB9IGVsc2UgaWYgKCF0aGlzLmlzVmlzaWJsZSAmJiBoYXNJbnN0YW5jZXNUb1Nob3cpIHtcbiAgICAgICAgICAgIHJlbW92ZUF0dHIodGhpcy5lbC5uYXRpdmVFbGVtZW50LCAnaGlkZGVuJyk7XG4gICAgICAgICAgICB0aGlzLmlzVmlzaWJsZSA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGFkZFRvUXVldWUoaW5zdGFuY2UpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKCByZXNvbHZlID0+IHtcbiAgICAgICAgICAgIHRoaXMucXVldWUucHVzaCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaW5zdGFuY2VzLmxlbmd0aCA8IE1BWF9QUk9DRVNTKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW5zdGFuY2VzLnB1c2goaW5zdGFuY2UpO1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGluc3RhbmNlKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLmZsdXNoUXVldWUoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBmbHVzaFF1ZXVlKCkge1xuICAgICAgICBpZiAodGhpcy5xdWV1ZS5sZW5ndGggPiAwICYmIHRoaXMucXVldWVbMF0oKSAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHRoaXMucXVldWUuc2hpZnQoKTtcbiAgICAgICAgICAgIHRoaXMuZmx1c2hRdWV1ZSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZW1vdmVJbnN0YW5jZShpbnN0YW5jZTogUHJvY2Vzcyk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoIHJlc29sdmUgPT4ge1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgXy5yZW1vdmUodGhpcy5pbnN0YW5jZXMsIGluc3RhbmNlKTtcbiAgICAgICAgICAgICAgICB0aGlzLmZsdXNoUXVldWUoKTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICB9LCAxMDAwKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzZXRJbnN0YWNlUHJvcGVydHkoaW5zdGFuY2U6IFByb2Nlc3MsIHByb3BlcnR5TmFtZTogc3RyaW5nLCBwcm9wZXJ0eVZhbHVlOiBhbnkpIHtcbiAgICAgICAgaWYgKHByb3BlcnR5TmFtZSA9PT0gJ3ZhbHVlJykge1xuICAgICAgICAgICAgaWYgKGluc3RhbmNlLnZhbHVlID49IGluc3RhbmNlLm1heCkge1xuICAgICAgICAgICAgICAgIHByb3BlcnR5VmFsdWUgPSBpbnN0YW5jZS5tYXg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpbnN0YW5jZS52YWx1ZSA9IHByb3BlcnR5VmFsdWU7XG4gICAgICAgICAgICBpbnN0YW5jZS5wcm9ncmVzc0xhYmVsID0gaW5zdGFuY2UudmFsdWUgKyAnLycgKyBpbnN0YW5jZS5tYXg7XG4gICAgICAgIH0gZWxzZSBpZiAocHJvcGVydHlOYW1lID09PSAnb25TdG9wJyAmJiBfLmlzRnVuY3Rpb24ocHJvcGVydHlWYWx1ZSkpIHtcbiAgICAgICAgICAgIGluc3RhbmNlLm9uU3RvcCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICBwcm9wZXJ0eVZhbHVlKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVtb3ZlSW5zdGFuY2UoaW5zdGFuY2UpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGluc3RhbmNlW3Byb3BlcnR5TmFtZV0gPSBwcm9wZXJ0eVZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIGluc3RhbmNlLnNob3cgPSBpbnN0YW5jZS5taW4gIT09IGluc3RhbmNlLm1heDtcbiAgICB9XG59XG4iXX0=