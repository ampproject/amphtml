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

/**
 /**
 * Exception class for parsing.
 *
 * @author nhant01
 * @author GeorgeLuo
 *
 */

public class ParserException extends Exception {
    /**
     * Constructs a new exception with {@code null} as its detail message.
     */
    public ParserException() {
        super();
    }

    /**
     * Constructs a new exception with the specified detail message.  The
     * cause is not initialized.
     * @param message the detail message.
     */
    public ParserException(final String message) {
        super(message);
    }

    /**
     * Constructs a new exception with the specified detail message and
     * cause.
     *
     * @param  message the detail message.
     * @param  cause the cause.
     */
    public ParserException(final String message, final Throwable cause) {
        super(message, cause);
    }
}
