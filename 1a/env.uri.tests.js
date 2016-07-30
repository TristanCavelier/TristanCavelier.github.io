/*jslint indent: 2 */
(function (env) {
  "use strict";

  /*! Copyright (c) 2015-2016 Tristan Cavelier <t.cavelier@free.fr>
      This program is free software. It comes without any warranty, to
      the extent permitted by applicable law. You can redistribute it
      and/or modify it under the terms of the Do What The Fuck You Want
      To Public License, Version 2, as published by Sam Hocevar. See
      http://www.wtfpl.net/ for more details. */

  var info = function () { console.info.apply(console, arguments); };
  var error = function () { console.error.apply(console, arguments); };
  function test(name, timeout, expected, testFn) {
    var res = [], timer;
    function end() {
      if (timer === undefined) {
        error("test: " + name);
        return error("`end` called twice");
      }
      timer = clearTimeout(timer);
      if (JSON.stringify(res) !== JSON.stringify(expected)) {
        error("test: " + name);
        error("result `" + JSON.stringify(res) + "` !== `" + JSON.stringify(expected) + "` expected");
      }
    }
    timer = setTimeout(function () {
      error("test: " + name);
      error("timeout");
    }, timeout);
    setTimeout(function () { testFn(res, end); });
  }

  test("ipv4 matches 127.0.0.1", 100, [true], function (res, end) {
    res.push(new RegExp("^" + env.ipv4StringRegExp + "$").test("127.0.0.1"));
    end();
  });
  test("ipv4 does not match ::1", 100, [false], function (res, end) {
    res.push(new RegExp("^" + env.ipv4StringRegExp + "$").test("::1"));
    end();
  });
  test("ipv6 matches ::1", 100, [true], function (res, end) {
    res.push(new RegExp("^" + env.ipv6StringRegExp + "$").test("::1"));
    end();
  });
  test("ipv6 does not match 127.0.0.1", 100, [false], function (res, end) {
    res.push(new RegExp("^" + env.ipv6StringRegExp + "$").test("127.0.0.1"));
    end();
  });
  test("url object http://user:pass@sub.host.com:8080/p/a/t/h?query=string#hash", 100, [
    "href", "http://user:pass@sub.host.com:8080/p/a/t/h?query=string#hash",
    "protocol", "http:",
    "user", "user",
    "password", "pass",
    "hostname", "sub.host.com",
    "port", 8080,
    "subDomain", "sub",
    "domain", "host.com",
    "origin", "http://sub.host.com:8080",
    "pathname", "/p/a/t/h",
    "rawQuery", ["query", "string"],
    "query", {"query": "string"},
    "search", "?query=string",
    "hash", "#hash",
  ], function (res, end) {
    var url = env.parseUrl("http://user:pass@sub.host.com:8080/p/a/t/h?query=string#hash");
    ["href", "protocol", "user", "password", "hostname", "port", "subDomain", "domain", "origin", "pathname", "rawQuery", "query", "search", "hash"].forEach(function (key) {
      res.push(key, url[key]);
    });
    end();
  });


}(this.env));
