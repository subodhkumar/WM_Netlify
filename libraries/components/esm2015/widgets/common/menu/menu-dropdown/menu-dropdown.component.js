import { Component, ElementRef, Input } from '@angular/core';
import { addClass } from '@wm/core';
import { MenuComponent } from '../menu.component';
const animationClasses = {
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
const DEFAULT_CLS = 'dropdown-menu';
export class MenuDropdownComponent {
    constructor(elRef, menuRef) {
        this.menuRef = menuRef;
        this.nativeElement = elRef.nativeElement;
        addClass(this.nativeElement, DEFAULT_CLS);
    }
    ngAfterViewInit() {
        const animateItems = this.menuRef.animateitems;
        let animationClass = '';
        if (animateItems) {
            animationClass = `animated ${(animationClasses[animateItems][this.menuRef.menuposition] || animationClasses[animateItems].name)}`;
        }
        addClass(this.nativeElement, `dropdown-menu ${this.menuRef.menualign} ${animationClass}`, true);
    }
}
MenuDropdownComponent.decorators = [
    { type: Component, args: [{
                selector: 'ul[wmMenuDropdown]',
                template: "<li wmMenuDropdownItem *ngFor=\"let item of items\"\n    [item]=\"item\"\n    [ngClass]=\"{disabled: item.disabled, 'dropdown-submenu': item.children.length > 0}\"\n    class=\"{{item.class}}\">\n</li>"
            }] }
];
/** @nocollapse */
MenuDropdownComponent.ctorParameters = () => [
    { type: ElementRef },
    { type: MenuComponent }
];
MenuDropdownComponent.propDecorators = {
    items: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS1kcm9wZG93bi5jb21wb25lbnQuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29tcG9uZW50cy8iLCJzb3VyY2VzIjpbIndpZGdldHMvY29tbW9uL21lbnUvbWVudS1kcm9wZG93bi9tZW51LWRyb3Bkb3duLmNvbXBvbmVudC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQWlCLFNBQVMsRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBRTVFLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFFcEMsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBRWxELE1BQU0sZ0JBQWdCLEdBQUc7SUFDckIsS0FBSyxFQUFFO1FBQ0gsTUFBTSxFQUFFLGVBQWU7UUFDdkIsWUFBWSxFQUFFLGVBQWU7UUFDN0IsV0FBVyxFQUFFLGdCQUFnQjtRQUM3QixVQUFVLEVBQUUsa0JBQWtCO1FBQzlCLFNBQVMsRUFBRSxtQkFBbUI7S0FDakM7SUFDRCxJQUFJLEVBQUU7UUFDRixNQUFNLEVBQUUsUUFBUTtRQUNoQixZQUFZLEVBQUUsUUFBUTtRQUN0QixXQUFXLEVBQUUsUUFBUTtRQUNyQixVQUFVLEVBQUUsUUFBUTtRQUNwQixTQUFTLEVBQUUsUUFBUTtLQUN0QjtJQUNELEtBQUssRUFBRTtRQUNILE1BQU0sRUFBRSxlQUFlO1FBQ3ZCLFlBQVksRUFBRSxlQUFlO1FBQzdCLFdBQVcsRUFBRSxlQUFlO1FBQzVCLFVBQVUsRUFBRSxhQUFhO1FBQ3pCLFNBQVMsRUFBRSxhQUFhO0tBQzNCO0NBQ0osQ0FBQztBQUVGLE1BQU0sV0FBVyxHQUFHLGVBQWUsQ0FBQztBQU1wQyxNQUFNLE9BQU8scUJBQXFCO0lBSzlCLFlBQVksS0FBaUIsRUFBVSxPQUFzQjtRQUF0QixZQUFPLEdBQVAsT0FBTyxDQUFlO1FBQ3pELElBQUksQ0FBQyxhQUFhLEdBQUcsS0FBSyxDQUFDLGFBQWEsQ0FBQztRQUN6QyxRQUFRLENBQUMsSUFBSSxDQUFDLGFBQWEsRUFBRSxXQUFXLENBQUMsQ0FBQztJQUM5QyxDQUFDO0lBRUQsZUFBZTtRQUNYLE1BQU0sWUFBWSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsWUFBWSxDQUFDO1FBQy9DLElBQUksY0FBYyxHQUFHLEVBQUUsQ0FBQztRQUN4QixJQUFJLFlBQVksRUFBRTtZQUNkLGNBQWMsR0FBRyxZQUFZLENBQUMsZ0JBQWdCLENBQUMsWUFBWSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxZQUFZLENBQUMsSUFBSSxnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDO1NBQ3JJO1FBQ0QsUUFBUSxDQUFDLElBQUksQ0FBQyxhQUFhLEVBQUUsaUJBQWlCLElBQUksQ0FBQyxPQUFPLENBQUMsU0FBUyxJQUFJLGNBQWMsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3BHLENBQUM7OztZQXJCSixTQUFTLFNBQUM7Z0JBQ1AsUUFBUSxFQUFFLG9CQUFvQjtnQkFDOUIscU5BQTZDO2FBQ2hEOzs7O1lBbkNrQyxVQUFVO1lBSXBDLGFBQWE7OztvQkFtQ2pCLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBZnRlclZpZXdJbml0LCBDb21wb25lbnQsIEVsZW1lbnRSZWYsIElucHV0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7IGFkZENsYXNzIH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5pbXBvcnQgeyBNZW51Q29tcG9uZW50IH0gZnJvbSAnLi4vbWVudS5jb21wb25lbnQnO1xuXG5jb25zdCBhbmltYXRpb25DbGFzc2VzID0ge1xuICAgIHNjYWxlOiB7XG4gICAgICAgICduYW1lJzogJ3dtU2NhbGVJbkxlZnQnLFxuICAgICAgICAnZG93bixyaWdodCc6ICd3bVNjYWxlSW5MZWZ0JyxcbiAgICAgICAgJ2Rvd24sbGVmdCc6ICd3bVNjYWxlSW5SaWdodCcsXG4gICAgICAgICd1cCxyaWdodCc6ICd3bVNjYWxlSW5Ub3BMZWZ0JyxcbiAgICAgICAgJ3VwLGxlZnQnOiAnd21TY2FsZUluVG9wUmlnaHQnXG4gICAgfSxcbiAgICBmYWRlOiB7XG4gICAgICAgICduYW1lJzogJ2ZhZGVJbicsXG4gICAgICAgICdkb3duLHJpZ2h0JzogJ2ZhZGVJbicsXG4gICAgICAgICdkb3duLGxlZnQnOiAnZmFkZUluJyxcbiAgICAgICAgJ3VwLHJpZ2h0JzogJ2ZhZGVJbicsXG4gICAgICAgICd1cCxsZWZ0JzogJ2ZhZGVJbidcbiAgICB9LFxuICAgIHNsaWRlOiB7XG4gICAgICAgICduYW1lJzogJ3dtU2xpZGVJbkRvd24nLFxuICAgICAgICAnZG93bixyaWdodCc6ICd3bVNsaWRlSW5Eb3duJyxcbiAgICAgICAgJ2Rvd24sbGVmdCc6ICd3bVNsaWRlSW5Eb3duJyxcbiAgICAgICAgJ3VwLHJpZ2h0JzogJ3dtU2xpZGVJblVwJyxcbiAgICAgICAgJ3VwLGxlZnQnOiAnd21TbGlkZUluVXAnXG4gICAgfVxufTtcblxuY29uc3QgREVGQVVMVF9DTFMgPSAnZHJvcGRvd24tbWVudSc7XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAndWxbd21NZW51RHJvcGRvd25dJyxcbiAgICB0ZW1wbGF0ZVVybDogJy4vbWVudS1kcm9wZG93bi5jb21wb25lbnQuaHRtbCdcbn0pXG5leHBvcnQgY2xhc3MgTWVudURyb3Bkb3duQ29tcG9uZW50IGltcGxlbWVudHMgQWZ0ZXJWaWV3SW5pdCB7XG4gICAgcHJpdmF0ZSByZWFkb25seSBuYXRpdmVFbGVtZW50O1xuXG4gICAgQElucHV0KCkgaXRlbXM7XG5cbiAgICBjb25zdHJ1Y3RvcihlbFJlZjogRWxlbWVudFJlZiwgcHJpdmF0ZSBtZW51UmVmOiBNZW51Q29tcG9uZW50KSB7XG4gICAgICAgIHRoaXMubmF0aXZlRWxlbWVudCA9IGVsUmVmLm5hdGl2ZUVsZW1lbnQ7XG4gICAgICAgIGFkZENsYXNzKHRoaXMubmF0aXZlRWxlbWVudCwgREVGQVVMVF9DTFMpO1xuICAgIH1cblxuICAgIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcbiAgICAgICAgY29uc3QgYW5pbWF0ZUl0ZW1zID0gdGhpcy5tZW51UmVmLmFuaW1hdGVpdGVtcztcbiAgICAgICAgbGV0IGFuaW1hdGlvbkNsYXNzID0gJyc7XG4gICAgICAgIGlmIChhbmltYXRlSXRlbXMpIHtcbiAgICAgICAgICAgIGFuaW1hdGlvbkNsYXNzID0gYGFuaW1hdGVkICR7KGFuaW1hdGlvbkNsYXNzZXNbYW5pbWF0ZUl0ZW1zXVt0aGlzLm1lbnVSZWYubWVudXBvc2l0aW9uXSB8fCBhbmltYXRpb25DbGFzc2VzW2FuaW1hdGVJdGVtc10ubmFtZSl9YDtcbiAgICAgICAgfVxuICAgICAgICBhZGRDbGFzcyh0aGlzLm5hdGl2ZUVsZW1lbnQsIGBkcm9wZG93bi1tZW51ICR7dGhpcy5tZW51UmVmLm1lbnVhbGlnbn0gJHthbmltYXRpb25DbGFzc31gLCB0cnVlKTtcbiAgICB9XG59XG4iXX0=