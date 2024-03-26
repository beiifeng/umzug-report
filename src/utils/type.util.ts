export const isNull = (val: any): val is null => val === null;
export const isUndefined = (val: any): val is undefined => val === undefined;
export const isNil = (val: any): boolean => isNull(val) || isUndefined(val);

export const isString = (val: any): val is string => Object.prototype.toString.call(val) === '[object String]';
export const isNumber = (val: any): val is number => Object.prototype.toString.call(val) === '[object Number]';
export const isBoolean = (val: any): val is boolean => Object.prototype.toString.call(val) === '[object Boolean]';
export const isObject = (val: any): val is object => Object.prototype.toString.call(val) === '[object Object]';
export const isDate = (val: any): val is Date => Object.prototype.toString.call(val) === '[object Date]';
export const isArray = (val: any): val is Array<any> => Object.prototype.toString.call(val) === '[object Array]';

export const isBasic = (val: any): boolean => isString(val) || isNumber(val) || isBoolean(val) || isNil(val);

export const isPromise = (val: any): val is Promise<any> => Object.prototype.toString.call(val) === '[object Promise]';
