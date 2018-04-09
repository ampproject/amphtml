let nextQueryId = 0;

export const query = (target, tag, queryBody) => {
  return new Promise((resolve, reject) => {
    const queryId = nextQueryId++;
    const waitResponse = e => {
      if (e.data.amp3dViewer &&
          e.data.tag === tag &&
          e.data.queryId === queryId) {
        if (e.data.response) {
          target.removeEventListener('message', waitResponse);
          resolve(e.data.responseBody);
        }
        if (e.data.error) {
          target.removeEventListener('message', waitResponse);
          reject(new Error(e.data.errorBody));
        }
      }
    };
    target.addEventListener('message', waitResponse);
    send(target, tag, {
      query: true,
      queryId,
      queryBody,
    }, origin);
  });
};

export const addQueryHandler = (target, tag, fn) => {
  const handler = e => {
    if (e.data.amp3dViewer &&
        e.data.query &&
        e.data.tag === tag) {
      const {queryBody, queryId} = e.data;
      Promise.resolve()
          .then(() => fn(queryBody))
          .then(
              responseBody => {
                send(target, tag, {
                  response: true,
                  queryId,
                  responseBody,
                }, '*');
              },
              error => {
                const errorBody = (error instanceof Error)
                  ? error.message + '\n' + error.stack
                  : error.toString();
                send(target, tag, {
                  error: true,
                  queryId,
                  errorBody,
                });
              }
          );
    }
  };

  target.addEventListener('message', handler);

  return () => {
    target.removeEventListener('message', handler);
  };
};

const computeOrigin = () => {
  return location.origin || location.protocol +
      '//' +
      location.hostname +
      (location.port ? ':' + location.port : '');
};

export const send = (target, tag, data) => {
  target.postMessage(
      Object.assign({amp3dViewer: true, tag}, data),
      computeOrigin()
  );
};

export const notify = (target, tag, data) => {
  send(target, tag, {notify: true, data});
};

export const listen = (target, tag, fn) => {
  const handler = e => {
    if (e.data.amp3dViewer &&
        e.data.notify &&
        e.data.tag === tag) {
      fn(e.data.data);
    }
  };

  target.addEventListener('message', handler);

  return () => {
    target.removeEventListener('message', handler);
  };
};

export const willReceiveNotification = (target, tag, fn) => {
  return new Promise(resolve => {
    const dispose = listen(target, tag, data => {
      if (fn(data)) {
        dispose();
        resolve();
      }
    });
  });
};

export const registerGlobalIpcCode =
    'window.AMP_3D_VIEWER_IPC = (function () {' +
      'var nextQueryId = 0;' +
      'var computeOrigin = function () {' +
        `return ${JSON.stringify(computeOrigin())};` +
      '};' +
      `var send = ${send.toString()};` +
      'return {' +
        `addQueryHandler: ${addQueryHandler.toString()},` +
        `query: ${query.toString()},` +
        `notify: ${notify.toString()}` +
      '};' +
    '})();';
