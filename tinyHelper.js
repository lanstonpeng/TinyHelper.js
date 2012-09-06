var tinyHelper = (function(window,document,undefined){
    
    var tinyHelper = {},
        $,
        emptyArray=[],
        toString=({}).toString,
        slice = emptyArray.slice,
        getComputedStyle = window.getComputedStyle,
        table = document.createElement("table"),
        tableRow = document.createElement("tr"),
        //element,text,comment,document,document fragment
        elementsNodeType=[1,3,8,9,11],
        fetures=(function(){
            
            return {};
            }),
        readyRE=/complete|loaded|interactive/,
        fragmentRE=/^\s*<(\w+)>/,
        idSelectorRE=/^#([\w-]+)$/,
        classSelectorRe = /^\.([\w-]+)$/,
        tagSelectorRe = /^(\w+)$/;

    function likeArray(obj){
        //return !!obj.length;
        return typeof obj.length === "number";
        } 
    function isFunction(func){
        return toString.call(func) === "[object Function]";
        }
    function isObject(obj){
        return obj instanceof Object;
        }
    function isArray(arr){
        return toString.call(arr) === "[object Array]";
        }
    function isTiny(obj){
        return obj instanceof tinyHelper.make;
        }
    function isPlainObject(){};
    function compact(arr){return arr.filter(function(item){return item!=undefined && item !=null;})}
    function uniq(arr){return arr.filter(function(item,idx){
            return idx === arr.indexOf(item);
    });}
    function transverNode(node,func){
        func(node);
        for(var key in node.childNodes){
            transverNode(node.childNodes[key],func);
        }
    }


    window.debug=(function(){
        var isShown = true;
        return {
            log:function(msg){
                isShown && console.log(msg);
                },
            setShow:function(value){
                isShown = !!value;
                }
            }
    })();
    
    $=function(selector,context){
       return tinyHelper.query(selector, context);
    }

    tinyHelper.make = function(dom){
       var dom = dom || [];
       dom.__proto__ = tinyHelper.make.prototype;
       return dom;
        }
    tinyHelper.query = function(selector, context){
        if(!selector){return tinyHelper.make();}
        else if(isFunction(selector)){
            debug.log("dom ready callback");
        }
        else if(isTiny(selector)){
            debug.log("is tiny object");
            return selector;
        }
        else{
            var dom;
            if(isArray(selector)){
                
                dom=compact(selector)
               } 
            else if(elementsNodeType.indexOf(selector.nodeType) > -1 || selector==window){
                dom=[selector]; 
                }
            else if(fragmentRE.test(selector)){
                debug.log("fragment");
                dom=tinyHelper.fragment(selector); 
                }
            else if(context){
                debug.log("context not null");
                }
            else{
                //dom=document.querySelectorAll(selector);
                dom = tinyHelper.domQuery(document,selector)
                }
           
            return tinyHelper.make(dom);
            }
        }
    tinyHelper.match = function(element,selector){
        var matchesSelector = ( element.webkitMatchesSelector || element.mozMatchesSelector ||
                                element.oMatchesSelector || element.msMatchesSelector || element.matchesSelector );
        if (!matchesSelector){
            return matchesSelector.call(element,selector );
            }
        else{
            var parent= element.parentNode;
            return element == tinyHelper.domQuery(parent,selector)[0];
            }
        }
    tinyHelper.domQuery = function(element,selector){
        var found;
        if( element === document && idSelectorRE.test(selector)){
            found=element.getElementById(RegExp.$1);
            return found ?[found]:emptyArray;
         }
         else if( element.nodeType == 1 || element.nodeType == 9){
            if (classSelectorRe.test(selector)){
                found = element.getElementsByClassName(RegExp.$1);
            }
            else if(tagSelectorRe.test(selector)){
                found = element.getElementsByTagName(RegExp.$1);
            }
            else{
                found = element.querySelectorAll(selector);
            }
            return slice.call(found);
         }        
        }
    tinyHelper.fragment = function(html){
        var div=document.createElement("div");
        div.innerHTML = '' + html;
        return slice.call(div.childNodes);
        
        }
    //module control
    tinyHelper.register = function(module){
        
        }
    $.extend=function(target){
        var sources = slice.call(arguments,1);
        sources.forEach(function(source){
            for(key in source){
                if(source[key] && !target.hasOwnProperty(key)){
                    target[key]=source[key];
                    }
                } 
            });
        } 
    $.each=function(obj,callback){
        if(likeArray(obj)){
            for(var i=0,len=obj.length;i<len;i++){
                callback.call(obj[i],i,obj[i]);
                }
        }
        else{
            for(var key in obj){
                if(obj.hasOwnProperty(key)){
                    callback.call(obj[key],key,obj[key])
                    }
                }    
        }
        return obj;
    };
    $.map = function(obj,callback){
        var result=[],temp;
        if(likeArray(obj)){
            for(var i=0,len=obj.length;i<len;i++){
                temp = callback.call(obj[i],i,obj[i]);
                temp && result.push(temp); 
                }
            }
        else{
           for(var key in obj){
                if(obj.hasOwnProperty(key)){
                    temp = callback.call(obj[key],key,obj[key]);
                    temp && result.push(temp);
                    }
                } 
            }
        return result; 
        }
    $.flatten = function(array){
        if(isArray(array)){
            return array.length >0 ?[].concat.apply([],array) : array;
        }
    }

    $.evalVal = function(script){
        var result;
        window.eval("(function(){ try{ window._evalResult="+script+"}catch(e){}})()");
        result = window._evalResult;
        window._evalResult = null;
        return result;
    }

    $.fn={
        forEach:emptyArray.forEach,
        reudce :emptyArray.reduce,
        push:emptyArray.push,
        indexOf:emptyArray.indexOf,
        concat:emptyArray.concat,
        each:function(callback){
            this.forEach(function(elem,idx){
                callback.call(elem,idx,elem);
            });
            return this;
        },
        find:function(selector){
            var found=[];
            this.each(function(idx,elem){
                tinyHelper.match(elem,selector) && found.push(elem);
            });
            return $(found);
        },
        slice:function(){
            return $(slice.apply(this,arguments));
        },
        filter:function(condition){
            return $($.map(this,function(idx,elem){
                return tinyHelper.match(elem,condition) ? false : elem;
            }));
        },
        add:function(selector,context){
            return $(uniq( this.concat($(selector,context)) ));
        },
        not:function(condition){
            if(isFunction(condition)){
                return $.map(this,function(idx,elem){
                    return condition.call(this,idx,elem);
                });
            }
            else{
                return $([].filter.call(this,function(elem,idx){
                    return !tinyHelper.match(elem,condition);
                }));    
            }           
        },
        is:function(selector){
            var item = this[0]
            return item && tinyHelper.match(item,selector);
        },
        empty:function(){
            this.each(function(){
                this.innerHTML = "";
            });
        },
        closest:function(selector){
            var node = this[0],
                parent = node.parentNode;
            if( selector && typeof selector === "string"){
                while(parent && parent != document ){
                    if(tinyHelper.match(parent,selector)){
                        return $(parent);
                    }
                    parent = node.parentNode;
                }
            }
            else if(!selector){
                return $(node)
            }
        },
        first:function(){
            var item = this[0];
            return item && isObject(item) ? $(item) : item;
        },
        last:function(){
            if(this.length > 0){
                var item = this[this.length -1];
                return item && isObject(item) ? $(item) : item;
            }
        },
        parent:function(selector){

        },
        parents:function(selector){
            return  $.map(this,function(idx,elem){
                var parent = elem.parentNode;
                if(parent && parent != document){
                    return parent;
                } 
            });
        }

 
        
        

        };
    ["after","before","prepend","append"].forEach(function(key,idx){
        $.fn[key]=function(){ 
            var nodes = $.flatten($.map(arguments,function(idx,val){
                return isObject(val) ? val : tinyHelper.fragment(val);
            }));

            return this.each(function(index,elem){

                for(var i=0,len=nodes.length;i<len;i++){
                    var node = nodes[i];
                    if(node.nodeName.toUpperCase() === "SCRIPT" && (!node.type || node.type === "text/javascript")){
                        transverNode(node,function(node){
                            $.evalVal(node.innerHTML);
                        });    
                    }
                }

                switch(key){
                    case "before" : 
                        this.parentNode.insertBefore(node,this);
                        break;
                    case "after" :
                        this.parentNode.insertBefore(node,this.nextSlibing);
                        break;
                    case "prepend" :
                        this.insertBefore(node,this.firstChild);
                        break;
                    case "append" : 
                        this.insertBefore(node,null);
                        break;
                }
            });
        }

        //generate "appendTo" "insertBefore" "insertAfter" "prependTo"
        //$.fn[(idx % 2) ? "insert"+key:  ]
    });

    tinyHelper.make.prototype = $.fn;
    $.tinyHelper = tinyHelper;
   
    return $;
    })(window,document);

window.$ = tinyHelper;

