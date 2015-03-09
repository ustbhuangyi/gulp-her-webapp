/* @cmd false */
function nextTick() {
    var callbacks = [],
        timeoutID = null,
        count = 0;

    function callAllCallbacks() {
        var index = -1,
            item,
            fn, context, args;
        while (++index < count) {
            item = callbacks[index];
            item[0].apply(item[1], item[2]);
            delete callbacks[index];
        }
        callbacks = [];
        count = 0;
        timeoutID = null;
    }

    nextTick = function(fn, context, args) {
        if (!fn) return nextTick;
        context = context || this;
        callbacks.push([fn, context, slice(arguments, 2)]);
        count++;

        if (timeoutID === null) {
            timeoutID = setTimeout(callAllCallbacks, 0);
        }
        return timeoutID;
    };
    return nextTick.apply(this, slice(arguments, 0));
}
