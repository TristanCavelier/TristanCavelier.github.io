/*jslint indent: 2 */
(function envTasks(env) {
  "use strict";

  /*! Version 1.0.4

      Copyright (c) 2015-2016 Tristan Cavelier <t.cavelier@free.fr>
      This program is free software. It comes without any warranty, to
      the extent permitted by applicable law. You can redistribute it
      and/or modify it under the terms of the Do What The Fuck You Want
      To Public License, Version 2, as published by Sam Hocevar. See
      http://www.wtfpl.net/ for more details. */

  // dependencies:
  //   env.Promise.resolve (async)
  //   env.newPromise (async)
  //   env.newDeferred (async)
  // provides:
  //   env.Task
  //   env.TaskAll
  //   env.Task.all
  //   env.TaskRace
  //   env.Task.race
  //   env.Task.raceWinOrCancel (BBB)
  //   env.TaskThen
  //   env.Task.sequence (BBB)
  //   env.newTask
  //   env.newTaskThen
  //   env.QuickTask
  //   env.QuickTask.all
  //   env.QuickTask.race
  //   env.QuickTask.raceWinOrCancel (BBB)
  //   env.newQuickTask

  if (env.registerLib) env.registerLib(envTasks);

  function Task(generatorFunction) {
    var resolve, reject, g, ths = this;
    function magicDeferred() {
      var res, promise = env.newPromise(function (r) { res = r; });
      promise.cancel = res;
      promise.resume = res;
      return promise;
    }
    function free() {
      delete ths["[[TaskPending]]"];
      delete ths["[[TaskCancelled]]"];
      delete ths["[[TaskPaused]]"];
    }
    function rec(method, prev) {
      ths["[[TaskPending]]"] = null;
      if (ths["[[TaskCancelled]]"]) return reject(new Error("task cancelled"));
      if (ths["[[TaskPaused]]"]) return (ths["[[TaskPending]]"] = magicDeferred()).then(function () { rec(method, prev); });
      var next, done;
      try { next = g[method](prev); } catch (e) { return reject(e); }
      done = next.done;
      ths["[[TaskPending]]"] = next = next.value;
      if (next && typeof next.then === "function") {
        if (ths["[[TaskCancelled]]"] && typeof next.cancel === "function") { try { next.cancel(); } catch (e) { return reject(e); } }
        if (ths["[[TaskPaused]]"] && typeof next.pause === "function") { try { next.pause(); } catch (e) { return reject(e); } }
        if (done) { next.then(free, free); return resolve(next); }
      } else {
        if (done) { free(); return resolve(next); }
        next = env.Promise.resolve(next);
      }
      return next.then(function (v) { rec("next", v); }, function (v) { rec("throw", v); });
    }
    this["[[TaskPromise]]"] = env.newPromise(function (r, j) { resolve = r; reject = j; });
    try { g = generatorFunction.call(this); rec("next"); } catch (reason) { reject(reason); }
  }
  Task.prototype["[[TaskCancelled]]"] = false;
  Task.prototype["[[TaskPaused]]"] = false;
  Task.prototype["[[TaskPending]]"] = null;
  Task.prototype.then = function () { var p = this["[[TaskPromise]]"]; return p.then.apply(p, arguments); };
  Task.prototype.catch = function () { var p = this["[[TaskPromise]]"]; return p.catch.apply(p, arguments); };
  Task.prototype.cancel = function () {
    var p = this["[[TaskPending]]"];
    this["[[TaskCancelled]]"] = true;
    if (p && typeof p.then === "function" && typeof p.cancel === "function") p.cancel();
    return this;
  };
  Task.prototype.pause = function () {
    var p = this["[[TaskPending]]"];
    this["[[TaskPaused]]"] = true;
    if (p && typeof p.then === "function" && typeof p.pause === "function") p.pause();
    return this;
  };
  Task.prototype.resume = function () {
    var p = this["[[TaskPending]]"];
    delete this["[[TaskPaused]]"];
    if (p && typeof p.then === "function" && typeof p.resume === "function") p.resume();
    return this;
  };
  env.Task = Task;

  function TaskAll(iterable) {
    var ths = this;
    this["[[TaskPromise]]"] = env.newPromise(function (resolve, reject) {
      var i = 0, l = iterable.length, a = ths["[[TaskArray]]"] = new Array(l), count = l, p;
      function mksolver(j) { return function (v) { a[j] = v; if (--count === 0) resolve(a); }; }
      for (; i < l; i += 1) {
        if ((p = a[i] = iterable[i]) && typeof p.then === "function") p.then(mksolver(i), reject);
        else count -= 1;
      }
      if (count === 0) resolve(a);
    });
  }
  TaskAll.prototype.then = function () { var p = this["[[TaskPromise]]"]; p.then.apply(p, arguments); };
  TaskAll.prototype.catch = function () { var p = this["[[TaskPromise]]"]; p.catch.apply(p, arguments); };
  TaskAll.prototype.cancel = function () {
    for (var i = 0, l = this["[[TaskArray]]"].length, a = this["[[TaskArray]]"], p; i < l; i += 1)
      if ((p = a[i]) && typeof p.then === "function" && typeof p.cancel === "function")
        try { p.cancel(); } catch (_) {}
  };
  TaskAll.prototype.pause = function () {
    for (var i = 0, l = this["[[TaskArray]]"].length, a = this["[[TaskArray]]"], p; i < l; i += 1)
      if ((p = a[i]) && typeof p.then === "function" && typeof p.pause === "function")
        try { p.pause(); } catch (_) {}
  };
  TaskAll.prototype.resume = function () {
    for (var i = 0, l = this["[[TaskArray]]"].length, a = this["[[TaskArray]]"], p; i < l; i += 1)
      if ((p = a[i]) && typeof p.then === "function" && typeof p.resume === "function")
        try { p.resume(); } catch (_) {}
  };
  env.TaskAll = TaskAll;
  Task.all = function (iterable) { return new env.TaskAll(iterable); };

  function TaskRace(iterable) {
    var ths = this;
    this["[[TaskPromise]]"] = env.newPromise(function (resolve, reject) {
      var i = 0, l = iterable.length, a = ths["[[TaskArray]]"] = new Array(l), p;
      for (; i < l; i += 1) {
        if ((p = a[i] = iterable[i]) && typeof p.then === "function") p.then(resolve, reject);
        else resolve(p);
      }
    });
  }
  TaskRace.prototype.then = function () { var p = this["[[TaskPromise]]"]; p.then.apply(p, arguments); };
  TaskRace.prototype.catch = function () { var p = this["[[TaskPromise]]"]; p.catch.apply(p, arguments); };
  TaskRace.prototype.cancel = function () {
    for (var i = 0, l = this["[[TaskArray]]"].length, a = this["[[TaskArray]]"], p; i < l; i += 1)
      if ((p = a[i]) && typeof p.then === "function" && typeof p.cancel === "function")
        try { p.cancel(); } catch (_) {}
  };
  TaskRace.prototype.pause = function () {
    for (var i = 0, l = this["[[TaskArray]]"].length, a = this["[[TaskArray]]"], p; i < l; i += 1)
      if ((p = a[i]) && typeof p.then === "function" && typeof p.pause === "function")
        try { p.pause(); } catch (_) {}
  };
  TaskRace.prototype.resume = function () {
    for (var i = 0, l = this["[[TaskArray]]"].length, a = this["[[TaskArray]]"], p; i < l; i += 1)
      if ((p = a[i]) && typeof p.then === "function" && typeof p.resume === "function")
        try { p.resume(); } catch (_) {}
  };
  env.TaskRace = TaskRace;
  Task.race = function (iterable) { return new env.TaskRace(iterable); };

  Task.raceWinOrCancel = function (tasks) {  // BBB
    // API stability level: 1 - Experimental
    var i, l = tasks.length, p = new Array(l), d = env.newDeferred();
    for (i = 0; i < l; i += 1) { p[i] = tasks[i] && typeof tasks[i].then === "function" ? tasks[i] : env.Promise.resolve(tasks[i]); }
    d.promise.cancel = function () { var j, v; for (j = 0; j < l; j += 1) { v = p[j]; if (v && typeof v.then === "function" && typeof v.cancel === "function") { v.cancel(); } } };
    d.promise.pause  = function () { var j, v; for (j = 0; j < l; j += 1) { v = p[j]; if (v && typeof v.then === "function" && typeof v.pause  === "function") { v.pause();  } } };
    d.promise.resume = function () { var j, v; for (j = 0; j < l; j += 1) { v = p[j]; if (v && typeof v.then === "function" && typeof v.resume === "function") { v.resume(); } } };
    d.promise.then(d.promise.cancel, d.promise.cancel);  // XXX cancel only loosers ? XXX is this cancel called in the next tick ?
    for (i = 0; i < l; i += 1) { p[i].then(d.resolve, d.reject); }
    return d.promise;
  };

  function TaskThen(previous, onDone, onFail) {
    var it = this;
    // API stability level: 1 - Experimental
    function rec(fn, v) {
      /*jslint ass: true */
      if (it["[[TaskCancelled]]"]) { throw new Error("task cancelled"); }
      if (it["[[TaskPaused]]"]) { return new TaskThen(it["[[TaskPending]]"] = magicDeferred(), rec.bind(it, fn, v)); }
      var p = it["[[TaskPending]]"] = fn(v);
      if (it["[[TaskCancelled]]"] && p && typeof p.then === "function" && typeof p.cancel === "function") { p.cancel(); }
      if (it["[[TaskPaused]]"] && p && typeof p.then === "function" && typeof p.pause === "function") { p.pause(); }
      return p;
    }
    previous = it["[[TaskPending]]"] = previous && typeof previous.then === "function" ? previous : env.Promise.resolve(previous);  // or env.Promise.resolve()??? make a TaskThen test
    it["[[TaskPromise]]"] = previous.then(typeof onDone === "function" ? rec.bind(it, onDone) : onDone, typeof onFail === "function" ? rec.bind(it, onFail) : onFail);
  }
  TaskThen.prototype = Object.create(Task.prototype);

  Task.sequence = function (sequence) {  // BBB
    // API stability level: 1 - Experimental

    /*jslint plusplus: true */
    var i = 0, l = sequence.length, p, s;
    while (i < l) {
      s = sequence[i++];
      if (Array.isArray(s)) {
        p = new env.TaskThen(p, s[0], s[1]);
      } else {
        p = new env.TaskThen(p, s);
      }
    }
    return p || env.Promise.resolve();
  };
  env.Task = Task;
  env.newTask = function () { var c = env.Task, o = Object.create(c.prototype); c.apply(o, arguments); return o; };
  env.TaskThen = TaskThen;
  env.newTaskThen = function () { var c = env.TaskThen, o = Object.create(c.prototype); c.apply(o, arguments); return o; };

  function QuickTask(generatorFunction) {
    var _resolve, _reject, g, ths = this;
    function magicDeferred() {
      var res, promise = env.newPromise(function (r) { res = r; });
      promise.cancel = res;
      promise.resume = res;
      return promise;
    }
    function resolve(value) {
      //if (value && typeof value.then === "function") { return value.then(resolve, reject); }
      ths.resolved = true;
      ths.value = value;
      return _resolve(value);
    }
    function reject(value) {
      //if (value && typeof value.then === "function") { return value.then(resolve, reject); }
      ths.rejected = true;
      ths.value = value;
      return _reject(value);
    }
    function free() {
      delete ths["[[TaskPending]]"];
      delete ths["[[TaskCancelled]]"];
      delete ths["[[TaskPaused]]"];
    }
    function rec(method, prev) {
      var next, done;
      ths["[[TaskPending]]"] = null;
      for (;;) {
        if (ths["[[TaskCancelled]]"]) return reject(new Error("task cancelled"));
        if (ths["[[TaskPaused]]"]) return (ths["[[TaskPending]]"] = magicDeferred()).then(function () { rec(method, prev); });
        try { next = g[method](prev); } catch (e) { return reject(e); }
        done = next.done;
        ths["[[TaskPending]]"] = next = next.value;
        if (next && typeof next.then === "function") {
          if (next.resolved) {
            if (done) { free(); return resolve(next.value); }
            prev = next.value; method = "next";
          } else if (next.rejected) {
            if (done) { free(); return reject(next.value); }
            prev = next.value; method = "throw";
          } else {
            if (ths["[[TaskCancelled]]"] && typeof next.cancel === "function") { try { next.cancel(); } catch (e) { return reject(e); } }
            if (ths["[[TaskPaused]]"] && typeof next.pause === "function") { try { next.pause(); } catch (e) { return reject(e); } }
            if (done) { next.then(free, free); return next.then(resolve, reject); }
            return next.then(function (v) { rec("next", v); }, function (v) { rec("throw", v); });
          }
        } else {
          if (done) { free(); return resolve(next); }
          prev = next; method = "next";
        }
      }
    }
    this["[[TaskPromise]]"] = env.newPromise(function (r, j) { _resolve = r; _reject = j; });
    try { g = generatorFunction.call(this); rec("next"); } catch (reason) { reject(reason); }
  }
  QuickTask.prototype["[[TaskCancelled]]"] = false;
  QuickTask.prototype["[[TaskPaused]]"] = false;
  QuickTask.prototype["[[TaskPending]]"] = null;
  QuickTask.prototype.then = function () { var p = this["[[TaskPromise]]"]; return p.then.apply(p, arguments); };
  QuickTask.prototype.catch = function () { var p = this["[[TaskPromise]]"]; return p.catch.apply(p, arguments); };
  QuickTask.prototype.cancel = function () {
    var p = this["[[TaskPending]]"];
    this["[[TaskCancelled]]"] = true;
    if (p && typeof p.then === "function" && typeof p.cancel === "function") p.cancel();
    return this;
  };
  QuickTask.prototype.pause = function () {
    var p = this["[[TaskPending]]"];
    this["[[TaskPaused]]"] = true;
    if (p && typeof p.then === "function" && typeof p.pause === "function") p.pause();
    return this;
  };
  QuickTask.prototype.resume = function () {
    var p = this["[[TaskPending]]"];
    delete this["[[TaskPaused]]"];
    if (p && typeof p.then === "function" && typeof p.resume === "function") p.resume();
    return this;
  };
  QuickTask.exec = function (generatorFunction) {
    // task = gf => QuickTask.exec(gf);

    // API stability level: 1 - Experimental
    var qt = new QuickTask(generatorFunction);
    if (qt.resolved) return qt.value;
    if (qt.rejected) throw qt.value;
    return qt;
  };
  QuickTask.all = function (iterable) {
    for (var i = 0, l = iterable.length, a = new Array(l); i < l; i += 1) {
      if (!iterable[i] || typeof iterable[i].then !== "function") a[i] = iterable[i];
      else if (iterable[i].resolved) a[i] = iterable[i].value;
      else if (iterable[i].rejected) throw iterable[i].value;
      else return env.Task.all(iterable);
    }
    return a;
  };
  QuickTask.race = function (iterable) {
    for (var i = 0, l = iterable.length; i < l; i += 1) {
      if (!iterable[i] || typeof iterable[i].then !== "function") return iterable[i];
      else if (iterable[i].resolved) return iterable[i].value;
      else if (iterable[i].rejected) throw iterable[i].value;
    }
    return env.Task.race(iterable);
  };

  QuickTask.raceWinOrCancel = function (tasks) {  // BBB
    for (var t, i = 0, l = tasks.length; i < l; i += 1) {
      t = tasks[i];
      if (t && typeof t === "function") {
        if (t.resolved) return t.value;
        if (t.rejected) throw t.value;
      } else return t;
    }
    return Task.raceWinOrCancel(tasks);  // can be quicker ?
  };
  env.QuickTask = QuickTask;
  env.newQuickTask = function () { var c = env.QuickTask, o = Object.create(c.prototype); c.apply(o, arguments); return o; };

}(this.env));
