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

import dev.amp.validator.css.CssValidationException;
import dev.amp.validator.exception.ExitOnFirstErrorException;
import dev.amp.validator.exception.MaxParseNodesException;
import dev.amp.validator.exception.TagValidationException;
import dev.amp.validator.exception.ValidatorException;
import dev.amp.validator.utils.ByteUtils;
import dev.amp.validator.utils.TagSpecUtils;
import org.json.JSONObject;
import org.json.JSONException;

import org.xml.sax.Attributes;
import org.xml.sax.Locator;
import org.xml.sax.SAXException;
import org.xml.sax.helpers.DefaultHandler;

import javax.annotation.Nonnull;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Validation handler which accepts callbacks from HTML parser.
 *
 * @author nhant01
 * @author GeorgeLuo
 */

public class AMPHtmlHandler extends DefaultHandler {
    /**
     * Creates an AMPHtmlHandler.
     *
     * @param validatorManager the validator manager instance.
     * @param htmlFormat       HtmlFormat code.
     * @param condition        exit condition.
     * @param maxNodesAllowed  max nodes allowed.
     */
    public AMPHtmlHandler(@Nonnull final AMPValidatorManager validatorManager,
                          @Nonnull final ValidatorProtos.HtmlFormat.Code htmlFormat, @Nonnull final ExitCondition condition,
                          final int maxNodesAllowed) {
        this.validatorManager = validatorManager;
        this.exitCondition = condition;
        this.maxNodesAllowed = maxNodesAllowed;
        this.htmlFormat = htmlFormat;
        this.validationResult = ValidatorProtos.ValidationResult.newBuilder();
        context = new Context(new ParsedValidatorRules(htmlFormat, validatorManager));
    }

    /**
     * Processing the beginning of the document.
     *
     * @exception SAXException Any SAX exception.
     */
    @Override
    public void startDocument() throws SAXException {
        validationResult.setStatus(ValidatorProtos.ValidationResult.Status.UNKNOWN);
    }

    /**
     * Processing the end of the document.
     *
     * @exception SAXException Any SAX exception.
     */
    @Override
    public void endDocument() throws SAXException {
        try {
            context.getRules().maybeEmitGlobalTagValidationErrors(context, validationResult);
            if (validationResult.getStatus() == ValidatorProtos.ValidationResult.Status.UNKNOWN) {
                validationResult.setStatus(ValidatorProtos.ValidationResult.Status.PASS);
            }
            if (validationResult.getErrorsCount() > 0) {
                validationResult.setStatus(ValidatorProtos.ValidationResult.Status.FAIL);
            }
        } catch (TagValidationException tve) {
            /** ignore */
        }
    }

    /**
     * Processing the start of an element.
     *
     * @param uri The Namespace URI, or the empty string if the
     *        element has no Namespace URI or if Namespace
     *        processing is not being performed.
     * @param localName The local name (without prefix), or the
     *        empty string if Namespace processing is not being
     *        performed.
     * @param qName The qualified name (with prefix), or the
     *        empty string if qualified names are not available.
     * @param attributes The attributes attached to the element.  If
     *        there are no attributes, it shall be an empty
     *        Attributes object.
     * @exception SAXException Any SAX exception
     */
    @Override
    public void startElement(final String uri, final String localName,
                             final String qName, final Attributes attributes) throws SAXException {
        if (this.maxNodesAllowed > 0 && this.totalNodes > this.maxNodesAllowed) {
            throw new MaxParseNodesException();
        }

        this.totalNodes++;

        this.encounteredTag = new ParsedHtmlTag(localName, attributes);
        if (encounteredTag.upperName().equals("HTML")) {
            this.context.getRules().validateHtmlTag(
                    encounteredTag, this.context, this.validationResult);
        }

        // TODO: discuss how to handle this warning (Attributes class dedupes)
        final String maybeDuplicateAttrName = encounteredTag.hasDuplicateAttrs();
        if (maybeDuplicateAttrName != null) {
            final List<String> params = new ArrayList<>();
            params.add(encounteredTag.lowerName());
            params.add(maybeDuplicateAttrName);
            this.context.addWarning(
                    ValidatorProtos.ValidationError.Code.DUPLICATE_ATTRIBUTE,
                    this.context.getLineCol(),
                    params,
                    /* specUrl */ "",
                    this.validationResult);
            //TODO - tagchowder doesn't seem to maintain duplicate attributes.
            //encounteredTag.dedupeAttrs();
        }

        if (encounteredTag.upperName().equals("BODY")) {
            this.emitMissingExtensionErrors();
        }

        Map<String, String> attrsByKey = encounteredTag.attrsByKey();
        String styleAttr = attrsByKey.get("style");
        if (styleAttr != null) {
            int styleLen = ByteUtils.byteLength(styleAttr);
            this.context.addInlineStyleByteSize(styleLen);
            for (ValidatorProtos.CssLengthSpec cssLengthSpec : this.context.getRules().getCssLengthSpec()) {
                if (cssLengthSpec.getMaxBytesPerInlineStyle() != -1
                        && styleLen > cssLengthSpec.getMaxBytesPerInlineStyle()) {

                    List<String> params = new ArrayList<>();
                    params.add(encounteredTag.lowerName());
                    params.add(Integer.toString(styleLen));
                    params.add(Integer.toString(cssLengthSpec.getMaxBytesPerInlineStyle()));

                    this.context.addError(
                            ValidatorProtos.ValidationError.Code.INLINE_STYLE_TOO_LONG,
                            this.context.getLineCol(), params,
                            cssLengthSpec.getSpecUrl(), this.validationResult);
                    //TODO - tagchowder doesn't seem to maintain duplicate attributes.
                    //encounteredTag.dedupeAttrs();
                }
            }
        }

        try {
            ValidateTagResult resultForReferencePoint =
                    new ValidateTagResult(ValidatorProtos.ValidationResult.newBuilder(), null);
            resultForReferencePoint.getValidationResult().setStatus(ValidatorProtos.ValidationResult.Status.UNKNOWN);

            final ReferencePointMatcher referencePointMatcher = context.getTagStack().parentReferencePointMatcher();
            if (referencePointMatcher != null) {
                resultForReferencePoint = referencePointMatcher.validateTag(encounteredTag, context);
            }

            final ValidateTagResult resultForTag =
                    TagSpecUtils.validateTag(context, encounteredTag, resultForReferencePoint.getBestMatchTagSpec());
            if (referencePointMatcher != null
                    && (resultForTag.getValidationResult().getStatus() == ValidatorProtos.ValidationResult.Status.PASS)) {
                this.validationResult.mergeFrom(resultForReferencePoint.getValidationResult().build());
            }

            checkForReferencePointCollision(
                    resultForReferencePoint.getBestMatchTagSpec(),
                    resultForTag.getBestMatchTagSpec(),
                    resultForTag.getValidationResult());

            this.validationResult.mergeFrom(resultForTag.getValidationResult().build());
            this.context.updateFromTagResults(encounteredTag, resultForReferencePoint, resultForTag);

            if (this.validationResult.getErrorsCount() > 0
                    && exitCondition == ExitCondition.EXIT_ON_FIRST_ERROR) {
                throw new ExitOnFirstErrorException();
            }
        } catch (TagValidationException | ValidatorException | IOException | CssValidationException ex) {
            /** ignore */
        }
    }

    /**
     * Processing the end of an element.
     *
     * @param uri The Namespace URI, or the empty string if the
     *        element has no Namespace URI or if Namespace
     *        processing is not being performed.
     * @param localName The local name (without prefix), or the
     *        empty string if Namespace processing is not being performed.
     * @param qName The qualified name (with prefix), or the
     *        empty string if qualified names are not available.
     */
    @Override
    public void endElement(final String uri, final String localName, final String qName) {
        if (encounteredTag != null) {
            try {
                if (charactersBuilder != null) {
                    cdata(charactersBuilder.toString());
                } else {
                    cdata("");
                }
            } catch (TagValidationException | CssValidationException | IOException e) {
                /** ignore */
            }
            encounteredTag.cleanup();
        }
        try {
            this.context.getTagStack().exitTag(this.context, this.validationResult);
        } catch (TagValidationException tve) {
            /** ignore */
        }

        charactersBuilder = null;
        encounteredTag = null;
    }

    /**
     * Receive a Locator object for document events.
     *
     * @param locator A locator for all SAX document events.
     */
    @Override
    public void setDocumentLocator(@Nonnull final Locator locator) {
        this.context.setLineCol(locator);
    }

    /**
     * Returns the validation result.
     *
     * @return returns the validation result.
     */
    public ValidatorProtos.ValidationResult.Builder validationResult() {
        return validationResult;
    }

    /**
     * While parsing the document HEAD, we may accumulate errors which depend
     * on seeing later extension script tags.
     */
    public void emitMissingExtensionErrors() {
        final ExtensionsContext extensionsCtx = this.context.getExtensions();
        for (ValidatorProtos.ValidationError error : extensionsCtx.missingExtensionErrors()) {
            this.context.addBuiltError(error, this.validationResult);
        }
    }

    /**
     * Considering that reference points could be defined by both reference
     * points and regular tag specs, check that we don't have matchers assigned
     * from both, there can be only one.
     *
     * @param refPointSpec a reference point parsed tag spec.
     * @param tagSpec a parsed tag spec.
     * @param validationResult a ValidationResult.
     */
    private void checkForReferencePointCollision(
            final ParsedTagSpec refPointSpec, final ParsedTagSpec tagSpec,
            @Nonnull final ValidatorProtos.ValidationResult.Builder validationResult) {
        if (refPointSpec == null || !refPointSpec.hasReferencePoints()) {
            return;
        }

        if (tagSpec == null || !tagSpec.hasReferencePoints()) {
            return;
        }

        final List<String> params = new ArrayList<>();
        params.add(TagSpecUtils.getTagSpecName(tagSpec.getSpec()));
        params.add(refPointSpec.getReferencePoints().parentTagSpecName());
        context.addError(
                ValidatorProtos.ValidationError.Code.TAG_REFERENCE_POINT_CONFLICT,
                context.getLineCol(),
                params,
                refPointSpec.getReferencePoints().parentSpecUrl(),
                validationResult);
    }

    /**
     * Callback for cdata.
     *
     * @param text the css content to validate
     * @throws TagValidationException tag validation exception.
     * @throws CssValidationException css validation exception.
     * @throws IOException IO exception.
     */
    public void cdata(@Nonnull final String text) throws TagValidationException, CssValidationException, IOException {
        // Validate that JSON can be parsed.
        if (this.context.getTagStack().isScriptTypeJsonChild()) {
            try {
                new JSONObject(text);
            } catch (JSONException e) {
                List<String> params = new ArrayList<>();
                this.context.addWarning(
                        ValidatorProtos.ValidationError.Code.INVALID_JSON_CDATA,
                        this.context.getLineCol(),
                        params, "",
                        this.validationResult);
            }
        }
        final CdataMatcher matcher = this.context.getTagStack().cdataMatcher();
        if (matcher != null) {
            matcher.match(text, this.context, this.validationResult);
        }
    }

    /**
     * Processing character data inside an element.
     *
     * @param ch The characters.
     * @param start The start position in the character array.
     * @param length The number of characters to use from the character array.
     */
    @Override
    public void characters(final char[] ch, final int start, final int length) {
        if (this.encounteredTag != null) {
            if (charactersBuilder == null) {
                this.charactersBuilder = new StringBuilder();
            }
            charactersBuilder.append(new String(ch, start, length));
        }
    }

    /**
     * AMPValidatorManager object.
     */
    @Nonnull
    private final AMPValidatorManager validatorManager;

    /**
     * ExitCondition object.
     */
    @Nonnull
    private final ExitCondition exitCondition;

    /**
     * Max nodes.
     */
    private int maxNodesAllowed;

    /**
     * Total nodes.
     */
    private int totalNodes;

    /**
     * ValidationResult object.
     */
    @Nonnull
    private ValidatorProtos.ValidationResult.Builder validationResult;

    /**
     * HtmlFormat used to validate against.
     */
    @Nonnull
    private final ValidatorProtos.HtmlFormat.Code htmlFormat;

    /**
     * Context object capturing session variables of the current validation.
     */
    @Nonnull
    private final Context context;

    /**
     * Encountered tag.
     */
    private ParsedHtmlTag encounteredTag;

    /**
     * Characters can be called multiple times per tag.
     */
    private StringBuilder charactersBuilder;
}

