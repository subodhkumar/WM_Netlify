import { Attribute, Directive, Inject, Self, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { $watch } from '@wm/core';
import { WidgetRef } from '../../../widgets/framework/types';
var PartialParamHandlerDirective = /** @class */ (function () {
    function PartialParamHandlerDirective(widgetRef) {
        this.widgetRef = widgetRef;
        this.widgetRef.partialParams = {};
        this.widgetRef.pageParams = this.widgetRef.partialParams;
        this.widgetRef.params$ = new Subject();
    }
    PartialParamHandlerDirective.prototype.registerParams = function (name, value, bindExpr, type) {
        var _this = this;
        this.widgetRef.partialParams[name] = value;
        if (!value && bindExpr) {
            this.widgetRef.registerDestroyListener($watch(bindExpr, this.widgetRef.getViewParent(), _.get(this.widgetRef, 'context'), function (nv) {
                _this.widgetRef.partialParams[name] = nv;
                // notify the partial container of the param changes
                _this.widgetRef.params$.next();
            }));
        }
        else {
            this.widgetRef.params$.next();
        }
    };
    PartialParamHandlerDirective.decorators = [
        { type: Directive, args: [{
                    selector: '[partialContainer]',
                },] }
    ];
    /** @nocollapse */
    PartialParamHandlerDirective.ctorParameters = function () { return [
        { type: undefined, decorators: [{ type: Self }, { type: Inject, args: [WidgetRef,] }] }
    ]; };
    return PartialParamHandlerDirective;
}());
export { PartialParamHandlerDirective };
var PartialParamDirective = /** @class */ (function () {
    function PartialParamDirective(bindValue, type, partialParamsProvider) {
        this.bindValue = bindValue;
        this.type = type;
        this.partialParamsProvider = partialParamsProvider;
    }
    PartialParamDirective.prototype.ngOnInit = function () {
        this.partialParamsProvider.registerParams(this.name, this.value, this.bindValue, this.type);
    };
    PartialParamDirective.decorators = [
        { type: Directive, args: [{
                    selector: '[wmParam]',
                },] }
    ];
    /** @nocollapse */
    PartialParamDirective.ctorParameters = function () { return [
        { type: undefined, decorators: [{ type: Attribute, args: ['value.bind',] }] },
        { type: undefined, decorators: [{ type: Attribute, args: ['type',] }] },
        { type: PartialParamHandlerDirective }
    ]; };
    PartialParamDirective.propDecorators = {
        name: [{ type: Input }],
        value: [{ type: Input }]
    };
    return PartialParamDirective;
}());
export { PartialParamDirective };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFydGlhbC1wYXJhbS5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL3BhcnRpYWwtcGFyYW0vcGFydGlhbC1wYXJhbS5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQVUsTUFBTSxlQUFlLENBQUM7QUFFbEYsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUUvQixPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRWxDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxrQ0FBa0MsQ0FBQztBQUk3RDtJQUlJLHNDQUFnRCxTQUFTO1FBQVQsY0FBUyxHQUFULFNBQVMsQ0FBQTtRQUNyRCxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsR0FBRyxFQUFFLENBQUM7UUFDbEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUM7UUFDekQsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUcsSUFBSSxPQUFPLEVBQUUsQ0FBQztJQUMzQyxDQUFDO0lBRUQscURBQWMsR0FBZCxVQUFlLElBQVksRUFBRSxLQUFhLEVBQUUsUUFBZ0IsRUFBRSxJQUFZO1FBQTFFLGlCQWVDO1FBZEcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDO1FBQzNDLElBQUksQ0FBQyxLQUFLLElBQUksUUFBUSxFQUFFO1lBQ3BCLElBQUksQ0FBQyxTQUFTLENBQUMsdUJBQXVCLENBQ2xDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLEVBQUUsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLEVBQUUsVUFBQSxFQUFFO2dCQUNqRixLQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7Z0JBRXhDLG9EQUFvRDtnQkFDcEQsS0FBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDbEMsQ0FBQyxDQUFDLENBQ0wsQ0FBQztTQUNMO2FBQU07WUFDSCxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztTQUNqQztJQUVMLENBQUM7O2dCQXpCSixTQUFTLFNBQUM7b0JBQ1AsUUFBUSxFQUFFLG9CQUFvQjtpQkFDakM7Ozs7Z0RBRWlCLElBQUksWUFBSSxNQUFNLFNBQUMsU0FBUzs7SUFzQjFDLG1DQUFDO0NBQUEsQUExQkQsSUEwQkM7U0F2QlksNEJBQTRCO0FBeUJ6QztJQVFJLCtCQUNvQyxTQUFTLEVBQ2YsSUFBSSxFQUN0QixxQkFBbUQ7UUFGM0IsY0FBUyxHQUFULFNBQVMsQ0FBQTtRQUNmLFNBQUksR0FBSixJQUFJLENBQUE7UUFDdEIsMEJBQXFCLEdBQXJCLHFCQUFxQixDQUE4QjtJQUUvRCxDQUFDO0lBRUQsd0NBQVEsR0FBUjtRQUNJLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2hHLENBQUM7O2dCQWpCSixTQUFTLFNBQUM7b0JBQ1AsUUFBUSxFQUFFLFdBQVc7aUJBQ3hCOzs7O2dEQU9RLFNBQVMsU0FBQyxZQUFZO2dEQUN0QixTQUFTLFNBQUMsTUFBTTtnQkFDYyw0QkFBNEI7Ozt1QkFOOUQsS0FBSzt3QkFDTCxLQUFLOztJQVlWLDRCQUFDO0NBQUEsQUFsQkQsSUFrQkM7U0FmWSxxQkFBcUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBdHRyaWJ1dGUsIERpcmVjdGl2ZSwgSW5qZWN0LCBTZWxmLCBJbnB1dCwgT25Jbml0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IFN1YmplY3QgfSBmcm9tICdyeGpzJztcblxuaW1wb3J0IHsgJHdhdGNoIH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5pbXBvcnQgeyBXaWRnZXRSZWYgfSBmcm9tICcuLi8uLi8uLi93aWRnZXRzL2ZyYW1ld29yay90eXBlcyc7XG5cbmRlY2xhcmUgY29uc3QgXztcblxuQERpcmVjdGl2ZSh7XG4gICAgc2VsZWN0b3I6ICdbcGFydGlhbENvbnRhaW5lcl0nLFxufSlcbmV4cG9ydCBjbGFzcyBQYXJ0aWFsUGFyYW1IYW5kbGVyRGlyZWN0aXZlIHtcbiAgICBjb25zdHJ1Y3RvciAoQFNlbGYoKSBASW5qZWN0KFdpZGdldFJlZikgcHJpdmF0ZSB3aWRnZXRSZWYpIHtcbiAgICAgICAgdGhpcy53aWRnZXRSZWYucGFydGlhbFBhcmFtcyA9IHt9O1xuICAgICAgICB0aGlzLndpZGdldFJlZi5wYWdlUGFyYW1zID0gdGhpcy53aWRnZXRSZWYucGFydGlhbFBhcmFtcztcbiAgICAgICAgdGhpcy53aWRnZXRSZWYucGFyYW1zJCA9IG5ldyBTdWJqZWN0KCk7XG4gICAgfVxuXG4gICAgcmVnaXN0ZXJQYXJhbXMobmFtZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nLCBiaW5kRXhwcjogc3RyaW5nLCB0eXBlOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy53aWRnZXRSZWYucGFydGlhbFBhcmFtc1tuYW1lXSA9IHZhbHVlO1xuICAgICAgICBpZiAoIXZhbHVlICYmIGJpbmRFeHByKSB7XG4gICAgICAgICAgICB0aGlzLndpZGdldFJlZi5yZWdpc3RlckRlc3Ryb3lMaXN0ZW5lcihcbiAgICAgICAgICAgICAgICAkd2F0Y2goYmluZEV4cHIsIHRoaXMud2lkZ2V0UmVmLmdldFZpZXdQYXJlbnQoKSwgXy5nZXQodGhpcy53aWRnZXRSZWYsICdjb250ZXh0JyksIG52ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy53aWRnZXRSZWYucGFydGlhbFBhcmFtc1tuYW1lXSA9IG52O1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIG5vdGlmeSB0aGUgcGFydGlhbCBjb250YWluZXIgb2YgdGhlIHBhcmFtIGNoYW5nZXNcbiAgICAgICAgICAgICAgICAgICAgdGhpcy53aWRnZXRSZWYucGFyYW1zJC5uZXh0KCk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLndpZGdldFJlZi5wYXJhbXMkLm5leHQoKTtcbiAgICAgICAgfVxuXG4gICAgfVxufVxuXG5ARGlyZWN0aXZlKHtcbiAgICBzZWxlY3RvcjogJ1t3bVBhcmFtXScsXG59KVxuZXhwb3J0IGNsYXNzIFBhcnRpYWxQYXJhbURpcmVjdGl2ZSBpbXBsZW1lbnRzIE9uSW5pdCB7XG5cbiAgICBASW5wdXQoKSBuYW1lOiBzdHJpbmc7XG4gICAgQElucHV0KCkgdmFsdWU6IGFueTtcblxuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgICBAQXR0cmlidXRlKCd2YWx1ZS5iaW5kJykgcHVibGljIGJpbmRWYWx1ZSxcbiAgICAgICAgQEF0dHJpYnV0ZSgndHlwZScpIHB1YmxpYyB0eXBlLFxuICAgICAgICBwcml2YXRlIHBhcnRpYWxQYXJhbXNQcm92aWRlcjogUGFydGlhbFBhcmFtSGFuZGxlckRpcmVjdGl2ZVxuICAgICkge1xuICAgIH1cblxuICAgIG5nT25Jbml0KCkge1xuICAgICAgICB0aGlzLnBhcnRpYWxQYXJhbXNQcm92aWRlci5yZWdpc3RlclBhcmFtcyh0aGlzLm5hbWUsIHRoaXMudmFsdWUsIHRoaXMuYmluZFZhbHVlLCB0aGlzLnR5cGUpO1xuICAgIH1cbn1cbiJdfQ==