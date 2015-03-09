__d("Arbiter", ["global", "ErrorUtils"], function (global, require, module, exports) {
    var global = require("global"),
        ErrorUtils = require("ErrorUtils");

    function Arbiter(types) {
        this._listenerMap = {};
        this._setup(types || []);
    }

    function call(callback, args) {
        var fn = callback[0],
            context = callback[1],
            args = callback[2].concat(args);
        //防止某次报错影响整个框架执行
        if (!ErrorUtils.inGuard()) {
            return ErrorUtils.applyWithGuard(fn, context, args);
        } else {
            return fn.apply(context, args);
        }
        //        try {
        //            return fn.apply(context, args);
        //        } catch (e) {
        //            setTimeout(function () {
        //                throw e;
        //            }, 0);
        //        }
    }
    copyProperties(Arbiter.prototype, {
        _setup: function (types) {
            var count = types.length,
                    listenerMap = this._listenerMap;
            while (count--) {
                listenerMap[types[count]] = {
                    args: null,
                    cbs: []
                };
            }
        },
        on: function (type, fn, context) {
            var listenerList = this._listenerMap[type],
                    params, args;
            if (!listenerList) return false;
            context = context || global;
            params = slice(arguments, 3);
            if (args = listenerList.args) {
                queueApply(fn, context, params.concat(args));
            } else {
                listenerList.cbs.push([fn, context, params]);
            }
            return true;
        },
        done: function (type, args) {
            var listenerList = this._listenerMap[type],
                    ret, cbs, count;
            if (!listenerList) return true;
            cbs = listenerList.cbs;
            count = cbs.length;
            args = slice(arguments, 1);
            listenerList.args = args;
            ret = this.emit.apply(this, arguments);
            listenerList.cbs = cbs.slice(count);
            return ret;
        },
        emit: function (type, args) {
            var listenerList = this._listenerMap[type],
                    cbs, count, index, ret;
            if (!listenerList) {
                throw new Error(type + " has not listened");
            };
            args = slice(arguments, 1);
            cbs = listenerList.cbs;
            count = cbs.length;
            index = -1;
            ret = true;
            while (++index < count) {
                ret = (call(cbs[index], args) !== false) && ret;
            }
            return !!ret;
        },
        undo: function (type) {
            var listenerList = this._listenerMap[type];
            if (!listenerList) return false;
            listenerList.args = null;
        }
    });

    return Arbiter;
});
/* __wrapped__ */
/* @cmd false */
