import { Attribute, Directive, Inject, Self, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { $watch } from '@wm/core';
import { WidgetRef } from '../../../widgets/framework/types';
export class PartialParamHandlerDirective {
    constructor(widgetRef) {
        this.widgetRef = widgetRef;
        this.widgetRef.partialParams = {};
        this.widgetRef.pageParams = this.widgetRef.partialParams;
        this.widgetRef.params$ = new Subject();
    }
    registerParams(name, value, bindExpr, type) {
        this.widgetRef.partialParams[name] = value;
        if (!value && bindExpr) {
            this.widgetRef.registerDestroyListener($watch(bindExpr, this.widgetRef.getViewParent(), _.get(this.widgetRef, 'context'), nv => {
                this.widgetRef.partialParams[name] = nv;
                // notify the partial container of the param changes
                this.widgetRef.params$.next();
            }));
        }
        else {
            this.widgetRef.params$.next();
        }
    }
}
PartialParamHandlerDirective.decorators = [
    { type: Directive, args: [{
                selector: '[partialContainer]',
            },] }
];
/** @nocollapse */
PartialParamHandlerDirective.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Self }, { type: Inject, args: [WidgetRef,] }] }
];
export class PartialParamDirective {
    constructor(bindValue, type, partialParamsProvider) {
        this.bindValue = bindValue;
        this.type = type;
        this.partialParamsProvider = partialParamsProvider;
    }
    ngOnInit() {
        this.partialParamsProvider.registerParams(this.name, this.value, this.bindValue, this.type);
    }
}
PartialParamDirective.decorators = [
    { type: Directive, args: [{
                selector: '[wmParam]',
            },] }
];
/** @nocollapse */
PartialParamDirective.ctorParameters = () => [
    { type: undefined, decorators: [{ type: Attribute, args: ['value.bind',] }] },
    { type: undefined, decorators: [{ type: Attribute, args: ['type',] }] },
    { type: PartialParamHandlerDirective }
];
PartialParamDirective.propDecorators = {
    name: [{ type: Input }],
    value: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFydGlhbC1wYXJhbS5kaXJlY3RpdmUuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL3BhcnRpYWwtcGFyYW0vcGFydGlhbC1wYXJhbS5kaXJlY3RpdmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQVUsTUFBTSxlQUFlLENBQUM7QUFFbEYsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLE1BQU0sQ0FBQztBQUUvQixPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRWxDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxrQ0FBa0MsQ0FBQztBQU83RCxNQUFNLE9BQU8sNEJBQTRCO0lBQ3JDLFlBQWdELFNBQVM7UUFBVCxjQUFTLEdBQVQsU0FBUyxDQUFBO1FBQ3JELElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxHQUFHLEVBQUUsQ0FBQztRQUNsQyxJQUFJLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGFBQWEsQ0FBQztRQUN6RCxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRyxJQUFJLE9BQU8sRUFBRSxDQUFDO0lBQzNDLENBQUM7SUFFRCxjQUFjLENBQUMsSUFBWSxFQUFFLEtBQWEsRUFBRSxRQUFnQixFQUFFLElBQVk7UUFDdEUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDO1FBQzNDLElBQUksQ0FBQyxLQUFLLElBQUksUUFBUSxFQUFFO1lBQ3BCLElBQUksQ0FBQyxTQUFTLENBQUMsdUJBQXVCLENBQ2xDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxhQUFhLEVBQUUsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsU0FBUyxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUU7Z0JBQ3BGLElBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztnQkFFeEMsb0RBQW9EO2dCQUNwRCxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNsQyxDQUFDLENBQUMsQ0FDTCxDQUFDO1NBQ0w7YUFBTTtZQUNILElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO1NBQ2pDO0lBRUwsQ0FBQzs7O1lBekJKLFNBQVMsU0FBQztnQkFDUCxRQUFRLEVBQUUsb0JBQW9CO2FBQ2pDOzs7OzRDQUVpQixJQUFJLFlBQUksTUFBTSxTQUFDLFNBQVM7O0FBMkIxQyxNQUFNLE9BQU8scUJBQXFCO0lBSzlCLFlBQ29DLFNBQVMsRUFDZixJQUFJLEVBQ3RCLHFCQUFtRDtRQUYzQixjQUFTLEdBQVQsU0FBUyxDQUFBO1FBQ2YsU0FBSSxHQUFKLElBQUksQ0FBQTtRQUN0QiwwQkFBcUIsR0FBckIscUJBQXFCLENBQThCO0lBRS9ELENBQUM7SUFFRCxRQUFRO1FBQ0osSUFBSSxDQUFDLHFCQUFxQixDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDaEcsQ0FBQzs7O1lBakJKLFNBQVMsU0FBQztnQkFDUCxRQUFRLEVBQUUsV0FBVzthQUN4Qjs7Ozs0Q0FPUSxTQUFTLFNBQUMsWUFBWTs0Q0FDdEIsU0FBUyxTQUFDLE1BQU07WUFDYyw0QkFBNEI7OzttQkFOOUQsS0FBSztvQkFDTCxLQUFLIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQXR0cmlidXRlLCBEaXJlY3RpdmUsIEluamVjdCwgU2VsZiwgSW5wdXQsIE9uSW5pdCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBTdWJqZWN0IH0gZnJvbSAncnhqcyc7XG5cbmltcG9ydCB7ICR3YXRjaCB9IGZyb20gJ0B3bS9jb3JlJztcblxuaW1wb3J0IHsgV2lkZ2V0UmVmIH0gZnJvbSAnLi4vLi4vLi4vd2lkZ2V0cy9mcmFtZXdvcmsvdHlwZXMnO1xuXG5kZWNsYXJlIGNvbnN0IF87XG5cbkBEaXJlY3RpdmUoe1xuICAgIHNlbGVjdG9yOiAnW3BhcnRpYWxDb250YWluZXJdJyxcbn0pXG5leHBvcnQgY2xhc3MgUGFydGlhbFBhcmFtSGFuZGxlckRpcmVjdGl2ZSB7XG4gICAgY29uc3RydWN0b3IgKEBTZWxmKCkgQEluamVjdChXaWRnZXRSZWYpIHByaXZhdGUgd2lkZ2V0UmVmKSB7XG4gICAgICAgIHRoaXMud2lkZ2V0UmVmLnBhcnRpYWxQYXJhbXMgPSB7fTtcbiAgICAgICAgdGhpcy53aWRnZXRSZWYucGFnZVBhcmFtcyA9IHRoaXMud2lkZ2V0UmVmLnBhcnRpYWxQYXJhbXM7XG4gICAgICAgIHRoaXMud2lkZ2V0UmVmLnBhcmFtcyQgPSBuZXcgU3ViamVjdCgpO1xuICAgIH1cblxuICAgIHJlZ2lzdGVyUGFyYW1zKG5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZywgYmluZEV4cHI6IHN0cmluZywgdHlwZTogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMud2lkZ2V0UmVmLnBhcnRpYWxQYXJhbXNbbmFtZV0gPSB2YWx1ZTtcbiAgICAgICAgaWYgKCF2YWx1ZSAmJiBiaW5kRXhwcikge1xuICAgICAgICAgICAgdGhpcy53aWRnZXRSZWYucmVnaXN0ZXJEZXN0cm95TGlzdGVuZXIoXG4gICAgICAgICAgICAgICAgJHdhdGNoKGJpbmRFeHByLCB0aGlzLndpZGdldFJlZi5nZXRWaWV3UGFyZW50KCksIF8uZ2V0KHRoaXMud2lkZ2V0UmVmLCAnY29udGV4dCcpLCBudiA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMud2lkZ2V0UmVmLnBhcnRpYWxQYXJhbXNbbmFtZV0gPSBudjtcblxuICAgICAgICAgICAgICAgICAgICAvLyBub3RpZnkgdGhlIHBhcnRpYWwgY29udGFpbmVyIG9mIHRoZSBwYXJhbSBjaGFuZ2VzXG4gICAgICAgICAgICAgICAgICAgIHRoaXMud2lkZ2V0UmVmLnBhcmFtcyQubmV4dCgpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy53aWRnZXRSZWYucGFyYW1zJC5uZXh0KCk7XG4gICAgICAgIH1cblxuICAgIH1cbn1cblxuQERpcmVjdGl2ZSh7XG4gICAgc2VsZWN0b3I6ICdbd21QYXJhbV0nLFxufSlcbmV4cG9ydCBjbGFzcyBQYXJ0aWFsUGFyYW1EaXJlY3RpdmUgaW1wbGVtZW50cyBPbkluaXQge1xuXG4gICAgQElucHV0KCkgbmFtZTogc3RyaW5nO1xuICAgIEBJbnB1dCgpIHZhbHVlOiBhbnk7XG5cbiAgICBjb25zdHJ1Y3RvcihcbiAgICAgICAgQEF0dHJpYnV0ZSgndmFsdWUuYmluZCcpIHB1YmxpYyBiaW5kVmFsdWUsXG4gICAgICAgIEBBdHRyaWJ1dGUoJ3R5cGUnKSBwdWJsaWMgdHlwZSxcbiAgICAgICAgcHJpdmF0ZSBwYXJ0aWFsUGFyYW1zUHJvdmlkZXI6IFBhcnRpYWxQYXJhbUhhbmRsZXJEaXJlY3RpdmVcbiAgICApIHtcbiAgICB9XG5cbiAgICBuZ09uSW5pdCgpIHtcbiAgICAgICAgdGhpcy5wYXJ0aWFsUGFyYW1zUHJvdmlkZXIucmVnaXN0ZXJQYXJhbXModGhpcy5uYW1lLCB0aGlzLnZhbHVlLCB0aGlzLmJpbmRWYWx1ZSwgdGhpcy50eXBlKTtcbiAgICB9XG59XG4iXX0=