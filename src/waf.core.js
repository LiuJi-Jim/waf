(function($){
/**
 * @fileOverview waf.core waf核心
 * 依赖: Zepto
*/
var waf = $.extend(function(){
    // 这里写些啥好呢？
}, {
    empty: function(obj){
        if (obj == null) return true;
        if (typeof obj === 'undefined') return true;
        return false;
    },
    clone: function(obj){
        if (obj.get && obj.get(0) && obj.get(0).cloneNode){
            return $(obj.get(0).cloneNode(true));
        }
        if (waf.isA(obj)){
            return obj.slice(0);
        }
        if (waf.isO(obj)){
            return waf.extend({}, obj);
        }
    },
    noop: function(){},
    delegate: function(func, thisObj, args){
        return function(){
            return func.apply(thisObj, args);
        };
    },
    encodeHTML: function(str){
        var div = document.createElement('div');
        div.innerText = str;
        return div.innerHTML;
    },
    decodeHTML: function(div){
        var div = document.createElement('div');
        div.innerHTML = str;
        return div.innerText;
    }
});
var Events = {
    bind: function(name, callback){
        var events = name.split(/\s+/);
        if (typeof this._events === 'undefined') this._events = {};
        for(var i=0; i<events.length; ++i){
            var event = events[i], callbacks = this._events[event] || (this._events[event] = []);
            callbacks.push(callback);
        }
        return this;
    },
    unbind: function(name, callback){
        var events = name.split(/\s+/);
        if (typeof this._events === 'undefined') this._events = {};
        for(var i=0; i<events.length; ++i){
            var event = events[i], callbacks = this._events[event] || (this._events[event] = []);
            for (var j=0; j<callbacks.length; ++j){
                if (callbacks[i] === callback){
                    callbacks.splice(i, 1);
                    break;
                }
            }
        }
        return this;
    },
    one: function(name, callback){
        return this.bind(name, function(e){
            callback.call(this, e);
            this.unbind(name, arguments.callee);
        });
    },
    fire: function(name, data){
        var events = name.split(/\s+/);
        if (typeof this._events === 'undefined') this._events = {};
        for(var i=0; i<events.length; ++i){
            var event = events[i], callbacks = this._events[event] || (this._events[event] = []);
            for (var j=0; j<callbacks.length; ++j){
                callbacks[j].call(this, {
                    name: event,
                    data: data
                });
            }
        }
        return this;
    }
};
$.extend(waf, {
    Events: Events,
    extend: $.extend, // 让以后的模块可以不显式依赖Zepto也能使用部分实用方法
    isF: $.isFunction,
    isFunction: $.isFunction,
    isO: $.isObject,
    isObject: $.isObject,
    isA: $.isArray,
    isArray: $.isArray,
    each: $.each,
    map: $.map
}, Events);

window.waf = waf;
})(Zepto);