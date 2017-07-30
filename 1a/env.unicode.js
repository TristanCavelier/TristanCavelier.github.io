/*jslint indent: 2 */
(function envUnicode(env) {
  "use strict";

  /*! env.unicode.js Version 1.0.0

      Copyright (c) 2015-2017 Tristan Cavelier <t.cavelier@free.fr>
      This program is free software. It comes without any warranty, to
      the extent permitted by applicable law. You can redistribute it
      and/or modify it under the terms of the Do What The Fuck You Want
      To Public License, Version 2, as published by Sam Hocevar. See
      http://www.wtfpl.net/ for more details. */

  // provides:
  //   env.encodeCodePointToString
  //   env.encodeCodePointsToString
  //
  //   env.encodeCodePointsToUtf16ChunkAlgorithm
  //   env.encodeCodePointsToUtf16
  //
  //   env.encodeCodePointsToUtf8ChunkAlgorithm
  //   env.encodeCodePointsToUtf8
  //
  //   env.encodeUtf16ToUtf8ChunkAlgorithm
  //   env.encodeUtf16ToUtf8
  //   env.encodeStringToUtf8
  //
  //   env.decodeUtf8ChunkAlgorithm
  //   env.decodeUtf8LikeChromeOs
  //   env.decodeUtf8LikeChrome
  //   env.decodeUtf8LikeFirefox
  //   env.decodeUtf8
  //   env.decodeUtf8ToString
  //
  //   env.decodeExtendedAsciiCodesToCodePointsChunkAlgorithm
  //   env.decodeExtendedAsciiCodesToCodePoints
  //
  //   env.decodeLatin1CodesToCodePointsChunkAlgorithm
  //   env.decodeLatin1CodesToCodePoints
  //   env.decodeLatin1CodesToString

  if (env.registerLib) env.registerLib(envUnicode);

  // https://en.wikipedia.org/wiki/UTF-8
  // https://en.wikipedia.org/wiki/UTF-16
  // http://stackoverflow.com/questions/13235091/extract-the-first-letter-of-a-utf-8-string-with-lua#13238257
  // http://stackoverflow.com/questions/23502153/utf-8-encoding-algorithm-vs-utf-16-algorithm#23502707
  // http://www.unicode.org/faq/utf_bom.html

  if (typeof String.fromCodePoint === "function") env.encodeCodePointToString = String.fromCodePoint;
  else env.encodeCodePointToString = function () {
    // ..is a String.fromCodePoint polyfill
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

  env.encodeCodePointsToString = function (codePoints) {
    // XXX do documentation
    // quicker than using `String.fromCodePoint.apply(String, codePoints)`
    //   (and 32766 was the amount limit of argument for a function call).
    var i = 0, l = codePoints.length, code, s = "";
    for (; i < l; i += 1) {
      code = codePoints[i];
      //if (0xD800 <= code && code <= 0xDFFF) s += String.fromCharCode(0xFFFD); else
      if (code <= 0xFFFF) s += String.fromCharCode(code);
      else if (code <= 0x10FFFF) {  // surrogate pair
        code -= 0x10000;
        s += String.fromCharCode(0xD800 + ((code >>> 10) & 0x3FF), 0xDC00 + (code & 0x3FF));
      } else throw new Error("Invalid code point " + code);
    }
    return s;
  };

  env.encodeCodePointsToUtf16ChunkAlgorithm = function (codePoints, i, l, utf16Codes, allowReservedCodePoints, events) {
    // XXX do documentation

    // codePoints = [...]
    //   an array of code points (uint32)
    // i (from) = 0
    //   from which index to start reading codePoints
    // l (to) = codePoints.length
    //   from which index to stop reading codePoints
    // utf16Codes = []
    //   where the utf16 codes (uint16) are pushed
    // allowReservedCodePoints = false
    //   whether to ignore reserved code points or not
    // events = []
    //   where the error events are pushed
    // returns utf16Codes

    // events :
    //   error
    //     reserved code point, errno 1 (if > U+D800 & < U+DFFF)
    //     invalid code point, errno 2 (if > U+10FFFF)

    var code;
    for (; i < l; i += 1) {
      code = codePoints[i];
      if (code <= 0xD7FF) utf16Codes.push(code);
      else if (!allowReservedCodePoints && code <= 0xDFFF) { events.push({type: "error", message: "reserved code point", errno: 1, index: i}); return utf16Codes; }
      else if (code <= 0xFFFF) utf16Codes.push(code);
      else if (code <= 0x10FFFF) {  // surrogate pair
        code -= 0x10000;
        utf16Codes.push(0xD800 + ((code >>> 10) & 0x3FF), 0xDC00 + (code & 0x3FF));
      } else { events.push({type: "error", message: "invalid code point", errno: 2, index: i}); return utf16Codes; }
    }
    return utf16Codes;
  };
  env.encodeCodePointsToUtf16 = function (codePoints) {
    // XXX do documentation

    // codePoints = [...]
    //   an array of code points (uint32)
    // returns an array of utf16 codes (uint16)

    var i = 0, l = codePoints.length, code, utf16Codes = [];
    for (; i < l; i += 1) {
      code = codePoints[i];
      //if (code <= 0xD7FF) utf16Codes.push(code);
      //else if (code <= 0xDFFF) accept reserved code points (like in chrome)
      if (code <= 0xFFFF) utf16Codes.push(code);
      else if (code <= 0x10FFFF) {  // surrogate pair
        code -= 0x10000;
        utf16Codes.push(0xD800 + ((code >>> 10) & 0x3FF), 0xDC00 + (code & 0x3FF));
      } else utf16Codes.push(0xFFFD);  // push code point error
    }
    return utf16Codes;
  };

  env.encodeCodePointsToUtf8ChunkAlgorithm = function (codePoints, i, l, utf8Codes, allowReservedCodePoints, events) {
    // XXX do documentation

    // codePoints = [...]
    //   an array of code points (uint32)
    // i (from) = 0
    //   from which index to start reading codePoints
    // l (to) = codePoints.length
    //   from which index to stop reading codePoints
    // utf8Codes = []
    //   where the utf8 codes (uint8) are pushed
    // allowReservedCodePoints = false
    //   whether to ignore reserved code points or not
    // events = []
    //   where the error events are pushed
    // returns utf8Codes

    // events :
    //   error
    //     reserved code point, errno 1 (if > U+D800 & < U+DFFF)
    //     invalid code point, errno 2 (if > U+10FFFF)

    var code, b, c, d;
    for (; i < l; i += 1) {
      if ((code = codePoints[i]) <= 0x7F) utf8Codes.push(code);
      else if (code <= 0x7FF) {
        b = 0x80 | (code & 0x3F); code >>>= 6;
        utf8Codes.push(0xC0 | (code & 0x1F), b); // a = (0x1E << (6 - 1)) | (code & (0x3F >> 1));
      } else if (!allowReservedCodePoints && 0xD800 <= code && code <= 0xDFFF) { events.push({type: "error", message: "reserved code point", errno: 1, index: i}); return utf8Codes; }
      else if (code <= 0xFFFF) {
        c = 0x80 | (code & 0x3F); code >>>= 6;
        b = 0x80 | (code & 0x3F); code >>>= 6;
        utf8Codes.push(0xE0 | (code & 0xF), b, c); // a = (0x1E << (6 - 2)) | (code & (0x3F >> 2));
      } else if (code <= 0x10FFFF) {
        d = 0x80 | (code & 0x3F); code >>>= 6;
        c = 0x80 | (code & 0x3F); code >>>= 6;
        b = 0x80 | (code & 0x3F); code >>>= 6;
        utf8Codes.push(0xF0 | (code & 0x7), b, c, d); // a = (0x1E << (6 - 3)) | (code & (0x3F >> 3));
      } else { events.push({type: "error", message: "invalid code point", errno: 2, index: i}); return utf8Codes; }
    }
    return utf8Codes;
  };
  env.encodeCodePointsToUtf8 = function (codePoints) {
    // XXX do documentation

    // codePoints = [...]
    //   an array of code points (uint32)
    // returns an array of utf8 codes (uint8)

    var i = 0, l = codePoints.length, code, b, c, d, utf8Codes = [];
    for (; i < l; i += 1) {
      if ((code = codePoints[i]) <= 0x7F) utf8Codes.push(code);
      else if (code <= 0x7FF) {
        b = 0x80 | (code & 0x3F); code >>>= 6;
        utf8Codes.push(0xC0 | (code & 0x1F), b); // a = (0x1E << (6 - 1)) | (code & (0x3F >> 1));
      // } else if (0xD800 <= code && code <= 0xDFFF) accept reserved code points (like in chrome)
      } else if (code <= 0xFFFF) {
        c = 0x80 | (code & 0x3F); code >>>= 6;
        b = 0x80 | (code & 0x3F); code >>>= 6;
        utf8Codes.push(0xE0 | (code & 0xF), b, c); // a = (0x1E << (6 - 2)) | (code & (0x3F >> 2));
      } else if (code <= 0x10FFFF) {
        d = 0x80 | (code & 0x3F); code >>>= 6;
        c = 0x80 | (code & 0x3F); code >>>= 6;
        b = 0x80 | (code & 0x3F); code >>>= 6;
        utf8Codes.push(0xF0 | (code & 0x7), b, c, d); // a = (0x1E << (6 - 3)) | (code & (0x3F >> 3));
      } else utf8Codes.push(0xEF, 0xBF, 0xBD);  // push code point error
    }
    return utf8Codes;
  };

  env.encodeUtf16ToUtf8ChunkAlgorithm = function (utf16Codes, i, l, utf8Codes, events, cache, close) {
    // XXX do documentation

    // utf16Codes = [...]
    //   an array of utf16 codes (uint16)
    // i (from) = 0
    //   from which index to start reading utf16Codes
    // l (to) = utf16Codes.length
    //   from which index to stop reading utf16Codes
    // utf8Codes = []
    //   where the utf8 codes (uint8) are pushed
    // events = []
    //   where the error events are pushed
    // cache = []
    //   used by the algorithm
    // close = false (optional)
    //   tells the algorithm to close the stream
    // returns utf8Codes

    // events :
    //   error
    //     invalid continuation code, errno 1
    //     invalid start code, errno 2
    //     unexpected end of data, errno 3

    var c, c1;
    for (; i < l; i += 1) {
      c = utf16Codes[i];
      if (cache.length) {
        if (0xdc00 <= c && c <= 0xdfff) {
          c1 = cache[0];
          c1 = ((c1 - 0xd800) << 10) + (c - 0xdc00) + 0x10000;
          utf8Codes.push((c1 >> 18) | 0xf0, ((c1 >> 12) & 0x3f) | 0x80, ((c1 >> 6) & 0x3f) | 0x80, (c1 & 0x3f) | 0x80);
          cache.shift();
        } else { events.push({type: "error", message: "invalid continuation code", errno: 1, index: i}); return utf8Codes; }
      } else if (c <= 0x7F) utf8Codes.push(c);
      else if (c <= 0x7FF) utf8Codes.push((c >> 6) | 0xc0, (c & 0x3f) | 0x80);
      else if (0xd800 <= c && c <= 0xdbff) cache[0] = c;
      else if (0xdc00 <= c && c <= 0xdfff) { events.push({type: "error", message: "invalid start code", errno: 2, index: i}); return utf8Codes; }
      else utf8Codes.push(((c >> 12) & 0xf) | 0xe0, ((c >> 6) & 0x3f) | 0x80, (c & 0x3f) | 0x80);
    }
    if (close && cache.length) { events.push({type: "error", message: "unexpected end of data", errno: 3, index: i}); return utf8Codes; }
    return utf8Codes;
  };
  env.encodeUtf16ToUtf8 = function (utf16Codes) {
    // XXX do documentation

    // utf16Codes = [...]
    //   an array of utf16 codes (uint16)
    // returns an array of utf8 codes (uint8)

    var cont = true, e, ee = [], i = 0, ei = 0, cache = [], utf8Codes = [];
    while (cont) {
      cont = false;
      env.encodeUtf16ToUtf8ChunkAlgorithm(utf16Codes, i, utf16Codes.length, utf8Codes, ee, cache, true);
      if ((e = ee[ei++]) !== undefined) {
        switch (e.errno) {
          case 1:  // invalid continuation code
            i = e.index;
            utf8Codes.push(0xEF, 0xBF, 0xBD);
            cache = [];
            break;
          case 2:  // invalid start code
          case 3:  // unexpected end of data
            i = e.index + 1;
            utf8Codes.push(0xEF, 0xBF, 0xBD);
            break;
          default:
            throw new Error("unhandled errno " + e.errno);
        }
        cont = i < utf16Codes.length;
      }
    }
    return utf8Codes;
  };
  env.encodeStringToUtf8 = function (text) {
    // XXX do documentation
    var i = 0, l = text.length, utf16Codes = new Array(l);
    for (; i < l; i += 1) utf16Codes[i] = text.charCodeAt(i);
    return env.encodeUtf16ToUtf8(utf16Codes);
  };

  env.decodeUtf8ChunkAlgorithm = function (utf8Codes, i, l, codePoints, allowOverlongEncoding, events, cache, close) {
    // XXX do documentation

    // utf8Codes = [...]
    //   an array of utf8 codes (uint8)
    // codePoints = []
    //   where the code points (uint32) are pushed
    // cache = []
    //   used by the algorithm
    // events = []
    //   where the error events are pushed
    // close = false (optional)
    //   tells the algorithm to close the stream
    // returns codePoints

    // events :
    //   error
    //     invalid start byte, errno 1
    //     invalid continuation byte, errno 2
    //     overlong encoding, errno 3
    //     reserved code point, errno 4
    //     invalid code point, errno 5
    //     unexpected end of data, errno 6

    var code, c;
    for (; i < l; i += 1) {
      code = utf8Codes[i];
      switch (cache[0]) {
        case 2:
          if ((0xC0 & code) !== 0x80) { events.push({type: "error", message: "invalid continuation byte", errno: 2, length: 2, index: i, requiredUtf8CodeAmount: 2, requiredUtf8CodeIndex: 1}); return codePoints; }
          else { codePoints.push(((cache[1] << 6) | (code & 0x3F)) & 0x7FF); cache[0] = 0; } break;
        case 3:
          if ((0xC0 & code) !== 0x80) { events.push({type: "error", message: "invalid continuation byte", errno: 2, length: 2, index: i, requiredUtf8CodeAmount: 3, requiredUtf8CodeIndex: 1}); return codePoints; }
          else if ((c = cache[1]) === 0xE0 && code <= 0x9F && !allowOverlongEncoding) { events.push({type: "error", message: "overlong encoding", errno: 3, length: 2, index: i, requiredUtf8CodeAmount: 3, requiredUtf8CodeIndex: 1}); return codePoints; }
          else { cache[3] = code; cache[1] = (c << 6) | (code & 0x3F); cache[0] = 31; } break;
        case 31:
          if ((0xC0 & code) !== 0x80) { events.push({type: "error", message: "invalid continuation byte", errno: 2, length: 3, index: i, requiredUtf8CodeAmount: 3, requiredUtf8CodeIndex: 2}); return codePoints; }
          else if (0xD800 <= (c = ((cache[1] << 6) | (code & 0x3F)) & 0xFFFF) && c <= 0xDFFF) { events.push({type: "error", message: "reserved code point", errno: 4, length: 3, index: i, requiredUtf8CodeAmount: 3, requiredUtf8CodeIndex: 2}); return codePoints; }
          else { codePoints.push(c); cache[0] = 0; } break;
        case 4:
          if ((0xC0 & code) !== 0x80) { events.push({type: "error", message: "invalid continuation byte", errno: 2, length: 2, index: i, requiredUtf8CodeAmount: 4, requiredUtf8CodeIndex: 1}); return codePoints; }
          else if ((c = cache[1]) === 0xF0 && code <= 0x8F && !allowOverlongEncoding) { events.push({type: "error", message: "overlong encoding", errno: 3, length: 2, index: i, requiredUtf8CodeAmount: 4, requiredUtf8CodeIndex: 1}); return codePoints; }
          else { cache[3] = code; cache[1] = (c << 6) | (code & 0x3F); cache[0] = 41; } break;
        case 41:
          if ((0xC0 & code) !== 0x80) { events.push({type: "error", message: "invalid continuation byte", errno: 2, length: 3, index: i, requiredUtf8CodeAmount: 4, requiredUtf8CodeIndex: 2}); return codePoints; }
          else { cache[4] = code; cache[1] = (cache[1] << 6) | (code & 0x3F); cache[0] = 42; } break;
        case 42:
          if ((0xC0 & code) !== 0x80) { events.push({type: "error", message: "invalid continuation byte", errno: 2, length: 4, index: i, requiredUtf8CodeAmount: 4, requiredUtf8CodeIndex: 3}); return codePoints; }
          else if ((c = ((cache[1] << 6) | (code & 0x3F)) & 0x1FFFFF) > 0x10FFFF) { events.push({type: "error", message: "invalid code point", errno: 5, length: 4, index: i, requiredUtf8CodeAmount: 4, requiredUtf8CodeIndex: 3}); return codePoints; }
          else { codePoints.push(c); cache[0] = 0; } break;
        default:
          if (code <= 0x7F) codePoints.push(code);
          else if ((0xE0 & code) === 0xC0) {
            if (code < 0xC2 && !allowOverlongEncoding) { events.push({type: "error", message: "overlong encoding", errno: 3, length: 1, index: i, requiredUtf8CodeAmount: 2, requiredUtf8CodeIndex: 0}); return codePoints; }
            else { cache[2] = cache[1] = code; cache[0] = 2; }
          } else if ((0xF0 & code) === 0xE0) { cache[2] = cache[1] = code; cache[0] = 3; }
          else if ((0xF8 & code) === 0xF0) {
            if (code >= 0xF5) { events.push({type: "error", message: "invalid start byte", errno: 1, length: 1, index: i, requiredUtf8CodeAmount: 4, requiredUtf8CodeIndex: 0}); return codePoints; }
            else { cache[2] = cache[1] = code; cache[0] = 4; }
          } else { events.push({type: "error", message: "invalid start byte", errno: 1, length: 1, index: i}); return codePoints; }
      }
    }
    if (close) {
      switch (cache[0]) {
        case 2:  events.push({type: "error", message: "unexpected end of data", errno: 6, length: 2, index: i, requiredUtf8CodeAmount: 2, requiredUtf8CodeIndex: 1}); break;
        case 3:  events.push({type: "error", message: "unexpected end of data", errno: 6, length: 2, index: i, requiredUtf8CodeAmount: 3, requiredUtf8CodeIndex: 1}); break;
        case 31: events.push({type: "error", message: "unexpected end of data", errno: 6, length: 3, index: i, requiredUtf8CodeAmount: 3, requiredUtf8CodeIndex: 2}); break;
        case 4:  events.push({type: "error", message: "unexpected end of data", errno: 6, length: 2, index: i, requiredUtf8CodeAmount: 4, requiredUtf8CodeIndex: 1}); break;
        case 41: events.push({type: "error", message: "unexpected end of data", errno: 6, length: 3, index: i, requiredUtf8CodeAmount: 4, requiredUtf8CodeIndex: 2}); break;
        case 42: events.push({type: "error", message: "unexpected end of data", errno: 6, length: 4, index: i, requiredUtf8CodeAmount: 4, requiredUtf8CodeIndex: 3}); break;
      }
    }
    return codePoints;
  };
  env.decodeUtf8LikeChrome = function (bytes) {
    // XXX do documentation
    var cont = true, ret = [], ee = [], e, cache = [], i = 0, ei = 0;
    while (cont) {
      cont = false;
      env.decodeUtf8ChunkAlgorithm(bytes, i, bytes.length, ret, false, ee, cache, true);
      if ((e = ee[ei++]) !== undefined) {
        ret.push(0xFFFD);
        cache.splice(0);
        i = e.index - e.length + 2;

        // Strange case for invalid continuation bytes
        //     legend: C: valid continuation byte,
        //             X: invalid continuation byte,
        //             S: start byte,
        //             E: error code (i.e. 0xFFFD or 65533),
        //             ?: random byte
        //     showing cases were bytes sequences are always invalid
        //   decode([S, C, C]) => [E] + decode([C, C]) as if only [S] is consumed
        //   decode([S, C, X]) => [E] + decode([X]) as if [S, C] are consumed
        //   decode([S, X, ?]) => [E] + decode([X, ?]) as if [S] is consumed
        //
        //   decode([S, C, C, C]) => [E] + decode([C, C, C]) as if only [S] is consumed
        //   decode([S, C, C, X]) => [E] + decode([X]) as if [S, C, C] are consumed
        //   decode([S, C, X, ?]) => [E] + decode([X, ?]) as if [S, C] are consumed
        //   decode([S, X, ?, ?]) => [E] + decode([X, ?, ?]) as if [S] is consumed
        //
        // this works for many cases, not all.

        if (e.errno === 2) {  // invalid continuation byte
          if (e.requiredUtf8CodeAmount === 3) {
            if (e.length === 3) {
              // here bytes[i] is already between 0x80 and 0xBF
              if (bytes[i - 1] != 0xED || bytes[i] <= 0x8F) ++i;
            }
          } else if (e.requiredUtf8CodeAmount === 4) {
            if (e.length === 3) {
              // here bytes[i] is already between 0x80 and 0xBF
              if (i + 2 < bytes.length &&  // have 4 bytes in a row
                  (bytes[i - 1] !== 0xF4 || bytes[i] <= 0x8F))
                ++i;
            } else if (e.length === 4) {
              // here bytes[i] and [i + 1] are already between 0x80 and 0xBF
              if (bytes[i - 1] !== 0xF4 || bytes[i] <= 0x8F) i += 2;
            }
          }
        }

        cont = i < bytes.length;
      }
    }
    return ret;
  };
  env.decodeUtf8LikeChromeOs = env.decodeUtf8LikeChrome;
  env.decodeUtf8LikeFirefox = function (bytes) {
    // XXX do documentation
    var cont = true, ret = [], ee = [], e, cache = [], i = 0, ei = 0;
    while (cont) {
      cont = false;
      env.decodeUtf8ChunkAlgorithm(bytes, i, bytes.length, ret, false, ee, cache, true);
      if ((e = ee[ei++]) !== undefined) {
        ret.push(0xFFFD);
        cache.splice(0);
        i = e.index - e.length + 2;

        // Strange case for invalid continuation bytes
        //     legend: C: valid continuation byte,
        //             X: invalid continuation byte,
        //             S: start byte,
        //             E: error code (i.e. 0xFFFD or 65533),
        //             ?: random byte
        //     showing cases were bytes sequences are always invalid
        //   decode([S, C, C]) => [E] + decode([C, C]) as if only [S] is consumed
        //   decode([S, C, X]) => [E] + decode([X]) as if [S, C] are consumed
        //   decode([S, X, ?]) => [E] + decode([X, ?]) as if [S] is consumed
        //
        //   decode([S, C, C, C]) => [E] + decode([C, C, C]) as if only [S] is consumed
        //   decode([S, C, C, X]) => [E] + decode([X]) as if [S, C, C] are consumed
        //   decode([S, C, X, ?]) => [E] + decode([X, ?]) as if [S, C] are consumed
        //   decode([S, X, ?, ?]) => [E] + decode([X, ?, ?]) as if [S] is consumed
        //
        // this works for many cases, not all.

        if (e.errno === 2) {  // invalid continuation byte
          if (e.requiredUtf8CodeAmount === 3) {
            if (e.length === 3) {
              // here bytes[i] is already between 0x80 and 0xBF
              if (bytes[i - 1] != 0xED || bytes[i] <= 0x8F) ++i;
            }
          } else if (e.requiredUtf8CodeAmount === 4) {
            if (e.length === 3) {
              // here bytes[i] is already between 0x80 and 0xBF
              if (bytes[i - 1] !== 0xF4 || bytes[i] <= 0x8F) ++i;
            } else if (e.length === 4) {
              // here bytes[i] and [i + 1] are already between 0x80 and 0xBF
              if (bytes[i - 1] !== 0xF4 || bytes[i] <= 0x8F) i += 2;
            }
          }
        } else if (e.errno === 6) {  // unexpected end of data
          if (e.requiredUtf8CodeAmount === 3) ++i;
          else if (e.requiredUtf8CodeAmount === 4) {
            if (bytes[i - 1] !== 0xF4) i += 2;
          }
        }

        cont = i < bytes.length;
      }
    }
    return ret;
  };
  env.decodeUtf8 = env.decodeUtf8LikeChrome;
  env.decodeUtf8ToString = function (bytes) {
    // XXX do documentation
    return env.encodeCodePointsToString(env.decodeUtf8(bytes));
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

  env.decodeExtendedAsciiCodesToCodePointsChunkAlgorithm = function (extendedAsciiCodes, i, l, codePoints, events) {
    // API stability level: 1 - Experimental

    // XXX do documentation (extended ascii = Windows-1252)

    // extendedAsciiCodes = [...]
    //   an array of us ascii codes (uint8)
    // i or from = 0
    //   from which index to start reading extendedAsciiCodes
    // l or to = extendedAsciiCodes.length
    //   from which index to stop reading extendedAsciiCodes
    // codePoints = []
    //   where the code points (uint32) are pushed
    // events = []
    //   where the error events are pushed
    // returns codePoints

    // events:
    //   error
    //     invalid byte, errno 1

    var code, errorScheme = {  // externalize errorscheme ?
      129:1,141:1,143:1,144:1,157:1
    }, scheme = [  // externalize scheme ?
      0x20AC,0xFFFD,0x201A,0x0192,0x201E,0x2026,0x2020,0x2021, // 0x80-0x87
      0x02C6,0x2030,0x0160,0x2039,0x0152,0xFFFD,0x017D,0xFFFD, // 0x88-0x8F
      0xFFFD,0x2018,0x2019,0x201C,0x201D,0x2022,0x2013,0x2014, // 0x90-0x97
      0x02DC,0x2122,0x0161,0x203A,0x0153,0xFFFD,0x017E,0x0178  // 0x98-0x9F
    ];
    for (; i < l; i += 1) {
      if ((code = extendedAsciiCodes[i]) <= 0x7F) codePoints.push(code);
      else if (errorScheme[code]) { events.push({type: "error", message: "invalid byte", errno: 1, index: i}); return codePoints; }
      else if (code <= 0x9F) codePoints.push(scheme[code - 0x80]);
      else codePoints.push(code);
    }
    return codePoints;
  };

  env.decodeExtendedAsciiCodesToCodePoints = function (extendedAsciiCodes) {
    // API stability level: 1 - Experimental
    // XXX do documentation (extended ascii = Windows-1252)
    // extendedAsciiCodes = [...]
    //   an array of us ascii codes (uint8)
    // returns an array of code points (uint32)
    var i = 0, l = extendedAsciiCodes.length, codePoints = new Array(l), code, scheme = [
      0x20AC,0xFFFD,0x201A,0x0192,0x201E,0x2026,0x2020,0x2021, // 0x80-0x87
      0x02C6,0x2030,0x0160,0x2039,0x0152,0xFFFD,0x017D,0xFFFD, // 0x88-0x8F
      0xFFFD,0x2018,0x2019,0x201C,0x201D,0x2022,0x2013,0x2014, // 0x90-0x97
      0x02DC,0x2122,0x0161,0x203A,0x0153,0xFFFD,0x017E,0x0178  // 0x98-0x9F
    ];
    for (; i < l; i += 1) {
      if ((code = extendedAsciiCodes[i]) <= 0x7F) codePoints[i] = code;
      else if (code <= 0x9F) codePoints[i] = scheme[code - 0x80];
      else codePoints[i] = code;
    }
    return codePoints;
  };

  env.decodeLatin1CodesToCodePointsChunkAlgorithm = function (latin1Codes, i, l, codePoints) {
    // API stability level: 1 - Experimental

    // XXX do documentation (latin-1 = iso-8859-1)

    // latin1Codes = [...]
    //   an array of latin-1 codes (uint8)
    // i or from = 0
    //   from which index to start reading latin1Codes
    // l or to = latin1Codes.length
    //   from which index to stop reading latin1Codes
    // codePoints = []
    //   where the code points (uint32) are pushed
    // returns codePoints

    for (; i < l; i += 1) codePoints.push(latin1Codes[i]);
    return codePoints;
  };

  env.decodeLatin1CodesToCodePoints = function (latin1Codes) {
    // API stability level: 1 - Experimental
    // XXX do documentation (latin-1 = iso-8859-1)
    // latin1Codes = [...]
    //   an array of latin-1 codes (uint8)
    // returns an array of code points (uint32)
    var i = 0, l = latin1Codes.length, codePoints = new Array(l);
    for (; i < l; i += 1) codePoints[i] = latin1Codes[i];
    return codePoints;
  };

  env.decodeLatin1CodesToString = function (latin1Codes) {
    // API stability level: 1 - Experimental
    // XXX do documentation (latin-1 = iso-8859-1)
    // quicker than using `String.fromCodePoint.apply(String, codePoints)`
    //   (and 32766 was the amount limit of argument for a function call).
    // latin1Codes = [...]
    //   an array of latin-1 codes (uint8)
    // returns an array of code points (uint32)
    var i = 0, l = latin1Codes.length, s = "";
    for (; i < l; i += 1) s += String.fromCharCode(latin1Codes[i]);
    return s;
  };

}(this.env));
