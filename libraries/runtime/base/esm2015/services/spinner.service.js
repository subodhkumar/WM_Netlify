import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { AbstractSpinnerService } from '@wm/core';
const spinnerTemplate = `<div class="app-spinner">
                            <div class="spinner-message" aria-label="loading gif">
                                <i class="spinner-image animated infinite fa fa-circle-o-notch fa-spin"></i>
                                <div class="spinner-messages">
                                    <p class="spinner-messages-container"></p>
                               </div>
                            </div>
                         </div>`;
export class SpinnerServiceImpl extends AbstractSpinnerService {
    constructor() {
        super();
        this.spinnerId = 0;
        this.messageSource = new Subject();
        this.messagesByContext = {};
    }
    /**
     * returns the message source subject
     * @returns {Subject<any>}
     */
    getMessageSource() {
        return this.messageSource;
    }
    /**
     * show spinner on a container element
     */
    showContextSpinner(ctx, message, id) {
        const ctxMarkup = $('[name="' + ctx + '"]');
        this.messagesByContext[ctx] = this.messagesByContext[ctx] || {};
        // If the spinner already exists on the context
        // then just append the message to the existing spinner message
        // else add a new spinner
        if (Object.keys(this.messagesByContext[ctx]).length !== 0) {
            this.messagesByContext[ctx][id] = message;
            this.messagesByContext[ctx]['finalMessage'] = this.messagesByContext[ctx]['finalMessage'] + ' ' + this.messagesByContext[ctx][id];
            ctxMarkup.find('.spinner-messages-container').html(this.messagesByContext[ctx]['finalMessage']);
        }
        else {
            const ctxSpinnerTemp = $(spinnerTemplate);
            this.messagesByContext[ctx][id] = message;
            this.messagesByContext[ctx]['finalMessage'] = this.messagesByContext[ctx][id];
            ctxSpinnerTemp.find('.spinner-messages-container').html(this.messagesByContext[ctx]['finalMessage']);
            ctxMarkup.prepend(ctxSpinnerTemp);
        }
        return id;
    }
    /**
     * show the app spinner with provided message
     * @param msg
     * @returns {string}
     */
    showAppSpinner(msg, id) {
        const ctx = 'page';
        this.messagesByContext[ctx] = this.messagesByContext[ctx] || {};
        this.messagesByContext[ctx][id] = msg;
        this.messageSource.next({
            show: true,
            message: msg,
            messages: _.values(this.messagesByContext[ctx])
        });
    }
    /**
     * hides the spinner on a particular container(context)
     * @param ctx
     * @param id
     */
    hideContextSpinner(ctx, id) {
        delete this.messagesByContext[ctx][id];
        if (Object.keys(this.messagesByContext[ctx]).length === 1) {
            this.messagesByContext[ctx] = {};
        }
        const ctxMarkup = $('[name="' + ctx + '"]');
        ctxMarkup.find('.app-spinner').remove();
    }
    /**
     * show spinner
     * @param message
     * @param id
     * @param spinnerClass
     * @param spinnerContext
     * @param variableScopeId
     * @returns {any}
     */
    show(message, id, spinnerClass, spinnerContext, variableScopeId) {
        id = id || ++this.spinnerId;
        // if spinnerContext is passed, then append the spinner to the element(default method for variable calls).
        if (spinnerContext && spinnerContext !== 'page') {
            // return after the compiled spinner is appended to the element reference
            return this.showContextSpinner(spinnerContext, message, id);
        }
        this.showAppSpinner(message, id);
        return id;
    }
    /**
     * hide the spinner
     * @param spinnerId
     */
    hide(id) {
        // find the spinner context of the id from the messagesByContext
        const ctx = _.findKey(this.messagesByContext, function (obj) {
            return _.includes(_.keys(obj), id);
        }) || 'page';
        // if spinnerContext exists just remove the spinner from the reference and destroy the scope associated.
        if (ctx !== 'page') {
            this.hideContextSpinner(ctx, id);
            return;
        }
        if (id) {
            delete this.messagesByContext[ctx][id];
            const messages = _.values(this.messagesByContext[ctx]);
            const pageSpinnerCount = Object.keys(this.messagesByContext[ctx]).length;
            this.messageSource.next({
                show: messages.length ? true : false,
                messages: _.values(this.messagesByContext[ctx])
            });
            // If a page spinner has id and no messages left to display then remove that spinner.
            if (pageSpinnerCount === 0) {
                $('.app-spinner').remove();
            }
        }
        else {
            this.messagesByContext[ctx] = {};
        }
    }
}
SpinnerServiceImpl.decorators = [
    { type: Injectable }
];
/** @nocollapse */
SpinnerServiceImpl.ctorParameters = () => [];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3Bpbm5lci5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL3J1bnRpbWUvYmFzZS8iLCJzb3VyY2VzIjpbInNlcnZpY2VzL3NwaW5uZXIuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRTNDLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFFL0IsT0FBTyxFQUFFLHNCQUFzQixFQUFFLE1BQU0sVUFBVSxDQUFDO0FBSWxELE1BQU0sZUFBZSxHQUFHOzs7Ozs7O2dDQU9RLENBQUM7QUFHakMsTUFBTSxPQUFPLGtCQUFtQixTQUFRLHNCQUFzQjtJQUsxRDtRQUNJLEtBQUssRUFBRSxDQUFDO1FBTFosY0FBUyxHQUFHLENBQUMsQ0FBQztRQUNkLGtCQUFhLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQztRQUM5QixzQkFBaUIsR0FBRyxFQUFFLENBQUM7SUFJdkIsQ0FBQztJQUVEOzs7T0FHRztJQUNILGdCQUFnQjtRQUNaLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQztJQUM5QixDQUFDO0lBRUQ7O09BRUc7SUFDSCxrQkFBa0IsQ0FBQyxHQUFXLEVBQUUsT0FBZSxFQUFFLEVBQVU7UUFDdkQsTUFBTSxTQUFTLEdBQUcsQ0FBQyxDQUFDLFNBQVMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLENBQUM7UUFDNUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7UUFDaEUsK0NBQStDO1FBQy9DLCtEQUErRDtRQUMvRCx5QkFBeUI7UUFDekIsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUc7WUFDeEQsSUFBSSxDQUFDLGlCQUFpQixDQUFD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QUFxRjtZQUNyRixJQUFJLGdCQUFnQixLQUFLLENBQUMsRUFBRTtnQkFDeEIsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO2FBQzlCO1NBQ0o7YUFBTTtZQUNILElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7U0FDcEM7SUFDTCxDQUFDOzs7WUE1SEosVUFBVSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgU3ViamVjdCB9IGZyb20gJ3J4anMnO1xuXG5pbXBvcnQgeyBBYnN0cmFjdFNwaW5uZXJTZXJ2aWNlIH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5kZWNsYXJlIGNvbnN0IF8sICQ7XG5cbmNvbnN0IHNwaW5uZXJUZW1wbGF0ZSA9IGA8ZGl2IGNsYXNzPVwiYXBwLXNwaW5uZXJcIj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwic3Bpbm5lci1tZXNzYWdlXCIgYXJpYS1sYWJlbD1cImxvYWRpbmcgZ2lmXCI+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDxpIGNsYXNzPVwic3Bpbm5lci1pbWFnZSBhbmltYXRlZCBpbmZpbml0ZSBmYSBmYS1jaXJjbGUtby1ub3RjaCBmYS1zcGluXCI+PC9pPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwic3Bpbm5lci1tZXNzYWdlc1wiPlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPHAgY2xhc3M9XCJzcGlubmVyLW1lc3NhZ2VzLWNvbnRhaW5lclwiPjwvcD5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICAgICAgICAgICA8L2Rpdj5gO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgU3Bpbm5lclNlcnZpY2VJbXBsIGV4dGVuZHMgQWJzdHJhY3RTcGlubmVyU2VydmljZSB7XG4gICAgc3Bpbm5lcklkID0gMDtcbiAgICBtZXNzYWdlU291cmNlID0gbmV3IFN1YmplY3QoKTtcbiAgICBtZXNzYWdlc0J5Q29udGV4dCA9IHt9O1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogcmV0dXJucyB0aGUgbWVzc2FnZSBzb3VyY2Ugc3ViamVjdFxuICAgICAqIEByZXR1cm5zIHtTdWJqZWN0PGFueT59XG4gICAgICovXG4gICAgZ2V0TWVzc2FnZVNvdXJjZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWVzc2FnZVNvdXJjZTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBzaG93IHNwaW5uZXIgb24gYSBjb250YWluZXIgZWxlbWVudFxuICAgICAqL1xuICAgIHNob3dDb250ZXh0U3Bpbm5lcihjdHg6IHN0cmluZywgbWVzc2FnZTogc3RyaW5nLCBpZDogc3RyaW5nKSB7XG4gICAgICAgIGNvbnN0IGN0eE1hcmt1cCA9ICQoJ1tuYW1lPVwiJyArIGN0eCArICdcIl0nKTtcbiAgICAgICAgdGhpcy5tZXNzYWdlc0J5Q29udGV4dFtjdHhdID0gdGhpcy5tZXNzYWdlc0J5Q29udGV4dFtjdHhdIHx8IHt9O1xuICAgICAgICAvLyBJZiB0aGUgc3Bpbm5lciBhbHJlYWR5IGV4aXN0cyBvbiB0aGUgY29udGV4dFxuICAgICAgICAvLyB0aGVuIGp1c3QgYXBwZW5kIHRoZSBtZXNzYWdlIHRvIHRoZSBleGlzdGluZyBzcGlubmVyIG1lc3NhZ2VcbiAgICAgICAgLy8gZWxzZSBhZGQgYSBuZXcgc3Bpbm5lclxuICAgICAgICBpZiAoT2JqZWN0LmtleXModGhpcy5tZXNzYWdlc0J5Q29udGV4dFtjdHhdKS5sZW5ndGggIT09IDAgKSB7XG4gICAgICAgICAgICB0aGlzLm1lc3NhZ2VzQnlDb250ZXh0W2N0eF1baWRdID0gbWVzc2FnZTtcbiAgICAgICAgICAgIHRoaXMubWVzc2FnZXNCeUNvbnRleHRbY3R4XVsnZmluYWxNZXNzYWdlJ10gPSB0aGlzLm1lc3NhZ2VzQnlDb250ZXh0W2N0eF1bJ2ZpbmFsTWVzc2FnZSddICsgJyAnICsgdGhpcy5tZXNzYWdlc0J5Q29udGV4dFtjdHhdW2lkXTtcbiAgICAgICAgICAgIGN0eE1hcmt1cC5maW5kKCcuc3Bpbm5lci1tZXNzYWdlcy1jb250YWluZXInKS5odG1sKHRoaXMubWVzc2FnZXNCeUNvbnRleHRbY3R4XVsnZmluYWxNZXNzYWdlJ10pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgY3R4U3Bpbm5lclRlbXAgPSAkKHNwaW5uZXJUZW1wbGF0ZSk7XG4gICAgICAgICAgICB0aGlzLm1lc3NhZ2VzQnlDb250ZXh0W2N0eF1baWRdID0gbWVzc2FnZTtcbiAgICAgICAgICAgIHRoaXMubWVzc2FnZXNCeUNvbnRleHRbY3R4XVsnZmluYWxNZXNzYWdlJ10gPSB0aGlzLm1lc3NhZ2VzQnlDb250ZXh0W2N0eF1baWRdO1xuICAgICAgICAgICAgY3R4U3Bpbm5lclRlbXAuZmluZCgnLnNwaW5uZXItbWVzc2FnZXMtY29udGFpbmVyJykuaHRtbCh0aGlzLm1lc3NhZ2VzQnlDb250ZXh0W2N0eF1bJ2ZpbmFsTWVzc2FnZSddKTtcbiAgICAgICAgICAgIGN0eE1hcmt1cC5wcmVwZW5kKGN0eFNwaW5uZXJUZW1wKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaWQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogc2hvdyB0aGUgYXBwIHNwaW5uZXIgd2l0aCBwcm92aWRlZCBtZXNzYWdlXG4gICAgICogQHBhcmFtIG1zZ1xuICAgICAqIEByZXR1cm5zIHtzdHJpbmd9XG4gICAgICovXG4gICAgc2hvd0FwcFNwaW5uZXIobXNnLCBpZCkge1xuICAgICAgICBjb25zdCBjdHggPSAncGFnZSc7XG4gICAgICAgIHRoaXMubWVzc2FnZXNCeUNvbnRleHRbY3R4XSA9IHRoaXMubWVzc2FnZXNCeUNvbnRleHRbY3R4XSB8fCB7fTtcbiAgICAgICAgdGhpcy5tZXNzYWdlc0J5Q29udGV4dFtjdHhdW2lkXSA9IG1zZztcblxuICAgICAgICB0aGlzLm1lc3NhZ2VTb3VyY2UubmV4dCh7XG4gICAgICAgICAgICBzaG93OiB0cnVlLFxuICAgICAgICAgICAgbWVzc2FnZTogbXNnLFxuICAgICAgICAgICAgbWVzc2FnZXM6IF8udmFsdWVzKHRoaXMubWVzc2FnZXNCeUNvbnRleHRbY3R4XSlcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogaGlkZXMgdGhlIHNwaW5uZXIgb24gYSBwYXJ0aWN1bGFyIGNvbnRhaW5lcihjb250ZXh0KVxuICAgICAqIEBwYXJhbSBjdHhcbiAgICAgKiBAcGFyYW0gaWRcbiAgICAgKi9cbiAgICBoaWRlQ29udGV4dFNwaW5uZXIoY3R4LCBpZCkge1xuICAgICAgICBkZWxldGUgdGhpcy5tZXNzYWdlc0J5Q29udGV4dFtjdHhdW2lkXTtcbiAgICAgICAgaWYgKE9iamVjdC5rZXlzKHRoaXMubWVzc2FnZXNCeUNvbnRleHRbY3R4XSkubGVuZ3RoID09PSAxKSB7XG4gICAgICAgICAgICB0aGlzLm1lc3NhZ2VzQnlDb250ZXh0W2N0eF0gPSB7fTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBjdHhNYXJrdXAgPSAkKCdbbmFtZT1cIicgKyBjdHggKyAnXCJdJyk7XG4gICAgICAgIGN0eE1hcmt1cC5maW5kKCcuYXBwLXNwaW5uZXInKS5yZW1vdmUoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBzaG93IHNwaW5uZXJcbiAgICAgKiBAcGFyYW0gbWVzc2FnZVxuICAgICAqIEBwYXJhbSBpZFxuICAgICAqIEBwYXJhbSBzcGlubmVyQ2xhc3NcbiAgICAgKiBAcGFyYW0gc3Bpbm5lckNvbnRleHRcbiAgICAgKiBAcGFyYW0gdmFyaWFibGVTY29wZUlkXG4gICAgICogQHJldHVybnMge2FueX1cbiAgICAgKi9cbiAgICBzaG93KG1lc3NhZ2UsIGlkPywgc3Bpbm5lckNsYXNzPywgc3Bpbm5lckNvbnRleHQ/LCB2YXJpYWJsZVNjb3BlSWQ/KSB7XG4gICAgICAgIGlkICAgICAgPSBpZCB8fCArK3RoaXMuc3Bpbm5lcklkO1xuICAgICAgICAvLyBpZiBzcGlubmVyQ29udGV4dCBpcyBwYXNzZWQsIHRoZW4gYXBwZW5kIHRoZSBzcGlubmVyIHRvIHRoZSBlbGVtZW50KGRlZmF1bHQgbWV0aG9kIGZvciB2YXJpYWJsZSBjYWxscykuXG4gICAgICAgIGlmIChzcGlubmVyQ29udGV4dCAmJiBzcGlubmVyQ29udGV4dCAhPT0gJ3BhZ2UnKSB7XG4gICAgICAgICAgICAvLyByZXR1cm4gYWZ0ZXIgdGhlIGNvbXBpbGVkIHNwaW5uZXIgaXMgYXBwZW5kZWQgdG8gdGhlIGVsZW1lbnQgcmVmZXJlbmNlXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zaG93Q29udGV4dFNwaW5uZXIoc3Bpbm5lckNvbnRleHQsIG1lc3NhZ2UsIGlkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2hvd0FwcFNwaW5uZXIobWVzc2FnZSwgaWQpO1xuICAgICAgICByZXR1cm4gaWQ7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogaGlkZSB0aGUgc3Bpbm5lclxuICAgICAqIEBwYXJhbSBzcGlubmVySWRcbiAgICAgKi9cbiAgICBoaWRlKGlkKSB7XG4gICAgICAgIC8vIGZpbmQgdGhlIHNwaW5uZXIgY29udGV4dCBvZiB0aGUgaWQgZnJvbSB0aGUgbWVzc2FnZXNCeUNvbnRleHRcbiAgICAgICAgY29uc3QgY3R4ID0gXy5maW5kS2V5KHRoaXMubWVzc2FnZXNCeUNvbnRleHQsIGZ1bmN0aW9uIChvYmopIHtcbiAgICAgICAgICAgIHJldHVybiBfLmluY2x1ZGVzKF8ua2V5cyhvYmopLCBpZCk7XG4gICAgICAgIH0pIHx8ICdwYWdlJztcblxuICAgICAgICAvLyBpZiBzcGlubmVyQ29udGV4dCBleGlzdHMganVzdCByZW1vdmUgdGhlIHNwaW5uZXIgZnJvbSB0aGUgcmVmZXJlbmNlIGFuZCBkZXN0cm95IHRoZSBzY29wZSBhc3NvY2lhdGVkLlxuICAgICAgICBpZiAoY3R4ICE9PSAncGFnZScpIHtcbiAgICAgICAgICAgIHRoaXMuaGlkZUNvbnRleHRTcGlubmVyKGN0eCwgaWQpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGlkKSB7XG4gICAgICAgICAgICBkZWxldGUgdGhpcy5tZXNzYWdlc0J5Q29udGV4dFtjdHhdW2lkXTtcbiAgICAgICAgICAgIGNvbnN0IG1lc3NhZ2VzID0gXy52YWx1ZXModGhpcy5tZXNzYWdlc0J5Q29udGV4dFtjdHhdKTtcbiAgICAgICAgICAgIGNvbnN0IHBhZ2VTcGlubmVyQ291bnQgPSBPYmplY3Qua2V5cyh0aGlzLm1lc3NhZ2VzQnlDb250ZXh0W2N0eF0pLmxlbmd0aDtcbiAgICAgICAgICAgIHRoaXMubWVzc2FnZVNvdXJjZS5uZXh0KHtcbiAgICAgICAgICAgICAgICBzaG93OiBtZXNzYWdlcy5sZW5ndGggPyB0cnVlIDogZmFsc2UsXG4gICAgICAgICAgICAgICAgbWVzc2FnZXM6IF8udmFsdWVzKHRoaXMubWVzc2FnZXNCeUNvbnRleHRbY3R4XSlcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy8gSWYgYSBwYWdlIHNwaW5uZXIgaGFzIGlkIGFuZCBubyBtZXNzYWdlcyBsZWZ0IHRvIGRpc3BsYXkgdGhlbiByZW1vdmUgdGhhdCBzcGlubmVyLlxuICAgICAgICAgICAgaWYgKHBhZ2VTcGlubmVyQ291bnQgPT09IDApIHtcbiAgICAgICAgICAgICAgICAkKCcuYXBwLXNwaW5uZXInKS5yZW1vdmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMubWVzc2FnZXNCeUNvbnRleHRbY3R4XSA9IHt9O1xuICAgICAgICB9XG4gICAgfVxufVxuIl19