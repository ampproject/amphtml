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

import com.steadystate.css.parser.SACParserCSS3Constants;

import javax.annotation.Nonnull;
import java.util.List;
import com.steadystate.css.parser.Token;

/**
 * Class to manage a list of tokens as a stream with accessors to iterate through stream.
 *
 * @author nhant01
 * @author GeorgeLuo
 */

public class TokenStream {

    /**
     * Constructor to initialize stream with underlying token list.
     * @param tokens css content to store in stream
     * @throws CssValidationException Css Validation Exception
     */
    public TokenStream(@Nonnull final List<com.steadystate.css.parser.Token> tokens) throws CssValidationException {
        if (tokens.size() <= 0) {
            throw new CssValidationException("Internal Error: empty TokenStream - must have EOF token");
        }

        if (tokens.get(tokens.size() - 1).kind != SACParserCSS3Constants.EOF) {
            throw new CssValidationException("Internal Error: TokenStream must end with EOF");
        }

        this.tokens = tokens;
        this.pos = -1;
    }

    /**
     * Function to advance the stream by a token
     */
    public void consume() {
        this.pos++;
    }

    /**
     * Returns the token at the next position in the token stream.
     * @return the token at the position after the current token.
     */
    public Token next() {
        return this.tokenAt(this.pos + 1);
    }

    /**
     * Returns the token at an absolute position in the token stream.
     *
     * @param num is the index of the token returned
     * @return the token at num
     */
    public Token tokenAt(final int num) {
        // The last token is guaranteed to be the EOF token (with correct
        // line / col!) so any request past the length of the array
        // fetches that.
        return (num < this.tokens.size()) ? this.tokens.get(num) : this.tokens.get(this.tokens.size() - 1);
    }

    /**
     * Returns the token at the current position in the token stream.
     * @return the token currently found at pos
     */
    public Token current() {
        return this.tokenAt(this.pos);
    }

    /** Rewinds to the previous position in the input. */
    public void reconsume() {
        this.pos--;
    }

    @Nonnull
    private final List<com.steadystate.css.parser.Token> tokens;

    /** Position of the input. */
    private int pos;
}
