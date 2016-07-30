/*jslint indent: 2 */
(function envHtml(env) {
  "use strict";

  /*! env.html.js Version 1.0.0

      Copyright (c) 2015-2016 Tristan Cavelier <t.cavelier@free.fr>
      This program is free software. It comes without any warranty, to
      the extent permitted by applicable law. You can redistribute it
      and/or modify it under the terms of the Do What The Fuck You Want
      To Public License, Version 2, as published by Sam Hocevar. See
      http://www.wtfpl.net/ for more details. */

  // dependencies: RegExp,
  //               regexp (env.partitionString),
  // provides: env.htmlTagStringRegExp,
  //           env.htmlTagAttributeNameCharStringRegExp,
  //           env.htmlTagAttributeValueCharStringRegExp,
  //           env.htmlTagAttributeValueStringRegExp,
  //           env.htmlTagAttributeValueParserStringRegExp,
  //           env.htmlTagAttributeStringRegExp,
  //           env.htmlTagAttributeParserStringRegExp,
  //           env.htmlTagAttributesStringRegExp,
  //           env.htmlCommentParserStringRegExp,
  //           env.htmlTagParserStringRegExp,
  //           env.htmlTagOrCommentParserStringRegExp,
  //           env.htmlTagAttributeSearchParserRegExp,
  //           env.htmlTagOrCommentSearchParserRegExp,
  //
  //           env.escapeHtml,
  //           env.browseHtml,
  //           env.parseHtmlTagAttributes

  env.registerLib(envHtml);

  env.escapeHtml = function (text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  };

  env.htmlTagStringRegExp = "(?:[a-zA-Z][^\\/>\\s]*)";
  env.htmlTagAttributeNameCharStringRegExp = "(?:[^\\/=>\\s]+)";
  env.htmlTagAttributeValueCharStringRegExp = "(?:[^'\">\\s][^>\\s]*)";
  env.htmlTagAttributeValueStringRegExp       = "(?:\"[^\"]*\"|'[^']*'|" + env.htmlTagAttributeValueCharStringRegExp + ")";
  env.htmlTagAttributeValueParserStringRegExp = "(?:\"([^\"]*)\"|'([^']*)'|(" + env.htmlTagAttributeValueCharStringRegExp + "))";  // value = 1 || 2 || 3 || "";
  env.htmlTagAttributeStringRegExp       = "(?:" + env.htmlTagAttributeNameCharStringRegExp + "(?:=" + env.htmlTagAttributeValueStringRegExp + "?)?|=" + env.htmlTagAttributeValueStringRegExp + "?)";
  env.htmlTagAttributeParserStringRegExp = "(?:(" + env.htmlTagAttributeNameCharStringRegExp + ")(?:=(" + env.htmlTagAttributeValueStringRegExp + "?))?|=(" + env.htmlTagAttributeValueStringRegExp + "?))";  // key = 1 || ""; value = 2 || 3 || "";
  env.htmlTagAttributesStringRegExp = "(?:(?:[\\s/]*" + env.htmlTagAttributeStringRegExp + ")+)";
  env.htmlCommentParserStringRegExp = "(?:<!--((?:[^-]|-[^-]|--[^>])*)-->)";  // text = 1
  env.htmlTagParserStringRegExp = "<([/\\?!]?)(" + env.htmlTagStringRegExp + ")(" + env.htmlTagAttributesStringRegExp + "?)([\\s/]*)>";  // special = 1; tagName = 2; attributes = 3; endingslash = 4.slice(-1) === "/"
  env.htmlTagOrCommentParserStringRegExp = "(?:" + env.htmlCommentParserStringRegExp + "|" + env.htmlTagParserStringRegExp + ")";  // comment = 1; tag = "<" + 2 + 3 + 4 + 5 + ">"
  env.htmlTagAttributeSearchParserRegExp = new RegExp(env.htmlTagAttributeParserStringRegExp, "g");
  env.htmlTagOrCommentSearchParserRegExp = new RegExp(env.htmlTagOrCommentParserStringRegExp, "g");

  env.browseHtml = function (text, listener) {
    // listener is optional

    // returns a list of html parts like:
    // -   "<?DOCTYPE html>" -> type: "decl",        decl: "DOCTYPE html"
    // - '<!pi color="red">' -> type: "pi",          pi: 'pi color="red"'
    // -    '<a href="url">' -> type: "starttag",    name: "a",   attributes: [{name: "href", value: "url"}]
    // -              "</a>" -> type: "endtag",      name: "a"
    // -  '<img src="url"/>' -> type: "startendtag", name: "img", attributes: [{name: "src", value: "url"}]
    // -              "data" -> type: "data",        data: "data"
    //
    // browseHtml("a<b c=d>e</f>") -> [
    //   {type: "data", rawText: "a", data: "a"},
    //   {type: "starttag", rawText: "<b c=d>", name: "b", attributes: [{name: "c", value: "d"}]},
    //   {type: "data", rawText: "e", data: "e"},
    //   {type: "endtag", rawText: "</f>", name: "f"},
    //   {type: "data", rawText: "", data: ""}
    // ]
    var a = env.partitionString(text, env.htmlTagOrCommentSearchParserRegExp), l = a.length, i, events = [];
    if (listener === undefined) { listener = events.push; }
    for (i = 0; i < l; i += 1) {
      if (i % 2) {
        if (a[i][1] !== undefined) {
          listener(events, {type: "comment", rawText: a[i][0], comment: a[i][1]});
        } else {
          if (a[i][2] === "?") {
            listener(events, {type: "pi", rawText: a[i][0], name: a[i][3], pi: a[i][3] + a[i][4] + a[i][5]});
          } else if (a[i][2] === "!") {
            listener(events, {type: "decl", rawText: a[i][0], name: a[i][3], decl: a[i][3] + a[i][4] + a[i][5]});
          } else if (a[i][2] === "/") {
            listener(events, {type: "endtag", rawText: a[i][0], name: a[i][3]});
          } else if (a[i][5][a[i][5].length - 1] === "/") {
            listener(events, {type: "startendtag", rawText: a[i][0], name: a[i][3], attributes: env.parseHtmlTagAttributes(a[i][4])});
          } else {
            listener(events, {type: "starttag", rawText: a[i][0], name: a[i][3], attributes: env.parseHtmlTagAttributes(a[i][4])});
          }
        }
      } else {
        listener(events, {type: "data", rawText: a[i][0], data: a[i][0]});  // unescape html chars for data:
      }
    }
    return events;
  };

  env.parseHtmlTagAttributes = function (text) {
    var a = env.partitionString(text, env.htmlTagAttributeSearchParserRegExp), l = a.length, i, attrs = [];
    for (i = 0; i < l; i += 1) {
      if (i % 2) { attrs.push({name: a[i][1] || "", value: a[i][2] || a[i][3] || ""}); }
    }
    return attrs;
  };

}(this.env));
