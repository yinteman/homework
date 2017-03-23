/**
 * Created by Thinkpad on 2017/3/22.Dep对象订阅和发布
 */
var uid =0;
var Dep = function (){
    this.id = uid++;
    this.subs = [];
}
Dep.prototype ={
    addSub:function(sub){
        this.subs.push(sub);
    },
    notify:function(){
        console.log(this.subs)
        this.subs.forEach(function(sub){

            sub.update();
        })
    },
    append :function(){
        Dep.target.addDep(this);
    }
}
Dep.target = null;
