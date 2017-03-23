/**
 * Created by Thinkpad on 2017/3/22.
 * compile主要做的事情是解析模板指令，将模板中的变量替换成数据，然后初始化渲染页面视图，
 * 并将每个指令对应的节点绑定更新函数，添加监听数据的订阅者，一旦数据有变动，收到通知，更新视图，
 */

  var  Compile = function(el,vm){
    this.$vm = vm;
    this.$el = this.isElementNode(el) ? el : document.querySelector(el);
    if(this.$el){
        this.$fragment = this.node2Fragment(this.$el);
        this.init();
        this.$el.appendChild(this.$fragment);
    }
}
Compile.prototype ={
    init: function () {
        this.compileElement(this.$fragment);
    },
    node2Fragment: function (el) {
        var fragment = document.createDocumentFragment(),child;
        while(child = el.firstChild){
            fragment.appendChild(child)
        }
        return fragment;
    },
    compileElement:function(el){
        var childNodes = el.childNodes,me = this ;
        [].slice.call(childNodes).forEach(function(node){
            var text = node.textContent;
            var reg = /\{\{(.*?)\}\}/g;
            if(me.isElementNode(node)){
                me.compile(node,text,RegExp.$1);
            }else if(me.isTextNode(node) && reg.test(text)){
                me.compileText(node,text,RegExp.$1);
            }

            if(node.childNodes && node.childNodes.length){
                me.compileElement(node);
            }
        });
    },
    compile:function(node){
        var nodeAttrs = node.attributes ,me = this;
        [].slice.call(nodeAttrs).forEach(function(attr){
            //规定：指令以v-xxx命名的属性:例如v-text
            var attrName = attr.name;
            if(me.isDirective(attrName)){
                var exp = attr.value;
                var dir = attrName.substring(2);//v-text中的text
                if(me.isEventDirective(dir)){
                    //稍后补充
                }else{
                   // console.log(node)
                    compileUtil[dir] && compileUtil[dir](node , me.$vm ,exp);
                }
            }
        })
    },
    isElementNode:function(node){
        return node.nodeType == 1;
    },
    isDirective: function () {
        return attr.indexOf('v-') == 0;
    },
    isTextNode:function(node){
        return node.nodeType == 3;
    },
    isEventDirective: function(dir) {
        return dir.indexOf('on') === 0;
    },
    compileText: function(node,text, exp) {
        //console.log(exp);
        /*var data =this.$vm;
        if( exp.indexOf('.') > -1 ){
            exp.split('.').forEach(function(item,index){
                data = data[item];
            })

            text = text.replace('{{'+exp+"}}",data)
        }*/
        text = text.replace('{{'+exp+"}}",'$')
        compileUtil.text(node, this.$vm ,text+'#'+ exp);
    }
}

var compileUtil ={
    text: function (node,vm,exp) {
        this.bind(node,vm,exp,'text');
    },
    bind:function(node,vm,exp,dir){
        var updaterFn = updater[dir+'Updater'],text='';
        //第一次实例化视图
        if(exp.indexOf('#') > -1){
            var data = exp.split('#');
            text = data[0];
            exp = data[1];
        }else{
            text ='';
        }
        updaterFn && updaterFn(node ,this._getVMVal(vm, exp),text);
        //实例化订阅者，此操作会在对应的属性消息订阅器中添加该订阅者watcher
        new Watcher(vm,exp,function(value,oldvalue){
            //一旦属性值发烧了变化，会受到通知执行此更新函数，更新视图
            updaterFn &&  updaterFn(node,value,text,oldvalue);
        })
    },
    _getVMVal: function(vm, exp) {
        var val = vm._data;
        exp = exp.split('.');
        exp.forEach(function(k) {
            val = val[k];
        });

        return val;
    },

}
var updater={
    textUpdater :function(node,value,text){
        var content =value;
        if(text){
             content = text.replace( '$',value);
        }
        node.textContent = typeof value == 'undefine'?text:content
    }
}
