import { Pipe, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
var TrustAsPipe = /** @class */ (function () {
    function TrustAsPipe(domSanitizer) {
        this.domSanitizer = domSanitizer;
    }
    TrustAsPipe.prototype.transform = function (content, as) {
        if (as === 'resource' || as === SecurityContext.RESOURCE_URL) {
            if (!content) {
                return '';
            }
            return this.domSanitizer.bypassSecurityTrustResourceUrl(content);
        }
        if (as === 'html' || as === SecurityContext.HTML) {
            if (content === null || content === undefined) {
                return '';
            }
            return this.domSanitizer.sanitize(SecurityContext.HTML, content);
        }
    };
    TrustAsPipe.decorators = [
        { type: Pipe, args: [{
                    name: 'trustAs'
                },] }
    ];
    /** @nocollapse */
    TrustAsPipe.ctorParameters = function () { return [
        { type: DomSanitizer }
    ]; };
    return TrustAsPipe;
}());
export { TrustAsPipe };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJ1c3QtYXMucGlwZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsicGlwZXMvdHJ1c3QtYXMucGlwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsSUFBSSxFQUFpQixlQUFlLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDckUsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBRXpEO0lBS0kscUJBQW9CLFlBQTBCO1FBQTFCLGlCQUFZLEdBQVosWUFBWSxDQUFjO0lBQUcsQ0FBQztJQUVsRCwrQkFBUyxHQUFULFVBQVUsT0FBZSxFQUFFLEVBQTRCO1FBQ25ELElBQUksRUFBRSxLQUFLLFVBQVUsSUFBSSxFQUFFLEtBQUssZUFBZSxDQUFDLFlBQVksRUFBRTtZQUMxRCxJQUFJLENBQUMsT0FBTyxFQUFFO2dCQUNWLE9BQU8sRUFBRSxDQUFDO2FBQ2I7WUFDRCxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsOEJBQThCLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDcEU7UUFFRCxJQUFJLEVBQUUsS0FBSyxNQUFNLElBQUksRUFBRSxLQUFLLGVBQWUsQ0FBQyxJQUFJLEVBQUU7WUFDOUMsSUFBSSxPQUFPLEtBQUssSUFBSSxJQUFJLE9BQU8sS0FBSyxTQUFTLEVBQUU7Z0JBQzNDLE9BQU8sRUFBRSxDQUFDO2FBQ2I7WUFDRCxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7U0FDcEU7SUFDTCxDQUFDOztnQkFyQkosSUFBSSxTQUFDO29CQUNGLElBQUksRUFBRSxTQUFTO2lCQUNsQjs7OztnQkFKUSxZQUFZOztJQXdCckIsa0JBQUM7Q0FBQSxBQXRCRCxJQXNCQztTQW5CWSxXQUFXIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUGlwZSwgUGlwZVRyYW5zZm9ybSwgU2VjdXJpdHlDb250ZXh0IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBEb21TYW5pdGl6ZXIgfSBmcm9tICdAYW5ndWxhci9wbGF0Zm9ybS1icm93c2VyJztcblxuQFBpcGUoe1xuICAgIG5hbWU6ICd0cnVzdEFzJ1xufSlcbmV4cG9ydCBjbGFzcyBUcnVzdEFzUGlwZSBpbXBsZW1lbnRzIFBpcGVUcmFuc2Zvcm0ge1xuXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBkb21TYW5pdGl6ZXI6IERvbVNhbml0aXplcikge31cblxuICAgIHRyYW5zZm9ybShjb250ZW50OiBzdHJpbmcsIGFzOiBzdHJpbmcgfCBTZWN1cml0eUNvbnRleHQpIHtcbiAgICAgICAgaWYgKGFzID09PSAncmVzb3VyY2UnIHx8IGFzID09PSBTZWN1cml0eUNvbnRleHQuUkVTT1VSQ0VfVVJMKSB7XG4gICAgICAgICAgICBpZiAoIWNvbnRlbnQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kb21TYW5pdGl6ZXIuYnlwYXNzU2VjdXJpdHlUcnVzdFJlc291cmNlVXJsKGNvbnRlbnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGFzID09PSAnaHRtbCcgfHwgYXMgPT09IFNlY3VyaXR5Q29udGV4dC5IVE1MKSB7XG4gICAgICAgICAgICBpZiAoY29udGVudCA9PT0gbnVsbCB8fCBjb250ZW50ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kb21TYW5pdGl6ZXIuc2FuaXRpemUoU2VjdXJpdHlDb250ZXh0LkhUTUwsIGNvbnRlbnQpO1xuICAgICAgICB9XG4gICAgfVxufVxuIl19