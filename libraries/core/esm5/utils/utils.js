var _this = this;
import * as tslib_1 from "tslib";
import { Subject } from 'rxjs';
import { getWmProjectProperties } from './wm-project-properties';
import { $watch, $appDigest } from './watcher';
import { DataType } from '../enums/enums';
import { DataSource } from '../types/types';
import { setAttr } from './dom';
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
var NUMBER_TYPES = ['int', DataType.INTEGER, DataType.FLOAT, DataType.DOUBLE, DataType.LONG, DataType.SHORT, DataType.BYTE, DataType.BIG_INTEGER, DataType.BIG_DECIMAL];
var now = new Date();
var CURRENT_DATE = 'CURRENT_DATE';
export var isDefined = function (v) { return 'undefined' !== typeof v; };
export var isObject = function (v) { return null !== v && 'object' === typeof v; };
export var toBoolean = function (val, identity) { return ((val && val !== 'false') ? true : (identity ? val === identity : false)); };
function isIE11() {
    return window.navigator.appVersion.indexOf('Trident/') > -1;
}
export var isIE = function () {
    return isIE11() || window.navigator.userAgent.indexOf('MSIE') > -1;
};
export var isAndroid = function () { return REGEX.ANDROID.test(userAgent); };
export var isAndroidTablet = function () { return REGEX.ANDROID_TABLET.test(userAgent); };
export var isIphone = function () { return REGEX.IPHONE.test(userAgent); };
export var isIpod = function () { return REGEX.IPOD.test(userAgent); };
export var isIpad = function () { return REGEX.IPAD.test(userAgent); };
export var isIos = function () { return isIphone() || isIpod() || isIpad(); };
export var isMobile = function () { return isAndroid() || isIos() || isAndroidTablet() || $('#wm-mobile-display:visible').length > 0; };
export var isMobileApp = function () { return getWmProjectProperties().platformType === 'MOBILE' && getWmProjectProperties().type === 'APPLICATION'; };
export var getAndroidVersion = function () {
    var match = (window.navigator.userAgent.toLowerCase()).match(/android\s([0-9\.]*)/);
    return match ? match[1] : '';
};
export var isKitkatDevice = function () { return isAndroid() && parseInt(getAndroidVersion(), 10) === 4; };
/**
 * this method encodes the url and returns the encoded string
 */
export var encodeUrl = function (url) {
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
export var encodeUrlParams = function (url) {
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
export var initCaps = function (name) {
    if (!name) {
        return '';
    }
    return name.charAt(0).toUpperCase() + name.substring(1);
};
/* convert camelCase string to a space separated string */
export var spaceSeparate = function (name) {
    if (name === name.toUpperCase()) {
        return name;
    }
    return name.replace(REGEX.SNAKE_CASE, function (letter, pos) {
        return (pos ? ' ' : '') + letter;
    });
};
/*Replace the character at a particular index*/
export var replaceAt = function (string, index, character) { return string.substr(0, index) + character + string.substr(index + character.length); };
/*Replace '.' with space and capitalize the next letter*/
export var periodSeparate = function (name) {
    var dotIndex;
    dotIndex = name.indexOf('.');
    if (dotIndex !== -1) {
        name = replaceAt(name, dotIndex + 1, name.charAt(dotIndex + 1).toUpperCase());
        name = replaceAt(name, dotIndex, ' ');
    }
    return name;
};
export var prettifyLabel = function (label) {
    label = _.camelCase(label);
    /*capitalize the initial Letter*/
    label = initCaps(label);
    /*Convert camel case words to separated words*/
    label = spaceSeparate(label);
    /*Replace '.' with space and capitalize the next letter*/
    label = periodSeparate(label);
    return label;
};
export var deHyphenate = function (name) {
    return name.split('-').join(' ');
};
/*Accepts an array or a string separated with symbol and returns prettified result*/
export var prettifyLabels = function (names, separator) {
    if (separator === void 0) { separator = ','; }
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
export var isInsecureContentRequest = function (url) {
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
export var stringStartsWith = function (str, startsWith, ignoreCase) {
    if (!str) {
        return false;
    }
    var regEx = new RegExp('^' + startsWith, ignoreCase ? 'i' : '');
    return regEx.test(str);
};
export var getEvaluatedExprValue = function (object, expression) {
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
export var isImageFile = function (fileName) {
    return (REGEX.SUPPORTED_IMAGE_FORMAT).test(fileName);
};
export var isAudioFile = function (fileName) {
    return (REGEX.SUPPORTED_AUDIO_FORMAT).test(fileName);
};
export var isVideoFile = function (fileName) {
    return (REGEX.SUPPORTED_VIDEO_FORMAT).test(fileName);
};
export var isValidWebURL = function (url) {
    return (REGEX.VALID_WEB_URL).test(url);
};
/*This function returns the url to the resource after checking the validity of url*/
export var getResourceURL = function (urlString) {
    if (isValidWebURL(urlString)) {
        /*TODO: Use DomSanitizer*/
        // return sanitizer.bypassSecurityTrustResourceUrl(urlString);
    }
    return urlString;
};
/*function to check if fn is a function and then execute*/
export function triggerFn(fn) {
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
export var getFormattedDate = function (datePipe, dateObj, format) {
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
export var getDateObj = function (value) {
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
export var addEventListenerOnElement = function (_element, excludeElement, nativeElement, eventType, isDropDownDisplayEnabledOnInput, successCB, life, isCapture) {
    if (isCapture === void 0) { isCapture = false; }
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
export var getClonedObject = function (object) {
    return _.cloneDeep(object);
};
export var getFiles = function (formName, fieldName, isList) {
    var files = _.get(document.forms, [formName, fieldName, 'files']);
    return isList ? _.map(files, _.identity) : files && files[0];
};
/*Function to generate a random number*/
function random() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
}
/*Function to generate a guid based on random numbers.*/
export var generateGUId = function () {
    return random() + '-' + random() + '-' + random();
};
/**
 * Validate if given access role is in current loggedin user access roles
 */
export var validateAccessRoles = function (roleExp, loggedInUser) {
    var roles;
    if (roleExp && loggedInUser) {
        roles = roleExp && roleExp.split(',').map(Function.prototype.call, String.prototype.trim);
        return _.intersection(roles, loggedInUser.userRoles).length;
    }
    return true;
};
export var getValidJSON = function (content) {
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
export var xmlToJson = function (xmlString) {
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
export var findValueOf = function (obj, key, create) {
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
export var extractType = function (typeRef) {
    var type;
    if (!typeRef) {
        return DataType.STRING;
    }
    type = typeRef && typeRef.substring(typeRef.lastIndexOf('.') + 1);
    type = type && type.toLowerCase();
    type = type === DataType.LOCALDATETIME ? DataType.DATETIME : type;
    return type;
};
/* returns true if the provided data type matches number type */
export var isNumberType = function (type) {
    return (NUMBER_TYPES.indexOf(extractType(type).toLowerCase()) !== -1);
};
/* function to check if provided object is empty*/
export var isEmptyObject = function (obj) {
    if (isObject(obj) && !_.isArray(obj)) {
        return Object.keys(obj).length === 0;
    }
    return false;
};
/*Function to check whether the specified object is a pageable object or not.*/
export var isPageable = function (obj) {
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
export var replace = function (template, map, parseError) {
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
export var isDateTimeType = function (type) {
    if (_.includes(type, '.')) {
        type = _.toLower(extractType(type));
    }
    return _.includes([DataType.DATE, DataType.TIME, DataType.TIMESTAMP, DataType.DATETIME, DataType.LOCALDATETIME], type);
};
/*  This function returns date object. If val is undefined it returns invalid date */
export var getValidDateObject = function (val) {
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
export var getNativeDateObject = function (val) {
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
export var getBlob = function (val, valContentType) {
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
export var isEqualWithFields = function (obj1, obj2, compareBy) {
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
var ɵ0 = getNode;
// function to check if the stylesheet is already loaded
var isStyleSheetLoaded = function (href) { return !!getNode("link[href=\"" + href + "\"]"); };
var ɵ1 = isStyleSheetLoaded;
// function to remove stylesheet if the stylesheet is already loaded
var removeStyleSheet = function (href) {
    var node = getNode("link[href=\"" + href + "\"]");
    if (node) {
        node.remove();
    }
};
var ɵ2 = removeStyleSheet;
// function to load a stylesheet
export var loadStyleSheet = function (url, attr) {
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
export var loadStyleSheets = function (urls) {
    if (urls === void 0) { urls = []; }
    // if the first argument is not an array, convert it to an array
    if (!Array.isArray(urls)) {
        urls = [urls];
    }
    urls.forEach(loadStyleSheet);
};
// function to check if the script is already loaded
var isScriptLoaded = function (src) { return !!getNode("script[src=\"" + src + "\"], script[data-src=\"" + src + "\"]"); };
var ɵ3 = isScriptLoaded;
export var loadScript = function (url) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
    var _url;
    return tslib_1.__generator(this, function (_a) {
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
}); };
export var loadScripts = function (urls) {
    if (urls === void 0) { urls = []; }
    return tslib_1.__awaiter(_this, void 0, void 0, function () {
        var e_1, _a, urls_1, urls_1_1, url, e_1_1;
        return tslib_1.__generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 5, 6, 7]);
                    urls_1 = tslib_1.__values(urls), urls_1_1 = urls_1.next();
                    _b.label = 1;
                case 1:
                    if (!!urls_1_1.done) return [3 /*break*/, 4];
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
                        if (urls_1_1 && !urls_1_1.done && (_a = urls_1.return)) _a.call(urls_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                    return [7 /*endfinally*/];
                case 7: return [2 /*return*/, Promise.resolve()];
            }
        });
    });
};
export var _WM_APP_PROJECT = {};
/**
 * This function sets session storage item based on the project ID
 * @param key string
 * @param value string
 */
export var setSessionStorageItem = function (key, value) {
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
export var getSessionStorageItem = function (key) {
    var item = window.sessionStorage.getItem(_WM_APP_PROJECT.id);
    if (item) {
        item = JSON.parse(item);
        return item[key];
    }
};
export var noop = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
};
export var isArray = function (v) { return _.isArray(v); };
export var isString = function (v) { return typeof v === 'string'; };
export var isNumber = function (v) { return typeof v === 'number'; };
/**
 * This function returns a blob object from the given file path
 * @param filepath
 * @returns promise having blob object
 */
export var convertToBlob = function (filepath) {
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
export var hasCordova = function () {
    return !!window['cordova'];
};
export var AppConstants = {
    INT_MAX_VALUE: 2147483647
};
export var openLink = function (link, target) {
    if (target === void 0) { target = '_self'; }
    if (hasCordova() && _.startsWith(link, '#')) {
        location.hash = link;
    }
    else {
        window.open(link, target);
    }
};
/* util function to load the content from a url */
export var fetchContent = function (dataType, url, inSync, success, error) {
    if (inSync === void 0) { inSync = false; }
    return $.ajax({ type: 'get', dataType: dataType, url: url, async: !inSync })
        .done(function (response) { return success && success(response); })
        .fail(function (reason) { return error && error(reason); });
};
/**
 * If the given object is a promise, then object is returned. Otherwise, a promise is resolved with the given object.
 * @param {Promise<T> | T} a
 * @returns {Promise<T>}
 */
export var toPromise = function (a) {
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
export var retryIfFails = function (fn, interval, maxRetries, onBeforeRetry) {
    if (onBeforeRetry === void 0) { onBeforeRetry = function () { return Promise.resolve(false); }; }
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
export var getAbortableDefer = function () {
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
export var createCSSRule = function (ruleSelector, rules) {
    var stylesheet = document.styleSheets[0];
    stylesheet.insertRule(ruleSelector + " { " + rules + " }");
};
export var getUrlParams = function (link) {
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
export var getRouteNameFromLink = function (link) {
    link = link.replace('#/', '/');
    var index = link.indexOf('?');
    if (index !== -1) {
        link = link.substring(0, index);
    }
    return link;
};
export var isAppleProduct = /Mac|iPod|iPhone|iPad/.test(window.navigator.platform);
export var defer = function () {
    var d = {
        promise: null,
        resolve: noop,
        reject: noop
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
export var executePromiseChain = function (fns, args, d, i) {
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
export var isDataSourceEqual = function (d1, d2) {
    return d1.execute(DataSource.Operation.GET_UNIQUE_IDENTIFIER) === d2.execute(DataSource.Operation.GET_UNIQUE_IDENTIFIER) &&
        _.isEqual(d1.execute(DataSource.Operation.GET_CONTEXT_IDENTIFIER), d2.execute(DataSource.Operation.GET_CONTEXT_IDENTIFIER));
};
/**
 * checks if the passed datasource context matches with passed context
 * @param ds, datasource having a context
 * @param ctx, context to compare with
 * @returns {boolean}
 */
export var validateDataSourceCtx = function (ds, ctx) {
    return ds.execute(DataSource.Operation.GET_CONTEXT_IDENTIFIER) === ctx;
};
/**
 * This traverses the filterexpressions object recursively and process the bind string if any in the object
 * @param variable variable object
 * @param name name of the variable
 * @param context scope of the variable
 */
export var processFilterExpBindNode = function (context, filterExpressions) {
    var destroyFn = context.registerDestroyListener ? context.registerDestroyListener.bind(context) : _.noop;
    var filter$ = new Subject();
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
export var extendProto = function (target, proto) {
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
export var removeExtraSlashes = function (url) {
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
export var getDisplayDateTimeFormat = function (type) {
    return DEFAULT_DISPLAY_FORMATS[_.toUpper(type)];
};
// Generate for attribute on label and ID on input element, so that label elements are associated to form controls
export var addForIdAttributes = function (element) {
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
export var adjustContainerPosition = function (containerElem, parentElem, ref, ele) {
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
export var closePopover = function (element) {
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
export var detectChanges = $appDigest;
export { ɵ0, ɵ1, ɵ2, ɵ3 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29yZS8iLCJzb3VyY2VzIjpbInV0aWxzL3V0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLGlCQXlyQ0E7O0FBenJDQSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBRS9CLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBRWpFLE9BQU8sRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBQy9DLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUMxQyxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDNUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLE9BQU8sQ0FBQztBQVFoQyxJQUFNLFNBQVMsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQztBQUM3QyxJQUFNLEtBQUssR0FBRztJQUNWLFVBQVUsRUFBRSxRQUFRO0lBQ3BCLE9BQU8sRUFBRSxVQUFVO0lBQ25CLE1BQU0sRUFBRSxTQUFTO0lBQ2pCLElBQUksRUFBRSxPQUFPO0lBQ2IsSUFBSSxFQUFFLE9BQU87SUFDYixjQUFjLEVBQUUsMkRBQTJEO0lBQzNFLE1BQU0sRUFBRSxTQUFTO0lBQ2pCLE9BQU8sRUFBRSxnQkFBZ0I7SUFDekIsc0JBQXNCLEVBQUUsaURBQWlEO0lBQ3pFLHFCQUFxQixFQUFFLDhHQUE4RztJQUNySSxzQkFBc0IsRUFBRSxvQ0FBb0M7SUFDNUQsc0JBQXNCLEVBQUUscUNBQXFDO0lBQzdELGtCQUFrQixFQUFFLG1DQUFtQztJQUN2RCxzQkFBc0IsRUFBRSxvQkFBb0I7SUFDNUMsV0FBVyxFQUFFLHVEQUF1RDtJQUNwRSxhQUFhLEVBQUUsOEVBQThFO0lBQzdGLG1CQUFtQixFQUFFLDRFQUE0RTtJQUNqRyxrQkFBa0IsRUFBRSxtREFBbUQ7SUFDdkUsZUFBZSxFQUFFLGlCQUFpQjtJQUNsQyxRQUFRLEVBQUUsU0FBUztJQUNuQixRQUFRLEVBQUUsU0FBUztJQUNuQixpQkFBaUIsRUFBRSxXQUFXO0lBQzlCLHdCQUF3QixFQUFFLFNBQVM7SUFDbkMsVUFBVSxFQUFFLGlCQUFpQjtJQUM3QixjQUFjLEVBQUUsMEJBQTBCO0lBQzFDLGtCQUFrQixFQUFFLGlCQUFpQjtJQUNyQyxxQkFBcUIsRUFBRSxtR0FBbUc7SUFDMUgsZ0JBQWdCLEVBQUUsNERBQTREO0NBQ2pGLEVBQ0csa0JBQWtCLEdBQUcsR0FBRyxDQUFDO0FBRTdCLElBQU0sWUFBWSxHQUFHLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxXQUFXLEVBQUUsUUFBUSxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQzFLLElBQU0sR0FBRyxHQUFTLElBQUksSUFBSSxFQUFFLENBQUM7QUFDN0IsSUFBTSxZQUFZLEdBQUcsY0FBYyxDQUFDO0FBSXBDLE1BQU0sQ0FBQyxJQUFNLFNBQVMsR0FBRyxVQUFBLENBQUMsSUFBSSxPQUFBLFdBQVcsS0FBSyxPQUFPLENBQUMsRUFBeEIsQ0FBd0IsQ0FBQztBQUV2RCxNQUFNLENBQUMsSUFBTSxRQUFRLEdBQUcsVUFBQSxDQUFDLElBQUksT0FBQSxJQUFJLEtBQUssQ0FBQyxJQUFJLFFBQVEsS0FBSyxPQUFPLENBQUMsRUFBbkMsQ0FBbUMsQ0FBQztBQUVqRSxNQUFNLENBQUMsSUFBTSxTQUFTLEdBQUcsVUFBQyxHQUFHLEVBQUUsUUFBUyxJQUFLLE9BQUEsQ0FBQyxDQUFDLEdBQUcsSUFBSSxHQUFHLEtBQUssT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxRQUFRLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQXpFLENBQXlFLENBQUM7QUFFdkgsU0FBUyxNQUFNO0lBQ1gsT0FBTyxNQUFNLENBQUMsU0FBUyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDaEUsQ0FBQztBQUVELE1BQU0sQ0FBQyxJQUFNLElBQUksR0FBRztJQUNoQixPQUFPLE1BQU0sRUFBRSxJQUFJLE1BQU0sQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztBQUN2RSxDQUFDLENBQUM7QUFHRixNQUFNLENBQUMsSUFBTSxTQUFTLEdBQUcsY0FBTSxPQUFBLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUE3QixDQUE2QixDQUFDO0FBRTdELE1BQU0sQ0FBQyxJQUFNLGVBQWUsR0FBRyxjQUFNLE9BQUEsS0FBSyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQXBDLENBQW9DLENBQUM7QUFFMUUsTUFBTSxDQUFDLElBQU0sUUFBUSxHQUFHLGNBQU0sT0FBQSxLQUFLLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBNUIsQ0FBNEIsQ0FBQztBQUMzRCxNQUFNLENBQUMsSUFBTSxNQUFNLEdBQUcsY0FBTSxPQUFBLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUExQixDQUEwQixDQUFDO0FBQ3ZELE1BQU0sQ0FBQyxJQUFNLE1BQU0sR0FBRyxjQUFNLE9BQUEsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLEVBQTFCLENBQTBCLENBQUM7QUFDdkQsTUFBTSxDQUFDLElBQU0sS0FBSyxHQUFHLGNBQU0sT0FBQSxRQUFRLEVBQUUsSUFBSSxNQUFNLEVBQUUsSUFBSSxNQUFNLEVBQUUsRUFBbEMsQ0FBa0MsQ0FBQztBQUU5RCxNQUFNLENBQUMsSUFBTSxRQUFRLEdBQUcsY0FBTSxPQUFBLFNBQVMsRUFBRSxJQUFJLEtBQUssRUFBRSxJQUFJLGVBQWUsRUFBRSxJQUFJLENBQUMsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQXpGLENBQXlGLENBQUM7QUFFeEgsTUFBTSxDQUFDLElBQU0sV0FBVyxHQUFHLGNBQU0sT0FBQSxzQkFBc0IsRUFBRSxDQUFDLFlBQVksS0FBSyxRQUFRLElBQUksc0JBQXNCLEVBQUUsQ0FBQyxJQUFJLEtBQUssYUFBYSxFQUFyRyxDQUFxRyxDQUFDO0FBRXZJLE1BQU0sQ0FBQyxJQUFNLGlCQUFpQixHQUFHO0lBQzdCLElBQU0sS0FBSyxHQUFHLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMscUJBQXFCLENBQUMsQ0FBQztJQUN0RixPQUFPLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDakMsQ0FBQyxDQUFDO0FBRUYsTUFBTSxDQUFDLElBQU0sY0FBYyxHQUFHLGNBQU0sT0FBQSxTQUFTLEVBQUUsSUFBSSxRQUFRLENBQUMsaUJBQWlCLEVBQUUsRUFBRSxFQUFFLENBQUMsS0FBSyxDQUFDLEVBQXRELENBQXNELENBQUM7QUFFM0Y7O0dBRUc7QUFDSCxNQUFNLENBQUMsSUFBTSxTQUFTLEdBQUcsVUFBQyxHQUFXO0lBQ2pDLElBQU0sS0FBSyxHQUFHLEdBQUcsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDL0IsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDLEVBQUU7UUFDWiwyQkFBMkI7UUFDM0IsR0FBRyxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDaEUsbURBQW1EO1FBQ25ELEdBQUcsR0FBRyxlQUFlLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDOUI7U0FBTTtRQUNILEdBQUcsR0FBRyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDeEI7SUFFRCxPQUFPLEdBQUcsQ0FBQztBQUNmLENBQUMsQ0FBQztBQUVGOztHQUVHO0FBQ0gsTUFBTSxDQUFDLElBQU0sZUFBZSxHQUFHLFVBQUMsR0FBVztJQUN2QyxJQUFJLFdBQVcsRUFBRSxhQUFhLEdBQUcsRUFBRSxFQUFFLGlCQUFpQixFQUFFLEtBQUssQ0FBQztJQUM5RCxLQUFLLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUN6QixJQUFJLEtBQUssR0FBRyxDQUFDLENBQUMsRUFBRTtRQUNaLEtBQUssSUFBSSxDQUFDLENBQUM7UUFDWCxpQkFBaUIsR0FBRyxHQUFHLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3pDLHFDQUFxQztRQUNyQyxJQUFJLGlCQUFpQixFQUFFO1lBQ25CLFdBQVcsR0FBRyxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDM0MsV0FBVyxDQUFDLE9BQU8sQ0FBQyxVQUFVLEtBQUs7Z0JBQy9CLElBQUksaUJBQWlCLENBQUM7Z0JBQ3RCLElBQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQzNFLFNBQVMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFDOUIsVUFBVSxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO2dCQUVyQywwR0FBMEc7Z0JBQzFHLElBQUksVUFBVSxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxFQUFFO29CQUN0QyxJQUFJO3dCQUNBLGlCQUFpQixHQUFHLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxDQUFDO3FCQUN0RDtvQkFBQyxPQUFPLENBQUMsRUFBRTt3QkFDUixpQkFBaUIsR0FBRyxVQUFVLENBQUM7cUJBQ2xDO29CQUNELGFBQWEsSUFBSSxTQUFTLEdBQUcsR0FBRyxHQUFHLGtCQUFrQixDQUFDLGlCQUFpQixDQUFDLEdBQUcsR0FBRyxDQUFDO2lCQUNsRjtxQkFBTTtvQkFDSCxhQUFhLElBQUksU0FBUyxHQUFHLEdBQUcsQ0FBQztpQkFDcEM7WUFDTCxDQUFDLENBQUMsQ0FBQztZQUNILGFBQWEsR0FBRyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzNDLEdBQUcsR0FBRyxHQUFHLENBQUMsT0FBTyxDQUFDLGlCQUFpQixFQUFFLGFBQWEsQ0FBQyxDQUFDO1NBQ3ZEO0tBQ0o7SUFDRCxPQUFPLEdBQUcsQ0FBQztBQUNmLENBQUMsQ0FBQztBQUVGLHNEQUFzRDtBQUN0RCxNQUFNLENBQUMsSUFBTSxRQUFRLEdBQUcsVUFBQSxJQUFJO0lBQ3hCLElBQUksQ0FBQyxJQUFJLEVBQUU7UUFDUCxPQUFPLEVBQUUsQ0FBQztLQUNiO0lBQ0QsT0FBTyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDNUQsQ0FBQyxDQUFDO0FBRUYsMERBQTBEO0FBQzFELE1BQU0sQ0FBQyxJQUFNLGFBQWEsR0FBRyxVQUFBLElBQUk7SUFDN0IsSUFBSSxJQUFJLEtBQUssSUFBSSxDQUFDLFdBQVcsRUFBRSxFQUFFO1FBQzdCLE9BQU8sSUFBSSxDQUFDO0tBQ2Y7SUFDRCxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLFVBQVUsRUFBRSxVQUFVLE1BQU0sRUFBRSxHQUFHO1FBQ3ZELE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDO0lBQ3JDLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxDQUFDO0FBRUYsK0NBQStDO0FBQy9DLE1BQU0sQ0FBQyxJQUFNLFNBQVMsR0FBRyxVQUFDLE1BQU0sRUFBRSxLQUFLLEVBQUUsU0FBUyxJQUFLLE9BQUEsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLEdBQUcsU0FBUyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsRUFBN0UsQ0FBNkUsQ0FBQztBQUVySSx5REFBeUQ7QUFDekQsTUFBTSxDQUFDLElBQU0sY0FBYyxHQUFHLFVBQUEsSUFBSTtJQUM5QixJQUFJLFFBQVEsQ0FBQztJQUNiLFFBQVEsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQzdCLElBQUksUUFBUSxLQUFLLENBQUMsQ0FBQyxFQUFFO1FBQ2pCLElBQUksR0FBRyxTQUFTLENBQUMsSUFBSSxFQUFFLFFBQVEsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUMsV0FBVyxFQUFFLENBQUMsQ0FBQztRQUM5RSxJQUFJLEdBQUcsU0FBUyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsR0FBRyxDQUFDLENBQUM7S0FDekM7SUFDRCxPQUFPLElBQUksQ0FBQztBQUNoQixDQUFDLENBQUM7QUFFRixNQUFNLENBQUMsSUFBTSxhQUFhLEdBQUcsVUFBQSxLQUFLO0lBQzlCLEtBQUssR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzNCLGlDQUFpQztJQUNqQyxLQUFLLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ3hCLCtDQUErQztJQUMvQyxLQUFLLEdBQUcsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzdCLHlEQUF5RDtJQUN6RCxLQUFLLEdBQUcsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzlCLE9BQU8sS0FBSyxDQUFDO0FBQ2pCLENBQUMsQ0FBQztBQUVGLE1BQU0sQ0FBQyxJQUFNLFdBQVcsR0FBRyxVQUFDLElBQUk7SUFDNUIsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNyQyxDQUFDLENBQUM7QUFFRixvRkFBb0Y7QUFDcEYsTUFBTSxDQUFDLElBQU0sY0FBYyxHQUFHLFVBQUMsS0FBSyxFQUFFLFNBQWU7SUFBZiwwQkFBQSxFQUFBLGVBQWU7SUFDakQsSUFBSSxhQUFhLEVBQUUsVUFBVSxHQUFHLEVBQUUsQ0FBQztJQUVuQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsRUFBRTtRQUNuQixVQUFVLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUM7S0FDMUM7SUFFRCxhQUFhLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsYUFBYSxDQUFDLENBQUM7SUFDakQsSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFO1FBQ2xCLE9BQU8sYUFBYSxDQUFDO0tBQ3hCO0lBQ0QsT0FBTyxhQUFhLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0FBQ3pDLENBQUMsQ0FBQztBQUVGOztHQUVHO0FBQ0gsTUFBTSxDQUFDLElBQU0sd0JBQXdCLEdBQUcsVUFBQyxHQUFXO0lBRWhELElBQU0sTUFBTSxHQUFzQixRQUFRLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQzlELE1BQU0sQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDO0lBRWxCLDREQUE0RDtJQUM1RCxJQUFJLE1BQU0sQ0FBQyxRQUFRLEtBQUssRUFBRSxFQUFFO1FBQ3hCLE9BQU8sS0FBSyxDQUFDO0tBQ2hCO0lBRUQsSUFBSSxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxFQUFFO1FBQzdDLE9BQU8sTUFBTSxDQUFDLFFBQVEsS0FBSyxRQUFRLElBQUksTUFBTSxDQUFDLFFBQVEsS0FBSyxNQUFNLENBQUM7S0FDckU7SUFFRCxPQUFPLEtBQUssQ0FBQztBQUNqQixDQUFDLENBQUM7QUFFRjs7R0FFRztBQUNILE1BQU0sQ0FBQyxJQUFNLGdCQUFnQixHQUFHLFVBQUMsR0FBVyxFQUFFLFVBQWtCLEVBQUUsVUFBVztJQUN6RSxJQUFJLENBQUMsR0FBRyxFQUFFO1FBQ04sT0FBTyxLQUFLLENBQUM7S0FDaEI7SUFFRCxJQUFNLEtBQUssR0FBRyxJQUFJLE1BQU0sQ0FBQyxHQUFHLEdBQUcsVUFBVSxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUVsRSxPQUFPLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDM0IsQ0FBQyxDQUFDO0FBRUYsTUFBTSxDQUFDLElBQU0scUJBQXFCLEdBQUcsVUFBQyxNQUFNLEVBQUUsVUFBVTtJQUNwRCxJQUFJLEdBQUcsQ0FBQztJQUNSOzs7O09BSUc7SUFDSCxHQUFHLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQztRQUVaLElBQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQUMsU0FBUztZQUMvQyxPQUFPLFNBQU8sU0FBUyxpQkFBWSxTQUFTLFFBQUssQ0FBQztRQUN0RCxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDYixJQUFNLENBQUMsR0FBRyxJQUFJLFFBQVEsQ0FBQyxNQUFNLEVBQUssUUFBUSxpQkFBWSxVQUFZLENBQUMsQ0FBQztRQUNwRSxPQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNyQixDQUFDLENBQUMsQ0FBQztJQUNIOzs7T0FHRztJQUNILElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRTtRQUNoQixHQUFHLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLENBQUM7S0FDbkM7SUFDRCxPQUFPLEdBQUcsQ0FBQztBQUNmLENBQUMsQ0FBQztBQUVGLCtCQUErQjtBQUMvQixNQUFNLENBQUMsSUFBTSxXQUFXLEdBQUcsVUFBQyxRQUFRO0lBQ2hDLE9BQU8sQ0FBQyxLQUFLLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDekQsQ0FBQyxDQUFDO0FBRUYsTUFBTSxDQUFDLElBQU0sV0FBVyxHQUFHLFVBQUMsUUFBUTtJQUNoQyxPQUFPLENBQUMsS0FBSyxDQUFDLHNCQUFzQixDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3pELENBQUMsQ0FBQztBQUVGLE1BQU0sQ0FBQyxJQUFNLFdBQVcsR0FBRyxVQUFDLFFBQVE7SUFDaEMsT0FBTyxDQUFDLEtBQUssQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUN6RCxDQUFDLENBQUM7QUFFRixNQUFNLENBQUMsSUFBTSxhQUFhLEdBQUcsVUFBQyxHQUFXO0lBQ3JDLE9BQU8sQ0FBQyxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzNDLENBQUMsQ0FBQztBQUVGLG9GQUFvRjtBQUNwRixNQUFNLENBQUMsSUFBTSxjQUFjLEdBQUcsVUFBQyxTQUFTO0lBQ3BDLElBQUksYUFBYSxDQUFDLFNBQVMsQ0FBQyxFQUFFO1FBQzFCLDBCQUEwQjtRQUMxQiw4REFBOEQ7S0FDakU7SUFDRCxPQUFPLFNBQVMsQ0FBQztBQUNyQixDQUFDLENBQUM7QUFFRiwwREFBMEQ7QUFDMUQsTUFBTSxVQUFVLFNBQVMsQ0FBQyxFQUFFO0lBQ3hCOztRQUVJO0lBSHNCLGlCQUFVO1NBQVYsVUFBVSxFQUFWLHFCQUFVLEVBQVYsSUFBVTtRQUFWLGdDQUFVOztJQUtwQyxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7SUFDZCxJQUFNLEdBQUcsR0FBRyxTQUFTLENBQUMsTUFBTSxFQUFFLElBQUksR0FBRyxJQUFJLEtBQUssQ0FBQyxHQUFHLEdBQUcsS0FBSyxDQUFDLENBQUM7SUFDNUQsS0FBSyxLQUFLLEVBQUUsS0FBSyxHQUFHLEdBQUcsRUFBRSxLQUFLLEVBQUUsRUFBRTtRQUM5QixJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUN0QztJQUVELElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsRUFBRTtRQUNsQixPQUFPLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0tBQy9CO0FBQ0wsQ0FBQztBQUVEOztHQUVHO0FBQ0gsTUFBTSxDQUFDLElBQU0sZ0JBQWdCLEdBQUcsVUFBQyxRQUFRLEVBQUUsT0FBTyxFQUFFLE1BQWM7SUFDOUQsSUFBSSxDQUFDLE9BQU8sRUFBRTtRQUNWLE9BQU8sU0FBUyxDQUFDO0tBQ3BCO0lBQ0QsSUFBSSxNQUFNLEtBQUssV0FBVyxFQUFFO1FBQ3hCLE9BQU8sTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQ3BDO0lBQ0QsT0FBTyxRQUFRLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztBQUMvQyxDQUFDLENBQUM7QUFFRjs7R0FFRztBQUNILE1BQU0sQ0FBQyxJQUFNLFVBQVUsR0FBRyxVQUFDLEtBQUs7SUFDNUIsdURBQXVEO0lBQ3ZELElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsRUFBRTtRQUNqQixPQUFPLEtBQUssQ0FBQztLQUNoQjtJQUVELDhEQUE4RDtJQUM5RCxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFFO1FBQ2YsS0FBSyxHQUFHLFFBQVEsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7S0FDL0I7SUFFRCxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLE9BQU8sRUFBRSxJQUFJLEtBQUssS0FBSyxFQUFFLElBQUksS0FBSyxLQUFLLElBQUksSUFBSSxLQUFLLEtBQUssU0FBUyxFQUFFO1FBQ25GLE9BQU8sU0FBUyxDQUFDO0tBQ3BCO0lBQ0QsSUFBSSxPQUFPLEdBQUcsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7SUFDOUI7Ozs7O09BS0c7SUFDSCxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEVBQUU7UUFDbkIsT0FBTyxHQUFHLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDO0tBQzlDO0lBRUQsSUFBSSxLQUFLLEtBQUssWUFBWSxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRTtRQUNuRCxPQUFPLEdBQUcsQ0FBQztLQUNkO0lBQ0QsT0FBTyxPQUFPLENBQUM7QUFDbkIsQ0FBQyxDQUFDO0FBRUYsTUFBTSxDQUFDLElBQU0seUJBQXlCLEdBQUcsVUFBQyxRQUFpQixFQUFFLGNBQXVCLEVBQUUsYUFBc0IsRUFBRSxTQUFTLEVBQUUsK0JBQStCLEVBQUUsU0FBUyxFQUFFLElBQWdCLEVBQUUsU0FBaUI7SUFBakIsMEJBQUEsRUFBQSxpQkFBaUI7SUFDcE0sSUFBTSxPQUFPLEdBQVksUUFBUSxDQUFDO0lBQ2xDLElBQU0sYUFBYSxHQUFHLFVBQUMsS0FBSztRQUN4QixJQUFJLGNBQWMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFJLGNBQWMsS0FBSyxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDOUYsT0FBTztTQUNWO1FBQ0QsSUFBSSxhQUFhLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRTtZQUN0QyxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsK0JBQStCLEVBQUU7Z0JBQ2xFLE9BQU87YUFDVDtZQUNELE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxTQUFTLEVBQUUsYUFBYSxFQUFFLFNBQVMsQ0FBQyxDQUFDO1lBQ2pFLE9BQU87U0FDVjtRQUNELElBQUksSUFBSSxpQkFBb0IsRUFBRTtZQUMxQixPQUFPLENBQUMsbUJBQW1CLENBQUMsU0FBUyxFQUFFLGFBQWEsRUFBRSxTQUFTLENBQUMsQ0FBQztTQUNwRTtRQUNELFNBQVMsRUFBRSxDQUFDO0lBQ2hCLENBQUMsQ0FBQztJQUNGLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsYUFBYSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBQzlELElBQU0sbUJBQW1CLEdBQUc7UUFDeEIsT0FBTyxDQUFDLG1CQUFtQixDQUFDLFNBQVMsRUFBRSxhQUFhLEVBQUUsU0FBUyxDQUFDLENBQUM7SUFDckUsQ0FBQyxDQUFDO0lBQ0YsT0FBTyxtQkFBbUIsQ0FBQztBQUMvQixDQUFDLENBQUM7QUFFRjs7OztHQUlHO0FBQ0gsTUFBTSxDQUFDLElBQU0sZUFBZSxHQUFHLFVBQUMsTUFBTTtJQUNsQyxPQUFPLENBQUMsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDL0IsQ0FBQyxDQUFDO0FBRUYsTUFBTSxDQUFDLElBQU0sUUFBUSxHQUFHLFVBQUMsUUFBUSxFQUFFLFNBQVMsRUFBRSxNQUFNO0lBQ2hELElBQU0sS0FBSyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDLFFBQVEsRUFBRyxTQUFTLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQztJQUNyRSxPQUFPLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2pFLENBQUMsQ0FBQztBQUVGLHdDQUF3QztBQUN4QyxTQUFTLE1BQU07SUFDWCxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMvRSxDQUFDO0FBRUQsd0RBQXdEO0FBQ3hELE1BQU0sQ0FBQyxJQUFNLFlBQVksR0FBRztJQUN4QixPQUFPLE1BQU0sRUFBRSxHQUFHLEdBQUcsR0FBRyxNQUFNLEVBQUUsR0FBRyxHQUFHLEdBQUcsTUFBTSxFQUFFLENBQUM7QUFDdEQsQ0FBQyxDQUFDO0FBRUY7O0dBRUc7QUFDSCxNQUFNLENBQUMsSUFBTSxtQkFBbUIsR0FBRyxVQUFDLE9BQU8sRUFBRSxZQUFZO0lBQ3JELElBQUksS0FBSyxDQUFDO0lBRVYsSUFBSSxPQUFPLElBQUksWUFBWSxFQUFFO1FBRXpCLEtBQUssR0FBRyxPQUFPLElBQUksT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUUxRixPQUFPLENBQUMsQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQyxNQUFNLENBQUM7S0FDL0Q7SUFFRCxPQUFPLElBQUksQ0FBQztBQUNoQixDQUFDLENBQUM7QUFFRixNQUFNLENBQUMsSUFBTSxZQUFZLEdBQUcsVUFBQyxPQUFPO0lBQ2hDLElBQUksQ0FBQyxPQUFPLEVBQUU7UUFDVixPQUFPLFNBQVMsQ0FBQztLQUNwQjtJQUNELElBQUk7UUFDQSxJQUFNLGNBQWMsR0FBRyxRQUFRLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzdDLDZDQUE2QztRQUM3QyxPQUFPLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0tBQ3RGO0lBQUMsT0FBTyxDQUFDLEVBQUU7UUFDUixtRUFBbUU7UUFDbkUsT0FBTyxTQUFTLENBQUM7S0FDcEI7QUFDTCxDQUFDLENBQUM7QUFFRixNQUFNLENBQUMsSUFBTSxTQUFTLEdBQUcsVUFBQyxTQUFTO0lBQy9CLElBQU0sT0FBTyxHQUFHLElBQUksSUFBSSxDQUFDLEVBQUMsZUFBZSxFQUFFLFNBQVMsRUFBRSxpQkFBaUIsRUFBRSxFQUFFLEVBQUUsb0JBQW9CLEVBQUUsS0FBSyxFQUFDLENBQUMsQ0FBQztJQUMzRyxJQUFJLElBQUksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0lBQ3JDLElBQUksSUFBSSxFQUFFO1FBQ04sSUFBSSxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUM1QztJQUNELE9BQU8sSUFBSSxDQUFDO0FBQ2hCLENBQUMsQ0FBQztBQUVGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0F3Qkc7QUFDSCxNQUFNLENBQUMsSUFBTSxXQUFXLEdBQUcsVUFBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLE1BQU87SUFFekMsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRTtRQUNkLE9BQU87S0FDVjtJQUVELElBQUksQ0FBQyxNQUFNLEVBQUU7UUFDVCxPQUFPLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0tBQzFCO0lBRUQsSUFBTSxLQUFLLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFDeEIsSUFBSSxHQUFHLEVBQUUsQ0FBQztJQUVkLElBQUksY0FBYyxDQUFDO0lBRW5CLEtBQUssQ0FBQyxPQUFPLENBQUMsVUFBQyxJQUFJO1FBQ2YsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLEVBQUUsRUFBRSwwREFBMEQ7WUFDM0UsY0FBYyxHQUFHLElBQUksQ0FBQztZQUN0QixPQUFPLEtBQUssQ0FBQztTQUNoQjtRQUVELElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDcEMsSUFBSSxPQUFPLENBQUM7UUFFWixPQUFPLFFBQVEsQ0FBQyxNQUFNLEVBQUU7WUFDcEIsT0FBTyxHQUFHLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztZQUMzQixJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxPQUFPLEVBQUUsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLENBQUMsb0RBQW9EO1NBQ3hIO0lBQ0wsQ0FBQyxDQUFDLENBQUM7SUFFSCxJQUFJLGNBQWMsRUFBRTtRQUNoQixPQUFPLFNBQVMsQ0FBQztLQUNwQjtJQUVELElBQUksQ0FBQyxPQUFPLENBQUMsVUFBQyxJQUFJO1FBQ2QsSUFBSSxPQUFPLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUM1QixJQUFJLENBQUMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxFQUFFO1lBQ3BCLE9BQU8sR0FBRyxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDaEMsSUFBSSxDQUFDLE9BQU8sRUFBRTtnQkFDVixPQUFPLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQzthQUN4QjtTQUNKO1FBQ0QsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxPQUFPLENBQUM7UUFDeEIsR0FBRyxHQUFHLE9BQU8sQ0FBQztJQUNsQixDQUFDLENBQUMsQ0FBQztJQUVILE9BQU8sR0FBRyxDQUFDO0FBQ2YsQ0FBQyxDQUFDO0FBRUY7Ozs7RUFJRTtBQUNGLE1BQU0sQ0FBQyxJQUFNLFdBQVcsR0FBRyxVQUFDLE9BQWU7SUFDdkMsSUFBSSxJQUFJLENBQUM7SUFDVCxJQUFJLENBQUMsT0FBTyxFQUFFO1FBQ1YsT0FBTyxRQUFRLENBQUMsTUFBTSxDQUFDO0tBQzFCO0lBQ0QsSUFBSSxHQUFHLE9BQU8sSUFBSSxPQUFPLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDbEUsSUFBSSxHQUFHLElBQUksSUFBSSxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDbEMsSUFBSSxHQUFHLElBQUksS0FBSyxRQUFRLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUM7SUFDbEUsT0FBTyxJQUFJLENBQUM7QUFDaEIsQ0FBQyxDQUFDO0FBRUYsZ0VBQWdFO0FBQ2hFLE1BQU0sQ0FBQyxJQUFNLFlBQVksR0FBRyxVQUFDLElBQVM7SUFDbEMsT0FBTyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMxRSxDQUFDLENBQUM7QUFFRixrREFBa0Q7QUFDbEQsTUFBTSxDQUFDLElBQU0sYUFBYSxHQUFHLFVBQUMsR0FBUTtJQUNsQyxJQUFJLFFBQVEsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUU7UUFDbEMsT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUM7S0FDeEM7SUFDRCxPQUFPLEtBQUssQ0FBQztBQUNqQixDQUFDLENBQUM7QUFFRiwrRUFBK0U7QUFDL0UsTUFBTSxDQUFDLElBQU0sVUFBVSxHQUFHLFVBQUMsR0FBUTtJQUMvQixJQUFNLFFBQVEsR0FBRztRQUNiLFNBQVMsRUFBVyxFQUFFO1FBQ3RCLE9BQU8sRUFBYSxJQUFJO1FBQ3hCLE1BQU0sRUFBYyxJQUFJO1FBQ3hCLFFBQVEsRUFBWSxDQUFDO1FBQ3JCLGtCQUFrQixFQUFFLEVBQUU7UUFDdEIsTUFBTSxFQUFjLEVBQUU7UUFDdEIsTUFBTSxFQUFjLElBQUk7UUFDeEIsZUFBZSxFQUFLLEVBQUU7UUFDdEIsWUFBWSxFQUFRLENBQUM7S0FDeEIsQ0FBQztJQUNGLE9BQU8sQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDN0QsQ0FBQyxDQUFDO0FBRUY7Ozs7Ozs7R0FPRztBQUNILE1BQU0sQ0FBQyxJQUFNLE9BQU8sR0FBRyxVQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsVUFBb0I7SUFDdkQsSUFBSSxLQUFLLEdBQUcsS0FBSyxDQUFDLGVBQWUsQ0FBQztJQUNsQyxJQUFJLENBQUMsUUFBUSxFQUFFO1FBQ1gsT0FBTztLQUNWO0lBQ0QsSUFBSSxVQUFVLEVBQUU7UUFDWixLQUFLLEdBQUcsZUFBZSxDQUFDO0tBQzNCO0lBRUQsT0FBTyxRQUFRLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxVQUFVLEtBQUssRUFBRSxHQUFHO1FBQy9DLE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDM0IsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDLENBQUM7QUFFRix1Q0FBdUM7QUFDdkMsTUFBTSxDQUFDLElBQU0sY0FBYyxHQUFHLFVBQUEsSUFBSTtJQUM5QixJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxFQUFFO1FBQ3ZCLElBQUksR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0tBQ3ZDO0lBQ0QsT0FBTyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxRQUFRLENBQUMsSUFBSSxFQUFFLFFBQVEsQ0FBQyxTQUFTLEVBQUUsUUFBUSxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsYUFBYSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDM0gsQ0FBQyxDQUFDO0FBRUYscUZBQXFGO0FBQ3JGLE1BQU0sQ0FBQyxJQUFNLGtCQUFrQixHQUFHLFVBQUEsR0FBRztJQUNqQyxJQUFJLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLEVBQUUsRUFBRTtRQUN2Qiw4RUFBOEU7UUFDOUUsaUZBQWlGO1FBQ2pGLElBQUksS0FBSyxFQUFFLEVBQUU7WUFDVCxHQUFHLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFDO1NBQ3JFO1FBQ0QsT0FBTyxHQUFHLENBQUM7S0FDZDtJQUNELDhEQUE4RDtJQUM5RCxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFO1FBQ2IsR0FBRyxHQUFHLFFBQVEsQ0FBQyxHQUFHLEVBQUUsRUFBRSxDQUFDLENBQUM7S0FDM0I7U0FBTTtRQUNILGtIQUFrSDtRQUNsSCxJQUFJLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxFQUFFO1lBQzVCLEdBQUcsR0FBRyxNQUFNLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxFQUFFLHVCQUF1QixDQUFDLENBQUM7U0FFdEY7S0FDSjtJQUNELE9BQU8sSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7QUFDM0MsQ0FBQyxDQUFDO0FBRUYsa0RBQWtEO0FBQ2xELE1BQU0sQ0FBQyxJQUFNLG1CQUFtQixHQUFHLFVBQUEsR0FBRztJQUNsQyxHQUFHLEdBQUcsa0JBQWtCLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDOUIsT0FBTyxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUN6QixDQUFDLENBQUM7QUFHRjs7Ozs7O0dBTUc7QUFDSCxNQUFNLENBQUMsSUFBTSxPQUFPLEdBQUcsVUFBQyxHQUFHLEVBQUUsY0FBZTtJQUN4QyxJQUFJLEdBQUcsWUFBWSxJQUFJLEVBQUU7UUFDckIsT0FBTyxHQUFHLENBQUM7S0FDZDtJQUNELElBQU0sT0FBTyxHQUFHLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNsQyxJQUFJLE9BQU8sSUFBSSxPQUFPLFlBQVksTUFBTSxFQUFFO1FBQ3RDLEdBQUcsR0FBRyxJQUFJLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxFQUFDLElBQUksRUFBRSxjQUFjLElBQUksa0JBQWtCLEVBQUMsQ0FBQyxDQUFDO0tBQzNGO1NBQU07UUFDSCxHQUFHLEdBQUcsSUFBSSxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsRUFBRSxFQUFDLElBQUksRUFBRSxjQUFjLElBQUksWUFBWSxFQUFDLENBQUMsQ0FBQztLQUNqRTtJQUNELE9BQU8sR0FBRyxDQUFDO0FBQ2YsQ0FBQyxDQUFDO0FBRUY7Ozs7OztHQU1HO0FBQ0gsTUFBTSxDQUFDLElBQU0saUJBQWlCLEdBQUcsVUFBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLFNBQVM7SUFDbkQsd0RBQXdEO0lBQ3hELDZDQUE2QztJQUM3QyxJQUFJLFVBQVUsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBRTVFLFVBQVUsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7SUFFdkMsT0FBTyxDQUFDLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsVUFBVSxFQUFFLEVBQUUsRUFBRTtRQUM3QyxPQUFPLENBQUMsQ0FBQyxLQUFLLENBQUMsVUFBVSxFQUFFLFVBQVMsRUFBRTtZQUNsQyxJQUFJLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO1lBRWxCLCtFQUErRTtZQUMvRSxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFLGtCQUFrQixDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7Z0JBQzFDLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQzthQUMxQjtpQkFBTTtnQkFDSCxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztnQkFDdEMsR0FBRyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JCLEdBQUcsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO2FBQ3hCO1lBRUQsT0FBTyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUM3QyxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxDQUFDO0FBRUYsSUFBTSxPQUFPLEdBQUcsVUFBQSxRQUFRLElBQUksT0FBQSxRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxFQUFoQyxDQUFnQyxDQUFDOztBQUU3RCx3REFBd0Q7QUFDeEQsSUFBTSxrQkFBa0IsR0FBRyxVQUFBLElBQUksSUFBSSxPQUFBLENBQUMsQ0FBQyxPQUFPLENBQUMsaUJBQWMsSUFBSSxRQUFJLENBQUMsRUFBakMsQ0FBaUMsQ0FBQzs7QUFFckUsb0VBQW9FO0FBQ3BFLElBQU0sZ0JBQWdCLEdBQUcsVUFBQSxJQUFJO0lBQ3pCLElBQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxpQkFBYyxJQUFJLFFBQUksQ0FBQyxDQUFDO0lBQzdDLElBQUksSUFBSSxFQUFFO1FBQ04sSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0tBQ2pCO0FBQ0wsQ0FBQyxDQUFDOztBQUVGLGdDQUFnQztBQUNoQyxNQUFNLENBQUMsSUFBTSxjQUFjLEdBQUcsVUFBQyxHQUFHLEVBQUUsSUFBSTtJQUNwQyxJQUFJLGtCQUFrQixDQUFDLEdBQUcsQ0FBQyxFQUFFO1FBQ3pCLE9BQU87S0FDVjtJQUNELElBQU0sSUFBSSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDNUMsSUFBSSxDQUFDLElBQUksR0FBRyxHQUFHLENBQUM7SUFDaEIsZ0NBQWdDO0lBQ2hDLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxJQUFJLEVBQUU7UUFDbkIsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztLQUM1QztJQUNELElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLFlBQVksQ0FBQyxDQUFDO0lBQ3ZDLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQ3RDLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2hDLE9BQU8sSUFBSSxDQUFDO0FBQ2hCLENBQUMsQ0FBQztBQUVGLCtCQUErQjtBQUMvQixNQUFNLENBQUMsSUFBTSxlQUFlLEdBQUcsVUFBQyxJQUFTO0lBQVQscUJBQUEsRUFBQSxTQUFTO0lBQ3JDLGdFQUFnRTtJQUNoRSxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRTtRQUN0QixJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUNqQjtJQUNELElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDakMsQ0FBQyxDQUFDO0FBRUYsb0RBQW9EO0FBQ3BELElBQU0sY0FBYyxHQUFHLFVBQUEsR0FBRyxJQUFJLE9BQUEsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxrQkFBZSxHQUFHLCtCQUF3QixHQUFHLFFBQUksQ0FBQyxFQUE1RCxDQUE0RCxDQUFDOztBQUUzRixNQUFNLENBQUMsSUFBTSxVQUFVLEdBQUcsVUFBTSxHQUFHOzs7UUFDekIsSUFBSSxHQUFHLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUN4QixJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sSUFBSSxjQUFjLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDdEMsc0JBQU8sT0FBTyxDQUFDLE9BQU8sRUFBRSxFQUFDO1NBQzVCO1FBRUQsc0JBQU8sWUFBWSxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLFVBQUEsSUFBSTtnQkFDckMsSUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDaEQsTUFBTSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUM7Z0JBQzFCLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3RDLENBQUMsQ0FBQyxFQUFDOztLQVNWLENBQUM7QUFFRixNQUFNLENBQUMsSUFBTSxXQUFXLEdBQUcsVUFBTyxJQUFTO0lBQVQscUJBQUEsRUFBQSxTQUFTOzs7Ozs7O29CQUNyQixTQUFBLGlCQUFBLElBQUksQ0FBQTs7OztvQkFBWCxHQUFHO29CQUNWLHFCQUFNLFVBQVUsQ0FBQyxHQUFHLENBQUMsRUFBQTs7b0JBQXJCLFNBQXFCLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7d0JBRTFCLHNCQUFPLE9BQU8sQ0FBQyxPQUFPLEVBQUUsRUFBQzs7OztDQUM1QixDQUFDO0FBRUYsTUFBTSxDQUFDLElBQUksZUFBZSxHQUFRLEVBQUUsQ0FBQztBQUVyQzs7OztHQUlHO0FBQ0gsTUFBTSxDQUFDLElBQU0scUJBQXFCLEdBQUcsVUFBQyxHQUFHLEVBQUUsS0FBSztJQUM1QyxJQUFJLElBQUksR0FBUSxNQUFNLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDLENBQUM7SUFFbEUsSUFBSSxJQUFJLEVBQUU7UUFDTixJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUMzQjtTQUFNO1FBQ0gsSUFBSSxHQUFHLEVBQUUsQ0FBQztLQUNiO0lBQ0QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEtBQUssQ0FBQztJQUVsQixNQUFNLENBQUMsY0FBYyxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUM1RSxDQUFDLENBQUM7QUFFRjs7O0dBR0c7QUFDSCxNQUFNLENBQUMsSUFBTSxxQkFBcUIsR0FBRyxVQUFBLEdBQUc7SUFDcEMsSUFBSSxJQUFJLEdBQUcsTUFBTSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBRTdELElBQUksSUFBSSxFQUFFO1FBQ04sSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDeEIsT0FBTyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDcEI7QUFDTCxDQUFDLENBQUM7QUFFRixNQUFNLENBQUMsSUFBTSxJQUFJLEdBQUc7SUFBQyxjQUFPO1NBQVAsVUFBTyxFQUFQLHFCQUFPLEVBQVAsSUFBTztRQUFQLHlCQUFPOztBQUFNLENBQUMsQ0FBQztBQUVwQyxNQUFNLENBQUMsSUFBTSxPQUFPLEdBQUcsVUFBQSxDQUFDLElBQUksT0FBQSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxFQUFaLENBQVksQ0FBQztBQUV6QyxNQUFNLENBQUMsSUFBTSxRQUFRLEdBQUcsVUFBQSxDQUFDLElBQUksT0FBQSxPQUFPLENBQUMsS0FBSyxRQUFRLEVBQXJCLENBQXFCLENBQUM7QUFFbkQsTUFBTSxDQUFDLElBQU0sUUFBUSxHQUFHLFVBQUEsQ0FBQyxJQUFJLE9BQUEsT0FBTyxDQUFDLEtBQUssUUFBUSxFQUFyQixDQUFxQixDQUFDO0FBRW5EOzs7O0dBSUc7QUFDSCxNQUFNLENBQUMsSUFBTSxhQUFhLEdBQUcsVUFBQyxRQUFRO0lBQ2xDLE9BQU8sSUFBSSxPQUFPLENBQU8sVUFBQyxPQUFPLEVBQUUsTUFBTTtRQUNyQyx3Q0FBd0M7UUFDeEMseUJBQXlCLENBQUMsUUFBUSxFQUFFLFVBQVUsU0FBUztZQUNuRCxTQUFTLENBQUMsSUFBSSxDQUFDLFVBQVUsSUFBSTtnQkFDekIsc0dBQXNHO2dCQUN0RyxJQUFNLE1BQU0sR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFDO2dCQUNoQyxNQUFNLENBQUMsU0FBUyxHQUFHO29CQUNmLElBQU0sT0FBTyxHQUFHLElBQUksSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFO3dCQUN0QyxNQUFNLEVBQUcsSUFBSSxDQUFDLElBQUk7cUJBQ3JCLENBQUMsQ0FBQztvQkFDSCxPQUFPLENBQUMsRUFBQyxNQUFNLEVBQUcsT0FBTyxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUMsQ0FBQyxDQUFDO2dCQUN0RCxDQUFDLENBQUM7Z0JBQ0YsTUFBTSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7Z0JBQ3hCLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNuQyxDQUFDLENBQUMsQ0FBQztRQUNQLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUNmLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxDQUFDO0FBRUYsTUFBTSxDQUFDLElBQU0sVUFBVSxHQUFHO0lBQ3RCLE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUMvQixDQUFDLENBQUM7QUFFRixNQUFNLENBQUMsSUFBTSxZQUFZLEdBQUc7SUFDeEIsYUFBYSxFQUFFLFVBQVU7Q0FDNUIsQ0FBRTtBQUVILE1BQU0sQ0FBQyxJQUFNLFFBQVEsR0FBRyxVQUFDLElBQVksRUFBRSxNQUF3QjtJQUF4Qix1QkFBQSxFQUFBLGdCQUF3QjtJQUMzRCxJQUFLLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxFQUFFO1FBQzFDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0tBQ3hCO1NBQU07UUFDSCxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztLQUM3QjtBQUNMLENBQUMsQ0FBQztBQUdGLGtEQUFrRDtBQUNsRCxNQUFNLENBQUMsSUFBTSxZQUFZLEdBQUcsVUFBQyxRQUFRLEVBQUUsR0FBVyxFQUFFLE1BQXVCLEVBQUUsT0FBUSxFQUFFLEtBQU07SUFBekMsdUJBQUEsRUFBQSxjQUF1QjtJQUN2RSxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsQ0FBQyxNQUFNLEVBQUMsQ0FBQztTQUNyRSxJQUFJLENBQUMsVUFBQSxRQUFRLElBQUksT0FBQSxPQUFPLElBQUksT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUE1QixDQUE0QixDQUFDO1NBQzlDLElBQUksQ0FBQyxVQUFBLE1BQU0sSUFBSSxPQUFBLEtBQUssSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQXRCLENBQXNCLENBQUMsQ0FBQztBQUNoRCxDQUFDLENBQUM7QUFFRjs7OztHQUlHO0FBQ0gsTUFBTSxDQUFDLElBQU0sU0FBUyxHQUFHLFVBQUksQ0FBaUI7SUFDMUMsSUFBSSxDQUFDLFlBQVksT0FBTyxFQUFFO1FBQ3RCLE9BQU8sQ0FBQyxDQUFDO0tBQ1o7U0FBTTtRQUNILE9BQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFNLENBQUMsQ0FBQztLQUNsQztBQUNMLENBQUMsQ0FBQztBQUVGOzs7Ozs7Ozs7Ozs7R0FZRztBQUNILE1BQU0sQ0FBQyxJQUFNLFlBQVksR0FBRyxVQUFDLEVBQWEsRUFBRSxRQUFnQixFQUFFLFVBQWtCLEVBQUUsYUFBNEM7SUFBNUMsOEJBQUEsRUFBQSw4QkFBc0IsT0FBQSxPQUFPLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUF0QixDQUFzQjtJQUMxSCxJQUFJLFVBQVUsR0FBRyxDQUFDLENBQUM7SUFDbkIsSUFBTSxLQUFLLEdBQUc7UUFDVixVQUFVLEVBQUUsQ0FBQztRQUNiLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsRUFBRTtZQUNsQixPQUFPLEVBQUUsRUFBRSxDQUFDO1NBQ2Y7SUFDTCxDQUFDLENBQUM7SUFDRixVQUFVLEdBQUcsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxJQUFJLFVBQVUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDekUsUUFBUSxHQUFHLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFBSSxRQUFRLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2pFLE9BQU8sSUFBSSxPQUFPLENBQUMsVUFBQyxPQUFPLEVBQUUsTUFBTTtRQUMvQixJQUFNLE9BQU8sR0FBRztZQUNaLElBQU0sT0FBTyxHQUFHLFNBQVMsQ0FBQztZQUMxQixVQUFVLENBQUM7Z0JBQ1AsU0FBUyxDQUFVLGFBQWEsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsS0FBSztvQkFDcEQsSUFBSSxLQUFLLEtBQUssS0FBSyxJQUFJLENBQUMsQ0FBQyxVQUFVLElBQUksVUFBVSxJQUFJLFVBQVUsQ0FBQyxFQUFFO3dCQUM5RCxTQUFTLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO3FCQUM3Qzt5QkFBTTt3QkFDSCxNQUFNLENBQUMsT0FBTyxDQUFDLENBQUM7cUJBQ25CO2dCQUNMLENBQUMsRUFBRSxjQUFNLE9BQUEsTUFBTSxDQUFDLE9BQU8sQ0FBQyxFQUFmLENBQWUsQ0FBQyxDQUFDO1lBQzlCLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQztRQUNqQixDQUFDLENBQUM7UUFDRixTQUFTLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQzlDLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQyxDQUFDO0FBRUY7OztHQUdHO0FBQ0gsTUFBTSxDQUFDLElBQU0saUJBQWlCLEdBQUc7SUFDN0IsSUFBTSxNQUFNLEdBQVE7UUFDaEIsT0FBTyxFQUFFLElBQUk7UUFDYixNQUFNLEVBQUUsSUFBSTtRQUNaLE9BQU8sRUFBRSxJQUFJO1FBQ2IsT0FBTyxFQUFFLGNBQU8sQ0FBQztRQUNqQixTQUFTLEVBQUUsS0FBSztLQUNuQixDQUFDO0lBQ0YsTUFBTSxDQUFDLE9BQU8sR0FBRyxJQUFJLE9BQU8sQ0FBQyxVQUFDLE9BQU8sRUFBRSxNQUFNO1FBQ3pDLE1BQU0sQ0FBQyxPQUFPLEdBQUcsT0FBTyxDQUFDO1FBQ3pCLE1BQU0sQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0lBQzNCLENBQUMsQ0FBQyxDQUFDO0lBQ0gsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLEdBQUc7UUFDbkIsU0FBUyxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUMxQixNQUFNLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3pCLE1BQU0sQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO0lBQzVCLENBQUMsQ0FBQztJQUNGLE9BQU8sTUFBTSxDQUFDO0FBQ2xCLENBQUMsQ0FBQztBQUVGLE1BQU0sQ0FBQyxJQUFNLGFBQWEsR0FBRyxVQUFDLFlBQW9CLEVBQUUsS0FBYTtJQUM3RCxJQUFNLFVBQVUsR0FBRyxRQUFRLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzNDLFVBQVUsQ0FBQyxVQUFVLENBQUksWUFBWSxXQUFNLEtBQUssT0FBSSxDQUFDLENBQUM7QUFDMUQsQ0FBQyxDQUFDO0FBRUYsTUFBTSxDQUFDLElBQU0sWUFBWSxHQUFHLFVBQUMsSUFBSTtJQUM3QixJQUFNLE1BQU0sR0FBRyxFQUFFLENBQUM7SUFDbEIsMkVBQTJFO0lBQzNFLElBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDaEMsSUFBSSxLQUFLLEtBQUssQ0FBQyxDQUFDLEVBQUU7UUFDZCxJQUFNLFdBQVcsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFHLENBQUMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDekUsV0FBVyxDQUFDLE9BQU8sQ0FBQyxVQUFDLEtBQUs7WUFDdEIsS0FBSyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBQzVCLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDaEMsQ0FBQyxDQUFDLENBQUM7S0FDTjtJQUNELE9BQU8sTUFBTSxDQUFDO0FBQ2xCLENBQUMsQ0FBQztBQUVGLE1BQU0sQ0FBQyxJQUFNLG9CQUFvQixHQUFHLFVBQUMsSUFBSTtJQUNyQyxJQUFJLEdBQUksSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUM7SUFDaEMsSUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNoQyxJQUFJLEtBQUssS0FBSyxDQUFDLENBQUMsRUFBRTtRQUNkLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsQ0FBQztLQUNuQztJQUNELE9BQU8sSUFBSSxDQUFDO0FBQ2hCLENBQUMsQ0FBQztBQUVGLE1BQU0sQ0FBQyxJQUFNLGNBQWMsR0FBRyxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUVyRixNQUFNLENBQUMsSUFBTSxLQUFLLEdBQUc7SUFDakIsSUFBTSxDQUFDLEdBQUc7UUFDRixPQUFPLEVBQUUsSUFBSTtRQUNiLE9BQU8sRUFBRSxJQUFJO1FBQ2IsTUFBTSxFQUFHLElBQUk7S0FDaEIsQ0FBQztJQUNOLENBQUMsQ0FBQyxPQUFPLEdBQUcsSUFBSSxPQUFPLENBQUMsVUFBQyxPQUFPLEVBQUUsTUFBTTtRQUNwQyxDQUFDLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztRQUNwQixDQUFDLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztJQUN0QixDQUFDLENBQUMsQ0FBQztJQUNILE9BQU8sQ0FBQyxDQUFDO0FBQ2IsQ0FBQyxDQUFDO0FBRUY7OztHQUdHO0FBQ0gsTUFBTSxDQUFDLElBQU0sbUJBQW1CLEdBQUcsVUFBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLENBQUUsRUFBRSxDQUFFO0lBQ2pELENBQUMsR0FBRyxDQUFDLElBQUksS0FBSyxFQUFFLENBQUM7SUFDakIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDWCxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUU7UUFDVCxHQUFHLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsVUFBVSxFQUFFO1lBQzVCLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1FBQ2hELENBQUMsQ0FBQyxDQUFDO0tBQ047SUFDRCxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsR0FBRyxDQUFDLE1BQU0sRUFBRTtRQUN2QixJQUFJO1lBQ0EsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQyxDQUFDO2lCQUNuQyxJQUFJLENBQUMsY0FBTSxPQUFBLG1CQUFtQixDQUFDLEdBQUcsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBeEMsQ0FBd0MsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7U0FDdkU7UUFBQyxPQUFPLENBQUMsRUFBRTtZQUNSLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDZjtLQUNKO1NBQU07UUFDSCxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDZjtJQUNELE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQztBQUNyQixDQUFDLENBQUM7QUFFRjs7OztHQUlHO0FBQ0gsTUFBTSxDQUFDLElBQU0saUJBQWlCLEdBQUcsVUFBQyxFQUFFLEVBQUUsRUFBRTtJQUNwQyxPQUFPLEVBQUUsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxxQkFBcUIsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxxQkFBcUIsQ0FBQztRQUN4SCxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxzQkFBc0IsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLENBQUM7QUFDaEksQ0FBQyxDQUFDO0FBRUY7Ozs7O0dBS0c7QUFDSCxNQUFNLENBQUMsSUFBTSxxQkFBcUIsR0FBRyxVQUFDLEVBQUUsRUFBRSxHQUFHO0lBQ3pDLE9BQU8sRUFBRSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLHNCQUFzQixDQUFDLEtBQUssR0FBRyxDQUFDO0FBQzNFLENBQUMsQ0FBQztBQUVGOzs7OztHQUtHO0FBQ0gsTUFBTSxDQUFDLElBQU0sd0JBQXdCLEdBQUcsVUFBQyxPQUFPLEVBQUUsaUJBQWlCO0lBQy9ELElBQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLHVCQUF1QixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQztJQUMzRyxJQUFNLE9BQU8sR0FBRyxJQUFJLE9BQU8sRUFBRSxDQUFDO0lBRTlCLElBQU0sYUFBYSxHQUFHLFVBQUMsR0FBRyxFQUFFLGFBQWE7UUFDckMsSUFBSSxnQkFBZ0IsQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLEVBQUUsT0FBTyxDQUFDLEVBQUU7WUFDL0MsU0FBUyxDQUNMLE1BQU0sQ0FBQyxHQUFHLENBQUMsYUFBYSxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsRUFBRSxPQUFPLEVBQUUsRUFBRSxFQUFFLFVBQUMsTUFBTSxFQUFFLE1BQU07Z0JBQ3hFLElBQUksQ0FBQyxNQUFNLEtBQUssTUFBTSxJQUFJLENBQUMsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUU7b0JBQ25HLE9BQU87aUJBQ1Y7Z0JBQ0QsK0JBQStCO2dCQUMvQixJQUFJLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUU7b0JBQ3pDLE1BQU0sR0FBRyxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUM7aUJBQ3BDO2dCQUNELGlGQUFpRjtnQkFDakYsSUFBSSxHQUFHLENBQUMsTUFBTSxLQUFLLGFBQWEsRUFBRTtvQkFDOUIsMENBQTBDO29CQUMxQyxpQkFBaUIsQ0FBQyxLQUFLLEdBQUcsRUFBRSxDQUFDO29CQUM3QixrQ0FBa0M7b0JBQ2xDLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLFVBQVMsS0FBSyxFQUFFLE1BQU07d0JBQ3BDLGlCQUFpQixDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7NEJBQ3pCLFFBQVEsRUFBRSxNQUFNOzRCQUNoQixPQUFPLEVBQUUsS0FBSzs0QkFDZCxXQUFXLEVBQUUsR0FBRyxDQUFDLFNBQVMsSUFBSSxpQkFBaUI7NEJBQy9DLFVBQVUsRUFBRSxLQUFLOzRCQUNqQixNQUFNLEVBQUUsRUFBRTt5QkFDYixDQUFDLENBQUM7b0JBQ1AsQ0FBQyxDQUFDLENBQUM7aUJBQ047cUJBQU07b0JBQ0gsaUNBQWlDO29CQUNqQyxHQUFHLENBQUMsYUFBYSxDQUFDLEdBQUcsTUFBTSxDQUFDO2lCQUMvQjtnQkFDRCxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUMsaUJBQWlCLG1CQUFBLEVBQUUsTUFBTSxRQUFBLEVBQUMsQ0FBQyxDQUFDO1lBQzlDLENBQUMsQ0FBQyxDQUNMLENBQUM7U0FDTDtJQUNMLENBQUMsQ0FBQztJQUVGLElBQU0seUJBQXlCLEdBQUcsVUFBQSxXQUFXO1FBQ3pDLElBQUksV0FBVyxDQUFDLEtBQUssRUFBRTtZQUNuQixDQUFDLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxLQUFLLEVBQUUsVUFBQyxTQUFTLEVBQUUsQ0FBQztnQkFDdEMsSUFBSSxTQUFTLENBQUMsS0FBSyxFQUFFO29CQUNqQix5QkFBeUIsQ0FBQyxTQUFTLENBQUMsQ0FBQztpQkFDeEM7cUJBQU07b0JBQ0gsSUFBSSxTQUFTLENBQUMsU0FBUyxLQUFLLFNBQVMsRUFBRTt3QkFDbkMsYUFBYSxDQUFDLFNBQVMsRUFBRSxhQUFhLENBQUMsQ0FBQztxQkFDM0M7b0JBQ0QsYUFBYSxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsQ0FBQztpQkFDckM7WUFDTCxDQUFDLENBQUMsQ0FBQztTQUNOO0lBQ0wsQ0FBQyxDQUFDO0lBQ0YseUJBQXlCLENBQUMsaUJBQWlCLENBQUMsQ0FBQztJQUU3QyxPQUFPLE9BQU8sQ0FBQztBQUNuQixDQUFDLENBQUM7QUFFRixxREFBcUQ7QUFDckQsTUFBTSxDQUFDLElBQU0sV0FBVyxHQUFHLFVBQUMsTUFBTSxFQUFFLEtBQUs7SUFDckMsSUFBSSxNQUFNLEdBQUcsTUFBTSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUMzQyxPQUFPLE1BQU0sQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUMsV0FBVyxLQUFLLE1BQU0sRUFBRTtRQUN6RCxNQUFNLEdBQUcsTUFBTSxDQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN2QyxpRkFBaUY7UUFDakYsSUFBSSxLQUFLLEtBQUssTUFBTSxFQUFFO1lBQ2xCLE9BQU87U0FDVjtLQUNKO0lBQ0QsTUFBTSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFDekMsQ0FBQyxDQUFDO0FBRUYsTUFBTSxDQUFDLElBQU0sa0JBQWtCLEdBQUcsVUFBVSxHQUFHO0lBQzNDLElBQU0sV0FBVyxHQUFHLGtDQUFrQyxDQUFDO0lBQ3ZELElBQUksQ0FBQyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRTtRQUNqQjs7O1lBR0k7UUFDSixJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLFVBQVUsQ0FBQyxJQUFJLFdBQVcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDeEQsT0FBTyxHQUFHLENBQUM7U0FDZDtRQUNELE9BQU8sR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLE1BQU0sQ0FBQyxlQUFlLEVBQUUsR0FBRyxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7S0FDOUQ7QUFDTCxDQUFDLENBQUM7QUFFRixDQUFDLENBQUMsWUFBWSxHQUFHLENBQUM7SUFDZCxJQUFNLFVBQVUsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO0lBQzdCLElBQU0sUUFBUSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7SUFFM0IsSUFBTSxZQUFZLEdBQUcsVUFBQSxHQUFHLElBQUksT0FBQSxVQUFVLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFuQixDQUFtQixDQUFDO0lBQ2hELElBQU0sVUFBVSxHQUFHLFVBQUEsR0FBRyxJQUFJLE9BQUEsUUFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFBakIsQ0FBaUIsQ0FBQztJQUM1QyxJQUFNLE1BQU0sR0FBRyxVQUFBLEdBQUc7UUFDZCxRQUFRLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ2xCLFVBQVUsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDOUIsVUFBVSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUMzQixDQUFDLENBQUM7SUFFRixJQUFNLGFBQWEsR0FBRyxVQUFBLEdBQUc7UUFDckIsSUFBSSxLQUFLLENBQUM7UUFDVixJQUFJLEtBQUssQ0FBQztRQUNWLElBQU0sT0FBTyxHQUFRLElBQUksT0FBTyxDQUFDLFVBQUMsR0FBRyxFQUFFLEdBQUc7WUFDdEMsS0FBSyxHQUFHLEdBQUcsQ0FBQztZQUNaLEtBQUssR0FBRyxHQUFHLENBQUM7UUFDaEIsQ0FBQyxDQUFDLENBQUM7UUFFSCxPQUFPLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztRQUN4QixPQUFPLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztRQUV2QixVQUFVLENBQUMsR0FBRyxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNqQyxDQUFDLENBQUM7SUFFRixPQUFPLFVBQVUsR0FBRztRQUNoQixJQUFJLFVBQVUsQ0FBQyxHQUFHLENBQUMsRUFBRTtZQUNqQixPQUFPLE9BQU8sQ0FBQyxPQUFPLEVBQUUsQ0FBQztTQUM1QjtRQUVELElBQUksWUFBWSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQ25CLE9BQU8sVUFBVSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUM5QjtRQUVELGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUVuQixJQUFNLE9BQU8sR0FBRztZQUNaLFFBQVEsRUFBRSxRQUFRO1lBQ2xCLEtBQUssRUFBRSxJQUFJO1lBQ1gsR0FBRyxLQUFBO1NBQ04sQ0FBQztRQUVGLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQU0sT0FBQSxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQVgsQ0FBVyxDQUFDLENBQUM7UUFFeEMsT0FBTyxVQUFVLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQy9CLENBQUMsQ0FBQztBQUNOLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFFTCxJQUFNLHVCQUF1QixHQUFHO0lBQzVCLElBQUksRUFBRyxZQUFZO0lBQ25CLElBQUksRUFBRyxTQUFTO0lBQ2hCLFNBQVMsRUFBRyx1QkFBdUI7SUFDbkMsUUFBUSxFQUFHLHVCQUF1QjtDQUNyQyxDQUFDO0FBQ0YsNkRBQTZEO0FBQzdELE1BQU0sQ0FBQyxJQUFNLHdCQUF3QixHQUFHLFVBQUEsSUFBSTtJQUN4QyxPQUFPLHVCQUF1QixDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUNwRCxDQUFDLENBQUM7QUFFRixrSEFBa0g7QUFDbEgsTUFBTSxDQUFDLElBQU0sa0JBQWtCLEdBQUcsVUFBQyxPQUFvQjtJQUNuRCxJQUFNLE9BQU8sR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUMscUJBQXFCLENBQUMsQ0FBQztJQUNoRSxJQUFJLE9BQU8sR0FBRyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUN6RCxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRTtRQUNqQixPQUFPLEdBQUcsT0FBTyxDQUFDLGdCQUFnQixDQUFDLHlCQUF5QixDQUFDLENBQUM7S0FDakU7SUFDRCx3RUFBd0U7SUFDeEUsSUFBSSxPQUFPLENBQUMsTUFBTSxJQUFJLE9BQU8sQ0FBQyxNQUFNLEVBQUU7UUFDbEMsSUFBTSxRQUFRLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQWdCLENBQUMsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1FBQ3ZGLElBQUksUUFBUSxFQUFFO1lBQ1YsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQWdCLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQ25ELE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFnQixFQUFFLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQztTQUN2RDtLQUNKO0FBQ0wsQ0FBQyxDQUFDO0FBRUY7Ozs7Ozs7O0dBUUc7QUFDSCxNQUFNLENBQUMsSUFBTSx1QkFBdUIsR0FBRyxVQUFDLGFBQWEsRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFFLEdBQUk7SUFDeEUsSUFBTSxlQUFlLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7SUFDdEcsSUFBTSxjQUFjLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sRUFBRSxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUM7SUFDM0QsSUFBTSxjQUFjLEdBQUcsVUFBVSxDQUFDLHFCQUFxQixFQUFFLENBQUM7SUFDMUQsSUFBTSxTQUFTLEdBQUcsY0FBYyxDQUFDLEdBQUcsR0FBRyxNQUFNLENBQUMsT0FBTyxDQUFDO0lBRXRELDJEQUEyRDtJQUMzRCxJQUFJLGNBQWMsR0FBRyxDQUFDLFNBQVMsR0FBRyxjQUFjLENBQUMsTUFBTSxDQUFDLEdBQUcsZUFBZSxFQUFFO1FBQ3hFLElBQU0sUUFBTSxHQUFHLFNBQVMsR0FBRyxlQUFlLENBQUM7UUFDM0MsR0FBRyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDO1lBQzNCLGFBQWEsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFHLFFBQU0sR0FBRyxJQUFJLENBQUMsQ0FBQztRQUM3QyxDQUFDLENBQUMsQ0FBQztLQUNOO0FBRUwsQ0FBQyxDQUFDO0FBRUYsMEJBQTBCO0FBQzFCLE1BQU0sQ0FBQyxJQUFNLFlBQVksR0FBRyxVQUFDLE9BQU87SUFDaEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUMsTUFBTSxFQUFFO1FBQ3pDLElBQU0sZUFBZSxHQUFHLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1FBQzFFLENBQUMsQ0FBQyxPQUFPLENBQUMsZUFBZSxFQUFFLFVBQUMsR0FBRztZQUMzQixJQUFJLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFO2dCQUNuQixHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7YUFDN0I7UUFDTCxDQUFDLENBQUMsQ0FBQztLQUNOO0FBQ0wsQ0FBQyxDQUFDO0FBRUY7Ozs7O0dBS0c7QUFDSCxNQUFNLENBQUMsSUFBTSxhQUFhLEdBQUcsVUFBVSxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgU3ViamVjdCB9IGZyb20gJ3J4anMnO1xuXG5pbXBvcnQgeyBnZXRXbVByb2plY3RQcm9wZXJ0aWVzIH0gZnJvbSAnLi93bS1wcm9qZWN0LXByb3BlcnRpZXMnO1xuXG5pbXBvcnQgeyAkd2F0Y2gsICRhcHBEaWdlc3QgfSBmcm9tICcuL3dhdGNoZXInO1xuaW1wb3J0IHsgRGF0YVR5cGUgfSBmcm9tICcuLi9lbnVtcy9lbnVtcyc7XG5pbXBvcnQgeyBEYXRhU291cmNlIH0gZnJvbSAnLi4vdHlwZXMvdHlwZXMnO1xuaW1wb3J0IHsgc2V0QXR0ciB9IGZyb20gJy4vZG9tJztcblxuZGVjbGFyZSBjb25zdCBfLCBYMkpTO1xuZGVjbGFyZSBjb25zdCBtb21lbnQ7XG5kZWNsYXJlIGNvbnN0IGRvY3VtZW50O1xuZGVjbGFyZSBjb25zdCByZXNvbHZlTG9jYWxGaWxlU3lzdGVtVVJMO1xuZGVjbGFyZSBjb25zdCAkO1xuXG5jb25zdCB1c2VyQWdlbnQgPSB3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudDtcbmNvbnN0IFJFR0VYID0ge1xuICAgIFNOQUtFX0NBU0U6IC9bQS1aXS9nLFxuICAgIEFORFJPSUQ6IC9BbmRyb2lkL2ksXG4gICAgSVBIT05FOiAvaVBob25lL2ksXG4gICAgSVBPRDogL2lQb2QvaSxcbiAgICBJUEFEOiAvaVBhZC9pLFxuICAgIEFORFJPSURfVEFCTEVUOiAvYW5kcm9pZHxhbmRyb2lkIDMuMHx4b29tfHNjaC1pODAwfHBsYXlib29rfHRhYmxldHxraW5kbGUvaSxcbiAgICBNT0JJTEU6IC9Nb2JpbGUvaSxcbiAgICBXSU5ET1dTOiAvV2luZG93cyBQaG9uZS9pLFxuICAgIFNVUFBPUlRFRF9JTUFHRV9GT1JNQVQ6IC9cXC4oYm1wfGdpZnxqcGV8anBnfGpwZWd8dGlmfHRpZmZ8cGJtfHBuZ3xpY28pJC9pLFxuICAgIFNVUFBPUlRFRF9GSUxFX0ZPUk1BVDogL1xcLih0eHR8anN8Y3NzfGh0bWx8c2NyaXB0fHByb3BlcnRpZXN8anNvbnxqYXZhfHhtbHxzbWR8eG1pfHNxbHxsb2d8d3NkbHx2bXxmdGx8anJ4bWx8eW1sfHlhbWx8bWR8bGVzc3xqc3ApJC9pLFxuICAgIFNVUFBPUlRFRF9BVURJT19GT1JNQVQ6IC9cXC4obXAzfG9nZ3x3ZWJtfHdtYXwzZ3B8d2F2fG00YSkkL2ksXG4gICAgU1VQUE9SVEVEX1ZJREVPX0ZPUk1BVDogL1xcLihtcDR8b2dnfHdlYm18d212fG1wZWd8bXBnfGF2aSkkL2ksXG4gICAgUEFHRV9SRVNPVVJDRV9QQVRIOiAvXlxcL3BhZ2VzXFwvLipcXC4oanN8Y3NzfGh0bWx8anNvbikkLyxcbiAgICBNSU5fUEFHRV9SRVNPVVJDRV9QQVRIOiAvLioocGFnZS5taW4uaHRtbCkkLyxcbiAgICBWQUxJRF9FTUFJTDogL15bYS16QS1aXVtcXHcuK10rQFthLXpBLVpfXSs/XFwuW2EtekEtWi5dezEsNH1bYS16QS1aXSQvLFxuICAgIFZBTElEX1dFQl9VUkw6IC9eKGh0dHBbc10/OlxcL1xcLykod3d3XFwuKXswLDF9W2EtekEtWjAtOT06P1xcL1xcLlxcLV0rKFxcLlthLXpBLVpdezIsNX1bXFwuXXswLDF9KT8vLFxuICAgIFZBTElEX1dFQlNPQ0tFVF9VUkw6IC9eKHdzW3NdPzpcXC9cXC8pKHd3d1xcLil7MCwxfVthLXpBLVowLTk9Oj9cXC9cXC5cXC1dKyhcXC5bYS16QS1aXXsyLDV9W1xcLl17MCwxfSk/LyxcbiAgICBWQUxJRF9SRUxBVElWRV9VUkw6IC9eKD8hd3d3XFwufCg/Omh0dHB8ZnRwKXM/OlxcL1xcL3xbQS1aYS16XTpcXFxcfFxcL1xcLykuKi8sXG4gICAgUkVQTEFDRV9QQVRURVJOOiAvXFwkXFx7KFteXFx9XSspXFx9L2csXG4gICAgWklQX0ZJTEU6IC9cXC56aXAkL2ksXG4gICAgRVhFX0ZJTEU6IC9cXC5leGUkL2ksXG4gICAgTk9fUVVPVEVTX0FMTE9XRUQ6IC9eW14nfFwiXSokLyxcbiAgICBOT19ET1VCTEVfUVVPVEVTX0FMTE9XRUQ6IC9eW15cIl0qJC8sXG4gICAgVkFMSURfSFRNTDogLzxbYS16XVtcXHNcXFNdKj4vaSxcbiAgICBWQUxJRF9QQVNTV09SRDogL15bMC05YS16QS1aLV8uQCYqISMkJV0rJC8sXG4gICAgU1BFQ0lBTF9DSEFSQUNURVJTOiAvW15BLVowLTlhLXpfXSsvaSxcbiAgICBBUFBfU0VSVkVSX1VSTF9GT1JNQVQ6IC9eKGh0dHBbc10/OlxcL1xcLykod3d3XFwuKXswLDF9W2EtekEtWjAtOVxcLlxcLV0rKFs6XT9bMC05XXsyLDV9fFxcLlthLXpBLVpdezIsNX1bXFwuXXswLDF9KVxcLytbXj8jJj1dKyQvLFxuICAgIEpTT05fREFURV9GT1JNQVQ6IC9cXGR7NH0tWzAtMV1cXGQtWzAtM11cXGQoVFswLTJdXFxkOlswLTVdXFxkOlswLTVdXFxkLlxcZHsxLDN9WiQpPy9cbn0sXG4gICAgY29tcGFyZUJ5U2VwYXJhdG9yID0gJzonO1xuXG5jb25zdCBOVU1CRVJfVFlQRVMgPSBbJ2ludCcsIERhdGFUeXBlLklOVEVHRVIsIERhdGFUeXBlLkZMT0FULCBEYXRhVHlwZS5ET1VCTEUsIERhdGFUeXBlLkxPTkcsIERhdGFUeXBlLlNIT1JULCBEYXRhVHlwZS5CWVRFLCBEYXRhVHlwZS5CSUdfSU5URUdFUiwgRGF0YVR5cGUuQklHX0RFQ0lNQUxdO1xuY29uc3Qgbm93OiBEYXRlID0gbmV3IERhdGUoKTtcbmNvbnN0IENVUlJFTlRfREFURSA9ICdDVVJSRU5UX0RBVEUnO1xuXG5leHBvcnQgY29uc3QgZW51bSBFVkVOVF9MSUZFIHtPTkNFLCBXSU5ET1d9XG5cbmV4cG9ydCBjb25zdCBpc0RlZmluZWQgPSB2ID0+ICd1bmRlZmluZWQnICE9PSB0eXBlb2YgdjtcblxuZXhwb3J0IGNvbnN0IGlzT2JqZWN0ID0gdiA9PiBudWxsICE9PSB2ICYmICdvYmplY3QnID09PSB0eXBlb2YgdjtcblxuZXhwb3J0IGNvbnN0IHRvQm9vbGVhbiA9ICh2YWwsIGlkZW50aXR5PykgPT4gKCh2YWwgJiYgdmFsICE9PSAnZmFsc2UnKSA/IHRydWUgOiAoaWRlbnRpdHkgPyB2YWwgPT09IGlkZW50aXR5IDogZmFsc2UpKTtcblxuZnVuY3Rpb24gaXNJRTExICgpIHtcbiAgICByZXR1cm4gd2luZG93Lm5hdmlnYXRvci5hcHBWZXJzaW9uLmluZGV4T2YoJ1RyaWRlbnQvJykgPiAtMTtcbn1cblxuZXhwb3J0IGNvbnN0IGlzSUUgPSAoKSA9PiB7XG4gICAgcmV0dXJuIGlzSUUxMSgpIHx8IHdpbmRvdy5uYXZpZ2F0b3IudXNlckFnZW50LmluZGV4T2YoJ01TSUUnKSA+IC0xO1xufTtcblxuXG5leHBvcnQgY29uc3QgaXNBbmRyb2lkID0gKCkgPT4gUkVHRVguQU5EUk9JRC50ZXN0KHVzZXJBZ2VudCk7XG5cbmV4cG9ydCBjb25zdCBpc0FuZHJvaWRUYWJsZXQgPSAoKSA9PiBSRUdFWC5BTkRST0lEX1RBQkxFVC50ZXN0KHVzZXJBZ2VudCk7XG5cbmV4cG9ydCBjb25zdCBpc0lwaG9uZSA9ICgpID0+IFJFR0VYLklQSE9ORS50ZXN0KHVzZXJBZ2VudCk7XG5leHBvcnQgY29uc3QgaXNJcG9kID0gKCkgPT4gUkVHRVguSVBPRC50ZXN0KHVzZXJBZ2VudCk7XG5leHBvcnQgY29uc3QgaXNJcGFkID0gKCkgPT4gUkVHRVguSVBBRC50ZXN0KHVzZXJBZ2VudCk7XG5leHBvcnQgY29uc3QgaXNJb3MgPSAoKSA9PiBpc0lwaG9uZSgpIHx8IGlzSXBvZCgpIHx8IGlzSXBhZCgpO1xuXG5leHBvcnQgY29uc3QgaXNNb2JpbGUgPSAoKSA9PiBpc0FuZHJvaWQoKSB8fCBpc0lvcygpIHx8IGlzQW5kcm9pZFRhYmxldCgpIHx8ICQoJyN3bS1tb2JpbGUtZGlzcGxheTp2aXNpYmxlJykubGVuZ3RoID4gMDtcblxuZXhwb3J0IGNvbnN0IGlzTW9iaWxlQXBwID0gKCkgPT4gZ2V0V21Qcm9qZWN0UHJvcGVydGllcygpLnBsYXRmb3JtVHlwZSA9PT0gJ01PQklMRScgJiYgZ2V0V21Qcm9qZWN0UHJvcGVydGllcygpLnR5cGUgPT09ICdBUFBMSUNBVElPTic7XG5cbmV4cG9ydCBjb25zdCBnZXRBbmRyb2lkVmVyc2lvbiA9ICgpID0+IHtcbiAgICBjb25zdCBtYXRjaCA9ICh3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpKS5tYXRjaCgvYW5kcm9pZFxccyhbMC05XFwuXSopLyk7XG4gICAgcmV0dXJuIG1hdGNoID8gbWF0Y2hbMV0gOiAnJztcbn07XG5cbmV4cG9ydCBjb25zdCBpc0tpdGthdERldmljZSA9ICgpID0+IGlzQW5kcm9pZCgpICYmIHBhcnNlSW50KGdldEFuZHJvaWRWZXJzaW9uKCksIDEwKSA9PT0gNDtcblxuLyoqXG4gKiB0aGlzIG1ldGhvZCBlbmNvZGVzIHRoZSB1cmwgYW5kIHJldHVybnMgdGhlIGVuY29kZWQgc3RyaW5nXG4gKi9cbmV4cG9ydCBjb25zdCBlbmNvZGVVcmwgPSAodXJsOiBzdHJpbmcpOiBzdHJpbmcgPT4ge1xuICAgIGNvbnN0IGluZGV4ID0gdXJsLmluZGV4T2YoJz8nKTtcbiAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICAvLyBlbmNvZGUgdGhlIHJlbGF0aXZlIHBhdGhcbiAgICAgICAgdXJsID0gZW5jb2RlVVJJKHVybC5zdWJzdHJpbmcoMCwgaW5kZXgpKSArIHVybC5zdWJzdHJpbmcoaW5kZXgpO1xuICAgICAgICAvLyBlbmNvZGUgdXJsIHBhcmFtcywgbm90IGVuY29kZWQgdGhyb3VnaCBlbmNvZGVVUklcbiAgICAgICAgdXJsID0gZW5jb2RlVXJsUGFyYW1zKHVybCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdXJsID0gZW5jb2RlVVJJKHVybCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHVybDtcbn07XG5cbi8qKlxuICogdGhpcyBtZXRob2QgZW5jb2RlcyB0aGUgdXJsIHBhcmFtcyBhbmQgaXMgcHJpdmF0ZSB0byB0aGUgY2xhc3Mgb25seVxuICovXG5leHBvcnQgY29uc3QgZW5jb2RlVXJsUGFyYW1zID0gKHVybDogc3RyaW5nKTogc3RyaW5nID0+IHtcbiAgICBsZXQgcXVlcnlQYXJhbXMsIGVuY29kZWRQYXJhbXMgPSAnJywgcXVlcnlQYXJhbXNTdHJpbmcsIGluZGV4O1xuICAgIGluZGV4ID0gdXJsLmluZGV4T2YoJz8nKTtcbiAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICBpbmRleCArPSAxO1xuICAgICAgICBxdWVyeVBhcmFtc1N0cmluZyA9IHVybC5zdWJzdHJpbmcoaW5kZXgpO1xuICAgICAgICAvLyBFbmNvZGluZyB0aGUgcXVlcnkgcGFyYW1zIGlmIGV4aXN0XG4gICAgICAgIGlmIChxdWVyeVBhcmFtc1N0cmluZykge1xuICAgICAgICAgICAgcXVlcnlQYXJhbXMgPSBxdWVyeVBhcmFtc1N0cmluZy5zcGxpdCgnJicpO1xuICAgICAgICAgICAgcXVlcnlQYXJhbXMuZm9yRWFjaChmdW5jdGlvbiAocGFyYW0pIHtcbiAgICAgICAgICAgICAgICBsZXQgZGVjb2RlZFBhcmFtVmFsdWU7XG4gICAgICAgICAgICAgICAgY29uc3QgaSA9IF8uaW5jbHVkZXMocGFyYW0sICc9JykgPyBwYXJhbS5pbmRleE9mKCc9JykgOiAocGFyYW0gJiYgcGFyYW0ubGVuZ3RoKSxcbiAgICAgICAgICAgICAgICAgICAgcGFyYW1OYW1lID0gcGFyYW0uc3Vic3RyKDAsIGkpLFxuICAgICAgICAgICAgICAgICAgICBwYXJhbVZhbHVlID0gcGFyYW0uc3Vic3RyKGkgKyAxKTtcblxuICAgICAgICAgICAgICAgIC8vIGFkZCB0aGUgPSBmb3IgcGFyYW0gbmFtZSBvbmx5IHdoZW4gdGhlIHBhcmFtIHZhbHVlIGV4aXN0cyBpbiB0aGUgZ2l2ZW4gcGFyYW0gb3IgZW1wdHkgdmFsdWUgaXMgYXNzaWduZWRcbiAgICAgICAgICAgICAgICBpZiAocGFyYW1WYWx1ZSB8fCBfLmluY2x1ZGVzKHBhcmFtLCAnPScpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWNvZGVkUGFyYW1WYWx1ZSA9IGRlY29kZVVSSUNvbXBvbmVudChwYXJhbVZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVjb2RlZFBhcmFtVmFsdWUgPSBwYXJhbVZhbHVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVuY29kZWRQYXJhbXMgKz0gcGFyYW1OYW1lICsgJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KGRlY29kZWRQYXJhbVZhbHVlKSArICcmJztcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBlbmNvZGVkUGFyYW1zICs9IHBhcmFtTmFtZSArICcmJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGVuY29kZWRQYXJhbXMgPSBlbmNvZGVkUGFyYW1zLnNsaWNlKDAsIC0xKTtcbiAgICAgICAgICAgIHVybCA9IHVybC5yZXBsYWNlKHF1ZXJ5UGFyYW1zU3RyaW5nLCBlbmNvZGVkUGFyYW1zKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdXJsO1xufTtcblxuLyogY2FwaXRhbGl6ZSB0aGUgZmlyc3QtbGV0dGVyIG9mIHRoZSBzdHJpbmcgcGFzc2VkICovXG5leHBvcnQgY29uc3QgaW5pdENhcHMgPSBuYW1lID0+IHtcbiAgICBpZiAoIW5hbWUpIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgIH1cbiAgICByZXR1cm4gbmFtZS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIG5hbWUuc3Vic3RyaW5nKDEpO1xufTtcblxuLyogY29udmVydCBjYW1lbENhc2Ugc3RyaW5nIHRvIGEgc3BhY2Ugc2VwYXJhdGVkIHN0cmluZyAqL1xuZXhwb3J0IGNvbnN0IHNwYWNlU2VwYXJhdGUgPSBuYW1lID0+IHtcbiAgICBpZiAobmFtZSA9PT0gbmFtZS50b1VwcGVyQ2FzZSgpKSB7XG4gICAgICAgIHJldHVybiBuYW1lO1xuICAgIH1cbiAgICByZXR1cm4gbmFtZS5yZXBsYWNlKFJFR0VYLlNOQUtFX0NBU0UsIGZ1bmN0aW9uIChsZXR0ZXIsIHBvcykge1xuICAgICAgICByZXR1cm4gKHBvcyA/ICcgJyA6ICcnKSArIGxldHRlcjtcbiAgICB9KTtcbn07XG5cbi8qUmVwbGFjZSB0aGUgY2hhcmFjdGVyIGF0IGEgcGFydGljdWxhciBpbmRleCovXG5leHBvcnQgY29uc3QgcmVwbGFjZUF0ID0gKHN0cmluZywgaW5kZXgsIGNoYXJhY3RlcikgPT4gc3RyaW5nLnN1YnN0cigwLCBpbmRleCkgKyBjaGFyYWN0ZXIgKyBzdHJpbmcuc3Vic3RyKGluZGV4ICsgY2hhcmFjdGVyLmxlbmd0aCk7XG5cbi8qUmVwbGFjZSAnLicgd2l0aCBzcGFjZSBhbmQgY2FwaXRhbGl6ZSB0aGUgbmV4dCBsZXR0ZXIqL1xuZXhwb3J0IGNvbnN0IHBlcmlvZFNlcGFyYXRlID0gbmFtZSA9PiB7XG4gICAgbGV0IGRvdEluZGV4O1xuICAgIGRvdEluZGV4ID0gbmFtZS5pbmRleE9mKCcuJyk7XG4gICAgaWYgKGRvdEluZGV4ICE9PSAtMSkge1xuICAgICAgICBuYW1lID0gcmVwbGFjZUF0KG5hbWUsIGRvdEluZGV4ICsgMSwgbmFtZS5jaGFyQXQoZG90SW5kZXggKyAxKS50b1VwcGVyQ2FzZSgpKTtcbiAgICAgICAgbmFtZSA9IHJlcGxhY2VBdChuYW1lLCBkb3RJbmRleCwgJyAnKTtcbiAgICB9XG4gICAgcmV0dXJuIG5hbWU7XG59O1xuXG5leHBvcnQgY29uc3QgcHJldHRpZnlMYWJlbCA9IGxhYmVsID0+IHtcbiAgICBsYWJlbCA9IF8uY2FtZWxDYXNlKGxhYmVsKTtcbiAgICAvKmNhcGl0YWxpemUgdGhlIGluaXRpYWwgTGV0dGVyKi9cbiAgICBsYWJlbCA9IGluaXRDYXBzKGxhYmVsKTtcbiAgICAvKkNvbnZlcnQgY2FtZWwgY2FzZSB3b3JkcyB0byBzZXBhcmF0ZWQgd29yZHMqL1xuICAgIGxhYmVsID0gc3BhY2VTZXBhcmF0ZShsYWJlbCk7XG4gICAgLypSZXBsYWNlICcuJyB3aXRoIHNwYWNlIGFuZCBjYXBpdGFsaXplIHRoZSBuZXh0IGxldHRlciovXG4gICAgbGFiZWwgPSBwZXJpb2RTZXBhcmF0ZShsYWJlbCk7XG4gICAgcmV0dXJuIGxhYmVsO1xufTtcblxuZXhwb3J0IGNvbnN0IGRlSHlwaGVuYXRlID0gKG5hbWUpID0+IHtcbiAgICByZXR1cm4gbmFtZS5zcGxpdCgnLScpLmpvaW4oJyAnKTtcbn07XG5cbi8qQWNjZXB0cyBhbiBhcnJheSBvciBhIHN0cmluZyBzZXBhcmF0ZWQgd2l0aCBzeW1ib2wgYW5kIHJldHVybnMgcHJldHRpZmllZCByZXN1bHQqL1xuZXhwb3J0IGNvbnN0IHByZXR0aWZ5TGFiZWxzID0gKG5hbWVzLCBzZXBhcmF0b3IgPSAnLCcpID0+IHtcbiAgICBsZXQgbW9kaWZpZWROYW1lcywgbmFtZXNBcnJheSA9IFtdO1xuXG4gICAgaWYgKCFfLmlzQXJyYXkobmFtZXMpKSB7XG4gICAgICAgIG5hbWVzQXJyYXkgPSBfLnNwbGl0KG5hbWVzLCBzZXBhcmF0b3IpO1xuICAgIH1cblxuICAgIG1vZGlmaWVkTmFtZXMgPSBfLm1hcChuYW1lc0FycmF5LCBwcmV0dGlmeUxhYmVsKTtcbiAgICBpZiAoXy5pc0FycmF5KG5hbWVzKSkge1xuICAgICAgICByZXR1cm4gbW9kaWZpZWROYW1lcztcbiAgICB9XG4gICAgcmV0dXJuIG1vZGlmaWVkTmFtZXMuam9pbihzZXBhcmF0b3IpO1xufTtcblxuLyoqXG4gKiB0aGlzIG1ldGhvZCBjaGVja3MgaWYgYSBpbnNlY3VyZSBjb250ZW50IHJlcXVlc3QgaXMgYmVpbmcgbWFkZVxuICovXG5leHBvcnQgY29uc3QgaXNJbnNlY3VyZUNvbnRlbnRSZXF1ZXN0ID0gKHVybDogc3RyaW5nKTogYm9vbGVhbiA9PiB7XG5cbiAgICBjb25zdCBwYXJzZXI6IEhUTUxBbmNob3JFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYScpO1xuICAgIHBhcnNlci5ocmVmID0gdXJsO1xuXG4gICAgLy8gZm9yIHJlbGF0aXZlIHVybHMgSUUgcmV0dXJucyB0aGUgcHJvdG9jb2wgYXMgZW1wdHkgc3RyaW5nXG4gICAgaWYgKHBhcnNlci5wcm90b2NvbCA9PT0gJycpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlmIChzdHJpbmdTdGFydHNXaXRoKGxvY2F0aW9uLmhyZWYsICdodHRwczovLycpKSB7XG4gICAgICAgIHJldHVybiBwYXJzZXIucHJvdG9jb2wgIT09ICdodHRwczonICYmIHBhcnNlci5wcm90b2NvbCAhPT0gJ3dzczonO1xuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbn07XG5cbi8qKlxuICogdGhpcyBtZXRob2QgY2hlY2tzIGlmIGEgZ2l2ZW4gc3RyaW5nIHN0YXJ0cyB3aXRoIHRoZSBnaXZlbiBzdHJpbmdcbiAqL1xuZXhwb3J0IGNvbnN0IHN0cmluZ1N0YXJ0c1dpdGggPSAoc3RyOiBzdHJpbmcsIHN0YXJ0c1dpdGg6IHN0cmluZywgaWdub3JlQ2FzZT8pOiBib29sZWFuID0+IHtcbiAgICBpZiAoIXN0cikge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgY29uc3QgcmVnRXggPSBuZXcgUmVnRXhwKCdeJyArIHN0YXJ0c1dpdGgsIGlnbm9yZUNhc2UgPyAnaScgOiAnJyk7XG5cbiAgICByZXR1cm4gcmVnRXgudGVzdChzdHIpO1xufTtcblxuZXhwb3J0IGNvbnN0IGdldEV2YWx1YXRlZEV4cHJWYWx1ZSA9IChvYmplY3QsIGV4cHJlc3Npb24pID0+IHtcbiAgICBsZXQgdmFsO1xuICAgIC8qKlxuICAgICAqIEV2YWx1YXRlIHRoZSBleHByZXNzaW9uIHdpdGggdGhlIHNjb3BlIGFuZCBvYmplY3QuXG4gICAgICogJGV2YWwgaXMgdXNlZCwgYXMgZXhwcmVzc2lvbiBjYW4gYmUgaW4gZm9ybWF0IG9mIGZpZWxkMSArICcgJyArIGZpZWxkMlxuICAgICAqICRldmFsIGNhbiBmYWlsLCBpZiBleHByZXNzaW9uIGlzIG5vdCBpbiBjb3JyZWN0IGZvcm1hdCwgc28gYXR0ZW1wdCB0aGUgZXZhbCBmdW5jdGlvblxuICAgICAqL1xuICAgIHZhbCA9IF8uYXR0ZW1wdChmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgY29uc3QgYXJnc0V4cHIgPSBPYmplY3Qua2V5cyhvYmplY3QpLm1hcCgoZmllbGROYW1lKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gYHZhciAke2ZpZWxkTmFtZX0gPSBkYXRhWycke2ZpZWxkTmFtZX0nXTtgO1xuICAgICAgICB9KS5qb2luKCcgJyk7XG4gICAgICAgIGNvbnN0IGYgPSBuZXcgRnVuY3Rpb24oJ2RhdGEnLCBgJHthcmdzRXhwcn0gcmV0dXJuICAke2V4cHJlc3Npb259YCk7XG4gICAgICAgIHJldHVybiBmKG9iamVjdCk7XG4gICAgfSk7XG4gICAgLyoqXG4gICAgICogJGV2YWwgZmFpbHMgaWYgZmllbGQgZXhwcmVzc2lvbiBoYXMgc3BhY2VzLiBFeDogJ2ZpZWxkIG5hbWUnIG9yICdmaWVsZEBuYW1lJ1xuICAgICAqIEFzIGEgZmFsbGJhY2ssIGdldCB2YWx1ZSBkaXJlY3RseSBmcm9tIG9iamVjdCBvciBzY29wZVxuICAgICAqL1xuICAgIGlmIChfLmlzRXJyb3IodmFsKSkge1xuICAgICAgICB2YWwgPSBfLmdldChvYmplY3QsIGV4cHJlc3Npb24pO1xuICAgIH1cbiAgICByZXR1cm4gdmFsO1xufTtcblxuLyogZnVuY3Rpb25zIGZvciByZXNvdXJjZSBUYWIqL1xuZXhwb3J0IGNvbnN0IGlzSW1hZ2VGaWxlID0gKGZpbGVOYW1lKSA9PiB7XG4gICAgcmV0dXJuIChSRUdFWC5TVVBQT1JURURfSU1BR0VfRk9STUFUKS50ZXN0KGZpbGVOYW1lKTtcbn07XG5cbmV4cG9ydCBjb25zdCBpc0F1ZGlvRmlsZSA9IChmaWxlTmFtZSkgPT4ge1xuICAgIHJldHVybiAoUkVHRVguU1VQUE9SVEVEX0FVRElPX0ZPUk1BVCkudGVzdChmaWxlTmFtZSk7XG59O1xuXG5leHBvcnQgY29uc3QgaXNWaWRlb0ZpbGUgPSAoZmlsZU5hbWUpID0+IHtcbiAgICByZXR1cm4gKFJFR0VYLlNVUFBPUlRFRF9WSURFT19GT1JNQVQpLnRlc3QoZmlsZU5hbWUpO1xufTtcblxuZXhwb3J0IGNvbnN0IGlzVmFsaWRXZWJVUkwgPSAodXJsOiBzdHJpbmcpOiBib29sZWFuID0+IHtcbiAgICByZXR1cm4gKFJFR0VYLlZBTElEX1dFQl9VUkwpLnRlc3QodXJsKTtcbn07XG5cbi8qVGhpcyBmdW5jdGlvbiByZXR1cm5zIHRoZSB1cmwgdG8gdGhlIHJlc291cmNlIGFmdGVyIGNoZWNraW5nIHRoZSB2YWxpZGl0eSBvZiB1cmwqL1xuZXhwb3J0IGNvbnN0IGdldFJlc291cmNlVVJMID0gKHVybFN0cmluZykgPT4ge1xuICAgIGlmIChpc1ZhbGlkV2ViVVJMKHVybFN0cmluZykpIHtcbiAgICAgICAgLypUT0RPOiBVc2UgRG9tU2FuaXRpemVyKi9cbiAgICAgICAgLy8gcmV0dXJuIHNhbml0aXplci5ieXBhc3NTZWN1cml0eVRydXN0UmVzb3VyY2VVcmwodXJsU3RyaW5nKTtcbiAgICB9XG4gICAgcmV0dXJuIHVybFN0cmluZztcbn07XG5cbi8qZnVuY3Rpb24gdG8gY2hlY2sgaWYgZm4gaXMgYSBmdW5jdGlvbiBhbmQgdGhlbiBleGVjdXRlKi9cbmV4cG9ydCBmdW5jdGlvbiB0cmlnZ2VyRm4oZm4sIC4uLmFyZ21udHMpIHtcbiAgICAvKiBVc2Ugb2Ygc2xpY2Ugb24gYXJndW1lbnRzIHdpbGwgbWFrZSB0aGlzIGZ1bmN0aW9uIG5vdCBvcHRpbWl6YWJsZVxuICAgICogaHR0cHM6Ly9naXRodWIuY29tL3BldGthYW50b25vdi9ibHVlYmlyZC93aWtpL09wdGltaXphdGlvbi1raWxsZXJzIzMyLWxlYWtpbmctYXJndW1lbnRzXG4gICAgKiAqL1xuXG4gICAgbGV0IHN0YXJ0ID0gMTtcbiAgICBjb25zdCBsZW4gPSBhcmd1bWVudHMubGVuZ3RoLCBhcmdzID0gbmV3IEFycmF5KGxlbiAtIHN0YXJ0KTtcbiAgICBmb3IgKHN0YXJ0OyBzdGFydCA8IGxlbjsgc3RhcnQrKykge1xuICAgICAgICBhcmdzW3N0YXJ0IC0gMV0gPSBhcmd1bWVudHNbc3RhcnRdO1xuICAgIH1cblxuICAgIGlmIChfLmlzRnVuY3Rpb24oZm4pKSB7XG4gICAgICAgIHJldHVybiBmbi5hcHBseShudWxsLCBhcmdzKTtcbiAgICB9XG59XG5cbi8qKlxuICogVGhpcyBtZXRob2QgaXMgdXNlZCB0byBnZXQgdGhlIGZvcm1hdHRlZCBkYXRlXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRGb3JtYXR0ZWREYXRlID0gKGRhdGVQaXBlLCBkYXRlT2JqLCBmb3JtYXQ6IHN0cmluZyk6IGFueSA9PiB7XG4gICAgaWYgKCFkYXRlT2JqKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGlmIChmb3JtYXQgPT09ICd0aW1lc3RhbXAnKSB7XG4gICAgICAgIHJldHVybiBtb21lbnQoZGF0ZU9iaikudmFsdWVPZigpO1xuICAgIH1cbiAgICByZXR1cm4gZGF0ZVBpcGUudHJhbnNmb3JtKGRhdGVPYmosIGZvcm1hdCk7XG59O1xuXG4vKipcbiAqIG1ldGhvZCB0byBnZXQgdGhlIGRhdGUgb2JqZWN0IGZyb20gdGhlIGlucHV0IHJlY2VpdmVkXG4gKi9cbmV4cG9ydCBjb25zdCBnZXREYXRlT2JqID0gKHZhbHVlKTogRGF0ZSA9PiB7XG4gICAgLyppZiB0aGUgdmFsdWUgaXMgYSBkYXRlIG9iamVjdCwgbm8gbmVlZCB0byBjb3ZlcnQgaXQqL1xuICAgIGlmIChfLmlzRGF0ZSh2YWx1ZSkpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cblxuICAgIC8qaWYgdGhlIHZhbHVlIGlzIGEgdGltZXN0YW1wIHN0cmluZywgY29udmVydCBpdCB0byBhIG51bWJlciovXG4gICAgaWYgKCFpc05hTih2YWx1ZSkpIHtcbiAgICAgICAgdmFsdWUgPSBwYXJzZUludCh2YWx1ZSwgMTApO1xuICAgIH1cblxuICAgIGlmICghbW9tZW50KHZhbHVlKS5pc1ZhbGlkKCkgfHwgdmFsdWUgPT09ICcnIHx8IHZhbHVlID09PSBudWxsIHx8IHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG4gICAgbGV0IGRhdGVPYmogPSBuZXcgRGF0ZSh2YWx1ZSk7XG4gICAgLyoqXG4gICAgICogaWYgZGF0ZSB2YWx1ZSBpcyBzdHJpbmcgXCIyMC0wNS0yMDE5XCIgdGhlbiBuZXcgRGF0ZSh2YWx1ZSkgcmV0dXJuIDIwTWF5MjAxOSB3aXRoIGN1cnJlbnQgdGltZSBpbiBJbmRpYSxcbiAgICAgKiB3aGVyZWFzIHRoaXMgd2lsbCByZXR1cm4gMTlNYXkyMDE5IHdpdGggdGltZSBsYWdnaW5nIGZvciBmZXcgaG91cnMuXG4gICAgICogVGhpcyBpcyBiZWNhdXNlIGl0IHJldHVybnMgVVRDIHRpbWUgaS5lLiBDb29yZGluYXRlZCBVbml2ZXJzYWwgVGltZSAoVVRDKS5cbiAgICAgKiBUbyBjcmVhdGUgZGF0ZSBpbiBsb2NhbCB0aW1lIHVzZSBtb21lbnRcbiAgICAgKi9cbiAgICBpZiAoXy5pc1N0cmluZyh2YWx1ZSkpIHtcbiAgICAgICAgZGF0ZU9iaiA9IG5ldyBEYXRlKG1vbWVudCh2YWx1ZSkuZm9ybWF0KCkpO1xuICAgIH1cblxuICAgIGlmICh2YWx1ZSA9PT0gQ1VSUkVOVF9EQVRFIHx8IGlzTmFOKGRhdGVPYmouZ2V0RGF5KCkpKSB7XG4gICAgICAgIHJldHVybiBub3c7XG4gICAgfVxuICAgIHJldHVybiBkYXRlT2JqO1xufTtcblxuZXhwb3J0IGNvbnN0IGFkZEV2ZW50TGlzdGVuZXJPbkVsZW1lbnQgPSAoX2VsZW1lbnQ6IEVsZW1lbnQsIGV4Y2x1ZGVFbGVtZW50OiBFbGVtZW50LCBuYXRpdmVFbGVtZW50OiBFbGVtZW50LCBldmVudFR5cGUsIGlzRHJvcERvd25EaXNwbGF5RW5hYmxlZE9uSW5wdXQsIHN1Y2Nlc3NDQiwgbGlmZTogRVZFTlRfTElGRSwgaXNDYXB0dXJlID0gZmFsc2UpID0+IHtcbiAgICBjb25zdCBlbGVtZW50OiBFbGVtZW50ID0gX2VsZW1lbnQ7XG4gICAgY29uc3QgZXZlbnRMaXN0ZW5lciA9IChldmVudCkgPT4ge1xuICAgICAgICBpZiAoZXhjbHVkZUVsZW1lbnQgJiYgKGV4Y2x1ZGVFbGVtZW50LmNvbnRhaW5zKGV2ZW50LnRhcmdldCkgfHwgZXhjbHVkZUVsZW1lbnQgPT09IGV2ZW50LnRhcmdldCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAobmF0aXZlRWxlbWVudC5jb250YWlucyhldmVudC50YXJnZXQpKSB7XG4gICAgICAgICAgICBpZiAoJChldmVudC50YXJnZXQpLmlzKCdpbnB1dCcpICYmICFpc0Ryb3BEb3duRGlzcGxheUVuYWJsZWRPbklucHV0KSB7XG4gICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnRUeXBlLCBldmVudExpc3RlbmVyLCBpc0NhcHR1cmUpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChsaWZlID09PSBFVkVOVF9MSUZFLk9OQ0UpIHtcbiAgICAgICAgICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudFR5cGUsIGV2ZW50TGlzdGVuZXIsIGlzQ2FwdHVyZSk7XG4gICAgICAgIH1cbiAgICAgICAgc3VjY2Vzc0NCKCk7XG4gICAgfTtcbiAgICBlbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnRUeXBlLCBldmVudExpc3RlbmVyLCBpc0NhcHR1cmUpO1xuICAgIGNvbnN0IHJlbW92ZUV2ZW50TGlzdGVuZXIgPSAoKSA9PiB7XG4gICAgICAgIGVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihldmVudFR5cGUsIGV2ZW50TGlzdGVuZXIsIGlzQ2FwdHVyZSk7XG4gICAgfTtcbiAgICByZXR1cm4gcmVtb3ZlRXZlbnRMaXN0ZW5lcjtcbn07XG5cbi8qKlxuICogUmV0dXJucyBhIGRlZXAgY2xvbmVkIHJlcGxpY2Egb2YgdGhlIHBhc3NlZCBvYmplY3QvYXJyYXlcbiAqIEBwYXJhbSBvYmplY3Qgb2JqZWN0L2FycmF5IHRvIGNsb25lXG4gKiBAcmV0dXJucyBhIGNsb25lIG9mIHRoZSBwYXNzZWQgb2JqZWN0XG4gKi9cbmV4cG9ydCBjb25zdCBnZXRDbG9uZWRPYmplY3QgPSAob2JqZWN0KSA9PiB7XG4gICAgcmV0dXJuIF8uY2xvbmVEZWVwKG9iamVjdCk7XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0RmlsZXMgPSAoZm9ybU5hbWUsIGZpZWxkTmFtZSwgaXNMaXN0KSA9PiB7XG4gICAgY29uc3QgZmlsZXMgPSBfLmdldChkb2N1bWVudC5mb3JtcywgW2Zvcm1OYW1lICwgZmllbGROYW1lLCAnZmlsZXMnXSk7XG4gICAgcmV0dXJuIGlzTGlzdCA/IF8ubWFwKGZpbGVzLCBfLmlkZW50aXR5KSA6IGZpbGVzICYmIGZpbGVzWzBdO1xufTtcblxuLypGdW5jdGlvbiB0byBnZW5lcmF0ZSBhIHJhbmRvbSBudW1iZXIqL1xuZnVuY3Rpb24gcmFuZG9tKCkge1xuICAgIHJldHVybiBNYXRoLmZsb29yKCgxICsgTWF0aC5yYW5kb20oKSkgKiAweDEwMDAwKS50b1N0cmluZygxNikuc3Vic3RyaW5nKDEpO1xufVxuXG4vKkZ1bmN0aW9uIHRvIGdlbmVyYXRlIGEgZ3VpZCBiYXNlZCBvbiByYW5kb20gbnVtYmVycy4qL1xuZXhwb3J0IGNvbnN0IGdlbmVyYXRlR1VJZCA9ICgpID0+IHtcbiAgICByZXR1cm4gcmFuZG9tKCkgKyAnLScgKyByYW5kb20oKSArICctJyArIHJhbmRvbSgpO1xufTtcblxuLyoqXG4gKiBWYWxpZGF0ZSBpZiBnaXZlbiBhY2Nlc3Mgcm9sZSBpcyBpbiBjdXJyZW50IGxvZ2dlZGluIHVzZXIgYWNjZXNzIHJvbGVzXG4gKi9cbmV4cG9ydCBjb25zdCB2YWxpZGF0ZUFjY2Vzc1JvbGVzID0gKHJvbGVFeHAsIGxvZ2dlZEluVXNlcikgPT4ge1xuICAgIGxldCByb2xlcztcblxuICAgIGlmIChyb2xlRXhwICYmIGxvZ2dlZEluVXNlcikge1xuXG4gICAgICAgIHJvbGVzID0gcm9sZUV4cCAmJiByb2xlRXhwLnNwbGl0KCcsJykubWFwKEZ1bmN0aW9uLnByb3RvdHlwZS5jYWxsLCBTdHJpbmcucHJvdG90eXBlLnRyaW0pO1xuXG4gICAgICAgIHJldHVybiBfLmludGVyc2VjdGlvbihyb2xlcywgbG9nZ2VkSW5Vc2VyLnVzZXJSb2xlcykubGVuZ3RoO1xuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xufTtcblxuZXhwb3J0IGNvbnN0IGdldFZhbGlkSlNPTiA9IChjb250ZW50KSA9PiB7XG4gICAgaWYgKCFjb250ZW50KSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IHBhcnNlZEludFZhbHVlID0gcGFyc2VJbnQoY29udGVudCwgMTApO1xuICAgICAgICAvKm9idGFpbmluZyBqc29uIGZyb20gZWRpdG9yIGNvbnRlbnQgc3RyaW5nKi9cbiAgICAgICAgcmV0dXJuIGlzT2JqZWN0KGNvbnRlbnQpIHx8ICFpc05hTihwYXJzZWRJbnRWYWx1ZSkgPyBjb250ZW50IDogSlNPTi5wYXJzZShjb250ZW50KTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIC8qdGVybWluYXRpbmcgZXhlY3V0aW9uIGlmIG5ldyB2YXJpYWJsZSBvYmplY3QgaXMgbm90IHZhbGlkIGpzb24uKi9cbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG59O1xuXG5leHBvcnQgY29uc3QgeG1sVG9Kc29uID0gKHhtbFN0cmluZykgPT4ge1xuICAgIGNvbnN0IHgyanNPYmogPSBuZXcgWDJKUyh7J2VtcHR5Tm9kZUZvcm0nOiAnY29udGVudCcsICdhdHRyaWJ1dGVQcmVmaXgnOiAnJywgJ2VuYWJsZVRvU3RyaW5nRnVuYyc6IGZhbHNlfSk7XG4gICAgbGV0IGpzb24gPSB4MmpzT2JqLnhtbDJqcyh4bWxTdHJpbmcpO1xuICAgIGlmIChqc29uKSB7XG4gICAgICAgIGpzb24gPSBfLmdldChqc29uLCBPYmplY3Qua2V5cyhqc29uKVswXSk7XG4gICAgfVxuICAgIHJldHVybiBqc29uO1xufTtcblxuLypcbiAqIFV0aWwgbWV0aG9kIHRvIGZpbmQgdGhlIHZhbHVlIG9mIGEga2V5IGluIHRoZSBvYmplY3RcbiAqIGlmIGtleSBub3QgZm91bmQgYW5kIGNyZWF0ZSBpcyB0cnVlLCBhbiBvYmplY3QgaXMgY3JlYXRlZCBhZ2FpbnN0IHRoYXQgbm9kZVxuICogRXhhbXBsZXM6XG4gKiB2YXIgYSA9IHtcbiAqICBiOiB7XG4gKiAgICAgIGMgOiB7XG4gKiAgICAgICAgICBkOiAndGVzdCdcbiAqICAgICAgfVxuICogIH1cbiAqIH1cbiAqIFV0aWxzLmZpbmRWYWx1ZShhLCAnYi5jLmQnKSAtLT4gJ3Rlc3QnXG4gKiBVdGlscy5maW5kVmFsdWUoYSwgJ2IuYycpIC0tPiB7ZDogJ3Rlc3QnfVxuICogVXRpbHMuZmluZFZhbHVlKGEsICdlJykgLS0+IHVuZGVmaW5lZFxuICogVXRpbHMuZmluZFZhbHVlKGEsICdlJywgdHJ1ZSkgLS0+IHt9IGFuZCBhIHdpbGwgYmVjb21lOlxuICoge1xuICogICBiOiB7XG4gKiAgICAgIGMgOiB7XG4gKiAgICAgICAgICBkOiAndGVzdCdcbiAqICAgICAgfVxuICogIH0sXG4gKiAgZToge1xuICogIH1cbiAqIH1cbiAqL1xuZXhwb3J0IGNvbnN0IGZpbmRWYWx1ZU9mID0gKG9iaiwga2V5LCBjcmVhdGU/KSA9PiB7XG5cbiAgICBpZiAoIW9iaiB8fCAha2V5KSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoIWNyZWF0ZSkge1xuICAgICAgICByZXR1cm4gXy5nZXQob2JqLCBrZXkpO1xuICAgIH1cblxuICAgIGNvbnN0IHBhcnRzID0ga2V5LnNwbGl0KCcuJyksXG4gICAgICAgIGtleXMgPSBbXTtcblxuICAgIGxldCBza2lwUHJvY2Vzc2luZztcblxuICAgIHBhcnRzLmZvckVhY2goKHBhcnQpID0+IHtcbiAgICAgICAgaWYgKCFwYXJ0cy5sZW5ndGgpIHsgLy8gaWYgdGhlIHBhcnQgb2YgYSBrZXkgaXMgbm90IHZhbGlkLCBza2lwIHRoZSBwcm9jZXNzaW5nLlxuICAgICAgICAgICAgc2tpcFByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc3ViUGFydHMgPSBwYXJ0Lm1hdGNoKC9cXHcrL2cpO1xuICAgICAgICBsZXQgc3ViUGFydDtcblxuICAgICAgICB3aGlsZSAoc3ViUGFydHMubGVuZ3RoKSB7XG4gICAgICAgICAgICBzdWJQYXJ0ID0gc3ViUGFydHMuc2hpZnQoKTtcbiAgICAgICAgICAgIGtleXMucHVzaCh7J2tleSc6IHN1YlBhcnQsICd2YWx1ZSc6IHN1YlBhcnRzLmxlbmd0aCA/IFtdIDoge319KTsgLy8gZGV0ZXJtaW5lIHdoZXRoZXIgdG8gY3JlYXRlIGFuIGFycmF5IG9yIGFuIG9iamVjdFxuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBpZiAoc2tpcFByb2Nlc3NpbmcpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBrZXlzLmZvckVhY2goKF9rZXkpID0+IHtcbiAgICAgICAgbGV0IHRlbXBPYmogPSBvYmpbX2tleS5rZXldO1xuICAgICAgICBpZiAoIWlzT2JqZWN0KHRlbXBPYmopKSB7XG4gICAgICAgICAgICB0ZW1wT2JqID0gZ2V0VmFsaWRKU09OKHRlbXBPYmopO1xuICAgICAgICAgICAgaWYgKCF0ZW1wT2JqKSB7XG4gICAgICAgICAgICAgICAgdGVtcE9iaiA9IF9rZXkudmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgb2JqW19rZXkua2V5XSA9IHRlbXBPYmo7XG4gICAgICAgIG9iaiA9IHRlbXBPYmo7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gb2JqO1xufTtcblxuLypcbiogZXh0cmFjdHMgYW5kIHJldHVybnMgdGhlIGxhc3QgYml0IGZyb20gZnVsbCB0eXBlUmVmIG9mIGEgZmllbGRcbiogZS5nLiByZXR1cm5zICdTdHJpbmcnIGZvciB0eXBlUmVmID0gJ2phdmEubGFuZy5TdHJpbmcnXG4qIEBwYXJhbXM6IHt0eXBlUmVmfSB0eXBlIHJlZmVyZW5jZVxuKi9cbmV4cG9ydCBjb25zdCBleHRyYWN0VHlwZSA9ICh0eXBlUmVmOiBzdHJpbmcpOiBzdHJpbmcgPT4ge1xuICAgIGxldCB0eXBlO1xuICAgIGlmICghdHlwZVJlZikge1xuICAgICAgICByZXR1cm4gRGF0YVR5cGUuU1RSSU5HO1xuICAgIH1cbiAgICB0eXBlID0gdHlwZVJlZiAmJiB0eXBlUmVmLnN1YnN0cmluZyh0eXBlUmVmLmxhc3RJbmRleE9mKCcuJykgKyAxKTtcbiAgICB0eXBlID0gdHlwZSAmJiB0eXBlLnRvTG93ZXJDYXNlKCk7XG4gICAgdHlwZSA9IHR5cGUgPT09IERhdGFUeXBlLkxPQ0FMREFURVRJTUUgPyBEYXRhVHlwZS5EQVRFVElNRSA6IHR5cGU7XG4gICAgcmV0dXJuIHR5cGU7XG59O1xuXG4vKiByZXR1cm5zIHRydWUgaWYgdGhlIHByb3ZpZGVkIGRhdGEgdHlwZSBtYXRjaGVzIG51bWJlciB0eXBlICovXG5leHBvcnQgY29uc3QgaXNOdW1iZXJUeXBlID0gKHR5cGU6IGFueSk6IGJvb2xlYW4gPT4ge1xuICAgIHJldHVybiAoTlVNQkVSX1RZUEVTLmluZGV4T2YoZXh0cmFjdFR5cGUodHlwZSkudG9Mb3dlckNhc2UoKSkgIT09IC0xKTtcbn07XG5cbi8qIGZ1bmN0aW9uIHRvIGNoZWNrIGlmIHByb3ZpZGVkIG9iamVjdCBpcyBlbXB0eSovXG5leHBvcnQgY29uc3QgaXNFbXB0eU9iamVjdCA9IChvYmo6IGFueSk6IGJvb2xlYW4gPT4ge1xuICAgIGlmIChpc09iamVjdChvYmopICYmICFfLmlzQXJyYXkob2JqKSkge1xuICAgICAgICByZXR1cm4gT2JqZWN0LmtleXMob2JqKS5sZW5ndGggPT09IDA7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn07XG5cbi8qRnVuY3Rpb24gdG8gY2hlY2sgd2hldGhlciB0aGUgc3BlY2lmaWVkIG9iamVjdCBpcyBhIHBhZ2VhYmxlIG9iamVjdCBvciBub3QuKi9cbmV4cG9ydCBjb25zdCBpc1BhZ2VhYmxlID0gKG9iajogYW55KTogYm9vbGVhbiA9PiB7XG4gICAgY29uc3QgcGFnZWFibGUgPSB7XG4gICAgICAgICdjb250ZW50JyAgICAgICAgIDogW10sXG4gICAgICAgICdmaXJzdCcgICAgICAgICAgIDogdHJ1ZSxcbiAgICAgICAgJ2xhc3QnICAgICAgICAgICAgOiB0cnVlLFxuICAgICAgICAnbnVtYmVyJyAgICAgICAgICA6IDAsXG4gICAgICAgICdudW1iZXJPZkVsZW1lbnRzJzogMTAsXG4gICAgICAgICdzaXplJyAgICAgICAgICAgIDogMjAsXG4gICAgICAgICdzb3J0JyAgICAgICAgICAgIDogbnVsbCxcbiAgICAgICAgJ3RvdGFsRWxlbWVudHMnICAgOiAxMCxcbiAgICAgICAgJ3RvdGFsUGFnZXMnICAgICAgOiAxXG4gICAgfTtcbiAgICByZXR1cm4gKF8uaXNFcXVhbChfLmtleXMocGFnZWFibGUpLCBfLmtleXMob2JqKS5zb3J0KCkpKTtcbn07XG5cbi8qXG4gKiBVdGlsIG1ldGhvZCB0byByZXBsYWNlIHBhdHRlcm5zIGluIHN0cmluZyB3aXRoIG9iamVjdCBrZXlzIG9yIGFycmF5IHZhbHVlc1xuICogRXhhbXBsZXM6XG4gKiBVdGlscy5yZXBsYWNlKCdIZWxsbywgJHtmaXJzdH0gJHtsYXN0fSAhJywge2ZpcnN0OiAnd2F2ZW1ha2VyJywgbGFzdDogJ25nJ30pIC0tPiBIZWxsbywgd2F2ZW1ha2VyIG5nXG4gKiBVdGlscy5yZXBsYWNlKCdIZWxsbywgJHswfSAkezF9ICEnLCBbJ3dhdmVtYWtlcicsJ25nJ10pIC0tPiBIZWxsbywgd2F2ZW1ha2VyIG5nXG4gKiBFeGFtcGxlcyBpZiBwYXJzZUVycm9yIGlzIHRydWU6XG4gKiBVdGlscy5yZXBsYWNlKCdIZWxsbywgezB9IHsxfSAhJywgWyd3YXZlbWFrZXInLCduZyddKSAtLT4gSGVsbG8sIHdhdmVtYWtlciBuZ1xuICovXG5leHBvcnQgY29uc3QgcmVwbGFjZSA9ICh0ZW1wbGF0ZSwgbWFwLCBwYXJzZUVycm9yPzogYm9vbGVhbikgPT4ge1xuICAgIGxldCByZWdFeCA9IFJFR0VYLlJFUExBQ0VfUEFUVEVSTjtcbiAgICBpZiAoIXRlbXBsYXRlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHBhcnNlRXJyb3IpIHtcbiAgICAgICAgcmVnRXggPSAvXFx7KFteXFx9XSspXFx9L2c7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRlbXBsYXRlLnJlcGxhY2UocmVnRXgsIGZ1bmN0aW9uIChtYXRjaCwga2V5KSB7XG4gICAgICAgIHJldHVybiBfLmdldChtYXAsIGtleSk7XG4gICAgfSk7XG59O1xuXG4vKkZ1bmN0aW9uIHRvIGNoZWNrIGlmIGRhdGUgdGltZSB0eXBlKi9cbmV4cG9ydCBjb25zdCBpc0RhdGVUaW1lVHlwZSA9IHR5cGUgPT4ge1xuICAgIGlmIChfLmluY2x1ZGVzKHR5cGUsICcuJykpIHtcbiAgICAgICAgdHlwZSA9IF8udG9Mb3dlcihleHRyYWN0VHlwZSh0eXBlKSk7XG4gICAgfVxuICAgIHJldHVybiBfLmluY2x1ZGVzKFtEYXRhVHlwZS5EQVRFLCBEYXRhVHlwZS5USU1FLCBEYXRhVHlwZS5USU1FU1RBTVAsIERhdGFUeXBlLkRBVEVUSU1FLCBEYXRhVHlwZS5MT0NBTERBVEVUSU1FXSwgdHlwZSk7XG59O1xuXG4vKiAgVGhpcyBmdW5jdGlvbiByZXR1cm5zIGRhdGUgb2JqZWN0LiBJZiB2YWwgaXMgdW5kZWZpbmVkIGl0IHJldHVybnMgaW52YWxpZCBkYXRlICovXG5leHBvcnQgY29uc3QgZ2V0VmFsaWREYXRlT2JqZWN0ID0gdmFsID0+IHtcbiAgICBpZiAobW9tZW50KHZhbCkuaXNWYWxpZCgpKSB7XG4gICAgICAgIC8vIGRhdGUgd2l0aCArNSBob3VycyBpcyByZXR1cm5lZCBpbiBzYWZhcmkgYnJvd3NlciB3aGljaCBpcyBub3QgYSB2YWxpZCBkYXRlLlxuICAgICAgICAvLyBIZW5jZSBjb252ZXJ0aW5nIHRoZSBkYXRlIHRvIHRoZSBzdXBwb3J0ZWQgZm9ybWF0IFwiWVlZWS9NTS9ERCBISDptbTpzc1wiIGluIElPU1xuICAgICAgICBpZiAoaXNJb3MoKSkge1xuICAgICAgICAgICAgdmFsID0gbW9tZW50KG1vbWVudCh2YWwpLnZhbHVlT2YoKSkuZm9ybWF0KCdZWVlZL01NL0REIEhIOm1tOnNzJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHZhbDtcbiAgICB9XG4gICAgLyppZiB0aGUgdmFsdWUgaXMgYSB0aW1lc3RhbXAgc3RyaW5nLCBjb252ZXJ0IGl0IHRvIGEgbnVtYmVyKi9cbiAgICBpZiAoIWlzTmFOKHZhbCkpIHtcbiAgICAgICAgdmFsID0gcGFyc2VJbnQodmFsLCAxMCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLyppZiB0aGUgdmFsdWUgaXMgaW4gSEg6bW06c3MgZm9ybWF0LCBpdCByZXR1cm5zIGEgd3JvbmcgZGF0ZS4gU28gYXBwZW5kIHRoZSBkYXRlIHRvIHRoZSBnaXZlbiB2YWx1ZSB0byBnZXQgZGF0ZSovXG4gICAgICAgIGlmICghKG5ldyBEYXRlKHZhbCkuZ2V0VGltZSgpKSkge1xuICAgICAgICAgICAgdmFsID0gbW9tZW50KChtb21lbnQoKS5mb3JtYXQoJ1lZWVktTU0tREQnKSArICcgJyArIHZhbCksICdZWVlZLU1NLUREIEhIOm1tOnNzIEEnKTtcblxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBuZXcgRGF0ZShtb21lbnQodmFsKS52YWx1ZU9mKCkpO1xufTtcblxuLyogIFRoaXMgZnVuY3Rpb24gcmV0dXJucyBqYXZhc2NyaXB0IGRhdGUgb2JqZWN0Ki9cbmV4cG9ydCBjb25zdCBnZXROYXRpdmVEYXRlT2JqZWN0ID0gdmFsID0+IHtcbiAgICB2YWwgPSBnZXRWYWxpZERhdGVPYmplY3QodmFsKTtcbiAgICByZXR1cm4gbmV3IERhdGUodmFsKTtcbn07XG5cblxuLyoqXG4gKiBwcmVwYXJlIGEgYmxvYiBvYmplY3QgYmFzZWQgb24gdGhlIGNvbnRlbnQgYW5kIGNvbnRlbnQgdHlwZSBwcm92aWRlZFxuICogaWYgY29udGVudCBpcyBibG9iIGl0c2VsZiwgc2ltcGx5IHJldHVybnMgaXQgYmFja1xuICogQHBhcmFtIHZhbFxuICogQHBhcmFtIHZhbENvbnRlbnRUeXBlXG4gKiBAcmV0dXJucyB7Kn1cbiAqL1xuZXhwb3J0IGNvbnN0IGdldEJsb2IgPSAodmFsLCB2YWxDb250ZW50VHlwZT8pID0+IHtcbiAgICBpZiAodmFsIGluc3RhbmNlb2YgQmxvYikge1xuICAgICAgICByZXR1cm4gdmFsO1xuICAgIH1cbiAgICBjb25zdCBqc29uVmFsID0gZ2V0VmFsaWRKU09OKHZhbCk7XG4gICAgaWYgKGpzb25WYWwgJiYganNvblZhbCBpbnN0YW5jZW9mIE9iamVjdCkge1xuICAgICAgICB2YWwgPSBuZXcgQmxvYihbSlNPTi5zdHJpbmdpZnkoanNvblZhbCldLCB7dHlwZTogdmFsQ29udGVudFR5cGUgfHwgJ2FwcGxpY2F0aW9uL2pzb24nfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdmFsID0gbmV3IEJsb2IoW3ZhbF0sIHt0eXBlOiB2YWxDb250ZW50VHlwZSB8fCAndGV4dC9wbGFpbid9KTtcbiAgICB9XG4gICAgcmV0dXJuIHZhbDtcbn07XG5cbi8qKlxuICogVGhpcyBmdW5jdGlvbiByZXR1cm5zIHRydWUgYnkgY29tcGFyaW5nIHR3byBvYmplY3RzIGJhc2VkIG9uIHRoZSBmaWVsZHNcbiAqIEBwYXJhbSBvYmoxIG9iamVjdFxuICogQHBhcmFtIG9iajIgb2JqZWN0XG4gKiBAcGFyYW0gY29tcGFyZUJ5IHN0cmluZyBmaWVsZCB2YWx1ZXMgdG8gY29tcGFyZVxuICogQHJldHVybnMge2Jvb2xlYW59IHRydWUgaWYgb2JqZWN0IGVxdWFsaXR5IHJldHVybnMgdHJ1ZSBiYXNlZCBvbiBmaWVsZHNcbiAqL1xuZXhwb3J0IGNvbnN0IGlzRXF1YWxXaXRoRmllbGRzID0gKG9iajEsIG9iajIsIGNvbXBhcmVCeSkgPT4ge1xuICAgIC8vIGNvbXBhcmVCeSBjYW4gYmUgJ2lkJyBvciAnaWQxLCBpZDInIG9yICdpZDEsIGlkMjppZDMnXG4gICAgLy8gU3BsaXQgdGhlIGNvbXBhcmVieSBjb21tYSBzZXBhcmF0ZWQgdmFsdWVzXG4gICAgbGV0IF9jb21wYXJlQnkgPSBfLmlzQXJyYXkoY29tcGFyZUJ5KSA/IGNvbXBhcmVCeSA6IF8uc3BsaXQoY29tcGFyZUJ5LCAnLCcpO1xuXG4gICAgX2NvbXBhcmVCeSA9IF8ubWFwKF9jb21wYXJlQnksIF8udHJpbSk7XG5cbiAgICByZXR1cm4gXy5pc0VxdWFsV2l0aChvYmoxLCBvYmoyLCBmdW5jdGlvbiAobzEsIG8yKSB7XG4gICAgICAgIHJldHVybiBfLmV2ZXJ5KF9jb21wYXJlQnksIGZ1bmN0aW9uKGNiKSB7XG4gICAgICAgICAgICBsZXQgY2IxLCBjYjIsIF9jYjtcblxuICAgICAgICAgICAgLy8gSWYgY29tcGFyZWJ5IGNvbnRhaW5zIDogLCBjb21wYXJlIHRoZSB2YWx1ZXMgYnkgdGhlIGtleXMgb24gZWl0aGVyIHNpZGUgb2YgOlxuICAgICAgICAgICAgaWYgKF8uaW5kZXhPZihjYiwgY29tcGFyZUJ5U2VwYXJhdG9yKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICBjYjEgPSBjYjIgPSBfLnRyaW0oY2IpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBfY2IgPSBfLnNwbGl0KGNiLCBjb21wYXJlQnlTZXBhcmF0b3IpO1xuICAgICAgICAgICAgICAgIGNiMSA9IF8udHJpbShfY2JbMF0pO1xuICAgICAgICAgICAgICAgIGNiMiA9IF8udHJpbShfY2JbMV0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gXy5nZXQobzEsIGNiMSkgPT09IF8uZ2V0KG8yLCBjYjIpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn07XG5cbmNvbnN0IGdldE5vZGUgPSBzZWxlY3RvciA9PiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKTtcblxuLy8gZnVuY3Rpb24gdG8gY2hlY2sgaWYgdGhlIHN0eWxlc2hlZXQgaXMgYWxyZWFkeSBsb2FkZWRcbmNvbnN0IGlzU3R5bGVTaGVldExvYWRlZCA9IGhyZWYgPT4gISFnZXROb2RlKGBsaW5rW2hyZWY9XCIke2hyZWZ9XCJdYCk7XG5cbi8vIGZ1bmN0aW9uIHRvIHJlbW92ZSBzdHlsZXNoZWV0IGlmIHRoZSBzdHlsZXNoZWV0IGlzIGFscmVhZHkgbG9hZGVkXG5jb25zdCByZW1vdmVTdHlsZVNoZWV0ID0gaHJlZiA9PiB7XG4gICAgY29uc3Qgbm9kZSA9IGdldE5vZGUoYGxpbmtbaHJlZj1cIiR7aHJlZn1cIl1gKTtcbiAgICBpZiAobm9kZSkge1xuICAgICAgICBub2RlLnJlbW92ZSgpO1xuICAgIH1cbn07XG5cbi8vIGZ1bmN0aW9uIHRvIGxvYWQgYSBzdHlsZXNoZWV0XG5leHBvcnQgY29uc3QgbG9hZFN0eWxlU2hlZXQgPSAodXJsLCBhdHRyKSA9PiB7XG4gICAgaWYgKGlzU3R5bGVTaGVldExvYWRlZCh1cmwpKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpbmsnKTtcbiAgICBsaW5rLmhyZWYgPSB1cmw7XG4gICAgLy8gVG8gYWRkIGF0dHJpYnV0ZXMgdG8gbGluayB0YWdcbiAgICBpZiAoYXR0ciAmJiBhdHRyLm5hbWUpIHtcbiAgICAgICAgbGluay5zZXRBdHRyaWJ1dGUoYXR0ci5uYW1lLCBhdHRyLnZhbHVlKTtcbiAgICB9XG4gICAgbGluay5zZXRBdHRyaWJ1dGUoJ3JlbCcsICdzdHlsZXNoZWV0Jyk7XG4gICAgbGluay5zZXRBdHRyaWJ1dGUoJ3R5cGUnLCAndGV4dC9jc3MnKTtcbiAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKGxpbmspO1xuICAgIHJldHVybiBsaW5rO1xufTtcblxuLy8gZnVuY3Rpb24gdG8gbG9hZCBzdHlsZXNoZWV0c1xuZXhwb3J0IGNvbnN0IGxvYWRTdHlsZVNoZWV0cyA9ICh1cmxzID0gW10pID0+IHtcbiAgICAvLyBpZiB0aGUgZmlyc3QgYXJndW1lbnQgaXMgbm90IGFuIGFycmF5LCBjb252ZXJ0IGl0IHRvIGFuIGFycmF5XG4gICAgaWYgKCFBcnJheS5pc0FycmF5KHVybHMpKSB7XG4gICAgICAgIHVybHMgPSBbdXJsc107XG4gICAgfVxuICAgIHVybHMuZm9yRWFjaChsb2FkU3R5bGVTaGVldCk7XG59O1xuXG4vLyBmdW5jdGlvbiB0byBjaGVjayBpZiB0aGUgc2NyaXB0IGlzIGFscmVhZHkgbG9hZGVkXG5jb25zdCBpc1NjcmlwdExvYWRlZCA9IHNyYyA9PiAhIWdldE5vZGUoYHNjcmlwdFtzcmM9XCIke3NyY31cIl0sIHNjcmlwdFtkYXRhLXNyYz1cIiR7c3JjfVwiXWApO1xuXG5leHBvcnQgY29uc3QgbG9hZFNjcmlwdCA9IGFzeW5jIHVybCA9PiB7XG4gICAgY29uc3QgX3VybCA9IHVybC50cmltKCk7XG4gICAgaWYgKCFfdXJsLmxlbmd0aCB8fCBpc1NjcmlwdExvYWRlZChfdXJsKSkge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZldGNoQ29udGVudCgndGV4dCcsIF91cmwsIGZhbHNlLCB0ZXh0ID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuICAgICAgICAgICAgc2NyaXB0LnRleHRDb250ZW50ID0gdGV4dDtcbiAgICAgICAgICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc2NyaXB0KTtcbiAgICAgICAgfSk7XG5cbiAgICAvLyByZXR1cm4gZmV0Y2goX3VybClcbiAgICAvLyAgICAgLnRoZW4ocmVzcG9uc2UgPT4gcmVzcG9uc2UudGV4dCgpKVxuICAgIC8vICAgICAudGhlbih0ZXh0ID0+IHtcbiAgICAvLyAgICAgICAgIGNvbnN0IHNjcmlwdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NjcmlwdCcpO1xuICAgIC8vICAgICAgICAgc2NyaXB0LnRleHRDb250ZW50ID0gdGV4dDtcbiAgICAvLyAgICAgICAgIGRvY3VtZW50LmhlYWQuYXBwZW5kQ2hpbGQoc2NyaXB0KTtcbiAgICAvLyAgICAgfSk7XG59O1xuXG5leHBvcnQgY29uc3QgbG9hZFNjcmlwdHMgPSBhc3luYyAodXJscyA9IFtdKSA9PiB7XG4gICAgZm9yIChjb25zdCB1cmwgb2YgdXJscykge1xuICAgICAgICBhd2FpdCBsb2FkU2NyaXB0KHVybCk7XG4gICAgfVxuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbn07XG5cbmV4cG9ydCBsZXQgX1dNX0FQUF9QUk9KRUNUOiBhbnkgPSB7fTtcblxuLyoqXG4gKiBUaGlzIGZ1bmN0aW9uIHNldHMgc2Vzc2lvbiBzdG9yYWdlIGl0ZW0gYmFzZWQgb24gdGhlIHByb2plY3QgSURcbiAqIEBwYXJhbSBrZXkgc3RyaW5nXG4gKiBAcGFyYW0gdmFsdWUgc3RyaW5nXG4gKi9cbmV4cG9ydCBjb25zdCBzZXRTZXNzaW9uU3RvcmFnZUl0ZW0gPSAoa2V5LCB2YWx1ZSkgPT4ge1xuICAgIGxldCBpdGVtOiBhbnkgPSB3aW5kb3cuc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbShfV01fQVBQX1BST0pFQ1QuaWQpO1xuXG4gICAgaWYgKGl0ZW0pIHtcbiAgICAgICAgaXRlbSA9IEpTT04ucGFyc2UoaXRlbSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgaXRlbSA9IHt9O1xuICAgIH1cbiAgICBpdGVtW2tleV0gPSB2YWx1ZTtcblxuICAgIHdpbmRvdy5zZXNzaW9uU3RvcmFnZS5zZXRJdGVtKF9XTV9BUFBfUFJPSkVDVC5pZCwgSlNPTi5zdHJpbmdpZnkoaXRlbSkpO1xufTtcblxuLyoqXG4gKiBUaGlzIGZ1bmN0aW9uIGdldHMgc2Vzc2lvbiBzdG9yYWdlIGl0ZW0gYmFzZWQgb24gdGhlIHByb2plY3QgSURcbiAqIEBwYXJhbSBrZXkgc3RyaW5nXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRTZXNzaW9uU3RvcmFnZUl0ZW0gPSBrZXkgPT4ge1xuICAgIGxldCBpdGVtID0gd2luZG93LnNlc3Npb25TdG9yYWdlLmdldEl0ZW0oX1dNX0FQUF9QUk9KRUNULmlkKTtcblxuICAgIGlmIChpdGVtKSB7XG4gICAgICAgIGl0ZW0gPSBKU09OLnBhcnNlKGl0ZW0pO1xuICAgICAgICByZXR1cm4gaXRlbVtrZXldO1xuICAgIH1cbn07XG5cbmV4cG9ydCBjb25zdCBub29wID0gKC4uLmFyZ3MpID0+IHt9O1xuXG5leHBvcnQgY29uc3QgaXNBcnJheSA9IHYgPT4gXy5pc0FycmF5KHYpO1xuXG5leHBvcnQgY29uc3QgaXNTdHJpbmcgPSB2ID0+IHR5cGVvZiB2ID09PSAnc3RyaW5nJztcblxuZXhwb3J0IGNvbnN0IGlzTnVtYmVyID0gdiA9PiB0eXBlb2YgdiA9PT0gJ251bWJlcic7XG5cbi8qKlxuICogVGhpcyBmdW5jdGlvbiByZXR1cm5zIGEgYmxvYiBvYmplY3QgZnJvbSB0aGUgZ2l2ZW4gZmlsZSBwYXRoXG4gKiBAcGFyYW0gZmlsZXBhdGhcbiAqIEByZXR1cm5zIHByb21pc2UgaGF2aW5nIGJsb2Igb2JqZWN0XG4gKi9cbmV4cG9ydCBjb25zdCBjb252ZXJ0VG9CbG9iID0gKGZpbGVwYXRoKTogUHJvbWlzZTxhbnk+ID0+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2U8YW55PiAoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAvLyBSZWFkIHRoZSBmaWxlIGVudHJ5IGZyb20gdGhlIGZpbGUgVVJMXG4gICAgICAgIHJlc29sdmVMb2NhbEZpbGVTeXN0ZW1VUkwoZmlsZXBhdGgsIGZ1bmN0aW9uIChmaWxlRW50cnkpIHtcbiAgICAgICAgICAgIGZpbGVFbnRyeS5maWxlKGZ1bmN0aW9uIChmaWxlKSB7XG4gICAgICAgICAgICAgICAgLy8gZmlsZSBoYXMgdGhlIGNvcmRvdmEgZmlsZSBzdHJ1Y3R1cmUuIFRvIHN1Ym1pdCB0byB0aGUgYmFja2VuZCwgY29udmVydCB0aGlzIGZpbGUgdG8gamF2YXNjcmlwdCBmaWxlXG4gICAgICAgICAgICAgICAgY29uc3QgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcbiAgICAgICAgICAgICAgICByZWFkZXIub25sb2FkZW5kID0gKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBpbWdCbG9iID0gbmV3IEJsb2IoW3JlYWRlci5yZXN1bHRdLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAndHlwZScgOiBmaWxlLnR5cGVcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoeydibG9iJyA6IGltZ0Jsb2IsICdmaWxlcGF0aCc6IGZpbGVwYXRofSk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICByZWFkZXIub25lcnJvciA9IHJlamVjdDtcbiAgICAgICAgICAgICAgICByZWFkZXIucmVhZEFzQXJyYXlCdWZmZXIoZmlsZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgcmVqZWN0KTtcbiAgICB9KTtcbn07XG5cbmV4cG9ydCBjb25zdCBoYXNDb3Jkb3ZhID0gKCkgPT4ge1xuICAgIHJldHVybiAhIXdpbmRvd1snY29yZG92YSddO1xufTtcblxuZXhwb3J0IGNvbnN0IEFwcENvbnN0YW50cyA9IHtcbiAgICBJTlRfTUFYX1ZBTFVFOiAyMTQ3NDgzNjQ3XG59IDtcblxuZXhwb3J0IGNvbnN0IG9wZW5MaW5rID0gKGxpbms6IHN0cmluZywgdGFyZ2V0OiBzdHJpbmcgPSAnX3NlbGYnKSA9PiB7XG4gICAgaWYgKCBoYXNDb3Jkb3ZhKCkgJiYgXy5zdGFydHNXaXRoKGxpbmssICcjJykpIHtcbiAgICAgICAgbG9jYXRpb24uaGFzaCA9IGxpbms7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgd2luZG93Lm9wZW4obGluaywgdGFyZ2V0KTtcbiAgICB9XG59O1xuXG5cbi8qIHV0aWwgZnVuY3Rpb24gdG8gbG9hZCB0aGUgY29udGVudCBmcm9tIGEgdXJsICovXG5leHBvcnQgY29uc3QgZmV0Y2hDb250ZW50ID0gKGRhdGFUeXBlLCB1cmw6IHN0cmluZywgaW5TeW5jOiBib29sZWFuID0gZmFsc2UsIHN1Y2Nlc3M/LCBlcnJvcj8pOiBQcm9taXNlPGFueT4gPT4ge1xuICAgIHJldHVybiAkLmFqYXgoe3R5cGU6ICdnZXQnLCBkYXRhVHlwZTogZGF0YVR5cGUsIHVybDogdXJsLCBhc3luYzogIWluU3luY30pXG4gICAgICAgIC5kb25lKHJlc3BvbnNlID0+IHN1Y2Nlc3MgJiYgc3VjY2VzcyhyZXNwb25zZSkpXG4gICAgICAgIC5mYWlsKHJlYXNvbiA9PiBlcnJvciAmJiBlcnJvcihyZWFzb24pKTtcbn07XG5cbi8qKlxuICogSWYgdGhlIGdpdmVuIG9iamVjdCBpcyBhIHByb21pc2UsIHRoZW4gb2JqZWN0IGlzIHJldHVybmVkLiBPdGhlcndpc2UsIGEgcHJvbWlzZSBpcyByZXNvbHZlZCB3aXRoIHRoZSBnaXZlbiBvYmplY3QuXG4gKiBAcGFyYW0ge1Byb21pc2U8VD4gfCBUfSBhXG4gKiBAcmV0dXJucyB7UHJvbWlzZTxUPn1cbiAqL1xuZXhwb3J0IGNvbnN0IHRvUHJvbWlzZSA9IDxUPihhOiBUIHwgUHJvbWlzZTxUPik6IFByb21pc2U8VD4gPT4ge1xuICAgIGlmIChhIGluc3RhbmNlb2YgUHJvbWlzZSkge1xuICAgICAgICByZXR1cm4gYTtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGEgYXMgVCk7XG4gICAgfVxufTtcblxuLyoqXG4gKiBUaGlzIGZ1bmN0aW9uIGludm9rZXMgdGhlIGdpdmVuIHRoZSBmdW5jdGlvbiAoZm4pIHVudGlsIHRoZSBmdW5jdGlvbiBzdWNjZXNzZnVsbHkgZXhlY3V0ZXMgb3IgdGhlIG1heGltdW0gbnVtYmVyXG4gKiBvZiByZXRyaWVzIGlzIHJlYWNoZWQgb3Igb25CZWZvcmVSZXRyeSByZXR1cm5zIGZhbHNlLlxuICpcbiAqIEBwYXJhbSBmbiAtIGEgZnVuY3Rpb24gdGhhdCBpcyBuZWVkcyB0byBiZSBpbnZva2VkLiBUaGUgZnVuY3Rpb24gY2FuIGFsc28gcmV0dXJuIGEgcHJvbWlzZSBhcyB3ZWxsLlxuICogQHBhcmFtIGludGVydmFsIC0gbWluaW11bSB0aW1lIGdhcCBiZXR3ZWVuIHN1Y2Nlc3NpdmUgcmV0cmllcy4gVGhpcyBhcmd1bWVudCBzaG91bGQgYmUgZ3JlYXRlciBvciBlcXVhbCB0byAwLlxuICogQHBhcmFtIG1heFJldHJpZXMgLSBtYXhpbXVtIG51bWJlciBvZiByZXRyaWVzLiBUaGlzIGFyZ3VtZW50IHNob3VsZCBiZSBncmVhdGVyIHRoYW4gMC4gRm9yIGFsbCBvdGhlciB2YWx1ZXMsXG4gKiBtYXhSZXRyaWVzIGlzIGluZmluaXR5LlxuICogQHBhcmFtIG9uQmVmb3JlUmV0cnkgLSBhIGNhbGxiYWNrIGZ1bmN0aW9uIHRoYXQgd2lsbCBiZSBpbnZva2VkIGJlZm9yZSByZS1pbnZva2luZyBhZ2Fpbi4gVGhpcyBmdW5jdGlvbiBjYW5cbiAqIHJldHVybiBmYWxzZSBvciBhIHByb21pc2UgdGhhdCBpcyByZXNvbHZlZCB0byBmYWxzZSB0byBzdG9wIGZ1cnRoZXIgcmV0cnkgYXR0ZW1wdHMuXG4gKiBAcmV0dXJucyB7Kn0gYSBwcm9taXNlIHRoYXQgaXMgcmVzb2x2ZWQgd2hlbiBmbiBpcyBzdWNjZXNzIChvcikgbWF4aW11bSByZXRyeSBhdHRlbXB0cyByZWFjaGVkXG4gKiAob3IpIG9uQmVmb3JlUmV0cnkgcmV0dXJuZWQgZmFsc2UuXG4gKi9cbmV4cG9ydCBjb25zdCByZXRyeUlmRmFpbHMgPSAoZm46ICgpID0+IGFueSwgaW50ZXJ2YWw6IG51bWJlciwgbWF4UmV0cmllczogbnVtYmVyLCBvbkJlZm9yZVJldHJ5ID0gKCkgPT4gUHJvbWlzZS5yZXNvbHZlKGZhbHNlKSkgPT4ge1xuICAgIGxldCByZXRyeUNvdW50ID0gMDtcbiAgICBjb25zdCB0cnlGbiA9ICgpID0+IHtcbiAgICAgICAgcmV0cnlDb3VudCsrO1xuICAgICAgICBpZiAoXy5pc0Z1bmN0aW9uKGZuKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZuKCk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIG1heFJldHJpZXMgPSAoXy5pc051bWJlcihtYXhSZXRyaWVzKSAmJiBtYXhSZXRyaWVzID4gMCA/IG1heFJldHJpZXMgOiAwKTtcbiAgICBpbnRlcnZhbCA9IChfLmlzTnVtYmVyKGludGVydmFsKSAmJiBpbnRlcnZhbCA+IDAgPyBpbnRlcnZhbCA6IDApO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGNvbnN0IGVycm9yRm4gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjb25zdCBlcnJBcmdzID0gYXJndW1lbnRzO1xuICAgICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgdG9Qcm9taXNlPGJvb2xlYW4+KG9uQmVmb3JlUmV0cnkoKSkudGhlbihmdW5jdGlvbiAocmV0cnkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJldHJ5ICE9PSBmYWxzZSAmJiAoIW1heFJldHJpZXMgfHwgcmV0cnlDb3VudCA8PSBtYXhSZXRyaWVzKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdG9Qcm9taXNlKHRyeUZuKCkpLnRoZW4ocmVzb2x2ZSwgZXJyb3JGbik7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyQXJncyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCAoKSA9PiByZWplY3QoZXJyQXJncykpO1xuICAgICAgICAgICAgfSwgaW50ZXJ2YWwpO1xuICAgICAgICB9O1xuICAgICAgICB0b1Byb21pc2UodHJ5Rm4oKSkudGhlbihyZXNvbHZlLCBlcnJvckZuKTtcbiAgICB9KTtcbn07XG5cbi8qKlxuICogUHJvbWlzZSBvZiBhIGRlZmVyIGNyZWF0ZWQgdXNpbmcgdGhpcyBmdW5jdGlvbiwgaGFzIGFib3J0IGZ1bmN0aW9uIHRoYXQgd2lsbCByZWplY3QgdGhlIGRlZmVyIHdoZW4gY2FsbGVkLlxuICogQHJldHVybnMgeyp9IGFuZ3VsYXIgZGVmZXIgb2JqZWN0XG4gKi9cbmV4cG9ydCBjb25zdCBnZXRBYm9ydGFibGVEZWZlciA9ICgpID0+IHtcbiAgICBjb25zdCBfZGVmZXI6IGFueSA9IHtcbiAgICAgICAgcHJvbWlzZTogbnVsbCxcbiAgICAgICAgcmVqZWN0OiBudWxsLFxuICAgICAgICByZXNvbHZlOiBudWxsLFxuICAgICAgICBvbkFib3J0OiAoKSA9PiB7fSxcbiAgICAgICAgaXNBYm9ydGVkOiBmYWxzZVxuICAgIH07XG4gICAgX2RlZmVyLnByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIF9kZWZlci5yZXNvbHZlID0gcmVzb2x2ZTtcbiAgICAgICAgX2RlZmVyLnJlamVjdCA9IHJlamVjdDtcbiAgICB9KTtcbiAgICBfZGVmZXIucHJvbWlzZS5hYm9ydCA9ICgpID0+IHtcbiAgICAgICAgdHJpZ2dlckZuKF9kZWZlci5vbkFib3J0KTtcbiAgICAgICAgX2RlZmVyLnJlamVjdCgnYWJvcnRlZCcpO1xuICAgICAgICBfZGVmZXIuaXNBYm9ydGVkID0gdHJ1ZTtcbiAgICB9O1xuICAgIHJldHVybiBfZGVmZXI7XG59O1xuXG5leHBvcnQgY29uc3QgY3JlYXRlQ1NTUnVsZSA9IChydWxlU2VsZWN0b3I6IHN0cmluZywgcnVsZXM6IHN0cmluZykgPT4ge1xuICAgIGNvbnN0IHN0eWxlc2hlZXQgPSBkb2N1bWVudC5zdHlsZVNoZWV0c1swXTtcbiAgICBzdHlsZXNoZWV0Lmluc2VydFJ1bGUoYCR7cnVsZVNlbGVjdG9yfSB7ICR7cnVsZXN9IH1gKTtcbn07XG5cbmV4cG9ydCBjb25zdCBnZXRVcmxQYXJhbXMgPSAobGluaykgPT4ge1xuICAgIGNvbnN0IHBhcmFtcyA9IHt9O1xuICAgIC8vIElmIHVybCBwYXJhbXMgYXJlIHByZXNlbnQsIGNvbnN0cnVjdCBwYXJhbXMgb2JqZWN0IGFuZCBwYXNzIGl0IHRvIHNlYXJjaFxuICAgIGNvbnN0IGluZGV4ID0gbGluay5pbmRleE9mKCc/Jyk7XG4gICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICBjb25zdCBxdWVyeVBhcmFtcyA9IF8uc3BsaXQobGluay5zdWJzdHJpbmcoaW5kZXggKyAxLCBsaW5rLmxlbmd0aCksICcmJyk7XG4gICAgICAgIHF1ZXJ5UGFyYW1zLmZvckVhY2goKHBhcmFtKSA9PiB7XG4gICAgICAgICAgICBwYXJhbSA9IF8uc3BsaXQocGFyYW0sICc9Jyk7XG4gICAgICAgICAgICBwYXJhbXNbcGFyYW1bMF1dID0gcGFyYW1bMV07XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gcGFyYW1zO1xufTtcblxuZXhwb3J0IGNvbnN0IGdldFJvdXRlTmFtZUZyb21MaW5rID0gKGxpbmspID0+IHtcbiAgICBsaW5rICA9IGxpbmsucmVwbGFjZSgnIy8nLCAnLycpO1xuICAgIGNvbnN0IGluZGV4ID0gbGluay5pbmRleE9mKCc/Jyk7XG4gICAgaWYgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICBsaW5rID0gbGluay5zdWJzdHJpbmcoMCwgaW5kZXgpO1xuICAgIH1cbiAgICByZXR1cm4gbGluaztcbn07XG5cbmV4cG9ydCBjb25zdCBpc0FwcGxlUHJvZHVjdCA9IC9NYWN8aVBvZHxpUGhvbmV8aVBhZC8udGVzdCh3aW5kb3cubmF2aWdhdG9yLnBsYXRmb3JtKTtcblxuZXhwb3J0IGNvbnN0IGRlZmVyID0gKCkgPT4ge1xuICAgIGNvbnN0IGQgPSB7XG4gICAgICAgICAgICBwcm9taXNlOiBudWxsLFxuICAgICAgICAgICAgcmVzb2x2ZTogbm9vcCxcbiAgICAgICAgICAgIHJlamVjdCA6IG5vb3BcbiAgICAgICAgfTtcbiAgICBkLnByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGQucmVzb2x2ZSA9IHJlc29sdmU7XG4gICAgICAgIGQucmVqZWN0ID0gcmVqZWN0O1xuICAgIH0pO1xuICAgIHJldHVybiBkO1xufTtcblxuLypcbiAqIEludm9rZXMgdGhlIGdpdmVuIGxpc3Qgb2YgZnVuY3Rpb25zIHNlcXVlbnRpYWxseSB3aXRoIHRoZSBnaXZlbiBhcmd1bWVudHMuIElmIGEgZnVuY3Rpb24gcmV0dXJucyBhIHByb21pc2UsXG4gKiB0aGVuIG5leHQgZnVuY3Rpb24gd2lsbCBiZSBpbnZva2VkIG9ubHkgaWYgdGhlIHByb21pc2UgaXMgcmVzb2x2ZWQuXG4gKi9cbmV4cG9ydCBjb25zdCBleGVjdXRlUHJvbWlzZUNoYWluID0gKGZucywgYXJncywgZD8sIGk/KSA9PiB7XG4gICAgZCA9IGQgfHwgZGVmZXIoKTtcbiAgICBpID0gaSB8fCAwO1xuICAgIGlmIChpID09PSAwKSB7XG4gICAgICAgIGZucyA9IF8uZmlsdGVyKGZucywgZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgICAgICByZXR1cm4gIShfLmlzVW5kZWZpbmVkKGZuKSB8fCBfLmlzTnVsbChmbikpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgaWYgKGZucyAmJiBpIDwgZm5zLmxlbmd0aCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgdG9Qcm9taXNlKGZuc1tpXS5hcHBseSh1bmRlZmluZWQsIGFyZ3MpKVxuICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IGV4ZWN1dGVQcm9taXNlQ2hhaW4oZm5zLCBhcmdzLCBkLCBpICsgMSksIGQucmVqZWN0KTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgZC5yZWplY3QoZSk7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBkLnJlc29sdmUoKTtcbiAgICB9XG4gICAgcmV0dXJuIGQucHJvbWlzZTtcbn07XG5cbi8qKlxuICogVGhpcyBmdW5jdGlvbiBhY2NlcHRzIHR3byBkYXRhIHNvdXJjZXMgYW5kIHdpbGwgY2hlY2sgaWYgYm90aCBhcmUgc2FtZSBieSBjb21wYXJpbmcgdGhlIHVuaXF1ZSBpZCBhbmRcbiAqIGNvbnRleHQgaW4gd2hpY2ggZGF0YXNvdXJjZXMgYXJlIHByZXNlbnRcbiAqIEByZXR1cm5zIHsqfSBib29sZWFuIHRydWUvIGZhbHNlXG4gKi9cbmV4cG9ydCBjb25zdCBpc0RhdGFTb3VyY2VFcXVhbCA9IChkMSwgZDIpID0+IHtcbiAgICByZXR1cm4gZDEuZXhlY3V0ZShEYXRhU291cmNlLk9wZXJhdGlvbi5HRVRfVU5JUVVFX0lERU5USUZJRVIpID09PSBkMi5leGVjdXRlKERhdGFTb3VyY2UuT3BlcmF0aW9uLkdFVF9VTklRVUVfSURFTlRJRklFUikgJiZcbiAgICBfLmlzRXF1YWwoZDEuZXhlY3V0ZShEYXRhU291cmNlLk9wZXJhdGlvbi5HRVRfQ09OVEVYVF9JREVOVElGSUVSKSwgZDIuZXhlY3V0ZShEYXRhU291cmNlLk9wZXJhdGlvbi5HRVRfQ09OVEVYVF9JREVOVElGSUVSKSk7XG59O1xuXG4vKipcbiAqIGNoZWNrcyBpZiB0aGUgcGFzc2VkIGRhdGFzb3VyY2UgY29udGV4dCBtYXRjaGVzIHdpdGggcGFzc2VkIGNvbnRleHRcbiAqIEBwYXJhbSBkcywgZGF0YXNvdXJjZSBoYXZpbmcgYSBjb250ZXh0XG4gKiBAcGFyYW0gY3R4LCBjb250ZXh0IHRvIGNvbXBhcmUgd2l0aFxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmV4cG9ydCBjb25zdCB2YWxpZGF0ZURhdGFTb3VyY2VDdHggPSAoZHMsIGN0eCkgPT4ge1xuICAgIHJldHVybiBkcy5leGVjdXRlKERhdGFTb3VyY2UuT3BlcmF0aW9uLkdFVF9DT05URVhUX0lERU5USUZJRVIpID09PSBjdHg7XG59O1xuXG4vKipcbiAqIFRoaXMgdHJhdmVyc2VzIHRoZSBmaWx0ZXJleHByZXNzaW9ucyBvYmplY3QgcmVjdXJzaXZlbHkgYW5kIHByb2Nlc3MgdGhlIGJpbmQgc3RyaW5nIGlmIGFueSBpbiB0aGUgb2JqZWN0XG4gKiBAcGFyYW0gdmFyaWFibGUgdmFyaWFibGUgb2JqZWN0XG4gKiBAcGFyYW0gbmFtZSBuYW1lIG9mIHRoZSB2YXJpYWJsZVxuICogQHBhcmFtIGNvbnRleHQgc2NvcGUgb2YgdGhlIHZhcmlhYmxlXG4gKi9cbmV4cG9ydCBjb25zdCBwcm9jZXNzRmlsdGVyRXhwQmluZE5vZGUgPSAoY29udGV4dCwgZmlsdGVyRXhwcmVzc2lvbnMpID0+IHtcbiAgICBjb25zdCBkZXN0cm95Rm4gPSBjb250ZXh0LnJlZ2lzdGVyRGVzdHJveUxpc3RlbmVyID8gY29udGV4dC5yZWdpc3RlckRlc3Ryb3lMaXN0ZW5lci5iaW5kKGNvbnRleHQpIDogXy5ub29wO1xuICAgIGNvbnN0IGZpbHRlciQgPSBuZXcgU3ViamVjdCgpO1xuXG4gICAgY29uc3QgYmluZEZpbEV4cE9iaiA9IChvYmosIHRhcmdldE5vZGVLZXkpID0+IHtcbiAgICAgICAgaWYgKHN0cmluZ1N0YXJ0c1dpdGgob2JqW3RhcmdldE5vZGVLZXldLCAnYmluZDonKSkge1xuICAgICAgICAgICAgZGVzdHJveUZuKFxuICAgICAgICAgICAgICAgICR3YXRjaChvYmpbdGFyZ2V0Tm9kZUtleV0ucmVwbGFjZSgnYmluZDonLCAnJyksIGNvbnRleHQsIHt9LCAobmV3VmFsLCBvbGRWYWwpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKChuZXdWYWwgPT09IG9sZFZhbCAmJiBfLmlzVW5kZWZpbmVkKG5ld1ZhbCkpIHx8IChfLmlzVW5kZWZpbmVkKG5ld1ZhbCkgJiYgIV8uaXNVbmRlZmluZWQob2xkVmFsKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyBTa2lwIGNsb25pbmcgZm9yIGJsb2IgY29sdW1uXG4gICAgICAgICAgICAgICAgICAgIGlmICghXy5pbmNsdWRlcyhbJ2Jsb2InLCAnZmlsZSddLCBvYmoudHlwZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld1ZhbCA9IGdldENsb25lZE9iamVjdChuZXdWYWwpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vIGJhY2t3YXJkIGNvbXBhdGliaWxpdHk6IHdoZXJlIHdlIGFyZSBhbGxvd2luZyB0aGUgdXNlciB0byBiaW5kIGNvbXBsZXRlIG9iamVjdFxuICAgICAgICAgICAgICAgICAgICBpZiAob2JqLnRhcmdldCA9PT0gJ2RhdGFCaW5kaW5nJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gcmVtb3ZlIHRoZSBleGlzdGluZyBkYXRhYmluZGluZyBlbGVtZW50XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXJFeHByZXNzaW9ucy5ydWxlcyA9IFtdO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gbm93IGFkZCBhbGwgdGhlIHJldHVybmVkIHZhbHVlc1xuICAgICAgICAgICAgICAgICAgICAgICAgXy5mb3JFYWNoKG5ld1ZhbCwgZnVuY3Rpb24odmFsdWUsIHRhcmdldCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbHRlckV4cHJlc3Npb25zLnJ1bGVzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAndGFyZ2V0JzogdGFyZ2V0LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAndmFsdWUnOiB2YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ21hdGNoTW9kZSc6IG9iai5tYXRjaE1vZGUgfHwgJ3N0YXJ0aWdub3JlY2FzZScsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdyZXF1aXJlZCc6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAndHlwZSc6ICcnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNldHRpbmcgdmFsdWUgdG8gdGhlIHJvb3Qgbm9kZVxuICAgICAgICAgICAgICAgICAgICAgICAgb2JqW3RhcmdldE5vZGVLZXldID0gbmV3VmFsO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGZpbHRlciQubmV4dCh7ZmlsdGVyRXhwcmVzc2lvbnMsIG5ld1ZhbH0pO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGNvbnN0IHRyYXZlcnNlRmlsdGVyRXhwcmVzc2lvbnMgPSBleHByZXNzaW9ucyA9PiB7XG4gICAgICAgIGlmIChleHByZXNzaW9ucy5ydWxlcykge1xuICAgICAgICAgICAgXy5mb3JFYWNoKGV4cHJlc3Npb25zLnJ1bGVzLCAoZmlsRXhwT2JqLCBpKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGZpbEV4cE9iai5ydWxlcykge1xuICAgICAgICAgICAgICAgICAgICB0cmF2ZXJzZUZpbHRlckV4cHJlc3Npb25zKGZpbEV4cE9iaik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZpbEV4cE9iai5tYXRjaE1vZGUgPT09ICdiZXR3ZWVuJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgYmluZEZpbEV4cE9iaihmaWxFeHBPYmosICdzZWNvbmR2YWx1ZScpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGJpbmRGaWxFeHBPYmooZmlsRXhwT2JqLCAndmFsdWUnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgdHJhdmVyc2VGaWx0ZXJFeHByZXNzaW9ucyhmaWx0ZXJFeHByZXNzaW9ucyk7XG5cbiAgICByZXR1cm4gZmlsdGVyJDtcbn07XG5cbi8vIFRoaXMgbWV0aG9kIHdpbGwgc2V0IHRoZSBnaXZlbiBwcm90byBvbiB0aGUgdGFyZ2V0XG5leHBvcnQgY29uc3QgZXh0ZW5kUHJvdG8gPSAodGFyZ2V0LCBwcm90bykgPT4ge1xuICAgIGxldCBfcHJvdG8gPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YodGFyZ2V0KTtcbiAgICB3aGlsZSAoT2JqZWN0LmdldFByb3RvdHlwZU9mKF9wcm90bykuY29uc3RydWN0b3IgIT09IE9iamVjdCkge1xuICAgICAgICBfcHJvdG8gPSBPYmplY3QuZ2V0UHJvdG90eXBlT2YoX3Byb3RvKTtcbiAgICAgICAgLy8gcmV0dXJuIGlmIHRoZSBwcm90b3R5cGUgb2YgY3JlYXRlZCBjb21wb25lbnQgYW5kIHByb3RvdHlwZSBvZiBjb250ZXh0IGFyZSBzYW1lXG4gICAgICAgIGlmIChwcm90byA9PT0gX3Byb3RvKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICB9XG4gICAgT2JqZWN0LnNldFByb3RvdHlwZU9mKF9wcm90bywgcHJvdG8pO1xufTtcblxuZXhwb3J0IGNvbnN0IHJlbW92ZUV4dHJhU2xhc2hlcyA9IGZ1bmN0aW9uICh1cmwpIHtcbiAgICBjb25zdCBiYXNlNjRyZWdleCA9IC9eZGF0YTppbWFnZVxcLyhbYS16XXsyLH0pO2Jhc2U2NCwvO1xuICAgIGlmIChfLmlzU3RyaW5nKHVybCkpIHtcbiAgICAgICAgLypcbiAgICAgICAgKiBzdXBwb3J0IGZvciBtb2JpbGUgYXBwcyBoYXZpbmcgbG9jYWwgZmlsZSBwYXRoIHVybCBzdGFydGluZyB3aXRoIGZpbGU6Ly8vIGFuZFxuICAgICAgICAqIHN1cHBvcnQgZm9yIGJhc2U2NCBmb3JtYXRcbiAgICAgICAgKiAqL1xuICAgICAgICBpZiAoXy5zdGFydHNXaXRoKHVybCwgJ2ZpbGU6Ly8vJykgfHwgYmFzZTY0cmVnZXgudGVzdCh1cmwpKSB7XG4gICAgICAgICAgICByZXR1cm4gdXJsO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB1cmwucmVwbGFjZShuZXcgUmVnRXhwKCcoW146XVxcLykoXFwvKSsnLCAnZycpLCAnJDEnKTtcbiAgICB9XG59O1xuXG4kLmNhY2hlZFNjcmlwdCA9ICgoKSA9PiB7XG4gICAgY29uc3QgaW5Qcm9ncmVzcyA9IG5ldyBNYXAoKTtcbiAgICBjb25zdCByZXNvbHZlZCA9IG5ldyBTZXQoKTtcblxuICAgIGNvbnN0IGlzSW5Qcm9ncmVzcyA9IHVybCA9PiBpblByb2dyZXNzLmhhcyh1cmwpO1xuICAgIGNvbnN0IGlzUmVzb2x2ZWQgPSB1cmwgPT4gcmVzb2x2ZWQuaGFzKHVybCk7XG4gICAgY29uc3Qgb25Mb2FkID0gdXJsID0+IHtcbiAgICAgICAgcmVzb2x2ZWQuYWRkKHVybCk7XG4gICAgICAgIGluUHJvZ3Jlc3MuZ2V0KHVybCkucmVzb2x2ZSgpO1xuICAgICAgICBpblByb2dyZXNzLmRlbGV0ZSh1cmwpO1xuICAgIH07XG5cbiAgICBjb25zdCBzZXRJblByb2dyZXNzID0gdXJsID0+IHtcbiAgICAgICAgbGV0IHJlc0ZuO1xuICAgICAgICBsZXQgcmVqRm47XG4gICAgICAgIGNvbnN0IHByb21pc2U6IGFueSA9IG5ldyBQcm9taXNlKChyZXMsIHJlaikgPT4ge1xuICAgICAgICAgICAgcmVzRm4gPSByZXM7XG4gICAgICAgICAgICByZWpGbiA9IHJlajtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcHJvbWlzZS5yZXNvbHZlID0gcmVzRm47XG4gICAgICAgIHByb21pc2UucmVqZWN0ID0gcmVqRm47XG5cbiAgICAgICAgaW5Qcm9ncmVzcy5zZXQodXJsLCBwcm9taXNlKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uICh1cmwpIHtcbiAgICAgICAgaWYgKGlzUmVzb2x2ZWQodXJsKSkge1xuICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGlzSW5Qcm9ncmVzcyh1cmwpKSB7XG4gICAgICAgICAgICByZXR1cm4gaW5Qcm9ncmVzcy5nZXQodXJsKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHNldEluUHJvZ3Jlc3ModXJsKTtcblxuICAgICAgICBjb25zdCBvcHRpb25zID0ge1xuICAgICAgICAgICAgZGF0YVR5cGU6ICdzY3JpcHQnLFxuICAgICAgICAgICAgY2FjaGU6IHRydWUsXG4gICAgICAgICAgICB1cmxcbiAgICAgICAgfTtcblxuICAgICAgICAkLmFqYXgob3B0aW9ucykuZG9uZSgoKSA9PiBvbkxvYWQodXJsKSk7XG5cbiAgICAgICAgcmV0dXJuIGluUHJvZ3Jlc3MuZ2V0KHVybCk7XG4gICAgfTtcbn0pKCk7XG5cbmNvbnN0IERFRkFVTFRfRElTUExBWV9GT1JNQVRTID0ge1xuICAgIERBVEUgOiAneXl5eS1NTS1kZCcsXG4gICAgVElNRSA6ICdoaDptbSBhJyxcbiAgICBUSU1FU1RBTVAgOiAneXl5eS1NTS1kZCBoaDptbTpzcyBhJyxcbiAgICBEQVRFVElNRSA6ICd5eXl5LU1NLWRkIGhoOm1tOnNzIGEnLFxufTtcbi8vIFRoaXMgbWV0aG9kIHJldHVybnMgdGhlIGRpc3BsYXkgZGF0ZSBmb3JtYXQgZm9yIGdpdmVuIHR5cGVcbmV4cG9ydCBjb25zdCBnZXREaXNwbGF5RGF0ZVRpbWVGb3JtYXQgPSB0eXBlID0+IHtcbiAgICByZXR1cm4gREVGQVVMVF9ESVNQTEFZX0ZPUk1BVFNbXy50b1VwcGVyKHR5cGUpXTtcbn07XG5cbi8vIEdlbmVyYXRlIGZvciBhdHRyaWJ1dGUgb24gbGFiZWwgYW5kIElEIG9uIGlucHV0IGVsZW1lbnQsIHNvIHRoYXQgbGFiZWwgZWxlbWVudHMgYXJlIGFzc29jaWF0ZWQgdG8gZm9ybSBjb250cm9sc1xuZXhwb3J0IGNvbnN0IGFkZEZvcklkQXR0cmlidXRlcyA9IChlbGVtZW50OiBIVE1MRWxlbWVudCkgPT4ge1xuICAgIGNvbnN0IGxhYmVsRWwgPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2xhYmVsLmNvbnRyb2wtbGFiZWwnKTtcbiAgICBsZXQgaW5wdXRFbCA9IGVsZW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2ZvY3VzLXRhcmdldF0nKTtcbiAgICBpZiAoIWlucHV0RWwubGVuZ3RoKSB7XG4gICAgICAgIGlucHV0RWwgPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ2lucHV0LCBzZWxlY3QsIHRleHRhcmVhJyk7XG4gICAgfVxuICAgIC8qaWYgdGhlcmUgYXJlIG9ubHkgb25lIGlucHV0IGVsIGFuZCBsYWJlbCBFbCBhZGQgaWQgYW5kIGZvciBhdHRyaWJ1dGUqL1xuICAgIGlmIChsYWJlbEVsLmxlbmd0aCAmJiBpbnB1dEVsLmxlbmd0aCkge1xuICAgICAgICBjb25zdCB3aWRnZXRJZCA9ICQoaW5wdXRFbFswXSBhcyBIVE1MRWxlbWVudCkuY2xvc2VzdCgnW3dpZGdldC1pZF0nKS5hdHRyKCd3aWRnZXQtaWQnKTtcbiAgICAgICAgaWYgKHdpZGdldElkKSB7XG4gICAgICAgICAgICBzZXRBdHRyKGlucHV0RWxbMF0gYXMgSFRNTEVsZW1lbnQsICdpZCcsIHdpZGdldElkKTtcbiAgICAgICAgICAgIHNldEF0dHIobGFiZWxFbFswXSBhcyBIVE1MRWxlbWVudCwgJ2ZvcicsIHdpZGdldElkKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbi8qKlxuICogVGhpcyBtZXRob2QgaXMgdXNlZCB0byBhZGp1c3QgdGhlIGNvbnRhaW5lciBwb3NpdGlvbiBkZXBlbmRpbmcgb24gdGhlIHZpZXdwb3J0IGFuZCBzY3JvbGwgaGVpZ2h0LlxuICogRm9yIGV4YW1wbGU6IDEuIGlmIHRoZSB3aWRnZXQgaXMgYXQgYm90dG9tIG9mIHRoZSBwYWdlIGRlcGVuZGluZyBvbiB0aGUgYXZhaWxhYmxlIGJvdHRvbSBzcGFjZSwgdGhlIHBpY2tlciB3aWxsIG9wZW4gYXQgYm90dG9tIG9yIHRvcCBhdXRvbWF0aWNhbGx5LlxuICogMi4gV2hlbiB3ZSBoYXZlIGRhdGFUYWJsZSB3aXRoIGZvcm0gYXMgYSBkaWFsb2csIElmIHdpZGdldChleDogc2VhcmNoL2RhdGUvdGltZS9kYXRldGltZSkgaXMgYXQgYm90dG9tIG9mIHRoZSBkaWFsb2csIHRoZSBwaWNrZXIgaXMgbm90IHZpc2libGUgY29tcGxldGVseS4gU28gb3BlbiB0aGUgcGlja2VyIGF0IHRvcCBvZiB0aGUgd2lkZ2V0LlxuICogQHBhcmFtIGNvbnRhaW5lckVsZW0gLSBwaWNrZXIvZHJvcGRvd24gY29udGFpbmVyIGVsZW1lbnQoanF1ZXJ5KVxuICogQHBhcmFtIHBhcmVudEVsZW0gLSB3aWRnZXQgbmF0aXZlIGVsZW1lbnRcbiAqIEBwYXJhbSByZWYgLSBzY29wZSBvZiBwYXJ0aWN1bGFyIGxpYnJhcnkgZGlyZWN0aXZlXG4gKiBAcGFyYW0gZWxlIC0gQ2hpbGQgZWxlbWVudChqcXVlcnkpLiBGb3Igc29tZSBvZiB0aGUgd2lkZ2V0cyh0aW1lLCBzZWFyY2gpIGNvbnRhaW5lckVsZW0gZG9lc24ndCBoYXZlIGhlaWdodC4gVGhlIGlubmVyIGVsZW1lbnQoZHJvcGRvd24tbWVudSkgaGFzIGhlaWdodCBzbyBwYXNzaW5nIGl0IGFzIG9wdGlvbmFsLlxuICovXG5leHBvcnQgY29uc3QgYWRqdXN0Q29udGFpbmVyUG9zaXRpb24gPSAoY29udGFpbmVyRWxlbSwgcGFyZW50RWxlbSwgcmVmLCBlbGU/KSA9PiB7XG4gICAgY29uc3QgY29udGFpbmVySGVpZ2h0ID0gZWxlID8gXy5wYXJzZUludChlbGUuY3NzKCdoZWlnaHQnKSkgOiBfLnBhcnNlSW50KGNvbnRhaW5lckVsZW0uY3NzKCdoZWlnaHQnKSk7XG4gICAgY29uc3Qgdmlld1BvcnRIZWlnaHQgPSAkKHdpbmRvdykuaGVpZ2h0KCkgKyB3aW5kb3cuc2Nyb2xsWTtcbiAgICBjb25zdCBwYXJlbnREaW1lc2lvbiA9IHBhcmVudEVsZW0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgY29uc3QgcGFyZW50VG9wID0gcGFyZW50RGltZXNpb24udG9wICsgd2luZG93LnNjcm9sbFk7XG5cbiAgICAvLyBBZGp1c3RpbmcgY29udGFpbmVyIHBvc2l0aW9uIGlmIGlzIG5vdCB2aXNpYmxlIGF0IGJvdHRvbVxuICAgIGlmICh2aWV3UG9ydEhlaWdodCAtIChwYXJlbnRUb3AgKyBwYXJlbnREaW1lc2lvbi5oZWlnaHQpIDwgY29udGFpbmVySGVpZ2h0KSB7XG4gICAgICAgIGNvbnN0IG5ld1RvcCA9IHBhcmVudFRvcCAtIGNvbnRhaW5lckhlaWdodDtcbiAgICAgICAgcmVmLl9uZ1pvbmUub25TdGFibGUuc3Vic2NyaWJlKCgpID0+IHtcbiAgICAgICAgICAgIGNvbnRhaW5lckVsZW0uY3NzKCd0b3AnLCAgbmV3VG9wICsgJ3B4Jyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxufTtcblxuLy8gY2xvc2UgYWxsIHRoZSBwb3BvdmVycy5cbmV4cG9ydCBjb25zdCBjbG9zZVBvcG92ZXIgPSAoZWxlbWVudCkgPT4ge1xuICAgIGlmICghZWxlbWVudC5jbG9zZXN0KCcuYXBwLXBvcG92ZXInKS5sZW5ndGgpIHtcbiAgICAgICAgY29uc3QgcG9wb3ZlckVsZW1lbnRzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmFwcC1wb3BvdmVyLXdyYXBwZXInKTtcbiAgICAgICAgXy5mb3JFYWNoKHBvcG92ZXJFbGVtZW50cywgKGVsZSkgPT4ge1xuICAgICAgICAgICAgaWYgKGVsZS53aWRnZXQuaXNPcGVuKSB7XG4gICAgICAgICAgICAgICAgZWxlLndpZGdldC5pc09wZW4gPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufTtcblxuLyoqXG4gKiBUaGlzIG1ldGhvZCBpcyB0byB0cmlnZ2VyIGNoYW5nZSBkZXRlY3Rpb24gaW4gdGhlIGFwcFxuICogVGhpcyBpcyBleHBvc2VkIGZvciB0aGUgZW5kIHVzZXIgZGV2ZWxvcGVyIG9mIFdNIGFwcFxuICogVGhpcyBpcyB0aGUgYWx0ZXJuYXRpdmUgZm9yICRycy4kc2FmZUFwcGx5KCkgaW4gQW5ndWxhckpTXG4gKiBTZWUgJGFwcERpZ2VzdCBpbiB1dGlscyBmb3IgbW9yZSBpbmZvXG4gKi9cbmV4cG9ydCBjb25zdCBkZXRlY3RDaGFuZ2VzID0gJGFwcERpZ2VzdDtcbiJdfQ==