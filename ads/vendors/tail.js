import {loadScript, validateData} from '#3p/3p';

/**
 * @param {!Window} global
 * @param {!Object} data
 */
export function tail(global, data) {
  validateData(data, [], ['account']);

  global._ttprofiles = {};
  data.targeting = data.targeting || {};

  const CATEGORIES = {
    'E': 'equipment',
    'A': 'age',
    'X': 'expandedage',
    'G': 'gender',
    'U': 'keywordsubject',
    'T': 'soccerteam',
    'C': 'socialclass',
    'S': 'subject',
  };

  /**
   * Convertes array ["E:V","A:V1, V2"...] where P is the profile key and V is the profile
   * into {'equipment': [V1], 'age': [V1, V2]..} and set them into data.targeting object.
   *
   * @param {*} profiles - Array of profiles
   */
  global._ttprofiles._setTTProfile = function (profiles) {
    const profileVars = profiles[0].split('_');
    if (
      typeof profileVars === 'undefined' ||
      typeof profileVars[0] === 'undefined' ||
      profileVars[0] === 'disabled'
    ) {
      return;
    }
    const parts = profileVars[0].split('|');
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].split(':');
      if (part.length === 2) {
        switch (part[0]) {
          case 'S':
          case 'U':
            const tmpValues = part[1].split(',');
            const value = [];
            for (let j = 0; j < tmpValues.length; j++) {
              const valueAndOccurrences = tmpValues[j].split('.');
              if (valueAndOccurrences.length >= 2) {
                value.push(valueAndOccurrences[0]);
              } else {
                value.push(tmpValues[j]);
              }
              data.targeting[CATEGORIES[part[0]]] = value;
            }
            break;
          default:
            data.targeting[CATEGORIES[part[0]]] = [part[1]];
        }
      }
    }
  };

  /**
   * Sets data.targeting object with profile values.
   * @param {*} args - Profile value.
   */
  global._ttprofiles._setProfile = function (args) {
    if (args.length > 0 && args[0] !== 'disabled') {
      data.targeting['lifestyle'] = args[0].split(',');
    }
  };

  /**
   * Sets data.targeting object with custom audience values.
   * @param {*} args - Array of custom audience.
   */
  global._ttprofiles._setCustomAudience = function (args) {
    if (args.length > 1) {
      let cas = args.slice(1);
      const values = [];
      if (cas.length > 0) {
        cas = cas[0].split(',');
        for (let i = 0; i < cas.length; i++) {
          const ca = cas[i].split('_');
          if (ca[0].length > 0) {
            values.push(ca[0]);
          }
        }
      }
      if (values.length > 0) {
        data.targeting['customaudience'] = values;
      }
    }
  };

  /**
   *  It's called automatically when we load scripts.
   *  These are examples of return from apis
   *  _ttprofiles.push(['_setTTProfile', 'E:2|X:4|G:1|C:1|U:68.1.16124,55.1.16131_salvador_bahia_br_1615216037705_3216960592']);
   *  _ttprofiles.push(['_setProfile','61,64,24,52,54'])
   *  _ttprofiles.push(['_setCustomAudience','TT-0000-0','CA00000,CA00001,C00002_1234567891']);
   *  The first argument is the function name that we will call to transform and set data in data.targeting object.
   *  @param {*} args - Values to be pushed.
   */
  global._ttprofiles.push = function (args) {
    if (args.length > 1) {
      const fn = args[0];
      const fnArgs = args.slice(1);
      if (fnArgs.length > 0 && fnArgs[0].length > 0) {
        global._ttprofiles[fn](fnArgs);
      }
    }
  };

  loadScript(global, 'https://d.t.tailtarget.com/profile');

  if (data.account) {
    loadScript(
      global,
      `https://${data.account}.seg.t.tailtarget.com/ca?env=_ttprofiles`
    );
  }
}
