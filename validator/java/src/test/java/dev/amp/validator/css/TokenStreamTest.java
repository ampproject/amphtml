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
import org.testng.annotations.BeforeTest;
import org.testng.annotations.Test;

import java.util.LinkedList;
import java.util.List;

/**
 * Test for {@link TokenStream}
 *
 * @author GeorgeLuo
 */

public class TokenStreamTest {

    @BeforeTest
    public void init() throws Exception {
        List<Token> tokens = new LinkedList<>();
        tokens.add(new Token(SACParserCSS3Constants.S, " "));
        tokens.add(new Token(SACParserCSS3Constants.IDENT, "square"));
        tokens.add(new Token(SACParserCSS3Constants.EOF, ""));
        tokenStream = new TokenStream(tokens);
    }

    @Test
    public void testConsume() {
        tokenStream.consume();
        Token t = tokenStream.current();
        Assert.assertEquals(t.kind, SACParserCSS3Constants.S);
        Assert.assertEquals(t.image, " ");
    }

    @Test
    public void testNext() {
        Token t = tokenStream.next();
        Assert.assertEquals(t.kind, SACParserCSS3Constants.IDENT);
        Assert.assertEquals(t.image, "square");
    }

    @Test
    public void testTokenAt() {
        Token t = tokenStream.tokenAt(1);
        Assert.assertEquals(t.kind, SACParserCSS3Constants.IDENT);
        Assert.assertEquals(t.image, "square");
    }

    @Test
    public void testReconsume() {
        tokenStream.consume();
        tokenStream.consume();
        tokenStream.reconsume();
        Token t = tokenStream.current();
        Assert.assertEquals(t.kind, SACParserCSS3Constants.IDENT);
        Assert.assertEquals(t.image, "square");
    }

    private TokenStream tokenStream;
}
