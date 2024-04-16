import {KeyCodes_Enum, Keys_Enum} from '#core/constants/key-codes';

import {KeyboardHandler} from '../keyboard-handler';
import {Messaging} from '../messaging/messaging';

describes.realWin('KeyboardHandler', {}, (env) => {
  let messages;

  class WindowPortEmulator {
    constructor(win, origin) {
      /** @const {!Window} */
      this.win = win;
      /** @private {string} */
      this.origin_ = origin;
    }

    addEventListener() {}

    postMessage(data, unusedOrigin) {
      messages.push({
        name: data['name'],
        data: data['data'],
      });
    }

    start() {}
  }

  beforeEach(() => {
    messages = [];
    new KeyboardHandler(
      env.win,
      new Messaging(
        env.win,
        new WindowPortEmulator(env.win, 'origin doesnt matter')
      )
    );
  });

  ['keydown', 'keypress', 'keydown'].forEach((eventType) => {
    describe(`for ${eventType} events`, () => {
      describe('when event targeted on window', () => {
        it('forwards ESC events', () => {
          env.win.dispatchEvent(
            new KeyboardEvent(eventType, {
              bubbles: true,
              key: Keys_Enum.ESCAPE,
              keyCode: KeyCodes_Enum.ESCAPE,
            })
          );

          expect(messages).to.have.deep.members([
            {
              name: eventType,
              data: createKeyboardEventInitWithKeyCode(
                Keys_Enum.ESCAPE,
                KeyCodes_Enum.ESCAPE
              ),
            },
          ]);
        });

        it('forwards non-ESC events', () => {
          env.win.dispatchEvent(
            new KeyboardEvent(eventType, {
              bubbles: true,
              key: Keys_Enum.LEFT_ARROW,
              keyCode: KeyCodes_Enum.LEFT_ARROW,
            })
          );

          expect(messages).to.have.deep.members([
            {
              name: eventType,
              data: createKeyboardEventInitWithKeyCode(
                Keys_Enum.LEFT_ARROW,
                KeyCodes_Enum.LEFT_ARROW
              ),
            },
          ]);
        });

        it('does not forward events with default prevented', () => {
          const e = new KeyboardEvent(eventType, {
            bubbles: true,
            cancelable: true,
            key: Keys_Enum.ESCAPE,
            keyCode: KeyCodes_Enum.ESCAPE,
          });
          e.preventDefault();

          env.win.dispatchEvent(e);

          expect(messages).to.be.empty;
        });
      });

      describe('when event targeted on document', () => {
        it('forwards ESC events', () => {
          env.win.document.dispatchEvent(
            new KeyboardEvent(eventType, {
              bubbles: true,
              key: Keys_Enum.ESCAPE,
              keyCode: KeyCodes_Enum.ESCAPE,
            })
          );

          expect(messages).to.have.deep.members([
            {
              name: eventType,
              data: createKeyboardEventInitWithKeyCode(
                Keys_Enum.ESCAPE,
                KeyCodes_Enum.ESCAPE
              ),
            },
          ]);
        });

        it('forwards non-ESC events', () => {
          env.win.document.dispatchEvent(
            new KeyboardEvent(eventType, {
              bubbles: true,
              key: Keys_Enum.LEFT_ARROW,
              keyCode: KeyCodes_Enum.LEFT_ARROW,
            })
          );

          expect(messages).to.have.deep.members([
            {
              name: eventType,
              data: createKeyboardEventInitWithKeyCode(
                Keys_Enum.LEFT_ARROW,
                KeyCodes_Enum.LEFT_ARROW
              ),
            },
          ]);
        });

        it('does not forward events with default prevented', () => {
          const e = new KeyboardEvent(eventType, {
            bubbles: true,
            cancelable: true,
            key: Keys_Enum.ESCAPE,
            keyCode: KeyCodes_Enum.ESCAPE,
          });
          e.preventDefault();

          env.win.document.dispatchEvent(e);

          expect(messages).to.be.empty;
        });
      });

      describe('when event targeted on <html>', () => {
        it('forwards ESC events', () => {
          env.win.document.documentElement.dispatchEvent(
            new KeyboardEvent(eventType, {
              bubbles: true,
              key: Keys_Enum.ESCAPE,
              keyCode: KeyCodes_Enum.ESCAPE,
            })
          );

          expect(messages).to.have.deep.members([
            {
              name: eventType,
              data: createKeyboardEventInitWithKeyCode(
                Keys_Enum.ESCAPE,
                KeyCodes_Enum.ESCAPE
              ),
            },
          ]);
        });

        it('forwards non-ESC events', () => {
          env.win.document.documentElement.dispatchEvent(
            new KeyboardEvent(eventType, {
              bubbles: true,
              key: Keys_Enum.LEFT_ARROW,
              keyCode: KeyCodes_Enum.LEFT_ARROW,
            })
          );

          expect(messages).to.have.deep.members([
            {
              name: eventType,
              data: createKeyboardEventInitWithKeyCode(
                Keys_Enum.LEFT_ARROW,
                KeyCodes_Enum.LEFT_ARROW
              ),
            },
          ]);
        });

        it('does not forward events with default prevented', () => {
          const e = new KeyboardEvent(eventType, {
            bubbles: true,
            cancelable: true,
            key: Keys_Enum.ESCAPE,
            keyCode: KeyCodes_Enum.ESCAPE,
          });
          e.preventDefault();

          env.win.document.documentElement.dispatchEvent(e);

          expect(messages).to.be.empty;
        });
      });

      describe('when event targeted on <body>', () => {
        it('forwards ESC events', () => {
          env.win.document.body.dispatchEvent(
            new KeyboardEvent(eventType, {
              bubbles: true,
              key: Keys_Enum.ESCAPE,
              keyCode: KeyCodes_Enum.ESCAPE,
            })
          );

          expect(messages).to.have.deep.members([
            {
              name: eventType,
              data: createKeyboardEventInitWithKeyCode(
                Keys_Enum.ESCAPE,
                KeyCodes_Enum.ESCAPE
              ),
            },
          ]);
        });

        it('forwards non-ESC events', () => {
          env.win.document.body.dispatchEvent(
            new KeyboardEvent(eventType, {
              bubbles: true,
              key: Keys_Enum.LEFT_ARROW,
              keyCode: KeyCodes_Enum.LEFT_ARROW,
            })
          );

          expect(messages).to.have.deep.members([
            {
              name: eventType,
              data: createKeyboardEventInitWithKeyCode(
                Keys_Enum.LEFT_ARROW,
                KeyCodes_Enum.LEFT_ARROW
              ),
            },
          ]);
        });

        it('does not forward events with default prevented', () => {
          const e = new KeyboardEvent(eventType, {
            bubbles: true,
            cancelable: true,
            key: Keys_Enum.ESCAPE,
            keyCode: KeyCodes_Enum.ESCAPE,
          });
          e.preventDefault();

          env.win.document.body.dispatchEvent(e);

          expect(messages).to.be.empty;
        });
      });

      describe('when event targeted on checkboxes', () => {
        let checkbox;

        beforeEach(() => {
          checkbox = env.win.document.createElement('input');
          checkbox.type = 'checkbox';
          env.win.document.body.appendChild(checkbox);
        });

        it('forwards ESC events', () => {
          checkbox.dispatchEvent(
            new KeyboardEvent(eventType, {
              bubbles: true,
              key: Keys_Enum.ESCAPE,
              keyCode: KeyCodes_Enum.ESCAPE,
            })
          );

          expect(messages).to.have.deep.members([
            {
              name: eventType,
              data: createKeyboardEventInitWithKeyCode(
                Keys_Enum.ESCAPE,
                KeyCodes_Enum.ESCAPE
              ),
            },
          ]);
        });

        it('forwards non-ESC non-space events', () => {
          checkbox.dispatchEvent(
            new KeyboardEvent(eventType, {
              bubbles: true,
              key: Keys_Enum.LEFT_ARROW,
              keyCode: KeyCodes_Enum.LEFT_ARROW,
            })
          );

          expect(messages).to.have.deep.members([
            {
              name: eventType,
              data: createKeyboardEventInitWithKeyCode(
                Keys_Enum.LEFT_ARROW,
                KeyCodes_Enum.LEFT_ARROW
              ),
            },
          ]);
        });

        it('does not forward events with default prevented', () => {
          const e = new KeyboardEvent(eventType, {
            bubbles: true,
            cancelable: true,
            key: Keys_Enum.ESCAPE,
            keyCode: KeyCodes_Enum.ESCAPE,
          });
          e.preventDefault();

          checkbox.dispatchEvent(e);

          expect(messages).to.be.empty;
        });

        it('does not forward space events', () => {
          checkbox.dispatchEvent(
            new KeyboardEvent(eventType, {
              bubbles: true,
              key: Keys_Enum.SPACE,
              keyCode: KeyCodes_Enum.SPACE,
            })
          );

          expect(messages).to.be.empty;
        });
      });

      ['TEXTAREA', 'BUTTON', 'SELECT', 'OPTION'].forEach((nodeName) => {
        describe(`when event targeted on ${nodeName}`, () => {
          let node;

          beforeEach(() => {
            node = env.win.document.createElement(nodeName);
            env.win.document.body.appendChild(node);
          });

          it('forwards ESC events', () => {
            node.dispatchEvent(
              new KeyboardEvent(eventType, {
                bubbles: true,
                key: Keys_Enum.ESCAPE,
                keyCode: KeyCodes_Enum.ESCAPE,
              })
            );

            expect(messages).to.have.deep.members([
              {
                name: eventType,
                data: createKeyboardEventInitWithKeyCode(
                  Keys_Enum.ESCAPE,
                  KeyCodes_Enum.ESCAPE
                ),
              },
            ]);
          });

          it('does not forward events with default prevented', () => {
            const e = new KeyboardEvent(eventType, {
              bubbles: true,
              cancelable: true,
              key: Keys_Enum.ESCAPE,
              keyCode: KeyCodes_Enum.ESCAPE,
            });
            e.preventDefault();

            node.dispatchEvent(e);

            expect(messages).to.be.empty;
          });

          it('does not forward non-ESC events', () => {
            node.dispatchEvent(
              new KeyboardEvent(eventType, {
                bubbles: true,
                key: Keys_Enum.SPACE,
                keyCode: KeyCodes_Enum.SPACE,
              })
            );

            expect(messages).to.be.empty;
          });
        });
      });

      describe('when event targeted on `contenteditable` elements', () => {
        let element;

        beforeEach(() => {
          element = env.win.document.createElement('p');
          element.setAttribute('contenteditable', '');
          env.win.document.body.appendChild(element);
        });

        it('forwards ESC events', () => {
          element.dispatchEvent(
            new KeyboardEvent(eventType, {
              bubbles: true,
              key: Keys_Enum.ESCAPE,
              keyCode: KeyCodes_Enum.ESCAPE,
            })
          );

          expect(messages).to.have.deep.members([
            {
              name: eventType,
              data: createKeyboardEventInitWithKeyCode(
                Keys_Enum.ESCAPE,
                KeyCodes_Enum.ESCAPE
              ),
            },
          ]);
        });

        it('does not forward events with default prevented', () => {
          const e = new KeyboardEvent(eventType, {
            bubbles: true,
            cancelable: true,
            key: Keys_Enum.ESCAPE,
            keyCode: KeyCodes_Enum.ESCAPE,
          });
          e.preventDefault();

          element.dispatchEvent(e);

          expect(messages).to.be.empty;
        });

        it('does not forward non-ESC events', () => {
          element.dispatchEvent(
            new KeyboardEvent(eventType, {
              bubbles: true,
              key: Keys_Enum.SPACE,
              keyCode: KeyCodes_Enum.SPACE,
            })
          );

          expect(messages).to.be.empty;
        });
      });

      it('forwards multiple events', () => {
        env.win.document.documentElement.dispatchEvent(
          new KeyboardEvent(eventType, {
            bubbles: true,
            key: Keys_Enum.LEFT_ARROW,
            keyCode: KeyCodes_Enum.LEFT_ARROW,
          })
        );
        env.win.document.body.dispatchEvent(
          new KeyboardEvent(eventType, {
            bubbles: true,
            key: Keys_Enum.RIGHT_ARROW,
            keyCode: KeyCodes_Enum.RIGHT_ARROW,
          })
        );

        expect(messages).to.have.deep.members([
          {
            name: eventType,
            data: createKeyboardEventInitWithKeyCode(
              Keys_Enum.LEFT_ARROW,
              KeyCodes_Enum.LEFT_ARROW
            ),
          },
          {
            name: eventType,
            data: createKeyboardEventInitWithKeyCode(
              Keys_Enum.RIGHT_ARROW,
              KeyCodes_Enum.RIGHT_ARROW
            ),
          },
        ]);
      });

      it('filters event properties', () => {
        env.win.document.body.dispatchEvent(
          new KeyboardEvent(eventType, {
            altKey: true,
            bubbles: true,
            cancelBubble: false,
            cancelable: false,
            charCode: 1,
            code: 'KeyE',
            isComposing: true,
            ctrlKey: true,
            detail: 1,
            key: 'e',
            keyCode: 69,
            location: 3,
            metaKey: true,
            repeat: true,
            shiftKey: true,
            which: 69,
          })
        );

        expect(messages).to.have.deep.members([
          {
            name: eventType,
            data: {
              altKey: true,
              charCode: 1,
              code: 'KeyE',
              isComposing: true,
              ctrlKey: true,
              key: 'e',
              keyCode: 69,
              location: 3,
              metaKey: true,
              repeat: true,
              shiftKey: true,
              which: 69,
            },
          },
        ]);
      });
    });
  });
});

/**
 * Creates a `KeyboardEventInit` object with default properties overridden by
 * the given key code.
 *
 * @param {string} key
 * @param {number} keyCode
 * @return {!JsonObject}
 */
function createKeyboardEventInitWithKeyCode(key, keyCode) {
  return createKeyboardEventInit({key, keyCode, which: keyCode});
}

/**
 * Creates a `KeyboardEventInit` object with default properties overridden by
 * the given partial override init object.
 *
 * @param {!JsonObject} overrideKeyboardEventInit
 * @return {!JsonObject}
 */
function createKeyboardEventInit(overrideKeyboardEventInit) {
  return {
    key: '',
    code: '',
    location: 0,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    repeat: false,
    isComposing: false,
    charCode: 0,
    keyCode: 0,
    which: 0,
    ...overrideKeyboardEventInit,
  };
}
