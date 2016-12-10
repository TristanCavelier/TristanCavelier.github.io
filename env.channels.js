/*jslint indent: 2 */
(function envChannels(env) {
  "use strict";

  /*! env.channels.js Version 1.0.2

      Copyright (c) 2015-2016 Tristan Cavelier <t.cavelier@free.fr>
      This program is free software. It comes without any warranty, to
      the extent permitted by applicable law. You can redistribute it
      and/or modify it under the terms of the Do What The Fuck You Want
      To Public License, Version 2, as published by Sam Hocevar. See
      http://www.wtfpl.net/ for more details. */

  // dependencies:
  //   env.newPromise (async)
  // provides:
  //   env.Channel
  //   env.newChannel

  if (env.registerLib) env.registerLib(envChannels);

  function Channel(capacity) {
    // tips:
    //   Use as synchronous channel send and next
    //     chan = new Channel(Infinity)
    //     chan.send(1);  // adds 1 to the channel
    //     chan.next(true);  // returns {value: 1}
    //     chan.next(true);  // returns null
    //   Use as semaphore of length 2
    //     sem = new Channel(2);
    //     await sem.send(1);  // acquire
    //     await sem.next();  // release
    this["[[ChannelPendingSend]]"] = [];
    this["[[ChannelPendingNext]]"] = [];
    if (capacity > 0) this["[[ChannelCapacity]]"] = +capacity;
  }
  Channel.prototype["[[ChannelPendingSend]]"] = null;
  Channel.prototype["[[ChannelPendingNext]]"] = null;
  Channel.prototype["[[ChannelClosed]]"] = false;
  Channel.prototype["[[ChannelLength]]"] = 0;
  Channel.prototype["[[ChannelCapacity]]"] = 0;
  Channel._magic = function (a, value) {
    var node = {value: value, promise: null, resolve: null}, reject;
    node.promise = env.newPromise(function (r, j) { node.resolve = r; reject = j; });
    node.promise.cancel = function () {
      for (var l = a.length - 1; l >= 0; --l) if (a[l] === node) { a.splice(l, 1); break; }
      reject(new Error("cancelled"));
    };
    return node;
  };
  Channel.prototype.getLength = function () { return this["[[ChannelLength]]"]; };
  Channel.prototype.getCapacity = function () { return this["[[ChannelCapacity]]"]; };
  Channel.prototype.isClosed = function () { return this["[[ChannelClosed]]"]; };
  Channel.prototype.close = function () {
    var n = this["[[ChannelPendingNext]]"].splice(0), i = 0, l = n.length;
    this["[[ChannelClosed]]"] = true;
    for (; i < l; ++i) n[i].resolve({value: undefined, done: true});
  };
  Channel.prototype.send = function (value, iffree) {
    // value = ...
    //   the value to send into the channel
    // iffree = false
    //   if true, send only if someone is waiting for next or if the channel is free
    // returns boolean or Promise<boolean>, boolean is true if someone was waiting for next or if channel was free
    var n;
    if (this["[[ChannelClosed]]"]) throw new Error("channel closed");
    n = this["[[ChannelPendingNext]]"].shift();
    if (n) { n.resolve({value: value, done: false}); return true; }
    if (this["[[ChannelLength]]"] < this["[[ChannelCapacity]]"]) { ++this["[[ChannelLength]]"]; this["[[ChannelPendingSend]]"].push({value: value}); return true; }
    if (iffree) return false;
    this["[[ChannelPendingSend]]"].push(n = env.Channel._magic(this["[[ChannelPendingSend]]"], value));
    return n.promise;
  };
  Channel.prototype.next = function (iffilled) {
    // iffilled = false
    //   if true, returns next only if someone is sending or if the channel is filled, else null
    // returns object or Promise<object>, a dict like {value: next value, done: if channel closed}
    var n = this["[[ChannelPendingSend]]"][this["[[ChannelCapacity]]"]];
    if (n) n.resolve(false);
    n = this["[[ChannelPendingSend]]"].shift();
    if (this["[[ChannelPendingSend]]"].length < this["[[ChannelCapacity]]"]) this["[[ChannelLength]]"] = this["[[ChannelPendingSend]]"].length;
    if (n) return {value: n.value, done: false};
    if (this["[[ChannelClosed]]"]) return {value: undefined, done: true};
    if (iffilled) return null;
    this["[[ChannelPendingNext]]"].push(n = env.Channel._magic(this["[[ChannelPendingNext]]"]));
    return n.promise;
  };
  Channel.select = function (selector, iffilled) {
    // selector = [chan1, chan2, chan3]
    //   MUST be Channel instances
    // iffilled = false
    //   if true, returns first next only if someone is sending or if one channel is filled, else null
    // returns object or Promise<object>, a dict link {value: first next value, done: if related channel is closed}

    // Acts like `select` in go:
    //   select {
    //   case <-a:
    //     fmt.Println("a");
    //   default:
    //     fmt.Println("default");
    //   }
    // equivalent in javascript:
    //   var v = Channel.select([a], true);
    //   if (v === null)
    //     console.log("default")
    //   else if (v.channel === a)
    //     console.log("a")

    function concurrentSafeNext(pos, o) {
      var self = this, n;
      //if ((n = this.next(true))) return n;
      this["[[ChannelPendingNext]]"].push(n = env.Channel._magic(this["[[ChannelPendingNext]]"]));
      n.resolve = function (va) {
        var j = 0, m = o.cc.length;
        function fn() {}
        for (; j < m; ++j) if (j !== pos) {
          o.cc[j].then(null, fn);  // catch cancel errors
          try { o.cc[j].cancel(); } catch (_) {}
        }
        o.resolve({channel: self, index: pos, value: va.value, done: va.done});
      };
      return n.promise;
    }

    var i = 0, l = selector.length, c, v, o;
    for (; i < l; ++i)
      if (v = (c = selector[i]).next(true))
        return {channel: c, index: i, value: v.value, done: v.done};
    if (iffilled) return null;  // {channel: null, index: -1, value: undefined, done: false};

    o = {cc: [], resolve: null, reject: null, promise: null};
    o.promise = env.newPromise(function (r, j) {
      o.resolve = r;
      o.reject = j;
    });
    o.promise.cancel = function () {
      var j = 0, m = o.cc.length;
      function fn() {}
      for (; j < m; ++j) {
        o.cc[j].then(null, fn);  // catch cancel errors
        try { o.cc[j].cancel(); } catch (_) {}
      }
      o.reject(new Error("channel selection cancelled"));
    };
    for (i = 0; i < l; ++i)
      o.cc.push(concurrentSafeNext.call(selector[i], i, o));
    return o.promise;
  };
  env.Channel = Channel;
  env.newChannel = function () { var c = env.Channel, o = Object.create(c.prototype); c.apply(o, arguments); return o; };

}(this.env));
