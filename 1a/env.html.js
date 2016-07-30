/*jslint indent: 2 */
(function envHtml(env) {
  "use strict";

  /*! Copyright (c) 2015-2016 Tristan Cavelier <t.cavelier@free.fr>
      This program is free software. It comes without any warranty, to
      the extent permitted by applicable law. You can redistribute it
      and/or modify it under the terms of the Do What The Fuck You Want
      To Public License, Version 2, as published by Sam Hocevar. See
      http://www.wtfpl.net/ for more details. */

  // dependencies: async (env.setTimeout),
  //               regexp (env.partitionString, env.partitionStringToObject),
  // provides: env.parseHtmlElements, env.{f,asyncF}itTextareaToTextHeightListener,
  //           env.findLinksFromDom, env.findLinksFromHtmlDom, env.makeElement,
  //           env.insertNodeAfter, env.replaceNode

  env.registerLib(envHtml);

  var partition = env.partitionString;

  env.parseHtmlElements = function (text) {
    // Usage:
    //   var elements = parseHtmlElements("<a>b</a><c>d<e>f</e></c><g>h</g>");
    //   elements[0] // -> <a>
    //   elements[1] // -> <c>
    //   elements[2] // -> <e>
    //   elements[3] // -> <g>
    // Inject children in an element
    //   [].forEach.call(elements, function (element) {
    //     if (element.parentNode.parentNode) { return; }
    //     root.appendChild(element);
    //   });

    /*global document */
    var div = document.createElement("div");
    div.innerHTML = text;
    return div.querySelectorAll("*");
  };

  env.fitTextareaToTextHeightListener = function (event) {
    // var textarea = document.querySelector("textarea");
    // textarea.addEventListener("keydown", env.asyncFitTextareaToTextHeightListener, false);
    // env.fitTextareaToTextHeightListener({target: textarea});
    var layout = document.createElement("div"), textarea = event.target;
    layout.style.display = "inline-block";
    layout.style.boxSizing = "border-box";
    layout.style.width = "1px";
    layout.style.height = (textarea.scrollHeight + textarea.offsetHeight - textarea.clientHeight) + "px";
    textarea.parentNode.insertBefore(layout, textarea);
    textarea.style.height = "1em";
    textarea.style.height = (textarea.scrollHeight + textarea.offsetHeight - textarea.clientHeight) + "px";
    layout.remove();
  };
  env.asyncFitTextareaToTextHeightListener = function (event) { env.setTimeout(env.fitTextareaToTextHeightListener, 0, event); };

  env.findLinksFromDom = function (dom) {
    // [ { "href": string,  // raw url as written in the html
    //     "attributeName": string,  // the attribute where the url was found (optional)
    //     "element": HTMLElement}, ...]

    // API stability level: 1 - Experimental

    var result = [], i, j, el, attr, tmp, row,
      elements = dom.querySelectorAll("*"),
      attributes = ["href", "src"],
      attributesLength = attributes.length,
      elementsLength = elements.length;
    for (i = 0; i < elementsLength; i += 1) {
      el = elements[i];
      for (j = 0; j < attributesLength; j += 1) {
        attr = attributes[j];
        tmp = el.getAttribute(attr);
        if (tmp) {
          row = {
            element: el,
            href: tmp,
            attributeName: attr
          };
          result.push(row);
        }
      }
      if (el.tagName === "HTML") {
        tmp = el.getAttribute("manifest");
        if (tmp) {
          result.push({
            element: el,
            href: tmp,
            attributeName: "manifest"
          });
        }
      }
    }
    return result;
  };
  env.findLinksFromHtmlDom = env.findLinksFromDom;

  function xxxfindAttributesInXmlDom(dom, attributes) {  // XXX move to env.xml.js ?
    // [ { "name": string,  // the attribute name
    //     "value": string,  // the attribute value
    //     "element": HTMLElement}, ...]

    // API stability level: 1 - Experimental

    var result = [], i, j, el, attr, tmp, row,
      elements = dom.querySelectorAll("*"),
      attributesLength = attributes.length,
      elementsLength = elements.length;
    for (i = 0; i < elementsLength; i += 1) {
      el = elements[i];
      for (j = 0; j < attributesLength; j += 1) {
        attr = attributes[j];
        tmp = el.getAttribute(attr);
        if (tmp) {
          row = {
            element: el,
            href: tmp,
            attributeName: attr
          };
          result.push(row);
        }
      }
    }
    return result;
  }

  env.makeElement = function (tagName, attributes, children, callback) {
    // makeElement("button", [["type", "submit"], ["name", "search"]], ["textNode", element], function (button) { button.onclick = fn; })

    // @param  {String} tagName
    // @param  {Array<Couple<String>>} [attributes]
    // @param  {Array<String|HTMLElement>} [children]
    // @param  {Function} [callback]
    // @return {HTMLElement} new element

    /*global document */
    var element = document.createElement(tagName), i = 0, l = (attributes ? attributes.length : 0);
    while (i < l) {
      element.setAttribute(attributes[i][0], attributes[i][1]);
      i += 1;
    }
    l = (children ? children.length : 0);
    for (i = 0; i < l; i += 1) {
      if (typeof children[i] === "string") {
        element.appendChild(document.createTextNode(children[i]));
      } else {
        element.appendChild(children[i]);
      }
    }
    if (typeof callback === "function") { callback(element); }
    return element;
  };

  env.insertNodeAfter = function (referenceNode, newNode) { return referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling); };

  env.replaceNode = function (referenceNode, newNode) {
    while (referenceNode.childNodes.length > 0) { newNode.appendChild(referenceNode.childNodes[0]); }
    insertNodeAfter(referenceNode, newNode);
    referenceNode.remove();
    return newNode;
  };

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
    var a = partition(text, env.htmlTagOrCommentSearchParserRegExp), l = a.length, i, events = [];
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
    var a = partition(text, env.htmlTagAttributeSearchParserRegExp), l = a.length, i, attrs = [];
    for (i = 0; i < l; i += 1) {
      if (i % 2) { attrs.push({name: a[i][1] || "", value: a[i][2] || a[i][3] || ""}); }
    }
    return attrs;
  };

  env.xxxfindLinksFromHtmlTags = function (text) {
    var a = env.browseHtml(text), l = a.length, i, events = [], b, j, m;
    for (i = 0; i < l; i += 1) {
      if (a[i].type === "startendtag" || a[i].type === "starttag") {
        b = a[i].attributes;
        m = b.length;
        for (j = 0; j < m; j += 1) {
          if (b[j].name === "href" || b[j].name === "src") {
            events.push({href: b[j].value, tag: a[i], tagIndex: i, attribute: b[j], attributeIndex: j});
          }
        }
      } else if (a[i].type === "starttag" && a[i].name.toLowerCase() === "html") {
        b = a[i].attributes;
        m = b.length;
        for (j = 0; j < m; j += 1) {
          if (b[j].name === "manifest") {
            events.push({href: b[j].value, tag: a[i], tagIndex: i, attribute: b[j], attributeIndex: j});
          }
        }
      }
    }
    return events;
  };

  //var eat = function (regexp, text, i, parser) {
  //  if (!(i = regexp.exec(text.slice(i)))) { return null; }
  //  if (parser) { return {match: i[0], result: parser(i)}; }
  //  return {match: i[0], result: i[0]};
  //};

  ////env.parseHtmlParts = function (text) {};
  ////env.eatHtmlParts = function (text, i) {
  ////  while
  ////    eat text
  ////    eat tag or comment
  ////};
  //env.eatHtmlComment = function (text, i) { return eat(/^<!--([^-]|-[^-]|--[^>])-->)/, text, i, function (res) { return {rawText: res[1], text: res[1]}; }); };  // unescape html chars for text
  //env.eatHtmlText = function (text, i) {
  //  var tmp = /(?:<!--|<[\?!\/]?[a-zA-Z])/.exec(text.slice(i));
  //  if (tmp !== null) {
  //    if (tmp.index === 0) { return null; }
  //    tmp = {match: text.slice(i, i + tmp.index)};
  //    tmp.result = tmp.match;  // unescape html chars !
  //  } else {
  //    tmp = {match: text.slice(i)};
  //    tmp.result = tmp.match;  // unescape html chars !
  //  }
  //  return tmp;
  //};
  //env.eatTag = function (text, i) {  // rename eatHtmlTag
  //  var result = {match: "", result: {}}, tmp, type, oi = i;
  //  if (!(tmp = /^<([\?!\/])?([a-zA-Z][^\/>\s]*)/.exec(text.slice(i)))) { return null; }  // XXX check if = can be in the tag name
  //  result.result.name = tmp[2];
  //  i += tmp[0].length;
  //  switch (tmp[1]) {
  //    case "?": type = "pi"; break;
  //    case "!": type = "decl"; break;
  //    //  if (tmp[2].toLowerCase() === "doctype") {
  //    //    type = "decl";
  //    //  } else {
  //    //    type = "unknown decl";
  //    //  }
  //    //  break;
  //    case "/": type = "end"; break;
  //    default: type = "start"; break;
  //  }
  //  if ((tmp = env.eatAttributeSeparator(text, i)) !== null) { i += tmp.match.length; }
  //  if ((tmp = env.eatAttributeList(text, i)) !== null) {
  //    result.result.attributes = tmp.result;
  //    i += tmp.match.length;
  //  }
  //  if ((tmp = env.eatAttributeSeparator(text, i)) !== null) {
  //    i += tmp.match.length;
  //    if (type === "start" && tmp.match[tmp.match.length - 1] === "/") { type = "startend"; }
  //  }
  //  if (text[i] !== ">") { return null; }
  //  result.match = text.slice(oi, i + 1);
  //  result.result.type = type;
  //  return result;
  //};
  //env.eatAttributeList = function (text, i) {  // rename eatHtmlTagAttributeList
  //  var result = {match: "", result: []}, tmp, tmp2;
  //  if (!(tmp = env.eatAttribute(text, i))) { return null; }
  //  result.match += tmp.match;
  //  result.result.push(tmp.result);
  //  while ((tmp = env.eatAttributeSeparator(text, i + result.match.length)) !== null) {
  //    tmp2 = tmp.match;
  //    if (!(tmp = env.eatAttribute(text, i + tmp2.length + result.match.length))) { return result; }
  //    result.match += tmp2 + tmp.match;
  //    result.result.push(tmp.result);
  //  }
  //  return result;
  //};
  //env.eatAttributeSeparator = function (text, i) { return eat(/^[\s\/]*/, text, i); };  // rename eatHtmlTagAttributeSeparator
  //env.eatAttribute = function (text, i) {  // rename eatHtmlTagAttribute
  //  var tmp, tmp2;
  //  if (!(tmp = env.eatAttributeKey(text, i))) {
  //    if (text[i] !== "=") { return null; }
  //    if (!(tmp = env.eatAttributeValue(text, i + 1))) {
  //      return {match: "=", result: {name: "", value: ""}};
  //    }
  //    return {match: "=" + tmp.match, result: {name: "", value: tmp.result}};
  //  }
  //  if (text[i + tmp.match.length] !== "=") {
  //    return {match: tmp.match, result: {name: tmp.result, value: null}};
  //  }
  //  if (!(tmp2 = env.eatAttributeValue(text, i + tmp.match.length + 1))) {
  //    return {match: tmp.match + "=", result: {name: tmp.result, value: ""}};
  //  }
  //  return {match: tmp.match + "=" + tmp2.match, result: {name: tmp.result, value: tmp2.result}};
  //};
  //env.eatAttributeKey = function (text, i) {  // rename eatHtmlTagAttributeKey
  //  var text = text.slice(i), tmp;
  //  if (!(tmp = /^(?:[^\/=>\s]+)/.exec(text))) { return null; }
  //  return {match: tmp[0], result: tmp[0]};
  //};
  //env.eatAttributeValue = function (text, i) {  // rename eatHtmlTagAttributeValue
  //  var text = text.slice(i), tmp;
  //  if (!(tmp = /^(?:"([^"]*)"|'([^']*)'|((?:[^'">\s][^>\s]*)?))/.exec(text))) { return null; }
  //  return {match: tmp[0], result: tmp[1] || tmp[2] || tmp[3]};  // unescape html chars
  //};

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
  ////var cssUrlSearchParserRegExp = /(:[ \t]*url\()((")([^"]*)"|(')([^']*)'|([^\)]*))\)/g;
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
