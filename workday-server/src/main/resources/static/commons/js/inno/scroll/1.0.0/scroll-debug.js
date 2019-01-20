define("inno/scroll/1.0.0/scroll-debug",["$","./mousewheel-debug"],function (require, exports, module) {
	var $ = require("$");

    function Scroll(options) {
    	var set = _extend({
                trigger:"",
                container:"",
                speed:40,
                scrollbarFlag:true
            },options||{});
            this.trigger = $(set.trigger); 
            this.container = $(set.container);
            this.speed = set.speed;
            this.scrollbarFlag = set.scrollbarFlag;
            this.triggerHeight = this.trigger.height();
            this.containerHeight = this.container.height(); 
        this.init();
    }

    Scroll.prototype = {
    	constructor:Scroll,
    	init:function(options){
    		
    		this._calculate(); 
    		this._addWarpper();
    		this._bindEvents();
            if(this.scrollbarFlag){
                this.show();
            }else{
                this.hide();
            }
    	},
    	_calculate:function(){
    		var triggerHeight = this.triggerHeight,
    			containerHeight = this.containerHeight;

    		if(triggerHeight < containerHeight){
    			this.maxTop = containerHeight - triggerHeight;
    		}else{
    			this.maxTop = 0;
    		}
    	},
    	_addWarpper:function(){
    		if(this.wrapper){
    			return;
    		}
    		var vScrollHeight = parseInt(this.triggerHeight / this.containerHeight * this.triggerHeight);

    		this.wrapper = _createEl("<div class='ui-scroll-bar' style='height:"+ this.triggerHeight  +"px'></div>",this.trigger[0]);
    		this.vScroll = _createEl("<div class='ui-scroll-bar-y' style='height:"+ vScrollHeight  +"px'></div>",this.wrapper[0]);

            this.maxBar = this.triggerHeight - vScrollHeight; //设置scrollbar 的top max值
    	},
        show:function(){
            this.scrollbarFlag = true;
            this.wrapper.show();
        },
        hide:function(){
            this.scrollbarFlag = false;
            this.wrapper.hide();
        },
    	_bindEvents:function(){
    		var that = this,
                scrollbarOn=0,top;

    		this.trigger.bind("mousewheel",function(event, delta, deltaX, deltaY){
    			that._mousewheel(event,delta);
    		});
    		this.trigger.bind("mouseover",function(){
    			$(that.wrapper).addClass("in-scrolling");
    		});    	
    		this.trigger.bind("mouseout",function(){
    			$(that.wrapper).removeClass("in-scrolling");
    		});

    		this.vScroll.bind("mousedown",function(e){
                var e = e || window.event,
                    wrapperHeight = that.wrapper.height(),
                    containerHeight = that.containerHeight;
                if(e.button == 0 || e.button ==1){
                    scrollbarOn = 1;
                    that.barPosition = getPos(e,"Y") - that.wrapper.offset().top - that.vScroll.position().top;
              
                    $(document).bind("mouseup",function(){
                        scrollbarOn =0;

                        $(document).unbind("mouseup").unbind("mousemove");
                    }).bind("mousemove",function(e){
                        var maxBar = that.maxBar,
                            vScroll = that.vScroll;
                        if(scrollbarOn){
                            var pos = getPos(e,"Y") - that.wrapper.offset().top - that.barPosition;
                    
                            pos  = pos < 0 ? 0 : (pos > maxBar ? maxBar : pos);
                            vScroll.css("top",pos + "px");
                            top = -(pos/wrapperHeight) * containerHeight;
                            that.container.css("top",top);
                        }
                    });
                }
                if(e&&e.stopPropagation){ //Firefox下阻止事件冒泡
                    e.stopPropagation();
                    e.preventDefault();
        
                }else if(window.event){ //IE下阻止事件冒泡
                    window.event.cancelBubble=true;
                }    			
    		}).bind("mousemove",function(e){
                var maxBar = that.maxBar,
                    vScroll = that.vScroll,
                    wrapperHeight = that.wrapper.height(),
                    containerHeight = that.containerHeight;;
    			if(scrollbarOn){
                    var pos = getPos(e,"Y") - that.wrapper.offset().top - that.barPosition;
                    
                    pos  = pos < 0 ? 0 : (pos > maxBar ? maxBar : pos);
                    vScroll.css("top",pos + "px");
                    top = -(pos/wrapperHeight) * containerHeight;
                    that.container.css("top",top);

                }
    		});
 
    	},
    	_mousewheel:function(e,delta){
    		var top,
                barTop,
    		    containerTop = parseInt(this.container.css("top")),
    			triggerHeight = this.triggerHeight,
    			offsetHeight = this.container.get(0).offsetHeight,
    			wrapperHeight = this.wrapper.height(),
    			speed =this.speed ,
    			containerHeight = this.containerHeight,
                e=e || window.event; //  container  offsetHeight

         //   console.log(this.maxTop);
    		if(delta>0){
    		 	top = containerTop + Math.round(triggerHeight * (speed  / offsetHeight)) + 'px';
    		 	if(parseInt(top)>0){
    		 		top=0;
    		 	}

    		}else{
    		 	top = containerTop - Math.round(triggerHeight * (speed / offsetHeight)) + 'px';
    		 	if(-parseInt(top) > this.maxTop){
    		 		top = - (this.maxTop);
    		 	}
    		 	
    		}
    		barTop = -(parseInt(top)/containerHeight) * parseInt(wrapperHeight);
    		this.container.css("top",top);
    		this.vScroll.css("top",barTop);

            if(e&&e.stopPropagation){ //Firefox下阻止事件冒泡
                e.stopPropagation();
                e.preventDefault();
        
            }else if(window.event){ //IE下阻止事件冒泡
                window.event.cancelBubble=true;
            }
    	},
    	reset:function(){
    		this.triggerHeight = this.trigger.height();
    		this.containerHeight = this.container.height();

    		var triggerHeight = this.triggerHeight,
    			containerHeight = this.containerHeight,
                wrapperHeight =  this.wrapper.height(),
                vScrollHeight,
                barTop,top;

    		if(triggerHeight < containerHeight){
    			this.maxTop = containerHeight - triggerHeight;
    		}else{
    			this.maxTop = 0;
    		}

            this.wrapper.css("height",triggerHeight);
    		vScrollHeight = parseInt(triggerHeight / containerHeight * triggerHeight);//重新获取scrollbar高度
    		top = this.container.css("top"); 
            barTop = -(parseInt(top)/containerHeight) * parseInt(wrapperHeight); //重新计算scrollbar的top值
            this.maxBar = this.triggerHeight - vScrollHeight; //重新计算scrollbar top 的max值

            this.vScroll.css("height", vScrollHeight + "px");
           
            this.vScroll.css("top",barTop);
            
    	}
    }
    function _extend(target,source){
        for(var key in source) target[key] = source[key];
        return target;
    };
    function _createEl(html,parent){
        var div = document.createElement('div');
        div.innerHTML = html;
        el = div.firstChild;
        parent && parent.appendChild(el);
        return $(el);
    };

    function getPos(event,c){
        var p = c.toUpperCase() == "X" ? "Left" : "Top";
        return event['page' + c] || (event['client' + c] + (document.documentElement['scroll' + p] || document.body['scroll' + p])) || 0;
    }

    module.exports = Scroll;
});
 