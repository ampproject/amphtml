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

import dev.amp.validator.exception.TagValidationException;
import com.steadystate.css.parser.Token;

import dev.amp.validator.css.CssParser;
import dev.amp.validator.css.ErrorToken;
import dev.amp.validator.css.CssValidationException;
import dev.amp.validator.css.Stylesheet;
import dev.amp.validator.css.ParsedCssUrl;
import dev.amp.validator.css.CssParsingConfig;

import dev.amp.validator.utils.CssSpecUtils;
import dev.amp.validator.utils.TagSpecUtils;
import dev.amp.validator.visitor.InvalidRuleVisitor;
import org.xml.sax.Locator;

import javax.annotation.Nonnull;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

import static dev.amp.validator.css.CssTokenUtil.copyPosTo;
import static dev.amp.validator.utils.AttributeSpecUtils.validateUrlAndProtocol;
import static dev.amp.validator.utils.ByteUtils.byteLength;
import static dev.amp.validator.utils.CssSpecUtils.stripMinMax;
import static dev.amp.validator.utils.CssSpecUtils.stripVendorPrefix;
import static dev.amp.validator.utils.TagSpecUtils.getTagSpecName;
import static dev.amp.validator.utils.UrlUtils.isDataUrl;
import static dev.amp.validator.visitor.MediaQueryVisitor.parseMediaQueries;

/**
 * CdataMatcher maintains a constraint to check which an opening tag
 * introduces: a tag's cdata matches constraints set by it's cdata
 * spec. Unfortunately we need to defer such checking and can't
 * handle it while the opening tag is being processed.
 *
 * @author nhant01
 * @author GeorgeLuo
 */

public class CdataMatcher {
    /**
     * Constructor.
     *
     * @param parsedTagSpec the ParsedTagSpec.
     * @param lineCol a line / column pair.
     */
    public CdataMatcher(@Nonnull final ParsedTagSpec parsedTagSpec, @Nonnull final Locator lineCol) {
        this.parsedTagSpec = parsedTagSpec;
        this.lineCol = lineCol;
    }

    /**
     * Matches the provided cdata against what this CdataMatcher expects.
     *
     * @param cdata            the cdata.
     * @param context          the context object.
     * @param validationResult validation result object.
     * @throws TagValidationException the TagValidationException.
     * @throws CssValidationException css validation exception.
     * @throws IOException            IO exception.
     */
    public void match(@Nonnull final String cdata, @Nonnull final Context context,
                      @Nonnull final ValidatorProtos.ValidationResult.Builder validationResult)
            throws TagValidationException, CssValidationException, IOException {
        final ValidatorProtos.CdataSpec cdataSpec = this.getTagSpec().getCdata();
        if (cdataSpec == null) {
            return;
        }

        // Max CDATA Byte Length
        if (cdataSpec.hasMaxBytes() && cdataSpec.getMaxBytes() != CDATA_MAX_BYTES
                && cdata.length() > cdataSpec.getMaxBytes()) {
            List<String> params = new ArrayList<>();
            params.add(String.valueOf(cdata.length()));
            params.add(String.valueOf(cdataSpec.getMaxBytes()));
            context.addError(
                    ValidatorProtos.ValidationError.Code.STYLESHEET_TOO_LONG,
                    context.getLineCol(),
                    params,
                    cdataSpec.getMaxBytesSpecUrl(),
                    validationResult);
            return;
        }

        int urlBytes = 0;
        // The mandatory_cdata, cdata_regex, and css_spec fields are treated
        // like a oneof, but we're not using oneof because it's a feature
        // that was added after protobuf 2.5.0 (which our open-source
        // version uses).

        // Mandatory CDATA exact match
        List<String> params = new ArrayList<>();
        params.add(getTagSpecName(this.getTagSpec()));

        if (cdataSpec.hasMandatoryCdata()) {
            if (!cdataSpec.getMandatoryCdata().equals(cdata)) {
                context.addError(
                        ValidatorProtos.ValidationError.Code.MANDATORY_CDATA_MISSING_OR_INCORRECT,
                        context.getLineCol(),
                        params,
                        TagSpecUtils.getTagSpecUrl(this.getTagSpec()),
                        validationResult);
            }
            // We return early if the cdata has an exact match rule. The
            // spec shouldn't have an exact match rule that doesn't validate.
            return;
        } else if (this.getTagSpec().getCdata().hasCdataRegex()) {
            if (!context.getRules()
                    .getFullMatchRegex(this.getTagSpec().getCdata().getCdataRegex())
                    .matcher(cdata).matches()) {
                context.addError(
                        ValidatorProtos.ValidationError.Code.MANDATORY_CDATA_MISSING_OR_INCORRECT,
                        context.getLineCol(),
                        params,
                        TagSpecUtils.getTagSpecUrl(this.getTagSpec()),
                        validationResult);
                return;
            }
        } else if (cdataSpec.hasCssSpec()) {
            urlBytes = this.matchCss(cdata, cdataSpec.getCssSpec(), context, validationResult);
        } else if (cdataSpec.getWhitespaceOnly()) {
            if (!(WHITE_SPACE_CHARACTER_PATTERN.matcher(cdata).matches())) {
                context.addError(
                        ValidatorProtos.ValidationError.Code.NON_WHITESPACE_CDATA_ENCOUNTERED,
                        context.getLineCol(),
                        params,
                        TagSpecUtils.getTagSpecUrl(this.getTagSpec()),
                        validationResult);
            }
        }

        int adjustedCdataLength = byteLength(cdata);
        if (!cdataSpec.hasUrlBytesIncluded()) {
            adjustedCdataLength -= urlBytes;
        }

        // Record <style amp-custom> byte size
        if (context.getTagStack().isStyleAmpCustomChild()) {
            context.addStyleAmpCustomByteSize(adjustedCdataLength);
        }

        // Blacklisted CDATA Regular Expressions
        // We use a combined regex as a fast test. If it matches, we re-match
        // against each individual regex so that we can generate better error
        // messages.
        final String combinedBlacklistedCdataRegex =
                context.getRules().getCombinedBlacklistedCdataRegex(parsedTagSpec.getId());
        if (combinedBlacklistedCdataRegex == null) {
            return;
        }

        if (!context.getRules()
                .getPartialMatchCaseiRegex(combinedBlacklistedCdataRegex)
                .matcher(cdata).find()) {
            return;
        }

        for (ValidatorProtos.BlackListedCDataRegex blacklist : cdataSpec.getBlacklistedCdataRegexList()) {
            final Pattern p = Pattern.compile(blacklist.getRegex(), Pattern.CASE_INSENSITIVE);
            if (p.matcher(cdata).find()) {
                params.add(blacklist.getErrorMessage());
                context.addError(
                        ValidatorProtos.ValidationError.Code.CDATA_VIOLATES_BLACKLIST,
                        context.getLineCol(),
                        /* params */
                        params,
                        TagSpecUtils.getTagSpecUrl(this.getTagSpec()),
                        validationResult);
            }
        }
    }


    /**
     * Matches the provided cdata against a CSS specification. Helper
     * routine for match (see above). The return value is the number of
     * bytes in the CSS string which were measured as URLs. In some
     * validation types, these bytes are not counted against byte limits.
     *
     * @param cdata            the cdata.
     * @param cssSpec          CSS specification.
     * @param context          the context object.
     * @param validationResult validation result.
     * @return returns 1 if css matches against a CSS spec.
     * @throws CssValidationException css validation exception.
     * @throws IOException            IO validation exception.
     */
    public int matchCss(@Nonnull final String cdata, @Nonnull final ValidatorProtos.CssSpec cssSpec,
                        @Nonnull final Context context,
                        @Nonnull final ValidatorProtos.ValidationResult.Builder validationResult) throws CssValidationException,
            IOException {
        final List<ErrorToken> cssErrors = new ArrayList<>();
        final List<ErrorToken> cssWarnings = new ArrayList<>();

        final CssParser cssParser = new CssParser(cdata,
                this.getLineCol().getLineNumber(), this.getLineCol().getColumnNumber(), cssErrors);
        final List<Token> tokenList = cssParser.tokenize();
        final CssParsingConfig cssParsingConfig = CssParsingConfig.computeCssParsingConfig();
        final Stylesheet stylesheet = CssSpecUtils.parseAStylesheet(
                tokenList, cssParsingConfig.getAtRuleSpec(), cssParsingConfig.getDefaultSpec(),
                cssErrors);
        int urlBytes = 0;

        // We extract the urls from the stylesheet. As a side-effect, this can
        // generate errors for url(…) functions with invalid parameters.
        final List<ParsedCssUrl> parsedUrls = new ArrayList<>();
        CssSpecUtils.extractUrls(stylesheet, parsedUrls, cssErrors);
        // Similarly we extract query types and features from @media rules.
        for (final ValidatorProtos.AtRuleSpec atRuleSpec : cssSpec.getAtRuleSpecList()) {
            if (atRuleSpec.hasMediaQuerySpec()) {
                if (!atRuleSpec.getName().equals("media")) {
                    throw new CssValidationException("atRuleSpec name is not 'media'");
                }
                ValidatorProtos.MediaQuerySpec mediaQuerySpec = atRuleSpec.getMediaQuerySpec();
                List<ErrorToken> errorBuffer = mediaQuerySpec.getIssuesAsError() ? cssErrors : cssWarnings;
                this.matchMediaQuery(stylesheet, mediaQuerySpec, errorBuffer);
                // There will be at most @media atRuleSpec
                break;
            }
        }

        if (cssSpec.getValidateAmp4Ads()) {
            CssSpecUtils.validateAmp4AdsCss(stylesheet, cssErrors);
        }

        if (cssSpec.getValidateKeyframes()) {
            CssSpecUtils.validateKeyframesCss(stylesheet, cssErrors);
        }

        // Add errors then warnings:
        for (final ErrorToken errorToken : cssErrors) {
            // Override the first parameter with the name of this style tag.
            final List<String> params = errorToken.getParams();
            // Override the first parameter with the name of this style tag.
            params.set(0, getTagSpecName(this.getTagSpec()));
            context.addError(
                    errorToken.getCode(),
                    context.getLineCol().getColumnNumber() + errorToken.getLine(),
                    context.getLineCol().getColumnNumber() + errorToken.getCol(),
                    params,
                    /* url */ "",
                    validationResult);
        }

        for (ErrorToken errorToken : cssWarnings) {
            // Override the first parameter with the name of this style tag.
            List<String> params = errorToken.getParams();
            // Override the first parameter with the name of this style tag.
            params.set(0, getTagSpecName(this.getTagSpec()));
            context.addError(
                    errorToken.getCode(),
                    context.getLineCol().getColumnNumber() + errorToken.getLine(),
                    context.getLineCol().getColumnNumber() + errorToken.getCol(),
                    params,
                    /* url */ "",
                    validationResult);
        }

        final ParsedUrlSpec parsedFontUrlSpec = new ParsedUrlSpec(cssSpec.getFontUrlSpec());
        final ParsedUrlSpec parsedImageUrlSpec = new ParsedUrlSpec(cssSpec.getImageUrlSpec());
        for (final ParsedCssUrl url : parsedUrls) {
            // Some CSS specs can choose to not count URLs against the byte limit,
            // but data URLs are always counted (or in other words, they aren't
            // considered URLs).
            if (!isDataUrl(url.getUtf8Url())) {
                urlBytes += byteLength(url.getUtf8Url());
            }
            final UrlErrorInStylesheetAdapter adapter = new UrlErrorInStylesheetAdapter(url.getLine(), url.getCol());
            validateUrlAndProtocol(
                    ((url.getAtRuleScope().equals("font-face")) ? parsedFontUrlSpec : parsedImageUrlSpec),
                    adapter, context, url.getUtf8Url(), this.getTagSpec(), validationResult);
        }

        final InvalidRuleVisitor visitor = new InvalidRuleVisitor(
                this.getTagSpec(), cssSpec, context, validationResult);
        stylesheet.accept(visitor);
        return urlBytes;
    }

    /**
     * Matches the provided stylesheet against a CSS media query specification.
     *
     * @param stylesheet  the stylesheet to validate
     * @param spec        the spec to validate against
     * @param errorBuffer the errors collection to populate
     * @throws CssValidationException css validation exception.
     * @private
     */
    private void matchMediaQuery(@Nonnull final Stylesheet stylesheet,
                                 @Nonnull final ValidatorProtos.MediaQuerySpec spec,
                                 @Nonnull final List<ErrorToken> errorBuffer) throws CssValidationException {
        List<Token> seenMediaTypes = new ArrayList<>();
        List<Token> seenMediaFeatures = new ArrayList<>();
        parseMediaQueries(stylesheet, seenMediaTypes, seenMediaFeatures, errorBuffer);

        for (final Token token : seenMediaTypes) {
            final String strippedMediaType = stripVendorPrefix((token.toString().toLowerCase()));
            if (!spec.getTypeList().contains(strippedMediaType)) {
                final List<String> params = new ArrayList<>();
                params.add("");
                params.add(token.toString());
                final ErrorToken errorToken = new ErrorToken(
                        ValidatorProtos.ValidationError.Code.CSS_SYNTAX_DISALLOWED_MEDIA_TYPE,
                        params);
                copyPosTo(token, errorToken);
                errorBuffer.add(errorToken);
            }
        }

        for (final Token token : seenMediaFeatures) {
            final String strippedMediaFeature = stripMinMax(
                    stripVendorPrefix((token.toString().toLowerCase())));
            if (!spec.getFeatureList().contains(strippedMediaFeature)) {
                List<String> params = new ArrayList<>();
                params.add("");
                params.add(token.toString());
                ErrorToken errorToken = new ErrorToken(
                        ValidatorProtos.ValidationError.Code.CSS_SYNTAX_DISALLOWED_MEDIA_FEATURE,
                        params);
                copyPosTo(token, errorToken);
                errorBuffer.add(errorToken);
            }
        }
    }

    /**
     * @return lineCol of CdataMatcher
     */
    public Locator getLineCol() {
        return this.lineCol;
    }

    /**
     * @return tagspec of the CdataMatcher
     */
    public ValidatorProtos.TagSpec getTagSpec() {
        return parsedTagSpec.getSpec();
    }

    /**
     * A TagSpec object.
     */
    private ParsedTagSpec parsedTagSpec;

    /**
     * A pair of line/col.
     */
    private Locator lineCol;

    /**
     * A white space character pattern.
     */
    private static final Pattern WHITE_SPACE_CHARACTER_PATTERN = Pattern.compile("^\\s*$");

    /**
     * CDATA max bytes.
     */
    private static final int CDATA_MAX_BYTES = -2;
}
