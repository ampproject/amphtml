/*!
* inputmask.date.extensions.js
* https://github.com/RobinHerbots/Inputmask
* Copyright (c) 2010 - 2018 Robin Herbots
* Licensed under the MIT license (http://www.opensource.org/licenses/mit-license.php)
* Version: 4.0.4
*/

export function factory(Inputmask) {
    var $ = Inputmask.dependencyLib;
    var formatCode = {
        d: [ "[1-9]|[12][0-9]|3[01]", Date.prototype.setDate, "day", Date.prototype.getDate ],
        dd: [ "0[1-9]|[12][0-9]|3[01]", Date.prototype.setDate, "day", function() {
            return pad(Date.prototype.getDate.call(this), 2);
        } ],
        ddd: [ "" ],
        dddd: [ "" ],
        m: [ "[1-9]|1[012]", Date.prototype.setMonth, "month", function() {
            return Date.prototype.getMonth.call(this) + 1;
        } ],
        mm: [ "0[1-9]|1[012]", Date.prototype.setMonth, "month", function() {
            return pad(Date.prototype.getMonth.call(this) + 1, 2);
        } ],
        mmm: [ "" ],
        mmmm: [ "" ],
        yy: [ "[0-9]{2}", Date.prototype.setFullYear, "year", function() {
            return pad(Date.prototype.getFullYear.call(this), 2);
        } ],
        yyyy: [ "[0-9]{4}", Date.prototype.setFullYear, "year", function() {
            return pad(Date.prototype.getFullYear.call(this), 4);
        } ],
        h: [ "[1-9]|1[0-2]", Date.prototype.setHours, "hours", Date.prototype.getHours ],
        hh: [ "0[1-9]|1[0-2]", Date.prototype.setHours, "hours", function() {
            return pad(Date.prototype.getHours.call(this), 2);
        } ],
        hhh: [ "[0-9]+", Date.prototype.setHours, "hours", Date.prototype.getHours ],
        H: [ "1?[0-9]|2[0-3]", Date.prototype.setHours, "hours", Date.prototype.getHours ],
        HH: [ "[01][0-9]|2[0-3]", Date.prototype.setHours, "hours", function() {
            return pad(Date.prototype.getHours.call(this), 2);
        } ],
        HHH: [ "[0-9]+", Date.prototype.setHours, "hours", Date.prototype.getHours ],
        M: [ "[1-5]?[0-9]", Date.prototype.setMinutes, "minutes", Date.prototype.getMinutes ],
        MM: [ "[0-5][0-9]", Date.prototype.setMinutes, "minutes", function() {
            return pad(Date.prototype.getMinutes.call(this), 2);
        } ],
        s: [ "[1-5]?[0-9]", Date.prototype.setSeconds, "seconds", Date.prototype.getSeconds ],
        ss: [ "[0-5][0-9]", Date.prototype.setSeconds, "seconds", function() {
            return pad(Date.prototype.getSeconds.call(this), 2);
        } ],
        l: [ "[0-9]{3}", Date.prototype.setMilliseconds, "milliseconds", function() {
            return pad(Date.prototype.getMilliseconds.call(this), 3);
        } ],
        L: [ "[0-9]{2}", Date.prototype.setMilliseconds, "milliseconds", function() {
            return pad(Date.prototype.getMilliseconds.call(this), 2);
        } ],
        t: [ "[ap]" ],
        tt: [ "[ap]m" ],
        T: [ "[AP]" ],
        TT: [ "[AP]M" ],
        Z: [ "" ],
        o: [ "" ],
        S: [ "" ]
    }, formatAlias = {
        isoDate: "yyyy-mm-dd",
        isoTime: "HH:MM:ss",
        isoDateTime: "yyyy-mm-dd'T'HH:MM:ss",
        isoUtcDateTime: "UTC:yyyy-mm-dd'T'HH:MM:ss'Z'"
    };
    function getTokenizer(opts) {
        if (!opts.tokenizer) {
            var tokens = [];
            for (var ndx in formatCode) {
                if (tokens.indexOf(ndx[0]) === -1) tokens.push(ndx[0]);
            }
            opts.tokenizer = "(" + tokens.join("+|") + ")+?|.";
            opts.tokenizer = new RegExp(opts.tokenizer, "g");
        }
        return opts.tokenizer;
    }
    function isValidDate(dateParts, currentResult) {
        return !isFinite(dateParts.rawday) || dateParts.day == "29" && !isFinite(dateParts.rawyear) || dateParts.year.length < 4 || new Date(dateParts.date.getFullYear(), isFinite(dateParts.rawmonth) ? dateParts.month : dateParts.date.getMonth() + 1, 0).getDate() >= dateParts.day ? currentResult : false;
    }
    function isDateInRange(dateParts, opts) {
        var result = true;

        if (!dateParts["rawyear"] || !dateParts["rawmonth"] || !dateParts["rawday"]) {
            return false;
        }

        if (opts.min) {
            if (dateParts["rawyear"]) {
                var rawYear = dateParts["rawyear"].replace(/[^0-9]/g, ""), minYear = opts.min.year.substr(0, rawYear.length);
                result = minYear <= rawYear;
            }
            if (dateParts["year"] === dateParts["rawyear"]) {
                if (opts.min.date.getTime() === opts.min.date.getTime()) {
                    result = opts.min.date.getTime() <= dateParts.date.getTime();
                }
            }
        }
        if (result && opts.max && opts.max.date.getTime() === opts.max.date.getTime()) {
            result = opts.max.date.getTime() >= dateParts.date.getTime();
        }
        return result;
    }
    function parse(format, dateObjValue, opts, raw) {
        var mask = "", match;
        while (match = getTokenizer(opts).exec(format)) {
            if (dateObjValue === undefined) {
                if (formatCode[match[0]]) {
                    mask += "(" + formatCode[match[0]][0] + ")";
                } else {
                    switch (match[0]) {
                      case "[":
                        mask += "(";
                        break;

                      case "]":
                        mask += ")?";
                        break;

                      default:
                        mask += Inputmask.escapeRegex(match[0]);
                    }
                }
            } else {
                if (formatCode[match[0]]) {
                    if (raw !== true && formatCode[match[0]][3]) {
                        var getFn = formatCode[match[0]][3];
                        mask += getFn.call(dateObjValue.date);
                    } else if (formatCode[match[0]][2]) mask += dateObjValue["raw" + formatCode[match[0]][2]]; else mask += match[0];
                } else mask += match[0];
            }
        }
        return mask;
    }
    function pad(val, len) {
        val = String(val);
        len = len || 2;
        while (val.length < len) val = "0" + val;
        return val;
    }
    function analyseMask(maskString, format, opts) {
        var dateObj = {
            date: new Date(1, 0, 1)
        }, targetProp, mask = maskString, match, dateOperation, targetValidator;
        function extendProperty(value) {
            var correctedValue = value.replace(/[^0-9]/g, "0");
            if (correctedValue != value) {
                var enteredPart = value.replace(/[^0-9]/g, ""), min = (opts.min && opts.min[targetProp] || value).toString(), max = (opts.max && opts.max[targetProp] || value).toString();
                correctedValue = enteredPart + (enteredPart < min.slice(0, enteredPart.length) ? min.slice(enteredPart.length) : enteredPart > max.slice(0, enteredPart.length) ? max.slice(enteredPart.length) : correctedValue.toString().slice(enteredPart.length));
            }
            return correctedValue;
        }
        function setValue(dateObj, value, opts) {
            dateObj[targetProp] = extendProperty(value);
            dateObj["raw" + targetProp] = value;
            if (dateOperation !== undefined) dateOperation.call(dateObj.date, targetProp == "month" ? parseInt(dateObj[targetProp]) - 1 : dateObj[targetProp]);
        }
        if (typeof mask === "string") {
            while (match = getTokenizer(opts).exec(format)) {
                var value = mask.slice(0, match[0].length);
                if (formatCode.hasOwnProperty(match[0])) {
                    targetValidator = formatCode[match[0]][0];
                    targetProp = formatCode[match[0]][2];
                    dateOperation = formatCode[match[0]][1];
                    setValue(dateObj, value, opts);
                }
                mask = mask.slice(value.length);
            }
            return dateObj;
        } else if (mask && typeof mask === "object" && mask.hasOwnProperty("date")) {
            return mask;
        }
        return undefined;
    }
    Inputmask.extendAliases({
        datetime: {
            mask: function(opts) {
                formatCode.S = opts.i18n.ordinalSuffix.join("|");
                opts.inputFormat = formatAlias[opts.inputFormat] || opts.inputFormat;
                opts.displayFormat = formatAlias[opts.displayFormat] || opts.displayFormat || opts.inputFormat;
                opts.outputFormat = formatAlias[opts.outputFormat] || opts.outputFormat || opts.inputFormat;
                opts.placeholder = opts.placeholder !== "" ? opts.placeholder : opts.inputFormat.replace(/[\[\]]/, "");
                opts.regex = parse(opts.inputFormat, undefined, opts);
                return null;
            },
            placeholder: "",
            inputFormat: "isoDateTime",
            displayFormat: undefined,
            outputFormat: undefined,
            min: null,
            max: null,
            i18n: {
                dayNames: [ "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday" ],
                monthNames: [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ],
                ordinalSuffix: [ "st", "nd", "rd", "th" ]
            },
            postValidation: function (buffer, pos, currentResult, opts, maskset) {
                 opts.min = analyseMask(opts.min, opts.inputFormat, opts);
                 opts.max = analyseMask(opts.max, opts.inputFormat, opts);

                 var result = currentResult, dateParts = analyseMask(buffer.join(""), opts.inputFormat, opts);
                 if (result && dateParts.date.getTime() === dateParts.date.getTime()) { //check for a valid date ~ an invalid date returns NaN which isn't equal
                     result = isValidDate(dateParts, result);
                    const inRange = result && isDateInRange(dateParts, opts);

                    if (pos && inRange && currentResult.pos !== pos) {
                        return {
                            buffer: parse(opts.inputFormat, dateParts, opts),
                            refreshFromBuffer: {start: pos, end: currentResult.pos}
                        };
                    }
                }

                // Automatically add a separator to fix an issue where typing
                // valid chars into the field does not move the mask forward.
                // https://github.com/RobinHerbots/Inputmask/issues/1514
                const testIndex = buffer.length;
                const test = maskset.tests[testIndex];
                if (!test) {
                    return result;
                 }

                const maskDateSeparators = test.map(t => t.match)
                    .filter(m => /^[-/]$/.test(m.def));
                const isSeparatorOnly = (maskDateSeparators.length === 1);
                if (isSeparatorOnly) {
                    const c = maskDateSeparators[0].def;
                     return {
                        buffer: buffer.concat([c]),
                        refreshFromBuffer: {start: pos, end: buffer.length + 1},
                     };
                 }
                return result;
            },
            onKeyDown: function(e, buffer, caretPos, opts, initial, previousPos) {
                var input = this;
                if (e.ctrlKey && e.keyCode === Inputmask.keyCode.RIGHT) {
                    var today = new Date(), match, date = "";
                    while (match = getTokenizer(opts).exec(opts.inputFormat)) {
                        if (match[0].charAt(0) === "d") {
                            date += pad(today.getDate(), match[0].length);
                        } else if (match[0].charAt(0) === "m") {
                            date += pad(today.getMonth() + 1, match[0].length);
                        } else if (match[0] === "yyyy") {
                            date += today.getFullYear().toString();
                        } else if (match[0].charAt(0) === "y") {
                            date += pad(today.getYear(), match[0].length);
                        }
                    }
                    input.inputmask._valueSet(date);
                    $(input).trigger("setvalue");
                }

                const {begin, end} = previousPos;
                // If the user presses backspace in the middle of the input
                // value, stop masking until the field is cleared.
                if (e.keyCode === Inputmask.keyCode.BACKSPACE ||
                    e.keyCode === Inputmask.keyCode.DELETE ||
                    ((e.metaKey || e.ctrlKey) && e.keyCode === 'X'.charCodeAt(0))) {
                    const length = input.value.length;
                    const cursorIsInMiddle = input.selectionStart != length &&
                        input.selectionEnd != length;
                    if (length > 0 && cursorIsInMiddle) {
                        disableMaskingUntilClear(input);

                        // The library tries to be smart about moving the cursor
                        // and autofilling values, but here we want to just
                        // delete the text that was selected like a normal
                        // input.
                        // So we take the original selection and the origina
                        // value before the library auto-changed them,
                        // and apply the edits ourselves here.
                        const difference = end - begin;
                        if (e.keyCode === Inputmask.keyCode.BACKSPACE) {
                            const selectionBegin =
                                difference == 0 ? begin - 1 : begin;
                            input.value =
                                initial.slice(0, selectionBegin) +
                                initial.slice(end);
                            input.setSelectionRange(
                                selectionBegin, selectionBegin);
                        } else if (e.keyCode === Inputmask.keyCode.DELETE) { // delete
                            const selectionEnd =
                                difference == 0 ? end + 1 : end;
                            input.value =
                                initial.slice(0, begin) +
                                initial.slice(selectionEnd);
                            input.setSelectionRange(begin, begin);
                        }
                    }
                    return;
                }

                // If the user enters text with a selection and causes delete...
                if (previousPos.begin != previousPos.end) {
                    // ... via paste
                    if ((e.metaKey || e.ctrlKey) && e.keyCode === 'V'.charCodeAt(0)) {
                        disableMaskingUntilClear(input);
                        return;
                    }

                    // Don't handle CTRL+C/CMD+C or CTRL or CMD alone
                    if (e.metaKey || e.ctrlKey) {
                        return;
                    }

                    // ... via typing a char
                    const fromCharCode = String.fromCharCode(e.keyCode);
                    const char = e.shiftKey ?
                        fromCharCode.toLocaleUpperCase() :
                        fromCharCode.toLocaleLowerCase();
                    if (!/\s/.test(char)) {
                        disableMaskingUntilClear(input);
                        // The library still sets the value after the keydown
                        // handler returns, so we need to asynchronously
                        // set the value here.
                        setTimeout(() => {
                            input.value =
                                initial.slice(0, begin) +
                                char +
                                initial.slice(end);
                            input.setSelectionRange(
                                begin + 1, begin + 1);
                        }, 0);
                    }
                }
            },
            onUnMask: function(maskedValue, unmaskedValue, opts) {
                return parse(opts.outputFormat, analyseMask(maskedValue, opts.inputFormat, opts), opts, true);
            },
            casing: function(elem, test, pos, validPositions) {
                if (test.nativeDef.indexOf("[ap]") == 0) return elem.toLowerCase();
                if (test.nativeDef.indexOf("[AP]") == 0) return elem.toUpperCase();
                return elem;
            },
            insertMode: false,
            shiftPositions: false
        }
    });

    /**
     * When the user clears the input, reapply the
     * inputmask behavior.
     * @param {!Element} input
     */
    function disableMaskingUntilClear(input) {
        const cachedController = input.inputmask;
        input.inputmask.remove();
        input.addEventListener('input', function onclear() {
            if (input.value.length == 0) {
                input.removeEventListener('input', onclear);
                cachedController.mask(input);
            }
        });
    }
    return Inputmask;
}
