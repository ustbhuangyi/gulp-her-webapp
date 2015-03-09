/* @cmd false */
/** 
 *           File:  cmd.js
 *           Path:  BigPipe/javascript
 *         Author:  zhangyuanwei
 *       Modifier:  zhangyuanwei
 *       Modified:  2013-04-25 17:40:43  
 *    Description:  一个简单的CMD实现 
 */

var _module_map = {};

function define(name, dependencies, factory) {
    _module_map[name] = {
        factory: factory,
        deps: dependencies
    };
}

function require(name) {
    var module, exports, factory, deps, dep, args, index, count, ret;
    module = _module_map[name];
    if (!module) throw new Error('Requiring unknown module "' + name + '"');
    if (module.hasOwnProperty("exports")) return module.exports;

	module.exports = exports = {};
    deps = module.deps;
    count = deps.length;
    index = -1;
    args = [];
    while (++index < count) {
        dep = deps[index];
        args.push(dep === "module" ? module : (dep === "exports" ? exports : require(dep)));
    }

    if ((ret = module.factory.apply(null, args)) !== undefined) {
        module.exports = exports = ret;
    }

    return exports;
}

function __b(name, exports) {
    _module_map[name] = {
        exports: exports
    };
}

function __d(name, dependencies, factory) {
    return define(name, ['global', 'require', 'module', 'exports'].concat(dependencies), factory);
}

__b("global", global);
__b("require", require);
