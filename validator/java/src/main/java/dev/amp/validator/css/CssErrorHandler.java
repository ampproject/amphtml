package dev.amp.validator.css;

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

import org.w3c.css.sac.CSSException;
import org.w3c.css.sac.CSSParseException;
import org.w3c.css.sac.ErrorHandler;

import javax.annotation.Nonnull;

/**
 * Error handler for css errors
 *
 * @author nhant01
 * @author GeorgeLuo
 */

public class CssErrorHandler implements ErrorHandler {

    /**
     * Error handler for warning
     * @param e exception caught
     */
    @Override
    public void warning(@Nonnull final CSSParseException e) throws CSSException {
    }

    /**
     * Error handler for error
     * @param e exception caught
     */
    @Override
    public void error(@Nonnull final CSSParseException e) throws CSSException {
    }

    /**
     * Error handler for fatal error
     * @param e exception caught
     */
    @Override
    public void fatalError(@Nonnull final CSSParseException e) throws CSSException {
    }
}
