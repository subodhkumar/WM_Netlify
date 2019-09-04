export declare type ParseExprResult = (data?: any, locals?: any) => any;
export declare function setPipeProvider(_pipeProvider: any): void;
export declare function $parseExpr(expr: string): ParseExprResult;
export declare function $parseEvent(expr: any): ParseExprResult;
