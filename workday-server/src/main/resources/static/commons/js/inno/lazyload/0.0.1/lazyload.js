define(function(require,exports,module){
	var Widget = require('widget'),
		$ = require('$');

	$window = $(window);

	var Lazyload = Widget.extend({
			attrs:{
				trigger: {
                	value: null,
                	getter: function(val) {
                    	return $(val);
                	}
            	},
            	container:window,
            	threshold:0,
            	failure_limit:0,
            	event_type:'scroll',
            	data_attribute:'original',
            	skip_invisible:false,
            	load:null,
            	placeholder: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXYzh8+PB/AAffA0nNPuCLAAAAAElFTkSuQmCC'

			},
			setup:function(){
				this._init();
			},
			_init:function(){
				var container = this.get('container'),
					event_type = this.get('event_type'),
					trigger = this.get('trigger'),
					self = this,
					$container;

				$container = (container === undefined || container === window) ? $window : $(container);

				if(0 === event_type.indexOf('scroll')){
					$container.bind(event_type,function(){
						self.update();
					});
				}

				this._bindEvent();
				
				$window.bind('reszie',function(){
					self.update();
				})

        		if ((/(?:iphone|ipod|ipad).*os 5/gi).test(navigator.appVersion)) {
        			$window.bind('pageshow',function(event){
        				if (event.originalEvent && event.originalEvent.persisted) {
                    		elements.each(function() {
                        		$(this).trigger("appear");
                    		});
                		}
        			});
        		}

        		$(document).ready(function(){
        			self.update();
        		});


			},
			_bindEvent:function(){
				var	placeholder = this.get('placeholder'),
					trigger = this.get('trigger'),
					self = this;

				trigger.each(function(){
					var that = this,
						$that = $(that);

					that.loaded = false;

					if($that.attr('src') === undefined || $that.attr('src') === false){
						if($that.is('img')){
							$that.attr('src',placeholder);
						}
					}
					bindEvent(that,self);

					
				});

			},
			asynBind:function(){
				var	placeholder = this.get('placeholder'),
					trigger = this.get('trigger'),
					self = this;

				trigger.each(function(){
					var that = this,
						$that = $(that);

					that.loaded = false;

					if($that.attr('src') === undefined || $that.attr('src') === false){
						if($that.is('img')){
							$that.attr('src',placeholder);
						}
						bindEvent(that,self);
					}
					
				});
			},
			update:function(){
				var counter = 0,
					self = this,
					trigger = this.get('trigger'),
					skip_invisible = this.get('skip_invisible'),
					failure_limit = this.get('failure_limit');

				trigger.each(function(){

					var $this =  $(this);
					if(skip_invisible && !$this.is(':visible')){
						return;
					}
					if(self.abovethetop(this) || self.leftofbegin(this)){

					}else if(!self.belowthefold(this) && !self.rightoffold(this)){
						$this.trigger('appear');
						counter =0
					}else{
						if(++counter > failure_limit){
							return false;
						}
					}
				});
			},
			belowthefold:function(ele){
				var fold,
					container = this.get('container'),
					threshold = this.get('threshold');

				if(container === undefined || container === window){
					fold = (window.innerHeight ? window.innerHeight : $window.height()) + $window.scrollTop();
				}else{
					fold = $(container).offset().top + $(container).height();
				}
				return fold <= $(ele).offset().top - threshold;
			},
			rightoffold:function(ele){
				var fold,
					container = this.get('container'),
					threshold = this.get('threshold');

				if(container === undefined || container === window){
					fold = $window.width() + $window.scrollLeft();
				}else{
					fold = $(container).offset().left + $(container).width();
				}
				return fold <= $(ele).offset().left - threshold;
			},
			abovethetop:function(ele){
				var fold,
					container = this.get('container'),
					threshold = this.get('threshold');

				if(container === undefined || container === window){
					fold = $window.scrollTop();
				}else{
					fold = $(container).offset().top;
				}

				return fold >= $(ele).offset().top + threshold + $(ele).height();
			},
			leftofbegin:function(ele){
				var  fold,
					 container = this.get('container'),
					 threshold = this.get('threshold');

				if(container === undefined || container === window){
					fold = $window.scrollLeft();
				}else{
					fold = $(container).offset().left;
				}
				return fold >= $(ele).offset().left + threshold + $(ele).width();
			}
	});

	function bindEvent(that,self){
		var $that = $(that),
			trigger = self.get('trigger'),
			event_type = self.get('event_type'),
			data_attribute = self.get('data_attribute'),
			load = self.get('load');
		$that.one('appear',function(){
			if(!this.loaded){
	
				var element_left = trigger.length;
				self.trigger('appear',that,element_left);
	
				$(that).bind('load',function(){
					var original = $that.attr('data-' + data_attribute);
	
					if($that.is('img')){
						$that.attr('src',original);
					}else{
						$that.css('background-image','url("' + original + '")');
					}
	
					$that.loaded = true;
		
					var temp = $.grep(trigger,function(ele){
						return !ele.loaded;
					});
		
					trigger = $(temp);
		
					if(load){
						var element_left = trigger.length;
						self.trigger('appear',element_left)
					}
				})
				.attr('src',$that.attr('data-' + data_attribute));
			}
	
							
		});
	
		if(0 !== event_type.indexOf('scroll')){
			$that.bind(event_type,function(){
				if(!that.loaded){
					$that.trigger('appear');
				}
			});
		}

	}

	module.exports = Lazyload;
});