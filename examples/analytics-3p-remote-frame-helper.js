
class AmpAnalyticsInstance {
  constructor() {
    this.listener = null;
  }

  registerAmpAnalyticsEventListener(listener) {
    this.listener = listener;
  }
};
let instance = new AmpAnalyticsInstance();

// The onNewAmpAnalyticsInstance() function must be implemented by the
// vendor's page
if (onNewAmpAnalyticsInstance) {
  onNewAmpAnalyticsInstance(instance);
  // Warning: the following code is likely only temporary. Don't check in
  // before getting resolution on that.
  window.addEventListener("message", (msg) => {
    if (msg.data.ampAnalyticsEvents) {
      instance.listener(msg.data.ampAnalyticsEvents);
    }
  });
} else {
  console.error("Vendor page must implement onNewAmpAnalyticsInstance.");
}
