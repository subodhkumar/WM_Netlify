import * as tslib_1 from "tslib";
import { Pipe } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { CURRENCY_INFO, isDefined } from '@wm/core';
var getEpochValue = function (data) {
    var epoch;
    // For data in form of string number ('123'), convert to number (123). And don't parse date objects.
    if (!_.isDate(data) && !isNaN(data)) {
        data = parseInt(data, 10);
    }
    // get the timestamp value. If data is time string, append date string to the time value
    epoch = moment(data).valueOf() || moment(new Date().toDateString() + ' ' + data).valueOf();
    return epoch;
};
var ɵ0 = getEpochValue;
var ToDatePipe = /** @class */ (function () {
    function ToDatePipe(datePipe) {
        this.datePipe = datePipe;
    }
    ToDatePipe.prototype.transform = function (data, format) {
        var timestamp;
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
    };
    ToDatePipe.decorators = [
        { type: Pipe, args: [{
                    name: 'toDate'
                },] }
    ];
    /** @nocollapse */
    ToDatePipe.ctorParameters = function () { return [
        { type: DatePipe }
    ]; };
    return ToDatePipe;
}());
export { ToDatePipe };
var ToNumberPipe = /** @class */ (function () {
    function ToNumberPipe(decimalPipe) {
        this.decimalPipe = decimalPipe;
    }
    ToNumberPipe.prototype.transform = function (data, fracSize) {
        if (fracSize && !String(fracSize).match(/^(\d+)?\.((\d+)(-(\d+))?)?$/)) {
            fracSize = '1.' + fracSize + '-' + fracSize;
        }
        if (!_.isNaN(+data)) {
            return this.decimalPipe.transform(data, fracSize);
        }
    };
    ToNumberPipe.decorators = [
        { type: Pipe, args: [{
                    name: 'toNumber'
                },] }
    ];
    /** @nocollapse */
    ToNumberPipe.ctorParameters = function () { return [
        { type: DecimalPipe }
    ]; };
    return ToNumberPipe;
}());
export { ToNumberPipe };
var ToCurrencyPipe = /** @class */ (function () {
    function ToCurrencyPipe(decimalPipe) {
        this.decimalPipe = decimalPipe;
    }
    ToCurrencyPipe.prototype.transform = function (data, currencySymbol, fracSize) {
        var _currencySymbol = (CURRENCY_INFO[currencySymbol] || {}).symbol || currencySymbol || '', _val = new ToNumberPipe(this.decimalPipe).transform(data, fracSize);
        return _val ? _currencySymbol + _val : '';
    };
    ToCurrencyPipe.decorators = [
        { type: Pipe, args: [{
                    name: 'toCurrency'
                },] }
    ];
    /** @nocollapse */
    ToCurrencyPipe.ctorParameters = function () { return [
        { type: DecimalPipe }
    ]; };
    return ToCurrencyPipe;
}());
export { ToCurrencyPipe };
var PrefixPipe = /** @class */ (function () {
    function PrefixPipe() {
    }
    PrefixPipe.prototype.transform = function (data, padding) {
        return (_.isUndefined(data) || data === null || data === '') ? data : ((padding || '') + data);
    };
    PrefixPipe.decorators = [
        { type: Pipe, args: [{
                    name: 'prefix'
                },] }
    ];
    return PrefixPipe;
}());
export { PrefixPipe };
var SuffixPipe = /** @class */ (function () {
    function SuffixPipe() {
    }
    SuffixPipe.prototype.transform = function (data, padding) {
        return (_.isUndefined(data) || data === null || data === '') ? data : (data + (padding || ''));
    };
    SuffixPipe.decorators = [
        { type: Pipe, args: [{
                    name: 'suffix'
                },] }
    ];
    return SuffixPipe;
}());
export { SuffixPipe };
var TimeFromNowPipe = /** @class */ (function () {
    function TimeFromNowPipe() {
    }
    TimeFromNowPipe.prototype.transform = function (data) {
        var timestamp;
        if (!isDefined(data)) {
            return undefined;
        }
        timestamp = getEpochValue(data);
        return timestamp ? moment(timestamp).fromNow() : undefined;
    };
    TimeFromNowPipe.decorators = [
        { type: Pipe, args: [{
                    name: 'timeFromNow'
                },] }
    ];
    return TimeFromNowPipe;
}());
export { TimeFromNowPipe };
var NumberToStringPipe = /** @class */ (function (_super) {
    tslib_1.__extends(NumberToStringPipe, _super);
    function NumberToStringPipe() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NumberToStringPipe.decorators = [
        { type: Pipe, args: [{
                    name: 'numberToString'
                },] }
    ];
    return NumberToStringPipe;
}(ToNumberPipe));
export { NumberToStringPipe };
var StringToNumberPipe = /** @class */ (function () {
    function StringToNumberPipe() {
    }
    StringToNumberPipe.prototype.transform = function (data) {
        return Number(data) || undefined;
    };
    StringToNumberPipe.decorators = [
        { type: Pipe, args: [{
                    name: 'stringToNumber'
                },] }
    ];
    return StringToNumberPipe;
}());
export { StringToNumberPipe };
var FilterPipe = /** @class */ (function () {
    function FilterPipe() {
    }
    FilterPipe.prototype.transform = function (data, field, value) {
        if (!data) {
            return [];
        }
        // If object is passed as first paramter
        if (_.isObject(field)) {
            return _.filter(data, field);
        }
        // If key value pair is provided
        return _.filter(data, function (item) {
            return _.includes(item[field], value);
        });
    };
    FilterPipe.decorators = [
        { type: Pipe, args: [{
                    name: 'filter'
                },] }
    ];
    return FilterPipe;
}());
export { FilterPipe };
var FileSizePipe = /** @class */ (function () {
    function FileSizePipe() {
    }
    FileSizePipe.prototype.transform = function (bytes, precision) {
        var units = [
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
        var unit = 0;
        while (bytes >= 1024) {
            bytes /= 1024;
            unit++;
        }
        return bytes.toFixed(+precision) + ' ' + units[unit];
    };
    FileSizePipe.decorators = [
        { type: Pipe, args: [{
                    name: 'filesize'
                },] }
    ];
    return FileSizePipe;
}());
export { FileSizePipe };
var FileIconClassPipe = /** @class */ (function () {
    function FileIconClassPipe() {
    }
    FileIconClassPipe.prototype.transform = function (fileExtension) {
        var fileClassMapping = {
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
    };
    FileIconClassPipe.decorators = [
        { type: Pipe, args: [{
                    name: 'fileIconClass'
                },] }
    ];
    return FileIconClassPipe;
}());
export { FileIconClassPipe };
var StateClassPipe = /** @class */ (function () {
    function StateClassPipe() {
    }
    StateClassPipe.prototype.transform = function (state) {
        var stateClassMap = {
            'success': 'wi wi-done text-success',
            'error': 'wi wi-cancel text-danger'
        };
        return stateClassMap[state.toLowerCase()];
    };
    StateClassPipe.decorators = [
        { type: Pipe, args: [{
                    name: 'stateClass'
                },] }
    ];
    return StateClassPipe;
}());
export { StateClassPipe };
var FileExtensionFromMimePipe = /** @class */ (function () {
    function FileExtensionFromMimePipe() {
    }
    FileExtensionFromMimePipe.prototype.transform = function (mimeType) {
        var typeMapping = {
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
    };
    FileExtensionFromMimePipe.decorators = [
        { type: Pipe, args: [{
                    name: 'fileExtensionFromMime'
                },] }
    ];
    return FileExtensionFromMimePipe;
}());
export { FileExtensionFromMimePipe };
export { ɵ0 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3VzdG9tLXBpcGVzLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJwaXBlcy9jdXN0b20tcGlwZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLE9BQU8sRUFBRSxJQUFJLEVBQWlCLE1BQU0sZUFBZSxDQUFDO0FBQ3BELE9BQU8sRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDeEQsT0FBTyxFQUFFLGFBQWEsRUFBRSxTQUFTLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFJcEQsSUFBTSxhQUFhLEdBQUcsVUFBQSxJQUFJO0lBQ3RCLElBQUksS0FBSyxDQUFDO0lBQ1Ysb0dBQW9HO0lBQ3BHLElBQUksQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFO1FBQ2pDLElBQUksR0FBRyxRQUFRLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0tBQzdCO0lBQ0Qsd0ZBQXdGO0lBQ3hGLEtBQUssR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsT0FBTyxFQUFFLElBQUksTUFBTSxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsWUFBWSxFQUFFLEdBQUcsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQzNGLE9BQU8sS0FBSyxDQUFDO0FBQ2pCLENBQUMsQ0FBQzs7QUFFRjtJQXVCSSxvQkFBb0IsUUFBa0I7UUFBbEIsYUFBUSxHQUFSLFFBQVEsQ0FBVTtJQUFHLENBQUM7SUFuQjFDLDhCQUFTLEdBQVQsVUFBVSxJQUFTLEVBQUUsTUFBVztRQUM1QixJQUFJLFNBQVMsQ0FBQztRQUNkLDJIQUEySDtRQUMzSCxJQUFJLElBQUksS0FBSyxNQUFNLElBQUksSUFBSSxLQUFLLEVBQUUsRUFBRTtZQUNoQyxPQUFPLEVBQUUsQ0FBQztTQUNiO1FBQ0QsSUFBSSxDQUFDLFNBQVMs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S0FBSztTQUN2QyxDQUFDO1FBRUYsT0FBTyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDakMsQ0FBQzs7Z0JBN0VKLElBQUksU0FBQztvQkFDRixJQUFJLEVBQUUsdUJBQXVCO2lCQUNoQzs7SUE0RUQsZ0NBQUM7Q0FBQSxBQTlFRCxJQThFQztTQTNFWSx5QkFBeUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBQaXBlLCBQaXBlVHJhbnNmb3JtIH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBEYXRlUGlwZSwgRGVjaW1hbFBpcGUgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHsgQ1VSUkVOQ1lfSU5GTywgaXNEZWZpbmVkIH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5kZWNsYXJlIGNvbnN0IG1vbWVudCwgXywgJDtcblxuY29uc3QgZ2V0RXBvY2hWYWx1ZSA9IGRhdGEgPT4ge1xuICAgIGxldCBlcG9jaDtcbiAgICAvLyBGb3IgZGF0YSBpbiBmb3JtIG9mIHN0cmluZyBudW1iZXIgKCcxMjMnKSwgY29udmVydCB0byBudW1iZXIgKDEyMykuIEFuZCBkb24ndCBwYXJzZSBkYXRlIG9iamVjdHMuXG4gICAgaWYgKCFfLmlzRGF0ZShkYXRhKSAmJiAhaXNOYU4oZGF0YSkpIHtcbiAgICAgICAgZGF0YSA9IHBhcnNlSW50KGRhdGEsIDEwKTtcbiAgICB9XG4gICAgLy8gZ2V0IHRoZSB0aW1lc3RhbXAgdmFsdWUuIElmIGRhdGEgaXMgdGltZSBzdHJpbmcsIGFwcGVuZCBkYXRlIHN0cmluZyB0byB0aGUgdGltZSB2YWx1ZVxuICAgIGVwb2NoID0gbW9tZW50KGRhdGEpLnZhbHVlT2YoKSB8fCBtb21lbnQobmV3IERhdGUoKS50b0RhdGVTdHJpbmcoKSArICcgJyArIGRhdGEpLnZhbHVlT2YoKTtcbiAgICByZXR1cm4gZXBvY2g7XG59O1xuXG5AUGlwZSh7XG4gICAgbmFtZTogJ3RvRGF0ZSdcbn0pXG5leHBvcnQgY2xhc3MgVG9EYXRlUGlwZSBpbXBsZW1lbnRzIFBpcGVUcmFuc2Zvcm0ge1xuICAgIHRyYW5zZm9ybShkYXRhOiBhbnksIGZvcm1hdDogYW55KSB7XG4gICAgICAgIGxldCB0aW1lc3RhbXA7XG4gICAgICAgIC8vICdudWxsJyBpcyB0byBiZSB0cmVhdGVkIGFzIGEgc3BlY2lhbCBjYXNlLCBJZiB1c2VyIHdhbnRzIHRvIGVudGVyIG51bGwgdmFsdWUsIGVtcHR5IHN0cmluZyB3aWxsIGJlIHBhc3NlZCB0byB0aGUgYmFja2VuZFxuICAgICAgICBpZiAoZGF0YSA9PT0gJ251bGwnIHx8IGRhdGEgPT09ICcnKSB7XG4gICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFpc0RlZmluZWQoZGF0YSkpIHtcbiAgICAgICAgICAgIHJldHVybiAnJztcbiAgICAgICAgfVxuICAgICAgICB0aW1lc3RhbXAgPSBnZXRFcG9jaFZhbHVlKGRhdGEpO1xuICAgICAgICBpZiAodGltZXN0YW1wKSB7XG4gICAgICAgICAgICBpZiAoZm9ybWF0ID09PSAndGltZXN0YW1wJykge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aW1lc3RhbXA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5kYXRlUGlwZS50cmFuc2Zvcm0odGltZXN0YW1wLCBmb3JtYXQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAnJztcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIGRhdGVQaXBlOiBEYXRlUGlwZSkge31cbn1cblxuQFBpcGUoe1xuICAgIG5hbWU6ICd0b051bWJlcidcbn0pXG5leHBvcnQgY2xhc3MgVG9OdW1iZXJQaXBlIGltcGxlbWVudHMgUGlwZVRyYW5zZm9ybSB7XG4gICAgdHJhbnNmb3JtKGRhdGEsIGZyYWNTaXplKSB7XG4gICAgICAgIGlmIChmcmFjU2l6ZSAmJiAhU3RyaW5nKGZyYWNTaXplKS5tYXRjaCgvXihcXGQrKT9cXC4oKFxcZCspKC0oXFxkKykpPyk/JC8pKSB7XG4gICAgICAgICAgICBmcmFjU2l6ZSA9ICcxLicgKyBmcmFjU2l6ZSArICctJyArIGZyYWNTaXplO1xuICAgICAgICB9XG4gICAgICAgIGlmICghXy5pc05hTigrZGF0YSkpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmRlY2ltYWxQaXBlLnRyYW5zZm9ybShkYXRhLCBmcmFjU2l6ZSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBkZWNpbWFsUGlwZTogRGVjaW1hbFBpcGUpIHt9XG59XG5cbkBQaXBlKHtcbiAgICBuYW1lOiAndG9DdXJyZW5jeSdcbn0pXG5leHBvcnQgY2xhc3MgVG9DdXJyZW5jeVBpcGUgaW1wbGVtZW50cyBQaXBlVHJhbnNmb3JtIHtcbiAgICB0cmFuc2Zvcm0oZGF0YSwgY3VycmVuY3lTeW1ib2wsIGZyYWNTaXplKSB7XG4gICAgICAgIGNvbnN0IF9jdXJyZW5jeVN5bWJvbCA9IChDVVJSRU5DWV9JTkZPW2N1cnJlbmN5U3ltYm9sXSB8fCB7fSkuc3ltYm9sIHx8IGN1cnJlbmN5U3ltYm9sIHx8ICcnLFxuICAgICAgICAgICAgX3ZhbCA9IG5ldyBUb051bWJlclBpcGUodGhpcy5kZWNpbWFsUGlwZSkudHJhbnNmb3JtKGRhdGEsIGZyYWNTaXplKTtcbiAgICAgICAgcmV0dXJuIF92YWwgPyBfY3VycmVuY3lTeW1ib2wgKyBfdmFsIDogJyc7XG4gICAgfVxuXG4gICAgY29uc3RydWN0b3IocHJpdmF0ZSBkZWNpbWFsUGlwZTogRGVjaW1hbFBpcGUpIHt9XG59XG5cbkBQaXBlKHtcbiAgICBuYW1lOiAncHJlZml4J1xufSlcbmV4cG9ydCBjbGFzcyBQcmVmaXhQaXBlIGltcGxlbWVudHMgUGlwZVRyYW5zZm9ybSB7XG4gICAgdHJhbnNmb3JtKGRhdGEsIHBhZGRpbmcpIHtcbiAgICAgICAgcmV0dXJuIChfLmlzVW5kZWZpbmVkKGRhdGEpIHx8IGRhdGEgPT09IG51bGwgfHwgZGF0YSA9PT0gJycpID8gZGF0YSA6ICgocGFkZGluZyB8fCAnJykgKyBkYXRhKTtcbiAgICB9XG59XG5cbkBQaXBlKHtcbiAgICBuYW1lOiAnc3VmZml4J1xufSlcbmV4cG9ydCBjbGFzcyBTdWZmaXhQaXBlIGltcGxlbWVudHMgUGlwZVRyYW5zZm9ybSB7XG4gICAgdHJhbnNmb3JtKGRhdGEsIHBhZGRpbmcpIHtcbiAgICAgICAgcmV0dXJuIChfLmlzVW5kZWZpbmVkKGRhdGEpIHx8IGRhdGEgPT09IG51bGwgfHwgZGF0YSA9PT0gJycpID8gZGF0YSA6IChkYXRhICsgKHBhZGRpbmcgfHwgJycpKTtcbiAgICB9XG59XG5cbkBQaXBlKHtcbiAgICBuYW1lOiAndGltZUZyb21Ob3cnXG59KVxuZXhwb3J0IGNsYXNzIFRpbWVGcm9tTm93UGlwZSBpbXBsZW1lbnRzIFBpcGVUcmFuc2Zvcm0ge1xuICAgIHRyYW5zZm9ybShkYXRhKSB7XG4gICAgICAgIGxldCB0aW1lc3RhbXA7XG4gICAgICAgIGlmICghaXNEZWZpbmVkKGRhdGEpKSB7XG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIHRpbWVzdGFtcCA9IGdldEVwb2NoVmFsdWUoZGF0YSk7XG4gICAgICAgIHJldHVybiB0aW1lc3RhbXAgPyBtb21lbnQodGltZXN0YW1wKS5mcm9tTm93KCkgOiB1bmRlZmluZWQ7XG4gICAgfVxufVxuXG5AUGlwZSh7XG4gICAgbmFtZTogJ251bWJlclRvU3RyaW5nJ1xufSlcbmV4cG9ydCBjbGFzcyBOdW1iZXJUb1N0cmluZ1BpcGUgZXh0ZW5kcyBUb051bWJlclBpcGUgaW1wbGVtZW50cyBQaXBlVHJhbnNmb3JtIHt9XG5cbkBQaXBlKHtcbiAgICBuYW1lOiAnc3RyaW5nVG9OdW1iZXInXG59KVxuZXhwb3J0IGNsYXNzIFN0cmluZ1RvTnVtYmVyUGlwZSBpbXBsZW1lbnRzIFBpcGVUcmFuc2Zvcm0ge1xuICAgIHRyYW5zZm9ybShkYXRhKSB7XG4gICAgICAgIHJldHVybiBOdW1iZXIoZGF0YSkgfHwgdW5kZWZpbmVkO1xuICAgIH1cbn1cblxuQFBpcGUoe1xuICAgIG5hbWU6ICdmaWx0ZXInXG59KVxuZXhwb3J0IGNsYXNzIEZpbHRlclBpcGUgaW1wbGVtZW50cyBQaXBlVHJhbnNmb3JtIHtcbiAgICB0cmFuc2Zvcm0oZGF0YTogYW55W10sIGZpZWxkOiBhbnksIHZhbHVlOiBhbnkpIHtcbiAgICAgICAgaWYgKCFkYXRhKSB7XG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cbiAgICAgICAgLy8gSWYgb2JqZWN0IGlzIHBhc3NlZCBhcyBmaXJzdCBwYXJhbXRlclxuICAgICAgICBpZiAoXy5pc09iamVjdChmaWVsZCkpIHtcbiAgICAgICAgICAgIHJldHVybiBfLmZpbHRlcihkYXRhLCBmaWVsZCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gSWYga2V5IHZhbHVlIHBhaXIgaXMgcHJvdmlkZWRcbiAgICAgICAgcmV0dXJuIF8uZmlsdGVyKGRhdGEsIGl0ZW0gPT4ge1xuICAgICAgICAgICAgcmV0dXJuIF8uaW5jbHVkZXMoaXRlbVtmaWVsZF0sIHZhbHVlKTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG5AUGlwZSh7XG4gICAgbmFtZTogJ2ZpbGVzaXplJ1xufSlcbmV4cG9ydCBjbGFzcyBGaWxlU2l6ZVBpcGUgaW1wbGVtZW50cyBQaXBlVHJhbnNmb3JtIHtcbiAgICB0cmFuc2Zvcm0oYnl0ZXM6IG51bWJlciwgcHJlY2lzaW9uOiBudW1iZXIpIHtcbiAgICAgICAgY29uc3QgdW5pdHMgPSBbXG4gICAgICAgICAgICAnYnl0ZXMnLFxuICAgICAgICAgICAgJ0tCJyxcbiAgICAgICAgICAgICdNQicsXG4gICAgICAgICAgICAnR0InLFxuICAgICAgICAgICAgJ1RCJyxcbiAgICAgICAgICAgICdQQidcbiAgICAgICAgXTtcblxuICAgICAgICAvKlRvZG9bc2h1YmhhbV1cbiAgICAgICAgaWYgKGlzTmFOKHBhcnNlRmxvYXQoYnl0ZXMpKSB8fCAhaXNGaW5pdGUoYnl0ZXMpKSB7XG4gICAgICAgICAgICByZXR1cm4gaXNNb2JpbGUoKSA/ICcnIDogJz8nO1xuICAgICAgICB9Ki9cbiAgICAgICAgbGV0IHVuaXQgPSAwO1xuICAgICAgICB3aGlsZSAoYnl0ZXMgPj0gMTAyNCkge1xuICAgICAgICAgICAgYnl0ZXMgLz0gMTAyNDtcbiAgICAgICAgICAgIHVuaXQrKztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYnl0ZXMudG9GaXhlZCgrcHJlY2lzaW9uKSArICcgJyArIHVuaXRzW3VuaXRdO1xuICAgIH1cbn1cblxuQFBpcGUoe1xuICAgIG5hbWU6ICdmaWxlSWNvbkNsYXNzJ1xufSlcbmV4cG9ydCBjbGFzcyBGaWxlSWNvbkNsYXNzUGlwZSBpbXBsZW1lbnRzIFBpcGVUcmFuc2Zvcm0ge1xuICAgIHRyYW5zZm9ybShmaWxlRXh0ZW5zaW9uOiBhbnkpIHtcbiAgICAgICAgY29uc3QgZmlsZUNsYXNzTWFwcGluZyA9IHtcbiAgICAgICAgICAgICd6aXAnICAgICAgIDogICAnZmEtZmlsZS16aXAtbycsXG4gICAgICAgICAgICAncGRmJyAgICAgICA6ICAgJ2ZhLWZpbGUtcGRmLW8nLFxuICAgICAgICAgICAgJ3JhcicgICAgICAgOiAgICdmYS1maWxlLWFyY2hpdmUtbycsXG4gICAgICAgICAgICAndHh0JyAgICAgICA6ICAgJ2ZhLWZpbGUtdGV4dC1vJyxcbiAgICAgICAgICAgICdwcHQnICAgICAgIDogICAnZmEtZmlsZS1wb3dlcnBvaW50LW8nLFxuICAgICAgICAgICAgJ3BvdCcgICAgICAgOiAgICdmYS1maWxlLXBvd2VycG9pbnQtbycsXG4gICAgICAgICAgICAncHBzJyAgICAgICA6ICAgJ2ZhLWZpbGUtcG93ZXJwb2ludC1vJyxcbiAgICAgICAgICAgICdwcHR4JyAgICAgIDogICAnZmEtZmlsZS1wb3dlcnBvaW50LW8nLFxuICAgICAgICAgICAgJ3BvdHgnICAgICAgOiAgICdmYS1maWxlLXBvd2VycG9pbnQtbycsXG4gICAgICAgICAgICAncHBzeCcgICAgICA6ICAgJ2ZhLWZpbGUtcG93ZXJwb2ludC1vJyxcbiAgICAgICAgICAgICdtcGcnICAgICAgIDogICAnZmEtZmlsZS1tb3ZpZS1vJyxcbiAgICAgICAgICAgICdtcDQnICAgICAgIDogICAnZmEtZmlsZS1tb3ZpZS1vJyxcbiAgICAgICAgICAgICdtb3YnICAgICAgIDogICAnZmEtZmlsZS1tb3ZpZS1vJyxcbiAgICAgICAgICAgICdhdmknICAgICAgIDogICAnZmEtZmlsZS1tb3ZpZS1vJyxcbiAgICAgICAgICAgICdtcDMnICAgICAgIDogICAnZmEtZmlsZS1hdWRpby1vJyxcbiAgICAgICAgICAgICdkb2N4JyAgICAgIDogICAnZmEtZmlsZS13b3JkLW8nLFxuICAgICAgICAgICAgJ2pzJyAgICAgICAgOiAgICdmYS1maWxlLWNvZGUtbycsXG4gICAgICAgICAgICAnbWQnICAgICAgICA6ICAgJ2ZhLWZpbGUtY29kZS1vJyxcbiAgICAgICAgICAgICdodG1sJyAgICAgIDogICAnZmEtZmlsZS1jb2RlLW8nLFxuICAgICAgICAgICAgJ2NzcycgICAgICAgOiAgICdmYS1maWxlLWNvZGUtbycsXG4gICAgICAgICAgICAneGxzeCcgICAgICA6ICAgJ2ZhLWZpbGUtZXhjZWwtbycsXG4gICAgICAgICAgICAncG5nJyAgICAgICA6ICAgJ2ZhLWZpbGUtaW1hZ2UtbycsXG4gICAgICAgICAgICAnanBnJyAgICAgICA6ICAgJ2ZhLWZpbGUtaW1hZ2UtbycsXG4gICAgICAgICAgICAnanBlZycgICAgICA6ICAgJ2ZhLWZpbGUtaW1hZ2UtbycsXG4gICAgICAgICAgICAnZmlsZScgICAgICA6ICAgJ2ZhLWZpbGUtbycsXG4gICAgICAgICAgICAnZGVmYXVsdCcgICA6ICAgJ2ZhLWZpbGUtbydcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gJ2ZhICcgKyAoZmlsZUNsYXNzTWFwcGluZ1tmaWxlRXh0ZW5zaW9uXSB8fCAnZmEtZmlsZS1vJyk7XG4gICAgfVxufVxuXG5AUGlwZSh7XG4gICAgbmFtZTogJ3N0YXRlQ2xhc3MnXG59KVxuZXhwb3J0IGNsYXNzIFN0YXRlQ2xhc3NQaXBlIGltcGxlbWVudHMgUGlwZVRyYW5zZm9ybSB7XG4gICAgdHJhbnNmb3JtKHN0YXRlKSB7XG4gICAgICAgIGNvbnN0IHN0YXRlQ2xhc3NNYXAgPSB7XG4gICAgICAgICAgICAnc3VjY2VzcycgICA6ICd3aSB3aS1kb25lIHRleHQtc3VjY2VzcycsXG4gICAgICAgICAgICAnZXJyb3InICAgICA6ICd3aSB3aS1jYW5jZWwgdGV4dC1kYW5nZXInXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBzdGF0ZUNsYXNzTWFwW3N0YXRlLnRvTG93ZXJDYXNlKCldO1xuICAgIH1cbn1cblxuQFBpcGUoe1xuICAgIG5hbWU6ICdmaWxlRXh0ZW5zaW9uRnJvbU1pbWUnXG59KVxuZXhwb3J0IGNsYXNzIEZpbGVFeHRlbnNpb25Gcm9tTWltZVBpcGUgaW1wbGVtZW50cyBQaXBlVHJhbnNmb3JtIHtcbiAgICB0cmFuc2Zvcm0obWltZVR5cGU6IGFueSkge1xuICAgICAgICBjb25zdCB0eXBlTWFwcGluZyA9IHtcbiAgICAgICAgICAgICdhdWRpby9hYWMnOiAnLmFhYycsXG4gICAgICAgICAgICAnYXBwbGljYXRpb24veC1hYml3b3JkJzogJy5hYncnLFxuICAgICAgICAgICAgJ2FwcGxpY2F0aW9uL3ZuZC5hbmRyb2lkLnBhY2thZ2UtYXJjaGl2ZSc6ICcuYXBrJyxcbiAgICAgICAgICAgICd2aWRlby94LW1zdmlkZW8nOiAnLmF2aScsXG4gICAgICAgICAgICAnYXBwbGljYXRpb24vdm5kLmFtYXpvbi5lYm9vayc6ICcuYXp3JyxcbiAgICAgICAgICAgICdhcHBsaWNhdGlvbi9vY3RldC1zdHJlYW0nOiAnLmJpbicsXG4gICAgICAgICAgICAnaW1hZ2UvYm1wJzogJy5ibXAnLFxuICAgICAgICAgICAgJ2FwcGxpY2F0aW9uL3gtYnppcCc6ICcuYnonLFxuICAgICAgICAgICAgJ2FwcGxpY2F0aW9uL3gtYnppcDInOiAnLmJ6MicsXG4gICAgICAgICAgICAnYXBwbGljYXRpb24veC1jc2gnOiAnLmNzaCcsXG4gICAgICAgICAgICAndGV4dC9jc3MnOiAnLmNzcycsXG4gICAgICAgICAgICAndGV4dC9jc3YnOiAnLmNzdicsXG4gICAgICAgICAgICAnYXBwbGljYXRpb24vbXN3b3JkJzogJy5kb2MnLFxuICAgICAgICAgICAgJ2FwcGxpY2F0aW9uL3ZuZC5vcGVueG1sZm9ybWF0cy1vZmZpY2Vkb2N1bWVudC53b3JkcHJvY2Vzc2luZ21sLmRvY3VtZW50JzogJy5kb2N4JyxcbiAgICAgICAgICAgICdhcHBsaWNhdGlvbi92bmQubXMtZm9udG9iamVjdCc6ICcuZW90JyxcbiAgICAgICAgICAgICdhcHBsaWNhdGlvbi9lcHViK3ppcCc6ICcuZXB1YicsXG4gICAgICAgICAgICAnYXBwbGljYXRpb24vZWNtYXNjcmlwdCc6ICcuZXMnLFxuICAgICAgICAgICAgJ2ltYWdlL2dpZic6ICcuZ2lmJyxcbiAgICAgICAgICAgICd0ZXh0L2h0bWwnOiAnLmh0bWwnLFxuICAgICAgICAgICAgJ2ltYWdlL3gtaWNvbic6ICcuaWNvJyxcbiAgICAgICAgICAgICd0ZXh0L2NhbGVuZGFyJzogJy5pY3MnLFxuICAgICAgICAgICAgJ2FwcGxpY2F0aW9uL2phdmEtYXJjaGl2ZSc6ICcuamFyJyxcbiAgICAgICAgICAgICdpbWFnZS9qcGVnJzogWycuanBlZycsICcuanBnJ10sXG4gICAgICAgICAgICAnYXBwbGljYXRpb24vamF2YXNjcmlwdCc6ICcuanMnLFxuICAgICAgICAgICAgJ2FwcGxpY2F0aW9uL2pzb24nOiAnLmpzb24nLFxuICAgICAgICAgICAgJ2F1ZGlvL21pZGknOiAnLm1pZCcsXG4gICAgICAgICAgICAnYXVkaW8veC1taWRpJzogJy5taWRpJyxcbiAgICAgICAgICAgICd2aWRlby9tcGVnJzogJy5tcGVnJyxcbiAgICAgICAgICAgICdhcHBsaWNhdGlvbi92bmQuYXBwbGUuaW5zdGFsbGVyK3htbCc6ICdtcGtnJyxcbiAgICAgICAgICAgICdhcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LnByZXNlbnRhdGlvbic6ICcub2RwJyxcbiAgICAgICAgICAgICdhcHBsaWNhdGlvbi92bmQub2FzaXMub3BlbmRvY3VtZW50LnNwcmVhZHNoZWV0JzogJy5vZHMnLFxuICAgICAgICAgICAgJ2FwcGxpY2F0aW9uL3ZuZC5vYXNpcy5vcGVuZG9jdW1lbnQudGV4dCc6ICcub2R0JyxcbiAgICAgICAgICAgICdhdWRpby9vZ2cnOiAnLm9nYScsXG4gICAgICAgICAgICAndmlkZW8vb2dnJzogJy5vZ3YnLFxuICAgICAgICAgICAgJ2FwcGxpY2F0aW9uL29nZyc6ICcub2d4JyxcbiAgICAgICAgICAgICdmb250L290Zic6ICcub3RmJyxcbiAgICAgICAgICAgICdpbWFnZS9wbmcnOiAnLnBuZycsXG4gICAgICAgICAgICAnYXBwbGljYXRpb24vcGRmJzogJy5wZGYnLFxuICAgICAgICAgICAgJ2FwcGxpY2F0aW9uL3ZuZC5tcy1wb3dlcnBvaW50JzogJy5wcHQnLFxuICAgICAgICAgICAgJ2FwcGxpY2F0aW9uL3ZuZC5vcGVueG1sZm9ybWF0cy1vZmZpY2Vkb2N1bWVudC5wcmVzZW50YXRpb25tbC5wcmVzZW50YXRpb24nOiAnLnBwdHgnLFxuICAgICAgICAgICAgJ2FwcGxpY2F0aW9uL3gtcmFyLWNvbXByZXNzZWQnOiAnLnJhcicsXG4gICAgICAgICAgICAnYXBwbGljYXRpb24vcnRmJzogJy5ydGYnLFxuICAgICAgICAgICAgJ2FwcGxpY2F0aW9uL3gtc2gnOiAnLnNoJyxcbiAgICAgICAgICAgICdpbWFnZS9zdmcreG1sJzogJy5zdmcnLFxuICAgICAgICAgICAgJ2FwcGxpY2F0aW9uL3gtc2hvY2t3YXZlLWZsYXNoJzogJy5zd2YnLFxuICAgICAgICAgICAgJ2FwcGxpY2F0aW9uL3gtdGFyJzogJy50YXInLFxuICAgICAgICAgICAgJ2ltYWdlL3RpZmYnOiAnLnRpZmYnLFxuICAgICAgICAgICAgJ2FwcGxpY2F0aW9uL3R5cGVzY3JpcHQnOiAnLnRzJyxcbiAgICAgICAgICAgICdmb250L3R0Zic6ICcudHRmJyxcbiAgICAgICAgICAgICd0ZXh0L3BsYWluJzogJy50eHQnLFxuICAgICAgICAgICAgJ2FwcGxpY2F0aW9uL3ZuZC52aXNpbyc6ICcudnNkJyxcbiAgICAgICAgICAgICdhdWRpby93YXYnOiAnLndhdicsXG4gICAgICAgICAgICAnYXVkaW8vd2VibSc6ICcud2ViYScsXG4gICAgICAgICAgICAndmlkZW8vd2VibSc6ICcud2VibScsXG4gICAgICAgICAgICAnaW1hZ2Uvd2VicCc6ICcud2VicCcsXG4gICAgICAgICAgICAnZm9udC93b2ZmJzogJy53b2ZmJyxcbiAgICAgICAgICAgICdmb250L3dvZmYyJzogJy53b2ZmMicsXG4gICAgICAgICAgICAnYXBwbGljYXRpb24veGh0bWwreG1sJzogJy54aHRtbCcsXG4gICAgICAgICAgICAnYXBwbGljYXRpb24vdm5kLm1zLWV4Y2VsJzogJy54bHMnLFxuICAgICAgICAgICAgJ2FwcGxpY2F0aW9uL3ZuZC5vcGVueG1sZm9ybWF0cy1vZmZpY2Vkb2N1bWVudC5zcHJlYWRzaGVldG1sLnNoZWV0JzogJy54bHN4JyxcbiAgICAgICAgICAgICdhcHBsaWNhdGlvbi94bWwnOiAnLnhtbCcsXG4gICAgICAgICAgICAnYXBwbGljYXRpb24vdm5kLm1vemlsbGEueHVsK3htbCc6ICcueHVsJyxcbiAgICAgICAgICAgICdhcHBsaWNhdGlvbi96aXAnOiAnLnppcCcsXG4gICAgICAgICAgICAndmlkZW8vM2dwcCc6ICcuM2dwJyxcbiAgICAgICAgICAgICdhdWRpby8zZ3BwJzogJy4zZ3AnLFxuICAgICAgICAgICAgJ3ZpZGVvLzNncHAyJzogJy4zZzInLFxuICAgICAgICAgICAgJ2F1ZGlvLzNncHAyJzogJy4zZzInLFxuICAgICAgICAgICAgJ2FwcGxpY2F0aW9uL3gtN3otY29tcHJlc3NlZCc6ICcuN3onXG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIHR5cGVNYXBwaW5nW21pbWVUeXBlXTtcbiAgICB9XG59XG4iXX0=