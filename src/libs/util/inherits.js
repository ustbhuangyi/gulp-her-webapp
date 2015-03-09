/* @cmd false */
function inherits(subClass, superClass, prototype) {
    var tmpProto;
    if (this instanceof inherits) {
        this.constructor = subClass;
        copyProperties(this, prototype);
    } else {
        tmpProto = inherits.prototype;
        inherits.prototype = superClass.prototype;
        subClass.prototype = new inherits(subClass, superClass, prototype);
        inherits.prototype = tmpProto;
    }
}
