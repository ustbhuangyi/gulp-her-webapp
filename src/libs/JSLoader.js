__d("JSLoader", ["Arbiter"], function(global, require, module, exports) {
    var Arbiter = require("Arbiter"),
        EVENT_TYPES = ["load"],
        STAT_INITIALIZED = 1,
        STAT_LOADING = 2,
        STAT_LOADED = 3,
        STAT_ERROR = 4;

    function getHookName(id) {
        return "js_" + id;
    }

    function JSLoader(id, config) {
        Arbiter.call(this, EVENT_TYPES);
        this.id = id;
        this.url = config.src;
        this.state = STAT_INITIALIZED;
    }

    inherits(JSLoader, Arbiter, {
            load: function() {
                var self = this,
                    hookName, oldVal;
                if (this.state >= STAT_LOADING) return;
                this.state = STAT_LOADING;
                var element = document.createElement('script');
                element.src = this.url;
                element.async = true;
                /*
                element.onload = function() {
                    callback(true);
                };
				*/
                element.onerror = function() {
                    callback(false);
                };
                /*
                element.onreadystatechange = function() {
                    if (this.readyState in {
                            loaded: 1,
                            complete: 1
                        }) {
                        callback(true);
                    }
                };
				*/

                hookName = getHookName(this.id);
                oldVal = window[hookName];
                window[hookName] = callback;

                appendToHead(element);

                function callback(success) {
                    var state = self.state;
                    if (state >= STAT_LOADED)
                        return;
                    self.state = success ? STAT_LOADED : STAT_ERROR;
                    self.done("load");

                    window[hookName] = oldVal;
                    if (oldVal === undefined) {
                        try {
                            delete window[hookName];
                        } catch (e) {}
                    }

                    nextTick(function() {
                        //element.onload = element.onerror = element.onreadystatechange = null;
                        element.onerror = null;
                        element.parentNode && element.parentNode.removeChild(element);
                        element = null;
                    });
                }
            }
        });

    return JSLoader;
});
/* __wrapped__ */
/* @cmd false */
