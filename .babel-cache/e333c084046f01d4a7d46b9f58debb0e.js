/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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
import { dict } from "../../../src/core/types/object";

/**
 * Get social share configurations by supported type.
 * @param  {string} type
 * @return {!Object}
 */
export function getSocialConfig(type) {
  return BUILTINS[type];
}

/**
 * @type {!JsonObject}
 */
var BUILTINS = dict({
  'twitter': {
    'shareEndpoint': 'https://twitter.com/intent/tweet',
    'defaultParams': {
      'text': 'TITLE',
      'url': 'CANONICAL_URL'
    }
  },
  'facebook': {
    'shareEndpoint': 'https://www.facebook.com/dialog/share',
    'defaultParams': {
      'href': 'CANONICAL_URL'
    }
  },
  'pinterest': {
    'shareEndpoint': 'https://www.pinterest.com/pin/create/button/',
    'defaultParams': {
      'url': 'CANONICAL_URL',
      'description': 'TITLE'
    }
  },
  'linkedin': {
    'shareEndpoint': 'https://www.linkedin.com/shareArticle',
    'defaultParams': {
      'url': 'CANONICAL_URL',
      'mini': 'true'
    }
  },
  'gplus': {
    'obsolete': true
  },
  'email': {
    'bindings': ['recipient'],
    'shareEndpoint': 'mailto:RECIPIENT',
    'defaultParams': {
      'subject': 'TITLE',
      'body': 'CANONICAL_URL',
      'recipient': ''
    }
  },
  'tumblr': {
    'shareEndpoint': 'https://www.tumblr.com/share/link',
    'defaultParams': {
      'name': 'TITLE',
      'url': 'CANONICAL_URL'
    }
  },
  'whatsapp': {
    'shareEndpoint': 'https://api.whatsapp.com/send',
    'defaultParams': {
      'text': 'TITLE - CANONICAL_URL'
    }
  },
  'line': {
    'shareEndpoint': 'https://social-plugins.line.me/lineit/share',
    'defaultParams': {
      'text': 'TITLE',
      'url': 'CANONICAL_URL'
    }
  },
  'sms': {
    'shareEndpoint': 'sms:',
    'defaultParams': {
      'body': 'TITLE - CANONICAL_URL'
    }
  },
  'system': {
    'shareEndpoint': 'navigator-share:',
    'defaultParams': {
      'text': 'TITLE',
      'url': 'CANONICAL_URL'
    }
  }
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFtcC1zb2NpYWwtc2hhcmUtY29uZmlnLmpzIl0sIm5hbWVzIjpbImRpY3QiLCJnZXRTb2NpYWxDb25maWciLCJ0eXBlIiwiQlVJTFRJTlMiXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUVBLFNBQVFBLElBQVI7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU8sU0FBU0MsZUFBVCxDQUF5QkMsSUFBekIsRUFBK0I7QUFDcEMsU0FBT0MsUUFBUSxDQUFDRCxJQUFELENBQWY7QUFDRDs7QUFFRDtBQUNBO0FBQ0E7QUFDQSxJQUFNQyxRQUFRLEdBQUdILElBQUksQ0FBQztBQUNwQixhQUFXO0FBQ1QscUJBQWlCLGtDQURSO0FBRVQscUJBQWlCO0FBQ2YsY0FBUSxPQURPO0FBRWYsYUFBTztBQUZRO0FBRlIsR0FEUztBQVFwQixjQUFZO0FBQ1YscUJBQWlCLHVDQURQO0FBRVYscUJBQWlCO0FBQ2YsY0FBUTtBQURPO0FBRlAsR0FSUTtBQWNwQixlQUFhO0FBQ1gscUJBQWlCLDhDQUROO0FBRVgscUJBQWlCO0FBQ2YsYUFBTyxlQURRO0FBRWYscUJBQWU7QUFGQTtBQUZOLEdBZE87QUFxQnBCLGNBQVk7QUFDVixxQkFBaUIsdUNBRFA7QUFFVixxQkFBaUI7QUFDZixhQUFPLGVBRFE7QUFFZixjQUFRO0FBRk87QUFGUCxHQXJCUTtBQTRCcEIsV0FBUztBQUNQLGdCQUFZO0FBREwsR0E1Qlc7QUErQnBCLFdBQVM7QUFDUCxnQkFBWSxDQUFDLFdBQUQsQ0FETDtBQUVQLHFCQUFpQixrQkFGVjtBQUdQLHFCQUFpQjtBQUNmLGlCQUFXLE9BREk7QUFFZixjQUFRLGVBRk87QUFHZixtQkFBYTtBQUhFO0FBSFYsR0EvQlc7QUF3Q3BCLFlBQVU7QUFDUixxQkFBaUIsbUNBRFQ7QUFFUixxQkFBaUI7QUFDZixjQUFRLE9BRE87QUFFZixhQUFPO0FBRlE7QUFGVCxHQXhDVTtBQStDcEIsY0FBWTtBQUNWLHFCQUFpQiwrQkFEUDtBQUVWLHFCQUFpQjtBQUNmLGNBQVE7QUFETztBQUZQLEdBL0NRO0FBcURwQixVQUFRO0FBQ04scUJBQWlCLDZDQURYO0FBRU4scUJBQWlCO0FBQ2YsY0FBUSxPQURPO0FBRWYsYUFBTztBQUZRO0FBRlgsR0FyRFk7QUE0RHBCLFNBQU87QUFDTCxxQkFBaUIsTUFEWjtBQUVMLHFCQUFpQjtBQUNmLGNBQVE7QUFETztBQUZaLEdBNURhO0FBa0VwQixZQUFVO0FBQ1IscUJBQWlCLGtCQURUO0FBRVIscUJBQWlCO0FBQ2YsY0FBUSxPQURPO0FBRWYsYUFBTztBQUZRO0FBRlQ7QUFsRVUsQ0FBRCxDQUFyQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMTYgVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuXG5pbXBvcnQge2RpY3R9IGZyb20gJyNjb3JlL3R5cGVzL29iamVjdCc7XG5cbi8qKlxuICogR2V0IHNvY2lhbCBzaGFyZSBjb25maWd1cmF0aW9ucyBieSBzdXBwb3J0ZWQgdHlwZS5cbiAqIEBwYXJhbSAge3N0cmluZ30gdHlwZVxuICogQHJldHVybiB7IU9iamVjdH1cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFNvY2lhbENvbmZpZyh0eXBlKSB7XG4gIHJldHVybiBCVUlMVElOU1t0eXBlXTtcbn1cblxuLyoqXG4gKiBAdHlwZSB7IUpzb25PYmplY3R9XG4gKi9cbmNvbnN0IEJVSUxUSU5TID0gZGljdCh7XG4gICd0d2l0dGVyJzoge1xuICAgICdzaGFyZUVuZHBvaW50JzogJ2h0dHBzOi8vdHdpdHRlci5jb20vaW50ZW50L3R3ZWV0JyxcbiAgICAnZGVmYXVsdFBhcmFtcyc6IHtcbiAgICAgICd0ZXh0JzogJ1RJVExFJyxcbiAgICAgICd1cmwnOiAnQ0FOT05JQ0FMX1VSTCcsXG4gICAgfSxcbiAgfSxcbiAgJ2ZhY2Vib29rJzoge1xuICAgICdzaGFyZUVuZHBvaW50JzogJ2h0dHBzOi8vd3d3LmZhY2Vib29rLmNvbS9kaWFsb2cvc2hhcmUnLFxuICAgICdkZWZhdWx0UGFyYW1zJzoge1xuICAgICAgJ2hyZWYnOiAnQ0FOT05JQ0FMX1VSTCcsXG4gICAgfSxcbiAgfSxcbiAgJ3BpbnRlcmVzdCc6IHtcbiAgICAnc2hhcmVFbmRwb2ludCc6ICdodHRwczovL3d3dy5waW50ZXJlc3QuY29tL3Bpbi9jcmVhdGUvYnV0dG9uLycsXG4gICAgJ2RlZmF1bHRQYXJhbXMnOiB7XG4gICAgICAndXJsJzogJ0NBTk9OSUNBTF9VUkwnLFxuICAgICAgJ2Rlc2NyaXB0aW9uJzogJ1RJVExFJyxcbiAgICB9LFxuICB9LFxuICAnbGlua2VkaW4nOiB7XG4gICAgJ3NoYXJlRW5kcG9pbnQnOiAnaHR0cHM6Ly93d3cubGlua2VkaW4uY29tL3NoYXJlQXJ0aWNsZScsXG4gICAgJ2RlZmF1bHRQYXJhbXMnOiB7XG4gICAgICAndXJsJzogJ0NBTk9OSUNBTF9VUkwnLFxuICAgICAgJ21pbmknOiAndHJ1ZScsXG4gICAgfSxcbiAgfSxcbiAgJ2dwbHVzJzoge1xuICAgICdvYnNvbGV0ZSc6IHRydWUsXG4gIH0sXG4gICdlbWFpbCc6IHtcbiAgICAnYmluZGluZ3MnOiBbJ3JlY2lwaWVudCddLFxuICAgICdzaGFyZUVuZHBvaW50JzogJ21haWx0bzpSRUNJUElFTlQnLFxuICAgICdkZWZhdWx0UGFyYW1zJzoge1xuICAgICAgJ3N1YmplY3QnOiAnVElUTEUnLFxuICAgICAgJ2JvZHknOiAnQ0FOT05JQ0FMX1VSTCcsXG4gICAgICAncmVjaXBpZW50JzogJycsXG4gICAgfSxcbiAgfSxcbiAgJ3R1bWJscic6IHtcbiAgICAnc2hhcmVFbmRwb2ludCc6ICdodHRwczovL3d3dy50dW1ibHIuY29tL3NoYXJlL2xpbmsnLFxuICAgICdkZWZhdWx0UGFyYW1zJzoge1xuICAgICAgJ25hbWUnOiAnVElUTEUnLFxuICAgICAgJ3VybCc6ICdDQU5PTklDQUxfVVJMJyxcbiAgICB9LFxuICB9LFxuICAnd2hhdHNhcHAnOiB7XG4gICAgJ3NoYXJlRW5kcG9pbnQnOiAnaHR0cHM6Ly9hcGkud2hhdHNhcHAuY29tL3NlbmQnLFxuICAgICdkZWZhdWx0UGFyYW1zJzoge1xuICAgICAgJ3RleHQnOiAnVElUTEUgLSBDQU5PTklDQUxfVVJMJyxcbiAgICB9LFxuICB9LFxuICAnbGluZSc6IHtcbiAgICAnc2hhcmVFbmRwb2ludCc6ICdodHRwczovL3NvY2lhbC1wbHVnaW5zLmxpbmUubWUvbGluZWl0L3NoYXJlJyxcbiAgICAnZGVmYXVsdFBhcmFtcyc6IHtcbiAgICAgICd0ZXh0JzogJ1RJVExFJyxcbiAgICAgICd1cmwnOiAnQ0FOT05JQ0FMX1VSTCcsXG4gICAgfSxcbiAgfSxcbiAgJ3Ntcyc6IHtcbiAgICAnc2hhcmVFbmRwb2ludCc6ICdzbXM6JyxcbiAgICAnZGVmYXVsdFBhcmFtcyc6IHtcbiAgICAgICdib2R5JzogJ1RJVExFIC0gQ0FOT05JQ0FMX1VSTCcsXG4gICAgfSxcbiAgfSxcbiAgJ3N5c3RlbSc6IHtcbiAgICAnc2hhcmVFbmRwb2ludCc6ICduYXZpZ2F0b3Itc2hhcmU6JyxcbiAgICAnZGVmYXVsdFBhcmFtcyc6IHtcbiAgICAgICd0ZXh0JzogJ1RJVExFJyxcbiAgICAgICd1cmwnOiAnQ0FOT05JQ0FMX1VSTCcsXG4gICAgfSxcbiAgfSxcbn0pO1xuIl19
// /Users/mszylkowski/src/amphtml/extensions/amp-social-share/0.1/amp-social-share-config.js