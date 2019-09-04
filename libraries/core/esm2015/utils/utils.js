import * as tslib_1 from "tslib";
import { Subject } from 'rxjs';
import { getWmProjectProperties } from './wm-project-properties';
import { $watch, $appDigest } from './watcher';
import { DataType } from '../enums/enums';
import { DataSource } from '../types/types';
import { setAttr } from './dom';
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
export const isDefined = v => 'undefined' !== typeof v;
export const isObject = v => null !== v && 'object' === typeof v;
export const toBoolean = (val, identity) => ((val && val !== 'false') ? true : (identity ? val === identity : false));
function isIE11() {
    return window.navigator.appVersion.indexOf('Trident/') > -1;
}
export const isIE = () => {
    return isIE11() || window.navigator.userAgent.indexOf('MSIE') > -1;
};
export const isAndroid = () => REGEX.ANDROID.test(userAgent);
export const isAndroidTablet = () => REGEX.ANDROID_TABLET.test(userAgent);
export const isIphone = () => REGEX.IPHONE.test(userAgent);
export const isIpod = () => REGEX.IPOD.test(userAgent);
export const isIpad = () => REGEX.IPAD.test(userAgent);
export const isIos = () => isIphone() || isIpod() || isIpad();
export const isMobile = () => isAndroid() || isIos() || isAndroidTablet() || $('#wm-mobile-display:visible').length > 0;
export const isMobileApp = () => getWmProjectProperties().platformType === 'MOBILE' && getWmProjectProperties().type === 'APPLICATION';
export const getAndroidVersion = () => {
    const match = (window.navigator.userAgent.toLowerCase()).match(/android\s([0-9\.]*)/);
    return match ? match[1] : '';
};
export const isKitkatDevice = () => isAndroid() && parseInt(getAndroidVersion(), 10) === 4;
/**
 * this method encodes the url and returns the encoded string
 */
export const encodeUrl = (url) => {
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
export const encodeUrlParams = (url) => {
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
export const initCaps = name => {
    if (!name) {
        return '';
    }
    return name.charAt(0).toUpperCase() + name.substring(1);
};
/* convert camelCase string to a space separated string */
export const spaceSeparate = name => {
    if (name === name.toUpperCase()) {
        return name;
    }
    return name.replace(REGEX.SNAKE_CASE, function (letter, pos) {
        return (pos ? ' ' : '') + letter;
    });
};
/*Replace the character at a particular index*/
export const replaceAt = (string, index, character) => string.substr(0, index) + character + string.substr(index + character.length);
/*Replace '.' with space and capitalize the next letter*/
export const periodSeparate = name => {
    let dotIndex;
    dotIndex = name.indexOf('.');
    if (dotIndex !== -1) {
        name = replaceAt(name, dotIndex + 1, name.charAt(dotIndex + 1).toUpperCase());
        name = replaceAt(name, dotIndex, ' ');
    }
    return name;
};
export const prettifyLabel = label => {
    label = _.camelCase(label);
    /*capitalize the initial Letter*/
    label = initCaps(label);
    /*Convert camel case words to separated words*/
    label = spaceSeparate(label);
    /*Replace '.' with space and capitalize the next letter*/
    label = periodSeparate(label);
    return label;
};
export const deHyphenate = (name) => {
    return name.split('-').join(' ');
};
/*Accepts an array or a string separated with symbol and returns prettified result*/
export const prettifyLabels = (names, separator = ',') => {
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
export const isInsecureContentRequest = (url) => {
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
export const stringStartsWith = (str, startsWith, ignoreCase) => {
    if (!str) {
        return false;
    }
    const regEx = new RegExp('^' + startsWith, ignoreCase ? 'i' : '');
    return regEx.test(str);
};
export const getEvaluatedExprValue = (object, expression) => {
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
export const isImageFile = (fileName) => {
    return (REGEX.SUPPORTED_IMAGE_FORMAT).test(fileName);
};
export const isAudioFile = (fileName) => {
    return (REGEX.SUPPORTED_AUDIO_FORMAT).test(fileName);
};
export const isVideoFile = (fileName) => {
    return (REGEX.SUPPORTED_VIDEO_FORMAT).test(fileName);
};
export const isValidWebURL = (url) => {
    return (REGEX.VALID_WEB_URL).test(url);
};
/*This function returns the url to the resource after checking the validity of url*/
export const getResourceURL = (urlString) => {
    if (isValidWebURL(urlString)) {
        /*TODO: Use DomSanitizer*/
        // return sanitizer.bypassSecurityTrustResourceUrl(urlString);
    }
    return urlString;
};
/*function to check if fn is a function and then execute*/
export function triggerFn(fn, ...argmnts) {
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
export const getFormattedDate = (datePipe, dateObj, format) => {
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
export const getDateObj = (value) => {
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
export const addEventListenerOnElement = (_element, excludeElement, nativeElement, eventType, isDropDownDisplayEnabledOnInput, successCB, life, isCapture = false) => {
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
export const getClonedObject = (object) => {
    return _.cloneDeep(object);
};
export const getFiles = (formName, fieldName, isList) => {
    const files = _.get(document.forms, [formName, fieldName, 'files']);
    return isList ? _.map(files, _.identity) : files && files[0];
};
/*Function to generate a random number*/
function random() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
}
/*Function to generate a guid based on random numbers.*/
export const generateGUId = () => {
    return random() + '-' + random() + '-' + random();
};
/**
 * Validate if given access role is in current loggedin user access roles
 */
export const validateAccessRoles = (roleExp, loggedInUser) => {
    let roles;
    if (roleExp && loggedInUser) {
        roles = roleExp && roleExp.split(',').map(Function.prototype.call, String.prototype.trim);
        return _.intersection(roles, loggedInUser.userRoles).length;
    }
    return true;
};
export const getValidJSON = (content) => {
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
export const xmlToJson = (xmlString) => {
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
export const findValueOf = (obj, key, create) => {
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
export const extractType = (typeRef) => {
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
export const isNumberType = (type) => {
    return (NUMBER_TYPES.indexOf(extractType(type).toLowerCase()) !== -1);
};
/* function to check if provided object is empty*/
export const isEmptyObject = (obj) => {
    if (isObject(obj) && !_.isArray(obj)) {
        return Object.keys(obj).length === 0;
    }
    return false;
};
/*Function to check whether the specified object is a pageable object or not.*/
export const isPageable = (obj) => {
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
export const replace = (template, map, parseError) => {
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
export const isDateTimeType = type => {
    if (_.includes(type, '.')) {
        type = _.toLower(extractType(type));
    }
    return _.includes([DataType.DATE, DataType.TIME, DataType.TIMESTAMP, DataType.DATETIME, DataType.LOCALDATETIME], type);
};
/*  This function returns date object. If val is undefined it returns invalid date */
export const getValidDateObject = val => {
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
export const getNativeDateObject = val => {
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
export const getBlob = (val, valContentType) => {
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
export const isEqualWithFields = (obj1, obj2, compareBy) => {
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
const ɵ0 = getNode;
// function to check if the stylesheet is already loaded
const isStyleSheetLoaded = href => !!getNode(`link[href="${href}"]`);
const ɵ1 = isStyleSheetLoaded;
// function to remove stylesheet if the stylesheet is already loaded
const removeStyleSheet = href => {
    const node = getNode(`link[href="${href}"]`);
    if (node) {
        node.remove();
    }
};
const ɵ2 = removeStyleSheet;
// function to load a stylesheet
export const loadStyleSheet = (url, attr) => {
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
export const loadStyleSheets = (urls = []) => {
    // if the first argument is not an array, convert it to an array
    if (!Array.isArray(urls)) {
        urls = [urls];
    }
    urls.forEach(loadStyleSheet);
};
// function to check if the script is already loaded
const isScriptLoaded = src => !!getNode(`script[src="${src}"], script[data-src="${src}"]`);
const ɵ3 = isScriptLoaded;
export const loadScript = (url) => tslib_1.__awaiter(this, void 0, void 0, function* () {
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
export const loadScripts = (urls = []) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    for (const url of urls) {
        yield loadScript(url);
    }
    return Promise.resolve();
});
export let _WM_APP_PROJECT = {};
/**
 * This function sets session storage item based on the project ID
 * @param key string
 * @param value string
 */
export const setSessionStorageItem = (key, value) => {
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
export const getSessionStorageItem = key => {
    let item = window.sessionStorage.getItem(_WM_APP_PROJECT.id);
    if (item) {
        item = JSON.parse(item);
        return item[key];
    }
};
export const noop = (...args) => { };
export const isArray = v => _.isArray(v);
export const isString = v => typeof v === 'string';
export const isNumber = v => typeof v === 'number';
/**
 * This function returns a blob object from the given file path
 * @param filepath
 * @returns promise having blob object
 */
export const convertToBlob = (filepath) => {
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
export const hasCordova = () => {
    return !!window['cordova'];
};
export const AppConstants = {
    INT_MAX_VALUE: 2147483647
};
export const openLink = (link, target = '_self') => {
    if (hasCordova() && _.startsWith(link, '#')) {
        location.hash = link;
    }
    else {
        window.open(link, target);
    }
};
/* util function to load the content from a url */
export const fetchContent = (dataType, url, inSync = false, success, error) => {
    return $.ajax({ type: 'get', dataType: dataType, url: url, async: !inSync })
        .done(response => success && success(response))
        .fail(reason => error && error(reason));
};
/**
 * If the given object is a promise, then object is returned. Otherwise, a promise is resolved with the given object.
 * @param {Promise<T> | T} a
 * @returns {Promise<T>}
 */
export const toPromise = (a) => {
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
export const retryIfFails = (fn, interval, maxRetries, onBeforeRetry = () => Promise.resolve(false)) => {
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
export const getAbortableDefer = () => {
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
export const createCSSRule = (ruleSelector, rules) => {
    const stylesheet = document.styleSheets[0];
    stylesheet.insertRule(`${ruleSelector} { ${rules} }`);
};
export const getUrlParams = (link) => {
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
export const getRouteNameFromLink = (link) => {
    link = link.replace('#/', '/');
    const index = link.indexOf('?');
    if (index !== -1) {
        link = link.substring(0, index);
    }
    return link;
};
export const isAppleProduct = /Mac|iPod|iPhone|iPad/.test(window.navigator.platform);
export const defer = () => {
    const d = {
        promise: null,
        resolve: noop,
        reject: noop
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
export const executePromiseChain = (fns, args, d, i) => {
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
export const isDataSourceEqual = (d1, d2) => {
    return d1.execute(DataSource.Operation.GET_UNIQUE_IDENTIFIER) === d2.execute(DataSource.Operation.GET_UNIQUE_IDENTIFIER) &&
        _.isEqual(d1.execute(DataSource.Operation.GET_CONTEXT_IDENTIFIER), d2.execute(DataSource.Operation.GET_CONTEXT_IDENTIFIER));
};
/**
 * checks if the passed datasource context matches with passed context
 * @param ds, datasource having a context
 * @param ctx, context to compare with
 * @returns {boolean}
 */
export const validateDataSourceCtx = (ds, ctx) => {
    return ds.execute(DataSource.Operation.GET_CONTEXT_IDENTIFIER) === ctx;
};
/**
 * This traverses the filterexpressions object recursively and process the bind string if any in the object
 * @param variable variable object
 * @param name name of the variable
 * @param context scope of the variable
 */
export const processFilterExpBindNode = (context, filterExpressions) => {
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
export const extendProto = (target, proto) => {
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
export const removeExtraSlashes = function (url) {
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
export const getDisplayDateTimeFormat = type => {
    return DEFAULT_DISPLAY_FORMATS[_.toUpper(type)];
};
// Generate for attribute on label and ID on input element, so that label elements are associated to form controls
export const addForIdAttributes = (element) => {
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
export const adjustContainerPosition = (containerElem, parentElem, ref, ele) => {
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
export const closePopover = (element) => {
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
export const detectChanges = $appDigest;
export { ɵ0, ɵ1, ɵ2, ɵ3 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29yZS8iLCJzb3VyY2VzIjpbInV0aWxzL3V0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBRS9CLE9BQU8sRUFBRSxzQkFBc0IsRUFBRSxNQUFNLHlCQUF5QixDQUFDO0FBRWpFLE9BQU8sRUFBRSxNQUFNLEVBQUUsVUFBVSxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBQy9DLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxnQkFBZ0IsQ0FBQztBQUMxQyxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sZ0JBQWdCLENBQUM7QUFDNUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLE9BQU8sQ0FBQztBQVFoQyxNQUFNLFNBQVMsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FBQztBQUM3QyxNQUFNLEtBQUssR0FBRztJQUNWLFVBQVUsRUFBRSxRQUFRO0lBQ3BCLE9BQU8sRUFBRSxVQUFVO0lBQ25CLE1BQU0sRUFBRSxTQUFTO0lBQ2pCLElBQUksRUFBRSxPQUFPO0lBQ2IsSUFBSSxFQUFFLE9BQU87SUFDYixjQUFjLEVBQUUsMkRBQTJEO0lBQzNFLE1BQU0sRUFBRSxTQUFTO0lBQ2pCLE9BQU8sRUFBRSxnQkFBZ0I7SUFDekIsc0JBQXNCLEVBQUUsaURBQWlEO0lBQ3pFLHFCQUFxQixFQUFFLDhHQUE4RztJQUNySSxzQkFBc0IsRUFBRSxvQ0FBb0M7SUFDNUQsc0JBQXNCLEVBQUUscUNBQXFDO0lBQzdELGtCQUFrQixFQUFFLG1DQUFtQztJQUN2RCxzQkFBc0IsRUFBRSxvQkFBb0I7SUFDNUMsV0FBVyxFQUFFLHVEQUF1RDtJQUNwRSxhQUFhLEVBQUUsOEVBQThFO0lBQzdGLG1CQUFtQixFQUFFLDRFQUE0RTtJQUNqRyxrQkFBa0IsRUFBRSxtREFBbUQ7SUFDdkUsZUFBZSxFQUFFLGlCQUFpQjtJQUNsQyxRQUFRLEVB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YyxDQUFDLE1BQU0sQ0FBQyxHQUFHLGVBQWUsRUFBRTtRQUN4RSxNQUFNLE1BQU0sR0FBRyxTQUFTLEdBQUcsZUFBZSxDQUFDO1FBQzNDLEdBQUcsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUU7WUFDaEMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEVBQUcsTUFBTSxHQUFHLElBQUksQ0FBQyxDQUFDO1FBQzdDLENBQUMsQ0FBQyxDQUFDO0tBQ047QUFFTCxDQUFDLENBQUM7QUFFRiwwQkFBMEI7QUFDMUIsTUFBTSxDQUFDLE1BQU0sWUFBWSxHQUFHLENBQUMsT0FBTyxFQUFFLEVBQUU7SUFDcEMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUMsTUFBTSxFQUFFO1FBQ3pDLE1BQU0sZUFBZSxHQUFHLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO1FBQzFFLENBQUMsQ0FBQyxPQUFPLENBQUMsZUFBZSxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUU7WUFDL0IsSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLE1BQU0sRUFBRTtnQkFDbkIsR0FBRyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO2FBQzdCO1FBQ0wsQ0FBQyxDQUFDLENBQUM7S0FDTjtBQUNMLENBQUMsQ0FBQztBQUVGOzs7OztHQUtHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sYUFBYSxHQUFHLFVBQVUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFN1YmplY3QgfSBmcm9tICdyeGpzJztcblxuaW1wb3J0IHsgZ2V0V21Qcm9qZWN0UHJvcGVydGllcyB9IGZyb20gJy4vd20tcHJvamVjdC1wcm9wZXJ0aWVzJztcblxuaW1wb3J0IHsgJHdhdGNoLCAkYXBwRGlnZXN0IH0gZnJvbSAnLi93YXRjaGVyJztcbmltcG9ydCB7IERhdGFUeXBlIH0gZnJvbSAnLi4vZW51bXMvZW51bXMnO1xuaW1wb3J0IHsgRGF0YVNvdXJjZSB9IGZyb20gJy4uL3R5cGVzL3R5cGVzJztcbmltcG9ydCB7IHNldEF0dHIgfSBmcm9tICcuL2RvbSc7XG5cbmRlY2xhcmUgY29uc3QgXywgWDJKUztcbmRlY2xhcmUgY29uc3QgbW9tZW50O1xuZGVjbGFyZSBjb25zdCBkb2N1bWVudDtcbmRlY2xhcmUgY29uc3QgcmVzb2x2ZUxvY2FsRmlsZVN5c3RlbVVSTDtcbmRlY2xhcmUgY29uc3QgJDtcblxuY29uc3QgdXNlckFnZW50ID0gd2luZG93Lm5hdmlnYXRvci51c2VyQWdlbnQ7XG5jb25zdCBSRUdFWCA9IHtcbiAgICBTTkFLRV9DQVNFOiAvW0EtWl0vZyxcbiAgICBBTkRST0lEOiAvQW5kcm9pZC9pLFxuICAgIElQSE9ORTogL2lQaG9uZS9pLFxuICAgIElQT0Q6IC9pUG9kL2ksXG4gICAgSVBBRDogL2lQYWQvaSxcbiAgICBBTkRST0lEX1RBQkxFVDogL2FuZHJvaWR8YW5kcm9pZCAzLjB8eG9vbXxzY2gtaTgwMHxwbGF5Ym9va3x0YWJsZXR8a2luZGxlL2ksXG4gICAgTU9CSUxFOiAvTW9iaWxlL2ksXG4gICAgV0lORE9XUzogL1dpbmRvd3MgUGhvbmUvaSxcbiAgICBTVVBQT1JURURfSU1BR0VfRk9STUFUOiAvXFwuKGJtcHxnaWZ8anBlfGpwZ3xqcGVnfHRpZnx0aWZmfHBibXxwbmd8aWNvKSQvaSxcbiAgICBTVVBQT1JURURfRklMRV9GT1JNQVQ6IC9cXC4odHh0fGpzfGNzc3xodG1sfHNjcmlwdHxwcm9wZXJ0aWVzfGpzb258amF2YXx4bWx8c21kfHhtaXxzcWx8bG9nfHdzZGx8dm18ZnRsfGpyeG1sfHltbHx5YW1sfG1kfGxlc3N8anNwKSQvaSxcbiAgICBTVVBQT1JURURfQVVESU9fRk9STUFUOiAvXFwuKG1wM3xvZ2d8d2VibXx3bWF8M2dwfHdhdnxtNGEpJC9pLFxuICAgIFNVUFBPUlRFRF9WSURFT19GT1JNQVQ6IC9cXC4obXA0fG9nZ3x3ZWJtfHdtdnxtcGVnfG1wZ3xhdmkpJC9pLFxuICAgIFBBR0VfUkVTT1VSQ0VfUEFUSDogL15cXC9wYWdlc1xcLy4qXFwuKGpzfGNzc3xodG1sfGpzb24pJC8sXG4gICAgTUlOX1BBR0VfUkVTT1VSQ0VfUEFUSDogLy4qKHBhZ2UubWluLmh0bWwpJC8sXG4gICAgVkFMSURfRU1BSUw6IC9eW2EtekEtWl1bXFx3LitdK0BbYS16QS1aX10rP1xcLlthLXpBLVouXXsxLDR9W2EtekEtWl0kLyxcbiAgICBWQUxJRF9XRUJfVVJMOiAvXihodHRwW3NdPzpcXC9cXC8pKHd3d1xcLil7MCwxfVthLXpBLVowLTk9Oj9cXC9cXC5cXC1dKyhcXC5bYS16QS1aXXsyLDV9W1xcLl17MCwxfSk/LyxcbiAgICBWQUxJRF9XRUJTT0NLRVRfVVJMOiAvXih3c1tzXT86XFwvXFwvKSh3d3dcXC4pezAsMX1bYS16QS1aMC05PTo/XFwvXFwuXFwtXSsoXFwuW2EtekEtWl17Miw1fVtcXC5dezAsMX0pPy8sXG4gICAgVkFMSURfUkVMQVRJVkVfVVJMOiAvXig/IXd3d1xcLnwoPzpodHRwfGZ0cClzPzpcXC9cXC98W0EtWmEtel06XFxcXHxcXC9cXC8pLiovLFxuICAgIFJFUExBQ0VfUEFUVEVSTjogL1xcJFxceyhbXlxcfV0rKVxcfS9nLFxuICAgIFpJUF9GSUxFOiAvXFwuemlwJC9pLFxuICAgIEVYRV9GSUxFOiAvXFwuZXhlJC9pLFxuICAgIE5PX1FVT1RFU19BTExPV0VEOiAvXlteJ3xcIl0qJC8sXG4gICAgTk9fRE9VQkxFX1FVT1RFU19BTExPV0VEOiAvXlteXCJdKiQvLFxuICAgIFZBTElEX0hUTUw6IC88W2Etel1bXFxzXFxTXSo+L2ksXG4gICAgVkFMSURfUEFTU1dPUkQ6IC9eWzAtOWEtekEtWi1fLkAmKiEjJCVdKyQvLFxuICAgIFNQRUNJQUxfQ0hBUkFDVEVSUzogL1teQS1aMC05YS16X10rL2ksXG4gICAgQVBQX1NFUlZFUl9VUkxfRk9STUFUOiAvXihodHRwW3NdPzpcXC9cXC8pKHd3d1xcLil7MCwxfVthLXpBLVowLTlcXC5cXC1dKyhbOl0/WzAtOV17Miw1fXxcXC5bYS16QS1aXXsyLDV9W1xcLl17MCwxfSlcXC8rW14/IyY9XSskLyxcbiAgICBKU09OX0RBVEVfRk9STUFUOiAvXFxkezR9LVswLTFdXFxkLVswLTNdXFxkKFRbMC0yXVxcZDpbMC01XVxcZDpbMC01XVxcZC5cXGR7MSwzfVokKT8vXG59LFxuICAgIGNvbXBhcmVCeVNlcGFyYXRvciA9ICc6JztcblxuY29uc3QgTlVNQkVSX1RZUEVTID0gWydpbnQnLCBEYXRhVHlwZS5JTlRFR0VSLCBEYXRhVHlwZS5GTE9BVCwgRGF0YVR5cGUuRE9VQkxFLCBEYXRhVHlwZS5MT05HLCBEYXRhVHlwZS5TSE9SVCwgRGF0YVR5cGUuQllURSwgRGF0YVR5cGUuQklHX0lOVEVHRVIsIERhdGFUeXBlLkJJR19ERUNJTUFMXTtcbmNvbnN0IG5vdzogRGF0ZSA9IG5ldyBEYXRlKCk7XG5jb25zdCBDVVJSRU5UX0RBVEUgPSAnQ1VSUkVOVF9EQVRFJztcblxuZXhwb3J0IGNvbnN0IGVudW0gRVZFTlRfTElGRSB7T05DRSwgV0lORE9XfVxuXG5leHBvcnQgY29uc3QgaXNEZWZpbmVkID0gdiA9PiAndW5kZWZpbmVkJyAhPT0gdHlwZW9mIHY7XG5cbmV4cG9ydCBjb25zdCBpc09iamVjdCA9IHYgPT4gbnVsbCAhPT0gdiAmJiAnb2JqZWN0JyA9PT0gdHlwZW9mIHY7XG5cbmV4cG9ydCBjb25zdCB0b0Jvb2xlYW4gPSAodmFsLCBpZGVudGl0eT8pID0+ICgodmFsICYmIHZhbCAhPT0gJ2ZhbHNlJykgPyB0cnVlIDogKGlkZW50aXR5ID8gdmFsID09PSBpZGVudGl0eSA6IGZhbHNlKSk7XG5cbmZ1bmN0aW9uIGlzSUUxMSAoKSB7XG4gICAgcmV0dXJuIHdpbmRvdy5uYXZpZ2F0b3IuYXBwVmVyc2lvbi5pbmRleE9mKCdUcmlkZW50LycpID4gLTE7XG59XG5cbmV4cG9ydCBjb25zdCBpc0lFID0gKCkgPT4ge1xuICAgIHJldHVybiBpc0lFMTEoKSB8fCB3aW5kb3cubmF2aWdhdG9yLnVzZXJBZ2VudC5pbmRleE9mKCdNU0lFJykgPiAtMTtcbn07XG5cblxuZXhwb3J0IGNvbnN0IGlzQW5kcm9pZCA9ICgpID0+IFJFR0VYLkFORFJPSUQudGVzdCh1c2VyQWdlbnQpO1xuXG5leHBvcnQgY29uc3QgaXNBbmRyb2lkVGFibGV0ID0gKCkgPT4gUkVHRVguQU5EUk9JRF9UQUJMRVQudGVzdCh1c2VyQWdlbnQpO1xuXG5leHBvcnQgY29uc3QgaXNJcGhvbmUgPSAoKSA9PiBSRUdFWC5JUEhPTkUudGVzdCh1c2VyQWdlbnQpO1xuZXhwb3J0IGNvbnN0IGlzSXBvZCA9ICgpID0+IFJFR0VYLklQT0QudGVzdCh1c2VyQWdlbnQpO1xuZXhwb3J0IGNvbnN0IGlzSXBhZCA9ICgpID0+IFJFR0VYLklQQUQudGVzdCh1c2VyQWdlbnQpO1xuZXhwb3J0IGNvbnN0IGlzSW9zID0gKCkgPT4gaXNJcGhvbmUoKSB8fCBpc0lwb2QoKSB8fCBpc0lwYWQoKTtcblxuZXhwb3J0IGNvbnN0IGlzTW9iaWxlID0gKCkgPT4gaXNBbmRyb2lkKCkgfHwgaXNJb3MoKSB8fCBpc0FuZHJvaWRUYWJsZXQoKSB8fCAkKCcjd20tbW9iaWxlLWRpc3BsYXk6dmlzaWJsZScpLmxlbmd0aCA+IDA7XG5cbmV4cG9ydCBjb25zdCBpc01vYmlsZUFwcCA9ICgpID0+IGdldFdtUHJvamVjdFByb3BlcnRpZXMoKS5wbGF0Zm9ybVR5cGUgPT09ICdNT0JJTEUnICYmIGdldFdtUHJvamVjdFByb3BlcnRpZXMoKS50eXBlID09PSAnQVBQTElDQVRJT04nO1xuXG5leHBvcnQgY29uc3QgZ2V0QW5kcm9pZFZlcnNpb24gPSAoKSA9PiB7XG4gICAgY29uc3QgbWF0Y2ggPSAod2luZG93Lm5hdmlnYXRvci51c2VyQWdlbnQudG9Mb3dlckNhc2UoKSkubWF0Y2goL2FuZHJvaWRcXHMoWzAtOVxcLl0qKS8pO1xuICAgIHJldHVybiBtYXRjaCA/IG1hdGNoWzFdIDogJyc7XG59O1xuXG5leHBvcnQgY29uc3QgaXNLaXRrYXREZXZpY2UgPSAoKSA9PiBpc0FuZHJvaWQoKSAmJiBwYXJzZUludChnZXRBbmRyb2lkVmVyc2lvbigpLCAxMCkgPT09IDQ7XG5cbi8qKlxuICogdGhpcyBtZXRob2QgZW5jb2RlcyB0aGUgdXJsIGFuZCByZXR1cm5zIHRoZSBlbmNvZGVkIHN0cmluZ1xuICovXG5leHBvcnQgY29uc3QgZW5jb2RlVXJsID0gKHVybDogc3RyaW5nKTogc3RyaW5nID0+IHtcbiAgICBjb25zdCBpbmRleCA9IHVybC5pbmRleE9mKCc/Jyk7XG4gICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgLy8gZW5jb2RlIHRoZSByZWxhdGl2ZSBwYXRoXG4gICAgICAgIHVybCA9IGVuY29kZVVSSSh1cmwuc3Vic3RyaW5nKDAsIGluZGV4KSkgKyB1cmwuc3Vic3RyaW5nKGluZGV4KTtcbiAgICAgICAgLy8gZW5jb2RlIHVybCBwYXJhbXMsIG5vdCBlbmNvZGVkIHRocm91Z2ggZW5jb2RlVVJJXG4gICAgICAgIHVybCA9IGVuY29kZVVybFBhcmFtcyh1cmwpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHVybCA9IGVuY29kZVVSSSh1cmwpO1xuICAgIH1cblxuICAgIHJldHVybiB1cmw7XG59O1xuXG4vKipcbiAqIHRoaXMgbWV0aG9kIGVuY29kZXMgdGhlIHVybCBwYXJhbXMgYW5kIGlzIHByaXZhdGUgdG8gdGhlIGNsYXNzIG9ubHlcbiAqL1xuZXhwb3J0IGNvbnN0IGVuY29kZVVybFBhcmFtcyA9ICh1cmw6IHN0cmluZyk6IHN0cmluZyA9PiB7XG4gICAgbGV0IHF1ZXJ5UGFyYW1zLCBlbmNvZGVkUGFyYW1zID0gJycsIHF1ZXJ5UGFyYW1zU3RyaW5nLCBpbmRleDtcbiAgICBpbmRleCA9IHVybC5pbmRleE9mKCc/Jyk7XG4gICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgaW5kZXggKz0gMTtcbiAgICAgICAgcXVlcnlQYXJhbXNTdHJpbmcgPSB1cmwuc3Vic3RyaW5nKGluZGV4KTtcbiAgICAgICAgLy8gRW5jb2RpbmcgdGhlIHF1ZXJ5IHBhcmFtcyBpZiBleGlzdFxuICAgICAgICBpZiAocXVlcnlQYXJhbXNTdHJpbmcpIHtcbiAgICAgICAgICAgIHF1ZXJ5UGFyYW1zID0gcXVlcnlQYXJhbXNTdHJpbmcuc3BsaXQoJyYnKTtcbiAgICAgICAgICAgIHF1ZXJ5UGFyYW1zLmZvckVhY2goZnVuY3Rpb24gKHBhcmFtKSB7XG4gICAgICAgICAgICAgICAgbGV0IGRlY29kZWRQYXJhbVZhbHVlO1xuICAgICAgICAgICAgICAgIGNvbnN0IGkgPSBfLmluY2x1ZGVzKHBhcmFtLCAnPScpID8gcGFyYW0uaW5kZXhPZignPScpIDogKHBhcmFtICYmIHBhcmFtLmxlbmd0aCksXG4gICAgICAgICAgICAgICAgICAgIHBhcmFtTmFtZSA9IHBhcmFtLnN1YnN0cigwLCBpKSxcbiAgICAgICAgICAgICAgICAgICAgcGFyYW1WYWx1ZSA9IHBhcmFtLnN1YnN0cihpICsgMSk7XG5cbiAgICAgICAgICAgICAgICAvLyBhZGQgdGhlID0gZm9yIHBhcmFtIG5hbWUgb25seSB3aGVuIHRoZSBwYXJhbSB2YWx1ZSBleGlzdHMgaW4gdGhlIGdpdmVuIHBhcmFtIG9yIGVtcHR5IHZhbHVlIGlzIGFzc2lnbmVkXG4gICAgICAgICAgICAgICAgaWYgKHBhcmFtVmFsdWUgfHwgXy5pbmNsdWRlcyhwYXJhbSwgJz0nKSkge1xuICAgICAgICAgICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVjb2RlZFBhcmFtVmFsdWUgPSBkZWNvZGVVUklDb21wb25lbnQocGFyYW1WYWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlY29kZWRQYXJhbVZhbHVlID0gcGFyYW1WYWx1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbmNvZGVkUGFyYW1zICs9IHBhcmFtTmFtZSArICc9JyArIGVuY29kZVVSSUNvbXBvbmVudChkZWNvZGVkUGFyYW1WYWx1ZSkgKyAnJic7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZW5jb2RlZFBhcmFtcyArPSBwYXJhbU5hbWUgKyAnJic7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBlbmNvZGVkUGFyYW1zID0gZW5jb2RlZFBhcmFtcy5zbGljZSgwLCAtMSk7XG4gICAgICAgICAgICB1cmwgPSB1cmwucmVwbGFjZShxdWVyeVBhcmFtc1N0cmluZywgZW5jb2RlZFBhcmFtcyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHVybDtcbn07XG5cbi8qIGNhcGl0YWxpemUgdGhlIGZpcnN0LWxldHRlciBvZiB0aGUgc3RyaW5nIHBhc3NlZCAqL1xuZXhwb3J0IGNvbnN0IGluaXRDYXBzID0gbmFtZSA9PiB7XG4gICAgaWYgKCFuYW1lKSB7XG4gICAgICAgIHJldHVybiAnJztcbiAgICB9XG4gICAgcmV0dXJuIG5hbWUuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBuYW1lLnN1YnN0cmluZygxKTtcbn07XG5cbi8qIGNvbnZlcnQgY2FtZWxDYXNlIHN0cmluZyB0byBhIHNwYWNlIHNlcGFyYXRlZCBzdHJpbmcgKi9cbmV4cG9ydCBjb25zdCBzcGFjZVNlcGFyYXRlID0gbmFtZSA9PiB7XG4gICAgaWYgKG5hbWUgPT09IG5hbWUudG9VcHBlckNhc2UoKSkge1xuICAgICAgICByZXR1cm4gbmFtZTtcbiAgICB9XG4gICAgcmV0dXJuIG5hbWUucmVwbGFjZShSRUdFWC5TTkFLRV9DQVNFLCBmdW5jdGlvbiAobGV0dGVyLCBwb3MpIHtcbiAgICAgICAgcmV0dXJuIChwb3MgPyAnICcgOiAnJykgKyBsZXR0ZXI7XG4gICAgfSk7XG59O1xuXG4vKlJlcGxhY2UgdGhlIGNoYXJhY3RlciBhdCBhIHBhcnRpY3VsYXIgaW5kZXgqL1xuZXhwb3J0IGNvbnN0IHJlcGxhY2VBdCA9IChzdHJpbmcsIGluZGV4LCBjaGFyYWN0ZXIpID0+IHN0cmluZy5zdWJzdHIoMCwgaW5kZXgpICsgY2hhcmFjdGVyICsgc3RyaW5nLnN1YnN0cihpbmRleCArIGNoYXJhY3Rlci5sZW5ndGgpO1xuXG4vKlJlcGxhY2UgJy4nIHdpdGggc3BhY2UgYW5kIGNhcGl0YWxpemUgdGhlIG5leHQgbGV0dGVyKi9cbmV4cG9ydCBjb25zdCBwZXJpb2RTZXBhcmF0ZSA9IG5hbWUgPT4ge1xuICAgIGxldCBkb3RJbmRleDtcbiAgICBkb3RJbmRleCA9IG5hbWUuaW5kZXhPZignLicpO1xuICAgIGlmIChkb3RJbmRleCAhPT0gLTEpIHtcbiAgICAgICAgbmFtZSA9IHJlcGxhY2VBdChuYW1lLCBkb3RJbmRleCArIDEsIG5hbWUuY2hhckF0KGRvdEluZGV4ICsgMSkudG9VcHBlckNhc2UoKSk7XG4gICAgICAgIG5hbWUgPSByZXBsYWNlQXQobmFtZSwgZG90SW5kZXgsICcgJyk7XG4gICAgfVxuICAgIHJldHVybiBuYW1lO1xufTtcblxuZXhwb3J0IGNvbnN0IHByZXR0aWZ5TGFiZWwgPSBsYWJlbCA9PiB7XG4gICAgbGFiZWwgPSBfLmNhbWVsQ2FzZShsYWJlbCk7XG4gICAgLypjYXBpdGFsaXplIHRoZSBpbml0aWFsIExldHRlciovXG4gICAgbGFiZWwgPSBpbml0Q2FwcyhsYWJlbCk7XG4gICAgLypDb252ZXJ0IGNhbWVsIGNhc2Ugd29yZHMgdG8gc2VwYXJhdGVkIHdvcmRzKi9cbiAgICBsYWJlbCA9IHNwYWNlU2VwYXJhdGUobGFiZWwpO1xuICAgIC8qUmVwbGFjZSAnLicgd2l0aCBzcGFjZSBhbmQgY2FwaXRhbGl6ZSB0aGUgbmV4dCBsZXR0ZXIqL1xuICAgIGxhYmVsID0gcGVyaW9kU2VwYXJhdGUobGFiZWwpO1xuICAgIHJldHVybiBsYWJlbDtcbn07XG5cbmV4cG9ydCBjb25zdCBkZUh5cGhlbmF0ZSA9IChuYW1lKSA9PiB7XG4gICAgcmV0dXJuIG5hbWUuc3BsaXQoJy0nKS5qb2luKCcgJyk7XG59O1xuXG4vKkFjY2VwdHMgYW4gYXJyYXkgb3IgYSBzdHJpbmcgc2VwYXJhdGVkIHdpdGggc3ltYm9sIGFuZCByZXR1cm5zIHByZXR0aWZpZWQgcmVzdWx0Ki9cbmV4cG9ydCBjb25zdCBwcmV0dGlmeUxhYmVscyA9IChuYW1lcywgc2VwYXJhdG9yID0gJywnKSA9PiB7XG4gICAgbGV0IG1vZGlmaWVkTmFtZXMsIG5hbWVzQXJyYXkgPSBbXTtcblxuICAgIGlmICghXy5pc0FycmF5KG5hbWVzKSkge1xuICAgICAgICBuYW1lc0FycmF5ID0gXy5zcGxpdChuYW1lcywgc2VwYXJhdG9yKTtcbiAgICB9XG5cbiAgICBtb2RpZmllZE5hbWVzID0gXy5tYXAobmFtZXNBcnJheSwgcHJldHRpZnlMYWJlbCk7XG4gICAgaWYgKF8uaXNBcnJheShuYW1lcykpIHtcbiAgICAgICAgcmV0dXJuIG1vZGlmaWVkTmFtZXM7XG4gICAgfVxuICAgIHJldHVybiBtb2RpZmllZE5hbWVzLmpvaW4oc2VwYXJhdG9yKTtcbn07XG5cbi8qKlxuICogdGhpcyBtZXRob2QgY2hlY2tzIGlmIGEgaW5zZWN1cmUgY29udGVudCByZXF1ZXN0IGlzIGJlaW5nIG1hZGVcbiAqL1xuZXhwb3J0IGNvbnN0IGlzSW5zZWN1cmVDb250ZW50UmVxdWVzdCA9ICh1cmw6IHN0cmluZyk6IGJvb2xlYW4gPT4ge1xuXG4gICAgY29uc3QgcGFyc2VyOiBIVE1MQW5jaG9yRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2EnKTtcbiAgICBwYXJzZXIuaHJlZiA9IHVybDtcblxuICAgIC8vIGZvciByZWxhdGl2ZSB1cmxzIElFIHJldHVybnMgdGhlIHByb3RvY29sIGFzIGVtcHR5IHN0cmluZ1xuICAgIGlmIChwYXJzZXIucHJvdG9jb2wgPT09ICcnKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoc3RyaW5nU3RhcnRzV2l0aChsb2NhdGlvbi5ocmVmLCAnaHR0cHM6Ly8nKSkge1xuICAgICAgICByZXR1cm4gcGFyc2VyLnByb3RvY29sICE9PSAnaHR0cHM6JyAmJiBwYXJzZXIucHJvdG9jb2wgIT09ICd3c3M6JztcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG59O1xuXG4vKipcbiAqIHRoaXMgbWV0aG9kIGNoZWNrcyBpZiBhIGdpdmVuIHN0cmluZyBzdGFydHMgd2l0aCB0aGUgZ2l2ZW4gc3RyaW5nXG4gKi9cbmV4cG9ydCBjb25zdCBzdHJpbmdTdGFydHNXaXRoID0gKHN0cjogc3RyaW5nLCBzdGFydHNXaXRoOiBzdHJpbmcsIGlnbm9yZUNhc2U/KTogYm9vbGVhbiA9PiB7XG4gICAgaWYgKCFzdHIpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGNvbnN0IHJlZ0V4ID0gbmV3IFJlZ0V4cCgnXicgKyBzdGFydHNXaXRoLCBpZ25vcmVDYXNlID8gJ2knIDogJycpO1xuXG4gICAgcmV0dXJuIHJlZ0V4LnRlc3Qoc3RyKTtcbn07XG5cbmV4cG9ydCBjb25zdCBnZXRFdmFsdWF0ZWRFeHByVmFsdWUgPSAob2JqZWN0LCBleHByZXNzaW9uKSA9PiB7XG4gICAgbGV0IHZhbDtcbiAgICAvKipcbiAgICAgKiBFdmFsdWF0ZSB0aGUgZXhwcmVzc2lvbiB3aXRoIHRoZSBzY29wZSBhbmQgb2JqZWN0LlxuICAgICAqICRldmFsIGlzIHVzZWQsIGFzIGV4cHJlc3Npb24gY2FuIGJlIGluIGZvcm1hdCBvZiBmaWVsZDEgKyAnICcgKyBmaWVsZDJcbiAgICAgKiAkZXZhbCBjYW4gZmFpbCwgaWYgZXhwcmVzc2lvbiBpcyBub3QgaW4gY29ycmVjdCBmb3JtYXQsIHNvIGF0dGVtcHQgdGhlIGV2YWwgZnVuY3Rpb25cbiAgICAgKi9cbiAgICB2YWwgPSBfLmF0dGVtcHQoZnVuY3Rpb24gKCkge1xuXG4gICAgICAgIGNvbnN0IGFyZ3NFeHByID0gT2JqZWN0LmtleXMob2JqZWN0KS5tYXAoKGZpZWxkTmFtZSkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGB2YXIgJHtmaWVsZE5hbWV9ID0gZGF0YVsnJHtmaWVsZE5hbWV9J107YDtcbiAgICAgICAgfSkuam9pbignICcpO1xuICAgICAgICBjb25zdCBmID0gbmV3IEZ1bmN0aW9uKCdkYXRhJywgYCR7YXJnc0V4cHJ9IHJldHVybiAgJHtleHByZXNzaW9ufWApO1xuICAgICAgICByZXR1cm4gZihvYmplY3QpO1xuICAgIH0pO1xuICAgIC8qKlxuICAgICAqICRldmFsIGZhaWxzIGlmIGZpZWxkIGV4cHJlc3Npb24gaGFzIHNwYWNlcy4gRXg6ICdmaWVsZCBuYW1lJyBvciAnZmllbGRAbmFtZSdcbiAgICAgKiBBcyBhIGZhbGxiYWNrLCBnZXQgdmFsdWUgZGlyZWN0bHkgZnJvbSBvYmplY3Qgb3Igc2NvcGVcbiAgICAgKi9cbiAgICBpZiAoXy5pc0Vycm9yKHZhbCkpIHtcbiAgICAgICAgdmFsID0gXy5nZXQob2JqZWN0LCBleHByZXNzaW9uKTtcbiAgICB9XG4gICAgcmV0dXJuIHZhbDtcbn07XG5cbi8qIGZ1bmN0aW9ucyBmb3IgcmVzb3VyY2UgVGFiKi9cbmV4cG9ydCBjb25zdCBpc0ltYWdlRmlsZSA9IChmaWxlTmFtZSkgPT4ge1xuICAgIHJldHVybiAoUkVHRVguU1VQUE9SVEVEX0lNQUdFX0ZPUk1BVCkudGVzdChmaWxlTmFtZSk7XG59O1xuXG5leHBvcnQgY29uc3QgaXNBdWRpb0ZpbGUgPSAoZmlsZU5hbWUpID0+IHtcbiAgICByZXR1cm4gKFJFR0VYLlNVUFBPUlRFRF9BVURJT19GT1JNQVQpLnRlc3QoZmlsZU5hbWUpO1xufTtcblxuZXhwb3J0IGNvbnN0IGlzVmlkZW9GaWxlID0gKGZpbGVOYW1lKSA9PiB7XG4gICAgcmV0dXJuIChSRUdFWC5TVVBQT1JURURfVklERU9fRk9STUFUKS50ZXN0KGZpbGVOYW1lKTtcbn07XG5cbmV4cG9ydCBjb25zdCBpc1ZhbGlkV2ViVVJMID0gKHVybDogc3RyaW5nKTogYm9vbGVhbiA9PiB7XG4gICAgcmV0dXJuIChSRUdFWC5WQUxJRF9XRUJfVVJMKS50ZXN0KHVybCk7XG59O1xuXG4vKlRoaXMgZnVuY3Rpb24gcmV0dXJucyB0aGUgdXJsIHRvIHRoZSByZXNvdXJjZSBhZnRlciBjaGVja2luZyB0aGUgdmFsaWRpdHkgb2YgdXJsKi9cbmV4cG9ydCBjb25zdCBnZXRSZXNvdXJjZVVSTCA9ICh1cmxTdHJpbmcpID0+IHtcbiAgICBpZiAoaXNWYWxpZFdlYlVSTCh1cmxTdHJpbmcpKSB7XG4gICAgICAgIC8qVE9ETzogVXNlIERvbVNhbml0aXplciovXG4gICAgICAgIC8vIHJldHVybiBzYW5pdGl6ZXIuYnlwYXNzU2VjdXJpdHlUcnVzdFJlc291cmNlVXJsKHVybFN0cmluZyk7XG4gICAgfVxuICAgIHJldHVybiB1cmxTdHJpbmc7XG59O1xuXG4vKmZ1bmN0aW9uIHRvIGNoZWNrIGlmIGZuIGlzIGEgZnVuY3Rpb24gYW5kIHRoZW4gZXhlY3V0ZSovXG5leHBvcnQgZnVuY3Rpb24gdHJpZ2dlckZuKGZuLCAuLi5hcmdtbnRzKSB7XG4gICAgLyogVXNlIG9mIHNsaWNlIG9uIGFyZ3VtZW50cyB3aWxsIG1ha2UgdGhpcyBmdW5jdGlvbiBub3Qgb3B0aW1pemFibGVcbiAgICAqIGh0dHBzOi8vZ2l0aHViLmNvbS9wZXRrYWFudG9ub3YvYmx1ZWJpcmQvd2lraS9PcHRpbWl6YXRpb24ta2lsbGVycyMzMi1sZWFraW5nLWFyZ3VtZW50c1xuICAgICogKi9cblxuICAgIGxldCBzdGFydCA9IDE7XG4gICAgY29uc3QgbGVuID0gYXJndW1lbnRzLmxlbmd0aCwgYXJncyA9IG5ldyBBcnJheShsZW4gLSBzdGFydCk7XG4gICAgZm9yIChzdGFydDsgc3RhcnQgPCBsZW47IHN0YXJ0KyspIHtcbiAgICAgICAgYXJnc1tzdGFydCAtIDFdID0gYXJndW1lbnRzW3N0YXJ0XTtcbiAgICB9XG5cbiAgICBpZiAoXy5pc0Z1bmN0aW9uKGZuKSkge1xuICAgICAgICByZXR1cm4gZm4uYXBwbHkobnVsbCwgYXJncyk7XG4gICAgfVxufVxuXG4vKipcbiAqIFRoaXMgbWV0aG9kIGlzIHVzZWQgdG8gZ2V0IHRoZSBmb3JtYXR0ZWQgZGF0ZVxuICovXG5leHBvcnQgY29uc3QgZ2V0Rm9ybWF0dGVkRGF0ZSA9IChkYXRlUGlwZSwgZGF0ZU9iaiwgZm9ybWF0OiBzdHJpbmcpOiBhbnkgPT4ge1xuICAgIGlmICghZGF0ZU9iaikge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBpZiAoZm9ybWF0ID09PSAndGltZXN0YW1wJykge1xuICAgICAgICByZXR1cm4gbW9tZW50KGRhdGVPYmopLnZhbHVlT2YoKTtcbiAgICB9XG4gICAgcmV0dXJuIGRhdGVQaXBlLnRyYW5zZm9ybShkYXRlT2JqLCBmb3JtYXQpO1xufTtcblxuLyoqXG4gKiBtZXRob2QgdG8gZ2V0IHRoZSBkYXRlIG9iamVjdCBmcm9tIHRoZSBpbnB1dCByZWNlaXZlZFxuICovXG5leHBvcnQgY29uc3QgZ2V0RGF0ZU9iaiA9ICh2YWx1ZSk6IERhdGUgPT4ge1xuICAgIC8qaWYgdGhlIHZhbHVlIGlzIGEgZGF0ZSBvYmplY3QsIG5vIG5lZWQgdG8gY292ZXJ0IGl0Ki9cbiAgICBpZiAoXy5pc0RhdGUodmFsdWUpKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG5cbiAgICAvKmlmIHRoZSB2YWx1ZSBpcyBhIHRpbWVzdGFtcCBzdHJpbmcsIGNvbnZlcnQgaXQgdG8gYSBudW1iZXIqL1xuICAgIGlmICghaXNOYU4odmFsdWUpKSB7XG4gICAgICAgIHZhbHVlID0gcGFyc2VJbnQodmFsdWUsIDEwKTtcbiAgICB9XG5cbiAgICBpZiAoIW1vbWVudCh2YWx1ZSkuaXNWYWxpZCgpIHx8IHZhbHVlID09PSAnJyB8fCB2YWx1ZSA9PT0gbnVsbCB8fCB2YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGxldCBkYXRlT2JqID0gbmV3IERhdGUodmFsdWUpO1xuICAgIC8qKlxuICAgICAqIGlmIGRhdGUgdmFsdWUgaXMgc3RyaW5nIFwiMjAtMDUtMjAxOVwiIHRoZW4gbmV3IERhdGUodmFsdWUpIHJldHVybiAyME1heTIwMTkgd2l0aCBjdXJyZW50IHRpbWUgaW4gSW5kaWEsXG4gICAgICogd2hlcmVhcyB0aGlzIHdpbGwgcmV0dXJuIDE5TWF5MjAxOSB3aXRoIHRpbWUgbGFnZ2luZyBmb3IgZmV3IGhvdXJzLlxuICAgICAqIFRoaXMgaXMgYmVjYXVzZSBpdCByZXR1cm5zIFVUQyB0aW1lIGkuZS4gQ29vcmRpbmF0ZWQgVW5pdmVyc2FsIFRpbWUgKFVUQykuXG4gICAgICogVG8gY3JlYXRlIGRhdGUgaW4gbG9jYWwgdGltZSB1c2UgbW9tZW50XG4gICAgICovXG4gICAgaWYgKF8uaXNTdHJpbmcodmFsdWUpKSB7XG4gICAgICAgIGRhdGVPYmogPSBuZXcgRGF0ZShtb21lbnQodmFsdWUpLmZvcm1hdCgpKTtcbiAgICB9XG5cbiAgICBpZiAodmFsdWUgPT09IENVUlJFTlRfREFURSB8fCBpc05hTihkYXRlT2JqLmdldERheSgpKSkge1xuICAgICAgICByZXR1cm4gbm93O1xuICAgIH1cbiAgICByZXR1cm4gZGF0ZU9iajtcbn07XG5cbmV4cG9ydCBjb25zdCBhZGRFdmVudExpc3RlbmVyT25FbGVtZW50ID0gKF9lbGVtZW50OiBFbGVtZW50LCBleGNsdWRlRWxlbWVudDogRWxlbWVudCwgbmF0aXZlRWxlbWVudDogRWxlbWVudCwgZXZlbnRUeXBlLCBpc0Ryb3BEb3duRGlzcGxheUVuYWJsZWRPbklucHV0LCBzdWNjZXNzQ0IsIGxpZmU6IEVWRU5UX0xJRkUsIGlzQ2FwdHVyZSA9IGZhbHNlKSA9PiB7XG4gICAgY29uc3QgZWxlbWVudDogRWxlbWVudCA9IF9lbGVtZW50O1xuICAgIGNvbnN0IGV2ZW50TGlzdGVuZXIgPSAoZXZlbnQpID0+IHtcbiAgICAgICAgaWYgKGV4Y2x1ZGVFbGVtZW50ICYmIChleGNsdWRlRWxlbWVudC5jb250YWlucyhldmVudC50YXJnZXQpIHx8IGV4Y2x1ZGVFbGVtZW50ID09PSBldmVudC50YXJnZXQpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG5hdGl2ZUVsZW1lbnQuY29udGFpbnMoZXZlbnQudGFyZ2V0KSkge1xuICAgICAgICAgICAgaWYgKCQoZXZlbnQudGFyZ2V0KS5pcygnaW5wdXQnKSAmJiAhaXNEcm9wRG93bkRpc3BsYXlFbmFibGVkT25JbnB1dCkge1xuICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKGV2ZW50VHlwZSwgZXZlbnRMaXN0ZW5lciwgaXNDYXB0dXJlKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAobGlmZSA9PT0gRVZFTlRfTElGRS5PTkNFKSB7XG4gICAgICAgICAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnRUeXBlLCBldmVudExpc3RlbmVyLCBpc0NhcHR1cmUpO1xuICAgICAgICB9XG4gICAgICAgIHN1Y2Nlc3NDQigpO1xuICAgIH07XG4gICAgZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKGV2ZW50VHlwZSwgZXZlbnRMaXN0ZW5lciwgaXNDYXB0dXJlKTtcbiAgICBjb25zdCByZW1vdmVFdmVudExpc3RlbmVyID0gKCkgPT4ge1xuICAgICAgICBlbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoZXZlbnRUeXBlLCBldmVudExpc3RlbmVyLCBpc0NhcHR1cmUpO1xuICAgIH07XG4gICAgcmV0dXJuIHJlbW92ZUV2ZW50TGlzdGVuZXI7XG59O1xuXG4vKipcbiAqIFJldHVybnMgYSBkZWVwIGNsb25lZCByZXBsaWNhIG9mIHRoZSBwYXNzZWQgb2JqZWN0L2FycmF5XG4gKiBAcGFyYW0gb2JqZWN0IG9iamVjdC9hcnJheSB0byBjbG9uZVxuICogQHJldHVybnMgYSBjbG9uZSBvZiB0aGUgcGFzc2VkIG9iamVjdFxuICovXG5leHBvcnQgY29uc3QgZ2V0Q2xvbmVkT2JqZWN0ID0gKG9iamVjdCkgPT4ge1xuICAgIHJldHVybiBfLmNsb25lRGVlcChvYmplY3QpO1xufTtcblxuZXhwb3J0IGNvbnN0IGdldEZpbGVzID0gKGZvcm1OYW1lLCBmaWVsZE5hbWUsIGlzTGlzdCkgPT4ge1xuICAgIGNvbnN0IGZpbGVzID0gXy5nZXQoZG9jdW1lbnQuZm9ybXMsIFtmb3JtTmFtZSAsIGZpZWxkTmFtZSwgJ2ZpbGVzJ10pO1xuICAgIHJldHVybiBpc0xpc3QgPyBfLm1hcChmaWxlcywgXy5pZGVudGl0eSkgOiBmaWxlcyAmJiBmaWxlc1swXTtcbn07XG5cbi8qRnVuY3Rpb24gdG8gZ2VuZXJhdGUgYSByYW5kb20gbnVtYmVyKi9cbmZ1bmN0aW9uIHJhbmRvbSgpIHtcbiAgICByZXR1cm4gTWF0aC5mbG9vcigoMSArIE1hdGgucmFuZG9tKCkpICogMHgxMDAwMCkudG9TdHJpbmcoMTYpLnN1YnN0cmluZygxKTtcbn1cblxuLypGdW5jdGlvbiB0byBnZW5lcmF0ZSBhIGd1aWQgYmFzZWQgb24gcmFuZG9tIG51bWJlcnMuKi9cbmV4cG9ydCBjb25zdCBnZW5lcmF0ZUdVSWQgPSAoKSA9PiB7XG4gICAgcmV0dXJuIHJhbmRvbSgpICsgJy0nICsgcmFuZG9tKCkgKyAnLScgKyByYW5kb20oKTtcbn07XG5cbi8qKlxuICogVmFsaWRhdGUgaWYgZ2l2ZW4gYWNjZXNzIHJvbGUgaXMgaW4gY3VycmVudCBsb2dnZWRpbiB1c2VyIGFjY2VzcyByb2xlc1xuICovXG5leHBvcnQgY29uc3QgdmFsaWRhdGVBY2Nlc3NSb2xlcyA9IChyb2xlRXhwLCBsb2dnZWRJblVzZXIpID0+IHtcbiAgICBsZXQgcm9sZXM7XG5cbiAgICBpZiAocm9sZUV4cCAmJiBsb2dnZWRJblVzZXIpIHtcblxuICAgICAgICByb2xlcyA9IHJvbGVFeHAgJiYgcm9sZUV4cC5zcGxpdCgnLCcpLm1hcChGdW5jdGlvbi5wcm90b3R5cGUuY2FsbCwgU3RyaW5nLnByb3RvdHlwZS50cmltKTtcblxuICAgICAgICByZXR1cm4gXy5pbnRlcnNlY3Rpb24ocm9sZXMsIGxvZ2dlZEluVXNlci51c2VyUm9sZXMpLmxlbmd0aDtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbn07XG5cbmV4cG9ydCBjb25zdCBnZXRWYWxpZEpTT04gPSAoY29udGVudCkgPT4ge1xuICAgIGlmICghY29udGVudCkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICBjb25zdCBwYXJzZWRJbnRWYWx1ZSA9IHBhcnNlSW50KGNvbnRlbnQsIDEwKTtcbiAgICAgICAgLypvYnRhaW5pbmcganNvbiBmcm9tIGVkaXRvciBjb250ZW50IHN0cmluZyovXG4gICAgICAgIHJldHVybiBpc09iamVjdChjb250ZW50KSB8fCAhaXNOYU4ocGFyc2VkSW50VmFsdWUpID8gY29udGVudCA6IEpTT04ucGFyc2UoY29udGVudCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAvKnRlcm1pbmF0aW5nIGV4ZWN1dGlvbiBpZiBuZXcgdmFyaWFibGUgb2JqZWN0IGlzIG5vdCB2YWxpZCBqc29uLiovXG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxufTtcblxuZXhwb3J0IGNvbnN0IHhtbFRvSnNvbiA9ICh4bWxTdHJpbmcpID0+IHtcbiAgICBjb25zdCB4MmpzT2JqID0gbmV3IFgySlMoeydlbXB0eU5vZGVGb3JtJzogJ2NvbnRlbnQnLCAnYXR0cmlidXRlUHJlZml4JzogJycsICdlbmFibGVUb1N0cmluZ0Z1bmMnOiBmYWxzZX0pO1xuICAgIGxldCBqc29uID0geDJqc09iai54bWwyanMoeG1sU3RyaW5nKTtcbiAgICBpZiAoanNvbikge1xuICAgICAgICBqc29uID0gXy5nZXQoanNvbiwgT2JqZWN0LmtleXMoanNvbilbMF0pO1xuICAgIH1cbiAgICByZXR1cm4ganNvbjtcbn07XG5cbi8qXG4gKiBVdGlsIG1ldGhvZCB0byBmaW5kIHRoZSB2YWx1ZSBvZiBhIGtleSBpbiB0aGUgb2JqZWN0XG4gKiBpZiBrZXkgbm90IGZvdW5kIGFuZCBjcmVhdGUgaXMgdHJ1ZSwgYW4gb2JqZWN0IGlzIGNyZWF0ZWQgYWdhaW5zdCB0aGF0IG5vZGVcbiAqIEV4YW1wbGVzOlxuICogdmFyIGEgPSB7XG4gKiAgYjoge1xuICogICAgICBjIDoge1xuICogICAgICAgICAgZDogJ3Rlc3QnXG4gKiAgICAgIH1cbiAqICB9XG4gKiB9XG4gKiBVdGlscy5maW5kVmFsdWUoYSwgJ2IuYy5kJykgLS0+ICd0ZXN0J1xuICogVXRpbHMuZmluZFZhbHVlKGEsICdiLmMnKSAtLT4ge2Q6ICd0ZXN0J31cbiAqIFV0aWxzLmZpbmRWYWx1ZShhLCAnZScpIC0tPiB1bmRlZmluZWRcbiAqIFV0aWxzLmZpbmRWYWx1ZShhLCAnZScsIHRydWUpIC0tPiB7fSBhbmQgYSB3aWxsIGJlY29tZTpcbiAqIHtcbiAqICAgYjoge1xuICogICAgICBjIDoge1xuICogICAgICAgICAgZDogJ3Rlc3QnXG4gKiAgICAgIH1cbiAqICB9LFxuICogIGU6IHtcbiAqICB9XG4gKiB9XG4gKi9cbmV4cG9ydCBjb25zdCBmaW5kVmFsdWVPZiA9IChvYmosIGtleSwgY3JlYXRlPykgPT4ge1xuXG4gICAgaWYgKCFvYmogfHwgIWtleSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCFjcmVhdGUpIHtcbiAgICAgICAgcmV0dXJuIF8uZ2V0KG9iaiwga2V5KTtcbiAgICB9XG5cbiAgICBjb25zdCBwYXJ0cyA9IGtleS5zcGxpdCgnLicpLFxuICAgICAgICBrZXlzID0gW107XG5cbiAgICBsZXQgc2tpcFByb2Nlc3Npbmc7XG5cbiAgICBwYXJ0cy5mb3JFYWNoKChwYXJ0KSA9PiB7XG4gICAgICAgIGlmICghcGFydHMubGVuZ3RoKSB7IC8vIGlmIHRoZSBwYXJ0IG9mIGEga2V5IGlzIG5vdCB2YWxpZCwgc2tpcCB0aGUgcHJvY2Vzc2luZy5cbiAgICAgICAgICAgIHNraXBQcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHN1YlBhcnRzID0gcGFydC5tYXRjaCgvXFx3Ky9nKTtcbiAgICAgICAgbGV0IHN1YlBhcnQ7XG5cbiAgICAgICAgd2hpbGUgKHN1YlBhcnRzLmxlbmd0aCkge1xuICAgICAgICAgICAgc3ViUGFydCA9IHN1YlBhcnRzLnNoaWZ0KCk7XG4gICAgICAgICAgICBrZXlzLnB1c2goeydrZXknOiBzdWJQYXJ0LCAndmFsdWUnOiBzdWJQYXJ0cy5sZW5ndGggPyBbXSA6IHt9fSk7IC8vIGRldGVybWluZSB3aGV0aGVyIHRvIGNyZWF0ZSBhbiBhcnJheSBvciBhbiBvYmplY3RcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgaWYgKHNraXBQcm9jZXNzaW5nKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAga2V5cy5mb3JFYWNoKChfa2V5KSA9PiB7XG4gICAgICAgIGxldCB0ZW1wT2JqID0gb2JqW19rZXkua2V5XTtcbiAgICAgICAgaWYgKCFpc09iamVjdCh0ZW1wT2JqKSkge1xuICAgICAgICAgICAgdGVtcE9iaiA9IGdldFZhbGlkSlNPTih0ZW1wT2JqKTtcbiAgICAgICAgICAgIGlmICghdGVtcE9iaikge1xuICAgICAgICAgICAgICAgIHRlbXBPYmogPSBfa2V5LnZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIG9ialtfa2V5LmtleV0gPSB0ZW1wT2JqO1xuICAgICAgICBvYmogPSB0ZW1wT2JqO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIG9iajtcbn07XG5cbi8qXG4qIGV4dHJhY3RzIGFuZCByZXR1cm5zIHRoZSBsYXN0IGJpdCBmcm9tIGZ1bGwgdHlwZVJlZiBvZiBhIGZpZWxkXG4qIGUuZy4gcmV0dXJucyAnU3RyaW5nJyBmb3IgdHlwZVJlZiA9ICdqYXZhLmxhbmcuU3RyaW5nJ1xuKiBAcGFyYW1zOiB7dHlwZVJlZn0gdHlwZSByZWZlcmVuY2VcbiovXG5leHBvcnQgY29uc3QgZXh0cmFjdFR5cGUgPSAodHlwZVJlZjogc3RyaW5nKTogc3RyaW5nID0+IHtcbiAgICBsZXQgdHlwZTtcbiAgICBpZiAoIXR5cGVSZWYpIHtcbiAgICAgICAgcmV0dXJuIERhdGFUeXBlLlNUUklORztcbiAgICB9XG4gICAgdHlwZSA9IHR5cGVSZWYgJiYgdHlwZVJlZi5zdWJzdHJpbmcodHlwZVJlZi5sYXN0SW5kZXhPZignLicpICsgMSk7XG4gICAgdHlwZSA9IHR5cGUgJiYgdHlwZS50b0xvd2VyQ2FzZSgpO1xuICAgIHR5cGUgPSB0eXBlID09PSBEYXRhVHlwZS5MT0NBTERBVEVUSU1FID8gRGF0YVR5cGUuREFURVRJTUUgOiB0eXBlO1xuICAgIHJldHVybiB0eXBlO1xufTtcblxuLyogcmV0dXJucyB0cnVlIGlmIHRoZSBwcm92aWRlZCBkYXRhIHR5cGUgbWF0Y2hlcyBudW1iZXIgdHlwZSAqL1xuZXhwb3J0IGNvbnN0IGlzTnVtYmVyVHlwZSA9ICh0eXBlOiBhbnkpOiBib29sZWFuID0+IHtcbiAgICByZXR1cm4gKE5VTUJFUl9UWVBFUy5pbmRleE9mKGV4dHJhY3RUeXBlKHR5cGUpLnRvTG93ZXJDYXNlKCkpICE9PSAtMSk7XG59O1xuXG4vKiBmdW5jdGlvbiB0byBjaGVjayBpZiBwcm92aWRlZCBvYmplY3QgaXMgZW1wdHkqL1xuZXhwb3J0IGNvbnN0IGlzRW1wdHlPYmplY3QgPSAob2JqOiBhbnkpOiBib29sZWFuID0+IHtcbiAgICBpZiAoaXNPYmplY3Qob2JqKSAmJiAhXy5pc0FycmF5KG9iaikpIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKG9iaikubGVuZ3RoID09PSAwO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59O1xuXG4vKkZ1bmN0aW9uIHRvIGNoZWNrIHdoZXRoZXIgdGhlIHNwZWNpZmllZCBvYmplY3QgaXMgYSBwYWdlYWJsZSBvYmplY3Qgb3Igbm90LiovXG5leHBvcnQgY29uc3QgaXNQYWdlYWJsZSA9IChvYmo6IGFueSk6IGJvb2xlYW4gPT4ge1xuICAgIGNvbnN0IHBhZ2VhYmxlID0ge1xuICAgICAgICAnY29udGVudCcgICAgICAgICA6IFtdLFxuICAgICAgICAnZmlyc3QnICAgICAgICAgICA6IHRydWUsXG4gICAgICAgICdsYXN0JyAgICAgICAgICAgIDogdHJ1ZSxcbiAgICAgICAgJ251bWJlcicgICAgICAgICAgOiAwLFxuICAgICAgICAnbnVtYmVyT2ZFbGVtZW50cyc6IDEwLFxuICAgICAgICAnc2l6ZScgICAgICAgICAgICA6IDIwLFxuICAgICAgICAnc29ydCcgICAgICAgICAgICA6IG51bGwsXG4gICAgICAgICd0b3RhbEVsZW1lbnRzJyAgIDogMTAsXG4gICAgICAgICd0b3RhbFBhZ2VzJyAgICAgIDogMVxuICAgIH07XG4gICAgcmV0dXJuIChfLmlzRXF1YWwoXy5rZXlzKHBhZ2VhYmxlKSwgXy5rZXlzKG9iaikuc29ydCgpKSk7XG59O1xuXG4vKlxuICogVXRpbCBtZXRob2QgdG8gcmVwbGFjZSBwYXR0ZXJucyBpbiBzdHJpbmcgd2l0aCBvYmplY3Qga2V5cyBvciBhcnJheSB2YWx1ZXNcbiAqIEV4YW1wbGVzOlxuICogVXRpbHMucmVwbGFjZSgnSGVsbG8sICR7Zmlyc3R9ICR7bGFzdH0gIScsIHtmaXJzdDogJ3dhdmVtYWtlcicsIGxhc3Q6ICduZyd9KSAtLT4gSGVsbG8sIHdhdmVtYWtlciBuZ1xuICogVXRpbHMucmVwbGFjZSgnSGVsbG8sICR7MH0gJHsxfSAhJywgWyd3YXZlbWFrZXInLCduZyddKSAtLT4gSGVsbG8sIHdhdmVtYWtlciBuZ1xuICogRXhhbXBsZXMgaWYgcGFyc2VFcnJvciBpcyB0cnVlOlxuICogVXRpbHMucmVwbGFjZSgnSGVsbG8sIHswfSB7MX0gIScsIFsnd2F2ZW1ha2VyJywnbmcnXSkgLS0+IEhlbGxvLCB3YXZlbWFrZXIgbmdcbiAqL1xuZXhwb3J0IGNvbnN0IHJlcGxhY2UgPSAodGVtcGxhdGUsIG1hcCwgcGFyc2VFcnJvcj86IGJvb2xlYW4pID0+IHtcbiAgICBsZXQgcmVnRXggPSBSRUdFWC5SRVBMQUNFX1BBVFRFUk47XG4gICAgaWYgKCF0ZW1wbGF0ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChwYXJzZUVycm9yKSB7XG4gICAgICAgIHJlZ0V4ID0gL1xceyhbXlxcfV0rKVxcfS9nO1xuICAgIH1cblxuICAgIHJldHVybiB0ZW1wbGF0ZS5yZXBsYWNlKHJlZ0V4LCBmdW5jdGlvbiAobWF0Y2gsIGtleSkge1xuICAgICAgICByZXR1cm4gXy5nZXQobWFwLCBrZXkpO1xuICAgIH0pO1xufTtcblxuLypGdW5jdGlvbiB0byBjaGVjayBpZiBkYXRlIHRpbWUgdHlwZSovXG5leHBvcnQgY29uc3QgaXNEYXRlVGltZVR5cGUgPSB0eXBlID0+IHtcbiAgICBpZiAoXy5pbmNsdWRlcyh0eXBlLCAnLicpKSB7XG4gICAgICAgIHR5cGUgPSBfLnRvTG93ZXIoZXh0cmFjdFR5cGUodHlwZSkpO1xuICAgIH1cbiAgICByZXR1cm4gXy5pbmNsdWRlcyhbRGF0YVR5cGUuREFURSwgRGF0YVR5cGUuVElNRSwgRGF0YVR5cGUuVElNRVNUQU1QLCBEYXRhVHlwZS5EQVRFVElNRSwgRGF0YVR5cGUuTE9DQUxEQVRFVElNRV0sIHR5cGUpO1xufTtcblxuLyogIFRoaXMgZnVuY3Rpb24gcmV0dXJucyBkYXRlIG9iamVjdC4gSWYgdmFsIGlzIHVuZGVmaW5lZCBpdCByZXR1cm5zIGludmFsaWQgZGF0ZSAqL1xuZXhwb3J0IGNvbnN0IGdldFZhbGlkRGF0ZU9iamVjdCA9IHZhbCA9PiB7XG4gICAgaWYgKG1vbWVudCh2YWwpLmlzVmFsaWQoKSkge1xuICAgICAgICAvLyBkYXRlIHdpdGggKzUgaG91cnMgaXMgcmV0dXJuZWQgaW4gc2FmYXJpIGJyb3dzZXIgd2hpY2ggaXMgbm90IGEgdmFsaWQgZGF0ZS5cbiAgICAgICAgLy8gSGVuY2UgY29udmVydGluZyB0aGUgZGF0ZSB0byB0aGUgc3VwcG9ydGVkIGZvcm1hdCBcIllZWVkvTU0vREQgSEg6bW06c3NcIiBpbiBJT1NcbiAgICAgICAgaWYgKGlzSW9zKCkpIHtcbiAgICAgICAgICAgIHZhbCA9IG1vbWVudChtb21lbnQodmFsKS52YWx1ZU9mKCkpLmZvcm1hdCgnWVlZWS9NTS9ERCBISDptbTpzcycpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2YWw7XG4gICAgfVxuICAgIC8qaWYgdGhlIHZhbHVlIGlzIGEgdGltZXN0YW1wIHN0cmluZywgY29udmVydCBpdCB0byBhIG51bWJlciovXG4gICAgaWYgKCFpc05hTih2YWwpKSB7XG4gICAgICAgIHZhbCA9IHBhcnNlSW50KHZhbCwgMTApO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIC8qaWYgdGhlIHZhbHVlIGlzIGluIEhIOm1tOnNzIGZvcm1hdCwgaXQgcmV0dXJucyBhIHdyb25nIGRhdGUuIFNvIGFwcGVuZCB0aGUgZGF0ZSB0byB0aGUgZ2l2ZW4gdmFsdWUgdG8gZ2V0IGRhdGUqL1xuICAgICAgICBpZiAoIShuZXcgRGF0ZSh2YWwpLmdldFRpbWUoKSkpIHtcbiAgICAgICAgICAgIHZhbCA9IG1vbWVudCgobW9tZW50KCkuZm9ybWF0KCdZWVlZLU1NLUREJykgKyAnICcgKyB2YWwpLCAnWVlZWS1NTS1ERCBISDptbTpzcyBBJyk7XG5cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbmV3IERhdGUobW9tZW50KHZhbCkudmFsdWVPZigpKTtcbn07XG5cbi8qICBUaGlzIGZ1bmN0aW9uIHJldHVybnMgamF2YXNjcmlwdCBkYXRlIG9iamVjdCovXG5leHBvcnQgY29uc3QgZ2V0TmF0aXZlRGF0ZU9iamVjdCA9IHZhbCA9PiB7XG4gICAgdmFsID0gZ2V0VmFsaWREYXRlT2JqZWN0KHZhbCk7XG4gICAgcmV0dXJuIG5ldyBEYXRlKHZhbCk7XG59O1xuXG5cbi8qKlxuICogcHJlcGFyZSBhIGJsb2Igb2JqZWN0IGJhc2VkIG9uIHRoZSBjb250ZW50IGFuZCBjb250ZW50IHR5cGUgcHJvdmlkZWRcbiAqIGlmIGNvbnRlbnQgaXMgYmxvYiBpdHNlbGYsIHNpbXBseSByZXR1cm5zIGl0IGJhY2tcbiAqIEBwYXJhbSB2YWxcbiAqIEBwYXJhbSB2YWxDb250ZW50VHlwZVxuICogQHJldHVybnMgeyp9XG4gKi9cbmV4cG9ydCBjb25zdCBnZXRCbG9iID0gKHZhbCwgdmFsQ29udGVudFR5cGU/KSA9PiB7XG4gICAgaWYgKHZhbCBpbnN0YW5jZW9mIEJsb2IpIHtcbiAgICAgICAgcmV0dXJuIHZhbDtcbiAgICB9XG4gICAgY29uc3QganNvblZhbCA9IGdldFZhbGlkSlNPTih2YWwpO1xuICAgIGlmIChqc29uVmFsICYmIGpzb25WYWwgaW5zdGFuY2VvZiBPYmplY3QpIHtcbiAgICAgICAgdmFsID0gbmV3IEJsb2IoW0pTT04uc3RyaW5naWZ5KGpzb25WYWwpXSwge3R5cGU6IHZhbENvbnRlbnRUeXBlIHx8ICdhcHBsaWNhdGlvbi9qc29uJ30pO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbCA9IG5ldyBCbG9iKFt2YWxdLCB7dHlwZTogdmFsQ29udGVudFR5cGUgfHwgJ3RleHQvcGxhaW4nfSk7XG4gICAgfVxuICAgIHJldHVybiB2YWw7XG59O1xuXG4vKipcbiAqIFRoaXMgZnVuY3Rpb24gcmV0dXJucyB0cnVlIGJ5IGNvbXBhcmluZyB0d28gb2JqZWN0cyBiYXNlZCBvbiB0aGUgZmllbGRzXG4gKiBAcGFyYW0gb2JqMSBvYmplY3RcbiAqIEBwYXJhbSBvYmoyIG9iamVjdFxuICogQHBhcmFtIGNvbXBhcmVCeSBzdHJpbmcgZmllbGQgdmFsdWVzIHRvIGNvbXBhcmVcbiAqIEByZXR1cm5zIHtib29sZWFufSB0cnVlIGlmIG9iamVjdCBlcXVhbGl0eSByZXR1cm5zIHRydWUgYmFzZWQgb24gZmllbGRzXG4gKi9cbmV4cG9ydCBjb25zdCBpc0VxdWFsV2l0aEZpZWxkcyA9IChvYmoxLCBvYmoyLCBjb21wYXJlQnkpID0+IHtcbiAgICAvLyBjb21wYXJlQnkgY2FuIGJlICdpZCcgb3IgJ2lkMSwgaWQyJyBvciAnaWQxLCBpZDI6aWQzJ1xuICAgIC8vIFNwbGl0IHRoZSBjb21wYXJlYnkgY29tbWEgc2VwYXJhdGVkIHZhbHVlc1xuICAgIGxldCBfY29tcGFyZUJ5ID0gXy5pc0FycmF5KGNvbXBhcmVCeSkgPyBjb21wYXJlQnkgOiBfLnNwbGl0KGNvbXBhcmVCeSwgJywnKTtcblxuICAgIF9jb21wYXJlQnkgPSBfLm1hcChfY29tcGFyZUJ5LCBfLnRyaW0pO1xuXG4gICAgcmV0dXJuIF8uaXNFcXVhbFdpdGgob2JqMSwgb2JqMiwgZnVuY3Rpb24gKG8xLCBvMikge1xuICAgICAgICByZXR1cm4gXy5ldmVyeShfY29tcGFyZUJ5LCBmdW5jdGlvbihjYikge1xuICAgICAgICAgICAgbGV0IGNiMSwgY2IyLCBfY2I7XG5cbiAgICAgICAgICAgIC8vIElmIGNvbXBhcmVieSBjb250YWlucyA6ICwgY29tcGFyZSB0aGUgdmFsdWVzIGJ5IHRoZSBrZXlzIG9uIGVpdGhlciBzaWRlIG9mIDpcbiAgICAgICAgICAgIGlmIChfLmluZGV4T2YoY2IsIGNvbXBhcmVCeVNlcGFyYXRvcikgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgY2IxID0gY2IyID0gXy50cmltKGNiKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgX2NiID0gXy5zcGxpdChjYiwgY29tcGFyZUJ5U2VwYXJhdG9yKTtcbiAgICAgICAgICAgICAgICBjYjEgPSBfLnRyaW0oX2NiWzBdKTtcbiAgICAgICAgICAgICAgICBjYjIgPSBfLnRyaW0oX2NiWzFdKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIF8uZ2V0KG8xLCBjYjEpID09PSBfLmdldChvMiwgY2IyKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59O1xuXG5jb25zdCBnZXROb2RlID0gc2VsZWN0b3IgPT4gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG5cbi8vIGZ1bmN0aW9uIHRvIGNoZWNrIGlmIHRoZSBzdHlsZXNoZWV0IGlzIGFscmVhZHkgbG9hZGVkXG5jb25zdCBpc1N0eWxlU2hlZXRMb2FkZWQgPSBocmVmID0+ICEhZ2V0Tm9kZShgbGlua1tocmVmPVwiJHtocmVmfVwiXWApO1xuXG4vLyBmdW5jdGlvbiB0byByZW1vdmUgc3R5bGVzaGVldCBpZiB0aGUgc3R5bGVzaGVldCBpcyBhbHJlYWR5IGxvYWRlZFxuY29uc3QgcmVtb3ZlU3R5bGVTaGVldCA9IGhyZWYgPT4ge1xuICAgIGNvbnN0IG5vZGUgPSBnZXROb2RlKGBsaW5rW2hyZWY9XCIke2hyZWZ9XCJdYCk7XG4gICAgaWYgKG5vZGUpIHtcbiAgICAgICAgbm9kZS5yZW1vdmUoKTtcbiAgICB9XG59O1xuXG4vLyBmdW5jdGlvbiB0byBsb2FkIGEgc3R5bGVzaGVldFxuZXhwb3J0IGNvbnN0IGxvYWRTdHlsZVNoZWV0ID0gKHVybCwgYXR0cikgPT4ge1xuICAgIGlmIChpc1N0eWxlU2hlZXRMb2FkZWQodXJsKSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaW5rJyk7XG4gICAgbGluay5ocmVmID0gdXJsO1xuICAgIC8vIFRvIGFkZCBhdHRyaWJ1dGVzIHRvIGxpbmsgdGFnXG4gICAgaWYgKGF0dHIgJiYgYXR0ci5uYW1lKSB7XG4gICAgICAgIGxpbmsuc2V0QXR0cmlidXRlKGF0dHIubmFtZSwgYXR0ci52YWx1ZSk7XG4gICAgfVxuICAgIGxpbmsuc2V0QXR0cmlidXRlKCdyZWwnLCAnc3R5bGVzaGVldCcpO1xuICAgIGxpbmsuc2V0QXR0cmlidXRlKCd0eXBlJywgJ3RleHQvY3NzJyk7XG4gICAgZG9jdW1lbnQuaGVhZC5hcHBlbmRDaGlsZChsaW5rKTtcbiAgICByZXR1cm4gbGluaztcbn07XG5cbi8vIGZ1bmN0aW9uIHRvIGxvYWQgc3R5bGVzaGVldHNcbmV4cG9ydCBjb25zdCBsb2FkU3R5bGVTaGVldHMgPSAodXJscyA9IFtdKSA9PiB7XG4gICAgLy8gaWYgdGhlIGZpcnN0IGFyZ3VtZW50IGlzIG5vdCBhbiBhcnJheSwgY29udmVydCBpdCB0byBhbiBhcnJheVxuICAgIGlmICghQXJyYXkuaXNBcnJheSh1cmxzKSkge1xuICAgICAgICB1cmxzID0gW3VybHNdO1xuICAgIH1cbiAgICB1cmxzLmZvckVhY2gobG9hZFN0eWxlU2hlZXQpO1xufTtcblxuLy8gZnVuY3Rpb24gdG8gY2hlY2sgaWYgdGhlIHNjcmlwdCBpcyBhbHJlYWR5IGxvYWRlZFxuY29uc3QgaXNTY3JpcHRMb2FkZWQgPSBzcmMgPT4gISFnZXROb2RlKGBzY3JpcHRbc3JjPVwiJHtzcmN9XCJdLCBzY3JpcHRbZGF0YS1zcmM9XCIke3NyY31cIl1gKTtcblxuZXhwb3J0IGNvbnN0IGxvYWRTY3JpcHQgPSBhc3luYyB1cmwgPT4ge1xuICAgIGNvbnN0IF91cmwgPSB1cmwudHJpbSgpO1xuICAgIGlmICghX3VybC5sZW5ndGggfHwgaXNTY3JpcHRMb2FkZWQoX3VybCkpIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgIH1cblxuICAgIHJldHVybiBmZXRjaENvbnRlbnQoJ3RleHQnLCBfdXJsLCBmYWxzZSwgdGV4dCA9PiB7XG4gICAgICAgICAgICBjb25zdCBzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcbiAgICAgICAgICAgIHNjcmlwdC50ZXh0Q29udGVudCA9IHRleHQ7XG4gICAgICAgICAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHNjcmlwdCk7XG4gICAgICAgIH0pO1xuXG4gICAgLy8gcmV0dXJuIGZldGNoKF91cmwpXG4gICAgLy8gICAgIC50aGVuKHJlc3BvbnNlID0+IHJlc3BvbnNlLnRleHQoKSlcbiAgICAvLyAgICAgLnRoZW4odGV4dCA9PiB7XG4gICAgLy8gICAgICAgICBjb25zdCBzY3JpcHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcbiAgICAvLyAgICAgICAgIHNjcmlwdC50ZXh0Q29udGVudCA9IHRleHQ7XG4gICAgLy8gICAgICAgICBkb2N1bWVudC5oZWFkLmFwcGVuZENoaWxkKHNjcmlwdCk7XG4gICAgLy8gICAgIH0pO1xufTtcblxuZXhwb3J0IGNvbnN0IGxvYWRTY3JpcHRzID0gYXN5bmMgKHVybHMgPSBbXSkgPT4ge1xuICAgIGZvciAoY29uc3QgdXJsIG9mIHVybHMpIHtcbiAgICAgICAgYXdhaXQgbG9hZFNjcmlwdCh1cmwpO1xuICAgIH1cbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG59O1xuXG5leHBvcnQgbGV0IF9XTV9BUFBfUFJPSkVDVDogYW55ID0ge307XG5cbi8qKlxuICogVGhpcyBmdW5jdGlvbiBzZXRzIHNlc3Npb24gc3RvcmFnZSBpdGVtIGJhc2VkIG9uIHRoZSBwcm9qZWN0IElEXG4gKiBAcGFyYW0ga2V5IHN0cmluZ1xuICogQHBhcmFtIHZhbHVlIHN0cmluZ1xuICovXG5leHBvcnQgY29uc3Qgc2V0U2Vzc2lvblN0b3JhZ2VJdGVtID0gKGtleSwgdmFsdWUpID0+IHtcbiAgICBsZXQgaXRlbTogYW55ID0gd2luZG93LnNlc3Npb25TdG9yYWdlLmdldEl0ZW0oX1dNX0FQUF9QUk9KRUNULmlkKTtcblxuICAgIGlmIChpdGVtKSB7XG4gICAgICAgIGl0ZW0gPSBKU09OLnBhcnNlKGl0ZW0pO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGl0ZW0gPSB7fTtcbiAgICB9XG4gICAgaXRlbVtrZXldID0gdmFsdWU7XG5cbiAgICB3aW5kb3cuc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbShfV01fQVBQX1BST0pFQ1QuaWQsIEpTT04uc3RyaW5naWZ5KGl0ZW0pKTtcbn07XG5cbi8qKlxuICogVGhpcyBmdW5jdGlvbiBnZXRzIHNlc3Npb24gc3RvcmFnZSBpdGVtIGJhc2VkIG9uIHRoZSBwcm9qZWN0IElEXG4gKiBAcGFyYW0ga2V5IHN0cmluZ1xuICovXG5leHBvcnQgY29uc3QgZ2V0U2Vzc2lvblN0b3JhZ2VJdGVtID0ga2V5ID0+IHtcbiAgICBsZXQgaXRlbSA9IHdpbmRvdy5zZXNzaW9uU3RvcmFnZS5nZXRJdGVtKF9XTV9BUFBfUFJPSkVDVC5pZCk7XG5cbiAgICBpZiAoaXRlbSkge1xuICAgICAgICBpdGVtID0gSlNPTi5wYXJzZShpdGVtKTtcbiAgICAgICAgcmV0dXJuIGl0ZW1ba2V5XTtcbiAgICB9XG59O1xuXG5leHBvcnQgY29uc3Qgbm9vcCA9ICguLi5hcmdzKSA9PiB7fTtcblxuZXhwb3J0IGNvbnN0IGlzQXJyYXkgPSB2ID0+IF8uaXNBcnJheSh2KTtcblxuZXhwb3J0IGNvbnN0IGlzU3RyaW5nID0gdiA9PiB0eXBlb2YgdiA9PT0gJ3N0cmluZyc7XG5cbmV4cG9ydCBjb25zdCBpc051bWJlciA9IHYgPT4gdHlwZW9mIHYgPT09ICdudW1iZXInO1xuXG4vKipcbiAqIFRoaXMgZnVuY3Rpb24gcmV0dXJucyBhIGJsb2Igb2JqZWN0IGZyb20gdGhlIGdpdmVuIGZpbGUgcGF0aFxuICogQHBhcmFtIGZpbGVwYXRoXG4gKiBAcmV0dXJucyBwcm9taXNlIGhhdmluZyBibG9iIG9iamVjdFxuICovXG5leHBvcnQgY29uc3QgY29udmVydFRvQmxvYiA9IChmaWxlcGF0aCk6IFByb21pc2U8YW55PiA9PiB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPGFueT4gKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgLy8gUmVhZCB0aGUgZmlsZSBlbnRyeSBmcm9tIHRoZSBmaWxlIFVSTFxuICAgICAgICByZXNvbHZlTG9jYWxGaWxlU3lzdGVtVVJMKGZpbGVwYXRoLCBmdW5jdGlvbiAoZmlsZUVudHJ5KSB7XG4gICAgICAgICAgICBmaWxlRW50cnkuZmlsZShmdW5jdGlvbiAoZmlsZSkge1xuICAgICAgICAgICAgICAgIC8vIGZpbGUgaGFzIHRoZSBjb3Jkb3ZhIGZpbGUgc3RydWN0dXJlLiBUbyBzdWJtaXQgdG8gdGhlIGJhY2tlbmQsIGNvbnZlcnQgdGhpcyBmaWxlIHRvIGphdmFzY3JpcHQgZmlsZVxuICAgICAgICAgICAgICAgIGNvbnN0IHJlYWRlciA9IG5ldyBGaWxlUmVhZGVyKCk7XG4gICAgICAgICAgICAgICAgcmVhZGVyLm9ubG9hZGVuZCA9ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgaW1nQmxvYiA9IG5ldyBCbG9iKFtyZWFkZXIucmVzdWx0XSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgJ3R5cGUnIDogZmlsZS50eXBlXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHsnYmxvYicgOiBpbWdCbG9iLCAnZmlsZXBhdGgnOiBmaWxlcGF0aH0pO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgcmVhZGVyLm9uZXJyb3IgPSByZWplY3Q7XG4gICAgICAgICAgICAgICAgcmVhZGVyLnJlYWRBc0FycmF5QnVmZmVyKGZpbGUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIHJlamVjdCk7XG4gICAgfSk7XG59O1xuXG5leHBvcnQgY29uc3QgaGFzQ29yZG92YSA9ICgpID0+IHtcbiAgICByZXR1cm4gISF3aW5kb3dbJ2NvcmRvdmEnXTtcbn07XG5cbmV4cG9ydCBjb25zdCBBcHBDb25zdGFudHMgPSB7XG4gICAgSU5UX01BWF9WQUxVRTogMjE0NzQ4MzY0N1xufSA7XG5cbmV4cG9ydCBjb25zdCBvcGVuTGluayA9IChsaW5rOiBzdHJpbmcsIHRhcmdldDogc3RyaW5nID0gJ19zZWxmJykgPT4ge1xuICAgIGlmICggaGFzQ29yZG92YSgpICYmIF8uc3RhcnRzV2l0aChsaW5rLCAnIycpKSB7XG4gICAgICAgIGxvY2F0aW9uLmhhc2ggPSBsaW5rO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHdpbmRvdy5vcGVuKGxpbmssIHRhcmdldCk7XG4gICAgfVxufTtcblxuXG4vKiB1dGlsIGZ1bmN0aW9uIHRvIGxvYWQgdGhlIGNvbnRlbnQgZnJvbSBhIHVybCAqL1xuZXhwb3J0IGNvbnN0IGZldGNoQ29udGVudCA9IChkYXRhVHlwZSwgdXJsOiBzdHJpbmcsIGluU3luYzogYm9vbGVhbiA9IGZhbHNlLCBzdWNjZXNzPywgZXJyb3I/KTogUHJvbWlzZTxhbnk+ID0+IHtcbiAgICByZXR1cm4gJC5hamF4KHt0eXBlOiAnZ2V0JywgZGF0YVR5cGU6IGRhdGFUeXBlLCB1cmw6IHVybCwgYXN5bmM6ICFpblN5bmN9KVxuICAgICAgICAuZG9uZShyZXNwb25zZSA9PiBzdWNjZXNzICYmIHN1Y2Nlc3MocmVzcG9uc2UpKVxuICAgICAgICAuZmFpbChyZWFzb24gPT4gZXJyb3IgJiYgZXJyb3IocmVhc29uKSk7XG59O1xuXG4vKipcbiAqIElmIHRoZSBnaXZlbiBvYmplY3QgaXMgYSBwcm9taXNlLCB0aGVuIG9iamVjdCBpcyByZXR1cm5lZC4gT3RoZXJ3aXNlLCBhIHByb21pc2UgaXMgcmVzb2x2ZWQgd2l0aCB0aGUgZ2l2ZW4gb2JqZWN0LlxuICogQHBhcmFtIHtQcm9taXNlPFQ+IHwgVH0gYVxuICogQHJldHVybnMge1Byb21pc2U8VD59XG4gKi9cbmV4cG9ydCBjb25zdCB0b1Byb21pc2UgPSA8VD4oYTogVCB8IFByb21pc2U8VD4pOiBQcm9taXNlPFQ+ID0+IHtcbiAgICBpZiAoYSBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgICAgcmV0dXJuIGE7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShhIGFzIFQpO1xuICAgIH1cbn07XG5cbi8qKlxuICogVGhpcyBmdW5jdGlvbiBpbnZva2VzIHRoZSBnaXZlbiB0aGUgZnVuY3Rpb24gKGZuKSB1bnRpbCB0aGUgZnVuY3Rpb24gc3VjY2Vzc2Z1bGx5IGV4ZWN1dGVzIG9yIHRoZSBtYXhpbXVtIG51bWJlclxuICogb2YgcmV0cmllcyBpcyByZWFjaGVkIG9yIG9uQmVmb3JlUmV0cnkgcmV0dXJucyBmYWxzZS5cbiAqXG4gKiBAcGFyYW0gZm4gLSBhIGZ1bmN0aW9uIHRoYXQgaXMgbmVlZHMgdG8gYmUgaW52b2tlZC4gVGhlIGZ1bmN0aW9uIGNhbiBhbHNvIHJldHVybiBhIHByb21pc2UgYXMgd2VsbC5cbiAqIEBwYXJhbSBpbnRlcnZhbCAtIG1pbmltdW0gdGltZSBnYXAgYmV0d2VlbiBzdWNjZXNzaXZlIHJldHJpZXMuIFRoaXMgYXJndW1lbnQgc2hvdWxkIGJlIGdyZWF0ZXIgb3IgZXF1YWwgdG8gMC5cbiAqIEBwYXJhbSBtYXhSZXRyaWVzIC0gbWF4aW11bSBudW1iZXIgb2YgcmV0cmllcy4gVGhpcyBhcmd1bWVudCBzaG91bGQgYmUgZ3JlYXRlciB0aGFuIDAuIEZvciBhbGwgb3RoZXIgdmFsdWVzLFxuICogbWF4UmV0cmllcyBpcyBpbmZpbml0eS5cbiAqIEBwYXJhbSBvbkJlZm9yZVJldHJ5IC0gYSBjYWxsYmFjayBmdW5jdGlvbiB0aGF0IHdpbGwgYmUgaW52b2tlZCBiZWZvcmUgcmUtaW52b2tpbmcgYWdhaW4uIFRoaXMgZnVuY3Rpb24gY2FuXG4gKiByZXR1cm4gZmFsc2Ugb3IgYSBwcm9taXNlIHRoYXQgaXMgcmVzb2x2ZWQgdG8gZmFsc2UgdG8gc3RvcCBmdXJ0aGVyIHJldHJ5IGF0dGVtcHRzLlxuICogQHJldHVybnMgeyp9IGEgcHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIHdoZW4gZm4gaXMgc3VjY2VzcyAob3IpIG1heGltdW0gcmV0cnkgYXR0ZW1wdHMgcmVhY2hlZFxuICogKG9yKSBvbkJlZm9yZVJldHJ5IHJldHVybmVkIGZhbHNlLlxuICovXG5leHBvcnQgY29uc3QgcmV0cnlJZkZhaWxzID0gKGZuOiAoKSA9PiBhbnksIGludGVydmFsOiBudW1iZXIsIG1heFJldHJpZXM6IG51bWJlciwgb25CZWZvcmVSZXRyeSA9ICgpID0+IFByb21pc2UucmVzb2x2ZShmYWxzZSkpID0+IHtcbiAgICBsZXQgcmV0cnlDb3VudCA9IDA7XG4gICAgY29uc3QgdHJ5Rm4gPSAoKSA9PiB7XG4gICAgICAgIHJldHJ5Q291bnQrKztcbiAgICAgICAgaWYgKF8uaXNGdW5jdGlvbihmbikpIHtcbiAgICAgICAgICAgIHJldHVybiBmbigpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICBtYXhSZXRyaWVzID0gKF8uaXNOdW1iZXIobWF4UmV0cmllcykgJiYgbWF4UmV0cmllcyA+IDAgPyBtYXhSZXRyaWVzIDogMCk7XG4gICAgaW50ZXJ2YWwgPSAoXy5pc051bWJlcihpbnRlcnZhbCkgJiYgaW50ZXJ2YWwgPiAwID8gaW50ZXJ2YWwgOiAwKTtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBjb25zdCBlcnJvckZuID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY29uc3QgZXJyQXJncyA9IGFyZ3VtZW50cztcbiAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRvUHJvbWlzZTxib29sZWFuPihvbkJlZm9yZVJldHJ5KCkpLnRoZW4oZnVuY3Rpb24gKHJldHJ5KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyZXRyeSAhPT0gZmFsc2UgJiYgKCFtYXhSZXRyaWVzIHx8IHJldHJ5Q291bnQgPD0gbWF4UmV0cmllcykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvUHJvbWlzZSh0cnlGbigpKS50aGVuKHJlc29sdmUsIGVycm9yRm4pO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVyckFyZ3MpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgKCkgPT4gcmVqZWN0KGVyckFyZ3MpKTtcbiAgICAgICAgICAgIH0sIGludGVydmFsKTtcbiAgICAgICAgfTtcbiAgICAgICAgdG9Qcm9taXNlKHRyeUZuKCkpLnRoZW4ocmVzb2x2ZSwgZXJyb3JGbik7XG4gICAgfSk7XG59O1xuXG4vKipcbiAqIFByb21pc2Ugb2YgYSBkZWZlciBjcmVhdGVkIHVzaW5nIHRoaXMgZnVuY3Rpb24sIGhhcyBhYm9ydCBmdW5jdGlvbiB0aGF0IHdpbGwgcmVqZWN0IHRoZSBkZWZlciB3aGVuIGNhbGxlZC5cbiAqIEByZXR1cm5zIHsqfSBhbmd1bGFyIGRlZmVyIG9iamVjdFxuICovXG5leHBvcnQgY29uc3QgZ2V0QWJvcnRhYmxlRGVmZXIgPSAoKSA9PiB7XG4gICAgY29uc3QgX2RlZmVyOiBhbnkgPSB7XG4gICAgICAgIHByb21pc2U6IG51bGwsXG4gICAgICAgIHJlamVjdDogbnVsbCxcbiAgICAgICAgcmVzb2x2ZTogbnVsbCxcbiAgICAgICAgb25BYm9ydDogKCkgPT4ge30sXG4gICAgICAgIGlzQWJvcnRlZDogZmFsc2VcbiAgICB9O1xuICAgIF9kZWZlci5wcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBfZGVmZXIucmVzb2x2ZSA9IHJlc29sdmU7XG4gICAgICAgIF9kZWZlci5yZWplY3QgPSByZWplY3Q7XG4gICAgfSk7XG4gICAgX2RlZmVyLnByb21pc2UuYWJvcnQgPSAoKSA9PiB7XG4gICAgICAgIHRyaWdnZXJGbihfZGVmZXIub25BYm9ydCk7XG4gICAgICAgIF9kZWZlci5yZWplY3QoJ2Fib3J0ZWQnKTtcbiAgICAgICAgX2RlZmVyLmlzQWJvcnRlZCA9IHRydWU7XG4gICAgfTtcbiAgICByZXR1cm4gX2RlZmVyO1xufTtcblxuZXhwb3J0IGNvbnN0IGNyZWF0ZUNTU1J1bGUgPSAocnVsZVNlbGVjdG9yOiBzdHJpbmcsIHJ1bGVzOiBzdHJpbmcpID0+IHtcbiAgICBjb25zdCBzdHlsZXNoZWV0ID0gZG9jdW1lbnQuc3R5bGVTaGVldHNbMF07XG4gICAgc3R5bGVzaGVldC5pbnNlcnRSdWxlKGAke3J1bGVTZWxlY3Rvcn0geyAke3J1bGVzfSB9YCk7XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0VXJsUGFyYW1zID0gKGxpbmspID0+IHtcbiAgICBjb25zdCBwYXJhbXMgPSB7fTtcbiAgICAvLyBJZiB1cmwgcGFyYW1zIGFyZSBwcmVzZW50LCBjb25zdHJ1Y3QgcGFyYW1zIG9iamVjdCBhbmQgcGFzcyBpdCB0byBzZWFyY2hcbiAgICBjb25zdCBpbmRleCA9IGxpbmsuaW5kZXhPZignPycpO1xuICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgICAgY29uc3QgcXVlcnlQYXJhbXMgPSBfLnNwbGl0KGxpbmsuc3Vic3RyaW5nKGluZGV4ICsgMSwgbGluay5sZW5ndGgpLCAnJicpO1xuICAgICAgICBxdWVyeVBhcmFtcy5mb3JFYWNoKChwYXJhbSkgPT4ge1xuICAgICAgICAgICAgcGFyYW0gPSBfLnNwbGl0KHBhcmFtLCAnPScpO1xuICAgICAgICAgICAgcGFyYW1zW3BhcmFtWzBdXSA9IHBhcmFtWzFdO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHBhcmFtcztcbn07XG5cbmV4cG9ydCBjb25zdCBnZXRSb3V0ZU5hbWVGcm9tTGluayA9IChsaW5rKSA9PiB7XG4gICAgbGluayAgPSBsaW5rLnJlcGxhY2UoJyMvJywgJy8nKTtcbiAgICBjb25zdCBpbmRleCA9IGxpbmsuaW5kZXhPZignPycpO1xuICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgICAgbGluayA9IGxpbmsuc3Vic3RyaW5nKDAsIGluZGV4KTtcbiAgICB9XG4gICAgcmV0dXJuIGxpbms7XG59O1xuXG5leHBvcnQgY29uc3QgaXNBcHBsZVByb2R1Y3QgPSAvTWFjfGlQb2R8aVBob25lfGlQYWQvLnRlc3Qod2luZG93Lm5hdmlnYXRvci5wbGF0Zm9ybSk7XG5cbmV4cG9ydCBjb25zdCBkZWZlciA9ICgpID0+IHtcbiAgICBjb25zdCBkID0ge1xuICAgICAgICAgICAgcHJvbWlzZTogbnVsbCxcbiAgICAgICAgICAgIHJlc29sdmU6IG5vb3AsXG4gICAgICAgICAgICByZWplY3QgOiBub29wXG4gICAgICAgIH07XG4gICAgZC5wcm9taXNlID0gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICBkLnJlc29sdmUgPSByZXNvbHZlO1xuICAgICAgICBkLnJlamVjdCA9IHJlamVjdDtcbiAgICB9KTtcbiAgICByZXR1cm4gZDtcbn07XG5cbi8qXG4gKiBJbnZva2VzIHRoZSBnaXZlbiBsaXN0IG9mIGZ1bmN0aW9ucyBzZXF1ZW50aWFsbHkgd2l0aCB0aGUgZ2l2ZW4gYXJndW1lbnRzLiBJZiBhIGZ1bmN0aW9uIHJldHVybnMgYSBwcm9taXNlLFxuICogdGhlbiBuZXh0IGZ1bmN0aW9uIHdpbGwgYmUgaW52b2tlZCBvbmx5IGlmIHRoZSBwcm9taXNlIGlzIHJlc29sdmVkLlxuICovXG5leHBvcnQgY29uc3QgZXhlY3V0ZVByb21pc2VDaGFpbiA9IChmbnMsIGFyZ3MsIGQ/LCBpPykgPT4ge1xuICAgIGQgPSBkIHx8IGRlZmVyKCk7XG4gICAgaSA9IGkgfHwgMDtcbiAgICBpZiAoaSA9PT0gMCkge1xuICAgICAgICBmbnMgPSBfLmZpbHRlcihmbnMsIGZ1bmN0aW9uIChmbikge1xuICAgICAgICAgICAgcmV0dXJuICEoXy5pc1VuZGVmaW5lZChmbikgfHwgXy5pc051bGwoZm4pKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGlmIChmbnMgJiYgaSA8IGZucy5sZW5ndGgpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHRvUHJvbWlzZShmbnNbaV0uYXBwbHkodW5kZWZpbmVkLCBhcmdzKSlcbiAgICAgICAgICAgICAgICAudGhlbigoKSA9PiBleGVjdXRlUHJvbWlzZUNoYWluKGZucywgYXJncywgZCwgaSArIDEpLCBkLnJlamVjdCk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIGQucmVqZWN0KGUpO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZC5yZXNvbHZlKCk7XG4gICAgfVxuICAgIHJldHVybiBkLnByb21pc2U7XG59O1xuXG4vKipcbiAqIFRoaXMgZnVuY3Rpb24gYWNjZXB0cyB0d28gZGF0YSBzb3VyY2VzIGFuZCB3aWxsIGNoZWNrIGlmIGJvdGggYXJlIHNhbWUgYnkgY29tcGFyaW5nIHRoZSB1bmlxdWUgaWQgYW5kXG4gKiBjb250ZXh0IGluIHdoaWNoIGRhdGFzb3VyY2VzIGFyZSBwcmVzZW50XG4gKiBAcmV0dXJucyB7Kn0gYm9vbGVhbiB0cnVlLyBmYWxzZVxuICovXG5leHBvcnQgY29uc3QgaXNEYXRhU291cmNlRXF1YWwgPSAoZDEsIGQyKSA9PiB7XG4gICAgcmV0dXJuIGQxLmV4ZWN1dGUoRGF0YVNvdXJjZS5PcGVyYXRpb24uR0VUX1VOSVFVRV9JREVOVElGSUVSKSA9PT0gZDIuZXhlY3V0ZShEYXRhU291cmNlLk9wZXJhdGlvbi5HRVRfVU5JUVVFX0lERU5USUZJRVIpICYmXG4gICAgXy5pc0VxdWFsKGQxLmV4ZWN1dGUoRGF0YVNvdXJjZS5PcGVyYXRpb24uR0VUX0NPTlRFWFRfSURFTlRJRklFUiksIGQyLmV4ZWN1dGUoRGF0YVNvdXJjZS5PcGVyYXRpb24uR0VUX0NPTlRFWFRfSURFTlRJRklFUikpO1xufTtcblxuLyoqXG4gKiBjaGVja3MgaWYgdGhlIHBhc3NlZCBkYXRhc291cmNlIGNvbnRleHQgbWF0Y2hlcyB3aXRoIHBhc3NlZCBjb250ZXh0XG4gKiBAcGFyYW0gZHMsIGRhdGFzb3VyY2UgaGF2aW5nIGEgY29udGV4dFxuICogQHBhcmFtIGN0eCwgY29udGV4dCB0byBjb21wYXJlIHdpdGhcbiAqIEByZXR1cm5zIHtib29sZWFufVxuICovXG5leHBvcnQgY29uc3QgdmFsaWRhdGVEYXRhU291cmNlQ3R4ID0gKGRzLCBjdHgpID0+IHtcbiAgICByZXR1cm4gZHMuZXhlY3V0ZShEYXRhU291cmNlLk9wZXJhdGlvbi5HRVRfQ09OVEVYVF9JREVOVElGSUVSKSA9PT0gY3R4O1xufTtcblxuLyoqXG4gKiBUaGlzIHRyYXZlcnNlcyB0aGUgZmlsdGVyZXhwcmVzc2lvbnMgb2JqZWN0IHJlY3Vyc2l2ZWx5IGFuZCBwcm9jZXNzIHRoZSBiaW5kIHN0cmluZyBpZiBhbnkgaW4gdGhlIG9iamVjdFxuICogQHBhcmFtIHZhcmlhYmxlIHZhcmlhYmxlIG9iamVjdFxuICogQHBhcmFtIG5hbWUgbmFtZSBvZiB0aGUgdmFyaWFibGVcbiAqIEBwYXJhbSBjb250ZXh0IHNjb3BlIG9mIHRoZSB2YXJpYWJsZVxuICovXG5leHBvcnQgY29uc3QgcHJvY2Vzc0ZpbHRlckV4cEJpbmROb2RlID0gKGNvbnRleHQsIGZpbHRlckV4cHJlc3Npb25zKSA9PiB7XG4gICAgY29uc3QgZGVzdHJveUZuID0gY29udGV4dC5yZWdpc3RlckRlc3Ryb3lMaXN0ZW5lciA/IGNvbnRleHQucmVnaXN0ZXJEZXN0cm95TGlzdGVuZXIuYmluZChjb250ZXh0KSA6IF8ubm9vcDtcbiAgICBjb25zdCBmaWx0ZXIkID0gbmV3IFN1YmplY3QoKTtcblxuICAgIGNvbnN0IGJpbmRGaWxFeHBPYmogPSAob2JqLCB0YXJnZXROb2RlS2V5KSA9PiB7XG4gICAgICAgIGlmIChzdHJpbmdTdGFydHNXaXRoKG9ialt0YXJnZXROb2RlS2V5XSwgJ2JpbmQ6JykpIHtcbiAgICAgICAgICAgIGRlc3Ryb3lGbihcbiAgICAgICAgICAgICAgICAkd2F0Y2gob2JqW3RhcmdldE5vZGVLZXldLnJlcGxhY2UoJ2JpbmQ6JywgJycpLCBjb250ZXh0LCB7fSwgKG5ld1ZhbCwgb2xkVmFsKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICgobmV3VmFsID09PSBvbGRWYWwgJiYgXy5pc1VuZGVmaW5lZChuZXdWYWwpKSB8fCAoXy5pc1VuZGVmaW5lZChuZXdWYWwpICYmICFfLmlzVW5kZWZpbmVkKG9sZFZhbCkpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8gU2tpcCBjbG9uaW5nIGZvciBibG9iIGNvbHVtblxuICAgICAgICAgICAgICAgICAgICBpZiAoIV8uaW5jbHVkZXMoWydibG9iJywgJ2ZpbGUnXSwgb2JqLnR5cGUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdWYWwgPSBnZXRDbG9uZWRPYmplY3QobmV3VmFsKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyBiYWNrd2FyZCBjb21wYXRpYmlsaXR5OiB3aGVyZSB3ZSBhcmUgYWxsb3dpbmcgdGhlIHVzZXIgdG8gYmluZCBjb21wbGV0ZSBvYmplY3RcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9iai50YXJnZXQgPT09ICdkYXRhQmluZGluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHJlbW92ZSB0aGUgZXhpc3RpbmcgZGF0YWJpbmRpbmcgZWxlbWVudFxuICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyRXhwcmVzc2lvbnMucnVsZXMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIG5vdyBhZGQgYWxsIHRoZSByZXR1cm5lZCB2YWx1ZXNcbiAgICAgICAgICAgICAgICAgICAgICAgIF8uZm9yRWFjaChuZXdWYWwsIGZ1bmN0aW9uKHZhbHVlLCB0YXJnZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXJFeHByZXNzaW9ucy5ydWxlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3RhcmdldCc6IHRhcmdldCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3ZhbHVlJzogdmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdtYXRjaE1vZGUnOiBvYmoubWF0Y2hNb2RlIHx8ICdzdGFydGlnbm9yZWNhc2UnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAncmVxdWlyZWQnOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3R5cGUnOiAnJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBzZXR0aW5nIHZhbHVlIHRvIHRoZSByb290IG5vZGVcbiAgICAgICAgICAgICAgICAgICAgICAgIG9ialt0YXJnZXROb2RlS2V5XSA9IG5ld1ZhbDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBmaWx0ZXIkLm5leHQoe2ZpbHRlckV4cHJlc3Npb25zLCBuZXdWYWx9KTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBjb25zdCB0cmF2ZXJzZUZpbHRlckV4cHJlc3Npb25zID0gZXhwcmVzc2lvbnMgPT4ge1xuICAgICAgICBpZiAoZXhwcmVzc2lvbnMucnVsZXMpIHtcbiAgICAgICAgICAgIF8uZm9yRWFjaChleHByZXNzaW9ucy5ydWxlcywgKGZpbEV4cE9iaiwgaSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChmaWxFeHBPYmoucnVsZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgdHJhdmVyc2VGaWx0ZXJFeHByZXNzaW9ucyhmaWxFeHBPYmopO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChmaWxFeHBPYmoubWF0Y2hNb2RlID09PSAnYmV0d2VlbicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJpbmRGaWxFeHBPYmooZmlsRXhwT2JqLCAnc2Vjb25kdmFsdWUnKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBiaW5kRmlsRXhwT2JqKGZpbEV4cE9iaiwgJ3ZhbHVlJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9O1xuICAgIHRyYXZlcnNlRmlsdGVyRXhwcmVzc2lvbnMoZmlsdGVyRXhwcmVzc2lvbnMpO1xuXG4gICAgcmV0dXJuIGZpbHRlciQ7XG59O1xuXG4vLyBUaGlzIG1ldGhvZCB3aWxsIHNldCB0aGUgZ2l2ZW4gcHJvdG8gb24gdGhlIHRhcmdldFxuZXhwb3J0IGNvbnN0IGV4dGVuZFByb3RvID0gKHRhcmdldCwgcHJvdG8pID0+IHtcbiAgICBsZXQgX3Byb3RvID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHRhcmdldCk7XG4gICAgd2hpbGUgKE9iamVjdC5nZXRQcm90b3R5cGVPZihfcHJvdG8pLmNvbnN0cnVjdG9yICE9PSBPYmplY3QpIHtcbiAgICAgICAgX3Byb3RvID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKF9wcm90byk7XG4gICAgICAgIC8vIHJldHVybiBpZiB0aGUgcHJvdG90eXBlIG9mIGNyZWF0ZWQgY29tcG9uZW50IGFuZCBwcm90b3R5cGUgb2YgY29udGV4dCBhcmUgc2FtZVxuICAgICAgICBpZiAocHJvdG8gPT09IF9wcm90bykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgfVxuICAgIE9iamVjdC5zZXRQcm90b3R5cGVPZihfcHJvdG8sIHByb3RvKTtcbn07XG5cbmV4cG9ydCBjb25zdCByZW1vdmVFeHRyYVNsYXNoZXMgPSBmdW5jdGlvbiAodXJsKSB7XG4gICAgY29uc3QgYmFzZTY0cmVnZXggPSAvXmRhdGE6aW1hZ2VcXC8oW2Etel17Mix9KTtiYXNlNjQsLztcbiAgICBpZiAoXy5pc1N0cmluZyh1cmwpKSB7XG4gICAgICAgIC8qXG4gICAgICAgICogc3VwcG9ydCBmb3IgbW9iaWxlIGFwcHMgaGF2aW5nIGxvY2FsIGZpbGUgcGF0aCB1cmwgc3RhcnRpbmcgd2l0aCBmaWxlOi8vLyBhbmRcbiAgICAgICAgKiBzdXBwb3J0IGZvciBiYXNlNjQgZm9ybWF0XG4gICAgICAgICogKi9cbiAgICAgICAgaWYgKF8uc3RhcnRzV2l0aCh1cmwsICdmaWxlOi8vLycpIHx8IGJhc2U2NHJlZ2V4LnRlc3QodXJsKSkge1xuICAgICAgICAgICAgcmV0dXJuIHVybDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdXJsLnJlcGxhY2UobmV3IFJlZ0V4cCgnKFteOl1cXC8pKFxcLykrJywgJ2cnKSwgJyQxJyk7XG4gICAgfVxufTtcblxuJC5jYWNoZWRTY3JpcHQgPSAoKCkgPT4ge1xuICAgIGNvbnN0IGluUHJvZ3Jlc3MgPSBuZXcgTWFwKCk7XG4gICAgY29uc3QgcmVzb2x2ZWQgPSBuZXcgU2V0KCk7XG5cbiAgICBjb25zdCBpc0luUHJvZ3Jlc3MgPSB1cmwgPT4gaW5Qcm9ncmVzcy5oYXModXJsKTtcbiAgICBjb25zdCBpc1Jlc29sdmVkID0gdXJsID0+IHJlc29sdmVkLmhhcyh1cmwpO1xuICAgIGNvbnN0IG9uTG9hZCA9IHVybCA9PiB7XG4gICAgICAgIHJlc29sdmVkLmFkZCh1cmwpO1xuICAgICAgICBpblByb2dyZXNzLmdldCh1cmwpLnJlc29sdmUoKTtcbiAgICAgICAgaW5Qcm9ncmVzcy5kZWxldGUodXJsKTtcbiAgICB9O1xuXG4gICAgY29uc3Qgc2V0SW5Qcm9ncmVzcyA9IHVybCA9PiB7XG4gICAgICAgIGxldCByZXNGbjtcbiAgICAgICAgbGV0IHJlakZuO1xuICAgICAgICBjb25zdCBwcm9taXNlOiBhbnkgPSBuZXcgUHJvbWlzZSgocmVzLCByZWopID0+IHtcbiAgICAgICAgICAgIHJlc0ZuID0gcmVzO1xuICAgICAgICAgICAgcmVqRm4gPSByZWo7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHByb21pc2UucmVzb2x2ZSA9IHJlc0ZuO1xuICAgICAgICBwcm9taXNlLnJlamVjdCA9IHJlakZuO1xuXG4gICAgICAgIGluUHJvZ3Jlc3Muc2V0KHVybCwgcHJvbWlzZSk7XG4gICAgfTtcblxuICAgIHJldHVybiBmdW5jdGlvbiAodXJsKSB7XG4gICAgICAgIGlmIChpc1Jlc29sdmVkKHVybCkpIHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpc0luUHJvZ3Jlc3ModXJsKSkge1xuICAgICAgICAgICAgcmV0dXJuIGluUHJvZ3Jlc3MuZ2V0KHVybCk7XG4gICAgICAgIH1cblxuICAgICAgICBzZXRJblByb2dyZXNzKHVybCk7XG5cbiAgICAgICAgY29uc3Qgb3B0aW9ucyA9IHtcbiAgICAgICAgICAgIGRhdGFUeXBlOiAnc2NyaXB0JyxcbiAgICAgICAgICAgIGNhY2hlOiB0cnVlLFxuICAgICAgICAgICAgdXJsXG4gICAgICAgIH07XG5cbiAgICAgICAgJC5hamF4KG9wdGlvbnMpLmRvbmUoKCkgPT4gb25Mb2FkKHVybCkpO1xuXG4gICAgICAgIHJldHVybiBpblByb2dyZXNzLmdldCh1cmwpO1xuICAgIH07XG59KSgpO1xuXG5jb25zdCBERUZBVUxUX0RJU1BMQVlfRk9STUFUUyA9IHtcbiAgICBEQVRFIDogJ3l5eXktTU0tZGQnLFxuICAgIFRJTUUgOiAnaGg6bW0gYScsXG4gICAgVElNRVNUQU1QIDogJ3l5eXktTU0tZGQgaGg6bW06c3MgYScsXG4gICAgREFURVRJTUUgOiAneXl5eS1NTS1kZCBoaDptbTpzcyBhJyxcbn07XG4vLyBUaGlzIG1ldGhvZCByZXR1cm5zIHRoZSBkaXNwbGF5IGRhdGUgZm9ybWF0IGZvciBnaXZlbiB0eXBlXG5leHBvcnQgY29uc3QgZ2V0RGlzcGxheURhdGVUaW1lRm9ybWF0ID0gdHlwZSA9PiB7XG4gICAgcmV0dXJuIERFRkFVTFRfRElTUExBWV9GT1JNQVRTW18udG9VcHBlcih0eXBlKV07XG59O1xuXG4vLyBHZW5lcmF0ZSBmb3IgYXR0cmlidXRlIG9uIGxhYmVsIGFuZCBJRCBvbiBpbnB1dCBlbGVtZW50LCBzbyB0aGF0IGxhYmVsIGVsZW1lbnRzIGFyZSBhc3NvY2lhdGVkIHRvIGZvcm0gY29udHJvbHNcbmV4cG9ydCBjb25zdCBhZGRGb3JJZEF0dHJpYnV0ZXMgPSAoZWxlbWVudDogSFRNTEVsZW1lbnQpID0+IHtcbiAgICBjb25zdCBsYWJlbEVsID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKCdsYWJlbC5jb250cm9sLWxhYmVsJyk7XG4gICAgbGV0IGlucHV0RWwgPSBlbGVtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tmb2N1cy10YXJnZXRdJyk7XG4gICAgaWYgKCFpbnB1dEVsLmxlbmd0aCkge1xuICAgICAgICBpbnB1dEVsID0gZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKCdpbnB1dCwgc2VsZWN0LCB0ZXh0YXJlYScpO1xuICAgIH1cbiAgICAvKmlmIHRoZXJlIGFyZSBvbmx5IG9uZSBpbnB1dCBlbCBhbmQgbGFiZWwgRWwgYWRkIGlkIGFuZCBmb3IgYXR0cmlidXRlKi9cbiAgICBpZiAobGFiZWxFbC5sZW5ndGggJiYgaW5wdXRFbC5sZW5ndGgpIHtcbiAgICAgICAgY29uc3Qgd2lkZ2V0SWQgPSAkKGlucHV0RWxbMF0gYXMgSFRNTEVsZW1lbnQpLmNsb3Nlc3QoJ1t3aWRnZXQtaWRdJykuYXR0cignd2lkZ2V0LWlkJyk7XG4gICAgICAgIGlmICh3aWRnZXRJZCkge1xuICAgICAgICAgICAgc2V0QXR0cihpbnB1dEVsWzBdIGFzIEhUTUxFbGVtZW50LCAnaWQnLCB3aWRnZXRJZCk7XG4gICAgICAgICAgICBzZXRBdHRyKGxhYmVsRWxbMF0gYXMgSFRNTEVsZW1lbnQsICdmb3InLCB3aWRnZXRJZCk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG4vKipcbiAqIFRoaXMgbWV0aG9kIGlzIHVzZWQgdG8gYWRqdXN0IHRoZSBjb250YWluZXIgcG9zaXRpb24gZGVwZW5kaW5nIG9uIHRoZSB2aWV3cG9ydCBhbmQgc2Nyb2xsIGhlaWdodC5cbiAqIEZvciBleGFtcGxlOiAxLiBpZiB0aGUgd2lkZ2V0IGlzIGF0IGJvdHRvbSBvZiB0aGUgcGFnZSBkZXBlbmRpbmcgb24gdGhlIGF2YWlsYWJsZSBib3R0b20gc3BhY2UsIHRoZSBwaWNrZXIgd2lsbCBvcGVuIGF0IGJvdHRvbSBvciB0b3AgYXV0b21hdGljYWxseS5cbiAqIDIuIFdoZW4gd2UgaGF2ZSBkYXRhVGFibGUgd2l0aCBmb3JtIGFzIGEgZGlhbG9nLCBJZiB3aWRnZXQoZXg6IHNlYXJjaC9kYXRlL3RpbWUvZGF0ZXRpbWUpIGlzIGF0IGJvdHRvbSBvZiB0aGUgZGlhbG9nLCB0aGUgcGlja2VyIGlzIG5vdCB2aXNpYmxlIGNvbXBsZXRlbHkuIFNvIG9wZW4gdGhlIHBpY2tlciBhdCB0b3Agb2YgdGhlIHdpZGdldC5cbiAqIEBwYXJhbSBjb250YWluZXJFbGVtIC0gcGlja2VyL2Ryb3Bkb3duIGNvbnRhaW5lciBlbGVtZW50KGpxdWVyeSlcbiAqIEBwYXJhbSBwYXJlbnRFbGVtIC0gd2lkZ2V0IG5hdGl2ZSBlbGVtZW50XG4gKiBAcGFyYW0gcmVmIC0gc2NvcGUgb2YgcGFydGljdWxhciBsaWJyYXJ5IGRpcmVjdGl2ZVxuICogQHBhcmFtIGVsZSAtIENoaWxkIGVsZW1lbnQoanF1ZXJ5KS4gRm9yIHNvbWUgb2YgdGhlIHdpZGdldHModGltZSwgc2VhcmNoKSBjb250YWluZXJFbGVtIGRvZXNuJ3QgaGF2ZSBoZWlnaHQuIFRoZSBpbm5lciBlbGVtZW50KGRyb3Bkb3duLW1lbnUpIGhhcyBoZWlnaHQgc28gcGFzc2luZyBpdCBhcyBvcHRpb25hbC5cbiAqL1xuZXhwb3J0IGNvbnN0IGFkanVzdENvbnRhaW5lclBvc2l0aW9uID0gKGNvbnRhaW5lckVsZW0sIHBhcmVudEVsZW0sIHJlZiwgZWxlPykgPT4ge1xuICAgIGNvbnN0IGNvbnRhaW5lckhlaWdodCA9IGVsZSA/IF8ucGFyc2VJbnQoZWxlLmNzcygnaGVpZ2h0JykpIDogXy5wYXJzZUludChjb250YWluZXJFbGVtLmNzcygnaGVpZ2h0JykpO1xuICAgIGNvbnN0IHZpZXdQb3J0SGVpZ2h0ID0gJCh3aW5kb3cpLmhlaWdodCgpICsgd2luZG93LnNjcm9sbFk7XG4gICAgY29uc3QgcGFyZW50RGltZXNpb24gPSBwYXJlbnRFbGVtLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgIGNvbnN0IHBhcmVudFRvcCA9IHBhcmVudERpbWVzaW9uLnRvcCArIHdpbmRvdy5zY3JvbGxZO1xuXG4gICAgLy8gQWRqdXN0aW5nIGNvbnRhaW5lciBwb3NpdGlvbiBpZiBpcyBub3QgdmlzaWJsZSBhdCBib3R0b21cbiAgICBpZiAodmlld1BvcnRIZWlnaHQgLSAocGFyZW50VG9wICsgcGFyZW50RGltZXNpb24uaGVpZ2h0KSA8IGNvbnRhaW5lckhlaWdodCkge1xuICAgICAgICBjb25zdCBuZXdUb3AgPSBwYXJlbnRUb3AgLSBjb250YWluZXJIZWlnaHQ7XG4gICAgICAgIHJlZi5fbmdab25lLm9uU3RhYmxlLnN1YnNjcmliZSgoKSA9PiB7XG4gICAgICAgICAgICBjb250YWluZXJFbGVtLmNzcygndG9wJywgIG5ld1RvcCArICdweCcpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbn07XG5cbi8vIGNsb3NlIGFsbCB0aGUgcG9wb3ZlcnMuXG5leHBvcnQgY29uc3QgY2xvc2VQb3BvdmVyID0gKGVsZW1lbnQpID0+IHtcbiAgICBpZiAoIWVsZW1lbnQuY2xvc2VzdCgnLmFwcC1wb3BvdmVyJykubGVuZ3RoKSB7XG4gICAgICAgIGNvbnN0IHBvcG92ZXJFbGVtZW50cyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5hcHAtcG9wb3Zlci13cmFwcGVyJyk7XG4gICAgICAgIF8uZm9yRWFjaChwb3BvdmVyRWxlbWVudHMsIChlbGUpID0+IHtcbiAgICAgICAgICAgIGlmIChlbGUud2lkZ2V0LmlzT3Blbikge1xuICAgICAgICAgICAgICAgIGVsZS53aWRnZXQuaXNPcGVuID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbn07XG5cbi8qKlxuICogVGhpcyBtZXRob2QgaXMgdG8gdHJpZ2dlciBjaGFuZ2UgZGV0ZWN0aW9uIGluIHRoZSBhcHBcbiAqIFRoaXMgaXMgZXhwb3NlZCBmb3IgdGhlIGVuZCB1c2VyIGRldmVsb3BlciBvZiBXTSBhcHBcbiAqIFRoaXMgaXMgdGhlIGFsdGVybmF0aXZlIGZvciAkcnMuJHNhZmVBcHBseSgpIGluIEFuZ3VsYXJKU1xuICogU2VlICRhcHBEaWdlc3QgaW4gdXRpbHMgZm9yIG1vcmUgaW5mb1xuICovXG5leHBvcnQgY29uc3QgZGV0ZWN0Q2hhbmdlcyA9ICRhcHBEaWdlc3Q7XG4iXX0=