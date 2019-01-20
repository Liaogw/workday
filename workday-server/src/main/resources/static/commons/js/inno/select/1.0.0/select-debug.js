define("inno/select/1.0.0/select-debug",["$", "select", "./select-tpl"],function (require, exports, module) {
    var $ = require('$');
    var AraleSelect = require('select');
    var template = require("./select-tpl");
 
    var Select = AraleSelect.extend({
        attrs: {
            template: template,
            text:'',
            // 置空
            classPrefix: 'ui-select'
        },
        setup: function () {
            Select.superclass.setup.call(this);
            // var trigger=this.get("trigger");
            // if(trigger.find("input[type='hidden']").length>0){

            // }
            // if(){
                
            // }
 
            this.before('show', function () {
                var selected = this.options.eq(this.get('selectedIndex'));
 
                if (selected) {
                    // 先取消 class，再赋值
                    this.$('.selected').removeClass('selected');
 
                    selected.addClass('selected');
                }
            });
        },
        selectValue:function(option){
            var options =this.options,
                index=0;
            for(var i =0;i< options.length;i++){
                if(option == $(options[i]).attr("data-value")){
                    index=i;
                    break;
                }
            }
            this.select(index);
           
        },
        // ui
        _onRenderVisible: function (val) {
            Select.superclass._onRenderVisible.apply(this, arguments);
 
            // 追加 opened 状态的class
            this.get('trigger').toggleClass('opened', val);
        },
 
        _onRenderDisabled: function (val) {
            this.get('trigger').toggleClass('disabled', val);
 
            // trigger event
            var selected = this.options.eq(this.get('selectedIndex'));
            this.trigger('disabledChange', selected, val);
        },
        _onRenderSelectedIndex: function(index) {
            Select.superclass._onRenderSelectedIndex.apply(this,arguments);
            var selected = this.options.eq(index);
            this.set("text",selected.html());
        }
    });
 
    module.exports = Select;
});



define("inno/select/1.0.0/select-tpl", [ "handlebars-runtime" ], function(require, exports, module) {
    var Handlebars = require("handlebars-runtime");
    var template = Handlebars.template;
    module.exports = template(function(Handlebars, depth0, helpers, partials, data) {
        this.compilerInfo = [ 3, ">= 1.0.0-rc.4" ];
        helpers = helpers || {};
        for (var key in Handlebars.helpers) {
            helpers[key] = helpers[key] || Handlebars.helpers[key];
        }
        data = data || {};
        var buffer = "", stack1, functionType = "function", escapeExpression = this.escapeExpression, self = this, helperMissing = helpers.helperMissing;
        function program1(depth0, data, depth1) {
            var buffer = "", stack1, stack2, options;
            buffer += '\n        <li data-role="item"\n          class="' + escapeExpression((stack1 = depth1.classPrefix, 
            typeof stack1 === functionType ? stack1.apply(depth0) : stack1)) + "-item ";
            stack2 = helpers["if"].call(depth0, depth0.disabled, {
                hash: {},
                inverse: self.noop,
                fn: self.programWithDepth(2, program2, data, depth1),
                data: data
            });
            if (stack2 || stack2 === 0) {
                buffer += stack2;
            }
            buffer += '"\n          data-value="';
            if (stack2 = helpers.value) {
                stack2 = stack2.call(depth0, {
                    hash: {},
                    data: data
                });
            } else {
                stack2 = depth0.value;
                stack2 = typeof stack2 === functionType ? stack2.apply(depth0) : stack2;
            }
            buffer += escapeExpression(stack2) + '"\n          data-defaultSelected="';
            options = {
                hash: {},
                data: data
            };
            buffer += escapeExpression((stack1 = helpers.output, stack1 ? stack1.call(depth0, depth0.defaultSelected, options) : helperMissing.call(depth0, "output", depth0.defaultSelected, options))) + '"\n          data-selected="';
            options = {
                hash: {},
                data: data
            };
            buffer += escapeExpression((stack1 = helpers.output, stack1 ? stack1.call(depth0, depth0.selected, options) : helperMissing.call(depth0, "output", depth0.selected, options))) + '"\n          data-disabled="';
            options = {
                hash: {},
                data: data
            };
            buffer += escapeExpression((stack1 = helpers.output, stack1 ? stack1.call(depth0, depth0.disabled, options) : helperMissing.call(depth0, "output", depth0.disabled, options))) + '">';
            if (stack2 = helpers.text) {
                stack2 = stack2.call(depth0, {
                    hash: {},
                    data: data
                });
            } else {
                stack2 = depth0.text;
                stack2 = typeof stack2 === functionType ? stack2.apply(depth0) : stack2;
            }
            if (stack2 || stack2 === 0) {
                buffer += stack2;
            }
            buffer += "</li>\n        ";
            return buffer;
        }
        function program2(depth0, data, depth2) {
            var buffer = "", stack1;
            buffer += escapeExpression((stack1 = depth2.classPrefix, typeof stack1 === functionType ? stack1.apply(depth0) : stack1)) + "-item-disabled";
            return buffer;
        }
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
        buffer += escapeExpression(stack1) + '">\n    <ul class="';
        if (stack1 = helpers.classPrefix) {
            stack1 = stack1.call(depth0, {
                hash: {},
                data: data
            });
        } else {
            stack1 = depth0.classPrefix;
            stack1 = typeof stack1 === functionType ? stack1.apply(depth0) : stack1;
        }
        buffer += escapeExpression(stack1) + '-content" data-role="content">\n        ';
        stack1 = helpers.each.call(depth0, depth0.select, {
            hash: {},
            inverse: self.noop,
            fn: self.programWithDepth(1, program1, data, depth0),
            data: data
        });
        if (stack1 || stack1 === 0) {
            buffer += stack1;
        }
        buffer += "\n    </ul>\n</div>\n";
        return buffer;
    });
});
