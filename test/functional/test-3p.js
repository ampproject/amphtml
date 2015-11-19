/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

 import {validateSrcPrefix, validateSrcContains} from '../../src/3p';

 describe('3p', () => {
   it('should throw an error if prefix is not https:', () => {
     expect(() => {
       validateSrcPrefix('https:', 'http://adserver.adtechus.com');
     }).to.throw(/Invalid src/);
   });

   it('should not throw if source starts with https', () => {
     expect(
      validateSrcPrefix('https:', 'https://adserver.adtechus.com')
    ).to.not.throw;
   });

   it('should throw an error if src does not contain addyn', () => {
     expect(() => {
       validateSrcContains('/addyn/', 'http://adserver.adtechus.com/');
     }).to.throw(/Invalid src/);
   });

   it('should not throw if source contains /addyn/', () => {
     expect(
      validateSrcContains('/addyn/', 'http://adserver.adtechus.com/addyn/')
    ).to.not.throw;
   });
 });

