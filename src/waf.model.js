(function($){
/**
 * @fileOverview waf.model MVC中的M
 * 依赖: waf.core
 * 备注: 这是一次尝试“先想我希望怎么写代码，再去实现框架”这个思路
*/

waf.Model = (function(){
    var Model = function(){
    };
    Model.prototype.define = Model.prototype.extend = function(opts){
        opts = waf.extend({ template: '', fields: {} }, opts);
        var me = this, model = new Model();
        waf.extend(model, {
            template: opts.template, // 覆盖模板
            fields: waf.extend(opts.fields, me.fields) // merge fields
        });
        
        return model;
    };
    Model.prototype.render = function(data){
        var me = this;
        if (waf.isF(me.template)){
            // 完全自定义渲染方法
            return me.template.call(me, data);
        }
        if (!waf.isA(data)){
            // 常规渲染一律搞成数组
            return me.render([data]);
        }
        var fields = me.fields, template = $(me.template), wrap = $('<div />');
        if (template.length == 0) return wrap.children(); // 没模板，啥也不返回吧
        for (var i=0; i<data.length; ++i){
            var item = data[i], elem = waf.clone($(template)).appendTo(wrap);
            for (var key in item){
                var val = item[key], node = elem.find('[data-field='+key+']'), field = fields[key];
                if (field instanceof Model){
                    // 值是个子对象
                    node.append(field.render(val));
                }else if (waf.isF(field)){
                    // 值是个自定义渲染方法
                    node.append($(field(val)));
                }else{
                    // 直接作为innerHTML
                    node.html(val);
                }
            }
        }
        return wrap.children();
    };
    return new Model();
})();

})(Zepto);