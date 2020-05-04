// QQQ: remove, testing only

export function measure(node, prevValue) {
  console.log('measure:', node, prevValue);
  // QQQQ: this is an async thing!!!!
  const io = new IntersectionObserver((records) => {
    console.log('measure: result: ', records);
    io.disconnect();
  });
  io.observe(node);
  return 'QQQQQQ';
}
