define("inno/validator/1.0.0/validator-debug",function(require,exports,module){
	var $=require("$"),
        Widget = require('widget'),
		AraleValidator=require("validator"),
        I18N = require("./i18n/zh-cn");
        ComboRules = require("./combo-rules");

    require('./rules');

	var Validator =AraleValidator.extend({
		attrs:{
			showMessage:function(message,element){
				message = '<i class="ui-tiptext-icon iconfont">&#xf009d;</i>\
                               <span class="ui-form-explain-text">' + message + '</span>';
                this.getExplain(element)
                        .addClass('ui-tiptext ui-tiptext-error')
                        .html(message);
                this.getItem(element).addClass(this.get('itemErrorClass'));
			},
            hideMessage: function(message, element) {
                this.getExplain(element).html(element.attr("data-explain") || " ")
                						.removeClass("ui-tiptext ui-tiptext-error");
                this.getItem(element).removeClass(this.get("itemErrorClass"));
            },
			itemClass:"ui-form-item-col",
            itemHoverClass: "ui-form-item-hover",
            itemFocusClass: "ui-form-item-focus",
            itemErrorClass: "ui-form-item-error",
            inputClass: "ui-input",
            textareaClass: "ui-textarea",
            checkOnSubmit:true
		},
        initialize:function(config){
            config = config || {};
            
            Validator.superclass.initialize.apply(this,arguments);

            this.parseDom = config.parseDom;
            this.renderMode = config.renderMode || 'name';

            this.formConfig = $.extend({
                GLOBAL: {
                    name: ''
                }
            }, config.formConfig);

            // 复合规则池
            this.ComboRules = $.extend(ComboRules, Validator.ComboRules, config.ComboRules);

            // 校验出错文案配置池
            this.i18ns = $.extend(I18N,Validator.i18ns,config.i18ns);

            this._preProcessErrorMessage();
        },
        _preProcessErrorMessage:function(){
            var pageI18n = this.pageI18n = {};
            var commonI18n = {};

            $.each(this.i18ns, function (key, value) {
                var pos = key.indexOf('.');
                if (~pos) {
                    var rule = key.substring(0, pos),
                        specific = key.substring(pos + 1);

                    if (!pageI18n[rule]) {
                        pageI18n[rule] = {};
                    }
                    pageI18n[rule][specific] = value;
                } else {
                    commonI18n[key] = value;
                }
            });

            Validator.setMessage(commonI18n);
        },
        showMessage: function (message, element) {
            debugger;
            if (message[0] === '@') {
                var ruleName = message.slice(1),
                    instance = Validator.query(element);

                message = instance.getMessage(ruleName);
            }
            Validator.superclass.showMessage.call(this, message, element);
        },
        execute:function(el,callback){
            var args_len = arguments.length;

            if(args_len == 0 || (args_len == 1 && $.isFunction(el))){
                Validator.superclass.execute.apply(this,arguments);
            }

            // 两个参数时，指定容器校验
            var self = this,
                el = $(el),
                els = el.find("input,select,textarea"),
                items = [],
                results = [],
                hasError = false,
                firstElem = null;

            els.each(function (i){
                var $this = $(this);
                if ($this.data("enableValidator")){
                    items.push(self.query($this));
                } 
            });

            var number = 0,
                len = items.length;

            // 在表单校验前, 隐藏所有校验项的错误提示
            $.each(items,function (i,item){

                item.get("hideMessage").call(self,null,item.element);

                item.execute(function (err, message, ele) {
                    number++;
                    // 第一个校验错误的元素
                    if (err && !hasError) {
                        hasError = true;
                        firstElem = ele;
                    }
                    results.push([].slice.call(arguments, 0));

                    // 所有元素都处理完毕
                    if (number == len) {
                        if (self.get('autoFocus') && hasError) {
                            self.trigger('autoFocus', firstElem);
                            firstElem.focus();
                        }

                        if (callback) {
                            callback(hasError, results, el[0]);
                        }
                    }
                });

            });

            return self;
        },
        addItem:function(cfgs){
            var self = this;
            cfgs = $.isArray(cfgs) ? cfgs : [cfgs];

            $.each(cfgs,function(i,config){
                self._addItem(config)
            });

            return this;
        },
        removeItem:function(selector){
            var $el = '';

            if(selector instanceof Widget){
                $el = selector.element
            }else{
                $el = $(selector)
            }

            $el.data("enableValidator",false);

            return Validator.superclass.removeItem.call(this,$el);
        },
        _getNamePattern:function(config){
            // step1 寻找name
            var renderMode = config.renderMode || this.renderMode,
                name = config.element.attr(renderMode) || '';

            // step2 name->namePattern
            var namePattern = (name || '').replace(/\[(.*?)\]/g,'[]');

            return namePattern;
        },
        _addItem:function(config){
            var $el = $(config.element),
                formConfig = this.formConfig,
                ComboRules = this.ComboRules;

            // step0 预处理
            var fieldType = config.type || getFieldType($el);
            config.rule = config.rule || '';
            config.element = $el;

            // step1 获取字段的namePattern
            var namePattern = this._getNamePattern(config);
            config.namePattern = namePattern;

            // STEP2 获取formConfig中预定义的字段配置信息
            var docConfig = formConfig[namePattern] || {};
            // !注意：在parseDomConfig及mergeDocConfig操作前，必须保证docConfig为字符串！
            docConfig.rule = docConfig.rule || '';

            // STEP3 parseDomConfig
            if (this.parseDom) {
                docConfig = parseDomConfig($el, docConfig);
            }

            // STEP4 merge docConfig; end docConfig; 后续只处理config即可
            // merge one!
            config = mergeDocConfig(config, docConfig);

            // STEP5 尝试在config中寻找comboRule定义; 并获取comboRuleConfig
            var comboRuleName = config['comboRule'];
            var comboRuleConfig = ComboRules[comboRuleName];

            // STEP6 merge comboRuleConfig
            // merge two!
            config = mergeComboRuleConfig(config, comboRuleConfig);

            // STEP7 parse 校验出错文案
            config = processErrorMessage(config, this.pageI18n, fieldType, comboRuleName, this.pageName);

            // 最终，还是没有校验信息时
            // 无校验信息时，由于return，所以tracker不会跟踪
            if (!config.required && !config.rule) {
                return;
            }

            // 标识启用了校验
            $el.data('enableValidator', true);

            // 强制添加trim校验
            if (fieldType == 'text' || fieldType == 'textarea') {
                config.rule = 'trim ' + config.rule;
            }

            Validator.superclass.addItem.call(this, config);
        },
        render: function (con, renderMode) {
            doItems.call(this, con, 'addItem', renderMode);
        },
        derender: function (con, renderMode) {
            doItems.call(this, con, 'removeItem', renderMode);
        }
	});

/**
     * 手动merge docConfig中的属性(安全，可控)
     * @param config 用户本身配置
     * @param docConfig 页面字段配置
     * @returns {*}
     */
    function mergeDocConfig(config, docConfig) {
        if (typeof config.required === 'undefined') {
            config.required = !!docConfig['required'];
        }
        if (typeof config.skipHidden === 'undefined') {
            config.skipHidden = !!docConfig['skipHidden'];
        }
        if (!config.triggerType && docConfig.triggerType) {
            config.triggerType = docConfig.triggerType;
        }
        if (docConfig['rule']) {
            config.rule = docConfig['rule'] + ' ' + config.rule;
        }

        if (!config.comboRule) {
            config.comboRule = docConfig.comboRule;
        }
        if (!config.dotId) {
            config.dotId = docConfig.dotId;
        }

        return config;
    }

    function parseDomConfig($el, docConfig) {
        var data = $el.data();
        if ($el.attr('required')) {
            docConfig['required'] = true;
        }
        if (data['rule']) {
            docConfig['rule'] += ' ' + data.rule;
        }
        if (data['comboRule']) {
            docConfig['comboRule'] = data.comboRule;
        }
        if (data['triggerType']) {
            docConfig['triggerType'] = data.triggerType;
        }
        return docConfig;
    }

// 主要是merge comboRuleConfig中的rule
    function mergeComboRuleConfig(config, comboRuleConfig) {
        if (comboRuleConfig) {
            // 核心merge
            // config.rule 往往是业务校验；comboRuleConfig.rule往往是基础规则校验
            config.rule = comboRuleConfig.rule + ' ' + (config.rule || '');
        }
        return config;
    }

    function processErrorMessage(config, pageI18n, fieldType, comboRuleName, pageName) {
        var ruleArray = config.rule.split(' ');
        ruleArray.unshift('required');
        $.each(ruleArray, function (i, rule) {
            var matches = rule.match(/([^{]*)/),
                ruleName = matches[1],
                i18nKeyPriority = [];

            // 具有自定义校验出错文案
            if (pageI18n[ruleName]) {
                var i18nKey = 'errormessage' + ruleName,
                    specifyI18n = pageI18n[ruleName];

                i18nKeyPriority.push(fieldType);    // 优先级最低
                i18nKeyPriority.push(comboRuleName);     // 优先级其次
                i18nKeyPriority.push(pageName + '.' + config.namePattern); // 优先级最高

                i18nKeyPriority.forEach(function (key) {
                    if (specifyI18n[key]) {
                        config[i18nKey] = specifyI18n[key];
                    }
                });
            }
        });
        return config;
    }

    function doItems(con, method, newRenderMode) {

        var renderMode = newRenderMode || this.renderMode,
            $con = con ? $(con) : this.element;

        var els = $con.find('input,select,textarea').get(),
            i = 0;

        // 如果自身是字段
        if (getFieldType($con)) {
            els = [$con[0]];
        }

        // 遍历每个字段，获取校验描述，通过addItem添加校验
        while (i < els.length) {
            var $el = $(els[i]),
                realName = $el.attr('name'),
                type = getFieldType($el);

            if (type == 'radio' || type == 'checkbox') {
                var j = i + 1,
                    tmp = $el.get();
                while (j < els.length) {
                    if (realName == els[j].getAttribute('name')) {
                        tmp[tmp.length] = els[j];
                        els.splice(j, 1);   // els.length 会自动减少1
                    } else {
                        j++;
                    }
                }
                $el = $(tmp);
            }

            if ('addItem' == method && !$el.data('enableValidator')) {
                this.addItem({
                    element: $el,
                    renderMode: renderMode
                });
            } else if ('removeItem' == method && $el.data('enableValidator')) {
                this.removeItem($el, renderMode);
            }
            i++;
        }
    }

    /*
     如果非字段，返回false,否则为：
     - textfield
     - hidden
     - radio
     - checkbox
     - textarea
     - select
     */
    function getFieldType(el) {
        var $el = $(el),
            dom = $el[0],
            type = false;

        switch (dom.tagName) {
            case 'TEXTAREA':
                type = 'textarea';
                break;
            case 'SELECT':
                type = 'select';
                break;
            case 'INPUT':
                type = dom.type;
                break;
            default :
                type = false;
                break;
        }
        return type;
    }

    Validator.fieldType = getFieldType;

	module.exports =Validator;
});