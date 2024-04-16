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

import '../amp-pinterest';

describes.realWin(
  'amp-pinterest',
  {
    amp: {
      runtimeOn: false,
      ampdoc: 'single',
      mockFetch: true,
      extensions: ['amp-pinterest'],
    },
  },
  (env) => {
    function widgetURL(pinID) {
      return (
        'begin:https://widgets.pinterest.com/v3/pidgets/pins/info/?pin_ids=' +
        pinID
      );
    }

    async function getPin(
      pinDo,
      pinUrl,
      pinMedia,
      pinDescription,
      width = 20,
      height = 40
    ) {
      const div = document.createElement('div');
      env.win.document.body.appendChild(div);

      const pin = env.win.document.createElement('amp-pinterest');
      pin.setAttribute('data-do', pinDo);
      pin.setAttribute('data-url', pinUrl);
      pin.setAttribute('data-media', pinMedia);
      pin.setAttribute('data-description', pinDescription);
      pin.setAttribute('layout', 'responsive');
      pin.setAttribute('width', width);
      pin.setAttribute('height', height);
      div.appendChild(pin);
      const impl = await pin.getImpl(false);
      impl.buildCallback();
      await impl.layoutCallback();
      return pin;
    }

    async function getEmbedPin(pinID, pinAlt, mockResponse) {
      const div = document.createElement('div');
      env.win.document.body.appendChild(div);

      env.fetchMock.getOnce(widgetURL(pinID), {'body': mockResponse});

      const pinURL = 'https://www.pinterest.com/pin/';
      const pin = env.win.document.createElement('amp-pinterest');
      pin.setAttribute('data-do', 'embedPin');
      pin.setAttribute('data-url', pinURL + pinID);
      pin.setAttribute('layout', 'responsive');
      pin.setAttribute('width', '100');
      pin.setAttribute('height', '100');
      if (pinAlt) {
        pin.setAttribute('alt', pinAlt);
      }
      div.appendChild(pin);
      const impl = await pin.getImpl(false);
      impl.buildCallback();
      await impl.layoutCallback();
      return pin;
    }

    it('renders', () => {
      return getPin(
        'buttonPin',
        'http://www.flickr.com/photos/kentbrew/6851755809/',
        'http://c2.staticflickr.com/8/7027/6851755809_df5b2051c9_b.jpg',
        'Next stop: Pinterest'
      ).then((pin) => {
        const a = pin.querySelector('a');
        const href = a.href.replace(/&guid=\w+/, '');
        expect(a).to.not.be.null;
        expect(a.tagName).to.equal('A');
        expect(href).to.equal(
          'https://www.pinterest.com/pin/create/' +
            'button/?amp=1&url=http%3A%2F%2Fwww.flickr.com%' +
            '2Fphotos%2Fkentbrew%2F6851755809%2F&media=http%3A%2F%2Fc2.s' +
            'taticflickr.com%2F8%2F7027%2F6851755809_df5b2051c9_b.jpg&de' +
            'scription=Next%20stop%3A%20Pinterest'
        );
      });
    });

    it('renders text content', () => {
      return getPin(
        'buttonPin',
        'http://www.flickr.com/photos/kentbrew/6851755809/',
        'http://c2.staticflickr.com/8/7027/6851755809_df5b2051c9_b.jpg',
        'Next stop: Pinterest'
      ).then((pin) => {
        const a = pin.querySelector('a');
        expect(a.textContent).to.equal('Save');
      });
    });

    it('renders an aria-label if there is no text content', () => {
      return getPin(
        'buttonPin',
        'http://www.flickr.com/photos/kentbrew/6851755809/',
        'http://c2.staticflickr.com/8/7027/6851755809_df5b2051c9_b.jpg',
        'Next stop: Pinterest',
        100,
        100
      ).then((pin) => {
        const a = pin.querySelector('a');
        expect(a.textContent).to.equal('');
        expect(a.getAttribute('aria-label')).to.equal('Save');
      });
    });

    it('sets provided alternate text', () => {
      return getEmbedPin(
        '99360735500167749',
        'Hands making heart over Pinterest logo',
        {
          'status': 'success',
          'message': 'OK',
          'code': 0,
          'data': [
            {
              'domain': 'flickr.com',
              'attribution': {
                'title': 'Next stop: Pinterest!',
                'url': 'http://www.flickr.com/photos/kentbrew/6851755809/',
                'provider_icon_url':
                  'https://s.pinimg.com/images/api/attrib/flickr@2x.png',
                'author_name': 'kentbrew',
                'provider_favicon_url':
                  'https://s.pinimg.com/images/api/attrib/flickr.png',
                'author_url': 'http://www.flickr.com/photos/kentbrew/',
                'provider_name': 'flickr',
              },
              'description': 'Love my Pinterest t-shirt!',
              'pinner': {
                'about':
                  "Widgeteer, Pinterest. If the Pin It button is broken or confusing, it's my fault.",
                'location': 'Runnymede Poultry Colony',
                'full_name': 'Kent Brewster',
                'follower_count': 4292,
                'image_small_url':
                  'https://i.pinimg.com/30x30_RS/dc/24/76/dc2476722ee6e8c12b6a93d8ac5b6a4d.jpg',
                'pin_count': 5068,
                'id': '99360872937292935',
                'profile_url': 'https://www.pinterest.com/kentbrew/',
              },
              'repin_count': 3444,
              'aggregated_pin_data': {
                'aggregated_stats': {'saves': 109743, 'done': 90},
              },
              'rich_metadata': {
                'aggregated_app_link': {
                  'ipad': null,
                  'android': null,
                  'ios': {
                    'app_url': 'flickr://flickr.com/photos/kentbrew/6851755809',
                    'app_name': 'Flickr',
                    'app_id': '328407587',
                  },
                  'iphone': {
                    'app_url':
                      'flickr://flickr.com/photos/kentbrew/6851755809/',
                    'app_name': 'Flickr',
                    'app_id': '328407587',
                  },
                },
                'has_price_drop': false,
                'site_name': 'Flickr',
                'description':
                  'Today was my last day at Lexity. Next up?  A little start-up in Palo Alto.',
                'link_status': 0,
                'title': 'Next stop: Pinterest!',
                'locale': 'en',
                'amp_valid': false,
                'amp_url': '',
                'url': 'http://www.flickr.com/photos/kentbrew/6851755809/',
                'tracker': null,
                'apple_touch_icon_link':
                  'https://s-media-cache-ak0.pinimg.com/favicons/b4ef6053716205a6beab42b56030364fc1e6dce4e62e863b3e4adb0e.png?a4077badc755ea44f96490b95c0278a4',
                'favicon_images': {
                  'orig':
                    'https://s-media-cache-ak0.pinimg.com/favicons/f1def2d953077deabc5605a6c5f00f6f361a2c491b0ec4bd08f77659.ico?d0236f158c380b9595ffa7c7d7d1a433',
                },
                'article': {
                  'description':
                    'Today was my last day at Lexity. Next up? A little start-up in Palo Alto.',
                  'date_published': null,
                  'authors': [],
                  'type': 'articlemetadata',
                  'id': '140248253674512',
                  'name': 'Next stop: Pinterest!',
                },
                'type': 'richpindataview',
                'id': '811ea1aef1bcaf6342a725365871d79d',
                'apple_touch_icon_images': {
                  'orig':
                    'https://s-media-cache-ak0.pinimg.com/favicons/b4ef6053716205a6beab42b56030364fc1e6dce4e62e863b3e4adb0e.png?a4077badc755ea44f96490b95c0278a4',
                },
                'favicon_link':
                  'https://s-media-cache-ak0.pinimg.com/favicons/f1def2d953077deabc5605a6c5f00f6f361a2c491b0ec4bd08f77659.ico?d0236f158c380b9595ffa7c7d7d1a433',
              },
              'dominant_color': '#e77b60',
              'link': 'http://www.flickr.com/photos/kentbrew/6851755809/',
              'board': {
                'description':
                  "Some of the fun we're having bringing Pinterest to life!",
                'url': '/kentbrew/adventures-at-pinterest/',
                'follower_count': 1128,
                'image_thumbnail_url':
                  'https://s-media-cache-ak0.pinimg.com/upload/99360804217844427_board_thumbnail_2017-07-07-20-33-41_48158_60.jpg',
                'pin_count': 151,
                'id': '99360804217844427',
                'name': 'Adventures at Pinterest',
              },
              'videos': null,
              'images': {
                '237x': {
                  'url':
                    'https://i.pinimg.com/237x/a7/66/56/a76656e966b1958f568d63c3f1c05aec.jpg',
                  'width': 237,
                  'height': 177,
                },
              },
              'embed': null,
              'is_video': false,
              'id': '99360735500167749',
            },
          ],
        }
      ).then((pin) => {
        const img = pin.querySelector('img');
        expect(img.getAttribute('alt')).to.equal(
          'Hands making heart over Pinterest logo'
        );
      });
    });

    it('sets alternate text from pin data provided by Pinterest API', () => {
      return getEmbedPin('228065168607834583', null, {
        'status': 'success',
        'message': 'OK',
        'code': 0,
        'data': [
          {
            'domain': 'flickr.com',
            'attribution': {
              'author_name': 'P Matthews 86',
              'title':
                'End of the line Riding the rails in SF, cable car rails #cablecar #sanfrancisco #endoftheline #tourist #rails #saturdayafternoon #california',
              'provider_favicon_url':
                'https://s.pinimg.com/images/api/attrib/flickr.png',
              'provider_icon_url':
                'https://s.pinimg.com/images/api/attrib/flickr@2x.png',
              'url': 'https://www.flickr.com/photos/p_matthews_86/23103592020/',
              'author_url': 'https://www.flickr.com/photos/p_matthews_86/',
              'cc_url': 'https://creativecommons.org/licenses/by-sa/2.0/',
              'provider_name': 'flickr',
            },
            'description': 'via Instagram ift.tt/1l0lAnd',
            'pinner': {
              'about': '',
              'location': 'London',
              'full_name': 'Paul Matthews&auml;',
              'follower_count': 10,
              'image_small_url':
                'https://i.pinimg.com/30x30_RS/f0/3e/21/f03e21f499084c44fca771555f547474.jpg',
              'pin_count': 196,
              'id': '228065306038242568',
              'profile_url': 'https://www.pinterest.com/paulmatthews86/',
            },
            'repin_count': 2,
            'aggregated_pin_data': {
              'aggregated_stats': {'saves': 3, 'done': 0},
            },
            'rich_metadata': {
              'aggregated_app_link': {
                'ipad': null,
                'android': null,
                'ios': {
                  'app_url':
                    'flickr://flickr.com/photos/p_matthews_86/23103592020',
                  'app_name': 'Flickr',
                  'app_id': '328407587',
                },
                'iphone': {
                  'app_url':
                    'flickr://flickr.com/photos/p_matthews_86/23103592020/',
                  'app_name': 'Flickr',
                  'app_id': '328407587',
                },
              },
              'has_price_drop': false,
              'site_name': 'Flickr',
              'description': 'via Instagram ift.tt/1l0lAnd',
              'link_status': 0,
              'title':
                'End of the line Riding the rails in SF, cable car rails #cablecar #sanfrancisco #endoftheline #tourist #rails #saturdayafternoon #california',
              'locale': 'en',
              'amp_valid': false,
              'amp_url': '',
              'url': 'https://www.flickr.com/photos/p_matthews_86/23103592020/',
              'tracker': null,
              'apple_touch_icon_link':
                'https://s-media-cache-ak0.pinimg.com/favicons/b4ef6053716205a6beab42b56030364fc1e6dce4e62e863b3e4adb0e.png?a4077badc755ea44f96490b95c0278a4',
              'favicon_images': {
                '50x':
                  'https://s-media-cache-ak0.pinimg.com/favicons/50x/f1def2d953077deabc5605a6c5f00f6f361a2c491b0ec4bd08f77659.png?d0236f158c380b9595ffa7c7d7d1a433',
                'orig':
                  'https://s-media-cache-ak0.pinimg.com/favicons/f1def2d953077deabc5605a6c5f00f6f361a2c491b0ec4bd08f77659.ico?d0236f158c380b9595ffa7c7d7d1a433',
              },
              'article': {
                'description': 'via Instagram ift.tt/1l0lAnd',
                'date_published': null,
                'authors': [],
                'type': 'articlemetadata',
                'id': '140701728102800',
                'name':
                  'End of the line Riding the rails in SF, cable car rails #cablecar #sanfrancisco #endoftheline #tourist #rails #saturdayafternoon #california',
              },
              'type': 'richpindataview',
              'id': '1a34d5ec8881989566875143f933e0ef',
              'apple_touch_icon_images': {
                '50x':
                  'https://s-media-cache-ak0.pinimg.com/favicons/50x/b4ef6053716205a6beab42b56030364fc1e6dce4e62e863b3e4adb0e.png?a4077badc755ea44f96490b95c0278a4',
                'orig':
                  'https://s-media-cache-ak0.pinimg.com/favicons/b4ef6053716205a6beab42b56030364fc1e6dce4e62e863b3e4adb0e.png?a4077badc755ea44f96490b95c0278a4',
              },
              'favicon_link':
                'https://s-media-cache-ak0.pinimg.com/favicons/f1def2d953077deabc5605a6c5f00f6f361a2c491b0ec4bd08f77659.ico?d0236f158c380b9595ffa7c7d7d1a433',
            },
            'dominant_color': '#4d4d4d',
            'link': 'https://www.flickr.com/photos/p_matthews_86/23103592020/',
            'board': {
              'description': "Photos I've created or love.",
              'url': '/paulmatthews86/my-photography/',
              'follower_count': 6,
              'image_thumbnail_url':
                'https://s-media-cache-ak0.pinimg.com/upload/228065237318945897_board_thumbnail_2016-05-18-04-07-13_17500_60.jpg',
              'pin_count': 1,
              'id': '228065237318945897',
              'name': 'My Photography',
            },
            'videos': null,
            'images': {
              '237x': {
                'url':
                  'https://i.pinimg.com/237x/83/50/e6/8350e634feec9c503b3c296677cb9367.jpg',
                'width': 237,
                'height': 158,
              },
            },
            'embed': null,
            'is_video': false,
            'id': '228065168607834583',
          },
        ],
      }).then((pin) => {
        const img = pin.querySelector('img');
        expect(img.getAttribute('alt')).to.equal(
          'End of the line Riding the ' +
            'rails in SF, cable car rails #cablecar #sanfrancisco #endoftheline ' +
            '#tourist #rails #saturdayafternoon #california'
        );

        expect(
          pin.querySelector('.-amp-pinterest-embed-pin-pinner-name').textContent
        ).to.equal('Paul Matthewsä');
      });
    });

    it('no alternate text and no title provided by the Pinterest API', () => {
      return getEmbedPin('445786063109072175', null, {
        'status': 'success',
        'message': 'OK',
        'code': 0,
        'data': [
          {
            'domain': 'imgur.com',
            'attribution': null,
            'description':
              'If I ever have a giant yard and home I am getting a Irish Wolfhound. Beautiful dogs.',
            'pinner': {
              'about': '',
              'location': '',
              'full_name': 'Anne Boudka',
              'follower_count': 14,
              'image_small_url':
                'https://s.pinimg.com/images/user/default_30.png',
              'pin_count': 1560,
              'id': '445786200523974985',
              'profile_url': 'https://www.pinterest.com/anneboudka/',
            },
            'repin_count': 1,
            'aggregated_pin_data': {
              'aggregated_stats': {'saves': 678, 'done': 1},
            },
            'rich_metadata': {
              'has_price_drop': false,
              'site_name': 'Imgur',
              'description': 'Post with 656 views. Irish Wolfhound',
              'link_status': 0,
              'title': 'Irish Wolfhound',
              'locale': 'en',
              'type': 'richpindataview',
              'amp_url': '',
              'url': 'http://imgur.com/QGnHw16',
              'tracker': null,
              'apple_touch_icon_link':
                'https://s-media-cache-ak0.pinimg.com/favicons/8d71febee58903bfed9de51eb45c39a7c216fb5ac4b5ecc0f311ae9f.png?9ebf5c7a5a3f79024a5a95daf121f66e',
              'favicon_images': {
                'orig':
                  'https://s-media-cache-ak0.pinimg.com/favicons/7fc3853e33daef02c3ad177f2c983104ec4807da1b9ca187a492ae9d.ico?c2aa5cd03b44bb2ff874837bc56cd85e',
              },
              'article': {
                'description':
                  'Imgur: The most awesome images on the Internet.',
                'date_published': null,
                'authors': [
                  {
                    'type': 'personmetadata',
                    'name': 'Imgur',
                    'id': '140712605429840',
                  },
                ],
                'type': 'articlemetadata',
                'id': '140712605432336',
                'name': 'Irish Wolfhound',
              },
              'amp_valid': false,
              'id': '530b8a3dcee558b2445cfb7fd7dd78d3',
              'apple_touch_icon_images': {
                'orig':
                  'https://s-media-cache-ak0.pinimg.com/favicons/8d71febee58903bfed9de51eb45c39a7c216fb5ac4b5ecc0f311ae9f.png?9ebf5c7a5a3f79024a5a95daf121f66e',
              },
              'favicon_link':
                'https://s-media-cache-ak0.pinimg.com/favicons/7fc3853e33daef02c3ad177f2c983104ec4807da1b9ca187a492ae9d.ico?c2aa5cd03b44bb2ff874837bc56cd85e',
            },
            'dominant_color': '#1a1514',
            'link': 'http://imgur.com/QGnHw16',
            'board': {
              'description': '',
              'url': '/anneboudka/amour/',
              'follower_count': 11,
              'image_thumbnail_url':
                'https://s-media-cache-ak0.pinimg.com/upload/445786131804942196_board_thumbnail_2018-01-18-17-19-13_4918_60.jpg',
              'pin_count': 781,
              'id': '445786131804942196',
              'name': 'Amour',
            },
            'videos': null,
            'images': {
              '237x': {
                'url':
                  'https://i.pinimg.com/237x/b5/34/c1/b534c180c410553cae7b487536b4f226.jpg',
                'width': 237,
                'height': 355,
              },
            },
            'embed': null,
            'is_video': false,
            'id': '445786063109072175',
          },
        ],
      }).then((pin) => {
        const img = pin.querySelector('img');
        expect(img.getAttribute('alt')).to.be.null;
      });
    });
  }
);
