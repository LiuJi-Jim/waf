(function(waf, $){
/**
 * @fileOverview waf.history 历史记录模块
 * 依赖: waf.core
 * 备注: 很纠结要不要使用pushState, popstate系列来写
*/
var History = waf.History = $.extend({
    _fixHash: function(hash){
        if (hash.length == 0 || hash[0] != '#') hash = '#' + hash;
        return hash;
    },
    _setHash: function(hash){
        var me = History;
        hash = me._fixHash(hash);
        me.hash = hash;
    },
    /**
     * @name push
     * @description向浏览器添加一条历史记录	
    */
    push: function(hash){
        var me = History, oldHash = me.hash;
        me._setHash(hash);
        window.history.pushState({}, hash, me.hash);
        me.fire('pop', {
            from: oldHash,
            to: me.hash
        });
    },
    _onpop: function(e){
        var me = History, oldHash = me.hash;
        me._setHash(location.hash);
        me.fire('pop', {
            from: oldHash,
            to: me.hash
        });
    },
    _init: function(){
        var me = History, hash = me._fixHash(location.hash);
        $(window).one('popstate', function(){
            me._setHash(hash);
            me.fire('init', {
                from:hash, to:hash
            });
            $(window).bind('popstate', me._onpop);
        });
    }
}, waf.Events);
History._init();

})(waf, Zepto);