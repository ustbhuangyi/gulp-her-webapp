/* @cmd false */
function type(obj) {
    var types = "Boolean Number String Function Array Date RegExp Object".split(" "),
        count = types.length,
        toString = Object.prototype.toString,
        class2type = {},
        name;

    while (count--) {
        name = types[count];
        class2type["[object " + name + "]"] = name.toLowerCase();
    }

    function _type(obj) {
        return obj == null ? String(obj) : class2type[toString.call(obj)] || "object";
    }

    type = _type;
    return type(obj);
}

function isFunction(obj) {
    return type(obj) === 'function';
}

function isArray(obj) {
    function _isArray(obj) {
        return type(obj) === 'array';
    }
    isArray = Array['isArray'] || _isArray;
    return isArray(obj);
}
