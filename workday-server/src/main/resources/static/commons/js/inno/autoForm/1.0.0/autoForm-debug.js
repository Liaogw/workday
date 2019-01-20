define("inno/autoForm/1.0.0/autoForm-debug",function(require, exports, module) {
    var $ = require("$"),
        Form = require("inno/form/1.0.0/form-debug"),
        ConfirmBox = require("inno/dialog/1.0.0/confirmbox-debug"),
        OfflineStorage = require("inno/offline-storage/1.0.0/offline-storage-debug"),
        BrowserStorage = require("inno/browser-storage/1.0.0/storage-debug"),
        Validator =  require("inno/validator/1.0.0/validator-debug");

    var offlineStorage;

    var autoForm = Form.extend({
            attrs:{
                element: {
                    value: null,
                    getter: function(val) {
                        return $(val).eq(0);
                    }
                },
                addUrl:null,
                updateUrl:null,
                saveTrigger:{
                    value:"#btnSave",
                    getter:function(val){
                        return $(val).eq(0);
                    }
                },
                cancelTrigger:{
                    value:"#btnCancel",
                    getter:function(val){
                        return $(val).eq(0);
                    }
                },
                offlineStatus:true,
                saveFn:function(autoForm,cb){
                    var url,
                        json = autoForm.form2json(),
                        sign = autoForm.get("signTrigger").val(),
                        offlineStatus =  autoForm.get('offlineStatus'),
                        message = autoForm.get("message");

                    if(sign == "edit"){
                        url = autoForm.get("updateUrl");
                        message += "编辑";
                    }else{
                        url = autoForm.get("addUrl");
                        message += "新增";
                    }

                    $.ajax({
                        url: url,
                        data: json,
                        type:"post",
                        success:function(result){
                            ConfirmBox.confirm(message + '成功!','',function(){
                                cb();
                            });
                            autoForm.clearForm();
                            autoForm.get("saveTrigger").attr("disabled",false); 
                            if(offlineStatus){
                                offlineStorage.clearStorage();
                            }

                        },
                        error:function(result, err){
                            ConfirmBox.confirm(message + '失败!','',function(){
                                cb();
                            });
                            autoForm.get("saveTrigger").attr("disabled",false);            
                        }
                    });
                },
                saveCB:function(){
                 //   console.log('save success!');
                    window.frameElement.trigger('close'); 
                },
                cancelFn:function(){
                    window.frameElement.trigger('close');
                },  
                signTrigger:{
                    value:'#sign',
                    getter:function(val){
                        return $(val).eq(0);
                    }
                },
                message:"",
                json:null,
                listName:null
            },
            initialize:function(config){
                autoForm.superclass.initialize.call(this,config);
                this.bindEvents();
                if(this.get('offlineStatus')){
                    offlineStorage = new OfflineStorage({
                        element:this.attrs.element.value,
                        listName:this.get("listName")
                    });
                }

            },
            bindEvents:function(){
                var self = this,
                    saveTrigger = this.get("saveTrigger"),
                    cancelTrigger = this.get("cancelTrigger"),
                    cancelFn = this.get("cancelFn"),
                    saveFn = this.get("saveFn"),
                    saveCB = this.get("saveCB"),
                    ele = this.attrs.element.value,
                    ComboRules = this.get("ComboRules"),
                    formConfig = this.get("formConfig");

                cancelTrigger.click(cancelFn);

                Validator.ComboRules = ComboRules;

                var validator = new Validator({
                    element: ele,
                    formConfig: formConfig,
                    failSilently: true,
                    checkOnSubmit:false
                });

                validator.render();

                validator.element.on("submit",function(e){
                    e.preventDefault();
                    validator.execute(function(err){
                        if(err){

                        }else{
                            saveTrigger.attr("disabled",true);
                            saveFn(self,saveCB);
                        }
                    });
                });
            },
            clearStorage:function(){
                clearInterval(this.get("timer"));
                BrowserStorage.api.remove(this.get("listName"));
            }
    });

    module.exports =autoForm;
});