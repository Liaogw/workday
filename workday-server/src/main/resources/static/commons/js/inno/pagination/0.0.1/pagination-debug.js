define('inno/pagination/0.0.1/pagination-debug',['$','widget', 'base', 'class', 'events','handlebars'],function(require,exports,module){
	var $ = require('$'),
		Widget = require('widget');
    
	var Handlebars  = require('handlebars');

	var Pagination = Widget.extend({
			attrs:{
				element:{
					value:[],
					getter:function(val){
						return $(val);
					}
				},
				pageNumber:0,
				pageIndex:0
			},
			events:{
				'click [data-role=first]': function(ev) {
                	this.first();
            	},	
            	'click [data-role=prev]': function(ev) {
                	this.prev();
            	},
            	'click [data-role=next]': function(ev) {
                	this.next();
            	},
            	'click [data-role=last]': function(ev) {
                	this.last();
            	},
            	'click [data-role=item]': function(ev){
            		var pageIndex = $(ev.target).attr('data-page');
            		this._switchTo(pageIndex);
            	}
			},
			setup:function(){
				this._draw();
            	Pagination.superclass.setup.call(this);
			},
			_draw:function(){
				var pageNumber = this.get('pageNumber'),
					pageIndex = this.get('pageIndex');
				var  fragment = Handlebars.helpers.pagination({
					pagenumber:pageNumber,
					pageindex:pageIndex
				},null)

				this.element.html(fragment)
			},
			next:function(){
				var pageNumber = this.get('pageNumber'),
					pageIndex = this.get('pageIndex');

				if(pageIndex >= pageNumber){
					return;
				}
				pageIndex++;
				this._switchTo(pageIndex);
			},
			prev:function(){
				var pageIndex = this.get('pageIndex');

				if(pageIndex <= 1){
					return;
				}
				pageIndex--;
				this._switchTo(pageIndex);

			},
			first:function(){
				this._switchTo(1);
			},
			last:function(){
				var pageNumber = this.get('pageNumber');
				this._switchTo(pageNumber);
			},
			_switchTo:function(pageIndex){
				var oldPageIndex = this.get('pageIndex');
				if(oldPageIndex === pageIndex){
					return ;
				}

				this.set('pageIndex',pageIndex);
				this._draw();
				this.trigger('switch',pageIndex);
			},
			draw:function(pageNumber,pageIndex){
				this.set('pageNumber',pageNumber);
				this.set('pageIndex',pageIndex);
				this._draw();
			}
		});

	Handlebars.registerHelper('pagination',function(context,options){
		if(arguments.length === 1){
			if(arguments[0].fn){
				options = arguments[0];
				context = null;
			}
		}
		context = context || {};
		options = options || {};

		var classList = ['ui-pagination'],
			settings = $.extend(context,options.hash || {});

		if(settings['class']){
			classList.push(settings['class']);
			delete settings['class'];
		}

		var props = [];
		for(var key in settings){
			props.push(key + '= "' + settings[key] + '"');
		}

		var pageIndex = 0,
			pageNumber = 1 ;

		if (settings.pageindex || settings.pageIndex) {
    		pageIndex = parseInt(settings.pageindex || settings.pageIndex);
  		}
  		if (settings.pagenumber || settings.pageNumber) {
    		pageNumber = parseInt(settings.pagenumber || settings.pageNumber);
  		}
  		props.push('data-page-index="' + pageIndex + '"');
  		props.push('data-page-number="' + pageNumber + '"');

  		var list = [];
  		var bi = Math.max(1, pageIndex - 2);
  		var ei = Math.min(bi + 4, pageNumber);
  		bi = Math.max(1, Math.min(bi, ei -4));
  		for (var i = bi; i <= ei; i++) {
    		list.push('<a class="pagination-item ' + (i === pageIndex?' active "':'"') + ' data-page='+ i +' data-role="item">' + i + '</a>');
  		}


  		return '<a class="ui-pagination-first" data-role="first">首页</a>' +
  			   '<a class="ui-pagination-prev" data-role="prev">上一页</a>' +
  			   list.join('') +
  			   '<a class="ui-pagination-next" data-role="next">下一页</a>' +
  			   '<a class="ui-pagination-last" data-role="last">尾页</a>' +
  			   '<span class="ui-pagination-total">页数:'+ pageNumber +'</span>';

	});

	module.exports = Pagination;
});