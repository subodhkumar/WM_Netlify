import { ElementRef, OnInit } from '@angular/core';
import { UserDefinedExecutionContext } from '@wm/core';
import { MenuComponent } from '../menu.component';
import { NavComponent } from '../../nav/nav.component';
export declare class MenuDropdownItemComponent implements OnInit {
    menuRef: MenuComponent;
    private userDefinedExecutionContext;
    private parentNav;
    menualign: string;
    private itemActionFn;
    item: any;
    private readonly nativeElement;
    constructor(menuRef: MenuComponent, userDefinedExecutionContext: UserDefinedExecutionContext, parentNav: NavComponent, elRef: ElementRef);
    ngOnInit(): void;
    getInitialKeyMovements(): any;
    onKeyDown($event: any, eventAction: any): void;
    onSelect: ($event: any, item: any) => void;
}
