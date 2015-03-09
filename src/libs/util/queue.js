/* @cmd false */
var queueList = [],
    queueListRunning = false;

function queueCall(fn, context) {
    return queueApply(fn, context, slice(arguments, 2));
}

function queueApply(fn, context, args) {
    var length, index, item;
    queueList.push([fn, context, args]);
    if (!queueListRunning) {
        queueListRunning = true;
        while (length = queueList.length) {
            for (index = 0; index < length; index++) {
                item = queueList[index];
                item[0].apply(item[1], item[2]);
            }
            queueList.splice(0, length);
        }
        queueListRunning = false;
    }
}
