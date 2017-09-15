const EXTENSION_READY = 'extensionready';

export function extensionReady(element) {
    if (element) {
        element.dispatchCustomEvent(EXTENSION_READY)
    }
}
