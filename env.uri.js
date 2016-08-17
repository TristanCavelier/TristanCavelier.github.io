/*jslint indent: 2 */
(function envUri(env) {
  "use strict";

  /*! env.uri.js Version 1.0.1

      Copyright (c) 2015-2016 Tristan Cavelier <t.cavelier@free.fr>
      This program is free software. It comes without any warranty, to
      the extent permitted by applicable law. You can redistribute it
      and/or modify it under the terms of the Do What The Fuck You Want
      To Public License, Version 2, as published by Sam Hocevar. See
      http://www.wtfpl.net/ for more details. */

  // dependencies: encodeURI, decodeURI, encodeURIComponent, decodeURIComponent
  // provides: env.ipv6StringRegExp,
  //           env.ipv4StringRegExp,
  //           env.decimalByteStringRegExp,
  //           env.urlProtocolStringRegExp,
  //           env.urlUserPasswordCharsetStringRegExp,
  //           env.urlDomainStringRegExp,
  //           env.urlPortStringRegExp,
  //           env.urlHostNameStringRegExp,
  //           env.urlPathNameCharsetStringRegExp,
  //           env.urlQueryCharsetStringRegExp,
  //           env.urlHashCharsetStringRegExp,
  //           env.urlParserRegExp,
  //           env.urlSearchRegExp,
  //
  //           env.parseUrl,
  //           env.makeUrl,
  //           env.normalizeUrlPathname,
  //           env.resolveUrlPathname,
  //           env.resolveUrl

  env.registerLib(envUri);

  // uriComponentEncodeCharsetStringRegExp = "[a-zA-Z0-9\\-_\\.!~\\*'\\(\\);,/\\?:@&=\\+\\$]";
  // uriEncodeCharsetStringRegExp = "[a-zA-Z0-9\\-_\\.!~\\*'\\(\\)]";
  env.ipv6StringRegExp = "(?:" +
    "(?:(?:(?:[0-9A-Fa-f]{1,4}:){7}(?:[0-9A-Fa-f]{1,4}|:))|(?:(?:[0-9A-Fa-f]{" +
    "1,4}:){6}(?::[0-9A-Fa-f]{1,4}|(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)" +
    "(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3})|:))|(?:(?:[0-9A-Fa-f]" +
    "{1,4}:){5}(?:(?:(?::[0-9A-Fa-f]{1,4}){1,2})|:(?:(?:25[0-5]|2[0-4]\\d|1\\" +
    "d\\d|[1-9]?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3})|:))|(?" +
    ":(?:[0-9A-Fa-f]{1,4}:){4}(?:(?:(?::[0-9A-Fa-f]{1,4}){1,3})|(?:(?::[0-9A-" +
    "Fa-f]{1,4})?:(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(?:\\.(?:25[0-5]|" +
    "2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:))|(?:(?:[0-9A-Fa-f]{1,4}:){3}(?:(?:" +
    "(?::[0-9A-Fa-f]{1,4}){1,4})|(?:(?::[0-9A-Fa-f]{1,4}){0,2}:(?:(?:25[0-5]|" +
    "2[0-4]\\d|1\\d\\d|[1-9]?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d" +
    ")){3}))|:))|(?:(?:[0-9A-Fa-f]{1,4}:){2}(?:(?:(?::[0-9A-Fa-f]{1,4}){1,5})" +
    "|(?:(?::[0-9A-Fa-f]{1,4}){0,3}:(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d" +
    ")(?:\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:))|(?:(?:[0-9A-Fa-" +
    "f]{1,4}:){1}(?:(?:(?::[0-9A-Fa-f]{1,4}){1,6})|(?:(?::[0-9A-Fa-f]{1,4}){0" +
    ",4}:(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(?:\\.(?:25[0-5]|2[0-4]\\d" +
    "|1\\d\\d|[1-9]?\\d)){3}))|:))|(?::(?:(?:(?::[0-9A-Fa-f]{1,4}){1,7})|(?:(" +
    "?::[0-9A-Fa-f]{1,4}){0,5}:(?:(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)(?:" +
    "\\.(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d)){3}))|:)))(?:%.+)?" + ")";
  var decimalByteStringRegExp = "(?:0*(?:25[0-5]|2[0-4]\\d|1\\d\\d|[1-9]?\\d))";
  env.ipv4StringRegExp = "(?:" + decimalByteStringRegExp + "(?:\\." + decimalByteStringRegExp + "){3})";
  var urlProtocolStringRegExp = "(?:[a-z]+:)";
  var urlUserPasswordCharsetStringRegExp = "[a-zA-Z0-9\\-_\\.]";
  var urlDomainStringRegExp = "(?:[a-zA-Z0-9\\-_\\.]*[a-zA-Z])";
  var urlPortStringRegExp = "(?:\\d{1,5})";
  var urlHostNameStringRegExp = "(?:\\[" + env.ipv6StringRegExp + "\\]|" + env.ipv4StringRegExp + "|" + urlDomainStringRegExp + ")";
  // var urlEscapedCharStringRegExp = "(?:%[0-9a-fA-F]{2})";
  // var urlStrictPathNameCharsetStringRegExp = "[a-zA-Z0-9\\-_\\.!~\\*'\\(\\);,/:@&=\\+\\$]";
  // var urlStrictPathNameStringRegExp = "(?:(?:" + urlEscapedCharStringRegExp + "|" + urlStrictPathNameCharsetStringRegExp + ")+)";
  var urlPathNameCharsetStringRegExp = "[a-zA-Z0-9\\-_\\.!~\\*'\\(\\);,/:@&=\\+\\$%]";
  // var urlStrictQueryCharsetStringRegExp = "[a-zA-Z0-9\\-_\\.!~\\*'\\(\\);,/\\?:@&=\\+\\$]";
  // var urlStrictQueryStringRegExp = "(?:(?:" + urlEscapedCharStringRegExp + "|" + urlStrictQueryCharsetStringRegExp + ")+)";
  var urlQueryCharsetStringRegExp = "[a-zA-Z0-9\\-_\\.!~\\*'\\(\\);,/\\?:@&=\\+\\$%]";
  // var urlStrictHashCharsetStringRegExp = "[a-zA-Z0-9\\-_\\.!~\\*'\\(\\);,/\\?:@&=\\+\\$#]";
  // var urlStrictHashStringRegExp = "(?:(?:" + urlEscapedCharStringRegExp + "|" + urlStrictHashCharsetStringRegExp + ")+)";
  var urlHashCharsetStringRegExp = "[a-zA-Z0-9\\-_\\.!~\\*'\\(\\);,/\\?:@&=\\+\\$#%]";

  var urlParserRegExp = new RegExp([
    "^",
    "(?:",
      "(?:",
        "([a-z\\-]+:)?",  // 1 absolute url protocol
        //"(https?:)?",  // 1 absolute url protocol
        "//",
        "(?:",
          "([a-zA-Z0-9\\-_\\.]+)",  // 2 absolute url user
          "(?::([a-zA-Z0-9\\-_\\.]+))?",  // 3 absolute url password
        "@)?",
        "(\\[" + env.ipv6StringRegExp + "\\]|" + env.ipv4StringRegExp + "|([a-zA-Z0-9\\-_\\.]+))",  // 4 absolute url hostname 5 is domain
        //"(" + urlHostNameStringRegExp + ")",  // 4 absolute url hostname
        "(?::(\\d+))?",  // 6 absolute url port
        //"(?::([1-9]\\d{0,3}|[1-5]\\d{4}|6[0-4]\\d{3}|65[0-4]\\d{2}|655[0-2]\\d|6553[0-6]))?",  // 6 absolute url port
      ")?",
      "(/[^?#]*)?",  // 7 absolute url pathname
    "|",
      "([^?#]+)?",  // 8 relative url pathname
    ")",
    "(\\?[^#]*)?",  // 9 absolute url query search
    "(#.*)?",  // 10 absolute url hash
    "$"
  ].join(""));

  var urlSearchRegExp = new RegExp([
    "([a-z\\-]+:)?",  // 1 absolute url protocol
    //"(https?:)?",  // 1 absolute url protocol
    "//",
    "(?:",
      "([a-zA-Z0-9\\-_\\.]+)",  // 2 absolute url user
      "(?::([a-zA-Z0-9\\-_\\.]+))?",  // 3 absolute url password
    "@)?",
    "(\\[" + env.ipv6StringRegExp + "\\]|" + env.ipv4StringRegExp + "|([a-zA-Z0-9\\-_\\.]+))",  // 4 absolute url hostname 5 is domain
    //"(" + urlHostNameStringRegExp + ")",  // 4 absolute url hostname
    "(?::(\\d+))?",  // 6 absolute url port
    "(/[^\\s?#]*)?",  // 7 absolute url pathname
    "(\\?[^\\s#]*)?",  // 8 absolute url query search
    "(#[^\\s]*)?",  // 9 absolute url hash
  ].join(""), "g");

  function parseUrl(url) {
    // {
    //   href: "http://user:pass@sub.host.com:8080/p/a/t/h?query=string#hash"
    //   protocol: "http:"
    //   user: "user"
    //   password: "pass"
    //   hostname: "sub.host.com"
    //   port: 8080
    //   subDomain: "sub"
    //   domain: "host.com"
    //   origin: "http://sub.host.com:8080"
    //   pathname: "/p/a/t/h"
    //   rawQuery: ["query", "string"]
    //   query: {"query": "string"}
    //   search: "?query=string"
    //   hash: "#hash"
    // }
    var parsed = urlParserRegExp.exec(url), result = {"input": url}, tmp;
    if (!parsed) { return null; }
    result.match = parsed[0];
    result.href = encodeURI(decodeURI(parsed[0]));
    if (parsed[1] !== undefined) { result.protocol = parsed[1]; }
    if (parsed[2] !== undefined) { result.user = parsed[2]; }
    if (parsed[3] !== undefined) { result.password = parsed[3]; }
    if (parsed[4] !== undefined) { result.hostname = parsed[4]; }
    if (parsed[5] !== undefined) { result.domain = parsed[5]; }
    if (parsed[6] !== undefined) { result.port = parseInt(parsed[6], 10); }
    if (parsed[7] !== undefined) { result.pathname = parsed[7]; }
    if (parsed[8] !== undefined) { result.pathname = parsed[8]; }
    if (parsed[9] !== undefined) { result.search = parsed[9]; }
    if (parsed[10] !== undefined) { result.hash = parsed[10]; }
    if (result.protocol === "http:") {
      result.origin = "http://" + result.hostname + (result.port === undefined || result.port === 80 ? "" : ":" + result.port);
    } else if (result.protocol === "https:") {
      result.origin = "https://" + result.hostname + (result.port === undefined || result.port === 443 ? "" : ":" + result.port);
    }
    if (result.domain) {
      tmp = result.domain.split(".");
      if (tmp.length > 2) {
        result.subDomain = tmp.slice(0, -2).join(".");
        result.domain = tmp.slice(-2).join(".");
      }
    }
    if (result.search !== undefined) {
      result.query = {};
      result.rawQuery = [];
      result.search.slice(1).split("&").forEach(function (value) {
        var key = value.split("=");
        if (key.length > 1) {
          value = key.slice(1).join("=");
          result.rawQuery.push(decodeURIComponent(key[0]), decodeURIComponent(value));
          result.query[decodeURIComponent(key[0])] = decodeURIComponent(value);
        } else {
          result.rawQuery.push(decodeURIComponent(key[0]), null);
          result.query[decodeURIComponent(key[0])] = null;
        }
        return result;
      });
    }
    return result;
  }

  function makeUrl(param) {
    // param = {
    //   protocol: "http:"
    //   user: "user"
    //   password: "pass"
    //   hostname: "host.com"
    //   port: 8080
    //   subDomain: "sub"  // ignored if domain is unset
    //   domain: "host.com"  // ignored if hostname is set
    //   origin: "http://sub.host.com:8080"  // ignored if domain is set
    //   pathname: "/p/a/t/h"
    //   rawQuery: ["query", "string"]
    //   query: {"query": "string"}  // ignored if rawQuery property is set
    //   search: "?query=string"  // ignored if query property is set
    //   hash: "#hash"
    // } -> "http://user:pass@host.com:8080/p/a/t/h?query=string#hash"
    var result = "", tmp;
    if (param.hostname) {
      if (param.protocol) {
        result += param.protocol;
        if (result[result.length - 1] !== ":") { result += ":"; }
      }
      result += "//";
      if (param.user) {
        result += param.user;
        if (param.password) { result += ":" + param.password; }
        result += "@";
      }
      result += param.hostname;
      if (param.port) { result += ":" + param.port; }
    } else if (param.domain) {
      if (param.subDomain) { result += result.subDomain + "."; }
      result += result.domain;
    } else if (param.origin) {
      result += param.origin;
    }
    if (param.pathname) {
      if (param.pathname[0] !== "/" && result) { result += "/"; }
      result += param.pathname;
    }
    if (param.rawQuery) {
      if (param.rawQuery.length > 0) {
        result += "?" + param.rawQuery.map(function (value, i) {
          if (i % 2) {
            if (value === null || value === undefined) { return ""; }
            return "=" + encodeURIComponent(value);
          }
          return encodeURIComponent(value)
        }).join("&");
      }
    } else if (param.query) {
      tmp = Object.keys(param.query);
      if (tmp.length > 0) {
        result += "?" + tmp.map(function (key) {
          var value = param.query[key];
          if (value === null || value === undefined) { return encodeURIComponent(key); }
          return encodeURIComponent(key) + "=" + encodeURIComponent(param.query[key]);
        }).join("&");
      }
    } else if (param.search) {
      if (param.search[0] !== "?") { result += "?"; }
      result += param.search;
    }
    if (param.hash) {
      if (param.hash[0] !== "#") { result += "#"; }
      result += param.hash;
    }
    return result;
  }

  function normalizeUrlPathname(path) {
    /**
     *     normalizeUrlPathname(path): string
     *
     * Returns a normalized version of `path` taking care of ".." and "." parts.
     *
     * @param  path {String} The URL pathname to normalize
     * @return {String} The normalized URL pathname
     */
    if (path === "." || path === "") { return ""; }
    if (path === "..") { return ".."; }
    var split = path.split("/"), skip = 0, i = split.length - 1, res = "", sep = "";
    if (split[i] === ".") {
      sep = "/";
      i -= 1;
    } else if (split[i] === "..") {
      sep = "/";
    }
    while (i > 0) {
      if (split[i] === "..") {
        skip += 1;
      } else if (split[i] !== ".") {
        if (skip > 0) {
          skip -= 1;
        } else {
          res = split[i] + sep + res;
          sep = "/";
        }
      }
      i -= 1;
    }
    if (split[0] === "") {
      res = "/" + res;
    } else {
      if (split[0] === "..") {
        skip += 1;
      } else if (split[0] !== ".") {
        if (skip > 0) {
          skip -= 1;
        } else {
          res = split[0] + sep + res;
        }
      }
      while (skip > 0) {
        res = ".." + sep + res;
        sep = "/";
        skip -= 1;
      }
    }
    return res;
  }

  function resolveUrlPathname(pathname1, pathname2) {
    if (pathname2[0] === "/") { return normalizeUrlPathname(pathname2); }
    return normalizeUrlPathname(pathname1.replace(/[^\/]+$/, '') + pathname2);
  }

  function resolveUrl(fromUrl, toUrl) {
    // Acts like browser URL resolution. For instance when you click on an A tag,
    // the href attribute value is resolved with the current URL.
    // Ex:
    //   resolveUrl("http://ab.cd/ef/gh/ij/kl?mn=op#qr", "/st");
    //   -> "http://ab.cd/st"
    //   resolveUrl("http://ab.cd/ef/gh/ij/kl?mn=op#qr", "//st.uv/");
    //   -> "http://st.uv/"
    fromUrl = parseUrl(fromUrl);
    toUrl = parseUrl(toUrl);
    toUrl.query = null;
    if (toUrl.protocol) { return toUrl.href; }
    if (toUrl.hostname) { return (fromUrl.protocol || "") + toUrl.href; }
    toUrl.protocol = fromUrl.protocol;
    toUrl.user = fromUrl.user;
    toUrl.password = fromUrl.password;
    toUrl.hostname = fromUrl.hostname;
    toUrl.port = fromUrl.port;
    if (toUrl.pathname) {
      toUrl.pathname = resolveUrlPathname(fromUrl.pathname || "", toUrl.pathname);
      return makeUrl(toUrl);
    }
    toUrl.pathname = fromUrl.pathname;
    if (toUrl.search) { return makeUrl(toUrl); }
    toUrl.search = fromUrl.search;
    if (toUrl.hash) { return makeUrl(toUrl); }
    return fromUrl.href;
  }

  env.decimalByteStringRegExp = decimalByteStringRegExp;
  env.urlProtocolStringRegExp = urlProtocolStringRegExp;
  env.urlUserPasswordCharsetStringRegExp = urlUserPasswordCharsetStringRegExp;
  env.urlDomainStringRegExp = urlDomainStringRegExp;
  env.urlPortStringRegExp = urlPortStringRegExp;
  env.urlHostNameStringRegExp = urlHostNameStringRegExp;
  env.urlPathNameCharsetStringRegExp = urlPathNameCharsetStringRegExp;
  env.urlQueryCharsetStringRegExp = urlQueryCharsetStringRegExp;
  env.urlHashCharsetStringRegExp = urlHashCharsetStringRegExp;
  env.urlParserRegExp = urlParserRegExp;
  env.urlSearchRegExp = urlSearchRegExp;
  env.parseUrl = parseUrl;
  env.makeUrl = makeUrl;
  env.normalizeUrlPathname = normalizeUrlPathname;
  env.resolveUrlPathname = resolveUrlPathname;
  env.resolveUrl = resolveUrl;

}(this.env));
