(function envCsv(env) {
  "use strict";

  /*! env.csv.js Version 1.0.0

      Copyright (c) 2015-2017 Tristan Cavelier <t.cavelier@free.fr>
      This program is free software. It comes without any warranty, to
      the extent permitted by applicable law. You can redistribute it
      and/or modify it under the terms of the Do What The Fuck You Want
      To Public License, Version 2, as published by Sam Hocevar. See
      http://www.wtfpl.net/ for more details. */

  // provides:
  //   env.parseCsvChunkAlgorithm
  //   env.parseCsv

  if (env.registerLib) env.registerLib(envCsv);

  env.parseCsvChunkAlgorithm = function (bytes, i, l, events, cache, close) {
    // API stability level: 1 - Experimental

    // This algorithm parses CSV data and return parsed elements as events
    // to the `events` array.

    // Algorithms aim to process a data stream, the state is kept on the cache so
    // that this function can be called later to finish the process.

    // Parser algorithms aim to send events when component parsing is complete.
    // For instance, a CSV parser algorithm MUST NOT send event
    // "field" + "fieldextension", here, the second event means the first event
    // is not complete because the entire value is not sent.

    // Example for:
    //   bytes = bytes('normal string,"quoted-field"\n\
    //   "the ""word"" is true","a ""quoted-field"""\n')
    // ->
    //   events = [
    //     {type: "field",       length: 13, index: 13},  // "normal string"
    //     {type: "comma",       length: 1,  index: 13},  // ","
    //     {type: "quotedfield", length: 14, index: 28},  // '"quoted-field"'
    //     {type: "newline",     length: 1,  index: 28},  // "\n"
    //     {type: "quotedfield", length: 22, index: 51},  // '"the ""word"" is true"'
    //     {type: "comma",       length: 1,  index: 51},  // ","
    //     {type: "quotedfield", length: 20, index: 72},  // '"a ""quoted-field"""'
    //     {type: "newline",     length: 1,  index: 72},  // "\n"
    //     {type: "close",       length: 0,  index: 73}
    //   ]

    // arguments :
    //   bytes = [..]
    //     the bytes to parse
    //   i (from) = 0
    //     from which index to start reading bytes
    //   l (to) = bytes.length
    //     to which index to stop reading bytes
    //   events = []
    //     where the parsing event will be pushed.
    //   cache = [0, 0]
    //     used by the algorithm to store the state and other usefull information.
    //   close = false
    //     tells the algorithm that there will be no more bytes to parse.

    // events list :
    //   field
    //   quotedfield
    //   comma
    //   newline
    //   close
    //   error
    //     parse ended 1
    //     unexpected end of data 2
    //     bare " 3
    //     extraneous " 4

    // special chars are ",\r\n (0x222c0d0a)
    // states :
    //    0 : init, reading quoted field `"` (1), reading column separator `,` (0 field comma), reading line separator start `\r` (10), reading line separator `\n` (0 newline), reading field (3), close (close)
    //   10 : reading line separator end `\n` (0 newline), reading quoted field `"` (1 newline), reading column separator `,` (0 newline field comma), reading line separator start `\r` (10 newline), reading field (3), close (4 newline)
    //    1 : reading quote `"` (2), reading quoted field (1), close (unexpected end of data)
    //    2 : reading quote `"` (1), end of quoted field `,` (0 quotedfield comma) or `\r` (10 quotedfield) or `\n` (0 quotedfield newline), else (extraneous "), close (quotedfield close)
    //    3 : reading end of field `,` (0 field comma) or `\r` (10 field) or `\n` (0 field newline), reading quote `"` (bare "), reading field (3), close (field close)
    //    4 : parse ended (4), close (4 parse ended)

    // notes :
    // - `field` is sent once when parsing ',\n'
    // - a `quotedfield` is sent when parsing '""'
    // - a `newline` of length 2 is sent when parsing '\r\n'

    var byte; cache[1] = cache[1] || 0;
    for (; i < l; i += 1) {
      switch (cache[0]) {
        case  1:
          //    1 : reading quote `"` (2), reading quoted field (1), close (unexpected end of data)
          cache[1] += 1;
          if (bytes[i] === 0x22) cache[0] = 2;
          break;
        case  2:
          //    2 : reading quote `"` (1), end of quoted field `,` (0 quotedfield comma) or `\r` (10 quotedfield) or `\n` (0 quotedfield newline), else (extraneous "), close (quotedfield close)
          if ((byte = bytes[i]) === 0x22) { cache[1] += 1; cache[0] = 1; }
          else if (byte === 0x2C) { events.push({type: "quotedfield", length: cache[1], index: i}, {type: "comma", length: 1, index: i}); cache[0] = 0; }
          else if (byte === 0x0D) { events.push({type: "quotedfield", length: cache[1], index: i}); cache[0] = 10; }
          else if (byte === 0x0A) { events.push({type: "quotedfield", length: cache[1], index: i}, {type: "newline", length: 1, index: i}); cache[0] = 0; }
          else { events.push({type: "error", message: 'extraneous "', errno: 4, index: i}); return events; }
          break;
        case  3:
          //    3 : reading end of field `,` (0 field comma) or `\r` (10 field) or `\n` (0 field newline), reading quote `"` (bare "), reading field (3), close (field close)
          if ((byte = bytes[i]) === 0x2C) { events.push({type: "field", length: cache[1], index: i}, {type: "comma", length: 1, index: i}); cache[0] = 0; }
          else if (byte === 0x0D) { events.push({type: "field", length: cache[1], index: i}); cache[0] = 10; }
          else if (byte === 0x0A) { events.push({type: "field", length: cache[1], index: i}, {type: "newline", length: 1, index: i}); cache[0] = 0; }
          else if (byte === 0x22) { events.push({type: "error", message: 'base "', errno: 3, index: i}); return events; }
          else cache[1] += 1;
          break;
        case  4:
          //    4 : parse ended (4), close (4 parse ended)
          events.push({type: "error", message: "parse ended", errno: 1, length: 1, index: i});
          cache[1] = 0;
          break;
        case 10:
          //   10 : reading line separator end `\n` (0 newline), reading quoted field `"` (1 newline), reading column separator `,` (0 newline field comma), reading line separator start `\r` (10 newline), reading field (3), close (4 newline)
          // no need to initialise cache[1] as it is overridden
          if ((byte = bytes[i]) === 0x0A) { events.push({type: "newline", length: 2, index: i}); cache[0] = 0; }
          else if (byte === 0x22) { events.push({type: "newline", length: 1, index: i}); cache[1] = cache[0] = 1; }
          else if (byte === 0x2C) { events.push({type: "newline", length: 1, index: i}, {type: "field", length: 0, index: i}, {type: "comma", length: 1, index: i}); cache[0] = 0; }
          else if (byte === 0x0D) { events.push({type: "newline", length: 1, index: i}); cache[0] = 10; }
          else { events.push({type: "newline", length: 1, index: i}); cache[1] = 1; cache[0] = 3; }
          break;
        default:
          //    0 : init, reading quoted field `"` (1), reading column separator `,` (0 field comma), reading line separator start `\r` (10), reading line separator `\n` (0 newline), reading field (3), close (close)
          // no need to initialise cache[1] as it is overridden
          if ((byte = bytes[i]) === 0x22) { cache[1] = cache[0] = 1; }
          else if (byte === 0x2C) { events.push({type: "field", length: 0, index: i}, {type: "comma", length: 1, index: i}); }
          else if (byte === 0x0D) { cache[0] = 10; }
          else if (byte === 0x0A) { events.push({type: "newline", length: 1, index: i}); }
          else { cache[1] = 1; cache[0] = 3; }
      }
    }
    if (close) {
      switch (cache[0]) {
        case  1: events.push({type: "error", message: "unexpected end of data", errno: 2, length: cache[1], index: i, closing: true}); cache[0] = 4; break;
        case  2: events.push({type: "quotedfield", length: cache[1], index: i, closing: true}, {type: "close", length: 0, index: i, closing: true}); cache[0] = 4; break;
        case  3: events.push({type: "field", length: cache[1], index: i, closing: true}, {type: "close", length: 0, index: i, closing: true}); cache[0] = 4; break;
        case  4: events.push({type: "error", message: "parse ended", length: 0, index: i, closing: true}); break;
        case 10: events.push({type: "newline", length: 1, index: i, closing: true}); // fallthrough;
        default: events.push({type: "close", length: 0, index: i, closing: true}); cache[0] = 4;
      }
    }
    return events;
  };

  env.parseCsv = function (text) {
    // API stability level: 1 - Experimental

    // This parses CSV as an array like : [line, line, ...],
    // where line = [field, field, ...]

    // text = "..."

    // text ->
    //   'normal string,"quoted-field"\n\
    //   "the ""word"" is true","a ""quoted-field"""\n'
    // Returns ->
    //   [ [ "normal string", "quoted-field"],
    //     [ 'the "word" is true', 'a "quoted-field"'] ]

    // we don't care about text encoding as CSV special chars are < 0x7F.
    // XXX should we convert all char > 0xFF to dummy bytes (like 0x20) for genericity ?
    var i = 0, l = text.length, bytes = new Array(l), events = [], table = [], li = 0, line = null;
    for (; i < l; i += 1) bytes[i] = text.charCodeAt(i);
    env.parseCsvChunkAlgorithm(bytes, 0, l, events, [0, 0], true);
    for (i = 0, l = events.length; i < l; i += 1) {
      switch (events[i].type) {
        case "field":
          if (line === null) table.push(line = []); //table.push(line = [text.slice(li, li += events[i].length)]);
          line.push(text.slice(li, li += events[i].length));
          break;
        case "quotedfield":
          if (line === null) table.push(line = []); //table.push(line = [text.slice(li + 1, (li += events[i].length) - 1).replace(/""/g, '"')]);
          line.push(text.slice(li + 1, (li += events[i].length) - 1).replace(/""/g, '"'));
          break;
        case "error": return null;
        case "newline": line = null;
        default: li += events[i].length || 0;
      }
    }
    return table;
  };

}(this.env));
