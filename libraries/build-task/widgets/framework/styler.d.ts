import { StylableComponent } from '../common/base/stylable.component';
export declare enum APPLY_STYLES_TYPE {
    CONTAINER = 0,
    SCROLLABLE_CONTAINER = 1,
    INNER_SHELL = 2,
    SHELL = 3
}
export declare const propNameCSSKeyMap: {
    'backgroundattachment': string;
    'backgroundcolor': string;
    'backgroundgradient': string;
    'backgroundimage': string;
    'backgroundposition': string;
    'backgroundrepeat': string;
    'backgroundsize': string;
    'bordercolor': string;
    'borderradius': string;
    'borderstyle': string;
    'borderwidth': string;
    'borderbottomwidth': string;
    'borderleftwidth': string;
    'borderrightwidth': string;
    'bordertopwidth': string;
    'color': string;
    'cursor': string;
    'display': string;
    'fontsize': string;
    'fontfamily': string;
    'fontstyle': string;
    'fontunit': string;
    'fontvariant': string;
    'fontweight': string;
    'height': string;
    'horizontalalign': string;
    'lineheight': string;
    'margin': string;
    'marginbottom': string;
    'marginleft': string;
    'marginright': string;
    'margintop': string;
    'opacity': string;
    'overflow': string;
    'padding': string;
    'paddingbottom': string;
    'paddingleft': string;
    'paddingright': string;
    'paddingtop': string;
    'picturesource': string;
    'textalign': string;
    'textdecoration': string;
    'verticalalign': string;
    'visibility': string;
    'whitespace': string;
    'width': string;
    'wordbreak': string;
    'zindex': string;
};
export declare const isStyle: (key: any) => boolean;
export declare function styler($node: HTMLElement, component: StylableComponent, type?: APPLY_STYLES_TYPE, skipList?: Array<string>): void;
