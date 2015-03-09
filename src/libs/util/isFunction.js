/* @cmd false */
function isFunction(obj) {
    var toString = Object.prototype.toString;
    return '[object Function]' == toString.call(obj);
}
