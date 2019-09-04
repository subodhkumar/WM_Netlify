import * as tslib_1 from "tslib";
import { Attribute, Component, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { getRouteNameFromLink, getUrlParams, openLink } from '@wm/core';
import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { registerProps } from './breadcrumb.props';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
import { DatasetAwareNavComponent } from '../base/dataset-aware-nav.component';
var DEFAULT_CLS = 'breadcrumb app-breadcrumb';
var WIDGET_CONFIG = { widgetType: 'wm-breadcrumb', hostClass: DEFAULT_CLS };
var BreadcrumbComponent = /** @class */ (function (_super) {
    tslib_1.__extends(BreadcrumbComponent, _super);
    function BreadcrumbComponent(inj, route, location, beforeNavigateCB) {
        var _this = _super.call(this, inj, WIDGET_CONFIG) || this;
        _this.route = route;
        _this.location = location;
        styler(_this.nativeElement, _this, APPLY_STYLES_TYPE.CONTAINER);
        _this.disableMenuContext = !!beforeNavigateCB;
        return _this;
    }
    /**
     * Gets the first path found based on the key provided inside info Object.
     * @param info - Info object which has properties key(Active Page Name) and isPathFound[boolean] is set true if path found.
     * @param children - a child Object form children Array.
     * @param path - final path.
     * @returns {*|Array}: returns array of objects which represents the final path.
     */
    BreadcrumbComponent.prototype.getPath = function (info, children, path) {
        var _this = this;
        if (path === void 0) { path = []; }
        children.forEach(function (child) {
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
                _this.getPath(info, child.children, path);
                // if path is not found in that node pop the node.
                if (!info.isPathFound) {
                    path.pop();
                }
            }
        });
        // return the path.
        return path;
    };
    BreadcrumbComponent.prototype.getCurrentRoute = function () {
        return this.location.path().substr(1).split('?')[0];
    };
    // over rides resetNode function, generating path for the breadcrumb.
    BreadcrumbComponent.prototype.resetNodes = function () {
        _super.prototype.resetNodes.call(this);
        // get path only if the widget have id property.
        if (this.itemid || this.binditemid) {
            this.nodes = this.getPath({ key: this.getCurrentRoute(), isPathFound: false }, this.nodes);
        }
    };
    BreadcrumbComponent.prototype.onItemClick = function ($event, $item) {
        $event.preventDefault();
        var locals = { $item: $item.value, $event: $event };
        var canNavigate = !(this.invokeEventCallback('beforenavigate', locals) === false);
        var linkTarget = $item.target;
        var itemLink = $item.link;
        if (itemLink && canNavigate) {
            if (itemLink.startsWith('#/') && (!linkTarget || linkTarget === '_self')) {
                var queryParams = getUrlParams(itemLink);
                itemLink = getRouteNameFromLink(itemLink);
                this.route.navigate([itemLink], { queryParams: queryParams });
            }
            else {
                openLink(itemLink, linkTarget);
            }
        }
    };
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
    BreadcrumbComponent.ctorParameters = function () { return [
        { type: Injector },
        { type: Router },
        { type: Location },
        { type: String, decorators: [{ type: Attribute, args: ['beforenavigate.event',] }] }
    ]; };
    return BreadcrumbComponent;
}(DatasetAwareNavComponent));
export { BreadcrumbComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJlYWRjcnVtYi5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL2JyZWFkY3J1bWIvYnJlYWRjcnVtYi5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMvRCxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDekMsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBRTNDLE9BQU8sRUFBRSxvQkFBb0IsRUFBRSxZQUFZLEVBQUUsUUFBUSxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRXhFLE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxNQUFNLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUNuRSxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sb0JBQW9CLENBQUM7QUFDbkQsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFDakUsT0FBTyxFQUFFLHdCQUF3QixFQUFXLE1BQU0scUNBQXFDLENBQUM7QUFFeEYsSUFBTSxXQUFXLEdBQUcsMkJBQTJCLENBQUM7QUFDaEQsSUFBTSxhQUFhLEdBQUcsRUFBQyxVQUFVLEVBQUUsZUFBZSxFQUFFLFNBQVMsRUFBRSxXQUFXLEVBQUMsQ0FBQztBQUk1RTtJQU95QywrQ0FBd0I7SUFJN0QsNkJBQ0ksR0FBYSxFQUNMLEtBQWEsRUFDYixRQUFrQixFQUNTLGdCQUF3QjtRQUovRCxZQU1JLGtCQUFNLEdBQUcsRUFBRSxhQUFhLENBQUMsU0FHNUI7UUFQVyxXQUFLLEdBQUwsS0FBSyxDQUFRO1FBQ2IsY0FBUSxHQUFSLFFBQVEsQ0FBVTtRQUkxQixNQUFNLENBQUMsS0FBSSxDQUFDLGFBQWEsRUFBRSxLQUFJLEVBQUUsaUJBQWlCLENBQUMsU0FBUyxDQUFD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QUMsQ0FBQyxDQUFDO2FBQ25EO2lCQUFNO2dCQUNILFFBQVEsQ0FBQyxRQUFRLEVBQUUsVUFBVSxDQUFDLENBQUM7YUFDbEM7U0FDSjtJQUNMLENBQUM7SUE5RU0sbUNBQWUsR0FBRyxhQUFhLEVBQUUsQ0FBQzs7Z0JBUjVDLFNBQVMsU0FBQztvQkFDUCxRQUFRLEVBQUUsZ0JBQWdCO29CQUMxQiwwZUFBMEM7b0JBQzFDLFNBQVMsRUFBRTt3QkFDUCxrQkFBa0IsQ0FBQyxtQkFBbUIsQ0FBQztxQkFDMUM7aUJBQ0o7Ozs7Z0JBdEI4QixRQUFRO2dCQUM5QixNQUFNO2dCQUNOLFFBQVE7NkNBNkJSLFNBQVMsU0FBQyxzQkFBc0I7O0lBeUV6QywwQkFBQztDQUFBLEFBeEZELENBT3lDLHdCQUF3QixHQWlGaEU7U0FqRlksbUJBQW1CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXR0cmlidXRlLCBDb21wb25lbnQsIEluamVjdG9yIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBSb3V0ZXIgfSBmcm9tICdAYW5ndWxhci9yb3V0ZXInO1xuaW1wb3J0IHsgTG9jYXRpb24gfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuXG5pbXBvcnQgeyBnZXRSb3V0ZU5hbWVGcm9tTGluaywgZ2V0VXJsUGFyYW1zLCBvcGVuTGluayB9IGZyb20gJ0B3bS9jb3JlJztcblxuaW1wb3J0IHsgQVBQTFlfU1RZTEVTX1RZUEUsIHN0eWxlciB9IGZyb20gJy4uLy4uL2ZyYW1ld29yay9zdHlsZXInO1xuaW1wb3J0IHsgcmVnaXN0ZXJQcm9wcyB9IGZyb20gJy4vYnJlYWRjcnVtYi5wcm9wcyc7XG5pbXBvcnQgeyBwcm92aWRlQXNXaWRnZXRSZWYgfSBmcm9tICcuLi8uLi8uLi91dGlscy93aWRnZXQtdXRpbHMnO1xuaW1wb3J0IHsgRGF0YXNldEF3YXJlTmF2Q29tcG9uZW50LCBOYXZOb2RlIH0gZnJvbSAnLi4vYmFzZS9kYXRhc2V0LWF3YXJlLW5hdi5jb21wb25lbnQnO1xuXG5jb25zdCBERUZBVUxUX0NMUyA9ICdicmVhZGNydW1iIGFwcC1icmVhZGNydW1iJztcbmNvbnN0IFdJREdFVF9DT05GSUcgPSB7d2lkZ2V0VHlwZTogJ3dtLWJyZWFkY3J1bWInLCBob3N0Q2xhc3M6IERFRkFVTFRfQ0xTfTtcblxuZGVjbGFyZSBjb25zdCBfO1xuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ1t3bUJyZWFkY3J1bWJdJyxcbiAgICB0ZW1wbGF0ZVVybDogJy4vYnJlYWRjcnVtYi5jb21wb25lbnQuaHRtbCcsXG4gICAgcHJvdmlkZXJzOiBbXG4gICAgICAgIHByb3ZpZGVBc1dpZGdldFJlZihCcmVhZGNydW1iQ29tcG9uZW50KVxuICAgIF1cbn0pXG5leHBvcnQgY2xhc3MgQnJlYWRjcnVtYkNvbXBvbmVudCBleHRlbmRzIERhdGFzZXRBd2FyZU5hdkNvbXBvbmVudCB7XG4gICAgc3RhdGljIGluaXRpYWxpemVQcm9wcyA9IHJlZ2lzdGVyUHJvcHMoKTtcbiAgICBwcml2YXRlIGRpc2FibGVNZW51Q29udGV4dDogYm9vbGVhbjtcblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBpbmo6IEluamVjdG9yLFxuICAgICAgICBwcml2YXRlIHJvdXRlOiBSb3V0ZXIsXG4gICAgICAgIHByaXZhdGUgbG9jYXRpb246IExvY2F0aW9uLFxuICAgICAgICBAQXR0cmlidXRlKCdiZWZvcmVuYXZpZ2F0ZS5ldmVudCcpIGJlZm9yZU5hdmlnYXRlQ0I6IHN0cmluZ1xuICAgICkge1xuICAgICAgICBzdXBlcihpbmosIFdJREdFVF9DT05GSUcpO1xuICAgICAgICBzdHlsZXIodGhpcy5uYXRpdmVFbGVtZW50LCB0aGlzLCBBUFBMWV9TVFlMRVNfVFlQRS5DT05UQUlORVIpO1xuICAgICAgICB0aGlzLmRpc2FibGVNZW51Q29udGV4dCA9ICEhYmVmb3JlTmF2aWdhdGVDQjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSBmaXJzdCBwYXRoIGZvdW5kIGJhc2VkIG9uIHRoZSBrZXkgcHJvdmlkZWQgaW5zaWRlIGluZm8gT2JqZWN0LlxuICAgICAqIEBwYXJhbSBpbmZvIC0gSW5mbyBvYmplY3Qgd2hpY2ggaGFzIHByb3BlcnRpZXMga2V5KEFjdGl2ZSBQYWdlIE5hbWUpIGFuZCBpc1BhdGhGb3VuZFtib29sZWFuXSBpcyBzZXQgdHJ1ZSBpZiBwYXRoIGZvdW5kLlxuICAgICAqIEBwYXJhbSBjaGlsZHJlbiAtIGEgY2hpbGQgT2JqZWN0IGZvcm0gY2hpbGRyZW4gQXJyYXkuXG4gICAgICogQHBhcmFtIHBhdGggLSBmaW5hbCBwYXRoLlxuICAgICAqIEByZXR1cm5zIHsqfEFycmF5fTogcmV0dXJucyBhcnJheSBvZiBvYmplY3RzIHdoaWNoIHJlcHJlc2VudHMgdGhlIGZpbmFsIHBhdGguXG4gICAgICovXG4gICAgcHJpdmF0ZSBnZXRQYXRoKGluZm86IHtrZXk6IHN0cmluZywgaXNQYXRoRm91bmQ6IGJvb2xlYW59LCBjaGlsZHJlbjogQXJyYXk8TmF2Tm9kZT4sIHBhdGggPSBbXSk6IEFycmF5PE5hdk5vZGU+IHtcbiAgICAgICAgY2hpbGRyZW4uZm9yRWFjaCgoY2hpbGQ6IE5hdk5vZGUpID0+IHtcbiAgICAgICAgICAgIC8vIHJldHVybiBpZiBwYXRoIGFscmVhZHkgZm91bmQuXG4gICAgICAgICAgICBpZiAoaW5mby5pc1BhdGhGb3VuZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBwYXRoO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gaWYga2V5IGlzIG1hdGNoZWQgc2V0IHBhdGggZm91bmQgdG8gdHJ1ZSBhbmQgcmV0dXJuIHRoZSBwYXRoLlxuICAgICAgICAgICAgaWYgKGNoaWxkLmlkID09PSBpbmZvLmtleSkge1xuICAgICAgICAgICAgICAgIGluZm8uaXNQYXRoRm91bmQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIC8vIG9ubHkgcHVzaCB0aGUgY2hpbGQgb2JqZWN0IGJ5IG9taXRpbmcgdGhlIGNoaWxkcmVuIHdpdGhpbiBpdC5cbiAgICAgICAgICAgICAgICBwYXRoLnB1c2goY2hpbGQpO1xuICAgICAgICAgICAgICAgIHJldHVybiBwYXRoO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gaWYgdGhlIG5vZGUgaGFzIGNoaWxkcmVuIG1ha2UgYSByZWN1cnNpdmUgY2FsbC5cbiAgICAgICAgICAgIGlmIChjaGlsZC5jaGlsZHJlbi5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBwYXRoLnB1c2goY2hpbGQpO1xuICAgICAgICAgICAgICAgIHRoaXMuZ2V0UGF0aChpbmZvLCBjaGlsZC5jaGlsZHJlbiwgcGF0aCk7XG4gICAgICAgICAgICAgICAgLy8gaWYgcGF0aCBpcyBub3QgZm91bmQgaW4gdGhhdCBub2RlIHBvcCB0aGUgbm9kZS5cbiAgICAgICAgICAgICAgICBpZiAoIWluZm8uaXNQYXRoRm91bmQpIHtcbiAgICAgICAgICAgICAgICAgICAgcGF0aC5wb3AoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICAvLyByZXR1cm4gdGhlIHBhdGguXG4gICAgICAgIHJldHVybiBwYXRoO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0Q3VycmVudFJvdXRlKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLmxvY2F0aW9uLnBhdGgoKS5zdWJzdHIoMSkuc3BsaXQoJz8nKVswXTtcbiAgICB9XG5cbiAgICAvLyBvdmVyIHJpZGVzIHJlc2V0Tm9kZSBmdW5jdGlvbiwgZ2VuZXJhdGluZyBwYXRoIGZvciB0aGUgYnJlYWRjcnVtYi5cbiAgICBwcm90ZWN0ZWQgcmVzZXROb2RlcygpIHtcbiAgICAgICAgc3VwZXIucmVzZXROb2RlcygpO1xuICAgICAgICAvLyBnZXQgcGF0aCBvbmx5IGlmIHRoZSB3aWRnZXQgaGF2ZSBpZCBwcm9wZXJ0eS5cbiAgICAgICAgaWYgKHRoaXMuaXRlbWlkIHx8IHRoaXMuYmluZGl0ZW1pZCkge1xuICAgICAgICAgICAgdGhpcy5ub2RlcyA9IHRoaXMuZ2V0UGF0aCh7a2V5OiB0aGlzLmdldEN1cnJlbnRSb3V0ZSgpLCBpc1BhdGhGb3VuZDogZmFsc2V9LCB0aGlzLm5vZGVzKTtcbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgb25JdGVtQ2xpY2sgKCRldmVudDogRXZlbnQsICRpdGVtOiBhbnkpIHtcbiAgICAgICAgJGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGNvbnN0IGxvY2FscyA9IHskaXRlbTogJGl0ZW0udmFsdWUsICRldmVudH07XG4gICAgICAgIGNvbnN0IGNhbk5hdmlnYXRlID0gISh0aGlzLmludm9rZUV2ZW50Q2FsbGJhY2soJ2JlZm9yZW5hdmlnYXRlJywgbG9jYWxzKSA9PT0gZmFsc2UpO1xuICAgICAgICBjb25zdCBsaW5rVGFyZ2V0ID0gJGl0ZW0udGFyZ2V0O1xuICAgICAgICBsZXQgaXRlbUxpbmsgPSAkaXRlbS5saW5rO1xuXG4gICAgICAgIGlmIChpdGVtTGluayAmJiBjYW5OYXZpZ2F0ZSkge1xuICAgICAgICAgICAgaWYgKGl0ZW1MaW5rLnN0YXJ0c1dpdGgoJyMvJykgJiYgKCFsaW5rVGFyZ2V0IHx8IGxpbmtUYXJnZXQgPT09ICdfc2VsZicpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcXVlcnlQYXJhbXMgPSBnZXRVcmxQYXJhbXMoaXRlbUxpbmspO1xuICAgICAgICAgICAgICAgIGl0ZW1MaW5rID0gZ2V0Um91dGVOYW1lRnJvbUxpbmsoaXRlbUxpbmspO1xuICAgICAgICAgICAgICAgIHRoaXMucm91dGUubmF2aWdhdGUoW2l0ZW1MaW5rXSwgeyBxdWVyeVBhcmFtc30pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBvcGVuTGluayhpdGVtTGluaywgbGlua1RhcmdldCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbn1cbiJdfQ==