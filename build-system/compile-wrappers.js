const {VERSION} = require('./internal-version');

// If there is a sync JS error during initial load,
// at least try to unhide the body.
exports.mainBinary = 'self.AMP=self.AMP||[];' +
    'try{(function(_){<%= contents %>})(AMP._={})}catch(e){' +
    'setTimeout(function(){' +
    'var s=document.body.style;' +
    's.opacity=1;' +
    's.visibility="visible";' +
    's.animation="none";' +
    's.WebkitAnimation="none;"},1000);throw e};';

exports.extension = function(name, loadPriority) {
  if (loadPriority && loadPriority != 'high') {
    throw new Error('Unsupported loadPriority: ' + loadPriority);
  }
  const priority = loadPriority ? 'p:"high",' : '';
  return `(self.AMP=self.AMP||[]).push({n:"${name}",${priority}` +
      `v:"${VERSION}",f:(function(AMP,_){<%= contents %>\n})});`;
};

exports.none = '<%= contents %>';
