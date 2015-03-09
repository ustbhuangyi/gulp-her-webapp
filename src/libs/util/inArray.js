/* @cmd false */
function inArray(arr, callback) {
    return eachUntil(arr, (isFunction(callback)) ? callback : function (index, item) {
        return item == callback;
    });
}