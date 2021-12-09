import {onDocumentReady} from '#core/document/ready';

import {AmpStoryComponentManager} from './amp-story-component-manager';
import {AmpStoryPlayer} from './amp-story-player-impl';

onDocumentReady(self.document, () => {
  console.log('ondocument ready before loading players');
  const manager = new AmpStoryComponentManager(self);
  manager.loadPlayers();
});

globalThis.AmpStoryPlayer = AmpStoryPlayer;
