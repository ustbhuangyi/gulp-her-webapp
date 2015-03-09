__d("Requestor", ["Arbiter", "Controller"], function (global, require, module, exports) {
    var Arbiter = require("Arbiter"),
        Controller = require("Controller"),
        EVENT_TYPES = ["arrive", "allarrived"],
        REQUEST_STATE_UNSENT = 0,
	    REQUEST_STATE_LOADING = 1,
        SESSION_STATE_DEFAULT = 0,
        SESSION_STATE_LOADING = 1,
        SESSION_STATE_BUSY = 2,
        SESSION_STATE_END = 3,
        waitingList = {},
        inited = false,
        loadingTimer = false,
        SessionID = 0;
    function Requestor(config) {
        Arbiter.call(this, EVENT_TYPES);
        copyProperties(this, {
            ajaxKey: config.ajaxKey,
            separator: config.separator,
            sessionKey: config.sessionKey
        });
        if (!inited)
            this.init();
    }
    inherits(Requestor, Arbiter, {
        init: function () {
            inited = true;
            this.state = REQUEST_STATE_UNSENT;
            this.sessionState = SESSION_STATE_DEFAULT;
            this.controller = new Controller();
            this.controller.on("arrived", this._onItemArrived, this);
            this.on("allarrived", this._onSessionEnd, this);
            this.refCount = 0;
        },
        start: function (id) {
            this.sessionID = id;
            switch (this.sessionState) {
                case SESSION_STATE_LOADING:
                case SESSION_STATE_BUSY:
                case SESSION_STATE_END:
                    this.sessionState = SESSION_STATE_BUSY;
                    break;
                case SESSION_STATE_DEFAULT:
                    this.sessionState = SESSION_STATE_LOADING;
                    break;
            }
        },
        end: function (id) {
            this.sessionState = SESSION_STATE_END;
            if (this.refCount == 0) {
                this._onSessionEnd();
            }
        },
        arrive: function (obj) {
            var id = obj.id,
                sessionID = this.sessionID,
                sessionState = this.sessionState;
            if (waitingList[sessionID - 1])
                waitingList[sessionID - 1] = null;
            if (sessionState == SESSION_STATE_BUSY || sessionState == SESSION_STATE_END) {
                waitingList[sessionID] = waitingList[sessionID] || [];
                waitingList[sessionID].push(obj);
            } else {
                ++this.refCount;
                this.controller.handdleArrive(obj);
            }
        },
        request: function (uri, ids) {
            var requestUri;
            SessionID++;
            requestUri = [uri, ((/.*\?.*/)['test'](uri) ? '&' : '?'), this.ajaxKey, ids ? ('=' + ids['join'](this.separator)) : '', '&', this.sessionKey, '=', SessionID]['join']('');
            this._ajaxRequest(requestUri);
        },
        _onSessionEnd: function () {
            this.sessionState = SESSION_STATE_DEFAULT;
            var list = waitingList[this.sessionID],
                me = this;
            if (list) {
                each(list, function (index, item) {
                    me.refCount++;
                    me.controller.handdleArrive(item);
                });
            }
        },
        _onItemArrived: function (id) {
            if (! --this.refCount && this.sessionState == SESSION_STATE_END) {
                this.emit("allarrived");
            }
        },
        _ajaxRequest: function (uri) {
            switch (this.state) {
                case REQUEST_STATE_LOADING:
                    removeElement(this._ajaxIframe);
                    this._initAjaxIframe(uri);
                    break;
                case REQUEST_STATE_UNSENT:
                    this._initAjaxIframe(uri);
                    this.state = REQUEST_STATE_LOADING;
                    break;
            }
        },
        _initAjaxIframe: function (uri) {
            var me = this;
            this._ajaxIframe = documentCreateElement('iframe', {
                'src': uri
            }, {
                'display': 'none'
            });
            appendToBody(this._ajaxIframe);
            clearTimeout(loadingTimer);
            EventUtil.addHandler(this._ajaxIframe, "load", function () {
                if (me.state == REQUEST_STATE_LOADING) {
                    loadingTimer = setTimeout(function () {
                        removeElement(me._ajaxIframe);
                        me.state = REQUEST_STATE_UNSENT;
                    }, 100);
                }
            });
        }
    });
    return Requestor;
});
/* __wrapped__ */
/* @cmd false */
