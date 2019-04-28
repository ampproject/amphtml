/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import '../amp-cld-img';
import {buildUrl} from '../utils';

describes.realWin('amp-cld-img', {
  amp: {
    extensions: ['amp-cld-img'],
  },
}, env => {

  let win;
  let doc;

  beforeEach(() => {
    win = env.win;
    doc = win.document;
    const script = doc.createElement('script');
    script.id = 'amp-cld-config';
    script.type = 'application/json';
    script.textContent = '{ "cloudName": "demo" }';
    doc.head.appendChild(script);
  });

  function getCldImg(extraAttrs) {
    const cld = doc.createElement('amp-cld-img');
    cld.setAttribute('data-public-id', 'sample');
    cld.setAttribute('layout', 'fixed');
    cld.setAttribute('width', '100');
    cld.setAttribute('height', '100');

    if (extraAttrs) {
      Object.keys(extraAttrs).forEach(key =>
        cld.setAttribute(key, extraAttrs[key]));
    }

    doc.body.appendChild(cld);
    return cld.build().then(() => cld.layoutCallback()).then(() => cld);
  }

  it('should use attributes to generate url', () => {
    return getCldImg().then(cld => {
      expect(cld.childNodes[0].getAttribute('src'))
          .to.eql('https://res.cloudinary.com/demo/image/upload/c_fill,h_100,w_100/sample');
    });
  });
  it('should use tag attributes over global config', () => {
    return getCldImg({'cloud-name': 'test123', 'crop': 'mfit'}).then(cld => {
      expect(cld.childNodes[0].getAttribute('src'))
          .to.eql('https://res.cloudinary.com/test123/image/upload/c_mfit,h_100,w_100/sample');
    });
  });
  it('should use step size to generate transformation', () => {
    return getCldImg({'step-size': '150'}).then(cld => {
      expect(cld.childNodes[0].getAttribute('src'))
          .to.eql('https://res.cloudinary.com/demo/image/upload/c_fill,h_150,w_150/sample');
    });
  });
  it('should use max size to generate transformation', () => {
    return getCldImg({'max-size': '60'}).then(cld => {
      expect(cld.childNodes[0].getAttribute('src'))
          .to.eql('https://res.cloudinary.com/demo/image/upload/c_fill,h_60,w_60/sample');
    });
  });
  it('should use attributes to generate transformation', () => {
    return getCldImg({'effect': 'blur:50'}).then(cld => {
      expect(cld.childNodes[0].getAttribute('src'))
          .to.eql('https://res.cloudinary.com/demo/image/upload/e_blur:50/c_fill,h_100,w_100/sample');
    });
  });
  it('should use rawTransformation attribute', () => {
    return getCldImg({'effect': 'blur:50',
      'raw-transformation': 'l_sample,g_north'}).then(cld => {
      expect(cld.childNodes[0].getAttribute('src'))
          .to.eql('https://res.cloudinary.com/demo/image/upload/l_sample,g_north/e_blur:50/c_fill,h_100,w_100/sample');
    });
  });
  it('should allow overriding cloudName in options', function() {
    const options = {
      cloudName: 'test321',
    };
    const result = buildUrl('test', options);
    expect(options).to.eql({});
    expect(result).to.eql('https://res.cloudinary.com/test321/image/upload/test');
  });
  it('should use format from options', function() {
    const options = {
      cloudName: 'test123',
      format: 'jpg',
    };
    const result = buildUrl('test', options);
    expect(options).to.eql({});
    expect(result).to.eql(
        'https://res.cloudinary.com/test123/image/upload/test.jpg');
  });
  it('should support rawTransformation from options', function() {
    let options = {
      cloudName: 'test123',
      rawTransformation: 'e_blur:20',
    };
    let result = buildUrl('test', options);
    expect(options).to.eql({});
    expect(result).to.eql(
        'https://res.cloudinary.com/test123/image/upload/e_blur:20/test');
    options = {
      cloudName: 'test123',
      rawTransformation: 'e_blur:20',
      effect: 'sepia',
    };
    result = buildUrl('test', options);
    expect(options).to.eql({});
    expect(result).to.eql(
        'https://res.cloudinary.com/test123/image/upload/e_blur:20/e_sepia/test');
  });
  it('should default to akamai if secure is given with privateCdn and no' +
    ' secureDistribution', function() {
    const options = {
      cloudName: 'test123',
      privateCdn: true,
    };
    const result = buildUrl('test', options);
    expect(options).to.eql({});
    expect(result).to.eql('https://test123-res.cloudinary.com/image/upload/test');
  });
  it('should not add cloudName if secure privateCdn and secure non akamai ' +
    'secureDistribution', function() {
    const options = {
      cloudName: 'test123',
      privateCdn: true,
      secureDistribution: 'something.cloudfront.net',
    };
    const result = buildUrl('test', options);
    expect(options).to.eql({});
    expect(result).to.eql('https://something.cloudfront.net/image/upload/test');
  });
  it('should not add cloudName if privateCdn and not secure', function() {
    const options = {
      cloudName: 'test123',
      privateCdn: true,
    };
    const result = buildUrl('test', options);
    expect(options).to.eql({});
    expect(result).to.eql('https://test123-res.cloudinary.com/image/upload/test');
  });
  it('should use type from options', function() {
    const options = {
      cloudName: 'test123',
      type: 'facebook',
    };
    const result = buildUrl('test', options);
    expect(options).to.eql({});
    expect(result).to.eql('https://res.cloudinary.com/test123/image/facebook/test');
  });
  it('should use resourceType from options', function() {
    const options = {
      cloudName: 'test123',
      resourceType: 'raw',
    };
    const result = buildUrl('test', options);
    expect(options).to.eql({});
    expect(result).to.eql('https://res.cloudinary.com/test123/raw/upload/test');
  });
  it('should ignore http links only if type is not given ', function() {
    let options = {
      cloudName: 'test123',
      type: null,
    };
    let result = buildUrl('http://example.com/', options);
    expect(options).to.eql({});
    expect(result).to.eql('http://example.com/');
    options = {
      cloudName: 'test123',
      type: 'fetch',
    };
    result = buildUrl('http://example.com/', options);
    expect(options).to.eql({});
    expect(result).to.eql('https://res.cloudinary.com/test123/image/fetch/http://example.com/');
  });
  it('should escape fetch urls', function() {
    const options = {
      cloudName: 'test123',
      type: 'fetch',
    };
    const result = buildUrl('http://blah.com/hello?a=b', options);
    expect(options).to.eql({});
    expect(result).to.eql('https://res.cloudinary.com/test123/image/fetch/http://blah.com/hello%3Fa%3Db');
  });
  it('should escape http urls', function() {
    const options = {
      cloudName: 'test123',
      type: 'youtube',
    };
    const result = buildUrl('http://www.youtube.com/watch?v=d9NF2edxy-M', options);
    expect(options).to.eql({});
    expect(result).to.eql('https://res.cloudinary.com/test123/image/youtube/http://www.youtube.com/watch%3Fv%3Dd9NF2edxy-M');
  });
  it('should support background', function() {
    let options = {
      cloudName: 'test123',
      background: 'red',
    };
    let result = buildUrl('test', options);
    expect(options).to.eql({});
    expect(result).to.eql('https://res.cloudinary.com/test123/image/upload/b_red/test');
    options = {
      cloudName: 'test123',
      background: '#112233',
    };
    result = buildUrl('test', options);
    expect(options).to.eql({});
    expect(result).to.eql('https://res.cloudinary.com/test123/image/upload/b_rgb:112233/test');
  });
  it('should support format for fetch urls', function() {
    const options = {
      cloudName: 'test123',
      format: 'jpg',
      type: 'fetch',
    };
    const result = buildUrl('http://cloudinary.com/images/logo.png', options);
    expect(options).to.eql({});
    expect(result).to.eql('https://res.cloudinary.com/test123/image/fetch/f_jpg/http://cloudinary.com/images/logo.png');
  });
  it('should support effect', function() {
    const options = {
      cloudName: 'test123',
      effect: 'sepia',
    };
    const result = buildUrl('test', options);
    expect(options).to.eql({});
    expect(result).to.eql('https://res.cloudinary.com/test123/image/upload/e_sepia/test');
  });
  it('should support external cname', function() {
    const options = {
      cloudName: 'test123',
      cname: 'hello.com',
      secure: false,
    };
    const result = buildUrl('test', options);
    expect(options).to.eql({});
    expect(result).to.eql('http://hello.com/test123/image/upload/test');
  });

  it('should support external cname with cdnSubdomain on', function() {
    const options = {
      cloudName: 'test123',
      cname: 'hello.com',
      secure: false,
      cdnSubdomain: true,
    };
    const result = buildUrl('test', options);
    expect(options).to.eql({});
    expect(result).to.eql('http://hello.com/test123/image/upload/test');
  });
  it('should support border', function() {
    const options = {
      cloudName: 'test123',
      border: '1px_solid_blue',
    };
    const result = buildUrl('test', options);
    expect(options).to.eql({});
    expect(result).to.eql('https://res.cloudinary.com/test123/image/upload/bo_1px_solid_blue/test');
  });
  it('should add version if publicId contains /', function() {
    let result = buildUrl('folder/test', {cloudName: 'test123'});
    expect(result).to.eql('https://res.cloudinary.com/test123/image/upload/v1/folder/test');
    result = buildUrl('folder/test', {
      version: 123,
      cloudName: 'test123',
    });
    expect(result).to.eql('https://res.cloudinary.com/test123/image/upload/v123/folder/test');
  });
  it('should not add version if publicId contains version already', function() {
    const result = buildUrl('v1234/test', {cloudName: 'test123'});
    expect(result).to.eql('https://res.cloudinary.com/test123/image/upload/v1234/test');
  });
  it('should allow to shorted image/upload urls', function() {
    const result = buildUrl('test', {
      cloudName: 'test123',
      shorten: true,
    });
    expect(result).to.eql('https://res.cloudinary.com/test123/iu/test');
  });
  it('should escape publicIds', function() {
    const tests = {
      'a b': 'a%20b',
      'a+b': 'a%2Bb',
      'a%20b': 'a%20b',
      'a-b': 'a-b',
      'a??b': 'a%3F%3Fb',
    };
    const results = [];
    for (const source in tests) {
      const target = tests[source];
      const result = buildUrl(source, {cloudName: 'test123'});
      results.push(expect(result).to.eql('https://res.cloudinary.com/test123/image/upload/' + target));
    }
  });
  it('should support preloaded identifier format', function() {
    let result = buildUrl('raw/private/v123456/document.docx',
        {cloudName: 'test123'});
    expect(result).to.eql('https://res.cloudinary.com/test123/raw/private/v123456/document.docx');
    result = buildUrl('image/private/v123456/img.jpg', {
      cloudName: 'test123',
      crop: 'scale',
      width: '1.0',
    });
    expect(result).to.eql('https://res.cloudinary.com/test123/image/private/c_scale,w_1.0/v123456/img.jpg');
  });
});

