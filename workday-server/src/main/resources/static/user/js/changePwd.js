define(function(require,exports,module){
	var Menu=require("menu"),
		Validator = require("inno/validator/1.0.0/validator-debug"),
		Form = require("form"),
		$=require("$");
	
	
	require("easyui");
	
	var _path="user";
	
	var validator = new Validator({
    	element: '#UserADEForm',
    	failSilently: true
	});
	
	
	validator.addItem({
        element: 'input[name=\'userPwd\']',
        display:"密码",
        required: true,
        rule: 'minlength{"min":5} maxlength{"max":20}',
    })
    .addItem({
        element: '[name=password-confirmation]',
        display:"密码",
        required: true,
        rule: 'confirmation{target: "#userAcctPwd"}'
    });
	
	
	var UserADEForm =new Form({
		trigger:"#UserADEForm",
		addUrl :  _path+"/changePwd"
	});

	$(".save").click(function(){
		validator.execute(function(err) {
			if(err){
				!err && validator.get("autoSubmit") && validator.element.get(0).submit(); 
				
			}else{
				var userPwd = $("#userAcctPwd").val();
				var userId = $("#userId").val();
				$.ajax({
					url : _path+"/changePwd",
					data : {userPwd : userPwd,userId : userId},
					success :function(result){
						//console.log(result);
						if(result.status == 200){
							showInformation(true);
						}else{
							showInformation(false);
						}
						$(".iconfonthide").show();
						$(".msgText").text(result.message);
					},
					error : function(result){
						showInformation(false);
						$(".msgText").text(name+"修改密码失败");
						$(".iconfonthide").hide();
					}
				});
				return false;
			} 
		});
	});

//	validator.element.on("submit", function(e) {
//		e.preventDefault();
//        validator.execute(function(err) {
//				if(err){
//					!err && validator.get("autoSubmit") && validator.element.get(0).submit(); 
//				}else{
//					var type = 1;
//					UserADEForm.saveData({
//						type:type,
//						successFn :function(result){
//							if(result.status == 200){
//								showInformation(true);
//							}else{
//								showInformation(false);
//							}
//							$(".iconfonthide").show();
//							$(".msgText").text(result.message);
//						},
//						errorFn :function(result){
//							showInformation(false);
//							$(".msgText").text(name+"修改密码失败");
//							$(".iconfonthide").hide();
//						},
//					});
//					
//					
//					var userPwd = $("#userAcctPwd").val();
//					var userId = $("#userId").val();
//					$.ajax({
//						url : _path+"/changePwd",
//						data : {userPwd : userPwd,userId : userId},
//						success :function(result){
//							console.log(result);
//							if(result.status == 200){
//								showInformation(true);
//							}else{
//								showInformation(false);
//							}
//							$(".iconfonthide").show();
//							$(".msgText").text(result.message);
//						},
//						error : function(result){
//							showInformation(false);
//							$(".msgText").text(name+"修改密码失败");
//							$(".iconfonthide").hide();
//						}
//					});
//					return false;
//				} 
//        });
//    });
	
	$("#btnCancel").click(function(){
		window.frameElement.trigger('close'); 
	});
	
	
	var showInformation = function(type){
		if(type){
			$(".msgiconfont").removeClass("error");
			$(".msgiconfont").addClass("succeed");
			$(".msgiconfont").html("&#xf00a1;");
		}else{
			$(".msgiconfont").removeClass("succeed");
			$(".msgiconfont").addClass("error");
			$(".msgiconfont").html("&#xf0098;");
		}
	};
});
