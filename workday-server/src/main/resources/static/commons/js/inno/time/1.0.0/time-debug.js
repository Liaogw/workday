define('inno/time/1.0.0/time-debug',["overlay", "$", "position", "iframe-shim", "widget", "base", "class", "events","./time.css"],function(require,exports,module){
	var Overlay = require("overlay");
    var $ = require("$");

    require('./time.css');
    var template = ['<div class="ui-time">',
                        '<div class="ui-time-content">',
                            '<input class="ui-input ui-time-input" data-role="hour" maxlength="2">',
                            '<span>:</span>',
                            '<input class="ui-input ui-time-input" data-role="minute" maxlength="2">',
                            '<span>:</span>',
                            '<input class="ui-input ui-time-input" data-role="second" maxlength="2">',
                        '</div>',
                        '<div class="ui-time-footer">',
                            '<input type="button" data-role="now" value="当前">',
                            '<input type="button"  data-role="confirm" value="完成">',
                        '</div>',
                    '</div>'].join('');


	var Timer = Overlay.extend({
        	attrs: {
            	trigger: {
                	value: null,
	                getter: function(val) {
                    	return $(val).eq(0);
                	}
            	},
                output: {
                    value: null,
                    getter: function(val) {
                        return $(val).eq(0);
                    }
                },
            	classPrefix: "ui-time",
            	template: template,
                width:'120px',
            	// 定位配置
            	align: {
                	baseXY: [ 0, "100%-1px" ]
            	}
        	},
            events:{
                "click [data-role=now]":function(e){
                    var t = new Date();
                    var obj = $(this.element);
                    var h = t.getHours(),
                        m = t.getMinutes(),
                        s = t.getSeconds();

                    if(h<10){
                        h = '0' + h;
                    }

                    if(m<10){
                        m = '0' + m;
                    }

                    if(s<10){
                        s = '0' + s;
                    }
                    obj.find('input[data-role=hour]').val(h);
                    obj.find('input[data-role=minute]').val(m);
                    obj.find('input[data-role=second]').val(s);

                },
                "click [data-role=confirm]":function(e){
                    var obj = $(this.element);
                    var result = obj.find('input[data-role=hour]').val() + ':' + obj.find('input[data-role=minute]').val() + ':' + obj.find('input[data-role=second]').val();
                    this.get('trigger').val(result);
                    this.hide();
                },
                "keyup [data-role=hour]": function(e) {
                   var e = e || events;    
                   var currKey = e.keyCode || e.which || e.charCode;
                   var val = parseInt($(e.target).val()) || 0;
                   switch(currKey){
                        case 40:
                            if(val==0){
                                val = 23;
                            }else{
                                val--;
                            }
                            if(val<10){
                                val = '0' + val
                            }
                            $(e.target).val(val)
                            break;
                        case 38:
                            if(val==23){
                                val = 0;
                            }else{
                                val++;
                            }
                            if(val<10){
                                val = '0' + val
                            }
                            $(e.target).val(val)

                            break;
                   }
                   $(e.target).focus();                
                },
                "keyup [data-role=minute]":function(e){
                    var e = e || events;    
                   var currKey = e.keyCode || e.which || e.charCode;
                   var val = $(e.target).val() || 0;
                   switch(currKey){
                        case 40:
                            if(val==0){
                                val = 59;
                            }else{
                                val--;
                            }
                            if(val<10){
                                val = '0' + val
                            }
                            $(e.target).val(val)
                            break;
                        case 38:
                            if(val==59){
                                val = 0;
                            }else{
                                val++;
                            }
                            if(val<10){
                                val = '0' + val
                            }
                            $(e.target).val(val)

                            break;
                   }
                   $(e.target).focus();                

                },
                "keyup [data-role=second]":function(e){
                    var e = e || events;    
                    var currKey = e.keyCode || e.which || e.charCode;
                    var val = $(e.target).val() || 0;
                    switch(currKey){
                        case 40:
                            if(val==0){
                                val = 59;
                            }else{
                                val--;
                            }
                            if(val<10){
                                val = '0' + val
                            }
                            $(e.target).val(val)
                            break;
                        case 38:
                            if(val==59){
                                val = 0;
                            }else{
                                val++;
                            }
                            if(val<10){
                                val = '0' + val
                            }
                            $(e.target).val(val)

                            break;
                   } 
                   $(e.target).focus();                

                }
            },
        	setup: function() {
                this._tweakAlignDefaultValue();
                this.bindEvent();
                if(!this.get('output')){
                    this.set('output',this.get('trigger'));
                }
           		Timer.superclass.setup.call(this);
       		},
            render: function() {
                Timer.superclass.render.call(this);
                return this;
            },
            show:function(){
                Timer.superclass.show.call(this);
            },
            bindEvent:function(){
                var self = this;
                this.get('trigger').bind('click',function(){
                    self.show();
                });
            },
            _tweakAlignDefaultValue: function() {
                var align = this.get("align");
                // 默认基准定位元素为 trigger
                if (align.baseElement._id === "VIEWPORT") {
                    align.baseElement = this.get("trigger");
                }
                this.set("align", align);
            }

	});


	module.exports = Timer;
});

