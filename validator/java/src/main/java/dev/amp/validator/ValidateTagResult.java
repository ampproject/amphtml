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

/**
 * This class contains the validation result and the best match tag spec.
 *
 * @author nhant01
 * @author GeorgeLuo
 */

public class ValidateTagResult {
    /**
     * Constructor.
     * @param validationResult validation result.
     * @param parsedTagSpec parsed tag spec.
     */
    public ValidateTagResult(@Nonnull final ValidatorProtos.ValidationResult.Builder validationResult,
                             final ParsedTagSpec parsedTagSpec) {
        this.validationResult = validationResult;
        this.bestMatchTagSpec = parsedTagSpec;
    }

    /**
     * Return best match tag spec.
     * @return returns best match tag spec.
     */
    public ParsedTagSpec getBestMatchTagSpec() {
        return bestMatchTagSpec;
    }

    /**
     * Setting the best match tag spec.
     * @param bestMatchTagSpec best match tag spec.
     */
    public void setBestMatchTagSpec(@Nonnull final ParsedTagSpec bestMatchTagSpec) {
        this.bestMatchTagSpec = bestMatchTagSpec;
    }

    /**
     * Getting the validation result.
     * @return returns the validation result.
     */
    public ValidatorProtos.ValidationResult.Builder getValidationResult() {
        return validationResult;
    }

    /**
     * Setting the validation result.
     * @param validationResult validation result.
     */
    public void setValidationResult(@Nonnull final ValidatorProtos.ValidationResult.Builder validationResult) {
        this.validationResult = validationResult;
    }


    /**
     * Setter for inlineStyleCssBytes
     *
     * @param inlineStyleCssBytes the allowed byte length for css
     */
    public void setInlineStyleCssBytes(final int inlineStyleCssBytes) {
      this.inlineStyleCssBytes = inlineStyleCssBytes;
    }

    /**
     * Getter for inlineStyleCssBytes
     * @return the allowed byte length for css
     */
    public int getInlineStyleCssBytes() {
      return inlineStyleCssBytes;
    }

    /**
     * Validation result.
     */
    private ValidatorProtos.ValidationResult.Builder validationResult;

    /**
     * Best match tag spec.
     */
    private ParsedTagSpec bestMatchTagSpec;

    /**
     * inline style allowed byte length
     */
    private int inlineStyleCssBytes;
}
