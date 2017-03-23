/**
 * Created by Thinkpad on 2017/3/22.
 * 实现一个数据监听器Observer，能够对数据对象的所有属性进行监听，如有变动可拿到最新值并通知订阅者
 * 在observer中采用Object.defineProperty的方法实现监听
 */


  var Observer = function(data){
    this.data = data ;
    this.makeObserve(this.data);
}
Observer.prototype.makeObserve = function(obj){
    var val ;
    for( var key in obj){
        val = obj[key];

        if(obj.hasOwnProperty(key)){
            if(typeof  val == 'object'){
                console.log(val);
                new Observer(val);
            }
        }
        this.defineReactive(key,val);
    }
}
Observer.prototype.defineReactive = function(key,val){
    var vm = this;
    var dep = new Dep();
    Object.defineProperty(this.data,key,{
        enumerable :true,
        configurable:false,
        get:function(){
            //需要在这里添加订阅者，用于传递订阅者watcher的消息
            console.log(Dep)
            Dep.target && dep.append();
            return val;
        },
        set : function(newVal){
            console.log('你要设置'+key);
            val = newVal;
            if(typeof newVal == 'object' ){
                new Observer(val)
            }
            dep.notify();//通知所有订阅者
        }
    })
}
