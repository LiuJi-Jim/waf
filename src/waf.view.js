(function($){
/**
 * @fileOverview waf.view MVC�е�V
 * ����: waf.core, waf.model
 * ��ע: 
*/

waf.View = (function(){
    var View = function(){
    };
    View.prototype.define = View.prototype.extend = function(opts){
        opts = waf.extend({ target: null, fields: {} }, opts);
        var me = this, model = new Model();
        waf.extend(model, {
            target: opts.target, // ����ģ��
            fields: waf.extend(opts.fields, me.fields) // merge fields
        });
        
        return model;
    };
    Model.prototype.render = function(data){
        var me = this;
        if (waf.isF(me.template)){
            // ��ȫ�Զ�����Ⱦ����
            return me.template.call(me, data);
        }
        if (!waf.isA(data)){
            // ������Ⱦһ�ɸ������
            return me.render([data]);
        }
        var fields = me.fields, template = $(me.template), wrap = $('<div />');
        if (template.length == 0) return wrap.children(); // ûģ�壬ɶҲ�����ذ�
        for (var i=0; i<data.length; ++i){
            var item = data[i], elem = waf.clone($(template)).appendTo(wrap);
            for (var key in item){
                var val = item[key], node = elem.find('[data-field='+key+']'), field = fields[key];
                if (field instanceof Model){
                    // ֵ�Ǹ��Ӷ���
                    node.append(field.render(val));
                }else if (waf.isF(field)){
                    // ֵ�Ǹ��Զ�����Ⱦ����
                    node.append($(field(val)));
                }else{
                    // ֱ����ΪinnerHTML
                    node.html(val);
                }
            }
        }
        return wrap.children();
    };
    return new Model();
})();

})(Zepto);