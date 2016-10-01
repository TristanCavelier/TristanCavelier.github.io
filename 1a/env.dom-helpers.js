/*jslint indent: 2 */
(function envDomHelpers(env) {
  "use strict";

  /*! Copyright (c) 2015-2016 Tristan Cavelier <t.cavelier@free.fr>
      This program is free software. It comes without any warranty, to
      the extent permitted by applicable law. You can redistribute it
      and/or modify it under the terms of the Do What The Fuck You Want
      To Public License, Version 2, as published by Sam Hocevar. See
      http://www.wtfpl.net/ for more details. */

  // dependencies: async (env.setTimeout),
  // provides: env.parseHtmlElements, env.{f,asyncF}itTextareaToTextHeightListener,
  //           env.findLinksFrom{,Html}Dom,
  //           env.makeElement, env.insertNodeAfter, env.replaceNode

  if (env.registerLib) env.registerLib(envDomHelpers);

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

}(this.env));
