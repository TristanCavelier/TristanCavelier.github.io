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

  function readBlobAsText(blob, callback) {
    /*global FileReader */
    var fr = new FileReader();
    fr.onload = function (e) { return callback(undefined, e.target.result); };
    fr.onerror = function () { return callback(new Error("unable to read blob as text")); };
    fr.onabort = function () { return callback(new Error("cancelled")); };
    fr.readAsText(blob);
  }
  function nativeSoftDecodeUtf8BytesToText(bytes, callback) {
    readBlobAsText(new Blob([new Uint8Array(bytes).buffer]), callback);
  }
  function bytesToJs(bytes) {
    return "[" + bytes.map(function (v) { return "0x" + v.toString(16); }).join(",") + "]";
  }
  function randBytes(length) {
    var r = [], i = 0;
    while (i++ < length) r.push(parseInt(Math.random() * 256, 10));
    return r;
  }
  function testSoftDecodeUtf8BytesToText(bytes) {
    nativeSoftDecodeUtf8BytesToText(bytes, function (err, text) {
      test("unicode " + bytesToJs(bytes), 300, [text], function (res, end) {
        res.push(env.softDecodeUtf8BytesToText(bytes));
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
  testSoftDecodeUtf8BytesToText(randBytes(1));
  testSoftDecodeUtf8BytesToText(randBytes(2));
  testSoftDecodeUtf8BytesToText(randBytes(3));
  testSoftDecodeUtf8BytesToText(randBytes(4));
  testSoftDecodeUtf8BytesToText(randBytes(Math.random() * 100));

  // XXX test softEncodeTextToUtf8Bytes

}(this.env));
