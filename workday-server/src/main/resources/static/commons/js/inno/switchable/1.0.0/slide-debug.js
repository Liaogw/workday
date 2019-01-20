define("inno/switchable/1.0.0/slide-debug",["$","slide","./slide-debug.css"],function(require, exports, module) {
	var $=require("$"),
		AraleSlide=require("slide");

	require("./slide-debug.css");

	var Slide=AraleSlide.extend({
		    attrs: {
                triggers: {
                    value: [],
                    getter: function(val) {
                        return this.element.find(val);
                    }
                },
                panels: {
                    value: [],
                    getter: function(val) {
                        return this.element.find(val);
                    }
                },
            	classPrefix: "ui-slide",
                showTriggerLength:7,
                triggerPaging:false
        	},
        	setup: function () {
            	Slide.superclass.setup.call(this); 
                this.bindPaging();
                if(this.get("triggerPaging")){
                    this.bindTriggerPaging();
                }
        	},
            _switchTo:function(toIndex, fromIndex){
                Slide.superclass._switchTo.call(this,toIndex,fromIndex);
                
                if(this.get("triggerPaging")){
                    var length=this.get("length"),
                        triggers=this.get("triggers"),
                        showTriggerLength=this.get("showTriggerLength"),
                        nav =this.element.find("[data-switchable-role=nav]"),
                        width=$(triggers[0]).width() + parseInt($(triggers[0]).css("margin-left")), 
                        oldLeft = (parseInt(nav.css("left"))||0 ),
                        toLeft =(toIndex *width) +width;
                        
                        if(toIndex != 0){
                            if((-toLeft)<(oldLeft-(width*showTriggerLength))){
                                left = -((Math.ceil((toIndex+1)/showTriggerLength)-1) * width*showTriggerLength);
                                nav.animate({left:left+"px" });
                            }
                        }else{
                            nav.animate({left:"0px" });
                        } 

                }
            },
            bindPaging:function(){
                var that=this;
                this.element.find(".ui-slide-prev").click(function(){
                    var activeIndex=that.get("activeIndex"),
                        length=that.get("length");
                    clearTimeout(that._switchTimer);
                    if(activeIndex==0){
                        that.set("activeIndex",(length-1));
                    }else{
                        that.set("activeIndex",(activeIndex-1));
                    }

                });
                this.element.find(".ui-slide-next").click(function(){
                   var activeIndex=that.get("activeIndex"),
                       length=that.get("length");
                    if(activeIndex==(length-1)){
                        that.set("activeIndex",0);
                    }else{
                        that.set("activeIndex",(activeIndex+1));
                    }
                });
            },
            bindTriggerPaging:function(){
                var that =this,
                    length=this.get("length"),
                    triggers=this.get("triggers"),
                    showTriggerLength=this.get("showTriggerLength"),
                    nav =this.element.find("[data-switchable-role=nav]"),
                    width=$(triggers[0]).width() + parseInt($(triggers[0]).css("margin-left"));  
                
                this.element.find(".ui-slide-nav-prev").click(function(){
                    var oldLeft = (parseInt(nav.css("left"))||0 ),
                        left = oldLeft+ (showTriggerLength*width);
                    if(oldLeft<0){
                        nav.animate({left:left+"px"});
                    }
                   
                });

                this.element.find(".ui-slide-nav-next").click(function(){
                    var oldLeft = (parseInt(nav.css("left"))||0 ),
                        left = oldLeft - (showTriggerLength*width),
                        totalWidth =length * width;
                    if(-totalWidth <left){
                        nav.animate({left:left+"px"});
                    }

                })
              
            }
	});

	module.exports = Slide;
})