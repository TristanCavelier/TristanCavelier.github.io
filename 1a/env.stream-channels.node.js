/*jslint indent: 2 */
(function envStreamChannels(env) {
  "use strict";

  /*! Copyright (c) 2015-2016 Tristan Cavelier <t.cavelier@free.fr>
      This program is free software. It comes without any warranty, to
      the extent permitted by applicable law. You can redistribute it
      and/or modify it under the terms of the Do What The Fuck You Want
      To Public License, Version 2, as published by Sam Hocevar. See
      http://www.wtfpl.net/ for more details. */

  if (env.registerLib) env.registerLib(envStreamChannels);

  var CLOSED_ERROR = env.Channel.CLOSED_ERROR;
  function ReadableStreamChannel(rs) {
    var chan = this;
    this["[[ReadableStreamChannel:readStream]]"] = rs;
    rs.on("error", function (err) { chan["[[ReadableStreamChannel:error]]"] = err; });
    rs.on("close", function () { chan["[[ReadableStreamChannel:error]]"] = chan["[[ReadableStreamChannel:error]]"] || CLOSED_ERROR; rs.resume(); });
    rs.on("end", function () { chan["[[ReadableStreamChannel:ended]]"] = true; });
  }
  ReadableStreamChannel.CLOSED_ERROR = ReadableStreamChannel.prototype.CLOSED_ERROR = CLOSED_ERROR;
  ReadableStreamChannel.prototype.getLength = function () { return NaN; };
  ReadableStreamChannel.prototype.next = function () {
    var err = this["[[ReadableStreamChannel:error]]"], rs, d;
    if (err) {
      if (err === CLOSED_ERROR) return {value: undefined, done: true};
      throw err;
    }
    if (this["[[ReadableStreamChannel:ended]]"]) return {value: undefined, done: true};
    rs = this["[[ReadableStreamChannel:readStream]]"];
    d = env.newDeferred();
    function onError(reason) {
      removeListeners();
      d.reject(reason);
    }
    function onData(chunk) {
      removeListeners();
      rs.pause();
      d.resolve({value: chunk, done: false});
    }
    function onClose() {
      removeListeners();
      d.resolve({value: undefined, done: true});
    }
    function onEnd() {
      removeListeners();
      d.resolve({value: undefined, done: true});
    }
    function removeListeners() {
      rs.removeListener("error", onError);
      rs.removeListener("data", onData);
      rs.removeListener("close", onClose);
      rs.removeListener("end", onEnd);
    }
    rs.once("error", onError);
    rs.once("data", onData);
    rs.once("close", onClose);
    rs.once("end", onEnd);
    rs.resume();
    return d.promise;  // uncancellable...
  };
  env.ReadableStreamChannel = ReadableStreamChannel;
  env.newReadableStreamChannel = function () { var c = env.ReadableStreamChannel, o = Object.create(c.prototype); c.apply(o, arguments); return o; };

  //ArrayReadableStreamReader(chunks)
  //ArrayReadableStreamReader.prototype.next = [..]
  //  +
  //  var next = this["[[ArrayReadableStreamReader:remaining]]"];
  //  if (next) {
  //    delete this["[[ArrayReadableStreamReader:remaining]]"];
  //    return {value: next, done: false};
  //  }
  //ArrayReadableStreamReader.prototype.readInto = taskify(function* (buffer, from, length) {
  //  // returning 0 means reader is closed or `from` is invalid or `length` is invalid.
  //  if (!(from > 0)) return 0;
  //  if (!(length > 0)) return 0;
  //  if (from >= length) return 0;
  //  var next = this["[[ArrayReadableStreamReader:remaining]]"];
  //  if (next) {
  //    delete this["[[ArrayReadableStreamReader:remaining]]"];
  //  } else {
  //    next = yield this.next();
  //    if (next.done) return 0;
  //    next = next.value;
  //  }
  //  for (var i = 0, l = next.length; i < length && i < l; i += 1)
  //    buffer[from + i] = next[i];
  //  if (i === 0)
  //    return this.readInto(buffer, from, length);  // this should not happen !
  //  if (i !== l)
  //    this["[[ArrayReadableStreamReader:remaining]]"] = next.slice(i);
  //  return i;
  //});

}(this.env));
