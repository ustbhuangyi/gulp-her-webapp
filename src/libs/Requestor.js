__d("Requestor", ["Controller"], function (global, require, module, exports) {

  var Controller = require('Controller');

  var Requestor = {
    sessions: {},
    /*
     cacheData : {
     url1 : {
     id1 : {}, // {child : id2}
     id2 : {}
     },
     url2 : {
     id1 : {}, // {child : id2}
     id2 : {}
     }
     }
     */
    cacheData: {},
    fetch: function (pagelets, url) {
      var cache,
        cached = [],
        nonCached = [],
        pagelet,
        i,
        length = pagelets.length,
        j,
        child;

      if (cache = this.cacheData[url]) {
        for (i = 0; i < length; i++) {
          pagelet = pagelets[i];
          if (!cache[pagelet]) {
            nonCached.push(pagelet);
          } else {
            //cached.push(cache[pagelet]);
            findChild(cache[pagelet]);
          }
        }
      } else {
        nonCached = pagelets;
      }

      this._fetch(nonCached, url, Controller.pageletArrive, cached);

      function findChild(pagelet) {
        var count;
        count = pagelet.children && pagelet.children.length || 0;

        cached.push(pagelet);

        if (count) {
          for (j = 0; j < count; j++) {
            child = pagelet.children[j];
            child = cache[child];

            if (!child) {
              nonCached.push(child.id);
            } else {
              findChild(child);
            }
          }
        }
      }
    },
    _fetch: function (pagelets, url, callback, cached) {
      //var url;
      var cache;

      if (!this.cacheData[url]) {
        this.cacheData[url] = {};
      }
      cache = this.cacheData[url];

      if (!pagelets.length && cached.length) {
        parseData(cached);
        return;
      }

      for (var i = 0; i < pagelets.length; i++) {
        if (this.sessions[pagelets[i]] === undefined) {
          this.sessions[pagelets[i]] = 0;
        } else {
          this.sessions[pagelets[i]]++;
        }
        pagelets[i] += '.' + this.sessions[pagelets[i]];
      }
      url = url || '';

      if (url.indexOf('?') > -1) {
        url += '&__quickling__=' + pagelets.join(',');
      }
      else {
        url += '?__quickling__=' + pagelets.join(',');
      }

      ajax(url, function (text) {
        var data = JSON.parse(text);

        if (cached && cached.length) {
          data = data.concat(cached);
        }
        //console.log(data);
        parseData(data);
      });

      function parseData(data) {
        for (var i = 0; i < data.length; i++) {
          //BigPipe.onPageletArrive(data[i]);
          var conf = data[i];
          if (conf.html.html) {
            conf.html = conf.html.html;
          }
          //conf.html = conf.html.html;
          //if(!this.cacheData[url]) this.cacheData[url] = {};
          if (!cache[conf.id]) {
            cache[conf.id] = conf;
          }
          //if(conf.session >= me.sessions[conf.id]){
          callback && callback(data[i]);
          //}
        }
      }
    }
  };

  module.exports = Requestor;
});
/* __wrapped__ */
/* @cmd false */
