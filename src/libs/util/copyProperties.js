/* @cmd false */
function copyProperties(target) {
    target = target || {};
    var args = arguments,
        count = args.length,
        index = 0,
        item, key;

    while (++index < count) {
        item = args[index];
        for (key in item) {
            if (item.hasOwnProperty(key)) {
                target[key] = item[key];
            }
        }
    }
    return target;
}
