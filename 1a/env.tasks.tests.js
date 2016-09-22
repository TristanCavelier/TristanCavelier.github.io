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
      if (timer === undefined) return error("test: " + name + ", `end` called twice");
      timer = clearTimeout(timer);
      if (JSON.stringify(res) !== JSON.stringify(expected)) {
        error("test: " + name + ", result `" + JSON.stringify(res) + "` !== `" + JSON.stringify(expected) + "` expected");
      }
    }
    timer = setTimeout(function () {
      error("test: " + name + ", timeout ! result `" + JSON.stringify(res) + "` <-> `" + JSON.stringify(expected) + "` expected");
    }, timeout);
    setTimeout(function () { testFn(res, end); });
  }

  function sleep(ms) { return env.newPromise(function (resolve) { setTimeout(resolve, ms); }); }

  //////////////////////////////////////////////
  // Task tests
  test("task: should cancel the returned task", 300, [], function (res, end) {
    var task = new env.Task(function* () {
      return new env.Task(function* () { yield; });
    });
    task.cancel();
    task.catch(end);
  });
  test("task: should not cancel before the non cancellable promise", 300, [1], function (res, end) {
    var val = 0, task = new env.Task(function* () {
      this.cancel();
      yield Promise.resolve().then(function () { val = 1; });
    });
    task.catch(function () {
      res.push(val);
      end();
    });
  });
  test("task: should fulfill before cancel", 300, [1], function (res, end) {
    var task = new env.Task(function* () {
      this.cancel();
      return Promise.resolve().then(function () { return 1; });
    });
    task.then(function (one) {
      res.push(one);
      end();
    });
  });
  test("task: how to use try catch with return in a task", 300, ["errored"], function (res, end) {
    var task = new env.Task(function* () {
      var ret;
      try {
        ret = yield Promise.reject("errored");
        return ret;  // because `return ret;` means the task is completed with `ret`
      } catch (reason) {
        res.push(reason);
      }
      // the best could be to put the return after the try catch.
    });
    task.then(end, end);
  });
  test("task: how to use defer to avoid cancellation before var assignment", 1000, ["defer close", "closer is closed"], function (res, end) {
    // test preparation
    var closerStatus = "not instanciated";
    var actualCloser = {close: function () { closerStatus = "closed"; }};
    var getCloserTask = function () { closerStatus = "not closed"; return env.Promise.resolve(actualCloser); };
    var defer = function (p, fn) { return p.then(fn, fn); }
    // actual test
    var closer, task = new env.Task(function* () {
      var closerTask = getCloserTask();
      res.push("defer close")
      defer(this, function () { closerTask.then(function (closer) { closer.close(); }); });
      closer = yield closerTask;
      res.push("task bottom");
    });
    task.cancel();
    // test end
    task.catch(function () {
      setTimeout(function () {
        res.push("closer is " + closerStatus);
        end();
      });
    });
  });
  test("task: race win or cancel should cancel just after first wins", 300, ["closed", "wins", "closed"], function (res, end) {
    // test preparation
    function mkdefer() {
      var d = new env.Deferred();
      d.promise.cancel = function () { d.closed = "closed"; };
      d.closed = "not closed";
      return d;
    }
    // actual test
    var one = mkdefer(), three = mkdefer();
    env.Task.raceWinOrCancel([
      one.promise,
      "wins",
      three.promise,
    ]).then(function (value) {
      res.push(one.closed, value || "failed to win", three.closed);
      end();
    });
  });

}(this.env));
