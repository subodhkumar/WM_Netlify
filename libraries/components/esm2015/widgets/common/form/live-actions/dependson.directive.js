import { Directive, Attribute, ContentChildren } from '@angular/core';
import { AbstractDialogService, App } from '@wm/core';
import { FormComponent } from '../form.component';
import { Live_Operations } from '../../../../utils/data-utils';
export class DependsonDirective {
    constructor(dialogId, dependson, dialogService, app) {
        this.dialogService = dialogService;
        this.app = app;
        // If dialogId is present, form is in dialog mode
        if (dialogId) {
            this.isLayoutDialog = true;
            this.dialogId = dialogId;
        }
        this.dependson = dependson;
        // Listen to the wm-event called from subscribed widgets
        this.eventSubscription = this.app.subscribe('wm-event', this.handleEvent.bind(this));
    }
    openFormDialog() {
        this.dialogService.open(this.dialogId);
    }
    onUpdate() {
        this.form.operationType = Live_Operations.UPDATE;
        this.form.isSelected = true;
        this.form.edit();
    }
    onInsert() {
        this.form.operationType = Live_Operations.INSERT;
        this.form.isSelected = true;
        this.form.new();
    }
    handleEvent(options) {
        if (this.dependson !== options.widgetName) {
            return;
        }
        this.currentOp = options.eventName;
        switch (options.eventName) {
            case Live_Operations.UPDATE:
                if (this.isLayoutDialog) {
                    this.openFormDialog();
                }
                else {
                    this.onUpdate();
                }
                break;
            case Live_Operations.INSERT:
                if (this.isLayoutDialog) {
                    this.openFormDialog();
                }
                else {
                    this.onInsert();
                }
                break;
            case Live_Operations.DELETE:
                this.app.Widgets[this.dependson].call('delete', { row: options.row });
                break;
            case Live_Operations.READ:
                if (!this.isLayoutDialog) {
                    this.form.isUpdateMode = false;
                }
                break;
        }
    }
    onFormRender() {
        // On opening the form in dialog mode, complete the pending operations
        if (this.form && this.isLayoutDialog) {
            setTimeout(() => {
                if (this.currentOp === Live_Operations.UPDATE) {
                    this.onUpdate();
                }
                else if (this.currentOp === Live_Operations.INSERT) {
                    this.onInsert();
                }
            }, 250);
        }
    }
    ngAfterContentInit() {
        // If form instance is present, form is in inline mode. Else, it is in dialog mode and listen to form instance changes
        if (this.formChildren.first) {
            this.form = this.formChildren.first;
        }
        else {
            this.formSubscription = this.formChildren.changes.subscribe((val) => {
                this.form = val.first;
                this.onFormRender();
            });
        }
    }
    ngOnDestroy() {
        if (this.formSubscription) {
            this.formSubscription.unsubscribe();
        }
        if (this.eventSubscription) {
            this.eventSubscription();
        }
    }
}
DependsonDirective.decorators = [
    { type: Directive, args: [{
                selector: '[dependson]'
            },] }
];
/** @nocollapse */
DependsonDirective.ctorParameters = () => [
    { type: String, decorators: [{ type: Attribute, args: ['dialogid',] }] },
    { type: String, decorators: [{ type: Attribute, args: ['dependson',] }] },
    { type: AbstractDialogService },
    { type: App }
];
DependsonDirective.propDecorators = {
    formChildren: [{ type: ContentChildren, args: [FormComponent, { descendants: true },] }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGVwZW5kc29uLmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vZm9ybS9saXZlLWFjdGlvbnMvZGVwZW5kc29uLmRpcmVjdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxlQUFlLEVBQStCLE1BQU0sZUFBZSxDQUFDO0FBRW5HLE9BQU8sRUFBRSxxQkFBcUIsRUFBRSxHQUFHLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFdEQsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQ2xELE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSw4QkFBOEIsQ0FBQztBQUsvRCxNQUFNLE9BQU8sa0JBQWtCO0lBWTNCLFlBQzJCLFFBQWdCLEVBQ2YsU0FBaUIsRUFDakMsYUFBb0MsRUFDcEMsR0FBUTtRQURSLGtCQUFhLEdBQWIsYUFBYSxDQUF1QjtRQUNwQyxRQUFHLEdBQUgsR0FBRyxDQUFLO1FBRWhCLGlEQUFpRDtRQUNqRCxJQUFJLFFBQVEsRUFBRTtZQUNWLElBQUksQ0FBQyxjQUFjLEdBQUcsSUFBSSxDQUFDO1lBQzNCLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1NBQzVCO1FBQ0QsSUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7UUFDM0Isd0RBQXdEO1FBQ3hELElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUN6RixDQUFDO0lBRU8sY0FBYztRQUNsQixJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDM0MsQ0FBQztJQUVPLFFBQVE7UUFDWixJQUFJLENBQUMsSUFB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QUFXLEVBQUUsQ0FBQztTQUN2QztRQUNELElBQUksSUFBSSxDQUFDLGlCQUFpQixFQUFFO1lBQ3hCLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO1NBQzVCO0lBQ0wsQ0FBQzs7O1lBOUdKLFNBQVMsU0FBQztnQkFDUCxRQUFRLEVBQUUsYUFBYTthQUMxQjs7Ozt5Q0FjUSxTQUFTLFNBQUMsVUFBVTt5Q0FDcEIsU0FBUyxTQUFDLFdBQVc7WUF0QnJCLHFCQUFxQjtZQUFFLEdBQUc7OzsyQkFVOUIsZUFBZSxTQUFDLGFBQWEsRUFBRSxFQUFDLFdBQVcsRUFBRSxJQUFJLEVBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEaXJlY3RpdmUsIEF0dHJpYnV0ZSwgQ29udGVudENoaWxkcmVuLCBBZnRlckNvbnRlbnRJbml0LCBPbkRlc3Ryb3kgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgQWJzdHJhY3REaWFsb2dTZXJ2aWNlLCBBcHAgfSBmcm9tICdAd20vY29yZSc7XG5cbmltcG9ydCB7IEZvcm1Db21wb25lbnQgfSBmcm9tICcuLi9mb3JtLmNvbXBvbmVudCc7XG5pbXBvcnQgeyBMaXZlX09wZXJhdGlvbnMgfSBmcm9tICcuLi8uLi8uLi8uLi91dGlscy9kYXRhLXV0aWxzJztcblxuQERpcmVjdGl2ZSh7XG4gICAgc2VsZWN0b3I6ICdbZGVwZW5kc29uXSdcbn0pXG5leHBvcnQgY2xhc3MgRGVwZW5kc29uRGlyZWN0aXZlIGltcGxlbWVudHMgQWZ0ZXJDb250ZW50SW5pdCwgT25EZXN0cm95IHtcblxuICAgIEBDb250ZW50Q2hpbGRyZW4oRm9ybUNvbXBvbmVudCwge2Rlc2NlbmRhbnRzOiB0cnVlfSkgZm9ybUNoaWxkcmVuO1xuXG4gICAgcHJpdmF0ZSBkaWFsb2dJZDtcbiAgICBwcml2YXRlIGRlcGVuZHNvbjtcbiAgICBwcml2YXRlIGlzTGF5b3V0RGlhbG9nO1xuICAgIHByaXZhdGUgZm9ybTtcbiAgICBwcml2YXRlIGN1cnJlbnRPcDtcbiAgICBwcml2YXRlIGZvcm1TdWJzY3JpcHRpb247XG4gICAgcHJpdmF0ZSBldmVudFN1YnNjcmlwdGlvbjtcblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBAQXR0cmlidXRlKCdkaWFsb2dpZCcpIGRpYWxvZ0lkOiBzdHJpbmcsXG4gICAgICAgIEBBdHRyaWJ1dGUoJ2RlcGVuZHNvbicpIGRlcGVuZHNvbjogc3RyaW5nLFxuICAgICAgICBwcml2YXRlIGRpYWxvZ1NlcnZpY2U6IEFic3RyYWN0RGlhbG9nU2VydmljZSxcbiAgICAgICAgcHJpdmF0ZSBhcHA6IEFwcFxuICAgICkge1xuICAgICAgICAvLyBJZiBkaWFsb2dJZCBpcyBwcmVzZW50LCBmb3JtIGlzIGluIGRpYWxvZyBtb2RlXG4gICAgICAgIGlmIChkaWFsb2dJZCkge1xuICAgICAgICAgICAgdGhpcy5pc0xheW91dERpYWxvZyA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLmRpYWxvZ0lkID0gZGlhbG9nSWQ7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5kZXBlbmRzb24gPSBkZXBlbmRzb247XG4gICAgICAgIC8vIExpc3RlbiB0byB0aGUgd20tZXZlbnQgY2FsbGVkIGZyb20gc3Vic2NyaWJlZCB3aWRnZXRzXG4gICAgICAgIHRoaXMuZXZlbnRTdWJzY3JpcHRpb24gPSB0aGlzLmFwcC5zdWJzY3JpYmUoJ3dtLWV2ZW50JywgdGhpcy5oYW5kbGVFdmVudC5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9wZW5Gb3JtRGlhbG9nKCkge1xuICAgICAgICB0aGlzLmRpYWxvZ1NlcnZpY2Uub3Blbih0aGlzLmRpYWxvZ0lkKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uVXBkYXRlKCkge1xuICAgICAgICB0aGlzLmZvcm0ub3BlcmF0aW9uVHlwZSA9IExpdmVfT3BlcmF0aW9ucy5VUERBVEU7XG4gICAgICAgIHRoaXMuZm9ybS5pc1NlbGVjdGVkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5mb3JtLmVkaXQoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIG9uSW5zZXJ0KCkge1xuICAgICAgICB0aGlzLmZvcm0ub3BlcmF0aW9uVHlwZSA9IExpdmVfT3BlcmF0aW9ucy5JTlNFUlQ7XG4gICAgICAgIHRoaXMuZm9ybS5pc1NlbGVjdGVkID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5mb3JtLm5ldygpO1xuICAgIH1cblxuICAgIHByaXZhdGUgaGFuZGxlRXZlbnQob3B0aW9ucykge1xuICAgICAgICBpZiAodGhpcy5kZXBlbmRzb24gIT09IG9wdGlvbnMud2lkZ2V0TmFtZSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuY3VycmVudE9wID0gb3B0aW9ucy5ldmVudE5hbWU7XG4gICAgICAgIHN3aXRjaCAob3B0aW9ucy5ldmVudE5hbWUpIHtcbiAgICAgICAgICAgIGNhc2UgTGl2ZV9PcGVyYXRpb25zLlVQREFURTpcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5pc0xheW91dERpYWxvZykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm9wZW5Gb3JtRGlhbG9nKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICB0aGlzLm9uVXBkYXRlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBMaXZlX09wZXJhdGlvbnMuSU5TRVJUOlxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmlzTGF5b3V0RGlhbG9nKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub3BlbkZvcm1EaWFsb2coKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgIHRoaXMub25JbnNlcnQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIExpdmVfT3BlcmF0aW9ucy5ERUxFVEU6XG4gICAgICAgICAgICAgICAgKDxhbnk+dGhpcy5hcHApLldpZGdldHNbdGhpcy5kZXBlbmRzb25dLmNhbGwoJ2RlbGV0ZScsIHtyb3c6IG9wdGlvbnMucm93fSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIExpdmVfT3BlcmF0aW9ucy5SRUFEOlxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5pc0xheW91dERpYWxvZykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmZvcm0uaXNVcGRhdGVNb2RlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBvbkZvcm1SZW5kZXIoKSB7XG4gICAgICAgIC8vIE9uIG9wZW5pbmcgdGhlIGZvcm0gaW4gZGlhbG9nIG1vZGUsIGNvbXBsZXRlIHRoZSBwZW5kaW5nIG9wZXJhdGlvbnNcbiAgICAgICAgaWYgKHRoaXMuZm9ybSAmJiB0aGlzLmlzTGF5b3V0RGlhbG9nKSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jdXJyZW50T3AgPT09IExpdmVfT3BlcmF0aW9ucy5VUERBVEUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vblVwZGF0ZSgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5jdXJyZW50T3AgPT09IExpdmVfT3BlcmF0aW9ucy5JTlNFUlQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vbkluc2VydCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sIDI1MCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBuZ0FmdGVyQ29udGVudEluaXQoKSB7XG4gICAgICAgIC8vIElmIGZvcm0gaW5zdGFuY2UgaXMgcHJlc2VudCwgZm9ybSBpcyBpbiBpbmxpbmUgbW9kZS4gRWxzZSwgaXQgaXMgaW4gZGlhbG9nIG1vZGUgYW5kIGxpc3RlbiB0byBmb3JtIGluc3RhbmNlIGNoYW5nZXNcbiAgICAgICAgaWYgKHRoaXMuZm9ybUNoaWxkcmVuLmZpcnN0KSB7XG4gICAgICAgICAgICB0aGlzLmZvcm0gPSB0aGlzLmZvcm1DaGlsZHJlbi5maXJzdDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuZm9ybVN1YnNjcmlwdGlvbiA9IHRoaXMuZm9ybUNoaWxkcmVuLmNoYW5nZXMuc3Vic2NyaWJlKCh2YWwpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmZvcm0gPSB2YWwuZmlyc3Q7XG4gICAgICAgICAgICAgICAgdGhpcy5vbkZvcm1SZW5kZXIoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgbmdPbkRlc3Ryb3koKSB7XG4gICAgICAgIGlmICh0aGlzLmZvcm1TdWJzY3JpcHRpb24pIHtcbiAgICAgICAgICAgIHRoaXMuZm9ybVN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmV2ZW50U3Vic2NyaXB0aW9uKSB7XG4gICAgICAgICAgICB0aGlzLmV2ZW50U3Vic2NyaXB0aW9uKCk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=