import { Directive, ElementRef, HostBinding, HostListener, Injector, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { $invokeWatchers, $watch, App } from '@wm/core';
export class ListItemDirective {
    constructor(inj, elRef, app) {
        this.inj = inj;
        this.app = app;
        this.destroy = new Subject();
        this.destroy$ = this.destroy.asObservable();
        this.itemClass = '';
        this._currentItemWidgets = {};
        this.isActive = false;
        this.disableItem = false;
        this.nativeElement = elRef.nativeElement;
        this.listComponent = inj.view.component;
        this.context = inj.view.context;
        this.itemClassWatcher(this.listComponent);
        this.disableItemWatcher(this.listComponent);
        $(this.nativeElement).data('listItemContext', this);
    }
    onFocus() {
        // maintains which element is focused/selected most recently.
        this.listComponent.lastSelectedItem = this;
    }
    get $index() {
        return this.context.index;
    }
    get $even() {
        return this.context.even;
    }
    get $odd() {
        return this.context.odd;
    }
    get $first() {
        return this.context.first;
    }
    get $last() {
        return this.context.last;
    }
    get currentItemWidgets() {
        const componentElements = Array.from(this.nativeElement.querySelectorAll('[widget-id]'));
        return Object.assign(this._currentItemWidgets, componentElements.reduce((result, comp) => {
            result[comp.widget.name] = comp.widget;
            return result;
        }, {}));
    }
    set wmListItem(val) {
        this.item = val;
    }
    registerWatch(expression, callback) {
        // Removing ngFor context as the same properties are availble on listitem scope.
        // passing viewparent context for accessing varibales and widgets.
        this.destroy$.subscribe($watch(expression, this.listComponent.viewParent, this, callback));
    }
    itemClassWatcher(listComponent) {
        if (listComponent.binditemclass) {
            this.registerWatch(listComponent.binditemclass, nv => this.itemClass = nv || '');
        }
        else {
            this.itemClass = listComponent.itemclass;
        }
    }
    disableItemWatcher($list) {
        if ($list.binddisableitem) {
            this.registerWatch($list.binddisableitem, nv => this.disableItem = nv || false);
        }
        else {
            this.disableItem = $list.disableitem || false;
        }
    }
    triggerWMEvent(eventName) {
        $invokeWatchers(true);
        // If we have multiselect for the livelist(List with form template), in run mode deleting a record is getting failed. Becuase the selecteditem will be array of objects. So consider the last object.
        const row = this.listComponent.multiselect ? _.last(this.listComponent.selecteditem) : this.listComponent.selecteditem;
        this.app.notify('wm-event', { eventName, widgetName: this.listComponent.name, row: row });
    }
    setUpCUDHandlers() {
        const $editItem = this.nativeElement.querySelector('.edit-list-item');
        const $deleteItem = this.nativeElement.querySelector('.delete-list-item');
        if ($editItem) {
            // Triggered on click of edit action
            $editItem.addEventListener('click', evt => {
                this.triggerWMEvent('update');
            });
        }
        if ($deleteItem) {
            // Triggered on click of delete action
            $deleteItem.addEventListener('click', evt => {
                this.triggerWMEvent('delete');
            });
        }
    }
    ngOnInit() {
        if (this.listComponent.mouseEnterCB) {
            this.nativeElement.addEventListener('mouseenter', ($event) => {
                this.listComponent.invokeEventCallback('mouseenter', { widget: this, $event });
            });
        }
        if (this.listComponent.mouseLeaveCB) {
            this.nativeElement.addEventListener('mouseleave', ($event) => {
                this.listComponent.invokeEventCallback('mouseleave', { widget: this, $event });
            });
        }
    }
    ngAfterViewInit() {
        this.setUpCUDHandlers();
    }
}
ListItemDirective.decorators = [
    { type: Directive, args: [{
                selector: '[wmListItem]',
                exportAs: 'listItemRef'
            },] }
];
/** @nocollapse */
ListItemDirective.ctorParameters = () => [
    { type: Injector },
    { type: ElementRef },
    { type: App }
];
ListItemDirective.propDecorators = {
    isActive: [{ type: HostBinding, args: ['class.active',] }],
    disableItem: [{ type: HostBinding, args: ['class.disable-item',] }],
    onFocus: [{ type: HostListener, args: ['focus',] }],
    wmListItem: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdC1pdGVtLmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vbGlzdC9saXN0LWl0ZW0uZGlyZWN0aXZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBa0MsU0FBUyxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQXFCLE1BQU0sZUFBZSxDQUFDO0FBR3JKLE9BQU8sRUFBYyxPQUFPLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFFM0MsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBV3hELE1BQU0sT0FBTyxpQkFBaUI7SUFxRDFCLFlBQW9CLEdBQWEsRUFBRSxLQUFpQixFQUFVLEdBQVE7UUFBbEQsUUFBRyxHQUFILEdBQUcsQ0FBVTtRQUE2QixRQUFHLEdBQUgsR0FBRyxDQUFLO1FBakQvRCxZQUFPLEdBQWlCLElBQUksT0FBTyxFQUFFLENBQUM7UUFDdEMsYUFBUSxHQUFvQixJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksRUFBRSxDQUFDO1FBSXZELGNBQVMsR0FBRyxFQUFFLENBQUM7UUFDZix3QkFBbUIsR0FBRyxFQUFFLENBQUM7UUFFSixhQUFRLEdBQUcsS0FBSyxDQUFDO1FBQ1gsZ0JBQVcsR0FBRyxLQUFLLENBQUM7UUF5Q25ELElBQUksQ0FBQyxhQUFhLEdBQUcsS0FBSyxDQUFDLGFBQWEsQ0FBQztRQUN6QyxJQUFJLENBQUMsYUFBYSxHQUF5QixHQUFJLENBQUMsSUFBSSxDQUFDLFNBQVUsQ0FBQztRQUNoRSxJQUFJLENBQUMsT0FBTyxHQUE2QyxHQUFJLENBQUMsSUFBSSxDQUFDLE9BQVEsQ0FBQztRQUM1RSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQzFDLElBQUksQ0FBQyxrQkFBa0Is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QUksSUFBSSxDQUFDLGFBQWEsQ0FBQyxZQUFZLEVBQUU7WUFDakMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxNQUFNLEVBQUUsRUFBRTtnQkFDekQsSUFBSSxDQUFDLGFBQWEsQ0FBQyxtQkFBbUIsQ0FBQyxZQUFZLEVBQUUsRUFBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLE1BQU0sRUFBQyxDQUFDLENBQUM7WUFDakYsQ0FBQyxDQUFDLENBQUM7U0FDTjtJQUNMLENBQUM7SUFFRCxlQUFlO1FBQ1gsSUFBSSxDQUFDLGdCQUFnQixFQUFFLENBQUM7SUFDNUIsQ0FBQzs7O1lBbElKLFNBQVMsU0FBQztnQkFDUCxRQUFRLEVBQUUsY0FBYztnQkFDeEIsUUFBUSxFQUFFLGFBQWE7YUFDMUI7Ozs7WUFmMEYsUUFBUTtZQUEvQyxVQUFVO1lBSzVCLEdBQUc7Ozt1QkF1QmhDLFdBQVcsU0FBQyxjQUFjOzBCQUMxQixXQUFXLFNBQUMsb0JBQW9CO3NCQUVoQyxZQUFZLFNBQUMsT0FBTzt5QkFrQ3BCLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBZnRlclZpZXdJbml0LCBDb250ZW50Q2hpbGRyZW4sIERpcmVjdGl2ZSwgRWxlbWVudFJlZiwgSG9zdEJpbmRpbmcsIEhvc3RMaXN0ZW5lciwgSW5qZWN0b3IsIElucHV0LCBPbkluaXQsIFF1ZXJ5TGlzdCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgTmdGb3JPZkNvbnRleHQgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuXG5pbXBvcnQgeyBPYnNlcnZhYmxlLCBTdWJqZWN0IH0gZnJvbSAncnhqcyc7XG5cbmltcG9ydCB7ICRpbnZva2VXYXRjaGVycywgJHdhdGNoLCBBcHAgfSBmcm9tICdAd20vY29yZSc7XG5cbmltcG9ydCB7IExpc3RDb21wb25lbnQgfSBmcm9tICcuL2xpc3QuY29tcG9uZW50JztcbmltcG9ydCB7IFdpZGdldFJlZiB9IGZyb20gJy4uLy4uL2ZyYW1ld29yay90eXBlcyc7XG5cbmRlY2xhcmUgY29uc3QgJCwgXztcblxuQERpcmVjdGl2ZSh7XG4gICAgc2VsZWN0b3I6ICdbd21MaXN0SXRlbV0nLFxuICAgIGV4cG9ydEFzOiAnbGlzdEl0ZW1SZWYnXG59KVxuZXhwb3J0IGNsYXNzIExpc3RJdGVtRGlyZWN0aXZlIGltcGxlbWVudHMgT25Jbml0LCBBZnRlclZpZXdJbml0IHtcblxuICAgIHB1YmxpYyBpdGVtO1xuICAgIHB1YmxpYyBjb250ZXh0O1xuICAgIHB1YmxpYyBkZXN0cm95OiBTdWJqZWN0PGFueT4gPSBuZXcgU3ViamVjdCgpO1xuICAgIHB1YmxpYyBkZXN0cm95JDogT2JzZXJ2YWJsZTxhbnk+ID0gdGhpcy5kZXN0cm95LmFzT2JzZXJ2YWJsZSgpO1xuICAgIHB1YmxpYyBuYXRpdmVFbGVtZW50OiBIVE1MRWxlbWVudDtcbiAgICBwdWJsaWMgcmVhZG9ubHkgbGlzdENvbXBvbmVudDogTGlzdENvbXBvbmVudDtcblxuICAgIHByaXZhdGUgaXRlbUNsYXNzID0gJyc7XG4gICAgcHJpdmF0ZSBfY3VycmVudEl0ZW1XaWRnZXRzID0ge307XG5cbiAgICBASG9zdEJpbmRpbmcoJ2NsYXNzLmFjdGl2ZScpIGlzQWN0aXZlID0gZmFsc2U7XG4gICAgQEhvc3RCaW5kaW5nKCdjbGFzcy5kaXNhYmxlLWl0ZW0nKSBkaXNhYmxlSXRlbSA9IGZhbHNlO1xuXG4gICAgQEhvc3RMaXN0ZW5lcignZm9jdXMnKVxuICAgIG9uRm9jdXMoKSB7XG4gICAgICAgIC8vIG1haW50YWlucyB3aGljaCBlbGVtZW50IGlzIGZvY3VzZWQvc2VsZWN0ZWQgbW9zdCByZWNlbnRseS5cbiAgICAgICAgdGhpcy5saXN0Q29tcG9uZW50Lmxhc3RTZWxlY3RlZEl0ZW0gPSB0aGlzO1xuICAgIH1cblxuICAgIGdldCAkaW5kZXgoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbnRleHQuaW5kZXg7XG4gICAgfVxuXG4gICAgZ2V0ICRldmVuKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb250ZXh0LmV2ZW47XG4gICAgfVxuXG4gICAgZ2V0ICRvZGQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbnRleHQub2RkO1xuICAgIH1cblxuICAgIGdldCAkZmlyc3QoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbnRleHQuZmlyc3Q7XG4gICAgfVxuXG4gICAgZ2V0ICRsYXN0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb250ZXh0Lmxhc3Q7XG4gICAgfVxuXG4gICAgZ2V0IGN1cnJlbnRJdGVtV2lkZ2V0cyAoKSB7XG4gICAgICAgIGNvbnN0IGNvbXBvbmVudEVsZW1lbnRzID0gQXJyYXkuZnJvbSh0aGlzLm5hdGl2ZUVsZW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW3dpZGdldC1pZF0nKSk7XG4gICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHRoaXMuX2N1cnJlbnRJdGVtV2lkZ2V0cywgY29tcG9uZW50RWxlbWVudHMucmVkdWNlKChyZXN1bHQsIGNvbXA6IGFueSkgPT4ge1xuICAgICAgICAgICAgcmVzdWx0W2NvbXAud2lkZ2V0Lm5hbWVdID0gY29tcC53aWRnZXQ7XG4gICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9LCB7fSkpO1xuICAgIH1cblxuICAgIEBJbnB1dCgpIHNldCB3bUxpc3RJdGVtKHZhbCkge1xuICAgICAgICB0aGlzLml0ZW0gPSB2YWw7XG4gICAgfVxuXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBpbmo6IEluamVjdG9yLCBlbFJlZjogRWxlbWVudFJlZiwgcHJpdmF0ZSBhcHA6IEFwcCkge1xuICAgICAgICB0aGlzLm5hdGl2ZUVsZW1lbnQgPSBlbFJlZi5uYXRpdmVFbGVtZW50O1xuICAgICAgICB0aGlzLmxpc3RDb21wb25lbnQgPSAoPExpc3RDb21wb25lbnQ+KDxhbnk+aW5qKS52aWV3LmNvbXBvbmVudCk7XG4gICAgICAgIHRoaXMuY29udGV4dCA9ICg8TmdGb3JPZkNvbnRleHQ8TGlzdEl0ZW1EaXJlY3RpdmU+Pig8YW55Pmluaikudmlldy5jb250ZXh0KTtcbiAgICAgICAgdGhpcy5pdGVtQ2xhc3NXYXRjaGVyKHRoaXMubGlzdENvbXBvbmVudCk7XG4gICAgICAgIHRoaXMuZGlzYWJsZUl0ZW1XYXRjaGVyKHRoaXMubGlzdENvbXBvbmVudCk7XG4gICAgICAgICQodGhpcy5uYXRpdmVFbGVtZW50KS5kYXRhKCdsaXN0SXRlbUNvbnRleHQnLCB0aGlzKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHJlZ2lzdGVyV2F0Y2goZXhwcmVzc2lvbjogc3RyaW5nLCBjYWxsYmFjazogRnVuY3Rpb24pIHtcbiAgICAgICAgLy8gUmVtb3ZpbmcgbmdGb3IgY29udGV4dCBhcyB0aGUgc2FtZSBwcm9wZXJ0aWVzIGFyZSBhdmFpbGJsZSBvbiBsaXN0aXRlbSBzY29wZS5cbiAgICAgICAgLy8gcGFzc2luZyB2aWV3cGFyZW50IGNvbnRleHQgZm9yIGFjY2Vzc2luZyB2YXJpYmFsZXMgYW5kIHdpZGdldHMuXG4gICAgICAgIHRoaXMuZGVzdHJveSQuc3Vic2NyaWJlKCR3YXRjaChleHByZXNzaW9uLCAodGhpcy5saXN0Q29tcG9uZW50IGFzIGFueSkudmlld1BhcmVudCwgdGhpcywgY2FsbGJhY2spKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGl0ZW1DbGFzc1dhdGNoZXIobGlzdENvbXBvbmVudDogTGlzdENvbXBvbmVudCkge1xuICAgICAgICBpZiAobGlzdENvbXBvbmVudC5iaW5kaXRlbWNsYXNzKSB7XG4gICAgICAgICAgICB0aGlzLnJlZ2lzdGVyV2F0Y2gobGlzdENvbXBvbmVudC5iaW5kaXRlbWNsYXNzLCBudiA9PiB0aGlzLml0ZW1DbGFzcyA9IG52IHx8ICcnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuaXRlbUNsYXNzID0gbGlzdENvbXBvbmVudC5pdGVtY2xhc3M7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIGRpc2FibGVJdGVtV2F0Y2hlcigkbGlzdDogTGlzdENvbXBvbmVudCkge1xuICAgICAgICBpZiAoJGxpc3QuYmluZGRpc2FibGVpdGVtKSB7XG4gICAgICAgICAgICB0aGlzLnJlZ2lzdGVyV2F0Y2goJGxpc3QuYmluZGRpc2FibGVpdGVtLCBudiA9PiB0aGlzLmRpc2FibGVJdGVtID0gbnYgfHwgZmFsc2UpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5kaXNhYmxlSXRlbSA9ICRsaXN0LmRpc2FibGVpdGVtIHx8IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB0cmlnZ2VyV01FdmVudChldmVudE5hbWUpIHtcbiAgICAgICAgJGludm9rZVdhdGNoZXJzKHRydWUpO1xuICAgICAgICAvLyBJZiB3ZSBoYXZlIG11bHRpc2VsZWN0IGZvciB0aGUgbGl2ZWxpc3QoTGlzdCB3aXRoIGZvcm0gdGVtcGxhdGUpLCBpbiBydW4gbW9kZSBkZWxldGluZyBhIHJlY29yZCBpcyBnZXR0aW5nIGZhaWxlZC4gQmVjdWFzZSB0aGUgc2VsZWN0ZWRpdGVtIHdpbGwgYmUgYXJyYXkgb2Ygb2JqZWN0cy4gU28gY29uc2lkZXIgdGhlIGxhc3Qgb2JqZWN0LlxuICAgICAgICBjb25zdCByb3cgPSB0aGlzLmxpc3RDb21wb25lbnQubXVsdGlzZWxlY3QgPyBfLmxhc3QodGhpcy5saXN0Q29tcG9uZW50LnNlbGVjdGVkaXRlbSkgOiB0aGlzLmxpc3RDb21wb25lbnQuc2VsZWN0ZWRpdGVtO1xuICAgICAgICB0aGlzLmFwcC5ub3RpZnkoJ3dtLWV2ZW50Jywge2V2ZW50TmFtZSwgd2lkZ2V0TmFtZTogdGhpcy5saXN0Q29tcG9uZW50Lm5hbWUsIHJvdzogcm93fSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBzZXRVcENVREhhbmRsZXJzKCkge1xuICAgICAgICBjb25zdCAkZWRpdEl0ZW0gPSB0aGlzLm5hdGl2ZUVsZW1lbnQucXVlcnlTZWxlY3RvcignLmVkaXQtbGlzdC1pdGVtJyk7XG4gICAgICAgIGNvbnN0ICRkZWxldGVJdGVtID0gdGhpcy5uYXRpdmVFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5kZWxldGUtbGlzdC1pdGVtJyk7XG5cbiAgICAgICAgaWYgKCRlZGl0SXRlbSkge1xuICAgICAgICAgICAgLy8gVHJpZ2dlcmVkIG9uIGNsaWNrIG9mIGVkaXQgYWN0aW9uXG4gICAgICAgICAgICAkZWRpdEl0ZW0uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBldnQgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlcldNRXZlbnQoJ3VwZGF0ZScpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoJGRlbGV0ZUl0ZW0pIHtcbiAgICAgICAgICAgIC8vIFRyaWdnZXJlZCBvbiBjbGljayBvZiBkZWxldGUgYWN0aW9uXG4gICAgICAgICAgICAkZGVsZXRlSXRlbS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGV2dCA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy50cmlnZ2VyV01FdmVudCgnZGVsZXRlJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuXG4gICAgbmdPbkluaXQoKSB7XG4gICAgICAgIGlmICh0aGlzLmxpc3RDb21wb25lbnQubW91c2VFbnRlckNCKSB7XG4gICAgICAgICAgICB0aGlzLm5hdGl2ZUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VlbnRlcicsICgkZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmxpc3RDb21wb25lbnQuaW52b2tlRXZlbnRDYWxsYmFjaygnbW91c2VlbnRlcicsIHt3aWRnZXQ6IHRoaXMsICRldmVudH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMubGlzdENvbXBvbmVudC5tb3VzZUxlYXZlQ0IpIHtcbiAgICAgICAgICAgIHRoaXMubmF0aXZlRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWxlYXZlJywgKCRldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMubGlzdENvbXBvbmVudC5pbnZva2VFdmVudENhbGxiYWNrKCdtb3VzZWxlYXZlJywge3dpZGdldDogdGhpcywgJGV2ZW50fSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcbiAgICAgICAgdGhpcy5zZXRVcENVREhhbmRsZXJzKCk7XG4gICAgfVxufVxuIl19