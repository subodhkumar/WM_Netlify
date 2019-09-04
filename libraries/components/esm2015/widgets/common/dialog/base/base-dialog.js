import { BsModalService } from 'ngx-bootstrap';
import { AbstractDialogService } from '@wm/core';
import { BaseComponent } from '../../base/base.component';
let eventsRegistered = false;
const findRootContainer = ($el) => {
    let root = $el.closest('.app-prefab');
    if (!root.length) {
        root = $el.closest('.app-partial');
    }
    if (!root.length) {
        root = $el.closest('.app-page');
    }
    return root.length && root.parent()[0].tagName;
};
const ɵ0 = findRootContainer;
const invokeOpenedCallback = (ref) => {
    if (ref) {
        setTimeout(() => {
            const root = findRootContainer(ref.$element);
            // if page styles have to be applied to dialog then dialog has to be child of page element.
            if (root) {
                $('body:first > modal-container > div').wrap('<' + root + '/>');
            }
            ref.invokeEventCallback('opened', { $event: { type: 'opened' } });
        });
    }
};
const ɵ1 = invokeOpenedCallback;
const invokeClosedCallback = (ref) => {
    if (ref) {
        ref.invokeEventCallback('close');
        ref.dialogRef = undefined;
    }
};
const ɵ2 = invokeClosedCallback;
export class BaseDialog extends BaseComponent {
    constructor(inj, widgetConfig, modalOptions) {
        super(inj, widgetConfig);
        this.modalOptions = modalOptions;
        this.dialogService = inj.get(AbstractDialogService);
        this.bsModal = inj.get(BsModalService);
        // Subscribe to onShown and onHidden events only once as we will not be
        // unsubscribing to the,m ever and we will handle the logic of calling
        // respective dialog callbacks.
        if (!eventsRegistered) {
            eventsRegistered = true;
            this.bsModal.onShown.subscribe(() => {
                // Always get the reference of last pushed dialog in the array for calling onOpen callback
                invokeOpenedCallback(this.dialogService.getLastOpenedDialog());
            });
            this.bsModal.onHidden.subscribe((closeReason) => {
                const ref = closeReason === 'esc' || closeReason === 'backdrop-click' ? this.dialogService.getLastOpenedDialog() : this.dialogService.getDialogRefFromClosedDialogs();
                // remove the dialog reference from opened dialogs and closed dialogs
                this.dialogService.removeFromOpenedDialogs(ref);
                this.dialogService.removeFromClosedDialogs(ref);
                invokeClosedCallback(ref);
            });
        }
    }
    /**
     * Opens the dialog
     * Subscribe to the onShown event emitter of bsModal and trigger on-opened event callback
     */
    open(initState) {
        // remove the popovers in the page to avoid the overlap with dialog
        // closePopover(this.$element); Commenting this line because it is causing regression(if we have dialog inside popover as partail content, then the dialog close is not working because on closing the popover the partial get destroyed.)
        // do not open the dialog again if it is already opened
        const duplicateDialogCheck = (openedDialog) => {
            return openedDialog === this;
        };
        if (this.dialogService.getOpenedDialogs().some(duplicateDialogCheck)) {
            return;
        }
        this.dialogService.addToOpenedDialogs(this);
        // extend the context with the initState
        Object.assign(this.context, initState);
        this.dialogRef = this.bsModal.show(this.getTemplateRef(), this.modalOptions);
    }
    /**
     * closes the dialog
     * invokes the on-close event callback
     */
    close() {
        // remove the popovers in the page to avoid the overlap with dialog
        // closePopover(this.$element); Commenting this line because it is causing regression(if we have dialog inside popover as partail content, then the dialog close is not working because on closing the popover the partial get destroyed.)
        if (this.dialogRef) {
            this.dialogService.addToClosedDialogs(this);
            this.dialogRef.hide();
        }
    }
    /**
     * Register the dialog with the dialog service for programmatic access
     */
    register(scope) {
        // add scope along with name in the dialogRefsCollection Map while registering dialog
        // So that 2 dialogs having same name on different pages won't be overridden.
        this.dialogService.register(this.name, this, scope);
    }
    /**
     * De Register the dialog with the dialog service after dialog destruction
     */
    deRegister(scope) {
        this.dialogService.deRegister(this.name, scope);
    }
    onPropertyChange(key, nv, ov) {
        // ignore the class attribute.
        // Prevent the framework from setting the class on the host element.
        if (key === 'class' || key === 'name' || key === 'tabindex') {
            return;
        }
        else if (key === 'animation') {
            this.modalOptions.class = this.modalOptions.class.replace('animated ' + ov, '');
            if (nv) {
                this.modalOptions.class = this.modalOptions.class + 'animated ' + nv;
            }
        }
        super.onPropertyChange(key, nv, ov);
    }
    ngOnDestroy() {
        this.close();
        this.deRegister(this.viewParent);
        super.ngOnDestroy();
    }
}
export { ɵ0, ɵ1, ɵ2 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFzZS1kaWFsb2cuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL2RpYWxvZy9iYXNlL2Jhc2UtZGlhbG9nLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBYyxjQUFjLEVBQWdCLE1BQU0sZUFBZSxDQUFDO0FBRXpFLE9BQU8sRUFBRSxxQkFBcUIsRUFBZ0IsTUFBTSxVQUFVLENBQUM7QUFHL0QsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBSTFELElBQUksZ0JBQWdCLEdBQUcsS0FBSyxDQUFDO0FBRTdCLE1BQU0saUJBQWlCLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRTtJQUM5QixJQUFJLElBQUksR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQyxDQUFDO0lBQ3RDLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFO1FBQ2QsSUFBSSxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7S0FDdEM7SUFDRCxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRTtRQUNkLElBQUksR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0tBQ25DO0lBQ0QsT0FBTyxJQUFJLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUM7QUFDbkQsQ0FBQyxDQUFDOztBQUVGLE1BQU0sb0JBQW9CLEdBQUcsQ0FBQyxHQUFHLEVBQUUsRUFBRTtJQUNqQyxJQUFJLEdBQUcsRUFBRTtRQUNMLFVBQVUsQ0FBQyxHQUFHLEVBQUU7WUFDWixNQUFNLElBQUksR0FBRyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDN0MsMkZBQTJGO1lBQzNGLElBQUksSUFBSSxFQUFFO2dCQUNOLENBQUMsQ0FBQyxvQ0FBb0MsQ0FBQyxD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LENBQUM7SUFFTSxXQUFXO1FBQ2QsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO1FBQ2IsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7UUFDakMsS0FBSyxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ3hCLENBQUM7Q0FDSiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdG9yLCBPbkRlc3Ryb3ksIFRlbXBsYXRlUmVmIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBCc01vZGFsUmVmLCBCc01vZGFsU2VydmljZSwgTW9kYWxPcHRpb25zIH0gZnJvbSAnbmd4LWJvb3RzdHJhcCc7XG5cbmltcG9ydCB7IEFic3RyYWN0RGlhbG9nU2VydmljZSwgY2xvc2VQb3BvdmVyIH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5pbXBvcnQgeyBJRGlhbG9nLCBJV2lkZ2V0Q29uZmlnIH0gZnJvbSAnLi4vLi4vLi4vZnJhbWV3b3JrL3R5cGVzJztcbmltcG9ydCB7IEJhc2VDb21wb25lbnQgfSBmcm9tICcuLi8uLi9iYXNlL2Jhc2UuY29tcG9uZW50JztcblxuZGVjbGFyZSBjb25zdCBfO1xuXG5sZXQgZXZlbnRzUmVnaXN0ZXJlZCA9IGZhbHNlO1xuXG5jb25zdCBmaW5kUm9vdENvbnRhaW5lciA9ICgkZWwpID0+IHtcbiAgICBsZXQgcm9vdCA9ICRlbC5jbG9zZXN0KCcuYXBwLXByZWZhYicpO1xuICAgIGlmICghcm9vdC5sZW5ndGgpIHtcbiAgICAgICAgcm9vdCA9ICRlbC5jbG9zZXN0KCcuYXBwLXBhcnRpYWwnKTtcbiAgICB9XG4gICAgaWYgKCFyb290Lmxlbmd0aCkge1xuICAgICAgICByb290ID0gJGVsLmNsb3Nlc3QoJy5hcHAtcGFnZScpO1xuICAgIH1cbiAgICByZXR1cm4gcm9vdC5sZW5ndGggJiYgcm9vdC5wYXJlbnQoKVswXS50YWdOYW1lO1xufTtcblxuY29uc3QgaW52b2tlT3BlbmVkQ2FsbGJhY2sgPSAocmVmKSA9PiB7XG4gICAgaWYgKHJlZikge1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHJvb3QgPSBmaW5kUm9vdENvbnRhaW5lcihyZWYuJGVsZW1lbnQpO1xuICAgICAgICAgICAgLy8gaWYgcGFnZSBzdHlsZXMgaGF2ZSB0byBiZSBhcHBsaWVkIHRvIGRpYWxvZyB0aGVuIGRpYWxvZyBoYXMgdG8gYmUgY2hpbGQgb2YgcGFnZSBlbGVtZW50LlxuICAgICAgICAgICAgaWYgKHJvb3QpIHtcbiAgICAgICAgICAgICAgICAkKCdib2R5OmZpcnN0ID4gbW9kYWwtY29udGFpbmVyID4gZGl2Jykud3JhcCgnPCcgKyByb290ICsgJy8+Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZWYuaW52b2tlRXZlbnRDYWxsYmFjaygnb3BlbmVkJywgeyRldmVudDoge3R5cGU6ICdvcGVuZWQnfX0pO1xuICAgICAgICB9KTtcbiAgICB9XG59O1xuXG5jb25zdCBpbnZva2VDbG9zZWRDYWxsYmFjayA9IChyZWYpID0+IHtcbiAgICBpZiAocmVmKSB7XG4gICAgICAgIHJlZi5pbnZva2VFdmVudENhbGxiYWNrKCdjbG9zZScpO1xuICAgICAgICByZWYuZGlhbG9nUmVmID0gdW5kZWZpbmVkO1xuICAgIH1cbn07XG5cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBCYXNlRGlhbG9nIGV4dGVuZHMgQmFzZUNvbXBvbmVudCBpbXBsZW1lbnRzIElEaWFsb2csIE9uRGVzdHJveSB7XG5cbiAgICBwdWJsaWMgbmFtZTogc3RyaW5nO1xuXG4gICAgcHJpdmF0ZSByZWFkb25seSBkaWFsb2dTZXJ2aWNlOiBBYnN0cmFjdERpYWxvZ1NlcnZpY2U7XG4gICAgcHJpdmF0ZSByZWFkb25seSBic01vZGFsOiBCc01vZGFsU2VydmljZTtcblxuICAgIHByaXZhdGUgZGlhbG9nUmVmOiBCc01vZGFsUmVmO1xuXG4gICAgcHJvdGVjdGVkIGNvbnN0cnVjdG9yKFxuICAgICAgICBpbmo6IEluamVjdG9yLFxuICAgICAgICB3aWRnZXRDb25maWc6IElXaWRnZXRDb25maWcsXG4gICAgICAgIHByb3RlY3RlZCBtb2RhbE9wdGlvbnM6IE1vZGFsT3B0aW9uc1xuICAgICkge1xuICAgICAgICBzdXBlcihpbmosIHdpZGdldENvbmZpZyk7XG4gICAgICAgIHRoaXMuZGlhbG9nU2VydmljZSA9IGluai5nZXQoQWJzdHJhY3REaWFsb2dTZXJ2aWNlKTtcbiAgICAgICAgdGhpcy5ic01vZGFsID0gaW5qLmdldChCc01vZGFsU2VydmljZSk7XG5cbiAgICAgICAgLy8gU3Vic2NyaWJlIHRvIG9uU2hvd24gYW5kIG9uSGlkZGVuIGV2ZW50cyBvbmx5IG9uY2UgYXMgd2Ugd2lsbCBub3QgYmVcbiAgICAgICAgLy8gdW5zdWJzY3JpYmluZyB0byB0aGUsbSBldmVyIGFuZCB3ZSB3aWxsIGhhbmRsZSB0aGUgbG9naWMgb2YgY2FsbGluZ1xuICAgICAgICAvLyByZXNwZWN0aXZlIGRpYWxvZyBjYWxsYmFja3MuXG4gICAgICAgIGlmICghZXZlbnRzUmVnaXN0ZXJlZCkge1xuICAgICAgICAgICAgZXZlbnRzUmVnaXN0ZXJlZCA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLmJzTW9kYWwub25TaG93bi5zdWJzY3JpYmUoKCkgPT4ge1xuICAgICAgICAgICAgICAgIC8vIEFsd2F5cyBnZXQgdGhlIHJlZmVyZW5jZSBvZiBsYXN0IHB1c2hlZCBkaWFsb2cgaW4gdGhlIGFycmF5IGZvciBjYWxsaW5nIG9uT3BlbiBjYWxsYmFja1xuICAgICAgICAgICAgICAgIGludm9rZU9wZW5lZENhbGxiYWNrKHRoaXMuZGlhbG9nU2VydmljZS5nZXRMYXN0T3BlbmVkRGlhbG9nKCkpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHRoaXMuYnNNb2RhbC5vbkhpZGRlbi5zdWJzY3JpYmUoKGNsb3NlUmVhc29uKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgcmVmID0gY2xvc2VSZWFzb24gPT09ICdlc2MnIHx8IGNsb3NlUmVhc29uID09PSAnYmFja2Ryb3AtY2xpY2snID8gdGhpcy5kaWFsb2dTZXJ2aWNlLmdldExhc3RPcGVuZWREaWFsb2coKSA6IHRoaXMuZGlhbG9nU2VydmljZS5nZXREaWFsb2dSZWZGcm9tQ2xvc2VkRGlhbG9ncygpO1xuICAgICAgICAgICAgICAgIC8vIHJlbW92ZSB0aGUgZGlhbG9nIHJlZmVyZW5jZSBmcm9tIG9wZW5lZCBkaWFsb2dzIGFuZCBjbG9zZWQgZGlhbG9nc1xuICAgICAgICAgICAgICAgIHRoaXMuZGlhbG9nU2VydmljZS5yZW1vdmVGcm9tT3BlbmVkRGlhbG9ncyhyZWYpO1xuICAgICAgICAgICAgICAgIHRoaXMuZGlhbG9nU2VydmljZS5yZW1vdmVGcm9tQ2xvc2VkRGlhbG9ncyhyZWYpO1xuICAgICAgICAgICAgICAgIGludm9rZUNsb3NlZENhbGxiYWNrKHJlZik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE9wZW5zIHRoZSBkaWFsb2dcbiAgICAgKiBTdWJzY3JpYmUgdG8gdGhlIG9uU2hvd24gZXZlbnQgZW1pdHRlciBvZiBic01vZGFsIGFuZCB0cmlnZ2VyIG9uLW9wZW5lZCBldmVudCBjYWxsYmFja1xuICAgICAqL1xuICAgIHB1YmxpYyBvcGVuKGluaXRTdGF0ZT86IGFueSkge1xuXG4gICAgICAgIC8vIHJlbW92ZSB0aGUgcG9wb3ZlcnMgaW4gdGhlIHBhZ2UgdG8gYXZvaWQgdGhlIG92ZXJsYXAgd2l0aCBkaWFsb2dcbiAgICAgICAgLy8gY2xvc2VQb3BvdmVyKHRoaXMuJGVsZW1lbnQpOyBDb21tZW50aW5nIHRoaXMgbGluZSBiZWNhdXNlIGl0IGlzIGNhdXNpbmcgcmVncmVzc2lvbihpZiB3ZSBoYXZlIGRpYWxvZyBpbnNpZGUgcG9wb3ZlciBhcyBwYXJ0YWlsIGNvbnRlbnQsIHRoZW4gdGhlIGRpYWxvZyBjbG9zZSBpcyBub3Qgd29ya2luZyBiZWNhdXNlIG9uIGNsb3NpbmcgdGhlIHBvcG92ZXIgdGhlIHBhcnRpYWwgZ2V0IGRlc3Ryb3llZC4pXG5cbiAgICAgICAgLy8gZG8gbm90IG9wZW4gdGhlIGRpYWxvZyBhZ2FpbiBpZiBpdCBpcyBhbHJlYWR5IG9wZW5lZFxuICAgICAgICBjb25zdCBkdXBsaWNhdGVEaWFsb2dDaGVjayA9IChvcGVuZWREaWFsb2cpID0+IHtcbiAgICAgICAgICAgcmV0dXJuIG9wZW5lZERpYWxvZyA9PT0gdGhpcztcbiAgICAgICAgfTtcblxuICAgICAgICBpZiAodGhpcy5kaWFsb2dTZXJ2aWNlLmdldE9wZW5lZERpYWxvZ3MoKS5zb21lKGR1cGxpY2F0ZURpYWxvZ0NoZWNrKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5kaWFsb2dTZXJ2aWNlLmFkZFRvT3BlbmVkRGlhbG9ncyh0aGlzKTtcblxuICAgICAgICAvLyBleHRlbmQgdGhlIGNvbnRleHQgd2l0aCB0aGUgaW5pdFN0YXRlXG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcy5jb250ZXh0LCBpbml0U3RhdGUpO1xuICAgICAgICB0aGlzLmRpYWxvZ1JlZiA9IHRoaXMuYnNNb2RhbC5zaG93KHRoaXMuZ2V0VGVtcGxhdGVSZWYoKSwgdGhpcy5tb2RhbE9wdGlvbnMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIGNsb3NlcyB0aGUgZGlhbG9nXG4gICAgICogaW52b2tlcyB0aGUgb24tY2xvc2UgZXZlbnQgY2FsbGJhY2tcbiAgICAgKi9cbiAgICBwdWJsaWMgY2xvc2UoKSB7XG4gICAgICAgIC8vIHJlbW92ZSB0aGUgcG9wb3ZlcnMgaW4gdGhlIHBhZ2UgdG8gYXZvaWQgdGhlIG92ZXJsYXAgd2l0aCBkaWFsb2dcbiAgICAgICAgLy8gY2xvc2VQb3BvdmVyKHRoaXMuJGVsZW1lbnQpOyBDb21tZW50aW5nIHRoaXMgbGluZSBiZWNhdXNlIGl0IGlzIGNhdXNpbmcgcmVncmVzc2lvbihpZiB3ZSBoYXZlIGRpYWxvZyBpbnNpZGUgcG9wb3ZlciBhcyBwYXJ0YWlsIGNvbnRlbnQsIHRoZW4gdGhlIGRpYWxvZyBjbG9zZSBpcyBub3Qgd29ya2luZyBiZWNhdXNlIG9uIGNsb3NpbmcgdGhlIHBvcG92ZXIgdGhlIHBhcnRpYWwgZ2V0IGRlc3Ryb3llZC4pXG4gICAgICAgIGlmICh0aGlzLmRpYWxvZ1JlZikge1xuICAgICAgICAgICAgdGhpcy5kaWFsb2dTZXJ2aWNlLmFkZFRvQ2xvc2VkRGlhbG9ncyh0aGlzKTtcbiAgICAgICAgICAgIHRoaXMuZGlhbG9nUmVmLmhpZGUoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFJlZ2lzdGVyIHRoZSBkaWFsb2cgd2l0aCB0aGUgZGlhbG9nIHNlcnZpY2UgZm9yIHByb2dyYW1tYXRpYyBhY2Nlc3NcbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgcmVnaXN0ZXIoc2NvcGUpIHtcbiAgICAgICAgLy8gYWRkIHNjb3BlIGFsb25nIHdpdGggbmFtZSBpbiB0aGUgZGlhbG9nUmVmc0NvbGxlY3Rpb24gTWFwIHdoaWxlIHJlZ2lzdGVyaW5nIGRpYWxvZ1xuICAgICAgICAvLyBTbyB0aGF0IDIgZGlhbG9ncyBoYXZpbmcgc2FtZSBuYW1lIG9uIGRpZmZlcmVudCBwYWdlcyB3b24ndCBiZSBvdmVycmlkZGVuLlxuICAgICAgICB0aGlzLmRpYWxvZ1NlcnZpY2UucmVnaXN0ZXIodGhpcy5uYW1lLCB0aGlzLCBzY29wZSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRGUgUmVnaXN0ZXIgdGhlIGRpYWxvZyB3aXRoIHRoZSBkaWFsb2cgc2VydmljZSBhZnRlciBkaWFsb2cgZGVzdHJ1Y3Rpb25cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgZGVSZWdpc3RlcihzY29wZSkge1xuICAgICAgICB0aGlzLmRpYWxvZ1NlcnZpY2UuZGVSZWdpc3Rlcih0aGlzLm5hbWUsIHNjb3BlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBzdWJjbGFzc2VzIG9mIEJhc2VEaWFsb2cgbXVzdCBpbXBsZW1lbnQgdGhpcyBtZXRob2QgdG8gcmV0dXJuIHRoZSBwcm9wZXIgdGVtcGxhdGUgZWxlbWVudCByZWZcbiAgICAgKiBic01vZGFsIHdpbGwgdXNlIHRoaXMgcmVmZW5jZSB0byBvcGVuIHRoZSBkaWFsb2dcbiAgICAgKiBAcmV0dXJucyB7VGVtcGxhdGVSZWY8YW55Pn1cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgYWJzdHJhY3QgZ2V0VGVtcGxhdGVSZWYoKTogVGVtcGxhdGVSZWY8YW55PjtcblxuICAgIHByb3RlY3RlZCBvblByb3BlcnR5Q2hhbmdlKGtleTogc3RyaW5nLCBudjogYW55LCBvdj86IGFueSkge1xuICAgICAgICAvLyBpZ25vcmUgdGhlIGNsYXNzIGF0dHJpYnV0ZS5cbiAgICAgICAgLy8gUHJldmVudCB0aGUgZnJhbWV3b3JrIGZyb20gc2V0dGluZyB0aGUgY2xhc3Mgb24gdGhlIGhvc3QgZWxlbWVudC5cbiAgICAgICAgaWYgKGtleSA9PT0gJ2NsYXNzJyB8fCBrZXkgPT09ICduYW1lJyB8fCBrZXkgPT09ICd0YWJpbmRleCcpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfSBlbHNlIGlmIChrZXkgPT09ICdhbmltYXRpb24nKSB7XG4gICAgICAgICAgICB0aGlzLm1vZGFsT3B0aW9ucy5jbGFzcyA9IHRoaXMubW9kYWxPcHRpb25zLmNsYXNzLnJlcGxhY2UoJ2FuaW1hdGVkICcgKyBvdiwgJycpO1xuICAgICAgICAgICAgaWYgKG52KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tb2RhbE9wdGlvbnMuY2xhc3MgPSB0aGlzLm1vZGFsT3B0aW9ucy5jbGFzcyArICdhbmltYXRlZCAnICsgbnY7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgc3VwZXIub25Qcm9wZXJ0eUNoYW5nZShrZXksIG52LCBvdik7XG4gICAgfVxuXG4gICAgcHVibGljIG5nT25EZXN0cm95KCkge1xuICAgICAgICB0aGlzLmNsb3NlKCk7XG4gICAgICAgIHRoaXMuZGVSZWdpc3Rlcih0aGlzLnZpZXdQYXJlbnQpO1xuICAgICAgICBzdXBlci5uZ09uRGVzdHJveSgpO1xuICAgIH1cbn1cbiJdfQ==