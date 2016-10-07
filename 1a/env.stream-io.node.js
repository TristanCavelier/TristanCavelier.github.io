/*jslint indent: 2 */
(function envStreamIo(env) {
  "use strict";

  /*! env.stream-io.node.js Version 1.0.0

      Copyright (c) 2015-2016 Tristan Cavelier <t.cavelier@free.fr>
      This program is free software. It comes without any warranty, to
      the extent permitted by applicable law. You can redistribute it
      and/or modify it under the terms of the Do What The Fuck You Want
      To Public License, Version 2, as published by Sam Hocevar. See
      http://www.wtfpl.net/ for more details. */

  // dependencies:
  //   env.newDeferred (async)
  //   env.QuickTask.exec (tasks)
  //   env.Channel.CLOSED_ERROR (channels)

  if (env.registerLib) env.registerLib(envStreamIo);

  const task = gf => env.QuickTask.exec(gf),
        taskify = gf => {
          var f = function () { return task(() => gf.apply(this, arguments)); };
          f.toString = () => `taskify(${gf.toString()})`;
          return f;
        };

  var CLOSED_ERROR = env.Channel.CLOSED_ERROR;
  function ReadableStreamReader(rs) {
    var chan = this;
    this["[[ReadableStreamReader:readStream]]"] = rs;
    rs.on("error", function (err) { chan["[[ReadableStreamReader:error]]"] = err; });
    rs.on("close", function () { chan["[[ReadableStreamReader:error]]"] = chan["[[ReadableStreamReader:error]]"] || CLOSED_ERROR; rs.resume(); });
    rs.on("end", function () { chan["[[ReadableStreamReader:ended]]"] = true; });
  }
  ReadableStreamReader.CLOSED_ERROR = ReadableStreamReader.prototype.CLOSED_ERROR = CLOSED_ERROR;
  ReadableStreamReader.prototype.read = taskify(function* (count) {
    //     read([count int]) array
    // `count === undefined` means "size of internal buffer"
    var next = this["[[ReadableStreamReader:remaining]]"];
    if (next) {
      delete this["[[ReadableStreamReader:remaining]]"];
      if (count === undefined) return next;
      if (!(count > 0)) return [];
      if (count >= next.length) return next;
      this["[[ReadableStreamReader:remaining]]"] = next.slice(count);
      return next.slice(0, count);
    }
    if (count !== undefined) {
      this["[[ReadableStreamReader:remaining]]"] = yield this.read();
      return this.read(count);
    }
    var err = this["[[ReadableStreamReader:error]]"], rs, d;
    if (err) {
      if (err === CLOSED_ERROR) return [];
      throw err;
    }
    if (this["[[ReadableStreamReader:ended]]"]) return [];
    rs = this["[[ReadableStreamReader:readStream]]"];
    d = env.newDeferred();
    function onError(reason) {
      removeListeners();
      d.reject(reason);
    }
    function onData(chunk) {
      removeListeners();
      rs.pause();
      d.resolve(chunk);
    }
    function onClose() {
      removeListeners();
      d.resolve([]);
    }
    function onEnd() {
      removeListeners();
      d.resolve([]);
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
  });
  ReadableStreamReader.prototype.readInto = taskify(function* (array, from, length) {
    //     readInto(array array, from, length int) readCount int
    var buffer = yield this.read(length), i = 0;
    length = buffer.length;
    while (i < length) array[i + from] = buffer[i++];
    return length;
  });
  env.ReadableStreamReader = ReadableStreamReader;
  env.newReadableStreamReader = function () { var c = env.ReadableStreamReader, o = Object.create(c.prototype); c.apply(o, arguments); return o; };

}(this.env));
