__d("Emulator", ["Arbiter"], function (global, require, module, exports) {
    //这个类要做的两件事：1.监听页面点击事件2.发送请求
    var Arbiter = require("Arbiter"),
        emulator,
        _urlPrefix,
        _urlPrefixLength,
        EVENT_TYPES = ["beforetrigger", "request"];

    function initUrl() {
        _urlPrefix = [location['protocol'], '//', location['host']]['join']('');
        _urlPrefixLength = _urlPrefix['length'];
    }
    initUrl();

    /**
    * 从Href中得到URI
    * 
    * @param {string} href 
    * @return {string}
    */
    function getURIFromHref(href) {
        var uri = false,
            regex = new RegExp("^\\s*(https?|ftp)://", "i");
        if (href == _urlPrefix || href['indexOf'](_urlPrefix + '/') == 0) {
            uri = href['substring'](_urlPrefixLength) || '/';
        } else if (!regex.test(href)) {
            uri = href;
        }
        return uri;
    }
    /** 
    * 从rel中得到请求的Id值
    * 
    * @param {string} rel 
    * @return {string}
    */
    function getRequestIdsFromRel(rel) {
        var requestIds = false;
        if (rel && (rel = trim(rel))) {
            requestIds = filter(rel.split(' '), function (index, item) {
                return !!trim(item);
            });
        }
        return requestIds;
    }
    /**
    * 点击处理函数
    * 
    * @param {?Dom} element 点击的元素
    * @return {boolean} 是否终止事件执行
    */
    function triggerClick(element) {
        var element, target, href, rel, uri, ids, ajaxUri;
        element = findParentByTagName(element, 'A');
        if (!element)
            return false;
        //派发事件
        if (!this.emit("beforetrigger", element))
            return true;
        href = element['href'];
        if (!href)
            return false;
        uri = getURIFromHref(href);
        if (!uri)
            return false;
        rel = element['rel'];
        if (rel)
            ids = getRequestIdsFromRel(rel);
        if (!ids)
            return false;
        this.emit("request", uri, ids);
        return true;
    }

    function Emulator() {
        if (this instanceof Emulator) {
            Arbiter.call(this, EVENT_TYPES);
        } else {
            if (!emulator)
                emulator = new Emulator();
            return emulator;
        }
    }

    inherits(Emulator, Arbiter, {
        listen: function () {
            var me = this;
            EventUtil.addHandler(document.documentElement, "click", function (event) {
                var target;
                //event = event || window.event;
                event = EventUtil.getEvent(event);
                //target = event.target || event.srcElement;
                target = EventUtil.getTarget(event);
                if (triggerClick.call(me, target)) {
                    EventUtil.preventDefault(event);
                }
            });
        }
    });
    return Emulator;
});
/* __wrapped__ */
/* @cmd false */
