__d("Cache", ["Arbiter"], function (global, require, module, exports) {
    var Arbiter = require("Arbiter"),
        cacheMap = {},
        currentUri = "";
    function Cache(uri) {
        if (this instanceof Cache) {
            Arbiter.call(this, EVENT_TYPES);
            if (cacheMap[currentUri]) {
                copyProperties(cacheMap[uri], cacheMap[currentUri]);
            }
        } else {
            var cache = cacheMap[uri];
            if (!cache) {
                cache = new Cache(uri);
                Cache[uri] = cache;
            }
            currentUri = uri;
            return cache;
        }
    }
    inherits(Cache, Arbiter, {
        init: function (ids) {

        }
    });
    return Cache;

});
/* __wrapped__ */
/* @cmd false */