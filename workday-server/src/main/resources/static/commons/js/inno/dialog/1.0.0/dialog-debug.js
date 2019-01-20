define("inno/dialog/1.0.0/dialog-debug",["$","dialog","./dialog-debug.handlebars","./dialog-debug.css"],function(require,exports,module){
	var $=require("$"),
		AraleDialog=require("dialog"),
		template = require("./dialog-debug.handlebars"),
        Events = require("events");

	var Dialog=AraleDialog.extend({
		attrs: {
            template: template,
            closeTpl:"&#xf00a5;",
            title:null,
            scrolling:false,
            frameType:false,
            ifEsc:true
        },
        setup: function () {
            if(this.get("frameType")){
                this._type="iframe"
            }
			Dialog.superclass.setup.call(this);
        },
        hide: function() {
            // 把 iframe 状态复原
            if (this._type === "iframe" && this.iframe) {
                this.iframe.attr({
                    src: ""
                });
                // 原来只是将 iframe 的状态复原
                // 但是发现在 IE6 下，将 src 置为 javascript:''; 会出现 404 页面
                this.iframe.remove();
                this.iframe = null;
            }
            Dialog.superclass.hide.call(this);
            clearInterval(this._interval);
            delete this._interval;
            return this;
        },
        parseElement:function(){
        	Dialog.superclass.parseElement.call(this);
        	this.contentElement = this.$("[data-role=content]");
            // 必要的样式
            var height = parseInt(this.get("height")) -40; 
            this.contentElement.css({
                height:  height
            });
        },
        _onRenderTitle:function(val){
        	if (val === "") {
                this.$("[data-role=title]").text(val).hide();
            } else {
                this.$("[data-role=title]").text(val).show();
            }
        },
        _createIframe:function(){
            var that = this;
            this.iframe = $("<iframe>", {
                src: "javascript:'';",
                scrolling: "auto",
                frameborder: "no",
                allowTransparency: "true",
                css: {
                    border: "none",
                    width: "100%",
                    display: "block",
                    height: "100%",
                    overflow: "auto",
                    "border-radius":"0px"
                }
            }).appendTo(this.contentElement);
            // 给 iframe 绑一个 close 事件
            // iframe 内部可通过 window.frameElement.trigger('close') 关闭
            Events.mixTo(this.iframe[0]);
            this.iframe[0].on("close", function() {
                that.hide();
            });

            if(this.get("scrolling")){
                overflow="auto";
                this.iframe.attr("scrolling","auto")
            }

        },
        // 绑定键盘事件，ESC关闭窗口
        _setupKeyEvents: function() {
            if(this.get("ifEsc")){
                this.delegateEvents($(document), "keyup", function(e) {
                    if (e.keyCode === 27) {
                        this.get("visible") && this.hide();
                    }
                });                
            }

        },
	});

	module.exports=Dialog;
});


define("inno/dialog/1.0.0/dialog-debug.handlebars", [ "handlebars-runtime" ], function(require, exports, module) {
    var Handlebars = require("handlebars-runtime");
    
    var template = Handlebars.template;
    module.exports = template(function(Handlebars, depth0, helpers, partials, data) {
        this.compilerInfo = [ 3, ">= 1.0.0-rc.4" ];
        helpers = helpers || {};
        for (var key in Handlebars.helpers) {
            helpers[key] = helpers[key] || Handlebars.helpers[key];
        }
        data = data || {};
        var buffer = "", stack1, functionType = "function", escapeExpression = this.escapeExpression;
        buffer += '<div class="';
        if (stack1 = helpers.classPrefix) {
            stack1 = stack1.call(depth0, {
                hash: {},
                data: data
            });
        } else {
            stack1 = depth0.classPrefix;
            stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        }
        buffer += escapeExpression(stack1) + '" data-dnd=true>\n <div class="';
        if (stack1 = helpers.classPrefix) {
            stack1 = stack1.call(depth0, {
                hash: {},
                data: data
            });
        } else {
            stack1 = depth0.classPrefix;
            stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        }
        buffer +=escapeExpression(stack1) + '-head"><h3 class="' + escapeExpression(stack1)  + '-title" data-role="title"></h3>  <a class="';
        if (stack1 = helpers.classPrefix) {
            stack1 = stack1.call(depth0, {
                hash: {},
                data: data
            });
        } else {
            stack1 = depth0.classPrefix;
            stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        }
        buffer += escapeExpression(stack1) + '-close iconfont-basic" title="关闭本框" href="javascript:;" data-role="close"></a>\n </div>\n   <div class="';
        if (stack1 = helpers.classPrefix) {
            stack1 = stack1.call(depth0, {
                hash: {},
                data: data
            });
        } else {
            stack1 = depth0.classPrefix;
            stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        }
        buffer += escapeExpression(stack1) + '-content" data-role="content"></div>\n</div>\n';
        return buffer;
    });
});