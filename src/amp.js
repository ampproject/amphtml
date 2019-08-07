/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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
 * The entry point for AMP Runtime (v0.js) when AMP Runtime = AMP Doc.
 */

// src/polyfills.js must be the first import.
import './polyfills'; // eslint-disable-line sort-imports-es6-autofix/sort-imports-es6

import {Services} from './services';
import {adopt} from './runtime';
import {cssText as ampDocCss} from '../build/ampdoc.css';
import {cssText as ampSharedCss} from '../build/ampshared.css';
import {fontStylesheetTimeout} from './font-stylesheet-timeout';
import {
  installAmpdocServices,
  installBuiltinElements,
  installRuntimeServices,
} from './service/core-services';
import {installAutoLightboxExtension} from './auto-lightbox';
import {installDocService} from './service/ampdoc-impl';
import {installErrorReporting} from './error';
import {installPerformanceService} from './service/performance-impl';
import {installPlatformService} from './service/platform-impl';
import {installPullToRefreshBlocker} from './pull-to-refresh';
import {
  installStylesForDoc,
  makeBodyVisible,
  makeBodyVisibleRecovery,
} from './style-installer';
import {internalRuntimeVersion} from './internal-version';
import {maybeTrackImpression} from './impression';
import {maybeValidate} from './validator-integration';
import {startupChunk} from './chunk';
import {stubElementsForDoc} from './service/custom-element-registry';

/**
 * self.IS_AMP_ALT (is AMP alternative binary) is undefined by default in the
 * main v0.js since it is the "main" js.
 * This global boolean is set by alternative binaries like amp-inabox and
 * amp-shadow which has their own bootstrapping sequence.
 * With how single pass works these alternative binaries cannot be generated
 * easily because we can only do a "single pass" so we treat these alternative
 * main binaries as "extensions" and we concatenate their code with the main
 * v0.js code.
 * @type {boolean|undefined}
 */
const shouldMainBootstrapRun = !self.IS_AMP_ALT;

if (shouldMainBootstrapRun) {
  // Store the originalHash as early as possible. Trying to debug:
  // https://github.com/ampproject/amphtml/issues/6070
  if (self.location) {
    self.location.originalHash = self.location.hash;
  }

  /** @type {!./service/ampdoc-impl.AmpDocService} */
  let ampdocService;
  // We must under all circumstances call makeBodyVisible.
  // It is much better to have AMP tags not rendered than having
  // a completely blank page.
  try {
    // Should happen first.
    installErrorReporting(self); // Also calls makeBodyVisibleRecovery on errors.

    // Declare that this runtime will support a single root doc. Should happen
    // as early as possible.
    installDocService(self, /* isSingleDoc */ true);
    ampdocService = Services.ampdocServiceFor(self);
  } catch (e) {
    // In case of an error call this.
    makeBodyVisibleRecovery(self.document);
    throw e;
  }
  startupChunk(self.document, function initial() {
    /** @const {!./service/ampdoc-impl.AmpDoc} */
    const ampdoc = ampdocService.getAmpDoc(self.document);
    installPerformanceService(self);
    /** @const {!./service/performance-impl.Performance} */
    const perf = Services.performanceFor(self);
    if (
      self.document.documentElement.hasAttribute('i-amphtml-no-boilerplate')
    ) {
      perf.addEnabledExperiment('no-boilerplate');
    }
    installPlatformService(self);
    fontStylesheetTimeout(self);
    perf.tick('is');
    installStylesForDoc(
      ampdoc,
      ampDocCss + ampSharedCss,
      () => {
        startupChunk(self.document, function services() {
          // Core services.
          installRuntimeServices(self);
          installAmpdocServices(ampdoc);
          // We need the core services (viewer/resources) to start instrumenting
          perf.coreServicesAvailable();
          maybeTrackImpression(self);
        });
        startupChunk(self.document, function adoptWindow() {
          adopt(self);
        });
        startupChunk(self.document, function builtins() {
          // Builtins.
          installBuiltinElements(self);
        });
        startupChunk(self.document, function stub() {
          // Pre-stub already known elements.
          stubElementsForDoc(ampdoc);
        });
        startupChunk(
          self.document,
          function final() {
            installPullToRefreshBlocker(self);
            installAutoLightboxExtension(ampdoc);

            maybeValidate(self);
            makeBodyVisible(self.document);
          },
          /* makes the body visible */ true
        );
        startupChunk(self.document, function finalTick() {
          perf.tick('e_is');
          Services.resourcesForDoc(ampdoc).ampInitComplete();
          // TODO(erwinm): move invocation of the `flush` method when we have the
          // new ticks in place to batch the ticks properly.
          perf.flush();
        });
      },
      /* opt_isRuntimeCss */ true,
      /* opt_ext */ 'amp-runtime'
    );
  });

  // Output a message to the console and add an attribute to the <html>
  // tag to give some information that can be used in error reports.
  // (At least by sophisticated users).
  if (self.console) {
    (console.info || console.log).call(
      console,
      `Powered by AMP ⚡ HTML – Version ${internalRuntimeVersion()}` +
        `Lorem ipsum dolor sit amet, consectetur adipiscing elit. In posuere lectus quis arcu convallis, eget placerat ipsum vulputate. Pellentesque et lacus eget sapien dictum rutrum. Donec blandit diam mauris, ut cursus elit porttitor vel. Morbi luctus, turpis a venenatis sagittis, elit tellus pretium sem, quis pellentesque purus tellus sed justo. Maecenas hendrerit nec lectus vitae gravida. Vestibulum ut suscipit orci, et tincidunt lacus. Aliquam luctus consequat quam, vitae euismod nulla mattis quis. Nam lobortis magna at erat scelerisque venenatis tristique nec sem. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque posuere nisl in venenatis venenatis. Donec blandit maximus leo, quis consectetur ligula euismod nec. Vivamus lobortis ornare purus.

Nulla ultrices efficitur varius. Morbi sagittis fringilla ante, sed gravida tortor tristique nec. Donec vehicula gravida ex, vel aliquam tortor cursus non. Donec ornare augue non leo pretium, vel tincidunt risus varius. Nullam eget luctus velit. Integer eu eros in magna cursus tristique et mollis turpis. Donec pharetra, magna laoreet hendrerit euismod, lacus enim maximus turpis, ornare rhoncus lectus est id felis. Integer vel maximus tellus, interdum viverra ipsum. Donec dolor massa, suscipit nec est at, pulvinar pellentesque dolor. Praesent quis tortor in dui suscipit pulvinar ut a arcu. Proin sapien ante, tristique ac egestas quis, imperdiet in lectus. Etiam lectus metus, accumsan ut quam vitae, pellentesque lacinia leo. Suspendisse efficitur dolor ut sapien congue, in rutrum sem sollicitudin. Vivamus vestibulum, leo in tincidunt convallis, leo enim consequat leo, a maximus risus urna id urna.

Donec bibendum vehicula fringilla. Duis et neque nec ex vehicula iaculis. Proin hendrerit, est vitae vulputate lacinia, metus erat accumsan arcu, quis feugiat diam odio eget purus. Sed hendrerit mi ac felis rutrum molestie non quis magna. Vestibulum ultrices pellentesque purus, sit amet consequat arcu euismod vitae. Cras placerat ante quis nisl pharetra, a viverra nibh vestibulum. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Praesent ac vulputate elit.

Sed sit amet rhoncus augue. Nam vehicula, est a imperdiet commodo, erat sem viverra libero, eu pellentesque sem ante ac justo. Phasellus risus ante, volutpat ut varius nec, laoreet sed lacus. Vestibulum libero urna, mollis ut lectus vitae, maximus congue lectus. Aliquam facilisis facilisis elit eget commodo. Morbi in urna sit amet tellus cursus tempus. Ut pellentesque, ex mollis rhoncus viverra, purus magna semper velit, quis faucibus nunc mauris eget dolor. Donec nec lacus ultrices, semper tortor a, hendrerit risus. Nunc vehicula lacus nunc, sed consequat ex fringilla quis. Praesent facilisis nunc quis vehicula commodo. Vivamus quis augue orci. Praesent sodales consectetur nulla quis tempus. Vestibulum tempor sapien a magna tincidunt, ut elementum tellus laoreet. Nullam non arcu nec sem ultricies venenatis sit amet vel dui.

Nunc interdum justo quis aliquet cursus. Suspendisse potenti. Vivamus fringilla et nisi in tristique. Proin tincidunt nibh eu sodales volutpat. Vivamus nibh purus, molestie eget ante in, tristique euismod nunc. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Morbi dapibus dui sapien, ut auctor nulla interdum non. Suspendisse sed vehicula tortor, quis pretium sapien.

Aenean pharetra semper justo, id consequat nisi elementum vel. In hac habitasse platea dictumst. Mauris in dolor venenatis, maximus felis a, pretium elit. Proin sollicitudin congue nunc at mollis. Aliquam ac nunc vehicula, consequat massa eu, rhoncus enim. In faucibus lacus vel augue ultrices, id commodo tellus congue. Sed mattis ligula purus, in fringilla velit faucibus quis. Vivamus dictum, nunc eu feugiat sollicitudin, dui risus condimentum ligula, a blandit felis tortor nec diam. Nunc et neque lorem. Duis sagittis tincidunt dolor, ut facilisis sapien venenatis et. Fusce pellentesque odio neque. Integer nec nunc felis.

Phasellus condimentum rhoncus felis eget ultricies. Nulla nec justo id augue eleifend tincidunt. Pellentesque ac vestibulum eros. Morbi lobortis sapien ut ante vestibulum, egestas volutpat sem molestie. Nullam nec lorem laoreet, commodo nunc sed, consectetur augue. Fusce iaculis tellus est, vitae volutpat turpis consequat at. Duis pharetra, nisl ac eleifend scelerisque, odio lectus pretium augue, nec malesuada libero ex vel libero. Vestibulum quis enim sit amet neque fermentum ultricies. Vivamus commodo justo maximus, pretium lectus sed, facilisis elit.

Maecenas dui quam, pulvinar eu molestie sit amet, hendrerit in magna. Morbi eu ipsum vitae metus tempor congue a quis est. Morbi euismod elit at nisl viverra rhoncus et at nunc. Nunc dictum id magna at tincidunt. Cras non sem ligula. Nulla pellentesque in erat sit amet pulvinar. Suspendisse potenti. Pellentesque ac quam finibus, dictum velit sit amet, vulputate neque. Maecenas venenatis massa et elit egestas lacinia ut eu quam. Cras efficitur nec eros at varius. Nullam a lacinia nisl. Cras massa felis, bibendum id metus et, tristique posuere ipsum.

Sed ex leo, aliquet in dapibus vel, varius ac nibh. Phasellus lacinia sit amet arcu id tempor. Duis sagittis nisl sit amet tellus pulvinar scelerisque. Suspendisse id vestibulum metus, nec fringilla justo. Duis mi massa, lacinia at nibh sit amet, sagittis sagittis est. Lorem ipsum dolor sit amet, consectetur adipiscing elit. In a justo ipsum.

Vivamus dapibus pulvinar tellus, non ultrices sem interdum quis. Maecenas at elit lorem. Duis vitae dui convallis, molestie augue ac, volutpat turpis. Suspendisse vitae sagittis nunc, ut feugiat dui. Nam sit amet mattis turpis. Proin at urna molestie, dignissim nisi id, mattis dolor. Sed sit amet sapien non ex accumsan congue eget ut ante. Morbi sit amet metus felis. Nunc sagittis velit eu nunc elementum pellentesque. Nunc imperdiet, nunc ut eleifend pellentesque, nisl justo gravida augue, eget commodo felis nunc sit amet nunc. Vestibulum sed tempor turpis. Mauris eu sem nec purus sodales viverra id sit amet dolor. Maecenas hendrerit eleifend aliquam. Sed pretium mauris nisi, vitae accumsan est interdum at.

Vivamus nec placerat diam. Nullam blandit at lectus non lacinia. Sed euismod iaculis erat, eu laoreet ex tincidunt aliquet. Sed eget augue ex. Donec sed dignissim tortor, lobortis condimentum nisl. Aliquam hendrerit erat lectus, eget pharetra tortor fringilla sit amet. Suspendisse commodo ultrices tristique. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nullam aliquet finibus purus, vel facilisis urna semper ac. Maecenas placerat nisi at sem consectetur ullamcorper. Mauris dictum ex a leo euismod aliquam. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.

Aliquam vel lacus non mi semper scelerisque non a sapien. Phasellus malesuada nulla quis nisi posuere condimentum. Aliquam erat volutpat. Nullam et felis in lorem molestie facilisis. Morbi sed turpis nunc. Curabitur mattis, turpis non tempus lobortis, mi turpis porttitor enim, at auctor magna libero vel ligula. Nunc vel maximus turpis, vitae consequat mi. Vivamus velit dolor, faucibus at diam hendrerit, maximus lobortis tortor. Fusce vel urna ante.

Donec pellentesque iaculis neque, vitae sodales mi dignissim vestibulum. Curabitur viverra mollis magna, id rutrum lectus venenatis eu. Praesent faucibus elementum nunc ut molestie. Nam eget ipsum dignissim, auctor arcu eget, laoreet purus. Cras ac porttitor ante. Aenean porta, neque at elementum fermentum, mi nunc sagittis metus, a pellentesque nisi tellus sed est. Nunc neque massa, faucibus eu euismod et, congue nec libero. Vestibulum eget neque augue. Aenean malesuada tortor iaculis, suscipit nulla non, egestas erat. Cras in quam id nulla posuere laoreet. Pellentesque ac orci id erat ornare molestie. In et eleifend neque. Aliquam vel justo sit amet urna porttitor tristique non vitae justo.

Integer id orci eu sem porttitor fermentum. Cras placerat augue finibus arcu iaculis, quis laoreet erat dignissim. Phasellus placerat, urna aliquam imperdiet fermentum, enim arcu tincidunt ligula, vehicula vehicula est leo ac sem. Nullam bibendum enim ut dui porttitor, vitae scelerisque ipsum imperdiet. Sed eu lacus a sem convallis eleifend. Duis hendrerit sollicitudin diam in tincidunt. Sed laoreet mauris non nulla cursus rutrum. In arcu dui, consectetur non interdum at, congue et neque. Phasellus mollis eu leo et consectetur. Proin finibus vulputate ex id porttitor. Duis imperdiet lobortis volutpat. Aliquam vel ex venenatis, sollicitudin quam nec, pretium leo. Mauris interdum tincidunt tristique. Nullam mattis, mauris ut dictum eleifend, felis purus facilisis massa, vitae lacinia leo ex et nisi. Fusce maximus mi eros, et lacinia massa iaculis quis. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae;

Aenean odio felis, bibendum a ex vitae, fringilla pretium mauris. Pellentesque id urna ac diam tempus venenatis vitae quis massa. In dapibus efficitur pharetra. Nulla vel sapien gravida, tristique nisl eget, fermentum nunc. Mauris euismod ac sem in maximus. Curabitur urna nisi, pellentesque vel purus in, interdum congue felis. Sed venenatis pharetra sem ac condimentum. Nunc tempus semper sapien. Proin molestie ex a ipsum vestibulum ornare. Morbi molestie massa eget bibendum tempor. Quisque bibendum tincidunt urna, id malesuada velit fermentum nec. Etiam egestas felis ut urna accumsan, sed aliquam tortor ultricies. Morbi eu urna sit amet ipsum aliquam condimentum. Fusce ante orci, varius a accumsan et, tristique vitae orci. Morbi vel enim id massa fermentum fringilla quis ut neque. Sed a posuere massa, sed fringilla est.

Donec venenatis nulla ipsum, vitae vehicula metus venenatis a. Cras facilisis augue eu magna rhoncus consectetur. Phasellus id enim nunc. Vestibulum sit amet arcu ultricies, varius diam nec, vehicula leo. Sed et tortor nunc. Mauris sit amet lacus vel ligula lobortis dignissim ut eget lacus. Suspendisse porttitor venenatis malesuada. Suspendisse varius posuere felis, a dapibus diam porta vitae. Quisque at arcu libero.

Suspendisse potenti. Proin tincidunt tincidunt dictum. Donec tellus lectus, blandit id pulvinar non, fringilla eu nisi. Phasellus vestibulum posuere urna et elementum. In luctus mattis neque, vel vulputate purus vehicula id. Maecenas tempor rhoncus justo, tristique lobortis ipsum sollicitudin eget. Nam at ipsum a ligula interdum blandit. Morbi risus enim, tempus non nunc vel, commodo consectetur ipsum. Vestibulum euismod posuere nisi ut tincidunt. Pellentesque venenatis neque id pulvinar finibus. Donec ullamcorper ipsum non ante ultrices faucibus. Nunc nec pulvinar ex. Proin condimentum consectetur egestas. Quisque tempor mi vitae finibus pharetra. Praesent aliquet ullamcorper ex laoreet scelerisque.

Aliquam hendrerit pulvinar pulvinar. Nunc congue metus eu urna elementum imperdiet. Vivamus euismod in enim id pellentesque. Nunc nec pretium odio. Suspendisse rutrum libero ut nunc mattis, sed cursus est consectetur. Suspendisse ipsum enim, sollicitudin id orci quis, mattis volutpat augue. Etiam porttitor, velit ac pretium scelerisque, risus dolor eleifend risus, vitae tincidunt mauris ante vel leo.

Phasellus ac luctus mi. Fusce dictum lobortis est vel tincidunt. Morbi est nunc, consectetur eu dolor ac, cursus bibendum orci. Integer rutrum mauris non congue pharetra. Duis nec augue dignissim, dignissim nisl ut, posuere magna. Nullam vestibulum, sem nec hendrerit vulputate, diam turpis consectetur felis, vel ultrices arcu nisi in risus. Aenean vulputate sapien interdum, dictum ex eu, vestibulum lorem. Nunc eros quam, egestas dignissim vulputate ut, aliquet eget justo. Nulla fermentum a nulla elementum sollicitudin. Interdum et malesuada fames ac ante ipsum primis in faucibus. Nam ullamcorper dolor sed sapien mollis interdum. In hac habitasse platea dictumst.

Quisque et ligula ligula. Donec felis nulla, venenatis non vulputate non, molestie ac lacus. Praesent nulla justo, eleifend sed pharetra in, pharetra non neque. Cras quis porta lectus. Ut aliquet nisl vitae dolor fringilla, at condimentum justo laoreet. Donec vulputate aliquam porttitor. Proin blandit non felis ut aliquet.

Nunc orci est, bibendum vitae consectetur at, scelerisque at lacus. Donec sed imperdiet lacus, id luctus ligula. Mauris posuere est eros, ut pulvinar enim mollis nec. Sed quam tortor, tempus id velit et, rhoncus luctus magna. Etiam est ante, interdum eu laoreet eu, tristique eget magna. Ut at cursus mi, ac sollicitudin nulla. Sed consectetur bibendum consequat. Cras egestas tortor nunc, at fringilla odio rhoncus id. Quisque quis augue sed ipsum convallis venenatis. Proin vitae mi ipsum.

Phasellus porttitor augue nisl, ut auctor justo pharetra vitae. Vestibulum bibendum nec urna ut commodo. Integer sodales nisi libero, quis convallis mi posuere id. Vestibulum ante eros, ornare sed aliquam in, maximus quis purus. Vivamus nec sapien vitae ipsum bibendum dignissim at ac quam. Etiam vehicula ultricies quam at varius. Curabitur et rutrum elit. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae;

Morbi egestas gravida urna at consequat. Ut sagittis justo vitae condimentum interdum. Cras vestibulum dui quis magna sollicitudin pharetra. Ut eu risus blandit, convallis dolor id, vehicula tellus. Etiam luctus enim quis nibh venenatis elementum. Sed convallis faucibus orci, vestibulum elementum justo placerat vel. Morbi sit amet nisl augue. Nulla ornare aliquam orci et vestibulum. Nam mattis quam vel cursus pulvinar. Etiam in tempor tortor, et vehicula libero. Curabitur iaculis blandit sem a sodales. Aliquam consectetur, libero ut cursus egestas, dui ex euismod tortor, vitae molestie neque velit nec erat. Phasellus molestie ante massa, in euismod neque hendrerit ut. Etiam fermentum, nisl sit amet consectetur iaculis, ipsum sem tincidunt ante, ac mollis metus tortor sit amet tellus.

Donec finibus nisi et arcu fermentum lacinia. Pellentesque semper leo ante, sed viverra magna feugiat a. Aliquam dictum porttitor metus eget tincidunt. Aliquam placerat urna vitae massa tincidunt varius. Curabitur feugiat lectus est, eget egestas tortor tempor eget. Etiam at dapibus sem. Mauris varius sollicitudin scelerisque. Donec vitae maximus arcu. Ut venenatis diam non nisl consectetur volutpat. Vestibulum at nunc egestas, vulputate elit vel, dignissim sapien.

Etiam vitae purus id lorem aliquet auctor. In hac habitasse platea dictumst. Integer ac nibh est. Donec bibendum, metus a bibendum auctor, orci tortor tincidunt dui, et dictum libero eros vitae sapien. Nullam eget magna dictum sem eleifend laoreet et eu nisi. Fusce semper volutpat orci. Donec sit amet convallis mi. Praesent nisi odio, cursus sit amet tristique vitae, tempus ac nunc. Morbi sit amet pretium diam. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.

Pellentesque ultricies lacus ac malesuada suscipit. In viverra felis dui, id rhoncus quam eleifend vel. Nam ut nisl et est pulvinar dapibus. Nam placerat eros vitae sem sagittis dapibus. Vivamus tortor ligula, lacinia vel porta eget, mollis ac tortor. Integer vestibulum egestas neque vitae aliquam. Proin laoreet ac dui eget faucibus. Proin nec elementum velit. Nam vitae cursus ipsum. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Nulla accumsan eu diam vel molestie. Donec vulputate faucibus luctus. Sed blandit nisi eget lorem pharetra scelerisque.

Proin facilisis pellentesque commodo. Duis imperdiet, ipsum id congue cursus, ex neque auctor turpis, ut venenatis eros mauris id tellus. Donec quis interdum nibh. Proin non iaculis leo. Vivamus at fermentum massa, quis auctor lectus. Pellentesque lectus tellus, consectetur vel massa eu, ullamcorper pellentesque magna. Proin imperdiet eleifend neque. Morbi diam sapien, luctus in interdum non, mattis nec libero. Sed sit amet turpis nunc. Curabitur id neque nisi. In hac habitasse platea dictumst. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.

Etiam vitae viverra diam, nec auctor quam. Praesent molestie libero eu ultrices dapibus. Suspendisse potenti. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc at rhoncus tellus, eu fringilla velit. Ut sollicitudin egestas mi non interdum. Nulla eget sollicitudin odio, vitae placerat odio. Proin elementum sed nulla eu venenatis. Maecenas imperdiet nibh augue, sit amet congue mauris hendrerit quis. Nullam bibendum justo sit amet nisi venenatis faucibus. Quisque bibendum sodales ex, eu mollis felis fringilla vitae. Curabitur gravida tellus sed sapien blandit imperdiet. Proin ac maximus nunc, ac condimentum nisi. Vestibulum ac ex vel risus bibendum ullamcorper. Quisque egestas non turpis ac consectetur. Quisque sodales tortor sit amet velit fringilla, sed maximus dolor pharetra.

Suspendisse accumsan purus ut vehicula convallis. Nunc turpis magna, fermentum vitae consectetur eget, vulputate ac tortor. Praesent ac velit vel felis tincidunt interdum nec ac urna. Nulla in metus eu neque imperdiet pellentesque. Etiam lacus tortor, iaculis eu nisl dictum, semper pellentesque mi. Pellentesque in lorem ac arcu maximus tempor. Duis nec rhoncus eros, in fringilla justo. Ut magna diam, commodo vel luctus sit amet, tempus sit amet risus. Proin lacinia tortor quis libero suscipit, ac rutrum ligula egestas. Morbi dignissim facilisis arcu, id maximus lacus mattis vel. Integer rutrum tincidunt urna quis pellentesque. Donec venenatis, elit vel tincidunt tincidunt, magna nulla pulvinar tellus, id aliquam orci libero ut turpis. Nullam sodales lectus non nisi ultricies sollicitudin. In non mi vehicula, varius ipsum ut, consequat nisl.

Integer quis leo sollicitudin, mollis ligula semper, volutpat libero. Sed sit amet nisl mollis, sollicitudin libero quis, consectetur justo. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed mollis tellus ac libero lacinia tempor. Praesent et sagittis velit. Phasellus ullamcorper nec est vel maximus. Suspendisse scelerisque lorem nec augue volutpat, vitae elementum dui cursus. Curabitur justo lorem, posuere eu arcu ut, placerat efficitur ex. Nulla non congue urna, et finibus enim. Nunc pharetra pharetra eleifend. Mauris eget cursus justo. Duis ultricies dignissim ornare.

Donec convallis, massa nec laoreet malesuada, diam enim maximus lectus, mattis ullamcorper arcu sem quis eros. Pellentesque mollis finibus aliquam. Donec velit risus, feugiat vitae ultricies eu, bibendum eu odio. Maecenas vulputate justo at tellus condimentum, sit amet fringilla urna viverra. Praesent diam mi, viverra at mauris in, rhoncus posuere libero. Suspendisse auctor orci laoreet, iaculis enim id, iaculis dui. Maecenas pellentesque suscipit felis id ullamcorper. Nullam hendrerit malesuada diam vitae feugiat. Maecenas tempus libero lacus, in sagittis nunc eleifend ac.

Duis placerat tempor placerat. In lacinia suscipit neque, ac interdum quam rutrum ac. Sed non elementum lorem. Phasellus vitae laoreet massa, id vestibulum dui. Curabitur enim justo, sollicitudin id nibh a, dignissim porta erat. Integer sed erat tincidunt, consequat augue eu, aliquam lorem. Curabitur iaculis a ex in fringilla. Nulla facilisi.

Etiam feugiat ligula nunc, scelerisque laoreet erat tincidunt ac. Nulla imperdiet molestie nisi at suscipit. Duis sed purus aliquet, laoreet sem vitae, eleifend turpis. Praesent tincidunt tincidunt magna, sit amet consequat ligula mollis nec. Etiam eget nunc sem. Sed id pellentesque massa, eget luctus velit. Duis porttitor quam sed varius vestibulum. Sed condimentum ante ut quam aliquet, et pellentesque ligula pellentesque. Suspendisse ut sodales neque. Fusce tincidunt ligula dui, ac molestie dui egestas sit amet.

Suspendisse porttitor placerat purus, ut bibendum leo. Nam quis lectus sit amet augue tempor posuere. Suspendisse ullamcorper lacinia placerat. Nam id sem mattis, vestibulum diam eu, aliquet tortor. Ut ornare posuere ex vel imperdiet. Suspendisse et molestie lacus, nec molestie magna. Ut ac scelerisque ipsum. Fusce condimentum, nisl quis pharetra suscipit, magna ligula efficitur mi, ut rutrum nisl tortor sit amet orci. Mauris vitae est lectus. Maecenas dictum sapien sit amet ligula dapibus, eu molestie lacus fermentum.

Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Mauris dolor massa, dignissim in sodales vel, malesuada hendrerit risus. Praesent nibh risus, tempor id posuere quis, commodo nec nunc. In commodo eget ligula in eleifend. Donec ac neque vitae erat elementum viverra. Maecenas rhoncus libero a diam mollis bibendum. Morbi imperdiet consectetur quam sed iaculis. In suscipit eros id porttitor laoreet. Nullam pharetra lacinia eros ut vulputate. In nunc purus, dapibus a hendrerit quis, convallis eget nibh.

Mauris eu nisl in tellus blandit pulvinar. Aenean suscipit sit amet enim suscipit condimentum. Vivamus in nisi ex. Cras consectetur in enim a accumsan. Nunc sit amet diam tincidunt, interdum purus eu, sodales nibh. Quisque et dolor sit amet velit posuere semper. Sed efficitur efficitur sapien, ac pulvinar orci lobortis eget.

Praesent interdum dictum magna, ac scelerisque eros interdum quis. Morbi eu ligula tempus leo convallis facilisis. Sed consequat nulla sed urna gravida faucibus. Maecenas tellus enim, lobortis quis ligula ac, pellentesque vulputate mi. Nullam malesuada consectetur tincidunt. Fusce faucibus sagittis lectus, vel ultrices neque. Nullam porttitor, nibh quis tristique ornare, sapien eros pretium velit, vel pulvinar erat erat fermentum quam. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Curabitur congue rhoncus dui.

Curabitur eleifend tortor sapien, quis tempus mi vehicula sit amet. Donec purus arcu, porta sit amet commodo vel, consequat id felis. Nullam nec turpis at urna ornare malesuada ut sed dolor. Aliquam porta porttitor ornare. Duis pulvinar gravida maximus. Nullam sagittis, massa sit amet scelerisque luctus, ante orci posuere odio, vel dapibus arcu risus eget felis. Vivamus a arcu nunc. Praesent eget justo at turpis accumsan maximus scelerisque et lacus. Vivamus suscipit aliquam erat eget tempus. Aliquam erat elit, blandit at pulvinar eget, suscipit a tellus. Morbi eu condimentum est. Nam justo ex, luctus eget libero vitae, bibendum iaculis mi. Morbi ac imperdiet velit, vitae viverra massa. Pellentesque blandit sagittis risus, ac convallis purus.

Phasellus maximus sollicitudin nunc, a iaculis urna viverra a. Donec massa erat, interdum nec sem sed, vestibulum maximus orci. Pellentesque in posuere urna. Praesent efficitur justo non quam euismod fermentum. Fusce consequat est orci, sed varius velit volutpat quis. Vivamus dictum finibus dapibus. Nunc sollicitudin risus at leo vulputate bibendum. Mauris tristique, elit vel sagittis feugiat, nunc arcu efficitur nisl, vel condimentum erat quam eget orci. Pellentesque non leo eu tellus congue imperdiet sed vel erat. Pellentesque egestas, urna sed gravida pulvinar, magna massa auctor enim, quis rutrum arcu ipsum a mi. Quisque vitae lacus non eros dapibus efficitur vestibulum eget quam. Quisque euismod elementum turpis, quis lobortis tortor. Donec et placerat tortor.

Fusce non est turpis. Mauris vestibulum dolor sed ornare convallis. Duis a tincidunt massa. Aliquam tristique elementum tempor. Donec luctus purus non arcu tempor, sit amet posuere elit venenatis. Curabitur eu dolor eu ante suscipit rhoncus in a augue. Etiam pellentesque dapibus eros quis tristique. Fusce malesuada accumsan nibh eu sollicitudin. Integer sed nibh id metus suscipit auctor et rutrum tortor. Etiam accumsan, tortor id luctus dignissim, elit ipsum mollis sem, auctor pharetra risus sapien rutrum felis.

Cras volutpat blandit condimentum. Donec vel vulputate velit, sit amet luctus lectus. Quisque a odio id dolor pharetra auctor. Integer tempor finibus urna in efficitur. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam tempus quam vitae dolor vehicula congue. Ut et nibh non leo bibendum tristique ut ac lectus. Nam fringilla viverra lectus, a consequat dolor. Pellentesque vel dolor pulvinar, interdum libero et, fermentum lorem. Praesent efficitur, turpis vitae congue congue, ipsum lacus venenatis ligula, a auctor lectus neque eget lectus. Cras in sagittis felis, sit amet eleifend nibh. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus urna velit, facilisis et neque id, pretium vestibulum sapien. Vestibulum pellentesque turpis nisi, vel maximus dolor consectetur lacinia. Quisque vestibulum porta enim ut molestie. Sed pulvinar enim lorem, eget porttitor tellus congue id.

In sed mi malesuada, condimentum ante et, cursus nulla. Praesent porta tincidunt metus id facilisis. Cras ut purus porta, sagittis nisi eu, euismod dolor. Morbi quis ultricies metus. In bibendum leo viverra nunc volutpat lacinia. Nullam convallis laoreet nulla, quis condimentum ante. Quisque ut luctus ante. Curabitur a varius leo. Integer malesuada lorem quis est elementum finibus. Etiam molestie sit amet enim commodo ullamcorper. Aenean et iaculis ex. Donec sit amet pretium erat, maximus mattis elit. Integer euismod dictum nunc non eleifend.

Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Aliquam eleifend sollicitudin maximus. Integer vel enim sed ex euismod blandit. Vestibulum imperdiet, sapien a aliquam vehicula, orci quam facilisis eros, sed viverra libero lacus et ante. Praesent aliquet leo auctor convallis ultrices. Suspendisse consequat porttitor nisi ac condimentum. Maecenas in tristique lacus. Praesent vitae egestas est, et consectetur arcu. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Aliquam scelerisque aliquet nisi, sit amet ullamcorper quam bibendum in. Duis sed tincidunt magna, ornare dignissim orci. Phasellus sed magna metus. Nullam sagittis dolor eu sagittis posuere. Etiam sed enim a mauris pretium mattis. Proin eu bibendum metus, id molestie elit. Integer sagittis euismod orci, et aliquam sem ornare non.

Curabitur eget ante dictum, finibus tellus nec, bibendum purus. Etiam gravida risus at molestie facilisis. Cras porta posuere nulla quis tristique. Aliquam viverra suscipit orci, non posuere ex aliquet eget. Duis ac imperdiet leo. Mauris a quam aliquet enim tincidunt hendrerit id at eros. Aliquam lobortis, nulla in tristique euismod, lacus neque ornare libero, ac vehicula erat libero et est. Fusce ullamcorper quam ut nisl pulvinar faucibus. Suspendisse tincidunt sagittis lectus et tempus.

Nulla tempor est ut lorem faucibus porttitor. Etiam libero ipsum, ultricies quis mauris sit amet, sollicitudin efficitur metus. Fusce ullamcorper nisi vitae commodo semper. Sed dolor felis, lacinia non ornare ac, fringilla commodo orci. Pellentesque in euismod mi. Mauris ullamcorper tincidunt arcu, vel sagittis eros congue at. Donec et ipsum in quam feugiat aliquet.

Integer eget porta lorem, ac volutpat velit. Donec molestie accumsan mi sed tempus. Aliquam sollicitudin mollis massa, in consectetur metus lobortis et. Quisque placerat feugiat augue non volutpat. Nulla facilisi. Cras venenatis convallis eros, vitae lacinia massa tincidunt condimentum. Curabitur lobortis eu turpis non congue. Praesent cursus feugiat tellus, eu consectetur nisi malesuada vitae. Praesent sit amet neque sit amet sem convallis ornare. Nulla sollicitudin sed tortor sit amet sollicitudin. Morbi dictum pellentesque arcu non pellentesque. Sed vitae libero enim. Morbi a placerat dolor. Donec a imperdiet erat. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Proin placerat sagittis ex a porta.

Nullam finibus, urna vel egestas varius, purus dui vulputate leo, in volutpat massa est ac risus. Fusce eu lacus sed velit feugiat fermentum. Aenean consequat mauris eu mi euismod, id interdum mauris malesuada. Integer id massa mi. Duis blandit nulla nibh, vel efficitur est gravida at. Cras volutpat tincidunt ex, eget blandit purus luctus a. Curabitur cursus vitae massa varius maximus. Integer posuere ligula in vestibulum iaculis. Pellentesque eu dui et nibh imperdiet ultricies. Sed dapibus lacus at felis dictum consectetur. Maecenas tempus justo risus, quis tincidunt orci pretium id. Vestibulum semper blandit est ac pulvinar. Aenean suscipit feugiat neque aliquet interdum. Integer et felis id lorem aliquet eleifend. Mauris mattis iaculis ligula a malesuada.

Integer pretium nibh tempor, auctor leo vitae, aliquet diam. Curabitur bibendum dui pretium gravida vulputate. Pellentesque hendrerit sollicitudin felis, ut commodo orci pharetra quis. Etiam nec eleifend mi, vitae faucibus tellus. Cras vestibulum eleifend cursus. Praesent nec lacus finibus, suscipit nisl vitae, mattis nibh. Phasellus varius elit sit amet rutrum volutpat.

Interdum et malesuada fames ac ante ipsum primis in faucibus. Morbi pretium mi purus, id facilisis sapien venenatis nec. Donec fermentum condimentum lorem at posuere. Mauris at est tincidunt, luctus nibh in, semper libero. Quisque varius porttitor arcu, vitae semper ante fermentum tincidunt. In id nulla luctus, efficitur metus non, euismod augue. Fusce vitae turpis massa. Phasellus aliquam rutrum viverra. Pellentesque quis risus quis metus tincidunt malesuada. In vitae est quis ex dignissim ultricies a ut mauris. Vivamus rutrum massa eget orci laoreet dignissim. Praesent a libero nec urna sodales aliquet vel et metus. Integer purus nisi, mattis eget dapibus vel, faucibus eget nulla. Vivamus tempus mi ut enim porttitor sagittis. Integer aliquet eros in nisl accumsan, quis fringilla magna mattis.

Proin dictum libero velit, a luctus mauris venenatis et. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Maecenas nec erat in elit ultrices maximus. Etiam id commodo velit, in tincidunt lacus. Donec ac pretium ligula. Duis quis maximus urna. Nunc ullamcorper placerat quam quis egestas. Proin in turpis eget dolor fringilla pellentesque nec ac turpis. Nulla lorem ex, aliquam ut bibendum sed, varius eu turpis. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.

Aliquam bibendum fringilla quam, sit amet gravida orci bibendum quis. Vivamus porttitor est sit amet elit facilisis mattis. Praesent id nisi erat. Donec consequat aliquet consectetur. Curabitur sollicitudin sapien urna, tempus porttitor justo vestibulum lacinia. Aenean ut velit ac risus mollis aliquet. Aenean accumsan eu est vitae fringilla.

Proin finibus dui vitae enim convallis ornare. Vivamus nulla justo, congue vel velit a, convallis varius metus. Duis faucibus massa at neque dictum, ac hendrerit neque varius. Pellentesque diam magna, congue sed porttitor id, accumsan non nunc. Pellentesque tempor purus risus. Duis mauris eros, iaculis id viverra et, dictum et sem. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Donec congue mi non augue volutpat convallis. Sed ut convallis felis. Phasellus nec viverra nisi. Nulla facilisi.

Aenean luctus mauris a justo lacinia volutpat. Curabitur consectetur ex nec sollicitudin malesuada. Aliquam erat volutpat. Sed pulvinar lacus ut facilisis blandit. Suspendisse lacus risus, ultrices eget purus ac, euismod tristique justo. Quisque tellus velit, pharetra eget posuere vitae, consequat sit amet magna. Nulla auctor maximus mollis.

Morbi rutrum augue enim, non condimentum mauris volutpat ac. Integer vel massa tortor. Ut at placerat justo. Maecenas pulvinar libero mauris, ut venenatis arcu sollicitudin et. Aenean eget libero mattis, lobortis urna sit amet, vehicula enim. Nunc ornare ex metus, id congue velit faucibus vitae. Integer varius venenatis fringilla. Phasellus vitae fermentum est. Nunc consectetur, nisl et fermentum vulputate, metus tortor pulvinar arcu, ut aliquet nisl sem vehicula erat. Proin eleifend, ligula in sodales tincidunt, nunc nunc pretium nisi, accumsan malesuada lorem quam posuere velit. Nam efficitur orci at porttitor commodo.

Vivamus in pharetra nisl, sed vestibulum justo. Integer blandit sodales convallis. Quisque elit quam, faucibus at euismod ac, sodales vel dolor. Aenean vel tortor luctus, condimentum leo volutpat, ultricies metus. Suspendisse potenti. Nullam tristique vehicula viverra. Sed pellentesque leo dapibus dui condimentum venenatis.

Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Vestibulum egestas fringilla tortor, eu elementum arcu feugiat ac. Mauris eu porta velit. Sed non fringilla nunc, et pharetra ligula. Donec venenatis arcu eu bibendum dignissim. Proin ornare, libero vitae vestibulum bibendum, lectus massa aliquet sapien, eget feugiat lacus turpis non lorem. Duis quis mattis diam. Quisque quis euismod leo, maximus sagittis ante.

Pellentesque diam lacus, porta vitae consequat sed, congue quis turpis. Vestibulum dictum rutrum quam, at imperdiet tellus malesuada vel. Nullam vehicula, quam eu commodo aliquam, tortor magna suscipit ex, sed eleifend lorem purus a lectus. Nunc metus sapien, finibus nec purus et, pulvinar posuere turpis. Pellentesque mollis id lacus eu blandit. Nullam auctor ipsum ex, ut vestibulum ante venenatis sed. Nulla nunc ipsum, aliquet at porta ac, varius vitae mauris. Mauris nibh sapien, aliquet ac bibendum non, malesuada a nisl. Curabitur fringilla interdum placerat.

Sed at bibendum metus, eget vehicula ipsum. Vestibulum orci urna, fringilla id erat ut, accumsan scelerisque neque. Nulla scelerisque dapibus ullamcorper. Vivamus pulvinar quam quis mauris porta ultricies. Pellentesque quis tortor blandit, iaculis ligula vitae, maximus libero. Aenean vel diam a arcu faucibus maximus et nec risus. Nullam ac leo porttitor, consequat augue nec, viverra magna. Quisque varius lorem et pulvinar pellentesque. Nulla eleifend ligula lectus, a tempus tellus ornare eget. Pellentesque vehicula lectus venenatis, elementum lacus vitae, posuere nisi. In molestie lorem non justo imperdiet viverra. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse a cursus est, ac mattis nisl. Cras vestibulum finibus ante, quis gravida neque interdum in. In eu dolor quis est sollicitudin sollicitudin.

Nullam nisl sem, placerat sed vulputate nec, dictum vel enim. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Pellentesque ultricies lectus porttitor, dictum dui molestie, iaculis sapien. Etiam dictum, lectus eleifend lobortis efficitur, nisi ante aliquet sapien, quis pharetra purus ante nec neque. Praesent euismod felis vehicula, varius ligula sit amet, molestie nunc. Donec accumsan ultrices leo, vel feugiat leo. Sed pharetra leo sed imperdiet facilisis. Duis commodo fermentum lorem ut gravida. Donec venenatis purus dolor, at vehicula lorem fringilla eget. Quisque ut leo et nulla accumsan consectetur. Nunc maximus ex id leo feugiat, lobortis laoreet ante vulputate. Proin gravida erat id risus ultrices tincidunt. Integer consequat dui nec hendrerit viverra. Cras vestibulum mattis libero ut scelerisque. Duis malesuada maximus ex, eu ultricies erat pulvinar non. Morbi nec pellentesque velit, ut vehicula tellus.

Mauris sit amet ligula id tortor consectetur hendrerit maximus sit amet lorem. Maecenas tincidunt consequat condimentum. Aliquam imperdiet nisi id lobortis pellentesque. Sed velit nisi, faucibus vitae tellus et, pulvinar hendrerit orci. Quisque at ultrices turpis. Nunc non metus sit amet felis blandit condimentum. Praesent congue dui eu ipsum feugiat lacinia. Nullam volutpat libero a ante egestas blandit.

Phasellus vel faucibus magna, eu efficitur ligula. Praesent molestie ac purus sit amet imperdiet. Donec sodales turpis sem. Vivamus eu massa sit amet neque semper feugiat ac vitae nunc. Mauris luctus velit a varius placerat. Aenean viverra enim felis, eget consectetur ante porttitor ut. Cras dictum lorem a dolor feugiat, eget ultricies orci porttitor. Vestibulum tristique mollis nisl, et consectetur augue iaculis eu. Curabitur cursus felis non condimentum volutpat. Quisque est nibh, faucibus eget nibh ac, porta efficitur metus. Praesent non purus erat. Fusce egestas sit amet sem id bibendum. Nunc pellentesque lorem eget sollicitudin vestibulum. Curabitur lectus lectus, pretium ut neque quis, luctus finibus nunc. Aliquam laoreet orci ac velit vehicula, ac bibendum metus malesuada.

Ut ligula nunc, sollicitudin nec facilisis non, laoreet porttitor nisi. Donec faucibus metus lacus, ut lacinia erat luctus quis. Nulla pulvinar auctor lacus vel feugiat. Aenean non auctor risus. Donec tincidunt quam at orci eleifend, at porta eros aliquet. Pellentesque ultricies volutpat nibh quis suscipit. Aenean neque mi, tempor ac scelerisque sit amet, rutrum sed quam.

Sed nec est eu nunc tempor vulputate et a velit. Mauris at libero cursus, consectetur nunc ac, vulputate nunc. Fusce ultricies maximus nibh, sed finibus ligula varius eget. Nunc volutpat mattis sapien vel pulvinar. Sed laoreet urna eu enim porta, id tincidunt lacus semper. Donec vel turpis a felis tempor blandit. Quisque porttitor, ligula ornare elementum pretium, tortor nibh dictum nulla, a commodo mauris mi volutpat urna. Praesent vitae nulla sit amet sapien fringilla pulvinar vel eu lacus. Integer in viverra orci.

Sed et elit tincidunt odio vestibulum gravida. Quisque vehicula velit et ligula placerat tincidunt. Sed nec porta tortor, a ullamcorper mi. Vestibulum consequat sagittis euismod. Donec a leo finibus, gravida metus semper, sollicitudin turpis. Aliquam auctor dignissim eros, eu tempus lorem iaculis id. Nunc sit amet est ac dui sodales fringilla. Nulla sit amet lacus nec urna viverra tempor. Integer iaculis pellentesque augue, quis lobortis mi ornare sed. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Suspendisse mauris dolor, sollicitudin eu fringilla id, venenatis quis ipsum. Donec sollicitudin, metus eget scelerisque fermentum, metus mi laoreet metus, a aliquam velit nisi in metus. Pellentesque at turpis tempor neque porta malesuada.

Sed vestibulum pellentesque blandit. Donec auctor lorem nec justo iaculis, eget molestie purus rhoncus. Aliquam pellentesque, elit sit amet egestas accumsan, sapien lectus euismod purus, vitae consectetur ex est eu ante. Pellentesque tempor tincidunt efficitur. Vivamus ac nisi in magna scelerisque interdum nec nec nisl. Mauris tristique venenatis velit, vel viverra magna egestas ac. Nunc a augue nec turpis posuere malesuada eget vel est. Donec lobortis, metus et vulputate imperdiet, mauris dui convallis massa, eu facilisis mauris ex quis augue.

Nam accumsan augue at scelerisque molestie. Quisque tempor imperdiet elementum. Ut vel egestas dolor. Nunc a sem ut felis suscipit facilisis id a nisl. Maecenas porta, quam eget efficitur tempus, quam risus euismod ipsum, aliquet aliquet nisi felis id ligula. In in felis quis arcu rhoncus dictum. Morbi aliquet tristique risus, nec pellentesque augue dignissim ut. Nulla facilisi. Praesent ullamcorper interdum imperdiet. Sed euismod placerat nisl, blandit aliquam augue egestas non. Nunc dapibus porta ipsum, non vestibulum arcu consequat porta. Aliquam laoreet odio tortor, sed iaculis lacus placerat tincidunt. Fusce ligula quam, mattis ut gravida sed, dignissim vitae libero. Curabitur nulla quam, euismod fringilla egestas a, hendrerit ut erat. Donec non dui diam. Praesent volutpat dictum felis, id malesuada massa condimentum eu.

Aenean et sagittis ex. Sed orci risus, dapibus id sem nec, egestas iaculis diam. Ut maximus orci nisl, et sagittis massa ullamcorper eget. Praesent ut orci sed eros ullamcorper mattis ut id libero. Proin sollicitudin ut lorem et convallis. Proin mi tellus, porta vel euismod at, ornare nec mauris. Proin ut ex bibendum, blandit lorem hendrerit, dictum arcu. Morbi vitae urna elit.

Morbi a metus vel nisi pulvinar viverra tincidunt sit amet ante. Sed non sagittis dolor, eu fermentum diam. Proin fermentum vulputate felis, a fermentum enim finibus sit amet. Maecenas tempus quam ut velit aliquam, sed lacinia leo mollis. Nam velit nibh, tincidunt non quam eget, vulputate sagittis purus. Fusce interdum dolor ac dignissim sagittis. Integer sodales pellentesque neque, sed fermentum velit imperdiet sit amet. Sed vitae ex ut turpis aliquet ullamcorper. Sed eros augue, ultricies convallis tincidunt quis, posuere quis velit. Etiam orci magna, iaculis sit amet odio ut, vestibulum auctor enim.

Sed vel molestie felis. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Duis euismod dui vel ornare elementum. Fusce faucibus finibus elit, at mollis tellus. Donec eget dapibus nisi. Nam tincidunt enim id libero hendrerit, id sagittis metus porta. Donec dui lorem, faucibus non dictum ut, vulputate non neque. Aenean non mattis turpis, quis tempor ex. Sed auctor et lacus at auctor. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Quisque pellentesque enim ut libero condimentum vestibulum. Lorem ipsum dolor sit amet, consectetur adipiscing elit.

Praesent eros sem, gravida nec luctus ac, varius ac turpis. In aliquet nibh vitae arcu consectetur, eu ultrices elit egestas. In malesuada tellus vel aliquet fringilla. Nullam bibendum tellus ut urna hendrerit, nec gravida metus auctor. Curabitur at pellentesque felis. Nulla in elit tempor, dictum leo non, lobortis diam. Aliquam vitae lobortis ligula. Donec vestibulum lorem nisl, at hendrerit nisl pharetra eu. Pellentesque efficitur congue libero, in convallis dolor rutrum a. Aenean porta rutrum risus, a eleifend dui varius ut.

In blandit finibus nibh, in convallis nunc blandit at. Sed auctor eros vestibulum urna ultrices, sed ultricies turpis molestie. Sed a varius nunc, pharetra auctor elit. Aliquam erat volutpat. Morbi ullamcorper sodales lectus, nec luctus odio aliquet ac. Vestibulum nec velit tortor. Quisque aliquam rhoncus tellus a pellentesque. Ut pellentesque venenatis lacinia. Maecenas tristique, magna vel porta luctus, eros dolor ullamcorper tortor, quis convallis lacus risus et tellus. In sollicitudin semper massa, vel mattis sapien volutpat eget. Phasellus a volutpat urna, at efficitur magna.

Aliquam euismod tristique elit non rhoncus. Praesent ultricies enim eget suscipit gravida. Donec fermentum dolor eu diam elementum dignissim. Morbi in libero ut tellus euismod ullamcorper. Mauris ex massa, ultricies sit amet tincidunt at, facilisis eu nisl. Vivamus iaculis lorem ac malesuada ullamcorper. Suspendisse in turpis sit amet arcu gravida suscipit efficitur vitae est. Nam sem purus, laoreet nec augue at, ultrices lobortis felis. Ut vitae metus mattis, maximus leo vitae, vehicula risus. Phasellus sollicitudin luctus ipsum sed eleifend.

Praesent imperdiet nunc nulla, nec fermentum erat aliquam eu. Proin velit erat, elementum vel bibendum id, blandit et quam. Duis et dui iaculis, posuere eros id, mollis tellus. Duis tempus vehicula ultricies. In non ligula nisl. Praesent in mi vitae metus fermentum placerat in sit amet enim. Sed pulvinar aliquam augue, at aliquam magna consectetur non. Donec ornare metus ligula, quis congue lectus scelerisque sed. Donec eu justo nec ex tincidunt elementum vel pretium urna. Proin euismod metus eget ipsum porta, nec pellentesque massa consectetur. Nulla sed neque metus. Duis non aliquet leo. Nullam venenatis tortor in gravida venenatis. Donec faucibus egestas turpis a egestas.

Etiam eu euismod sapien. Vestibulum luctus lacus vitae justo molestie commodo. Sed nisl dolor, feugiat non velit vitae, posuere dapibus ipsum. Sed imperdiet, ex at elementum dictum, metus velit lacinia metus, ultrices auctor magna arcu nec lacus. Duis quis urna id nunc porta tempor a ut diam. Nam sed lectus maximus, viverra libero non, finibus sapien. Aliquam suscipit, lectus sed tempus sodales, neque justo lobortis nulla, dapibus molestie mi nunc quis dolor. Vestibulum est justo, vulputate sed volutpat a, auctor sit amet dui. Etiam malesuada, ex vitae laoreet sodales, elit lorem scelerisque est, a sollicitudin justo nulla at risus.

Phasellus accumsan nibh vitae metus sollicitudin accumsan. Phasellus mattis, nulla ac consectetur fermentum, felis purus iaculis leo, sed blandit nisl arcu non erat. Curabitur varius tellus urna, ultricies euismod metus gravida eget. Aenean nec dapibus nunc. Phasellus eu felis quis ipsum fringilla mollis non id urna. Sed semper purus porta turpis mattis, at consequat nulla dapibus. Aliquam et nisl vitae arcu dapibus malesuada id nec sapien. Ut in ullamcorper tellus. Nullam nec tincidunt dui, pulvinar efficitur lectus.

Fusce ac ullamcorper odio. Integer placerat, enim sit amet rutrum tincidunt, ipsum turpis blandit enim, vel fringilla justo neque ac magna. Nulla ut lacus tellus. Aenean sit amet orci sit amet metus vulputate finibus sed at nisl. Proin faucibus, elit sit amet pulvinar maximus, orci sapien auctor velit, malesuada tincidunt urna est eu enim. Nullam sollicitudin volutpat ante a tempus. Proin in lacus eu magna volutpat bibendum. Cras egestas aliquet purus vel pellentesque. Mauris tincidunt malesuada libero, ut faucibus ligula faucibus at.

Morbi ac molestie velit. Suspendisse commodo, ante quis accumsan bibendum, ante ex gravida erat, et vulputate quam leo vitae lorem. Pellentesque consequat sagittis tellus eu mattis. In est erat, iaculis vel hendrerit vitae, fermentum ut orci. Phasellus vehicula libero ac dui ullamcorper, in rhoncus nisi congue. Donec dapibus, odio tristique mollis porta, lacus ex bibendum nulla, at ullamcorper eros leo ut purus. Morbi nibh libero, sodales et semper eget, hendrerit quis ex. Nullam viverra suscipit ex, nec malesuada sapien interdum rhoncus. Praesent neque dui, egestas fermentum mi non, tempus dignissim est. Donec fermentum finibus erat, non pretium nibh congue vel. Mauris sit amet pretium leo. Suspendisse sollicitudin, lacus nec porta tempor, nisl nisl maximus orci, tincidunt eleifend libero nunc dictum ipsum. Vivamus feugiat nisi lacus, ac ullamcorper orci blandit quis. Duis sit amet turpis eu leo feugiat rhoncus.

Quisque dignissim ante ut laoreet mollis. Etiam pharetra nisi nisi, nec vestibulum leo fringilla et. Proin lobortis eu dolor non tristique. Suspendisse massa mi, cursus sit amet dapibus sed, dapibus at urna. Phasellus a dolor ac ipsum rutrum iaculis ut lobortis urna. Curabitur eu sagittis est. Ut accumsan elementum purus, id porta leo laoreet sit amet. Cras porta libero vitae maximus finibus. Cras orci justo, tempor a pulvinar nec, feugiat id ipsum. Vestibulum at odio lorem.

Suspendisse sit amet sem orci. Praesent egestas varius diam id auctor. Cras dictum tortor sed porttitor euismod. Fusce luctus commodo metus ac gravida. Aenean eget velit vel nulla egestas auctor ut id metus. Praesent accumsan id elit eget consequat. Mauris a maximus turpis.

Morbi id tincidunt felis. Proin pretium justo quis lacinia viverra. Quisque nec imperdiet lorem, a placerat ipsum. Sed laoreet sem quis tristique volutpat. Suspendisse sit amet lacus non urna tristique lacinia. Duis rhoncus fermentum tristique. Fusce vel lacus at ipsum ullamcorper maximus tempus at ex. Maecenas fringilla nec nisl ac consectetur. Sed elementum quam turpis, sed pharetra elit gravida sit amet. Pellentesque et rutrum nulla, ac volutpat est. Vivamus facilisis sagittis magna, nec cursus sapien scelerisque eu. Phasellus tortor sem, congue at lobortis et, pellentesque a dolor.

Praesent dictum ex mattis malesuada egestas. Praesent tempor malesuada nisi. Fusce at vulputate justo. Nulla rutrum ipsum ac ullamcorper cursus. Etiam a congue magna. Sed ullamcorper, ligula ac aliquam iaculis, urna dui sollicitudin ante, id gravida elit mi at neque. Suspendisse consectetur massa eu magna sagittis, a mattis risus fringilla. Quisque cursus urna eu ex condimentum, sed sodales magna finibus. Aliquam ipsum ipsum, pulvinar ullamcorper nisl ut, elementum tincidunt sapien. Curabitur vitae elementum tellus. Pellentesque a justo ac enim blandit vehicula. Mauris nisi nisl, feugiat in nunc commodo, volutpat suscipit justo. Nam nec condimentum lorem. Praesent rutrum justo justo, quis vehicula purus tristique a.

Cras ultricies velit justo, et accumsan mi hendrerit vitae. Morbi at elementum urna. Donec sollicitudin semper massa, vel molestie lacus tempus sit amet. Maecenas bibendum enim a pulvinar gravida. Cras vulputate consequat aliquam. Cras vitae pulvinar lacus, non finibus nulla. Proin mattis tellus vel dolor imperdiet venenatis. Curabitur mi eros, varius sed iaculis et, hendrerit ac ipsum. Pellentesque id eros pretium neque fermentum luctus. Suspendisse feugiat arcu at viverra vestibulum. Praesent nec bibendum mi. Duis scelerisque eleifend efficitur. Vivamus vitae vestibulum arcu, ac elementum ipsum. Curabitur in massa eleifend, luctus elit nec, commodo lorem. Curabitur luctus leo nec tincidunt consequat.

Duis auctor purus augue, nec elementum tortor sagittis quis. Praesent ornare erat vitae maximus ultricies. Proin sit amet purus sed turpis maximus congue ac eget neque. Donec non efficitur leo. Aenean nec odio ac lacus pretium egestas. Ut maximus nec nisi vel mollis. Sed quis urna eros. Duis cursus tincidunt mauris, sit amet maximus ante scelerisque ac. Proin a diam non ligula lobortis egestas eget ac augue. In eget sagittis eros, non porttitor felis. Praesent ornare fermentum est eget commodo. Quisque at tellus nec nisl blandit blandit eu ac nisi. Vestibulum vitae lacus nulla. Aenean faucibus urna nec sem pharetra, sed fringilla eros sagittis. Mauris venenatis volutpat est, a ullamcorper sem.

Vestibulum vitae iaculis lorem, nec condimentum diam. Praesent interdum, diam ac placerat fringilla, neque est sodales mi, vel tempor nibh augue nec lacus. Etiam ligula libero, porttitor quis accumsan vitae, tempus et sem. Pellentesque id laoreet tortor. Maecenas vitae sem lectus. Mauris cursus facilisis aliquam. Sed ullamcorper non ipsum ac efficitur. Praesent ultricies, justo convallis vestibulum volutpat, felis dui molestie ipsum, eu ultricies nibh eros id ante. Nunc sollicitudin, quam vel tincidunt porttitor, lectus augue eleifend orci, nec lacinia nibh augue nec enim. Suspendisse finibus massa porttitor neque hendrerit tempor. Proin lorem purus, posuere eu velit at, vehicula tincidunt lorem.

Proin eleifend ligula eget magna lobortis condimentum. Cras tincidunt dui orci, a pretium dolor commodo at. Nunc pulvinar bibendum ligula nec tristique. Vestibulum in porta est. Quisque condimentum, diam at euismod elementum, sem sem hendrerit ipsum, vitae elementum eros turpis a mi. Nulla mattis dolor tellus, id laoreet neque vehicula vitae. In consectetur sapien vitae aliquam aliquam. Etiam vel pharetra nulla. Aliquam malesuada dui nec nibh lacinia, quis elementum orci varius. Sed eu augue sit amet purus dignissim lacinia. Sed risus tortor, iaculis ut finibus id, tempus vel felis. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.

Mauris tincidunt ipsum non arcu suscipit gravida. Ut ac bibendum lorem. Morbi condimentum id ligula fringilla lobortis. Suspendisse non volutpat est. Vivamus lobortis magna nec purus maximus scelerisque. Integer velit libero, suscipit et eleifend a, bibendum vitae velit. Ut imperdiet tellus ut lectus rhoncus, eget volutpat lectus scelerisque. Sed a felis id neque interdum ornare malesuada at neque. Praesent odio tortor, ultricies vitae nisl sed, eleifend auctor erat. Etiam fermentum massa at placerat ullamcorper. Aenean ac lacus sed leo vestibulum convallis ut vel lacus. Nam nec consectetur elit. Aenean volutpat leo quis quam semper tristique.

Sed sodales sodales mi sit amet bibendum. Sed dui libero, faucibus vitae mattis vel, euismod ut elit. Nullam nec tortor laoreet, bibendum urna in, malesuada ex. Praesent pharetra lectus erat. Interdum et malesuada fames ac ante ipsum primis in faucibus. Mauris nec felis ac ex tristique vulputate. Donec pretium cursus vehicula. Morbi a erat et odio posuere sodales.

Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Ut semper id lorem in malesuada. Nam augue nulla, finibus sit amet venenatis in, auctor et odio. Nulla dignissim enim nec lectus cursus, eget tincidunt mi convallis. Integer venenatis, eros pulvinar aliquet maximus, tellus nulla tincidunt magna, quis sollicitudin arcu enim eu velit. Aliquam erat volutpat. Fusce sit amet viverra lectus. Morbi elementum a lorem viverra vestibulum. Donec sodales vel est quis mattis. Sed porttitor imperdiet metus, ac varius enim vulputate vitae.

Cras hendrerit mollis nisl ut mattis. Etiam dictum, erat euismod aliquam egestas, nulla urna dignissim enim, eu dictum velit tellus nec metus. Donec elementum consectetur dui vel finibus. Donec pharetra fermentum urna, eu dictum quam accumsan non. Curabitur placerat accumsan magna, in egestas urna gravida vel. Sed aliquet magna et felis consequat, a tempus odio sagittis. Nunc tempor mauris turpis, at lobortis risus imperdiet pellentesque. Proin quis blandit mi. Praesent interdum nec enim at lobortis. Phasellus congue quam congue mi volutpat lacinia. Aenean sagittis enim libero, eu malesuada justo suscipit consequat. Duis vehicula vehicula nisl, nec commodo magna lacinia ornare. Nullam pharetra sollicitudin ex sit amet vestibulum. Vivamus sollicitudin tempor eros, vitae varius nisl mollis et. Proin maximus, purus et varius tincidunt, orci felis eleifend velit, consectetur dignissim metus massa a enim.

Donec consectetur posuere mauris vitae commodo. Fusce sodales rhoncus neque, eget commodo nisi condimentum non. In accumsan augue id felis pellentesque, sit amet sollicitudin lacus bibendum. Cras mollis, libero sed volutpat ornare, dui est condimentum nulla, non tincidunt lorem elit nec quam. Fusce dignissim nulla ac congue molestie. Phasellus eu aliquet velit. Proin euismod quam et turpis rutrum tristique. Sed sollicitudin, arcu vel rutrum vulputate, velit enim maximus nulla, in placerat metus erat posuere sem. Ut vehicula nisl elit. Integer vel volutpat tortor.

Donec pellentesque, purus quis tempus placerat, nulla orci bibendum ligula, non posuere ex nibh vel libero. Pellentesque et neque aliquam, convallis dui vitae, vehicula leo. Interdum et malesuada fames ac ante ipsum primis in faucibus. Pellentesque varius lectus nec quam consectetur dignissim. Quisque vel nibh neque. Maecenas a dolor sit amet urna pellentesque fermentum et eu quam. Curabitur id turpis semper, hendrerit ligula sit amet, laoreet mi. Quisque quis accumsan enim.

Praesent pulvinar velit ut lectus fermentum consectetur. Nullam id viverra diam, eu dictum purus. Aenean eleifend enim a nulla accumsan pharetra. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Maecenas ultrices sagittis justo, sed tincidunt est. Etiam lorem erat, consectetur quis iaculis id, blandit non nunc. Proin a elit lacus. Sed ac risus sapien. Cras aliquet ut metus a tristique. Interdum et malesuada fames ac ante ipsum primis in faucibus. Aenean aliquet, nibh et consequat semper, elit enim aliquam est, eu efficitur eros felis placerat lacus. Curabitur in suscipit elit. Donec aliquet, urna quis tempor elementum, tellus massa semper lorem, vel vehicula ante odio rhoncus sapien.

Integer dictum mauris non libero commodo, eget gravida elit tristique. Praesent in purus at dui faucibus rhoncus. Duis non sapien et felis porttitor aliquet in nec velit. Curabitur pharetra sagittis lacus. Sed dignissim sodales fringilla. Sed commodo facilisis laoreet. Nullam placerat lobortis orci. Nunc a velit maximus, eleifend magna nec, congue nisl. Curabitur auctor pellentesque mollis. Vivamus non molestie leo. Ut molestie nec magna congue interdum. Quisque hendrerit at purus eu porta. Cras rutrum quam non diam interdum consequat. Suspendisse egestas efficitur tortor ac ultricies. Maecenas cursus ultrices nibh id ultricies. Morbi fringilla sapien vitae felis vulputate, vel pharetra enim viverra.

Mauris metus dolor, facilisis at ipsum eget, lobortis malesuada odio. Praesent tristique, dolor eu rhoncus ullamcorper, nibh arcu dapibus dui, id tempus magna lorem vitae massa. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Quisque posuere tempor dui in bibendum. Pellentesque ut pharetra justo, ac gravida massa. Nulla ut nunc quis nulla luctus maximus eget in libero. Curabitur vitae ultricies orci, molestie vestibulum felis. Curabitur odio tortor, porta eget euismod hendrerit, vestibulum non turpis.

Integer fringilla tellus id enim vehicula, eu eleifend dui hendrerit. Mauris dui nunc, convallis eu arcu vel, fermentum imperdiet orci. Curabitur vehicula viverra semper. Quisque suscipit, purus nec bibendum sodales, mi est porttitor mauris, sed maximus sem mi sed enim. Nam eu orci vel nibh pretium blandit aliquet ut leo. Etiam venenatis, justo vitae faucibus aliquam, orci turpis sollicitudin ante, vitae pellentesque erat sapien et erat. Praesent pellentesque erat sapien, aliquam vehicula est tincidunt a. Vivamus fringilla non est lobortis faucibus. Donec facilisis ante iaculis velit auctor laoreet. Nullam bibendum consectetur felis, rhoncus convallis neque. Sed vel neque scelerisque, ornare ligula id, feugiat nisl. Curabitur sit amet ante sed sapien dictum vulputate eget sit amet libero. In vel orci nec ex dapibus bibendum nec a purus. Phasellus eu augue metus.

Suspendisse potenti. Ut non leo a mi aliquet aliquet eu non purus. Sed pulvinar quam ut mi sodales placerat. Proin nulla dolor, posuere vel porta euismod, suscipit in quam. Nunc semper dui mauris, nec tincidunt orci interdum nec. Aliquam ultrices ipsum sit amet quam pulvinar, nec tincidunt orci euismod. Nullam venenatis libero a congue eleifend. Nunc ut vestibulum metus, eget cursus ex. Integer nec sapien lorem.

Aliquam ullamcorper ornare nunc at efficitur. Etiam sed eleifend elit, a sodales quam. Pellentesque tincidunt hendrerit libero at eleifend. Aliquam porttitor risus a sem pharetra, a fermentum magna venenatis. Aenean a tristique lectus. In quis mi at lorem efficitur venenatis et non leo. Pellentesque maximus elit id nibh rutrum scelerisque. Donec posuere velit vel sem condimentum consectetur. Ut non ligula malesuada, tincidunt urna ut, laoreet orci. Donec sed pharetra urna. Fusce sit amet erat ligula. Curabitur ac urna id tellus pharetra varius. In venenatis eu sem sit amet aliquam. Aliquam eu massa malesuada, sollicitudin est eu, egestas erat.

Proin commodo elementum scelerisque. Etiam et enim dignissim, placerat nulla id, egestas augue. Praesent eleifend quis est at laoreet. Aliquam eget volutpat lorem, eu bibendum enim. Duis pulvinar enim ac ligula fermentum mattis. Nam fringilla ut tellus et viverra. Vivamus lacinia enim id nisi tristique, at tempus dolor dignissim. Proin luctus tristique ante a aliquam. Donec erat lacus, ornare sed arcu non, laoreet mattis nunc. Sed eros massa, faucibus sit amet augue a, cursus facilisis ante. Praesent ut dignissim dolor, eu varius arcu. Etiam mattis cursus sapien, in rhoncus mauris feugiat sed. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi pellentesque massa scelerisque velit fermentum auctor. Vivamus augue nulla, aliquet et blandit consequat, volutpat at mauris.

Morbi faucibus ligula vitae erat condimentum, sit amet interdum neque feugiat. Nunc diam elit, sodales at laoreet vel, cursus at nunc. Integer et nulla justo. Nullam tristique arcu orci, at lacinia augue ultrices in. Vestibulum pharetra tincidunt vestibulum. Etiam gravida ex nec velit pulvinar, in commodo lectus molestie. Aenean libero tellus, pharetra ac magna in, lobortis tempus sapien.

Nam pellentesque est ut quam volutpat, vel auctor dolor interdum. Nunc in malesuada nibh. Sed auctor arcu tellus, non rutrum nulla dignissim sed. Phasellus blandit diam non turpis malesuada, id convallis dui congue. Quisque laoreet mauris in arcu ultricies, eu porta sem lacinia. Nullam est dolor, sollicitudin ut leo ac, sollicitudin eleifend odio. Nunc maximus velit a velit viverra blandit. In sed sollicitudin arcu, a dictum nisi. Phasellus sed quam quis ante volutpat semper fringilla non nibh.

`,
      self.location.href
    );
  }
  self.document.documentElement.setAttribute(
    'amp-version',
    internalRuntimeVersion()
  );
}
