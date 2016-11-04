/*jslint indent: 2 */
(function envBase64(env) {
  "use strict";

  /*! env.base64.js Version 1.0.0

      Copyright (c) 2015-2016 Tristan Cavelier <t.cavelier@free.fr>
      This program is free software. It comes without any warranty, to
      the extent permitted by applicable law. You can redistribute it
      and/or modify it under the terms of the Do What The Fuck You Want
      To Public License, Version 2, as published by Sam Hocevar. See
      http://www.wtfpl.net/ for more details. */

  // provides:
  //   env.base64StandardEncodeScheme
  //   env.base64UrlEncodeScheme
  //
  //   env.parseBase64SchemeForDecoding
  //   env.parseBase64SchemeForStringDecoding
  //   env.decodeBase64ChunkAlgorithm
  //   env.decodeBase64
  //   env.decodeBase64String
  //   env.Base64DecoderIo
  //   env.newBase64DecoderIo
  //
  //   env.parseBase64SchemeForEncoding
  //   env.parseBase64SchemeForStringEncoding
  //   env.encodeBase64ChunkAlgorithm
  //   env.encodeBase64
  //   env.encodeBase64ToString
  //   env.Base64EncoderIo
  //   env.newBase64EncoderIo

  if (env.registerLib) env.registerLib(envBase64);

  env.base64StandardEncodeScheme = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  env.base64UrlEncodeScheme = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

  function parseBase64SchemeForDecoding(scheme) {
    // scheme = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/" +
    //          "=" +  // padding (optional)
    //          " \t\r\n"  // ignored values (optional)
    // returns {65:0,66:1,...43:62,47:63,61:64,32:65,9:66,13:67,10:68}
    var i = 0, d = {}, l = scheme.length;
    for (; i < l; i += 1) d[scheme.charCodeAt(i)] = i;
    if (i <= 64) d[61] = 64;
    return d;
  }
  env.parseBase64SchemeForDecoding = parseBase64SchemeForDecoding;

  function parseBase64SchemeForStringDecoding(scheme) {
    // scheme = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/" +
    //          "=" +  // padding (optional)
    //          " \t\r\n"  // ignored values (optional)
    // returns {A:0,B:1,..."+":62,"/":63,"=":64," ":65,"\t":66,"\r":67,"\n":68}
    var i = 0, d = {}, l = scheme.length;
    for (; i < l; i += 1) d[scheme[i]] = i;
    if (i <= 64) d["="] = 64;
    return d;
  }
  env.parseBase64SchemeForStringDecoding = parseBase64SchemeForStringDecoding;

  function decodeBase64ChunkAlgorithm(codes, bytes, cache, schemeCodeMap, o, close) {
    // codes = [...]
    //   bytes to decode
    // bytes = []
    //   where decoded bytes will be written
    // cache = [0, 0, 0, 0, 0]
    //   used by the algorithm
    // schemeCodeMap = {  // the algorithm assumes it perfect
    //     // X: 0-63 char to 6bit values
    //     // X: 64 padding char
    //     // X: >=65 chars to ignore
    //     A:0,B:1,C:2,D:3,E:4,F:5,G:6,H:7,I:8,J:9,K:10,L:11,M:12,
    //     N:13,O:14,P:15,Q:16,R:17,S:18,T:19,U:20,V:21,W:22,X:23,Y:24,Z:25,
    //     a:26,b:27,c:28,d:29,e:30,f:31,g:32,h:33,i:34,j:35,k:36,l:37,m:38,
    //     n:39,o:40,p:41,q:42,r:43,s:44,t:45,u:46,v:47,w:48,x:49,y:50,z:51,
    //     0:52,1:53,2:54,3:55,4:56,5:57,6:58,7:59,8:60,9:61,
    //     "+":62,"/":63,  // standard way
    //     //"-":62,"_":63,  // url way
    //     "=":64,
    //     " ":65,"\t":66,"\r":67,"\n":68
    //   }
    // o.invalidByteError({codes, bytes, cache, index}) - called on invalid byte
    // o.expectedPaddingError({codes, bytes, cache, index}) - called on expected padding
    // o.unexpectedPaddingError({codes, bytes, cache, index}) - called on unexpected padding
    // o.unexpectedEndOfDataError({codes, bytes, cache, schemeCodeMap, index, requiredCodeAmount, requiredCodeIndex, lastCodes}) - called on unexpected end of data
    // close = false (optional)
    // returns bytes of decoded base64

    var i = 0, l = codes.length, code, byte, a, b, c;
    for (; i < l; i += 1) {
      code = schemeCodeMap[byte = codes[i]];
      if (!(code >= 0)) o.invalidByteError({codes: codes, bytes: bytes, cache: cache, index: i});
      else switch (cache[0]) {
        case 1:  // after first byte state
          if (code === 64) o.unexpectedPaddingError({codes: codes, bytes: bytes, cache: cache, index: i});
          else if (code >= 65) {}
          else { bytes.push(((cache[1] << 2) & 0xFC) | ((code >>> 4) & 0x03)); cache[3] = byte; cache[1] = code; cache[0] = 2; }
          break;
        case 2:  // after second byte state
          if (code === 64) { cache[4] = byte; cache[0] = 4; }
          else if (code >= 65) {}
          else { bytes.push(((cache[1] << 4) & 0xF0) | ((code >>> 2) & 0x0F)); cache[4] = byte; cache[1] = code; cache[0] = 3; }
          break;
        case 3:  // after third byte state
          if (code === 64) { cache[4] = byte; cache[0] = 0; }
          else if (code >= 65) {}
          else { bytes.push(((cache[1] << 6) & 0xC0) | (code & 0x3F)); cache[0] = 0; }
          break;
        case 4:  // expect padding state
          if (code === 64) cache[0] = 0;
          else if (code >= 65) {}
          else o.expectedPaddingError({codes: codes, bytes: bytes, cache: cache, schemeCodeMap: schemeCodeMap, index: i});
          break;
        default:
          if (code === 64) o.unexpectedPaddingError({codes: codes, bytes: bytes, cache: cache, schemeCodeMap: schemeCodeMap, index: i});
          else if (code >= 65) {}
          else { cache[2] = byte; cache[1] = code; cache[0] = 1; }
      }
    }
    if (close) {
      switch (cache[0]) {
        case 1: o.unexpectedEndOfDataError({codes: codes, bytes: bytes, cache: cache, schemeCodeMap: schemeCodeMap, index: codes.length, requiredCodeAmount: 4, requiredCodeIndex: 1, lastCodes: [cache[2]]}); break;
        case 2: o.unexpectedEndOfDataError({codes: codes, bytes: bytes, cache: cache, schemeCodeMap: schemeCodeMap, index: codes.length, requiredCodeAmount: 4, requiredCodeIndex: 2, lastCodes: [cache[2], cache[3]]}); break;
        case 3:
        case 4: o.unexpectedEndOfDataError({codes: codes, bytes: bytes, cache: cache, schemeCodeMap: schemeCodeMap, index: codes.length, requiredCodeAmount: 4, requiredCodeIndex: 3, lastCodes: [cache[2], cache[3], cache[4]]}); break;
      }
    }
    return bytes;
  }
  env.decodeBase64ChunkAlgorithm = decodeBase64ChunkAlgorithm;

  function decodeBase64(bytes) {
    return env.decodeBase64ChunkAlgorithm(bytes, [], [], {
      65:0,66:1,67:2,68:3,69:4,70:5,71:6,72:7,73:8,74:9,75:10,76:11,77:12,
      78:13,79:14,80:15,81:16,82:17,83:18,84:19,85:20,86:21,87:22,88:23,89:24,90:25,  // A-Z
      97:26,98:27,99:28,100:29,101:30,102:31,103:32,104:33,105:34,106:35,107:36,108:37,109:38,
      110:39,111:40,112:41,113:42,114:43,115:44,116:45,117:46,118:47,119:48,120:49,121:50,122:51,  // a-z
      48:52,49:53,50:54,51:55,52:56,53:57,54:58,55:59,56:60,57:61,  // 0-9
      43:62,47:63,  // "+/" standard way
      //45:62,95:63,  // "-_" url way
      61:64,  // "=" padding value
      32:65,9:66,13:67,10:68  // " \t\r\n" ignored values
      // built by `parseBase64SchemeForDecoding("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/= \t\r\n")`
    }, {
      invalidByteError: function (v) { var e = new Error("invalid byte"); e.index = v.index; throw e; },
      expectedPaddingError: function (o) { var e = new Error("expected padding"); e.index = o.index; throw e; },
      unexpectedPaddingError: function (v) { var e = new Error("unexpected padding"); e.index = v.index; throw e; },
      unexpectedEndOfDataError: function (o) {
        if (o.lastCodes.length < 2)
          throw new Error("unexpected end of data");
        o.cache.splice(0);
      }
    }, true);
  }
  env.decodeBase64 = decodeBase64;

  function decodeBase64String(string) {
    return env.decodeBase64ChunkAlgorithm(string, [], [], {
      A:0,B:1,C:2,D:3,E:4,F:5,G:6,H:7,I:8,J:9,K:10,L:11,M:12,
      N:13,O:14,P:15,Q:16,R:17,S:18,T:19,U:20,V:21,W:22,X:23,Y:24,Z:25,
      a:26,b:27,c:28,d:29,e:30,f:31,g:32,h:33,i:34,j:35,k:36,l:37,m:38,
      n:39,o:40,p:41,q:42,r:43,s:44,t:45,u:46,v:47,w:48,x:49,y:50,z:51,
      0:52,1:53,2:54,3:55,4:56,5:57,6:58,7:59,8:60,9:61,
      "+":62,"/":63,  // standard way
      //"-":62,"_":63,  // url way
      "=":64,  // padding value
      " ":65,"\t":66,"\r":67,"\n":68  // ignored values
      // built by `parseBase64SchemeForStringDecoding("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/= \t\r\n")`
    }, {
      invalidByteError: function (v) { var e = new Error("invalid byte"); e.index = v.index; throw e; },
      expectedPaddingError: function (o) { var e = new Error("expected padding"); e.index = o.index; throw e; },
      unexpectedPaddingError: function (v) { var e = new Error("unexpected padding"); e.index = v.index; throw e; },
      unexpectedEndOfDataError: function (o) {
        if (o.lastCodes.length < 2)
          throw new Error("unexpected end of data");
        o.cache.splice(0);
      }
    }, true);
  }
  env.decodeBase64String = decodeBase64String;

  function Base64DecoderIo(scheme) {
    // scheme = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/= \t\r\n" (optional)
    this.cache = [];
    this.value = [];
    if (scheme) this.schemeCodeMap = env.parseBase64SchemeForDecoding(scheme);
  }
  Base64DecoderIo.prototype.schemeCodeMap = parseBase64SchemeForDecoding("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/= \t\r\n");
  //Base64DecoderIo.prototype.filled = false;
  Base64DecoderIo.prototype.write = function (bytes) {
    env.decodeBase64ChunkAlgorithm(bytes, this.value, this.cache, this.schemeCodeMap, this, false);
    //if (v.length) this.filled = true;
  };
  Base64DecoderIo.prototype.closed = false;
  Base64DecoderIo.prototype.close = function () {
    env.decodeBase64ChunkAlgorithm([], this.value, this.cache, this.schemeCodeMap, this, true);
    //if (v.length) this.filled = true;
    this.closed = true;
  };
  Base64DecoderIo.prototype.read = function (count) {
    var v = this.value, vv;
    if (count === undefined) vv = this.value.splice(0);
    else vv = this.value.splice(0, count);
    //if (!v.length) this.filled = false;
    return vv;
  };
  Base64DecoderIo.prototype.invalidByteError = function (o) {
    var e = new Error("invalid byte");
    e.index = o.index;
    throw e;
  };
  Base64DecoderIo.prototype.expectedPaddingError = function (o) {
    var e = new Error("expected padding");
    e.index = o.index;
    throw e;
  };
  Base64DecoderIo.prototype.unexpectedPaddingError = function (o) {
    var e = new Error("unexpected padding");
    e.index = o.index;
    throw e;
  };
  Base64DecoderIo.prototype.unexpectedEndOfDataError = function (o) {
    if (o.lastCodes.length < 2)
      throw new Error("unexpected end of data");
    o.cache.splice(0);
  };
  env.Base64DecoderIo = Base64DecoderIo;
  env.newBase64DecoderIo = function () { var c = env.Base64DecoderIo, o = Object.create(c.prototype); c.apply(o, arguments); return o; };


  function parseBase64SchemeForEncoding(scheme) {
    // scheme = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/" +
    //          "="  // padding (optional)
    // returns [65,66,...,43,47,61]
    var i = 0, l = scheme.length, a = new Array(l);
    for (; i < l; i += 1) a[i] = scheme.charCodeAt(i);
    if (i <= 64) a[64] = 61;
    return a;
  }
  env.parseBase64SchemeForEncoding = parseBase64SchemeForEncoding;

  function parseBase64SchemeForStringEncoding(scheme) {
    // scheme = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/" +
    //          "="  // padding (optional)
    // returns ["A","B",...,"+","/","="]
    var i = 0, l = scheme.length, a = new Array(l);
    for (; i < l; i += 1) a[i] = scheme[i];
    if (i <= 64) a[64] = "=";
    return a;
  }
  env.parseBase64SchemeForStringEncoding = parseBase64SchemeForStringEncoding;

  function encodeBase64ChunkAlgorithm(bytes, codes, cache, schemeCodes, close) {
    // bytes = [...]
    //   array of byte numbers
    // codes = []
    //   where encoded codes will be written
    // cache = [0, 0]
    //   used by the algorithm
    // schemeCodes = [  // the algorithm assumes it perfect
    //     65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,  // A-Z
    //     97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122, // a-z
    //     48,49,50,51,52,53,54,55,56,57,  // 0-9
    //     43,47,
    //     61  // padding value
    //   ]
    // close = false (optional)
    // returns bytes of encoded base64
    var i = 0, l = bytes.length;
    for (; i < l; i += 1) {
      switch (cache[0]) {
        case 2:
          codes.push(schemeCodes[cache[1] | (bytes[i] >>> 4)]);
          cache[1] = (bytes[i] << 2) & 0x3C;
          cache[0] = 3;
          break;
        case 3:
          codes.push(
            schemeCodes[cache[1] | (bytes[i] >>> 6)],
            schemeCodes[bytes[i] & 0x3F]
          );
          cache[0] = 0;
          break;
        default:
          codes.push(schemeCodes[bytes[i] >>> 2]);
          cache[1] = (bytes[i] << 4) & 0x30;
          cache[0] = 2;
      }
    }
    if (close) {
      switch (cache[0]) {
        case 2:
          codes.push(schemeCodes[cache[1]], schemeCodes[64], schemeCodes[64]);
          cache[0] = 0;
          break;
        case 3:
          codes.push(schemeCodes[cache[1]], schemeCodes[64]);
          cache[0] = 0;
      }
    }
    return codes;
  }
  env.encodeBase64ChunkAlgorithm = encodeBase64ChunkAlgorithm;

  function encodeBase64(bytes) {
    return env.encodeBase64ChunkAlgorithm(bytes, [], [0, 0], [
      65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,  // A-Z
      97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122, // a-z
      48,49,50,51,52,53,54,55,56,57,  // 0-9
      43,47,  // standard way
      //45,95,  // url way
      61  // padding value
      // built by `parseBase64SchemeForEncoding("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=")`
    ], true);
  }
  env.encodeBase64 = encodeBase64;

  function encodeBase64ToString(bytes) {
    return env.encodeBase64ChunkAlgorithm(bytes, [], [0, 0], "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", true).join("");
  }
  env.encodeBase64ToString = encodeBase64ToString;

  function Base64EncoderIo(scheme) {
    // scheme = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/" (optional)
    this.cache = [0, 0];
    this.value = [];
    if (scheme) this.schemeCodes = env.parseBase64SchemeForEncoding(scheme);
  }
  Base64EncoderIo.prototype.schemeCodes = parseBase64SchemeForEncoding("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/");
  //Base64EncoderIo.prototype.filled = false;
  Base64EncoderIo.prototype.write = function (bytes) {
    env.encodeBase64ChunkAlgorithm(bytes, this.value, this.cache, this.schemeCodes, false);
    //if (v.length) this.filled = true;
  };
  Base64EncoderIo.prototype.closed = false;
  Base64EncoderIo.prototype.close = function () {
    env.encodeBase64ChunkAlgorithm([], this.value, this.cache, this.schemeCodes, true);
    //if (v.length) this.filled = true;
    this.closed = true;
  };
  Base64EncoderIo.prototype.read = function (count) {
    var v = this.value, vv;
    if (count === undefined) vv = this.value.splice(0);
    else vv = this.value.splice(0, count);
    //if (!v.length) this.filled = false;
    return vv;
  };
  env.Base64EncoderIo = Base64EncoderIo;
  env.newBase64EncoderIo = function () { var c = env.Base64EncoderIo, o = Object.create(c.prototype); c.apply(o, arguments); return o; };

}(this.env));
