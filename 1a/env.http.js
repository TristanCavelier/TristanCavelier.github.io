/*jslint indent: 2 */
(function envHttp(env) {
  "use strict";

  /*! env.http.js Version 1.0.1

      Copyright (c) 2015-2016 Tristan Cavelier <t.cavelier@free.fr>
      This program is free software. It comes without any warranty, to
      the extent permitted by applicable law. You can redistribute it
      and/or modify it under the terms of the Do What The Fuck You Want
      To Public License, Version 2, as published by Sam Hocevar. See
      http://www.wtfpl.net/ for more details. */

  // dependencies:
  //   XMLHttpRequest
  //   env.newDeferred (async)
  //   env.partitionStringToObject (regexp)
  // provides:
  //   env.headerParamNameStringRegExp
  //   env.headerParamUnquotedValueStringRegExp
  //   env.headerParamQuotedValueStringRegExp
  //   env.headerParamValueStringRegExp
  //   env.headerParamStringParserRegExp
  //   env.headerParamsStringRegExp
  //   env.headerParamsMatcherRegExp
  //
  //   env.parseHeaderRawParams
  //   env.parseHttpHeaders
  //   env.stripHeaderParamName
  //   env.stripHeaderParamValue
  //   env.validateHeaderParamName
  //   env.sanitizeHeaderParamValue
  //   env.headerRawParamsToDictList
  //   env.remapHeaderRawParamsToStrippedValues
  //   env.parseHeaderParams
  //   env.formatHeaderParamsToString
  //
  //   env.metadataNameStringRegExp
  //   env.metadataUnquotedValueStringRegExp
  //   env.metadataQuotedValueStringRegExp
  //   env.metadataValueStringRegExp
  //   env.metadataStringParserRegExp
  //   env.metadataListStringRegExp
  //   env.metadataListMatcherRegExp
  //
  //   env.parseRawMetadataList
  //   env.sanitizeMetadataValue
  //   env.deepRemapRawMetadataListToStrippedValues
  //   env.parseMetadataList
  //   env.formatMetadataListToDict
  //   env.formatMetadataListToString
  //   env.formatMetadataToString
  //
  //   env.xhr

  if (env.registerLib) env.registerLib(envHttp);

  env.parseHttpHeaders = function (text) {
    // text ->
    //   "Server:   SimpleHTTP/0.6 Python/3.4.1\r\n
    //    Date: Wed, 04 Jun 2014 14:06:57 GMT   \r\n
    //    Value: hello\r\n
    //         guys  \r\n
    //    Content-Type: application/x-silverlight\r\n
    //    Content-Length: 11240\r\n
    //    Last-Modified: Mon, 03 Dec 2012 23:51:07 GMT\r\n
    //    X-Cache: HIT via me\r\n
    //    X-Cache: HIT via other\r\n"
    // Returns ->
    //   [ "Server", "SimpleHTTP/0.6 Python/3.4.1",
    //     "Date", "Wed, 04 Jun 2014 14:06:57 GMT",
    //     "Value", "hello guys",  // XXX check if it is the good behavior (refer to `xhr.getResponseHeader("Value")`)
    //     "Content-Type", "application/x-silverlight",
    //     "Content-Length", "11240",
    //     "Last-Modified", "Mon, 03 Dec 2012 23:51:07 GMT",
    //     "X-Cache", "HIT via me",
    //     "X-Cache", "HIT via other" ]

    // API stability level: 2 - Stable

    /*jslint regexp: true */
    var result = [], key, value = "", line, split = text.split("\r\n"), i = 0, l = split.length;
    while (i < l) {
      line = split[i];
      i += 1;
      if (line[0] === " " || line[0] === "\t") {
        value += " " + line.replace(/^\s*/, "").replace(/\s*$/, "");
      } else {
        if (key) { result.push(key, value); }
        key = /^([^:]+)\s*:\s*(.*)$/.exec(line);
        if (key) {
          value = key[2].replace(/\s*$/, "");
          key = key[1];
        }
      }
    }
    return result;
  };

  /////////////////////////
  // Header Param Parser //
  /////////////////////////

  env.headerParamNameStringRegExp = "(?:[^=;]+)";
  env.headerParamUnquotedValueStringRegExp = "(?:[^\";]+)";
  env.headerParamQuotedValueStringRegExp = "(?:\"(?:\\\\.|[^\\\"])*(?:\"|$))";
  env.headerParamValueStringRegExp = "(?:(?:" + env.headerParamQuotedValueStringRegExp + "|" + env.headerParamUnquotedValueStringRegExp + ")+)";
  env.headerParamStringParserRegExp = "(?:(" + env.headerParamNameStringRegExp + "?)(?:=(" + env.headerParamValueStringRegExp + "?))?)";
  env.headerParamsStringRegExp = "(?:" + env.headerParamStringParserRegExp + "(?:;" + env.headerParamStringParserRegExp + ")*)";
  env.headerParamsMatcherRegExp = new RegExp("^" + env.headerParamsStringRegExp + "$");  // BBB
  env.headerParamSearchRegExp = new RegExp(";" + env.headerParamStringParserRegExp, "g");  // BBB

  env.parseHeaderRawParams = function (text) {
    // ' abc = "def" ;ghi=jkl' -> ["abc", " \"def\" ", "ghi", "jkl"]

    // API stability level: 1 - Experimental
    var a = env.partitionStringToObject(";" + text, /;(?:((?:[^=;]+)?)(?:=((?:(?:(?:"(?:\\.|[^\"])*(?:"|$))|(?:[^";]+))+)?))?)/g),  // new RegExp(";" + env.headerParamStringParserRegExp, "g")
        l = a.length, i, result = [];
    for (i = 0; i < l; i += 1) {
      if (i % 2) {
        if (a[i][2] !== undefined) { result.push(a[i][1], a[i][2]); }
        else { result.push(a[i][1], null); }
      } else {
        if (a[i][0] !== "") { return null; }
        // XXX ^- is this condition useful ??
        //     the parser should never pass this condition, no matter the input data
      }
    }
    return result;
  };
  env.stripHeaderParamName = function (name) { return name.replace(/(?:^\s+|\s+$)/g, ""); };
  env.stripHeaderParamValue = function (value) {
    var tmp = /^(?:\s*"((?:\\"|[^"])*)"\s*)$/.exec(value);
    if (tmp) { return tmp[1].replace(/\\"/g, "\""); }
    if (value) { return value.replace(/(?:^\s+|\s+$)/g, ""); }
    return value;
  };
  env.validateHeaderParamName = function (name) {
    if (/=/.test(name)) { throw Error("invalid header param name '" + name + "'"); }
    return name;
  };
  env.sanitizeHeaderParamValue = function (value) {
    if (/["; ]/.test(value)) { return "\"" + value.replace(/"/g, "\\\"") + "\"" }
    return value;
  };

  env.headerRawParamsToDictList = function (headerParams) {
    // [" abc ", " \"def\" "] -> [{name: "abc", value: "def"}]
    var a = [], l = headerParams.length, i;
    for (i = 0; i < l; i += 2) { a.push({name: env.stripHeaderParamName(headerParams[i]), value: env.stripHeaderParamValue(headerParams[i + 1])}); }
    return a;
  };
  env.remapHeaderRawParamsToStrippedValues = function (headerParams) {
    // [" abc ", " \"def\" "] -> ["abc", "def"]
    var l = headerParams.length, i;
    for (i = 0; i < l; i += 2) { headerParams[i] = env.stripHeaderParamName(headerParams[i]); }
    for (i = 1; i < l; i += 2) { headerParams[i] = env.stripHeaderParamValue(headerParams[i]); }
    return headerParams;
  };
  env.parseHeaderParams = function (text) {
    // ' abc = "def" ;ghi=jkl' -> ["abc", "def", "ghi", "jkl"]
    return env.remapHeaderRawParamsToStrippedValues(env.parseHeaderRawParams(text));
  };

  env.formatHeaderParamsToString = function (headerParams) {
    // ["abc", "d;ef", "ghi", "j,kl", "mno", "pqr"] -> 'abc="d;ef";ghi=j,kl;mno=pqr'
    var l = headerParams.length, i, r = [];
    for (i = 0; i < l; i += 2) {
      if (headerParams[i + 1] === null) { r.push(env.validateHeaderParamName(headerParams[i])); }
      else { r.push(env.validateHeaderParamName(headerParams[i]) + "=" + env.sanitizeHeaderParamValue(headerParams[i + 1])); }
    }
    return r.join(";");
  };

  ///////////////////////////////////////
  // Header Params & Attributes Parser //
  ///////////////////////////////////////

  // XXX rename metadata to ??? header params list, header params attributes, set cookie list, accept params
  env.metadataNameStringRegExp = "(?:[^=;,]+)";
  env.metadataUnquotedValueStringRegExp = "(?:[^\";,]+)";
  env.metadataQuotedValueStringRegExp = "(?:\"(?:\\\\.|[^\\\"])*(?:\"|$))";
  env.metadataValueStringRegExp = "(?:(?:" + env.metadataQuotedValueStringRegExp + "|" + env.metadataUnquotedValueStringRegExp + ")+)";
  env.metadataStringParserRegExp = "(?:(" + env.metadataNameStringRegExp + "?)(?:=(" + env.metadataValueStringRegExp + "?))?)";
  env.metadataListStringRegExp = "(?:" + env.metadataStringParserRegExp + "(?:[;,]" + env.metadataStringParserRegExp + ")*)";
  env.metadataListMatcherRegExp = new RegExp("^" + env.metadataListStringRegExp + "$");  // BBB
  env.metadataSearchRegExp = new RegExp("(;|,)" + env.metadataStringParserRegExp, "g");  // BBB

  env.parseRawMetadataList = function (text) {
    // Parse -> ' abc = "def" ;ghi=jkl,text/html; charset=utf-8'
    //    to -> [[" abc ", " \"def\" ", "ghi", "jkl"], ["text/html", null, " charset", "utf-8"]]

    // API stability level: 1 - Experimental
    var a = env.partitionStringToObject("," + text, /(;|,)(?:((?:[^=;,]+)?)(?:=((?:(?:(?:"(?:\\.|[^\"])*(?:"|$))|(?:[^";,]+))+)?))?)/g),  // new RegExp("(;|,)" + env.metadataStringParserRegExp, "g")
        l = a.length, i, m, result = [], c = null;
    for (i = 0; i < l; i += 1) {
      if (i % 2) {
        m = a[i];
        if (m[1] === ",") {  // reading metadata name + value
          if (c !== null) { result.push(c); }
          if (m[3] !== undefined) { c = [m[2], m[3]]; }
          else { c = [m[2], null]; }
        } else {  // reading metadata param
          if (m[3] !== undefined) { c.push(m[2], m[3]); }
          else { c.push(m[2], null); }
        }
      } else {
        if (a[i][0] !== "") { return null; }
        // XXX ^- is this condition useful ??
        //     the parser should never pass this condition, no matter the input data
      }
    }
    if (c !== null) { result.push(c); }
    return result;
  };
  env.sanitizeMetadataValue = function (value) {
    // 'a;bc' -> '"a;bc"'
    // 'd,ef' -> '"d,ef"'
    // 'ghi' -> 'ghi'
    if (/[";, ]/.test(value)) { return "\"" + value.replace(/"/g, "\\\"") + "\""; }
    return value;
  };
  env.deepRemapRawMetadataListToStrippedValues = function (metadataList) {
    // [[" abc ", " \"def\" ", " ghi ", " \"jkl\" "], [...]] -> [["abc", "def", "ghi", "jkl"], [...]]
    var l = metadataList.length, i, a, j, jl;
    for (i = 0; i < l; i += 1) {
      a = metadataList[i];
      jl = a.length;
      for (j = 0; j < jl; j += 2) { a[j] = env.stripHeaderParamName(a[j]); }
      for (j = 1; j < jl; j += 2) { a[j] = env.stripHeaderParamValue(a[j]); }
    }
    return metadataList;
  };
  env.parseMetadataList = function (text) {
    // Parse -> ' abc = "def" ;ghi=jkl,text/html; charset=utf-8'
    //    to -> [["abc", "def", "ghi", "jkl"], ["text/html", null, "charset", "utf-8"]]
    return env.deepRemapRawMetadataListToStrippedValues(env.parseRawMetadataList(text));
  };

  env.formatMetadataListToDict = function (metadataList) {
    // [["abc", "def", "ghi", "jkl"], ["mno", "pqr"]] -> {"abc": "def", "mno": "pqr"}
    var l = metadataList.length, r = {}, m, i;
    for (i = 0; i < l; i += 1) {
      m = metadataList[i];
      if (!r[m[0]]) { r[m[0]] = m[1]; }
    }
    return r;
  };
  env.formatMetadataListToString = function (metadataList) {
    // [["abc", "def", "ghi", "j;kl"], ["mno", "p,qr"]] -> 'abc=def;ghi="j;kl",mno="p,qr"'
    return metadataList.map(env.formatMetadataToString).join(",");
  };
  env.formatMetadataToString = function (metadata) {
    // ["abc", "d;ef", "ghi", "j,kl", "mno", "pqr"] -> 'abc="d;ef";ghi="j,kl";mno=pqr'
    var l = metadata.length, i, r = [];
    for (i = 0; i < l; i += 2) {
      if (metadata[i + 1] === null) { r.push(env.validateHeaderParamName(metadata[i])); }
      else { r.push(env.validateHeaderParamName(metadata[i]) + "=" + env.sanitizeMetadataValue(metadata[i + 1])); }
    }
    return r.join(";");
  };

  /////////////
  // Request //
  /////////////

  env.xhr = function (param) {  // XXX move to env.xhr-helpers.js ?
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

    // API stability level: 2 - Stable

    /*global XMLHttpRequest */
    var d = env.newDeferred(), xhr = new XMLHttpRequest(), k, i, l, a;
    d.promise.cancel = function () { xhr.abort(); };
    if (param.username) { xhr.open((param.method || "GET").toUpperCase(), param.url, true); }
    else { xhr.open((param.method || "GET").toUpperCase(), param.url, true, param.username, param.password); }
    xhr.responseType = param.responseType || "";
    if (param.overrideMimeType) { xhr.overrideMimeType(param.overrideMimeType); }
    if (param.withCredentials !== undefined) { xhr.withCredentials = param.withCredentials; }
    if (param.headers) {
      a = Object.keys(param.headers);
      l = a.length;
      for (i = 0; i < l; i += 1) {
        k = a[i];
        xhr.setRequestHeader(k, param.headers[k]);
      }
    }
    xhr.addEventListener("load", function (e) {
      if (param.getEvent) { return d.resolve(e); }
      var r, t = e.target;
      if (t.status < 400) { return d.resolve(t); }
      r = new Error("HTTP: " + (t.status ? t.status + " " : "") + (t.statusText || "Unknown"));
      r.target = t;
      return d.reject(r);
    }, false);
    xhr.addEventListener("error", function (e) {
      if (param.getEvent) { return d.resolve(e); }
      var r = new Error("HTTP: Error");
      r.target = e.target;
      return d.reject(r);
    }, false);
    xhr.addEventListener("abort", function (e) {
      if (param.getEvent) { return d.resolve(e); }
      var r = new Error("HTTP: Aborted");
      r.target = e.target;
      return d.reject(r);
    }, false);
    if (typeof param.onProgress === "function") { xhr.addEventListener("progress", param.onProgress); }
    if (typeof param.onUploadProgress === "function") { xhr.upload.addEventListener("progress", param.onUploadProgress); }
    if (param.xhrFields) {
      a = Object.keys(param.xhrFields);
      l = a.length;
      for (i = 0; i < l; i += 1) {
        k = a[i];
        xhr[k] = param.xhrFields[k];
      }
    }
    if (typeof param.beforeSend === 'function') { param.beforeSend(xhr); }
    xhr.send(param.data);
    return d.promise;
  };

}(this.env));
