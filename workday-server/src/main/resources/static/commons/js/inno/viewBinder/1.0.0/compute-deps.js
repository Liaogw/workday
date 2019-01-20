define(function (require) {

    var $ = require('$'),
        Events = require('events'),
        ObservableModel = require('./observable-model'),
        Class = require('class'),
        Filters = require('./filter');

    /**
     * 计算属性之间的依赖关系
     * @type {ComputeDeps}
     */
    var ComputeDeps = Class.create({

        Implements: [Events],


        initialize: function (config) {

            var self = this;

            this.parents = config.parents;
            this.model = config.parents[0];
            this.program = config.program;
            this.placeholder = config.placeholder;
            //获取值得路径
            this.path = config.path;
            this._source = config.source;
            //依赖缓存
            this.deps = {};
            this.deps[this.path] = true;
            //是否是监控模型
            this.isObservable = this.model instanceof ObservableModel;

            this._access = function (args) {
                self.deps[args.key] = true;
            };
            this._change = function (args) {
                self.change.call(self, args);
            };

            if (this.isObservable) {
                this.model.on('change', this._change);
            }

        },


        change: function (args) {

            var field = args.key,
                self = this;

            //如果改变的key刚好和当前path一致，则触发change事件
            $.each(this.deps, function (key, value) {

                if (key.indexOf(field) == 0) {
                    var ch = key.charAt(field.length);
                    if (!ch || ch === '.' || ch === '[') {
                        //Fix http://gitlab.alibaba-inc.com/atom/view-binder/issues/3
                        if(args.action && args.items && args.items.length){
                            var model = self.model.get(key),
                                item = args.items[0],
                                parent;
                            if(item && item.parent){
                                parent = args.items[0].parent();
                                if(model == parent){
                                    self.trigger('change', args);
                                }
                            }else{
                                self.trigger('change', args);
                            }

                        }else{
                            self.trigger('change', args);
                        }

                        return false;
                    }
                }
            });
        },

        start: function (source) {
            source.on("get", this._access);
        },

        stop: function (source) {
            source.off("get", this._access);
        },
        /**
         * 获取当前路径的值，并且在这里检测依赖关系
         * @returns {Object}
         */
        get: function () {

            var model = this.model,
                index = 0 ,
                path = this.path;

            path = path.replace(/^\s*|\s*$/g, '');

            //不是类对象返回
            if (!this.isObservable) {
                return this.model;
            }

            this.start(this.model);

            var Compiler = new Function('model','filter', this.program);


            var result = Compiler(model, Filters);

            while (result === undefined && model) {

                model = this.parents[++index];

                if (model instanceof ObservableModel) {
                    result =  Compiler(model, Filters);
                }
            }

            //层级查找

            if (result === undefined) {
                model = this.model;
                while (result === undefined && model) {
                    model = model.parent();
                    if (model instanceof ObservableModel) {
                        result = Compiler(model, Filters);
                    }
                }
            }

            if (typeof result === 'function') {

                index = path.lastIndexOf('.');

                if (index > 0) {
                    model = model.get(path.substring(0, index));
                }
                // Invoke the function
                this.start(model);
                result = result.call(model);
                this.stop(model);
            }

            if (model && model !== this.model) {

                this.currentModel = model; // save parent object

                // Listen for changes in the parent object
                model.off('change', this._change)
                    .on('change', this._change);
            }

            this.stop(this.model);

            if (result === undefined) {
                result = '';
            }

            if(this.placeholder){
                result = this.placeholder.replace('{{'+ this._source+'}}',result);
            }

            return result;

        },

        /**
         * 设置当前路径的值
         * @param value
         */
        set: function (value) {
            var model = this.currentModel || this.model;
            model.set(this.path, value);
        },
        /**
         * 解除模型改变的事件绑定
         */
        destroy: function () {
            if (this.isObservable) {
                this.model.off('change', this._change);
            }
        }
    });

    return ComputeDeps;

});