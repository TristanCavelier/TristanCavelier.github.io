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

  // provides:
  //   env.encodeCodePointToString,
  //
  //   env.codePointsToUtf16EncoderAlgorithm,
  //   env.encodeCodePointsToUtf16,
  //
  //   env.utf16ToUtf8EncoderAlgorithm,
  //   env.encodeUtf16ToUtf8,
  //   env.encodeStringToUtf8Bytes,
  //
  //   env.utf8DecoderAlgorithm,
  //   env.decodeUtf8,
  //   env.decodeUtf8BytesToString

  if (env.registerLib) env.registerLib(envUnicode);

  // https://en.wikipedia.org/wiki/UTF-8
  // https://en.wikipedia.org/wiki/UTF-16
  // http://stackoverflow.com/questions/13235091/extract-the-first-letter-of-a-utf-8-string-with-lua#13238257
  // http://stackoverflow.com/questions/23502153/utf-8-encoding-algorithm-vs-utf-16-algorithm#23502707
  // http://www.unicode.org/faq/utf_bom.html

  if (typeof String.fromCodePoint === "function") env.encodeCodePointToString = String.fromCodePoint;
  else env.encodeCodePointToString = function () {
    var i = 0, l = arguments.length, code, codes = [];
    for (; i < l; i += 1) {
      code = arguments[i];
      //if (0xD800 <= code && code <= 0xDFFF) codes.push(0xFFFD); else
      if (code <= 0xFFFF) codes.push(code);
      else if (code <= 0x10FFFF) {  // surrogate pair
        code -= 0x10000;
        codes.push(0xD800 + ((code >>> 10) & 0x3FF), 0xDC00 + (code & 0x3FF));
      } else throw new Error("Invalid code point " + code);
    }
    return String.fromCharCode.apply(String, codes);
  };

  env.codePointsToUtf16EncoderAlgorithm = function (o) {
    // o.get(index) - called to get the next code point to encode.
    //     `index` is a counter that increments every time `get` is called.
    //     If `get` returns < 0, NaN, null or undefined the algo stops.
    // o.write(codes) - called to push the encoded uint16
    //     `codes` is an array of uint16.
    // o.reservedCodePointError({index}) - called if > U+D800 & < U+DFFF
    // o.invalidCodePointError({index}) - called if > U+10FFFF

    var n, code;
    for (n = 0; (code = o.get(n)) >= 0; n += 1) {
      if (code <= 0xD7FF) o.write([code]);
      else if (code <= 0xDFFF) o.reservedCodePointError({index: n});
      else if (code <= 0xFFFF) o.write([code]);
      else if (code <= 0x10FFFF) {  // surrogate pair
        code -= 0x10000;
        o.write([0xD800 + ((code >>> 10) & 0x3FF), 0xDC00 + (code & 0x3FF)]);
      } else o.invalidCodePointError({index: n});
    }
  };
  env.encodeCodePointsToUtf16 = function (codePoints) {
    var r = [];
    env.codePointsToUtf16EncoderAlgorithm({
      get: function (i) { return codePoints[i]; },
      write: r.push.apply.bind(r.push, r),
      invalidCodePointError: function () { r.push(0xFFFD); },  // force encoding to work
      reservedCodePointError: function (o) { r.push(codePoints[o.index]); }  // accept reserved code points (like in chrome).
    });
    return r;
  };

  env.utf16ToUtf8EncoderAlgorithm = function (o) {
    // o.get(index) - called to get the next uint16 to encode.
    //     `index` is a counter that increments every time `get` is called.
    //     If `get` returns < 0, NaN, null or undefined the algo stops.
    // o.write(codes) - called to push the encoded uint8
    //     `codes` is an array of uint8.
    // XXX use o.cache = []
    // o.invalidStartCodeError({index}) - called on invalid surrogate start
    // o.unexpectedEndOfDataError({index, from, to}) - called on incomplete surrogate pair
    // o.invalidContinuationCodeError({index, from, to}) - called on invalid surrogate pair

    var n, c, c2, cached;
    for (n = 0; (c = cached ? (cached = false) || c2 : o.get(n)) >= 0; n += 1) {
      if (c <= 0x7F) o.write([c]);
      else if (c <= 0x7FF) o.write([(c >> 6) | 0xc0, (c & 0x3f) | 0x80]);
      else if (0xd800 <= c && c <= 0xdbff) {
        c2 = o.get(n + 1);
        cached = true;
        // break; is not necessary in this algorithm
        if (!(c2 >= 0)) { o.unexpectedEndOfDataError({index: n + 1, from: n, to: n + 2}); break; }
        else if (0xdc00 <= c2 && c2 <= 0xdfff) {
          c = ((c - 0xd800) << 10) + (c2 - 0xdc00) + 0x10000;
          o.write([
            (c >> 18) | 0xf0,
            ((c >> 12) & 0x3f) | 0x80,
            ((c >> 6) & 0x3f) | 0x80,
            (c & 0x3f) | 0x80
          ]);
          n += 1;
          cached = false;
        } else o.invalidContinuationCodeError({index: n + 1, from: n, to: n + 2});
      } else if (0xdc00 <= c && c <= 0xdfff) o.invalidStartCodeError({index: n});
      else o.write([
        ((c >> 12) & 0xf) | 0xe0,
        ((c >> 6) & 0x3f) | 0x80,
        (c & 0x3f) | 0x80
      ]);
    }
  };
  env.encodeUtf16ToUtf8 = function (codes) {
    var r = [];
    function err() { r.push(0xEF, 0xBF, 0xBD); }
    env.utf16ToUtf8EncoderAlgorithm({
      get: function (i) { return codes[i]; },
      write: r.push.apply.bind(r.push, r),
      invalidStartCodeError: err,
      unexpectedEndOfDataError: err,
      invalidContinuationCodeError: err
    });
    return r;
  };
  env.encodeStringToUtf8Bytes = function (text) {
    var r = [];
    function err() { r.push(0xEF, 0xBF, 0xBD); }
    env.utf16ToUtf8EncoderAlgorithm({
      get: text.charCodeAt.bind(text),
      write: r.push.apply.bind(r.push, r),
      invalidStartCodeError: err,
      unexpectedEndOfDataError: err,
      invalidContinuationCodeError: err
    });
    return r;
  };

  env.utf8DecoderAlgorithm = function (o) {
    // o.get(index) - called to get the next uint8 to decode.
    //     `index` is a counter that increments every time `get` is called.
    //     If `get` returns < 0, NaN, null or undefined the algo stops.
    // o.write(codes) - called to push the encoded code point
    //     `codes` is an array of code points.
    // XXX use o.cache = []
    // o.invalidStartByteError({index}) - called on invalid start byte
    // o.overlongEncodingError({index, from, to}) - called on overlong byte sequence
    //     if `overlongEncodingError` returns true, then the algorithm will continue
    //     to decode the current code point.
    // o.unexpectedEndOfDataError({index, from, to}) - called on unexpected on of data
    // o.invalidContinuationByteError({index, from, to}) - called on invalid continuation byte

    var n = 0, ci, c, code, cache = [];
    for (; (code = cache.length ? cache.shift() : o.get(n)) >= 0; n += 1) {
      if ((c = code) <= 0x7F)
        o.write([code]);
      else if ((0xE0 & code) === 0xC0) {
        if (code < 0xC2 && !o.overlongEncodingError({index: n, from: n, to: n + 2})) {}
        else if (!((ci = cache.length ? cache[0] : (cache[0] = o.get(n + 1))) >= 0)) o.unexpectedEndOfDataError({index: n + 1, from: n, to: n + 2});
        else if ((code = ((0xC0 & ci) === 0x80 ? (code << 6) | (ci & 0x3F) : null)) === null) o.invalidContinuationByteError({index: n + 1, from: n, to: n + 2});
        else { o.write([code & 0x7FF]); n += 1; cache.shift(); }
      } else if ((0xF0 & code) === 0xE0) {
        if (!((ci = cache.length ? cache[0] : (cache[0] = o.get(n + 1))) >= 0)) o.unexpectedEndOfDataError({index: n + 1, from: n, to: n + 3});
        else if ((code = ((0xC0 & ci) === 0x80 ? (code << 6) | (ci & 0x3F) : null)) === null) o.invalidContinuationByteError({index: n + 1, from: n, to: n + 3});
        else if (c === 0xE0 && ci <= 0x9F && !o.overlongEncodingError({index: n + 1, from: n, to: n + 3})) {}
        else if (!((ci = cache.length > 1 ? cache[1] : (cache[1] = o.get(n + 2))) >= 0)) o.unexpectedEndOfDataError({index: n + 2, from: n, to: n + 3});
        else if ((code = ((0xC0 & ci) === 0x80 ? (code << 6) | (ci & 0x3F) : null)) === null) o.invalidContinuationByteError({index: n + 2, from: n, to: n + 3});
        //else if ((c === 0xE0 && 0x80 <= cache[0] && cache[0] <= 0x9F && 0x80 <= cache[1] && cache[1] <= 0xBF) || (c === 0xED && 0xA0 <= cache[0] && cache[0] <= 0xBF && 0x80 <= cache[1] && cache[1] <= 0xBF)) o.invalidContinuationByteError({index: n + 2, from: n, to: n + 3});
        else if (0xD800 <= (code = code & 0xFFFF) && code <= 0xDFFF) o.invalidContinuationByteError({index: n + 2, from: n, to: n + 3});
        else { o.write([code]); n += 2; cache.splice(0, 2); }
      } else if ((0xF8 & code) === 0xF0) {
        if (code >= 0xF5) o.invalidStartByteError({index: n, from: n, to: n + 4});
        else if (!((ci = cache.length ? cache[0] : (cache[0] = o.get(n + 1))) >= 0)) o.unexpectedEndOfDataError({index: n + 1, from: n, to: n + 4});
        else if ((code = ((0xC0 & ci) === 0x80 ? (code << 6) | (ci & 0x3F) : null)) === null) o.invalidContinuationByteError({index: n + 1, from: n, to: n + 4});
        else if (c === 0xF0 && ci <= 0x8F && !o.overlongEncodingError({index: n + 1, from: n, to: n + 4})) {}
        else if (!((ci = cache.length > 1 ? cache[1] : (cache[1] = o.get(n + 2))) >= 0)) o.unexpectedEndOfDataError({index: n + 2, from: n, to: n + 4});
        else if ((code = ((0xC0 & ci) === 0x80 ? (code << 6) | (ci & 0x3F) : null)) === null) o.invalidContinuationByteError({index: n + 2, from: n, to: n + 4});
        else if (!((ci = cache.length > 2 ? cache[2] : (cache[2] = o.get(n + 3))) >= 0)) o.unexpectedEndOfDataError({index: n + 3, from: n, to: n + 4});
        else if ((code = ((0xC0 & ci) === 0x80 ? (code << 6) | (ci & 0x3F) : null)) === null) o.invalidContinuationByteError({index: n + 3, from: n, to: n + 4});
        else { o.write([code & 0x1FFFFF]); n += 3; cache.splice(0, 3); }
      } else o.invalidStartByteError({index: n});
    }
  };
  env.decodeUtf8 = function (bytes) {
    var r = [];
    function err() { r.push(0xFFFD); }
    env.utf8DecoderAlgorithm({
      get: function (i) { return bytes[i]; },
      write: r.push.apply.bind(r.push, r),
      invalidStartByteError: err,
      overlongEncodingError: err,
      unexpectedEndOfDataError: err,
      invalidContinuationByteError: err
    });
    return r;
  };
  env.decodeUtf8BytesToString = function (bytes) {
    return env.encodeCodePointToString.apply(env, env.decodeUtf8(bytes));
  };

  // function viewCodePointToUtf8(code) {
  //   function tob(code, xcount) {
  //     return "x".repeat(xcount) + ("0000000" + code.toString(2)).slice(-(8 - xcount));
  //   }
  //   var s = [], tmp;
  //   tmp = tob(code & 0xFF, 1);
  //   if (code >= 0x80) tmp += " invalid";
  //   s.push(tmp);
  //   tmp = tob((code >>> 6) & 0xFF, 3) + " " + tob(code & 0x3F, 2);
  //   if ((code >>> 6) >= 0x20) tmp += " invalid";
  //   s.push(tmp);
  //   tmp = tob((code >>> 12) & 0xFF, 4) + " " + tob((code >>> 6) & 0x3F, 2) + " " + tob(code & 0x3F, 2);
  //   if ((code >>> 12) >= 0x10) tmp += " invalid";
  //   s.push(tmp);
  //   tmp = tob((code >>> 18) & 0xFF, 5) + " " + tob((code >>> 12) & 0x3F, 2) + " " + tob((code >>> 6) & 0x3F, 2) + " " + tob(code & 0x3F, 2);
  //   if ((code >>> 18) >= 0xF) tmp += " invalid";
  //   s.push(tmp);
  //   return s.join("\n");
  // }

}(this.env));
