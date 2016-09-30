/*jslint indent: 2 */
(function envUnicode(env) {
  "use strict";

  /*! env.unicode.js Version 1.0.0

      Copyright (c) 2015-2016 Tristan Cavelier <t.cavelier@free.fr>
      This program is free software. It comes without any warranty, to
      the extent permitted by applicable law. You can redistribute it
      and/or modify it under the terms of the Do What The Fuck You Want
      To Public License, Version 2, as published by Sam Hocevar. See
      http://www.wtfpl.net/ for more details. */

  // provides: env.encodeCodePointToString,
  //           env.encodeCodePointsToUtf16,
  //           env.encodeUtf16ToUtf8,
  //           env.encodeStringToUtf8Bytes,
  //           env.strictEncodeStringToUtf8Bytes,
  //           env.decodeUtf8,
  //           env.decodeUtf8BytesToString,
  //           env.strictDecodeUtf8BytesToString

  env.registerLib(envUnicode);

  // https://en.wikipedia.org/wiki/UTF-8
  // http://stackoverflow.com/questions/13235091/extract-the-first-letter-of-a-utf-8-string-with-lua#13238257
  // http://stackoverflow.com/questions/23502153/utf-8-encoding-algorithm-vs-utf-16-algorithm#23502707

  if (typeof String.fromCodePoint === "function") env.encodeCodePointToString = String.fromCodePoint;
  else env.encodeCodePointToString = function () {
    var i = 0, l = arguments.length, code, codes = [];
    for (; i < l; i += 1) {
      code = arguments[i];
      if (code <= 0xD7FF || (0xE000 <= code && code <= 0xFFFF)) codes.push(code);
      else if (0xD800 <= code && code <= 0xDFFF) codes.push(0xFFFD);
      else if (0x10FFFF < code) throw new Error("Invalid code point " + code);
      else {
        // surrogate pair
        code -= 0x10000;
        codes.push(0xD800 + ((code >>> 10) & 0x3FF), 0xDC00 + (code & 0x3FF));
      }
    }
    return String.fromCharCode.apply(String, codes);
  };

  env.encodeCodePointsToUtf16 = function (params) {
    // params.read(index) (optional) function that returns a code point
    //   (uint32), `index` is the current position to read,
    //   it never reads the same index twice. If `read` is not set,
    //   `params` is considered as an array of code point (uint32).
    // params.write(bytes...) (optional) function use to push
    //   utf16 uint16, if `write` is not set, the main function
    //   returns an array of uint16.
    // params.error(message, index, code) (optional) function use on
    //   error during encoding.

    // Ex: var a = new Uint16Array(env.encodeCodePointsToUtf16([0xe9, ...]));
    // Ex: var s = String.fromCodePoint.apply(String, env.encodeCodePointsToUtf16([0xe9, ...]));

    var n, code, codes,
        read = params.read, write = params.write, error = params.error;
    function defaultread(i) { return params[i]; }
    function errorthrow(message) { throw new Error(message); }
    if (read === undefined) read = defaultread;
    if (write === undefined) write = (codes = []).push.bind(codes);
    if (error === undefined) error = errorthrow;

    for (n = 0; (code = read(n)) >= 0; n += 1) {
      if (code <= 0xD7FF || (0xE000 <= code && code <= 0xFFFF)) write(code);
      else if (0xD800 <= code && code <= 0xDFFF) write(0xFFFD);  // XXX is this an error ?
      else if (0x10FFFF < code) error("invalid code point", n, code);
      else {
        // surrogate pair
        code -= 0x10000;
        write(0xD800 + ((code >>> 10) & 0x3FF), 0xDC00 + (code & 0x3FF));
      }
    }
    return codes;
  };

  env.encodeUtf16ToUtf8 = function (params) {
    // params.read(index) (optional) function that returns an uint16,
    //   `index` is the current position to read,
    //   it never reads the same index twice. If `read` is not set,
    //   `params` is considered as an array of uint16.
    // params.write(bytes...) (optional) function use to push
    //   utf8 uint8, if `write` is not set, the main function
    //   returns an array of uint8.
    // params.error(message, index) (optional) function use on error
    //   during encoding.

    var n, c, c2, cached, bytes,
        read = params.read, write = params.write, error = params.error;
    function defaultread(i) { return params[i]; }
    function errorwrite() { write(0xef, 0xbf, 0xbd); }
    if (read === undefined) read = defaultread;
    if (write === undefined) write = (bytes = []).push.bind(bytes);
    if (error === undefined) error = errorwrite;

    for (n = 0; (c = cached ? (cached = false) || c2 : read(n)) >= 0; n += 1) {
      if (c <= 0x7F) write(c);
      else if (c <= 0x7FF) write((c >> 6) | 0xc0, (c & 0x3f) | 0x80);
      else if (0xd800 <= c && c <= 0xdbff) {
        c2 = read(n + 1);
        cached = true;
        if (!(c2 >= 0)) { error("incomplete surrogate pair", n); break; }
        if (c2 < 0xdc00 || c2 > 0xdfff) error("invalid surrogate pair", n);
        else {
          c = ((c - 0xd800) << 10) + (c2 - 0xdc00) + 0x10000;
          write(
            (c >> 18) | 0xf0,
            ((c >> 12) & 0x3f) | 0x80,
            ((c >> 6) & 0x3f) | 0x80,
            (c & 0x3f) | 0x80
          );
          n += 1;
          cached = false;
        }
      } else if (0xdc00 <= c && c <= 0xdfff) error("invalid code", n);
      else
        write(
          (c >> 12) | 0xe0,
          ((c >> 6) & 0x3f) | 0x80,
          (c & 0x3f) | 0x80
        );
    }
    return bytes;
  };
  env.encodeStringToUtf8Bytes = function (text) {
    return env.encodeUtf16ToUtf8({read: text.charCodeAt.bind(text)});
  };
  env.strictEncodeStringToUtf8Bytes = function (text) {
    return env.encodeUtf16ToUtf8({read: text.charCodeAt.bind(text), error: function (reason, index) {
      var e = new Error(reason);
      e.index = index;
      throw e;
    }});
  };


  env.decodeUtf8 = function (params) {
    // params.read(index) function that returns an uint8,
    //   `index` is the current position to read,
    //   it never reads the same index twice. If `read` is not set,
    //   `params` is considered as an array of byte.
    // params.write(codepoints...) (optional) function use to push
    //   code points (uint32), if `write` is not set, the main function
    //   returns an array of code points.
    // params.error(message, index) (optional) function use on
    //   error during encoding.

    // XXX http://www.unicode.org/faq/utf_bom.html
    var n = 0, ci, code, codes, cache = [],
        read = params.read, write = params.write, error = params.error;
    function defaultread(i) { return params[i]; }
    function errorwrite() { write(65533); }
    if (read === undefined) read = defaultread;
    if (write === undefined) write = (codes = []).push.bind(codes);
    if (error === undefined) error = errorwrite;

    for (; (code = cache.length ? cache.shift() : read(n)) >= 0; n += 1) {
      if (code <= 0x7F)
        write(code);
      else if ((0xE0 & code) === 0xC0) {
        if (code < 0xC2) error("invalid start byte", n);
        else if (!((ci = cache.length ? cache[0] : (cache[0] = read(n + 1))) >= 0)) error("unexpected end of data", n);
        else if ((code = ((0xC0 & ci) === 0x80 ? (code << 6) | (ci & 0x3F) : null)) === null) error("invalid continuation byte", n);
        else { write(code & 0x7FF); n += 1; cache.shift(); }
      } else if ((0xF0 & code) === 0xE0) {
        if (!((ci = cache.length ? cache[0] : (cache[0] = read(n + 1))) >= 0)) error("unexpected end of data", n);
        else if ((code = ((0xC0 & ci) === 0x80 ? (code << 6) | (ci & 0x3F) : null)) === null) error("invalid continuation byte", n);
        else if (!((ci = cache.length > 1 ? cache[1] : (cache[1] = read(n + 2))) >= 0)) error("unexpected end of data", n);
        else if ((code = ((0xC0 & ci) === 0x80 ? (code << 6) | (ci & 0x3F) : null)) === null) error("invalid continuation byte", n);
        else { write(code & 0xFFFF); n += 2; cache.splice(0, 2); }
      } else if ((0xF8 & code) === 0xF0) {
        if (code >= 0xF5) error("invalid start byte", n);
        else if (!((ci = cache.length ? cache[0] : (cache[0] = read(n + 1))) >= 0)) error("unexpected end of data", n);
        else if ((code = ((0xC0 & ci) === 0x80 ? (code << 6) | (ci & 0x3F) : null)) === null) error("invalid continuation byte", n);
        else if (!((ci = cache.length > 1 ? cache[1] : (cache[1] = read(n + 2))) >= 0)) error("unexpected end of data", n);
        else if ((code = ((0xC0 & ci) === 0x80 ? (code << 6) | (ci & 0x3F) : null)) === null) error("invalid continuation byte", n);
        else if (!((ci = cache.length > 2 ? cache[2] : (cache[2] = read(n + 3))) >= 0)) error("unexpected end of data", n);
        else if ((code = ((0xC0 & ci) === 0x80 ? (code << 6) | (ci & 0x3F) : null)) === null) error("invalid continuation byte", n);
        else { write(code & 0x1FFFFF); n += 3; cache.splice(0, 3); }
      } else error("invalid start byte", n);
    }
    return codes;
  };
  env.decodeUtf8BytesToString = function (bytes) {
    return env.encodeCodePointToString.apply(env, env.decodeUtf8({read: function (i) { return bytes[i]; }}));
  };
  env.strictDecodeUtf8BytesToString = function (bytes) {
    return env.encodeCodePointToString.apply(env, env.decodeUtf8({read: function (i) {
      return bytes[i];
    }, error: function (message, index) {
      var e = new Error(message);
      e.index = index;
      throw e;
    }}));
  };

}(this.env));
