(function(waf){
/**
 * @fileOverview waf.router 路由模块
 * 依赖: waf.core, waf.history, waf.parseUrl
 * 备注: 在用了Router以后就不再建议使用History，因为Router是对History的一层封装；同时我很纠结要不要在路由里保留hash完整的from和to，还是只管to。
*/

/**
 * @name filterCallback
 * @param {Object} url 路由的Url信息
 * @returns {Boolean} 是否满足过滤条件
 */
 
var Router = waf.Router = $.extend({
    /**
     * @public
     * @name navigate
     * @param {String} hash 要导航到的hash
     * @returns {Router} waf.Router链式调用
     * @description 主动将程序导航到某个地方，会产生一条历史记录
     */
    navigate: function(hash){
        var me = Router;
        if (typeof hash !== 'string') return me.navigate(hash.to);
        waf.History.push(hash); // 添加一条历史记录，会造成pop，于是不用再手动me._goto了
        
        return me;
    },
    _routes: [],
    _makeFilter: function(rules){
        var me = Router, filters = [];
        if (!waf.empty(rules.handler)){
            // 限定handler
            filters.push(function(url){
                return url.handler === rules.handler;
            });
        }
        if (waf.isA(rules.exists)){
            // 限定某些参数存在
            var exists = rules.exists;
            filters.push(function(url){
                for(var i=0; i<exists.length; ++i){
                    var key = exists[i];
                    if (waf.empty(url.params[key])) return false;
                }
                return true;
            });
        }
        if (waf.isO(rules.params)){
            // 限定某些参数值
            var params = rules.params;
            filters.push(function(url){
                for(var key in params){
                    var expected = params[key], real = url.params[key];
                    if (expected != real) return false;
                }
                return true;
            });
        }
        if (waf.isF(rules.custom)){
            // 自定义函数，返回true/false
            filters.push(rules.custom);
        }
        if (filters.length == 0) throw '无效的路由规则';
        return function(url){
            for(var i=0; i< filters.length; ++i){
                if (!filters[i].call(me, url)) return false; // 只要有一条失败，则算不匹配
            }
            return true;
        };
    },
    _makeHandler: function(handler){
        var me = Router, callback = handler.callback, params = handler.params, thisObj = handler.thisObj || me;
        if (waf.empty(params)){
            // 不指定参数，则把整个Url传入callback
            return function(url){
                callback.call(thisObj, url);
            };
        }
        if (waf.isA(params)){
            // 给个数组，则把对应名字的参数按顺序传入
            return function(url){
                var realParams = waf.map(params, function(key){
                    return url.params[key];
                });
                callback.apply(thisObj, realParams);
            }
        }
    },
    _routeOne: function(key, val){
        var me = Router, index = 0, routes = me._routes;
        for (index = 0; index < routes.length; ++index){
            // 查找重名的
            if (routes[index].name === key) break;
        }
        if (waf.isF(val)){
            // 传入个方法，直接就作为路由方法
            routes[index] = { name:key, func:val };
            return;
        }
        var filter = me._makeFilter(val.rules), // 按照规则构造一个过滤函数
            handler = me._makeHandler(val.handler); // 按照规则构造一个handler函数
        
        routes[index] = {
            name: key,
            func: function(url){
                if (filter.call(me, url)) {
                    setTimeout(function(){
                        handler.call(me, url);
                    }, 0); // 把handler搞成异步的
                    return true;
                }
                return false;
            }
        };
    },
    /*
        添加路由
        传入一个参数则需要是对象，e.g. {
            name: {
                rules: {
                    handler: String? // 限定handler
                    exists: Array(String)?, // 限定某个参数存在
                    params: KV(String-String)?, // 限定某些参数的值
                    custom: Function(bool)? // 自定义一个函数，返回true/false
                },
                handler: {
                    callback: Function, // 定义处理这个路由的方法
                    thisObj: Any?, // 为路由指定this，不写则为waf.Router
                    params: Array? //按Array中顺序排列对应名字的params作为方法参数；不指定则将路由的整个url作为参数
                }
            }, // 如果该值是一个Function(bool)，则为自定义路由，直接在此方法里完成对应回调
            ...
        }
        传入两个参数则认为是添加一条路由
    */
    /**
     * @public
     * @name route
     * @param {Object} routes 传入KV组合或两个参数[Key, Value]
     * @returns {Router} waf.Router链式调用
     * @description 添加路由信息，重名会覆盖原有的，后添加的优先级高
     */
    route: function(routes){
        var me = Router;
        if (arguments.length == 2){
            return me._routeOne(arguments[0], arguments[1]);
        }
        for(var key in routes){
            me._routeOne(key, routes[key]);
        }
    },
    /**
     * @private
     * @name _goto
     * @param {String} hash 需要执行的hash
     * @returns {Router} waf.Router链式调用
     * @description 查找符合条件的路由规则，执行之，不会产生历史记录
     */
    _goto: function(hash){
        var me = Router, routes = me._routes,
            hashInfo = waf.parseHash(hash); // 解析hash
        for(var i=routes.length-1; i>=0; --i){
            // 从后往前遍历路由规则，这样后加入的优先级高
            var route = me._routes[i], name = route.name, func = route.func;
            if (func.call(me, hashInfo)){
                break;
            }
        }
        return me;
    },
    _init: function(){
        var me = Router;
        me.route('_default', function(url){
            // 添加一条默认路由，优先级最低，啥也不干
            return true;
        });
    },
    init: function(){
        var me = Router, hash = me._initHash;
        waf.History.bind('pop init', function(e){
            // 用户调用初始化函数，开始正式响应history事件
            me._goto(e.data.to);
        })
        return me;
    }
});
Router._init();

})(waf);