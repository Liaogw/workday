define(function (require) {

    var $ = require('$'),
        ObservableModel = require('./observable-model'),
        Events = require('events'),
        ComputeDeps = require('./compute-deps'),
        Class = require('class'),
        Filters = require('./filter'),
        ParseElement = require('./parse-element'),
        ParserExpression = require('./parse-expression'),
        bindTypes = {};

    var NAMESPACE_PREFIX = 'bd';

    /**
     * 通过监听ComputeDeps的改变来改变dom，需要实现refresh方法。
     * @class BinderType
     */
    var BinderType = Class.create({

        Implements: [Events],

        initialize: function (config) {
            this.element = $(config.element);
            this.links = config.computeDepsInc;
            this.bindUI();
        },
        bindUI: function () {


            if (typeof this.refresh === 'undefined') {
                throw new Error('please implement refresh method!');
            }
            if (this.links instanceof ComputeDeps) {

                this.refresh();
                this.links.on('change', this.refresh.bind(this));

            } else {
                for (var key in this.links) {
                    this['__refresh' + key] = function (args) {
                        this.refresh(key, args);
                    };
                    this.refresh(key);
                    this.links[key].on('change', this['__refresh' + key].bind(this));
                }
            }

        },
        destroy: function () {
            if (this.links instanceof ComputeDeps) {
                this.links.off('change', this.refresh.bind(this));
            } else {
                for (var key in this.links) {
                    if (this.links.hasOwnProperty(key)) {
                        this.links[key].off('change', this['__refresh' + key].bind(this));
                    }
                }
            }
        }
    });

    /**
     * 为Target元素与ComputeDeps之间建立联系
     * @class Target
     * @example
     *  var target = new Target({
     *      element:'#test',
     *      model:{title:"subject"}
     *  });
     *  target.link(computeDeps);
     */
    var Target = Class.create({

        initialize: function (config) {
            this.element = config.element;
            this.model = config.model;
            this.destroyCache = [];
        },
        /**
         * 与computeDeps建立链接，创建BinderType
         * @param computeDeps
         */
        link: function (computeDeps) {

            $.each(computeDeps, function (key, computeDepsInc) {
                this.applyBindingType(key, computeDeps);
            }.bind(this));

        },

        applyBindingType: function (type, computeDeps) {

            var tagName = this.element.tagName ? this.element.tagName.toLowerCase() : '',
                binderType = bindTypes[tagName + '.' + type] || bindTypes[type],
                computeDepsInc = computeDeps[type],
                binderTypeInc;

            if (binderType) {

                binderTypeInc = new binderType({
                    element: this.element,
                    computeDepsInc: computeDepsInc
                });

                this.destroyCache.push(binderTypeInc);
            }
        },

        destroy: function () {
            var destroyCache = this.destroyCache;

            for (var i = 0; i < destroyCache.length; i++) {
                destroyCache[i].destroy();
            }
        }
    });

    /**
     * 事件的依赖值查找
     * 如果是非事件的绑定应该返回值，
     * 事件则应该返回函数
     * @type {EventsComputeDeps}
     * @extends ComputeDeps
     */
    var EventsComputeDeps = ComputeDeps.extend({

        get: function () {
            var model = this.model,
                path = this.path,
                index = 0,
                result;

            result = model.get(path);

            while (result === undefined && model) {

                model = this.parents[++index];

                if (model instanceof ObservableModel) {
                    result = model.get(path);
                }
            }

            //层级查找

            if (result === undefined) {
                model = this.model;
                while (result === undefined && model) {
                    model = model.parent();
                    if (model instanceof ObservableModel) {
                        result = model.get(path);
                    }
                }
            }

            if (result === undefined) {
                throw new Error('该路径无法获取值:[ ' + path + ' ]');
            }

            return result.bind(model);
        }
    });


    var eventsType = [
        'blur', 'change', 'dblclick', 'click',
        'mouseover', 'mouseout', 'mouseenter', 'mouseleave', 'mousedown', 'mouseup',
        'focus',
        'keydown',
        'keypress',
        'keyup',
        'submit'
    ];

    /**
     * 视图与模型绑定的类
     * @type {ViewBinder}
     */
    var ViewBinder = Class.create({

        Implements: [Events],

        initialize: function (config) {
            this.element = $(config.element);
            this.model = config.model;
            if (!(this.model instanceof ObservableModel)) {
                this.model = new ObservableModel(this.model);
            }
            this.namepacePrefix = config.prefix || NAMESPACE_PREFIX;
            this.bind(this.element, this.model);
            //Fix jquery 1.8.3 data nodeType bug.
            if (config.element && config.element.nodeType == 1) {
                this.element.data('view-binder', this);
            }
        },
        /**
         * 针对element启用绑定
         * @param element {jQuery} 需要绑定的根元素
         * @param model {ObservableModel|Object} 使用绑定的模型
         */
        bind: function (element, model) {
            element.each(function (index, el) {
                this.bindElement(el, model);
            }.bind(this));
        },
        /**
         * 针对rootEl解除绑定
         * @param rootEl {jQuery} 需要解除绑定的元素
         */
        unbind: function (rootEl) {
            rootEl = rootEl || this.element;

            rootEl.children().each(function (node) {
                var $node = $(node);
                if ($node.children().length) {
                    this.unbind($node);
                } else {
                    if ($(node).data('target')) {
                        $(node).data('target').destroy();
                    }
                }
            }.bind(this));
        },
        /**
         * 针对单个节点启用绑定
         * @param node {DOMElement} 绑定的节点
         * @param model {ObservableModel} 绑定的模型
         * @param parents
         */
        bindElement: function (node, model, parents) {
            var self = this,
                bindAttrs = this.getBinderAttribute(node),
                bindKeyDepsIncs,
                deep = true,
                target,
                childNodes = node.childNodes;

            parents = parents || [model];

            if (!$.isEmptyObject(bindAttrs) && !$(node).data('bind')) {
                if (!target) {
                    target = new Target({
                        element: node,
                        model: model
                    });
                }

                bindKeyDepsIncs = this.createComputeDepsIncs(bindAttrs, parents);

                if (bindKeyDepsIncs.each) {
                    deep = false;
                }

                target.link(bindKeyDepsIncs);

                if (node.nodeType == 1) {
                    $(node).data('target', target);
                    $(node).data('bind', true);
                }
            }

            if (deep && childNodes.length) {
                for (var i = 0; i < childNodes.length; i++) {
                    self.bindElement(childNodes[i], model, parents);
                }

            }

        },
        /**
         * 创建节点绑定所使用的表达式对象
         * @param bindAttrs
         * @param model
         */
        createComputeDepsIncs: function (bindAttrs, model) {
            var result = {},
                bindAttr;

            for(var key in bindAttrs){
                bindAttr = bindAttrs[key];
                if(key == 'attrs' || key == 'events'){
                    result[key] = this.createComputeDepsIncs(bindAttr, model);
                }else{
                    if(bindAttr.type == 'events'){
                        result[key] = new EventsComputeDeps($.extend({
                            parents: model
                        }, bindAttr));
                    }else{
                        result[key] = new ComputeDeps($.extend({
                            parents: model
                        }, bindAttr));
                    }
                }
            }

            return result;
        },


        /**
         * 从节点上获取绑定配置
         * @param node  {DOMElement}
         * @return bindAttrs {Object}
         * @example
         *
         *      <ul bd-each="list" bd-attrs="id:id" href="#purchase/{{id}}">
         *          <li>{{name}}</li>
         *          <li>{{date}}</li>
         *      </ul>
         *
         *      {
         *          each:'list',
         *          attr:{
         *              "id":"id",
         *              "href":{
         *                  type:'mustache',
         *                  key:'id',
         *                  placeHolder:'#purchase/{{id}}'
         *              }
         *          }
         *
         *      }
         */
        getBinderAttribute: function (node) {

            var bindAttrs = {},
                bindAttr;

            if (node.nodeType == 3) {
                if (bindAttr = this.getMustache(node.nodeValue)) {
                    bindAttrs['text'] = bindAttr;
                }
            } else {
                var attrs = node.attributes,
                    attr,
                    prefix = this.namepacePrefix,
                    key,
                    value,
                    type;

                if (attrs) {
                    for (var i = 0; i < attrs.length; i++) {
                        attr = attrs[i];
                        if (attr.name.indexOf(prefix + '-') >= 0) {
                            key = attr.name.replace(prefix + '-', '');
                            if(key == 'events' || key == 'action' || key == 'click'){
                                type = 'events';
                            }else{
                                type = 'attribute';
                            }
                            value = attr.value;
                            var valueArr = value.split(';');

                            if (valueArr.length < 2 && key != 'attrs' && key != 'events') {
                                bindAttrs[key] = this.getOperation(attr.value, type);
                            } else {
                                var value = value.split(';');
                                bindAttrs[key] = bindAttrs[key] || {};
                                value.forEach(function (item) {
                                    item = item.split(':');
                                    bindAttrs[key][item[0]] = this.getOperation(item[1], type);
                                }.bind(this));
                            }
                        } else if (bindAttr = this.getMustache(attr.value)) {
                            bindAttrs.attrs = bindAttrs.attrs || {};
                            bindAttrs.attrs[attr.name] = bindAttr;
                        }
                    }
                }
            }
            return bindAttrs;
        },

        getMustache: function (content) {
            var match = content.match(/\{\{([^{]*)\}\}/),
                key;

            if (match) {
                key = match[1];
                var keyOperation = this.getOperation(key, 'mustache');
                if (typeof keyOperation !== 'string') {
                    return $.extend({
                        placeholder: content
                    }, keyOperation);
                }
                return {
                    type: 'mustache',
                    path: key,
                    placeholder: content
                };
            }
            return false;
        },

        getOperation: function (key, type) {

            var parse = new ParserExpression(key).parse();

            return {
                program: parse.compile,
                type: type,
                path: parse.path,
                source: key
            };

        },

        destroy: function () {
            this.unbind();
        }
    });

    ViewBinder.addCommand = function (cmd, prop, tagName) {
        if (tagName) {
            bindTypes[tagName + '.' + cmd] = BinderType.extend(prop);
        }
        bindTypes[cmd] = BinderType.extend(prop);
    };


    ViewBinder.addCommand('text', {

        refresh: function () {
            var text = this.links.get();
            if (typeof text === 'undefined') {
                text = '';
            }
            if (this.element[0].nodeType === 3) {
                this.element[0].nodeValue = text;
            } else {
                this.element.text(text);
            }
        }
    });

    ViewBinder.addCommand('html', {

        refresh: function () {
            var html = this.links.get();
            if (typeof html === 'undefined') {
                html = '';
            }
            this.element.html(html);
        }
    });

    ViewBinder.addCommand('visible', {
        refresh: function () {
            var visible = this.links.get();
            if (visible) {
                this.element.show();
            } else {
                this.element.hide();
            }
        }
    });

    ViewBinder.addCommand('enabled', {
        refresh: function () {
            var enable = this.links.get();
            if (enable) {
                this.element.removeAttr('disabled');
            } else {
                this.element.attr('disabled', 'disabled');
            }
        }
    });

    ViewBinder.addCommand('disabled', {
        refresh: function () {

            var disabled = this.links.get();

            if (disabled) {
                this.element.attr('disabled', 'disabled');
            } else {
                this.element.removeAttr('disabled');
            }
        }
    });


    ViewBinder.addCommand('if', {

        refresh: function () {
            var el = this.element[0];
            //Fix http://gitlab.alibaba-inc.com/atom/view-binder/issues/5
            if (!this._hasGetRef) {
                this.parentNode = el.parentNode;
                this.refNode = el.nextSibling;
                if (!this.refNode) {
                    this._last = true;
                } else {
                    this._last = false;
                }
                this._hasGetRef = true;
            }

            var isShow = this.links.get();
            if (isShow) {
                if (this._last) {
                    $(this.parentNode).append(el);
                } else {
                    $(this.refNode).before(el);
                }
            } else {
                this.element.remove();
            }
        }
    });

    ViewBinder.addCommand('unless', {

        refresh: function () {
            var el = this.element[0];
            //Fix http://gitlab.alibaba-inc.com/atom/view-binder/issues/5
            if (!this._hasGetRef) {
                this.parentNode = el.parentNode;
                this.refNode = el.nextSibling;
                if (!this.refNode) {
                    this._last = true;
                } else {
                    this._last = false;
                }
                this._hasGetRef = true;
            }

            var isShow = !(this.links.get());
            if (isShow) {
                if (this._last) {
                    $(this.parentNode).append(el);
                } else {
                    $(this.refNode).before(el);
                }
            } else {
                this.element.remove();
            }
        }
    });


    ViewBinder.addCommand('each', {

        refresh: function (args) {
            args = args || {};
            if (args.action == 'add') {
                this.add(args.index, args.items);
            } else if (args.action == 'remove') {
                this.remove(args.index, args.items);
            } else if (args.action != 'itemchange') {
                this.renderUI();
            }
        },

        add: function (index, items) {

            if (this.childTemplate) {
                items.forEach(function (model, idx) {
                    var el        = $(this.childTemplate),
                        prevElInx = index + idx - 1,
                        prevEl    = prevElInx < 0 ? [] : this.element.children().eq(prevElInx);

                    if (prevEl.length) {
                        prevEl.after(el);
                    } else {
                        if(prevElInx < 0){
                            this.element.prepend(el);
                        }else{
                            this.element.append(el);
                        }
                    }

                    new ViewBinder({
                        element: el,
                        model: model
                    });
                }.bind(this));
            }
        },

        renderUI: function () {
            if (!this.childTemplate) {
                this.childTemplate = this.element.html();
            }
            this.element.empty();
            var parents = this.links.get() || [];

            parents.forEach(function (model, idx) {
                if(typeof model !== 'object'){
                    model = {
                        $value: model,
                        $this: model,
                        $index: idx
                    };
                }else{
                    model.$this = model;
                }
                var el = $(this.childTemplate);
                this.element.append(el);
                new ViewBinder({
                    element: el,
                    model: model
                });
            }.bind(this));
        },

        remove: function (index, items) {
            //检查是否是当前的数组
            items.forEach(function (item) {
                var removeItemEl = this.element.children().eq(index),
                    viewBinder = removeItemEl.data('view-binder');
                if (viewBinder) {
                    viewBinder.destroy();
                }
                removeItemEl.remove();
            }.bind(this));
        }
    });


    ViewBinder.addCommand('attrs', {

        refresh: function (key) {
            var value = this.links[key].get();
            this.element.attr(key, value);
        }
    });

    ViewBinder.addCommand('class', {
        refresh: function () {
            var value = this.links.get();
            if (this._lastClass) {
                this.element.removeClass(this._lastClass);
            }
            this.element.addClass(value);
            this._lastClass = value;
        }
    });


    ViewBinder.addCommand('events', {

        refresh: function (key) {

            if (!this._key) {
                this._key = key;
            }
            var handler = this.links[key].get();
            this.element.off(key + '.viewBinder')
                .on(key + '.viewBinder', this.links[key].model, handler);
        },

        destroy: function () {

            if (this._key) {
                var handler = this.links[key].get();
                this.element.off(this._key + '.viewBinder', handler);
            }

        }

    });

    ViewBinder.addCommand('action', {

        refresh: function () {
            var action = this.links.get();
            this.element.off('click.viewBinder')
                .on('click.viewBinder', this.links.model, action);
        }

    });

    ViewBinder.addCommand('click', {

        refresh: function () {
            var action = this.links.get();
            this.element.off('click.viewBinder')
                .on('click.viewBinder', this.links.model, action);
        }

    });

    ViewBinder.addCommand('value', {

        bindUI: function () {

            this.constructor.superclass.bindUI.call(this);
            this.element.on('keyup.viewBinder blur.viewBinder', function (e) {
                var target = $(e.target),
                    val = target.val();
                this.links.set(val);
            }.bind(this));

        },

        refresh: function () {

            var value = this.links.get();
            this.element.val(value);

        }
    });

    ViewBinder.addCommand('value', {

        bindUI: function () {

            this.constructor.superclass.bindUI.call(this);
            this.element.on('change.viewBinder', function (e) {
                var target = $(e.target),
                    val = target.val();
                this.links.set(val);
            }.bind(this));

        },

        refresh: function () {

            var value = this.links.get(),
                newValue;

            this.element.val(value);
            newValue = this.element.val();
            // Fix value null bug.
            // http://gitlab.alibaba-inc.com/atom/view-binder/issues/8
            if(newValue !== value){
                value = newValue;
                this.links.set(value);
            }else{
                this.element.find('option[value="' + value + '"]')
                    .attr('selected', 'selected');
            }
        }
    }, 'select');

    ViewBinder.addCommand('checked', {

        bindUI: function () {
            this.constructor.superclass.bindUI.call(this);
            var type = this.element.attr('type'),
                value = this.links.get();

            this.element.on('change', function () {
                var val = this.element.val(),
                    checked = this.element.prop('checked');

                if (checked) {
                    if (type == 'checkbox' && value.push) {
                        value.push(val);
                    } else {
                        if (val != null && val != "on" && val != "off") {
                            this.links.set(val);
                        } else {
                            this.links.set(checked);
                        }
                    }
                } else {
                    if (value.indexOf) {
                        var index = value.indexOf(val);
                        value.splice(index, 1);
                    } else {
                        if (val != null && val != "on" && val != "off") {
                            this.links.set(val);
                        } else {
                            this.links.set(checked);
                        }
                    }
                }
            }.bind(this));
        },
        refresh: function () {
            var value = this.links.get(),
                type = this.element.attr('type'),
                elementValue = this.element.val();

            if (type == 'checkbox') {
                if (value.indexOf) {
                    if (value.indexOf(elementValue) >= 0) {
                        this.element.prop('checked', true);
                    } else {
                        this.element.prop('checked', false);
                    }
                } else {
                    this.element.prop('checked', value);
                }
            } else if (type == 'radio' && value != null) {
                this.element.prop('checked', value == elementValue);
            }
        }

    }, 'input');

    ViewBinder.bind = function (element, model) {
        return new ViewBinder({
            element: element,
            model: model
        });
    };

    var elementsCache = {};

    ViewBinder.addElement = function (name, prop) {
        if (elementsCache[name]) {
            throw new Error('这个元素已经被注册过~');
        }

        elementsCache[name] = Class.create({

            Implements: [Events],

            initialize: function (config) {
                this.config = config;
                this.element = $(this.config.element);
                this.model = $.extend({
                    name: name
                }, this.model || {});
                this.setup(config);
                //Fix
                document.createElement(name);
            },

            setup: function (config) {

            },

            render: function () {

                this.element.append(this.template);

                this.viewBinder = new ViewBinder({
                    element: this.element,
                    model: this.model
                });


                $.extend(this, ViewBinder.parse(this.element));


                return this;
            }
        });

        for (var key in prop) {
            if (prop.hasOwnProperty(key)) {
                elementsCache[name].prototype[key] = prop[key];
            }
        }
    };

    ViewBinder.hasElement = function (name) {
        if (elementsCache[name]) {
            return true;
        }
        return false;
    };

    ViewBinder.parse = function (el) {
        var elements = $(el).find('*'),
            ElementTags = {};

        for (var i = 0; i < elements.length; i++) {
            var el = elements[i],
                tagName = el.tagName.toLowerCase();
            if (ViewBinder.hasElement(tagName)) {
                if (!$(el).data('render')) {
                    var elInc = new elementsCache[tagName]($.extend({
                        element: el
                    }, ParseElement(el))).render();
                    $(el).data('render', true);
                    ElementTags[el.id] = elInc;
                }
            }
        }

        return ElementTags;
    };

    ViewBinder.addFilter = Filters;

    ViewBinder.Model = ObservableModel;

    return ViewBinder;

});