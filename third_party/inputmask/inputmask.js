/*!
* inputmask.js
* https://github.com/RobinHerbots/Inputmask
* Copyright (c) 2010 - 2018 Robin Herbots
* Licensed under the MIT license (http://www.opensource.org/licenses/mit-license.php)
* Version: 4.0.4
*/

export function factory($, window, document, undefined) {
    var ua = navigator.userAgent, ie = ua.indexOf("MSIE ") > 0 || ua.indexOf("Trident/") > 0, mobile = isInputEventSupported("touchstart"), iemobile = /iemobile/i.test(ua), iphone = /iphone/i.test(ua) && !iemobile;
    function Inputmask(alias, options, internal) {
        if (!(this instanceof Inputmask)) {
            return new Inputmask(alias, options, internal);
        }
        this.el = undefined;
        this.events = {};
        this.maskset = undefined;
        this.refreshValue = false;
        if (internal !== true) {
            if ($.isPlainObject(alias)) {
                options = alias;
            } else {
                options = options || {};
                if (alias) options.alias = alias;
            }
            this.opts = $.extend(true, {}, this.defaults, options);
            this.noMasksCache = options && options.definitions !== undefined;
            this.userOptions = options || {};
            this.isRTL = this.opts.numericInput;
            resolveAlias(this.opts.alias, options, this.opts);
        }
    }
    Inputmask.prototype = {
        dataAttribute: "data-inputmask",
        defaults: {
            placeholder: "_",
            optionalmarker: [ "[", "]" ],
            quantifiermarker: [ "{", "}" ],
            groupmarker: [ "(", ")" ],
            alternatormarker: "|",
            escapeChar: "\\",
            mask: null,
            regex: null,
            oncomplete: $.noop,
            onincomplete: $.noop,
            oncleared: $.noop,
            repeat: 0,
            greedy: false,
            autoUnmask: false,
            removeMaskOnSubmit: false,
            clearMaskOnLostFocus: true,
            insertMode: true,
            clearIncomplete: false,
            alias: null,
            onKeyDown: $.noop,
            onBeforeMask: null,
            onBeforePaste: function(pastedValue, opts) {
                return $.isFunction(opts.onBeforeMask) ? opts.onBeforeMask.call(this, pastedValue, opts) : pastedValue;
            },
            onBeforeWrite: null,
            onUnMask: null,
            showMaskOnFocus: true,
            showMaskOnHover: true,
            onKeyValidation: $.noop,
            skipOptionalPartCharacter: " ",
            numericInput: false,
            rightAlign: false,
            undoOnEscape: true,
            radixPoint: "",
            _radixDance: false,
            groupSeparator: "",
            keepStatic: null,
            positionCaretOnTab: true,
            tabThrough: false,
            supportsInputType: [ "text", "tel", "url", "password", "search" ],
            ignorables: [ 8, 9, 13, 19, 27, 33, 34, 35, 36, 37, 38, 39, 40, 45, 46, 93, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 0, 229 ],
            isComplete: null,
            preValidation: null,
            postValidation: null,
            staticDefinitionSymbol: undefined,
            jitMasking: false,
            nullable: true,
            inputEventOnly: false,
            noValuePatching: false,
            positionCaretOnClick: "lvp",
            casing: null,
            inputmode: "verbatim",
            colorMask: false,
            disablePredictiveText: false,
            importDataAttributes: true,
            shiftPositions: true
        },
        definitions: {
            9: {
                validator: "[0-9\uff11-\uff19]",
                definitionSymbol: "*"
            },
            a: {
                validator: "[A-Za-z\u0410-\u044f\u0401\u0451\xc0-\xff\xb5]",
                definitionSymbol: "*"
            },
            "?": {
                validator: ".",
                cardinality: 1,
                definitionSymbol: "*"
            },
            "*": {
                validator: "[0-9\uff11-\uff19A-Za-z\u0410-\u044f\u0401\u0451\xc0-\xff\xb5]"
            }
        },
        aliases: {},
        masksCache: {},
        mask: function(elems) {
            var that = this;
            function importAttributeOptions(npt, opts, userOptions, dataAttribute) {
                if (opts.importDataAttributes === true) {
                    var attrOptions = npt.getAttribute(dataAttribute), option, dataoptions, optionData, p;
                    function importOption(option, optionData) {
                        optionData = optionData !== undefined ? optionData : npt.getAttribute(dataAttribute + "-" + option);
                        if (optionData !== null) {
                            if (typeof optionData === "string") {
                                if (option.indexOf("on") === 0) optionData = window[optionData]; else if (optionData === "false") optionData = false; else if (optionData === "true") optionData = true;
                            }
                            userOptions[option] = optionData;
                        }
                    }
                    if (attrOptions && attrOptions !== "") {
                        attrOptions = attrOptions.replace(/'/g, '"');
                        dataoptions = JSON.parse("{" + attrOptions + "}");
                    }
                    if (dataoptions) {
                        optionData = undefined;
                        for (p in dataoptions) {
                            if (p.toLowerCase() === "alias") {
                                optionData = dataoptions[p];
                                break;
                            }
                        }
                    }
                    importOption("alias", optionData);
                    if (userOptions.alias) {
                        resolveAlias(userOptions.alias, userOptions, opts);
                    }
                    for (option in opts) {
                        if (dataoptions) {
                            optionData = undefined;
                            for (p in dataoptions) {
                                if (p.toLowerCase() === option.toLowerCase()) {
                                    optionData = dataoptions[p];
                                    break;
                                }
                            }
                        }
                        importOption(option, optionData);
                    }
                }
                $.extend(true, opts, userOptions);
                if (npt.dir === "rtl" || opts.rightAlign) {
                    npt.style.textAlign = "right";
                }
                if (npt.dir === "rtl" || opts.numericInput) {
                    npt.dir = "ltr";
                    npt.removeAttribute("dir");
                    opts.isRTL = true;
                }
                return Object.keys(userOptions).length;
            }
            if (typeof elems === "string") {
                elems = document.getElementById(elems) || document.querySelectorAll(elems);
            }
            elems = elems.nodeName ? [ elems ] : elems;
            $.each(elems, function(ndx, el) {
                var scopedOpts = $.extend(true, {}, that.opts);
                if (importAttributeOptions(el, scopedOpts, $.extend(true, {}, that.userOptions), that.dataAttribute)) {
                    var maskset = generateMaskSet(scopedOpts, that.noMasksCache);
                    if (maskset !== undefined) {
                        if (el.inputmask !== undefined) {
                            el.inputmask.opts.autoUnmask = el.inputmask.opts.autoUnmask;
                            el.inputmask.remove();
                        }
                        el.inputmask = new Inputmask(undefined, undefined, true);
                        el.inputmask.opts = scopedOpts;
                        el.inputmask.noMasksCache = that.noMasksCache;
                        el.inputmask.userOptions = $.extend(true, {}, that.userOptions);
                        el.inputmask.isRTL = scopedOpts.isRTL || scopedOpts.numericInput;
                        el.inputmask.el = el;
                        el.inputmask.maskset = maskset;
                        $.data(el, "_inputmask_opts", scopedOpts);
                        maskScope.call(el.inputmask, {
                            action: "mask"
                        });
                    }
                }
            });
            return elems && elems[0] ? elems[0].inputmask || this : this;
        },
        option: function(options, noremask) {
            if (typeof options === "string") {
                return this.opts[options];
            } else if (typeof options === "object") {
                $.extend(this.userOptions, options);
                if (this.el && noremask !== true) {
                    this.mask(this.el);
                }
                return this;
            }
        },
        unmaskedvalue: function(value) {
            this.maskset = this.maskset || generateMaskSet(this.opts, this.noMasksCache);
            return maskScope.call(this, {
                action: "unmaskedvalue",
                value: value
            });
        },
        remove: function() {
            return maskScope.call(this, {
                action: "remove"
            });
        },
        getemptymask: function() {
            this.maskset = this.maskset || generateMaskSet(this.opts, this.noMasksCache);
            return maskScope.call(this, {
                action: "getemptymask"
            });
        },
        hasMaskedValue: function() {
            return !this.opts.autoUnmask;
        },
        isComplete: function() {
            this.maskset = this.maskset || generateMaskSet(this.opts, this.noMasksCache);
            return maskScope.call(this, {
                action: "isComplete"
            });
        },
        getmetadata: function() {
            this.maskset = this.maskset || generateMaskSet(this.opts, this.noMasksCache);
            return maskScope.call(this, {
                action: "getmetadata"
            });
        },
        isValid: function(value) {
            this.maskset = this.maskset || generateMaskSet(this.opts, this.noMasksCache);
            return maskScope.call(this, {
                action: "isValid",
                value: value
            });
        },
        format: function(value, metadata) {
            this.maskset = this.maskset || generateMaskSet(this.opts, this.noMasksCache);
            return maskScope.call(this, {
                action: "format",
                value: value,
                metadata: metadata
            });
        },
        setValue: function(value) {
            if (this.el) {
                $(this.el).trigger("setvalue", [ value ]);
            }
        },
        analyseMask: function(mask, regexMask, opts) {
            var tokenizer = /(?:[?*+]|\{[0-9\+\*]+(?:,[0-9\+\*]*)?(?:\|[0-9\+\*]*)?\})|[^.?*+^${[]()|\\]+|./g, regexTokenizer = /\[\^?]?(?:[^\\\]]+|\\[\S\s]?)*]?|\\(?:0(?:[0-3][0-7]{0,2}|[4-7][0-7]?)?|[1-9][0-9]*|x[0-9A-Fa-f]{2}|u[0-9A-Fa-f]{4}|c[A-Za-z]|[\S\s]?)|\((?:\?[:=!]?)?|(?:[?*+]|\{[0-9]+(?:,[0-9]*)?\})\??|[^.?*+^${[()|\\]+|./g, escaped = false, currentToken = new MaskToken(), match, m, openenings = [], maskTokens = [], openingToken, currentOpeningToken, alternator, lastMatch, groupToken;
            function MaskToken(isGroup, isOptional, isQuantifier, isAlternator) {
                this.matches = [];
                this.openGroup = isGroup || false;
                this.alternatorGroup = false;
                this.isGroup = isGroup || false;
                this.isOptional = isOptional || false;
                this.isQuantifier = isQuantifier || false;
                this.isAlternator = isAlternator || false;
                this.quantifier = {
                    min: 1,
                    max: 1
                };
            }
            function insertTestDefinition(mtoken, element, position) {
                position = position !== undefined ? position : mtoken.matches.length;
                var prevMatch = mtoken.matches[position - 1];
                if (regexMask) {
                    if (element.indexOf("[") === 0 || escaped && /\\d|\\s|\\w]/i.test(element) || element === ".") {
                        mtoken.matches.splice(position++, 0, {
                            fn: new RegExp(element, opts.casing ? "i" : ""),
                            optionality: false,
                            newBlockMarker: prevMatch === undefined ? "master" : prevMatch.def !== element,
                            casing: null,
                            def: element,
                            placeholder: undefined,
                            nativeDef: element
                        });
                    } else {
                        if (escaped) element = element[element.length - 1];
                        $.each(element.split(""), function(ndx, lmnt) {
                            prevMatch = mtoken.matches[position - 1];
                            mtoken.matches.splice(position++, 0, {
                                fn: null,
                                optionality: false,
                                newBlockMarker: prevMatch === undefined ? "master" : prevMatch.def !== lmnt && prevMatch.fn !== null,
                                casing: null,
                                def: opts.staticDefinitionSymbol || lmnt,
                                placeholder: opts.staticDefinitionSymbol !== undefined ? lmnt : undefined,
                                nativeDef: (escaped ? "'" : "") + lmnt
                            });
                        });
                    }
                    escaped = false;
                } else {
                    var maskdef = (opts.definitions ? opts.definitions[element] : undefined) || Inputmask.prototype.definitions[element];
                    if (maskdef && !escaped) {
                        // This for-loop implements "cardinality"
                        // Removed in 4.x for unknown reasons.
                        // Backported from https://github.com/RobinHerbots/Inputmask/blob/8d0c60f8/js/inputmask.js#L371
                        for (var prevalidators = maskdef.prevalidator, prevalidatorsL = prevalidators ? prevalidators.length : 0, i = 1; i < maskdef.cardinality; i++) {
                            var prevalidator = prevalidatorsL >= i ? prevalidators[i - 1] : [], validator = prevalidator.validator, cardinality = prevalidator.cardinality;
                            mtoken.matches.splice(position++, 0, {
                                fn: validator ? "string" == typeof validator ? new RegExp(validator, opts.casing ? "i" : "") : new function() {
                                    this.test = validator;
                                }() : new RegExp("."),
                                cardinality: cardinality || 1,
                                optionality: mtoken.isOptional,
                                newBlockMarker: prevMatch === undefined || prevMatch.def !== (maskdef.definitionSymbol || element),
                                casing: maskdef.casing,
                                def: maskdef.definitionSymbol || element,
                                placeholder: maskdef.placeholder,
                                nativeDef: element
                            }), prevMatch = mtoken.matches[position - 1];
                        }
                        mtoken.matches.splice(position++, 0, {
                            fn: maskdef.validator ? typeof maskdef.validator == "string" ? new RegExp(maskdef.validator, opts.casing ? "i" : "") : new function() {
                                this.test = maskdef.validator;
                            }() : new RegExp("."),
                            optionality: false,
                            newBlockMarker: prevMatch === undefined ? "master" : prevMatch.def !== (maskdef.definitionSymbol || element),
                            casing: maskdef.casing,
                            def: maskdef.definitionSymbol || element,
                            placeholder: maskdef.placeholder,
                            nativeDef: element
                        });
                    } else {
                        mtoken.matches.splice(position++, 0, {
                            fn: null,
                            optionality: false,
                            newBlockMarker: prevMatch === undefined ? "master" : prevMatch.def !== element && prevMatch.fn !== null,
                            casing: null,
                            def: opts.staticDefinitionSymbol || element,
                            placeholder: opts.staticDefinitionSymbol !== undefined ? element : undefined,
                            nativeDef: (escaped ? "'" : "") + element
                        });
                        escaped = false;
                    }
                }
            }
            function verifyGroupMarker(maskToken) {
                if (maskToken && maskToken.matches) {
                    $.each(maskToken.matches, function(ndx, token) {
                        var nextToken = maskToken.matches[ndx + 1];
                        if ((nextToken === undefined || (nextToken.matches === undefined || nextToken.isQuantifier === false)) && token && token.isGroup) {
                            token.isGroup = false;
                            if (!regexMask) {
                                insertTestDefinition(token, opts.groupmarker[0], 0);
                                if (token.openGroup !== true) {
                                    insertTestDefinition(token, opts.groupmarker[1]);
                                }
                            }
                        }
                        verifyGroupMarker(token);
                    });
                }
            }
            function defaultCase() {
                if (openenings.length > 0) {
                    currentOpeningToken = openenings[openenings.length - 1];
                    insertTestDefinition(currentOpeningToken, m);
                    if (currentOpeningToken.isAlternator) {
                        alternator = openenings.pop();
                        for (var mndx = 0; mndx < alternator.matches.length; mndx++) {
                            if (alternator.matches[mndx].isGroup) alternator.matches[mndx].isGroup = false;
                        }
                        if (openenings.length > 0) {
                            currentOpeningToken = openenings[openenings.length - 1];
                            currentOpeningToken.matches.push(alternator);
                        } else {
                            currentToken.matches.push(alternator);
                        }
                    }
                } else {
                    insertTestDefinition(currentToken, m);
                }
            }
            function reverseTokens(maskToken) {
                function reverseStatic(st) {
                    if (st === opts.optionalmarker[0]) st = opts.optionalmarker[1]; else if (st === opts.optionalmarker[1]) st = opts.optionalmarker[0]; else if (st === opts.groupmarker[0]) st = opts.groupmarker[1]; else if (st === opts.groupmarker[1]) st = opts.groupmarker[0];
                    return st;
                }
                maskToken.matches = maskToken.matches.reverse();
                for (var match in maskToken.matches) {
                    if (maskToken.matches.hasOwnProperty(match)) {
                        var intMatch = parseInt(match);
                        if (maskToken.matches[match].isQuantifier && maskToken.matches[intMatch + 1] && maskToken.matches[intMatch + 1].isGroup) {
                            var qt = maskToken.matches[match];
                            maskToken.matches.splice(match, 1);
                            maskToken.matches.splice(intMatch + 1, 0, qt);
                        }
                        if (maskToken.matches[match].matches !== undefined) {
                            maskToken.matches[match] = reverseTokens(maskToken.matches[match]);
                        } else {
                            maskToken.matches[match] = reverseStatic(maskToken.matches[match]);
                        }
                    }
                }
                return maskToken;
            }
            function groupify(matches) {
                var groupToken = new MaskToken(true);
                groupToken.openGroup = false;
                groupToken.matches = matches;
                return groupToken;
            }
            if (regexMask) {
                opts.optionalmarker[0] = undefined;
                opts.optionalmarker[1] = undefined;
            }
            while (match = regexMask ? regexTokenizer.exec(mask) : tokenizer.exec(mask)) {
                m = match[0];
                if (regexMask) {
                    switch (m.charAt(0)) {
                      case "?":
                        m = "{0,1}";
                        break;

                      case "+":
                      case "*":
                        m = "{" + m + "}";
                        break;
                    }
                }
                if (escaped) {
                    defaultCase();
                    continue;
                }
                switch (m.charAt(0)) {
                  case "(?=":
                    break;

                  case "(?!":
                    break;

                  case "(?<=":
                    break;

                  case "(?<!":
                    break;

                  case opts.escapeChar:
                    escaped = true;
                    if (regexMask) {
                        defaultCase();
                    }
                    break;

                  case opts.optionalmarker[1]:
                  case opts.groupmarker[1]:
                    openingToken = openenings.pop();
                    openingToken.openGroup = false;
                    if (openingToken !== undefined) {
                        if (openenings.length > 0) {
                            currentOpeningToken = openenings[openenings.length - 1];
                            currentOpeningToken.matches.push(openingToken);
                            if (currentOpeningToken.isAlternator) {
                                alternator = openenings.pop();
                                for (var mndx = 0; mndx < alternator.matches.length; mndx++) {
                                    alternator.matches[mndx].isGroup = false;
                                    alternator.matches[mndx].alternatorGroup = false;
                                }
                                if (openenings.length > 0) {
                                    currentOpeningToken = openenings[openenings.length - 1];
                                    currentOpeningToken.matches.push(alternator);
                                } else {
                                    currentToken.matches.push(alternator);
                                }
                            }
                        } else {
                            currentToken.matches.push(openingToken);
                        }
                    } else defaultCase();
                    break;

                  case opts.optionalmarker[0]:
                    openenings.push(new MaskToken(false, true));
                    break;

                  case opts.groupmarker[0]:
                    openenings.push(new MaskToken(true));
                    break;

                  case opts.quantifiermarker[0]:
                    var quantifier = new MaskToken(false, false, true);
                    m = m.replace(/[{}]/g, "");
                    var mqj = m.split("|"), mq = mqj[0].split(","), mq0 = isNaN(mq[0]) ? mq[0] : parseInt(mq[0]), mq1 = mq.length === 1 ? mq0 : isNaN(mq[1]) ? mq[1] : parseInt(mq[1]);
                    if (mq0 === "*" || mq0 === "+") {
                        mq0 = mq1 === "*" ? 0 : 1;
                    }
                    quantifier.quantifier = {
                        min: mq0,
                        max: mq1,
                        jit: mqj[1]
                    };
                    var matches = openenings.length > 0 ? openenings[openenings.length - 1].matches : currentToken.matches;
                    match = matches.pop();
                    if (match.isAlternator) {
                        matches.push(match);
                        matches = match.matches;
                        var groupToken = new MaskToken(true);
                        var tmpMatch = matches.pop();
                        matches.push(groupToken);
                        matches = groupToken.matches;
                        match = tmpMatch;
                    }
                    if (!match.isGroup) {
                        match = groupify([ match ]);
                    }
                    matches.push(match);
                    matches.push(quantifier);
                    break;

                  case opts.alternatormarker:
                    function groupQuantifier(matches) {
                        var lastMatch = matches.pop();
                        if (lastMatch.isQuantifier) {
                            lastMatch = groupify([ matches.pop(), lastMatch ]);
                        }
                        return lastMatch;
                    }
                    if (openenings.length > 0) {
                        currentOpeningToken = openenings[openenings.length - 1];
                        var subToken = currentOpeningToken.matches[currentOpeningToken.matches.length - 1];
                        if (currentOpeningToken.openGroup && (subToken.matches === undefined || subToken.isGroup === false && subToken.isAlternator === false)) {
                            lastMatch = openenings.pop();
                        } else {
                            lastMatch = groupQuantifier(currentOpeningToken.matches);
                        }
                    } else {
                        lastMatch = groupQuantifier(currentToken.matches);
                    }
                    if (lastMatch.isAlternator) {
                        openenings.push(lastMatch);
                    } else {
                        if (lastMatch.alternatorGroup) {
                            alternator = openenings.pop();
                            lastMatch.alternatorGroup = false;
                        } else {
                            alternator = new MaskToken(false, false, false, true);
                        }
                        alternator.matches.push(lastMatch);
                        openenings.push(alternator);
                        if (lastMatch.openGroup) {
                            lastMatch.openGroup = false;
                            var alternatorGroup = new MaskToken(true);
                            alternatorGroup.alternatorGroup = true;
                            openenings.push(alternatorGroup);
                        }
                    }
                    break;

                  default:
                    defaultCase();
                }
            }
            while (openenings.length > 0) {
                openingToken = openenings.pop();
                currentToken.matches.push(openingToken);
            }
            if (currentToken.matches.length > 0) {
                verifyGroupMarker(currentToken);
                maskTokens.push(currentToken);
            }
            if (opts.numericInput || opts.isRTL) {
                reverseTokens(maskTokens[0]);
            }
            return maskTokens;
        }
    };
    Inputmask.extendDefaults = function(options) {
        $.extend(true, Inputmask.prototype.defaults, options);
    };
    Inputmask.extendDefinitions = function(definition) {
        $.extend(true, Inputmask.prototype.definitions, definition);
    };
    Inputmask.extendAliases = function(alias) {
        $.extend(true, Inputmask.prototype.aliases, alias);
    };
    Inputmask.format = function(value, options, metadata) {
        return Inputmask(options).format(value, metadata);
    };
    Inputmask.unmask = function(value, options) {
        return Inputmask(options).unmaskedvalue(value);
    };
    Inputmask.isValid = function(value, options) {
        return Inputmask(options).isValid(value);
    };
    Inputmask.remove = function(elems) {
        if (typeof elems === "string") {
            elems = document.getElementById(elems) || document.querySelectorAll(elems);
        }
        elems = elems.nodeName ? [ elems ] : elems;
        $.each(elems, function(ndx, el) {
            if (el.inputmask) el.inputmask.remove();
        });
    };
    Inputmask.setValue = function(elems, value) {
        if (typeof elems === "string") {
            elems = document.getElementById(elems) || document.querySelectorAll(elems);
        }
        elems = elems.nodeName ? [ elems ] : elems;
        $.each(elems, function(ndx, el) {
            if (el.inputmask) el.inputmask.setValue(value); else $(el).trigger("setvalue", [ value ]);
        });
    };
    Inputmask.escapeRegex = function(str) {
        var specials = [ "/", ".", "*", "+", "?", "|", "(", ")", "[", "]", "{", "}", "\\", "$", "^" ];
        return str.replace(new RegExp("(\\" + specials.join("|\\") + ")", "gim"), "\\$1");
    };
    Inputmask.keyCode = {
        BACKSPACE: 8,
        BACKSPACE_SAFARI: 127,
        DELETE: 46,
        DOWN: 40,
        END: 35,
        ENTER: 13,
        ESCAPE: 27,
        HOME: 36,
        INSERT: 45,
        LEFT: 37,
        PAGE_DOWN: 34,
        PAGE_UP: 33,
        RIGHT: 39,
        SPACE: 32,
        TAB: 9,
        UP: 38,
        X: 88,
        CONTROL: 17
    };
    Inputmask.dependencyLib = $;
    function resolveAlias(aliasStr, options, opts) {
        var aliasDefinition = Inputmask.prototype.aliases[aliasStr];
        if (aliasDefinition) {
            if (aliasDefinition.alias) resolveAlias(aliasDefinition.alias, undefined, opts);
            $.extend(true, opts, aliasDefinition);
            $.extend(true, opts, options);
            return true;
        } else if (opts.mask === null) {
            opts.mask = aliasStr;
        }
        return false;
    }
    function generateMaskSet(opts, nocache) {
        function generateMask(mask, metadata, opts) {
            var regexMask = false;
            if (mask === null || mask === "") {
                regexMask = opts.regex !== null;
                if (regexMask) {
                    mask = opts.regex;
                    mask = mask.replace(/^(\^)(.*)(\$)$/, "$2");
                } else {
                    regexMask = true;
                    mask = ".*";
                }
            }
            if (mask.length === 1 && opts.greedy === false && opts.repeat !== 0) {
                opts.placeholder = "";
            }
            if (opts.repeat > 0 || opts.repeat === "*" || opts.repeat === "+") {
                var repeatStart = opts.repeat === "*" ? 0 : opts.repeat === "+" ? 1 : opts.repeat;
                mask = opts.groupmarker[0] + mask + opts.groupmarker[1] + opts.quantifiermarker[0] + repeatStart + "," + opts.repeat + opts.quantifiermarker[1];
            }
            var masksetDefinition, maskdefKey = regexMask ? "regex_" + opts.regex : opts.numericInput ? mask.split("").reverse().join("") : mask;
            if (Inputmask.prototype.masksCache[maskdefKey] === undefined || nocache === true) {
                masksetDefinition = {
                    mask: mask,
                    maskToken: Inputmask.prototype.analyseMask(mask, regexMask, opts),
                    validPositions: {},
                    _buffer: undefined,
                    buffer: undefined,
                    tests: {},
                    excludes: {},
                    metadata: metadata,
                    maskLength: undefined,
                    jitOffset: {}
                };
                if (nocache !== true) {
                    Inputmask.prototype.masksCache[maskdefKey] = masksetDefinition;
                    masksetDefinition = $.extend(true, {}, Inputmask.prototype.masksCache[maskdefKey]);
                }
            } else masksetDefinition = $.extend(true, {}, Inputmask.prototype.masksCache[maskdefKey]);
            return masksetDefinition;
        }
        var ms;
        if ($.isFunction(opts.mask)) {
            opts.mask = opts.mask(opts);
        }
        if ($.isArray(opts.mask)) {
            if (opts.mask.length > 1) {
                if (opts.keepStatic === null) {
                    opts.keepStatic = "auto";
                    for (var i = 0; i < opts.mask.length; i++) {
                        if (opts.mask[i].charAt(0) !== opts.mask[0].charAt(0)) {
                            opts.keepStatic = true;
                            break;
                        }
                    }
                }
                var altMask = opts.groupmarker[0];
                $.each(opts.isRTL ? opts.mask.reverse() : opts.mask, function(ndx, msk) {
                    if (altMask.length > 1) {
                        altMask += opts.groupmarker[1] + opts.alternatormarker + opts.groupmarker[0];
                    }
                    if (msk.mask !== undefined && !$.isFunction(msk.mask)) {
                        altMask += msk.mask;
                    } else {
                        altMask += msk;
                    }
                });
                altMask += opts.groupmarker[1];
                return generateMask(altMask, opts.mask, opts);
            } else opts.mask = opts.mask.pop();
        }
        if (opts.mask && opts.mask.mask !== undefined && !$.isFunction(opts.mask.mask)) {
            ms = generateMask(opts.mask.mask, opts.mask, opts);
        } else {
            ms = generateMask(opts.mask, opts.mask, opts);
        }
        return ms;
    }
    function isInputEventSupported(eventName) {
        var el = document.createElement("input"), evName = "on" + eventName, isSupported = evName in el;
        if (!isSupported) {
            el.setAttribute(evName, "return;");
            isSupported = typeof el[evName] === "function";
        }
        el = null;
        return isSupported;
    }
    function maskScope(actionObj, maskset, opts) {
        maskset = maskset || this.maskset;
        opts = opts || this.opts;
        var inputmask = this, el = this.el, isRTL = this.isRTL, undoValue, $el, skipKeyPressEvent = false, skipInputEvent = false, ignorable = false, maxLength, mouseEnter = false, colorMask, originalPlaceholder;
        function getMaskTemplate(baseOnInput, minimalPos, includeMode, noJit, clearOptionalTail) {
            var greedy = opts.greedy;
            if (clearOptionalTail) opts.greedy = false;
            minimalPos = minimalPos || 0;
            var maskTemplate = [], ndxIntlzr, pos = 0, test, testPos, lvp = getLastValidPosition();
            do {
                if (baseOnInput === true && getMaskSet().validPositions[pos]) {
                    testPos = clearOptionalTail && getMaskSet().validPositions[pos].match.optionality === true && getMaskSet().validPositions[pos + 1] === undefined && (getMaskSet().validPositions[pos].generatedInput === true || getMaskSet().validPositions[pos].input == opts.skipOptionalPartCharacter && pos > 0) ? determineTestTemplate(pos, getTests(pos, ndxIntlzr, pos - 1)) : getMaskSet().validPositions[pos];
                    test = testPos.match;
                    ndxIntlzr = testPos.locator.slice();
                    maskTemplate.push(includeMode === true ? testPos.input : includeMode === false ? test.nativeDef : getPlaceholder(pos, test));
                } else {
                    testPos = getTestTemplate(pos, ndxIntlzr, pos - 1);
                    test = testPos.match;
                    ndxIntlzr = testPos.locator.slice();
                    var jitMasking = noJit === true ? false : opts.jitMasking !== false ? opts.jitMasking : test.jit;
                    if (jitMasking === false || jitMasking === undefined || typeof jitMasking === "number" && isFinite(jitMasking) && jitMasking > pos) {
                        maskTemplate.push(includeMode === false ? test.nativeDef : getPlaceholder(pos, test));
                    }
                }
                if (opts.keepStatic === "auto") {
                    if (test.newBlockMarker && test.fn !== null) {
                        opts.keepStatic = pos - 1;
                    }
                }
                pos++;
            } while ((maxLength === undefined || pos < maxLength) && (test.fn !== null || test.def !== "") || minimalPos > pos);
            if (maskTemplate[maskTemplate.length - 1] === "") {
                maskTemplate.pop();
            }
            if (includeMode !== false || getMaskSet().maskLength === undefined) getMaskSet().maskLength = pos - 1;
            opts.greedy = greedy;
            return maskTemplate;
        }
        function getMaskSet() {
            return maskset;
        }
        function resetMaskSet(soft) {
            var maskset = getMaskSet();
            maskset.buffer = undefined;
            if (soft !== true) {
                maskset.validPositions = {};
                maskset.p = 0;
            }
        }
        function getLastValidPosition(closestTo, strict, validPositions) {
            var before = -1, after = -1, valids = validPositions || getMaskSet().validPositions;
            if (closestTo === undefined) closestTo = -1;
            for (var posNdx in valids) {
                var psNdx = parseInt(posNdx);
                if (valids[psNdx] && (strict || valids[psNdx].generatedInput !== true)) {
                    if (psNdx <= closestTo) before = psNdx;
                    if (psNdx >= closestTo) after = psNdx;
                }
            }
            return before === -1 || before == closestTo ? after : after == -1 ? before : closestTo - before < after - closestTo ? before : after;
        }
        function getDecisionTaker(tst) {
            var decisionTaker = tst.locator[tst.alternation];
            if (typeof decisionTaker == "string" && decisionTaker.length > 0) {
                decisionTaker = decisionTaker.split(",")[0];
            }
            return decisionTaker !== undefined ? decisionTaker.toString() : "";
        }
        function getLocator(tst, align) {
            var locator = (tst.alternation != undefined ? tst.mloc[getDecisionTaker(tst)] : tst.locator).join("");
            if (locator !== "") while (locator.length < align) locator += "0";
            return locator;
        }
        function determineTestTemplate(pos, tests) {
            pos = pos > 0 ? pos - 1 : 0;
            var altTest = getTest(pos), targetLocator = getLocator(altTest), tstLocator, closest, bestMatch;
            for (var ndx = 0; ndx < tests.length; ndx++) {
                var tst = tests[ndx];
                tstLocator = getLocator(tst, targetLocator.length);
                var distance = Math.abs(tstLocator - targetLocator);
                if (closest === undefined || tstLocator !== "" && distance < closest || bestMatch && !opts.greedy && bestMatch.match.optionality && bestMatch.match.newBlockMarker === "master" && (!tst.match.optionality || !tst.match.newBlockMarker) || bestMatch && bestMatch.match.optionalQuantifier && !tst.match.optionalQuantifier) {
                    closest = distance;
                    bestMatch = tst;
                }
            }
            return bestMatch;
        }
        function getTestTemplate(pos, ndxIntlzr, tstPs) {
            return getMaskSet().validPositions[pos] || determineTestTemplate(pos, getTests(pos, ndxIntlzr ? ndxIntlzr.slice() : ndxIntlzr, tstPs));
        }
        function getTest(pos, tests) {
            if (getMaskSet().validPositions[pos]) {
                return getMaskSet().validPositions[pos];
            }
            return (tests || getTests(pos))[0];
        }
        function positionCanMatchDefinition(pos, def) {
            var valid = false, tests = getTests(pos);
            for (var tndx = 0; tndx < tests.length; tndx++) {
                if (tests[tndx].match && tests[tndx].match.def === def) {
                    valid = true;
                    break;
                }
            }
            return valid;
        }
        function getTests(pos, ndxIntlzr, tstPs) {
            var maskTokens = getMaskSet().maskToken, testPos = ndxIntlzr ? tstPs : 0, ndxInitializer = ndxIntlzr ? ndxIntlzr.slice() : [ 0 ], matches = [], insertStop = false, latestMatch, cacheDependency = ndxIntlzr ? ndxIntlzr.join("") : "";
            function resolveTestFromToken(maskToken, ndxInitializer, loopNdx, quantifierRecurse) {
                function handleMatch(match, loopNdx, quantifierRecurse) {
                    function isFirstMatch(latestMatch, tokenGroup) {
                        var firstMatch = $.inArray(latestMatch, tokenGroup.matches) === 0;
                        if (!firstMatch) {
                            $.each(tokenGroup.matches, function(ndx, match) {
                                if (match.isQuantifier === true) firstMatch = isFirstMatch(latestMatch, tokenGroup.matches[ndx - 1]); else if (match.hasOwnProperty("matches")) firstMatch = isFirstMatch(latestMatch, match);
                                if (firstMatch) return false;
                            });
                        }
                        return firstMatch;
                    }
                    function resolveNdxInitializer(pos, alternateNdx, targetAlternation) {
                        var bestMatch, indexPos;
                        if (getMaskSet().tests[pos] || getMaskSet().validPositions[pos]) {
                            $.each(getMaskSet().tests[pos] || [ getMaskSet().validPositions[pos] ], function(ndx, lmnt) {
                                if (lmnt.mloc[alternateNdx]) {
                                    bestMatch = lmnt;
                                    return false;
                                }
                                var alternation = targetAlternation !== undefined ? targetAlternation : lmnt.alternation, ndxPos = lmnt.locator[alternation] !== undefined ? lmnt.locator[alternation].toString().indexOf(alternateNdx) : -1;
                                if ((indexPos === undefined || ndxPos < indexPos) && ndxPos !== -1) {
                                    bestMatch = lmnt;
                                    indexPos = ndxPos;
                                }
                            });
                        }
                        if (bestMatch) {
                            var bestMatchAltIndex = bestMatch.locator[bestMatch.alternation];
                            var locator = bestMatch.mloc[alternateNdx] || bestMatch.mloc[bestMatchAltIndex] || bestMatch.locator;
                            return locator.slice((targetAlternation !== undefined ? targetAlternation : bestMatch.alternation) + 1);
                        } else {
                            return targetAlternation !== undefined ? resolveNdxInitializer(pos, alternateNdx) : undefined;
                        }
                    }
                    function isSubsetOf(source, target) {
                        function expand(pattern) {
                            var expanded = [], start, end;
                            for (var i = 0, l = pattern.length; i < l; i++) {
                                if (pattern.charAt(i) === "-") {
                                    end = pattern.charCodeAt(i + 1);
                                    while (++start < end) expanded.push(String.fromCharCode(start));
                                } else {
                                    start = pattern.charCodeAt(i);
                                    expanded.push(pattern.charAt(i));
                                }
                            }
                            return expanded.join("");
                        }
                        if (opts.regex && source.match.fn !== null && target.match.fn !== null) {
                            return expand(target.match.def.replace(/[\[\]]/g, "")).indexOf(expand(source.match.def.replace(/[\[\]]/g, ""))) !== -1;
                        }
                        return source.match.def === target.match.nativeDef;
                    }
                    function staticCanMatchDefinition(source, target) {
                        var sloc = source.locator.slice(source.alternation).join(""), tloc = target.locator.slice(target.alternation).join(""), canMatch = sloc == tloc;
                        canMatch = canMatch && source.match.fn === null && target.match.fn !== null ? target.match.fn.test(source.match.def, getMaskSet(), pos, false, opts, false) : false;
                        return canMatch;
                    }
                    function setMergeLocators(targetMatch, altMatch) {
                        if (altMatch === undefined || targetMatch.alternation === altMatch.alternation && targetMatch.locator[targetMatch.alternation].toString().indexOf(altMatch.locator[altMatch.alternation]) === -1) {
                            targetMatch.mloc = targetMatch.mloc || {};
                            var locNdx = targetMatch.locator[targetMatch.alternation];
                            if (locNdx === undefined) targetMatch.alternation = undefined; else {
                                if (typeof locNdx === "string") locNdx = locNdx.split(",")[0];
                                if (targetMatch.mloc[locNdx] === undefined) targetMatch.mloc[locNdx] = targetMatch.locator.slice();
                                if (altMatch !== undefined) {
                                    for (var ndx in altMatch.mloc) {
                                        if (typeof ndx === "string") ndx = ndx.split(",")[0];
                                        if (targetMatch.mloc[ndx] === undefined) targetMatch.mloc[ndx] = altMatch.mloc[ndx];
                                    }
                                    targetMatch.locator[targetMatch.alternation] = Object.keys(targetMatch.mloc).join(",");
                                }
                                return true;
                            }
                        }
                        return false;
                    }
                    if (testPos > 500 && quantifierRecurse !== undefined) {
                        throw "Inputmask: There is probably an error in your mask definition or in the code. Create an issue on github with an example of the mask you are using. " + getMaskSet().mask;
                    }
                    if (testPos === pos && match.matches === undefined) {
                        matches.push({
                            match: match,
                            locator: loopNdx.reverse(),
                            cd: cacheDependency,
                            mloc: {}
                        });
                        return true;
                    } else if (match.matches !== undefined) {
                        if (match.isGroup && quantifierRecurse !== match) {
                            match = handleMatch(maskToken.matches[$.inArray(match, maskToken.matches) + 1], loopNdx, quantifierRecurse);
                            if (match) return true;
                        } else if (match.isOptional) {
                            var optionalToken = match;
                            match = resolveTestFromToken(match, ndxInitializer, loopNdx, quantifierRecurse);
                            if (match) {
                                $.each(matches, function(ndx, mtch) {
                                    mtch.match.optionality = true;
                                });
                                latestMatch = matches[matches.length - 1].match;
                                if (quantifierRecurse === undefined && isFirstMatch(latestMatch, optionalToken)) {
                                    insertStop = true;
                                    testPos = pos;
                                } else return true;
                            }
                        } else if (match.isAlternator) {
                            var alternateToken = match, malternateMatches = [], maltMatches, currentMatches = matches.slice(), loopNdxCnt = loopNdx.length;
                            var altIndex = ndxInitializer.length > 0 ? ndxInitializer.shift() : -1;
                            if (altIndex === -1 || typeof altIndex === "string") {
                                var currentPos = testPos, ndxInitializerClone = ndxInitializer.slice(), altIndexArr = [], amndx;
                                if (typeof altIndex == "string") {
                                    altIndexArr = altIndex.split(",");
                                } else {
                                    for (amndx = 0; amndx < alternateToken.matches.length; amndx++) {
                                        altIndexArr.push(amndx.toString());
                                    }
                                }
                                if (getMaskSet().excludes[pos]) {
                                    var altIndexArrClone = altIndexArr.slice();
                                    for (var i = 0, el = getMaskSet().excludes[pos].length; i < el; i++) {
                                        altIndexArr.splice(altIndexArr.indexOf(getMaskSet().excludes[pos][i].toString()), 1);
                                    }
                                    if (altIndexArr.length === 0) {
                                        getMaskSet().excludes[pos] = undefined;
                                        altIndexArr = altIndexArrClone;
                                    }
                                }
                                if (opts.keepStatic === true || isFinite(parseInt(opts.keepStatic)) && currentPos >= opts.keepStatic) altIndexArr = altIndexArr.slice(0, 1);
                                var unMatchedAlternation = false;
                                for (var ndx = 0; ndx < altIndexArr.length; ndx++) {
                                    amndx = parseInt(altIndexArr[ndx]);
                                    matches = [];
                                    ndxInitializer = typeof altIndex === "string" ? resolveNdxInitializer(testPos, amndx, loopNdxCnt) || ndxInitializerClone.slice() : ndxInitializerClone.slice();
                                    if (alternateToken.matches[amndx] && handleMatch(alternateToken.matches[amndx], [ amndx ].concat(loopNdx), quantifierRecurse)) match = true; else if (ndx === 0) {
                                        unMatchedAlternation = true;
                                    }
                                    maltMatches = matches.slice();
                                    testPos = currentPos;
                                    matches = [];
                                    for (var ndx1 = 0; ndx1 < maltMatches.length; ndx1++) {
                                        var altMatch = maltMatches[ndx1], dropMatch = false;
                                        altMatch.match.jit = altMatch.match.jit || unMatchedAlternation;
                                        altMatch.alternation = altMatch.alternation || loopNdxCnt;
                                        setMergeLocators(altMatch);
                                        for (var ndx2 = 0; ndx2 < malternateMatches.length; ndx2++) {
                                            var altMatch2 = malternateMatches[ndx2];
                                            if (typeof altIndex !== "string" || altMatch.alternation !== undefined && $.inArray(altMatch.locator[altMatch.alternation].toString(), altIndexArr) !== -1) {
                                                if (altMatch.match.nativeDef === altMatch2.match.nativeDef) {
                                                    dropMatch = true;
                                                    setMergeLocators(altMatch2, altMatch);
                                                    break;
                                                } else if (isSubsetOf(altMatch, altMatch2)) {
                                                    if (setMergeLocators(altMatch, altMatch2)) {
                                                        dropMatch = true;
                                                        malternateMatches.splice(malternateMatches.indexOf(altMatch2), 0, altMatch);
                                                    }
                                                    break;
                                                } else if (isSubsetOf(altMatch2, altMatch)) {
                                                    setMergeLocators(altMatch2, altMatch);
                                                    break;
                                                } else if (staticCanMatchDefinition(altMatch, altMatch2)) {
                                                    if (setMergeLocators(altMatch, altMatch2)) {
                                                        dropMatch = true;
                                                        malternateMatches.splice(malternateMatches.indexOf(altMatch2), 0, altMatch);
                                                    }
                                                    break;
                                                }
                                            }
                                        }
                                        if (!dropMatch) {
                                            malternateMatches.push(altMatch);
                                        }
                                    }
                                }
                                matches = currentMatches.concat(malternateMatches);
                                testPos = pos;
                                insertStop = matches.length > 0;
                                match = malternateMatches.length > 0;
                                ndxInitializer = ndxInitializerClone.slice();
                            } else match = handleMatch(alternateToken.matches[altIndex] || maskToken.matches[altIndex], [ altIndex ].concat(loopNdx), quantifierRecurse);
                            if (match) return true;
                        } else if (match.isQuantifier && quantifierRecurse !== maskToken.matches[$.inArray(match, maskToken.matches) - 1]) {
                            var qt = match;
                            for (var qndx = ndxInitializer.length > 0 ? ndxInitializer.shift() : 0; qndx < (isNaN(qt.quantifier.max) ? qndx + 1 : qt.quantifier.max) && testPos <= pos; qndx++) {
                                var tokenGroup = maskToken.matches[$.inArray(qt, maskToken.matches) - 1];
                                match = handleMatch(tokenGroup, [ qndx ].concat(loopNdx), tokenGroup);
                                if (match) {
                                    latestMatch = matches[matches.length - 1].match;
                                    latestMatch.optionalQuantifier = qndx >= qt.quantifier.min;
                                    latestMatch.jit = (qndx || 1) * tokenGroup.matches.indexOf(latestMatch) >= qt.quantifier.jit;
                                    if (latestMatch.optionalQuantifier && isFirstMatch(latestMatch, tokenGroup)) {
                                        insertStop = true;
                                        testPos = pos;
                                        break;
                                    }
                                    if (latestMatch.jit) {
                                        getMaskSet().jitOffset[pos] = tokenGroup.matches.indexOf(latestMatch);
                                    }
                                    return true;
                                }
                            }
                        } else {
                            match = resolveTestFromToken(match, ndxInitializer, loopNdx, quantifierRecurse);
                            if (match) return true;
                        }
                    } else {
                        testPos++;
                    }
                }
                for (var tndx = ndxInitializer.length > 0 ? ndxInitializer.shift() : 0; tndx < maskToken.matches.length; tndx++) {
                    if (maskToken.matches[tndx].isQuantifier !== true) {
                        var match = handleMatch(maskToken.matches[tndx], [ tndx ].concat(loopNdx), quantifierRecurse);
                        if (match && testPos === pos) {
                            return match;
                        } else if (testPos > pos) {
                            break;
                        }
                    }
                }
            }
            function mergeLocators(pos, tests) {
                var locator = [];
                if (!$.isArray(tests)) tests = [ tests ];
                if (tests.length > 0) {
                    if (tests[0].alternation === undefined) {
                        locator = determineTestTemplate(pos, tests.slice()).locator.slice();
                        if (locator.length === 0) locator = tests[0].locator.slice();
                    } else {
                        $.each(tests, function(ndx, tst) {
                            if (tst.def !== "") {
                                if (locator.length === 0) locator = tst.locator.slice(); else {
                                    for (var i = 0; i < locator.length; i++) {
                                        if (tst.locator[i] && locator[i].toString().indexOf(tst.locator[i]) === -1) {
                                            locator[i] += "," + tst.locator[i];
                                        }
                                    }
                                }
                            }
                        });
                    }
                }
                return locator;
            }
            if (pos > -1) {
                if (ndxIntlzr === undefined) {
                    var previousPos = pos - 1, test;
                    while ((test = getMaskSet().validPositions[previousPos] || getMaskSet().tests[previousPos]) === undefined && previousPos > -1) {
                        previousPos--;
                    }
                    if (test !== undefined && previousPos > -1) {
                        ndxInitializer = mergeLocators(previousPos, test);
                        cacheDependency = ndxInitializer.join("");
                        testPos = previousPos;
                    }
                }
                if (getMaskSet().tests[pos] && getMaskSet().tests[pos][0].cd === cacheDependency) {
                    return getMaskSet().tests[pos];
                }
                for (var mtndx = ndxInitializer.shift(); mtndx < maskTokens.length; mtndx++) {
                    var match = resolveTestFromToken(maskTokens[mtndx], ndxInitializer, [ mtndx ]);
                    if (match && testPos === pos || testPos > pos) {
                        break;
                    }
                }
            }
            if (matches.length === 0 || insertStop) {
                matches.push({
                    match: {
                        fn: null,
                        optionality: false,
                        casing: null,
                        def: "",
                        placeholder: ""
                    },
                    locator: [],
                    mloc: {},
                    cd: cacheDependency
                });
            }
            if (ndxIntlzr !== undefined && getMaskSet().tests[pos]) {
                return $.extend(true, [], matches);
            }
            getMaskSet().tests[pos] = $.extend(true, [], matches);
            return getMaskSet().tests[pos];
        }
        function getBufferTemplate() {
            if (getMaskSet()._buffer === undefined) {
                getMaskSet()._buffer = getMaskTemplate(false, 1);
                if (getMaskSet().buffer === undefined) getMaskSet().buffer = getMaskSet()._buffer.slice();
            }
            return getMaskSet()._buffer;
        }
        function getBuffer(noCache) {
            if (getMaskSet().buffer === undefined || noCache === true) {
                getMaskSet().buffer = getMaskTemplate(true, getLastValidPosition(), true);
                if (getMaskSet()._buffer === undefined) getMaskSet()._buffer = getMaskSet().buffer.slice();
            }
            return getMaskSet().buffer;
        }
        function refreshFromBuffer(start, end, buffer) {
            var i, p;
            if (start === true) {
                resetMaskSet();
                start = 0;
                end = buffer.length;
            } else {
                for (i = start; i < end; i++) {
                    delete getMaskSet().validPositions[i];
                }
            }
            p = start;
            for (i = start; i < end; i++) {
                resetMaskSet(true);
                if (buffer[i] !== opts.skipOptionalPartCharacter) {
                    var valResult = isValid(p, buffer[i], true, true);
                    if (valResult !== false) {
                        resetMaskSet(true);
                        p = valResult.caret !== undefined ? valResult.caret : valResult.pos + 1;
                    }
                }
            }
        }
        function casing(elem, test, pos) {
            switch (opts.casing || test.casing) {
              case "upper":
                elem = elem.toUpperCase();
                break;

              case "lower":
                elem = elem.toLowerCase();
                break;

              case "title":
                var posBefore = getMaskSet().validPositions[pos - 1];
                if (pos === 0 || posBefore && posBefore.input === String.fromCharCode(Inputmask.keyCode.SPACE)) {
                    elem = elem.toUpperCase();
                } else {
                    elem = elem.toLowerCase();
                }
                break;

              default:
                if ($.isFunction(opts.casing)) {
                    var args = Array.prototype.slice.call(arguments);
                    args.push(getMaskSet().validPositions);
                    elem = opts.casing.apply(this, args);
                }
            }
            return elem;
        }
        function checkAlternationMatch(altArr1, altArr2, na) {
            var altArrC = opts.greedy ? altArr2 : altArr2.slice(0, 1), isMatch = false, naArr = na !== undefined ? na.split(",") : [], naNdx;
            for (var i = 0; i < naArr.length; i++) {
                if ((naNdx = altArr1.indexOf(naArr[i])) !== -1) {
                    altArr1.splice(naNdx, 1);
                }
            }
            for (var alndx = 0; alndx < altArr1.length; alndx++) {
                if ($.inArray(altArr1[alndx], altArrC) !== -1) {
                    isMatch = true;
                    break;
                }
            }
            return isMatch;
        }
        function alternate(pos, c, strict, fromSetValid, rAltPos) {
            var validPsClone = $.extend(true, {}, getMaskSet().validPositions), lastAlt, alternation, isValidRslt = false, altPos, prevAltPos, i, validPos, decisionPos, lAltPos = rAltPos !== undefined ? rAltPos : getLastValidPosition();
            if (lAltPos === -1 && rAltPos === undefined) {
                lastAlt = 0;
                prevAltPos = getTest(lastAlt);
                alternation = prevAltPos.alternation;
            } else {
                for (;lAltPos >= 0; lAltPos--) {
                    altPos = getMaskSet().validPositions[lAltPos];
                    if (altPos && altPos.alternation !== undefined) {
                        if (prevAltPos && prevAltPos.locator[altPos.alternation] !== altPos.locator[altPos.alternation]) {
                            break;
                        }
                        lastAlt = lAltPos;
                        alternation = getMaskSet().validPositions[lastAlt].alternation;
                        prevAltPos = altPos;
                    }
                }
            }
            if (alternation !== undefined) {
                decisionPos = parseInt(lastAlt);
                getMaskSet().excludes[decisionPos] = getMaskSet().excludes[decisionPos] || [];
                if (pos !== true) {
                    getMaskSet().excludes[decisionPos].push(getDecisionTaker(prevAltPos));
                }
                var validInputsClone = [], staticInputsBeforePos = 0;
                for (i = decisionPos; i < getLastValidPosition(undefined, true) + 1; i++) {
                    validPos = getMaskSet().validPositions[i];
                    if (validPos && validPos.generatedInput !== true) {
                        validInputsClone.push(validPos.input);
                    } else if (i < pos) staticInputsBeforePos++;
                    delete getMaskSet().validPositions[i];
                }
                while (getMaskSet().excludes[decisionPos] && getMaskSet().excludes[decisionPos].length < 10) {
                    var posOffset = staticInputsBeforePos * -1, validInputs = validInputsClone.slice();
                    getMaskSet().tests[decisionPos] = undefined;
                    resetMaskSet(true);
                    isValidRslt = true;
                    while (validInputs.length > 0) {
                        var input = validInputs.shift();
                        if (!(isValidRslt = isValid(getLastValidPosition(undefined, true) + 1, input, false, fromSetValid, true))) {
                            break;
                        }
                    }
                    if (isValidRslt && c !== undefined) {
                        var targetLvp = getLastValidPosition(pos) + 1;
                        for (i = decisionPos; i < getLastValidPosition() + 1; i++) {
                            validPos = getMaskSet().validPositions[i];
                            if ((validPos === undefined || validPos.match.fn == null) && i < pos + posOffset) {
                                posOffset++;
                            }
                        }
                        pos = pos + posOffset;
                        isValidRslt = isValid(pos > targetLvp ? targetLvp : pos, c, strict, fromSetValid, true);
                    }
                    if (!isValidRslt) {
                        resetMaskSet();
                        prevAltPos = getTest(decisionPos);
                        getMaskSet().validPositions = $.extend(true, {}, validPsClone);
                        if (getMaskSet().excludes[decisionPos]) {
                            var decisionTaker = getDecisionTaker(prevAltPos);
                            if (getMaskSet().excludes[decisionPos].indexOf(decisionTaker) !== -1) {
                                isValidRslt = alternate(pos, c, strict, fromSetValid, decisionPos - 1);
                                break;
                            }
                            getMaskSet().excludes[decisionPos].push(decisionTaker);
                            for (i = decisionPos; i < getLastValidPosition(undefined, true) + 1; i++) delete getMaskSet().validPositions[i];
                        } else {
                            isValidRslt = alternate(pos, c, strict, fromSetValid, decisionPos - 1);
                            break;
                        }
                    } else break;
                }
            }
            getMaskSet().excludes[decisionPos] = undefined;
            return isValidRslt;
        }
        function isValid(pos, c, strict, fromSetValid, fromAlternate, validateOnly) {
            function isSelection(posObj) {
                return isRTL ? posObj.begin - posObj.end > 1 || posObj.begin - posObj.end === 1 : posObj.end - posObj.begin > 1 || posObj.end - posObj.begin === 1;
            }
            strict = strict === true;
            var maskPos = pos;
            if (pos.begin !== undefined) {
                maskPos = isRTL ? pos.end : pos.begin;
            }
            function _isValid(position, c, strict) {
                var rslt = false;
                $.each(getTests(position), function(ndx, tst) {
                    var test = tst.match;
                    getBuffer(true);
                    rslt = test.fn != null ? test.fn.test(c, getMaskSet(), position, strict, opts, isSelection(pos)) : (c === test.def || c === opts.skipOptionalPartCharacter) && test.def !== "" ? {
                        c: getPlaceholder(position, test, true) || test.def,
                        pos: position
                    } : false;
                    if (rslt !== false) {
                        var elem = rslt.c !== undefined ? rslt.c : c, validatedPos = position;
                        elem = elem === opts.skipOptionalPartCharacter && test.fn === null ? getPlaceholder(position, test, true) || test.def : elem;
                        if (rslt.remove !== undefined) {
                            if (!$.isArray(rslt.remove)) rslt.remove = [ rslt.remove ];
                            $.each(rslt.remove.sort(function(a, b) {
                                return b - a;
                            }), function(ndx, lmnt) {
                                revalidateMask({
                                    begin: lmnt,
                                    end: lmnt + 1
                                });
                            });
                        }
                        if (rslt.insert !== undefined) {
                            if (!$.isArray(rslt.insert)) rslt.insert = [ rslt.insert ];
                            $.each(rslt.insert.sort(function(a, b) {
                                return a - b;
                            }), function(ndx, lmnt) {
                                isValid(lmnt.pos, lmnt.c, true, fromSetValid);
                            });
                        }
                        if (rslt !== true && rslt.pos !== undefined && rslt.pos !== position) {
                            validatedPos = rslt.pos;
                        }
                        if (rslt !== true && rslt.pos === undefined && rslt.c === undefined) {
                            return false;
                        }
                        if (!revalidateMask(pos, $.extend({}, tst, {
                            input: casing(elem, test, validatedPos)
                        }), fromSetValid, validatedPos)) {
                            rslt = false;
                        }
                        return false;
                    }
                });
                return rslt;
            }
            var result = true, positionsClone = $.extend(true, {}, getMaskSet().validPositions);
            if ($.isFunction(opts.preValidation) && !strict && fromSetValid !== true && validateOnly !== true) {
                result = opts.preValidation(getBuffer(), maskPos, c, isSelection(pos), opts, getMaskSet());
            }
            if (result === true) {
                trackbackPositions(undefined, maskPos, true);
                if (maxLength === undefined || maskPos < maxLength) {
                    result = _isValid(maskPos, c, strict);
                    if ((!strict || fromSetValid === true) && result === false && validateOnly !== true) {
                        var currentPosValid = getMaskSet().validPositions[maskPos];
                        if (currentPosValid && currentPosValid.match.fn === null && (currentPosValid.match.def === c || c === opts.skipOptionalPartCharacter)) {
                            result = {
                                caret: seekNext(maskPos)
                            };
                        } else {
                            if ((opts.insertMode || getMaskSet().validPositions[seekNext(maskPos)] === undefined) && (!isMask(maskPos, true) || getMaskSet().jitOffset[maskPos])) {
                                if (getMaskSet().jitOffset[maskPos] && getMaskSet().validPositions[seekNext(maskPos)] === undefined) {
                                    result = isValid(maskPos + getMaskSet().jitOffset[maskPos], c, strict);
                                    if (result !== false) result.caret = maskPos;
                                } else for (var nPos = maskPos + 1, snPos = seekNext(maskPos); nPos <= snPos; nPos++) {
                                    result = _isValid(nPos, c, strict);
                                    if (result !== false) {
                                        result = trackbackPositions(maskPos, result.pos !== undefined ? result.pos : nPos) || result;
                                        maskPos = nPos;
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
                if (result === false && opts.keepStatic !== false && (opts.regex == null || isComplete(getBuffer())) && !strict && fromAlternate !== true) {
                    result = alternate(maskPos, c, strict, fromSetValid);
                }
                if (result === true) {
                    result = {
                        pos: maskPos
                    };
                }
            }
            if ($.isFunction(opts.postValidation) && result !== false && !strict && fromSetValid !== true && validateOnly !== true) {
                var postResult = opts.postValidation(getBuffer(true), pos.begin !== undefined ? isRTL ? pos.end : pos.begin : pos, result, opts, getMaskSet());
                if (postResult !== undefined) {
                    if (postResult.refreshFromBuffer && postResult.buffer) {
                        var refresh = postResult.refreshFromBuffer;
                        refreshFromBuffer(refresh === true ? refresh : refresh.start, refresh.end, postResult.buffer);
                    }
                    result = postResult === true ? result : postResult;
                }
            }
            if (result && result.pos === undefined) {
                result.pos = maskPos;
            }
            if (result === false || validateOnly === true) {
                resetMaskSet(true);
                getMaskSet().validPositions = $.extend(true, {}, positionsClone);
            }
            return result;
        }
        function trackbackPositions(originalPos, newPos, fillOnly) {
            var result;
            if (originalPos === undefined) {
                for (originalPos = newPos - 1; originalPos > 0; originalPos--) {
                    if (getMaskSet().validPositions[originalPos]) break;
                }
            }
            for (var ps = originalPos; ps < newPos; ps++) {
                if (getMaskSet().validPositions[ps] === undefined && !isMask(ps, true)) {
                    var vp = ps == 0 ? getTest(ps) : getMaskSet().validPositions[ps - 1];
                    if (vp) {
                        var tests = getTests(ps).slice();
                        if (tests[tests.length - 1].match.def === "") tests.pop();
                        var bestMatch = determineTestTemplate(ps, tests);
                        bestMatch = $.extend({}, bestMatch, {
                            input: getPlaceholder(ps, bestMatch.match, true) || bestMatch.match.def
                        });
                        bestMatch.generatedInput = true;
                        revalidateMask(ps, bestMatch, true);
                        if (fillOnly !== true) {
                            var cvpInput = getMaskSet().validPositions[newPos].input;
                            getMaskSet().validPositions[newPos] = undefined;
                            result = isValid(newPos, cvpInput, true, true);
                        }
                    }
                }
            }
            return result;
        }
        function revalidateMask(pos, validTest, fromSetValid, validatedPos) {
            function IsEnclosedStatic(pos, valids, selection) {
                var posMatch = valids[pos];
                if (posMatch !== undefined && (posMatch.match.fn === null && posMatch.match.optionality !== true || posMatch.input === opts.radixPoint)) {
                    var prevMatch = selection.begin <= pos - 1 ? valids[pos - 1] && valids[pos - 1].match.fn === null && valids[pos - 1] : valids[pos - 1], nextMatch = selection.end > pos + 1 ? valids[pos + 1] && valids[pos + 1].match.fn === null && valids[pos + 1] : valids[pos + 1];
                    return prevMatch && nextMatch;
                }
                return false;
            }
            var begin = pos.begin !== undefined ? pos.begin : pos, end = pos.end !== undefined ? pos.end : pos;
            if (pos.begin > pos.end) {
                begin = pos.end;
                end = pos.begin;
            }
            validatedPos = validatedPos !== undefined ? validatedPos : begin;
            if (begin !== end || opts.insertMode && getMaskSet().validPositions[validatedPos] !== undefined && fromSetValid === undefined) {
                var positionsClone = $.extend(true, {}, getMaskSet().validPositions), lvp = getLastValidPosition(undefined, true), i;
                getMaskSet().p = begin;
                for (i = lvp; i >= begin; i--) {
                    if (getMaskSet().validPositions[i] && getMaskSet().validPositions[i].match.nativeDef === "+") {
                        opts.isNegative = false;
                    }
                    delete getMaskSet().validPositions[i];
                }
                var valid = true, j = validatedPos, vps = getMaskSet().validPositions, needsValidation = false, posMatch = j, i = j;
                if (validTest) {
                    getMaskSet().validPositions[validatedPos] = $.extend(true, {}, validTest);
                    posMatch++;
                    j++;
                    if (begin < end) i++;
                }
                for (;i <= lvp; i++) {
                    var t = positionsClone[i];
                    if (t !== undefined && (i >= end || i >= begin && t.generatedInput !== true && IsEnclosedStatic(i, positionsClone, {
                        begin: begin,
                        end: end
                    }))) {
                        while (getTest(posMatch).match.def !== "") {
                            if (needsValidation === false && positionsClone[posMatch] && positionsClone[posMatch].match.nativeDef === t.match.nativeDef) {
                                getMaskSet().validPositions[posMatch] = $.extend(true, {}, positionsClone[posMatch]);
                                getMaskSet().validPositions[posMatch].input = t.input;
                                trackbackPositions(undefined, posMatch, true);
                                j = posMatch + 1;
                                valid = true;
                            } else if (opts.shiftPositions && positionCanMatchDefinition(posMatch, t.match.def)) {
                                var result = isValid(posMatch, t.input, true, true);
                                valid = result !== false;
                                j = result.caret || result.insert ? getLastValidPosition() : posMatch + 1;
                                needsValidation = true;
                            } else {
                                valid = t.generatedInput === true || t.input === opts.radixPoint && opts.numericInput === true;
                            }
                            if (valid) break;
                            if (!valid && posMatch > end && isMask(posMatch, true) && (t.match.fn !== null || posMatch > getMaskSet().maskLength)) {
                                break;
                            }
                            posMatch++;
                        }
                        if (getTest(posMatch).match.def == "") valid = false;
                        posMatch = j;
                    }
                    if (!valid) break;
                }
                if (!valid) {
                    getMaskSet().validPositions = $.extend(true, {}, positionsClone);
                    resetMaskSet(true);
                    return false;
                }
            } else if (validTest) {
                getMaskSet().validPositions[validatedPos] = $.extend(true, {}, validTest);
            }
            resetMaskSet(true);
            return true;
        }
        function isMask(pos, strict) {
            var test = getTestTemplate(pos).match;
            if (test.def === "") test = getTest(pos).match;
            if (test.fn != null) {
                return test.fn;
            }
            if (strict !== true && pos > -1) {
                var tests = getTests(pos);
                return tests.length > 1 + (tests[tests.length - 1].match.def === "" ? 1 : 0);
            }
            return false;
        }
        function seekNext(pos, newBlock) {
            var position = pos + 1;
            while (getTest(position).match.def !== "" && (newBlock === true && (getTest(position).match.newBlockMarker !== true || !isMask(position)) || newBlock !== true && !isMask(position))) {
                position++;
            }
            return position;
        }
        function seekPrevious(pos, newBlock) {
            var position = pos, tests;
            if (position <= 0) return 0;
            while (--position > 0 && (newBlock === true && getTest(position).match.newBlockMarker !== true || newBlock !== true && !isMask(position) && (tests = getTests(position),
            tests.length < 2 || tests.length === 2 && tests[1].match.def === ""))) {}
            return position;
        }
        function writeBuffer(input, buffer, caretPos, event, triggerEvents) {
            if (event && $.isFunction(opts.onBeforeWrite)) {
                var result = opts.onBeforeWrite.call(inputmask, event, buffer, caretPos, opts);
                if (result) {
                    if (result.refreshFromBuffer) {
                        var refresh = result.refreshFromBuffer;
                        refreshFromBuffer(refresh === true ? refresh : refresh.start, refresh.end, result.buffer || buffer);
                        buffer = getBuffer(true);
                    }
                    if (caretPos !== undefined) caretPos = result.caret !== undefined ? result.caret : caretPos;
                }
            }
            if (input !== undefined) {
                input.inputmask._valueSet(buffer.join(""));
                if (caretPos !== undefined && (event === undefined || event.type !== "blur")) {
                    caret(input, caretPos);
                } else renderColorMask(input, caretPos, buffer.length === 0);
                if (triggerEvents === true) {
                    var $input = $(input), nptVal = input.inputmask._valueGet();
                    skipInputEvent = true;
                    $input.trigger("input");
                    setTimeout(function() {
                        if (nptVal === getBufferTemplate().join("")) {
                            $input.trigger("cleared");
                        } else if (isComplete(buffer) === true) {
                            $input.trigger("complete");
                        }
                    }, 0);
                }
            }
        }
        function getPlaceholder(pos, test, returnPL) {
            test = test || getTest(pos).match;
            if (test.placeholder !== undefined || returnPL === true) {
                return $.isFunction(test.placeholder) ? test.placeholder(opts) : test.placeholder;
            } else if (test.fn === null) {
                if (pos > -1 && getMaskSet().validPositions[pos] === undefined) {
                    var tests = getTests(pos), staticAlternations = [], prevTest;
                    if (tests.length > 1 + (tests[tests.length - 1].match.def === "" ? 1 : 0)) {
                        for (var i = 0; i < tests.length; i++) {
                            if (tests[i].match.optionality !== true && tests[i].match.optionalQuantifier !== true && (tests[i].match.fn === null || (prevTest === undefined || tests[i].match.fn.test(prevTest.match.def, getMaskSet(), pos, true, opts) !== false))) {
                                staticAlternations.push(tests[i]);
                                if (tests[i].match.fn === null) prevTest = tests[i];
                                if (staticAlternations.length > 1) {
                                    if (/[0-9a-bA-Z]/.test(staticAlternations[0].match.def)) {
                                        return opts.placeholder.charAt(pos % opts.placeholder.length);
                                    }
                                }
                            }
                        }
                    }
                }
                return test.def;
            }
            return opts.placeholder.charAt(pos % opts.placeholder.length);
        }
        function HandleNativePlaceholder(npt, value) {
            if (ie) {
                if (npt.inputmask._valueGet() !== value) {
                    var buffer = getBuffer().slice(), nptValue = npt.inputmask._valueGet();
                    if (nptValue !== value) {
                        var lvp = getLastValidPosition();
                        if (lvp === -1 && nptValue === getBufferTemplate().join("")) {
                            buffer = [];
                        } else if (lvp !== -1) {
                            clearOptionalTail(buffer);
                        }
                        writeBuffer(npt, buffer);
                    }
                }
            } else if (npt.placeholder !== value) {
                npt.placeholder = value;
                if (npt.placeholder === "") npt.removeAttribute("placeholder");
            }
        }
        var EventRuler = {
            on: function(input, eventName, eventHandler) {
                var ev = function(e) {
                    var that = this;
                    if (that.inputmask === undefined && this.nodeName !== "FORM") {
                        var imOpts = $.data(that, "_inputmask_opts");
                        if (imOpts) new Inputmask(imOpts).mask(that); else EventRuler.off(that);
                    } else if (e.type !== "setvalue" && this.nodeName !== "FORM" && (that.disabled || that.readOnly && !(e.type === "keydown" && (e.ctrlKey && e.keyCode === 67) || opts.tabThrough === false && e.keyCode === Inputmask.keyCode.TAB))) {
                        e.preventDefault();
                    } else {
                        switch (e.type) {
                          case "input":
                            if (skipInputEvent === true) {
                                skipInputEvent = false;
                                return e.preventDefault();
                            }
                            if (mobile) {
                                var args = arguments;
                                setTimeout(function() {
                                    eventHandler.apply(that, args);
                                    caret(that, that.inputmask.caretPos, undefined, true);
                                }, 0);
                                return false;
                            }
                            break;

                          case "keydown":
                            skipKeyPressEvent = false;
                            skipInputEvent = false;
                            break;

                          case "keypress":
                            if (skipKeyPressEvent === true) {
                                return e.preventDefault();
                            }
                            skipKeyPressEvent = true;
                            break;

                          case "click":
                            if (iemobile || iphone) {
                                var args = arguments;
                                setTimeout(function() {
                                    eventHandler.apply(that, args);
                                }, 0);
                                return false;
                            }
                            break;
                        }
                        var returnVal = eventHandler.apply(that, arguments);
                        if (returnVal === false) {
                            e.preventDefault();
                            e.stopPropagation();
                        }
                        return returnVal;
                    }
                };
                input.inputmask.events[eventName] = input.inputmask.events[eventName] || [];
                input.inputmask.events[eventName].push(ev);
                if ($.inArray(eventName, [ "submit", "reset" ]) !== -1) {
                    if (input.form !== null) $(input.form).on(eventName, ev);
                } else {
                    $(input).on(eventName, ev);
                }
            },
            off: function(input, event) {
                if (input.inputmask && input.inputmask.events) {
                    var events;
                    if (event) {
                        events = [];
                        events[event] = input.inputmask.events[event];
                    } else {
                        events = input.inputmask.events;
                    }
                    $.each(events, function(eventName, evArr) {
                        while (evArr.length > 0) {
                            var ev = evArr.pop();
                            if ($.inArray(eventName, [ "submit", "reset" ]) !== -1) {
                                if (input.form !== null) $(input.form).off(eventName, ev);
                            } else {
                                $(input).off(eventName, ev);
                            }
                        }
                        delete input.inputmask.events[eventName];
                    });
                }
            }
        };
        var EventHandlers = {
            keydownEvent: function(e) {
                var input = this, $input = $(input), k = e.keyCode, pos = caret(input);
                const originalPos = {begin: input.selectionStart, end: input.selectionEnd};
                const initial = input.value;
                if (k === Inputmask.keyCode.BACKSPACE || k === Inputmask.keyCode.DELETE || iphone && k === Inputmask.keyCode.BACKSPACE_SAFARI || (e.ctrlKey || e.metaKey) && k === Inputmask.keyCode.X && !isInputEventSupported("cut")) {
                    e.preventDefault();

                    // Handle META/CTRL+DELETE clear keyboard shortcut
                    if (e.metaKey || e.ctrlKey) {
                        pos.begin = 0;
                    }

                    handleRemove(input, k, pos);

                    // Handle SelectAll then Delete
                    if (pos.end - pos.begin == input.value.length) {
                        resetMaskSet(false);
                    }

                    writeBuffer(input, getBuffer(true), getMaskSet().p, e, input.inputmask._valueGet() !== getBuffer().join(""));
                } else if (k === Inputmask.keyCode.END || k === Inputmask.keyCode.PAGE_DOWN) {
                    e.preventDefault();
                    var caretPos = seekNext(getLastValidPosition());
                    caret(input, e.shiftKey ? pos.begin : caretPos, caretPos, true);
                } else if (k === Inputmask.keyCode.HOME && !e.shiftKey || k === Inputmask.keyCode.PAGE_UP) {
                    e.preventDefault();
                    caret(input, 0, e.shiftKey ? pos.begin : 0, true);
                } else if ((opts.undoOnEscape && k === Inputmask.keyCode.ESCAPE || k === 90 && e.ctrlKey) && e.altKey !== true) {
                    checkVal(input, true, false, undoValue.split(""));
                    $input.trigger("click");
                } else if (k === Inputmask.keyCode.INSERT && !(e.shiftKey || e.ctrlKey)) {
                    opts.insertMode = !opts.insertMode;
                    input.setAttribute("im-insert", opts.insertMode);
                } else if (opts.tabThrough === true && k === Inputmask.keyCode.TAB) {
                    if (e.shiftKey === true) {
                        if (getTest(pos.begin).match.fn === null) {
                            pos.begin = seekNext(pos.begin);
                        }
                        pos.end = seekPrevious(pos.begin, true);
                        pos.begin = seekPrevious(pos.end, true);
                    } else {
                        pos.begin = seekNext(pos.begin, true);
                        pos.end = seekNext(pos.begin, true);
                        if (pos.end < getMaskSet().maskLength) pos.end--;
                    }
                    if (pos.begin < getMaskSet().maskLength) {
                        e.preventDefault();
                        caret(input, pos.begin, pos.end);
                    }
                }
                opts.onKeyDown.call(this, e, getBuffer(), caret(input).begin, opts, initial, originalPos);
                ignorable = $.inArray(k, opts.ignorables) !== -1;
            },
            keypressEvent: function(e, checkval, writeOut, strict, ndx) {
                var input = this, $input = $(input), k = e.which || e.charCode || e.keyCode;
                if (checkval !== true && (!(e.ctrlKey && e.altKey) && (e.ctrlKey || e.metaKey || ignorable))) {
                    if (k === Inputmask.keyCode.ENTER && undoValue !== getBuffer().join("")) {
                        undoValue = getBuffer().join("");
                        setTimeout(function() {
                            $input.trigger("change");
                        }, 0);
                    }
                    return true;
                } else {
                    if (k) {
                        if (k === 46 && e.shiftKey === false && opts.radixPoint !== "") k = opts.radixPoint.charCodeAt(0);
                        var pos = checkval ? {
                            begin: ndx,
                            end: ndx
                        } : caret(input), forwardPosition, c = String.fromCharCode(k), offset = 0;
                        if (opts._radixDance && opts.numericInput) {
                            var caretPos = getBuffer().indexOf(opts.radixPoint.charAt(0)) + 1;
                            if (pos.begin <= caretPos) {
                                if (k === opts.radixPoint.charCodeAt(0)) offset = 1;
                                pos.begin -= 1;
                                pos.end -= 1;
                            }
                        }
                        getMaskSet().writeOutBuffer = true;
                        var valResult = isValid(pos, c, strict);
                        if (valResult !== false) {
                            resetMaskSet(true);
                            forwardPosition = valResult.caret !== undefined ? valResult.caret : seekNext(valResult.pos.begin ? valResult.pos.begin : valResult.pos);
                            getMaskSet().p = forwardPosition;
                        }
                        forwardPosition = (opts.numericInput && valResult.caret === undefined ? seekPrevious(forwardPosition) : forwardPosition) + offset;
                        if (writeOut !== false) {
                            setTimeout(function() {
                                opts.onKeyValidation.call(input, k, valResult, opts);
                            }, 0);
                            if (getMaskSet().writeOutBuffer && valResult !== false) {
                                var buffer = getBuffer();
                                writeBuffer(input, buffer, forwardPosition, e, checkval !== true);
                            }
                        }
                        e.preventDefault();
                        if (checkval) {
                            if (valResult !== false) valResult.forwardPosition = forwardPosition;
                            return valResult;
                        }
                    }
                }
            },
            pasteEvent: function(e) {
                var input = this, ev = e.originalEvent || e, $input = $(input), inputValue = input.inputmask._valueGet(true), caretPos = caret(input), tempValue;
                if (isRTL) {
                    tempValue = caretPos.end;
                    caretPos.end = caretPos.begin;
                    caretPos.begin = tempValue;
                }
                var valueBeforeCaret = inputValue.substr(0, caretPos.begin), valueAfterCaret = inputValue.substr(caretPos.end, inputValue.length);
                if (valueBeforeCaret === (isRTL ? getBufferTemplate().reverse() : getBufferTemplate()).slice(0, caretPos.begin).join("")) valueBeforeCaret = "";
                if (valueAfterCaret === (isRTL ? getBufferTemplate().reverse() : getBufferTemplate()).slice(caretPos.end).join("")) valueAfterCaret = "";
                if (window.clipboardData && window.clipboardData.getData) {
                    inputValue = valueBeforeCaret + window.clipboardData.getData("Text") + valueAfterCaret;
                } else if (ev.clipboardData && ev.clipboardData.getData) {
                    inputValue = valueBeforeCaret + ev.clipboardData.getData("text/plain") + valueAfterCaret;
                } else return true;
                var pasteValue = inputValue;
                if ($.isFunction(opts.onBeforePaste)) {
                    pasteValue = opts.onBeforePaste.call(inputmask, inputValue, opts);
                    if (pasteValue === false) {
                        return e.preventDefault();
                    }
                    if (!pasteValue) {
                        pasteValue = inputValue;
                    }
                }
                checkVal(input, false, false, pasteValue.toString().split(""));
                // Use settimeout to make Safari paste work
                setTimeout(() => {
                    writeBuffer(input, getBuffer(), seekNext(getLastValidPosition()), e, undoValue !== getBuffer().join(""));
                }, 0);
                return e.preventDefault();
            },
            inputFallBackEvent: function(e) {
                function radixPointHandler(input, inputValue, caretPos) {
                    if (inputValue.charAt(caretPos.begin - 1) === "." && opts.radixPoint !== "") {
                        inputValue = inputValue.split("");
                        inputValue[caretPos.begin - 1] = opts.radixPoint.charAt(0);
                        inputValue = inputValue.join("");
                    }
                    return inputValue;
                }
                function ieMobileHandler(input, inputValue, caretPos) {
                    if (iemobile) {
                        var inputChar = inputValue.replace(getBuffer().join(""), "");
                        if (inputChar.length === 1) {
                            var iv = inputValue.split("");
                            iv.splice(caretPos.begin, 0, inputChar);
                            inputValue = iv.join("");
                        }
                    }
                    return inputValue;
                }
                var input = this, inputValue = input.inputmask._valueGet();
                if (getBuffer().join("") !== inputValue) {
                    var caretPos = caret(input);
                    inputValue = radixPointHandler(input, inputValue, caretPos);
                    inputValue = ieMobileHandler(input, inputValue, caretPos);
                    if (getBuffer().join("") !== inputValue) {
                        var buffer = getBuffer().join(""), offset = !opts.numericInput && inputValue.length > buffer.length ? -1 : 0, frontPart = inputValue.substr(0, caretPos.begin), backPart = inputValue.substr(caretPos.begin), frontBufferPart = buffer.substr(0, caretPos.begin + offset), backBufferPart = buffer.substr(caretPos.begin + offset);
                        var selection = caretPos, entries = "", isEntry = false;
                        if (frontPart !== frontBufferPart) {
                            var fpl = (isEntry = frontPart.length >= frontBufferPart.length) ? frontPart.length : frontBufferPart.length, i;
                            for (i = 0; frontPart.charAt(i) === frontBufferPart.charAt(i) && i < fpl; i++) ;
                            if (isEntry) {
                                selection.begin = i - offset;
                                entries += frontPart.slice(i, selection.end);
                            }
                        }
                        if (backPart !== backBufferPart) {
                            if (backPart.length > backBufferPart.length) {
                                entries += backPart.slice(0, 1);
                            } else {
                                if (backPart.length < backBufferPart.length) {
                                    selection.end += backBufferPart.length - backPart.length;
                                    if (!isEntry && opts.radixPoint !== "" && backPart === "" && frontPart.charAt(selection.begin + offset - 1) === opts.radixPoint) {
                                        selection.begin--;
                                        entries = opts.radixPoint;
                                    }
                                }
                            }
                        }
                        writeBuffer(input, getBuffer(), {
                            begin: selection.begin + offset,
                            end: selection.end + offset
                        });
                        if (entries.length > 0) {
                            $.each(entries.split(""), function(ndx, entry) {
                                var keypress = new $.Event("keypress");
                                keypress.which = entry.charCodeAt(0);
                                ignorable = false;
                                EventHandlers.keypressEvent.call(input, keypress);
                            });
                        } else {
                            if (selection.begin === selection.end - 1) {
                                selection.begin = seekPrevious(selection.begin + 1);
                                if (selection.begin === selection.end - 1) {
                                    caret(input, selection.begin);
                                } else {
                                    caret(input, selection.begin, selection.end);
                                }
                            }
                            var keydown = new $.Event("keydown");
                            keydown.keyCode = opts.numericInput ? Inputmask.keyCode.BACKSPACE : Inputmask.keyCode.DELETE;
                            EventHandlers.keydownEvent.call(input, keydown);
                        }
                        e.preventDefault();
                    }
                }
            },
            beforeInputEvent: function(e) {
                if (e.cancelable) {
                    var input = this;
                    switch (e.inputType) {
                      case "insertText":
                        $.each(e.data.split(""), function(ndx, entry) {
                            var keypress = new $.Event("keypress");
                            keypress.which = entry.charCodeAt(0);
                            ignorable = false;
                            EventHandlers.keypressEvent.call(input, keypress);
                        });
                        return e.preventDefault();

                      case "deleteContentBackward":
                        var keydown = new $.Event("keydown");
                        keydown.keyCode = Inputmask.keyCode.BACKSPACE;
                        EventHandlers.keydownEvent.call(input, keydown);
                        return e.preventDefault();

                      case "deleteContentForward":
                        var keydown = new $.Event("keydown");
                        keydown.keyCode = Inputmask.keyCode.DELETE;
                        EventHandlers.keydownEvent.call(input, keydown);
                        return e.preventDefault();
                    }
                }
            },
            setValueEvent: function(e) {
                this.inputmask.refreshValue = false;
                var input = this, value = e && e.detail ? e.detail[0] : arguments[1], value = value || input.inputmask._valueGet(true);
                if ($.isFunction(opts.onBeforeMask)) value = opts.onBeforeMask.call(inputmask, value, opts) || value;
                value = value.split("");
                checkVal(input, true, false, value);
                undoValue = getBuffer().join("");
                if ((opts.clearMaskOnLostFocus || opts.clearIncomplete) && input.inputmask._valueGet() === getBufferTemplate().join("")) {
                    input.inputmask._valueSet("");
                }
            },
            focusEvent: function(e) {
                var input = this, nptValue = input.inputmask._valueGet();
                if (opts.showMaskOnFocus) {
                    if (nptValue !== getBuffer().join("")) {
                        writeBuffer(input, getBuffer(), seekNext(getLastValidPosition()));
                    } else if (mouseEnter === false) {
                        caret(input, seekNext(getLastValidPosition()));
                    }
                }
                if (opts.positionCaretOnTab === true && mouseEnter === false) {
                    EventHandlers.clickEvent.apply(input, [ e, true ]);
                }
                undoValue = getBuffer().join("");
            },
            mouseleaveEvent: function(e) {
                var input = this;
                mouseEnter = false;
                if (opts.clearMaskOnLostFocus && document.activeElement !== input) {
                    HandleNativePlaceholder(input, originalPlaceholder);
                }
            },
            clickEvent: function(e, tabbed) {
                function doRadixFocus(clickPos) {
                    if (opts.radixPoint !== "") {
                        var vps = getMaskSet().validPositions;
                        if (vps[clickPos] === undefined || vps[clickPos].input === getPlaceholder(clickPos)) {
                            if (clickPos < seekNext(-1)) return true;
                            var radixPos = $.inArray(opts.radixPoint, getBuffer());
                            if (radixPos !== -1) {
                                for (var vp in vps) {
                                    if (radixPos < vp && vps[vp].input !== getPlaceholder(vp)) {
                                        return false;
                                    }
                                }
                                return true;
                            }
                        }
                    }
                    return false;
                }
                var input = this;
                setTimeout(function() {
                    if (document.activeElement === input) {
                        var selectedCaret = caret(input);
                        if (tabbed) {
                            if (isRTL) {
                                selectedCaret.end = selectedCaret.begin;
                            } else {
                                selectedCaret.begin = selectedCaret.end;
                            }
                        }
                        if (selectedCaret.begin === selectedCaret.end) {
                            switch (opts.positionCaretOnClick) {
                              case "none":
                                break;

                              case "select":
                                caret(input, 0, getBuffer().length);
                                break;

                              case "ignore":
                                caret(input, seekNext(getLastValidPosition()));
                                break;

                              case "radixFocus":
                                if (doRadixFocus(selectedCaret.begin)) {
                                    var radixPos = getBuffer().join("").indexOf(opts.radixPoint);
                                    caret(input, opts.numericInput ? seekNext(radixPos) : radixPos);
                                    break;
                                }

                              default:
                                var clickPosition = selectedCaret.begin, lvclickPosition = getLastValidPosition(clickPosition, true), lastPosition = seekNext(lvclickPosition);
                                if (clickPosition < lastPosition) {
                                    caret(input, !isMask(clickPosition, true) && !isMask(clickPosition - 1, true) ? seekNext(clickPosition) : clickPosition);
                                } else {
                                    var lvp = getMaskSet().validPositions[lvclickPosition], tt = getTestTemplate(lastPosition, lvp ? lvp.match.locator : undefined, lvp), placeholder = getPlaceholder(lastPosition, tt.match);
                                    if (placeholder !== "" && getBuffer()[lastPosition] !== placeholder && tt.match.optionalQuantifier !== true && tt.match.newBlockMarker !== true || !isMask(lastPosition, opts.keepStatic) && tt.match.def === placeholder) {
                                        var newPos = seekNext(lastPosition);
                                        if (clickPosition >= newPos || clickPosition === lastPosition) {
                                            lastPosition = newPos;
                                        }
                                    }
                                    caret(input, lastPosition);
                                }
                                break;
                            }
                        }
                    }
                }, 0);
            },
            cutEvent: function(e) {
                var input = this, $input = $(input), pos = caret(input), ev = e.originalEvent || e;
                var clipboardData = window.clipboardData || ev.clipboardData, clipData = isRTL ? getBuffer().slice(pos.end, pos.begin) : getBuffer().slice(pos.begin, pos.end);
                clipboardData.setData("text", isRTL ? clipData.reverse().join("") : clipData.join(""));
                if (document.execCommand) document.execCommand("copy");

                // Handle META/CTRL+DELETE clear keyboard shortcut
                if (e.metaKey || e.ctrlKey) {
                    pos.begin = 0;
                }

                handleRemove(input, Inputmask.keyCode.DELETE, pos);

                // Handle SelectAll then Delete
                if (pos.end - pos.begin == input.value.length) {
                    resetMaskSet(false);
                }

                writeBuffer(input, getBuffer(), getMaskSet().p, e, undoValue !== getBuffer().join(""));
            },
            blurEvent: function(e) {
                var $input = $(this), input = this;
                if (input.inputmask) {
                    HandleNativePlaceholder(input, originalPlaceholder);
                    var nptValue = input.inputmask._valueGet(), buffer = getBuffer().slice();
                    if (nptValue !== "" || colorMask !== undefined) {
                        if (opts.clearMaskOnLostFocus) {
                            if (getLastValidPosition() === -1 && nptValue === getBufferTemplate().join("")) {
                                buffer = [];
                            } else {
                                clearOptionalTail(buffer);
                            }
                        }
                        if (isComplete(buffer) === false) {
                            setTimeout(function() {
                                $input.trigger("incomplete");
                            }, 0);
                            if (opts.clearIncomplete) {
                                resetMaskSet();
                                if (opts.clearMaskOnLostFocus) {
                                    buffer = [];
                                } else {
                                    buffer = getBufferTemplate().slice();
                                }
                            }
                        }
                        writeBuffer(input, buffer, undefined, e);
                    }
                    if (undoValue !== getBuffer().join("")) {
                        undoValue = buffer.join("");
                        $input.trigger("change");
                    }
                }
            },
            mouseenterEvent: function(e) {
                var input = this;
                mouseEnter = true;
                if (document.activeElement !== input && opts.showMaskOnHover) {
                    HandleNativePlaceholder(input, (isRTL ? getBuffer().slice().reverse() : getBuffer()).join(""));
                }
            },
            submitEvent: function(e) {
                if (undoValue !== getBuffer().join("")) {
                    $el.trigger("change");
                }
                if (opts.clearMaskOnLostFocus && getLastValidPosition() === -1 && el.inputmask._valueGet && el.inputmask._valueGet() === getBufferTemplate().join("")) {
                    el.inputmask._valueSet("");
                }
                if (opts.clearIncomplete && isComplete(getBuffer()) === false) {
                    el.inputmask._valueSet("");
                }
                if (opts.removeMaskOnSubmit) {
                    el.inputmask._valueSet(el.inputmask.unmaskedvalue(), true);
                    setTimeout(function() {
                        writeBuffer(el, getBuffer());
                    }, 0);
                }
            },
            resetEvent: function(e) {
                el.inputmask.refreshValue = true;
                setTimeout(function() {
                    $el.trigger("setvalue");
                }, 0);
            }
        };
        function checkVal(input, writeOut, strict, nptvl, initiatingEvent) {
            var inputmask = this || input.inputmask, inputValue = nptvl.slice(), charCodes = "", initialNdx = -1, result = undefined;
            function isTemplateMatch(ndx, charCodes) {
                var charCodeNdx = getMaskTemplate(true, 0, false).slice(ndx, seekNext(ndx)).join("").replace(/'/g, "").indexOf(charCodes);
                return charCodeNdx !== -1 && !isMask(ndx) && (getTest(ndx).match.nativeDef === charCodes.charAt(0) || getTest(ndx).match.fn === null && getTest(ndx).match.nativeDef === "'" + charCodes.charAt(0) || getTest(ndx).match.nativeDef === " " && (getTest(ndx + 1).match.nativeDef === charCodes.charAt(0) || getTest(ndx + 1).match.fn === null && getTest(ndx + 1).match.nativeDef === "'" + charCodes.charAt(0)));
            }
            resetMaskSet();
            if (!strict && opts.autoUnmask !== true) {
                var staticInput = getBufferTemplate().slice(0, seekNext(-1)).join(""), matches = inputValue.join("").match(new RegExp("^" + Inputmask.escapeRegex(staticInput), "g"));
                if (matches && matches.length > 0) {
                    inputValue.splice(0, matches.length * staticInput.length);
                    initialNdx = seekNext(initialNdx);
                }
            } else {
                initialNdx = seekNext(initialNdx);
            }
            if (initialNdx === -1) {
                getMaskSet().p = seekNext(initialNdx);
                initialNdx = 0;
            } else getMaskSet().p = initialNdx;
            inputmask.caretPos = {
                begin: initialNdx
            };
            $.each(inputValue, function(ndx, charCode) {
                if (charCode !== undefined) {
                    if (getMaskSet().validPositions[ndx] === undefined && inputValue[ndx] === getPlaceholder(ndx) && isMask(ndx, true) && isValid(ndx, inputValue[ndx], true, undefined, undefined, true) === false) {
                        getMaskSet().p++;
                    } else {
                        var keypress = new $.Event("_checkval");
                        keypress.which = charCode.charCodeAt(0);
                        charCodes += charCode;
                        var lvp = getLastValidPosition(undefined, true);
                        if (!isTemplateMatch(initialNdx, charCodes)) {
                            result = EventHandlers.keypressEvent.call(input, keypress, true, false, strict, inputmask.caretPos.begin);
                            if (result) {
                                initialNdx = inputmask.caretPos.begin + 1;
                                charCodes = "";
                            }
                        } else {
                            result = EventHandlers.keypressEvent.call(input, keypress, true, false, strict, lvp + 1);
                        }
                        if (result) {
                            writeBuffer(undefined, getBuffer(), result.forwardPosition, keypress, false);
                            inputmask.caretPos = {
                                begin: result.forwardPosition,
                                end: result.forwardPosition
                            };
                        }
                    }
                }
            });
            if (writeOut) writeBuffer(input, getBuffer(), result ? result.forwardPosition : undefined, initiatingEvent || new $.Event("checkval"), initiatingEvent && initiatingEvent.type === "input");
        }
        function unmaskedvalue(input) {
            if (input) {
                if (input.inputmask === undefined) {
                    return input.value;
                }
                if (input.inputmask && input.inputmask.refreshValue) {
                    EventHandlers.setValueEvent.call(input);
                }
            }
            var umValue = [], vps = getMaskSet().validPositions;
            for (var pndx in vps) {
                if (vps[pndx].match && vps[pndx].match.fn != null) {
                    umValue.push(vps[pndx].input);
                }
            }
            var unmaskedValue = umValue.length === 0 ? "" : (isRTL ? umValue.reverse() : umValue).join("");
            if ($.isFunction(opts.onUnMask)) {
                var bufferValue = (isRTL ? getBuffer().slice().reverse() : getBuffer()).join("");
                unmaskedValue = opts.onUnMask.call(inputmask, bufferValue, unmaskedValue, opts);
            }
            return unmaskedValue;
        }
        function caret(input, begin, end, notranslate) {
            function translatePosition(pos) {
                if (isRTL && typeof pos === "number" && (!opts.greedy || opts.placeholder !== "") && el) {
                    pos = el.inputmask._valueGet().length - pos;
                }
                return pos;
            }
            var range;
            if (begin !== undefined) {
                if ($.isArray(begin)) {
                    end = isRTL ? begin[0] : begin[1];
                    begin = isRTL ? begin[1] : begin[0];
                }
                if (begin.begin !== undefined) {
                    end = isRTL ? begin.begin : begin.end;
                    begin = isRTL ? begin.end : begin.begin;
                }
                if (typeof begin === "number") {
                    begin = notranslate ? begin : translatePosition(begin);
                    end = notranslate ? end : translatePosition(end);
                    end = typeof end == "number" ? end : begin;
                    var scrollCalc = parseInt(((input.ownerDocument.defaultView || window).getComputedStyle ? (input.ownerDocument.defaultView || window).getComputedStyle(input, null) : input.currentStyle).fontSize) * end;
                    input.scrollLeft = scrollCalc > input.scrollWidth ? scrollCalc : 0;
                    input.inputmask.caretPos = {
                        begin: begin,
                        end: end
                    };
                    if (input === document.activeElement) {
                        if ("selectionStart" in input) {
                            input.selectionStart = begin;
                            input.selectionEnd = end;
                        } else if (window.getSelection) {
                            range = document.createRange();
                            if (input.firstChild === undefined || input.firstChild === null) {
                                var textNode = document.createTextNode("");
                                input.appendChild(textNode);
                            }
                            range.setStart(input.firstChild, begin < input.inputmask._valueGet().length ? begin : input.inputmask._valueGet().length);
                            range.setEnd(input.firstChild, end < input.inputmask._valueGet().length ? end : input.inputmask._valueGet().length);
                            range.collapse(true);
                            var sel = window.getSelection();
                            sel.removeAllRanges();
                            sel.addRange(range);
                        } else if (input.createTextRange) {
                            range = input.createTextRange();
                            range.collapse(true);
                            range.moveEnd("character", end);
                            range.moveStart("character", begin);
                            range.select();
                        }
                        renderColorMask(input, {
                            begin: begin,
                            end: end
                        });
                    }
                }
            } else {
                if ("selectionStart" in input) {
                    begin = input.selectionStart;
                    end = input.selectionEnd;
                } else if (window.getSelection) {
                    range = window.getSelection().getRangeAt(0);
                    if (range.commonAncestorContainer.parentNode === input || range.commonAncestorContainer === input) {
                        begin = range.startOffset;
                        end = range.endOffset;
                    }
                } else if (document.selection && document.selection.createRange) {
                    range = document.selection.createRange();
                    begin = 0 - range.duplicate().moveStart("character", -input.inputmask._valueGet().length);
                    end = begin + range.text.length;
                }
                return {
                    begin: notranslate ? begin : translatePosition(begin),
                    end: notranslate ? end : translatePosition(end)
                };
            }
        }
        function determineLastRequiredPosition(returnDefinition) {
            var buffer = getMaskTemplate(true, getLastValidPosition(), true, true), bl = buffer.length, pos, lvp = getLastValidPosition(), positions = {}, lvTest = getMaskSet().validPositions[lvp], ndxIntlzr = lvTest !== undefined ? lvTest.locator.slice() : undefined, testPos;
            for (pos = lvp + 1; pos < buffer.length; pos++) {
                testPos = getTestTemplate(pos, ndxIntlzr, pos - 1);
                ndxIntlzr = testPos.locator.slice();
                positions[pos] = $.extend(true, {}, testPos);
            }
            var lvTestAlt = lvTest && lvTest.alternation !== undefined ? lvTest.locator[lvTest.alternation] : undefined;
            for (pos = bl - 1; pos > lvp; pos--) {
                testPos = positions[pos];
                if ((testPos.match.optionality || testPos.match.optionalQuantifier && testPos.match.newBlockMarker || lvTestAlt && (lvTestAlt !== positions[pos].locator[lvTest.alternation] && testPos.match.fn != null || testPos.match.fn === null && testPos.locator[lvTest.alternation] && checkAlternationMatch(testPos.locator[lvTest.alternation].toString().split(","), lvTestAlt.toString().split(",")) && getTests(pos)[0].def !== "")) && buffer[pos] === getPlaceholder(pos, testPos.match)) {
                    bl--;
                } else break;
            }
            return returnDefinition ? {
                l: bl,
                def: positions[bl] ? positions[bl].match : undefined
            } : bl;
        }
        function clearOptionalTail(buffer) {
            buffer.length = 0;
            var template = getMaskTemplate(true, 0, true, undefined, true), lmnt, validPos;
            while (lmnt = template.shift(), lmnt !== undefined) buffer.push(lmnt);
            return buffer;
        }
        function isComplete(buffer) {
            if ($.isFunction(opts.isComplete)) return opts.isComplete(buffer, opts);
            if (opts.repeat === "*") return undefined;
            var complete = false, lrp = determineLastRequiredPosition(true), aml = seekPrevious(lrp.l);
            if (lrp.def === undefined || lrp.def.newBlockMarker || lrp.def.optionality || lrp.def.optionalQuantifier) {
                complete = true;
                for (var i = 0; i <= aml; i++) {
                    var test = getTestTemplate(i).match;
                    if (test.fn !== null && getMaskSet().validPositions[i] === undefined && test.optionality !== true && test.optionalQuantifier !== true || test.fn === null && buffer[i] !== getPlaceholder(i, test)) {
                        complete = false;
                        break;
                    }
                }
            }
            return complete;
        }
        function handleRemove(input, k, pos, strict, fromIsValid) {
            if (opts.numericInput || isRTL) {
                if (k === Inputmask.keyCode.BACKSPACE) {
                    k = Inputmask.keyCode.DELETE;
                } else if (k === Inputmask.keyCode.DELETE) {
                    k = Inputmask.keyCode.BACKSPACE;
                }
                if (isRTL) {
                    var pend = pos.end;
                    pos.end = pos.begin;
                    pos.begin = pend;
                }
            }
            if (k === Inputmask.keyCode.BACKSPACE && pos.end - pos.begin < 1) {
                pos.begin = seekPrevious(pos.begin);
                if (getMaskSet().validPositions[pos.begin] !== undefined && getMaskSet().validPositions[pos.begin].input === opts.groupSeparator) {
                    pos.begin--;
                }
            } else if (k === Inputmask.keyCode.DELETE && pos.begin === pos.end) {
                pos.end = isMask(pos.end, true) && (getMaskSet().validPositions[pos.end] && getMaskSet().validPositions[pos.end].input !== opts.radixPoint) ? pos.end + 1 : seekNext(pos.end) + 1;
                if (getMaskSet().validPositions[pos.begin] !== undefined && getMaskSet().validPositions[pos.begin].input === opts.groupSeparator) {
                    pos.end++;
                }
            }
            revalidateMask(pos);
            if (strict !== true && opts.keepStatic !== false || opts.regex !== null) {
                var result = alternate(true);
                if (result) {
                    var newPos = result.caret !== undefined ? result.caret : result.pos ? seekNext(result.pos.begin ? result.pos.begin : result.pos) : getLastValidPosition(-1, true);
                    if (k !== Inputmask.keyCode.DELETE || pos.begin > newPos) {
                        pos.begin == newPos;
                    }
                }
            }
            var lvp = getLastValidPosition(pos.begin, true);
            if (lvp < pos.begin || pos.begin === -1) {
                getMaskSet().p = seekNext(lvp);
            } else if (strict !== true) {
                getMaskSet().p = pos.begin;
                if (fromIsValid !== true) {
                    while (getMaskSet().p < lvp && getMaskSet().validPositions[getMaskSet().p] === undefined) {
                        getMaskSet().p++;
                    }
                }
            }
        }
        function initializeColorMask(input) {
            var computedStyle = (input.ownerDocument.defaultView || window).getComputedStyle(input, null);
            function findCaretPos(clientx) {
                var e = document.createElement("span"), caretPos;
                for (var style in computedStyle) {
                    if (isNaN(style) && style.indexOf("font") !== -1) {
                        e.style[style] = computedStyle[style];
                    }
                }
                e.style.textTransform = computedStyle.textTransform;
                e.style.letterSpacing = computedStyle.letterSpacing;
                e.style.position = "absolute";
                e.style.height = "auto";
                e.style.width = "auto";
                e.style.visibility = "hidden";
                e.style.whiteSpace = "nowrap";
                document.body.appendChild(e);
                var inputText = input.inputmask._valueGet(), previousWidth = 0, itl;
                for (caretPos = 0, itl = inputText.length; caretPos <= itl; caretPos++) {
                    e.innerHTML += inputText.charAt(caretPos) || "_";
                    if (e.offsetWidth >= clientx) {
                        var offset1 = clientx - previousWidth;
                        var offset2 = e.offsetWidth - clientx;
                        e.innerHTML = inputText.charAt(caretPos);
                        offset1 -= e.offsetWidth / 3;
                        caretPos = offset1 < offset2 ? caretPos - 1 : caretPos;
                        break;
                    }
                    previousWidth = e.offsetWidth;
                }
                document.body.removeChild(e);
                return caretPos;
            }
            var template = document.createElement("div");
            template.style.width = computedStyle.width;
            template.style.textAlign = computedStyle.textAlign;
            colorMask = document.createElement("div");
            input.inputmask.colorMask = colorMask;
            colorMask.className = "im-colormask";
            input.parentNode.insertBefore(colorMask, input);
            input.parentNode.removeChild(input);
            colorMask.appendChild(input);
            colorMask.appendChild(template);
            input.style.left = template.offsetLeft + "px";
            $(colorMask).on("mouseleave", function(e) {
                return EventHandlers.mouseleaveEvent.call(input, [ e ]);
            });
            $(colorMask).on("mouseenter", function(e) {
                return EventHandlers.mouseenterEvent.call(input, [ e ]);
            });
            $(colorMask).on("click", function(e) {
                caret(input, findCaretPos(e.clientX));
                return EventHandlers.clickEvent.call(input, [ e ]);
            });
        }
        Inputmask.prototype.positionColorMask = function(input, template) {
            input.style.left = template.offsetLeft + "px";
        };
        function renderColorMask(input, caretPos, clear) {
            var maskTemplate = [], isStatic = false, test, testPos, ndxIntlzr, pos = 0;
            function setEntry(entry) {
                if (entry === undefined) entry = "";
                if (!isStatic && (test.fn === null || testPos.input === undefined)) {
                    isStatic = true;
                    maskTemplate.push("<span class='im-static'>" + entry);
                } else if (isStatic && (test.fn !== null && testPos.input !== undefined || test.def === "")) {
                    isStatic = false;
                    var mtl = maskTemplate.length;
                    maskTemplate[mtl - 1] = maskTemplate[mtl - 1] + "</span>";
                    maskTemplate.push(entry);
                } else maskTemplate.push(entry);
            }
            function setCaret() {
                if (document.activeElement === input) {
                    maskTemplate.splice(caretPos.begin, 0, caretPos.begin === caretPos.end || caretPos.end > getMaskSet().maskLength ? '<mark class="im-caret" style="border-right-width: 1px;border-right-style: solid;">' : '<mark class="im-caret-select">');
                    maskTemplate.splice(caretPos.end + 1, 0, "</mark>");
                }
            }
            if (colorMask !== undefined) {
                var buffer = getBuffer();
                if (caretPos === undefined) {
                    caretPos = caret(input);
                } else if (caretPos.begin === undefined) {
                    caretPos = {
                        begin: caretPos,
                        end: caretPos
                    };
                }
                if (clear !== true) {
                    var lvp = getLastValidPosition();
                    do {
                        if (getMaskSet().validPositions[pos]) {
                            testPos = getMaskSet().validPositions[pos];
                            test = testPos.match;
                            ndxIntlzr = testPos.locator.slice();
                            setEntry(buffer[pos]);
                        } else {
                            testPos = getTestTemplate(pos, ndxIntlzr, pos - 1);
                            test = testPos.match;
                            ndxIntlzr = testPos.locator.slice();
                            if (opts.jitMasking === false || pos < lvp || typeof opts.jitMasking === "number" && isFinite(opts.jitMasking) && opts.jitMasking > pos) {
                                setEntry(getPlaceholder(pos, test));
                            } else isStatic = false;
                        }
                        pos++;
                    } while ((maxLength === undefined || pos < maxLength) && (test.fn !== null || test.def !== "") || lvp > pos || isStatic);
                    if (isStatic) setEntry();
                    setCaret();
                }
                var template = colorMask.getElementsByTagName("div")[0];
                template.innerHTML = maskTemplate.join("");
                input.inputmask.positionColorMask(input, template);
            }
        }
        function mask(elem) {
            function isElementTypeSupported(input, opts) {
                function patchValueProperty(npt) {
                    var valueGet;
                    var valueSet;
                    function patchValhook(type) {
                        if ($.valHooks && ($.valHooks[type] === undefined || $.valHooks[type].inputmaskpatch !== true)) {
                            var valhookGet = $.valHooks[type] && $.valHooks[type].get ? $.valHooks[type].get : function(elem) {
                                return elem.value;
                            };
                            var valhookSet = $.valHooks[type] && $.valHooks[type].set ? $.valHooks[type].set : function(elem, value) {
                                elem.value = value;
                                return elem;
                            };
                            $.valHooks[type] = {
                                get: function(elem) {
                                    if (elem.inputmask) {
                                        if (elem.inputmask.opts.autoUnmask) {
                                            return elem.inputmask.unmaskedvalue();
                                        } else {
                                            var result = valhookGet(elem);
                                            return getLastValidPosition(undefined, undefined, elem.inputmask.maskset.validPositions) !== -1 || opts.nullable !== true ? result : "";
                                        }
                                    } else return valhookGet(elem);
                                },
                                set: function(elem, value) {
                                    var $elem = $(elem), result;
                                    result = valhookSet(elem, value);
                                    if (elem.inputmask) {
                                        $elem.trigger("setvalue", [ value ]);
                                    }
                                    return result;
                                },
                                inputmaskpatch: true
                            };
                        }
                    }
                    function getter() {
                        if (this.inputmask) {
                            return this.inputmask.opts.autoUnmask ? this.inputmask.unmaskedvalue() : getLastValidPosition() !== -1 || opts.nullable !== true ? document.activeElement === this && opts.clearMaskOnLostFocus ? (isRTL ? clearOptionalTail(getBuffer().slice()).reverse() : clearOptionalTail(getBuffer().slice())).join("") : valueGet.call(this) : "";
                        } else return valueGet.call(this);
                    }
                    function setter(value) {
                        valueSet.call(this, value);
                        if (this.inputmask) {
                            $(this).trigger("setvalue", [ value ]);
                        }
                    }
                    function installNativeValueSetFallback(npt) {
                        EventRuler.on(npt, "mouseenter", function(event) {
                            var $input = $(this), input = this, value = input.inputmask._valueGet();
                            if (!opts.showMaskOnHover) {
                                return;
                            }
                            if (value !== getBuffer().join("")) {
                                $input.trigger("setvalue");
                            }
                        });
                    }
                    if (!npt.inputmask.__valueGet) {
                        if (opts.noValuePatching !== true) {
                            if (Object.getOwnPropertyDescriptor) {
                                if (typeof Object.getPrototypeOf !== "function") {
                                    Object.getPrototypeOf = typeof "test".__proto__ === "object" ? function(object) {
                                        return object.__proto__;
                                    } : function(object) {
                                        return object.constructor.prototype;
                                    };
                                }
                                var valueProperty = Object.getPrototypeOf ? Object.getOwnPropertyDescriptor(Object.getPrototypeOf(npt), "value") : undefined;
                                if (valueProperty && valueProperty.get && valueProperty.set) {
                                    valueGet = valueProperty.get;
                                    valueSet = valueProperty.set;
                                    Object.defineProperty(npt, "value", {
                                        get: getter,
                                        set: setter,
                                        configurable: true
                                    });
                                } else if (npt.tagName !== "INPUT") {
                                    valueGet = function() {
                                        return this.textContent;
                                    };
                                    valueSet = function(value) {
                                        this.textContent = value;
                                    };
                                    Object.defineProperty(npt, "value", {
                                        get: getter,
                                        set: setter,
                                        configurable: true
                                    });
                                }
                            } else if (document.__lookupGetter__ && npt.__lookupGetter__("value")) {
                                valueGet = npt.__lookupGetter__("value");
                                valueSet = npt.__lookupSetter__("value");
                                npt.__defineGetter__("value", getter);
                                npt.__defineSetter__("value", setter);
                            }
                            npt.inputmask.__valueGet = valueGet;
                            npt.inputmask.__valueSet = valueSet;
                        }
                        npt.inputmask._valueGet = function(overruleRTL) {
                            return isRTL && overruleRTL !== true ? valueGet.call(this.el).split("").reverse().join("") : valueGet.call(this.el);
                        };
                        npt.inputmask._valueSet = function(value, overruleRTL) {
                            valueSet.call(this.el, value === null || value === undefined ? "" : overruleRTL !== true && isRTL ? value.split("").reverse().join("") : value);
                        };
                        if (valueGet === undefined) {
                            valueGet = function() {
                                return this.value;
                            };
                            valueSet = function(value) {
                                this.value = value;
                            };
                            patchValhook(npt.type);
                            installNativeValueSetFallback(npt);
                        }
                    }
                }
                var elementType = input.getAttribute("type");
                var isSupported = input.tagName === "INPUT" && $.inArray(elementType, opts.supportsInputType) !== -1 || input.isContentEditable || input.tagName === "TEXTAREA";
                if (!isSupported) {
                    if (input.tagName === "INPUT") {
                        var el = document.createElement("input");
                        el.setAttribute("type", elementType);
                        isSupported = el.type === "text";
                        el = null;
                    } else isSupported = "partial";
                }
                if (isSupported !== false) {
                    patchValueProperty(input);
                } else input.inputmask = undefined;
                return isSupported;
            }
            EventRuler.off(elem);
            var isSupported = isElementTypeSupported(elem, opts);
            if (isSupported !== false) {
                el = elem;
                $el = $(el);
                originalPlaceholder = el.placeholder;
                maxLength = el !== undefined ? el.maxLength : undefined;
                if (maxLength === -1) maxLength = undefined;
                if (opts.colorMask === true) {
                    initializeColorMask(el);
                }
                if (mobile) {
                    if ("inputmode" in el) {
                        el.inputmode = opts.inputmode;
                        el.setAttribute("inputmode", opts.inputmode);
                    }
                    if (opts.disablePredictiveText === true) {
                        if ("autocorrect" in el) {
                            el.autocorrect = false;
                        } else {
                            if (opts.colorMask !== true) {
                                initializeColorMask(el);
                            }
                            el.type = "password";
                        }
                    }
                }
                if (isSupported === true) {
                    el.setAttribute("im-insert", opts.insertMode);
                    EventRuler.on(el, "submit", EventHandlers.submitEvent);
                    EventRuler.on(el, "reset", EventHandlers.resetEvent);
                    EventRuler.on(el, "blur", EventHandlers.blurEvent);
                    EventRuler.on(el, "focus", EventHandlers.focusEvent);
                    if (opts.colorMask !== true) {
                        EventRuler.on(el, "click", EventHandlers.clickEvent);
                        EventRuler.on(el, "mouseleave", EventHandlers.mouseleaveEvent);
                        EventRuler.on(el, "mouseenter", EventHandlers.mouseenterEvent);
                    }
                    EventRuler.on(el, "paste", EventHandlers.pasteEvent);
                    EventRuler.on(el, "cut", EventHandlers.cutEvent);
                    EventRuler.on(el, "complete", opts.oncomplete);
                    EventRuler.on(el, "incomplete", opts.onincomplete);
                    EventRuler.on(el, "cleared", opts.oncleared);
                    if (!mobile && opts.inputEventOnly !== true) {
                        EventRuler.on(el, "keydown", EventHandlers.keydownEvent);
                        EventRuler.on(el, "keypress", EventHandlers.keypressEvent);
                    } else {
                        el.removeAttribute("maxLength");
                    }
                    EventRuler.on(el, "input", EventHandlers.inputFallBackEvent);
                    EventRuler.on(el, "beforeinput", EventHandlers.beforeInputEvent);
                }
                EventRuler.on(el, "setvalue", EventHandlers.setValueEvent);
                undoValue = getBufferTemplate().join("");
                if (el.inputmask._valueGet(true) !== "" || opts.clearMaskOnLostFocus === false || document.activeElement === el) {
                    var initialValue = $.isFunction(opts.onBeforeMask) ? opts.onBeforeMask.call(inputmask, el.inputmask._valueGet(true), opts) || el.inputmask._valueGet(true) : el.inputmask._valueGet(true);
                    if (initialValue !== "") checkVal(el, true, false, initialValue.split(""));
                    var buffer = getBuffer().slice();
                    undoValue = buffer.join("");
                    if (isComplete(buffer) === false) {
                        if (opts.clearIncomplete) {
                            resetMaskSet();
                        }
                    }
                    if (opts.clearMaskOnLostFocus && document.activeElement !== el) {
                        if (getLastValidPosition() === -1) {
                            buffer = [];
                        } else {
                            clearOptionalTail(buffer);
                        }
                    }
                    if (opts.clearMaskOnLostFocus === false || opts.showMaskOnFocus && document.activeElement === el || el.inputmask._valueGet(true) !== "") writeBuffer(el, buffer);
                    if (document.activeElement === el) {
                        caret(el, seekNext(getLastValidPosition()));
                    }
                }
            }
        }
        var valueBuffer;
        if (actionObj !== undefined) {
            switch (actionObj.action) {
              case "isComplete":
                el = actionObj.el;
                return isComplete(getBuffer());

              case "unmaskedvalue":
                if (el === undefined || actionObj.value !== undefined) {
                    valueBuffer = actionObj.value;
                    valueBuffer = ($.isFunction(opts.onBeforeMask) ? opts.onBeforeMask.call(inputmask, valueBuffer, opts) || valueBuffer : valueBuffer).split("");
                    checkVal.call(this, undefined, false, false, valueBuffer);
                    if ($.isFunction(opts.onBeforeWrite)) opts.onBeforeWrite.call(inputmask, undefined, getBuffer(), 0, opts);
                }
                return unmaskedvalue(el);

              case "mask":
                mask(el);
                break;

              case "format":
                valueBuffer = ($.isFunction(opts.onBeforeMask) ? opts.onBeforeMask.call(inputmask, actionObj.value, opts) || actionObj.value : actionObj.value).split("");
                checkVal.call(this, undefined, true, false, valueBuffer);
                if (actionObj.metadata) {
                    return {
                        value: isRTL ? getBuffer().slice().reverse().join("") : getBuffer().join(""),
                        metadata: maskScope.call(this, {
                            action: "getmetadata"
                        }, maskset, opts)
                    };
                }
                return isRTL ? getBuffer().slice().reverse().join("") : getBuffer().join("");

              case "isValid":
                if (actionObj.value) {
                    valueBuffer = actionObj.value.split("");
                    checkVal.call(this, undefined, true, true, valueBuffer);
                } else {
                    actionObj.value = getBuffer().join("");
                }
                var buffer = getBuffer();
                var rl = determineLastRequiredPosition(), lmib = buffer.length - 1;
                for (;lmib > rl; lmib--) {
                    if (isMask(lmib)) break;
                }
                buffer.splice(rl, lmib + 1 - rl);
                return isComplete(buffer) && actionObj.value === getBuffer().join("");

              case "getemptymask":
                return getBufferTemplate().join("");

              case "remove":
                if (el && el.inputmask) {
                    $.data(el, "_inputmask_opts", null);
                    $el = $(el);
                    el.inputmask._valueSet(opts.autoUnmask ? unmaskedvalue(el) : el.inputmask._valueGet(true));
                    EventRuler.off(el);
                    if (el.inputmask.colorMask) {
                        colorMask = el.inputmask.colorMask;
                        colorMask.removeChild(el);
                        colorMask.parentNode.insertBefore(el, colorMask);
                        colorMask.parentNode.removeChild(colorMask);
                    }
                    var valueProperty;
                    if (Object.getOwnPropertyDescriptor && Object.getPrototypeOf) {
                        valueProperty = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(el), "value");
                        if (valueProperty) {
                            if (el.inputmask.__valueGet) {
                                Object.defineProperty(el, "value", {
                                    get: el.inputmask.__valueGet,
                                    set: el.inputmask.__valueSet,
                                    configurable: true
                                });
                            }
                        }
                    } else if (document.__lookupGetter__ && el.__lookupGetter__("value")) {
                        if (el.inputmask.__valueGet) {
                            el.__defineGetter__("value", el.inputmask.__valueGet);
                            el.__defineSetter__("value", el.inputmask.__valueSet);
                        }
                    }
                    el.inputmask = undefined;
                }
                return el;
                break;

              case "getmetadata":
                if ($.isArray(maskset.metadata)) {
                    var maskTarget = getMaskTemplate(true, 0, false).join("");
                    $.each(maskset.metadata, function(ndx, mtdt) {
                        if (mtdt.mask === maskTarget) {
                            maskTarget = mtdt;
                            return false;
                        }
                    });
                    return maskTarget;
                }
                return maskset.metadata;
            }
        }
    }
    return Inputmask;
}
