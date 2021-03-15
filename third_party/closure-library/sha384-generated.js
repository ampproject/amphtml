/* Generated from closure library version 20210202.0.0 */const window = {Uint8Array: Uint8Array};export const sha384 = (function(window){/*

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/
var k = this || self;
function l(a, b) {
  function e() {
  }
  e.prototype = b.prototype;
  a.D = b.prototype;
  a.prototype = new e;
  a.prototype.constructor = a;
  a.C = function(c, d, f) {
    for (var g = Array(arguments.length - 2), h = 2; h < arguments.length; h++) {
      g[h - 2] = arguments[h];
    }
    return b.prototype[d].apply(c, g);
  };
}
;function r() {
  this.j = -1;
}
;function t(a, b) {
  this.h = a | 0;
  this.g = b | 0;
}
function v(a) {
  return 4294967296 * a.g + (a.h >>> 0);
}
t.prototype.toString = function(a) {
  a = a || 10;
  if (2 > a || 36 < a) {
    throw Error("radix out of range: " + a);
  }
  var b = this.g >> 21;
  if (0 == b || -1 == b && (0 != this.h || -2097152 != this.g)) {
    return b = v(this), 10 == a ? "" + b : b.toString(a);
  }
  b = 14 - (a >> 2);
  var e = Math.pow(a, b), c = w(e, e / 4294967296);
  e = x(this, c);
  c = Math.abs(v(this.add(z(A(e, c)))));
  var d = 10 == a ? "" + c : c.toString(a);
  d.length < b && (d = "0000000000000".substr(d.length - b) + d);
  c = v(e);
  return (10 == a ? c : c.toString(a)) + d;
};
function B(a) {
  return 0 == a.h && 0 == a.g;
}
function C(a, b) {
  return a.h == b.h && a.g == b.g;
}
function D(a, b) {
  return a.g == b.g ? a.h == b.h ? 0 : a.h >>> 0 > b.h >>> 0 ? 1 : -1 : a.g > b.g ? 1 : -1;
}
function z(a) {
  var b = ~a.h + 1 | 0;
  return w(b, ~a.g + !b | 0);
}
t.prototype.add = function(a) {
  var b = this.g >>> 16, e = this.g & 65535, c = this.h >>> 16, d = a.g >>> 16, f = a.g & 65535, g = a.h >>> 16;
  a = (this.h & 65535) + (a.h & 65535);
  g = (a >>> 16) + (c + g);
  c = g >>> 16;
  c += e + f;
  b = (c >>> 16) + (b + d) & 65535;
  return w((g & 65535) << 16 | a & 65535, b << 16 | c & 65535);
};
function A(a, b) {
  if (B(a)) {
    return a;
  }
  if (B(b)) {
    return b;
  }
  var e = a.g >>> 16, c = a.g & 65535, d = a.h >>> 16;
  a = a.h & 65535;
  var f = b.g >>> 16, g = b.g & 65535, h = b.h >>> 16;
  b = b.h & 65535;
  var u = a * b;
  var q = (u >>> 16) + d * b;
  var n = q >>> 16;
  q = (q & 65535) + a * h;
  n += q >>> 16;
  n += c * b;
  var p = n >>> 16;
  n = (n & 65535) + d * h;
  p += n >>> 16;
  n = (n & 65535) + a * g;
  p = p + (n >>> 16) + (e * b + c * h + d * g + a * f) & 65535;
  return w((q & 65535) << 16 | u & 65535, p << 16 | n & 65535);
}
function x(a, b) {
  if (B(b)) {
    throw Error("division by zero");
  }
  if (0 > a.g) {
    if (C(a, E)) {
      if (C(b, F) || C(b, G)) {
        return E;
      }
      if (C(b, E)) {
        return F;
      }
      var e = 1;
      if (0 == e) {
        e = a;
      } else {
        var c = a.g;
        e = 32 > e ? w(a.h >>> e | c << 32 - e, c >> e) : w(c >> e - 32, 0 <= c ? 0 : -1);
      }
      e = x(e, b);
      c = 1;
      if (0 != c) {
        var d = e.h;
        e = 32 > c ? w(d << c, e.g << c | d >>> 32 - c) : w(0, d << c - 32);
      }
      if (C(e, H)) {
        return 0 > b.g ? F : G;
      }
      a = a.add(z(A(b, e)));
      return e.add(x(a, b));
    }
    return 0 > b.g ? x(z(a), z(b)) : z(x(z(a), b));
  }
  if (B(a)) {
    return H;
  }
  if (0 > b.g) {
    return C(b, E) ? H : z(x(a, z(b)));
  }
  for (c = H; 0 <= D(a, b);) {
    e = Math.max(1, Math.floor(v(a) / v(b)));
    d = Math.ceil(Math.log(e) / Math.LN2);
    d = 48 >= d ? 1 : Math.pow(2, d - 48);
    for (var f = I(e), g = A(f, b); 0 > g.g || 0 < D(g, a);) {
      e -= d, f = I(e), g = A(f, b);
    }
    B(f) && (f = F);
    c = c.add(f);
    a = a.add(z(g));
  }
  return c;
}
t.prototype.and = function(a) {
  return w(this.h & a.h, this.g & a.g);
};
t.prototype.or = function(a) {
  return w(this.h | a.h, this.g | a.g);
};
t.prototype.xor = function(a) {
  return w(this.h ^ a.h, this.g ^ a.g);
};
function I(a) {
  return 0 < a ? 0x7fffffffffffffff <= a ? J : new t(a, a / 4294967296) : 0 > a ? -9223372036854775808 >= a ? E : z(new t(-a, -a / 4294967296)) : H;
}
function w(a, b) {
  return new t(a, b);
}
var H = w(0, 0), F = w(1, 0), G = w(-1, -1), J = w(4294967295, 2147483647), E = w(0, 2147483648);
function K(a, b) {
  this.j = 128;
  this.m = k.Uint8Array ? new Uint8Array(this.j) : Array(this.j);
  this.s = this.l = 0;
  this.i = [];
  this.u = a;
  this.B = [];
  this.A = L(b);
  this.o = !1;
  this.s = this.l = 0;
  a = this.A;
  b = a.length;
  if (0 < b) {
    for (var e = Array(b), c = 0; c < b; c++) {
      e[c] = a[c];
    }
    a = e;
  } else {
    a = [];
  }
  this.i = a;
  this.o = !1;
}
l(K, r);
for (var M = [], N = 0; 127 > N; N++) {
  M[N] = 0;
}
var O = function(a) {
  return Array.prototype.concat.apply([], arguments);
}([128], M);
function P(a, b, e) {
  e = void 0 !== e ? e : b.length;
  if (a.o) {
    throw Error("this hasher needs to be reset");
  }
  var c = a.l;
  if ("string" === typeof b) {
    for (var d = 0; d < e; d++) {
      var f = b.charCodeAt(d);
      if (255 < f) {
        throw Error("Characters must be in range [0,255]");
      }
      a.m[c++] = f;
      c == a.j && (Q(a), c = 0);
    }
  } else {
    if (d = typeof b, d = "object" != d ? d : b ? Array.isArray(b) ? "array" : d : "null", "array" == d || "object" == d && "number" == typeof b.length) {
      for (d = 0; d < e; d++) {
        f = b[d];
        if ("number" !== typeof f || 0 > f || 255 < f || f != (f | 0)) {
          throw Error("message must be a byte array");
        }
        a.m[c++] = f;
        c == a.j && (Q(a), c = 0);
      }
    } else {
      throw Error("message must be string or array");
    }
  }
  a.l = c;
  a.s += e;
}
function Q(a) {
  for (var b = a.m, e = a.B, c = 0; 16 > c; c++) {
    var d = 8 * c;
    e[c] = new t(b[d + 4] << 24 | b[d + 5] << 16 | b[d + 6] << 8 | b[d + 7], b[d] << 24 | b[d + 1] << 16 | b[d + 2] << 8 | b[d + 3]);
  }
  for (c = 16; 80 > c; c++) {
    d = e[c - 15];
    b = d.h;
    d = d.g;
    var f = e[c - 2], g = f.h;
    f = f.g;
    e[c] = a.v(e[c - 16], e[c - 7], new t(b >>> 1 ^ d << 31 ^ b >>> 8 ^ d << 24 ^ b >>> 7 ^ d << 25, d >>> 1 ^ b << 31 ^ d >>> 8 ^ b << 24 ^ d >>> 7), new t(g >>> 19 ^ f << 13 ^ f >>> 29 ^ g << 3 ^ g >>> 6 ^ f << 26, f >>> 19 ^ g << 13 ^ g >>> 29 ^ f << 3 ^ f >>> 6));
  }
  b = a.i[0];
  d = a.i[1];
  g = a.i[2];
  f = a.i[3];
  var h = a.i[4], u = a.i[5], q = a.i[6], n = a.i[7];
  for (c = 0; 80 > c; c++) {
    var p = b.h, m = b.g;
    p = (new t(p >>> 28 ^ m << 4 ^ m >>> 2 ^ p << 30 ^ m >>> 7 ^ p << 25, m >>> 28 ^ p << 4 ^ p >>> 2 ^ m << 30 ^ p >>> 7 ^ m << 25)).add(new t(b.h & d.h | d.h & g.h | b.h & g.h, b.g & d.g | d.g & g.g | b.g & g.g));
    m = h.h;
    var y = h.g, S = h.h, T = h.g;
    m = a.v(n, new t(m >>> 14 ^ y << 18 ^ m >>> 18 ^ y << 14 ^ y >>> 9 ^ m << 23, y >>> 14 ^ m << 18 ^ y >>> 18 ^ m << 14 ^ m >>> 9 ^ y << 23), new t(S & u.h | ~S & q.h, T & u.g | ~T & q.g), R[c], e[c]);
    n = q;
    q = u;
    u = h;
    h = f.add(m);
    f = g;
    g = d;
    d = b;
    b = m.add(p);
  }
  a.i[0] = a.i[0].add(b);
  a.i[1] = a.i[1].add(d);
  a.i[2] = a.i[2].add(g);
  a.i[3] = a.i[3].add(f);
  a.i[4] = a.i[4].add(h);
  a.i[5] = a.i[5].add(u);
  a.i[6] = a.i[6].add(q);
  a.i[7] = a.i[7].add(n);
}
K.prototype.v = function(a, b, e) {
  for (var c = (a.h ^ 2147483648) + (b.h ^ 2147483648), d = a.g + b.g, f = arguments.length - 1; 2 <= f; --f) {
    c += arguments[f].h ^ 2147483648, d += arguments[f].g;
  }
  arguments.length & 1 && (c += 2147483648);
  d += arguments.length >> 1;
  d += Math.floor(c / 4294967296);
  return new t(c, d);
};
function L(a) {
  for (var b = [], e = 0; e < a.length; e += 2) {
    b.push(new t(a[e + 1], a[e]));
  }
  return b;
}
var R = L([1116352408, 3609767458, 1899447441, 602891725, 3049323471, 3964484399, 3921009573, 2173295548, 961987163, 4081628472, 1508970993, 3053834265, 2453635748, 2937671579, 2870763221, 3664609560, 3624381080, 2734883394, 310598401, 1164996542, 607225278, 1323610764, 1426881987, 3590304994, 1925078388, 4068182383, 2162078206, 991336113, 2614888103, 633803317, 3248222580, 3479774868, 3835390401, 2666613458, 4022224774, 944711139, 264347078, 2341262773, 604807628, 2007800933, 770255983, 1495990901, 
1249150122, 1856431235, 1555081692, 3175218132, 1996064986, 2198950837, 2554220882, 3999719339, 2821834349, 766784016, 2952996808, 2566594879, 3210313671, 3203337956, 3336571891, 1034457026, 3584528711, 2466948901, 113926993, 3758326383, 338241895, 168717936, 666307205, 1188179964, 773529912, 1546045734, 1294757372, 1522805485, 1396182291, 2643833823, 1695183700, 2343527390, 1986661051, 1014477480, 2177026350, 1206759142, 2456956037, 344077627, 2730485921, 1290863460, 2820302411, 3158454273, 3259730800, 
3505952657, 3345764771, 106217008, 3516065817, 3606008344, 3600352804, 1432725776, 4094571909, 1467031594, 275423344, 851169720, 430227734, 3100823752, 506948616, 1363258195, 659060556, 3750685593, 883997877, 3785050280, 958139571, 3318307427, 1322822218, 3812723403, 1537002063, 2003034995, 1747873779, 3602036899, 1955562222, 1575990012, 2024104815, 1125592928, 2227730452, 2716904306, 2361852424, 442776044, 2428436474, 593698344, 2756734187, 3733110249, 3204031479, 2999351573, 3329325298, 3815920427, 
3391569614, 3928383900, 3515267271, 566280711, 3940187606, 3454069534, 4118630271, 4000239992, 116418474, 1914138554, 174292421, 2731055270, 289380356, 3203993006, 460393269, 320620315, 685471733, 587496836, 852142971, 1086792851, 1017036298, 365543100, 1126000580, 2618297676, 1288033470, 3409855158, 1501505948, 4234509866, 1607167915, 987167468, 1816402316, 1246189591]);
function U() {
  K.call(this, 6, V);
}
l(U, K);
var V = [3418070365, 3238371032, 1654270250, 914150663, 2438529370, 812702999, 355462360, 4144912697, 1731405415, 4290775857, 2394180231, 1750603025, 3675008525, 1694076839, 1203062813, 3204075428];
function W(a) {
  var b = new U;
  P(b, a);
  a = Uint8Array;
  if (b.o) {
    throw Error("this hasher needs to be reset");
  }
  var e = 8 * b.s;
  112 > b.l ? P(b, O, 112 - b.l) : P(b, O, b.j - b.l + 112);
  for (var c = 127; 112 <= c; c--) {
    b.m[c] = e & 255, e /= 256;
  }
  Q(b);
  e = 0;
  var d = Array(8 * b.u);
  for (c = 0; c < b.u; c++) {
    var f = b.i[c], g = f.g;
    f = f.h;
    for (var h = 24; 0 <= h; h -= 8) {
      d[e++] = g >> h & 255;
    }
    for (h = 24; 0 <= h; h -= 8) {
      d[e++] = f >> h & 255;
    }
  }
  b.o = !0;
  return new a(d);
}
var X = ["__AMP_SHA384_DIGEST"], Y = window || k;
X[0] in Y || "undefined" == typeof Y.execScript || Y.execScript("var " + X[0]);
for (var Z; X.length && (Z = X.shift());) {
  X.length || void 0 === W ? Y[Z] && Y[Z] !== Object.prototype[Z] ? Y = Y[Z] : Y = Y[Z] = {} : Y[Z] = W;
}
;;return window.__AMP_SHA384_DIGEST;}).call(window, window);
