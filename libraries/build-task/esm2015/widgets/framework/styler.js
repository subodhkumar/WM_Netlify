import { setCSS } from '@wm/core';
import { getBackGroundImageUrl } from '../../utils/widget-utils';
export var APPLY_STYLES_TYPE;
(function (APPLY_STYLES_TYPE) {
    APPLY_STYLES_TYPE[APPLY_STYLES_TYPE["CONTAINER"] = 0] = "CONTAINER";
    APPLY_STYLES_TYPE[APPLY_STYLES_TYPE["SCROLLABLE_CONTAINER"] = 1] = "SCROLLABLE_CONTAINER";
    APPLY_STYLES_TYPE[APPLY_STYLES_TYPE["INNER_SHELL"] = 2] = "INNER_SHELL";
    APPLY_STYLES_TYPE[APPLY_STYLES_TYPE["SHELL"] = 3] = "SHELL";
})(APPLY_STYLES_TYPE || (APPLY_STYLES_TYPE = {}));
export const propNameCSSKeyMap = {
    'backgroundattachment': 'backgroundAttachment',
    'backgroundcolor': 'backgroundColor',
    'backgroundgradient': 'backgroundGradient',
    'backgroundimage': 'backgroundImage',
    'backgroundposition': 'backgroundPosition',
    'backgroundrepeat': 'backgroundRepeat',
    'backgroundsize': 'backgroundSize',
    'bordercolor': 'borderColor',
    'borderradius': 'borderRadius',
    'borderstyle': 'borderStyle',
    'borderwidth': 'borderWidth',
    'borderbottomwidth': 'borderBottomWidth',
    'borderleftwidth': 'borderLeftWidth',
    'borderrightwidth': 'borderRightWidth',
    'bordertopwidth': 'borderTopWidth',
    'color': 'color',
    'cursor': 'cursor',
    'display': 'display',
    'fontsize': 'fontSize',
    'fontfamily': 'fontFamily',
    'fontstyle': 'fontStyle',
    'fontunit': 'fontunit',
    'fontvariant': 'fontVariant',
    'fontweight': 'fontWeight',
    'height': 'height',
    'horizontalalign': 'textAlign',
    'lineheight': 'lineHeight',
    'margin': 'margin',
    'marginbottom': 'marginBottom',
    'marginleft': 'marginLeft',
    'marginright': 'marginRight',
    'margintop': 'marginTop',
    'opacity': 'opacity',
    'overflow': 'overflow',
    'padding': 'padding',
    'paddingbottom': 'paddingBottom',
    'paddingleft': 'paddingLeft',
    'paddingright': 'paddingRight',
    'paddingtop': 'paddingTop',
    'picturesource': 'backgroundImage',
    'textalign': 'textAlign',
    'textdecoration': 'textDecoration',
    'verticalalign': 'verticalAlign',
    'visibility': 'visibility',
    'whitespace': 'whiteSpace',
    'width': 'width',
    'wordbreak': 'wordbreak',
    'zindex': 'zIndex'
};
export const isStyle = key => !!propNameCSSKeyMap[key];
const MAP_SHELL_TYPE_IGNORE_LIST = {
    height: true,
    overflow: true,
    padding: true,
    paddingbottom: true,
    paddingleft: true,
    paddingright: true,
    paddingtop: true
};
const MAP_CONTAINER_TYPE_IGNORE_LIST = {
    textalign: true
};
const MAP_SCROLLABLE_CONTAINER_TYPE_IGNORE_LIST = {
    textalign: true,
    width: true
};
export function styler($node, component, type, skipList) {
    // apply init styles;
    const skipListMap = Object.create(null);
    if (skipList) {
        skipList.forEach(k => skipListMap[k] = true);
    }
    component.registerStyleChangeListener((key, nv) => {
        if (skipListMap[key]) {
            return;
        }
        // if the type is `shell` and the key is in the SHELL_TYPE_IGNORE_LIST, return
        if (type === APPLY_STYLES_TYPE.SHELL && MAP_SHELL_TYPE_IGNORE_LIST[key]) {
            return;
        }
        // if the type is `inner-shell` and the key is NOT in the SHELL_TYPE_IGNORE_LIST, return
        if (type === APPLY_STYLES_TYPE.INNER_SHELL) {
            if (!MAP_SHELL_TYPE_IGNORE_LIST[key]) {
                return;
            }
            if (key === 'height') {
                setCSS($node, 'overflow', nv ? 'auto' : '');
            }
        }
        // if the type is `container` and the key is in the CONTAINER_TYPE_IGNORE_LIST, return
        if (type === APPLY_STYLES_TYPE.CONTAINER && MAP_CONTAINER_TYPE_IGNORE_LIST[key]) {
            return;
        }
        if (type === APPLY_STYLES_TYPE.SCROLLABLE_CONTAINER) {
            if (MAP_SCROLLABLE_CONTAINER_TYPE_IGNORE_LIST[key]) {
                return;
            }
            if (key === 'height') {
                setCSS($node, 'overflow', nv ? 'auto' : '');
            }
        }
        if (key === 'fontsize' || key === 'fontunit') {
            setCSS($node, 'fontSize', component.fontsize === '' ? '' : component.fontsize + (component.fontunit || 'px'));
        }
        else if (key === 'backgroundimage') {
            setCSS($node, 'backgroundImage', component.picturesource || getBackGroundImageUrl(nv));
        }
        else if (propNameCSSKeyMap[key]) {
            setCSS($node, propNameCSSKeyMap[key], nv);
        }
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3R5bGVyLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ3aWRnZXRzL2ZyYW1ld29yay9zdHlsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUVsQyxPQUFPLEVBQUUscUJBQXFCLEVBQUUsTUFBTSwwQkFBMEIsQ0FBQztBQUdqRSxNQUFNLENBQU4sSUFBWSxpQkFLWDtBQUxELFdBQVksaUJBQWlCO0lBQ3pCLG1FQUFTLENBQUE7SUFDVCx5RkFBb0IsQ0FBQTtJQUNwQix1RUFBVyxDQUFBO0lBQ1gsMkRBQUssQ0FBQTtBQUNULENBQUMsRUFMVyxpQkFBaUIsS0FBakIsaUJBQWlCLFFBSzVCO0FBRUQsTUFBTSxDQUFDLE1BQU0saUJBQWlCLEdBQUc7SUFDN0Isc0JBQXNCLEVBQUUsc0JBQXNCO0lBQzlDLGlCQUFpQixFQUFFLGlCQUFpQjtJQUNwQyxvQkFBb0IsRUFBRSxvQkFBb0I7SUFDMUMsaUJBQWlCLEVBQUUsaUJBQWlCO0lBQ3BDLG9CQUFvQixFQUFFLG9CQUFvQjtJQUMxQyxrQkFBa0IsRUFBRSxrQkFBa0I7SUFDdEMsZ0JBQWdCLEVBQUUsZ0JBQWdCO0lBQ2xDLGFBQWEsRUFBRSxhQUFhO0lBQzVCLGNBQWMsRUFBRSxjQUFjO0lBQzlCLGFBQWEsRUFBRSxhQUFhO0lBQzVCLGFBQWEsRUFBRSxhQUFhO0lBQzVCLG1CQUFtQixFQUFFLG1CQUFtQjtJQUN4QyxpQkFBaUIsRUFBRSxpQkFBaUI7SUFDcEMsa0JBQWtCLEVBQUUsa0JBQWtCO0lBQ3RDLGdCQUFnQixFQUFFLGdCQUFnQjtJQUNsQyxPQUFPLEVBQUUsT0FBTztJQUNoQixRQUFRLEVBQUUsUUFBUTtJQUNsQixTQUFTLEVBQUUsU0FBUztJQUNwQixVQUFVLEVBQUUsVUFBVTtJQUN0QixZQUFZLEVBQUUsWUFBWTtJQUMxQixXQUFXLEVBQUUsV0FBVztJQUN4QixVQUFVLEVB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QixFQUFFO1lBQ2pELElBQUkseUNBQXlDLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQ2hELE9BQU87YUFDVjtZQUVELElBQUksR0FBRyxLQUFLLFFBQVEsRUFBRTtnQkFDbEIsTUFBTSxDQUFDLEtBQUssRUFBRSxVQUFVLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO2FBQy9DO1NBQ0o7UUFFRCxJQUFJLEdBQUcsS0FBSyxVQUFVLElBQUksR0FBRyxLQUFLLFVBQVUsRUFBRTtZQUMxQyxNQUFNLENBQUMsS0FBSyxFQUFFLFVBQVUsRUFBRSxTQUFTLENBQUMsUUFBUSxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsUUFBUSxHQUFHLENBQUMsU0FBUyxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDO1NBQ2pIO2FBQU0sSUFBSSxHQUFHLEtBQUssaUJBQWlCLEVBQUU7WUFDbEMsTUFBTSxDQUFDLEtBQUssRUFBRSxpQkFBaUIsRUFBRSxTQUFTLENBQUMsYUFBYSxJQUFJLHFCQUFxQixDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7U0FDMUY7YUFBTSxJQUFJLGlCQUFpQixDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQy9CLE1BQU0sQ0FBQyxLQUFLLEVBQUUsaUJBQWlCLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7U0FDN0M7SUFDTCxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBzZXRDU1MgfSBmcm9tICdAd20vY29yZSc7XG5cbmltcG9ydCB7IGdldEJhY2tHcm91bmRJbWFnZVVybCB9IGZyb20gJy4uLy4uL3V0aWxzL3dpZGdldC11dGlscyc7XG5pbXBvcnQgeyBTdHlsYWJsZUNvbXBvbmVudCB9IGZyb20gJy4uL2NvbW1vbi9iYXNlL3N0eWxhYmxlLmNvbXBvbmVudCc7XG5cbmV4cG9ydCBlbnVtIEFQUExZX1NUWUxFU19UWVBFIHtcbiAgICBDT05UQUlORVIsXG4gICAgU0NST0xMQUJMRV9DT05UQUlORVIsXG4gICAgSU5ORVJfU0hFTEwsXG4gICAgU0hFTExcbn1cblxuZXhwb3J0IGNvbnN0IHByb3BOYW1lQ1NTS2V5TWFwID0ge1xuICAgICdiYWNrZ3JvdW5kYXR0YWNobWVudCc6ICdiYWNrZ3JvdW5kQXR0YWNobWVudCcsXG4gICAgJ2JhY2tncm91bmRjb2xvcic6ICdiYWNrZ3JvdW5kQ29sb3InLFxuICAgICdiYWNrZ3JvdW5kZ3JhZGllbnQnOiAnYmFja2dyb3VuZEdyYWRpZW50JyxcbiAgICAnYmFja2dyb3VuZGltYWdlJzogJ2JhY2tncm91bmRJbWFnZScsXG4gICAgJ2JhY2tncm91bmRwb3NpdGlvbic6ICdiYWNrZ3JvdW5kUG9zaXRpb24nLFxuICAgICdiYWNrZ3JvdW5kcmVwZWF0JzogJ2JhY2tncm91bmRSZXBlYXQnLFxuICAgICdiYWNrZ3JvdW5kc2l6ZSc6ICdiYWNrZ3JvdW5kU2l6ZScsXG4gICAgJ2JvcmRlcmNvbG9yJzogJ2JvcmRlckNvbG9yJyxcbiAgICAnYm9yZGVycmFkaXVzJzogJ2JvcmRlclJhZGl1cycsXG4gICAgJ2JvcmRlcnN0eWxlJzogJ2JvcmRlclN0eWxlJyxcbiAgICAnYm9yZGVyd2lkdGgnOiAnYm9yZGVyV2lkdGgnLFxuICAgICdib3JkZXJib3R0b213aWR0aCc6ICdib3JkZXJCb3R0b21XaWR0aCcsXG4gICAgJ2JvcmRlcmxlZnR3aWR0aCc6ICdib3JkZXJMZWZ0V2lkdGgnLFxuICAgICdib3JkZXJyaWdodHdpZHRoJzogJ2JvcmRlclJpZ2h0V2lkdGgnLFxuICAgICdib3JkZXJ0b3B3aWR0aCc6ICdib3JkZXJUb3BXaWR0aCcsXG4gICAgJ2NvbG9yJzogJ2NvbG9yJyxcbiAgICAnY3Vyc29yJzogJ2N1cnNvcicsXG4gICAgJ2Rpc3BsYXknOiAnZGlzcGxheScsXG4gICAgJ2ZvbnRzaXplJzogJ2ZvbnRTaXplJyxcbiAgICAnZm9udGZhbWlseSc6ICdmb250RmFtaWx5JyxcbiAgICAnZm9udHN0eWxlJzogJ2ZvbnRTdHlsZScsXG4gICAgJ2ZvbnR1bml0JzogJ2ZvbnR1bml0JyxcbiAgICAnZm9udHZhcmlhbnQnOiAnZm9udFZhcmlhbnQnLFxuICAgICdmb250d2VpZ2h0JzogJ2ZvbnRXZWlnaHQnLFxuICAgICdoZWlnaHQnOiAnaGVpZ2h0JyxcbiAgICAnaG9yaXpvbnRhbGFsaWduJzogJ3RleHRBbGlnbicsXG4gICAgJ2xpbmVoZWlnaHQnOiAnbGluZUhlaWdodCcsXG4gICAgJ21hcmdpbic6ICdtYXJnaW4nLFxuICAgICdtYXJnaW5ib3R0b20nOiAnbWFyZ2luQm90dG9tJyxcbiAgICAnbWFyZ2lubGVmdCc6ICdtYXJnaW5MZWZ0JyxcbiAgICAnbWFyZ2lucmlnaHQnOiAnbWFyZ2luUmlnaHQnLFxuICAgICdtYXJnaW50b3AnOiAnbWFyZ2luVG9wJyxcbiAgICAnb3BhY2l0eSc6ICdvcGFjaXR5JyxcbiAgICAnb3ZlcmZsb3cnOiAnb3ZlcmZsb3cnLFxuICAgICdwYWRkaW5nJzogJ3BhZGRpbmcnLFxuICAgICdwYWRkaW5nYm90dG9tJzogJ3BhZGRpbmdCb3R0b20nLFxuICAgICdwYWRkaW5nbGVmdCc6ICdwYWRkaW5nTGVmdCcsXG4gICAgJ3BhZGRpbmdyaWdodCc6ICdwYWRkaW5nUmlnaHQnLFxuICAgICdwYWRkaW5ndG9wJzogJ3BhZGRpbmdUb3AnLFxuICAgICdwaWN0dXJlc291cmNlJzogJ2JhY2tncm91bmRJbWFnZScsXG4gICAgJ3RleHRhbGlnbic6ICd0ZXh0QWxpZ24nLFxuICAgICd0ZXh0ZGVjb3JhdGlvbic6ICd0ZXh0RGVjb3JhdGlvbicsXG4gICAgJ3ZlcnRpY2FsYWxpZ24nOiAndmVydGljYWxBbGlnbicsXG4gICAgJ3Zpc2liaWxpdHknOiAndmlzaWJpbGl0eScsXG4gICAgJ3doaXRlc3BhY2UnOiAnd2hpdGVTcGFjZScsXG4gICAgJ3dpZHRoJzogJ3dpZHRoJyxcbiAgICAnd29yZGJyZWFrJzogJ3dvcmRicmVhaycsXG4gICAgJ3ppbmRleCc6ICd6SW5kZXgnXG59O1xuXG5leHBvcnQgY29uc3QgaXNTdHlsZSA9IGtleSA9PiAhIXByb3BOYW1lQ1NTS2V5TWFwW2tleV07XG5cbmNvbnN0IE1BUF9TSEVMTF9UWVBFX0lHTk9SRV9MSVNUID0ge1xuICAgIGhlaWdodDogdHJ1ZSxcbiAgICBvdmVyZmxvdzogdHJ1ZSxcbiAgICBwYWRkaW5nOiB0cnVlLFxuICAgIHBhZGRpbmdib3R0b206IHRydWUsXG4gICAgcGFkZGluZ2xlZnQ6IHRydWUsXG4gICAgcGFkZGluZ3JpZ2h0OiB0cnVlLFxuICAgIHBhZGRpbmd0b3A6IHRydWVcbn07XG5cbmNvbnN0IE1BUF9DT05UQUlORVJfVFlQRV9JR05PUkVfTElTVCA9IHtcbiAgICB0ZXh0YWxpZ246IHRydWVcbn07XG5cbmNvbnN0IE1BUF9TQ1JPTExBQkxFX0NPTlRBSU5FUl9UWVBFX0lHTk9SRV9MSVNUID0ge1xuICAgIHRleHRhbGlnbjogdHJ1ZSxcbiAgICB3aWR0aDogdHJ1ZVxufTtcblxuXG5leHBvcnQgZnVuY3Rpb24gc3R5bGVyKCRub2RlOiBIVE1MRWxlbWVudCwgY29tcG9uZW50OiBTdHlsYWJsZUNvbXBvbmVudCwgdHlwZT86IEFQUExZX1NUWUxFU19UWVBFLCBza2lwTGlzdD86IEFycmF5PHN0cmluZz4pIHtcbiAgICAvLyBhcHBseSBpbml0IHN0eWxlcztcbiAgICBjb25zdCBza2lwTGlzdE1hcCA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgaWYgKHNraXBMaXN0KSB7XG4gICAgICAgIHNraXBMaXN0LmZvckVhY2goayA9PiBza2lwTGlzdE1hcFtrXSA9IHRydWUpO1xuICAgIH1cblxuICAgIGNvbXBvbmVudC5yZWdpc3RlclN0eWxlQ2hhbmdlTGlzdGVuZXIoKGtleSwgbnYpID0+IHtcblxuICAgICAgICBpZiAoc2tpcExpc3RNYXBba2V5XSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gaWYgdGhlIHR5cGUgaXMgYHNoZWxsYCBhbmQgdGhlIGtleSBpcyBpbiB0aGUgU0hFTExfVFlQRV9JR05PUkVfTElTVCwgcmV0dXJuXG4gICAgICAgIGlmICh0eXBlID09PSBBUFBMWV9TVFlMRVNfVFlQRS5TSEVMTCAmJiBNQVBfU0hFTExfVFlQRV9JR05PUkVfTElTVFtrZXldKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBpZiB0aGUgdHlwZSBpcyBgaW5uZXItc2hlbGxgIGFuZCB0aGUga2V5IGlzIE5PVCBpbiB0aGUgU0hFTExfVFlQRV9JR05PUkVfTElTVCwgcmV0dXJuXG4gICAgICAgIGlmICh0eXBlID09PSBBUFBMWV9TVFlMRVNfVFlQRS5JTk5FUl9TSEVMTCkge1xuICAgICAgICAgICAgaWYgKCFNQVBfU0hFTExfVFlQRV9JR05PUkVfTElTVFtrZXldKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGtleSA9PT0gJ2hlaWdodCcpIHtcbiAgICAgICAgICAgICAgICBzZXRDU1MoJG5vZGUsICdvdmVyZmxvdycsIG52ID8gJ2F1dG8nIDogJycpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gaWYgdGhlIHR5cGUgaXMgYGNvbnRhaW5lcmAgYW5kIHRoZSBrZXkgaXMgaW4gdGhlIENPTlRBSU5FUl9UWVBFX0lHTk9SRV9MSVNULCByZXR1cm5cbiAgICAgICAgaWYgKHR5cGUgPT09IEFQUExZX1NUWUxFU19UWVBFLkNPTlRBSU5FUiAmJiBNQVBfQ09OVEFJTkVSX1RZUEVfSUdOT1JFX0xJU1Rba2V5XSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHR5cGUgPT09IEFQUExZX1NUWUxFU19UWVBFLlNDUk9MTEFCTEVfQ09OVEFJTkVSKSB7XG4gICAgICAgICAgICBpZiAoTUFQX1NDUk9MTEFCTEVfQ09OVEFJTkVSX1RZUEVfSUdOT1JFX0xJU1Rba2V5XSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGtleSA9PT0gJ2hlaWdodCcpIHtcbiAgICAgICAgICAgICAgICBzZXRDU1MoJG5vZGUsICdvdmVyZmxvdycsIG52ID8gJ2F1dG8nIDogJycpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGtleSA9PT0gJ2ZvbnRzaXplJyB8fCBrZXkgPT09ICdmb250dW5pdCcpIHtcbiAgICAgICAgICAgIHNldENTUygkbm9kZSwgJ2ZvbnRTaXplJywgY29tcG9uZW50LmZvbnRzaXplID09PSAnJyA/ICcnIDogY29tcG9uZW50LmZvbnRzaXplICsgKGNvbXBvbmVudC5mb250dW5pdCB8fCAncHgnKSk7XG4gICAgICAgIH0gZWxzZSBpZiAoa2V5ID09PSAnYmFja2dyb3VuZGltYWdlJykge1xuICAgICAgICAgICAgc2V0Q1NTKCRub2RlLCAnYmFja2dyb3VuZEltYWdlJywgY29tcG9uZW50LnBpY3R1cmVzb3VyY2UgfHwgZ2V0QmFja0dyb3VuZEltYWdlVXJsKG52KSk7XG4gICAgICAgIH0gZWxzZSBpZiAocHJvcE5hbWVDU1NLZXlNYXBba2V5XSkge1xuICAgICAgICAgICAgc2V0Q1NTKCRub2RlLCBwcm9wTmFtZUNTU0tleU1hcFtrZXldLCBudik7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cbiJdfQ==