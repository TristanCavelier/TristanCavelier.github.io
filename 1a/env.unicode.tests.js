
/*jslint indent: 2 */
(function (env) {
  "use strict";

  /*! Copyright (c) 2015-2017 Tristan Cavelier <t.cavelier@free.fr>
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
    setTimeout(function () {
      timer = setTimeout(function () {
        try { if (typeof end.onbeforetimeout === "function") end.onbeforetimeout(); }
        catch (e) { error("test: " + name + ", error on before timeout ! `" + e + "`"); }
        if (timer === undefined) return;  // it has ended in before timeout
        error("test `" + name + "`, timeout ! result `" + JSON.stringify(res) + "` <-> `" + JSON.stringify(expected) + "` expected");
      }, timeout);
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
  function randPoints(length) {
    var r = [], i = 0;
    while (i++ < length) r.push(parseInt(Math.random() * 0x110000, 10));
    return r;
  }
  function randReservedPoints(length) {
    var r = [], i = 0;
    while (i++ < length) r.push(parseInt(Math.random() * 0x200, 10) + 0xD800);
    return r;
  }
  function randInt32Array(length) {
    var r = [], i = 0;
    while (i++ < length) r.push(parseInt(Math.random() * 0x100000000, 10));
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

  var decodeUtf8 = null;
  nativeSoftDecodeUtf8BytesToText([0xED, 0xB2, 0x02, 0xE8, 0x99, 0x02, 0xE8, 0x99], function (err, text) {
    if (err) return console.error(err);
    if (text === "\uFFFD\uFFFD\x02\uFFFD\x02\uFFFD") return decodeUtf8 = env.decodeUtf8LikeFirefox;
    if (text === "\uFFFD\uFFFD\x02\uFFFD\x02\uFFFD\uFFFD") return decodeUtf8 = env.decodeUtf8LikeChrome;
    console.error(new Error("No match!"));
    return decodeUtf8 = env.decodeUtf8;
  });

  function testSoftDecodeUtf8BytesToString(bytes) {
    nativeSoftDecodeUtf8BytesToText(bytes, function (err, text) {
      test("unicode " + bytesToJs(bytes), 300, textToCodePoints(text), function (res, end) {
        res.push.apply(res, decodeUtf8(bytes));
        end();
      });
    });
  }
  function testSoftEncodeStringToUtf8Bytes(text) {
    nativeSoftEncodeTextToUtf8Bytes(text, function (err, bytes) {
      test("unicode " + JSON.stringify(text) + " " + bytesToJs(textToShorts(text)), 300, Array.from(new Uint8Array(bytes)), function (res, end) {
        res.push.apply(res, env.encodeStringToUtf8(text));
        end();
      });
    });
  }
  function testStringFromCodePoint(point) {
    var r;
    try { r = String.fromCodePoint(point); } catch (e) { r = e.message; }
    test("unicode 0x" + (point).toString(16), 300, [r], function (res, end) {
      try { res.push(env.encodeCodePointToString(point)); } catch (e) { res.push(e.message); }
      end();
    });
  }
  function testStringFromCodePoints(points) {
    var r;
    try { r = String.fromCodePoint.apply(String, points); } catch (e) { r = e.message; }
    test("unicode " + bytesToJs(points), 300, [r], function (res, end) {
      try { res.push(env.encodeCodePointsToString(points)); } catch (e) { res.push(e.message); }
      end();
    });
  }
  function testEncodeCodePointsToUtf16(points) {
    var r;
    try {
      r = String.fromCodePoint.apply(String, points.map(function (p) { return p <= 0x10FFFF ? p : 0xFFFD; }));
      r = [].map.call(r, function (_, i) { return r.charCodeAt(i); });
    } catch (e) { r = e.message; }
    test("unicode " + bytesToJs(points), 300, [r], function (res, end) {
      try { res.push(env.encodeCodePointsToUtf16(points)); } catch (e) { res.push(e.message); }
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
  testSoftDecodeUtf8BytesToString([0xe8,0x7F]);
  testSoftDecodeUtf8BytesToString([0xe8,0x99]);
  testSoftDecodeUtf8BytesToString([0xe8,0xC0]);
  testSoftDecodeUtf8BytesToString([0xe8,0x99,0x2]);
  testSoftDecodeUtf8BytesToString([0x99,0x2]);
  testSoftDecodeUtf8BytesToString([0xed,0x90]);

  // 0xe1-0xef 0x80-0xbf 0x00-0xff
  testSoftDecodeUtf8BytesToString([0xe1,0x80,0x00]);
  testSoftDecodeUtf8BytesToString([0xe1,0x80,0x7F]);
  testSoftDecodeUtf8BytesToString([0xe1,0x80,0x80]);
  testSoftDecodeUtf8BytesToString([0xef,0xbf,0xbf]);
  testSoftDecodeUtf8BytesToString([0xef,0xbf,0xc0]);
  testSoftDecodeUtf8BytesToString([0xef,0xbf,0xff]);

  // 0xed 0x80-0x9f 0x00-0xff
  testSoftDecodeUtf8BytesToString([0xed,0x80,0x00]);
  testSoftDecodeUtf8BytesToString([0xed,0x80,0x7f]);
  testSoftDecodeUtf8BytesToString([0xed,0x80,0x80]);
  testSoftDecodeUtf8BytesToString([0xed,0x80,0xbf]);
  testSoftDecodeUtf8BytesToString([0xed,0x80,0xc0]);
  testSoftDecodeUtf8BytesToString([0xed,0x80,0xff]);
  testSoftDecodeUtf8BytesToString([0xed,0x9f,0x00]);
  testSoftDecodeUtf8BytesToString([0xed,0x9f,0x7f]);
  testSoftDecodeUtf8BytesToString([0xed,0x9f,0x80]);
  testSoftDecodeUtf8BytesToString([0xed,0x9f,0xbf]);
  testSoftDecodeUtf8BytesToString([0xed,0x9f,0xc0]);
  testSoftDecodeUtf8BytesToString([0xed,0x9f,0xff]);

  // 0xed 0xa0-0xbf 0x00-0xff
  testSoftDecodeUtf8BytesToString([0xed,0xa0,0x00]);
  testSoftDecodeUtf8BytesToString([0xed,0xa0,0x7f]);
  testSoftDecodeUtf8BytesToString([0xed,0xa0,0x80]);
  testSoftDecodeUtf8BytesToString([0xed,0xa0,0xbf]);
  testSoftDecodeUtf8BytesToString([0xed,0xa0,0xc0]);
  testSoftDecodeUtf8BytesToString([0xed,0xa0,0xff]);
  testSoftDecodeUtf8BytesToString([0xed,0xbf,0x00]);
  testSoftDecodeUtf8BytesToString([0xed,0xbf,0x7f]);
  testSoftDecodeUtf8BytesToString([0xed,0xbf,0x80]);
  testSoftDecodeUtf8BytesToString([0xed,0xbf,0xbf]);
  testSoftDecodeUtf8BytesToString([0xed,0xbf,0xc0]);
  testSoftDecodeUtf8BytesToString([0xed,0xbf,0xff]);

  // 0xf0-0xf3 0x90-0xbf 0x00-0xff
  testSoftDecodeUtf8BytesToString([0xf0,0x90,0x00]);
  testSoftDecodeUtf8BytesToString([0xf1,0xa8,0x6c]);
  testSoftDecodeUtf8BytesToString([0xf2,0x47,0x72]);
  testSoftDecodeUtf8BytesToString([0xf3,0x22,0xf2]);
  testSoftDecodeUtf8BytesToString([0xf3,0xa8,0x6c]);
  testSoftDecodeUtf8BytesToString([0xf3,0xbf,0xff]);


  testSoftDecodeUtf8BytesToString([0xf2,0x58,0xf2,0x47]);
  testSoftDecodeUtf8BytesToString([0xf3,0x22,0xf2,0x58]);
  testSoftDecodeUtf8BytesToString([0xf3,0x7F,0x6c,0x2d]);

  testSoftDecodeUtf8BytesToString([0xf1,0x00,0x00,0x00]);
  testSoftDecodeUtf8BytesToString([0xf1,0x7F,0x00,0x00]);
  testSoftDecodeUtf8BytesToString([0xf1,0x80,0x00,0x00]);
  testSoftDecodeUtf8BytesToString([0xf1,0x80,0x7F,0x00]);
  testSoftDecodeUtf8BytesToString([0xf1,0x80,0x80,0x00]);
  testSoftDecodeUtf8BytesToString([0xf1,0xBF,0x80,0x00]);
  testSoftDecodeUtf8BytesToString([0xf1,0xC0,0x80,0x00]);
  testSoftDecodeUtf8BytesToString([0xf1,0xFF,0x80,0x00]);
  testSoftDecodeUtf8BytesToString([0xf4,0x80,0xBF,0x00]);
  testSoftDecodeUtf8BytesToString([0xf4,0x80,0xC0,0x00]);
  testSoftDecodeUtf8BytesToString([0xf4,0x80,0xFF,0x00]);
  testSoftDecodeUtf8BytesToString([0xf4,0x8F,0xFF,0x00]);
  testSoftDecodeUtf8BytesToString([0xf4,0x90,0x00,0x00]);
  testSoftDecodeUtf8BytesToString([0xf4,0xBF,0xFF,0x00]);
  testSoftDecodeUtf8BytesToString([0xf3,0xBF,0xFF,0x00]);
  testSoftDecodeUtf8BytesToString([0xf3,0xC0,0xFF,0x00]);

  testSoftDecodeUtf8BytesToString([0xf4,0x7F,0x00,0x32]);
  testSoftDecodeUtf8BytesToString([0xf4,0x80,0x00,0x32]);
  testSoftDecodeUtf8BytesToString([0xf4,0x90,0x00,0x32]);
  testSoftDecodeUtf8BytesToString([0xf4,0x90,0x80,0x32]);
  testSoftDecodeUtf8BytesToString([0xf4,0x90,0xbf,0x32]);
  testSoftDecodeUtf8BytesToString([0xf4,0x90,0xc0,0x32]);
  testSoftDecodeUtf8BytesToString([0xf4,0xbf,0x00,0x32]);
  testSoftDecodeUtf8BytesToString([0xf4,0xbf,0x80,0x32]);
  testSoftDecodeUtf8BytesToString([0xf4,0xbf,0xbf,0x32]);
  testSoftDecodeUtf8BytesToString([0xf4,0xbf,0xc0,0x32]);
  testSoftDecodeUtf8BytesToString([0xf4,0xbf,0xff,0x32]);
  testSoftDecodeUtf8BytesToString([0xf4,0xbf,0x00]);
  testSoftDecodeUtf8BytesToString([0xf4,0xbf,0x7f]);
  testSoftDecodeUtf8BytesToString([0xf4,0xbf,0x80]);
  testSoftDecodeUtf8BytesToString([0xf4,0xbf,0xbf]);
  testSoftDecodeUtf8BytesToString([0xf4,0xbf,0xc0]);
  testSoftDecodeUtf8BytesToString([0xf4,0xbf,0xff]);

  testSoftDecodeUtf8BytesToString([0xf4,0x94,0xab,0x96]);
  testSoftDecodeUtf8BytesToString([0xf4,0xa9,0x80,0x18]);

  testSoftDecodeUtf8BytesToString(randBytes(1));
  testSoftDecodeUtf8BytesToString(randBytes(2));
  testSoftDecodeUtf8BytesToString(randBytes(3));
  testSoftDecodeUtf8BytesToString(randBytes(4));
  testSoftDecodeUtf8BytesToString(randBytes(Math.random() * 100));

  testSoftEncodeStringToUtf8Bytes("a");
  testSoftEncodeStringToUtf8Bytes("eacute is é");
  testSoftEncodeStringToUtf8Bytes("日本語");
  testSoftEncodeStringToUtf8Bytes("\udfff");
  testSoftEncodeStringToUtf8Bytes("\ue000");
  testSoftEncodeStringToUtf8Bytes(String.fromCharCode(0x5359,0xdc39));
  testSoftEncodeStringToUtf8Bytes(String.fromCharCode(
    0x2d8b,0xe21b,0x61b1,0xd3c7,0x1b30,0xf8a9,0x9401,0xfa3b,0x7cc3,0xd988,
    0x5408,0xbc7f,0x124d,0x6f75,0xcfe7,0xd1f7,0xf3f2,0xb3da,0x7c03,0x70cb,
    0x27fd,0x477f,0x2878,0x81e5,0xfc4f,0xc67c,0xea1c,0x9a02,0x26c9,0xf233,
    0x1d9d,0x59f3,0x2b61
  ));
  testSoftEncodeStringToUtf8Bytes(randText(Math.random() * 100));

  // Commented out because env.encodeCodePointToString can use native method
  //testStringFromCodePoint(0x00);
  //testStringFromCodePoint(0x20);
  //testStringFromCodePoint(0x7F);
  //testStringFromCodePoint(0x80);
  //testStringFromCodePoint(0x7FF);
  //testStringFromCodePoint(0x800);
  //testStringFromCodePoint(0xD7FF);
  //testStringFromCodePoint(0xD800);
  //testStringFromCodePoint(0xDFFF);
  //testStringFromCodePoint(0xE000);
  //testStringFromCodePoint(0xFEFF);
  //testStringFromCodePoint(0xFFFE);
  //testStringFromCodePoint(0xFFFF);
  //testStringFromCodePoint(0x10000);
  //testStringFromCodePoint(0x10FFFF);
  //testStringFromCodePoint(0x110000);
  //testStringFromCodePoint(0x1FFFFF);
  //testStringFromCodePoint(0xFFFFFF);
  //testStringFromCodePoint(parseInt(Math.random() * 0x1000000, 10));

  testStringFromCodePoints(randPoints(Math.random() * 20));
  testStringFromCodePoints(randReservedPoints(Math.random() * 20));
  testStringFromCodePoints(randInt32Array(Math.random() * 20));

  testEncodeCodePointsToUtf16(randPoints(Math.random() * 20));
  testEncodeCodePointsToUtf16(randReservedPoints(Math.random() * 20));
  testEncodeCodePointsToUtf16(randInt32Array(Math.random() * 20));

  // XXX how to test encodeCodePointsToUtf8 ?

}(this.env));
