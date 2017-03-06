"use strict";
window.AMPNavegg = function(cnf){

    this.include = function(src){
        var p   = document.getElementsByTagName('script')[0];
        var c   = document.createElement('script');
        c.type  = "text/javascript";
        c.src   = src;
        c.async = true;
        p.parentNode.insertBefore(c, p);
    };

    this.datestr = function(){
      var now = new Date();
      var start = new Date(now.getFullYear(), 0, 0);
      var diff = now - start;
      var oneDay = 1000 * 60 * 60 * 24;
      return Math.ceil(diff / oneDay).toString();
    };

    this.serializeParams = function(sparms){
        return Object.keys(sparms).reduce(function(a,k){a.push(k+'='+encodeURIComponent(sparms[k]));return a},[]).join('&');
    };

    this.callUsr = function(){
        var qry, parms = {};
        parms['v'] = this.version;
        parms['acc'] = this.acc;
        parms['wst'] = '0';
        if(this.usr){
            parms['id'] = this.usr;
        }
        else{
            parms['new'] = 1;
        }
        this.include(this.serverDomain+'/usr?'+this.serializeParams(parms));
    };

    this.profile = function(id, data){
        if(id)this.usr=id;
        window.localStorage.setItem(this.ls_obj,
            [
            this.usr+'|'+this.syn,
            this.datestr(),
            data
            ].join('_')
        );
        this.parsePersona(data);
        this.pResolve(this.persona);
    };

    this.getProfile = function(){
        var that = this;
        return new Promise(function(resolve, reject){
            that.pResolve = resolve;

            var tmp, profile = window.localStorage.getItem(that.ls_obj);
            if(!profile){ console.log('nao tem profile, chamando calUser'); return that.callUsr();}
            tmp = profile.split("_");
            profile = tmp[0];
            if(profile.search(/\|/)>=0){
                profile = profile.split("|");
                that.syn = profile[1];
                profile = profile[0];
            }
            that.usr = profile;
            that.ctrl = tmp[1];
            if(tmp[2]) that.parsePersona(tmp[2]);
            console.log('tem persona, resolve');
            resolve(that.persona);
            if(that.ctrl!=that.datestr()) {console.log('tem dados porem desatualizados, chamando callUsr');return that.callUsr();}


        })
    };

    this.parsePersona = function(data){
        var k, tmp = data.split(":");
        for(k=0;k<=this.seg.length;k++){
            if(tmp[k]) this.persona[this.seg[k]] = tmp[k].split("-");
        }
    };

    if(!cnf.acc){
        console.error('acc missed');
        return;
    };

    this.version = 10;
    this.syn = '0';
    this.acc = cnf.acc;
    this.persona = {};
    this.serverDomain = '//usr.navdmp.com';
    this.seg = "gender age education marital income city region country connection brand product interest career cluster prolook custom industry everybuyer".split(" ");/* segment positions */
    this.beacon = typeof(navigator.sendBeacon) == 'function' ?navigator.sendBeacon.bind(navigator):this.include.bind(this);
    this.ls_obj = 'nvg'+this.acc;
    window['nvg'+this.acc] = this;
    return this;

}
