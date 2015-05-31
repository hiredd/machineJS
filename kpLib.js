var Parallel = require('paralleljs');

var bestNet = {
  jsonBackup: '',
  errorRate: 1,
  trainingTime: Infinity
};

module.exports = {
  train: function(trainingData) {
    // write the training data to the global scope for this process. 
    // This means that all our threads can access it, and we don't need to create a bunch of different copies of it. 
    process.env.trainingData = JSON.stringify(trainingData);
    multipleNetAlgo();

    // return the net itself
    // var net = kpComplete.train(trainingData); should be something they can type in. 
    // and then we'd return the fully trained net. 
    // because we can get a net from JSON. so let's do that and then return it. 
    // TODO: investigate if we need to give them a callback. does this become asynch with paralleljs?
    // return net.fromJSON(bestNet.jsonBackup);
    // TODO: return asynchronously. Maybe promisify multipleNetAlgo??
  }
};


var parallelNets = function(allParamComboArr) {
  var p = new Parallel(allParamComboArr, {synchronous: false}) //.require(netParams);
  console.log('inside parallelNets');
  console.log('p is:',p);

  p.map(function(netParams) {
    console.log('inside callback function');
    // MVP:
      // This is the minified source code for brain.js 0.6.0
      // Copying and invoking it here inside our thread ensures that we have access to it
      // I'm sure there's a better way, but this works. 
    (function(){function b(){return b}function c(b,d){var e=c.resolve(b),f=c.modules[e];if(!f)throw new Error('failed to require "'+b+'" from '+d);return f.exports||(f.exports={},f.call(f.exports,f,f.exports,c.relative(e),a)),f.exports}var a=this;c.modules={},c.resolve=function(a){var b=a,d=a+".js",e=a+"/index.js";return c.modules[d]&&d||c.modules[e]&&e||b},c.register=function(a,b){c.modules[a]=b},c.relative=function(a){return function(d){if("debug"==d)return b;if("."!=d.charAt(0))return c(d);var e=a.split("/"),f=d.split("/");e.pop();for(var g=0;g<f.length;g++){var h=f[g];".."==h?e.pop():"."!=h&&e.push(h)}return c(e.join("/"),a)}},c.register("neuralnetwork.js",function(a,b,c,d){function h(){return Math.random()*.4-.2}function i(a){var b=new Array(a);for(var c=0;c<a;c++)b[c]=0;return b}function j(a){var b=new Array(a);for(var c=0;c<a;c++)b[c]=h();return b}function k(a){var b=0;for(var c=0;c<a.length;c++)b+=Math.pow(a[c],2);return b/a.length}var e=c("underscore"),f=c("./lookup"),g=function(a){a=a||{},this.learningRate=a.learningRate||.3,this.momentum=a.momentum||.1,this.hiddenSizes=a.hiddenLayers};g.prototype={initialize:function(a){this.sizes=a,this.outputLayer=this.sizes.length-1,this.biases=[],this.weights=[],this.outputs=[],this.deltas=[],this.changes=[],this.errors=[];for(var b=0;b<=this.outputLayer;b++){var c=this.sizes[b];this.deltas[b]=i(c),this.errors[b]=i(c),this.outputs[b]=i(c);if(b>0){this.biases[b]=j(c),this.weights[b]=new Array(c),this.changes[b]=new Array(c);for(var d=0;d<c;d++){var e=this.sizes[b-1];this.weights[b][d]=j(e),this.changes[b][d]=i(e)}}}},run:function(a){this.inputLookup&&(a=f.toArray(this.inputLookup,a));var b=this.runInput(a);return this.outputLookup&&(b=f.toHash(this.outputLookup,b)),b},runInput:function(a){this.outputs[0]=a;for(var b=1;b<=this.outputLayer;b++){for(var c=0;c<this.sizes[b];c++){var d=this.weights[b][c],e=this.biases[b][c];for(var f=0;f<d.length;f++)e+=d[f]*a[f];this.outputs[b][c]=1/(1+Math.exp(-e))}var g=a=this.outputs[b]}return g},train:function(a,b){a=this.formatData(a),b=b||{};var c=b.iterations||2e4,d=b.errorThresh||.005,f=b.log||!1,g=b.logPeriod||10,h=b.callback,i=b.callbackPeriod||10,j=a[0].input.length,k=a[0].output.length,l=this.hiddenSizes;l||(l=[Math.max(3,Math.floor(j/2))]);var m=e([j,l,k]).flatten();this.initialize(m);var n=1;for(var o=0;o<c&&n>d;o++){var p=0;for(var q=0;q<a.length;q++){var r=this.trainPattern(a[q].input,a[q].output);p+=r}n=p/a.length,f&&o%g==0&&console.log("iterations:",o,"training error:",n),h&&o%i==0&&h({error:n,iterations:o})}return{error:n,iterations:o}},trainPattern:function(a,b){this.runInput(a),this.calculateDeltas(b),this.adjustWeights();var c=k(this.errors[this.outputLayer]);return c},calculateDeltas:function(a){for(var b=this.outputLayer;b>=0;b--)for(var c=0;c<this.sizes[b];c++){var d=this.outputs[b][c],e=0;if(b==this.outputLayer)e=a[c]-d;else{var f=this.deltas[b+1];for(var g=0;g<f.length;g++)e+=f[g]*this.weights[b+1][g][c]}this.errors[b][c]=e,this.deltas[b][c]=e*d*(1-d)}},adjustWeights:function(){for(var a=1;a<=this.outputLayer;a++){var b=this.outputs[a-1];for(var c=0;c<this.sizes[a];c++){var d=this.deltas[a][c];for(var e=0;e<b.length;e++){var f=this.changes[a][c][e];f=this.learningRate*d*b[e]+this.momentum*f,this.changes[a][c][e]=f,this.weights[a][c][e]+=f}this.biases[a][c]+=this.learningRate*d}}},formatData:function(a){return e(a[0].input).isArray()||(this.inputLookup||(this.inputLookup=f.buildLookup(e(a).pluck("input"))),a=a.map(function(a){var b=f.toArray(this.inputLookup,a.input);return e(e(a).clone()).extend({input:b})},this)),e(a[0].output).isArray()||(this.outputLookup||(this.outputLookup=f.buildLookup(e(a).pluck("output"))),a=a.map(function(a){var b=f.toArray(this.outputLookup,a.output);return e(e(a).clone()).extend({output:b})},this)),a},test:function(a,b){a=this.formatData(a),b=b||.5;var c=a[0].output.length==1,d=0,f=0,g=0,h=0,i=[],j=0;for(var l=0;l<a.length;l++){var m=this.runInput(a[l].input),n=a[l].output,o,p;c?(o=m[0]>b?1:0,p=n[0]):(o=m.indexOf(e(m).max()),p=n.indexOf(e(n).max()));if(o!=p){var q=a[l];e(q).extend({actual:o,expected:p}),i.push(q)}c&&(o==0&&p==0?h++:o==1&&p==1?g++:o==0&&p==1?f++:o==1&&p==0&&d++);var r=m.map(function(a,b){return n[b]-a});j+=k(r)}var s=j/a.length,t={error:s,misclasses:i};return c&&e(t).extend({trueNeg:h,truePos:g,falseNeg:f,falsePos:d,total:a.length,precision:g/(g+d),recall:g/(g+f),accuracy:(h+g)/a.length}),t},toJSON:function(){var a=[];for(var b=0;b<=this.outputLayer;b++){a[b]={};var c;b==0&&this.inputLookup?c=e(this.inputLookup).keys():b==this.outputLayer&&this.outputLookup?c=e(this.outputLookup).keys():c=e.range(0,this.sizes[b]);for(var d=0;d<c.length;d++){var f=c[d];a[b][f]={};if(b>0){a[b][f].bias=this.biases[b][d],a[b][f].weights={};for(var g in a[b-1]){var h=g;b==1&&this.inputLookup&&(h=this.inputLookup[g]),a[b][f].weights[g]=this.weights[b][d][h]}}}}return{layers:a}},fromJSON:function(a){var b=a.layers.length;this.outputLayer=b-1,this.sizes=new Array(b),this.weights=new Array(b),this.biases=new Array(b),this.outputs=new Array(b);for(var c=0;c<=this.outputLayer;c++){var d=a.layers[c];c==0&&!d[0]?this.inputLookup=f.lookupFromHash(d):c==this.outputLayer&&!d[0]&&(this.outputLookup=f.lookupFromHash(d));var g=e(d).keys();this.sizes[c]=g.length,this.weights[c]=[],this.biases[c]=[],this.outputs[c]=[];for(var h in g){var i=g[h];this.biases[c][h]=d[i].bias,this.weights[c][h]=e(d[i].weights).toArray()}}return this},toFunction:function(){var a=this.toJSON();return new Function("inputs","  var net = "+JSON.stringify(a)+";\n\n  for(var i = 1; i < net.layers.length; i++) {\n    var layer = net.layers[i];\n    var outputs = {};\n    for(var id in layer) {\n      var node = layer[id];\n      var sum = node.bias;\n      for(var iid in node.weights)\n        sum += node.weights[iid] * inputs[iid];\n      outputs[id] = (1/(1 + Math.exp(-sum)));\n    }\n    inputs = outputs;\n  }\n  return outputs;")}},b.NeuralNetwork=g}),c.register("lookup.js",function(a,b,c,d){function f(a){var b=e(a).reduce(function(a,b){return e(a).extend(b)},{});return g(b)}function g(a){var b={},c=0;for(var d in a)b[d]=c++;return b}function h(a,b){var c=[];for(var d in a)c[a[d]]=b[d]||0;return c}function i(a,b){var c={};for(var d in a)c[d]=b[a[d]];return c}var e=c("underscore");a.exports={buildLookup:f,lookupFromHash:g,toArray:h,toHash:i}}),c.register("underscore",function(a,b,c,d){(function(){function C(a,b,c){if(a===b)return a!==0||1/a==1/b;if(a==null||b==null)return a===b;a._chain&&(a=a._wrapped),b._chain&&(b=b._wrapped);if(a.isEqual&&y.isFunction(a.isEqual))return a.isEqual(b);if(b.isEqual&&y.isFunction(b.isEqual))return b.isEqual(a);var d=k.call(a);if(d!=k.call(b))return!1;switch(d){case"[object String]":return a==String(b);case"[object Number]":return a!=+a?b!=+b:a==0?1/a==1/b:a==+b;case"[object Date]":case"[object Boolean]":return+a==+b;case"[object RegExp]":return a.source==b.source&&a.global==b.global&&a.multiline==b.multiline&&a.ignoreCase==b.ignoreCase}if(typeof a!="object"||typeof b!="object")return!1;var e=c.length;while(e--)if(c[e]==a)return!0;c.push(a);var f=0,g=!0;if(d=="[object Array]"){f=a.length,g=f==b.length;if(g)while(f--)if(!(g=f in a==f in b&&C(a[f],b[f],c)))break}else{if("constructor"in a!="constructor"in b||a.constructor!=b.constructor)return!1;for(var h in a)if(y.has(a,h)){f++;if(!(g=y.has(b,h)&&C(a[h],b[h],c)))break}if(g){for(h in b)if(y.has(b,h)&&!(f--))break;g=!f}}return c.pop(),g}var c=this,d=c._,e={},f=Array.prototype,g=Object.prototype,h=Function.prototype,i=f.slice,j=f.unshift,k=g.toString,l=g.hasOwnProperty,m=f.forEach,n=f.map,o=f.reduce,p=f.reduceRight,q=f.filter,r=f.every,s=f.some,t=f.indexOf,u=f.lastIndexOf,v=Array.isArray,w=Object.keys,x=h.bind,y=function(a){return new K(a)};typeof b!="undefined"?(typeof a!="undefined"&&a.exports&&(b=a.exports=y),b._=y):c._=y,y.VERSION="1.3.3";var z=y.each=y.forEach=function(a,b,c){if(a==null)return;if(m&&a.forEach===m)a.forEach(b,c);else if(a.length===+a.length){for(var d=0,f=a.length;d<f;d++)if(d in a&&b.call(c,a[d],d,a)===e)return}else for(var g in a)if(y.has(a,g)&&b.call(c,a[g],g,a)===e)return};y.map=y.collect=function(a,b,c){var d=[];return a==null?d:n&&a.map===n?a.map(b,c):(z(a,function(a,e,f){d[d.length]=b.call(c,a,e,f)}),a.length===+a.length&&(d.length=a.length),d)},y.reduce=y.foldl=y.inject=function(a,b,c,d){var e=arguments.length>2;a==null&&(a=[]);if(o&&a.reduce===o)return d&&(b=y.bind(b,d)),e?a.reduce(b,c):a.reduce(b);z(a,function(a,f,g){e?c=b.call(d,c,a,f,g):(c=a,e=!0)});if(!e)throw new TypeError("Reduce of empty array with no initial value");return c},y.reduceRight=y.foldr=function(a,b,c,d){var e=arguments.length>2;a==null&&(a=[]);if(p&&a.reduceRight===p)return d&&(b=y.bind(b,d)),e?a.reduceRight(b,c):a.reduceRight(b);var f=y.toArray(a).reverse();return d&&!e&&(b=y.bind(b,d)),e?y.reduce(f,b,c,d):y.reduce(f,b)},y.find=y.detect=function(a,b,c){var d;return A(a,function(a,e,f){if(b.call(c,a,e,f))return d=a,!0}),d},y.filter=y.select=function(a,b,c){var d=[];return a==null?d:q&&a.filter===q?a.filter(b,c):(z(a,function(a,e,f){b.call(c,a,e,f)&&(d[d.length]=a)}),d)},y.reject=function(a,b,c){var d=[];return a==null?d:(z(a,function(a,e,f){b.call(c,a,e,f)||(d[d.length]=a)}),d)},y.every=y.all=function(a,b,c){var d=!0;return a==null?d:r&&a.every===r?a.every(b,c):(z(a,function(a,f,g){if(!(d=d&&b.call(c,a,f,g)))return e}),!!d)};var A=y.some=y.any=function(a,b,c){b||(b=y.identity);var d=!1;return a==null?d:s&&a.some===s?a.some(b,c):(z(a,function(a,f,g){if(d||(d=b.call(c,a,f,g)))return e}),!!d)};y.include=y.contains=function(a,b){var c=!1;return a==null?c:t&&a.indexOf===t?a.indexOf(b)!=-1:(c=A(a,function(a){return a===b}),c)},y.invoke=function(a,b){var c=i.call(arguments,2);return y.map(a,function(a){return(y.isFunction(b)?b||a:a[b]).apply(a,c)})},y.pluck=function(a,b){return y.map(a,function(a){return a[b]})},y.max=function(a,b,c){if(!b&&y.isArray(a)&&a[0]===+a[0])return Math.max.apply(Math,a);if(!b&&y.isEmpty(a))return-Infinity;var d={computed:-Infinity};return z(a,function(a,e,f){var g=b?b.call(c,a,e,f):a;g>=d.computed&&(d={value:a,computed:g})}),d.value},y.min=function(a,b,c){if(!b&&y.isArray(a)&&a[0]===+a[0])return Math.min.apply(Math,a);if(!b&&y.isEmpty(a))return Infinity;var d={computed:Infinity};return z(a,function(a,e,f){var g=b?b.call(c,a,e,f):a;g<d.computed&&(d={value:a,computed:g})}),d.value},y.shuffle=function(a){var b=[],c;return z(a,function(a,d,e){c=Math.floor(Math.random()*(d+1)),b[d]=b[c],b[c]=a}),b},y.sortBy=function(a,b,c){var d=y.isFunction(b)?b:function(a){return a[b]};return y.pluck(y.map(a,function(a,b,e){return{value:a,criteria:d.call(c,a,b,e)}}).sort(function(a,b){var c=a.criteria,d=b.criteria;return c===void 0?1:d===void 0?-1:c<d?-1:c>d?1:0}),"value")},y.groupBy=function(a,b){var c={},d=y.isFunction(b)?b:function(a){return a[b]};return z(a,function(a,b){var e=d(a,b);(c[e]||(c[e]=[])).push(a)}),c},y.sortedIndex=function(a,b,c){c||(c=y.identity);var d=0,e=a.length;while(d<e){var f=d+e>>1;c(a[f])<c(b)?d=f+1:e=f}return d},y.toArray=function(a){return a?y.isArray(a)?i.call(a):y.isArguments(a)?i.call(a):a.toArray&&y.isFunction(a.toArray)?a.toArray():y.values(a):[]},y.size=function(a){return y.isArray(a)?a.length:y.keys(a).length},y.first=y.head=y.take=function(a,b,c){return b!=null&&!c?i.call(a,0,b):a[0]},y.initial=function(a,b,c){return i.call(a,0,a.length-(b==null||c?1:b))},y.last=function(a,b,c){return b!=null&&!c?i.call(a,Math.max(a.length-b,0)):a[a.length-1]},y.rest=y.tail=function(a,b,c){return i.call(a,b==null||c?1:b)},y.compact=function(a){return y.filter(a,function(a){return!!a})},y.flatten=function(a,b){return y.reduce(a,function(a,c){return y.isArray(c)?a.concat(b?c:y.flatten(c)):(a[a.length]=c,a)},[])},y.without=function(a){return y.difference(a,i.call(arguments,1))},y.uniq=y.unique=function(a,b,c){var d=c?y.map(a,c):a,e=[];return a.length<3&&(b=!0),y.reduce(d,function(c,d,f){if(b?y.last(c)!==d||!c.length:!y.include(c,d))c.push(d),e.push(a[f]);return c},[]),e},y.union=function(){return y.uniq(y.flatten(arguments,!0))},y.intersection=y.intersect=function(a){var b=i.call(arguments,1);return y.filter(y.uniq(a),function(a){return y.every(b,function(b){return y.indexOf(b,a)>=0})})},y.difference=function(a){var b=y.flatten(i.call(arguments,1),!0);return y.filter(a,function(a){return!y.include(b,a)})},y.zip=function(){var a=i.call(arguments),b=y.max(y.pluck(a,"length")),c=new Array(b);for(var d=0;d<b;d++)c[d]=y.pluck(a,""+d);return c},y.indexOf=function(a,b,c){if(a==null)return-1;var d,e;if(c)return d=y.sortedIndex(a,b),a[d]===b?d:-1;if(t&&a.indexOf===t)return a.indexOf(b);for(d=0,e=a.length;d<e;d++)if(d in a&&a[d]===b)return d;return-1},y.lastIndexOf=function(a,b){if(a==null)return-1;if(u&&a.lastIndexOf===u)return a.lastIndexOf(b);var c=a.length;while(c--)if(c in a&&a[c]===b)return c;return-1},y.range=function(a,b,c){arguments.length<=1&&(b=a||0,a=0),c=arguments[2]||1;var d=Math.max(Math.ceil((b-a)/c),0),e=0,f=new Array(d);while(e<d)f[e++]=a,a+=c;return f};var B=function(){};y.bind=function(b,c){var d,e;if(b.bind===x&&x)return x.apply(b,i.call(arguments,1));if(!y.isFunction(b))throw new TypeError;return e=i.call(arguments,2),d=function(){if(this instanceof d){B.prototype=b.prototype;var a=new B,f=b.apply(a,e.concat(i.call(arguments)));return Object(f)===f?f:a}return b.apply(c,e.concat(i.call(arguments)))}},y.bindAll=function(a){var b=i.call(arguments,1);return b.length==0&&(b=y.functions(a)),z(b,function(b){a[b]=y.bind(a[b],a)}),a},y.memoize=function(a,b){var c={};return b||(b=y.identity),function(){var d=b.apply(this,arguments);return y.has(c,d)?c[d]:c[d]=a.apply(this,arguments)}},y.delay=function(a,b){var c=i.call(arguments,2);return setTimeout(function(){return a.apply(null,c)},b)},y.defer=function(a){return y.delay.apply(y,[a,1].concat(i.call(arguments,1)))},y.throttle=function(a,b){var c,d,e,f,g,h,i=y.debounce(function(){g=f=!1},b);return function(){c=this,d=arguments;var j=function(){e=null,g&&a.apply(c,d),i()};return e||(e=setTimeout(j,b)),f?g=!0:h=a.apply(c,d),i(),f=!0,h}},y.debounce=function(a,b,c){var d;return function(){var e=this,f=arguments,g=function(){d=null,c||a.apply(e,f)};c&&!d&&a.apply(e,f),clearTimeout(d),d=setTimeout(g,b)}},y.once=function(a){var b=!1,c;return function(){return b?c:(b=!0,c=a.apply(this,arguments))}},y.wrap=function(a,b){return function(){var c=[a].concat(i.call(arguments,0));return b.apply(this,c)}},y.compose=function(){var a=arguments;return function(){var b=arguments;for(var c=a.length-1;c>=0;c--)b=[a[c].apply(this,b)];return b[0]}},y.after=function(a,b){return a<=0?b():function(){if(--a<1)return b.apply(this,arguments)}},y.keys=w||function(a){if(a!==Object(a))throw new TypeError("Invalid object");var b=[];for(var c in a)y.has(a,c)&&(b[b.length]=c);return b},y.values=function(a){return y.map(a,y.identity)},y.functions=y.methods=function(a){var b=[];for(var c in a)y.isFunction(a[c])&&b.push(c);return b.sort()},y.extend=function(a){return z(i.call(arguments,1),function(b){for(var c in b)a[c]=b[c]}),a},y.pick=function(a){var b={};return z(y.flatten(i.call(arguments,1)),function(c){c in a&&(b[c]=a[c])}),b},y.defaults=function(a){return z(i.call(arguments,1),function(b){for(var c in b)a[c]==null&&(a[c]=b[c])}),a},y.clone=function(a){return y.isObject(a)?y.isArray(a)?a.slice():y.extend({},a):a},y.tap=function(a,b){return b(a),a},y.isEqual=function(a,b){return C(a,b,[])},y.isEmpty=function(a){if(a==null)return!0;if(y.isArray(a)||y.isString(a))return a.length===0;for(var b in a)if(y.has(a,b))return!1;return!0},y.isElement=function(a){return!!a&&a.nodeType==1},y.isArray=v||function(a){return k.call(a)=="[object Array]"},y.isObject=function(a){return a===Object(a)},y.isArguments=function(a){return k.call(a)=="[object Arguments]"},y.isArguments(arguments)||(y.isArguments=function(a){return!!a&&!!y.has(a,"callee")}),y.isFunction=function(a){return k.call(a)=="[object Function]"},y.isString=function(a){return k.call(a)=="[object String]"},y.isNumber=function(a){return k.call(a)=="[object Number]"},y.isFinite=function(a){return y.isNumber(a)&&isFinite(a)},y.isNaN=function(a){return a!==a},y.isBoolean=function(a){return a===!0||a===!1||k.call(a)=="[object Boolean]"},y.isDate=function(a){return k.call(a)=="[object Date]"},y.isRegExp=function(a){return k.call(a)=="[object RegExp]"},y.isNull=function(a){return a===null},y.isUndefined=function(a){return a===void 0},y.has=function(a,b){return l.call(a,b)},y.noConflict=function(){return c._=d,this},y.identity=function(a){return a},y.times=function(a,b,c){for(var d=0;d<a;d++)b.call(c,d)},y.escape=function(a){return(""+a).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;").replace(/\//g,"&#x2F;")},y.result=function(a,b){if(a==null)return null;var c=a[b];return y.isFunction(c)?c.call(a):c},y.mixin=function(a){z(y.functions(a),function(b){M(b,y[b]=a[b])})};var D=0;y.uniqueId=function(a){var b=D++;return a?a+b:b},y.templateSettings={evaluate:/<%([\s\S]+?)%>/g,interpolate:/<%=([\s\S]+?)%>/g,escape:/<%-([\s\S]+?)%>/g};var E=/.^/,F={"\\":"\\","'":"'",r:"\r",n:"\n",t:"  ",u2028:"\u2028",u2029:"\u2029"};for(var G in F)F[F[G]]=G;var H=/\\|'|\r|\n|\t|\u2028|\u2029/g,I=/\\(\\|'|r|n|t|u2028|u2029)/g,J=function(a){return a.replace(I,function(a,b){return F[b]})};y.template=function(a,b,c){c=y.defaults(c||{},y.templateSettings);var d="__p+='"+a.replace(H,function(a){return"\\"+F[a]}).replace(c.escape||E,function(a,b){return"'+\n_.escape("+J(b)+")+\n'"}).replace(c.interpolate||E,function(a,b){return"'+\n("+J(b)+")+\n'"}).replace(c.evaluate||E,function(a,b){return"';\n"+J(b)+"\n;__p+='"})+"';\n";c.variable||(d="with(obj||{}){\n"+d+"}\n"),d="var __p='';var print=function(){__p+=Array.prototype.join.call(arguments, '')};\n"+d+"return __p;\n";var e=new Function(c.variable||"obj","_",d);if(b)return e(b,y);var f=function(a){return e.call(this,a,y)};return f.source="function("+(c.variable||"obj")+"){\n"+d+"}",f},y.chain=function(a){return y(a).chain()};var K=function(a){this._wrapped=a};y.prototype=K.prototype;var L=function(a,b){return b?y(a).chain():a},M=function(a,b){K.prototype[a]=function(){var a=i.call(arguments);return j.call(a,this._wrapped),L(b.apply(y,a),this._chain)}};y.mixin(y),z(["pop","push","reverse","shift","sort","splice","unshift"],function(a){var b=f[a];K.prototype[a]=function(){var c=this._wrapped;b.apply(c,arguments);var d=c.length;return(a=="shift"||a=="splice")&&d===0&&delete c[0],L(c,this._chain)}}),z(["concat","join","slice"],function(a){var b=f[a];K.prototype[a]=function(){return L(b.apply(this._wrapped,arguments),this._chain)}}),K.prototype.chain=function(){return this._chain=!0,this},K.prototype.value=function(){return this._wrapped}}).call(this)}),brain=c("neuralnetwork.js")})();


    console.log('inside callback func inside map inside paralleljs');
    var net = new brain.NeuralNetwork({
      hiddenLayers: netParams.hiddenLayers,
      learningRate: 0.6
    });

    

    var trainingResults = net.train(JSON.parse(process.env.trainingData), netParams.trainingObj);
    console.log('trainingResults is:',trainingResults);

    // bestNetChecker(trainingResults, net);
    // TODO: return an object that has properties for the netParams, trainingResults, and the fully trained net as well. 
    return {
      trainingResults:trainingResults,
      net: net,
      netParams: netParams
    };
  }).then(function() {
    console.log('arguemnts passed to .then from p.map');
    console.log(arguments);
    // TODO: either return a promise or invoke our recursive function again to get a new set of params. 
  });

};


var bestNetChecker = function(trainingResults,trainedNet) {
  console.log('checking if this is the best net');
  if(trainingResults.error < bestNet.errorRate) {
    //TODO: make this the best net
    bestNet.jsonBackup = trainedNet.toJSON();
    bestNet.errorRate = trainingResults.error;
  }
  //check against our global bestNet
  console.log('bestNet now is:',bestNet);
  // TODO: build in logic to see if we've trained all the nets
  // TODO: more logging, perhaps? Let the user know once every 5 nets that something's going on?
  // TODO: write each new bestNet to a file. 
    // TODO: figure out how to not fail if the user stops the program mid-file-write
      // I'm thinking we write to a backup file first, then overwrite the main file, or rename the backup file to be the same name as the main file. 
};

var multipleNetAlgo = function() {
  // TODO: 
    // nest everything inside a recursive function
    // that function will recurse until we've covered the entire space and converged on an answer
    // each iteration will create a new set of params we want to test against
    // we will then invoke parallelNets, which will take in an array of params we want to try, and return a promise. 
    // once we get the promise back, we'll invoke the recursive function again
    // that recursive function will then perform some logic, find a new set of params to train against, and then invoke parallelNets...
    // Yeah, Katrina for sure gets the challenging part. 
    // That'll be a ton of fun for her :)
  console.log('inside multipleNetAlgo');
  //create logic for training as many nets as we need. 
  // TODO: refactor this to use map instead
  var allParamComboArr = [];
  for(var i = 8; i > 0; i--) {

    var hlArray = [];
    for (var j = 0; j < i; j++) {
      hlArray.push(10);
    }

    var trainingObj = {
      errorThresh: 0.05,  // error threshold to reach
      iterations: 1000,   // maximum training iterations
      log: true,           // console.log() progress periodically
      logPeriod: 50,       // number of iterations between logging
      learningRate: 0.6    // learning rate
    };

    allParamComboArr.push({hiddenLayers: hlArray, trainingObj: trainingObj});
  }
  console.log('allParamComboArr:',allParamComboArr);
  console.log('i:',i);
  parallelNets(allParamComboArr);
};
