/*函数包装器 */
__d("wrapFunction", [], function (global, require, module, exports) {
    var wrapMap = {}; //包装器map

    /*
    * 用某个函数包装器去包装函数
    * @param fn {Function} 需要被包装的函数
    * @param key {String} 函数包装器的key
    * @param args {Object} 执行包装时的参数
    */
    function wrapFunction(fn, key, args) {
        key = key || 'default';
        return function () {
            var fn = key in wrapMap ? wrapMap[key](fn, args) : fn;
            return fn.apply(this, arguments);
        };
    }

    /*
    * 设置一个包装函数,添加到包装器的map中
    * @param wrap {Function} 包装函数
    * @param key {String} 包装函数的key
    */
    wrapFunction.setWrapper = function (wrap, key) {
        key = key || 'default';
        wrapMap[key] = wrap;
    };

    module.exports = wrapFunction;
});
/* @cmd false */