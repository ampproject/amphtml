(self.AMP=self.AMP||[]).push({n:"amp-form",i:["_base_i","_base_misc"],v:"1901181729101",f:(function(AMP,_){
var $JSCompiler_StaticMethods_expandInputValue_$$ = function($JSCompiler_StaticMethods_expandInputValue_$self_result$jscomp$10$$, $element$jscomp$154$$, $opt_sync$jscomp$1$$) {
  "INPUT" == $element$jscomp$154$$.tagName && $element$jscomp$154$$.getAttribute("type");
  var $whitelist$jscomp$2$$ = _.$JSCompiler_StaticMethods_getWhitelistForElement_$$($element$jscomp$154$$);
  if (!$whitelist$jscomp$2$$) {
    return $opt_sync$jscomp$1$$ ? $element$jscomp$154$$.value : window.Promise.resolve($element$jscomp$154$$.value);
  }
  void 0 === $element$jscomp$154$$["amp-original-value"] && ($element$jscomp$154$$["amp-original-value"] = $element$jscomp$154$$.value);
  $JSCompiler_StaticMethods_expandInputValue_$self_result$jscomp$10$$ = (new _.$Expander$$module$src$service$url_expander$expander$$($JSCompiler_StaticMethods_expandInputValue_$self_result$jscomp$10$$.$D$, void 0, void 0, $opt_sync$jscomp$1$$, $whitelist$jscomp$2$$)).expand($element$jscomp$154$$["amp-original-value"] || $element$jscomp$154$$.value);
  return $opt_sync$jscomp$1$$ ? $element$jscomp$154$$.value = $JSCompiler_StaticMethods_expandInputValue_$self_result$jscomp$10$$ : $JSCompiler_StaticMethods_expandInputValue_$self_result$jscomp$10$$.then(function($JSCompiler_StaticMethods_expandInputValue_$self_result$jscomp$10$$) {
    return $element$jscomp$154$$.value = $JSCompiler_StaticMethods_expandInputValue_$self_result$jscomp$10$$;
  });
}, $LastAddedResolver$$module$src$utils$promise$$ = function() {
  var $resolve_$$, $reject_$$;
  this.$F$ = new window.Promise(function($resolve$jscomp$3$$, $reject$jscomp$2$$) {
    $resolve_$$ = $resolve$jscomp$3$$;
    $reject_$$ = $reject$jscomp$2$$;
  });
  this.$I$ = $resolve_$$;
  this.$G$ = $reject_$$;
  this.$D$ = 0;
}, $isDisabled$$module$src$form$$ = function($ancestors$jscomp$1_element$jscomp$70$$) {
  if ($ancestors$jscomp$1_element$jscomp$70$$.disabled) {
    return !0;
  }
  $ancestors$jscomp$1_element$jscomp$70$$ = _.$ancestorElementsByTag$$module$src$dom$$($ancestors$jscomp$1_element$jscomp$70$$, "fieldset");
  for (var $i$jscomp$51$$ = 0; $i$jscomp$51$$ < $ancestors$jscomp$1_element$jscomp$70$$.length; $i$jscomp$51$$++) {
    if ($ancestors$jscomp$1_element$jscomp$70$$[$i$jscomp$51$$].disabled) {
      return !0;
    }
  }
  return !1;
}, $getFormAsObject$$module$src$form$$ = function($form$jscomp$1_ownerDocument$$) {
  var $elements$jscomp$2$$ = $form$jscomp$1_ownerDocument$$.elements;
  $form$jscomp$1_ownerDocument$$ = $form$jscomp$1_ownerDocument$$.ownerDocument;
  for (var $data$jscomp$34$$ = {}, $submittableTagsRegex$$ = /^(?:input|select|textarea|button)$/i, $unsubmittableTypesRegex$$ = /^(?:button|image|file|reset)$/i, $checkableType$$ = /^(?:checkbox|radio)$/i, $$jscomp$loop$388$$ = {}, $i$jscomp$50$$ = 0; $i$jscomp$50$$ < $elements$jscomp$2$$.length; $$jscomp$loop$388$$ = {name:$$jscomp$loop$388$$.name}, $i$jscomp$50$$++) {
    var $input$jscomp$10$$ = $elements$jscomp$2$$[$i$jscomp$50$$], $$jscomp$destructuring$var29_value$jscomp$116$$ = $input$jscomp$10$$, $checked$$ = $$jscomp$destructuring$var29_value$jscomp$116$$.checked;
    $$jscomp$loop$388$$.name = $$jscomp$destructuring$var29_value$jscomp$116$$.name;
    var $multiple$$ = $$jscomp$destructuring$var29_value$jscomp$116$$.multiple, $options$jscomp$23$$ = $$jscomp$destructuring$var29_value$jscomp$116$$.options, $tagName$jscomp$16$$ = $$jscomp$destructuring$var29_value$jscomp$116$$.tagName, $type$jscomp$121$$ = $$jscomp$destructuring$var29_value$jscomp$116$$.type;
    $$jscomp$destructuring$var29_value$jscomp$116$$ = $$jscomp$destructuring$var29_value$jscomp$116$$.value;
    !$$jscomp$loop$388$$.name || $isDisabled$$module$src$form$$($input$jscomp$10$$) || !$submittableTagsRegex$$.test($tagName$jscomp$16$$) || $unsubmittableTypesRegex$$.test($type$jscomp$121$$) || $checkableType$$.test($type$jscomp$121$$) && !$checked$$ || (void 0 === $data$jscomp$34$$[$$jscomp$loop$388$$.name] && ($data$jscomp$34$$[$$jscomp$loop$388$$.name] = []), $multiple$$ ? _.$iterateCursor$$module$src$dom$$($options$jscomp$23$$, function($form$jscomp$1_ownerDocument$$) {
      return function($elements$jscomp$2$$) {
        $elements$jscomp$2$$.selected && $data$jscomp$34$$[$form$jscomp$1_ownerDocument$$.name].push($elements$jscomp$2$$.value);
      };
    }($$jscomp$loop$388$$)) : ("submit" != $type$jscomp$121$$ && "BUTTON" != $tagName$jscomp$16$$ || $input$jscomp$10$$ == $form$jscomp$1_ownerDocument$$.activeElement) && $data$jscomp$34$$[$$jscomp$loop$388$$.name].push($$jscomp$destructuring$var29_value$jscomp$116$$));
  }
  Object.keys($data$jscomp$34$$).forEach(function($form$jscomp$1_ownerDocument$$) {
    0 == $data$jscomp$34$$[$form$jscomp$1_ownerDocument$$].length && delete $data$jscomp$34$$[$form$jscomp$1_ownerDocument$$];
  });
  return $data$jscomp$34$$;
}, $NativeFormDataWrapper$$module$src$form_data_wrapper$$ = function($opt_form$jscomp$4$$) {
  this.$D$ = new window.FormData($opt_form$jscomp$4$$);
}, $PolyfillFormDataWrapper$$module$src$form_data_wrapper$$ = function($opt_form$jscomp$3$$) {
  this.$D$ = $opt_form$jscomp$3$$ ? $getFormAsObject$$module$src$form$$($opt_form$jscomp$3$$) : _.$map$$module$src$utils$object$$();
}, $Ios11NativeFormDataWrapper$$module$src$form_data_wrapper$$ = function($opt_form$jscomp$5$$) {
  $NativeFormDataWrapper$$module$src$form_data_wrapper$$.call(this, $opt_form$jscomp$5$$);
  var $$jscomp$this$jscomp$5$$ = this;
  $opt_form$jscomp$5$$ && _.$iterateCursor$$module$src$dom$$($opt_form$jscomp$5$$.elements, function($opt_form$jscomp$5$$) {
    "file" == $opt_form$jscomp$5$$.type && 0 == $opt_form$jscomp$5$$.files.length && ($$jscomp$this$jscomp$5$$.$D$.delete($opt_form$jscomp$5$$.name), $$jscomp$this$jscomp$5$$.$D$.append($opt_form$jscomp$5$$.name, new window.Blob([]), ""));
  });
}, $createFormDataWrapper$$module$src$form_data_wrapper$$ = function($platform_win$jscomp$80$$, $opt_form$jscomp$2$$) {
  $platform_win$jscomp$80$$ = _.$Services$$module$src$services$platformFor$$($platform_win$jscomp$80$$);
  return _.$JSCompiler_StaticMethods_isIos$$($platform_win$jscomp$80$$) && 11 == _.$JSCompiler_StaticMethods_getMajorVersion$$($platform_win$jscomp$80$$) ? new $Ios11NativeFormDataWrapper$$module$src$form_data_wrapper$$($opt_form$jscomp$2$$) : window.FormData.prototype.entries && window.FormData.prototype.delete ? new $NativeFormDataWrapper$$module$src$form_data_wrapper$$($opt_form$jscomp$2$$) : new $PolyfillFormDataWrapper$$module$src$form_data_wrapper$$($opt_form$jscomp$2$$);
}, $FormSubmitService$$module$extensions$amp_form$0_1$form_submit_service$$ = function() {
  this.$D$ = new _.$Observable$$module$src$observable$$;
}, $installFormProxy$$module$extensions$amp_form$0_1$form_proxy$$ = function($form$jscomp$8$$) {
  var $proxy$jscomp$1_win$jscomp$inline_3230$$ = $form$jscomp$8$$.ownerDocument.defaultView;
  $proxy$jscomp$1_win$jscomp$inline_3230$$.$FormProxy$ || ($proxy$jscomp$1_win$jscomp$inline_3230$$.$FormProxy$ = $createFormProxyConstr$$module$extensions$amp_form$0_1$form_proxy$$($proxy$jscomp$1_win$jscomp$inline_3230$$));
  $proxy$jscomp$1_win$jscomp$inline_3230$$ = new $proxy$jscomp$1_win$jscomp$inline_3230$$.$FormProxy$($form$jscomp$8$$);
  "action" in $proxy$jscomp$1_win$jscomp$inline_3230$$ || $setupLegacyProxy$$module$extensions$amp_form$0_1$form_proxy$$($form$jscomp$8$$, $proxy$jscomp$1_win$jscomp$inline_3230$$);
  $form$jscomp$8$$.$p = $proxy$jscomp$1_win$jscomp$inline_3230$$;
}, $createFormProxyConstr$$module$extensions$amp_form$0_1$form_proxy$$ = function($win$jscomp$346$$) {
  function $FormProxy$$($win$jscomp$346$$) {
    this.$D$ = $win$jscomp$346$$;
  }
  var $FormProxyProto$$ = $FormProxy$$.prototype, $Object$jscomp$6$$ = $win$jscomp$346$$.Object, $ObjectProto$$ = $Object$jscomp$6$$.prototype;
  [$win$jscomp$346$$.HTMLFormElement, $win$jscomp$346$$.EventTarget].reduce(function($win$jscomp$346$$, $FormProxy$$) {
    for ($FormProxy$$ = $FormProxy$$ && $FormProxy$$.prototype; $FormProxy$$ && $FormProxy$$ !== $ObjectProto$$ && !(0 <= $win$jscomp$346$$.indexOf($FormProxy$$));) {
      $win$jscomp$346$$.push($FormProxy$$), $FormProxy$$ = $Object$jscomp$6$$.getPrototypeOf($FormProxy$$);
    }
    return $win$jscomp$346$$;
  }, []).forEach(function($FormProxy$$) {
    var $Object$jscomp$6$$ = {}, $proto$jscomp$10$$;
    for ($proto$jscomp$10$$ in $FormProxy$$) {
      if ($Object$jscomp$6$$.property = $win$jscomp$346$$.Object.getOwnPropertyDescriptor($FormProxy$$, $proto$jscomp$10$$), $Object$jscomp$6$$.property && $proto$jscomp$10$$.toUpperCase() != $proto$jscomp$10$$ && !_.$startsWith$$module$src$string$$($proto$jscomp$10$$, "on") && !$ObjectProto$$.hasOwnProperty.call($FormProxyProto$$, $proto$jscomp$10$$)) {
        if ("function" == typeof $Object$jscomp$6$$.property.value) {
          $Object$jscomp$6$$.method = $Object$jscomp$6$$.property.value, $FormProxyProto$$[$proto$jscomp$10$$] = function($win$jscomp$346$$) {
            return function() {
              return $win$jscomp$346$$.method.apply(this.$D$, arguments);
            };
          }($Object$jscomp$6$$);
        } else {
          var $spec$jscomp$35$$ = {};
          $Object$jscomp$6$$.property.get && ($spec$jscomp$35$$.get = function($win$jscomp$346$$) {
            return function() {
              return $win$jscomp$346$$.property.get.call(this.$D$);
            };
          }($Object$jscomp$6$$));
          $Object$jscomp$6$$.property.set && ($spec$jscomp$35$$.set = function($win$jscomp$346$$) {
            return function($FormProxy$$) {
              return $win$jscomp$346$$.property.set.call(this.$D$, $FormProxy$$);
            };
          }($Object$jscomp$6$$));
          $win$jscomp$346$$.Object.defineProperty($FormProxyProto$$, $proto$jscomp$10$$, $spec$jscomp$35$$);
        }
        $Object$jscomp$6$$ = {method:$Object$jscomp$6$$.method, property:$Object$jscomp$6$$.property};
      }
    }
  });
  return $FormProxy$$;
}, $setupLegacyProxy$$module$extensions$amp_form$0_1$form_proxy$$ = function($form$jscomp$10$$, $proxy$jscomp$2$$) {
  var $current$jscomp$5_element$jscomp$403_proto$jscomp$11$$ = $form$jscomp$10$$.ownerDocument.defaultView.HTMLFormElement.prototype.cloneNode.call($form$jscomp$10$$, !1), $$jscomp$loop$400$$ = {}, $name$jscomp$235$$;
  for ($name$jscomp$235$$ in $current$jscomp$5_element$jscomp$403_proto$jscomp$11$$) {
    if ($$jscomp$loop$400$$.name = $name$jscomp$235$$, !($$jscomp$loop$400$$.name in $proxy$jscomp$2$$ || $$jscomp$loop$400$$.name.toUpperCase() == $$jscomp$loop$400$$.name || _.$startsWith$$module$src$string$$($$jscomp$loop$400$$.name, "on"))) {
      $$jscomp$loop$400$$.$desc$ = $LEGACY_PROPS$$module$extensions$amp_form$0_1$form_proxy$$[$$jscomp$loop$400$$.name];
      $current$jscomp$5_element$jscomp$403_proto$jscomp$11$$ = $form$jscomp$10$$[$$jscomp$loop$400$$.name];
      if ($$jscomp$loop$400$$.$desc$) {
        if ($$jscomp$loop$400$$.$desc$.$access$ == $LegacyPropAccessType$$module$extensions$amp_form$0_1$form_proxy$READ_ONCE$$) {
          $$jscomp$loop$400$$.$actual$ = void 0;
          if ($current$jscomp$5_element$jscomp$403_proto$jscomp$11$$ && $current$jscomp$5_element$jscomp$403_proto$jscomp$11$$.nodeType) {
            var $$jscomp$destructuring$var394_parent$jscomp$45$$ = $current$jscomp$5_element$jscomp$403_proto$jscomp$11$$, $nextSibling$$ = $$jscomp$destructuring$var394_parent$jscomp$45$$.nextSibling;
            $$jscomp$destructuring$var394_parent$jscomp$45$$ = $$jscomp$destructuring$var394_parent$jscomp$45$$.parentNode;
            $$jscomp$destructuring$var394_parent$jscomp$45$$.removeChild($current$jscomp$5_element$jscomp$403_proto$jscomp$11$$);
            try {
              $$jscomp$loop$400$$.$actual$ = $form$jscomp$10$$[$$jscomp$loop$400$$.name];
            } finally {
              $$jscomp$destructuring$var394_parent$jscomp$45$$.insertBefore($current$jscomp$5_element$jscomp$403_proto$jscomp$11$$, $nextSibling$$);
            }
          } else {
            $$jscomp$loop$400$$.$actual$ = $current$jscomp$5_element$jscomp$403_proto$jscomp$11$$;
          }
          Object.defineProperty($proxy$jscomp$2$$, $$jscomp$loop$400$$.name, {get:function($form$jscomp$10$$) {
            return function() {
              return $form$jscomp$10$$.$actual$;
            };
          }($$jscomp$loop$400$$)});
        } else {
          $$jscomp$loop$400$$.$desc$.$access$ == $LegacyPropAccessType$$module$extensions$amp_form$0_1$form_proxy$ATTR$$ && ($$jscomp$loop$400$$.$attr$ = $$jscomp$loop$400$$.$desc$.$attr$ || $$jscomp$loop$400$$.name, Object.defineProperty($proxy$jscomp$2$$, $$jscomp$loop$400$$.name, {get:function($current$jscomp$5_element$jscomp$403_proto$jscomp$11$$) {
            return function() {
              var $$jscomp$loop$400$$ = $proxy$jscomp$2$$.getAttribute($current$jscomp$5_element$jscomp$403_proto$jscomp$11$$.$attr$);
              return null == $$jscomp$loop$400$$ && void 0 !== $current$jscomp$5_element$jscomp$403_proto$jscomp$11$$.$desc$.$def$ ? $current$jscomp$5_element$jscomp$403_proto$jscomp$11$$.$desc$.$def$ : $current$jscomp$5_element$jscomp$403_proto$jscomp$11$$.$desc$.type == $LegacyPropDataType$$module$extensions$amp_form$0_1$form_proxy$BOOL$$ ? "true" === $$jscomp$loop$400$$ : $current$jscomp$5_element$jscomp$403_proto$jscomp$11$$.$desc$.type == $LegacyPropDataType$$module$extensions$amp_form$0_1$form_proxy$TOGGLE$$ ? 
              null != $$jscomp$loop$400$$ : $current$jscomp$5_element$jscomp$403_proto$jscomp$11$$.$desc$.type == $LegacyPropDataType$$module$extensions$amp_form$0_1$form_proxy$URL$$ ? ($$jscomp$loop$400$$ = $$jscomp$loop$400$$ || "", _.$Services$$module$src$services$urlForDoc$$($form$jscomp$10$$).parse($$jscomp$loop$400$$).href) : $$jscomp$loop$400$$;
            };
          }($$jscomp$loop$400$$), set:function($form$jscomp$10$$) {
            return function($current$jscomp$5_element$jscomp$403_proto$jscomp$11$$) {
              $form$jscomp$10$$.$desc$.type == $LegacyPropDataType$$module$extensions$amp_form$0_1$form_proxy$TOGGLE$$ && ($current$jscomp$5_element$jscomp$403_proto$jscomp$11$$ ? $current$jscomp$5_element$jscomp$403_proto$jscomp$11$$ = "" : $current$jscomp$5_element$jscomp$403_proto$jscomp$11$$ = null);
              null != $current$jscomp$5_element$jscomp$403_proto$jscomp$11$$ ? $proxy$jscomp$2$$.setAttribute($form$jscomp$10$$.$attr$, $current$jscomp$5_element$jscomp$403_proto$jscomp$11$$) : $proxy$jscomp$2$$.removeAttribute($form$jscomp$10$$.$attr$);
            };
          }($$jscomp$loop$400$$)}));
        }
      } else {
        Object.defineProperty($proxy$jscomp$2$$, $$jscomp$loop$400$$.name, {get:function($proxy$jscomp$2$$) {
          return function() {
            return $form$jscomp$10$$[$proxy$jscomp$2$$.name];
          };
        }($$jscomp$loop$400$$), set:function($proxy$jscomp$2$$) {
          return function($current$jscomp$5_element$jscomp$403_proto$jscomp$11$$) {
            $form$jscomp$10$$[$proxy$jscomp$2$$.name] = $current$jscomp$5_element$jscomp$403_proto$jscomp$11$$;
          };
        }($$jscomp$loop$400$$)});
      }
      $$jscomp$loop$400$$ = {$actual$:$$jscomp$loop$400$$.$actual$, $attr$:$$jscomp$loop$400$$.$attr$, $desc$:$$jscomp$loop$400$$.$desc$, name:$$jscomp$loop$400$$.name};
    }
  }
}, $ValidationBubble$$module$extensions$amp_form$0_1$validation_bubble$$ = function($ampdoc$jscomp$168$$, $id$jscomp$70$$) {
  this.$I$ = $id$jscomp$70$$;
  this.$viewport_$ = _.$Services$$module$src$services$viewportForDoc$$($ampdoc$jscomp$168$$);
  this.$vsync_$ = _.$Services$$module$src$services$vsyncFor$$($ampdoc$jscomp$168$$.$win$);
  this.$F$ = null;
  this.$G$ = "";
  this.$isVisible_$ = !1;
  this.$D$ = $ampdoc$jscomp$168$$.$win$.document.createElement("div");
  _.$toggle$$module$src$style$$(this.$D$, !1);
  this.$D$.classList.add("i-amphtml-validation-bubble");
  this.$D$.__BUBBLE_OBJ = this;
  $ampdoc$jscomp$168$$.$getBody$().appendChild(this.$D$);
}, $hideBubble$$module$extensions$amp_form$0_1$validation_bubble$$ = function($state$jscomp$64$$) {
  $state$jscomp$64$$.$bubbleElement$.removeAttribute("aria-alert");
  $state$jscomp$64$$.$bubbleElement$.removeAttribute("role");
  _.$removeChildren$$module$src$dom$$($state$jscomp$64$$.$bubbleElement$);
  _.$toggle$$module$src$style$$($state$jscomp$64$$.$bubbleElement$, !1);
}, $measureTargetElement$$module$extensions$amp_form$0_1$validation_bubble$$ = function($state$jscomp$65$$) {
  $state$jscomp$65$$.$targetRect$ = $state$jscomp$65$$.viewport.$getLayoutRect$($state$jscomp$65$$.$targetElement$);
}, $showBubbleElement$$module$extensions$amp_form$0_1$validation_bubble$$ = function($state$jscomp$66$$) {
  _.$removeChildren$$module$src$dom$$($state$jscomp$66$$.$bubbleElement$);
  var $messageDiv$$ = $state$jscomp$66$$.$bubbleElement$.ownerDocument.createElement("div");
  $messageDiv$$.id = "bubble-message-" + $state$jscomp$66$$.id;
  $messageDiv$$.textContent = $state$jscomp$66$$.message;
  $state$jscomp$66$$.$bubbleElement$.setAttribute("aria-labeledby", $messageDiv$$.id);
  $state$jscomp$66$$.$bubbleElement$.setAttribute("role", "alert");
  $state$jscomp$66$$.$bubbleElement$.setAttribute("aria-live", "assertive");
  $state$jscomp$66$$.$bubbleElement$.appendChild($messageDiv$$);
  _.$toggle$$module$src$style$$($state$jscomp$66$$.$bubbleElement$, !0);
  _.$setStyles$$module$src$style$$($state$jscomp$66$$.$bubbleElement$, {top:$state$jscomp$66$$.$targetRect$.top - 10 + "px", left:$state$jscomp$66$$.$targetRect$.left + $state$jscomp$66$$.$targetRect$.width / 2 + "px"});
}, $FormValidator$$module$extensions$amp_form$0_1$form_validators$$ = function($form$jscomp$11$$) {
  this.form = $form$jscomp$11$$;
  this.ampdoc = _.$getAmpdoc$$module$src$service$$($form$jscomp$11$$);
  this.$resources$ = _.$Services$$module$src$services$resourcesForDoc$$($form$jscomp$11$$);
  this.$O$ = this.ampdoc.getRootNode();
  this.$J$ = null;
}, $JSCompiler_StaticMethods_FormValidator$$module$extensions$amp_form$0_1$form_validators_prototype$inputs$$ = function($JSCompiler_StaticMethods_FormValidator$$module$extensions$amp_form$0_1$form_validators_prototype$inputs$self$$) {
  return $JSCompiler_StaticMethods_FormValidator$$module$extensions$amp_form$0_1$form_validators_prototype$inputs$self$$.form.querySelectorAll("input,select,textarea");
}, $JSCompiler_StaticMethods_fireValidityEventIfNecessary$$ = function($JSCompiler_StaticMethods_fireValidityEventIfNecessary$self$$) {
  var $event$jscomp$114_previousValidity$$ = $JSCompiler_StaticMethods_fireValidityEventIfNecessary$self$$.$J$;
  $JSCompiler_StaticMethods_fireValidityEventIfNecessary$self$$.$J$ = $JSCompiler_StaticMethods_fireValidityEventIfNecessary$self$$.form.checkValidity();
  $event$jscomp$114_previousValidity$$ !== $JSCompiler_StaticMethods_fireValidityEventIfNecessary$self$$.$J$ && ($event$jscomp$114_previousValidity$$ = _.$createCustomEvent$$module$src$event_helper$$($JSCompiler_StaticMethods_fireValidityEventIfNecessary$self$$.form.ownerDocument.defaultView, $JSCompiler_StaticMethods_fireValidityEventIfNecessary$self$$.$J$ ? "valid" : "invalid", null, {bubbles:!0}), $JSCompiler_StaticMethods_fireValidityEventIfNecessary$self$$.form.dispatchEvent($event$jscomp$114_previousValidity$$));
}, $DefaultValidator$$module$extensions$amp_form$0_1$form_validators$$ = function($var_args$jscomp$74$$) {
  $FormValidator$$module$extensions$amp_form$0_1$form_validators$$.apply(this, arguments);
}, $PolyfillDefaultValidator$$module$extensions$amp_form$0_1$form_validators$$ = function($bubbleId_form$jscomp$12$$) {
  $FormValidator$$module$extensions$amp_form$0_1$form_validators$$.call(this, $bubbleId_form$jscomp$12$$);
  $bubbleId_form$jscomp$12$$ = "i-amphtml-validation-bubble-" + $validationBubbleCount$$module$extensions$amp_form$0_1$form_validators$$++;
  this.$D$ = new $ValidationBubble$$module$extensions$amp_form$0_1$validation_bubble$$(this.ampdoc, $bubbleId_form$jscomp$12$$);
}, $AbstractCustomValidator$$module$extensions$amp_form$0_1$form_validators$$ = function($form$jscomp$13$$) {
  $FormValidator$$module$extensions$amp_form$0_1$form_validators$$.call(this, $form$jscomp$13$$);
}, $JSCompiler_StaticMethods_reportInput$$ = function($JSCompiler_StaticMethods_reportInput$self$$, $input$jscomp$55$$) {
  var $invalidType$$ = $getInvalidType$$module$extensions$amp_form$0_1$form_validators$$($input$jscomp$55$$);
  $invalidType$$ && $JSCompiler_StaticMethods_showValidationFor$$($JSCompiler_StaticMethods_reportInput$self$$, $input$jscomp$55$$, $invalidType$$);
}, $JSCompiler_StaticMethods_hideAllValidations$$ = function($JSCompiler_StaticMethods_hideAllValidations$self$$) {
  for (var $inputs$jscomp$2$$ = $JSCompiler_StaticMethods_FormValidator$$module$extensions$amp_form$0_1$form_validators_prototype$inputs$$($JSCompiler_StaticMethods_hideAllValidations$self$$), $i$jscomp$311$$ = 0; $i$jscomp$311$$ < $inputs$jscomp$2$$.length; $i$jscomp$311$$++) {
    $JSCompiler_StaticMethods_hideValidationFor$$($JSCompiler_StaticMethods_hideAllValidations$self$$, $inputs$jscomp$2$$[$i$jscomp$311$$]);
  }
}, $JSCompiler_StaticMethods_getValidationFor$$ = function($JSCompiler_StaticMethods_getValidationFor$self$$, $input$jscomp$56$$, $invalidType$jscomp$1$$) {
  if (!$input$jscomp$56$$.id) {
    return null;
  }
  var $property$jscomp$26$$ = "__AMP_VALIDATION_" + $invalidType$jscomp$1$$;
  $property$jscomp$26$$ in $input$jscomp$56$$ || ($input$jscomp$56$$[$property$jscomp$26$$] = $JSCompiler_StaticMethods_getValidationFor$self$$.$O$.querySelector("[visible-when-invalid=" + $invalidType$jscomp$1$$ + "]" + ("[validation-for=" + $input$jscomp$56$$.id + "]")));
  return $input$jscomp$56$$[$property$jscomp$26$$];
}, $JSCompiler_StaticMethods_showValidationFor$$ = function($JSCompiler_StaticMethods_showValidationFor$self$$, $input$jscomp$57$$, $invalidType$jscomp$2$$) {
  var $validation$$ = $JSCompiler_StaticMethods_getValidationFor$$($JSCompiler_StaticMethods_showValidationFor$self$$, $input$jscomp$57$$, $invalidType$jscomp$2$$);
  $validation$$ && ($validation$$.textContent.trim() || ($validation$$.textContent = $input$jscomp$57$$.validationMessage), $input$jscomp$57$$.__AMP_VISIBLE_VALIDATION = $validation$$, $JSCompiler_StaticMethods_showValidationFor$self$$.$resources$.$mutateElement$($input$jscomp$57$$, function() {
    return $input$jscomp$57$$.setAttribute("aria-invalid", "true");
  }), $JSCompiler_StaticMethods_showValidationFor$self$$.$resources$.$mutateElement$($validation$$, function() {
    return $validation$$.classList.add("visible");
  }));
}, $JSCompiler_StaticMethods_hideValidationFor$$ = function($JSCompiler_StaticMethods_hideValidationFor$self$$, $input$jscomp$58$$) {
  var $visibleValidation$$ = $JSCompiler_StaticMethods_getVisibleValidationFor$$($input$jscomp$58$$);
  $visibleValidation$$ && (delete $input$jscomp$58$$.__AMP_VISIBLE_VALIDATION, $JSCompiler_StaticMethods_hideValidationFor$self$$.$resources$.$mutateElement$($input$jscomp$58$$, function() {
    return $input$jscomp$58$$.removeAttribute("aria-invalid");
  }), $JSCompiler_StaticMethods_hideValidationFor$self$$.$resources$.$mutateElement$($visibleValidation$$, function() {
    return $visibleValidation$$.classList.remove("visible");
  }));
}, $JSCompiler_StaticMethods_getVisibleValidationFor$$ = function($input$jscomp$59$$) {
  return $input$jscomp$59$$.__AMP_VISIBLE_VALIDATION;
}, $ShowFirstOnSubmitValidator$$module$extensions$amp_form$0_1$form_validators$$ = function($var_args$jscomp$75$$) {
  $AbstractCustomValidator$$module$extensions$amp_form$0_1$form_validators$$.apply(this, arguments);
}, $ShowAllOnSubmitValidator$$module$extensions$amp_form$0_1$form_validators$$ = function($var_args$jscomp$76$$) {
  $AbstractCustomValidator$$module$extensions$amp_form$0_1$form_validators$$.apply(this, arguments);
}, $AsYouGoValidator$$module$extensions$amp_form$0_1$form_validators$$ = function($var_args$jscomp$77$$) {
  $AbstractCustomValidator$$module$extensions$amp_form$0_1$form_validators$$.apply(this, arguments);
}, $InteractAndSubmitValidator$$module$extensions$amp_form$0_1$form_validators$$ = function($var_args$jscomp$78$$) {
  $ShowAllOnSubmitValidator$$module$extensions$amp_form$0_1$form_validators$$.apply(this, arguments);
}, $getFormValidator$$module$extensions$amp_form$0_1$form_validators$$ = function($form$jscomp$14$$) {
  switch($form$jscomp$14$$.getAttribute("custom-validation-reporting")) {
    case "as-you-go":
      return new $AsYouGoValidator$$module$extensions$amp_form$0_1$form_validators$$($form$jscomp$14$$);
    case "show-all-on-submit":
      return new $ShowAllOnSubmitValidator$$module$extensions$amp_form$0_1$form_validators$$($form$jscomp$14$$);
    case "interact-and-submit":
      return new $InteractAndSubmitValidator$$module$extensions$amp_form$0_1$form_validators$$($form$jscomp$14$$);
    case "show-first-on-submit":
      return new $ShowFirstOnSubmitValidator$$module$extensions$amp_form$0_1$form_validators$$($form$jscomp$14$$);
  }
  $form$jscomp$14$$.ownerDocument && void 0 === $reportValiditySupported$$module$extensions$amp_form$0_1$form_validators$$ && ($reportValiditySupported$$module$extensions$amp_form$0_1$form_validators$$ = !!window.document.createElement("form").reportValidity);
  return $reportValiditySupported$$module$extensions$amp_form$0_1$form_validators$$ ? new $DefaultValidator$$module$extensions$amp_form$0_1$form_validators$$($form$jscomp$14$$) : new $PolyfillDefaultValidator$$module$extensions$amp_form$0_1$form_validators$$($form$jscomp$14$$);
}, $getInvalidType$$module$extensions$amp_form$0_1$form_validators$$ = function($input$jscomp$63$$) {
  var $response$jscomp$50_validityTypes$$ = ["badInput"], $invalidType$jscomp$3$$;
  for ($invalidType$jscomp$3$$ in $input$jscomp$63$$.validity) {
    $response$jscomp$50_validityTypes$$.includes($invalidType$jscomp$3$$) || $response$jscomp$50_validityTypes$$.push($invalidType$jscomp$3$$);
  }
  $response$jscomp$50_validityTypes$$ = $response$jscomp$50_validityTypes$$.filter(function($response$jscomp$50_validityTypes$$) {
    return !0 === $input$jscomp$63$$.validity[$response$jscomp$50_validityTypes$$];
  });
  return $response$jscomp$50_validityTypes$$.length ? $response$jscomp$50_validityTypes$$[0] : null;
}, $getFormVerifier$$module$extensions$amp_form$0_1$form_verifiers$$ = function($form$jscomp$15$$, $xhr$jscomp$10$$) {
  return $form$jscomp$15$$.hasAttribute("verify-xhr") ? new $AsyncVerifier$$module$extensions$amp_form$0_1$form_verifiers$$($form$jscomp$15$$, $xhr$jscomp$10$$) : new $DefaultVerifier$$module$extensions$amp_form$0_1$form_verifiers$$($form$jscomp$15$$);
}, $FormVerifier$$module$extensions$amp_form$0_1$form_verifiers$$ = function($form$jscomp$16$$) {
  this.$D$ = $form$jscomp$16$$;
}, $JSCompiler_StaticMethods_onCommit$$ = function($JSCompiler_StaticMethods_onCommit$self$$) {
  $JSCompiler_StaticMethods_clearVerificationErrors_$$($JSCompiler_StaticMethods_onCommit$self$$);
  return $JSCompiler_StaticMethods_isDirty_$$($JSCompiler_StaticMethods_onCommit$self$$) ? $JSCompiler_StaticMethods_onCommit$self$$.$G$() : window.Promise.resolve({$updatedElements$:[], errors:[]});
}, $JSCompiler_StaticMethods_isDirty_$$ = function($JSCompiler_StaticMethods_isDirty_$self_elements$jscomp$28$$) {
  $JSCompiler_StaticMethods_isDirty_$self_elements$jscomp$28$$ = $JSCompiler_StaticMethods_isDirty_$self_elements$jscomp$28$$.$D$.elements;
  for (var $i$jscomp$314$$ = 0; $i$jscomp$314$$ < $JSCompiler_StaticMethods_isDirty_$self_elements$jscomp$28$$.length; $i$jscomp$314$$++) {
    var $field$jscomp$10_options$jscomp$44$$ = $JSCompiler_StaticMethods_isDirty_$self_elements$jscomp$28$$[$i$jscomp$314$$];
    if (!$field$jscomp$10_options$jscomp$44$$.disabled) {
      switch($field$jscomp$10_options$jscomp$44$$.type) {
        case "select-multiple":
        case "select-one":
          $field$jscomp$10_options$jscomp$44$$ = $field$jscomp$10_options$jscomp$44$$.options;
          for (var $j$jscomp$44$$ = 0; $j$jscomp$44$$ < $field$jscomp$10_options$jscomp$44$$.length; $j$jscomp$44$$++) {
            if ($field$jscomp$10_options$jscomp$44$$[$j$jscomp$44$$].selected !== $field$jscomp$10_options$jscomp$44$$[$j$jscomp$44$$].defaultSelected) {
              return !0;
            }
          }
          break;
        case "checkbox":
        case "radio":
          if ($field$jscomp$10_options$jscomp$44$$.checked !== $field$jscomp$10_options$jscomp$44$$.defaultChecked) {
            return !0;
          }
          break;
        default:
          if ($field$jscomp$10_options$jscomp$44$$.value !== $field$jscomp$10_options$jscomp$44$$.defaultValue) {
            return !0;
          }
      }
    }
  }
  return !1;
}, $JSCompiler_StaticMethods_clearVerificationErrors_$$ = function($JSCompiler_StaticMethods_clearVerificationErrors_$self_elements$jscomp$29$$) {
  ($JSCompiler_StaticMethods_clearVerificationErrors_$self_elements$jscomp$29$$ = $JSCompiler_StaticMethods_clearVerificationErrors_$self_elements$jscomp$29$$.$D$.elements) && _.$iterateCursor$$module$src$dom$$($JSCompiler_StaticMethods_clearVerificationErrors_$self_elements$jscomp$29$$, function($JSCompiler_StaticMethods_clearVerificationErrors_$self_elements$jscomp$29$$) {
    $JSCompiler_StaticMethods_clearVerificationErrors_$self_elements$jscomp$29$$.setCustomValidity("");
  });
}, $DefaultVerifier$$module$extensions$amp_form$0_1$form_verifiers$$ = function($var_args$jscomp$79$$) {
  $FormVerifier$$module$extensions$amp_form$0_1$form_verifiers$$.apply(this, arguments);
}, $AsyncVerifier$$module$extensions$amp_form$0_1$form_verifiers$$ = function($form$jscomp$17$$, $xhr$jscomp$11$$) {
  this.$D$ = $form$jscomp$17$$;
  this.$J$ = $xhr$jscomp$11$$;
  this.$F$ = null;
  this.$I$ = [];
}, $JSCompiler_StaticMethods_addToResolver_$$ = function($JSCompiler_StaticMethods_addToResolver_$self$$, $promise$jscomp$42$$) {
  if (!$JSCompiler_StaticMethods_addToResolver_$self$$.$F$) {
    $JSCompiler_StaticMethods_addToResolver_$self$$.$F$ = new $LastAddedResolver$$module$src$utils$promise$$;
    var $cleanup$jscomp$2$$ = function() {
      return $JSCompiler_StaticMethods_addToResolver_$self$$.$F$ = null;
    };
    $JSCompiler_StaticMethods_addToResolver_$self$$.$F$.then($cleanup$jscomp$2$$, $cleanup$jscomp$2$$);
  }
  return $JSCompiler_StaticMethods_addToResolver_$self$$.$F$.add($promise$jscomp$42$$);
}, $JSCompiler_StaticMethods_applyErrors_$$ = function($JSCompiler_StaticMethods_applyErrors_$self$$, $errors$jscomp$4$$) {
  var $errorElements$$ = [], $fixedElements_previousErrors$$ = $JSCompiler_StaticMethods_applyErrors_$self$$.$I$;
  $JSCompiler_StaticMethods_applyErrors_$self$$.$I$ = $errors$jscomp$4$$;
  for (var $i$jscomp$315$$ = 0; $i$jscomp$315$$ < $errors$jscomp$4$$.length; $i$jscomp$315$$++) {
    var $error$jscomp$68_message$jscomp$63$$ = $errors$jscomp$4$$[$i$jscomp$315$$], $element$jscomp$405_name$jscomp$236$$ = _.$JSCompiler_StaticMethods_assertString$$(_.$user$$module$src$log$$(), $error$jscomp$68_message$jscomp$63$$.name, "Verification errors must have a name property");
    $error$jscomp$68_message$jscomp$63$$ = _.$JSCompiler_StaticMethods_assertString$$(_.$user$$module$src$log$$(), $error$jscomp$68_message$jscomp$63$$.message, "Verification errors must have a message property");
    $element$jscomp$405_name$jscomp$236$$ = _.$JSCompiler_StaticMethods_assertElement$$(_.$user$$module$src$log$$(), $JSCompiler_StaticMethods_applyErrors_$self$$.$D$.querySelector('[name="' + $element$jscomp$405_name$jscomp$236$$ + '"]'), "Verification error name property must match a field name");
    $element$jscomp$405_name$jscomp$236$$.checkValidity() && ($element$jscomp$405_name$jscomp$236$$.setCustomValidity($error$jscomp$68_message$jscomp$63$$), $errorElements$$.push($element$jscomp$405_name$jscomp$236$$));
  }
  $fixedElements_previousErrors$$ = $fixedElements_previousErrors$$.filter(function($JSCompiler_StaticMethods_applyErrors_$self$$) {
    return $errors$jscomp$4$$.every(function($errors$jscomp$4$$) {
      return $JSCompiler_StaticMethods_applyErrors_$self$$.name !== $errors$jscomp$4$$.name;
    });
  }).map(function($errors$jscomp$4$$) {
    return $JSCompiler_StaticMethods_applyErrors_$self$$.$D$.querySelector('[name="' + $errors$jscomp$4$$.name + '"]');
  });
  return {$updatedElements$:$errorElements$$.concat($fixedElements_previousErrors$$), errors:$errors$jscomp$4$$};
}, $getResponseErrorData_$$module$extensions$amp_form$0_1$form_verifiers$$ = function($error$jscomp$70_response$jscomp$51$$) {
  return ($error$jscomp$70_response$jscomp$51$$ = $error$jscomp$70_response$jscomp$51$$.response) ? $error$jscomp$70_response$jscomp$51$$.json().then(function($error$jscomp$70_response$jscomp$51$$) {
    return $error$jscomp$70_response$jscomp$51$$.$verifyErrors$ || [];
  }, function() {
    return [];
  }) : window.Promise.resolve([]);
}, $AmpForm$$module$extensions$amp_form$0_1$amp_form$$ = function($element$jscomp$406$$, $id$jscomp$71_inputs$jscomp$5$$) {
  var $$jscomp$this$jscomp$605$$ = this;
  try {
    $installFormProxy$$module$extensions$amp_form$0_1$form_proxy$$($element$jscomp$406$$);
  } catch ($e$251$$) {
    _.$dev$$module$src$log$$().error("amp-form", "form proxy failed to install", $e$251$$);
  }
  $element$jscomp$406$$.__AMP_FORM = this;
  this.$V$ = $id$jscomp$71_inputs$jscomp$5$$;
  this.$F$ = $element$jscomp$406$$.ownerDocument.defaultView;
  this.$timer_$ = _.$Services$$module$src$services$timerFor$$(this.$F$);
  this.$R$ = _.$Services$$module$src$services$urlReplacementsForDoc$$($element$jscomp$406$$);
  this.$K$ = null;
  this.$D$ = $element$jscomp$406$$;
  this.$templates_$ = _.$Services$$module$src$services$templatesFor$$(this.$F$);
  this.$xhr_$ = _.$Services$$module$src$services$xhrFor$$(this.$F$);
  this.$actions_$ = _.$Services$$module$src$services$actionServiceForDoc$$(this.$D$);
  this.$O$ = _.$Services$$module$src$services$resourcesForDoc$$(this.$D$);
  this.$viewer_$ = _.$Services$$module$src$services$viewerForDoc$$(this.$D$);
  this.$ssrTemplateHelper_$ = new _.$SsrTemplateHelper$$module$src$ssr_template_helper$$("amp-form", this.$viewer_$, this.$templates_$);
  this.$G$ = (this.$D$.getAttribute("method") || "GET").toUpperCase();
  this.$target_$ = this.$D$.getAttribute("target");
  this.$I$ = $JSCompiler_StaticMethods_getXhrUrl_$$(this, "action-xhr");
  this.$ea$ = $JSCompiler_StaticMethods_getXhrUrl_$$(this, "verify-xhr");
  this.$P$ = !this.$D$.hasAttribute("novalidate");
  this.$D$.setAttribute("novalidate", "");
  this.$P$ || this.$D$.setAttribute("amp-novalidate", "");
  this.$D$.classList.add("i-amphtml-form");
  this.$state_$ = "initial";
  $id$jscomp$71_inputs$jscomp$5$$ = this.$D$.elements;
  for (var $i$jscomp$316$$ = 0; $i$jscomp$316$$ < $id$jscomp$71_inputs$jscomp$5$$.length; $i$jscomp$316$$++) {
  }
  this.$J$ = $getFormValidator$$module$extensions$amp_form$0_1$form_validators$$(this.$D$);
  this.$ba$ = $getFormVerifier$$module$extensions$amp_form$0_1$form_verifiers$$(this.$D$, function() {
    return $JSCompiler_StaticMethods_handleXhrVerify_$$($$jscomp$this$jscomp$605$$);
  });
  _.$JSCompiler_StaticMethods_installActionHandler$$(0, this.$D$, this.$W$.bind(this), 100);
  $JSCompiler_StaticMethods_AmpForm$$module$extensions$amp_form$0_1$amp_form_prototype$installEventHandlers_$$(this);
  $JSCompiler_StaticMethods_installInputMasking_$$(this);
  this.$U$ = _.$getServiceForDoc$$module$src$service$$($element$jscomp$406$$, "form-submit-service");
}, $JSCompiler_StaticMethods_getXhrUrl_$$ = function($JSCompiler_StaticMethods_getXhrUrl_$self$$, $attribute$jscomp$5_url$jscomp$183$$) {
  ($attribute$jscomp$5_url$jscomp$183$$ = $JSCompiler_StaticMethods_getXhrUrl_$self$$.$D$.getAttribute($attribute$jscomp$5_url$jscomp$183$$)) && _.$Services$$module$src$services$urlForDoc$$($JSCompiler_StaticMethods_getXhrUrl_$self$$.$D$);
  return $attribute$jscomp$5_url$jscomp$183$$;
}, $JSCompiler_StaticMethods_requestForFormFetch$$ = function($JSCompiler_StaticMethods_requestForFormFetch$self$$, $url$jscomp$184_xhrUrl$jscomp$1$$, $method$jscomp$29$$, $opt_extraFields$$, $opt_fieldBlacklist$$) {
  if ("GET" == $method$jscomp$29$$ || "HEAD" == $method$jscomp$29$$) {
    var $values$jscomp$16$$ = $getFormAsObject$$module$src$form$$($JSCompiler_StaticMethods_requestForFormFetch$self$$.$D$);
    $opt_fieldBlacklist$$ && $opt_fieldBlacklist$$.forEach(function($JSCompiler_StaticMethods_requestForFormFetch$self$$) {
      delete $values$jscomp$16$$[$JSCompiler_StaticMethods_requestForFormFetch$self$$];
    });
    $opt_extraFields$$ && _.$deepMerge$$module$src$utils$object$$($values$jscomp$16$$, $opt_extraFields$$);
    $url$jscomp$184_xhrUrl$jscomp$1$$ = _.$addParamsToUrl$$module$src$url$$($url$jscomp$184_xhrUrl$jscomp$1$$, $values$jscomp$16$$);
  } else {
    var $body$jscomp$25$$ = $createFormDataWrapper$$module$src$form_data_wrapper$$($JSCompiler_StaticMethods_requestForFormFetch$self$$.$F$, $JSCompiler_StaticMethods_requestForFormFetch$self$$.$D$);
    $opt_fieldBlacklist$$ && $opt_fieldBlacklist$$.forEach(function($JSCompiler_StaticMethods_requestForFormFetch$self$$) {
      $body$jscomp$25$$.delete($JSCompiler_StaticMethods_requestForFormFetch$self$$);
    });
    for (var $key$jscomp$126$$ in $opt_extraFields$$) {
      $body$jscomp$25$$.append($key$jscomp$126$$, $opt_extraFields$$[$key$jscomp$126$$]);
    }
  }
  return {xhrUrl:$url$jscomp$184_xhrUrl$jscomp$1$$, fetchOpt:_.$dict$$module$src$utils$object$$({body:$body$jscomp$25$$, method:$method$jscomp$29$$, credentials:"include", headers:_.$dict$$module$src$utils$object$$({Accept:"application/json"})})};
}, $JSCompiler_StaticMethods_whenDependenciesReady_$$ = function($JSCompiler_StaticMethods_whenDependenciesReady_$self$$) {
  if ($JSCompiler_StaticMethods_whenDependenciesReady_$self$$.$K$) {
    return $JSCompiler_StaticMethods_whenDependenciesReady_$self$$.$K$;
  }
  var $promises$jscomp$20$$ = _.$toArray$$module$src$types$$($JSCompiler_StaticMethods_whenDependenciesReady_$self$$.$D$.querySelectorAll($EXTERNAL_DEPS$$module$extensions$amp_form$0_1$amp_form$$.join(","))).map(function($JSCompiler_StaticMethods_whenDependenciesReady_$self$$) {
    return $JSCompiler_StaticMethods_whenDependenciesReady_$self$$.$K$();
  });
  return $JSCompiler_StaticMethods_whenDependenciesReady_$self$$.$K$ = $JSCompiler_StaticMethods_waitOnPromisesOrTimeout_$$($JSCompiler_StaticMethods_whenDependenciesReady_$self$$, $promises$jscomp$20$$, 2000);
}, $JSCompiler_StaticMethods_AmpForm$$module$extensions$amp_form$0_1$amp_form_prototype$installEventHandlers_$$ = function($JSCompiler_StaticMethods_AmpForm$$module$extensions$amp_form$0_1$amp_form_prototype$installEventHandlers_$self$$) {
  _.$JSCompiler_StaticMethods_whenNextVisible$$($JSCompiler_StaticMethods_AmpForm$$module$extensions$amp_form$0_1$amp_form_prototype$installEventHandlers_$self$$.$viewer_$).then(function() {
    var $autofocus$$ = $JSCompiler_StaticMethods_AmpForm$$module$extensions$amp_form$0_1$amp_form_prototype$installEventHandlers_$self$$.$D$.querySelector("[autofocus]");
    $autofocus$$ && _.$tryFocus$$module$src$dom$$($autofocus$$);
  });
  $JSCompiler_StaticMethods_AmpForm$$module$extensions$amp_form$0_1$amp_form_prototype$installEventHandlers_$self$$.$D$.addEventListener("submit", $JSCompiler_StaticMethods_AmpForm$$module$extensions$amp_form$0_1$amp_form_prototype$installEventHandlers_$self$$.$Y$.bind($JSCompiler_StaticMethods_AmpForm$$module$extensions$amp_form$0_1$amp_form_prototype$installEventHandlers_$self$$), !0);
  $JSCompiler_StaticMethods_AmpForm$$module$extensions$amp_form$0_1$amp_form_prototype$installEventHandlers_$self$$.$D$.addEventListener("blur", function($e$jscomp$221$$) {
    $checkUserValidityAfterInteraction_$$module$extensions$amp_form$0_1$amp_form$$($e$jscomp$221$$.target);
    $JSCompiler_StaticMethods_AmpForm$$module$extensions$amp_form$0_1$amp_form_prototype$installEventHandlers_$self$$.$J$.$I$($e$jscomp$221$$);
  }, !0);
  $JSCompiler_StaticMethods_AmpForm$$module$extensions$amp_form$0_1$amp_form_prototype$installEventHandlers_$self$$.$ssrTemplateHelper_$.isSupported() || $JSCompiler_StaticMethods_AmpForm$$module$extensions$amp_form$0_1$amp_form_prototype$installEventHandlers_$self$$.$D$.addEventListener("change", function($e$jscomp$222$$) {
    $JSCompiler_StaticMethods_onCommit$$($JSCompiler_StaticMethods_AmpForm$$module$extensions$amp_form$0_1$amp_form_prototype$installEventHandlers_$self$$.$ba$).then(function($$jscomp$destructuring$var400$$) {
      var $errors$jscomp$5$$ = $$jscomp$destructuring$var400$$.errors;
      $$jscomp$destructuring$var400$$.$updatedElements$.forEach($checkUserValidityAfterInteraction_$$module$extensions$amp_form$0_1$amp_form$$);
      $JSCompiler_StaticMethods_AmpForm$$module$extensions$amp_form$0_1$amp_form_prototype$installEventHandlers_$self$$.$J$.$I$($e$jscomp$222$$);
      "verifying" === $JSCompiler_StaticMethods_AmpForm$$module$extensions$amp_form$0_1$amp_form_prototype$installEventHandlers_$self$$.$state_$ && ($errors$jscomp$5$$.length ? ($JSCompiler_StaticMethods_AmpForm$$module$extensions$amp_form$0_1$amp_form_prototype$setState_$$($JSCompiler_StaticMethods_AmpForm$$module$extensions$amp_form$0_1$amp_form_prototype$installEventHandlers_$self$$, "verify-error"), $JSCompiler_StaticMethods_AmpForm$$module$extensions$amp_form$0_1$amp_form_prototype$renderTemplate_$$($JSCompiler_StaticMethods_AmpForm$$module$extensions$amp_form$0_1$amp_form_prototype$installEventHandlers_$self$$, 
      {$verifyErrors$:$errors$jscomp$5$$}).then(function() {
        $JSCompiler_StaticMethods_triggerAction_$$($JSCompiler_StaticMethods_AmpForm$$module$extensions$amp_form$0_1$amp_form_prototype$installEventHandlers_$self$$, "verify-error", $errors$jscomp$5$$);
      })) : $JSCompiler_StaticMethods_AmpForm$$module$extensions$amp_form$0_1$amp_form_prototype$setState_$$($JSCompiler_StaticMethods_AmpForm$$module$extensions$amp_form$0_1$amp_form_prototype$installEventHandlers_$self$$, "initial"));
    });
  });
  $JSCompiler_StaticMethods_AmpForm$$module$extensions$amp_form$0_1$amp_form_prototype$installEventHandlers_$self$$.$D$.addEventListener("input", function($e$jscomp$223$$) {
    $checkUserValidityAfterInteraction_$$module$extensions$amp_form$0_1$amp_form$$($e$jscomp$223$$.target);
    $JSCompiler_StaticMethods_AmpForm$$module$extensions$amp_form$0_1$amp_form_prototype$installEventHandlers_$self$$.$J$.$K$($e$jscomp$223$$);
  });
}, $JSCompiler_StaticMethods_installInputMasking_$$ = function($JSCompiler_StaticMethods_installInputMasking_$self$$) {
  _.$getElementServiceIfAvailableForDoc$$module$src$element_service$$($JSCompiler_StaticMethods_installInputMasking_$self$$.$D$, "inputmask", "amp-inputmask").then(function($JSCompiler_StaticMethods_installInputMasking_$self$$) {
    $JSCompiler_StaticMethods_installInputMasking_$self$$ && $JSCompiler_StaticMethods_installInputMasking_$self$$.$D$();
  });
}, $JSCompiler_StaticMethods_triggerFormSubmitInAnalytics_$$ = function($JSCompiler_StaticMethods_triggerFormSubmitInAnalytics_$self$$, $eventType$jscomp$56$$) {
  $JSCompiler_StaticMethods_triggerFormSubmitInAnalytics_$self$$.$ssrTemplateHelper_$.isSupported();
  var $formDataForAnalytics$$ = _.$dict$$module$src$utils$object$$({}), $formObject$$ = $getFormAsObject$$module$src$form$$($JSCompiler_StaticMethods_triggerFormSubmitInAnalytics_$self$$.$D$), $k$jscomp$60$$;
  for ($k$jscomp$60$$ in $formObject$$) {
    Object.prototype.hasOwnProperty.call($formObject$$, $k$jscomp$60$$) && ($formDataForAnalytics$$["formFields[" + $k$jscomp$60$$ + "]"] = $formObject$$[$k$jscomp$60$$].join(","));
  }
  $formDataForAnalytics$$.formId = $JSCompiler_StaticMethods_triggerFormSubmitInAnalytics_$self$$.$D$.id;
  _.$triggerAnalyticsEvent$$module$src$analytics$$($JSCompiler_StaticMethods_triggerFormSubmitInAnalytics_$self$$.$D$, $eventType$jscomp$56$$, $formDataForAnalytics$$);
}, $JSCompiler_StaticMethods_handleClearAction_$$ = function($JSCompiler_StaticMethods_handleClearAction_$self$$) {
  $JSCompiler_StaticMethods_handleClearAction_$self$$.$D$.reset();
  $JSCompiler_StaticMethods_AmpForm$$module$extensions$amp_form$0_1$amp_form_prototype$setState_$$($JSCompiler_StaticMethods_handleClearAction_$self$$, "initial");
  $JSCompiler_StaticMethods_handleClearAction_$self$$.$D$.classList.remove("user-valid");
  $JSCompiler_StaticMethods_handleClearAction_$self$$.$D$.classList.remove("user-invalid");
  _.$iterateCursor$$module$src$dom$$($JSCompiler_StaticMethods_handleClearAction_$self$$.$D$.querySelectorAll(".user-valid, .user-invalid"), function($JSCompiler_StaticMethods_handleClearAction_$self$$) {
    $JSCompiler_StaticMethods_handleClearAction_$self$$.classList.remove("user-valid");
    $JSCompiler_StaticMethods_handleClearAction_$self$$.classList.remove("user-invalid");
  });
  _.$iterateCursor$$module$src$dom$$($JSCompiler_StaticMethods_handleClearAction_$self$$.$D$.querySelectorAll(".visible[validation-for]"), function($JSCompiler_StaticMethods_handleClearAction_$self$$) {
    $JSCompiler_StaticMethods_handleClearAction_$self$$.classList.remove("visible");
  });
  $removeValidityStateClasses$$module$extensions$amp_form$0_1$amp_form$$($JSCompiler_StaticMethods_handleClearAction_$self$$.$D$);
}, $JSCompiler_StaticMethods_submit_$$ = function($JSCompiler_StaticMethods_submit_$self$$, $trust$jscomp$6$$, $event$jscomp$122$$) {
  try {
    var $event$252_varSubsFields$$ = {form:$JSCompiler_StaticMethods_submit_$self$$.$D$, $actionXhrMutator$:$JSCompiler_StaticMethods_submit_$self$$.$aa$.bind($JSCompiler_StaticMethods_submit_$self$$)};
    $JSCompiler_StaticMethods_submit_$self$$.$U$.$fire$($event$252_varSubsFields$$);
  } catch ($e$253$$) {
    _.$dev$$module$src$log$$().error("amp-form", "Form submit service failed: %s", $e$253$$);
  }
  $event$252_varSubsFields$$ = $JSCompiler_StaticMethods_getVarSubsFields_$$($JSCompiler_StaticMethods_submit_$self$$);
  var $asyncInputs_i$jscomp$317$$ = $JSCompiler_StaticMethods_submit_$self$$.$D$.getElementsByClassName("i-amphtml-async-input");
  if (!$JSCompiler_StaticMethods_submit_$self$$.$I$ && "GET" == $JSCompiler_StaticMethods_submit_$self$$.$G$) {
    $JSCompiler_StaticMethods_submit_$self$$.$ssrTemplateHelper_$.isSupported();
    if (0 === $asyncInputs_i$jscomp$317$$.length) {
      for ($asyncInputs_i$jscomp$317$$ = 0; $asyncInputs_i$jscomp$317$$ < $event$252_varSubsFields$$.length; $asyncInputs_i$jscomp$317$$++) {
        $JSCompiler_StaticMethods_expandInputValue_$$($JSCompiler_StaticMethods_submit_$self$$.$R$, $event$252_varSubsFields$$[$asyncInputs_i$jscomp$317$$], !0);
      }
      $JSCompiler_StaticMethods_handleNonXhrGet_$$($JSCompiler_StaticMethods_submit_$self$$, $event$jscomp$122$$);
      return window.Promise.resolve();
    }
    $event$jscomp$122$$.preventDefault();
  }
  $JSCompiler_StaticMethods_AmpForm$$module$extensions$amp_form$0_1$amp_form_prototype$setState_$$($JSCompiler_StaticMethods_submit_$self$$, "submitting");
  var $presubmitPromises$$ = [];
  $presubmitPromises$$.push($JSCompiler_StaticMethods_doVarSubs_$$($JSCompiler_StaticMethods_submit_$self$$, $event$252_varSubsFields$$));
  _.$iterateCursor$$module$src$dom$$($asyncInputs_i$jscomp$317$$, function($trust$jscomp$6$$) {
    $presubmitPromises$$.push($JSCompiler_StaticMethods_getValueForAsyncInput_$$($JSCompiler_StaticMethods_submit_$self$$, $trust$jscomp$6$$));
  });
  return $JSCompiler_StaticMethods_waitOnPromisesOrTimeout_$$($JSCompiler_StaticMethods_submit_$self$$, $presubmitPromises$$, 10000).then(function() {
    if ($JSCompiler_StaticMethods_submit_$self$$.$I$) {
      var $event$252_varSubsFields$$ = $JSCompiler_StaticMethods_handleXhrSubmit_$$($JSCompiler_StaticMethods_submit_$self$$, $trust$jscomp$6$$);
    } else {
      "POST" != $JSCompiler_StaticMethods_submit_$self$$.$G$ && "GET" == $JSCompiler_StaticMethods_submit_$self$$.$G$ && $JSCompiler_StaticMethods_handleNonXhrGet_$$($JSCompiler_StaticMethods_submit_$self$$, $event$jscomp$122$$), $event$252_varSubsFields$$ = window.Promise.resolve();
    }
    return $event$252_varSubsFields$$;
  }, function($trust$jscomp$6$$) {
    return $JSCompiler_StaticMethods_handlePresubmitError_$$($JSCompiler_StaticMethods_submit_$self$$, $trust$jscomp$6$$);
  });
}, $JSCompiler_StaticMethods_getVarSubsFields_$$ = function($JSCompiler_StaticMethods_getVarSubsFields_$self$$) {
  return $JSCompiler_StaticMethods_getVarSubsFields_$self$$.$D$.querySelectorAll('[type="hidden"][data-amp-replace]');
}, $JSCompiler_StaticMethods_handlePresubmitError_$$ = function($JSCompiler_StaticMethods_handlePresubmitError_$self$$, $error$jscomp$72$$) {
  $JSCompiler_StaticMethods_AmpForm$$module$extensions$amp_form$0_1$amp_form_prototype$setState_$$($JSCompiler_StaticMethods_handlePresubmitError_$self$$, "submit-error");
  _.$dev$$module$src$log$$().error("amp-form", "Form submission failed: %s", $error$jscomp$72$$);
  $JSCompiler_StaticMethods_AmpForm$$module$extensions$amp_form$0_1$amp_form_prototype$renderTemplate_$$($JSCompiler_StaticMethods_handlePresubmitError_$self$$, _.$dict$$module$src$utils$object$$({error:$error$jscomp$72$$.message})).then(function() {
    $JSCompiler_StaticMethods_triggerAction_$$($JSCompiler_StaticMethods_handlePresubmitError_$self$$, "submit-error", $error$jscomp$72$$);
  });
}, $JSCompiler_StaticMethods_handleXhrVerify_$$ = function($JSCompiler_StaticMethods_handleXhrVerify_$self$$) {
  if ("submitting" === $JSCompiler_StaticMethods_handleXhrVerify_$self$$.$state_$) {
    return window.Promise.resolve();
  }
  $JSCompiler_StaticMethods_AmpForm$$module$extensions$amp_form$0_1$amp_form_prototype$setState_$$($JSCompiler_StaticMethods_handleXhrVerify_$self$$, "verifying");
  $JSCompiler_StaticMethods_triggerAction_$$($JSCompiler_StaticMethods_handleXhrVerify_$self$$, "verify", null);
  return $JSCompiler_StaticMethods_doVarSubs_$$($JSCompiler_StaticMethods_handleXhrVerify_$self$$, $JSCompiler_StaticMethods_getVarSubsFields_$$($JSCompiler_StaticMethods_handleXhrVerify_$self$$)).then(function() {
    return $JSCompiler_StaticMethods_doVerifyXhr_$$($JSCompiler_StaticMethods_handleXhrVerify_$self$$);
  });
}, $JSCompiler_StaticMethods_handleXhrSubmit_$$ = function($JSCompiler_StaticMethods_handleXhrSubmit_$self$$, $p$jscomp$30_trust$jscomp$8$$) {
  $JSCompiler_StaticMethods_handleXhrSubmit_$self$$.$ssrTemplateHelper_$.isSupported() ? $p$jscomp$30_trust$jscomp$8$$ = $JSCompiler_StaticMethods_handleSsrTemplate_$$($JSCompiler_StaticMethods_handleXhrSubmit_$self$$, $p$jscomp$30_trust$jscomp$8$$) : ($JSCompiler_StaticMethods_submittingWithTrust_$$($JSCompiler_StaticMethods_handleXhrSubmit_$self$$, $p$jscomp$30_trust$jscomp$8$$), $p$jscomp$30_trust$jscomp$8$$ = $JSCompiler_StaticMethods_AmpForm$$module$extensions$amp_form$0_1$amp_form_prototype$doXhr_$$($JSCompiler_StaticMethods_handleXhrSubmit_$self$$, 
  $JSCompiler_StaticMethods_handleXhrSubmit_$self$$.$I$, $JSCompiler_StaticMethods_handleXhrSubmit_$self$$.$G$).then(function($p$jscomp$30_trust$jscomp$8$$) {
    return $JSCompiler_StaticMethods_handleXhrSubmitSuccess_$$($JSCompiler_StaticMethods_handleXhrSubmit_$self$$, $p$jscomp$30_trust$jscomp$8$$);
  }, function($p$jscomp$30_trust$jscomp$8$$) {
    return $JSCompiler_StaticMethods_handleXhrSubmitFailure_$$($JSCompiler_StaticMethods_handleXhrSubmit_$self$$, $p$jscomp$30_trust$jscomp$8$$);
  }));
  return $p$jscomp$30_trust$jscomp$8$$;
}, $JSCompiler_StaticMethods_handleSsrTemplate_$$ = function($JSCompiler_StaticMethods_handleSsrTemplate_$self$$, $trust$jscomp$9$$) {
  var $request$jscomp$32$$, $values$jscomp$17$$ = $getFormAsObject$$module$src$form$$($JSCompiler_StaticMethods_handleSsrTemplate_$self$$.$D$);
  return $JSCompiler_StaticMethods_AmpForm$$module$extensions$amp_form$0_1$amp_form_prototype$renderTemplate_$$($JSCompiler_StaticMethods_handleSsrTemplate_$self$$, $values$jscomp$17$$).then(function() {
    $JSCompiler_StaticMethods_handleSsrTemplate_$self$$.$actions_$.$trigger$($JSCompiler_StaticMethods_handleSsrTemplate_$self$$.$D$, "submit", null, $trust$jscomp$9$$);
  }).then(function() {
    $request$jscomp$32$$ = $JSCompiler_StaticMethods_requestForFormFetch$$($JSCompiler_StaticMethods_handleSsrTemplate_$self$$, $JSCompiler_StaticMethods_handleSsrTemplate_$self$$.$I$, $JSCompiler_StaticMethods_handleSsrTemplate_$self$$.$G$);
    $request$jscomp$32$$.fetchOpt = _.$setupInit$$module$src$utils$xhr_utils$$($request$jscomp$32$$.fetchOpt);
    $request$jscomp$32$$.fetchOpt = _.$setupAMPCors$$module$src$utils$xhr_utils$$($JSCompiler_StaticMethods_handleSsrTemplate_$self$$.$F$, $request$jscomp$32$$.xhrUrl, $request$jscomp$32$$.fetchOpt);
    $request$jscomp$32$$.xhrUrl = _.$setupInput$$module$src$utils$xhr_utils$$($JSCompiler_StaticMethods_handleSsrTemplate_$self$$.$F$, $request$jscomp$32$$.xhrUrl, $request$jscomp$32$$.fetchOpt);
    var $trust$jscomp$9$$ = $JSCompiler_StaticMethods_handleSsrTemplate_$self$$.$ssrTemplateHelper_$, $values$jscomp$17$$ = $JSCompiler_StaticMethods_handleSsrTemplate_$self$$.$D$, $JSCompiler_temp_const$jscomp$745$$ = $request$jscomp$32$$, $successContainer$jscomp$inline_3261$$ = $JSCompiler_StaticMethods_handleSsrTemplate_$self$$.$D$.querySelector("div[submit-success]"), $errorContainer$jscomp$inline_3262$$ = $JSCompiler_StaticMethods_handleSsrTemplate_$self$$.$D$.querySelector("div[submit-error]"), 
    $successTemplate$jscomp$inline_3263$$, $errorTemplate$jscomp$inline_3264$$;
    $successContainer$jscomp$inline_3261$$ && ($successTemplate$jscomp$inline_3263$$ = _.$JSCompiler_StaticMethods_maybeFindTemplate$$($successContainer$jscomp$inline_3261$$));
    $errorContainer$jscomp$inline_3262$$ && ($errorTemplate$jscomp$inline_3264$$ = _.$JSCompiler_StaticMethods_maybeFindTemplate$$($errorContainer$jscomp$inline_3262$$));
    return _.$JSCompiler_StaticMethods_fetchAndRenderTemplate$$($trust$jscomp$9$$, $values$jscomp$17$$, $JSCompiler_temp_const$jscomp$745$$, {$successTemplate$:$successTemplate$jscomp$inline_3263$$, $errorTemplate$:$errorTemplate$jscomp$inline_3264$$});
  }).then(function($trust$jscomp$9$$) {
    return $JSCompiler_StaticMethods_handleSsrTemplateSuccess_$$($JSCompiler_StaticMethods_handleSsrTemplate_$self$$, $trust$jscomp$9$$, $request$jscomp$32$$);
  }, function($trust$jscomp$9$$) {
    return $JSCompiler_StaticMethods_handleSsrTemplateFailure_$$($JSCompiler_StaticMethods_handleSsrTemplate_$self$$, $trust$jscomp$9$$);
  });
}, $JSCompiler_StaticMethods_handleSsrTemplateFailure_$$ = function($JSCompiler_StaticMethods_handleSsrTemplateFailure_$self$$, $error$jscomp$75$$) {
  $JSCompiler_StaticMethods_AmpForm$$module$extensions$amp_form$0_1$amp_form_prototype$setState_$$($JSCompiler_StaticMethods_handleSsrTemplateFailure_$self$$, "submit-error");
  _.$user$$module$src$log$$().error("amp-form", "Form submission failed: %s", $error$jscomp$75$$);
  return _.$tryResolve$$module$src$utils$promise$$(function() {
    $JSCompiler_StaticMethods_AmpForm$$module$extensions$amp_form$0_1$amp_form_prototype$renderTemplate_$$($JSCompiler_StaticMethods_handleSsrTemplateFailure_$self$$, $error$jscomp$75$$ || {}).then(function() {
      $JSCompiler_StaticMethods_triggerAction_$$($JSCompiler_StaticMethods_handleSsrTemplateFailure_$self$$, "submit-error", $error$jscomp$75$$);
    });
  });
}, $JSCompiler_StaticMethods_submittingWithTrust_$$ = function($JSCompiler_StaticMethods_submittingWithTrust_$self$$, $trust$jscomp$10$$) {
  $JSCompiler_StaticMethods_triggerFormSubmitInAnalytics_$$($JSCompiler_StaticMethods_submittingWithTrust_$self$$, "amp-form-submit");
  var $values$jscomp$18$$ = $getFormAsObject$$module$src$form$$($JSCompiler_StaticMethods_submittingWithTrust_$self$$.$D$);
  $JSCompiler_StaticMethods_AmpForm$$module$extensions$amp_form$0_1$amp_form_prototype$renderTemplate_$$($JSCompiler_StaticMethods_submittingWithTrust_$self$$, $values$jscomp$18$$).then(function() {
    $JSCompiler_StaticMethods_submittingWithTrust_$self$$.$actions_$.$trigger$($JSCompiler_StaticMethods_submittingWithTrust_$self$$.$D$, "submit", null, $trust$jscomp$10$$);
  });
}, $JSCompiler_StaticMethods_doVarSubs_$$ = function($JSCompiler_StaticMethods_doVarSubs_$self$$, $varSubsFields$jscomp$1$$) {
  for (var $varSubPromises$$ = [], $i$jscomp$318$$ = 0; $i$jscomp$318$$ < $varSubsFields$jscomp$1$$.length; $i$jscomp$318$$++) {
    $varSubPromises$$.push($JSCompiler_StaticMethods_expandInputValue_$$($JSCompiler_StaticMethods_doVarSubs_$self$$.$R$, $varSubsFields$jscomp$1$$[$i$jscomp$318$$], !1));
  }
  return $JSCompiler_StaticMethods_waitOnPromisesOrTimeout_$$($JSCompiler_StaticMethods_doVarSubs_$self$$, $varSubPromises$$, 100);
}, $JSCompiler_StaticMethods_getValueForAsyncInput_$$ = function($JSCompiler_StaticMethods_getValueForAsyncInput_$self$$, $asyncInput$jscomp$1$$) {
  return $asyncInput$jscomp$1$$.$getImpl$().then(function($JSCompiler_StaticMethods_getValueForAsyncInput_$self$$) {
    return $JSCompiler_StaticMethods_getValueForAsyncInput_$self$$.$getValue$();
  }).then(function($value$jscomp$233$$) {
    var $input$jscomp$64_name$jscomp$240$$ = $asyncInput$jscomp$1$$.getAttribute("name");
    ($input$jscomp$64_name$jscomp$240$$ = $JSCompiler_StaticMethods_getValueForAsyncInput_$self$$.$D$.querySelector("input[name=" + _.$cssEscape$$module$third_party$css_escape$css_escape$$($input$jscomp$64_name$jscomp$240$$) + "]")) || ($input$jscomp$64_name$jscomp$240$$ = _.$createElementWithAttributes$$module$src$dom$$($JSCompiler_StaticMethods_getValueForAsyncInput_$self$$.$F$.document, "input", _.$dict$$module$src$utils$object$$({name:$asyncInput$jscomp$1$$.getAttribute("name"), hidden:"true"})));
    $input$jscomp$64_name$jscomp$240$$.setAttribute("value", $value$jscomp$233$$);
    $JSCompiler_StaticMethods_getValueForAsyncInput_$self$$.$D$.appendChild($input$jscomp$64_name$jscomp$240$$);
  });
}, $JSCompiler_StaticMethods_doVerifyXhr_$$ = function($JSCompiler_StaticMethods_doVerifyXhr_$self$$) {
  var $blacklist$$ = _.$toArray$$module$src$types$$($JSCompiler_StaticMethods_doVerifyXhr_$self$$.$D$.querySelectorAll("[" + _.$cssEscape$$module$third_party$css_escape$css_escape$$("no-verify") + "]")).map(function($JSCompiler_StaticMethods_doVerifyXhr_$self$$) {
    return $JSCompiler_StaticMethods_doVerifyXhr_$self$$.name || $JSCompiler_StaticMethods_doVerifyXhr_$self$$.id;
  }), $$jscomp$compprop32$$ = {};
  return $JSCompiler_StaticMethods_AmpForm$$module$extensions$amp_form$0_1$amp_form_prototype$doXhr_$$($JSCompiler_StaticMethods_doVerifyXhr_$self$$, $JSCompiler_StaticMethods_doVerifyXhr_$self$$.$ea$, $JSCompiler_StaticMethods_doVerifyXhr_$self$$.$G$, ($$jscomp$compprop32$$.__amp_form_verify = !0, $$jscomp$compprop32$$), $blacklist$$);
}, $JSCompiler_StaticMethods_AmpForm$$module$extensions$amp_form$0_1$amp_form_prototype$doXhr_$$ = function($JSCompiler_StaticMethods_AmpForm$$module$extensions$amp_form$0_1$amp_form_prototype$doXhr_$self$$, $request$jscomp$33_url$jscomp$186$$, $method$jscomp$30$$, $opt_extraFields$jscomp$1$$, $opt_fieldBlacklist$jscomp$1$$) {
  $JSCompiler_StaticMethods_AmpForm$$module$extensions$amp_form$0_1$amp_form_prototype$doXhr_$self$$.$ssrTemplateHelper_$.isSupported();
  $request$jscomp$33_url$jscomp$186$$ = $JSCompiler_StaticMethods_requestForFormFetch$$($JSCompiler_StaticMethods_AmpForm$$module$extensions$amp_form$0_1$amp_form_prototype$doXhr_$self$$, $request$jscomp$33_url$jscomp$186$$, $method$jscomp$30$$, $opt_extraFields$jscomp$1$$, $opt_fieldBlacklist$jscomp$1$$);
  return $JSCompiler_StaticMethods_AmpForm$$module$extensions$amp_form$0_1$amp_form_prototype$doXhr_$self$$.$xhr_$.fetch($request$jscomp$33_url$jscomp$186$$.xhrUrl, $request$jscomp$33_url$jscomp$186$$.fetchOpt);
}, $JSCompiler_StaticMethods_handleSsrTemplateSuccess_$$ = function($JSCompiler_StaticMethods_handleSsrTemplateSuccess_$self$$, $response$jscomp$53$$, $request$jscomp$34$$) {
  _.$verifyAmpCORSHeaders$$module$src$utils$xhr_utils$$($JSCompiler_StaticMethods_handleSsrTemplateSuccess_$self$$.$F$, _.$fromStructuredCloneable$$module$src$utils$xhr_utils$$($response$jscomp$53$$, $request$jscomp$34$$.fetchOpt.responseType));
  return $JSCompiler_StaticMethods_handleSubmitSuccess_$$($JSCompiler_StaticMethods_handleSsrTemplateSuccess_$self$$, _.$tryResolve$$module$src$utils$promise$$(function() {
    return $response$jscomp$53$$.html;
  }));
}, $JSCompiler_StaticMethods_handleXhrSubmitSuccess_$$ = function($JSCompiler_StaticMethods_handleXhrSubmitSuccess_$self$$, $response$jscomp$54$$) {
  return $JSCompiler_StaticMethods_handleSubmitSuccess_$$($JSCompiler_StaticMethods_handleXhrSubmitSuccess_$self$$, $response$jscomp$54$$.json()).then(function() {
    $JSCompiler_StaticMethods_triggerFormSubmitInAnalytics_$$($JSCompiler_StaticMethods_handleXhrSubmitSuccess_$self$$, "amp-form-submit-success");
    $JSCompiler_StaticMethods_maybeHandleRedirect_$$($JSCompiler_StaticMethods_handleXhrSubmitSuccess_$self$$, $response$jscomp$54$$);
  });
}, $JSCompiler_StaticMethods_handleSubmitSuccess_$$ = function($JSCompiler_StaticMethods_handleSubmitSuccess_$self$$, $jsonPromise$$) {
  return $jsonPromise$$.then(function($jsonPromise$$) {
    $JSCompiler_StaticMethods_AmpForm$$module$extensions$amp_form$0_1$amp_form_prototype$setState_$$($JSCompiler_StaticMethods_handleSubmitSuccess_$self$$, "submit-success");
    $JSCompiler_StaticMethods_AmpForm$$module$extensions$amp_form$0_1$amp_form_prototype$renderTemplate_$$($JSCompiler_StaticMethods_handleSubmitSuccess_$self$$, $jsonPromise$$ || {}).then(function() {
      $JSCompiler_StaticMethods_triggerAction_$$($JSCompiler_StaticMethods_handleSubmitSuccess_$self$$, "submit-success", $jsonPromise$$);
    });
  }, function($JSCompiler_StaticMethods_handleSubmitSuccess_$self$$) {
    _.$user$$module$src$log$$().error("amp-form", "Failed to parse response JSON: %s", $JSCompiler_StaticMethods_handleSubmitSuccess_$self$$);
  });
}, $JSCompiler_StaticMethods_handleXhrSubmitFailure_$$ = function($JSCompiler_StaticMethods_handleXhrSubmitFailure_$self$$, $error$jscomp$77$$) {
  var $promise$jscomp$43$$;
  $error$jscomp$77$$ && $error$jscomp$77$$.response ? $promise$jscomp$43$$ = $error$jscomp$77$$.response.json().catch(function() {
    return null;
  }) : $promise$jscomp$43$$ = window.Promise.resolve(null);
  return $promise$jscomp$43$$.then(function($promise$jscomp$43$$) {
    $JSCompiler_StaticMethods_triggerFormSubmitInAnalytics_$$($JSCompiler_StaticMethods_handleXhrSubmitFailure_$self$$, "amp-form-submit-error");
    $JSCompiler_StaticMethods_AmpForm$$module$extensions$amp_form$0_1$amp_form_prototype$setState_$$($JSCompiler_StaticMethods_handleXhrSubmitFailure_$self$$, "submit-error");
    $JSCompiler_StaticMethods_AmpForm$$module$extensions$amp_form$0_1$amp_form_prototype$renderTemplate_$$($JSCompiler_StaticMethods_handleXhrSubmitFailure_$self$$, $promise$jscomp$43$$ || {}).then(function() {
      $JSCompiler_StaticMethods_triggerAction_$$($JSCompiler_StaticMethods_handleXhrSubmitFailure_$self$$, "submit-error", $promise$jscomp$43$$);
    });
    $JSCompiler_StaticMethods_maybeHandleRedirect_$$($JSCompiler_StaticMethods_handleXhrSubmitFailure_$self$$, $error$jscomp$77$$.response);
    _.$user$$module$src$log$$().error("amp-form", "Form submission failed: %s", $error$jscomp$77$$);
  });
}, $JSCompiler_StaticMethods_handleNonXhrGet_$$ = function($JSCompiler_StaticMethods_handleNonXhrGet_$self$$, $event$jscomp$124$$) {
  $JSCompiler_StaticMethods_triggerFormSubmitInAnalytics_$$($JSCompiler_StaticMethods_handleNonXhrGet_$self$$, "amp-form-submit");
  $event$jscomp$124$$ || $JSCompiler_StaticMethods_handleNonXhrGet_$self$$.$D$.submit();
  $JSCompiler_StaticMethods_AmpForm$$module$extensions$amp_form$0_1$amp_form_prototype$setState_$$($JSCompiler_StaticMethods_handleNonXhrGet_$self$$, "initial");
}, $JSCompiler_StaticMethods_checkValidity_$$ = function($JSCompiler_StaticMethods_checkValidity_$self$$) {
  void 0 === $checkValiditySupported$$module$extensions$amp_form$0_1$form_validators$$ && ($checkValiditySupported$$module$extensions$amp_form$0_1$form_validators$$ = !!$JSCompiler_StaticMethods_checkValidity_$self$$.$F$.document.createElement("input").checkValidity);
  if ($checkValiditySupported$$module$extensions$amp_form$0_1$form_validators$$) {
    var $isValid$jscomp$3$$ = $checkUserValidityOnSubmission$$module$extensions$amp_form$0_1$amp_form$$($JSCompiler_StaticMethods_checkValidity_$self$$.$D$);
    if ($JSCompiler_StaticMethods_checkValidity_$self$$.$P$) {
      return $JSCompiler_StaticMethods_checkValidity_$self$$.$J$.$F$(), $isValid$jscomp$3$$;
    }
  }
  return !0;
}, $JSCompiler_StaticMethods_maybeHandleRedirect_$$ = function($JSCompiler_StaticMethods_maybeHandleRedirect_$self$$, $redirectTo_response$jscomp$55$$) {
  $JSCompiler_StaticMethods_maybeHandleRedirect_$self$$.$ssrTemplateHelper_$.isSupported();
  if ($redirectTo_response$jscomp$55$$ && $redirectTo_response$jscomp$55$$.headers && ($redirectTo_response$jscomp$55$$ = $redirectTo_response$jscomp$55$$.headers.get("AMP-Redirect-To"))) {
    try {
      _.$Services$$module$src$services$urlForDoc$$($JSCompiler_StaticMethods_maybeHandleRedirect_$self$$.$D$), _.$parseUrlDeprecated$$module$src$url$$($redirectTo_response$jscomp$55$$);
    } catch ($e$254$$) {
    }
    _.$JSCompiler_StaticMethods_navigateTo$$(_.$Services$$module$src$services$navigationForDoc$$($JSCompiler_StaticMethods_maybeHandleRedirect_$self$$.$D$), $JSCompiler_StaticMethods_maybeHandleRedirect_$self$$.$F$, $redirectTo_response$jscomp$55$$, "AMP-Redirect-To");
  }
}, $JSCompiler_StaticMethods_triggerAction_$$ = function($JSCompiler_StaticMethods_triggerAction_$self$$, $name$jscomp$241$$, $detail$jscomp$5_event$jscomp$125$$) {
  $detail$jscomp$5_event$jscomp$125$$ = _.$createCustomEvent$$module$src$event_helper$$($JSCompiler_StaticMethods_triggerAction_$self$$.$F$, "amp-form." + $name$jscomp$241$$, _.$dict$$module$src$utils$object$$({response:$detail$jscomp$5_event$jscomp$125$$}));
  $JSCompiler_StaticMethods_triggerAction_$self$$.$actions_$.$trigger$($JSCompiler_StaticMethods_triggerAction_$self$$.$D$, $name$jscomp$241$$, $detail$jscomp$5_event$jscomp$125$$, 100);
}, $JSCompiler_StaticMethods_waitOnPromisesOrTimeout_$$ = function($JSCompiler_StaticMethods_waitOnPromisesOrTimeout_$self$$, $promises$jscomp$21$$, $timeout$jscomp$14$$) {
  return window.Promise.race([window.Promise.all($promises$jscomp$21$$), $JSCompiler_StaticMethods_waitOnPromisesOrTimeout_$self$$.$timer_$.$promise$($timeout$jscomp$14$$)]);
}, $JSCompiler_StaticMethods_AmpForm$$module$extensions$amp_form$0_1$amp_form_prototype$setState_$$ = function($JSCompiler_StaticMethods_AmpForm$$module$extensions$amp_form$0_1$amp_form_prototype$setState_$self$$, $newState$jscomp$16$$) {
  var $container$jscomp$inline_3282_previousRender$jscomp$inline_3283_previousState$jscomp$1$$ = $JSCompiler_StaticMethods_AmpForm$$module$extensions$amp_form$0_1$amp_form_prototype$setState_$self$$.$state_$;
  $JSCompiler_StaticMethods_AmpForm$$module$extensions$amp_form$0_1$amp_form_prototype$setState_$self$$.$D$.classList.remove("amp-form-" + $container$jscomp$inline_3282_previousRender$jscomp$inline_3283_previousState$jscomp$1$$);
  $JSCompiler_StaticMethods_AmpForm$$module$extensions$amp_form$0_1$amp_form_prototype$setState_$self$$.$D$.classList.add("amp-form-" + $newState$jscomp$16$$);
  ($container$jscomp$inline_3282_previousRender$jscomp$inline_3283_previousState$jscomp$1$$ = $JSCompiler_StaticMethods_AmpForm$$module$extensions$amp_form$0_1$amp_form_prototype$setState_$self$$.$D$.querySelector("[" + $container$jscomp$inline_3282_previousRender$jscomp$inline_3283_previousState$jscomp$1$$ + "]")) && ($container$jscomp$inline_3282_previousRender$jscomp$inline_3283_previousState$jscomp$1$$ = _.$childElementByAttr$$module$src$dom$$($container$jscomp$inline_3282_previousRender$jscomp$inline_3283_previousState$jscomp$1$$, 
  "i-amphtml-rendered")) && _.$removeElement$$module$src$dom$$($container$jscomp$inline_3282_previousRender$jscomp$inline_3283_previousState$jscomp$1$$);
  $JSCompiler_StaticMethods_AmpForm$$module$extensions$amp_form$0_1$amp_form_prototype$setState_$self$$.$state_$ = $newState$jscomp$16$$;
}, $JSCompiler_StaticMethods_AmpForm$$module$extensions$amp_form$0_1$amp_form_prototype$renderTemplate_$$ = function($JSCompiler_StaticMethods_AmpForm$$module$extensions$amp_form$0_1$amp_form_prototype$renderTemplate_$self$$, $data$jscomp$130$$) {
  var $container$jscomp$12$$ = $JSCompiler_StaticMethods_AmpForm$$module$extensions$amp_form$0_1$amp_form_prototype$renderTemplate_$self$$.$D$.querySelector("[" + $JSCompiler_StaticMethods_AmpForm$$module$extensions$amp_form$0_1$amp_form_prototype$renderTemplate_$self$$.$state_$ + "]"), $p$jscomp$31$$ = window.Promise.resolve();
  if ($container$jscomp$12$$) {
    var $messageId$jscomp$1$$ = "rendered-message-" + $JSCompiler_StaticMethods_AmpForm$$module$extensions$amp_form$0_1$amp_form_prototype$renderTemplate_$self$$.$V$;
    $container$jscomp$12$$.setAttribute("role", "alert");
    $container$jscomp$12$$.setAttribute("aria-labeledby", $messageId$jscomp$1$$);
    $container$jscomp$12$$.setAttribute("aria-live", "assertive");
    _.$JSCompiler_StaticMethods_maybeFindTemplate$$($container$jscomp$12$$, void 0) ? $p$jscomp$31$$ = _.$JSCompiler_StaticMethods_findAndRenderTemplate$$($JSCompiler_StaticMethods_AmpForm$$module$extensions$amp_form$0_1$amp_form_prototype$renderTemplate_$self$$.$templates_$, $container$jscomp$12$$, $data$jscomp$130$$).then(function($data$jscomp$130$$) {
      $data$jscomp$130$$.id = $messageId$jscomp$1$$;
      $data$jscomp$130$$.setAttribute("i-amphtml-rendered", "");
      return $JSCompiler_StaticMethods_AmpForm$$module$extensions$amp_form$0_1$amp_form_prototype$renderTemplate_$self$$.$O$.$mutateElement$($container$jscomp$12$$, function() {
        $container$jscomp$12$$.appendChild($data$jscomp$130$$);
        var $p$jscomp$31$$ = _.$createCustomEvent$$module$src$event_helper$$($JSCompiler_StaticMethods_AmpForm$$module$extensions$amp_form$0_1$amp_form_prototype$renderTemplate_$self$$.$F$, "amp:dom-update", null, {bubbles:!0});
        $container$jscomp$12$$.dispatchEvent($p$jscomp$31$$);
      });
    }) : $JSCompiler_StaticMethods_AmpForm$$module$extensions$amp_form$0_1$amp_form_prototype$renderTemplate_$self$$.$O$.$mutateElement$($container$jscomp$12$$, function() {
    });
  }
  return $p$jscomp$31$$;
}, $checkUserValidityOnSubmission$$module$extensions$amp_form$0_1$amp_form$$ = function($form$jscomp$18$$) {
  _.$iterateCursor$$module$src$dom$$($form$jscomp$18$$.querySelectorAll("input,select,textarea,fieldset"), function($form$jscomp$18$$) {
    return $checkUserValidity$$module$extensions$amp_form$0_1$amp_form$$($form$jscomp$18$$);
  });
  return $checkUserValidity$$module$extensions$amp_form$0_1$amp_form$$($form$jscomp$18$$);
}, $removeValidityStateClasses$$module$extensions$amp_form$0_1$amp_form$$ = function($form$jscomp$19$$) {
  var $dummyInput_elements$jscomp$31$$ = window.document.createElement("input"), $$jscomp$loop$401$$ = {}, $validityState$$;
  for ($validityState$$ in $dummyInput_elements$jscomp$31$$.validity) {
    $$jscomp$loop$401$$.$validityState$ = $validityState$$, $dummyInput_elements$jscomp$31$$ = $form$jscomp$19$$.querySelectorAll("." + _.$cssEscape$$module$third_party$css_escape$css_escape$$($$jscomp$loop$401$$.$validityState$)), _.$iterateCursor$$module$src$dom$$($dummyInput_elements$jscomp$31$$, function($form$jscomp$19$$) {
      return function($dummyInput_elements$jscomp$31$$) {
        $dummyInput_elements$jscomp$31$$.classList.remove($form$jscomp$19$$.$validityState$);
      };
    }($$jscomp$loop$401$$)), $$jscomp$loop$401$$ = {$validityState$:$$jscomp$loop$401$$.$validityState$};
  }
}, $checkUserValidity$$module$extensions$amp_form$0_1$amp_form$$ = function($element$jscomp$413$$, $ancestors$jscomp$2_propagate$$) {
  $ancestors$jscomp$2_propagate$$ = void 0 === $ancestors$jscomp$2_propagate$$ ? !1 : $ancestors$jscomp$2_propagate$$;
  if (!$element$jscomp$413$$.checkValidity) {
    return !0;
  }
  var $i$jscomp$319_shouldPropagate$$ = !1;
  var $JSCompiler_inline_result$jscomp$749$$ = $element$jscomp$413$$.classList.contains("user-valid") ? "valid" : $element$jscomp$413$$.classList.contains("user-invalid") ? "invalid" : "none";
  var $isCurrentlyValid$$ = $element$jscomp$413$$.checkValidity();
  "valid" != $JSCompiler_inline_result$jscomp$749$$ && $isCurrentlyValid$$ ? ($element$jscomp$413$$.classList.add("user-valid"), $element$jscomp$413$$.classList.remove("user-invalid"), $i$jscomp$319_shouldPropagate$$ = "invalid" == $JSCompiler_inline_result$jscomp$749$$) : "invalid" == $JSCompiler_inline_result$jscomp$749$$ || $isCurrentlyValid$$ || ($element$jscomp$413$$.classList.add("user-invalid"), $element$jscomp$413$$.classList.remove("user-valid"), $i$jscomp$319_shouldPropagate$$ = !0);
  if ($element$jscomp$413$$.validity) {
    for (var $validationType$jscomp$inline_3288$$ in $element$jscomp$413$$.validity) {
      $element$jscomp$413$$.classList.toggle($validationType$jscomp$inline_3288$$, $element$jscomp$413$$.validity[$validationType$jscomp$inline_3288$$]);
    }
  }
  if ($ancestors$jscomp$2_propagate$$ && $i$jscomp$319_shouldPropagate$$) {
    $ancestors$jscomp$2_propagate$$ = _.$ancestorElementsByTag$$module$src$dom$$($element$jscomp$413$$, "fieldset");
    for ($i$jscomp$319_shouldPropagate$$ = 0; $i$jscomp$319_shouldPropagate$$ < $ancestors$jscomp$2_propagate$$.length; $i$jscomp$319_shouldPropagate$$++) {
      $checkUserValidity$$module$extensions$amp_form$0_1$amp_form$$($ancestors$jscomp$2_propagate$$[$i$jscomp$319_shouldPropagate$$]);
    }
    $element$jscomp$413$$.form && $checkUserValidity$$module$extensions$amp_form$0_1$amp_form$$($element$jscomp$413$$.form);
  }
  return $isCurrentlyValid$$;
}, $checkUserValidityAfterInteraction_$$module$extensions$amp_form$0_1$amp_form$$ = function($input$jscomp$65$$) {
  $checkUserValidity$$module$extensions$amp_form$0_1$amp_form$$($input$jscomp$65$$, !0);
}, $JSCompiler_StaticMethods_installStyles_$$ = function($ampdoc$jscomp$170$$) {
  var $deferred$jscomp$45$$ = new _.$Deferred$$module$src$utils$promise$$;
  _.$installStylesForDoc$$module$src$style_installer$$($ampdoc$jscomp$170$$, 'form.amp-form-submit-error [submit-error],form.amp-form-submit-success [submit-success],form.amp-form-submitting [submitting]{display:block}.i-amphtml-validation-bubble{-webkit-transform:translate(-50%,-100%);transform:translate(-50%,-100%);background-color:#fff;box-shadow:0 5px 15px 0 rgba(0,0,0,0.5);max-width:200px;position:absolute;display:block;box-sizing:border-box;padding:10px;border-radius:5px}.i-amphtml-validation-bubble:after{content:" ";position:absolute;bottom:-8px;left:30px;width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;border-top:8px solid #fff}[visible-when-invalid]{color:red}\n/*# sourceURL=/extensions/amp-form/0.1/amp-form.css*/', 
  $deferred$jscomp$45$$.resolve, !1, "amp-form");
  return $deferred$jscomp$45$$.$promise$;
}, $JSCompiler_StaticMethods_installHandlers_$$ = function($ampdoc$jscomp$171$$) {
  return $ampdoc$jscomp$171$$.$whenReady$().then(function() {
    $JSCompiler_StaticMethods_installSubmissionHandlers_$$($ampdoc$jscomp$171$$.getRootNode().querySelectorAll("form"));
    $JSCompiler_StaticMethods_AmpFormService$$module$extensions$amp_form$0_1$amp_form_prototype$installGlobalEventListener_$$($ampdoc$jscomp$171$$.getRootNode());
  });
}, $JSCompiler_StaticMethods_installSubmissionHandlers_$$ = function($forms$$) {
  $forms$$ && _.$iterateCursor$$module$src$dom$$($forms$$, function($forms$$, $index$jscomp$122$$) {
    $forms$$.__AMP_FORM || new $AmpForm$$module$extensions$amp_form$0_1$amp_form$$($forms$$, "amp-form-" + $index$jscomp$122$$);
  });
}, $JSCompiler_StaticMethods_AmpFormService$$module$extensions$amp_form$0_1$amp_form_prototype$installGlobalEventListener_$$ = function($doc$jscomp$91$$) {
  $doc$jscomp$91$$.addEventListener("amp:dom-update", function() {
    $JSCompiler_StaticMethods_installSubmissionHandlers_$$($doc$jscomp$91$$.querySelectorAll("form"));
  });
};
$LastAddedResolver$$module$src$utils$promise$$.prototype.add = function($promise$$) {
  var $$jscomp$this$$ = this, $countAtAdd$$ = ++this.$D$;
  window.Promise.resolve($promise$$).then(function($promise$$) {
    $$jscomp$this$$.$D$ === $countAtAdd$$ && $$jscomp$this$$.$I$($promise$$);
  }, function($promise$$) {
    $$jscomp$this$$.$D$ === $countAtAdd$$ && $$jscomp$this$$.$G$($promise$$);
  });
  return this.$F$;
};
$LastAddedResolver$$module$src$utils$promise$$.prototype.then = function($opt_resolve$$, $opt_reject$$) {
  return this.$F$.then($opt_resolve$$, $opt_reject$$);
};
$NativeFormDataWrapper$$module$src$form_data_wrapper$$.prototype.append = function($name$jscomp$104$$, $value$jscomp$120$$) {
  this.$D$.append($name$jscomp$104$$, $value$jscomp$120$$);
};
$NativeFormDataWrapper$$module$src$form_data_wrapper$$.prototype.delete = function($name$jscomp$105$$) {
  this.$D$.delete($name$jscomp$105$$);
};
$NativeFormDataWrapper$$module$src$form_data_wrapper$$.prototype.entries = function() {
  return this.$D$.entries();
};
$NativeFormDataWrapper$$module$src$form_data_wrapper$$.prototype.getFormData = function() {
  return this.$D$;
};
$PolyfillFormDataWrapper$$module$src$form_data_wrapper$$.prototype.append = function($name$jscomp$100_nameString$$, $value$jscomp$117$$) {
  $name$jscomp$100_nameString$$ = String($name$jscomp$100_nameString$$);
  this.$D$[$name$jscomp$100_nameString$$] = this.$D$[$name$jscomp$100_nameString$$] || [];
  this.$D$[$name$jscomp$100_nameString$$].push(String($value$jscomp$117$$));
};
$PolyfillFormDataWrapper$$module$src$form_data_wrapper$$.prototype.delete = function($name$jscomp$101$$) {
  delete this.$D$[$name$jscomp$101$$];
};
$PolyfillFormDataWrapper$$module$src$form_data_wrapper$$.prototype.entries = function() {
  var $$jscomp$this$jscomp$3$$ = this, $fieldEntries$$ = [];
  Object.keys(this.$D$).forEach(function($nextIndex$$) {
    $$jscomp$this$jscomp$3$$.$D$[$nextIndex$$].forEach(function($$jscomp$this$jscomp$3$$) {
      return $fieldEntries$$.push([$nextIndex$$, $$jscomp$this$jscomp$3$$]);
    });
  });
  var $nextIndex$$ = 0;
  return {next:function() {
    return $nextIndex$$ < $fieldEntries$$.length ? {value:$fieldEntries$$[$nextIndex$$++], done:!1} : {value:void 0, done:!0};
  }};
};
$PolyfillFormDataWrapper$$module$src$form_data_wrapper$$.prototype.getFormData = function() {
  var $$jscomp$this$jscomp$4$$ = this, $formData$$ = new window.FormData;
  Object.keys(this.$D$).forEach(function($name$jscomp$103$$) {
    $$jscomp$this$jscomp$4$$.$D$[$name$jscomp$103$$].forEach(function($$jscomp$this$jscomp$4$$) {
      return $formData$$.append($name$jscomp$103$$, $$jscomp$this$jscomp$4$$);
    });
  });
  return $formData$$;
};
_.$$jscomp$inherits$$($Ios11NativeFormDataWrapper$$module$src$form_data_wrapper$$, $NativeFormDataWrapper$$module$src$form_data_wrapper$$);
$Ios11NativeFormDataWrapper$$module$src$form_data_wrapper$$.prototype.append = function($name$jscomp$106$$, $value$jscomp$121$$, $opt_filename$jscomp$3$$) {
  $value$jscomp$121$$ && "object" == typeof $value$jscomp$121$$ && "" == $value$jscomp$121$$.name && 0 == $value$jscomp$121$$.size ? this.$D$.append($name$jscomp$106$$, new window.Blob([]), $opt_filename$jscomp$3$$ || "") : this.$D$.append($name$jscomp$106$$, $value$jscomp$121$$);
};
$FormSubmitService$$module$extensions$amp_form$0_1$form_submit_service$$.prototype.$F$ = function($cb$jscomp$10$$) {
  return this.$D$.add($cb$jscomp$10$$);
};
$FormSubmitService$$module$extensions$amp_form$0_1$form_submit_service$$.prototype.$fire$ = function($event$jscomp$113$$) {
  this.$D$.$fire$($event$jscomp$113$$);
};
var $LegacyPropAccessType$$module$extensions$amp_form$0_1$form_proxy$ATTR$$ = 1, $LegacyPropAccessType$$module$extensions$amp_form$0_1$form_proxy$READ_ONCE$$ = 2, $LegacyPropDataType$$module$extensions$amp_form$0_1$form_proxy$URL$$ = 1, $LegacyPropDataType$$module$extensions$amp_form$0_1$form_proxy$BOOL$$ = 2, $LegacyPropDataType$$module$extensions$amp_form$0_1$form_proxy$TOGGLE$$ = 3, $LEGACY_PROPS$$module$extensions$amp_form$0_1$form_proxy$$ = {acceptCharset:{$access$:$LegacyPropAccessType$$module$extensions$amp_form$0_1$form_proxy$ATTR$$, 
$attr$:"accept-charset"}, accessKey:{$access$:$LegacyPropAccessType$$module$extensions$amp_form$0_1$form_proxy$ATTR$$, $attr$:"accesskey"}, action:{$access$:$LegacyPropAccessType$$module$extensions$amp_form$0_1$form_proxy$ATTR$$, type:$LegacyPropDataType$$module$extensions$amp_form$0_1$form_proxy$URL$$}, attributes:{$access$:$LegacyPropAccessType$$module$extensions$amp_form$0_1$form_proxy$READ_ONCE$$}, autocomplete:{$access$:$LegacyPropAccessType$$module$extensions$amp_form$0_1$form_proxy$ATTR$$, 
$def$:"on"}, children:{$access$:$LegacyPropAccessType$$module$extensions$amp_form$0_1$form_proxy$READ_ONCE$$}, dataset:{$access$:$LegacyPropAccessType$$module$extensions$amp_form$0_1$form_proxy$READ_ONCE$$}, dir:{$access$:$LegacyPropAccessType$$module$extensions$amp_form$0_1$form_proxy$ATTR$$}, draggable:{$access$:$LegacyPropAccessType$$module$extensions$amp_form$0_1$form_proxy$ATTR$$, type:$LegacyPropDataType$$module$extensions$amp_form$0_1$form_proxy$BOOL$$, $def$:!1}, elements:{$access$:$LegacyPropAccessType$$module$extensions$amp_form$0_1$form_proxy$READ_ONCE$$}, 
encoding:{$access$:$LegacyPropAccessType$$module$extensions$amp_form$0_1$form_proxy$READ_ONCE$$}, enctype:{$access$:$LegacyPropAccessType$$module$extensions$amp_form$0_1$form_proxy$ATTR$$}, hidden:{$access$:$LegacyPropAccessType$$module$extensions$amp_form$0_1$form_proxy$ATTR$$, type:$LegacyPropDataType$$module$extensions$amp_form$0_1$form_proxy$TOGGLE$$, $def$:!1}, id:{$access$:$LegacyPropAccessType$$module$extensions$amp_form$0_1$form_proxy$ATTR$$, $def$:""}, lang:{$access$:$LegacyPropAccessType$$module$extensions$amp_form$0_1$form_proxy$ATTR$$}, 
localName:{$access$:$LegacyPropAccessType$$module$extensions$amp_form$0_1$form_proxy$READ_ONCE$$}, method:{$access$:$LegacyPropAccessType$$module$extensions$amp_form$0_1$form_proxy$ATTR$$, $def$:"get"}, name:{$access$:$LegacyPropAccessType$$module$extensions$amp_form$0_1$form_proxy$ATTR$$}, noValidate:{$access$:$LegacyPropAccessType$$module$extensions$amp_form$0_1$form_proxy$ATTR$$, $attr$:"novalidate", type:$LegacyPropDataType$$module$extensions$amp_form$0_1$form_proxy$TOGGLE$$, $def$:!1}, prefix:{$access$:$LegacyPropAccessType$$module$extensions$amp_form$0_1$form_proxy$READ_ONCE$$}, 
spellcheck:{$access$:$LegacyPropAccessType$$module$extensions$amp_form$0_1$form_proxy$ATTR$$}, style:{$access$:$LegacyPropAccessType$$module$extensions$amp_form$0_1$form_proxy$READ_ONCE$$}, target:{$access$:$LegacyPropAccessType$$module$extensions$amp_form$0_1$form_proxy$ATTR$$, $def$:""}, title:{$access$:$LegacyPropAccessType$$module$extensions$amp_form$0_1$form_proxy$ATTR$$}, translate:{$access$:$LegacyPropAccessType$$module$extensions$amp_form$0_1$form_proxy$ATTR$$}};
$ValidationBubble$$module$extensions$amp_form$0_1$validation_bubble$$.prototype.$hide$ = function() {
  this.$isVisible_$ && (this.$isVisible_$ = !1, this.$F$ = null, this.$G$ = "", _.$JSCompiler_StaticMethods_Vsync$$module$src$service$vsync_impl_prototype$run$$(this.$vsync_$, {measure:void 0, $mutate$:$hideBubble$$module$extensions$amp_form$0_1$validation_bubble$$}, {$bubbleElement$:this.$D$}));
};
$ValidationBubble$$module$extensions$amp_form$0_1$validation_bubble$$.prototype.show = function($targetElement$$, $message$jscomp$62$$) {
  this.$isVisible_$ && $targetElement$$ == this.$F$ && $message$jscomp$62$$ == this.$G$ || (this.$isVisible_$ = !0, this.$F$ = $targetElement$$, this.$G$ = $message$jscomp$62$$, _.$JSCompiler_StaticMethods_Vsync$$module$src$service$vsync_impl_prototype$run$$(this.$vsync_$, {measure:$measureTargetElement$$module$extensions$amp_form$0_1$validation_bubble$$, $mutate$:$showBubbleElement$$module$extensions$amp_form$0_1$validation_bubble$$}, {message:$message$jscomp$62$$, $targetElement$:$targetElement$$, 
  $bubbleElement$:this.$D$, viewport:this.$viewport_$, id:this.$I$}));
};
var $reportValiditySupported$$module$extensions$amp_form$0_1$form_validators$$, $checkValiditySupported$$module$extensions$amp_form$0_1$form_validators$$, $validationBubbleCount$$module$extensions$amp_form$0_1$form_validators$$ = 0;
$FormValidator$$module$extensions$amp_form$0_1$form_validators$$.prototype.$F$ = function() {
};
$FormValidator$$module$extensions$amp_form$0_1$form_validators$$.prototype.$I$ = function() {
};
$FormValidator$$module$extensions$amp_form$0_1$form_validators$$.prototype.$K$ = function() {
};
_.$$jscomp$inherits$$($DefaultValidator$$module$extensions$amp_form$0_1$form_validators$$, $FormValidator$$module$extensions$amp_form$0_1$form_validators$$);
$DefaultValidator$$module$extensions$amp_form$0_1$form_validators$$.prototype.$F$ = function() {
  this.form.reportValidity();
  $JSCompiler_StaticMethods_fireValidityEventIfNecessary$$(this);
};
_.$$jscomp$inherits$$($PolyfillDefaultValidator$$module$extensions$amp_form$0_1$form_validators$$, $FormValidator$$module$extensions$amp_form$0_1$form_validators$$);
$PolyfillDefaultValidator$$module$extensions$amp_form$0_1$form_validators$$.prototype.$F$ = function() {
  for (var $inputs$jscomp$1$$ = $JSCompiler_StaticMethods_FormValidator$$module$extensions$amp_form$0_1$form_validators_prototype$inputs$$(this), $i$jscomp$310$$ = 0; $i$jscomp$310$$ < $inputs$jscomp$1$$.length; $i$jscomp$310$$++) {
    if (!$inputs$jscomp$1$$[$i$jscomp$310$$].checkValidity()) {
      $inputs$jscomp$1$$[$i$jscomp$310$$].focus();
      this.$D$.show($inputs$jscomp$1$$[$i$jscomp$310$$], $inputs$jscomp$1$$[$i$jscomp$310$$].validationMessage);
      break;
    }
  }
  $JSCompiler_StaticMethods_fireValidityEventIfNecessary$$(this);
};
$PolyfillDefaultValidator$$module$extensions$amp_form$0_1$form_validators$$.prototype.$I$ = function($e$jscomp$218$$) {
  "submit" != $e$jscomp$218$$.target.type && this.$D$.$hide$();
};
$PolyfillDefaultValidator$$module$extensions$amp_form$0_1$form_validators$$.prototype.$K$ = function($event$jscomp$115_input$jscomp$54$$) {
  $event$jscomp$115_input$jscomp$54$$ = $event$jscomp$115_input$jscomp$54$$.target;
  var $JSCompiler_StaticMethods_isActiveOn$self$jscomp$inline_3232$$ = this.$D$;
  $JSCompiler_StaticMethods_isActiveOn$self$jscomp$inline_3232$$.$isVisible_$ && $event$jscomp$115_input$jscomp$54$$ == $JSCompiler_StaticMethods_isActiveOn$self$jscomp$inline_3232$$.$F$ && ($event$jscomp$115_input$jscomp$54$$.checkValidity() ? ($event$jscomp$115_input$jscomp$54$$.removeAttribute("aria-invalid"), this.$D$.$hide$()) : ($event$jscomp$115_input$jscomp$54$$.setAttribute("aria-invalid", "true"), this.$D$.show($event$jscomp$115_input$jscomp$54$$, $event$jscomp$115_input$jscomp$54$$.validationMessage)));
};
_.$$jscomp$inherits$$($AbstractCustomValidator$$module$extensions$amp_form$0_1$form_validators$$, $FormValidator$$module$extensions$amp_form$0_1$form_validators$$);
$AbstractCustomValidator$$module$extensions$amp_form$0_1$form_validators$$.prototype.$G$ = function() {
  throw Error("Not Implemented");
};
$AbstractCustomValidator$$module$extensions$amp_form$0_1$form_validators$$.prototype.$D$ = function($event$jscomp$116_input$jscomp$60$$) {
  $event$jscomp$116_input$jscomp$60$$ = $event$jscomp$116_input$jscomp$60$$.target;
  var $shouldValidate$jscomp$1$$ = !!$event$jscomp$116_input$jscomp$60$$.checkValidity && this.$G$($event$jscomp$116_input$jscomp$60$$);
  $JSCompiler_StaticMethods_hideValidationFor$$(this, $event$jscomp$116_input$jscomp$60$$);
  $shouldValidate$jscomp$1$$ && !$event$jscomp$116_input$jscomp$60$$.checkValidity() && $JSCompiler_StaticMethods_reportInput$$(this, $event$jscomp$116_input$jscomp$60$$);
};
$AbstractCustomValidator$$module$extensions$amp_form$0_1$form_validators$$.prototype.$I$ = function($event$jscomp$117$$) {
  this.$D$($event$jscomp$117$$);
};
$AbstractCustomValidator$$module$extensions$amp_form$0_1$form_validators$$.prototype.$K$ = function($event$jscomp$118$$) {
  this.$D$($event$jscomp$118$$);
};
_.$$jscomp$inherits$$($ShowFirstOnSubmitValidator$$module$extensions$amp_form$0_1$form_validators$$, $AbstractCustomValidator$$module$extensions$amp_form$0_1$form_validators$$);
$ShowFirstOnSubmitValidator$$module$extensions$amp_form$0_1$form_validators$$.prototype.$F$ = function() {
  $JSCompiler_StaticMethods_hideAllValidations$$(this);
  for (var $inputs$jscomp$3$$ = $JSCompiler_StaticMethods_FormValidator$$module$extensions$amp_form$0_1$form_validators_prototype$inputs$$(this), $i$jscomp$312$$ = 0; $i$jscomp$312$$ < $inputs$jscomp$3$$.length; $i$jscomp$312$$++) {
    if (!$inputs$jscomp$3$$[$i$jscomp$312$$].checkValidity()) {
      $JSCompiler_StaticMethods_reportInput$$(this, $inputs$jscomp$3$$[$i$jscomp$312$$]);
      $inputs$jscomp$3$$[$i$jscomp$312$$].focus();
      break;
    }
  }
  $JSCompiler_StaticMethods_fireValidityEventIfNecessary$$(this);
};
$ShowFirstOnSubmitValidator$$module$extensions$amp_form$0_1$form_validators$$.prototype.$G$ = function($input$jscomp$61$$) {
  return !!$JSCompiler_StaticMethods_getVisibleValidationFor$$($input$jscomp$61$$);
};
_.$$jscomp$inherits$$($ShowAllOnSubmitValidator$$module$extensions$amp_form$0_1$form_validators$$, $AbstractCustomValidator$$module$extensions$amp_form$0_1$form_validators$$);
$ShowAllOnSubmitValidator$$module$extensions$amp_form$0_1$form_validators$$.prototype.$F$ = function() {
  $JSCompiler_StaticMethods_hideAllValidations$$(this);
  for (var $firstInvalidInput$$ = null, $inputs$jscomp$4$$ = $JSCompiler_StaticMethods_FormValidator$$module$extensions$amp_form$0_1$form_validators_prototype$inputs$$(this), $i$jscomp$313$$ = 0; $i$jscomp$313$$ < $inputs$jscomp$4$$.length; $i$jscomp$313$$++) {
    $inputs$jscomp$4$$[$i$jscomp$313$$].checkValidity() || ($firstInvalidInput$$ = $firstInvalidInput$$ || $inputs$jscomp$4$$[$i$jscomp$313$$], $JSCompiler_StaticMethods_reportInput$$(this, $inputs$jscomp$4$$[$i$jscomp$313$$]));
  }
  $firstInvalidInput$$ && $firstInvalidInput$$.focus();
  $JSCompiler_StaticMethods_fireValidityEventIfNecessary$$(this);
};
$ShowAllOnSubmitValidator$$module$extensions$amp_form$0_1$form_validators$$.prototype.$G$ = function($input$jscomp$62$$) {
  return !!$JSCompiler_StaticMethods_getVisibleValidationFor$$($input$jscomp$62$$);
};
_.$$jscomp$inherits$$($AsYouGoValidator$$module$extensions$amp_form$0_1$form_validators$$, $AbstractCustomValidator$$module$extensions$amp_form$0_1$form_validators$$);
$AsYouGoValidator$$module$extensions$amp_form$0_1$form_validators$$.prototype.$G$ = function() {
  return !0;
};
$AsYouGoValidator$$module$extensions$amp_form$0_1$form_validators$$.prototype.$D$ = function($event$jscomp$119$$) {
  $AbstractCustomValidator$$module$extensions$amp_form$0_1$form_validators$$.prototype.$D$.call(this, $event$jscomp$119$$);
  $JSCompiler_StaticMethods_fireValidityEventIfNecessary$$(this);
};
_.$$jscomp$inherits$$($InteractAndSubmitValidator$$module$extensions$amp_form$0_1$form_validators$$, $ShowAllOnSubmitValidator$$module$extensions$amp_form$0_1$form_validators$$);
$InteractAndSubmitValidator$$module$extensions$amp_form$0_1$form_validators$$.prototype.$G$ = function() {
  return !0;
};
$InteractAndSubmitValidator$$module$extensions$amp_form$0_1$form_validators$$.prototype.$D$ = function($event$jscomp$120$$) {
  $ShowAllOnSubmitValidator$$module$extensions$amp_form$0_1$form_validators$$.prototype.$D$.call(this, $event$jscomp$120$$);
  $JSCompiler_StaticMethods_fireValidityEventIfNecessary$$(this);
};
$FormVerifier$$module$extensions$amp_form$0_1$form_verifiers$$.prototype.$G$ = function() {
  return window.Promise.resolve({$updatedElements$:[], errors:[]});
};
_.$$jscomp$inherits$$($DefaultVerifier$$module$extensions$amp_form$0_1$form_verifiers$$, $FormVerifier$$module$extensions$amp_form$0_1$form_verifiers$$);
_.$$jscomp$inherits$$($AsyncVerifier$$module$extensions$amp_form$0_1$form_verifiers$$, $FormVerifier$$module$extensions$amp_form$0_1$form_verifiers$$);
$AsyncVerifier$$module$extensions$amp_form$0_1$form_verifiers$$.prototype.$G$ = function() {
  var $$jscomp$this$jscomp$602$$ = this, $xhrConsumeErrors$$ = this.$J$().then(function() {
    return [];
  }, function($$jscomp$this$jscomp$602$$) {
    return $getResponseErrorData_$$module$extensions$amp_form$0_1$form_verifiers$$($$jscomp$this$jscomp$602$$);
  });
  return $JSCompiler_StaticMethods_addToResolver_$$(this, $xhrConsumeErrors$$).then(function($xhrConsumeErrors$$) {
    return $JSCompiler_StaticMethods_applyErrors_$$($$jscomp$this$jscomp$602$$, $xhrConsumeErrors$$);
  });
};
var $EXTERNAL_DEPS$$module$extensions$amp_form$0_1$amp_form$$ = ["amp-selector"];
$AmpForm$$module$extensions$amp_form$0_1$amp_form$$.prototype.$aa$ = function($url$jscomp$185$$) {
  this.$I$ = $url$jscomp$185$$;
};
$AmpForm$$module$extensions$amp_form$0_1$amp_form$$.prototype.$W$ = function($invocation$jscomp$34$$) {
  var $$jscomp$this$jscomp$606$$ = this;
  if ("submit" == $invocation$jscomp$34$$.method) {
    return $JSCompiler_StaticMethods_whenDependenciesReady_$$(this).then(function() {
      return "submitting" != $$jscomp$this$jscomp$606$$.$state_$ && $JSCompiler_StaticMethods_checkValidity_$$($$jscomp$this$jscomp$606$$) ? $JSCompiler_StaticMethods_submit_$$($$jscomp$this$jscomp$606$$, $invocation$jscomp$34$$.$D$, null) : window.Promise.resolve(null);
    });
  }
  "clear" === $invocation$jscomp$34$$.method && $JSCompiler_StaticMethods_handleClearAction_$$(this);
  return null;
};
$AmpForm$$module$extensions$amp_form$0_1$amp_form$$.prototype.$Y$ = function($event$jscomp$121$$) {
  if ("submitting" == this.$state_$ || !$JSCompiler_StaticMethods_checkValidity_$$(this)) {
    return $event$jscomp$121$$.stopImmediatePropagation(), $event$jscomp$121$$.preventDefault(), window.Promise.resolve(null);
  }
  (this.$I$ || "POST" == this.$G$) && $event$jscomp$121$$.preventDefault();
  return $JSCompiler_StaticMethods_submit_$$(this, 100, $event$jscomp$121$$);
};
var $AMP$jscomp$inline_3290$$ = window.self.AMP;
$AMP$jscomp$inline_3290$$.registerServiceForDoc("form-submit-service", $FormSubmitService$$module$extensions$amp_form$0_1$form_submit_service$$);
$AMP$jscomp$inline_3290$$.registerServiceForDoc("amp-form", function($ampdoc$jscomp$169$$) {
  $JSCompiler_StaticMethods_installStyles_$$($ampdoc$jscomp$169$$).then(function() {
    return $JSCompiler_StaticMethods_installHandlers_$$($ampdoc$jscomp$169$$);
  });
});

})});
