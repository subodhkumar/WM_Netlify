import { Pipe } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { CURRENCY_INFO, isDefined } from '@wm/core';
const getEpochValue = data => {
    let epoch;
    // For data in form of string number ('123'), convert to number (123). And don't parse date objects.
    if (!_.isDate(data) && !isNaN(data)) {
        data = parseInt(data, 10);
    }
    // get the timestamp value. If data is time string, append date string to the time value
    epoch = moment(data).valueOf() || moment(new Date().toDateString() + ' ' + data).valueOf();
    return epoch;
};
const ɵ0 = getEpochValue;
export class ToDatePipe {
    constructor(datePipe) {
        this.datePipe = datePipe;
    }
    transform(data, format) {
        let timestamp;
        // 'null' is to be treated as a special case, If user wants to enter null value, empty string will be passed to the backend
        if (data === 'null' || data === '') {
            return '';
        }
        if (!isDefined(data)) {
            return '';
        }
        timestamp = getEpochValue(data);
        if (timestamp) {
            if (format === 'timestamp') {
                return timestamp;
            }
            return this.datePipe.transform(timestamp, format);
        }
        return '';
    }
}
ToDatePipe.decorators = [
    { type: Pipe, args: [{
                name: 'toDate'
            },] }
];
/** @nocollapse */
ToDatePipe.ctorParameters = () => [
    { type: DatePipe }
];
export class ToNumberPipe {
    constructor(decimalPipe) {
        this.decimalPipe = decimalPipe;
    }
    transform(data, fracSize) {
        if (fracSize && !String(fracSize).match(/^(\d+)?\.((\d+)(-(\d+))?)?$/)) {
            fracSize = '1.' + fracSize + '-' + fracSize;
        }
        if (!_.isNaN(+data)) {
            return this.decimalPipe.transform(data, fracSize);
        }
    }
}
ToNumberPipe.decorators = [
    { type: Pipe, args: [{
                name: 'toNumber'
            },] }
];
/** @nocollapse */
ToNumberPipe.ctorParameters = () => [
    { type: DecimalPipe }
];
export class ToCurrencyPipe {
    constructor(decimalPipe) {
        this.decimalPipe = decimalPipe;
    }
    transform(data, currencySymbol, fracSize) {
        const _currencySymbol = (CURRENCY_INFO[currencySymbol] || {}).symbol || currencySymbol || '', _val = new ToNumberPipe(this.decimalPipe).transform(data, fracSize);
        return _val ? _currencySymbol + _val : '';
    }
}
ToCurrencyPipe.decorators = [
    { type: Pipe, args: [{
                name: 'toCurrency'
            },] }
];
/** @nocollapse */
ToCurrencyPipe.ctorParameters = () => [
    { type: DecimalPipe }
];
export class PrefixPipe {
    transform(data, padding) {
        return (_.isUndefined(data) || data === null || data === '') ? data : ((padding || '') + data);
    }
}
PrefixPipe.decorators = [
    { type: Pipe, args: [{
                name: 'prefix'
            },] }
];
export class SuffixPipe {
    transform(data, padding) {
        return (_.isUndefined(data) || data === null || data === '') ? data : (data + (padding || ''));
    }
}
SuffixPipe.decorators = [
    { type: Pipe, args: [{
                name: 'suffix'
            },] }
];
export class TimeFromNowPipe {
    transform(data) {
        let timestamp;
        if (!isDefined(data)) {
            return undefined;
        }
        timestamp = getEpochValue(data);
        return timestamp ? moment(timestamp).fromNow() : undefined;
    }
}
TimeFromNowPipe.decorators = [
    { type: Pipe, args: [{
                name: 'timeFromNow'
            },] }
];
export class NumberToStringPipe extends ToNumberPipe {
}
NumberToStringPipe.decorators = [
    { type: Pipe, args: [{
                name: 'numberToString'
            },] }
];
export class StringToNumberPipe {
    transform(data) {
        return Number(data) || undefined;
    }
}
StringToNumberPipe.decorators = [
    { type: Pipe, args: [{
                name: 'stringToNumber'
            },] }
];
export class FilterPipe {
    transform(data, field, value) {
        if (!data) {
            return [];
        }
        // If object is passed as first paramter
        if (_.isObject(field)) {
            return _.filter(data, field);
        }
        // If key value pair is provided
        return _.filter(data, item => {
            return _.includes(item[field], value);
        });
    }
}
FilterPipe.decorators = [
    { type: Pipe, args: [{
                name: 'filter'
            },] }
];
export class FileSizePipe {
    transform(bytes, precision) {
        const units = [
            'bytes',
            'KB',
            'MB',
            'GB',
            'TB',
            'PB'
        ];
        /*Todo[shubham]
        if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) {
            return isMobile() ? '' : '?';
        }*/
        let unit = 0;
        while (bytes >= 1024) {
            bytes /= 1024;
            unit++;
        }
        return bytes.toFixed(+precision) + ' ' + units[unit];
    }
}
FileSizePipe.decorators = [
    { type: Pipe, args: [{
                name: 'filesize'
            },] }
];
export class FileIconClassPipe {
    transform(fileExtension) {
        const fileClassMapping = {
            'zip': 'fa-file-zip-o',
            'pdf': 'fa-file-pdf-o',
            'rar': 'fa-file-archive-o',
            'txt': 'fa-file-text-o',
            'ppt': 'fa-file-powerpoint-o',
            'pot': 'fa-file-powerpoint-o',
            'pps': 'fa-file-powerpoint-o',
            'pptx': 'fa-file-powerpoint-o',
            'potx': 'fa-file-powerpoint-o',
            'ppsx': 'fa-file-powerpoint-o',
            'mpg': 'fa-file-movie-o',
            'mp4': 'fa-file-movie-o',
            'mov': 'fa-file-movie-o',
            'avi': 'fa-file-movie-o',
            'mp3': 'fa-file-audio-o',
            'docx': 'fa-file-word-o',
            'js': 'fa-file-code-o',
            'md': 'fa-file-code-o',
            'html': 'fa-file-code-o',
            'css': 'fa-file-code-o',
            'xlsx': 'fa-file-excel-o',
            'png': 'fa-file-image-o',
            'jpg': 'fa-file-image-o',
            'jpeg': 'fa-file-image-o',
            'file': 'fa-file-o',
            'default': 'fa-file-o'
        };
        return 'fa ' + (fileClassMapping[fileExtension] || 'fa-file-o');
    }
}
FileIconClassPipe.decorators = [
    { type: Pipe, args: [{
                name: 'fileIconClass'
            },] }
];
export class StateClassPipe {
    transform(state) {
        const stateClassMap = {
            'success': 'wi wi-done text-success',
            'error': 'wi wi-cancel text-danger'
        };
        return stateClassMap[state.toLowerCase()];
    }
}
StateClassPipe.decorators = [
    { type: Pipe, args: [{
                name: 'stateClass'
            },] }
];
export class FileExtensionFromMimePipe {
    transform(mimeType) {
        const typeMapping = {
            'audio/aac': '.aac',
            'application/x-abiword': '.abw',
            'application/vnd.android.package-archive': '.apk',
            'video/x-msvideo': '.avi',
            'application/vnd.amazon.ebook': '.azw',
            'application/octet-stream': '.bin',
            'image/bmp': '.bmp',
            'application/x-bzip': '.bz',
            'application/x-bzip2': '.bz2',
            'application/x-csh': '.csh',
            'text/css': '.css',
            'text/csv': '.csv',
            'application/msword': '.doc',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
            'application/vnd.ms-fontobject': '.eot',
            'application/epub+zip': '.epub',
            'application/ecmascript': '.es',
            'image/gif': '.gif',
            'text/html': '.html',
            'image/x-icon': '.ico',
            'text/calendar': '.ics',
            'application/java-archive': '.jar',
            'image/jpeg': ['.jpeg', '.jpg'],
            'application/javascript': '.js',
            'application/json': '.json',
            'audio/midi': '.mid',
            'audio/x-midi': '.midi',
            'video/mpeg': '.mpeg',
            'application/vnd.apple.installer+xml': 'mpkg',
            'application/vnd.oasis.opendocument.presentation': '.odp',
            'application/vnd.oasis.opendocument.spreadsheet': '.ods',
            'application/vnd.oasis.opendocument.text': '.odt',
            'audio/ogg': '.oga',
            'video/ogg': '.ogv',
            'application/ogg': '.ogx',
            'font/otf': '.otf',
            'image/png': '.png',
            'application/pdf': '.pdf',
            'application/vnd.ms-powerpoint': '.ppt',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': '.pptx',
            'application/x-rar-compressed': '.rar',
            'application/rtf': '.rtf',
            'application/x-sh': '.sh',
            'image/svg+xml': '.svg',
            'application/x-shockwave-flash': '.swf',
            'application/x-tar': '.tar',
            'image/tiff': '.tiff',
            'application/typescript': '.ts',
            'font/ttf': '.ttf',
            'text/plain': '.txt',
            'application/vnd.visio': '.vsd',
            'audio/wav': '.wav',
            'audio/webm': '.weba',
            'video/webm': '.webm',
            'image/webp': '.webp',
            'font/woff': '.woff',
            'font/woff2': '.woff2',
            'application/xhtml+xml': '.xhtml',
            'application/vnd.ms-excel': '.xls',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
            'application/xml': '.xml',
            'application/vnd.mozilla.xul+xml': '.xul',
            'application/zip': '.zip',
            'video/3gpp': '.3gp',
            'audio/3gpp': '.3gp',
            'video/3gpp2': '.3g2',
            'audio/3gpp2': '.3g2',
            'application/x-7z-compressed': '.7z'
        };
        return typeMapping[mimeType];
    }
}
FileExtensionFromMimePipe.decorators = [
    { type: Pipe, args: [{
                name: 'fileExtensionFromMime'
            },] }
];
export { ɵ0 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3VzdG9tLXBpcGVzLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJwaXBlcy9jdXN0b20tcGlwZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLElBQUksRUFBaUIsTUFBTSxlQUFlLENBQUM7QUFDcEQsT0FBTyxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQztBQUN4RCxPQUFPLEVBQUUsYUFBYSxFQUFFLFNBQVMsRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUlwRCxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsRUFBRTtJQUN6QixJQUFJLEtBQUssQ0FBQztJQUNWLG9HQUFvRztJQUNwRyxJQUFJLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsRUFBRTtRQUNqQyxJQUFJLEdBQUcsUUFBUSxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztLQUM3QjtJQUNELHdGQUF3RjtJQUN4RixLQUFLLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sRUFBRSxJQUFJLE1BQU0sQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLFlBQVksRUFBRSxHQUFHLEdBQUcsR0FBRyxJQUFJLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUMzRixPQUFPLEtBQUssQ0FBQztBQUNqQixDQUFDLENBQUM7O0FBS0YsTUFBTSxPQUFPLFVBQVU7SUFvQm5CLFlBQW9CLFFBQWtCO1FBQWxCLGFBQVEsR0FBUixRQUFRLENBQVU7SUFBRyxDQUFDO0lBbkIxQyxTQUFTLENBQUMsSUFBUyxFQUFFLE1BQVc7UUFDNUIsSUFBSSxTQUFTLENBQUM7UUFDZCwySEFBMkg7UUFDM0gsSUFBSSxJQUFJLEtBQUssTUFBTSxJQUFJLElBQUksS0FBSyxFQUFFLEVBQUU7WUFDaEMsT0FBTyxFQUFFLENBQUM7U0FDYjtRQUNELElB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QUFNO1lBQ3BCLHVCQUF1QixFQUFFLE1BQU07WUFDL0IsV0FBVyxFQUFFLE1BQU07WUFDbkIsWUFBWSxFQUFFLE9BQU87WUFDckIsWUFBWSxFQUFFLE9BQU87WUFDckIsWUFBWSxFQUFFLE9BQU87WUFDckIsV0FBVyxFQUFFLE9BQU87WUFDcEIsWUFBWSxFQUFFLFFBQVE7WUFDdEIsdUJBQXVCLEVBQUUsUUFBUTtZQUNqQywwQkFBMEIsRUFBRSxNQUFNO1lBQ2xDLG1FQUFtRSxFQUFFLE9BQU87WUFDNUUsaUJBQWlCLEVBQUUsTUFBTTtZQUN6QixpQ0FBaUMsRUFBRSxNQUFNO1lBQ3pDLGlCQUFpQixFQUFFLE1BQU07WUFDekIsWUFBWSxFQUFFLE1BQU07WUFDcEIsWUFBWSxFQUFFLE1BQU07WUFDcEIsYUFBYSxFQUFFLE1BQU07WUFDckIsYUFBYSxFQUFFLE1BQU07WUFDckIsNkJBQTZCLEVBQUUsS0FBSztTQUN2QyxDQUFDO1FBRUYsT0FBTyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDakMsQ0FBQzs7O1lBN0VKLElBQUksU0FBQztnQkFDRixJQUFJLEVBQUUsdUJBQXVCO2FBQ2hDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUGlwZSwgUGlwZVRyYW5zZm9ybSB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHsgRGF0ZVBpcGUsIERlY2ltYWxQaXBlIH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7IENVUlJFTkNZX0lORk8sIGlzRGVmaW5lZCB9IGZyb20gJ0B3bS9jb3JlJztcblxuZGVjbGFyZSBjb25zdCBtb21lbnQsIF8sICQ7XG5cbmNvbnN0IGdldEVwb2NoVmFsdWUgPSBkYXRhID0+IHtcbiAgICBsZXQgZXBvY2g7XG4gICAgLy8gRm9yIGRhdGEgaW4gZm9ybSBvZiBzdHJpbmcgbnVtYmVyICgnMTIzJyksIGNvbnZlcnQgdG8gbnVtYmVyICgxMjMpLiBBbmQgZG9uJ3QgcGFyc2UgZGF0ZSBvYmplY3RzLlxuICAgIGlmICghXy5pc0RhdGUoZGF0YSkgJiYgIWlzTmFOKGRhdGEpKSB7XG4gICAgICAgIGRhdGEgPSBwYXJzZUludChkYXRhLCAxMCk7XG4gICAgfVxuICAgIC8vIGdldCB0aGUgdGltZXN0YW1wIHZhbHVlLiBJZiBkYXRhIGlzIHRpbWUgc3RyaW5nLCBhcHBlbmQgZGF0ZSBzdHJpbmcgdG8gdGhlIHRpbWUgdmFsdWVcbiAgICBlcG9jaCA9IG1vbWVudChkYXRhKS52YWx1ZU9mKCkgfHwgbW9tZW50KG5ldyBEYXRlKCkudG9EYXRlU3RyaW5nKCkgKyAnICcgKyBkYXRhKS52YWx1ZU9mKCk7XG4gICAgcmV0dXJuIGVwb2NoO1xufTtcblxuQFBpcGUoe1xuICAgIG5hbWU6ICd0b0RhdGUnXG59KVxuZXhwb3J0IGNsYXNzIFRvRGF0ZVBpcGUgaW1wbGVtZW50cyBQaXBlVHJhbnNmb3JtIHtcbiAgICB0cmFuc2Zvcm0oZGF0YTogYW55LCBmb3JtYXQ6IGFueSkge1xuICAgICAgICBsZXQgdGltZXN0YW1wO1xuICAgICAgICAvLyAnbnVsbCcgaXMgdG8gYmUgdHJlYXRlZCBhcyBhIHNwZWNpYWwgY2FzZSwgSWYgdXNlciB3YW50cyB0byBlbnRlciBudWxsIHZhbHVlLCBlbXB0eSBzdHJpbmcgd2lsbCBiZSBwYXNzZWQgdG8gdGhlIGJhY2tlbmRcbiAgICAgICAgaWYgKGRhdGEgPT09ICdudWxsJyB8fCBkYXRhID09PSAnJykge1xuICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgICAgICB9XG4gICAgICAgIGlmICghaXNEZWZpbmVkKGRhdGEpKSB7XG4gICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgIH1cbiAgICAgICAgdGltZXN0YW1wID0gZ2V0RXBvY2hWYWx1ZShkYXRhKTtcbiAgICAgICAgaWYgKHRpbWVzdGFtcCkge1xuICAgICAgICAgICAgaWYgKGZvcm1hdCA9PT0gJ3RpbWVzdGFtcCcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGltZXN0YW1wO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGF0ZVBpcGUudHJhbnNmb3JtKHRpbWVzdGFtcCwgZm9ybWF0KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gJyc7XG4gICAgfVxuXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBkYXRlUGlwZTogRGF0ZVBpcGUpIHt9XG59XG5cbkBQaXBlKHtcbiAgICBuYW1lOiAndG9OdW1iZXInXG59KVxuZXhwb3J0IGNsYXNzIFRvTnVtYmVyUGlwZSBpbXBsZW1lbnRzIFBpcGVUcmFuc2Zvcm0ge1xuICAgIHRyYW5zZm9ybShkYXRhLCBmcmFjU2l6ZSkge1xuICAgICAgICBpZiAoZnJhY1NpemUgJiYgIVN0cmluZyhmcmFjU2l6ZSkubWF0Y2goL14oXFxkKyk/XFwuKChcXGQrKSgtKFxcZCspKT8pPyQvKSkge1xuICAgICAgICAgICAgZnJhY1NpemUgPSAnMS4nICsgZnJhY1NpemUgKyAnLScgKyBmcmFjU2l6ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIV8uaXNOYU4oK2RhdGEpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kZWNpbWFsUGlwZS50cmFuc2Zvcm0oZGF0YSwgZnJhY1NpemUpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgZGVjaW1hbFBpcGU6IERlY2ltYWxQaXBlKSB7fVxufVxuXG5AUGlwZSh7XG4gICAgbmFtZTogJ3RvQ3VycmVuY3knXG59KVxuZXhwb3J0IGNsYXNzIFRvQ3VycmVuY3lQaXBlIGltcGxlbWVudHMgUGlwZVRyYW5zZm9ybSB7XG4gICAgdHJhbnNmb3JtKGRhdGEsIGN1cnJlbmN5U3ltYm9sLCBmcmFjU2l6ZSkge1xuICAgICAgICBjb25zdCBfY3VycmVuY3lTeW1ib2wgPSAoQ1VSUkVOQ1lfSU5GT1tjdXJyZW5jeVN5bWJvbF0gfHwge30pLnN5bWJvbCB8fCBjdXJyZW5jeVN5bWJvbCB8fCAnJyxcbiAgICAgICAgICAgIF92YWwgPSBuZXcgVG9OdW1iZXJQaXBlKHRoaXMuZGVjaW1hbFBpcGUpLnRyYW5zZm9ybShkYXRhLCBmcmFjU2l6ZSk7XG4gICAgICAgIHJldHVybiBfdmFsID8gX2N1cnJlbmN5U3ltYm9sICsgX3ZhbCA6ICcnO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKHByaXZhdGUgZGVjaW1hbFBpcGU6IERlY2ltYWxQaXBlKSB7fVxufVxuXG5AUGlwZSh7XG4gICAgbmFtZTogJ3ByZWZpeCdcbn0pXG5leHBvcnQgY2xhc3MgUHJlZml4UGlwZSBpbXBsZW1lbnRzIFBpcGVUcmFuc2Zvcm0ge1xuICAgIHRyYW5zZm9ybShkYXRhLCBwYWRkaW5nKSB7XG4gICAgICAgIHJldHVybiAoXy5pc1VuZGVmaW5lZChkYXRhKSB8fCBkYXRhID09PSBudWxsIHx8IGRhdGEgPT09ICcnKSA/IGRhdGEgOiAoKHBhZGRpbmcgfHwgJycpICsgZGF0YSk7XG4gICAgfVxufVxuXG5AUGlwZSh7XG4gICAgbmFtZTogJ3N1ZmZpeCdcbn0pXG5leHBvcnQgY2xhc3MgU3VmZml4UGlwZSBpbXBsZW1lbnRzIFBpcGVUcmFuc2Zvcm0ge1xuICAgIHRyYW5zZm9ybShkYXRhLCBwYWRkaW5nKSB7XG4gICAgICAgIHJldHVybiAoXy5pc1VuZGVmaW5lZChkYXRhKSB8fCBkYXRhID09PSBudWxsIHx8IGRhdGEgPT09ICcnKSA/IGRhdGEgOiAoZGF0YSArIChwYWRkaW5nIHx8ICcnKSk7XG4gICAgfVxufVxuXG5AUGlwZSh7XG4gICAgbmFtZTogJ3RpbWVGcm9tTm93J1xufSlcbmV4cG9ydCBjbGFzcyBUaW1lRnJvbU5vd1BpcGUgaW1wbGVtZW50cyBQaXBlVHJhbnNmb3JtIHtcbiAgICB0cmFuc2Zvcm0oZGF0YSkge1xuICAgICAgICBsZXQgdGltZXN0YW1wO1xuICAgICAgICBpZiAoIWlzRGVmaW5lZChkYXRhKSkge1xuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICB0aW1lc3RhbXAgPSBnZXRFcG9jaFZhbHVlKGRhdGEpO1xuICAgICAgICByZXR1cm4gdGltZXN0YW1wID8gbW9tZW50KHRpbWVzdGFtcCkuZnJvbU5vdygpIDogdW5kZWZpbmVkO1xuICAgIH1cbn1cblxuQFBpcGUoe1xuICAgIG5hbWU6ICdudW1iZXJUb1N0cmluZydcbn0pXG5leHBvcnQgY2xhc3MgTnVtYmVyVG9TdHJpbmdQaXBlIGV4dGVuZHMgVG9OdW1iZXJQaXBlIGltcGxlbWVudHMgUGlwZVRyYW5zZm9ybSB7fVxuXG5AUGlwZSh7XG4gICAgbmFtZTogJ3N0cmluZ1RvTnVtYmVyJ1xufSlcbmV4cG9ydCBjbGFzcyBTdHJpbmdUb051bWJlclBpcGUgaW1wbGVtZW50cyBQaXBlVHJhbnNmb3JtIHtcbiAgICB0cmFuc2Zvcm0oZGF0YSkge1xuICAgICAgICByZXR1cm4gTnVtYmVyKGRhdGEpIHx8IHVuZGVmaW5lZDtcbiAgICB9XG59XG5cbkBQaXBlKHtcbiAgICBuYW1lOiAnZmlsdGVyJ1xufSlcbmV4cG9ydCBjbGFzcyBGaWx0ZXJQaXBlIGltcGxlbWVudHMgUGlwZVRyYW5zZm9ybSB7XG4gICAgdHJhbnNmb3JtKGRhdGE6IGFueVtdLCBmaWVsZDogYW55LCB2YWx1ZTogYW55KSB7XG4gICAgICAgIGlmICghZGF0YSkge1xuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG4gICAgICAgIC8vIElmIG9iamVjdCBpcyBwYXNzZWQgYXMgZmlyc3QgcGFyYW10ZXJcbiAgICAgICAgaWYgKF8uaXNPYmplY3QoZmllbGQpKSB7XG4gICAgICAgICAgICByZXR1cm4gXy5maWx0ZXIoZGF0YSwgZmllbGQpO1xuICAgICAgICB9XG4gICAgICAgIC8vIElmIGtleSB2YWx1ZSBwYWlyIGlzIHByb3ZpZGVkXG4gICAgICAgIHJldHVybiBfLmZpbHRlcihkYXRhLCBpdGVtID0+IHtcbiAgICAgICAgICAgIHJldHVybiBfLmluY2x1ZGVzKGl0ZW1bZmllbGRdLCB2YWx1ZSk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuQFBpcGUoe1xuICAgIG5hbWU6ICdmaWxlc2l6ZSdcbn0pXG5leHBvcnQgY2xhc3MgRmlsZVNpemVQaXBlIGltcGxlbWVudHMgUGlwZVRyYW5zZm9ybSB7XG4gICAgdHJhbnNmb3JtKGJ5dGVzOiBudW1iZXIsIHByZWNpc2lvbjogbnVtYmVyKSB7XG4gICAgICAgIGNvbnN0IHVuaXRzID0gW1xuICAgICAgICAgICAgJ2J5dGVzJyxcbiAgICAgICAgICAgICdLQicsXG4gICAgICAgICAgICAnTUInLFxuICAgICAgICAgICAgJ0dCJyxcbiAgICAgICAgICAgICdUQicsXG4gICAgICAgICAgICAnUEInXG4gICAgICAgIF07XG5cbiAgICAgICAgLypUb2RvW3NodWJoYW1dXG4gICAgICAgIGlmIChpc05hTihwYXJzZUZsb2F0KGJ5dGVzKSkgfHwgIWlzRmluaXRlKGJ5dGVzKSkge1xuICAgICAgICAgICAgcmV0dXJuIGlzTW9iaWxlKCkgPyAnJyA6ICc/JztcbiAgICAgICAgfSovXG4gICAgICAgIGxldCB1bml0ID0gMDtcbiAgICAgICAgd2hpbGUgKGJ5dGVzID49IDEwMjQpIHtcbiAgICAgICAgICAgIGJ5dGVzIC89IDEwMjQ7XG4gICAgICAgICAgICB1bml0Kys7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGJ5dGVzLnRvRml4ZWQoK3ByZWNpc2lvbikgKyAnICcgKyB1bml0c1t1bml0XTtcbiAgICB9XG59XG5cbkBQaXBlKHtcbiAgICBuYW1lOiAnZmlsZUljb25DbGFzcydcbn0pXG5leHBvcnQgY2xhc3MgRmlsZUljb25DbGFzc1BpcGUgaW1wbGVtZW50cyBQaXBlVHJhbnNmb3JtIHtcbiAgICB0cmFuc2Zvcm0oZmlsZUV4dGVuc2lvbjogYW55KSB7XG4gICAgICAgIGNvbnN0IGZpbGVDbGFzc01hcHBpbmcgPSB7XG4gICAgICAgICAgICAnemlwJyAgICAgICA6ICAgJ2ZhLWZpbGUtemlwLW8nLFxuICAgICAgICAgICAgJ3BkZicgICAgICAgOiAgICdmYS1maWxlLXBkZi1vJyxcbiAgICAgICAgICAgICdyYXInICAgICAgIDogICAnZmEtZmlsZS1hcmNoaXZlLW8nLFxuICAgICAgICAgICAgJ3R4dCcgICAgICAgOiAgICdmYS1maWxlLXRleHQtbycsXG4gICAgICAgICAgICAncHB0JyAgICAgICA6ICAgJ2ZhLWZpbGUtcG93ZXJwb2ludC1vJyxcbiAgICAgICAgICAgICdwb3QnICAgICAgIDogICAnZmEtZmlsZS1wb3dlcnBvaW50LW8nLFxuICAgICAgICAgICAgJ3BwcycgICAgICAgOiAgICdmYS1maWxlLXBvd2VycG9pbnQtbycsXG4gICAgICAgICAgICAncHB0eCcgICAgICA6ICAgJ2ZhLWZpbGUtcG93ZXJwb2ludC1vJyxcbiAgICAgICAgICAgICdwb3R4JyAgICAgIDogICAnZmEtZmlsZS1wb3dlcnBvaW50LW8nLFxuICAgICAgICAgICAgJ3Bwc3gnICAgICAgOiAgICdmYS1maWxlLXBvd2VycG9pbnQtbycsXG4gICAgICAgICAgICAnbXBnJyAgICAgICA6ICAgJ2ZhLWZpbGUtbW92aWUtbycsXG4gICAgICAgICAgICAnbXA0JyAgICAgICA6ICAgJ2ZhLWZpbGUtbW92aWUtbycsXG4gICAgICAgICAgICAnbW92JyAgICAgICA6ICAgJ2ZhLWZpbGUtbW92aWUtbycsXG4gICAgICAgICAgICAnYXZpJyAgICAgICA6ICAgJ2ZhLWZpbGUtbW92aWUtbycsXG4gICAgICAgICAgICAnbXAzJyAgICAgICA6ICAgJ2ZhLWZpbGUtYXVkaW8tbycsXG4gICAgICAgICAgICAnZG9jeCcgICAgICA6ICAgJ2ZhLWZpbGUtd29yZC1vJyxcbiAgICAgICAgICAgICdqcycgICAgICAgIDogICAnZmEtZmlsZS1jb2RlLW8nLFxuICAgICAgICAgICAgJ21kJyAgICAgICAgOiAgICdmYS1maWxlLWNvZGUtbycsXG4gICAgICAgICAgICAnaHRtbCcgICAgICA6ICAgJ2ZhLWZpbGUtY29kZS1vJyxcbiAgICAgICAgICAgICdjc3MnICAgICAgIDogICAnZmEtZmlsZS1jb2RlLW8nLFxuICAgICAgICAgICAgJ3hsc3gnICAgICAgOiAgICdmYS1maWxlLWV4Y2VsLW8nLFxuICAgICAgICAgICAgJ3BuZycgICAgICAgOiAgICdmYS1maWxlLWltYWdlLW8nLFxuICAgICAgICAgICAgJ2pwZycgICAgICAgOiAgICdmYS1maWxlLWltYWdlLW8nLFxuICAgICAgICAgICAgJ2pwZWcnICAgICAgOiAgICdmYS1maWxlLWltYWdlLW8nLFxuICAgICAgICAgICAgJ2ZpbGUnICAgICAgOiAgICdmYS1maWxlLW8nLFxuICAgICAgICAgICAgJ2RlZmF1bHQnICAgOiAgICdmYS1maWxlLW8nXG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuICdmYSAnICsgKGZpbGVDbGFzc01hcHBpbmdbZmlsZUV4dGVuc2lvbl0gfHwgJ2ZhLWZpbGUtbycpO1xuICAgIH1cbn1cblxuQFBpcGUoe1xuICAgIG5hbWU6ICdzdGF0ZUNsYXNzJ1xufSlcbmV4cG9ydCBjbGFzcyBTdGF0ZUNsYXNzUGlwZSBpbXBsZW1lbnRzIFBpcGVUcmFuc2Zvcm0ge1xuICAgIHRyYW5zZm9ybShzdGF0ZSkge1xuICAgICAgICBjb25zdCBzdGF0ZUNsYXNzTWFwID0ge1xuICAgICAgICAgICAgJ3N1Y2Nlc3MnICAgOiAnd2kgd2ktZG9uZSB0ZXh0LXN1Y2Nlc3MnLFxuICAgICAgICAgICAgJ2Vycm9yJyAgICAgOiAnd2kgd2ktY2FuY2VsIHRleHQtZGFuZ2VyJ1xuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gc3RhdGVDbGFzc01hcFtzdGF0ZS50b0xvd2VyQ2FzZSgpXTtcbiAgICB9XG59XG5cbkBQaXBlKHtcbiAgICBuYW1lOiAnZmlsZUV4dGVuc2lvbkZyb21NaW1lJ1xufSlcbmV4cG9ydCBjbGFzcyBGaWxlRXh0ZW5zaW9uRnJvbU1pbWVQaXBlIGltcGxlbWVudHMgUGlwZVRyYW5zZm9ybSB7XG4gICAgdHJhbnNmb3JtKG1pbWVUeXBlOiBhbnkpIHtcbiAgICAgICAgY29uc3QgdHlwZU1hcHBpbmcgPSB7XG4gICAgICAgICAgICAnYXVkaW8vYWFjJzogJy5hYWMnLFxuICAgICAgICAgICAgJ2FwcGxpY2F0aW9uL3gtYWJpd29yZCc6ICcuYWJ3JyxcbiAgICAgICAgICAgICdhcHBsaWNhdGlvbi92bmQuYW5kcm9pZC5wYWNrYWdlLWFyY2hpdmUnOiAnLmFwaycsXG4gICAgICAgICAgICAndmlkZW8veC1tc3ZpZGVvJzogJy5hdmknLFxuICAgICAgICAgICAgJ2FwcGxpY2F0aW9uL3ZuZC5hbWF6b24uZWJvb2snOiAnLmF6dycsXG4gICAgICAgICAgICAnYXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtJzogJy5iaW4nLFxuICAgICAgICAgICAgJ2ltYWdlL2JtcCc6ICcuYm1wJyxcbiAgICAgICAgICAgICdhcHBsaWNhdGlvbi94LWJ6aXAnOiAnLmJ6JyxcbiAgICAgICAgICAgICdhcHBsaWNhdGlvbi94LWJ6aXAyJzogJy5iejInLFxuICAgICAgICAgICAgJ2FwcGxpY2F0aW9uL3gtY3NoJzogJy5jc2gnLFxuICAgICAgICAgICAgJ3RleHQvY3NzJzogJy5jc3MnLFxuICAgICAgICAgICAgJ3RleHQvY3N2JzogJy5jc3YnLFxuICAgICAgICAgICAgJ2FwcGxpY2F0aW9uL21zd29yZCc6ICcuZG9jJyxcbiAgICAgICAgICAgICdhcHBsaWNhdGlvbi92bmQub3BlbnhtbGZvcm1hdHMtb2ZmaWNlZG9jdW1lbnQud29yZHByb2Nlc3NpbmdtbC5kb2N1bWVudCc6ICcuZG9jeCcsXG4gICAgICAgICAgICAnYXBwbGljYXRpb24vdm5kLm1zLWZvbnRvYmplY3QnOiAnLmVvdCcsXG4gICAgICAgICAgICAnYXBwbGljYXRpb24vZXB1Yit6aXAnOiAnLmVwdWInLFxuICAgICAgICAgICAgJ2FwcGxpY2F0aW9uL2VjbWFzY3JpcHQnOiAnLmVzJyxcbiAgICAgICAgICAgICdpbWFnZS9naWYnOiAnLmdpZicsXG4gICAgICAgICAgICAndGV4dC9odG1sJzogJy5odG1sJyxcbiAgICAgICAgICAgICdpbWFnZS94LWljb24nOiAnLmljbycsXG4gICAgICAgICAgICAndGV4dC9jYWxlbmRhcic6ICcuaWNzJyxcbiAgICAgICAgICAgICdhcHBsaWNhdGlvbi9qYXZhLWFyY2hpdmUnOiAnLmphcicsXG4gICAgICAgICAgICAnaW1hZ2UvanBlZyc6IFsnLmpwZWcnLCAnLmpwZyddLFxuICAgICAgICAgICAgJ2FwcGxpY2F0aW9uL2phdmFzY3JpcHQnOiAnLmpzJyxcbiAgICAgICAgICAgICdhcHBsaWNhdGlvbi9qc29uJzogJy5qc29uJyxcbiAgICAgICAgICAgICdhdWRpby9taWRpJzogJy5taWQnLFxuICAgICAgICAgICAgJ2F1ZGlvL3gtbWlkaSc6ICcubWlkaScsXG4gICAgICAgICAgICAndmlkZW8vbXBlZyc6ICcubXBlZycsXG4gICAgICAgICAgICAnYXBwbGljYXRpb24vdm5kLmFwcGxlLmluc3RhbGxlcit4bWwnOiAnbXBrZycsXG4gICAgICAgICAgICAnYXBwbGljYXRpb24vdm5kLm9hc2lzLm9wZW5kb2N1bWVudC5wcmVzZW50YXRpb24nOiAnLm9kcCcsXG4gICAgICAgICAgICAnYXBwbGljYXRpb24vdm5kLm9hc2lzLm9wZW5kb2N1bWVudC5zcHJlYWRzaGVldCc6ICcub2RzJyxcbiAgICAgICAgICAgICdhcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LnRleHQnOiAnLm9kdCcsXG4gICAgICAgICAgICAnYXVkaW8vb2dnJzogJy5vZ2EnLFxuICAgICAgICAgICAgJ3ZpZGVvL29nZyc6ICcub2d2JyxcbiAgICAgICAgICAgICdhcHBsaWNhdGlvbi9vZ2cnOiAnLm9neCcsXG4gICAgICAgICAgICAnZm9udC9vdGYnOiAnLm90ZicsXG4gICAgICAgICAgICAnaW1hZ2UvcG5nJzogJy5wbmcnLFxuICAgICAgICAgICAgJ2FwcGxpY2F0aW9uL3BkZic6ICcucGRmJyxcbiAgICAgICAgICAgICdhcHBsaWNhdGlvbi92bmQubXMtcG93ZXJwb2ludCc6ICcucHB0JyxcbiAgICAgICAgICAgICdhcHBsaWNhdGlvbi92bmQub3BlbnhtbGZvcm1hdHMtb2ZmaWNlZG9jdW1lbnQucHJlc2VudGF0aW9ubWwucHJlc2VudGF0aW9uJzogJy5wcHR4JyxcbiAgICAgICAgICAgICdhcHBsaWNhdGlvbi94LXJhci1jb21wcmVzc2VkJzogJy5yYXInLFxuICAgICAgICAgICAgJ2FwcGxpY2F0aW9uL3J0Zic6ICcucnRmJyxcbiAgICAgICAgICAgICdhcHBsaWNhdGlvbi94LXNoJzogJy5zaCcsXG4gICAgICAgICAgICAnaW1hZ2Uvc3ZnK3htbCc6ICcuc3ZnJyxcbiAgICAgICAgICAgICdhcHBsaWNhdGlvbi94LXNob2Nrd2F2ZS1mbGFzaCc6ICcuc3dmJyxcbiAgICAgICAgICAgICdhcHBsaWNhdGlvbi94LXRhcic6ICcudGFyJyxcbiAgICAgICAgICAgICdpbWFnZS90aWZmJzogJy50aWZmJyxcbiAgICAgICAgICAgICdhcHBsaWNhdGlvbi90eXBlc2NyaXB0JzogJy50cycsXG4gICAgICAgICAgICAnZm9udC90dGYnOiAnLnR0ZicsXG4gICAgICAgICAgICAndGV4dC9wbGFpbic6ICcudHh0JyxcbiAgICAgICAgICAgICdhcHBsaWNhdGlvbi92bmQudmlzaW8nOiAnLnZzZCcsXG4gICAgICAgICAgICAnYXVkaW8vd2F2JzogJy53YXYnLFxuICAgICAgICAgICAgJ2F1ZGlvL3dlYm0nOiAnLndlYmEnLFxuICAgICAgICAgICAgJ3ZpZGVvL3dlYm0nOiAnLndlYm0nLFxuICAgICAgICAgICAgJ2ltYWdlL3dlYnAnOiAnLndlYnAnLFxuICAgICAgICAgICAgJ2ZvbnQvd29mZic6ICcud29mZicsXG4gICAgICAgICAgICAnZm9udC93b2ZmMic6ICcud29mZjInLFxuICAgICAgICAgICAgJ2FwcGxpY2F0aW9uL3hodG1sK3htbCc6ICcueGh0bWwnLFxuICAgICAgICAgICAgJ2FwcGxpY2F0aW9uL3ZuZC5tcy1leGNlbCc6ICcueGxzJyxcbiAgICAgICAgICAgICdhcHBsaWNhdGlvbi92bmQub3BlbnhtbGZvcm1hdHMtb2ZmaWNlZG9jdW1lbnQuc3ByZWFkc2hlZXRtbC5zaGVldCc6ICcueGxzeCcsXG4gICAgICAgICAgICAnYXBwbGljYXRpb24veG1sJzogJy54bWwnLFxuICAgICAgICAgICAgJ2FwcGxpY2F0aW9uL3ZuZC5tb3ppbGxhLnh1bCt4bWwnOiAnLnh1bCcsXG4gICAgICAgICAgICAnYXBwbGljYXRpb24vemlwJzogJy56aXAnLFxuICAgICAgICAgICAgJ3ZpZGVvLzNncHAnOiAnLjNncCcsXG4gICAgICAgICAgICAnYXVkaW8vM2dwcCc6ICcuM2dwJyxcbiAgICAgICAgICAgICd2aWRlby8zZ3BwMic6ICcuM2cyJyxcbiAgICAgICAgICAgICdhdWRpby8zZ3BwMic6ICcuM2cyJyxcbiAgICAgICAgICAgICdhcHBsaWNhdGlvbi94LTd6LWNvbXByZXNzZWQnOiAnLjd6J1xuICAgICAgICB9O1xuXG4gICAgICAgIHJldHVybiB0eXBlTWFwcGluZ1ttaW1lVHlwZV07XG4gICAgfVxufVxuIl19