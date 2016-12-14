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
  function rep(k, v) {
    if (v === undefined) return "\xa0undefined\xa0";
    if (typeof v === "number") {
      if (v === Infinity) return "\xa0Infinity\xa0";
      if (v === -Infinity) return "\xa0-Infinity\xa0";
      if (isNaN(v)) return "\xa0NaN\xa0";
    }
    return v;
  }
  function json(o) { return JSON.stringify(o, rep); }
  function test(name, timeout, expected, testFn) {
    var res = [], timer;
    function end() {
      if (timer === undefined) return error("test `" + name + "`, `end` called twice");
      timer = clearTimeout(timer);  // timer should be set to undefined
      if (json(res, rep) !== json(expected, rep)) {
        error("test `" + name + "`, result `" + json(res, rep) + "` !== `" + json(expected, rep) + "` expected");
      }
    }
    timer = setTimeout(function () {
      try { if (typeof end.onbeforetimeout === "function") end.onbeforetimeout(); }
      catch (e) { error("test: " + name + ", error on before timeout ! `" + e + "`"); }
      if (timer === undefined) return;  // it has ended in before timeout
      error("test `" + name + "`, timeout ! result `" + json(res, rep) + "` <-> `" + json(expected, rep) + "` expected");
    }, timeout);
    setTimeout(function () {
      try { testFn(res, end); }
      catch (e) { error("test `" + name + "`, error ! result `" + e + "`"); }
    });
  }
  function sleep(ms) { return env.newPromise(function (resolve) { setTimeout(resolve, ms); }); }
  function then(fn) { try { return env.Promise.resolve(typeof fn === "function" ? fn() : undefined); } catch (e) { return env.Promise.reject(e); } }
  function toThenable(v) { if (v && typeof v.then === "function") return v; return env.Promise.resolve(v); }
  function task(gf) { return new env.Task(gf); }

  //////////////////////////////////////////////
  // Channel tests
  test("'channel.getLength' starts with length 0", 1000, [0, 0, 0, 0], function (res, end) {
    res.push(env.newChannel().getLength());
    res.push(env.newChannel(0).getLength());
    res.push(env.newChannel(5).getLength());
    res.push(env.newChannel(Infinity).getLength());
    end();
  });
  test("'channel.getLength' does not increase if capacity 0", 1000, [0, 0, 0, 0], function (res, end) {
    // test init
    var chan = env.newChannel();
    // actual test
    chan.send();
    res.push(chan.getLength());
    sleep(4).then(function () {
      res.push(chan.getLength());
      chan.next();
      res.push(chan.getLength());
      chan.next();
      res.push(chan.getLength());
      end();
    });
  });
  test("'channel.getLength' increase if capacity > 0 and decrease correctly", 1000, [1, 1, 0, 0], function (res, end) {
    // test init
    var chan = env.newChannel(5);
    // actual test
    chan.send();
    res.push(chan.getLength());
    sleep(4).then(function () {
      res.push(chan.getLength());
      chan.next();
      res.push(chan.getLength());
      chan.next();
      res.push(chan.getLength());
      end();
    });
  });
  test("'channel.getCapacity'", 1000, [0, 0, 5, 0, Infinity, 0, 0, 0, 1, 0, 0, 0], function (res, end) {
    res.push(env.newChannel().getCapacity());
    res.push(env.newChannel(0).getCapacity());
    res.push(env.newChannel(5).getCapacity());
    res.push(env.newChannel(-5).getCapacity());
    res.push(env.newChannel(Infinity).getCapacity());
    res.push(env.newChannel(-Infinity).getCapacity());
    res.push(env.newChannel(NaN).getCapacity());
    res.push(env.newChannel(null).getCapacity());
    res.push(env.newChannel(true).getCapacity());
    res.push(env.newChannel(false).getCapacity());
    res.push(env.newChannel([]).getCapacity());
    res.push(env.newChannel({}).getCapacity());
    end();
  });
  test("'channel.isClosed' false at start, true at end", 1000, [false, true], function (res, end) {
    var chan = env.newChannel();
    res.push(chan.isClosed());
    chan.close();
    res.push(chan.isClosed());
    end();
  });
  test("'channel.isClosed' true even if filled (len > 0)", 1000, [true], function (res, end) {
    var chan = env.newChannel(1);
    chan.send();
    chan.close();
    res.push(chan.isClosed());
    end();
  });
  test("'channel.isEmpty' (!channel.isFilled)", 1000, [true, true, true, false], function (res, end) {
    var chan;
    res.push(env.newChannel().isEmpty());
    res.push(env.newChannel(1).isEmpty());
    chan = env.newChannel();
    chan.send();
    res.push(chan.isEmpty());
    chan = env.newChannel(1);
    chan.send();
    res.push(chan.isEmpty());
    end();
  });
  test("'channel.isFree' (!channel.isFull)", 1000, [false, true, false, false], function (res, end) {
    var chan;
    res.push(env.newChannel().isFree());
    res.push(env.newChannel(1).isFree());
    chan = env.newChannel();
    chan.send();
    res.push(chan.isFree());
    chan = env.newChannel(1);
    chan.send();
    res.push(chan.isFree());
    end();
  });
  test("'channel.isFilled' (!channel.isEmpty)", 1000, [false, false, false, true], function (res, end) {
    var chan;
    res.push(env.newChannel().isFilled());
    res.push(env.newChannel(1).isFilled());
    chan = env.newChannel();
    chan.send();
    res.push(chan.isFilled());
    chan = env.newChannel(1);
    chan.send();
    res.push(chan.isFilled());
    end();
  });
  test("'channel.isFull' (!channel.isFree)", 1000, [true, false, true, true], function (res, end) {
    var chan;
    res.push(env.newChannel().isFull());
    res.push(env.newChannel(1).isFull());
    chan = env.newChannel();
    chan.send();
    res.push(chan.isFull());
    chan = env.newChannel(1);
    chan.send();
    res.push(chan.isFull());
    end();
  });
  test("'channel.isReadable'", 1000, [false, false, true, true, false], function (res, end) {
    var chan, sending;
    res.push(env.newChannel().isReadable());
    res.push(env.newChannel(1).isReadable());
    chan = env.newChannel();
    chan.send();
    res.push(chan.isReadable());
    chan = env.newChannel(1);
    chan.send();
    res.push(chan.isReadable());
    chan = env.newChannel();
    sending = chan.send();
    sending.cancel();
    res.push(chan.isReadable());
    end();
  });
  test("'channel.close' twice is ok", 1000, [], function (res, end) {
    var chan = env.newChannel();
    try {
      chan.close();
      chan.close();
    } catch (e) {
      res.push(e.message);
    }
    end();
  });
  test("'channel.close' makes 'next' to return object signaling closed", 1000, [undefined, true], function (res, end) {
    var chan = env.newChannel();
    chan.close();
    then(function () {
      return chan.next();
    }).then(function (v) {
      res.push(v.value, v.done);
      end();
    });
  });
  test("'channel.close' fulfills waiting 'next'", 1000, [undefined, true], function (res, end) {
    var chan = env.newChannel();
    then(function () {
      chan.next();
      return chan.next();
    }).then(function (v) {
      res.push(v.value, v.done);
      end();
    });
    chan.close();
  });
  test("'channel.close' makes 'send' to throw", 1000, [true], function (res, end) {
    var chan = env.newChannel();
    chan.close();
    then(function () {
      return chan.send();
    }).then(null, function (e) {
      res.push(e instanceof Error);
      end();
    });
  });
  test("'channel.send' fulfilled on 'next'", 1000, ["start", "next", "send"], function (res, end) {
    var chan = env.newChannel();
    then(function () {
      res.push("start");
      return chan.send();
    }).then(function () {
      res.push("send");
      end();
    });
    sleep(4).then(function () {
      chan.next();
      res.push("next");
    });
  });
  test("'channel.send' fulfilled directly if free (cap > 0)", 1000, ["start", "send", "next"], function (res, end) {
    var chan = env.newChannel(1);
    then(function () {
      res.push("start");
      return chan.send();
    }).then(function () {
      res.push("send");
    });
    sleep(4).then(function () {
      chan.next();
      res.push("next");
      end();
    });
  });
  test("'channel.send' fulfilled after one send + next (cap = 1)", 1000, ["start", "send", "next", "send"], function (res, end) {
    var chan = env.newChannel(1);
    then(function () {
      res.push("start");
      return chan.send();
    }).then(function () {
      res.push("send");
      return chan.send();
    }).then(function () {
      res.push("send");
      end();
    });
    sleep(4).then(function () {
      chan.next();
      res.push("next");
    });
  });
  test("'channel.send cancel' puts nothing on the channel", 1000, ["start", "cancelled"], function (res, end) {
    var chan = env.newChannel(), s;
    then(function () {
      res.push("start");
      return s = chan.send(2);
    }).then(null, function () {
      res.push("cancelled");
      sleep(4).then(end);
    });
    sleep(4).then(function () {
      s.cancel();
      then(function () {
        return chan.next();
      }).then(function () {
        res.push("next");
        end();
      });
    });
  });
  test("'channel.send cancel' after next does nothing", 1000, ["start", "next"], function (res, end) {
    var chan = env.newChannel(), s;
    then(function () {
      res.push("start");
      return s = chan.send(2);
    }).then(null, function () {
      res.push("cancelled");
      sleep(4).then(end);
    });
    sleep(4).then(function () {
      then(function () {
        return chan.next();
      }).then(function () {
        res.push("next");
        end();
      });
      s.cancel();
    });
  });
  test("'channel.send' returns synchronously if waiting for next (experimental)", 1000, [false], function (res, end) {
    var chan = env.newChannel();
    chan.next();
    res.push(!!chan.send());
    end();
  });
  test("'channel.send' returns synchronously if free (cap > 0) (experimental)", 1000, [false, true], function (res, end) {
    var chan = env.newChannel(1);
    res.push(!!chan.send());
    res.push(!!chan.send());
    end();
  });
  test("'channel.next' fulfilled on 'send' with sent value", 1000, ["start", "send", 2, false], function (res, end) {
    var chan = env.newChannel();
    then(function () {
      res.push("start");
      return chan.next();
    }).then(function (v) {
      res.push(v.value, v.done);
      end();
    });
    sleep(4).then(function () {
      chan.send(2);
      res.push("send");
    });
  });
  test("'channel.next' fulfilled after next+send+send", 1000, ["start", "send", 2, false, "send", 3, false], function (res, end) {
    var chan = env.newChannel();
    then(function () {
      res.push("start");
      return chan.next();
    }).then(function (v) {
      res.push(v.value, v.done);
      return chan.next();
    }).then(function (v) {
      res.push(v.value, v.done);
      end();
    });
    sleep(4).then(function () {
      chan.send(2);
      res.push("send");
      sleep(4).then(function () {
        chan.send(3);
        res.push("send");
      });
    });
  });
  test("'channel.next+send' scenario", 1000, [3], function (res, end) {
    var chan = env.newChannel(), s;
    then(function () {
      return chan.next();
    }).then(function (v) {
      s = v.value;
      return chan.next();
    }).then(function (v) {
      res.push(v.value);
    });
    then(function () {
      return chan.send(2);
    }).then(function () {
      return chan.send(s + 1);
    }).then(function () {
      sleep(4).then(end);
    });
  });
  test("'channel.next cancel' make later 'send' waiting", 1000, ["start", "cancelled"], function (res, end) {
    var chan = env.newChannel(), s;
    then(function () {
      res.push("start");
      return s = chan.next();
    }).then(null, function () {
      res.push("cancelled");
      sleep(4).then(end);
    });
    sleep(4).then(function () {
      s.cancel();
      then(function () {
        return chan.send();
      }).then(function () {
        res.push("send");
        end();
      });
    });
  });
  test("'channel.next' returns synchronously object value if sending (experimental)", 1000, [2, false], function (res, end) {
    var chan = env.newChannel(), v;
    chan.send(2);
    v = chan.next();
    res.push(v.value, v.done);
    end();
  });
  test("'channel.next' returns synchronously object value if filled (experimental)", 1000, [2, false], function (res, end) {
    var chan = env.newChannel(1), v;
    chan.send(2);
    v = chan.next();
    res.push(v.value, v.done);
    end();
  });
  test("'Channel.select' gets first responding next without consuming other next", 1000, [true, 2, 33, false, 22, false], function (res, end) {
    var chan1 = env.newChannel(),
        chan2 = env.newChannel(),
        chan3 = env.newChannel();
    then(function () {
      return env.Channel.select([chan1, chan2, chan3]);
    }).then(function (v) {
      res.push(v.channel === chan3, v.index, v.value, v.done);
      return chan2.next();
    }).then(function (v) {
      res.push(v.value, v.done);
      end();
    });
    chan3.send(33);
    chan2.send(22);
  });
  test("'Channel.select' gets first filled channel without consuming other next", 1000, [true, 1, 22, false, 33, false], function (res, end) {
    var chan1 = env.newChannel(),
        chan2 = env.newChannel(),
        chan3 = env.newChannel();
    chan3.send(33);
    chan2.send(22);
    then(function () {
      return env.Channel.select([chan1, chan2, chan3]);
    }).then(function (v) {
      res.push(v.channel === chan2, v.index, v.value, v.done);
      return chan3.next();
    }).then(function (v) {
      res.push(v.value, v.done);
      end();
    });
  });
  test("'Channel.select cancel' cancels without consuming other next", 1000, ["cancelled", 33, false, 22, false], function (res, end) {
    var chan1 = env.newChannel(),
        chan2 = env.newChannel(),
        chan3 = env.newChannel(), s;
    then(function () {
      return s = env.Channel.select([chan1, chan2, chan3]);
    }).then(null, function (e) {
      res.push("cancelled");
      return chan3.next();
    }).then(function (v) {
      res.push(v.value, v.done);
      return chan2.next();
    }).then(function (v) {
      res.push(v.value, v.done);
      end();
    });
    chan3.send(33);
    chan2.send(22);
    s.cancel();
  });
  test("'Channel.select ifreadable' return synchronously null if no channel are filled", 1000, [null], function (res, end) {
    var chan1 = env.newChannel(),
        chan2 = env.newChannel(),
        chan3 = env.newChannel();
    res.push(env.Channel.select([chan1, chan2, chan3], true));
    end();
  });
  test("'Channel.select ifreadable' return synchronously first filled channel value", 1000, [true, 1, 22, false], function (res, end) {
    var chan1 = env.newChannel(),
        chan2 = env.newChannel(),
        chan3 = env.newChannel(), v;
    chan3.send(33);
    chan2.send(22);
    v = env.Channel.select([chan1, chan2, chan3], true);
    res.push(v.channel === chan2, v.index, v.value, v.done);
    end();
  });

}(this.env));
