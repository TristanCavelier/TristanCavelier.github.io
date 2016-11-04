/*jslint indent: 2 */
(function envQuotedPrintable(env) {
  "use strict";

  /*! env.quoted-printable.js Version 1.0.0

      Copyright (c) 2015-2016 Tristan Cavelier <t.cavelier@free.fr>
      This program is free software. It comes without any warranty, to
      the extent permitted by applicable law. You can redistribute it
      and/or modify it under the terms of the Do What The Fuck You Want
      To Public License, Version 2, as published by Sam Hocevar. See
      http://www.wtfpl.net/ for more details. */

  // provides:
  //   env.parseQuotedPrintableSchemeForDecoding
  //   env.decodeQuotedPrintableChunkAlgorithm
  //   env.decodeQuotedPrintable
  //   env.QuotedPrintableDecoderIo
  //   env.newQuotedPrintableDecoderIo

  if (env.registerLib) env.registerLib(envQuotedPrintable);

  function parseQuotedPrintableSchemeForDecoding(scheme) {
    // scheme = "0123456789ABCDEF" +  // hexadecimal chars
    //          "=" +  // start hexadecimal value (optional)
    //          "\r" +  // ignored char (optional)
    //          "\n"  // closing ignorance, ignored char (optional)
    // returns {48:0,49:1,..,57:9,97:10,..,102:15,61:16,13:17,10:18}
    var i = 0, d = {}, l = scheme.length;
    for (; i < l; i += 1) d[scheme.charCodeAt(i)] = i;
    if (i <= 15) d[61] = 16;
    return d;
  }
  env.parseQuotedPrintableSchemeForDecoding = parseQuotedPrintableSchemeForDecoding;

  function decodeQuotedPrintableChunkAlgorithm(inputBytes, outputBytes, cache, schemeCodeMap, o, close) {
    // inputBytes = [...]
    //   an array of bytes
    // outputBytes = []
    //   where the decoded bytes will be written
    // cache = [0, 0, 0, 0]
    //   used by the algorithm
    // schemeCodeMap = {  // the algorithm assumes it perfect
    //     // X: 0-15 -> hexadecimal values
    //     // X: 16 -> escape char
    //     // X: 17 -> char to ignore
    //     // X: >18 -> char to ignore and stops ignorance
    //     48:0,49:1,..,57:9,  // 0-9
    //     65:10,..,70:15,  // A-F
    //     97:10,..,102:15,  // a-f
    //     61:16,  // =
    //     13:17,  // \r
    //     10:18  // \n
    //   }
    // o.unexpectedEndOfDataError({inputBytes, outputBytes, cache, index, requiredByteAmount, requiredByteIndex, lastBytes}) - called on unexpected end of data
    // o.invalidContinuationCodeError({inputBytes, outputBytes, cache, index, requiredByteAmount, requiredByteIndex, lastBytes}) - called on invalid continuation byte
    // close = false (optional)
    // returns utf8Codes

    var i = 0, l = inputBytes.length, byte, code;
    for (; i < l; i += 1) {
      switch (cache[0]) {
        case 1:
          if ((code = schemeCodeMap[byte = inputBytes[i]]) < 0x10) { cache[3] = byte; cache[1] = code << 4; cache[0] = 2; }
          else if (code > 0x11) cache[0] = 0;  // closing ignorance, ignored byte
          else if (code === 0x11) cache[0] = 3;  // ignored byte
          else o.invalidContinuationByteError({inputBytes: inputBytes, outputBytes: outputBytes, cache: cache, index: i, requiredByteAmount: 3, requiredByteIndex: 1, lastInputBytes: [cache[2], byte]});
          break;
        case 2:
          if ((code = schemeCodeMap[byte = inputBytes[i]]) < 0x10) { outputBytes.push(cache[1] | code); cache[0] = 0; }
          else o.invalidContinuationByteError({inputBytes: inputBytes, outputBytes: outputBytes, cache: cache, index: i, requiredByteAmount: 3, requiredByteIndex: 2, lastInputBytes: [cache[2], cache[3], byte]});
          break;
        case 3:  // ignorance state
          if ((code = schemeCodeMap[inputBytes[i]]) > 0x11) { cache[0] = 0; break; }  // closing ignorance
          else if (code === 0x11) break;  // continue next ignorance
          else cache[0] = 0;  // fallthrough first state
        default:
          if (schemeCodeMap[byte = inputBytes[i]] === 0x10) { cache[0] = 1; cache[2] = byte; }
          else outputBytes.push(byte);
      }
    }
    if (close) {
      switch (cache[0]) {
        case 1: o.unexpectedEndOfDataError({inputBytes: inputBytes, outputBytes: outputBytes, cache: cache, index: i, requiredByteAmount: 3, requiredByteIndex: 1, lastInputBytes: [cache[2]]}); break;
        case 2: o.unexpectedEndOfDataError({inputBytes: inputBytes, outputBytes: outputBytes, cache: cache, index: i, requiredByteAmount: 3, requiredByteIndex: 2, lastInputBytes: [cache[2], cache[3]]}); break;
      }
    }
    return outputBytes;
  }
  env.decodeQuotedPrintableChunkAlgorithm = decodeQuotedPrintableChunkAlgorithm;

  function decodeQuotedPrintable(bytes) {
    // decodeUtf8ToString(decodeQuotedPrintable(bytes))
    return env.decodeQuotedPrintableChunkAlgorithm(bytes, [], [0, 0, 0, 0], {
      48:0,49:1,50:2,51:3,52:4,53:5,54:6,55:7,56:8,57:9,  // 0-9
      65:10,66:11,67:12,68:13,69:14,70:15,  // A-F
      97:10,98:11,99:12,100:13,101:14,102:15,  // a-f
      61:16,  // =
      13:17,10:18  // \r\n
      // built by a mix of `parseQuotedPrintableSchemeForDecoding("0123456789ABCDEF=\r\n")`
      //   and  `parseQuotedPrintableSchemeForDecoding("0123456789abcdef=\r\n")`
    }, {
      invalidContinuationByteError: function (o) { o.outputBytes.push.apply(o.outputBytes, o.lastInputBytes); o.cache.splice(0); },
      unexpectedEndOfDataError: function (o) { if (o.lastInputBytes.length > 1) o.outputBytes.push.apply(o.outputBytes, o.lastInputBytes); }
    }, true);
  }
  env.decodeQuotedPrintable = decodeQuotedPrintable;

  function QuotedPrintableDecoderIo(scheme) {
    // scheme = "0123456789ABCDEF=\r\n" (optional)
    this.cache = [0, 0, 0, 0];
    this.value = [];
    if (scheme) this.schemeCodeMap = env.parseQuotedPrintableSchemeForDecoding(scheme);
  }
  QuotedPrintableDecoderIo.prototype.schemeCodeMap = {
    48:0,49:1,50:2,51:3,52:4,53:5,54:6,55:7,56:8,57:9,  // 0-9
    65:10,66:11,67:12,68:13,69:14,70:15,  // A-F
    97:10,98:11,99:12,100:13,101:14,102:15,  // a-f
    61:16,  // =
    13:17,10:18  // \r\n
    // built by a mix of `parseQuotedPrintableSchemeForDecoding("0123456789ABCDEF=\r\n")`
    //   and  `parseQuotedPrintableSchemeForDecoding("0123456789abcdef=\r\n")`
  };
  QuotedPrintableDecoderIo.prototype.write = function (bytes) {
    env.decodeQuotedPrintableChunkAlgorithm(bytes, this.value, this.cache, this.schemeCodeMap, this, false);
  };
  QuotedPrintableDecoderIo.prototype.closed = false;
  QuotedPrintableDecoderIo.prototype.close = function () {
    env.decodeQuotedPrintableChunkAlgorithm([], this.value, this.cache, this.schemeCodeMap, this, true);
    this.closed = true;
  };
  QuotedPrintableDecoderIo.prototype.read = function (count) {
    if (count === undefined) return this.value.splice(0);
    return this.value.splice(0, count);
  };
  QuotedPrintableDecoderIo.prototype.invalidContinuationByteError = function (o) {
    o.outputBytes.push.apply(o.outputBytes, o.lastInputBytes);
    o.cache.splice(0);
  };
  QuotedPrintableDecoderIo.prototype.unexpectedEndOfDataError = function (o) {
    if (o.lastInputBytes.length > 1) o.outputBytes.push.apply(o.outputBytes, o.lastInputBytes);
    o.cache.splice(0);
  };
  env.QuotedPrintableDecoderIo = QuotedPrintableDecoderIo;
  env.newQuotedPrintableDecoderIo = function () { var c = env.QuotedPrintableDecoderIo, o = Object.create(c.prototype); c.apply(o, arguments); return o; };

}(this.env));
