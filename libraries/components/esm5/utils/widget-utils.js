import { NG_VALUE_ACCESSOR, NG_VALIDATORS } from '@angular/forms';
import { forwardRef } from '@angular/core';
import { encodeUrl, isValidWebURL, stringStartsWith, FormWidgetType, $parseExpr, getClonedObject, prettifyLabel, initCaps, deHyphenate } from '@wm/core';
import { DialogRef, WidgetRef } from '../widgets/framework/types';
var DATASET_WIDGETS = new Set([FormWidgetType.SELECT, FormWidgetType.CHECKBOXSET, FormWidgetType.RADIOSET,
    FormWidgetType.SWITCH, FormWidgetType.AUTOCOMPLETE, FormWidgetType.CHIPS, FormWidgetType.TYPEAHEAD, FormWidgetType.RATING]);
/**
 * Returns the parsed, updated bound expression
 * if the expression is $[data[$i][firstName]] + '--' + $[lastName] + '--' + $['@ID@']
 * returns __1.firstName + '--' + lastName + '--' + __1['@ID@']
 */
var getUpdatedExpr = function (expr) {
    var updated = '', ch, next, i, j, matchCh, matchCount, isQuotedStr, subStr, isQuotedStrEvaluated;
    expr = expr.replace(/\$\[data\[\$i\]/g, '$[__1');
    for (i = 0; i < expr.length; i++) {
        ch = expr[i];
        next = expr[i + 1];
        /**
         * if the expression starts with $[, check the next(ch) character,
         *    if ch is a quote(', ") change the expr to __[
         *    if ch is a whiteSpace, remove it
         *    else remove $[
         */
        if (ch === '$' && next === '[') {
            matchCount = 1;
            isQuotedStrEvaluated = false;
            isQuotedStr = false;
            for (j = i + 2; j < expr.length; j++) {
                matchCh = expr[j];
                if (matchCh === ' ') {
                    continue;
                }
                if (!isQuotedStrEvaluated) {
                    isQuotedStr = expr[j] === '"' || expr[j] === '\'';
                    isQuotedStrEvaluated = true;
                }
                if (matchCh === '[') {
                    matchCount++;
                }
                else if (matchCh === ']') {
                    matchCount--;
                }
                if (!matchCount) {
                    subStr = expr.substring(i + 2, j);
                    if (isQuotedStr) {
                        updated += '__1[' + subStr + ']';
                    }
                    else {
                        updated += subStr;
                    }
                    break;
                }
            }
            i = j;
        }
        else {
            updated += ch;
        }
    }
    return updated;
};
var ɵ0 = getUpdatedExpr;
/**
 * Returns the value for the provided key in the object
 */
export var getObjValueByKey = function (obj, strKey) {
    /* check for the key-string */
    if (strKey) {
        var val_1;
        /* convert indexes to properties, so as to work for even 'key1[0].child1'*/
        strKey.replace(/\[(\w+)\]/g, '.$1').split('.').forEach(function (key) {
            // If obj is null, then assign val to null.
            val_1 = (val_1 && val_1[key]) || (_.isNull(obj) ? obj : obj[key]);
        });
        return val_1;
    }
    return obj;
};
/**
 * returns the display field data for any dataset widgets
 * Based on the bind display expression or display expression or display name,
 * data is extracted and formatted from the passed option object
 * If there is field is specified, field value is obtained from the dataObj.
 * If expression is given, evaluates the expression value.
 * else check for bindExpression, extract the value from the dataObj
 */
export var getEvaluatedData = function (dataObj, options, context) {
    var expressionValue;
    var field = options.field, expr = options.expression, bindExpr = options.bindExpression;
    // if key is bound expression
    if (bindExpr) {
        // remove 'bind:' prefix from the boundExpressionName
        expressionValue = bindExpr.replace('bind:', '');
        // parse the expressionValue for replacing all the expressions with values in the object
        expressionValue = getUpdatedExpr(expressionValue);
    }
    else {
        expressionValue = expr ? expr : field;
    }
    // Handling field name with special charecters
    // Ex: field = "f name"
    if (!bindExpr && !expr) {
        return _.get(dataObj, field);
    }
    return $parseExpr(expressionValue)(context, Object.assign({}, dataObj, { __1: dataObj }));
};
export var isActiveNavItem = function (link, routeName) {
    if (!link || !routeName) {
        return false;
    }
    routeName = routeName.indexOf('?') === -1 ? routeName : routeName.substring(0, routeName.indexOf('?'));
    link = link.indexOf('?') === -1 ? link : link.substring(0, link.indexOf('?'));
    var routeRegex = new RegExp('^(#\/|#)' + routeName + '$');
    return routeRegex.test(link);
};
/**
 * Returns the orderBy Expression based on the 'sort 'option in pageable object
 * returned by backend
 * @param pageableObj
 * @returns {string}
 */
export var getOrderByExpr = function (pageableObj) {
    pageableObj = pageableObj || [];
    var expressions = [], KEY_VAL_SEPARATOR = ' ', FIELD_SEPARATOR = ',';
    _.forEach(pageableObj, function (obj) {
        expressions.push(obj.property + KEY_VAL_SEPARATOR + obj.direction.toLowerCase());
    });
    return _.join(expressions, FIELD_SEPARATOR);
};
export var isDataSetWidget = function (widget) {
    return DATASET_WIDGETS.has(widget);
};
/*This function returns the url to the image after checking the validity of url*/
export var getImageUrl = function (urlString, shouldEncode, defaultUrl) {
    /*In studio mode before setting picturesource, check if the studioController is loaded and new picturesource is in 'styles/images/' path or not.
     * When page is refreshed, loader.gif will be loaded first and it will be in 'style/images/'.
     * Prepend 'services/projects/' + $rootScope.project.id + '/web/resources/images/imagelists/'  if the image url is just image name in the project root,
     * and if the url pointing to resources/images/ then 'services/projects/' + $rootScope.project.id + '/web/'*/
    if (isValidWebURL(urlString)) {
        return urlString;
    }
    // If no value is provided for picturesource assign pictureplaceholder or default-image
    if (!urlString) {
        urlString = defaultUrl || 'resources/images/imagelists/default-image.png';
    }
    urlString = shouldEncode ? encodeUrl(urlString) : urlString;
    // if the resource to be loaded is inside a prefab
    if (stringStartsWith(urlString, 'services/prefabs')) {
        return urlString;
    }
    return urlString;
};
/*This method returns the url to the backgroundImage*/
export var getBackGroundImageUrl = function (urlString) {
    if (urlString === '' || urlString === 'none') {
        return urlString;
    }
    return 'url(' + getImageUrl(urlString) + ')';
};
export function provideAs(reference, key, multi) {
    return {
        provide: key,
        useExisting: forwardRef(function () { return reference; }),
        multi: multi
    };
}
export function provideAsNgValidators(reference) {
    return provideAs(reference, NG_VALIDATORS, true);
}
export function provideAsNgValueAccessor(reference) {
    return provideAs(reference, NG_VALUE_ACCESSOR, true);
}
export function provideAsWidgetRef(reference) {
    return provideAs(reference, WidgetRef);
}
export function provideAsDialogRef(reference) {
    return provideAs(reference, DialogRef);
}
export var NAVIGATION_TYPE = {
    ADVANCED: 'Advanced',
    BASIC: 'Basic',
    CLASSIC: 'Classic',
    INLINE: 'Inline',
    NONE: 'None',
    ONDEMAND: 'On-Demand',
    PAGER: 'Pager',
    SCROLL: 'Scroll'
};
export var getWatchIdentifier = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return args.join('_');
};
var typesMap = {
    number: ['number', 'integer', 'big_integer', 'short', 'float', 'big_decimal', 'double', 'long', 'byte'],
    string: ['string', 'text'],
    character: ['character'],
    date: ['date', 'time', 'timestamp', 'datetime']
};
var modes = {
    number: ['exact', 'notequals', 'lessthan', 'lessthanequal', 'greaterthan', 'greaterthanequal', 'null', 'isnotnull'],
    string: ['anywhereignorecase', 'anywhere', 'startignorecase', 'start', 'endignorecase', 'end', 'exactignorecase', 'exact', 'notequalsignorecase', 'notequals', 'null', 'isnotnull', 'empty', 'isnotempty', 'nullorempty'],
    character: ['exactignorecase', 'exact', 'notequalsignorecase', 'notequals', 'null', 'isnotnull', 'empty', 'isnotempty', 'nullorempty'],
    date: ['exact', 'lessthan', 'lessthanequal', 'greaterthan', 'greaterthanequal', 'null', 'notequals', 'isnotnull']
};
var matchModeTypesMap = {
    boolean: ['exact', 'null', 'isnotnull'],
    clob: [],
    blob: []
};
export var getMatchModeTypesMap = function (multiMode) {
    if (multiMode) {
        modes.number.push('in', 'notin', 'between');
        modes.date.push('between');
        modes.string.push('in', 'notin');
        modes.character.push('in', 'notin');
    }
    _.forEach(typesMap, function (types, primType) {
        _.forEach(types, function (type) {
            matchModeTypesMap[type] = modes[primType];
        });
    });
    // this is used in filter criteria when the user types the column name manually and where we dont know the type of the column
    matchModeTypesMap['default'] = _.union(modes['number'], modes['string'], modes['character'], modes['date'], modes['date']);
    return matchModeTypesMap;
};
export var getMatchModeMsgs = function (appLocale) {
    return {
        start: appLocale.LABEL_STARTS_WITH,
        startignorecase: appLocale.LABEL_STARTS_WITH_IGNORECASE,
        end: appLocale.LABEL_ENDS_WITH,
        endignorecase: appLocale.LABEL_ENDS_WITH_IGNORECASE,
        anywhere: appLocale.LABEL_CONTAINS,
        anywhereignorecase: appLocale.LABEL_CONTAINS_IGNORECASE,
        exact: appLocale.LABEL_IS_EQUAL_TO,
        exactignorecase: appLocale.LABEL_IS_EQUAL_TO_IGNORECASE,
        notequals: appLocale.LABEL_IS_NOT_EQUAL_TO,
        notequalsignorecase: appLocale.LABEL_IS_NOT_EQUAL_TO_IGNORECASE,
        lessthan: appLocale.LABEL_LESS_THAN,
        lessthanequal: appLocale.LABEL_LESS_THAN_OR_EQUALS_TO,
        greaterthan: appLocale.LABEL_GREATER_THAN,
        greaterthanequal: appLocale.LABEL_GREATER_THAN_OR_EQUALS_TO,
        null: appLocale.LABEL_IS_NULL,
        isnotnull: appLocale.LABEL_IS_NOT_NULL,
        empty: appLocale.LABEL_IS_EMPTY,
        isnotempty: appLocale.LABEL_IS_NOT_EMPTY,
        nullorempty: appLocale.LABEL_IS_NULL_OR_EMPTY,
        in: appLocale.LABEL_IN,
        notin: appLocale.LABEL_NOT_IN,
        between: appLocale.LABEL_BETWEEN
    };
};
// Returns array of classes that are evaluated true for given object or array
var getClassesArray = function (classVal) {
    var classes = [];
    if (_.isArray(classVal)) {
        classVal.forEach(function (v) {
            classes = classes.concat(getClassesArray(v));
        });
        return classes;
    }
    if (_.isObject(classVal)) {
        _.forEach(classVal, function (val, key) {
            if (val) {
                classes = classes.concat(key.split(' '));
            }
        });
        return classes;
    }
};
var ɵ1 = getClassesArray;
export var getConditionalClasses = function (nv, ov) {
    var toAdd;
    var toRemove;
    // if the conditional class property has already toAdd and toRemove arrays then take that otherwise build those arrays
    var classToAdd = nv.toAdd || nv;
    var classToRemove = nv.toRemove || ov;
    if (_.isObject(nv)) {
        toAdd = _.isArray(classToAdd) ? classToAdd : getClassesArray(classToAdd || []);
        toRemove = classToRemove ? (_.isArray(classToRemove) ? classToRemove : getClassesArray(classToRemove)) : [];
    }
    else {
        toAdd = classToAdd ? [classToAdd] : [];
        toRemove = classToRemove ? [classToRemove] : [];
    }
    return { toAdd: toAdd, toRemove: toRemove };
};
/*helper function for prepareFieldDefs*/
var pushFieldDef = function (dataObject, columnDefObj, namePrefix, options) {
    /*loop over the fields in the dataObject to process them*/
    var modifiedTitle, relatedTable, relatedField, relatedInfo, fieldName, isRelated;
    if (!options) {
        options = {};
    }
    _.forEach(dataObject, function (value, title) {
        if (_.includes(title, '.')) {
            relatedInfo = _.split(title, '.');
            relatedTable = relatedInfo[0];
            relatedField = relatedInfo[1];
            isRelated = true;
        }
        if (options.noModifyTitle) {
            modifiedTitle = title;
        }
        else {
            if (_.isString(title)) {
                modifiedTitle = prettifyLabel(title);
                modifiedTitle = deHyphenate(modifiedTitle);
                modifiedTitle = namePrefix ? initCaps(namePrefix) + ' ' + modifiedTitle : modifiedTitle;
            }
            else {
                modifiedTitle = title;
            }
        }
        title = namePrefix ? namePrefix + '.' + title : title;
        if (isRelated) {
            // For related columns, shorten the title to last two words
            fieldName = _.split(modifiedTitle, ' ');
            fieldName = fieldName.length > 1 ? fieldName[fieldName.length - 2] + ' ' + fieldName[fieldName.length - 1] : fieldName[0];
        }
        else {
            fieldName = modifiedTitle;
        }
        var defObj = options.setBindingField ? { 'displayName': fieldName, 'field': title, 'relatedTable': relatedTable, 'relatedField': relatedField || modifiedTitle }
            : { 'displayName': fieldName, 'relatedTable': relatedTable, 'relatedField': relatedField || modifiedTitle };
        /*if field is a leaf node, push it in the columnDefs*/
        if (!_.isObject(value) || (_.isArray(value) && !value[0])) {
            /*if the column counter has reached upperBound return*/
            if (options.upperBound && options.columnCount === options.upperBound) {
                return;
            }
            columnDefObj.terminals.push(defObj);
            /*increment the column counter*/
            options.columnCount += 1;
        }
        else {
            /*else field is an object, process it recursively*/
            /* if parent node to be included, include it */
            if (options.columnCount !== options.upperBound) {
                columnDefObj.objects.push(defObj);
            }
            /* if field is an array node, process its first child */
            if (_.isArray(value) && value[0]) {
                pushFieldDef(value[0], columnDefObj, title + '[0]', options);
            }
            else {
                pushFieldDef(value, columnDefObj, title, options);
            }
        }
    });
};
var ɵ2 = pushFieldDef;
var getMetaDataFromData = function (data) {
    var dataObject;
    if (_.isArray(data)) {
        if (_.isObject(data[0])) {
            dataObject = getClonedObject(data[0]);
            /*Loop over the object to find out any null values. If any null values are present in the first row, check and assign the values from other row.
             * As column generation is dependent on data, for related fields if first row value is null, columns are not generated.
             * To prevent this, check the data in other rows and generate the columns. New keys from others rows are also added*/
            _.forEach(data, function (row, index) {
                if ((index + 1) >= 10) { // Limit the data search to first 10 records
                    return false;
                }
                _.assignWith(dataObject, row, function (objValue, srcValue) {
                    return (objValue === null || objValue === undefined) ? srcValue : objValue;
                });
            });
        }
        else {
            dataObject = data[0];
        }
    }
    else {
        dataObject = data;
    }
    return dataObject;
};
var ɵ3 = getMetaDataFromData;
export var prepareFieldDefs = function (data, options) {
    var dataObject;
    var columnDef = {
        'objects': [],
        'terminals': []
    };
    /*if no data provided, initialize default column definitions*/
    if (!data) {
        data = [];
    }
    if (!options) {
        options = {};
    }
    options.setBindingField = true;
    options.columnCount = 0;
    dataObject = getMetaDataFromData(data);
    /*first of the many data objects from grid data*/
    pushFieldDef(dataObject, columnDef, '', options);
    if (!options || (options && !options.filter)) {
        return columnDef.terminals;
    }
    switch (options.filter) {
        case 'all':
            return columnDef;
        case 'objects':
            return columnDef.objects;
        case 'terminals':
            return columnDef.terminals;
    }
    return columnDef;
};
export { ɵ0, ɵ1, ɵ2, ɵ3 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2lkZ2V0LXV0aWxzLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ1dGlscy93aWRnZXQtdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGlCQUFpQixFQUFFLGFBQWEsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQ2xFLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFM0MsT0FBTyxFQUFFLFNBQVMsRUFBRSxhQUFhLEVBQUUsZ0JBQWdCLEVBQUUsY0FBYyxFQUFFLFVBQVUsRUFBRSxlQUFlLEVBQUUsYUFBYSxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFDekosT0FBTyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUlsRSxJQUFNLGVBQWUsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsY0FBYyxDQUFDLFdBQVcsRUFBRSxjQUFjLENBQUMsUUFBUTtJQUN2RyxjQUFjLENBQUMsTUFBTSxFQUFFLGNBQWMsQ0FBQyxZQUFZLEVBQUUsY0FBYyxDQUFDLEtBQUssRUFBRSxjQUFjLENBQUMsU0FBUyxFQUFFLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0FBQ2hJOzs7O0dBSUc7QUFDSCxJQUFNLGNBQWMsR0FBRyxVQUFDLElBQVk7SUFDaEMsSUFBSSxPQUFPLEdBQUcsRUFBRSxFQUFFLEVBQUUsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsb0JBQW9CLENBQUM7SUFFakcsSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsa0JBQWtCLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFFakQsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsTUFB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O0lBQ2YsSUFBTSxTQUFTLEdBQUc7UUFDVixTQUFTLEVBQUcsRUFBRTtRQUNkLFdBQVcsRUFBRyxFQUFFO0tBQ25CLENBQUM7SUFDTiw4REFBOEQ7SUFDOUQsSUFBSSxDQUFDLElBQUksRUFBRTtRQUNQLElBQUksR0FBRyxFQUFFLENBQUM7S0FDYjtJQUNELElBQUksQ0FBQyxPQUFPLEVBQUU7UUFDVixPQUFPLEdBQUcsRUFBRSxDQUFDO0tBQ2hCO0lBQ0QsT0FBTyxDQUFDLGVBQWUsR0FBRyxJQUFJLENBQUM7SUFDL0IsT0FBTyxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUM7SUFDeEIsVUFBVSxHQUFHLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3ZDLGlEQUFpRDtJQUNqRCxZQUFZLENBQUMsVUFBVSxFQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDakQsSUFBSSxDQUFDLE9BQU8sSUFBSSxDQUFDLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsRUFBRTtRQUMxQyxPQUFPLFNBQVMsQ0FBQyxTQUFTLENBQUM7S0FDOUI7SUFDRCxRQUFRLE9BQU8sQ0FBQyxNQUFNLEVBQUU7UUFDcEIsS0FBSyxLQUFLO1lBQ04sT0FBTyxTQUFTLENBQUM7UUFDckIsS0FBSyxTQUFTO1lBQ1YsT0FBTyxTQUFTLENBQUMsT0FBTyxDQUFDO1FBQzdCLEtBQUssV0FBVztZQUNaLE9BQU8sU0FBUyxDQUFDLFNBQVMsQ0FBQztLQUNsQztJQUNELE9BQU8sU0FBUyxDQUFDO0FBQ3JCLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5HX1ZBTFVFX0FDQ0VTU09SLCBOR19WQUxJREFUT1JTIH0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuaW1wb3J0IHsgZm9yd2FyZFJlZiB9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQgeyBlbmNvZGVVcmwsIGlzVmFsaWRXZWJVUkwsIHN0cmluZ1N0YXJ0c1dpdGgsIEZvcm1XaWRnZXRUeXBlLCAkcGFyc2VFeHByLCBnZXRDbG9uZWRPYmplY3QsIHByZXR0aWZ5TGFiZWwsIGluaXRDYXBzLCBkZUh5cGhlbmF0ZSB9IGZyb20gJ0B3bS9jb3JlJztcbmltcG9ydCB7IERpYWxvZ1JlZiwgV2lkZ2V0UmVmIH0gZnJvbSAnLi4vd2lkZ2V0cy9mcmFtZXdvcmsvdHlwZXMnO1xuXG5kZWNsYXJlIGNvbnN0IF87XG5cbmNvbnN0IERBVEFTRVRfV0lER0VUUyA9IG5ldyBTZXQoW0Zvcm1XaWRnZXRUeXBlLlNFTEVDVCwgRm9ybVdpZGdldFR5cGUuQ0hFQ0tCT1hTRVQsIEZvcm1XaWRnZXRUeXBlLlJBRElPU0VULFxuICAgIEZvcm1XaWRnZXRUeXBlLlNXSVRDSCwgRm9ybVdpZGdldFR5cGUuQVVUT0NPTVBMRVRFLCBGb3JtV2lkZ2V0VHlwZS5DSElQUywgRm9ybVdpZGdldFR5cGUuVFlQRUFIRUFELCBGb3JtV2lkZ2V0VHlwZS5SQVRJTkddKTtcbi8qKlxuICogUmV0dXJucyB0aGUgcGFyc2VkLCB1cGRhdGVkIGJvdW5kIGV4cHJlc3Npb25cbiAqIGlmIHRoZSBleHByZXNzaW9uIGlzICRbZGF0YVskaV1bZmlyc3ROYW1lXV0gKyAnLS0nICsgJFtsYXN0TmFtZV0gKyAnLS0nICsgJFsnQElEQCddXG4gKiByZXR1cm5zIF9fMS5maXJzdE5hbWUgKyAnLS0nICsgbGFzdE5hbWUgKyAnLS0nICsgX18xWydASURAJ11cbiAqL1xuY29uc3QgZ2V0VXBkYXRlZEV4cHIgPSAoZXhwcjogc3RyaW5nKSA9PiB7XG4gICAgbGV0IHVwZGF0ZWQgPSAnJywgY2gsIG5leHQsIGksIGosIG1hdGNoQ2gsIG1hdGNoQ291bnQsIGlzUXVvdGVkU3RyLCBzdWJTdHIsIGlzUXVvdGVkU3RyRXZhbHVhdGVkO1xuXG4gICAgZXhwciA9IGV4cHIucmVwbGFjZSgvXFwkXFxbZGF0YVxcW1xcJGlcXF0vZywgJyRbX18xJyk7XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgZXhwci5sZW5ndGg7IGkrKykge1xuICAgICAgICBjaCA9IGV4cHJbaV07XG4gICAgICAgIG5leHQgPSBleHByW2kgKyAxXTtcblxuICAgICAgICAvKipcbiAgICAgICAgICogaWYgdGhlIGV4cHJlc3Npb24gc3RhcnRzIHdpdGggJFssIGNoZWNrIHRoZSBuZXh0KGNoKSBjaGFyYWN0ZXIsXG4gICAgICAgICAqICAgIGlmIGNoIGlzIGEgcXVvdGUoJywgXCIpIGNoYW5nZSB0aGUgZXhwciB0byBfX1tcbiAgICAgICAgICogICAgaWYgY2ggaXMgYSB3aGl0ZVNwYWNlLCByZW1vdmUgaXRcbiAgICAgICAgICogICAgZWxzZSByZW1vdmUgJFtcbiAgICAgICAgICovXG4gICAgICAgIGlmIChjaCA9PT0gJyQnICYmIG5leHQgPT09ICdbJykge1xuICAgICAgICAgICAgbWF0Y2hDb3VudCA9IDE7XG4gICAgICAgICAgICBpc1F1b3RlZFN0ckV2YWx1YXRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgaXNRdW90ZWRTdHIgPSBmYWxzZTtcblxuICAgICAgICAgICAgZm9yIChqID0gaSArIDI7IGogPCBleHByLmxlbmd0aDsgaisrKSB7XG5cbiAgICAgICAgICAgICAgICBtYXRjaENoID0gZXhwcltqXTtcblxuICAgICAgICAgICAgICAgIGlmIChtYXRjaENoID09PSAnICcpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKCFpc1F1b3RlZFN0ckV2YWx1YXRlZCkge1xuICAgICAgICAgICAgICAgICAgICBpc1F1b3RlZFN0ciA9IGV4cHJbal0gPT09ICdcIicgfHwgZXhwcltqXSA9PT0gJ1xcJyc7XG4gICAgICAgICAgICAgICAgICAgIGlzUXVvdGVkU3RyRXZhbHVhdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAobWF0Y2hDaCA9PT0gJ1snKSB7XG4gICAgICAgICAgICAgICAgICAgIG1hdGNoQ291bnQrKztcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG1hdGNoQ2ggPT09ICddJykge1xuICAgICAgICAgICAgICAgICAgICBtYXRjaENvdW50LS07XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKCFtYXRjaENvdW50KSB7XG4gICAgICAgICAgICAgICAgICAgIHN1YlN0ciA9IGV4cHIuc3Vic3RyaW5nKGkgKyAyLCBqKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzUXVvdGVkU3RyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVkICs9ICdfXzFbJyArIHN1YlN0ciArICddJztcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZWQgKz0gc3ViU3RyO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaSA9IGo7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB1cGRhdGVkICs9IGNoO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHVwZGF0ZWQ7XG59O1xuXG4vKipcbiAqIFJldHVybnMgdGhlIHZhbHVlIGZvciB0aGUgcHJvdmlkZWQga2V5IGluIHRoZSBvYmplY3RcbiAqL1xuZXhwb3J0IGNvbnN0IGdldE9ialZhbHVlQnlLZXkgPSAob2JqOiBhbnksIHN0cktleTogc3RyaW5nKSA9PiB7XG4gICAgLyogY2hlY2sgZm9yIHRoZSBrZXktc3RyaW5nICovXG4gICAgaWYgKHN0cktleSkge1xuICAgICAgICBsZXQgdmFsO1xuICAgICAgICAvKiBjb252ZXJ0IGluZGV4ZXMgdG8gcHJvcGVydGllcywgc28gYXMgdG8gd29yayBmb3IgZXZlbiAna2V5MVswXS5jaGlsZDEnKi9cbiAgICAgICAgc3RyS2V5LnJlcGxhY2UoL1xcWyhcXHcrKVxcXS9nLCAnLiQxJykuc3BsaXQoJy4nKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgICAgICAgICAvLyBJZiBvYmogaXMgbnVsbCwgdGhlbiBhc3NpZ24gdmFsIHRvIG51bGwuXG4gICAgICAgICAgICB2YWwgPSAodmFsICYmIHZhbFtrZXldKSB8fCAoXy5pc051bGwob2JqKSA/IG9iaiA6IG9ialtrZXldKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB2YWw7XG4gICAgfVxuICAgIHJldHVybiBvYmo7XG59O1xuXG4vKipcbiAqIHJldHVybnMgdGhlIGRpc3BsYXkgZmllbGQgZGF0YSBmb3IgYW55IGRhdGFzZXQgd2lkZ2V0c1xuICogQmFzZWQgb24gdGhlIGJpbmQgZGlzcGxheSBleHByZXNzaW9uIG9yIGRpc3BsYXkgZXhwcmVzc2lvbiBvciBkaXNwbGF5IG5hbWUsXG4gKiBkYXRhIGlzIGV4dHJhY3RlZCBhbmQgZm9ybWF0dGVkIGZyb20gdGhlIHBhc3NlZCBvcHRpb24gb2JqZWN0XG4gKiBJZiB0aGVyZSBpcyBmaWVsZCBpcyBzcGVjaWZpZWQsIGZpZWxkIHZhbHVlIGlzIG9idGFpbmVkIGZyb20gdGhlIGRhdGFPYmouXG4gKiBJZiBleHByZXNzaW9uIGlzIGdpdmVuLCBldmFsdWF0ZXMgdGhlIGV4cHJlc3Npb24gdmFsdWUuXG4gKiBlbHNlIGNoZWNrIGZvciBiaW5kRXhwcmVzc2lvbiwgZXh0cmFjdCB0aGUgdmFsdWUgZnJvbSB0aGUgZGF0YU9ialxuICovXG5leHBvcnQgY29uc3QgZ2V0RXZhbHVhdGVkRGF0YSA9IChkYXRhT2JqOiBhbnksIG9wdGlvbnM6IGFueSwgY29udGV4dD86IGFueSkgPT4ge1xuICAgIGxldCBleHByZXNzaW9uVmFsdWU7XG4gICAgY29uc3QgZmllbGQgPSBvcHRpb25zLmZpZWxkLFxuICAgICAgICBleHByID0gb3B0aW9ucy5leHByZXNzaW9uLFxuICAgICAgICBiaW5kRXhwciA9IG9wdGlvbnMuYmluZEV4cHJlc3Npb247XG5cbiAgICAvLyBpZiBrZXkgaXMgYm91bmQgZXhwcmVzc2lvblxuICAgIGlmIChiaW5kRXhwcikge1xuICAgICAgICAvLyByZW1vdmUgJ2JpbmQ6JyBwcmVmaXggZnJvbSB0aGUgYm91bmRFeHByZXNzaW9uTmFtZVxuICAgICAgICBleHByZXNzaW9uVmFsdWUgPSBiaW5kRXhwci5yZXBsYWNlKCdiaW5kOicsICcnKTtcbiAgICAgICAgLy8gcGFyc2UgdGhlIGV4cHJlc3Npb25WYWx1ZSBmb3IgcmVwbGFjaW5nIGFsbCB0aGUgZXhwcmVzc2lvbnMgd2l0aCB2YWx1ZXMgaW4gdGhlIG9iamVjdFxuICAgICAgICBleHByZXNzaW9uVmFsdWUgPSBnZXRVcGRhdGVkRXhwcihleHByZXNzaW9uVmFsdWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGV4cHJlc3Npb25WYWx1ZSA9IGV4cHIgPyBleHByIDogZmllbGQ7XG4gICAgfVxuXG4gICAgLy8gSGFuZGxpbmcgZmllbGQgbmFtZSB3aXRoIHNwZWNpYWwgY2hhcmVjdGVyc1xuICAgIC8vIEV4OiBmaWVsZCA9IFwiZiBuYW1lXCJcbiAgICBpZiAoIWJpbmRFeHByICYmICFleHByKSB7XG4gICAgICAgIHJldHVybiBfLmdldChkYXRhT2JqLCBmaWVsZCk7XG4gICAgfVxuXG4gICAgcmV0dXJuICRwYXJzZUV4cHIoZXhwcmVzc2lvblZhbHVlKShjb250ZXh0LCBPYmplY3QuYXNzaWduKHt9LCBkYXRhT2JqLCB7X18xOiBkYXRhT2JqfSkpO1xufTtcblxuZXhwb3J0IGNvbnN0IGlzQWN0aXZlTmF2SXRlbSA9IChsaW5rLCByb3V0ZU5hbWUpID0+IHtcbiAgICBpZiAoIWxpbmsgfHwgIXJvdXRlTmFtZSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJvdXRlTmFtZSA9IHJvdXRlTmFtZS5pbmRleE9mKCc/JykgPT09IC0xID8gcm91dGVOYW1lIDogcm91dGVOYW1lLnN1YnN0cmluZygwLCByb3V0ZU5hbWUuaW5kZXhPZignPycpKTtcbiAgICBsaW5rID0gbGluay5pbmRleE9mKCc/JykgPT09IC0xID8gbGluayA6IGxpbmsuc3Vic3RyaW5nKDAsIGxpbmsuaW5kZXhPZignPycpKTtcbiAgICBjb25zdCByb3V0ZVJlZ2V4ID0gbmV3IFJlZ0V4cCgnXigjXFwvfCMpJyArIHJvdXRlTmFtZSArICckJyk7XG4gICAgcmV0dXJuIHJvdXRlUmVnZXgudGVzdChsaW5rKTtcbn07XG5cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBvcmRlckJ5IEV4cHJlc3Npb24gYmFzZWQgb24gdGhlICdzb3J0ICdvcHRpb24gaW4gcGFnZWFibGUgb2JqZWN0XG4gKiByZXR1cm5lZCBieSBiYWNrZW5kXG4gKiBAcGFyYW0gcGFnZWFibGVPYmpcbiAqIEByZXR1cm5zIHtzdHJpbmd9XG4gKi9cbmV4cG9ydCBjb25zdCBnZXRPcmRlckJ5RXhwciA9IHBhZ2VhYmxlT2JqID0+IHtcbiAgICBwYWdlYWJsZU9iaiA9IHBhZ2VhYmxlT2JqIHx8IFtdO1xuICAgIGNvbnN0IGV4cHJlc3Npb25zICAgICAgID0gW10sXG4gICAgICAgIEtFWV9WQUxfU0VQQVJBVE9SID0gJyAnLFxuICAgICAgICBGSUVMRF9TRVBBUkFUT1IgICA9ICcsJztcbiAgICBfLmZvckVhY2gocGFnZWFibGVPYmosIG9iaiA9PiB7XG4gICAgICAgIGV4cHJlc3Npb25zLnB1c2gob2JqLnByb3BlcnR5ICsgS0VZX1ZBTF9TRVBBUkFUT1IgKyBvYmouZGlyZWN0aW9uLnRvTG93ZXJDYXNlKCkpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIF8uam9pbihleHByZXNzaW9ucywgRklFTERfU0VQQVJBVE9SKTtcbn07XG5cbmV4cG9ydCBjb25zdCBpc0RhdGFTZXRXaWRnZXQgPSB3aWRnZXQgPT4ge1xuICAgIHJldHVybiBEQVRBU0VUX1dJREdFVFMuaGFzKHdpZGdldCk7XG59O1xuXG4vKlRoaXMgZnVuY3Rpb24gcmV0dXJucyB0aGUgdXJsIHRvIHRoZSBpbWFnZSBhZnRlciBjaGVja2luZyB0aGUgdmFsaWRpdHkgb2YgdXJsKi9cbmV4cG9ydCBjb25zdCBnZXRJbWFnZVVybCA9ICh1cmxTdHJpbmcsIHNob3VsZEVuY29kZT8sIGRlZmF1bHRVcmw/KSA9PiB7XG4gICAgLypJbiBzdHVkaW8gbW9kZSBiZWZvcmUgc2V0dGluZyBwaWN0dXJlc291cmNlLCBjaGVjayBpZiB0aGUgc3R1ZGlvQ29udHJvbGxlciBpcyBsb2FkZWQgYW5kIG5ldyBwaWN0dXJlc291cmNlIGlzIGluICdzdHlsZXMvaW1hZ2VzLycgcGF0aCBvciBub3QuXG4gICAgICogV2hlbiBwYWdlIGlzIHJlZnJlc2hlZCwgbG9hZGVyLmdpZiB3aWxsIGJlIGxvYWRlZCBmaXJzdCBhbmQgaXQgd2lsbCBiZSBpbiAnc3R5bGUvaW1hZ2VzLycuXG4gICAgICogUHJlcGVuZCAnc2VydmljZXMvcHJvamVjdHMvJyArICRyb290U2NvcGUucHJvamVjdC5pZCArICcvd2ViL3Jlc291cmNlcy9pbWFnZXMvaW1hZ2VsaXN0cy8nICBpZiB0aGUgaW1hZ2UgdXJsIGlzIGp1c3QgaW1hZ2UgbmFtZSBpbiB0aGUgcHJvamVjdCByb290LFxuICAgICAqIGFuZCBpZiB0aGUgdXJsIHBvaW50aW5nIHRvIHJlc291cmNlcy9pbWFnZXMvIHRoZW4gJ3NlcnZpY2VzL3Byb2plY3RzLycgKyAkcm9vdFNjb3BlLnByb2plY3QuaWQgKyAnL3dlYi8nKi9cbiAgICBpZiAoaXNWYWxpZFdlYlVSTCh1cmxTdHJpbmcpKSB7XG4gICAgICAgIHJldHVybiB1cmxTdHJpbmc7XG4gICAgfVxuXG4gICAgLy8gSWYgbm8gdmFsdWUgaXMgcHJvdmlkZWQgZm9yIHBpY3R1cmVzb3VyY2UgYXNzaWduIHBpY3R1cmVwbGFjZWhvbGRlciBvciBkZWZhdWx0LWltYWdlXG4gICAgaWYgKCF1cmxTdHJpbmcpIHtcbiAgICAgICAgdXJsU3RyaW5nID0gZGVmYXVsdFVybCB8fCAncmVzb3VyY2VzL2ltYWdlcy9pbWFnZWxpc3RzL2RlZmF1bHQtaW1hZ2UucG5nJztcbiAgICB9XG5cbiAgICB1cmxTdHJpbmcgPSBzaG91bGRFbmNvZGUgPyBlbmNvZGVVcmwodXJsU3RyaW5nKSA6IHVybFN0cmluZztcblxuICAgIC8vIGlmIHRoZSByZXNvdXJjZSB0byBiZSBsb2FkZWQgaXMgaW5zaWRlIGEgcHJlZmFiXG4gICAgaWYgKHN0cmluZ1N0YXJ0c1dpdGgodXJsU3RyaW5nLCAnc2VydmljZXMvcHJlZmFicycpKSB7XG4gICAgICAgIHJldHVybiB1cmxTdHJpbmc7XG4gICAgfVxuXG4gICAgcmV0dXJuIHVybFN0cmluZztcbn07XG5cbi8qVGhpcyBtZXRob2QgcmV0dXJucyB0aGUgdXJsIHRvIHRoZSBiYWNrZ3JvdW5kSW1hZ2UqL1xuZXhwb3J0IGNvbnN0IGdldEJhY2tHcm91bmRJbWFnZVVybCA9ICh1cmxTdHJpbmcpID0+IHtcbiAgICBpZiAodXJsU3RyaW5nID09PSAnJyB8fCB1cmxTdHJpbmcgPT09ICdub25lJykge1xuICAgICAgICByZXR1cm4gdXJsU3RyaW5nO1xuICAgIH1cbiAgICByZXR1cm4gJ3VybCgnICsgZ2V0SW1hZ2VVcmwodXJsU3RyaW5nKSArICcpJztcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBwcm92aWRlQXMocmVmZXJlbmNlOiBhbnksIGtleTogYW55LCBtdWx0aT86IGJvb2xlYW4pIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBwcm92aWRlOiBrZXksXG4gICAgICAgIHVzZUV4aXN0aW5nOiBmb3J3YXJkUmVmKCgpID0+IHJlZmVyZW5jZSksXG4gICAgICAgIG11bHRpOiBtdWx0aVxuICAgIH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcm92aWRlQXNOZ1ZhbGlkYXRvcnMocmVmZXJlbmNlOiBhbnkpIHtcbiAgICByZXR1cm4gcHJvdmlkZUFzKHJlZmVyZW5jZSwgTkdfVkFMSURBVE9SUywgdHJ1ZSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcm92aWRlQXNOZ1ZhbHVlQWNjZXNzb3IocmVmZXJlbmNlOiBhbnkpIHtcbiAgICByZXR1cm4gcHJvdmlkZUFzKHJlZmVyZW5jZSwgTkdfVkFMVUVfQUNDRVNTT1IsIHRydWUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJvdmlkZUFzV2lkZ2V0UmVmKHJlZmVyZW5jZTogYW55KSB7XG4gICAgcmV0dXJuIHByb3ZpZGVBcyhyZWZlcmVuY2UsIFdpZGdldFJlZik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBwcm92aWRlQXNEaWFsb2dSZWYocmVmZXJlbmNlOiBhbnkpIHtcbiAgICByZXR1cm4gcHJvdmlkZUFzKHJlZmVyZW5jZSwgRGlhbG9nUmVmKTtcbn1cblxuZXhwb3J0IGNvbnN0IE5BVklHQVRJT05fVFlQRSA9IHtcbiAgICBBRFZBTkNFRDogJ0FkdmFuY2VkJyxcbiAgICBCQVNJQzogJ0Jhc2ljJyxcbiAgICBDTEFTU0lDOiAnQ2xhc3NpYycsXG4gICAgSU5MSU5FOiAnSW5saW5lJyxcbiAgICBOT05FOiAnTm9uZScsXG4gICAgT05ERU1BTkQ6ICdPbi1EZW1hbmQnLFxuICAgIFBBR0VSOiAnUGFnZXInLFxuICAgIFNDUk9MTDogJ1Njcm9sbCdcbn07XG5cblxuZXhwb3J0IGNvbnN0IGdldFdhdGNoSWRlbnRpZmllciA9ICguLi5hcmdzKSA9PiBhcmdzLmpvaW4oJ18nKTtcblxuY29uc3QgdHlwZXNNYXAgPSB7XG4gICAgbnVtYmVyOiBbJ251bWJlcicsICdpbnRlZ2VyJywgJ2JpZ19pbnRlZ2VyJywgJ3Nob3J0JywgJ2Zsb2F0JywgJ2JpZ19kZWNpbWFsJywgJ2RvdWJsZScsICdsb25nJywgJ2J5dGUnXSxcbiAgICBzdHJpbmc6IFsnc3RyaW5nJywgJ3RleHQnXSxcbiAgICBjaGFyYWN0ZXI6IFsnY2hhcmFjdGVyJ10sXG4gICAgZGF0ZTogWydkYXRlJywgJ3RpbWUnLCAgJ3RpbWVzdGFtcCcsICdkYXRldGltZSddXG59O1xuY29uc3QgbW9kZXMgPSB7XG4gICAgbnVtYmVyOiBbJ2V4YWN0JywgJ25vdGVxdWFscycsICdsZXNzdGhhbicsICdsZXNzdGhhbmVxdWFsJywgJ2dyZWF0ZXJ0aGFuJywgJ2dyZWF0ZXJ0aGFuZXF1YWwnLCAnbnVsbCcsICdpc25vdG51bGwnXSxcbiAgICBzdHJpbmc6IFsnYW55d2hlcmVpZ25vcmVjYXNlJywgJ2FueXdoZXJlJywgJ3N0YXJ0aWdub3JlY2FzZScsICdzdGFydCcsICdlbmRpZ25vcmVjYXNlJywgJ2VuZCcsICdleGFjdGlnbm9yZWNhc2UnLCAnZXhhY3QnLCAnbm90ZXF1YWxzaWdub3JlY2FzZScsICdub3RlcXVhbHMnLCAnbnVsbCcsICdpc25vdG51bGwnLCAnZW1wdHknLCAnaXNub3RlbXB0eScsICdudWxsb3JlbXB0eSddLFxuICAgIGNoYXJhY3RlcjogWydleGFjdGlnbm9yZWNhc2UnLCAnZXhhY3QnLCAnbm90ZXF1YWxzaWdub3JlY2FzZScsICdub3RlcXVhbHMnLCAnbnVsbCcsICdpc25vdG51bGwnLCAnZW1wdHknLCAnaXNub3RlbXB0eScsICdudWxsb3JlbXB0eSddLFxuICAgIGRhdGU6IFsnZXhhY3QnLCAnbGVzc3RoYW4nLCAnbGVzc3RoYW5lcXVhbCcsICdncmVhdGVydGhhbicsICdncmVhdGVydGhhbmVxdWFsJywgJ251bGwnLCAnbm90ZXF1YWxzJywgJ2lzbm90bnVsbCddXG59O1xuY29uc3QgbWF0Y2hNb2RlVHlwZXNNYXAgPSB7XG4gICAgYm9vbGVhbjogWydleGFjdCcsICdudWxsJywgJ2lzbm90bnVsbCddLFxuICAgIGNsb2I6IFtdLFxuICAgIGJsb2I6IFtdXG59O1xuZXhwb3J0IGNvbnN0IGdldE1hdGNoTW9kZVR5cGVzTWFwID0gKG11bHRpTW9kZT8pID0+IHtcbiAgICBpZiAobXVsdGlNb2RlKSB7XG4gICAgICAgIG1vZGVzLm51bWJlci5wdXNoKCdpbicsICdub3RpbicsICdiZXR3ZWVuJyk7XG4gICAgICAgIG1vZGVzLmRhdGUucHVzaCgnYmV0d2VlbicpO1xuICAgICAgICBtb2Rlcy5zdHJpbmcucHVzaCgnaW4nLCAnbm90aW4nKTtcbiAgICAgICAgbW9kZXMuY2hhcmFjdGVyLnB1c2goJ2luJywgJ25vdGluJyk7XG4gICAgfVxuXG4gICAgXy5mb3JFYWNoKHR5cGVzTWFwLCAodHlwZXMsIHByaW1UeXBlKSA9PiB7XG4gICAgICAgIF8uZm9yRWFjaCh0eXBlcywgdHlwZSA9PiB7XG4gICAgICAgICAgICBtYXRjaE1vZGVUeXBlc01hcFt0eXBlXSA9IG1vZGVzW3ByaW1UeXBlXTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG4gICAgLy8gdGhpcyBpcyB1c2VkIGluIGZpbHRlciBjcml0ZXJpYSB3aGVuIHRoZSB1c2VyIHR5cGVzIHRoZSBjb2x1bW4gbmFtZSBtYW51YWxseSBhbmQgd2hlcmUgd2UgZG9udCBrbm93IHRoZSB0eXBlIG9mIHRoZSBjb2x1bW5cbiAgICBtYXRjaE1vZGVUeXBlc01hcFsnZGVmYXVsdCddID0gXy51bmlvbihtb2Rlc1snbnVtYmVyJ10sIG1vZGVzWydzdHJpbmcnXSwgbW9kZXNbJ2NoYXJhY3RlciddLCBtb2Rlc1snZGF0ZSddLCBtb2Rlc1snZGF0ZSddKTtcbiAgICByZXR1cm4gbWF0Y2hNb2RlVHlwZXNNYXA7XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0TWF0Y2hNb2RlTXNncyA9IChhcHBMb2NhbGUpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICBzdGFydCAgICAgICAgICAgIDogYXBwTG9jYWxlLkxBQkVMX1NUQVJUU19XSVRILFxuICAgICAgICBzdGFydGlnbm9yZWNhc2UgIDogYXBwTG9jYWxlLkxBQkVMX1NUQVJUU19XSVRIX0lHTk9SRUNBU0UsXG4gICAgICAgIGVuZCAgICAgICAgICAgICAgOiBhcHBMb2NhbGUuTEFCRUxfRU5EU19XSVRILFxuICAgICAgICBlbmRpZ25vcmVjYXNlICAgIDogYXBwTG9jYWxlLkxBQkVMX0VORFNfV0lUSF9JR05PUkVDQVNFLFxuICAgICAgICBhbnl3aGVyZSAgICAgICAgIDogYXBwTG9jYWxlLkxBQkVMX0NPTlRBSU5TLFxuICAgICAgICBhbnl3aGVyZWlnbm9yZWNhc2U6IGFwcExvY2FsZS5MQUJFTF9DT05UQUlOU19JR05PUkVDQVNFLFxuICAgICAgICBleGFjdCAgICAgICAgICAgIDogYXBwTG9jYWxlLkxBQkVMX0lTX0VRVUFMX1RPLFxuICAgICAgICBleGFjdGlnbm9yZWNhc2UgIDogYXBwTG9jYWxlLkxBQkVMX0lTX0VRVUFMX1RPX0lHTk9SRUNBU0UsXG4gICAgICAgIG5vdGVxdWFscyAgICAgICAgOiBhcHBMb2NhbGUuTEFCRUxfSVNfTk9UX0VRVUFMX1RPLFxuICAgICAgICBub3RlcXVhbHNpZ25vcmVjYXNlOiBhcHBMb2NhbGUuTEFCRUxfSVNfTk9UX0VRVUFMX1RPX0lHTk9SRUNBU0UsXG4gICAgICAgIGxlc3N0aGFuICAgICAgICAgOiBhcHBMb2NhbGUuTEFCRUxfTEVTU19USEFOLFxuICAgICAgICBsZXNzdGhhbmVxdWFsICAgIDogYXBwTG9jYWxlLkxBQkVMX0xFU1NfVEhBTl9PUl9FUVVBTFNfVE8sXG4gICAgICAgIGdyZWF0ZXJ0aGFuICAgICAgOiBhcHBMb2NhbGUuTEFCRUxfR1JFQVRFUl9USEFOLFxuICAgICAgICBncmVhdGVydGhhbmVxdWFsIDogYXBwTG9jYWxlLkxBQkVMX0dSRUFURVJfVEhBTl9PUl9FUVVBTFNfVE8sXG4gICAgICAgIG51bGwgICAgICAgICAgICAgOiBhcHBMb2NhbGUuTEFCRUxfSVNfTlVMTCxcbiAgICAgICAgaXNub3RudWxsICAgICAgICA6IGFwcExvY2FsZS5MQUJFTF9JU19OT1RfTlVMTCxcbiAgICAgICAgZW1wdHkgICAgICAgICAgICA6IGFwcExvY2FsZS5MQUJFTF9JU19FTVBUWSxcbiAgICAgICAgaXNub3RlbXB0eSAgICAgICA6IGFwcExvY2FsZS5MQUJFTF9JU19OT1RfRU1QVFksXG4gICAgICAgIG51bGxvcmVtcHR5ICAgICAgOiBhcHBMb2NhbGUuTEFCRUxfSVNfTlVMTF9PUl9FTVBUWSxcbiAgICAgICAgaW4gICAgICAgICAgICAgICA6IGFwcExvY2FsZS5MQUJFTF9JTixcbiAgICAgICAgbm90aW4gICAgICAgICAgICA6IGFwcExvY2FsZS5MQUJFTF9OT1RfSU4sXG4gICAgICAgIGJldHdlZW4gICAgICAgICAgOiBhcHBMb2NhbGUuTEFCRUxfQkVUV0VFTlxuICAgIH07XG59O1xuXG4vLyBSZXR1cm5zIGFycmF5IG9mIGNsYXNzZXMgdGhhdCBhcmUgZXZhbHVhdGVkIHRydWUgZm9yIGdpdmVuIG9iamVjdCBvciBhcnJheVxuY29uc3QgZ2V0Q2xhc3Nlc0FycmF5ID0gY2xhc3NWYWwgPT4ge1xuICAgIGxldCBjbGFzc2VzID0gW107XG5cbiAgICBpZiAoXy5pc0FycmF5KGNsYXNzVmFsKSkge1xuICAgICAgICBjbGFzc1ZhbC5mb3JFYWNoKHYgPT4ge1xuICAgICAgICAgICAgY2xhc3NlcyA9IGNsYXNzZXMuY29uY2F0KGdldENsYXNzZXNBcnJheSh2KSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gY2xhc3NlcztcbiAgICB9XG4gICAgaWYgKF8uaXNPYmplY3QoY2xhc3NWYWwpKSB7XG4gICAgICAgIF8uZm9yRWFjaChjbGFzc1ZhbCwgKHZhbCwga2V5KSA9PiB7XG4gICAgICAgICAgICBpZiAodmFsKSB7XG4gICAgICAgICAgICAgICAgY2xhc3NlcyA9IGNsYXNzZXMuY29uY2F0KGtleS5zcGxpdCgnICcpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBjbGFzc2VzO1xuICAgIH1cbn07XG5cbmV4cG9ydCBjb25zdCBnZXRDb25kaXRpb25hbENsYXNzZXMgPSAobnYsIG92PykgPT4ge1xuICAgIGxldCB0b0FkZDtcbiAgICBsZXQgdG9SZW1vdmU7XG4gICAgLy8gaWYgdGhlIGNvbmRpdGlvbmFsIGNsYXNzIHByb3BlcnR5IGhhcyBhbHJlYWR5IHRvQWRkIGFuZCB0b1JlbW92ZSBhcnJheXMgdGhlbiB0YWtlIHRoYXQgb3RoZXJ3aXNlIGJ1aWxkIHRob3NlIGFycmF5c1xuICAgIGNvbnN0IGNsYXNzVG9BZGQgPSBudi50b0FkZCB8fCBudjtcbiAgICBjb25zdCBjbGFzc1RvUmVtb3ZlID0gbnYudG9SZW1vdmUgfHwgb3Y7XG4gICAgaWYgKF8uaXNPYmplY3QobnYpKSB7XG4gICAgICAgIHRvQWRkID0gXy5pc0FycmF5KGNsYXNzVG9BZGQpID8gY2xhc3NUb0FkZCA6IGdldENsYXNzZXNBcnJheShjbGFzc1RvQWRkIHx8IFtdKTtcbiAgICAgICAgdG9SZW1vdmUgPSBjbGFzc1RvUmVtb3ZlID8gKF8uaXNBcnJheShjbGFzc1RvUmVtb3ZlKSA/IGNsYXNzVG9SZW1vdmUgOiBnZXRDbGFzc2VzQXJyYXkoY2xhc3NUb1JlbW92ZSkpIDogW107XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdG9BZGQgPSBjbGFzc1RvQWRkID8gW2NsYXNzVG9BZGRdIDogW107XG4gICAgICAgIHRvUmVtb3ZlID0gY2xhc3NUb1JlbW92ZSA/IFtjbGFzc1RvUmVtb3ZlXSA6IFtdO1xuICAgIH1cbiAgICByZXR1cm4ge3RvQWRkLCB0b1JlbW92ZX07XG59O1xuXG4vKmhlbHBlciBmdW5jdGlvbiBmb3IgcHJlcGFyZUZpZWxkRGVmcyovXG5jb25zdCBwdXNoRmllbGREZWYgPSAoZGF0YU9iamVjdCwgY29sdW1uRGVmT2JqLCBuYW1lUHJlZml4LCBvcHRpb25zKSA9PiB7XG4gICAgLypsb29wIG92ZXIgdGhlIGZpZWxkcyBpbiB0aGUgZGF0YU9iamVjdCB0byBwcm9jZXNzIHRoZW0qL1xuICAgIGxldCBtb2RpZmllZFRpdGxlLFxuICAgICAgICByZWxhdGVkVGFibGUsXG4gICAgICAgIHJlbGF0ZWRGaWVsZCxcbiAgICAgICAgcmVsYXRlZEluZm8sXG4gICAgICAgIGZpZWxkTmFtZSxcbiAgICAgICAgaXNSZWxhdGVkO1xuICAgIGlmICghb3B0aW9ucykge1xuICAgICAgICBvcHRpb25zID0ge307XG4gICAgfVxuICAgIF8uZm9yRWFjaChkYXRhT2JqZWN0LCAodmFsdWUsIHRpdGxlKSA9PiB7XG4gICAgICAgIGlmIChfLmluY2x1ZGVzKHRpdGxlLCAnLicpKSB7XG4gICAgICAgICAgICByZWxhdGVkSW5mbyAgPSBfLnNwbGl0KHRpdGxlLCAnLicpO1xuICAgICAgICAgICAgcmVsYXRlZFRhYmxlID0gcmVsYXRlZEluZm9bMF07XG4gICAgICAgICAgICByZWxhdGVkRmllbGQgPSByZWxhdGVkSW5mb1sxXTtcbiAgICAgICAgICAgIGlzUmVsYXRlZCAgICA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG9wdGlvbnMubm9Nb2RpZnlUaXRsZSkge1xuICAgICAgICAgICAgbW9kaWZpZWRUaXRsZSA9IHRpdGxlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKF8uaXNTdHJpbmcodGl0bGUpKSB7XG4gICAgICAgICAgICAgICAgbW9kaWZpZWRUaXRsZSA9IHByZXR0aWZ5TGFiZWwodGl0bGUpO1xuICAgICAgICAgICAgICAgIG1vZGlmaWVkVGl0bGUgPSBkZUh5cGhlbmF0ZShtb2RpZmllZFRpdGxlKTtcbiAgICAgICAgICAgICAgICBtb2RpZmllZFRpdGxlID0gbmFtZVByZWZpeCA/IGluaXRDYXBzKG5hbWVQcmVmaXgpICsgJyAnICsgbW9kaWZpZWRUaXRsZSA6IG1vZGlmaWVkVGl0bGU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG1vZGlmaWVkVGl0bGUgPSB0aXRsZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aXRsZSA9IG5hbWVQcmVmaXggPyBuYW1lUHJlZml4ICsgJy4nICsgdGl0bGUgOiB0aXRsZTtcbiAgICAgICAgaWYgKGlzUmVsYXRlZCkge1xuICAgICAgICAgICAgLy8gRm9yIHJlbGF0ZWQgY29sdW1ucywgc2hvcnRlbiB0aGUgdGl0bGUgdG8gbGFzdCB0d28gd29yZHNcbiAgICAgICAgICAgIGZpZWxkTmFtZSA9IF8uc3BsaXQobW9kaWZpZWRUaXRsZSwgJyAnKTtcbiAgICAgICAgICAgIGZpZWxkTmFtZSA9IGZpZWxkTmFtZS5sZW5ndGggPiAxID8gZmllbGROYW1lW2ZpZWxkTmFtZS5sZW5ndGggLSAyXSArICcgJyArIGZpZWxkTmFtZVtmaWVsZE5hbWUubGVuZ3RoIC0gMV0gOiBmaWVsZE5hbWVbMF07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmaWVsZE5hbWUgPSBtb2RpZmllZFRpdGxlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGRlZk9iaiA9IG9wdGlvbnMuc2V0QmluZGluZ0ZpZWxkID8geydkaXNwbGF5TmFtZSc6IGZpZWxkTmFtZSwgJ2ZpZWxkJzogdGl0bGUsICdyZWxhdGVkVGFibGUnOiByZWxhdGVkVGFibGUsICdyZWxhdGVkRmllbGQnOiByZWxhdGVkRmllbGQgfHwgbW9kaWZpZWRUaXRsZX1cbiAgICAgICAgOiB7J2Rpc3BsYXlOYW1lJzogZmllbGROYW1lLCAncmVsYXRlZFRhYmxlJzogcmVsYXRlZFRhYmxlLCAncmVsYXRlZEZpZWxkJzogcmVsYXRlZEZpZWxkIHx8IG1vZGlmaWVkVGl0bGV9O1xuICAgICAgICAvKmlmIGZpZWxkIGlzIGEgbGVhZiBub2RlLCBwdXNoIGl0IGluIHRoZSBjb2x1bW5EZWZzKi9cbiAgICAgICAgaWYgKCFfLmlzT2JqZWN0KHZhbHVlKSB8fCAoXy5pc0FycmF5KHZhbHVlKSAmJiAhdmFsdWVbMF0pKSB7XG4gICAgICAgICAgICAvKmlmIHRoZSBjb2x1bW4gY291bnRlciBoYXMgcmVhY2hlZCB1cHBlckJvdW5kIHJldHVybiovXG4gICAgICAgICAgICBpZiAob3B0aW9ucy51cHBlckJvdW5kICYmIG9wdGlvbnMuY29sdW1uQ291bnQgPT09IG9wdGlvbnMudXBwZXJCb3VuZCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbHVtbkRlZk9iai50ZXJtaW5hbHMucHVzaChkZWZPYmopO1xuICAgICAgICAgICAgLyppbmNyZW1lbnQgdGhlIGNvbHVtbiBjb3VudGVyKi9cbiAgICAgICAgICAgIG9wdGlvbnMuY29sdW1uQ291bnQgKz0gMTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8qZWxzZSBmaWVsZCBpcyBhbiBvYmplY3QsIHByb2Nlc3MgaXQgcmVjdXJzaXZlbHkqL1xuICAgICAgICAgICAgLyogaWYgcGFyZW50IG5vZGUgdG8gYmUgaW5jbHVkZWQsIGluY2x1ZGUgaXQgKi9cbiAgICAgICAgICAgIGlmIChvcHRpb25zLmNvbHVtbkNvdW50ICE9PSBvcHRpb25zLnVwcGVyQm91bmQpIHtcbiAgICAgICAgICAgICAgICBjb2x1bW5EZWZPYmoub2JqZWN0cy5wdXNoKGRlZk9iaik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8qIGlmIGZpZWxkIGlzIGFuIGFycmF5IG5vZGUsIHByb2Nlc3MgaXRzIGZpcnN0IGNoaWxkICovXG4gICAgICAgICAgICBpZiAoXy5pc0FycmF5KHZhbHVlKSAmJiB2YWx1ZVswXSkge1xuICAgICAgICAgICAgICAgIHB1c2hGaWVsZERlZih2YWx1ZVswXSwgY29sdW1uRGVmT2JqLCB0aXRsZSArICdbMF0nLCBvcHRpb25zKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcHVzaEZpZWxkRGVmKHZhbHVlLCBjb2x1bW5EZWZPYmosIHRpdGxlLCBvcHRpb25zKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xufTtcblxuY29uc3QgZ2V0TWV0YURhdGFGcm9tRGF0YSA9IChkYXRhKSA9PiB7XG4gICAgbGV0IGRhdGFPYmplY3Q7XG4gICAgaWYgKF8uaXNBcnJheShkYXRhKSkge1xuICAgICAgICBpZiAoXy5pc09iamVjdChkYXRhWzBdKSkge1xuICAgICAgICAgICAgZGF0YU9iamVjdCA9IGdldENsb25lZE9iamVjdChkYXRhWzBdKTtcbiAgICAgICAgICAgIC8qTG9vcCBvdmVyIHRoZSBvYmplY3QgdG8gZmluZCBvdXQgYW55IG51bGwgdmFsdWVzLiBJZiBhbnkgbnVsbCB2YWx1ZXMgYXJlIHByZXNlbnQgaW4gdGhlIGZpcnN0IHJvdywgY2hlY2sgYW5kIGFzc2lnbiB0aGUgdmFsdWVzIGZyb20gb3RoZXIgcm93LlxuICAgICAgICAgICAgICogQXMgY29sdW1uIGdlbmVyYXRpb24gaXMgZGVwZW5kZW50IG9uIGRhdGEsIGZvciByZWxhdGVkIGZpZWxkcyBpZiBmaXJzdCByb3cgdmFsdWUgaXMgbnVsbCwgY29sdW1ucyBhcmUgbm90IGdlbmVyYXRlZC5cbiAgICAgICAgICAgICAqIFRvIHByZXZlbnQgdGhpcywgY2hlY2sgdGhlIGRhdGEgaW4gb3RoZXIgcm93cyBhbmQgZ2VuZXJhdGUgdGhlIGNvbHVtbnMuIE5ldyBrZXlzIGZyb20gb3RoZXJzIHJvd3MgYXJlIGFsc28gYWRkZWQqL1xuICAgICAgICAgICAgXy5mb3JFYWNoKGRhdGEsIChyb3csIGluZGV4KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKChpbmRleCArIDEpID49IDEwKSB7IC8vIExpbWl0IHRoZSBkYXRhIHNlYXJjaCB0byBmaXJzdCAxMCByZWNvcmRzXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXy5hc3NpZ25XaXRoKGRhdGFPYmplY3QsIHJvdywgKG9ialZhbHVlLCBzcmNWYWx1ZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKG9ialZhbHVlID09PSBudWxsIHx8IG9ialZhbHVlID09PSB1bmRlZmluZWQpID8gc3JjVmFsdWUgOiBvYmpWYWx1ZTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGF0YU9iamVjdCA9IGRhdGFbMF07XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBkYXRhT2JqZWN0ID0gZGF0YTtcbiAgICB9XG4gICAgcmV0dXJuIGRhdGFPYmplY3Q7XG59O1xuXG5leHBvcnQgY29uc3QgcHJlcGFyZUZpZWxkRGVmcyA9IChkYXRhLCBvcHRpb25zPykgPT4ge1xuICAgIGxldCBkYXRhT2JqZWN0O1xuICAgIGNvbnN0IGNvbHVtbkRlZiA9IHtcbiAgICAgICAgICAgICdvYmplY3RzJyA6IFtdLFxuICAgICAgICAgICAgJ3Rlcm1pbmFscycgOiBbXVxuICAgICAgICB9O1xuICAgIC8qaWYgbm8gZGF0YSBwcm92aWRlZCwgaW5pdGlhbGl6ZSBkZWZhdWx0IGNvbHVtbiBkZWZpbml0aW9ucyovXG4gICAgaWYgKCFkYXRhKSB7XG4gICAgICAgIGRhdGEgPSBbXTtcbiAgICB9XG4gICAgaWYgKCFvcHRpb25zKSB7XG4gICAgICAgIG9wdGlvbnMgPSB7fTtcbiAgICB9XG4gICAgb3B0aW9ucy5zZXRCaW5kaW5nRmllbGQgPSB0cnVlO1xuICAgIG9wdGlvbnMuY29sdW1uQ291bnQgPSAwO1xuICAgIGRhdGFPYmplY3QgPSBnZXRNZXRhRGF0YUZyb21EYXRhKGRhdGEpO1xuICAgIC8qZmlyc3Qgb2YgdGhlIG1hbnkgZGF0YSBvYmplY3RzIGZyb20gZ3JpZCBkYXRhKi9cbiAgICBwdXNoRmllbGREZWYoZGF0YU9iamVjdCwgY29sdW1uRGVmLCAnJywgb3B0aW9ucyk7XG4gICAgaWYgKCFvcHRpb25zIHx8IChvcHRpb25zICYmICFvcHRpb25zLmZpbHRlcikpIHtcbiAgICAgICAgcmV0dXJuIGNvbHVtbkRlZi50ZXJtaW5hbHM7XG4gICAgfVxuICAgIHN3aXRjaCAob3B0aW9ucy5maWx0ZXIpIHtcbiAgICAgICAgY2FzZSAnYWxsJzpcbiAgICAgICAgICAgIHJldHVybiBjb2x1bW5EZWY7XG4gICAgICAgIGNhc2UgJ29iamVjdHMnOlxuICAgICAgICAgICAgcmV0dXJuIGNvbHVtbkRlZi5vYmplY3RzO1xuICAgICAgICBjYXNlICd0ZXJtaW5hbHMnOlxuICAgICAgICAgICAgcmV0dXJuIGNvbHVtbkRlZi50ZXJtaW5hbHM7XG4gICAgfVxuICAgIHJldHVybiBjb2x1bW5EZWY7XG59O1xuIl19