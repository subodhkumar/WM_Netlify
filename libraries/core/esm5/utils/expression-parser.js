import * as tslib_1 from "tslib";
import { Lexer, Parser, BindingPipe, PropertyRead, ImplicitReceiver, LiteralPrimitive, MethodCall, Conditional, Binary, PrefixNot, KeyedRead, LiteralMap, LiteralArray, Chain, PropertyWrite } from '@angular/compiler';
var isString = function (v) { return typeof v === 'string'; };
var ɵ0 = isString;
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
    result = pipe.transform.apply(pipe, tslib_1.__spread(args));
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
            for (var _b = tslib_1.__values(ast.expressions), _c = _b.next(); !_c.done; _c = _b.next()) {
                var item = _c.value;
                s.push(this.build(item, stmts));
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
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
            for (var _b = tslib_1.__values(ast.values), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _value = _c.value;
                _values.push(this.build(_value, stmts));
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
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
            for (var _b = tslib_1.__values(ast.args), _c = _b.next(); !_c.done; _c = _b.next()) {
                var arg = _c.value;
                _args.push(this.build(arg, stmts));
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_3) throw e_3.error; }
        }
        var fn = this.build(ast.receiver, stmts);
        var v = this.createVar();
        var isImplicitReceiver = ast.receiver instanceof ImplicitReceiver;
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
        if (ast.receiver instanceof ImplicitReceiver) {
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
            for (var _b = tslib_1.__values(ast.args), _c = _b.next(); !_c.done; _c = _b.next()) {
                var arg = _c.value;
                _args.push(this.build(arg, _s2));
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_4) throw e_4.error; }
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
                for (var _b = tslib_1.__values(this.pipes), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var _d = tslib_1.__read(_c.value, 2), pipeVar = _d[1];
                    args.push(pipeVar);
                }
            }
            catch (e_5_1) { e_5 = { error: e_5_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_5) throw e_5.error; }
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
export function setPipeProvider(_pipeProvider) {
    pipeProvider = _pipeProvider;
}
var ExpressionType;
(function (ExpressionType) {
    ExpressionType[ExpressionType["Binding"] = 0] = "Binding";
    ExpressionType[ExpressionType["Action"] = 1] = "Action";
})(ExpressionType || (ExpressionType = {}));
export function $parseExpr(expr) {
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
    var parser = new Parser(new Lexer);
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
                for (var _b = tslib_1.__values(fn.usedPipes), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var _d = tslib_1.__read(_c.value, 1), pipeName = _d[0];
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
            catch (e_6_1) { e_6 = { error: e_6_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_6) throw e_6.error; }
            }
            pipeArgs.unshift(hasPurePipe ? new Map() : undefined);
            boundFn = fn.bind.apply(fn, tslib_1.__spread([undefined], pipeArgs));
        }
        else {
            boundFn = fn.bind(undefined, undefined);
        }
    }
    exprFnCache.set(expr, boundFn);
    return boundFn;
}
export function $parseEvent(expr) {
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
    var parser = new Parser(new Lexer);
    var ast = parser.parseAction(expr, '');
    if (ast.errors.length) {
        return noop;
    }
    var astCompiler = new ASTCompiler(ast.ast, ExpressionType.Action);
    fn = astCompiler.compile();
    eventFnCache.set(expr, fn);
    return fn;
}
export { ɵ0, ɵ1, ɵ2, ɵ3, ɵ4, ɵ5, ɵ6, ɵ7, ɵ8, ɵ9, ɵ10 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXhwcmVzc2lvbi1wYXJzZXIuanMiLCJzb3VyY2VSb290Ijoibmc6Ly9Ad20vY29yZS8iLCJzb3VyY2VzIjpbInV0aWxzL2V4cHJlc3Npb24tcGFyc2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxPQUFPLEVBQ0gsS0FBSyxFQUNMLE1BQU0sRUFDTixXQUFXLEVBRVgsWUFBWSxFQUNaLGdCQUFnQixFQUNoQixnQkFBZ0IsRUFDaEIsVUFBVSxFQUNWLFdBQVcsRUFDWCxNQUFNLEVBQ04sU0FBUyxFQUNULFNBQVMsRUFDVCxVQUFVLEVBQ1YsWUFBWSxFQUNaLEtBQUssRUFDTCxhQUFhLEVBQ2hCLE1BQU0sbUJBQW1CLENBQUM7QUFFM0IsSUFBTSxRQUFRLEdBQUcsVUFBQSxDQUFDLElBQUksT0FBQSxPQUFPLENBQUMsS0FBSyxRQUFRLEVBQXJCLENBQXFCLENBQUM7O0FBQzVDLElBQU0sS0FBSyxHQUFHLFVBQUEsQ0FBQyxJQUFJLE9BQUEsQ0FBQyxLQUFLLEtBQUssQ0FBQyxFQUFaLENBQVksQ0FBQzs7QUFDaEMsSUFBTSxLQUFLLEdBQUcsVUFBQyxDQUFDLEVBQUUsQ0FBQyxJQUFLLE9BQUEsQ0FBQyxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBcEIsQ0FBb0IsQ0FBQzs7QUFDN0MsSUFBTSxJQUFJLEdBQUcsVUFBQyxDQUFDLEVBQUUsQ0FBQyxJQUFLLE9BQUEsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUEzQyxDQUEyQyxDQUFDOztBQUNuRSxJQUFNLEtBQUssR0FBRyxVQUFDLENBQUMsRUFBRSxDQUFDLElBQUssT0FBQSxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQXpCLENBQXlCLENBQUM7O0FBQ2xELElBQU0sSUFBSSxHQUFHLGNBQU8sQ0FBQyxDQUFDOztBQUl0QixJQUFNLFdBQVcsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO0FBQzlCLElBQU0sWUFBWSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7QUFDL0IsSUFBTSxTQUFTLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUU1QixJQUFNLGVBQWUsR0FBRyxVQUFDLENBQUMsRUFBRSxDQUFDO0lBQ3pCLElBQUksT0FBTyxDQUFDLEtBQUssUUFBUSxJQUFJLE9BQU8sQ0FBQyxLQUFLLFFBQVEsRUFBRTtRQUNoRCxPQUFPLEtBQUssQ0FBQztLQUNoQjtJQUNELElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLEVBQUUsV0FBVztRQUNqQyxPQUFPLElBQUksQ0FBQztLQUNmO0lBQ0QsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ25CLENBQUMsQ0FBQzs7QUFFRixJQUFNLGFBQWEsR0FBRyxVQUFDLEVBQUUsRUFBRSxFQUFFO0lBQ3pCLElBQU0sR0FBRyxHQUFHLEVBQUUsQ0FBQyxNQUFNLENBQUM7SUFDdEIsSUFBSSxTQUFTLEdBQUcsR0FBRyxHQUFHLEVBQUUsQ0FBQztJQUN6QixRQUFRLEdBQUcsRUFBRTtRQUNULEtBQUssRUFBRTtZQUNILFNBQVMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDM0MsSUFBSSxTQUFTLEVBQUU7Z0JBQ1gsTUFBTTthQUNUO1FBQ0wsS0FBSyxDQUFDO1lBQ0YsU0FBUyxHQUFHLENBQUMsZUFBZSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMzQyxJQUFJLFNBQVMsRUFBRTtnQkFDWCxNQUFNO2FBQ1Q7UUFDTCxLQUFLLENBQUM7WUFDRixTQUFTLEdBQUcsQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzNDLElBQUksU0FBUyxFQUFFO2dCQUNYLE1BQU07YUFDVDtRQUNMLEtBQUssQ0FBQztZQUNGLFNBQVMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDM0MsSUFBSSxTQUFTLEVBQUU7Z0JBQ1gsTUFBTTthQUNUO1FBQ0wsS0FBSyxDQUFDO1lBQ0YsU0FBUyxHQUFHLENBQUMsZUFBZSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMzQyxJQUFJLFNBQVMsRUFBRTtnQkFDWCxNQUFNO2FBQ1Q7UUFDTCxLQUFLLENBQUM7WUFDRixTQUFTLEdBQUcsQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzNDLElBQUksU0FBUyxFQUFFO2dCQUNYLE1BQU07YUFDVDtRQUNMLEtBQUssQ0FBQztZQUNGLFNBQVMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDM0MsSUFBSSxTQUFTLEVBQUU7Z0JBQ1gsTUFBTTthQUNUO1FBQ0wsS0FBSyxDQUFDO1lBQ0YsU0FBUyxHQUFHLENBQUMsZUFBZSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMzQyxJQUFJLFNBQVMsRUFBRTtnQkFDWCxNQUFNO2FBQ1Q7UUFDTCxLQUFLLENBQUM7WUFDRixTQUFTLEdBQUcsQ0FBQyxlQUFlLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFD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LElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFO1FBQ2QsT0FBTyxJQUFJLENBQUM7S0FDZjtJQUVELElBQUksRUFBRSxHQUFHLFlBQVksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7SUFFaEMsSUFBSSxFQUFFLEVBQUU7UUFDSixPQUFPLEVBQUUsQ0FBQztLQUNiO0lBQ0QsSUFBTSxNQUFNLEdBQUcsSUFBSSxNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQztJQUNyQyxJQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztJQUV6QyxJQUFJLEdBQUcsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFO1FBQ25CLE9BQU8sSUFBSSxDQUFDO0tBQ2Y7SUFDRCxJQUFNLFdBQVcsR0FBRyxJQUFJLFdBQVcsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUNwRSxFQUFFLEdBQUcsV0FBVyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQzNCLFlBQVksQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0lBQzNCLE9BQU8sRUFBRSxDQUFDO0FBQ2QsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG4gICAgTGV4ZXIsXG4gICAgUGFyc2VyLFxuICAgIEJpbmRpbmdQaXBlLFxuICAgIFJlYWRQcm9wRXhwcixcbiAgICBQcm9wZXJ0eVJlYWQsXG4gICAgSW1wbGljaXRSZWNlaXZlcixcbiAgICBMaXRlcmFsUHJpbWl0aXZlLFxuICAgIE1ldGhvZENhbGwsXG4gICAgQ29uZGl0aW9uYWwsXG4gICAgQmluYXJ5LFxuICAgIFByZWZpeE5vdCxcbiAgICBLZXllZFJlYWQsXG4gICAgTGl0ZXJhbE1hcCxcbiAgICBMaXRlcmFsQXJyYXksXG4gICAgQ2hhaW4sXG4gICAgUHJvcGVydHlXcml0ZVxufSBmcm9tICdAYW5ndWxhci9jb21waWxlcic7XG5cbmNvbnN0IGlzU3RyaW5nID0gdiA9PiB0eXBlb2YgdiA9PT0gJ3N0cmluZyc7XG5jb25zdCBpc0RlZiA9IHYgPT4gdiAhPT0gdm9pZCAwO1xuY29uc3QgaWZEZWYgPSAodiwgZCkgPT4gdiA9PT0gdm9pZCAwID8gZCA6IHY7XG5jb25zdCBwbHVzID0gKGEsIGIpID0+IHZvaWQgMCA9PT0gYSA/IGIgOiB2b2lkIDAgPT09IGIgPyBhIDogYSArIGI7XG5jb25zdCBtaW51cyA9IChhLCBiKSA9PiBpZkRlZihhLCAwKSAtIGlmRGVmKGIsIDApO1xuY29uc3Qgbm9vcCA9ICgpID0+IHt9O1xuXG5leHBvcnQgdHlwZSBQYXJzZUV4cHJSZXN1bHQgPSAoZGF0YT86IGFueSwgbG9jYWxzPzogYW55KSA9PiBhbnk7XG5cbmNvbnN0IGV4cHJGbkNhY2hlID0gbmV3IE1hcCgpO1xuY29uc3QgZXZlbnRGbkNhY2hlID0gbmV3IE1hcCgpO1xuY29uc3QgcHVyZVBpcGVzID0gbmV3IE1hcCgpO1xuXG5jb25zdCBwcmltaXRpdmVFcXVhbHMgPSAoYSwgYikgPT4ge1xuICAgIGlmICh0eXBlb2YgYSA9PT0gJ29iamVjdCcgfHwgdHlwZW9mIGIgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaWYgKGEgIT09IGEgJiYgYiAhPT0gYikgeyAvLyBOYU4gY2FzZVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGEgPT09IGI7XG59O1xuXG5jb25zdCBkZXRlY3RDaGFuZ2VzID0gKG92LCBudikgPT4ge1xuICAgIGNvbnN0IGxlbiA9IG52Lmxlbmd0aDtcbiAgICBsZXQgaGFzQ2hhbmdlID0gbGVuID4gMTA7XG4gICAgc3dpdGNoIChsZW4pIHtcbiAgICAgICAgY2FzZSAxMDpcbiAgICAgICAgICAgIGhhc0NoYW5nZSA9ICFwcmltaXRpdmVFcXVhbHMob3ZbOV0sIG52WzldKTtcbiAgICAgICAgICAgIGlmIChoYXNDaGFuZ2UpIHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgY2FzZSA5OlxuICAgICAgICAgICAgaGFzQ2hhbmdlID0gIXByaW1pdGl2ZUVxdWFscyhvdls4XSwgbnZbOF0pO1xuICAgICAgICAgICAgaWYgKGhhc0NoYW5nZSkge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICBjYXNlIDg6XG4gICAgICAgICAgICBoYXNDaGFuZ2UgPSAhcHJpbWl0aXZlRXF1YWxzKG92WzddLCBudls3XSk7XG4gICAgICAgICAgICBpZiAoaGFzQ2hhbmdlKSB7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIGNhc2UgNzpcbiAgICAgICAgICAgIGhhc0NoYW5nZSA9ICFwcmltaXRpdmVFcXVhbHMob3ZbNl0sIG52WzZdKTtcbiAgICAgICAgICAgIGlmIChoYXNDaGFuZ2UpIHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgY2FzZSA2OlxuICAgICAgICAgICAgaGFzQ2hhbmdlID0gIXByaW1pdGl2ZUVxdWFscyhvdls1XSwgbnZbNV0pO1xuICAgICAgICAgICAgaWYgKGhhc0NoYW5nZSkge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICBjYXNlIDU6XG4gICAgICAgICAgICBoYXNDaGFuZ2UgPSAhcHJpbWl0aXZlRXF1YWxzKG92WzRdLCBudls0XSk7XG4gICAgICAgICAgICBpZiAoaGFzQ2hhbmdlKSB7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgIGhhc0NoYW5nZSA9ICFwcmltaXRpdmVFcXVhbHMob3ZbM10sIG52WzNdKTtcbiAgICAgICAgICAgIGlmIChoYXNDaGFuZ2UpIHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgY2FzZSAzOlxuICAgICAgICAgICAgaGFzQ2hhbmdlID0gIXByaW1pdGl2ZUVxdWFscyhvdlsyXSwgbnZbMl0pO1xuICAgICAgICAgICAgaWYgKGhhc0NoYW5nZSkge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgICBoYXNDaGFuZ2UgPSAhcHJpbWl0aXZlRXF1YWxzKG92WzFdLCBudlsxXSk7XG4gICAgICAgICAgICBpZiAoaGFzQ2hhbmdlKSB7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIGNhc2UgMTpcbiAgICAgICAgICAgIGhhc0NoYW5nZSA9ICFwcmltaXRpdmVFcXVhbHMob3ZbMF0sIG52WzBdKTtcbiAgICAgICAgICAgIGlmIChoYXNDaGFuZ2UpIHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGhhc0NoYW5nZTtcbn07XG5cbmNvbnN0IGdldFB1cmVQaXBlVmFsID0gKHBpcGUsIGNhY2hlLCBpZGVudGlmaWVyLCAuLi5hcmdzKSA9PiB7XG4gICAgbGV0IGxhc3RSZXN1bHQgPSBjYWNoZS5nZXQoaWRlbnRpZmllcik7XG4gICAgbGV0IHJlc3VsdDtcbiAgICBpZiAobGFzdFJlc3VsdCkge1xuICAgICAgICBjb25zdCBpc01vZGlmaWVkID0gZGV0ZWN0Q2hhbmdlcyhsYXN0UmVzdWx0LmFyZ3MsIGFyZ3MpO1xuICAgICAgICBpZiAoIWlzTW9kaWZpZWQpIHtcbiAgICAgICAgICAgIHJldHVybiBsYXN0UmVzdWx0LnJlc3VsdDtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXN1bHQgPSBwaXBlLnRyYW5zZm9ybSguLi5hcmdzKTtcbiAgICBsYXN0UmVzdWx0ID0ge2FyZ3MsIHJlc3VsdH07XG4gICAgY2FjaGUuc2V0KGlkZW50aWZpZXIsIGxhc3RSZXN1bHQpO1xuICAgIHJldHVybiByZXN1bHQ7XG59O1xuXG5jb25zdCBTVFJfRVNDQVBFX1JFR0VYID0gL1teIGEtekEtWjAtOV0vZztcblxuY29uc3Qgc3RyaW5nRXNjYXBlRm4gPSBzdHIgPT4ge1xuICAgIHJldHVybiAnXFxcXHUnICsgKCcwMDAwJyArIHN0ci5jaGFyQ29kZUF0KDApLnRvU3RyaW5nKDE2KSkuc2xpY2UoLTQpO1xufTtcblxuY2xhc3MgQVNUQ29tcGlsZXIge1xuICAgIGFzdDsgLy8gYXN0IHRvIGJlIGNvbXBpbGVkXG4gICAgZGVjbGFyYXRpb25zOyAvLyB2YXJpYWJsZSBuYW1lc1xuICAgIHN0bXRzOyAvLyBmdW5jdGlvbiBib2R5IHN0YXRlbWVudHNcbiAgICBwaXBlczsgLy8gdXNlZCBwaXBlc1xuICAgIHZJZHg7IC8vIHZhcmlhYmxlIG5hbWUgaW5kZXhcbiAgICBjQXN0OyAvLyBjdXJyZW50IEFTVCBub2RlIGluIHRoZSBwcm9jZXNzXG4gICAgY1N0bXRzO1xuICAgIHBpcGVOYW1lVnNJc1B1cmVNYXA7XG4gICAgZXhwclR5cGU6IEV4cHJlc3Npb25UeXBlO1xuXG4gICAgY29uc3RydWN0b3IoYXN0LCBleHByVHlwZSwgcGlwZU5hbWVWc0lzUHVyZU1hcD8pIHtcbiAgICAgICAgdGhpcy5hc3QgPSBhc3Q7XG4gICAgICAgIHRoaXMuZGVjbGFyYXRpb25zID0gW107XG4gICAgICAgIHRoaXMuc3RtdHMgPSBbXTtcbiAgICAgICAgdGhpcy5waXBlcyA9IFtdO1xuICAgICAgICB0aGlzLnZJZHggPSAwO1xuICAgICAgICB0aGlzLmV4cHJUeXBlID0gZXhwclR5cGU7XG4gICAgICAgIHRoaXMucGlwZU5hbWVWc0lzUHVyZU1hcCA9IHBpcGVOYW1lVnNJc1B1cmVNYXA7XG4gICAgfVxuXG4gICAgY3JlYXRlVmFyKCkge1xuICAgICAgICBjb25zdCB2ID0gYHYke3RoaXMudklkeCsrfWA7XG4gICAgICAgIHRoaXMuZGVjbGFyYXRpb25zLnB1c2godik7XG4gICAgICAgIHJldHVybiB2O1xuICAgIH1cblxuICAgIHByb2Nlc3NJbXBsaWNpdFJlY2VpdmVyKCkge1xuICAgICAgICByZXR1cm4gJ2N0eCc7XG4gICAgfVxuXG4gICAgcHJvY2Vzc0xpdGVyYWxQcmltaXRpdmUoKSB7XG4gICAgICAgIGNvbnN0IGFzdCA9IHRoaXMuY0FzdDtcbiAgICAgICAgcmV0dXJuIGlzU3RyaW5nKGFzdC52YWx1ZSkgPyBgXCIke2FzdC52YWx1ZS5yZXBsYWNlKC9cIi9nLCAnXFxcIicpLnJlcGxhY2UoU1RSX0VTQ0FQRV9SRUdFWCwgc3RyaW5nRXNjYXBlRm4pfVwiYCA6IGFzdC52YWx1ZTtcbiAgICB9XG5cbiAgICBwcm9jZXNzTGl0ZXJhbEFycmF5KCkge1xuICAgICAgICBjb25zdCBhc3QgPSB0aGlzLmNBc3Q7XG4gICAgICAgIGNvbnN0IHN0bXRzID0gdGhpcy5jU3RtdHM7XG4gICAgICAgIGNvbnN0IHYgPSB0aGlzLmNyZWF0ZVZhcigpO1xuICAgICAgICBjb25zdCBzID0gW107XG4gICAgICAgIGZvciAoY29uc3QgaXRlbSBvZiBhc3QuZXhwcmVzc2lvbnMpIHtcbiAgICAgICAgICAgIHMucHVzaCh0aGlzLmJ1aWxkKGl0ZW0sIHN0bXRzKSk7XG4gICAgICAgIH1cbiAgICAgICAgc3RtdHMucHVzaChgJHt2fT1bJHtzLmpvaW4oJywnKX1dYCk7XG4gICAgICAgIHJldHVybiB2O1xuICAgIH1cblxuICAgIHByb2Nlc3NMaXRlcmFsTWFwKCkge1xuICAgICAgICBjb25zdCBhc3QgPSB0aGlzLmNBc3Q7XG4gICAgICAgIGNvbnN0IHN0bXRzID0gdGhpcy5jU3RtdHM7XG4gICAgICAgIGNvbnN0IHYgPSB0aGlzLmNyZWF0ZVZhcigpO1xuICAgICAgICBjb25zdCBfdmFsdWVzID0gW107XG4gICAgICAgIGZvciAoY29uc3QgX3ZhbHVlIG9mIGFzdC52YWx1ZXMpIHtcbiAgICAgICAgICAgIF92YWx1ZXMucHVzaCh0aGlzLmJ1aWxkKF92YWx1ZSwgc3RtdHMpKTtcbiAgICAgICAgfVxuICAgICAgICBzdG10cy5wdXNoKGAke3Z9PXske2FzdC5rZXlzLm1hcCgoaywgaSkgPT4gYCcke2sua2V5fSc6JHtfdmFsdWVzW2ldfWApfX1gKTtcbiAgICAgICAgcmV0dXJuIHY7XG4gICAgfVxuXG4gICAgcHJvY2Vzc1Byb3BlcnR5UmVhZCgpIHtcbiAgICAgICAgY29uc3QgYXN0ID0gdGhpcy5jQXN0O1xuICAgICAgICBjb25zdCBzdG10cyA9IHRoaXMuY1N0bXRzO1xuICAgICAgICBjb25zdCByID0gdGhpcy5idWlsZChhc3QucmVjZWl2ZXIsIHN0bXRzKTtcbiAgICAgICAgY29uc3QgdiA9IHRoaXMuY3JlYXRlVmFyKCk7XG4gICAgICAgIHN0bXRzLnB1c2goYCR7dn09JHtyfSYmJHtyfS4ke2FzdC5uYW1lfWApO1xuICAgICAgICByZXR1cm4gdjtcbiAgICB9XG5cbiAgICBwcm9jZXNzS2V5ZWRSZWFkKCkge1xuICAgICAgICBjb25zdCBhc3QgPSB0aGlzLmNBc3Q7XG4gICAgICAgIGNvbnN0IHN0bXRzID0gdGhpcy5jU3RtdHM7XG4gICAgICAgIGNvbnN0IGsgPSB0aGlzLmJ1aWxkKGFzdC5rZXksIHN0bXRzKTtcbiAgICAgICAgY29uc3QgbyA9IHRoaXMuYnVpbGQoYXN0Lm9iaiwgc3RtdHMpO1xuICAgICAgICBjb25zdCB2ID0gdGhpcy5jcmVhdGVWYXIoKTtcbiAgICAgICAgc3RtdHMucHVzaChgJHt2fT0ke299JiYke299WyR7a31dYCk7XG4gICAgICAgIHJldHVybiB2O1xuICAgIH1cblxuICAgIHByb2Nlc3NQcmVmaXhOb3QoKSB7XG4gICAgICAgIGNvbnN0IGFzdCA9IHRoaXMuY0FzdDtcbiAgICAgICAgY29uc3Qgc3RtdHMgPSB0aGlzLmNTdG10cztcbiAgICAgICAgY29uc3QgciA9IHRoaXMuYnVpbGQoYXN0LmV4cHJlc3Npb24sIHN0bXRzKTtcbiAgICAgICAgc3RtdHMucHVzaChgJHtyfT0hJHtyfWApO1xuICAgICAgICByZXR1cm4gcjtcbiAgICB9XG5cbiAgICBoYW5kbGVCaW5hcnlQbHVzX01pbnVzKCkge1xuICAgICAgICBjb25zdCBhc3QgPSB0aGlzLmNBc3Q7XG4gICAgICAgIGNvbnN0IHN0bXRzID0gdGhpcy5jU3RtdHM7XG4gICAgICAgIGNvbnN0IGwgPSB0aGlzLmJ1aWxkKGFzdC5sZWZ0LCBzdG10cyk7XG4gICAgICAgIGNvbnN0IHIgPSB0aGlzLmJ1aWxkKGFzdC5yaWdodCwgc3RtdHMpO1xuICAgICAgICBjb25zdCB2ID0gdGhpcy5jcmVhdGVWYXIoKTtcbiAgICAgICAgY29uc3QgbSA9IGFzdC5vcGVyYXRpb24gPT09ICcrJyA/ICdfcGx1cycgOiAnX21pbnVzJztcbiAgICAgICAgc3RtdHMucHVzaChgJHt2fT0ke219KCR7bH0sJHtyfSlgKTtcbiAgICAgICAgcmV0dXJuIHY7XG4gICAgfVxuXG4gICAgaGFuZGxlQmluYXJ5QU5EX09SKCkge1xuICAgICAgICBjb25zdCBhc3QgPSB0aGlzLmNBc3Q7XG4gICAgICAgIGNvbnN0IHN0bXRzID0gdGhpcy5jU3RtdHM7XG4gICAgICAgIGNvbnN0IF9zMSA9IFtdO1xuICAgICAgICBjb25zdCBfc2wgPSBbXTtcbiAgICAgICAgY29uc3QgX3NyID0gW107XG4gICAgICAgIGNvbnN0IGwgPSB0aGlzLmJ1aWxkKGFzdC5sZWZ0LCBfc2wpO1xuICAgICAgICBjb25zdCByID0gdGhpcy5idWlsZChhc3QucmlnaHQsIF9zcik7XG5cbiAgICAgICAgY29uc3QgdiA9IHRoaXMuY3JlYXRlVmFyKCk7XG5cbiAgICAgICAgaWYgKGFzdC5vcGVyYXRpb24gPT09ICcmJicpIHtcbiAgICAgICAgICAgIF9zMS5wdXNoKFxuICAgICAgICAgICAgICAgIF9zbC5qb2luKCc7JyksXG4gICAgICAgICAgICAgICAgYDske3Z9PWZhbHNlYCxcbiAgICAgICAgICAgICAgICBgO2lmKCR7bH0pe2AsXG4gICAgICAgICAgICAgICAgX3NyLmpvaW4oJzsnKSxcbiAgICAgICAgICAgICAgICBgOyR7dn09JHtyfTtgLFxuICAgICAgICAgICAgICAgIGB9YFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIF9zMS5wdXNoKFxuICAgICAgICAgICAgICAgIF9zbC5qb2luKCc7JyksXG4gICAgICAgICAgICAgICAgYDske3Z9PSR7bH1gLFxuICAgICAgICAgICAgICAgIGA7aWYoISR7bH0pe2AsXG4gICAgICAgICAgICAgICAgX3NyLmpvaW4oJzsnKSxcbiAgICAgICAgICAgICAgICBgOyR7dn09JHtyfTtgLFxuICAgICAgICAgICAgICAgIGB9YFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICBzdG10cy5wdXNoKF9zMS5qb2luKCcnKSk7XG4gICAgICAgIHJldHVybiB2O1xuICAgIH1cblxuICAgIGhhbmRsZUJpbmFyeURlZmF1bHQoKSB7XG4gICAgICAgIGNvbnN0IGFzdCA9IHRoaXMuY0FzdDtcbiAgICAgICAgY29uc3Qgc3RtdHMgPSB0aGlzLmNTdG10cztcbiAgICAgICAgY29uc3QgbCA9IHRoaXMuYnVpbGQoYXN0LmxlZnQsIHN0bXRzKTtcbiAgICAgICAgY29uc3QgciA9IHRoaXMuYnVpbGQoYXN0LnJpZ2h0LCBzdG10cyk7XG4gICAgICAgIGNvbnN0IHYgPSB0aGlzLmNyZWF0ZVZhcigpO1xuICAgICAgICBzdG10cy5wdXNoKGAke3Z9PSR7bH0ke2FzdC5vcGVyYXRpb259JHtyfWApO1xuICAgICAgICByZXR1cm4gdjtcbiAgICB9XG5cbiAgICBwcm9jZXNzQmluYXJ5KCkge1xuICAgICAgICBjb25zdCBhc3QgPSB0aGlzLmNBc3Q7XG4gICAgICAgIGNvbnN0IG9wID0gYXN0Lm9wZXJhdGlvbjtcbiAgICAgICAgaWYgKG9wID09PSAnKycgfHwgb3AgPT09ICctJykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaGFuZGxlQmluYXJ5UGx1c19NaW51cygpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChvcCA9PT0gJyYmJyB8fCBvcCA9PT0gJ3x8Jykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuaGFuZGxlQmluYXJ5QU5EX09SKCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5oYW5kbGVCaW5hcnlEZWZhdWx0KCk7XG4gICAgfVxuXG4gICAgcHJvY2Vzc0NvbmRpdGlvbmFsKCkge1xuICAgICAgICBjb25zdCBhc3QgPSB0aGlzLmNBc3Q7XG4gICAgICAgIGNvbnN0IHN0bXRzID0gdGhpcy5jU3RtdHM7XG4gICAgICAgIGNvbnN0IGNvbmRpdGlvbiA9IHRoaXMuYnVpbGQoYXN0LmNvbmRpdGlvbiwgc3RtdHMpO1xuICAgICAgICBjb25zdCB2ID0gdGhpcy5jcmVhdGVWYXIoKTtcbiAgICAgICAgY29uc3QgX3MxID0gW107XG4gICAgICAgIGNvbnN0IF9zMiA9IFtdO1xuICAgICAgICBjb25zdCBfczMgPSBbXTtcbiAgICAgICAgY29uc3QgdHJ1ZUV4cCA9IHRoaXMuYnVpbGQoYXN0LnRydWVFeHAsIF9zMik7XG4gICAgICAgIGNvbnN0IGZhbHNlRXhwID0gdGhpcy5idWlsZChhc3QuZmFsc2VFeHAsIF9zMyk7XG5cbiAgICAgICAgX3MxLnB1c2goXG4gICAgICAgICAgICBgaWYoJHtjb25kaXRpb259KXtgLFxuICAgICAgICAgICAgX3MyLmpvaW4oJzsnKSxcbiAgICAgICAgICAgIGA7JHt2fT0ke3RydWVFeHB9O2AsXG4gICAgICAgICAgICBgfWVsc2V7YCxcbiAgICAgICAgICAgIF9zMy5qb2luKCc7JyksXG4gICAgICAgICAgICBgOyR7dn09JHtmYWxzZUV4cH07YCxcbiAgICAgICAgICAgIGB9YFxuICAgICAgICApO1xuXG4gICAgICAgIHN0bXRzLnB1c2goX3MxLmpvaW4oJyAnKSk7XG4gICAgICAgIHJldHVybiB2O1xuICAgIH1cblxuICAgIHByb2Nlc3NNZXRob2RDYWxsKCkge1xuICAgICAgICBjb25zdCBhc3QgPSB0aGlzLmNBc3Q7XG4gICAgICAgIGNvbnN0IHN0bXRzID0gdGhpcy5jU3RtdHM7XG4gICAgICAgIGNvbnN0IF9hcmdzID0gW107XG4gICAgICAgIGZvciAoY29uc3QgYXJnIG9mIGFzdC5hcmdzKSB7XG4gICAgICAgICAgICBfYXJncy5wdXNoKHRoaXMuYnVpbGQoYXJnLCBzdG10cykpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGZuID0gdGhpcy5idWlsZChhc3QucmVjZWl2ZXIsIHN0bXRzKTtcbiAgICAgICAgY29uc3QgdiA9IHRoaXMuY3JlYXRlVmFyKCk7XG4gICAgICAgIGNvbnN0IGlzSW1wbGljaXRSZWNlaXZlciA9IGFzdC5yZWNlaXZlciBpbnN0YW5jZW9mIEltcGxpY2l0UmVjZWl2ZXI7XG4gICAgICAgIHN0bXRzLnB1c2goYCR7dn09ICR7Zm59JiYke2ZufS4ke2FzdC5uYW1lfSYmJHtmbn0uJHthc3QubmFtZX0ke2lzSW1wbGljaXRSZWNlaXZlciA/ICcuYmluZChfY3R4KScgOiAnJ30oJHtfYXJncy5qb2luKCcsJyl9KWApO1xuICAgICAgICByZXR1cm4gdjtcbiAgICB9XG5cbiAgICBwcm9jZXNzQ2hhaW4oKSB7XG4gICAgICAgIGNvbnN0IGFzdCA9IHRoaXMuY0FzdDtcbiAgICAgICAgcmV0dXJuIGFzdC5leHByZXNzaW9ucy5tYXAoZSA9PiB0aGlzLmJ1aWxkKGUpKS5qb2luKCc7Jyk7XG4gICAgfVxuXG4gICAgcHJvY2Vzc1Byb3BlcnR5V3JpdGUoKSB7XG4gICAgICAgIGNvbnN0IGFzdCA9IHRoaXMuY0FzdDtcbiAgICAgICAgY29uc3Qgc3RtdHMgPSB0aGlzLmNTdG10cztcbiAgICAgICAgbGV0IHJlY2VpdmVyLCBsaHM7XG4gICAgICAgIGlmIChhc3QucmVjZWl2ZXIgaW5zdGFuY2VvZiBJbXBsaWNpdFJlY2VpdmVyKSB7XG4gICAgICAgICAgICBsaHMgPSBgX2N0eC4ke2FzdC5uYW1lfWA7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZWNlaXZlciA9IHRoaXMuYnVpbGQoYXN0LnJlY2VpdmVyLCBzdG10cyk7XG4gICAgICAgICAgICBsaHMgPSBgJHtyZWNlaXZlcn0ke3JlY2VpdmVyLmxlbmd0aCA/ICcuJyA6ICcnfSR7YXN0Lm5hbWV9YDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IHJocyA9IHRoaXMuYnVpbGQoYXN0LnZhbHVlLCBzdG10cyk7XG4gICAgICAgIHN0bXRzLnB1c2goYCR7bGhzfT0ke3Joc31gKTtcbiAgICB9XG5cbiAgICBwcm9jZXNzUGlwZSgpIHtcbiAgICAgICAgY29uc3QgYXN0ID0gdGhpcy5jQXN0O1xuICAgICAgICBjb25zdCBzdG10cyA9IHRoaXMuY1N0bXRzO1xuICAgICAgICBjb25zdCB0ID0gdGhpcy5jcmVhdGVWYXIoKTtcbiAgICAgICAgY29uc3QgX2FyZ3MgPSBbXTtcbiAgICAgICAgY29uc3QgX3MxID0gW107XG4gICAgICAgIGNvbnN0IF9zMiA9IFtdO1xuICAgICAgICBjb25zdCBleHAgPSB0aGlzLmJ1aWxkKGFzdC5leHAsIHN0bXRzKTtcbiAgICAgICAgZm9yIChjb25zdCBhcmcgb2YgYXN0LmFyZ3MpIHtcbiAgICAgICAgICAgIF9hcmdzLnB1c2godGhpcy5idWlsZChhcmcsIF9zMikpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcCA9IGBfcCR7dGhpcy5waXBlcy5sZW5ndGh9YDtcbiAgICAgICAgdGhpcy5waXBlcy5wdXNoKFthc3QubmFtZSwgcF0pO1xuXG4gICAgICAgIF9hcmdzLnVuc2hpZnQoZXhwKTtcblxuICAgICAgICBfczEucHVzaChcbiAgICAgICAgICAgIF9zMi5sZW5ndGggPyBfczIuam9pbignOycpICsgJzsnIDogJycsXG4gICAgICAgICAgICB0aGlzLnBpcGVOYW1lVnNJc1B1cmVNYXAuZ2V0KGFzdC5uYW1lKSA/IGAke3R9PWdldFBQVmFsKCR7cH0sX3BwYyxcIiR7cH1cIiwke19hcmdzfSlgIDogYCR7dH09JHtwfS50cmFuc2Zvcm0oJHtfYXJnc30pYFxuICAgICAgICApO1xuXG4gICAgICAgIHN0bXRzLnB1c2goX3MxLmpvaW4oJycpKTtcbiAgICAgICAgcmV0dXJuIHQ7XG4gICAgfVxuXG4gICAgYnVpbGQoYXN0LCBjU3RtdHM/KSB7XG4gICAgICAgIHRoaXMuY0FzdCA9IGFzdDtcbiAgICAgICAgdGhpcy5jU3RtdHMgPSBjU3RtdHMgfHwgdGhpcy5zdG10cztcblxuICAgICAgICBpZiAoYXN0IGluc3RhbmNlb2YgSW1wbGljaXRSZWNlaXZlcikge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucHJvY2Vzc0ltcGxpY2l0UmVjZWl2ZXIoKTtcbiAgICAgICAgfSBlbHNlIGlmIChhc3QgaW5zdGFuY2VvZiBMaXRlcmFsUHJpbWl0aXZlKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wcm9jZXNzTGl0ZXJhbFByaW1pdGl2ZSgpO1xuICAgICAgICB9IGVsc2UgaWYgKGFzdCBpbnN0YW5jZW9mIExpdGVyYWxBcnJheSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucHJvY2Vzc0xpdGVyYWxBcnJheSgpO1xuICAgICAgICB9IGVsc2UgaWYgKGFzdCBpbnN0YW5jZW9mIExpdGVyYWxNYXApIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnByb2Nlc3NMaXRlcmFsTWFwKCk7XG4gICAgICAgIH0gZWxzZSBpZiAoYXN0IGluc3RhbmNlb2YgUHJvcGVydHlSZWFkKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wcm9jZXNzUHJvcGVydHlSZWFkKCk7XG4gICAgICAgIH0gZWxzZSBpZiAoYXN0IGluc3RhbmNlb2YgUHJvcGVydHlXcml0ZSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucHJvY2Vzc1Byb3BlcnR5V3JpdGUoKTtcbiAgICAgICAgfSBlbHNlIGlmIChhc3QgaW5zdGFuY2VvZiBLZXllZFJlYWQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnByb2Nlc3NLZXllZFJlYWQoKTtcbiAgICAgICAgfSBlbHNlIGlmIChhc3QgaW5zdGFuY2VvZiBQcmVmaXhOb3QpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnByb2Nlc3NQcmVmaXhOb3QoKTtcbiAgICAgICAgfSBlbHNlIGlmIChhc3QgaW5zdGFuY2VvZiBCaW5hcnkpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnByb2Nlc3NCaW5hcnkoKTtcbiAgICAgICAgfSBlbHNlIGlmIChhc3QgaW5zdGFuY2VvZiBDb25kaXRpb25hbCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucHJvY2Vzc0NvbmRpdGlvbmFsKCk7XG4gICAgICAgIH0gZWxzZSBpZiAoYXN0IGluc3RhbmNlb2YgTWV0aG9kQ2FsbCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucHJvY2Vzc01ldGhvZENhbGwoKTtcbiAgICAgICAgfSBlbHNlIGlmIChhc3QgaW5zdGFuY2VvZiBDaGFpbikge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucHJvY2Vzc0NoYWluKCk7XG4gICAgICAgIH0gZWxzZSBpZiAoYXN0IGluc3RhbmNlb2YgQmluZGluZ1BpcGUpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnByb2Nlc3NQaXBlKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBleHRlbmRDdHhXaXRoTG9jYWxzKCkge1xuICAgICAgICBjb25zdCB2MSA9IHRoaXMuY3JlYXRlVmFyKCk7XG4gICAgICAgIHRoaXMuc3RtdHMucHVzaChcbiAgICAgICAgICAgIGAke3YxfT1PYmplY3QuYXNzaWduKHt9LCBsb2NhbHMpYCxcbiAgICAgICAgICAgIGBPYmplY3Quc2V0UHJvdG90eXBlT2YoJHt2MX0sIF9jdHgpYCxcbiAgICAgICAgICAgIGBjdHg9JHt2MX1gXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgZm5Cb2R5KCkge1xuICAgICAgICB0aGlzLmRlY2xhcmF0aW9ucy5wdXNoKCdjdHgnKTtcbiAgICAgICAgcmV0dXJuICdcInVzZSBzdHJpY3RcIjtcXG52YXIgJyArIHRoaXMuZGVjbGFyYXRpb25zLmpvaW4oJywnKSArICc7XFxuJyArIHRoaXMuc3RtdHMuam9pbignOycpO1xuICAgIH1cblxuICAgIGZuQXJncygpIHtcbiAgICAgICAgY29uc3QgYXJncyA9IFsnX3BsdXMnLCAnX21pbnVzJywgJ19pc0RlZiddO1xuXG4gICAgICAgIGlmICh0aGlzLmV4cHJUeXBlID09PSBFeHByZXNzaW9uVHlwZS5CaW5kaW5nKSB7XG4gICAgICAgICAgICBhcmdzLnB1c2goJ2dldFBQVmFsJywgJ19wcGMnKTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgWywgcGlwZVZhcl0gb2YgdGhpcy5waXBlcykge1xuICAgICAgICAgICAgICAgIGFyZ3MucHVzaChwaXBlVmFyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGFyZ3MucHVzaCgnX2N0eCcsICdsb2NhbHMnKTtcblxuICAgICAgICByZXR1cm4gYXJncy5qb2luKCcsJyk7XG4gICAgfVxuXG4gICAgYWRkUmV0dXJuU3RtdChyZXN1bHQpIHtcbiAgICAgICAgLy8gaWYgKHRoaXMuZXhwclR5cGUgPT09IEV4cHJlc3Npb25UeXBlLkJpbmRpbmcpIHtcbiAgICAgICAgICAgIHRoaXMuc3RtdHMucHVzaChgcmV0dXJuICR7cmVzdWx0fTtgKTtcbiAgICAgICAgLy8gfVxuICAgIH1cblxuICAgIGNsZWFudXAoKSB7XG4gICAgICAgIHRoaXMuYXN0ID0gdGhpcy5jQXN0ID0gdGhpcy5zdG10cyA9IHRoaXMuY1N0bXRzID0gdGhpcy5kZWNsYXJhdGlvbnMgPSB0aGlzLnBpcGVzID0gdGhpcy5waXBlTmFtZVZzSXNQdXJlTWFwID0gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGNvbXBpbGUoKSB7XG4gICAgICAgIHRoaXMuZXh0ZW5kQ3R4V2l0aExvY2FscygpO1xuICAgICAgICB0aGlzLmFkZFJldHVyblN0bXQodGhpcy5idWlsZCh0aGlzLmFzdCkpO1xuXG4gICAgICAgIGNvbnN0IGZuID0gbmV3IEZ1bmN0aW9uKHRoaXMuZm5BcmdzKCksIHRoaXMuZm5Cb2R5KCkpO1xuICAgICAgICBsZXQgYm91bmRGbjtcbiAgICAgICAgaWYgKHRoaXMuZXhwclR5cGUgPT09IEV4cHJlc3Npb25UeXBlLkJpbmRpbmcpIHtcbiAgICAgICAgICAgIGJvdW5kRm4gPSBmbi5iaW5kKHVuZGVmaW5lZCwgcGx1cywgbWludXMsIGlzRGVmLCBnZXRQdXJlUGlwZVZhbCk7XG4gICAgICAgICAgICBib3VuZEZuLnVzZWRQaXBlcyA9IHRoaXMucGlwZXMuc2xpY2UoMCk7IC8vIGNsb25lXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBib3VuZEZuID0gZm4uYmluZCh1bmRlZmluZWQsIHBsdXMsIG1pbnVzLCBpc0RlZik7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmNsZWFudXAoKTtcbiAgICAgICAgcmV0dXJuIGJvdW5kRm47XG4gICAgfVxufVxuXG5jb25zdCBudWxsUGlwZSA9ICgpID0+IHtcbiAgICByZXR1cm4ge1xuICAgICAgICB0cmFuc2Zvcm06IG5vb3BcbiAgICB9O1xufTtcblxubGV0IHBpcGVQcm92aWRlcjtcblxuZXhwb3J0IGZ1bmN0aW9uIHNldFBpcGVQcm92aWRlcihfcGlwZVByb3ZpZGVyKSB7XG4gICAgcGlwZVByb3ZpZGVyID0gX3BpcGVQcm92aWRlcjtcbn1cblxuZW51bSBFeHByZXNzaW9uVHlwZSB7XG4gICAgQmluZGluZyxcbiAgICBBY3Rpb25cbn1cblxuZXhwb3J0IGZ1bmN0aW9uICRwYXJzZUV4cHIoZXhwcjogc3RyaW5nKTogUGFyc2VFeHByUmVzdWx0IHtcblxuICAgIGlmICghcGlwZVByb3ZpZGVyKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdzZXQgcGlwZSBwcm92aWRlcicpO1xuICAgICAgICByZXR1cm4gbm9vcDtcbiAgICB9XG5cbiAgICBpZiAoIWlzU3RyaW5nKGV4cHIpKSB7XG4gICAgICAgIHJldHVybiBub29wO1xuICAgIH1cblxuICAgIGV4cHIgPSBleHByLnRyaW0oKTtcblxuICAgIGlmIChleHByLmVuZHNXaXRoKCc7JykpIHtcbiAgICAgICAgZXhwciA9IGV4cHIuc2xpY2UoMCwgLTEpOyAvLyByZW1vdmUgdGhlIHRyYWlsaW5nIHNlbWljb2xvblxuICAgIH1cblxuICAgIGlmICghZXhwci5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIG5vb3A7XG4gICAgfVxuXG4gICAgbGV0IGZuID0gZXhwckZuQ2FjaGUuZ2V0KGV4cHIpO1xuXG4gICAgaWYgKGZuKSB7XG4gICAgICAgIHJldHVybiBmbjtcbiAgICB9XG4gICAgY29uc3QgcGFyc2VyID0gbmV3IFBhcnNlcihuZXcgTGV4ZXIpO1xuICAgIGNvbnN0IGFzdCA9IHBhcnNlci5wYXJzZUJpbmRpbmcoZXhwciwgJycpO1xuICAgIGxldCBib3VuZEZuO1xuXG4gICAgaWYgKGFzdC5lcnJvcnMubGVuZ3RoKSB7XG4gICAgICAgIGZuID0gbm9vcDtcbiAgICAgICAgYm91bmRGbiA9IGZuO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHBpcGVOYW1lVnNJc1B1cmVNYXAgPSBwaXBlUHJvdmlkZXIuZ2V0UGlwZU5hbWVWc0lzUHVyZU1hcCgpO1xuICAgICAgICBjb25zdCBhc3RDb21waWxlciA9IG5ldyBBU1RDb21waWxlcihhc3QuYXN0LCBFeHByZXNzaW9uVHlwZS5CaW5kaW5nLCBwaXBlTmFtZVZzSXNQdXJlTWFwKTtcbiAgICAgICAgZm4gPSBhc3RDb21waWxlci5jb21waWxlKCk7XG4gICAgICAgIGlmIChmbi51c2VkUGlwZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICBjb25zdCBwaXBlQXJncyA9IFtdO1xuICAgICAgICAgICAgbGV0IGhhc1B1cmVQaXBlID0gZmFsc2U7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IFtwaXBlTmFtZV0gb2YgZm4udXNlZFBpcGVzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcGlwZUluZm8gPSBwaXBlUHJvdmlkZXIubWV0YShwaXBlTmFtZSk7XG4gICAgICAgICAgICAgICAgbGV0IHBpcGVJbnN0YW5jZTtcbiAgICAgICAgICAgICAgICBpZiAoIXBpcGVJbmZvKSB7XG4gICAgICAgICAgICAgICAgICAgIHBpcGVJbnN0YW5jZSA9IG51bGxQaXBlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwaXBlSW5mby5wdXJlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBoYXNQdXJlUGlwZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBwaXBlSW5zdGFuY2UgPSBwdXJlUGlwZXMuZ2V0KHBpcGVOYW1lKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIGlmICghcGlwZUluc3RhbmNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwaXBlSW5zdGFuY2UgPSBwaXBlUHJvdmlkZXIuZ2V0SW5zdGFuY2UocGlwZU5hbWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHBpcGVJbmZvLnB1cmUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHB1cmVQaXBlcy5zZXQocGlwZU5hbWUsIHBpcGVJbnN0YW5jZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcGlwZUFyZ3MucHVzaChwaXBlSW5zdGFuY2UpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBwaXBlQXJncy51bnNoaWZ0KGhhc1B1cmVQaXBlID8gbmV3IE1hcCgpIDogdW5kZWZpbmVkKTtcbiAgICAgICAgICAgIGJvdW5kRm4gPSBmbi5iaW5kKHVuZGVmaW5lZCwgLi4ucGlwZUFyZ3MpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYm91bmRGbiA9IGZuLmJpbmQodW5kZWZpbmVkLCB1bmRlZmluZWQpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGV4cHJGbkNhY2hlLnNldChleHByLCBib3VuZEZuKTtcblxuICAgIHJldHVybiBib3VuZEZuO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gJHBhcnNlRXZlbnQoZXhwcik6IFBhcnNlRXhwclJlc3VsdCB7XG4gICAgaWYgKCFpc1N0cmluZyhleHByKSkge1xuICAgICAgICByZXR1cm4gbm9vcDtcbiAgICB9XG5cbiAgICBleHByID0gZXhwci50cmltKCk7XG5cbiAgICBpZiAoIWV4cHIubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybiBub29wO1xuICAgIH1cblxuICAgIGxldCBmbiA9IGV2ZW50Rm5DYWNoZS5nZXQoZXhwcik7XG5cbiAgICBpZiAoZm4pIHtcbiAgICAgICAgcmV0dXJuIGZuO1xuICAgIH1cbiAgICBjb25zdCBwYXJzZXIgPSBuZXcgUGFyc2VyKG5ldyBMZXhlcik7XG4gICAgY29uc3QgYXN0ID0gcGFyc2VyLnBhcnNlQWN0aW9uKGV4cHIsICcnKTtcblxuICAgIGlmIChhc3QuZXJyb3JzLmxlbmd0aCkge1xuICAgICAgICByZXR1cm4gbm9vcDtcbiAgICB9XG4gICAgY29uc3QgYXN0Q29tcGlsZXIgPSBuZXcgQVNUQ29tcGlsZXIoYXN0LmFzdCwgRXhwcmVzc2lvblR5cGUuQWN0aW9uKTtcbiAgICBmbiA9IGFzdENvbXBpbGVyLmNvbXBpbGUoKTtcbiAgICBldmVudEZuQ2FjaGUuc2V0KGV4cHIsIGZuKTtcbiAgICByZXR1cm4gZm47XG59XG4iXX0=