define('inno/schedule/1.0.0/schedule',['$','widget'],function(require, exports, module){
	var $ = require('$'),
		Widget = require('widget'),
	 	i18n = require('./i18n'),
		Lunar = require('./lunar');

	var Schedule = Widget.extend({
			attrs:{
				weekStart:0,
				weekName:[i18n.datepicker.dateformat.sun, i18n.datepicker.dateformat.mon, i18n.datepicker.dateformat.tue, i18n.datepicker.dateformat.wed, i18n.datepicker.dateformat.thu, i18n.datepicker.dateformat.fri, i18n.datepicker.dateformat.sat],
				monthName: [i18n.datepicker.dateformat.jan, i18n.datepicker.dateformat.feb, i18n.datepicker.dateformat.mar, i18n.datepicker.dateformat.apr, i18n.datepicker.dateformat.may, i18n.datepicker.dateformat.jun, i18n.datepicker.dateformat.jul, i18n.datepicker.dateformat.aug, i18n.datepicker.dateformat.sep, i18n.datepicker.dateformat.oct, i18n.datepicker.dateformat.nov, i18n.datepicker.dateformat.dec],
            	monthp: i18n.datepicker.dateformat.postfix,
            	Year: new Date().getFullYear(), //default year
            	Month: new Date().getMonth() + 1, //default month
            	Day: new Date().getDate(), //default date
            	today: new Date(),
            	time: new Date().getHours() + ':' + new Date().getMinutes() + ':' + new Date().getSeconds(),
            	dateformat: 'yyyy-MM-dd',
            	classPrefix:'ui-schedule',
				element: {
                	value: null,
                	// required
                	getter: function(val) {
                    	return $(val).eq(0);
                	}
            	}
			},
			events:{
				'click [data-role=date]':function(ev){
				//	console.log(this);
				},
            	'mouseenter [data-role=item]': function(e) {
            	    
            	},
            	'mouseleave [data-role=item]': function(e) {
            	    
            	}
			},
			setup:function(){
				this._init();
				this._renderCalendar();
				Schedule.superclass.setup.call(this);
			},
			prevMonth:function(){
				var Month = this.get('Month'),
					Year = this.get('Year');
				if(Month<=1){
					Month = 12;
					Year--;
				}else{
					Month--;
				}
				this.switch(Month,Year);
			},
			nextMonth:function(){
				var Month = this.get('Month'),
					Year = this.get('Year');
				if(Month>=12){
					Month = 1;
					Year++;
				}else{
					Month++;
				}
				this.switch(Month,Year);	
			},
			nextYear:function(){
				var Year = this.get('Year');
				Year++;
				this.switch(undefined,Year);
			},
			prevYear:function(){
				var Year = this.get('Year');
				Year--;
				this.switch(undefined,Year);
			},
			switch:function(m,y){
				if(y && y != this.get('Year')){
					this.set('Year',y);
				}
				if(m && m != this.get('Month')){
					this.set('Month',m);
				}
				this._renderCalendar();
			},
			_init:function(){
				var classPrefix = this.get('classPrefix'),
					weekName = this.get('weekName');
				var tdc = '';
				var tpl = '<table class="' + classPrefix + '"> \n';
					tpl += '<thead> \n';
					tpl += '	<tr> \n';
					for(var i = 0;i<weekName.length;i++){
						tdc = '';
						if(i == 0 || i ==6){
							tdc = classPrefix + '-weekend';
						}
						tpl += '		<td class="'+ tdc +'">' + weekName[i] + '</td>';
					}
					tpl += '	</tr> \n';
					tpl += '</thead> \n';
					tpl += '<tbody> \n';
					tpl += '</tbody> \n';
					tpl += '</table> \n';
					this.get('element').append(tpl);
			},
			_calculate:function(){
				var	Year = this.get('Year'),
					Month = this.get('Month'),
					WeekStart = this.get('weekStart'),
					today = this.get('today');

				var def={};
				def.firstDate = new Date(Year,Month-1,1);
				def.lastDate = new Date(Year,Month,0);
				def.diffDay = WeekStart - (def.firstDate.getDay());
				def.showMonth = Month-1;
				def.startDate = DateAdd('d',def.diffDay,def.firstDate);
				def.endDate = DateAdd('d',42,def.startDate);
				def.showDay = (def.lastDate.getDay() >0 ) ? 35 : 42;
				def.tds = dateFormat.call(today,i18n.datepicker.dateformat.fulldayvalue);
				this.set('startDate',dateFormat.call(def.startDate,'yyyy-MM-dd'));
				this.set('endDate',dateFormat.call(def.endDate,'yyyy-MM-dd'));

				if ( def.diffDay  > 0) {
                 def.diffDay  -= 7;
            	}

            	def.showValue= def.Year + '年' + def.Month + '月';

            	return def;
			},
			_renderCalendar:function(){
				var tbody = this.get('element').find('tbody'),
					classPrefix = this.get('classPrefix'),
					bhm = [],
					tdc = [],
					weekClass = [],
					ndate;
				var def = this._calculate();

				for(var i=1;i<=def.showDay;i++){
					if(i%7 == 1){
						bhm.push('<tr>');
					}
					ndate = DateAdd('d',i-1,def.startDate);
					tdc = [];
					tdc.push(classPrefix + '-date');
					if(i%7 == 1 || i%7 == 0){
						tdc.push(classPrefix + '-weekend');
					}
					if(ndate.getMonth() != def.showMonth){
						tdc.push(classPrefix + '-other-day');
					}

					var s = dateFormat.call(ndate,i18n.datepicker.dateformat.fulldayvalue);
					if(s == def.tds){
						tdc.push(classPrefix + '-today');
					}				

					bhm.push('<td data-role=date class="'+ tdc.join(' ') +'" date="' + dateFormat.call(ndate,'yyyy-MM-dd') + '">');
					bhm.push('	<div class="'+ classPrefix +'-container">');
					bhm.push('		<div class="'+ classPrefix + '-info' +'">');
					bhm.push('			<span class="'+ classPrefix +'-solar-date">' + ndate.getDate() + '</span>');
					bhm.push('			<span class="'+ classPrefix +'-lunar-date">' + new Lunar(ndate).cDate.toString() + '</span>');
					bhm.push('		</div>');
					bhm.push('		<div class="'+ classPrefix +'-content">');
					bhm.push('		</div>');
					bhm.push('	</div>');
					bhm.push('</td>');
					if(i%7 == 0){
						bhm.push('</tr>');
					}

				}
				$(tbody).html(bhm.join(''));
				this.trigger('renderCalendar',dateFormat.call(def.startDate,'yyyy-MM-dd'),dateFormat.call(def.endDate,'yyyy-MM-dd'));

			},
			render:function(){
				Schedule.superclass.render.call(this);
				return this;
			},
			destroy:function(){
				Schedule.superclass.destroy.call(this);
			}
	});

	var DateAdd = function (interval, number, idate) {
        number = parseInt(number);
        var date;
        if (typeof (idate) == 'string') {
            date = idate.split(/\D/);
            eval('var date = new Date(' + date.join(',') + ')');
        }

        if (typeof (idate) == 'object') {
            date = new Date(idate.toString());
        }

        switch (interval) {
            case 'y': date.setFullYear(date.getFullYear() + number); break;
            case 'm': date.setMonth(date.getMonth() + number); break;
            case 'd': date.setDate(date.getDate() + number); break;
            case 'w': date.setDate(date.getDate() + 7 * number); break;
            case 'h': date.setHours(date.getHours() + number); break;
            case 'n': date.setMinutes(date.getMinutes() + number); break;
            case 's': date.setSeconds(date.getSeconds() + number); break;
            case 'l': date.setMilliseconds(date.getMilliseconds() + number); break;
        }
        return date;
    }
    var DateDiff = function (interval, d1, d2) {
        switch (interval) {
            case 'd': //date
            case 'w':
                d1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate());
                d2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate());
                break;  //w
            case 'h':
                d1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), d1.getHours());
                d2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate(), d2.getHours());
                break; //h
            case 'n':
                d1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), d1.getHours(), d1.getMinutes());
                d2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate(), d2.getHours(), d2.getMinutes());
                break;
            case 's':
                d1 = new Date(d1.getFullYear(), d1.getMonth(), d1.getDate(), d1.getHours(), d1.getMinutes(), d1.getSeconds());
                d2 = new Date(d2.getFullYear(), d2.getMonth(), d2.getDate(), d2.getHours(), d2.getMinutes(), d2.getSeconds());
                break;
        }
        var t1 = d1.getTime(), t2 = d2.getTime();
        var diff = NaN;
        switch (interval) {
            case 'y': diff = d2.getFullYear() - d1.getFullYear(); break; //y
            case 'm': diff = (d2.getFullYear() - d1.getFullYear()) * 12 + d2.getMonth() - d1.getMonth(); break;    //m
            case 'd': diff = Math.floor(t2 / 86400000) - Math.floor(t1 / 86400000); break;
            case 'w': diff = Math.floor((t2 + 345600000) / (604800000)) - Math.floor((t1 + 345600000) / (604800000)); break; //w
            case 'h': diff = Math.floor(t2 / 3600000) - Math.floor(t1 / 3600000); break; //h
            case 'n': diff = Math.floor(t2 / 60000) - Math.floor(t1 / 60000); break; //
            case 's': diff = Math.floor(t2 / 1000) - Math.floor(t1 / 1000); break; //s
            case 'l': diff = t2 - t1; break;
        }
        return diff;
    }
    var dateFormat = function (format) {
        var o = {
            'M+': this.getMonth() + 1,
            'd+': this.getDate(),
            'h+': this.getHours(),
            'H+': this.getHours(),
            'm+': this.getMinutes(),
            's+': this.getSeconds(),
            'q+': Math.floor((this.getMonth() + 3) / 3),
            'w': '0123456'.indexOf(this.getDay()),
            'S': this.getMilliseconds()
        };
        if (/(y+)/.test(format)) {
            format = format.replace(RegExp.$1, (this.getFullYear() + '').substr(4 - RegExp.$1.length));
        }
        for (var k in o) {
            if (new RegExp('(' + k + ')').test(format))
                format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length));
        }
        return format;
    }; 

    module.exports = Schedule;
});

define('inno/schedule/1.0.0/i18n',[],function(require,exports,module){
	var i18n = {
        datepicker: {
            dateformat: {
                'fulldayvalue': 'yyyy-MM-dd',
                'separator': '-',
                'year_index': 0,
                'month_index': 1,
                'day_index': 2,
                'sun': '周日',
                'mon': '周一',
                'tue': '周二',
                'wed': '周三',
                'thu': '周四',
                'fri': '周五',
                'sat': '周六',
                'jan': '一',
                'feb': '二',
                'mar': '三',
                'apr': '四',
                'may': '五',
                'jun': '六',
                'jul': '七',
                'aug': '八',
                'sep': '九',
                'oct': '十',
                'nov': '十一',
                'dec': '十二',
                'postfix':'月'
            },
            ok: ' 確定 ',
            cancel: ' 取消 ',
            today: '今天',
            prev_month_title:'上一月',
            next_month_title:'下一月',
            prev_year_title:'上一年',
            next_year_title:'下一年'
        }
    };
    module.exports = i18n;
});

define('inno/schedule/1.0.0/lunar',[],function(require,exports,module){
	var lunarFestival = {
		'正月初一':'春节',
        '正月十五':'元宵',
        '五月初五':'端午',
        '七月初七':'七夕',
        '七月十五':'中元',
        '八月十五':'中秋',
        '九月初九':'重阳',
        '腊月初八':'腊八',
        '腊月廿三':'小年',
        '腊月卅':'除夕'
	}

	var Lunar = function(date){
		this.date = date ? date : new Date();
        this.cDate = {
            toString : function () {
                var lunar,
                    lunarLongStr=this.yf + '月' + this.rq;
                if(this.rq =='初一'){
                    lunar =this.yf + '月';
                }else{
                    lunar =this.rq;
                }
                for(var i in lunarFestival){
                    if(lunarLongStr==i){
                        lunar=lunarFestival[i];
                    }
                }
                return lunar;
            },
            toLongString:function(){
                var lunar='';
                for(var i in lunarFestival){
                    if(this.yf + '月' + this.rq==i){
                        lunar=lunarFestival[i];
                    }
                }
                return this.yf + '月' + this.rq + lunar;
            }
        };
        this.init();
        this.calc();
	}

	Lunar.prototype = {
		constructor:Lunar,
		cDays : [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334],
        cData : [0x41A95, 0xD4A, 0xDA5, 0x20B55, 0x56A, 0x7155B, 0x25D, 0x92D, 0x5192B, 0xA95, 0xB4A, 0x416AA, 0xAD5, 0x90AB5, 0x4BA, 0xA5B, 0x60A57, 0x52B, 0xA93, 0x40E95],
        CSTR : {
            TG : '甲乙丙丁戊己庚辛壬癸', // 天干
            DZ : '子丑寅卯辰巳午未申酉戌亥', // 地支
            SX : '鼠牛虎兔龙蛇马羊猴鸡狗猪', // 生肖
            RQ : '一二三四五六七八九十', // 日期
            YF : '正二三四五六七八九十冬腊', // 月份
            XQ : '日一二三四五六' // 星期
        },
        // month是大月还是小月
        getBit : function (index, month) {
            return (this.cData[index] >> month) & 1;
        },
        // 初始化
        init : function () {
            var total, m, n, k;
            var isEnd = false;
            var tmp = this.date.getFullYear();
            total = (tmp - 2001) * 365
                + Math.floor((tmp - 2001) / 4)
                + this.cDays[this.date.getMonth()]
                + this.date.getDate() - 23; // 2001年1月23是除夕;该句计算到起始年正月初一的天数
            if (this.date.getYear() % 4 == 0 && this.date.getMonth() > 1) {
                total++; // 当年是闰年且已过2月再加一天！
            }
            for (m = 0; ; m++) {
                k = (this.cData[m] < 0xfff) ? 11 : 12; //起始年+m闰月吗？
                for (n = k; n >= 0; n--) {
                    if (total <= 29 + this.getBit(m, n)) { //已找到农历年!
                        isEnd = true;
                        break;
                    }
                    total = total - 29 - this.getBit(m, n); //寻找农历年！
                }
                if (isEnd) {
                    break;
                }
            }
            this.cDate.Year = 2001 + m; //农历年
            this.cDate.Month = k - n + 1; //农历月
            this.cDate.Day = total; //农历日
            if (k == 12) { //闰年！
                if (this.cDate.Month == Math.floor(this.cData[m] / 0x10000) + 1) { //该月就是闰月！
                    this.cDate.Month = 1 - this.cDate.Month;
                }
                if (this.cDate.Month > Math.floor(this.cData[m] / 0x10000) + 1) {
                    this.cDate.Month--; //该月是闰月后某个月！
                }
            }
            this.cDate.Hour = Math.floor((this.date.getHours() + 1) / 2);
        },
        // 计算
        calc : function () {
            var year = this.cDate.Year - 4;
            this.cDate.tg = this.CSTR.TG.charAt(year % 10); //天干
            this.cDate.dz = this.CSTR.DZ.charAt(year % 12); //地支
            this.cDate.sx = this.CSTR.SX.charAt(year % 12); //生肖
            this.cDate.yf = this.CSTR.YF.charAt(this.cDate.Month - 1);
            if (this.cDate.Month < 1) {
                this.cDate.yf = '闰' + this.CSTR.YF.charAt(-this.cDate.Month - 1);
            }
            this.cDate.rq = (this.cDate.Day < 11) ? '初' : ((this.cDate.Day < 20) ? '十' : ((this.cDate.Day < 30) ? '廿' : '卅'));
            if (this.cDate.Day % 10 != 0 || this.cDate.Day == 10) {
                this.cDate.rq += this.CSTR.RQ.charAt((this.cDate.Day - 1) % 10);
            }
            this.cDate.sj = this.CSTR.DZ.charAt((this.cDate.Hour) % 12) + '时';
            if (this.cDate.Hour == 12) {
                this.cDate.sj = '夜' + this.cDate.sj;
            }
        }
	}
	module.exports = Lunar;
});