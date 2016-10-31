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
  //   env.encodeCodePointToString
  //
  //   env.encodeCodePointsToUtf16ChunkAlgorithm
  //   env.encodeCodePointsToUtf16
  //
  //   env.encodeUtf16ToUtf8ChunkAlgorithm
  //   env.encodeUtf16ToUtf8
  //   env.encodeStringToUtf8
  //
  //   env.decodeUtf8ChunkAlgorithm
  //   env.decodeUtf8
  //   env.decodeUtf8ToString

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

  env.encodeCodePointsToUtf16ChunkAlgorithm = function (codePoints, utf16Codes, o) {
    // codePoints = [...]
    //   an array of code points (uint32)
    // utf16Codes = []
    //   where the utf16 codes (uint16) will be written
    // o.reservedCodePointError({codePoints, utf16Codes, index}) - called if > U+D800 & < U+DFFF
    // o.invalidCodePointError({codePoints, utf16Codes, index}) - called if > U+10FFFF
    // returns utf16Codes

    var i = 0, l = codePoints.length, code;
    for (; i < l; i += 1) {
      code = codePoints[i];
      if (code <= 0xD7FF) utf16Codes.push(code);
      else if (code <= 0xDFFF) o.reservedCodePointError({codePoints: codePoints, utf16Codes: utf16Codes, index: i});
      else if (code <= 0xFFFF) utf16Codes.push(code);
      else if (code <= 0x10FFFF) {  // surrogate pair
        code -= 0x10000;
        utf16Codes.push(0xD800 + ((code >>> 10) & 0x3FF), 0xDC00 + (code & 0x3FF));
      } else o.invalidCodePointError({codePoints: codePoints, utf16Codes: utf16Codes, index: i});
    }
    return utf16Codes;
  };
  env.encodeCodePointsToUtf16 = function (codePoints) {
    return env.encodeCodePointsToUtf16ChunkAlgorithm(codePoints, [], {
      reservedCodePointError: function (o) { o.utf16Codes.push(o.codePoints[o.index]); },  // accept reserved code points (like in chrome)
      invalidCodePointError: function (o) { o.utf16Codes.push(0xFFFD); }  // force encoding to work
    });
  };

  env.encodeUtf16ToUtf8ChunkAlgorithm = function (utf16Codes, utf8Codes, cache, o, close) {
    // utf16Codes = [...]
    //   an array of utf16 codes (uint16)
    // utf8Codes = []
    //   where the utf8 codes (uint8) will be written
    // cache = []
    //   used by the algorithm
    // o.invalidStartCodeError({utf16Codes, utf8Codes, index}) - called on invalid surrogate start
    // o.unexpectedEndOfDataError({utf16Codes, utf8Codes, index}) - called on incomplete surrogate pair
    // o.invalidContinuationCodeError({utf16Codes, utf8Codes, index}) - called on invalid surrogate pair
    //   if returns true, the algorithm reparse the current utf16code as an utf16 start code.
    // close = false (optional)
    // returns utf8Codes

    var i = 0, l = utf16Codes.length, c, c1;
    for (; i < l; i += 1) {
      c = utf16Codes[i];
      if (cache.length) {
        if (0xdc00 <= c && c <= 0xdfff) {
          c1 = cache[0];
          c1 = ((c1 - 0xd800) << 10) + (c - 0xdc00) + 0x10000;
          utf8Codes.push((c1 >> 18) | 0xf0, ((c1 >> 12) & 0x3f) | 0x80, ((c1 >> 6) & 0x3f) | 0x80, (c1 & 0x3f) | 0x80);
        } else if (o.invalidContinuationCodeError({utf16Codes: utf16Codes, utf8Codes: utf8Codes, index: i})) i -= 1;
        cache.shift();
      } else if (c <= 0x7F) utf8Codes.push(c);
      else if (c <= 0x7FF) utf8Codes.push((c >> 6) | 0xc0, (c & 0x3f) | 0x80);
      else if (0xd800 <= c && c <= 0xdbff) cache[0] = c;
      else if (0xdc00 <= c && c <= 0xdfff) o.invalidStartCodeError({utf16Codes: utf16Codes, utf8Codes: utf8Codes, index: i});
      else utf8Codes.push(((c >> 12) & 0xf) | 0xe0, ((c >> 6) & 0x3f) | 0x80, (c & 0x3f) | 0x80);
    }
    if (close && cache.length) o.unexpectedEndOfDataError({utf16Codes: utf16Codes, utf8Codes: utf8Codes, index: utf16Codes.length});
    return utf8Codes;
  };
  env.encodeUtf16ToUtf8 = function (utf16Codes) {
    function err(o) { return o.utf8Codes.push(0xEF, 0xBF, 0xBD); }
    return env.encodeUtf16ToUtf8ChunkAlgorithm(utf16Codes, [], [], {
      invalidStartCodeError: err,
      unexpectedEndOfDataError: err,
      invalidContinuationCodeError: err
    }, true);
  };
  env.encodeStringToUtf8 = function (text) {
    function err(o) { return o.utf8Codes.push(0xEF, 0xBF, 0xBD); }
    var i = 0, l = text.length, utf16Codes = new Array(l);
    for (; i < l; i += 1) utf16Codes[i] = text.charCodeAt(i);
    return env.encodeUtf16ToUtf8ChunkAlgorithm(utf16Codes, [], [], {
      invalidStartCodeError: err,
      unexpectedEndOfDataError: err,
      invalidContinuationCodeError: err
    }, true);
  };

  env.decodeUtf8ChunkAlgorithm = function (utf8Codes, codePoints, cache, o, close) {
    // utf8Codes = [...]
    //   an array of utf8 codes (uint8)
    // codePoints = []
    //   where the code points (uint32) will be written
    // cache = []
    //   used by the algorithm
    // o.invalidStartByteError({utf8Codes, utf16Codes, cache, index}) - called on invalid start byte
    // o.overlongEncodingError({utf8Codes, utf16Codes, cache, index, requiredUtf8CodeAmount, utf8CodeIndex}) - called on overlong byte sequence
    //   if `overlongEncodingError` returns true, then the algorithm will continue
    //   to decode the current code point.
    // o.unexpectedEndOfDataError({utf8Codes, utf16Codes, cache, index, requiredUtf8CodeAmount, utf8CodeIndex}) - called on unexpected on of data
    // o.invalidContinuationByteError({utf8Codes, utf16Codes, cache, index, requiredUtf8CodeAmount, utf8CodeIndex}) - called on invalid continuation byte
    // close = false (optional)
    // returns codePoints

    var i = 0, l = utf8Codes.length, code, c;
    for (; i < l; i += 1) {
      code = utf8Codes[i];
      switch (cache[0]) {
        case 2:
          if ((0xC0 & code) !== 0x80) o.invalidContinuationByteError({utf8Codes: utf8Codes, codePoints: codePoints, cache: cache, index: i, requiredUtf8CodeAmount: 2, utf8CodeIndex: 1});
          else { codePoints.push(((cache[1] << 6) | (code & 0x3F)) & 0x7FF); cache.splice(0, 2); } break;
        case 3:
          if ((0xC0 & code) !== 0x80) o.invalidContinuationByteError({utf8Codes: utf8Codes, codePoints: codePoints, cache: cache, index: i, requiredUtf8CodeAmount: 3, utf8CodeIndex: 1});
          else if ((c = cache[1]) === 0xE0 && code <= 0x9F && !o.overlongEncodingError({utf8Codes: utf8Codes, codePoints: codePoints, cache: cache, index: i, requiredUtf8CodeAmount: 3, utf8CodeIndex: 1})) {}
          else { cache[0] = 31; cache[1] = (c << 6) | (code & 0x3F); } break;
        case 31:
          if ((0xC0 & code) !== 0x80) o.invalidContinuationByteError({utf8Codes: utf8Codes, codePoints: codePoints, cache: cache, index: i, requiredUtf8CodeAmount: 3, utf8CodeIndex: 2});
          else if (0xD800 <= (c = ((cache[1] << 6) | (code & 0x3F)) & 0xFFFF) && c <= 0xDFFF) o.invalidContinuationByteError({utf8Codes: utf8Codes, codePoints: codePoints, cache: cache, index: i, requiredUtf8CodeAmount: 3, utf8CodeIndex: 2});
          else { codePoints.push(c); cache.splice(0, 2); } break;
        case 4:
          if ((0xC0 & code) !== 0x80) o.invalidContinuationByteError({utf8Codes: utf8Codes, codePoints: codePoints, cache: cache, index: i, requiredUtf8CodeAmount: 4, utf8CodeIndex: 1});
          else if ((c = cache[1]) === 0xF0 && code <= 0x8F && !o.overlongEncodingError({utf8Codes: utf8Codes, codePoints: codePoints, cache: cache, index: i, requiredUtf8CodeAmount: 4, utf8CodeIndex: 1})) {}
          else { cache[0] = 41; cache[1] = (c << 6) | (code & 0x3F); } break;
        case 41:
          if ((0xC0 & code) !== 0x80) o.invalidContinuationByteError({utf8Codes: utf8Codes, codePoints: codePoints, cache: cache, index: i, requiredUtf8CodeAmount: 4, utf8CodeIndex: 2});
          else { cache[0] = 42; cache[1] = (cache[1] << 6) | (code & 0x3F); } break;
        case 42:
          if ((0xC0 & code) !== 0x80) o.invalidContinuationByteError({utf8Codes: utf8Codes, codePoints: codePoints, cache: cache, index: i, requiredUtf8CodeAmount: 4, utf8CodeIndex: 3});
          else { codePoints.push(((cache[1] << 6) | (code & 0x3F)) & 0x1FFFFF); cache.splice(0, 2); } break;
        default:
          if (code <= 0x7F) codePoints.push(code);
          else if ((0xE0 & code) === 0xC0) {
            if (code < 0xC2 && !o.overlongEncodingError({utf8Codes: utf8Codes, codePoints: codePoints, cache: cache, index: i, requiredUtf8CodeAmount: 2, utf8CodeIndex: 0})) {}
            else { cache[0] = 2; cache[1] = code; }
          } else if ((0xF0 & code) === 0xE0) { cache[0] = 3; cache[1] = code; }
          else if ((0xF8 & code) === 0xF0) {
            if (code >= 0xF5) o.invalidStartByteError({utf8Codes: utf8Codes, codePoints: codePoints, cache: cache, index: i, requiredUtf8CodeAmount: 4, utf8CodeIndex: 0});
            else { cache[0] = 4; cache[1] = code; }
          } else o.invalidStartByteError({utf8Codes: utf8Codes, codePoints: codePoints, cache: cache, index: i});
      }
    }
    if (close && cache.length) {
      switch (cache[0]) {
        case 2:  o.unexpectedEndOfDataError({utf8Codes: utf8Codes, codePoints: codePoints, cache: cache, index: i, requiredUtf8CodeAmount: 2, utf8CodeIndex: 1}); break;
        case 3:  o.unexpectedEndOfDataError({utf8Codes: utf8Codes, codePoints: codePoints, cache: cache, index: i, requiredUtf8CodeAmount: 3, utf8CodeIndex: 1}); break;
        case 31: o.unexpectedEndOfDataError({utf8Codes: utf8Codes, codePoints: codePoints, cache: cache, index: i, requiredUtf8CodeAmount: 3, utf8CodeIndex: 2}); break;
        case 4:  o.unexpectedEndOfDataError({utf8Codes: utf8Codes, codePoints: codePoints, cache: cache, index: i, requiredUtf8CodeAmount: 4, utf8CodeIndex: 1}); break;
        case 41: o.unexpectedEndOfDataError({utf8Codes: utf8Codes, codePoints: codePoints, cache: cache, index: i, requiredUtf8CodeAmount: 4, utf8CodeIndex: 2}); break;
        case 42: o.unexpectedEndOfDataError({utf8Codes: utf8Codes, codePoints: codePoints, cache: cache, index: i, requiredUtf8CodeAmount: 4, utf8CodeIndex: 3}); break;
      }
    }
    return codePoints;
  };
  env.decodeUtf8 = function (bytes) {
    function pushCodePointError(o) { o.codePoints.push(0xFFFD); o.cache.splice(0); }
    function pushCodePointErrorAndDecodeMissedUtf8(o) {
      o.codePoints.push(0xFFFD); o.cache.splice(0);
      this.algo(o.utf8Codes.slice(o.index - o.utf8CodeIndex + 1, o.index + 1), o.codePoints, o.cache, this, false);
    }
    function pushCodePointErrorAndDecodeMissedUtf8AndClose(o) {
      o.codePoints.push(0xFFFD); o.cache.splice(0);
      this.algo(o.utf8Codes.slice(o.index - o.utf8CodeIndex + 1), o.codePoints, o.cache, this, true);
    }
    return env.decodeUtf8ChunkAlgorithm(bytes, [], [], {
      algo: env.decodeUtf8ChunkAlgorithm,
      invalidStartByteError: pushCodePointError,
      overlongEncodingError: pushCodePointErrorAndDecodeMissedUtf8,
      invalidContinuationByteError: pushCodePointErrorAndDecodeMissedUtf8,
      unexpectedEndOfDataError: pushCodePointErrorAndDecodeMissedUtf8AndClose
    }, true);
  };
  env.decodeUtf8ToString = function (bytes) {
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
