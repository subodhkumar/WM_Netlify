import { ElementRef } from '@angular/core';
import { BaseDialog } from '../base-dialog';
export declare class DialogHeaderComponent {
    private dialogRef;
    iconwidth: string;
    iconheight: string;
    iconmargin: string;
    iconclass: string;
    iconurl: string;
    closable: boolean;
    heading: string;
    subheading: string;
    readonly isClosable: boolean;
    constructor(elRef: ElementRef, dialogRef: BaseDialog);
    closeDialog(): void;
}
