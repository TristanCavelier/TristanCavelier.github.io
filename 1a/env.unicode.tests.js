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

  function testSoftDecodeUtf8BytesToText(bytes) {
    nativeSoftDecodeUtf8BytesToText(bytes, function (err, text) {
      test("unicode " + bytesToJs(bytes), 300, [text], function (res, end) {
        res.push(env.softDecodeUtf8BytesToText(bytes));
        end();
      });
    });
  }
  function testSoftEncodeTextToUtf8Bytes(text) {
    nativeSoftEncodeTextToUtf8Bytes(text, function (err, bytes) {
      test("unicode " + JSON.stringify(text) + " " + bytesToJs(textToShorts(text)), 300, Array.from(new Uint8Array(bytes)), function (res, end) {
        res.push.apply(res, env.softEncodeTextToUtf8Bytes(text));
        end();
      });
    });
  }

  //////////////////////////////////////////////
  // Unicode tests
  testSoftDecodeUtf8BytesToText([0x31]);  // "1"
  testSoftDecodeUtf8BytesToText([0xC3, 0xA9]);  // &eacute;
  testSoftDecodeUtf8BytesToText([0xC2, 0x80]);  // String.fromCharCode(128);
  testSoftDecodeUtf8BytesToText([0xA9]);  // String.fromCharCode(65533);
  testSoftDecodeUtf8BytesToText([0xE8]);
  testSoftDecodeUtf8BytesToText([0xD8, 0x37, 0x22]);  // "\uFFFF7\""
  testSoftDecodeUtf8BytesToText([0xC3, 0xA9, 0xA9, 0xA9]);
  testSoftDecodeUtf8BytesToText([0xc0,0x9d]);
  testSoftDecodeUtf8BytesToText([0xc1,0x98]);
  //testSoftDecodeUtf8BytesToText(randBytes(1));
  //testSoftDecodeUtf8BytesToText(randBytes(2));
  //testSoftDecodeUtf8BytesToText(randBytes(3));
  //testSoftDecodeUtf8BytesToText(randBytes(4));
  testSoftDecodeUtf8BytesToText(randBytes(Math.random() * 100));

  testSoftEncodeTextToUtf8Bytes("a");
  testSoftEncodeTextToUtf8Bytes("eacute is é");
  testSoftEncodeTextToUtf8Bytes("日本語");
  testSoftEncodeTextToUtf8Bytes("\udfff");
  testSoftEncodeTextToUtf8Bytes("\ue000");
  testSoftEncodeTextToUtf8Bytes(String.fromCharCode(0x5359,0xdc39));
  testSoftEncodeTextToUtf8Bytes(randText(Math.random() * 100));

}(this.env));
