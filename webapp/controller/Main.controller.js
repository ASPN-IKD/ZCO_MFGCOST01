sap.ui.define([
    "zcomfgcost01/controller/BaseController",
    "sap/ui/model/Sorter",
    "sap/ui/model/json/JSONModel",
    "sap/ui/export/Spreadsheet",
    "sap/m/MessageToast",
    "sap/ui/core/date/UI5Date"
],
    function (Controller, Sorter, JSONModel, Spreadsheet, MessageToast, UI5Date) {
     
    "use strict";

    var _oDataList = {};
    var _i18n;
    var _oTable;
    var _oViewTableModel;    
    var _oModelMain;
    var oView;
    var _oGLAccount;
    var _oProfitField;

    return Controller.extend("zcomfgcost01.controller.Main", {
        onInit: function() {
            oView = this.getView();
            this.setInitPage(oView);
        },

        setInitPage : function(oView){

            //i18n
            _i18n = this.getOwnerComponent().getModel('i18n').getResourceBundle();

            //view.xml table id
            _oTable = oView.byId("iACTUALCOST");

            // // //view.xml table row path model
            _oViewTableModel = this._createJSONModel(oView,"oACTUALCOST");
            
            _oViewTableModel.setProperty("/", []);

            //value help list
            var oLedger = this._setCustomModel(_oDataList, oView, "oLedger", "/sap/opu/odata/sap/ZASPN_CBO_O2_0002/", "/Ledger", "JSONModel");
            var oCompany = this._setCustomModel(_oDataList, oView, "oCompany", "/sap/opu/odata/sap/ZASPN_CBO_O2_0002/", "/Company", "JSONModel");
            var oPlant = this._setCustomModel(_oDataList, oView, "oPlant", "/sap/opu/odata/sap/ZASPN_CBO_O2_0002/", "/Plant", "JSONModel");
            _oGLAccount = this._setCustomModel(_oDataList, oView, "oGLAccount", "/sap/opu/odata/sap/ZASPN_CBO_O2_0002/", "/GLAccount", "JSONModel");
            _oProfitField = this._setCustomModel(_oDataList, oView, "oProfitField", "/sap/opu/odata/sap/ZASPN_CBO_O2_0002/", "/ProfitField", "JSONModel");

            this.setFilterBarSetting();

            var sSorter1 = [
                new Sorter("IsLeadingLedger", true)
            ];

            $.when(
                this._getODataModelRead(_oDataList["oLedger"],null,null,sSorter1)
            ).done(function(oResults){
                oLedger.setSizeLimit(oResults.length);
                oLedger.setProperty("/", oResults);
            });
            
            $.when(
                this._getODataModelRead(_oDataList["oCompany"],null,null,null)
            ).done(function(oResults){
                oCompany.setSizeLimit(oResults.length); 
                oCompany.setProperty("/", oResults);
            });
         
            $.when(
                this._getODataModelRead(_oDataList["oPlant"],null,null,null)
            ).done(function(oResults){
                oPlant.setSizeLimit(oResults.length); 
                oPlant.setProperty("/", oResults);
            });

            var sGLACCOUNTITEM_P = {
                $top:"100000"
            };

            // 전체 데이터 읽어와서 filter로 처리
            $.when(
                this._getODataModelRead(_oDataList["oGLAccount"],null,sGLACCOUNTITEM_P,null)
            ).done(function(oResults){
                _oGLAccount.setSizeLimit(oResults.length); 
                _oGLAccount.setProperty("/", oResults);
            });

            $.when(
                this._getODataModelRead(_oDataList["oProfitField"],null,null,null)
            ).done(function(oResults){
                _oProfitField.setSizeLimit(oResults.length); 
                _oProfitField.setProperty("/", oResults);
            });
        },

        setColumn : function(){
            var vOrgPeriod = this.byId("fbPeriod").getValue();
            var vYear = vOrgPeriod.substring(0,4);
            var vMonth = vOrgPeriod.substring(5);

            var vPeriod = vYear + vMonth.toString();
            
            this.deleteColumnSel();
            this.createColumn(vPeriod);

            _oTable.setModel(new sap.ui.model.json.JSONModel());      
            
        },

        setFilterBarSetting : function(){
            
            var today = new Date();
            var year = today.getFullYear();
            var month = today.getMonth();
            var oModelDate = new JSONModel();

            if(month == "1"){
                year = year - 1;
                month = '12';
            }else{
                month = month - 1;
            }

            oModelDate.setData({
                Period: UI5Date.getInstance(year, month)
            });
            this.getView().setModel(oModelDate);
            
            var vMonth = month + 1;
            var vPeriod = year + "" + vMonth.toString().padStart(3, '0');
            
            this.createColumn(vPeriod);
        },

        change_month: function(vMonth){
            var vCal = "";
            switch(vMonth){
                case 1: 
                    vCal = "jan";
                    break;
                case 2: 
                    vCal = "feb";
                    break;
                case 3: 
                    vCal = "mar";
                    break;
                case 4: 
                    vCal = "apr";
                    break;
                case 5: 
                    vCal = "may";
                    break;
                case 6: 
                    vCal = "jun";
                    break;
                case 7: 
                    vCal = "jul";
                    break;
                case 8: 
                    vCal = "aug";
                    break;
                case 9: 
                    vCal = "sep";
                    break;
                case 10: 
                    vCal = "oct";
                    break;
                case 11:
                    vCal = "nov";
                    break;
                case 12:
                    vCal = "dece";
                    break;
            }

            return vCal;
        },

        //열 동적으로 생성
        createColumn : function(vEndPeriod){
            var vStrMonth = '01';
            var vEndMonth = parseInt(vEndPeriod.substring(5,7));
            var vEndPeriod = vEndPeriod;
            var vCalMonth = parseInt(vStrMonth);
            
            while( vCalMonth <= vEndMonth ){

                var vHBox = new sap.m.HBox({
                    justifyContent: sap.m.FlexJustifyContent.End
                });

                var vFieldMonth = this.change_month(vCalMonth);

                var oText = new sap.m.Text({
                    text: {
                        parts: [ 
                            {path: vFieldMonth},
                            {path: 'fieldCur'}
                        ],
                        type: new sap.ui.model.type.Currency({
                            currencyCode: true,
                            showMeasure: false
                        }),
                    }, 
                });

                vHBox.addItem(oText);

                _oTable.addColumn(new sap.ui.table.Column({
                    label: new sap.m.Label({text: vCalMonth + "월"}),
                    template: vHBox,
                    width: "150px",
                    hAlign: sap.ui.core.HorizontalAlign.Center
                }));

                vCalMonth = vCalMonth + 1;
            }                     
        },

        onChangeSelType : function(oParam){

            var type = oParam.mParameters.selectedIndex;
            
            _oTable.setModel(new sap.ui.model.json.JSONModel());      
                
            if (type == '0') {
                this.deleteColumn();
                
                var vHBox = new sap.m.HBox({
                    justifyContent: sap.m.FlexJustifyContent.End
                });

                 // Text 생성
                 var oText = new sap.m.Text({
                    text: {
                        parts: [ 
                            {path: 'total'},
                            {path: 'fieldCur'},
                        ],
                        type: new sap.ui.model.type.Currency({
                            currencyCode: true,
                            showMeasure: false
                        }),
                    }, 
                });

                vHBox.addItem(oText);

                _oTable.addColumn(new sap.ui.table.Column({
                    label: new sap.m.Label({text: '금액'}),
                    template: vHBox,
                    width: "150px",
                    hAlign: sap.ui.core.HorizontalAlign.Center
                }));

                var vOrgPeriod = this.byId("fbPeriod").getValue();
                var vYear = vOrgPeriod.substring(0,4);
                var vMonth = vOrgPeriod.substring(5);
    
                var vPeriod = vYear + vMonth.toString();

                this.createColumn(vPeriod);

            } else if (type == '1'){

                this.deleteColumn();

                var vHBox = new sap.m.HBox({
                    justifyContent: sap.m.FlexJustifyContent.End
                });

                 // Text 생성
                 var oText = new sap.m.Text({
                    text: {
                        parts: [ 
                            {path: 'total'},
                            {path: 'fieldCur'},
                        ],
                        type: new sap.ui.model.type.Currency({
                            currencyCode: true,
                            showMeasure: false
                        }),
                    }, 
                });

                vHBox.addItem(oText);

                _oTable.addColumn(new sap.ui.table.Column({
                    label: new sap.m.Label({text: '합계'}),
                    template: vHBox,
                    width: "150px",
                    hAlign: sap.ui.core.HorizontalAlign.Center
                }));

                // Text 생성
                _oProfitField.getProperty("/").forEach(element => {
   
                    var vHBox = new sap.m.HBox({
                        justifyContent: sap.m.FlexJustifyContent.End
                    });

                    var oText = new sap.m.Text({
                        text: {
                            parts: [ 
                                {path: element.Fieldkey},
                                {path: 'fieldCur'},
                            ],
                            type: new sap.ui.model.type.Currency({
                                currencyCode: true,
                                showMeasure: false
                            }),
                        }, 
                    });
    
                    vHBox.addItem(oText);

                    _oTable.addColumn(new sap.ui.table.Column({
                        label: new sap.m.Label({text: element.Fieldname}),
                        template: vHBox,
                        width: "150px",
                        hAlign: sap.ui.core.HorizontalAlign.Center
                    }));

                    var vHBox = new sap.m.HBox({
                        justifyContent: sap.m.FlexJustifyContent.End
                    });
                });
            }
        },  

        onSearch : function(){

            if(!_oTable.isBusy()){
                _oTable.setBusy(true);
            }

            var aFilter = this._getSearchFilter();
            
            if (!aFilter.length || aFilter.length != 5){
                MessageToast.show(_i18n.getText("MSG_RESULT_FILTER"));
                _oTable.setBusy(false);
                return;
            }
        
            var url = "/ZCBO_TEST_CO_0001(P_Ledger='" + aFilter[0] + "',P_Companycode='" + aFilter[1] + "',P_Plant='" + aFilter[2] + "',P_FiscalYearPeriod='" + aFilter[3] + "',P_Type='" + aFilter[4] + "')/Set"
            
            _oModelMain = this._setCustomModel(_oDataList, oView, "oMODELMAIN", "/sap/opu/odata/sap/ZASPN_CBO_O2_0002/", url, "ODataModel");
            
            $.when(
                this._getODataModelRead(_oDataList["oMODELMAIN"],null,null,null)
            ).done(function(oResults){

                if(!oResults.length) {
                    _oTable.setSelectedIndex(-1);
                    _oTable.setBusy(false);
                    MessageToast.show(_i18n.getText("MSG_RESULT_NULL"));
                    return;
                }
                
                _oTable.setSelectedIndex(-1);
                _oViewTableModel.setProperty("/", oResults);
                _oTable.setBusy(false);

                var aRows = _oViewTableModel.getProperty("/");
                var aHierarchy = [];
                var aNode = {};

                aRows.sort((a, b) => b.HierarchyLevel - a.HierarchyLevel);

                aRows.forEach((node) => {
                    aNode[node.NodeID] = {...node, child: []}; 
                })

                aRows.forEach((node) => {

                    var vPnode = node.ParentNodeID;
                    const vNumP = Number(vPnode);

                    var vNode = node.NodeID;
                    const vNum = Number(vNode);

                    if (aNode[vNumP]){
                        aNode[vNumP].child.push(aNode[vNum]);
                    } else {
                        aHierarchy.push(aNode[vNum]);
                    }
                })

                _oTable.setModel(new sap.ui.model.json.JSONModel(aHierarchy));                

                _oTable.bindAggregation("rows", { path: "/",  
                                                    parameters : {
                                                        arrayNames:['child'],
                                                        countMode: 'Inline',
                                                        treeAnnotationProperties : {
                                                            hierarchyLevelFor : 'HierarchyLevel',
                                                            hierarchyNodeFor : 'NodeID',
                                                            hierarchyParentNodeFor : 'ParentNodeID',
                                                            hierarchyDrillStateFor : 'DrillState'
                                                        },
                                                        numberOfExpandedLevels : 3
                                                    }
                } );

             });
        },

        deleteColumnSel : function(){
            var oColumns = _oTable.getColumns();
            var vColumnCnt = _oTable.getColumns().length;
            for(var i = 2; i < vColumnCnt; i++){
                _oTable.removeColumn(oColumns[i]);
            }
        },

        deleteColumn : function(){
            var oColumns = _oTable.getColumns();
            var vColumnCnt = _oTable.getColumns().length;
            for(var i = 1; i < vColumnCnt; i++){
                _oTable.removeColumn(oColumns[i]);
            }
        },

        formatterCurrency : function(amount, currency){

            if(amount != null && currency != null){

                var vCurrencyFormat = sap.ui.core.format.NumberFormat.getCurrencyInstance({
                    currencyCode: true,
                    showMeasure : false
                });

                return vCurrencyFormat.format(amount, currency);
            }
        },

        onNavigateToStandard: function(oEvent) {
            var vLedger = this.byId("fbLedger").mProperties.selectedKey;
            var vCompany = this.byId("fbCompany").mProperties.selectedKey;
            var vPeriodYear = this.byId("fbPeriod").getValue()
            vPeriodYear = vPeriodYear.substring(0,4);

            var vRowIdx = parseInt(oEvent.getParameter("rowIndex"));

            var vOrgGLAccount = _oTable.getContextByIndex(vRowIdx).getObject().movegl;
            var vGLAccount = [];

            if (_oTable.getContextByIndex(vRowIdx).getObject().moveyn == 'N' || _oTable.getContextByIndex(vRowIdx).getObject().moveyn == '') {
                return;
            }

            var oGLAccount2 = _oGLAccount.getProperty("/");
            var aGLAccount = []

            if(vOrgGLAccount.indexOf('&') > 0){
                var vArray = [];
                vArray = vOrgGLAccount.split("&");
                aGLAccount = oGLAccount2.filter(function(oItem) {
                    return ((oItem.GLAccount >= vArray[0].substring(2) && oItem.GLAccount <= vArray[1].substring(2)));
                });
                
                aGLAccount.forEach((row)=>{
                    if(vGLAccount.length != 0){
                        vGLAccount = vGLAccount + ",";
                    }
                    vGLAccount = vGLAccount + row.GLAccount;
                })    

                if (vGLAccount.indexOf(",") > 0){
                    vArray = vGLAccount.split(",");
                    vGLAccount = vArray;
                }
                
            }else if(vOrgGLAccount.indexOf(',') > 0){
                vArray = vOrgGLAccount.split(",");
                
                vArray = vArray.map(code => {
                    return code.startsWith('00') ? code.slice(2) : code;
                });

                vGLAccount = vArray;
            }else{
                vGLAccount = vOrgGLAccount.substring(2)
            }
            
            if (sap.ushell && sap.ushell.Container && sap.ushell.Container.getService) {
                var oCrossAppNavigator = sap.ushell.Container.getService("CrossApplicationNavigation");
        
                var sHash = oCrossAppNavigator.hrefForExternal({
                    target: {
                        semanticObject: "GLAccount",
                        action: "displayBalances"
                    },
                    params: {
                        "sap-prelaunch-operations" : {
                            "type": "split", 
                            "source": "202401", 
                            "target": ["FromPeriod", "ToPeriod"]
                        },
                        "LedgerFiscalYear" : vPeriodYear,
                        "ControllingArea" : "A000",
                        "Ledger" : vLedger,
                        "ChartOfAccounts" : "YCOA",
                        "GLAccount":  vGLAccount,
                        "CompanyCode" : vCompany,
                        "sap-tag" : "superiorAction",
                        "sap-fiori-id" : "F0707A",
                        "sap-keep-alive":"restricted",
                    }
                }) || "";

                sap.m.URLHelper.redirect(window.location.href.split('#')[0] + sHash, true);
            } else {
                console.error("Cross-Application Navigation 서비스를 사용할 수 없습니다.");
            }        
        },

        flattenData: function (aData) {
            var that = this;
            aData.forEach(function (oItem) {
                that.aExportData.push({
                    Description: oItem.Description,
                    total: oItem.total,
                    jan: oItem.jan,
                    feb: oItem.feb,
                    mar: oItem.mar,
                    apr: oItem.apr,
                    may: oItem.may,
                    jun: oItem.jun,
                    jul: oItem.jul,
                    aug: oItem.aug,
                    sep: oItem.sep,
                    oct: oItem.oct,
                    nov: oItem.nov,
                    dece: oItem.dece,
                    cbn: oItem.cbn,
                    th: oItem.th,
                    ts: oItem.ts
                });

                if (oItem.child && oItem.child.length > 0) {
                    that.flattenData(oItem.child);
                }
            });
        },

        excelExport:function(){

            var self = this,
            oView = this.getView(),
            aColumns = _oTable.getColumns(), 
            aColumnConfig = [],
            oI18n = oView.getModel("i18n");
                
            aColumns.forEach(function(col){
                
                var sItems = col.getTemplate().mAggregations.items[0];
                
                var sProperty = sItems.getBindingPath("text");

                if(!sProperty) {
                    sProperty = sItems.getBindingPath("value");
                }
                
                var sText = "";
                if(col.getLabel() === null) {
                    sText = col.getMultiLabels()[0].getText().trim();
                } else {
                    sText = col.getLabel().getText();
                }
                
                if(col.getLabel().getText() == "항목"){
                    var obj = {
                        label : sText,
                        property : sProperty,
                        width: 20,
                    }
                }else{
                    var obj = {
                        label : sText,
                        property : sProperty,
                        type: sap.ui.export.EdmType.Number,
                        delimiter : true,
                        scales : 0,
                        width: 20,
                    };
                }

                var bVisible = col.getVisible();
                if(bVisible){
                    aColumnConfig.push(obj);
                }
            });
            
            var oRowBinding, oSettings, oSheet;
                oRowBinding = _oTable.getBinding();
            var oModel = oRowBinding.getModel(),
                sPath = oRowBinding.sPath,
                aModelData = oModel.getProperty(sPath);

            this.aExportData = [];
            //this.flattenData(aModelData);

            oSettings = {
                workbook: { columns: aColumnConfig },
                dataSource: this.aExportData,
                fileName : "제조원가명세서" + ".xlsx"
            };
    
            oSheet = new Spreadsheet(oSettings);
            oSheet.build().finally(function() {
                oSheet.destroy();
            });
        },

    });
});
