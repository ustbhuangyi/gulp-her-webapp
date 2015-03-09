__d("Pagelet", ["Arbiter", "Resource"], function (global, require, module, exports) {

    var Arbiter = require("Arbiter"),
        Resource = require("Resource"),
        EVENT_TYPES = [
                "arrive",
                "beforeload",
                "cssresolved",
                "jsresolved",
                "beforedisplay",
                "display",
                "load",
                "afterload",
                "resolved",
                "beforeunload",
                "unload",
                "afterunload"
        ],
        STAT_UNINITIALIZED = 0,
        STAT_INITIALIZED = 1,
        STAT_LOADING = 2,
        STAT_DISPLAYED = 3,
        STAT_UNLOADING = 4,

        pageletSet = {},

        localValueMap = {};

    function Pagelet(id) {
        if (this instanceof Pagelet) {
            Arbiter.call(this, EVENT_TYPES);
            this.id = id;
            this.root = id === null;
            this.state = STAT_UNINITIALIZED;
        } else {
            var pagelet;
            if (id === null) {
                return new Pagelet(id);
            }
            pagelet = pageletSet[id];
            if (!pagelet) {
                pagelet = new Pagelet(id);
                pageletSet[id] = pagelet;
            }
            return pagelet;
        }
    }

    inherits(Pagelet, Arbiter, {
        arrive: function (config) {
            copyProperties(this, {
                html: config.html || "",
                css: config.css || [],
                js: config.js || [],
                parent: config.parent ? Pagelet(config.parent) : null,
                children: config.children || [],
                state: STAT_INITIALIZED
            });
            this.afterload = false;
            this.done("arrive");
            if (this.emit("beforeload")) {
                this.load();
            }
            else {
                this.afterload = true;
                this.done("afterload");
            }
        },
        load: function () {
            if (this.state >= STAT_LOADING) return false;
            this.state = STAT_LOADING;

            this.on("cssresolved", this.parent ? waitParentDisplay : tryDisplay, this);
            this._resolve(this.css, "cssresolved");

            function waitParentDisplay() {
                this.parent.on("display", tryDisplay, this);
            }

            function tryDisplay() {
                if (this.emit("beforedisplay")) {
                    this.display();
                }
            }

            this._resolve(this.js, "jsresolved");


        },
        setState: function () {
            if (this.state < STAT_DISPLAYED)
                return false;
            this.state = STAT_UNLOADING;
            var childCount, children, count, index, child, id;
            children = this.children;
            childCount = children.length;
            count = childCount;
            index = -1;
            if (count) {
                while (++index < count) {
                    id = children[index];
                    child = Pagelet(id);
                    child.setState();
                }
            }
        },
        doUnload: function () {
            var childCount, children, count, index, child, id;
            children = this.children;
            childCount = children.length;
            count = childCount;
            index = -1;
            if (count) {
                while (++index < count) {
                    id = children[index];
                    child = Pagelet(id);
                    child.on("unload", onItemUnload, this);
                    child.doUnload();
                }
            }
            else {
                if (this.emit("beforeunload"))
                    this.unload();
            }
            function onItemUnload() {
                if (! --childCount) {
                    if (this.emit("beforeunload"))
                        this.unload();
                }
            }
        },
        remove: function () {
            if (this.state == STAT_UNLOADING)
                return false;
            this.setState();
            this.on("unload", this.destroy, this);
            this.doUnload();
        },
        unload: function () {
            this.done("unload");
        },
        destroy: function () {
            //ToDo 卸载资源
            var childCount, children, count, index, child, id;
            children = this.children;
            childCount = children.length;
            count = childCount;
            index = -1;
            if (count) {
                while (++index < count) {
                    id = children[index];
                    child = Pagelet(id);
                    child.destroy();
                }
            }
            delete pageletSet[this.id];
            this.state = STAT_UNINITIALIZED;
            nextTick(this.done, this, "afterunload");
        },
        isUnloading: function () {
            return this.state == STAT_UNLOADING;
        },
        _resolve: function (list, eventType) {
            var listCount, count, index, res;

            listCount = list.length;
            count = listCount;
            index = -1;

            if (count) {
                while (++index < count) {
                    res = Resource(list[index]);
                    res.on("resolve", onItemResolved, this);
                    res.load();
                }
            } else {
                this.done(eventType);
            }

            function onItemResolved() {
                if (!(--listCount)) {
                    this.done(eventType);
                }
            }
        },
        display: function () {
            if (this.state >= STAT_DISPLAYED)
                return false;
            this.state = STAT_DISPLAYED;
            if (!this.root)
                getElementById(this.id).innerHTML = this.html;
            this.done("display");
            this.on("jsresolved", jsResolved, this);

            function jsResolved() {
                this.done("load");
                if (!this.afterload)
                    this.done("afterload");
            }
        },
        get: function (key, defaultVal) {
            return localValueMap[key] || defaultVal;
        },
        set: function (key, val) {
            localValueMap[key] = val;
        }
    });

    function hasPagelet(id) {
        return !!pageletSet[id];
    }

    copyProperties(Pagelet, {
        hasPagelet: hasPagelet
    });

    return Pagelet;
});
/* __wrapped__ */
/* @cmd false */
