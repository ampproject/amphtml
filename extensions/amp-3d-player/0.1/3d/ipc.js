let nextQueryId = 0;

export const query = (target, tag, queryBody) => {
  return new Promise(resolve => {
    const queryId = nextQueryId++;
    const waitResponse = e => {
      if (e.data.amp3dViewer &&
          e.data.tag === tag &&
          e.data.response &&
          e.data.queryId === queryId) {
        target.removeEventListener('message', waitResponse);
        resolve(e.data.responseBody);
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
      send(target, tag, {
        amp3dViewer: true,
        response: true,
        tag,
        queryId,
        responseBody: fn(queryBody),
      }, document.origin);
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
