(self.AMP=self.AMP||[]).push({n:"amp-user-notification",i:["_base_i","_base_misc"],v:"1901181729101",f:(function(AMP,_){
var $AmpUserNotification$$module$extensions$amp_user_notification$0_1$amp_user_notification$$ = function($$jscomp$super$this$jscomp$111_element$jscomp$649$$) {
  $$jscomp$super$this$jscomp$111_element$jscomp$649$$ = window.AMP.BaseElement.call(this, $$jscomp$super$this$jscomp$111_element$jscomp$649$$) || this;
  $$jscomp$super$this$jscomp$111_element$jscomp$649$$.$ampUserId_$ = null;
  $$jscomp$super$this$jscomp$111_element$jscomp$649$$.$elementId_$ = null;
  var $deferred$jscomp$64$$ = new _.$Deferred$$module$src$utils$promise$$;
  $$jscomp$super$this$jscomp$111_element$jscomp$649$$.$dialogPromise_$ = $deferred$jscomp$64$$.$promise$;
  $$jscomp$super$this$jscomp$111_element$jscomp$649$$.$dialogResolve_$ = $deferred$jscomp$64$$.resolve;
  $$jscomp$super$this$jscomp$111_element$jscomp$649$$.$dismissHref_$ = null;
  $$jscomp$super$this$jscomp$111_element$jscomp$649$$.$persistDismissal_$ = !1;
  $$jscomp$super$this$jscomp$111_element$jscomp$649$$.$showIfGeo_$ = null;
  $$jscomp$super$this$jscomp$111_element$jscomp$649$$.$showIfNotGeo_$ = null;
  $$jscomp$super$this$jscomp$111_element$jscomp$649$$.$geoPromise_$ = null;
  $$jscomp$super$this$jscomp$111_element$jscomp$649$$.$showIfHref_$ = null;
  $$jscomp$super$this$jscomp$111_element$jscomp$649$$.$storageKey_$ = "";
  $$jscomp$super$this$jscomp$111_element$jscomp$649$$.$storagePromise_$ = null;
  $$jscomp$super$this$jscomp$111_element$jscomp$649$$.$urlReplacements_$ = null;
  return $$jscomp$super$this$jscomp$111_element$jscomp$649$$;
}, $JSCompiler_StaticMethods_isNotificationRequiredGeo_$$ = function($JSCompiler_StaticMethods_isNotificationRequiredGeo_$self$$, $geoGroup$jscomp$3$$, $includeGeos$$) {
  return _.$Services$$module$src$services$geoForDocOrNull$$($JSCompiler_StaticMethods_isNotificationRequiredGeo_$self$$.element).then(function($JSCompiler_StaticMethods_isNotificationRequiredGeo_$self$$) {
    var $geo$jscomp$4$$ = $geoGroup$jscomp$3$$.split(/,\s*/).filter(function($geoGroup$jscomp$3$$) {
      return 2 == $JSCompiler_StaticMethods_isNotificationRequiredGeo_$self$$.$isInCountryGroup$($geoGroup$jscomp$3$$);
    });
    return !($includeGeos$$ ? !$geo$jscomp$4$$.length : $geo$jscomp$4$$.length);
  });
}, $JSCompiler_StaticMethods_buildGetHref_$$ = function($JSCompiler_StaticMethods_buildGetHref_$self$$, $ampUserId$$) {
  return _.$JSCompiler_StaticMethods_expandUrlAsync$$($JSCompiler_StaticMethods_buildGetHref_$self$$.$urlReplacements_$, $JSCompiler_StaticMethods_buildGetHref_$self$$.$showIfHref_$).then(function($href$jscomp$14$$) {
    return _.$addParamsToUrl$$module$src$url$$($href$jscomp$14$$, {elementId:$JSCompiler_StaticMethods_buildGetHref_$self$$.$elementId_$, ampUserId:$ampUserId$$});
  });
}, $JSCompiler_StaticMethods_postDismissEnpoint_$$ = function($JSCompiler_StaticMethods_postDismissEnpoint_$self$$) {
  var $enctype$$ = $JSCompiler_StaticMethods_postDismissEnpoint_$self$$.element.getAttribute("enctype") || "application/json;charset=utf-8";
  _.$JSCompiler_StaticMethods_fetchJson$$(_.$Services$$module$src$services$xhrFor$$($JSCompiler_StaticMethods_postDismissEnpoint_$self$$.$win$), $JSCompiler_StaticMethods_postDismissEnpoint_$self$$.$dismissHref_$, {method:"POST", credentials:"include", requireAmpResponseSourceOrigin:!1, body:_.$dict$$module$src$utils$object$$({elementId:$JSCompiler_StaticMethods_postDismissEnpoint_$self$$.$elementId_$, ampUserId:$JSCompiler_StaticMethods_postDismissEnpoint_$self$$.$ampUserId_$}), headers:{"Content-Type":$enctype$$}});
}, $JSCompiler_StaticMethods_optoutOfCid_$$ = function($JSCompiler_StaticMethods_optoutOfCid_$self$$) {
  return _.$Services$$module$src$services$cidForDoc$$($JSCompiler_StaticMethods_optoutOfCid_$self$$.element).then(function($JSCompiler_StaticMethods_optoutOfCid_$self$$) {
    return _.$optOutOfCid$$module$src$service$cid_impl$$($JSCompiler_StaticMethods_optoutOfCid_$self$$.ampdoc);
  }).then(function() {
    return $JSCompiler_StaticMethods_dismiss$$($JSCompiler_StaticMethods_optoutOfCid_$self$$, !1);
  }, function($reason$jscomp$63$$) {
    _.$dev$$module$src$log$$().error("amp-user-notification", "Failed to opt out of Cid", $reason$jscomp$63$$);
    $JSCompiler_StaticMethods_dismiss$$($JSCompiler_StaticMethods_optoutOfCid_$self$$, !0);
  });
}, $JSCompiler_StaticMethods_getAsyncCid_$$ = function($JSCompiler_StaticMethods_getAsyncCid_$self$$) {
  return _.$Services$$module$src$services$cidForDoc$$($JSCompiler_StaticMethods_getAsyncCid_$self$$.element).then(function($cid$jscomp$11$$) {
    return $cid$jscomp$11$$.get({scope:"amp-user-notification", createCookieIfNotPresent:!0}, window.Promise.resolve(), $JSCompiler_StaticMethods_getAsyncCid_$self$$.$dialogPromise_$);
  });
}, $JSCompiler_StaticMethods_shouldShow$$ = function($JSCompiler_StaticMethods_shouldShow$self$$) {
  return $JSCompiler_StaticMethods_shouldShow$self$$.$isDismissed$().then(function($dismissed$$) {
    return $dismissed$$ ? !1 : $JSCompiler_StaticMethods_shouldShow$self$$.$showIfHref_$ ? $JSCompiler_StaticMethods_getAsyncCid_$$($JSCompiler_StaticMethods_shouldShow$self$$).then($JSCompiler_StaticMethods_shouldShow$self$$.$getShowEndpoint_$.bind($JSCompiler_StaticMethods_shouldShow$self$$)).then($JSCompiler_StaticMethods_shouldShow$self$$.$onGetShowEndpointSuccess_$.bind($JSCompiler_StaticMethods_shouldShow$self$$)) : $JSCompiler_StaticMethods_shouldShow$self$$.$geoPromise_$ ? $JSCompiler_StaticMethods_shouldShow$self$$.$geoPromise_$ : 
    !0;
  });
}, $JSCompiler_StaticMethods_dismiss$$ = function($JSCompiler_StaticMethods_dismiss$self$$, $forceNoPersist$$) {
  $JSCompiler_StaticMethods_dismiss$self$$.element.classList.remove("amp-active");
  $JSCompiler_StaticMethods_dismiss$self$$.element.classList.add("amp-hidden");
  $JSCompiler_StaticMethods_dismiss$self$$.$dialogResolve_$();
  _.$JSCompiler_StaticMethods_removeFromFixedLayer$$($JSCompiler_StaticMethods_dismiss$self$$.$getViewport$(), $JSCompiler_StaticMethods_dismiss$self$$.element);
  $JSCompiler_StaticMethods_dismiss$self$$.$persistDismissal_$ && !$forceNoPersist$$ && $JSCompiler_StaticMethods_dismiss$self$$.$storagePromise_$.then(function($forceNoPersist$$) {
    $forceNoPersist$$.set($JSCompiler_StaticMethods_dismiss$self$$.$storageKey_$, !0);
  });
  $JSCompiler_StaticMethods_dismiss$self$$.$dismissHref_$ && $JSCompiler_StaticMethods_postDismissEnpoint_$$($JSCompiler_StaticMethods_dismiss$self$$);
}, $UserNotificationManager$$module$extensions$amp_user_notification$0_1$amp_user_notification$$ = function($ampdoc$jscomp$224$$) {
  this.ampdoc = $ampdoc$jscomp$224$$;
  this.$F$ = Object.create(null);
  this.$D$ = Object.create(null);
  this.$viewer_$ = _.$Services$$module$src$services$viewerForDoc$$(this.ampdoc);
  this.$G$ = this.ampdoc.$whenReady$();
  this.$I$ = window.Promise.all([this.$viewer_$.$D$, this.$G$]);
  this.$K$ = _.$getServicePromiseForDoc$$module$src$service$$(this.ampdoc, "notificationUIManager");
}, $JSCompiler_StaticMethods_registerUserNotification$$ = function($JSCompiler_StaticMethods_registerUserNotification$self$$, $id$jscomp$109$$, $userNotification$jscomp$1$$) {
  $JSCompiler_StaticMethods_registerUserNotification$self$$.$F$[$id$jscomp$109$$] = $userNotification$jscomp$1$$;
  var $deferred$jscomp$65$$ = $JSCompiler_StaticMethods_getOrCreateDeferById_$$($JSCompiler_StaticMethods_registerUserNotification$self$$, $id$jscomp$109$$);
  $JSCompiler_StaticMethods_registerUserNotification$self$$.$I$.then(function() {
    return $JSCompiler_StaticMethods_shouldShow$$($userNotification$jscomp$1$$);
  }).then(function($id$jscomp$109$$) {
    if ($id$jscomp$109$$) {
      return $JSCompiler_StaticMethods_registerUserNotification$self$$.$K$.then(function($JSCompiler_StaticMethods_registerUserNotification$self$$) {
        return _.$JSCompiler_StaticMethods_registerUI$$($JSCompiler_StaticMethods_registerUserNotification$self$$, $userNotification$jscomp$1$$.show.bind($userNotification$jscomp$1$$));
      });
    }
  }).then($deferred$jscomp$65$$.resolve.bind($JSCompiler_StaticMethods_registerUserNotification$self$$, $userNotification$jscomp$1$$)).catch(_.$rethrowAsync$$module$src$log$$.bind(null, "Notification service failed amp-user-notification", $id$jscomp$109$$));
}, $JSCompiler_StaticMethods_getOrCreateDeferById_$$ = function($JSCompiler_StaticMethods_getOrCreateDeferById_$self$$, $id$jscomp$110$$) {
  if ($JSCompiler_StaticMethods_getOrCreateDeferById_$self$$.$D$[$id$jscomp$110$$]) {
    return $JSCompiler_StaticMethods_getOrCreateDeferById_$self$$.$D$[$id$jscomp$110$$];
  }
  var $$jscomp$destructuring$var547$$ = new _.$Deferred$$module$src$utils$promise$$;
  return $JSCompiler_StaticMethods_getOrCreateDeferById_$self$$.$D$[$id$jscomp$110$$] = {$promise$:$$jscomp$destructuring$var547$$.$promise$, resolve:$$jscomp$destructuring$var547$$.resolve};
};
_.$$jscomp$inherits$$($AmpUserNotification$$module$extensions$amp_user_notification$0_1$amp_user_notification$$, window.AMP.BaseElement);
_.$JSCompiler_prototypeAlias$$ = $AmpUserNotification$$module$extensions$amp_user_notification$0_1$amp_user_notification$$.prototype;
_.$JSCompiler_prototypeAlias$$.$isAlwaysFixed$ = function() {
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$buildCallback$ = function() {
  var $$jscomp$this$jscomp$1272$$ = this, $ampdoc$jscomp$223$$ = this.$getAmpDoc$();
  this.$urlReplacements_$ = _.$Services$$module$src$services$urlReplacementsForDoc$$(this.element);
  this.$storagePromise_$ = _.$Services$$module$src$services$storageForDoc$$(this.element);
  this.$elementId_$ = this.element.id;
  this.$storageKey_$ = "amp-user-notification:" + this.$elementId_$;
  this.$showIfGeo_$ = this.element.getAttribute("data-show-if-geo");
  this.$showIfNotGeo_$ = this.element.getAttribute("data-show-if-not-geo");
  this.$showIfHref_$ = this.element.getAttribute("data-show-if-href");
  this.$showIfGeo_$ && (this.$geoPromise_$ = $JSCompiler_StaticMethods_isNotificationRequiredGeo_$$(this, this.$showIfGeo_$, !0));
  this.$showIfNotGeo_$ && (this.$geoPromise_$ = $JSCompiler_StaticMethods_isNotificationRequiredGeo_$$(this, this.$showIfNotGeo_$, !1));
  this.$dismissHref_$ = this.element.getAttribute("data-dismiss-href");
  this.element.getAttribute("role") || this.element.setAttribute("role", "alert");
  var $persistDismissal$$ = this.element.getAttribute("data-persist-dismissal");
  this.$persistDismissal_$ = "false" != $persistDismissal$$ && "no" != $persistDismissal$$;
  _.$JSCompiler_StaticMethods_registerDefaultAction$$(this, function() {
    return $JSCompiler_StaticMethods_dismiss$$($$jscomp$this$jscomp$1272$$, !1);
  }, "dismiss");
  _.$JSCompiler_StaticMethods_registerAction$$(this, "optoutOfCid", function() {
    return $JSCompiler_StaticMethods_optoutOfCid_$$($$jscomp$this$jscomp$1272$$);
  });
  _.$getServicePromiseForDoc$$module$src$service$$($ampdoc$jscomp$223$$, "userNotificationManager").then(function($ampdoc$jscomp$223$$) {
    $JSCompiler_StaticMethods_registerUserNotification$$($ampdoc$jscomp$223$$, $$jscomp$this$jscomp$1272$$.$elementId_$, $$jscomp$this$jscomp$1272$$);
  });
};
_.$JSCompiler_prototypeAlias$$.$getShowEndpoint_$ = function($ampUserId$jscomp$1$$) {
  var $$jscomp$this$jscomp$1274$$ = this;
  this.$ampUserId_$ = $ampUserId$jscomp$1$$;
  return $JSCompiler_StaticMethods_buildGetHref_$$(this, $ampUserId$jscomp$1$$).then(function($ampUserId$jscomp$1$$) {
    return _.$JSCompiler_StaticMethods_fetchJson$$(_.$Services$$module$src$services$xhrFor$$($$jscomp$this$jscomp$1274$$.$win$), $ampUserId$jscomp$1$$, {credentials:"include", requireAmpResponseSourceOrigin:!1}).then(function($ampUserId$jscomp$1$$) {
      return $ampUserId$jscomp$1$$.json();
    });
  });
};
_.$JSCompiler_prototypeAlias$$.$onGetShowEndpointSuccess_$ = function($data$jscomp$213$$) {
  $data$jscomp$213$$.showNotification || this.$dialogResolve_$();
  return window.Promise.resolve($data$jscomp$213$$.showNotification);
};
_.$JSCompiler_prototypeAlias$$.show = function() {
  _.$toggle$$module$src$style$$(this.element, !0);
  this.element.classList.add("amp-active");
  _.$JSCompiler_StaticMethods_addToFixedLayer$$(this.$getViewport$(), this.element);
  return this.$dialogPromise_$;
};
_.$JSCompiler_prototypeAlias$$.$isDismissed$ = function() {
  var $$jscomp$this$jscomp$1278$$ = this;
  return this.$persistDismissal_$ ? this.$storagePromise_$.then(function($storage$jscomp$8$$) {
    return $storage$jscomp$8$$.get($$jscomp$this$jscomp$1278$$.$storageKey_$);
  }).then(function($$jscomp$this$jscomp$1278$$) {
    return !!$$jscomp$this$jscomp$1278$$;
  }, function($$jscomp$this$jscomp$1278$$) {
    _.$dev$$module$src$log$$().error("amp-user-notification", "Failed to read storage", $$jscomp$this$jscomp$1278$$);
    return !1;
  }) : window.Promise.resolve(!1);
};
$UserNotificationManager$$module$extensions$amp_user_notification$0_1$amp_user_notification$$.prototype.get = function($id$jscomp$107$$) {
  var $$jscomp$this$jscomp$1280$$ = this;
  this.$I$.then(function() {
    null == $$jscomp$this$jscomp$1280$$.ampdoc.getElementById($id$jscomp$107$$) && _.$user$$module$src$log$$().$Log$$module$src$log_prototype$warn$("amp-user-notification", "Did not find amp-user-notification element " + $id$jscomp$107$$ + ".");
  });
  return $JSCompiler_StaticMethods_getOrCreateDeferById_$$(this, $id$jscomp$107$$).$promise$;
};
$UserNotificationManager$$module$extensions$amp_user_notification$0_1$amp_user_notification$$.prototype.$J$ = function($id$jscomp$108$$) {
  var $$jscomp$this$jscomp$1281$$ = this;
  return this.$G$.then(function() {
    return $$jscomp$this$jscomp$1281$$.$F$[$id$jscomp$108$$];
  });
};
var $AMP$jscomp$inline_5106$$ = window.self.AMP;
$AMP$jscomp$inline_5106$$.registerServiceForDoc("userNotificationManager", $UserNotificationManager$$module$extensions$amp_user_notification$0_1$amp_user_notification$$);
$AMP$jscomp$inline_5106$$.registerServiceForDoc("notificationUIManager", _.$NotificationUiManager$$module$src$service$notification_ui_manager$$);
$AMP$jscomp$inline_5106$$.registerElement("amp-user-notification", $AmpUserNotification$$module$extensions$amp_user_notification$0_1$amp_user_notification$$, "amp-user-notification{position:fixed!important;bottom:0;left:0;overflow:hidden!important;visibility:hidden;background:hsla(0,0%,100%,0.7);z-index:1000;width:100%}amp-user-notification.amp-active{visibility:visible}amp-user-notification.amp-hidden{visibility:hidden}\n/*# sourceURL=/extensions/amp-user-notification/0.1/amp-user-notification.css*/");

})});
