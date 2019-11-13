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

import com.steadystate.css.parser.SACParserCSS3Constants;
import com.steadystate.css.parser.Token;
import org.testng.Assert;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

import java.util.ArrayList;

/**
 * Test for {@link Token}
 *
 * @author gluo17
 */

public class TokenTest {

    @BeforeClass
    public void init() {
        token = new Token(SACParserCSS3Constants.S, " ");
    }

    @Test
    public void testGetTokenType() {
        Token token = new Declaration("h1");
        Assert.assertEquals(((Declaration) token).getTokenType(), TokenType.DECLARATION);
    }

    @Test
    public void testSetLine() {
        Declaration token = new Declaration("h1");
        token.setLine(12);
        Assert.assertEquals(token.getLine(), 12);
    }

    @Test
    public void testSetCol() {
        Declaration token = new Declaration("h1");
        token.setCol(12);
        Assert.assertEquals(token.getCol(), 12);
    }

    @Test
    public void testGetValue() {
        Token token = new Declaration("h1");
        Assert.assertEquals(token.getValue(), new ArrayList<>());
    }

    @Test
    public void testTestToString() {
        Token token = new Declaration("h1");
        Assert.assertEquals(token.toString(), "DECLARATION");
    }

    private Token token;
}
