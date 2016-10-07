(function envPathHelpers(env) {
  "use strict";

  /*! env.path-helpers.js

      Copyright (c) 2015-2016 Tristan Cavelier <t.cavelier@free.fr>
      This program is free software. It comes without any warranty, to
      the extent permitted by applicable law. You can redistribute it
      and/or modify it under the terms of the Do What The Fuck You Want
      To Public License, Version 2, as published by Sam Hocevar. See
      http://www.wtfpl.net/ for more details. */

  // provides:
  //   env.parsePathAllowEmptyBase

  if (env.registerLib) env.registerLib(envPathHelpers);

  const path = require("path").posix;

  env.parsePathAllowEmptyBase = function (p) {
    // if the path ends with a slash like "/coucou.txt/" the result is
    // {root: "/", dir: "/coucou.txt", base: "", ext: "", name: ""}
    // instead of path.parse
    // {root: "/", dir: "/", base: "coucou.txt", ext: ".txt", name: "coucou"}
    var tmp = path.parse(p + "0");
    if (tmp.ext) tmp.ext = tmp.ext.slice(0, -1);
    else tmp.name = tmp.name.slice(0, -1);
    tmp.base = tmp.base.slice(0, -1);
    return tmp;
    //var tmp = /\/([^\/]*)$/.exec(p);  // translate for windows ?
    //if (tmp) { return {dir: p.slice(0, tmp.index) || "/", base: tmp[1]}; }
    //return {dir: "", base: p};
  };

}(this.env));
