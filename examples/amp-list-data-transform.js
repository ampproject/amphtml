onmessage = function(e) {
  console.log('amp-list transformer, input:\n', e.data);
  const finaldata = {
    items: Object.keys(e.data).map(key => {
      return {
        key: key,
        val: e.data[key]
      };
    })
  };
  console.log('amp-list transformer, output:\n', finaldata);
  postMessage(finaldata);
};