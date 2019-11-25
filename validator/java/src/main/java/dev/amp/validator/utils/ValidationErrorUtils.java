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
import org.xml.sax.Locator;

import javax.annotation.Nonnull;
import java.util.List;

/**
 * Validation error utility methods.
 *
 * @author nhant01
 * @author GeorgeLuo
 */

public final class ValidationErrorUtils {
    /**
     * A private constructor.
     */
    private ValidationErrorUtils() {
    }

    /**
     * Construct a ValidationError object from the given argument list.
     *
     * @param severity the severity.
     * @param validationErrorCode Error code.
     * @param lineCol a line / column pair.
     * @param params the list of params.
     * @param specUrl a link (URL) to the amphtml spec.
     * @return returns the ValidationError instance.
     */
    public static ValidatorProtos.ValidationError populateError(
            @Nonnull final ValidatorProtos.ValidationError.Severity severity,
            @Nonnull final  ValidatorProtos.ValidationError.Code validationErrorCode,
            @Nonnull final Locator lineCol, @Nonnull final List<String> params, @Nonnull final String specUrl) {
        return populateError(severity, validationErrorCode,
                lineCol.getLineNumber(), lineCol.getColumnNumber(), params, specUrl);
    }

    /**
     * Construct a ValidationError object from the given argument list.
     *
     * @param severity the severity.
     * @param validationErrorCode Error code.
     * @param line a line number.
     * @param column a column number.
     * @param params the list of params.
     * @param specUrl a link (URL) to the amphtml spec.
     * @return returns the ValidationError instance.
     */
    public static ValidatorProtos.ValidationError populateError(
            @Nonnull final ValidatorProtos.ValidationError.Severity severity,
            @Nonnull final  ValidatorProtos.ValidationError.Code validationErrorCode,
            final int line, final int column, @Nonnull final List<String> params,
            @Nonnull final String specUrl) {
        final ValidatorProtos.ValidationError.Builder error = ValidatorProtos.ValidationError.newBuilder();
        error.setSeverity(severity);
        error.setCode(validationErrorCode);
        error.addAllParams(params);
        error.setLine(line);
        error.setCol(column);
        error.setSpecUrl(specUrl == null ? "" : specUrl);
        return error.build();
    }
}
