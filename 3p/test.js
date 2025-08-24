// test.js
import {IntegrationAmpContext} from './ampcontext-integration.js';

// Mock minimal environment
globalThis.context = {
  isMaster: true,
  master: globalThis,
};

// Fake "client" with sendMessage logging
class FakeClient {
  sendMessage(type, data) {
    console.log('[Client Message]', type, data || '');
  }
}

// Extend IntegrationAmpContext to inject fake client
class TestContext extends IntegrationAmpContext {
  constructor(win, type) {
    super(win, type);
    this.client_ = new FakeClient();
  }
}

// Run test
const ctx = new TestContext(globalThis, 'twitter');

// Test computeInCoordinatingFrame
ctx.computeInCoordinatingFrame(
  globalThis,
  'task1',
  (done) => {
    console.log('[Work] Running inside coordinating frame...');
    setTimeout(() => done('✅ Finished work'), 500);
  },
  (result) => {
    console.log('[Callback] Got result:', result);
  }
);

// Test other methods
ctx.bootstrapLoaded();
ctx.renderStart({width: 300, height: 150});
ctx.reportRenderedEntityIdentifier('entity_12345');
