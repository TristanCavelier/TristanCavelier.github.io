(function envOther(env) {

  /*! Copyright (c) 2015-2016 Tristan Cavelier <t.cavelier@free.fr>
      This program is free software. It comes without any warranty, to
      the extent permitted by applicable law. You can redistribute it
      and/or modify it under the terms of the Do What The Fuck You Want
      To Public License, Version 2, as published by Sam Hocevar. See
      http://www.wtfpl.net/ for more details. */

  // API stability Levels (inspired from nodejs api):
  //   0 - Deprecated (red)
  //   1 - Experimental (orange)
  //   2 - Stable (green)
  //   3 - Locked (blue)
  // If no level is mentioned = 1 - Experimental

  env.registerLib(envOther);

  env.lineDiff = function (text1, text2, parsedLineListener) {
    function rec(matrix, a1, a2, x, y, parsedLineListener) {
      if (x > 0 && y > 0 && a1[y - 1] === a2[x - 1]) {
        rec(matrix, a1, a2, x - 1, y - 1, parsedLineListener);
        return parsedLineListener({lineA: x, lineB: y, operator: " ", line: a1[y - 1]});
      }
      if (x > 0 && (y === 0 || matrix[y][x - 1] >= matrix[y - 1][x])) {
        rec(matrix, a1, a2, x - 1, y, parsedLineListener);
        return parsedLineListener({lineA: x, lineB: null, operator: "+", line: a2[x - 1]});
      }
      if (y > 0 && (x === 0 || matrix[y][x - 1] < matrix[y - 1][x])) {
        rec(matrix, a1, a2, x, y - 1, parsedLineListener);
        return parsedLineListener({lineA: null, lineB: y, operator: "-", line: a1[y - 1]});
      }
    }

    var a1 = text1.split("\n"), a2 = text2.split("\n"),
        matrix = new Array(a1.length + 1),
        r = [], x, y;

    for (y = 0; y < matrix.length; y += 1) {
      matrix[y] = new Array(a2.length + 1);
      for (x = 0; x < matrix[y].length; x += 1) matrix[y][x] = 0;
    }

    for (y = 1; y < matrix.length; y += 1) {
      for (x = 1; x < matrix[y].length; x += 1) {
        if (a1[y - 1] === a2[x - 1]) matrix[y][x] = 1 + matrix[y - 1][x - 1];
        else matrix[y][x] = Math.max(matrix[y - 1][x], matrix[y][x - 1]);
      }
    }
    rec(matrix, a1, a2, x - 1, y - 1, parsedLineListener || function (e) { r.push(e.operator + e.line); });
    return r.join("\n");
  };

  function DiffEditor() {
    var it = this;
    it.textareaA = env.makeElement("textarea");
    it.textareaB = env.makeElement("textarea");
    it.resultTable = env.makeElement("table", [["style", "white-space: pre; font-family: monospace;"]], [
      it.resultTableBody = env.makeElement("tbody")
    ]);
    it.textareaA.oninput = it.textareaB.oninput = function () {
      clearTimeout(it._timer);
      if (it.autoRunInterval === -1) return;
      if (it.autoRunInterval === 0) return it.run();
      it._timer = setTimeout(function () { it.run(); }, it.autoRunInterval);
    };
    it.element = env.makeElement("div", [], [
      it.textareaA,
      it.textareaB,
      it.resultTable
    ]);
  }
  DiffEditor.prototype.autoRunInterval = 500;  // -1 is disabled, 0 is instant
  DiffEditor.prototype.eval = env.lineDiff;
  DiffEditor.prototype.run = function () {
    var it = this;
    this.resultTableBody.innerHTML = "";
    this.eval(it.textareaA.value, it.textareaB.value, function (e) {
      it.resultTableBody.appendChild(env.makeElement("tr", (
        e.operator === "+" ? [["style", "background-color:rgba(0, 255, 0, 0.5);"]] :
        e.operator === "-" ? [["style", "background-color:rgba(255, 0, 0, 0.5);"]] :
        []
      ), [
        env.makeElement("td", [], [(e.lineA || " ").toString()]),
        env.makeElement("td", [], [(e.lineB || " ").toString()]),
        env.makeElement("td", [], [e.operator + e.line])
      ]));
    });
  };
  env.DiffEditor = DiffEditor;
  //new DiffEditor().element;

  function MapPolyfill(iterable) {
    var d = this["[[MapPolyfill:data]]"] = [], i, l, a;
    if (iterable !== undefined && iterable !== null) {
      a = Object.keys(iterable);
      i = 0;
      l = a.length;
      for (; i < l; i += 1) this.set(a[i], iterable[a[i]]);
    }
  }
  MapPolyfill.prototype.size = 0;
  MapPolyfill.prototype.clear = function () {
    this["[[MapPolyfill:data]]"].length = 0;
    this.size = 0;
  };
  MapPolyfill.prototype.delete = function (key) {
    var i = 0, d = this["[[MapPolyfill:data]]"], l = d.length;
    for (; i < l; i += 2) {
      if (d[i] === key) {
        d.splice(i, 2);
        this.size = (l / 2) - 1;
        return;
      }
    }
  };
  MapPolyfill.prototype.entries = function () {
    var i = 0, d = this["[[MapPolyfill:data]]"], l = d.length, res = [];
    for (; i < l; i += 2) res.push([d[i], d[i + 1]]);
    return res;
  };
  MapPolyfill.prototype.forEach = function (callbackFn, thisArg) {
    var i = 0, d = this["[[MapPolyfill:data]]"], l = d.length;
    for (; i < l; i += 2) callbackFn.call(thisArg, d[i], d[i + 1]);
    return res;
  };
  MapPolyfill.prototype.get = function (key) {
    var i = 0, d = this["[[MapPolyfill:data]]"], l = d.length;
    for (; i < l; i += 2) if (d[i] === key) return d[i + 1];
  };
  MapPolyfill.prototype.has = function (key) {
    var i = 0, d = this["[[MapPolyfill:data]]"], l = d.length;
    for (; i < l; i += 2) if (d[i] === key) return true;
    return false;
  };
  MapPolyfill.prototype.keys = function () {
    var i = 0, d = this["[[MapPolyfill:data]]"], l = d.length, res = [];
    for (; i < l; i += 2) res.push(d[i]);
    return res;
  };
  MapPolyfill.prototype.set = function (key, value) {
    var i = 0, d = this["[[MapPolyfill:data]]"], l = d.length;
    for (; i < l; i += 2) {
      if (d[i] === key) {
        d[i + 1] = value;
        return;
      }
    }
    d.push(key, value);
    this.size = (l / 2) + 1;
  };
  MapPolyfill.prototype.values = function () {
    var i = 0, d = this["[[MapPolyfill:data]]"], l = d.length, res = [];
    for (; i < l; i += 2) res.push(d[i + 1]);
    return res;
  };
  env.MapPolyfill = MapPolyfill;

  function encodeTextToUtf8ByteArray(s) {
    // Handles unicode from U+0000 to U+10FFFF
    // Assuming javascript string is Utf-16
    var a = [], n, c, c2;
    for (n = 0; n < s.length; n += 1) {
      c = s.charCodeAt(n);
      if (c < 0x80) {
        a.push(c);
      } else if (c < 0x800) {
        a.push((c >> 6) | 0xc0, (c & 0x3f) | 0x80);
      } else if ((c >= 0xd800) && (c <= 0xdbff)) {
        n += 1;
        if (n >= s.length)
          throw new Error("invalid string");  // incomplete surrogate pair
        c2 = s.charCodeAt(n);
        if (c2 < 0xdc00 || c2 > 0xdfff)
          throw new Error("invalid string");  // invalid surrogate pair
        c = ((c - 0xd800) << 10) + (c2 - 0xdc00) + 0x10000;
        a.push(
          (c >> 18) | 0xf0,
          ((c >> 12) & 0x3f) | 0x80,
          ((c >> 6) & 0x3f) | 0x80,
          (c & 0x3f) | 0x80
        );
      } else {
        a.push(
          (c >> 12) | 0xe0,
          ((c >> 6) & 0x3f) | 0x80,
          (c & 0x3f) | 0x80
        );
      }
    }
    return a;
  };
  env.encodeTextToUtf8ByteArray = encodeTextToUtf8ByteArray;

  function softEncodeTextToUtf8ByteArray(s) {
    // Handles unicode from U+0000 to U+10FFFF
    // Assuming javascript string is Utf-16
    var a = [], n, c, c2;
    for (n = 0; n < s.length; n += 1) {
      c = s.charCodeAt(n);
      if (c < 0x80) {
        a.push(c);
      } else if (c < 0x800) {
        a.push((c >> 6) | 0xc0, (c & 0x3f) | 0x80);
      } else if ((c >= 0xd800) && (c <= 0xdbff)) {
        if (n + 1 >= s.length) {
          a.push(0xef, 0xbf, 0xbd);  // incomplete surrogate pair
          break;
        }
        c2 = s.charCodeAt(n + 1);
        if (c2 < 0xdc00 || c2 > 0xdfff) {
          a.push(0xef, 0xbf, 0xbd);  // invalid surrogate pair
        } else {
          n += 1;
          c = ((c - 0xd800) << 10) + (c2 - 0xdc00) + 0x10000;
          a.push(
            (c >> 18) | 0xf0,
            ((c >> 12) & 0x3f) | 0x80,
            ((c >> 6) & 0x3f) | 0x80,
            (c & 0x3f) | 0x80
          );
        }
      } else {
        a.push(
          (c >> 12) | 0xe0,
          ((c >> 6) & 0x3f) | 0x80,
          (c & 0x3f) | 0x80
        );
      }
    }
    return a;
  };
  env.softEncodeTextToUtf8ByteArray = softEncodeTextToUtf8ByteArray;

  function decodeUtf8ByteArrayToText(ba) {
    var i, l = ba.length, c;
    for (i = 0; i < l; i += 1) {
      c = ba[i];
      if (c & 0x80) {
        // XXX http://www.unicode.org/faq/utf_bom.html
      }
    }
  }
  env.decodeUtf8ByteArrayToText = decodeUtf8ByteArrayToText;


  function textToUtf8ByteArray(sDOMStr) {
    /*jslint plusplus: true, bitwise: true */
    // Assuming javascript string is Utf-16
    // Issue: returns invalid byte array if "\uD800\u0000"

    var aBytes = [], nChr, nStrLen = sDOMStr.length, nIdx = 0, nChrIdx;

    for (nChrIdx = 0, nChrIdx = 0; nChrIdx < nStrLen; nChrIdx += 1) {
      nChr = sDOMStr.codePointAt(nChrIdx);
      if (nChr < 128) {
        /* one byte */
        aBytes[nIdx++] = nChr;
      } else if (nChr < 0x800) {
        /* two bytes */
        aBytes[nIdx++] = 192 + (nChr >>> 6);
        aBytes[nIdx++] = 128 + (nChr & 63);
      } else if (nChr < 0x10000) {
        /* three bytes */
        aBytes[nIdx++] = 224 + (nChr >>> 12);
        aBytes[nIdx++] = 128 + (nChr >>> 6 & 63);
        aBytes[nIdx++] = 128 + (nChr & 63);
      } else if (nChr < 0x200000) {
        /* four bytes */
        nChrIdx += 1;
        aBytes[nIdx++] = 240 + (nChr >>> 18);
        aBytes[nIdx++] = 128 + (nChr >>> 12 & 63);
        aBytes[nIdx++] = 128 + (nChr >>> 6 & 63);
        aBytes[nIdx++] = 128 + (nChr & 63);
      } else if (nChr < 0x4000000) {
        /* five bytes */
        nChrIdx += 1;
        aBytes[nIdx++] = 248 + (nChr >>> 24);
        aBytes[nIdx++] = 128 + (nChr >>> 18 & 63);
        aBytes[nIdx++] = 128 + (nChr >>> 12 & 63);
        aBytes[nIdx++] = 128 + (nChr >>> 6 & 63);
        aBytes[nIdx++] = 128 + (nChr & 63);
      } else { /* if (nChr <= 0x7fffffff) */
        /* six bytes */
        nChrIdx += 1;
        aBytes[nIdx++] = 252 + /* (nChr >>> 32) is not possible in ECMAScript! So...: */ (nChr / 1073741824);
        aBytes[nIdx++] = 128 + (nChr >>> 24 & 63);
        aBytes[nIdx++] = 128 + (nChr >>> 18 & 63);
        aBytes[nIdx++] = 128 + (nChr >>> 12 & 63);
        aBytes[nIdx++] = 128 + (nChr >>> 6 & 63);
        aBytes[nIdx++] = 128 + (nChr & 63);
      }
    }
    return aBytes;
  }

  function utf8ByteArrayToText(aBytes) {
    /*jslint plusplus: true, bitwise: true */
    var sView = "", nPart, nLen = aBytes.length, nIdx;

    for (nIdx = 0; nIdx < nLen; ++nIdx) {
      nPart = aBytes[nIdx];
      sView += String.fromCharCode(
        nPart > 251 && nPart < 254 && nIdx + 5 < nLen ? /* six bytes */ (
          /* (nPart - 252 << 32) is not possible in ECMAScript! So...: */
          (nPart - 252) * 1073741824 + (aBytes[++nIdx] - 128 << 24) + (aBytes[++nIdx] - 128 << 18) + (aBytes[++nIdx] - 128 << 12) + (aBytes[++nIdx] - 128 << 6) + aBytes[++nIdx] - 128
        ) : nPart > 247 && nPart < 252 && nIdx + 4 < nLen ? /* five bytes */ (
          (nPart - 248 << 24) + (aBytes[++nIdx] - 128 << 18) + (aBytes[++nIdx] - 128 << 12) + (aBytes[++nIdx] - 128 << 6) + aBytes[++nIdx] - 128
        ) : nPart > 239 && nPart < 248 && nIdx + 3 < nLen ? /* four bytes */ (
          (nPart - 240 << 18) + (aBytes[++nIdx] - 128 << 12) + (aBytes[++nIdx] - 128 << 6) + aBytes[++nIdx] - 128
        ) : nPart > 223 && nPart < 240 && nIdx + 2 < nLen ? /* three bytes */ (
          (nPart - 224 << 12) + (aBytes[++nIdx] - 128 << 6) + aBytes[++nIdx] - 128
        ) : nPart > 191 && nPart < 224 && nIdx + 1 < nLen ? /* two bytes */ (
          (nPart - 192 << 6) + aBytes[++nIdx] - 128
        ) : /* nPart < 127 ? */ /* one byte */ nPart
      );
    }

    return sView;
  }
  env.utf8ByteArrayToText = utf8ByteArrayToText;



  env.headerParamNoCommaNameStringRegExp = "(?:[^=;,]+)";
  env.headerParamNoCommaUnquotedValueStringRegExp = "(?:[^\";,]+)";
  env.headerParamNoCommaValueStringRegExp = "(?:(?:" + env.headerParamQuotedValueStringRegExp + "|" + env.headerParamNoCommaUnquotedValueStringRegExp + ")+)";
  env.headerParamNoCommaStringParserRegExp = "(?:(" + env.headerParamNoCommaNameStringRegExp + "?)(?:=(" + env.headerParamNoCommaValueStringRegExp + "?))?)";
  env.headerParamsNoCommaStringRegExp = "(?:" + env.headerParamNoCommaStringParserRegExp + "(?:;" + env.headerParamNoCommaStringParserRegExp + ")*)";

  var headerParamNoCommaEaterRegExp = env.headerParamNoCommaEaterRegExp = new RegExp("^" + env.headerParamNoCommaStringParserRegExp + "(;|,|)");
  env.parseDataUri = function (text) {
    if (text.slice(0, 5) !== "data:") { return null; }
    var tmp = headerParamNoCommaEaterRegExp.exec(text.slice(5)), result = null, i = 5;
    if (tmp) {
      if (tmp[3] === ",") {
        if (tmp[2] !== undefined) { return {data: text.slice(i + tmp[0].length), name: tmp[1], value: tmp[2]}; }
        return {data: text.slice(i + tmp[0].length), type: tmp[0].replace(/[;,]$/, "")}; //.replace(/(?:^\s+|\s+$|\s*[;,]$)/g, "")};
      } else {
        if (tmp[2] !== undefined) { result = {data: null, name: tmp[1], value: tmp[2]}; }
        else { result = {data: null, type: tmp[0].replace(/[;,]$/, "")}; } //.replace(/(?:^\s+|\s+$|\s*[;,]$)/g, "")};
      }
      i += tmp[0].length;
      tmp = headerParamNoCommaEaterRegExp.exec(text.slice(i));
      while (tmp && tmp[0]) {
        if (tmp[3] === ",") {
          if (!result.params) { result.params = []; }
          result.params.push({name: tmp[1], value: tmp[2] === undefined ? null : tmp[2]});
          result.data = text.slice(i + tmp[0].length);
          return result;
        } else {
          if (!result.params) { result.params = []; }
          result.params.push({name: tmp[1], value: tmp[2] === undefined ? null : tmp[2]});
        }
        i += tmp[0].length;
        tmp = headerParamNoCommaEaterRegExp.exec(text.slice(i));
      }
    }
    return result;
  };



  ///////////////
  // Benchmark //
  ///////////////

  function benchmarkFunction(fn, ms, n) {
    /*jslint plusplus: true */
    var start = Date.now(), count = 0, i, end;
    if (ms === undefined) { ms = 5000; }
    if (n === undefined) { n = 10; }
    do {
      i = 0;
      while (i++ < n) { fn(); }
      count += n;
      end = Date.now();
    } while (start + ms >= end);
    return "count: " + count + " in " + (end - start) + "ms";
  }
  env.benchmarkFunction = benchmarkFunction;

  function benchmarkPromiseFunction(fn, ms, n) {
    return new env.Task(function* () {
      /*jslint plusplus: true */
      var start = Date.now(), count = 0, i, end;
      if (ms === undefined) { ms = 5000; }
      if (n === undefined) { n = 10; }
      do {
        i = 0;
        while (i++ < n) { yield fn(); }
        count += n;
        end = Date.now();
      } while (start + ms >= end);
      return "count: " + count + " in " + (end - start) + "ms";
    });
  }
  env.benchmarkPromiseFunction = benchmarkPromiseFunction;


  ////////////
  // Native //
  ////////////

  (function () {
    /*global setTimeout, clearTimeout, Promise, WeakMap,
             btoa, atob */
    env.WeakMapNative = typeof WeakMap === "function" ? WeakMap : null;
    env.encodeBinaryStringToBase64 = typeof btoa === "function" ? btoa.bind(null) : null;
    env.decodeBase64ToBinaryString = typeof atob === "function" ? atob.bind(null) : null;
  }());

  //////////////
  // Polyfill //
  //////////////

  //(function () {
  //  function s8() { return ("00000000" + Math.floor(Math.random() * 0x100000000).toString(16)).slice(-8); }
  //  function objectDefinePropertyPolyfill(object, propertyName, configuration) {
  //    // configuration.configurable, configuration.enumerable, configuration.writable, configuration.get, configuration.set cannot be handled
  //    object[propertyName] = configuration.value;
  //  }
  //  var id = "<[[related weak map polyfill " + s8() + s8() + s8() + s8() + "]]>", objectDefineProperty, hasOwnProperty = Object.prototype.hasOwnProperty;
  //  objectDefineProperty = typeof Object.defineProperty === "function" ? Object.defineProperty : objectDefinePropertyPolyfill;
  //  function WeakMapPolyfill() { return; }
  //  WeakMapPolyfill.prototype.constructor = WeakMapPolyfill;
  //  WeakMapPolyfill.prototype.length = 0;
  //  WeakMapPolyfill.prototype.delete = function (key) { delete key[id]; };
  //  WeakMapPolyfill.prototype.get = function (key) { return key[id]; };
  //  WeakMapPolyfill.prototype.has = function (key) { return hasOwnProperty.call(key, id); };
  //  WeakMapPolyfill.prototype.set = function (key, value) {
  //    objectDefineProperty(key, id, {
  //      enumerable: false,
  //      configurable: false,
  //      writable: true,
  //      value: value
  //    });
  //    return this;
  //  };
  //  env.WeakMapPolyfill = WeakMapPolyfill;
  //}());

  //env.WeakMap = env.WeakMapNative === null ? env.WeakMapPolyfill : env.WeakMapNative;
  //env.newWeakMap = function (iterable) { return new env.WeakMap(iterable); };

  ////////////
  // Random //
  ////////////

  function generateUuid() {
    /**
     * An Universal Unique ID generator
     *
     * @return {String} The new UUID.
     */
    function s4() {
      return ("0000" + Math.floor(
        Math.random() * 0x10000
      ).toString(16)).slice(-4);
    }
    function s8() {
      return ("00000000" + Math.floor(
        Math.random() * 0x100000000
      ).toString(16)).slice(-8);
    }
    return s8() + "-" +
      s4() + "-" +
      s4() + "-" +
      s4() + "-" +
      s8() + s4();
  }
  env.generateUuid = generateUuid;

  /////////////////////////
  // Object Manipulation //
  /////////////////////////

  function copyObjectProperties(dst, src) {
    /*jslint plusplus: true */
    var i = 0, keys = Object.keys(src), l = keys.length, k;
    while (i < l) {
      k = keys[i++];
      dst[k] = src[k];
    }
    return dst;
  }
  env.copyObjectProperties = copyObjectProperties;

  function mixObjectProperties(dst, src) {
    /*jslint plusplus: true */
    var i = 0, keys = Object.keys(src), l = keys.length, k;
    while (i < l) {
      k = keys[i++];
      if (dst[k] !== undefined) { throw new Error("mixObjectProperties: property `" + k + "` already defined"); }
    }
    i = 0;
    while (i < l) {
      k = keys[i++];
      dst[k] = src[k];
    }
    return dst;
  }
  env.mixObjectProperties = mixObjectProperties;

  function setDefaultObjectProperties(dst, src) {
    /*jslint plusplus: true */
    var i = 0, keys = Object.keys(src), l = keys.length, k;
    while (i < l) {
      k = keys[i++];
      if (dst[k] === undefined) { dst[k] = src[k]; }
    }
    return dst;
  }
  env.setDefaultObjectProperties = setDefaultObjectProperties;

  function getPropertyPath(object, path) {
    // value = getPropertyPath(object, ["feed", "items", 0, "title"])

    /*jslint plusplus: true */
    var i = 0, l = path.length;
    while (i < l) { object = object[path[i++]]; }
    return object;
  }
  env.getPropertyPath = getPropertyPath;

  function setPropertyPath(object, path, value) {
    /*jslint plusplus: true */
    var i = 0, l = path.length - 1;
    while (i < l) { object = object[path[i++]]; }
    object[path[i]] = value;
    return value;
  }
  env.setPropertyPath = setPropertyPath;

  function softGetPropertyPath(object, path) {
    try {
      return env.getPropertyPath(object, path);
    } catch (ignored) {
      return undefined;
    }
  }
  env.softGetPropertyPath = softGetPropertyPath;


  ////////////////////////
  // Array manipulation //
  ////////////////////////

  function copySliceInto(src, dst, srci, dsti, len) {
    /*jslint plusplus: true */
    while (len-- > 0) { dst[dsti++] = src[srci++]; }
  }
  env.copySliceInto = copySliceInto;

  ///////////////////////////
  // function manipulation //
  ///////////////////////////

  (function () {
    function executeFunction(f, value) {
      try {
        value = f(value);
        if (this["[[GeneratorFromFunctionsIndex]]"] === this["[[GeneratorFromFunctionsFunctions]]"].length) {
          return {"done": true, "value": value};
        }
        return {"value": value};
      } catch (e) {
        return this.throw(e);
      }
    }
    function GeneratorFromFunctions(functions) {
      this["[[GeneratorFromFunctionsFunctions]]"] = functions;
      this["[[GeneratorFromFunctionsIndex]]"] = 0;
    }
    GeneratorFromFunctions.prototype.next = function (value) {
      var i = this["[[GeneratorFromFunctionsIndex]]"], functions = this["[[GeneratorFromFunctionsFunctions]]"], f;
      while (i < functions.length) {
        f = functions[i];
        if (typeof f === "function") {
          this["[[GeneratorFromFunctionsIndex]]"] = i + 1;
          return executeFunction.call(this, f, value);
        }
        if (f && typeof f[0] === "function") {
          this["[[GeneratorFromFunctionsIndex]]"] = i + 1;
          return executeFunction.call(this, f[0], value);
        }
        i += 1;
      }
      this["[[GeneratorFromFunctionsIndex]]"] = i;
      return {"done": true, "value": value};
    };
    GeneratorFromFunctions.prototype.throw = function (reason) {
      var i = this["[[GeneratorFromFunctionsIndex]]"], functions = this["[[GeneratorFromFunctionsFunctions]]"], f;
      while (i < functions.length) {
        f = functions[i];
        if (f && typeof f[1] === "function") {
          this["[[GeneratorFromFunctionsIndex]]"] = i + 1;
          return executeFunction.call(this, f[1], reason);
        }
        i += 1;
      }
      this["[[GeneratorFromFunctionsIndex]]"] = i;
      throw reason;
    };
    env.GeneratorFromFunctions = GeneratorFromFunctions;
    env.newGeneratorFromFunctions = function () { var c = env.GeneratorFromFunctions, o = Object.create(c.prototype); c.apply(o, arguments); return o; };
  }());

  function makeGeneratorFunctionFromFunctions(functions) {
    /**
     *     makeGeneratorFunctionFromFunctions(functions): GeneratorFunction
     *
     * Convert a sequence of function to a kind of generator function.
     * This function works with old ECMAScript version.
     *
     *     var config;
     *     return task(makeGeneratorFunctionFromFunctions([function () {
     *       return getConfig();
     *     }, function (_config) {
     *       config = _config;
     *       config.enableSomething = true;
     *       return sleep(1000);
     *     }, function () {
     *       return putConfig(config);
     *     }, [null, function (e) {
     *       console.error(e);
     *     }]]));
     *
     * @param  {Array} functions An array of function.
     * @return {GeneratorFunction} A new GeneratorFunction
     */
    return env.newGeneratorFromFunctions.bind(env, functions);
  }
  env.makeGeneratorFunctionFromFunctions = makeGeneratorFunctionFromFunctions;

  //////////////////////////////
  // Constructor manipulation //
  //////////////////////////////

  env.new = function (Constructor) {
    // env.newPromise = env.new.bind(null, Promise)

    // API stability level: 2 - Stable

    /*jslint plusplus: true */
    var l = arguments.length - 1, i = 0, args = new Array(l);
    while (i < l) { args[i] = arguments[++i]; }
    i = Object.create(Constructor.prototype);
    Constructor.apply(i, args);
    return i;
  };

  function staticMethodNew() {
    // API stability level: 2 - Stable
    var o = Object.create(this);
    this.apply(o, arguments);
    return o;
  }
  env.staticMethodNew = staticMethodNew;

  /////////////////////
  // Type converters //
  /////////////////////

  function readBlobAsArrayBufferTask(blob) {
    /*global FileReader */
    var d = env.newDeferred(), fr = new FileReader();
    fr.onload = function (ev) { return d.resolve(ev.target.result); };
    fr.onerror = function () { return d.reject(new Error("unable to read blob as arraybuffer")); };
    fr.onabort = function () { return d.reject(new Error("cancelled")); };
    d.promise.cancel = function () { fr.abort(); };
    fr.readAsArrayBuffer(blob);
    return d.promise;
  }
  env.readBlobAsArrayBuffer = readBlobAsArrayBufferTask;

  function readBlobAsTextTask(blob) {
    /*global FileReader */
    var d = env.newDeferred(), fr = new FileReader();
    fr.onload = function (ev) { return d.resolve(ev.target.result); };
    fr.onerror = function () { return d.reject(new Error("unable to read blob as text")); };
    fr.onabort = function () { return d.reject(new Error("cancelled")); };
    d.promise.cancel = function () { fr.abort(); };
    fr.readAsText(blob);
    return d.promise;
  }
  env.readBlobAsText = readBlobAsTextTask;

  function readBlobAsDataUriTask(blob) {
    /*global FileReader */
    var d = env.newDeferred(), fr = new FileReader();
    fr.onload = function (ev) { return d.resolve(ev.target.result); };
    fr.onerror = function () { return d.reject(new Error("unable to read blob as text")); };
    fr.onabort = function () { return d.reject(new Error("cancelled")); };
    d.promise.cancel = function () { fr.abort(); };
    fr.readAsDataURL(blob);
    return d.promise;
  }
  env.readBlobAsDataUri = readBlobAsDataUriTask;


  ////////////////////////
  // Parsers and eaters //
  ////////////////////////

  function eatMimeType(text) {
    // see https://tools.ietf.org/html/rfc2045#section-5.1
    //   mimetype := type "/" subtype
    //     type /[a-z]+/
    //     subtype /[a-zA-Z_\-\.\+]+/

    // API stability level: 2 - Stable
    var res = (/^([a-z]+)\/([a-zA-Z_\-\.\+]+)/).exec(text);
    if (res) {
      return {
        index: 0,
        input: text,
        match: res[0],
        type: res[1],
        subtype: res[2]
      };
    }
    return null;
  }
  env.eatMimeType = eatMimeType;

  function eatContentTypeParameter(text) {
    // see https://tools.ietf.org/html/rfc2045#section-5.1
    // here, it is not the strict rfc, this one handles the content type of `data: text/plain  ;=; charset = utf-8 ;base64,AAA=`
    // NB: should never return null
    //   content-type-parameter := attribute "=" value -> here, it's more: attribute ?("=" ?value)
    //     attribute := token
    //     value := token / quoted-string
    //       token /[a-zA-Z0-9!#\$%&'\*\+\-\.\^_`\{\|\}~]+/  // US-ASCII CHARS except ()<>@,;:\"/[]?=
    //       quoted-string /"(?:[^\\"]|\\[^])*"/ -> for jslint, [^] is not accepted, we can use [\s\S] (following RFC it should be [\x00-\x7F])

    // API stability level: 2 - Stable

    /*jslint regexp: true */
    var res = (/^([a-zA-Z0-9!#\$%&'\*\+\-\.\^_`\{\|\}~]*)(?:\s*=\s*([a-zA-Z0-9!#\$%&'\*\+\-\.\^_`\{\|\}~]*|"(?:[^\\"]|\\[\s\S])*"))?/).exec(text);
    //if (res) {
    return {
      index: 0,
      input: text,
      match: res[0],
      attribute: res[1],
      value: res[2] === undefined ? null : (res[2][0] === "\"" ? res[2].slice(1, -1).replace(/\\([\s\S])/g, "$1") : res[2])
    };
    //}
    //return null;
  }
  env.eatContentTypeParameter = eatContentTypeParameter;

  function eatContentType(text) {
    // Returns an object containing all content-type information
    // Ex:
    // {
    //   input: "text/plain;charset=utf-8;base64,ABCDEFGH", // is the actual `contentType` parameter
    //   match: "text/plain;charset=utf-8;base64", // is what the parser matched
    //   mimetype: "text/plain", // is the mimetype
    //   params: { // is the content type parameters
    //     charset: "utf-8",
    //     base64: null
    //   }
    // }
    // NB: should never return null
    // see https://tools.ietf.org/html/rfc2045#section-5.1
    //   content-type := mimetype content-type-parameters
    //     content-type-parameters := / content-type-parameter content-type-parameters

    // API stability level: 2 - Stable

    /*jslint ass: true */
    // mimetype
    var res = env.eatMimeType(text), tmp, whitespaceMatch;
    if (res === null) {
      res = {input: text, match: ""};
    } else {
      text = text.slice(res.match.length);
      res.mimetype = res.match;
    }
    res.params = {};
    // whitespaces
    tmp = (/^\s*/).exec(text);
    text = text.slice(tmp[0].length);
    res.match += tmp[0];
    while (true) {  // XXX while (true) is not optimizable
      // semicolon whitespaces
      if ((tmp = (/^(?:;\s*)+/).exec(text)) === null) { break; }
      text = text.slice(tmp[0].length);
      whitespaceMatch = tmp[0];
      // content-type-parameter
      if ((tmp = env.eatContentTypeParameter(text)) === null) { break; }
      text = text.slice(tmp.match.length);
      res.match += whitespaceMatch + tmp.match;
      res.params[tmp.attribute] = tmp.value;
      // whitespaces
      tmp = (/^\s*/).exec(text);
      text = text.slice(tmp[0].length);
      res.match += tmp[0];
    }
    return res;
  }
  env.eatContentType = eatContentType;

  //////////////
  // Encoders //
  //////////////

  function encodeArrayBufferToHexadecimal(arrayBuffer) {
    /*jslint bitwise: true */
    function bit4tohexchar(b) {
      //if (b > 0x9) { return b + 55; }  // upper case
      if (b > 0x9) { return b + 87; }  // lower case
      return b + 48;
    }
    /*global Uint8Array */
    arrayBuffer = new Uint8Array(arrayBuffer);
    var r = new Uint8Array(arrayBuffer.length * 2), c, i, j = 0;
    for (i = 0; i < arrayBuffer.length; i += 1) {
      c = arrayBuffer[i];
      if (c > 0xF) {
        r[j] = bit4tohexchar(c >> 4);
      } else {
        r[j] = 48;
      }
      r[j + 1] = bit4tohexchar(c & 0xF);
      j += 2;
    }
    return String.fromCharCode.apply(String, r);
  }
  env.encodeArrayBufferToHexadecimal = encodeArrayBufferToHexadecimal;

  function encodeBinaryStringToHexadecimal(binaryString) {
    // This method acts like `btoa` but returns a hexadecimal encoded string

    /*jslint bitwise: true */
    function bit4tohexchar(b) {
      //if (b > 0x9) { return b + 55; }  // upper case
      if (b > 0x9) { return b + 87; }  // lower case
      return b + 48;
    }
    /*global Uint8Array */
    var r = new Uint8Array(binaryString.length * 2), c, i, j = 0;
    for (i = 0; i < binaryString.length; i += 1) {
      c = binaryString.charCodeAt(i);
      if (c > 0xFF) {
        c = new Error("String contains an invalid character");
        c.name = "InvalidCharacterError";
        throw c;
      }
      if (c > 0xF) {
        r[j] = bit4tohexchar(c >> 4);
      } else {
        r[j] = 48;
      }
      r[j + 1] = bit4tohexchar(c & 0xF);
      j += 2;
    }
    return String.fromCharCode.apply(String, r);
  }
  env.encodeBinaryStringToHexadecimal = encodeBinaryStringToHexadecimal;

  function decodeHexadecimalToArrayBuffer(text) {
    /*global Uint8Array */
    var r, i, c;
    text = text.replace(/\s/g, "");
    if (text.length % 2) {
      text += "0";
      r = new Uint8Array((text.length / 2) + 1);
    } else {
      r = new Uint8Array(text.length / 2);
    }
    for (i = 0; i < text.length; i += 2) {
      c = (parseInt(text[i], 16) * 0x10) + parseInt(text[i + 1], 16);
      if (isNaN(c)) {
        c = new Error("String contains an invalid character");
        c.name = "InvalidCharacterError";
        c.code = 5;
        throw c;
      }
      r[i / 2] = c;
    }
    return r.buffer;
  }
  env.decodeHexadecimalToArrayBuffer = decodeHexadecimalToArrayBuffer;

  function decodeHexadecimalToBinaryString(text) {
    // This method acts like `atob` but parses a hexadecimal encoded string

    /*global Uint8Array */
    return String.fromCharCode.apply(String, new Uint8Array(env.decodeHexadecimalToArrayBuffer(text)));
  }
  env.decodeHexadecimalToBinaryString = decodeHexadecimalToBinaryString;

  function encodeBinaryStringToBase64Polyfill(binaryString) {
    /*jslint bitwise: true */
    var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", i = 0, l = binaryString.length, m = l % 3, lm = l - m, res = "", a, b, c;
    for (i = 0; i < lm; i += 3) {
      a = binaryString.charCodeAt(i);
      b = binaryString.charCodeAt(i + 1);
      c = binaryString.charCodeAt(i + 2);
      if (a > 0xFF || b > 0xFF || c > 0xFF) {
        a = new Error("String contains an invalid character");
        a.name = "InvalidCharacterError";
        throw a;
      }
      res += chars[(a >>> 2) & 0x3F] +
        chars[((a << 4) & 0x30) | ((b >>> 4) & 0xF)] +
        chars[((b << 2) & 0x3C) | ((c >>> 6) & 0x3)] +
        chars[(c & 0x3F)];
    }
    if (m === 2) {
      a = binaryString.charCodeAt(i);
      b = binaryString.charCodeAt(i + 1);
      if (a > 0xFF || b > 0xFF) {
        a = new Error("String contains an invalid character");
        a.name = "InvalidCharacterError";
        throw a;
      }
      res += chars[(a >>> 2) & 0x3F] +
        chars[((a << 4) & 0x30) | ((b >>> 4) & 0xF)] +
        chars[((b << 2) & 0x3C)] + "=";
    } else if (m === 1) {
      a = binaryString.charCodeAt(i);
      if (a > 0xFF) {
        a = new Error("String contains an invalid character");
        a.name = "InvalidCharacterError";
        throw a;
      }
      res += chars[(a >>> 2) & 0x3F] + chars[((a << 4) & 0x30)] + "==";
    }
    return res;
  }
  env.encodeBinaryStringToBase64Polyfill = encodeBinaryStringToBase64Polyfill;
  if (env.encodeBinaryStringToBase64 === null) { env.encodeBinaryStringToBase64 = env.encodeBinaryStringToBase64Polyfill; }

  function decodeBase64ToBinaryStringPolyfill(base64) {
    /*jslint bitwise: true, continue: true */
    // 43=62,47=63,48-57=x+4,65-90=x-65,97-122=x-71
    function charCodeToByte(chr) {
      if (chr >= 65 && chr <= 90) { return chr - 65; }
      if (chr >= 97 && chr <= 122) { return chr - 71; }
      if (chr >= 48 && chr <= 57) { return chr + 4; }
      if (chr === 43) { return 62; }
      if (chr === 47) { return 63; }
      var e = new Error("Failed to execute 'decodeBase64ToBinaryStringPolyfill': The string to be decoded is not correctly encoded.");
      e.name = "InvalidCharacterError";
      throw e;
    }
    var l = base64.length, res = "", chr, a, b, i;
    for (i = 0; i < l; i += 4) {
      // char1
      chr = base64.charCodeAt(i);
      b = charCodeToByte(chr) << 2;
      // char2
      chr = base64.charCodeAt(i + 1);
      a = charCodeToByte(chr);
      b |= a >>> 4;
      res += String.fromCharCode(b);
      // char3
      chr = base64.charCodeAt(i + 2);
      if (chr === undefined) { continue; }
      if (chr === 61) {
        if (base64.charCodeAt(i + 3) === 61) { continue; }
        throw charCodeToByte(null);
      }
      b = (a << 4) & 0xFF;
      a = charCodeToByte(chr);
      res += String.fromCharCode(b | (a >>> 2));
      // char4
      chr = base64.charCodeAt(i + 3);
      if (chr === 61) { continue; }
      res += String.fromCharCode(((a << 6) & 0xFF) | charCodeToByte(chr));
    }
    return res;
  }
  env.decodeBase64ToBinaryStringPolyfill = decodeBase64ToBinaryStringPolyfill;
  if (env.decodeBase64ToBinaryString === null) { env.decodeBase64ToBinaryString = env.decodeBase64ToBinaryStringPolyfill; }

  function encodeBlobToBase64TaskPolyfill(blob) {
    /*global Uint8Array */
    return env.Task.sequence([
      function () { return env.readBlobAsArrayBuffer(blob); },
      function (ab) { return env.encodeBinaryStringToBase64(String.fromCharCode.apply(null, new Uint8Array(ab))); }
    ]);
  }
  env.encodeBlobToBase64Polyfill = encodeBlobToBase64TaskPolyfill;
  env.encodeBlobToBase64 = encodeBlobToBase64TaskPolyfill;

  function encodeBlobToBase64TaskNative(blob) {
    var d = env.newDeferred(), fr = new FileReader();
    fr.onload = function (ev) { return d.resolve(ev.target.result.slice(37)); };
    fr.onerror = function () { return d.reject(new Error("Unable to read blob as data url")); };
    fr.onabort = function () { return d.reject(new Error("Cancelled")); };
    d.promise.cancel = function () { fr.abort(); };
    fr.readAsDataURL(new Blob([blob], {"type": "application/octet-stream"}));
    return d.promise;
  }

  encodeBlobToBase64TaskNative(new Blob(["hello"], {"type": "text/plain;charset=ascii"})).then(function (text) {
    /*global console */
    if (text === "aGVsbG8=") {
      if (env.encodeBlobToBase64Native === undefined) { env.encodeBlobToBase64Native = encodeBlobToBase64TaskNative; }
      if (env.encodeBlobToBase64 === encodeBlobToBase64TaskPolyfill) { env.encodeBlobToBase64 = encodeBlobToBase64TaskNative; }
      return;
    }
    console.warn("env: encodeBlobToBase64Task cannot be encodeBlobToBase64TaskNative -> aGVsbG8= != " + text);
  });

  //////////////////////
  // Bit manipulators //
  //////////////////////

  function leftRotateInt32Bits(num, cnt) {
    /*jslint bitwise: true */
    return (num << cnt) | (num >>> (32 - cnt));
  }
  env.leftRotateInt32Bits = leftRotateInt32Bits;

  /////////////
  // Hashers //
  /////////////

  function md5sumArrayBuffer(message) {
    // @param  {ArrayBuffer} message
    // @return {ArrayBuffer} hash

    // Info: Uint32Array endianness is always little-endian in javascript
    // API stability level: 2 - Stable

    /*global Uint8Array, Uint32Array */
    var mod, padding2,
      leftrotate = env.leftRotateInt32Bits,
      memcpy = env.copySliceInto,
      hash = new Uint32Array(4),
      padding = new Uint8Array(64),
      M = new Uint32Array(16),
      bl = message.byteLength,
      s = [
        7, 12, 17, 22,  7, 12, 17, 22,  7, 12, 17, 22,  7, 12, 17, 22,
        5,  9, 14, 20,  5,  9, 14, 20,  5,  9, 14, 20,  5,  9, 14, 20,
        4, 11, 16, 23,  4, 11, 16, 23,  4, 11, 16, 23,  4, 11, 16, 23,
        6, 10, 15, 21,  6, 10, 15, 21,  6, 10, 15, 21,  6, 10, 15, 21
      ],
      K = [
        0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee,
        0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
        0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be,
        0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
        0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa,
        0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
        0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed,
        0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
        0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c,
        0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
        0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05,
        0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
        0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039,
        0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
        0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1,
        0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391
      ];
    memcpy([0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476], hash, 0, 0, 4);
    message = new Uint8Array(message);

    padding = new Uint32Array(padding.buffer);
    padding[14] = bl * 8;
    padding[15] = bl * 8 / 0x100000000;
    padding = new Uint8Array(padding.buffer);

    mod = bl % 64;
    if (mod) {
      bl -= mod;
      if (mod > 56) {
        padding2 = new Uint8Array(64);
        memcpy(message, padding2, bl, 0, mod);
        padding2[mod] = 0x80;
      } else {
        memcpy(message, padding, bl, 0, mod);
        padding[mod] = 0x80;
      }
    } else {
      padding[0] = 0x80;
    }
    function blk(A, i, hash) {
      /*jslint bitwise: true */
      var a = hash[0], b = hash[1], c = hash[2], d =  hash[3], f = 0, g = 0, tmp = 0;
      M[0] = A[i] + A[i + 1] * 0x100 + A[i + 2] * 0x10000 + A[i + 3] * 0x1000000;
      i += 4;
      while (i % 64) {
        M[(i % 64) / 4] = A[i] + A[i + 1] * 0x100 + A[i + 2] * 0x10000 + A[i + 3] * 0x1000000;
        i += 4;
      }
      i = 0;
      while (i < 64) {
        if (i < 16) {
          f = (b & c) | ((~b) & d);
          g = i;
        } else if (i < 32) {
          f = (d & b) | ((~d) & c);
          g = (5 * i + 1) % 16;
        } else if (i < 48) {
          f = b ^ c ^ d;
          g = (3 * i + 5) % 16;
        } else {
          f = c ^ (b | (~d));
          g = (7 * i) % 16;
        }
        tmp = d;
        d = c;
        c = b;
        b = b + leftrotate((a + f + K[i] + M[g]), s[i]);
        a = tmp;
        i += 1;
      }
      hash[0] = hash[0] + a;
      hash[1] = hash[1] + b;
      hash[2] = hash[2] + c;
      hash[3] = hash[3] + d;
    }
    mod = 0;
    while (mod < bl) {
      blk(message, mod, hash);
      mod += 64;
    }
    if (padding2) { blk(padding2, 0, hash); }
    blk(padding, 0, hash);
    return hash.buffer;
  }
  env.md5sumArrayBuffer = md5sumArrayBuffer;

  //if ((tmp = ab2hex(env.md5sumArrayBuffer(bs2ab("The quick brown fox jumps over the lazy dog")))) !== "9e107d9d372bb6826bd81d3542a419d6") { alert(tmp); }
  //if ((tmp = ab2hex(env.md5sumArrayBuffer(bs2ab("The quick brown fox jumps over the lazy dog.")))) !== "e4d909c290d0fb1ca068ffaddf22cbd0") { alert(tmp); }
  //if ((tmp = ab2hex(env.md5sumArrayBuffer(bs2ab("The quick brown fox jumps over the lazy black and white dog.")))) !== "a62edd3f024b98a4f6fce7afb7f066eb") { alert(tmp); }
  //if ((tmp = ab2hex(env.md5sumArrayBuffer(bs2ab("")))) !== "d41d8cd98f00b204e9800998ecf8427e") { alert(tmp); }

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

}(this.env));
