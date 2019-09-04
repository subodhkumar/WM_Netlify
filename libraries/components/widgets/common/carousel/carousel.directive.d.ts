import { AfterContentInit, Injector, NgZone, OnDestroy, OnInit, QueryList } from '@angular/core';
import { CarouselComponent, SlideComponent } from 'ngx-bootstrap';
import { StylableComponent } from '../base/stylable.component';
export declare class CarouselDirective extends StylableComponent implements AfterContentInit, OnDestroy, OnInit {
    component: CarouselComponent;
    private ngZone;
    static initializeProps: void;
    private animator;
    private navigationClass;
    private fieldDefs;
    private interval;
    animationinterval: any;
    animation: any;
    controls: any;
    currentslide: any;
    previousslide: any;
    slides: QueryList<SlideComponent>;
    constructor(component: CarouselComponent, inj: Injector, ngZone: NgZone);
    private onDataChange;
    private stopAnimation;
    private startAnimation;
    private onSlidesRender;
    private setupHandlers;
    onChangeCB(newIndex: any, oldIndex: any): void;
    ngAfterContentInit(): void;
    ngOnDestroy(): void;
    ngOnInit(): void;
    onPropertyChange(key: string, nv: any, ov?: any): void;
}
