/*jslint indent: 2 */
(function envIo(env) {
  "use strict";

  /*! env.io.js Version 1.0.0

      Copyright (c) 2015-2016 Tristan Cavelier <t.cavelier@free.fr>
      This program is free software. It comes without any warranty, to
      the extent permitted by applicable law. You can redistribute it
      and/or modify it under the terms of the Do What The Fuck You Want
      To Public License, Version 2, as published by Sam Hocevar. See
      http://www.wtfpl.net/ for more details. */

  // dependency:
  //   env.QuickTask.exec (tasks)
  // provides:
  //   env.BufferWriter
  //   env.ArrayWriter
  //   env.ArrayReader
  //   env.StringReader
  //   env.MultiReader
  //   env.MultiWriter
  //   env.TeeReader

  if (env.registerLib) env.registerLib(envIo);

  function BufferWriter(buffer) {
    // Usage:
    //   array = [1, 2];
    //   bufferWriter = new BufferWriter(array);
    //   bufferWriter.write([3, 4]); // returns: 2
    //   bufferWriter.index = 1;
    //   bufferWriter.write([5]); // returns: 1
    //   bufferWriter.buffer; // returns: [1, 5, 3, 4]

    // API stability level: 1 - Experimental
    this.buffer = buffer || [];
    this.index = this.buffer.length;
  }
  BufferWriter.prototype.buffer = null;
  BufferWriter.prototype.index = 0;
  BufferWriter.prototype.write = function (array, from, length) {
    //     write(array array, from, length int) writenCount int
    if (from === undefined) from = 0;
    if (length === undefined) length = array.length - from;
    var i = from, buffer = this.buffer;
    while (i < length) buffer[this.index++] = array[i++];
    return i - from;
  };
  env.BufferWriter = BufferWriter;
  env.newBufferWriter = function () { var c = env.BufferWriter, o = Object.create(c.prototype); c.apply(o, arguments); return o; };

  function ArrayWriter(array) {
    // Usage:
    //   array = [1, 2, 3];
    //   arrayWriter = new ArrayWriter(array);
    //   arrayWriter.write([4]); // returns: 1
    //   arrayWriter.index = 2;
    //   arrayWriter.write([5, 6]); // returns: 1
    //   arrayWriter.array; // returns: [4, 2, 5]

    // API stability level: 1 - Experimental
    this.array = array;
  }
  ArrayWriter.prototype.array = null;
  ArrayWriter.prototype.index = 0;
  ArrayWriter.prototype.write = function (array, from, length) {
    //     write(array array, from, length int) writenCount int
    if (from === undefined) from = 0;
    if (length === undefined) length = array.length - from;
    var i = from, buffer = this.array, bl = buffer.length;
    while (i < length && this.index < bl) buffer[this.index++] = array[i++];
    return i - from;
  };
  env.ArrayWriter = ArrayWriter;
  env.newArrayWriter = function () { var c = env.ArrayWriter, o = Object.create(c.prototype); c.apply(o, arguments); return o; };

  function ArrayReader(array) {
    // Usage:
    //   array = [1, 2, 3];
    //   arrayReader = new ArrayReader(array);
    //   arrayReader.read(2); // returns: [1, 2]
    //   arrayReader.index = 1;
    //   arrayReader.read(1); // returns: [2]
    //   arrayReader.read(2); // returns: [3]

    // API stability level: 1 - Experimental
    this.raw = array || [];
  }
  ArrayReader.prototype.array = null;
  ArrayReader.prototype.index = 0;
  ArrayReader.prototype.read = function (count) {
    //     read([count int]) array
    // `count === undefined` means "size of internal buffer"
    var res = [], i = 0, b = this.raw, bl = b.length;
    if (count === undefined)
      while (this.index < bl) res[i++] = b[this.index++];
    else
      while (i < count && this.index < bl) res[i++] = b[this.index++];
    return res;
  };
  ArrayReader.prototype.readInto = function (array, from, length) {
    //     readInto(array array, from, length int) readCount int
    //
    //     buf = [];
    //     do {
    //       buf.length = 1024;
    //       buf.length = r.readInto(buf);
    //       w.write(buf);
    //     } while (buf.length);
    if (from === undefined) from = 0;
    if (length === undefined) length = array.length - from;
    var i = from, a = this.raw, al = a.length;
    while (i < length && this.index < al) array[i++] = a[this.index++];
    return i - from;
  };
  env.ArrayReader = ArrayReader;
  env.newArrayReader = function () { var c = env.ArrayReader, o = Object.create(c.prototype); c.apply(o, arguments); return o; };

  function StringReader(string) {
    // Usage:
    //   string = "abc";
    //   stringReader = new StringReader(string);
    //   stringReader.read(2); // returns: "ab"
    //   stringReader.index = 1;
    //   stringReader.read(1); // returns: "b"
    //   stringReader.read(2); // returns: "c"

    // API stability level: 1 - Experimental
    this.raw = string || "";
  }
  StringReader.prototype.string = "";
  StringReader.prototype.array = "";
  StringReader.prototype.index = ArrayReader.prototype.index;
  StringReader.prototype.read = ArrayReader.prototype.read;
  StringReader.prototype.readInto = ArrayReader.prototype.readInto;
  StringReader.prototype.readString = function (length) {
    //     readString([length int]) array
    var res;
    if (length === undefined)
      res = this.raw.slice(this.index);
    else
      res = this.raw.slice(this.index, this.index + length);
    this.index += res.length;
    return res;
  };
  StringReader.prototype.readRune = function (length) {
    // Here, a Rune is a string containing one real char. (U+0 to U+10FFFF)
    //     readRune([length int]) array
    var res = "", i = this.index, c1, c2;
    if (length === undefined) length = 1;
    for (; length > 0 && i < this.raw.length; length -= 1) {
      c1 = this.raw.charCodeAt(i);
      if (c1 >= 0xd800 && c1 <= 0xdbff) {
        if (i + 1 >= this.raw.length) {
          res += this.raw[i++];  // incomplete surrogate pair
          break;
        }
        c2 = this.raw.charCodeAt(i + 1);
        if (c2 < 0xdc00 || c2 > 0xdfff) {
          res += this.raw[i++];
          continue;  // invalid surrogate pair
        }
        res += this.raw.slice(i, i + 2);
        i += 2;
      } else {
        res += this.raw[i++];
      }
    }
    this.index = i;
    return res;
  };
  // XXX do readPoint
  // Here, a Point is a unicode integer value
  env.StringReader = StringReader;
  env.newStringReader = function () { var c = env.StringReader, o = Object.create(c.prototype); c.apply(o, arguments); return o; };

  function MultiReader() {
    //     MultiReader(readers...)

    // API stability level: 1 - Experimental
    var i = 0, l = arguments.length, readers = new Array(l);
    while (i < l) readers[i] = arguments[i++];
    this.readers = readers;
  }
  MultiReader.prototype.readInto = function (array, from, length) {
    //     readInto(array array, from, length int) readCount int
    return env.QuickTask.exec(function* () {
      if (from === undefined) from = 0;
      if (length === undefined) length = array.length - from;
      var count = 0;
      while (this.readers.length > 0) {
        count += yield this.readers[0].readInto(array, from, length);
        from += count;
        length -= count;
        if (from === array.length) return count;
        this.readers.shift();
      }
      return count;
    }.bind(this));
  };
  env.MultiReader = MultiReader;
  env.newMultiReader = function () { var c = env.MultiReader, o = Object.create(c.prototype); c.apply(o, arguments); return o; };

  function MultiWriter() {
    //     MultiReader(readers...)

    // API stability level: 1 - Experimental
    var i = 0, l = arguments.length, writers = new Array(l);
    while (i < l) writers[i] = arguments[i++];
    this.writers = writers;
  }
  MultiWriter.prototype.write = function (array, from, length) {
    return env.QuickTask.exec(function* () {
      if (from === undefined) from = 0;
      if (length === undefined) length = array.length - from;
      var i = 0, l = this.writers.length, n;
      while (i < l) {
        n = yield this.writers[i].write(array, from, length);
        if (n !== length) throw new Error("short write");
        i += 1;
      }
      return length;
    }.bind(this));
  };
  env.MultiWriter = MultiWriter;
  env.newMultiWriter = function () { var c = env.MultiWriter, o = Object.create(c.prototype); c.apply(o, arguments); return o; };

  function TeeReader(reader, writer) {
    // API stability level: 1 - Experimental
    this.reader = reader;
    this.writer = writer;
  }
  TeeReader.prototype.readInto = function (array, from, length) {
    return env.QuickTask.exec(function* () {
      length = yield this.reader.readInto(array, from, length);
      yield this.writer.write(array, from, length);
      return length;
    }.bind(this));
  };
  env.TeeReader = TeeReader;
  env.newTeeReader = function () { var c = env.TeeReader, o = Object.create(c.prototype); c.apply(o, arguments); return o; };

}(this.env));
