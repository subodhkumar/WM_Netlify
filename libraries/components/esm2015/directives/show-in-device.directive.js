import { Attribute, Directive, ElementRef, Inject } from '@angular/core';
import { addClass } from '@wm/core';
import { WidgetRef } from '../widgets/framework/types';
import { BaseComponent } from '../widgets/common/base/base.component';
export class ShowInDeviceDirective {
    constructor(elRef, showInDevice, widget) {
        const displayType = widget.getDisplayType();
        if (showInDevice) {
            showInDevice.split(',').forEach(deviceType => {
                addClass(elRef.nativeElement, `visible-${deviceType}-${displayType}`);
            });
        }
    }
}
ShowInDeviceDirective.decorators = [
    { type: Directive, args: [{
                selector: '[showInDevice]'
            },] }
];
/** @nocollapse */
ShowInDeviceDirective.ctorParameters = () => [
    { type: ElementRef },
    { type: String, decorators: [{ type: Attribute, args: ['showInDevice',] }] },
    { type: BaseComponent, decorators: [{ type: Inject, args: [WidgetRef,] }] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hvdy1pbi1kZXZpY2UuZGlyZWN0aXZlLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJkaXJlY3RpdmVzL3Nob3ctaW4tZGV2aWNlLmRpcmVjdGl2ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBQ3pFLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFcEMsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLDRCQUE0QixDQUFDO0FBQ3ZELE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSx1Q0FBdUMsQ0FBQztBQUt0RSxNQUFNLE9BQU8scUJBQXFCO0lBRTlCLFlBQ0ksS0FBaUIsRUFDVSxZQUFvQixFQUM1QixNQUFxQjtRQUV4QyxNQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsY0FBYyxFQUFFLENBQUM7UUFFNUMsSUFBSSxZQUFZLEVBQUU7WUFDZCxZQUFZLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsRUFBRTtnQkFDekMsUUFBUSxDQUFDLEtBQUssQ0FBQyxhQUFhLEVBQUUsV0FBVyxVQUFVLElBQUksV0FBVyxFQUFFLENBQUMsQ0FBQztZQUMxRSxDQUFDLENBQUMsQ0FBQztTQUNOO0lBQ0wsQ0FBQzs7O1lBakJKLFNBQVMsU0FBQztnQkFDUCxRQUFRLEVBQUUsZ0JBQWdCO2FBQzdCOzs7O1lBUjhCLFVBQVU7eUNBYWhDLFNBQVMsU0FBQyxjQUFjO1lBVHhCLGFBQWEsdUJBVWIsTUFBTSxTQUFDLFNBQVMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBdHRyaWJ1dGUsIERpcmVjdGl2ZSwgRWxlbWVudFJlZiwgSW5qZWN0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBhZGRDbGFzcyB9IGZyb20gJ0B3bS9jb3JlJztcblxuaW1wb3J0IHsgV2lkZ2V0UmVmIH0gZnJvbSAnLi4vd2lkZ2V0cy9mcmFtZXdvcmsvdHlwZXMnO1xuaW1wb3J0IHsgQmFzZUNvbXBvbmVudCB9IGZyb20gJy4uL3dpZGdldHMvY29tbW9uL2Jhc2UvYmFzZS5jb21wb25lbnQnO1xuXG5ARGlyZWN0aXZlKHtcbiAgICBzZWxlY3RvcjogJ1tzaG93SW5EZXZpY2VdJ1xufSlcbmV4cG9ydCBjbGFzcyBTaG93SW5EZXZpY2VEaXJlY3RpdmUge1xuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIGVsUmVmOiBFbGVtZW50UmVmLFxuICAgICAgICBAQXR0cmlidXRlKCdzaG93SW5EZXZpY2UnKSBzaG93SW5EZXZpY2U6IHN0cmluZyxcbiAgICAgICAgQEluamVjdChXaWRnZXRSZWYpIHdpZGdldDogQmFzZUNvbXBvbmVudFxuICAgICkge1xuICAgICAgICBjb25zdCBkaXNwbGF5VHlwZSA9IHdpZGdldC5nZXREaXNwbGF5VHlwZSgpO1xuXG4gICAgICAgIGlmIChzaG93SW5EZXZpY2UpIHtcbiAgICAgICAgICAgIHNob3dJbkRldmljZS5zcGxpdCgnLCcpLmZvckVhY2goZGV2aWNlVHlwZSA9PiB7XG4gICAgICAgICAgICAgICAgYWRkQ2xhc3MoZWxSZWYubmF0aXZlRWxlbWVudCwgYHZpc2libGUtJHtkZXZpY2VUeXBlfS0ke2Rpc3BsYXlUeXBlfWApO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=