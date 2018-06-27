/*!
* phone-codes/phone.js
* https://github.com/RobinHerbots/Inputmask
* Copyright (c) 2010 - 2017 Robin Herbots
* Licensed under the MIT license (http://www.opensource.org/licenses/mit-license.php)
* Version: 3.3.11
*/

!function(factory) {
    "function" == typeof define && define.amd ? define([ "../inputmask" ], factory) : "object" == typeof exports ? module.exports = factory(require("../inputmask")) : factory(window.Inputmask);
}(function(Inputmask) {
    return Inputmask.extendAliases({
        'phone-us': {
            alias: "abstractphone",
            phoneCodes: [ {
								mask: "+1(###) ###-####",
                cc: [ "US", "CA" ],
                cd: "USA and Canada",
                // desc_en: "",
                // name_ru: "США и Канада",
                // desc_ru: ""
            }, {
								mask: "(###) ###-####",
                cc: [ "US", "CA" ],
                cd: "USA and Canada",
                // desc_en: "",
                // name_ru: "США и Канада",
                // desc_ru: ""
            } ],
        }
    }), Inputmask;
});
