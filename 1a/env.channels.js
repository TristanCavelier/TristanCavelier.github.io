/*jslint indent: 2 */
(function envChannels(env) {
  "use strict";

  /*! env.channels.js Version 1.0.3

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
    var ths = this;
    this["[[ChannelPendingSend]]"] = [];
    this["[[ChannelPendingNext]]"] = [];
    this["[[ChannelReadablePromise]]"] = env.newPromise(function (r) { ths["[[ChannelReadableResolver]]"] = r; });
    if (capacity > 0) this["[[ChannelCapacity]]"] = +capacity;
  }
  Channel.CLOSED_ERROR = Channel.prototype.CLOSED_ERROR = new Error("channel closed");
  Channel.SEND_CANCELLED_ERROR = Channel.prototype.SEND_CANCELLED_ERROR = new Error("send cancelled");
  Channel.NEXT_CANCELLED_ERROR = Channel.prototype.NEXT_CANCELLED_ERROR = new Error("next cancelled");
  Channel.SELECT_CANCELLED_ERROR = Channel.prototype.SELECT_CANCELLED_ERROR = new Error("select cancelled");
  Channel.prototype["[[ChannelClosed]]"] = false;
  Channel.prototype["[[ChannelLength]]"] = 0;
  Channel.prototype["[[ChannelCapacity]]"] = 0;
  Channel.prototype["[[ChannelReadable]]"] = false;
  Channel.prototype["[[ChannelReadablePromise]]"] = null;
  Channel.prototype["[[ChannelReadableResolver]]"] = null;
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
  Channel.prototype.isEmpty = function () { return this["[[ChannelLength]]"] <= 0; };
  Channel.prototype.isFree = function () { return this["[[ChannelLength]]"] < this["[[ChannelCapacity]]"]; };
  Channel.prototype.isFilled = function () { return this["[[ChannelLength]]"] > 0; };
  Channel.prototype.isFull = function () { return this["[[ChannelLength]]"] >= this["[[ChannelCapacity]]"]; };
  Channel.prototype.isReadable = function () { return this["[[ChannelReadable]]"]; };
  Channel.prototype.onReadable = function (callback) { this["[[ChannelReadablePromise]]"].then(callback); return this; };
  Channel.prototype.waitReadable = function () { return this["[[ChannelReadablePromise]]"]; };
  Channel.prototype.close = function () {
    var n = this["[[ChannelPendingNext]]"].splice(0), i = 0, l = n.length;
    this["[[ChannelClosed]]"] = true;
    for (; i < l; ++i) n[i].resolve({value: undefined, done: true});
  };
  Channel.prototype.send = function (value) {
    // value = ...
    //   the value to send into the channel
    // returns undefined or Promise<undefined>
    //   fulfilled when sent value traverse the channel,
    //   cancelling `chan.next` will never get `value`.
    var n, ths = this;
    if (this["[[ChannelClosed]]"]) throw Channel.CLOSED_ERROR;
    n = this["[[ChannelPendingNext]]"].shift();
    if (n) {
      n.resolve({value: value, done: false});
      return;
    }
    if (this["[[ChannelLength]]"] < this["[[ChannelCapacity]]"]) {
      ++this["[[ChannelLength]]"];
      this["[[ChannelPendingSend]]"].push({value: value});
      this["[[ChannelReadable]]"] = true;
      this["[[ChannelReadableResolver]]"]();
      return;
    }

    n = {value: value, promise: null, resolve: null, reject: null};
    n.promise = env.newPromise(function (r, j) { n.resolve = r; n.reject = j; });
    n.promise.cancel = function () {
      var a = ths["[[ChannelPendingSend]]"], l = a.length - 1;
      for (; l >= 0; --l) if (a[l] === n) { a.splice(l, 1); break; }
      if (ths["[[ChannelReadable]]"] && a.length === 0) {
        ths["[[ChannelReadable]]"] = false;
        ths["[[ChannelReadablePromise]]"] = env.newPromise(function (r) { ths["[[ChannelReadableResolver]]"] = r; });
      }
      n.reject(Channel.SEND_CANCELLED_ERROR);
    };

    this["[[ChannelPendingSend]]"].push(n);
    this["[[ChannelReadable]]"] = true;
    this["[[ChannelReadableResolver]]"]();
    return n.promise;
  };
  Channel.prototype.next = function () {
    // returns object or Promise<object>
    //   `object` is a dict like {value: next value, done: if channel closed}
    var n = this["[[ChannelPendingSend]]"][this["[[ChannelCapacity]]"]], ths = this;
    if (n) n.resolve();
    n = this["[[ChannelPendingSend]]"].shift();
    if (this["[[ChannelPendingSend]]"].length < this["[[ChannelCapacity]]"])
      this["[[ChannelLength]]"] = this["[[ChannelPendingSend]]"].length;
    if (n) {
      if (this["[[ChannelPendingSend]]"].length === 0) {
        this["[[ChannelReadable]]"] = false;
        this["[[ChannelReadablePromise]]"] = env.newPromise(function (r) { ths["[[ChannelReadableResolver]]"] = r; });
      }
      return {value: n.value, done: false};
    }
    if (this["[[ChannelClosed]]"]) return {value: undefined, done: true};

    n = {promise: null, resolve: null, reject: null};
    n.promise = env.newPromise(function (r, j) { n.resolve = r; n.reject = j; });
    n.promise.cancel = function () {
      var a = ths["[[ChannelPendingNext]]"], l = a.length - 1;
      for (; l >= 0; --l) if (a[l] === n) { a.splice(l, 1); break; }
      n.reject(Channel.NEXT_CANCELLED_ERROR);
    };

    this["[[ChannelPendingNext]]"].push(n);
    return n.promise;
  };
  Channel.select = function (selector, ifreadable) {
    // selector = [chan1, chan2, chan3]
    //   MUST be Channel instances
    // ifreadable = false
    //   if true, returns first next only if someone is readable, else null
    // returns object or Promise<object>
    //   object is a dict link {value: first next value, done: if related channel is closed}

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

    var i = 0, l = selector.length, c, v, o;
    for (; i < l; ++i)
      if ((c = selector[i]).isReadable())
        if (v = c.next())
          return {channel: c, index: i, value: v.value, done: v.done};
    if (ifreadable) return null;  // {channel: null, index: -1, value: undefined, done: false};

    o = {resolve: null, reject: null, promise: null};
    o.promise = env.newPromise(function (r, j) { o.resolve = r; o.reject = j; });
    o.promise.cancel = function () {
      var j = o.reject;
      o = null;
      j(Channel.SELECT_CANCELLED_ERROR);
    };

    function onthen(chan, index) {
      return function () {
        var r, v;
        if (o === null) return;
        if (!chan.isReadable()) return chan.waitReadable().then(onthen(chan, index));
        r = o.resolve;
        o = null;
        v = chan.next();
        r({channel: chan, index: index, value: v.value, done: v.done});
      }
    }

    for (i = 0; i < l; ++i)
      selector[i].waitReadable().then(onthen(selector[i], i));
    return o.promise;
  };
  env.Channel = Channel;
  env.newChannel = function () { var c = env.Channel, o = Object.create(c.prototype); c.apply(o, arguments); return o; };

}(this.env));
