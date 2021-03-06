/**
 * Created by Thinkpad on 2017/3/22.
 * Watcher订阅者作为Observer和Compile之间通信的桥梁，主要做的事情是: 1、在自身实例化时往属性订阅器(dep)里面添加自己
 * 2、自身必须有一个update()方法
 * 3、待属性变动dep.notice()通知时，能调用自身的update()方法，并触发Compile中绑定的回调，则功成身退。
 */

 var Watcher = function(vm,exp,cb){
    this.cb = cb;
    this.vm = vm ;
    this.exp = exp;
    this.depIds = {};
    //为了触发getter方法，在dep中添加自己.
    this.value = this.get();
}

Watcher.prototype ={
    update :function(){
        this.run();//属性值发生变化受到通知
    },
    run:function(){
        var value = this.get();//获取最新的值
        var oldeValue = this.value;
        if(value != oldeValue){
            this.value = value;
            this.cb.call(this.vm,value,oldeValue);//执行Compile中的绑定回调，更新视图
        }
    },
    get:function(){
        Dep.target = this;//将当期订阅者指向自己
        var value = this.getVMVal();//触发getter，添加自己到属性订阅器中；
        Dep.target =null;//添加完毕重置
        return value;
    },
    addDep:function(dep){
        // 1. 每次调用run()的时候会触发相应属性的getter
        // getter里面会触发dep.depend()，继而触发这里的addDep
        // 2. 假如相应属性的dep.id已经在当前watcher的depIds里，说明不是一个新的属性，仅仅是改变了其值而已
        // 则不需要将当前watcher添加到该属性的dep里
        // 3. 假如相应属性是新的属性，则将当前watcher添加到新属性的dep里
        // 如通过 vm.child = {name: 'a'} 改变了 child.name 的值，child.name 就是个新属性
        // 则需要将当前watcher(child.name)加入到新的 child.name 的dep里
        // 因为此时 child.name 是个新值，之前的 setter、dep 都已经失效，如果不把 watcher 加入到新的 child.name 的dep中
        // 通过 child.name = xxx 赋值的时候，对应的 watcher 就收不到通知，等于失效了
        // 4. 每个子属性的watcher在添加到子属性的dep的同时，也会添加到父属性的dep
        // 监听子属性的同时监听父属性的变更，这样，父属性改变时，子属性的watcher也能收到通知进行update
        // 这一步是在 this.get() --> this.getVMVal() 里面完成，forEach时会从父级开始取值，间接调用了它的getter
        // 触发了addDep(), 在整个forEach过程，当前wacher都会加入到每个父级过程属性的dep
        // 例如：当前watcher的是'child.child.name', 那么child, child.child, child.child.name这三个属性的dep都会加入当前watcher
        if(!this.depIds.hasOwnProperty(dep.id)){
            dep.addSub(this);
            this.depIds[dep.id] = dep;
        }
    },
    getVMVal:function(){
        var exp = this.exp.split('.');
        var val = this.vm._data;
        exp.forEach(function(k) {
            val = val[k];
        });
        return val;
    }
}
