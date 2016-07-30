/*jslint indent: 2 */
(function envDev(env) {
  "use strict";

  /*! Copyright (c) 2015-2016 Tristan Cavelier <t.cavelier@free.fr>
      This program is free software. It comes without any warranty, to
      the extent permitted by applicable law. You can redistribute it
      and/or modify it under the terms of the Do What The Fuck You Want
      To Public License, Version 2, as published by Sam Hocevar. See
      http://www.wtfpl.net/ for more details. */

  env.registerLib(envDev);

  var raceWinOrCancelWithIndex = function (tasks) {
    // API stability level: 1 - Experimental
    var i, l = tasks.length, p = new Array(l), d = env.newDeferred();
    function solver(j) { return function (v) { return d.resolve({value: v, index: j}); }; }
    for (i = 0; i < l; i += 1) { p[i] = tasks[i] && typeof tasks[i].then === "function" ? tasks[i] : env.Promise.resolve(tasks[i]); }
    d.promise.cancel = function () { var j, v; for (j = 0; j < l; j += 1) { v = p[j]; if (v && typeof v.then === "function" && typeof v.cancel === "function") { v.cancel(); } } };
    d.promise.pause  = function () { var j, v; for (j = 0; j < l; j += 1) { v = p[j]; if (v && typeof v.then === "function" && typeof v.pause  === "function") { v.pause();  } } };
    d.promise.resume = function () { var j, v; for (j = 0; j < l; j += 1) { v = p[j]; if (v && typeof v.then === "function" && typeof v.resume === "function") { v.resume(); } } };
    d.promise.then(d.promise.cancel, d.promise.cancel);  // XXX cancel only loosers ? XXX is this cancel called in the next tick ?
    for (i = 0; i < l; i += 1) { p[i].then(solver(i), d.reject); }
    return d.promise;
  };
  var wait = function (task) {
    // API stability level: 1 - Experimental
    var d = env.newDeferred();
    d.promise.cancel = function () { d.reject("wait cancelled"); };
    task.then(d.resolve, d.reject);
    return d.promise;
  };

  var wm = {get: function (a) { return a; }, set: function () { return; }};
  function Queue() {
    // API stability level: 1 - Experimental
    wm.set(this, {});
    var it = wm.get(this), resolve, reject, g = it["[[Queue]]"] = [];
    function end(method, value) {
      it["[[QueueEnd]]"] = true;
      return method === 1 ? reject(value) : resolve(value);
    }
    function rec(method, prev) {
      if (g.length === 0) { return end(method, prev); }
      if (it["[[TaskCancelled]]"]) { g = new Error("queue cancelled"); return end(1, g); }
      if (it["[[TaskPaused]]"]) { return (it["[[TaskSubPromise]]"] = magicDeferred()).then(rec.bind(this, method, prev)); }
      var next;
      try { next = g.splice(0, 2)[method](prev); method = 0; }
      catch (e) { next = e; method = 1; }
      it["[[TaskSubPromise]]"] = next;
      if (it["[[TaskCancelled]]"] && next && typeof next.then === "function" && typeof next.cancel === "function") { try { next.cancel(); } catch (e) { return end(1, e); } }
      if (it["[[TaskPaused]]"] && next && typeof next.then === "function" && typeof next.pause === "function") { try { next.pause(); } catch (e) { return end(1, e); } }
      if (!next || typeof next.then !== "function") { next = method === 1 ? env.Promise.reject(next) : env.Promise.resolve(next); }
      return next.then(rec.bind(this, 0), rec.bind(this, 1));
    }
    it["[[TaskPromise]]"] = env.newPromise(function (res, rej) { resolve = res; reject = rej; });
    env.Promise.resolve(0).then(rec.bind(this));
  }
  //Queue.prototype = Object.create(Task.prototype);
  Queue.prototype.then = function () { var p = wm.get(this)["[[TaskPromise]]"]; return p.then.apply(p, arguments); };
  Queue.prototype.catch = function () { var p = wm.get(this)["[[TaskPromise]]"]; return p.catch.apply(p, arguments); };
  Queue.prototype.enqueue = function (onDone, onFail) {
    var it = wm.get(this);
    if (it["[[QueueEnd]]"]) { throw Error("queue ended"); }
    it["[[Queue]]"].push(onDone, onFail);
    return this;
  };
  env.Queue = Queue;
  env.newQueue = function () { var c = env.Queue, o = Object.create(c.prototype); c.apply(o, arguments); return o; };

  // We can imagine loop async function
  //function asyncDoWhile(callback, input) {
  //  // calls callback(input) until it returns a non positive value
  //  return new TaskThen(null, function () {
  //  //return new env.Queue().enqueue(function () {
  //    var q = new env.Queue();
  //    function loop(test) {
  //      if (!test) { return input; }
  //      q.enqueue(loop);
  //      return callback(input);
  //    }
  //    return q.enqueue(function () { return callback(input); }).enqueue(loop);
  //  });
  //}


  //function semaphoreFifoPush(sem, value) {
  //  var hik = "[[Semaphore:headIndex]]",
  //    hi = sem[hik] || 0,
  //    lk = "[[Semaphore:length]]",
  //    hk = "[[Semaphore:" + hi + "]]";
  //  sem[hk] = value;
  //  sem[hik] = hi + 1;
  //  sem[lk] = (sem[lk] || 0) + 1;
  //}
  //function semaphoreFifoPop(sem) {
  //  var v, tik = "[[Semaphore:tailIndex]]",
  //    ti = sem[tik] || 0,
  //    hi = sem["[[Semaphore:headIndex]]"] || 0,
  //    vk = "[[Semaphore:" + ti + "]]";
  //  if (ti < hi) {
  //    v = sem[vk];
  //    delete sem[vk];
  //    sem[tik] = ti + 1;
  //    sem["[[Semaphore:length]]"] -= 1;
  //    return v;
  //  }
  //}

  //function Semaphore(capacity) {
  //  this["[[Semaphore:capacity]]"] = typeof capacity === "number" || capacity > 0 ? capacity : 1;
  //  this["[[Semaphore:acquired]]"] = 0;
  //}
  //Semaphore.prototype.acquire = function () {
  //  if (++this["[[Semaphore:acquired]]"] <= this["[[Semaphore:capacity]]"]) { return Promise.resolve(); }
  //  var d = new Deferred();
  //  semaphoreFifoPush(this, d);
  //  return d.promise;
  //};
  //Semaphore.prototype.release = function () {
  //  if (this["[[Semaphore:acquired]]"] <= 0) { return; }
  //  this["[[Semaphore:acquired]]"] -= 1;
  //  var d = semaphoreFifoPop(this);
  //  if (d) { d.resolve(); }
  //};
  //Semaphore.prototype.getAcquiredAmount = function () {
  //  return this["[[Semaphore:acquired]]"] || 0;
  //};
  //env.Semaphore = Semaphore;
  //env.newSemaphore = function () { var c = env.Semaphore, o = Object.create(c.prototype); c.apply(o, arguments); return o; };


  //function idSemaphoreFifoPush(sem, type, value) {
  //  var hik = "[[IdSemaphore:" + type + ":headIndex]]",
  //    hi = sem[hik] || 0,
  //    lk = "[[IdSemaphore:" + type + ":length]]",
  //    hk = "[[IdSemaphore:" + type + ":" + hi + "]]";
  //  sem[hk] = value;
  //  sem[hik] = hi + 1;
  //  sem[lk] = (sem[lk] || 0) + 1;
  //}
  //function idSemaphoreFifoPop(sem, type) {
  //  var v, lk, tik = "[[IdSemaphore:" + type + ":tailIndex]]",
  //    ti = sem[tik] || 0,
  //    hik = "[[IdSemaphore:" + type + ":headIndex]]",
  //    hi = sem[hik] || 0,
  //    vk = "[[IdSemaphore:" + type + ":" + ti + "]]";
  //  if (ti < hi) {
  //    v = sem[vk];
  //    delete sem[vk];
  //    sem[tik] = ti + 1;
  //    lk = "[[IdSemaphore:" + type + ":length]]";
  //    sem[lk] -= 1;
  //    if (sem[lk] === 0) {
  //      delete sem[tik];
  //      delete sem[hik];
  //      delete sem[lk];
  //    }
  //    return v;
  //  }
  //}

  //function IdSemaphore(capacity) {
  //  this["[[IdSemaphore:capacity]]"] = typeof capacity === "number" || capacity > 0 ? capacity : 1;
  //}
  //IdSemaphore.prototype.acquire = function (id) {
  //  var ak = "[[IdSemaphore:" + id + ":acquired]]", d;
  //  if ((this[ak] = (this[ak] || 0) + 1) <= this["[[IdSemaphore:capacity]]"]) { return Promise.resolve(); }
  //  d = new Deferred();
  //  idSemaphoreFifoPush(this, id, d);
  //  return d.promise;
  //};
  //IdSemaphore.prototype.release = function (id) {
  //  var ak = "[[IdSemaphore:" + id + ":acquired]]", a = this[ak] || 0, d;
  //  if (a <= 0) { return; }
  //  if (a === 1) { delete this[ak]; }
  //  else { this[ak] -= 1; }
  //  d = idSemaphoreFifoPop(this);
  //  if (d) { d.resolve(); }
  //};
  //IdSemaphore.prototype.getAcquiredAmount = function (id) {
  //  return this["[[IdSemaphore:" + id + ":acquired]]"] || 0;
  //};
  //env.IdSemaphore = IdSemaphore;
  //env.newIdSemaphore = function () { var c = env.IdSemaphore, o = Object.create(c.prototype); c.apply(o, arguments); return o; };

}(this.env));
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
      error("timeout ! result `" + JSON.stringify(res) + "` <-> `" + JSON.stringify(expected) + "` expected");
    }, timeout);
    setTimeout(function () { testFn(res, end); });
  }

  function sleep(ms) { return env.newPromise(function (resolve) { setTimeout(resolve, ms); }); }

  //////////////////////////////////////////////
  // Queue tests
  test("queue: should be enqueuable before next tick", 300, ["enqueued"], function (res, end) {
    var q = new env.Queue();
    q.enqueue(function () {
      res.push("enqueued");
      end();
    });
  });
  test("queue: cannot enqueue after fulfillment", 300, ["queue ended"], function (res, end) {
    var q = new env.Queue();
    q.then(function () {
      try {
        q.enqueue(function () { res.push("+ call !"); });
        res.push("queue enqueued");
      } catch (reason) { res.push(reason.message); }
    }).then().then(end);
  });

}(this.env));
