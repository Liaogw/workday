define(function(require){
	var $ = require("$");
	Form = require("form");
	require("easyui");
	Dialog = require("inno/dialog/1.0.0/dialog-debug");
	Confirmbox=require("inno/dialog/1.0.0/confirmbox-debug");
	Select = require("inno/select/1.0.0/select-debug");
	
	var urlcfg= {
		listUser : basePath + "user/list",
		forwardEditUser : basePath + "user/forward/edit/",
		forwardAddUser : basePath + "user/forward/add",
		forwardChangePwd : basePath + "user/forward/changepwd/",
		cancelUser : basePath + "user/cancel/",
		activeUser : basePath + "user/active/",
		deleteUser : basePath + "user/delete/",
		forwarduserDetail : basePath + "user/forward/detail/",
		batchDelete : basePath + "user/batchDelete/",
	}
	var form =new Form({
		trigger:"#searchFrom"
	});
	inittable = function (QUERYCONDITION){
		$("#grid-table").datagrid({
			queryParams : {queryCondition:QUERYCONDITION},
			nowrap : true,
			autoRowHeight : true,
			striped : true,
			collapsible : true,
			fitColumns : true,
//			fit : true,
			url : urlcfg.listUser,
			frozenColumns:[[
			                {field:'userId',checkbox:true},
			            ]],
			columns:[[
				{field:'userName',title:'用户名称',align:'left',width:getWidth(0.2)},
				{field:'userAcct',title:'登录账户',align:'left',width:getWidth(0.15)},
				{field:'userStatus',title:'用户状态',align:'left',width:getWidth(0.1)},
				{field:'userSex',title:'性别',align:'left', width:getWidth(0.05)},
				{field:'userMobile',title:'手机号码',align:'left',width:getWidth(0.1)},
				{field:'institution',title:'所属机构',align:'left',width:getWidth(0.15)},
				{field:'department',title:'所属部门',align:'left',width:getWidth(0.15)},
				{field:'operate',title:'操作',align:'center',
					formatter: function(value,row,index){
						if(row.userStatus == '正常'){
							return "<a class='operate-items items-space' onclick='editUser(\""+row.userId +"\")'>编辑</a><a class='operate-items items-space' onclick='cancelUser(\""+row.userId +"\")'>注销</a><a class='operate-items items-space' onclick='changePwd(\""+row.userId +"\")'>修改密码</a><a class='operate-items'  onclick='deleteUser(\""+row.userId +"\")'>删除</a>"
						}else{
							return "<a class='operate-items items-space' onclick='activeUser(\""+row.userId +"\")'>激活</a><a class='operate-items' onclick='deleteUser(\""+row.userId +"\")'>删除</a>";
						}
					},width:getWidth(0.15)
				}
			]],
			onDblClickRow:dbClickAction,
			pagination : true,
			rownumbers : true,
			pageList:[15,30,50,100],
			 onLoadSuccess: function(data){
				 setTimeout(tableResize,20);
				 
			 }
		});
	}
	
	getWidth = function(percent){
		var width = document.body.clientWidth;
//		console.log("width:" + width);
		return width * percent;
	}
	dbClickAction = function(index,row){
		var id  = row.userId;
		var url = urlcfg.forwarduserDetail + id;
		edit.show(url);
	}
	//证件类型
	var statusSelect = new Select({
		trigger:'#user-status',
		width:'220px',
		name: 'userStatus',
		model:[{ value : "", text : "所有"},{ value : "正常", text : "正常"},{ value : "注销", text : "注销"}]
	}).render();
	var edit = new Dialog({
		width:'760px',
		height:'565px',
		hasMask:false,
		title:'用户编辑',
		ifEsc:false,
		closeTpl:'&#xe62a;'
	}).before('show',function(url){
    	this.set('content',url);
    });
	var change = new Dialog({
	 	width:'400px',
        height:'200px',
        hasMask:false,
        scrolling:true,
        title:"修改密码"
    }).before('show',function(id){
    	var url=urlcfg.forwardChangePwd+id;
    	this.set('content',url);
    });
	changePwd = function (userId){
		change.show(userId);
		$(".ui-dialog").css('boxShadow', '0px 4px 16px #a8adb2');
	}
	editUser = function (userId){
		var url=urlcfg.forwardEditUser + userId
		edit.show(url);
		$(".ui-dialog").css('boxShadow', '0px 4px 16px #a8adb2');
	}
	cancelUser = function(userId){
		Confirmbox.confirm('是否确定要注销该用户？','',function(){
			var parameter={
					url:urlcfg.cancelUser + userId,
				    type:"POST",
				    async:false,
				    success:function(data){
				    	refreshTable();
				    },
				    error:function(result){
				    	Confirmbox.alert('删除失败！');
				    }
				};
			$.ajax( parameter );
		},function(){
			
		});
	}
	activeUser = function(userId){
		Confirmbox.confirm('是否确定激活该用户？','',function(){
			var parameter={
					url:urlcfg.activeUser + userId,
				    type:"POST",
				    async:false,
				    success:function(data){
				    	refreshTable();
				    },
				    error:function(result){
				    	Confirmbox.alert('删除失败！');
				    }
				};
			$.ajax( parameter );
		},function(){
			
		});
	}
	deleteUser = function(userId){
		Confirmbox.confirm('是否确定要删除该用户？','',function(){
			var parameter={
					url:urlcfg.deleteUser + userId,
				    type:"POST",
				    async:false,
				    success:function(data){
				    	refreshTable();
				    },
				    error:function(result){
				    	Confirmbox.alert('删除失败！');
				    }
				};
			$.ajax( parameter );
		},function(){
			
		});
	}
	inittable(null);
	
	$("#search").click(function(){
		var s = {
				"rules":[],
				"groups":[],
				"op":"and"
		};
		var userStatus = $("input[name=userStatus]").val();
		if(userStatus){
			var status = {
					"field" : "userStatus",
					"op" : "equal",
					"value" : userStatus
			}
			s.rules.push(status);
		}
		var QUERYCONDITION =  form.initSearch(s);
		//console.log(QUERYCONDITION);
		$("#grid-table").datagrid("load",{"queryCondition":QUERYCONDITION});
//		inittable(QUERYCONDITION);
	});
	$("#reset").click(function(){
		var searchForm = form.get("eleArray");
		searchForm.map(function (i, elem) {
			$(this).val("");
		});
		statusSelect.select(0);
		inittable(null);
	});
	$("#refresh").click(function(){
		refreshTable();
	});
	$("#batchDelete").click(function(){
		var deleteIdArray=[];
		var selectedRow = $('#grid-table').datagrid('getSelections');  //获取选中行  
		$.each(selectedRow, function(index, row) {
			var id = row.userId;
			deleteIdArray.push(id);
		});
		if(deleteIdArray.length <= 0){ // 判断是否选中数据
			Confirmbox.alert('请选择要删除的数据！');
			return false;
		}
		Confirmbox.confirm('是否确定要删除这些记录？','',function(){
			var parameter={
					url:urlcfg.batchDelete+deleteIdArray,
				    type:"POST",
				    async:false,
				    success:function(data){
				    	if(data.status == 200)
				    		refreshTable();
				    		$('#grid-table').datagrid('clearSelections')
				    },
				    error:function(result){
				    	Confirmbox.alert('删除失败！');
				    }
				};
			$.ajax( parameter );
		},function(){
			
		});
	});
	
	new Dialog({
		trigger:'#addUser',
		width:'760px',
		height:'525px',
		content:urlcfg.forwardAddUser,
		hasMask:false,
		title:'用户新增',
		ifEsc:false,
		closeTpl:'&#xe62a;'
	})
	refreshTable = function(){
		$("#grid-table").datagrid('reload');
	}
	tableResize = function(){
//		$("#grid-table").datagrid("fixColumnSize");
		var width = $(".manage-tab").width();
		$("#grid-table").datagrid('resize', {
            width: width - 2,
        });
	}
	$(window).resize(function(event) {
		var width = $(".manage-tab").width();
		$("#grid-table").datagrid('resize', {
            width: width - 2,
        });
	});

});