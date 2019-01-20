define(function (require) {
    var $ = require('$'),
        Class = require('class'),
        Events = require('events'),
        uuid = 0;

    /**
     * 监控数组
     * @type {ObservableArray}
     */
    var ObservableArray = Class.create({

        Implements: [Events],

        /**
         * Get parent object
         */
        parent: function () {
        },

        /**
         * Initialize observable Array, use `Observable Model` wrap them.
         * @param data {Array}
         * @param options {Object}
         * @param options.index {String} Set the data index of the primary key, default is `id`
         */
        initialize: function (data, options) {
            options = options || {};
            this.index = options.index || 'id';
            this.length = data.length;
            this._afterDataChange(data);
            this._wrapAll(data, this);
        },

        /**
         * Use hash cache the data for quick search and set $index private key.
         * @param data
         * @private
         */
        _afterDataChange: function (data) {
            var dataHash = {};
            for (var i = 0; i < data.length; i++) {
                //如果该数据项没有主键则构造一个主键
                if (!data[i].hasOwnProperty(this.index)) {
                    data[i][this.index] = '__model_' + uuid++;
                }
                dataHash[data[i][this.index]] = i;
                //Fix http://gitlab.alibaba-inc.com/atom/view-binder/issues/1
                if (data[i].set) {
                    data[i].set('$index', i);
                } else {
                    data[i].$index = i;
                }
            }
            this._dataHash = dataHash;
        },
        /**
         * Wrap all data use `Observable Model`
         * @param data
         * @param target
         * @returns {*|Array}
         * @private
         */
        _wrapAll: function (data, target) {
            target = target || [];
            var self = this,
                parent = function () {
                    return self;
                };
            for (var i = 0; i < data.length; i++) {
                /*if (typeof data[i] == 'number' || typeof data[i] == 'string') {
                 data[i] = {
                 $this: data[i],
                 $index: i
                 };
                 } */
                target[i] = this._wrap(data[i], parent, i);
            }
            return target;
        },
        /**
         * Wrap item data use `Observable Model`
         * @param object The object needed wrap
         * @param parent The object parent object
         * @param idx The object index
         * @returns {*}
         * @private
         */
        _wrap: function (object, parent, idx) {
            var self = this;
            //如果不是类模型则转换为类模型
            //这里需要判断是否是对象

            if (object instanceof ObservableModel) {
                object.parent = parent;
                object.off('change').on('change', function (args) {
                    if (!args.action) {
                        args.action = 'itemchange';
                    }
                    var event = $.extend({}, args);
                    self.trigger('change', event);
                });
            } else if ($.isPlainObject(object)) {
                if (!(object instanceof ObservableModel)) {
                    object = new ObservableModel(object, {
                        index: self.index
                    });
                }
                object.parent = parent;
                object.on('change', function (args) {
                    //args.key = this._idx+'.'+args.key;
                    if (!args.action) {
                        args.action = 'itemchange';
                    }
                    var event = $.extend({}, args);
                    self.trigger('change', event);
                });
            }
            return object;
        },
        /**
         * Get pure data
         * @returns {Array}
         */
        toJSON: function () {
            var data = [];
            this.forEach(function (object, index) {
                if (object.toJSON) {
                    data.push(object.toJSON());
                } else {
                    data.push(object);
                }
            });
            return data;
        },
        /**
         * Simulate native array join method
         * @returns {string}
         */
        join: function () {
            return [].join.apply(this, arguments);
        },


        /**
         * Simulate native array indexOf method
         * @returns {Int}
         */
        indexOf: function (model) {
            var index = -1;
            this.forEach(function (item, i) {
                if (model === item) {
                    index = i;
                    return false;
                }
            });
            return index;
        },
        /**
         * Simulate native array pop method, remove array's last element.
         * This method will be trigger `change` event and rebuild the index.
         * @returns {Int}
         */
        pop: function () {
            var length = this.length,
                result = [].pop.apply(this);

            this._afterDataChange(this);
            if (length) {
                this.trigger('change', {
                    action: 'remove',
                    index: length - 1,
                    items: [result]
                });
            }

            return result;
        },
        /**
         * Simulate native array push method, add one or more elements.
         * This method will be trigger `change` event and rebuild the index.
         * @returns {Int}
         */
        push: function () {
            var index = this.length,
                items = this._wrapAll(arguments),
                result;

            result = [].push.apply(this, items);

            this._afterDataChange(this);
            this.trigger('change', {
                action: 'add',
                index: index,
                items: items
            });

            return result;
        },
        /**
         * Simulate native array shift method, remove first element.
         * This method will be trigger `change` event and rebuild the index.
         * @returns {Int}
         */
        shift: function () {
            var length = this.length,
                result = [].shift.apply(this);

            this._afterDataChange(this);
            if (length) {
                this.trigger('change', {
                    action: 'remove',
                    index: 0,
                    items: [result]
                });
            }
            return result;
        },
        /**
         * Simulate native array unshift method, add one or more elements at first.
         * This method will be trigger `change` event and rebuild the index.
         * @returns {Int}
         */
        unshift: function () {
            var length = this.length,
                items = this._wrapAll(arguments),
                result;

            result = [].unshift.apply(this, items);

            this._afterDataChange(this);

            this.trigger('change', {
                action: 'add',
                index: 0,
                items: items
            });
            return result;
        },
        /**
         * Simulate native array splice method
         * This method will be trigger `change` event and rebuild the index.
         * @param index {Int}
         * @param howMany {Int}
         * @param [elements] {Object}
         */
        splice: function (index, howMany) {
            var items = this._wrapAll([].slice.call(arguments, 2)),
                result, i, len;

            result = [].splice.apply(this, [index, howMany].concat(items));

            this._afterDataChange(this);

            if (result.length) {
                this.trigger('change', {
                    action: 'remove',
                    index: index,
                    items: result
                });

                for (i = 0, len = result.length; i < len; i++) {
                    if (result[i].children) {
                        result[i].off('change');
                    }
                }
            }

            if (items) {
                this.trigger('change', {
                    action: 'add',
                    index: index,
                    items: items
                });
            }


            return result;
        },
        /**
         * Simulate native array forEach method
         * @param callback
         * @returns {ObservableArray}
         */
        forEach: function (callback) {

            for (var i = 0; i < this.length; i++) {
                if (callback.call(this, this[i], i) === false) {
                    break;
                }
            }
            return this;

        },
        /**
         * Simulate native array map method
         * @param callback
         * @returns {ObservableArray}
         */
        map: function (callback) {
            var result = [];

            this.forEach(function (item, index) {
                result[index] = callback.call(item, item, index);
            });

            return result;
        },
        /**
         * Simulate native array filter method
         * @param callback
         * @returns {ObservableArray}
         */
        filter: function (callback) {
            var result = [];

            this.forEach(function (item, index) {
                if (callback.call(item, item, index)) {
                    result.push(item);
                }
            });
            return result;
        },
        /**
         * Get data by primary key.
         * @param id {String}
         * @returns {*}
         */
        getById: function (id) {
            return this[this._dataHash[id]];
        },

        remove: function (id) {

            if (id in this._dataHash) {
                var index = this._dataHash[id];
                [].splice.call(this, index, 1);
                this._afterDataChange(this);
                this.trigger('change', {
                    action: 'remove',
                    items: [this.getById(id)],
                    index: index
                });
            }
        }

    });


    var ObservableModel = Class.create({

        Implements: [Events],


        parent: function () {
        },

        initialize: function (object, options) {
            options = options || {};
            this.index = options.index || 'id';
            if (!this.hasOwnProperty(this.index)) {
                this[this.index] = '__model_' + uuid++;
            }
            this._wrapAll(object, this);
        },

        _getToJsonKey: function (key) {
            return this.hasOwnProperty(key) && typeof this[key] !== 'function' && key !== "index" && key.charAt(0) != '_' && key !== this.index;
        },

        forEach: function (callback) {

            for (var key in this) {
                if (this._getToJsonKey(key)) {
                    callback.call(this[key], this[key], key);
                }
            }
        },

        get: function (path) {
            var self = this, field = path.split('.'), val, key;
            //在这里触发get事件，为了之后的依赖关系查找
            this.trigger('get', {
                key: path
            });
            if (field.length) {
                key = field[0];
                //keyword
                if(key == '$parent'){
                    val = this.parent();
                    if(val instanceof ObservableArray){
                        val = val.parent();
                    }
                } else if(key == '$root'){
                    val = this.parent();
                    while(val.parent()){
                        val = val.parent();
                    }
                }
                //lists[1].name
                else if (key.indexOf('[') >= 0) {
                    key = key.match(/(.*)\[(.*)\]/);
                    if (key) {
                        val = this[key[1]][key[2]];
                    }
                    //lists().name
                } else if (key.indexOf('(') >= 0) {
                    key = key.match(/(.*)\(\)/);
                    if (key) {
                        if (typeof this[key[1]] === 'function') {
                            val = this[key[1]].call(self);
                        } else {
                            throw new Error('不存在的方法：[ ' + key[1] + ' ]');
                        }
                    }
                }
                else {
                    val = this[field[0]];
                }
                if (val) {
                    for (var i = 1; i < field.length; i++) {
                        if (val.get) {
                            val = val.get(field[i]);
                        } else {
                            val = val[field[i]];
                        }
                        if (typeof val === 'undefined') {
                            break;
                        }
                    }
                }
            }

            return val;
        },

        set: function (path, value, options) {

            var self = this, nested, currentValue = this.get(path);

            options = options || {};

            if (path.indexOf('.') > 0) {
                nested = true;
            }

            value = this._wrap(value, path, function () {
                return self;
            });

            if (nested) {
                this._set(this, path, value, options);
            } else {
                this[path] = value;
            }

            if (currentValue !== value && !options.disableEvent) {
                //data.list[0].name will not trigger
                //but list[0].name will trigger
                // this fix trigger multiple events
                if (!nested || (path.indexOf('[') >= 0 && !path.match(/[?:.]+.*\[/))) {
                    this.trigger('change', {
                        key: path
                    });
                }
            }
        },

        _set: function (object, path, value, options) {

            var keyNames = path.split('.'),
                keyName = keyNames[0],
                lastKey = path.slice(path.lastIndexOf('.') + 1);

            if (keyNames.length > 1) {
                object = object.get(keyName);

                if ({}.toString.call(object) == '[object Object]') {

                    keyNames.splice(0, 1);

                    return object.set(keyNames.join('.'), value);

                } else {
                    throw new Error(
                        '设置了一个不存在的对象!'
                    );
                }

            } else {
                object[path] = value;

            }
        },


        toJSON: function () {
            var object = {};

            this.forEach(function (value, key) {
                if (value && typeof value.toJSON === 'function') {
                    object[key] = value.toJSON();
                } else {
                    object[key] = value;
                }
            });

            return object;
        },
        _wrapAll: function (data, target) {

            var self = this, parent = function () {
                return self;
            };

            for (var key in data) {
                if (data.hasOwnProperty(key)) {
                    target[key] = this._wrap(data[key], key, parent);
                }
            }
        },
        _wrap: function (object, key, parent) {
            var self = this;

            if (object instanceof ObservableModel) {
                if (object.parent() != parent()) {
                    object.off('get').on('get', function (args) {
                        var currentKey = key + '.' + args.key;
                        self.trigger('get', {
                            key: currentKey
                        });
                    });
                    object.off('change').on('change', function (args) {
                        var currentKey = key + '.' + args.key,
                            event = $.extend({}, args, {
                                key: currentKey
                            });

                        self.trigger('change', event);
                    });
                }
                object.parent = parent;
            } else if (object instanceof  ObservableArray) {
                if (object.parent() != parent()) {
                    object.off('change').on('change', function (args) {
                        args.key = key;
                        var event = $.extend({}, args);
                        self.trigger('change', event);
                    });
                }
                object.parent = parent;
            }

            else if ($.isPlainObject(object)) {
                if (!(object instanceof ObservableModel)) {
                    object = new ObservableModel(object, {
                        index: self.index
                    });
                    if (object.parent() != parent()) {
                        object.on('get', function (args) {
                            var currentKey = key + '.' + args.key;
                            self.trigger('get', {
                                key: currentKey
                            });
                        });
                        object.on('change', function (args) {
                            var currentKey = key + '.' + args.key,
                                event = $.extend({}, args, {
                                    key: currentKey
                                });

                            self.trigger('change', event);
                        });
                    }
                }
                object.parent = parent;
            } else if ($.isArray(object)) {
                if (!(object instanceof  ObservableArray)) {
                    object = new ObservableArray(object, {
                        index: self.index
                    });
                    if (object.parent() != parent()) {
                        object.on('change', function (args) {

                            args.key = key;
                            var event = $.extend({}, args);
                            self.trigger('change', event);
                        });
                    }
                }
                object.parent = parent;
            }

            return object;
        }
    });

    ObservableModel.Array = ObservableArray;

    return ObservableModel;
});