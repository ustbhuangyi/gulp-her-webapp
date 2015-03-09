__d("Resource", ["Arbiter", "CSSLoader", "JSLoader"], function(global, require, module, exports) {
    var Arbiter = require("Arbiter"),
        resourceMap = {},
        resourceLoader = {},
        moduleMap = {},
        EVENT_TYPES = ["load", "resolve"],
        STAT_INITIALIZED = 1,
        STAT_LOADING = 2,
        STAT_LOADED = 3,
        STAT_RESOLVED = 4;

    function Resource(id, deps) {
        if (this instanceof Resource) {
            Arbiter.call(this, EVENT_TYPES);
            this.id = id;
            this.deps = deps;
            this.loaded = false;
            this.state = STAT_INITIALIZED;
        } else {
            return getResource(id);
        }
    }

    function getResource(id) {
        var item, res, type;
        if (!(item = resourceMap[id])) throw new Error("resource \"" + id + "\" unknow.");
        if (!(res = item._handler)) {
            res = item._handler = new Resource(id, item.deps || []);
            if (item._loaded)
                res.loaded = true;
        }
        return res;
    }

    inherits(Resource, Arbiter, {
            load: function() {
                var deps, depcount, count, index, dep,
                    loaded, //当前是否加载完成
                    resolved; // 依赖是否已经解决

                if (this.state >= STAT_LOADING) return false;
                this.state = STAT_LOADING;

                loaded = this.loaded;
                resolved = true;

                deps = this.deps;
                depcount = deps.length;
                count = depcount;

                if (count > 0) { // 有依赖的资源
                    resolved = false;
                    index = -1;
                    while (++index < count) {
                        dep = Resource(deps[index]);
                        dep.on("resolve", onresolve, this);
                        dep.load();
                    }
                }

                //doload.call(this);
                queueCall(doload, this);

                function onresolve() {
                    if (!(--depcount)) { //依赖资源加载完成
                        resolved = true;
                        if (loaded) {
                            //queue(this.done, this, "resolve");
                            this.done("resolve");
                        }
                    }
                }

                function doload() {
                    var loader;
                    if (!loaded) {
                        loader = getResourceLoader(this.id);
                        loader.on("load", onload, this);
                        loader.load();
                    } else {
                        //onload.call(this);
                        queueCall(onload, this);
                    }
                }

                function onload() {
                    loaded = true;
                    //queue(this.done, this, "load");
                    this.done("load");
                    if (resolved) {
                        //queue(this.done, this, "resolve");
                        this.done("resolve");
                    }
                }
            }
        });

    function registerLoader(type, loader) {
        resourceLoader[type] = loader;
    }

    function getResourceLoader(id) {
        var item, type, loader;
        item = resourceMap[id];
        type = item.type;
        if (!(loader = resourceLoader[type])) throw new Error("unknow type \"" + type + "\"");
        return new loader(id, item);
    }


    function setResourceMap(id, obj) {
        var res;
        if (obj !== undefined) {
            res = resourceMap[id] || {};
            copyProperties(res, obj);
            resourceMap[id] = res;
        } else {
            obj = id;
            for (id in obj) {
                setResourceMap(id, obj[id]);
            }
        }
    }

    function setModuleMap(mods) {
        copyProperties(moduleMap, mods);
    }

    function moudelToResource(name) {
        //ToDo根据模块名称得到Resource
        var id = moduleMap[name];
        if (!id)
            throw new Error("module \"" + name + "\" unknow.");
        return getResource(id);
    }

    function setResourceLoaded(obj) {
        var resource, count;
        count = obj.length;
        while (count--) {
            setResourceMap(obj[count], {
                    _loaded: true
                });
        }
    }

    copyProperties(Resource, {
            setResourceMap: setResourceMap,
            setModuleMap: setModuleMap,
            setResourceLoaded: setResourceLoaded,
            moudelToResource: moudelToResource
        });

    registerLoader("css", require("CSSLoader"));
    registerLoader("js", require("JSLoader"));
    return Resource;
});
/* __wrapped__ */
/* @cmd false */
