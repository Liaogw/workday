define("inno/dialog/1.0.0/confirmbox-debug",["$","./dialog-debug","./confirmbox-debug.handlebars"],function(require,exports,module){
    var $=require("$"),
        Dialog =require("./dialog-debug"),
        template = require("./confirmbox-debug.handlebars");

    var ConfirmBox = Dialog.extend({
        attrs: {
            title: "默认标题",
            confirmTpl: '<a class="ui-button" href="javascript:;">确定</a>',
            cancelTpl: '<a class="ui-button" href="javascript:;">取消</a>',
            icon:0,//1.警告,2.错误,3.成功,4.提示;默认0  没有icon
            message: "默认内容"
        },
        setup: function() {
            ConfirmBox.superclass.setup.call(this);
            this.switchIcon();

            var model = {
                classPrefix: this.get("classPrefix"),
                message: this.get("message"),
                title: this.get("title"),
                confirmTpl: this.get("confirmTpl"),
                cancelTpl: this.get("cancelTpl"),
                hasFoot: this.get("confirmTpl") || this.get("cancelTpl")
            };
            this.set("content", template(model));
        },
        switchIcon:function(){
            var str="",
                index =this.get("icon");
            switch(index){
                case 1:
                    str="<i class='iconfont-basic' style='color:#ffb533;font-size:40px;margin-right:10px;'>&#xe6a3;</i>";
                    break;
                case 2:
                    str="<i class='iconfont-basic' style='color:#e54d4d;font-size:40px;margin-right:10px;'>&#xe682;</i>";
                    break;
                case 3:
                    str="<i class='iconfont-basic' style='color:#2bb410;font-size:40px;margin-right:10px;'>&#xf007b;</i>";
                    break;
                case 4:
                    str="<i class='iconfont-basic' style='color:#666666;font-size:40px;margin-right:10px;'>&#xf005a;</i>";
                    break;
                default:
                    str="";
            }
            var message = str + this.get("message");
            this.set("message",message);
            return str;
        },
        events: {
            "click [data-role=confirm]": function(e) {
                e.preventDefault();
                this.trigger("confirm");
            },
            "click [data-role=cancel]": function(e) {
                e.preventDefault();
                this.trigger("cancel");
                this.hide();
            }
        },
        _onChangeMessage: function(val) {
            this.$("[data-role=message]").html(val);
        },
        _onChangeTitle: function(val) {
            this.$("[data-role=title]").html(val);
        },
        _onChangeConfirmTpl: function(val) {
            this.$("[data-role=confirm]").html(val);
        },
        _onChangeCancelTpl: function(val) {
            this.$("[data-role=cancel]").html(val);
        }
    });

    ConfirmBox.alert = function(message, callback, options) {
        var defaults = {
            message: message,
            title: "",
            cancelTpl: "",
            closeTpl: "",
            onConfirm: function() {
                callback && callback();
                this.hide();
            }
        };
        new ConfirmBox($.extend(null, defaults, options)).show().after("hide", function() {
            this.destroy();
        });
    };
    ConfirmBox.confirm = function(message, title, onConfirm, onCancel, options) {
        // support confirm(message, title, onConfirm, options)
        if (typeof onCancel === "object" && !options) {
            options = onCancel;
        }
        var defaults = {
            message: message,
            title: title || "确认框",
            closeTpl: "",
            onConfirm: function() {
                onConfirm && onConfirm();
                this.hide();
            },
            onCancel: function() {
                onCancel && onCancel();
                this.hide();
            }
        };
        new ConfirmBox($.extend(null, defaults, options)).show().after("hide", function() {
            this.destroy();
        });
    };
    ConfirmBox.show = function(message, callback, options) {
        var defaults = {
            message: message,
            title: "",
            confirmTpl: false,
            cancelTpl: false
        };
        new ConfirmBox($.extend(null, defaults, options)).show().before("hide", function() {
            callback && callback();
        }).after("hide", function() {
            this.destroy();
        });
    };

    module.exports = ConfirmBox;

});

define("inno/dialog/1.0.0/dialog-debug",["$","dialog","./dialog-debug.handlebars","./dialog-debug.css"],function(require,exports,module){
	var $=require("$"),
		AraleDialog=require("dialog"),
		template = require("./dialog-debug.handlebars");

        require("./dialog-debug.css");

	var Dialog=AraleDialog.extend({
		attrs: {
            template: template,
            closeTpl:"&#xf00a5;",
            title:null,
            ifEsc:true
        },
        setup: function () {
			Dialog.superclass.setup.call(this);
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
        // 绑定键盘事件，ESC关闭窗口
        _setupKeyEvents: function() {
            if(this.get("ifEsc")){
                this.delegateEvents($(document), "keyup", function(e) {
                    if (e.keyCode === 27) {
                        this.get("visible") && this.hide();
                    }
                });                
            }

        }
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
        buffer += escapeExpression(stack1) + '">\n <div class="';
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


define("inno/dialog/1.0.0/confirmbox-debug.handlebars", [ "handlebars-runtime" ], function(require, exports, module) {
    var Handlebars = require("handlebars-runtime");
    var template = Handlebars.template;
    module.exports = template(function(Handlebars, depth0, helpers, partials, data) {
        this.compilerInfo = [ 3, ">= 1.0.0-rc.4" ];
        helpers = helpers || {};
        for (var key in Handlebars.helpers) {
            helpers[key] = helpers[key] || Handlebars.helpers[key];
        }
        data = data || {};
        var buffer = "", stack1, functionType = "function", escapeExpression = this.escapeExpression, self = this;

        function program3(depth0, data) {
            var buffer = "", stack1;
            buffer += '\n    <div class="';
            if (stack1 = helpers.classPrefix) {
                stack1 = stack1.call(depth0, {
                    hash: {},
                    data: data
                });
            } else {
                stack1 = depth0.classPrefix;
                stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
            }
            buffer += escapeExpression(stack1) + '-operation" data-role="foot">\n        ';
            stack1 = helpers["if"].call(depth0, depth0.confirmTpl, {
                hash: {},
                inverse: self.noop,
                fn: self.program(4, program4, data),
                data: data
            });
            if (stack1 || stack1 === 0) {
                buffer += stack1;
            }
            buffer += "\n        ";
            stack1 = helpers["if"].call(depth0, depth0.cancelTpl, {
                hash: {},
                inverse: self.noop,
                fn: self.program(6, program6, data),
                data: data
            });
            if (stack1 || stack1 === 0) {
                buffer += stack1;
            }
            buffer += "\n    </div>\n    ";
            return buffer;
        }
        function program4(depth0, data) {
            var buffer = "", stack1;
            buffer += '\n        <div class="';
            if (stack1 = helpers.classPrefix) {
                stack1 = stack1.call(depth0, {
                    hash: {},
                    data: data
                });
            } else {
                stack1 = depth0.classPrefix;
                stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
            }
            buffer += escapeExpression(stack1) + '-confirm" data-role="confirm">\n            ';
            if (stack1 = helpers.confirmTpl) {
                stack1 = stack1.call(depth0, {
                    hash: {},
                    data: data
                });
            } else {
                stack1 = depth0.confirmTpl;
                stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
            }
            if (stack1 || stack1 === 0) {
                buffer += stack1;
            }
            buffer += "\n        </div>\n        ";
            return buffer;
        }
        function program6(depth0, data) {
            var buffer = "", stack1;
            buffer += '\n        <div class="';
            if (stack1 = helpers.classPrefix) {
                stack1 = stack1.call(depth0, {
                    hash: {},
                    data: data
                });
            } else {
                stack1 = depth0.classPrefix;
                stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
            }
            buffer += escapeExpression(stack1) + '-cancel" data-role="cancel">\n            ';
            if (stack1 = helpers.cancelTpl) {
                stack1 = stack1.call(depth0, {
                    hash: {},
                    data: data
                });
            } else {
                stack1 = depth0.cancelTpl;
                stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
            }
            if (stack1 || stack1 === 0) {
                buffer += stack1;
            }
            buffer += "\n        </div>\n        ";
            return buffer;
        }
       
        if (stack1 || stack1 === 0) {
            buffer += stack1;
        }
        buffer += '\n<div class="';
        if (stack1 = helpers.classPrefix) {
            stack1 = stack1.call(depth0, {
                hash: {},
                data: data
            });
        } else {
            stack1 = depth0.classPrefix;
            stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        }
        buffer += escapeExpression(stack1) + '-container">\n    <div class="';
        if (stack1 = helpers.classPrefix) {
            stack1 = stack1.call(depth0, {
                hash: {},
                data: data
            });
        } else {
            stack1 = depth0.classPrefix;
            stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        }
        buffer += escapeExpression(stack1) + '-message" data-role="message">';
        if (stack1 = helpers.message) {
            stack1 = stack1.call(depth0, {
                hash: {},
                data: data
            });
        } else {
            stack1 = depth0.message;
            stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        }
        if (stack1 || stack1 === 0) {
            buffer += stack1;
        }
        buffer += "</div>\n    ";
        stack1 = helpers["if"].call(depth0, depth0.hasFoot, {
            hash: {},
            inverse: self.noop,
            fn: self.program(3, program3, data),
            data: data
        });
        if (stack1 || stack1 === 0) {
            buffer += stack1;
        }
        buffer += "\n</div>\n";
        return buffer;
    });
});


