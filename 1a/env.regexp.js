/*jslint indent: 2 */
(function envRegExp(env) {
  "use strict";

  /*! env.regexp.js Version 1.0.0

      Copyright (c) 2015-2016 Tristan Cavelier <t.cavelier@free.fr>
      This program is free software. It comes without any warranty, to
      the extent permitted by applicable law. You can redistribute it
      and/or modify it under the terms of the Do What The Fuck You Want
      To Public License, Version 2, as published by Sam Hocevar. See
      http://www.wtfpl.net/ for more details. */

  env.registerLib(envRegExp);

  env.select = function (text, matcher) {  // slower than partition Oo' // XXX rename selectString
    // select("a b c b a", /a/g) -> [0,1,8,9]
    var selections = [];
    text.replace(matcher, function (match) {
      var index = arguments[arguments.length - 2];
      selections.push(index, index + match.length);
    });
    return selections;
  };

  env.partition = function (text, separator) {  // XXX rename partitionString
    // partition("a b c b a", /a/g) -> ["", "a", " b c b ", "a", ""]
    var result = [], lastIndex = 0;
    text.replace(separator, function (match) {
      var index = arguments[arguments.length - 2];
      result.push(text.slice(lastIndex, index));
      result.push(match);
      lastIndex = index + match.length;
      return match;
    });
    result.push(text.slice(lastIndex));
    return result;
  };

  env.partitionToObject = function (text, separator) {  // XXX rename partitionStringToObject
    // partition("a b c b a", /(a)/g) -> [
    //   {"type": "component", "0": ""},
    //   {"type": "separator", "0": "a", "1": "a"},
    //   {"type": "component", "0": " b c b "},
    //   {"type": "separator", "0": "a", "1": "a"},
    //   {"type": "component", "0": ""}
    // ]
    var result = [], lastIndex = 0;
    text.replace(separator, function (match) {
      var l = arguments.length - 2, index = arguments[l], i;
      result.push({type: "component", "0": text.slice(lastIndex, index)});
      result.push({type: "separator", "0": match});
      for (i = 1; i < l; i += 1) { result[result.length - 1][i] = arguments[i]; }
      lastIndex = index + match.length;
      return match;
    });
    result.push({type: "component", "0": text.slice(lastIndex)});
    return result;
  };

  env.escapeRegExp = function (text) {
    return text.replace(/([\\\[\]\{\}\(\)\.\?\*\+\^\$])/g, "\\$1");
  };

  env.parseRegExpToStrings = function (regexp) {
    // parseRegExpToStrings(/hello/g) -> ["hello", "g"]
    var strings = regexp.toString().split("/");
    //return [strings.slice(1, -1).join("/"), strings[strings.length - 1]];
    return [strings.slice(1, -1).join("/").replace(/((?:\\\\)*)\\\//g, "$1/"), strings[strings.length - 1]];
  };

  env.parseStringifiedRegExp = function (string) {
    // parseStringifiedRegExp("/hello/g") -> /hello/g

    // API stability level: 2 - Stable
    var res = /^\/((?:\\.|[^\\\/])*)\/([gimyu]{0,5})$/.exec(string);  // this regexp does not handle flag errors!
    if (res) {
      try { return new RegExp(res[1], res[2]); } catch (ignore) {}  // only this part checks for flag errors.
    }
    return null;
  };

}(this.env));
