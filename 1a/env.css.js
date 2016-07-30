/*jslint indent: 2 */
(function envCss(env) {
  "use strict";

  /*! Copyright (c) 2015-2016 Tristan Cavelier <t.cavelier@free.fr>
      This program is free software. It comes without any warranty, to
      the extent permitted by applicable law. You can redistribute it
      and/or modify it under the terms of the Do What The Fuck You Want
      To Public License, Version 2, as published by Sam Hocevar. See
      http://www.wtfpl.net/ for more details. */

  // dependency: regexp (env.partitionStringToObject)
  // provides: env.parseCssForUrl

  env.registerLib(envCss);

  //env.findCssLinks = function (text) {  // move to env.css.js ?
  //  var a = partition(text, /\/\*(?:[^\*]|\*[^\/])*\*\//g), l = a.length, i, links = [];
  //  function push(match, one, two, three) { links.push({match: match, href: one || two || three || ""}); }
  //  for (i = 0; i < l; i += 1) {
  //    if (i % 2 === 0) {
  //      a[i][0].replace(/:\s*url\((?:"([^"]*)"|'([^']*)'|([^\)]*))\)/g, push);
  //    }
  //  }
  //  return links;
  //};

  //var cssCommentSearchParserRegExp = /\/\*((?:[^\*]|\*[^\/])*)\*\//g;
  //var cssUrlSearchParserRegExp = /(:[ \t]*url\()((")([^"]*)"|(')([^']*)'|([^\)]*))\)/g;
  //var cssUrlSearchParserRegExp = /(:[ \t]*url\()(\s*(")([^"]*)"\s*|\s*(')([^']*)'\s*|([^\)]*))\)/g;
  //var cssUrlSearchParserRegExp = /(url\()(\s*(")([^"]*)"\s*|\s*(')([^']*)'\s*|([^\)]*))\)/g;
  function parseCssForUrl(text) {  // XXX move to env.css.js ?
    // return tuple list like: [
    //   [type: "data",    ""],
    //   [type: "comment", "/* set body background image */", " set body background image "],
    //   [type: "data",    "\nbody {\n  background-image: url("],
    //   [type: "url",     "  'http://ima.ge/bg.png' ", "http://ima.ge/bg.png", "'"],
    //   [type: "data",    ");\n}\n"],
    // ]
    var result = [], parts = env.partitionStringToObject(text, /\/\*((?:[^\*]|\*[^\/])*)\*\//g), i = 0, l = parts.length,
        subparts, si, sl, data, part, row;
    for (; i < l; i += 1) {
      if (i % 2) {  // comment
        row = [parts[i][0], parts[i][1]]; row.type = "comment";
        result.push(row);
      } else {  // non comment
        subparts = env.partitionStringToObject(parts[i][0], /(url\()(\s*(")([^"]*)"\s*|\s*(')([^']*)'\s*|([^\)]*))\)/g);
        sl = subparts.length;
        data = "";
        for (si = 0; si < sl; si += 1) {
          if (si % 2) {  // url
            part = subparts[si];
            row = [data + part[1]]; row.type = "data";
            result.push(row);
            row = [part[2], (part[4] || part[6] || part[7] || "").replace(/(^\s+|\s+$)/g, ""), part[3] || part[5] || ""]; row.type = "url";
            result.push(row);
            data = ")";
          } else {  // css data
            data += subparts[si][0];
          }
        }
        row = [data]; row.type = "data";
        result.push(row);
      }
    }
    return result;
  }
  //function str(x) { return x.map((v) => "[\"type\":" + JSON.stringify(v.type || null) + "," + JSON.stringify(v).slice(1)); }
  //setTimeout(() => console.log(str(parseCssForUrl("data /* hey */ body { background-image: url( ' abc ' ); }"))));

}(this.env));
