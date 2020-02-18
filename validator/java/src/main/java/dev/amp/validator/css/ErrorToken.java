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

package dev.amp.validator.css;

import dev.amp.validator.ValidatorProtos;

import javax.annotation.Nonnull;
import java.util.List;

/**
 * Error tokens carry an error code and parameters, which can be
 * formatted into an error message via the format strings in
 * validator.protoascii.
 *
 * @author nhant01
 * @author GeorgeLuo
 */

public class ErrorToken extends Token {

    /**
     * Constructor
     * @param optCode the optCode value to set
     * @param optParams the optParams to set
     * @throws CssValidationException Css Validation Exception
     */
    public ErrorToken(final ValidatorProtos.ValidationError.Code optCode,
                      final List<String> optParams) throws CssValidationException {
        super();
        if (optCode == null) {
            throw new CssValidationException("opt_code is null");
        }

        if (optParams == null) {
            throw new CssValidationException("opt_params is null");
        }

        this.code = optCode;
        this.params = optParams;
    }

    /**
     * Getter for error params
     * @return list of params
     */
    public List<String> getParams() {
        return this.params;
    }

    /**
     * Getter for error code
     * @return error code
     */
    public ValidatorProtos.ValidationError.Code getCode() {
        return this.code;
    }

    /**
     * Getter for token type.
     * @return returns token type error
     */
    @Override
    public TokenType getTokenType() {
        return TokenType.ERROR;
    }

    /** Validation error code. */
    @Nonnull
    private final ValidatorProtos.ValidationError.Code code;

    /** List of params. */
    @Nonnull
    private final List<String> params;


}
