import { AfterViewInit, ElementRef } from '@angular/core';
import { MenuComponent } from '../menu.component';
export declare class MenuDropdownComponent implements AfterViewInit {
    private menuRef;
    private readonly nativeElement;
    items: any;
    constructor(elRef: ElementRef, menuRef: MenuComponent);
    ngAfterViewInit(): void;
}
