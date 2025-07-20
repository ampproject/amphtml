/**
 * Copyright 2025 The AMP Project Authors.
 * Licensed under the Apache License, Version 2.0.
 *
 * <amp-blurhash> – lightweight placeholder renderer.
 *
 * Attributes:
 *   hash     – required  • BlurHash string to decode
 *   width    – required  • original media pixel width
 *   height   – required  • original media pixel height
 *   punch    – optional  • contrast boost (default 1.0)
 *
 * Example:
 *   <amp-blurhash hash="LEHV6nWB2yk8pyo0adR*.7kCMdnj"
 *                 width="320" height="213" layout="fixed"></amp-blurhash>
 */

import {decode} from './blurhash-decode'; // 25‑line helper (embedded below)
import {AmpElement} from '#core/dom/amp-element';

export class AmpBlurhash extends AmpElement {
  /** @override */
  static ['layoutSizeDefined']() {
    // We have intrinsic size; no crawl‑up
    return true;
  }

  /** @override */
  buildCallback() {
    // Parse attributes.
    const hash = this.element.getAttribute('hash');
    const w = parseInt(this.element.getAttribute('width'), 10);
    const h = parseInt(this.element.getAttribute('height'), 10);
    const punch =
      parseFloat(this.element.getAttribute('punch')) || /*default*/ 1;

    // Basic validation – AMP validator also checks, but we fail early here
    if (!hash || !w || !h) {
      this.user().error('Missing required attributes on <amp-blurhash>.');
      return;
    }

    // Create canvas placeholder.
    const canvas = this.win.document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    canvas.className = 'i-amphtml-blurhash-canvas';
    this.applyFillContent(canvas);

    // Decode BlurHash → RGBA pixel array, then paint onto canvas.
    const pixels = decode(hash, w, h, punch);
    const ctx = canvas.getContext('2d');
    const imgData = ctx.createImageData(w, h);
    imgData.data.set(pixels);
    ctx.putImageData(imgData, 0, 0);

    // Append to DOM.
    this.element.appendChild(canvas);
  }
}

// Register the custom element.
AMP.extension('amp-blurhash', '0.1', AMP => {
  AMP.registerElement('amp-blurhash', AmpBlurhash);
});

/* ---------- Minimal BlurHash decoder (≈25 LOC) ------------------------- */
/* Adapted from https://github.com/woltapp/blurhash (MIT); stripped to decode-only */
function sRGBToLinear(value) {
  value /= 255;
  return value <= 0.04045
    ? value / 12.92
    : Math.pow((value + 0.055) / 1.055, 2.4);
}

function linearTosRGB(value) {
  const v = Math.max(0, Math.min(1, value));
  return v <= 0.0031308
    ? v * 12.92 * 255 + 0.5
    : (1.055 * Math.pow(v, 1 / 2.4) - 0.055) * 255 + 0.5;
}

function decodeDC(value) {
  const r = value >> 16;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return [sRGBToLinear(r), sRGBToLinear(g), sRGBToLinear(b)];
}

function decodeAC(value, max, punch) {
  const quantR = Math.floor(value / (19 * 19));
  const quantG = Math.floor((value / 19) % 19);
  const quantB = value % 19;

  const sign = x => (x & 1 ? -1 : 1);
  const convert = v =>
    sign(v) * ((Math.abs(v) - 9) / 9) * punch * max;

  return [
    convert(quantR),
    convert(quantG),
    convert(quantB),
  ];
}

export function decode(str, width, height, punch = 1) {
  const bytes = atob(str.replace(/#/g, '+').replace(/_/g, '/'));
  const blurhash = new Uint8Array(bytes.length);
  for (let i = 0; i < blurhash.length; ++i) blurhash[i] = bytes.charCodeAt(i);

  const sizeFlag = blurhash[0];
  const numY = (sizeFlag >> 3) + 1;
  const numX = (sizeFlag & 7) + 1;

  const quantMaxAc = blurhash[1];
  const maxAc = (quantMaxAc + 1) / 166;

  let idx = 2;
  const colors = [];
  for (let y = 0; y < numY; ++y) {
    for (let x = 0; x < numX; ++x) {
      if (x === 0 && y === 0) {
        const val =
          (blurhash[idx++] << 16) |
          (blurhash[idx++] << 8) |
          blurhash[idx++];
        colors.push(decodeDC(val));
      } else {
        const val =
          (blurhash[idx++] << 16) |
          (blurhash[idx++] << 8) |
          blurhash[idx++];
        colors.push(decodeAC(val, maxAc, punch));
      }
    }
  }

  const pixels = new Uint8ClampedArray(width * height * 4);
  let px = 0;
  for (let y = 0; y < height; ++y) {
    for (let x = 0; x < width; ++x) {
      let r = 0,
        g = 0,
        b = 0;
      let idxCol = 0;
      for (let j = 0; j < numY; ++j) {
        for (let i = 0; i < numX; ++i) {
          const basis =
            Math.cos((Math.PI * x * i) / width) *
            Math.cos((Math.PI * y * j) / height);
          const [cr, cg, cb] = colors[idxCol++];
          r += cr * basis;
          g += cg * basis;
          b += cb * basis;
        }
      }
      pixels[px++] = linearTosRGB(r);
      pixels[px++] = linearTosRGB(g);
      pixels[px++] = linearTosRGB(b);
      pixels[px++] = 255; // alpha
    }
  }
  return pixels;
}
