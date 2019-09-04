import { Attribute, Component, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { getRouteNameFromLink, getUrlParams, openLink } from '@wm/core';
import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { registerProps } from './breadcrumb.props';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
import { DatasetAwareNavComponent } from '../base/dataset-aware-nav.component';
const DEFAULT_CLS = 'breadcrumb app-breadcrumb';
const WIDGET_CONFIG = { widgetType: 'wm-breadcrumb', hostClass: DEFAULT_CLS };
export class BreadcrumbComponent extends DatasetAwareNavComponent {
    constructor(inj, route, location, beforeNavigateCB) {
        super(inj, WIDGET_CONFIG);
        this.route = route;
        this.location = location;
        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);
        this.disableMenuContext = !!beforeNavigateCB;
    }
    /**
     * Gets the first path found based on the key provided inside info Object.
     * @param info - Info object which has properties key(Active Page Name) and isPathFound[boolean] is set true if path found.
     * @param children - a child Object form children Array.
     * @param path - final path.
     * @returns {*|Array}: returns array of objects which represents the final path.
     */
    getPath(info, children, path = []) {
        children.forEach((child) => {
            // return if path already found.
            if (info.isPathFound) {
                return path;
            }
            // if key is matched set path found to true and return the path.
            if (child.id === info.key) {
                info.isPathFound = true;
                // only push the child object by omiting the children within it.
                path.push(child);
                return path;
            }
            // if the node has children make a recursive call.
            if (child.children.length) {
                path.push(child);
                this.getPath(info, child.children, path);
                // if path is not found in that node pop the node.
                if (!info.isPathFound) {
                    path.pop();
                }
            }
        });
        // return the path.
        return path;
    }
    getCurrentRoute() {
        return this.location.path().substr(1).split('?')[0];
    }
    // over rides resetNode function, generating path for the breadcrumb.
    resetNodes() {
        super.resetNodes();
        // get path only if the widget have id property.
        if (this.itemid || this.binditemid) {
            this.nodes = this.getPath({ key: this.getCurrentRoute(), isPathFound: false }, this.nodes);
        }
    }
    onItemClick($event, $item) {
        $event.preventDefault();
        const locals = { $item: $item.value, $event };
        const canNavigate = !(this.invokeEventCallback('beforenavigate', locals) === false);
        const linkTarget = $item.target;
        let itemLink = $item.link;
        if (itemLink && canNavigate) {
            if (itemLink.startsWith('#/') && (!linkTarget || linkTarget === '_self')) {
                const queryParams = getUrlParams(itemLink);
                itemLink = getRouteNameFromLink(itemLink);
                this.route.navigate([itemLink], { queryParams });
            }
            else {
                openLink(itemLink, linkTarget);
            }
        }
    }
}
BreadcrumbComponent.initializeProps = registerProps();
BreadcrumbComponent.decorators = [
    { type: Component, args: [{
                selector: '[wmBreadcrumb]',
                template: "<li *ngFor=\"let item of nodes; let last = last; let index = index\" [ngClass]=\"{active: last}\" class=\"{{item.class}}\">\n    <i class=\"{{item.icon}}\"></i>\n    <a [title]=\"item.label\" href=\"javascript:void(0)\" [wmNavigationControl]=\"item.link\" [disableMenuContext]=\"disableMenuContext || !!item.action\" (click)=\"onItemClick($event, item)\" *ngIf=\"!last\" [textContent]=\"item.label\"></a>\n    <label *ngIf=\"last\" [textContent]=\"item.label\"></label>\n</li>\n",
                providers: [
                    provideAsWidgetRef(BreadcrumbComponent)
                ]
            }] }
];
/** @nocollapse */
BreadcrumbComponent.ctorParameters = () => [
    { type: Injector },
    { type: Router },
    { type: Location },
    { type: String, decorators: [{ type: Attribute, args: ['beforenavigate.event',] }] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJlYWRjcnVtYi5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL2JyZWFkY3J1bWIvYnJlYWRjcnVtYi5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQy9ELE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUN6QyxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFFM0MsT0FBTyxFQUFFLG9CQUFvQixFQUFFLFlBQVksRUFBRSxRQUFRLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFeEUsT0FBTyxFQUFFLGlCQUFpQixFQUFFLE1BQU0sRUFBRSxNQUFNLHdCQUF3QixDQUFDO0FBQ25FLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQztBQUNuRCxPQUFPLEVBQUUsa0JBQWtCLEVBQUUsTUFBTSw2QkFBNkIsQ0FBQztBQUNqRSxPQUFPLEVBQUUsd0JBQXdCLEVBQVcsTUFBTSxxQ0FBcUMsQ0FBQztBQUV4RixNQUFNLFdBQVcsR0FBRywyQkFBMkIsQ0FBQztBQUNoRCxNQUFNLGFBQWEsR0FBRyxFQUFDLFVBQVUsRUFBRSxlQUFlLEVBQUUsU0FBUyxFQUFFLFdBQVcsRUFBQyxDQUFDO0FBVzVFLE1BQU0sT0FBTyxtQkFBb0IsU0FBUSx3QkFBd0I7SUFJN0QsWUFDSSxHQUFhLEVBQ0wsS0FBYSxFQUNiLFFBQWtCLEVBQ1MsZ0JBQXdCO1FBRTNELEtBQUssQ0FBQyxHQUFHLEVBQUUsYUFBYSxDQUFDLENBQUM7UUFKbEIsVUFBSyxHQUFMLEtBQUssQ0FBUTtRQUNiLGFBQVEsR0FBUixRQUFRLENBQVU7UUFJMUIsTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsSUFBSSxFQUFFLGlCQUFpQixD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LENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxDQUFDO2FBQ2xDO1NBQ0o7SUFDTCxDQUFDOztBQTlFTSxtQ0FBZSxHQUFHLGFBQWEsRUFBRSxDQUFDOztZQVI1QyxTQUFTLFNBQUM7Z0JBQ1AsUUFBUSxFQUFFLGdCQUFnQjtnQkFDMUIsMGVBQTBDO2dCQUMxQyxTQUFTLEVBQUU7b0JBQ1Asa0JBQWtCLENBQUMsbUJBQW1CLENBQUM7aUJBQzFDO2FBQ0o7Ozs7WUF0QjhCLFFBQVE7WUFDOUIsTUFBTTtZQUNOLFFBQVE7eUNBNkJSLFNBQVMsU0FBQyxzQkFBc0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBdHRyaWJ1dGUsIENvbXBvbmVudCwgSW5qZWN0b3IgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7IFJvdXRlciB9IGZyb20gJ0Bhbmd1bGFyL3JvdXRlcic7XG5pbXBvcnQgeyBMb2NhdGlvbiB9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5cbmltcG9ydCB7IGdldFJvdXRlTmFtZUZyb21MaW5rLCBnZXRVcmxQYXJhbXMsIG9wZW5MaW5rIH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5pbXBvcnQgeyBBUFBMWV9TVFlMRVNfVFlQRSwgc3R5bGVyIH0gZnJvbSAnLi4vLi4vZnJhbWV3b3JrL3N0eWxlcic7XG5pbXBvcnQgeyByZWdpc3RlclByb3BzIH0gZnJvbSAnLi9icmVhZGNydW1iLnByb3BzJztcbmltcG9ydCB7IHByb3ZpZGVBc1dpZGdldFJlZiB9IGZyb20gJy4uLy4uLy4uL3V0aWxzL3dpZGdldC11dGlscyc7XG5pbXBvcnQgeyBEYXRhc2V0QXdhcmVOYXZDb21wb25lbnQsIE5hdk5vZGUgfSBmcm9tICcuLi9iYXNlL2RhdGFzZXQtYXdhcmUtbmF2LmNvbXBvbmVudCc7XG5cbmNvbnN0IERFRkFVTFRfQ0xTID0gJ2JyZWFkY3J1bWIgYXBwLWJyZWFkY3J1bWInO1xuY29uc3QgV0lER0VUX0NPTkZJRyA9IHt3aWRnZXRUeXBlOiAnd20tYnJlYWRjcnVtYicsIGhvc3RDbGFzczogREVGQVVMVF9DTFN9O1xuXG5kZWNsYXJlIGNvbnN0IF87XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnW3dtQnJlYWRjcnVtYl0nLFxuICAgIHRlbXBsYXRlVXJsOiAnLi9icmVhZGNydW1iLmNvbXBvbmVudC5odG1sJyxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgcHJvdmlkZUFzV2lkZ2V0UmVmKEJyZWFkY3J1bWJDb21wb25lbnQpXG4gICAgXVxufSlcbmV4cG9ydCBjbGFzcyBCcmVhZGNydW1iQ29tcG9uZW50IGV4dGVuZHMgRGF0YXNldEF3YXJlTmF2Q29tcG9uZW50IHtcbiAgICBzdGF0aWMgaW5pdGlhbGl6ZVByb3BzID0gcmVnaXN0ZXJQcm9wcygpO1xuICAgIHByaXZhdGUgZGlzYWJsZU1lbnVDb250ZXh0OiBib29sZWFuO1xuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIGluajogSW5qZWN0b3IsXG4gICAgICAgIHByaXZhdGUgcm91dGU6IFJvdXRlcixcbiAgICAgICAgcHJpdmF0ZSBsb2NhdGlvbjogTG9jYXRpb24sXG4gICAgICAgIEBBdHRyaWJ1dGUoJ2JlZm9yZW5hdmlnYXRlLmV2ZW50JykgYmVmb3JlTmF2aWdhdGVDQjogc3RyaW5nXG4gICAgKSB7XG4gICAgICAgIHN1cGVyKGluaiwgV0lER0VUX0NPTkZJRyk7XG4gICAgICAgIHN0eWxlcih0aGlzLm5hdGl2ZUVsZW1lbnQsIHRoaXMsIEFQUExZX1NUWUxFU19UWVBFLkNPTlRBSU5FUik7XG4gICAgICAgIHRoaXMuZGlzYWJsZU1lbnVDb250ZXh0ID0gISFiZWZvcmVOYXZpZ2F0ZUNCO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIGZpcnN0IHBhdGggZm91bmQgYmFzZWQgb24gdGhlIGtleSBwcm92aWRlZCBpbnNpZGUgaW5mbyBPYmplY3QuXG4gICAgICogQHBhcmFtIGluZm8gLSBJbmZvIG9iamVjdCB3aGljaCBoYXMgcHJvcGVydGllcyBrZXkoQWN0aXZlIFBhZ2UgTmFtZSkgYW5kIGlzUGF0aEZvdW5kW2Jvb2xlYW5dIGlzIHNldCB0cnVlIGlmIHBhdGggZm91bmQuXG4gICAgICogQHBhcmFtIGNoaWxkcmVuIC0gYSBjaGlsZCBPYmplY3QgZm9ybSBjaGlsZHJlbiBBcnJheS5cbiAgICAgKiBAcGFyYW0gcGF0aCAtIGZpbmFsIHBhdGguXG4gICAgICogQHJldHVybnMgeyp8QXJyYXl9OiByZXR1cm5zIGFycmF5IG9mIG9iamVjdHMgd2hpY2ggcmVwcmVzZW50cyB0aGUgZmluYWwgcGF0aC5cbiAgICAgKi9cbiAgICBwcml2YXRlIGdldFBhdGgoaW5mbzoge2tleTogc3RyaW5nLCBpc1BhdGhGb3VuZDogYm9vbGVhbn0sIGNoaWxkcmVuOiBBcnJheTxOYXZOb2RlPiwgcGF0aCA9IFtdKTogQXJyYXk8TmF2Tm9kZT4ge1xuICAgICAgICBjaGlsZHJlbi5mb3JFYWNoKChjaGlsZDogTmF2Tm9kZSkgPT4ge1xuICAgICAgICAgICAgLy8gcmV0dXJuIGlmIHBhdGggYWxyZWFkeSBmb3VuZC5cbiAgICAgICAgICAgIGlmIChpbmZvLmlzUGF0aEZvdW5kKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhdGg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBpZiBrZXkgaXMgbWF0Y2hlZCBzZXQgcGF0aCBmb3VuZCB0byB0cnVlIGFuZCByZXR1cm4gdGhlIHBhdGguXG4gICAgICAgICAgICBpZiAoY2hpbGQuaWQgPT09IGluZm8ua2V5KSB7XG4gICAgICAgICAgICAgICAgaW5mby5pc1BhdGhGb3VuZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgLy8gb25seSBwdXNoIHRoZSBjaGlsZCBvYmplY3QgYnkgb21pdGluZyB0aGUgY2hpbGRyZW4gd2l0aGluIGl0LlxuICAgICAgICAgICAgICAgIHBhdGgucHVzaChjaGlsZCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhdGg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBpZiB0aGUgbm9kZSBoYXMgY2hpbGRyZW4gbWFrZSBhIHJlY3Vyc2l2ZSBjYWxsLlxuICAgICAgICAgICAgaWYgKGNoaWxkLmNoaWxkcmVuLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHBhdGgucHVzaChjaGlsZCk7XG4gICAgICAgICAgICAgICAgdGhpcy5nZXRQYXRoKGluZm8sIGNoaWxkLmNoaWxkcmVuLCBwYXRoKTtcbiAgICAgICAgICAgICAgICAvLyBpZiBwYXRoIGlzIG5vdCBmb3VuZCBpbiB0aGF0IG5vZGUgcG9wIHRoZSBub2RlLlxuICAgICAgICAgICAgICAgIGlmICghaW5mby5pc1BhdGhGb3VuZCkge1xuICAgICAgICAgICAgICAgICAgICBwYXRoLnBvcCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIC8vIHJldHVybiB0aGUgcGF0aC5cbiAgICAgICAgcmV0dXJuIHBhdGg7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRDdXJyZW50Um91dGUoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubG9jYXRpb24ucGF0aCgpLnN1YnN0cigxKS5zcGxpdCgnPycpWzBdO1xuICAgIH1cblxuICAgIC8vIG92ZXIgcmlkZXMgcmVzZXROb2RlIGZ1bmN0aW9uLCBnZW5lcmF0aW5nIHBhdGggZm9yIHRoZSBicmVhZGNydW1iLlxuICAgIHByb3RlY3RlZCByZXNldE5vZGVzKCkge1xuICAgICAgICBzdXBlci5yZXNldE5vZGVzKCk7XG4gICAgICAgIC8vIGdldCBwYXRoIG9ubHkgaWYgdGhlIHdpZGdldCBoYXZlIGlkIHByb3BlcnR5LlxuICAgICAgICBpZiAodGhpcy5pdGVtaWQgfHwgdGhpcy5iaW5kaXRlbWlkKSB7XG4gICAgICAgICAgICB0aGlzLm5vZGVzID0gdGhpcy5nZXRQYXRoKHtrZXk6IHRoaXMuZ2V0Q3VycmVudFJvdXRlKCksIGlzUGF0aEZvdW5kOiBmYWxzZX0sIHRoaXMubm9kZXMpO1xuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICBvbkl0ZW1DbGljayAoJGV2ZW50OiBFdmVudCwgJGl0ZW06IGFueSkge1xuICAgICAgICAkZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgY29uc3QgbG9jYWxzID0geyRpdGVtOiAkaXRlbS52YWx1ZSwgJGV2ZW50fTtcbiAgICAgICAgY29uc3QgY2FuTmF2aWdhdGUgPSAhKHRoaXMuaW52b2tlRXZlbnRDYWxsYmFjaygnYmVmb3JlbmF2aWdhdGUnLCBsb2NhbHMpID09PSBmYWxzZSk7XG4gICAgICAgIGNvbnN0IGxpbmtUYXJnZXQgPSAkaXRlbS50YXJnZXQ7XG4gICAgICAgIGxldCBpdGVtTGluayA9ICRpdGVtLmxpbms7XG5cbiAgICAgICAgaWYgKGl0ZW1MaW5rICYmIGNhbk5hdmlnYXRlKSB7XG4gICAgICAgICAgICBpZiAoaXRlbUxpbmsuc3RhcnRzV2l0aCgnIy8nKSAmJiAoIWxpbmtUYXJnZXQgfHwgbGlua1RhcmdldCA9PT0gJ19zZWxmJykpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBxdWVyeVBhcmFtcyA9IGdldFVybFBhcmFtcyhpdGVtTGluayk7XG4gICAgICAgICAgICAgICAgaXRlbUxpbmsgPSBnZXRSb3V0ZU5hbWVGcm9tTGluayhpdGVtTGluayk7XG4gICAgICAgICAgICAgICAgdGhpcy5yb3V0ZS5uYXZpZ2F0ZShbaXRlbUxpbmtdLCB7IHF1ZXJ5UGFyYW1zfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG9wZW5MaW5rKGl0ZW1MaW5rLCBsaW5rVGFyZ2V0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxufVxuIl19