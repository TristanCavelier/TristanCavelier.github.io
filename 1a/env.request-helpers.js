/*jslint indent: 2 */
(function envRequestHelpers(env) {
  "use strict";

  /*! env.request-helpers.js Version 1.0.0

      Copyright (c) 2015-2016 Tristan Cavelier <t.cavelier@free.fr>
      This program is free software. It comes without any warranty, to
      the extent permitted by applicable law. You can redistribute it
      and/or modify it under the terms of the Do What The Fuck You Want
      To Public License, Version 2, as published by Sam Hocevar. See
      http://www.wtfpl.net/ for more details. */

  // dependencies:
  //   XMLHttpRequest
  //   env.newDeferred (async)
  // provides:
  //   env.xhr

  if (env.registerLib) env.registerLib(envRequestHelpers);

  env.xhr = function (param) {
    /**
     *    xhr({url: location, responseType: "text"}).then(propertyGetter("responseText"));
     *
     * Send request with XHR and return a promise. xhr.onload: The promise is
     * resolved when the status code is lower than 400 with a forged response
     * object as resolved value. xhr.onerror: reject with an Error (with status
     * code in status property) as rejected value.
     *
     * @param  {Object} param The parameters
     * @param  {String} param.url The url
     * @param  {String} [param.method="GET"] The request method
     * @param  {String} [param.responseType=""] The data type to retrieve
     * @param  {String} [param.overrideMimeType] The mime type to override
     * @param  {Object} [param.headers] The headers to send
     * @param  {Any} [param.data] The data to send
     * @param  {Boolean} [param.withCredentials] Tell the browser to use
     *   credentials
     * @param  {String} [param.username] The login username
     * @param  {String} [param.password] The login password
     * @param  {Object} [param.xhrFields] The other xhr fields to fill
     * @param  {Boolean} [param.getEvent] Tell the method to return the
     *   response event.
     * @param  {Function} [param.onProgress] A listener that will be attach to the XHR
     * @param  {Function} [param.onUploadProgress] A listener that will be attach to the XHR upload
     * @param  {Function} [param.beforeSend] A function called just before the
     *   send request. The first parameter of this function is the XHR object.
     * @return {Task<XMLHttpRequest>} The XHR
     */

    // API stability level: 1 - Experimental

    /*global XMLHttpRequest */
    var d = env.newDeferred(), xhr = new XMLHttpRequest(), k, i, l, a;
    d.promise.cancel = function () { xhr.abort(); };
    if (param.username) xhr.open((param.method || "GET").toUpperCase(), param.url, true);
    else xhr.open((param.method || "GET").toUpperCase(), param.url, true, param.username, param.password);
    xhr.responseType = param.responseType || "";
    if (param.overrideMimeType) xhr.overrideMimeType(param.overrideMimeType);
    if (param.withCredentials !== undefined) xhr.withCredentials = param.withCredentials;
    if (param.headers) {
      a = Object.keys(param.headers);
      l = a.length;
      for (i = 0; i < l; i += 1) {
        k = a[i];
        xhr.setRequestHeader(k, param.headers[k]);
      }
    }
    xhr.addEventListener("load", function (e) {
      if (param.getEvent) return d.resolve(e);
      var r, t = e.target;
      if (t.status < 400) return d.resolve(t);
      r = new Error("HTTP: " + (t.status ? t.status + " " : "") + (t.statusText || "Unknown"));
      r.target = t;
      return d.reject(r);
    }, false);
    xhr.addEventListener("error", function (e) {
      if (param.getEvent) return d.resolve(e);
      var r = new Error("HTTP: Error");
      r.target = e.target;
      return d.reject(r);
    }, false);
    xhr.addEventListener("abort", function (e) {
      if (param.getEvent) return d.resolve(e);
      var r = new Error("HTTP: Aborted");
      r.target = e.target;
      return d.reject(r);
    }, false);
    if (typeof param.onProgress === "function") xhr.addEventListener("progress", param.onProgress);
    if (typeof param.onUploadProgress === "function") xhr.upload.addEventListener("progress", param.onUploadProgress);
    if (param.xhrFields) {
      a = Object.keys(param.xhrFields);
      l = a.length;
      for (i = 0; i < l; i += 1) {
        k = a[i];
        xhr[k] = param.xhrFields[k];
      }
    }
    if (typeof param.beforeSend === 'function') param.beforeSend(xhr);
    xhr.send(param.data);
    return d.promise;
  };

}(this.env));
