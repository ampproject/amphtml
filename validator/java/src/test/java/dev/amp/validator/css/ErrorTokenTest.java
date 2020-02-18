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

import dev.amp.validator.ValidatorProtos;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.util.ArrayList;
import java.util.List;

/**
 * Test for {@link ErrorToken}
 *
 * @author GeorgeLuo
 */

public class ErrorTokenTest {

  @Test
  public void testGetters() {
    try {
      final String param = "param";
      final List<String> params = new ArrayList<>();
      params.add(param);

      final ErrorToken errorToken
        = new ErrorToken(ValidatorProtos.ValidationError.Code.CSS_SYNTAX_UNTERMINATED_STRING, params);

      Assert.assertEquals(errorToken.getParams(), params);
      Assert.assertEquals(errorToken.getCode(), ValidatorProtos.ValidationError.Code.CSS_SYNTAX_UNTERMINATED_STRING);

      Assert.assertEquals(errorToken.getTokenType(), TokenType.ERROR);

    } catch (CssValidationException e) {
      e.printStackTrace();
    }
  }
}
