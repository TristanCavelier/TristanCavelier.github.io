/*jslint indent: 2 */
(function (env) {
  "use strict";

  /*! Copyright (c) 2015-2016 Tristan Cavelier <t.cavelier@free.fr>
      This program is free software. It comes without any warranty, to
      the extent permitted by applicable law. You can redistribute it
      and/or modify it under the terms of the Do What The Fuck You Want
      To Public License, Version 2, as published by Sam Hocevar. See
      http://www.wtfpl.net/ for more details. */

  /*jslint vars: true */
  var info = function () { console.info.apply(console, arguments); };
  var error = function () { console.error.apply(console, arguments); };
  function test(name, timeout, expected, testFn) {
    var res = [], timer;
    function end() {
      if (timer === undefined) return error("test `" + name + "`, `end` called twice");
      timer = clearTimeout(timer);  // timer should be set to undefined
      if (JSON.stringify(res) !== JSON.stringify(expected)) {
        error("test `" + name + "`, result `" + JSON.stringify(res) + "` !== `" + JSON.stringify(expected) + "` expected");
      }
    }
    timer = setTimeout(function () {
      try { if (typeof end.onbeforetimeout === "function") end.onbeforetimeout(); }
      catch (e) { error("test: " + name + ", error on before timeout ! `" + e + "`"); }
      if (timer === undefined) return;  // it has ended in before timeout
      error("test `" + name + "`, timeout ! result `" + JSON.stringify(res) + "` <-> `" + JSON.stringify(expected) + "` expected");
    }, timeout);
    setTimeout(function () {
      try { testFn(res, end); }
      catch (e) { error("test `" + name + "`, error ! result `" + e + "`"); }
    });
  }

  function readBlobAs(as, blob, callback) {
    /*global FileReader */
    var fr = new FileReader();
    fr.onload = function (e) { return callback(undefined, e.target.result); };
    fr.onerror = function () { return callback(new Error("unable to read blob as text")); };
    fr.onabort = function () { return callback(new Error("cancelled")); };
    fr["readAs" + as](blob);
  }
  function nativeSoftDecodeUtf8BytesToText(bytes, callback) {
    readBlobAs("Text", new Blob([new Uint8Array(bytes).buffer]), callback);
  }
  function nativeSoftEncodeTextToUtf8Bytes(text, callback) {
    readBlobAs("ArrayBuffer", new Blob([text]), callback);
  }

  function bytesToJs(bytes) {
    return "[" + bytes.map(function (v) { return "0x" + v.toString(16); }).join(",") + "]";
  }
  function textToShorts(text) {
    var i = 0, r = [];
    for (; i < text.length; i += 1) r.push(text.charCodeAt(i));
    return r;
  }

  function randBytes(length) {
    var r = [], i = 0;
    while (i++ < length) r.push(parseInt(Math.random() * 256, 10));
    return r;
  }
  function randText(length) {
    var r = [], i = 0;
    while (i++ < length) r.push(parseInt(Math.random() * 65536, 10));
    return String.fromCharCode.apply(String, r);
  }
  function textToCodePoints(text) {
    var codes = [], i = 0, c;
    while (i < text.length) {
      c = text.codePointAt(i);
      if (c < 0x10000) i += 1;
      else i += 2;
      codes.push(c);
    }
    return codes;
  }

  function testSoftDecodeUtf8BytesToString(bytes) {
    nativeSoftDecodeUtf8BytesToText(bytes, function (err, text) {
      test("unicode " + bytesToJs(bytes), 300, textToCodePoints(text), function (res, end) {
        res.push.apply(res, env.decodeUtf8(bytes));
        end();
      });
    });
  }
  function testSoftEncodeStringToUtf8Bytes(text) {
    nativeSoftEncodeTextToUtf8Bytes(text, function (err, bytes) {
      test("unicode " + JSON.stringify(text) + " " + bytesToJs(textToShorts(text)), 300, Array.from(new Uint8Array(bytes)), function (res, end) {
        res.push.apply(res, env.encodeStringToUtf8Bytes(text));
        end();
      });
    });
  }
  function testFromCodePoint(point) {
    var r;
    try { r = String.fromCodePoint(point); } catch (e) { r = e.message; }
    test("unicode point 0x" + (point).toString(16), 300, [r], function (res, end) {
      try { res.push(env.encodeCodePointToString(point)); } catch (e) { res.push(e.message); }
      end();
    });
  }

  //////////////////////////////////////////////
  // Unicode tests
  testSoftDecodeUtf8BytesToString([0x31]);  // "1"
  testSoftDecodeUtf8BytesToString([0xC3, 0xA9]);  // "é";
  testSoftDecodeUtf8BytesToString([0xC2, 0x80]);  // String.fromCharCode(128);
  testSoftDecodeUtf8BytesToString([0xA9]);  // String.fromCharCode(65533);
  testSoftDecodeUtf8BytesToString([0xE8]);
  testSoftDecodeUtf8BytesToString([0xD8, 0x37, 0x22]);  // "\uFFFF7\""
  testSoftDecodeUtf8BytesToString([0xC3, 0xA9, 0xA9, 0xA9]);
  testSoftDecodeUtf8BytesToString([0xc0,0x9d]);
  testSoftDecodeUtf8BytesToString([0xc1,0x98]);
  testSoftDecodeUtf8BytesToString([0xf6,0x84,0x93,0xb6]);

  // 0xe1-0xf3 0x80-0xbf
  testSoftDecodeUtf8BytesToString([0xe1, 0x80]);
  testSoftDecodeUtf8BytesToString([0xf3, 0xbf]);

  // 0xe0 0x80-0x9f 0x80-0xbf
  testSoftDecodeUtf8BytesToString([0xe0,0x80,0x80]);
  testSoftDecodeUtf8BytesToString([0xe0,0x9f,0xbf]);
  // 0xed 0xa0-0xbf 0x80-0xbf
  testSoftDecodeUtf8BytesToString([0xed,0xa0,0x80]);
  testSoftDecodeUtf8BytesToString([0xed,0xbf,0xbf]);

  testSoftDecodeUtf8BytesToString([0xed,0x80,0x80]);
  testSoftDecodeUtf8BytesToString([0xed,0x9f,0xbf]);
  testSoftDecodeUtf8BytesToString([0xe0,0xa0,0x80]);
  testSoftDecodeUtf8BytesToString([0xe0,0xbf,0xbf]);

  testSoftDecodeUtf8BytesToString([0xee,0x97,0xa8]);

  //testSoftDecodeUtf8BytesToString(randBytes(1));
  //testSoftDecodeUtf8BytesToString(randBytes(2));
  //testSoftDecodeUtf8BytesToString(randBytes(3));
  //testSoftDecodeUtf8BytesToString(randBytes(4));
  testSoftDecodeUtf8BytesToString(randBytes(Math.random() * 100));

  testSoftEncodeStringToUtf8Bytes("a");
  testSoftEncodeStringToUtf8Bytes("eacute is é");
  testSoftEncodeStringToUtf8Bytes("日本語");
  testSoftEncodeStringToUtf8Bytes("\udfff");
  testSoftEncodeStringToUtf8Bytes("\ue000");
  testSoftEncodeStringToUtf8Bytes(String.fromCharCode(0x5359,0xdc39));
  testSoftEncodeStringToUtf8Bytes(randText(Math.random() * 100));

  //testFromCodePoint(0x00);
  //testFromCodePoint(0x20);
  //testFromCodePoint(0x7F);
  //testFromCodePoint(0x80);
  //testFromCodePoint(0x7FF);
  //testFromCodePoint(0x800);
  //testFromCodePoint(0xD7FF);
  //testFromCodePoint(0xD800);
  //testFromCodePoint(0xDFFF);
  //testFromCodePoint(0xE000);
  //testFromCodePoint(0xFEFF);
  //testFromCodePoint(0xFFFE);
  //testFromCodePoint(0xFFFF);
  //testFromCodePoint(0x10000);
  //testFromCodePoint(0x10FFFF);
  //testFromCodePoint(0x110000);
  //testFromCodePoint(0x1FFFFF);
  //testFromCodePoint(0xFFFFFF);
  //testFromCodePoint(parseInt(Math.random() * 0x1000000, 10));

}(this.env));
