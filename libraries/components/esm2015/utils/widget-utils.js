import { NG_VALUE_ACCESSOR, NG_VALIDATORS } from '@angular/forms';
import { forwardRef } from '@angular/core';
import { encodeUrl, isValidWebURL, stringStartsWith, FormWidgetType, $parseExpr, getClonedObject, prettifyLabel, initCaps, deHyphenate } from '@wm/core';
import { DialogRef, WidgetRef } from '../widgets/framework/types';
const DATASET_WIDGETS = new Set([FormWidgetType.SELECT, FormWidgetType.CHECKBOXSET, FormWidgetType.RADIOSET,
    FormWidgetType.SWITCH, FormWidgetType.AUTOCOMPLETE, FormWidgetType.CHIPS, FormWidgetType.TYPEAHEAD, FormWidgetType.RATING]);
/**
 * Returns the parsed, updated bound expression
 * if the expression is $[data[$i][firstName]] + '--' + $[lastName] + '--' + $['@ID@']
 * returns __1.firstName + '--' + lastName + '--' + __1['@ID@']
 */
const getUpdatedExpr = (expr) => {
    let updated = '', ch, next, i, j, matchCh, matchCount, isQuotedStr, subStr, isQuotedStrEvaluated;
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
const ɵ0 = getUpdatedExpr;
/**
 * Returns the value for the provided key in the object
 */
export const getObjValueByKey = (obj, strKey) => {
    /* check for the key-string */
    if (strKey) {
        let val;
        /* convert indexes to properties, so as to work for even 'key1[0].child1'*/
        strKey.replace(/\[(\w+)\]/g, '.$1').split('.').forEach(key => {
            // If obj is null, then assign val to null.
            val = (val && val[key]) || (_.isNull(obj) ? obj : obj[key]);
        });
        return val;
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
export const getEvaluatedData = (dataObj, options, context) => {
    let expressionValue;
    const field = options.field, expr = options.expression, bindExpr = options.bindExpression;
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
export const isActiveNavItem = (link, routeName) => {
    if (!link || !routeName) {
        return false;
    }
    routeName = routeName.indexOf('?') === -1 ? routeName : routeName.substring(0, routeName.indexOf('?'));
    link = link.indexOf('?') === -1 ? link : link.substring(0, link.indexOf('?'));
    const routeRegex = new RegExp('^(#\/|#)' + routeName + '$');
    return routeRegex.test(link);
};
/**
 * Returns the orderBy Expression based on the 'sort 'option in pageable object
 * returned by backend
 * @param pageableObj
 * @returns {string}
 */
export const getOrderByExpr = pageableObj => {
    pageableObj = pageableObj || [];
    const expressions = [], KEY_VAL_SEPARATOR = ' ', FIELD_SEPARATOR = ',';
    _.forEach(pageableObj, obj => {
        expressions.push(obj.property + KEY_VAL_SEPARATOR + obj.direction.toLowerCase());
    });
    return _.join(expressions, FIELD_SEPARATOR);
};
export const isDataSetWidget = widget => {
    return DATASET_WIDGETS.has(widget);
};
/*This function returns the url to the image after checking the validity of url*/
export const getImageUrl = (urlString, shouldEncode, defaultUrl) => {
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
export const getBackGroundImageUrl = (urlString) => {
    if (urlString === '' || urlString === 'none') {
        return urlString;
    }
    return 'url(' + getImageUrl(urlString) + ')';
};
export function provideAs(reference, key, multi) {
    return {
        provide: key,
        useExisting: forwardRef(() => reference),
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
export const NAVIGATION_TYPE = {
    ADVANCED: 'Advanced',
    BASIC: 'Basic',
    CLASSIC: 'Classic',
    INLINE: 'Inline',
    NONE: 'None',
    ONDEMAND: 'On-Demand',
    PAGER: 'Pager',
    SCROLL: 'Scroll'
};
export const getWatchIdentifier = (...args) => args.join('_');
const typesMap = {
    number: ['number', 'integer', 'big_integer', 'short', 'float', 'big_decimal', 'double', 'long', 'byte'],
    string: ['string', 'text'],
    character: ['character'],
    date: ['date', 'time', 'timestamp', 'datetime']
};
const modes = {
    number: ['exact', 'notequals', 'lessthan', 'lessthanequal', 'greaterthan', 'greaterthanequal', 'null', 'isnotnull'],
    string: ['anywhereignorecase', 'anywhere', 'startignorecase', 'start', 'endignorecase', 'end', 'exactignorecase', 'exact', 'notequalsignorecase', 'notequals', 'null', 'isnotnull', 'empty', 'isnotempty', 'nullorempty'],
    character: ['exactignorecase', 'exact', 'notequalsignorecase', 'notequals', 'null', 'isnotnull', 'empty', 'isnotempty', 'nullorempty'],
    date: ['exact', 'lessthan', 'lessthanequal', 'greaterthan', 'greaterthanequal', 'null', 'notequals', 'isnotnull']
};
const matchModeTypesMap = {
    boolean: ['exact', 'null', 'isnotnull'],
    clob: [],
    blob: []
};
export const getMatchModeTypesMap = (multiMode) => {
    if (multiMode) {
        modes.number.push('in', 'notin', 'between');
        modes.date.push('between');
        modes.string.push('in', 'notin');
        modes.character.push('in', 'notin');
    }
    _.forEach(typesMap, (types, primType) => {
        _.forEach(types, type => {
            matchModeTypesMap[type] = modes[primType];
        });
    });
    // this is used in filter criteria when the user types the column name manually and where we dont know the type of the column
    matchModeTypesMap['default'] = _.union(modes['number'], modes['string'], modes['character'], modes['date'], modes['date']);
    return matchModeTypesMap;
};
export const getMatchModeMsgs = (appLocale) => {
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
const getClassesArray = classVal => {
    let classes = [];
    if (_.isArray(classVal)) {
        classVal.forEach(v => {
            classes = classes.concat(getClassesArray(v));
        });
        return classes;
    }
    if (_.isObject(classVal)) {
        _.forEach(classVal, (val, key) => {
            if (val) {
                classes = classes.concat(key.split(' '));
            }
        });
        return classes;
    }
};
const ɵ1 = getClassesArray;
export const getConditionalClasses = (nv, ov) => {
    let toAdd;
    let toRemove;
    // if the conditional class property has already toAdd and toRemove arrays then take that otherwise build those arrays
    const classToAdd = nv.toAdd || nv;
    const classToRemove = nv.toRemove || ov;
    if (_.isObject(nv)) {
        toAdd = _.isArray(classToAdd) ? classToAdd : getClassesArray(classToAdd || []);
        toRemove = classToRemove ? (_.isArray(classToRemove) ? classToRemove : getClassesArray(classToRemove)) : [];
    }
    else {
        toAdd = classToAdd ? [classToAdd] : [];
        toRemove = classToRemove ? [classToRemove] : [];
    }
    return { toAdd, toRemove };
};
/*helper function for prepareFieldDefs*/
const pushFieldDef = (dataObject, columnDefObj, namePrefix, options) => {
    /*loop over the fields in the dataObject to process them*/
    let modifiedTitle, relatedTable, relatedField, relatedInfo, fieldName, isRelated;
    if (!options) {
        options = {};
    }
    _.forEach(dataObject, (value, title) => {
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
        const defObj = options.setBindingField ? { 'displayName': fieldName, 'field': title, 'relatedTable': relatedTable, 'relatedField': relatedField || modifiedTitle }
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
const ɵ2 = pushFieldDef;
const getMetaDataFromData = (data) => {
    let dataObject;
    if (_.isArray(data)) {
        if (_.isObject(data[0])) {
            dataObject = getClonedObject(data[0]);
            /*Loop over the object to find out any null values. If any null values are present in the first row, check and assign the values from other row.
             * As column generation is dependent on data, for related fields if first row value is null, columns are not generated.
             * To prevent this, check the data in other rows and generate the columns. New keys from others rows are also added*/
            _.forEach(data, (row, index) => {
                if ((index + 1) >= 10) { // Limit the data search to first 10 records
                    return false;
                }
                _.assignWith(dataObject, row, (objValue, srcValue) => {
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
const ɵ3 = getMetaDataFromData;
export const prepareFieldDefs = (data, options) => {
    let dataObject;
    const columnDef = {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2lkZ2V0LXV0aWxzLmpzIiwic291cmNlUm9vdCI6Im5nOi8vQHdtL2NvbXBvbmVudHMvIiwic291cmNlcyI6WyJ1dGlscy93aWRnZXQtdXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGlCQUFpQixFQUFFLGFBQWEsRUFBRSxNQUFNLGdCQUFnQixDQUFDO0FBQ2xFLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFM0MsT0FBTyxFQUFFLFNBQVMsRUFBRSxhQUFhLEVBQUUsZ0JBQWdCLEVBQUUsY0FBYyxFQUFFLFVBQVUsRUFBRSxlQUFlLEVBQUUsYUFBYSxFQUFFLFFBQVEsRUFBRSxXQUFXLEVBQUUsTUFBTSxVQUFVLENBQUM7QUFDekosT0FBTyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsTUFBTSw0QkFBNEIsQ0FBQztBQUlsRSxNQUFNLGVBQWUsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsY0FBYyxDQUFDLFdBQVcsRUFBRSxjQUFjLENBQUMsUUFBUTtJQUN2RyxjQUFjLENBQUMsTUFBTSxFQUFFLGNBQWMsQ0FBQyxZQUFZLEVBQUUsY0FBYyxDQUFDLEtBQUssRUFBRSxjQUFjLENBQUMsU0FBUyxFQUFFLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0FBQ2hJOzs7O0dBSUc7QUFDSCxNQUFNLGNBQWMsR0FBRyxDQUFDLElBQVksRUFBRSxFQUFFO0lBQ3BDLElBQUksT0FBTyxHQUFHLEVBQUUsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxXQUFXLEVBQUUsTUFBTSxFQUFFLG9CQUFvQixDQUFDO0lBRWpHLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLGtCQUFrQixFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBRWpELEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFB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UyB9IGZyb20gJ0Bhbmd1bGFyL2Zvcm1zJztcbmltcG9ydCB7IGZvcndhcmRSZWYgfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHsgZW5jb2RlVXJsLCBpc1ZhbGlkV2ViVVJMLCBzdHJpbmdTdGFydHNXaXRoLCBGb3JtV2lkZ2V0VHlwZSwgJHBhcnNlRXhwciwgZ2V0Q2xvbmVkT2JqZWN0LCBwcmV0dGlmeUxhYmVsLCBpbml0Q2FwcywgZGVIeXBoZW5hdGUgfSBmcm9tICdAd20vY29yZSc7XG5pbXBvcnQgeyBEaWFsb2dSZWYsIFdpZGdldFJlZiB9IGZyb20gJy4uL3dpZGdldHMvZnJhbWV3b3JrL3R5cGVzJztcblxuZGVjbGFyZSBjb25zdCBfO1xuXG5jb25zdCBEQVRBU0VUX1dJREdFVFMgPSBuZXcgU2V0KFtGb3JtV2lkZ2V0VHlwZS5TRUxFQ1QsIEZvcm1XaWRnZXRUeXBlLkNIRUNLQk9YU0VULCBGb3JtV2lkZ2V0VHlwZS5SQURJT1NFVCxcbiAgICBGb3JtV2lkZ2V0VHlwZS5TV0lUQ0gsIEZvcm1XaWRnZXRUeXBlLkFVVE9DT01QTEVURSwgRm9ybVdpZGdldFR5cGUuQ0hJUFMsIEZvcm1XaWRnZXRUeXBlLlRZUEVBSEVBRCwgRm9ybVdpZGdldFR5cGUuUkFUSU5HXSk7XG4vKipcbiAqIFJldHVybnMgdGhlIHBhcnNlZCwgdXBkYXRlZCBib3VuZCBleHByZXNzaW9uXG4gKiBpZiB0aGUgZXhwcmVzc2lvbiBpcyAkW2RhdGFbJGldW2ZpcnN0TmFtZV1dICsgJy0tJyArICRbbGFzdE5hbWVdICsgJy0tJyArICRbJ0BJREAnXVxuICogcmV0dXJucyBfXzEuZmlyc3ROYW1lICsgJy0tJyArIGxhc3ROYW1lICsgJy0tJyArIF9fMVsnQElEQCddXG4gKi9cbmNvbnN0IGdldFVwZGF0ZWRFeHByID0gKGV4cHI6IHN0cmluZykgPT4ge1xuICAgIGxldCB1cGRhdGVkID0gJycsIGNoLCBuZXh0LCBpLCBqLCBtYXRjaENoLCBtYXRjaENvdW50LCBpc1F1b3RlZFN0ciwgc3ViU3RyLCBpc1F1b3RlZFN0ckV2YWx1YXRlZDtcblxuICAgIGV4cHIgPSBleHByLnJlcGxhY2UoL1xcJFxcW2RhdGFcXFtcXCRpXFxdL2csICckW19fMScpO1xuXG4gICAgZm9yIChpID0gMDsgaSA8IGV4cHIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY2ggPSBleHByW2ldO1xuICAgICAgICBuZXh0ID0gZXhwcltpICsgMV07XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIGlmIHRoZSBleHByZXNzaW9uIHN0YXJ0cyB3aXRoICRbLCBjaGVjayB0aGUgbmV4dChjaCkgY2hhcmFjdGVyLFxuICAgICAgICAgKiAgICBpZiBjaCBpcyBhIHF1b3RlKCcsIFwiKSBjaGFuZ2UgdGhlIGV4cHIgdG8gX19bXG4gICAgICAgICAqICAgIGlmIGNoIGlzIGEgd2hpdGVTcGFjZSwgcmVtb3ZlIGl0XG4gICAgICAgICAqICAgIGVsc2UgcmVtb3ZlICRbXG4gICAgICAgICAqL1xuICAgICAgICBpZiAoY2ggPT09ICckJyAmJiBuZXh0ID09PSAnWycpIHtcbiAgICAgICAgICAgIG1hdGNoQ291bnQgPSAxO1xuICAgICAgICAgICAgaXNRdW90ZWRTdHJFdmFsdWF0ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIGlzUXVvdGVkU3RyID0gZmFsc2U7XG5cbiAgICAgICAgICAgIGZvciAoaiA9IGkgKyAyOyBqIDwgZXhwci5sZW5ndGg7IGorKykge1xuXG4gICAgICAgICAgICAgICAgbWF0Y2hDaCA9IGV4cHJbal07XG5cbiAgICAgICAgICAgICAgICBpZiAobWF0Y2hDaCA9PT0gJyAnKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICghaXNRdW90ZWRTdHJFdmFsdWF0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgaXNRdW90ZWRTdHIgPSBleHByW2pdID09PSAnXCInIHx8IGV4cHJbal0gPT09ICdcXCcnO1xuICAgICAgICAgICAgICAgICAgICBpc1F1b3RlZFN0ckV2YWx1YXRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKG1hdGNoQ2ggPT09ICdbJykge1xuICAgICAgICAgICAgICAgICAgICBtYXRjaENvdW50Kys7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChtYXRjaENoID09PSAnXScpIHtcbiAgICAgICAgICAgICAgICAgICAgbWF0Y2hDb3VudC0tO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICghbWF0Y2hDb3VudCkge1xuICAgICAgICAgICAgICAgICAgICBzdWJTdHIgPSBleHByLnN1YnN0cmluZyhpICsgMiwgaik7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpc1F1b3RlZFN0cikge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXBkYXRlZCArPSAnX18xWycgKyBzdWJTdHIgKyAnXSc7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVkICs9IHN1YlN0cjtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGkgPSBqO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdXBkYXRlZCArPSBjaDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB1cGRhdGVkO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIHRoZSB2YWx1ZSBmb3IgdGhlIHByb3ZpZGVkIGtleSBpbiB0aGUgb2JqZWN0XG4gKi9cbmV4cG9ydCBjb25zdCBnZXRPYmpWYWx1ZUJ5S2V5ID0gKG9iajogYW55LCBzdHJLZXk6IHN0cmluZykgPT4ge1xuICAgIC8qIGNoZWNrIGZvciB0aGUga2V5LXN0cmluZyAqL1xuICAgIGlmIChzdHJLZXkpIHtcbiAgICAgICAgbGV0IHZhbDtcbiAgICAgICAgLyogY29udmVydCBpbmRleGVzIHRvIHByb3BlcnRpZXMsIHNvIGFzIHRvIHdvcmsgZm9yIGV2ZW4gJ2tleTFbMF0uY2hpbGQxJyovXG4gICAgICAgIHN0cktleS5yZXBsYWNlKC9cXFsoXFx3KylcXF0vZywgJy4kMScpLnNwbGl0KCcuJykuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgICAgICAgLy8gSWYgb2JqIGlzIG51bGwsIHRoZW4gYXNzaWduIHZhbCB0byBudWxsLlxuICAgICAgICAgICAgdmFsID0gKHZhbCAmJiB2YWxba2V5XSkgfHwgKF8uaXNOdWxsKG9iaikgPyBvYmogOiBvYmpba2V5XSk7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gdmFsO1xuICAgIH1cbiAgICByZXR1cm4gb2JqO1xufTtcblxuLyoqXG4gKiByZXR1cm5zIHRoZSBkaXNwbGF5IGZpZWxkIGRhdGEgZm9yIGFueSBkYXRhc2V0IHdpZGdldHNcbiAqIEJhc2VkIG9uIHRoZSBiaW5kIGRpc3BsYXkgZXhwcmVzc2lvbiBvciBkaXNwbGF5IGV4cHJlc3Npb24gb3IgZGlzcGxheSBuYW1lLFxuICogZGF0YSBpcyBleHRyYWN0ZWQgYW5kIGZvcm1hdHRlZCBmcm9tIHRoZSBwYXNzZWQgb3B0aW9uIG9iamVjdFxuICogSWYgdGhlcmUgaXMgZmllbGQgaXMgc3BlY2lmaWVkLCBmaWVsZCB2YWx1ZSBpcyBvYnRhaW5lZCBmcm9tIHRoZSBkYXRhT2JqLlxuICogSWYgZXhwcmVzc2lvbiBpcyBnaXZlbiwgZXZhbHVhdGVzIHRoZSBleHByZXNzaW9uIHZhbHVlLlxuICogZWxzZSBjaGVjayBmb3IgYmluZEV4cHJlc3Npb24sIGV4dHJhY3QgdGhlIHZhbHVlIGZyb20gdGhlIGRhdGFPYmpcbiAqL1xuZXhwb3J0IGNvbnN0IGdldEV2YWx1YXRlZERhdGEgPSAoZGF0YU9iajogYW55LCBvcHRpb25zOiBhbnksIGNvbnRleHQ/OiBhbnkpID0+IHtcbiAgICBsZXQgZXhwcmVzc2lvblZhbHVlO1xuICAgIGNvbnN0IGZpZWxkID0gb3B0aW9ucy5maWVsZCxcbiAgICAgICAgZXhwciA9IG9wdGlvbnMuZXhwcmVzc2lvbixcbiAgICAgICAgYmluZEV4cHIgPSBvcHRpb25zLmJpbmRFeHByZXNzaW9uO1xuXG4gICAgLy8gaWYga2V5IGlzIGJvdW5kIGV4cHJlc3Npb25cbiAgICBpZiAoYmluZEV4cHIpIHtcbiAgICAgICAgLy8gcmVtb3ZlICdiaW5kOicgcHJlZml4IGZyb20gdGhlIGJvdW5kRXhwcmVzc2lvbk5hbWVcbiAgICAgICAgZXhwcmVzc2lvblZhbHVlID0gYmluZEV4cHIucmVwbGFjZSgnYmluZDonLCAnJyk7XG4gICAgICAgIC8vIHBhcnNlIHRoZSBleHByZXNzaW9uVmFsdWUgZm9yIHJlcGxhY2luZyBhbGwgdGhlIGV4cHJlc3Npb25zIHdpdGggdmFsdWVzIGluIHRoZSBvYmplY3RcbiAgICAgICAgZXhwcmVzc2lvblZhbHVlID0gZ2V0VXBkYXRlZEV4cHIoZXhwcmVzc2lvblZhbHVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBleHByZXNzaW9uVmFsdWUgPSBleHByID8gZXhwciA6IGZpZWxkO1xuICAgIH1cblxuICAgIC8vIEhhbmRsaW5nIGZpZWxkIG5hbWUgd2l0aCBzcGVjaWFsIGNoYXJlY3RlcnNcbiAgICAvLyBFeDogZmllbGQgPSBcImYgbmFtZVwiXG4gICAgaWYgKCFiaW5kRXhwciAmJiAhZXhwcikge1xuICAgICAgICByZXR1cm4gXy5nZXQoZGF0YU9iaiwgZmllbGQpO1xuICAgIH1cblxuICAgIHJldHVybiAkcGFyc2VFeHByKGV4cHJlc3Npb25WYWx1ZSkoY29udGV4dCwgT2JqZWN0LmFzc2lnbih7fSwgZGF0YU9iaiwge19fMTogZGF0YU9ian0pKTtcbn07XG5cbmV4cG9ydCBjb25zdCBpc0FjdGl2ZU5hdkl0ZW0gPSAobGluaywgcm91dGVOYW1lKSA9PiB7XG4gICAgaWYgKCFsaW5rIHx8ICFyb3V0ZU5hbWUpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByb3V0ZU5hbWUgPSByb3V0ZU5hbWUuaW5kZXhPZignPycpID09PSAtMSA/IHJvdXRlTmFtZSA6IHJvdXRlTmFtZS5zdWJzdHJpbmcoMCwgcm91dGVOYW1lLmluZGV4T2YoJz8nKSk7XG4gICAgbGluayA9IGxpbmsuaW5kZXhPZignPycpID09PSAtMSA/IGxpbmsgOiBsaW5rLnN1YnN0cmluZygwLCBsaW5rLmluZGV4T2YoJz8nKSk7XG4gICAgY29uc3Qgcm91dGVSZWdleCA9IG5ldyBSZWdFeHAoJ14oI1xcL3wjKScgKyByb3V0ZU5hbWUgKyAnJCcpO1xuICAgIHJldHVybiByb3V0ZVJlZ2V4LnRlc3QobGluayk7XG59O1xuXG5cbi8qKlxuICogUmV0dXJucyB0aGUgb3JkZXJCeSBFeHByZXNzaW9uIGJhc2VkIG9uIHRoZSAnc29ydCAnb3B0aW9uIGluIHBhZ2VhYmxlIG9iamVjdFxuICogcmV0dXJuZWQgYnkgYmFja2VuZFxuICogQHBhcmFtIHBhZ2VhYmxlT2JqXG4gKiBAcmV0dXJucyB7c3RyaW5nfVxuICovXG5leHBvcnQgY29uc3QgZ2V0T3JkZXJCeUV4cHIgPSBwYWdlYWJsZU9iaiA9PiB7XG4gICAgcGFnZWFibGVPYmogPSBwYWdlYWJsZU9iaiB8fCBbXTtcbiAgICBjb25zdCBleHByZXNzaW9ucyAgICAgICA9IFtdLFxuICAgICAgICBLRVlfVkFMX1NFUEFSQVRPUiA9ICcgJyxcbiAgICAgICAgRklFTERfU0VQQVJBVE9SICAgPSAnLCc7XG4gICAgXy5mb3JFYWNoKHBhZ2VhYmxlT2JqLCBvYmogPT4ge1xuICAgICAgICBleHByZXNzaW9ucy5wdXNoKG9iai5wcm9wZXJ0eSArIEtFWV9WQUxfU0VQQVJBVE9SICsgb2JqLmRpcmVjdGlvbi50b0xvd2VyQ2FzZSgpKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBfLmpvaW4oZXhwcmVzc2lvbnMsIEZJRUxEX1NFUEFSQVRPUik7XG59O1xuXG5leHBvcnQgY29uc3QgaXNEYXRhU2V0V2lkZ2V0ID0gd2lkZ2V0ID0+IHtcbiAgICByZXR1cm4gREFUQVNFVF9XSURHRVRTLmhhcyh3aWRnZXQpO1xufTtcblxuLypUaGlzIGZ1bmN0aW9uIHJldHVybnMgdGhlIHVybCB0byB0aGUgaW1hZ2UgYWZ0ZXIgY2hlY2tpbmcgdGhlIHZhbGlkaXR5IG9mIHVybCovXG5leHBvcnQgY29uc3QgZ2V0SW1hZ2VVcmwgPSAodXJsU3RyaW5nLCBzaG91bGRFbmNvZGU/LCBkZWZhdWx0VXJsPykgPT4ge1xuICAgIC8qSW4gc3R1ZGlvIG1vZGUgYmVmb3JlIHNldHRpbmcgcGljdHVyZXNvdXJjZSwgY2hlY2sgaWYgdGhlIHN0dWRpb0NvbnRyb2xsZXIgaXMgbG9hZGVkIGFuZCBuZXcgcGljdHVyZXNvdXJjZSBpcyBpbiAnc3R5bGVzL2ltYWdlcy8nIHBhdGggb3Igbm90LlxuICAgICAqIFdoZW4gcGFnZSBpcyByZWZyZXNoZWQsIGxvYWRlci5naWYgd2lsbCBiZSBsb2FkZWQgZmlyc3QgYW5kIGl0IHdpbGwgYmUgaW4gJ3N0eWxlL2ltYWdlcy8nLlxuICAgICAqIFByZXBlbmQgJ3NlcnZpY2VzL3Byb2plY3RzLycgKyAkcm9vdFNjb3BlLnByb2plY3QuaWQgKyAnL3dlYi9yZXNvdXJjZXMvaW1hZ2VzL2ltYWdlbGlzdHMvJyAgaWYgdGhlIGltYWdlIHVybCBpcyBqdXN0IGltYWdlIG5hbWUgaW4gdGhlIHByb2plY3Qgcm9vdCxcbiAgICAgKiBhbmQgaWYgdGhlIHVybCBwb2ludGluZyB0byByZXNvdXJjZXMvaW1hZ2VzLyB0aGVuICdzZXJ2aWNlcy9wcm9qZWN0cy8nICsgJHJvb3RTY29wZS5wcm9qZWN0LmlkICsgJy93ZWIvJyovXG4gICAgaWYgKGlzVmFsaWRXZWJVUkwodXJsU3RyaW5nKSkge1xuICAgICAgICByZXR1cm4gdXJsU3RyaW5nO1xuICAgIH1cblxuICAgIC8vIElmIG5vIHZhbHVlIGlzIHByb3ZpZGVkIGZvciBwaWN0dXJlc291cmNlIGFzc2lnbiBwaWN0dXJlcGxhY2Vob2xkZXIgb3IgZGVmYXVsdC1pbWFnZVxuICAgIGlmICghdXJsU3RyaW5nKSB7XG4gICAgICAgIHVybFN0cmluZyA9IGRlZmF1bHRVcmwgfHwgJ3Jlc291cmNlcy9pbWFnZXMvaW1hZ2VsaXN0cy9kZWZhdWx0LWltYWdlLnBuZyc7XG4gICAgfVxuXG4gICAgdXJsU3RyaW5nID0gc2hvdWxkRW5jb2RlID8gZW5jb2RlVXJsKHVybFN0cmluZykgOiB1cmxTdHJpbmc7XG5cbiAgICAvLyBpZiB0aGUgcmVzb3VyY2UgdG8gYmUgbG9hZGVkIGlzIGluc2lkZSBhIHByZWZhYlxuICAgIGlmIChzdHJpbmdTdGFydHNXaXRoKHVybFN0cmluZywgJ3NlcnZpY2VzL3ByZWZhYnMnKSkge1xuICAgICAgICByZXR1cm4gdXJsU3RyaW5nO1xuICAgIH1cblxuICAgIHJldHVybiB1cmxTdHJpbmc7XG59O1xuXG4vKlRoaXMgbWV0aG9kIHJldHVybnMgdGhlIHVybCB0byB0aGUgYmFja2dyb3VuZEltYWdlKi9cbmV4cG9ydCBjb25zdCBnZXRCYWNrR3JvdW5kSW1hZ2VVcmwgPSAodXJsU3RyaW5nKSA9PiB7XG4gICAgaWYgKHVybFN0cmluZyA9PT0gJycgfHwgdXJsU3RyaW5nID09PSAnbm9uZScpIHtcbiAgICAgICAgcmV0dXJuIHVybFN0cmluZztcbiAgICB9XG4gICAgcmV0dXJuICd1cmwoJyArIGdldEltYWdlVXJsKHVybFN0cmluZykgKyAnKSc7XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gcHJvdmlkZUFzKHJlZmVyZW5jZTogYW55LCBrZXk6IGFueSwgbXVsdGk/OiBib29sZWFuKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgcHJvdmlkZToga2V5LFxuICAgICAgICB1c2VFeGlzdGluZzogZm9yd2FyZFJlZigoKSA9PiByZWZlcmVuY2UpLFxuICAgICAgICBtdWx0aTogbXVsdGlcbiAgICB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJvdmlkZUFzTmdWYWxpZGF0b3JzKHJlZmVyZW5jZTogYW55KSB7XG4gICAgcmV0dXJuIHByb3ZpZGVBcyhyZWZlcmVuY2UsIE5HX1ZBTElEQVRPUlMsIHRydWUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJvdmlkZUFzTmdWYWx1ZUFjY2Vzc29yKHJlZmVyZW5jZTogYW55KSB7XG4gICAgcmV0dXJuIHByb3ZpZGVBcyhyZWZlcmVuY2UsIE5HX1ZBTFVFX0FDQ0VTU09SLCB0cnVlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByb3ZpZGVBc1dpZGdldFJlZihyZWZlcmVuY2U6IGFueSkge1xuICAgIHJldHVybiBwcm92aWRlQXMocmVmZXJlbmNlLCBXaWRnZXRSZWYpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcHJvdmlkZUFzRGlhbG9nUmVmKHJlZmVyZW5jZTogYW55KSB7XG4gICAgcmV0dXJuIHByb3ZpZGVBcyhyZWZlcmVuY2UsIERpYWxvZ1JlZik7XG59XG5cbmV4cG9ydCBjb25zdCBOQVZJR0FUSU9OX1RZUEUgPSB7XG4gICAgQURWQU5DRUQ6ICdBZHZhbmNlZCcsXG4gICAgQkFTSUM6ICdCYXNpYycsXG4gICAgQ0xBU1NJQzogJ0NsYXNzaWMnLFxuICAgIElOTElORTogJ0lubGluZScsXG4gICAgTk9ORTogJ05vbmUnLFxuICAgIE9OREVNQU5EOiAnT24tRGVtYW5kJyxcbiAgICBQQUdFUjogJ1BhZ2VyJyxcbiAgICBTQ1JPTEw6ICdTY3JvbGwnXG59O1xuXG5cbmV4cG9ydCBjb25zdCBnZXRXYXRjaElkZW50aWZpZXIgPSAoLi4uYXJncykgPT4gYXJncy5qb2luKCdfJyk7XG5cbmNvbnN0IHR5cGVzTWFwID0ge1xuICAgIG51bWJlcjogWydudW1iZXInLCAnaW50ZWdlcicsICdiaWdfaW50ZWdlcicsICdzaG9ydCcsICdmbG9hdCcsICdiaWdfZGVjaW1hbCcsICdkb3VibGUnLCAnbG9uZycsICdieXRlJ10sXG4gICAgc3RyaW5nOiBbJ3N0cmluZycsICd0ZXh0J10sXG4gICAgY2hhcmFjdGVyOiBbJ2NoYXJhY3RlciddLFxuICAgIGRhdGU6IFsnZGF0ZScsICd0aW1lJywgICd0aW1lc3RhbXAnLCAnZGF0ZXRpbWUnXVxufTtcbmNvbnN0IG1vZGVzID0ge1xuICAgIG51bWJlcjogWydleGFjdCcsICdub3RlcXVhbHMnLCAnbGVzc3RoYW4nLCAnbGVzc3RoYW5lcXVhbCcsICdncmVhdGVydGhhbicsICdncmVhdGVydGhhbmVxdWFsJywgJ251bGwnLCAnaXNub3RudWxsJ10sXG4gICAgc3RyaW5nOiBbJ2FueXdoZXJlaWdub3JlY2FzZScsICdhbnl3aGVyZScsICdzdGFydGlnbm9yZWNhc2UnLCAnc3RhcnQnLCAnZW5kaWdub3JlY2FzZScsICdlbmQnLCAnZXhhY3RpZ25vcmVjYXNlJywgJ2V4YWN0JywgJ25vdGVxdWFsc2lnbm9yZWNhc2UnLCAnbm90ZXF1YWxzJywgJ251bGwnLCAnaXNub3RudWxsJywgJ2VtcHR5JywgJ2lzbm90ZW1wdHknLCAnbnVsbG9yZW1wdHknXSxcbiAgICBjaGFyYWN0ZXI6IFsnZXhhY3RpZ25vcmVjYXNlJywgJ2V4YWN0JywgJ25vdGVxdWFsc2lnbm9yZWNhc2UnLCAnbm90ZXF1YWxzJywgJ251bGwnLCAnaXNub3RudWxsJywgJ2VtcHR5JywgJ2lzbm90ZW1wdHknLCAnbnVsbG9yZW1wdHknXSxcbiAgICBkYXRlOiBbJ2V4YWN0JywgJ2xlc3N0aGFuJywgJ2xlc3N0aGFuZXF1YWwnLCAnZ3JlYXRlcnRoYW4nLCAnZ3JlYXRlcnRoYW5lcXVhbCcsICdudWxsJywgJ25vdGVxdWFscycsICdpc25vdG51bGwnXVxufTtcbmNvbnN0IG1hdGNoTW9kZVR5cGVzTWFwID0ge1xuICAgIGJvb2xlYW46IFsnZXhhY3QnLCAnbnVsbCcsICdpc25vdG51bGwnXSxcbiAgICBjbG9iOiBbXSxcbiAgICBibG9iOiBbXVxufTtcbmV4cG9ydCBjb25zdCBnZXRNYXRjaE1vZGVUeXBlc01hcCA9IChtdWx0aU1vZGU/KSA9PiB7XG4gICAgaWYgKG11bHRpTW9kZSkge1xuICAgICAgICBtb2Rlcy5udW1iZXIucHVzaCgnaW4nLCAnbm90aW4nLCAnYmV0d2VlbicpO1xuICAgICAgICBtb2Rlcy5kYXRlLnB1c2goJ2JldHdlZW4nKTtcbiAgICAgICAgbW9kZXMuc3RyaW5nLnB1c2goJ2luJywgJ25vdGluJyk7XG4gICAgICAgIG1vZGVzLmNoYXJhY3Rlci5wdXNoKCdpbicsICdub3RpbicpO1xuICAgIH1cblxuICAgIF8uZm9yRWFjaCh0eXBlc01hcCwgKHR5cGVzLCBwcmltVHlwZSkgPT4ge1xuICAgICAgICBfLmZvckVhY2godHlwZXMsIHR5cGUgPT4ge1xuICAgICAgICAgICAgbWF0Y2hNb2RlVHlwZXNNYXBbdHlwZV0gPSBtb2Rlc1twcmltVHlwZV07XG4gICAgICAgIH0pO1xuICAgIH0pO1xuICAgIC8vIHRoaXMgaXMgdXNlZCBpbiBmaWx0ZXIgY3JpdGVyaWEgd2hlbiB0aGUgdXNlciB0eXBlcyB0aGUgY29sdW1uIG5hbWUgbWFudWFsbHkgYW5kIHdoZXJlIHdlIGRvbnQga25vdyB0aGUgdHlwZSBvZiB0aGUgY29sdW1uXG4gICAgbWF0Y2hNb2RlVHlwZXNNYXBbJ2RlZmF1bHQnXSA9IF8udW5pb24obW9kZXNbJ251bWJlciddLCBtb2Rlc1snc3RyaW5nJ10sIG1vZGVzWydjaGFyYWN0ZXInXSwgbW9kZXNbJ2RhdGUnXSwgbW9kZXNbJ2RhdGUnXSk7XG4gICAgcmV0dXJuIG1hdGNoTW9kZVR5cGVzTWFwO1xufTtcblxuZXhwb3J0IGNvbnN0IGdldE1hdGNoTW9kZU1zZ3MgPSAoYXBwTG9jYWxlKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgc3RhcnQgICAgICAgICAgICA6IGFwcExvY2FsZS5MQUJFTF9TVEFSVFNfV0lUSCxcbiAgICAgICAgc3RhcnRpZ25vcmVjYXNlICA6IGFwcExvY2FsZS5MQUJFTF9TVEFSVFNfV0lUSF9JR05PUkVDQVNFLFxuICAgICAgICBlbmQgICAgICAgICAgICAgIDogYXBwTG9jYWxlLkxBQkVMX0VORFNfV0lUSCxcbiAgICAgICAgZW5kaWdub3JlY2FzZSAgICA6IGFwcExvY2FsZS5MQUJFTF9FTkRTX1dJVEhfSUdOT1JFQ0FTRSxcbiAgICAgICAgYW55d2hlcmUgICAgICAgICA6IGFwcExvY2FsZS5MQUJFTF9DT05UQUlOUyxcbiAgICAgICAgYW55d2hlcmVpZ25vcmVjYXNlOiBhcHBMb2NhbGUuTEFCRUxfQ09OVEFJTlNfSUdOT1JFQ0FTRSxcbiAgICAgICAgZXhhY3QgICAgICAgICAgICA6IGFwcExvY2FsZS5MQUJFTF9JU19FUVVBTF9UTyxcbiAgICAgICAgZXhhY3RpZ25vcmVjYXNlICA6IGFwcExvY2FsZS5MQUJFTF9JU19FUVVBTF9UT19JR05PUkVDQVNFLFxuICAgICAgICBub3RlcXVhbHMgICAgICAgIDogYXBwTG9jYWxlLkxBQkVMX0lTX05PVF9FUVVBTF9UTyxcbiAgICAgICAgbm90ZXF1YWxzaWdub3JlY2FzZTogYXBwTG9jYWxlLkxBQkVMX0lTX05PVF9FUVVBTF9UT19JR05PUkVDQVNFLFxuICAgICAgICBsZXNzdGhhbiAgICAgICAgIDogYXBwTG9jYWxlLkxBQkVMX0xFU1NfVEhBTixcbiAgICAgICAgbGVzc3RoYW5lcXVhbCAgICA6IGFwcExvY2FsZS5MQUJFTF9MRVNTX1RIQU5fT1JfRVFVQUxTX1RPLFxuICAgICAgICBncmVhdGVydGhhbiAgICAgIDogYXBwTG9jYWxlLkxBQkVMX0dSRUFURVJfVEhBTixcbiAgICAgICAgZ3JlYXRlcnRoYW5lcXVhbCA6IGFwcExvY2FsZS5MQUJFTF9HUkVBVEVSX1RIQU5fT1JfRVFVQUxTX1RPLFxuICAgICAgICBudWxsICAgICAgICAgICAgIDogYXBwTG9jYWxlLkxBQkVMX0lTX05VTEwsXG4gICAgICAgIGlzbm90bnVsbCAgICAgICAgOiBhcHBMb2NhbGUuTEFCRUxfSVNfTk9UX05VTEwsXG4gICAgICAgIGVtcHR5ICAgICAgICAgICAgOiBhcHBMb2NhbGUuTEFCRUxfSVNfRU1QVFksXG4gICAgICAgIGlzbm90ZW1wdHkgICAgICAgOiBhcHBMb2NhbGUuTEFCRUxfSVNfTk9UX0VNUFRZLFxuICAgICAgICBudWxsb3JlbXB0eSAgICAgIDogYXBwTG9jYWxlLkxBQkVMX0lTX05VTExfT1JfRU1QVFksXG4gICAgICAgIGluICAgICAgICAgICAgICAgOiBhcHBMb2NhbGUuTEFCRUxfSU4sXG4gICAgICAgIG5vdGluICAgICAgICAgICAgOiBhcHBMb2NhbGUuTEFCRUxfTk9UX0lOLFxuICAgICAgICBiZXR3ZWVuICAgICAgICAgIDogYXBwTG9jYWxlLkxBQkVMX0JFVFdFRU5cbiAgICB9O1xufTtcblxuLy8gUmV0dXJucyBhcnJheSBvZiBjbGFzc2VzIHRoYXQgYXJlIGV2YWx1YXRlZCB0cnVlIGZvciBnaXZlbiBvYmplY3Qgb3IgYXJyYXlcbmNvbnN0IGdldENsYXNzZXNBcnJheSA9IGNsYXNzVmFsID0+IHtcbiAgICBsZXQgY2xhc3NlcyA9IFtdO1xuXG4gICAgaWYgKF8uaXNBcnJheShjbGFzc1ZhbCkpIHtcbiAgICAgICAgY2xhc3NWYWwuZm9yRWFjaCh2ID0+IHtcbiAgICAgICAgICAgIGNsYXNzZXMgPSBjbGFzc2VzLmNvbmNhdChnZXRDbGFzc2VzQXJyYXkodikpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGNsYXNzZXM7XG4gICAgfVxuICAgIGlmIChfLmlzT2JqZWN0KGNsYXNzVmFsKSkge1xuICAgICAgICBfLmZvckVhY2goY2xhc3NWYWwsICh2YWwsIGtleSkgPT4ge1xuICAgICAgICAgICAgaWYgKHZhbCkge1xuICAgICAgICAgICAgICAgIGNsYXNzZXMgPSBjbGFzc2VzLmNvbmNhdChrZXkuc3BsaXQoJyAnKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gY2xhc3NlcztcbiAgICB9XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0Q29uZGl0aW9uYWxDbGFzc2VzID0gKG52LCBvdj8pID0+IHtcbiAgICBsZXQgdG9BZGQ7XG4gICAgbGV0IHRvUmVtb3ZlO1xuICAgIC8vIGlmIHRoZSBjb25kaXRpb25hbCBjbGFzcyBwcm9wZXJ0eSBoYXMgYWxyZWFkeSB0b0FkZCBhbmQgdG9SZW1vdmUgYXJyYXlzIHRoZW4gdGFrZSB0aGF0IG90aGVyd2lzZSBidWlsZCB0aG9zZSBhcnJheXNcbiAgICBjb25zdCBjbGFzc1RvQWRkID0gbnYudG9BZGQgfHwgbnY7XG4gICAgY29uc3QgY2xhc3NUb1JlbW92ZSA9IG52LnRvUmVtb3ZlIHx8IG92O1xuICAgIGlmIChfLmlzT2JqZWN0KG52KSkge1xuICAgICAgICB0b0FkZCA9IF8uaXNBcnJheShjbGFzc1RvQWRkKSA/IGNsYXNzVG9BZGQgOiBnZXRDbGFzc2VzQXJyYXkoY2xhc3NUb0FkZCB8fCBbXSk7XG4gICAgICAgIHRvUmVtb3ZlID0gY2xhc3NUb1JlbW92ZSA/IChfLmlzQXJyYXkoY2xhc3NUb1JlbW92ZSkgPyBjbGFzc1RvUmVtb3ZlIDogZ2V0Q2xhc3Nlc0FycmF5KGNsYXNzVG9SZW1vdmUpKSA6IFtdO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRvQWRkID0gY2xhc3NUb0FkZCA/IFtjbGFzc1RvQWRkXSA6IFtdO1xuICAgICAgICB0b1JlbW92ZSA9IGNsYXNzVG9SZW1vdmUgPyBbY2xhc3NUb1JlbW92ZV0gOiBbXTtcbiAgICB9XG4gICAgcmV0dXJuIHt0b0FkZCwgdG9SZW1vdmV9O1xufTtcblxuLypoZWxwZXIgZnVuY3Rpb24gZm9yIHByZXBhcmVGaWVsZERlZnMqL1xuY29uc3QgcHVzaEZpZWxkRGVmID0gKGRhdGFPYmplY3QsIGNvbHVtbkRlZk9iaiwgbmFtZVByZWZpeCwgb3B0aW9ucykgPT4ge1xuICAgIC8qbG9vcCBvdmVyIHRoZSBmaWVsZHMgaW4gdGhlIGRhdGFPYmplY3QgdG8gcHJvY2VzcyB0aGVtKi9cbiAgICBsZXQgbW9kaWZpZWRUaXRsZSxcbiAgICAgICAgcmVsYXRlZFRhYmxlLFxuICAgICAgICByZWxhdGVkRmllbGQsXG4gICAgICAgIHJlbGF0ZWRJbmZvLFxuICAgICAgICBmaWVsZE5hbWUsXG4gICAgICAgIGlzUmVsYXRlZDtcbiAgICBpZiAoIW9wdGlvbnMpIHtcbiAgICAgICAgb3B0aW9ucyA9IHt9O1xuICAgIH1cbiAgICBfLmZvckVhY2goZGF0YU9iamVjdCwgKHZhbHVlLCB0aXRsZSkgPT4ge1xuICAgICAgICBpZiAoXy5pbmNsdWRlcyh0aXRsZSwgJy4nKSkge1xuICAgICAgICAgICAgcmVsYXRlZEluZm8gID0gXy5zcGxpdCh0aXRsZSwgJy4nKTtcbiAgICAgICAgICAgIHJlbGF0ZWRUYWJsZSA9IHJlbGF0ZWRJbmZvWzBdO1xuICAgICAgICAgICAgcmVsYXRlZEZpZWxkID0gcmVsYXRlZEluZm9bMV07XG4gICAgICAgICAgICBpc1JlbGF0ZWQgICAgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChvcHRpb25zLm5vTW9kaWZ5VGl0bGUpIHtcbiAgICAgICAgICAgIG1vZGlmaWVkVGl0bGUgPSB0aXRsZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChfLmlzU3RyaW5nKHRpdGxlKSkge1xuICAgICAgICAgICAgICAgIG1vZGlmaWVkVGl0bGUgPSBwcmV0dGlmeUxhYmVsKHRpdGxlKTtcbiAgICAgICAgICAgICAgICBtb2RpZmllZFRpdGxlID0gZGVIeXBoZW5hdGUobW9kaWZpZWRUaXRsZSk7XG4gICAgICAgICAgICAgICAgbW9kaWZpZWRUaXRsZSA9IG5hbWVQcmVmaXggPyBpbml0Q2FwcyhuYW1lUHJlZml4KSArICcgJyArIG1vZGlmaWVkVGl0bGUgOiBtb2RpZmllZFRpdGxlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBtb2RpZmllZFRpdGxlID0gdGl0bGU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGl0bGUgPSBuYW1lUHJlZml4ID8gbmFtZVByZWZpeCArICcuJyArIHRpdGxlIDogdGl0bGU7XG4gICAgICAgIGlmIChpc1JlbGF0ZWQpIHtcbiAgICAgICAgICAgIC8vIEZvciByZWxhdGVkIGNvbHVtbnMsIHNob3J0ZW4gdGhlIHRpdGxlIHRvIGxhc3QgdHdvIHdvcmRzXG4gICAgICAgICAgICBmaWVsZE5hbWUgPSBfLnNwbGl0KG1vZGlmaWVkVGl0bGUsICcgJyk7XG4gICAgICAgICAgICBmaWVsZE5hbWUgPSBmaWVsZE5hbWUubGVuZ3RoID4gMSA/IGZpZWxkTmFtZVtmaWVsZE5hbWUubGVuZ3RoIC0gMl0gKyAnICcgKyBmaWVsZE5hbWVbZmllbGROYW1lLmxlbmd0aCAtIDFdIDogZmllbGROYW1lWzBdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZmllbGROYW1lID0gbW9kaWZpZWRUaXRsZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBkZWZPYmogPSBvcHRpb25zLnNldEJpbmRpbmdGaWVsZCA/IHsnZGlzcGxheU5hbWUnOiBmaWVsZE5hbWUsICdmaWVsZCc6IHRpdGxlLCAncmVsYXRlZFRhYmxlJzogcmVsYXRlZFRhYmxlLCAncmVsYXRlZEZpZWxkJzogcmVsYXRlZEZpZWxkIHx8IG1vZGlmaWVkVGl0bGV9XG4gICAgICAgIDogeydkaXNwbGF5TmFtZSc6IGZpZWxkTmFtZSwgJ3JlbGF0ZWRUYWJsZSc6IHJlbGF0ZWRUYWJsZSwgJ3JlbGF0ZWRGaWVsZCc6IHJlbGF0ZWRGaWVsZCB8fCBtb2RpZmllZFRpdGxlfTtcbiAgICAgICAgLyppZiBmaWVsZCBpcyBhIGxlYWYgbm9kZSwgcHVzaCBpdCBpbiB0aGUgY29sdW1uRGVmcyovXG4gICAgICAgIGlmICghXy5pc09iamVjdCh2YWx1ZSkgfHwgKF8uaXNBcnJheSh2YWx1ZSkgJiYgIXZhbHVlWzBdKSkge1xuICAgICAgICAgICAgLyppZiB0aGUgY29sdW1uIGNvdW50ZXIgaGFzIHJlYWNoZWQgdXBwZXJCb3VuZCByZXR1cm4qL1xuICAgICAgICAgICAgaWYgKG9wdGlvbnMudXBwZXJCb3VuZCAmJiBvcHRpb25zLmNvbHVtbkNvdW50ID09PSBvcHRpb25zLnVwcGVyQm91bmQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb2x1bW5EZWZPYmoudGVybWluYWxzLnB1c2goZGVmT2JqKTtcbiAgICAgICAgICAgIC8qaW5jcmVtZW50IHRoZSBjb2x1bW4gY291bnRlciovXG4gICAgICAgICAgICBvcHRpb25zLmNvbHVtbkNvdW50ICs9IDE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvKmVsc2UgZmllbGQgaXMgYW4gb2JqZWN0LCBwcm9jZXNzIGl0IHJlY3Vyc2l2ZWx5Ki9cbiAgICAgICAgICAgIC8qIGlmIHBhcmVudCBub2RlIHRvIGJlIGluY2x1ZGVkLCBpbmNsdWRlIGl0ICovXG4gICAgICAgICAgICBpZiAob3B0aW9ucy5jb2x1bW5Db3VudCAhPT0gb3B0aW9ucy51cHBlckJvdW5kKSB7XG4gICAgICAgICAgICAgICAgY29sdW1uRGVmT2JqLm9iamVjdHMucHVzaChkZWZPYmopO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKiBpZiBmaWVsZCBpcyBhbiBhcnJheSBub2RlLCBwcm9jZXNzIGl0cyBmaXJzdCBjaGlsZCAqL1xuICAgICAgICAgICAgaWYgKF8uaXNBcnJheSh2YWx1ZSkgJiYgdmFsdWVbMF0pIHtcbiAgICAgICAgICAgICAgICBwdXNoRmllbGREZWYodmFsdWVbMF0sIGNvbHVtbkRlZk9iaiwgdGl0bGUgKyAnWzBdJywgb3B0aW9ucyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHB1c2hGaWVsZERlZih2YWx1ZSwgY29sdW1uRGVmT2JqLCB0aXRsZSwgb3B0aW9ucyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5cbmNvbnN0IGdldE1ldGFEYXRhRnJvbURhdGEgPSAoZGF0YSkgPT4ge1xuICAgIGxldCBkYXRhT2JqZWN0O1xuICAgIGlmIChfLmlzQXJyYXkoZGF0YSkpIHtcbiAgICAgICAgaWYgKF8uaXNPYmplY3QoZGF0YVswXSkpIHtcbiAgICAgICAgICAgIGRhdGFPYmplY3QgPSBnZXRDbG9uZWRPYmplY3QoZGF0YVswXSk7XG4gICAgICAgICAgICAvKkxvb3Agb3ZlciB0aGUgb2JqZWN0IHRvIGZpbmQgb3V0IGFueSBudWxsIHZhbHVlcy4gSWYgYW55IG51bGwgdmFsdWVzIGFyZSBwcmVzZW50IGluIHRoZSBmaXJzdCByb3csIGNoZWNrIGFuZCBhc3NpZ24gdGhlIHZhbHVlcyBmcm9tIG90aGVyIHJvdy5cbiAgICAgICAgICAgICAqIEFzIGNvbHVtbiBnZW5lcmF0aW9uIGlzIGRlcGVuZGVudCBvbiBkYXRhLCBmb3IgcmVsYXRlZCBmaWVsZHMgaWYgZmlyc3Qgcm93IHZhbHVlIGlzIG51bGwsIGNvbHVtbnMgYXJlIG5vdCBnZW5lcmF0ZWQuXG4gICAgICAgICAgICAgKiBUbyBwcmV2ZW50IHRoaXMsIGNoZWNrIHRoZSBkYXRhIGluIG90aGVyIHJvd3MgYW5kIGdlbmVyYXRlIHRoZSBjb2x1bW5zLiBOZXcga2V5cyBmcm9tIG90aGVycyByb3dzIGFyZSBhbHNvIGFkZGVkKi9cbiAgICAgICAgICAgIF8uZm9yRWFjaChkYXRhLCAocm93LCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICgoaW5kZXggKyAxKSA+PSAxMCkgeyAvLyBMaW1pdCB0aGUgZGF0YSBzZWFyY2ggdG8gZmlyc3QgMTAgcmVjb3Jkc1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIF8uYXNzaWduV2l0aChkYXRhT2JqZWN0LCByb3csIChvYmpWYWx1ZSwgc3JjVmFsdWUpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChvYmpWYWx1ZSA9PT0gbnVsbCB8fCBvYmpWYWx1ZSA9PT0gdW5kZWZpbmVkKSA/IHNyY1ZhbHVlIDogb2JqVmFsdWU7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRhdGFPYmplY3QgPSBkYXRhWzBdO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZGF0YU9iamVjdCA9IGRhdGE7XG4gICAgfVxuICAgIHJldHVybiBkYXRhT2JqZWN0O1xufTtcblxuZXhwb3J0IGNvbnN0IHByZXBhcmVGaWVsZERlZnMgPSAoZGF0YSwgb3B0aW9ucz8pID0+IHtcbiAgICBsZXQgZGF0YU9iamVjdDtcbiAgICBjb25zdCBjb2x1bW5EZWYgPSB7XG4gICAgICAgICAgICAnb2JqZWN0cycgOiBbXSxcbiAgICAgICAgICAgICd0ZXJtaW5hbHMnIDogW11cbiAgICAgICAgfTtcbiAgICAvKmlmIG5vIGRhdGEgcHJvdmlkZWQsIGluaXRpYWxpemUgZGVmYXVsdCBjb2x1bW4gZGVmaW5pdGlvbnMqL1xuICAgIGlmICghZGF0YSkge1xuICAgICAgICBkYXRhID0gW107XG4gICAgfVxuICAgIGlmICghb3B0aW9ucykge1xuICAgICAgICBvcHRpb25zID0ge307XG4gICAgfVxuICAgIG9wdGlvbnMuc2V0QmluZGluZ0ZpZWxkID0gdHJ1ZTtcbiAgICBvcHRpb25zLmNvbHVtbkNvdW50ID0gMDtcbiAgICBkYXRhT2JqZWN0ID0gZ2V0TWV0YURhdGFGcm9tRGF0YShkYXRhKTtcbiAgICAvKmZpcnN0IG9mIHRoZSBtYW55IGRhdGEgb2JqZWN0cyBmcm9tIGdyaWQgZGF0YSovXG4gICAgcHVzaEZpZWxkRGVmKGRhdGFPYmplY3QsIGNvbHVtbkRlZiwgJycsIG9wdGlvbnMpO1xuICAgIGlmICghb3B0aW9ucyB8fCAob3B0aW9ucyAmJiAhb3B0aW9ucy5maWx0ZXIpKSB7XG4gICAgICAgIHJldHVybiBjb2x1bW5EZWYudGVybWluYWxzO1xuICAgIH1cbiAgICBzd2l0Y2ggKG9wdGlvbnMuZmlsdGVyKSB7XG4gICAgICAgIGNhc2UgJ2FsbCc6XG4gICAgICAgICAgICByZXR1cm4gY29sdW1uRGVmO1xuICAgICAgICBjYXNlICdvYmplY3RzJzpcbiAgICAgICAgICAgIHJldHVybiBjb2x1bW5EZWYub2JqZWN0cztcbiAgICAgICAgY2FzZSAndGVybWluYWxzJzpcbiAgICAgICAgICAgIHJldHVybiBjb2x1bW5EZWYudGVybWluYWxzO1xuICAgIH1cbiAgICByZXR1cm4gY29sdW1uRGVmO1xufTtcbiJdfQ==