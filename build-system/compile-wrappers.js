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

exports.extension = function(name, loadPriority, intermediateDeps) {
  let deps = '';
  if (intermediateDeps) {
    deps = 'i:';
    function quote(s) {
      return `"${s}"`;
    }
    if (intermediateDeps.length == 1) {
      deps += quote(intermediateDeps[0]);
    } else {
      deps += `[${intermediateDeps.map(quote).join(',')}]`;
    }
    deps += ',';
  }
  let priority = '';
  if (loadPriority) {
    if (loadPriority != 'high') {
      throw new Error('Unsupported loadPriority: ' + loadPriority);
    }
    priority = 'p:"high",';
  }
  return `(self.AMP=self.AMP||[]).push({n:"${name}",${priority}${deps}` +
      `v:"${VERSION}",f:(function(AMP,_){<%= contents %>\n})});`;
};

exports.none = '<%= contents %>';
