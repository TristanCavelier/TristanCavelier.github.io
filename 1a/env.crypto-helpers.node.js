(function envCryptoHelpers(env) {
  "use strict";

  /*! Copyright (c) 2015-2016 Tristan Cavelier <t.cavelier@free.fr>
      This program is free software. It comes without any warranty, to
      the extent permitted by applicable law. You can redistribute it
      and/or modify it under the terms of the Do What The Fuck You Want
      To Public License, Version 2, as published by Sam Hocevar. See
      http://www.wtfpl.net/ for more details. */

  // provides:
  //   env.randomBytes

  const crypto = require("crypto");

  if (env.registerLib) env.registerLib(envCryptoHelpers);

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

  env.randomBytes = wrapNodeJsAsyncMethod(crypto.randomBytes);

}(this.env));
