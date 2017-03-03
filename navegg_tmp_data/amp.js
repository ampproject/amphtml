"use strict";
window.AMPNavegg = function(cnf){

    this.include = function(src){
        var p   = d.getElementsByTagName('script')[0];
        var c   = document.createElement('script');
        c.type  = "text/javascript";
        c.src   = src;
        c.async = true;
        p.parentNode.insertBefore(c, p);
    };

    this.load = function(){
        var tmp, profile = w.localStorage.getItem(this.ls_obj);
        if(!profile) return this.callUsr();
        tmp = profile.split("_");
        profile = tmp[0];
        if(profile.search(/\|/)>=0){
            profile = profile.split("|");
            this.syn = profile[1];
            profile = profile[0];
        }
        this.usr = profile;
        this.ctrl = tmp[1];
        if(tmp[2]) this.parsePersona(tmp[2]);
        if(this.ctrl!=this.datestr() || this.debug) return this.callUsr();

    };

    this.getData = function(){
        this.pResolve('resolvi ja simmmm o/');
        console.log('porem eu quero fazer algo mais aqui');
    };

    if(!cnf.acc){
        console.error('acc missed');
        return;
    };

    this.acc = cnf.acc;
    this.seg = "gender age education marital income city region country connection brand product interest career cluster prolook custom industry everybuyer".split(" ");/* segment positions */
    this.beacon = typeof(navigator.sendBeacon) == 'function' ?navigator.sendBeacon.bind(navigator):this.include.bind(this);
    this.ls_obj = 'nvg'+this.acc;
    var that = window['nvg'+this.acc] = this;
    
    return new Promise(function(resolve, reject){
        that.pResolve = resolve;
        that.pReject = reject;
        //resolve(nvg.getData());
    })

}
