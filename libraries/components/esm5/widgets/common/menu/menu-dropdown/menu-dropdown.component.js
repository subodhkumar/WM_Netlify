import { Component, ElementRef, Input } from '@angular/core';
import { addClass } from '@wm/core';
import { MenuComponent } from '../menu.component';
var animationClasses = {
    scale: {
        'name': 'wmScaleInLeft',
        'down,right': 'wmScaleInLeft',
        'down,left': 'wmScaleInRight',
        'up,right': 'wmScaleInTopLeft',
        'up,left': 'wmScaleInTopRight'
    },
    fade: {
        'name': 'fadeIn',
        'down,right': 'fadeIn',
        'down,left': 'fadeIn',
        'up,right': 'fadeIn',
        'up,left': 'fadeIn'
    },
    slide: {
        'name': 'wmSlideInDown',
        'down,right': 'wmSlideInDown',
        'down,left': 'wmSlideInDown',
        'up,right': 'wmSlideInUp',
        'up,left': 'wmSlideInUp'
    }
};
var DEFAULT_CLS = 'dropdown-menu';
var MenuDropdownComponent = /** @class */ (function () {
    function MenuDropdownComponent(elRef, menuRef) {
        this.menuRef = menuRef;
        this.nativeElement = elRef.nativeElement;
        addClass(this.nativeElement, DEFAULT_CLS);
    }
    MenuDropdownComponent.prototype.ngAfterViewInit = function () {
        var animateItems = this.menuRef.animateitems;
        var animationClass = '';
        if (animateItems) {
            animationClass = "animated " + (animationClasses[animateItems][this.menuRef.menuposition] || animationClasses[animateItems].name);
        }
        addClass(this.nativeElement, "dropdown-menu " + this.menuRef.menualign + " " + animationClass, true);
    };
    MenuDropdownComponent.decorators = [
        { type: Component, args: [{
                    selector: 'ul[wmMenuDropdown]',
                    template: "<li wmMenuDropdownItem *ngFor=\"let item of items\"\n    [item]=\"item\"\n    [ngClass]=\"{disabled: item.disabled, 'dropdown-submenu': item.children.length > 0}\"\n    class=\"{{item.class}}\">\n</li>"
                }] }
    ];
    /** @nocollapse */
    MenuDropdownComponent.ctorParameters = function () { return [
        { type: ElementRef },
        { type: MenuComponent }
    ]; };
    MenuDropdownComponent.propDecorators = {
        items: [{ type: Input }]
    };
    return MenuDropdownComponent;
}());
export { MenuDropdownComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1kcm9wZG93bi5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL21lbnUvbWVudS1kcm9wZG93bi9tZW51LWRyb3Bkb3duLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQWlCLFNBQVMsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRTVFLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFcEMsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRWxELElBQU0sZ0JBQWdCLEdBQUc7SUFDckIsS0FBSyxFQUFFO1FBQ0gsTUFBTSxFQUFFLGVBQWU7UUFDdkIsWUFBWSxFQUFFLGVBQWU7UUFDN0IsV0FBVyxFQUFFLGdCQUFnQjtRQUM3QixVQUFVLEVBQUUsa0JBQWtCO1FBQzlCLFNBQVMsRUFBRSxtQkFBbUI7S0FDakM7SUFDRCxJQUFJLEVBQUU7UUFDRixNQUFNLEVBQUUsUUFBUTtRQUNoQixZQUFZLEVBQUUsUUFBUTtRQUN0QixXQUFXLEVBQUUsUUFBUTtRQUNyQixVQUFVLEVBQUUsUUFBUTtRQUNwQixTQUFTLEVBQUUsUUFBUTtLQUN0QjtJQUNELEtBQUssRUFBRTtRQUNILE1BQU0sRUFBRSxlQUFlO1FBQ3ZCLFlBQVksRUFBRSxlQUFlO1FBQzdCLFdBQVcsRUFBRSxlQUFlO1FBQzVCLFVBQVUsRUFBRSxhQUFhO1FBQ3pCLFNBQVMsRUFBRSxhQUFhO0tBQzNCO0NBQ0osQ0FBQztBQUVGLElBQU0sV0FBVyxHQUFHLGVBQWUsQ0FBQztBQUVwQztJQVNJLCtCQUFZLEtBQWlCLEVBQVUsT0FBc0I7UUFBdEIsWUFBTyxHQUFQLE9BQU8sQ0FBZTtRQUN6RCxJQUFJLENBQUMsYUFBYSxHQUFHLEtBQUssQ0FBQyxhQUFhLENBQUM7UUFDekMsUUFBUSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFDOUMsQ0FBQztJQUVELCtDQUFlLEdBQWY7UUFDSSxJQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQztRQUMvQyxJQUFJLGNBQWMsR0FBRyxFQUFFLENBQUM7UUFDeEIsSUFBSSxZQUFZLEVBQUU7WUFDZCxjQUFjLEdBQUcsY0FBWSxDQUFDLGdCQUFnQixDQUFDLFlBQVksQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDLElBQUksZ0JBQWdCLENBQUMsWUFBWSxDQUFDLENBQUMsSUFBSSxDQUFHLENBQUM7U0FDckk7UUFDRCxRQUFRLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxtQkFBaUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUFTLFNBQUksY0FBZ0IsRUFBRSxJQUFJLENBQUMsQ0FBQztJQUNwRyxDQUFDOztnQkFyQkosU0FBUyxTQUFDO29CQUNQLFFBQVEsRUFBRSxvQkFBb0I7b0JBQzlCLHFOQUE2QztpQkFDaEQ7Ozs7Z0JBbkNrQyxVQUFVO2dCQUlwQyxhQUFhOzs7d0JBbUNqQixLQUFLOztJQWVWLDRCQUFDO0NBQUEsQUF0QkQsSUFzQkM7U0FsQlkscUJBQXFCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQWZ0ZXJWaWV3SW5pdCwgQ29tcG9uZW50LCBFbGVtZW50UmVmLCBJbnB1dCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBhZGRDbGFzcyB9IGZyb20gJ0B3bS9jb3JlJztcblxuaW1wb3J0IHsgTWVudUNvbXBvbmVudCB9IGZyb20gJy4uL21lbnUuY29tcG9uZW50JztcblxuY29uc3QgYW5pbWF0aW9uQ2xhc3NlcyA9IHtcbiAgICBzY2FsZToge1xuICAgICAgICAnbmFtZSc6ICd3bVNjYWxlSW5MZWZ0JyxcbiAgICAgICAgJ2Rvd24scmlnaHQnOiAnd21TY2FsZUluTGVmdCcsXG4gICAgICAgICdkb3duLGxlZnQnOiAnd21TY2FsZUluUmlnaHQnLFxuICAgICAgICAndXAscmlnaHQnOiAnd21TY2FsZUluVG9wTGVmdCcsXG4gICAgICAgICd1cCxsZWZ0JzogJ3dtU2NhbGVJblRvcFJpZ2h0J1xuICAgIH0sXG4gICAgZmFkZToge1xuICAgICAgICAnbmFtZSc6ICdmYWRlSW4nLFxuICAgICAgICAnZG93bixyaWdodCc6ICdmYWRlSW4nLFxuICAgICAgICAnZG93bixsZWZ0JzogJ2ZhZGVJbicsXG4gICAgICAgICd1cCxyaWdodCc6ICdmYWRlSW4nLFxuICAgICAgICAndXAsbGVmdCc6ICdmYWRlSW4nXG4gICAgfSxcbiAgICBzbGlkZToge1xuICAgICAgICAnbmFtZSc6ICd3bVNsaWRlSW5Eb3duJyxcbiAgICAgICAgJ2Rvd24scmlnaHQnOiAnd21TbGlkZUluRG93bicsXG4gICAgICAgICdkb3duLGxlZnQnOiAnd21TbGlkZUluRG93bicsXG4gICAgICAgICd1cCxyaWdodCc6ICd3bVNsaWRlSW5VcCcsXG4gICAgICAgICd1cCxsZWZ0JzogJ3dtU2xpZGVJblVwJ1xuICAgIH1cbn07XG5cbmNvbnN0IERFRkFVTFRfQ0xTID0gJ2Ryb3Bkb3duLW1lbnUnO1xuXG5AQ29tcG9uZW50KHtcbiAgICBzZWxlY3RvcjogJ3VsW3dtTWVudURyb3Bkb3duXScsXG4gICAgdGVtcGxhdGVVcmw6ICcuL21lbnUtZHJvcGRvd24uY29tcG9uZW50Lmh0bWwnXG59KVxuZXhwb3J0IGNsYXNzIE1lbnVEcm9wZG93bkNvbXBvbmVudCBpbXBsZW1lbnRzIEFmdGVyVmlld0luaXQge1xuICAgIHByaXZhdGUgcmVhZG9ubHkgbmF0aXZlRWxlbWVudDtcblxuICAgIEBJbnB1dCgpIGl0ZW1zO1xuXG4gICAgY29uc3RydWN0b3IoZWxSZWY6IEVsZW1lbnRSZWYsIHByaXZhdGUgbWVudVJlZjogTWVudUNvbXBvbmVudCkge1xuICAgICAgICB0aGlzLm5hdGl2ZUVsZW1lbnQgPSBlbFJlZi5uYXRpdmVFbGVtZW50O1xuICAgICAgICBhZGRDbGFzcyh0aGlzLm5hdGl2ZUVsZW1lbnQsIERFRkFVTFRfQ0xTKTtcbiAgICB9XG5cbiAgICBuZ0FmdGVyVmlld0luaXQoKSB7XG4gICAgICAgIGNvbnN0IGFuaW1hdGVJdGVtcyA9IHRoaXMubWVudVJlZi5hbmltYXRlaXRlbXM7XG4gICAgICAgIGxldCBhbmltYXRpb25DbGFzcyA9ICcnO1xuICAgICAgICBpZiAoYW5pbWF0ZUl0ZW1zKSB7XG4gICAgICAgICAgICBhbmltYXRpb25DbGFzcyA9IGBhbmltYXRlZCAkeyhhbmltYXRpb25DbGFzc2VzW2FuaW1hdGVJdGVtc11bdGhpcy5tZW51UmVmLm1lbnVwb3NpdGlvbl0gfHwgYW5pbWF0aW9uQ2xhc3Nlc1thbmltYXRlSXRlbXNdLm5hbWUpfWA7XG4gICAgICAgIH1cbiAgICAgICAgYWRkQ2xhc3ModGhpcy5uYXRpdmVFbGVtZW50LCBgZHJvcGRvd24tbWVudSAke3RoaXMubWVudVJlZi5tZW51YWxpZ259ICR7YW5pbWF0aW9uQ2xhc3N9YCwgdHJ1ZSk7XG4gICAgfVxufVxuIl19