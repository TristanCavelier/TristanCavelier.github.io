/*jslint indent: 2 */
(function envTasks(env) {
  "use strict";

  /*! Version 1.0.0

      Copyright (c) 2015-2016 Tristan Cavelier <t.cavelier@free.fr>
      This program is free software. It comes without any warranty, to
      the extent permitted by applicable law. You can redistribute it
      and/or modify it under the terms of the Do What The Fuck You Want
      To Public License, Version 2, as published by Sam Hocevar. See
      http://www.wtfpl.net/ for more details. */

  // dependencies: async (env.Promise.resolve, env.Promise.reject,
  //                      env.newPromise, env.newDeferred)
  // provides: env.{,new}Task, env.{,new}TaskThen, env.{,new}QuickTask

  env.registerLib(envTasks);

  var wm = typeof WeakMap === "function" ? new WeakMap() : {get: function (a) { return a; }, set: function () { return; }};

  function magicDeferred() {
    var resolve, promise = env.newPromise(function (r) { resolve = r; });
    promise.cancel = resolve;
    promise.resume = resolve;
    return promise;
  }

  function Task(generatorFunction) {
    wm.set(this, {});
    var it = wm.get(this), resolve, reject, g;
    // API stability level: 1 - Experimental
    function rec(method, prev) {
      /*jslint ass: true */
      if (it["[[TaskCancelled]]"]) { g = new Error("task cancelled"); return reject(g); }
      if (it["[[TaskPaused]]"]) { return (it["[[TaskSubPromise]]"] = magicDeferred()).then(rec.bind(this, method, prev)); }
      var next, done;
      try { next = g[method](prev); } catch (e) { return reject(e); }
      done = next.done;
      it["[[TaskSubPromise]]"] = next = next.value;
      if (it["[[TaskCancelled]]"] && next && typeof next.then === "function" && typeof next.cancel === "function") { try { next.cancel(); } catch (e) { return reject(e); } }
      if (it["[[TaskPaused]]"] && next && typeof next.then === "function" && typeof next.pause === "function") { try { next.pause(); } catch (e) { return reject(e); } }
      if (done) { return resolve(next); }
      if (!next || typeof next.then !== "function") { next = env.Promise.resolve(next); }  // XXX
      return next.then(rec.bind(this, "next"), rec.bind(this, "throw"));
    }
    it["[[TaskPromise]]"] = env.newPromise(function (res, rej) { resolve = res; reject = rej; });
    try {
      g = generatorFunction.call(this);
      rec.call(this, "next");
    } catch (reason) {
      reject(reason);
    }
  }
  Task.prototype.then = function () { var p = wm.get(this)["[[TaskPromise]]"]; return p.then.apply(p, arguments); };
  Task.prototype.catch = function () { var p = wm.get(this)["[[TaskPromise]]"]; return p.catch.apply(p, arguments); };
  Task.prototype.cancel = function () {
    var it = wm.get(this), p;
    it["[[TaskCancelled]]"] = true;
    p = it["[[TaskSubPromise]]"];
    if (p && typeof p.then === "function" && typeof p.cancel === "function") { p.cancel(); }
    return this;
  };
  Task.prototype.pause = function () {
    var it = wm.get(this), p;
    it["[[TaskPaused]]"] = true;
    p = it["[[TaskSubPromise]]"];
    if (p && typeof p.then === "function" && typeof p.pause === "function") { p.pause(); }
    return this;
  };
  Task.prototype.resume = function () {
    var it = wm.get(this), p;
    delete it["[[TaskPaused]]"];
    p = it["[[TaskSubPromise]]"];
    if (p && typeof p.then === "function" && typeof p.resume === "function") { p.resume(); }
    return this;
  };
  Task.all = function (tasks) {
    // XXX make TaskAll constructor ? inherit from a TaskManager(tasks) (using [[TaskManager:i]]) ?
    if (tasks.length < 1) { return env.Promise.resolve([]); }
    var i, l = tasks.length, p = new Array(l), res = [], d = env.newDeferred(), count = l;
    for (i = 0; i < l; i += 1) { p[i] = tasks[i] && typeof tasks[i].then === "function" ? tasks[i] : env.Promise.resolve(tasks[i]); }
    d.promise.cancel = function () { var j, v; for (j = 0; j < l; j += 1) { v = p[j]; if (v && typeof v.then === "function" && typeof v.cancel === "function") { v.cancel(); } } };
    d.promise.pause  = function () { var j, v; for (j = 0; j < l; j += 1) { v = p[j]; if (v && typeof v.then === "function" && typeof v.pause  === "function") { v.pause();  } } };
    d.promise.resume = function () { var j, v; for (j = 0; j < l; j += 1) { v = p[j]; if (v && typeof v.then === "function" && typeof v.resume === "function") { v.resume(); } } };
    function solver(j, v) {
      /*jslint plusplus: true */
      res[j] = v;
      if (--count === 0) { d.resolve(res); }
    }
    for (i = 0; i < l; i += 1) { p[i].then(solver.bind(null, i), d.reject); }
    return d.promise;
  };
  Task.race = function (tasks) {
    var i, l = tasks.length, p = new Array(l), d = env.newDeferred();
    for (i = 0; i < l; i += 1) { p[i] = tasks[i] && typeof tasks[i].then === "function" ? tasks[i] : env.Promise.resolve(tasks[i]); }
    d.promise.cancel = function () { var j, v; for (j = 0; j < l; j += 1) { v = p[j]; if (v && typeof v.then === "function" && typeof v.cancel === "function") { v.cancel(); } } };
    d.promise.pause  = function () { var j, v; for (j = 0; j < l; j += 1) { v = p[j]; if (v && typeof v.then === "function" && typeof v.pause  === "function") { v.pause();  } } };
    d.promise.resume = function () { var j, v; for (j = 0; j < l; j += 1) { v = p[j]; if (v && typeof v.then === "function" && typeof v.resume === "function") { v.resume(); } } };
    for (i = 0; i < l; i += 1) { p[i].then(d.resolve, d.reject); }
    return d.promise;
  };
  Task.raceWinOrCancel = function (tasks) {
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
    wm.set(this, {});
    var it = wm.get(this);
    // API stability level: 1 - Experimental
    function rec(fn, v) {
      /*jslint ass: true */
      if (it["[[TaskCancelled]]"]) { throw new Error("task cancelled"); }
      if (it["[[TaskPaused]]"]) { return new TaskThen(it["[[TaskSubPromise]]"] = magicDeferred(), rec.bind(it, fn, v)); }
      var p = it["[[TaskSubPromise]]"] = fn(v);
      if (it["[[TaskCancelled]]"] && p && typeof p.then === "function" && typeof p.cancel === "function") { p.cancel(); }
      if (it["[[TaskPaused]]"] && p && typeof p.then === "function" && typeof p.pause === "function") { p.pause(); }
      return p;
    }
    previous = it["[[TaskSubPromise]]"] = previous && typeof previous.then === "function" ? previous : env.Promise.resolve(previous);  // or env.Promise.resolve()??? make a TaskThen test
    it["[[TaskPromise]]"] = previous.then(typeof onDone === "function" ? rec.bind(it, onDone) : onDone, typeof onFail === "function" ? rec.bind(it, onFail) : onFail);
  }
  TaskThen.prototype = Object.create(Task.prototype);

  Task.sequence = function (sequence) {
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
    wm.set(this, {});
    var it = wm.get(this), resolve, reject, g;
    // API stability level: 1 - Experimental
    function end(fn, value) {
      this.done = true;
      this.value = value;
      if (fn === resolve)
        return resolve(value);
      this.failed = true;
      return reject(value);
    }
    function rec(method, prev) {
      var next, done;
      for (;;) {
        /*jslint ass: true */
        if (it["[[TaskCancelled]]"]) return end.call(this, reject, new Error("task cancelled"));
        if (it["[[TaskPaused]]"]) return (it["[[TaskSubPromise]]"] = magicDeferred()).then(rec.bind(this, method, prev));
        try { next = g[method](prev); } catch (e) { return end.call(this, reject, e); }
        done = next.done;
        it["[[TaskSubPromise]]"] = next = next.value;
        if (it["[[TaskCancelled]]"] && next && typeof next.then === "function" && typeof next.cancel === "function") { try { next.cancel(); } catch (e) { return end.call(this, reject, e); } }
        if (it["[[TaskPaused]]"] && next && typeof next.then === "function" && typeof next.pause === "function") { try { next.pause(); } catch (e) { return end.call(this, reject, e); } }
        if (done) return end.call(this, resolve, next);
        if (next && typeof next.then === "function")
          return next.then(rec.bind(this, "next"), rec.bind(this, "throw"));
        prev = next;
        method = "next";
      }
    }
    it["[[TaskPromise]]"] = env.newPromise(function (res, rej) { resolve = res; reject = rej; });
    try {
      g = generatorFunction.call(this);
      rec.call(this, "next");
    } catch (reason) {
      reject(reason);
    }
  }
  QuickTask.prototype = Task.prototype;  // XXX use Object.create ?
  QuickTask.exec = function (generatorFunction) {
    // task = gf => QuickTask.exec(gf);

    // API stability level: 1 - Experimental
    var qt = new QuickTask(generatorFunction);
    if (qt.failed) throw qt.value;
    if (qt.done) return qt.value;
    return qt;
  };
  QuickTask.all = function (tasks) {
    for (var t, i = 0, l = tasks.length, res = []; i < l; i += 1) {
      t = tasks[i];
      if (t && typeof t === "function") {
        if (t.failed) throw t.value;
        if (t.done) res[i] = t.value;
        else return Task.all(tasks);  // can be quicker ?
      } else res[i] = t;
    }
    return res;
  };
  QuickTask.race = function (tasks) {
    for (var t, i = 0, l = tasks.length; i < l; i += 1) {
      t = tasks[i];
      if (t && typeof t === "function") {
        if (t.failed) throw t.value;
        if (t.done) return t.value;
      } else return t;
    }
    return Task.race(tasks);  // can be quicker ?
  };
  QuickTask.raceWinOrCancel = function (tasks) {
    for (var t, i = 0, l = tasks.length; i < l; i += 1) {
      t = tasks[i];
      if (t && typeof t === "function") {
        if (t.failed) throw t.value;
        if (t.done) return t.value;
      } else return t;
    }
    return Task.raceWinOrCancel(tasks);  // can be quicker ?
  };
  // should be useless because exec is quicker
  QuickTask.sequence = function (sequence) {
    // API stability level: 1 - Experimental
    return QuickTask.exec(function* () {
      var i, s, v, thrown = false;
      for (i = 0; i < sequence.length; i += 1) {
        s = sequence[i];
        if (Array.isArray(s)) {
          if (thrown) s = s[1];
          else s = s[0];
        } else if (thrown) s = null;
        if (typeof s === "function") {
          try {
            v = yield s(v);
            thrown = false;
          } catch (e) {
            v = e;
            thrown = true;
          }
        }
      }
      if (thrown) throw v;
      return v;
    });
  };
  env.QuickTask = QuickTask;
  env.newQuickTask = function () { var c = env.QuickTask, o = Object.create(c.prototype); c.apply(o, arguments); return o; };

}(this.env));
