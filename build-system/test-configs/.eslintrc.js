module.exports = {
  'overrides': [
    {
      'files': ['forbidden-terms.js'],
      'rules': {
        // The terms referenced by this rule are defined in this file.
        'local/no-forbidden-terms': 0,
        // Ensures that allowlists in file are up-to-date.
        'local/forbidden-terms-config': 2,
      },
    },
  ],
};
