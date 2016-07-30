(function envFsHelpers(env) {
  "use strict";

  /*! Copyright (c) 2015-2016 Tristan Cavelier <t.cavelier@free.fr>
      This program is free software. It comes without any warranty, to
      the extent permitted by applicable law. You can redistribute it
      and/or modify it under the terms of the Do What The Fuck You Want
      To Public License, Version 2, as published by Sam Hocevar. See
      http://www.wtfpl.net/ for more details. */

  // dependencies: async (env.Promise, env.newDeferred),
  //               tasks (env.Task, env.QuickTask),
  //               string-helpers (env.formatStringFromDict),
  //               crypto-helpers (env.randomBytes)

  env.registerLib(envFsHelpers);

  const fs = require("fs"),
        filepath = require("path"),
        task = gf => env.QuickTask.exec(gf),
        taskify = gf => {
          var f = function () { return task(() => gf.apply(this, arguments)); };
          f.toString = () => `taskify(${gf.toString()})`;
          return f;
        };

  function wrapNodeJsAsyncMethod(fn) {  // move in node-helpers ?
    return function () {
      var deferred = env.newDeferred(), l = arguments.length, a = new Array(l + 1), i = 0;
      while (i < l) { a[i] = arguments[i++]; }
      a[i] = function (err, one) {
        if (err) { return deferred.reject(err); }
        deferred.resolve(one);
      };
      fn.apply(null, a);
      return deferred.promise;
    };
  }
  env.wrapNodeJsAsyncMethod = wrapNodeJsAsyncMethod;
  //function wrapTaskErrValues(fn) {
  //  return function () {
  //    var deferred = env.newDeferred(), l = arguments.length, a = new Array(l + 1), i = 0;
  //    while (i < l) { a[i] = arguments[i++]; }
  //    a[i] = function (err) {
  //      if (err) { return deferred.reject(err); }
  //      l = arguments.length - 1;
  //      a = new Array(l);
  //      i = 0;
  //      while (i < l) { a[i] = arguments[++i]; }
  //      deferred.resolve(a);
  //    };
  //    fn.apply(null, a);
  //    return deferred.promise;
  //  };
  //}

  env.readDirectory = wrapNodeJsAsyncMethod(fs.readdir);
  env.makeDirectory = wrapNodeJsAsyncMethod(fs.mkdir);
  env.removeDirectory = wrapNodeJsAsyncMethod(fs.rmdir);
  env.openFileDescriptor = wrapNodeJsAsyncMethod(fs.open);
  env.readFileDescriptor = wrapNodeJsAsyncMethod(fs.read);
  env.closeFileDescriptor = wrapNodeJsAsyncMethod(fs.close);
  env.writeFileDescriptor = wrapNodeJsAsyncMethod(fs.write);
  env.statFileDescriptor = wrapNodeJsAsyncMethod(fs.fstat);
  env.statFsNode = wrapNodeJsAsyncMethod(fs.stat);
  env.writeFile = wrapNodeJsAsyncMethod(fs.writeFile);
  env.unlinkFsNode = wrapNodeJsAsyncMethod(fs.unlink);
  env.renameFsNode = wrapNodeJsAsyncMethod(fs.rename);
  env.symlinkFsNode = wrapNodeJsAsyncMethod(fs.symlink);
  env.linkFsNode = wrapNodeJsAsyncMethod(fs.link);  // XXX can we link a directory ?

  var CLOSED_ERROR = env.Channel.CLOSED_ERROR;
  var ENDED_ERROR = new Error("ended");

  function FsWriterChannel(path, options) {
    var rs = fs.createWriteStream(path, options), chan = this;
    this["[[FsWriterChannel:writeStream]]"] = rs;
    rs.on("error", function (err) { chan["[[FsWriterChannel:error]]"] = err; rs.end(); });
    rs.on("finish", function () { chan["[[FsWriterChannel:error]]"] = chan["[[FsWriterChannel:error]]"] || CLOSED_ERROR; });
  }
  FsWriterChannel.CLOSED_ERROR = FsWriterChannel.prototype.CLOSED_ERROR = CLOSED_ERROR;
  FsWriterChannel.prototype.close = function () {
    var err = this["[[FsWriterChannel:error]]"]
    if (err) {
      //if (err === CLOSED_ERROR) return env.Promise.resolve();
      //return env.Promise.reject(err);
      if (err === CLOSED_ERROR) return;
      throw err;
    }
    this["[[FsWriterChannel:error]]"] = CLOSED_ERROR;
    this["[[FsWriterChannel:writeStream]]"].end();
    //return env.Promise.resolve();
  };
  FsWriterChannel.prototype.send = function (buffer) {
    var err = this["[[FsWriterChannel:error]]"], rs, d, chan = this;
    //if (err) return env.Promise.reject(err);
    if (err) throw err;
    rs = this["[[FsWriterChannel:writeStream]]"];
    d = env.newDeferred();
    function errorListener(err) { d.reject(err); }
    rs.once("error", errorListener);
    rs.write(buffer, function () {
      rs.removeListener("error", errorListener);
      d.resolve();
    });
    return d.promise;  // uncancellable...
  };
  env.FsWriterChannel = FsWriterChannel;
  env.createFsWriterChannel = function () { var c = env.FsWriterChannel, o = Object.create(c.prototype); c.apply(o, arguments); return o; };

  function FileWriter(path, options) {
    var rs = fs.createWriteStream(path, options), chan = this;
    this["[[FileWriter:writeStream]]"] = rs;
    rs.on("error", function (err) { chan["[[FileWriter:error]]"] = err; rs.end(); });
    rs.on("finish", function () { chan["[[FileWriter:error]]"] = chan["[[FileWriter:error]]"] || CLOSED_ERROR; });
  }
  FileWriter.CLOSED_ERROR = FileWriter.prototype.CLOSED_ERROR = CLOSED_ERROR;
  FileWriter.prototype.close = function () {
    var err = this["[[FileWriter:error]]"]
    if (err) {
      //if (err === CLOSED_ERROR) return env.Promise.resolve();
      //return env.Promise.reject(err);
      if (err === CLOSED_ERROR) return;
      throw err;
    }
    this["[[FileWriter:error]]"] = CLOSED_ERROR;
    this["[[FileWriter:writeStream]]"].end();
    //return env.Promise.resolve();
  };
  FileWriter.prototype.write = function (buffer, from, length) {
    if (from !== undefined || length !== undefined) {
      if (from === undefined) from = 0;
      if (length === undefined) length = buffer.length - from;
      buffer = buffer.slice(from, from + length);
    }
    var err = this["[[FileWriter:error]]"], rs, d, chan = this;
    //if (err) return env.Promise.reject(err);
    if (err) throw err;
    rs = this["[[FileWriter:writeStream]]"];
    d = env.newDeferred();
    function errorListener(err) { d.reject(err); }
    rs.once("error", errorListener);
    rs.write(buffer, function () {
      rs.removeListener("error", errorListener);
      d.resolve();
    });
    return d.promise;  // uncancellable...
  };
  env.FileWriter = FileWriter;
  env.createFileWriter = function () { var c = env.FileWriter, o = Object.create(c.prototype); c.apply(o, arguments); return o; };

  function FsReaderChannel(path, options) {
    // takes createReadStream options + pipes
    // ex: new FsReaderChannel("myfile", {pipes: [zlib.createGzip()]});
    var rs = fs.createReadStream(path, options), chan = this, pipes = options && options.pipes;
    if (pipes) { pipes.forEach(function (pipe) { rs = rs.pipe(pipe); }); }
    this["[[FsReaderChannel:readStream]]"] = rs;
    rs.on("error", function (err) { chan["[[FsReaderChannel:error]]"] = err; rs.close(); });
    rs.on("close", function () { chan["[[FsReaderChannel:error]]"] = chan["[[FsReaderChannel:error]]"] || CLOSED_ERROR; rs.resume(); });
    rs.on("end", function () { chan["[[FsReaderChannel:ended]]"] = true; });
  }
  FsReaderChannel.CLOSED_ERROR = FsReaderChannel.prototype.CLOSED_ERROR = CLOSED_ERROR;
  FsReaderChannel.prototype.close = function () {
    var err = this["[[FsReaderChannel:error]]"]
    if (err) {
      //if (err === CLOSED_ERROR) return env.Promise.resolve();
      //return env.Promise.reject(err);
      if (err === CLOSED_ERROR) return;
      throw err;
    }
    this["[[FsReaderChannel:error]]"] = CLOSED_ERROR;
    this["[[FsReaderChannel:readStream]]"].close();
    //return env.Promise.resolve();
  };
  FsReaderChannel.prototype.next = function () {
    var err = this["[[FsReaderChannel:error]]"], rs, d;
    if (err) {
      //if (err === CLOSED_ERROR) return env.Promise.resolve({done: true});
      //return env.Promise.reject(err);
      if (err === CLOSED_ERROR) return {done: true};
      throw err;
    }
    //if (this["[[FsReaderChannel:ended]]"]) return env.Promise.resolve({done: true});
    if (this["[[FsReaderChannel:ended]]"]) return {done: true};
    rs = this["[[FsReaderChannel:readStream]]"];
    d = env.newDeferred();
    function onError(reason) {
      removeListeners();
      d.reject(reason);
    }
    function onData(chunk) {
      removeListeners();
      rs.pause();
      d.resolve({value: chunk});
    }
    function onClose() {
      removeListeners();
      d.resolve({done: true});
    }
    function onEnd() {
      removeListeners();
      d.resolve({done: true});
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
  env.FsReaderChannel = FsReaderChannel;
  env.createFsReaderChannel = function () { var c = env.FsReaderChannel, o = Object.create(c.prototype); c.apply(o, arguments); return o; };

  function FileReader(path, options) {
    // takes createReadStream options + options.pipes
    // ex: new FileReader("myfile", {pipes: [zlib.createGzip()]});
    var rs = fs.createReadStream(path, options), chan = this, pipes = options && options.pipes;
    if (pipes) pipes.forEach(function (pipe) { rs = rs.pipe(pipe); });
    this["[[FileReader:readStream]]"] = rs;
    rs.on("error", function (err) { chan["[[FileReader:error]]"] = err; rs.close(); });
    rs.on("close", function () { chan["[[FileReader:error]]"] = chan["[[FileReader:error]]"] || CLOSED_ERROR; rs.resume(); });
    rs.on("end", function () { chan["[[FileReader:ended]]"] = true; });
  }
  FileReader.CLOSED_ERROR = FileReader.prototype.CLOSED_ERROR = CLOSED_ERROR;
  FileReader.prototype.close = function () {
    var err = this["[[FileReader:error]]"]
    if (err) {
      //if (err === CLOSED_ERROR) return env.Promise.resolve();
      //return env.Promise.reject(err);
      if (err === CLOSED_ERROR) return;
      throw err;
    }
    this["[[FileReader:error]]"] = CLOSED_ERROR;
    this["[[FileReader:readStream]]"].close();
    //return env.Promise.resolve();
  };
  FileReader.prototype.read = taskify(function* (count) {
    //     read([count int]) array
    // `count === undefined` means "size of internal buffer"
    var next = this["[[FileReader:remaining]]"];
    if (next) {
      delete this["[[FileReader:remaining]]"];
      if (count === undefined) return next;
      if (!(count > 0)) return new Buffer(0);
      if (count >= next.length) return next;
      this["[[FileReader:remaining]]"] = next.slice(count);
      return next.slice(0, count);
    }
    if (count !== undefined) {
      this["[[ReadableStreamReader:remaining]]"] = yield this.read();
      return this.read(count);
    }
    var err = this["[[FileReader:error]]"], rs, d;
    if (err) {
      //if (err === CLOSED_ERROR) return env.Promise.resolve(new Buffer(0));
      //return env.Promise.reject(err);
      if (err === CLOSED_ERROR) return new Buffer(0);
      throw err;
    }
    //if (this["[[FileReader:ended]]"]) return env.Promise.resolve(new Buffer(0));
    if (this["[[FileReader:ended]]"]) return new Buffer(0);
    rs = this["[[FileReader:readStream]]"];
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
      d.resolve(new Buffer(0));
    }
    function onEnd() {
      removeListeners();
      d.resolve(new Buffer(0));
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
  FileReader.prototype.readInto = taskify(function* (array, from, length) {
    //     readInto(array array, from, length int) readCount int
    var buffer = yield this.read(length), i = 0;
    length = buffer.length;
    while (i < length) array[i + from] = buffer[i++];
    return length;
  });
  env.FileReader = FileReader;
  env.createFileReader = function () { var c = env.FileReader, o = Object.create(c.prototype); c.apply(o, arguments); return o; };

  function File(params) {
    this.fd = params.fd;
    this.path = params.path;
  }
  File.prototype.close = function () { return env.closeFileDescriptor(this.fd); };
  File.prototype.getStat = function () { return env.statFileDescriptor(this.fd); };
  File.prototype.getReaderChannel = function (options) {
    options = options || {};
    return env.createFsReaderChannel("", {  // ignore 'mode' and 'flags' options
      fd: this.fd,
      autoClose: false,
      start: options.start,
      end: options.end,
      encoding: options.encoding,
      pipes: options.pipes
    });
  };
  File.prototype.getReader = function (options) {
    options = options || {};
    return env.createFileReader("", {  // ignore 'mode' and 'flags' options
      fd: this.fd,
      autoClose: false,
      start: options.start,
      end: options.end,
      encoding: options.encoding,
      pipes: options.pipes
    });
  };
  File.prototype.getWriterChannel = function (options) {
    options = options || {};
    return env.createFsWriterChannel(this.path, {  // ignore 'mode' and 'flags' options
      fd: this.fd,
      start: options.start,
      end: options.end,
      defaultEncoding: options.defaultEncoding
    });
  };
  File.prototype.getWriter = function (options) {
    options = options || {};
    return env.createFileWriter(this.path, {  // ignore 'mode' and 'flags' options
      fd: this.fd,
      start: options.start,
      end: options.end,
      defaultEncoding: options.defaultEncoding
    });
  };
  File.prototype.read = taskify(function* (options) {
    options = options || {};
    var next, array = [], chan = env.createFsReaderChannel("", { // ignore 'mode' and 'flags' options
      fd: this.fd,
      autoClose: false,
      start: options.start,
      end: options.end,
      encoding: options.encoding,
      pipes: options.pipes
    });
    while (!(next = yield chan.next()).done) { array.push(next.value); }
    if (typeof array[0] === "string") { return array.join(""); }
    return Buffer.concat(array);
  });
  env.File = File;

  /////////////
  // Readers
  env.readFile = function (path, options) {  // don't use fs.readFile because env.readFile is cancellable and can handle 'fd'
    return task(function* () {
      options = options || {};
      var next, array = [], chan = env.createFsReaderChannel(path, { // ignore 'mode'
        autoClose: true,
        flags: options.flags,
        start: options.start,
        end: options.end,
        fd: options.fd,
        encoding: options.encoding,
        pipes: options.pipes
      });
      this.catch(() => chan.close());  // in case of cancellation
      while (!(next = yield chan.next()).done) { array.push(next.value); }
      chan.close();
      if (typeof array[0] === "string") { return array.join(""); }
      return Buffer.concat(array);
    });
  };

  env.openFile = function (path, flag, mode) {
    return task(function* () {
      var fdtask, fd;
      this.catch(() => fdtask.then(fd => env.closeFileDescriptor(fd)));
      fd = yield fdtask = env.openFileDescriptor(path, flag || "r", mode);
      return new env.File({path: path, fd: fd});
    });
  };

  /////////////
  // Writers
  env.createFile = function (path) { return env.openFile(path, "w"); };
  env.createExclusiveFile = function (path) { return env.openFile(path, "wx"); };
  env.writeExclusiveFile = function (path, data) { return env.writeFile(path, data, {flag: "wx"}); };
  env.makeFile = function (path) { return env.writeFile(path, "", {flag: "wx"}); };

  env.renameExclusiveFile = taskify(function* (oldPath, newPath) {
    yield env.makeFile(newPath);
    try {
      yield env.renameFsNode(oldPath, newPath);
    } catch (reason) {
      yield env.unlinkFsNode(newPath);
      //return env.Promise.reject(reason);
      throw reason;
    }
  });
  // $ touch a b ; mkdir f
  //function fatal(m) { console.error(m); require("process").exit(1); }
  //env.renameExclusiveFile("a", "b").then(()=>fatal("ref1"), b=>console.log(b.code === "EEXIST"))
  //env.renameExclusiveFile("a", "c").then(()=>console.log(true), ()=>fatal("ref2"));
  //env.renameExclusiveFile("f", "d").then((a)=>fatal(a), (b)=>console.log(b.code === "ENOTDIR"))

  env.renameExclusiveDirectory = taskify(function* (oldPath, newPath) {
    yield env.makeDirectory(newPath);
    try {
      yield env.renameFsNode(oldPath, newPath);
    } catch (reason) {
      yield env.unlinkFsNode(newPath);
      //return env.Promise.reject(reason);
      throw reason;
    }
  });
  // $ mkdir a b ; touch c
  //function fatal(m) { console.error(m); require("process").exit(1); }
  //env.renameExclusiveDirectory("a", "b").then(()=>fatal("red1"), b=>console.log(b.code === "EEXIST"))
  //env.renameExclusiveDirectory("a", "f").then(()=>console.log(true), ()=>fatal("red2"));
  //env.renameExclusiveDirectory("c", "d").then((a)=>fatal(a), (b)=>console.log(b.code === "EISDIR"))

  env.copyFile = function (oldPath, newPath, options) {
    return task(function* () {
      var r, w, next;
      options = options || {};
      r = env.createFsReaderChannel(oldPath, options.readerOptions), w, next;
      this.catch(() => r.close());  // not this.then because of autoClose
      w = env.createFsWriterChannel(newPath, options.writerOptions);
      this.catch(() => w.close());  // not this.then because w.close is called below
      while (!(next = yield r.next()).done) { yield w.send(next.value); }
      w.close();
    });
  };
  //env.copyFile("server/bin/servetcrxovhpublicserver", "c").then(a => console.log(a), b => console.log(b));

  env.copyExclusiveFile = function (oldPath, newPath) { return env.copyFile(oldPath, newPath, {writerOptions: {flags: "wx"}}); };
  //env.copyExclusiveFile("server/bin/servetcrxovhpublicserver", "d").then(a => console.log(a), b => console.log(b));

  env.moveFile = function (oldPath, newPath) {
    // XXX what if directory ?
    return task(function* () {
      var ret;
      try {
        ret = yield env.renameFsNode(oldPath, newPath);
        return ret;
      } catch (reason) {
        //if (reason.code !== "EXDEV") return env.Promise.reject(reason);
        if (reason.code !== "EXDEV") throw reason;
        var r = env.createFsReaderChannel(oldPath);
        this.catch(() => r.close());  // not this.then because of autoClose
        var w = env.createFsWriterChannel(newPath), next;
        this.catch(() => w.close());  // not this.then because w.close is called below
        while (!(next = yield r.next()).done) { yield w.send(next.value); }
        w.close();  // no need to close oldPath to remove it
        return env.unlinkFsNode(oldPath);
      }
    });
  };

  env.moveExclusiveFile = function (oldPath, newPath) {
    // XXX what if directory ?
    return task(function* () {
      var ret, w = env.createFsWriterChannel(newPath, {flags: "wx"});
      this.catch(() => w.close());  // not this.then because w.close are called below
      try {
        ret = yield env.renameFsNode(oldPath, newPath);
      } catch (reason) {
        //if (reason.code !== "EXDEV") return env.Promise.reject(reason);
        if (reason.code !== "EXDEV") throw reason;
        var r = env.createFsReaderChannel(oldPath), next;
        this.catch(() => r.close());  // not this.then because of autoClose
        while (!(next = yield r.next()).done) { yield w.send(next.value); }
        w.close();  // no need to close oldPath to remove it
        return env.unlinkFsNode(oldPath);
      }
      w.close();
      return ret;
    });
  };

  env.makeAllDirectory = taskify(function* (desiredPath) {
    var pathes = desiredPath.split(filepath.sep), stats, i = 0, l = pathes.length;
    while (++i < l) { pathes[i] = pathes[i - 1] + filepath.sep + pathes[i]; }
    for (i = pathes[0] === "" ? 1 : 0; i < l; i += 1) {
      stats = null;
      try { stats = yield env.statFsNode(pathes[i]); }
      //catch (reason) { if (reason.code !== "ENOENT") return env.Promise.reject(reason); }
      catch (reason) { if (reason.code !== "ENOENT") throw reason; }
      if (!stats) { yield env.makeDirectory(pathes[i]); }
      else if (!stats.isDirectory()) {
        stats = new Error("ENOTDIR, not a directory '" + pathes[i] + "'");
        stats.errno = 20;
        stats.code = "ENOTDIR";
        stats.path = pathes[i];
        stats.syscall = 'mkdir';
        //return env.Promise.reject(stats);
        throw stats;
      }
    }
  });

  env.removeAllDirectory = taskify(function* (desiredPath) {
    //var pathes = desiredPath.split(filepath.sep), i = 0, l = pathes.length;
    //while (++i < l) { pathes[i] = pathes[i - 1] + filepath.sep + pathes[i]; }
    //for (i = l - 1; i >= 0; i -= 1) { yield env.removeDirectory(pathes[i]); }
    var pathes = desiredPath.split(filepath.sep), stats, i = 0, l = pathes.length, s;
    while (++i < l) { pathes[i] = pathes[i - 1] + filepath.sep + pathes[i]; }
    s = pathes[0] === "" ? 1 : 0;
    for (i = l - 1; i >= s; i -= 1) {
      try { yield env.removeDirectory(pathes[i]); }
      catch (reason) {
        if (reason.code === "ENOTEMPTY" || reason.code === "ENOTDIR") break;
        //if (reason.code !== "ENOENT") return env.Promise.reject(reason);
        if (reason.code !== "ENOENT") throw reason;
      }
    }
  });

  env.createNewFile = function (desiredPath, options) {
    // options.baseFormat
    // options.mode
    // options.encoding
    return task(function* () {
      var parsed, format, pafh, i = 1, fd, fdtask;
      parsed = filepath.parse(desiredPath);
      options = options || {};
      format = options.baseFormat !== undefined ? options.baseFormat : "%(name)s (%(index)s)%(ext)s";
      pafh = desiredPath;
      this.catch(() => fdtask.then(fd => env.closeFileDescriptor(fd)));
      for (;; i += 1) {
        try {
          fd = yield fdtask = env.openFileDescriptor(pafh, "wx", options.mode);
          return new env.File({path: pafh, fd: fd});
        } catch (reason) {
          //if (reason.code !== "EEXIST") return env.Promise.reject(reason);
          if (reason.code !== "EEXIST") throw reason;
        }
        pafh = filepath.join(parsed.dir, env.formatStringFromDict(format, {index: i, base: parsed.base, name: parsed.name, ext: parsed.ext}));
      }
    });
  };
  //env.createNewFile("c.d", {baseFormat: "%(name)s--%(ext)s--%(index)s"}).then(a => console.log(a), b => console.log(b));

  env.writeNewFile = taskify(function* (desiredPath, data, options) {
    // options.baseFormat
    // options.mode
    // options.encoding
    var parsed, format, pafh, i = 1;
    parsed = filepath.parse(desiredPath);
    options = options || {};
    format = options.baseFormat !== undefined ? options.baseFormat : parsed.base.replace("%", "%%") + " (%(index)s)" + parsed.ext.replace("%", "%%");
    pafh = desiredPath;
    for (;; i += 1) {
      try {
        yield env.writeFile(pafh, data, {flag: "wx", mode: options.mode, encoding: options.encoding});
        return pafh;
      } catch (reason) {
        //if (reason.code !== "EEXIST") return env.Promise.reject(reason);
        if (reason.code !== "EEXIST") throw reason;
      }
      pafh = filepath.join(parsed.dir, env.formatStringFromDict(format, {index: i, base: parsed.base, name: parsed.name, ext: parsed.ext}));
    }
  });
  // env.writeNewFile("a/b", "").then(a => console.log(a), b => console.error(b));
  // env.writeNewFile("a/b", "").then(a => console.log(a), b => console.error(b));
  // env.writeNewFile("a/b", "", {baseFormat: "%(base)s_%(index)s_"}).then(a => console.log(a), b => console.error(b));
  // env.writeNewFile("a/b", "", {baseFormat: "%(base)s_%(index)s_"}).then(a => console.log(a), b => console.error(b));

  env.getTempDir = function () {
    // taken from GO os.TempDir
    var dir = process.env.TMPDIR;
    if (dir) { return dir; }
    if (process.platform === "android") { return "/data/local/tmp"; }
    return "/tmp";
  };

  env.createTempFile = function (options) {
    // options.dir
    // options.first
    // options.prefix
    // options.suffix
    // options.mode
    return task(function* () {
      var dir, prefix, suffix, random, pafh, fdtask, fd, len = 2;
      dir = options && options.dir !== undefined ? options.dir : env.getTempDir();
      prefix = options && options.prefix !== undefined ? options.prefix : "tmp.";
      suffix = options && options.suffix !== undefined ? options.suffix : "";
      if (options.first !== undefined) {
        pafh = filepath.join(dir, options.first);
      } else {
        random = yield env.randomBytes(len++);
        pafh = filepath.join(dir, prefix + random.toString("hex") + suffix);
      }
      this.catch(() => fdtask.then((fd) => env.closeFileDescriptor(fd)))
      for (;; len += 1) {
        try {
          fd = yield fdtask = env.openFileDescriptor(pafh, "wx", options.mode);
          return new env.File({path: pafh, fd: fd});
        } catch (reason) {
          //if (reason.code !== "EEXIST") return env.Promise.reject(reason);
          if (reason.code !== "EEXIST") throw reason;
        }
        random = yield env.randomBytes(len);
        pafh = filepath.join(dir, prefix + random.toString("hex") + suffix);
      }
    });
  };
  //setTimeout(() => { env.createTempFile({dir: "."}).then((a) => console.log(a), (b) => console.error(b)) });
  //setTimeout(() => null, 10000);  // lsof | grep $(pwd)

  env.writeTempFile = taskify(function* (data, options) {
    // options.dir
    // options.first
    // options.prefix
    // options.suffix
    // options.mode
    // options.encoding
    var dir, prefix, suffix, random, pafh, len = 2;
    options = options || {};
    dir = options.dir !== undefined ? options.dir : env.getTempDir();
    prefix = options.prefix !== undefined ? options.prefix : "tmp.";
    suffix = options.suffix !== undefined ? options.suffix : "";
    if (options.first !== undefined) {
      pafh = filepath.join(dir, options.first);
    } else {
      random = yield env.randomBytes(len++);
      pafh = filepath.join(dir, prefix + random.toString("hex") + suffix);
    }
    for (;; len += 1) {
      try {
        yield env.writeFile(pafh, data, {flag: "wx", mode: options.mode, encoding: options.encoding});
        return pafh;
      } catch (reason) {
        //if (reason.code !== "EEXIST") return env.Promise.reject(reason);
        if (reason.code !== "EEXIST") throw reason;
      }
      random = yield env.randomBytes(len);
      pafh = filepath.join(dir, prefix + random.toString("hex") + suffix);
    }
  });
  //setTimeout(() => { env.writeTempFile("hello world!", {dir: "."}).then((a) => console.log(a), (b) => console.error(b)) });
  //setTimeout(() => null, 10000);  // lsof | grep $(pwd)

  env.makeTempFile = function (options) { return env.writeTempFile("", options); };
  //setTimeout(() => { env.makeTempFile({dir: "."}).then((a) => console.log(a), (b) => console.error(b)) });
  //setTimeout(() => null, 10000);  // lsof | grep $(pwd)

  env.renameToTempFile = taskify(function* (pathToRename, options) {
    // options. see makeTempFile
    var newPath = yield env.makeTempFile(options);
    try {
      yield env.renameFsNode(pathToRename, newPath);
      return newPath;
    } catch (reason) {
      yield env.unlinkFsNode(newPath);
      //return env.Promise.reject(reason);
      throw reason;
    }
  });
  //setTimeout(() => { env.renameToTempFile("lol", {dir: "."}).then(a => console.log(a), b => console.error(b)) });
  // XXX test it !

  env.makeTempHardLinkFile = taskify(function* (pathToLink, options) {
    // options.dir
    // options.prefix
    // options.suffix
    var dir, prefix, suffix, random, newPath, len = 5;
    dir = options && options.dir !== undefined ? options.dir : env.getTempDir();
    prefix = options && options.prefix !== undefined ? options.prefix : "tmp.";
    suffix = options && options.suffix !== undefined ? options.suffix : "";
    for (;; len += 1) {
      random = yield env.randomBytes(len);
      newPath = filepath.join(dir, prefix + random.toString("hex") + suffix);
      try {
        yield env.linkFsNode(pathToLink, newPath);
        return newPath;
      } catch (reason) {
        //if (reason.code !== "EEXIST") return env.Promise.reject(reason);
        if (reason.code !== "EEXIST") throw reason;
      }
    }
  });
  //setTimeout(() => { env.makeTempHardLinkFile("lol", {dir: "."}).then((a) => console.log(a), (b) => console.error(b)) });

}(this.env));
