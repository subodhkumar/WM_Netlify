import { IRedrawableComponent } from '../../framework/types';
export declare class RedrawableDirective implements IRedrawableComponent {
    redraw: Function;
    constructor(widget: any);
}
