import { __awaiter } from 'tslib';
import { Subject } from 'rxjs';
import { Lexer, Parser, BindingPipe, PropertyRead, ImplicitReceiver, LiteralPrimitive, MethodCall, Conditional, Binary, PrefixNot, KeyedRead, LiteralMap, LiteralArray, Chain, PropertyWrite } from '@angular/compiler';
import { Injectable, NgModule, defineInjectable } from '@angular/core';

var FormWidgetType;
(function (FormWidgetType) {
    FormWidgetType["AUTOCOMPLETE"] = "autocomplete";
    FormWidgetType["CHECKBOX"] = "checkbox";
    FormWidgetType["CHECKBOXSET"] = "checkboxset";
    FormWidgetType["CHIPS"] = "chips";
    FormWidgetType["COLORPICKER"] = "colorpicker";
    FormWidgetType["CURRENCY"] = "currency";
    FormWidgetType["DATE"] = "date";
    FormWidgetType["DATETIME"] = "datetime";
    FormWidgetType["NUMBER"] = "number";
    FormWidgetType["PASSWORD"] = "password";
    FormWidgetType["RADIOSET"] = "radioset";
    FormWidgetType["RATING"] = "rating";
    FormWidgetType["RICHTEXT"] = "richtext";
    FormWidgetType["SELECT"] = "select";
    FormWidgetType["TOGGLE"] = "toggle";
    FormWidgetType["SLIDER"] = "slider";
    FormWidgetType["SWITCH"] = "switch";
    FormWidgetType["TEXT"] = "text";
    FormWidgetType["TEXTAREA"] = "textarea";
    FormWidgetType["TIME"] = "time";
    FormWidgetType["TIMESTAMP"] = "timestamp";
    FormWidgetType["TYPEAHEAD"] = "typeahead";
    FormWidgetType["UPLOAD"] = "upload";
})(FormWidgetType || (FormWidgetType = {}));
var DataType;
(function (DataType) {
    DataType["INTEGER"] = "integer";
    DataType["BIG_INTEGER"] = "big_integer";
    DataType["SHORT"] = "short";
    DataType["FLOAT"] = "float";
    DataType["BIG_DECIMAL"] = "big_decimal";
    DataType["DOUBLE"] = "double";
    DataType["LONG"] = "long";
    DataType["BYTE"] = "byte";
    DataType["STRING"] = "string";
    DataType["CHARACTER"] = "character";
    DataType["TEXT"] = "text";
    DataType["DATE"] = "date";
    DataType["TIME"] = "time";
    DataType["TIMESTAMP"] = "timestamp";
    DataType["DATETIME"] = "datetime";
    DataType["LOCALDATETIME"] = "localdatetime";
    DataType["BOOLEAN"] = "boolean";
    DataType["LIST"] = "list";
    DataType["CLOB"] = "clob";
    DataType["BLOB"] = "blob";
})(DataType || (DataType = {}));
var MatchMode;
(function (MatchMode) {
    MatchMode["BETWEEN"] = "between";
    MatchMode["GREATER"] = "greaterthanequal";
    MatchMode["LESSER"] = "lessthanequal";
    MatchMode["NULL"] = "null";
    MatchMode["EMPTY"] = "empty";
    MatchMode["NULLOREMPTY"] = "nullorempty";
    MatchMode["EQUALS"] = "exact";
})(MatchMode || (MatchMode = {}));
var DEFAULT_FORMATS;
(function (DEFAULT_FORMATS) {
    DEFAULT_FORMATS["DATE"] = "yyyy-MM-dd";
    DEFAULT_FORMATS["TIME"] = "HH:mm:ss";
    DEFAULT_FORMATS["TIMESTAMP"] = "timestamp";
    DEFAULT_FORMATS["DATETIME"] = "yyyy-MM-ddTHH:mm:ss";
    DEFAULT_FORMATS["LOCALDATETIME"] = "yyyy-MM-ddTHH:mm:ss";
    DEFAULT_FORMATS["DATETIME_ORACLE"] = "yyyy-MM-dd HH:mm:ss";
    DEFAULT_FORMATS["DATE_TIME"] = "yyyy-MM-dd HH:mm:ss";
})(DEFAULT_FORMATS || (DEFAULT_FORMATS = {}));

// For html upload widget, add events on input tag
const getUploadEventTmpl = (attrs, counter, fieldName) => {
    let eventTmpl = '';
    attrs.forEach((val, key) => {
        if (key && key.endsWith('.event')) {
            const eventName = key.split('.')[0];
            const counterTl = counter ? `${counter}.` : '';
            eventTmpl = ` ${eventTmpl} (${eventName})="${counterTl}triggerUploadEvent($event, '${eventName}', '${fieldName}', row)" `;
        }
    });
    return eventTmpl;
};
const ɵ0 = getUploadEventTmpl;
// Method to get the form widget template
const getFormWidgetTemplate = (widgetType, innerTmpl, attrs, options = {}) => {
    let tmpl;
    const updateOn = attrs.get('updateon');
    const updateOnTmpl = updateOn ? `updateon="${updateOn}"` : '';
    switch (widgetType) {
        case FormWidgetType.AUTOCOMPLETE:
        case FormWidgetType.TYPEAHEAD:
            tmpl = `<div wmSearch type="autocomplete" debouncetime="${attrs.get('debouncetime')}" ${innerTmpl}></div>`;
            break;
        case FormWidgetType.CHECKBOX:
            tmpl = `<div wmCheckbox ${innerTmpl}></div>`;
            break;
        case FormWidgetType.CHECKBOXSET:
            tmpl = `<ul wmCheckboxset ${innerTmpl}></ul>`;
            break;
        case FormWidgetType.CHIPS:
            tmpl = `<ul wmChips role="input" debouncetime="${attrs.get('debouncetime')}" ${innerTmpl}></ul>`;
            break;
        case FormWidgetType.COLORPICKER:
            tmpl = `<div wmColorPicker ${innerTmpl}></div>`;
            break;
        case FormWidgetType.CURRENCY:
            tmpl = `<div wmCurrency ${innerTmpl}></div>`;
            break;
        case FormWidgetType.DATE:
            tmpl = `<div wmDate ${innerTmpl}></div>`;
            break;
        case FormWidgetType.DATETIME:
            tmpl = `<div wmDateTime ${innerTmpl}></div>`;
            break;
        case FormWidgetType.NUMBER:
            tmpl = `<div wmNumber ${innerTmpl} type="number" aria-label="Only numbers" ${updateOnTmpl}></div>`;
            break;
        case FormWidgetType.PASSWORD:
            tmpl = `<wm-input ${innerTmpl} type="password" aria-label="Enter password" ${updateOnTmpl}></wm-input>`;
            break;
        case FormWidgetType.RADIOSET:
            tmpl = `<ul wmRadioset ${innerTmpl}></ul>`;
            break;
        case FormWidgetType.RATING:
            tmpl = `<div wmRating ${innerTmpl}></div>`;
            break;
        case FormWidgetType.RICHTEXT:
            tmpl = `<div wmRichTextEditor role="textbox" ${innerTmpl}></div>`;
            break;
        case FormWidgetType.SELECT:
            tmpl = `<wm-select ${innerTmpl}></wm-select>`;
            break;
        case FormWidgetType.TOGGLE:
            tmpl = `<div wmCheckbox ${innerTmpl} type="toggle" role="checkbox" aria-label="Toggle button"></div>`;
            break;
        case FormWidgetType.SLIDER:
            tmpl = `<div wmSlider ${innerTmpl}></div>`;
            break;
        case FormWidgetType.SWITCH:
            tmpl = `<div wmSwitch ${innerTmpl}></div>`;
            break;
        case FormWidgetType.TEXT:
            const inputType = options.inputType || 'inputtype';
            tmpl = `<wm-input ${innerTmpl} type="${attrs.get(inputType) || 'text'}" aria-describedby="Enter text" ${updateOnTmpl}></wm-input>`;
            break;
        case FormWidgetType.TEXTAREA:
            tmpl = `<wm-textarea ${innerTmpl} role="textbox" aria-describedby="Place your text" ${updateOnTmpl}></wm-textarea>`;
            break;
        case FormWidgetType.TIME:
            tmpl = `<div wmTime ${innerTmpl}></div>`;
            break;
        case FormWidgetType.TIMESTAMP:
            tmpl = `<div wmDateTime ${innerTmpl} role="input"></div>`;
            break;
        case FormWidgetType.UPLOAD:
            const counter = options.counter;
            const pCounter = options.pCounter;
            const uploadProps = options.uploadProps;
            const eventTmpl = getUploadEventTmpl(attrs, counter, uploadProps && uploadProps.name);
            if (uploadProps) {
                tmpl = `<form name="${uploadProps.formName}" ${innerTmpl}>
                            <input focus-target class="file-upload" type="file" name="${uploadProps.name}" ${eventTmpl}/>
                        </form>`;
            }
            else {
                tmpl = `<a class="form-control-static" href="{{${counter}.href}}" target="_blank" *ngIf="${counter}.filetype === 'image' && ${counter}.href">
                        <img style="height:2em" class="wi wi-file" [src]="${counter}.href"/></a>
                        <a class="form-control-static" target="_blank" href="{{${counter}.href}}" *ngIf="${counter}.filetype !== 'image' && ${counter}.href">
                        <i class="wi wi-file"></i></a>
                        <input ${innerTmpl} class="app-blob-upload" [ngClass]="{'file-readonly': ${counter}.readonly}" ${eventTmpl}
                        [required]="${counter}.required" type="file" name="${attrs.get('key') || attrs.get('name')}_formWidget" [readonly]="${counter}.readonly"
                        [class.hidden]="!${pCounter}.isUpdateMode" [accept]="${counter}.permitted">`;
            }
            break;
        default:
            tmpl = `<wm-input ${innerTmpl} aria-describedby="Enter text" type="text" ${updateOnTmpl}></wm-input>`;
            break;
    }
    return tmpl;
};
// The bound value is replaced with {{item.fieldname}} here. This is needed by the liveList when compiling inner elements
const updateTemplateAttrs = (rootNode, parentDataSet, widgetName, instance = '', referenceName = 'item') => {
    const regex = new RegExp('(' + parentDataSet + ')(\\[0\\])?(.data\\[\\$i\\])?(.content\\[\\$i\\])?(\\[\\$i\\])?', 'g');
    let currentItemRegEx;
    let currentItemWidgetsRegEx;
    let formWidgetsRegex;
    let nodes;
    const widgetList = {
        'wm-list': ['itemclass', 'disableitem']
    };
    if (widgetName) {
        currentItemRegEx = new RegExp(`(Widgets.${widgetName}.currentItem)\\b`, 'g');
        currentItemWidgetsRegEx = new RegExp(`(Widgets.${widgetName}.currentItemWidgets)\\b`, 'g');
        formWidgetsRegex = new RegExp(`(Widgets.(.*).(formWidgets|filterWidgets))\\b`, 'g');
    }
    if (!_.isArray(rootNode)) {
        // [WMS-16712],[WMS-16769],[WMS-16805] The markup of root node(table, list, carousel) need to be updated only for the widgets mentioned in widgetList map.
        nodes = widgetList[rootNode.name] ? [rootNode] : (rootNode.children || []);
    }
    else {
        nodes = rootNode;
    }
    nodes.forEach((childNode) => {
        if (childNode.name) {
            const nodeName = childNode.name;
            childNode.attrs.forEach((attr) => {
                // trim the extra spaces in bindings
                let value = attr.value && attr.value.trim();
                if (_.startsWith(value, 'bind:')) {
                    // The markup of root node(table, list, carousel) attributes conatains same dataset variable binding then those attributes need to be updated only for specific properties mentioned in widgetList map.
                    if (!widgetList[nodeName] || (widgetList[nodeName] && widgetList[nodeName].indexOf(attr.name) > -1)) {
                        // if the attribute value is "bind:xxxxx.xxxx", either the dataSet/scopeDataSet has to contain "xxxx.xxxx"
                        if (_.includes(value, parentDataSet) && value !== 'bind:' + parentDataSet) {
                            value = value.replace('bind:', '');
                            value = value.replace(regex, referenceName);
                            value = 'bind:' + value;
                        }
                    }
                    // Replace item if widget property is bound to livelist currentItem
                    if (currentItemRegEx && currentItemRegEx.test(value)) {
                        // Change value from 'bind:Widgets.formName.formWidgets.listName.currentItem' to 'bind:Widgets.listName.currentItem'
                        if (value.includes('.formWidgets') || value.includes('.filterWidgets')) {
                            value = value.replace(formWidgetsRegex, 'Widgets');
                        }
                        value = value.replace(currentItemRegEx, referenceName);
                    }
                    if (currentItemWidgetsRegEx && currentItemWidgetsRegEx.test(value)) {
                        value = value.replace(currentItemWidgetsRegEx, `${instance}currentItemWidgets`);
                    }
                    attr.value = value;
                }
            });
            updateTemplateAttrs(childNode.children, parentDataSet, widgetName, instance, referenceName);
        }
    });
};
// If formControlName attribute is present, dont add the ngModel
const getNgModelAttr = attrs => {
    if (attrs.has('formControlName') || attrs.has('formControlName.bind')) {
        return '';
    }
    return 'ngModel';
};
const rowActionAttrs = new Map([
    ['display-name', 'caption'],
    ['display-name.bind', 'caption.bind'],
    ['title', 'hint'],
    ['title.bind', 'hint.bind'],
    ['show', 'show'],
    ['show.bind', 'show.bind'],
    ['disabled', 'disabled'],
    ['disabled.bind', 'disabled.bind'],
    ['hyperlink', 'hyperlink'],
    ['hyperlink.bind', 'hyperlink.bind'],
    ['target', 'target'],
    ['conditionalclass.bind', 'conditionalclass.bind'],
    ['conditionalstyle.bind', 'conditionalstyle.bind']
]);
const getRowActionAttrs = attrs => {
    let tmpl = '';
    attrs.forEach((val, key) => {
        const newAttr = rowActionAttrs.get(key);
        if (newAttr) {
            tmpl += `${newAttr}="${val}" `;
        }
    });
    return tmpl;
};

const CURRENCY_INFO = {
    'USD': {
        'symbol': '$',
        'name': 'US Dollar',
        'symbol_native': '$',
        'decimal_digits': 2,
        'rounding': 0,
        'code': 'USD',
        'name_plural': 'US dollars'
    },
    'CAD': {
        'symbol': 'CA$',
        'name': 'Canadian Dollar',
        'symbol_native': '$',
        'decimal_digits': 2,
        'rounding': 0,
        'code': 'CAD',
        'name_plural': 'Canadian dollars'
    },
    'EUR': {
        'symbol': '€',
        'name': 'Euro',
        'symbol_native': '€',
        'decimal_digits': 2,
        'rounding': 0,
        'code': 'EUR',
        'name_plural': 'euros'
    },
    'AED': {
        'symbol': 'AED',
        'name': 'United Arab Emirates Dirham',
        'symbol_native': 'د.إ.‏',
        'decimal_digits': 2,
        'rounding': 0,
        'code': 'AED',
        'name_plural': 'UAE dirhams'
    },
    'AFN': {
        'symbol': 'Af',
        'name': 'Afghan Afghani',
        'symbol_native': '؋',
        'decimal_digits': 0,
        'rounding': 0,
        'code': 'AFN',
        'name_plural': 'Afghan Afghanis'
    },
    'ALL': {
        'symbol': 'ALL',
        'name': 'Albanian Lek',
        'symbol_native': 'Lek',
        'decimal_digits': 0,
        'rounding': 0,
        'code': 'ALL',
        'name_plural': 'Albanian lekë'
    },
    'AMD': {
        'symbol': 'AMD',
        'name': 'Armenian Dram',
        'symbol_native': 'դր.',
        'decimal_digits': 0,
        'rounding': 0,
        'code': 'AMD',
        'name_plural': 'Armenian drams'
    },
    'ARS': {
        'symbol': 'AR$',
        'name': 'Argentine Peso',
        'symbol_native': '$',
        'decimal_digits': 2,
        'rounding': 0,
        'code': 'ARS',
        'name_plural': 'Argentine pesos'
    },
    'AUD': {
        'symbol': 'AU$',
        'name': 'Australian Dollar',
        'symbol_native': '$',
        'decimal_digits': 2,
        'rounding': 0,
        'code': 'AUD',
        'name_plural': 'Australian dollars'
    },
    'AZN': {
        'symbol': 'man.',
        'name': 'Azerbaijani Manat',
        'symbol_native': 'ман.',
        'decimal_digits': 2,
        'rounding': 0,
        'code': 'AZN',
        'name_plural': 'Azerbaijani manats'
    },
    'BAM': {
        'symbol': 'KM',
        'name': 'Bosnia-Herzegovina Convertible Mark',
        'symbol_native': 'KM',
        'decimal_digits': 2,
        'rounding': 0,
        'code': 'BAM',
        'name_plural': 'Bosnia-Herzegovina convertible marks'
    },
    'BDT': {
        'symbol': 'Tk',
        'name': 'Bangladeshi Taka',
        'symbol_native': '৳',
        'decimal_digits': 2,
        'rounding': 0,
        'code': 'BDT',
        'name_plural': 'Bangladeshi takas'
    },
    'BGN': {
        'symbol': 'BGN',
        'name': 'Bulgarian Lev',
        'symbol_native': 'лв.',
        'decimal_digits': 2,
        'rounding': 0,
        'code': 'BGN',
        'name_plural': 'Bulgarian leva'
    },
    'BHD': {
        'symbol': 'BD',
        'name': 'Bahraini Dinar',
        'symbol_native': 'د.ب.‏',
        'decimal_digits': 3,
        'rounding': 0,
        'code': 'BHD',
        'name_plural': 'Bahraini dinars'
    },
    'BIF': {
        'symbol': 'FBu',
        'name': 'Burundian Franc',
        'symbol_native': 'FBu',
        'decimal_digits': 0,
        'rounding': 0,
        'code': 'BIF',
        'name_plural': 'Burundian francs'
    },
    'BND': {
        'symbol': 'BN$',
        'name': 'Brunei Dollar',
        'symbol_native': '$',
        'decimal_digits': 2,
        'rounding': 0,
        'code': 'BND',
        'name_plural': 'Brunei dollars'
    },
    'BOB': {
        'symbol': 'Bs',
        'name': 'Bolivian Boliviano',
        'symbol_native': 'Bs',
        'decimal_digits': 2,
        'rounding': 0,
        'code': 'BOB',
        'name_plural': 'Bolivian bolivianos'
    },
    'BRL': {
        'symbol': 'R$',
        'name': 'Brazilian Real',
        'symbol_native': 'R$',
        'decimal_digits': 2,
        'rounding': 0,
        'code': 'BRL',
        'name_plural': 'Brazilian reals'
    },
    'BWP': {
        'symbol': 'BWP',
        'name': 'Botswanan Pula',
        'symbol_native': 'P',
        'decimal_digits': 2,
        'rounding': 0,
        'code': 'BWP',
        'name_plural': 'Botswanan pulas'
    },
    'BYR': {
        'symbol': 'BYR',
        'name': 'Belarusian Ruble',
        'symbol_native': 'BYR',
        'decimal_digits': 0,
        'rounding': 0,
        'code': 'BYR',
        'name_plural': 'Belarusian rubles'
    },
    'BZD': {
        'symbol': 'BZ$',
        'name': 'Belize Dollar',
        'symbol_native': '$',
        'decimal_digits': 2,
        'rounding': 0,
        'code': 'BZD',
        'name_plural': 'Belize dollars'
    },
    'CDF': {
        'symbol': 'CDF',
        'name': 'Congolese Franc',
        'symbol_native': 'FrCD',
        'decimal_digits': 2,
        'rounding': 0,
        'code': 'CDF',
        'name_plural': 'Congolese francs'
    },
    'CHF': {
        'symbol': 'CHF',
        'name': 'Swiss Franc',
        'symbol_native': 'CHF',
        'decimal_digits': 2,
        'rounding': 0.05,
        'code': 'CHF',
        'name_plural': 'Swiss francs'
    },
    'CLP': {
        'symbol': 'CL$',
        'name': 'Chilean Peso',
        'symbol_native': '$',
        'decimal_digits': 0,
        'rounding': 0,
        'code': 'CLP',
        'name_plural': 'Chilean pesos'
    },
    'CNY': {
        'symbol': 'CN¥',
        'name': 'Chinese Yuan',
        'symbol_native': 'CN¥',
        'decimal_digits': 2,
        'rounding': 0,
        'code': 'CNY',
        'name_plural': 'Chinese yuan'
    },
    'COP': {
        'symbol': 'CO$',
        'name': 'Colombian Peso',
        'symbol_native': '$',
        'decimal_digits': 0,
        'rounding': 0,
        'code': 'COP',
        'name_plural': 'Colombian pesos'
    },
    'CRC': {
        'symbol': '₡',
        'name': 'Costa Rican Colón',
        'symbol_native': '₡',
        'decimal_digits': 0,
        'rounding': 0,
        'code': 'CRC',
        'name_plural': 'Costa Rican colóns'
    },
    'CVE': {
        'symbol': 'CV$',
        'name': 'Cape Verdean Escudo',
        'symbol_native': 'CV$',
        'decimal_digits': 2,
        'rounding': 0,
        'code': 'CVE',
        'name_plural': 'Cape Verdean escudos'
    },
    'CZK': {
        'symbol': 'Kč',
        'name': 'Czech Republic Koruna',
        'symbol_native': 'Kč',
        'decimal_digits': 2,
        'rounding': 0,
        'code': 'CZK',
        'name_plural': 'Czech Republic korunas'
    },
    'DJF': {
        'symbol': 'Fdj',
        'name': 'Djiboutian Franc',
        'symbol_native': 'Fdj',
        'decimal_digits': 0,
        'rounding': 0,
        'code': 'DJF',
        'name_plural': 'Djiboutian francs'
    },
    'DKK': {
        'symbol': 'Dkr',
        'name': 'Danish Krone',
        'symbol_native': 'kr',
        'decimal_digits': 2,
        'rounding': 0,
        'code': 'DKK',
        'name_plural': 'Danish kroner'
    },
    'DOP': {
        'symbol': 'RD$',
        'name': 'Dominican Peso',
        'symbol_native': 'RD$',
        'decimal_digits': 2,
        'rounding': 0,
        'code': 'DOP',
        'name_plural': 'Dominican pesos'
    },
    'DZD': {
        'symbol': 'DA',
        'name': 'Algerian Dinar',
        'symbol_native': 'د.ج.‏',
        'decimal_digits': 2,
        'rounding': 0,
        'code': 'DZD',
        'name_plural': 'Algerian dinars'
    },
    'EEK': {
        'symbol': 'Ekr',
        'name': 'Estonian Kroon',
        'symbol_native': 'kr',
        'decimal_digits': 2,
        'rounding': 0,
        'code': 'EEK',
        'name_plural': 'Estonian kroons'
    },
    'EGP': {
        'symbol': 'EGP',
        'name': 'Egyptian Pound',
        'symbol_native': 'ج.م.‏',
        'decimal_digits': 2,
        'rounding': 0,
        'code': 'EGP',
        'name_plural': 'Egyptian pounds'
    },
    'ERN': {
        'symbol': 'Nfk',
        'name': 'Eritrean Nakfa',
        'symbol_native': 'Nfk',
        'decimal_digits': 2,
        'rounding': 0,
        'code': 'ERN',
        'name_plural': 'Eritrean nakfas'
    },
    'ETB': {
        'symbol': 'Br',
        'name': 'Ethiopian Birr',
        'symbol_native': 'Br',
        'decimal_digits': 2,
        'rounding': 0,
        'code': 'ETB',
        'name_plural': 'Ethiopian birrs'
    },
    'GBP': {
        'symbol': '£',
        'name': 'British Pound Sterling',
        'symbol_native': '£',
        'decimal_digits': 2,
        'rounding': 0,
        'code': 'GBP',
        'name_plural': 'British pounds sterling'
    },
    'GEL': {
        'symbol': 'GEL',
        'name': 'Georgian Lari',
        'symbol_native': 'GEL',
        'decimal_digits': 2,
        'rounding': 0,
        'code': 'GEL',
        'name_plural': 'Georgian laris'
    },
    'GHS': {
        'symbol': 'GH₵',
        'name': 'Ghanaian Cedi',
        'symbol_native': 'GH₵',
        'decimal_digits': 2,
        'rounding': 0,
        'code': 'GHS',
        'name_plural': 'Ghanaian cedis'
    },
    'GNF': {
        'symbol': 'FG',
        'name': 'Guinean Franc',
        'symbol_native': 'FG',
        'decimal_digits': 0,
        'rounding': 0,
        'code': 'GNF',
        'name_plural': 'Guinean francs'
    },
    'GTQ': {
        'symbol': 'GTQ',
        'name': 'Guatemalan Quetzal',
        'symbol_native': 'Q',
        'decimal_digits': 2,
        'rounding': 0,
        'code': 'GTQ',
        'name_plural': 'Guatemalan quetzals'
    },
    'HKD': {
        'symbol': 'HK$',
        'name': 'Hong Kong Dollar',
        'symbol_native': '$',
        'decimal_digits': 2,
        'rounding': 0,
        'code': 'HKD',
        'name_plural': 'Hong Kong dollars'
    },
    'HNL': {
        'symbol': 'HNL',
        'name': 'Honduran Lempira',
        'symbol_native': 'L',
        'decimal_digits': 2,
        'rounding': 0,
        'code': 'HNL',
        'name_plural': 'Honduran lempiras'
    },
    'HRK': {
        'symbol': 'kn',
        'name': 'Croatian Kuna',
        'symbol_native': 'kn',
        'decimal_digits': 2,
        'rounding': 0,
        'code': 'HRK',
        'name_plural': 'Croatian kunas'
    },
    'HUF': {
        'symbol': 'Ft',
        'name': 'Hungarian Forint',
        'symbol_native': 'Ft',
        'decimal_digits': 0,
        'rounding': 0,
        'code': 'HUF',
        'name_plural': 'Hungarian forints'
    },
    'IDR': {
        'symbol': 'Rp',
        'name': 'Indonesian Rupiah',
        'symbol_native': 'Rp',
        'decimal_digits': 0,
        'rounding': 0,
        'code': 'IDR',
        'name_plural': 'Indonesian rupiahs'
    },
    'ILS': {
        'symbol': '₪',
        'name': 'Israeli New Sheqel',
        'symbol_native': '₪',
        'decimal_digits': 2,
        'rounding': 0,
        'code': 'ILS',
        'name_plural': 'Israeli new sheqels'
    },
    'INR': {
        'symbol': '₹',
        'name': 'Indian Rupee',
        'symbol_native': 'টকা',
        'decimal_digits': 2,
        'rounding': 0,
        'code': 'INR',
        'name_plural': 'Indian rupees'
    },
    'IQD': {
        'symbol': 'IQD',
        'name': 'Iraqi Dinar',
        'symbol_native': 'د.ع.‏',
        'decimal_digits': 0,
        'rounding': 0,
        'code': 'IQD',
        'name_plural': 'Iraqi dinars'
    },
    'IRR': {
        'symbol': 'IRR',
        'name': 'Iranian Rial',
        'symbol_native': '﷼',
        'decimal_digits': 0,
        'rounding': 0,
        'code': 'IRR',
        'name_plural': 'Iranian rials'
    },
    'ISK': {
        'symbol': 'Ikr',
        'name': 'Icelandic Króna',
        'symbol_native': 'kr',
        'decimal_digits': 0,
        'rounding': 0,
        'code': 'ISK',
        'name_plural': 'Icelandic krónur'
    },
    'JMD': {
        'symbol': 'J$',
        'name': 'Jamaican Dollar',
        'symbol_native': '$',
        'decimal_digits': 2,
        'rounding': 0,
        'code': 'JMD',
        'name_plural': 'Jamaican dollars'
    },
    'JOD': {
        'symbol': 'JD',
        'name': 'Jordanian Dinar',
        'symbol_native': 'د.أ.‏',
        'decimal_digits': 3,
        'rounding': 0,
        'code': 'JOD',
        'name_plural': 'Jordanian dinars'
    },
    'JPY': {
        'symbol': '¥',
        'name': 'Japanese Yen',
        'symbol_native': '￥',
        'decimal_digits': 0,
        'rounding': 0,
        'code': 'JPY',
        'name_plural': 'Japanese yen'
    },
    'KES': {
        'symbol': 'Ksh',
        'name': 'Kenyan Shilling',
        'symbol_native': 'Ksh',
        'decimal_digits': 2,
        'rounding': 0,
        'code': 'KES',
        'name_plural': 'Kenyan shillings'
    },
    'KHR': {
        'symbol': 'KHR',
        'name': 'Cambodian Riel',
        'symbol_native': '៛',
        'decimal_digits': 2,
        'rounding': 0,
        'code': 'KHR',
        'name_plural': 'Cambodian riels'
    },
    'KMF': {
        'symbol': 'CF',
        'name': 'Comorian Franc',
        'symbol_native': 'FC',
        'decimal_digits': 0,
        'rounding': 0,
        'code': 'KMF',
        'name_plural': 'Comorian francs'
    },
    'KRW': {
        'symbol': '₩',
        'name': 'South Korean Won',
        'symbol_native': '₩',
        'decimal_digits': 0,
        'rounding': 0,
        'code': 'KRW',
        'name_plural': 'South Korean won'
    },
    'KWD': {
        'symbol': 'KD',
        'name': 'Kuwaiti Dinar',
        'symbol_native': 'د.ك.‏',
        'decimal_digits': 3,
        'rounding': 0,
        'code': 'KWD',
        'name_plural': 'Kuwaiti dinars'
    },
    'KZT': {
        'symbol': 'KZT',
        'name': 'Kazakhstani Tenge',
        'symbol_native': 'тңг.',
        'decimal_digits': 2,
        'rounding': 0,
        'code': 'KZT',
        'name_plural': 'Kazakhstani tenges'
    },
    'LBP': {
        'symbol': 'LB£',
        'name': 'Lebanese Pound',
        'symbol_native': 'ل.ل.‏',
        'decimal_digits': 0,
        'rounding': 0,
        'code': 'LBP',
        'name_plural': 'Lebanese pounds'
    },
    'LKR': {
        'symbol': 'SLRs',
        'name': 'Sri Lankan Rupee',
        'symbol_native': 'SL Re',
        'decimal_digits': 2,
        'rounding': 0,
        'code': 'LKR',
        'name_plural': 'Sri Lankan rupees'
    },
    'LTL': {
        'symbol': 'Lt',
        'name': 'Lithuanian Litas',
        'symbol_native': 'Lt',
        'decimal_digits': 2,
        'rounding': 0,
        'code': 'LTL',
        'name_plural': 'Lithuanian litai'
    },
    'LVL': {
        'symbol': 'Ls',
        'name': 'Latvian Lats',
        'symbol_native': 'Ls',
        'decimal_digits': 2,
        'rounding': 0,
        'code': 'LVL',
        'name_plural': 'Latvian lati'
    },
    'LYD': {
        'symbol': 'LD',
        'name': 'Libyan Dinar',
        'symbol_native': 'د.ل.‏',
        'decimal_digits': 3,
        'rounding': 0,
        'code': 'LYD',
        'name_plural': 'Libyan dinars'
    },
    'MAD': {
        'symbol': 'MAD',
        'name': 'Moroccan Dirham',
        'symbol_native': 'د.م.‏',
        'decimal_digits': 2,
        'rounding': 0,
        'code': 'MAD',
        'name_plural': 'Moroccan dirhams'
    },
    'MDL': {
        'symbol': 'MDL',
        'name': 'Moldovan Leu',
        'symbol_native': 'MDL',
        'decimal_digits': 2,
        'rounding': 0,
        'code': 'MDL',
        'name_plural': 'Moldovan lei'
    },
    'MGA': {
        'symbol': 'MGA',
        'name': 'Malagasy Ariary',
        'symbol_native': 'MGA',
        'decimal_digits': 0,
        'rounding': 0,
        'code': 'MGA',
        'name_plural': 'Malagasy Ariaries'
    },
    'MKD': {
        'symbol': 'MKD',
        'name': 'Macedonian Denar',
        'symbol_native': 'MKD',
        'decimal_digits': 2,
        'rounding': 0,
        'code': 'MKD',
        'name_plural': 'Macedonian denari'
    },
    'MMK': {
        'symbol': 'MMK',
        'name': 'Myanma Kyat',
        'symbol_native': 'K',
        'decimal_digits': 0,
        'rounding': 0,
        'code': 'MMK',
        'name_plural': 'Myanma kyats'
    },
    'MOP': {
        'symbol': 'MOP$',
        'name': 'Macanese Pataca',
        'symbol_native': 'MOP$',
        'decimal_digits': 2,
        'rounding': 0,
        'code': 'MOP',
        'name_plural': 'Macanese patacas'
    },
    'MUR': {
        'symbol': 'MURs',
        'name': 'Mauritian Rupee',
        'symbol_native': 'MURs',
        'decimal_digits': 0,
        'rounding': 0,
        'code': 'MUR',
        'name_plural': 'Mauritian rupees'
    },
    'MXN': {
        'symbol': 'MX$',
        'name': 'Mexican Peso',
        'symbol_native': '$',
        'decimal_digits': 2,
        'rounding': 0,
        'code': 'MXN',
        'name_plural': 'Mexican pesos'
    },
    'MYR': {
        'symbol': 'RM',
        'name': 'Malaysian Ringgit',
        'symbol_native': 'RM',
        'decimal_digits': 2,
        'rounding': 0,
        'code': 'MYR',
        'name_plural': 'Malaysian ringgits'
    },
    'MZN': {
        'symbol': 'MTn',
        'name': 'Mozambican Metical',
        'symbol_native': 'MTn',
        'decimal_digits': 2,
        'rounding': 0,
        'code': 'MZN',
        'name_plural': 'Mozambican meticals'
    },
    'NAD': {
        'symbol': 'N$',
        'name': 'Namibian Dollar',
        'symbol_native': 'N$',
        'decimal_digits': 2,
        'rounding': 0,
        'code': 'NAD',
        'name_plural': 'Namibian dollars'
    },
    'NGN': {
        'symbol': '₦',
        'name': 'Nigerian Naira',
        'symbol_native': '₦',
        'decimal_digits': 2,
        'rounding': 0,
        'code': 'NGN',
        'name_plural': 'Nigerian nairas'
    },
    'NIO': {
        'symbol': 'C$',
        'name': 'Nicaraguan Córdoba',
        'symbol_native': 'C$',
        'decimal_digits': 2,
        'rounding': 0,
        'code': 'NIO',
        'name_plural': 'Nicaraguan córdobas'
    },
    'NOK': {
        'symbol': 'Nkr',
        'name': 'Norwegian Krone',
        'symbol_native': 'kr',
        'decimal_digits': 2,
        'rounding': 0,
        'code': 'NOK',
        'name_plural': 'Norwegian kroner'
    },
    'NPR': {
        'symbol': 'NPRs',
        'name': 'Nepalese Rupee',
        'symbol_native': 'नेरू',
        'decimal_digits': 2,
        'rounding': 0,
        'code': 'NPR',
        'name_plural': 'Nepalese rupees'
    },
    'NZD': {
        'symbol': 'NZ$',
        'name': 'New Zealand Dollar',
        'symbol_native': '$',
        'decimal_digits': 2,
        'rounding': 0,
        'code': 'NZD',
        'name_plural': 'New Zealand dollars'
    },
    'OMR': {
        'symbol': 'OMR',
        'name': 'Omani Rial',
        'symbol_native': 'ر.ع.‏',
        'decimal_digits': 3,
        'rounding': 0,
        'code': 'OMR',
        'name_plural': 'Omani rials'
    },
    'PAB': {
        'symbol': 'B/.',
        'name': 'Panamanian Balboa',
        'symbol_native': 'B/.',
        'decimal_digits': 2,
        'rounding': 0,
        'code': 'PAB',
        'name_plural': 'Panamanian balboas'
    },
    'PEN': {
        'symbol': 'S/.',
        'name': 'Peruvian Nuevo Sol',
        'symbol_native': 'S/.',
        'decimal_digits': 2,
        'rounding': 0,
        'code': 'PEN',
        'name_plural': 'Peruvian nuevos soles'
    },
    'PHP': {
        'symbol': '₱',
        'name': 'Philippine Peso',
        'symbol_native': '₱',
        'decimal_digits': 2,
        'rounding': 0,
        'code': 'PHP',
        'name_plural': 'Philippine pesos'
    },
    'PKR': {
        'symbol': 'PKRs',
        'name': 'Pakistani Rupee',
        'symbol_native': '₨',
        'decimal_digits': 0,
        'rounding': 0,
        'code': 'PKR',
        'name_plural': 'Pakistani rupees'
    },
    'PLN': {
        'symbol': 'zł',
        'name': 'Polish Zloty',
        'symbol_native': 'zł',
        'decimal_digits': 2,
        'rounding': 0,
        'code': 'PLN',
        'name_plural': 'Polish zlotys'
    },
    'PYG': {
        'symbol': '₲',
        'name': 'Paraguayan Guarani',
        'symbol_native': '₲',
        'decimal_digits': 0,
        'rounding': 0,
        'code': 'PYG',
        'name_plural': 'Paraguayan guaranis'
    },
    'QAR': {
        'symbol': 'QR',
        'name': 'Qatari Rial',
        'symbol_native': 'ر.ق.‏',
        'decimal_digits': 2,
        'rounding': 0,
        'code': 'QAR',
        'name_plural': 'Qatari rials'
    },
    'RON': {
        'symbol': 'RON',
        'name': 'Romanian Leu',
        'symbol_native': 'RON',
        'decimal_digits': 2,
        'rounding': 0,
        'code': 'RON',
        'name_plural': 'Romanian lei'
    },
    'RSD': {
        'symbol': 'din.',
        'name': 'Serbian Dinar',
        'symbol_native': 'дин.',
        'decimal_digits': 0,
        'rounding': 0,
        'code': 'RSD',
        'name_plural': 'Serbian dinars'
    },
    'RUB': {
        'symbol': 'RUB',
        'name': 'Russian Ruble',
        'symbol_native': 'руб.',
        'decimal_digits': 2,
        'rounding': 0,
        'code': 'RUB',
        'name_plural': 'Russian rubles'
    },
    'RWF': {
        'symbol': 'RWF',
        'name': 'Rwandan Franc',
        'symbol_native': 'FR',
        'decimal_digits': 0,
        'rounding': 0,
        'code': 'RWF',
        'name_plural': 'Rwandan francs'
    },
    'SAR': {
        'symbol': 'SR',
        'name': 'Saudi Riyal',
        'symbol_native': 'ر.س.‏',
        'decimal_digits': 2,
        'rounding': 0,
        'code': 'SAR',
        'name_plural': 'Saudi riyals'
    },
    'SDG': {
        'symbol': 'SDG',
        'name': 'Sudanese Pound',
        'symbol_native': 'SDG',
        'decimal_digits': 2,
        'rounding': 0,
        'code': 'SDG',
        'name_plural': 'Sudanese pounds'
    },
    'SEK': {
        'symbol': 'Skr',
        'name': 'Swedish Krona',
        'symbol_native': 'kr',
        'decimal_digits': 2,
        'rounding': 0,
        'code': 'SEK',
        'name_plural': 'Swedish kronor'
    },
    'SGD': {
        'symbol': 'S$',
        'name': 'Singapore Dollar',
        'symbol_native': '$',
        'decimal_digits': 2,
        'rounding': 0,
        'code': 'SGD',
        'name_plural': 'Singapore dollars'
    },
    'SOS': {
        'symbol': 'Ssh',
        'name': 'Somali Shilling',
        'symbol_native': 'Ssh',
        'decimal_digits': 0,
        'rounding': 0,
        'code': 'SOS',
        'name_plural': 'Somali shillings'
    },
    'SYP': {
        'symbol': 'SY£',
        'name': 'Syrian Pound',
        'symbol_native': 'ل.س.‏',
        'decimal_digits': 0,
        'rounding': 0,
        'code': 'SYP',
        'name_plural': 'Syrian pounds'
    },
    'THB': {
        'symbol': '฿',
        'name': 'Thai Baht',
        'symbol_native': '฿',
        'decimal_digits': 2,
        'rounding': 0,
        'code': 'THB',
        'name_plural': 'Thai baht'
    },
    'TND': {
        'symbol': 'DT',
        'name': 'Tunisian Dinar',
        'symbol_native': 'د.ت.‏',
        'decimal_digits': 3,
        'rounding': 0,
        'code': 'TND',
        'name_plural': 'Tunisian dinars'
    },
    'TOP': {
        'symbol': 'T$',
        'name': 'Tongan Paʻanga',
        'symbol_native': 'T$',
        'decimal_digits': 2,
        'rounding': 0,
        'code': 'TOP',
        'name_plural': 'Tongan paʻanga'
    },
    'TRY': {
        'symbol': 'TL',
        'name': 'Turkish Lira',
        'symbol_native': 'TL',
        'decimal_digits': 2,
        'rounding': 0,
        'code': 'TRY',
        'name_plural': 'Turkish Lira'
    },
    'TTD': {
        'symbol': 'TT$',
        'name': 'Trinidad and Tobago Dollar',
        'symbol_native': '$',
        'decimal_digits': 2,
        'rounding': 0,
        'code': 'TTD',
        'name_plural': 'Trinidad and Tobago dollars'
    },
    'TWD': {
        'symbol': 'NT$',
        'name': 'New Taiwan Dollar',
        'symbol_native': 'NT$',
        'decimal_digits': 2,
        'rounding': 0,
        'code': 'TWD',
        'name_plural': 'New Taiwan dollars'
    },
    'TZS': {
        'symbol': 'TSh',
        'name': 'Tanzanian Shilling',
        'symbol_native': 'TSh',
        'decimal_digits': 0,
        'rounding': 0,
        'code': 'TZS',
        'name_plural': 'Tanzanian shillings'
    },
    'UAH': {
        'symbol': '₴',
        'name': 'Ukrainian Hryvnia',
        'symbol_native': '₴',
        'decimal_digits': 2,
        'rounding': 0,
        'code': 'UAH',
        'name_plural': 'Ukrainian hryvnias'
    },
    'UGX': {
        'symbol': 'USh',
        'name': 'Ugandan Shilling',
        'symbol_native': 'USh',
        'decimal_digits': 0,
        'rounding': 0,
        'code': 'UGX',
        'name_plural': 'Ugandan shillings'
    },
    'UYU': {
        'symbol': '$U',
        'name': 'Uruguayan Peso',
        'symbol_native': '$',
        'decimal_digits': 2,
        'rounding': 0,
        'code': 'UYU',
        'name_plural': 'Uruguayan pesos'
    },
    'UZS': {
        'symbol': 'UZS',
        'name': 'Uzbekistan Som',
        'symbol_native': 'UZS',
        'decimal_digits': 0,
        'rounding': 0,
        'code': 'UZS',
        'name_plural': 'Uzbekistan som'
    },
    'VEF': {
        'symbol': 'Bs.F.',
        'name': 'Venezuelan Bolívar',
        'symbol_native': 'Bs.F.',
        'decimal_digits': 2,
        'rounding': 0,
        'code': 'VEF',
        'name_plural': 'Venezuelan bolívars'
    },
    'VND': {
        'symbol': '₫',
        'name': 'Vietnamese Dong',
        'symbol_native': '₫',
        'decimal_digits': 0,
        'rounding': 0,
        'code': 'VND',
        'name_plural': 'Vietnamese dong'
    },
    'XAF': {
        'symbol': 'FCFA',
        'name': 'CFA Franc BEAC',
        'symbol_native': 'FCFA',
        'decimal_digits': 0,
        'rounding': 0,
        'code': 'XAF',
        'name_plural': 'CFA francs BEAC'
    },
    'XOF': {
        'symbol': 'CFA',
        'name': 'CFA Franc BCEAO',
        'symbol_native': 'CFA',
        'decimal_digits': 0,
        'rounding': 0,
        'code': 'XOF',
        'name_plural': 'CFA francs BCEAO'
    },
    'YER': {
        'symbol': 'YR',
        'name': 'Yemeni Rial',
        'symbol_native': 'ر.ي.‏',
        'decimal_digits': 0,
        'rounding': 0,
        'code': 'YER',
        'name_plural': 'Yemeni rials'
    },
    'ZAR': {
        'symbol': 'R',
        'name': 'South African Rand',
        'symbol_native': 'R',
        'decimal_digits': 2,
        'rounding': 0,
        'code': 'ZAR',
        'name_plural': 'South African rand'
    },
    'ZMK': {
        'symbol': 'ZK',
        'name': 'Zambian Kwacha',
        'symbol_native': 'ZK',
        'decimal_digits': 0,
        'rounding': 0,
        'code': 'ZMK',
        'name_plural': 'Zambian kwachas'
    }
};

const $RAF = window.requestAnimationFrame;
const $RAFQueue = [];
const invokeLater = fn => {
    if (!$RAFQueue.length) {
        $RAF(() => {
            $RAFQueue.forEach(f => f());
            $RAFQueue.length = 0;
        });
    }
    $RAFQueue.push(fn);
};
const appendNode = (node, parent, sync) => {
    const task = () => parent.appendChild(node);
    sync ? task() : invokeLater(task);
};
const insertBefore = (node, ref, sync) => {
    const task = () => ref.parentNode.insertBefore(node, ref);
    sync ? task() : invokeLater(task);
};
const insertAfter = (node, ref, sync) => {
    const task = () => ref.parentNode.insertBefore(node, ref.nextSibling);
    sync ? task() : invokeLater(task);
};
const removeNode = (node, sync) => {
    const task = () => node.remove();
    sync ? task() : invokeLater(task);
};
const removeClass = (node, ov, sync) => {
    ov = ov || '';
    const task = c => node.classList.remove(c);
    ov.split(' ').forEach(c => {
        if (c.length) {
            sync ? task(c) : invokeLater(() => task(c));
        }
    });
};
const addClass = (node, nv, sync) => {
    nv = nv || '';
    const task = c => node.classList.add(c);
    nv.split(' ').forEach(c => {
        if (c.length) {
            sync ? task(c) : invokeLater(() => task(c));
        }
    });
};
const switchClass = (node, toAdd = '', toRemove = '', sync) => {
    removeClass(node, toRemove, sync);
    addClass(node, toAdd, sync);
};
const toggleClass = (node, cls, condition, sync) => {
    if (condition) {
        addClass(node, cls, sync);
    }
    else {
        removeClass(node, cls, sync);
    }
};
const setCSS = (node, cssName, val, sync) => {
    const task = () => node.style[cssName] = val;
    sync ? task() : invokeLater(task);
};
const setCSSFromObj = (node, cssObj, sync) => {
    const keys = Object.keys(cssObj || {});
    keys.forEach(key => setCSS(node, key, cssObj[key], sync));
};
const setProperty = (node, propName, val, sync) => {
    const task = () => node[propName] = val;
    sync ? task() : invokeLater(task);
};
const setAttr = (node, attrName, val, sync) => {
    const task = () => node instanceof Element && node.setAttribute(attrName, val);
    sync ? task() : invokeLater(task);
};
const setHtml = (node, html, sync) => {
    const task = () => node.innerHTML = html;
    sync ? task() : invokeLater(task);
};
const removeAttr = (node, attrName, sync) => {
    const task = () => node.removeAttribute(attrName);
    sync ? task() : invokeLater(task);
};
const createElement = (nodeType, attrs, sync) => {
    const node = document.createElement(nodeType);
    if (attrs) {
        Object.keys(attrs).forEach(attrName => {
            setAttr(node, attrName, attrs[attrName], sync);
        });
    }
    return node;
};
// for width and height if a numeric value is specified return in px
// else return the same value
const toDimension = (v) => {
    // @ts-ignore
    if (v == +v) {
        return `${v}px`;
    }
    return v;
};

const properties = {};
function getWmProjectProperties() {
    if (window._WM_APP_PROPERTIES) {
        return window._WM_APP_PROPERTIES;
    }
    else {
        return properties;
    }
}
function setWmProjectProperties(props) {
    Object.setPrototypeOf(properties, props);
}

function* idGenerator(token) {
    let id = 1;
    while (1) {
        yield `${token}${id++}`;
    }
}
class IDGenerator {
    constructor(key) {
        this.generator = idGenerator(key);
    }
    nextUid() {
        return this.generator.next().value;
    }
}

const isString = v => typeof v === 'string';
const isDef = v => v !== void 0;
const ɵ1 = isDef;
const ifDef = (v, d) => v === void 0 ? d : v;
const ɵ2 = ifDef;
const plus = (a, b) => void 0 === a ? b : void 0 === b ? a : a + b;
const ɵ3 = plus;
const minus = (a, b) => ifDef(a, 0) - ifDef(b, 0);
const ɵ4 = minus;
const noop = () => { };
const ɵ5 = noop;
const exprFnCache = new Map();
const eventFnCache = new Map();
const purePipes = new Map();
const primitiveEquals = (a, b) => {
    if (typeof a === 'object' || typeof b === 'object') {
        return false;
    }
    if (a !== a && b !== b) { // NaN case
        return true;
    }
    return a === b;
};
const ɵ6 = primitiveEquals;
const detectChanges = (ov, nv) => {
    const len = nv.length;
    let hasChange = len > 10;
    switch (len) {
        case 10:
            hasChange = !primitiveEquals(ov[9], nv[9]);
            if (hasChange) {
                break;
            }
        case 9:
            hasChange = !primitiveEquals(ov[8], nv[8]);
            if (hasChange) {
                break;
            }
        case 8:
            hasChange = !primitiveEquals(ov[7], nv[7]);
            if (hasChange) {
                break;
            }
        case 7:
            hasChange = !primitiveEquals(ov[6], nv[6]);
            if (hasChange) {
                break;
            }
        case 6:
            hasChange = !primitiveEquals(ov[5], nv[5]);
            if (hasChange) {
                break;
            }
        case 5:
            hasChange = !primitiveEquals(ov[4], nv[4]);
            if (hasChange) {
                break;
            }
        case 4:
            hasChange = !primitiveEquals(ov[3], nv[3]);
            if (hasChange) {
                break;
            }
        case 3:
            hasChange = !primitiveEquals(ov[2], nv[2]);
            if (hasChange) {
                break;
            }
        case 2:
            hasChange = !primitiveEquals(ov[1], nv[1]);
            if (hasChange) {
                break;
            }
        case 1:
            hasChange = !primitiveEquals(ov[0], nv[0]);
            if (hasChange) {
                break;
            }
    }
    return hasChange;
};
const ɵ7 = detectChanges;
const getPurePipeVal = (pipe, cache, identifier, ...args) => {
    let lastResult = cache.get(identifier);
    let result;
    if (lastResult) {
        const isModified = detectChanges(lastResult.args, args);
        if (!isModified) {
            return lastResult.result;
        }
    }
    result = pipe.transform(...args);
    lastResult = { args, result };
    cache.set(identifier, lastResult);
    return result;
};
const ɵ8 = getPurePipeVal;
const STR_ESCAPE_REGEX = /[^ a-zA-Z0-9]/g;
const stringEscapeFn = str => {
    return '\\u' + ('0000' + str.charCodeAt(0).toString(16)).slice(-4);
};
const ɵ9 = stringEscapeFn;
class ASTCompiler {
    constructor(ast, exprType, pipeNameVsIsPureMap) {
        this.ast = ast;
        this.declarations = [];
        this.stmts = [];
        this.pipes = [];
        this.vIdx = 0;
        this.exprType = exprType;
        this.pipeNameVsIsPureMap = pipeNameVsIsPureMap;
    }
    createVar() {
        const v = `v${this.vIdx++}`;
        this.declarations.push(v);
        return v;
    }
    processImplicitReceiver() {
        return 'ctx';
    }
    processLiteralPrimitive() {
        const ast = this.cAst;
        return isString(ast.value) ? `"${ast.value.replace(/"/g, '\"').replace(STR_ESCAPE_REGEX, stringEscapeFn)}"` : ast.value;
    }
    processLiteralArray() {
        const ast = this.cAst;
        const stmts = this.cStmts;
        const v = this.createVar();
        const s = [];
        for (const item of ast.expressions) {
            s.push(this.build(item, stmts));
        }
        stmts.push(`${v}=[${s.join(',')}]`);
        return v;
    }
    processLiteralMap() {
        const ast = this.cAst;
        const stmts = this.cStmts;
        const v = this.createVar();
        const _values = [];
        for (const _value of ast.values) {
            _values.push(this.build(_value, stmts));
        }
        stmts.push(`${v}={${ast.keys.map((k, i) => `'${k.key}':${_values[i]}`)}}`);
        return v;
    }
    processPropertyRead() {
        const ast = this.cAst;
        const stmts = this.cStmts;
        const r = this.build(ast.receiver, stmts);
        const v = this.createVar();
        stmts.push(`${v}=${r}&&${r}.${ast.name}`);
        return v;
    }
    processKeyedRead() {
        const ast = this.cAst;
        const stmts = this.cStmts;
        const k = this.build(ast.key, stmts);
        const o = this.build(ast.obj, stmts);
        const v = this.createVar();
        stmts.push(`${v}=${o}&&${o}[${k}]`);
        return v;
    }
    processPrefixNot() {
        const ast = this.cAst;
        const stmts = this.cStmts;
        const r = this.build(ast.expression, stmts);
        stmts.push(`${r}=!${r}`);
        return r;
    }
    handleBinaryPlus_Minus() {
        const ast = this.cAst;
        const stmts = this.cStmts;
        const l = this.build(ast.left, stmts);
        const r = this.build(ast.right, stmts);
        const v = this.createVar();
        const m = ast.operation === '+' ? '_plus' : '_minus';
        stmts.push(`${v}=${m}(${l},${r})`);
        return v;
    }
    handleBinaryAND_OR() {
        const ast = this.cAst;
        const stmts = this.cStmts;
        const _s1 = [];
        const _sl = [];
        const _sr = [];
        const l = this.build(ast.left, _sl);
        const r = this.build(ast.right, _sr);
        const v = this.createVar();
        if (ast.operation === '&&') {
            _s1.push(_sl.join(';'), `;${v}=false`, `;if(${l}){`, _sr.join(';'), `;${v}=${r};`, `}`);
        }
        else {
            _s1.push(_sl.join(';'), `;${v}=${l}`, `;if(!${l}){`, _sr.join(';'), `;${v}=${r};`, `}`);
        }
        stmts.push(_s1.join(''));
        return v;
    }
    handleBinaryDefault() {
        const ast = this.cAst;
        const stmts = this.cStmts;
        const l = this.build(ast.left, stmts);
        const r = this.build(ast.right, stmts);
        const v = this.createVar();
        stmts.push(`${v}=${l}${ast.operation}${r}`);
        return v;
    }
    processBinary() {
        const ast = this.cAst;
        const op = ast.operation;
        if (op === '+' || op === '-') {
            return this.handleBinaryPlus_Minus();
        }
        if (op === '&&' || op === '||') {
            return this.handleBinaryAND_OR();
        }
        return this.handleBinaryDefault();
    }
    processConditional() {
        const ast = this.cAst;
        const stmts = this.cStmts;
        const condition = this.build(ast.condition, stmts);
        const v = this.createVar();
        const _s1 = [];
        const _s2 = [];
        const _s3 = [];
        const trueExp = this.build(ast.trueExp, _s2);
        const falseExp = this.build(ast.falseExp, _s3);
        _s1.push(`if(${condition}){`, _s2.join(';'), `;${v}=${trueExp};`, `}else{`, _s3.join(';'), `;${v}=${falseExp};`, `}`);
        stmts.push(_s1.join(' '));
        return v;
    }
    processMethodCall() {
        const ast = this.cAst;
        const stmts = this.cStmts;
        const _args = [];
        for (const arg of ast.args) {
            _args.push(this.build(arg, stmts));
        }
        const fn = this.build(ast.receiver, stmts);
        const v = this.createVar();
        const isImplicitReceiver = ast.receiver instanceof ImplicitReceiver;
        stmts.push(`${v}= ${fn}&&${fn}.${ast.name}&&${fn}.${ast.name}${isImplicitReceiver ? '.bind(_ctx)' : ''}(${_args.join(',')})`);
        return v;
    }
    processChain() {
        const ast = this.cAst;
        return ast.expressions.map(e => this.build(e)).join(';');
    }
    processPropertyWrite() {
        const ast = this.cAst;
        const stmts = this.cStmts;
        let receiver, lhs;
        if (ast.receiver instanceof ImplicitReceiver) {
            lhs = `_ctx.${ast.name}`;
        }
        else {
            receiver = this.build(ast.receiver, stmts);
            lhs = `${receiver}${receiver.length ? '.' : ''}${ast.name}`;
        }
        const rhs = this.build(ast.value, stmts);
        stmts.push(`${lhs}=${rhs}`);
    }
    processPipe() {
        const ast = this.cAst;
        const stmts = this.cStmts;
        const t = this.createVar();
        const _args = [];
        const _s1 = [];
        const _s2 = [];
        const exp = this.build(ast.exp, stmts);
        for (const arg of ast.args) {
            _args.push(this.build(arg, _s2));
        }
        const p = `_p${this.pipes.length}`;
        this.pipes.push([ast.name, p]);
        _args.unshift(exp);
        _s1.push(_s2.length ? _s2.join(';') + ';' : '', this.pipeNameVsIsPureMap.get(ast.name) ? `${t}=getPPVal(${p},_ppc,"${p}",${_args})` : `${t}=${p}.transform(${_args})`);
        stmts.push(_s1.join(''));
        return t;
    }
    build(ast, cStmts) {
        this.cAst = ast;
        this.cStmts = cStmts || this.stmts;
        if (ast instanceof ImplicitReceiver) {
            return this.processImplicitReceiver();
        }
        else if (ast instanceof LiteralPrimitive) {
            return this.processLiteralPrimitive();
        }
        else if (ast instanceof LiteralArray) {
            return this.processLiteralArray();
        }
        else if (ast instanceof LiteralMap) {
            return this.processLiteralMap();
        }
        else if (ast instanceof PropertyRead) {
            return this.processPropertyRead();
        }
        else if (ast instanceof PropertyWrite) {
            return this.processPropertyWrite();
        }
        else if (ast instanceof KeyedRead) {
            return this.processKeyedRead();
        }
        else if (ast instanceof PrefixNot) {
            return this.processPrefixNot();
        }
        else if (ast instanceof Binary) {
            return this.processBinary();
        }
        else if (ast instanceof Conditional) {
            return this.processConditional();
        }
        else if (ast instanceof MethodCall) {
            return this.processMethodCall();
        }
        else if (ast instanceof Chain) {
            return this.processChain();
        }
        else if (ast instanceof BindingPipe) {
            return this.processPipe();
        }
    }
    extendCtxWithLocals() {
        const v1 = this.createVar();
        this.stmts.push(`${v1}=Object.assign({}, locals)`, `Object.setPrototypeOf(${v1}, _ctx)`, `ctx=${v1}`);
    }
    fnBody() {
        this.declarations.push('ctx');
        return '"use strict";\nvar ' + this.declarations.join(',') + ';\n' + this.stmts.join(';');
    }
    fnArgs() {
        const args = ['_plus', '_minus', '_isDef'];
        if (this.exprType === ExpressionType.Binding) {
            args.push('getPPVal', '_ppc');
            for (const [, pipeVar] of this.pipes) {
                args.push(pipeVar);
            }
        }
        args.push('_ctx', 'locals');
        return args.join(',');
    }
    addReturnStmt(result) {
        // if (this.exprType === ExpressionType.Binding) {
        this.stmts.push(`return ${result};`);
        // }
    }
    cleanup() {
        this.ast = this.cAst = this.stmts = this.cStmts = this.declarations = this.pipes = this.pipeNameVsIsPureMap = undefined;
    }
    compile() {
        this.extendCtxWithLocals();
        this.addReturnStmt(this.build(this.ast));
        const fn = new Function(this.fnArgs(), this.fnBody());
        let boundFn;
        if (this.exprType === ExpressionType.Binding) {
            boundFn = fn.bind(undefined, plus, minus, isDef, getPurePipeVal);
            boundFn.usedPipes = this.pipes.slice(0); // clone
        }
        else {
            boundFn = fn.bind(undefined, plus, minus, isDef);
        }
        this.cleanup();
        return boundFn;
    }
}
const nullPipe = () => {
    return {
        transform: noop
    };
};
const ɵ10 = nullPipe;
let pipeProvider;
function setPipeProvider(_pipeProvider) {
    pipeProvider = _pipeProvider;
}
var ExpressionType;
(function (ExpressionType) {
    ExpressionType[ExpressionType["Binding"] = 0] = "Binding";
    ExpressionType[ExpressionType["Action"] = 1] = "Action";
})(ExpressionType || (ExpressionType = {}));
function $parseExpr(expr) {
    if (!pipeProvider) {
        console.log('set pipe provider');
        return noop;
    }
    if (!isString(expr)) {
        return noop;
    }
    expr = expr.trim();
    if (expr.endsWith(';')) {
        expr = expr.slice(0, -1); // remove the trailing semicolon
    }
    if (!expr.length) {
        return noop;
    }
    let fn = exprFnCache.get(expr);
    if (fn) {
        return fn;
    }
    const parser = new Parser(new Lexer);
    const ast = parser.parseBinding(expr, '');
    let boundFn;
    if (ast.errors.length) {
        fn = noop;
        boundFn = fn;
    }
    else {
        const pipeNameVsIsPureMap = pipeProvider.getPipeNameVsIsPureMap();
        const astCompiler = new ASTCompiler(ast.ast, ExpressionType.Binding, pipeNameVsIsPureMap);
        fn = astCompiler.compile();
        if (fn.usedPipes.length) {
            const pipeArgs = [];
            let hasPurePipe = false;
            for (const [pipeName] of fn.usedPipes) {
                const pipeInfo = pipeProvider.meta(pipeName);
                let pipeInstance;
                if (!pipeInfo) {
                    pipeInstance = nullPipe;
                }
                else {
                    if (pipeInfo.pure) {
                        hasPurePipe = true;
                        pipeInstance = purePipes.get(pipeName);
                    }
                    if (!pipeInstance) {
                        pipeInstance = pipeProvider.getInstance(pipeName);
                    }
                    if (pipeInfo.pure) {
                        purePipes.set(pipeName, pipeInstance);
                    }
                }
                pipeArgs.push(pipeInstance);
            }
            pipeArgs.unshift(hasPurePipe ? new Map() : undefined);
            boundFn = fn.bind(undefined, ...pipeArgs);
        }
        else {
            boundFn = fn.bind(undefined, undefined);
        }
    }
    exprFnCache.set(expr, boundFn);
    return boundFn;
}
function $parseEvent(expr) {
    if (!isString(expr)) {
        return noop;
    }
    expr = expr.trim();
    if (!expr.length) {
        return noop;
    }
    let fn = eventFnCache.get(expr);
    if (fn) {
        return fn;
    }
    const parser = new Parser(new Lexer);
    const ast = parser.parseAction(expr, '');
    if (ast.errors.length) {
        return noop;
    }
    const astCompiler = new ASTCompiler(ast.ast, ExpressionType.Action);
    fn = astCompiler.compile();
    eventFnCache.set(expr, fn);
    return fn;
}

const registry = new Map();
const watchIdGenerator = new IDGenerator('watch-id-');
const FIRST_TIME_WATCH = {};
Object.freeze(FIRST_TIME_WATCH);
const isFirstTimeChange = v => v === FIRST_TIME_WATCH;
let muted = false;
const debounce = (fn, wait = 50) => {
    let timeout;
    return (...args) => {
        window['__zone_symbol__clearTimeout'](timeout);
        timeout = window['__zone_symbol__setTimeout'](() => fn(...args), wait);
    };
};
const muteWatchers = () => {
    muted = true;
};
const unMuteWatchers = () => {
    muted = false;
    triggerWatchers();
};
const $watch = (expr, $scope, $locals, listener, identifier = watchIdGenerator.nextUid(), doNotClone = false) => {
    if (expr.indexOf('[$i]') !== -1) {
        expr = expr.replace(/\[\$i]/g, '[0]');
    }
    const fn = $parseExpr(expr);
    registry.set(identifier, {
        fn: fn.bind(expr, $scope, $locals),
        listener,
        expr,
        last: FIRST_TIME_WATCH,
        doNotClone
    });
    return () => $unwatch(identifier);
};
const $unwatch = identifier => registry.delete(identifier);
let changedByWatch = false;
const $RAF$1 = window.requestAnimationFrame;
let ngZone;
const triggerWatchers = (ignoreMuted) => {
    if (muted && !ignoreMuted) {
        return;
    }
    const limit = 5;
    let pass = 1;
    let changeDetected;
    do {
        changeDetected = false;
        registry.forEach(watchInfo => {
            const fn = watchInfo.fn;
            const listener = watchInfo.listener;
            const ov = watchInfo.last;
            let nv;
            try {
                nv = fn();
            }
            catch (e) {
                console.warn(`error in executing expression: '${watchInfo.expr}'`);
            }
            if (!_.isEqual(nv, ov)) {
                changeDetected = true;
                changedByWatch = true;
                watchInfo.last = nv;
                if (_.isObject(nv) && !watchInfo.doNotClone && nv.__cloneable__ !== false) {
                    watchInfo.last = _.clone(nv);
                }
                listener(nv, ov);
                resetChangeFromWatch();
            }
        });
        pass++;
    } while (changeDetected && pass < limit);
    if (changeDetected && pass === limit) {
        console.warn(`Number of watch cycles gone above set limit of: ${limit} `);
    }
};
const setNgZone = zone => ngZone = zone;
const setAppRef = appRef => {
    $appDigest = (() => {
        let queued = false;
        return (force) => {
            if (force) {
                ngZone.run(() => appRef.tick());
                queued = false;
            }
            else {
                if (queued) {
                    return;
                }
                else {
                    queued = true;
                    $RAF$1(() => {
                        ngZone.run(() => appRef.tick());
                        queued = false;
                    });
                }
            }
        };
    })();
};
const isChangeFromWatch = () => changedByWatch;
const resetChangeFromWatch = () => changedByWatch = false;
window.watchRegistry = registry;
let skipWatchers;
const ɵ1$1 = () => {
    skipWatchers = true;
    ngZone.run(() => triggerWatchers());
};
const debouncedTriggerWatchers = debounce(ɵ1$1, 100);
const $invokeWatchers = (force, ignoreMuted) => {
    if (force) {
        triggerWatchers(ignoreMuted);
    }
    else {
        if (skipWatchers) {
            skipWatchers = false;
            return;
        }
        debouncedTriggerWatchers();
    }
};
let $appDigest = (force) => { };

class IDataSource {
}
var Operation;
(function (Operation) {
    Operation["LIST_RECORDS"] = "listRecords";
    Operation["UPDATE_RECORD"] = "updateRecord";
    Operation["INSERT_RECORD"] = "insertRecord";
    Operation["DELETE_RECORD"] = "deleteRecord";
    Operation["INVOKE"] = "invoke";
    Operation["UPDATE"] = "update";
    Operation["NOTIFY"] = "notify";
    Operation["IS_API_AWARE"] = "isApiAware";
    Operation["SUPPORTS_CRUD"] = "supportsCRUD";
    Operation["SUPPORTS_DISTINCT_API"] = "supportsDistinctAPI";
    Operation["IS_PAGEABLE"] = "isPageable";
    Operation["GET_OPERATION_TYPE"] = "getOperationType";
    Operation["GET_RELATED_PRIMARY_KEYS"] = "getRelatedTablePrimaryKeys";
    Operation["GET_ENTITY_NAME"] = "getEntityName";
    Operation["SET_INPUT"] = "setinput";
    Operation["GET_RELATED_TABLE_DATA"] = "getRelatedTableData";
    Operation["GET_DISTINCT_DATA_BY_FIELDS"] = "getDistinctDataByFields";
    Operation["GET_AGGREGATED_DATA"] = "getAggregatedData";
    Operation["GET_MATCH_MODE"] = "getMatchMode";
    Operation["DOWNLOAD"] = "download";
    Operation["GET_NAME"] = "getName";
    Operation["GET_PROPERTIES_MAP"] = "getPropertiesMap";
    Operation["GET_PRIMARY_KEY"] = "getPrimaryKey";
    Operation["GET_BLOB_URL"] = "getBlobURL";
    Operation["SUPPORTS_SERVER_FILTER"] = "supportsServerFilter";
    Operation["GET_OPTIONS"] = "getOptions";
    Operation["SEARCH_RECORDS"] = "searchRecords";
    Operation["GET_REQUEST_PARAMS"] = "getRequestParams";
    Operation["GET_PAGING_OPTIONS"] = "getPagingOptions";
    Operation["FETCH_DISTINCT_VALUES"] = "fetchDistinctValues";
    Operation["GET_UNIQUE_IDENTIFIER"] = "getUniqueIdentifier";
    Operation["GET_CONTEXT_IDENTIFIER"] = "getContextIdentifier";
    Operation["IS_UPDATE_REQUIRED"] = "isUpdateRequired";
    Operation["ADD_ITEM"] = "addItem";
    Operation["SET_ITEM"] = "setItem";
    Operation["REMOVE_ITEM"] = "removeItem";
    Operation["IS_BOUND_TO_LOCALE"] = "isBoundToLocale";
    Operation["GET_DEFAULT_LOCALE"] = "getDefaultLocale";
    Operation["CANCEL"] = "cancel";
})(Operation || (Operation = {}));
const DataSource = {
    Operation
};
class App {
}
class AbstractDialogService {
}
class AbstractHttpService {
}
class AbstractI18nService {
}
class AbstractToasterService {
}
class AbstractSpinnerService {
}
class UserDefinedExecutionContext {
}
class AbstractNavigationService {
}
class AppDefaults {
}
class DynamicComponentRefProvider {
}

const userAgent = window.navigator.userAgent;
const REGEX = {
    SNAKE_CASE: /[A-Z]/g,
    ANDROID: /Android/i,
    IPHONE: /iPhone/i,
    IPOD: /iPod/i,
    IPAD: /iPad/i,
    ANDROID_TABLET: /android|android 3.0|xoom|sch-i800|playbook|tablet|kindle/i,
    MOBILE: /Mobile/i,
    WINDOWS: /Windows Phone/i,
    SUPPORTED_IMAGE_FORMAT: /\.(bmp|gif|jpe|jpg|jpeg|tif|tiff|pbm|png|ico)$/i,
    SUPPORTED_FILE_FORMAT: /\.(txt|js|css|html|script|properties|json|java|xml|smd|xmi|sql|log|wsdl|vm|ftl|jrxml|yml|yaml|md|less|jsp)$/i,
    SUPPORTED_AUDIO_FORMAT: /\.(mp3|ogg|webm|wma|3gp|wav|m4a)$/i,
    SUPPORTED_VIDEO_FORMAT: /\.(mp4|ogg|webm|wmv|mpeg|mpg|avi)$/i,
    PAGE_RESOURCE_PATH: /^\/pages\/.*\.(js|css|html|json)$/,
    MIN_PAGE_RESOURCE_PATH: /.*(page.min.html)$/,
    VALID_EMAIL: /^[a-zA-Z][\w.+]+@[a-zA-Z_]+?\.[a-zA-Z.]{1,4}[a-zA-Z]$/,
    VALID_WEB_URL: /^(http[s]?:\/\/)(www\.){0,1}[a-zA-Z0-9=:?\/\.\-]+(\.[a-zA-Z]{2,5}[\.]{0,1})?/,
    VALID_WEBSOCKET_URL: /^(ws[s]?:\/\/)(www\.){0,1}[a-zA-Z0-9=:?\/\.\-]+(\.[a-zA-Z]{2,5}[\.]{0,1})?/,
    VALID_RELATIVE_URL: /^(?!www\.|(?:http|ftp)s?:\/\/|[A-Za-z]:\\|\/\/).*/,
    REPLACE_PATTERN: /\$\{([^\}]+)\}/g,
    ZIP_FILE: /\.zip$/i,
    EXE_FILE: /\.exe$/i,
    NO_QUOTES_ALLOWED: /^[^'|"]*$/,
    NO_DOUBLE_QUOTES_ALLOWED: /^[^"]*$/,
    VALID_HTML: /<[a-z][\s\S]*>/i,
    VALID_PASSWORD: /^[0-9a-zA-Z-_.@&*!#$%]+$/,
    SPECIAL_CHARACTERS: /[^A-Z0-9a-z_]+/i,
    APP_SERVER_URL_FORMAT: /^(http[s]?:\/\/)(www\.){0,1}[a-zA-Z0-9\.\-]+([:]?[0-9]{2,5}|\.[a-zA-Z]{2,5}[\.]{0,1})\/+[^?#&=]+$/,
    JSON_DATE_FORMAT: /\d{4}-[0-1]\d-[0-3]\d(T[0-2]\d:[0-5]\d:[0-5]\d.\d{1,3}Z$)?/
}, compareBySeparator = ':';
const NUMBER_TYPES = ['int', DataType.INTEGER, DataType.FLOAT, DataType.DOUBLE, DataType.LONG, DataType.SHORT, DataType.BYTE, DataType.BIG_INTEGER, DataType.BIG_DECIMAL];
const now = new Date();
const CURRENT_DATE = 'CURRENT_DATE';
const isDefined = v => 'undefined' !== typeof v;
const isObject = v => null !== v && 'object' === typeof v;
const toBoolean = (val, identity) => ((val && val !== 'false') ? true : (identity ? val === identity : false));
function isIE11() {
    return window.navigator.appVersion.indexOf('Trident/') > -1;
}
const isIE = () => {
    return isIE11() || window.navigator.userAgent.indexOf('MSIE') > -1;
};
const isAndroid = () => REGEX.ANDROID.test(userAgent);
const isAndroidTablet = () => REGEX.ANDROID_TABLET.test(userAgent);
const isIphone = () => REGEX.IPHONE.test(userAgent);
const isIpod = () => REGEX.IPOD.test(userAgent);
const isIpad = () => REGEX.IPAD.test(userAgent);
const isIos = () => isIphone() || isIpod() || isIpad();
const isMobile = () => isAndroid() || isIos() || isAndroidTablet() || $('#wm-mobile-display:visible').length > 0;
const isMobileApp = () => getWmProjectProperties().platformType === 'MOBILE' && getWmProjectProperties().type === 'APPLICATION';
const getAndroidVersion = () => {
    const match = (window.navigator.userAgent.toLowerCase()).match(/android\s([0-9\.]*)/);
    return match ? match[1] : '';
};
const isKitkatDevice = () => isAndroid() && parseInt(getAndroidVersion(), 10) === 4;
/**
 * this method encodes the url and returns the encoded string
 */
const encodeUrl = (url) => {
    const index = url.indexOf('?');
    if (index > -1) {
        // encode the relative path
        url = encodeURI(url.substring(0, index)) + url.substring(index);
        // encode url params, not encoded through encodeURI
        url = encodeUrlParams(url);
    }
    else {
        url = encodeURI(url);
    }
    return url;
};
/**
 * this method encodes the url params and is private to the class only
 */
const encodeUrlParams = (url) => {
    let queryParams, encodedParams = '', queryParamsString, index;
    index = url.indexOf('?');
    if (index > -1) {
        index += 1;
        queryParamsString = url.substring(index);
        // Encoding the query params if exist
        if (queryParamsString) {
            queryParams = queryParamsString.split('&');
            queryParams.forEach(function (param) {
                let decodedParamValue;
                const i = _.includes(param, '=') ? param.indexOf('=') : (param && param.length), paramName = param.substr(0, i), paramValue = param.substr(i + 1);
                // add the = for param name only when the param value exists in the given param or empty value is assigned
                if (paramValue || _.includes(param, '=')) {
                    try {
                        decodedParamValue = decodeURIComponent(paramValue);
                    }
                    catch (e) {
                        decodedParamValue = paramValue;
                    }
                    encodedParams += paramName + '=' + encodeURIComponent(decodedParamValue) + '&';
                }
                else {
                    encodedParams += paramName + '&';
                }
            });
            encodedParams = encodedParams.slice(0, -1);
            url = url.replace(queryParamsString, encodedParams);
        }
    }
    return url;
};
/* capitalize the first-letter of the string passed */
const initCaps = name => {
    if (!name) {
        return '';
    }
    return name.charAt(0).toUpperCase() + name.substring(1);
};
/* convert camelCase string to a space separated string */
const spaceSeparate = name => {
    if (name === name.toUpperCase()) {
        return name;
    }
    return name.replace(REGEX.SNAKE_CASE, function (letter, pos) {
        return (pos ? ' ' : '') + letter;
    });
};
/*Replace the character at a particular index*/
const replaceAt = (string, index, character) => string.substr(0, index) + character + string.substr(index + character.length);
/*Replace '.' with space and capitalize the next letter*/
const periodSeparate = name => {
    let dotIndex;
    dotIndex = name.indexOf('.');
    if (dotIndex !== -1) {
        name = replaceAt(name, dotIndex + 1, name.charAt(dotIndex + 1).toUpperCase());
        name = replaceAt(name, dotIndex, ' ');
    }
    return name;
};
const prettifyLabel = label => {
    label = _.camelCase(label);
    /*capitalize the initial Letter*/
    label = initCaps(label);
    /*Convert camel case words to separated words*/
    label = spaceSeparate(label);
    /*Replace '.' with space and capitalize the next letter*/
    label = periodSeparate(label);
    return label;
};
const deHyphenate = (name) => {
    return name.split('-').join(' ');
};
/*Accepts an array or a string separated with symbol and returns prettified result*/
const prettifyLabels = (names, separator = ',') => {
    let modifiedNames, namesArray = [];
    if (!_.isArray(names)) {
        namesArray = _.split(names, separator);
    }
    modifiedNames = _.map(namesArray, prettifyLabel);
    if (_.isArray(names)) {
        return modifiedNames;
    }
    return modifiedNames.join(separator);
};
/**
 * this method checks if a insecure content request is being made
 */
const isInsecureContentRequest = (url) => {
    const parser = document.createElement('a');
    parser.href = url;
    // for relative urls IE returns the protocol as empty string
    if (parser.protocol === '') {
        return false;
    }
    if (stringStartsWith(location.href, 'https://')) {
        return parser.protocol !== 'https:' && parser.protocol !== 'wss:';
    }
    return false;
};
/**
 * this method checks if a given string starts with the given string
 */
const stringStartsWith = (str, startsWith, ignoreCase) => {
    if (!str) {
        return false;
    }
    const regEx = new RegExp('^' + startsWith, ignoreCase ? 'i' : '');
    return regEx.test(str);
};
const getEvaluatedExprValue = (object, expression) => {
    let val;
    /**
     * Evaluate the expression with the scope and object.
     * $eval is used, as expression can be in format of field1 + ' ' + field2
     * $eval can fail, if expression is not in correct format, so attempt the eval function
     */
    val = _.attempt(function () {
        const argsExpr = Object.keys(object).map((fieldName) => {
            return `var ${fieldName} = data['${fieldName}'];`;
        }).join(' ');
        const f = new Function('data', `${argsExpr} return  ${expression}`);
        return f(object);
    });
    /**
     * $eval fails if field expression has spaces. Ex: 'field name' or 'field@name'
     * As a fallback, get value directly from object or scope
     */
    if (_.isError(val)) {
        val = _.get(object, expression);
    }
    return val;
};
/* functions for resource Tab*/
const isImageFile = (fileName) => {
    return (REGEX.SUPPORTED_IMAGE_FORMAT).test(fileName);
};
const isAudioFile = (fileName) => {
    return (REGEX.SUPPORTED_AUDIO_FORMAT).test(fileName);
};
const isVideoFile = (fileName) => {
    return (REGEX.SUPPORTED_VIDEO_FORMAT).test(fileName);
};
const isValidWebURL = (url) => {
    return (REGEX.VALID_WEB_URL).test(url);
};
/*This function returns the url to the resource after checking the validity of url*/
const getResourceURL = (urlString) => {
    if (isValidWebURL(urlString)) ;
    return urlString;
};
/*function to check if fn is a function and then execute*/
function triggerFn(fn, ...argmnts) {
    /* Use of slice on arguments will make this function not optimizable
    * https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#32-leaking-arguments
    * */
    let start = 1;
    const len = arguments.length, args = new Array(len - start);
    for (start; start < len; start++) {
        args[start - 1] = arguments[start];
    }
    if (_.isFunction(fn)) {
        return fn.apply(null, args);
    }
}
/**
 * This method is used to get the formatted date
 */
const getFormattedDate = (datePipe, dateObj, format) => {
    if (!dateObj) {
        return undefined;
    }
    if (format === 'timestamp') {
        return moment(dateObj).valueOf();
    }
    return datePipe.transform(dateObj, format);
};
/**
 * method to get the date object from the input received
 */
const getDateObj = (value) => {
    /*if the value is a date object, no need to covert it*/
    if (_.isDate(value)) {
        return value;
    }
    /*if the value is a timestamp string, convert it to a number*/
    if (!isNaN(value)) {
        value = parseInt(value, 10);
    }
    if (!moment(value).isValid() || value === '' || value === null || value === undefined) {
        return undefined;
    }
    let dateObj = new Date(value);
    /**
     * if date value is string "20-05-2019" then new Date(value) return 20May2019 with current time in India,
     * whereas this will return 19May2019 with time lagging for few hours.
     * This is because it returns UTC time i.e. Coordinated Universal Time (UTC).
     * To create date in local time use moment
     */
    if (_.isString(value)) {
        dateObj = new Date(moment(value).format());
    }
    if (value === CURRENT_DATE || isNaN(dateObj.getDay())) {
        return now;
    }
    return dateObj;
};
const addEventListenerOnElement = (_element, excludeElement, nativeElement, eventType, isDropDownDisplayEnabledOnInput, successCB, life, isCapture = false) => {
    const element = _element;
    const eventListener = (event) => {
        if (excludeElement && (excludeElement.contains(event.target) || excludeElement === event.target)) {
            return;
        }
        if (nativeElement.contains(event.target)) {
            if ($(event.target).is('input') && !isDropDownDisplayEnabledOnInput) {
                return;
            }
            element.removeEventListener(eventType, eventListener, isCapture);
            return;
        }
        if (life === 0 /* ONCE */) {
            element.removeEventListener(eventType, eventListener, isCapture);
        }
        successCB();
    };
    element.addEventListener(eventType, eventListener, isCapture);
    const removeEventListener = () => {
        element.removeEventListener(eventType, eventListener, isCapture);
    };
    return removeEventListener;
};
/**
 * Returns a deep cloned replica of the passed object/array
 * @param object object/array to clone
 * @returns a clone of the passed object
 */
const getClonedObject = (object) => {
    return _.cloneDeep(object);
};
const getFiles = (formName, fieldName, isList) => {
    const files = _.get(document.forms, [formName, fieldName, 'files']);
    return isList ? _.map(files, _.identity) : files && files[0];
};
/*Function to generate a random number*/
function random() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
}
/*Function to generate a guid based on random numbers.*/
const generateGUId = () => {
    return random() + '-' + random() + '-' + random();
};
/**
 * Validate if given access role is in current loggedin user access roles
 */
const validateAccessRoles = (roleExp, loggedInUser) => {
    let roles;
    if (roleExp && loggedInUser) {
        roles = roleExp && roleExp.split(',').map(Function.prototype.call, String.prototype.trim);
        return _.intersection(roles, loggedInUser.userRoles).length;
    }
    return true;
};
const getValidJSON = (content) => {
    if (!content) {
        return undefined;
    }
    try {
        const parsedIntValue = parseInt(content, 10);
        /*obtaining json from editor content string*/
        return isObject(content) || !isNaN(parsedIntValue) ? content : JSON.parse(content);
    }
    catch (e) {
        /*terminating execution if new variable object is not valid json.*/
        return undefined;
    }
};
const xmlToJson = (xmlString) => {
    const x2jsObj = new X2JS({ 'emptyNodeForm': 'content', 'attributePrefix': '', 'enableToStringFunc': false });
    let json = x2jsObj.xml2js(xmlString);
    if (json) {
        json = _.get(json, Object.keys(json)[0]);
    }
    return json;
};
/*
 * Util method to find the value of a key in the object
 * if key not found and create is true, an object is created against that node
 * Examples:
 * var a = {
 *  b: {
 *      c : {
 *          d: 'test'
 *      }
 *  }
 * }
 * Utils.findValue(a, 'b.c.d') --> 'test'
 * Utils.findValue(a, 'b.c') --> {d: 'test'}
 * Utils.findValue(a, 'e') --> undefined
 * Utils.findValue(a, 'e', true) --> {} and a will become:
 * {
 *   b: {
 *      c : {
 *          d: 'test'
 *      }
 *  },
 *  e: {
 *  }
 * }
 */
const findValueOf = (obj, key, create) => {
    if (!obj || !key) {
        return;
    }
    if (!create) {
        return _.get(obj, key);
    }
    const parts = key.split('.'), keys = [];
    let skipProcessing;
    parts.forEach((part) => {
        if (!parts.length) { // if the part of a key is not valid, skip the processing.
            skipProcessing = true;
            return false;
        }
        const subParts = part.match(/\w+/g);
        let subPart;
        while (subParts.length) {
            subPart = subParts.shift();
            keys.push({ 'key': subPart, 'value': subParts.length ? [] : {} }); // determine whether to create an array or an object
        }
    });
    if (skipProcessing) {
        return undefined;
    }
    keys.forEach((_key) => {
        let tempObj = obj[_key.key];
        if (!isObject(tempObj)) {
            tempObj = getValidJSON(tempObj);
            if (!tempObj) {
                tempObj = _key.value;
            }
        }
        obj[_key.key] = tempObj;
        obj = tempObj;
    });
    return obj;
};
/*
* extracts and returns the last bit from full typeRef of a field
* e.g. returns 'String' for typeRef = 'java.lang.String'
* @params: {typeRef} type reference
*/
const extractType = (typeRef) => {
    let type;
    if (!typeRef) {
        return DataType.STRING;
    }
    type = typeRef && typeRef.substring(typeRef.lastIndexOf('.') + 1);
    type = type && type.toLowerCase();
    type = type === DataType.LOCALDATETIME ? DataType.DATETIME : type;
    return type;
};
/* returns true if the provided data type matches number type */
const isNumberType = (type) => {
    return (NUMBER_TYPES.indexOf(extractType(type).toLowerCase()) !== -1);
};
/* function to check if provided object is empty*/
const isEmptyObject = (obj) => {
    if (isObject(obj) && !_.isArray(obj)) {
        return Object.keys(obj).length === 0;
    }
    return false;
};
/*Function to check whether the specified object is a pageable object or not.*/
const isPageable = (obj) => {
    const pageable = {
        'content': [],
        'first': true,
        'last': true,
        'number': 0,
        'numberOfElements': 10,
        'size': 20,
        'sort': null,
        'totalElements': 10,
        'totalPages': 1
    };
    return (_.isEqual(_.keys(pageable), _.keys(obj).sort()));
};
/*
 * Util method to replace patterns in string with object keys or array values
 * Examples:
 * Utils.replace('Hello, ${first} ${last} !', {first: 'wavemaker', last: 'ng'}) --> Hello, wavemaker ng
 * Utils.replace('Hello, ${0} ${1} !', ['wavemaker','ng']) --> Hello, wavemaker ng
 * Examples if parseError is true:
 * Utils.replace('Hello, {0} {1} !', ['wavemaker','ng']) --> Hello, wavemaker ng
 */
const replace = (template, map, parseError) => {
    let regEx = REGEX.REPLACE_PATTERN;
    if (!template) {
        return;
    }
    if (parseError) {
        regEx = /\{([^\}]+)\}/g;
    }
    return template.replace(regEx, function (match, key) {
        return _.get(map, key);
    });
};
/*Function to check if date time type*/
const isDateTimeType = type => {
    if (_.includes(type, '.')) {
        type = _.toLower(extractType(type));
    }
    return _.includes([DataType.DATE, DataType.TIME, DataType.TIMESTAMP, DataType.DATETIME, DataType.LOCALDATETIME], type);
};
/*  This function returns date object. If val is undefined it returns invalid date */
const getValidDateObject = val => {
    if (moment(val).isValid()) {
        // date with +5 hours is returned in safari browser which is not a valid date.
        // Hence converting the date to the supported format "YYYY/MM/DD HH:mm:ss" in IOS
        if (isIos()) {
            val = moment(moment(val).valueOf()).format('YYYY/MM/DD HH:mm:ss');
        }
        return val;
    }
    /*if the value is a timestamp string, convert it to a number*/
    if (!isNaN(val)) {
        val = parseInt(val, 10);
    }
    else {
        /*if the value is in HH:mm:ss format, it returns a wrong date. So append the date to the given value to get date*/
        if (!(new Date(val).getTime())) {
            val = moment((moment().format('YYYY-MM-DD') + ' ' + val), 'YYYY-MM-DD HH:mm:ss A');
        }
    }
    return new Date(moment(val).valueOf());
};
/*  This function returns javascript date object*/
const getNativeDateObject = val => {
    val = getValidDateObject(val);
    return new Date(val);
};
/**
 * prepare a blob object based on the content and content type provided
 * if content is blob itself, simply returns it back
 * @param val
 * @param valContentType
 * @returns {*}
 */
const getBlob = (val, valContentType) => {
    if (val instanceof Blob) {
        return val;
    }
    const jsonVal = getValidJSON(val);
    if (jsonVal && jsonVal instanceof Object) {
        val = new Blob([JSON.stringify(jsonVal)], { type: valContentType || 'application/json' });
    }
    else {
        val = new Blob([val], { type: valContentType || 'text/plain' });
    }
    return val;
};
/**
 * This function returns true by comparing two objects based on the fields
 * @param obj1 object
 * @param obj2 object
 * @param compareBy string field values to compare
 * @returns {boolean} true if object equality returns true based on fields
 */
const isEqualWithFields = (obj1, obj2, compareBy) => {
    // compareBy can be 'id' or 'id1, id2' or 'id1, id2:id3'
    // Split the compareby comma separated values
    let _compareBy = _.isArray(compareBy) ? compareBy : _.split(compareBy, ',');
    _compareBy = _.map(_compareBy, _.trim);
    return _.isEqualWith(obj1, obj2, function (o1, o2) {
        return _.every(_compareBy, function (cb) {
            let cb1, cb2, _cb;
            // If compareby contains : , compare the values by the keys on either side of :
            if (_.indexOf(cb, compareBySeparator) === -1) {
                cb1 = cb2 = _.trim(cb);
            }
            else {
                _cb = _.split(cb, compareBySeparator);
                cb1 = _.trim(_cb[0]);
                cb2 = _.trim(_cb[1]);
            }
            return _.get(o1, cb1) === _.get(o2, cb2);
        });
    });
};
const getNode = selector => document.querySelector(selector);
const ɵ0$4 = getNode;
// function to check if the stylesheet is already loaded
const isStyleSheetLoaded = href => !!getNode(`link[href="${href}"]`);
const ɵ1$2 = isStyleSheetLoaded;
// function to remove stylesheet if the stylesheet is already loaded
const removeStyleSheet = href => {
    const node = getNode(`link[href="${href}"]`);
    if (node) {
        node.remove();
    }
};
const ɵ2$1 = removeStyleSheet;
// function to load a stylesheet
const loadStyleSheet = (url, attr) => {
    if (isStyleSheetLoaded(url)) {
        return;
    }
    const link = document.createElement('link');
    link.href = url;
    // To add attributes to link tag
    if (attr && attr.name) {
        link.setAttribute(attr.name, attr.value);
    }
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('type', 'text/css');
    document.head.appendChild(link);
    return link;
};
// function to load stylesheets
const loadStyleSheets = (urls = []) => {
    // if the first argument is not an array, convert it to an array
    if (!Array.isArray(urls)) {
        urls = [urls];
    }
    urls.forEach(loadStyleSheet);
};
// function to check if the script is already loaded
const isScriptLoaded = src => !!getNode(`script[src="${src}"], script[data-src="${src}"]`);
const ɵ3$1 = isScriptLoaded;
const loadScript = (url) => __awaiter(this, void 0, void 0, function* () {
    const _url = url.trim();
    if (!_url.length || isScriptLoaded(_url)) {
        return Promise.resolve();
    }
    return fetchContent('text', _url, false, text => {
        const script = document.createElement('script');
        script.textContent = text;
        document.head.appendChild(script);
    });
    // return fetch(_url)
    //     .then(response => response.text())
    //     .then(text => {
    //         const script = document.createElement('script');
    //         script.textContent = text;
    //         document.head.appendChild(script);
    //     });
});
const loadScripts = (urls = []) => __awaiter(this, void 0, void 0, function* () {
    for (const url of urls) {
        yield loadScript(url);
    }
    return Promise.resolve();
});
let _WM_APP_PROJECT = {};
/**
 * This function sets session storage item based on the project ID
 * @param key string
 * @param value string
 */
const setSessionStorageItem = (key, value) => {
    let item = window.sessionStorage.getItem(_WM_APP_PROJECT.id);
    if (item) {
        item = JSON.parse(item);
    }
    else {
        item = {};
    }
    item[key] = value;
    window.sessionStorage.setItem(_WM_APP_PROJECT.id, JSON.stringify(item));
};
/**
 * This function gets session storage item based on the project ID
 * @param key string
 */
const getSessionStorageItem = key => {
    let item = window.sessionStorage.getItem(_WM_APP_PROJECT.id);
    if (item) {
        item = JSON.parse(item);
        return item[key];
    }
};
const noop$1 = (...args) => { };
const isArray = v => _.isArray(v);
const isString$1 = v => typeof v === 'string';
const isNumber = v => typeof v === 'number';
/**
 * This function returns a blob object from the given file path
 * @param filepath
 * @returns promise having blob object
 */
const convertToBlob = (filepath) => {
    return new Promise((resolve, reject) => {
        // Read the file entry from the file URL
        resolveLocalFileSystemURL(filepath, function (fileEntry) {
            fileEntry.file(function (file) {
                // file has the cordova file structure. To submit to the backend, convert this file to javascript file
                const reader = new FileReader();
                reader.onloadend = () => {
                    const imgBlob = new Blob([reader.result], {
                        'type': file.type
                    });
                    resolve({ 'blob': imgBlob, 'filepath': filepath });
                };
                reader.onerror = reject;
                reader.readAsArrayBuffer(file);
            });
        }, reject);
    });
};
const hasCordova = () => {
    return !!window['cordova'];
};
const AppConstants = {
    INT_MAX_VALUE: 2147483647
};
const openLink = (link, target = '_self') => {
    if (hasCordova() && _.startsWith(link, '#')) {
        location.hash = link;
    }
    else {
        window.open(link, target);
    }
};
/* util function to load the content from a url */
const fetchContent = (dataType, url, inSync = false, success, error) => {
    return $.ajax({ type: 'get', dataType: dataType, url: url, async: !inSync })
        .done(response => success && success(response))
        .fail(reason => error && error(reason));
};
/**
 * If the given object is a promise, then object is returned. Otherwise, a promise is resolved with the given object.
 * @param {Promise<T> | T} a
 * @returns {Promise<T>}
 */
const toPromise = (a) => {
    if (a instanceof Promise) {
        return a;
    }
    else {
        return Promise.resolve(a);
    }
};
/**
 * This function invokes the given the function (fn) until the function successfully executes or the maximum number
 * of retries is reached or onBeforeRetry returns false.
 *
 * @param fn - a function that is needs to be invoked. The function can also return a promise as well.
 * @param interval - minimum time gap between successive retries. This argument should be greater or equal to 0.
 * @param maxRetries - maximum number of retries. This argument should be greater than 0. For all other values,
 * maxRetries is infinity.
 * @param onBeforeRetry - a callback function that will be invoked before re-invoking again. This function can
 * return false or a promise that is resolved to false to stop further retry attempts.
 * @returns {*} a promise that is resolved when fn is success (or) maximum retry attempts reached
 * (or) onBeforeRetry returned false.
 */
const retryIfFails = (fn, interval, maxRetries, onBeforeRetry = () => Promise.resolve(false)) => {
    let retryCount = 0;
    const tryFn = () => {
        retryCount++;
        if (_.isFunction(fn)) {
            return fn();
        }
    };
    maxRetries = (_.isNumber(maxRetries) && maxRetries > 0 ? maxRetries : 0);
    interval = (_.isNumber(interval) && interval > 0 ? interval : 0);
    return new Promise((resolve, reject) => {
        const errorFn = function () {
            const errArgs = arguments;
            setTimeout(() => {
                toPromise(onBeforeRetry()).then(function (retry) {
                    if (retry !== false && (!maxRetries || retryCount <= maxRetries)) {
                        toPromise(tryFn()).then(resolve, errorFn);
                    }
                    else {
                        reject(errArgs);
                    }
                }, () => reject(errArgs));
            }, interval);
        };
        toPromise(tryFn()).then(resolve, errorFn);
    });
};
/**
 * Promise of a defer created using this function, has abort function that will reject the defer when called.
 * @returns {*} angular defer object
 */
const getAbortableDefer = () => {
    const _defer = {
        promise: null,
        reject: null,
        resolve: null,
        onAbort: () => { },
        isAborted: false
    };
    _defer.promise = new Promise((resolve, reject) => {
        _defer.resolve = resolve;
        _defer.reject = reject;
    });
    _defer.promise.abort = () => {
        triggerFn(_defer.onAbort);
        _defer.reject('aborted');
        _defer.isAborted = true;
    };
    return _defer;
};
const createCSSRule = (ruleSelector, rules) => {
    const stylesheet = document.styleSheets[0];
    stylesheet.insertRule(`${ruleSelector} { ${rules} }`);
};
const getUrlParams = (link) => {
    const params = {};
    // If url params are present, construct params object and pass it to search
    const index = link.indexOf('?');
    if (index !== -1) {
        const queryParams = _.split(link.substring(index + 1, link.length), '&');
        queryParams.forEach((param) => {
            param = _.split(param, '=');
            params[param[0]] = param[1];
        });
    }
    return params;
};
const getRouteNameFromLink = (link) => {
    link = link.replace('#/', '/');
    const index = link.indexOf('?');
    if (index !== -1) {
        link = link.substring(0, index);
    }
    return link;
};
const isAppleProduct = /Mac|iPod|iPhone|iPad/.test(window.navigator.platform);
const defer = () => {
    const d = {
        promise: null,
        resolve: noop$1,
        reject: noop$1
    };
    d.promise = new Promise((resolve, reject) => {
        d.resolve = resolve;
        d.reject = reject;
    });
    return d;
};
/*
 * Invokes the given list of functions sequentially with the given arguments. If a function returns a promise,
 * then next function will be invoked only if the promise is resolved.
 */
const executePromiseChain = (fns, args, d, i) => {
    d = d || defer();
    i = i || 0;
    if (i === 0) {
        fns = _.filter(fns, function (fn) {
            return !(_.isUndefined(fn) || _.isNull(fn));
        });
    }
    if (fns && i < fns.length) {
        try {
            toPromise(fns[i].apply(undefined, args))
                .then(() => executePromiseChain(fns, args, d, i + 1), d.reject);
        }
        catch (e) {
            d.reject(e);
        }
    }
    else {
        d.resolve();
    }
    return d.promise;
};
/**
 * This function accepts two data sources and will check if both are same by comparing the unique id and
 * context in which datasources are present
 * @returns {*} boolean true/ false
 */
const isDataSourceEqual = (d1, d2) => {
    return d1.execute(DataSource.Operation.GET_UNIQUE_IDENTIFIER) === d2.execute(DataSource.Operation.GET_UNIQUE_IDENTIFIER) &&
        _.isEqual(d1.execute(DataSource.Operation.GET_CONTEXT_IDENTIFIER), d2.execute(DataSource.Operation.GET_CONTEXT_IDENTIFIER));
};
/**
 * checks if the passed datasource context matches with passed context
 * @param ds, datasource having a context
 * @param ctx, context to compare with
 * @returns {boolean}
 */
const validateDataSourceCtx = (ds, ctx) => {
    return ds.execute(DataSource.Operation.GET_CONTEXT_IDENTIFIER) === ctx;
};
/**
 * This traverses the filterexpressions object recursively and process the bind string if any in the object
 * @param variable variable object
 * @param name name of the variable
 * @param context scope of the variable
 */
const processFilterExpBindNode = (context, filterExpressions) => {
    const destroyFn = context.registerDestroyListener ? context.registerDestroyListener.bind(context) : _.noop;
    const filter$ = new Subject();
    const bindFilExpObj = (obj, targetNodeKey) => {
        if (stringStartsWith(obj[targetNodeKey], 'bind:')) {
            destroyFn($watch(obj[targetNodeKey].replace('bind:', ''), context, {}, (newVal, oldVal) => {
                if ((newVal === oldVal && _.isUndefined(newVal)) || (_.isUndefined(newVal) && !_.isUndefined(oldVal))) {
                    return;
                }
                // Skip cloning for blob column
                if (!_.includes(['blob', 'file'], obj.type)) {
                    newVal = getClonedObject(newVal);
                }
                // backward compatibility: where we are allowing the user to bind complete object
                if (obj.target === 'dataBinding') {
                    // remove the existing databinding element
                    filterExpressions.rules = [];
                    // now add all the returned values
                    _.forEach(newVal, function (value, target) {
                        filterExpressions.rules.push({
                            'target': target,
                            'value': value,
                            'matchMode': obj.matchMode || 'startignorecase',
                            'required': false,
                            'type': ''
                        });
                    });
                }
                else {
                    // setting value to the root node
                    obj[targetNodeKey] = newVal;
                }
                filter$.next({ filterExpressions, newVal });
            }));
        }
    };
    const traverseFilterExpressions = expressions => {
        if (expressions.rules) {
            _.forEach(expressions.rules, (filExpObj, i) => {
                if (filExpObj.rules) {
                    traverseFilterExpressions(filExpObj);
                }
                else {
                    if (filExpObj.matchMode === 'between') {
                        bindFilExpObj(filExpObj, 'secondvalue');
                    }
                    bindFilExpObj(filExpObj, 'value');
                }
            });
        }
    };
    traverseFilterExpressions(filterExpressions);
    return filter$;
};
// This method will set the given proto on the target
const extendProto = (target, proto) => {
    let _proto = Object.getPrototypeOf(target);
    while (Object.getPrototypeOf(_proto).constructor !== Object) {
        _proto = Object.getPrototypeOf(_proto);
        // return if the prototype of created component and prototype of context are same
        if (proto === _proto) {
            return;
        }
    }
    Object.setPrototypeOf(_proto, proto);
};
const removeExtraSlashes = function (url) {
    const base64regex = /^data:image\/([a-z]{2,});base64,/;
    if (_.isString(url)) {
        /*
        * support for mobile apps having local file path url starting with file:/// and
        * support for base64 format
        * */
        if (_.startsWith(url, 'file:///') || base64regex.test(url)) {
            return url;
        }
        return url.replace(new RegExp('([^:]\/)(\/)+', 'g'), '$1');
    }
};
$.cachedScript = (() => {
    const inProgress = new Map();
    const resolved = new Set();
    const isInProgress = url => inProgress.has(url);
    const isResolved = url => resolved.has(url);
    const onLoad = url => {
        resolved.add(url);
        inProgress.get(url).resolve();
        inProgress.delete(url);
    };
    const setInProgress = url => {
        let resFn;
        let rejFn;
        const promise = new Promise((res, rej) => {
            resFn = res;
            rejFn = rej;
        });
        promise.resolve = resFn;
        promise.reject = rejFn;
        inProgress.set(url, promise);
    };
    return function (url) {
        if (isResolved(url)) {
            return Promise.resolve();
        }
        if (isInProgress(url)) {
            return inProgress.get(url);
        }
        setInProgress(url);
        const options = {
            dataType: 'script',
            cache: true,
            url
        };
        $.ajax(options).done(() => onLoad(url));
        return inProgress.get(url);
    };
})();
const DEFAULT_DISPLAY_FORMATS = {
    DATE: 'yyyy-MM-dd',
    TIME: 'hh:mm a',
    TIMESTAMP: 'yyyy-MM-dd hh:mm:ss a',
    DATETIME: 'yyyy-MM-dd hh:mm:ss a',
};
// This method returns the display date format for given type
const getDisplayDateTimeFormat = type => {
    return DEFAULT_DISPLAY_FORMATS[_.toUpper(type)];
};
// Generate for attribute on label and ID on input element, so that label elements are associated to form controls
const addForIdAttributes = (element) => {
    const labelEl = element.querySelectorAll('label.control-label');
    let inputEl = element.querySelectorAll('[focus-target]');
    if (!inputEl.length) {
        inputEl = element.querySelectorAll('input, select, textarea');
    }
    /*if there are only one input el and label El add id and for attribute*/
    if (labelEl.length && inputEl.length) {
        const widgetId = $(inputEl[0]).closest('[widget-id]').attr('widget-id');
        if (widgetId) {
            setAttr(inputEl[0], 'id', widgetId);
            setAttr(labelEl[0], 'for', widgetId);
        }
    }
};
/**
 * This method is used to adjust the container position depending on the viewport and scroll height.
 * For example: 1. if the widget is at bottom of the page depending on the available bottom space, the picker will open at bottom or top automatically.
 * 2. When we have dataTable with form as a dialog, If widget(ex: search/date/time/datetime) is at bottom of the dialog, the picker is not visible completely. So open the picker at top of the widget.
 * @param containerElem - picker/dropdown container element(jquery)
 * @param parentElem - widget native element
 * @param ref - scope of particular library directive
 * @param ele - Child element(jquery). For some of the widgets(time, search) containerElem doesn't have height. The inner element(dropdown-menu) has height so passing it as optional.
 */
const adjustContainerPosition = (containerElem, parentElem, ref, ele) => {
    const containerHeight = ele ? _.parseInt(ele.css('height')) : _.parseInt(containerElem.css('height'));
    const viewPortHeight = $(window).height() + window.scrollY;
    const parentDimesion = parentElem.getBoundingClientRect();
    const parentTop = parentDimesion.top + window.scrollY;
    // Adjusting container position if is not visible at bottom
    if (viewPortHeight - (parentTop + parentDimesion.height) < containerHeight) {
        const newTop = parentTop - containerHeight;
        ref._ngZone.onStable.subscribe(() => {
            containerElem.css('top', newTop + 'px');
        });
    }
};
// close all the popovers.
const closePopover = (element) => {
    if (!element.closest('.app-popover').length) {
        const popoverElements = document.querySelectorAll('.app-popover-wrapper');
        _.forEach(popoverElements, (ele) => {
            if (ele.widget.isOpen) {
                ele.widget.isOpen = false;
            }
        });
    }
};
/**
 * This method is to trigger change detection in the app
 * This is exposed for the end user developer of WM app
 * This is the alternative for $rs.$safeApply() in AngularJS
 * See $appDigest in utils for more info
 */
const detectChanges$1 = $appDigest;

var Utils = /*#__PURE__*/Object.freeze({
    isDefined: isDefined,
    isObject: isObject,
    toBoolean: toBoolean,
    isIE: isIE,
    isAndroid: isAndroid,
    isAndroidTablet: isAndroidTablet,
    isIphone: isIphone,
    isIpod: isIpod,
    isIpad: isIpad,
    isIos: isIos,
    isMobile: isMobile,
    isMobileApp: isMobileApp,
    getAndroidVersion: getAndroidVersion,
    isKitkatDevice: isKitkatDevice,
    encodeUrl: encodeUrl,
    encodeUrlParams: encodeUrlParams,
    initCaps: initCaps,
    spaceSeparate: spaceSeparate,
    replaceAt: replaceAt,
    periodSeparate: periodSeparate,
    prettifyLabel: prettifyLabel,
    deHyphenate: deHyphenate,
    prettifyLabels: prettifyLabels,
    isInsecureContentRequest: isInsecureContentRequest,
    stringStartsWith: stringStartsWith,
    getEvaluatedExprValue: getEvaluatedExprValue,
    isImageFile: isImageFile,
    isAudioFile: isAudioFile,
    isVideoFile: isVideoFile,
    isValidWebURL: isValidWebURL,
    getResourceURL: getResourceURL,
    triggerFn: triggerFn,
    getFormattedDate: getFormattedDate,
    getDateObj: getDateObj,
    addEventListenerOnElement: addEventListenerOnElement,
    getClonedObject: getClonedObject,
    getFiles: getFiles,
    generateGUId: generateGUId,
    validateAccessRoles: validateAccessRoles,
    getValidJSON: getValidJSON,
    xmlToJson: xmlToJson,
    findValueOf: findValueOf,
    extractType: extractType,
    isNumberType: isNumberType,
    isEmptyObject: isEmptyObject,
    isPageable: isPageable,
    replace: replace,
    isDateTimeType: isDateTimeType,
    getValidDateObject: getValidDateObject,
    getNativeDateObject: getNativeDateObject,
    getBlob: getBlob,
    isEqualWithFields: isEqualWithFields,
    loadStyleSheet: loadStyleSheet,
    loadStyleSheets: loadStyleSheets,
    loadScript: loadScript,
    loadScripts: loadScripts,
    _WM_APP_PROJECT: _WM_APP_PROJECT,
    setSessionStorageItem: setSessionStorageItem,
    getSessionStorageItem: getSessionStorageItem,
    noop: noop$1,
    isArray: isArray,
    isString: isString$1,
    isNumber: isNumber,
    convertToBlob: convertToBlob,
    hasCordova: hasCordova,
    AppConstants: AppConstants,
    openLink: openLink,
    fetchContent: fetchContent,
    toPromise: toPromise,
    retryIfFails: retryIfFails,
    getAbortableDefer: getAbortableDefer,
    createCSSRule: createCSSRule,
    getUrlParams: getUrlParams,
    getRouteNameFromLink: getRouteNameFromLink,
    isAppleProduct: isAppleProduct,
    defer: defer,
    executePromiseChain: executePromiseChain,
    isDataSourceEqual: isDataSourceEqual,
    validateDataSourceCtx: validateDataSourceCtx,
    processFilterExpBindNode: processFilterExpBindNode,
    extendProto: extendProto,
    removeExtraSlashes: removeExtraSlashes,
    getDisplayDateTimeFormat: getDisplayDateTimeFormat,
    addForIdAttributes: addForIdAttributes,
    adjustContainerPosition: adjustContainerPosition,
    closePopover: closePopover,
    detectChanges: detectChanges$1,
    ɵ0: ɵ0$4,
    ɵ1: ɵ1$2,
    ɵ2: ɵ2$1,
    ɵ3: ɵ3$1
});

class EventNotifier {
    constructor(start = true) {
        this._subject = new Subject();
        this._isInitialized = false;
        this._eventsBeforeInit = [];
        if (start) {
            this.start();
        }
    }
    /**
     * A event can be fired, but will be sent to subscribers only after exchange is started.
     *
     * @param {string} eventName
     * @param data
     */
    notify(eventName, ...data) {
        if (this._isInitialized) {
            this._subject.next({
                name: eventName,
                data: data
            });
        }
        else {
            this._eventsBeforeInit.push({
                name: eventName,
                data: data
            });
        }
    }
    /**
     * starts the exchange and send the pending events to subscribers.
     */
    start() {
        if (!this._isInitialized) {
            this._isInitialized = true;
            this._eventsBeforeInit.forEach((event) => this._subject.next(event));
        }
    }
    /**
     * upon subscription, method to cancel subscription is returned.
     *
     * @param eventName
     * @param {(data: any) => void} callback
     * @returns {() => void}
     */
    subscribe(eventName, callback) {
        let eventListener;
        if (eventName && callback) {
            eventListener = this._subject
                .subscribe((event) => {
                if (event && isObject(event) && event.name === eventName) {
                    callback.apply(undefined, event.data);
                }
            });
            return () => {
                eventListener.unsubscribe();
            };
        }
        return noop$1;
    }
    destroy() {
        this._subject.complete();
    }
}

class UtilsService {
    constructor() {
        _.assign(this, Utils);
    }
}
UtilsService.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
/** @nocollapse */
UtilsService.ctorParameters = () => [];
UtilsService.ngInjectableDef = defineInjectable({ factory: function UtilsService_Factory() { return new UtilsService(); }, token: UtilsService, providedIn: "root" });

class FieldTypeService {
    constructor() {
        _.assign(this, {
            INTEGER: 'integer',
            BIG_INTEGER: 'big_integer',
            SHORT: 'short',
            FLOAT: 'float',
            BIG_DECIMAL: 'big_decimal',
            DOUBLE: 'double',
            LONG: 'long',
            BYTE: 'byte',
            STRING: 'string',
            CHARACTER: 'character',
            TEXT: 'text',
            DATE: 'date',
            TIME: 'time',
            TIMESTAMP: 'timestamp',
            DATETIME: 'datetime',
            BOOLEAN: 'boolean',
            LIST: 'list',
            CLOB: 'clob',
            BLOB: 'blob'
        });
    }
}
FieldTypeService.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
/** @nocollapse */
FieldTypeService.ctorParameters = () => [];
FieldTypeService.ngInjectableDef = defineInjectable({ factory: function FieldTypeService_Factory() { return new FieldTypeService(); }, token: FieldTypeService, providedIn: "root" });

class FieldWidgetService {
    constructor() {
        _.assign(this, {
            TEXT: 'text',
            NUMBER: 'number',
            TEXTAREA: 'textarea',
            PASSWORD: 'password',
            CHECKBOX: 'checkbox',
            SLIDER: 'slider',
            RICHTEXT: 'richtext',
            CURRENCY: 'currency',
            SWITCH: 'switch',
            SELECT: 'select',
            CHECKBOXSET: 'checkboxset',
            RADIOSET: 'radioset',
            DATE: 'date',
            TIME: 'time',
            TIMESTAMP: 'timestamp',
            UPLOAD: 'upload',
            RATING: 'rating',
            DATETIME: 'datetime',
            AUTOCOMPLETE: 'autocomplete',
            CHIPS: 'chips',
            COLORPICKER: 'colorpicker'
        });
    }
}
FieldWidgetService.decorators = [
    { type: Injectable, args: [{ providedIn: 'root' },] }
];
/** @nocollapse */
FieldWidgetService.ctorParameters = () => [];
FieldWidgetService.ngInjectableDef = defineInjectable({ factory: function FieldWidgetService_Factory() { return new FieldWidgetService(); }, token: FieldWidgetService, providedIn: "root" });

class CoreModule {
    static forRoot() {
        return {
            ngModule: CoreModule,
            providers: []
        };
    }
}
CoreModule.decorators = [
    { type: NgModule, args: [{
                declarations: [],
                imports: [],
                providers: [],
                bootstrap: []
            },] }
];

/*
 * Public API Surface of core
 */

/**
 * Generated bundle index. Do not edit.
 */

export { getFormWidgetTemplate, updateTemplateAttrs, getNgModelAttr, getRowActionAttrs, ɵ0, CURRENCY_INFO, appendNode, insertBefore, insertAfter, removeNode, removeClass, addClass, switchClass, toggleClass, setCSS, setCSSFromObj, setProperty, setAttr, setHtml, removeAttr, createElement, toDimension, FormWidgetType, DataType, MatchMode, DEFAULT_FORMATS, EventNotifier, setPipeProvider, $parseExpr, $parseEvent, ɵ1, ɵ2, ɵ3, ɵ4, ɵ5, ɵ6, ɵ7, ɵ8, ɵ9, ɵ10, isDefined, isObject, toBoolean, isIE, isAndroid, isAndroidTablet, isIphone, isIpod, isIpad, isIos, isMobile, isMobileApp, getAndroidVersion, isKitkatDevice, encodeUrl, encodeUrlParams, initCaps, spaceSeparate, replaceAt, periodSeparate, prettifyLabel, deHyphenate, prettifyLabels, isInsecureContentRequest, stringStartsWith, getEvaluatedExprValue, isImageFile, isAudioFile, isVideoFile, isValidWebURL, getResourceURL, triggerFn, getFormattedDate, getDateObj, addEventListenerOnElement, getClonedObject, getFiles, generateGUId, validateAccessRoles, getValidJSON, xmlToJson, findValueOf, extractType, isNumberType, isEmptyObject, isPageable, replace, isDateTimeType, getValidDateObject, getNativeDateObject, getBlob, isEqualWithFields, loadStyleSheet, loadStyleSheets, loadScript, loadScripts, _WM_APP_PROJECT, setSessionStorageItem, getSessionStorageItem, noop$1 as noop, isArray, isString$1 as isString, isNumber, convertToBlob, hasCordova, AppConstants, openLink, fetchContent, toPromise, retryIfFails, getAbortableDefer, createCSSRule, getUrlParams, getRouteNameFromLink, isAppleProduct, defer, executePromiseChain, isDataSourceEqual, validateDataSourceCtx, processFilterExpBindNode, extendProto, removeExtraSlashes, getDisplayDateTimeFormat, addForIdAttributes, adjustContainerPosition, closePopover, detectChanges$1 as detectChanges, FIRST_TIME_WATCH, isFirstTimeChange, debounce, muteWatchers, unMuteWatchers, $watch, $unwatch, setNgZone, setAppRef, isChangeFromWatch, resetChangeFromWatch, $invokeWatchers, $appDigest, IDGenerator, IDataSource, DataSource, App, AbstractDialogService, AbstractHttpService, AbstractI18nService, AbstractToasterService, AbstractSpinnerService, UserDefinedExecutionContext, AbstractNavigationService, AppDefaults, DynamicComponentRefProvider, UtilsService, FieldTypeService, FieldWidgetService, CoreModule, getWmProjectProperties, setWmProjectProperties };

//# sourceMappingURL=index.js.map