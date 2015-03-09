/* @cmd false */
function map(arr, callback) {
    var ret = [],
        len = arr.length;
    if (typeof callback !== 'function') {
        return arr;
    }
    while (len--) {
        ret.unshift(callback(arr[len]));
    }
    return ret;
}
