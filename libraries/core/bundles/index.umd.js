(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('rxjs'), require('@angular/compiler'), require('@angular/core')) :
    typeof define === 'function' && define.amd ? define('@wm/core', ['exports', 'rxjs', '@angular/compiler', '@angular/core'], factory) :
    (factory((global.wm = global.wm || {}, global.wm.core = {}),global.rxjs,global.ng.compiler,global.ng.core));
}(this, (function (exports,rxjs,compiler,i0) { 'use strict';

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
    })(exports.FormWidgetType || (exports.FormWidgetType = {}));
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
    })(exports.DataType || (exports.DataType = {}));
    (function (MatchMode) {
        MatchMode["BETWEEN"] = "between";
        MatchMode["GREATER"] = "greaterthanequal";
        MatchMode["LESSER"] = "lessthanequal";
        MatchMode["NULL"] = "null";
        MatchMode["EMPTY"] = "empty";
        MatchMode["NULLOREMPTY"] = "nullorempty";
        MatchMode["EQUALS"] = "exact";
    })(exports.MatchMode || (exports.MatchMode = {}));
    (function (DEFAULT_FORMATS) {
        DEFAULT_FORMATS["DATE"] = "yyyy-MM-dd";
        DEFAULT_FORMATS["TIME"] = "HH:mm:ss";
        DEFAULT_FORMATS["TIMESTAMP"] = "timestamp";
        DEFAULT_FORMATS["DATETIME"] = "yyyy-MM-ddTHH:mm:ss";
        DEFAULT_FORMATS["LOCALDATETIME"] = "yyyy-MM-ddTHH:mm:ss";
        DEFAULT_FORMATS["DATETIME_ORACLE"] = "yyyy-MM-dd HH:mm:ss";
        DEFAULT_FORMATS["DATE_TIME"] = "yyyy-MM-dd HH:mm:ss";
    })(exports.DEFAULT_FORMATS || (exports.DEFAULT_FORMATS = {}));

    // For html upload widget, add events on input tag
    var getUploadEventTmpl = function (attrs, counter, fieldName) {
        var eventTmpl = '';
        attrs.forEach(function (val, key) {
            if (key && key.endsWith('.event')) {
                var eventName = key.split('.')[0];
                var counterTl = counter ? counter + "." : '';
                eventTmpl = " " + eventTmpl + " (" + eventName + ")=\"" + counterTl + "triggerUploadEvent($event, '" + eventName + "', '" + fieldName + "', row)\" ";
            }
        });
        return eventTmpl;
    };
    var ɵ0 = getUploadEventTmpl;
    // Method to get the form widget template
    var getFormWidgetTemplate = function (widgetType, innerTmpl, attrs, options) {
        if (options === void 0) {
            options = {};
        }
        var tmpl;
        var updateOn = attrs.get('updateon');
        var updateOnTmpl = updateOn ? "updateon=\"" + updateOn + "\"" : '';
        switch (widgetType) {
            case exports.FormWidgetType.AUTOCOMPLETE:
            case exports.FormWidgetType.TYPEAHEAD:
                tmpl = "<div wmSearch type=\"autocomplete\" debouncetime=\"" + attrs.get('debouncetime') + "\" " + innerTmpl + "></div>";
                break;
            case exports.FormWidgetType.CHECKBOX:
                tmpl = "<div wmCheckbox " + innerTmpl + "></div>";
                break;
            case exports.FormWidgetType.CHECKBOXSET:
                tmpl = "<ul wmCheckboxset " + innerTmpl + "></ul>";
                break;
            case exports.FormWidgetType.CHIPS:
                tmpl = "<ul wmChips role=\"input\" debouncetime=\"" + attrs.get('debouncetime') + "\" " + innerTmpl + "></ul>";
                break;
            case exports.FormWidgetType.COLORPICKER:
                tmpl = "<div wmColorPicker " + innerTmpl + "></div>";
                break;
            case exports.FormWidgetType.CURRENCY:
                tmpl = "<div wmCurrency " + innerTmpl + "></div>";
                break;
            case exports.FormWidgetType.DATE:
                tmpl = "<div wmDate " + innerTmpl + "></div>";
                break;
            case exports.FormWidgetType.DATETIME:
                tmpl = "<div wmDateTime " + innerTmpl + "></div>";
                break;
            case exports.FormWidgetType.NUMBER:
                tmpl = "<div wmNumber " + innerTmpl + " type=\"number\" aria-label=\"Only numbers\" " + updateOnTmpl + "></div>";
                break;
            case exports.FormWidgetType.PASSWORD:
                tmpl = "<wm-input " + innerTmpl + " type=\"password\" aria-label=\"Enter password\" " + updateOnTmpl + "></wm-input>";
                break;
            case exports.FormWidgetType.RADIOSET:
                tmpl = "<ul wmRadioset " + innerTmpl + "></ul>";
                break;
            case exports.FormWidgetType.RATING:
                tmpl = "<div wmRating " + innerTmpl + "></div>";
                break;
            case exports.FormWidgetType.RICHTEXT:
                tmpl = "<div wmRichTextEditor role=\"textbox\" " + innerTmpl + "></div>";
                break;
            case exports.FormWidgetType.SELECT:
                tmpl = "<wm-select " + innerTmpl + "></wm-select>";
                break;
            case exports.FormWidgetType.TOGGLE:
                tmpl = "<div wmCheckbox " + innerTmpl + " type=\"toggle\" role=\"checkbox\" aria-label=\"Toggle button\"></div>";
                break;
            case exports.FormWidgetType.SLIDER:
                tmpl = "<div wmSlider " + innerTmpl + "></div>";
                break;
            case exports.FormWidgetType.SWITCH:
                tmpl = "<div wmSwitch " + innerTmpl + "></div>";
                break;
            case exports.FormWidgetType.TEXT:
                var inputType = options.inputType || 'inputtype';
                tmpl = "<wm-input " + innerTmpl + " type=\"" + (attrs.get(inputType) || 'text') + "\" aria-describedby=\"Enter text\" " + updateOnTmpl + "></wm-input>";
                break;
            case exports.FormWidgetType.TEXTAREA:
                tmpl = "<wm-textarea " + innerTmpl + " role=\"textbox\" aria-describedby=\"Place your text\" " + updateOnTmpl + "></wm-textarea>";
                break;
            case exports.FormWidgetType.TIME:
                tmpl = "<div wmTime " + innerTmpl + "></div>";
                break;
            case exports.FormWidgetType.TIMESTAMP:
                tmpl = "<div wmDateTime " + innerTmpl + " role=\"input\"></div>";
                break;
            case exports.FormWidgetType.UPLOAD:
                var counter = options.counter;
                var pCounter = options.pCounter;
                var uploadProps = options.uploadProps;
                var eventTmpl = getUploadEventTmpl(attrs, counter, uploadProps && uploadProps.name);
                if (uploadProps) {
                    tmpl = "<form name=\"" + uploadProps.formName + "\" " + innerTmpl + ">\n                            <input focus-target class=\"file-upload\" type=\"file\" name=\"" + uploadProps.name + "\" " + eventTmpl + "/>\n                        </form>";
                }
                else {
                    tmpl = "<a class=\"form-control-static\" href=\"{{" + counter + ".href}}\" target=\"_blank\" *ngIf=\"" + counter + ".filetype === 'image' && " + counter + ".href\">\n                        <img style=\"height:2em\" class=\"wi wi-file\" [src]=\"" + counter + ".href\"/></a>\n                        <a class=\"form-control-static\" target=\"_blank\" href=\"{{" + counter + ".href}}\" *ngIf=\"" + counter + ".filetype !== 'image' && " + counter + ".href\">\n                        <i class=\"wi wi-file\"></i></a>\n                        <input " + innerTmpl + " class=\"app-blob-upload\" [ngClass]=\"{'file-readonly': " + counter + ".readonly}\" " + eventTmpl + "\n                        [required]=\"" + counter + ".required\" type=\"file\" name=\"" + (attrs.get('key') || attrs.get('name')) + "_formWidget\" [readonly]=\"" + counter + ".readonly\"\n                        [class.hidden]=\"!" + pCounter + ".isUpdateMode\" [accept]=\"" + counter + ".permitted\">";
                }
                break;
            default:
                tmpl = "<wm-input " + innerTmpl + " aria-describedby=\"Enter text\" type=\"text\" " + updateOnTmpl + "></wm-input>";
                break;
        }
        return tmpl;
    };
    // The bound value is replaced with {{item.fieldname}} here. This is needed by the liveList when compiling inner elements
    var updateTemplateAttrs = function (rootNode, parentDataSet, widgetName, instance, referenceName) {
        if (instance === void 0) {
            instance = '';
        }
        if (referenceName === void 0) {
            referenceName = 'item';
        }
        var regex = new RegExp('(' + parentDataSet + ')(\\[0\\])?(.data\\[\\$i\\])?(.content\\[\\$i\\])?(\\[\\$i\\])?', 'g');
        var currentItemRegEx;
        var currentItemWidgetsRegEx;
        var formWidgetsRegex;
        var nodes;
        var widgetList = {
            'wm-list': ['itemclass', 'disableitem']
        };
        if (widgetName) {
            currentItemRegEx = new RegExp("(Widgets." + widgetName + ".currentItem)\\b", 'g');
            currentItemWidgetsRegEx = new RegExp("(Widgets." + widgetName + ".currentItemWidgets)\\b", 'g');
            formWidgetsRegex = new RegExp("(Widgets.(.*).(formWidgets|filterWidgets))\\b", 'g');
        }
        if (!_.isArray(rootNode)) {
            // [WMS-16712],[WMS-16769],[WMS-16805] The markup of root node(table, list, carousel) need to be updated only for the widgets mentioned in widgetList map.
            nodes = widgetList[rootNode.name] ? [rootNode] : (rootNode.children || []);
        }
        else {
            nodes = rootNode;
        }
        nodes.forEach(function (childNode) {
            if (childNode.name) {
                var nodeName_1 = childNode.name;
                childNode.attrs.forEach(function (attr) {
                    // trim the extra spaces in bindings
                    var value = attr.value && attr.value.trim();
                    if (_.startsWith(value, 'bind:')) {
                        // The markup of root node(table, list, carousel) attributes conatains same dataset variable binding then those attributes need to be updated only for specific properties mentioned in widgetList map.
                        if (!widgetList[nodeName_1] || (widgetList[nodeName_1] && widgetList[nodeName_1].indexOf(attr.name) > -1)) {
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
                            value = value.replace(currentItemWidgetsRegEx, instance + "currentItemWidgets");
                        }
                        attr.value = value;
                    }
                });
                updateTemplateAttrs(childNode.children, parentDataSet, widgetName, instance, referenceName);
            }
        });
    };
    // If formControlName attribute is present, dont add the ngModel
    var getNgModelAttr = function (attrs) {
        if (attrs.has('formControlName') || attrs.has('formControlName.bind')) {
            return '';
        }
        return 'ngModel';
    };
    var rowActionAttrs = new Map([
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
    var getRowActionAttrs = function (attrs) {
        var tmpl = '';
        attrs.forEach(function (val, key) {
            var newAttr = rowActionAttrs.get(key);
            if (newAttr) {
                tmpl += newAttr + "=\"" + val + "\" ";
            }
        });
        return tmpl;
    };

    var CURRENCY_INFO = {
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

    var $RAF = window.requestAnimationFrame;
    var $RAFQueue = [];
    var invokeLater = function (fn) {
        if (!$RAFQueue.length) {
            $RAF(function () {
                $RAFQueue.forEach(function (f) { return f(); });
                $RAFQueue.length = 0;
            });
        }
        $RAFQueue.push(fn);
    };
    var appendNode = function (node, parent, sync) {
        var task = function () { return parent.appendChild(node); };
        sync ? task() : invokeLater(task);
    };
    var insertBefore = function (node, ref, sync) {
        var task = function () { return ref.parentNode.insertBefore(node, ref); };
        sync ? task() : invokeLater(task);
    };
    var insertAfter = function (node, ref, sync) {
        var task = function () { return ref.parentNode.insertBefore(node, ref.nextSibling); };
        sync ? task() : invokeLater(task);
    };
    var removeNode = function (node, sync) {
        var task = function () { return node.remove(); };
        sync ? task() : invokeLater(task);
    };
    var removeClass = function (node, ov, sync) {
        ov = ov || '';
        var task = function (c) { return node.classList.remove(c); };
        ov.split(' ').forEach(function (c) {
            if (c.length) {
                sync ? task(c) : invokeLater(function () { return task(c); });
            }
        });
    };
    var addClass = function (node, nv, sync) {
        nv = nv || '';
        var task = function (c) { return node.classList.add(c); };
        nv.split(' ').forEach(function (c) {
            if (c.length) {
                sync ? task(c) : invokeLater(function () { return task(c); });
            }
        });
    };
    var switchClass = function (node, toAdd, toRemove, sync) {
        if (toAdd === void 0) {
            toAdd = '';
        }
        if (toRemove === void 0) {
            toRemove = '';
        }
        removeClass(node, toRemove, sync);
        addClass(node, toAdd, sync);
    };
    var toggleClass = function (node, cls, condition, sync) {
        if (condition) {
            addClass(node, cls, sync);
        }
        else {
            removeClass(node, cls, sync);
        }
    };
    var setCSS = function (node, cssName, val, sync) {
        var task = function () { return node.style[cssName] = val; };
        sync ? task() : invokeLater(task);
    };
    var setCSSFromObj = function (node, cssObj, sync) {
        var keys = Object.keys(cssObj || {});
        keys.forEach(function (key) { return setCSS(node, key, cssObj[key], sync); });
    };
    var setProperty = function (node, propName, val, sync) {
        var task = function () { return node[propName] = val; };
        sync ? task() : invokeLater(task);
    };
    var setAttr = function (node, attrName, val, sync) {
        var task = function () { return node instanceof Element && node.setAttribute(attrName, val); };
        sync ? task() : invokeLater(task);
    };
    var setHtml = function (node, html, sync) {
        var task = function () { return node.innerHTML = html; };
        sync ? task() : invokeLater(task);
    };
    var removeAttr = function (node, attrName, sync) {
        var task = function () { return node.removeAttribute(attrName); };
        sync ? task() : invokeLater(task);
    };
    var createElement = function (nodeType, attrs, sync) {
        var node = document.createElement(nodeType);
        if (attrs) {
            Object.keys(attrs).forEach(function (attrName) {
                setAttr(node, attrName, attrs[attrName], sync);
            });
        }
        return node;
    };
    // for width and height if a numeric value is specified return in px
    // else return the same value
    var toDimension = function (v) {
        // @ts-ignore
        if (v == +v) {
            return v + "px";
        }
        return v;
    };

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */
    function __awaiter(thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try {
                step(generator.next(value));
            }
            catch (e) {
                reject(e);
            } }
            function rejected(value) { try {
                step(generator["throw"](value));
            }
            catch (e) {
                reject(e);
            } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }
    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function () { if (t[0] & 1)
                throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f)
                throw new TypeError("Generator is already executing.");
            while (_)
                try {
                    if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done)
                        return t;
                    if (y = 0, t)
                        op = [0, t.value];
                    switch (op[0]) {
                        case 0:
                        case 1:
                            t = op;
                            break;
                        case 4:
                            _.label++;
                            return { value: op[1], done: false };
                        case 5:
                            _.label++;
                            y = op[1];
                            op = [0];
                            continue;
                        case 7:
                            op = _.ops.pop();
                            _.trys.pop();
                            continue;
                        default:
                            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                                _ = 0;
                                continue;
                            }
                            if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                                _.label = op[1];
                                break;
                            }
                            if (op[0] === 6 && _.label < t[1]) {
                                _.label = t[1];
                                t = op;
                                break;
                            }
                            if (t && _.label < t[2]) {
                                _.label = t[2];
                                _.ops.push(op);
                                break;
                            }
                            if (t[2])
                                _.ops.pop();
                            _.trys.pop();
                            continue;
                    }
                    op = body.call(thisArg, _);
                }
                catch (e) {
                    op = [6, e];
                    y = 0;
                }
                finally {
                    f = t = 0;
                }
            if (op[0] & 5)
                throw op[1];
            return { value: op[0] ? op[1] : void 0, done: true };
        }
    }
    function __values(o) {
        var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
        if (m)
            return m.call(o);
        return {
            next: function () {
                if (o && i >= o.length)
                    o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
    }
    function __read(o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m)
            return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done)
                ar.push(r.value);
        }
        catch (error) {
            e = { error: error };
        }
        finally {
            try {
                if (r && !r.done && (m = i["return"]))
                    m.call(i);
            }
            finally {
                if (e)
                    throw e.error;
            }
        }
        return ar;
    }
    function __spread() {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    }

    var properties = {};
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

    function idGenerator(token) {
        var id;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    id = 1;
                    _a.label = 1;
                case 1:
                    return [4 /*yield*/, "" + token + id++];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 1];
                case 3: return [2 /*return*/];
            }
        });
    }
    var IDGenerator = /** @class */ (function () {
        function IDGenerator(key) {
            this.generator = idGenerator(key);
        }
        IDGenerator.prototype.nextUid = function () {
            return this.generator.next().value;
        };
        return IDGenerator;
    }());

    var isString = function (v) { return typeof v === 'string'; };
    var isDef = function (v) { return v !== void 0; };
    var ɵ1 = isDef;
    var ifDef = function (v, d) { return v === void 0 ? d : v; };
    var ɵ2 = ifDef;
    var plus = function (a, b) { return void 0 === a ? b : void 0 === b ? a : a + b; };
    var ɵ3 = plus;
    var minus = function (a, b) { return ifDef(a, 0) - ifDef(b, 0); };
    var ɵ4 = minus;
    var noop = function () { };
    var ɵ5 = noop;
    var exprFnCache = new Map();
    var eventFnCache = new Map();
    var purePipes = new Map();
    var primitiveEquals = function (a, b) {
        if (typeof a === 'object' || typeof b === 'object') {
            return false;
        }
        if (a !== a && b !== b) { // NaN case
            return true;
        }
        return a === b;
    };
    var ɵ6 = primitiveEquals;
    var detectChanges = function (ov, nv) {
        var len = nv.length;
        var hasChange = len > 10;
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
    var ɵ7 = detectChanges;
    var getPurePipeVal = function (pipe, cache, identifier) {
        var args = [];
        for (var _i = 3; _i < arguments.length; _i++) {
            args[_i - 3] = arguments[_i];
        }
        var lastResult = cache.get(identifier);
        var result;
        if (lastResult) {
            var isModified = detectChanges(lastResult.args, args);
            if (!isModified) {
                return lastResult.result;
            }
        }
        result = pipe.transform.apply(pipe, __spread(args));
        lastResult = { args: args, result: result };
        cache.set(identifier, lastResult);
        return result;
    };
    var ɵ8 = getPurePipeVal;
    var STR_ESCAPE_REGEX = /[^ a-zA-Z0-9]/g;
    var stringEscapeFn = function (str) {
        return '\\u' + ('0000' + str.charCodeAt(0).toString(16)).slice(-4);
    };
    var ɵ9 = stringEscapeFn;
    var ASTCompiler = /** @class */ (function () {
        function ASTCompiler(ast, exprType, pipeNameVsIsPureMap) {
            this.ast = ast;
            this.declarations = [];
            this.stmts = [];
            this.pipes = [];
            this.vIdx = 0;
            this.exprType = exprType;
            this.pipeNameVsIsPureMap = pipeNameVsIsPureMap;
        }
        ASTCompiler.prototype.createVar = function () {
            var v = "v" + this.vIdx++;
            this.declarations.push(v);
            return v;
        };
        ASTCompiler.prototype.processImplicitReceiver = function () {
            return 'ctx';
        };
        ASTCompiler.prototype.processLiteralPrimitive = function () {
            var ast = this.cAst;
            return isString(ast.value) ? "\"" + ast.value.replace(/"/g, '\"').replace(STR_ESCAPE_REGEX, stringEscapeFn) + "\"" : ast.value;
        };
        ASTCompiler.prototype.processLiteralArray = function () {
            var e_1, _a;
            var ast = this.cAst;
            var stmts = this.cStmts;
            var v = this.createVar();
            var s = [];
            try {
                for (var _b = __values(ast.expressions), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var item = _c.value;
                    s.push(this.build(item, stmts));
                }
            }
            catch (e_1_1) {
                e_1 = { error: e_1_1 };
            }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return))
                        _a.call(_b);
                }
                finally {
                    if (e_1)
                        throw e_1.error;
                }
            }
            stmts.push(v + "=[" + s.join(',') + "]");
            return v;
        };
        ASTCompiler.prototype.processLiteralMap = function () {
            var e_2, _a;
            var ast = this.cAst;
            var stmts = this.cStmts;
            var v = this.createVar();
            var _values = [];
            try {
                for (var _b = __values(ast.values), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var _value = _c.value;
                    _values.push(this.build(_value, stmts));
                }
            }
            catch (e_2_1) {
                e_2 = { error: e_2_1 };
            }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return))
                        _a.call(_b);
                }
                finally {
                    if (e_2)
                        throw e_2.error;
                }
            }
            stmts.push(v + "={" + ast.keys.map(function (k, i) { return "'" + k.key + "':" + _values[i]; }) + "}");
            return v;
        };
        ASTCompiler.prototype.processPropertyRead = function () {
            var ast = this.cAst;
            var stmts = this.cStmts;
            var r = this.build(ast.receiver, stmts);
            var v = this.createVar();
            stmts.push(v + "=" + r + "&&" + r + "." + ast.name);
            return v;
        };
        ASTCompiler.prototype.processKeyedRead = function () {
            var ast = this.cAst;
            var stmts = this.cStmts;
            var k = this.build(ast.key, stmts);
            var o = this.build(ast.obj, stmts);
            var v = this.createVar();
            stmts.push(v + "=" + o + "&&" + o + "[" + k + "]");
            return v;
        };
        ASTCompiler.prototype.processPrefixNot = function () {
            var ast = this.cAst;
            var stmts = this.cStmts;
            var r = this.build(ast.expression, stmts);
            stmts.push(r + "=!" + r);
            return r;
        };
        ASTCompiler.prototype.handleBinaryPlus_Minus = function () {
            var ast = this.cAst;
            var stmts = this.cStmts;
            var l = this.build(ast.left, stmts);
            var r = this.build(ast.right, stmts);
            var v = this.createVar();
            var m = ast.operation === '+' ? '_plus' : '_minus';
            stmts.push(v + "=" + m + "(" + l + "," + r + ")");
            return v;
        };
        ASTCompiler.prototype.handleBinaryAND_OR = function () {
            var ast = this.cAst;
            var stmts = this.cStmts;
            var _s1 = [];
            var _sl = [];
            var _sr = [];
            var l = this.build(ast.left, _sl);
            var r = this.build(ast.right, _sr);
            var v = this.createVar();
            if (ast.operation === '&&') {
                _s1.push(_sl.join(';'), ";" + v + "=false", ";if(" + l + "){", _sr.join(';'), ";" + v + "=" + r + ";", "}");
            }
            else {
                _s1.push(_sl.join(';'), ";" + v + "=" + l, ";if(!" + l + "){", _sr.join(';'), ";" + v + "=" + r + ";", "}");
            }
            stmts.push(_s1.join(''));
            return v;
        };
        ASTCompiler.prototype.handleBinaryDefault = function () {
            var ast = this.cAst;
            var stmts = this.cStmts;
            var l = this.build(ast.left, stmts);
            var r = this.build(ast.right, stmts);
            var v = this.createVar();
            stmts.push(v + "=" + l + ast.operation + r);
            return v;
        };
        ASTCompiler.prototype.processBinary = function () {
            var ast = this.cAst;
            var op = ast.operation;
            if (op === '+' || op === '-') {
                return this.handleBinaryPlus_Minus();
            }
            if (op === '&&' || op === '||') {
                return this.handleBinaryAND_OR();
            }
            return this.handleBinaryDefault();
        };
        ASTCompiler.prototype.processConditional = function () {
            var ast = this.cAst;
            var stmts = this.cStmts;
            var condition = this.build(ast.condition, stmts);
            var v = this.createVar();
            var _s1 = [];
            var _s2 = [];
            var _s3 = [];
            var trueExp = this.build(ast.trueExp, _s2);
            var falseExp = this.build(ast.falseExp, _s3);
            _s1.push("if(" + condition + "){", _s2.join(';'), ";" + v + "=" + trueExp + ";", "}else{", _s3.join(';'), ";" + v + "=" + falseExp + ";", "}");
            stmts.push(_s1.join(' '));
            return v;
        };
        ASTCompiler.prototype.processMethodCall = function () {
            var e_3, _a;
            var ast = this.cAst;
            var stmts = this.cStmts;
            var _args = [];
            try {
                for (var _b = __values(ast.args), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var arg = _c.value;
                    _args.push(this.build(arg, stmts));
                }
            }
            catch (e_3_1) {
                e_3 = { error: e_3_1 };
            }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return))
                        _a.call(_b);
                }
                finally {
                    if (e_3)
                        throw e_3.error;
                }
            }
            var fn = this.build(ast.receiver, stmts);
            var v = this.createVar();
            var isImplicitReceiver = ast.receiver instanceof compiler.ImplicitReceiver;
            stmts.push(v + "= " + fn + "&&" + fn + "." + ast.name + "&&" + fn + "." + ast.name + (isImplicitReceiver ? '.bind(_ctx)' : '') + "(" + _args.join(',') + ")");
            return v;
        };
        ASTCompiler.prototype.processChain = function () {
            var _this = this;
            var ast = this.cAst;
            return ast.expressions.map(function (e) { return _this.build(e); }).join(';');
        };
        ASTCompiler.prototype.processPropertyWrite = function () {
            var ast = this.cAst;
            var stmts = this.cStmts;
            var receiver, lhs;
            if (ast.receiver instanceof compiler.ImplicitReceiver) {
                lhs = "_ctx." + ast.name;
            }
            else {
                receiver = this.build(ast.receiver, stmts);
                lhs = "" + receiver + (receiver.length ? '.' : '') + ast.name;
            }
            var rhs = this.build(ast.value, stmts);
            stmts.push(lhs + "=" + rhs);
        };
        ASTCompiler.prototype.processPipe = function () {
            var e_4, _a;
            var ast = this.cAst;
            var stmts = this.cStmts;
            var t = this.createVar();
            var _args = [];
            var _s1 = [];
            var _s2 = [];
            var exp = this.build(ast.exp, stmts);
            try {
                for (var _b = __values(ast.args), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var arg = _c.value;
                    _args.push(this.build(arg, _s2));
                }
            }
            catch (e_4_1) {
                e_4 = { error: e_4_1 };
            }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return))
                        _a.call(_b);
                }
                finally {
                    if (e_4)
                        throw e_4.error;
                }
            }
            var p = "_p" + this.pipes.length;
            this.pipes.push([ast.name, p]);
            _args.unshift(exp);
            _s1.push(_s2.length ? _s2.join(';') + ';' : '', this.pipeNameVsIsPureMap.get(ast.name) ? t + "=getPPVal(" + p + ",_ppc,\"" + p + "\"," + _args + ")" : t + "=" + p + ".transform(" + _args + ")");
            stmts.push(_s1.join(''));
            return t;
        };
        ASTCompiler.prototype.build = function (ast, cStmts) {
            this.cAst = ast;
            this.cStmts = cStmts || this.stmts;
            if (ast instanceof compiler.ImplicitReceiver) {
                return this.processImplicitReceiver();
            }
            else if (ast instanceof compiler.LiteralPrimitive) {
                return this.processLiteralPrimitive();
            }
            else if (ast instanceof compiler.LiteralArray) {
                return this.processLiteralArray();
            }
            else if (ast instanceof compiler.LiteralMap) {
                return this.processLiteralMap();
            }
            else if (ast instanceof compiler.PropertyRead) {
                return this.processPropertyRead();
            }
            else if (ast instanceof compiler.PropertyWrite) {
                return this.processPropertyWrite();
            }
            else if (ast instanceof compiler.KeyedRead) {
                return this.processKeyedRead();
            }
            else if (ast instanceof compiler.PrefixNot) {
                return this.processPrefixNot();
            }
            else if (ast instanceof compiler.Binary) {
                return this.processBinary();
            }
            else if (ast instanceof compiler.Conditional) {
                return this.processConditional();
            }
            else if (ast instanceof compiler.MethodCall) {
                return this.processMethodCall();
            }
            else if (ast instanceof compiler.Chain) {
                return this.processChain();
            }
            else if (ast instanceof compiler.BindingPipe) {
                return this.processPipe();
            }
        };
        ASTCompiler.prototype.extendCtxWithLocals = function () {
            var v1 = this.createVar();
            this.stmts.push(v1 + "=Object.assign({}, locals)", "Object.setPrototypeOf(" + v1 + ", _ctx)", "ctx=" + v1);
        };
        ASTCompiler.prototype.fnBody = function () {
            this.declarations.push('ctx');
            return '"use strict";\nvar ' + this.declarations.join(',') + ';\n' + this.stmts.join(';');
        };
        ASTCompiler.prototype.fnArgs = function () {
            var e_5, _a;
            var args = ['_plus', '_minus', '_isDef'];
            if (this.exprType === ExpressionType.Binding) {
                args.push('getPPVal', '_ppc');
                try {
                    for (var _b = __values(this.pipes), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var _d = __read(_c.value, 2), pipeVar = _d[1];
                        args.push(pipeVar);
                    }
                }
                catch (e_5_1) {
                    e_5 = { error: e_5_1 };
                }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return))
                            _a.call(_b);
                    }
                    finally {
                        if (e_5)
                            throw e_5.error;
                    }
                }
            }
            args.push('_ctx', 'locals');
            return args.join(',');
        };
        ASTCompiler.prototype.addReturnStmt = function (result) {
            // if (this.exprType === ExpressionType.Binding) {
            this.stmts.push("return " + result + ";");
            // }
        };
        ASTCompiler.prototype.cleanup = function () {
            this.ast = this.cAst = this.stmts = this.cStmts = this.declarations = this.pipes = this.pipeNameVsIsPureMap = undefined;
        };
        ASTCompiler.prototype.compile = function () {
            this.extendCtxWithLocals();
            this.addReturnStmt(this.build(this.ast));
            var fn = new Function(this.fnArgs(), this.fnBody());
            var boundFn;
            if (this.exprType === ExpressionType.Binding) {
                boundFn = fn.bind(undefined, plus, minus, isDef, getPurePipeVal);
                boundFn.usedPipes = this.pipes.slice(0); // clone
            }
            else {
                boundFn = fn.bind(undefined, plus, minus, isDef);
            }
            this.cleanup();
            return boundFn;
        };
        return ASTCompiler;
    }());
    var nullPipe = function () {
        return {
            transform: noop
        };
    };
    var ɵ10 = nullPipe;
    var pipeProvider;
    function setPipeProvider(_pipeProvider) {
        pipeProvider = _pipeProvider;
    }
    var ExpressionType;
    (function (ExpressionType) {
        ExpressionType[ExpressionType["Binding"] = 0] = "Binding";
        ExpressionType[ExpressionType["Action"] = 1] = "Action";
    })(ExpressionType || (ExpressionType = {}));
    function $parseExpr(expr) {
        var e_6, _a;
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
        var fn = exprFnCache.get(expr);
        if (fn) {
            return fn;
        }
        var parser = new compiler.Parser(new compiler.Lexer);
        var ast = parser.parseBinding(expr, '');
        var boundFn;
        if (ast.errors.length) {
            fn = noop;
            boundFn = fn;
        }
        else {
            var pipeNameVsIsPureMap = pipeProvider.getPipeNameVsIsPureMap();
            var astCompiler = new ASTCompiler(ast.ast, ExpressionType.Binding, pipeNameVsIsPureMap);
            fn = astCompiler.compile();
            if (fn.usedPipes.length) {
                var pipeArgs = [];
                var hasPurePipe = false;
                try {
                    for (var _b = __values(fn.usedPipes), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var _d = __read(_c.value, 1), pipeName = _d[0];
                        var pipeInfo = pipeProvider.meta(pipeName);
                        var pipeInstance = void 0;
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
                }
                catch (e_6_1) {
                    e_6 = { error: e_6_1 };
                }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return))
                            _a.call(_b);
                    }
                    finally {
                        if (e_6)
                            throw e_6.error;
                    }
                }
                pipeArgs.unshift(hasPurePipe ? new Map() : undefined);
                boundFn = fn.bind.apply(fn, __spread([undefined], pipeArgs));
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
        var fn = eventFnCache.get(expr);
        if (fn) {
            return fn;
        }
        var parser = new compiler.Parser(new compiler.Lexer);
        var ast = parser.parseAction(expr, '');
        if (ast.errors.length) {
            return noop;
        }
        var astCompiler = new ASTCompiler(ast.ast, ExpressionType.Action);
        fn = astCompiler.compile();
        eventFnCache.set(expr, fn);
        return fn;
    }

    var registry = new Map();
    var watchIdGenerator = new IDGenerator('watch-id-');
    var FIRST_TIME_WATCH = {};
    Object.freeze(FIRST_TIME_WATCH);
    var isFirstTimeChange = function (v) { return v === FIRST_TIME_WATCH; };
    var muted = false;
    var debounce = function (fn, wait) {
        if (wait === void 0) {
            wait = 50;
        }
        var timeout;
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            window['__zone_symbol__clearTimeout'](timeout);
            timeout = window['__zone_symbol__setTimeout'](function () { return fn.apply(void 0, __spread(args)); }, wait);
        };
    };
    var muteWatchers = function () {
        muted = true;
    };
    var unMuteWatchers = function () {
        muted = false;
        triggerWatchers();
    };
    var $watch = function (expr, $scope, $locals, listener, identifier, doNotClone) {
        if (identifier === void 0) {
            identifier = watchIdGenerator.nextUid();
        }
        if (doNotClone === void 0) {
            doNotClone = false;
        }
        if (expr.indexOf('[$i]') !== -1) {
            expr = expr.replace(/\[\$i]/g, '[0]');
        }
        var fn = $parseExpr(expr);
        registry.set(identifier, {
            fn: fn.bind(expr, $scope, $locals),
            listener: listener,
            expr: expr,
            last: FIRST_TIME_WATCH,
            doNotClone: doNotClone
        });
        return function () { return $unwatch(identifier); };
    };
    var $unwatch = function (identifier) { return registry.delete(identifier); };
    var changedByWatch = false;
    var $RAF$1 = window.requestAnimationFrame;
    var ngZone;
    var triggerWatchers = function (ignoreMuted) {
        if (muted && !ignoreMuted) {
            return;
        }
        var limit = 5;
        var pass = 1;
        var changeDetected;
        do {
            changeDetected = false;
            registry.forEach(function (watchInfo) {
                var fn = watchInfo.fn;
                var listener = watchInfo.listener;
                var ov = watchInfo.last;
                var nv;
                try {
                    nv = fn();
                }
                catch (e) {
                    console.warn("error in executing expression: '" + watchInfo.expr + "'");
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
            console.warn("Number of watch cycles gone above set limit of: " + limit + " ");
        }
    };
    var setNgZone = function (zone) { return ngZone = zone; };
    var setAppRef = function (appRef) {
        exports.$appDigest = (function () {
            var queued = false;
            return function (force) {
                if (force) {
                    ngZone.run(function () { return appRef.tick(); });
                    queued = false;
                }
                else {
                    if (queued) {
                        return;
                    }
                    else {
                        queued = true;
                        $RAF$1(function () {
                            ngZone.run(function () { return appRef.tick(); });
                            queued = false;
                        });
                    }
                }
            };
        })();
    };
    var isChangeFromWatch = function () { return changedByWatch; };
    var resetChangeFromWatch = function () { return changedByWatch = false; };
    window.watchRegistry = registry;
    var skipWatchers;
    var ɵ1$1 = function () {
        skipWatchers = true;
        ngZone.run(function () { return triggerWatchers(); });
    };
    var debouncedTriggerWatchers = debounce(ɵ1$1, 100);
    var $invokeWatchers = function (force, ignoreMuted) {
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
    exports.$appDigest = function (force) { };

    var IDataSource = /** @class */ (function () {
        function IDataSource() {
        }
        return IDataSource;
    }());
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
    var DataSource = {
        Operation: Operation
    };
    var App = /** @class */ (function () {
        function App() {
        }
        return App;
    }());
    var AbstractDialogService = /** @class */ (function () {
        function AbstractDialogService() {
        }
        return AbstractDialogService;
    }());
    var AbstractHttpService = /** @class */ (function () {
        function AbstractHttpService() {
        }
        return AbstractHttpService;
    }());
    var AbstractI18nService = /** @class */ (function () {
        function AbstractI18nService() {
        }
        return AbstractI18nService;
    }());
    var AbstractToasterService = /** @class */ (function () {
        function AbstractToasterService() {
        }
        return AbstractToasterService;
    }());
    var AbstractSpinnerService = /** @class */ (function () {
        function AbstractSpinnerService() {
        }
        return AbstractSpinnerService;
    }());
    var UserDefinedExecutionContext = /** @class */ (function () {
        function UserDefinedExecutionContext() {
        }
        return UserDefinedExecutionContext;
    }());
    var AbstractNavigationService = /** @class */ (function () {
        function AbstractNavigationService() {
        }
        return AbstractNavigationService;
    }());
    var AppDefaults = /** @class */ (function () {
        function AppDefaults() {
        }
        return AppDefaults;
    }());
    var DynamicComponentRefProvider = /** @class */ (function () {
        function DynamicComponentRefProvider() {
        }
        return DynamicComponentRefProvider;
    }());

    var _this = this;
    var userAgent = window.navigator.userAgent;
    var REGEX = {
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
    var NUMBER_TYPES = ['int', exports.DataType.INTEGER, exports.DataType.FLOAT, exports.DataType.DOUBLE, exports.DataType.LONG, exports.DataType.SHORT, exports.DataType.BYTE, exports.DataType.BIG_INTEGER, exports.DataType.BIG_DECIMAL];
    var now = new Date();
    var CURRENT_DATE = 'CURRENT_DATE';
    var isDefined = function (v) { return 'undefined' !== typeof v; };
    var isObject = function (v) { return null !== v && 'object' === typeof v; };
    var toBoolean = function (val, identity) { return ((val && val !== 'false') ? true : (identity ? val === identity : false)); };
    function isIE11() {
        return window.navigator.appVersion.indexOf('Trident/') > -1;
    }
    var isIE = function () {
        return isIE11() || window.navigator.userAgent.indexOf('MSIE') > -1;
    };
    var isAndroid = function () { return REGEX.ANDROID.test(userAgent); };
    var isAndroidTablet = function () { return REGEX.ANDROID_TABLET.test(userAgent); };
    var isIphone = function () { return REGEX.IPHONE.test(userAgent); };
    var isIpod = function () { return REGEX.IPOD.test(userAgent); };
    var isIpad = function () { return REGEX.IPAD.test(userAgent); };
    var isIos = function () { return isIphone() || isIpod() || isIpad(); };
    var isMobile = function () { return isAndroid() || isIos() || isAndroidTablet() || $('#wm-mobile-display:visible').length > 0; };
    var isMobileApp = function () { return getWmProjectProperties().platformType === 'MOBILE' && getWmProjectProperties().type === 'APPLICATION'; };
    var getAndroidVersion = function () {
        var match = (window.navigator.userAgent.toLowerCase()).match(/android\s([0-9\.]*)/);
        return match ? match[1] : '';
    };
    var isKitkatDevice = function () { return isAndroid() && parseInt(getAndroidVersion(), 10) === 4; };
    /**
     * this method encodes the url and returns the encoded string
     */
    var encodeUrl = function (url) {
        var index = url.indexOf('?');
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
    var encodeUrlParams = function (url) {
        var queryParams, encodedParams = '', queryParamsString, index;
        index = url.indexOf('?');
        if (index > -1) {
            index += 1;
            queryParamsString = url.substring(index);
            // Encoding the query params if exist
            if (queryParamsString) {
                queryParams = queryParamsString.split('&');
                queryParams.forEach(function (param) {
                    var decodedParamValue;
                    var i = _.includes(param, '=') ? param.indexOf('=') : (param && param.length), paramName = param.substr(0, i), paramValue = param.substr(i + 1);
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
    var initCaps = function (name) {
        if (!name) {
            return '';
        }
        return name.charAt(0).toUpperCase() + name.substring(1);
    };
    /* convert camelCase string to a space separated string */
    var spaceSeparate = function (name) {
        if (name === name.toUpperCase()) {
            return name;
        }
        return name.replace(REGEX.SNAKE_CASE, function (letter, pos) {
            return (pos ? ' ' : '') + letter;
        });
    };
    /*Replace the character at a particular index*/
    var replaceAt = function (string, index, character) { return string.substr(0, index) + character + string.substr(index + character.length); };
    /*Replace '.' with space and capitalize the next letter*/
    var periodSeparate = function (name) {
        var dotIndex;
        dotIndex = name.indexOf('.');
        if (dotIndex !== -1) {
            name = replaceAt(name, dotIndex + 1, name.charAt(dotIndex + 1).toUpperCase());
            name = replaceAt(name, dotIndex, ' ');
        }
        return name;
    };
    var prettifyLabel = function (label) {
        label = _.camelCase(label);
        /*capitalize the initial Letter*/
        label = initCaps(label);
        /*Convert camel case words to separated words*/
        label = spaceSeparate(label);
        /*Replace '.' with space and capitalize the next letter*/
        label = periodSeparate(label);
        return label;
    };
    var deHyphenate = function (name) {
        return name.split('-').join(' ');
    };
    /*Accepts an array or a string separated with symbol and returns prettified result*/
    var prettifyLabels = function (names, separator) {
        if (separator === void 0) {
            separator = ',';
        }
        var modifiedNames, namesArray = [];
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
    var isInsecureContentRequest = function (url) {
        var parser = document.createElement('a');
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
    var stringStartsWith = function (str, startsWith, ignoreCase) {
        if (!str) {
            return false;
        }
        var regEx = new RegExp('^' + startsWith, ignoreCase ? 'i' : '');
        return regEx.test(str);
    };
    var getEvaluatedExprValue = function (object, expression) {
        var val;
        /**
         * Evaluate the expression with the scope and object.
         * $eval is used, as expression can be in format of field1 + ' ' + field2
         * $eval can fail, if expression is not in correct format, so attempt the eval function
         */
        val = _.attempt(function () {
            var argsExpr = Object.keys(object).map(function (fieldName) {
                return "var " + fieldName + " = data['" + fieldName + "'];";
            }).join(' ');
            var f = new Function('data', argsExpr + " return  " + expression);
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
    var isImageFile = function (fileName) {
        return (REGEX.SUPPORTED_IMAGE_FORMAT).test(fileName);
    };
    var isAudioFile = function (fileName) {
        return (REGEX.SUPPORTED_AUDIO_FORMAT).test(fileName);
    };
    var isVideoFile = function (fileName) {
        return (REGEX.SUPPORTED_VIDEO_FORMAT).test(fileName);
    };
    var isValidWebURL = function (url) {
        return (REGEX.VALID_WEB_URL).test(url);
    };
    /*This function returns the url to the resource after checking the validity of url*/
    var getResourceURL = function (urlString) {
        if (isValidWebURL(urlString)) ;
        return urlString;
    };
    /*function to check if fn is a function and then execute*/
    function triggerFn(fn) {
        /* Use of slice on arguments will make this function not optimizable
        * https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#32-leaking-arguments
        * */
        var argmnts = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            argmnts[_i - 1] = arguments[_i];
        }
        var start = 1;
        var len = arguments.length, args = new Array(len - start);
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
    var getFormattedDate = function (datePipe, dateObj, format) {
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
    var getDateObj = function (value) {
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
        var dateObj = new Date(value);
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
    var addEventListenerOnElement = function (_element, excludeElement, nativeElement, eventType, isDropDownDisplayEnabledOnInput, successCB, life, isCapture) {
        if (isCapture === void 0) {
            isCapture = false;
        }
        var element = _element;
        var eventListener = function (event) {
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
        var removeEventListener = function () {
            element.removeEventListener(eventType, eventListener, isCapture);
        };
        return removeEventListener;
    };
    /**
     * Returns a deep cloned replica of the passed object/array
     * @param object object/array to clone
     * @returns a clone of the passed object
     */
    var getClonedObject = function (object) {
        return _.cloneDeep(object);
    };
    var getFiles = function (formName, fieldName, isList) {
        var files = _.get(document.forms, [formName, fieldName, 'files']);
        return isList ? _.map(files, _.identity) : files && files[0];
    };
    /*Function to generate a random number*/
    function random() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }
    /*Function to generate a guid based on random numbers.*/
    var generateGUId = function () {
        return random() + '-' + random() + '-' + random();
    };
    /**
     * Validate if given access role is in current loggedin user access roles
     */
    var validateAccessRoles = function (roleExp, loggedInUser) {
        var roles;
        if (roleExp && loggedInUser) {
            roles = roleExp && roleExp.split(',').map(Function.prototype.call, String.prototype.trim);
            return _.intersection(roles, loggedInUser.userRoles).length;
        }
        return true;
    };
    var getValidJSON = function (content) {
        if (!content) {
            return undefined;
        }
        try {
            var parsedIntValue = parseInt(content, 10);
            /*obtaining json from editor content string*/
            return isObject(content) || !isNaN(parsedIntValue) ? content : JSON.parse(content);
        }
        catch (e) {
            /*terminating execution if new variable object is not valid json.*/
            return undefined;
        }
    };
    var xmlToJson = function (xmlString) {
        var x2jsObj = new X2JS({ 'emptyNodeForm': 'content', 'attributePrefix': '', 'enableToStringFunc': false });
        var json = x2jsObj.xml2js(xmlString);
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
    var findValueOf = function (obj, key, create) {
        if (!obj || !key) {
            return;
        }
        if (!create) {
            return _.get(obj, key);
        }
        var parts = key.split('.'), keys = [];
        var skipProcessing;
        parts.forEach(function (part) {
            if (!parts.length) { // if the part of a key is not valid, skip the processing.
                skipProcessing = true;
                return false;
            }
            var subParts = part.match(/\w+/g);
            var subPart;
            while (subParts.length) {
                subPart = subParts.shift();
                keys.push({ 'key': subPart, 'value': subParts.length ? [] : {} }); // determine whether to create an array or an object
            }
        });
        if (skipProcessing) {
            return undefined;
        }
        keys.forEach(function (_key) {
            var tempObj = obj[_key.key];
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
    var extractType = function (typeRef) {
        var type;
        if (!typeRef) {
            return exports.DataType.STRING;
        }
        type = typeRef && typeRef.substring(typeRef.lastIndexOf('.') + 1);
        type = type && type.toLowerCase();
        type = type === exports.DataType.LOCALDATETIME ? exports.DataType.DATETIME : type;
        return type;
    };
    /* returns true if the provided data type matches number type */
    var isNumberType = function (type) {
        return (NUMBER_TYPES.indexOf(extractType(type).toLowerCase()) !== -1);
    };
    /* function to check if provided object is empty*/
    var isEmptyObject = function (obj) {
        if (isObject(obj) && !_.isArray(obj)) {
            return Object.keys(obj).length === 0;
        }
        return false;
    };
    /*Function to check whether the specified object is a pageable object or not.*/
    var isPageable = function (obj) {
        var pageable = {
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
    var replace = function (template, map, parseError) {
        var regEx = REGEX.REPLACE_PATTERN;
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
    var isDateTimeType = function (type) {
        if (_.includes(type, '.')) {
            type = _.toLower(extractType(type));
        }
        return _.includes([exports.DataType.DATE, exports.DataType.TIME, exports.DataType.TIMESTAMP, exports.DataType.DATETIME, exports.DataType.LOCALDATETIME], type);
    };
    /*  This function returns date object. If val is undefined it returns invalid date */
    var getValidDateObject = function (val) {
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
    var getNativeDateObject = function (val) {
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
    var getBlob = function (val, valContentType) {
        if (val instanceof Blob) {
            return val;
        }
        var jsonVal = getValidJSON(val);
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
    var isEqualWithFields = function (obj1, obj2, compareBy) {
        // compareBy can be 'id' or 'id1, id2' or 'id1, id2:id3'
        // Split the compareby comma separated values
        var _compareBy = _.isArray(compareBy) ? compareBy : _.split(compareBy, ',');
        _compareBy = _.map(_compareBy, _.trim);
        return _.isEqualWith(obj1, obj2, function (o1, o2) {
            return _.every(_compareBy, function (cb) {
                var cb1, cb2, _cb;
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
    var getNode = function (selector) { return document.querySelector(selector); };
    var ɵ0$4 = getNode;
    // function to check if the stylesheet is already loaded
    var isStyleSheetLoaded = function (href) { return !!getNode("link[href=\"" + href + "\"]"); };
    var ɵ1$2 = isStyleSheetLoaded;
    // function to remove stylesheet if the stylesheet is already loaded
    var removeStyleSheet = function (href) {
        var node = getNode("link[href=\"" + href + "\"]");
        if (node) {
            node.remove();
        }
    };
    var ɵ2$1 = removeStyleSheet;
    // function to load a stylesheet
    var loadStyleSheet = function (url, attr) {
        if (isStyleSheetLoaded(url)) {
            return;
        }
        var link = document.createElement('link');
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
    var loadStyleSheets = function (urls) {
        if (urls === void 0) {
            urls = [];
        }
        // if the first argument is not an array, convert it to an array
        if (!Array.isArray(urls)) {
            urls = [urls];
        }
        urls.forEach(loadStyleSheet);
    };
    // function to check if the script is already loaded
    var isScriptLoaded = function (src) { return !!getNode("script[src=\"" + src + "\"], script[data-src=\"" + src + "\"]"); };
    var ɵ3$1 = isScriptLoaded;
    var loadScript = function (url) {
        return __awaiter(_this, void 0, void 0, function () {
            var _url;
            return __generator(this, function (_a) {
                _url = url.trim();
                if (!_url.length || isScriptLoaded(_url)) {
                    return [2 /*return*/, Promise.resolve()];
                }
                return [2 /*return*/, fetchContent('text', _url, false, function (text) {
                        var script = document.createElement('script');
                        script.textContent = text;
                        document.head.appendChild(script);
                    })];
            });
        });
    };
    var loadScripts = function (urls) {
        if (urls === void 0) {
            urls = [];
        }
        return __awaiter(_this, void 0, void 0, function () {
            var e_1, _a, urls_1, urls_1_1, url, e_1_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, 6, 7]);
                        urls_1 = __values(urls), urls_1_1 = urls_1.next();
                        _b.label = 1;
                    case 1:
                        if (!!urls_1_1.done)
                            return [3 /*break*/, 4];
                        url = urls_1_1.value;
                        return [4 /*yield*/, loadScript(url)];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        urls_1_1 = urls_1.next();
                        return [3 /*break*/, 1];
                    case 4: return [3 /*break*/, 7];
                    case 5:
                        e_1_1 = _b.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 7];
                    case 6:
                        try {
                            if (urls_1_1 && !urls_1_1.done && (_a = urls_1.return))
                                _a.call(urls_1);
                        }
                        finally {
                            if (e_1)
                                throw e_1.error;
                        }
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/, Promise.resolve()];
                }
            });
        });
    };
    var _WM_APP_PROJECT = {};
    /**
     * This function sets session storage item based on the project ID
     * @param key string
     * @param value string
     */
    var setSessionStorageItem = function (key, value) {
        var item = window.sessionStorage.getItem(_WM_APP_PROJECT.id);
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
    var getSessionStorageItem = function (key) {
        var item = window.sessionStorage.getItem(_WM_APP_PROJECT.id);
        if (item) {
            item = JSON.parse(item);
            return item[key];
        }
    };
    var noop$1 = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
    };
    var isArray = function (v) { return _.isArray(v); };
    var isString$1 = function (v) { return typeof v === 'string'; };
    var isNumber = function (v) { return typeof v === 'number'; };
    /**
     * This function returns a blob object from the given file path
     * @param filepath
     * @returns promise having blob object
     */
    var convertToBlob = function (filepath) {
        return new Promise(function (resolve, reject) {
            // Read the file entry from the file URL
            resolveLocalFileSystemURL(filepath, function (fileEntry) {
                fileEntry.file(function (file) {
                    // file has the cordova file structure. To submit to the backend, convert this file to javascript file
                    var reader = new FileReader();
                    reader.onloadend = function () {
                        var imgBlob = new Blob([reader.result], {
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
    var hasCordova = function () {
        return !!window['cordova'];
    };
    var AppConstants = {
        INT_MAX_VALUE: 2147483647
    };
    var openLink = function (link, target) {
        if (target === void 0) {
            target = '_self';
        }
        if (hasCordova() && _.startsWith(link, '#')) {
            location.hash = link;
        }
        else {
            window.open(link, target);
        }
    };
    /* util function to load the content from a url */
    var fetchContent = function (dataType, url, inSync, success, error) {
        if (inSync === void 0) {
            inSync = false;
        }
        return $.ajax({ type: 'get', dataType: dataType, url: url, async: !inSync })
            .done(function (response) { return success && success(response); })
            .fail(function (reason) { return error && error(reason); });
    };
    /**
     * If the given object is a promise, then object is returned. Otherwise, a promise is resolved with the given object.
     * @param {Promise<T> | T} a
     * @returns {Promise<T>}
     */
    var toPromise = function (a) {
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
    var retryIfFails = function (fn, interval, maxRetries, onBeforeRetry) {
        if (onBeforeRetry === void 0) {
            onBeforeRetry = function () { return Promise.resolve(false); };
        }
        var retryCount = 0;
        var tryFn = function () {
            retryCount++;
            if (_.isFunction(fn)) {
                return fn();
            }
        };
        maxRetries = (_.isNumber(maxRetries) && maxRetries > 0 ? maxRetries : 0);
        interval = (_.isNumber(interval) && interval > 0 ? interval : 0);
        return new Promise(function (resolve, reject) {
            var errorFn = function () {
                var errArgs = arguments;
                setTimeout(function () {
                    toPromise(onBeforeRetry()).then(function (retry) {
                        if (retry !== false && (!maxRetries || retryCount <= maxRetries)) {
                            toPromise(tryFn()).then(resolve, errorFn);
                        }
                        else {
                            reject(errArgs);
                        }
                    }, function () { return reject(errArgs); });
                }, interval);
            };
            toPromise(tryFn()).then(resolve, errorFn);
        });
    };
    /**
     * Promise of a defer created using this function, has abort function that will reject the defer when called.
     * @returns {*} angular defer object
     */
    var getAbortableDefer = function () {
        var _defer = {
            promise: null,
            reject: null,
            resolve: null,
            onAbort: function () { },
            isAborted: false
        };
        _defer.promise = new Promise(function (resolve, reject) {
            _defer.resolve = resolve;
            _defer.reject = reject;
        });
        _defer.promise.abort = function () {
            triggerFn(_defer.onAbort);
            _defer.reject('aborted');
            _defer.isAborted = true;
        };
        return _defer;
    };
    var createCSSRule = function (ruleSelector, rules) {
        var stylesheet = document.styleSheets[0];
        stylesheet.insertRule(ruleSelector + " { " + rules + " }");
    };
    var getUrlParams = function (link) {
        var params = {};
        // If url params are present, construct params object and pass it to search
        var index = link.indexOf('?');
        if (index !== -1) {
            var queryParams = _.split(link.substring(index + 1, link.length), '&');
            queryParams.forEach(function (param) {
                param = _.split(param, '=');
                params[param[0]] = param[1];
            });
        }
        return params;
    };
    var getRouteNameFromLink = function (link) {
        link = link.replace('#/', '/');
        var index = link.indexOf('?');
        if (index !== -1) {
            link = link.substring(0, index);
        }
        return link;
    };
    var isAppleProduct = /Mac|iPod|iPhone|iPad/.test(window.navigator.platform);
    var defer = function () {
        var d = {
            promise: null,
            resolve: noop$1,
            reject: noop$1
        };
        d.promise = new Promise(function (resolve, reject) {
            d.resolve = resolve;
            d.reject = reject;
        });
        return d;
    };
    /*
     * Invokes the given list of functions sequentially with the given arguments. If a function returns a promise,
     * then next function will be invoked only if the promise is resolved.
     */
    var executePromiseChain = function (fns, args, d, i) {
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
                    .then(function () { return executePromiseChain(fns, args, d, i + 1); }, d.reject);
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
    var isDataSourceEqual = function (d1, d2) {
        return d1.execute(DataSource.Operation.GET_UNIQUE_IDENTIFIER) === d2.execute(DataSource.Operation.GET_UNIQUE_IDENTIFIER) &&
            _.isEqual(d1.execute(DataSource.Operation.GET_CONTEXT_IDENTIFIER), d2.execute(DataSource.Operation.GET_CONTEXT_IDENTIFIER));
    };
    /**
     * checks if the passed datasource context matches with passed context
     * @param ds, datasource having a context
     * @param ctx, context to compare with
     * @returns {boolean}
     */
    var validateDataSourceCtx = function (ds, ctx) {
        return ds.execute(DataSource.Operation.GET_CONTEXT_IDENTIFIER) === ctx;
    };
    /**
     * This traverses the filterexpressions object recursively and process the bind string if any in the object
     * @param variable variable object
     * @param name name of the variable
     * @param context scope of the variable
     */
    var processFilterExpBindNode = function (context, filterExpressions) {
        var destroyFn = context.registerDestroyListener ? context.registerDestroyListener.bind(context) : _.noop;
        var filter$ = new rxjs.Subject();
        var bindFilExpObj = function (obj, targetNodeKey) {
            if (stringStartsWith(obj[targetNodeKey], 'bind:')) {
                destroyFn($watch(obj[targetNodeKey].replace('bind:', ''), context, {}, function (newVal, oldVal) {
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
                    filter$.next({ filterExpressions: filterExpressions, newVal: newVal });
                }));
            }
        };
        var traverseFilterExpressions = function (expressions) {
            if (expressions.rules) {
                _.forEach(expressions.rules, function (filExpObj, i) {
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
    var extendProto = function (target, proto) {
        var _proto = Object.getPrototypeOf(target);
        while (Object.getPrototypeOf(_proto).constructor !== Object) {
            _proto = Object.getPrototypeOf(_proto);
            // return if the prototype of created component and prototype of context are same
            if (proto === _proto) {
                return;
            }
        }
        Object.setPrototypeOf(_proto, proto);
    };
    var removeExtraSlashes = function (url) {
        var base64regex = /^data:image\/([a-z]{2,});base64,/;
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
    $.cachedScript = (function () {
        var inProgress = new Map();
        var resolved = new Set();
        var isInProgress = function (url) { return inProgress.has(url); };
        var isResolved = function (url) { return resolved.has(url); };
        var onLoad = function (url) {
            resolved.add(url);
            inProgress.get(url).resolve();
            inProgress.delete(url);
        };
        var setInProgress = function (url) {
            var resFn;
            var rejFn;
            var promise = new Promise(function (res, rej) {
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
            var options = {
                dataType: 'script',
                cache: true,
                url: url
            };
            $.ajax(options).done(function () { return onLoad(url); });
            return inProgress.get(url);
        };
    })();
    var DEFAULT_DISPLAY_FORMATS = {
        DATE: 'yyyy-MM-dd',
        TIME: 'hh:mm a',
        TIMESTAMP: 'yyyy-MM-dd hh:mm:ss a',
        DATETIME: 'yyyy-MM-dd hh:mm:ss a',
    };
    // This method returns the display date format for given type
    var getDisplayDateTimeFormat = function (type) {
        return DEFAULT_DISPLAY_FORMATS[_.toUpper(type)];
    };
    // Generate for attribute on label and ID on input element, so that label elements are associated to form controls
    var addForIdAttributes = function (element) {
        var labelEl = element.querySelectorAll('label.control-label');
        var inputEl = element.querySelectorAll('[focus-target]');
        if (!inputEl.length) {
            inputEl = element.querySelectorAll('input, select, textarea');
        }
        /*if there are only one input el and label El add id and for attribute*/
        if (labelEl.length && inputEl.length) {
            var widgetId = $(inputEl[0]).closest('[widget-id]').attr('widget-id');
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
    var adjustContainerPosition = function (containerElem, parentElem, ref, ele) {
        var containerHeight = ele ? _.parseInt(ele.css('height')) : _.parseInt(containerElem.css('height'));
        var viewPortHeight = $(window).height() + window.scrollY;
        var parentDimesion = parentElem.getBoundingClientRect();
        var parentTop = parentDimesion.top + window.scrollY;
        // Adjusting container position if is not visible at bottom
        if (viewPortHeight - (parentTop + parentDimesion.height) < containerHeight) {
            var newTop_1 = parentTop - containerHeight;
            ref._ngZone.onStable.subscribe(function () {
                containerElem.css('top', newTop_1 + 'px');
            });
        }
    };
    // close all the popovers.
    var closePopover = function (element) {
        if (!element.closest('.app-popover').length) {
            var popoverElements = document.querySelectorAll('.app-popover-wrapper');
            _.forEach(popoverElements, function (ele) {
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
    var detectChanges$1 = exports.$appDigest;

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

    var EventNotifier = /** @class */ (function () {
        function EventNotifier(start) {
            if (start === void 0) {
                start = true;
            }
            this._subject = new rxjs.Subject();
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
        EventNotifier.prototype.notify = function (eventName) {
            var data = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                data[_i - 1] = arguments[_i];
            }
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
        };
        /**
         * starts the exchange and send the pending events to subscribers.
         */
        EventNotifier.prototype.start = function () {
            var _this = this;
            if (!this._isInitialized) {
                this._isInitialized = true;
                this._eventsBeforeInit.forEach(function (event) { return _this._subject.next(event); });
            }
        };
        /**
         * upon subscription, method to cancel subscription is returned.
         *
         * @param eventName
         * @param {(data: any) => void} callback
         * @returns {() => void}
         */
        EventNotifier.prototype.subscribe = function (eventName, callback) {
            var eventListener;
            if (eventName && callback) {
                eventListener = this._subject
                    .subscribe(function (event) {
                    if (event && isObject(event) && event.name === eventName) {
                        callback.apply(undefined, event.data);
                    }
                });
                return function () {
                    eventListener.unsubscribe();
                };
            }
            return noop$1;
        };
        EventNotifier.prototype.destroy = function () {
            this._subject.complete();
        };
        return EventNotifier;
    }());

    var UtilsService = /** @class */ (function () {
        function UtilsService() {
            _.assign(this, Utils);
        }
        UtilsService.decorators = [
            { type: i0.Injectable, args: [{ providedIn: 'root' },] }
        ];
        /** @nocollapse */
        UtilsService.ctorParameters = function () { return []; };
        UtilsService.ngInjectableDef = i0.defineInjectable({ factory: function UtilsService_Factory() { return new UtilsService(); }, token: UtilsService, providedIn: "root" });
        return UtilsService;
    }());

    var FieldTypeService = /** @class */ (function () {
        function FieldTypeService() {
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
        FieldTypeService.decorators = [
            { type: i0.Injectable, args: [{ providedIn: 'root' },] }
        ];
        /** @nocollapse */
        FieldTypeService.ctorParameters = function () { return []; };
        FieldTypeService.ngInjectableDef = i0.defineInjectable({ factory: function FieldTypeService_Factory() { return new FieldTypeService(); }, token: FieldTypeService, providedIn: "root" });
        return FieldTypeService;
    }());

    var FieldWidgetService = /** @class */ (function () {
        function FieldWidgetService() {
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
        FieldWidgetService.decorators = [
            { type: i0.Injectable, args: [{ providedIn: 'root' },] }
        ];
        /** @nocollapse */
        FieldWidgetService.ctorParameters = function () { return []; };
        FieldWidgetService.ngInjectableDef = i0.defineInjectable({ factory: function FieldWidgetService_Factory() { return new FieldWidgetService(); }, token: FieldWidgetService, providedIn: "root" });
        return FieldWidgetService;
    }());

    var CoreModule = /** @class */ (function () {
        function CoreModule() {
        }
        CoreModule.forRoot = function () {
            return {
                ngModule: CoreModule,
                providers: []
            };
        };
        CoreModule.decorators = [
            { type: i0.NgModule, args: [{
                        declarations: [],
                        imports: [],
                        providers: [],
                        bootstrap: []
                    },] }
        ];
        return CoreModule;
    }());

    /*
     * Public API Surface of core
     */

    /**
     * Generated bundle index. Do not edit.
     */

    exports.getFormWidgetTemplate = getFormWidgetTemplate;
    exports.updateTemplateAttrs = updateTemplateAttrs;
    exports.getNgModelAttr = getNgModelAttr;
    exports.getRowActionAttrs = getRowActionAttrs;
    exports.ɵ0 = ɵ0;
    exports.CURRENCY_INFO = CURRENCY_INFO;
    exports.appendNode = appendNode;
    exports.insertBefore = insertBefore;
    exports.insertAfter = insertAfter;
    exports.removeNode = removeNode;
    exports.removeClass = removeClass;
    exports.addClass = addClass;
    exports.switchClass = switchClass;
    exports.toggleClass = toggleClass;
    exports.setCSS = setCSS;
    exports.setCSSFromObj = setCSSFromObj;
    exports.setProperty = setProperty;
    exports.setAttr = setAttr;
    exports.setHtml = setHtml;
    exports.removeAttr = removeAttr;
    exports.createElement = createElement;
    exports.toDimension = toDimension;
    exports.EventNotifier = EventNotifier;
    exports.setPipeProvider = setPipeProvider;
    exports.$parseExpr = $parseExpr;
    exports.$parseEvent = $parseEvent;
    exports.ɵ1 = ɵ1;
    exports.ɵ2 = ɵ2;
    exports.ɵ3 = ɵ3;
    exports.ɵ4 = ɵ4;
    exports.ɵ5 = ɵ5;
    exports.ɵ6 = ɵ6;
    exports.ɵ7 = ɵ7;
    exports.ɵ8 = ɵ8;
    exports.ɵ9 = ɵ9;
    exports.ɵ10 = ɵ10;
    exports.isDefined = isDefined;
    exports.isObject = isObject;
    exports.toBoolean = toBoolean;
    exports.isIE = isIE;
    exports.isAndroid = isAndroid;
    exports.isAndroidTablet = isAndroidTablet;
    exports.isIphone = isIphone;
    exports.isIpod = isIpod;
    exports.isIpad = isIpad;
    exports.isIos = isIos;
    exports.isMobile = isMobile;
    exports.isMobileApp = isMobileApp;
    exports.getAndroidVersion = getAndroidVersion;
    exports.isKitkatDevice = isKitkatDevice;
    exports.encodeUrl = encodeUrl;
    exports.encodeUrlParams = encodeUrlParams;
    exports.initCaps = initCaps;
    exports.spaceSeparate = spaceSeparate;
    exports.replaceAt = replaceAt;
    exports.periodSeparate = periodSeparate;
    exports.prettifyLabel = prettifyLabel;
    exports.deHyphenate = deHyphenate;
    exports.prettifyLabels = prettifyLabels;
    exports.isInsecureContentRequest = isInsecureContentRequest;
    exports.stringStartsWith = stringStartsWith;
    exports.getEvaluatedExprValue = getEvaluatedExprValue;
    exports.isImageFile = isImageFile;
    exports.isAudioFile = isAudioFile;
    exports.isVideoFile = isVideoFile;
    exports.isValidWebURL = isValidWebURL;
    exports.getResourceURL = getResourceURL;
    exports.triggerFn = triggerFn;
    exports.getFormattedDate = getFormattedDate;
    exports.getDateObj = getDateObj;
    exports.addEventListenerOnElement = addEventListenerOnElement;
    exports.getClonedObject = getClonedObject;
    exports.getFiles = getFiles;
    exports.generateGUId = generateGUId;
    exports.validateAccessRoles = validateAccessRoles;
    exports.getValidJSON = getValidJSON;
    exports.xmlToJson = xmlToJson;
    exports.findValueOf = findValueOf;
    exports.extractType = extractType;
    exports.isNumberType = isNumberType;
    exports.isEmptyObject = isEmptyObject;
    exports.isPageable = isPageable;
    exports.replace = replace;
    exports.isDateTimeType = isDateTimeType;
    exports.getValidDateObject = getValidDateObject;
    exports.getNativeDateObject = getNativeDateObject;
    exports.getBlob = getBlob;
    exports.isEqualWithFields = isEqualWithFields;
    exports.loadStyleSheet = loadStyleSheet;
    exports.loadStyleSheets = loadStyleSheets;
    exports.loadScript = loadScript;
    exports.loadScripts = loadScripts;
    exports._WM_APP_PROJECT = _WM_APP_PROJECT;
    exports.setSessionStorageItem = setSessionStorageItem;
    exports.getSessionStorageItem = getSessionStorageItem;
    exports.noop = noop$1;
    exports.isArray = isArray;
    exports.isString = isString$1;
    exports.isNumber = isNumber;
    exports.convertToBlob = convertToBlob;
    exports.hasCordova = hasCordova;
    exports.AppConstants = AppConstants;
    exports.openLink = openLink;
    exports.fetchContent = fetchContent;
    exports.toPromise = toPromise;
    exports.retryIfFails = retryIfFails;
    exports.getAbortableDefer = getAbortableDefer;
    exports.createCSSRule = createCSSRule;
    exports.getUrlParams = getUrlParams;
    exports.getRouteNameFromLink = getRouteNameFromLink;
    exports.isAppleProduct = isAppleProduct;
    exports.defer = defer;
    exports.executePromiseChain = executePromiseChain;
    exports.isDataSourceEqual = isDataSourceEqual;
    exports.validateDataSourceCtx = validateDataSourceCtx;
    exports.processFilterExpBindNode = processFilterExpBindNode;
    exports.extendProto = extendProto;
    exports.removeExtraSlashes = removeExtraSlashes;
    exports.getDisplayDateTimeFormat = getDisplayDateTimeFormat;
    exports.addForIdAttributes = addForIdAttributes;
    exports.adjustContainerPosition = adjustContainerPosition;
    exports.closePopover = closePopover;
    exports.detectChanges = detectChanges$1;
    exports.FIRST_TIME_WATCH = FIRST_TIME_WATCH;
    exports.isFirstTimeChange = isFirstTimeChange;
    exports.debounce = debounce;
    exports.muteWatchers = muteWatchers;
    exports.unMuteWatchers = unMuteWatchers;
    exports.$watch = $watch;
    exports.$unwatch = $unwatch;
    exports.setNgZone = setNgZone;
    exports.setAppRef = setAppRef;
    exports.isChangeFromWatch = isChangeFromWatch;
    exports.resetChangeFromWatch = resetChangeFromWatch;
    exports.$invokeWatchers = $invokeWatchers;
    exports.IDGenerator = IDGenerator;
    exports.IDataSource = IDataSource;
    exports.DataSource = DataSource;
    exports.App = App;
    exports.AbstractDialogService = AbstractDialogService;
    exports.AbstractHttpService = AbstractHttpService;
    exports.AbstractI18nService = AbstractI18nService;
    exports.AbstractToasterService = AbstractToasterService;
    exports.AbstractSpinnerService = AbstractSpinnerService;
    exports.UserDefinedExecutionContext = UserDefinedExecutionContext;
    exports.AbstractNavigationService = AbstractNavigationService;
    exports.AppDefaults = AppDefaults;
    exports.DynamicComponentRefProvider = DynamicComponentRefProvider;
    exports.UtilsService = UtilsService;
    exports.FieldTypeService = FieldTypeService;
    exports.FieldWidgetService = FieldWidgetService;
    exports.CoreModule = CoreModule;
    exports.getWmProjectProperties = getWmProjectProperties;
    exports.setWmProjectProperties = setWmProjectProperties;

    Object.defineProperty(exports, '__esModule', { value: true });

})));

//# sourceMappingURL=index.umd.js.map