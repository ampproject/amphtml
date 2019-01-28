(self.AMP=self.AMP||[]).push({n:"amp-selector",i:["_base_i","_base_misc"],v:"1901181729101",f:(function(AMP,_){
var $areEqualOrdered$$module$src$utils$array$$ = function($arr1$$, $arr2$$) {
  if ($arr1$$.length !== $arr2$$.length) {
    return !1;
  }
  for (var $i$jscomp$52$$ = 0; $i$jscomp$52$$ < $arr1$$.length; $i$jscomp$52$$++) {
    if ($arr1$$[$i$jscomp$52$$] !== $arr2$$[$i$jscomp$52$$]) {
      return !1;
    }
  }
  return !0;
}, $AmpSelector$$module$extensions$amp_selector$0_1$amp_selector$$ = function($$jscomp$super$this$jscomp$88_element$jscomp$527$$) {
  $$jscomp$super$this$jscomp$88_element$jscomp$527$$ = window.AMP.BaseElement.call(this, $$jscomp$super$this$jscomp$88_element$jscomp$527$$) || this;
  $$jscomp$super$this$jscomp$88_element$jscomp$527$$.$isMultiple_$ = !1;
  $$jscomp$super$this$jscomp$88_element$jscomp$527$$.$selectedElements_$ = [];
  $$jscomp$super$this$jscomp$88_element$jscomp$527$$.$elements_$ = [];
  $$jscomp$super$this$jscomp$88_element$jscomp$527$$.$inputs_$ = [];
  $$jscomp$super$this$jscomp$88_element$jscomp$527$$.$action_$ = null;
  $$jscomp$super$this$jscomp$88_element$jscomp$527$$.$focusedIndex_$ = 0;
  $$jscomp$super$this$jscomp$88_element$jscomp$527$$.$kbSelectMode_$ = "none";
  return $$jscomp$super$this$jscomp$88_element$jscomp$527$$;
}, $JSCompiler_StaticMethods_selectedAttributeMutated_$$ = function($JSCompiler_StaticMethods_selectedAttributeMutated_$self$$, $current$jscomp$8_i$285_newValue$jscomp$28$$) {
  var $isSelected_selected$jscomp$2$$ = Array.isArray($current$jscomp$8_i$285_newValue$jscomp$28$$) ? $current$jscomp$8_i$285_newValue$jscomp$28$$ : [$current$jscomp$8_i$285_newValue$jscomp$28$$];
  if (null === $current$jscomp$8_i$285_newValue$jscomp$28$$ || 0 == $isSelected_selected$jscomp$2$$.length) {
    $JSCompiler_StaticMethods_selectedAttributeMutated_$self$$.$clearAllSelections_$();
  } else {
    if ($JSCompiler_StaticMethods_selectedAttributeMutated_$self$$.$isMultiple_$ || ($isSelected_selected$jscomp$2$$ = $isSelected_selected$jscomp$2$$.slice(0, 1)), $current$jscomp$8_i$285_newValue$jscomp$28$$ = $JSCompiler_StaticMethods_selectedOptions_$$($JSCompiler_StaticMethods_selectedAttributeMutated_$self$$), !$areEqualOrdered$$module$src$utils$array$$($current$jscomp$8_i$285_newValue$jscomp$28$$.sort(), $isSelected_selected$jscomp$2$$.sort())) {
      $isSelected_selected$jscomp$2$$ = $isSelected_selected$jscomp$2$$.reduce(function($JSCompiler_StaticMethods_selectedAttributeMutated_$self$$, $current$jscomp$8_i$285_newValue$jscomp$28$$) {
        $JSCompiler_StaticMethods_selectedAttributeMutated_$self$$[$current$jscomp$8_i$285_newValue$jscomp$28$$] = !0;
        return $JSCompiler_StaticMethods_selectedAttributeMutated_$self$$;
      }, Object.create(null));
      for ($current$jscomp$8_i$285_newValue$jscomp$28$$ = 0; $current$jscomp$8_i$285_newValue$jscomp$28$$ < $JSCompiler_StaticMethods_selectedAttributeMutated_$self$$.$elements_$.length; $current$jscomp$8_i$285_newValue$jscomp$28$$++) {
        var $element$jscomp$528$$ = $JSCompiler_StaticMethods_selectedAttributeMutated_$self$$.$elements_$[$current$jscomp$8_i$285_newValue$jscomp$28$$], $option$jscomp$14$$ = $element$jscomp$528$$.getAttribute("option");
        $isSelected_selected$jscomp$2$$[$option$jscomp$14$$] ? $JSCompiler_StaticMethods_setSelection_$$($JSCompiler_StaticMethods_selectedAttributeMutated_$self$$, $element$jscomp$528$$) : $JSCompiler_StaticMethods_clearSelection_$$($JSCompiler_StaticMethods_selectedAttributeMutated_$self$$, $element$jscomp$528$$);
      }
      $JSCompiler_StaticMethods_updateFocus_$$($JSCompiler_StaticMethods_selectedAttributeMutated_$self$$);
      $JSCompiler_StaticMethods_setInputs_$$($JSCompiler_StaticMethods_selectedAttributeMutated_$self$$);
    }
  }
}, $JSCompiler_StaticMethods_updateFocus_$$ = function($JSCompiler_StaticMethods_updateFocus_$self$$, $focusElement_opt_focusEl$$) {
  "none" != $JSCompiler_StaticMethods_updateFocus_$self$$.$kbSelectMode_$ && ($JSCompiler_StaticMethods_updateFocus_$self$$.$elements_$.forEach(function($JSCompiler_StaticMethods_updateFocus_$self$$) {
    $JSCompiler_StaticMethods_updateFocus_$self$$.tabIndex = -1;
  }), $focusElement_opt_focusEl$$ || ($focusElement_opt_focusEl$$ = $JSCompiler_StaticMethods_updateFocus_$self$$.$isMultiple_$ ? $JSCompiler_StaticMethods_updateFocus_$self$$.$elements_$[0] : $JSCompiler_StaticMethods_updateFocus_$self$$.$selectedElements_$[0] || $JSCompiler_StaticMethods_updateFocus_$self$$.$elements_$[0]), $focusElement_opt_focusEl$$ && ($JSCompiler_StaticMethods_updateFocus_$self$$.$focusedIndex_$ = $JSCompiler_StaticMethods_updateFocus_$self$$.$elements_$.indexOf($focusElement_opt_focusEl$$), 
  $focusElement_opt_focusEl$$.tabIndex = 0));
}, $JSCompiler_StaticMethods_AmpSelector$$module$extensions$amp_selector$0_1$amp_selector_prototype$init_$$ = function($JSCompiler_StaticMethods_AmpSelector$$module$extensions$amp_selector$0_1$amp_selector_prototype$init_$self$$, $elements$jscomp$37_opt_elements$$) {
  $JSCompiler_StaticMethods_AmpSelector$$module$extensions$amp_selector$0_1$amp_selector_prototype$init_$self$$.$selectedElements_$.length = 0;
  $elements$jscomp$37_opt_elements$$ = $elements$jscomp$37_opt_elements$$ ? $elements$jscomp$37_opt_elements$$ : _.$toArray$$module$src$types$$($JSCompiler_StaticMethods_AmpSelector$$module$extensions$amp_selector$0_1$amp_selector_prototype$init_$self$$.element.querySelectorAll("[option]"));
  $elements$jscomp$37_opt_elements$$.forEach(function($elements$jscomp$37_opt_elements$$) {
    $elements$jscomp$37_opt_elements$$.hasAttribute("role") || $elements$jscomp$37_opt_elements$$.setAttribute("role", "option");
    $elements$jscomp$37_opt_elements$$.hasAttribute("disabled") && $elements$jscomp$37_opt_elements$$.setAttribute("aria-disabled", "true");
    $elements$jscomp$37_opt_elements$$.hasAttribute("selected") ? $JSCompiler_StaticMethods_setSelection_$$($JSCompiler_StaticMethods_AmpSelector$$module$extensions$amp_selector$0_1$amp_selector_prototype$init_$self$$, $elements$jscomp$37_opt_elements$$) : $JSCompiler_StaticMethods_clearSelection_$$($JSCompiler_StaticMethods_AmpSelector$$module$extensions$amp_selector$0_1$amp_selector_prototype$init_$self$$, $elements$jscomp$37_opt_elements$$);
    $elements$jscomp$37_opt_elements$$.tabIndex = 0;
  });
  $JSCompiler_StaticMethods_AmpSelector$$module$extensions$amp_selector$0_1$amp_selector_prototype$init_$self$$.$elements_$ = $elements$jscomp$37_opt_elements$$;
  $JSCompiler_StaticMethods_updateFocus_$$($JSCompiler_StaticMethods_AmpSelector$$module$extensions$amp_selector$0_1$amp_selector_prototype$init_$self$$);
  $JSCompiler_StaticMethods_setInputs_$$($JSCompiler_StaticMethods_AmpSelector$$module$extensions$amp_selector$0_1$amp_selector_prototype$init_$self$$);
}, $JSCompiler_StaticMethods_setInputs_$$ = function($JSCompiler_StaticMethods_setInputs_$self$$) {
  var $selectedValues$$ = [], $elementName$jscomp$8$$ = $JSCompiler_StaticMethods_setInputs_$self$$.element.getAttribute("name");
  if ($elementName$jscomp$8$$ && !$JSCompiler_StaticMethods_setInputs_$self$$.element.hasAttribute("disabled")) {
    var $formId$$ = $JSCompiler_StaticMethods_setInputs_$self$$.element.getAttribute("form");
    $JSCompiler_StaticMethods_setInputs_$self$$.$inputs_$.forEach(function($selectedValues$$) {
      $JSCompiler_StaticMethods_setInputs_$self$$.element.removeChild($selectedValues$$);
    });
    $JSCompiler_StaticMethods_setInputs_$self$$.$inputs_$ = [];
    var $doc$jscomp$112$$ = $JSCompiler_StaticMethods_setInputs_$self$$.$win$.document, $fragment$jscomp$10$$ = $doc$jscomp$112$$.createDocumentFragment();
    $JSCompiler_StaticMethods_setInputs_$self$$.$selectedElements_$.forEach(function($option$jscomp$16_value$jscomp$285$$) {
      if (!$option$jscomp$16_value$jscomp$285$$.hasAttribute("disabled")) {
        var $hidden$jscomp$2$$ = $doc$jscomp$112$$.createElement("input");
        $option$jscomp$16_value$jscomp$285$$ = $option$jscomp$16_value$jscomp$285$$.getAttribute("option");
        $hidden$jscomp$2$$.setAttribute("type", "hidden");
        $hidden$jscomp$2$$.setAttribute("name", $elementName$jscomp$8$$);
        $hidden$jscomp$2$$.setAttribute("value", $option$jscomp$16_value$jscomp$285$$);
        $formId$$ && $hidden$jscomp$2$$.setAttribute("form", $formId$$);
        $JSCompiler_StaticMethods_setInputs_$self$$.$inputs_$.push($hidden$jscomp$2$$);
        $fragment$jscomp$10$$.appendChild($hidden$jscomp$2$$);
        $selectedValues$$.push($option$jscomp$16_value$jscomp$285$$);
      }
    });
    $JSCompiler_StaticMethods_setInputs_$self$$.element.appendChild($fragment$jscomp$10$$);
  }
}, $JSCompiler_StaticMethods_onOptionPicked_$$ = function($JSCompiler_StaticMethods_onOptionPicked_$self$$, $el$jscomp$82$$) {
  $el$jscomp$82$$.hasAttribute("disabled") || $JSCompiler_StaticMethods_onOptionPicked_$self$$.$mutateElement$(function() {
    $el$jscomp$82$$.hasAttribute("selected") ? $JSCompiler_StaticMethods_onOptionPicked_$self$$.$isMultiple_$ && ($JSCompiler_StaticMethods_clearSelection_$$($JSCompiler_StaticMethods_onOptionPicked_$self$$, $el$jscomp$82$$), $JSCompiler_StaticMethods_setInputs_$$($JSCompiler_StaticMethods_onOptionPicked_$self$$)) : ($JSCompiler_StaticMethods_setSelection_$$($JSCompiler_StaticMethods_onOptionPicked_$self$$, $el$jscomp$82$$), $JSCompiler_StaticMethods_setInputs_$$($JSCompiler_StaticMethods_onOptionPicked_$self$$));
    $JSCompiler_StaticMethods_updateFocus_$$($JSCompiler_StaticMethods_onOptionPicked_$self$$, $el$jscomp$82$$);
    $JSCompiler_StaticMethods_fireSelectEvent_$$($JSCompiler_StaticMethods_onOptionPicked_$self$$, $el$jscomp$82$$);
  });
}, $JSCompiler_StaticMethods_selectedOptions_$$ = function($JSCompiler_StaticMethods_selectedOptions_$self$$) {
  return $JSCompiler_StaticMethods_selectedOptions_$self$$.$selectedElements_$.map(function($JSCompiler_StaticMethods_selectedOptions_$self$$) {
    return $JSCompiler_StaticMethods_selectedOptions_$self$$.getAttribute("option");
  });
}, $JSCompiler_StaticMethods_fireSelectEvent_$$ = function($JSCompiler_StaticMethods_fireSelectEvent_$self$$, $el$jscomp$86_selectEvent$$) {
  $el$jscomp$86_selectEvent$$ = _.$createCustomEvent$$module$src$event_helper$$($JSCompiler_StaticMethods_fireSelectEvent_$self$$.$win$, "amp-selector.select", _.$dict$$module$src$utils$object$$({targetOption:$el$jscomp$86_selectEvent$$.getAttribute("option"), selectedOptions:$JSCompiler_StaticMethods_selectedOptions_$$($JSCompiler_StaticMethods_fireSelectEvent_$self$$)}));
  $JSCompiler_StaticMethods_fireSelectEvent_$self$$.$action_$.$trigger$($JSCompiler_StaticMethods_fireSelectEvent_$self$$.element, "select", $el$jscomp$86_selectEvent$$, 100);
}, $JSCompiler_StaticMethods_select_$$ = function($JSCompiler_StaticMethods_select_$self$$, $delta$jscomp$6$$) {
  var $previousIndex$$ = $JSCompiler_StaticMethods_select_$self$$.$elements_$.indexOf($JSCompiler_StaticMethods_select_$self$$.$selectedElements_$[0]);
  $JSCompiler_StaticMethods_setSelection_$$($JSCompiler_StaticMethods_select_$self$$, $JSCompiler_StaticMethods_select_$self$$.$elements_$[_.$mod$$module$src$utils$math$$($previousIndex$$ + $delta$jscomp$6$$, $JSCompiler_StaticMethods_select_$self$$.$elements_$.length)]);
  $JSCompiler_StaticMethods_clearSelection_$$($JSCompiler_StaticMethods_select_$self$$, $JSCompiler_StaticMethods_select_$self$$.$elements_$[$previousIndex$$]);
}, $JSCompiler_StaticMethods_clearSelection_$$ = function($JSCompiler_StaticMethods_clearSelection_$self$$, $element$jscomp$529_selIndex$$) {
  $element$jscomp$529_selIndex$$.removeAttribute("selected");
  $element$jscomp$529_selIndex$$.setAttribute("aria-selected", "false");
  $element$jscomp$529_selIndex$$ = $JSCompiler_StaticMethods_clearSelection_$self$$.$selectedElements_$.indexOf($element$jscomp$529_selIndex$$);
  -1 !== $element$jscomp$529_selIndex$$ && $JSCompiler_StaticMethods_clearSelection_$self$$.$selectedElements_$.splice($element$jscomp$529_selIndex$$, 1);
}, $JSCompiler_StaticMethods_setSelection_$$ = function($JSCompiler_StaticMethods_setSelection_$self$$, $element$jscomp$530$$) {
  $JSCompiler_StaticMethods_setSelection_$self$$.$selectedElements_$.includes($element$jscomp$530$$) || ($JSCompiler_StaticMethods_setSelection_$self$$.$isMultiple_$ || $JSCompiler_StaticMethods_setSelection_$self$$.$clearAllSelections_$(), $element$jscomp$530$$.setAttribute("selected", ""), $element$jscomp$530$$.setAttribute("aria-selected", "true"), $JSCompiler_StaticMethods_setSelection_$self$$.$selectedElements_$.push($element$jscomp$530$$));
};
var $KEYBOARD_SELECT_MODES$$module$extensions$amp_selector$0_1$amp_selector$$ = {NONE:"none", $FOCUS$:"focus", $SELECT$:"select"};
_.$$jscomp$inherits$$($AmpSelector$$module$extensions$amp_selector$0_1$amp_selector$$, window.AMP.BaseElement);
_.$JSCompiler_prototypeAlias$$ = $AmpSelector$$module$extensions$amp_selector$0_1$amp_selector$$.prototype;
_.$JSCompiler_prototypeAlias$$.$isLayoutSupported$ = function() {
  return !0;
};
_.$JSCompiler_prototypeAlias$$.$buildCallback$ = function() {
  var $$jscomp$this$jscomp$812$$ = this;
  this.$action_$ = _.$Services$$module$src$services$actionServiceForDoc$$(this.element);
  this.$isMultiple_$ = this.element.hasAttribute("multiple");
  this.element.hasAttribute("role") || this.element.setAttribute("role", "listbox");
  this.$isMultiple_$ && this.element.setAttribute("aria-multiselectable", "true");
  this.element.hasAttribute("disabled") && this.element.setAttribute("aria-disabled", "true");
  var $kbSelectMode$$ = this.element.getAttribute("keyboard-select-mode");
  $kbSelectMode$$ ? ($kbSelectMode$$ = $kbSelectMode$$.toLowerCase(), _.$JSCompiler_StaticMethods_assertEnumValue$$(_.$user$$module$src$log$$(), $KEYBOARD_SELECT_MODES$$module$extensions$amp_selector$0_1$amp_selector$$, $kbSelectMode$$)) : $kbSelectMode$$ = "none";
  this.$kbSelectMode_$ = $kbSelectMode$$;
  _.$JSCompiler_StaticMethods_registerAction$$(this, "clear", this.$clearAllSelections_$.bind(this));
  $JSCompiler_StaticMethods_AmpSelector$$module$extensions$amp_selector$0_1$amp_selector_prototype$init_$$(this);
  this.element.addEventListener("click", this.$AmpSelector$$module$extensions$amp_selector$0_1$amp_selector_prototype$clickHandler_$.bind(this));
  this.element.addEventListener("keydown", this.$AmpSelector$$module$extensions$amp_selector$0_1$amp_selector_prototype$keyDownHandler_$.bind(this));
  _.$JSCompiler_StaticMethods_registerAction$$(this, "selectUp", function($kbSelectMode$$) {
    $kbSelectMode$$ = $kbSelectMode$$.args;
    $JSCompiler_StaticMethods_select_$$($$jscomp$this$jscomp$812$$, $kbSelectMode$$ && void 0 !== $kbSelectMode$$.delta ? -$kbSelectMode$$.delta : -1);
  }, 1);
  _.$JSCompiler_StaticMethods_registerAction$$(this, "selectDown", function($kbSelectMode$$) {
    $kbSelectMode$$ = $kbSelectMode$$.args;
    $JSCompiler_StaticMethods_select_$$($$jscomp$this$jscomp$812$$, $kbSelectMode$$ && void 0 !== $kbSelectMode$$.delta ? $kbSelectMode$$.delta : 1);
  }, 1);
  _.$JSCompiler_StaticMethods_registerAction$$(this, "toggle", function($kbSelectMode$$) {
    var $index$jscomp$inline_3956_invocation$jscomp$48$$ = $kbSelectMode$$.args;
    if ($index$jscomp$inline_3956_invocation$jscomp$48$$ && void 0 !== $index$jscomp$inline_3956_invocation$jscomp$48$$.index) {
      $kbSelectMode$$ = $index$jscomp$inline_3956_invocation$jscomp$48$$.index;
      $index$jscomp$inline_3956_invocation$jscomp$48$$ = $index$jscomp$inline_3956_invocation$jscomp$48$$.value;
      var $el$jscomp$inline_3958$$ = $$jscomp$this$jscomp$812$$.$elements_$[$kbSelectMode$$], $indexCurrentStatus$jscomp$inline_3959$$ = $el$jscomp$inline_3958$$.hasAttribute("selected"), $selectedIndex$jscomp$inline_3960$$ = $$jscomp$this$jscomp$812$$.$elements_$.indexOf($$jscomp$this$jscomp$812$$.$selectedElements_$[0]);
      (void 0 !== $index$jscomp$inline_3956_invocation$jscomp$48$$ ? $index$jscomp$inline_3956_invocation$jscomp$48$$ : !$indexCurrentStatus$jscomp$inline_3959$$) !== $indexCurrentStatus$jscomp$inline_3959$$ && ($selectedIndex$jscomp$inline_3960$$ !== $kbSelectMode$$ ? ($JSCompiler_StaticMethods_setSelection_$$($$jscomp$this$jscomp$812$$, $el$jscomp$inline_3958$$), $JSCompiler_StaticMethods_clearSelection_$$($$jscomp$this$jscomp$812$$, $$jscomp$this$jscomp$812$$.$elements_$[$selectedIndex$jscomp$inline_3960$$])) : 
      $JSCompiler_StaticMethods_clearSelection_$$($$jscomp$this$jscomp$812$$, $el$jscomp$inline_3958$$), $JSCompiler_StaticMethods_fireSelectEvent_$$($$jscomp$this$jscomp$812$$, $el$jscomp$inline_3958$$));
    }
  }, 1);
  this.element.addEventListener("amp:dom-update", this.$maybeRefreshOnUpdate_$.bind(this));
};
_.$JSCompiler_prototypeAlias$$.$mutatedAttributesCallback$ = function($disabled_mutations$jscomp$17$$) {
  var $selected$jscomp$1$$ = $disabled_mutations$jscomp$17$$.selected;
  void 0 !== $selected$jscomp$1$$ && $JSCompiler_StaticMethods_selectedAttributeMutated_$$(this, $selected$jscomp$1$$);
  $disabled_mutations$jscomp$17$$ = $disabled_mutations$jscomp$17$$.disabled;
  void 0 !== $disabled_mutations$jscomp$17$$ && ($disabled_mutations$jscomp$17$$ ? this.element.setAttribute("aria-disabled", "true") : this.element.removeAttribute("aria-disabled"));
};
_.$JSCompiler_prototypeAlias$$.$maybeRefreshOnUpdate_$ = function() {
  var $newElements$$ = _.$toArray$$module$src$types$$(this.element.querySelectorAll("[option]"));
  $areEqualOrdered$$module$src$utils$array$$(this.$elements_$, $newElements$$) || $JSCompiler_StaticMethods_AmpSelector$$module$extensions$amp_selector$0_1$amp_selector_prototype$init_$$(this, $newElements$$);
};
_.$JSCompiler_prototypeAlias$$.$AmpSelector$$module$extensions$amp_selector$0_1$amp_selector_prototype$clickHandler_$ = function($el$jscomp$84_event$jscomp$178$$) {
  !this.element.hasAttribute("disabled") && ($el$jscomp$84_event$jscomp$178$$ = $el$jscomp$84_event$jscomp$178$$.target) && ($el$jscomp$84_event$jscomp$178$$.hasAttribute("option") || ($el$jscomp$84_event$jscomp$178$$ = _.$closestBySelector$$module$src$dom$$($el$jscomp$84_event$jscomp$178$$, "[option]")), $el$jscomp$84_event$jscomp$178$$ && $JSCompiler_StaticMethods_onOptionPicked_$$(this, $el$jscomp$84_event$jscomp$178$$));
};
_.$JSCompiler_prototypeAlias$$.$AmpSelector$$module$extensions$amp_selector$0_1$amp_selector_prototype$keyDownHandler_$ = function($event$jscomp$179_focusedOption$jscomp$inline_3967_newSelectedOption$jscomp$inline_3966$$) {
  if (!this.element.hasAttribute("disabled")) {
    switch($event$jscomp$179_focusedOption$jscomp$inline_3967_newSelectedOption$jscomp$inline_3966$$.key) {
      case "ArrowLeft":
      case "ArrowUp":
      case "ArrowRight":
      case "ArrowDown":
        if ("none" != this.$kbSelectMode_$) {
          a: {
            var $dir$jscomp$inline_3965_doc$jscomp$inline_3964_key$jscomp$inline_3971$$ = this.$win$.document;
            switch($event$jscomp$179_focusedOption$jscomp$inline_3967_newSelectedOption$jscomp$inline_3966$$.key) {
              case "ArrowLeft":
                $dir$jscomp$inline_3965_doc$jscomp$inline_3964_key$jscomp$inline_3971$$ = _.$isRTL$$module$src$dom$$($dir$jscomp$inline_3965_doc$jscomp$inline_3964_key$jscomp$inline_3971$$) ? 1 : -1;
                break;
              case "ArrowUp":
                $dir$jscomp$inline_3965_doc$jscomp$inline_3964_key$jscomp$inline_3971$$ = -1;
                break;
              case "ArrowRight":
                $dir$jscomp$inline_3965_doc$jscomp$inline_3964_key$jscomp$inline_3971$$ = _.$isRTL$$module$src$dom$$($dir$jscomp$inline_3965_doc$jscomp$inline_3964_key$jscomp$inline_3971$$) ? -1 : 1;
                break;
              case "ArrowDown":
                $dir$jscomp$inline_3965_doc$jscomp$inline_3964_key$jscomp$inline_3971$$ = 1;
                break;
              default:
                break a;
            }
            $event$jscomp$179_focusedOption$jscomp$inline_3967_newSelectedOption$jscomp$inline_3966$$.preventDefault();
            this.$elements_$[this.$focusedIndex_$].tabIndex = -1;
            this.$focusedIndex_$ = (this.$focusedIndex_$ + $dir$jscomp$inline_3965_doc$jscomp$inline_3964_key$jscomp$inline_3971$$) % this.$elements_$.length;
            0 > this.$focusedIndex_$ && (this.$focusedIndex_$ += this.$elements_$.length);
            $event$jscomp$179_focusedOption$jscomp$inline_3967_newSelectedOption$jscomp$inline_3966$$ = this.$elements_$[this.$focusedIndex_$];
            $event$jscomp$179_focusedOption$jscomp$inline_3967_newSelectedOption$jscomp$inline_3966$$.tabIndex = 0;
            _.$tryFocus$$module$src$dom$$($event$jscomp$179_focusedOption$jscomp$inline_3967_newSelectedOption$jscomp$inline_3966$$);
            $event$jscomp$179_focusedOption$jscomp$inline_3967_newSelectedOption$jscomp$inline_3966$$ = this.$elements_$[this.$focusedIndex_$];
            "select" == this.$kbSelectMode_$ && $JSCompiler_StaticMethods_onOptionPicked_$$(this, $event$jscomp$179_focusedOption$jscomp$inline_3967_newSelectedOption$jscomp$inline_3966$$);
          }
        }
        break;
      case "Enter":
      case " ":
        $dir$jscomp$inline_3965_doc$jscomp$inline_3964_key$jscomp$inline_3971$$ = $event$jscomp$179_focusedOption$jscomp$inline_3967_newSelectedOption$jscomp$inline_3966$$.key, " " != $dir$jscomp$inline_3965_doc$jscomp$inline_3964_key$jscomp$inline_3971$$ && "Enter" != $dir$jscomp$inline_3965_doc$jscomp$inline_3964_key$jscomp$inline_3971$$ || !this.$elements_$.includes($event$jscomp$179_focusedOption$jscomp$inline_3967_newSelectedOption$jscomp$inline_3966$$.target) || ($event$jscomp$179_focusedOption$jscomp$inline_3967_newSelectedOption$jscomp$inline_3966$$.preventDefault(), 
        $JSCompiler_StaticMethods_onOptionPicked_$$(this, $event$jscomp$179_focusedOption$jscomp$inline_3967_newSelectedOption$jscomp$inline_3966$$.target));
    }
  }
};
_.$JSCompiler_prototypeAlias$$.$clearAllSelections_$ = function() {
  for (; 0 < this.$selectedElements_$.length;) {
    var $el$jscomp$88$$ = this.$selectedElements_$.pop();
    $JSCompiler_StaticMethods_clearSelection_$$(this, $el$jscomp$88$$);
  }
  $JSCompiler_StaticMethods_setInputs_$$(this);
};
window.self.AMP.registerElement("amp-selector", $AmpSelector$$module$extensions$amp_selector$0_1$amp_selector$$, "amp-selector [option]{cursor:pointer}amp-selector [option][selected]{cursor:auto;outline:1px solid rgba(0,0,0,0.7)}amp-selector [disabled][option],amp-selector[disabled] [option],amp-selector[disabled] [selected],amp-selector [selected][disabled]{cursor:auto;outline:none}\n/*# sourceURL=/extensions/amp-selector/0.1/amp-selector.css*/");

})});
