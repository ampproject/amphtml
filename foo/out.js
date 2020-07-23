console.log("Hello, World!");var b=function(){return 6};function remove(a,f){for(var e=[],b=0,c=0;c<a.length;c++){var d=a[c];f(d,c,a)?e.push(d):(b<c&&(a[b]=d),b++)}b<a.length&&(a.length=b);return e};
