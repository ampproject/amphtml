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

/**
 * Token representation of end of file.
 *
 * @author nhant01
 * @author GeorgeLuo
 */

public class EOFToken extends Token {
    /**
     * Return type of token
     * @return TokenType.EOF_TOKEN
     */
    @Override
    public TokenType getTokenType() {
        return TokenType.EOF_TOKEN;
    }
}
