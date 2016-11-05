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

  function testSoftDecodeQuotedPrintableString(text, exp) {
    readBlobAs("ArrayBuffer", new Blob([text]), function (err, bytes) {
      bytes = new Uint8Array(bytes);
      test("quopri " + text, 300, [exp], function (res, end) {
        try {
          readBlobAs("Text", new Blob([new Uint8Array(env.decodeQuotedPrintable(bytes)).buffer]), function (err, text) {
            res.push(text);
            end();
          });
        } catch (e) {
          res.push(e.message);
          end();
        }
      });
    });
  }

  //////////////////////////////////////////////
  // Quoted printable tests
  testSoftDecodeQuotedPrintableString("a", "a");
  testSoftDecodeQuotedPrintableString("a=", "a");
  testSoftDecodeQuotedPrintableString("==", "=");
  testSoftDecodeQuotedPrintableString("=2", "=2");
  testSoftDecodeQuotedPrintableString("=20", " ");
  testSoftDecodeQuotedPrintableString(" =20", "  ");
  testSoftDecodeQuotedPrintableString(" =20\r\n ", "  \r\n ");
  testSoftDecodeQuotedPrintableString(" =20=\r\n ", "   ");
  testSoftDecodeQuotedPrintableString("g=2h", "g=2h");
  testSoftDecodeQuotedPrintableString("g=2=h", "g=2=h");
  testSoftDecodeQuotedPrintableString("g=2=20", "g=2 ");
  testSoftDecodeQuotedPrintableString("g=2=20\r\n=\n\r=\r\r\n", "g=2 \r\n\r");

}(this.env));
