__d("Controller", ["Arbiter", "Pagelet", "Resource"], function (global, require, module, exports) {
    var Arbiter = require("Arbiter"),
        Pagelet = require("Pagelet"),
        Resource = require("Resource"),
        EVENT_TYPES = ["arrived"];

    function Controller() {
        Arbiter.call(this, EVENT_TYPES);
    }

    function getContentFromContainer(id, doc) {
        var elem = getElementById(id, doc),
            child, html;
        if (!(child = elem.firstChild)) return null; //TODO
        if (child.nodeType !== 8) return null; //TODO
        html = child.nodeValue;
        elem.parentNode.removeChild(elem);
        html = html.slice(1, -1);
        return html.replace(/--\\>/g, "-->").replace(/\\\\/g, "\\");
    }

    function getContent(obj) {
        if (obj.content) return obj.content;
        if (obj.container_id) return getContentFromContainer(obj.container_id, obj.doc);
        return null;
    }
    inherits(Controller, Arbiter, {
        handdleArrive: function (obj) {
            var pagelet, id;
            id = obj.id;
            if (Pagelet.hasPagelet(id)) {
                pagelet = Pagelet(id);
                pagelet.remove();
            }
            if (Pagelet.hasPagelet(id)) {
                pagelet = Pagelet(id);
                if (pagelet.isUnloading()) {
                    pagelet.on("afterunload", this._doArrive, this, obj);
                } else {
                    throw new Error("unbeliveble");
                }
            } else {
                this._doArrive(obj);
            }
            // this.emit("arrive", obj);
        },
        _doArrive: function (obj) {
            var id, parent, content, children, css, js, pagelet, hook, type, list, i, count, callback;
            id = obj.id || null;
            obj.html = getContent(obj);
            pagelet = Pagelet(id);
            if (hook = obj.hook) {
                for (type in hook) {
                    list = hook[type];
                    count = list.length;
                    i = -1;
                    while (++i < count) {
                        callback = list[i]
                        try {
                            pagelet.on(type, isFunction(callback) ? callback : new Function("pagelet", callback), global, pagelet);
                        } catch (e) {
                            throw new Error("Error on add script:" + list[i]);
                        }
                    }
                }
            }
            pagelet.arrive(obj);
            pagelet.on("afterload", onItemArrived, this, id);

            function onItemArrived(id) {
                this.emit("arrived", id);
            }

        }
    });
    return Controller;
});
/* @cmd false */
