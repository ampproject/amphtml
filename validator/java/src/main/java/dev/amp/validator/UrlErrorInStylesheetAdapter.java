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

import dev.amp.validator.utils.TagSpecUtils;

import javax.annotation.Nonnull;
import java.util.ArrayList;
import java.util.List;

/**
 * URL error in stylesheet adapter.
 *
 * @author nhant01
 * @author GeorgeLuo
 */

public class UrlErrorInStylesheetAdapter implements UrlErrorAdapter {
    /**
     * Constructor.
     *
     * @param lineNumber line number.
     * @param columnNumber column number.
     */
    public UrlErrorInStylesheetAdapter(final int lineNumber, final int columnNumber) {
        this.lineNumber = lineNumber;
        this.columnNumber = columnNumber;
    }

    /**
     * Adding missing url validation error.
     *
     * @param context context.
     * @param tagSpec tag spec.
     * @param result validation result.
     */
    @Override
    public void missingUrl(@Nonnull final Context context,
                           @Nonnull final ValidatorProtos.TagSpec tagSpec,
                           @Nonnull final  ValidatorProtos.ValidationResult.Builder result) {
        final List<String> params = new ArrayList<>();
        params.add(TagSpecUtils.getTagSpecName(tagSpec));
        context.addError(
                ValidatorProtos.ValidationError.Code.CSS_SYNTAX_MISSING_URL,
                lineNumber,
                columnNumber,
                /* params */params,
                TagSpecUtils.getTagSpecUrl(tagSpec),
                result);
    }

    /**
     * Adding invalid url validation error.
     *
     * @param context context.
     * @param url the url.
     * @param tagSpec tag spec.
     * @param result validation result.
     */
    @Override
    public void invalidUrl(@Nonnull final Context context,
                           @Nonnull final String url,
                           @Nonnull final ValidatorProtos.TagSpec tagSpec,
                           @Nonnull final  ValidatorProtos.ValidationResult.Builder result) {
        final List<String> params = new ArrayList<>();
        params.add(TagSpecUtils.getTagSpecName(tagSpec));
        params.add(url);
        context.addError(
                ValidatorProtos.ValidationError.Code.CSS_SYNTAX_INVALID_URL,
                lineNumber,
                columnNumber,
                /* params */params,
                TagSpecUtils.getTagSpecUrl(tagSpec),
                result);
    }

    /**
     * Adding invalid url protocol error.
     *
     * @param context context.
     * @param protocol the protocol.
     * @param tagSpec tag spec.
     * @param result validation result.
     */
    @Override
    public void invalidUrlProtocol(@Nonnull final Context context,
                                   @Nonnull final String protocol,
                                   @Nonnull final ValidatorProtos.TagSpec tagSpec,
                                   @Nonnull final  ValidatorProtos.ValidationResult.Builder result) {
        final List<String> params = new ArrayList<>();
        params.add(TagSpecUtils.getTagSpecName(tagSpec));
        params.add(protocol);
        context.addError(
                ValidatorProtos.ValidationError.Code.CSS_SYNTAX_INVALID_URL_PROTOCOL,
                lineNumber,
                columnNumber,
                /* params */params,
                TagSpecUtils.getTagSpecUrl(tagSpec),
                result);
    }

    /**
     * Adding disallowed relative url error.
     *
     * @param context context.
     * @param url the url.
     * @param tagSpec tag spec.
     * @param result validation result.
     */
    @Override
    public void disallowedRelativeUrl(@Nonnull final Context context,
                                      @Nonnull final String url,
                                      @Nonnull final ValidatorProtos.TagSpec tagSpec,
                                      @Nonnull final  ValidatorProtos.ValidationResult.Builder result) {
        final List<String> params = new ArrayList<>();
        params.add(TagSpecUtils.getTagSpecName(tagSpec));
        params.add(url);
        context.addError(
                ValidatorProtos.ValidationError.Code.CSS_SYNTAX_DISALLOWED_RELATIVE_URL,
                lineNumber,
                columnNumber,
                /* params */params,
                TagSpecUtils.getTagSpecUrl(tagSpec),
                result);
    }

    /** A line number. */
    private final int lineNumber;

    /** A column number. */
    private final int columnNumber;
}
