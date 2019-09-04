import { Injectable } from '@angular/core';
var openedDialogs = [];
/*We need closedDialogs array because onHidden event is asynchronous,
and if the user uses script and calls dialog1.close() and then dialog2.close() then
we cannot be sure if both the dialogs onClose callback will be called or not.*/
var closeDialogsArray = [];
var DialogServiceImpl = /** @class */ (function () {
    function DialogServiceImpl() {
        /**
         * map which contains the references to all dialogs by name
         * @type {Map<any, any>}
         * Ex Map[[dialogName, [[dialogScope, dialogRef]]]]
         */
        this.dialogRefsCollection = new Map();
        this.appConfirmDialog = '_app-confirm-dialog';
    }
    /**
     * Register dialog by name and scope
     * @param {string} name
     * @param {BaseDialog} dialogRef
     * @param {scope}
     */
    DialogServiceImpl.prototype.register = function (name, dialogRef, scope) {
        if (!name) {
            return;
        }
        if (this.dialogRefsCollection.get(name)) {
            this.dialogRefsCollection.get(name).set(scope, dialogRef);
        }
        else {
            this.dialogRefsCollection.set(name, new Map([[scope, dialogRef]]));
        }
    };
    DialogServiceImpl.prototype.getDialogRefsCollection = function () {
        return this.dialogRefsCollection;
    };
    /**
     * De Register dialog by name and scope
     * @param name
     * @param dialogRef
     * @param scope
     */
    DialogServiceImpl.prototype.deRegister = function (name, scope) {
        if (!name) {
            return;
        }
        if (this.dialogRefsCollection.get(name)) {
            this.dialogRefsCollection.get(name).delete(scope);
        }
    };
    DialogServiceImpl.prototype.getDialogRef = function (name, scope) {
        var dialogRefMap = this.dialogRefsCollection.get(name);
        var dialogRef;
        if (scope) {
            dialogRef = dialogRefMap.get(scope);
            if (!dialogRef) {
                // Check if the scope is App level scope
                // else throw a console error
                if (!scope.pageName && !scope.partialName && !scope.prefabName) {
                    dialogRefMap.forEach(function (dRef, dialogScope) {
                        // Check if the collection of dialogs have a "common" partial scope
                        // If yes use that else through a console error
                        if (dialogScope && dialogScope.partialName === 'Common') {
                            dialogRef = dRef;
                        }
                        else {
                            console.error('No dialog with the name "' + name + '" found in the App scope.');
                        }
                    });
                }
                else {
                    console.error('No dialog with the name "' + name + '" found in the given scope.');
                }
            }
        }
        else {
            if (dialogRefMap.size === 1) {
                dialogRef = dialogRefMap.entries().next().value[1];
            }
            else {
                console.error('There are multiple instances of this dialog name. Please provide the Page/Partial/App instance in which the dialog exists.');
            }
        }
        return dialogRef;
    };
    /**
     * Opens the dialog with the given name
     * @param {string} name
     */
    DialogServiceImpl.prototype.open = function (name, scope, initState) {
        var dialogRef = this.getDialogRef(name, scope);
        if (!dialogRef) {
            return;
        }
        dialogRef.open(initState);
    };
    /**
     * closes the dialog with the given name
     * @param {string} name
     */
    DialogServiceImpl.prototype.close = function (name, scope) {
        var dialogRef = this.getDialogRef(name, scope);
        if (!dialogRef) {
            return;
        }
        dialogRef.close();
    };
    /**
     * closes all the opened dialogs
     */
    DialogServiceImpl.prototype.closeAllDialogs = function () {
        _.forEach(openedDialogs.reverse(), function (dialog) {
            dialog.close();
        });
    };
    DialogServiceImpl.prototype.showAppConfirmDialog = function (initState) {
        this.open(this.getAppConfirmDialog(), undefined, initState);
    };
    DialogServiceImpl.prototype.closeAppConfirmDialog = function () {
        this.close(this.getAppConfirmDialog());
    };
    DialogServiceImpl.prototype.getAppConfirmDialog = function () {
        return this.appConfirmDialog;
    };
    DialogServiceImpl.prototype.setAppConfirmDialog = function (dialogName) {
        this.appConfirmDialog = dialogName;
    };
    DialogServiceImpl.prototype.addToOpenedDialogs = function (ref) {
        openedDialogs.push(ref);
    };
    DialogServiceImpl.prototype.getLastOpenedDialog = function () {
        return openedDialogs[openedDialogs.length - 1];
    };
    DialogServiceImpl.prototype.removeFromOpenedDialogs = function (ref) {
        if (openedDialogs.indexOf(ref) !== -1) {
            openedDialogs.splice(openedDialogs.indexOf(ref), 1);
        }
    };
    DialogServiceImpl.prototype.getOpenedDialogs = function () {
        return openedDialogs;
    };
    DialogServiceImpl.prototype.addToClosedDialogs = function (ref) {
        closeDialogsArray.push(ref);
    };
    DialogServiceImpl.prototype.removeFromClosedDialogs = function (ref) {
        if (closeDialogsArray.indexOf(ref) !== -1) {
            closeDialogsArray.splice(closeDialogsArray.indexOf(ref), 1);
        }
    };
    DialogServiceImpl.prototype.getDialogRefFromClosedDialogs = function () {
        return closeDialogsArray.splice(0, 1)[0];
    };
    DialogServiceImpl.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    DialogServiceImpl.ctorParameters = function () { return []; };
    return DialogServiceImpl;
}());
export { DialogServiceImpl };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nLnNlcnZpY2UuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL2RpYWxvZy9kaWFsb2cuc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBSTNDLElBQU0sYUFBYSxHQUFHLEVBQUUsQ0FBQztBQUN6Qjs7K0VBRStFO0FBQy9FLElBQU0saUJBQWlCLEdBQUcsRUFBRSxDQUFDO0FBSTdCO0lBV0k7UUFSQTs7OztXQUlHO1FBQ0sseUJBQW9CLEdBQUcsSUFBSSxHQUFHLEVBQVksQ0FBQztRQUMzQyxxQkFBZ0IsR0FBRyxxQkFBcUIsQ0FBQztJQUVsQyxDQUFDO0lBRWhCOzs7OztPQUtHO0lBQ0ksb0NBQVEsR0FBZixVQUFnQixJQUFZLEVBQUUsU0FBcUIsRUFBRSxLQUFVO1FBQzNELElBQUksQ0FBQyxJQUFJLEVBQUU7WUFDUCxPQUFPO1NBQ1Y7UUFDRCxJQUFJLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDckMsSUFBSSxDQUFDLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxDQUFDO1NBQzdEO2FBQU07WUFDSCxJQUFJLENBQUMsb0JBQW9CLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxJQUFJLEdBQUcsQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ3RFO0lBQ0wsQ0FBQztJQUVNLG1EQUF1QixHQUE5QjtRQUNJLE9BQU8sSUFBSSxDQUFDLG9CQUFvQixDQUFDO0lBQ3JDLENBQUM7SUFFRDs7Ozs7T0FLRztJQUNJLHNDQUFVLEdBQWpCLFVBQWtCLElBQVksRUFBRSxLQUFVO1FBQ3RDLElBQUksQ0FBQyxJQUFJLEVBQUU7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QUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzdDLENBQUM7O2dCQW5LSixVQUFVOzs7O0lBb0tYLHdCQUFDO0NBQUEsQUFwS0QsSUFvS0M7U0FuS1ksaUJBQWlCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgSW5qZWN0YWJsZSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBCYXNlRGlhbG9nIH0gZnJvbSAnLi9iYXNlL2Jhc2UtZGlhbG9nJztcblxuY29uc3Qgb3BlbmVkRGlhbG9ncyA9IFtdO1xuLypXZSBuZWVkIGNsb3NlZERpYWxvZ3MgYXJyYXkgYmVjYXVzZSBvbkhpZGRlbiBldmVudCBpcyBhc3luY2hyb25vdXMsXG5hbmQgaWYgdGhlIHVzZXIgdXNlcyBzY3JpcHQgYW5kIGNhbGxzIGRpYWxvZzEuY2xvc2UoKSBhbmQgdGhlbiBkaWFsb2cyLmNsb3NlKCkgdGhlblxud2UgY2Fubm90IGJlIHN1cmUgaWYgYm90aCB0aGUgZGlhbG9ncyBvbkNsb3NlIGNhbGxiYWNrIHdpbGwgYmUgY2FsbGVkIG9yIG5vdC4qL1xuY29uc3QgY2xvc2VEaWFsb2dzQXJyYXkgPSBbXTtcblxuZGVjbGFyZSBjb25zdCBfO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgRGlhbG9nU2VydmljZUltcGwge1xuXG4gICAgLyoqXG4gICAgICogbWFwIHdoaWNoIGNvbnRhaW5zIHRoZSByZWZlcmVuY2VzIHRvIGFsbCBkaWFsb2dzIGJ5IG5hbWVcbiAgICAgKiBAdHlwZSB7TWFwPGFueSwgYW55Pn1cbiAgICAgKiBFeCBNYXBbW2RpYWxvZ05hbWUsIFtbZGlhbG9nU2NvcGUsIGRpYWxvZ1JlZl1dXV1cbiAgICAgKi9cbiAgICBwcml2YXRlIGRpYWxvZ1JlZnNDb2xsZWN0aW9uID0gbmV3IE1hcDxhbnksIGFueT4oKTtcbiAgICBwcml2YXRlIGFwcENvbmZpcm1EaWFsb2cgPSAnX2FwcC1jb25maXJtLWRpYWxvZyc7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHt9XG5cbiAgICAvKipcbiAgICAgKiBSZWdpc3RlciBkaWFsb2cgYnkgbmFtZSBhbmQgc2NvcGVcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZVxuICAgICAqIEBwYXJhbSB7QmFzZURpYWxvZ30gZGlhbG9nUmVmXG4gICAgICogQHBhcmFtIHtzY29wZX1cbiAgICAgKi9cbiAgICBwdWJsaWMgcmVnaXN0ZXIobmFtZTogc3RyaW5nLCBkaWFsb2dSZWY6IEJhc2VEaWFsb2csIHNjb3BlOiBhbnkpIHtcbiAgICAgICAgaWYgKCFuYW1lKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuZGlhbG9nUmVmc0NvbGxlY3Rpb24uZ2V0KG5hbWUpKSB7XG4gICAgICAgICAgICB0aGlzLmRpYWxvZ1JlZnNDb2xsZWN0aW9uLmdldChuYW1lKS5zZXQoc2NvcGUsIGRpYWxvZ1JlZik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmRpYWxvZ1JlZnNDb2xsZWN0aW9uLnNldChuYW1lLCBuZXcgTWFwKFtbc2NvcGUsIGRpYWxvZ1JlZl1dKSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0RGlhbG9nUmVmc0NvbGxlY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmRpYWxvZ1JlZnNDb2xsZWN0aW9uO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIERlIFJlZ2lzdGVyIGRpYWxvZyBieSBuYW1lIGFuZCBzY29wZVxuICAgICAqIEBwYXJhbSBuYW1lXG4gICAgICogQHBhcmFtIGRpYWxvZ1JlZlxuICAgICAqIEBwYXJhbSBzY29wZVxuICAgICAqL1xuICAgIHB1YmxpYyBkZVJlZ2lzdGVyKG5hbWU6IHN0cmluZywgc2NvcGU6IGFueSkge1xuICAgICAgICBpZiAoIW5hbWUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5kaWFsb2dSZWZzQ29sbGVjdGlvbi5nZXQobmFtZSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRpYWxvZ1JlZnNDb2xsZWN0aW9uLmdldChuYW1lKS5kZWxldGUoc2NvcGUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXREaWFsb2dSZWYobmFtZTogc3RyaW5nLCBzY29wZT86IGFueSkge1xuICAgICAgICBjb25zdCBkaWFsb2dSZWZNYXAgPSB0aGlzLmRpYWxvZ1JlZnNDb2xsZWN0aW9uLmdldChuYW1lKTtcbiAgICAgICAgbGV0IGRpYWxvZ1JlZjtcblxuICAgICAgICBpZiAoc2NvcGUpIHtcbiAgICAgICAgICAgIGRpYWxvZ1JlZiA9IGRpYWxvZ1JlZk1hcC5nZXQoc2NvcGUpO1xuICAgICAgICAgICAgaWYgKCFkaWFsb2dSZWYpIHtcbiAgICAgICAgICAgICAgICAvLyBDaGVjayBpZiB0aGUgc2NvcGUgaXMgQXBwIGxldmVsIHNjb3BlXG4gICAgICAgICAgICAgICAgLy8gZWxzZSB0aHJvdyBhIGNvbnNvbGUgZXJyb3JcbiAgICAgICAgICAgICAgICBpZiAoIXNjb3BlLnBhZ2VOYW1lICYmICFzY29wZS5wYXJ0aWFsTmFtZSAmJiAhc2NvcGUucHJlZmFiTmFtZSkge1xuICAgICAgICAgICAgICAgICAgICBkaWFsb2dSZWZNYXAuZm9yRWFjaCgoZFJlZiwgZGlhbG9nU2NvcGUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIENoZWNrIGlmIHRoZSBjb2xsZWN0aW9uIG9mIGRpYWxvZ3MgaGF2ZSBhIFwiY29tbW9uXCIgcGFydGlhbCBzY29wZVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWYgeWVzIHVzZSB0aGF0IGVsc2UgdGhyb3VnaCBhIGNvbnNvbGUgZXJyb3JcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkaWFsb2dTY29wZSAmJiBkaWFsb2dTY29wZS5wYXJ0aWFsTmFtZSA9PT0gJ0NvbW1vbicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaWFsb2dSZWYgPSBkUmVmO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdObyBkaWFsb2cgd2l0aCB0aGUgbmFtZSBcIicgKyBuYW1lICsgJ1wiIGZvdW5kIGluIHRoZSBBcHAgc2NvcGUuJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ05vIGRpYWxvZyB3aXRoIHRoZSBuYW1lIFwiJyArIG5hbWUgKyAnXCIgZm91bmQgaW4gdGhlIGdpdmVuIHNjb3BlLicpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChkaWFsb2dSZWZNYXAuc2l6ZSA9PT0gMSkge1xuICAgICAgICAgICAgICAgIGRpYWxvZ1JlZiA9IGRpYWxvZ1JlZk1hcC5lbnRyaWVzKCkubmV4dCgpLnZhbHVlWzFdO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdUaGVyZSBhcmUgbXVsdGlwbGUgaW5zdGFuY2VzIG9mIHRoaXMgZGlhbG9nIG5hbWUuIFBsZWFzZSBwcm92aWRlIHRoZSBQYWdlL1BhcnRpYWwvQXBwIGluc3RhbmNlIGluIHdoaWNoIHRoZSBkaWFsb2cgZXhpc3RzLicpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBkaWFsb2dSZWY7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogT3BlbnMgdGhlIGRpYWxvZyB3aXRoIHRoZSBnaXZlbiBuYW1lXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAgICAgKi9cbiAgICBwdWJsaWMgb3BlbihuYW1lOiBzdHJpbmcsIHNjb3BlPzogYW55LCBpbml0U3RhdGU/OiBhbnkpIHtcbiAgICAgICAgY29uc3QgZGlhbG9nUmVmID0gdGhpcy5nZXREaWFsb2dSZWYobmFtZSwgc2NvcGUpO1xuICAgICAgICBpZiAoIWRpYWxvZ1JlZikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgZGlhbG9nUmVmLm9wZW4oaW5pdFN0YXRlKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBjbG9zZXMgdGhlIGRpYWxvZyB3aXRoIHRoZSBnaXZlbiBuYW1lXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWVcbiAgICAgKi9cbiAgICBwdWJsaWMgY2xvc2UobmFtZTogc3RyaW5nLCBzY29wZT86IGFueSkge1xuICAgICAgICBjb25zdCBkaWFsb2dSZWYgPSB0aGlzLmdldERpYWxvZ1JlZihuYW1lLCBzY29wZSk7XG4gICAgICAgIGlmICghZGlhbG9nUmVmKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBkaWFsb2dSZWYuY2xvc2UoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBjbG9zZXMgYWxsIHRoZSBvcGVuZWQgZGlhbG9nc1xuICAgICAqL1xuICAgIGNsb3NlQWxsRGlhbG9ncygpIHtcbiAgICAgICAgXy5mb3JFYWNoKG9wZW5lZERpYWxvZ3MucmV2ZXJzZSgpLCAoZGlhbG9nKSA9PiB7XG4gICAgICAgICAgICBkaWFsb2cuY2xvc2UoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHVibGljIHNob3dBcHBDb25maXJtRGlhbG9nKGluaXRTdGF0ZT86IGFueSkge1xuICAgICAgICB0aGlzLm9wZW4odGhpcy5nZXRBcHBDb25maXJtRGlhbG9nKCksIHVuZGVmaW5lZCwgaW5pdFN0YXRlKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgY2xvc2VBcHBDb25maXJtRGlhbG9nKCkge1xuICAgICAgICB0aGlzLmNsb3NlKHRoaXMuZ2V0QXBwQ29uZmlybURpYWxvZygpKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0QXBwQ29uZmlybURpYWxvZygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYXBwQ29uZmlybURpYWxvZztcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0QXBwQ29uZmlybURpYWxvZyhkaWFsb2dOYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5hcHBDb25maXJtRGlhbG9nID0gZGlhbG9nTmFtZTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYWRkVG9PcGVuZWREaWFsb2dzKHJlZikge1xuICAgICAgICBvcGVuZWREaWFsb2dzLnB1c2gocmVmKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0TGFzdE9wZW5lZERpYWxvZygpIHtcbiAgICAgICAgcmV0dXJuIG9wZW5lZERpYWxvZ3Nbb3BlbmVkRGlhbG9ncy5sZW5ndGggLSAxXTtcbiAgICB9XG5cbiAgICBwdWJsaWMgcmVtb3ZlRnJvbU9wZW5lZERpYWxvZ3MocmVmKSB7XG4gICAgICAgIGlmIChvcGVuZWREaWFsb2dzLmluZGV4T2YocmVmKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIG9wZW5lZERpYWxvZ3Muc3BsaWNlKG9wZW5lZERpYWxvZ3MuaW5kZXhPZihyZWYpLCAxKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBnZXRPcGVuZWREaWFsb2dzKCkge1xuICAgICAgICByZXR1cm4gb3BlbmVkRGlhbG9ncztcbiAgICB9XG5cbiAgICBwdWJsaWMgYWRkVG9DbG9zZWREaWFsb2dzKHJlZikge1xuICAgICAgICBjbG9zZURpYWxvZ3NBcnJheS5wdXNoKHJlZik7XG4gICAgfVxuXG4gICAgcHVibGljIHJlbW92ZUZyb21DbG9zZWREaWFsb2dzKHJlZikge1xuICAgICAgICBpZiAoY2xvc2VEaWFsb2dzQXJyYXkuaW5kZXhPZihyZWYpICE9PSAtMSkge1xuICAgICAgICAgICAgY2xvc2VEaWFsb2dzQXJyYXkuc3BsaWNlKGNsb3NlRGlhbG9nc0FycmF5LmluZGV4T2YocmVmKSwgMSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0RGlhbG9nUmVmRnJvbUNsb3NlZERpYWxvZ3MoKSB7XG4gICAgICAgIHJldHVybiBjbG9zZURpYWxvZ3NBcnJheS5zcGxpY2UoMCwgMSlbMF07XG4gICAgfVxufVxuIl19