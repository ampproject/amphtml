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
 * Extension missing error data.
 *
 * @author nhant01
 * @author GeorgeLuo
 */

public class ExtensionMissingError {
    /**
     * Default constructor.
     * @param missingExtension missing extension.
     * @param validationError  validation error.
     */
    public ExtensionMissingError(@Nonnull final String missingExtension,
                                 @Nonnull final ValidatorProtos.ValidationError validationError) {
        this.maybeError = validationError;
        this.missingExtension = missingExtension;
    }

    /**
     * Returns the missing extension generating the
     * ExtensionMissingError.
     * @return returns the missing extension.
     */
    public String getMissingExtension() {
        return missingExtension;
    }

    /**
     * Returns the ValidationError of ExtensionMissingError.
     *  @return ValidationError basis of ExtensionMissingError.
     */
    public ValidatorProtos.ValidationError getMaybeError() {
        return maybeError;
    }

    /** Missing extension. */
    private String missingExtension;

    /** Validation error. */
    private ValidatorProtos.ValidationError maybeError;
}
