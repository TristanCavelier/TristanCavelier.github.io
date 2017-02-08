/*jslint indent: 2 */
(function envStringHelpers(env) {
  "use strict";

  /*! env.string-helpers.js Version 1.1.0

      Copyright (c) 2015-2017 Tristan Cavelier <t.cavelier@free.fr>
      This program is free software. It comes without any warranty, to
      the extent permitted by applicable law. You can redistribute it
      and/or modify it under the terms of the Do What The Fuck You Want
      To Public License, Version 2, as published by Sam Hocevar. See
      http://www.wtfpl.net/ for more details. */

  // provides:
  //   env.formatStringFromDict
  //   env.splitLines

  if (env.registerLib) env.registerLib(envStringHelpers);

  function formatStringFromDict(text, dict, depth) {
    // formatStringFromDict("%(a)s %(b)j %(c)r", {a: "a", b: "b", c: "%(a)s"}) -> 'a "b" a'
    text = "" + text;
    if (typeof depth !== "number" || isNaN(depth)) depth = 5;
    if (depth < 0) throw new Error("too much recursion");
    return text.replace(/%(%|\(([a-zA-Z0-9_]+)\)([rsj]))/g, function (match, percentArg, key, format) {
      if (percentArg === "%") return "%";
      switch (format) {
        case "r": return formatStringFromDict(dict[key], dict, depth - 1);
        case "j": return JSON.stringify(dict[key]);
        default: return dict[key];
      }
    });
  }
  env.formatStringFromDict = formatStringFromDict;

  env.splitLines = function (text) {
    //   > splitLines('ab c\n\nde fg\rkl\r\n')
    //   ['ab c\n', '\n', 'de fg\r', 'kl\r\n']
    // Acts like python2 `str.splitlines(keepends=True)`.

    // It's also equal to the code below but 8 times faster:
    //     var result = [];
    //     text.replace(/(?:[^\r\n]*(?:\r\n|\r|\n)|[^\r\n]+)/g, line => result.push(line));
    //     return result;

    // Should we add these line break too ?
    //   \v or \x0b  Line Tabulation
    //   \f or \x0c  Form Feed
    //   \x1c        File Separator
    //   \x1d        Group Separator
    //   \x1e        Record Separator
    //   \x85        Next Line (C1 Control Code)
    //   \u2028      Line Separator
    //   \u2029      Paragraph Separator

    // If you want to split lines without having line breaks in the
    // result, just use:
    //     return text.split(/(?:\r\n|\r|\n)/g);

    var i = 0, l = text.length, li = 0, result = [];
    for (; i < l; ++i) {
      if (text[i] === "\n") result.push(text.slice(li, (li = i + 1)));
      else if (text[i] === "\r") {
        if (text[i + 1] === "\n") result.push(text.slice(li, (li = (++i) + 1)));
        else result.push(text.slice(li, (li = i + 1)));
      }
    }
    if (li !== i) result.push(text.slice(li));
    return result;
  };

}(this.env));
