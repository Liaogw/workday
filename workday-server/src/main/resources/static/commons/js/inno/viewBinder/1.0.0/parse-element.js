define(function (require) {
    var $ = require('$');

    var RE_DASH_WORD = /-([a-z])/g;
    var JSON_LITERAL_PATTERN = /^\s*[\[{].*[\]}]\s*$/;
    var parseJSON = this.JSON ? JSON.parse : $.parseJSON;

    function camelCase(str) {
        return str.toLowerCase().replace(RE_DASH_WORD, function (all, letter) {
            return (letter + '').toUpperCase();
        });
    }

    // 解析并归一化配置中的值
    function normalizeValues(data) {
        for (var key in data) {
            if (data.hasOwnProperty(key)) {
                var val = data[key];
                if (typeof val !== 'string') continue;

                if (JSON_LITERAL_PATTERN.test(val)) {
                    val = val.replace(/'/g, '"');
                    data[key] = normalizeValues(parseJSON(val));
                }
                else {
                    data[key] = normalizeValue(val);
                }
            }
        }

        return data;
    }


    function normalizeValue(val) {
        if (val.toLowerCase() === 'false') {
            val = false;
        }
        else if (val.toLowerCase() === 'true') {
            val = true;
        }
        else if (/\d/.test(val) && /[^a-z]/i.test(val)) {
            var number = parseFloat(val);
            if (number + '' === val) {
                val = number;
            }
        }

        return val;
    }

    var parseElement = function (element, raw) {
        element = $(element)[0];
        var dataset = {};
        var attrs = element.attributes;
        for (var i = 0, len = attrs.length; i < len; i++) {
            var attr = attrs[i];
            var name = attr.name;

            name = camelCase(name);
            dataset[name] = attr.value;
        }
        return raw === true ? dataset : normalizeValues(dataset);
    };

    return parseElement;


});