/*jslint indent: 2 */
(function envSvg(env) {
  "use strict";

  /*! Copyright (c) 2015-2016 Tristan Cavelier <t.cavelier@free.fr>
      This program is free software. It comes without any warranty, to
      the extent permitted by applicable law. You can redistribute it
      and/or modify it under the terms of the Do What The Fuck You Want
      To Public License, Version 2, as published by Sam Hocevar. See
      http://www.wtfpl.net/ for more details. */

  env.registerLib(envSvg);

  env.findLinksFromSvgDom = function (svgDom) {
    // XXX add parameters to retrieve namespaces too ?

    // [ { "href": string,  // raw url as written in the html
    //     "attributeName": string,  // the attribute where the url was found (optional)
    //     "element": HTMLElement}, ...]

    // API stability level: 1 - Experimental

    var result = [], i, j, el, attr, row,
      elements = svgDom.querySelectorAll("*"),
      attributes, attributesLength,
      elementsLength = elements.length;
    for (i = 0; i < elementsLength; i += 1) {
      attributes = elements[i].attributes || [];
      attributesLength = attributes.length;
      for (j = 0; j < attributesLength; j += 1) {
        attr = attributes[j];
        if (attr.localName === "href") {
          if (attr.value[0] !== "#") {
            //row = {  // please use this row instead of the one just below
            //  href: attr.value,
            //  attribute: attr,
            //  attributeIndex: j,
            //  node: el,
            //  nodeIndex: i
            //};
            row = {
              href: attr.value,
              attributeName: attr.name,
              element: el
            };
            result.push(row);
          }
        }
      }
    }
    return result;
  }

}(this.env));