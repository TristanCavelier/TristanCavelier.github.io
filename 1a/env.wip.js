/*jslint indent: 2 */
(function envHtml(env) {
  "use strict";

  /*! Copyright (c) 2017 Tristan Cavelier <t.cavelier@free.fr>
      This program is free software. It comes without any warranty, to
      the extent permitted by applicable law. You can redistribute it
      and/or modify it under the terms of the Do What The Fuck You Want
      To Public License, Version 2, as published by Sam Hocevar. See
      http://www.wtfpl.net/ for more details. */

  function removeAccent(text) {
    // /[äáâàãāăǎȧạ   å  ]/g, "a"
    // /[        ḃḅ      ]/g, "b"
    // /[  ĉ    čċ  ç    ]/g, "c"
    // /[       ďḋḍ ḑ    ]/g, "d"
    // /[ëéêèẽēĕěėẹ ȩę   ]/g, "e"
    // /[        ḟ       ]/g, "f"
    // /[ ǵĝ  ḡğǧġ  ģ    ]/g, "g"
    // /[ḧ ĥ    ȟḣḥ ḩ    ]/g, "h"
    // /[ïíîìĩīĭǐıị  į   ]/g, "i"
    // /[  ĵ    ǰȷ       ]/g, "j"
    // /[ ḱ     ǩ ḳ ķ    ]/g, "k"
    // /[ ĺ     ľŀḷ ļ    ]/g, "l"
    // /[ ḿ      ṁṃ      ]/g, "m"
    // /[ ń ǹñ  ňṅṇ ņ    ]/g, "n"
    // /[öóôòõōŏǒȯọő ǫ ø ]/g, "o"
    // /[ ṕ      ṗ       ]/g, "p"
    // /[                ]/g, "q"
    // /[ ŕ     řṙṛ ŗ    ]/g, "r"
    // /[ śŝ    šṡṣ ş    ]/g, "s"
    // /[ẗ      ťṫṭ ţ    ]/g, "t"
    // /[üúûùũūŭǔ ụű ųůǖǚ]/g, "u"
    // /[    ṽ    ṿ      ]/g, "v"
    // /[ẅẃŵẁ    ẇẉ   ẘ  ]/g, "w"
    // /[ẍ       ẋ       ]/g, "x"
    // /[ÿýŷỳỹȳ  ẏỵ   ẙ  ]/g, "y"
    // /[ źẑ    žżẓ      ]/g, "z"

    // /æ/g, "ae"
    // /œ/g, "oe"
    // /ß/g, "ss"

    // ŧþðđŋħł ?
    return text
      .replace(/[äáâàãāăǎȧạå]/g, "a")
      .replace(/[ḃḅ]/g, "b")
      .replace(/[ĉčċç]/g, "c")
      .replace(/[ďḋḍḑ]/g, "d")
      .replace(/[ëéêèẽēĕěėẹȩę]/g, "e")
      .replace(/[ḟ]/g, "f")
      .replace(/[ǵĝḡğǧġģ]/g, "g")
      .replace(/[ḧĥȟḣḥḩ]/g, "h")
      .replace(/[ïíîìĩīĭǐıịį]/g, "i")
      .replace(/[ĵǰȷ]/g, "j")
      .replace(/[ḱǩḳķ]/g, "k")
      .replace(/[ĺľŀḷļ]/g, "l")
      .replace(/[ḿṁṃ]/g, "m")
      .replace(/[ńǹñňṅṇņ]/g, "n")
      .replace(/[öóôòõōŏǒȯọőǫø]/g, "o")
      .replace(/[ṕṗ]/g, "p")
      .replace(/[ŕřṙṛŗ]/g, "r")
      .replace(/[śŝšṡṣş]/g, "s")
      .replace(/[ẗťṫṭţ]/g, "t")
      .replace(/[üúûùũūŭǔụűųůǖǚ]/g, "u")
      .replace(/[ṽṿ]/g, "v")
      .replace(/[ẅẃŵẁẇẉẘ]/g, "w")
      .replace(/[ẍẋ]/g, "x")
      .replace(/[ÿýŷỳỹȳẏỵẙ]/g, "y")
      .replace(/[źẑžżẓ]/g, "z")
      .replace(/æ/g, "ae")
      .replace(/œ/g, "oe")
      .replace(/ß/g, "ss");
  }

  // https://en.wikipedia.org/wiki/List_of_XML_and_HTML_character_entity_references
  // https://golang.org/src/html/entity.go
  var entity_dict = {
    "AElig;":                           "\u{000000C6}",
    "AMP;":                             "\u{00000026}",
    "Aacute;":                          "\u{000000C1}",
    "Abreve;":                          "\u{00000102}",
    "Acirc;":                           "\u{000000C2}",
    "Acy;":                             "\u{00000410}",
    "Afr;":                             "\u{0001D504}",
    "Agrave;":                          "\u{000000C0}",
    "Alpha;":                           "\u{00000391}",
    "Amacr;":                           "\u{00000100}",
    "And;":                             "\u{00002A53}",
    "Aogon;":                           "\u{00000104}",
    "Aopf;":                            "\u{0001D538}",
    "ApplyFunction;":                   "\u{00002061}",
    "Aring;":                           "\u{000000C5}",
    "Ascr;":                            "\u{0001D49C}",
    "Assign;":                          "\u{00002254}",
    "Atilde;":                          "\u{000000C3}",
    "Auml;":                            "\u{000000C4}",
    "Backslash;":                       "\u{00002216}",
    "Barv;":                            "\u{00002AE7}",
    "Barwed;":                          "\u{00002306}",
    "Bcy;":                             "\u{00000411}",
    "Because;":                         "\u{00002235}",
    "Bernoullis;":                      "\u{0000212C}",
    "Beta;":                            "\u{00000392}",
    "Bfr;":                             "\u{0001D505}",
    "Bopf;":                            "\u{0001D539}",
    "Breve;":                           "\u{000002D8}",
    "Bscr;":                            "\u{0000212C}",
    "Bumpeq;":                          "\u{0000224E}",
    "CHcy;":                            "\u{00000427}",
    "COPY;":                            "\u{000000A9}",
    "Cacute;":                          "\u{00000106}",
    "Cap;":                             "\u{000022D2}",
    "CapitalDifferentialD;":            "\u{00002145}",
    "Cayleys;":                         "\u{0000212D}",
    "Ccaron;":                          "\u{0000010C}",
    "Ccedil;":                          "\u{000000C7}",
    "Ccirc;":                           "\u{00000108}",
    "Cconint;":                         "\u{00002230}",
    "Cdot;":                            "\u{0000010A}",
    "Cedilla;":                         "\u{000000B8}",
    "CenterDot;":                       "\u{000000B7}",
    "Cfr;":                             "\u{0000212D}",
    "Chi;":                             "\u{000003A7}",
    "CircleDot;":                       "\u{00002299}",
    "CircleMinus;":                     "\u{00002296}",
    "CirclePlus;":                      "\u{00002295}",
    "CircleTimes;":                     "\u{00002297}",
    "ClockwiseContourIntegral;":        "\u{00002232}",
    "CloseCurlyDoubleQuote;":           "\u{0000201D}",
    "CloseCurlyQuote;":                 "\u{00002019}",
    "Colon;":                           "\u{00002237}",
    "Colone;":                          "\u{00002A74}",
    "Congruent;":                       "\u{00002261}",
    "Conint;":                          "\u{0000222F}",
    "ContourIntegral;":                 "\u{0000222E}",
    "Copf;":                            "\u{00002102}",
    "Coproduct;":                       "\u{00002210}",
    "CounterClockwiseContourIntegral;": "\u{00002233}",
    "Cross;":                           "\u{00002A2F}",
    "Cscr;":                            "\u{0001D49E}",
    "Cup;":                             "\u{000022D3}",
    "CupCap;":                          "\u{0000224D}",
    "DD;":                              "\u{00002145}",
    "DDotrahd;":                        "\u{00002911}",
    "DJcy;":                            "\u{00000402}",
    "DScy;":                            "\u{00000405}",
    "DZcy;":                            "\u{0000040F}",
    "Dagger;":                          "\u{00002021}",
    "Darr;":                            "\u{000021A1}",
    "Dashv;":                           "\u{00002AE4}",
    "Dcaron;":                          "\u{0000010E}",
    "Dcy;":                             "\u{00000414}",
    "Del;":                             "\u{00002207}",
    "Delta;":                           "\u{00000394}",
    "Dfr;":                             "\u{0001D507}",
    "DiacriticalAcute;":                "\u{000000B4}",
    "DiacriticalDot;":                  "\u{000002D9}",
    "DiacriticalDoubleAcute;":          "\u{000002DD}",
    "DiacriticalGrave;":                "\u{00000060}",
    "DiacriticalTilde;":                "\u{000002DC}",
    "Diamond;":                         "\u{000022C4}",
    "DifferentialD;":                   "\u{00002146}",
    "Dopf;":                            "\u{0001D53B}",
    "Dot;":                             "\u{000000A8}",
    "DotDot;":                          "\u{000020DC}",
    "DotEqual;":                        "\u{00002250}",
    "DoubleContourIntegral;":           "\u{0000222F}",
    "DoubleDot;":                       "\u{000000A8}",
    "DoubleDownArrow;":                 "\u{000021D3}",
    "DoubleLeftArrow;":                 "\u{000021D0}",
    "DoubleLeftRightArrow;":            "\u{000021D4}",
    "DoubleLeftTee;":                   "\u{00002AE4}",
    "DoubleLongLeftArrow;":             "\u{000027F8}",
    "DoubleLongLeftRightArrow;":        "\u{000027FA}",
    "DoubleLongRightArrow;":            "\u{000027F9}",
    "DoubleRightArrow;":                "\u{000021D2}",
    "DoubleRightTee;":                  "\u{000022A8}",
    "DoubleUpArrow;":                   "\u{000021D1}",
    "DoubleUpDownArrow;":               "\u{000021D5}",
    "DoubleVerticalBar;":               "\u{00002225}",
    "DownArrow;":                       "\u{00002193}",
    "DownArrowBar;":                    "\u{00002913}",
    "DownArrowUpArrow;":                "\u{000021F5}",
    "DownBreve;":                       "\u{00000311}",
    "DownLeftRightVector;":             "\u{00002950}",
    "DownLeftTeeVector;":               "\u{0000295E}",
    "DownLeftVector;":                  "\u{000021BD}",
    "DownLeftVectorBar;":               "\u{00002956}",
    "DownRightTeeVector;":              "\u{0000295F}",
    "DownRightVector;":                 "\u{000021C1}",
    "DownRightVectorBar;":              "\u{00002957}",
    "DownTee;":                         "\u{000022A4}",
    "DownTeeArrow;":                    "\u{000021A7}",
    "Downarrow;":                       "\u{000021D3}",
    "Dscr;":                            "\u{0001D49F}",
    "Dstrok;":                          "\u{00000110}",
    "ENG;":                             "\u{0000014A}",
    "ETH;":                             "\u{000000D0}",
    "Eacute;":                          "\u{000000C9}",
    "Ecaron;":                          "\u{0000011A}",
    "Ecirc;":                           "\u{000000CA}",
    "Ecy;":                             "\u{0000042D}",
    "Edot;":                            "\u{00000116}",
    "Efr;":                             "\u{0001D508}",
    "Egrave;":                          "\u{000000C8}",
    "Element;":                         "\u{00002208}",
    "Emacr;":                           "\u{00000112}",
    "EmptySmallSquare;":                "\u{000025FB}",
    "EmptyVerySmallSquare;":            "\u{000025AB}",
    "Eogon;":                           "\u{00000118}",
    "Eopf;":                            "\u{0001D53C}",
    "Epsilon;":                         "\u{00000395}",
    "Equal;":                           "\u{00002A75}",
    "EqualTilde;":                      "\u{00002242}",
    "Equilibrium;":                     "\u{000021CC}",
    "Escr;":                            "\u{00002130}",
    "Esim;":                            "\u{00002A73}",
    "Eta;":                             "\u{00000397}",
    "Euml;":                            "\u{000000CB}",
    "Exists;":                          "\u{00002203}",
    "ExponentialE;":                    "\u{00002147}",
    "Fcy;":                             "\u{00000424}",
    "Ffr;":                             "\u{0001D509}",
    "FilledSmallSquare;":               "\u{000025FC}",
    "FilledVerySmallSquare;":           "\u{000025AA}",
    "Fopf;":                            "\u{0001D53D}",
    "ForAll;":                          "\u{00002200}",
    "Fouriertrf;":                      "\u{00002131}",
    "Fscr;":                            "\u{00002131}",
    "GJcy;":                            "\u{00000403}",
    "GT;":                              "\u{0000003E}",
    "Gamma;":                           "\u{00000393}",
    "Gammad;":                          "\u{000003DC}",
    "Gbreve;":                          "\u{0000011E}",
    "Gcedil;":                          "\u{00000122}",
    "Gcirc;":                           "\u{0000011C}",
    "Gcy;":                             "\u{00000413}",
    "Gdot;":                            "\u{00000120}",
    "Gfr;":                             "\u{0001D50A}",
    "Gg;":                              "\u{000022D9}",
    "Gopf;":                            "\u{0001D53E}",
    "GreaterEqual;":                    "\u{00002265}",
    "GreaterEqualLess;":                "\u{000022DB}",
    "GreaterFullEqual;":                "\u{00002267}",
    "GreaterGreater;":                  "\u{00002AA2}",
    "GreaterLess;":                     "\u{00002277}",
    "GreaterSlantEqual;":               "\u{00002A7E}",
    "GreaterTilde;":                    "\u{00002273}",
    "Gscr;":                            "\u{0001D4A2}",
    "Gt;":                              "\u{0000226B}",
    "HARDcy;":                          "\u{0000042A}",
    "Hacek;":                           "\u{000002C7}",
    "Hat;":                             "\u{0000005E}",
    "Hcirc;":                           "\u{00000124}",
    "Hfr;":                             "\u{0000210C}",
    "HilbertSpace;":                    "\u{0000210B}",
    "Hopf;":                            "\u{0000210D}",
    "HorizontalLine;":                  "\u{00002500}",
    "Hscr;":                            "\u{0000210B}",
    "Hstrok;":                          "\u{00000126}",
    "HumpDownHump;":                    "\u{0000224E}",
    "HumpEqual;":                       "\u{0000224F}",
    "IEcy;":                            "\u{00000415}",
    "IJlig;":                           "\u{00000132}",
    "IOcy;":                            "\u{00000401}",
    "Iacute;":                          "\u{000000CD}",
    "Icirc;":                           "\u{000000CE}",
    "Icy;":                             "\u{00000418}",
    "Idot;":                            "\u{00000130}",
    "Ifr;":                             "\u{00002111}",
    "Igrave;":                          "\u{000000CC}",
    "Im;":                              "\u{00002111}",
    "Imacr;":                           "\u{0000012A}",
    "ImaginaryI;":                      "\u{00002148}",
    "Implies;":                         "\u{000021D2}",
    "Int;":                             "\u{0000222C}",
    "Integral;":                        "\u{0000222B}",
    "Intersection;":                    "\u{000022C2}",
    "InvisibleComma;":                  "\u{00002063}",
    "InvisibleTimes;":                  "\u{00002062}",
    "Iogon;":                           "\u{0000012E}",
    "Iopf;":                            "\u{0001D540}",
    "Iota;":                            "\u{00000399}",
    "Iscr;":                            "\u{00002110}",
    "Itilde;":                          "\u{00000128}",
    "Iukcy;":                           "\u{00000406}",
    "Iuml;":                            "\u{000000CF}",
    "Jcirc;":                           "\u{00000134}",
    "Jcy;":                             "\u{00000419}",
    "Jfr;":                             "\u{0001D50D}",
    "Jopf;":                            "\u{0001D541}",
    "Jscr;":                            "\u{0001D4A5}",
    "Jsercy;":                          "\u{00000408}",
    "Jukcy;":                           "\u{00000404}",
    "KHcy;":                            "\u{00000425}",
    "KJcy;":                            "\u{0000040C}",
    "Kappa;":                           "\u{0000039A}",
    "Kcedil;":                          "\u{00000136}",
    "Kcy;":                             "\u{0000041A}",
    "Kfr;":                             "\u{0001D50E}",
    "Kopf;":                            "\u{0001D542}",
    "Kscr;":                            "\u{0001D4A6}",
    "LJcy;":                            "\u{00000409}",
    "LT;":                              "\u{0000003C}",
    "Lacute;":                          "\u{00000139}",
    "Lambda;":                          "\u{0000039B}",
    "Lang;":                            "\u{000027EA}",
    "Laplacetrf;":                      "\u{00002112}",
    "Larr;":                            "\u{0000219E}",
    "Lcaron;":                          "\u{0000013D}",
    "Lcedil;":                          "\u{0000013B}",
    "Lcy;":                             "\u{0000041B}",
    "LeftAngleBracket;":                "\u{000027E8}",
    "LeftArrow;":                       "\u{00002190}",
    "LeftArrowBar;":                    "\u{000021E4}",
    "LeftArrowRightArrow;":             "\u{000021C6}",
    "LeftCeiling;":                     "\u{00002308}",
    "LeftDoubleBracket;":               "\u{000027E6}",
    "LeftDownTeeVector;":               "\u{00002961}",
    "LeftDownVector;":                  "\u{000021C3}",
    "LeftDownVectorBar;":               "\u{00002959}",
    "LeftFloor;":                       "\u{0000230A}",
    "LeftRightArrow;":                  "\u{00002194}",
    "LeftRightVector;":                 "\u{0000294E}",
    "LeftTee;":                         "\u{000022A3}",
    "LeftTeeArrow;":                    "\u{000021A4}",
    "LeftTeeVector;":                   "\u{0000295A}",
    "LeftTriangle;":                    "\u{000022B2}",
    "LeftTriangleBar;":                 "\u{000029CF}",
    "LeftTriangleEqual;":               "\u{000022B4}",
    "LeftUpDownVector;":                "\u{00002951}",
    "LeftUpTeeVector;":                 "\u{00002960}",
    "LeftUpVector;":                    "\u{000021BF}",
    "LeftUpVectorBar;":                 "\u{00002958}",
    "LeftVector;":                      "\u{000021BC}",
    "LeftVectorBar;":                   "\u{00002952}",
    "Leftarrow;":                       "\u{000021D0}",
    "Leftrightarrow;":                  "\u{000021D4}",
    "LessEqualGreater;":                "\u{000022DA}",
    "LessFullEqual;":                   "\u{00002266}",
    "LessGreater;":                     "\u{00002276}",
    "LessLess;":                        "\u{00002AA1}",
    "LessSlantEqual;":                  "\u{00002A7D}",
    "LessTilde;":                       "\u{00002272}",
    "Lfr;":                             "\u{0001D50F}",
    "Ll;":                              "\u{000022D8}",
    "Lleftarrow;":                      "\u{000021DA}",
    "Lmidot;":                          "\u{0000013F}",
    "LongLeftArrow;":                   "\u{000027F5}",
    "LongLeftRightArrow;":              "\u{000027F7}",
    "LongRightArrow;":                  "\u{000027F6}",
    "Longleftarrow;":                   "\u{000027F8}",
    "Longleftrightarrow;":              "\u{000027FA}",
    "Longrightarrow;":                  "\u{000027F9}",
    "Lopf;":                            "\u{0001D543}",
    "LowerLeftArrow;":                  "\u{00002199}",
    "LowerRightArrow;":                 "\u{00002198}",
    "Lscr;":                            "\u{00002112}",
    "Lsh;":                             "\u{000021B0}",
    "Lstrok;":                          "\u{00000141}",
    "Lt;":                              "\u{0000226A}",
    "Map;":                             "\u{00002905}",
    "Mcy;":                             "\u{0000041C}",
    "MediumSpace;":                     "\u{0000205F}",
    "Mellintrf;":                       "\u{00002133}",
    "Mfr;":                             "\u{0001D510}",
    "MinusPlus;":                       "\u{00002213}",
    "Mopf;":                            "\u{0001D544}",
    "Mscr;":                            "\u{00002133}",
    "Mu;":                              "\u{0000039C}",
    "NJcy;":                            "\u{0000040A}",
    "Nacute;":                          "\u{00000143}",
    "Ncaron;":                          "\u{00000147}",
    "Ncedil;":                          "\u{00000145}",
    "Ncy;":                             "\u{0000041D}",
    "NegativeMediumSpace;":             "\u{0000200B}",
    "NegativeThickSpace;":              "\u{0000200B}",
    "NegativeThinSpace;":               "\u{0000200B}",
    "NegativeVeryThinSpace;":           "\u{0000200B}",
    "NestedGreaterGreater;":            "\u{0000226B}",
    "NestedLessLess;":                  "\u{0000226A}",
    "NewLine;":                         "\u{0000000A}",
    "Nfr;":                             "\u{0001D511}",
    "NoBreak;":                         "\u{00002060}",
    "NonBreakingSpace;":                "\u{000000A0}",
    "Nopf;":                            "\u{00002115}",
    "Not;":                             "\u{00002AEC}",
    "NotCongruent;":                    "\u{00002262}",
    "NotCupCap;":                       "\u{0000226D}",
    "NotDoubleVerticalBar;":            "\u{00002226}",
    "NotElement;":                      "\u{00002209}",
    "NotEqual;":                        "\u{00002260}",
    "NotExists;":                       "\u{00002204}",
    "NotGreater;":                      "\u{0000226F}",
    "NotGreaterEqual;":                 "\u{00002271}",
    "NotGreaterLess;":                  "\u{00002279}",
    "NotGreaterTilde;":                 "\u{00002275}",
    "NotLeftTriangle;":                 "\u{000022EA}",
    "NotLeftTriangleEqual;":            "\u{000022EC}",
    "NotLess;":                         "\u{0000226E}",
    "NotLessEqual;":                    "\u{00002270}",
    "NotLessGreater;":                  "\u{00002278}",
    "NotLessTilde;":                    "\u{00002274}",
    "NotPrecedes;":                     "\u{00002280}",
    "NotPrecedesSlantEqual;":           "\u{000022E0}",
    "NotReverseElement;":               "\u{0000220C}",
    "NotRightTriangle;":                "\u{000022EB}",
    "NotRightTriangleEqual;":           "\u{000022ED}",
    "NotSquareSubsetEqual;":            "\u{000022E2}",
    "NotSquareSupersetEqual;":          "\u{000022E3}",
    "NotSubsetEqual;":                  "\u{00002288}",
    "NotSucceeds;":                     "\u{00002281}",
    "NotSucceedsSlantEqual;":           "\u{000022E1}",
    "NotSupersetEqual;":                "\u{00002289}",
    "NotTilde;":                        "\u{00002241}",
    "NotTildeEqual;":                   "\u{00002244}",
    "NotTildeFullEqual;":               "\u{00002247}",
    "NotTildeTilde;":                   "\u{00002249}",
    "NotVerticalBar;":                  "\u{00002224}",
    "Nscr;":                            "\u{0001D4A9}",
    "Ntilde;":                          "\u{000000D1}",
    "Nu;":                              "\u{0000039D}",
    "OElig;":                           "\u{00000152}",
    "Oacute;":                          "\u{000000D3}",
    "Ocirc;":                           "\u{000000D4}",
    "Ocy;":                             "\u{0000041E}",
    "Odblac;":                          "\u{00000150}",
    "Ofr;":                             "\u{0001D512}",
    "Ograve;":                          "\u{000000D2}",
    "Omacr;":                           "\u{0000014C}",
    "Omega;":                           "\u{000003A9}",
    "Omicron;":                         "\u{0000039F}",
    "Oopf;":                            "\u{0001D546}",
    "OpenCurlyDoubleQuote;":            "\u{0000201C}",
    "OpenCurlyQuote;":                  "\u{00002018}",
    "Or;":                              "\u{00002A54}",
    "Oscr;":                            "\u{0001D4AA}",
    "Oslash;":                          "\u{000000D8}",
    "Otilde;":                          "\u{000000D5}",
    "Otimes;":                          "\u{00002A37}",
    "Ouml;":                            "\u{000000D6}",
    "OverBar;":                         "\u{0000203E}",
    "OverBrace;":                       "\u{000023DE}",
    "OverBracket;":                     "\u{000023B4}",
    "OverParenthesis;":                 "\u{000023DC}",
    "PartialD;":                        "\u{00002202}",
    "Pcy;":                             "\u{0000041F}",
    "Pfr;":                             "\u{0001D513}",
    "Phi;":                             "\u{000003A6}",
    "Pi;":                              "\u{000003A0}",
    "PlusMinus;":                       "\u{000000B1}",
    "Poincareplane;":                   "\u{0000210C}",
    "Popf;":                            "\u{00002119}",
    "Pr;":                              "\u{00002ABB}",
    "Precedes;":                        "\u{0000227A}",
    "PrecedesEqual;":                   "\u{00002AAF}",
    "PrecedesSlantEqual;":              "\u{0000227C}",
    "PrecedesTilde;":                   "\u{0000227E}",
    "Prime;":                           "\u{00002033}",
    "Product;":                         "\u{0000220F}",
    "Proportion;":                      "\u{00002237}",
    "Proportional;":                    "\u{0000221D}",
    "Pscr;":                            "\u{0001D4AB}",
    "Psi;":                             "\u{000003A8}",
    "QUOT;":                            "\u{00000022}",
    "Qfr;":                             "\u{0001D514}",
    "Qopf;":                            "\u{0000211A}",
    "Qscr;":                            "\u{0001D4AC}",
    "RBarr;":                           "\u{00002910}",
    "REG;":                             "\u{000000AE}",
    "Racute;":                          "\u{00000154}",
    "Rang;":                            "\u{000027EB}",
    "Rarr;":                            "\u{000021A0}",
    "Rarrtl;":                          "\u{00002916}",
    "Rcaron;":                          "\u{00000158}",
    "Rcedil;":                          "\u{00000156}",
    "Rcy;":                             "\u{00000420}",
    "Re;":                              "\u{0000211C}",
    "ReverseElement;":                  "\u{0000220B}",
    "ReverseEquilibrium;":              "\u{000021CB}",
    "ReverseUpEquilibrium;":            "\u{0000296F}",
    "Rfr;":                             "\u{0000211C}",
    "Rho;":                             "\u{000003A1}",
    "RightAngleBracket;":               "\u{000027E9}",
    "RightArrow;":                      "\u{00002192}",
    "RightArrowBar;":                   "\u{000021E5}",
    "RightArrowLeftArrow;":             "\u{000021C4}",
    "RightCeiling;":                    "\u{00002309}",
    "RightDoubleBracket;":              "\u{000027E7}",
    "RightDownTeeVector;":              "\u{0000295D}",
    "RightDownVector;":                 "\u{000021C2}",
    "RightDownVectorBar;":              "\u{00002955}",
    "RightFloor;":                      "\u{0000230B}",
    "RightTee;":                        "\u{000022A2}",
    "RightTeeArrow;":                   "\u{000021A6}",
    "RightTeeVector;":                  "\u{0000295B}",
    "RightTriangle;":                   "\u{000022B3}",
    "RightTriangleBar;":                "\u{000029D0}",
    "RightTriangleEqual;":              "\u{000022B5}",
    "RightUpDownVector;":               "\u{0000294F}",
    "RightUpTeeVector;":                "\u{0000295C}",
    "RightUpVector;":                   "\u{000021BE}",
    "RightUpVectorBar;":                "\u{00002954}",
    "RightVector;":                     "\u{000021C0}",
    "RightVectorBar;":                  "\u{00002953}",
    "Rightarrow;":                      "\u{000021D2}",
    "Ropf;":                            "\u{0000211D}",
    "RoundImplies;":                    "\u{00002970}",
    "Rrightarrow;":                     "\u{000021DB}",
    "Rscr;":                            "\u{0000211B}",
    "Rsh;":                             "\u{000021B1}",
    "RuleDelayed;":                     "\u{000029F4}",
    "SHCHcy;":                          "\u{00000429}",
    "SHcy;":                            "\u{00000428}",
    "SOFTcy;":                          "\u{0000042C}",
    "Sacute;":                          "\u{0000015A}",
    "Sc;":                              "\u{00002ABC}",
    "Scaron;":                          "\u{00000160}",
    "Scedil;":                          "\u{0000015E}",
    "Scirc;":                           "\u{0000015C}",
    "Scy;":                             "\u{00000421}",
    "Sfr;":                             "\u{0001D516}",
    "ShortDownArrow;":                  "\u{00002193}",
    "ShortLeftArrow;":                  "\u{00002190}",
    "ShortRightArrow;":                 "\u{00002192}",
    "ShortUpArrow;":                    "\u{00002191}",
    "Sigma;":                           "\u{000003A3}",
    "SmallCircle;":                     "\u{00002218}",
    "Sopf;":                            "\u{0001D54A}",
    "Sqrt;":                            "\u{0000221A}",
    "Square;":                          "\u{000025A1}",
    "SquareIntersection;":              "\u{00002293}",
    "SquareSubset;":                    "\u{0000228F}",
    "SquareSubsetEqual;":               "\u{00002291}",
    "SquareSuperset;":                  "\u{00002290}",
    "SquareSupersetEqual;":             "\u{00002292}",
    "SquareUnion;":                     "\u{00002294}",
    "Sscr;":                            "\u{0001D4AE}",
    "Star;":                            "\u{000022C6}",
    "Sub;":                             "\u{000022D0}",
    "Subset;":                          "\u{000022D0}",
    "SubsetEqual;":                     "\u{00002286}",
    "Succeeds;":                        "\u{0000227B}",
    "SucceedsEqual;":                   "\u{00002AB0}",
    "SucceedsSlantEqual;":              "\u{0000227D}",
    "SucceedsTilde;":                   "\u{0000227F}",
    "SuchThat;":                        "\u{0000220B}",
    "Sum;":                             "\u{00002211}",
    "Sup;":                             "\u{000022D1}",
    "Superset;":                        "\u{00002283}",
    "SupersetEqual;":                   "\u{00002287}",
    "Supset;":                          "\u{000022D1}",
    "THORN;":                           "\u{000000DE}",
    "TRADE;":                           "\u{00002122}",
    "TSHcy;":                           "\u{0000040B}",
    "TScy;":                            "\u{00000426}",
    "Tab;":                             "\u{00000009}",
    "Tau;":                             "\u{000003A4}",
    "Tcaron;":                          "\u{00000164}",
    "Tcedil;":                          "\u{00000162}",
    "Tcy;":                             "\u{00000422}",
    "Tfr;":                             "\u{0001D517}",
    "Therefore;":                       "\u{00002234}",
    "Theta;":                           "\u{00000398}",
    "ThinSpace;":                       "\u{00002009}",
    "Tilde;":                           "\u{0000223C}",
    "TildeEqual;":                      "\u{00002243}",
    "TildeFullEqual;":                  "\u{00002245}",
    "TildeTilde;":                      "\u{00002248}",
    "Topf;":                            "\u{0001D54B}",
    "TripleDot;":                       "\u{000020DB}",
    "Tscr;":                            "\u{0001D4AF}",
    "Tstrok;":                          "\u{00000166}",
    "Uacute;":                          "\u{000000DA}",
    "Uarr;":                            "\u{0000219F}",
    "Uarrocir;":                        "\u{00002949}",
    "Ubrcy;":                           "\u{0000040E}",
    "Ubreve;":                          "\u{0000016C}",
    "Ucirc;":                           "\u{000000DB}",
    "Ucy;":                             "\u{00000423}",
    "Udblac;":                          "\u{00000170}",
    "Ufr;":                             "\u{0001D518}",
    "Ugrave;":                          "\u{000000D9}",
    "Umacr;":                           "\u{0000016A}",
    "UnderBar;":                        "\u{0000005F}",
    "UnderBrace;":                      "\u{000023DF}",
    "UnderBracket;":                    "\u{000023B5}",
    "UnderParenthesis;":                "\u{000023DD}",
    "Union;":                           "\u{000022C3}",
    "UnionPlus;":                       "\u{0000228E}",
    "Uogon;":                           "\u{00000172}",
    "Uopf;":                            "\u{0001D54C}",
    "UpArrow;":                         "\u{00002191}",
    "UpArrowBar;":                      "\u{00002912}",
    "UpArrowDownArrow;":                "\u{000021C5}",
    "UpDownArrow;":                     "\u{00002195}",
    "UpEquilibrium;":                   "\u{0000296E}",
    "UpTee;":                           "\u{000022A5}",
    "UpTeeArrow;":                      "\u{000021A5}",
    "Uparrow;":                         "\u{000021D1}",
    "Updownarrow;":                     "\u{000021D5}",
    "UpperLeftArrow;":                  "\u{00002196}",
    "UpperRightArrow;":                 "\u{00002197}",
    "Upsi;":                            "\u{000003D2}",
    "Upsilon;":                         "\u{000003A5}",
    "Uring;":                           "\u{0000016E}",
    "Uscr;":                            "\u{0001D4B0}",
    "Utilde;":                          "\u{00000168}",
    "Uuml;":                            "\u{000000DC}",
    "VDash;":                           "\u{000022AB}",
    "Vbar;":                            "\u{00002AEB}",
    "Vcy;":                             "\u{00000412}",
    "Vdash;":                           "\u{000022A9}",
    "Vdashl;":                          "\u{00002AE6}",
    "Vee;":                             "\u{000022C1}",
    "Verbar;":                          "\u{00002016}",
    "Vert;":                            "\u{00002016}",
    "VerticalBar;":                     "\u{00002223}",
    "VerticalLine;":                    "\u{0000007C}",
    "VerticalSeparator;":               "\u{00002758}",
    "VerticalTilde;":                   "\u{00002240}",
    "VeryThinSpace;":                   "\u{0000200A}",
    "Vfr;":                             "\u{0001D519}",
    "Vopf;":                            "\u{0001D54D}",
    "Vscr;":                            "\u{0001D4B1}",
    "Vvdash;":                          "\u{000022AA}",
    "Wcirc;":                           "\u{00000174}",
    "Wedge;":                           "\u{000022C0}",
    "Wfr;":                             "\u{0001D51A}",
    "Wopf;":                            "\u{0001D54E}",
    "Wscr;":                            "\u{0001D4B2}",
    "Xfr;":                             "\u{0001D51B}",
    "Xi;":                              "\u{0000039E}",
    "Xopf;":                            "\u{0001D54F}",
    "Xscr;":                            "\u{0001D4B3}",
    "YAcy;":                            "\u{0000042F}",
    "YIcy;":                            "\u{00000407}",
    "YUcy;":                            "\u{0000042E}",
    "Yacute;":                          "\u{000000DD}",
    "Ycirc;":                           "\u{00000176}",
    "Ycy;":                             "\u{0000042B}",
    "Yfr;":                             "\u{0001D51C}",
    "Yopf;":                            "\u{0001D550}",
    "Yscr;":                            "\u{0001D4B4}",
    "Yuml;":                            "\u{00000178}",
    "ZHcy;":                            "\u{00000416}",
    "Zacute;":                          "\u{00000179}",
    "Zcaron;":                          "\u{0000017D}",
    "Zcy;":                             "\u{00000417}",
    "Zdot;":                            "\u{0000017B}",
    "ZeroWidthSpace;":                  "\u{0000200B}",
    "Zeta;":                            "\u{00000396}",
    "Zfr;":                             "\u{00002128}",
    "Zopf;":                            "\u{00002124}",
    "Zscr;":                            "\u{0001D4B5}",
    "aacute;":                          "\u{000000E1}",
    "abreve;":                          "\u{00000103}",
    "ac;":                              "\u{0000223E}",
    "acd;":                             "\u{0000223F}",
    "acirc;":                           "\u{000000E2}",
    "acute;":                           "\u{000000B4}",
    "acy;":                             "\u{00000430}",
    "aelig;":                           "\u{000000E6}",
    "af;":                              "\u{00002061}",
    "afr;":                             "\u{0001D51E}",
    "agrave;":                          "\u{000000E0}",
    "alefsym;":                         "\u{00002135}",
    "aleph;":                           "\u{00002135}",
    "alpha;":                           "\u{000003B1}",
    "amacr;":                           "\u{00000101}",
    "amalg;":                           "\u{00002A3F}",
    "amp;":                             "\u{00000026}",
    "and;":                             "\u{00002227}",
    "andand;":                          "\u{00002A55}",
    "andd;":                            "\u{00002A5C}",
    "andslope;":                        "\u{00002A58}",
    "andv;":                            "\u{00002A5A}",
    "ang;":                             "\u{00002220}",
    "ange;":                            "\u{000029A4}",
    "angle;":                           "\u{00002220}",
    "angmsd;":                          "\u{00002221}",
    "angmsdaa;":                        "\u{000029A8}",
    "angmsdab;":                        "\u{000029A9}",
    "angmsdac;":                        "\u{000029AA}",
    "angmsdad;":                        "\u{000029AB}",
    "angmsdae;":                        "\u{000029AC}",
    "angmsdaf;":                        "\u{000029AD}",
    "angmsdag;":                        "\u{000029AE}",
    "angmsdah;":                        "\u{000029AF}",
    "angrt;":                           "\u{0000221F}",
    "angrtvb;":                         "\u{000022BE}",
    "angrtvbd;":                        "\u{0000299D}",
    "angsph;":                          "\u{00002222}",
    "angst;":                           "\u{000000C5}",
    "angzarr;":                         "\u{0000237C}",
    "aogon;":                           "\u{00000105}",
    "aopf;":                            "\u{0001D552}",
    "ap;":                              "\u{00002248}",
    "apE;":                             "\u{00002A70}",
    "apacir;":                          "\u{00002A6F}",
    "ape;":                             "\u{0000224A}",
    "apid;":                            "\u{0000224B}",
    "apos;":                            "\u{00000027}",
    "approx;":                          "\u{00002248}",
    "approxeq;":                        "\u{0000224A}",
    "aring;":                           "\u{000000E5}",
    "ascr;":                            "\u{0001D4B6}",
    "ast;":                             "\u{0000002A}",
    "asymp;":                           "\u{00002248}",
    "asympeq;":                         "\u{0000224D}",
    "atilde;":                          "\u{000000E3}",
    "auml;":                            "\u{000000E4}",
    "awconint;":                        "\u{00002233}",
    "awint;":                           "\u{00002A11}",
    "bNot;":                            "\u{00002AED}",
    "backcong;":                        "\u{0000224C}",
    "backepsilon;":                     "\u{000003F6}",
    "backprime;":                       "\u{00002035}",
    "backsim;":                         "\u{0000223D}",
    "backsimeq;":                       "\u{000022CD}",
    "barvee;":                          "\u{000022BD}",
    "barwed;":                          "\u{00002305}",
    "barwedge;":                        "\u{00002305}",
    "bbrk;":                            "\u{000023B5}",
    "bbrktbrk;":                        "\u{000023B6}",
    "bcong;":                           "\u{0000224C}",
    "bcy;":                             "\u{00000431}",
    "bdquo;":                           "\u{0000201E}",
    "becaus;":                          "\u{00002235}",
    "because;":                         "\u{00002235}",
    "bemptyv;":                         "\u{000029B0}",
    "bepsi;":                           "\u{000003F6}",
    "bernou;":                          "\u{0000212C}",
    "beta;":                            "\u{000003B2}",
    "beth;":                            "\u{00002136}",
    "between;":                         "\u{0000226C}",
    "bfr;":                             "\u{0001D51F}",
    "bigcap;":                          "\u{000022C2}",
    "bigcirc;":                         "\u{000025EF}",
    "bigcup;":                          "\u{000022C3}",
    "bigodot;":                         "\u{00002A00}",
    "bigoplus;":                        "\u{00002A01}",
    "bigotimes;":                       "\u{00002A02}",
    "bigsqcup;":                        "\u{00002A06}",
    "bigstar;":                         "\u{00002605}",
    "bigtriangledown;":                 "\u{000025BD}",
    "bigtriangleup;":                   "\u{000025B3}",
    "biguplus;":                        "\u{00002A04}",
    "bigvee;":                          "\u{000022C1}",
    "bigwedge;":                        "\u{000022C0}",
    "bkarow;":                          "\u{0000290D}",
    "blacklozenge;":                    "\u{000029EB}",
    "blacksquare;":                     "\u{000025AA}",
    "blacktriangle;":                   "\u{000025B4}",
    "blacktriangledown;":               "\u{000025BE}",
    "blacktriangleleft;":               "\u{000025C2}",
    "blacktriangleright;":              "\u{000025B8}",
    "blank;":                           "\u{00002423}",
    "blk12;":                           "\u{00002592}",
    "blk14;":                           "\u{00002591}",
    "blk34;":                           "\u{00002593}",
    "block;":                           "\u{00002588}",
    "bnot;":                            "\u{00002310}",
    "bopf;":                            "\u{0001D553}",
    "bot;":                             "\u{000022A5}",
    "bottom;":                          "\u{000022A5}",
    "bowtie;":                          "\u{000022C8}",
    "boxDL;":                           "\u{00002557}",
    "boxDR;":                           "\u{00002554}",
    "boxDl;":                           "\u{00002556}",
    "boxDr;":                           "\u{00002553}",
    "boxH;":                            "\u{00002550}",
    "boxHD;":                           "\u{00002566}",
    "boxHU;":                           "\u{00002569}",
    "boxHd;":                           "\u{00002564}",
    "boxHu;":                           "\u{00002567}",
    "boxUL;":                           "\u{0000255D}",
    "boxUR;":                           "\u{0000255A}",
    "boxUl;":                           "\u{0000255C}",
    "boxUr;":                           "\u{00002559}",
    "boxV;":                            "\u{00002551}",
    "boxVH;":                           "\u{0000256C}",
    "boxVL;":                           "\u{00002563}",
    "boxVR;":                           "\u{00002560}",
    "boxVh;":                           "\u{0000256B}",
    "boxVl;":                           "\u{00002562}",
    "boxVr;":                           "\u{0000255F}",
    "boxbox;":                          "\u{000029C9}",
    "boxdL;":                           "\u{00002555}",
    "boxdR;":                           "\u{00002552}",
    "boxdl;":                           "\u{00002510}",
    "boxdr;":                           "\u{0000250C}",
    "boxh;":                            "\u{00002500}",
    "boxhD;":                           "\u{00002565}",
    "boxhU;":                           "\u{00002568}",
    "boxhd;":                           "\u{0000252C}",
    "boxhu;":                           "\u{00002534}",
    "boxminus;":                        "\u{0000229F}",
    "boxplus;":                         "\u{0000229E}",
    "boxtimes;":                        "\u{000022A0}",
    "boxuL;":                           "\u{0000255B}",
    "boxuR;":                           "\u{00002558}",
    "boxul;":                           "\u{00002518}",
    "boxur;":                           "\u{00002514}",
    "boxv;":                            "\u{00002502}",
    "boxvH;":                           "\u{0000256A}",
    "boxvL;":                           "\u{00002561}",
    "boxvR;":                           "\u{0000255E}",
    "boxvh;":                           "\u{0000253C}",
    "boxvl;":                           "\u{00002524}",
    "boxvr;":                           "\u{0000251C}",
    "bprime;":                          "\u{00002035}",
    "breve;":                           "\u{000002D8}",
    "brvbar;":                          "\u{000000A6}",
    "bscr;":                            "\u{0001D4B7}",
    "bsemi;":                           "\u{0000204F}",
    "bsim;":                            "\u{0000223D}",
    "bsime;":                           "\u{000022CD}",
    "bsol;":                            "\u{0000005C}",
    "bsolb;":                           "\u{000029C5}",
    "bsolhsub;":                        "\u{000027C8}",
    "bull;":                            "\u{00002022}",
    "bullet;":                          "\u{00002022}",
    "bump;":                            "\u{0000224E}",
    "bumpE;":                           "\u{00002AAE}",
    "bumpe;":                           "\u{0000224F}",
    "bumpeq;":                          "\u{0000224F}",
    "cacute;":                          "\u{00000107}",
    "cap;":                             "\u{00002229}",
    "capand;":                          "\u{00002A44}",
    "capbrcup;":                        "\u{00002A49}",
    "capcap;":                          "\u{00002A4B}",
    "capcup;":                          "\u{00002A47}",
    "capdot;":                          "\u{00002A40}",
    "caret;":                           "\u{00002041}",
    "caron;":                           "\u{000002C7}",
    "ccaps;":                           "\u{00002A4D}",
    "ccaron;":                          "\u{0000010D}",
    "ccedil;":                          "\u{000000E7}",
    "ccirc;":                           "\u{00000109}",
    "ccups;":                           "\u{00002A4C}",
    "ccupssm;":                         "\u{00002A50}",
    "cdot;":                            "\u{0000010B}",
    "cedil;":                           "\u{000000B8}",
    "cemptyv;":                         "\u{000029B2}",
    "cent;":                            "\u{000000A2}",
    "centerdot;":                       "\u{000000B7}",
    "cfr;":                             "\u{0001D520}",
    "chcy;":                            "\u{00000447}",
    "check;":                           "\u{00002713}",
    "checkmark;":                       "\u{00002713}",
    "chi;":                             "\u{000003C7}",
    "cir;":                             "\u{000025CB}",
    "cirE;":                            "\u{000029C3}",
    "circ;":                            "\u{000002C6}",
    "circeq;":                          "\u{00002257}",
    "circlearrowleft;":                 "\u{000021BA}",
    "circlearrowright;":                "\u{000021BB}",
    "circledR;":                        "\u{000000AE}",
    "circledS;":                        "\u{000024C8}",
    "circledast;":                      "\u{0000229B}",
    "circledcirc;":                     "\u{0000229A}",
    "circleddash;":                     "\u{0000229D}",
    "cire;":                            "\u{00002257}",
    "cirfnint;":                        "\u{00002A10}",
    "cirmid;":                          "\u{00002AEF}",
    "cirscir;":                         "\u{000029C2}",
    "clubs;":                           "\u{00002663}",
    "clubsuit;":                        "\u{00002663}",
    "colon;":                           "\u{0000003A}",
    "colone;":                          "\u{00002254}",
    "coloneq;":                         "\u{00002254}",
    "comma;":                           "\u{0000002C}",
    "commat;":                          "\u{00000040}",
    "comp;":                            "\u{00002201}",
    "compfn;":                          "\u{00002218}",
    "complement;":                      "\u{00002201}",
    "complexes;":                       "\u{00002102}",
    "cong;":                            "\u{00002245}",
    "congdot;":                         "\u{00002A6D}",
    "conint;":                          "\u{0000222E}",
    "copf;":                            "\u{0001D554}",
    "coprod;":                          "\u{00002210}",
    "copy;":                            "\u{000000A9}",
    "copysr;":                          "\u{00002117}",
    "crarr;":                           "\u{000021B5}",
    "cross;":                           "\u{00002717}",
    "cscr;":                            "\u{0001D4B8}",
    "csub;":                            "\u{00002ACF}",
    "csube;":                           "\u{00002AD1}",
    "csup;":                            "\u{00002AD0}",
    "csupe;":                           "\u{00002AD2}",
    "ctdot;":                           "\u{000022EF}",
    "cudarrl;":                         "\u{00002938}",
    "cudarrr;":                         "\u{00002935}",
    "cuepr;":                           "\u{000022DE}",
    "cuesc;":                           "\u{000022DF}",
    "cularr;":                          "\u{000021B6}",
    "cularrp;":                         "\u{0000293D}",
    "cup;":                             "\u{0000222A}",
    "cupbrcap;":                        "\u{00002A48}",
    "cupcap;":                          "\u{00002A46}",
    "cupcup;":                          "\u{00002A4A}",
    "cupdot;":                          "\u{0000228D}",
    "cupor;":                           "\u{00002A45}",
    "curarr;":                          "\u{000021B7}",
    "curarrm;":                         "\u{0000293C}",
    "curlyeqprec;":                     "\u{000022DE}",
    "curlyeqsucc;":                     "\u{000022DF}",
    "curlyvee;":                        "\u{000022CE}",
    "curlywedge;":                      "\u{000022CF}",
    "curren;":                          "\u{000000A4}",
    "curvearrowleft;":                  "\u{000021B6}",
    "curvearrowright;":                 "\u{000021B7}",
    "cuvee;":                           "\u{000022CE}",
    "cuwed;":                           "\u{000022CF}",
    "cwconint;":                        "\u{00002232}",
    "cwint;":                           "\u{00002231}",
    "cylcty;":                          "\u{0000232D}",
    "dArr;":                            "\u{000021D3}",
    "dHar;":                            "\u{00002965}",
    "dagger;":                          "\u{00002020}",
    "daleth;":                          "\u{00002138}",
    "darr;":                            "\u{00002193}",
    "dash;":                            "\u{00002010}",
    "dashv;":                           "\u{000022A3}",
    "dbkarow;":                         "\u{0000290F}",
    "dblac;":                           "\u{000002DD}",
    "dcaron;":                          "\u{0000010F}",
    "dcy;":                             "\u{00000434}",
    "dd;":                              "\u{00002146}",
    "ddagger;":                         "\u{00002021}",
    "ddarr;":                           "\u{000021CA}",
    "ddotseq;":                         "\u{00002A77}",
    "deg;":                             "\u{000000B0}",
    "delta;":                           "\u{000003B4}",
    "demptyv;":                         "\u{000029B1}",
    "dfisht;":                          "\u{0000297F}",
    "dfr;":                             "\u{0001D521}",
    "dharl;":                           "\u{000021C3}",
    "dharr;":                           "\u{000021C2}",
    "diam;":                            "\u{000022C4}",
    "diamond;":                         "\u{000022C4}",
    "diamondsuit;":                     "\u{00002666}",
    "diams;":                           "\u{00002666}",
    "die;":                             "\u{000000A8}",
    "digamma;":                         "\u{000003DD}",
    "disin;":                           "\u{000022F2}",
    "div;":                             "\u{000000F7}",
    "divide;":                          "\u{000000F7}",
    "divideontimes;":                   "\u{000022C7}",
    "divonx;":                          "\u{000022C7}",
    "djcy;":                            "\u{00000452}",
    "dlcorn;":                          "\u{0000231E}",
    "dlcrop;":                          "\u{0000230D}",
    "dollar;":                          "\u{00000024}",
    "dopf;":                            "\u{0001D555}",
    "dot;":                             "\u{000002D9}",
    "doteq;":                           "\u{00002250}",
    "doteqdot;":                        "\u{00002251}",
    "dotminus;":                        "\u{00002238}",
    "dotplus;":                         "\u{00002214}",
    "dotsquare;":                       "\u{000022A1}",
    "doublebarwedge;":                  "\u{00002306}",
    "downarrow;":                       "\u{00002193}",
    "downdownarrows;":                  "\u{000021CA}",
    "downharpoonleft;":                 "\u{000021C3}",
    "downharpoonright;":                "\u{000021C2}",
    "drbkarow;":                        "\u{00002910}",
    "drcorn;":                          "\u{0000231F}",
    "drcrop;":                          "\u{0000230C}",
    "dscr;":                            "\u{0001D4B9}",
    "dscy;":                            "\u{00000455}",
    "dsol;":                            "\u{000029F6}",
    "dstrok;":                          "\u{00000111}",
    "dtdot;":                           "\u{000022F1}",
    "dtri;":                            "\u{000025BF}",
    "dtrif;":                           "\u{000025BE}",
    "duarr;":                           "\u{000021F5}",
    "duhar;":                           "\u{0000296F}",
    "dwangle;":                         "\u{000029A6}",
    "dzcy;":                            "\u{0000045F}",
    "dzigrarr;":                        "\u{000027FF}",
    "eDDot;":                           "\u{00002A77}",
    "eDot;":                            "\u{00002251}",
    "eacute;":                          "\u{000000E9}",
    "easter;":                          "\u{00002A6E}",
    "ecaron;":                          "\u{0000011B}",
    "ecir;":                            "\u{00002256}",
    "ecirc;":                           "\u{000000EA}",
    "ecolon;":                          "\u{00002255}",
    "ecy;":                             "\u{0000044D}",
    "edot;":                            "\u{00000117}",
    "ee;":                              "\u{00002147}",
    "efDot;":                           "\u{00002252}",
    "efr;":                             "\u{0001D522}",
    "eg;":                              "\u{00002A9A}",
    "egrave;":                          "\u{000000E8}",
    "egs;":                             "\u{00002A96}",
    "egsdot;":                          "\u{00002A98}",
    "el;":                              "\u{00002A99}",
    "elinters;":                        "\u{000023E7}",
    "ell;":                             "\u{00002113}",
    "els;":                             "\u{00002A95}",
    "elsdot;":                          "\u{00002A97}",
    "emacr;":                           "\u{00000113}",
    "empty;":                           "\u{00002205}",
    "emptyset;":                        "\u{00002205}",
    "emptyv;":                          "\u{00002205}",
    "emsp;":                            "\u{00002003}",
    "emsp13;":                          "\u{00002004}",
    "emsp14;":                          "\u{00002005}",
    "eng;":                             "\u{0000014B}",
    "ensp;":                            "\u{00002002}",
    "eogon;":                           "\u{00000119}",
    "eopf;":                            "\u{0001D556}",
    "epar;":                            "\u{000022D5}",
    "eparsl;":                          "\u{000029E3}",
    "eplus;":                           "\u{00002A71}",
    "epsi;":                            "\u{000003B5}",
    "epsilon;":                         "\u{000003B5}",
    "epsiv;":                           "\u{000003F5}",
    "eqcirc;":                          "\u{00002256}",
    "eqcolon;":                         "\u{00002255}",
    "eqsim;":                           "\u{00002242}",
    "eqslantgtr;":                      "\u{00002A96}",
    "eqslantless;":                     "\u{00002A95}",
    "equals;":                          "\u{0000003D}",
    "equest;":                          "\u{0000225F}",
    "equiv;":                           "\u{00002261}",
    "equivDD;":                         "\u{00002A78}",
    "eqvparsl;":                        "\u{000029E5}",
    "erDot;":                           "\u{00002253}",
    "erarr;":                           "\u{00002971}",
    "escr;":                            "\u{0000212F}",
    "esdot;":                           "\u{00002250}",
    "esim;":                            "\u{00002242}",
    "eta;":                             "\u{000003B7}",
    "eth;":                             "\u{000000F0}",
    "euml;":                            "\u{000000EB}",
    "euro;":                            "\u{000020AC}",
    "excl;":                            "\u{00000021}",
    "exist;":                           "\u{00002203}",
    "expectation;":                     "\u{00002130}",
    "exponentiale;":                    "\u{00002147}",
    "fallingdotseq;":                   "\u{00002252}",
    "fcy;":                             "\u{00000444}",
    "female;":                          "\u{00002640}",
    "ffilig;":                          "\u{0000FB03}",
    "fflig;":                           "\u{0000FB00}",
    "ffllig;":                          "\u{0000FB04}",
    "ffr;":                             "\u{0001D523}",
    "filig;":                           "\u{0000FB01}",
    "flat;":                            "\u{0000266D}",
    "fllig;":                           "\u{0000FB02}",
    "fltns;":                           "\u{000025B1}",
    "fnof;":                            "\u{00000192}",
    "fopf;":                            "\u{0001D557}",
    "forall;":                          "\u{00002200}",
    "fork;":                            "\u{000022D4}",
    "forkv;":                           "\u{00002AD9}",
    "fpartint;":                        "\u{00002A0D}",
    "frac12;":                          "\u{000000BD}",
    "frac13;":                          "\u{00002153}",
    "frac14;":                          "\u{000000BC}",
    "frac15;":                          "\u{00002155}",
    "frac16;":                          "\u{00002159}",
    "frac18;":                          "\u{0000215B}",
    "frac23;":                          "\u{00002154}",
    "frac25;":                          "\u{00002156}",
    "frac34;":                          "\u{000000BE}",
    "frac35;":                          "\u{00002157}",
    "frac38;":                          "\u{0000215C}",
    "frac45;":                          "\u{00002158}",
    "frac56;":                          "\u{0000215A}",
    "frac58;":                          "\u{0000215D}",
    "frac78;":                          "\u{0000215E}",
    "frasl;":                           "\u{00002044}",
    "frown;":                           "\u{00002322}",
    "fscr;":                            "\u{0001D4BB}",
    "gE;":                              "\u{00002267}",
    "gEl;":                             "\u{00002A8C}",
    "gacute;":                          "\u{000001F5}",
    "gamma;":                           "\u{000003B3}",
    "gammad;":                          "\u{000003DD}",
    "gap;":                             "\u{00002A86}",
    "gbreve;":                          "\u{0000011F}",
    "gcirc;":                           "\u{0000011D}",
    "gcy;":                             "\u{00000433}",
    "gdot;":                            "\u{00000121}",
    "ge;":                              "\u{00002265}",
    "gel;":                             "\u{000022DB}",
    "geq;":                             "\u{00002265}",
    "geqq;":                            "\u{00002267}",
    "geqslant;":                        "\u{00002A7E}",
    "ges;":                             "\u{00002A7E}",
    "gescc;":                           "\u{00002AA9}",
    "gesdot;":                          "\u{00002A80}",
    "gesdoto;":                         "\u{00002A82}",
    "gesdotol;":                        "\u{00002A84}",
    "gesles;":                          "\u{00002A94}",
    "gfr;":                             "\u{0001D524}",
    "gg;":                              "\u{0000226B}",
    "ggg;":                             "\u{000022D9}",
    "gimel;":                           "\u{00002137}",
    "gjcy;":                            "\u{00000453}",
    "gl;":                              "\u{00002277}",
    "glE;":                             "\u{00002A92}",
    "gla;":                             "\u{00002AA5}",
    "glj;":                             "\u{00002AA4}",
    "gnE;":                             "\u{00002269}",
    "gnap;":                            "\u{00002A8A}",
    "gnapprox;":                        "\u{00002A8A}",
    "gne;":                             "\u{00002A88}",
    "gneq;":                            "\u{00002A88}",
    "gneqq;":                           "\u{00002269}",
    "gnsim;":                           "\u{000022E7}",
    "gopf;":                            "\u{0001D558}",
    "grave;":                           "\u{00000060}",
    "gscr;":                            "\u{0000210A}",
    "gsim;":                            "\u{00002273}",
    "gsime;":                           "\u{00002A8E}",
    "gsiml;":                           "\u{00002A90}",
    "gt;":                              "\u{0000003E}",
    "gtcc;":                            "\u{00002AA7}",
    "gtcir;":                           "\u{00002A7A}",
    "gtdot;":                           "\u{000022D7}",
    "gtlPar;":                          "\u{00002995}",
    "gtquest;":                         "\u{00002A7C}",
    "gtrapprox;":                       "\u{00002A86}",
    "gtrarr;":                          "\u{00002978}",
    "gtrdot;":                          "\u{000022D7}",
    "gtreqless;":                       "\u{000022DB}",
    "gtreqqless;":                      "\u{00002A8C}",
    "gtrless;":                         "\u{00002277}",
    "gtrsim;":                          "\u{00002273}",
    "hArr;":                            "\u{000021D4}",
    "hairsp;":                          "\u{0000200A}",
    "half;":                            "\u{000000BD}",
    "hamilt;":                          "\u{0000210B}",
    "hardcy;":                          "\u{0000044A}",
    "harr;":                            "\u{00002194}",
    "harrcir;":                         "\u{00002948}",
    "harrw;":                           "\u{000021AD}",
    "hbar;":                            "\u{0000210F}",
    "hcirc;":                           "\u{00000125}",
    "hearts;":                          "\u{00002665}",
    "heartsuit;":                       "\u{00002665}",
    "hellip;":                          "\u{00002026}",
    "hercon;":                          "\u{000022B9}",
    "hfr;":                             "\u{0001D525}",
    "hksearow;":                        "\u{00002925}",
    "hkswarow;":                        "\u{00002926}",
    "hoarr;":                           "\u{000021FF}",
    "homtht;":                          "\u{0000223B}",
    "hookleftarrow;":                   "\u{000021A9}",
    "hookrightarrow;":                  "\u{000021AA}",
    "hopf;":                            "\u{0001D559}",
    "horbar;":                          "\u{00002015}",
    "hscr;":                            "\u{0001D4BD}",
    "hslash;":                          "\u{0000210F}",
    "hstrok;":                          "\u{00000127}",
    "hybull;":                          "\u{00002043}",
    "hyphen;":                          "\u{00002010}",
    "iacute;":                          "\u{000000ED}",
    "ic;":                              "\u{00002063}",
    "icirc;":                           "\u{000000EE}",
    "icy;":                             "\u{00000438}",
    "iecy;":                            "\u{00000435}",
    "iexcl;":                           "\u{000000A1}",
    "iff;":                             "\u{000021D4}",
    "ifr;":                             "\u{0001D526}",
    "igrave;":                          "\u{000000EC}",
    "ii;":                              "\u{00002148}",
    "iiiint;":                          "\u{00002A0C}",
    "iiint;":                           "\u{0000222D}",
    "iinfin;":                          "\u{000029DC}",
    "iiota;":                           "\u{00002129}",
    "ijlig;":                           "\u{00000133}",
    "imacr;":                           "\u{0000012B}",
    "image;":                           "\u{00002111}",
    "imagline;":                        "\u{00002110}",
    "imagpart;":                        "\u{00002111}",
    "imath;":                           "\u{00000131}",
    "imof;":                            "\u{000022B7}",
    "imped;":                           "\u{000001B5}",
    "in;":                              "\u{00002208}",
    "incare;":                          "\u{00002105}",
    "infin;":                           "\u{0000221E}",
    "infintie;":                        "\u{000029DD}",
    "inodot;":                          "\u{00000131}",
    "int;":                             "\u{0000222B}",
    "intcal;":                          "\u{000022BA}",
    "integers;":                        "\u{00002124}",
    "intercal;":                        "\u{000022BA}",
    "intlarhk;":                        "\u{00002A17}",
    "intprod;":                         "\u{00002A3C}",
    "iocy;":                            "\u{00000451}",
    "iogon;":                           "\u{0000012F}",
    "iopf;":                            "\u{0001D55A}",
    "iota;":                            "\u{000003B9}",
    "iprod;":                           "\u{00002A3C}",
    "iquest;":                          "\u{000000BF}",
    "iscr;":                            "\u{0001D4BE}",
    "isin;":                            "\u{00002208}",
    "isinE;":                           "\u{000022F9}",
    "isindot;":                         "\u{000022F5}",
    "isins;":                           "\u{000022F4}",
    "isinsv;":                          "\u{000022F3}",
    "isinv;":                           "\u{00002208}",
    "it;":                              "\u{00002062}",
    "itilde;":                          "\u{00000129}",
    "iukcy;":                           "\u{00000456}",
    "iuml;":                            "\u{000000EF}",
    "jcirc;":                           "\u{00000135}",
    "jcy;":                             "\u{00000439}",
    "jfr;":                             "\u{0001D527}",
    "jmath;":                           "\u{00000237}",
    "jopf;":                            "\u{0001D55B}",
    "jscr;":                            "\u{0001D4BF}",
    "jsercy;":                          "\u{00000458}",
    "jukcy;":                           "\u{00000454}",
    "kappa;":                           "\u{000003BA}",
    "kappav;":                          "\u{000003F0}",
    "kcedil;":                          "\u{00000137}",
    "kcy;":                             "\u{0000043A}",
    "kfr;":                             "\u{0001D528}",
    "kgreen;":                          "\u{00000138}",
    "khcy;":                            "\u{00000445}",
    "kjcy;":                            "\u{0000045C}",
    "kopf;":                            "\u{0001D55C}",
    "kscr;":                            "\u{0001D4C0}",
    "lAarr;":                           "\u{000021DA}",
    "lArr;":                            "\u{000021D0}",
    "lAtail;":                          "\u{0000291B}",
    "lBarr;":                           "\u{0000290E}",
    "lE;":                              "\u{00002266}",
    "lEg;":                             "\u{00002A8B}",
    "lHar;":                            "\u{00002962}",
    "lacute;":                          "\u{0000013A}",
    "laemptyv;":                        "\u{000029B4}",
    "lagran;":                          "\u{00002112}",
    "lambda;":                          "\u{000003BB}",
    "lang;":                            "\u{000027E8}",
    "langd;":                           "\u{00002991}",
    "langle;":                          "\u{000027E8}",
    "lap;":                             "\u{00002A85}",
    "laquo;":                           "\u{000000AB}",
    "larr;":                            "\u{00002190}",
    "larrb;":                           "\u{000021E4}",
    "larrbfs;":                         "\u{0000291F}",
    "larrfs;":                          "\u{0000291D}",
    "larrhk;":                          "\u{000021A9}",
    "larrlp;":                          "\u{000021AB}",
    "larrpl;":                          "\u{00002939}",
    "larrsim;":                         "\u{00002973}",
    "larrtl;":                          "\u{000021A2}",
    "lat;":                             "\u{00002AAB}",
    "latail;":                          "\u{00002919}",
    "late;":                            "\u{00002AAD}",
    "lbarr;":                           "\u{0000290C}",
    "lbbrk;":                           "\u{00002772}",
    "lbrace;":                          "\u{0000007B}",
    "lbrack;":                          "\u{0000005B}",
    "lbrke;":                           "\u{0000298B}",
    "lbrksld;":                         "\u{0000298F}",
    "lbrkslu;":                         "\u{0000298D}",
    "lcaron;":                          "\u{0000013E}",
    "lcedil;":                          "\u{0000013C}",
    "lceil;":                           "\u{00002308}",
    "lcub;":                            "\u{0000007B}",
    "lcy;":                             "\u{0000043B}",
    "ldca;":                            "\u{00002936}",
    "ldquo;":                           "\u{0000201C}",
    "ldquor;":                          "\u{0000201E}",
    "ldrdhar;":                         "\u{00002967}",
    "ldrushar;":                        "\u{0000294B}",
    "ldsh;":                            "\u{000021B2}",
    "le;":                              "\u{00002264}",
    "leftarrow;":                       "\u{00002190}",
    "leftarrowtail;":                   "\u{000021A2}",
    "leftharpoondown;":                 "\u{000021BD}",
    "leftharpoonup;":                   "\u{000021BC}",
    "leftleftarrows;":                  "\u{000021C7}",
    "leftrightarrow;":                  "\u{00002194}",
    "leftrightarrows;":                 "\u{000021C6}",
    "leftrightharpoons;":               "\u{000021CB}",
    "leftrightsquigarrow;":             "\u{000021AD}",
    "leftthreetimes;":                  "\u{000022CB}",
    "leg;":                             "\u{000022DA}",
    "leq;":                             "\u{00002264}",
    "leqq;":                            "\u{00002266}",
    "leqslant;":                        "\u{00002A7D}",
    "les;":                             "\u{00002A7D}",
    "lescc;":                           "\u{00002AA8}",
    "lesdot;":                          "\u{00002A7F}",
    "lesdoto;":                         "\u{00002A81}",
    "lesdotor;":                        "\u{00002A83}",
    "lesges;":                          "\u{00002A93}",
    "lessapprox;":                      "\u{00002A85}",
    "lessdot;":                         "\u{000022D6}",
    "lesseqgtr;":                       "\u{000022DA}",
    "lesseqqgtr;":                      "\u{00002A8B}",
    "lessgtr;":                         "\u{00002276}",
    "lesssim;":                         "\u{00002272}",
    "lfisht;":                          "\u{0000297C}",
    "lfloor;":                          "\u{0000230A}",
    "lfr;":                             "\u{0001D529}",
    "lg;":                              "\u{00002276}",
    "lgE;":                             "\u{00002A91}",
    "lhard;":                           "\u{000021BD}",
    "lharu;":                           "\u{000021BC}",
    "lharul;":                          "\u{0000296A}",
    "lhblk;":                           "\u{00002584}",
    "ljcy;":                            "\u{00000459}",
    "ll;":                              "\u{0000226A}",
    "llarr;":                           "\u{000021C7}",
    "llcorner;":                        "\u{0000231E}",
    "llhard;":                          "\u{0000296B}",
    "lltri;":                           "\u{000025FA}",
    "lmidot;":                          "\u{00000140}",
    "lmoust;":                          "\u{000023B0}",
    "lmoustache;":                      "\u{000023B0}",
    "lnE;":                             "\u{00002268}",
    "lnap;":                            "\u{00002A89}",
    "lnapprox;":                        "\u{00002A89}",
    "lne;":                             "\u{00002A87}",
    "lneq;":                            "\u{00002A87}",
    "lneqq;":                           "\u{00002268}",
    "lnsim;":                           "\u{000022E6}",
    "loang;":                           "\u{000027EC}",
    "loarr;":                           "\u{000021FD}",
    "lobrk;":                           "\u{000027E6}",
    "longleftarrow;":                   "\u{000027F5}",
    "longleftrightarrow;":              "\u{000027F7}",
    "longmapsto;":                      "\u{000027FC}",
    "longrightarrow;":                  "\u{000027F6}",
    "looparrowleft;":                   "\u{000021AB}",
    "looparrowright;":                  "\u{000021AC}",
    "lopar;":                           "\u{00002985}",
    "lopf;":                            "\u{0001D55D}",
    "loplus;":                          "\u{00002A2D}",
    "lotimes;":                         "\u{00002A34}",
    "lowast;":                          "\u{00002217}",
    "lowbar;":                          "\u{0000005F}",
    "loz;":                             "\u{000025CA}",
    "lozenge;":                         "\u{000025CA}",
    "lozf;":                            "\u{000029EB}",
    "lpar;":                            "\u{00000028}",
    "lparlt;":                          "\u{00002993}",
    "lrarr;":                           "\u{000021C6}",
    "lrcorner;":                        "\u{0000231F}",
    "lrhar;":                           "\u{000021CB}",
    "lrhard;":                          "\u{0000296D}",
    "lrm;":                             "\u{0000200E}",
    "lrtri;":                           "\u{000022BF}",
    "lsaquo;":                          "\u{00002039}",
    "lscr;":                            "\u{0001D4C1}",
    "lsh;":                             "\u{000021B0}",
    "lsim;":                            "\u{00002272}",
    "lsime;":                           "\u{00002A8D}",
    "lsimg;":                           "\u{00002A8F}",
    "lsqb;":                            "\u{0000005B}",
    "lsquo;":                           "\u{00002018}",
    "lsquor;":                          "\u{0000201A}",
    "lstrok;":                          "\u{00000142}",
    "lt;":                              "\u{0000003C}",
    "ltcc;":                            "\u{00002AA6}",
    "ltcir;":                           "\u{00002A79}",
    "ltdot;":                           "\u{000022D6}",
    "lthree;":                          "\u{000022CB}",
    "ltimes;":                          "\u{000022C9}",
    "ltlarr;":                          "\u{00002976}",
    "ltquest;":                         "\u{00002A7B}",
    "ltrPar;":                          "\u{00002996}",
    "ltri;":                            "\u{000025C3}",
    "ltrie;":                           "\u{000022B4}",
    "ltrif;":                           "\u{000025C2}",
    "lurdshar;":                        "\u{0000294A}",
    "luruhar;":                         "\u{00002966}",
    "mDDot;":                           "\u{0000223A}",
    "macr;":                            "\u{000000AF}",
    "male;":                            "\u{00002642}",
    "malt;":                            "\u{00002720}",
    "maltese;":                         "\u{00002720}",
    "map;":                             "\u{000021A6}",
    "mapsto;":                          "\u{000021A6}",
    "mapstodown;":                      "\u{000021A7}",
    "mapstoleft;":                      "\u{000021A4}",
    "mapstoup;":                        "\u{000021A5}",
    "marker;":                          "\u{000025AE}",
    "mcomma;":                          "\u{00002A29}",
    "mcy;":                             "\u{0000043C}",
    "mdash;":                           "\u{00002014}",
    "measuredangle;":                   "\u{00002221}",
    "mfr;":                             "\u{0001D52A}",
    "mho;":                             "\u{00002127}",
    "micro;":                           "\u{000000B5}",
    "mid;":                             "\u{00002223}",
    "midast;":                          "\u{0000002A}",
    "midcir;":                          "\u{00002AF0}",
    "middot;":                          "\u{000000B7}",
    "minus;":                           "\u{00002212}",
    "minusb;":                          "\u{0000229F}",
    "minusd;":                          "\u{00002238}",
    "minusdu;":                         "\u{00002A2A}",
    "mlcp;":                            "\u{00002ADB}",
    "mldr;":                            "\u{00002026}",
    "mnplus;":                          "\u{00002213}",
    "models;":                          "\u{000022A7}",
    "mopf;":                            "\u{0001D55E}",
    "mp;":                              "\u{00002213}",
    "mscr;":                            "\u{0001D4C2}",
    "mstpos;":                          "\u{0000223E}",
    "mu;":                              "\u{000003BC}",
    "multimap;":                        "\u{000022B8}",
    "mumap;":                           "\u{000022B8}",
    "nLeftarrow;":                      "\u{000021CD}",
    "nLeftrightarrow;":                 "\u{000021CE}",
    "nRightarrow;":                     "\u{000021CF}",
    "nVDash;":                          "\u{000022AF}",
    "nVdash;":                          "\u{000022AE}",
    "nabla;":                           "\u{00002207}",
    "nacute;":                          "\u{00000144}",
    "nap;":                             "\u{00002249}",
    "napos;":                           "\u{00000149}",
    "napprox;":                         "\u{00002249}",
    "natur;":                           "\u{0000266E}",
    "natural;":                         "\u{0000266E}",
    "naturals;":                        "\u{00002115}",
    "nbsp;":                            "\u{000000A0}",
    "ncap;":                            "\u{00002A43}",
    "ncaron;":                          "\u{00000148}",
    "ncedil;":                          "\u{00000146}",
    "ncong;":                           "\u{00002247}",
    "ncup;":                            "\u{00002A42}",
    "ncy;":                             "\u{0000043D}",
    "ndash;":                           "\u{00002013}",
    "ne;":                              "\u{00002260}",
    "neArr;":                           "\u{000021D7}",
    "nearhk;":                          "\u{00002924}",
    "nearr;":                           "\u{00002197}",
    "nearrow;":                         "\u{00002197}",
    "nequiv;":                          "\u{00002262}",
    "nesear;":                          "\u{00002928}",
    "nexist;":                          "\u{00002204}",
    "nexists;":                         "\u{00002204}",
    "nfr;":                             "\u{0001D52B}",
    "nge;":                             "\u{00002271}",
    "ngeq;":                            "\u{00002271}",
    "ngsim;":                           "\u{00002275}",
    "ngt;":                             "\u{0000226F}",
    "ngtr;":                            "\u{0000226F}",
    "nhArr;":                           "\u{000021CE}",
    "nharr;":                           "\u{000021AE}",
    "nhpar;":                           "\u{00002AF2}",
    "ni;":                              "\u{0000220B}",
    "nis;":                             "\u{000022FC}",
    "nisd;":                            "\u{000022FA}",
    "niv;":                             "\u{0000220B}",
    "njcy;":                            "\u{0000045A}",
    "nlArr;":                           "\u{000021CD}",
    "nlarr;":                           "\u{0000219A}",
    "nldr;":                            "\u{00002025}",
    "nle;":                             "\u{00002270}",
    "nleftarrow;":                      "\u{0000219A}",
    "nleftrightarrow;":                 "\u{000021AE}",
    "nleq;":                            "\u{00002270}",
    "nless;":                           "\u{0000226E}",
    "nlsim;":                           "\u{00002274}",
    "nlt;":                             "\u{0000226E}",
    "nltri;":                           "\u{000022EA}",
    "nltrie;":                          "\u{000022EC}",
    "nmid;":                            "\u{00002224}",
    "nopf;":                            "\u{0001D55F}",
    "not;":                             "\u{000000AC}",
    "notin;":                           "\u{00002209}",
    "notinva;":                         "\u{00002209}",
    "notinvb;":                         "\u{000022F7}",
    "notinvc;":                         "\u{000022F6}",
    "notni;":                           "\u{0000220C}",
    "notniva;":                         "\u{0000220C}",
    "notnivb;":                         "\u{000022FE}",
    "notnivc;":                         "\u{000022FD}",
    "npar;":                            "\u{00002226}",
    "nparallel;":                       "\u{00002226}",
    "npolint;":                         "\u{00002A14}",
    "npr;":                             "\u{00002280}",
    "nprcue;":                          "\u{000022E0}",
    "nprec;":                           "\u{00002280}",
    "nrArr;":                           "\u{000021CF}",
    "nrarr;":                           "\u{0000219B}",
    "nrightarrow;":                     "\u{0000219B}",
    "nrtri;":                           "\u{000022EB}",
    "nrtrie;":                          "\u{000022ED}",
    "nsc;":                             "\u{00002281}",
    "nsccue;":                          "\u{000022E1}",
    "nscr;":                            "\u{0001D4C3}",
    "nshortmid;":                       "\u{00002224}",
    "nshortparallel;":                  "\u{00002226}",
    "nsim;":                            "\u{00002241}",
    "nsime;":                           "\u{00002244}",
    "nsimeq;":                          "\u{00002244}",
    "nsmid;":                           "\u{00002224}",
    "nspar;":                           "\u{00002226}",
    "nsqsube;":                         "\u{000022E2}",
    "nsqsupe;":                         "\u{000022E3}",
    "nsub;":                            "\u{00002284}",
    "nsube;":                           "\u{00002288}",
    "nsubseteq;":                       "\u{00002288}",
    "nsucc;":                           "\u{00002281}",
    "nsup;":                            "\u{00002285}",
    "nsupe;":                           "\u{00002289}",
    "nsupseteq;":                       "\u{00002289}",
    "ntgl;":                            "\u{00002279}",
    "ntilde;":                          "\u{000000F1}",
    "ntlg;":                            "\u{00002278}",
    "ntriangleleft;":                   "\u{000022EA}",
    "ntrianglelefteq;":                 "\u{000022EC}",
    "ntriangleright;":                  "\u{000022EB}",
    "ntrianglerighteq;":                "\u{000022ED}",
    "nu;":                              "\u{000003BD}",
    "num;":                             "\u{00000023}",
    "numero;":                          "\u{00002116}",
    "numsp;":                           "\u{00002007}",
    "nvDash;":                          "\u{000022AD}",
    "nvHarr;":                          "\u{00002904}",
    "nvdash;":                          "\u{000022AC}",
    "nvinfin;":                         "\u{000029DE}",
    "nvlArr;":                          "\u{00002902}",
    "nvrArr;":                          "\u{00002903}",
    "nwArr;":                           "\u{000021D6}",
    "nwarhk;":                          "\u{00002923}",
    "nwarr;":                           "\u{00002196}",
    "nwarrow;":                         "\u{00002196}",
    "nwnear;":                          "\u{00002927}",
    "oS;":                              "\u{000024C8}",
    "oacute;":                          "\u{000000F3}",
    "oast;":                            "\u{0000229B}",
    "ocir;":                            "\u{0000229A}",
    "ocirc;":                           "\u{000000F4}",
    "ocy;":                             "\u{0000043E}",
    "odash;":                           "\u{0000229D}",
    "odblac;":                          "\u{00000151}",
    "odiv;":                            "\u{00002A38}",
    "odot;":                            "\u{00002299}",
    "odsold;":                          "\u{000029BC}",
    "oelig;":                           "\u{00000153}",
    "ofcir;":                           "\u{000029BF}",
    "ofr;":                             "\u{0001D52C}",
    "ogon;":                            "\u{000002DB}",
    "ograve;":                          "\u{000000F2}",
    "ogt;":                             "\u{000029C1}",
    "ohbar;":                           "\u{000029B5}",
    "ohm;":                             "\u{000003A9}",
    "oint;":                            "\u{0000222E}",
    "olarr;":                           "\u{000021BA}",
    "olcir;":                           "\u{000029BE}",
    "olcross;":                         "\u{000029BB}",
    "oline;":                           "\u{0000203E}",
    "olt;":                             "\u{000029C0}",
    "omacr;":                           "\u{0000014D}",
    "omega;":                           "\u{000003C9}",
    "omicron;":                         "\u{000003BF}",
    "omid;":                            "\u{000029B6}",
    "ominus;":                          "\u{00002296}",
    "oopf;":                            "\u{0001D560}",
    "opar;":                            "\u{000029B7}",
    "operp;":                           "\u{000029B9}",
    "oplus;":                           "\u{00002295}",
    "or;":                              "\u{00002228}",
    "orarr;":                           "\u{000021BB}",
    "ord;":                             "\u{00002A5D}",
    "order;":                           "\u{00002134}",
    "orderof;":                         "\u{00002134}",
    "ordf;":                            "\u{000000AA}",
    "ordm;":                            "\u{000000BA}",
    "origof;":                          "\u{000022B6}",
    "oror;":                            "\u{00002A56}",
    "orslope;":                         "\u{00002A57}",
    "orv;":                             "\u{00002A5B}",
    "oscr;":                            "\u{00002134}",
    "oslash;":                          "\u{000000F8}",
    "osol;":                            "\u{00002298}",
    "otilde;":                          "\u{000000F5}",
    "otimes;":                          "\u{00002297}",
    "otimesas;":                        "\u{00002A36}",
    "ouml;":                            "\u{000000F6}",
    "ovbar;":                           "\u{0000233D}",
    "par;":                             "\u{00002225}",
    "para;":                            "\u{000000B6}",
    "parallel;":                        "\u{00002225}",
    "parsim;":                          "\u{00002AF3}",
    "parsl;":                           "\u{00002AFD}",
    "part;":                            "\u{00002202}",
    "pcy;":                             "\u{0000043F}",
    "percnt;":                          "\u{00000025}",
    "period;":                          "\u{0000002E}",
    "permil;":                          "\u{00002030}",
    "perp;":                            "\u{000022A5}",
    "pertenk;":                         "\u{00002031}",
    "pfr;":                             "\u{0001D52D}",
    "phi;":                             "\u{000003C6}",
    "phiv;":                            "\u{000003D5}",
    "phmmat;":                          "\u{00002133}",
    "phone;":                           "\u{0000260E}",
    "pi;":                              "\u{000003C0}",
    "pitchfork;":                       "\u{000022D4}",
    "piv;":                             "\u{000003D6}",
    "planck;":                          "\u{0000210F}",
    "planckh;":                         "\u{0000210E}",
    "plankv;":                          "\u{0000210F}",
    "plus;":                            "\u{0000002B}",
    "plusacir;":                        "\u{00002A23}",
    "plusb;":                           "\u{0000229E}",
    "pluscir;":                         "\u{00002A22}",
    "plusdo;":                          "\u{00002214}",
    "plusdu;":                          "\u{00002A25}",
    "pluse;":                           "\u{00002A72}",
    "plusmn;":                          "\u{000000B1}",
    "plussim;":                         "\u{00002A26}",
    "plustwo;":                         "\u{00002A27}",
    "pm;":                              "\u{000000B1}",
    "pointint;":                        "\u{00002A15}",
    "popf;":                            "\u{0001D561}",
    "pound;":                           "\u{000000A3}",
    "pr;":                              "\u{0000227A}",
    "prE;":                             "\u{00002AB3}",
    "prap;":                            "\u{00002AB7}",
    "prcue;":                           "\u{0000227C}",
    "pre;":                             "\u{00002AAF}",
    "prec;":                            "\u{0000227A}",
    "precapprox;":                      "\u{00002AB7}",
    "preccurlyeq;":                     "\u{0000227C}",
    "preceq;":                          "\u{00002AAF}",
    "precnapprox;":                     "\u{00002AB9}",
    "precneqq;":                        "\u{00002AB5}",
    "precnsim;":                        "\u{000022E8}",
    "precsim;":                         "\u{0000227E}",
    "prime;":                           "\u{00002032}",
    "primes;":                          "\u{00002119}",
    "prnE;":                            "\u{00002AB5}",
    "prnap;":                           "\u{00002AB9}",
    "prnsim;":                          "\u{000022E8}",
    "prod;":                            "\u{0000220F}",
    "profalar;":                        "\u{0000232E}",
    "profline;":                        "\u{00002312}",
    "profsurf;":                        "\u{00002313}",
    "prop;":                            "\u{0000221D}",
    "propto;":                          "\u{0000221D}",
    "prsim;":                           "\u{0000227E}",
    "prurel;":                          "\u{000022B0}",
    "pscr;":                            "\u{0001D4C5}",
    "psi;":                             "\u{000003C8}",
    "puncsp;":                          "\u{00002008}",
    "qfr;":                             "\u{0001D52E}",
    "qint;":                            "\u{00002A0C}",
    "qopf;":                            "\u{0001D562}",
    "qprime;":                          "\u{00002057}",
    "qscr;":                            "\u{0001D4C6}",
    "quaternions;":                     "\u{0000210D}",
    "quatint;":                         "\u{00002A16}",
    "quest;":                           "\u{0000003F}",
    "questeq;":                         "\u{0000225F}",
    "quot;":                            "\u{00000022}",
    "rAarr;":                           "\u{000021DB}",
    "rArr;":                            "\u{000021D2}",
    "rAtail;":                          "\u{0000291C}",
    "rBarr;":                           "\u{0000290F}",
    "rHar;":                            "\u{00002964}",
    "racute;":                          "\u{00000155}",
    "radic;":                           "\u{0000221A}",
    "raemptyv;":                        "\u{000029B3}",
    "rang;":                            "\u{000027E9}",
    "rangd;":                           "\u{00002992}",
    "range;":                           "\u{000029A5}",
    "rangle;":                          "\u{000027E9}",
    "raquo;":                           "\u{000000BB}",
    "rarr;":                            "\u{00002192}",
    "rarrap;":                          "\u{00002975}",
    "rarrb;":                           "\u{000021E5}",
    "rarrbfs;":                         "\u{00002920}",
    "rarrc;":                           "\u{00002933}",
    "rarrfs;":                          "\u{0000291E}",
    "rarrhk;":                          "\u{000021AA}",
    "rarrlp;":                          "\u{000021AC}",
    "rarrpl;":                          "\u{00002945}",
    "rarrsim;":                         "\u{00002974}",
    "rarrtl;":                          "\u{000021A3}",
    "rarrw;":                           "\u{0000219D}",
    "ratail;":                          "\u{0000291A}",
    "ratio;":                           "\u{00002236}",
    "rationals;":                       "\u{0000211A}",
    "rbarr;":                           "\u{0000290D}",
    "rbbrk;":                           "\u{00002773}",
    "rbrace;":                          "\u{0000007D}",
    "rbrack;":                          "\u{0000005D}",
    "rbrke;":                           "\u{0000298C}",
    "rbrksld;":                         "\u{0000298E}",
    "rbrkslu;":                         "\u{00002990}",
    "rcaron;":                          "\u{00000159}",
    "rcedil;":                          "\u{00000157}",
    "rceil;":                           "\u{00002309}",
    "rcub;":                            "\u{0000007D}",
    "rcy;":                             "\u{00000440}",
    "rdca;":                            "\u{00002937}",
    "rdldhar;":                         "\u{00002969}",
    "rdquo;":                           "\u{0000201D}",
    "rdquor;":                          "\u{0000201D}",
    "rdsh;":                            "\u{000021B3}",
    "real;":                            "\u{0000211C}",
    "realine;":                         "\u{0000211B}",
    "realpart;":                        "\u{0000211C}",
    "reals;":                           "\u{0000211D}",
    "rect;":                            "\u{000025AD}",
    "reg;":                             "\u{000000AE}",
    "rfisht;":                          "\u{0000297D}",
    "rfloor;":                          "\u{0000230B}",
    "rfr;":                             "\u{0001D52F}",
    "rhard;":                           "\u{000021C1}",
    "rharu;":                           "\u{000021C0}",
    "rharul;":                          "\u{0000296C}",
    "rho;":                             "\u{000003C1}",
    "rhov;":                            "\u{000003F1}",
    "rightarrow;":                      "\u{00002192}",
    "rightarrowtail;":                  "\u{000021A3}",
    "rightharpoondown;":                "\u{000021C1}",
    "rightharpoonup;":                  "\u{000021C0}",
    "rightleftarrows;":                 "\u{000021C4}",
    "rightleftharpoons;":               "\u{000021CC}",
    "rightrightarrows;":                "\u{000021C9}",
    "rightsquigarrow;":                 "\u{0000219D}",
    "rightthreetimes;":                 "\u{000022CC}",
    "ring;":                            "\u{000002DA}",
    "risingdotseq;":                    "\u{00002253}",
    "rlarr;":                           "\u{000021C4}",
    "rlhar;":                           "\u{000021CC}",
    "rlm;":                             "\u{0000200F}",
    "rmoust;":                          "\u{000023B1}",
    "rmoustache;":                      "\u{000023B1}",
    "rnmid;":                           "\u{00002AEE}",
    "roang;":                           "\u{000027ED}",
    "roarr;":                           "\u{000021FE}",
    "robrk;":                           "\u{000027E7}",
    "ropar;":                           "\u{00002986}",
    "ropf;":                            "\u{0001D563}",
    "roplus;":                          "\u{00002A2E}",
    "rotimes;":                         "\u{00002A35}",
    "rpar;":                            "\u{00000029}",
    "rpargt;":                          "\u{00002994}",
    "rppolint;":                        "\u{00002A12}",
    "rrarr;":                           "\u{000021C9}",
    "rsaquo;":                          "\u{0000203A}",
    "rscr;":                            "\u{0001D4C7}",
    "rsh;":                             "\u{000021B1}",
    "rsqb;":                            "\u{0000005D}",
    "rsquo;":                           "\u{00002019}",
    "rsquor;":                          "\u{00002019}",
    "rthree;":                          "\u{000022CC}",
    "rtimes;":                          "\u{000022CA}",
    "rtri;":                            "\u{000025B9}",
    "rtrie;":                           "\u{000022B5}",
    "rtrif;":                           "\u{000025B8}",
    "rtriltri;":                        "\u{000029CE}",
    "ruluhar;":                         "\u{00002968}",
    "rx;":                              "\u{0000211E}",
    "sacute;":                          "\u{0000015B}",
    "sbquo;":                           "\u{0000201A}",
    "sc;":                              "\u{0000227B}",
    "scE;":                             "\u{00002AB4}",
    "scap;":                            "\u{00002AB8}",
    "scaron;":                          "\u{00000161}",
    "sccue;":                           "\u{0000227D}",
    "sce;":                             "\u{00002AB0}",
    "scedil;":                          "\u{0000015F}",
    "scirc;":                           "\u{0000015D}",
    "scnE;":                            "\u{00002AB6}",
    "scnap;":                           "\u{00002ABA}",
    "scnsim;":                          "\u{000022E9}",
    "scpolint;":                        "\u{00002A13}",
    "scsim;":                           "\u{0000227F}",
    "scy;":                             "\u{00000441}",
    "sdot;":                            "\u{000022C5}",
    "sdotb;":                           "\u{000022A1}",
    "sdote;":                           "\u{00002A66}",
    "seArr;":                           "\u{000021D8}",
    "searhk;":                          "\u{00002925}",
    "searr;":                           "\u{00002198}",
    "searrow;":                         "\u{00002198}",
    "sect;":                            "\u{000000A7}",
    "semi;":                            "\u{0000003B}",
    "seswar;":                          "\u{00002929}",
    "setminus;":                        "\u{00002216}",
    "setmn;":                           "\u{00002216}",
    "sext;":                            "\u{00002736}",
    "sfr;":                             "\u{0001D530}",
    "sfrown;":                          "\u{00002322}",
    "sharp;":                           "\u{0000266F}",
    "shchcy;":                          "\u{00000449}",
    "shcy;":                            "\u{00000448}",
    "shortmid;":                        "\u{00002223}",
    "shortparallel;":                   "\u{00002225}",
    "shy;":                             "\u{000000AD}",
    "sigma;":                           "\u{000003C3}",
    "sigmaf;":                          "\u{000003C2}",
    "sigmav;":                          "\u{000003C2}",
    "sim;":                             "\u{0000223C}",
    "simdot;":                          "\u{00002A6A}",
    "sime;":                            "\u{00002243}",
    "simeq;":                           "\u{00002243}",
    "simg;":                            "\u{00002A9E}",
    "simgE;":                           "\u{00002AA0}",
    "siml;":                            "\u{00002A9D}",
    "simlE;":                           "\u{00002A9F}",
    "simne;":                           "\u{00002246}",
    "simplus;":                         "\u{00002A24}",
    "simrarr;":                         "\u{00002972}",
    "slarr;":                           "\u{00002190}",
    "smallsetminus;":                   "\u{00002216}",
    "smashp;":                          "\u{00002A33}",
    "smeparsl;":                        "\u{000029E4}",
    "smid;":                            "\u{00002223}",
    "smile;":                           "\u{00002323}",
    "smt;":                             "\u{00002AAA}",
    "smte;":                            "\u{00002AAC}",
    "softcy;":                          "\u{0000044C}",
    "sol;":                             "\u{0000002F}",
    "solb;":                            "\u{000029C4}",
    "solbar;":                          "\u{0000233F}",
    "sopf;":                            "\u{0001D564}",
    "spades;":                          "\u{00002660}",
    "spadesuit;":                       "\u{00002660}",
    "spar;":                            "\u{00002225}",
    "sqcap;":                           "\u{00002293}",
    "sqcup;":                           "\u{00002294}",
    "sqsub;":                           "\u{0000228F}",
    "sqsube;":                          "\u{00002291}",
    "sqsubset;":                        "\u{0000228F}",
    "sqsubseteq;":                      "\u{00002291}",
    "sqsup;":                           "\u{00002290}",
    "sqsupe;":                          "\u{00002292}",
    "sqsupset;":                        "\u{00002290}",
    "sqsupseteq;":                      "\u{00002292}",
    "squ;":                             "\u{000025A1}",
    "square;":                          "\u{000025A1}",
    "squarf;":                          "\u{000025AA}",
    "squf;":                            "\u{000025AA}",
    "srarr;":                           "\u{00002192}",
    "sscr;":                            "\u{0001D4C8}",
    "ssetmn;":                          "\u{00002216}",
    "ssmile;":                          "\u{00002323}",
    "sstarf;":                          "\u{000022C6}",
    "star;":                            "\u{00002606}",
    "starf;":                           "\u{00002605}",
    "straightepsilon;":                 "\u{000003F5}",
    "straightphi;":                     "\u{000003D5}",
    "strns;":                           "\u{000000AF}",
    "sub;":                             "\u{00002282}",
    "subE;":                            "\u{00002AC5}",
    "subdot;":                          "\u{00002ABD}",
    "sube;":                            "\u{00002286}",
    "subedot;":                         "\u{00002AC3}",
    "submult;":                         "\u{00002AC1}",
    "subnE;":                           "\u{00002ACB}",
    "subne;":                           "\u{0000228A}",
    "subplus;":                         "\u{00002ABF}",
    "subrarr;":                         "\u{00002979}",
    "subset;":                          "\u{00002282}",
    "subseteq;":                        "\u{00002286}",
    "subseteqq;":                       "\u{00002AC5}",
    "subsetneq;":                       "\u{0000228A}",
    "subsetneqq;":                      "\u{00002ACB}",
    "subsim;":                          "\u{00002AC7}",
    "subsub;":                          "\u{00002AD5}",
    "subsup;":                          "\u{00002AD3}",
    "succ;":                            "\u{0000227B}",
    "succapprox;":                      "\u{00002AB8}",
    "succcurlyeq;":                     "\u{0000227D}",
    "succeq;":                          "\u{00002AB0}",
    "succnapprox;":                     "\u{00002ABA}",
    "succneqq;":                        "\u{00002AB6}",
    "succnsim;":                        "\u{000022E9}",
    "succsim;":                         "\u{0000227F}",
    "sum;":                             "\u{00002211}",
    "sung;":                            "\u{0000266A}",
    "sup;":                             "\u{00002283}",
    "sup1;":                            "\u{000000B9}",
    "sup2;":                            "\u{000000B2}",
    "sup3;":                            "\u{000000B3}",
    "supE;":                            "\u{00002AC6}",
    "supdot;":                          "\u{00002ABE}",
    "supdsub;":                         "\u{00002AD8}",
    "supe;":                            "\u{00002287}",
    "supedot;":                         "\u{00002AC4}",
    "suphsol;":                         "\u{000027C9}",
    "suphsub;":                         "\u{00002AD7}",
    "suplarr;":                         "\u{0000297B}",
    "supmult;":                         "\u{00002AC2}",
    "supnE;":                           "\u{00002ACC}",
    "supne;":                           "\u{0000228B}",
    "supplus;":                         "\u{00002AC0}",
    "supset;":                          "\u{00002283}",
    "supseteq;":                        "\u{00002287}",
    "supseteqq;":                       "\u{00002AC6}",
    "supsetneq;":                       "\u{0000228B}",
    "supsetneqq;":                      "\u{00002ACC}",
    "supsim;":                          "\u{00002AC8}",
    "supsub;":                          "\u{00002AD4}",
    "supsup;":                          "\u{00002AD6}",
    "swArr;":                           "\u{000021D9}",
    "swarhk;":                          "\u{00002926}",
    "swarr;":                           "\u{00002199}",
    "swarrow;":                         "\u{00002199}",
    "swnwar;":                          "\u{0000292A}",
    "szlig;":                           "\u{000000DF}",
    "target;":                          "\u{00002316}",
    "tau;":                             "\u{000003C4}",
    "tbrk;":                            "\u{000023B4}",
    "tcaron;":                          "\u{00000165}",
    "tcedil;":                          "\u{00000163}",
    "tcy;":                             "\u{00000442}",
    "tdot;":                            "\u{000020DB}",
    "telrec;":                          "\u{00002315}",
    "tfr;":                             "\u{0001D531}",
    "there4;":                          "\u{00002234}",
    "therefore;":                       "\u{00002234}",
    "theta;":                           "\u{000003B8}",
    "thetasym;":                        "\u{000003D1}",
    "thetav;":                          "\u{000003D1}",
    "thickapprox;":                     "\u{00002248}",
    "thicksim;":                        "\u{0000223C}",
    "thinsp;":                          "\u{00002009}",
    "thkap;":                           "\u{00002248}",
    "thksim;":                          "\u{0000223C}",
    "thorn;":                           "\u{000000FE}",
    "tilde;":                           "\u{000002DC}",
    "times;":                           "\u{000000D7}",
    "timesb;":                          "\u{000022A0}",
    "timesbar;":                        "\u{00002A31}",
    "timesd;":                          "\u{00002A30}",
    "tint;":                            "\u{0000222D}",
    "toea;":                            "\u{00002928}",
    "top;":                             "\u{000022A4}",
    "topbot;":                          "\u{00002336}",
    "topcir;":                          "\u{00002AF1}",
    "topf;":                            "\u{0001D565}",
    "topfork;":                         "\u{00002ADA}",
    "tosa;":                            "\u{00002929}",
    "tprime;":                          "\u{00002034}",
    "trade;":                           "\u{00002122}",
    "triangle;":                        "\u{000025B5}",
    "triangledown;":                    "\u{000025BF}",
    "triangleleft;":                    "\u{000025C3}",
    "trianglelefteq;":                  "\u{000022B4}",
    "triangleq;":                       "\u{0000225C}",
    "triangleright;":                   "\u{000025B9}",
    "trianglerighteq;":                 "\u{000022B5}",
    "tridot;":                          "\u{000025EC}",
    "trie;":                            "\u{0000225C}",
    "triminus;":                        "\u{00002A3A}",
    "triplus;":                         "\u{00002A39}",
    "trisb;":                           "\u{000029CD}",
    "tritime;":                         "\u{00002A3B}",
    "trpezium;":                        "\u{000023E2}",
    "tscr;":                            "\u{0001D4C9}",
    "tscy;":                            "\u{00000446}",
    "tshcy;":                           "\u{0000045B}",
    "tstrok;":                          "\u{00000167}",
    "twixt;":                           "\u{0000226C}",
    "twoheadleftarrow;":                "\u{0000219E}",
    "twoheadrightarrow;":               "\u{000021A0}",
    "uArr;":                            "\u{000021D1}",
    "uHar;":                            "\u{00002963}",
    "uacute;":                          "\u{000000FA}",
    "uarr;":                            "\u{00002191}",
    "ubrcy;":                           "\u{0000045E}",
    "ubreve;":                          "\u{0000016D}",
    "ucirc;":                           "\u{000000FB}",
    "ucy;":                             "\u{00000443}",
    "udarr;":                           "\u{000021C5}",
    "udblac;":                          "\u{00000171}",
    "udhar;":                           "\u{0000296E}",
    "ufisht;":                          "\u{0000297E}",
    "ufr;":                             "\u{0001D532}",
    "ugrave;":                          "\u{000000F9}",
    "uharl;":                           "\u{000021BF}",
    "uharr;":                           "\u{000021BE}",
    "uhblk;":                           "\u{00002580}",
    "ulcorn;":                          "\u{0000231C}",
    "ulcorner;":                        "\u{0000231C}",
    "ulcrop;":                          "\u{0000230F}",
    "ultri;":                           "\u{000025F8}",
    "umacr;":                           "\u{0000016B}",
    "uml;":                             "\u{000000A8}",
    "uogon;":                           "\u{00000173}",
    "uopf;":                            "\u{0001D566}",
    "uparrow;":                         "\u{00002191}",
    "updownarrow;":                     "\u{00002195}",
    "upharpoonleft;":                   "\u{000021BF}",
    "upharpoonright;":                  "\u{000021BE}",
    "uplus;":                           "\u{0000228E}",
    "upsi;":                            "\u{000003C5}",
    "upsih;":                           "\u{000003D2}",
    "upsilon;":                         "\u{000003C5}",
    "upuparrows;":                      "\u{000021C8}",
    "urcorn;":                          "\u{0000231D}",
    "urcorner;":                        "\u{0000231D}",
    "urcrop;":                          "\u{0000230E}",
    "uring;":                           "\u{0000016F}",
    "urtri;":                           "\u{000025F9}",
    "uscr;":                            "\u{0001D4CA}",
    "utdot;":                           "\u{000022F0}",
    "utilde;":                          "\u{00000169}",
    "utri;":                            "\u{000025B5}",
    "utrif;":                           "\u{000025B4}",
    "uuarr;":                           "\u{000021C8}",
    "uuml;":                            "\u{000000FC}",
    "uwangle;":                         "\u{000029A7}",
    "vArr;":                            "\u{000021D5}",
    "vBar;":                            "\u{00002AE8}",
    "vBarv;":                           "\u{00002AE9}",
    "vDash;":                           "\u{000022A8}",
    "vangrt;":                          "\u{0000299C}",
    "varepsilon;":                      "\u{000003F5}",
    "varkappa;":                        "\u{000003F0}",
    "varnothing;":                      "\u{00002205}",
    "varphi;":                          "\u{000003D5}",
    "varpi;":                           "\u{000003D6}",
    "varpropto;":                       "\u{0000221D}",
    "varr;":                            "\u{00002195}",
    "varrho;":                          "\u{000003F1}",
    "varsigma;":                        "\u{000003C2}",
    "vartheta;":                        "\u{000003D1}",
    "vartriangleleft;":                 "\u{000022B2}",
    "vartriangleright;":                "\u{000022B3}",
    "vcy;":                             "\u{00000432}",
    "vdash;":                           "\u{000022A2}",
    "vee;":                             "\u{00002228}",
    "veebar;":                          "\u{000022BB}",
    "veeeq;":                           "\u{0000225A}",
    "vellip;":                          "\u{000022EE}",
    "verbar;":                          "\u{0000007C}",
    "vert;":                            "\u{0000007C}",
    "vfr;":                             "\u{0001D533}",
    "vltri;":                           "\u{000022B2}",
    "vopf;":                            "\u{0001D567}",
    "vprop;":                           "\u{0000221D}",
    "vrtri;":                           "\u{000022B3}",
    "vscr;":                            "\u{0001D4CB}",
    "vzigzag;":                         "\u{0000299A}",
    "wcirc;":                           "\u{00000175}",
    "wedbar;":                          "\u{00002A5F}",
    "wedge;":                           "\u{00002227}",
    "wedgeq;":                          "\u{00002259}",
    "weierp;":                          "\u{00002118}",
    "wfr;":                             "\u{0001D534}",
    "wopf;":                            "\u{0001D568}",
    "wp;":                              "\u{00002118}",
    "wr;":                              "\u{00002240}",
    "wreath;":                          "\u{00002240}",
    "wscr;":                            "\u{0001D4CC}",
    "xcap;":                            "\u{000022C2}",
    "xcirc;":                           "\u{000025EF}",
    "xcup;":                            "\u{000022C3}",
    "xdtri;":                           "\u{000025BD}",
    "xfr;":                             "\u{0001D535}",
    "xhArr;":                           "\u{000027FA}",
    "xharr;":                           "\u{000027F7}",
    "xi;":                              "\u{000003BE}",
    "xlArr;":                           "\u{000027F8}",
    "xlarr;":                           "\u{000027F5}",
    "xmap;":                            "\u{000027FC}",
    "xnis;":                            "\u{000022FB}",
    "xodot;":                           "\u{00002A00}",
    "xopf;":                            "\u{0001D569}",
    "xoplus;":                          "\u{00002A01}",
    "xotime;":                          "\u{00002A02}",
    "xrArr;":                           "\u{000027F9}",
    "xrarr;":                           "\u{000027F6}",
    "xscr;":                            "\u{0001D4CD}",
    "xsqcup;":                          "\u{00002A06}",
    "xuplus;":                          "\u{00002A04}",
    "xutri;":                           "\u{000025B3}",
    "xvee;":                            "\u{000022C1}",
    "xwedge;":                          "\u{000022C0}",
    "yacute;":                          "\u{000000FD}",
    "yacy;":                            "\u{0000044F}",
    "ycirc;":                           "\u{00000177}",
    "ycy;":                             "\u{0000044B}",
    "yen;":                             "\u{000000A5}",
    "yfr;":                             "\u{0001D536}",
    "yicy;":                            "\u{00000457}",
    "yopf;":                            "\u{0001D56A}",
    "yscr;":                            "\u{0001D4CE}",
    "yucy;":                            "\u{0000044E}",
    "yuml;":                            "\u{000000FF}",
    "zacute;":                          "\u{0000017A}",
    "zcaron;":                          "\u{0000017E}",
    "zcy;":                             "\u{00000437}",
    "zdot;":                            "\u{0000017C}",
    "zeetrf;":                          "\u{00002128}",
    "zeta;":                            "\u{000003B6}",
    "zfr;":                             "\u{0001D537}",
    "zhcy;":                            "\u{00000436}",
    "zigrarr;":                         "\u{000021DD}",
    "zopf;":                            "\u{0001D56B}",
    "zscr;":                            "\u{0001D4CF}",
    "zwj;":                             "\u{0000200D}",
    "zwnj;":                            "\u{0000200C}",
    "AElig":                            "\u{000000C6}",
    "AMP":                              "\u{00000026}",
    "Aacute":                           "\u{000000C1}",
    "Acirc":                            "\u{000000C2}",
    "Agrave":                           "\u{000000C0}",
    "Aring":                            "\u{000000C5}",
    "Atilde":                           "\u{000000C3}",
    "Auml":                             "\u{000000C4}",
    "COPY":                             "\u{000000A9}",
    "Ccedil":                           "\u{000000C7}",
    "ETH":                              "\u{000000D0}",
    "Eacute":                           "\u{000000C9}",
    "Ecirc":                            "\u{000000CA}",
    "Egrave":                           "\u{000000C8}",
    "Euml":                             "\u{000000CB}",
    "GT":                               "\u{0000003E}",
    "Iacute":                           "\u{000000CD}",
    "Icirc":                            "\u{000000CE}",
    "Igrave":                           "\u{000000CC}",
    "Iuml":                             "\u{000000CF}",
    "LT":                               "\u{0000003C}",
    "Ntilde":                           "\u{000000D1}",
    "Oacute":                           "\u{000000D3}",
    "Ocirc":                            "\u{000000D4}",
    "Ograve":                           "\u{000000D2}",
    "Oslash":                           "\u{000000D8}",
    "Otilde":                           "\u{000000D5}",
    "Ouml":                             "\u{000000D6}",
    "QUOT":                             "\u{00000022}",
    "REG":                              "\u{000000AE}",
    "THORN":                            "\u{000000DE}",
    "Uacute":                           "\u{000000DA}",
    "Ucirc":                            "\u{000000DB}",
    "Ugrave":                           "\u{000000D9}",
    "Uuml":                             "\u{000000DC}",
    "Yacute":                           "\u{000000DD}",
    "aacute":                           "\u{000000E1}",
    "acirc":                            "\u{000000E2}",
    "acute":                            "\u{000000B4}",
    "aelig":                            "\u{000000E6}",
    "agrave":                           "\u{000000E0}",
    "amp":                              "\u{00000026}",
    "aring":                            "\u{000000E5}",
    "atilde":                           "\u{000000E3}",
    "auml":                             "\u{000000E4}",
    "brvbar":                           "\u{000000A6}",
    "ccedil":                           "\u{000000E7}",
    "cedil":                            "\u{000000B8}",
    "cent":                             "\u{000000A2}",
    "copy":                             "\u{000000A9}",
    "curren":                           "\u{000000A4}",
    "deg":                              "\u{000000B0}",
    "divide":                           "\u{000000F7}",
    "eacute":                           "\u{000000E9}",
    "ecirc":                            "\u{000000EA}",
    "egrave":                           "\u{000000E8}",
    "eth":                              "\u{000000F0}",
    "euml":                             "\u{000000EB}",
    "frac12":                           "\u{000000BD}",
    "frac14":                           "\u{000000BC}",
    "frac34":                           "\u{000000BE}",
    "gt":                               "\u{0000003E}",
    "iacute":                           "\u{000000ED}",
    "icirc":                            "\u{000000EE}",
    "iexcl":                            "\u{000000A1}",
    "igrave":                           "\u{000000EC}",
    "iquest":                           "\u{000000BF}",
    "iuml":                             "\u{000000EF}",
    "laquo":                            "\u{000000AB}",
    "lt":                               "\u{0000003C}",
    "macr":                             "\u{000000AF}",
    "micro":                            "\u{000000B5}",
    "middot":                           "\u{000000B7}",
    "nbsp":                             "\u{000000A0}",
    "not":                              "\u{000000AC}",
    "ntilde":                           "\u{000000F1}",
    "oacute":                           "\u{000000F3}",
    "ocirc":                            "\u{000000F4}",
    "ograve":                           "\u{000000F2}",
    "ordf":                             "\u{000000AA}",
    "ordm":                             "\u{000000BA}",
    "oslash":                           "\u{000000F8}",
    "otilde":                           "\u{000000F5}",
    "ouml":                             "\u{000000F6}",
    "para":                             "\u{000000B6}",
    "plusmn":                           "\u{000000B1}",
    "pound":                            "\u{000000A3}",
    "quot":                             "\u{00000022}",
    "raquo":                            "\u{000000BB}",
    "reg":                              "\u{000000AE}",
    "sect":                             "\u{000000A7}",
    "shy":                              "\u{000000AD}",
    "sup1":                             "\u{000000B9}",
    "sup2":                             "\u{000000B2}",
    "sup3":                             "\u{000000B3}",
    "szlig":                            "\u{000000DF}",
    "thorn":                            "\u{000000FE}",
    "times":                            "\u{000000D7}",
    "uacute":                           "\u{000000FA}",
    "ucirc":                            "\u{000000FB}",
    "ugrave":                           "\u{000000F9}",
    "uml":                              "\u{000000A8}",
    "uuml":                             "\u{000000FC}",
    "yacute":                           "\u{000000FD}",
    "yen":                              "\u{000000A5}",
    "yuml":                             "\u{000000FF}",
    "NotEqualTilde;":           "\u2242\u0338",
    "NotGreaterFullEqual;":     "\u2267\u0338",
    "NotGreaterGreater;":       "\u226B\u0338",
    "NotGreaterSlantEqual;":    "\u2A7E\u0338",
    "NotHumpDownHump;":         "\u224E\u0338",
    "NotHumpEqual;":            "\u224F\u0338",
    "NotLeftTriangleBar;":      "\u29CF\u0338",
    "NotLessLess;":             "\u226A\u0338",
    "NotLessSlantEqual;":       "\u2A7D\u0338",
    "NotNestedGreaterGreater;": "\u2AA2\u0338",
    "NotNestedLessLess;":       "\u2AA1\u0338",
    "NotPrecedesEqual;":        "\u2AAF\u0338",
    "NotRightTriangleBar;":     "\u29D0\u0338",
    "NotSquareSubset;":         "\u228F\u0338",
    "NotSquareSuperset;":       "\u2290\u0338",
    "NotSubset;":               "\u2282\u20D2",
    "NotSucceedsEqual;":        "\u2AB0\u0338",
    "NotSucceedsTilde;":        "\u227F\u0338",
    "NotSuperset;":             "\u2283\u20D2",
    "ThickSpace;":              "\u205F\u200A",
    "acE;":                     "\u223E\u0333",
    "bne;":                     "\u003D\u20E5",
    "bnequiv;":                 "\u2261\u20E5",
    "caps;":                    "\u2229\uFE00",
    "cups;":                    "\u222A\uFE00",
    "fjlig;":                   "\u0066\u006A",
    "gesl;":                    "\u22DB\uFE00",
    "gvertneqq;":               "\u2269\uFE00",
    "gvnE;":                    "\u2269\uFE00",
    "lates;":                   "\u2AAD\uFE00",
    "lesg;":                    "\u22DA\uFE00",
    "lvertneqq;":               "\u2268\uFE00",
    "lvnE;":                    "\u2268\uFE00",
    "nGg;":                     "\u22D9\u0338",
    "nGt;":                     "\u226B\u20D2",
    "nGtv;":                    "\u226B\u0338",
    "nLl;":                     "\u22D8\u0338",
    "nLt;":                     "\u226A\u20D2",
    "nLtv;":                    "\u226A\u0338",
    "nang;":                    "\u2220\u20D2",
    "napE;":                    "\u2A70\u0338",
    "napid;":                   "\u224B\u0338",
    "nbump;":                   "\u224E\u0338",
    "nbumpe;":                  "\u224F\u0338",
    "ncongdot;":                "\u2A6D\u0338",
    "nedot;":                   "\u2250\u0338",
    "nesim;":                   "\u2242\u0338",
    "ngE;":                     "\u2267\u0338",
    "ngeqq;":                   "\u2267\u0338",
    "ngeqslant;":               "\u2A7E\u0338",
    "nges;":                    "\u2A7E\u0338",
    "nlE;":                     "\u2266\u0338",
    "nleqq;":                   "\u2266\u0338",
    "nleqslant;":               "\u2A7D\u0338",
    "nles;":                    "\u2A7D\u0338",
    "notinE;":                  "\u22F9\u0338",
    "notindot;":                "\u22F5\u0338",
    "nparsl;":                  "\u2AFD\u20E5",
    "npart;":                   "\u2202\u0338",
    "npre;":                    "\u2AAF\u0338",
    "npreceq;":                 "\u2AAF\u0338",
    "nrarrc;":                  "\u2933\u0338",
    "nrarrw;":                  "\u219D\u0338",
    "nsce;":                    "\u2AB0\u0338",
    "nsubE;":                   "\u2AC5\u0338",
    "nsubset;":                 "\u2282\u20D2",
    "nsubseteqq;":              "\u2AC5\u0338",
    "nsucceq;":                 "\u2AB0\u0338",
    "nsupE;":                   "\u2AC6\u0338",
    "nsupset;":                 "\u2283\u20D2",
    "nsupseteqq;":              "\u2AC6\u0338",
    "nvap;":                    "\u224D\u20D2",
    "nvge;":                    "\u2265\u20D2",
    "nvgt;":                    "\u003E\u20D2",
    "nvle;":                    "\u2264\u20D2",
    "nvlt;":                    "\u003C\u20D2",
    "nvltrie;":                 "\u22B4\u20D2",
    "nvrtrie;":                 "\u22B5\u20D2",
    "nvsim;":                   "\u223C\u20D2",
    "race;":                    "\u223D\u0331",
    "smtes;":                   "\u2AAC\uFE00",
    "sqcaps;":                  "\u2293\uFE00",
    "sqcups;":                  "\u2294\uFE00",
    "varsubsetneq;":            "\u228A\uFE00",
    "varsubsetneqq;":           "\u2ACB\uFE00",
    "varsupsetneq;":            "\u228B\uFE00",
    "varsupsetneqq;":           "\u2ACC\uFE00",
    "vnsub;":                   "\u2282\u20D2",
    "vnsup;":                   "\u2283\u20D2",
    "vsubnE;":                  "\u2ACB\uFE00",
    "vsubne;":                  "\u228A\uFE00",
    "vsupnE;":                  "\u2ACC\uFE00",
    "vsupne;":                  "\u228B\uFE00"
  }, entity_re_g, escape_dict, escape_re_g;

  function escapeHtml(text) {
    if (escape_re_g === undefined) {
      (function () {
        escape_dict = XXXreverseKeyValues(entity_dict);
        // filter every chars in /^[\u0020-\u0025\u0027-\u007f]$/
        // spaces can be escaped to &nbsp; manually later if necessary
        //XXX WIP
      }());
    }
    return text.replace(escape_re_g, function (match) {
      return escape_dict[match];
    });
  }

  function unescapeHtml(html) {
    if (entity_re_g === undefined) {
      (function () {
        // /&(?:#(nnnn);|#x(hhhh);|(----------))/g
        var i = 1, entity_list = Object.keys(entity_dict),
            regexp_str = "&(?:#([0-9]{4});|#x([0-9a-fA-F]{4});|(";
        entity_list.sort().reverse();
        regexp_str += entity_list[0];
        for (; i < entity_list.length; i += 1) {
          regexp_str += "|" + entity_list[i];
        }
        regexp_str += "))";
        entity_re_g = new RegExp(regexp_str, "g");
      }());
    }
    return html.replace(entity_re_g, function (match, nnnn, hhhh, entity) {
      var tmp;
      if (nnnn) {  // &#nnnn;
        return String.fromCharCode(parseInt(nnnn, 10));
      } else if (hhhh) {  // &#xhhhh;
        return String.fromCharCode(parseInt(hhhh, 16));
      } else {
        return entity_dict[entity] || match;
      }
    });
  }

}());
(function envXmlrpc(env) {
  "use strict";

  /*! Copyright (c) 2017 Tristan Cavelier <t.cavelier@free.fr>
      This program is free software. It comes without any warranty, to
      the extent permitted by applicable law. You can redistribute it
      and/or modify it under the terms of the Do What The Fuck You Want
      To Public License, Version 2, as published by Sam Hocevar. See
      http://www.wtfpl.net/ for more details. */

  function escapeHtml(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function unescapeHtml(html) {
    return html.replace(/&quot;/g, '"').replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&amp;/g, "&");
  }
  function xmlrpcifyTextNode(text) {
    // text = "a<b>c"
    // return -> "a&lt;b&gt;c"
    if ((/[\u0080-\uffff]/).test(text)) {  // allows \x00 to \x7f
      throw new TypeError("Cannot convert non ascii string characters");
    }
    return escapeHtml(text);
  }

  function xmlrpcifyValue(value) {
    //   returns an xmlrpc serialized version of `value`
    // value = true
    // return -> "<boolean>1</boolean>"
    function rec(value, stack) {
      var i, key_list, result;
      if (typeof value === "string") {
        return "<string>" + xmlrpcifyTextNode(value) + "</string>";
      } else if (typeof value === "boolean") {
        return "<boolean>" + (value ? "1" : "0") + "</boolean>";
      } else if (typeof value === "number") {
        if (!isFinite(value)) {
          throw new TypeError("Cannot convert non finite number '" + value + "' to XML");
        } else if ((/e/i).test(value.toString())) {
          throw new TypeError("Cannot convert bad stringified number '" + value + "' to XML");
        } else if ((/\./).test(value.toString())) {
          return "<double>" + value + "</double>";
        }
        return "<int>" + value + "</int>";
      } else if (Array.isArray(value)) {
        if (stack.indexOf(value) !== -1) {
          throw new TypeError("Convertir circular structure to XML");
        }
        stack.push(value);
        result = "<array><data>\n";
        for (i = 0; i < value.length; i += 1) {
          result += "<value>" + rec(value[i], stack) + "</value>\n";
        }
        result += "</data></array>";
        stack.pop();
        return result;
      } else if (typeof value === "object") {
        if (value === null) {
          return "<nil/>";
        }
        if (stack.indexOf(value) !== -1) {
          throw new TypeError("Convertir circular structure to XML");
        }
        stack.push(value);
        key_list = Object.keys(value);
        result = "<struct>\n";
        for (i = 0; i < key_list.length; i += 1) {
          result += "<member>\n<name>" + xmlrpcifyTextNode(key_list[i]) + "</name>\n";
          result += "<value>" + rec(value[key_list[i]], stack) + "</value>\n</member>\n";
        }
        result += "</struct>";
        stack.pop();
        return result;
      }
      throw new TypeError("Converting unhandled value '" + value + "' to XML");
    }
    return rec(value, []);
  }

  function xmlrpcifyCall(method_name, parameter_list) {
    var i = 0, result = "<?xml version='1.0'?>\n<methodCall>\n<methodName>" +
        xmlrpcifyTextNode(method_name) +
        "</methodName>\n<params>\n";
    for (; i < parameter_list.length; i += 1) {
      result += "<param>\n<value>" + xmlrpcifyValue(parameter_list[i]) + "</value>\n</param>\n";
    }
    return result + "</params>\n</methodCall>\n";
  }

  function eatXmlrpcNil(raw_text, result_container) {
    var tmp = raw_text.length,
        text = raw_text.replace(/^\s*<nil\/>/i, "");
    if (tmp === text.length) {
      return raw_text;
    }
    result_container[0] = null;
    return text;
  }
  function eatXmlrpcString(raw_text, result_container) {
    var tmp = raw_text.length,
        text = raw_text.replace(/^\s*<string>/i, "");
    if (tmp === text.length) {
      return raw_text;
    }
    tmp = (/<\/string>/i).exec(text);
    if (tmp === null) {
      return raw_text;
    }
    result_container[0] = unescapeHtml(text.slice(0, tmp.index));
    return text.slice(tmp.index + tmp[0].length);
  }
  function eatXmlrpcBoolean(raw_text, result_container) {
    var tmp = (/^\s*<boolean>\s*([-\+]?[0-9]+)\s*<\/boolean>/i).exec(raw_text);
    if (tmp === null) {
      return raw_text;
    }
    result_container[0] = parseInt(tmp[1], 10) ? true : false;
    return raw_text.slice(tmp[0].length);
  }
  function eatXmlrpcInt(raw_text, result_container) {
    var tmp = (/^\s*<int>\s*([-\+]?[0-9]+)\s*<\/int>/i).exec(raw_text);
    if (tmp === null) {
      return raw_text;
    }
    result_container[0] = parseInt(tmp[1], 10);
    return raw_text.slice(tmp[0].length);
  }
  function eatXmlrpcDouble(raw_text, result_container) {
    var tmp = (/^\s*<double>\s*([-\+]?[0-9]+(\.[0-9]+)?)\s*<\/double>/i).exec(raw_text);
    if (tmp === null) {
      return raw_text;
    }
    result_container[0] = parseFloat(tmp[1]);
    return raw_text.slice(tmp[0].length);
  }
  function eatXmlrpcArray(raw_text, result_container) {
    var tmp = raw_text.length, tmp2, result = [],
        text = raw_text.replace(/^\s*<array>\s*<data>/i, "");
    if (tmp === text.length) {
      return raw_text;
    }
    for (;;) {
      tmp = text.length;
      text = eatXmlrpcValue(text, tmp2 = []);
      if (tmp === text.length) {
        break;
      }
      result.push(tmp2[0]);
    }
    tmp = text.length;
    text = text.replace(/^\s*<\/data>\s*<\/array>/i, "");
    if (tmp === text.length) return raw_text;
    result_container[0] = result;
    return text;
  }
  function eatXmlrpcStruct(raw_text, result_container) {
    var tmp = raw_text.length, tmp2, name, result = {},
        text = raw_text.replace(/^\s*<struct>/i, "");
    if (tmp === text.length) {
      return raw_text;
    }
    for (;;) {
      tmp = text.length;
      text = text.replace(/^\s*<member>\s*<name>/i, "");
      if (tmp === text.length) {
        break;
      }
      tmp = (/<\/name>/i).exec(text);
      if (tmp === null) {
        break;
      }
      name = unescapeHtml(text.slice(0, tmp.index));
      text = text.slice(tmp.index + tmp[0].length);
      tmp = text.length;
      text = eatXmlrpcValue(text, tmp2 = []);
      if (tmp === text.length) {
        break;
      }
      tmp = text.length;
      text = text.replace(/^\s*<\/member>/i, "");
      if (tmp === text.length) {
        break;
      }
      result[name] = tmp2[0];
    }
    tmp = text.length;
    text = text.replace(/^\s*<\/struct>/i, "");
    if (tmp === text.length) return raw_text;
    result_container[0] = result;
    return text;
  }
  function eatXmlrpcValue(raw_text, result_container) {
    var tmp = raw_text.length, tmp2 = [],
        text = raw_text.replace(/^\s*<value>/i, "");
    if (tmp === text.length) {
      return raw_text;
    }
    tmp = text.length;
    if ((((text = eatXmlrpcString(text, tmp2)) || true)  && tmp !== text.length) ||
        (((text = eatXmlrpcBoolean(text, tmp2)) || true) && tmp !== text.length) ||
        (((text = eatXmlrpcInt(text, tmp2)) || true)     && tmp !== text.length) ||
        (((text = eatXmlrpcDouble(text, tmp2)) || true)  && tmp !== text.length) ||
        (((text = eatXmlrpcNil(text, tmp2)) || true)     && tmp !== text.length) ||
        (((text = eatXmlrpcArray(text, tmp2)) || true)   && tmp !== text.length) ||
        (((text = eatXmlrpcStruct(text, tmp2)) || true)  && tmp !== text.length)) {
      tmp = text.length;
      text = text.replace(/^\s*<\/value>/i, "");
      if (tmp === text.length) {
        return raw_text;
      }
      result_container[0] = tmp2[0];
      return text;
    }
    return raw_text;
  }

  function parseXmlrpcResponse(raw_text) {
    var tmp = raw_text.length, tmp2, result_list = [];
    raw_text = raw_text.replace(/^<\?xml version='1\.0'\?>\s*<methodResponse>\s*<params>/i, "");
    if (tmp === raw_text.length) {
      throw new TypeError("Invalid xmlrpc method response");
    }
    for (;;) {
      tmp = raw_text.length;
      raw_text = raw_text.replace(/^\s*<param>/i, "");
      if (tmp === raw_text.length) {
        break;
      }
      tmp = raw_text.length;
      raw_text = eatXmlrpcValue(raw_text, tmp2 = []);
      if (tmp === raw_text.length) {
        break;
      }
      tmp = raw_text.length;
      raw_text = raw_text.replace(/^\s*<\/param>/i, "");
      if (tmp === raw_text.length) {
        break;
      }
      result_list.push(tmp2[0]);
    }
    tmp = raw_text.length;
    raw_text = raw_text.replace(/^\s*<\/params>\s*<\/methodResponse>\s*$/i, "");
    if (tmp === raw_text.length) {
      throw new TypeError("Invalid xmlrpc method response");
    }
    return result_list;
  }

}(this.env));
(function envDev(env) {
  "use strict";

  /*! Copyright (c) 2015-2016 Tristan Cavelier <t.cavelier@free.fr>
      This program is free software. It comes without any warranty, to
      the extent permitted by applicable law. You can redistribute it
      and/or modify it under the terms of the Do What The Fuck You Want
      To Public License, Version 2, as published by Sam Hocevar. See
      http://www.wtfpl.net/ for more details. */

  if (env.registerLib) env.registerLib(envDev);

  /*

  env.blackHoleWriter = {
    // acts like /dev/null in a unix system
    write: function () { return; },
    //readInto: function () { return env.newPromise(function () { return; }); },
    //read: function () { return env.newPromise(function () { return; }); },
  };

  function RangeReader(start, end, step) {
    //     RangeReader(end)
    //     RangeReader(start, end)
    //     RangeReader(start, end, step)
    if (end === undefined) {
      end = start;
      start = 0;
      step = 1;
    } else if (step === undefined) {
      step = 1;
    }
    this._start = start;
    this._end = end;
    this._step = step;
  }
  RangeReader.prototype.read = function () {
    var res = [], i = 0;
    for (; this._start < this._end; this._start += this._step) res[i++] = this._start;
    return res;
  };
  RangeReader.prototype.readInto = function (array, from, length) {
    if (from === undefined) from = 0;
    if (length === undefined) length = array.length - from;
    for (var i = 0; i < length && this._start < this._end; this._start += this._step, ++i) array[from++] = this._start;
    return i;
  };
  env.RangeReader = RangeReader;
  env.newRangeReader = function () { var c = env.RangeReader, o = Object.create(c.prototype); c.apply(o, arguments); return o; };

  function* range(start, end, step)
    //     range(end)
    //     range(start, end)
    //     range(start, end, step)
    if (end === undefined) {
      end = start;
      start = 0;
      step = 1;
    } else if (step === undefined) {
      step = 1;
    }
    for (; this._start < this._end; this._start += this._step) yield this._start;
  }

  */

  var raceWinOrCancelWithIndex = function (tasks) {
    // API stability level: 1 - Experimental
    var i, l = tasks.length, p = new Array(l), d = env.newDeferred();
    function solver(j) { return function (v) { return d.resolve({value: v, index: j}); }; }
    for (i = 0; i < l; i += 1) { p[i] = tasks[i] && typeof tasks[i].then === "function" ? tasks[i] : env.Promise.resolve(tasks[i]); }
    d.promise.cancel = function () { var j, v; for (j = 0; j < l; j += 1) { v = p[j]; if (v && typeof v.then === "function" && typeof v.cancel === "function") { v.cancel(); } } };
    d.promise.pause  = function () { var j, v; for (j = 0; j < l; j += 1) { v = p[j]; if (v && typeof v.then === "function" && typeof v.pause  === "function") { v.pause();  } } };
    d.promise.resume = function () { var j, v; for (j = 0; j < l; j += 1) { v = p[j]; if (v && typeof v.then === "function" && typeof v.resume === "function") { v.resume(); } } };
    d.promise.then(d.promise.cancel, d.promise.cancel);  // XXX cancel only loosers ? XXX is this cancel called in the next tick ?
    for (i = 0; i < l; i += 1) { p[i].then(solver(i), d.reject); }
    return d.promise;
  };
  var wait = function (task) {
    // API stability level: 1 - Experimental
    var d = env.newDeferred();
    d.promise.cancel = function () { d.reject("wait cancelled"); };
    task.then(d.resolve, d.reject);
    return d.promise;
  };

  var wm = {get: function (a) { return a; }, set: function () { return; }};
  function Queue() {
    // API stability level: 1 - Experimental
    wm.set(this, {});
    var it = wm.get(this), resolve, reject, g = it["[[Queue]]"] = [];
    function end(method, value) {
      it["[[QueueEnd]]"] = true;
      return method === 1 ? reject(value) : resolve(value);
    }
    function rec(method, prev) {
      if (g.length === 0) { return end(method, prev); }
      if (it["[[TaskCancelled]]"]) { g = new Error("queue cancelled"); return end(1, g); }
      if (it["[[TaskPaused]]"]) { return (it["[[TaskSubPromise]]"] = magicDeferred()).then(rec.bind(this, method, prev)); }
      var next;
      try { next = g.splice(0, 2)[method](prev); method = 0; }
      catch (e) { next = e; method = 1; }
      it["[[TaskSubPromise]]"] = next;
      if (it["[[TaskCancelled]]"] && next && typeof next.then === "function" && typeof next.cancel === "function") { try { next.cancel(); } catch (e) { return end(1, e); } }
      if (it["[[TaskPaused]]"] && next && typeof next.then === "function" && typeof next.pause === "function") { try { next.pause(); } catch (e) { return end(1, e); } }
      if (!next || typeof next.then !== "function") { next = method === 1 ? env.Promise.reject(next) : env.Promise.resolve(next); }
      return next.then(rec.bind(this, 0), rec.bind(this, 1));
    }
    it["[[TaskPromise]]"] = env.newPromise(function (res, rej) { resolve = res; reject = rej; });
    env.Promise.resolve(0).then(rec.bind(this));
  }
  //Queue.prototype = Object.create(Task.prototype);
  Queue.prototype.then = function () { var p = wm.get(this)["[[TaskPromise]]"]; return p.then.apply(p, arguments); };
  Queue.prototype.catch = function () { var p = wm.get(this)["[[TaskPromise]]"]; return p.catch.apply(p, arguments); };
  Queue.prototype.enqueue = function (onDone, onFail) {
    var it = wm.get(this);
    if (it["[[QueueEnd]]"]) { throw Error("queue ended"); }
    it["[[Queue]]"].push(onDone, onFail);
    return this;
  };
  env.Queue = Queue;
  env.newQueue = function () { var c = env.Queue, o = Object.create(c.prototype); c.apply(o, arguments); return o; };

  // We can imagine loop async function
  //function asyncDoWhile(callback, input) {
  //  // calls callback(input) until it returns a non positive value
  //  return new TaskThen(null, function () {
  //  //return new env.Queue().enqueue(function () {
  //    var q = new env.Queue();
  //    function loop(test) {
  //      if (!test) { return input; }
  //      q.enqueue(loop);
  //      return callback(input);
  //    }
  //    return q.enqueue(function () { return callback(input); }).enqueue(loop);
  //  });
  //}


  //function semaphoreFifoPush(sem, value) {
  //  var hik = "[[Semaphore:headIndex]]",
  //    hi = sem[hik] || 0,
  //    lk = "[[Semaphore:length]]",
  //    hk = "[[Semaphore:" + hi + "]]";
  //  sem[hk] = value;
  //  sem[hik] = hi + 1;
  //  sem[lk] = (sem[lk] || 0) + 1;
  //}
  //function semaphoreFifoPop(sem) {
  //  var v, tik = "[[Semaphore:tailIndex]]",
  //    ti = sem[tik] || 0,
  //    hi = sem["[[Semaphore:headIndex]]"] || 0,
  //    vk = "[[Semaphore:" + ti + "]]";
  //  if (ti < hi) {
  //    v = sem[vk];
  //    delete sem[vk];
  //    sem[tik] = ti + 1;
  //    sem["[[Semaphore:length]]"] -= 1;
  //    return v;
  //  }
  //}

  //function Semaphore(capacity) {
  //  this["[[Semaphore:capacity]]"] = typeof capacity === "number" || capacity > 0 ? capacity : 1;
  //  this["[[Semaphore:acquired]]"] = 0;
  //}
  //Semaphore.prototype.acquire = function () {
  //  if (++this["[[Semaphore:acquired]]"] <= this["[[Semaphore:capacity]]"]) { return Promise.resolve(); }
  //  var d = new Deferred();
  //  semaphoreFifoPush(this, d);
  //  return d.promise;
  //};
  //Semaphore.prototype.release = function () {
  //  if (this["[[Semaphore:acquired]]"] <= 0) { return; }
  //  this["[[Semaphore:acquired]]"] -= 1;
  //  var d = semaphoreFifoPop(this);
  //  if (d) { d.resolve(); }
  //};
  //Semaphore.prototype.getAcquiredAmount = function () {
  //  return this["[[Semaphore:acquired]]"] || 0;
  //};
  //env.Semaphore = Semaphore;
  //env.newSemaphore = function () { var c = env.Semaphore, o = Object.create(c.prototype); c.apply(o, arguments); return o; };


  //function idSemaphoreFifoPush(sem, type, value) {
  //  var hik = "[[IdSemaphore:" + type + ":headIndex]]",
  //    hi = sem[hik] || 0,
  //    lk = "[[IdSemaphore:" + type + ":length]]",
  //    hk = "[[IdSemaphore:" + type + ":" + hi + "]]";
  //  sem[hk] = value;
  //  sem[hik] = hi + 1;
  //  sem[lk] = (sem[lk] || 0) + 1;
  //}
  //function idSemaphoreFifoPop(sem, type) {
  //  var v, lk, tik = "[[IdSemaphore:" + type + ":tailIndex]]",
  //    ti = sem[tik] || 0,
  //    hik = "[[IdSemaphore:" + type + ":headIndex]]",
  //    hi = sem[hik] || 0,
  //    vk = "[[IdSemaphore:" + type + ":" + ti + "]]";
  //  if (ti < hi) {
  //    v = sem[vk];
  //    delete sem[vk];
  //    sem[tik] = ti + 1;
  //    lk = "[[IdSemaphore:" + type + ":length]]";
  //    sem[lk] -= 1;
  //    if (sem[lk] === 0) {
  //      delete sem[tik];
  //      delete sem[hik];
  //      delete sem[lk];
  //    }
  //    return v;
  //  }
  //}

  //function IdSemaphore(capacity) {
  //  this["[[IdSemaphore:capacity]]"] = typeof capacity === "number" || capacity > 0 ? capacity : 1;
  //}
  //IdSemaphore.prototype.acquire = function (id) {
  //  var ak = "[[IdSemaphore:" + id + ":acquired]]", d;
  //  if ((this[ak] = (this[ak] || 0) + 1) <= this["[[IdSemaphore:capacity]]"]) { return Promise.resolve(); }
  //  d = new Deferred();
  //  idSemaphoreFifoPush(this, id, d);
  //  return d.promise;
  //};
  //IdSemaphore.prototype.release = function (id) {
  //  var ak = "[[IdSemaphore:" + id + ":acquired]]", a = this[ak] || 0, d;
  //  if (a <= 0) { return; }
  //  if (a === 1) { delete this[ak]; }
  //  else { this[ak] -= 1; }
  //  d = idSemaphoreFifoPop(this);
  //  if (d) { d.resolve(); }
  //};
  //IdSemaphore.prototype.getAcquiredAmount = function (id) {
  //  return this["[[IdSemaphore:" + id + ":acquired]]"] || 0;
  //};
  //env.IdSemaphore = IdSemaphore;
  //env.newIdSemaphore = function () { var c = env.IdSemaphore, o = Object.create(c.prototype); c.apply(o, arguments); return o; };

}(this.env));
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
  function test(name, timeout, expected, testFn) {
    var res = [], timer;
    function end() {
      if (timer === undefined) {
        error("test: " + name);
        return error("`end` called twice");
      }
      timer = clearTimeout(timer);
      if (JSON.stringify(res) !== JSON.stringify(expected)) {
        error("test: " + name);
        error("result `" + JSON.stringify(res) + "` !== `" + JSON.stringify(expected) + "` expected");
      }
    }
    timer = setTimeout(function () {
      error("test: " + name);
      error("timeout ! result `" + JSON.stringify(res) + "` <-> `" + JSON.stringify(expected) + "` expected");
    }, timeout);
    setTimeout(function () { testFn(res, end); });
  }

  function sleep(ms) { return env.newPromise(function (resolve) { setTimeout(resolve, ms); }); }

  //////////////////////////////////////////////
  // Queue tests
  test("queue: should be enqueuable before next tick", 300, ["enqueued"], function (res, end) {
    var q = new env.Queue();
    q.enqueue(function () {
      res.push("enqueued");
      end();
    });
  });
  test("queue: cannot enqueue after fulfillment", 300, ["queue ended"], function (res, end) {
    var q = new env.Queue();
    q.then(function () {
      try {
        q.enqueue(function () { res.push("+ call !"); });
        res.push("queue enqueued");
      } catch (reason) { res.push(reason.message); }
    }).then().then(end);
  });

}(this.env));
