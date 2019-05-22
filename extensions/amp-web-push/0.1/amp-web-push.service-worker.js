/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

/** @fileoverview
  This file is an example implementation for a service worker compatible with
  amp-web-push. This means the service worker accepts window messages (listened
  to via the service worker's 'message' handler), performs some action, and
  replies with a result.

  The service worker listens to postMessage() messages sent from a lightweight
  invisible iframe on the canonical origin. The AMP page sends messages to this
  "helper" iframe, which then forwards the message to the service worker.
  Broadcast replies from the service worker are received by the helper iframe,
  which broadcasts the reply back to the AMP page.
 */

/** @enum {string} */
const WorkerMessengerCommand = {
  /*
    Used to request the current subscription state.
   */
  AMP_SUBSCRIPTION_STATE: 'amp-web-push-subscription-state',
  /*
    Used to request the service worker to subscribe the user to push.
    Notification permissions are already granted at this point.
   */
  AMP_SUBSCRIBE: 'amp-web-push-subscribe',
  /*
    Used to unsusbcribe the user from push.
   */
  AMP_UNSUBSCRIBE: 'amp-web-push-unsubscribe',
};

/*
  According to
  https://w3c.github.io/ServiceWorker/#run-service-worker-algorithm:

  "user agents are encouraged to show a warning that the event listeners
  must be added on the very first evaluation of the worker script."

  We have to register our event handler statically (not within an
  asynchronous method) so that the browser can optimize not waking up the
  service worker for events that aren't known for sure to be listened for.

  Also see: https://github.com/w3c/ServiceWorker/issues/1156
*/
self.addEventListener('message', event => {
  /*
    Messages sent from amp-web-push have the format:

    - command: A string describing the message topic (e.g.
      'amp-web-push-subscribe')

    - payload: An optional JavaScript object containing extra data relevant to
      the command.
   */
  const {command} = event.data;

  switch (command) {
    case WorkerMessengerCommand.AMP_SUBSCRIPTION_STATE:
      onMessageReceivedSubscriptionState();
      break;
    case WorkerMessengerCommand.AMP_SUBSCRIBE:
      onMessageReceivedSubscribe();
      break;
    case WorkerMessengerCommand.AMP_UNSUBSCRIBE:
      onMessageReceivedUnsubscribe();
      break;
  }
});

/**
  Broadcasts a single boolean describing whether the user is subscribed.
 */
function onMessageReceivedSubscriptionState() {
  let retrievedPushSubscription = null;
  self.registration.pushManager
    .getSubscription()
    .then(pushSubscription => {
      retrievedPushSubscription = pushSubscription;
      if (!pushSubscription) {
        return null;
      } else {
        return self.registration.pushManager.permissionState(
          pushSubscription.options
        );
      }
    })
    .then(permissionStateOrNull => {
      if (permissionStateOrNull == null) {
        broadcastReply(WorkerMessengerCommand.AMP_SUBSCRIPTION_STATE, false);
      } else {
        const isSubscribed =
          !!retrievedPushSubscription && permissionStateOrNull === 'granted';
        broadcastReply(
          WorkerMessengerCommand.AMP_SUBSCRIPTION_STATE,
          isSubscribed
        );
      }
    });
}

/**
  Subscribes the visitor to push.

  The broadcast value is null (not used in the AMP page).
 */
function onMessageReceivedSubscribe() {
  /*
    If you're integrating amp-web-push with an existing service worker, use your
    existing subscription code. The subscribe() call below is only present to
    demonstrate its proper location. The 'fake-demo-key' value will not work.

    If you're setting up your own service worker, you'll need to:
      - Generate a VAPID key (see:
        https://developers.google.com/web/updates/2016/07/web-push-interop-wins)
      - Using urlBase64ToUint8Array() from
        https://github.com/web-push-libs/web-push, convert the VAPID key to a
        UInt8 array and supply it to applicationServerKey
   */
  self.registration.pushManager
    .subscribe({
      userVisibleOnly: true,
      applicationServerKey: 'fake-demo-key',
    })
    .then(() => {
      // IMPLEMENT: Forward the push subscription to your server here
      broadcastReply(WorkerMessengerCommand.AMP_SUBSCRIBE, null);
    });
}

/**
  Unsubscribes the subscriber from push.

  The broadcast value is null (not used in the AMP page).
 */
function onMessageReceivedUnsubscribe() {
  self.registration.pushManager
    .getSubscription()
    .then(subscription => subscription.unsubscribe())
    .then(() => {
      // OPTIONALLY IMPLEMENT: Forward the unsubscription to your server here
      broadcastReply(WorkerMessengerCommand.AMP_UNSUBSCRIBE, null);
    });
}

/**
 * Sends a postMessage() to all window frames the service worker controls.
 * @param {string} command
 * @param {!JsonObject} payload
 */
function broadcastReply(command, payload) {
  self.clients.matchAll().then(clients => {
    for (let i = 0; i < clients.length; i++) {
      const client = clients[i];
      client./*OK*/ postMessage({
        command,
        payload,
      });
    }
  });
}
