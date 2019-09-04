import { AfterViewInit, Injector } from '@angular/core';
import { CircleProgressComponent, CircleProgressOptionsInterface } from 'ng-circle-progress';
import { IRedrawableComponent } from '../../../framework/types';
import { StylableComponent } from '../../base/stylable.component';
export declare const TYPE_CLASS_MAP: {
    'default': string;
    'success': string;
    'info': string;
    'warning': string;
    'danger': string;
};
export declare class ProgressCircleComponent extends StylableComponent implements AfterViewInit, IRedrawableComponent {
    static initializeProps: void;
    displayformat: string;
    datavalue: string;
    minvalue: number;
    maxvalue: number;
    type: string;
    title: string;
    subtitle: string;
    captionplacement: string;
    percentagevalue: number;
    redraw: Function;
    options: CircleProgressOptionsInterface;
    circleRef: CircleProgressComponent;
    constructor(inj: Injector);
    private _redraw;
    ngAfterViewInit(): void;
    updateDisplayValueFormat(): void;
    onPropertyChange(key: string, nv: any, ov?: any): void;
}
