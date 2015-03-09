/**
 *           File:  main.js
 *           Path:  BigPipe/javascript
 *         Author:  zhangyuanwei
 *       Modifier:  zhangyuanwei
 *       Modified:  2013-04-25 16:59:51
 *    Description:
 *
 *    __ignore__
 */
/* @cmd false */
(function (global, window, document, undefined) {
 // __inline('util/util.js');
  __inline('Arbiter.js');
  __inline('Resource.js');
  __inline('Pagelet.js');
  __inline('BigPipe.js');
  __inline('CSSLoader.js');
  __inline('JSLoader.js');
  __inline('Emulator.js');
  __inline('Requestor.js');
  __inline('Controller.js');
  __inline('wrapFunction.js');
  var _BigPipe = global["BigPipe"],
    BigPipe = require("BigPipe");

  global["BigPipe"] = new BigPipe();
  global["BigPipe"].ErrorUtils = require("ErrorUtils");
})(this, window, document);
