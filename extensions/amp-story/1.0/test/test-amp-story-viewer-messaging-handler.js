/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import {
  Action,
  StateProperty,
  getStoreService,
} from '../amp-story-store-service';
import {AmpStoryViewerMessagingHandler} from '../amp-story-viewer-messaging-handler';
import {HistoryState, setHistoryState} from '../utils';

describes.fakeWin('amp-story-viewer-messaging-handler', {}, env => {
  let fakeViewerService;
  let storeService;
  let viewerMessagingHandler;

  beforeEach(() => {
    fakeViewerService = {
      responderMap: {},
      onMessageRespond(eventType, responder) {
        this.responderMap[eventType] = responder;
      },
      receiveMessage(eventType, data) {
        if (!this.responderMap[eventType]) {
          return;
        }
        return this.responderMap[eventType](data);
      },
    };
    viewerMessagingHandler = new AmpStoryViewerMessagingHandler(
      env.win,
      fakeViewerService
    );
    viewerMessagingHandler.startListening();
    storeService = getStoreService(env.win);
  });

  describe('getDocumentState', () => {
    it('should throw if no state', async () => {
      try {
        await fakeViewerService.receiveMessage('getDocumentState', undefined);
        return Promise.reject('Previous line should throw an error');
      } catch (error) {
        expect(error).to.equal(`Invalid 'state' parameter`);
      }
    });

    it('should throw if invalid state', async () => {
      try {
        await fakeViewerService.receiveMessage('getDocumentState', {
          state: 'UNEXISTING_STATE',
        });
        return Promise.reject('Previous line should throw an error');
      } catch (error) {
        expect(error).to.equal(`Invalid 'state' parameter`);
      }
    });

    it('should return the MUTED_STATE', async () => {
      const response = await fakeViewerService.receiveMessage(
        'getDocumentState',
        {state: 'MUTED_STATE'}
      );
      expect(response).to.deep.equal({
        state: 'MUTED_STATE',
        value: storeService.get(StateProperty.MUTED_STATE),
      });
    });

    it('should return the CURRENT_PAGE_ID', async () => {
      storeService.dispatch(Action.CHANGE_PAGE, {id: 'foo', index: 0});
      const response = await fakeViewerService.receiveMessage(
        'getDocumentState',
        {state: 'CURRENT_PAGE_ID'}
      );
      expect(response).to.deep.equal({
        state: 'CURRENT_PAGE_ID',
        value: storeService.get(StateProperty.CURRENT_PAGE_ID),
      });
    });

    it('should return the PAGE_ATTACHMENT_STATE', async () => {
      setHistoryState(env.win, HistoryState.ATTACHMENT_PAGE_ID, 'SOME_ID');
      const response = await fakeViewerService.receiveMessage(
        'getDocumentState',
        {state: 'PAGE_ATTACHMENT_STATE'}
      );
      expect(response).to.deep.equal({
        state: 'PAGE_ATTACHMENT_STATE',
        value: true,
      });
      setHistoryState(env.win, HistoryState.ATTACHMENT_PAGE_ID, null);
    });

    it('should return the STORY_PROGRESS', async () => {
      storeService.dispatch(Action.SET_PAGE_IDS, [1, 2, 3, 4]);
      storeService.dispatch(Action.CHANGE_PAGE, {id: 3, index: 2});
      const response = await fakeViewerService.receiveMessage(
        'getDocumentState',
        {state: 'STORY_PROGRESS'}
      );
      expect(response).to.deep.equal({
        state: 'STORY_PROGRESS',
        value: 0.5,
      });
    });
  });

  describe('setDocumentState', () => {
    it('should throw if no state', async () => {
      try {
        await fakeViewerService.receiveMessage('setDocumentState', undefined);
        return Promise.reject('Previous line should throw an error');
      } catch (error) {
        expect(error).to.equal(`Invalid 'state' parameter`);
      }
    });

    it('should throw if invalid state', async () => {
      try {
        await fakeViewerService.receiveMessage('setDocumentState', {
          state: 'UNEXISTING_STATE',
          value: true,
        });
        return Promise.reject('Previous line should throw an error');
      } catch (error) {
        expect(error).to.equal(`Invalid 'state' parameter`);
      }
    });

    it('should throw if no value', async () => {
      try {
        await fakeViewerService.receiveMessage('setDocumentState', {
          state: 'MUTED_STATE',
        });
        return Promise.reject('Previous line should throw an error');
      } catch (error) {
        expect(error).to.equal(`Invalid 'value' parameter`);
      }
    });

    it('should throw if invalid value', async () => {
      try {
        await fakeViewerService.receiveMessage('setDocumentState', {
          state: 'MUTED_STATE',
          value: 'true' /** only accepts booleans */,
        });
        return Promise.reject('Previous line should throw an error');
      } catch (error) {
        expect(error).to.equal(`Invalid 'value' parameter`);
      }
    });

    it('should set a state', async () => {
      storeService.dispatch(Action.TOGGLE_MUTED, false);
      await fakeViewerService.receiveMessage('setDocumentState', {
        state: 'MUTED_STATE',
        value: true,
      });
      expect(storeService.get(StateProperty.MUTED_STATE)).to.be.true;
    });
  });
});
