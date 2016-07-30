/*jslint indent: 2 */
(function envStringHelpers(env) {
  "use strict";

  /*! env.string-helpers.js Version 1.0.0

      Copyright (c) 2015-2016 Tristan Cavelier <t.cavelier@free.fr>
      This program is free software. It comes without any warranty, to
      the extent permitted by applicable law. You can redistribute it
      and/or modify it under the terms of the Do What The Fuck You Want
      To Public License, Version 2, as published by Sam Hocevar. See
      http://www.wtfpl.net/ for more details. */

  // provides: env.formatStringFromDict

  env.registerLib(envStringHelpers);

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

}(this.env));
