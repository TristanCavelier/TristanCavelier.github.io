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
    if (i <= 64) d["="] = 64;
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

  function decodeBase64ChunkAlgorithm(bytes, cache, schemeCodeMap, o, close) {
    // bytes = [...]
    //   bytes to decode
    // cache = []
    //   used by the algorithm
    // schemeCodeMap = {
    //     A:0,B:1,C:2,D:3,E:4,F:5,G:6,H:7,I:8,J:9,K:10,L:11,M:12,
    //     N:13,O:14,P:15,Q:16,R:17,S:18,T:19,U:20,V:21,W:22,X:23,Y:24,Z:25,
    //     a:26,b:27,c:28,d:29,e:30,f:31,g:32,h:33,i:34,j:35,k:36,l:37,m:38,
    //     n:39,o:40,p:41,q:42,r:43,s:44,t:45,u:46,v:47,w:48,x:49,y:50,z:51,
    //     0:52,1:53,2:54,3:55,4:56,5:57,6:58,7:59,8:60,9:61,
    //     "+":62,"/":63,  // standard way
    //     //"-":62,"_":63,  // url way
    //     "=":64,  // padding value
    //     " ":65,"\t":66,"\r":67,"\n":68  // ignored values
    //   }
    // o.invalidByteError(XXX)
    // o.unexpectedPaddingError(XXX)
    // o.unexpectedEndOfDataError(XXX)
    // close = false (optional)
    // returns bytes of decoded base64
    var i = 0, l = bytes.length,
        bytes = [],
        code, a, b, c;
    for (; i < l; i += 1) {
      code = schemeCodeMap[bytes[i]];
      if (!(code >= 0)) o.invalidByteError({index: i});
      else if (code === 64 && (cache.length % 4) <= 1) o.unexpectedPaddingError({index: i});
      else if (code >= 65) {}
      else cache.push(code);
    }
    if ((l = cache.length) >= 4) {
      for (i = 0, l -= l % 4; i < l; i += 4) {
        a = ((cache[0] << 2) & 0xFC) | ((cache[1] >>> 4) & 0x03);
        if (cache[2] === 64) bytes.push(a);
        else {
          b = ((cache[1] << 4) & 0xF0) | ((cache[2] >>> 2) & 0x0F);
          if (cache[3] === 64) bytes.push(a, b);
          else {
            c = ((cache[2] << 6) & 0xC0) | (cache[3] & 0x3F);
            bytes.push(a, b, c);
          }
        }
        cache.splice(0, 4);
      }
    }
    if (close && cache.length) o.unexpectedEndOfDataError({index: bytes.length});
    return bytes;
  }
  env.decodeBase64ChunkAlgorithm = decodeBase64ChunkAlgorithm;

  function decodeBase64(bytes) {
    return decodeBase64ChunkAlgorithm(bytes, [], {
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
      unexpectedPaddingError: function (v) { var e = new Error("unexpected padding"); e.index = v.index; throw e; },
      unexpectedEndOfDataError: function () { throw new Error("unexpected end of data"); }
    }, true);
  }
  env.decodeBase64 = decodeBase64;

  function decodeBase64String(string) {
    return decodeBase64ChunkAlgorithm(string, [], {
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
      unexpectedPaddingError: function (v) { var e = new Error("unexpected padding"); e.index = v.index; throw e; },
      unexpectedEndOfDataError: function () { throw new Error("unexpected end of data"); }
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
    var v = this.value;
    v.push.apply(v, env.decodeBase64ChunkAlgorithm(bytes, this.cache, this.schemeCodeMap, this, false));
    //if (v.length) this.filled = true;
  };
  Base64DecoderIo.prototype.closed = false;
  Base64DecoderIo.prototype.close = function () {
    var v = this.value;
    v.push.apply(v, env.decodeBase64ChunkAlgorithm([], this.cache, this.schemeCodeMap, this, true));
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
  Base64DecoderIo.prototype.unexpectedPaddingError = function (o) {
    var e = new Error("unexpected padding");
    e.index = o.index;
    throw e;
  };
  Base64DecoderIo.prototype.unexpectedEndOfDataError = function (o) {
    var e = new Error("unexpected end of data");
    e.index = o.index;
    throw e;
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

  function encodeBase64ChunkAlgorithm(chunk, cache, schemeCodes, close) {
    // chunk = [...]
    //   array of byte numbers
    // cache = []
    //   used by the algorithm
    // schemeCodes = [
    //     65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,  // A-Z
    //     97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122, // a-z
    //     48,49,50,51,52,53,54,55,56,57,  // 0-9
    //     43,47,
    //     61  // padding value
    //   ]
    // close = false (optional)
    // returns bytes of encoded base64
    var codes = [],
        i = 0, l = chunk.length;
    for (; i < l; i += 1) {
      switch (cache.length % 4) {
        case 0:
          cache[0] = chunk[i] >>> 2;
          cache[1] = (chunk[i] << 4) & 0x30;
          break;
        case 1: cache[1] = 0;
        case 2:
          cache[1] |= chunk[i] >>> 4;
          cache[2] = (chunk[i] << 2) & 0x3C;
          break;
        default:
          codes.push(
            schemeCodes[cache[0]],
            schemeCodes[cache[1]],
            schemeCodes[cache[2] | (chunk[i] >>> 6)],
            schemeCodes[chunk[i] & 0x3F]
          );
          cache.splice(0, 3);
      }
    }
    if (close) {
      switch (cache.length % 4) {
        case 0: break;
        case 1: cache[1] = 0;
        case 2:
          codes.push(
            schemeCodes[cache[0]],
            schemeCodes[cache[1]],
            schemeCodes[64],
            schemeCodes[64]
          );
          cache.splice(0, 2);
          break;
        default:
          codes.push(
            schemeCodes[cache[0]],
            schemeCodes[cache[1]],
            schemeCodes[cache[2]],
            schemeCodes[64]
          );
          cache.splice(0, 3);
      }
    }
    return codes;
  }
  env.encodeBase64ChunkAlgorithm = encodeBase64ChunkAlgorithm;

  function encodeBase64(bytes) {
    return encodeBase64ChunkAlgorithm(bytes, [], [
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
    return encodeBase64ChunkAlgorithm(bytes, "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=", true).join("");
  }
  env.encodeBase64ToString = encodeBase64ToString;

  function Base64EncoderIo(scheme) {
    // scheme = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/" (optional)
    this.cache = [];
    this.value = [];
    if (scheme) this.schemeCodes = env.parseBase64SchemeForEncoding(scheme);
  }
  Base64EncoderIo.prototype.schemeCodes = parseBase64SchemeForEncoding("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/");
  //Base64EncoderIo.prototype.filled = false;
  Base64EncoderIo.prototype.write = function (bytes) {
    var v = this.value;
    v.push.apply(v, env.encodeBase64ChunkAlgorithm(bytes, this.cache, this.schemeCodes, false));
    //if (v.length) this.filled = true;
  };
  Base64EncoderIo.prototype.closed = false;
  Base64EncoderIo.prototype.close = function () {
    var v = this.value;
    v.push.apply(v, env.encodeBase64ChunkAlgorithm([], this.cache, this.schemeCodes, true));
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
