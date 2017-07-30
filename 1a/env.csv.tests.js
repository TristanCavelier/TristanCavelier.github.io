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
  function testParseCsv(text, expected) {
    test("parse csv " + JSON.stringify(text), 1000, [expected], function (res, end) {
      res.push(env.parseCsv(text));
      end();
    });
  }

  //////////////////////////////////////////////
  // CSV tests
  testParseCsv("", []);
  testParseCsv("\n", []);
  testParseCsv("\n\n", []);
  testParseCsv("\n\n\n", []);
  testParseCsv(",", [[""]]);
  testParseCsv(",\n", [[""]]);
  testParseCsv(" , ", [[" ", " "]]);
  testParseCsv('""', [[""]]);
  testParseCsv('""""', [['"']]);
  testParseCsv('a', [["a"]]);
  testParseCsv('"a"', [["a"]]);
  testParseCsv("a,b\rc,d\ne,f\r\ng,h", [["a", "b"], ["c", "d"], ["e", "f"], ["g", "h"]]);

  testParseCsv('"""', null);  // unexpected end of data
  testParseCsv('a"', null);  // bare "
  testParseCsv('"a" ', null);  // extraneous "

}(this.env));
