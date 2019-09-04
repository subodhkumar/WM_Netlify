import { Pipe } from '@angular/core';
import { getImageUrl } from '../utils/widget-utils';
var ImagePipe = /** @class */ (function () {
    function ImagePipe() {
    }
    ImagePipe.prototype.transform = function (url, encode, defaultImageUrl) {
        return getImageUrl(url, encode, defaultImageUrl);
    };
    ImagePipe.decorators = [
        { type: Pipe, args: [{
                    name: 'image'
                },] }
    ];
    return ImagePipe;
}());
export { ImagePipe };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1hZ2UucGlwZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsicGlwZXMvaW1hZ2UucGlwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsSUFBSSxFQUFpQixNQUFNLGVBQWUsQ0FBQztBQUVwRCxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFFcEQ7SUFBQTtJQU9BLENBQUM7SUFIRyw2QkFBUyxHQUFULFVBQVUsR0FBVyxFQUFFLE1BQWdCLEVBQUUsZUFBd0I7UUFDN0QsT0FBTyxXQUFXLENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxlQUFlLENBQUMsQ0FBQztJQUNyRCxDQUFDOztnQkFOSixJQUFJLFNBQUM7b0JBQ0YsSUFBSSxFQUFFLE9BQU87aUJBQ2hCOztJQUtELGdCQUFDO0NBQUEsQUFQRCxJQU9DO1NBSlksU0FBUyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFBpcGUsIFBpcGVUcmFuc2Zvcm0gfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgZ2V0SW1hZ2VVcmwgfSBmcm9tICcuLi91dGlscy93aWRnZXQtdXRpbHMnO1xuXG5AUGlwZSh7XG4gICAgbmFtZTogJ2ltYWdlJ1xufSlcbmV4cG9ydCBjbGFzcyBJbWFnZVBpcGUgaW1wbGVtZW50cyBQaXBlVHJhbnNmb3JtIHtcbiAgICB0cmFuc2Zvcm0odXJsOiBzdHJpbmcsIGVuY29kZT86IGJvb2xlYW4sIGRlZmF1bHRJbWFnZVVybD86IHN0cmluZykge1xuICAgICAgICByZXR1cm4gZ2V0SW1hZ2VVcmwodXJsLCBlbmNvZGUsIGRlZmF1bHRJbWFnZVVybCk7XG4gICAgfVxufVxuIl19