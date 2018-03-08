/**
 * Copyright 2015 The AMP HTML Authors.
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

import '../amp-bodymovin-animation';

describes.realWin('amp-bodymovin-animation', {
  amp: {
    mockFetch: true,
    extensions: ['amp-bodymovin-animation'],
  },
}, env => {

  let win, doc;

  beforeEach(() => {
    win = env.win;
    ampdoc = env.ampdoc;
    doc = win.document;
  });

  const jsonLink = 'https://nainar.github.io/loader.json';
  const mockResponse = {'v': '5.1.7','fr': 30,'ip': 0,'op': 50,'w': 80,'h': 80,'nm': 'loader','ddd': 0,'assets': [],'layers': [{'ddd': 0,'ind': 1,'ty': 4,'nm': 'color01b','sr': 1,'ks': {'o': {'a': 0,'k': 100,'ix': 11},'r': {'a': 0,'k': 0,'ix': 10},'p': {'a': 0,'k': [40,40,0],'ix': 2},'a': {'a': 0,'k': [-19,-8.286,0],'ix': 1},'s': {'a': 1,'k': [{'i': {'x': [0.667,0.667,0.667],'y': [1,1,1]},'o': {'x': [0.333,0.333,0.333],'y': [0,0,0]},'n': ['0p667_1_0p333_0','0p667_1_0p333_0','0p667_1_0p333_0'],'t': 30,'s': [0,0,100],'e': [100,100,100]},{'t': 50}],'ix': 6}},'ao': 0,'shapes': [{'ty': 'gr','it': [{'d': 1,'ty': 'el','s': {'a': 0,'k': [80,80],'ix': 2},'p': {'a': 0,'k': [0,0],'ix': 3},'nm': 'Ellipse Path 1','mn': 'ADBE Vector Shape - Ellipse','hd': false},{'ty': 'st','c': {'a': 0,'k': [0.266666995778,0.266666995778,0.266666995778,1],'ix': 3},'o': {'a': 0,'k': 100,'ix': 4},'w': {'a': 0,'k': 0,'ix': 5},'lc': 1,'lj': 1,'ml': 4,'nm': 'Stroke 1','mn': 'ADBE Vector Graphic - Stroke','hd': false},{'ty': 'fl','c': {'a': 0,'k': [1,0.294117647059,0.2,1],'ix': 4},'o': {'a': 0,'k': 100,'ix': 5},'r': 1,'nm': 'Fill 1','mn': 'ADBE Vector Graphic - Fill','hd': false},{'ty': 'tr','p': {'a': 0,'k': [-19,-8.286],'ix': 2},'a': {'a': 0,'k': [0,0],'ix': 1},'s': {'a': 0,'k': [100,100],'ix': 3},'r': {'a': 0,'k': 0,'ix': 6},'o': {'a': 0,'k': 100,'ix': 7},'sk': {'a': 0,'k': 0,'ix': 4},'sa': {'a': 0,'k': 0,'ix': 5},'nm': 'Transform'}],'nm': 'Ellipse 1','np': 3,'cix': 2,'ix': 1,'mn': 'ADBE Vector Group','hd': false}],'ip': 30,'op': 50,'st': 30,'bm': 0},{'ddd': 0,'ind': 2,'ty': 4,'nm': 'color01a','sr': 1,'ks': {'o': {'a': 1,'k': [{'i': {'x': [0.667],'y': [1]},'o': {'x': [0.333],'y': [0]},'n': ['0p667_1_0p333_0'],'t': 25,'s': [100],'e': [0]},{'t': 45}],'ix': 11},'r': {'a': 0,'k': 0,'ix': 10},'p': {'a': 0,'k': [40,40,0],'ix': 2},'a': {'a': 0,'k': [-19,-8.286,0],'ix': 1},'s': {'a': 1,'k': [{'i': {'x': [0.667,0.667,0.667],'y': [1,1,1]},'o': {'x': [0.333,0.333,0.333],'y': [0,0,0]},'n': ['0p667_1_0p333_0','0p667_1_0p333_0','0p667_1_0p333_0'],'t': 25,'s': [0,0,100],'e': [100,100,100]},{'t': 45}],'ix': 6}},'ao': 0,'shapes': [{'ty': 'gr','it': [{'d': 1,'ty': 'el','s': {'a': 0,'k': [80,80],'ix': 2},'p': {'a': 0,'k': [0,0],'ix': 3},'nm': 'Ellipse Path 1','mn': 'ADBE Vector Shape - Ellipse','hd': false},{'ty': 'st','c': {'a': 0,'k': [0.266666995778,0.266666995778,0.266666995778,1],'ix': 3},'o': {'a': 0,'k': 100,'ix': 4},'w': {'a': 0,'k': 0,'ix': 5},'lc': 1,'lj': 1,'ml': 4,'nm': 'Stroke 1','mn': 'ADBE Vector Graphic - Stroke','hd': false},{'ty': 'fl','c': {'a': 0,'k': [1,0.294117647059,0.2,1],'ix': 4},'o': {'a': 0,'k': 100,'ix': 5},'r': 1,'nm': 'Fill 1','mn': 'ADBE Vector Graphic - Fill','hd': false},{'ty': 'tr','p': {'a': 0,'k': [-19,-8.286],'ix': 2},'a': {'a': 0,'k': [0,0],'ix': 1},'s': {'a': 0,'k': [100,100],'ix': 3},'r': {'a': 0,'k': 0,'ix': 6},'o': {'a': 0,'k': 100,'ix': 7},'sk': {'a': 0,'k': 0,'ix': 4},'sa': {'a': 0,'k': 0,'ix': 5},'nm': 'Transform'}],'nm': 'Ellipse 1','np': 3,'cix': 2,'ix': 1,'mn': 'ADBE Vector Group','hd': false}],'ip': 25,'op': 50,'st': 25,'bm': 0},{'ddd': 0,'ind': 3,'ty': 4,'nm': 'color01','sr': 1,'ks': {'o': {'a': 0,'k': 100,'ix': 11},'r': {'a': 0,'k': 0,'ix': 10},'p': {'a': 0,'k': [40,40,0],'ix': 2},'a': {'a': 0,'k': [-19,-8.286,0],'ix': 1},'s': {'a': 1,'k': [{'i': {'x': [0.667,0.667,0.667],'y': [1,1,1]},'o': {'x': [0.333,0.333,0.333],'y': [0,0,0]},'n': ['0p667_1_0p333_0','0p667_1_0p333_0','0p667_1_0p333_0'],'t': 0,'s': [100,100,100],'e': [0,0,100]},{'t': 20}],'ix': 6}},'ao': 0,'shapes': [{'ty': 'gr','it': [{'d': 1,'ty': 'el','s': {'a': 0,'k': [80,80],'ix': 2},'p': {'a': 0,'k': [0,0],'ix': 3},'nm': 'Ellipse Path 1','mn': 'ADBE Vector Shape - Ellipse','hd': false},{'ty': 'st','c': {'a': 0,'k': [0.266666995778,0.266666995778,0.266666995778,1],'ix': 3},'o': {'a': 0,'k': 100,'ix': 4},'w': {'a': 0,'k': 0,'ix': 5},'lc': 1,'lj': 1,'ml': 4,'nm': 'Stroke 1','mn': 'ADBE Vector Graphic - Stroke','hd': false},{'ty': 'fl','c': {'a': 0,'k': [1,0.294117647059,0.2,1],'ix': 4},'o': {'a': 0,'k': 100,'ix': 5},'r': 1,'nm': 'Fill 1','mn': 'ADBE Vector Graphic - Fill','hd': false},{'ty': 'tr','p': {'a': 0,'k': [-19,-8.286],'ix': 2},'a': {'a': 0,'k': [0,0],'ix': 1},'s': {'a': 0,'k': [100,100],'ix': 3},'r': {'a': 0,'k': 0,'ix': 6},'o': {'a': 0,'k': 100,'ix': 7},'sk': {'a': 0,'k': 0,'ix': 4},'sa': {'a': 0,'k': 0,'ix': 5},'nm': 'Transform'}],'nm': 'Ellipse 1','np': 3,'cix': 2,'ix': 1,'mn': 'ADBE Vector Group','hd': false}],'ip': 0,'op': 30,'st': 0,'bm': 0},{'ddd': 0,'ind': 4,'ty': 4,'nm': 'color02','sr': 1,'ks': {'o': {'a': 0,'k': 100,'ix': 11},'r': {'a': 0,'k': 0,'ix': 10},'p': {'a': 0,'k': [40,40,0],'ix': 2},'a': {'a': 0,'k': [-19,-8.286,0],'ix': 1},'s': {'a': 1,'k': [{'i': {'x': [0.667,0.667,0.667],'y': [1,1,1]},'o': {'x': [0.333,0.333,0.333],'y': [0,0,0]},'n': ['0p667_1_0p333_0','0p667_1_0p333_0','0p667_1_0p333_0'],'t': 5,'s': [100,100,100],'e': [0,0,100]},{'t': 25}],'ix': 6}},'ao': 0,'shapes': [{'ty': 'gr','it': [{'d': 1,'ty': 'el','s': {'a': 0,'k': [80,80],'ix': 2},'p': {'a': 0,'k': [0,0],'ix': 3},'nm': 'Ellipse Path 1','mn': 'ADBE Vector Shape - Ellipse','hd': false},{'ty': 'st','c': {'a': 0,'k': [0.266666995778,0.266666995778,0.266666995778,1],'ix': 3},'o': {'a': 0,'k': 100,'ix': 4},'w': {'a': 0,'k': 0,'ix': 5},'lc': 1,'lj': 1,'ml': 4,'nm': 'Stroke 1','mn': 'ADBE Vector Graphic - Stroke','hd': false},{'ty': 'fl','c': {'a': 0,'k': [1,0.380392156863,0.298039215686,1],'ix': 4},'o': {'a': 0,'k': 100,'ix': 5},'r': 1,'nm': 'Fill 1','mn': 'ADBE Vector Graphic - Fill','hd': false},{'ty': 'tr','p': {'a': 0,'k': [-19,-8.286],'ix': 2},'a': {'a': 0,'k': [0,0],'ix': 1},'s': {'a': 0,'k': [100,100],'ix': 3},'r': {'a': 0,'k': 0,'ix': 6},'o': {'a': 0,'k': 100,'ix': 7},'sk': {'a': 0,'k': 0,'ix': 4},'sa': {'a': 0,'k': 0,'ix': 5},'nm': 'Transform'}],'nm': 'Ellipse 1','np': 3,'cix': 2,'ix': 1,'mn': 'ADBE Vector Group','hd': false}],'ip': 0,'op': 30,'st': 0,'bm': 0},{'ddd': 0,'ind': 5,'ty': 4,'nm': 'color03','sr': 1,'ks': {'o': {'a': 0,'k': 100,'ix': 11},'r': {'a': 0,'k': 0,'ix': 10},'p': {'a': 0,'k': [40,40,0],'ix': 2},'a': {'a': 0,'k': [-19,-8.286,0],'ix': 1},'s': {'a': 1,'k': [{'i': {'x': [0.667,0.667,0.667],'y': [1,1,1]},'o': {'x': [0.333,0.333,0.333],'y': [0,0,0]},'n': ['0p667_1_0p333_0','0p667_1_0p333_0','0p667_1_0p333_0'],'t': 10,'s': [100,100,100],'e': [10,10,100]},{'t': 30}],'ix': 6}},'ao': 0,'shapes': [{'ty': 'gr','it': [{'d': 1,'ty': 'el','s': {'a': 0,'k': [80,80],'ix': 2},'p': {'a': 0,'k': [0,0],'ix': 3},'nm': 'Ellipse Path 1','mn': 'ADBE Vector Shape - Ellipse','hd': false},{'ty': 'st','c': {'a': 0,'k': [0.266666995778,0.266666995778,0.266666995778,1],'ix': 3},'o': {'a': 0,'k': 100,'ix': 4},'w': {'a': 0,'k': 0,'ix': 5},'lc': 1,'lj': 1,'ml': 4,'nm': 'Stroke 1','mn': 'ADBE Vector Graphic - Stroke','hd': false},{'ty': 'fl','c': {'a': 0,'k': [1,0.513725490196,0.450980392157,1],'ix': 4},'o': {'a': 0,'k': 100,'ix': 5},'r': 1,'nm': 'Fill 1','mn': 'ADBE Vector Graphic - Fill','hd': false},{'ty': 'tr','p': {'a': 0,'k': [-19,-8.286],'ix': 2},'a': {'a': 0,'k': [0,0],'ix': 1},'s': {'a': 0,'k': [100,100],'ix': 3},'r': {'a': 0,'k': 0,'ix': 6},'o': {'a': 0,'k': 100,'ix': 7},'sk': {'a': 0,'k': 0,'ix': 4},'sa': {'a': 0,'k': 0,'ix': 5},'nm': 'Transform'}],'nm': 'Ellipse 1','np': 3,'cix': 2,'ix': 1,'mn': 'ADBE Vector Group','hd': false}],'ip': 0,'op': 30,'st': 0,'bm': 0}],'markers': []};

  function getAnimation(loop) {
    env.fetchMock.getOnce(jsonLink, {'body': mockResponse});

    const anim = doc.createElement('amp-bodymovin-animation');
    if (loop) {
      anim.setAttribute('loop', loop);
    }
    doc.body.appendChild(anim);
    return anim.build().then(() => {
      return anim.layoutCallback();
    }).then(() => anim);
  }


  it('renders', () => {
    return getAnimation(false).then(anim => {
      const iframe = anim.firstChild;
      expect(iframe).to.not.be.null;
      expect(iframe.tagName).to.equal('IFRAME');
    });
  });

  it('`loop` attribute is true by default', () => {
    return getAnimation(false).then(anim => {
      expect(anim.loop_).to.equal('true');
    });
  });

  it('`src` attribute is mandatory', () => {
    expect(() => {
      const anim = doc.createElement('amp-bodymovin-animation');
      doc.body.appendChild(anim);
      return anim.buildCallback().then(() => {
        return anim.layoutCallback();
      }).then(() => anim);
    }).to.throw();
  });
});
