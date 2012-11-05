/*


  dom.on("click",function(){});

  dom.on("click","a.class",function(){});


*/

;(function(window){
    
    var doc = window.document,
        $   = window.$;

    $.fn.add = function(etype,selector,func){
      
        var selector,func,isProxy = true;

        if( $.isFunction(selector) ){
            func = selector;    
            isProxy = false;
        } 
       
        var handler = (function(){
            if(isProxy){
                return function(e){
                    if(e.target.webkitMatchesSelector(selector)){
                       return func.call(e.target); 
                    }
                }
            } 
            else{
                return function(e){
                    return func.call(e.target); 
                }     
            }
        })();

        this.addEventListener(etype,handler,false);
    }
    
    
})(window);
