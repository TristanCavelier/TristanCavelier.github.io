/*jslint indent: 2 */
(function envMime(env) {
  "use strict";

  /*! env.mime.js Version 1.0.0

      Copyright (c) 2015-2016 Tristan Cavelier <t.cavelier@free.fr>
      This program is free software. It comes without any warranty, to
      the extent permitted by applicable law. You can redistribute it
      and/or modify it under the terms of the Do What The Fuck You Want
      To Public License, Version 2, as published by Sam Hocevar. See
      http://www.wtfpl.net/ for more details. */

  // provides:
  //   ==> MIME Headers <==
  //   env.parseMimeHeadersChunkAlgorithm
  //   env.parseMimeHeaders
  //
  //   ==> MIME <==
  //   env.parseMimeChunkAlgorithm
  //   env.parseMime
  //
  //   ==> Multipart <==
  //   env.searchPatternsChunkAlgorithm  // XXX should be move somewhere else ?
  //
  //   env.parseMultipartBoundarySplitChunkAlgorithm
  //
  //   env.parseMultipartChunkAlgorithm
  //   env.parseMultipart
  //
  //   ==> MIME Type <==
  //   env.extractNameValueFromMimeTypeParam
  //   env.parseMimeTypeParam
  //   env.parseAndRemapEachMimeTypeParam
  //   env.parseEachMimeTypeParamToList
  //   env.parseEachMimeTypeParamToDict
  //   env.extractTypeFromMimeType
  //   env.parseMimeTypeType
  //   env.extractAndParseTypeFromMimeType
  //   env.extractTypePlistFromMimeType
  //   env.parseMimeType
  //   env.parseMimeTypeToList
  //   env.sanitizeMimeType
  //
  //   ==> Data URI <==
  //   env.parseDataUri

  if (env.registerLib) env.registerLib(envMime);

  ///////////
  // Tools //
  ///////////

  //function arrayViewsShiftNAsArray(views, count) {
  //  // views = [array, from, to, array, from, to, ...]
  //  // returns -> array

  //  var res = [], remcount = 0, vi, vl, v, l, to, len;
  //  for (vi = 0, vl = views.length; vi < vl; vi += 3) {
  //    v = views[vi];
  //    l = views[vi + 2];
  //    len = l - views[vi + 1];
  //    if (len < count) {
  //      for (; views[vi + 1] < l; ++views[vi + 1]) res.push(v[views[vi + 1]]);
  //      count -= len;
  //      remcount += 3;
  //    } else if (len === count) {
  //      for (; views[vi + 1] < l; ++views[vi + 1]) res.push(v[views[vi + 1]]);
  //      views.splice(0, remcount + 3);
  //      return res;
  //    } else {
  //      to = views[vi + 1] + count;
  //      for (; views[vi + 1] < to; ++views[vi + 1]) res.push(v[views[vi + 1]]);
  //      views.splice(0, remcount);
  //      return res;
  //    }
  //  }
  //  views.splice(0);
  //  return res;
  //}
  function arrayViewsShiftN(views, count) {
    // views = [array, from, to, array, from, to, ...]
    // returns -> [array, from, to, ...]

    var res = [], remcount = 0, vi, vl, to, len;
    for (vi = 0, vl = views.length; vi < vl; vi += 3) {
      len = views[vi + 2] - views[vi + 1];
      if (len < count) {
        res.push(views[vi], views[vi + 1], views[vi + 2]);
        count -= len;
        remcount += 3;
      } else if (len === count) {
        res.push(views[vi], views[vi + 1], views[vi + 2]);
        views.splice(0, remcount + 3);
        return res;
      } else {
        res.push(views[vi], views[vi + 1], views[vi + 1] += count);
        views.splice(0, remcount);
        return res;
      }
    }
    views.splice(0);
    return res;
  }
  function arrayViewsSkipN(views, count) {
    // views = [array, from, to, array, from, to, ...]
    // returns -> skipped amount

    var remcount = 0, vi, vl, len, skipped = 0;
    for (vi = 0, vl = views.length; vi < vl; vi += 3) {
      len = views[vi + 2] - views[vi + 1];
      if (len < count) {
        count -= len;
        skipped += len;
        remcount += 3;
      } else if (len === count) {
        views.splice(0, remcount + 3);
        return skipped + len;
      } else {
        views[vi + 1] += count;
        views.splice(0, remcount);
        return skipped + count;
      }
    }
    views.splice(0);
    return skipped;
  }
  //function arrayViewsExtend(views, exviews) {
  //  //return views.push.apply(views, exviews);
  //  for (var i = 0, l = exviews.length; i < l; ++i) views.push(exviews[i]);
  //  return views.length;
  //}

  //////////////////
  // MIME Headers //
  //////////////////

  env.parseMimeHeadersChunkAlgorithm = function (bytes, i, l, events, cache, close) {
    // API stability level: 1 - Experimental

    // This algorithm parses MIME Headers and return parsed elements as events
    // to the `events` array.

    // Algorithms aim to process a data stream, the state is kept on the cache so
    // that this function can be called later to finish the process.

    // Parser algorithms aim to send events when component parsing is complete.
    // For instance, a MIME header parser algorithm MUST NOT send event
    // "value" + "valueextension", here, the second event means the first event
    // is not complete because the entire value is not sent.

    // Example for:
    //   bytes = bytes("Content-Length: 200\r\n\
    //   Vary: Cookie\r\n\
    //   \r\n")
    // ->
    //   events = [
    //     {type: "name",     length: 13, index: 14},  // "Content-Length"
    //     {type: "nameend",  length: 1,  index: 14},  // ":"
    //     {type: "value",    length: 4,  index: 21},  // " 200"
    //     {type: "valueend", length: 2,  index: 21},  // "\r\n"
    //     {type: "name",     length: 4,  index: 25},  // "Vary"
    //     {type: "nameend",  length: 1,  index: 25},  // ":"
    //     {type: "value",    length: 7,  index: 37},  // " Cookie"
    //     {type: "valueend", length: 2,  index: 37},  // "\r\n"
    //     {type: "closure",  length: 2,  index: 37},  // "\r\n"
    //     {type: "close",    length: 0,  index: 37}
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
    //   cache = [0]
    //     used by the algorithm to store the state and other usefull information.
    //   close = false
    //     tells the algorithm that there will be no more bytes to parse.

    // events list :
    //   name
    //   nameend
    //   value
    //   valueend
    //   closure
    //   close
    //   error
    //     parse ended 1
    //     unexpected end of data 2

    // states :
    //   0 : init, reading closure or key `\r` (1), reading key separator `:` (3 name nameend), reading key (2), close (error)
    //   1 : reading closure `\n` (7 closure), reading key separator `:` (3 name nameend), reading key (2), close (error)
    //   2 : reading key separator `:` (3 name nameend), reading key (2), close (error)
    //   3 : reading possible value end `\r` (4), reading value (3), close (error)
    //   4 : reading possible value end `\n` (5), reading possible value end `\r` (4), reading value (3), close (error)
    //   5 : reading possible closure `\r` (6), reading resume value [ \t] (3), reading key separator `:` (3 value valuend name nameend), reading key (2 value valueend), close (error // 7 value valueend close)
    //   6 : reading closure `\n` (7 value valueend closure), reading possible value end `\r` (4), reading value (3), close (error)
    //   7 : closed (7), close (7 close)

    // notes :
    // - empty headers are allowed ("\r\n")

    var byte; cache[1] = cache[1] || 0;
    for (; i < l; i += 1) {
      cache[1] += 1;
      switch (cache[0]) {
        case 1:
          //   1 : reading closure `\n` (7 closure), reading key separator `:` (3 name nameend), reading key (2)
          if ((byte = bytes[i]) === 0x0A) {
            events.push({type: "closure", length: cache[1], index: i});
            cache[1] = 0;
            cache[0] = 7;
          } else if (byte === 0x3A) {
            events.push({type: "name", length: cache[1] - 1, index: i}, {type: "nameend", length: 1, index: i});
            cache[1] = 0;
            cache[0] = 3;
          } else cache[0] = 2;
          break;
        case 2:
          //   2 : reading key separator `:` (3 name nameend), reading key (2)
          if (bytes[i] === 0x3A) {
            events.push({type: "name", length: cache[1] - 1, index: i}, {type: "nameend", length: 1, index: i});
            cache[1] = 0;
            cache[0] = 3;
          }
          break;
        case 3:
          //   3 : reading possible value end `\r` (4), reading value (3)
          if (bytes[i] === 0x0D) cache[0] = 4;
          break;
        case 4:
          //   4 : reading possible value end `\n` (5), reading possible value end `\r` (4), reading value (3)
          if ((byte = bytes[i]) === 0x0A) cache[0] = 5;
          else if (byte === 0x0D) cache[0] = 4;
          else cache[0] = 3;
          break;
        case 5:
          //   5 : reading possible closure `\r` (6), reading resume value [ \t] (3), reading key separator `:` (3 value valuend name nameend), reading key (2 valuee valueend)
          if ((byte = bytes[i]) === 0x0D) cache[0] = 6;
          else if (byte === 0x20 || byte === 0x09) cache[0] = 3;
          else if (byte === 0x3A) {
            events.push(
              {type: "value", length: cache[1] - 3, index: i},
              {type: "valueend", length: 2, index: i},
              {type: "name", length: 0, index: i},
              {type: "nameend", length: 1, index: i}
            );
            cache[1] = 0;
            cache[0] = 3;
          } else {
            events.push({type: "value", length: cache[1] - 3, index: i}, {type: "valueend", length: 2, index: i});
            cache[1] = 1;
            cache[0] = 2
          }
          break;
        case 6:
          //   6 : reading closure `\n` (7 value valueend closure), reading possible value end `\r` (4), reading value (3)
          if ((byte = bytes[i]) === 0x0A) {
            events.push(
              {type: "value", length: cache[1] - 4, index: i},
              {type: "valueend", length: 2, index: i},
              {type: "closure", length: 2, index: i}
            );
            cache[1] = 0;
            cache[0] = 7;
          } else if (byte === 0x0D) cache[0] = 4;
          else cache[0] = 3;
          break;
        case 7:
          //   7 : closed (7 error)
          events.push({type: "error", message: "parse ended", errno: 1, length: 1, index: i});
          cache[1] = 0;
          return events;
        default:
          //   0 : init, reading closure or key `\r` (1), reading key separator `:` (3 name nameend), reading key (2)
          if ((byte = bytes[i]) === 0x0D) cache[0] = 1;
          else if (byte === 0x3A) {
            events.push({type: "name", length: cache[1] - 1, index: i}, {type: "nameend", length: 1, index: i});
            cache[1] = 0;
            cache[0] = 3;
          } else cache[0] = 2;
      }
    }
    if (close) {
      switch (cache[0]) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
        case 6: events.push({type: "error", message: "unexpected end of data", errno: 2, length: 0, index: i, closing: true}); break;
        default: events.push({type: "close", length: 0, index: i, closing: true});
      }
    }
    return events;
  };
  env.parseMimeHeaders = function (text) {
    // API stability level: 1 - Experimental

    // This parses MIME headers as a array like : [name, value, name, value, ...].

    // text = "..."
    //   MUST be ascii

    // text ->
    //   "Server:   SimpleHTTP/0.6 Python/3.4.1\r\n\
    //   Date: Wed, 04 Jun 2014 14:06:57 GMT   \r\n\
    //   Value: hello\r\n\
    //        guys  \r\n\
    //   Content-Type: application/x-silverlight\r\n\
    //   Content-Length: 11240\r\n\
    //   Last-Modified: Mon, 03 Dec 2012 23:51:07 GMT\r\n\
    //   X-Cache: HIT via me\r\n\
    //   X-Cache: HIT via other\r\n"
    // Returns ->
    //   [ "Server", "  SimpleHTTP/0.6 Python/3.4.1",
    //     "Date", "Wed, 04 Jun 2014 14:06:57 GMT   ",
    //     "Value", "hello     guys  ",
    //     "Content-Type", "application/x-silverlight",
    //     "Content-Length", "11240",
    //     "Last-Modified", "Mon, 03 Dec 2012 23:51:07 GMT",
    //     "X-Cache", "HIT via me",
    //     "X-Cache", "HIT via other" ]

    // use binary string because, in theory, unicode should not be used.
    var i = 0, l = text.length, bytes = new Array(l + 2), events = [], rawHeaders = [], key = "", li = 0;
    for (; i < l; i += 1) bytes[i] = text.charCodeAt(i);
    bytes[l] = 0x0D; bytes[l + 1] = 0x0A;
    env.parseMimeHeadersChunkAlgorithm(bytes, 0, bytes.length, events, [0], true);
    for (i = 0, l = events.length; i < l; i += 1) {
      switch (events[i].type) {
        case "name": key = String.fromCharCode.apply(String, bytes.slice(li, li += events[i].length)); break;
        case "value": rawHeaders.push(key, String.fromCharCode.apply(String, bytes.slice(li, li += events[i].length)).replace(/^ /, "").replace(/\r\n[ \t]/g, " ")); break;
        case "error": return null;
        default: li += events[i].length || 0;
      }
    }
    return rawHeaders;
  };

  //////////
  // MIME //
  //////////

  env.parseMimeChunkAlgorithm = function (bytes, i, l, events, cache, close) {
    // API stability level: 1 - Experimental

    // This algorithm parses MIME and return parsed elements as events
    // to the `events` array.

    // Algorithms aim to process a data stream, the state is kept on the cache so
    // that this function can be called later to finish the process.

    // Parser algorithms aim to send events when component parsing is complete.
    // For instance, a MIME header parser algorithm MUST NOT send event
    // "value" + "valueextension", here, the second event means the first event
    // is not complete because the entire value is not sent.

    // Example for:
    //   bytes = bytes("Content-Length:   6\r\n\
    //   Vary: Cookie\r\n\
    //   \r\n\
    //   mydata")
    // ->
    //   events = [
    //     {type: "name",     length: 13, index: 14},  // "Content-Length"
    //     {type: "nameend",  length: 1,  index: 14},  // ":"
    //     {type: "value",    length: 4,  index: 21},  // "   6"
    //     {type: "valueend", length: 2,  index: 21},  // "\r\n"
    //     {type: "name",     length: 4,  index: 25},  // "Vary"
    //     {type: "nameend",  length: 1,  index: 25},  // ":"
    //     {type: "value",    length: 7,  index: 37},  // " Cookie"
    //     {type: "valueend", length: 2,  index: 37},  // "\r\n"
    //     {type: "closure",  length: 2,  index: 37},  // "\r\n"
    //     {type: "data",     length: 6,  index: 43},  // "mydata"
    //     {type: "close",    length: 0,  index: 43}
    //   ]

    // events list :
    //   name
    //   nameend
    //   value
    //   valueend
    //   closure
    //   data (streamed)
    //   close
    //   error
    //     parse ended 1
    //     unexpected end of data 2
    //     error parsing raw headers 3

    // states :
    //   0 : init, go to 1, close (error)
    //   1 : reading first raw headers : closure (2), close (error)
    //   2 : reading data (2), close (3)
    //   3 : closed

    var cont = true, parsed, ei, el, e;
    while (cont) {
      switch (cache[0]) {
        case 1:
          cont = false;
          parsed = env.parseMimeHeadersChunkAlgorithm(bytes, i, l, [], cache[1], false);
          for (ei = 0, el = parsed.length; ei < el; ei += 1) {
            switch ((e = parsed[ei]).type) {
              case "closure":
                events.push(e);
                i = e.index + 1;
                cont = i < l;
                cache[0] = 2;  // state
                cache.splice(1);
                el = ei; // break event loop
                break;
              case "error":
                e.errno = 3;
                e.message = "parsing mime headers : " + e.message;
                events.push(e);
                return events;
              default: events.push(e);
            }
          }
          break;
        case 2:
          cont = false;
          if (l - i > 0) events.push({type: "data", length: l - i, index: l});
          i = l;
          break;
        case 3:
          events.push({type: "error", message: "parse ended", errno: 1, length: 1, index: i});
          return events;
        default:
          cache[0] = 1;  // state
          cache[1] = [];  // cache
      }
    }
    if (close) {
      switch (cache[0]) {
        case 1: events.push({type: "error", message: "unexpected end of data", errno: 2, index: i, closing: true}); break;
        case 2: cache[0] = 3; events.push({type: "close", length: 0, index: i, closing: true});
      }
    }
    return events;
  };
  env.parseMime = function (bytes) {
    // API stability level: 1 - Experimental

    // This parses MIME as a object containing two properties :
    // - rawHeaders, that is an array like [name, value, name, value, ...]
    // - data, that is an array of bytes

    // Example for:
    //   bytes = bytes("Content-Length:   6\r\n\
    //   Vary: Cookie\r\n\
    //   \r\n\
    //   mydata")
    // ->
    //   {
    //     rawHeaders: [
    //       "Content-Length", "  6",
    //       "Vary", "Cookie"
    //     ],
    //     data: bytes("mydata")
    //   }

    var ee = [], ei = 0, el, e, res = {rawHeaders: [], data: []}, key = "", li = 0;
    env.parseMimeChunkAlgorithm(bytes, 0, bytes.length, ee, [], true);
    for (el = ee.length; ei < el; ++ei) {
      switch ((e = ee[ei]).type) {
        // for headers, use binary string because, in theory, unicode should not be used.
        case "name": key = String.fromCharCode.apply(String, bytes.slice(li, li += e.length)); break;
        case "value": res.rawHeaders.push(key, String.fromCharCode.apply(String, bytes.slice(li, li += e.length)).replace(/^ /, "").replace(/\r\n[ \t]/g, " ")); break;
        case "data": res.data = bytes.slice(li); break;
        case "error": return null;
        case "nameend":
        case "valueend":
        case "closure":
        case "close": li += e.length; break;
        default: throw new Error("unhandled event : " + e.type);
      }
    }
    return res;
  };

  ///////////////
  // Multipart //
  ///////////////

  env.searchPatternsChunkAlgorithm = function (bytes, i, l, events, patternBytesList, cache, close) {
    // API stability level: 1 - Experimental

    // This algorithm tries to find some patterns inside the flow of bytes and sends
    // "match" when a pattern is found, else, "data" event is sent and gives the
    // parts that doesn't match any patterns. Two patterns cannot match the same slice
    // of data.

    // Algorithms aim to process a data stream, the state is kept on the cache so
    // that this function can be called later to finish the process.

    // Parser algorithms aim to send events when component parsing is complete.
    // For instance, this parser algorithm MUST NOT send event
    // "possiblematchstart" because we are not sure to match the real pattern.

    // Example for :
    //   bytes = bytes("1212131")
    //   patternBytesList = [bytes("1213")]
    // ->
    //   events = [
    //     {type: "data",      length: 2, index: 5},
    //     {type: "match",     length: 4, index: 5, patternIndex: 0},
    //     {type: "data",      length: 1, index: 7},
    //     {type: "close",     length: 0, index: 7}
    //   ]

    // event list :
    //   match      when a patternBytes is found
    //   data       data between two patterns (streamed)
    //   close      on parse close

    // Algorithm description with patterns abc, cabc and cabac :
    //   reading byte c - c no1, c ok2, c ok3 - 1+1
    //   reading byte a - a ok1, ca ok2, ca ok3
    //   reading byte b - ab ok1, cab ok2, cab ok3
    //   reading byte a - aba no1, ba no1, a ok1, caba no2, aba no2, ba no2, a no2, caba ok3 - 1+3 - 2+4
    //   reading byte b - ab ok1, b no2, cabab no3, abab no3, bab no3, ab no3, b no3 - 2+5 - 3+5
    //   reading byte c - abc ok1 - clear 2 and 3 - send data event (cab) - send sep event (abc)
    //   reading byte b - b no1, b no2, b no3 - 1+1 - 2+1 - 3+1
    //   closing        - send data event (b)

    var byte, ci = 0, cl = patternBytesList.length, c, pi, pl = cl, p, j, m, cont = false;

    cache[0] = cache[0] || [];  // pattern caches
    cache[1] = cache[1] || [];  // data lengths
    for (; ci < cl; ++ci) {
      cache[0][ci] = cache[0][ci] || [];
      cache[1][ci] = cache[1][ci] || 0;
    }

    for (; i < l; i += 1) {
      byte = bytes[i];
      for (pi = 0; pi < pl; ++pi) {
        p = patternBytesList[pi];
        c = cache[0][pi];
        c.push(byte);
        if (byte === p[c.length - 1]) {
          if (c.length === p.length) {
            if (cache[1][pi]) events.push({type: "data", length: cache[1][pi], index: i});
            events.push({type: "match", length: c.length, index: i, patternIndex: pi});
            for (ci = 0; ci < cl; ++ci) { cache[0][ci].splice(0); cache[1][ci] = 0; }
            break;
          }
        } else {
          do {
            cont = false;
            c.shift();
            ++cache[1][pi];
            for (j = 0, m = c.length; j < m; j += 1)
              if (c[j] !== p[j]) { cont = true; break; }
          } while (cont);
        }
      }
    }

    if (close) {
      m = cache[0][0].length + cache[1][0];
      if (m) {
        events.push({type: "data", length: m, index: i});
        for (pi = 0; pi < pl; ++pi) { cache[0].splice(0); cache[1][pi] = 0; }
      }
      events.push({type: "close", length: 0, index: i, closing: true});
    } else {
      m = cache[1][0];
      for (pi = 1; pi < pl; ++pi) if (cache[1][pi] < m) m = cache[1][pi];
      if (m) {
        events.push({type: "data", length: m, index: i});
        for (pi = 0; pi < pl; ++pi) cache[1][pi] -= m;
      }
    }

    return events;
  };

  env.parseMultipartBoundarySplitChunkAlgorithm = function (bytes, i, l, events, firstBoundaryBytes, boundaryBytes, closingBoundaryBytes, cache, close) {
    // API stability level: 1 - Experimental

    // XXX do documentation

    // event list :
    //   firstboundary    when "--boundary\r\n" is found at the very beginning
    //   boundary         when "\r\n--boundary\r\n" is found
    //   closingboundary  when "\r\n--boundary--\r\n" is found
    //   data             data between two boundaries (streamed)
    //   close            on parse close
    //   error

    var ei = 0, el, ee, e, datalen = 0;
    if (cache[1])
      ee = env.searchPatternsChunkAlgorithm(bytes, i, l, [], [boundaryBytes, closingBoundaryBytes], cache[0] = cache[0] || [], close);
    else
      ee = env.searchPatternsChunkAlgorithm(bytes, i, l, [], [boundaryBytes, closingBoundaryBytes, firstBoundaryBytes], cache[0] = cache[0] || [], close);
    for (el = ee.length; ei < el; ++ei) {
      switch ((e = ee[ei]).type) {
        case "match":
          switch (e.patternIndex) {
            case 0:
              cache[1] = 1;
              if (datalen) { events.push({type: "data", length: datalen, index: e.index}); datalen = 0; }
              e.type = "boundary"; delete e.patternIndex; events.push(e);
              break;
            case 1:
              cache[1] = 1;
              if (datalen) { events.push({type: "data", length: datalen, index: e.index}); datalen = 0; }
              e.type = "closingboundary"; delete e.patternIndex; events.push(e);
              break;
            case 2:
              if (cache[1]) {
                datalen += e.length;
              } else {
                cache[1] = 1;
                e.type = "firstboundary"; delete e.patternIndex; events.push(e);
              }
              break;
          }
          break;
        case "data":
          cache[1] = 1;
          datalen += e.length;
          break;
        case "close":
          if (datalen) { events.push({type: "data", length: datalen, index: e.index, closing: e.closing}); datalen = 0; }
          events.push(e);
          break;
        case "error": events.push(e); return events;
        default: events.push({type: "error", message: "unhandled event : " + e.type, length: e.length, index: e.index}); return events;
      }
    }
    if (datalen) events.push({type: "data", length: datalen, index: e.index});
    return events;
  };
  //env.parseMultipartBoundarySplit = function (bytes, boundary) {
  //  // API stability level: 1 - Experimental

  //  // XXX do documentation

  //  // XXX review this code

  //  // boundary is considered as binary string because, in theory, unicode should not be used.
  //  var i = 0, l = boundary.length, b = new Array(l), dd = [0x2D, 0x2D], crlf = [0x0D, 0x0A];
  //  for (; i < l; i += 1) b[i] = boundary.charCodeAt(i);
  //  return env.parseMultipartBoundarySplitChunkAlgorithm(
  //    bytes, 0, bytes.length, [],
  //    dd.concat(b).concat(crlf),  // --boundary\r\n
  //    crlf.concat(dd).concat(b).concat(crlf),  // \r\n--boundary\r\n
  //    crlf.concat(dd).concat(b).concat(dd).concat(crlf),  // \r\n--boundary--\r\n
  //    [], true
  //  );
  //};

  env.parseMultipartChunkAlgorithm = function (bytes, i, l, events, firstBoundaryBytes, boundaryBytes, closingBoundaryBytes, cache, close) {
    // API stability level: 1 - Experimental

    // XXX do documentation

    // Data sent by `data` event are not decoded no matter the Content-Transfer-Encoding.

    // with bytes ->
    //   bytes("--boundary\r\n\
    //   Content-Transfer-Encoding: base64\r\n\
    //   \r\n\
    //   AAAA\r\n\
    //   --boundary\r\n\
    //   \r\n\
    //   Abcdefg\r\n\
    //   --boundary--\r\n")
    // Returns ->
    //   [{type: "firstboundary",   length: 12, index: 11},
    //    {type: "name",            length: 25, index: ..},
    //    {type: "nameend",         length: 1,  index: ..},
    //    {type: "value",           length: 7,  index: ..},
    //    {type: "valueend",        length: 2,  index: ..},
    //    {type: "closure",         length: 2,  index: ..},
    //    {type: "data",            length: 4,  index: ..},
    //    {type: "boundary",        length: 14, index: ..},
    //    {type: "closure",         length: 2,  index: ..},
    //    {type: "data",            length: 7,  index: ..},
    //    {type: "closingboundary", length: 16, index: ..},
    //    {type: "close",           length: 0,  index: ..}]

    // events:
    //   firstdata        data that come before first boundary
    //   firstboundary    when "--boundary\r\n" is found at the very beginning
    //   boundary         when "\r\n--boundary\r\n" is found
    //   closingboundary  when "\r\n--boundary--\r\n" is found
    //   name             part raw header name
    //   nameend
    //   value            part raw header value
    //   valueend
    //   closure          part raw header end
    //   data             part body chunks (streamed)
    //   close            on parse close

    // NB :
    // - a boundary can be found during header parsing
    // - header+data can be found after closing boundary

    //function bstr(bytes) { return JSON.stringify(String.fromCharCode.apply(String, bytes)); }
    var e1, ei1, el1, e2, ei2, el2, e, tmp, views, vi, vl, v;
    env.parseMultipartBoundarySplitChunkAlgorithm(bytes, i, l, e1 = [], firstBoundaryBytes, boundaryBytes, closingBoundaryBytes, cache[0] = cache[0] || [], close);
    if (cache[3]) cache[3].push(bytes, i, l);
    else cache[3] = [bytes, i, l];
    for (ei1 = 0, el1 = e1.length; ei1 < el1; ei1 += 1) {
      switch ((e = e1[ei1]).type) {
        case "close":
          arrayViewsSkipN(cache[3], e.length);
          el1 = ei1;  // break loop
          if (cache[2]) {
            if (cache[1] && cache[1].length) {
              i = e.index;
              env.parseMimeChunkAlgorithm([], 0, 0, e2 = [], cache[1], true);
              for (ei2 = 0, el2 = e2.length; ei2 < el2; ei2 += 1) {
                switch ((e = e2[ei2]).type) {
                  case "name":
                  case "nameend":
                  case "value":
                  case "valueend":
                  case "closure":
                  case "data": e.index = i; events.push(e); break;
                  case "close": break;
                  case "error": delete e.closing; e.index = i; e.message = "parsing mime : " + e.message; events.push(e); return events;
                  default: events.push({type: "error", message: "unhandled event : " + e.type, length: 0, index: i}); return events;
                }
              }
            }
          } else {
            //e.type = "firstdata";
            events.push(e);
          }
          break;
        case "data":
          if (cache[2]) {
            views = arrayViewsShiftN(cache[3], e.length);
            i = e.index;
            if (e.closing) el1 = ei1;  // break loop
            for (vi = 0, vl = views.length; vi < vl; vi += 3) {
              env.parseMimeChunkAlgorithm(views[vi], views[vi + 1], views[vi + 2], e2 = [], cache[1] = cache[1] || [], e.closing);
              for (ei2 = 0, el2 = e2.length; ei2 < el2; ei2 += 1) {
                switch ((e = e2[ei2]).type) {
                  case "name":
                  case "nameend":
                  case "value":
                  case "valueend":
                  case "closure":
                  case "data": delete e.closing; e.index = i; events.push(e); break;  // XXX use parent e.closing ?
                  case "close": break;
                  case "error": delete e.closing; e.index = i; e.message = "parsing mime : " + e.message; events.push(e); return events;
                  default: events.push({type: "error", message: "unhandled event : " + e.type, length: 0, index: i}); return events;
                }
              }
            }
          } else {
            arrayViewsSkipN(cache[3], e.length);
            e.type = "firstdata";
            events.push(e);
          }
          break;
        //case "firstclosingboundary": XXX does it exist ?
        case "firstboundary":
        case "boundary":
        case "closingboundary":
          arrayViewsSkipN(cache[3], e.length);
          tmp = e;
          if (cache[2]) {
            i = e.index;
            if (cache[1] && cache[1].length) {
              env.parseMimeChunkAlgorithm([], 0, 0, e2 = [], cache[1], true);
              for (ei2 = 0, el2 = e2.length; ei2 < el2; ei2 += 1) {
                switch ((e = e2[ei2]).type) {
                  case "name":
                  case "nameend":
                  case "value":
                  case "valueend":
                  case "closure":
                  case "data": delete e.closing; e.index = i; events.push(e); break;
                  case "close": break;
                  case "error": delete e.closing; e.index = i; e.message = "parsing mime : " + e.message; events.push(e); return events;
                  default: events.push({type: "error", message: "unhandled event : " + e.type, length: 0, index: i}); return events;
                }
              }
            }
          }
          cache[1] = [];
          cache[2] = 1;
          events.push(tmp);
          break;
        case "error": delete e.closing; e.index = i; e.message = "parsing mime boundaries : " + e.message; events.push(e); return events;
        default: events.push({type: "error", message: "unhandled event : " + e.type, length: 0, index: i}); return events;
      }
    }
    if (close) events.push({type: "close", length: 0, index: i, closing: true});
    return events;
  };
  env.parseMultipart = function (bytes, boundary) {
    // API stability level: 1 - Experimental

    // XXX do documentation

    // with bytes = bytes("firstdata\r\n\
    //   --my_frontier\r\n\
    //   Content-Type: text/html\r\n\
    //   Content-Transfer-Encoding: base64\r\n\
    //   \r\n\
    //   ABCD\r\n\
    //   --my_frontier\r\n\
    //   \r\n\
    //   rawdata\r\n\
    //   --my_frontier--\r\n")
    // and boundary = "my_frontier"
    // Returns ->
    //   {
    //     data: bytes("firstdata"),
    //     parts: [ {
    //       rawHeaders: [
    //         "Content-Type", "text/html",
    //         "Content-Transfer-Encoding", "base64"
    //       ],
    //       data: bytes("ABCD")
    //     }, {
    //       rawHeaders: [],
    //       data: bytes("rawdata")
    //     } ]
    //   }

    // bytes = [...]
    //   XXX
    // boundary = "my_frontier"
    //   MUST be ascii
    //   SHOULD contain `_` or `=` <https://tools.ietf.org/html/rfc2045#section-6.7>

    // boundary is considered as binary string because, in theory, unicode should not be used.
    var i = 0, l = boundary.length, b = new Array(l), dd = [0x2D, 0x2D], crlf = [0x0D, 0x0A],
        ee = [], e, res = {data: [], parts: []}, key = "", li = 0;
    for (; i < l; i += 1) b[i] = boundary.charCodeAt(i);
    env.parseMultipartChunkAlgorithm(
      bytes, 0, bytes.length, ee,
      dd.concat(b).concat(crlf),  // --boundary\r\n
      crlf.concat(dd).concat(b).concat(crlf),  // \r\n--boundary\r\n
      crlf.concat(dd).concat(b).concat(dd).concat(crlf),  // \r\n--boundary--\r\n
      [], true
    );
    b = null;
    for (i = 0, l = ee.length; i < l; ++i) {
      switch ((e = ee[i]).type) {
        case "name": key = String.fromCharCode.apply(String, bytes.slice(li, li += e.length)); break;
        case "value":
          if (b === null) return null;
          b.rawHeaders.push(key, String.fromCharCode.apply(String, bytes.slice(li, li += e.length)).replace(/^ /, "").replace(/\r\n[ \t]/g, " ")); break;
        case "data":
          if (b === null) return null;
          b.data = bytes.slice(li, li += e.length); break;
        case "nameend":
        case "valueend":
        case "closure": li += e.length; break;
        case "close":
          if (ee[i - 1] && ee[i - 1].type !== "closingboundary") return null;
          li += e.length; break;
        case "firstdata": res.data = bytes.slice(0, li += e.length); break;
        case "firstboundary": b = {rawHeaders: [], data: []}; li += e.length; break;
        case "boundary": if (b) res.parts.push(b); b = {rawHeaders: [], data: []}; li += e.length; break;
        case "closingboundary": if (b) res.parts.push(b); b = null; li += e.length; break;
        case "error": return null;  // XXX throw ?
        default: throw new Error("unhandled event : " + e.type);
      }
    }
    return res;
  };

  ///////////////
  // MIME Type //
  ///////////////

  // This implementation does not follow any RFCs, it just splits the MIME type
  // by `;` with simple `String.prototype.split` like chromium does in Data URI
  // to improve its speed. Here, there is no Quoted values nor value continuation.
  // To have a sample of code using last RFCs - see golang.org/pkg/mime

  env.extractNameValueFromMimeTypeParam = function (text) {
    // API stability level: 1 - Experimental
    // text = " CHARSET = UTF-8 "
    // Returns -> {name:" CHARSET ", value:" UTF-8 "}
    // text = " BASE64"
    // Returns -> {name:" BASE64", value:null}
    for (var i = 0, l = text.length; i < l; ++i)
      if (text[i] === "=")
        return {name: text.slice(0, i), value: text.slice(i + 1)};
    return {name: text, value: null};
  };
  env.parseMimeTypeParam = function (text) {
    // API stability level: 1 - Experimental
    // text = " CHARSET = UTF-8 "
    // Returns -> {name:"charset", value:"UTF-8"}
    // text = " BASE64"
    // Returns -> {name:"base64", value:null}
    for (var i = 0, l = text.length; i < l; ++i)
      if (text[i] === "=")
        return {name: text.slice(0, i).trim().toLowerCase(), value: text.slice(i + 1).trim()};
    return {name: text.trim().toLowerCase(), value: null};
  };

  env.parseAndRemapEachMimeTypeParam = function (paramList) {
    // API stability level: 1 - Experimental
    // paramList = [" CHARSET = UTF-8 ", " BASE64"]
    // Returns -> [{name:"charset", value:"UTF-8"}, {name:"base64", value:null}]
    for (var i = 0, l = paramList.length; i < l; ++i)
      paramList[i] = env.parseMimeTypeParam(paramList[i]);
    return paramList;
  };
  env.parseEachMimeTypeParamToList = function (paramList) {
    // API stability level: 1 - Experimental
    // paramList = [" CHARSET = UTF-8 ", " BASE64"]
    // Returns -> ["charset", "UTF-8", "base64", null]
    var i = 0, j = 0, l = paramList.length, r = new Array(l * 2), p = null;
    for (; i < l; ++i, j += 2) {
      p = env.parseMimeTypeParam(paramList[i]);
      r[j] = e.name;
      r[j + 1] = e.value;
    }
    return r;
  };
  env.parseEachMimeTypeParamToDict = function (paramList) {
    // API stability level: 1 - Experimental
    // paramList = [" CHARSET = UTF-8 ", " BASE64"]
    // Returns -> {charset: "UTF-8", base64: null}
    var i = 0, l = paramList.length, r = {}, p = null;
    for (; i < l; ++i) {
      p = env.parseMimeTypeParam(paramList[i]);
      r[p.name] = p.value;
    }
    return r;
  };

  env.extractTypeFromMimeType = function (text) {
    // API stability level: 1 - Experimental
    // text = " TEXT / PLAIN ; CHARSET = UTF-8 ; BASE64"
    // Returns -> " TEXT / PLAIN "
    return text.split(";", 1)[0];
  };
  env.parseMimeTypeType = function (text) {
    // API stability level: 1 - Experimental
    // text = " TEXT / PLAIN "
    // Returns -> {maintype:"text", subtype:"plain"}
    // text = " TEXT "
    // Returns -> {maintype:"text", subtype: null}
    for (var i = 0, l = text.length; i < l; ++i)
      if (text[i] === "/")
        return {
          maintype: text.slice(0, i).trim().toLowerCase(),
          subtype: text.slice(i + 1).trim().toLowerCase()
        };
    return {
      maintype: text.trim().toLowerCase(),
      subtype: null
    };
  };
  env.extractAndParseTypeFromMimeType = function (text) {
    // API stability level: 1 - Experimental
    // text = " TEXT / PLAIN ; CHARSET = UTF-8 ; BASE64"
    // Returns -> {maintype: "text", subtype: "plain"}
    return env.parseMimeTypeType(env.extractMimeTypeType(text));
  };

  env.extractTypePlistFromMimeType = function (text) {
    // API stability level: 1 - Experimental
    // text = " TEXT / PLAIN ; CHARSET = UTF-8 ; BASE64"
    // Returns -> {type:" TEXT / PLAIN ", plist:[" CHARSET = UTF-8 ", " BASE64"]}
    text = text.split(";");
    return {type: text[0], plist: text.slice(1)};
  };
  env.parseMimeType = function (text) {
    // API stability level: 1 - Experimental
    // text = " TEXT / PLAIN ; CHARSET = UTF-8 ; BASE64"
    // Returns -> {
    //   maintype: "text", subtype: "plain",
    //   params: {charset:"UTF-8", "base64":null}
    // }
    var o = env.extractTypePlistFromMimeType(text), type = env.parseMimeTypeType(o.type);
    return {
      maintype: type.maintype,
      subtype: type.subtype,
      params: env.parseEachMimeTypeParamToDict(o.plist)
    };
  };
  env.parseMimeTypeToList = function (text) {
    // API stability level: 1 - Experimental
    // text = " TEXT / PLAIN ; CHARSET = UTF-8 ; BASE64"
    // Returns -> ["text", "plain", "charset", "UTF-8", "base64", null]
    var o = env.extractTypePlistFromMimeType(text), type = env.parseMimeTypeType(o.type);
    return [type.maintype, type.subtype].concat(env.parseEachMimeTypeParamToList(o.plist));
  };

  env.sanitizeMimeType = function (text) {
    // API stability level: 1 - Experimental
    // text = " TEXT / PLAIN ; CHARSET = UTF-8 ; BASE64"
    // Returns -> "text/plain;charset=UTF-8;base64"
    var o = env.extractTypePlistFromMimeType(text),
        o2 = env.parseMimeTypeType(o.type),
        i = 0, l = o.plist.length;
    if (o2.subtype === null) text = o2.maintype;
    else text = o2.maintype + "/" + o2.subtype;
    for (; i < l; ++i) {
      o2 = env.parseMimeTypeParam(o.plist[i]);
      if (o2.value === null) o.plist[i] = o2.name;
      else o.plist[i] = o2.name + "=" + o2.value;
    }
    // XXX should we sort the parameters ?
    return [text].concat(o.plist).join(";");
  };

  //////////////
  // Data URI //
  //////////////

  env.parseDataUri = function (text) {
    // API stability level: 1 - Experimental

    // XXX do documentation

    // This follows chromium behavior when invoking DataURL in the omni bar

    // text ->
    //   "text/plain;charset=utf-8,hello%20world"
    // returns ->
    //   {mimetype: "text/plain;charset=utf-8",
    //    data: "hello%20world"}

    var i = 0, l = text.length;
    for (; i < l; i += 1)
      if (text[i] === ",")
        return {mimetype: text.slice(0, i), data: text.slice(i + 1)};
    return null;
  };

}(this.env));
