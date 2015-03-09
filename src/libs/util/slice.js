/* @cmd false */
function slice(array, start, end) {
    var _slice = Array.prototype.slice;
    slice = function(array, start, end) {
        var args = _slice.call(arguments, 1);
        return _slice.apply(array, args);
    };
    return slice.apply(this, slice(arguments, 0));
}

