import {AmpStoryComponentManager} from '../amp-story-component-manager';

self.onload = () => {
  const manager = new AmpStoryComponentManager(self);
  manager.loadEntryPoints();
};
