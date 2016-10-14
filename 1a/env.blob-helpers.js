/*jslint indent: 2 */
(function envBlobHelpers(env) {
  "use strict";

  /*! env.blob-helpers.js Version 1.0.0

      Copyright (c) 2015-2016 Tristan Cavelier <t.cavelier@free.fr>
      This program is free software. It comes without any warranty, to
      the extent permitted by applicable law. You can redistribute it
      and/or modify it under the terms of the Do What The Fuck You Want
      To Public License, Version 2, as published by Sam Hocevar. See
      http://www.wtfpl.net/ for more details. */

  // dependencies:
  //   FileReader
  //   env.newDeferred (async)

  if (env.registerLib) env.registerLib(envBlobHelpers);

  env.readBlobAsArrayBuffer = function (blob) {
    /*global FileReader */
    var d = env.newDeferred(), fr = new FileReader();
    fr.onload = function (e) { return d.resolve(e.target.result); };
    fr.onerror = fr.onabort = function (e) { return d.reject(e.target.error); };
    d.promise.cancel = function () { fr.abort(); };
    fr.readAsArrayBuffer(blob);
    return d.promise;
  };

  env.readBlobAsText = function (blob) {
    /*global FileReader */
    var d = env.newDeferred(), fr = new FileReader();
    fr.onload = function (e) { return d.resolve(e.target.result); };
    fr.onerror = fr.onabort = function (e) { return d.reject(e.target.error); };
    d.promise.cancel = function () { fr.abort(); };
    fr.readAsText(blob);
    return d.promise;
  };

}(this.env));
