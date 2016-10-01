/*jslint indent: 2 */
(function envTime(env) {
  "use strict";

  /*! env.time.js Version 1.0.1

      Copyright (c) 2015-2016 Tristan Cavelier <t.cavelier@free.fr>
      This program is free software. It comes without any warranty, to
      the extent permitted by applicable law. You can redistribute it
      and/or modify it under the terms of the Do What The Fuck You Want
      To Public License, Version 2, as published by Sam Hocevar. See
      http://www.wtfpl.net/ for more details. */

  // dependency: async (env.newPromise, env.setTimeout, env.clearTimeout)
  // provides: env.sleep

  if (env.registerLib) env.registerLib(envTime);

  function sleepTask(ms) {
    var timer, rejecter, promise = env.newPromise(function (resolve, reject) {
      timer = env.setTimeout(resolve, ms);
      rejecter = reject;
    });
    promise.cancel = function () {
      env.clearTimeout(timer);
      rejecter(new Error("cancelled"));
    };
    return promise;
  }
  env.sleep = sleepTask;

}(this.env));
