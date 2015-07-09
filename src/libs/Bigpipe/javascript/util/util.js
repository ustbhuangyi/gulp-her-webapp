function ajax(url, cb, data) {
  var xhr = new (window.XMLHttpRequest || ActiveXObject)("Microsoft.XMLHTTP");

  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4) {
      cb(xhr.responseText);
    }
  };
  xhr.open(data ? 'POST' : 'GET', url + '&t=' + ~~(Math.random() * 1e6), true);

  if (data) {
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  }
  xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
  xhr.send(data);
}
;
/**
 * 一个简单的 AMD define 实现
 *
 * @param {String} name 模块名
 * @param {Array} dependencies 依赖模块
 * @param {factory} factory 模块函数
 * @access public
 * @return void
 * @see require
 */

var _module_map = {};

function define(id, dependencies, factory) {
  _module_map[id] = {
    factory: factory,
    deps: dependencies
  };
}

function require(id) {
  var module = _module_map[id];
  if (!hasOwnProperty(_module_map, id))
    throw new Error('Requiring unknown module "' + id + '"');
  if (hasOwnProperty(module, "exports"))
    return module.exports;

  var exports;
  module.exports = exports = {};

  var args = buildArguments(module.deps, require, module, exports);

  module.factory.apply(undefined, args);

  return module.exports;
}

/**
 * 根据 id 数组生成模块数组
 * 实现AMD规范
 *
 * @param {Array} deps 依赖的模块名列表
 * @param {Function} require require函数
 * @param {Object} module 模块
 * @param {Object} exports 模块的 exports 对象
 * @access public
 * @return {Array} 执行 require 后的模块数组
 */
function buildArguments(deps, require, module, exports) {
  var index, count, did, args;

  args = [];
  count = deps.length;
  for (index = 0; index < count; index++) {
    did = deps[index];
    if (did === "require") {
      args.push(require);
    } else if (did === "module") {
      args.push(module);
    } else if (did === "exports") {
      args.push(exports);
    } else {
      args.push(require(did));
    }
  }
  return args;
}

function __b(id, exports) {
  _module_map[id] = {
    exports: exports
  };
}

function __d(id, dependencies, factory) {
  return define(id, ['global', 'require', 'module', 'exports'].concat(dependencies), factory);
}

__b("global", global);
;
function appendToHead(element) {
  var hardpoint,
    heads = document.getElementsByTagName('head');
  hardpoint = heads.length && heads[0] || document.body;

  appendToHead = function (element) {
    hardpoint.appendChild(element);
  };
  return appendToHead(element);
}
;
/**
 * bind 方法会创建一个新函数,称为绑定函数.
 * 当调用这个绑定函数时,绑定函数会以创建它时传入bind方法的第二个参数作为this,
 * 传入bind方法的第三个以及以后的参数加上绑定函数运行时本身的参数按照顺序作为原函数的参数来调用原函数.
 *
 * @param {Function} fn 摇绑定的函数
 * @param {Object} thisObj 调用函数时的 this 对象
 * @param {...*} [args] 执行函数时的参数
 * @access public
 * @return {Function} 绑定后的函数
 *
 * @example
 *
 * var obj = {
 *      name: "it's me!"
 * };
 *
 * var fn = bind(function(){
 *      console.log(this.name);
 *      console.log(arguments);
 * }, obj, 1, 2, 3);
 *
 * fn(4, 5, 6);
 * // it's me
 * // [ 1, 2, 3, 4, 5, 6]
 */
function bind(fn, thisObj /*, args... */) {

  function _bind(fn, thisObj /*, args... */) {
    var savedArgs, //保存绑定的参数
      savedArgLen, //绑定参数的个数
      ret; //返回函数

    // 判断是否有绑定的参数
    savedArgLen = arguments.length - 2;
    if (savedArgLen > 0) {
      //有绑定参数，需要拼接调用参数
      savedArgs = slice(arguments, 2);
      ret = function () {
        var args = toArray(arguments),
          index = savedArgLen;
        //循环将保存的参数移入调用参数
        //这里不使用 Array.prototype.concat 也是为了避免内存浪费
        while (index--) {
          args.unshift(savedArgs[index]);
        }
        return fn.apply(thisObj, args);
      };
    } else {
      // 没有绑定参数，直接调用，减少内存消耗
      ret = function () {
        return fn.apply(thisObj, arguments);
      };
    }

    return ret;
  }

  //保存原生的 bind 函数
  var native_bind = Function.prototype.bind;
  //修改 bind 函数指针
  if (native_bind) {
    //如果原生支持 Function.prototype.bind 则使用原生函数来实现
    bind = function (fn, thisObj /*, args... */) {
      return native_bind.apply(fn, slice(arguments, 1));
    };
  } else {
    bind = _bind;
  }

  return bind.apply(this, arguments);
}
;
/**
 * 复制属性到对象
 *
 * @param {Object} to 目标对象
 * @param {...Object} from 多个参数
 * @access public
 * @return {Object} 目标对象
 *
 * @example
 * var objA = {
 *         a : 1
 *     },
 *     objB = {
 *         b : 2
 *     };
 *
 * copyProperties(objA, objB, {
 *      c : 3
 * });
 * console.log(objA);
 * // {
 * // a : 1,
 * // b : 2,
 * // c : 3
 * // }
 */
function copyProperties(to /*, ...*/) {
  var index, count, item, key;

  to = to || {};
  count = arguments.length;

  //遍历参数列表
  for (index = 1; index < count; index++) {
    item = arguments[index];
    for (key in item) {
      //只复制自有属性
      if (hasOwnProperty(item, key)) {
        to[key] = item[key];
      }
    }
  }

  return to;
}
;
/**
 * 计数器，返回一个用于计数调用的函数，每调用该函数一次，内部的计数器加一，直到达到 total 所指定次数，则调用 callback 函数。如果传递了 timeout 参数，则在 timeout 毫秒后如果还未达到指定次数，则调用 callback
 *
 * @param {Number} total 计数次数
 * @param {Function} callback 计数完成或超时后的回调函数
 * @param {Number} timeout 超时时间
 * @access public
 * @return {Function} 计数函数，每调用一次，内部的计数器就会加一
 *
 *
 * @example
 * var add = counter(4, function(){
 *      console.log("add 4 times!");
 * });
 *
 * add();
 * add();
 * add();
 * add(); // add 4 times!
 */

function counter(total, callback, timeout) {
  var running = true, //是否正在计数
    count = 0, //当前计数值
    timeoutId = null; //超时标记

  // 计数完成或者超时后的回调函数
  function done() {
    if (!running) {
      return;
    }

    running = false;
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    //TODO 参数?错误处理?
    callback();
  }

  //将 total 值转换为整数
  total = total | 0;

  //如果目标计数值小于0,则直接调用done
  if (total <= 0) {
    done();
  } else if (timeout !== undefined) {
    timeoutId = setTimeout(done, timeout);
  }

  //返回计数器触发函数
  //该函数每执行一次，计数器加一
  //直到到达设定的 total 值或者超时
  return function () {
    if (running && ++count >= total) {
      done();
    }
  };
}
;
/**
 * Js 派生实现
 *
 * @param {Function} parent 父类
 * @param {Function} [constructor]  子类构造函数
 * @param {Object} [proto] 子类原型
 * @access public
 * @return {Function} 新的类
 *
 * @example
 *
 * var ClassA = derive(Object, function(__super){
 *      console.log("I'm an instance of ClassA:", this instanceof ClassA);
 * });
 *
 * var ClassB = derive(ClassA, function(__super){
 *      console.log("I'm an instance of ClassB:", this instanceof ClassB);
 *      __super();
 * }, {
 *      test:function(){
 *          console.log("test method!");
 *      }
 * });
 *
 * var b = new ClassB();
 * //I'm an instance of ClassA: true
 * //I'm an instance of ClassA: true
 * b.test();
 * //test method!
 */
function derive(parent, constructor, proto) {

  //如果没有传 constructor 参数
  if (typeof constructor === 'object') {
    proto = constructor;
    constructor = proto.constructor || function () {
    };
    delete proto.constructor;
  }

  var tmp = function () {
    },
  //子类构造函数
    subClass = function () {
      //有可能子类和父类初始化参数定义不同，所以将初始化延迟到子类构造函数中执行
      //构造一个 __super 函数,用于子类中调用父类构造函数
      var __super = bind(parent, this),
        args = slice(arguments);

      //将 __super 函数作为 constructor 的第一个参数
      args.unshift(__super);
      constructor.apply(this, args);

      //parent.apply(this, arguments);
      //constructor.apply(this, arguments);
    },
    subClassPrototype;

  //原型链桥接
  tmp.prototype = parent.prototype;
  subClassPrototype = new tmp();

  //复制属性到子类的原型链上
  copyProperties(
    subClassPrototype,
    constructor.prototype,
    proto || {});

  subClassPrototype.constructor = constructor.prototype.constructor;
  subClass.prototype = subClassPrototype;
  return subClass;
}

;
/**
 * 遍历数组或对象
 *
 * @param {Object|Array} object 数组或对象
 * @param {Function} callback 回调函数
 * @param {Object} [thisObj=undefined] 回调函数的this对象
 * @access public
 * @return {Object|Array} 被遍历的对象
 *
 * @example
 *
 * var arr = [1, 2, 3, 4];
 * each(arr, function(item, index, arr){
 *  console.log(index + ":" + item);
 * });
 * // 0:1
 * // 1:2
 * // 2:3
 * // 3:4
 *
 * @example
 *
 * var arr = [1, 2, 3, 4];
 * each(arr, function(item, index, arr){
 *  console.log(index + ":" + item);
 *  if(item > 2){
 *      return false;
 *  }
 * });
 * // 0:1
 * // 1:2
 */
function each(object, callback, thisObj) {
  var name, i = 0,
    length = object.length,
    isObj = length === undefined || isFunction(object);

  if (isObj) {
    for (name in object) {
      if (callback.call(thisObj, object[name], name, object) === false) {
        break;
      }
    }
  } else {
    for (i = 0; i < length; i++) {
      if (callback.call(thisObj, object[i], i, object) === false) {
        break;
      }
    }
  }
  return object;
}
;
/**
 * hasOwnProperty
 *
 * @param obj $obj
 * @param key $key
 * @access public
 * @return void
 */
function hasOwnProperty(obj, key) {

  var native_hasOwnProperty = Object.prototype.hasOwnProperty;

  hasOwnProperty = function(obj, key) {
    return native_hasOwnProperty.call(obj, key);
  };

  return hasOwnProperty(obj, key);
}
;
/**
 * inArray 判断对象是否为数组
 *
 * @param {array} arr 数据源
 * @param {item} item 需要判断的数据项
 * @access public
 * @return {index} 该数据项在目标数组中的索引
 */
function inArray(arr, item) {
  //如果支持 Array.prototype.indexOf 方法则直接使用，
  var index = undefined;
  if (Array.prototype.indexOf) {
    return arr.indexOf(item) > -1 ? arr.indexOf(item) : -1;
  } else {
    each(arr, function (v, i, arr) {
      if (v === item) {
        index = i;
        return false;
      }
    });
  }
  return index === undefined ? -1 : index;
}
;
/**
 * isArray 判断对象是否为数组
 *
 * @param {Object} obj 需要被判断的对象
 * @access public
 * @return {Boolean} 该对象是否为 Array
 */
function isArray(obj) {
  //重设 isArray 函数指针，方便下次调用
  //如果支持 Array.isArray 方法则直接使用，
  //否则用 type 函数来判断
  isArray = Array.isArray || function (obj) {
    return type(obj) === 'array';
  };
  return isArray(obj);
}
;
/**
 * isEmpty 判断是否是空对象，数组判断长度，对象判断自定义属性，其它取非
 *
 * @param {Object} obj 需要被判断的对象
 * @access public
 * @return {Boolean} 该对象是否为为空
 */
function isEmpty(obj) {
  if (isArray(obj)) {
    return obj.length === 0;
  } else if (typeof obj === 'object') {
    for (var i in obj) return false;
    return true;
  } else return !obj;
}
;
/**
 * isFunction 判断一个对象是否为一个函数
 *
 * @param {Object} obj 需要被鉴定的对象
 * @access public
 * @return {Boolean} 该对象是否为一个函数
 */
function isFunction(obj) {
  return type(obj) === 'function';
}
;
/**
 *           File:  JSON.js
 *           Path:  src/common/js
 *         Author:  zhangyuanwei
 *       Modifier:  zhangyuanwei
 *       Modified:  2013-06-20 13:04:58
 *    Description:  JSON跨浏览器实现
 */
/*
 json2.Bigpipe
 2013-05-26

 Public Domain.

 NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.

 See http://www.JSON.org/Bigpipe.html


 This code should be minified before deployment.
 See http://javascript.crockford.com/jsmin.html

 USE YOUR OWN COPY. IT IS EXTREMELY UNWISE TO LOAD CODE FROM SERVERS YOU DO
 NOT CONTROL.


 This file creates a global JSON object containing two methods: stringify
 and parse.

 JSON.stringify(value, replacer, space)
 value       any JavaScript value, usually an object or array.

 replacer    an optional parameter that determines how object
 values are stringified for objects. It can be a
 function or an array of strings.

 space       an optional parameter that specifies the indentation
 of nested structures. If it is omitted, the text will
 be packed without extra whitespace. If it is a number,
 it will specify the number of spaces to indent at each
 level. If it is a string (such as '\t' or '&nbsp;'),
 it contains the characters used to indent at each level.

 This method produces a JSON text from a JavaScript value.

 When an object value is found, if the object contains a toJSON
 method, its toJSON method will be called and the result will be
 stringified. A toJSON method does not serialize: it returns the
 value represented by the name/value pair that should be serialized,
 or undefined if nothing should be serialized. The toJSON method
 will be passed the key associated with the value, and this will be
 bound to the value

 For example, this would serialize Dates as ISO strings.

 Date.prototype.toJSON = function (key) {
 function f(n) {
 // Format integers to have at least two digits.
 return n < 10 ? '0' + n : n;
 }

 return this.getUTCFullYear()   + '-' +
 f(this.getUTCMonth() + 1) + '-' +
 f(this.getUTCDate())      + 'T' +
 f(this.getUTCHours())     + ':' +
 f(this.getUTCMinutes())   + ':' +
 f(this.getUTCSeconds())   + 'Z';
 };

 You can provide an optional replacer method. It will be passed the
 key and value of each member, with this bound to the containing
 object. The value that is returned from your method will be
 serialized. If your method returns undefined, then the member will
 be excluded from the serialization.

 If the replacer parameter is an array of strings, then it will be
 used to select the members to be serialized. It filters the results
 such that only members with keys listed in the replacer array are
 stringified.

 Values that do not have JSON representations, such as undefined or
 functions, will not be serialized. Such values in objects will be
 dropped; in arrays they will be replaced with null. You can use
 a replacer function to replace those with JSON values.
 JSON.stringify(undefined) returns undefined.

 The optional space parameter produces a stringification of the
 value that is filled with line breaks and indentation to make it
 easier to read.

 If the space parameter is a non-empty string, then that string will
 be used for indentation. If the space parameter is a number, then
 the indentation will be that many spaces.

 Example:

 text = JSON.stringify(['e', {pluribus: 'unum'}]);
 // text is '["e",{"pluribus":"unum"}]'


 text = JSON.stringify(['e', {pluribus: 'unum'}], null, '\t');
 // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

 text = JSON.stringify([new Date()], function (key, value) {
 return this[key] instanceof Date ?
 'Date(' + this[key] + ')' : value;
 });
 // text is '["Date(---current time---)"]'


 JSON.parse(text, reviver)
 This method parses a JSON text to produce an object or array.
 It can throw a SyntaxError exception.

 The optional reviver parameter is a function that can filter and
 transform the results. It receives each of the keys and values,
 and its return value is used instead of the original value.
 If it returns what it received, then the structure is not modified.
 If it returns undefined then the member is deleted.

 Example:

 // Parse the text. Values that look like ISO date strings will
 // be converted to Date objects.

 myData = JSON.parse(text, function (key, value) {
 var a;
 if (typeof value === 'string') {
 a =
 /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
 if (a) {
 return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4],
 +a[5], +a[6]));
 }
 }
 return value;
 });

 myData = JSON.parse('["Date(09/09/2001)"]', function (key, value) {
 var d;
 if (typeof value === 'string' &&
 value.slice(0, 5) === 'Date(' &&
 value.slice(-1) === ')') {
 d = new Date(value.slice(5, -1));
 if (d) {
 return d;
 }
 }
 return value;
 });


 This is a reference implementation. You are free to copy, modify, or
 redistribute.
 */

/*jslint evil: true, regexp: true */

/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
 call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
 getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
 lastIndex, length, parse, prototype, push, replace, slice, stringify,
 test, toJSON, toString, valueOf
 */


// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

if (typeof JSON !== 'object') {
  JSON = {};
}

(function () {
  'use strict';

  function f(n) {
    // Format integers to have at least two digits.
    return n < 10 ? '0' + n : n;
  }

  if (typeof Date.prototype.toJSON !== 'function') {

    Date.prototype.toJSON = function () {

      return isFinite(this.valueOf())
        ? this.getUTCFullYear() + '-' +
      f(this.getUTCMonth() + 1) + '-' +
      f(this.getUTCDate()) + 'T' +
      f(this.getUTCHours()) + ':' +
      f(this.getUTCMinutes()) + ':' +
      f(this.getUTCSeconds()) + 'Z'
        : null;
    };

    String.prototype.toJSON =
      Number.prototype.toJSON =
        Boolean.prototype.toJSON = function () {
          return this.valueOf();
        };
  }

  var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
    escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
    gap,
    indent,
    meta = {    // table of character substitutions
      '\b': '\\b',
      '\t': '\\t',
      '\n': '\\n',
      '\f': '\\f',
      '\r': '\\r',
      '"': '\\"',
      '\\': '\\\\'
    },
    rep;


  function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

    escapable.lastIndex = 0;
    return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
      var c = meta[a];
      return typeof c === 'string'
        ? c
        : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
    }) + '"' : '"' + string + '"';
  }


  function str(key, holder) {

// Produce a string from holder[key].

    var i,          // The loop counter.
      k,          // The member key.
      v,          // The member value.
      length,
      mind = gap,
      partial,
      value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

    if (value && typeof value === 'object' &&
      typeof value.toJSON === 'function') {
      value = value.toJSON(key);
    }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

    if (typeof rep === 'function') {
      value = rep.call(holder, key, value);
    }

// What happens next depends on the value's type.

    switch (typeof value) {
      case 'string':
        return quote(value);

      case 'number':

// JSON numbers must be finite. Encode non-finite numbers as null.

        return isFinite(value) ? String(value) : 'null';

      case 'boolean':
      case 'null':

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce 'null'. The case is included here in
// the remote chance that this gets fixed someday.

        return String(value);

// If the type is 'object', we might be dealing with an object or an array or
// null.

      case 'object':

// Due to a specification blunder in ECMAScript, typeof null is 'object',
// so watch out for that case.

        if (!value) {
          return 'null';
        }

// Make an array to hold the partial results of stringifying this object value.

        gap += indent;
        partial = [];

// Is the value an array?

        if (Object.prototype.toString.apply(value) === '[object Array]') {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

          length = value.length;
          for (i = 0; i < length; i += 1) {
            partial[i] = str(i, value) || 'null';
          }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

          v = partial.length === 0
            ? '[]'
            : gap
            ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
            : '[' + partial.join(',') + ']';
          gap = mind;
          return v;
        }

// If the replacer is an array, use it to select the members to be stringified.

        if (rep && typeof rep === 'object') {
          length = rep.length;
          for (i = 0; i < length; i += 1) {
            if (typeof rep[i] === 'string') {
              k = rep[i];
              v = str(k, value);
              if (v) {
                partial.push(quote(k) + (gap ? ': ' : ':') + v);
              }
            }
          }
        } else {

// Otherwise, iterate through all of the keys in the object.

          for (k in value) {
            if (Object.prototype.hasOwnProperty.call(value, k)) {
              v = str(k, value);
              if (v) {
                partial.push(quote(k) + (gap ? ': ' : ':') + v);
              }
            }
          }
        }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

        v = partial.length === 0
          ? '{}'
          : gap
          ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
          : '{' + partial.join(',') + '}';
        gap = mind;
        return v;
    }
  }

// If the JSON object does not yet have a stringify method, give it one.

  if (typeof JSON.stringify !== 'function') {
    JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

      var i;
      gap = '';
      indent = '';

// If the space parameter is a number, make an indent string containing that
// many spaces.

      if (typeof space === 'number') {
        for (i = 0; i < space; i += 1) {
          indent += ' ';
        }

// If the space parameter is a string, it will be used as the indent string.

      } else if (typeof space === 'string') {
        indent = space;
      }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

      rep = replacer;
      if (replacer && typeof replacer !== 'function' &&
        (typeof replacer !== 'object' ||
        typeof replacer.length !== 'number')) {
        throw new Error('JSON.stringify');
      }

// Make a fake root object containing our value under the key of ''.
// Return the result of stringifying the value.

      return str('', {'': value});
    };
  }


// If the JSON object does not yet have a parse method, give it one.

  if (typeof JSON.parse !== 'function') {
    JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

      var j;

      function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

        var k, v, value = holder[key];
        if (value && typeof value === 'object') {
          for (k in value) {
            if (Object.prototype.hasOwnProperty.call(value, k)) {
              v = walk(value, k);
              if (v !== undefined) {
                value[k] = v;
              } else {
                delete value[k];
              }
            }
          }
        }
        return reviver.call(holder, key, value);
      }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

      text = String(text);
      cx.lastIndex = 0;
      if (cx.test(text)) {
        text = text.replace(cx, function (a) {
          return '\\u' +
            ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        });
      }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with '()' and 'new'
// because they can cause invocation, and '=' because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
// replace all simple value tokens with ']' characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or ']' or
// ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

      if (/^[\],:{}\s]*$/
          .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
            .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
            .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The '{' operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

        j = eval('(' + text + ')');

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

        return typeof reviver === 'function'
          ? walk({'': j}, '')
          : j;
      }

// If the text is not JSON parseable, then a SyntaxError is thrown.

      throw new SyntaxError('JSON.parse');
    };
  }
}());
;
/**
 * 将函数延迟执行
 *
 * @param {Function} fn 希望被延迟执行的函数
 * @access public
 * @return {Number} 等待执行的任务数
 *
 * @example
 *
 * var fn = function(){
 *      console.log(2);
 * };
 *
 * nextTick(fn);
 * console.log(1);
 *
 * // 1
 * // 2
 */
function nextTick(fn) {

  var callbacks = [], //等待调用的函数栈
    running = false; //当前是否正在运行中

  //调用所有在函数栈中的函数
  //如果在执行某函数时又有新的函数被添加进来，
  //该函数也会在本次调用的最后被执行
  function callAllCallbacks() {
    var count, index;

    count = callbacks.length;
    for (index = 0; index < count; index++) {
      //TODO 错误处理
      callbacks[index]();
    }
    //删除已经调用过的函数
    callbacks.splice(0, count);

    //判断是否还有函数需要执行
    //函数可能在 callAllCallbacks 调用的过程中被添加到 callbacks 数组
    //所以需要再次判断
    if (callbacks.length) {
      setTimeout(callAllCallbacks, 1);
    } else {
      running = false;
    }
  }

  //修改 nextTick 函数指针，方便下次调用
  nextTick = function (fn) {
    //将函数存放到待调用栈中
    callbacks.push(fn);

    //判断定时器是否启动
    //如果没有启动，则启动计时器
    //如果已经启动，则不需要做什么
    //本次添加的函数会在 callAllCallbacks 时被调用
    if (!running) {
      running = true;
      setTimeout(callAllCallbacks, 1);
    }
    return callbacks.length;
  };

  return nextTick.apply(this, arguments);
}
;
/**
 * 按照顺序调用函数，避免调用堆栈过长
 *
 * @param {Function} fn 需要调用的函数
 * @access public
 * @return {Number} 当前的队列大小，返回0表示函数已经被立即执行
 *
 * @example
 *
 * function fn1(){
 *      console.log("fn1 start");
 *      queueCall(fn2);
 *      console.log("fn1 end");
 * }
 *
 * function fn2(){
 *      console.log("fn2 start");
 *      queueCall(fn3);
 *      console.log("fn2 end");
 * }
 * function fn3(){
 *      console.log("fn3 start");
 *      console.log("fn3 end");
 * }
 *
 * queueCall(fn1);
 * //fn1 start
 * //fn1 end
 * //fn2 start
 * //fn2 end
 * //fn3 start
 * //fn3 end
 */
function queueCall(fn) {
  var running = false,
    list = [];

  queueCall = function (fn) {
    var count, index;
    list.push(fn);
    if (!running) {
      running = true;
      while (true) {
        count = list.length;
        if (count <= 0) {
          break;
        }
        for (index = 0; index < count; index++) {
          //TODO 错误处理
          list[index]();
        }
        list.splice(0, count);
      }
      running = false;
    }

    return list.length;
  };

  return queueCall(fn);
}
;
/**
 * slice 把数组中一部分的浅复制存入一个新的数组对象中，并返回这个新的数组。
 *
 * @param {Array} array 数组
 * @param {Number} start 开始索引
 * @param {Number} end 结束索引
 * @access public
 * @return {Array} 被截取后的数组
 */
function slice(array, start, end) {
  var _slice = Array.prototype.slice;
  //重写 slice 函数指针,便于下次调用.
  slice = function (array, start, end) {
    switch (arguments.length) {
      case 0:
        //TODO throw Error???
        return [];
      case 1:
        return _slice.call(array);
      case 2:
        return _slice.call(array, start);
      case 3:
      default:
        return _slice.call(array, start, end);
    }
  };
  return slice.apply(this, arguments);
}
;
/**
 * toArray 将类数组对象转化为数组
 *
 * @param {Object} obj 需要被转化的类数组对象
 * @access public
 * @return {Array} 数组对象
 */
function toArray(obj) {
  return slice(obj);
}
;
/**
 * type 判断对象类型函数
 * 从 jquery 中拷贝来的
 *
 * @param {Object} obj 被鉴定的对象
 * @access public
 * @return {String} 对象类型字符串
 */
function type(obj) {
  //var types = "Boolean Number String Function Array Date RegExp Object".split(" "),
  var types = ["Boolean", "Number", "String", "Function", "Array", "Date", "RegExp", "Object"],
    toString = Object.prototype.toString,
    class2type = {},
    count, name;

  //构造 class2type 表
  //{
  //  "[object Object]"   : "object",
  //  "[object RegExp]"   : "regexp",
  //  "[object Date]"     : "date",
  //  "[object Array]"    : "array",
  //  "[object Function]" : "function",
  //  "[object String]"   : "string",
  //  "[object Number]"   : "number",
  //  "[object Boolean]"  : "boolean"
  //}
  count = types.length;
  while (count--) {
    name = types[count];
    class2type["[object " + name + "]"] = name.toLowerCase();
  }

  // 判断函数,初始化后再次调用会直接调用这个函数
  function _type(obj) {
    return obj == null ?
      String(obj) :
    class2type[toString.call(obj)] || "object";
  }

  //修改 type 函数指针，以便多次调用开销
  type = _type;

  return type(obj);
}
;
