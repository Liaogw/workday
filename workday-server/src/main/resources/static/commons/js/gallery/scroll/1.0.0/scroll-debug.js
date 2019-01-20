define("scroll", ["$","widget", "base", "class", "events","./scroll-debug.css"], function(require, exports, module) {    
	
	var $=require("$");
    var Widget = require("widget");
    require("./scroll-debug.css");

    var Scroll=Widget.extend({
    	attrs: {
             // 可以是 Selector、jQuery 对象、或 DOM 元素集
            trigger: {
                value: '',
                getter: function(val) {
                    return $(val);
                }
            },
            showArrows:true,// 是否显示箭头，默认为true
            wheelSpeed:18,// 鼠标滚动速度
            intervalIime:80,// 鼠标按定是主显示区及滚动条的移动速度,单位毫秒，默认为80
            arrowDirection:0,
            height:0,
            innerHeight:0,
            scrollMainHeight:0,
			scrollMainMax:0,
			scrollYShow:0,
			scrollYDragHeight:0,
			scrollYBarHeight:0,
			scrollYMax:0,
			wheelMultiplier:0,
			dragPosition:0,
			mouseInBarposition:0,
			arrowsInterval:0,
			keyIntervalArr:0,
			dragInterval:0,
			textMoveInterval:0,
            // 是否包含 triggers，用于没有传入 triggers 时，是否自动生成的判断标准
            hasTriggers: true,
            // 触发延迟
            delay: 100
        },
        events: {

        },
        setup:function(){
        	this.init();
        },
        init:function(){
        	var _this = this.get("trigger"),
        		_thisData,
        		scrollMain;

        	// 给主体加强制加入自动换行样式
			_this.css({ "overflow": "auto", "word-wrap": "break-word", "word-break": "keep-all" }); 


        	this.set("height",_this.height());
        	this.set("innerHeight",_this.innerHeight());

        	

        	_this.wrapInner("<div class='Scroll-main'></div>");

        	scrollMain=_this.find(".Scroll-main");
        	this.set("scrollMain",scrollMain);

        	if(scrollMain.height()>this.get("height")){
        		_this.attr("tabindex",0);
        		_this.css({"position":"relative","outline":"none"}); 
        		scrollMain.wrap("<div class='Scroll-Outside' style='position:relative; overflow:hidden; width:100%; height:100%'></div>");
				this.set("scrollOutside",_this.find(".Scroll-Outside"));
				scrollMain.css({"position":"relative"});

				this.ShowScrollY();
				this.SetScrollSize();
				this.SetScrollBind();

				_thisData = {
					height:this.get("height"),
					innerHeight:this.get("innerHeight"),
					scrollMainHeight:this.get("scrollMain").height(),
					scrollYDragHeight:this.get("scrollYDrag").height(),
					scrollYBarHeight:this.get("scrollYBarHeight")
				};	

				var scrollMainMax=_thisData.scrollMainHeight - _thisData.height,// 内容显示区最大活动空间
					scrollYMax=_thisData.scrollYDragHeight - _thisData.scrollYBarHeight,// 计算滚动条最大活动空间
					wheelMultiplier= 2 * this.get("wheelSpeed") * scrollYMax / _thisData.scrollMainHeight;// 计算滚动条滚动比例值;

				this.set("scrollYShow","1");
				this.set("scrollMainMax",scrollMainMax);
				this.set("scrollYMax",scrollYMax);
				this.set("wheelMultiplier",wheelMultiplier);
        	}

        },
        ShowScrollY:function(){
        	var _this = this.get("trigger"),
        		scrollY,
        		scrollYDrag,
        		scrollYDragBar,
        		scrollYUp,
        		scrollYDown,
        		showArrows=this.get("showArrows");

        	_this.append("<div class='Scroll-y' style=' position:absolute; right:0px; top:0px;display:none'></div>");
			scrollY = _this.find(".Scroll-y");

			_this.css({ "width":  (_this.width() - scrollY.width() +15) + "px", "word-break": "keep-all" }); 

			if(showArrows){
				scrollY.append("<div class='Scroll-y-Up'></div>");
			}

			scrollY.append("<div class='Scroll-y-Drag' style='position:relative; overflow:hidden;'><div class='Scroll-y-Drag-Bar' style=' position:relative;'></div></div>");

			scrollYDrag = scrollY.find(".Scroll-y-Drag");
			scrollYDragBar = scrollY.find(".Scroll-y-Drag-Bar");

			scrollYDragBar.append("<div class='Scroll-y-DBT'></div>")
			.append("<div class='Scroll-y-DBM'><div class='Scroll-y-DBMB'></div></div>")
			.append("<div class='Scroll-y-DBB'></div>");

			if (showArrows) {
				scrollY.append("<div class='Scroll-y-Down'></div>");
			}
			
			scrollYUp = scrollY.find(".Scroll-y-Up");
			scrollYDown = scrollY.find(".Scroll-y-Down");

			this.set("scrollY",scrollY);
			this.set("scrollYDrag",scrollYDrag);
			this.set("scrollYDragBar",scrollYDragBar);
			this.set("scrollYUp",scrollYUp);
			this.set("scrollYDown",scrollYDown);
			
        },
        SetScrollSize:function(){
        	var _this=this.get("trigger")
        		scrollY=this.get("scrollY"),
        		scrollYDrag=this.get("scrollYDrag"),
        		scrollMain=this.get("scrollMain"),
        		scrollYDragBar=this.get("scrollYDragBar"),
        		scrollYUp =this.get("scrollYUp"),
        		scrollYDown = this.get("scrollYDown"),
        		scrollMainMax=this.get("scrollMainMax"),
        		scrollYMax=this.get("scrollYMax"),
        		scrollYDragHeight=scrollYDrag.height(),
        		scrollMainHeight=scrollMain.height();

        	this.set("scrollMainHeight",scrollMainHeight);

        	with(scrollY){
        		css("height",_this.innerHeight());
        		scrollYDrag.height(_this.innerHeight() - scrollYUp.outerHeight() - scrollYDown.outerHeight() + "px");
        		scrollYDragHeight=scrollYDrag.height();
        		if(scrollYDrag.outerHeight()>scrollYDragHeight){
        			scrollYDrag.height(scrollYDragHeight - (scrollYDrag.outerHeight() - scrollYDragHeight) + "px");
        		}
        		
        		this.set("scrollYDragHeight",scrollYDrag.height());
        		this.set("scrollMainHeight",scrollMainHeight);

        		var proportion =  _this.height() / scrollMainHeight;
        		
				scrollYDragBar.height(scrollYDrag.height() * proportion  + "px");

				this.set("scrollYBarHeight",scrollYDragBar.outerHeight());
				
				var scrollYDBT = find(".Scroll-y-DBT"),
					scrollYDBM = find(".Scroll-y-DBM"),
					scrollYDBMB = find(".Scroll-y-DBMB"),
					scrollYDBB = find(".Scroll-y-DBB"),
					barMinHeight=scrollYDBT.height() + scrollYDBM.height() + scrollYDBB.height();
				scrollYDBM.height(scrollYDragBar.height() - scrollYDBT.height() - scrollYDBB.height() + "px");
	
				if(barMinHeight >= scrollYDragBar.height()){
					scrollYDragBar.height(barMinHeight + "px");
					this.set("scrollYBarHeight",scrollYDragBar.outerHeight());
				}else{
					scrollYDBM.height(scrollYDragBar.height() - scrollYDBT.height() - scrollYDBB.height() + "px");
					scrollYDBMB.height(scrollYDBM.height() + "px");
				}
			

        	}
        },
        SetScrollBind:function(){

        	var that=this,
        		_this=this.get("trigger"),
        		intervalIime=this.get("intervalIime"),
        		mouseInBarposition =this.get("mouseInBarposition"),
        		scrollMainMax=this.get("scrollMainMax"),
        		dragPosition=this.get("dragPosition"),
        		scrollYMax=this.get("scrollYMax"),
        		wheelMultiplier=this.get("wheelMultiplier"),
        		scrollMain=this.get("scrollMain"),
        		scrollYUp=this.get("scrollYUp"),
        		scrollYDown=this.get("scrollYDown"),
        		scrollYDrag=this.get("scrollYDrag"),
        		scrollYDragBar=this.get("scrollYDragBar"),
        		scrollOutside=this.get("scrollOutside");

        	var arrowsInterval=this.get("arrowsInterval"),
				keyIntervalArr=this.get("keyIntervalArr"),
				dragInterval=this.get("dragInterval"),
				textMoveInterval=this.get("textMoveInterval");

        	_this.bind("keydown",function(e){
        		switch(e.keyCode){
        			case 38: // up
						ArrowsUpdate.call(that);
						if (!keyIntervalArr){
							keyIntervalArr = setInterval(Arrowsclick.call(that),intervalIime);
						} 
						return false;
					case 40: // down
						ArrowsDowndate.call(that);	
						if (!keyIntervalArr){
							keyIntervalArr = setInterval(Arrowsclick.call(that),intervalIime);
						} 
						return false;
					case 33: // page up
					case 34: // page down
						// TODO
						return false;
					default:

        		}
        	}).bind('keyup',function(e) {
				if (e.keyCode == 38 || e.keyCode == 40) {
					resetArrowsClsaa.call(that);
					clearInterval(keyIntervalArr);
					return false;
				}
			});

			var ScrollYUpOn = 0
			scrollYUp.bind("mouseenter",function(){
				if (ScrollYUpOn){
					ArrowsUpdate.call(that);
					arrowsInterval = setInterval(Arrowsclick.call(that),intervalIime);
				}
			}).bind("mouseleave",ArrowsLeave)
			.bind("mousedown", function(){
				ScrollYUpOn = 1
				ArrowsUpdate.call(that);
				ArrowsMouseDown();
			});	
			
			var ScrollYDownOn = 0
			scrollYDown.bind("mouseenter",function(){
				if (ScrollYDownOn){
					ArrowsDowndate.call(that);
					arrowsInterval = setInterval(Arrowsclick.call(that),intervalIime);
				}
			}).bind("mouseleave",ArrowsLeave)
			.bind("mousedown", function(){
				ScrollYDownOn = 1
				ArrowsDowndate.call(that);
				ArrowsMouseDown();
			});
			
			function ArrowsLeave(){
				if (ScrollYUpOn){
					resetArrowsClsaa.call(that);
				} 
				if (ScrollYDownOn){
					resetArrowsClsaa.call(that);
				} 
			};
			
			function ArrowsMouseDown(){
				ignoreNativeDrag();
				arrowsInterval = setInterval(Arrowsclick.call(that),intervalIime);
				ArrowsToDocumentMouseup();
			};
			
			function ArrowsToDocumentMouseup(){
				$(document).bind("mouseup",function(){					
					ScrollYUpOn = 0;
					ScrollYDownOn = 0;
					resetArrowsClsaa.call(that);
					$(document).unbind("mouseup");
					ResumeNativeDrag();
				})
			};
			
			var ScrollYDragDownOn = 0;
			scrollYDrag.bind("mouseenter",function(e){
				if (ScrollYDragDownOn){
					DraglickDirection(e);
					dragInterval = setInterval(Draglick.call(that),intervalIime);
				}
			}).bind("mouseleave",Dragmouseleave)
			.bind("mouseup", function(e){
				ScrollYDragDownOn = 0;
				scrollYDragBar.removeClass("Scroll-y-Drag-Bar-D");
				clearInterval(dragInterval);
			}).bind("mousedown",ScrollYDragMousedown);	
			
			var ScrollYBarDownOn = 0;
			scrollYDragBar.bind("mousedown", function(e){
				scrollYDrag.unbind("mousedown").unbind("mouseleave");
				scrollYDragBar.addClass("Scroll-y-Drag-Bar-D");
				ScrollYBarDownOn = 1;
				mouseInBarposition = getPos(e,"Y") - scrollYDrag.offset().top - scrollYDragBar.position().top;
				ignoreNativeDrag();
				
				$(document).bind("mouseup",function(){					
					ScrollYBarDownOn = 0;
					scrollYDragBar.removeClass("Scroll-y-Drag-Bar-D");
					scrollYDrag.bind("mousedown",ScrollYDragMousedown).bind("mouseleave",Dragmouseleave);	
					$(document).unbind("mouseup").unbind("mousemove")
					ResumeNativeDrag();
				})
				.bind("mousemove", function(e){
					if (ScrollYBarDownOn){
						Barclick.call(that,e);
					} 
				});
				
			}).bind("mousemove", function(e){
				if (ScrollYBarDownOn){
					Barclick.call(that,e);
				} 
			});
		
			addEventHandler(_this[0],"DOMMouseScroll",mousewheel);
			addEventHandler(_this[0],"mousewheel",mousewheel);
   		    
			var selectDirection = 0;
			var moveIncrease = 1;
			scrollOutside.bind("mousedown",function(){
				var maxIntervalTime = 100;
				var minIntervalTime = 1;
				
				$(document).bind("mouseup",function(){	
					clearInterval(textMoveInterval);
					$(this).unbind("mouseup").unbind("mousemove");	
				})
				.bind("mousemove", function(e){
					var mouseposition = getPos(e,"Y") - scrollOutside.offset().top;
					selectDirection = mouseposition < 0  ? -1 : (mouseposition > scrollOutside.height()) ? 1 : 0;
					if (selectDirection){
						var marginLong = mouseposition < 0 ? -mouseposition : mouseposition - scrollOutside.height();
						moveIncrease = marginLong / 10;
						clearInterval(textMoveInterval);
						TextMove();
						textMoveInterval = setInterval(TextMove,50);
					}
				});				
			});
			_this.bind("mouseout",function(){
				$(".Scroll-y").hide();	
			
			}).bind("mouseover",function(){
				$(".Scroll-y").show();
			
			})
			function Dragmouseleave(){
				clearInterval(dragInterval)
				
				$(document).bind("mouseup",function(){
					ScrollYDragDownOn = 0;
					scrollYDragBar.removeClass("Scroll-y-Drag-Bar-D");
					clearInterval(dragInterval);
					ResumeNativeDrag();
				})
			};
			
			function ScrollYDragMousedown(e){
				ScrollYDragBar.addClass("Scroll-y-Drag-Bar-D");
				ignoreNativeDrag();

				ScrollYDragDownOn = 1;
				DraglickDirection.call(that,e);
				dragInterval = setInterval(Draglick.call(that),intervalIime);
				ScrollYDragBar.bind("mousemove", function(e){moveY = getPos.call(that,e,"Y")});
			};
			function addEventHandler(el, evType, fnHandler) {
			    
				if (el.addEventListener) {
					el.addEventListener(evType, fnHandler, false);
				} else if (el.attachEvent) {//ie
					el.attachEvent("on" + evType, fnHandler);
				} else {
					el["on" + evType] = fnHandler;
				}
			}
			function mousewheel(e){
			    delta=0;
				
				e=e || window.event; 
				delta = delta || (e.wheelDelta ? e.wheelDelta / 120 : (e.detail) ? -e.detail/3 : 0);
				var d = that.get("dragPosition");
				positionDrag.call(that,(that.get("dragPosition") - delta * that.get("wheelMultiplier")));
	
				var dragOccured = d != that.get("dragPosition");
				if(e&&e.stopPropagation){ //Firefox下阻止事件冒泡
					e.stopPropagation();
					e.preventDefault();
		
				}else if(window.event){ //IE下阻止事件冒泡
					window.event.cancelBubble=true;
				}
				
				
				return !dragOccured;
			};
			
			var TextMove = function(){
				//var scrollMainMax=this.get("scrollMain").height() - this.get("trigger").height(),// 内容显示区最大活动空间
				//	scrollYMax=this.get("scrollYDrag").height()- this.get("scrollYBarHeight");// 计算滚动条最大活动空间

				var ScrollMainPosition = scrollMain.position().top - selectDirection * moveIncrease;
				ScrollMainPosition = ScrollMainPosition < -scrollMainMax ? -scrollMainMax : ScrollMainPosition > 0 ? 0 : ScrollMainPosition;
				dragPosition = scrollYMax * (-ScrollMainPosition / scrollMainMax);
				
				that.set("dragPosition",dragPosition);
				scrollMain.css({'top':ScrollMainPosition+'px'});
				scrollYDragBar.css({'top':dragPosition+'px'});
			};
			function resetArrowsClsaa(){
				clearInterval(arrowsInterval);
				if (this.get("showArrows")){
					this.get("scrollYUp").removeClass("Scroll-y-Up-D");
					this.get("scrollYDown").removeClass("Scroll-y-Down-D");
				}
			};
        }
    });

	var ignoreNativeDrag = function() {
		$('html').bind('dragstart',function(){
			return false;
		}).bind('selectstart',function(){
			return false;
		});
	};
	var ResumeNativeDrag = function() {
		$('html').unbind('dragstart').unbind('selectstart');
	};
		
	
	
	var ArrowsUpdate = function(){
		if (this.get("showArrows")){
			this.get("scrollYUp").addClass("Scroll-y-Up-D");
		}
		this.set("arrowDirection",-1); 
		Arrowsclick.call(this);
	};

	var ArrowsDowndate = function(){
		if (this.get("showArrows")){
			this.get("scrollYDown").addClass("Scroll-y-Down-D");
		} 
		this.set("arrowDirection",1); 
		Arrowsclick.call(this);
	};
	
	var moveY = 0;
	var DraglickDirection = function(e){
		moveY = getPos(e,"Y")
		Draglick();
	};
	
	var Arrowsclick = function() {
		var dragPosition=this.get("dragPosition"),
			arrowDirection=this.get("arrowDirection"),
			wheelMultiplier=this.get("wheelMultiplier");


		positionDrag.call(this,(dragPosition + arrowDirection * wheelMultiplier));
	};
	
	var Draglick = function() {
		var scrollYDrag=this.get("scrollYDrag"),
			scrollYDragBar=this.get("scrollYDragBar"),
			scrollYMax=this.get("scrollYMax"),
			scrollYBarHeight=this.get("scrollYBarHeight"),
			dragPosition=this.get("dragPosition"),
			arrowDirection=this.get("arrowDirection"),
			wheelMultiplier=this.get("wheelMultiplier");

		var mouseposition = moveY - scrollYDrag.offset().top;
		var BarHalf = scrollYDragBar.position().top + scrollYBarHeight / 2;	
		arrowDirection = (mouseposition < BarHalf - wheelMultiplier / 2) ? -1 : (mouseposition > BarHalf + wheelMultiplier / 2) ? 1 : 0;
		
		positionDrag.call(this,(dragPosition + arrowDirection * wheelMultiplier));
		if (!arrowDirection || (dragPosition == 0) || (dragPosition == scrollYMax)){clearInterval(DragInterval);return false;}
	};
	
	function Barclick(e){
		var scrollYDrag=this.get("scrollYDrag"),
			mouseInBarposition=this.get("mouseInBarposition");
		var mouseposition = getPos.call(this,e,"Y") - scrollYDrag.offset().top;
		positionDrag.call(this,(mouseposition - mouseInBarposition));	
	}		
	
	var positionDrag = function(destY){	

		var scrollYMax=this.get("scrollYMax"),
			dragPosition=this.get("dragPosition"),
			scrollYDragBar=this.get("scrollYDragBar"),
			scrollMain=this.get("scrollMain");
		destY = destY < 0 ? 0 : (destY > scrollYMax ? scrollYMax : destY);//判断滚动条移动位置是否超出可移动区域
		dragPosition = destY;

		this.set("dragPosition",dragPosition);
		scrollYDragBar.css({'top':destY+'px'});
		var p = destY / scrollYMax;
		scrollMain.css({'top':((this.get("height")-this.get("scrollMainHeight"))*p ) + 'px'});
	};
	var getPos = function (event, c) {
		var p = c.toUpperCase() == 'X' ? 'Left' : 'Top';
		return event['page' + c] || (event['client' + c] + (document.documentElement['scroll' + p] || document.body['scroll' + p])) || 0;
	};

	module.exports = Scroll;
})