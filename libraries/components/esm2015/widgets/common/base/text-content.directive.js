import { Directive, ElementRef, Input } from '@angular/core';
export class TextContentDirective {
    constructor(elRef) {
        this.elRef = elRef;
    }
    set textContent(nv) {
        let v = nv;
        if (nv === undefined || nv === null) {
            v = '';
        }
        this.elRef.nativeElement.textContent = v;
    }
}
TextContentDirective.decorators = [
    { type: Directive, args: [{
                selector: '[textContent]'
            },] }
];
/** @nocollapse */
TextContentDirective.ctorParameters = () => [
    { type: ElementRef }
];
TextContentDirective.propDecorators = {
    textContent: [{ type: Input }]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dC1jb250ZW50LmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vYmFzZS90ZXh0LWNvbnRlbnQuZGlyZWN0aXZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUs3RCxNQUFNLE9BQU8sb0JBQW9CO0lBVzdCLFlBQW9CLEtBQWlCO1FBQWpCLFVBQUssR0FBTCxLQUFLLENBQVk7SUFBRyxDQUFDO0lBVnpDLElBQ0ksV0FBVyxDQUFDLEVBQUU7UUFDZCxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7UUFFWCxJQUFJLEVBQUUsS0FBSyxTQUFTLElBQUksRUFBRSxLQUFLLElBQUksRUFBRTtZQUNqQyxDQUFDLEdBQUcsRUFBRSxDQUFDO1NBQ1Y7UUFDRCxJQUFJLENBQUMsS0FBSyxDQUFDLGFBQWEsQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDO0lBQzdDLENBQUM7OztZQVpKLFNBQVMsU0FBQztnQkFDUCxRQUFRLEVBQUUsZUFBZTthQUM1Qjs7OztZQUptQixVQUFVOzs7MEJBTXpCLEtBQUsiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEaXJlY3RpdmUsIEVsZW1lbnRSZWYsIElucHV0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbkBEaXJlY3RpdmUoe1xuICAgIHNlbGVjdG9yOiAnW3RleHRDb250ZW50XSdcbn0pXG5leHBvcnQgY2xhc3MgVGV4dENvbnRlbnREaXJlY3RpdmUge1xuICAgIEBJbnB1dCgpXG4gICAgc2V0IHRleHRDb250ZW50KG52KSB7XG4gICAgICAgIGxldCB2ID0gbnY7XG5cbiAgICAgICAgaWYgKG52ID09PSB1bmRlZmluZWQgfHwgbnYgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHYgPSAnJztcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmVsUmVmLm5hdGl2ZUVsZW1lbnQudGV4dENvbnRlbnQgPSB2O1xuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgZWxSZWY6IEVsZW1lbnRSZWYpIHt9XG59Il19