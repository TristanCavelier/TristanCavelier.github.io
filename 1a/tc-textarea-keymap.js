(function (env) {
  "use strict";

  /*! Copyright (c) 2016 Tristan Cavelier <t.cavelier@free.fr>
      This program is free software. It comes without any warranty, to
      the extent permitted by applicable law. You can redistribute it
      and/or modify it under the terms of the Do What The Fuck You Want
      To Public License, Version 2, as published by Sam Hocevar. See
      http://www.wtfpl.net/ for more details. */

  function parseSedS(string) {
    // parseSedS("/hello/lol/g") -> [/hello/g, "lol"]
    var res = /^\/((?:\\.|[^\\\/])*)\/((?:[^/]|\\\/)*)\/([gimyu]{0,5})$/.exec(string);  // this regexp does not handle flag errors!
    if (res === null) return null;
    try { return [new RegExp(res[1], res[3]), res[2].replace(/\\\//g, "/")]; } catch (ignore) {}  // only this part checks for flag errors.
    return null;
  };
  function parseSearchS(string) {
    // parseSearchS("/hello/g") -> /hello/g
    var res = /^\/((?:\\.|[^\\\/])*)(?:\/([gimyu]{0,5}))?$/.exec(string);  // this regexp does not handle flag errors!
    if (res === null) return null;
    try { return new RegExp(res[1], res[2]); } catch (ignore) {}  // only this part checks for flag errors.
    return null;
  };
  function formatMatchReplacement(match, replacement) {
    return replacement.replace(/\$(\$|([1-9])|`|_|&|\+)/g, function (_, s, d) {
      if (d) return match[d];
      switch (s) {
        case "&": return match[0];
        case "$": return "$";
        case "+": return match[match.length - 1];
        case "_": return match.input;
        case "`": return match.input.slice(0, match.index);
      }
    });
  }
  function replaceText(textarea, regexp, replacement) {
    var match, start = textarea.selectionStart, end = textarea.selectionEnd;
    if (start === end) end = textarea.value.length;
    if (regexp.global) {
      setRangeText(
        textarea,
        textarea.value.slice(start, end).replace(regexp, replacement),
        start,
        end
      )
    } else {
      match = regexp.exec(textarea.value.slice(start, end));
      if (match) {
        setRangeText(
          textarea,
          formatMatchReplacement(match, replacement),
          start + match.index,
          start + match.index + match[0].length
        );
        textarea.setSelectionRange(start + match.index, start + match.index + match[0].length);
      }
    }
  }
  function selectText(textarea, regexp) {
    var match, start = textarea.selectionStart, end = textarea.selectionEnd;
    if (start === end) end = textarea.value.length;
    match = regexp.exec(textarea.value.slice(start, end));
    if (match)
      textarea.setSelectionRange(start + match.index, start + match.index + match[0].length);
  }
  function parseCommand(textarea, command) {
    var tmp;
    if (/^s\//.test(command) && (tmp = parseSedS(command.slice(1)))) {
      textarea["[[TcTextareaKeymapLastAction]]"] = function () { replaceText(this, tmp[0], tmp[1]); };
      replaceText(textarea, tmp[0], tmp[1]);
    } else if (/^s?\//.test(command) && (tmp = parseSearchS(command.replace(/^s/, "")))) {
      textarea["[[TcTextareaKeymapLastAction]]"] = function () { selectText(this, tmp); };
      selectText(textarea, tmp);
    } else alert("invalid command");
  }
  function promptCommand(textarea) {
    var cmd = prompt("Command:");
    if (cmd) parseCommand(textarea, cmd);
  }

  function getColumnPositionFrom(textarea, pos) { return /[^\n]*$/.exec(textarea.value.slice(0, pos))[0].length; }
  function getPreviousGroupPositionFrom(textarea, pos) { return pos - /(\n|(\w+|[ \t]+|[^\w\s]+)?[ \t]?)$/.exec(textarea.value.slice(0, pos))[0].length; }
  function getNextGroupPositionFrom(textarea, pos) { return pos + /^(\n|[ \t]?(\w+|[ \t]+|[^\w\s]+)?)/.exec(textarea.value.slice(pos))[0].length; }
  function getPreviousWordPositionFrom(textarea, pos) { return pos - /\w*[^\w]*$/.exec(textarea.value.slice(0, pos))[0].length; }
  function getNextWordPositionFrom(textarea, pos) { return pos + /^[^\w]*\w*/.exec(textarea.value.slice(pos))[0].length; }
  function getPreviousWordNlPositionFrom(textarea, pos) { return pos - /\w*[^\w\n]*\n?$/.exec(textarea.value.slice(0, pos))[0].length; }
  function getNextWordNlPositionFrom(textarea, pos) { return pos + /^\n?[^\w\n]*\w*/.exec(textarea.value.slice(pos))[0].length; }
  function getLineStartPositionFrom(textarea, pos) { return pos - /[^\n]*$/.exec(textarea.value.slice(0, pos))[0].length; }
  function getLineEndPositionFrom(textarea, pos) { return pos + /^[^\n]*/.exec(textarea.value.slice(pos))[0].length; }
  function getLineUpPositionFrom(textarea, pos) {
    var tmp = /([^\n]*)\n([^\n]*)$/.exec(textarea.value.slice(0, pos)), col;
    if (tmp) {
      col = tmp[2].length;
      if (tmp[1].length >= col) { return pos - tmp[2].length - 1 - (tmp[1].length - col); }
      return pos - tmp[2].length - 1;
    }
    return 0;
  }
  function getLineDownPositionFrom(textarea, pos) {
    var tmp = /[^\n]*$/.exec(textarea.value.slice(0, pos))[0].length,
        col = tmp, start = pos - tmp;
    tmp = /^([^\n]*\n)([^\n]*)/.exec(textarea.value.slice(pos));
    if (tmp) {
      if (tmp[2].length >= col) { return pos + tmp[1].length + col; }
      return pos + tmp[1].length + tmp[2].length;
    }
    return textarea.value.length;
  }
  function getCursorPosition(textarea) { return textarea.selectionDirection[0] === "f" ? textarea.selectionEnd : textarea.selectionStart; }
  function getCursorColumnPosition(textarea) { return getColumnPositionFrom(textarea, getCursorPosition(textarea)); }
  function getCursorPreviousGroupPosition(textarea) { return getPreviousGroupPositionFrom(textarea, getCursorPosition(textarea)); }
  function getCursorNextGroupPosition(textarea) { return getNextGroupPositionFrom(textarea, getCursorPosition(textarea)); }
  function getCursorLineStartPosition(textarea) { return getLineStartPositionFrom(textarea, getCursorPosition(textarea)); }
  function getCursorLineEndPosition(textarea) { return getLineEndPositionFrom(textarea, getCursorPosition(textarea)); }
  function getCursorLineUpPosition(textarea) { return getLineUpPositionFrom(textarea, getCursorPosition(textarea)); }
  function getCursorLineDownPosition(textarea) { return getLineDownPositionFrom(textarea, getCursorPosition(textarea)); }
  function moveCursor(textarea, offset, select) {
    if (textarea.selectionDirection[0] === "f") {
      if (select) {
        if (textarea.selectionEnd + offset > textarea.selectionStart) {
          textarea.setSelectionRange(textarea.selectionStart, textarea.selectionEnd + offset, "forward");
        } else {
          textarea.setSelectionRange(textarea.selectionEnd + offset, textarea.selectionStart, "backward");
        }
      } else {
        textarea.setSelectionRange(textarea.selectionEnd + offset, textarea.selectionEnd + offset);
      }
    } else {
      if (select) {
        if (textarea.selectionStart + offset > textarea.selectionEnd) {
          textarea.setSelectionRange(textarea.selectionEnd, textarea.selectionStart + offset, "forward");
        } else {
          textarea.setSelectionRange(textarea.selectionStart + offset, textarea.selectionEnd, "backward");
        }
      } else {
        textarea.setSelectionRange(textarea.selectionStart + offset, textarea.selectionStart + offset);
      }
    }
  }
  function setCursor(textarea, position, select) {
    if (textarea.selectionDirection[0] === "f") {
      if (select) {
        if (textarea.selectionStart < position) {
          textarea.setSelectionRange(textarea.selectionStart, position, "forward");
        } else {
          textarea.setSelectionRange(position, textarea.selectionStart, "backward");
        }
      } else {
        textarea.setSelectionRange(position, position);
      }
    } else {
      if (select) {
        if (textarea.selectionEnd < position) {
          textarea.setSelectionRange(textarea.selectionEnd, position, "forward");
        } else {
          textarea.setSelectionRange(position, textarea.selectionEnd, "backward");
        }
      } else {
        textarea.setSelectionRange(position, position);
      }
    }
  }
  function setRangeTextNative(textarea, replacement, start, end, selectionMode) {
    return textarea.setRangeText(replacement, start, end, selectionMode);
  }
  function setRangeTextPolyfill(textarea, replacement, start, end, selectionMode) {
    // setRangeText(textarea, replacement[, start, end[, selectionMode]])
    //
    // This function is a polyfill to the textarea.setRangeText experimental method.
    //
    // selectionMode:
    // - "select": Selects the newly inserted text.
    // - "start": Moves the selection to just before the inserted text.
    // - "end": Moves the selection to just after the selected text.
    // - "preserve": Attempts to preserve the selection. This is the default.
    var cstart, cend, dir;
    if (start === undefined) {
      start = textarea.selectionStart;
      end = textarea.selectionEnd;
    }
    switch (selectionMode) {
      case "select":
        cstart = start;
        cend = start + replacement.length;
        break;
      case "start":
        cstart = start;
        cend = start;
        break;
      case "end":
        cstart = start + replacement.length;
        cend = cstart;
        break;
      default:
        if (selectionMode !== undefined && selectionMode !== "preserve") { throw Error("invalid selectionMode " + selectionMode); }
        cend = textarea.selectionEnd;
        if (cend < end) { cend = start + replacement.length; }
        else { cend += replacement.length + start - end; }
        cstart = textarea.selectionStart;
        if (cstart > start) { cstart = cend; }
        dir = textarea.selectionDirection;
    }
    textarea.value = textarea.value.slice(0, start) +
      replacement +
      textarea.value.slice(end);
    textarea.setSelectionRange(cstart, cend, dir);
  }
  function setRangeTextWithExecCommand(textarea, replacement, start, end, selectionMode) {
    // setRangeText(textarea, replacement[, start, end[, selectionMode]])
    //
    // This function uses execCommand("insertText", false, ...)
    //
    // selectionMode:
    // - "select": Selects the newly inserted text.
    // - "start": Moves the selection to just before the inserted text.
    // - "end": Moves the selection to just after the selected text.
    // - "preserve": Attempts to preserve the selection. This is the default.
    var cstart, cend, dir;
    if (start === undefined) {
      start = textarea.selectionStart;
      end = textarea.selectionEnd;
    }
    switch (selectionMode) {
      case "select":
        cstart = start;
        cend = start + replacement.length;
        break;
      case "start":
        cstart = start;
        cend = start;
        break;
      case "end":
        cstart = start + replacement.length;
        cend = cstart;
        break;
      default:
        if (selectionMode !== undefined && selectionMode !== "preserve") { throw Error("invalid selectionMode " + selectionMode); }
        cend = textarea.selectionEnd;
        if (cend < end) { cend = start + replacement.length; }
        else { cend += replacement.length + start - end; }
        cstart = textarea.selectionStart;
        if (cstart > start) { cstart = cend; }
        dir = textarea.selectionDirection;
    }
    textarea.setSelectionRange(start, end);
    document.execCommand("insertText", false, replacement);
    textarea.setSelectionRange(cstart, cend, dir);
  }
  var setRangeText = /Firefox\//.test(navigator.userAgent) ? setRangeTextNative : setRangeTextWithExecCommand;
  function moveSelection(textarea, from, to, offset, selectionMode) {
    // assuming from <= to
    if (offset < 0) {
      //if (from + offset < 0) { offset = -from; }
      setRangeText(
        textarea,
        textarea.value.slice(from, to) +
        textarea.value.slice(from + offset, from),
        from + offset,
        to,
        selectionMode
      );
    } else if (offset > 0) {
      //if (to + offset > textarea.value.length) { offset = textarea.value.length - to; }
      setRangeText(
        textarea,
        textarea.value.slice(to, to + offset) +
        textarea.value.slice(from, to),
        from,
        to + offset,
        selectionMode
      );
    }
  }
  //function moveLinesUp(textarea) {
  //  cs = t.selectionStart;
  //  ce = t.selectionEnd;
  //  d = t.selectionDirection;
  //  ls = getLineStartPositionFrom(t, cs);
  //  pls = getLineStartPositionFrom(t, ls - 1);
  //  plsl = ls - pls;
  //  le = getLineEndPositionFrom(t, ce) + 1;
  //  cols = getColumnPositionFrom(t, cs);
  //  cole = getColumnPositionFrom(t, ce);
  //
  //  t.value = t.value.slice(0, pls) + t.value.slice(ls, le) + t.value.slice(pls, ls) + t.value(le);  // use setRangeText
  //  t.setSelectionRange(cs - plsl, ce - plsl, d);
  //  if (t.focused) { t.focus(); }  // XXX needed in chrome
  //}
  function reverseCase(text) {
    var s = "", l = text.length, i, b;
    for (i = 0; i < l; i += 1) {
      b = text[i].toUpperCase();
      if (b !== text[i]) { s += b; }
      else { s += b.toLowerCase(); }
    }
    return s;
  }
  function reverseCaseFromFirst(text) {
    var s = "", l = text.length, i, b;
    for (i = 0; i < l; i += 1) {
      b = text[i].toUpperCase();
      if (b !== text[i]) {
        s += b;
        for (i += 1; i < l; i += 1) { s += text[i].toUpperCase(); }
        break;
      } else if (b.toLowerCase() !== b) {
        s += b.toLowerCase();
        for (i += 1; i < l; i += 1) { s += text[i].toLowerCase(); }
        break;
      } else {
        s += b;
      }
    }
    return s;
  }
  function autocompleteWordAtCursor(textarea, reverse) {
    // XXX when selecting ??
    var vars = textarea.tcAutocompleteWordVars, cursor = getCursorPosition(textarea), wordsDict = {}, words, index, firstText, lastText, wordPart, lastWordPart, re;
    function add(word) {
      delete wordsDict[word];
      wordsDict[word] = null;
      return word;
    }

    if (vars && vars.lastPosition === cursor && vars.lastWord === textarea.value.slice(cursor - vars.lastWord.length, cursor) && vars.words) {
      // go to next index
      index = vars.index;
      if (reverse) {
        if (index < vars.words.length - 1) { index += 1; } else { index = 0; }
      } else {
        if (index > 0) { index -= 1; } else { index = vars.words.length - 1; }
      }
      setRangeText(textarea, vars.words[index], cursor - vars.lastWord.length, cursor, "end");
      vars.lastPosition = cursor - vars.lastWord.length + vars.words[index].length;
      vars.lastWord = vars.words[index];
      vars.index = index;
    } else {
      // store words and go to first index
      firstText = textarea.value.slice(0, cursor).replace(/\w+$/, function (match) { wordPart = match; return ""; });
      if (!wordPart) { return; }
      lastText = textarea.value.slice(firstText.length).replace(/^\w+/, "");
      re = new RegExp("\\b" + wordPart + "\\w+", "g");
      lastText.replace(re, add);
      firstText.replace(re, add);
      words = Object.keys(wordsDict);
      if (!words.length) { return; }
      index = reverse ? 0 : words.length - 1;
      lastWordPart = words[index].slice(wordPart.length);
      setRangeText(textarea, lastWordPart, cursor, textarea.value.length - lastText.length, "end")
      cursor = cursor + lastWordPart.length;
      textarea.tcAutocompleteWordVars = {
        lastPosition: cursor,
        lastWord: wordPart + lastWordPart,
        words: words,
        index: index
      };
    }
  }

  var shortcuts = {};
  shortcuts["Ctrl-C"] = function (event) {
    var t = event.target, s = t.selectionStart;
    if (s !== t.selectionEnd) { return; }
    t.setSelectionRange(getCursorLineStartPosition(t), getCursorLineEndPosition(t) + 1);
    setTimeout(function () { t.setSelectionRange(s, s); });
  };
  shortcuts["Ctrl-X"] = function (event) {
    var t = event.target, s = t.selectionStart;
    if (s !== t.selectionEnd) { return; }
    t.setSelectionRange(getCursorLineStartPosition(t), getCursorLineEndPosition(t) + 1);
    if (t.readOnly) {
      setTimeout(function () {
        t.setSelectionRange(s, s);
        if (t.focused) { t.blur(); t.focus(); }  // XXX needed in chrome
      });
    }
  };
  //shortcuts["Ctrl-Z"] = function (event) {  // not really accurate... but still
  //  var t = event.target, orig;
  //  if (t.disabled || t.readOnly) { return; }
  //  orig = t.value;
  //  setTimeout(function () {
  //    if (t.selectionStart !== 0 || t.selectionEnd !== t.value.length) { return; }  // do nothing if the cursor is placed
  //    var last = t.value, i, l = orig.length;
  //    if (l > last.length) { l = last.length; }
  //    for (i = 0; i < l; i += 1) {
  //      if (orig[i] !== last[i]) {
  //        t.setSelectionRange(i, i);
  //        if (t.focused) { t.blur(); t.focus(); }  // XXX needed in chrome
  //        return;
  //      }
  //    }
  //  });
  //};
  shortcuts["Ctrl-H"] = shortcuts["Alt-Shift-X"] = function (event) {
    var t = event.target, pos;
    if (t.disabled) { return; }
    event.preventDefault();
    if (t.readOnly) { return; }
    if (t.selectionStart !== t.selectionEnd) {
      pos = t.selectionStart;
      setRangeText(t, "", t.selectionStart, t.selectionEnd, "start");
    } else {
      pos = t.selectionStart - 1;
      if (pos < 0) { return; }
      setRangeText(t, "", pos, pos + 1, "start");
    }
    t.dispatchEvent(new Event("input", {bubbles: true}));  // XXX see possible 'data' property
    if (t.focused) { t.blur(); t.focus(); }  // XXX needed in chrome
  };
  shortcuts["Ctrl-D"] = shortcuts["Alt-X"] = shortcuts["Alt-Backspace"] = function (event) {
    var t = event.target, pos;
    if (t.disabled) { return; }
    event.preventDefault();
    if (t.readOnly) { return; }
    pos = t.selectionStart;
    if (t.selectionStart !== t.selectionEnd) {
      setRangeText(t, "", t.selectionStart, t.selectionEnd, "start");
    } else {
      setRangeText(t, "", pos, pos + 1, "start");
    }
    t.dispatchEvent(new Event("input", {bubbles: true}));  // XXX see possible 'data' property
    if (t.focused) { t.blur(); t.focus(); }  // XXX needed in chrome
  };
  shortcuts["Alt-Shift-E"] = shortcuts["Alt-E"] = function (event) {
    event.preventDefault();
    setCursor(event.target, getCursorNextGroupPosition(event.target), event.shiftKey);
    if (event.target.focused) { event.target.blur(); event.target.focus(); }  // XXX needed in chrome
  };
  shortcuts["Alt-Shift-B"] = shortcuts["Alt-B"] = function (event) {
    event.preventDefault();
    setCursor(event.target, getCursorPreviousGroupPosition(event.target), event.shiftKey);
    if (event.target.focused) { event.target.blur(); event.target.focus(); }  // XXX needed in chrome
  };
  shortcuts["Alt-Shift-A"] = shortcuts["Alt-A"] = function (event) {
    event.preventDefault();
    setCursor(event.target, getCursorLineEndPosition(event.target), event.shiftKey);
    if (event.target.focused) { event.target.blur(); event.target.focus(); }  // XXX needed in chrome
  };
  //// The two functions below are buggy in chrome 51 and does not work with firefox 49
  //shortcuts["Alt-U"] = function (event) {
  //  if (event.target.disabled) { return; }
  //  event.preventDefault();
  //  if (event.target.readOnly) { return; }
  //  document.execCommand("undo");
  //};
  //shortcuts["Alt-Shift-U"] = function (event) {
  //  if (event.target.disabled) { return; }
  //  event.preventDefault();
  //  if (event.target.readOnly) { return; }
  //  document.execCommand("redo");
  //};
  shortcuts["Alt-Shift-I"] = shortcuts["Alt-I"] = function (event) {
    event.preventDefault();
    var t = event.target, start = getCursorLineStartPosition(t), tmp;
    tmp = /^[ \t]*/.exec(t.value.slice(start));
    setCursor(t, start + tmp[0].length, event.shiftKey);
    if (t.focused) { t.blur(); t.focus(); }  // XXX needed in chrome
  };
  shortcuts["Alt-Shift-Digit0"] = shortcuts["Alt-Digit0"] = function (event) {
    event.preventDefault();
    setCursor(event.target, getCursorLineStartPosition(event.target), event.shiftKey);
    if (event.target.focused) { event.target.blur(); event.target.focus(); }  // XXX needed in chrome
  };
  shortcuts["Alt-Shift-J"] = shortcuts["Alt-J"] = function (event) {
    event.preventDefault();
    var t = event.target;
    if (!event.shiftKey && t.selectionStart !== t.selectionEnd) {
      t.setSelectionRange(t.selectionEnd, t.selectionEnd);
    } else {
      setCursor(t, getCursorLineDownPosition(t), event.shiftKey);
    }
    if (t.focused) { t.blur(); t.focus(); }  // XXX needed in chrome
  };
  shortcuts["Alt-Shift-K"] = shortcuts["Alt-K"] = function (event) {
    event.preventDefault();
    var t = event.target;
    if (!event.shiftKey && t.selectionStart !== t.selectionEnd) {
      t.setSelectionRange(t.selectionStart, t.selectionStart);
    } else {
      setCursor(t, getCursorLineUpPosition(t), event.shiftKey);
    }
    if (t.focused) { t.blur(); t.focus(); }  // XXX needed in chrome
  };
  shortcuts["Alt-Shift-H"] = shortcuts["Alt-H"] = function (event) {
    event.preventDefault();
    var t = event.target;
    if (!event.shiftKey && t.selectionStart !== t.selectionEnd) {
      t.setSelectionRange(t.selectionStart, t.selectionStart);
    } else {
      moveCursor(t, -1, event.shiftKey);
    }
    if (t.focused) { t.blur(); t.focus(); }  // XXX needed in chrome
  };
  shortcuts["Alt-Shift-L"] = shortcuts["Alt-L"] = function (event) {
    event.preventDefault();
    var t = event.target;
    if (!event.shiftKey && t.selectionStart !== t.selectionEnd) {
      t.setSelectionRange(t.selectionEnd, t.selectionEnd);
    } else {
      moveCursor(t, 1, event.shiftKey);
    }
    if (t.focused) { t.blur(); t.focus(); }  // XXX needed in chrome
  };
  shortcuts["Alt-Shift-O"] = function (event) {
    var t = event.target, pos;
    if (t.disabled) { return; }
    event.preventDefault();
    if (t.readOnly) { return; }
    pos = getCursorLineStartPosition(t);
    setRangeText(t, "\n", pos, pos, "start");
    t.dispatchEvent(new Event("input", {bubbles: true}));  // XXX see possible 'data' property
    if (t.focused) { t.blur(); t.focus(); }  // XXX needed in chrome
  };
  shortcuts["Alt-O"] = function (event) {
    var t = event.target, pos;
    if (t.disabled) { return; }
    event.preventDefault();
    if (t.readOnly) { return; }
    pos = getCursorLineEndPosition(t);
    setRangeText(t, "\n", pos, pos, "end");
    t.dispatchEvent(new Event("input", {bubbles: true}));  // XXX see possible 'data' property
    if (t.focused) { t.blur(); t.focus(); }  // XXX needed in chrome
  };
  shortcuts["Alt-Y"] = function (event) {
    if (event.target.disabled) { return; }
    event.preventDefault();
    if (event.target.readOnly) { return; }
    var t = event.target, s, e, d;
    if (t.selectionStart !== t.selectionEnd) {
      s = t.selectionStart;
      e = t.selectionEnd;
      d = t.selectionDirection;
      setRangeText(t, t.value.slice(s, e), e, e, "select");
      //t.setSelectionRange(e, e + (e - s), d);
    } else {
      d = t.selectionStart;
      s = getLineStartPositionFrom(t, d);
      e = getLineEndPositionFrom(t, d) + 1;
      setRangeText(t, (t.value[e - 1] !== "\n" ? "\n" : "") + t.value.slice(s, e), e, e, "start");
      d = d + (e - s);
      t.setSelectionRange(d, d);
    }
    t.dispatchEvent(new Event("input", {bubbles: true}));  // XXX see possible 'data' property
    if (t.focused) { t.blur(); t.focus(); }  // XXX needed in chrome
  };
  shortcuts["Alt-M"] = function (event) {
    if (event.target.disabled) { return; }
    event.preventDefault();
    if (event.target.readOnly) { return; }
    var t = event.target, pos;
    pos = t.selectionStart + 1;
    setRangeText(t, "\n", t.selectionStart, t.selectionEnd, "end");
    t.dispatchEvent(new Event("input", {bubbles: true}));  // XXX see possible 'data' property
    if (t.focused) { t.blur(); t.focus(); }  // XXX needed in chrome
  };
  shortcuts["Alt-Enter"] = function (event) {
    var t = event.target, start, tmp;
    if (t.disabled) { return; }
    event.preventDefault();
    if (t.readOnly) { return; }
    start = t.selectionStart;
    tmp = /([ \t]*)[^\n]*$/.exec(t.value.slice(0, start)) || "";
    if (tmp) { tmp = tmp[1]; }
    setRangeText(t, "\n" + tmp, start, t.selectionEnd, "end");
    t.dispatchEvent(new Event("input", {bubbles: true}));  // XXX see possible 'data' property
    if (t.focused) { t.blur(); t.focus(); }  // XXX needed in chrome
  };
  shortcuts["Alt-D"] = function (event) {
    var t = event.target, pos, start;
    if (t.disabled) { return; }
    event.preventDefault();
    if (t.readOnly) { return; }
    if (t.selectionStart !== t.selectionEnd) {
      setRangeText(t, "", t.selectionStart, t.selectionEnd, "start");
    } else {
      setRangeText(t, "", t.selectionStart, getNextWordNlPositionFrom(t, t.selectionStart), "start");
    }
    t.dispatchEvent(new Event("input", {bubbles: true}));  // XXX see possible 'data' property
    if (t.focused) { t.blur(); t.focus(); }  // XXX needed in chrome
  };
  shortcuts["Alt-S"] = function (event) {
    var t = event.target, pos;
    if (t.disabled) { return; }
    event.preventDefault();
    if (t.readOnly) { return; }
    if (t.selectionStart !== t.selectionEnd) {
      setRangeText(t, "", t.selectionStart, t.selectionEnd, "start");
    } else {
      setRangeText(t, "", getPreviousWordNlPositionFrom(t, t.selectionStart), t.selectionStart, "start");
    }
    t.dispatchEvent(new Event("input", {bubbles: true}));  // XXX see possible 'data' property
    if (t.focused) { t.blur(); t.focus(); }  // XXX needed in chrome
  };
  shortcuts["Alt-Shift-D"] = function (event) {
    var t = event.target;
    if (t.disabled) { return; }
    event.preventDefault();
    if (t.readOnly) { return; }
    setRangeText(t, "", getLineStartPositionFrom(t, t.selectionStart), getLineEndPositionFrom(t, t.selectionEnd) + 1, "start");
    t.dispatchEvent(new Event("input", {bubbles: true}));  // XXX see possible 'data' property
    if (t.focused) { t.blur(); t.focus(); }  // XXX needed in chrome
  };
  shortcuts["Alt-Shift-G"] = shortcuts["Alt-G"] = function (event) {
    event.preventDefault();
    var t = event.target, line = parseInt(prompt("Go to line:"), 10), lines, i, l, chars = 0;
    if (line > 0) {
      lines = t.value.split("\n");
      l = lines.length;
      for (i = 0; i < l; i += 1) {
        if (i !== line - 1) {
          chars += lines[i].length + 1;
        } else {
          setCursor(t, chars, event.shiftKey);
          //t.setSelectionRange(chars, chars);
          if (t.focused) { t.blur(); t.focus(); }  // XXX needed in chrome
          return;
        }
      }
    }
    setCursor(t, t.value.length, event.shiftKey);
    //t.setSelectionRange(t.value.length, t.value.length);
    if (t.focused) { t.blur(); t.focus(); }  // XXX needed in chrome
  };
  shortcuts["Alt-Shift-W"] = function (event) {
    // swap the cursor in the selection
    event.preventDefault();
    var t = event.target;
    t.setSelectionRange(t.selectionStart, t.selectionEnd, t.selectionDirection[0] === "f" ? "backward" : "forward");
    if (t.focused) { t.blur(); t.focus(); }  // XXX needed in chrome
  };
  shortcuts["Alt-C"] = function (event) {
    var t = event.target, s, e;
    if (t.disabled) { return; }
    event.preventDefault();
    if (t.readOnly) { return; }
    e = t.selectionEnd;
    s = t.selectionStart;
    if (s === e) {
      if (e >= t.value.length) { return; }
      setRangeText(t, reverseCase(t.value.slice(e, e + 1)), e, e + 1, "end");
    } else {
      setRangeText(t, reverseCase(t.value.slice(s, e)), s, e, "select");
    }
    t.dispatchEvent(new Event("input", {bubbles: true}));  // XXX see possible 'data' property
    if (t.focused) { t.blur(); t.focus(); }  // XXX needed in chrome
  };
  shortcuts["Alt-Shift-C"] = function (event) {
    var t = event.target, s, e;
    if (t.disabled) { return; }
    event.preventDefault();
    if (t.readOnly) { return; }
    e = t.selectionEnd;
    s = t.selectionStart;
    if (s === e) {
      if (e >= t.value.length) { return; }
      setRangeText(t, reverseCaseFromFirst(t.value.slice(e, e + 1)), e, e + 1, "end");
      // XXX capitalize word ?
    } else {
      setRangeText(t, reverseCaseFromFirst(t.value.slice(s, e)), s, e, "select");
    }
    t.dispatchEvent(new Event("input", {bubbles: true}));  // XXX see possible 'data' property
    if (t.focused) { t.blur(); t.focus(); }  // XXX needed in chrome
  };
  shortcuts["Alt-T"] = function (event) {
    var t = event.target, s, e, d;
    if (t.disabled) { return; }
    event.preventDefault();
    if (t.readOnly) { return; }
    e = t.selectionEnd;
    if (e >= t.value.length) { return; }
    s = t.selectionStart;
    d = t.selectionDirection;
    moveSelection(t, s === e ? s - 1 : s, e, 1);
    t.setSelectionRange(s + 1, e + 1, d);
    t.dispatchEvent(new Event("input", {bubbles: true}));  // XXX see possible 'data' property
    if (t.focused) { t.blur(); t.focus(); }  // XXX needed in chrome
  };
  shortcuts["Alt-Shift-T"] = function (event) {
    var t = event.target, s, e, d;
    if (t.disabled) { return; }
    event.preventDefault();
    if (t.readOnly) { return; }
    s = t.selectionStart;
    if (s < 1) { return; }
    e = t.selectionEnd;
    if (e <= 1) { return; }
    d = t.selectionDirection;
    moveSelection(t, s === e ? s - 1 : s, e, -1);
    t.setSelectionRange(s - 1, e - 1, d);
    t.dispatchEvent(new Event("input", {bubbles: true}));  // XXX see possible 'data' property
    if (t.focused) { t.blur(); t.focus(); }  // XXX needed in chrome
  };
  shortcuts["Alt-Shift- "] = shortcuts["Alt- "] = function (event) {
    var t = event.target;
    if (t.disabled) { return; }
    event.preventDefault();
    if (t.readOnly) { return; }
    autocompleteWordAtCursor(t, event.shiftKey);
    t.dispatchEvent(new Event("input", {bubbles: true}));  // XXX see possible 'data' property
    if (t.focused) { t.blur(); t.focus(); }  // XXX needed in chrome
  };
  shortcuts["Alt-Shift-<"] = shortcuts["Alt-,"] = function (event) {  // XXX works with qwerty only
    event.preventDefault();
    setCursor(event.target, 0, event.shiftKey);
    event.target.dispatchEvent(new Event("input", {bubbles: true}));  // XXX see possible 'data' property
    if (event.target.focused) { event.target.blur(); event.target.focus(); }  // XXX needed in chrome
  };
  shortcuts["Alt-Shift->"] = shortcuts["Alt-."] = function (event) {  // XXX works with qwerty only
    event.preventDefault();
    setCursor(event.target, event.target.value.length, event.shiftKey);
    event.target.dispatchEvent(new Event("input", {bubbles: true}));  // XXX see possible 'data' property
    if (event.target.focused) { event.target.blur(); event.target.focus(); }  // XXX needed in chrome
  };
  shortcuts["Ctrl-ArrowUp"] = function (event) {
    var t = event.target, d, cs, ce, ls, le, cls;
    if (t.disabled) { return; }
    event.preventDefault();
    if (t.readOnly) { return; }
    cs = t.selectionStart;
    ls = getLineStartPositionFrom(t, cs);
    cls = getLineStartPositionFrom(t, ls - 1);
    if (ls === 0) { return; }
    ce = t.selectionEnd;
    le = getLineEndPositionFrom(t, ce);
    d = t.selectionDirection;
    setRangeText(t, t.value.slice(ls, le) + t.value.slice(ls - 1, ls) + t.value.slice(cls, ls - 1), cls, le, "start");
    //t.value = t.value.slice(0, cls) + t.value.slice(ls, le) + t.value.slice(ls - 1, ls) + t.value.slice(cls, ls - 1) + t.value.slice(le);
    cls = ls - cls;
    t.setSelectionRange(cs - cls, ce - cls, d);
    t.dispatchEvent(new Event("input", {bubbles: true}));  // XXX see possible 'data' property
    if (t.focused) { t.blur(); t.focus(); }  // XXX needed in chrome
  };
  shortcuts["Ctrl-ArrowDown"] = function (event) {
    var t = event.target, d, cs, ce, ls, le, cle;
    if (t.disabled) { return; }
    event.preventDefault();
    if (t.readOnly) { return; }
    ce = t.selectionEnd;
    le = getLineEndPositionFrom(t, ce);
    cle = getLineEndPositionFrom(t, le + 1);
    if (le === t.value.length) { return; }
    cs = t.selectionStart;
    ls = getLineStartPositionFrom(t, cs);
    d = t.selectionDirection;
    setRangeText(t, t.value.slice(le + 1, cle) + t.value.slice(le, le + 1) + t.value.slice(ls, le), ls, cle, "start");
    //t.value = t.value.slice(0, ls) + t.value.slice(le + 1, cle) + t.value.slice(le, le + 1) + t.value.slice(ls, le) + t.value.slice(cle);
    cle = cle - le;
    t.setSelectionRange(cs + cle, ce + cle, d);
    t.dispatchEvent(new Event("input", {bubbles: true}));  // XXX see possible 'data' property
    if (t.focused) { t.blur(); t.focus(); }  // XXX needed in chrome
  };
  shortcuts["Alt-#"] = function (event) {
    var t = event.target, begin, start, end;
    if (t.disabled) { return; }
    event.preventDefault();
    if (t.readOnly) { return; }
    if (t.selectionStart !== t.selectionEnd) {  // remove trailing spaces
      start = t.selectionStart;
      end = t.selectionEnd;
      begin = 0;
      setRangeText(t, t.value.slice(start, end).replace(t.value[end + 1] !== "\n" ? /([ \t]+)(\n)/g : /([ \t]+)(\n|$)/g, function (match, spaces, nl) {
        begin += spaces.length;
        return nl;
      }), start, end, "preserve");
    } else {  // remove spaces at cursor
      begin = t.value.slice(0, t.selectionStart).replace(/[ \t]+$/, "");
      start = begin.length;
      setRangeText(t, "", start, t.value.length - t.value.slice(t.selectionEnd).replace(/^[ \t]+/, "").length, "start")
      //t.value = begin + t.value.slice(t.selectionEnd).replace(/^[ \t]+/, "");
      //t.setSelectionRange(start, start);
    }
    t.dispatchEvent(new Event("input", {bubbles: true}));  // XXX see possible 'data' property
    if (t.focused) { t.blur(); t.focus(); }  // XXX needed in chrome
  };
  shortcuts["Alt-Shift-}"] = function (event) {
    // indent lines
    var t = event.target, start, end, linestart, dir, replacement, offset = 0;
    if (t.disabled) { return; }
    event.preventDefault();
    if (t.readOnly) { return; }
    if (t.selectionStart !== t.selectionEnd) { offset = 1; }
    start = t.selectionStart;
    linestart = getLineStartPositionFrom(t, start);
    end = t.selectionEnd;
    dir = t.selectionDirection;
    replacement = t.value.slice(linestart, end - offset).replace(/^/mg, "  ");
    setRangeText(t, replacement, linestart, end - offset, "start");
    t.setSelectionRange(start + 2, linestart + replacement.length + offset, dir);
    t.dispatchEvent(new Event("input", {bubbles: true}));  // XXX see possible 'data' property
    if (t.focused) { t.blur(); t.focus(); }  // XXX needed in chrome
  };
  shortcuts["Alt-Shift-{"] = function (event) {
    // unindent lines
    // bug in "abc\n [ def\n ] ghi" -> "abc\n[def]\nghi" instead of "abc\n[def\n]ghi"
    var t = event.target, start, end, linestart, lineend, dir, replaced, replacement, startoffset, offset = 0;
    if (t.disabled) { return; }
    event.preventDefault();
    if (t.readOnly) { return; }
    if (t.selectionStart !== t.selectionEnd) { offset = 1; }
    start = t.selectionStart;
    linestart = getLineStartPositionFrom(t, start);
    end = t.selectionEnd;
    dir = t.selectionDirection;
    lineend = getLineEndPositionFrom(t, t.selectionEnd - offset);
    replaced = t.value.slice(linestart, lineend);
    replacement = replaced.replace(/^(?:  ?|\t)/mg, "");
    startoffset = replaced.split(/\n/)[0].length - replacement.split(/\n/)[0].length;
    setRangeText(t, replacement, linestart, lineend, "start");
    t.setSelectionRange(Math.max(start - startoffset, linestart), Math.max(end + replacement.length - replaced.length, linestart), dir);
    t.dispatchEvent(new Event("input", {bubbles: true}));  // XXX see possible 'data' property
    if (t.focused) { t.blur(); t.focus(); }  // XXX needed in chrome
  };
  shortcuts["Alt-;"] = function (event) {
    event.preventDefault();
    promptCommand(event.target);
    if (event.target.focused) { event.target.blur(); event.target.focus(); }  // XXX needed in chrome
  };
  shortcuts["Alt-R"] = function (event) {
    event.preventDefault();
    if (event.target["[[TcTextareaKeymapLastAction]]"]) event.target["[[TcTextareaKeymapLastAction]]"]();
    if (event.target.focused) { event.target.blur(); event.target.focus(); }  // XXX needed in chrome
  };

  //textarea.oninput = (e) => console.log(e.target.value);
  //textarea.onchange = (e) => console.log(e.target.value);
  function handleKeyboardEvent(event) {
    //var s = event.key || (event.charCode ? String.fromCharCode(event.charCode) : keyCodeStr[event.keyCode]);
    //console.log("keydown", s, event.key, event.code, event.charCode, event.keyCode, event.which);
    var s = event.key, p = "";
    if (/^[a-z]$/.test(s)) { s = s.toUpperCase(); }
    //if (event.metaKey || event.keyCode === 91) { s = "Meta-" + s; }
    if (event.metaKey) { p = "Meta-" + p; }
    if (event.shiftKey) { p = "Shift-" + p; }
    if (event.ctrlKey) { p = "Ctrl-" + p; }
    if (event.keyCode === 225) { p = "AltGraph-" + p; }  // XXX
    if (event.altKey) { p = "Alt-" + p; }
    s = p + s;
    if (shortcuts[s]) { return shortcuts[s](event); }
    s = p + event.code;
    if (shortcuts[s]) { return shortcuts[s](event); }
  }

  function handleFocusEvent(event) { event.target.focused = true; }
  function handleBlurEvent(event) { event.target.focused = false; }

  function assignTcKeyboardShortcutsToTextarea(textarea) {
    textarea.addEventListener("keydown", handleKeyboardEvent, true);
    textarea.addEventListener("focus", handleFocusEvent, false);  // XXX needed on chrome
    textarea.addEventListener("blur", handleBlurEvent, false);  // XXX needed on chrome
  }
  env.assignTcKeyboardShortcutsToTextarea = assignTcKeyboardShortcutsToTextarea;
  function unassignTcKeyboardShortcutsToTextarea(textarea) {
    textarea.removeEventListener("keydown", handleKeyboardEvent);
    textarea.removeEventListener("focus", handleFocusEvent);  // XXX needed on chrome
    textarea.removeEventListener("blur", handleBlurEvent);  // XXX needed on chrome
  }
  env.unassignTcKeyboardShortcutsToTextarea = unassignTcKeyboardShortcutsToTextarea;

}(this));
