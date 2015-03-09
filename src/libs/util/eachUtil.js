/* @cmd false */
function eachUntil(arr, callback) {
    var count, isObj;

    count = arr.length;
    isObj = count === undefined || isFunction(arr);

    return (isObj ?
    function (arr, callback) {
        var item;
        for (item in arr) {
            if (arr.hasOwnProperty(item)) {
                if (callback(item, arr[item])) {
                    return true;
                }
            }
        }
        return false;
    } : function (arr, callback) {
        var index;
        for (index = 0; index < count; index++) {
            if (callback(index, arr[index])) {
                return true;
            }
        }
        return false;
    })(arr, callback);
}
