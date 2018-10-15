export const UPSCORE_CONFIG = /**@type {!JsonObject} */({
    'requests':{
        'host':'https://hit-pool.upscore.com/amp?',
        'basePrefix':'u_id=${clientId(upscore)}&'+
            'hit_id=${pageViewId}&'+
            'scTop=${scrollTop}&'+
            'scHeight=${scrollHeight}&'+
            'vHeight=${viewportHeight}&'+
            'domain=${domain}&'+
            'load=${domInteractiveTime}&'+
            'timespent=${totalEngagedTime}',
        'initialHit':'author=${author}&'+
            'creator=${creator}&'+
            'o_id=${object_id}&'+
            'o_type=${object_type}&'+
            'pubdate=${pubdate}&'+
            'ref=${documentReferrer}&'+
            'section=${section}&'+
            'url=${ampdocUrl}&'+
            'agent=${userAgent}&'+
            'u_id=${clientId(upscore)}&'+
            'location=${ampGeo(ISOCountry)}',
        'finalbeat':'${host}${basePrefix}&type=final',
        'heartbeat':'${host}${basePrefix}&type=pulse',
        'pageview':'${host}${basePrefix}&${initialHit}&type=init'
        
    },
    'triggers':{
        'initHit':{
            'on':'visible',
            'request':'pageview'
        },
        'pulse':{
            'on': 'timer',
            'timerSpec':{
                'interval':10,
                'immediate':false,
                'stopSpec':{
                    'on':'hidden'
                }
            },
            'request': 'heartbeat'
        },
        'final':{
            'on': 'hidden',
            'visibilitySpec':{
                'totalTimeMin':5000
            },
            'request':'finalbeat'
        }
    },
    'transport': {
        'beacon': true,
        'xhrpost': true,
        'image': false
    },
});