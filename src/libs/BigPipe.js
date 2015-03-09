__d("BigPipe", ["Resource", "Emulator", "Arbiter", "Requestor", "ErrorUtils"], function(global, require, module, exports) {

    var DEBUG = false;

    var Resource = require("Resource"),
        Emulator = require("Emulator"),
        Arbiter = require("Arbiter"),
        Requestor = require("Requestor"),
        ErrorUtils = require("ErrorUtils"),
        inited = false;

    function BigPige() {
        Arbiter.call(this);
        this.hooks = {};
    }

    inherits(BigPige, Arbiter, {
        init: function(config) {
            var me = this,
                debug = !! config.debug;
            if (inited) throw new Error("BigPipe has been initialized.");
            inited = true;
            this.emulator = Emulator();
            this.emulator.listen();
            this.emulator.on("request", this.request, this);
            this.requestor = new Requestor(config);

            ErrorUtils.setConfig("nocatch", debug);
            DEBUG = debug;

            //this.requestor.on("arrive", handleArrive, this);
            //            this.controller = new Controller();

            //            this.controller.on("arrived", this.onItemArrived, this);
            //            this.on("allarrived", this.onSessionEnd, this);
            if (DEBUG) {
                var left = true;
                this.console = documentCreateElement("ul", null, {
                    cssText: 'position:fixed;_position:absolute;top:0;left:0;z-index:999;border:1px solid #ddd;border-bottom:none;font-family:monospace;background:#000;color:#dadada'
                });
                this.console.onmouseover = function() {
                    if (left) {
                        this.style.left = "auto";
                        this.style.right = "0";
                    } else {
                        this.style.left = "0";
                        this.style.right = "auto";
                    }
                    left = !left;
                };
                appendToBody(this.console);
            }
        },
        /**
         * onPageletArrive 当页面区块到达时处理函数 {{{
         *
         * @param obj {Object} Pagelet 信息
         * @access public
         * @return void
         */
        onPageletArrive: function(obj) {
            var callback = obj.callback,
                hook, list, index, count, h, fn,
                hooks = this.hooks;
            if (callback) {
                hook = obj.hook || {};
                for (var type in callback) {
                    list = callback[type];
                    index = -1;
                    count = list.length;
                    h = hook[type] || [];
                    while (++index < count) {
                        fn = list[index];
                        h.push(hooks[fn]);
                        delete hooks[fn];
                    }
                    hook[type] = h;
                }
                obj.hook = hook;
            }
            Resource.setResourceMap(obj.map || {});
            Resource.setModuleMap(obj.mods || {});

            this.requestor.arrive(obj);
        }, // }}}
        request: function(uri, ids) {
            this.requestor.request(uri, ids);
        },
        sessionStart: function(id) {
            this.requestor.start(id);
        },
        sessionEnd: function(id) {
            this.requestor.end(id);
        },
        loadModule: function(name, callback) {
            var resource = Resource.moudelToResource(name);
            resource.on("resolve", callback);
            resource.load();
        },
        loadedResource: function(obj) {
            Resource.setResourceLoaded(obj);
        },
        log: function() {
            if (!DEBUG) return;
            var console = this.console,
                count, index, html, element;
            if (!console) return;
            for (index = 0, count = arguments.length, html = []; index < count; index++) {
                html.push(encodeHTML(String(arguments[index])));
            }
            console.appendChild(documentCreateElement("li", {
                innerHTML: html.join(' ')
            }, {
                cssText: "border-bottom:1px solid #ddd"
            }));
        }
    });

    function encodeHTML(str) {
        if (!str || 'string' != typeof str) return str;
        return str.replace(/["'<>\\\/`]/g, function($0) {
            return '&#' + $0.charCodeAt(0) + ';';
        });
    }

    return BigPige;
});
/* __wrapped__ */
/* @cmd false */
