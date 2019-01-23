/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

describes.endtoend('GitHub search results', {
}, async env => {
  let controller;

  beforeEach(async() => {
    controller = env.controller;
    await controller.navigateTo('https://github.com/');
  });

  it.skip('should contain a result for the search term', async() => {
    const searchButtonHandle =
      await controller.findElement('.header-search-input');
    await controller.type(searchButtonHandle, 'TestCafe');
    await controller.type(null, Key.ENTER);

    await expect(controller.getTitle()).to.match(/TestCafe/);

    const itemHandle = await controller.findElement('.repo-list-item');
    await expect(controller.getElementText(itemHandle))
        .to.contain('DevExpress/testcafe');
  });
});

describes.endtoend('GitHub login', {
}, async env => {
  let controller;

  beforeEach(async() => {
    controller = env.controller;
    await controller.navigateTo('https://github.com/login');
  });

  it.skip('should fail to login with no credentials', async() => {
    const loginButton =
      await controller.findElement('.btn.btn-primary.btn-block');
    await controller.click(loginButton);

    const errorHandle =
      await controller.findElement('#js-flash-container > div > div');
    await expect(controller.getElementText(errorHandle))
        .to.include('Incorrect username or password.');
  });
});
