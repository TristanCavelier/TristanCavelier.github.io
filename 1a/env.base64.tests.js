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

  function nativeSoftDecodeBase64String(text) {
    return Array.from(atob(text)).map(function (c) { return c.charCodeAt(0); });
  }
  function nativeEncodeBase64ToString(bytes) {
    return btoa(String.fromCharCode.apply(String, bytes));
  }

  function bytesToJs(bytes) {
    return "[" + bytes.map(function (v) { return "0x" + v.toString(16); }).join(",") + "]";
  }
  function randBytes(length) {
    var r = [], i = 0;
    while (i++ < length) r.push(parseInt(Math.random() * 256, 10));
    return r;
  }

  function testSoftDecodeBase64String(text, exp) {
    if (!exp)
      try { exp = nativeSoftDecodeBase64String(text); } catch (e) { exp = [e.message]; }
    test("base64 " + text, 300, exp, function (res, end) {
      try { exp = env.decodeBase64String(text); } catch (e) { exp = [e.message]; }
      res.push.apply(res, exp);
      end();
    });
  }
  function testEncodeBase64ToString(bytes, exp) {
    if (!exp)
      try { exp = [nativeEncodeBase64ToString(bytes)]; } catch (e) { exp = [e.message]; }
    test("base64 " + bytesToJs(bytes), 300, exp, function (res, end) {
      try { exp = [env.encodeBase64ToString(bytes)]; } catch (e) { exp = [e.message]; }
      res.push.apply(res, exp);
      end();
    });
  }

  //////////////////////////////////////////////
  // Base64 tests
  testSoftDecodeBase64String("AAAA");
  testSoftDecodeBase64String("AAA=");
  testSoftDecodeBase64String("AA==");
  testSoftDecodeBase64String("AA=", [0]);
  testSoftDecodeBase64String("AA", [0]);
  testSoftDecodeBase64String("AbCdEfGhIj+/");
  testSoftDecodeBase64String(nativeEncodeBase64ToString(randBytes(120)));

  testEncodeBase64ToString([0], ["AA=="]);
  testEncodeBase64ToString([0, 1]);
  testEncodeBase64ToString([0, 1, 2]);
  testEncodeBase64ToString([0, 1, 2, 3]);
  testEncodeBase64ToString([0, 1, 2, 3, 4]);
  testEncodeBase64ToString([0, 1, 2, 3, 4, 5]);
  testEncodeBase64ToString(randBytes(120));

}(this.env));
