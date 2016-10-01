/*jslint indent: 2 */
(function envTmp(env) {
  "use strict";

  /*! Copyright (c) 2015-2016 Tristan Cavelier <t.cavelier@free.fr>
      This program is free software. It comes without any warranty, to
      the extent permitted by applicable law. You can redistribute it
      and/or modify it under the terms of the Do What The Fuck You Want
      To Public License, Version 2, as published by Sam Hocevar. See
      http://www.wtfpl.net/ for more details. */

  // dependency: env.setImmediate

  if (env.registerLib) env.registerLib(envTmp);

  env.TMP3ChanPromise = (function () {

    var setImmediate = env.setImmediate;

    function handleListener(previous, next, listener, offset) {
      /*global resolvePromise */
      var value;
      if (typeof listener !== "function") { return resolvePromise(next, previous["[[PromiseValue]]"], offset); }
      try {
        value = listener(previous["[[PromiseValue]]"]);
        if (value && typeof value.then === "function") {
          value.then(function (value) {
            resolvePromise(next, value, 1);
          }, function (reason) {
            resolvePromise(next, reason, 2);
          }, function (reason) {
            resolvePromise(next, reason, 3);
          });
        } else {
          resolvePromise(next, value, 1);
        }
      } catch (reason) {
        resolvePromise(next, reason, 2);
      } // catch cancel (reason) {
      //   resolvePromise(next, reason, 3);
      // }
    }

    function forceResolvePromise(promise, value, offset) {
      if (value && typeof value.then === "function") {
        promise["[[PromiseStatus]]"] = "waiting";
        return value.then(function (value) {
          forceResolvePromise(promise, value, 1);
        }, function (reason) {
          forceResolvePromise(promise, reason, 2);
        }, function (reason) {
          forceResolvePromise(promise, reason, 3);
        });
      }
      promise["[[PromiseValue]]"] = value;
      promise["[[PromiseStatus]]"] = offset === 1 ? "resolved" : offset === 2 ? "rejected" : "cancelled";
      var i, a = promise["[[PromiseStack]]"], l = a.length;
      delete promise["[[PromiseStack]]"];
      for (i = 0; i < l; i += 4) { setImmediate(handleListener, promise, a[i], a[i + offset], offset); }
    }

    function resolvePromise(promise, value, offset) {
      if (promise["[[PromiseStatus]]"] !== "pending") { return; }
      forceResolvePromise(promise, value, offset);
    }

    function PromisePolyfill(executor) {
      if (!(this instanceof PromisePolyfill)) { throw new TypeError(this + " is not a promise"); }
      if (typeof executor !== "function") { throw new TypeError("Promise resolver " + executor + " is not a function"); }
      this["[[PromiseStack]]"] = [];
      this["[[PromiseStatus]]"] = "pending";
      var priv = this;
      function resolve(value) { resolvePromise(priv, value, 1); }
      function reject(reason) { resolvePromise(priv, reason, 2); }
      try {
        executor(resolve, reject);
      } catch (reason) {
        resolvePromise(this, reason, 2);
      }
    }
    PromisePolyfill.prototype.cancel = function (reason) { resolvePromise(this, reason, 3); };
    PromisePolyfill.prototype.then = function (onDone, onFail, onCancel) {
      var next = new PromisePolyfill(function () { return; });
      if (this["[[PromiseStatus]]"] === "resolved") {
        setImmediate(handleListener, this, next, onDone, 1);
      } else if (this["[[PromiseStatus]]"] === "rejected") {
        setImmediate(handleListener, this, next, onFail, 2);
      } else if (this["[[PromiseStatus]]"] === "cancelled") {
        setImmediate(handleListener, this, next, onCancel, 3);
      } else {
        this["[[PromiseStack]]"].push(next, onDone, onFail, onCancel);
      }
      return next;
    };
    PromisePolyfill.prototype.catch = function (onFail) { return this.then(null, onFail); };
    PromisePolyfill.prototype.catchCancel = function (onCancel) { return this.then(null, null, onCancel); };
    PromisePolyfill.resolve = function (value) {
      return new PromisePolyfill(function (resolve) {
        resolve(value);
      });
    };
    PromisePolyfill.reject = function (reason) {
      return new PromisePolyfill(function (resolve, reject) {
        /*jslint unparam: true */
        reject(reason);
      });
    };
    PromisePolyfill.cancel = function (reason) {  // XXX
      var p = new PromisePolyfill(function () { return; });
      p.cancel(reason);
      return p;
    };
    PromisePolyfill.all = function (iterable) {
      return new PromisePolyfill(function (resolve, reject) {
        var i, l = iterable.length, results = [], count = 0;
        function resolver(i) {
          return function (value) {
            results[i] = value;
            count += 1;
            if (count === l) { resolve(results); }
          };
        }
        for (i = 0; i < l; i += 1) {
          PromisePolyfill.resolve(iterable[i]).then(resolver(i), reject);
        }
      });
    };
    PromisePolyfill.race = function (iterable) {
      return new PromisePolyfill(function (resolve, reject) {
        var i, l = iterable.length;
        for (i = 0; i < l; i += 1) {
          PromisePolyfill.resolve(iterable[i]).then(resolve, reject);
        }
      });
    };

    return PromisePolyfill;
  }());


  env.TMPMoreSyncPromise = (function () {
    // benchmarks say this method can run 320 while native can run 280
    // benchmarks say this method can run 2130 while native can run 2500

    var running = false, argsList = [];
    function setImmediate(args) {
      //var i = 0, l = arguments.length, args = new Array(l);
      //while (i < l) { args[i] = arguments[i++]; }
      argsList.push(args);
      if (!running) {
        running = true;
        env.setImmediate(function () {
          var a;
          while ((a = argsList.shift()) !== undefined) {
            try { a[0].apply(null, a.slice(1)); } catch (reason) { console.error(reason); }
          }
          running = false;
        });
      }
    }

    function handleListener(previous, next, listener, offset) {
      /*global resolvePromise */
      var value;
      if (typeof listener !== "function") { return resolvePromise(next, previous["[[PromiseValue]]"], offset); }
      try {
        value = listener(previous["[[PromiseValue]]"]);
        if (value && typeof value.then === "function") {
          value.then(function (value) {
            resolvePromise(next, value, 1);
          }, function (reason) {
            resolvePromise(next, reason, 2);
          });
        } else {
          resolvePromise(next, value, 1);
        }
      } catch (reason) {
        resolvePromise(next, reason, 2);
      }
    }

    function forceResolvePromise(promise, value, offset) {
      if (value && typeof value.then === "function") {
        promise["[[PromiseStatus]]"] = "waiting";  // not pending
        return value.then(function (value) {
          forceResolvePromise(promise, value, 1);
        }, function (reason) {
          forceResolvePromise(promise, reason, 2);
        });
      }
      promise["[[PromiseValue]]"] = value;
      promise["[[PromiseStatus]]"] = offset === 1 ? "resolved" : "rejected";
      var i, a = promise["[[PromiseStack]]"], l = a.length;
      delete promise["[[PromiseStack]]"];
      for (i = 0; i < l; i += 3) { setImmediate([handleListener, promise, a[i], a[i + offset], offset]); }
    }

    function resolvePromise(promise, value, offset) {
      if (promise["[[PromiseStatus]]"] !== "pending") { return; }
      forceResolvePromise(promise, value, offset);
    }

    function PromiseMoreSync(executor) {
      if (!(this instanceof PromiseMoreSync)) { throw new TypeError(this + " is not a promise"); }
      if (typeof executor !== "function") { throw new TypeError("Promise resolver " + executor + " is not a function"); }
      this["[[PromiseStack]]"] = [];
      this["[[PromiseStatus]]"] = "pending";
      var priv = this;
      function resolve(value) { resolvePromise(priv, value, 1); }
      function reject(reason) { resolvePromise(priv, reason, 2); }
      try {
        executor(resolve, reject);
      } catch (reason) {
        resolvePromise(this, reason, 2);
      }
    }
    PromiseMoreSync.prototype.then = function (onDone, onFail) {
      var next = new PromiseMoreSync(function () { return; });
      if (this["[[PromiseStatus]]"] === "resolved") {
        setImmediate([handleListener, this, next, onDone, 1]);
      } else if (this["[[PromiseStatus]]"] === "rejected") {
        setImmediate([handleListener, this, next, onFail, 2]);
      } else {
        this["[[PromiseStack]]"].push(next, onDone, onFail);
      }
      return next;
    };
    PromiseMoreSync.prototype.catch = function (onFail) { return this.then(null, onFail); };
    PromiseMoreSync.resolve = function (value) {
      return new PromiseMoreSync(function (resolve) {
        resolve(value);
      });
    };
    PromiseMoreSync.reject = function (reason) {
      return new PromiseMoreSync(function (resolve, reject) {
        /*jslint unparam: true */
        reject(reason);
      });
    };
    PromiseMoreSync.all = function (iterable) {
      return new PromiseMoreSync(function (resolve, reject) {
        var i, l = iterable.length, results = [], count = 0;
        function resolver(i) {
          return function (value) {
            results[i] = value;
            count += 1;
            if (count === l) { resolve(results); }
          };
        }
        for (i = 0; i < l; i += 1) {
          PromiseMoreSync.resolve(iterable[i]).then(resolver(i), reject);
        }
      });
    };
    PromiseMoreSync.race = function (iterable) {
      return new PromiseMoreSync(function (resolve, reject) {
        var i, l = iterable.length;
        for (i = 0; i < l; i += 1) {
          PromiseMoreSync.resolve(iterable[i]).then(resolve, reject);
        }
      });
    };

  }());


  function QuickAsync(generatorFunction) {
    var resolve, reject, g;
    // API stability level: 1 - Experimental
    function end(fn, value) {
      this.done = true;
      this.value = value;
      if (fn === resolve) return resolve(value);
      this.failed = true;
      return reject(value);
    }
    function rec(method, prev) {
      var next, done;
      for (;;) {
        /*jslint ass: true */
        try { next = g[method](prev); } catch (e) { return end.call(this, reject, e); }
        done = next.done;
        next = next.value;
        if (done) return end.call(this, resolve, next);
        if (next && typeof next.then === "function")
          return next.then(rec.bind(this, "next"), rec.bind(this, "throw"));
        prev = next;
        method = "next";
      }
    }
    this["[[Promise]]"] = env.newPromise(function (res, rej) { resolve = res; reject = rej; });
    try {
      g = generatorFunction.call(this);
      rec.call(this, "next");
    } catch (reason) {
      reject(reason);
    }
  }
  QuickAsync.prototype.then = function () { var p = this["[[Promise]]"]; return p.then.apply(p, arguments); };
  QuickAsync.prototype.catch = function () { var p = this["[[Promise]]"]; return p.catch.apply(p, arguments); };
  QuickAsync.exec = function (generatorFunction) {
    // task = gf => QuickAsync.exec(gf);

    // API stability level: 1 - Experimental
    var qt = new QuickAsync(generatorFunction);
    if (qt.failed) throw qt.value;
    if (qt.done) return qt.value;
    return qt;
  };
  QuickAsync.all = function (tasks) {
    for (var t, i = 0, l = tasks.length, res = []; i < l; i += 1) {
      t = tasks[i];
      if (t && typeof t === "function") {
        if (t.failed) throw t.value;
        if (t.done) res[i] = t.value;
        else return env.Promise.all(tasks);  // can be quicker ?
      } else res[i] = t;
    }
    return res;
  };
  QuickAsync.race = function (tasks) {
    for (var t, i = 0, l = tasks.length; i < l; i += 1) {
      t = tasks[i];
      if (t && typeof t === "function") {
        if (t.failed) throw t.value;
        if (t.done) return t.value;
      } else return t;
    }
    return env.Promise.race(tasks);  // can be quicker ?
  };
  // should be useless because exec is quicker
  QuickAsync.sequence = function (sequence) {
    // API stability level: 1 - Experimental
    return QuickAsync.exec(function* () {
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
  env.QuickAsync = QuickAsync;
  env.newQuickAsync = function () { var c = env.QuickAsync, o = Object.create(c.prototype); c.apply(o, arguments); return o; };

}(this.env));
