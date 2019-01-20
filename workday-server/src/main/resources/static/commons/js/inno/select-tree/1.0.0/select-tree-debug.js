define("inno/select-tree/1.0.0/select-tree-debug",[ "overlay", "$", "position", "iframe-shim", "widget", "base", "class", "events", "templatable", "handlebars", "./select-debug.handlebars","./select-tree-debug.css" ],function(require,exports,module){
	var Overlay = require("overlay");
    var $ = require("$");
    var Templatable = require("templatable");
    var template = require("./select-debug.handlebars");

    require("./select-tree-debug.css");

    var keyTimeout;
    var lastFilter = '';
    var timeout;
    if (timeout === undefined) {
        timeout = 200;
    } 

	var SelectTree=Overlay.extend({
		Implements: Templatable,
		attrs:{
			trigger: {
                value: null,
                // required
                getter: function(val) {
                    return $(val).eq(0);
                }
            },
            classPrefix: "ui-select-tree",
            template: template,
            // 定位配置
            align: {
                baseXY: [ 0, "100%-1px" ]
            },
            // trigger 的 tpl
            triggerTpl: '<a href="#"></a>',
            // 原生 select 的属性
            name: "",
            value: "",
            length: 0,
            selectedIndex: -1,
            mult: true,
            cascade:true,
            // TODO
            disabled: false,
            maxHeight: null,
            textSelected:false,
            checkSelect:function(target,mult){
                return true;
            },
            checkAfter:function(triggers){

            },
            // 以下不要覆盖
            selectSource: null
		},
		events: {
            click:function(e){
                e.stopPropagation();
            },
            "click [data-role=item]": function(e) {
                var target = $(e.currentTarget),bln=true;
                if(!target.data("disabled")){
                    // this.select(target);
                }
               	e.stopPropagation();
            },
            "click [data-role=text]":function(e){
                var checkTrigger;
                if(this.get('textSelected')){
                    var element =this.element,
                        targetCheck=$(e.currentTarget).prev();
                    
                    checkTrigger =element.find(".ui-select-tree-check");
                    if(targetCheck.is(".ui-select-tree-checked")){  
                        checkTrigger.removeClass("ui-select-tree-checked");
                    }else{
                        checkTrigger.removeClass("ui-select-tree-checked");
                        targetCheck.addClass("ui-select-tree-checked");
                    }

                    this.get("checkAfter").call(this,checkTrigger);
                    this.multSelect();
                    e.stopPropagation();                
                }
            },
            "click [data-role=check]":function(e){
				var target =$(e.currentTarget).parent(),
					bln=true,
				 	checkTrigger,
				 	mult =this.get("mult"),
                    cascade =this.get("cascade");
                if(this.get("checkSelect").call(this,target,mult)){
                    
                    if(!$(target).is(".ui-select-tree-item-disabled")){
                        if(mult){
                            checkTrigger= cascade ? target.find(".ui-select-tree-check") : target.find(".ui-select-tree-check").eq(0) ;
                            for(var i=0,j=checkTrigger.length;i<j;i++){
                                if(!checkTrigger.eq(i).is(".ui-select-tree-disabled")){
                                    if(!checkTrigger.eq(i).is(".ui-select-tree-checked")){
                                        bln=false;
                                        break;
                                    }
                                }
                            }
                            if(bln){    
                                checkTrigger.removeClass("ui-select-tree-checked");
                            }else{
                                for(var o=0,len=checkTrigger.length;o<len;o++){
                                    if(!checkTrigger.eq(o).is(".ui-select-tree-disabled")){
                                        checkTrigger.eq(o).addClass("ui-select-tree-checked");
                                    }
                                }                                
                            }
                        }else{
                            var element =this.element,
                                targetCheck=$(e.currentTarget);
                            checkTrigger =element.find(".ui-select-tree-check");
                            if(targetCheck.is(".ui-select-tree-checked")){  
                                checkTrigger.removeClass("ui-select-tree-checked");
                            }else{
                                checkTrigger.removeClass("ui-select-tree-checked");
                                targetCheck.addClass("ui-select-tree-checked");
                            }
                        }
                    }
                    
                };   
                this.get("checkAfter").call(this,checkTrigger);
                this.multSelect();
                e.stopPropagation();                
            },
            "click [data-role=open]":function(e){
            	var target =$(e.currentTarget);
            	if(target.is(".ui-select-tree-open")){
            		target.removeClass("ui-select-tree-open");
            		target.parent().find("ul").eq(0).hide();
            	}else{
            		target.addClass("ui-select-tree-open");
            		target.parent().find("ul").eq(0).show();
            	}
				e.stopPropagation();
            },
            "mouseenter [data-role=item]": function(e) {
                var target = $(e.currentTarget);
                if(!target.data("disabled")){
                    $(e.currentTarget).addClass(this.get("classPrefix") + "-hover");
                }
            },
            "mouseleave [data-role=item]": function(e) {
                var target = $(e.currentTarget);
                if(!target.data("disabled")){
                    $(e.currentTarget).removeClass(this.get("classPrefix") + "-hover");
                }
            }
        },
		initAttrs: function(config, dataAttrsConfig) {
            SelectTree.superclass.initAttrs.call(this, config, dataAttrsConfig);
            var selectName,trigger = this.get("trigger");

            trigger.addClass(getClassName(this.get("classPrefix"),"trigger"));
            if (trigger[0].tagName.toLowerCase() == "select") {
                // 初始化 name
                // 如果 select 的 name 存在则覆盖 name 属性
                var selectName = trigger.attr("name");
                if (selectName) {
                    this.set("name", selectName);
                }
                // 替换之前把 select 保存起来
                this.set("selectSource", trigger);
                // 替换 trigger
                var newTrigger = $(this.get("triggerTpl")).addClass(getClassName(this.get("classPrefix"), "trigger"));
                this.set("trigger", newTrigger);
                this._initFromSelect = true;
                // 隐藏原生控件
                // 不用 hide() 的原因是需要和 arale/validator 的 skipHidden 来配合
                trigger.after(newTrigger).css({
                    position: "absolute",
                    left: "-99999px",
                    zIndex: -100
                });
                // trigger 如果为 select 则根据 select 的结构生成
                this.set("model", convertSelect(trigger[0], this.get("classPrefix")));
            } else {
                // 如果 name 存在则创建隐藏域
                var selectName = this.get("name");
                if (selectName) {
                    var input = $("input[name=" + selectName + "]").eq(0);
                    if (!input[0]) {
                        input = $('<input type="text" id="select-' + selectName.replace(/\./g, "-") + '" name="' + selectName + '" />').css({
                            position: "absolute",
                            left: "-99999px",
                            zIndex: -100
                        }).insertAfter(trigger);
                    }
                    this.set("selectSource", input);
                }
                // trigger 如果为其他 DOM，则由用户提供 model
                this.set("model", completeModel(this.get("model"), this.get("classPrefix")));
            }
        },
		templateHelpers:{
            output:function(data){
                return data +"";
            }
        },
        setup:function(){
            
			this._bindEvents();
            this._initOptions();
            this._initHeight();
            this._tweakAlignDefaultValue();
            // 调用 overlay，点击 body 隐藏
            // this._blurHide(this.get("trigger"));
            this.hide();
            SelectTree.superclass.setup.call(this);
            this._filter();
        },
        hide:function(){
			this.element["hide"]();
        },
        show:function(){
			this.element["show"]();
        },
        render: function() {
            SelectTree.superclass.render.call(this);
            this._setTriggerWidth();
            return this;
        },
        destroy: function() {
            if (this._initFromSelect) {
                this.get("trigger").remove();
            }
            this.get("selectSource") && this.get("selectSource").remove();
            this.element.remove();
            SelectTree.superclass.destroy.call(this);
        },
        // 方法接口
        // --------
        multSelect:function(){
			var items = this.element.find("[data-role=item]"),
				text="",
				value="",
				triggerContent=this.get("trigger").find("[data-role=trigger-content]"),
				triggerValue =this.get("selectSource");

			for(var i=0,j=items.length;i<j;i++){
				if(items.eq(i).find("[data-role=check]").eq(0).is(".ui-select-tree-checked")){
					text += items.eq(i).find("[data-role=text]").eq(0).text() + ",";
					value += items.eq(i).attr("data-value") + ",";
				}
			}
            this.set("value",value);
			triggerValue.val(value);
			triggerContent.html(text);
            this.trigger('change');
        },
        selectValue:function(str){
			var array=str.split(","),
				items =this.element,
                obj;

			for(var i=0,j=array.length;i<j;i++){
				obj=items.find("[data-value="+ array[i] +"]").find("[data-role=check]").eq(0);
                if(!obj.is(".ui-select-tree-disabled")){
                    obj.addClass("ui-select-tree-checked");
                }else{
                    alert(array[i] + "是禁选对象，请检查数据");
                    return false;
                }
                
			}
			this.multSelect();
        },
        syncModel: function(model) {
            this.set("model", completeModel(model, this.get("classPrefix")));
            this.renderPartial("[data-role=content]");
            // 同步原来的 select
            syncSelect(this.get("selectSource"), model);
            // 渲染后重置 select 的属性
            this.options = this.$("[data-role=content]").children();
            this.set("length", this.options.length);
            this.set("selectedIndex", -1);
            this.set("value", "");
            var selectIndex = getOptionIndex("[data-selected=true]", this.options);
            var oldSelectIndex = this.get("selectedIndex");
            this.set("selectedIndex", selectIndex);
            // 重新设置 trigger 宽度
            this._setTriggerWidth();
            return this;
        },
        resetSelect:function(){
            var items = this.element.find(".ui-select-tree-checked");
            items.removeClass("ui-select-tree-checked");
            this.multSelect();
        },
        // 私有方法
        // ------------
        _bindEvents: function() {
            var trigger = this.get("trigger"),
            	element = this.get("element"),
            	that =this;
            this.delegateEvents(trigger, "mousedown", this._triggerHandle);
            this.delegateEvents(trigger, "click", function(e) {
                if(!that.get('disabled')){
                    that.show();
                }
            	e.stopPropagation();
                e.preventDefault();
            });
            this.delegateEvents(trigger, "mouseenter", function(e) {
                trigger.addClass(getClassName(this.get("classPrefix"), "trigger-hover"));
            });
            this.delegateEvents(trigger, "mouseleave", function(e) {
                trigger.removeClass(getClassName(this.get("classPrefix"), "trigger-hover"));
            });

            this.delegateEvents(document, "click", function(e) {
            	that.hide();
            });

            this.delegateEvents(element,"click",function(e){
				e.stopPropagation();
            });

        },
        _initOptions: function() {
            this.options = this.$("[data-role=content]").children();
            // 初始化 select 的参数
            // 必须在插入文档流后操作
            this.multSelect();
            this.set("length", this.options.length);
        },
        // trigger 的宽度和浮层保持一致
        _setTriggerWidth: function() {
            var trigger = this.get("trigger");
            var width = this.element.outerWidth();
            var pl = parseInt(trigger.css("padding-left"), 10);
            var pr = parseInt(trigger.css("padding-right"), 10);
            // maybe 'thin|medium|thick' in IE
            // just give a 0
            var bl = parseInt(trigger.css("border-left-width"), 10) || 0;
            var br = parseInt(trigger.css("border-right-width"), 10) || 0;
            trigger.css("width", width - pl - pr - bl - br);
        },
        // borrow from dropdown
        // 调整 align 属性的默认值, 在 trigger 下方
        _tweakAlignDefaultValue: function() {
            var align = this.get("align");
            // 默认基准定位元素为 trigger
            if (align.baseElement._id === "VIEWPORT") {
                align.baseElement = this.get("trigger");
            }
            this.set("align", align);
        },
        _initHeight: function() {
            this.after("show", function() {
                var maxHeight = this.get("maxHeight");
                if (maxHeight) {
                    this.set("height", maxHeight);
                }else{
                	var ul = this.$("[data-role=content]");
                    var height = getLiHeight(ul);
                    this.set("height", height > maxHeight ? maxHeight : "");
                    ul.scrollTop(0);
                }
            });
        },
        _filter:function(){
            this.element.find(".ui-select-tree-filter input").change(function() {
                var filterValue = $(this).val().toLowerCase(),
                    list = $(this).parent().next(".ui-select-tree-content");
                
                filter(list, filterValue);

                return false;
            }).keydown(function() {

                clearTimeout(keyTimeout);
                var that =this;
                keyTimeout = setTimeout(function() {
                    if( $(that).val() === lastFilter ) return;
                    lastFilter = $(that).val();
                    $(that).change();
                }, timeout);
            });
        }
	})	
	module.exports=SelectTree;

	function convertSelect(select, classPrefix) {
        var i, model = [], options = select.options, l = options.length, hasDefaultSelect = false;
        for (i = 0; i < l; i++) {
            var j, o = {}, option = options[i];
            var fields = [ "text", "value", "defaultSelected", "selected", "disabled" ];
            for (j in fields) {
                var field = fields[j];
                o[field] = option[field];
            }
            if (option.selected) hasDefaultSelect = true;
            model.push(o);
        }
        // 当所有都没有设置 selected，默认设置第一个
        if (!hasDefaultSelect && model.length) {
            model[0].selected = "true";
        }
        return {
            select: model,
            classPrefix: classPrefix
        };
    }
    // 补全 model 对象
    function completeModel(model, classPrefix) {
        var i, j, l, ll, newModel = [], selectIndexArray = [];
        for (i = 0, l = model.length; i < l; i++) {
            var o = $.extend({}, model[i]);
            if (o.selected) selectIndexArray.push(i);
            o.selected = o.defaultSelected = !!o.selected;
            o.disabled = !!o.disabled;
            newModel.push(o);
        }
        if (selectIndexArray.length > 0) {
            // 如果有多个 selected 则选中最后一个
            selectIndexArray.pop();
            for (j = 0, ll = selectIndexArray.length; j < ll; j++) {
                newModel[selectIndexArray[j]].selected = false;
            }
        } else {
            //当所有都没有设置 selected 则默认设置第一个
            newModel[0].selected = true;
        }
        return {
            select: newModel,
            classPrefix: classPrefix
        };
    }
    function getOptionIndex(option, options) {
        var index;
        if ($.isNumeric(option)) {
            // 如果是索引
            index = option;
        } else if (typeof option === "string") {
            // 如果是选择器
            index = options.index(options.parent().find(option));
        } else {
            // 如果是 DOM
            index = options.index(option);
        }
        return index;
    }
    function syncSelect(select, model) {
        if (!(select && select[0])) return;
        select = select[0];
        if (select.tagName.toLowerCase() === "select") {
            $(select).find("option").remove();
            for (var i in model) {
                var m = model[i];
                var option = document.createElement("option");
                option.text = m.text;
                option.value = m.value;
                select.add(option);
            }
        }
    }
    // 获取 className ，如果 classPrefix 不设置，就返回 ''
    function getClassName(classPrefix, className) {
        if (!classPrefix) return "";
        return classPrefix + "-" + className;
    }
    // 获取 ul 中所有 li 的高度
    function getLiHeight(ul) {
        var height = 0;
        ul.find("li").each(function(index, item) {
            height += $(item).outerHeight();
        });
        return height;
    }
    // 关键字筛选 item
    function filter(ulObject,filterValue){
        if(!ulObject.is('ul') && !ulObject('ol')){
            return false;
        }
        var children = ulObject.children("li"),
            result = false;
        for(var i=0,len=children.length;i<len;i++){
            var liObject = $(children[i]);
            if (liObject.is('li')) {
                var display = false;
                if(liObject.children("ul").length > 0){
                    for(var j = 0,cLen = liObject.children("ul").length;j < cLen;j++){
                        var subDisplay = filter($(liObject.children("ul")[j]),filterValue);
                        display = display || subDisplay;
                    }
                }
                if(!display){
                    var text = liObject.text();
                    display = text.toLowerCase().indexOf(filterValue) >= 0;
                }
                liObject.css('display', display ? '' : 'none');

                result = result || display;
            };
        }
        return result;
    }


});



define("inno/select-tree/1.0.0/select-debug.handlebars", [ "handlebars-runtime" ], function(require, exports, module) {
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
            var buffer = "", stack1, stack2, options,className="";
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
            buffer += escapeExpression((stack1 = helpers.output, stack1 ? stack1.call(depth0, depth0.selected, options) : helperMissing.call(depth0, "output", depth0.selected, options))) + '"\n' ;
            if(depth0.attrs){
                for(var i in depth0.attrs){
                    buffer += ' data-' + depth0.attrs[i]["name"] + '="' + depth0.attrs[i]["value"] + '"';
                }
            }
            buffer += '          data-disabled="';
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
            	if(depth0.open){
					className =escapeExpression((stack1 = depth1.classPrefix, 
            typeof stack1 === functionType ? stack1.apply(depth0) : stack1)) +"-open "
            	}
            	buffer += "<span class=\"" + className + escapeExpression((stack1 = depth1.classPrefix, 
            typeof stack1 === functionType ? stack1.apply(depth0) : stack1)) +"-swicth\" data-role=\"open\"></span> \n";
            	buffer += "<span class=\"" + escapeExpression((stack1 = depth1.classPrefix, 
            typeof stack1 === functionType ? stack1.apply(depth0) : stack1)) +"-check ";
            if(depth0.disabled){
                buffer += escapeExpression((stack1 = depth1.classPrefix, 
            typeof stack1 === functionType ? stack1.apply(depth0) : stack1)) +"-disabled ";
            }
                buffer+="\" data-role=\"check\"></span> \n";
                if(depth0.icon){
                    buffer += "<img class=\""+ escapeExpression((stack1 = depth1.classPrefix, 
            typeof stack1 === functionType ? stack1.apply(depth0) : stack1)) +"-icon\" src=\""+ depth0.icon +"\"> \n";
                }
                buffer += "<a data-role='text'>" + stack2 + "</a> \n";
            }
            if(depth0.child){

            	buffer += depth0.open ? "<ul> \n" :"<ul style='display:none'> \n";
            	for(var i in depth0.child){
            		buffer += program1(depth0.child[i],data, depth1);
            	}
            	
            	buffer +="</ul> \n";
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
        buffer += escapeExpression(stack1) + '">\n  ';
        buffer += '  <div class="' + escapeExpression(stack1) + '-filter"> \n ';
        buffer += '     <input type="text"  />\n'
        buffer += '  </div>';
        buffer += '  <ul class="';
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


