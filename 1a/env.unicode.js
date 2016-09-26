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

  // provides: env.unicodeToText,
  //           env.softDecodeUtf8BytesToText,
  //           env.encodeTextToUtf8Bytes,
  //           env.softEncodeTextToUtf8Bytes

  env.registerLib(envUnicode);

  // http://stackoverflow.com/questions/23502153/utf-8-encoding-algorithm-vs-utf-16-algorithm#23502707
  if (typeof String.fromCodePoint === "function") env.unicodeToText = String.fromCodePoint;
  else env.unicodeToText = function () {
    var i = 0, l = arguments.length, code, codes = [];
    for (; i < l; i += 1) {
      code = arguments[i];
      if (((code >= 0x0000) && (code <= 0xD7FF)) || ((code >= 0xE000) && (code <= 0xFFFF)))
        codes.push(code);
      else if ((code >= 0xD800) && (code <= 0xDFFF))
        codes.push(0xFFFD);
      else {
        // surrogate pair
        code -= 0x010000;
        codes.push(0xD800 + ((code >>> 10) & 0x3FF), 0xDC00 + (code & 0x3FF));
      }
    }
    return String.fromCharCode.apply(String, codes);
  };

  // https://en.wikipedia.org/wiki/UTF-8
  // http://stackoverflow.com/questions/13235091/extract-the-first-letter-of-a-utf-8-string-with-lua#13238257
  env.softDecodeUtf8BytesToText = function (ba) {
    // XXX http://www.unicode.org/faq/utf_bom.html
    var bai = 0, bal = ba.length,
        ci, cl, count,
        code, codes = [];
    while (bai < bal) {
      code = ba[bai];
      if (0x00 <= code && code <= 0x7F || 0xC2 <= code && code <= 0xF4) {
        for (count = 1, ci = bai + 1, cl = bai + 4; ci < cl && ci < bal; ci += 1)
          if (0x80 <= ba[ci] && ba[ci] <= 0xBF) {
            count += 1;
            code = (code << 6) | (ba[ci] & 0x3F);
          }
        switch (count) {
          case 1: codes.push(code); bai += 1; break;
          case 2: codes.push(code & 0x7FF); bai += 2; break;
          case 3: codes.push(code & 0xFFFF); bai += 3; break;
          case 4: codes.push(code & 0x1FFFFF); bai += 4; break;
          default: throw new Error("should not happen");
        }
      } else {
        bai += 1;
        codes.push(code);
      }
    }
    return env.unicodeToText.apply(env, codes);
  };

  env.encodeTextToUtf8Bytes = function (s) {
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

  env.softEncodeTextToUtf8Bytes = function (s) {
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

}(this.env));
