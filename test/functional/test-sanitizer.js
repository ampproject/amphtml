/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {sanitizeFormattingHtml, sanitizeHtml} from '../../src/sanitizer';


describe('sanitizeHtml', () => {

  it('should output basic text', () => {
    expect(sanitizeHtml('abc')).to.be.equal('abc');
  });

  it('should output valid markup', () => {
    expect(sanitizeHtml('<h1>abc</h1>')).to.be.equal('<h1>abc</h1>');
    expect(sanitizeHtml('<h1>a<i>b</i>c</h1>')).to.be.equal(
        '<h1>a<i>b</i>c</h1>');
    expect(sanitizeHtml('<h1>a<i>b</i><br>c</h1>')).to.be.equal(
        '<h1>a<i>b</i><br>c</h1>');
    expect(sanitizeHtml(
        '<h1>a<i>b</i>c' +
        '<amp-img src="http://example.com/1.png"></amp-img></h1>'))
        .to.be.equal(
            '<h1>a<i>b</i>c' +
            '<amp-img src="http://example.com/1.png"></amp-img></h1>');
  });

  it('should NOT output security-sensitive markup', () => {
    expect(sanitizeHtml('a<script>b</script>c')).to.be.equal('ac');
    expect(sanitizeHtml('a<style>b</style>c')).to.be.equal('ac');
    expect(sanitizeHtml('a<img>c')).to.be.equal('ac');
    expect(sanitizeHtml('a<iframe></iframe>c')).to.be.equal('ac');
    expect(sanitizeHtml('a<template></template>c')).to.be.equal('ac');
  });

  it('should NOT output security-sensitive markup when nested', () => {
    expect(sanitizeHtml('a<script><style>b</style></script>c'))
        .to.be.equal('ac');
    expect(sanitizeHtml('a<style><iframe>b</iframe></style>c'))
        .to.be.equal('ac');
    expect(sanitizeHtml('a<script><img></script>c'))
        .to.be.equal('ac');
  });

  it('should NOT output security-sensitive markup when broken', () => {
    expect(sanitizeHtml('a<script>bc')).to.be.equal('a');
  });

  it('should output "on" attribute', () => {
    expect(sanitizeHtml('a<a on="tap">b</a>')).to.be.equal(
        'a<a on="tap">b</a>');
  });

  it('should output "href" attribute', () => {
    expect(sanitizeHtml('a<a href="http://acme.com">b</a>')).to.be.equal(
        'a<a href="http://acme.com">b</a>');
  });

  it('should NOT output security-sensitive attributes', () => {
    expect(sanitizeHtml('a<a onclick="alert">b</a>')).to.be.equal('a<a>b</a>');
    expect(sanitizeHtml('a<a style="color: red;">b</a>')).to.be.equal(
        'a<a>b</a>');
    expect(sanitizeHtml('a<a href="javascript:alert">b</a>')).to.be.equal(
        'a<a>b</a>');
  });

  it('should NOT output security-sensitive attributes', () => {
    expect(sanitizeHtml('a<a onclick="alert">b</a>')).to.be.equal('a<a>b</a>');
  });
});


describe('sanitizeFormattingHtml', () => {

  it('should output basic text', () => {
    expect(sanitizeFormattingHtml('abc')).to.be.equal('abc');
  });

  it('should output valid markup', () => {
    expect(sanitizeFormattingHtml('<b>abc</b>')).to.be.equal('<b>abc</b>');
    expect(sanitizeFormattingHtml('<b>ab<br>c</b>')).to.be.equal(
        '<b>ab<br>c</b>');
    expect(sanitizeFormattingHtml('<b>a<i>b</i>c</b>')).to.be.equal(
        '<b>a<i>b</i>c</b>');
  });

  it('should NOT output non-whitelisted markup', () => {
    expect(sanitizeFormattingHtml('a<div>b</div>c')).to.be.equal('ac');
    expect(sanitizeFormattingHtml('a<style>b</style>c')).to.be.equal('ac');
    expect(sanitizeFormattingHtml('a<img>c')).to.be.equal('ac');
  });

  it('should NOT output attributes', () => {
    expect(sanitizeFormattingHtml('<b color=red style="color: red">abc</b>'))
        .to.be.equal('<b>abc</b>');
  });

  it('should compentsate for broken markup', () => {
    expect(sanitizeFormattingHtml('<b>a<i>b')).to.be.equal(
        '<b>a<i>b</i></b>');
  });
});
