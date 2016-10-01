(function envRequire(env) {
  "use strict";

  /*! env.require.node.js Version 1.0.0

      Copyright (c) 2015-2016 Tristan Cavelier <t.cavelier@free.fr>
      This program is free software. It comes without any warranty, to
      the extent permitted by applicable law. You can redistribute it
      and/or modify it under the terms of the Do What The Fuck You Want
      To Public License, Version 2, as published by Sam Hocevar. See
      http://www.wtfpl.net/ for more details. */

  // dependency: include

  var load = include;
  var fs = require("fs");
  function upperModulo(v, m) { return v + m - (v % m); }

  if (env.registerLib) env.registerLib(envRequire);
  env.requireCache = {
    requiring: {},
    lastUsed: {},
    modified: {},
    value: {}
  };
  env.requireCacheMiss = function (path, options) {
    var id, cache = env.requireCache,
      prefix = options && options.prefix || "";
    id = prefix + ":" + path;
    delete cache.lastUsed[id];
    delete cache.modified[id];
    delete cache.value[id];
  };
  env.require = function (path, options) {
    var stat, value, modified, id, cache = env.requireCache,
      prefix = options && options.prefix || "",  // string
      context = options && options.context || this,  // object (unused by cache)
      modulo = options && options.modulo,  // number in ms
      tolerency = options && (options.tolerency - 0) || 0,  // number in ms
      now = options && (options.now - 0) || Date.now();  // number in ms
    id = prefix + ":" + path;
    if (cache.requiring[id]) { throw new Error("env.require loop"); }
    modified = (cache.modified[id] - 0) || 0;  // 0 if undefined, null, NaN or invalid date
    if (upperModulo(modified, modulo) >= now) {  // false on NaN, null or undefined
      return cache.value[id];
    }
    stat = fs.statSync(path);
    if (modified - tolerency >= stat.mtime) {  // false on Invalid Date, NaN or undefined
      return cache.value[id];
    }
    cache.requiring[id] = true;
    if (options && options.defaultsToCacheOnError) {
      try {
        //value = eval(fs.readFileSync(path).toString());
        value = load.call(context, path);
      } catch (e) {
        console.warn("env: warning: require failed to load '" + path + "':", e);
        value = cache.value[id];
      }
    } else {
      //value = eval(fs.readFileSync(path).toString());
      value = load.call(context, path);
    }
    delete cache.requiring[id];
    cache.lastUsed[id] = new Date();
    cache.modified[id] = stat.mtime;
    cache.value[id] = value;
    return value;
  };

}(this.env));
