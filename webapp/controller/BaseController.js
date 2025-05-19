sap.ui.define(
    [
      "sap/ui/core/mvc/Controller",
      "sap/ui/model/json/JSONModel",
      "sap/ui/model/odata/v2/ODataModel",
      "sap/m/MessageToast"
    ],
    function(BaseController, JSONModel, ODataModel, MessageToast) {
      "use strict";
  
      return BaseController.extend("zcomfgcost01.controller.App", {
        onInit: function() {
          
        },

        /**
         * custom model list 생성
         * @param {*} _oDataList - Model List를 담을 전역변수
         * @param {*} oView - this.getView()
         * @param {*} oModelName - oData Controll을 위한 ModelName
         * @param {*} oModel - oData Controll을 위한 Model
         * @param {*} oEntitySet - oData Controll을 위한 EntitySet
         * @param {*} vModelDiv - Model 생성구분여부webapp/controller/BaseController.js
         * @returns 
         */
        _setCustomModel : function(_oDataList, oView, oModelName, oModel, oEntitySet, vModelDiv){
            _oDataList[oModelName] = {
                "oModelName": oModelName,
                "oModel": oModel,
                "oEntitySet": oEntitySet
          };

          switch(vModelDiv){
            case "ODataModel":
                return this._createODataModel(oView, oModel, oModelName);
                break;	
            case "JSONModel":
                return this._createJSONModel(oView, oModelName);
                break;	    
            case "null":
                return null;
                break;	
            }
        },

        /**
         * custom json model 생성
         * @param {*} oView - this.getView()
         * @param {*} oModelName  - oData Controll을 위한 ModelName
         * @returns 
         */
        _createJSONModel : function(oView, oModelName){
            oView.setModel(new JSONModel(), oModelName);
            return oView.getModel(oModelName);
        },
        
        /**
         * custom oModel model 생성
         */
        _createODataModel : function(oView, oModel, oModelName){
            oView.setModel(new ODataModel(oModel), oModelName);
            return oView.getModel(oModelName);
        },

        /**
         * _oDataList를 활용한 oData Read
         * @param {*} oModel 
         * @param {*} aFilter 
         * @param {*} aParameters 
         * @param {*} aSort 
         * @returns 
         */
        _getODataModelRead : function(oModel, aFilter, aParameters, aSort){
            var deferred = $.Deferred();
            var odataModel = new ODataModel(oModel.oModel),
                self = this;
            var param = {
                ReadContext : oModel.oEntitySet || "",
                Parameters : aParameters || null,
                Filter : aFilter || [],
                Sorter : aSort || []
            };
            odataModel.read(param.ReadContext,{
                urlParameters: param.Parameters,
                filters : param.Filter,
                sorters : param.Sorter,
                success : function(oReturn){
                    var aResult = oReturn.results;
                    
                    if(oModel.oModelName) {
                        self[oModel.oModelName] = aResult;
                    }
                    
                    deferred.resolve(aResult);
                },
                error: function(oError) {
                    deferred.reject(oError);
                    if(oError.responseText){
                        var oResponseTextData = JSON.parse(oError.responseText);
                        MessageToast.show(oResponseTextData.error.message.value);
                    }else{
                        MessageToast.show(oError.statusText);	
                    }
                }
            });
          
          return deferred.promise();
        },

        /**
         * 검색조건 가져오기
         * @returns 
         */
        _getSearchFilter : function(){
            var aFilter = [];
            var oView = this.getView(),
                iFilterBar = oView.byId("iFilterBar"),
                aFilterItems = iFilterBar.getFilterGroupItems();
            
            aFilterItems.forEach(function(item){
                var vFieldName = item.getName(),
                    oControl = item.getControl(),
                    oFilter = this._getControlValue(oControl, vFieldName);
                if(oFilter){
                    aFilter.push(oFilter);                    
                }
            }.bind(this));
            return aFilter;
            
            //return aFilter;
        },
        /**
         * 검색조건 유형별 처리
         * @param {*} oControl 
         * @param {*} vFieldName 
         * @returns 
         */
        _getControlValue : function(oControl, vFieldName){
            var oFilter = null, vValue = null;

            if(oControl instanceof sap.m.Select){
                vValue = oControl.getSelectedKey();
                if(vValue.length){
                    oFilter = vValue;
                }
            }else if(oControl instanceof sap.m.DatePicker){               
                if(oControl.getValue()) {
                    vValue = oControl.getValue().replace("-", "");
                    oFilter = vValue;                    
                }
            }else if(oControl instanceof sap.m.RadioButtonGroup){
                vValue = oControl.getSelectedIndex();
                
                if(vValue == 0){
                    oFilter = "1";
                }else if(vValue == 1){
                    oFilter = "2";
                }
            
            }

            return oFilter;
        },
      });
    }
  );
  