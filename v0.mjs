self.AMP_CONFIG||(self.AMP_CONFIG={"test":true,"localDev":true,"allow-doc-opt-in":["amp-next-page","inabox-viewport-friendly","analytics-chunks"],"allow-url-opt-in":["pump-early-frame"],"canary":0,"a4aProfilingRate":0.01,"adsense-ad-size-optimization":0.01,"amp-access-iframe":1,"amp-action-macro":1,"amp-accordion-display-locking":0.01,"amp-ad-ff-adx-ady":0.01,"amp-auto-ads-adsense-holdout":0.1,"amp-consent-restrict-fullscreen":1,"amp-list-init-from-state":1,"amp-mega-menu":1,"amp-nested-menu":1,"amp-playbuzz":1,"amp-sidebar-swipe-to-dismiss":1,"amp-story-responsive-units":1,"amp-story-v1":1,"ampdoc-closest":1,"as-use-attr-for-format":0.01,"blurry-placeholder":1,"chunked-amp":1,"doubleclickSraExp":0.01,"doubleclickSraReportExcludedBlock":0.1,"fix-inconsistent-responsive-height-selection":0,"fixed-elements-in-lightbox":1,"flexAdSlots":0.05,"hidden-mutation-observer":1,"ios-fixed-no-transfer":0,"layoutbox-invalidate-on-scroll":1,"pump-early-frame":1,"random-subdomain-for-safeframe":0.02,"swg-gpay-api":1,"swg-gpay-native":1,"version-locking":1});/*AMP_CONFIG*/var global = self;

self.AMP = self.AMP || [];

try {
    (function(_) {
        function $tryDecodeUriComponent_$$module$src$url_try_decode_uri_component$$($component$jscomp$4$$, $fallback$$ = "") {
            try {
                return decodeURIComponent($component$jscomp$4$$);
            } catch ($e$jscomp$7$$) {
                return $fallback$$;
            }
        }
        let $regex$$module$src$url_parse_query_string$$ = /(?:^[#?]?|&)([^=&]+)(?:=([^&]*))?/g;
        function $parseQueryString_$$module$src$url_parse_query_string$$($queryString$$) {
            let $params$jscomp$1$$ = Object.create(null);
            if (!$queryString$$) return $params$jscomp$1$$;
            let $match$$;
            for (;$match$$ = $regex$$module$src$url_parse_query_string$$.exec($queryString$$); ) {
                let $queryString$$ = $tryDecodeUriComponent_$$module$src$url_try_decode_uri_component$$($match$$[1], $match$$[1]), $value$jscomp$88$$ = $match$$[2] ? $tryDecodeUriComponent_$$module$src$url_try_decode_uri_component$$($match$$[2].replace(/\+/g, " "), $match$$[2]) : "";
                $params$jscomp$1$$[$queryString$$] = $value$jscomp$88$$;
            }
            return $params$jscomp$1$$;
        }
        let $rtvVersion$$module$src$mode$$ = "";
        function $getMode$$module$src$mode$$($opt_win$$) {
            let $win$$ = $opt_win$$ || self;
            if ($win$$.__AMP_MODE) var $JSCompiler_inline_result$jscomp$1_JSCompiler_runningTests$jscomp$inline_34_JSCompiler_temp$jscomp$0$$ = $win$$.__AMP_MODE; else {
                {
                    var $JSCompiler_AMP_CONFIG$jscomp$inline_33_JSCompiler_singlePassType$jscomp$inline_37$$ = self.AMP_CONFIG || {};
                    $JSCompiler_inline_result$jscomp$1_JSCompiler_runningTests$jscomp$inline_34_JSCompiler_temp$jscomp$0$$ = !!($JSCompiler_AMP_CONFIG$jscomp$inline_33_JSCompiler_singlePassType$jscomp$inline_37$$.test || $win$$.__AMP_TEST || $win$$.__karma__);
                    let $opt_win$$ = !!$JSCompiler_AMP_CONFIG$jscomp$inline_33_JSCompiler_singlePassType$jscomp$inline_37$$.localDev || $JSCompiler_inline_result$jscomp$1_JSCompiler_runningTests$jscomp$inline_34_JSCompiler_temp$jscomp$0$$, $JSCompiler_hashQuery$jscomp$inline_36$$ = $parseQueryString_$$module$src$url_parse_query_string$$($win$$.location.originalHash || $win$$.location.hash);
                    $JSCompiler_AMP_CONFIG$jscomp$inline_33_JSCompiler_singlePassType$jscomp$inline_37$$ = $JSCompiler_AMP_CONFIG$jscomp$inline_33_JSCompiler_singlePassType$jscomp$inline_37$$.spt;
                    let $JSCompiler_searchQuery$jscomp$inline_38$$ = $parseQueryString_$$module$src$url_parse_query_string$$($win$$.location.search);
                    $rtvVersion$$module$src$mode$$ || ($rtvVersion$$module$src$mode$$ = $opt_win$$ ? "2005062057000" : $win$$.AMP_CONFIG && $win$$.AMP_CONFIG.v ? $win$$.AMP_CONFIG.v : "012005062057000");
                    $JSCompiler_inline_result$jscomp$1_JSCompiler_runningTests$jscomp$inline_34_JSCompiler_temp$jscomp$0$$ = {
                        localDev: $opt_win$$,
                        development: !!(0 <= [ "1", "actions", "amp", "amp4ads", "amp4email" ].indexOf($JSCompiler_hashQuery$jscomp$inline_36$$.development) || $win$$.AMP_DEV_MODE),
                        examiner: "2" == $JSCompiler_hashQuery$jscomp$inline_36$$.development,
                        esm: !0,
                        geoOverride: $JSCompiler_hashQuery$jscomp$inline_36$$["amp-geo"],
                        minified: !0,
                        lite: void 0 != $JSCompiler_searchQuery$jscomp$inline_38$$.amp_lite,
                        test: $JSCompiler_inline_result$jscomp$1_JSCompiler_runningTests$jscomp$inline_34_JSCompiler_temp$jscomp$0$$,
                        log: $JSCompiler_hashQuery$jscomp$inline_36$$.log,
                        version: "2005062057000",
                        rtvVersion: $rtvVersion$$module$src$mode$$,
                        singlePassType: $JSCompiler_AMP_CONFIG$jscomp$inline_33_JSCompiler_singlePassType$jscomp$inline_37$$
                    };
                }
                $JSCompiler_inline_result$jscomp$1_JSCompiler_runningTests$jscomp$inline_34_JSCompiler_temp$jscomp$0$$ = $win$$.__AMP_MODE = $JSCompiler_inline_result$jscomp$1_JSCompiler_runningTests$jscomp$inline_34_JSCompiler_temp$jscomp$0$$;
            }
            return $JSCompiler_inline_result$jscomp$1_JSCompiler_runningTests$jscomp$inline_34_JSCompiler_temp$jscomp$0$$;
        }
        function $includes$$module$src$polyfills$array_includes$$($value$jscomp$89$$, $i$jscomp$3_opt_fromIndex$jscomp$8$$) {
            let $fromIndex$$ = $i$jscomp$3_opt_fromIndex$jscomp$8$$ || 0, $len$$ = this.length;
            for ($i$jscomp$3_opt_fromIndex$jscomp$8$$ = 0 <= $fromIndex$$ ? $fromIndex$$ : Math.max($len$$ + $fromIndex$$, 0); $i$jscomp$3_opt_fromIndex$jscomp$8$$ < $len$$; $i$jscomp$3_opt_fromIndex$jscomp$8$$++) {
                let $fromIndex$$ = this[$i$jscomp$3_opt_fromIndex$jscomp$8$$];
                if ($fromIndex$$ === $value$jscomp$89$$ || $value$jscomp$89$$ !== $value$jscomp$89$$ && $fromIndex$$ !== $fromIndex$$) return !0;
            }
            return !1;
        }
        let $resolved$$module$src$resolved_promise$$;
        function $resolvedPromise$$module$src$resolved_promise$$() {
            return $resolved$$module$src$resolved_promise$$ ? $resolved$$module$src$resolved_promise$$ : $resolved$$module$src$resolved_promise$$ = Promise.resolve(void 0);
        }
        let $VALID_NAME$$module$src$polyfills$custom_elements$$ = /^[a-z][a-z0-9._]*-[a-z0-9._-]*$/, $INVALID_NAMES$$module$src$polyfills$custom_elements$$ = "annotation-xml color-profile font-face font-face-src font-face-uri font-face-format font-face-name missing-glyph".split(" "), $TRACK_SUBTREE$$module$src$polyfills$custom_elements$$ = {
            childList: !0,
            subtree: !0
        };
        function $assertValidName$$module$src$polyfills$custom_elements$$($SyntaxError$jscomp$1$$, $name$jscomp$71$$) {
            if (!$VALID_NAME$$module$src$polyfills$custom_elements$$.test($name$jscomp$71$$) || $INVALID_NAMES$$module$src$polyfills$custom_elements$$.includes($name$jscomp$71$$)) throw new $SyntaxError$jscomp$1$$(`invalid custom element name "${$name$jscomp$71$$}"`);
        }
        function $rethrowAsync$$module$src$polyfills$custom_elements$$($error$jscomp$2$$) {
            setTimeout(() => {
                self.__AMP_REPORT_ERROR($error$jscomp$2$$);
                throw $error$jscomp$2$$;
            });
        }
        class $CustomElementRegistry$$module$src$polyfills$custom_elements$$ {
            constructor($win$jscomp$7$$, $registry$$) {
                this.$win_$ = $win$jscomp$7$$;
                this.$registry_$ = $registry$$;
                this.$pendingDefines_$ = Object.create(null);
            }
            define($name$jscomp$72$$, $ctor$$, $options$jscomp$31$$) {
                this.$registry_$.define($name$jscomp$72$$, $ctor$$, $options$jscomp$31$$);
                let $pending$$ = this.$pendingDefines_$, $deferred$$ = $pending$$[$name$jscomp$72$$];
                $deferred$$ && ($deferred$$.resolve(), delete $pending$$[$name$jscomp$72$$]);
            }
            get($name$jscomp$73$$) {
                let $def$$ = this.$registry_$.getByName($name$jscomp$73$$);
                if ($def$$) return $def$$.ctor;
            }
            whenDefined($name$jscomp$74$$) {
                let $Promise$jscomp$1$$ = this.$win_$.Promise;
                $assertValidName$$module$src$polyfills$custom_elements$$(this.$win_$.SyntaxError, $name$jscomp$74$$);
                if (this.$registry_$.getByName($name$jscomp$74$$)) return $resolvedPromise$$module$src$resolved_promise$$();
                let $pending$jscomp$1$$ = this.$pendingDefines_$, $deferred$jscomp$1$$ = $pending$jscomp$1$$[$name$jscomp$74$$];
                if ($deferred$jscomp$1$$) return $deferred$jscomp$1$$.promise;
                let $resolve$$;
                let $promise$$ = new $Promise$jscomp$1$$($name$jscomp$74$$ => $resolve$$ = $name$jscomp$74$$);
                $pending$jscomp$1$$[$name$jscomp$74$$] = {
                    promise: $promise$$,
                    resolve: $resolve$$
                };
                return $promise$$;
            }
            upgrade($root$jscomp$3$$) {
                this.$registry_$.upgrade($root$jscomp$3$$);
            }
        }
        function $JSCompiler_StaticMethods_observe_$$($JSCompiler_StaticMethods_observe_$self$$, $name$jscomp$78$$) {
            if ($JSCompiler_StaticMethods_observe_$self$$.$query_$) $JSCompiler_StaticMethods_observe_$self$$.$query_$ += `,${$name$jscomp$78$$}`; else {
                $JSCompiler_StaticMethods_observe_$self$$.$query_$ = $name$jscomp$78$$;
                var $mo$$ = new $JSCompiler_StaticMethods_observe_$self$$.$win_$.MutationObserver($name$jscomp$78$$ => {
                    $name$jscomp$78$$ && $JSCompiler_StaticMethods_handleRecords_$$($JSCompiler_StaticMethods_observe_$self$$, $name$jscomp$78$$);
                });
                $JSCompiler_StaticMethods_observe_$self$$.$mutationObserver_$ = $mo$$;
                $JSCompiler_StaticMethods_observe_$self$$.$roots_$.forEach($JSCompiler_StaticMethods_observe_$self$$ => {
                    $mo$$.observe($JSCompiler_StaticMethods_observe_$self$$, $TRACK_SUBTREE$$module$src$polyfills$custom_elements$$);
                });
                $installPatches$$module$src$polyfills$custom_elements$$($JSCompiler_StaticMethods_observe_$self$$.$win_$, $JSCompiler_StaticMethods_observe_$self$$);
            }
        }
        function $JSCompiler_StaticMethods_queryAll_$$($root$jscomp$5$$, $query$jscomp$13$$) {
            return $query$jscomp$13$$ && $root$jscomp$5$$.querySelectorAll ? $root$jscomp$5$$.querySelectorAll($query$jscomp$13$$) : [];
        }
        function $JSCompiler_StaticMethods_connectedCallback_$$($JSCompiler_StaticMethods_connectedCallback_$self$$, $node$jscomp$7$$) {
            let $def$jscomp$4$$ = $JSCompiler_StaticMethods_connectedCallback_$self$$.getByName($node$jscomp$7$$.localName);
            if ($def$jscomp$4$$ && ($JSCompiler_StaticMethods_upgradeSelf_$$($JSCompiler_StaticMethods_connectedCallback_$self$$, $node$jscomp$7$$, $def$jscomp$4$$), 
            $node$jscomp$7$$.connectedCallback)) try {
                $node$jscomp$7$$.connectedCallback();
            } catch ($e$jscomp$9$$) {
                $rethrowAsync$$module$src$polyfills$custom_elements$$($e$jscomp$9$$);
            }
        }
        function $JSCompiler_StaticMethods_upgradeSelf_$$($JSCompiler_StaticMethods_upgradeSelf_$self$$, $node$jscomp$6$$, $ctor$jscomp$3_def$jscomp$3$$) {
            $ctor$jscomp$3_def$jscomp$3$$ = $ctor$jscomp$3_def$jscomp$3$$.ctor;
            if (!($node$jscomp$6$$ instanceof $ctor$jscomp$3_def$jscomp$3$$)) {
                $JSCompiler_StaticMethods_upgradeSelf_$self$$.$current_$ = $node$jscomp$6$$;
                try {
                    if (new $ctor$jscomp$3_def$jscomp$3$$ !== $node$jscomp$6$$) throw new $JSCompiler_StaticMethods_upgradeSelf_$self$$.$win_$.Error("Constructor illegally returned a different instance.");
                } catch ($e$jscomp$8$$) {
                    $rethrowAsync$$module$src$polyfills$custom_elements$$($e$jscomp$8$$);
                }
            }
        }
        function $JSCompiler_StaticMethods_handleRecords_$$($JSCompiler_StaticMethods_handleRecords_$self$$, $records$jscomp$1$$) {
            for (let $i$jscomp$5$$ = 0; $i$jscomp$5$$ < $records$jscomp$1$$.length; $i$jscomp$5$$++) {
                let $record$$ = $records$jscomp$1$$[$i$jscomp$5$$];
                if (!$record$$) continue;
                let $addedNodes$$ = $record$$.addedNodes, $removedNodes$$ = $record$$.removedNodes;
                for (var $i$jscomp$6_i$jscomp$8$$ = 0; $i$jscomp$6_i$jscomp$8$$ < $addedNodes$$.length; $i$jscomp$6_i$jscomp$8$$++) {
                    $JSCompiler_node$jscomp$inline_45_i$jscomp$7_node$jscomp$10_node$jscomp$9$$ = $addedNodes$$[$i$jscomp$6_i$jscomp$8$$];
                    let $records$jscomp$1$$ = $JSCompiler_StaticMethods_queryAll_$$($JSCompiler_node$jscomp$inline_45_i$jscomp$7_node$jscomp$10_node$jscomp$9$$, $JSCompiler_StaticMethods_handleRecords_$self$$.$query_$);
                    $JSCompiler_StaticMethods_connectedCallback_$$($JSCompiler_StaticMethods_handleRecords_$self$$, $JSCompiler_node$jscomp$inline_45_i$jscomp$7_node$jscomp$10_node$jscomp$9$$);
                    for ($JSCompiler_node$jscomp$inline_45_i$jscomp$7_node$jscomp$10_node$jscomp$9$$ = 0; $JSCompiler_node$jscomp$inline_45_i$jscomp$7_node$jscomp$10_node$jscomp$9$$ < $records$jscomp$1$$.length; $JSCompiler_node$jscomp$inline_45_i$jscomp$7_node$jscomp$10_node$jscomp$9$$++) $JSCompiler_StaticMethods_connectedCallback_$$($JSCompiler_StaticMethods_handleRecords_$self$$, $records$jscomp$1$$[$JSCompiler_node$jscomp$inline_45_i$jscomp$7_node$jscomp$10_node$jscomp$9$$]);
                }
                for ($i$jscomp$6_i$jscomp$8$$ = 0; $i$jscomp$6_i$jscomp$8$$ < $removedNodes$$.length; $i$jscomp$6_i$jscomp$8$$++) {
                    $JSCompiler_node$jscomp$inline_45_i$jscomp$7_node$jscomp$10_node$jscomp$9$$ = $removedNodes$$[$i$jscomp$6_i$jscomp$8$$];
                    let $records$jscomp$1$$ = $JSCompiler_StaticMethods_queryAll_$$($JSCompiler_node$jscomp$inline_45_i$jscomp$7_node$jscomp$10_node$jscomp$9$$, $JSCompiler_StaticMethods_handleRecords_$self$$.$query_$);
                    if ($JSCompiler_node$jscomp$inline_45_i$jscomp$7_node$jscomp$10_node$jscomp$9$$.disconnectedCallback) try {
                        $JSCompiler_node$jscomp$inline_45_i$jscomp$7_node$jscomp$10_node$jscomp$9$$.disconnectedCallback();
                    } catch ($JSCompiler_e$jscomp$inline_42$$) {
                        $rethrowAsync$$module$src$polyfills$custom_elements$$($JSCompiler_e$jscomp$inline_42$$);
                    }
                    for (let $JSCompiler_StaticMethods_handleRecords_$self$$ = 0; $JSCompiler_StaticMethods_handleRecords_$self$$ < $records$jscomp$1$$.length; $JSCompiler_StaticMethods_handleRecords_$self$$++) {
                        var $JSCompiler_node$jscomp$inline_45_i$jscomp$7_node$jscomp$10_node$jscomp$9$$ = $records$jscomp$1$$[$JSCompiler_StaticMethods_handleRecords_$self$$];
                        if ($JSCompiler_node$jscomp$inline_45_i$jscomp$7_node$jscomp$10_node$jscomp$9$$.disconnectedCallback) try {
                            $JSCompiler_node$jscomp$inline_45_i$jscomp$7_node$jscomp$10_node$jscomp$9$$.disconnectedCallback();
                        } catch ($JSCompiler_e$jscomp$inline_46$$) {
                            $rethrowAsync$$module$src$polyfills$custom_elements$$($JSCompiler_e$jscomp$inline_46$$);
                        }
                    }
                }
            }
        }
        class $Registry$$module$src$polyfills$custom_elements$$ {
            constructor($win$jscomp$8$$) {
                this.$win_$ = $win$jscomp$8$$;
                this.$definitions_$ = Object.create(null);
                this.$query_$ = "";
                this.$mutationObserver_$ = this.$current_$ = null;
                this.$roots_$ = [ $win$jscomp$8$$.document ];
            }
            current() {
                let $current$$ = this.$current_$;
                this.$current_$ = null;
                return $current$$;
            }
            getByName($name$jscomp$75$$) {
                let $definition$$ = this.$definitions_$[$name$jscomp$75$$];
                if ($definition$$) return $definition$$;
            }
            getByConstructor($ctor$jscomp$1$$) {
                let $definitions$$ = this.$definitions_$;
                for (let $name$jscomp$76$$ in $definitions$$) {
                    let $def$jscomp$1$$ = $definitions$$[$name$jscomp$76$$];
                    if ($def$jscomp$1$$.ctor === $ctor$jscomp$1$$) return $def$jscomp$1$$;
                }
            }
            define($name$jscomp$77$$, $ctor$jscomp$2$$, $options$jscomp$32$$) {
                let $Error$jscomp$1$$ = this.$win_$.Error, $SyntaxError$jscomp$3$$ = this.$win_$.SyntaxError;
                if ($options$jscomp$32$$) throw new $Error$jscomp$1$$("Extending native custom elements is not supported");
                $assertValidName$$module$src$polyfills$custom_elements$$($SyntaxError$jscomp$3$$, $name$jscomp$77$$);
                if (this.getByName($name$jscomp$77$$) || this.getByConstructor($ctor$jscomp$2$$)) throw new $Error$jscomp$1$$(`duplicate definition "${$name$jscomp$77$$}"`);
                this.$definitions_$[$name$jscomp$77$$] = {
                    name: $name$jscomp$77$$,
                    ctor: $ctor$jscomp$2$$
                };
                $JSCompiler_StaticMethods_observe_$$(this, $name$jscomp$77$$);
                this.$roots_$.forEach($ctor$jscomp$2$$ => {
                    this.upgrade($ctor$jscomp$2$$, $name$jscomp$77$$);
                });
            }
            upgrade($i$jscomp$4_root$jscomp$4$$, $opt_query$$) {
                let $newlyDefined$$ = !!$opt_query$$, $upgradeCandidates$$ = $JSCompiler_StaticMethods_queryAll_$$($i$jscomp$4_root$jscomp$4$$, $opt_query$$ || this.$query_$);
                for ($i$jscomp$4_root$jscomp$4$$ = 0; $i$jscomp$4_root$jscomp$4$$ < $upgradeCandidates$$.length; $i$jscomp$4_root$jscomp$4$$++) {
                    let $opt_query$$ = $upgradeCandidates$$[$i$jscomp$4_root$jscomp$4$$];
                    $newlyDefined$$ ? $JSCompiler_StaticMethods_connectedCallback_$$(this, $opt_query$$) : this.upgradeSelf($opt_query$$);
                }
            }
            upgradeSelf($node$jscomp$5$$) {
                let $def$jscomp$2$$ = this.getByName($node$jscomp$5$$.localName);
                $def$jscomp$2$$ && $JSCompiler_StaticMethods_upgradeSelf_$$(this, $node$jscomp$5$$, $def$jscomp$2$$);
            }
            observe($tree$jscomp$2$$) {
                this.$roots_$.push($tree$jscomp$2$$);
                this.$mutationObserver_$ && this.$mutationObserver_$.observe($tree$jscomp$2$$, $TRACK_SUBTREE$$module$src$polyfills$custom_elements$$);
            }
            sync() {
                this.$mutationObserver_$ && $JSCompiler_StaticMethods_handleRecords_$$(this, this.$mutationObserver_$.takeRecords());
            }
        }
        function $installPatches$$module$src$polyfills$custom_elements$$($win$jscomp$9$$, $registry$jscomp$1$$) {
            let $document$jscomp$2$$ = $win$jscomp$9$$.document, $docProto$$ = $win$jscomp$9$$.Document.prototype, $elProto$$ = $win$jscomp$9$$.Element.prototype, $nodeProto$$ = $win$jscomp$9$$.Node.prototype, $createElement$$ = $docProto$$.createElement, $importNode$$ = $docProto$$.importNode, $appendChild$$ = $nodeProto$$.appendChild, $cloneNode$$ = $nodeProto$$.cloneNode, $insertBefore$$ = $nodeProto$$.insertBefore, $removeChild$$ = $nodeProto$$.removeChild, $replaceChild$$ = $nodeProto$$.replaceChild;
            $docProto$$.createElement = function($win$jscomp$9$$) {
                let $document$jscomp$2$$ = $registry$jscomp$1$$.getByName($win$jscomp$9$$);
                return $document$jscomp$2$$ ? new $document$jscomp$2$$.ctor : $createElement$$.apply(this, arguments);
            };
            $docProto$$.importNode = function() {
                let $win$jscomp$9$$ = $importNode$$.apply(this, arguments);
                $win$jscomp$9$$ && this === $document$jscomp$2$$ && ($registry$jscomp$1$$.upgradeSelf($win$jscomp$9$$), 
                $registry$jscomp$1$$.upgrade($win$jscomp$9$$));
                return $win$jscomp$9$$;
            };
            $nodeProto$$.appendChild = function() {
                let $win$jscomp$9$$ = $appendChild$$.apply(this, arguments);
                $registry$jscomp$1$$.sync();
                return $win$jscomp$9$$;
            };
            $nodeProto$$.insertBefore = function() {
                let $win$jscomp$9$$ = $insertBefore$$.apply(this, arguments);
                $registry$jscomp$1$$.sync();
                return $win$jscomp$9$$;
            };
            $nodeProto$$.removeChild = function() {
                let $win$jscomp$9$$ = $removeChild$$.apply(this, arguments);
                $registry$jscomp$1$$.sync();
                return $win$jscomp$9$$;
            };
            $nodeProto$$.replaceChild = function() {
                let $win$jscomp$9$$ = $replaceChild$$.apply(this, arguments);
                $registry$jscomp$1$$.sync();
                return $win$jscomp$9$$;
            };
            $nodeProto$$.cloneNode = function() {
                let $win$jscomp$9$$ = $cloneNode$$.apply(this, arguments);
                $win$jscomp$9$$.ownerDocument === $document$jscomp$2$$ && ($registry$jscomp$1$$.upgradeSelf($win$jscomp$9$$), 
                $registry$jscomp$1$$.upgrade($win$jscomp$9$$));
                return $win$jscomp$9$$;
            };
            let $innerHTMLProto$$ = $elProto$$, $innerHTMLDesc$$ = Object.getOwnPropertyDescriptor($innerHTMLProto$$, "innerHTML");
            $innerHTMLDesc$$ || ($innerHTMLProto$$ = Object.getPrototypeOf($win$jscomp$9$$.HTMLElement.prototype), 
            $innerHTMLDesc$$ = Object.getOwnPropertyDescriptor($innerHTMLProto$$, "innerHTML"));
            if ($innerHTMLDesc$$ && $innerHTMLDesc$$.configurable) {
                let $win$jscomp$9$$ = $innerHTMLDesc$$.set;
                $innerHTMLDesc$$.set = function($document$jscomp$2$$) {
                    $win$jscomp$9$$.call(this, $document$jscomp$2$$);
                    $registry$jscomp$1$$.upgrade(this);
                };
                Object.defineProperty($innerHTMLProto$$, "innerHTML", $innerHTMLDesc$$);
            }
        }
        function $polyfill$$module$src$polyfills$custom_elements$$() {
            function $HTMLElementPolyfill$$() {
                let $HTMLElementPolyfill$$ = this.constructor;
                var $win$jscomp$10$$ = $registry$jscomp$2$$.current();
                $win$jscomp$10$$ || ($win$jscomp$10$$ = $registry$jscomp$2$$.getByConstructor($HTMLElementPolyfill$$), 
                $win$jscomp$10$$ = $createElement$jscomp$1$$.call($document$jscomp$3$$, $win$jscomp$10$$.name));
                $setPrototypeOf$$module$src$polyfills$custom_elements$$($win$jscomp$10$$, $HTMLElementPolyfill$$.prototype);
                return $win$jscomp$10$$;
            }
            var $win$jscomp$10$$ = $JSCompiler_win$jscomp$inline_116$$, $Element$jscomp$2_elProto$jscomp$1$$ = $win$jscomp$10$$.Element;
            let $HTMLElement$jscomp$1$$ = $win$jscomp$10$$.HTMLElement, $document$jscomp$3$$ = $win$jscomp$10$$.document, $createElement$jscomp$1$$ = $document$jscomp$3$$.createElement, $registry$jscomp$2$$ = new $Registry$$module$src$polyfills$custom_elements$$($win$jscomp$10$$), $customElements$jscomp$2$$ = new $CustomElementRegistry$$module$src$polyfills$custom_elements$$($win$jscomp$10$$, $registry$jscomp$2$$);
            Object.defineProperty($win$jscomp$10$$, "customElements", {
                enumerable: !0,
                configurable: !0,
                value: $customElements$jscomp$2$$
            });
            $Element$jscomp$2_elProto$jscomp$1$$ = $Element$jscomp$2_elProto$jscomp$1$$.prototype;
            let $attachShadow$$ = $Element$jscomp$2_elProto$jscomp$1$$.attachShadow, $createShadowRoot$$ = $Element$jscomp$2_elProto$jscomp$1$$.createShadowRoot;
            $attachShadow$$ && ($Element$jscomp$2_elProto$jscomp$1$$.attachShadow = function($HTMLElementPolyfill$$) {
                let $win$jscomp$10$$ = $attachShadow$$.apply(this, arguments);
                $registry$jscomp$2$$.observe($win$jscomp$10$$);
                return $win$jscomp$10$$;
            }, $Element$jscomp$2_elProto$jscomp$1$$.attachShadow.toString = function() {
                return $attachShadow$$.toString();
            });
            $createShadowRoot$$ && ($Element$jscomp$2_elProto$jscomp$1$$.createShadowRoot = function() {
                let $HTMLElementPolyfill$$ = $createShadowRoot$$.apply(this, arguments);
                $registry$jscomp$2$$.observe($HTMLElementPolyfill$$);
                return $HTMLElementPolyfill$$;
            }, $Element$jscomp$2_elProto$jscomp$1$$.createShadowRoot.toString = function() {
                return $createShadowRoot$$.toString();
            });
            $subClass$$module$src$polyfills$custom_elements$$($HTMLElement$jscomp$1$$, $HTMLElementPolyfill$$);
            $win$jscomp$10$$.HTMLElement = $HTMLElementPolyfill$$;
            $HTMLElementPolyfill$$.call || ($HTMLElementPolyfill$$.apply = $win$jscomp$10$$.Function.apply, 
            $HTMLElementPolyfill$$.bind = $win$jscomp$10$$.Function.bind, $HTMLElementPolyfill$$.call = $win$jscomp$10$$.Function.call);
        }
        function $wrapHTMLElement$$module$src$polyfills$custom_elements$$() {
            function $HTMLElementWrapper$$() {
                return $Reflect$jscomp$1$$.construct($HTMLElement$jscomp$2$$, [], this.constructor);
            }
            var $win$jscomp$11$$ = $JSCompiler_win$jscomp$inline_116$$;
            let $HTMLElement$jscomp$2$$ = $win$jscomp$11$$.HTMLElement, $Reflect$jscomp$1$$ = $win$jscomp$11$$.Reflect;
            $subClass$$module$src$polyfills$custom_elements$$($HTMLElement$jscomp$2$$, $HTMLElementWrapper$$);
            $win$jscomp$11$$.HTMLElement = $HTMLElementWrapper$$;
        }
        function $subClass$$module$src$polyfills$custom_elements$$($superClass$$, $subClass$$) {
            $subClass$$.prototype = Object.create($superClass$$.prototype, {
                constructor: {
                    configurable: !0,
                    writable: !0,
                    value: $subClass$$
                }
            });
            $setPrototypeOf$$module$src$polyfills$custom_elements$$($subClass$$, $superClass$$);
        }
        function $setPrototypeOf$$module$src$polyfills$custom_elements$$($obj$jscomp$28$$, $prototype$$) {
            if (Object.setPrototypeOf) Object.setPrototypeOf($obj$jscomp$28$$, $prototype$$); else if ({
                __proto__: {
                    test: !0
                }
            }.test) $obj$jscomp$28$$.__proto__ = $prototype$$; else {
                let $JSCompiler_current$jscomp$inline_50$$ = $prototype$$;
                for (;null !== $JSCompiler_current$jscomp$inline_50$$ && !Object.isPrototypeOf.call($JSCompiler_current$jscomp$inline_50$$, $obj$jscomp$28$$); ) {
                    let $prototype$$ = Object.getOwnPropertyNames($JSCompiler_current$jscomp$inline_50$$);
                    for (let $JSCompiler_props$jscomp$inline_51$$ = 0; $JSCompiler_props$jscomp$inline_51$$ < $prototype$$.length; $JSCompiler_props$jscomp$inline_51$$++) {
                        let $JSCompiler_i$jscomp$inline_52$$ = $prototype$$[$JSCompiler_props$jscomp$inline_51$$];
                        if (Object.hasOwnProperty.call($obj$jscomp$28$$, $JSCompiler_i$jscomp$inline_52$$)) continue;
                        let $JSCompiler_desc$jscomp$inline_54$$ = Object.getOwnPropertyDescriptor($JSCompiler_current$jscomp$inline_50$$, $JSCompiler_i$jscomp$inline_52$$);
                        Object.defineProperty($obj$jscomp$28$$, $JSCompiler_i$jscomp$inline_52$$, $JSCompiler_desc$jscomp$inline_54$$);
                    }
                    $JSCompiler_current$jscomp$inline_50$$ = Object.getPrototypeOf($JSCompiler_current$jscomp$inline_50$$);
                }
            }
        }
        function $domTokenListTogglePolyfill$$module$src$polyfills$domtokenlist$$($token$jscomp$4$$, $opt_force$jscomp$1$$) {
            if (void 0 === $opt_force$jscomp$1$$ ? this.contains($token$jscomp$4$$) : !$opt_force$jscomp$1$$) return this.remove($token$jscomp$4$$), 
            !1;
            this.add($token$jscomp$4$$);
            return !0;
        }
        function $install$$module$src$polyfills$domtokenlist$$() {
            var $win$jscomp$14$$ = self;
            if (/Trident|MSIE|IEMobile/i.test($win$jscomp$14$$.navigator.userAgent) && $win$jscomp$14$$.DOMTokenList) {
                $win$jscomp$14$$.Object.defineProperty($win$jscomp$14$$.DOMTokenList.prototype, "toggle", {
                    enumerable: !1,
                    configurable: !0,
                    writable: !0,
                    value: $domTokenListTogglePolyfill$$module$src$polyfills$domtokenlist$$
                });
                let $add$$ = $win$jscomp$14$$.DOMTokenList.prototype.add;
                $win$jscomp$14$$.DOMTokenList.prototype.add = function() {
                    for (let $win$jscomp$14$$ = 0; $win$jscomp$14$$ < arguments.length; $win$jscomp$14$$++) $add$$.call(this, arguments[$win$jscomp$14$$]);
                };
            }
        }
        function $documentContainsPolyfill$$module$src$polyfills$document_contains$$($node$jscomp$11$$) {
            return $node$jscomp$11$$ == this || this.documentElement.contains($node$jscomp$11$$);
        }
        let $toString_$$module$src$types$$ = Object.prototype.toString;
        function $once$$module$src$utils$function$$($fn$$) {
            let $evaluated$$ = !1, $retValue$$ = null, $callback$jscomp$50$$ = $fn$$;
            return (...$fn$$) => {
                $evaluated$$ || ($retValue$$ = $callback$jscomp$50$$.apply(self, $fn$$), $evaluated$$ = !0, 
                $callback$jscomp$50$$ = null);
                return $retValue$$;
            };
        }
        let $env$$module$src$config$$ = self.AMP_CONFIG || {}, $cdnProxyRegex$$module$src$config$$ = ("string" == typeof $env$$module$src$config$$.cdnProxyRegex ? new RegExp($env$$module$src$config$$.cdnProxyRegex) : $env$$module$src$config$$.cdnProxyRegex) || /^https:\/\/([a-zA-Z0-9_-]+\.)?cdn\.ampproject\.org$/;
        function $getMetaUrl$$module$src$config$$($name$jscomp$80$$) {
            if (!self.document || !self.document.head || self.location && $cdnProxyRegex$$module$src$config$$.test(self.location.origin)) return null;
            let $metaEl$$ = self.document.head.querySelector(`meta[name="${$name$jscomp$80$$}"]`);
            return $metaEl$$ && $metaEl$$.getAttribute("content") || null;
        }
        let $urls$$module$src$config$$ = {
            thirdParty: $env$$module$src$config$$.thirdPartyUrl || "https://3p.ampproject.net",
            thirdPartyFrameHost: $env$$module$src$config$$.thirdPartyFrameHost || "ampproject.net",
            thirdPartyFrameRegex: ("string" == typeof $env$$module$src$config$$.thirdPartyFrameRegex ? new RegExp($env$$module$src$config$$.thirdPartyFrameRegex) : $env$$module$src$config$$.thirdPartyFrameRegex) || /^d-\d+\.ampproject\.net$/,
            cdn: $env$$module$src$config$$.cdnUrl || $getMetaUrl$$module$src$config$$("runtime-host") || "https://cdn.ampproject.org",
            cdnProxyRegex: $cdnProxyRegex$$module$src$config$$,
            localhostRegex: /^https?:\/\/localhost(:\d+)?$/,
            errorReporting: $env$$module$src$config$$.errorReportingUrl || "https://us-central1-amp-error-reporting.cloudfunctions.net/r",
            betaErrorReporting: $env$$module$src$config$$.betaErrorReportingUrl || "https://us-central1-amp-error-reporting.cloudfunctions.net/r-beta",
            localDev: $env$$module$src$config$$.localDev || !1,
            trustedViewerHosts: [ /(^|\.)google\.(com?|[a-z]{2}|com?\.[a-z]{2}|cat)$/, /(^|\.)gmail\.(com|dev)$/ ],
            geoApi: $env$$module$src$config$$.geoApiUrl || $getMetaUrl$$module$src$config$$("amp-geo-api")
        };
        let $noop$$module$src$log$$ = () => {};
        function $isUserErrorMessage$$module$src$log$$($message$jscomp$29$$) {
            return 0 <= $message$jscomp$29$$.indexOf("​​​");
        }
        let $externalMessageUrl$$module$src$log$$ = ($id$jscomp$6$$, $interpolatedParts$$) => $interpolatedParts$$.reduce(($id$jscomp$6$$, $interpolatedParts$$) => `${$id$jscomp$6$$}&s[]=${encodeURIComponent(String($elementStringOrPassthru$$module$src$log$$($interpolatedParts$$)))}`, `https://log.amp.dev/?v=012005062057000&id=${encodeURIComponent($id$jscomp$6$$)}`);
        function $JSCompiler_StaticMethods_msg_$$($JSCompiler_StaticMethods_msg_$self$$, $prefix$jscomp$3_tag$jscomp$2$$, $JSCompiler_inline_result$jscomp$5_level$jscomp$20$$, $messages$$) {
            if (0 != $JSCompiler_StaticMethods_msg_$self$$.$level_$) {
                let $fn$jscomp$2$$ = $JSCompiler_StaticMethods_msg_$self$$.win.console.log;
                "ERROR" == $JSCompiler_inline_result$jscomp$5_level$jscomp$20$$ ? $fn$jscomp$2$$ = $JSCompiler_StaticMethods_msg_$self$$.win.console.error || $fn$jscomp$2$$ : "INFO" == $JSCompiler_inline_result$jscomp$5_level$jscomp$20$$ ? $fn$jscomp$2$$ = $JSCompiler_StaticMethods_msg_$self$$.win.console.info || $fn$jscomp$2$$ : "WARN" == $JSCompiler_inline_result$jscomp$5_level$jscomp$20$$ && ($fn$jscomp$2$$ = $JSCompiler_StaticMethods_msg_$self$$.win.console.warn || $fn$jscomp$2$$);
                $JSCompiler_inline_result$jscomp$5_level$jscomp$20$$ = Array.isArray($messages$$[0]) ? $JSCompiler_StaticMethods_expandMessageArgs_$$($JSCompiler_StaticMethods_msg_$self$$, $messages$$[0]) : $messages$$;
                $prefix$jscomp$3_tag$jscomp$2$$ = `[${$prefix$jscomp$3_tag$jscomp$2$$}]`;
                "string" === typeof $JSCompiler_inline_result$jscomp$5_level$jscomp$20$$[0] ? $JSCompiler_inline_result$jscomp$5_level$jscomp$20$$[0] = $prefix$jscomp$3_tag$jscomp$2$$ + " " + $JSCompiler_inline_result$jscomp$5_level$jscomp$20$$[0] : $JSCompiler_inline_result$jscomp$5_level$jscomp$20$$.unshift($prefix$jscomp$3_tag$jscomp$2$$);
                $fn$jscomp$2$$.apply($JSCompiler_StaticMethods_msg_$self$$.win.console, $JSCompiler_inline_result$jscomp$5_level$jscomp$20$$);
            }
        }
        function $JSCompiler_StaticMethods_prepareError_$$($JSCompiler_StaticMethods_prepareError_$self$$, $error$jscomp$8$$) {
            $error$jscomp$8$$ = $duplicateErrorIfNecessary$$module$src$log$$($error$jscomp$8$$);
            $JSCompiler_StaticMethods_prepareError_$self$$.$suffix_$ ? $error$jscomp$8$$.message ? -1 == $error$jscomp$8$$.message.indexOf($JSCompiler_StaticMethods_prepareError_$self$$.$suffix_$) && ($error$jscomp$8$$.message += $JSCompiler_StaticMethods_prepareError_$self$$.$suffix_$) : $error$jscomp$8$$.message = $JSCompiler_StaticMethods_prepareError_$self$$.$suffix_$ : $isUserErrorMessage$$module$src$log$$($error$jscomp$8$$.message) && ($error$jscomp$8$$.message = $error$jscomp$8$$.message.replace("​​​", ""));
        }
        function $JSCompiler_StaticMethods_expandMessageArgs_$$($JSCompiler_StaticMethods_expandMessageArgs_$self$$, $parts$$) {
            let $id$jscomp$7$$ = $parts$$.shift();
            $getMode$$module$src$mode$$($JSCompiler_StaticMethods_expandMessageArgs_$self$$.win).development && $JSCompiler_StaticMethods_expandMessageArgs_$self$$.$fetchExternalMessagesOnce_$();
            return $JSCompiler_StaticMethods_expandMessageArgs_$self$$.$messages_$ && $id$jscomp$7$$ in $JSCompiler_StaticMethods_expandMessageArgs_$self$$.$messages_$ ? [ $JSCompiler_StaticMethods_expandMessageArgs_$self$$.$messages_$[$id$jscomp$7$$] ].concat($parts$$) : [ `More info at ${$externalMessageUrl$$module$src$log$$($id$jscomp$7$$, $parts$$)}` ];
        }
        function $JSCompiler_StaticMethods_assertType_$$($JSCompiler_StaticMethods_assertType_$self$$, $subject$$, $assertion$$, $defaultMessage$$, $opt_message$jscomp$13$$) {
            Array.isArray($opt_message$jscomp$13$$) ? $JSCompiler_StaticMethods_assertType_$self$$.assert($assertion$$, $opt_message$jscomp$13$$.concat($subject$$)) : $JSCompiler_StaticMethods_assertType_$self$$.assert($assertion$$, `${$opt_message$jscomp$13$$ || $defaultMessage$$}: %s`, $subject$$);
        }
        class $Log$$module$src$log$$ {
            constructor($win$jscomp$16$$, $levelFunc$$, $opt_suffix$$ = "") {
                this.win = $getMode$$module$src$mode$$().test && $win$jscomp$16$$.__AMP_TEST_IFRAME ? $win$jscomp$16$$.parent : $win$jscomp$16$$;
                this.$levelFunc_$ = $levelFunc$$;
                this.$level_$ = this.win.console && this.win.console.log && "0" != $getMode$$module$src$mode$$().log ? $getMode$$module$src$mode$$().test && this.win.ENABLE_LOG ? 4 : $getMode$$module$src$mode$$().localDev && !$getMode$$module$src$mode$$().log ? 3 : this.$levelFunc_$(parseInt($getMode$$module$src$mode$$().log, 10), $getMode$$module$src$mode$$().development) : 0;
                this.$suffix_$ = $opt_suffix$$;
                this.$messages_$ = null;
                this.$fetchExternalMessagesOnce_$ = $once$$module$src$utils$function$$(() => {
                    $win$jscomp$16$$.fetch(`${$urls$$module$src$config$$.cdn}/rtv/012005062057000/log-messages.simple.json`).then($win$jscomp$16$$ => $win$jscomp$16$$.json(), $noop$$module$src$log$$).then($win$jscomp$16$$ => {
                        $win$jscomp$16$$ && (this.$messages_$ = $win$jscomp$16$$);
                    });
                });
            }
            isEnabled() {
                return 0 != this.$level_$;
            }
            fine($tag$jscomp$3$$, $var_args$jscomp$34$$) {
                4 <= this.$level_$ && $JSCompiler_StaticMethods_msg_$$(this, $tag$jscomp$3$$, "FINE", Array.prototype.slice.call(arguments, 1));
            }
            info($tag$jscomp$4$$, $var_args$jscomp$35$$) {
                3 <= this.$level_$ && $JSCompiler_StaticMethods_msg_$$(this, $tag$jscomp$4$$, "INFO", Array.prototype.slice.call(arguments, 1));
            }
            warn($tag$jscomp$5$$, $var_args$jscomp$36$$) {
                2 <= this.$level_$ && $JSCompiler_StaticMethods_msg_$$(this, $tag$jscomp$5$$, "WARN", Array.prototype.slice.call(arguments, 1));
            }
            $error_$($tag$jscomp$6$$, $var_args$jscomp$37$$) {
                if (1 <= this.$level_$) $JSCompiler_StaticMethods_msg_$$(this, $tag$jscomp$6$$, "ERROR", Array.prototype.slice.call(arguments, 1)); else {
                    let $tag$jscomp$6$$ = $createErrorVargs$$module$src$log$$.apply(null, Array.prototype.slice.call(arguments, 1));
                    $JSCompiler_StaticMethods_prepareError_$$(this, $tag$jscomp$6$$);
                    return $tag$jscomp$6$$;
                }
            }
            error($tag$jscomp$7$$, $var_args$jscomp$38$$) {
                let $error$jscomp$4$$ = this.$error_$.apply(this, arguments);
                $error$jscomp$4$$ && ($error$jscomp$4$$.name = $tag$jscomp$7$$ || $error$jscomp$4$$.name, 
                self.__AMP_REPORT_ERROR($error$jscomp$4$$));
            }
            expectedError($unusedTag$$, $var_args$jscomp$39$$) {
                let $error$jscomp$5$$ = this.$error_$.apply(this, arguments);
                $error$jscomp$5$$ && ($error$jscomp$5$$.expected = !0, self.__AMP_REPORT_ERROR($error$jscomp$5$$));
            }
            createError($var_args$jscomp$40$$) {
                let $error$jscomp$6$$ = $createErrorVargs$$module$src$log$$.apply(null, arguments);
                $JSCompiler_StaticMethods_prepareError_$$(this, $error$jscomp$6$$);
                return $error$jscomp$6$$;
            }
            createExpectedError($var_args$jscomp$41$$) {
                let $error$jscomp$7$$ = $createErrorVargs$$module$src$log$$.apply(null, arguments);
                $JSCompiler_StaticMethods_prepareError_$$(this, $error$jscomp$7$$);
                $error$jscomp$7$$.expected = !0;
                return $error$jscomp$7$$;
            }
            assert($shouldBeTrueish$$, $opt_message$jscomp$7$$, $var_args$jscomp$42$$) {
                let $firstElement$$;
                if (Array.isArray($opt_message$jscomp$7$$)) return this.assert.apply(this, [ $shouldBeTrueish$$ ].concat($JSCompiler_StaticMethods_expandMessageArgs_$$(this, $opt_message$jscomp$7$$)));
                if (!$shouldBeTrueish$$) {
                    let $shouldBeTrueish$$ = ($opt_message$jscomp$7$$ || "Assertion failed").split("%s");
                    var $JSCompiler_val$jscomp$inline_63_first$jscomp$5$$ = $shouldBeTrueish$$.shift();
                    let $var_args$jscomp$42$$ = $JSCompiler_val$jscomp$inline_63_first$jscomp$5$$;
                    let $messageArray$$ = [];
                    var $e$jscomp$12_i$jscomp$12$$ = 2;
                    for ("" != $JSCompiler_val$jscomp$inline_63_first$jscomp$5$$ && $messageArray$$.push($JSCompiler_val$jscomp$inline_63_first$jscomp$5$$); 0 < $shouldBeTrueish$$.length; ) {
                        let $opt_message$jscomp$7$$ = $shouldBeTrueish$$.shift(), $splitMessage$$ = arguments[$e$jscomp$12_i$jscomp$12$$++];
                        $splitMessage$$ && $splitMessage$$.tagName && ($firstElement$$ = $splitMessage$$);
                        $messageArray$$.push($splitMessage$$);
                        $JSCompiler_val$jscomp$inline_63_first$jscomp$5$$ = $opt_message$jscomp$7$$.trim();
                        "" != $JSCompiler_val$jscomp$inline_63_first$jscomp$5$$ && $messageArray$$.push($JSCompiler_val$jscomp$inline_63_first$jscomp$5$$);
                        $var_args$jscomp$42$$ += $elementStringOrPassthru$$module$src$log$$($splitMessage$$) + $opt_message$jscomp$7$$;
                    }
                    $e$jscomp$12_i$jscomp$12$$ = Error($var_args$jscomp$42$$);
                    $e$jscomp$12_i$jscomp$12$$.fromAssert = !0;
                    $e$jscomp$12_i$jscomp$12$$.associatedElement = $firstElement$$;
                    $e$jscomp$12_i$jscomp$12$$.messageArray = $messageArray$$;
                    $JSCompiler_StaticMethods_prepareError_$$(this, $e$jscomp$12_i$jscomp$12$$);
                    self.__AMP_REPORT_ERROR($e$jscomp$12_i$jscomp$12$$);
                    throw $e$jscomp$12_i$jscomp$12$$;
                }
                return $shouldBeTrueish$$;
            }
            assertElement($shouldBeElement$$, $opt_message$jscomp$8$$) {
                $JSCompiler_StaticMethods_assertType_$$(this, $shouldBeElement$$, $shouldBeElement$$ && 1 == $shouldBeElement$$.nodeType, "Element expected", $opt_message$jscomp$8$$);
                return $shouldBeElement$$;
            }
            assertString($shouldBeString$$, $opt_message$jscomp$9$$) {
                $JSCompiler_StaticMethods_assertType_$$(this, $shouldBeString$$, "string" == typeof $shouldBeString$$, "String expected", $opt_message$jscomp$9$$);
                return $shouldBeString$$;
            }
            assertNumber($shouldBeNumber$$, $opt_message$jscomp$10$$) {
                $JSCompiler_StaticMethods_assertType_$$(this, $shouldBeNumber$$, "number" == typeof $shouldBeNumber$$, "Number expected", $opt_message$jscomp$10$$);
                return $shouldBeNumber$$;
            }
            assertArray($shouldBeArray$$, $opt_message$jscomp$11$$) {
                $JSCompiler_StaticMethods_assertType_$$(this, $shouldBeArray$$, Array.isArray($shouldBeArray$$), "Array expected", $opt_message$jscomp$11$$);
                return $shouldBeArray$$;
            }
            assertBoolean($shouldBeBoolean$$, $opt_message$jscomp$12$$) {
                $JSCompiler_StaticMethods_assertType_$$(this, $shouldBeBoolean$$, !!$shouldBeBoolean$$ === $shouldBeBoolean$$, "Boolean expected", $opt_message$jscomp$12$$);
                return $shouldBeBoolean$$;
            }
            assertEnumValue($JSCompiler_inline_result$jscomp$4_enumObj$jscomp$1$$, $s$jscomp$7$$, $opt_enumName$$) {
                a: {
                    for (let $opt_enumName$$ in $JSCompiler_inline_result$jscomp$4_enumObj$jscomp$1$$) if ($JSCompiler_inline_result$jscomp$4_enumObj$jscomp$1$$[$opt_enumName$$] === $s$jscomp$7$$) {
                        $JSCompiler_inline_result$jscomp$4_enumObj$jscomp$1$$ = !0;
                        break a;
                    }
                    $JSCompiler_inline_result$jscomp$4_enumObj$jscomp$1$$ = !1;
                }
                if ($JSCompiler_inline_result$jscomp$4_enumObj$jscomp$1$$) return $s$jscomp$7$$;
                this.assert(!1, 'Unknown %s value: "%s"', $opt_enumName$$ || "enum", $s$jscomp$7$$);
            }
        }
        function $elementStringOrPassthru$$module$src$log$$($val$jscomp$2$$) {
            return $val$jscomp$2$$ && 1 == $val$jscomp$2$$.nodeType ? $val$jscomp$2$$.tagName.toLowerCase() + ($val$jscomp$2$$.id ? "#" + $val$jscomp$2$$.id : "") : $val$jscomp$2$$;
        }
        function $duplicateErrorIfNecessary$$module$src$log$$($error$jscomp$9$$) {
            let $messageProperty$$ = Object.getOwnPropertyDescriptor($error$jscomp$9$$, "message");
            if ($messageProperty$$ && $messageProperty$$.writable) return $error$jscomp$9$$;
            let $stack$$ = $error$jscomp$9$$.stack, $e$jscomp$13$$ = Error($error$jscomp$9$$.message);
            for (let $messageProperty$$ in $error$jscomp$9$$) $e$jscomp$13$$[$messageProperty$$] = $error$jscomp$9$$[$messageProperty$$];
            $e$jscomp$13$$.stack = $stack$$;
            return $e$jscomp$13$$;
        }
        function $createErrorVargs$$module$src$log$$($var_args$jscomp$43$$) {
            let $error$jscomp$10$$ = null, $message$jscomp$34$$ = "";
            for (let $var_args$jscomp$43$$ = 0; $var_args$jscomp$43$$ < arguments.length; $var_args$jscomp$43$$++) {
                let $i$jscomp$13$$ = arguments[$var_args$jscomp$43$$];
                $i$jscomp$13$$ instanceof Error && !$error$jscomp$10$$ ? $error$jscomp$10$$ = $duplicateErrorIfNecessary$$module$src$log$$($i$jscomp$13$$) : ($message$jscomp$34$$ && ($message$jscomp$34$$ += " "), 
                $message$jscomp$34$$ += $i$jscomp$13$$);
            }
            $error$jscomp$10$$ ? $message$jscomp$34$$ && ($error$jscomp$10$$.message = $message$jscomp$34$$ + ": " + $error$jscomp$10$$.message) : $error$jscomp$10$$ = Error($message$jscomp$34$$);
            return $error$jscomp$10$$;
        }
        self.__AMP_LOG = self.__AMP_LOG || {
            user: null,
            dev: null,
            userForEmbed: null
        };
        let $logs$$module$src$log$$ = self.__AMP_LOG;
        let $logConstructor$$module$src$log$$ = null;
        function $user$$module$src$log$$() {
            $logs$$module$src$log$$.user || ($logs$$module$src$log$$.user = $getUserLogger$$module$src$log$$());
            return $logs$$module$src$log$$.user;
        }
        function $getUserLogger$$module$src$log$$() {
            if (!$logConstructor$$module$src$log$$) throw Error("failed to call initLogConstructor");
            return new $logConstructor$$module$src$log$$(self, ($logNum$$, $development$$) => $development$$ || 1 <= $logNum$$ ? 4 : 2, "​​​");
        }
        function $dev$$module$src$log$$() {
            if ($logs$$module$src$log$$.dev) return $logs$$module$src$log$$.dev;
            if (!$logConstructor$$module$src$log$$) throw Error("failed to call initLogConstructor");
            return $logs$$module$src$log$$.dev = new $logConstructor$$module$src$log$$(self, $logNum$jscomp$1$$ => 3 <= $logNum$jscomp$1$$ ? 4 : 2 <= $logNum$jscomp$1$$ ? 3 : 0);
        }
        function $devAssert$$module$src$log$$($shouldBeTrueish$jscomp$2$$) {
            return $getMode$$module$src$mode$$().minified ? $shouldBeTrueish$jscomp$2$$ : $dev$$module$src$log$$().assert($shouldBeTrueish$jscomp$2$$, void 0, void 0, void 0, void 0, void 0, void 0, void 0, void 0, void 0, void 0);
        }
        let $hasOwn_$$module$src$utils$object$$ = Object.prototype.hasOwnProperty;
        function $map$$module$src$utils$object$$($opt_initial$$) {
            let $obj$jscomp$30$$ = Object.create(null);
            $opt_initial$$ && Object.assign($obj$jscomp$30$$, $opt_initial$$);
            return $obj$jscomp$30$$;
        }
        function $dict$$module$src$utils$object$$($opt_initial$jscomp$1$$) {
            return $opt_initial$jscomp$1$$ || {};
        }
        class $Deferred$$module$src$utils$promise$$ {
            constructor() {
                let $resolve$jscomp$1$$, $reject$$;
                this.promise = new Promise(($res$jscomp$1$$, $rej$$) => {
                    $resolve$jscomp$1$$ = $res$jscomp$1$$;
                    $reject$$ = $rej$$;
                });
                this.resolve = $resolve$jscomp$1$$;
                this.reject = $reject$$;
            }
        }
        /*
    https://mths.be/cssescape v1.5.1 by @mathias | MIT license */
        function $startsWith$$module$src$string$$($string$jscomp$6$$, $prefix$jscomp$4$$) {
            return $prefix$jscomp$4$$.length > $string$jscomp$6$$.length ? !1 : 0 == $string$jscomp$6$$.lastIndexOf($prefix$jscomp$4$$, 0);
        }
        function $waitForChild$$module$src$dom$$($parent$jscomp$4$$, $checkFunc$$, $callback$jscomp$51$$) {
            if ($checkFunc$$($parent$jscomp$4$$)) $callback$jscomp$51$$(); else {
                var $win$jscomp$18$$ = $parent$jscomp$4$$.ownerDocument.defaultView;
                if ($win$jscomp$18$$.MutationObserver) {
                    let $observer$$ = new $win$jscomp$18$$.MutationObserver(() => {
                        $checkFunc$$($parent$jscomp$4$$) && ($observer$$.disconnect(), $callback$jscomp$51$$());
                    });
                    $observer$$.observe($parent$jscomp$4$$, {
                        childList: !0
                    });
                } else {
                    let $interval$$ = $win$jscomp$18$$.setInterval(() => {
                        $checkFunc$$($parent$jscomp$4$$) && ($win$jscomp$18$$.clearInterval($interval$$), 
                        $callback$jscomp$51$$());
                    }, 5);
                }
            }
        }
        function $waitForChildPromise$$module$src$dom$$($parent$jscomp$5$$, $checkFunc$jscomp$1$$) {
            return new Promise($resolve$jscomp$5$$ => {
                $waitForChild$$module$src$dom$$($parent$jscomp$5$$, $checkFunc$jscomp$1$$, $resolve$jscomp$5$$);
            });
        }
        function $waitForBodyOpen$$module$src$dom$$($doc$jscomp$2$$, $callback$jscomp$52$$) {
            $waitForChild$$module$src$dom$$($doc$jscomp$2$$.documentElement, () => !!$doc$jscomp$2$$.body, $callback$jscomp$52$$);
        }
        function $waitForBodyOpenPromise$$module$src$dom$$($doc$jscomp$3$$) {
            return new Promise($resolve$jscomp$6$$ => $waitForBodyOpen$$module$src$dom$$($doc$jscomp$3$$, $resolve$jscomp$6$$));
        }
        function $rootNodeFor$$module$src$dom$$($n$jscomp$4_node$jscomp$13$$) {
            if (Node.prototype.getRootNode) return $n$jscomp$4_node$jscomp$13$$.getRootNode() || $n$jscomp$4_node$jscomp$13$$;
            for (;$n$jscomp$4_node$jscomp$13$$.parentNode && !$isShadowRoot$$module$src$dom$$($n$jscomp$4_node$jscomp$13$$); $n$jscomp$4_node$jscomp$13$$ = $n$jscomp$4_node$jscomp$13$$.parentNode) ;
            return $n$jscomp$4_node$jscomp$13$$;
        }
        function $isShadowRoot$$module$src$dom$$($value$jscomp$96$$) {
            return $value$jscomp$96$$ ? "I-AMPHTML-SHADOW-ROOT" == $value$jscomp$96$$.tagName ? !0 : 11 == $value$jscomp$96$$.nodeType && "[object ShadowRoot]" === Object.prototype.toString.call($value$jscomp$96$$) : !1;
        }
        function $closestNode$$module$src$dom$$($n$jscomp$5_node$jscomp$14$$, $callback$jscomp$54$$) {
            for (;$n$jscomp$5_node$jscomp$14$$; $n$jscomp$5_node$jscomp$14$$ = $n$jscomp$5_node$jscomp$14$$.parentNode) if ($callback$jscomp$54$$($n$jscomp$5_node$jscomp$14$$)) return $n$jscomp$5_node$jscomp$14$$;
            return null;
        }
        function $iterateCursor$$module$src$dom$$($iterable$jscomp$3$$, $cb$$) {
            let $length$jscomp$17$$ = $iterable$jscomp$3$$.length;
            for (let $i$jscomp$18$$ = 0; $i$jscomp$18$$ < $length$jscomp$17$$; $i$jscomp$18$$++) $cb$$($iterable$jscomp$3$$[$i$jscomp$18$$], $i$jscomp$18$$);
        }
        function $parseJson$$module$src$json$$($json$$) {
            return JSON.parse($json$$);
        }
        function $utf8Encode$$module$src$utils$bytes$$($JSCompiler_str$jscomp$inline_72_JSCompiler_temp$jscomp$8_string$jscomp$8$$) {
            if ("undefined" !== typeof TextEncoder) $JSCompiler_str$jscomp$inline_72_JSCompiler_temp$jscomp$8_string$jscomp$8$$ = new TextEncoder("utf-8").encode($JSCompiler_str$jscomp$inline_72_JSCompiler_temp$jscomp$8_string$jscomp$8$$); else {
                $JSCompiler_str$jscomp$inline_72_JSCompiler_temp$jscomp$8_string$jscomp$8$$ = unescape(encodeURIComponent($JSCompiler_str$jscomp$inline_72_JSCompiler_temp$jscomp$8_string$jscomp$8$$));
                let $JSCompiler_bytes$jscomp$inline_73$$ = new Uint8Array($JSCompiler_str$jscomp$inline_72_JSCompiler_temp$jscomp$8_string$jscomp$8$$.length);
                for (let $JSCompiler_i$jscomp$inline_74$$ = 0; $JSCompiler_i$jscomp$inline_74$$ < $JSCompiler_str$jscomp$inline_72_JSCompiler_temp$jscomp$8_string$jscomp$8$$.length; $JSCompiler_i$jscomp$inline_74$$++) {
                    let $JSCompiler_charCode$jscomp$inline_75$$ = $JSCompiler_str$jscomp$inline_72_JSCompiler_temp$jscomp$8_string$jscomp$8$$.charCodeAt($JSCompiler_i$jscomp$inline_74$$);
                    $devAssert$$module$src$log$$(255 >= $JSCompiler_charCode$jscomp$inline_75$$);
                    $JSCompiler_bytes$jscomp$inline_73$$[$JSCompiler_i$jscomp$inline_74$$] = $JSCompiler_charCode$jscomp$inline_75$$;
                }
                $JSCompiler_str$jscomp$inline_72_JSCompiler_temp$jscomp$8_string$jscomp$8$$ = $JSCompiler_bytes$jscomp$inline_73$$;
            }
            return $JSCompiler_str$jscomp$inline_72_JSCompiler_temp$jscomp$8_string$jscomp$8$$;
        }
        let $allowedFetchTypes$$module$src$polyfills$fetch$$ = {
            document: 1,
            text: 2
        }, $allowedMethods$$module$src$polyfills$fetch$$ = [ "GET", "POST" ];
        function $fetchPolyfill$$module$src$polyfills$fetch$$($input$jscomp$9$$, $init$jscomp$2$$ = {}) {
            return new Promise((function($resolve$jscomp$7$$, $reject$jscomp$3$$) {
                let $requestMethod$$ = $normalizeMethod$$module$src$polyfills$fetch$$($init$jscomp$2$$.method || "GET"), $xhr$$ = $createXhrRequest$$module$src$polyfills$fetch$$($requestMethod$$, $input$jscomp$9$$);
                "include" == $init$jscomp$2$$.credentials && ($xhr$$.withCredentials = !0);
                $init$jscomp$2$$.responseType in $allowedFetchTypes$$module$src$polyfills$fetch$$ && ($xhr$$.responseType = $init$jscomp$2$$.responseType);
                $init$jscomp$2$$.headers && Object.keys($init$jscomp$2$$.headers).forEach((function($input$jscomp$9$$) {
                    $xhr$$.setRequestHeader($input$jscomp$9$$, $init$jscomp$2$$.headers[$input$jscomp$9$$]);
                }));
                $xhr$$.onreadystatechange = () => {
                    2 > $xhr$$.readyState || (100 > $xhr$$.status || 599 < $xhr$$.status ? ($xhr$$.onreadystatechange = null, 
                    $reject$jscomp$3$$($user$$module$src$log$$().createExpectedError(`Unknown HTTP status ${$xhr$$.status}`))) : 4 == $xhr$$.readyState && $resolve$jscomp$7$$(new $FetchResponse$$module$src$polyfills$fetch$$($xhr$$)));
                };
                $xhr$$.onerror = () => {
                    $reject$jscomp$3$$($user$$module$src$log$$().createExpectedError("Network failure"));
                };
                $xhr$$.onabort = () => {
                    $reject$jscomp$3$$($user$$module$src$log$$().createExpectedError("Request aborted"));
                };
                "POST" == $requestMethod$$ ? $xhr$$.send($init$jscomp$2$$.body) : $xhr$$.send();
            }));
        }
        function $createXhrRequest$$module$src$polyfills$fetch$$($method$jscomp$1$$, $url$jscomp$25$$) {
            let $xhr$jscomp$1$$ = new XMLHttpRequest;
            if ("withCredentials" in $xhr$jscomp$1$$) $xhr$jscomp$1$$.open($method$jscomp$1$$, $url$jscomp$25$$, !0); else throw $dev$$module$src$log$$().createExpectedError("CORS is not supported");
            return $xhr$jscomp$1$$;
        }
        function $JSCompiler_StaticMethods_drainText_$$($JSCompiler_StaticMethods_drainText_$self$$) {
            $devAssert$$module$src$log$$(!$JSCompiler_StaticMethods_drainText_$self$$.bodyUsed);
            $JSCompiler_StaticMethods_drainText_$self$$.bodyUsed = !0;
            return Promise.resolve($JSCompiler_StaticMethods_drainText_$self$$.$xhr_$.responseText);
        }
        class $FetchResponse$$module$src$polyfills$fetch$$ {
            constructor($xhr$jscomp$2$$) {
                this.$xhr_$ = $xhr$jscomp$2$$;
                this.status = this.$xhr_$.status;
                this.statusText = this.$xhr_$.statusText;
                this.ok = 200 <= this.status && 300 > this.status;
                this.headers = new $FetchResponseHeaders$$module$src$polyfills$fetch$$($xhr$jscomp$2$$);
                this.bodyUsed = !1;
                this.body = null;
                this.url = $xhr$jscomp$2$$.responseURL;
            }
            clone() {
                $devAssert$$module$src$log$$(!this.bodyUsed);
                return new $FetchResponse$$module$src$polyfills$fetch$$(this.$xhr_$);
            }
            text() {
                return $JSCompiler_StaticMethods_drainText_$$(this);
            }
            json() {
                return $JSCompiler_StaticMethods_drainText_$$(this).then($parseJson$$module$src$json$$);
            }
            arrayBuffer() {
                return $JSCompiler_StaticMethods_drainText_$$(this).then($utf8Encode$$module$src$utils$bytes$$);
            }
        }
        function $normalizeMethod$$module$src$polyfills$fetch$$($method$jscomp$2$$) {
            if (void 0 === $method$jscomp$2$$) return "GET";
            $method$jscomp$2$$ = $method$jscomp$2$$.toUpperCase();
            $devAssert$$module$src$log$$($allowedMethods$$module$src$polyfills$fetch$$.includes($method$jscomp$2$$));
            return $method$jscomp$2$$;
        }
        class $FetchResponseHeaders$$module$src$polyfills$fetch$$ {
            constructor($xhr$jscomp$3$$) {
                this.$xhr_$ = $xhr$jscomp$3$$;
            }
            get($name$jscomp$85$$) {
                return this.$xhr_$.getResponseHeader($name$jscomp$85$$);
            }
            has($name$jscomp$86$$) {
                return null != this.$xhr_$.getResponseHeader($name$jscomp$86$$);
            }
        }
        class $Response$$module$src$polyfills$fetch$$ extends $FetchResponse$$module$src$polyfills$fetch$$ {
            constructor($body$jscomp$1_data$jscomp$77$$, $init$jscomp$3$$ = {}) {
                let $lowercasedHeaders$$ = $map$$module$src$utils$object$$();
                $body$jscomp$1_data$jscomp$77$$ = {
                    status: 200,
                    statusText: "OK",
                    responseText: $body$jscomp$1_data$jscomp$77$$ ? String($body$jscomp$1_data$jscomp$77$$) : "",
                    getResponseHeader($body$jscomp$1_data$jscomp$77$$) {
                        let $init$jscomp$3$$ = String($body$jscomp$1_data$jscomp$77$$).toLowerCase();
                        return $hasOwn_$$module$src$utils$object$$.call($lowercasedHeaders$$, $init$jscomp$3$$) ? $lowercasedHeaders$$[$init$jscomp$3$$] : null;
                    },
                    ...$init$jscomp$3$$
                };
                $body$jscomp$1_data$jscomp$77$$.status = void 0 === $init$jscomp$3$$.status ? 200 : parseInt($init$jscomp$3$$.status, 10);
                if (Array.isArray($init$jscomp$3$$.headers)) $init$jscomp$3$$.headers.forEach($body$jscomp$1_data$jscomp$77$$ => {
                    let $init$jscomp$3$$ = $body$jscomp$1_data$jscomp$77$$[1];
                    $lowercasedHeaders$$[String($body$jscomp$1_data$jscomp$77$$[0]).toLowerCase()] = String($init$jscomp$3$$);
                }); else if ("[object Object]" === $toString_$$module$src$types$$.call($init$jscomp$3$$.headers)) for (let $body$jscomp$1_data$jscomp$77$$ in $init$jscomp$3$$.headers) $lowercasedHeaders$$[String($body$jscomp$1_data$jscomp$77$$).toLowerCase()] = String($init$jscomp$3$$.headers[$body$jscomp$1_data$jscomp$77$$]);
                $init$jscomp$3$$.statusText && ($body$jscomp$1_data$jscomp$77$$.statusText = String($init$jscomp$3$$.statusText));
                super($body$jscomp$1_data$jscomp$77$$);
            }
        }
        function $layoutRectLtwh$$module$src$layout_rect$$($width$jscomp$26$$, $height$jscomp$25$$) {
            return {
                left: 0,
                top: 0,
                width: $width$jscomp$26$$,
                height: $height$jscomp$25$$,
                bottom: 0 + $height$jscomp$25$$,
                right: 0 + $width$jscomp$26$$,
                x: 0,
                y: 0
            };
        }
        let $nativeClientRect$$module$src$get_bounding_client_rect$$;
        function $getBoundingClientRect$$module$src$get_bounding_client_rect$$() {
            var $JSCompiler_connected$jscomp$inline_78_JSCompiler_inline_result$jscomp$7_JSCompiler_n$jscomp$inline_79$$ = this.isConnected;
            if (void 0 === $JSCompiler_connected$jscomp$inline_78_JSCompiler_inline_result$jscomp$7_JSCompiler_n$jscomp$inline_79$$) {
                $JSCompiler_connected$jscomp$inline_78_JSCompiler_inline_result$jscomp$7_JSCompiler_n$jscomp$inline_79$$ = this;
                do {
                    if ($JSCompiler_connected$jscomp$inline_78_JSCompiler_inline_result$jscomp$7_JSCompiler_n$jscomp$inline_79$$ = $rootNodeFor$$module$src$dom$$($JSCompiler_connected$jscomp$inline_78_JSCompiler_inline_result$jscomp$7_JSCompiler_n$jscomp$inline_79$$), 
                    $JSCompiler_connected$jscomp$inline_78_JSCompiler_inline_result$jscomp$7_JSCompiler_n$jscomp$inline_79$$.host) $JSCompiler_connected$jscomp$inline_78_JSCompiler_inline_result$jscomp$7_JSCompiler_n$jscomp$inline_79$$ = $JSCompiler_connected$jscomp$inline_78_JSCompiler_inline_result$jscomp$7_JSCompiler_n$jscomp$inline_79$$.host; else break;
                } while (1);
                $JSCompiler_connected$jscomp$inline_78_JSCompiler_inline_result$jscomp$7_JSCompiler_n$jscomp$inline_79$$ = $JSCompiler_connected$jscomp$inline_78_JSCompiler_inline_result$jscomp$7_JSCompiler_n$jscomp$inline_79$$.nodeType === Node.DOCUMENT_NODE;
            }
            return $JSCompiler_connected$jscomp$inline_78_JSCompiler_inline_result$jscomp$7_JSCompiler_n$jscomp$inline_79$$ ? $nativeClientRect$$module$src$get_bounding_client_rect$$.call(this) : $layoutRectLtwh$$module$src$layout_rect$$(0, 0);
        }
        function $shouldInstall$$module$src$get_bounding_client_rect$$() {
            var $win$jscomp$24$$ = $JSCompiler_win$jscomp$inline_114$$;
            if (!$win$jscomp$24$$.document) return !1;
            try {
                return 0 !== $win$jscomp$24$$.document.createElement("div").getBoundingClientRect().top;
            } catch ($e$jscomp$18$$) {
                return !0;
            }
        }
        class $LruCache$$module$src$utils$lru_cache$$ {
            constructor($capacity$$) {
                this.$capacity_$ = $capacity$$;
                this.$access_$ = this.$size_$ = 0;
                this.$cache_$ = Object.create(null);
            }
            has($key$jscomp$45$$) {
                return !!this.$cache_$[$key$jscomp$45$$];
            }
            get($key$jscomp$46$$) {
                let $cacheable$$ = this.$cache_$[$key$jscomp$46$$];
                if ($cacheable$$) return $cacheable$$.access = ++this.$access_$, $cacheable$$.payload;
            }
            put($JSCompiler_cache$jscomp$inline_82_key$jscomp$47$$, $payload$$) {
                this.has($JSCompiler_cache$jscomp$inline_82_key$jscomp$47$$) || this.$size_$++;
                this.$cache_$[$JSCompiler_cache$jscomp$inline_82_key$jscomp$47$$] = {
                    payload: $payload$$,
                    access: this.$access_$
                };
                if (!(this.$size_$ <= this.$capacity_$)) {
                    $dev$$module$src$log$$().warn("lru-cache", "Trimming LRU cache");
                    $JSCompiler_cache$jscomp$inline_82_key$jscomp$47$$ = this.$cache_$;
                    var $JSCompiler_oldest$jscomp$inline_83$$ = this.$access_$ + 1;
                    for (let $payload$$ in $JSCompiler_cache$jscomp$inline_82_key$jscomp$47$$) {
                        let {access: $JSCompiler_key$jscomp$inline_85$$} = $JSCompiler_cache$jscomp$inline_82_key$jscomp$47$$[$payload$$];
                        if ($JSCompiler_key$jscomp$inline_85$$ < $JSCompiler_oldest$jscomp$inline_83$$) {
                            $JSCompiler_oldest$jscomp$inline_83$$ = $JSCompiler_key$jscomp$inline_85$$;
                            var $JSCompiler_oldestKey$jscomp$inline_84$$ = $payload$$;
                        }
                    }
                    void 0 !== $JSCompiler_oldestKey$jscomp$inline_84$$ && (delete $JSCompiler_cache$jscomp$inline_82_key$jscomp$47$$[$JSCompiler_oldestKey$jscomp$inline_84$$], 
                    this.$size_$--);
                }
            }
        }
        $dict$$module$src$utils$object$$({
            c: !0,
            v: !0,
            a: !0,
            ad: !0,
            action: !0
        });
        let $a$$module$src$url$$, $cache$$module$src$url$$;
        function $experimentToggles$$module$src$experiments$$($params$jscomp$6_win$jscomp$32$$) {
            if ($params$jscomp$6_win$jscomp$32$$.__AMP__EXPERIMENT_TOGGLES) return $params$jscomp$6_win$jscomp$32$$.__AMP__EXPERIMENT_TOGGLES;
            $params$jscomp$6_win$jscomp$32$$.__AMP__EXPERIMENT_TOGGLES = Object.create(null);
            let $toggles$jscomp$2$$ = $params$jscomp$6_win$jscomp$32$$.__AMP__EXPERIMENT_TOGGLES;
            if ($params$jscomp$6_win$jscomp$32$$.AMP_CONFIG) for (var $allowed$jscomp$1_experimentId$jscomp$2_i$jscomp$27$$ in $params$jscomp$6_win$jscomp$32$$.AMP_CONFIG) {
                let $frequency$$ = $params$jscomp$6_win$jscomp$32$$.AMP_CONFIG[$allowed$jscomp$1_experimentId$jscomp$2_i$jscomp$27$$];
                "number" === typeof $frequency$$ && 0 <= $frequency$$ && 1 >= $frequency$$ && ($toggles$jscomp$2$$[$allowed$jscomp$1_experimentId$jscomp$2_i$jscomp$27$$] = Math.random() < $frequency$$);
            }
            if ($params$jscomp$6_win$jscomp$32$$.AMP_CONFIG && Array.isArray($params$jscomp$6_win$jscomp$32$$.AMP_CONFIG["allow-doc-opt-in"]) && 0 < $params$jscomp$6_win$jscomp$32$$.AMP_CONFIG["allow-doc-opt-in"].length) {
                let $allowed$$ = $params$jscomp$6_win$jscomp$32$$.AMP_CONFIG["allow-doc-opt-in"], $meta$$ = $params$jscomp$6_win$jscomp$32$$.document.head.querySelector('meta[name="amp-experiments-opt-in"]');
                if ($meta$$) {
                    let $params$jscomp$6_win$jscomp$32$$ = $meta$$.getAttribute("content").split(",");
                    for ($allowed$jscomp$1_experimentId$jscomp$2_i$jscomp$27$$ = 0; $allowed$jscomp$1_experimentId$jscomp$2_i$jscomp$27$$ < $params$jscomp$6_win$jscomp$32$$.length; $allowed$jscomp$1_experimentId$jscomp$2_i$jscomp$27$$++) -1 != $allowed$$.indexOf($params$jscomp$6_win$jscomp$32$$[$allowed$jscomp$1_experimentId$jscomp$2_i$jscomp$27$$]) && ($toggles$jscomp$2$$[$params$jscomp$6_win$jscomp$32$$[$allowed$jscomp$1_experimentId$jscomp$2_i$jscomp$27$$]] = !0);
                }
            }
            Object.assign($toggles$jscomp$2$$, $getExperimentToggles$$module$src$experiments$$($params$jscomp$6_win$jscomp$32$$));
            if ($params$jscomp$6_win$jscomp$32$$.AMP_CONFIG && Array.isArray($params$jscomp$6_win$jscomp$32$$.AMP_CONFIG["allow-url-opt-in"]) && 0 < $params$jscomp$6_win$jscomp$32$$.AMP_CONFIG["allow-url-opt-in"].length) {
                $allowed$jscomp$1_experimentId$jscomp$2_i$jscomp$27$$ = $params$jscomp$6_win$jscomp$32$$.AMP_CONFIG["allow-url-opt-in"];
                $params$jscomp$6_win$jscomp$32$$ = $parseQueryString_$$module$src$url_parse_query_string$$($params$jscomp$6_win$jscomp$32$$.location.originalHash || $params$jscomp$6_win$jscomp$32$$.location.hash);
                for (let $i$jscomp$28$$ = 0; $i$jscomp$28$$ < $allowed$jscomp$1_experimentId$jscomp$2_i$jscomp$27$$.length; $i$jscomp$28$$++) {
                    let $param$jscomp$7$$ = $params$jscomp$6_win$jscomp$32$$[`e-${$allowed$jscomp$1_experimentId$jscomp$2_i$jscomp$27$$[$i$jscomp$28$$]}`];
                    "1" == $param$jscomp$7$$ && ($toggles$jscomp$2$$[$allowed$jscomp$1_experimentId$jscomp$2_i$jscomp$27$$[$i$jscomp$28$$]] = !0);
                    "0" == $param$jscomp$7$$ && ($toggles$jscomp$2$$[$allowed$jscomp$1_experimentId$jscomp$2_i$jscomp$27$$[$i$jscomp$28$$]] = !1);
                }
            }
            return $toggles$jscomp$2$$;
        }
        function $getExperimentToggles$$module$src$experiments$$($toggles$jscomp$3_win$jscomp$34$$) {
            let $experimentsString$$ = "";
            try {
                "localStorage" in $toggles$jscomp$3_win$jscomp$34$$ && ($experimentsString$$ = $toggles$jscomp$3_win$jscomp$34$$.localStorage.getItem("amp-experiment-toggles"));
            } catch ($e$jscomp$19$$) {
                $dev$$module$src$log$$().warn("EXPERIMENTS", "Failed to retrieve experiments from localStorage.");
            }
            let $tokens$$ = $experimentsString$$ ? $experimentsString$$.split(/\s*,\s*/g) : [];
            $toggles$jscomp$3_win$jscomp$34$$ = Object.create(null);
            for (let $experimentsString$$ = 0; $experimentsString$$ < $tokens$$.length; $experimentsString$$++) 0 != $tokens$$[$experimentsString$$].length && ("-" == $tokens$$[$experimentsString$$][0] ? $toggles$jscomp$3_win$jscomp$34$$[$tokens$$[$experimentsString$$].substr(1)] = !1 : $toggles$jscomp$3_win$jscomp$34$$[$tokens$$[$experimentsString$$]] = !0);
            return $toggles$jscomp$3_win$jscomp$34$$;
        }
        let $EXPERIMENT_INFO_MAP$$module$src$ampdoc_fie$$ = {
            ["ampdoc-fie"]: {
                isTrafficEligible: () => !0,
                branches: [ [ "21065001" ], [ "21065002" ] ]
            }
        };
        function $registerServiceBuilder$$module$src$service$$($win$jscomp$45$$, $id$jscomp$10$$, $constructor$jscomp$2$$) {
            $win$jscomp$45$$ = $getTopWindow$$module$src$service$$($win$jscomp$45$$);
            $registerServiceInternal$$module$src$service$$($win$jscomp$45$$, $win$jscomp$45$$, $id$jscomp$10$$, $constructor$jscomp$2$$);
        }
        function $getService$$module$src$service$$($win$jscomp$46$$, $id$jscomp$13$$) {
            $win$jscomp$46$$ = $getTopWindow$$module$src$service$$($win$jscomp$46$$);
            return $getServiceInternal$$module$src$service$$($win$jscomp$46$$, $id$jscomp$13$$);
        }
        function $getServiceForDoc$$module$src$service$$($elementOrAmpDoc$$, $id$jscomp$17$$) {
            var $ampdoc$jscomp$3_holder$jscomp$2$$ = $getAmpdoc$$module$src$service$$($elementOrAmpDoc$$);
            $ampdoc$jscomp$3_holder$jscomp$2$$ = $getAmpdocServiceHolder$$module$src$service$$($ampdoc$jscomp$3_holder$jscomp$2$$);
            return $getServiceInternal$$module$src$service$$($ampdoc$jscomp$3_holder$jscomp$2$$, $id$jscomp$17$$);
        }
        function $getTopWindow$$module$src$service$$($win$jscomp$52$$) {
            return $win$jscomp$52$$.__AMP_TOP || ($win$jscomp$52$$.__AMP_TOP = $win$jscomp$52$$);
        }
        function $getParentWindowFrameElement$$module$src$service$$($node$jscomp$15_topWin$jscomp$2$$, $opt_topWin$$) {
            let $childWin$$ = ($node$jscomp$15_topWin$jscomp$2$$.ownerDocument || $node$jscomp$15_topWin$jscomp$2$$).defaultView;
            $node$jscomp$15_topWin$jscomp$2$$ = $opt_topWin$$ || $getTopWindow$$module$src$service$$($childWin$$);
            if ($childWin$$ && $childWin$$ != $node$jscomp$15_topWin$jscomp$2$$ && $getTopWindow$$module$src$service$$($childWin$$) == $node$jscomp$15_topWin$jscomp$2$$) try {
                return $childWin$$.frameElement;
            } catch ($e$jscomp$21$$) {}
            return null;
        }
        function $getAmpdoc$$module$src$service$$($nodeOrDoc$jscomp$2$$) {
            return $nodeOrDoc$jscomp$2$$.nodeType ? $getService$$module$src$service$$(($nodeOrDoc$jscomp$2$$.ownerDocument || $nodeOrDoc$jscomp$2$$).defaultView, "ampdoc").getAmpDoc($nodeOrDoc$jscomp$2$$) : $nodeOrDoc$jscomp$2$$;
        }
        function $getAmpdocServiceHolder$$module$src$service$$($ampdoc$jscomp$5_nodeOrDoc$jscomp$3$$) {
            $ampdoc$jscomp$5_nodeOrDoc$jscomp$3$$ = $getAmpdoc$$module$src$service$$($ampdoc$jscomp$5_nodeOrDoc$jscomp$3$$);
            return $ampdoc$jscomp$5_nodeOrDoc$jscomp$3$$.isSingleDoc() ? $ampdoc$jscomp$5_nodeOrDoc$jscomp$3$$.win : $ampdoc$jscomp$5_nodeOrDoc$jscomp$3$$;
        }
        function $getServiceInternal$$module$src$service$$($holder$jscomp$4_s$jscomp$11$$, $id$jscomp$21$$) {
            var $JSCompiler_inline_result$jscomp$13_JSCompiler_service$jscomp$inline_90$$ = $holder$jscomp$4_s$jscomp$11$$.__AMP_SERVICES && $holder$jscomp$4_s$jscomp$11$$.__AMP_SERVICES[$id$jscomp$21$$];
            $JSCompiler_inline_result$jscomp$13_JSCompiler_service$jscomp$inline_90$$ = !(!$JSCompiler_inline_result$jscomp$13_JSCompiler_service$jscomp$inline_90$$ || !$JSCompiler_inline_result$jscomp$13_JSCompiler_service$jscomp$inline_90$$.ctor && !$JSCompiler_inline_result$jscomp$13_JSCompiler_service$jscomp$inline_90$$.obj);
            $devAssert$$module$src$log$$($JSCompiler_inline_result$jscomp$13_JSCompiler_service$jscomp$inline_90$$);
            $holder$jscomp$4_s$jscomp$11$$ = $getServices$$module$src$service$$($holder$jscomp$4_s$jscomp$11$$)[$id$jscomp$21$$];
            $holder$jscomp$4_s$jscomp$11$$.obj || ($devAssert$$module$src$log$$($holder$jscomp$4_s$jscomp$11$$.ctor), 
            $devAssert$$module$src$log$$($holder$jscomp$4_s$jscomp$11$$.context), $holder$jscomp$4_s$jscomp$11$$.obj = new $holder$jscomp$4_s$jscomp$11$$.ctor($holder$jscomp$4_s$jscomp$11$$.context), 
            $devAssert$$module$src$log$$($holder$jscomp$4_s$jscomp$11$$.obj), $holder$jscomp$4_s$jscomp$11$$.ctor = null, 
            $holder$jscomp$4_s$jscomp$11$$.context = null, $holder$jscomp$4_s$jscomp$11$$.resolve && $holder$jscomp$4_s$jscomp$11$$.resolve($holder$jscomp$4_s$jscomp$11$$.obj));
            return $holder$jscomp$4_s$jscomp$11$$.obj;
        }
        function $registerServiceInternal$$module$src$service$$($holder$jscomp$5$$, $context$jscomp$1$$, $id$jscomp$22$$, $ctor$jscomp$6$$) {
            let $services$jscomp$1$$ = $getServices$$module$src$service$$($holder$jscomp$5$$);
            let $s$jscomp$12$$ = $services$jscomp$1$$[$id$jscomp$22$$];
            $s$jscomp$12$$ || ($s$jscomp$12$$ = $services$jscomp$1$$[$id$jscomp$22$$] = {
                obj: null,
                promise: null,
                resolve: null,
                reject: null,
                context: null,
                ctor: null
            });
            $s$jscomp$12$$.ctor || $s$jscomp$12$$.obj || ($s$jscomp$12$$.ctor = $ctor$jscomp$6$$, 
            $s$jscomp$12$$.context = $context$jscomp$1$$, $s$jscomp$12$$.resolve && $getServiceInternal$$module$src$service$$($holder$jscomp$5$$, $id$jscomp$22$$));
        }
        function $getServicePromiseInternal$$module$src$service$$($holder$jscomp$6_services$jscomp$2$$, $id$jscomp$23$$) {
            let $cached$$ = $getServicePromiseOrNullInternal$$module$src$service$$($holder$jscomp$6_services$jscomp$2$$, $id$jscomp$23$$);
            if ($cached$$) return $cached$$;
            $holder$jscomp$6_services$jscomp$2$$ = $getServices$$module$src$service$$($holder$jscomp$6_services$jscomp$2$$);
            $holder$jscomp$6_services$jscomp$2$$[$id$jscomp$23$$] = $emptyServiceHolderWithPromise$$module$src$service$$();
            return $holder$jscomp$6_services$jscomp$2$$[$id$jscomp$23$$].promise;
        }
        function $getServicePromiseOrNullInternal$$module$src$service$$($holder$jscomp$8$$, $id$jscomp$25$$) {
            let $s$jscomp$14$$ = $getServices$$module$src$service$$($holder$jscomp$8$$)[$id$jscomp$25$$];
            if ($s$jscomp$14$$) {
                if ($s$jscomp$14$$.promise) return $s$jscomp$14$$.promise;
                $getServiceInternal$$module$src$service$$($holder$jscomp$8$$, $id$jscomp$25$$);
                return $s$jscomp$14$$.promise = Promise.resolve($s$jscomp$14$$.obj);
            }
            return null;
        }
        function $getServices$$module$src$service$$($holder$jscomp$9$$) {
            let $services$jscomp$5$$ = $holder$jscomp$9$$.__AMP_SERVICES;
            $services$jscomp$5$$ || ($services$jscomp$5$$ = $holder$jscomp$9$$.__AMP_SERVICES = {});
            return $services$jscomp$5$$;
        }
        function $emptyServiceHolderWithPromise$$module$src$service$$() {
            var $deferred$jscomp$3_reject$jscomp$4$$ = new $Deferred$$module$src$utils$promise$$;
            let $promise$jscomp$2$$ = $deferred$jscomp$3_reject$jscomp$4$$.promise, $resolve$jscomp$8$$ = $deferred$jscomp$3_reject$jscomp$4$$.resolve;
            $deferred$jscomp$3_reject$jscomp$4$$ = $deferred$jscomp$3_reject$jscomp$4$$.reject;
            $promise$jscomp$2$$.catch(() => {});
            return {
                obj: null,
                promise: $promise$jscomp$2$$,
                resolve: $resolve$jscomp$8$$,
                reject: $deferred$jscomp$3_reject$jscomp$4$$,
                context: null,
                ctor: null
            };
        }
        function $getElementServiceIfAvailableForDoc$$module$src$element_service$$($element$jscomp$39$$) {
            let $s$jscomp$16$$ = $getServicePromiseOrNullInternal$$module$src$service$$($getAmpdocServiceHolder$$module$src$service$$($element$jscomp$39$$), "amp-analytics-instrumentation");
            if ($s$jscomp$16$$) return $s$jscomp$16$$;
            let $ampdoc$jscomp$9$$ = $getAmpdoc$$module$src$service$$($element$jscomp$39$$);
            return $ampdoc$jscomp$9$$.waitForBodyOpen().then(() => {
                var $element$jscomp$39$$ = $ampdoc$jscomp$9$$.win;
                var $s$jscomp$16$$ = $ampdoc$jscomp$9$$.win.document.head;
                if ($s$jscomp$16$$) {
                    var $JSCompiler_inline_result$jscomp$251_JSCompiler_scripts$jscomp$inline_255$$ = {};
                    $s$jscomp$16$$ = $s$jscomp$16$$.querySelectorAll("script[custom-element],script[custom-template]");
                    for (let $element$jscomp$39$$ = 0; $element$jscomp$39$$ < $s$jscomp$16$$.length; $element$jscomp$39$$++) {
                        var $JSCompiler_name$jscomp$inline_259_JSCompiler_script$jscomp$inline_258$$ = $s$jscomp$16$$[$element$jscomp$39$$];
                        $JSCompiler_name$jscomp$inline_259_JSCompiler_script$jscomp$inline_258$$ = $JSCompiler_name$jscomp$inline_259_JSCompiler_script$jscomp$inline_258$$.getAttribute("custom-element") || $JSCompiler_name$jscomp$inline_259_JSCompiler_script$jscomp$inline_258$$.getAttribute("custom-template");
                        $JSCompiler_inline_result$jscomp$251_JSCompiler_scripts$jscomp$inline_255$$[$JSCompiler_name$jscomp$inline_259_JSCompiler_script$jscomp$inline_258$$] = !0;
                    }
                    $JSCompiler_inline_result$jscomp$251_JSCompiler_scripts$jscomp$inline_255$$ = Object.keys($JSCompiler_inline_result$jscomp$251_JSCompiler_scripts$jscomp$inline_255$$);
                } else $JSCompiler_inline_result$jscomp$251_JSCompiler_scripts$jscomp$inline_255$$ = [];
                return $JSCompiler_inline_result$jscomp$251_JSCompiler_scripts$jscomp$inline_255$$.includes("amp-analytics") ? $getService$$module$src$service$$($element$jscomp$39$$, "extensions").waitForExtension($element$jscomp$39$$, "amp-analytics") : $resolvedPromise$$module$src$resolved_promise$$();
            }).then(() => {
                var $s$jscomp$16$$ = $ampdoc$jscomp$9$$.win;
                return $s$jscomp$16$$.__AMP_EXTENDED_ELEMENTS && $s$jscomp$16$$.__AMP_EXTENDED_ELEMENTS["amp-analytics"] ? $getServicePromiseInternal$$module$src$service$$($getAmpdocServiceHolder$$module$src$service$$($element$jscomp$39$$), "amp-analytics-instrumentation") : null;
            });
        }
        function $Services$$module$src$services$ampdocServiceFor$$($window$jscomp$1$$) {
            return $getService$$module$src$service$$($window$jscomp$1$$, "ampdoc");
        }
        class $IntersectionObserverStub$$module$src$polyfillstub$intersection_observer_stub$$ {
            constructor($callback$jscomp$59_root$jscomp$11$$, $options$jscomp$33$$) {
                this.$callback_$ = $callback$jscomp$59_root$jscomp$11$$;
                this.$options_$ = {
                    root: null,
                    rootMargin: "0px 0px 0px 0px",
                    ...$options$jscomp$33$$
                };
                if (($callback$jscomp$59_root$jscomp$11$$ = this.$options_$.root) && 1 !== $callback$jscomp$59_root$jscomp$11$$.nodeType) throw Error("root must be an Element");
                this.$elements_$ = [];
                this.$inst_$ = null;
                $IntersectionObserverStub$$module$src$polyfillstub$intersection_observer_stub$$._upgraders.push(this.$upgrade_$.bind(this));
            }
            get root() {
                return this.$inst_$ ? this.$inst_$.root : this.$options_$.root || null;
            }
            get rootMargin() {
                return this.$inst_$ ? this.$inst_$.rootMargin : this.$options_$.rootMargin;
            }
            get thresholds() {
                return this.$inst_$ ? this.$inst_$.thresholds : [].concat(this.$options_$.threshold || 0);
            }
            disconnect() {
                this.$inst_$ ? this.$inst_$.disconnect() : this.$elements_$.length = 0;
            }
            takeRecords() {
                return this.$inst_$ ? this.$inst_$.takeRecords() : [];
            }
            observe($target$jscomp$92$$) {
                this.$inst_$ ? this.$inst_$.observe($target$jscomp$92$$) : -1 == this.$elements_$.indexOf($target$jscomp$92$$) && this.$elements_$.push($target$jscomp$92$$);
            }
            unobserve($index$jscomp$77_target$jscomp$93$$) {
                this.$inst_$ ? this.$inst_$.unobserve($index$jscomp$77_target$jscomp$93$$) : ($index$jscomp$77_target$jscomp$93$$ = this.$elements_$.indexOf($index$jscomp$77_target$jscomp$93$$), 
                -1 != $index$jscomp$77_target$jscomp$93$$ && this.$elements_$.splice($index$jscomp$77_target$jscomp$93$$, 1));
            }
            $upgrade_$($constr$$) {
                let $inst$$ = new $constr$$(this.$callback_$, this.$options_$);
                this.$inst_$ = $inst$$;
                this.$elements_$.forEach($constr$$ => $inst$$.observe($constr$$));
                this.$elements_$ = null;
            }
        }
        $IntersectionObserverStub$$module$src$polyfillstub$intersection_observer_stub$$._upgraders = [];
        function $fixEntry$$module$src$polyfills$intersection_observer$$() {
            var $win$jscomp$77$$ = $JSCompiler_win$jscomp$inline_126$$;
            !$win$jscomp$77$$.IntersectionObserverEntry || "isIntersecting" in $win$jscomp$77$$.IntersectionObserverEntry.prototype || Object.defineProperty($win$jscomp$77$$.IntersectionObserverEntry.prototype, "isIntersecting", {
                enumerable: !0,
                configurable: !0,
                get() {
                    return 0 < this.intersectionRatio;
                }
            });
        }
        function $sign$$module$src$polyfills$math_sign$$($x$jscomp$82$$) {
            return ($x$jscomp$82$$ = Number($x$jscomp$82$$)) ? 0 < $x$jscomp$82$$ ? 1 : -1 : $x$jscomp$82$$;
        }
        let $hasOwnProperty$$module$src$polyfills$object_assign$$ = Object.prototype.hasOwnProperty;
        function $assign$$module$src$polyfills$object_assign$$($target$jscomp$94$$, $var_args$jscomp$46$$) {
            if (null == $target$jscomp$94$$) throw new TypeError("Cannot convert undefined or null to object");
            let $output$jscomp$2$$ = Object($target$jscomp$94$$);
            for (let $target$jscomp$94$$ = 1; $target$jscomp$94$$ < arguments.length; $target$jscomp$94$$++) {
                let $var_args$jscomp$46$$ = arguments[$target$jscomp$94$$];
                if (null != $var_args$jscomp$46$$) for (let $target$jscomp$94$$ in $var_args$jscomp$46$$) $hasOwnProperty$$module$src$polyfills$object_assign$$.call($var_args$jscomp$46$$, $target$jscomp$94$$) && ($output$jscomp$2$$[$target$jscomp$94$$] = $var_args$jscomp$46$$[$target$jscomp$94$$]);
            }
            return $output$jscomp$2$$;
        }
        function $values$$module$src$polyfills$object_values$$($target$jscomp$95$$) {
            return Object.keys($target$jscomp$95$$).map($k$jscomp$6$$ => $target$jscomp$95$$[$k$jscomp$6$$]);
        }
        function $Promise$$module$node_modules$promise_pjs$promise_mjs$$($resolver$jscomp$1$$) {
            if (!(this instanceof $Promise$$module$node_modules$promise_pjs$promise_mjs$$)) throw new TypeError("Constructor Promise requires `new`");
            if (!$isFunction$$module$node_modules$promise_pjs$promise_mjs$$($resolver$jscomp$1$$)) throw new TypeError("Must pass resolver function");
            this._state = $PendingPromise$$module$node_modules$promise_pjs$promise_mjs$$;
            this._value = [];
            this._isChainEnd = !0;
            $doResolve$$module$node_modules$promise_pjs$promise_mjs$$(this, $adopter$$module$node_modules$promise_pjs$promise_mjs$$(this, $FulfilledPromise$$module$node_modules$promise_pjs$promise_mjs$$), $adopter$$module$node_modules$promise_pjs$promise_mjs$$(this, $RejectedPromise$$module$node_modules$promise_pjs$promise_mjs$$), {
                then: $resolver$jscomp$1$$
            });
        }
        $Promise$$module$node_modules$promise_pjs$promise_mjs$$.prototype.then = function($onFulfilled$jscomp$1$$, $onRejected$jscomp$2$$) {
            $onFulfilled$jscomp$1$$ = $isFunction$$module$node_modules$promise_pjs$promise_mjs$$($onFulfilled$jscomp$1$$) ? $onFulfilled$jscomp$1$$ : void 0;
            $onRejected$jscomp$2$$ = $isFunction$$module$node_modules$promise_pjs$promise_mjs$$($onRejected$jscomp$2$$) ? $onRejected$jscomp$2$$ : void 0;
            if ($onFulfilled$jscomp$1$$ || $onRejected$jscomp$2$$) this._isChainEnd = !1;
            return this._state(this._value, $onFulfilled$jscomp$1$$, $onRejected$jscomp$2$$);
        };
        $Promise$$module$node_modules$promise_pjs$promise_mjs$$.prototype.catch = function($onRejected$jscomp$3$$) {
            return this.then(void 0, $onRejected$jscomp$3$$);
        };
        function $Promise$$module$node_modules$promise_pjs$promise_mjs$resolve$$($value$jscomp$101$$) {
            return $value$jscomp$101$$ === Object($value$jscomp$101$$) && $value$jscomp$101$$ instanceof this ? $value$jscomp$101$$ : new this((function($resolve$jscomp$9$$) {
                $resolve$jscomp$9$$($value$jscomp$101$$);
            }));
        }
        function $Promise$$module$node_modules$promise_pjs$promise_mjs$reject$$($reason$jscomp$7$$) {
            return new this((function($_$$, $reject$jscomp$5$$) {
                $reject$jscomp$5$$($reason$jscomp$7$$);
            }));
        }
        function $Promise$$module$node_modules$promise_pjs$promise_mjs$all$$($promises$jscomp$1$$) {
            var $Constructor$jscomp$2$$ = this;
            return new $Constructor$jscomp$2$$((function($resolve$jscomp$10$$, $reject$jscomp$6$$) {
                var $length$jscomp$19$$ = $promises$jscomp$1$$.length, $values$jscomp$11$$ = Array($length$jscomp$19$$);
                if (0 === $length$jscomp$19$$) return $resolve$jscomp$10$$($values$jscomp$11$$);
                $each$$module$node_modules$promise_pjs$promise_mjs$$($promises$jscomp$1$$, (function($promises$jscomp$1$$, $index$jscomp$78$$) {
                    $Constructor$jscomp$2$$.resolve($promises$jscomp$1$$).then((function($promises$jscomp$1$$) {
                        $values$jscomp$11$$[$index$jscomp$78$$] = $promises$jscomp$1$$;
                        0 === --$length$jscomp$19$$ && $resolve$jscomp$10$$($values$jscomp$11$$);
                    }), $reject$jscomp$6$$);
                }));
            }));
        }
        function $Promise$$module$node_modules$promise_pjs$promise_mjs$race$$($promises$jscomp$2$$) {
            var $Constructor$jscomp$3$$ = this;
            return new $Constructor$jscomp$3$$((function($resolve$jscomp$11$$, $reject$jscomp$7$$) {
                for (var $i$jscomp$32$$ = 0; $i$jscomp$32$$ < $promises$jscomp$2$$.length; $i$jscomp$32$$++) $Constructor$jscomp$3$$.resolve($promises$jscomp$2$$[$i$jscomp$32$$]).then($resolve$jscomp$11$$, $reject$jscomp$7$$);
            }));
        }
        function $FulfilledPromise$$module$node_modules$promise_pjs$promise_mjs$$($value$jscomp$103$$, $JSCompiler_promise$jscomp$inline_102_onFulfilled$jscomp$2$$, $unused$jscomp$1$$, $deferred$jscomp$4$$) {
            if (!$JSCompiler_promise$jscomp$inline_102_onFulfilled$jscomp$2$$) return $deferred$jscomp$4$$ && ($JSCompiler_promise$jscomp$inline_102_onFulfilled$jscomp$2$$ = $deferred$jscomp$4$$.promise, 
            $JSCompiler_promise$jscomp$inline_102_onFulfilled$jscomp$2$$._state = $FulfilledPromise$$module$node_modules$promise_pjs$promise_mjs$$, 
            $JSCompiler_promise$jscomp$inline_102_onFulfilled$jscomp$2$$._value = $value$jscomp$103$$), 
            this;
            $deferred$jscomp$4$$ || ($deferred$jscomp$4$$ = new $Deferred$$module$node_modules$promise_pjs$promise_mjs$$(this.constructor));
            $defer$$module$node_modules$promise_pjs$promise_mjs$$($tryCatchDeferred$$module$node_modules$promise_pjs$promise_mjs$$($deferred$jscomp$4$$, $JSCompiler_promise$jscomp$inline_102_onFulfilled$jscomp$2$$, $value$jscomp$103$$));
            return $deferred$jscomp$4$$.promise;
        }
        function $RejectedPromise$$module$node_modules$promise_pjs$promise_mjs$$($reason$jscomp$9$$, $JSCompiler_promise$jscomp$inline_107_unused$jscomp$2$$, $onRejected$jscomp$4$$, $deferred$jscomp$5$$) {
            if (!$onRejected$jscomp$4$$) return $deferred$jscomp$5$$ && ($JSCompiler_promise$jscomp$inline_107_unused$jscomp$2$$ = $deferred$jscomp$5$$.promise, 
            $JSCompiler_promise$jscomp$inline_107_unused$jscomp$2$$._state = $RejectedPromise$$module$node_modules$promise_pjs$promise_mjs$$, 
            $JSCompiler_promise$jscomp$inline_107_unused$jscomp$2$$._value = $reason$jscomp$9$$), 
            this;
            $deferred$jscomp$5$$ || ($deferred$jscomp$5$$ = new $Deferred$$module$node_modules$promise_pjs$promise_mjs$$(this.constructor));
            $defer$$module$node_modules$promise_pjs$promise_mjs$$($tryCatchDeferred$$module$node_modules$promise_pjs$promise_mjs$$($deferred$jscomp$5$$, $onRejected$jscomp$4$$, $reason$jscomp$9$$));
            return $deferred$jscomp$5$$.promise;
        }
        function $PendingPromise$$module$node_modules$promise_pjs$promise_mjs$$($queue$jscomp$2$$, $onFulfilled$jscomp$3$$, $onRejected$jscomp$5$$, $deferred$jscomp$6$$) {
            if (!$deferred$jscomp$6$$) {
                if (!$onFulfilled$jscomp$3$$ && !$onRejected$jscomp$5$$) return this;
                $deferred$jscomp$6$$ = new $Deferred$$module$node_modules$promise_pjs$promise_mjs$$(this.constructor);
            }
            $queue$jscomp$2$$.push({
                deferred: $deferred$jscomp$6$$,
                onFulfilled: $onFulfilled$jscomp$3$$ || $deferred$jscomp$6$$.resolve,
                onRejected: $onRejected$jscomp$5$$ || $deferred$jscomp$6$$.reject
            });
            return $deferred$jscomp$6$$.promise;
        }
        function $Deferred$$module$node_modules$promise_pjs$promise_mjs$$($Promise$jscomp$2$$) {
            var $deferred$jscomp$7$$ = this;
            this.promise = new $Promise$jscomp$2$$((function($Promise$jscomp$2$$, $reject$jscomp$8$$) {
                $deferred$jscomp$7$$.resolve = $Promise$jscomp$2$$;
                $deferred$jscomp$7$$.reject = $reject$jscomp$8$$;
            }));
            return $deferred$jscomp$7$$;
        }
        function $adopt$$module$node_modules$promise_pjs$promise_mjs$$($promise$jscomp$9$$, $state$$, $value$jscomp$104$$, $adoptee$$) {
            var $queue$jscomp$3$$ = $promise$jscomp$9$$._value;
            $promise$jscomp$9$$._state = $state$$;
            $promise$jscomp$9$$._value = $value$jscomp$104$$;
            $adoptee$$ && $state$$ === $PendingPromise$$module$node_modules$promise_pjs$promise_mjs$$ && $adoptee$$._state($value$jscomp$104$$, void 0, void 0, {
                promise: $promise$jscomp$9$$,
                resolve: void 0,
                reject: void 0
            });
            for (var $i$jscomp$33$$ = 0; $i$jscomp$33$$ < $queue$jscomp$3$$.length; $i$jscomp$33$$++) {
                var $next$$ = $queue$jscomp$3$$[$i$jscomp$33$$];
                $promise$jscomp$9$$._state($value$jscomp$104$$, $next$$.onFulfilled, $next$$.onRejected, $next$$.deferred);
            }
            $queue$jscomp$3$$.length = 0;
            $state$$ === $RejectedPromise$$module$node_modules$promise_pjs$promise_mjs$$ && $promise$jscomp$9$$._isChainEnd && setTimeout((function() {
                if ($promise$jscomp$9$$._isChainEnd) throw $value$jscomp$104$$;
            }), 0);
        }
        function $adopter$$module$node_modules$promise_pjs$promise_mjs$$($promise$jscomp$10$$, $state$jscomp$1$$) {
            return function($value$jscomp$105$$) {
                $adopt$$module$node_modules$promise_pjs$promise_mjs$$($promise$jscomp$10$$, $state$jscomp$1$$, $value$jscomp$105$$);
            };
        }
        function $noop$$module$node_modules$promise_pjs$promise_mjs$$() {}
        function $isFunction$$module$node_modules$promise_pjs$promise_mjs$$($fn$jscomp$4$$) {
            return "function" === typeof $fn$jscomp$4$$;
        }
        function $each$$module$node_modules$promise_pjs$promise_mjs$$($collection$$, $iterator$jscomp$6$$) {
            for (var $i$jscomp$34$$ = 0; $i$jscomp$34$$ < $collection$$.length; $i$jscomp$34$$++) $iterator$jscomp$6$$($collection$$[$i$jscomp$34$$], $i$jscomp$34$$);
        }
        function $tryCatchDeferred$$module$node_modules$promise_pjs$promise_mjs$$($deferred$jscomp$9$$, $fn$jscomp$5$$, $arg$jscomp$9$$) {
            var $promise$jscomp$12$$ = $deferred$jscomp$9$$.promise, $resolve$jscomp$13$$ = $deferred$jscomp$9$$.resolve, $reject$jscomp$9$$ = $deferred$jscomp$9$$.reject;
            return function() {
                try {
                    var $deferred$jscomp$9$$ = $fn$jscomp$5$$($arg$jscomp$9$$);
                    $doResolve$$module$node_modules$promise_pjs$promise_mjs$$($promise$jscomp$12$$, $resolve$jscomp$13$$, $reject$jscomp$9$$, $deferred$jscomp$9$$, $deferred$jscomp$9$$);
                } catch ($e$jscomp$24$$) {
                    $reject$jscomp$9$$($e$jscomp$24$$);
                }
            };
        }
        var $defer$$module$node_modules$promise_pjs$promise_mjs$$ = function() {
            function $flush$$() {
                for (var $flush$$ = 0; $flush$$ < $length$jscomp$20$$; $flush$$++) {
                    var $scheduleFlush$$ = $queue$jscomp$4$$[$flush$$];
                    $queue$jscomp$4$$[$flush$$] = null;
                    $scheduleFlush$$();
                }
                $length$jscomp$20$$ = 0;
            }
            if ("undefined" !== typeof window && window.postMessage) {
                window.addEventListener("message", $flush$$);
                var $scheduleFlush$$ = function() {
                    window.postMessage("macro-task", "*");
                };
            } else $scheduleFlush$$ = function() {
                setTimeout($flush$$, 0);
            };
            var $queue$jscomp$4$$ = Array(16), $length$jscomp$20$$ = 0;
            return function($flush$$) {
                0 === $length$jscomp$20$$ && $scheduleFlush$$();
                $queue$jscomp$4$$[$length$jscomp$20$$++] = $flush$$;
            };
        }();
        function $doResolve$$module$node_modules$promise_pjs$promise_mjs$$($promise$jscomp$13$$, $resolve$jscomp$14$$, $reject$jscomp$10$$, $value$jscomp$107$$, $context$jscomp$2$$) {
            var $then$$, $_reject$$ = $reject$jscomp$10$$;
            try {
                if ($value$jscomp$107$$ === $promise$jscomp$13$$) throw new TypeError("Cannot fulfill promise with itself");
                var $isObj$$ = $value$jscomp$107$$ === Object($value$jscomp$107$$);
                if ($isObj$$ && $value$jscomp$107$$ instanceof $promise$jscomp$13$$.constructor) $adopt$$module$node_modules$promise_pjs$promise_mjs$$($promise$jscomp$13$$, $value$jscomp$107$$._state, $value$jscomp$107$$._value, $value$jscomp$107$$); else if ($isObj$$ && ($then$$ = $value$jscomp$107$$.then) && $isFunction$$module$node_modules$promise_pjs$promise_mjs$$($then$$)) {
                    var $_resolve$$ = function($value$jscomp$107$$) {
                        $_resolve$$ = $_reject$$ = $noop$$module$node_modules$promise_pjs$promise_mjs$$;
                        $doResolve$$module$node_modules$promise_pjs$promise_mjs$$($promise$jscomp$13$$, $resolve$jscomp$14$$, $reject$jscomp$10$$, $value$jscomp$107$$, $value$jscomp$107$$);
                    };
                    $_reject$$ = function($promise$jscomp$13$$) {
                        $_resolve$$ = $_reject$$ = $noop$$module$node_modules$promise_pjs$promise_mjs$$;
                        $reject$jscomp$10$$($promise$jscomp$13$$);
                    };
                    $then$$.call($context$jscomp$2$$, (function($promise$jscomp$13$$) {
                        $_resolve$$($promise$jscomp$13$$);
                    }), (function($promise$jscomp$13$$) {
                        $_reject$$($promise$jscomp$13$$);
                    }));
                } else $resolve$jscomp$14$$($value$jscomp$107$$);
            } catch ($e$jscomp$25$$) {
                $_reject$$($e$jscomp$25$$);
            }
        }
        (function($win$jscomp$23$$) {
            $win$jscomp$23$$.fetch || (Object.defineProperty($win$jscomp$23$$, "fetch", {
                value: $fetchPolyfill$$module$src$polyfills$fetch$$,
                writable: !0,
                enumerable: !0,
                configurable: !0
            }), Object.defineProperty($win$jscomp$23$$, "Response", {
                value: $Response$$module$src$polyfills$fetch$$,
                writable: !0,
                enumerable: !1,
                configurable: !0
            }));
        })(self);
        (function($win$jscomp$78$$) {
            $win$jscomp$78$$.Math.sign || $win$jscomp$78$$.Object.defineProperty($win$jscomp$78$$.Math, "sign", {
                enumerable: !1,
                configurable: !0,
                writable: !0,
                value: $sign$$module$src$polyfills$math_sign$$
            });
        })(self);
        (function($win$jscomp$79$$) {
            $win$jscomp$79$$.Object.assign || $win$jscomp$79$$.Object.defineProperty($win$jscomp$79$$.Object, "assign", {
                enumerable: !1,
                configurable: !0,
                writable: !0,
                value: $assign$$module$src$polyfills$object_assign$$
            });
        })(self);
        (function($win$jscomp$80$$) {
            $win$jscomp$80$$.Object.values || $win$jscomp$80$$.Object.defineProperty($win$jscomp$80$$.Object, "values", {
                configurable: !0,
                writable: !0,
                value: $values$$module$src$polyfills$object_values$$
            });
        })(self);
        (function($win$jscomp$81$$) {
            $win$jscomp$81$$.Promise || ($win$jscomp$81$$.Promise = $Promise$$module$node_modules$promise_pjs$promise_mjs$$, 
            $Promise$$module$node_modules$promise_pjs$promise_mjs$$.default && ($win$jscomp$81$$.Promise = $Promise$$module$node_modules$promise_pjs$promise_mjs$$.default), 
            $win$jscomp$81$$.Promise.resolve = $Promise$$module$node_modules$promise_pjs$promise_mjs$resolve$$, 
            $win$jscomp$81$$.Promise.reject = $Promise$$module$node_modules$promise_pjs$promise_mjs$reject$$, 
            $win$jscomp$81$$.Promise.all = $Promise$$module$node_modules$promise_pjs$promise_mjs$all$$, 
            $win$jscomp$81$$.Promise.race = $Promise$$module$node_modules$promise_pjs$promise_mjs$race$$);
        })(self);
        (function($win$jscomp$4$$) {
            $win$jscomp$4$$.Array.prototype.includes || $win$jscomp$4$$.Object.defineProperty(Array.prototype, "includes", {
                enumerable: !1,
                configurable: !0,
                writable: !0,
                value: $includes$$module$src$polyfills$array_includes$$
            });
        })(self);
        if (self.document) {
            $install$$module$src$polyfills$domtokenlist$$();
            {
                var $JSCompiler_win$jscomp$inline_111$$ = self;
                let $JSCompiler_documentClass$jscomp$inline_112$$ = $JSCompiler_win$jscomp$inline_111$$.HTMLDocument || $JSCompiler_win$jscomp$inline_111$$.Document;
                $JSCompiler_documentClass$jscomp$inline_112$$ && !$JSCompiler_documentClass$jscomp$inline_112$$.prototype.contains && $JSCompiler_win$jscomp$inline_111$$.Object.defineProperty($JSCompiler_documentClass$jscomp$inline_112$$.prototype, "contains", {
                    enumerable: !1,
                    configurable: !0,
                    writable: !0,
                    value: $documentContainsPolyfill$$module$src$polyfills$document_contains$$
                });
            }
            var $JSCompiler_win$jscomp$inline_114$$ = self;
            $shouldInstall$$module$src$get_bounding_client_rect$$() && ($nativeClientRect$$module$src$get_bounding_client_rect$$ = Element.prototype.getBoundingClientRect, 
            $JSCompiler_win$jscomp$inline_114$$.Object.defineProperty($JSCompiler_win$jscomp$inline_114$$.Element.prototype, "getBoundingClientRect", {
                value: $getBoundingClientRect$$module$src$get_bounding_client_rect$$
            }));
            {
                var $JSCompiler_win$jscomp$inline_116$$ = self, $JSCompiler_ctor$jscomp$inline_117$$ = class {};
                let $JSCompiler_shouldInstall$jscomp$inline_118$$ = $JSCompiler_win$jscomp$inline_116$$.document;
                var $JSCompiler_inline_result$jscomp$209$$;
                {
                    let $JSCompiler_shouldInstall$jscomp$inline_118$$ = $JSCompiler_win$jscomp$inline_116$$.customElements;
                    $JSCompiler_inline_result$jscomp$209$$ = !!($JSCompiler_shouldInstall$jscomp$inline_118$$ && $JSCompiler_shouldInstall$jscomp$inline_118$$.define && $JSCompiler_shouldInstall$jscomp$inline_118$$.get && $JSCompiler_shouldInstall$jscomp$inline_118$$.whenDefined);
                }
                var $JSCompiler_temp$jscomp$210$$;
                if (!($JSCompiler_temp$jscomp$210$$ = !$JSCompiler_shouldInstall$jscomp$inline_118$$)) {
                    var $JSCompiler_temp$jscomp$211$$;
                    if ($JSCompiler_temp$jscomp$211$$ = $JSCompiler_inline_result$jscomp$209$$) $JSCompiler_temp$jscomp$211$$ = -1 === $JSCompiler_win$jscomp$inline_116$$.HTMLElement.toString().indexOf("[native code]");
                    $JSCompiler_temp$jscomp$210$$ = $JSCompiler_temp$jscomp$211$$;
                }
                if (!$JSCompiler_temp$jscomp$210$$) {
                    var $JSCompiler_install$jscomp$inline_120$$ = !0, $JSCompiler_installWrapper$jscomp$inline_121$$ = !1;
                    if ($JSCompiler_ctor$jscomp$inline_117$$ && $JSCompiler_inline_result$jscomp$209$$) try {
                        let $JSCompiler_shouldInstall$jscomp$inline_118$$ = $JSCompiler_win$jscomp$inline_116$$.Reflect, $JSCompiler_instance$jscomp$inline_123$$ = Object.create($JSCompiler_ctor$jscomp$inline_117$$.prototype);
                        Function.call.call($JSCompiler_ctor$jscomp$inline_117$$, $JSCompiler_instance$jscomp$inline_123$$);
                        $JSCompiler_installWrapper$jscomp$inline_121$$ = !(!$JSCompiler_shouldInstall$jscomp$inline_118$$ || !$JSCompiler_shouldInstall$jscomp$inline_118$$.construct);
                    } catch ($JSCompiler_e$jscomp$inline_124$$) {
                        $JSCompiler_install$jscomp$inline_120$$ = !1;
                    }
                    $JSCompiler_installWrapper$jscomp$inline_121$$ ? $wrapHTMLElement$$module$src$polyfills$custom_elements$$() : $JSCompiler_install$jscomp$inline_120$$ && $polyfill$$module$src$polyfills$custom_elements$$();
                }
            }
            if ($getMode$$module$src$mode$$().localDev || $getMode$$module$src$mode$$().test) {
                var $JSCompiler_win$jscomp$inline_126$$ = self;
                $JSCompiler_win$jscomp$inline_126$$.IntersectionObserver || ($JSCompiler_win$jscomp$inline_126$$.IntersectionObserver = $IntersectionObserverStub$$module$src$polyfillstub$intersection_observer_stub$$);
                $fixEntry$$module$src$polyfills$intersection_observer$$();
            }
        }
        let $propertyNameCache$$module$src$style$$;
        let $vendorPrefixes$$module$src$style$$ = "Webkit webkit Moz moz ms O o".split(" ");
        function $getVendorJsPropertyName$$module$src$style$$($style$jscomp$1$$, $camelCase$jscomp$1$$, $opt_bypassCache$$) {
            if ($startsWith$$module$src$string$$($camelCase$jscomp$1$$, "--")) return $camelCase$jscomp$1$$;
            $propertyNameCache$$module$src$style$$ || ($propertyNameCache$$module$src$style$$ = $map$$module$src$utils$object$$());
            let $propertyName$jscomp$9$$ = $propertyNameCache$$module$src$style$$[$camelCase$jscomp$1$$];
            if (!$propertyName$jscomp$9$$ || $opt_bypassCache$$) {
                $propertyName$jscomp$9$$ = $camelCase$jscomp$1$$;
                if (void 0 === $style$jscomp$1$$[$camelCase$jscomp$1$$]) {
                    var $JSCompiler_inline_result$jscomp$20_JSCompiler_inline_result$jscomp$21$$ = $camelCase$jscomp$1$$.charAt(0).toUpperCase() + $camelCase$jscomp$1$$.slice(1);
                    a: {
                        for (let $camelCase$jscomp$1$$ = 0; $camelCase$jscomp$1$$ < $vendorPrefixes$$module$src$style$$.length; $camelCase$jscomp$1$$++) {
                            let $opt_bypassCache$$ = $vendorPrefixes$$module$src$style$$[$camelCase$jscomp$1$$] + $JSCompiler_inline_result$jscomp$20_JSCompiler_inline_result$jscomp$21$$;
                            if (void 0 !== $style$jscomp$1$$[$opt_bypassCache$$]) {
                                $JSCompiler_inline_result$jscomp$20_JSCompiler_inline_result$jscomp$21$$ = $opt_bypassCache$$;
                                break a;
                            }
                        }
                        $JSCompiler_inline_result$jscomp$20_JSCompiler_inline_result$jscomp$21$$ = "";
                    }
                    let $opt_bypassCache$$ = $JSCompiler_inline_result$jscomp$20_JSCompiler_inline_result$jscomp$21$$;
                    void 0 !== $style$jscomp$1$$[$opt_bypassCache$$] && ($propertyName$jscomp$9$$ = $opt_bypassCache$$);
                }
                $opt_bypassCache$$ || ($propertyNameCache$$module$src$style$$[$camelCase$jscomp$1$$] = $propertyName$jscomp$9$$);
            }
            return $propertyName$jscomp$9$$;
        }
        let $VisibilityState$$module$src$visibility_state$$ = {
            PRERENDER: "prerender",
            VISIBLE: "visible",
            HIDDEN: "hidden",
            PAUSED: "paused",
            INACTIVE: "inactive"
        };
        /*
    
    Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
    Use of this source code is governed by a BSD-style
    license that can be found in the LICENSE file or at
    https://developers.google.com/open-source/licenses/bsd */        let $shadowDomSupportedVersion$$module$src$web_components$$;
        function $getShadowDomSupportedVersion$$module$src$web_components$$() {
            if (void 0 === $shadowDomSupportedVersion$$module$src$web_components$$) {
                var $JSCompiler_element$jscomp$inline_135$$ = Element;
                $shadowDomSupportedVersion$$module$src$web_components$$ = $JSCompiler_element$jscomp$inline_135$$.prototype.attachShadow ? "v1" : $JSCompiler_element$jscomp$inline_135$$.prototype.createShadowRoot ? "v0" : "none";
            }
            return $shadowDomSupportedVersion$$module$src$web_components$$;
        }
        let $bodyMadeVisible$$module$src$style_installer$$ = !1;
        function $makeBodyVisibleRecovery$$module$src$style_installer$$($JSCompiler_element$jscomp$inline_226_doc$jscomp$14$$) {
            $devAssert$$module$src$log$$($JSCompiler_element$jscomp$inline_226_doc$jscomp$14$$.defaultView);
            if (!$bodyMadeVisible$$module$src$style_installer$$) {
                $bodyMadeVisible$$module$src$style_installer$$ = !0;
                $JSCompiler_element$jscomp$inline_226_doc$jscomp$14$$ = $JSCompiler_element$jscomp$inline_226_doc$jscomp$14$$.body;
                var $JSCompiler_styles$jscomp$inline_227$$ = {
                    opacity: 1,
                    visibility: "visible",
                    animation: "none"
                };
                for (let $JSCompiler_k$jscomp$inline_228$$ in $JSCompiler_styles$jscomp$inline_227$$) {
                    var $JSCompiler_element$jscomp$inline_261$$ = $JSCompiler_element$jscomp$inline_226_doc$jscomp$14$$, $JSCompiler_value$jscomp$inline_263$$ = $JSCompiler_styles$jscomp$inline_227$$[$JSCompiler_k$jscomp$inline_228$$];
                    let $JSCompiler_propertyName$jscomp$inline_264$$ = $getVendorJsPropertyName$$module$src$style$$($JSCompiler_element$jscomp$inline_261$$.style, $JSCompiler_k$jscomp$inline_228$$, void 0);
                    $JSCompiler_propertyName$jscomp$inline_264$$ && ($startsWith$$module$src$string$$($JSCompiler_propertyName$jscomp$inline_264$$, "--") ? $JSCompiler_element$jscomp$inline_261$$.style.setProperty($JSCompiler_propertyName$jscomp$inline_264$$, $JSCompiler_value$jscomp$inline_263$$) : $JSCompiler_element$jscomp$inline_261$$.style[$JSCompiler_propertyName$jscomp$inline_264$$] = $JSCompiler_value$jscomp$inline_263$$);
                }
            }
        }
        let $UNCOMPOSED_SEARCH$$module$src$shadow_embed$$ = {
            composed: !1
        };
        function $getShadowRootNode$$module$src$shadow_embed$$($node$jscomp$16$$) {
            return "none" != $getShadowDomSupportedVersion$$module$src$web_components$$() && Node.prototype.getRootNode ? $node$jscomp$16$$.getRootNode($UNCOMPOSED_SEARCH$$module$src$shadow_embed$$) : $closestNode$$module$src$dom$$($node$jscomp$16$$, $node$jscomp$16$$ => $isShadowRoot$$module$src$dom$$($node$jscomp$16$$));
        }
        function $throttle$$module$src$utils$rate_limit$$($win$jscomp$100$$, $callback$jscomp$67$$) {
            function $fire$$($fire$$) {
                $nextCallArgs$$ = null;
                $locker$$ = $win$jscomp$100$$.setTimeout($waiter$$, 100);
                $callback$jscomp$67$$.apply(null, $fire$$);
            }
            function $waiter$$() {
                $locker$$ = 0;
                $nextCallArgs$$ && $fire$$($nextCallArgs$$);
            }
            let $locker$$ = 0, $nextCallArgs$$ = null;
            return function(...$win$jscomp$100$$) {
                $locker$$ ? $nextCallArgs$$ = $win$jscomp$100$$ : $fire$$($win$jscomp$100$$);
            };
        }
        function $exponentialBackoff$$module$src$exponential_backoff$$() {
            let $getTimeout$$ = $exponentialBackoffClock$$module$src$exponential_backoff$$();
            return $work$$ => setTimeout($work$$, $getTimeout$$());
        }
        function $exponentialBackoffClock$$module$src$exponential_backoff$$() {
            let $count$jscomp$39$$ = 0;
            return () => {
                let $wait$$ = Math.pow(1.5, $count$jscomp$39$$++);
                var $JSCompiler_inline_result$jscomp$24_JSCompiler_jitter$jscomp$inline_141_JSCompiler_opt_perc$jscomp$inline_140$$ = $wait$$ * ($JSCompiler_inline_result$jscomp$24_JSCompiler_jitter$jscomp$inline_141_JSCompiler_opt_perc$jscomp$inline_140$$ || .3) * Math.random();
                .5 < Math.random() && ($JSCompiler_inline_result$jscomp$24_JSCompiler_jitter$jscomp$inline_141_JSCompiler_opt_perc$jscomp$inline_140$$ *= -1);
                $wait$$ += $JSCompiler_inline_result$jscomp$24_JSCompiler_jitter$jscomp$inline_141_JSCompiler_opt_perc$jscomp$inline_140$$;
                return 1e3 * $wait$$;
            };
        }
        function $triggerAnalyticsEvent$$module$src$analytics$$($target$jscomp$97$$, $opt_vars$$) {
            $getElementServiceIfAvailableForDoc$$module$src$element_service$$($target$jscomp$97$$).then($analytics$$ => {
                $analytics$$ && $analytics$$.triggerEventForTarget($target$jscomp$97$$, "user-error", $opt_vars$$);
            });
        }
        let $accumulatedErrorMessages$$module$src$error$$ = self.__AMP_ERRORS || [];
        self.__AMP_ERRORS = $accumulatedErrorMessages$$module$src$error$$;
        function $reportingBackoff$$module$src$error$$($work$jscomp$1$$) {
            $reportingBackoff$$module$src$error$$ = $exponentialBackoff$$module$src$exponential_backoff$$();
            return $reportingBackoff$$module$src$error$$($work$jscomp$1$$);
        }
        function $tryJsonStringify$$module$src$error$$($value$jscomp$118$$) {
            try {
                return JSON.stringify($value$jscomp$118$$);
            } catch ($e$jscomp$31$$) {
                return String($value$jscomp$118$$);
            }
        }
        let $detectedJsEngine$$module$src$error$$;
        function $reportError$$module$src$error$$($error$jscomp$17$$, $opt_associatedElement$jscomp$1$$) {
            try {
                let $isValidError$$;
                if ($error$jscomp$17$$) if (void 0 !== $error$jscomp$17$$.message) $error$jscomp$17$$ = $duplicateErrorIfNecessary$$module$src$log$$($error$jscomp$17$$), 
                $isValidError$$ = !0; else {
                    let $opt_associatedElement$jscomp$1$$ = $error$jscomp$17$$;
                    $error$jscomp$17$$ = Error($tryJsonStringify$$module$src$error$$($opt_associatedElement$jscomp$1$$));
                    $error$jscomp$17$$.origError = $opt_associatedElement$jscomp$1$$;
                } else $error$jscomp$17$$ = Error("Unknown error");
                $isValidError$$ || !$getMode$$module$src$mode$$().localDev || $getMode$$module$src$mode$$().test || setTimeout((function() {
                    throw Error("_reported_ Error reported incorrectly: " + $error$jscomp$17$$);
                }));
                if (!$error$jscomp$17$$.reported) {
                    $error$jscomp$17$$.reported = !0;
                    var $element$jscomp$90$$ = $opt_associatedElement$jscomp$1$$ || $error$jscomp$17$$.associatedElement;
                    $element$jscomp$90$$ && $element$jscomp$90$$.classList && ($element$jscomp$90$$.classList.add("i-amphtml-error"), 
                    $getMode$$module$src$mode$$().development && ($element$jscomp$90$$.classList.add("i-amphtml-element-error"), 
                    $element$jscomp$90$$.setAttribute("error-message", $error$jscomp$17$$.message)));
                    if (self.console) {
                        let $opt_associatedElement$jscomp$1$$ = console.error || console.log;
                        $error$jscomp$17$$.messageArray ? $opt_associatedElement$jscomp$1$$.apply(console, $error$jscomp$17$$.messageArray) : $element$jscomp$90$$ ? $opt_associatedElement$jscomp$1$$.call(console, $error$jscomp$17$$.message, $element$jscomp$90$$) : $getMode$$module$src$mode$$().minified ? $opt_associatedElement$jscomp$1$$.call(console, $error$jscomp$17$$.message) : $opt_associatedElement$jscomp$1$$.call(console, $error$jscomp$17$$.stack);
                    }
                    $element$jscomp$90$$ && $element$jscomp$90$$.$dispatchCustomEventForTesting$ && $element$jscomp$90$$.$dispatchCustomEventForTesting$("amp:error", $error$jscomp$17$$.message);
                    $onError$$module$src$error$$.call(void 0, void 0, void 0, void 0, void 0, $error$jscomp$17$$);
                }
            } catch ($errorReportingError$$) {
                setTimeout((function() {
                    throw $errorReportingError$$;
                }));
            }
        }
        function $installErrorReporting$$module$src$error$$() {
            var $win$jscomp$103$$ = self;
            $win$jscomp$103$$.onerror = $onError$$module$src$error$$;
            $win$jscomp$103$$.addEventListener("unhandledrejection", $win$jscomp$103$$ => {
                !$win$jscomp$103$$.reason || "CANCELLED" !== $win$jscomp$103$$.reason.message && "BLOCK_BY_CONSENT" !== $win$jscomp$103$$.reason.message && "AbortError" !== $win$jscomp$103$$.reason.message ? $reportError$$module$src$error$$($win$jscomp$103$$.reason || Error("rejected promise " + $win$jscomp$103$$)) : $win$jscomp$103$$.preventDefault();
            });
        }
        function $onError$$module$src$error$$($message$jscomp$36$$, $filename$jscomp$2$$, $line$$, $col$$, $error$jscomp$18$$) {
            this && this.document && $makeBodyVisibleRecovery$$module$src$style_installer$$(this.document);
            if (!($getMode$$module$src$mode$$().localDev || $getMode$$module$src$mode$$().development || $getMode$$module$src$mode$$().test)) {
                var $hasNonAmpJs$$ = !1;
                try {
                    $hasNonAmpJs$$ = $detectNonAmpJs$$module$src$error$$();
                } catch ($ignore$$) {}
                if (!($hasNonAmpJs$$ && .01 < Math.random())) {
                    var $data$jscomp$83$$ = $getErrorReportData$$module$src$error$$($message$jscomp$36$$, $filename$jscomp$2$$, $line$$, $col$$, $error$jscomp$18$$, $hasNonAmpJs$$);
                    $data$jscomp$83$$ && $reportingBackoff$$module$src$error$$(() => {
                        try {
                            return $reportErrorToServerOrViewer$$module$src$error$$(this, $data$jscomp$83$$).catch(() => {});
                        } catch ($e$jscomp$32$$) {}
                    });
                }
            }
        }
        function $reportErrorToServerOrViewer$$module$src$error$$($win$jscomp$104$$, $data$jscomp$84$$) {
            return $data$jscomp$84$$.pt && .9 > Math.random() ? $resolvedPromise$$module$src$resolved_promise$$() : $maybeReportErrorToViewer$$module$src$error$$($win$jscomp$104$$, $data$jscomp$84$$).then($win$jscomp$104$$ => {
                if (!$win$jscomp$104$$) {
                    let $win$jscomp$104$$ = new XMLHttpRequest;
                    $win$jscomp$104$$.open("POST", .1 > Math.random() ? $urls$$module$src$config$$.betaErrorReporting : $urls$$module$src$config$$.errorReporting, !0);
                    $win$jscomp$104$$.send(JSON.stringify($data$jscomp$84$$));
                }
            });
        }
        function $maybeReportErrorToViewer$$module$src$error$$($ampdocService$jscomp$1_win$jscomp$105$$, $data$jscomp$85$$) {
            $ampdocService$jscomp$1_win$jscomp$105$$ = $Services$$module$src$services$ampdocServiceFor$$($ampdocService$jscomp$1_win$jscomp$105$$);
            if (!$ampdocService$jscomp$1_win$jscomp$105$$.isSingleDoc()) return Promise.resolve(!1);
            let $ampdocSingle$$ = $ampdocService$jscomp$1_win$jscomp$105$$.getSingleDoc();
            if (!$ampdocSingle$$.getRootNode().documentElement.hasAttribute("report-errors-to-viewer")) return Promise.resolve(!1);
            let $viewer$jscomp$2$$ = $getServiceForDoc$$module$src$service$$($ampdocSingle$$, "viewer");
            return $viewer$jscomp$2$$.hasCapability("errorReporter") ? $viewer$jscomp$2$$.isTrustedViewer().then($ampdocService$jscomp$1_win$jscomp$105$$ => {
                if (!$ampdocService$jscomp$1_win$jscomp$105$$) return !1;
                $viewer$jscomp$2$$.sendMessage("error", $dict$$module$src$utils$object$$({
                    m: $data$jscomp$85$$.m,
                    a: $data$jscomp$85$$.a,
                    s: $data$jscomp$85$$.s,
                    el: $data$jscomp$85$$.el,
                    ex: $data$jscomp$85$$.ex,
                    v: $data$jscomp$85$$.v,
                    pt: $data$jscomp$85$$.pt,
                    jse: $data$jscomp$85$$.jse
                }));
                return !0;
            }) : Promise.resolve(!1);
        }
        function $getErrorReportData$$module$src$error$$($message$jscomp$38$$, $JSCompiler_element$jscomp$inline_152_filename$jscomp$3$$, $line$jscomp$1$$, $col$jscomp$1$$, $error$jscomp$20$$, $JSCompiler_win$jscomp$inline_146_JSCompiler_win$jscomp$inline_148_experiments$jscomp$1_hasNonAmpJs$jscomp$1$$) {
            var $JSCompiler_message$jscomp$inline_143_data$jscomp$86$$ = $message$jscomp$38$$;
            $error$jscomp$20$$ && ($JSCompiler_message$jscomp$inline_143_data$jscomp$86$$ = $error$jscomp$20$$.message ? $error$jscomp$20$$.message : String($error$jscomp$20$$));
            $JSCompiler_message$jscomp$inline_143_data$jscomp$86$$ || ($JSCompiler_message$jscomp$inline_143_data$jscomp$86$$ = "Unknown error");
            $message$jscomp$38$$ = $JSCompiler_message$jscomp$inline_143_data$jscomp$86$$;
            let $expected$$ = !(!$error$jscomp$20$$ || !$error$jscomp$20$$.expected);
            if (!/_reported_/.test($message$jscomp$38$$) && "CANCELLED" != $message$jscomp$38$$) {
                var $detachedWindow$$ = !(self && self.window), $throttleBase$$ = Math.random();
                if (-1 != $message$jscomp$38$$.indexOf("Failed to load:") || "Script error." == $message$jscomp$38$$ || $detachedWindow$$) if ($expected$$ = !0, 
                .001 < $throttleBase$$) return;
                var $isUserError$$ = $isUserErrorMessage$$module$src$log$$($message$jscomp$38$$);
                if (!($isUserError$$ && .1 < $throttleBase$$)) {
                    $JSCompiler_message$jscomp$inline_143_data$jscomp$86$$ = Object.create(null);
                    $JSCompiler_message$jscomp$inline_143_data$jscomp$86$$.v = $getMode$$module$src$mode$$().rtvVersion;
                    $JSCompiler_message$jscomp$inline_143_data$jscomp$86$$.noAmp = $JSCompiler_win$jscomp$inline_146_JSCompiler_win$jscomp$inline_148_experiments$jscomp$1_hasNonAmpJs$jscomp$1$$ ? "1" : "0";
                    $JSCompiler_message$jscomp$inline_143_data$jscomp$86$$.m = $message$jscomp$38$$.replace("​​​", "");
                    $JSCompiler_message$jscomp$inline_143_data$jscomp$86$$.a = $isUserError$$ ? "1" : "0";
                    $JSCompiler_message$jscomp$inline_143_data$jscomp$86$$.ex = $expected$$ ? "1" : "0";
                    $JSCompiler_message$jscomp$inline_143_data$jscomp$86$$.dw = $detachedWindow$$ ? "1" : "0";
                    var $runtime$$ = "1p";
                    $runtime$$ = "esm";
                    $JSCompiler_message$jscomp$inline_143_data$jscomp$86$$.esm = "1";
                    $getMode$$module$src$mode$$().singlePassType && ($JSCompiler_message$jscomp$inline_143_data$jscomp$86$$.spt = $getMode$$module$src$mode$$().singlePassType);
                    $JSCompiler_message$jscomp$inline_143_data$jscomp$86$$.rt = $runtime$$;
                    "inabox" === $runtime$$ && ($JSCompiler_message$jscomp$inline_143_data$jscomp$86$$.adid = $getMode$$module$src$mode$$().a4aId);
                    $JSCompiler_win$jscomp$inline_146_JSCompiler_win$jscomp$inline_148_experiments$jscomp$1_hasNonAmpJs$jscomp$1$$ = self;
                    $JSCompiler_message$jscomp$inline_143_data$jscomp$86$$.ca = $JSCompiler_win$jscomp$inline_146_JSCompiler_win$jscomp$inline_148_experiments$jscomp$1_hasNonAmpJs$jscomp$1$$.AMP_CONFIG && $JSCompiler_win$jscomp$inline_146_JSCompiler_win$jscomp$inline_148_experiments$jscomp$1_hasNonAmpJs$jscomp$1$$.AMP_CONFIG.canary ? "1" : "0";
                    $JSCompiler_win$jscomp$inline_146_JSCompiler_win$jscomp$inline_148_experiments$jscomp$1_hasNonAmpJs$jscomp$1$$ = self;
                    $JSCompiler_message$jscomp$inline_143_data$jscomp$86$$.bt = $JSCompiler_win$jscomp$inline_146_JSCompiler_win$jscomp$inline_148_experiments$jscomp$1_hasNonAmpJs$jscomp$1$$.AMP_CONFIG && $JSCompiler_win$jscomp$inline_146_JSCompiler_win$jscomp$inline_148_experiments$jscomp$1_hasNonAmpJs$jscomp$1$$.AMP_CONFIG.type ? $JSCompiler_win$jscomp$inline_146_JSCompiler_win$jscomp$inline_148_experiments$jscomp$1_hasNonAmpJs$jscomp$1$$.AMP_CONFIG.type : "unknown";
                    self.location.ancestorOrigins && self.location.ancestorOrigins[0] && ($JSCompiler_message$jscomp$inline_143_data$jscomp$86$$.or = self.location.ancestorOrigins[0]);
                    self.viewerState && ($JSCompiler_message$jscomp$inline_143_data$jscomp$86$$.vs = self.viewerState);
                    self.parent && self.parent != self && ($JSCompiler_message$jscomp$inline_143_data$jscomp$86$$.iem = "1");
                    if (self.AMP && self.AMP.viewer) {
                        let $message$jscomp$38$$ = self.AMP.viewer.getResolvedViewerUrl(), $JSCompiler_element$jscomp$inline_152_filename$jscomp$3$$ = self.AMP.viewer.maybeGetMessagingOrigin();
                        $message$jscomp$38$$ && ($JSCompiler_message$jscomp$inline_143_data$jscomp$86$$.rvu = $message$jscomp$38$$);
                        $JSCompiler_element$jscomp$inline_152_filename$jscomp$3$$ && ($JSCompiler_message$jscomp$inline_143_data$jscomp$86$$.mso = $JSCompiler_element$jscomp$inline_152_filename$jscomp$3$$);
                    }
                    $detectedJsEngine$$module$src$error$$ || ($detectedJsEngine$$module$src$error$$ = $detectJsEngineFromStack$$module$src$error$$());
                    $JSCompiler_message$jscomp$inline_143_data$jscomp$86$$.jse = $detectedJsEngine$$module$src$error$$;
                    var $exps$$ = [];
                    $JSCompiler_win$jscomp$inline_146_JSCompiler_win$jscomp$inline_148_experiments$jscomp$1_hasNonAmpJs$jscomp$1$$ = self.__AMP__EXPERIMENT_TOGGLES || null;
                    for (let $message$jscomp$38$$ in $JSCompiler_win$jscomp$inline_146_JSCompiler_win$jscomp$inline_148_experiments$jscomp$1_hasNonAmpJs$jscomp$1$$) $exps$$.push(`${$message$jscomp$38$$}=${$JSCompiler_win$jscomp$inline_146_JSCompiler_win$jscomp$inline_148_experiments$jscomp$1_hasNonAmpJs$jscomp$1$$[$message$jscomp$38$$] ? "1" : "0"}`);
                    $JSCompiler_message$jscomp$inline_143_data$jscomp$86$$.exps = $exps$$.join(",");
                    $error$jscomp$20$$ ? ($JSCompiler_message$jscomp$inline_143_data$jscomp$86$$.el = $error$jscomp$20$$.associatedElement ? $error$jscomp$20$$.associatedElement.tagName : "u", 
                    $error$jscomp$20$$.args && ($JSCompiler_message$jscomp$inline_143_data$jscomp$86$$.args = JSON.stringify($error$jscomp$20$$.args)), 
                    $isUserError$$ || $error$jscomp$20$$.ignoreStack || !$error$jscomp$20$$.stack || ($JSCompiler_message$jscomp$inline_143_data$jscomp$86$$.s = $error$jscomp$20$$.stack), 
                    $error$jscomp$20$$.message && ($error$jscomp$20$$.message += " _reported_")) : ($JSCompiler_message$jscomp$inline_143_data$jscomp$86$$.f = $JSCompiler_element$jscomp$inline_152_filename$jscomp$3$$ || "", 
                    $JSCompiler_message$jscomp$inline_143_data$jscomp$86$$.l = $line$jscomp$1$$ || "", 
                    $JSCompiler_message$jscomp$inline_143_data$jscomp$86$$.c = $col$jscomp$1$$ || "");
                    $JSCompiler_message$jscomp$inline_143_data$jscomp$86$$.r = self.document ? self.document.referrer : "";
                    $JSCompiler_message$jscomp$inline_143_data$jscomp$86$$.ae = $accumulatedErrorMessages$$module$src$error$$.join(",");
                    $JSCompiler_message$jscomp$inline_143_data$jscomp$86$$.fr = self.location.originalHash || self.location.hash;
                    "production" === $JSCompiler_message$jscomp$inline_143_data$jscomp$86$$.rt && ($JSCompiler_message$jscomp$inline_143_data$jscomp$86$$.pt = "1");
                    $JSCompiler_element$jscomp$inline_152_filename$jscomp$3$$ = $message$jscomp$38$$;
                    25 <= $accumulatedErrorMessages$$module$src$error$$.length && $accumulatedErrorMessages$$module$src$error$$.splice(0, $accumulatedErrorMessages$$module$src$error$$.length - 25 + 1);
                    $accumulatedErrorMessages$$module$src$error$$.push($JSCompiler_element$jscomp$inline_152_filename$jscomp$3$$);
                    return $JSCompiler_message$jscomp$inline_143_data$jscomp$86$$;
                }
            }
        }
        function $detectNonAmpJs$$module$src$error$$() {
            var $scripts$jscomp$2_win$jscomp$106$$ = self;
            if (!$scripts$jscomp$2_win$jscomp$106$$.document) return !1;
            $scripts$jscomp$2_win$jscomp$106$$ = $scripts$jscomp$2_win$jscomp$106$$.document.querySelectorAll("script[src]");
            for (let $i$jscomp$45$$ = 0; $i$jscomp$45$$ < $scripts$jscomp$2_win$jscomp$106$$.length; $i$jscomp$45$$++) {
                var $JSCompiler_url$jscomp$inline_156_JSCompiler_url$jscomp$inline_230_JSCompiler_url$jscomp$inline_266$$ = $scripts$jscomp$2_win$jscomp$106$$[$i$jscomp$45$$].src.toLowerCase();
                if ("string" == typeof $JSCompiler_url$jscomp$inline_156_JSCompiler_url$jscomp$inline_230_JSCompiler_url$jscomp$inline_266$$) {
                    $a$$module$src$url$$ || ($a$$module$src$url$$ = self.document.createElement("a"), 
                    $cache$$module$src$url$$ = self.__AMP_URL_CACHE || (self.__AMP_URL_CACHE = new $LruCache$$module$src$utils$lru_cache$$(100)));
                    a: {
                        var $JSCompiler_opt_cache$jscomp$inline_267$$ = $cache$$module$src$url$$, $JSCompiler_a$jscomp$inline_268_JSCompiler_frozen$jscomp$inline_270$$ = $a$$module$src$url$$;
                        if ($JSCompiler_opt_cache$jscomp$inline_267$$ && $JSCompiler_opt_cache$jscomp$inline_267$$.has($JSCompiler_url$jscomp$inline_156_JSCompiler_url$jscomp$inline_230_JSCompiler_url$jscomp$inline_266$$)) {
                            $JSCompiler_url$jscomp$inline_156_JSCompiler_url$jscomp$inline_230_JSCompiler_url$jscomp$inline_266$$ = $JSCompiler_opt_cache$jscomp$inline_267$$.get($JSCompiler_url$jscomp$inline_156_JSCompiler_url$jscomp$inline_230_JSCompiler_url$jscomp$inline_266$$);
                            break a;
                        }
                        $JSCompiler_a$jscomp$inline_268_JSCompiler_frozen$jscomp$inline_270$$.href = $JSCompiler_url$jscomp$inline_156_JSCompiler_url$jscomp$inline_230_JSCompiler_url$jscomp$inline_266$$;
                        $JSCompiler_a$jscomp$inline_268_JSCompiler_frozen$jscomp$inline_270$$.protocol || ($JSCompiler_a$jscomp$inline_268_JSCompiler_frozen$jscomp$inline_270$$.href = $JSCompiler_a$jscomp$inline_268_JSCompiler_frozen$jscomp$inline_270$$.href);
                        let $scripts$jscomp$2_win$jscomp$106$$ = {
                            href: $JSCompiler_a$jscomp$inline_268_JSCompiler_frozen$jscomp$inline_270$$.href,
                            protocol: $JSCompiler_a$jscomp$inline_268_JSCompiler_frozen$jscomp$inline_270$$.protocol,
                            host: $JSCompiler_a$jscomp$inline_268_JSCompiler_frozen$jscomp$inline_270$$.host,
                            hostname: $JSCompiler_a$jscomp$inline_268_JSCompiler_frozen$jscomp$inline_270$$.hostname,
                            port: "0" == $JSCompiler_a$jscomp$inline_268_JSCompiler_frozen$jscomp$inline_270$$.port ? "" : $JSCompiler_a$jscomp$inline_268_JSCompiler_frozen$jscomp$inline_270$$.port,
                            pathname: $JSCompiler_a$jscomp$inline_268_JSCompiler_frozen$jscomp$inline_270$$.pathname,
                            search: $JSCompiler_a$jscomp$inline_268_JSCompiler_frozen$jscomp$inline_270$$.search,
                            hash: $JSCompiler_a$jscomp$inline_268_JSCompiler_frozen$jscomp$inline_270$$.hash,
                            origin: null
                        };
                        "/" !== $scripts$jscomp$2_win$jscomp$106$$.pathname[0] && ($scripts$jscomp$2_win$jscomp$106$$.pathname = "/" + $scripts$jscomp$2_win$jscomp$106$$.pathname);
                        if ("http:" == $scripts$jscomp$2_win$jscomp$106$$.protocol && 80 == $scripts$jscomp$2_win$jscomp$106$$.port || "https:" == $scripts$jscomp$2_win$jscomp$106$$.protocol && 443 == $scripts$jscomp$2_win$jscomp$106$$.port) $scripts$jscomp$2_win$jscomp$106$$.port = "", 
                        $scripts$jscomp$2_win$jscomp$106$$.host = $scripts$jscomp$2_win$jscomp$106$$.hostname;
                        $scripts$jscomp$2_win$jscomp$106$$.origin = $JSCompiler_a$jscomp$inline_268_JSCompiler_frozen$jscomp$inline_270$$.origin && "null" != $JSCompiler_a$jscomp$inline_268_JSCompiler_frozen$jscomp$inline_270$$.origin ? $JSCompiler_a$jscomp$inline_268_JSCompiler_frozen$jscomp$inline_270$$.origin : "data:" != $scripts$jscomp$2_win$jscomp$106$$.protocol && $scripts$jscomp$2_win$jscomp$106$$.host ? $scripts$jscomp$2_win$jscomp$106$$.protocol + "//" + $scripts$jscomp$2_win$jscomp$106$$.host : $scripts$jscomp$2_win$jscomp$106$$.href;
                        $JSCompiler_a$jscomp$inline_268_JSCompiler_frozen$jscomp$inline_270$$ = $getMode$$module$src$mode$$().test && Object.freeze ? Object.freeze($scripts$jscomp$2_win$jscomp$106$$) : $scripts$jscomp$2_win$jscomp$106$$;
                        $JSCompiler_opt_cache$jscomp$inline_267$$ && $JSCompiler_opt_cache$jscomp$inline_267$$.put($JSCompiler_url$jscomp$inline_156_JSCompiler_url$jscomp$inline_230_JSCompiler_url$jscomp$inline_266$$, $JSCompiler_a$jscomp$inline_268_JSCompiler_frozen$jscomp$inline_270$$);
                        $JSCompiler_url$jscomp$inline_156_JSCompiler_url$jscomp$inline_230_JSCompiler_url$jscomp$inline_266$$ = $JSCompiler_a$jscomp$inline_268_JSCompiler_frozen$jscomp$inline_270$$;
                    }
                }
                if (!$urls$$module$src$config$$.cdnProxyRegex.test($JSCompiler_url$jscomp$inline_156_JSCompiler_url$jscomp$inline_230_JSCompiler_url$jscomp$inline_266$$.origin)) return !0;
            }
            return !1;
        }
        function $detectJsEngineFromStack$$module$src$error$$() {
            function $Fn$$() {}
            $Fn$$.prototype.t = function() {
                throw Error("message");
            };
            var $object$jscomp$1_stack$jscomp$1$$ = new $Fn$$;
            try {
                $object$jscomp$1_stack$jscomp$1$$.t();
            } catch ($e$jscomp$33$$) {
                $object$jscomp$1_stack$jscomp$1$$ = $e$jscomp$33$$.stack;
                if ($startsWith$$module$src$string$$($object$jscomp$1_stack$jscomp$1$$, "t@")) return "Safari";
                if (-1 < $object$jscomp$1_stack$jscomp$1$$.indexOf(".prototype.t@")) return "Firefox";
                let $Fn$$ = $object$jscomp$1_stack$jscomp$1$$.split("\n").pop();
                if (/\bat .* \(/i.test($Fn$$)) return "IE";
                if ($startsWith$$module$src$string$$($object$jscomp$1_stack$jscomp$1$$, "Error: message")) return "Chrome";
            }
            return "unknown";
        }
        class $PriorityQueue$$module$src$utils$priority_queue$$ {
            constructor() {
                this.$queue_$ = [];
            }
            peek() {
                let $l$$ = this.$queue_$.length;
                return $l$$ ? this.$queue_$[$l$$ - 1].item : null;
            }
            enqueue($item$jscomp$6$$, $priority$$) {
                if (isNaN($priority$$)) throw Error("Priority must not be NaN.");
                {
                    var $JSCompiler_i$jscomp$inline_160_JSCompiler_inline_result$jscomp$26$$ = -1;
                    let $item$jscomp$6$$ = 0, $JSCompiler_hi$jscomp$inline_162$$ = this.$queue_$.length;
                    for (;$item$jscomp$6$$ <= $JSCompiler_hi$jscomp$inline_162$$; ) {
                        $JSCompiler_i$jscomp$inline_160_JSCompiler_inline_result$jscomp$26$$ = Math.floor(($item$jscomp$6$$ + $JSCompiler_hi$jscomp$inline_162$$) / 2);
                        if ($JSCompiler_i$jscomp$inline_160_JSCompiler_inline_result$jscomp$26$$ === this.$queue_$.length) break;
                        if (this.$queue_$[$JSCompiler_i$jscomp$inline_160_JSCompiler_inline_result$jscomp$26$$].priority < $priority$$) $item$jscomp$6$$ = $JSCompiler_i$jscomp$inline_160_JSCompiler_inline_result$jscomp$26$$ + 1; else if (0 < $JSCompiler_i$jscomp$inline_160_JSCompiler_inline_result$jscomp$26$$ && this.$queue_$[$JSCompiler_i$jscomp$inline_160_JSCompiler_inline_result$jscomp$26$$ - 1].priority >= $priority$$) $JSCompiler_hi$jscomp$inline_162$$ = $JSCompiler_i$jscomp$inline_160_JSCompiler_inline_result$jscomp$26$$ - 1; else break;
                    }
                }
                this.$queue_$.splice($JSCompiler_i$jscomp$inline_160_JSCompiler_inline_result$jscomp$26$$, 0, {
                    item: $item$jscomp$6$$,
                    priority: $priority$$
                });
            }
            forEach($callback$jscomp$69$$) {
                let $index$jscomp$81$$ = this.$queue_$.length;
                for (;$index$jscomp$81$$--; ) $callback$jscomp$69$$(this.$queue_$[$index$jscomp$81$$].item);
            }
            dequeue() {
                return this.$queue_$.length ? this.$queue_$.pop().item : null;
            }
            get length() {
                return this.$queue_$.length;
            }
        }
        class $Observable$$module$src$observable$$ {
            constructor() {
                this.$handlers_$ = null;
            }
            add($handler$jscomp$11$$) {
                this.$handlers_$ || (this.$handlers_$ = []);
                this.$handlers_$.push($handler$jscomp$11$$);
                return () => {
                    this.remove($handler$jscomp$11$$);
                };
            }
            remove($handler$jscomp$12_index$jscomp$82$$) {
                this.$handlers_$ && ($handler$jscomp$12_index$jscomp$82$$ = this.$handlers_$.indexOf($handler$jscomp$12_index$jscomp$82$$), 
                -1 < $handler$jscomp$12_index$jscomp$82$$ && this.$handlers_$.splice($handler$jscomp$12_index$jscomp$82$$, 1));
            }
            removeAll() {
                this.$handlers_$ && (this.$handlers_$.length = 0);
            }
            fire($opt_event$jscomp$1$$) {
                if (this.$handlers_$) {
                    var $handlers$$ = this.$handlers_$;
                    for (let $i$jscomp$64$$ = 0; $i$jscomp$64$$ < $handlers$$.length; $i$jscomp$64$$++) (0, 
                    $handlers$$[$i$jscomp$64$$])($opt_event$jscomp$1$$);
                }
            }
            getHandlerCount() {
                return this.$handlers_$ ? this.$handlers_$.length : 0;
            }
        }
        class $Signals$$module$src$utils$signals$$ {
            constructor() {
                this.$map_$ = $map$$module$src$utils$object$$();
                this.$promiseMap_$ = null;
            }
            get($name$jscomp$110_v$jscomp$4$$) {
                $name$jscomp$110_v$jscomp$4$$ = this.$map_$[$name$jscomp$110_v$jscomp$4$$];
                return null == $name$jscomp$110_v$jscomp$4$$ ? null : $name$jscomp$110_v$jscomp$4$$;
            }
            whenSignal($name$jscomp$111$$) {
                let $promiseStruct$$ = this.$promiseMap_$ && this.$promiseMap_$[$name$jscomp$111$$];
                if (!$promiseStruct$$) {
                    var $deferred$jscomp$15_result$jscomp$5$$ = this.$map_$[$name$jscomp$111$$];
                    null != $deferred$jscomp$15_result$jscomp$5$$ ? $promiseStruct$$ = {
                        promise: "number" == typeof $deferred$jscomp$15_result$jscomp$5$$ ? Promise.resolve($deferred$jscomp$15_result$jscomp$5$$) : Promise.reject($deferred$jscomp$15_result$jscomp$5$$)
                    } : ($deferred$jscomp$15_result$jscomp$5$$ = new $Deferred$$module$src$utils$promise$$, 
                    $promiseStruct$$ = {
                        promise: $deferred$jscomp$15_result$jscomp$5$$.promise,
                        resolve: $deferred$jscomp$15_result$jscomp$5$$.resolve,
                        reject: $deferred$jscomp$15_result$jscomp$5$$.reject
                    });
                    this.$promiseMap_$ || (this.$promiseMap_$ = $map$$module$src$utils$object$$());
                    this.$promiseMap_$[$name$jscomp$111$$] = $promiseStruct$$;
                }
                return $promiseStruct$$.promise;
            }
            signal($name$jscomp$112_promiseStruct$jscomp$1$$, $opt_time$$) {
                if (null == this.$map_$[$name$jscomp$112_promiseStruct$jscomp$1$$]) {
                    var $time$jscomp$2$$ = $opt_time$$ || Date.now();
                    this.$map_$[$name$jscomp$112_promiseStruct$jscomp$1$$] = $time$jscomp$2$$;
                    ($name$jscomp$112_promiseStruct$jscomp$1$$ = this.$promiseMap_$ && this.$promiseMap_$[$name$jscomp$112_promiseStruct$jscomp$1$$]) && $name$jscomp$112_promiseStruct$jscomp$1$$.resolve && ($name$jscomp$112_promiseStruct$jscomp$1$$.resolve($time$jscomp$2$$), 
                    $name$jscomp$112_promiseStruct$jscomp$1$$.resolve = void 0, $name$jscomp$112_promiseStruct$jscomp$1$$.reject = void 0);
                }
            }
            rejectSignal($name$jscomp$113_promiseStruct$jscomp$2$$, $error$jscomp$24$$) {
                null == this.$map_$[$name$jscomp$113_promiseStruct$jscomp$2$$] && (this.$map_$[$name$jscomp$113_promiseStruct$jscomp$2$$] = $error$jscomp$24$$, 
                ($name$jscomp$113_promiseStruct$jscomp$2$$ = this.$promiseMap_$ && this.$promiseMap_$[$name$jscomp$113_promiseStruct$jscomp$2$$]) && $name$jscomp$113_promiseStruct$jscomp$2$$.reject && ($name$jscomp$113_promiseStruct$jscomp$2$$.reject($error$jscomp$24$$), 
                $name$jscomp$113_promiseStruct$jscomp$2$$.resolve = void 0, $name$jscomp$113_promiseStruct$jscomp$2$$.reject = void 0));
            }
            reset($name$jscomp$114$$) {
                this.$map_$[$name$jscomp$114$$] && delete this.$map_$[$name$jscomp$114$$];
                let $promiseStruct$jscomp$3$$ = this.$promiseMap_$ && this.$promiseMap_$[$name$jscomp$114$$];
                $promiseStruct$jscomp$3$$ && !$promiseStruct$jscomp$3$$.resolve && delete this.$promiseMap_$[$name$jscomp$114$$];
            }
        }
        Date.now();
        let $deactivated$$module$src$chunk$$ = /nochunking=1/.test(self.location.hash);
        let $resolved$$module$src$chunk$$ = $resolvedPromise$$module$src$resolved_promise$$();
        function $JSCompiler_StaticMethods_runTask_$$($JSCompiler_StaticMethods_runTask_$self$$, $idleDeadline$$) {
            if ("run" != $JSCompiler_StaticMethods_runTask_$self$$.state) {
                $JSCompiler_StaticMethods_runTask_$self$$.state = "run";
                try {
                    $JSCompiler_StaticMethods_runTask_$self$$.$fn_$($idleDeadline$$);
                } catch ($e$jscomp$62$$) {
                    throw $JSCompiler_StaticMethods_runTask_$self$$.$onTaskError_$(), $e$jscomp$62$$;
                }
            }
        }
        class $Task$$module$src$chunk$$ {
            constructor($fn$jscomp$10$$) {
                this.state = "not_run";
                this.$fn_$ = $fn$jscomp$10$$;
            }
            $getName_$() {
                return this.$fn_$.displayName || this.$fn_$.name;
            }
            $onTaskError_$() {}
            $immediateTriggerCondition_$() {
                return !1;
            }
            $useRequestIdleCallback_$() {
                return !1;
            }
        }
        class $StartupTask$$module$src$chunk$$ extends $Task$$module$src$chunk$$ {
            constructor($fn$jscomp$11$$, $win$jscomp$164$$, $chunks$$) {
                super($fn$jscomp$11$$);
                this.$chunks_$ = $chunks$$;
            }
            $onTaskError_$() {
                $makeBodyVisibleRecovery$$module$src$style_installer$$(self.document);
            }
            $immediateTriggerCondition_$() {
                return this.$chunks_$.ampdoc.isVisible();
            }
            $useRequestIdleCallback_$() {
                return this.$chunks_$.$coreReady_$;
            }
        }
        function $JSCompiler_StaticMethods_schedule_$$($JSCompiler_StaticMethods_schedule_$self$$) {
            if (!$JSCompiler_StaticMethods_schedule_$self$$.$scheduledImmediateInvocation_$) {
                var $nextTask$$ = $JSCompiler_StaticMethods_nextTask_$$($JSCompiler_StaticMethods_schedule_$self$$);
                $nextTask$$ && ($nextTask$$.$immediateTriggerCondition_$() ? ($JSCompiler_StaticMethods_schedule_$self$$.$scheduledImmediateInvocation_$ = !0, 
                $JSCompiler_StaticMethods_executeAsap_$$($JSCompiler_StaticMethods_schedule_$self$$)) : $nextTask$$.$useRequestIdleCallback_$() && $JSCompiler_StaticMethods_schedule_$self$$.$win_$.requestIdleCallback ? $onIdle$$module$src$chunk$$($JSCompiler_StaticMethods_schedule_$self$$.$win_$, $JSCompiler_StaticMethods_schedule_$self$$.$boundExecute_$) : $JSCompiler_StaticMethods_requestMacroTask_$$($JSCompiler_StaticMethods_schedule_$self$$));
            }
        }
        function $JSCompiler_StaticMethods_nextTask_$$($JSCompiler_StaticMethods_nextTask_$self$$, $opt_dequeue$$) {
            let $t$jscomp$5$$ = $JSCompiler_StaticMethods_nextTask_$self$$.$tasks_$.peek();
            for (;$t$jscomp$5$$ && "not_run" !== $t$jscomp$5$$.state; ) $JSCompiler_StaticMethods_nextTask_$self$$.$tasks_$.dequeue(), 
            $t$jscomp$5$$ = $JSCompiler_StaticMethods_nextTask_$self$$.$tasks_$.peek();
            $t$jscomp$5$$ && $opt_dequeue$$ && $JSCompiler_StaticMethods_nextTask_$self$$.$tasks_$.dequeue();
            return $t$jscomp$5$$;
        }
        function $JSCompiler_StaticMethods_requestMacroTask_$$($JSCompiler_StaticMethods_requestMacroTask_$self$$) {
            $JSCompiler_StaticMethods_requestMacroTask_$self$$.$win_$.postMessage("amp-macro-task", "*");
        }
        function $JSCompiler_StaticMethods_executeAsap_$$($JSCompiler_StaticMethods_executeAsap_$self$$) {
            $JSCompiler_StaticMethods_executeAsap_$self$$.$bodyIsVisible_$ && 5 < $JSCompiler_StaticMethods_executeAsap_$self$$.$durationOfLastExecution_$ ? ($JSCompiler_StaticMethods_executeAsap_$self$$.$durationOfLastExecution_$ = 0, 
            $JSCompiler_StaticMethods_requestMacroTask_$$($JSCompiler_StaticMethods_executeAsap_$self$$)) : $resolved$$module$src$chunk$$.then(() => {
                $JSCompiler_StaticMethods_executeAsap_$self$$.$boundExecute_$(null);
            });
        }
        class $Chunks$$module$src$chunk$$ {
            constructor($ampDoc$jscomp$2$$) {
                this.ampdoc = $ampDoc$jscomp$2$$;
                this.$win_$ = $ampDoc$jscomp$2$$.win;
                this.$tasks_$ = new $PriorityQueue$$module$src$utils$priority_queue$$;
                this.$boundExecute_$ = this.$execute_$.bind(this);
                this.$durationOfLastExecution_$ = 0;
                this.$scheduledImmediateInvocation_$ = !1;
                this.$bodyIsVisible_$ = this.$win_$.document.documentElement.hasAttribute("i-amphtml-no-boilerplate");
                this.$win_$.addEventListener("message", $ampDoc$jscomp$2$$ => {
                    "amp-macro-task" == $ampDoc$jscomp$2$$.data && this.$execute_$(null);
                });
                this.$coreReady_$ = !1;
                $getServicePromiseInternal$$module$src$service$$($getAmpdocServiceHolder$$module$src$service$$($ampDoc$jscomp$2$$), "viewer").then(() => {
                    this.$coreReady_$ = !0;
                });
                $ampDoc$jscomp$2$$.onVisibilityChanged(() => {
                    $ampDoc$jscomp$2$$.isVisible() && $JSCompiler_StaticMethods_schedule_$$(this);
                });
            }
            run($fn$jscomp$12_t$jscomp$3$$, $priority$jscomp$5$$) {
                $fn$jscomp$12_t$jscomp$3$$ = new $Task$$module$src$chunk$$($fn$jscomp$12_t$jscomp$3$$);
                this.$tasks_$.enqueue($fn$jscomp$12_t$jscomp$3$$, $priority$jscomp$5$$);
                $JSCompiler_StaticMethods_schedule_$$(this);
            }
            runForStartup($fn$jscomp$13_t$jscomp$4$$) {
                $fn$jscomp$13_t$jscomp$4$$ = new $StartupTask$$module$src$chunk$$($fn$jscomp$13_t$jscomp$4$$, this.$win_$, this);
                this.$tasks_$.enqueue($fn$jscomp$13_t$jscomp$4$$, Number.POSITIVE_INFINITY);
                $JSCompiler_StaticMethods_schedule_$$(this);
            }
            $execute_$($idleDeadline$jscomp$1$$) {
                let $t$jscomp$6$$ = $JSCompiler_StaticMethods_nextTask_$$(this, !0);
                if (!$t$jscomp$6$$) return this.$scheduledImmediateInvocation_$ = !1, this.$durationOfLastExecution_$ = 0, 
                !1;
                let $before$jscomp$2$$;
                try {
                    $before$jscomp$2$$ = Date.now(), $JSCompiler_StaticMethods_runTask_$$($t$jscomp$6$$, $idleDeadline$jscomp$1$$);
                } finally {
                    $resolved$$module$src$chunk$$.then().then().then().then().then().then().then().then().then(() => {
                        this.$scheduledImmediateInvocation_$ = !1;
                        this.$durationOfLastExecution_$ += Date.now() - $before$jscomp$2$$;
                        $JSCompiler_StaticMethods_schedule_$$(this);
                    });
                }
                return !0;
            }
        }
        function $onIdle$$module$src$chunk$$($win$jscomp$165$$, $fn$jscomp$14$$) {
            function $rIC$$($info$jscomp$1$$) {
                if (15 > $info$jscomp$1$$.timeRemaining()) {
                    let $remainingTimeout$$ = 2e3 - (Date.now() - $startTime$jscomp$8$$);
                    0 >= $remainingTimeout$$ || $info$jscomp$1$$.didTimeout ? $fn$jscomp$14$$($info$jscomp$1$$) : $win$jscomp$165$$.requestIdleCallback($rIC$$, {
                        timeout: $remainingTimeout$$
                    });
                } else $fn$jscomp$14$$($info$jscomp$1$$);
            }
            let $startTime$jscomp$8$$ = Date.now();
            $win$jscomp$165$$.requestIdleCallback($rIC$$, {
                timeout: 2e3
            });
        }
        function $JSCompiler_StaticMethods_evalMajorVersion_$$($JSCompiler_StaticMethods_evalMajorVersion_$self_res$jscomp$13$$, $expr$jscomp$5$$, $index$jscomp$85$$) {
            if (!$JSCompiler_StaticMethods_evalMajorVersion_$self_res$jscomp$13$$.$navigator_$.userAgent) return 0;
            $JSCompiler_StaticMethods_evalMajorVersion_$self_res$jscomp$13$$ = $JSCompiler_StaticMethods_evalMajorVersion_$self_res$jscomp$13$$.$navigator_$.userAgent.match($expr$jscomp$5$$);
            return !$JSCompiler_StaticMethods_evalMajorVersion_$self_res$jscomp$13$$ || $index$jscomp$85$$ >= $JSCompiler_StaticMethods_evalMajorVersion_$self_res$jscomp$13$$.length ? 0 : parseInt($JSCompiler_StaticMethods_evalMajorVersion_$self_res$jscomp$13$$[$index$jscomp$85$$], 10);
        }
        class $Platform$$module$src$service$platform_impl$$ {
            constructor($win$jscomp$186$$) {
                this.$navigator_$ = $win$jscomp$186$$.navigator;
                this.$win_$ = $win$jscomp$186$$;
            }
            isAndroid() {
                return /Android/i.test(this.$navigator_$.userAgent);
            }
            isIos() {
                return /iPhone|iPad|iPod/i.test(this.$navigator_$.userAgent);
            }
            isSafari() {
                return /Safari/i.test(this.$navigator_$.userAgent) && !this.isChrome() && !this.isIe() && !this.isEdge() && !this.isFirefox() && !this.isOpera();
            }
            isChrome() {
                return /Chrome|CriOS/i.test(this.$navigator_$.userAgent) && !this.isEdge() && !this.isOpera();
            }
            isFirefox() {
                return /Firefox|FxiOS/i.test(this.$navigator_$.userAgent) && !this.isEdge();
            }
            isOpera() {
                return /OPR\/|Opera|OPiOS/i.test(this.$navigator_$.userAgent);
            }
            isIe() {
                return !1;
            }
            isEdge() {
                return /Edge/i.test(this.$navigator_$.userAgent);
            }
            isWebKit() {
                return /WebKit/i.test(this.$navigator_$.userAgent) && !this.isEdge();
            }
            isWindows() {
                return /Windows/i.test(this.$navigator_$.userAgent);
            }
            isStandalone() {
                return this.isIos() && this.$navigator_$.standalone || this.isChrome() && this.$win_$.matchMedia("(display-mode: standalone)").matches;
            }
            isBot() {
                return /bot/i.test(this.$navigator_$.userAgent);
            }
            getMajorVersion() {
                return this.isSafari() ? this.isIos() ? this.getIosMajorVersion() || 0 : $JSCompiler_StaticMethods_evalMajorVersion_$$(this, /\sVersion\/(\d+)/, 1) : this.isChrome() ? $JSCompiler_StaticMethods_evalMajorVersion_$$(this, /(Chrome|CriOS)\/(\d+)/, 2) : this.isFirefox() ? $JSCompiler_StaticMethods_evalMajorVersion_$$(this, /(Firefox|FxiOS)\/(\d+)/, 2) : this.isOpera() ? $JSCompiler_StaticMethods_evalMajorVersion_$$(this, /(OPR|Opera|OPiOS)\/(\d+)/, 2) : this.isIe() ? $JSCompiler_StaticMethods_evalMajorVersion_$$(this, /MSIE\s(\d+)/, 1) : this.isEdge() ? $JSCompiler_StaticMethods_evalMajorVersion_$$(this, /Edge\/(\d+)/, 1) : 0;
            }
            getIosVersionString() {
                if (!this.$navigator_$.userAgent || !this.isIos()) return "";
                let $version$jscomp$5$$ = this.$navigator_$.userAgent.match(/OS ([0-9]+[_.][0-9]+([_.][0-9]+)?)\b/);
                return $version$jscomp$5$$ ? $version$jscomp$5$$ = $version$jscomp$5$$[1].replace(/_/g, ".") : "";
            }
            getIosMajorVersion() {
                let $currentIosVersion$$ = this.getIosVersionString();
                return "" == $currentIosVersion$$ ? null : Number($currentIosVersion$$.split(".")[0]);
            }
        }
        function $isDocumentReady$$module$src$document_ready$$($doc$jscomp$32$$) {
            return "loading" != $doc$jscomp$32$$.readyState && "uninitialized" != $doc$jscomp$32$$.readyState;
        }
        function $isDocumentComplete$$module$src$document_ready$$($doc$jscomp$33$$) {
            return "complete" == $doc$jscomp$33$$.readyState;
        }
        function $onDocumentReady$$module$src$document_ready$$($doc$jscomp$34$$, $callback$jscomp$80$$) {
            $onDocumentState$$module$src$document_ready$$($doc$jscomp$34$$, $isDocumentReady$$module$src$document_ready$$, $callback$jscomp$80$$);
        }
        function $onDocumentState$$module$src$document_ready$$($doc$jscomp$35$$, $stateFn$$, $callback$jscomp$81$$) {
            let $ready$$ = $stateFn$$($doc$jscomp$35$$);
            if ($ready$$) $callback$jscomp$81$$($doc$jscomp$35$$); else {
                let $readyListener$$ = () => {
                    $stateFn$$($doc$jscomp$35$$) && ($ready$$ || ($ready$$ = !0, $callback$jscomp$81$$($doc$jscomp$35$$)), 
                    $doc$jscomp$35$$.removeEventListener("readystatechange", $readyListener$$));
                };
                $doc$jscomp$35$$.addEventListener("readystatechange", $readyListener$$);
            }
        }
        function $whenDocumentReady$$module$src$document_ready$$($doc$jscomp$36$$) {
            return new Promise($resolve$jscomp$29$$ => {
                $onDocumentReady$$module$src$document_ready$$($doc$jscomp$36$$, $resolve$jscomp$29$$);
            });
        }
        function $whenDocumentComplete$$module$src$document_ready$$($doc$jscomp$37$$) {
            return new Promise($resolve$jscomp$30$$ => {
                $onDocumentState$$module$src$document_ready$$($doc$jscomp$37$$, $isDocumentComplete$$module$src$document_ready$$, $resolve$jscomp$30$$);
            });
        }
        function $bezierCurve$$module$src$curve$$($x1$jscomp$6$$, $y1$jscomp$6$$, $x2$jscomp$3$$) {
            let $bezier$$ = new $Bezier$$module$src$curve$$(0, 0, $x1$jscomp$6$$, $y1$jscomp$6$$, $x2$jscomp$3$$, 1, 1, 1);
            $bezier$$.solveYValueFromXValue.bind($bezier$$);
        }
        class $Bezier$$module$src$curve$$ {
            constructor($x0$jscomp$3$$, $y0$jscomp$3$$, $x1$jscomp$7$$, $y1$jscomp$7$$, $x2$jscomp$4$$, $y2$jscomp$4$$, $x3$$, $y3$$) {
                this.x0 = $x0$jscomp$3$$;
                this.y0 = $y0$jscomp$3$$;
                this.x1 = $x1$jscomp$7$$;
                this.y1 = $y1$jscomp$7$$;
                this.x2 = $x2$jscomp$4$$;
                this.y2 = $y2$jscomp$4$$;
                this.x3 = $x3$$;
                this.y3 = $y3$$;
            }
            solveYValueFromXValue($xVal$$) {
                return this.getPointY(this.solvePositionFromXValue($xVal$$));
            }
            solvePositionFromXValue($xVal$jscomp$1$$) {
                let $t$jscomp$7$$ = ($xVal$jscomp$1$$ - this.x0) / (this.x3 - this.x0);
                if (0 >= $t$jscomp$7$$) return 0;
                if (1 <= $t$jscomp$7$$) return 1;
                let $tMin$$ = 0, $tMax$$ = 1, $value$jscomp$145$$ = 0;
                for (var $i$jscomp$104_i$jscomp$105$$ = 0; 8 > $i$jscomp$104_i$jscomp$105$$; $i$jscomp$104_i$jscomp$105$$++) {
                    $value$jscomp$145$$ = this.getPointX($t$jscomp$7$$);
                    let $i$jscomp$104_i$jscomp$105$$ = (this.getPointX($t$jscomp$7$$ + 1e-6) - $value$jscomp$145$$) / 1e-6;
                    if (1e-6 > Math.abs($value$jscomp$145$$ - $xVal$jscomp$1$$)) return $t$jscomp$7$$;
                    if (1e-6 > Math.abs($i$jscomp$104_i$jscomp$105$$)) break; else $value$jscomp$145$$ < $xVal$jscomp$1$$ ? $tMin$$ = $t$jscomp$7$$ : $tMax$$ = $t$jscomp$7$$, 
                    $t$jscomp$7$$ -= ($value$jscomp$145$$ - $xVal$jscomp$1$$) / $i$jscomp$104_i$jscomp$105$$;
                }
                for ($i$jscomp$104_i$jscomp$105$$ = 0; 1e-6 < Math.abs($value$jscomp$145$$ - $xVal$jscomp$1$$) && 8 > $i$jscomp$104_i$jscomp$105$$; $i$jscomp$104_i$jscomp$105$$++) $value$jscomp$145$$ < $xVal$jscomp$1$$ ? ($tMin$$ = $t$jscomp$7$$, 
                $t$jscomp$7$$ = ($t$jscomp$7$$ + $tMax$$) / 2) : ($tMax$$ = $t$jscomp$7$$, $t$jscomp$7$$ = ($t$jscomp$7$$ + $tMin$$) / 2), 
                $value$jscomp$145$$ = this.getPointX($t$jscomp$7$$);
                return $t$jscomp$7$$;
            }
            getPointX($t$jscomp$8$$) {
                if (0 == $t$jscomp$8$$) return this.x0;
                if (1 == $t$jscomp$8$$) return this.x3;
                let $ix0$$ = this.lerp(this.x0, this.x1, $t$jscomp$8$$), $ix1$$ = this.lerp(this.x1, this.x2, $t$jscomp$8$$);
                let $ix2$$ = this.lerp(this.x2, this.x3, $t$jscomp$8$$);
                $ix0$$ = this.lerp($ix0$$, $ix1$$, $t$jscomp$8$$);
                $ix1$$ = this.lerp($ix1$$, $ix2$$, $t$jscomp$8$$);
                return this.lerp($ix0$$, $ix1$$, $t$jscomp$8$$);
            }
            getPointY($t$jscomp$9$$) {
                if (0 == $t$jscomp$9$$) return this.y0;
                if (1 == $t$jscomp$9$$) return this.y3;
                let $iy0$$ = this.lerp(this.y0, this.y1, $t$jscomp$9$$), $iy1$$ = this.lerp(this.y1, this.y2, $t$jscomp$9$$);
                let $iy2$$ = this.lerp(this.y2, this.y3, $t$jscomp$9$$);
                $iy0$$ = this.lerp($iy0$$, $iy1$$, $t$jscomp$9$$);
                $iy1$$ = this.lerp($iy1$$, $iy2$$, $t$jscomp$9$$);
                return this.lerp($iy0$$, $iy1$$, $t$jscomp$9$$);
            }
            lerp($a$jscomp$5$$, $b$jscomp$5$$, $x$jscomp$85$$) {
                return $a$jscomp$5$$ + $x$jscomp$85$$ * ($b$jscomp$5$$ - $a$jscomp$5$$);
            }
        }
        $bezierCurve$$module$src$curve$$(.25, .1, .25);
        $bezierCurve$$module$src$curve$$(.42, 0, 1);
        $bezierCurve$$module$src$curve$$(0, 0, .58);
        $bezierCurve$$module$src$curve$$(.42, 0, .58);
        function $addDocumentVisibilityChangeListener$$module$src$utils$document_visibility$$($doc$jscomp$52$$, $handler$jscomp$33$$) {
            if ($doc$jscomp$52$$.addEventListener) {
                var $visibilityChangeEvent$$ = $getVisibilityChangeEvent$$module$src$utils$document_visibility$$($doc$jscomp$52$$);
                $visibilityChangeEvent$$ && $doc$jscomp$52$$.addEventListener($visibilityChangeEvent$$, $handler$jscomp$33$$);
            }
        }
        function $getVisibilityChangeEvent$$module$src$utils$document_visibility$$($doc$jscomp$54_hiddenProp$jscomp$1$$) {
            $doc$jscomp$54_hiddenProp$jscomp$1$$ = $getVendorJsPropertyName$$module$src$style$$($doc$jscomp$54_hiddenProp$jscomp$1$$, "hidden", !0);
            let $vendorStop$$ = $doc$jscomp$54_hiddenProp$jscomp$1$$.indexOf("Hidden");
            return -1 != $vendorStop$$ ? $doc$jscomp$54_hiddenProp$jscomp$1$$.substring(0, $vendorStop$$) + "Visibilitychange" : "visibilitychange";
        }
        (function() {
            $logConstructor$$module$src$log$$ = $Log$$module$src$log$$;
            $dev$$module$src$log$$();
            $user$$module$src$log$$();
        })();
        (function($fn$jscomp$1$$) {
            self.__AMP_REPORT_ERROR = $fn$jscomp$1$$;
        })(function($JSCompiler_inline_result$jscomp$214_JSCompiler_root$jscomp$inline_233_win$jscomp$102$$, $JSCompiler_vars$jscomp$inline_181_error$jscomp$16$$, $opt_associatedElement$$) {
            $reportError$$module$src$error$$($JSCompiler_vars$jscomp$inline_181_error$jscomp$16$$, $opt_associatedElement$$);
            $JSCompiler_vars$jscomp$inline_181_error$jscomp$16$$ && $JSCompiler_inline_result$jscomp$214_JSCompiler_root$jscomp$inline_233_win$jscomp$102$$ && $isUserErrorMessage$$module$src$log$$($JSCompiler_vars$jscomp$inline_181_error$jscomp$16$$.message) && !(0 <= $JSCompiler_vars$jscomp$inline_181_error$jscomp$16$$.message.indexOf("​​​​")) && $Services$$module$src$services$ampdocServiceFor$$($JSCompiler_inline_result$jscomp$214_JSCompiler_root$jscomp$inline_233_win$jscomp$102$$).isSingleDoc() && ($JSCompiler_vars$jscomp$inline_181_error$jscomp$16$$ = $dict$$module$src$utils$object$$({
                errorName: $JSCompiler_vars$jscomp$inline_181_error$jscomp$16$$.name,
                errorMessage: $JSCompiler_vars$jscomp$inline_181_error$jscomp$16$$.message
            }), $JSCompiler_inline_result$jscomp$214_JSCompiler_root$jscomp$inline_233_win$jscomp$102$$ = $Services$$module$src$services$ampdocServiceFor$$($JSCompiler_inline_result$jscomp$214_JSCompiler_root$jscomp$inline_233_win$jscomp$102$$).getSingleDoc().getRootNode(), 
            $JSCompiler_inline_result$jscomp$214_JSCompiler_root$jscomp$inline_233_win$jscomp$102$$ = $JSCompiler_inline_result$jscomp$214_JSCompiler_root$jscomp$inline_233_win$jscomp$102$$.documentElement || $JSCompiler_inline_result$jscomp$214_JSCompiler_root$jscomp$inline_233_win$jscomp$102$$.body || $JSCompiler_inline_result$jscomp$214_JSCompiler_root$jscomp$inline_233_win$jscomp$102$$, 
            $triggerAnalyticsEvent$$module$src$analytics$$($JSCompiler_inline_result$jscomp$214_JSCompiler_root$jscomp$inline_233_win$jscomp$102$$, $JSCompiler_vars$jscomp$inline_181_error$jscomp$16$$));
        }.bind(null, self));
        function $fontStylesheetTimeout$$module$src$font_stylesheet_timeout$$() {
            var $win$jscomp$221$$ = self;
            $onDocumentReady$$module$src$document_ready$$($win$jscomp$221$$.document, () => $maybeTimeoutFonts$$module$src$font_stylesheet_timeout$$($win$jscomp$221$$));
        }
        function $maybeTimeoutFonts$$module$src$font_stylesheet_timeout$$($win$jscomp$222$$) {
            let $timeSinceNavigationStart$$ = 1500;
            let $perf$jscomp$2$$ = $win$jscomp$222$$.performance;
            $perf$jscomp$2$$ && $perf$jscomp$2$$.timing && $perf$jscomp$2$$.timing.navigationStart && ($timeSinceNavigationStart$$ = Date.now() - $perf$jscomp$2$$.timing.navigationStart);
            let $timeout$jscomp$7$$ = Math.max(1, 2100 - $timeSinceNavigationStart$$);
            $win$jscomp$222$$.setTimeout(() => {
                $timeoutFontFaces$$module$src$font_stylesheet_timeout$$($win$jscomp$222$$);
                let $timeSinceNavigationStart$$ = $win$jscomp$222$$.document.styleSheets;
                if ($timeSinceNavigationStart$$) {
                    var $perf$jscomp$2$$ = $win$jscomp$222$$.document.querySelectorAll(`link[rel~="stylesheet"]:not([href^="${CSS.escape($urls$$module$src$config$$.cdn)}"])`), $timedoutStyleSheets$$ = [];
                    for (var $i$jscomp$137_i$jscomp$138$$ = 0; $i$jscomp$137_i$jscomp$138$$ < $perf$jscomp$2$$.length; $i$jscomp$137_i$jscomp$138$$++) {
                        let $win$jscomp$222$$ = $perf$jscomp$2$$[$i$jscomp$137_i$jscomp$138$$];
                        let $timeout$jscomp$7$$ = !1;
                        for (let $perf$jscomp$2$$ = 0; $perf$jscomp$2$$ < $timeSinceNavigationStart$$.length; $perf$jscomp$2$$++) if ($timeSinceNavigationStart$$[$perf$jscomp$2$$].ownerNode == $win$jscomp$222$$) {
                            $timeout$jscomp$7$$ = !0;
                            break;
                        }
                        $timeout$jscomp$7$$ || $timedoutStyleSheets$$.push($win$jscomp$222$$);
                    }
                    for ($i$jscomp$137_i$jscomp$138$$ = 0; $i$jscomp$137_i$jscomp$138$$ < $timedoutStyleSheets$$.length; $i$jscomp$137_i$jscomp$138$$++) {
                        let $timeSinceNavigationStart$$ = $timedoutStyleSheets$$[$i$jscomp$137_i$jscomp$138$$], $perf$jscomp$2$$ = $timeSinceNavigationStart$$.media || "all";
                        $timeSinceNavigationStart$$.media = "print";
                        $timeSinceNavigationStart$$.onload = () => {
                            $timeSinceNavigationStart$$.media = $perf$jscomp$2$$;
                            $timeoutFontFaces$$module$src$font_stylesheet_timeout$$($win$jscomp$222$$);
                        };
                        $timeSinceNavigationStart$$.setAttribute("i-amphtml-timeout", $timeout$jscomp$7$$);
                        $timeSinceNavigationStart$$.parentNode.insertBefore($timeSinceNavigationStart$$, $timeSinceNavigationStart$$.nextSibling);
                    }
                }
            }, $timeout$jscomp$7$$);
        }
        function $timeoutFontFaces$$module$src$font_stylesheet_timeout$$($doc$jscomp$55_entry$jscomp$5_win$jscomp$223$$) {
            $doc$jscomp$55_entry$jscomp$5_win$jscomp$223$$ = $doc$jscomp$55_entry$jscomp$5_win$jscomp$223$$.document;
            if ($doc$jscomp$55_entry$jscomp$5_win$jscomp$223$$.fonts && $doc$jscomp$55_entry$jscomp$5_win$jscomp$223$$.fonts.values) for (var $it$$ = $doc$jscomp$55_entry$jscomp$5_win$jscomp$223$$.fonts.values(); $doc$jscomp$55_entry$jscomp$5_win$jscomp$223$$ = $it$$.next(); ) {
                let $it$$ = $doc$jscomp$55_entry$jscomp$5_win$jscomp$223$$.value;
                if (!$it$$) break;
                "loading" == $it$$.status && "display" in $it$$ && "auto" == $it$$.display && ($it$$.display = "swap");
            }
        }
        function $isStoryDocument$$module$src$utils$story$$($ampdoc$jscomp$98$$) {
            return $ampdoc$jscomp$98$$.waitForBodyOpen().then(() => {
                let $body$jscomp$10$$ = $ampdoc$jscomp$98$$.getBody(), $childPromise$$ = $waitForChildPromise$$module$src$dom$$($body$jscomp$10$$, () => !!$body$jscomp$10$$.firstElementChild);
                return $getService$$module$src$service$$($ampdoc$jscomp$98$$.win, "timer").timeoutPromise(2e3, $childPromise$$).then(() => "AMP-STORY" === $body$jscomp$10$$.firstElementChild.tagName, () => !1);
            });
        }
        class $AmpDocService$$module$src$service$ampdoc_impl$$ {
            constructor($JSCompiler_inline_result$jscomp$12_win$jscomp$225$$, $isSingleDoc$$, $JSCompiler_arr$jscomp$inline_275_JSCompiler_branches$jscomp$inline_239_JSCompiler_experimentId$jscomp$inline_273_JSCompiler_inline_result$jscomp$29_JSCompiler_temp$jscomp$248_opt_initParams$jscomp$2$$) {
                this.win = $JSCompiler_inline_result$jscomp$12_win$jscomp$225$$;
                this.$singleDoc_$ = null;
                if ($isSingleDoc$$) {
                    {
                        let $isSingleDoc$$ = $map$$module$src$utils$object$$();
                        $JSCompiler_arr$jscomp$inline_275_JSCompiler_branches$jscomp$inline_239_JSCompiler_experimentId$jscomp$inline_273_JSCompiler_inline_result$jscomp$29_JSCompiler_temp$jscomp$248_opt_initParams$jscomp$2$$ ? Object.assign($isSingleDoc$$, $JSCompiler_arr$jscomp$inline_275_JSCompiler_branches$jscomp$inline_239_JSCompiler_experimentId$jscomp$inline_273_JSCompiler_inline_result$jscomp$29_JSCompiler_temp$jscomp$248_opt_initParams$jscomp$2$$) : ($JSCompiler_inline_result$jscomp$12_win$jscomp$225$$.name && 0 == $JSCompiler_inline_result$jscomp$12_win$jscomp$225$$.name.indexOf("__AMP__") && Object.assign($isSingleDoc$$, $parseQueryString_$$module$src$url_parse_query_string$$($JSCompiler_inline_result$jscomp$12_win$jscomp$225$$.name.substring(7))), 
                        $JSCompiler_inline_result$jscomp$12_win$jscomp$225$$.location && $JSCompiler_inline_result$jscomp$12_win$jscomp$225$$.location.hash && Object.assign($isSingleDoc$$, $parseQueryString_$$module$src$url_parse_query_string$$($JSCompiler_inline_result$jscomp$12_win$jscomp$225$$.location.hash)));
                        $JSCompiler_arr$jscomp$inline_275_JSCompiler_branches$jscomp$inline_239_JSCompiler_experimentId$jscomp$inline_273_JSCompiler_inline_result$jscomp$29_JSCompiler_temp$jscomp$248_opt_initParams$jscomp$2$$ = $isSingleDoc$$;
                    }
                    this.$singleDoc_$ = new $AmpDocSingle$$module$src$service$ampdoc_impl$$($JSCompiler_inline_result$jscomp$12_win$jscomp$225$$, {
                        params: $JSCompiler_arr$jscomp$inline_275_JSCompiler_branches$jscomp$inline_239_JSCompiler_experimentId$jscomp$inline_273_JSCompiler_inline_result$jscomp$29_JSCompiler_temp$jscomp$248_opt_initParams$jscomp$2$$
                    });
                    $JSCompiler_inline_result$jscomp$12_win$jscomp$225$$.document.__AMPDOC = this.$singleDoc_$;
                }
                if ($experimentToggles$$module$src$experiments$$($JSCompiler_inline_result$jscomp$12_win$jscomp$225$$)["ampdoc-fie"]) {
                    $JSCompiler_inline_result$jscomp$12_win$jscomp$225$$.__AMP_EXPERIMENT_BRANCHES = $JSCompiler_inline_result$jscomp$12_win$jscomp$225$$.__AMP_EXPERIMENT_BRANCHES || {};
                    for (let $isSingleDoc$$ in $EXPERIMENT_INFO_MAP$$module$src$ampdoc_fie$$) if ($hasOwn_$$module$src$utils$object$$.call($EXPERIMENT_INFO_MAP$$module$src$ampdoc_fie$$, $isSingleDoc$$) && !$hasOwn_$$module$src$utils$object$$.call($JSCompiler_inline_result$jscomp$12_win$jscomp$225$$.__AMP_EXPERIMENT_BRANCHES, $isSingleDoc$$)) if ($EXPERIMENT_INFO_MAP$$module$src$ampdoc_fie$$[$isSingleDoc$$].isTrafficEligible && $EXPERIMENT_INFO_MAP$$module$src$ampdoc_fie$$[$isSingleDoc$$].isTrafficEligible($JSCompiler_inline_result$jscomp$12_win$jscomp$225$$)) {
                        if ($JSCompiler_arr$jscomp$inline_275_JSCompiler_branches$jscomp$inline_239_JSCompiler_experimentId$jscomp$inline_273_JSCompiler_inline_result$jscomp$29_JSCompiler_temp$jscomp$248_opt_initParams$jscomp$2$$ = !$JSCompiler_inline_result$jscomp$12_win$jscomp$225$$.__AMP_EXPERIMENT_BRANCHES[$isSingleDoc$$]) $JSCompiler_arr$jscomp$inline_275_JSCompiler_branches$jscomp$inline_239_JSCompiler_experimentId$jscomp$inline_273_JSCompiler_inline_result$jscomp$29_JSCompiler_temp$jscomp$248_opt_initParams$jscomp$2$$ = $isSingleDoc$$, 
                        $JSCompiler_arr$jscomp$inline_275_JSCompiler_branches$jscomp$inline_239_JSCompiler_experimentId$jscomp$inline_273_JSCompiler_inline_result$jscomp$29_JSCompiler_temp$jscomp$248_opt_initParams$jscomp$2$$ = !!$experimentToggles$$module$src$experiments$$($JSCompiler_inline_result$jscomp$12_win$jscomp$225$$)[$JSCompiler_arr$jscomp$inline_275_JSCompiler_branches$jscomp$inline_239_JSCompiler_experimentId$jscomp$inline_273_JSCompiler_inline_result$jscomp$29_JSCompiler_temp$jscomp$248_opt_initParams$jscomp$2$$];
                        $JSCompiler_arr$jscomp$inline_275_JSCompiler_branches$jscomp$inline_239_JSCompiler_experimentId$jscomp$inline_273_JSCompiler_inline_result$jscomp$29_JSCompiler_temp$jscomp$248_opt_initParams$jscomp$2$$ && (({branches: $JSCompiler_arr$jscomp$inline_275_JSCompiler_branches$jscomp$inline_239_JSCompiler_experimentId$jscomp$inline_273_JSCompiler_inline_result$jscomp$29_JSCompiler_temp$jscomp$248_opt_initParams$jscomp$2$$} = $EXPERIMENT_INFO_MAP$$module$src$ampdoc_fie$$[$isSingleDoc$$]), 
                        $JSCompiler_inline_result$jscomp$12_win$jscomp$225$$.__AMP_EXPERIMENT_BRANCHES[$isSingleDoc$$] = $JSCompiler_arr$jscomp$inline_275_JSCompiler_branches$jscomp$inline_239_JSCompiler_experimentId$jscomp$inline_273_JSCompiler_inline_result$jscomp$29_JSCompiler_temp$jscomp$248_opt_initParams$jscomp$2$$[Math.floor(Math.random() * $JSCompiler_arr$jscomp$inline_275_JSCompiler_branches$jscomp$inline_239_JSCompiler_experimentId$jscomp$inline_273_JSCompiler_inline_result$jscomp$29_JSCompiler_temp$jscomp$248_opt_initParams$jscomp$2$$.length)] || null);
                    } else $JSCompiler_inline_result$jscomp$12_win$jscomp$225$$.__AMP_EXPERIMENT_BRANCHES[$isSingleDoc$$] = null;
                    $JSCompiler_inline_result$jscomp$12_win$jscomp$225$$ = "21065002" === ($JSCompiler_inline_result$jscomp$12_win$jscomp$225$$.__AMP_EXPERIMENT_BRANCHES ? $JSCompiler_inline_result$jscomp$12_win$jscomp$225$$.__AMP_EXPERIMENT_BRANCHES["ampdoc-fie"] : null);
                } else $JSCompiler_inline_result$jscomp$12_win$jscomp$225$$ = !1;
                this.$ampdocFieExperimentOn_$ = $JSCompiler_inline_result$jscomp$12_win$jscomp$225$$;
                this.$mightHaveShadowRoots_$ = !$isSingleDoc$$;
            }
            isSingleDoc() {
                return !!this.$singleDoc_$;
            }
            getSingleDoc() {
                return $devAssert$$module$src$log$$(this.$singleDoc_$);
            }
            getAmpDocIfAvailable($node$jscomp$34$$) {
                if (this.$ampdocFieExperimentOn_$) {
                    for ($n$jscomp$17_n$jscomp$18_rootNode$jscomp$4_shadowRoot$jscomp$14$$ = $node$jscomp$34$$; $n$jscomp$17_n$jscomp$18_rootNode$jscomp$4_shadowRoot$jscomp$14$$; ) {
                        let $cachedAmpDoc$$ = $node$jscomp$34$$.everAttached && "function" === typeof $node$jscomp$34$$.getAmpDoc ? $node$jscomp$34$$.getAmpDoc() : null;
                        if ($cachedAmpDoc$$) return $cachedAmpDoc$$;
                        $n$jscomp$17_n$jscomp$18_rootNode$jscomp$4_shadowRoot$jscomp$14$$ = $rootNodeFor$$module$src$dom$$($n$jscomp$17_n$jscomp$18_rootNode$jscomp$4_shadowRoot$jscomp$14$$);
                        if (!$n$jscomp$17_n$jscomp$18_rootNode$jscomp$4_shadowRoot$jscomp$14$$) break;
                        var $ampdoc$jscomp$100_ampdoc$jscomp$101_cachedAmpDoc$jscomp$1_frameElement$jscomp$3$$ = $n$jscomp$17_n$jscomp$18_rootNode$jscomp$4_shadowRoot$jscomp$14$$.__AMPDOC;
                        if ($ampdoc$jscomp$100_ampdoc$jscomp$101_cachedAmpDoc$jscomp$1_frameElement$jscomp$3$$) return $ampdoc$jscomp$100_ampdoc$jscomp$101_cachedAmpDoc$jscomp$1_frameElement$jscomp$3$$;
                        $n$jscomp$17_n$jscomp$18_rootNode$jscomp$4_shadowRoot$jscomp$14$$ = $n$jscomp$17_n$jscomp$18_rootNode$jscomp$4_shadowRoot$jscomp$14$$.host ? $n$jscomp$17_n$jscomp$18_rootNode$jscomp$4_shadowRoot$jscomp$14$$.host : $getParentWindowFrameElement$$module$src$service$$($n$jscomp$17_n$jscomp$18_rootNode$jscomp$4_shadowRoot$jscomp$14$$, this.win);
                    }
                    return null;
                }
                for (var $n$jscomp$17_n$jscomp$18_rootNode$jscomp$4_shadowRoot$jscomp$14$$ = $node$jscomp$34$$; $n$jscomp$17_n$jscomp$18_rootNode$jscomp$4_shadowRoot$jscomp$14$$; ) {
                    if ($ampdoc$jscomp$100_ampdoc$jscomp$101_cachedAmpDoc$jscomp$1_frameElement$jscomp$3$$ = $node$jscomp$34$$.everAttached && "function" === typeof $node$jscomp$34$$.getAmpDoc ? $node$jscomp$34$$.getAmpDoc() : null) return $ampdoc$jscomp$100_ampdoc$jscomp$101_cachedAmpDoc$jscomp$1_frameElement$jscomp$3$$;
                    if ($ampdoc$jscomp$100_ampdoc$jscomp$101_cachedAmpDoc$jscomp$1_frameElement$jscomp$3$$ = $getParentWindowFrameElement$$module$src$service$$($n$jscomp$17_n$jscomp$18_rootNode$jscomp$4_shadowRoot$jscomp$14$$, this.win)) $n$jscomp$17_n$jscomp$18_rootNode$jscomp$4_shadowRoot$jscomp$14$$ = $ampdoc$jscomp$100_ampdoc$jscomp$101_cachedAmpDoc$jscomp$1_frameElement$jscomp$3$$; else {
                        if (!this.$mightHaveShadowRoots_$) break;
                        $n$jscomp$17_n$jscomp$18_rootNode$jscomp$4_shadowRoot$jscomp$14$$ = 9 == $n$jscomp$17_n$jscomp$18_rootNode$jscomp$4_shadowRoot$jscomp$14$$.nodeType ? $n$jscomp$17_n$jscomp$18_rootNode$jscomp$4_shadowRoot$jscomp$14$$ : $getShadowRootNode$$module$src$shadow_embed$$($n$jscomp$17_n$jscomp$18_rootNode$jscomp$4_shadowRoot$jscomp$14$$);
                        if (!$n$jscomp$17_n$jscomp$18_rootNode$jscomp$4_shadowRoot$jscomp$14$$) break;
                        if ($ampdoc$jscomp$100_ampdoc$jscomp$101_cachedAmpDoc$jscomp$1_frameElement$jscomp$3$$ = $n$jscomp$17_n$jscomp$18_rootNode$jscomp$4_shadowRoot$jscomp$14$$.__AMPDOC) return $ampdoc$jscomp$100_ampdoc$jscomp$101_cachedAmpDoc$jscomp$1_frameElement$jscomp$3$$;
                        $n$jscomp$17_n$jscomp$18_rootNode$jscomp$4_shadowRoot$jscomp$14$$ = $n$jscomp$17_n$jscomp$18_rootNode$jscomp$4_shadowRoot$jscomp$14$$.host;
                    }
                }
                return this.$singleDoc_$;
            }
            getAmpDoc($node$jscomp$35$$) {
                $devAssert$$module$src$log$$(void 0 === $node$jscomp$35$$.isConnected || !0 === $node$jscomp$35$$.isConnected);
                let $ampdoc$jscomp$102$$ = this.getAmpDocIfAvailable($node$jscomp$35$$);
                if (!$ampdoc$jscomp$102$$) throw $dev$$module$src$log$$().createError("No ampdoc found for", $node$jscomp$35$$);
                return $ampdoc$jscomp$102$$;
            }
            installShadowDoc($ampdoc$jscomp$103_url$jscomp$102$$, $shadowRoot$jscomp$15$$, $opt_options$jscomp$92$$) {
                this.$mightHaveShadowRoots_$ = !0;
                $devAssert$$module$src$log$$(!$shadowRoot$jscomp$15$$.__AMPDOC);
                $ampdoc$jscomp$103_url$jscomp$102$$ = new $AmpDocShadow$$module$src$service$ampdoc_impl$$(this.win, $ampdoc$jscomp$103_url$jscomp$102$$, $shadowRoot$jscomp$15$$, $opt_options$jscomp$92$$);
                return $shadowRoot$jscomp$15$$.__AMPDOC = $ampdoc$jscomp$103_url$jscomp$102$$;
            }
            installFieDoc($ampdoc$jscomp$104_url$jscomp$103$$, $childWin$jscomp$3$$, $opt_options$jscomp$93$$) {
                let $doc$jscomp$56$$ = $childWin$jscomp$3$$.document;
                $devAssert$$module$src$log$$(!$doc$jscomp$56$$.__AMPDOC);
                let $frameElement$jscomp$4$$ = $devAssert$$module$src$log$$($childWin$jscomp$3$$.frameElement);
                $ampdoc$jscomp$104_url$jscomp$103$$ = new $AmpDocFie$$module$src$service$ampdoc_impl$$($childWin$jscomp$3$$, $ampdoc$jscomp$104_url$jscomp$103$$, this.getAmpDoc($frameElement$jscomp$4$$), $opt_options$jscomp$93$$);
                return $doc$jscomp$56$$.__AMPDOC = $ampdoc$jscomp$104_url$jscomp$103$$;
            }
        }
        class $AmpDoc$$module$src$service$ampdoc_impl$$ {
            constructor($win$jscomp$226$$, $parent$jscomp$30$$, $opt_options$jscomp$94$$) {
                this.win = $win$jscomp$226$$;
                this.$hasTrackingIframe_$ = !1;
                this.$parent_$ = $parent$jscomp$30$$;
                this.$signals_$ = $opt_options$jscomp$94$$ && $opt_options$jscomp$94$$.signals || new $Signals$$module$src$utils$signals$$;
                this.$params_$ = $opt_options$jscomp$94$$ && $opt_options$jscomp$94$$.params || $map$$module$src$utils$object$$();
                this.$meta_$ = null;
                this.$declaredExtensions_$ = [];
                this.$visibilityStateOverride_$ = $opt_options$jscomp$94$$ && $opt_options$jscomp$94$$.visibilityState || this.$params_$.visibilityState && $dev$$module$src$log$$().assertEnumValue($VisibilityState$$module$src$visibility_state$$, this.$params_$.visibilityState, "VisibilityState") || null;
                this.$visibilityState_$ = null;
                this.$visibilityStateHandlers_$ = new $Observable$$module$src$observable$$;
                this.$lastVisibleTime_$ = null;
                this.$unsubsribes_$ = [];
                let $boundUpdateVisibilityState$$ = this.$updateVisibilityState_$.bind(this);
                this.$parent_$ && this.$unsubsribes_$.push(this.$parent_$.onVisibilityChanged($boundUpdateVisibilityState$$));
                $addDocumentVisibilityChangeListener$$module$src$utils$document_visibility$$(this.win.document, $boundUpdateVisibilityState$$);
                this.$unsubsribes_$.push(() => {
                    var $win$jscomp$226$$ = this.win.document;
                    if ($win$jscomp$226$$.removeEventListener) {
                        var $parent$jscomp$30$$ = $getVisibilityChangeEvent$$module$src$utils$document_visibility$$($win$jscomp$226$$);
                        $parent$jscomp$30$$ && $win$jscomp$226$$.removeEventListener($parent$jscomp$30$$, $boundUpdateVisibilityState$$);
                    }
                });
                this.$updateVisibilityState_$();
            }
            dispose() {
                this.$unsubsribes_$.forEach($unsubsribe$$ => $unsubsribe$$());
            }
            isSingleDoc() {
                return $devAssert$$module$src$log$$(null);
            }
            getParent() {
                return this.$parent_$;
            }
            getWin() {
                return this.win;
            }
            signals() {
                return this.$signals_$;
            }
            getParam($name$jscomp$149_v$jscomp$7$$) {
                $name$jscomp$149_v$jscomp$7$$ = this.$params_$[$name$jscomp$149_v$jscomp$7$$];
                return null == $name$jscomp$149_v$jscomp$7$$ ? null : $name$jscomp$149_v$jscomp$7$$;
            }
            getMeta() {
                if (this.$meta_$) return $map$$module$src$utils$object$$(this.$meta_$);
                this.$meta_$ = $map$$module$src$utils$object$$();
                let $metaEls$$ = this.win.document.head.querySelectorAll("meta[name]");
                $iterateCursor$$module$src$dom$$($metaEls$$, $metaEls$$ => {
                    let $content$jscomp$6_metaEl$jscomp$1$$ = $metaEls$$.getAttribute("name");
                    $metaEls$$ = $metaEls$$.getAttribute("content");
                    $content$jscomp$6_metaEl$jscomp$1$$ && null !== $metaEls$$ && void 0 === this.$meta_$[$content$jscomp$6_metaEl$jscomp$1$$] && (this.$meta_$[$content$jscomp$6_metaEl$jscomp$1$$] = $metaEls$$);
                });
                return $map$$module$src$utils$object$$(this.$meta_$);
            }
            getMetaByName($content$jscomp$7_name$jscomp$151$$) {
                if (!$content$jscomp$7_name$jscomp$151$$) return null;
                $content$jscomp$7_name$jscomp$151$$ = this.getMeta()[$content$jscomp$7_name$jscomp$151$$];
                return void 0 !== $content$jscomp$7_name$jscomp$151$$ ? $content$jscomp$7_name$jscomp$151$$ : null;
            }
            setMetaByName() {
                $devAssert$$module$src$log$$(null);
            }
            declaresExtension($extensionId$jscomp$20$$) {
                return -1 != this.$declaredExtensions_$.indexOf($extensionId$jscomp$20$$);
            }
            declareExtension($extensionId$jscomp$21$$) {
                this.declaresExtension($extensionId$jscomp$21$$) || this.$declaredExtensions_$.push($extensionId$jscomp$21$$);
            }
            getRootNode() {
                return $devAssert$$module$src$log$$(null);
            }
            getHeadNode() {}
            isBodyAvailable() {
                return $devAssert$$module$src$log$$(!1);
            }
            getBody() {
                return $devAssert$$module$src$log$$(null);
            }
            waitForBodyOpen() {
                return $devAssert$$module$src$log$$(null);
            }
            isReady() {
                return $devAssert$$module$src$log$$(null);
            }
            whenReady() {
                return $devAssert$$module$src$log$$(null);
            }
            getUrl() {
                return $devAssert$$module$src$log$$(null);
            }
            getElementById($id$jscomp$45$$) {
                return this.getRootNode().getElementById($id$jscomp$45$$);
            }
            contains($node$jscomp$36$$) {
                return this.getRootNode().contains($node$jscomp$36$$);
            }
            overrideVisibilityState($visibilityState$jscomp$1$$) {
                this.$visibilityStateOverride_$ != $visibilityState$jscomp$1$$ && (this.$visibilityStateOverride_$ = $visibilityState$jscomp$1$$, 
                this.$updateVisibilityState_$());
            }
            $updateVisibilityState_$() {
                var $JSCompiler_doc$jscomp$inline_193_JSCompiler_inline_result$jscomp$27_p$jscomp$3_visibilityState$jscomp$2$$ = this.win.document;
                $JSCompiler_hiddenProp$jscomp$inline_195_JSCompiler_visibilityStateProp$jscomp$inline_194$$ = $getVendorJsPropertyName$$module$src$style$$($JSCompiler_doc$jscomp$inline_193_JSCompiler_inline_result$jscomp$27_p$jscomp$3_visibilityState$jscomp$2$$, "visibilityState", !0);
                if ($JSCompiler_doc$jscomp$inline_193_JSCompiler_inline_result$jscomp$27_p$jscomp$3_visibilityState$jscomp$2$$[$JSCompiler_hiddenProp$jscomp$inline_195_JSCompiler_visibilityStateProp$jscomp$inline_194$$]) $JSCompiler_doc$jscomp$inline_193_JSCompiler_inline_result$jscomp$27_p$jscomp$3_visibilityState$jscomp$2$$ = $JSCompiler_doc$jscomp$inline_193_JSCompiler_inline_result$jscomp$27_p$jscomp$3_visibilityState$jscomp$2$$[$JSCompiler_hiddenProp$jscomp$inline_195_JSCompiler_visibilityStateProp$jscomp$inline_194$$]; else {
                    var $JSCompiler_hiddenProp$jscomp$inline_195_JSCompiler_visibilityStateProp$jscomp$inline_194$$ = $getVendorJsPropertyName$$module$src$style$$($JSCompiler_doc$jscomp$inline_193_JSCompiler_inline_result$jscomp$27_p$jscomp$3_visibilityState$jscomp$2$$, "hidden", !0);
                    $JSCompiler_doc$jscomp$inline_193_JSCompiler_inline_result$jscomp$27_p$jscomp$3_visibilityState$jscomp$2$$ = $JSCompiler_doc$jscomp$inline_193_JSCompiler_inline_result$jscomp$27_p$jscomp$3_visibilityState$jscomp$2$$[$JSCompiler_hiddenProp$jscomp$inline_195_JSCompiler_visibilityStateProp$jscomp$inline_194$$] ? $JSCompiler_doc$jscomp$inline_193_JSCompiler_inline_result$jscomp$27_p$jscomp$3_visibilityState$jscomp$2$$[$JSCompiler_hiddenProp$jscomp$inline_195_JSCompiler_visibilityStateProp$jscomp$inline_194$$] ? "hidden" : "visible" : "visible";
                }
                let $naturalVisibilityState$$ = $JSCompiler_doc$jscomp$inline_193_JSCompiler_inline_result$jscomp$27_p$jscomp$3_visibilityState$jscomp$2$$;
                let $parentVisibilityState$$ = "visible";
                for ($JSCompiler_doc$jscomp$inline_193_JSCompiler_inline_result$jscomp$27_p$jscomp$3_visibilityState$jscomp$2$$ = this.$parent_$; $JSCompiler_doc$jscomp$inline_193_JSCompiler_inline_result$jscomp$27_p$jscomp$3_visibilityState$jscomp$2$$; $JSCompiler_doc$jscomp$inline_193_JSCompiler_inline_result$jscomp$27_p$jscomp$3_visibilityState$jscomp$2$$ = $JSCompiler_doc$jscomp$inline_193_JSCompiler_inline_result$jscomp$27_p$jscomp$3_visibilityState$jscomp$2$$.getParent()) if ("visible" != $JSCompiler_doc$jscomp$inline_193_JSCompiler_inline_result$jscomp$27_p$jscomp$3_visibilityState$jscomp$2$$.getVisibilityState()) {
                    $parentVisibilityState$$ = $JSCompiler_doc$jscomp$inline_193_JSCompiler_inline_result$jscomp$27_p$jscomp$3_visibilityState$jscomp$2$$.getVisibilityState();
                    break;
                }
                let $visibilityStateOverride$$ = this.$visibilityStateOverride_$ || "visible";
                $JSCompiler_doc$jscomp$inline_193_JSCompiler_inline_result$jscomp$27_p$jscomp$3_visibilityState$jscomp$2$$ = "visible" == $visibilityStateOverride$$ && "visible" == $parentVisibilityState$$ && "visible" == $naturalVisibilityState$$ ? "visible" : "hidden" == $naturalVisibilityState$$ && "paused" == $visibilityStateOverride$$ ? $naturalVisibilityState$$ : "paused" == $visibilityStateOverride$$ || "inactive" == $visibilityStateOverride$$ ? $visibilityStateOverride$$ : "paused" == $parentVisibilityState$$ || "inactive" == $parentVisibilityState$$ ? $parentVisibilityState$$ : "prerender" == $visibilityStateOverride$$ || "prerender" == $naturalVisibilityState$$ || "prerender" == $parentVisibilityState$$ ? "prerender" : "hidden";
                this.$visibilityState_$ != $JSCompiler_doc$jscomp$inline_193_JSCompiler_inline_result$jscomp$27_p$jscomp$3_visibilityState$jscomp$2$$ && (this.$visibilityState_$ = $JSCompiler_doc$jscomp$inline_193_JSCompiler_inline_result$jscomp$27_p$jscomp$3_visibilityState$jscomp$2$$, 
                "visible" == $JSCompiler_doc$jscomp$inline_193_JSCompiler_inline_result$jscomp$27_p$jscomp$3_visibilityState$jscomp$2$$ ? (this.$lastVisibleTime_$ = Date.now(), 
                this.$signals_$.signal("-ampdoc-first-visible"), this.$signals_$.signal("-ampdoc-next-visible")) : this.$signals_$.reset("-ampdoc-next-visible"), 
                this.$visibilityStateHandlers_$.fire());
            }
            whenFirstVisible() {
                return this.$signals_$.whenSignal("-ampdoc-first-visible").then(() => {});
            }
            whenNextVisible() {
                return this.$signals_$.whenSignal("-ampdoc-next-visible").then(() => {});
            }
            getFirstVisibleTime() {
                return this.$signals_$.get("-ampdoc-first-visible");
            }
            getLastVisibleTime() {
                return this.$lastVisibleTime_$;
            }
            getVisibilityState() {
                return $devAssert$$module$src$log$$(this.$visibilityState_$);
            }
            isVisible() {
                return "visible" == this.$visibilityState_$;
            }
            hasBeenVisible() {
                return null != this.getLastVisibleTime();
            }
            onVisibilityChanged($handler$jscomp$35$$) {
                return this.$visibilityStateHandlers_$.add($handler$jscomp$35$$);
            }
            registerTrackingIframe() {
                return this.$hasTrackingIframe_$ ? !1 : this.$hasTrackingIframe_$ = !0;
            }
        }
        class $AmpDocSingle$$module$src$service$ampdoc_impl$$ extends $AmpDoc$$module$src$service$ampdoc_impl$$ {
            constructor($win$jscomp$227$$, $opt_options$jscomp$95$$) {
                super($win$jscomp$227$$, null, $opt_options$jscomp$95$$);
                this.$bodyPromise_$ = this.win.document.body ? Promise.resolve(this.win.document.body) : $waitForBodyOpenPromise$$module$src$dom$$(this.win.document).then(() => this.getBody());
                this.$readyPromise_$ = $whenDocumentReady$$module$src$document_ready$$(this.win.document);
            }
            isSingleDoc() {
                return !0;
            }
            getRootNode() {
                return this.win.document;
            }
            getUrl() {
                return this.win.location.href;
            }
            getHeadNode() {
                return this.win.document.head;
            }
            isBodyAvailable() {
                return !!this.win.document.body;
            }
            getBody() {
                return this.win.document.body;
            }
            waitForBodyOpen() {
                return this.$bodyPromise_$;
            }
            isReady() {
                return $isDocumentReady$$module$src$document_ready$$(this.win.document);
            }
            whenReady() {
                return this.$readyPromise_$;
            }
        }
        class $AmpDocShadow$$module$src$service$ampdoc_impl$$ extends $AmpDoc$$module$src$service$ampdoc_impl$$ {
            constructor($win$jscomp$228$$, $url$jscomp$104$$, $shadowRoot$jscomp$16$$, $opt_options$jscomp$96$$) {
                super($win$jscomp$228$$, null, $opt_options$jscomp$96$$);
                this.$url_$ = $url$jscomp$104$$;
                this.$shadowRoot_$ = $shadowRoot$jscomp$16$$;
                this.$body_$ = null;
                let $bodyDeferred$$ = new $Deferred$$module$src$utils$promise$$;
                this.$bodyPromise_$ = $bodyDeferred$$.promise;
                this.$bodyResolver_$ = $bodyDeferred$$.resolve;
                this.$ready_$ = !1;
                let $readyDeferred$$ = new $Deferred$$module$src$utils$promise$$;
                this.$readyPromise_$ = $readyDeferred$$.promise;
                this.$readyResolver_$ = $readyDeferred$$.resolve;
            }
            isSingleDoc() {
                return !1;
            }
            getRootNode() {
                return this.$shadowRoot_$;
            }
            getUrl() {
                return this.$url_$;
            }
            getHeadNode() {
                return this.$shadowRoot_$;
            }
            isBodyAvailable() {
                return !!this.$body_$;
            }
            getBody() {
                return this.$body_$;
            }
            setBody($body$jscomp$11$$) {
                $devAssert$$module$src$log$$(!this.$body_$);
                this.$body_$ = $body$jscomp$11$$;
                this.$bodyResolver_$($body$jscomp$11$$);
                this.$bodyResolver_$ = void 0;
            }
            waitForBodyOpen() {
                return this.$bodyPromise_$;
            }
            isReady() {
                return this.$ready_$;
            }
            setReady() {
                $devAssert$$module$src$log$$(!this.$ready_$);
                this.$ready_$ = !0;
                this.$readyResolver_$();
                this.$readyResolver_$ = void 0;
            }
            whenReady() {
                return this.$readyPromise_$;
            }
            getMeta() {
                return $map$$module$src$utils$object$$(this.$meta_$);
            }
            setMetaByName($name$jscomp$152$$, $content$jscomp$8$$) {
                $devAssert$$module$src$log$$($name$jscomp$152$$);
                this.$meta_$ || (this.$meta_$ = $map$$module$src$utils$object$$());
                this.$meta_$[$name$jscomp$152$$] = $content$jscomp$8$$;
            }
        }
        class $AmpDocFie$$module$src$service$ampdoc_impl$$ extends $AmpDoc$$module$src$service$ampdoc_impl$$ {
            constructor($readyDeferred$jscomp$1_win$jscomp$229$$, $url$jscomp$105$$, $parent$jscomp$31$$, $opt_options$jscomp$97$$) {
                super($readyDeferred$jscomp$1_win$jscomp$229$$, $parent$jscomp$31$$, $opt_options$jscomp$97$$);
                this.$url_$ = $url$jscomp$105$$;
                this.$bodyPromise_$ = this.win.document.body ? Promise.resolve(this.win.document.body) : $waitForBodyOpenPromise$$module$src$dom$$(this.win.document).then(() => this.getBody());
                this.$ready_$ = !1;
                $readyDeferred$jscomp$1_win$jscomp$229$$ = new $Deferred$$module$src$utils$promise$$;
                this.$readyPromise_$ = $readyDeferred$jscomp$1_win$jscomp$229$$.promise;
                this.$readyResolver_$ = $readyDeferred$jscomp$1_win$jscomp$229$$.resolve;
            }
            isSingleDoc() {
                return !1;
            }
            getRootNode() {
                return this.win.document;
            }
            getUrl() {
                return this.$url_$;
            }
            getHeadNode() {
                return this.win.document.head;
            }
            isBodyAvailable() {
                return !!this.win.document.body;
            }
            getBody() {
                return this.win.document.body;
            }
            waitForBodyOpen() {
                return this.$bodyPromise_$;
            }
            isReady() {
                return this.$ready_$;
            }
            whenReady() {
                return this.$readyPromise_$;
            }
            setReady() {
                $devAssert$$module$src$log$$(!this.$ready_$);
                this.$ready_$ = !0;
                this.$readyResolver_$();
                this.$readyResolver_$ = void 0;
            }
        }
        function $installDocService$$module$src$service$ampdoc_impl$$() {
            var $win$jscomp$231$$ = self;
            $registerServiceBuilder$$module$src$service$$($win$jscomp$231$$, "ampdoc", (function() {
                return new $AmpDocService$$module$src$service$ampdoc_impl$$($win$jscomp$231$$, !0, void 0);
            }));
        }
        let $EXCLUDE_INI_LOAD$$module$src$ini_load$$ = [ "AMP-AD", "AMP-ANALYTICS", "AMP-PIXEL", "AMP-AD-EXIT" ];
        function $whenContentIniLoad$$module$src$ini_load$$($ampdoc$jscomp$105_elementOrAmpDoc$jscomp$22$$, $hostWin$$, $rect$jscomp$6$$) {
            $ampdoc$jscomp$105_elementOrAmpDoc$jscomp$22$$ = $getAmpdoc$$module$src$service$$($ampdoc$jscomp$105_elementOrAmpDoc$jscomp$22$$);
            return $getMeasuredResources$$module$src$ini_load$$($ampdoc$jscomp$105_elementOrAmpDoc$jscomp$22$$, $hostWin$$, $ampdoc$jscomp$105_elementOrAmpDoc$jscomp$22$$ => $ampdoc$jscomp$105_elementOrAmpDoc$jscomp$22$$.isDisplayed() && ($ampdoc$jscomp$105_elementOrAmpDoc$jscomp$22$$.overlaps($rect$jscomp$6$$) || $ampdoc$jscomp$105_elementOrAmpDoc$jscomp$22$$.isFixed()) && $ampdoc$jscomp$105_elementOrAmpDoc$jscomp$22$$.prerenderAllowed() ? !0 : !1).then($ampdoc$jscomp$105_elementOrAmpDoc$jscomp$22$$ => {
                let $hostWin$$ = [];
                $ampdoc$jscomp$105_elementOrAmpDoc$jscomp$22$$.forEach($ampdoc$jscomp$105_elementOrAmpDoc$jscomp$22$$ => {
                    $EXCLUDE_INI_LOAD$$module$src$ini_load$$.includes($ampdoc$jscomp$105_elementOrAmpDoc$jscomp$22$$.element.tagName) || $hostWin$$.push($ampdoc$jscomp$105_elementOrAmpDoc$jscomp$22$$.loadedOnce());
                });
                return Promise.all($hostWin$$);
            });
        }
        function $getMeasuredResources$$module$src$ini_load$$($ampdoc$jscomp$106$$, $hostWin$jscomp$1$$, $filterFn$$) {
            return $ampdoc$jscomp$106$$.signals().whenSignal("ready-scan").then(() => {
                let $filterFn$$ = [];
                $getServiceForDoc$$module$src$service$$($ampdoc$jscomp$106$$, "resources").get().forEach($ampdoc$jscomp$106$$ => {
                    $ampdoc$jscomp$106$$.hasBeenMeasured() || $ampdoc$jscomp$106$$.hostWin != $hostWin$jscomp$1$$ || $ampdoc$jscomp$106$$.hasOwner() || $filterFn$$.push($ampdoc$jscomp$106$$.getPageLayoutBoxAsync());
                });
                return Promise.all($filterFn$$);
            }).then(() => $getServiceForDoc$$module$src$service$$($ampdoc$jscomp$106$$, "resources").get().filter($ampdoc$jscomp$106$$ => $ampdoc$jscomp$106$$.hostWin == $hostWin$jscomp$1$$ && !$ampdoc$jscomp$106$$.hasOwner() && $ampdoc$jscomp$106$$.hasBeenMeasured() && $filterFn$$($ampdoc$jscomp$106$$)));
        }
        function $JSCompiler_StaticMethods_registerPerformanceObserver_$$($JSCompiler_StaticMethods_registerPerformanceObserver_$self$$) {
            if ("inabox" !== $getMode$$module$src$mode$$($JSCompiler_StaticMethods_registerPerformanceObserver_$self$$.win).runtime) {
                var $recordedFirstPaint$$ = !1, $recordedFirstContentfulPaint$$ = !1, $recordedFirstInputDelay$$ = !1, $recordedNavigation$$ = !1, $processEntry$$ = $processEntry$$ => {
                    "first-paint" != $processEntry$$.name || $recordedFirstPaint$$ ? "first-contentful-paint" != $processEntry$$.name || $recordedFirstContentfulPaint$$ ? "first-input" !== $processEntry$$.entryType || $recordedFirstInputDelay$$ ? "layout-shift" === $processEntry$$.entryType ? $processEntry$$.hadRecentInput || ($JSCompiler_StaticMethods_registerPerformanceObserver_$self$$.$aggregateShiftScore_$ += $processEntry$$.value) : "largest-contentful-paint" === $processEntry$$.entryType ? ($processEntry$$.loadTime && ($JSCompiler_StaticMethods_registerPerformanceObserver_$self$$.$largestContentfulPaintLoadTime_$ = $processEntry$$.loadTime), 
                    $processEntry$$.renderTime && ($JSCompiler_StaticMethods_registerPerformanceObserver_$self$$.$largestContentfulPaintRenderTime_$ = $processEntry$$.renderTime)) : "navigation" != $processEntry$$.entryType || $recordedNavigation$$ || ("domComplete domContentLoadedEventEnd domContentLoadedEventStart domInteractive loadEventEnd loadEventStart requestStart responseStart".split(" ").forEach($recordedFirstPaint$$ => $JSCompiler_StaticMethods_registerPerformanceObserver_$self$$.tick($recordedFirstPaint$$, $processEntry$$[$recordedFirstPaint$$])), 
                    $recordedNavigation$$ = !0) : ($JSCompiler_StaticMethods_registerPerformanceObserver_$self$$.tickDelta("fid", $processEntry$$.processingStart - $processEntry$$.startTime), 
                    $recordedFirstInputDelay$$ = !0) : ($JSCompiler_StaticMethods_registerPerformanceObserver_$self$$.tickDelta("fcp", $processEntry$$.startTime + $processEntry$$.duration), 
                    $recordedFirstContentfulPaint$$ = !0) : ($JSCompiler_StaticMethods_registerPerformanceObserver_$self$$.tickDelta("fp", $processEntry$$.startTime + $processEntry$$.duration), 
                    $recordedFirstPaint$$ = !0);
                }, $entryTypesToObserve$$ = [];
                $JSCompiler_StaticMethods_registerPerformanceObserver_$self$$.win.PerformancePaintTiming && ($JSCompiler_StaticMethods_registerPerformanceObserver_$self$$.win.performance.getEntriesByType("paint").forEach($processEntry$$), 
                $entryTypesToObserve$$.push("paint"));
                $JSCompiler_StaticMethods_registerPerformanceObserver_$self$$.$supportsEventTiming_$ && $JSCompiler_StaticMethods_createPerformanceObserver_$$($JSCompiler_StaticMethods_registerPerformanceObserver_$self$$, $processEntry$$).observe({
                    type: "first-input",
                    buffered: !0
                });
                $JSCompiler_StaticMethods_registerPerformanceObserver_$self$$.$supportsLayoutShift_$ && $JSCompiler_StaticMethods_createPerformanceObserver_$$($JSCompiler_StaticMethods_registerPerformanceObserver_$self$$, $processEntry$$).observe({
                    type: "layout-shift",
                    buffered: !0
                });
                $JSCompiler_StaticMethods_registerPerformanceObserver_$self$$.$supportsLargestContentfulPaint_$ && $JSCompiler_StaticMethods_createPerformanceObserver_$$($JSCompiler_StaticMethods_registerPerformanceObserver_$self$$, $processEntry$$).observe({
                    type: "largest-contentful-paint",
                    buffered: !0
                });
                $JSCompiler_StaticMethods_registerPerformanceObserver_$self$$.$supportsNavigation_$ && $JSCompiler_StaticMethods_createPerformanceObserver_$$($JSCompiler_StaticMethods_registerPerformanceObserver_$self$$, $processEntry$$).observe({
                    type: "navigation",
                    buffered: !0
                });
                if (0 !== $entryTypesToObserve$$.length) {
                    var $observer$jscomp$1$$ = $JSCompiler_StaticMethods_createPerformanceObserver_$$($JSCompiler_StaticMethods_registerPerformanceObserver_$self$$, $processEntry$$);
                    try {
                        $observer$jscomp$1$$.observe({
                            entryTypes: $entryTypesToObserve$$
                        });
                    } catch ($err$jscomp$9$$) {
                        $dev$$module$src$log$$().warn($err$jscomp$9$$);
                    }
                }
            }
        }
        function $JSCompiler_StaticMethods_registerFirstInputDelayPolyfillListener_$$($JSCompiler_StaticMethods_registerFirstInputDelayPolyfillListener_$self$$) {
            if ($JSCompiler_StaticMethods_registerFirstInputDelayPolyfillListener_$self$$.win.perfMetrics && $JSCompiler_StaticMethods_registerFirstInputDelayPolyfillListener_$self$$.win.perfMetrics.onFirstInputDelay) $JSCompiler_StaticMethods_registerFirstInputDelayPolyfillListener_$self$$.win.perfMetrics.onFirstInputDelay($delay$jscomp$6$$ => {
                $JSCompiler_StaticMethods_registerFirstInputDelayPolyfillListener_$self$$.tickDelta("fid-polyfill", $delay$jscomp$6$$);
                $JSCompiler_StaticMethods_registerFirstInputDelayPolyfillListener_$self$$.flush();
            });
        }
        function $JSCompiler_StaticMethods_measureUserPerceivedVisualCompletenessTime_$$($JSCompiler_StaticMethods_measureUserPerceivedVisualCompletenessTime_$self$$) {
            let $didStartInPrerender$$ = !$JSCompiler_StaticMethods_measureUserPerceivedVisualCompletenessTime_$self$$.$ampdoc_$.hasBeenVisible();
            let $docVisibleTime$$ = -1;
            $JSCompiler_StaticMethods_measureUserPerceivedVisualCompletenessTime_$self$$.$ampdoc_$.whenFirstVisible().then(() => {
                $docVisibleTime$$ = $JSCompiler_StaticMethods_measureUserPerceivedVisualCompletenessTime_$self$$.win.performance.now();
                $JSCompiler_StaticMethods_measureUserPerceivedVisualCompletenessTime_$self$$.mark("visible");
            });
            $JSCompiler_StaticMethods_whenViewportLayoutComplete_$$($JSCompiler_StaticMethods_measureUserPerceivedVisualCompletenessTime_$self$$).then(() => {
                if ($didStartInPrerender$$) {
                    let $didStartInPrerender$$ = -1 < $docVisibleTime$$ ? $JSCompiler_StaticMethods_measureUserPerceivedVisualCompletenessTime_$self$$.win.performance.now() - $docVisibleTime$$ : 0;
                    $JSCompiler_StaticMethods_measureUserPerceivedVisualCompletenessTime_$self$$.$ampdoc_$.whenFirstVisible().then(() => {
                        $JSCompiler_StaticMethods_measureUserPerceivedVisualCompletenessTime_$self$$.tickDelta("pc", $didStartInPrerender$$);
                    });
                    $JSCompiler_StaticMethods_prerenderComplete_$$($JSCompiler_StaticMethods_measureUserPerceivedVisualCompletenessTime_$self$$, $didStartInPrerender$$);
                    $JSCompiler_StaticMethods_measureUserPerceivedVisualCompletenessTime_$self$$.mark("pc");
                } else $JSCompiler_StaticMethods_measureUserPerceivedVisualCompletenessTime_$self$$.tick("pc"), 
                $JSCompiler_StaticMethods_prerenderComplete_$$($JSCompiler_StaticMethods_measureUserPerceivedVisualCompletenessTime_$self$$, $JSCompiler_StaticMethods_measureUserPerceivedVisualCompletenessTime_$self$$.win.performance.now() - $docVisibleTime$$);
                $JSCompiler_StaticMethods_measureUserPerceivedVisualCompletenessTime_$self$$.flush();
            });
        }
        function $JSCompiler_StaticMethods_maybeAddStoryExperimentId_$$($JSCompiler_StaticMethods_maybeAddStoryExperimentId_$self$$) {
            let $ampdoc$jscomp$107$$ = $Services$$module$src$services$ampdocServiceFor$$($JSCompiler_StaticMethods_maybeAddStoryExperimentId_$self$$.win).getSingleDoc();
            return $isStoryDocument$$module$src$utils$story$$($ampdoc$jscomp$107$$).then($ampdoc$jscomp$107$$ => {
                $ampdoc$jscomp$107$$ && $JSCompiler_StaticMethods_maybeAddStoryExperimentId_$self$$.addEnabledExperiment("story");
            });
        }
        function $JSCompiler_StaticMethods_flushQueuedTicks_$$($JSCompiler_StaticMethods_flushQueuedTicks_$self$$) {
            $JSCompiler_StaticMethods_flushQueuedTicks_$self$$.$viewer_$ && ($JSCompiler_StaticMethods_flushQueuedTicks_$self$$.$isPerformanceTrackingOn_$ && $JSCompiler_StaticMethods_flushQueuedTicks_$self$$.$events_$.forEach($tickEvent$$ => {
                $JSCompiler_StaticMethods_flushQueuedTicks_$self$$.$viewer_$.sendMessage("tick", $tickEvent$$);
            }), $JSCompiler_StaticMethods_flushQueuedTicks_$self$$.$events_$.length = 0);
        }
        function $JSCompiler_StaticMethods_createPerformanceObserver_$$($JSCompiler_StaticMethods_createPerformanceObserver_$self$$, $processEntry$jscomp$1$$) {
            return new $JSCompiler_StaticMethods_createPerformanceObserver_$self$$.win.PerformanceObserver($list$jscomp$1$$ => {
                $list$jscomp$1$$.getEntries().forEach($processEntry$jscomp$1$$);
                $JSCompiler_StaticMethods_createPerformanceObserver_$self$$.flush();
            });
        }
        function $JSCompiler_StaticMethods_tickLayoutShiftScore_$$($JSCompiler_StaticMethods_tickLayoutShiftScore_$self$$) {
            0 === $JSCompiler_StaticMethods_tickLayoutShiftScore_$self$$.$shiftScoresTicked_$ ? ($JSCompiler_StaticMethods_tickLayoutShiftScore_$self$$.tickDelta("cls", $JSCompiler_StaticMethods_tickLayoutShiftScore_$self$$.$aggregateShiftScore_$), 
            $JSCompiler_StaticMethods_tickLayoutShiftScore_$self$$.flush(), $JSCompiler_StaticMethods_tickLayoutShiftScore_$self$$.$shiftScoresTicked_$ = 1) : 1 === $JSCompiler_StaticMethods_tickLayoutShiftScore_$self$$.$shiftScoresTicked_$ && ($JSCompiler_StaticMethods_tickLayoutShiftScore_$self$$.tickDelta("cls-2", $JSCompiler_StaticMethods_tickLayoutShiftScore_$self$$.$aggregateShiftScore_$), 
            $JSCompiler_StaticMethods_tickLayoutShiftScore_$self$$.flush(), $JSCompiler_StaticMethods_tickLayoutShiftScore_$self$$.$shiftScoresTicked_$ = 2, 
            $JSCompiler_StaticMethods_tickLayoutShiftScore_$self$$.win.removeEventListener("visibilitychange", $JSCompiler_StaticMethods_tickLayoutShiftScore_$self$$.$boundOnVisibilityChange_$, {
                capture: !0
            }));
        }
        function $JSCompiler_StaticMethods_tickLargestContentfulPaint_$$($JSCompiler_StaticMethods_tickLargestContentfulPaint_$self$$) {
            null !== $JSCompiler_StaticMethods_tickLargestContentfulPaint_$self$$.$largestContentfulPaintLoadTime_$ && $JSCompiler_StaticMethods_tickLargestContentfulPaint_$self$$.tickDelta("lcpl", $JSCompiler_StaticMethods_tickLargestContentfulPaint_$self$$.$largestContentfulPaintLoadTime_$);
            null !== $JSCompiler_StaticMethods_tickLargestContentfulPaint_$self$$.$largestContentfulPaintRenderTime_$ && $JSCompiler_StaticMethods_tickLargestContentfulPaint_$self$$.tickDelta("lcpr", $JSCompiler_StaticMethods_tickLargestContentfulPaint_$self$$.$largestContentfulPaintRenderTime_$);
            $JSCompiler_StaticMethods_tickLargestContentfulPaint_$self$$.flush();
        }
        function $JSCompiler_StaticMethods_whenViewportLayoutComplete_$$($JSCompiler_StaticMethods_whenViewportLayoutComplete_$self$$) {
            return $JSCompiler_StaticMethods_whenViewportLayoutComplete_$self$$.$resources_$.whenFirstPass().then(() => {
                let $documentElement$jscomp$6$$ = $JSCompiler_StaticMethods_whenViewportLayoutComplete_$self$$.win.document.documentElement;
                var $rect$jscomp$7_size$jscomp$22$$ = $getServiceForDoc$$module$src$service$$($documentElement$jscomp$6$$, "viewport").getSize();
                $rect$jscomp$7_size$jscomp$22$$ = $layoutRectLtwh$$module$src$layout_rect$$($rect$jscomp$7_size$jscomp$22$$.width, $rect$jscomp$7_size$jscomp$22$$.height);
                return $whenContentIniLoad$$module$src$ini_load$$($documentElement$jscomp$6$$, $JSCompiler_StaticMethods_whenViewportLayoutComplete_$self$$.win, $rect$jscomp$7_size$jscomp$22$$);
            });
        }
        function $JSCompiler_StaticMethods_prerenderComplete_$$($JSCompiler_StaticMethods_prerenderComplete_$self$$, $value$jscomp$149$$) {
            $JSCompiler_StaticMethods_prerenderComplete_$self$$.$viewer_$ && $JSCompiler_StaticMethods_prerenderComplete_$self$$.$viewer_$.sendMessage("prerenderComplete", $dict$$module$src$utils$object$$({
                value: $value$jscomp$149$$
            }), !0);
        }
        class $Performance$$module$src$service$performance_impl$$ {
            constructor($win$jscomp$232$$) {
                this.win = $win$jscomp$232$$;
                this.$events_$ = [];
                this.$timeOrigin_$ = $win$jscomp$232$$.performance.timeOrigin || $win$jscomp$232$$.performance.timing.navigationStart;
                this.$resources_$ = this.$viewer_$ = this.$ampdoc_$ = null;
                this.$isPerformanceTrackingOn_$ = this.$isMessagingReady_$ = !1;
                this.$enabledExperiments_$ = $map$$module$src$utils$object$$();
                this.$ampexp_$ = "";
                this.$fcpDeferred_$ = new $Deferred$$module$src$utils$promise$$;
                this.$fvrDeferred_$ = new $Deferred$$module$src$utils$promise$$;
                this.$mbvDeferred_$ = new $Deferred$$module$src$utils$promise$$;
                this.$platform_$ = $getService$$module$src$service$$(this.win, "platform");
                this.$platform_$.isChrome() || this.$platform_$.isOpera() || this.$fcpDeferred_$.resolve(null);
                this.$aggregateShiftScore_$ = this.$shiftScoresTicked_$ = 0;
                let $supportedEntryTypes$$ = this.win.PerformanceObserver && this.win.PerformanceObserver.supportedEntryTypes || [];
                this.$supportsLayoutShift_$ = $supportedEntryTypes$$.includes("layout-shift");
                this.$supportsEventTiming_$ = $supportedEntryTypes$$.includes("first-input");
                this.$supportsLargestContentfulPaint_$ = $supportedEntryTypes$$.includes("largest-contentful-paint");
                this.$supportsNavigation_$ = $supportedEntryTypes$$.includes("navigation");
                this.$largestContentfulPaintRenderTime_$ = this.$largestContentfulPaintLoadTime_$ = null;
                this.$boundOnVisibilityChange_$ = this.$onVisibilityChange_$.bind(this);
                this.$onAmpDocVisibilityChange_$ = this.$onAmpDocVisibilityChange_$.bind(this);
                this.addEnabledExperiment("rtv-" + $getMode$$module$src$mode$$(this.win).rtvVersion);
                $whenDocumentReady$$module$src$document_ready$$($win$jscomp$232$$.document).then(() => {
                    this.tick("dr");
                    this.flush();
                });
                $whenDocumentComplete$$module$src$document_ready$$($win$jscomp$232$$.document).then(() => {
                    this.tick("ol");
                    if (!this.win.PerformancePaintTiming && this.win.chrome && "function" == typeof this.win.chrome.loadTimes) {
                        let $win$jscomp$232$$ = 1e3 * this.win.chrome.loadTimes().firstPaintTime - this.win.performance.timing.navigationStart;
                        1 >= $win$jscomp$232$$ || this.tickDelta("fp", $win$jscomp$232$$);
                    }
                    this.flush();
                });
                $JSCompiler_StaticMethods_registerPerformanceObserver_$$(this);
                $JSCompiler_StaticMethods_registerFirstInputDelayPolyfillListener_$$(this);
            }
            coreServicesAvailable() {
                let $documentElement$jscomp$5$$ = this.win.document.documentElement;
                this.$ampdoc_$ = $getAmpdoc$$module$src$service$$($documentElement$jscomp$5$$);
                this.$viewer_$ = $getServiceForDoc$$module$src$service$$($documentElement$jscomp$5$$, "viewer");
                this.$resources_$ = $getServiceForDoc$$module$src$service$$($documentElement$jscomp$5$$, "resources");
                this.$isPerformanceTrackingOn_$ = this.$viewer_$.isEmbedded() && "1" === this.$viewer_$.getParam("csi");
                this.$ampdoc_$.onVisibilityChanged(this.flush.bind(this));
                $JSCompiler_StaticMethods_measureUserPerceivedVisualCompletenessTime_$$(this);
                let $channelPromise$$ = this.$viewer_$.whenMessagingReady();
                this.$ampdoc_$.whenFirstVisible().then(() => {
                    this.tick("ofv");
                    this.flush();
                });
                if (this.$supportsLargestContentfulPaint_$ || this.$supportsLayoutShift_$) this.win.addEventListener("visibilitychange", this.$boundOnVisibilityChange_$, {
                    capture: !0
                }), this.$ampdoc_$.onVisibilityChanged(this.$onAmpDocVisibilityChange_$);
                return $channelPromise$$ ? $channelPromise$$.then(() => {
                    this.tickDelta("msr", this.win.performance.now());
                    this.tick("timeOrigin", void 0, this.$timeOrigin_$);
                    return $JSCompiler_StaticMethods_maybeAddStoryExperimentId_$$(this);
                }).then(() => {
                    this.$isMessagingReady_$ = !0;
                    $JSCompiler_StaticMethods_flushQueuedTicks_$$(this);
                    this.flush();
                }) : $resolvedPromise$$module$src$resolved_promise$$();
            }
            $onVisibilityChange_$() {
                "hidden" === this.win.document.visibilityState && (this.$supportsLayoutShift_$ && $JSCompiler_StaticMethods_tickLayoutShiftScore_$$(this), 
                this.$supportsLargestContentfulPaint_$ && $JSCompiler_StaticMethods_tickLargestContentfulPaint_$$(this));
            }
            $onAmpDocVisibilityChange_$() {
                "inactive" === this.$ampdoc_$.getVisibilityState() && (this.$supportsLayoutShift_$ && $JSCompiler_StaticMethods_tickLayoutShiftScore_$$(this), 
                this.$supportsLargestContentfulPaint_$ && $JSCompiler_StaticMethods_tickLargestContentfulPaint_$$(this));
            }
            tick($label$jscomp$10$$, $opt_delta$$, $opt_value$jscomp$11$$) {
                $devAssert$$module$src$log$$(void 0 == $opt_delta$$ || void 0 == $opt_value$jscomp$11$$);
                let $data$jscomp$115$$ = $dict$$module$src$utils$object$$({
                    label: $label$jscomp$10$$
                });
                let $delta$jscomp$3$$;
                void 0 != $opt_delta$$ ? $data$jscomp$115$$.delta = $delta$jscomp$3$$ = Math.max($opt_delta$$, 0) : void 0 != $opt_value$jscomp$11$$ ? $data$jscomp$115$$.value = $opt_value$jscomp$11$$ : (this.mark($label$jscomp$10$$), 
                $delta$jscomp$3$$ = this.win.performance.now(), $data$jscomp$115$$.value = this.$timeOrigin_$ + $delta$jscomp$3$$);
                this.$isMessagingReady_$ && this.$isPerformanceTrackingOn_$ ? this.$viewer_$.sendMessage("tick", $data$jscomp$115$$) : (50 <= this.$events_$.length && this.$events_$.shift(), 
                this.$events_$.push($data$jscomp$115$$));
                switch ($label$jscomp$10$$) {
                  case "fcp":
                    this.$fcpDeferred_$.resolve($delta$jscomp$3$$);
                    break;

                  case "pc":
                    this.$fvrDeferred_$.resolve($delta$jscomp$3$$);
                    break;

                  case "mbv":
                    this.$mbvDeferred_$.resolve($delta$jscomp$3$$);
                }
            }
            mark($label$jscomp$11$$) {
                this.win.performance && this.win.performance.mark && 1 == arguments.length && this.win.performance.mark($label$jscomp$11$$);
            }
            tickDelta($label$jscomp$12$$, $value$jscomp$148$$) {
                this.tick($label$jscomp$12$$, $value$jscomp$148$$);
            }
            tickSinceVisible($label$jscomp$13$$) {
                let $now$jscomp$13$$ = this.$timeOrigin_$ + this.win.performance.now(), $visibleTime$$ = this.$ampdoc_$ ? this.$ampdoc_$.getFirstVisibleTime() : 0;
                this.tickDelta($label$jscomp$13$$, $visibleTime$$ ? Math.max($now$jscomp$13$$ - $visibleTime$$, 0) : 0);
            }
            flush() {
                this.$isMessagingReady_$ && this.$isPerformanceTrackingOn_$ && this.$viewer_$.sendMessage("sendCsi", $dict$$module$src$utils$object$$({
                    ampexp: this.$ampexp_$
                }), !0);
            }
            throttledFlush() {
                this.$throttledFlush_$ || (this.$throttledFlush_$ = $throttle$$module$src$utils$rate_limit$$(this.win, this.flush.bind(this)));
                this.$throttledFlush_$();
            }
            addEnabledExperiment($experimentId$jscomp$3$$) {
                this.$enabledExperiments_$[$experimentId$jscomp$3$$] = !0;
                this.$ampexp_$ = Object.keys(this.$enabledExperiments_$).join(",");
            }
            isPerformanceTrackingOn() {
                return this.$isPerformanceTrackingOn_$;
            }
            getFirstContentfulPaint() {
                return this.$fcpDeferred_$.promise;
            }
            getMakeBodyVisible() {
                return this.$mbvDeferred_$.promise;
            }
            getFirstViewportReady() {
                return this.$fvrDeferred_$.promise;
            }
        }
        if (!self.IS_AMP_ALT) {
            self.location && (self.location.originalHash = self.location.hash);
            let $ampdocService$jscomp$6$$;
            try {
                $installErrorReporting$$module$src$error$$(), $installDocService$$module$src$service$ampdoc_impl$$(), 
                $ampdocService$jscomp$6$$ = $Services$$module$src$services$ampdocServiceFor$$(self);
            } catch ($e$jscomp$98$$) {
                throw $makeBodyVisibleRecovery$$module$src$style_installer$$(self.document), $e$jscomp$98$$;
            }
            var $JSCompiler_fn$jscomp$inline_244$$ = function() {
                $ampdocService$jscomp$6$$.getAmpDoc(self.document);
                $registerServiceBuilder$$module$src$service$$(self, "platform", $Platform$$module$src$service$platform_impl$$);
                $registerServiceBuilder$$module$src$service$$(self, "performance", $Performance$$module$src$service$performance_impl$$);
                var $JSCompiler_inline_result$jscomp$17$$ = $getService$$module$src$service$$(self, "performance");
                self.document.documentElement.hasAttribute("i-amphtml-no-boilerplate") && $JSCompiler_inline_result$jscomp$17$$.addEnabledExperiment("no-boilerplate");
                $getMode$$module$src$mode$$().esm && $JSCompiler_inline_result$jscomp$17$$.addEnabledExperiment("esm");
                $fontStylesheetTimeout$$module$src$font_stylesheet_timeout$$();
                $JSCompiler_inline_result$jscomp$17$$.tick("is");
            }, $JSCompiler_doc$jscomp$inline_245$$ = self.document;
            if ($deactivated$$module$src$chunk$$) $resolved$$module$src$chunk$$.then($JSCompiler_fn$jscomp$inline_244$$); else {
                var $JSCompiler_elementOrAmpDoc$jscomp$inline_278$$ = $JSCompiler_doc$jscomp$inline_245$$.documentElement || $JSCompiler_doc$jscomp$inline_245$$;
                {
                    var $JSCompiler_constructor$jscomp$inline_279$$ = $Chunks$$module$src$chunk$$;
                    let $ampdocService$jscomp$6$$ = $getAmpdoc$$module$src$service$$($JSCompiler_elementOrAmpDoc$jscomp$inline_278$$), $JSCompiler_holder$jscomp$inline_281$$ = $getAmpdocServiceHolder$$module$src$service$$($ampdocService$jscomp$6$$);
                    $registerServiceInternal$$module$src$service$$($JSCompiler_holder$jscomp$inline_281$$, $ampdocService$jscomp$6$$, "chunk", $JSCompiler_constructor$jscomp$inline_279$$);
                }
                $getServiceForDoc$$module$src$service$$($JSCompiler_elementOrAmpDoc$jscomp$inline_278$$, "chunk").runForStartup($JSCompiler_fn$jscomp$inline_244$$);
            }
            self.console && (console.info || console.log).call(console, "Powered by AMP ⚡ HTML – Version 2005062057000", self.location.href);
            self.document.documentElement.setAttribute("amp-version", "2005062057000");
        }
    })(AMP._ = AMP._ || {});
} catch (e) {
    setTimeout((function() {
        var s = document.body.style;
        s.opacity = 1;
        s.visibility = "visible";
        s.animation = "none";
        s.WebkitAnimation = "none;";
    }), 1e3);
    throw e;
}
//# sourceMappingURL=v0.js.map
