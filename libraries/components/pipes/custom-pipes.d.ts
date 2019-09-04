import { PipeTransform } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
export declare class ToDatePipe implements PipeTransform {
    private datePipe;
    transform(data: any, format: any): any;
    constructor(datePipe: DatePipe);
}
export declare class ToNumberPipe implements PipeTransform {
    private decimalPipe;
    transform(data: any, fracSize: any): string;
    constructor(decimalPipe: DecimalPipe);
}
export declare class ToCurrencyPipe implements PipeTransform {
    private decimalPipe;
    transform(data: any, currencySymbol: any, fracSize: any): string;
    constructor(decimalPipe: DecimalPipe);
}
export declare class PrefixPipe implements PipeTransform {
    transform(data: any, padding: any): any;
}
export declare class SuffixPipe implements PipeTransform {
    transform(data: any, padding: any): any;
}
export declare class TimeFromNowPipe implements PipeTransform {
    transform(data: any): any;
}
export declare class NumberToStringPipe extends ToNumberPipe implements PipeTransform {
}
export declare class StringToNumberPipe implements PipeTransform {
    transform(data: any): number;
}
export declare class FilterPipe implements PipeTransform {
    transform(data: any[], field: any, value: any): any;
}
export declare class FileSizePipe implements PipeTransform {
    transform(bytes: number, precision: number): string;
}
export declare class FileIconClassPipe implements PipeTransform {
    transform(fileExtension: any): string;
}
export declare class StateClassPipe implements PipeTransform {
    transform(state: any): any;
}
export declare class FileExtensionFromMimePipe implements PipeTransform {
    transform(mimeType: any): any;
}
