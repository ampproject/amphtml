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

package dev.amp.validator.parser;

import dev.amp.validator.ValidatorProtos;
import dev.amp.validator.AMPValidatorManager;
import dev.amp.validator.AMPHtmlHandler;
import dev.amp.validator.ExitCondition;
import com.yahoo.tagchowder.Parser;
import com.yahoo.tagchowder.templates.HTMLSchema;
import org.xml.sax.InputSource;
import org.xml.sax.SAXException;

import javax.annotation.Nonnull;
import java.io.IOException;
import java.io.StringReader;
import java.net.URISyntaxException;

/**
 * The AMP HTML parser class.
 *
 * @author nhant01
 * @author GeorgeLuo
 *
 */

public class AMPHtmlParser {
    /**
     * Constructor.
     *
     * @throws ParserException exception occurs while loading rules
     */
    public AMPHtmlParser() throws ParserException {
        validatorManager = new AMPValidatorManager();
        try {
            validatorManager.loadRule();
        } catch (IOException | URISyntaxException ex) {
            throw  new ParserException("Unable to load AMP validation rules.", ex);
        }
    }

    /**
     * Parse the input html document and returns validation result.
     *
     * @param inputHtml input html document.
     * @param htmlFormat html format.
     * @param condition exit condition.
     * @return returns a validation object.
     */
    public ValidatorProtos.ValidationResult parse(@Nonnull final String inputHtml,
                                            @Nonnull final ValidatorProtos.HtmlFormat.Code htmlFormat,
                                            @Nonnull final ExitCondition condition) {
        return parse(inputHtml, htmlFormat, condition, 0);
    }

    /**
     * Parse the input html document and returns validation result.
     *
     * @param inputHtml input html document.
     * @param htmlFormat html format.
     * @param condition exit condition.
     * @param maxNodes max nodes.
     * @return returns a validation object.
     */
    public ValidatorProtos.ValidationResult parse(@Nonnull final String inputHtml,
                                            @Nonnull final ValidatorProtos.HtmlFormat.Code htmlFormat,
                                            @Nonnull final ExitCondition condition,
                                            final int maxNodes) {
        final Parser parser = new Parser();
        final AMPHtmlHandler handler = new AMPHtmlHandler(validatorManager, htmlFormat, condition, maxNodes);
        try {
            parser.setContentHandler(handler);
            parser.setProperty(Parser.SCHEMA_PROPERTY, new HTMLSchema(true));
            parser.setFeature(Parser.DEFAULT_ATTRIBUTES_FEATURE, false);
            parser.parse(new InputSource(new StringReader(inputHtml)));
        } catch (IOException | SAXException ex) {
            final ValidatorProtos.ValidationResult.Builder result = handler.validationResult();
            if (result.getErrorsCount() == 0) {
                result.setStatus(ValidatorProtos.ValidationResult.Status.FAIL);

                ValidatorProtos.ValidationError.Builder error = ValidatorProtos.ValidationError.newBuilder();
                error.setSeverity(ValidatorProtos.ValidationError.Severity.ERROR);
                error.setCode(ValidatorProtos.ValidationError.Code.UNKNOWN_CODE);
                final String message =
                        (ex.getMessage() != null ? ex.getMessage() : "Unable to parse input HTML document");
                error.addParams(message);
                result.addErrors(error);
            }
        }

        return handler.validationResult().build();
    }

    /** Validation manager object. */
    @Nonnull
    private final AMPValidatorManager validatorManager;
}


