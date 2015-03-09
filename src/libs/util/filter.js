/* @cmd false */
function filter(arr, callback) {
    var ret = isArray(arr) ? [] : {};
    if (typeof (callback) == 'function') {

    } else if (callback === undefined) {
        callback = function (index, item) {
            return !!item;
        }
    } else {
        callback = function (index, item) {
            return item == callback;
        }
    }
    each(arr, function (index, item) {
        if (callback(index, item)) {
            ret[index] = item;
        }
    });
    return ret;
}