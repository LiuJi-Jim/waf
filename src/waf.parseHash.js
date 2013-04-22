(function(waf){
/**
 * @fileOverview waf.parseHash
 * 依赖: waf.core
 * 备注: 解析Hash中携带的参数
*/

// 从一个“等式”里解析出东西来
// 可以是只有左边，没有右边的
var parseEquation = (function(){
    var equal = /^(.+?)(?:=(.*?))?$/;
    return function(str){
        var pair = str.match(equal);
        if (pair){
            var key = pair[1], val = pair[2];
            if (waf.empty(val)) val = '';
            return {
                key: key,
                val: decodeURIComponent(val)
            };
        }
        return false;
    };
})();

// 从path中解析参数，path格式支持baidu的'/aaa=bbb/ccc=ddd/s'格式
// 最后一个东西会被理解为handler，为空时handler为'/'
var parsePath = (function(){
    var slash = /\//;
    return function(path){
        var array = path.split(slash), result = { handler:'/', params:{} };
        for (var i=0; i<array.length; ++i){
            var ret = parseEquation(array[i]);
            if (ret !== false){
                result.params[ret.key] = ret.val;
                result.handler = '/' + ret.key;
            }
        }
        return result;
    };
})();

// 从query里解析参数
// '&test'或'?test'这种情况会解析成test=空字符串
var parseQuery = (function(){
    var amp = /&/, question = /^\?*/;
    return function(query){
        query = query.replace(question, '');
        var array = query.split(amp), result = { params:{} };
        for (var i=0; i<array.length; ++i){
            var ret = parseEquation(array[i]);
            if (ret){
                result.params[ret.key] = ret.val;
            }
        }
        return result;
    };
})();

// 把hash理解为一个相对的url，对其分别进行parsePath和parseQuery
var parseHash = (function(){
    var question = /\?/;
    return function(hash){
        hash = hash.replace('#', '');
        if (hash.length == 0) return false;
        var match = hash.split(/\?/);
        if (match.length > 0){
            var result = {
                hash: hash,
                url: hash, // 要这么写吗……虽然后面用着会方便，但似乎不大符合逻辑
                handler: '/',
                params: {}
            },
            path = parsePath(match[0]);
            result.handler = path.handler;
            waf.extend(result.params, path.params);
            if (match.length > 1){
                var query = parseQuery(match[1]);
                waf.extend(result.params, query.params);
            }
            delete result.params[result.handler.substr(1)]; // handler那个字段不作为params
            return result;
        }
        return false;
    };
})();

waf.extend(waf, {
    parseHash: parseHash
});

})(waf);