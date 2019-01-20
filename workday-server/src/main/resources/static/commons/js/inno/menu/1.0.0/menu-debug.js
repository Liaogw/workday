define("menu",["$","base"],function(require,exports,module){
	var $=require("$"),
		Base=require("base");

	var Menu=Base.extend({
		attrs:{
			model:null,
			classPrefix:null,
			trigger: {
                value: null,
                getter: function(val) {
                    return $(val).eq(0);
                }
            },
            delay:100
		},
		initialize:function(config){
			Menu.superclass.initialize.call(this,config);
			this._bindEvents();
		},
		_bindEvents:function(){
			var trigger = this.get("trigger").find(".nav-list"),
				trigger2 = trigger.find(".sub-nav-list"),
            	delay = this.get("delay"),
            	showTimer, 
            	hideTimer;
            	that = this;

			
			trigger.on("mouseenter",function(){
				var _that=this;
				clearTimeout(hideTimer);
				hideTimer=null;
				
				showTimer=setTimeout(function(){
					$(".nav-list-inner").next().hide();
					$(_that).find(".nav-list-inner").next().show();
				},delay)
			});

			trigger.on("mouseleave",leaveHandler);

			trigger2.on("mouseenter",function(){
				var _that=this;
				clearTimeout(hideTimer);
				hideTimer=null;
				showTimer=setTimeout(function(){
					$(".sub-nav-list-inner").next().hide();
					$(_that).find(".sub-nav-list-inner").next().show();
				},delay)
			});          

            trigger2.on("mouseleave",leaveHandler2);
  
            
            function leaveHandler(e) {
            	var _that=this;
                clearTimeout(showTimer);
                showTimer = null;
				
                hideTimer = setTimeout(function() {
                	$(".sub-nav-list-inner").next().hide();
                    $(_that).find(".nav-list-inner").next().hide();
                }, delay);
                
            }

            function leaveHandler2(e){
            	var _that=this;
                clearTimeout(showTimer);
                showTimer =null;
              
                hideTimer =setTimeout(function(){
                    $(_that).find(".sub-nav-list-inner").next().hide();
                },delay)
            }
		}
	});

	module.exports = Menu;


})