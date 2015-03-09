/* @cmd false */
function each(arr, callback) {
    eachUntil(arr, function (index, item) {
        callback(index, item);
        return false;
    });
}