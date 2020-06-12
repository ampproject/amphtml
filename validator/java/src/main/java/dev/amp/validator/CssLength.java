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

package dev.amp.validator;

import javax.annotation.Nonnull;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Parses a width or height layout attribute, for the determining the layout
 * of AMP tags.
 *
 * @author nhant01
 * @author GeorgeLuo
 */

public class CssLength {
    /**
     * Constructor.
     * @param input The input attribute value to be parsed.
     * @param allowAuto Whether or not to allow the 'auto' value as a value.
     * @param allowFluid whether or not to allow the 'fluid' value
     *   as a value.
     */
    public CssLength(@Nonnull final String input, final boolean allowAuto, final boolean allowFluid) {
        this.isValid = false;
        this.isSet = false;
        this.isAuto = false;
        this.isFluid = false;
        this.numeral = Float.NaN;
        this.unit = "px";

        if (input == null) {
            this.isValid = true;
            return;
        }
        this.isSet = true;
        if (input.equals("auto")) {
            this.isAuto = true;
            this.isValid = allowAuto;
            return;
        } else if (input.equals("fluid")) {
            this.isFluid = true;
            this.isValid = allowFluid;
        }

        Matcher matcher = CSS_LENGTH_PATTERN.matcher(input);
        if (matcher.matches()) {
            this.isValid = true;
            this.numeral = Float.parseFloat(matcher.group(1));
            this.unit = matcher.group(2) != null ? matcher.group(2) : "px";
        }
    }

    /**
     * Returns isValid.
     * @return returns boolean isSet.
     */
    public boolean isValid() {
        return isValid;
    }

    /**
     * Returns isSet.
     * @return returns boolean isSet.
     */
    public boolean isSet() {
        return isSet;
    }

    /**
     * Returns isAuto.
     * @return returns a float isAuto.
     */
    public boolean isAuto() {
        return isAuto;
    }

    /**
     * Returns a isFluid.
     * @return returns a boolean isFluid.
     */
    public boolean isFluid() {
        return isFluid;
    }

    /**
     * Returns a isNumeral.
     * @return returns a float isNumeral.
     */
    public Float getNumeral() {
        return numeral;
    }

    /**
     * Returns a isUnit.
     * @return returns a String isUnit.
     */
    public String getUnit() {
        return unit;
    }

    /**
     * Whether the value or unit is invalid. Note that passing
     * undefined as |input| is considered valid.
     */
    private boolean isValid;

    /**
     * Whether the attribute value is set.
     */
    private boolean isSet;

    /**
     * Whether the attribute value is 'auto'. This is a special value that
     * indicates that the value gets derived from the context. In practice
     * that's only ever the case for a width.
     */
    private boolean isAuto;

    /**
     * Whether the attribute value is 'fluid'
     */
    private boolean isFluid;

    /**
     * The numeric value.
     */
    private Float numeral;

    /**
     * The unit, 'px' being the default in case it's absent.
     */
    private String unit;

    /** CSS length regex pattern. */
    private static final Pattern CSS_LENGTH_PATTERN =
            Pattern.compile("^(\\d+(?:\\.\\d+)?)(px|em|rem|vh|vw|vmin|vmax)?$");
}
