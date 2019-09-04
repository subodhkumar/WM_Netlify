import { getClonedObject, hasCordova, isDefined, isNumberType, replace, triggerFn } from '@wm/core';
import { $rootScope, DB_CONSTANTS, SWAGGER_CONSTANTS } from '../../constants/variables.constants';
import { formatDate, getEvaluatedOrderBy } from './variables.utils';
export class LiveVariableUtils {
    static isCompositeKey(primaryKey) {
        return !primaryKey || (primaryKey && (!primaryKey.length || primaryKey.length > 1));
    }
    static isNoPrimaryKey(primaryKey) {
        return (!primaryKey || (primaryKey && !primaryKey.length));
    }
    // Generate the URL based on the primary keys and their values
    static getCompositeIDURL(primaryKeysData) {
        let compositeId = '';
        //  Loop over the 'compositeKeysData' and construct the 'compositeId'.
        _.forEach(primaryKeysData, (paramValue, paramName) => {
            compositeId += paramName + '=' + encodeURIComponent(paramValue) + '&';
        });
        compositeId = compositeId.slice(0, -1);
        return compositeId;
    }
    // Check if table has blob column
    static hasBlob(variable) {
        return _.find(_.get(variable, ['propertiesMap', 'columns']), { 'type': 'blob' });
    }
    static getPrimaryKey(variable) {
        if (!variable.propertiesMap) {
            return [];
        }
        if (variable.propertiesMap.primaryFields) {
            return variable.propertiesMap.primaryFields;
        }
        /*Old projects do not have primary fields. Get primary key from the columns*/
        const primaryKey = [];
        /*Loop through the propertiesMap and get the primary key column.*/
        _.forEach(variable.propertiesMap.columns, (index, column) => {
            if (column.isPrimaryKey) {
                if (column.isRelated && (!_.includes(column.relatedFieldName, primaryKey))) {
                    primaryKey.push(column.relatedFieldName);
                }
                else if (!_.includes(column.fieldName, primaryKey)) {
                    primaryKey.push(column.fieldName);
                }
            }
        });
        return primaryKey;
    }
    //  Construct the URL for blob columns and set it in the data, so that widgets can use this
    static processBlobColumns(responseData, variable) {
        if (!responseData) {
            return;
        }
        const blobCols = _.map(_.filter(variable.propertiesMap.columns, { 'type': 'blob' }), 'fieldName'), deployedUrl = _.trim($rootScope.project.deployedUrl);
        let href = '', primaryKeys;
        if (_.isEmpty(blobCols)) {
            return;
        }
        if (hasCordova()) {
            href += _.endsWith(deployedUrl, '/') ? deployedUrl : deployedUrl + '/';
        }
        href += ((variable._prefabName !== '' && variable._prefabName !== undefined) ? 'prefabs/' + variable._prefabName : 'services') + '/' + variable.liveSource + '/' + variable.type + '/';
        primaryKeys = variable.propertiesMap.primaryFields || variable.propertiesMap.primaryKeys;
        _.forEach(responseData, data => {
            if (data) {
                _.forEach(blobCols, col => {
                    const compositeKeysData = {};
                    if (data[col] === null || !_.isEmpty(_.trim(data[col]))) {
                        return;
                    }
                    if (LiveVariableUtils.isCompositeKey(primaryKeys)) {
                        primaryKeys.forEach(key => {
                            compositeKeysData[key] = data[key];
                        });
                        data[col] = href + 'composite-id/content/' + col + '?' + LiveVariableUtils.getCompositeIDURL(compositeKeysData);
                    }
                    else {
                        data[col] = href + data[_.join(primaryKeys)] + '/content/' + col;
                    }
                });
            }
        });
    }
    static getHibernateOrSqlType(variable, fieldName, type, entityName) {
        const columns = variable.propertiesMap.columns;
        let column, relatedCols, relatedCol;
        if (_.includes(fieldName, '.')) {
            column = _.find(columns, col => {
                return col.fieldName === fieldName.split('.')[0];
            });
            relatedCols = column && column.columns;
            relatedCol = _.find(relatedCols, col => {
                return col.fieldName === fieldName.split('.')[1];
            });
            return relatedCol && relatedCol[type];
        }
        column = _.find(columns, col => {
            return col.fieldName === fieldName || col.relatedColumnName === fieldName;
        });
        if (!column && entityName) {
            const entity = _.find(columns, col => col.relatedEntityName === entityName);
            column = _.find(entity.columns, col => {
                return col.fieldName === fieldName || col.relatedColumnName === fieldName;
            });
        }
        return column && column[type];
    }
    /*Function to get the sqlType of the specified field.*/
    static getSqlType(variable, fieldName, entityName) {
        return LiveVariableUtils.getHibernateOrSqlType(variable, fieldName, 'type', entityName);
    }
    /*Function to check if the specified field has a one-to-many relation or not.*/
    static isRelatedFieldMany(variable, fieldName) {
        const columns = variable.propertiesMap.columns, columnsCount = columns.length;
        let index, column;
        /*Loop through the columns of the liveVariable*/
        for (index = 0; index < columnsCount; index += 1) {
            column = columns[index];
            /*If the specified field is found in the columns of the variable,
            * then it has a many-to-one relation.*/
            if (column.fieldName === fieldName) {
                return false;
            }
        }
        return true;
    }
    static isStringType(type) {
        return _.includes(['text', 'string'], _.toLower(type));
    }
    static getSQLFieldType(variable, options) {
        if (_.includes(['timestamp', 'datetime', 'date'], options.type)) {
            return options.type;
        }
        return LiveVariableUtils.getSqlType(variable, options.fieldName) || options.type;
    }
    static getAttributeName(variable, fieldName) {
        let attrName = fieldName;
        variable.propertiesMap.columns.forEach(column => {
            if (column.fieldName === fieldName && column.isRelated) {
                attrName = column.relatedFieldName;
            }
        });
        return attrName;
    }
    static getFilterCondition(filterCondition) {
        if (_.includes(DB_CONSTANTS.DATABASE_RANGE_MATCH_MODES, filterCondition)) {
            return filterCondition;
        }
        return DB_CONSTANTS.DATABASE_MATCH_MODES['exact'];
    }
    static getFilterOption(variable, fieldOptions, options) {
        let attributeName, fieldValue = fieldOptions.value, filterOption, filterCondition;
        const matchModes = DB_CONSTANTS.DATABASE_MATCH_MODES, fieldName = fieldOptions.fieldName, fieldRequired = fieldOptions.required || false, fieldType = LiveVariableUtils.getSQLFieldType(variable, fieldOptions);
        filterCondition = matchModes[fieldOptions.matchMode] || matchModes[fieldOptions.filterCondition] || fieldOptions.filterCondition;
        fieldOptions.type = fieldType;
        /* if the field value is an object(complex type), loop over each field inside and push only first level fields */
        if (_.isObject(fieldValue) && !_.isArray(fieldValue)) {
            const firstLevelValues = [];
            _.forEach(fieldValue, (subFieldValue, subFieldName) => {
                if (subFieldValue && !_.isObject(subFieldValue)) {
                    firstLevelValues.push(fieldName + '.' + subFieldName + '=' + subFieldValue);
                }
            });
            return firstLevelValues;
        }
        if (_.includes(DB_CONSTANTS.DATABASE_EMPTY_MATCH_MODES, filterCondition)) {
            attributeName = LiveVariableUtils.getAttributeName(variable, fieldName);
            // For non string types empty match modes are not supported, so convert them to null match modes.
            if (fieldType && !LiveVariableUtils.isStringType(fieldType)) {
                filterCondition = DB_CONSTANTS.DATABASE_NULL_EMPTY_MATCH[filterCondition];
            }
            filterOption = {
                'attributeName': attributeName,
                'attributeValue': '',
                'attributeType': _.toUpper(fieldType),
                'filterCondition': filterCondition,
                'required': fieldRequired
            };
            if (options.searchWithQuery) {
                filterOption.isVariableFilter = fieldOptions.isVariableFilter;
            }
            return filterOption;
        }
        if (isDefined(fieldValue) && fieldValue !== null && fieldValue !== '') {
            /*Based on the sqlType of the field, format the value & set the filter condition.*/
            if (fieldType) {
                switch (fieldType) {
                    case 'integer':
                        fieldValue = _.isArray(fieldValue) ? _.reduce(fieldValue, (result, value) => {
                            value = parseInt(value, 10);
                            if (!_.isNaN(value)) {
                                result.push(value);
                            }
                            return result;
                        }, []) : parseInt(fieldValue, 10);
                        filterCondition = filterCondition ? LiveVariableUtils.getFilterCondition(filterCondition) : matchModes['exact'];
                        break;
                    case 'date':
                    case 'datetime':
                    case 'timestamp':
                        fieldValue = formatDate(fieldValue, fieldType);
                        filterCondition = filterCondition ? LiveVariableUtils.getFilterCondition(filterCondition) : matchModes['exact'];
                        break;
                    case 'text':
                    case 'string':
                        if (_.isArray(fieldValue)) {
                            filterCondition = _.includes([matchModes['in'], matchModes['notin']], filterCondition) ? filterCondition : matchModes['exact'];
                        }
                        else {
                            filterCondition = filterCondition || matchModes['anywhereignorecase'];
                        }
                        break;
                    default:
                        filterCondition = filterCondition ? LiveVariableUtils.getFilterCondition(filterCondition) : matchModes['exact'];
                        break;
                }
            }
            else {
                filterCondition = _.isString(fieldValue) ? matchModes['anywhereignorecase'] : matchModes['exact'];
            }
            attributeName = LiveVariableUtils.getAttributeName(variable, fieldName);
            filterOption = {
                'attributeName': attributeName,
                'attributeValue': fieldValue,
                'attributeType': _.toUpper(fieldType),
                'filterCondition': filterCondition,
                'required': fieldRequired
            };
            if (options.searchWithQuery) {
                filterOption.isVariableFilter = fieldOptions.isVariableFilter;
            }
            return filterOption;
        }
    }
    static getFilterOptions(variable, filterFields, options) {
        let filterOptions = [];
        _.each(filterFields, (fieldOptions) => {
            const filterOption = LiveVariableUtils.getFilterOption(variable, fieldOptions, options);
            if (!_.isNil(filterOption)) {
                if (_.isArray(filterOption)) {
                    filterOptions = filterOptions.concat(filterOption);
                }
                else {
                    filterOptions.push(filterOption);
                }
            }
        });
        return filterOptions;
    }
    // Wrap the field name and value in lower() in ignore case scenario
    // TODO: Change the function name to represent the added functionality of identifiers for datetime, timestamp and float types. Previously only lower was warapped.
    static wrapInLowerCase(value, options, ignoreCase, isField) {
        const type = _.toLower(options.attributeType);
        if (!isField) {
            // Wrap the identifiers for datetime, timestamp and float types. Wrappring is not required for fields.
            if (type === 'datetime') {
                return 'wm_dt(' + value + ')';
            }
            if (type === 'timestamp') {
                return 'wm_ts(' + value + ')';
            }
            if (type === 'float') {
                return 'wm_float(' + value + ')';
            }
            if (type === 'boolean') {
                return 'wm_bool(' + value + ')';
            }
        }
        // If ignore case is true and type is string/ text and match mode is string type, wrap in lower()
        if (ignoreCase && (!type || LiveVariableUtils.isStringType(type)) && _.includes(DB_CONSTANTS.DATABASE_STRING_MODES, options.filterCondition)) {
            return 'lower(' + value + ')';
        }
        return value;
    }
    static encodeAndAddQuotes(value, type, skipEncode) {
        let encodedValue = skipEncode ? value : encodeURIComponent(value);
        type = _.toLower(type);
        encodedValue = _.replace(encodedValue, /'/g, '\'\'');
        // For number types, don't wrap the value in quotes
        if ((isNumberType(type) && type !== 'float')) {
            return encodedValue;
        }
        return '\'' + encodedValue + '\'';
    }
    static getParamValue(value, options, ignoreCase, skipEncode) {
        let param;
        const filterCondition = options.filterCondition, dbModes = DB_CONSTANTS.DATABASE_MATCH_MODES, type = options.attributeType;
        if (_.includes(DB_CONSTANTS.DATABASE_EMPTY_MATCH_MODES, filterCondition)) {
            // For empty matchmodes, no value is required
            return '';
        }
        switch (filterCondition) {
            case dbModes.startignorecase:
            case dbModes.start:
                param = LiveVariableUtils.encodeAndAddQuotes(value + '%', type, skipEncode);
                param = LiveVariableUtils.wrapInLowerCase(param, options, ignoreCase);
                break;
            case dbModes.endignorecase:
            case dbModes.end:
                param = LiveVariableUtils.encodeAndAddQuotes('%' + value, type, skipEncode);
                param = LiveVariableUtils.wrapInLowerCase(param, options, ignoreCase);
                break;
            case dbModes.anywhereignorecase:
            case dbModes.anywhere:
                param = LiveVariableUtils.encodeAndAddQuotes('%' + value + '%', type, skipEncode);
                param = LiveVariableUtils.wrapInLowerCase(param, options, ignoreCase);
                break;
            case dbModes.between:
                param = _.join(_.map(value, val => {
                    return LiveVariableUtils.wrapInLowerCase(LiveVariableUtils.encodeAndAddQuotes(val, type, skipEncode), options, ignoreCase);
                }), ' and ');
                break;
            case dbModes.in:
            case dbModes.notin:
                param = _.join(_.map(value, val => {
                    return LiveVariableUtils.wrapInLowerCase(LiveVariableUtils.encodeAndAddQuotes(val, type, skipEncode), options, ignoreCase);
                }), ', ');
                param = '(' + param + ')';
                break;
            /*case dbModes.exactignorecase:
            case dbModes.exact:
            case dbModes.notequals:
            The above three cases will be handled by default*/
            default:
                param = LiveVariableUtils.encodeAndAddQuotes(value, type, skipEncode);
                param = LiveVariableUtils.wrapInLowerCase(param, options, ignoreCase);
                break;
        }
        return isDefined(param) ? param : '';
    }
    static getSearchQuery(filterOptions, operator, ignoreCase, skipEncode) {
        let query;
        const params = [];
        _.forEach(filterOptions, fieldValue => {
            const value = fieldValue.attributeValue, dbModes = DB_CONSTANTS.DATABASE_MATCH_MODES, isValArray = _.isArray(value);
            let fieldName = fieldValue.attributeName, filterCondition = fieldValue.filterCondition, matchModeExpr, paramValue;
            // If value is an empty array, do not generate the query
            // If values is NaN and number type, do not generate query for this field
            if ((isValArray && _.isEmpty(value)) || (!isValArray && isNaN(value) && isNumberType(fieldValue.attributeType))) {
                return;
            }
            if (isValArray) {
                // If array is value and mode is between, pass between. Else pass as in query
                filterCondition = filterCondition === dbModes.between || filterCondition === dbModes.notin ? filterCondition : dbModes.in;
                fieldValue.filterCondition = filterCondition;
            }
            matchModeExpr = DB_CONSTANTS.DATABASE_MATCH_MODES_WITH_QUERY[filterCondition];
            paramValue = LiveVariableUtils.getParamValue(value, fieldValue, ignoreCase, skipEncode);
            fieldName = LiveVariableUtils.wrapInLowerCase(fieldName, fieldValue, ignoreCase, true);
            params.push(replace(matchModeExpr, [fieldName, paramValue]));
        });
        query = _.join(params, operator); // empty space added intentionally around OR
        return query;
    }
    /**
     * creating the proper values from the actual object like for between,in matchModes value has to be an array like [1,2]
     * @param rules recursive filterexpressions object
     * @param variable variable object
     * @param options options
     */
    static processFilterFields(rules, variable, options) {
        _.remove(rules, rule => {
            return rule && (_.isString(rule.value) && rule.value.indexOf('bind:') === 0 || (rule.matchMode === 'between' ? (_.isString(rule.secondvalue) && rule.secondvalue.indexOf('bind:') === 0) : false));
        });
        _.forEach(rules, (rule, index) => {
            if (rule) {
                if (rule.rules) {
                    LiveVariableUtils.processFilterFields(rule.rules, variable, options);
                }
                else {
                    if (!_.isNull(rule.target)) {
                        const value = rule.matchMode.toLowerCase() === DB_CONSTANTS.DATABASE_MATCH_MODES.between.toLowerCase()
                            ? (_.isArray(rule.value) ? rule.value : [rule.value, rule.secondvalue])
                            : (rule.matchMode.toLowerCase() === DB_CONSTANTS.DATABASE_MATCH_MODES.in.toLowerCase() || rule.matchMode.toLowerCase() === DB_CONSTANTS.DATABASE_MATCH_MODES.notin.toLowerCase()
                                ? (_.isArray(rule.value) ? rule.value : (rule.value ? rule.value.split(',').map(val => val.trim()) : ''))
                                : rule.value);
                        rules[index] = LiveVariableUtils.getFilterOption(variable, {
                            'fieldName': rule.target,
                            'type': rule.type,
                            'value': value,
                            'required': rule.required,
                            'filterCondition': rule.matchMode || options.matchMode || variable.matchMode
                        }, options);
                    }
                }
            }
        });
    }
    static getSearchField(fieldValue, ignoreCase, skipEncode) {
        let fieldName = fieldValue.attributeName;
        let matchModeExpr;
        let paramValue;
        let filterCondition = fieldValue.filterCondition;
        const value = fieldValue.attributeValue;
        const isValArray = _.isArray(value);
        const dbModes = DB_CONSTANTS.DATABASE_MATCH_MODES;
        // If value is an empty array, do not generate the query
        // If values is NaN and number type, do not generate query for this field
        if ((isValArray && _.isEmpty(value)) || (isValArray && _.some(value, val => (_.isNull(val) || _.isNaN(val) || val === ''))) || (!isValArray && isNaN(value) && isNumberType(fieldValue.attributeType))) {
            return;
        }
        if (isValArray) {
            // If array is value and mode is between, pass between. Else pass as in query
            filterCondition = filterCondition === dbModes.between || filterCondition === dbModes.notin ? filterCondition : dbModes.in;
            fieldValue.filterCondition = filterCondition;
        }
        matchModeExpr = DB_CONSTANTS.DATABASE_MATCH_MODES_WITH_QUERY[filterCondition];
        paramValue = LiveVariableUtils.getParamValue(value, fieldValue, ignoreCase, skipEncode);
        fieldName = LiveVariableUtils.wrapInLowerCase(fieldName, fieldValue, ignoreCase, true);
        return replace(matchModeExpr, [fieldName, paramValue]);
    }
    /**
     * this is used to identify whether to use ignorecase at each criteria level and not use the variable
     * level isIgnoreCase flag and apply it to all the rules.
     * Instead of adding an extra param to the criteria object, we have added few other matchmodes for string types like
     * anywhere with anywhereignorecase, start with startignorecase, end with endignorecase, exact with exactignorecase,
     * So while creating the criteria itseld user can choose whether to use ignore case or not for a particular column while querying
     * @param matchMode
     * @param ignoreCase
     * @returns {*} boolean
     */
    static getIgnoreCase(matchMode, ignoreCase) {
        const matchModes = DB_CONSTANTS.DATABASE_MATCH_MODES;
        if (_.indexOf([matchModes['anywhere'], matchModes['start'], matchModes['end'], matchModes['exact']], matchMode) !== -1) {
            return false;
        }
        if (_.indexOf([matchModes['anywhereignorecase'], matchModes['startignorecase'], matchModes['endignorecase'], matchModes['exactignorecase']], matchMode) !== -1) {
            return true;
        }
        return ignoreCase;
    }
    static generateSearchQuery(rules, condition, ignoreCase, skipEncode) {
        const params = [];
        _.forEach(rules, rule => {
            if (rule) {
                if (rule.rules) {
                    const query = LiveVariableUtils.generateSearchQuery(rule.rules, rule.condition, ignoreCase, skipEncode);
                    if (query !== '') {
                        params.push('(' + query + ')');
                    }
                }
                else {
                    const searchField = LiveVariableUtils.getSearchField(rule, LiveVariableUtils.getIgnoreCase(rule.filterCondition, ignoreCase), skipEncode);
                    if (!_.isNil(searchField)) {
                        params.push(searchField);
                    }
                }
            }
        });
        return _.join(params, ' ' + condition + ' ');
    }
    static prepareTableOptionsForFilterExps(variable, options, clonedFields) {
        if (!isDefined(options.searchWithQuery)) {
            options.searchWithQuery = true; // Using query api instead of  search api
        }
        const filterOptions = [];
        const matchModes = DB_CONSTANTS.DATABASE_MATCH_MODES;
        let orderByFields, orderByOptions, query;
        let clonedObj = clonedFields || getClonedObject(variable.filterExpressions);
        // if filterexpression from live filter is present use it to query
        if (options.filterExpr && !_.isEmpty(options.filterExpr)) {
            clonedObj = options.filterExpr;
        }
        // merge live filter runtime values
        let filterRules = {};
        if (!_.isEmpty(options.filterFields)) {
            filterRules = { 'condition': options.logicalOp || 'AND', 'rules': [] };
            _.forEach(options.filterFields, (filterObj, filterName) => {
                const filterCondition = matchModes[filterObj.matchMode] || matchModes[filterObj.filterCondition] || filterObj.filterCondition;
                if (_.includes(DB_CONSTANTS.DATABASE_EMPTY_MATCH_MODES, filterCondition) ||
                    (!_.isNil(filterObj.value) && filterObj.value !== '')) {
                    const type = filterObj.type || LiveVariableUtils.getSqlType(variable, filterName, options.entityName);
                    const ruleObj = {
                        'target': filterName,
                        'type': type,
                        'matchMode': filterObj.matchMode || (LiveVariableUtils.isStringType(type) ? 'startignorecase' : 'exact'),
                        'value': filterObj.value,
                        'required': filterObj.required || false
                    };
                    filterRules.rules.push(ruleObj);
                }
            });
        }
        if (!_.isEmpty(clonedObj)) {
            if (!_.isNil(filterRules.rules) && filterRules.rules.length) {
                // combine both the rules using 'AND'
                const tempRules = { 'condition': 'AND', 'rules': [] };
                tempRules.rules.push(getClonedObject(clonedObj));
                tempRules.rules.push(filterRules);
                clonedObj = tempRules;
            }
        }
        else {
            clonedObj = filterRules;
        }
        LiveVariableUtils.processFilterFields(clonedObj.rules, variable, options);
        query = LiveVariableUtils.generateSearchQuery(clonedObj.rules, clonedObj.condition, variable.ignoreCase, options.skipEncode);
        orderByFields = getEvaluatedOrderBy(variable.orderBy, options.orderBy);
        orderByOptions = orderByFields ? 'sort=' + orderByFields : '';
        return {
            'filter': filterOptions,
            'sort': orderByOptions,
            'query': query
        };
    }
    static prepareTableOptions(variable, options, clonedFields) {
        if (variable.operation === 'read') {
            return LiveVariableUtils.prepareTableOptionsForFilterExps(variable, options, clonedFields);
        }
        if (!isDefined(options.searchWithQuery)) {
            options.searchWithQuery = true; //  Using query api instead of  search api
        }
        const filterFields = [];
        let filterOptions = [], orderByFields, orderByOptions, query, optionsQuery;
        clonedFields = clonedFields || variable.filterFields;
        // get the filter fields from the variable
        _.forEach(clonedFields, (value, key) => {
            if (_.isObject(value) && (!options.filterFields || !options.filterFields[key] || options.filterFields[key].logicalOp === 'AND')) {
                value.fieldName = key;
                if (LiveVariableUtils.isStringType(LiveVariableUtils.getSQLFieldType(variable, value))) {
                    value.filterCondition = DB_CONSTANTS.DATABASE_MATCH_MODES[value.matchMode || variable.matchMode];
                }
                value.isVariableFilter = true;
                filterFields.push(value);
            }
        });
        // get the filter fields from the options
        _.forEach(options.filterFields, (value, key) => {
            value.fieldName = key;
            value.filterCondition = DB_CONSTANTS.DATABASE_MATCH_MODES[value.matchMode || options.matchMode || variable.matchMode];
            filterFields.push(value);
        });
        if (variable.operation === 'read' || options.operation === 'read') {
            filterOptions = LiveVariableUtils.getFilterOptions(variable, filterFields, options);
        }
        /*if searchWithQuery is true, then convert the input params into query string. For example if firstName and lastName
         should be sent as params then query string will be q='firstName containing 'someValue' OR lastName containing 'someValue''
         */
        if (options.searchWithQuery && filterOptions.length) {
            // Generate query for variable filter fields. This has AND logical operator
            query = LiveVariableUtils.getSearchQuery(_.filter(filterOptions, { 'isVariableFilter': true }), ' AND ', variable.ignoreCase, options.skipEncode);
            // Generate query for option filter fields. This has default logical operator as OR
            optionsQuery = LiveVariableUtils.getSearchQuery(_.filter(filterOptions, { 'isVariableFilter': undefined }), ' ' + (options.logicalOp || 'AND') + ' ', variable.ignoreCase, options.skipEncode);
            if (optionsQuery) {
                // If both variable and option query are present, merge them with AND
                query = query ? (query + ' AND ( ' + optionsQuery + ' )') : optionsQuery;
            }
        }
        orderByFields = getEvaluatedOrderBy(variable.orderBy, options.orderBy);
        orderByOptions = orderByFields ? 'sort=' + orderByFields : '';
        return {
            'filter': filterOptions,
            'sort': orderByOptions,
            'query': query
        };
    }
    /* Function to check if specified field is of type date*/
    static getFieldType(fieldName, variable, relatedField) {
        let fieldType, columns, result;
        if (variable.propertiesMap) {
            columns = variable.propertiesMap.columns || [];
            result = _.find(columns, obj => {
                return obj.fieldName === fieldName;
            });
            // if related field name passed, get its type from columns inside the current field
            if (relatedField && result) {
                result = _.find(result.columns, obj => {
                    return obj.fieldName === relatedField;
                });
            }
            fieldType = result && result.type;
        }
        return fieldType;
    }
    // Prepare formData for blob columns
    static prepareFormData(variableDetails, rowObject) {
        const formData = new FormData();
        formData.rowData = _.clone(rowObject);
        _.forEach(rowObject, (colValue, colName) => {
            if (LiveVariableUtils.getFieldType(colName, variableDetails) === 'blob') {
                if (_.isObject(colValue)) {
                    if (_.isArray(colValue)) {
                        _.forEach(colValue, fileObject => {
                            formData.append(colName, fileObject, fileObject.name);
                        });
                    }
                    else {
                        formData.append(colName, colValue, colValue.name);
                    }
                }
                rowObject[colName] = colValue !== null ? '' : null;
            }
        });
        formData.append(SWAGGER_CONSTANTS.WM_DATA_JSON, new Blob([JSON.stringify(rowObject)], {
            type: 'application/json'
        }));
        return formData;
    }
    static traverseFilterExpressions(filterExpressions, traverseCallbackFn) {
        if (filterExpressions && filterExpressions.rules) {
            _.forEach(filterExpressions.rules, (filExpObj, i) => {
                if (filExpObj.rules) {
                    LiveVariableUtils.traverseFilterExpressions(filExpObj, traverseCallbackFn);
                }
                else {
                    return triggerFn(traverseCallbackFn, filterExpressions, filExpObj);
                }
            });
        }
    }
    /**
     * Traverses recursively the filterExpressions object and if there is any required field present with no value,
     * then we will return without proceeding further. Its upto the developer to provide the mandatory value,
     * if he wants to assign it in teh onbefore<delete/insert/update>function then make that field in
     * the filter query section as optional
     * @param filterExpressions - recursive rule Object
     * @returns {Object} object or boolean. Object if everything gets validated or else just boolean indicating failure in the validations
     */
    static getFilterExprFields(filterExpressions) {
        let isRequiredFieldAbsent = false;
        const traverseCallbackFn = (parentFilExpObj, filExpObj) => {
            if (filExpObj
                && filExpObj.required
                && ((_.indexOf(['null', 'isnotnull', 'empty', 'isnotempty', 'nullorempty'], filExpObj.matchMode) === -1) && filExpObj.value === '')) {
                isRequiredFieldAbsent = true;
                return false;
            }
        };
        LiveVariableUtils.traverseFilterExpressions(filterExpressions, traverseCallbackFn);
        return isRequiredFieldAbsent ? !isRequiredFieldAbsent : filterExpressions;
    }
    /**
     *
     * @param variable
     * @param options
     * @returns {function(*=): *} returns a function which should be called for the where clause.
     * This return function can take a function as argument. This argument function can modify the filter fields
     * before generating where clause.
     */
    static getWhereClauseGenerator(variable, options, updatedFilterFields) {
        return (modifier, skipEncode) => {
            const clonedFields = LiveVariableUtils.getFilterExprFields(getClonedObject(updatedFilterFields || variable.filterExpressions));
            // this flag skips the encoding of the query
            if (isDefined(skipEncode)) {
                options.skipEncode = skipEncode;
            }
            if (modifier) {
                // handling the scenario where variable can also have filterFields
                if (options.filterFields) {
                    modifier(clonedFields, options);
                }
                else {
                    modifier(clonedFields);
                }
            }
            return LiveVariableUtils.prepareTableOptions(variable, options, clonedFields).query;
        };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGl2ZS12YXJpYWJsZS51dGlscy5qcyIsInNvdXJjZVJvb3QiOiJuZzovL0B3bS92YXJpYWJsZXMvIiwic291cmNlcyI6WyJ1dGlsL3ZhcmlhYmxlL2xpdmUtdmFyaWFibGUudXRpbHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGVBQWUsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBRXBHLE9BQU8sRUFBRSxVQUFVLEVBQUUsWUFBWSxFQUFFLGlCQUFpQixFQUFFLE1BQU0scUNBQXFDLENBQUM7QUFDbEcsT0FBTyxFQUFFLFVBQVUsRUFBRSxtQkFBbUIsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBSXBFLE1BQU0sT0FBTyxpQkFBaUI7SUFFMUIsTUFBTSxDQUFDLGNBQWMsQ0FBQyxVQUFVO1FBQzVCLE9BQU8sQ0FBQyxVQUFVLElBQUksQ0FBQyxVQUFVLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxNQUFNLElBQUksVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3hGLENBQUM7SUFFRCxNQUFNLENBQUMsY0FBYyxDQUFDLFVBQVU7UUFDNUIsT0FBTyxDQUFDLENBQUMsVUFBVSxJQUFJLENBQUMsVUFBVSxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDL0QsQ0FBQztJQUVELDhEQUE4RDtJQUM5RCxNQUFNLENBQUMsaUJBQWlCLENBQUMsZUFBZTtRQUNwQyxJQUFJLFdBQVcsR0FBRyxFQUFFLENBQUM7UUFDckIsc0VBQXNFO1FBQ3RFLENBQUMsQ0FBQyxPQUFPLENBQUMsZUFBZSxFQUFFLENBQUMsVUFBVSxFQUFFLFNBQVMsRUFBRSxFQUFFO1lBQ2pELFdBQVcsSUFBSSxTQUFTLEdBQUcsR0FBRyxHQUFHLGtCQUFrQixDQUFDLFVBQVUsQ0FBQyxHQUFHLEdBQUcsQ0FBQztRQUMxRSxDQUFD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QUFTLENBQUMsS0FBSyxLQUFLLEVBQUUsQ0FBQyxFQUFFO2dCQUNySSxxQkFBcUIsR0FBRyxJQUFJLENBQUM7Z0JBQzdCLE9BQU8sS0FBSyxDQUFDO2FBQ2hCO1FBQ0wsQ0FBQyxDQUFDO1FBQ0YsaUJBQWlCLENBQUMseUJBQXlCLENBQUMsaUJBQWlCLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztRQUNuRixPQUFPLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxDQUFDLHFCQUFxQixDQUFDLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQztJQUM5RSxDQUFDO0lBRUQ7Ozs7Ozs7T0FPRztJQUNILE1BQU0sQ0FBQyx1QkFBdUIsQ0FBQyxRQUFRLEVBQUUsT0FBTyxFQUFFLG1CQUF5QjtRQUN2RSxPQUFPLENBQUMsUUFBUSxFQUFFLFVBQW9CLEVBQUUsRUFBRTtZQUN0QyxNQUFNLFlBQVksR0FBRyxpQkFBaUIsQ0FBQyxtQkFBbUIsQ0FBQyxlQUFlLENBQUMsbUJBQW1CLElBQUksUUFBUSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQztZQUMvSCw0Q0FBNEM7WUFDNUMsSUFBSSxTQUFTLENBQUMsVUFBVSxDQUFDLEVBQUU7Z0JBQ3ZCLE9BQU8sQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO2FBQ25DO1lBQ0QsSUFBSSxRQUFRLEVBQUU7Z0JBQ1Ysa0VBQWtFO2dCQUNsRSxJQUFJLE9BQU8sQ0FBQyxZQUFZLEVBQUU7b0JBQ3RCLFFBQVEsQ0FBQyxZQUFZLEVBQUUsT0FBTyxDQUFDLENBQUM7aUJBQ25DO3FCQUFNO29CQUNILFFBQVEsQ0FBQyxZQUFZLENBQUMsQ0FBQztpQkFDMUI7YUFDSjtZQUNELE9BQU8saUJBQWlCLENBQUMsbUJBQW1CLENBQUMsUUFBUSxFQUFFLE9BQU8sRUFBRSxZQUFZLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDeEYsQ0FBQyxDQUFDO0lBQ04sQ0FBQztDQUNKIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZ2V0Q2xvbmVkT2JqZWN0LCBoYXNDb3Jkb3ZhLCBpc0RlZmluZWQsIGlzTnVtYmVyVHlwZSwgcmVwbGFjZSwgdHJpZ2dlckZuIH0gZnJvbSAnQHdtL2NvcmUnO1xuXG5pbXBvcnQgeyAkcm9vdFNjb3BlLCBEQl9DT05TVEFOVFMsIFNXQUdHRVJfQ09OU1RBTlRTIH0gZnJvbSAnLi4vLi4vY29uc3RhbnRzL3ZhcmlhYmxlcy5jb25zdGFudHMnO1xuaW1wb3J0IHsgZm9ybWF0RGF0ZSwgZ2V0RXZhbHVhdGVkT3JkZXJCeSB9IGZyb20gJy4vdmFyaWFibGVzLnV0aWxzJztcblxuZGVjbGFyZSBjb25zdCBfO1xuXG5leHBvcnQgY2xhc3MgTGl2ZVZhcmlhYmxlVXRpbHMge1xuXG4gICAgc3RhdGljIGlzQ29tcG9zaXRlS2V5KHByaW1hcnlLZXkpIHtcbiAgICAgICAgcmV0dXJuICFwcmltYXJ5S2V5IHx8IChwcmltYXJ5S2V5ICYmICghcHJpbWFyeUtleS5sZW5ndGggfHwgcHJpbWFyeUtleS5sZW5ndGggPiAxKSk7XG4gICAgfVxuXG4gICAgc3RhdGljIGlzTm9QcmltYXJ5S2V5KHByaW1hcnlLZXkpIHtcbiAgICAgICAgcmV0dXJuICghcHJpbWFyeUtleSB8fCAocHJpbWFyeUtleSAmJiAhcHJpbWFyeUtleS5sZW5ndGgpKTtcbiAgICB9XG5cbiAgICAvLyBHZW5lcmF0ZSB0aGUgVVJMIGJhc2VkIG9uIHRoZSBwcmltYXJ5IGtleXMgYW5kIHRoZWlyIHZhbHVlc1xuICAgIHN0YXRpYyBnZXRDb21wb3NpdGVJRFVSTChwcmltYXJ5S2V5c0RhdGEpIHtcbiAgICAgICAgbGV0IGNvbXBvc2l0ZUlkID0gJyc7XG4gICAgICAgIC8vICBMb29wIG92ZXIgdGhlICdjb21wb3NpdGVLZXlzRGF0YScgYW5kIGNvbnN0cnVjdCB0aGUgJ2NvbXBvc2l0ZUlkJy5cbiAgICAgICAgXy5mb3JFYWNoKHByaW1hcnlLZXlzRGF0YSwgKHBhcmFtVmFsdWUsIHBhcmFtTmFtZSkgPT4ge1xuICAgICAgICAgICAgY29tcG9zaXRlSWQgKz0gcGFyYW1OYW1lICsgJz0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHBhcmFtVmFsdWUpICsgJyYnO1xuICAgICAgICB9KTtcbiAgICAgICAgY29tcG9zaXRlSWQgPSBjb21wb3NpdGVJZC5zbGljZSgwLCAtMSk7XG4gICAgICAgIHJldHVybiBjb21wb3NpdGVJZDtcbiAgICB9XG5cblxuICAgIC8vIENoZWNrIGlmIHRhYmxlIGhhcyBibG9iIGNvbHVtblxuICAgIHN0YXRpYyBoYXNCbG9iKHZhcmlhYmxlKSB7XG4gICAgICAgIHJldHVybiBfLmZpbmQoXy5nZXQodmFyaWFibGUsIFsncHJvcGVydGllc01hcCcsICdjb2x1bW5zJ10pLCB7J3R5cGUnOiAnYmxvYid9KTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0UHJpbWFyeUtleSh2YXJpYWJsZSkge1xuICAgICAgICBpZiAoIXZhcmlhYmxlLnByb3BlcnRpZXNNYXApIHtcbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh2YXJpYWJsZS5wcm9wZXJ0aWVzTWFwLnByaW1hcnlGaWVsZHMpIHtcbiAgICAgICAgICAgIHJldHVybiB2YXJpYWJsZS5wcm9wZXJ0aWVzTWFwLnByaW1hcnlGaWVsZHM7XG4gICAgICAgIH1cbiAgICAgICAgLypPbGQgcHJvamVjdHMgZG8gbm90IGhhdmUgcHJpbWFyeSBmaWVsZHMuIEdldCBwcmltYXJ5IGtleSBmcm9tIHRoZSBjb2x1bW5zKi9cbiAgICAgICAgY29uc3QgcHJpbWFyeUtleSA9IFtdO1xuICAgICAgICAvKkxvb3AgdGhyb3VnaCB0aGUgcHJvcGVydGllc01hcCBhbmQgZ2V0IHRoZSBwcmltYXJ5IGtleSBjb2x1bW4uKi9cbiAgICAgICAgXy5mb3JFYWNoKHZhcmlhYmxlLnByb3BlcnRpZXNNYXAuY29sdW1ucywgKGluZGV4LCBjb2x1bW4pID0+IHtcbiAgICAgICAgICAgIGlmIChjb2x1bW4uaXNQcmltYXJ5S2V5KSB7XG4gICAgICAgICAgICAgICAgaWYgKGNvbHVtbi5pc1JlbGF0ZWQgJiYgKCFfLmluY2x1ZGVzKGNvbHVtbi5yZWxhdGVkRmllbGROYW1lLCBwcmltYXJ5S2V5KSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJpbWFyeUtleS5wdXNoKGNvbHVtbi5yZWxhdGVkRmllbGROYW1lKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCFfLmluY2x1ZGVzKGNvbHVtbi5maWVsZE5hbWUsIHByaW1hcnlLZXkpKSB7XG4gICAgICAgICAgICAgICAgICAgIHByaW1hcnlLZXkucHVzaChjb2x1bW4uZmllbGROYW1lKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gcHJpbWFyeUtleTtcbiAgICB9XG5cbiAgICAvLyAgQ29uc3RydWN0IHRoZSBVUkwgZm9yIGJsb2IgY29sdW1ucyBhbmQgc2V0IGl0IGluIHRoZSBkYXRhLCBzbyB0aGF0IHdpZGdldHMgY2FuIHVzZSB0aGlzXG4gICAgc3RhdGljIHByb2Nlc3NCbG9iQ29sdW1ucyhyZXNwb25zZURhdGEsIHZhcmlhYmxlKSB7XG4gICAgICAgIGlmICghcmVzcG9uc2VEYXRhKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgYmxvYkNvbHMgPSBfLm1hcChfLmZpbHRlcih2YXJpYWJsZS5wcm9wZXJ0aWVzTWFwLmNvbHVtbnMsIHsndHlwZSc6ICdibG9iJ30pLCAnZmllbGROYW1lJyksXG4gICAgICAgICAgICBkZXBsb3llZFVybCA9IF8udHJpbSgkcm9vdFNjb3BlLnByb2plY3QuZGVwbG95ZWRVcmwpO1xuICAgICAgICBsZXQgaHJlZiA9ICcnLFxuICAgICAgICAgICAgcHJpbWFyeUtleXM7XG5cbiAgICAgICAgaWYgKF8uaXNFbXB0eShibG9iQ29scykpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaGFzQ29yZG92YSgpKSB7XG4gICAgICAgICAgICAgaHJlZiArPSBfLmVuZHNXaXRoKGRlcGxveWVkVXJsLCAnLycpID8gZGVwbG95ZWRVcmwgOiBkZXBsb3llZFVybCArICcvJztcbiAgICAgICAgfVxuICAgICAgICBocmVmICs9ICgodmFyaWFibGUuX3ByZWZhYk5hbWUgIT09ICcnICYmIHZhcmlhYmxlLl9wcmVmYWJOYW1lICE9PSB1bmRlZmluZWQpID8gJ3ByZWZhYnMvJyArIHZhcmlhYmxlLl9wcmVmYWJOYW1lIDogJ3NlcnZpY2VzJykgKyAnLycgKyB2YXJpYWJsZS5saXZlU291cmNlICsgJy8nICsgdmFyaWFibGUudHlwZSArICcvJztcbiAgICAgICAgcHJpbWFyeUtleXMgPSB2YXJpYWJsZS5wcm9wZXJ0aWVzTWFwLnByaW1hcnlGaWVsZHMgfHwgdmFyaWFibGUucHJvcGVydGllc01hcC5wcmltYXJ5S2V5cztcbiAgICAgICAgXy5mb3JFYWNoKHJlc3BvbnNlRGF0YSwgZGF0YSA9PiB7XG4gICAgICAgICAgICBpZiAoZGF0YSkge1xuICAgICAgICAgICAgICAgIF8uZm9yRWFjaChibG9iQ29scywgY29sID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29tcG9zaXRlS2V5c0RhdGEgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGRhdGFbY29sXSA9PT0gbnVsbCB8fCAhXy5pc0VtcHR5KF8udHJpbShkYXRhW2NvbF0pKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmIChMaXZlVmFyaWFibGVVdGlscy5pc0NvbXBvc2l0ZUtleShwcmltYXJ5S2V5cykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByaW1hcnlLZXlzLmZvckVhY2goa2V5ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb3NpdGVLZXlzRGF0YVtrZXldID0gZGF0YVtrZXldO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhW2NvbF0gPSBocmVmICsgJ2NvbXBvc2l0ZS1pZC9jb250ZW50LycgKyBjb2wgKyAnPycgKyBMaXZlVmFyaWFibGVVdGlscy5nZXRDb21wb3NpdGVJRFVSTChjb21wb3NpdGVLZXlzRGF0YSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhW2NvbF0gPSBocmVmICsgZGF0YVtfLmpvaW4ocHJpbWFyeUtleXMpXSArICcvY29udGVudC8nICsgY29sO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHN0YXRpYyBnZXRIaWJlcm5hdGVPclNxbFR5cGUodmFyaWFibGUsIGZpZWxkTmFtZSwgdHlwZSwgZW50aXR5TmFtZT86IHN0cmluZykge1xuICAgICAgICBjb25zdCBjb2x1bW5zID0gdmFyaWFibGUucHJvcGVydGllc01hcC5jb2x1bW5zO1xuICAgICAgICBsZXQgY29sdW1uLFxuICAgICAgICAgICAgcmVsYXRlZENvbHMsXG4gICAgICAgICAgICByZWxhdGVkQ29sO1xuICAgICAgICBpZiAoXy5pbmNsdWRlcyhmaWVsZE5hbWUsICcuJykpIHtcbiAgICAgICAgICAgIGNvbHVtbiA9IF8uZmluZChjb2x1bW5zLCBjb2wgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBjb2wuZmllbGROYW1lID09PSBmaWVsZE5hbWUuc3BsaXQoJy4nKVswXTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmVsYXRlZENvbHMgPSBjb2x1bW4gJiYgY29sdW1uLmNvbHVtbnM7XG4gICAgICAgICAgICByZWxhdGVkQ29sID0gXy5maW5kKHJlbGF0ZWRDb2xzLCBjb2wgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBjb2wuZmllbGROYW1lID09PSBmaWVsZE5hbWUuc3BsaXQoJy4nKVsxXTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHJlbGF0ZWRDb2wgJiYgcmVsYXRlZENvbFt0eXBlXTtcbiAgICAgICAgfVxuICAgICAgICBjb2x1bW4gPSBfLmZpbmQoY29sdW1ucywgY29sID0+IHtcbiAgICAgICAgICAgIHJldHVybiBjb2wuZmllbGROYW1lID09PSBmaWVsZE5hbWUgfHwgY29sLnJlbGF0ZWRDb2x1bW5OYW1lID09PSBmaWVsZE5hbWU7XG4gICAgICAgIH0pO1xuICAgICAgICBpZiAoIWNvbHVtbiAmJiBlbnRpdHlOYW1lKSB7XG4gICAgICAgICAgICBjb25zdCBlbnRpdHkgPSBfLmZpbmQoY29sdW1ucywgY29sID0+IGNvbC5yZWxhdGVkRW50aXR5TmFtZSA9PT0gZW50aXR5TmFtZSk7XG4gICAgICAgICAgICBjb2x1bW4gPSBfLmZpbmQoZW50aXR5LmNvbHVtbnMsIGNvbCA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbC5maWVsZE5hbWUgPT09IGZpZWxkTmFtZSB8fCBjb2wucmVsYXRlZENvbHVtbk5hbWUgPT09IGZpZWxkTmFtZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb2x1bW4gJiYgY29sdW1uW3R5cGVdO1xuICAgIH1cblxuICAgIC8qRnVuY3Rpb24gdG8gZ2V0IHRoZSBzcWxUeXBlIG9mIHRoZSBzcGVjaWZpZWQgZmllbGQuKi9cbiAgICBzdGF0aWMgZ2V0U3FsVHlwZSh2YXJpYWJsZSwgZmllbGROYW1lLCBlbnRpdHlOYW1lPzogc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiBMaXZlVmFyaWFibGVVdGlscy5nZXRIaWJlcm5hdGVPclNxbFR5cGUodmFyaWFibGUsIGZpZWxkTmFtZSwgJ3R5cGUnLCBlbnRpdHlOYW1lKTtcbiAgICB9XG5cbiAgICAvKkZ1bmN0aW9uIHRvIGNoZWNrIGlmIHRoZSBzcGVjaWZpZWQgZmllbGQgaGFzIGEgb25lLXRvLW1hbnkgcmVsYXRpb24gb3Igbm90LiovXG4gICAgc3RhdGljIGlzUmVsYXRlZEZpZWxkTWFueSh2YXJpYWJsZSwgZmllbGROYW1lKSB7XG4gICAgICAgIGNvbnN0IGNvbHVtbnMgPSB2YXJpYWJsZS5wcm9wZXJ0aWVzTWFwLmNvbHVtbnMsXG4gICAgICAgICAgICBjb2x1bW5zQ291bnQgPSBjb2x1bW5zLmxlbmd0aDtcbiAgICAgICAgbGV0IGluZGV4LFxuICAgICAgICAgICAgY29sdW1uO1xuICAgICAgICAvKkxvb3AgdGhyb3VnaCB0aGUgY29sdW1ucyBvZiB0aGUgbGl2ZVZhcmlhYmxlKi9cbiAgICAgICAgZm9yIChpbmRleCA9IDA7IGluZGV4IDwgY29sdW1uc0NvdW50OyBpbmRleCArPSAxKSB7XG4gICAgICAgICAgICBjb2x1bW4gPSBjb2x1bW5zW2luZGV4XTtcbiAgICAgICAgICAgIC8qSWYgdGhlIHNwZWNpZmllZCBmaWVsZCBpcyBmb3VuZCBpbiB0aGUgY29sdW1ucyBvZiB0aGUgdmFyaWFibGUsXG4gICAgICAgICAgICAqIHRoZW4gaXQgaGFzIGEgbWFueS10by1vbmUgcmVsYXRpb24uKi9cbiAgICAgICAgICAgIGlmIChjb2x1bW4uZmllbGROYW1lID09PSBmaWVsZE5hbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgc3RhdGljIGlzU3RyaW5nVHlwZSh0eXBlKSB7XG4gICAgICAgIHJldHVybiBfLmluY2x1ZGVzKFsndGV4dCcsICdzdHJpbmcnXSwgXy50b0xvd2VyKHR5cGUpKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0U1FMRmllbGRUeXBlKHZhcmlhYmxlLCBvcHRpb25zKSB7XG4gICAgICAgIGlmIChfLmluY2x1ZGVzKFsndGltZXN0YW1wJywgJ2RhdGV0aW1lJywgJ2RhdGUnXSwgb3B0aW9ucy50eXBlKSkge1xuICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnMudHlwZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gTGl2ZVZhcmlhYmxlVXRpbHMuZ2V0U3FsVHlwZSh2YXJpYWJsZSwgb3B0aW9ucy5maWVsZE5hbWUpIHx8IG9wdGlvbnMudHlwZTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0QXR0cmlidXRlTmFtZSh2YXJpYWJsZSwgZmllbGROYW1lKSB7XG4gICAgICAgIGxldCBhdHRyTmFtZSA9IGZpZWxkTmFtZTtcbiAgICAgICAgdmFyaWFibGUucHJvcGVydGllc01hcC5jb2x1bW5zLmZvckVhY2goY29sdW1uID0+IHtcbiAgICAgICAgICAgIGlmIChjb2x1bW4uZmllbGROYW1lID09PSBmaWVsZE5hbWUgJiYgY29sdW1uLmlzUmVsYXRlZCkge1xuICAgICAgICAgICAgICAgIGF0dHJOYW1lID0gY29sdW1uLnJlbGF0ZWRGaWVsZE5hbWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gYXR0ck5hbWU7XG4gICAgfVxuXG4gICAgc3RhdGljIGdldEZpbHRlckNvbmRpdGlvbihmaWx0ZXJDb25kaXRpb24pIHtcbiAgICAgICAgaWYgKF8uaW5jbHVkZXMoREJfQ09OU1RBTlRTLkRBVEFCQVNFX1JBTkdFX01BVENIX01PREVTLCBmaWx0ZXJDb25kaXRpb24pKSB7XG4gICAgICAgICAgICByZXR1cm4gZmlsdGVyQ29uZGl0aW9uO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBEQl9DT05TVEFOVFMuREFUQUJBU0VfTUFUQ0hfTU9ERVNbJ2V4YWN0J107XG4gICAgfVxuXG4gICAgc3RhdGljIGdldEZpbHRlck9wdGlvbih2YXJpYWJsZSwgZmllbGRPcHRpb25zLCBvcHRpb25zKSB7XG4gICAgICAgIGxldCBhdHRyaWJ1dGVOYW1lLFxuICAgICAgICAgICAgZmllbGRWYWx1ZSA9IGZpZWxkT3B0aW9ucy52YWx1ZSxcbiAgICAgICAgICAgIGZpbHRlck9wdGlvbixcbiAgICAgICAgICAgIGZpbHRlckNvbmRpdGlvbjtcblxuICAgICAgICBjb25zdCBtYXRjaE1vZGVzID0gREJfQ09OU1RBTlRTLkRBVEFCQVNFX01BVENIX01PREVTLFxuICAgICAgICAgICAgZmllbGROYW1lID0gZmllbGRPcHRpb25zLmZpZWxkTmFtZSxcbiAgICAgICAgICAgIGZpZWxkUmVxdWlyZWQgPSBmaWVsZE9wdGlvbnMucmVxdWlyZWQgfHwgZmFsc2UsXG4gICAgICAgICAgICBmaWVsZFR5cGUgPSBMaXZlVmFyaWFibGVVdGlscy5nZXRTUUxGaWVsZFR5cGUodmFyaWFibGUsIGZpZWxkT3B0aW9ucyk7XG5cbiAgICAgICAgZmlsdGVyQ29uZGl0aW9uID0gbWF0Y2hNb2Rlc1tmaWVsZE9wdGlvbnMubWF0Y2hNb2RlXSB8fCBtYXRjaE1vZGVzW2ZpZWxkT3B0aW9ucy5maWx0ZXJDb25kaXRpb25dIHx8IGZpZWxkT3B0aW9ucy5maWx0ZXJDb25kaXRpb247XG5cbiAgICAgICAgZmllbGRPcHRpb25zLnR5cGUgPSBmaWVsZFR5cGU7XG4gICAgICAgIC8qIGlmIHRoZSBmaWVsZCB2YWx1ZSBpcyBhbiBvYmplY3QoY29tcGxleCB0eXBlKSwgbG9vcCBvdmVyIGVhY2ggZmllbGQgaW5zaWRlIGFuZCBwdXNoIG9ubHkgZmlyc3QgbGV2ZWwgZmllbGRzICovXG4gICAgICAgIGlmIChfLmlzT2JqZWN0KGZpZWxkVmFsdWUpICYmICFfLmlzQXJyYXkoZmllbGRWYWx1ZSkpIHtcbiAgICAgICAgICAgIGNvbnN0IGZpcnN0TGV2ZWxWYWx1ZXMgPSBbXTtcbiAgICAgICAgICAgIF8uZm9yRWFjaChmaWVsZFZhbHVlLCAoc3ViRmllbGRWYWx1ZSwgc3ViRmllbGROYW1lKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHN1YkZpZWxkVmFsdWUgJiYgIV8uaXNPYmplY3Qoc3ViRmllbGRWYWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgZmlyc3RMZXZlbFZhbHVlcy5wdXNoKGZpZWxkTmFtZSArICcuJyArIHN1YkZpZWxkTmFtZSArICc9JyArIHN1YkZpZWxkVmFsdWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIGZpcnN0TGV2ZWxWYWx1ZXM7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoXy5pbmNsdWRlcyhEQl9DT05TVEFOVFMuREFUQUJBU0VfRU1QVFlfTUFUQ0hfTU9ERVMsIGZpbHRlckNvbmRpdGlvbikpIHtcbiAgICAgICAgICAgIGF0dHJpYnV0ZU5hbWUgPSBMaXZlVmFyaWFibGVVdGlscy5nZXRBdHRyaWJ1dGVOYW1lKHZhcmlhYmxlLCBmaWVsZE5hbWUpO1xuICAgICAgICAgICAgLy8gRm9yIG5vbiBzdHJpbmcgdHlwZXMgZW1wdHkgbWF0Y2ggbW9kZXMgYXJlIG5vdCBzdXBwb3J0ZWQsIHNvIGNvbnZlcnQgdGhlbSB0byBudWxsIG1hdGNoIG1vZGVzLlxuICAgICAgICAgICAgaWYgKGZpZWxkVHlwZSAmJiAhTGl2ZVZhcmlhYmxlVXRpbHMuaXNTdHJpbmdUeXBlKGZpZWxkVHlwZSkpIHtcbiAgICAgICAgICAgICAgICBmaWx0ZXJDb25kaXRpb24gPSBEQl9DT05TVEFOVFMuREFUQUJBU0VfTlVMTF9FTVBUWV9NQVRDSFtmaWx0ZXJDb25kaXRpb25dO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZmlsdGVyT3B0aW9uID0ge1xuICAgICAgICAgICAgICAgICdhdHRyaWJ1dGVOYW1lJzogYXR0cmlidXRlTmFtZSxcbiAgICAgICAgICAgICAgICAnYXR0cmlidXRlVmFsdWUnOiAnJyxcbiAgICAgICAgICAgICAgICAnYXR0cmlidXRlVHlwZSc6IF8udG9VcHBlcihmaWVsZFR5cGUpLFxuICAgICAgICAgICAgICAgICdmaWx0ZXJDb25kaXRpb24nOiBmaWx0ZXJDb25kaXRpb24sXG4gICAgICAgICAgICAgICAgJ3JlcXVpcmVkJzogZmllbGRSZXF1aXJlZFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGlmIChvcHRpb25zLnNlYXJjaFdpdGhRdWVyeSkge1xuICAgICAgICAgICAgICAgIGZpbHRlck9wdGlvbi5pc1ZhcmlhYmxlRmlsdGVyID0gZmllbGRPcHRpb25zLmlzVmFyaWFibGVGaWx0ZXI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmlsdGVyT3B0aW9uO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGlzRGVmaW5lZChmaWVsZFZhbHVlKSAmJiBmaWVsZFZhbHVlICE9PSBudWxsICYmIGZpZWxkVmFsdWUgIT09ICcnKSB7XG4gICAgICAgICAgICAvKkJhc2VkIG9uIHRoZSBzcWxUeXBlIG9mIHRoZSBmaWVsZCwgZm9ybWF0IHRoZSB2YWx1ZSAmIHNldCB0aGUgZmlsdGVyIGNvbmRpdGlvbi4qL1xuICAgICAgICAgICAgaWYgKGZpZWxkVHlwZSkge1xuICAgICAgICAgICAgICAgIHN3aXRjaCAoZmllbGRUeXBlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2ludGVnZXInOlxuICAgICAgICAgICAgICAgICAgICAgICAgZmllbGRWYWx1ZSA9IF8uaXNBcnJheShmaWVsZFZhbHVlKSA/IF8ucmVkdWNlKGZpZWxkVmFsdWUsIChyZXN1bHQsIHZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBwYXJzZUludCh2YWx1ZSwgMTApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghXy5pc05hTih2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2godmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwgW10pIDogcGFyc2VJbnQoZmllbGRWYWx1ZSwgMTApO1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyQ29uZGl0aW9uID0gZmlsdGVyQ29uZGl0aW9uID8gTGl2ZVZhcmlhYmxlVXRpbHMuZ2V0RmlsdGVyQ29uZGl0aW9uKGZpbHRlckNvbmRpdGlvbikgOiBtYXRjaE1vZGVzWydleGFjdCddO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ2RhdGUnOlxuICAgICAgICAgICAgICAgICAgICBjYXNlICdkYXRldGltZSc6XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3RpbWVzdGFtcCc6XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWVsZFZhbHVlID0gZm9ybWF0RGF0ZShmaWVsZFZhbHVlLCBmaWVsZFR5cGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyQ29uZGl0aW9uID0gZmlsdGVyQ29uZGl0aW9uID8gTGl2ZVZhcmlhYmxlVXRpbHMuZ2V0RmlsdGVyQ29uZGl0aW9uKGZpbHRlckNvbmRpdGlvbikgOiBtYXRjaE1vZGVzWydleGFjdCddO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ3RleHQnOlxuICAgICAgICAgICAgICAgICAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKF8uaXNBcnJheShmaWVsZFZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbHRlckNvbmRpdGlvbiA9IF8uaW5jbHVkZXMoW21hdGNoTW9kZXNbJ2luJ10sIG1hdGNoTW9kZXNbJ25vdGluJ11dLCBmaWx0ZXJDb25kaXRpb24pID8gZmlsdGVyQ29uZGl0aW9uIDogbWF0Y2hNb2Rlc1snZXhhY3QnXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsdGVyQ29uZGl0aW9uID0gZmlsdGVyQ29uZGl0aW9uIHx8IG1hdGNoTW9kZXNbJ2FueXdoZXJlaWdub3JlY2FzZSddO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXJDb25kaXRpb24gPSBmaWx0ZXJDb25kaXRpb24gPyBMaXZlVmFyaWFibGVVdGlscy5nZXRGaWx0ZXJDb25kaXRpb24oZmlsdGVyQ29uZGl0aW9uKSA6IG1hdGNoTW9kZXNbJ2V4YWN0J107XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGZpbHRlckNvbmRpdGlvbiA9IF8uaXNTdHJpbmcoZmllbGRWYWx1ZSkgPyBtYXRjaE1vZGVzWydhbnl3aGVyZWlnbm9yZWNhc2UnXSA6IG1hdGNoTW9kZXNbJ2V4YWN0J107XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBhdHRyaWJ1dGVOYW1lID0gTGl2ZVZhcmlhYmxlVXRpbHMuZ2V0QXR0cmlidXRlTmFtZSh2YXJpYWJsZSwgZmllbGROYW1lKTtcbiAgICAgICAgICAgIGZpbHRlck9wdGlvbiA9IHtcbiAgICAgICAgICAgICAgICAnYXR0cmlidXRlTmFtZSc6IGF0dHJpYnV0ZU5hbWUsXG4gICAgICAgICAgICAgICAgJ2F0dHJpYnV0ZVZhbHVlJzogZmllbGRWYWx1ZSxcbiAgICAgICAgICAgICAgICAnYXR0cmlidXRlVHlwZSc6IF8udG9VcHBlcihmaWVsZFR5cGUpLFxuICAgICAgICAgICAgICAgICdmaWx0ZXJDb25kaXRpb24nOiBmaWx0ZXJDb25kaXRpb24sXG4gICAgICAgICAgICAgICAgJ3JlcXVpcmVkJzogZmllbGRSZXF1aXJlZFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGlmIChvcHRpb25zLnNlYXJjaFdpdGhRdWVyeSkge1xuICAgICAgICAgICAgICAgIGZpbHRlck9wdGlvbi5pc1ZhcmlhYmxlRmlsdGVyID0gZmllbGRPcHRpb25zLmlzVmFyaWFibGVGaWx0ZXI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmlsdGVyT3B0aW9uO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3RhdGljIGdldEZpbHRlck9wdGlvbnModmFyaWFibGUsIGZpbHRlckZpZWxkcywgb3B0aW9ucykge1xuICAgICAgICBsZXQgZmlsdGVyT3B0aW9ucyA9IFtdO1xuICAgICAgICBfLmVhY2goZmlsdGVyRmllbGRzLCAoZmllbGRPcHRpb25zKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBmaWx0ZXJPcHRpb24gPSBMaXZlVmFyaWFibGVVdGlscy5nZXRGaWx0ZXJPcHRpb24odmFyaWFibGUsIGZpZWxkT3B0aW9ucywgb3B0aW9ucyk7XG4gICAgICAgICAgICBpZiAoIV8uaXNOaWwoZmlsdGVyT3B0aW9uKSkge1xuICAgICAgICAgICAgICAgIGlmIChfLmlzQXJyYXkoZmlsdGVyT3B0aW9uKSkge1xuICAgICAgICAgICAgICAgICAgICBmaWx0ZXJPcHRpb25zID0gZmlsdGVyT3B0aW9ucy5jb25jYXQoZmlsdGVyT3B0aW9uKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBmaWx0ZXJPcHRpb25zLnB1c2goZmlsdGVyT3B0aW9uKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gZmlsdGVyT3B0aW9ucztcbiAgICB9XG5cbiAgICAvLyBXcmFwIHRoZSBmaWVsZCBuYW1lIGFuZCB2YWx1ZSBpbiBsb3dlcigpIGluIGlnbm9yZSBjYXNlIHNjZW5hcmlvXG4gICAgLy8gVE9ETzogQ2hhbmdlIHRoZSBmdW5jdGlvbiBuYW1lIHRvIHJlcHJlc2VudCB0aGUgYWRkZWQgZnVuY3Rpb25hbGl0eSBvZiBpZGVudGlmaWVycyBmb3IgZGF0ZXRpbWUsIHRpbWVzdGFtcCBhbmQgZmxvYXQgdHlwZXMuIFByZXZpb3VzbHkgb25seSBsb3dlciB3YXMgd2FyYXBwZWQuXG4gICAgc3RhdGljIHdyYXBJbkxvd2VyQ2FzZSh2YWx1ZSwgb3B0aW9ucywgaWdub3JlQ2FzZSwgaXNGaWVsZD8pIHtcbiAgICAgICAgY29uc3QgdHlwZSA9IF8udG9Mb3dlcihvcHRpb25zLmF0dHJpYnV0ZVR5cGUpO1xuICAgICAgICBpZiAoIWlzRmllbGQpIHtcbiAgICAgICAgICAgIC8vIFdyYXAgdGhlIGlkZW50aWZpZXJzIGZvciBkYXRldGltZSwgdGltZXN0YW1wIGFuZCBmbG9hdCB0eXBlcy4gV3JhcHByaW5nIGlzIG5vdCByZXF1aXJlZCBmb3IgZmllbGRzLlxuICAgICAgICAgICAgaWYgKHR5cGUgPT09ICdkYXRldGltZScpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJ3dtX2R0KCcgKyB2YWx1ZSArICcpJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0eXBlID09PSAndGltZXN0YW1wJykge1xuICAgICAgICAgICAgICAgIHJldHVybiAnd21fdHMoJyArIHZhbHVlICsgJyknO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHR5cGUgPT09ICdmbG9hdCcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJ3dtX2Zsb2F0KCcgKyB2YWx1ZSArICcpJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0eXBlID09PSAnYm9vbGVhbicpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJ3dtX2Jvb2woJyArIHZhbHVlICsgJyknO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIElmIGlnbm9yZSBjYXNlIGlzIHRydWUgYW5kIHR5cGUgaXMgc3RyaW5nLyB0ZXh0IGFuZCBtYXRjaCBtb2RlIGlzIHN0cmluZyB0eXBlLCB3cmFwIGluIGxvd2VyKClcbiAgICAgICAgaWYgKGlnbm9yZUNhc2UgJiYgKCF0eXBlIHx8IExpdmVWYXJpYWJsZVV0aWxzLmlzU3RyaW5nVHlwZSh0eXBlKSkgJiYgXy5pbmNsdWRlcyhEQl9DT05TVEFOVFMuREFUQUJBU0VfU1RSSU5HX01PREVTLCBvcHRpb25zLmZpbHRlckNvbmRpdGlvbikpIHtcbiAgICAgICAgICAgIHJldHVybiAnbG93ZXIoJyArIHZhbHVlICsgJyknO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZW5jb2RlQW5kQWRkUXVvdGVzKHZhbHVlLCB0eXBlLCBza2lwRW5jb2RlKSB7XG4gICAgICAgIGxldCBlbmNvZGVkVmFsdWUgPSBza2lwRW5jb2RlID8gdmFsdWUgOiBlbmNvZGVVUklDb21wb25lbnQodmFsdWUpO1xuICAgICAgICB0eXBlID0gXy50b0xvd2VyKHR5cGUpO1xuICAgICAgICBlbmNvZGVkVmFsdWUgPSBfLnJlcGxhY2UoZW5jb2RlZFZhbHVlLCAvJy9nLCAnXFwnXFwnJyk7XG4gICAgICAgIC8vIEZvciBudW1iZXIgdHlwZXMsIGRvbid0IHdyYXAgdGhlIHZhbHVlIGluIHF1b3Rlc1xuICAgICAgICBpZiAoKGlzTnVtYmVyVHlwZSh0eXBlKSAmJiB0eXBlICE9PSAnZmxvYXQnKSkge1xuICAgICAgICAgICAgcmV0dXJuIGVuY29kZWRWYWx1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gJ1xcJycgKyBlbmNvZGVkVmFsdWUgKyAnXFwnJztcbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0UGFyYW1WYWx1ZSh2YWx1ZSwgb3B0aW9ucywgaWdub3JlQ2FzZSwgc2tpcEVuY29kZSkge1xuICAgICAgICBsZXQgcGFyYW07XG4gICAgICAgIGNvbnN0IGZpbHRlckNvbmRpdGlvbiA9IG9wdGlvbnMuZmlsdGVyQ29uZGl0aW9uLFxuICAgICAgICAgICAgZGJNb2RlcyA9IERCX0NPTlNUQU5UUy5EQVRBQkFTRV9NQVRDSF9NT0RFUyxcbiAgICAgICAgICAgIHR5cGUgPSBvcHRpb25zLmF0dHJpYnV0ZVR5cGU7XG4gICAgICAgIGlmIChfLmluY2x1ZGVzKERCX0NPTlNUQU5UUy5EQVRBQkFTRV9FTVBUWV9NQVRDSF9NT0RFUywgZmlsdGVyQ29uZGl0aW9uKSkge1xuICAgICAgICAgICAgLy8gRm9yIGVtcHR5IG1hdGNobW9kZXMsIG5vIHZhbHVlIGlzIHJlcXVpcmVkXG4gICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgICAgIH1cbiAgICAgICAgc3dpdGNoIChmaWx0ZXJDb25kaXRpb24pIHtcbiAgICAgICAgICAgIGNhc2UgZGJNb2Rlcy5zdGFydGlnbm9yZWNhc2U6XG4gICAgICAgICAgICBjYXNlIGRiTW9kZXMuc3RhcnQ6XG4gICAgICAgICAgICAgICAgcGFyYW0gPSBMaXZlVmFyaWFibGVVdGlscy5lbmNvZGVBbmRBZGRRdW90ZXModmFsdWUgKyAnJScsIHR5cGUsIHNraXBFbmNvZGUpO1xuICAgICAgICAgICAgICAgIHBhcmFtID0gTGl2ZVZhcmlhYmxlVXRpbHMud3JhcEluTG93ZXJDYXNlKHBhcmFtLCBvcHRpb25zLCBpZ25vcmVDYXNlKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgZGJNb2Rlcy5lbmRpZ25vcmVjYXNlOlxuICAgICAgICAgICAgY2FzZSBkYk1vZGVzLmVuZDpcbiAgICAgICAgICAgICAgICBwYXJhbSA9IExpdmVWYXJpYWJsZVV0aWxzLmVuY29kZUFuZEFkZFF1b3RlcygnJScgKyB2YWx1ZSwgdHlwZSwgc2tpcEVuY29kZSk7XG4gICAgICAgICAgICAgICAgcGFyYW0gPSBMaXZlVmFyaWFibGVVdGlscy53cmFwSW5Mb3dlckNhc2UocGFyYW0sIG9wdGlvbnMsIGlnbm9yZUNhc2UpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBkYk1vZGVzLmFueXdoZXJlaWdub3JlY2FzZTpcbiAgICAgICAgICAgIGNhc2UgZGJNb2Rlcy5hbnl3aGVyZTpcbiAgICAgICAgICAgICAgICBwYXJhbSA9IExpdmVWYXJpYWJsZVV0aWxzLmVuY29kZUFuZEFkZFF1b3RlcygnJScgKyB2YWx1ZSArICclJywgdHlwZSwgc2tpcEVuY29kZSk7XG4gICAgICAgICAgICAgICAgcGFyYW0gPSBMaXZlVmFyaWFibGVVdGlscy53cmFwSW5Mb3dlckNhc2UocGFyYW0sIG9wdGlvbnMsIGlnbm9yZUNhc2UpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBkYk1vZGVzLmJldHdlZW46XG4gICAgICAgICAgICAgICAgcGFyYW0gPSBfLmpvaW4oXy5tYXAodmFsdWUsIHZhbCA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBMaXZlVmFyaWFibGVVdGlscy53cmFwSW5Mb3dlckNhc2UoTGl2ZVZhcmlhYmxlVXRpbHMuZW5jb2RlQW5kQWRkUXVvdGVzKHZhbCwgdHlwZSwgc2tpcEVuY29kZSksIG9wdGlvbnMsIGlnbm9yZUNhc2UpO1xuICAgICAgICAgICAgICAgIH0pLCAnIGFuZCAnKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgZGJNb2Rlcy5pbjpcbiAgICAgICAgICAgIGNhc2UgZGJNb2Rlcy5ub3RpbjpcbiAgICAgICAgICAgICAgICBwYXJhbSA9IF8uam9pbihfLm1hcCh2YWx1ZSwgdmFsID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIExpdmVWYXJpYWJsZVV0aWxzLndyYXBJbkxvd2VyQ2FzZShMaXZlVmFyaWFibGVVdGlscy5lbmNvZGVBbmRBZGRRdW90ZXModmFsLCB0eXBlLCBza2lwRW5jb2RlKSwgb3B0aW9ucywgaWdub3JlQ2FzZSk7XG4gICAgICAgICAgICAgICAgfSksICcsICcpO1xuICAgICAgICAgICAgICAgIHBhcmFtID0gJygnICsgcGFyYW0gKyAnKSc7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAvKmNhc2UgZGJNb2Rlcy5leGFjdGlnbm9yZWNhc2U6XG4gICAgICAgICAgICBjYXNlIGRiTW9kZXMuZXhhY3Q6XG4gICAgICAgICAgICBjYXNlIGRiTW9kZXMubm90ZXF1YWxzOlxuICAgICAgICAgICAgVGhlIGFib3ZlIHRocmVlIGNhc2VzIHdpbGwgYmUgaGFuZGxlZCBieSBkZWZhdWx0Ki9cbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgcGFyYW0gPSBMaXZlVmFyaWFibGVVdGlscy5lbmNvZGVBbmRBZGRRdW90ZXModmFsdWUsIHR5cGUsIHNraXBFbmNvZGUpO1xuICAgICAgICAgICAgICAgIHBhcmFtID0gTGl2ZVZhcmlhYmxlVXRpbHMud3JhcEluTG93ZXJDYXNlKHBhcmFtLCBvcHRpb25zLCBpZ25vcmVDYXNlKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaXNEZWZpbmVkKHBhcmFtKSA/IHBhcmFtIDogJyc7XG4gICAgfVxuXG4gICAgc3RhdGljIGdldFNlYXJjaFF1ZXJ5KGZpbHRlck9wdGlvbnMsIG9wZXJhdG9yLCBpZ25vcmVDYXNlLCBza2lwRW5jb2RlPykge1xuICAgICAgICBsZXQgcXVlcnk7XG4gICAgICAgIGNvbnN0IHBhcmFtcyA9IFtdO1xuICAgICAgICBfLmZvckVhY2goZmlsdGVyT3B0aW9ucywgZmllbGRWYWx1ZSA9PiB7XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IGZpZWxkVmFsdWUuYXR0cmlidXRlVmFsdWUsXG4gICAgICAgICAgICAgICAgZGJNb2RlcyA9IERCX0NPTlNUQU5UUy5EQVRBQkFTRV9NQVRDSF9NT0RFUyxcbiAgICAgICAgICAgICAgICBpc1ZhbEFycmF5ID0gXy5pc0FycmF5KHZhbHVlKTtcbiAgICAgICAgICAgIGxldCBmaWVsZE5hbWUgPSBmaWVsZFZhbHVlLmF0dHJpYnV0ZU5hbWUsXG4gICAgICAgICAgICAgICAgZmlsdGVyQ29uZGl0aW9uID0gZmllbGRWYWx1ZS5maWx0ZXJDb25kaXRpb24sXG4gICAgICAgICAgICAgICAgbWF0Y2hNb2RlRXhwcixcbiAgICAgICAgICAgICAgICBwYXJhbVZhbHVlO1xuICAgICAgICAgICAgLy8gSWYgdmFsdWUgaXMgYW4gZW1wdHkgYXJyYXksIGRvIG5vdCBnZW5lcmF0ZSB0aGUgcXVlcnlcbiAgICAgICAgICAgIC8vIElmIHZhbHVlcyBpcyBOYU4gYW5kIG51bWJlciB0eXBlLCBkbyBub3QgZ2VuZXJhdGUgcXVlcnkgZm9yIHRoaXMgZmllbGRcbiAgICAgICAgICAgIGlmICgoaXNWYWxBcnJheSAmJiBfLmlzRW1wdHkodmFsdWUpKSB8fCAoIWlzVmFsQXJyYXkgJiYgaXNOYU4odmFsdWUpICYmIGlzTnVtYmVyVHlwZShmaWVsZFZhbHVlLmF0dHJpYnV0ZVR5cGUpKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpc1ZhbEFycmF5KSB7XG4gICAgICAgICAgICAgICAgLy8gSWYgYXJyYXkgaXMgdmFsdWUgYW5kIG1vZGUgaXMgYmV0d2VlbiwgcGFzcyBiZXR3ZWVuLiBFbHNlIHBhc3MgYXMgaW4gcXVlcnlcbiAgICAgICAgICAgICAgICBmaWx0ZXJDb25kaXRpb24gPSBmaWx0ZXJDb25kaXRpb24gPT09IGRiTW9kZXMuYmV0d2VlbiB8fCBmaWx0ZXJDb25kaXRpb24gPT09IGRiTW9kZXMubm90aW4gPyBmaWx0ZXJDb25kaXRpb24gOiBkYk1vZGVzLmluO1xuICAgICAgICAgICAgICAgIGZpZWxkVmFsdWUuZmlsdGVyQ29uZGl0aW9uID0gZmlsdGVyQ29uZGl0aW9uO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbWF0Y2hNb2RlRXhwciA9IERCX0NPTlNUQU5UUy5EQVRBQkFTRV9NQVRDSF9NT0RFU19XSVRIX1FVRVJZW2ZpbHRlckNvbmRpdGlvbl07XG4gICAgICAgICAgICBwYXJhbVZhbHVlID0gTGl2ZVZhcmlhYmxlVXRpbHMuZ2V0UGFyYW1WYWx1ZSh2YWx1ZSwgZmllbGRWYWx1ZSwgaWdub3JlQ2FzZSwgc2tpcEVuY29kZSk7XG4gICAgICAgICAgICBmaWVsZE5hbWUgPSBMaXZlVmFyaWFibGVVdGlscy53cmFwSW5Mb3dlckNhc2UoZmllbGROYW1lLCBmaWVsZFZhbHVlLCBpZ25vcmVDYXNlLCB0cnVlKTtcbiAgICAgICAgICAgIHBhcmFtcy5wdXNoKHJlcGxhY2UobWF0Y2hNb2RlRXhwciwgW2ZpZWxkTmFtZSwgcGFyYW1WYWx1ZV0pKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHF1ZXJ5ID0gXy5qb2luKHBhcmFtcywgb3BlcmF0b3IpOyAvLyBlbXB0eSBzcGFjZSBhZGRlZCBpbnRlbnRpb25hbGx5IGFyb3VuZCBPUlxuICAgICAgICByZXR1cm4gcXVlcnk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogY3JlYXRpbmcgdGhlIHByb3BlciB2YWx1ZXMgZnJvbSB0aGUgYWN0dWFsIG9iamVjdCBsaWtlIGZvciBiZXR3ZWVuLGluIG1hdGNoTW9kZXMgdmFsdWUgaGFzIHRvIGJlIGFuIGFycmF5IGxpa2UgWzEsMl1cbiAgICAgKiBAcGFyYW0gcnVsZXMgcmVjdXJzaXZlIGZpbHRlcmV4cHJlc3Npb25zIG9iamVjdFxuICAgICAqIEBwYXJhbSB2YXJpYWJsZSB2YXJpYWJsZSBvYmplY3RcbiAgICAgKiBAcGFyYW0gb3B0aW9ucyBvcHRpb25zXG4gICAgICovXG4gICAgc3RhdGljIHByb2Nlc3NGaWx0ZXJGaWVsZHMocnVsZXMsIHZhcmlhYmxlLCBvcHRpb25zKSB7XG4gICAgICAgIF8ucmVtb3ZlKHJ1bGVzLCBydWxlID0+IHtcbiAgICAgICAgICAgIHJldHVybiBydWxlICYmIChfLmlzU3RyaW5nKHJ1bGUudmFsdWUpICYmIHJ1bGUudmFsdWUuaW5kZXhPZignYmluZDonKSA9PT0gMCB8fCAocnVsZS5tYXRjaE1vZGUgPT09ICdiZXR3ZWVuJyA/IChfLmlzU3RyaW5nKHJ1bGUuc2Vjb25kdmFsdWUpICYmIHJ1bGUuc2Vjb25kdmFsdWUuaW5kZXhPZignYmluZDonKSA9PT0gMCkgOiBmYWxzZSkpO1xuICAgICAgICB9KTtcblxuICAgICAgICBfLmZvckVhY2gocnVsZXMsIChydWxlLCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgaWYgKHJ1bGUpIHtcbiAgICAgICAgICAgICAgICBpZiAocnVsZS5ydWxlcykge1xuICAgICAgICAgICAgICAgICAgICBMaXZlVmFyaWFibGVVdGlscy5wcm9jZXNzRmlsdGVyRmllbGRzKHJ1bGUucnVsZXMsIHZhcmlhYmxlLCBvcHRpb25zKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIV8uaXNOdWxsKHJ1bGUudGFyZ2V0KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBydWxlLm1hdGNoTW9kZS50b0xvd2VyQ2FzZSgpID09PSBEQl9DT05TVEFOVFMuREFUQUJBU0VfTUFUQ0hfTU9ERVMuYmV0d2Vlbi50b0xvd2VyQ2FzZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgPyAoXy5pc0FycmF5KHJ1bGUudmFsdWUpID8gcnVsZS52YWx1ZSA6IFtydWxlLnZhbHVlLCBydWxlLnNlY29uZHZhbHVlXSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICA6IChydWxlLm1hdGNoTW9kZS50b0xvd2VyQ2FzZSgpID09PSBEQl9DT05TVEFOVFMuREFUQUJBU0VfTUFUQ0hfTU9ERVMuaW4udG9Mb3dlckNhc2UoKSB8fCBydWxlLm1hdGNoTW9kZS50b0xvd2VyQ2FzZSgpID09PSBEQl9DT05TVEFOVFMuREFUQUJBU0VfTUFUQ0hfTU9ERVMubm90aW4udG9Mb3dlckNhc2UoKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA/IChfLmlzQXJyYXkocnVsZS52YWx1ZSkgPyBydWxlLnZhbHVlIDogKHJ1bGUudmFsdWUgPyBydWxlLnZhbHVlLnNwbGl0KCcsJykubWFwKHZhbCA9PiB2YWwudHJpbSgpKSA6ICcnKSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgOiBydWxlLnZhbHVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bGVzW2luZGV4XSA9IExpdmVWYXJpYWJsZVV0aWxzLmdldEZpbHRlck9wdGlvbih2YXJpYWJsZSwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdmaWVsZE5hbWUnOiBydWxlLnRhcmdldCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAndHlwZSc6IHJ1bGUudHlwZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAndmFsdWUnOiB2YWx1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAncmVxdWlyZWQnOiBydWxlLnJlcXVpcmVkLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdmaWx0ZXJDb25kaXRpb24nOiBydWxlLm1hdGNoTW9kZSB8fCBvcHRpb25zLm1hdGNoTW9kZSB8fCB2YXJpYWJsZS5tYXRjaE1vZGVcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIG9wdGlvbnMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBzdGF0aWMgZ2V0U2VhcmNoRmllbGQoZmllbGRWYWx1ZSwgaWdub3JlQ2FzZSwgc2tpcEVuY29kZSkge1xuICAgICAgICBsZXQgZmllbGROYW1lID0gZmllbGRWYWx1ZS5hdHRyaWJ1dGVOYW1lO1xuICAgICAgICBsZXQgbWF0Y2hNb2RlRXhwcjtcbiAgICAgICAgbGV0IHBhcmFtVmFsdWU7XG4gICAgICAgIGxldCBmaWx0ZXJDb25kaXRpb24gPSBmaWVsZFZhbHVlLmZpbHRlckNvbmRpdGlvbjtcblxuICAgICAgICBjb25zdCB2YWx1ZSA9IGZpZWxkVmFsdWUuYXR0cmlidXRlVmFsdWU7XG4gICAgICAgIGNvbnN0IGlzVmFsQXJyYXkgPSBfLmlzQXJyYXkodmFsdWUpO1xuICAgICAgICBjb25zdCBkYk1vZGVzID0gREJfQ09OU1RBTlRTLkRBVEFCQVNFX01BVENIX01PREVTO1xuXG4gICAgICAgIC8vIElmIHZhbHVlIGlzIGFuIGVtcHR5IGFycmF5LCBkbyBub3QgZ2VuZXJhdGUgdGhlIHF1ZXJ5XG4gICAgICAgIC8vIElmIHZhbHVlcyBpcyBOYU4gYW5kIG51bWJlciB0eXBlLCBkbyBub3QgZ2VuZXJhdGUgcXVlcnkgZm9yIHRoaXMgZmllbGRcbiAgICAgICAgaWYgKChpc1ZhbEFycmF5ICYmIF8uaXNFbXB0eSh2YWx1ZSkpIHx8IChpc1ZhbEFycmF5ICYmIF8uc29tZSh2YWx1ZSwgdmFsID0+IChfLmlzTnVsbCh2YWwpIHx8IF8uaXNOYU4odmFsKSB8fCB2YWwgPT09ICcnKSkpIHx8ICghaXNWYWxBcnJheSAmJiBpc05hTih2YWx1ZSkgJiYgaXNOdW1iZXJUeXBlKGZpZWxkVmFsdWUuYXR0cmlidXRlVHlwZSkpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGlzVmFsQXJyYXkpIHtcbiAgICAgICAgICAgIC8vIElmIGFycmF5IGlzIHZhbHVlIGFuZCBtb2RlIGlzIGJldHdlZW4sIHBhc3MgYmV0d2Vlbi4gRWxzZSBwYXNzIGFzIGluIHF1ZXJ5XG4gICAgICAgICAgICBmaWx0ZXJDb25kaXRpb24gPSBmaWx0ZXJDb25kaXRpb24gPT09IGRiTW9kZXMuYmV0d2VlbiB8fCBmaWx0ZXJDb25kaXRpb24gPT09IGRiTW9kZXMubm90aW4gPyBmaWx0ZXJDb25kaXRpb24gOiBkYk1vZGVzLmluO1xuICAgICAgICAgICAgZmllbGRWYWx1ZS5maWx0ZXJDb25kaXRpb24gPSBmaWx0ZXJDb25kaXRpb247XG4gICAgICAgIH1cbiAgICAgICAgbWF0Y2hNb2RlRXhwciA9IERCX0NPTlNUQU5UUy5EQVRBQkFTRV9NQVRDSF9NT0RFU19XSVRIX1FVRVJZW2ZpbHRlckNvbmRpdGlvbl07XG4gICAgICAgIHBhcmFtVmFsdWUgPSBMaXZlVmFyaWFibGVVdGlscy5nZXRQYXJhbVZhbHVlKHZhbHVlLCBmaWVsZFZhbHVlLCBpZ25vcmVDYXNlLCBza2lwRW5jb2RlKTtcbiAgICAgICAgZmllbGROYW1lID0gTGl2ZVZhcmlhYmxlVXRpbHMud3JhcEluTG93ZXJDYXNlKGZpZWxkTmFtZSwgZmllbGRWYWx1ZSwgaWdub3JlQ2FzZSwgdHJ1ZSk7XG4gICAgICAgIHJldHVybiByZXBsYWNlKG1hdGNoTW9kZUV4cHIsIFtmaWVsZE5hbWUsIHBhcmFtVmFsdWVdKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiB0aGlzIGlzIHVzZWQgdG8gaWRlbnRpZnkgd2hldGhlciB0byB1c2UgaWdub3JlY2FzZSBhdCBlYWNoIGNyaXRlcmlhIGxldmVsIGFuZCBub3QgdXNlIHRoZSB2YXJpYWJsZVxuICAgICAqIGxldmVsIGlzSWdub3JlQ2FzZSBmbGFnIGFuZCBhcHBseSBpdCB0byBhbGwgdGhlIHJ1bGVzLlxuICAgICAqIEluc3RlYWQgb2YgYWRkaW5nIGFuIGV4dHJhIHBhcmFtIHRvIHRoZSBjcml0ZXJpYSBvYmplY3QsIHdlIGhhdmUgYWRkZWQgZmV3IG90aGVyIG1hdGNobW9kZXMgZm9yIHN0cmluZyB0eXBlcyBsaWtlXG4gICAgICogYW55d2hlcmUgd2l0aCBhbnl3aGVyZWlnbm9yZWNhc2UsIHN0YXJ0IHdpdGggc3RhcnRpZ25vcmVjYXNlLCBlbmQgd2l0aCBlbmRpZ25vcmVjYXNlLCBleGFjdCB3aXRoIGV4YWN0aWdub3JlY2FzZSxcbiAgICAgKiBTbyB3aGlsZSBjcmVhdGluZyB0aGUgY3JpdGVyaWEgaXRzZWxkIHVzZXIgY2FuIGNob29zZSB3aGV0aGVyIHRvIHVzZSBpZ25vcmUgY2FzZSBvciBub3QgZm9yIGEgcGFydGljdWxhciBjb2x1bW4gd2hpbGUgcXVlcnlpbmdcbiAgICAgKiBAcGFyYW0gbWF0Y2hNb2RlXG4gICAgICogQHBhcmFtIGlnbm9yZUNhc2VcbiAgICAgKiBAcmV0dXJucyB7Kn0gYm9vbGVhblxuICAgICAqL1xuICAgIHN0YXRpYyBnZXRJZ25vcmVDYXNlKG1hdGNoTW9kZSwgaWdub3JlQ2FzZSkge1xuICAgICAgICBjb25zdCBtYXRjaE1vZGVzID0gREJfQ09OU1RBTlRTLkRBVEFCQVNFX01BVENIX01PREVTO1xuICAgICAgICBpZiAoXy5pbmRleE9mKFttYXRjaE1vZGVzWydhbnl3aGVyZSddLCBtYXRjaE1vZGVzWydzdGFydCddLCBtYXRjaE1vZGVzWydlbmQnXSwgbWF0Y2hNb2Rlc1snZXhhY3QnXV0sIG1hdGNoTW9kZSkgIT09IC0xKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKF8uaW5kZXhPZihbbWF0Y2hNb2Rlc1snYW55d2hlcmVpZ25vcmVjYXNlJ10sIG1hdGNoTW9kZXNbJ3N0YXJ0aWdub3JlY2FzZSddLCBtYXRjaE1vZGVzWydlbmRpZ25vcmVjYXNlJ10sIG1hdGNoTW9kZXNbJ2V4YWN0aWdub3JlY2FzZSddXSwgbWF0Y2hNb2RlKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpZ25vcmVDYXNlO1xuICAgIH1cblxuICAgIHN0YXRpYyBnZW5lcmF0ZVNlYXJjaFF1ZXJ5KHJ1bGVzLCBjb25kaXRpb24sIGlnbm9yZUNhc2UsIHNraXBFbmNvZGUpIHtcbiAgICAgICAgY29uc3QgcGFyYW1zID0gW107XG4gICAgICAgIF8uZm9yRWFjaChydWxlcywgcnVsZSA9PiB7XG4gICAgICAgICAgICBpZiAocnVsZSkge1xuICAgICAgICAgICAgICAgIGlmIChydWxlLnJ1bGVzKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHF1ZXJ5ID0gTGl2ZVZhcmlhYmxlVXRpbHMuZ2VuZXJhdGVTZWFyY2hRdWVyeShydWxlLnJ1bGVzLCBydWxlLmNvbmRpdGlvbiwgaWdub3JlQ2FzZSwgc2tpcEVuY29kZSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChxdWVyeSAhPT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtcy5wdXNoKCcoJyArIHF1ZXJ5ICsgJyknKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHNlYXJjaEZpZWxkID0gTGl2ZVZhcmlhYmxlVXRpbHMuZ2V0U2VhcmNoRmllbGQocnVsZSwgTGl2ZVZhcmlhYmxlVXRpbHMuZ2V0SWdub3JlQ2FzZShydWxlLmZpbHRlckNvbmRpdGlvbiwgaWdub3JlQ2FzZSksIHNraXBFbmNvZGUpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIV8uaXNOaWwoc2VhcmNoRmllbGQpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwYXJhbXMucHVzaChzZWFyY2hGaWVsZCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gXy5qb2luKHBhcmFtcywgJyAnICsgY29uZGl0aW9uICsgJyAnKTtcbiAgICB9XG5cbiAgICBzdGF0aWMgcHJlcGFyZVRhYmxlT3B0aW9uc0ZvckZpbHRlckV4cHModmFyaWFibGUsIG9wdGlvbnMsIGNsb25lZEZpZWxkcykge1xuICAgICAgICBpZiAoIWlzRGVmaW5lZChvcHRpb25zLnNlYXJjaFdpdGhRdWVyeSkpIHtcbiAgICAgICAgICAgIG9wdGlvbnMuc2VhcmNoV2l0aFF1ZXJ5ID0gdHJ1ZTsgLy8gVXNpbmcgcXVlcnkgYXBpIGluc3RlYWQgb2YgIHNlYXJjaCBhcGlcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGZpbHRlck9wdGlvbnMgPSBbXTtcbiAgICAgICAgY29uc3QgbWF0Y2hNb2RlcyA9IERCX0NPTlNUQU5UUy5EQVRBQkFTRV9NQVRDSF9NT0RFUztcbiAgICAgICAgbGV0IG9yZGVyQnlGaWVsZHMsXG4gICAgICAgICAgICBvcmRlckJ5T3B0aW9ucyxcbiAgICAgICAgICAgIHF1ZXJ5O1xuICAgICAgICBsZXQgY2xvbmVkT2JqID0gY2xvbmVkRmllbGRzIHx8IGdldENsb25lZE9iamVjdCh2YXJpYWJsZS5maWx0ZXJFeHByZXNzaW9ucyk7XG5cbiAgICAgICAgLy8gaWYgZmlsdGVyZXhwcmVzc2lvbiBmcm9tIGxpdmUgZmlsdGVyIGlzIHByZXNlbnQgdXNlIGl0IHRvIHF1ZXJ5XG4gICAgICAgIGlmIChvcHRpb25zLmZpbHRlckV4cHIgJiYgIV8uaXNFbXB0eShvcHRpb25zLmZpbHRlckV4cHIpKSB7XG4gICAgICAgICAgICBjbG9uZWRPYmogPSBvcHRpb25zLmZpbHRlckV4cHI7XG4gICAgICAgIH1cbiAgICAgICAgLy8gbWVyZ2UgbGl2ZSBmaWx0ZXIgcnVudGltZSB2YWx1ZXNcbiAgICAgICAgbGV0IGZpbHRlclJ1bGVzOiBhbnkgPSB7fTtcbiAgICAgICAgaWYgKCFfLmlzRW1wdHkob3B0aW9ucy5maWx0ZXJGaWVsZHMpKSB7XG4gICAgICAgICAgICBmaWx0ZXJSdWxlcyA9IHsnY29uZGl0aW9uJzogb3B0aW9ucy5sb2dpY2FsT3AgfHwgJ0FORCcsICdydWxlcyc6IFtdfTtcbiAgICAgICAgICAgIF8uZm9yRWFjaChvcHRpb25zLmZpbHRlckZpZWxkcywgKGZpbHRlck9iaiwgZmlsdGVyTmFtZSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGZpbHRlckNvbmRpdGlvbiA9IG1hdGNoTW9kZXNbZmlsdGVyT2JqLm1hdGNoTW9kZV0gfHwgbWF0Y2hNb2Rlc1tmaWx0ZXJPYmouZmlsdGVyQ29uZGl0aW9uXSB8fCBmaWx0ZXJPYmouZmlsdGVyQ29uZGl0aW9uO1xuICAgICAgICAgICAgICAgIGlmIChfLmluY2x1ZGVzKERCX0NPTlNUQU5UUy5EQVRBQkFTRV9FTVBUWV9NQVRDSF9NT0RFUywgZmlsdGVyQ29uZGl0aW9uKSB8fFxuICAgICAgICAgICAgICAgICAgICAoIV8uaXNOaWwoZmlsdGVyT2JqLnZhbHVlKSAmJiBmaWx0ZXJPYmoudmFsdWUgIT09ICcnKSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCB0eXBlID0gZmlsdGVyT2JqLnR5cGUgfHwgTGl2ZVZhcmlhYmxlVXRpbHMuZ2V0U3FsVHlwZSh2YXJpYWJsZSwgZmlsdGVyTmFtZSwgb3B0aW9ucy5lbnRpdHlOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgcnVsZU9iaiA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICd0YXJnZXQnOiBmaWx0ZXJOYW1lLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ3R5cGUnOiB0eXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ21hdGNoTW9kZSc6IGZpbHRlck9iai5tYXRjaE1vZGUgfHwgKExpdmVWYXJpYWJsZVV0aWxzLmlzU3RyaW5nVHlwZSh0eXBlKSA/ICdzdGFydGlnbm9yZWNhc2UnIDogJ2V4YWN0JyksXG4gICAgICAgICAgICAgICAgICAgICAgICAndmFsdWUnOiBmaWx0ZXJPYmoudmFsdWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAncmVxdWlyZWQnOiBmaWx0ZXJPYmoucmVxdWlyZWQgfHwgZmFsc2VcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgZmlsdGVyUnVsZXMucnVsZXMucHVzaChydWxlT2JqKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIV8uaXNFbXB0eShjbG9uZWRPYmopKSB7XG4gICAgICAgICAgICBpZiAoIV8uaXNOaWwoZmlsdGVyUnVsZXMucnVsZXMpICYmIGZpbHRlclJ1bGVzLnJ1bGVzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIC8vIGNvbWJpbmUgYm90aCB0aGUgcnVsZXMgdXNpbmcgJ0FORCdcbiAgICAgICAgICAgICAgICBjb25zdCB0ZW1wUnVsZXMgPSB7J2NvbmRpdGlvbic6ICdBTkQnLCAncnVsZXMnOiBbXX07XG4gICAgICAgICAgICAgICAgdGVtcFJ1bGVzLnJ1bGVzLnB1c2goZ2V0Q2xvbmVkT2JqZWN0KGNsb25lZE9iaikpO1xuICAgICAgICAgICAgICAgIHRlbXBSdWxlcy5ydWxlcy5wdXNoKGZpbHRlclJ1bGVzKTtcbiAgICAgICAgICAgICAgICBjbG9uZWRPYmogPSB0ZW1wUnVsZXM7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjbG9uZWRPYmogPSBmaWx0ZXJSdWxlcztcbiAgICAgICAgfVxuXG4gICAgICAgIExpdmVWYXJpYWJsZVV0aWxzLnByb2Nlc3NGaWx0ZXJGaWVsZHMoY2xvbmVkT2JqLnJ1bGVzLCB2YXJpYWJsZSwgb3B0aW9ucyk7XG4gICAgICAgIHF1ZXJ5ID0gTGl2ZVZhcmlhYmxlVXRpbHMuZ2VuZXJhdGVTZWFyY2hRdWVyeShjbG9uZWRPYmoucnVsZXMsIGNsb25lZE9iai5jb25kaXRpb24sIHZhcmlhYmxlLmlnbm9yZUNhc2UsIG9wdGlvbnMuc2tpcEVuY29kZSk7XG5cbiAgICAgICAgb3JkZXJCeUZpZWxkcyA9IGdldEV2YWx1YXRlZE9yZGVyQnkodmFyaWFibGUub3JkZXJCeSwgb3B0aW9ucy5vcmRlckJ5KTtcbiAgICAgICAgb3JkZXJCeU9wdGlvbnMgPSBvcmRlckJ5RmllbGRzID8gJ3NvcnQ9JyArIG9yZGVyQnlGaWVsZHMgOiAnJztcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgJ2ZpbHRlcicgOiBmaWx0ZXJPcHRpb25zLFxuICAgICAgICAgICAgJ3NvcnQnICAgOiBvcmRlckJ5T3B0aW9ucyxcbiAgICAgICAgICAgICdxdWVyeScgIDogcXVlcnlcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBzdGF0aWMgcHJlcGFyZVRhYmxlT3B0aW9ucyh2YXJpYWJsZSwgb3B0aW9ucywgY2xvbmVkRmllbGRzPykge1xuICAgICAgICBpZiAodmFyaWFibGUub3BlcmF0aW9uID09PSAncmVhZCcpIHtcbiAgICAgICAgICAgIHJldHVybiBMaXZlVmFyaWFibGVVdGlscy5wcmVwYXJlVGFibGVPcHRpb25zRm9yRmlsdGVyRXhwcyh2YXJpYWJsZSwgb3B0aW9ucywgY2xvbmVkRmllbGRzKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWlzRGVmaW5lZChvcHRpb25zLnNlYXJjaFdpdGhRdWVyeSkpIHtcbiAgICAgICAgICAgIG9wdGlvbnMuc2VhcmNoV2l0aFF1ZXJ5ID0gdHJ1ZTsgLy8gIFVzaW5nIHF1ZXJ5IGFwaSBpbnN0ZWFkIG9mICBzZWFyY2ggYXBpXG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZmlsdGVyRmllbGRzID0gW107XG4gICAgICAgIGxldCBmaWx0ZXJPcHRpb25zID0gW10sXG4gICAgICAgICAgICBvcmRlckJ5RmllbGRzLFxuICAgICAgICAgICAgb3JkZXJCeU9wdGlvbnMsXG4gICAgICAgICAgICBxdWVyeSxcbiAgICAgICAgICAgIG9wdGlvbnNRdWVyeTtcbiAgICAgICAgY2xvbmVkRmllbGRzID0gY2xvbmVkRmllbGRzIHx8IHZhcmlhYmxlLmZpbHRlckZpZWxkcztcbiAgICAgICAgLy8gZ2V0IHRoZSBmaWx0ZXIgZmllbGRzIGZyb20gdGhlIHZhcmlhYmxlXG4gICAgICAgIF8uZm9yRWFjaChjbG9uZWRGaWVsZHMsICh2YWx1ZSwga2V5KSA9PiB7XG4gICAgICAgICAgICBpZiAoXy5pc09iamVjdCh2YWx1ZSkgJiYgKCFvcHRpb25zLmZpbHRlckZpZWxkcyB8fCAhb3B0aW9ucy5maWx0ZXJGaWVsZHNba2V5XSB8fCBvcHRpb25zLmZpbHRlckZpZWxkc1trZXldLmxvZ2ljYWxPcCA9PT0gJ0FORCcpKSB7XG4gICAgICAgICAgICAgICAgdmFsdWUuZmllbGROYW1lID0ga2V5O1xuICAgICAgICAgICAgICAgIGlmIChMaXZlVmFyaWFibGVVdGlscy5pc1N0cmluZ1R5cGUoTGl2ZVZhcmlhYmxlVXRpbHMuZ2V0U1FMRmllbGRUeXBlKHZhcmlhYmxlLCB2YWx1ZSkpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhbHVlLmZpbHRlckNvbmRpdGlvbiA9IERCX0NPTlNUQU5UUy5EQVRBQkFTRV9NQVRDSF9NT0RFU1t2YWx1ZS5tYXRjaE1vZGUgfHwgdmFyaWFibGUubWF0Y2hNb2RlXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFsdWUuaXNWYXJpYWJsZUZpbHRlciA9IHRydWU7XG4gICAgICAgICAgICAgICAgZmlsdGVyRmllbGRzLnB1c2godmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgLy8gZ2V0IHRoZSBmaWx0ZXIgZmllbGRzIGZyb20gdGhlIG9wdGlvbnNcbiAgICAgICAgXy5mb3JFYWNoKG9wdGlvbnMuZmlsdGVyRmllbGRzLCAodmFsdWUsIGtleSkgPT4ge1xuICAgICAgICAgICAgdmFsdWUuZmllbGROYW1lID0ga2V5O1xuICAgICAgICAgICAgdmFsdWUuZmlsdGVyQ29uZGl0aW9uID0gREJfQ09OU1RBTlRTLkRBVEFCQVNFX01BVENIX01PREVTW3ZhbHVlLm1hdGNoTW9kZSB8fCBvcHRpb25zLm1hdGNoTW9kZSB8fCB2YXJpYWJsZS5tYXRjaE1vZGVdO1xuICAgICAgICAgICAgZmlsdGVyRmllbGRzLnB1c2godmFsdWUpO1xuICAgICAgICB9KTtcbiAgICAgICAgaWYgKHZhcmlhYmxlLm9wZXJhdGlvbiA9PT0gJ3JlYWQnIHx8IG9wdGlvbnMub3BlcmF0aW9uID09PSAncmVhZCcpIHtcbiAgICAgICAgICAgIGZpbHRlck9wdGlvbnMgPSBMaXZlVmFyaWFibGVVdGlscy5nZXRGaWx0ZXJPcHRpb25zKHZhcmlhYmxlLCBmaWx0ZXJGaWVsZHMsIG9wdGlvbnMpO1xuICAgICAgICB9XG4gICAgICAgIC8qaWYgc2VhcmNoV2l0aFF1ZXJ5IGlzIHRydWUsIHRoZW4gY29udmVydCB0aGUgaW5wdXQgcGFyYW1zIGludG8gcXVlcnkgc3RyaW5nLiBGb3IgZXhhbXBsZSBpZiBmaXJzdE5hbWUgYW5kIGxhc3ROYW1lXG4gICAgICAgICBzaG91bGQgYmUgc2VudCBhcyBwYXJhbXMgdGhlbiBxdWVyeSBzdHJpbmcgd2lsbCBiZSBxPSdmaXJzdE5hbWUgY29udGFpbmluZyAnc29tZVZhbHVlJyBPUiBsYXN0TmFtZSBjb250YWluaW5nICdzb21lVmFsdWUnJ1xuICAgICAgICAgKi9cbiAgICAgICAgaWYgKG9wdGlvbnMuc2VhcmNoV2l0aFF1ZXJ5ICYmIGZpbHRlck9wdGlvbnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAvLyBHZW5lcmF0ZSBxdWVyeSBmb3IgdmFyaWFibGUgZmlsdGVyIGZpZWxkcy4gVGhpcyBoYXMgQU5EIGxvZ2ljYWwgb3BlcmF0b3JcbiAgICAgICAgICAgIHF1ZXJ5ID0gTGl2ZVZhcmlhYmxlVXRpbHMuZ2V0U2VhcmNoUXVlcnkoXy5maWx0ZXIoZmlsdGVyT3B0aW9ucywgeydpc1ZhcmlhYmxlRmlsdGVyJzogdHJ1ZX0pLCAnIEFORCAnLCB2YXJpYWJsZS5pZ25vcmVDYXNlLCBvcHRpb25zLnNraXBFbmNvZGUpO1xuICAgICAgICAgICAgLy8gR2VuZXJhdGUgcXVlcnkgZm9yIG9wdGlvbiBmaWx0ZXIgZmllbGRzLiBUaGlzIGhhcyBkZWZhdWx0IGxvZ2ljYWwgb3BlcmF0b3IgYXMgT1JcbiAgICAgICAgICAgIG9wdGlvbnNRdWVyeSA9IExpdmVWYXJpYWJsZVV0aWxzLmdldFNlYXJjaFF1ZXJ5KF8uZmlsdGVyKGZpbHRlck9wdGlvbnMsIHsnaXNWYXJpYWJsZUZpbHRlcic6IHVuZGVmaW5lZH0pLCAnICcgKyAob3B0aW9ucy5sb2dpY2FsT3AgfHwgJ0FORCcpICsgJyAnLCB2YXJpYWJsZS5pZ25vcmVDYXNlLCBvcHRpb25zLnNraXBFbmNvZGUpO1xuICAgICAgICAgICAgaWYgKG9wdGlvbnNRdWVyeSkge1xuICAgICAgICAgICAgICAgIC8vIElmIGJvdGggdmFyaWFibGUgYW5kIG9wdGlvbiBxdWVyeSBhcmUgcHJlc2VudCwgbWVyZ2UgdGhlbSB3aXRoIEFORFxuICAgICAgICAgICAgICAgIHF1ZXJ5ID0gcXVlcnkgPyAocXVlcnkgKyAnIEFORCAoICcgKyBvcHRpb25zUXVlcnkgKyAnICknKSA6IG9wdGlvbnNRdWVyeTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBvcmRlckJ5RmllbGRzID0gZ2V0RXZhbHVhdGVkT3JkZXJCeSh2YXJpYWJsZS5vcmRlckJ5LCBvcHRpb25zLm9yZGVyQnkpO1xuICAgICAgICBvcmRlckJ5T3B0aW9ucyA9IG9yZGVyQnlGaWVsZHMgPyAnc29ydD0nICsgb3JkZXJCeUZpZWxkcyA6ICcnO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAnZmlsdGVyJzogZmlsdGVyT3B0aW9ucyxcbiAgICAgICAgICAgICdzb3J0Jzogb3JkZXJCeU9wdGlvbnMsXG4gICAgICAgICAgICAncXVlcnknOiBxdWVyeVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIC8qIEZ1bmN0aW9uIHRvIGNoZWNrIGlmIHNwZWNpZmllZCBmaWVsZCBpcyBvZiB0eXBlIGRhdGUqL1xuICAgIHN0YXRpYyBnZXRGaWVsZFR5cGUoZmllbGROYW1lLCB2YXJpYWJsZSwgcmVsYXRlZEZpZWxkPykge1xuICAgICAgICBsZXQgZmllbGRUeXBlLFxuICAgICAgICAgICAgY29sdW1ucyxcbiAgICAgICAgICAgIHJlc3VsdDtcbiAgICAgICAgaWYgKHZhcmlhYmxlLnByb3BlcnRpZXNNYXApIHtcbiAgICAgICAgICAgIGNvbHVtbnMgPSB2YXJpYWJsZS5wcm9wZXJ0aWVzTWFwLmNvbHVtbnMgfHwgW107XG4gICAgICAgICAgICByZXN1bHQgPSBfLmZpbmQoY29sdW1ucywgb2JqID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gb2JqLmZpZWxkTmFtZSA9PT0gZmllbGROYW1lO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvLyBpZiByZWxhdGVkIGZpZWxkIG5hbWUgcGFzc2VkLCBnZXQgaXRzIHR5cGUgZnJvbSBjb2x1bW5zIGluc2lkZSB0aGUgY3VycmVudCBmaWVsZFxuICAgICAgICAgICAgaWYgKHJlbGF0ZWRGaWVsZCAmJiByZXN1bHQpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBfLmZpbmQocmVzdWx0LmNvbHVtbnMsIG9iaiA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBvYmouZmllbGROYW1lID09PSByZWxhdGVkRmllbGQ7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmaWVsZFR5cGUgPSByZXN1bHQgJiYgcmVzdWx0LnR5cGU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZpZWxkVHlwZTtcbiAgICB9XG5cbiAgICAvLyBQcmVwYXJlIGZvcm1EYXRhIGZvciBibG9iIGNvbHVtbnNcbiAgICBzdGF0aWMgcHJlcGFyZUZvcm1EYXRhKHZhcmlhYmxlRGV0YWlscywgcm93T2JqZWN0KSB7XG4gICAgICAgIGNvbnN0IGZvcm1EYXRhOiBhbnkgPSBuZXcgRm9ybURhdGEoKTtcbiAgICAgICAgZm9ybURhdGEucm93RGF0YSA9IF8uY2xvbmUocm93T2JqZWN0KTtcbiAgICAgICAgXy5mb3JFYWNoKHJvd09iamVjdCwgKGNvbFZhbHVlLCBjb2xOYW1lKSA9PiB7XG4gICAgICAgICAgICBpZiAoTGl2ZVZhcmlhYmxlVXRpbHMuZ2V0RmllbGRUeXBlKGNvbE5hbWUsIHZhcmlhYmxlRGV0YWlscykgPT09ICdibG9iJykge1xuICAgICAgICAgICAgICAgIGlmIChfLmlzT2JqZWN0KGNvbFZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoXy5pc0FycmF5KGNvbFZhbHVlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgXy5mb3JFYWNoKGNvbFZhbHVlLCBmaWxlT2JqZWN0ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3JtRGF0YS5hcHBlbmQoY29sTmFtZSwgZmlsZU9iamVjdCwgZmlsZU9iamVjdC5uYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9ybURhdGEuYXBwZW5kKGNvbE5hbWUsIGNvbFZhbHVlLCBjb2xWYWx1ZS5uYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByb3dPYmplY3RbY29sTmFtZV0gPSBjb2xWYWx1ZSAhPT0gbnVsbCA/ICcnIDogbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGZvcm1EYXRhLmFwcGVuZChTV0FHR0VSX0NPTlNUQU5UUy5XTV9EQVRBX0pTT04sIG5ldyBCbG9iKFtKU09OLnN0cmluZ2lmeShyb3dPYmplY3QpXSwge1xuICAgICAgICAgICAgdHlwZTogJ2FwcGxpY2F0aW9uL2pzb24nXG4gICAgICAgIH0pKTtcbiAgICAgICAgcmV0dXJuIGZvcm1EYXRhO1xuICAgIH1cblxuICAgIHN0YXRpYyB0cmF2ZXJzZUZpbHRlckV4cHJlc3Npb25zKGZpbHRlckV4cHJlc3Npb25zLCB0cmF2ZXJzZUNhbGxiYWNrRm4pIHtcbiAgICAgICAgaWYgKGZpbHRlckV4cHJlc3Npb25zICYmIGZpbHRlckV4cHJlc3Npb25zLnJ1bGVzKSB7XG4gICAgICAgICAgICBfLmZvckVhY2goZmlsdGVyRXhwcmVzc2lvbnMucnVsZXMsIChmaWxFeHBPYmosIGkpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZmlsRXhwT2JqLnJ1bGVzKSB7XG4gICAgICAgICAgICAgICAgICAgIExpdmVWYXJpYWJsZVV0aWxzLnRyYXZlcnNlRmlsdGVyRXhwcmVzc2lvbnMoZmlsRXhwT2JqLCB0cmF2ZXJzZUNhbGxiYWNrRm4pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cmlnZ2VyRm4odHJhdmVyc2VDYWxsYmFja0ZuLCBmaWx0ZXJFeHByZXNzaW9ucywgZmlsRXhwT2JqKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFRyYXZlcnNlcyByZWN1cnNpdmVseSB0aGUgZmlsdGVyRXhwcmVzc2lvbnMgb2JqZWN0IGFuZCBpZiB0aGVyZSBpcyBhbnkgcmVxdWlyZWQgZmllbGQgcHJlc2VudCB3aXRoIG5vIHZhbHVlLFxuICAgICAqIHRoZW4gd2Ugd2lsbCByZXR1cm4gd2l0aG91dCBwcm9jZWVkaW5nIGZ1cnRoZXIuIEl0cyB1cHRvIHRoZSBkZXZlbG9wZXIgdG8gcHJvdmlkZSB0aGUgbWFuZGF0b3J5IHZhbHVlLFxuICAgICAqIGlmIGhlIHdhbnRzIHRvIGFzc2lnbiBpdCBpbiB0ZWggb25iZWZvcmU8ZGVsZXRlL2luc2VydC91cGRhdGU+ZnVuY3Rpb24gdGhlbiBtYWtlIHRoYXQgZmllbGQgaW5cbiAgICAgKiB0aGUgZmlsdGVyIHF1ZXJ5IHNlY3Rpb24gYXMgb3B0aW9uYWxcbiAgICAgKiBAcGFyYW0gZmlsdGVyRXhwcmVzc2lvbnMgLSByZWN1cnNpdmUgcnVsZSBPYmplY3RcbiAgICAgKiBAcmV0dXJucyB7T2JqZWN0fSBvYmplY3Qgb3IgYm9vbGVhbi4gT2JqZWN0IGlmIGV2ZXJ5dGhpbmcgZ2V0cyB2YWxpZGF0ZWQgb3IgZWxzZSBqdXN0IGJvb2xlYW4gaW5kaWNhdGluZyBmYWlsdXJlIGluIHRoZSB2YWxpZGF0aW9uc1xuICAgICAqL1xuICAgIHN0YXRpYyBnZXRGaWx0ZXJFeHByRmllbGRzKGZpbHRlckV4cHJlc3Npb25zKSB7XG4gICAgICAgIGxldCBpc1JlcXVpcmVkRmllbGRBYnNlbnQgPSBmYWxzZTtcbiAgICAgICAgY29uc3QgdHJhdmVyc2VDYWxsYmFja0ZuID0gKHBhcmVudEZpbEV4cE9iaiwgZmlsRXhwT2JqKSA9PiB7XG4gICAgICAgICAgICBpZiAoZmlsRXhwT2JqXG4gICAgICAgICAgICAgICAgJiYgZmlsRXhwT2JqLnJlcXVpcmVkXG4gICAgICAgICAgICAgICAgJiYgKChfLmluZGV4T2YoWydudWxsJywgJ2lzbm90bnVsbCcsICdlbXB0eScsICdpc25vdGVtcHR5JywgJ251bGxvcmVtcHR5J10sIGZpbEV4cE9iai5tYXRjaE1vZGUpID09PSAtMSkgJiYgZmlsRXhwT2JqLnZhbHVlID09PSAnJykpIHtcbiAgICAgICAgICAgICAgICBpc1JlcXVpcmVkRmllbGRBYnNlbnQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgTGl2ZVZhcmlhYmxlVXRpbHMudHJhdmVyc2VGaWx0ZXJFeHByZXNzaW9ucyhmaWx0ZXJFeHByZXNzaW9ucywgdHJhdmVyc2VDYWxsYmFja0ZuKTtcbiAgICAgICAgcmV0dXJuIGlzUmVxdWlyZWRGaWVsZEFic2VudCA/ICFpc1JlcXVpcmVkRmllbGRBYnNlbnQgOiBmaWx0ZXJFeHByZXNzaW9ucztcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKlxuICAgICAqIEBwYXJhbSB2YXJpYWJsZVxuICAgICAqIEBwYXJhbSBvcHRpb25zXG4gICAgICogQHJldHVybnMge2Z1bmN0aW9uKCo9KTogKn0gcmV0dXJucyBhIGZ1bmN0aW9uIHdoaWNoIHNob3VsZCBiZSBjYWxsZWQgZm9yIHRoZSB3aGVyZSBjbGF1c2UuXG4gICAgICogVGhpcyByZXR1cm4gZnVuY3Rpb24gY2FuIHRha2UgYSBmdW5jdGlvbiBhcyBhcmd1bWVudC4gVGhpcyBhcmd1bWVudCBmdW5jdGlvbiBjYW4gbW9kaWZ5IHRoZSBmaWx0ZXIgZmllbGRzXG4gICAgICogYmVmb3JlIGdlbmVyYXRpbmcgd2hlcmUgY2xhdXNlLlxuICAgICAqL1xuICAgIHN0YXRpYyBnZXRXaGVyZUNsYXVzZUdlbmVyYXRvcih2YXJpYWJsZSwgb3B0aW9ucywgdXBkYXRlZEZpbHRlckZpZWxkcz86IGFueSkge1xuICAgICAgICByZXR1cm4gKG1vZGlmaWVyLCBza2lwRW5jb2RlPzogYm9vbGVhbikgPT4ge1xuICAgICAgICAgICAgY29uc3QgY2xvbmVkRmllbGRzID0gTGl2ZVZhcmlhYmxlVXRpbHMuZ2V0RmlsdGVyRXhwckZpZWxkcyhnZXRDbG9uZWRPYmplY3QodXBkYXRlZEZpbHRlckZpZWxkcyB8fCB2YXJpYWJsZS5maWx0ZXJFeHByZXNzaW9ucykpO1xuICAgICAgICAgICAgLy8gdGhpcyBmbGFnIHNraXBzIHRoZSBlbmNvZGluZyBvZiB0aGUgcXVlcnlcbiAgICAgICAgICAgIGlmIChpc0RlZmluZWQoc2tpcEVuY29kZSkpIHtcbiAgICAgICAgICAgICAgICBvcHRpb25zLnNraXBFbmNvZGUgPSBza2lwRW5jb2RlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG1vZGlmaWVyKSB7XG4gICAgICAgICAgICAgICAgLy8gaGFuZGxpbmcgdGhlIHNjZW5hcmlvIHdoZXJlIHZhcmlhYmxlIGNhbiBhbHNvIGhhdmUgZmlsdGVyRmllbGRzXG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuZmlsdGVyRmllbGRzKSB7XG4gICAgICAgICAgICAgICAgICAgIG1vZGlmaWVyKGNsb25lZEZpZWxkcywgb3B0aW9ucyk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbW9kaWZpZXIoY2xvbmVkRmllbGRzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gTGl2ZVZhcmlhYmxlVXRpbHMucHJlcGFyZVRhYmxlT3B0aW9ucyh2YXJpYWJsZSwgb3B0aW9ucywgY2xvbmVkRmllbGRzKS5xdWVyeTtcbiAgICAgICAgfTtcbiAgICB9XG59XG5cbiJdfQ==