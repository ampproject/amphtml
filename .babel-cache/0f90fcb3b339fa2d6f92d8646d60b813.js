/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

/**
 * Required flags to apply to the sandbox iframe.
 * @return {Array<string>}
 */
export var getRequiredSandboxFlags = function getRequiredSandboxFlags() {
  return [// This only allows navigation when user interacts and thus prevents
  // ads from auto navigating the user.
  'allow-top-navigation-by-user-activation', // Crucial because otherwise even target=_blank opened links are
  // still sandboxed which they may not expect.
  'allow-popups-to-escape-sandbox'];
};

/**
 * These flags are not feature detected. Put stuff here where either
 * they have always been supported or support is not crucial.
 * @return {Array<string>}
 */
export var getOptionalSandboxFlags = function getOptionalSandboxFlags() {
  return ['allow-forms', // We should consider turning this off! But since the top navigation
  // issue is the big one, we'll leave this allowed for now.
  'allow-modals', // Give access to raw mouse movements.
  'allow-pointer-lock', // This remains subject to popup blocking, it just makes it supported
  // at all.
  'allow-popups', // This applies inside the iframe and is crucial to not break the web.
  'allow-same-origin', 'allow-scripts' // Not allowed
  // - allow-top-navigation
  // - allow-orientation-lock
  // - allow-pointer-lock
  // - allow-presentation
  ];
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIjNwLWZyYW1lLmpzIl0sIm5hbWVzIjpbImdldFJlcXVpcmVkU2FuZGJveEZsYWdzIiwiZ2V0T3B0aW9uYWxTYW5kYm94RmxhZ3MiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sSUFBTUEsdUJBQXVCLEdBQUcsU0FBMUJBLHVCQUEwQjtBQUFBLFNBQU0sQ0FDM0M7QUFDQTtBQUNBLDJDQUgyQyxFQUkzQztBQUNBO0FBQ0Esa0NBTjJDLENBQU47QUFBQSxDQUFoQzs7QUFTUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTyxJQUFNQyx1QkFBdUIsR0FBRyxTQUExQkEsdUJBQTBCO0FBQUEsU0FBTSxDQUMzQyxhQUQyQyxFQUUzQztBQUNBO0FBQ0EsZ0JBSjJDLEVBSzNDO0FBQ0Esc0JBTjJDLEVBTzNDO0FBQ0E7QUFDQSxnQkFUMkMsRUFVM0M7QUFDQSxxQkFYMkMsRUFZM0MsZUFaMkMsQ0FhM0M7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQWpCMkMsR0FBTjtBQUFBLENBQWhDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb3B5cmlnaHQgMjAyMSBUaGUgQU1QIEhUTUwgQXV0aG9ycy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpO1xuICogeW91IG1heSBub3QgdXNlIHRoaXMgZmlsZSBleGNlcHQgaW4gY29tcGxpYW5jZSB3aXRoIHRoZSBMaWNlbnNlLlxuICogWW91IG1heSBvYnRhaW4gYSBjb3B5IG9mIHRoZSBMaWNlbnNlIGF0XG4gKlxuICogICAgICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcbiAqXG4gKiBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gKiBkaXN0cmlidXRlZCB1bmRlciB0aGUgTGljZW5zZSBpcyBkaXN0cmlidXRlZCBvbiBhbiBcIkFTLUlTXCIgQkFTSVMsXG4gKiBXSVRIT1VUIFdBUlJBTlRJRVMgT1IgQ09ORElUSU9OUyBPRiBBTlkgS0lORCwgZWl0aGVyIGV4cHJlc3Mgb3IgaW1wbGllZC5cbiAqIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZyBwZXJtaXNzaW9ucyBhbmRcbiAqIGxpbWl0YXRpb25zIHVuZGVyIHRoZSBMaWNlbnNlLlxuICovXG5cbi8qKlxuICogUmVxdWlyZWQgZmxhZ3MgdG8gYXBwbHkgdG8gdGhlIHNhbmRib3ggaWZyYW1lLlxuICogQHJldHVybiB7QXJyYXk8c3RyaW5nPn1cbiAqL1xuZXhwb3J0IGNvbnN0IGdldFJlcXVpcmVkU2FuZGJveEZsYWdzID0gKCkgPT4gW1xuICAvLyBUaGlzIG9ubHkgYWxsb3dzIG5hdmlnYXRpb24gd2hlbiB1c2VyIGludGVyYWN0cyBhbmQgdGh1cyBwcmV2ZW50c1xuICAvLyBhZHMgZnJvbSBhdXRvIG5hdmlnYXRpbmcgdGhlIHVzZXIuXG4gICdhbGxvdy10b3AtbmF2aWdhdGlvbi1ieS11c2VyLWFjdGl2YXRpb24nLFxuICAvLyBDcnVjaWFsIGJlY2F1c2Ugb3RoZXJ3aXNlIGV2ZW4gdGFyZ2V0PV9ibGFuayBvcGVuZWQgbGlua3MgYXJlXG4gIC8vIHN0aWxsIHNhbmRib3hlZCB3aGljaCB0aGV5IG1heSBub3QgZXhwZWN0LlxuICAnYWxsb3ctcG9wdXBzLXRvLWVzY2FwZS1zYW5kYm94Jyxcbl07XG5cbi8qKlxuICogVGhlc2UgZmxhZ3MgYXJlIG5vdCBmZWF0dXJlIGRldGVjdGVkLiBQdXQgc3R1ZmYgaGVyZSB3aGVyZSBlaXRoZXJcbiAqIHRoZXkgaGF2ZSBhbHdheXMgYmVlbiBzdXBwb3J0ZWQgb3Igc3VwcG9ydCBpcyBub3QgY3J1Y2lhbC5cbiAqIEByZXR1cm4ge0FycmF5PHN0cmluZz59XG4gKi9cbmV4cG9ydCBjb25zdCBnZXRPcHRpb25hbFNhbmRib3hGbGFncyA9ICgpID0+IFtcbiAgJ2FsbG93LWZvcm1zJyxcbiAgLy8gV2Ugc2hvdWxkIGNvbnNpZGVyIHR1cm5pbmcgdGhpcyBvZmYhIEJ1dCBzaW5jZSB0aGUgdG9wIG5hdmlnYXRpb25cbiAgLy8gaXNzdWUgaXMgdGhlIGJpZyBvbmUsIHdlJ2xsIGxlYXZlIHRoaXMgYWxsb3dlZCBmb3Igbm93LlxuICAnYWxsb3ctbW9kYWxzJyxcbiAgLy8gR2l2ZSBhY2Nlc3MgdG8gcmF3IG1vdXNlIG1vdmVtZW50cy5cbiAgJ2FsbG93LXBvaW50ZXItbG9jaycsXG4gIC8vIFRoaXMgcmVtYWlucyBzdWJqZWN0IHRvIHBvcHVwIGJsb2NraW5nLCBpdCBqdXN0IG1ha2VzIGl0IHN1cHBvcnRlZFxuICAvLyBhdCBhbGwuXG4gICdhbGxvdy1wb3B1cHMnLFxuICAvLyBUaGlzIGFwcGxpZXMgaW5zaWRlIHRoZSBpZnJhbWUgYW5kIGlzIGNydWNpYWwgdG8gbm90IGJyZWFrIHRoZSB3ZWIuXG4gICdhbGxvdy1zYW1lLW9yaWdpbicsXG4gICdhbGxvdy1zY3JpcHRzJyxcbiAgLy8gTm90IGFsbG93ZWRcbiAgLy8gLSBhbGxvdy10b3AtbmF2aWdhdGlvblxuICAvLyAtIGFsbG93LW9yaWVudGF0aW9uLWxvY2tcbiAgLy8gLSBhbGxvdy1wb2ludGVyLWxvY2tcbiAgLy8gLSBhbGxvdy1wcmVzZW50YXRpb25cbl07XG4iXX0=
// /Users/mszylkowski/src/amphtml/src/core/3p-frame.js