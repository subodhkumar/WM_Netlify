import { Directive, ElementRef, HostBinding, HostListener, Injector, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { $invokeWatchers, $watch, App } from '@wm/core';
var ListItemDirective = /** @class */ (function () {
    function ListItemDirective(inj, elRef, app) {
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
    ListItemDirective.prototype.onFocus = function () {
        // maintains which element is focused/selected most recently.
        this.listComponent.lastSelectedItem = this;
    };
    Object.defineProperty(ListItemDirective.prototype, "$index", {
        get: function () {
            return this.context.index;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ListItemDirective.prototype, "$even", {
        get: function () {
            return this.context.even;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ListItemDirective.prototype, "$odd", {
        get: function () {
            return this.context.odd;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ListItemDirective.prototype, "$first", {
        get: function () {
            return this.context.first;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ListItemDirective.prototype, "$last", {
        get: function () {
            return this.context.last;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ListItemDirective.prototype, "currentItemWidgets", {
        get: function () {
            var componentElements = Array.from(this.nativeElement.querySelectorAll('[widget-id]'));
            return Object.assign(this._currentItemWidgets, componentElements.reduce(function (result, comp) {
                result[comp.widget.name] = comp.widget;
                return result;
            }, {}));
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ListItemDirective.prototype, "wmListItem", {
        set: function (val) {
            this.item = val;
        },
        enumerable: true,
        configurable: true
    });
    ListItemDirective.prototype.registerWatch = function (expression, callback) {
        // Removing ngFor context as the same properties are availble on listitem scope.
        // passing viewparent context for accessing varibales and widgets.
        this.destroy$.subscribe($watch(expression, this.listComponent.viewParent, this, callback));
    };
    ListItemDirective.prototype.itemClassWatcher = function (listComponent) {
        var _this = this;
        if (listComponent.binditemclass) {
            this.registerWatch(listComponent.binditemclass, function (nv) { return _this.itemClass = nv || ''; });
        }
        else {
            this.itemClass = listComponent.itemclass;
        }
    };
    ListItemDirective.prototype.disableItemWatcher = function ($list) {
        var _this = this;
        if ($list.binddisableitem) {
            this.registerWatch($list.binddisableitem, function (nv) { return _this.disableItem = nv || false; });
        }
        else {
            this.disableItem = $list.disableitem || false;
        }
    };
    ListItemDirective.prototype.triggerWMEvent = function (eventName) {
        $invokeWatchers(true);
        // If we have multiselect for the livelist(List with form template), in run mode deleting a record is getting failed. Becuase the selecteditem will be array of objects. So consider the last object.
        var row = this.listComponent.multiselect ? _.last(this.listComponent.selecteditem) : this.listComponent.selecteditem;
        this.app.notify('wm-event', { eventName: eventName, widgetName: this.listComponent.name, row: row });
    };
    ListItemDirective.prototype.setUpCUDHandlers = function () {
        var _this = this;
        var $editItem = this.nativeElement.querySelector('.edit-list-item');
        var $deleteItem = this.nativeElement.querySelector('.delete-list-item');
        if ($editItem) {
            // Triggered on click of edit action
            $editItem.addEventListener('click', function (evt) {
                _this.triggerWMEvent('update');
            });
        }
        if ($deleteItem) {
            // Triggered on click of delete action
            $deleteItem.addEventListener('click', function (evt) {
                _this.triggerWMEvent('delete');
            });
        }
    };
    ListItemDirective.prototype.ngOnInit = function () {
        var _this = this;
        if (this.listComponent.mouseEnterCB) {
            this.nativeElement.addEventListener('mouseenter', function ($event) {
                _this.listComponent.invokeEventCallback('mouseenter', { widget: _this, $event: $event });
            });
        }
        if (this.listComponent.mouseLeaveCB) {
            this.nativeElement.addEventListener('mouseleave', function ($event) {
                _this.listComponent.invokeEventCallback('mouseleave', { widget: _this, $event: $event });
            });
        }
    };
    ListItemDirective.prototype.ngAfterViewInit = function () {
        this.setUpCUDHandlers();
    };
    ListItemDirective.decorators = [
        { type: Directive, args: [{
                    selector: '[wmListItem]',
                    exportAs: 'listItemRef'
                },] }
    ];
    /** @nocollapse */
    ListItemDirective.ctorParameters = function () { return [
        { type: Injector },
        { type: ElementRef },
        { type: App }
    ]; };
    ListItemDirective.propDecorators = {
        isActive: [{ type: HostBinding, args: ['class.active',] }],
        disableItem: [{ type: HostBinding, args: ['class.disable-item',] }],
        onFocus: [{ type: HostListener, args: ['focus',] }],
        wmListItem: [{ type: Input }]
    };
    return ListItemDirective;
}());
export { ListItemDirective };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlzdC1pdGVtLmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vbGlzdC9saXN0LWl0ZW0uZGlyZWN0aXZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBa0MsU0FBUyxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQXFCLE1BQU0sZUFBZSxDQUFDO0FBR3JKLE9BQU8sRUFBYyxPQUFPLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFFM0MsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBT3hEO0lBeURJLDJCQUFvQixHQUFhLEVBQUUsS0FBaUIsRUFBVSxHQUFRO1FBQWxELFFBQUcsR0FBSCxHQUFHLENBQVU7UUFBNkIsUUFBRyxHQUFILEdBQUcsQ0FBSztRQWpEL0QsWUFBTyxHQUFpQixJQUFJLE9BQU8sRUFBRSxDQUFDO1FBQ3RDLGFBQVEsR0FBb0IsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLEVBQUUsQ0FBQztRQUl2RCxjQUFTLEdBQUcsRUFBRSxDQUFDO1FBQ2Ysd0JBQW1CLEdBQUcsRUFBRSxDQUFDO1FBRUosYUFBUSxHQUFHLEtBQUssQ0FBQztRQUNYLGdCQUFXLEdBQUcsS0FBSyxDQUFDO1FBeUNuRCxJQUFJLENBQUMsYUFBYSxHQUFHLEtBQUssQ0FBQyxhQUFhLENBQUM7UUFDekMsSUFBSSxDQUFDLGFBQWEsR0FBeUIsR0FBSSxDQUFDLElBQUksQ0FBQyxTQUFVLENBQUM7UUFDaEUsSUFBSSxDQUFDLE9BQU8sR0FBNkMsR0FBSSxDQUFDLElBQUksQ0FBQyxPQUFRLENBQUM7UUFDNUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUMxQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLGFB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SSxDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLEVBQUUsVUFBQyxNQUFNO2dCQUNyRCxLQUFJLENBQUMsYUFBYSxDQUFDLG1CQUFtQixDQUFDLFlBQVksRUFBRSxFQUFDLE1BQU0sRUFBRSxLQUFJLEVBQUUsTUFBTSxRQUFBLEVBQUMsQ0FBQyxDQUFDO1lBQ2pGLENBQUMsQ0FBQyxDQUFDO1NBQ047UUFDRCxJQUFJLElBQUksQ0FBQyxhQUFhLENBQUMsWUFBWSxFQUFFO1lBQ2pDLElBQUksQ0FBQyxhQUFhLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxFQUFFLFVBQUMsTUFBTTtnQkFDckQsS0FBSSxDQUFDLGFBQWEsQ0FBQyxtQkFBbUIsQ0FBQyxZQUFZLEVBQUUsRUFBQyxNQUFNLEVBQUUsS0FBSSxFQUFFLE1BQU0sUUFBQSxFQUFDLENBQUMsQ0FBQztZQUNqRixDQUFDLENBQUMsQ0FBQztTQUNOO0lBQ0wsQ0FBQztJQUVELDJDQUFlLEdBQWY7UUFDSSxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztJQUM1QixDQUFDOztnQkFsSUosU0FBUyxTQUFDO29CQUNQLFFBQVEsRUFBRSxjQUFjO29CQUN4QixRQUFRLEVBQUUsYUFBYTtpQkFDMUI7Ozs7Z0JBZjBGLFFBQVE7Z0JBQS9DLFVBQVU7Z0JBSzVCLEdBQUc7OzsyQkF1QmhDLFdBQVcsU0FBQyxjQUFjOzhCQUMxQixXQUFXLFNBQUMsb0JBQW9COzBCQUVoQyxZQUFZLFNBQUMsT0FBTzs2QkFrQ3BCLEtBQUs7O0lBOEVWLHdCQUFDO0NBQUEsQUFuSUQsSUFtSUM7U0EvSFksaUJBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQWZ0ZXJWaWV3SW5pdCwgQ29udGVudENoaWxkcmVuLCBEaXJlY3RpdmUsIEVsZW1lbnRSZWYsIEhvc3RCaW5kaW5nLCBIb3N0TGlzdGVuZXIsIEluamVjdG9yLCBJbnB1dCwgT25Jbml0LCBRdWVyeUxpc3QgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IE5nRm9yT2ZDb250ZXh0IH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcblxuaW1wb3J0IHsgT2JzZXJ2YWJsZSwgU3ViamVjdCB9IGZyb20gJ3J4anMnO1xuXG5pbXBvcnQgeyAkaW52b2tlV2F0Y2hlcnMsICR3YXRjaCwgQXBwIH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5pbXBvcnQgeyBMaXN0Q29tcG9uZW50IH0gZnJvbSAnLi9saXN0LmNvbXBvbmVudCc7XG5pbXBvcnQgeyBXaWRnZXRSZWYgfSBmcm9tICcuLi8uLi9mcmFtZXdvcmsvdHlwZXMnO1xuXG5kZWNsYXJlIGNvbnN0ICQsIF87XG5cbkBEaXJlY3RpdmUoe1xuICAgIHNlbGVjdG9yOiAnW3dtTGlzdEl0ZW1dJyxcbiAgICBleHBvcnRBczogJ2xpc3RJdGVtUmVmJ1xufSlcbmV4cG9ydCBjbGFzcyBMaXN0SXRlbURpcmVjdGl2ZSBpbXBsZW1lbnRzIE9uSW5pdCwgQWZ0ZXJWaWV3SW5pdCB7XG5cbiAgICBwdWJsaWMgaXRlbTtcbiAgICBwdWJsaWMgY29udGV4dDtcbiAgICBwdWJsaWMgZGVzdHJveTogU3ViamVjdDxhbnk+ID0gbmV3IFN1YmplY3QoKTtcbiAgICBwdWJsaWMgZGVzdHJveSQ6IE9ic2VydmFibGU8YW55PiA9IHRoaXMuZGVzdHJveS5hc09ic2VydmFibGUoKTtcbiAgICBwdWJsaWMgbmF0aXZlRWxlbWVudDogSFRNTEVsZW1lbnQ7XG4gICAgcHVibGljIHJlYWRvbmx5IGxpc3RDb21wb25lbnQ6IExpc3RDb21wb25lbnQ7XG5cbiAgICBwcml2YXRlIGl0ZW1DbGFzcyA9ICcnO1xuICAgIHByaXZhdGUgX2N1cnJlbnRJdGVtV2lkZ2V0cyA9IHt9O1xuXG4gICAgQEhvc3RCaW5kaW5nKCdjbGFzcy5hY3RpdmUnKSBpc0FjdGl2ZSA9IGZhbHNlO1xuICAgIEBIb3N0QmluZGluZygnY2xhc3MuZGlzYWJsZS1pdGVtJykgZGlzYWJsZUl0ZW0gPSBmYWxzZTtcblxuICAgIEBIb3N0TGlzdGVuZXIoJ2ZvY3VzJylcbiAgICBvbkZvY3VzKCkge1xuICAgICAgICAvLyBtYWludGFpbnMgd2hpY2ggZWxlbWVudCBpcyBmb2N1c2VkL3NlbGVjdGVkIG1vc3QgcmVjZW50bHkuXG4gICAgICAgIHRoaXMubGlzdENvbXBvbmVudC5sYXN0U2VsZWN0ZWRJdGVtID0gdGhpcztcbiAgICB9XG5cbiAgICBnZXQgJGluZGV4KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb250ZXh0LmluZGV4O1xuICAgIH1cblxuICAgIGdldCAkZXZlbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29udGV4dC5ldmVuO1xuICAgIH1cblxuICAgIGdldCAkb2RkKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb250ZXh0Lm9kZDtcbiAgICB9XG5cbiAgICBnZXQgJGZpcnN0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5jb250ZXh0LmZpcnN0O1xuICAgIH1cblxuICAgIGdldCAkbGFzdCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29udGV4dC5sYXN0O1xuICAgIH1cblxuICAgIGdldCBjdXJyZW50SXRlbVdpZGdldHMgKCkge1xuICAgICAgICBjb25zdCBjb21wb25lbnRFbGVtZW50cyA9IEFycmF5LmZyb20odGhpcy5uYXRpdmVFbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1t3aWRnZXQtaWRdJykpO1xuICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih0aGlzLl9jdXJyZW50SXRlbVdpZGdldHMsIGNvbXBvbmVudEVsZW1lbnRzLnJlZHVjZSgocmVzdWx0LCBjb21wOiBhbnkpID0+IHtcbiAgICAgICAgICAgIHJlc3VsdFtjb21wLndpZGdldC5uYW1lXSA9IGNvbXAud2lkZ2V0O1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfSwge30pKTtcbiAgICB9XG5cbiAgICBASW5wdXQoKSBzZXQgd21MaXN0SXRlbSh2YWwpIHtcbiAgICAgICAgdGhpcy5pdGVtID0gdmFsO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgaW5qOiBJbmplY3RvciwgZWxSZWY6IEVsZW1lbnRSZWYsIHByaXZhdGUgYXBwOiBBcHApIHtcbiAgICAgICAgdGhpcy5uYXRpdmVFbGVtZW50ID0gZWxSZWYubmF0aXZlRWxlbWVudDtcbiAgICAgICAgdGhpcy5saXN0Q29tcG9uZW50ID0gKDxMaXN0Q29tcG9uZW50Pig8YW55Pmluaikudmlldy5jb21wb25lbnQpO1xuICAgICAgICB0aGlzLmNvbnRleHQgPSAoPE5nRm9yT2ZDb250ZXh0PExpc3RJdGVtRGlyZWN0aXZlPj4oPGFueT5pbmopLnZpZXcuY29udGV4dCk7XG4gICAgICAgIHRoaXMuaXRlbUNsYXNzV2F0Y2hlcih0aGlzLmxpc3RDb21wb25lbnQpO1xuICAgICAgICB0aGlzLmRpc2FibGVJdGVtV2F0Y2hlcih0aGlzLmxpc3RDb21wb25lbnQpO1xuICAgICAgICAkKHRoaXMubmF0aXZlRWxlbWVudCkuZGF0YSgnbGlzdEl0ZW1Db250ZXh0JywgdGhpcyk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZWdpc3RlcldhdGNoKGV4cHJlc3Npb246IHN0cmluZywgY2FsbGJhY2s6IEZ1bmN0aW9uKSB7XG4gICAgICAgIC8vIFJlbW92aW5nIG5nRm9yIGNvbnRleHQgYXMgdGhlIHNhbWUgcHJvcGVydGllcyBhcmUgYXZhaWxibGUgb24gbGlzdGl0ZW0gc2NvcGUuXG4gICAgICAgIC8vIHBhc3Npbmcgdmlld3BhcmVudCBjb250ZXh0IGZvciBhY2Nlc3NpbmcgdmFyaWJhbGVzIGFuZCB3aWRnZXRzLlxuICAgICAgICB0aGlzLmRlc3Ryb3kkLnN1YnNjcmliZSgkd2F0Y2goZXhwcmVzc2lvbiwgKHRoaXMubGlzdENvbXBvbmVudCBhcyBhbnkpLnZpZXdQYXJlbnQsIHRoaXMsIGNhbGxiYWNrKSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpdGVtQ2xhc3NXYXRjaGVyKGxpc3RDb21wb25lbnQ6IExpc3RDb21wb25lbnQpIHtcbiAgICAgICAgaWYgKGxpc3RDb21wb25lbnQuYmluZGl0ZW1jbGFzcykge1xuICAgICAgICAgICAgdGhpcy5yZWdpc3RlcldhdGNoKGxpc3RDb21wb25lbnQuYmluZGl0ZW1jbGFzcywgbnYgPT4gdGhpcy5pdGVtQ2xhc3MgPSBudiB8fCAnJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLml0ZW1DbGFzcyA9IGxpc3RDb21wb25lbnQuaXRlbWNsYXNzO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBkaXNhYmxlSXRlbVdhdGNoZXIoJGxpc3Q6IExpc3RDb21wb25lbnQpIHtcbiAgICAgICAgaWYgKCRsaXN0LmJpbmRkaXNhYmxlaXRlbSkge1xuICAgICAgICAgICAgdGhpcy5yZWdpc3RlcldhdGNoKCRsaXN0LmJpbmRkaXNhYmxlaXRlbSwgbnYgPT4gdGhpcy5kaXNhYmxlSXRlbSA9IG52IHx8IGZhbHNlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZGlzYWJsZUl0ZW0gPSAkbGlzdC5kaXNhYmxlaXRlbSB8fCBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgdHJpZ2dlcldNRXZlbnQoZXZlbnROYW1lKSB7XG4gICAgICAgICRpbnZva2VXYXRjaGVycyh0cnVlKTtcbiAgICAgICAgLy8gSWYgd2UgaGF2ZSBtdWx0aXNlbGVjdCBmb3IgdGhlIGxpdmVsaXN0KExpc3Qgd2l0aCBmb3JtIHRlbXBsYXRlKSwgaW4gcnVuIG1vZGUgZGVsZXRpbmcgYSByZWNvcmQgaXMgZ2V0dGluZyBmYWlsZWQuIEJlY3Vhc2UgdGhlIHNlbGVjdGVkaXRlbSB3aWxsIGJlIGFycmF5IG9mIG9iamVjdHMuIFNvIGNvbnNpZGVyIHRoZSBsYXN0IG9iamVjdC5cbiAgICAgICAgY29uc3Qgcm93ID0gdGhpcy5saXN0Q29tcG9uZW50Lm11bHRpc2VsZWN0ID8gXy5sYXN0KHRoaXMubGlzdENvbXBvbmVudC5zZWxlY3RlZGl0ZW0pIDogdGhpcy5saXN0Q29tcG9uZW50LnNlbGVjdGVkaXRlbTtcbiAgICAgICAgdGhpcy5hcHAubm90aWZ5KCd3bS1ldmVudCcsIHtldmVudE5hbWUsIHdpZGdldE5hbWU6IHRoaXMubGlzdENvbXBvbmVudC5uYW1lLCByb3c6IHJvd30pO1xuICAgIH1cblxuICAgIHByaXZhdGUgc2V0VXBDVURIYW5kbGVycygpIHtcbiAgICAgICAgY29uc3QgJGVkaXRJdGVtID0gdGhpcy5uYXRpdmVFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJy5lZGl0LWxpc3QtaXRlbScpO1xuICAgICAgICBjb25zdCAkZGVsZXRlSXRlbSA9IHRoaXMubmF0aXZlRWxlbWVudC5xdWVyeVNlbGVjdG9yKCcuZGVsZXRlLWxpc3QtaXRlbScpO1xuXG4gICAgICAgIGlmICgkZWRpdEl0ZW0pIHtcbiAgICAgICAgICAgIC8vIFRyaWdnZXJlZCBvbiBjbGljayBvZiBlZGl0IGFjdGlvblxuICAgICAgICAgICAgJGVkaXRJdGVtLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZXZ0ID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnRyaWdnZXJXTUV2ZW50KCd1cGRhdGUnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCRkZWxldGVJdGVtKSB7XG4gICAgICAgICAgICAvLyBUcmlnZ2VyZWQgb24gY2xpY2sgb2YgZGVsZXRlIGFjdGlvblxuICAgICAgICAgICAgJGRlbGV0ZUl0ZW0uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBldnQgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMudHJpZ2dlcldNRXZlbnQoJ2RlbGV0ZScpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cblxuICAgIG5nT25Jbml0KCkge1xuICAgICAgICBpZiAodGhpcy5saXN0Q29tcG9uZW50Lm1vdXNlRW50ZXJDQikge1xuICAgICAgICAgICAgdGhpcy5uYXRpdmVFbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZW50ZXInLCAoJGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5saXN0Q29tcG9uZW50Lmludm9rZUV2ZW50Q2FsbGJhY2soJ21vdXNlZW50ZXInLCB7d2lkZ2V0OiB0aGlzLCAkZXZlbnR9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmxpc3RDb21wb25lbnQubW91c2VMZWF2ZUNCKSB7XG4gICAgICAgICAgICB0aGlzLm5hdGl2ZUVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsICgkZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmxpc3RDb21wb25lbnQuaW52b2tlRXZlbnRDYWxsYmFjaygnbW91c2VsZWF2ZScsIHt3aWRnZXQ6IHRoaXMsICRldmVudH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBuZ0FmdGVyVmlld0luaXQoKSB7XG4gICAgICAgIHRoaXMuc2V0VXBDVURIYW5kbGVycygpO1xuICAgIH1cbn1cbiJdfQ==