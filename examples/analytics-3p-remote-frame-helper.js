
class AmpAnalyticsRemoteFrameManager {
  constructor() {
    this.listener = null;
  }

  registerAmpAnalyticsEventListener(listener) {
    this.listener = listener;
  }
};
const remoteFrameMgr = new AmpAnalyticsRemoteFrameManager();

// The onNewAmpAnalyticsInstance() function must be implemented by the
// vendor's page
if (window.onNewAmpAnalyticsInstance) {
  window.onNewAmpAnalyticsInstance(remoteFrameMgr);
  // Warning: the following code is likely only temporary. Don't check in
  // before getting resolution on that.
  window.addEventListener("message", (msg) => {
    if (msg.data.ampAnalyticsEvents) {
      remoteFrameMgr.listener(msg.data.ampAnalyticsEvents);
    }
  });
} else {
  console.error("Vendor page must implement onNewAmpAnalyticsInstance.");
}
