/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import * as path from 'path';
import {promises as fsPromises} from 'fs';
import fastify from 'fastify';
import urlData from 'fastify-url-data';
import compress from 'fastify-compress';
import {transform} from './transform';
// import { deliver } from './build';

const fastifyInstance = fastify({
  logger: false,
});
fastifyInstance.register(urlData);
fastifyInstance.register(compress, {global: true});

let instanceActive = false;

fastifyInstance.get('/examples/*.html', async function(request, reply) {
  const urlData = request.urlData();
  const transformed = await transform(process.cwd() + urlData.path);
  reply.type('text/html; charset=UTF-8').code(200);
  reply.send(transformed);
});

fastifyInstance.get('/dist/*.mjs', async function(request, reply) {
  const urlData = request.urlData();
  const file = await fsPromises.readFile(path.resolve('.' + urlData.path), 'utf-8');
  reply.type('text/javascript').code(200);
  reply.send(file);
})

export async function start(): Promise<void> {
  if (instanceActive) {
    return;
  }

  await fastifyInstance.listen(8001);
  fastifyInstance.log.info(`server listening on ${8001}`);
  instanceActive = true;
}

export async function end(): Promise<void> {
  if (!instanceActive) {
    return;
  }

  await fastifyInstance.close();
  instanceActive = false;
}
