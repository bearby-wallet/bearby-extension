type Arg = string | Array<string | number | null | undefined | unknown> | unknown | null | undefined | object | number;

export const TypeOf = Object.freeze({

  isArray(argument: Arg) {
    return Object.prototype.toString.call(argument) === '[object Array]';
  },

  isObject(argument: Arg) {
    return Object.prototype.toString.call(argument) === '[object Object]';
  },

  isNumber(argument: Arg) {
    return Object.prototype.toString.call(argument) === '[object Number]' 
      && !isNaN(Number(argument));
  },

  isInt(argument: Arg) {
    try {
      return Boolean(BigInt(String(argument)));
    } catch {
      return false;
    }
  },

  isError(argument: Arg) {
    return Object.prototype.toString.call(argument) === '[object Error]';
  },

  isString(argument: Arg) {
    return Object.prototype.toString.call(argument) === '[object String]';
  },

  isBoolean(argument: Arg) {
    return Object.prototype.toString.call(argument) === '[object Boolean]';
  },

  isNull(argument: Arg) {
    return Object.prototype.toString.call(argument) === '[object Null]';
  },

  isUndefined(argument: Arg) {
    return Object.prototype.toString.call(argument) === '[object Undefined]';
  },

  isEmptyObject(argument: Arg) {
    if(!this.isObject(argument)) {
      return false;
    } else {
      return Object.getOwnPropertyNames(argument).length === 0;
    }
  },

  isEmptyArray<T>(argument: Array<T>) {
    if(!this.isArray(argument)) {
      return false;
    } else {
      return argument.length === 0;
    }
  },

  getType(argument: Arg): string {
    if(Number.isNaN(argument)) {
      return 'NaN';
    }
    return Object.prototype.toString.call(argument).split(' ')[1].slice(0,-1).toLowerCase();
  }
});
