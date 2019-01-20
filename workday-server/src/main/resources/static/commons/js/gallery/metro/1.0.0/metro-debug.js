define("metro",["$", "widget", "base", "class", "events"],function(require, exports, module){
	var $=require("$");
    var Widget = require("widget");
    var Metro=Widget.extend({
    		attrs: {
        	    element: {
        	        value: null,
        	        readOnly: true
        	    },
        	    containment: null,
        	    axis: false,
        	    visible: false,
        	    proxy: null,
        	    drop: null,
        	    revert: false,
        	    revertDuration: 500,
        	    disabled: false,
        	    dragCursor: "move",
        	    dropCursor: "copy",
        	    zIndex: 9999,
        	    data:[],
        	},
            events:{
              //  'mouseup .metro-modules': 'test'
            },
        	setup:function(){
        		this.init();
                this.initDarg();
        	},
        	init:function(){
        		var data =this.get("data"),
        			strhtml="",child=null,count=0,boxClass="",boxSize=0;

        		for(var item in data){
        			if(item==0){
        				strhtml+="<div class=\"metro-modules\">";
        			}else{
        				strhtml+="<div class=\"metro-spacing\"></div>"
        				strhtml+="<div class=\"metro-modules\">";
        			}

        			child = data[item]["children"];

        			for(var i in child){
        				if(i == 0){
        					strhtml+="<div class=\"metro-box\">";
        				}
        				boxClass="";

        				switch(child[i]["type"]){
        					case '1': 
								count +=1;
								boxSize=1;
								boxClass="s_block ";
								break;;
							case '2': 
								count +=2;
								boxSize=2;
								boxClass="c_block ";
								break;;
							case '3': 
								count +=4;
								boxClass="b_block ";
								boxSize=4;
								break;;
							default:

        				}

        				if(count>8){
        					count=boxSize;
        					strhtml+="</div>";
        					strhtml+="<div class=\"metro-box\">";

        				}
     
        				strhtml+="	<div class=\""  + boxClass  + " b-blue\" data-box-type=\""+ boxClass +"\">";
        				strhtml+="		<span></span>";
        				strhtml+="		<p>"+  child[i]["name"] +"</p>";
        				strhtml+="	</div>";
        			}
        			strhtml+="	</div>";
        			strhtml+="</div>";
        			count=0;
        		}
        		this.element.html(strhtml);
        	},
            test:function(e){
            //    console.log(e);
            },
            initDarg:function(){
                $(".b-blue").mousedown(function(e){
                   var strhtml="",
                       x = document.documentElement.scrollLeft + e.clientX,
                       y = document.documentElement.scrollTop + e.clientY;

                   strhtml ="<div class=\""  + $(this).attr("data-box-type")  + " b-blue move\" style=\"position:absolute;top:"+ y +"px;left:"+ x +"px;cursor:move;\"  >";
                   strhtml +=$(this).html();
                   strhtml +="</div>";
                  // $(this).attr("data-box-type"));
                    $("body").append(strhtml);
                }).mouseup(function(e){
                    /*var x = document.documentElement.scrollLeft + e.clientX,
                        y = document.documentElement.scrollTop + e.clientY;
                    $(".move").css("top",y+"px");
                    $(".move").css("left",x+"px");*/
                    $(this).unbind("mousemove");
                }).mousemove(function(e){
                    var x = document.documentElement.scrollLeft + e.clientX,
                        y = document.documentElement.scrollTop + e.clientY;
                    $(".move").css("top",y+"px");
                    $(".move").css("left",x+"px");
                    if(e&&e.stopPropagation){ //Firefox下阻止事件冒泡
                        e.stopPropagation();
                    }else if(window.event){ //IE下阻止事件冒泡
                        window.event.cancelBubble=true;
                    }
                });

                $(document).mouseup(function(){
                    //$(".b-blue").unbind("mousemove");
                    $(".move").remove();
                })
            }
    });

	module.exports = Metro;
});