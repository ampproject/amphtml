/*
 *
 * ====================================================================
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *  ====================================================================
 */

/*
 * Changes to the original project are Copyright 2019, Verizon Media Inc..
 */

package dev.amp.validator.utils;

import dev.amp.validator.ValidatorProtos;

import javax.annotation.Nonnull;

/**
 * Dispatch key utility methods.
 *
 * @author nhant01
 * @author GeorgeLuo
 */

public final class DispatchKeyUtils {
    /**
     * Private constructor.
     */
    private DispatchKeyUtils() {
    }

    /**
     *  DispatchKey represents a tuple of either 1-3 strings:
     *    - attribute name
     *    - attribute value (optional)
     *    - mandatory parent html tag (optional)
     *  A Dispatch key can be generated from some validator TagSpecs. One dispatch
     *  key per attribute can be generated from any HTML tag. If one of the
     *  dispatch keys for an HTML tag match that of a a TagSpec, we validate that
     *  HTML tag against only this one TagSpec. Otherwise, this TagSpec is not
     *  eligible for validation against this HTML tag.
     * @param dispatchKeyType a DispatchKeyType.
     * @param attrName attribute name.
     * @param attrValue attribute value.
     * @param mandatoryParent may be set to "$NOPARENT"
     * @return returns dispatch key.
     */
    public static String makeDispatchKey(
            @Nonnull final ValidatorProtos.AttrSpec.DispatchKeyType dispatchKeyType,
            @Nonnull final String attrName, @Nonnull final String attrValue,
            @Nonnull final String mandatoryParent) {
        switch (dispatchKeyType) {
            case NAME_DISPATCH:
                return attrName;
            case NAME_VALUE_DISPATCH:
                return attrName + "\0" + attrValue;
            case NAME_VALUE_PARENT_DISPATCH:
                return attrName + "\0" + attrValue + "\0" + (mandatoryParent != null ? "true" : "");
            case NONE_DISPATCH:
            default:
                assert false;
        }
        return ""; // To make closure happy.
    }

    /**
     * For a provided tag spec, generates its dispatch key.
     * @param tagSpec a tag spec.
     * @return a dispatch key.
     */
    public static String getDispatchKeyForTagSpecOrNone(@Nonnull final ValidatorProtos.TagSpec tagSpec)  {
        for (ValidatorProtos.AttrSpec attr : tagSpec.getAttrsList()) {
            if (attr.getDispatchKey() != ValidatorProtos.AttrSpec.DispatchKeyType.NONE_DISPATCH) {
                final boolean mandatoryParent = tagSpec.hasMandatoryParent();
                if (attr.getDispatchKey() == ValidatorProtos.AttrSpec.DispatchKeyType.NAME_DISPATCH) {
                    return attr.getName();
                }

                String attrValue = null;
                if (attr.getValueCaseiList() != null && attr.getValueCaseiList().size() > 0) {
                    attrValue = attr.getValueCasei(0);
                } else if (attr.getValueList() != null && attr.getValueList().size() > 0) {
                    attrValue = attr.getValue(0).toLowerCase();
                }

                if (attrValue == null) {
                    return null;
                }

                if (attr.getDispatchKey() == ValidatorProtos.AttrSpec.DispatchKeyType.NAME_VALUE_DISPATCH) {
                    return attr.getName() + "\0" + attrValue;
                }

                if (attr.getDispatchKey() == ValidatorProtos.AttrSpec.DispatchKeyType.NAME_VALUE_PARENT_DISPATCH) {
                    return attr.getName() + "\0" + attrValue + "\0" + (mandatoryParent ? mandatoryParent : "");
                }
            }
        }

        return null;
    }
}
