import { Pipe, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
export class TrustAsPipe {
    constructor(domSanitizer) {
        this.domSanitizer = domSanitizer;
    }
    transform(content, as) {
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
    }
}
TrustAsPipe.decorators = [
    { type: Pipe, args: [{
                name: 'trustAs'
            },] }
];
/** @nocollapse */
TrustAsPipe.ctorParameters = () => [
    { type: DomSanitizer }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJ1c3QtYXMucGlwZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsicGlwZXMvdHJ1c3QtYXMucGlwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsSUFBSSxFQUFpQixlQUFlLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDckUsT0FBTyxFQUFFLFlBQVksRUFBRSxNQUFNLDJCQUEyQixDQUFDO0FBS3pELE1BQU0sT0FBTyxXQUFXO0lBRXBCLFlBQW9CLFlBQTBCO1FBQTFCLGlCQUFZLEdBQVosWUFBWSxDQUFjO0lBQUcsQ0FBQztJQUVsRCxTQUFTLENBQUMsT0FBZSxFQUFFLEVBQTRCO1FBQ25ELElBQUksRUFBRSxLQUFLLFVBQVUsSUFBSSxFQUFFLEtBQUssZUFBZSxDQUFDLFlBQVksRUFBRTtZQUMxRCxJQUFJLENBQUMsT0FBTyxFQUFFO2dCQUNWLE9BQU8sRUFBRSxDQUFDO2FBQ2I7WUFDRCxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsOEJBQThCLENBQUMsT0FBTyxDQUFDLENBQUM7U0FDcEU7UUFFRCxJQUFJLEVBQUUsS0FBSyxNQUFNLElBQUksRUFBRSxLQUFLLGVBQWUsQ0FBQyxJQUFJLEVBQUU7WUFDOUMsSUFBSSxPQUFPLEtBQUssSUFBSSxJQUFJLE9BQU8sS0FBSyxTQUFTLEVBQUU7Z0JBQzNDLE9BQU8sRUFBRSxDQUFDO2FBQ2I7WUFDRCxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLENBQUM7U0FDcEU7SUFDTCxDQUFDOzs7WUFyQkosSUFBSSxTQUFDO2dCQUNGLElBQUksRUFBRSxTQUFTO2FBQ2xCOzs7O1lBSlEsWUFBWSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFBpcGUsIFBpcGVUcmFuc2Zvcm0sIFNlY3VyaXR5Q29udGV4dCB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgRG9tU2FuaXRpemVyIH0gZnJvbSAnQGFuZ3VsYXIvcGxhdGZvcm0tYnJvd3Nlcic7XG5cbkBQaXBlKHtcbiAgICBuYW1lOiAndHJ1c3RBcydcbn0pXG5leHBvcnQgY2xhc3MgVHJ1c3RBc1BpcGUgaW1wbGVtZW50cyBQaXBlVHJhbnNmb3JtIHtcblxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgZG9tU2FuaXRpemVyOiBEb21TYW5pdGl6ZXIpIHt9XG5cbiAgICB0cmFuc2Zvcm0oY29udGVudDogc3RyaW5nLCBhczogc3RyaW5nIHwgU2VjdXJpdHlDb250ZXh0KSB7XG4gICAgICAgIGlmIChhcyA9PT0gJ3Jlc291cmNlJyB8fCBhcyA9PT0gU2VjdXJpdHlDb250ZXh0LlJFU09VUkNFX1VSTCkge1xuICAgICAgICAgICAgaWYgKCFjb250ZW50KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZG9tU2FuaXRpemVyLmJ5cGFzc1NlY3VyaXR5VHJ1c3RSZXNvdXJjZVVybChjb250ZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChhcyA9PT0gJ2h0bWwnIHx8IGFzID09PSBTZWN1cml0eUNvbnRleHQuSFRNTCkge1xuICAgICAgICAgICAgaWYgKGNvbnRlbnQgPT09IG51bGwgfHwgY29udGVudCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZG9tU2FuaXRpemVyLnNhbml0aXplKFNlY3VyaXR5Q29udGV4dC5IVE1MLCBjb250ZW50KTtcbiAgICAgICAgfVxuICAgIH1cbn1cbiJdfQ==