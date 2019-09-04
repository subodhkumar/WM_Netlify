import { Injectable } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { App } from '@wm/core';
import { CONSTANTS } from '@wm/variables';
var parentSelector = 'body:first >app-root:last';
var NavigationServiceImpl = /** @class */ (function () {
    function NavigationServiceImpl(app, router) {
        var _this = this;
        this.app = app;
        this.router = router;
        this.history = new History();
        this.isPageAddedToHistory = false;
        this.router.events.subscribe(function (event) {
            if (event instanceof NavigationStart) {
                var url = event.url;
                var urlParams_1 = {};
                var pageName = void 0;
                if (!_this.isPageAddedToHistory) {
                    _this.isPageAddedToHistory = false;
                    if (url.indexOf('?') > 0) {
                        url.substr(url.indexOf('?') + 1)
                            .split('&')
                            .forEach(function (s) {
                            var splits = s.split('=');
                            urlParams_1[splits[0]] = splits[1];
                        });
                        pageName = url.substr(0, url.indexOf('?'));
                    }
                    else {
                        pageName = url;
                    }
                    if (pageName[0] === '/') {
                        pageName = pageName.substr(1);
                    }
                    if (pageName) {
                        /*
                         * Commenting this code, one client project has Home_Page configured as Login Page.
                         * So redirection to Home_Page post login is failing
                         // if login page is being loaded and user is logged in, cancel that.
                            if ($rs.isApplicationType) {
                                stopLoginPagePostLogin($p);
                            }
                         */
                        delete urlParams_1['name'];
                        _this.history.push(new PageInfo(pageName, urlParams_1, _this.transition));
                    }
                }
            }
        });
    }
    NavigationServiceImpl.prototype.getPageTransition = function () {
        if (_.isEmpty(this.transition) || _.isEqual('none', this.transition)) {
            return null;
        }
        return this.transition;
    };
    /**
     * Navigates to particular page
     * @param pageName
     * @param options
     */
    NavigationServiceImpl.prototype.goToPage = function (pageName, options) {
        this.transition = options.transition || '';
        // page is added to stack only when currentPage is available.
        if (this.history.getCurrentPage()) {
            this.isPageAddedToHistory = true;
        }
        this.history.push(new PageInfo(pageName, options.urlParams, this.transition));
        if (CONSTANTS.isWaveLens) {
            var location_1 = window['location'];
            var strQueryParams = _.map(options.urlParams || [], function (value, key) { return key + '=' + value; });
            var strQuery = (strQueryParams.length > 0 ? '?' + strQueryParams.join('&') : '');
            location_1.href = location_1.origin
                + location_1.pathname
                + '#/' + pageName
                + strQuery;
            return;
        }
        return this.router.navigate(["/" + pageName], { queryParams: options.urlParams });
    };
    /**
     * Navigates to last visited page.
     */
    NavigationServiceImpl.prototype.goToPrevious = function () {
        if (this.history.getPagesCount()) {
            this.transition = this.history.getCurrentPage().transition;
            if (!_.isEmpty(this.transition)) {
                this.transition += '-exit';
            }
            this.history.pop();
            this.isPageAddedToHistory = true;
            window.history.back();
        }
    };
    /** Todo[Shubham] Need to handle gotoElement in other partials
     * Navigates to particular view
     * @param viewName
     * @param options
     * @param variable
     */
    NavigationServiceImpl.prototype.goToView = function (viewName, options, variable) {
        var _this = this;
        options = options || {};
        var pageName = options.pageName;
        var transition = options.transition || '';
        var $event = options.$event;
        var activePage = this.app.activePage;
        var prefabName = variable && variable._context && variable._context.prefabName;
        // Check if app is Prefab
        if (this.app.isPrefabType) {
            this.goToElementView($(parentSelector).find('[name="' + viewName + '"]'), viewName, pageName, variable);
        }
        else {
            // checking if the element is present in the page or not, if no show an error toaster
            // if yes check if it is inside a partial/prefab in the page and then highlight the respective element
            // else goto the page in which the element exists and highlight the element
            if (pageName !== activePage.activePageName && !prefabName) {
                if (this.isPartialWithNameExists(pageName)) {
                    this.goToElementView($('[partialcontainer][content="' + pageName + '"]').find('[name="' + viewName + '"]'), viewName, pageName, variable);
                }
                else {
                    // Todo[Shubham]: Make an API call to get all pages and check if the page name
                    //  is a page and then do this call else show an error as:
                    //  this.app.notifyApp(CONSTANTS.WIDGET_DOESNT_EXIST, 'error');
                    this.goToPage(pageName, {
                        viewName: viewName,
                        $event: $event,
                        transition: transition,
                        urlParams: options.urlParams
                    });
                    // subscribe to an event named pageReady which notifies this subscriber
                    // when all widgets in page are loaded i.e when page is ready
                    var pageReadySubscriber_1 = this.app.subscribe('pageReady', function (page) {
                        _this.goToElementView($(parentSelector).find('[name="' + viewName + '"]'), viewName, pageName, variable);
                        pageReadySubscriber_1();
                    });
                }
            }
            else if (prefabName && this.isPrefabWithNameExists(prefabName)) {
                this.goToElementView($('[prefabName="' + prefabName + '"]').find('[name="' + viewName + '"]'), viewName, pageName, variable);
            }
            else if (!pageName || pageName === activePage.activePageName) {
                this.goToElementView($(parentSelector).find('[name="' + viewName + '"]'), viewName, pageName, variable);
            }
            else {
                this.app.notifyApp(CONSTANTS.WIDGET_DOESNT_EXIST, 'error');
            }
        }
    };
    /*
     * navigates the user to a view element with given name
     * if the element not found in the compiled markup, the same is searched in the available dialogs in the page
     */
    NavigationServiceImpl.prototype.goToElementView = function (viewElement, viewName, pageName, variable) {
        var _this = this;
        var $el, parentDialog;
        var activePage = this.app.activePage;
        if (viewElement.length) {
            if (!this.app.isPrefabType && pageName === activePage.activePageName) {
                viewElement = this.getViewElementInActivePage(viewElement);
            }
            $el = viewElement[0].widget;
            switch ($el.widgetType) {
                case 'wm-accordionpane':
                    this.showAncestors(viewElement, variable);
                    $el.expand();
                    break;
                case 'wm-tabpane':
                    this.showAncestors(viewElement, variable);
                    $el.select();
                    break;
                case 'wm-segment-content':
                    this.showAncestors(viewElement, variable);
                    $el.navigate();
                    break;
                case 'wm-panel':
                    /* flip the active flag */
                    $el.expanded = true;
                    break;
            }
        }
        else {
            parentDialog = this.showAncestorDialog(viewName);
            setTimeout(function () {
                if (parentDialog) {
                    _this.goToElementView($('[name="' + viewName + '"]'), viewName, pageName, variable);
                }
            });
        }
    };
    /* If page name is equal to active pageName, this function returns the element in the page.
     The element in the partial page is not selected.*/
    NavigationServiceImpl.prototype.getViewElementInActivePage = function ($el) {
        var selector;
        if ($el.length > 1) {
            selector = _.filter($el, function (childSelector) {
                if (_.isEmpty($(childSelector).closest('[data-role = "partial"]')) && _.isEmpty($(childSelector).closest('[wmprefabcontainer]'))) {
                    return childSelector;
                }
            });
            if (selector) {
                $el = $(selector);
            }
        }
        return $el;
    };
    /**
     * checks if the pagecontainer has the pageName.
     */
    NavigationServiceImpl.prototype.isPartialWithNameExists = function (name) {
        return $('[partialcontainer][content="' + name + '"]').length;
    };
    /**
     * checks if the pagecontainer has the prefab.
     */
    NavigationServiceImpl.prototype.isPrefabWithNameExists = function (prefabName) {
        return $('[prefabName="' + prefabName + '"]').length;
    };
    /*
     * shows all the parent container view elements for a given view element
     */
    NavigationServiceImpl.prototype.showAncestors = function (element, variable) {
        var ancestorSearchQuery = '[wm-navigable-element="true"]';
        element
            .parents(ancestorSearchQuery)
            .toArray()
            .reverse()
            .forEach(function (parent) {
            var $el = parent.widget;
            switch ($el.widgetType) {
                case 'wm-accordionpane':
                    $el.expand();
                    break;
                case 'wm-tabpane':
                    $el.select();
                    break;
                case 'wm-segment-content':
                    $el.navigate();
                    break;
                case 'wm-panel':
                    /* flip the active flag */
                    $el.expanded = true;
                    break;
            }
        });
    };
    /*
     * searches for a given view element inside the available dialogs in current page
     * if found, the dialog is displayed, the dialog id is returned.
     */
    NavigationServiceImpl.prototype.showAncestorDialog = function (viewName) {
        var dialogId;
        $('app-root [dialogtype]')
            .each(function () {
            var dialog = $(this);
            if ($(dialog.html()).find('[name="' + viewName + '"]').length) {
                dialogId = dialog.attr('name');
                return false;
            }
        });
        return dialogId;
    };
    NavigationServiceImpl.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    NavigationServiceImpl.ctorParameters = function () { return [
        { type: App },
        { type: Router }
    ]; };
    return NavigationServiceImpl;
}());
export { NavigationServiceImpl };
var PageInfo = /** @class */ (function () {
    function PageInfo(name, urlParams, transition) {
        this.name = name;
        this.urlParams = urlParams;
        this.transition = transition;
        this.transition = _.isEmpty(this.transition) ? null : this.transition;
    }
    PageInfo.prototype.isEqual = function (page1) {
        return page1 && page1.name === this.name && _.isEqual(page1.urlParams, this.urlParams);
    };
    return PageInfo;
}());
var History = /** @class */ (function () {
    function History() {
        this.stack = [];
    }
    History.prototype.getCurrentPage = function () {
        return this.currentPage;
    };
    History.prototype.getPagesCount = function () {
        return this.stack.length;
    };
    History.prototype.isLastVisitedPage = function (page) {
        return this.getLastPage().isEqual(page);
    };
    History.prototype.push = function (pageInfo) {
        if (this.currentPage) {
            this.stack.push(this.currentPage);
        }
        this.currentPage = pageInfo;
    };
    History.prototype.pop = function () {
        this.currentPage = this.stack.pop();
        return this.currentPage;
    };
    History.prototype.getLastPage = function () {
        return this.stack.length > 0 ? this.stack[this.stack.length - 1] : undefined;
    };
    return History;
}());
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmF2aWdhdGlvbi5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL3J1bnRpbWUvYmFzZS8iLCJzb3VyY2VzIjpbInNlcnZpY2VzL25hdmlnYXRpb24uc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQzNDLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFFMUQsT0FBTyxFQUFFLEdBQUcsRUFBZ0QsTUFBTSxVQUFVLENBQUM7QUFDN0UsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUkxQyxJQUFNLGNBQWMsR0FBRywyQkFBMkIsQ0FBQztBQUVuRDtJQU1JLCtCQUFvQixHQUFRLEVBQVUsTUFBYztRQUFwRCxpQkFzQ0M7UUF0Q21CLFFBQUcsR0FBSCxHQUFHLENBQUs7UUFBVSxXQUFNLEdBQU4sTUFBTSxDQUFRO1FBSjVDLFlBQU8sR0FBRyxJQUFJLE9BQU8sRUFBRSxDQUFDO1FBRXhCLHlCQUFvQixHQUFHLEtBQUssQ0FBQztRQUdqQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsVUFBQSxLQUFLO1lBQzlCLElBQUksS0FBSyxZQUFZLGVBQWUsRUFBRTtnQkFDbEMsSUFBTSxHQUFHLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQztnQkFDdEIsSUFBTSxXQUFTLEdBQUcsRUFBRSxDQUFDO2dCQUNyQixJQUFJLFFBQVEsU0FBQSxDQUFDO2dCQUNiLElBQUksQ0FBQyxLQUFJLENBQUMsb0JBQW9CLEVBQUU7b0JBQzVCLEtBQUksQ0FBQyxvQkFBb0IsR0FBRyxLQUFLLENBQUM7b0JBQ2xDLElBQUksR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUU7d0JBQ3RCLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMs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dCB7IEluamVjdGFibGUgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IE5hdmlnYXRpb25TdGFydCwgUm91dGVyIH0gZnJvbSAnQGFuZ3VsYXIvcm91dGVyJztcblxuaW1wb3J0IHsgQXBwLCBOYXZpZ2F0aW9uT3B0aW9ucywgQWJzdHJhY3ROYXZpZ2F0aW9uU2VydmljZSB9IGZyb20gJ0B3bS9jb3JlJztcbmltcG9ydCB7IENPTlNUQU5UUyB9IGZyb20gJ0B3bS92YXJpYWJsZXMnO1xuXG5kZWNsYXJlIGNvbnN0IF8sICQ7XG5cbmNvbnN0IHBhcmVudFNlbGVjdG9yID0gJ2JvZHk6Zmlyc3QgPmFwcC1yb290Omxhc3QnO1xuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgTmF2aWdhdGlvblNlcnZpY2VJbXBsIGltcGxlbWVudHMgQWJzdHJhY3ROYXZpZ2F0aW9uU2VydmljZSB7XG4gICAgcHJpdmF0ZSBoaXN0b3J5ID0gbmV3IEhpc3RvcnkoKTtcbiAgICBwcml2YXRlIHRyYW5zaXRpb246IHN0cmluZztcbiAgICBwcml2YXRlIGlzUGFnZUFkZGVkVG9IaXN0b3J5ID0gZmFsc2U7XG5cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGFwcDogQXBwLCBwcml2YXRlIHJvdXRlcjogUm91dGVyKSB7XG4gICAgICAgIHRoaXMucm91dGVyLmV2ZW50cy5zdWJzY3JpYmUoZXZlbnQgPT4ge1xuICAgICAgICAgICAgaWYgKGV2ZW50IGluc3RhbmNlb2YgTmF2aWdhdGlvblN0YXJ0KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdXJsID0gZXZlbnQudXJsO1xuICAgICAgICAgICAgICAgIGNvbnN0IHVybFBhcmFtcyA9IHt9O1xuICAgICAgICAgICAgICAgIGxldCBwYWdlTmFtZTtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMuaXNQYWdlQWRkZWRUb0hpc3RvcnkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pc1BhZ2VBZGRlZFRvSGlzdG9yeSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICBpZiAodXJsLmluZGV4T2YoJz8nKSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybC5zdWJzdHIodXJsLmluZGV4T2YoJz8nKSArIDEpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnNwbGl0KCcmJylcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuZm9yRWFjaChzID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3BsaXRzID0gcy5zcGxpdCgnPScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cmxQYXJhbXNbc3BsaXRzWzBdXSA9IHNwbGl0c1sxXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhZ2VOYW1lID0gdXJsLnN1YnN0cigwLCB1cmwuaW5kZXhPZignPycpKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhZ2VOYW1lID0gdXJsO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChwYWdlTmFtZVswXSA9PT0gJy8nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYWdlTmFtZSA9IHBhZ2VOYW1lLnN1YnN0cigxKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAocGFnZU5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qXG4gICAgICAgICAgICAgICAgICAgICAgICAgKiBDb21tZW50aW5nIHRoaXMgY29kZSwgb25lIGNsaWVudCBwcm9qZWN0IGhhcyBIb21lX1BhZ2UgY29uZmlndXJlZCBhcyBMb2dpbiBQYWdlLlxuICAgICAgICAgICAgICAgICAgICAgICAgICogU28gcmVkaXJlY3Rpb24gdG8gSG9tZV9QYWdlIHBvc3QgbG9naW4gaXMgZmFpbGluZ1xuICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGlmIGxvZ2luIHBhZ2UgaXMgYmVpbmcgbG9hZGVkIGFuZCB1c2VyIGlzIGxvZ2dlZCBpbiwgY2FuY2VsIHRoYXQuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCRycy5pc0FwcGxpY2F0aW9uVHlwZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzdG9wTG9naW5QYWdlUG9zdExvZ2luKCRwKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAgICAgICAgIGRlbGV0ZSB1cmxQYXJhbXNbJ25hbWUnXTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5oaXN0b3J5LnB1c2gobmV3IFBhZ2VJbmZvKHBhZ2VOYW1lLCB1cmxQYXJhbXMsIHRoaXMudHJhbnNpdGlvbikpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0UGFnZVRyYW5zaXRpb24oKSB7XG4gICAgICAgIGlmIChfLmlzRW1wdHkodGhpcy50cmFuc2l0aW9uKSB8fCBfLmlzRXF1YWwoJ25vbmUnLCB0aGlzLnRyYW5zaXRpb24pKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy50cmFuc2l0aW9uO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIE5hdmlnYXRlcyB0byBwYXJ0aWN1bGFyIHBhZ2VcbiAgICAgKiBAcGFyYW0gcGFnZU5hbWVcbiAgICAgKiBAcGFyYW0gb3B0aW9uc1xuICAgICAqL1xuICAgIHB1YmxpYyBnb1RvUGFnZShwYWdlTmFtZTogc3RyaW5nLCBvcHRpb25zOiBOYXZpZ2F0aW9uT3B0aW9ucykge1xuICAgICAgICB0aGlzLnRyYW5zaXRpb24gPSBvcHRpb25zLnRyYW5zaXRpb24gfHwgJyc7XG4gICAgICAgIC8vIHBhZ2UgaXMgYWRkZWQgdG8gc3RhY2sgb25seSB3aGVuIGN1cnJlbnRQYWdlIGlzIGF2YWlsYWJsZS5cbiAgICAgICAgaWYgKHRoaXMuaGlzdG9yeS5nZXRDdXJyZW50UGFnZSgpKSB7XG4gICAgICAgICAgICB0aGlzLmlzUGFnZUFkZGVkVG9IaXN0b3J5ID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmhpc3RvcnkucHVzaCggbmV3IFBhZ2VJbmZvKHBhZ2VOYW1lLCBvcHRpb25zLnVybFBhcmFtcywgdGhpcy50cmFuc2l0aW9uKSk7XG4gICAgICAgIGlmIChDT05TVEFOVFMuaXNXYXZlTGVucykge1xuICAgICAgICAgICAgY29uc3QgbG9jYXRpb24gPSB3aW5kb3dbJ2xvY2F0aW9uJ107XG4gICAgICAgICAgICBjb25zdCBzdHJRdWVyeVBhcmFtcyA9IF8ubWFwKG9wdGlvbnMudXJsUGFyYW1zIHx8IFtdLCAodmFsdWUsIGtleSkgPT4ga2V5ICsgJz0nICsgdmFsdWUpO1xuXG4gICAgICAgICAgICBjb25zdCBzdHJRdWVyeSA9IChzdHJRdWVyeVBhcmFtcy5sZW5ndGggPiAwID8gJz8nICsgc3RyUXVlcnlQYXJhbXMuam9pbignJicpIDogJycpO1xuXG4gICAgICAgICAgICBsb2NhdGlvbi5ocmVmID0gbG9jYXRpb24ub3JpZ2luXG4gICAgICAgICAgICAgICAgKyBsb2NhdGlvbi5wYXRobmFtZVxuICAgICAgICAgICAgICAgICsgJyMvJyArIHBhZ2VOYW1lXG4gICAgICAgICAgICAgICAgKyBzdHJRdWVyeTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5yb3V0ZXIubmF2aWdhdGUoW2AvJHtwYWdlTmFtZX1gXSwgeyBxdWVyeVBhcmFtczogb3B0aW9ucy51cmxQYXJhbXN9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBOYXZpZ2F0ZXMgdG8gbGFzdCB2aXNpdGVkIHBhZ2UuXG4gICAgICovXG4gICAgcHVibGljIGdvVG9QcmV2aW91cygpIHtcbiAgICAgICAgaWYgKHRoaXMuaGlzdG9yeS5nZXRQYWdlc0NvdW50KCkpIHtcbiAgICAgICAgICAgIHRoaXMudHJhbnNpdGlvbiA9IHRoaXMuaGlzdG9yeS5nZXRDdXJyZW50UGFnZSgpLnRyYW5zaXRpb247XG4gICAgICAgICAgICBpZiAoIV8uaXNFbXB0eSh0aGlzLnRyYW5zaXRpb24pKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50cmFuc2l0aW9uICs9ICctZXhpdCc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmhpc3RvcnkucG9wKCk7XG4gICAgICAgICAgICB0aGlzLmlzUGFnZUFkZGVkVG9IaXN0b3J5ID0gdHJ1ZTtcbiAgICAgICAgICAgIHdpbmRvdy5oaXN0b3J5LmJhY2soKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKiBUb2RvW1NodWJoYW1dIE5lZWQgdG8gaGFuZGxlIGdvdG9FbGVtZW50IGluIG90aGVyIHBhcnRpYWxzXG4gICAgICogTmF2aWdhdGVzIHRvIHBhcnRpY3VsYXIgdmlld1xuICAgICAqIEBwYXJhbSB2aWV3TmFtZVxuICAgICAqIEBwYXJhbSBvcHRpb25zXG4gICAgICogQHBhcmFtIHZhcmlhYmxlXG4gICAgICovXG4gICAgcHVibGljIGdvVG9WaWV3KHZpZXdOYW1lOiBzdHJpbmcsIG9wdGlvbnM6IE5hdmlnYXRpb25PcHRpb25zLCB2YXJpYWJsZTogYW55KSB7XG4gICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgICAgICBjb25zdCBwYWdlTmFtZSA9IG9wdGlvbnMucGFnZU5hbWU7XG4gICAgICAgIGNvbnN0IHRyYW5zaXRpb24gPSBvcHRpb25zLnRyYW5zaXRpb24gfHwgJyc7XG4gICAgICAgIGNvbnN0ICRldmVudCA9IG9wdGlvbnMuJGV2ZW50O1xuICAgICAgICBjb25zdCBhY3RpdmVQYWdlID0gdGhpcy5hcHAuYWN0aXZlUGFnZTtcbiAgICAgICAgY29uc3QgcHJlZmFiTmFtZSA9IHZhcmlhYmxlICYmIHZhcmlhYmxlLl9jb250ZXh0ICYmIHZhcmlhYmxlLl9jb250ZXh0LnByZWZhYk5hbWU7XG5cbiAgICAgICAgLy8gQ2hlY2sgaWYgYXBwIGlzIFByZWZhYlxuICAgICAgICBpZiAodGhpcy5hcHAuaXNQcmVmYWJUeXBlKSB7XG4gICAgICAgICAgICB0aGlzLmdvVG9FbGVtZW50VmlldygkKHBhcmVudFNlbGVjdG9yKS5maW5kKCdbbmFtZT1cIicgKyB2aWV3TmFtZSArICdcIl0nKSwgdmlld05hbWUsIHBhZ2VOYW1lLCB2YXJpYWJsZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBjaGVja2luZyBpZiB0aGUgZWxlbWVudCBpcyBwcmVzZW50IGluIHRoZSBwYWdlIG9yIG5vdCwgaWYgbm8gc2hvdyBhbiBlcnJvciB0b2FzdGVyXG4gICAgICAgICAgICAvLyBpZiB5ZXMgY2hlY2sgaWYgaXQgaXMgaW5zaWRlIGEgcGFydGlhbC9wcmVmYWIgaW4gdGhlIHBhZ2UgYW5kIHRoZW4gaGlnaGxpZ2h0IHRoZSByZXNwZWN0aXZlIGVsZW1lbnRcbiAgICAgICAgICAgIC8vIGVsc2UgZ290byB0aGUgcGFnZSBpbiB3aGljaCB0aGUgZWxlbWVudCBleGlzdHMgYW5kIGhpZ2hsaWdodCB0aGUgZWxlbWVudFxuICAgICAgICAgICAgaWYgKHBhZ2VOYW1lICE9PSBhY3RpdmVQYWdlLmFjdGl2ZVBhZ2VOYW1lICYmICFwcmVmYWJOYW1lKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaXNQYXJ0aWFsV2l0aE5hbWVFeGlzdHMocGFnZU5hbWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ29Ub0VsZW1lbnRWaWV3KCQoJ1twYXJ0aWFsY29udGFpbmVyXVtjb250ZW50PVwiJyArIHBhZ2VOYW1lICsgJ1wiXScpLmZpbmQoJ1tuYW1lPVwiJyArIHZpZXdOYW1lICsgJ1wiXScpLCB2aWV3TmFtZSwgcGFnZU5hbWUsIHZhcmlhYmxlKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBUb2RvW1NodWJoYW1dOiBNYWtlIGFuIEFQSSBjYWxsIHRvIGdldCBhbGwgcGFnZXMgYW5kIGNoZWNrIGlmIHRoZSBwYWdlIG5hbWVcbiAgICAgICAgICAgICAgICAgICAgLy8gIGlzIGEgcGFnZSBhbmQgdGhlbiBkbyB0aGlzIGNhbGwgZWxzZSBzaG93IGFuIGVycm9yIGFzOlxuICAgICAgICAgICAgICAgICAgICAvLyAgdGhpcy5hcHAubm90aWZ5QXBwKENPTlNUQU5UUy5XSURHRVRfRE9FU05UX0VYSVNULCAnZXJyb3InKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nb1RvUGFnZShwYWdlTmFtZSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmlld05hbWU6IHZpZXdOYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgJGV2ZW50OiAkZXZlbnQsXG4gICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2l0aW9uOiB0cmFuc2l0aW9uLFxuICAgICAgICAgICAgICAgICAgICAgICAgdXJsUGFyYW1zOiBvcHRpb25zLnVybFBhcmFtc1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgLy8gc3Vic2NyaWJlIHRvIGFuIGV2ZW50IG5hbWVkIHBhZ2VSZWFkeSB3aGljaCBub3RpZmllcyB0aGlzIHN1YnNjcmliZXJcbiAgICAgICAgICAgICAgICAgICAgLy8gd2hlbiBhbGwgd2lkZ2V0cyBpbiBwYWdlIGFyZSBsb2FkZWQgaS5lIHdoZW4gcGFnZSBpcyByZWFkeVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBwYWdlUmVhZHlTdWJzY3JpYmVyID0gdGhpcy5hcHAuc3Vic2NyaWJlKCdwYWdlUmVhZHknLCAocGFnZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5nb1RvRWxlbWVudFZpZXcoJChwYXJlbnRTZWxlY3RvcikuZmluZCgnW25hbWU9XCInICsgdmlld05hbWUgKyAnXCJdJyksIHZpZXdOYW1lLCBwYWdlTmFtZSwgdmFyaWFibGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFnZVJlYWR5U3Vic2NyaWJlcigpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHByZWZhYk5hbWUgJiYgdGhpcy5pc1ByZWZhYldpdGhOYW1lRXhpc3RzKHByZWZhYk5hbWUpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5nb1RvRWxlbWVudFZpZXcoJCgnW3ByZWZhYk5hbWU9XCInICsgcHJlZmFiTmFtZSArICdcIl0nKS5maW5kKCdbbmFtZT1cIicgKyB2aWV3TmFtZSArICdcIl0nKSwgdmlld05hbWUsIHBhZ2VOYW1lLCB2YXJpYWJsZSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCFwYWdlTmFtZSB8fCBwYWdlTmFtZSA9PT0gYWN0aXZlUGFnZS5hY3RpdmVQYWdlTmFtZSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZ29Ub0VsZW1lbnRWaWV3KCQocGFyZW50U2VsZWN0b3IpLmZpbmQoJ1tuYW1lPVwiJyArIHZpZXdOYW1lICsgJ1wiXScpLCB2aWV3TmFtZSwgcGFnZU5hbWUsIHZhcmlhYmxlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hcHAubm90aWZ5QXBwKENPTlNUQU5UUy5XSURHRVRfRE9FU05UX0VYSVNULCAnZXJyb3InKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qXG4gICAgICogbmF2aWdhdGVzIHRoZSB1c2VyIHRvIGEgdmlldyBlbGVtZW50IHdpdGggZ2l2ZW4gbmFtZVxuICAgICAqIGlmIHRoZSBlbGVtZW50IG5vdCBmb3VuZCBpbiB0aGUgY29tcGlsZWQgbWFya3VwLCB0aGUgc2FtZSBpcyBzZWFyY2hlZCBpbiB0aGUgYXZhaWxhYmxlIGRpYWxvZ3MgaW4gdGhlIHBhZ2VcbiAgICAgKi9cbiAgICBwcml2YXRlIGdvVG9FbGVtZW50Vmlldyh2aWV3RWxlbWVudCwgdmlld05hbWU6IHN0cmluZywgcGFnZU5hbWU6IHN0cmluZywgdmFyaWFibGU6IGFueSkge1xuICAgICAgICBsZXQgJGVsLCBwYXJlbnREaWFsb2c7XG4gICAgICAgIGNvbnN0IGFjdGl2ZVBhZ2UgPSB0aGlzLmFwcC5hY3RpdmVQYWdlO1xuICAgICAgICBpZiAodmlld0VsZW1lbnQubGVuZ3RoKSB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuYXBwLmlzUHJlZmFiVHlwZSAmJiBwYWdlTmFtZSA9PT0gYWN0aXZlUGFnZS5hY3RpdmVQYWdlTmFtZSkge1xuICAgICAgICAgICAgICAgIHZpZXdFbGVtZW50ID0gdGhpcy5nZXRWaWV3RWxlbWVudEluQWN0aXZlUGFnZSh2aWV3RWxlbWVudCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICRlbCA9IHZpZXdFbGVtZW50WzBdLndpZGdldDtcbiAgICAgICAgICAgIHN3aXRjaCAoJGVsLndpZGdldFR5cGUpIHtcbiAgICAgICAgICAgICAgICBjYXNlICd3bS1hY2NvcmRpb25wYW5lJzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zaG93QW5jZXN0b3JzKHZpZXdFbGVtZW50LCB2YXJpYWJsZSk7XG4gICAgICAgICAgICAgICAgICAgICRlbC5leHBhbmQoKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnd20tdGFicGFuZSc6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2hvd0FuY2VzdG9ycyh2aWV3RWxlbWVudCwgdmFyaWFibGUpO1xuICAgICAgICAgICAgICAgICAgICAkZWwuc2VsZWN0KCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ3dtLXNlZ21lbnQtY29udGVudCc6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2hvd0FuY2VzdG9ycyh2aWV3RWxlbWVudCwgdmFyaWFibGUpO1xuICAgICAgICAgICAgICAgICAgICAkZWwubmF2aWdhdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnd20tcGFuZWwnOlxuICAgICAgICAgICAgICAgICAgICAvKiBmbGlwIHRoZSBhY3RpdmUgZmxhZyAqL1xuICAgICAgICAgICAgICAgICAgICAkZWwuZXhwYW5kZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHBhcmVudERpYWxvZyA9IHRoaXMuc2hvd0FuY2VzdG9yRGlhbG9nKHZpZXdOYW1lKTtcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChwYXJlbnREaWFsb2cpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5nb1RvRWxlbWVudFZpZXcoJCgnW25hbWU9XCInICsgdmlld05hbWUgKyAnXCJdJyksIHZpZXdOYW1lLCBwYWdlTmFtZSwgdmFyaWFibGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyogSWYgcGFnZSBuYW1lIGlzIGVxdWFsIHRvIGFjdGl2ZSBwYWdlTmFtZSwgdGhpcyBmdW5jdGlvbiByZXR1cm5zIHRoZSBlbGVtZW50IGluIHRoZSBwYWdlLlxuICAgICBUaGUgZWxlbWVudCBpbiB0aGUgcGFydGlhbCBwYWdlIGlzIG5vdCBzZWxlY3RlZC4qL1xuICAgIHByaXZhdGUgZ2V0Vmlld0VsZW1lbnRJbkFjdGl2ZVBhZ2UoJGVsKSB7XG4gICAgICAgIGxldCBzZWxlY3RvcjtcbiAgICAgICAgaWYgKCRlbC5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICBzZWxlY3RvciA9IF8uZmlsdGVyKCRlbCwgKGNoaWxkU2VsZWN0b3IpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoXy5pc0VtcHR5KCQoY2hpbGRTZWxlY3RvcikuY2xvc2VzdCgnW2RhdGEtcm9sZSA9IFwicGFydGlhbFwiXScpKSAmJiBfLmlzRW1wdHkoJChjaGlsZFNlbGVjdG9yKS5jbG9zZXN0KCdbd21wcmVmYWJjb250YWluZXJdJykpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjaGlsZFNlbGVjdG9yO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKHNlbGVjdG9yKSB7XG4gICAgICAgICAgICAgICAgJGVsID0gJChzZWxlY3Rvcik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICRlbDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBjaGVja3MgaWYgdGhlIHBhZ2Vjb250YWluZXIgaGFzIHRoZSBwYWdlTmFtZS5cbiAgICAgKi9cbiAgICBwcml2YXRlIGlzUGFydGlhbFdpdGhOYW1lRXhpc3RzKG5hbWU6IHN0cmluZykge1xuICAgICAgICByZXR1cm4gJCgnW3BhcnRpYWxjb250YWluZXJdW2NvbnRlbnQ9XCInICsgbmFtZSArICdcIl0nKS5sZW5ndGg7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogY2hlY2tzIGlmIHRoZSBwYWdlY29udGFpbmVyIGhhcyB0aGUgcHJlZmFiLlxuICAgICAqL1xuICAgIHByaXZhdGUgaXNQcmVmYWJXaXRoTmFtZUV4aXN0cyhwcmVmYWJOYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuICQoJ1twcmVmYWJOYW1lPVwiJyArIHByZWZhYk5hbWUgKyAnXCJdJykubGVuZ3RoO1xuICAgIH1cblxuICAgIC8qXG4gICAgICogc2hvd3MgYWxsIHRoZSBwYXJlbnQgY29udGFpbmVyIHZpZXcgZWxlbWVudHMgZm9yIGEgZ2l2ZW4gdmlldyBlbGVtZW50XG4gICAgICovXG4gICAgcHJpdmF0ZSBzaG93QW5jZXN0b3JzKGVsZW1lbnQsIHZhcmlhYmxlKSB7XG4gICAgICAgIGNvbnN0IGFuY2VzdG9yU2VhcmNoUXVlcnkgPSAnW3dtLW5hdmlnYWJsZS1lbGVtZW50PVwidHJ1ZVwiXSc7XG5cbiAgICAgICAgZWxlbWVudFxuICAgICAgICAgICAgLnBhcmVudHMoYW5jZXN0b3JTZWFyY2hRdWVyeSlcbiAgICAgICAgICAgIC50b0FycmF5KClcbiAgICAgICAgICAgIC5yZXZlcnNlKClcbiAgICAgICAgICAgIC5mb3JFYWNoKChwYXJlbnQpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCAkZWwgPSBwYXJlbnQud2lkZ2V0O1xuICAgICAgICAgICAgICAgIHN3aXRjaCAoJGVsLndpZGdldFR5cGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnd20tYWNjb3JkaW9ucGFuZSc6XG4gICAgICAgICAgICAgICAgICAgICAgICAkZWwuZXhwYW5kKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnd20tdGFicGFuZSc6XG4gICAgICAgICAgICAgICAgICAgICAgICAkZWwuc2VsZWN0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnd20tc2VnbWVudC1jb250ZW50JzpcbiAgICAgICAgICAgICAgICAgICAgICAgICRlbC5uYXZpZ2F0ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3dtLXBhbmVsJzpcbiAgICAgICAgICAgICAgICAgICAgICAgIC8qIGZsaXAgdGhlIGFjdGl2ZSBmbGFnICovXG4gICAgICAgICAgICAgICAgICAgICAgICAkZWwuZXhwYW5kZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG5cblxuICAgIC8qXG4gICAgICogc2VhcmNoZXMgZm9yIGEgZ2l2ZW4gdmlldyBlbGVtZW50IGluc2lkZSB0aGUgYXZhaWxhYmxlIGRpYWxvZ3MgaW4gY3VycmVudCBwYWdlXG4gICAgICogaWYgZm91bmQsIHRoZSBkaWFsb2cgaXMgZGlzcGxheWVkLCB0aGUgZGlhbG9nIGlkIGlzIHJldHVybmVkLlxuICAgICAqL1xuICAgIHByaXZhdGUgc2hvd0FuY2VzdG9yRGlhbG9nKHZpZXdOYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgbGV0IGRpYWxvZ0lkO1xuICAgICAgICAkKCdhcHAtcm9vdCBbZGlhbG9ndHlwZV0nKVxuICAgICAgICAgICAgLmVhY2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGRpYWxvZyA9ICQodGhpcyk7XG4gICAgICAgICAgICAgICAgaWYgKCQoZGlhbG9nLmh0bWwoKSkuZmluZCgnW25hbWU9XCInICsgdmlld05hbWUgKyAnXCJdJykubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIGRpYWxvZ0lkID0gZGlhbG9nLmF0dHIoJ25hbWUnKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gZGlhbG9nSWQ7XG4gICAgfVxufVxuXG5jbGFzcyBQYWdlSW5mbyB7XG5cbiAgICBjb25zdHJ1Y3RvcihwdWJsaWMgbmFtZSwgcHVibGljIHVybFBhcmFtcz8sIHB1YmxpYyB0cmFuc2l0aW9uPykge1xuICAgICAgICB0aGlzLnRyYW5zaXRpb24gPSBfLmlzRW1wdHkodGhpcy50cmFuc2l0aW9uKSA/IG51bGwgOiB0aGlzLnRyYW5zaXRpb247XG4gICAgfVxuXG4gICAgcHVibGljIGlzRXF1YWwocGFnZTE6IFBhZ2VJbmZvKSB7XG4gICAgICAgIHJldHVybiBwYWdlMSAmJiBwYWdlMS5uYW1lID09PSB0aGlzLm5hbWUgJiYgXy5pc0VxdWFsKHBhZ2UxLnVybFBhcmFtcywgdGhpcy51cmxQYXJhbXMpO1xuICAgIH1cbn1cblxuY2xhc3MgSGlzdG9yeSB7XG4gICAgcHJpdmF0ZSBzdGFjazogQXJyYXk8UGFnZUluZm8+ID0gW107XG4gICAgcHJpdmF0ZSBjdXJyZW50UGFnZTogUGFnZUluZm87XG5cbiAgICBwdWJsaWMgZ2V0Q3VycmVudFBhZ2UoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnRQYWdlO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRQYWdlc0NvdW50KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zdGFjay5sZW5ndGg7XG4gICAgfVxuXG4gICAgcHVibGljIGlzTGFzdFZpc2l0ZWRQYWdlKHBhZ2U6IFBhZ2VJbmZvKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldExhc3RQYWdlKCkuaXNFcXVhbChwYWdlKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgcHVzaChwYWdlSW5mbzogUGFnZUluZm8pIHtcbiAgICAgICAgaWYgKHRoaXMuY3VycmVudFBhZ2UpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhY2sucHVzaCh0aGlzLmN1cnJlbnRQYWdlKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmN1cnJlbnRQYWdlID0gcGFnZUluZm87XG4gICAgfVxuXG4gICAgcHVibGljIHBvcCgpIHtcbiAgICAgICAgdGhpcy5jdXJyZW50UGFnZSA9IHRoaXMuc3RhY2sucG9wKCk7XG4gICAgICAgIHJldHVybiB0aGlzLmN1cnJlbnRQYWdlO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRMYXN0UGFnZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc3RhY2subGVuZ3RoID4gMCA/IHRoaXMuc3RhY2tbdGhpcy5zdGFjay5sZW5ndGggLSAxXSA6IHVuZGVmaW5lZDtcbiAgICB9XG59XG4iXX0=