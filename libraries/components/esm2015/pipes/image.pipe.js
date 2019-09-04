import { Pipe } from '@angular/core';
import { getImageUrl } from '../utils/widget-utils';
export class ImagePipe {
    transform(url, encode, defaultImageUrl) {
        return getImageUrl(url, encode, defaultImageUrl);
    }
}
ImagePipe.decorators = [
    { type: Pipe, args: [{
                name: 'image'
            },] }
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1hZ2UucGlwZS5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS9jb21wb25lbnRzLyIsInNvdXJjZXMiOlsicGlwZXMvaW1hZ2UucGlwZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsSUFBSSxFQUFpQixNQUFNLGVBQWUsQ0FBQztBQUVwRCxPQUFPLEVBQUUsV0FBVyxFQUFFLE1BQU0sdUJBQXVCLENBQUM7QUFLcEQsTUFBTSxPQUFPLFNBQVM7SUFDbEIsU0FBUyxDQUFDLEdBQVcsRUFBRSxNQUFnQixFQUFFLGVBQXdCO1FBQzdELE9BQU8sV0FBVyxDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsZUFBZSxDQUFDLENBQUM7SUFDckQsQ0FBQzs7O1lBTkosSUFBSSxTQUFDO2dCQUNGLElBQUksRUFBRSxPQUFPO2FBQ2hCIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUGlwZSwgUGlwZVRyYW5zZm9ybSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBnZXRJbWFnZVVybCB9IGZyb20gJy4uL3V0aWxzL3dpZGdldC11dGlscyc7XG5cbkBQaXBlKHtcbiAgICBuYW1lOiAnaW1hZ2UnXG59KVxuZXhwb3J0IGNsYXNzIEltYWdlUGlwZSBpbXBsZW1lbnRzIFBpcGVUcmFuc2Zvcm0ge1xuICAgIHRyYW5zZm9ybSh1cmw6IHN0cmluZywgZW5jb2RlPzogYm9vbGVhbiwgZGVmYXVsdEltYWdlVXJsPzogc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBnZXRJbWFnZVVybCh1cmwsIGVuY29kZSwgZGVmYXVsdEltYWdlVXJsKTtcbiAgICB9XG59XG4iXX0=