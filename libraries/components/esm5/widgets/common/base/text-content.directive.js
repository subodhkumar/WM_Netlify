import { Directive, ElementRef, Input } from '@angular/core';
var TextContentDirective = /** @class */ (function () {
    function TextContentDirective(elRef) {
        this.elRef = elRef;
    }
    Object.defineProperty(TextContentDirective.prototype, "textContent", {
        set: function (nv) {
            var v = nv;
            if (nv === undefined || nv === null) {
                v = '';
            }
            this.elRef.nativeElement.textContent = v;
        },
        enumerable: true,
        configurable: true
    });
    TextContentDirective.decorators = [
        { type: Directive, args: [{
                    selector: '[textContent]'
                },] }
    ];
    /** @nocollapse */
    TextContentDirective.ctorParameters = function () { return [
        { type: ElementRef }
    ]; };
    TextContentDirective.propDecorators = {
        textContent: [{ type: Input }]
    };
    return TextContentDirective;
}());
export { TextContentDirective };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dC1jb250ZW50LmRpcmVjdGl2ZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsid2lkZ2V0cy9jb21tb24vYmFzZS90ZXh0LWNvbnRlbnQuZGlyZWN0aXZlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLEtBQUssRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUU3RDtJQWNJLDhCQUFvQixLQUFpQjtRQUFqQixVQUFLLEdBQUwsS0FBSyxDQUFZO0lBQUcsQ0FBQztJQVZ6QyxzQkFDSSw2Q0FBVzthQURmLFVBQ2dCLEVBQUU7WUFDZCxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7WUFFWCxJQUFJLEVBQUUsS0FBSyxTQUFTLElBQUksRUFBRSxLQUFLLElBQUksRUFBRTtnQkFDakMsQ0FBQyxHQUFHLEVBQUUsQ0FBQzthQUNWO1lBQ0QsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUMsV0FBVyxHQUFHLENBQUMsQ0FBQztRQUM3QyxDQUFDOzs7T0FBQTs7Z0JBWkosU0FBUyxTQUFDO29CQUNQLFFBQVEsRUFBRSxlQUFlO2lCQUM1Qjs7OztnQkFKbUIsVUFBVTs7OzhCQU16QixLQUFLOztJQVdWLDJCQUFDO0NBQUEsQUFmRCxJQWVDO1NBWlksb0JBQW9CIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGlyZWN0aXZlLCBFbGVtZW50UmVmLCBJbnB1dCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5ARGlyZWN0aXZlKHtcbiAgICBzZWxlY3RvcjogJ1t0ZXh0Q29udGVudF0nXG59KVxuZXhwb3J0IGNsYXNzIFRleHRDb250ZW50RGlyZWN0aXZlIHtcbiAgICBASW5wdXQoKVxuICAgIHNldCB0ZXh0Q29udGVudChudikge1xuICAgICAgICBsZXQgdiA9IG52O1xuXG4gICAgICAgIGlmIChudiA9PT0gdW5kZWZpbmVkIHx8IG52ID09PSBudWxsKSB7XG4gICAgICAgICAgICB2ID0gJyc7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5lbFJlZi5uYXRpdmVFbGVtZW50LnRleHRDb250ZW50ID0gdjtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGVsUmVmOiBFbGVtZW50UmVmKSB7fVxufSJdfQ==