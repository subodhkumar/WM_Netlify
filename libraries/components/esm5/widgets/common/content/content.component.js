import * as tslib_1 from "tslib";
import { Component, Injector } from '@angular/core';
import { styler } from '../../framework/styler';
import { StylableComponent } from '../base/stylable.component';
import { registerProps } from './content.props';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
var DEFAULT_CLS = 'app-content clearfix';
var WIDGET_CONFIG = { widgetType: 'wm-content', hostClass: DEFAULT_CLS };
var ContentComponent = /** @class */ (function (_super) {
    tslib_1.__extends(ContentComponent, _super);
    function ContentComponent(inj) {
        var _this = _super.call(this, inj, WIDGET_CONFIG) || this;
        styler(_this.nativeElement, _this);
        return _this;
    }
    ContentComponent.initializeProps = registerProps();
    ContentComponent.decorators = [
        { type: Component, args: [{
                    selector: '[wmContent]',
                    template: "<div class=\"row app-content-row clearfix\">\n    <ng-content></ng-content>\n</div>",
                    providers: [
                        provideAsWidgetRef(ContentComponent)
                    ]
                }] }
    ];
    /** @nocollapse */
    ContentComponent.ctorParameters = function () { return [
        { type: Injector }
    ]; };
    return ContentComponent;
}(StylableComponent));
export { ContentComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29udGVudC5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL2NvbnRlbnQvY29udGVudC5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRXBELE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQUVoRCxPQUFPLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUMvRCxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDaEQsT0FBTyxFQUFFLGtCQUFrQixFQUFFLE1BQU0sNkJBQTZCLENBQUM7QUFFakUsSUFBTSxXQUFXLEdBQUcsc0JBQXNCLENBQUM7QUFDM0MsSUFBTSxhQUFhLEdBQWtCLEVBQUMsVUFBVSxFQUFFLFlBQVksRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFDLENBQUM7QUFFeEY7SUFPc0MsNENBQWlCO0lBR25ELDBCQUFZLEdBQWE7UUFBekIsWUFDSSxrQkFBTSxHQUFHLEVBQUUsYUFBYSxDQUFDLFNBRzVCO1FBREcsTUFBTSxDQUFDLEtBQUksQ0FBQyxhQUFhLEVBQUUsS0FBSSxDQUFDLENBQUM7O0lBQ3JDLENBQUM7SUFOTSxnQ0FBZSxHQUFHLGFBQWEsRUFBRSxDQUFDOztnQkFSNUMsU0FBUyxTQUFDO29CQUNQLFFBQVEsRUFBRSxhQUFhO29CQUN2QiwrRkFBdUM7b0JBQ3ZDLFNBQVMsRUFBRTt3QkFDUCxrQkFBa0IsQ0FBQyxnQkFBZ0IsQ0FBQztxQkFDdkM7aUJBQ0o7Ozs7Z0JBakJtQixRQUFROztJQTBCNUIsdUJBQUM7Q0FBQSxBQWZELENBT3NDLGlCQUFpQixHQVF0RDtTQVJZLGdCQUFnQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbXBvbmVudCwgSW5qZWN0b3IgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgc3R5bGVyIH0gZnJvbSAnLi4vLi4vZnJhbWV3b3JrL3N0eWxlcic7XG5pbXBvcnQgeyBJV2lkZ2V0Q29uZmlnIH0gZnJvbSAnLi4vLi4vZnJhbWV3b3JrL3R5cGVzJztcbmltcG9ydCB7IFN0eWxhYmxlQ29tcG9uZW50IH0gZnJvbSAnLi4vYmFzZS9zdHlsYWJsZS5jb21wb25lbnQnO1xuaW1wb3J0IHsgcmVnaXN0ZXJQcm9wcyB9IGZyb20gJy4vY29udGVudC5wcm9wcyc7XG5pbXBvcnQgeyBwcm92aWRlQXNXaWRnZXRSZWYgfSBmcm9tICcuLi8uLi8uLi91dGlscy93aWRnZXQtdXRpbHMnO1xuXG5jb25zdCBERUZBVUxUX0NMUyA9ICdhcHAtY29udGVudCBjbGVhcmZpeCc7XG5jb25zdCBXSURHRVRfQ09ORklHOiBJV2lkZ2V0Q29uZmlnID0ge3dpZGdldFR5cGU6ICd3bS1jb250ZW50JywgaG9zdENsYXNzOiBERUZBVUxUX0NMU307XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnW3dtQ29udGVudF0nLFxuICAgIHRlbXBsYXRlVXJsOiAnLi9jb250ZW50LmNvbXBvbmVudC5odG1sJyxcbiAgICBwcm92aWRlcnM6IFtcbiAgICAgICAgcHJvdmlkZUFzV2lkZ2V0UmVmKENvbnRlbnRDb21wb25lbnQpXG4gICAgXVxufSlcbmV4cG9ydCBjbGFzcyBDb250ZW50Q29tcG9uZW50IGV4dGVuZHMgU3R5bGFibGVDb21wb25lbnQge1xuICAgIHN0YXRpYyBpbml0aWFsaXplUHJvcHMgPSByZWdpc3RlclByb3BzKCk7XG5cbiAgICBjb25zdHJ1Y3Rvcihpbmo6IEluamVjdG9yKSB7XG4gICAgICAgIHN1cGVyKGluaiwgV0lER0VUX0NPTkZJRyk7XG5cbiAgICAgICAgc3R5bGVyKHRoaXMubmF0aXZlRWxlbWVudCwgdGhpcyk7XG4gICAgfVxufVxuIl19