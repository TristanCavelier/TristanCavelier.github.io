/*jslint indent: 2 */
(function envWorkerHelpers(env) {
  "use strict";

  /*! env.worker-helpers.js Version 1.0.0

      Copyright (c) 2015-2016 Tristan Cavelier <t.cavelier@free.fr>
      This program is free software. It comes without any warranty, to
      the extent permitted by applicable law. You can redistribute it
      and/or modify it under the terms of the Do What The Fuck You Want
      To Public License, Version 2, as published by Sam Hocevar. See
      http://www.wtfpl.net/ for more details. */

  // dependencies: Worker, URL, Blob,
  //               async (env.newDeferred)

  env.registerLib(envWorkerHelpers);

  env.evalOnWorker = function (text, onMessage) {
    // API stability level: 1 - Experimental

    // No critical stuff should be done here because `cancel` terminates the worker.
    // Workers should be used for big calculations like hashing with bcrypt.
    // It takes arround 50 ms for chrome 51 to load and start a worker.

    // Ex: env.evalOnWorker(env.toScript() + "env.longComputation(function (progressEvent) {\
    //       postMessage(progressEvent.percent);\
    //     });", function (percent) {
    //       console.log(percent);
    //     });

    /*global Worker, URL, Blob */
    // XXX how to avoid "Uncaught (in promise) error..." ?
    var worker = new Worker(URL.createObjectURL(new Blob([[
      "var global = this;",
      "onmessage = function (e) {",
      "  var postMessage = global.postMessage;",
      "  Promise.resolve().then(function () {",
      "    return global.eval(e.data);",
      "  }).then(function (value) {",
      "    postMessage([0, value]);",
      "  }, function (reason) {",
      "    if (reason instanceof Error) { reason = reason.toString(); }",
      "    postMessage([1, reason]);",
      "  });",
      "  global.postMessage = function (m) {",
      "    postMessage([2, m]);",
      "  };",
      "}"
    ].join("\n")], {type: "application/javascript"}))), d = env.newDeferred();
    d.promise.cancel = function () {
      worker.terminate();
      d.reject(new Error("evalOnWorker terminated"));
    };
    // XXX handle pause & resume ?
    worker.onmessage = function (e) {
      if (e.data[0] === 2) {
        if (onMessage) { return onMessage(e.data[1]); }
        return;
      }
      if (e.data[0] === 0) { d.resolve(e.data[1]); } else { d.reject(e.data[1]); }
      worker.terminate();
    };
    worker.postMessage(text);
    return d.promise;
  };

}(this.env));
