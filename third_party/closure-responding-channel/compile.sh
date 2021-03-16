#!/bin/bash

# install google closure library:  `npm install google-closure-library` at amphtml
# folder
CLOSURE_LIB=../../node_modules/google-closure-library

npx google-closure-compiler \
  --define=goog.DEBUG=false \
  --compilation_level ADVANCED_OPTIMIZATIONS \
  --formatting=PRETTY_PRINT \
  --output_wrapper "
  const localWindow = Object.create(window);
  (function(window) {
    %output%;
  }).call(window, localWindow);
  export function createPortChannel(frameWindow, origin) {
    return localWindow.__AMP_createPortChannel(frameWindow, origin);
  }
  export function createRespondingChannel(portChannel, serviceHandlersMap) {
    return localWindow.__AMP_createRespondingChannel(portChannel, serviceHandlersMap);
  }
  export function createPortOperator() {
    return localWindow.__AMP_createPortOperator();
  }
  export function addPort(portOperator, portName, portChannel) {
    localWindow.__AMP_addPort(portOperator, portName, portChannel);
  }" \
  --js_output_file "closure-bundle.js" \
  --output_manifest manifest.MF \
  --entry_point "closure-wrapper.js" \
  --js "closure-wrapper.js" \
  --js "$CLOSURE_LIB/closure/goog/base.js" \
  --js "$CLOSURE_LIB/closure/goog/promise/resolver.js" \
  --js "$CLOSURE_LIB/closure/goog/dom/nodetype.js" \
  --js "$CLOSURE_LIB/closure/goog/debug/error.js" \
  --js "$CLOSURE_LIB/closure/goog/debug/errorhandler.js" \
  --js "$CLOSURE_LIB/closure/goog/debug/tracer.js" \
  --js "$CLOSURE_LIB/closure/goog/asserts/asserts.js" \
  --js "$CLOSURE_LIB/closure/goog/async/freelist.js" \
  --js "$CLOSURE_LIB/closure/goog/async/workqueue.js" \
  --js "$CLOSURE_LIB/closure/goog/string/internal.js" \
  --js "$CLOSURE_LIB/closure/goog/structs/simplepool.js" \
  --js "$CLOSURE_LIB/closure/goog/structs/map.js" \
  --js "$CLOSURE_LIB/closure/goog/iter/iter.js" \
  --js "$CLOSURE_LIB/closure/goog/iter/es6.js" \
  --js "$CLOSURE_LIB/closure/goog/object/object.js" \
  --js "$CLOSURE_LIB/closure/goog/labs/useragent/util.js" \
  --js "$CLOSURE_LIB/closure/goog/array/array.js" \
  --js "$CLOSURE_LIB/closure/goog/labs/useragent/browser.js" \
  --js "$CLOSURE_LIB/closure/goog/dom/htmlelement.js" \
  --js "$CLOSURE_LIB/closure/goog/dom/tagname.js" \
  --js "$CLOSURE_LIB/closure/goog/debug/entrypointregistry.js" \
  --js "$CLOSURE_LIB/closure/goog/fs/url.js" \
  --js "$CLOSURE_LIB/closure/goog/string/typedstring.js" \
  --js "$CLOSURE_LIB/closure/goog/string/const.js" \
  --js "$CLOSURE_LIB/closure/goog/i18n/bidi.js" \
  --js "$CLOSURE_LIB/closure/goog/fs/blob.js" \
  --js "$CLOSURE_LIB/closure/goog/html/trustedtypes.js" \
  --js "$CLOSURE_LIB/closure/goog/html/safescript.js" \
  --js "$CLOSURE_LIB/closure/goog/html/trustedresourceurl.js" \
  --js "$CLOSURE_LIB/closure/goog/html/safeurl.js" \
  --js "$CLOSURE_LIB/closure/goog/html/safestyle.js" \
  --js "$CLOSURE_LIB/closure/goog/html/safestylesheet.js" \
  --js "$CLOSURE_LIB/closure/goog/dom/tags.js" \
  --js "$CLOSURE_LIB/closure/goog/html/safehtml.js" \
  --js "$CLOSURE_LIB/closure/goog/html/uncheckedconversions.js" \
  --js "$CLOSURE_LIB/closure/goog/dom/asserts.js" \
  --js "$CLOSURE_LIB/closure/goog/functions/functions.js" \
  --js "$CLOSURE_LIB/closure/goog/dom/safe.js" \
  --js "$CLOSURE_LIB/closure/goog/string/string.js" \
  --js "$CLOSURE_LIB/closure/goog/labs/useragent/platform.js" \
  --js "$CLOSURE_LIB/closure/goog/reflect/reflect.js" \
  --js "$CLOSURE_LIB/closure/goog/labs/useragent/engine.js" \
  --js "$CLOSURE_LIB/closure/goog/useragent/useragent.js" \
  --js "$CLOSURE_LIB/closure/goog/math/size.js" \
  --js "$CLOSURE_LIB/closure/goog/dom/browserfeature.js" \
  --js "$CLOSURE_LIB/closure/goog/math/math.js" \
  --js "$CLOSURE_LIB/closure/goog/math/coordinate.js" \
  --js "$CLOSURE_LIB/closure/goog/dom/dom.js" \
  --js "$CLOSURE_LIB/closure/goog/async/nexttick.js" \
  --js "$CLOSURE_LIB/closure/goog/async/throwexception.js" \
  --js "$CLOSURE_LIB/closure/goog/async/run.js" \
  --js "$CLOSURE_LIB/closure/goog/promise/thenable.js" \
  --js "$CLOSURE_LIB/closure/goog/promise/promise.js" \
  --js "$CLOSURE_LIB/closure/goog/disposable/dispose.js" \
  --js "$CLOSURE_LIB/closure/goog/disposable/disposeall.js" \
  --js "$CLOSURE_LIB/closure/goog/disposable/idisposable.js" \
  --js "$CLOSURE_LIB/closure/goog/disposable/disposable.js" \
  --js "$CLOSURE_LIB/closure/goog/events/eventid.js" \
  --js "$CLOSURE_LIB/closure/goog/events/eventlike.js" \
  --js "$CLOSURE_LIB/closure/goog/events/listenablekey.js" \
  --js "$CLOSURE_LIB/closure/goog/events/listenable.js" \
  --js "$CLOSURE_LIB/closure/goog/events/listener.js" \
  --js "$CLOSURE_LIB/closure/goog/events/listenermap.js" \
  --js "$CLOSURE_LIB/closure/goog/events/event.js" \
  --js "$CLOSURE_LIB/closure/goog/events/browserfeature.js" \
  --js "$CLOSURE_LIB/closure/goog/events/eventtype.js" \
  --js "$CLOSURE_LIB/closure/goog/events/eventwrapper.js" \
  --js "$CLOSURE_LIB/closure/goog/events/eventhandler.js" \
  --js "$CLOSURE_LIB/closure/goog/debug/errorcontext.js" \
  --js "$CLOSURE_LIB/closure/goog/debug/debug.js" \
  --js "$CLOSURE_LIB/closure/goog/events/browserevent.js" \
  --js "$CLOSURE_LIB/closure/goog/events/events.js" \
  --js "$CLOSURE_LIB/closure/goog/events/eventtarget.js" \
  --js "$CLOSURE_LIB/closure/goog/timer/timer.js" \
  --js "$CLOSURE_LIB/closure/goog/json/json.js" \
  --js "$CLOSURE_LIB/closure/goog/debug/logrecord.js" \
  --js "$CLOSURE_LIB/closure/goog/debug/logbuffer.js" \
  --js "$CLOSURE_LIB/closure/goog/debug/logger.js" \
  --js "$CLOSURE_LIB/closure/goog/log/log.js" \
  --js "$CLOSURE_LIB/closure/goog/messaging/messaging.js" \
  --js "$CLOSURE_LIB/closure/goog/messaging/messagechannel.js" \
  --js "$CLOSURE_LIB/closure/goog/messaging/abstractchannel.js" \
  --js "$CLOSURE_LIB/closure/goog/messaging/bufferedchannel.js" \
  --js "$CLOSURE_LIB/closure/goog/messaging/deferredchannel.js" \
  --js "$CLOSURE_LIB/closure/goog/messaging/portchannel.js" \
  --js "$CLOSURE_LIB/closure/goog/messaging/portcaller.js" \
  --js "$CLOSURE_LIB/closure/goog/messaging/portnetwork.js" \
  --js "$CLOSURE_LIB/closure/goog/messaging/portoperator.js" \
  --js "$CLOSURE_LIB/closure/goog/messaging/multichannel.js" \
  --js "$CLOSURE_LIB/closure/goog/messaging/respondingchannel.js" \
  --js "$CLOSURE_LIB/third_party/closure/goog/mochikit/async/deferred.js"
