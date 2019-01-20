define(function () {
    var isNumber = function (char) {
        var isn = true;
        for (var i = 0; i < char.length; i++) {
            if (isNaN(parseInt(char.charAt(i), 10))) {
                isn = false;
                break;
            }
        }
        return isn;
    };

    var lexer = function (input) {
        var
            buffer = '',
            tokens = [],
            state = 'KeyBegin',
            i = 0;
        for (var char; (char = input.charAt(i)); i++) {
            switch (char) {
                case '\'':
                case '"':
                    switch (state) {
                        case 'StringBegin':
                            string = buffer;
                            buffer = '';
                            tokens.push({
                                type: 'STRING',
                                value: string,
                                pos: i
                            });
                            break;
                        case 'KeyBegin':
                            if (buffer) {
                                if (isNumber(buffer)) {
                                    tokens.push({
                                        type: "NUMBER",
                                        value: buffer,
                                        pos: i
                                    });
                                } else {
                                    tokens.push({
                                        type: "KEY",
                                        value: buffer, pos: i
                                    });
                                }

                                buffer = '';
                            } else {
                                oldState = state;
                                state = 'StringBegin';
                            }
                            break;
                    }
                    break;
                case ' ':
                    if (state == 'StringBegin') {
                        buffer += char;
                    }
                    break;
                case '|':

                    if (state == 'KeyBegin') {
                        if (buffer) {
                            tokens.push({
                                type: "KEY",
                                value: buffer, pos: i
                            });
                            buffer = '';
                        } else {
                            throw new Error(input + ' parse error at' + i);
                        }
                    }
                    var token = input.charAt(i + 1);
                    if (token == '|') {
                        tokens.push({
                            type: 'OPER',
                            value: '||'
                        });
                        i++;
                    } else {
                        state = 'FilterBegin';
                    }

                    break;

                case "~":
                    if (state == 'FilterBegin') {
                        if (buffer) {
                            tokens.push({
                                type: "FILTER",
                                value: buffer, pos: i
                            });
                            buffer = '';
                        } else {
                            throw new Error(input + ' parse error at' + i);
                        }
                        tokens.push({
                            type: "OPER",
                            value: char,
                            pos: i
                        });
                    }

                case ":":
                    switch (state) {
                        case 'KeyBegin':
                            if (buffer) {
                                if (isNumber(buffer)) {
                                    tokens.push({
                                        type: "NUMBER",
                                        value: buffer, pos: i
                                    });
                                } else {
                                    tokens.push({
                                        type: "KEY",
                                        value: buffer, pos: i
                                    });
                                }
                                buffer = '';
                            } else {
                                throw new Error(input + ' parse error at' + i);
                            }
                            tokens.push({
                                type: "OPER",
                                value: char,
                                pos: i
                            });
                            break;

                        case 'StringBegin':
                            buffer += char;
                            break;

                    }

                    state = 'KeyBegin';
                    break;


                case '&':

                    if (state == 'KeyBegin') {
                        if (buffer) {
                            tokens.push({
                                type: "KEY",
                                value: buffer, pos: i
                            });
                            buffer = '';
                        } else {
                            throw new Error(input + ' parse error at' + i);
                        }
                    }
                    var token = input.charAt(i++);
                    if (token == '&') {
                        tokens.push({
                            type: 'OPER',
                            value: '&&'
                        });
                    } else {

                    }
                    state = 'KeyBegin';
                    break;


                case '>':
                case '<':
                case '=':

                    if (state == 'KeyBegin') {
                            if (buffer) {
                                tokens.push({
                                    type: "KEY",
                                    value: buffer, pos: i
                                });
                                buffer = '';
                            } else {
                                throw new Error(input + ' parse error at' + i);
                            }
                    }
                    var token = input.charAt(i + 1);
                    if (token == '=') {
                        tokens.push({
                            type: 'OPER',
                            value: char + token,
                            pos: i
                        });
                        i++;
                    } else {

                        tokens.push({
                            type: "OPER",
                            value: char,
                            pos: i
                        });

                    }
                    state = 'KeyBegin';

                    break;

                case '+':
                case '-':
                case '*':
                case '?':
                case "/":
                    switch (state) {
                        case 'KeyBegin':
                            if (buffer) {
                                if (isNumber(buffer)) {
                                    tokens.push({
                                        type: "NUMBER",
                                        value: buffer, pos: i
                                    });
                                } else {
                                    tokens.push({
                                        type: "KEY",
                                        value: buffer, pos: i
                                    });
                                }
                                buffer = '';
                            } else {
                                throw new Error(input + ' parse error at ' + i);
                            }
                            break;

                    }
                    tokens.push({
                        type: "OPER",
                        value: char,
                        pos: i
                    });
                    state = 'KeyBegin';

                    break;

                default:
                    buffer += char;
                    if (i == input.length - 1) {
                        switch (state) {
                            case 'KeyBegin':
                                if (isNumber(buffer)) {
                                    tokens.push({
                                        type: "NUMBER",
                                        value: buffer,
                                        pos: i
                                    });
                                } else {
                                    tokens.push({
                                        type: "KEY",
                                        value: buffer, pos: i
                                    });
                                }

                                buffer = '';
                                break;
                            case 'FilterBegin':
                                tokens.push({
                                    type: "FILTER",
                                    value: buffer, pos: i
                                });
                                buffer = '';

                        }
                    }


            }
        }
        return tokens;
    };

    function Parser(input) {
        this.input = input;
        this.tokens = lexer(input);
        this.pos = 0;
        this.length = this.tokens.length;
    }

    Parser.prototype.ll = function (k) {
        k = k || 1;
        if (k < 0) k = k + 1;
        var pos = this.pos + k - 1;
        if (pos > this.length - 1) {
            return false;
        }
        return this.tokens[pos];
    };

    Parser.prototype.parse = function () {
        var compile = '',
            ll = this.ll();

        switch (ll.type) {
            case 'KEY':
                this.next();
                var next = this.ll();
                if (next) {
                    switch (next.type) {
                        case 'OPER':
                            if (next.value == '?') {
                                compile = 'var value = model.get("' + ll.value + '");' +
                                    'if(typeof value == "function"){value = value.call(model)}' +
                                    'if(value){return "' + this.ll(2).value + '"}else{return "' + this.ll(4).value + '"}';
                            } else {
                                compile += 'model.get("' + ll.value + '")' + next.value;
                                this.next();
                                var token = this.ll(),
                                    nextToken = this.ll(2);

                                switch (token.type) {
                                    case 'KEY':
                                        compile += 'model.get("' + token.value + '")';
                                        break;
                                    case 'NUMBER':
                                    case 'STRING':
                                        compile += '"' + token.value + '"';
                                        break;
                                    case 'OPER':
                                        throw new Error('parse error at pos' + token.pos);
                                        break;
                                }

                                if (nextToken && nextToken.value == '?') {
                                    compile = 'var value = ' + compile + ';' +
                                        'if(typeof value == "function"){value = value.call(model)}' +
                                        'if(value){return "' + this.ll(3).value + '"}else{' + 'return "' + this.ll(5).value + '"}';
                                } else {
                                    compile = 'return ' + compile;
                                }
                            }
                            break;
                        case 'FILTER':
                            this.next();
                            var nextToken = this.ll(2);

                            if (nextToken && nextToken.value) {
                                if (nextToken.type == 'KEY') {
                                    compile = 'return filter["' + next.value + '"](model.get("' + ll.value + '"),model.get("' + nextToken.value + '"))';
                                } else {
                                    compile = 'return filter["' + next.value + '"](model.get("' + ll.value + '"), "' + nextToken.value + '")';
                                }
                            } else {
                                compile = 'return filter["' + next.value + '"](model.get("' + ll.value + '"))';
                            }
                            break;

                    }
                } else {
                    compile = 'return model.get("' + ll.value + '")';
                }

                break;
            case 'OPER':
                throw new Error('parse error at pos' + ll.pos);
                break;
        }

        return {
            path: ll.value,
            compile: compile
        };
    };


    Parser.prototype.next = function (k) {
        k = k || 1;
        this.pos += k;
    };


    return Parser;
});