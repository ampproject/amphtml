import {onDocumentReady} from '#core/document/ready';

import {AmpStoryComponentManager} from './amp-story-component-manager';
import {AmpStoryPlayer} from './amp-story-player-impl';

onDocumentReady(self.document, () => {
  const manager = new AmpStoryComponentManager(self);
  manager.loadPlayers();
});

globalThis.AmpStoryPlayer = AmpStoryPlayer;
