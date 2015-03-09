__d("CSSLoader", ["Arbiter"], function(global, require, module, exports) {
    var Arbiter = require("Arbiter"),
        EVENT_TYPES = ["load"],
        STAT_INITIALIZED = 1,
        STAT_LOADING = 2,
        STAT_LOADED = 3,
        STAT_TIMEOUT = 4,
        TIMEOUT = 5000,
        pulling = false,
        styleSheetUrls = [],
        styleSheetSet = [],
        pullMap = {},
        pullClasses = [],
        pullElement = null;

    function CSSLoader(id, config) {
        Arbiter.call(this, EVENT_TYPES);
        this.id = id;
        this.url = config.src;
        this.state = STAT_INITIALIZED;
    }

    function getClassName(id) {
        return "css_" + id;
    }

    function setAllClasses(classes) {
        if (!pullElement) {
            pullElement = document.createElement("meta");
            appendToHead(pullElement);
        }
        pullClasses = classes || pullClasses;
        pullElement.className = pullClasses.join(" ");
    }

    function addClass(cls) {
        pullClasses.push(cls);
        setAllClasses();
    }

    function clearAllClasses() {
        pullClasses = [];
        if (pullElement) {
            pullElement.parentNode.removeChild(pullElement);
            pullElement = null;
        }
    }

    function checkClass(element) {
        var style;
        if (!element) return false;

        style = window.getComputedStyle ? getComputedStyle(element, null) : element.currentStyle;
        return (style && parseInt(style.height, 10) > 1);
    }

    function doPullStyleSheet() {
        var id, found, last, classes, change, now,
            list, element, loaded,
            count, index, item;

        if (pullClasses.length > 2) {
            found = checkClass(pullElement);
        } else {
            found = true;
        }

        last = 0;
        classes = []; // 还需要加载的class
        change = false; // class列表是否有改变
        now = +new Date;

        for (id in pullMap) {
            list = pullMap[id];
            element = list[0]; //DOM元素
            loaded = false; //是否加载成功

            if (found && checkClass(element)) {
                loaded = true;
            }

            for (index = 1, count = list.length; index < count; index++) {
                item = list[index]; //回调 [timeout, callback, context]
                if (loaded) {
                    item[1].call(item[2], true);
                } else if (item[0] < now) {
                    item[1].call(item[2], false);
                    list.splice(index, 1);
                    index--;
                    count--;
                }
            }

            if (loaded || count == 1) {
                //如果已经载入或者全部超时，则不需要再pull
                element.parentNode.removeChild(element);
                delete pullMap[id];
                // class列表有改变
                change = true;
            } else {
                //否则记录需要pull的class
                classes.push(getClassName(id));
                last++;
            }
        }


        if (last) {
            if (change) {
                setAllClasses(classes);
            }
            setTimeout(doPullStyleSheet, 20);
        } else {
            clearAllClasses();
            pulling = false;
        }
    }

    function startPull() {
        if (!pulling) {
            pulling = true;
            nextTick(doPullStyleSheet);
        }
    }

    function pullStyleSheet(id, timeout, callback, context) {
        var callbackList, element, className;
        if (!(callbackList = pullMap[id])) {
            className = getClassName(id);
            element = document.createElement("meta");
            element.className = className;
            appendToHead(element);
            callbackList = [element];
            pullMap[id] = callbackList;
            addClass(className);
        }
        timeout = (+new Date) + timeout;
        callbackList.push([timeout, callback, context]);
        startPull();
    }

    function pullStyleSheetCallback(success) {
        this.state = success ? STAT_LOADED : STAT_TIMEOUT;
        this.done("load", success);
    }

    function loadByCreateElement() {
        var id = this.id,
            url = this.url,
            link = document.createElement("link");
        link.rel = "stylesheet";
        link.type = "text/css";
        link.href = url;
        appendToHead(link);
        pullStyleSheet(id, TIMEOUT, pullStyleSheetCallback, this);
    }

    function loadByCreateStyleSheet() {
        var id = this.id,
            url = this.url,
            count = styleSheetUrls.length,
            index = count,
            stylesheet;
        while (index--) {
            if (styleSheetUrls[index].length < 31) {
                stylesheet = styleSheetSet[index];
                break;
            }
        }
        if (index < 0) {
            stylesheet = document.createStyleSheet();
            styleSheetSet.push(stylesheet);
            styleSheetUrls.push([]);
            index = count;
        }
        stylesheet.addImport(url);
        styleSheetUrls[index].push(url);
        pullStyleSheet(id, TIMEOUT, pullStyleSheetCallback, this);
    }

    inherits(CSSLoader, Arbiter, {
            load: function() {
                if (this.state < STAT_LOADING) {
                    this.state = STAT_LOADING;
                    this._load();
                }
            },
            _load: document.createStyleSheet ? loadByCreateStyleSheet : loadByCreateElement
            //_load: loadByCreateElement
        });


    return CSSLoader;
});
/* __wrapped__ */
/* @cmd false */
