'use strict';

/* Controllers */

angular.module('coreBOSJSTickets.controllers', [])
.controller('navigationCtrl',function($scope, $rootScope, Setup, $i18next, $window, $location,coreBOSWSAPI) {
	$scope.appname = Setup.app;
	$scope.messageurl = "http://corebos.org";
	$scope.messagetxt = "Data provided by coreBOS. &copy; 2014";
	$(window).bind('resize', function() {
		if ($window.innerWidth < 768 || $location.path() == '/login') {
			$scope.menuShow = false;
			$rootScope.menuShow = false;
		} else {
			$scope.menuShow = true;
			$rootScope.menuShow = true;
		}
		$scope.$apply();
	});
        coreBOSWSAPI.doListTypes().then(function(response) {
		$scope.listtypes = response.data.result;
		var ltypes = coreBOSWSAPI.processListTypes(response.data.result.information, false, true);
		$scope.selecttypes = ltypes;
                //$scope.selecttypes.push({name:'Accounts',label:'Aziende'});
	});
        
//        var option = { 
//                  ns: 'translation',
//                  resGetPath: 'locales/it/translation.json?lng=en&ns=translation',
//                  //resGetPath: '/CID/webservice.php?module=Campaigns&operation=getlanguagefile&sessionName='+coreBOSAPIStatus.getSessionInfo()._sessionid+'&lng=en&ns=translation',
//                  dynamicLoad: true
//                };
//        i18n.init(option);
        
	if($location.path() == '/login')
		$scope.menuShow = false;
	else
		$scope.menuShow = true;
        coreBOSWSAPI.doQuery('select * from PHBManager' ).then(function(response) {
			$scope.result = response.data.result[0];
                        less.modifyVars({
                              '@color': $scope.result.menu_color
        });
		});
	$scope.toggleMenu = function() {
		$scope.menuShow = !$scope.menuShow;
		$rootScope.menuShow = !$rootScope.menuShow;
	};
	$rootScope.$watch("menuShow", function(newval, oldval){
		$scope.menuShow = $rootScope.menuShow;
	});
	
	$scope.isActive = function (viewLocation) {
		var active = (viewLocation === $location.path());
		return active;
	};
})
.controller('logoutCtrl',function($scope, $location, coreBOSAPIStatus) {
	// delete cookies or storage variables here
	coreBOSAPIStatus.setInvalidKeys(true);
	coreBOSAPIStatus.setSessionInfo({});
	$location.path('/login');
})
.controller('termscCtrl',function($scope) {
})
.controller('loginCtrl',function($scope, $rootScope, $i18next, $filter, Setup, coreBOSWSAPI, coreBOSAPIStatus,$location) {
	$scope.username='test';
        $scope.password='juKaW2jesSfBhgHM';
        if (!coreBOSAPIStatus.hasInvalidKeys()) {
		$location.path('/currentorder');
	}
	else
	{
		$rootScope.menuShow = false;
		$scope.langs = [ {
			name : i18n.t('English'),
			code : 'en'
		}, {
			name : i18n.t('Spanish'),
			code : 'es'
		}];
		$scope.changeLanguage = function (lng) {
			i18n.setLng('en', function(t) { 
				$scope.langs = [ {
					name : t('English'),
					code : 'en'
				}, {
					name : t('Spanish'),
					code : 'es'
				}];
				$i18next.options.lng='en';
			});
		};
		var found = $filter('getArrayElementById')($scope.langs, $i18next.options.lng, 'code');
		if (found!=null) {
			$scope.currentLang = found;
		} else {
			$scope.currentLang = $scope.langs[0];
		}
		coreBOSWSAPI.setURL(Setup.corebosapi,false);
		$scope.$watch("username", function(newval, oldval){
			coreBOSWSAPI.setcoreBOSUser(newval,false);
		});
		$scope.$watch("password", function(newval, oldval){
			coreBOSWSAPI.setcoreBOSKey(newval,false);
		});
		$scope.login = function(){
			
			coreBOSWSAPI.doLogin($scope.username,$scope.password).then(function() {
				coreBOSWSAPI.setConfigured();
				$location.path('/cid_module/Anamnesis/Anamnesis');
			},function(){
				coreBOSWSAPI.doLoginPortal($scope.username,$scope.password).then(function(response) {
					
					coreBOSWSAPI.setConfigured();
					$rootScope.contactinfo = [{
						contactid : '',
						firstname : '',
						lastname  : '',
						accountid : '',
						email     : '',
					}];
					$location.path('/cid_module/Anamnesis/Anamnesis');
				},function(){
					$scope.ErrorUserNotValid = true;
				});
			});
		};

		$scope.cbAPIConfigured = coreBOSWSAPI;
		$scope.cbAPIKeys = coreBOSAPIStatus;
	}
})
.controller('neworderCtrl',function($scope, $i18next, $filter, coreBOSWSAPI) {
	$scope.so = {};
	var dmin = new Date();
	dmin.setHours(6);
	dmin.setMinutes(0);
	var dmax = new Date();
	dmax.setHours(18);
	dmax.setMinutes(30);
	$scope.cities = [
	 "Fort Collins", "Loveland", "Greeley", "Windsor", "Ault", "Bellvue", "Berthoud", "Eaton",
	 "Evans", "Johnstown", "Laporte", "La Salle", "Loveland", "Longmont", "Milliken",
	 "Severence", "Timnath", "Wellington", "OTHER"
	];
	$scope.apartments = ["Apartment", "Condo", "Duplex", "SingleFamily", "Commercial"];
	$scope.yesno = ["Yes","No"];
	$scope.sqfeetoptions = ["250 - 500","500 - 1000","1000 - 1500","1500 - 2000","2000 - 2500","2500 - 3000","3000 - 3500","3500+"];
	$scope.condoptions = ["Unknown","Average","Heavily Soiled","Trashed"];
	$scope.petoptions = ["None","Unknown","Urine Smell","Other Foul Smell"];
	$scope.minDate = new Date();
	var mdate = new Date();
	mdate.setFullYear($scope.minDate.getFullYear()+1,$scope.minDate.getMonth(),$scope.minDate.getDate());
	$scope.maxDate = mdate;
	$scope.openworkdate = function($event) {
		$event.preventDefault();
		$event.stopPropagation();
		$scope.openedworkdate = true;
	};
	$scope.openduedate = function($event) {
		$event.preventDefault();
		$event.stopPropagation();
		$scope.openedduedate = true;
	};
	var ddefault = new Date();
	ddefault.setHours(8);
	ddefault.setMinutes(30);
	$scope.so.atime = ddefault;
	$scope.setMaxMinTime = function () {
		if ($scope.so.atime>dmax) {
			$scope.so.atime=dmax;
		}
		if ($scope.so.atime<dmin) {
			$scope.so.atime=dmin;
		}
	};
	$scope.ordersent = false;
	$scope.errorsending = false;
	$scope.doSendNewOrder = function() {
		$scope.so.account_id = '3x32528'; // FIXME
		$scope.so.cf_837 = $scope.so.account_id; // FIXME:: accountname
		$scope.so.sostatus = 'Pending';
		$scope.so.invoicestatus = 'Pending';
		$scope.so.ship_state = 'CO';
		$scope.so.bill_street = '*';
		$scope.so.purchaseorder = '0';
		$scope.so.cf_541 = $filter('date')($scope.so.atime,'HH:mm');
		$scope.so.duedate = $filter('date')($scope.so.ddate,'yyyy/MM/dd');
		$scope.so.cf_555 = $filter('date')($scope.so.cdate,'yyyy/MM/dd');
		// líneas de producto
		$scope.so.pdoInformation = [
			{productid:135,
			 comment:'',
			 qty:1,
			 listprice:0,
			 discount:0,  // 0 no discount, 1 discount
			 discount_type: 0,  //  amount/percentage
			 discount_percentage:0,  // not needed nor used if type is amount
			 discount_amount:0  // not needed nor used if type is percentage
		}];
		coreBOSWSAPI.doCreate('SalesOrder',$scope.so).then(function(response) {
			$scope.ordersent = true;
			$scope.comment = 'Your order for ' + $scope.so.address + ' has been submitted. Check the Open Orders list to watch for confirmation.';
		},function(response) {
			$scope.errorsending = true;
			$scope.errormsg = 'Your order for ' + $scope.so.address + ' could not be submitted correctly. Please try again and inform your contact in Smart Carpet Care for assistance.';
		});
	};
})
.controller('emailusCtrl',function($scope, $i18next, coreBOSWSAPI) {
	$scope.emailustext = '';
	$scope.emailsent = false;
	$scope.doSendEmail = function() {
		coreBOSWSAPI.doInvoke('scSendQuestion',{
			'question': $scope.emailustext,
			'entityid': ''  // FIXME
			},'POST').then(function(response) {
			$scope.emailsent = true;
		});
	};
})
.controller('referralCtrl',function($scope, $i18next, coreBOSWSAPI) {
	$scope.emailustext = '';
	$scope.emailsent = false;
	$scope.doSendReferralEmail = function() {
		var $message;
		$message = "The following referral has been submitted by TEST USER\n\n"; // FIXME: change TEST USER
		$message+= "Name: " + $scope.name + "\n";
		$message+= "Company: " + $scope.company + "\n";
		$message+= "Phone: " + $scope.phone + "\n\n";
		$message+= "Email: " + $scope.email + "\n";
		coreBOSWSAPI.doInvoke('scSendReferral',{
			'referral': $message,
			'entityid': ''  // FIXME
			},'POST').then(function(response) {
			$scope.emailsent = true;
			$scope.comment = i18n.t('okReferralComment', {refname: $scope.name});
		});
	};
})
.controller('currentorderCtrl',function($scope, $i18next, coreBOSWSAPI) {
	$scope.currentLang = $i18next.options.lng;
	$scope.ordersItemsCount = 0;
	$scope.ordersTotalCount = 0;
	$scope.ordersList = [];
	var so_account_id = '3x32528'; // FIXME
	var sqlr = "select id,cf_555,ship_street,duedate,sostatus from SalesOrder ";
	var sqlw = " where sostatus in ('Created','Scheduled','Pending','Completed','Invoiced','Invoice Paid') and account_id=" + so_account_id + ' ';
	coreBOSWSAPI.doQuery(sqlr + sqlw).then(function(response) {
		$scope.ordersList = response.data.result;
		$scope.ordersItemsCount = response.data.result.length;
	});
	coreBOSWSAPI.doQuery('select count(*) from SalesOrder' + sqlw).then(function(response) {
		$scope.ordersTotalCount = response.data.result[0].count;
	});
	$scope.onServerSideOrdersRequested = function(currentPage, pageItems, filterBy, filterByFields, orderBy, orderByReverse) {
		var where = coreBOSWSAPI.getWhereCondition($scope.ordersList[0],filterBy, filterByFields, orderBy, orderByReverse, 'and', sqlw);
		var limit = coreBOSWSAPI.getLimit(pageItems,currentPage*pageItems);
		var query = sqlr + where + limit;
		coreBOSWSAPI.doQuery(query).then(function(response) {
			$scope.ordersList = response.data.result;
			$scope.ordersItemsCount = response.data.result.length;
		});
		coreBOSWSAPI.doQuery('select count(*) from SalesOrder' + where).then(function(response) {
			$scope.ordersTotalCount = response.data.result[0].count;
		});
	};
})
.controller('orderviewCtrl',function($scope, $i18next, $routeParams, coreBOSWSAPI) {
	$scope.retrieveable = true;
	coreBOSWSAPI.doRetrieve($routeParams.id).then(function(response) {
		$scope.so = response.data.result;
		$scope.so.cf_838 = $scope.so.cf_838 ? 'Yes' : 'No';
	},function(response) {
		$scope.retrieveable = false;
	});
})
.controller('myaccountCtrl',function($scope, $i18next, coreBOSWSAPI) {
	$scope.notifyvia = [ {
		name : i18n.t('Email'),
		code : 'Email'
	}, {
		name : i18n.t('Fax'),
		code : 'Fax'
	}, {
		name : i18n.t('Phone'),
		code : 'Phone'
	}];
	$scope.accountsent = false;
	$scope.errorsending = false;
	var account_id = '3x32528'; // FIXME
	coreBOSWSAPI.doRetrieve(account_id).then(function(response) {
		$scope.ac = response.data.result;
	});
	$scope.doUpdateAccount = function() {
		$scope.ac.id = account_id; // FIXME
		coreBOSWSAPI.doUpdate('Accounts',$scope.ac).then(function(response) {
			$scope.accountsent = true;
			$scope.comment = i18n.t('okAccountInfoSent');
		},function(response) {
			$scope.errorsending = true;
			$scope.errormsg = i18n.t('nokAccountInfoSent');
		});
	};
})
.controller('moduleCtrl',function($scope, $i18next,$routeParams, coreBOSWSAPI, coreBOSAPIStatus,ngTableParams) {
	$scope.currentLang = $i18next.options.lng;
	$scope.myPageItemsCount = 0;
	$scope.myItemsTotalCount = 0;
	$scope.moduleList = [];
        $scope.module = $routeParams.module;
        $scope.moduleLabel = $routeParams.moduleLabel;
        var filter_col='';
        
        coreBOSWSAPI.getFilterFields($scope.module).then(function(response) {
			$scope.fields=response.data.result.fields;
                        $scope.linkfields=response.data.result.linkfields;
			
		});
        
        $routeParams.module=$routeParams.module.toLowerCase();
	coreBOSWSAPI.doQuery('select * from '+$routeParams.module).then(function(response) {
		$scope.moduleList = response.data.result;
		$scope.myPageItemsCount = response.data.result.length;
	$scope.tableParams = new ngTableParams({
        page: 1,            // show first page
        count: 5          // count per page
        
        }, {
        total: $scope.moduleList.length, // length of data
        getData: function($defer, params) {
            // use build-in angular filter
            var orderedData = $scope.moduleList;

            params.total(orderedData.length); // set total for recalc pagination
            $defer.resolve($scope.users = orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        }
        });
    });
	/*coreBOSWSAPI.doQuery('select * from helpdesk limit 0,15').then(function(response) {
		$scope.moduleList = response.data.result;
		$scope.myPageItemsCount = response.data.result.length;
	});
	coreBOSWSAPI.doQuery('select count(*) from helpdesk').then(function(response) {
		$scope.myItemsTotalCount = response.data.result[0].count;
	});
	$scope.onServerSideItemsRequested = function(currentPage, pageItems, filterBy, filterByFields, orderBy, orderByReverse) {
		var where = coreBOSWSAPI.getWhereCondition($scope.moduleList[0],filterBy, filterByFields, orderBy, orderByReverse);
		var limit = coreBOSWSAPI.getLimit(pageItems,currentPage*pageItems);
		var query = 'select * from helpdesk ' + where + limit;
		coreBOSWSAPI.doQuery(query).then(function(response) {
			$scope.moduleList = response.data.result;
			$scope.myPageItemsCount = response.data.result.length;
		});
		coreBOSWSAPI.doQuery('select count(*) from helpdesk' + where).then(function(response) {
			$scope.myItemsTotalCount = response.data.result[0].count;
		});
	};*/
})
.controller('moduleViewCtrl',function($scope, $i18next, $routeParams, $filter,$location, coreBOSWSAPI, coreBOSAPIStatus) {
	$scope.modulefieldList = [{field:'',val:''}];
	$scope.module = $routeParams.module;
        $scope.module1=$routeParams.module.toLowerCase();
        $scope.recordid = $routeParams.id;
	$scope.moduleData = {};
        $scope.entity={};
        $scope.creating=false;
	
        $scope.getModuleValue = function(field) {
		return $scope.moduleData[field];
	};
        coreBOSWSAPI.getRelatedModules($scope.module).then(function(response) {
                $scope.relatedmodules = response.data.result;
        });
	coreBOSWSAPI.doDescribe($scope.module).then(function(response) {
		$scope.idPrefix = response.data.result.idPrefix;
		$scope.createable = response.data.result.createable;
		$scope.updateable = response.data.result.updateable;
		$scope.deleteable = response.data.result.deleteable;
		$scope.retrieveable = response.data.result.retrieveable;
		$scope.modulename = response.data.result.name;
		$scope.modulefields = response.data.result.fields;
                $scope.labelFields = response.data.result.labelFields;
		if ($scope.retrieveable) {
			$scope.saveModule = function() {
                            if($scope.creating)
                            {
                               coreBOSWSAPI.doCreate($routeParams.module,$scope.moduleData).then(function(response) {
				});  
                            }
                            else
                            {
				coreBOSWSAPI.doUpdate($scope.module,$scope.moduleData).then(function(response) {
				});
                            }
			};
			$scope.doCreate = function() {
				coreBOSWSAPI.doCreate('moduleData',$scope.moduleData).then(function(response) {
				});
			};
			$scope.doDelete = function() {
				coreBOSWSAPI.doDelete($scope.moduleData.id).then(function(response) {
				});
			};
			coreBOSWSAPI.doQuery('select ticket_title from '+$scope.module1).then(function(response) {
				var aarray = [];
				angular.forEach(response.data.result, function(value, key) {
					aarray.push(value.ticket_title + ' (' + value.id + ')');
				});
				$scope.accs = aarray;
			});
			coreBOSWSAPI.doQuery('select first_name,last_name from users').then(function(response) {
				var uarray = [];
				angular.forEach(response.data.result, function(value, key) {
					uarray.push(value.first_name + ' ' + value.last_name + ' (' + value.id + ')');
				});
				$scope.usrs = uarray;
			});
                        if($routeParams.id.indexOf('x')==-1)
                        {
                            $scope.creating=true;//alert($scope.creating);
                            var flds = [], cols = [];
				var moduleData = {};
                                var i=0;
				var numcols = 3;
				var lblclass = 'col-md-2', vlclass = 'col-md-2';
                                for(i=0;i<$scope.modulefields.length;i++)
				{
					var found = $scope.modulefields[i];
					
					var fld = {
						label:found.label,
						labelclass:lblclass,
						field:$scope.modulefields[i]['name'],
						//val: value == '' ? 'none' : value,
						valclass:vlclass,
						uitype: found.uitype,
						type: found.type.name
					};
					//account[key] = value;
					if (found.type.name == 'reference') {
						
					}
					if (found.type.name == 'picklist') {
						var pl = {
							defaultValue: found.type.defaultValue,
							picklistValues: found.type.picklistValues
						};
						angular.extend(fld,pl);
					}
					cols.push(fld);
					if (cols.length == numcols) {
						flds.push(cols);
						cols = [];
					}
				};
				flds.push(cols);
				$scope.modulefieldList = flds;
				$scope.moduleData = moduleData;
                        }
                        else
			coreBOSWSAPI.doRetrieve($routeParams.id).then(function(response) {
				var flds = [], cols = [];
				var moduleData = {};
				var numcols = 3;
				var lblclass = 'col-md-2', vlclass = 'col-md-2';
				angular.forEach(response.data.result, function(value, key) {
					var found = $filter('getArrayElementById')($scope.modulefields, key, 'name');
					if (key==$scope.labelFields) {
						$scope.accountname = value;
					}
					var fld = {
						label:found.label,
						labelclass:lblclass,
						field:key,
						val: value == '' ? 'none' : value,
						valclass:vlclass,
						uitype: found.uitype,
						type: found.type.name
					};
					moduleData[key] = value;
					if (found.type.name == 'reference') {
						
					}
					if (found.type.name == 'picklist') {
						var pl = {
							defaultValue: found.type.defaultValue,
							picklistValues: found.type.picklistValues
						};
						angular.extend(fld,pl);
						if(fld.field == 'ticketstatus')
						{
							$scope.ticketstatus = fld;
						}
					}
					cols.push(fld);
					if (cols.length == numcols) {
						flds.push(cols);
						cols = [];
					}
				});
				flds.push(cols);
				$scope.modulefieldList = flds;
				$scope.moduleData = moduleData;
			});
		}
	});
        $scope.relmodule=$scope.module;
        $scope.relRecordList = [];
	
        $scope.showRel = function(relmod,relfield){
            if(relmod!=$scope.module){
            
            coreBOSWSAPI.getFilterFields(relmod).then(function(response) {
			$scope.fields=response.data.result.fields;
                        $scope.linkfields=response.data.result.linkfields;
                        
                        coreBOSWSAPI.doGetUi10RelatedRecords( $scope.recordid ,$scope.module,relmod, $scope.fields).then(function(response) {
                            $scope.relRecordList =response.data.result.records;
                  });
			
		});
            
              }
            $scope.relmodule=relmod;
            $scope.relfield=relfield;
        };
        

        if($scope.module=='Patients'){
        coreBOSWSAPI.getVitalParameters($scope.recordid).then(function(response) {
                    $scope.visitid =response.data.result.visit[0];
                    $scope.visitname =response.data.result.visit[1];
                    $scope.prescriptionname=response.data.result.prescription[1];
                    $scope.prescriptionid=response.data.result.prescription[0];
                    $scope.vitalid=response.data.result.vitals[0];
                    $scope.vitalname=response.data.result.vitals[1];
                    $scope.bloodpresure=response.data.result.vitals[2];
                    $scope.oxygensat=response.data.result.vitals[3];
                    $scope.weight=response.data.result.vitals[4];
                    $scope.bloodpressdi=response.data.result.vitals[5];
                    $scope.issues=response.data.result.issues;
            });
        }
        
        if($scope.module=='Vitals'){
         $scope.options = {
            chart: {
                type: 'stackedAreaChart',
                height: 450,
                margin : {
                    top: 20,
                    right: 20,
                    bottom: 60,
                    left: 40
                },
                x: function(d){return d[0];},
                y: function(d){return d[1];},
                useVoronoi: false,
                clipEdge: true,
                transitionDuration: 500,
                useInteractiveGuideline: true,
                xAxis: {
                    showMaxMin: false,
                    tickFormat: function(d) {
                        return d3.time.format('%x')(new Date(d))
                    }
                },
                yAxis: {
                    tickFormat: function(d){
                        return d3.format(',.2f')(d);
                    }
                }
            }
        };
        $scope.data = [
            {
                "key" : "Blood Pressure Systolic" ,
                "values" : [ [ 1025409600000 , 23.041422681023] , [ 1028088000000 , 19.854291255832] , [ 1030766400000 , 21.02286281168] , [ 1033358400000 , 22.093608385173] , [ 1036040400000 , 25.108079299458] , [ 1038632400000 , 26.982389242348] , [ 1041310800000 , 19.828984957662] , [ 1043989200000 , 19.914055036294] , [ 1046408400000 , 19.436150539916] , [ 1049086800000 , 21.558650338602] , [ 1051675200000 , 24.395594061773] , [ 1054353600000 , 24.747089309384] , [ 1056945600000 , 23.491755498807] , [ 1059624000000 , 23.376634878164] , [ 1062302400000 , 24.581223154533] , [ 1064894400000 , 24.922476843538] , [ 1067576400000 , 27.357712939042] , [ 1070168400000 , 26.503020572593] , [ 1072846800000 , 26.658901244878] , [ 1075525200000 , 27.065704156445] , [ 1078030800000 , 28.735320452588] , [ 1080709200000 , 31.572277846319] , [ 1083297600000 , 30.932161503638] , [ 1085976000000 , 31.627029785554] , [ 1088568000000 , 28.728743674232] , [ 1091246400000 , 26.858365172675] , [ 1093924800000 , 27.279922830032] , [ 1096516800000 , 34.408301211324] , [ 1099195200000 , 34.794362930439] , [ 1101790800000 , 35.609978198951] , [ 1104469200000 , 33.574394968037] , [ 1107147600000 , 31.979405070598] , [ 1109566800000 , 31.19009040297] , [ 1112245200000 , 31.083933968994] , [ 1114833600000 , 29.668971113185] , [ 1117512000000 , 31.490638014379] , [ 1120104000000 , 31.818617451128] , [ 1122782400000 , 32.960314008183] , [ 1125460800000 , 31.313383196209] , [ 1128052800000 , 33.125486081852] , [ 1130734800000 , 32.791805509149] , [ 1133326800000 , 33.506038030366] , [ 1136005200000 , 26.96501697216] , [ 1138683600000 , 27.38478809681] , [ 1141102800000 , 27.371377218209] , [ 1143781200000 , 26.309915460827] , [ 1146369600000 , 26.425199957518] , [ 1149048000000 , 26.823411519396] , [ 1151640000000 , 23.850443591587] , [ 1154318400000 , 23.158355444054] , [ 1156996800000 , 22.998689393695] , [ 1159588800000 , 27.9771285113] , [ 1162270800000 , 29.073672469719] , [ 1164862800000 , 28.587640408904] , [ 1167541200000 , 22.788453687637] , [ 1170219600000 , 22.429199073597] , [ 1172638800000 , 22.324103271052] , [ 1175313600000 , 17.558388444187] , [ 1177905600000 , 16.769518096208] , [ 1180584000000 , 16.214738201301] , [ 1183176000000 , 18.729632971229] , [ 1185854400000 , 18.814523318847] , [ 1188532800000 , 19.789986451358] , [ 1191124800000 , 17.070049054933] , [ 1193803200000 , 16.121349575716] , [ 1196398800000 , 15.141659430091] , [ 1199077200000 , 17.175388025297] , [ 1201755600000 , 17.286592443522] , [ 1204261200000 , 16.323141626568] , [ 1206936000000 , 19.231263773952] , [ 1209528000000 , 18.446256391095] , [ 1212206400000 , 17.822632399764] , [ 1214798400000 , 15.53936647598] , [ 1217476800000 , 15.255131790217] , [ 1220155200000 , 15.660963922592] , [ 1222747200000 , 13.254482273698] , [ 1225425600000 , 11.920796202299] , [ 1228021200000 , 12.122809090924] , [ 1230699600000 , 15.691026271393] , [ 1233378000000 , 14.720881635107] , [ 1235797200000 , 15.387939360044] , [ 1238472000000 , 13.765436672228] , [ 1241064000000 , 14.631445864799] , [ 1243742400000 , 14.292446536221] , [ 1246334400000 , 16.170071367017] , [ 1249012800000 , 15.948135554337] , [ 1251691200000 , 16.612872685134] , [ 1254283200000 , 18.778338719091] , [ 1256961600000 , 16.756026065421] , [ 1259557200000 , 19.385804443146] , [ 1262235600000 , 22.950590240168] , [ 1264914000000 , 23.61159018141] , [ 1267333200000 , 25.708586989581] , [ 1270008000000 , 26.883915999885] , [ 1272600000000 , 25.893486687065] , [ 1275278400000 , 24.678914263176] , [ 1277870400000 , 25.937275793024] , [ 1280548800000 , 29.461381693838] , [ 1283227200000 , 27.357322961861] , [ 1285819200000 , 29.057235285673] , [ 1288497600000 , 28.549434189386] , [ 1291093200000 , 28.506352379724] , [ 1293771600000 , 29.449241421598] , [ 1296450000000 , 25.796838168807] , [ 1298869200000 , 28.740145449188] , [ 1301544000000 , 22.091744141872] , [ 1304136000000 , 25.07966254541] , [ 1306814400000 , 23.674906973064] , [ 1309406400000 , 23.418002742929] , [ 1312084800000 , 23.24364413887] , [ 1314763200000 , 31.591854066817] , [ 1317355200000 , 31.497112374114] , [ 1320033600000 , 26.67238082043] , [ 1322629200000 , 27.297080015495] , [ 1325307600000 , 20.174315530051] , [ 1327986000000 , 19.631084213898] , [ 1330491600000 , 20.366462219461] , [ 1333166400000 , 19.284784434185] , [ 1335758400000 , 19.157810257624]]
            },

            {
                "key" : "Blood Pressure Diatolic" ,
                "values" : [ [ 1025409600000 , 7.9356392949025] , [ 1028088000000 , 7.4514668527298] , [ 1030766400000 , 7.9085410566608] , [ 1033358400000 , 5.8996782364764] , [ 1036040400000 , 6.0591869346923] , [ 1038632400000 , 5.9667815800451] , [ 1041310800000 , 8.65528925664] , [ 1043989200000 , 8.7690763386254] , [ 1046408400000 , 8.6386160387453] , [ 1049086800000 , 5.9895557449743] , [ 1051675200000 , 6.3840324338159] , [ 1054353600000 , 6.5196511461441] , [ 1056945600000 , 7.0738618553114] , [ 1059624000000 , 6.5745957367133] , [ 1062302400000 , 6.4658359184444] , [ 1064894400000 , 2.7622758754954] , [ 1067576400000 , 2.9794782986241] , [ 1070168400000 , 2.8735432712019] , [ 1072846800000 , 1.6344817513645] , [ 1075525200000 , 1.5869248754883] , [ 1078030800000 , 1.7172279157246] , [ 1080709200000 , 1.9649927409867] , [ 1083297600000 , 2.0261695079196] , [ 1085976000000 , 2.0541261923929] , [ 1088568000000 , 3.9466318927569] , [ 1091246400000 , 3.7826770946089] , [ 1093924800000 , 3.9543021004028] , [ 1096516800000 , 3.8309891064711] , [ 1099195200000 , 3.6340958946166] , [ 1101790800000 , 3.5289755762525] , [ 1104469200000 , 5.702378559857] , [ 1107147600000 , 5.6539569019223] , [ 1109566800000 , 5.5449506370392] , [ 1112245200000 , 4.7579993280677] , [ 1114833600000 , 4.4816139372906] , [ 1117512000000 , 4.5965558568606] , [ 1120104000000 , 4.3747066116976] , [ 1122782400000 , 4.4588822917087] , [ 1125460800000 , 4.4460351848286] , [ 1128052800000 , 3.7989113035136] , [ 1130734800000 , 3.7743883140088] , [ 1133326800000 , 3.7727852823828] , [ 1136005200000 , 7.2968111448895] , [ 1138683600000 , 7.2800122043237] , [ 1141102800000 , 7.1187787503354] , [ 1143781200000 , 8.351887016482] , [ 1146369600000 , 8.4156698763993] , [ 1149048000000 , 8.1673298604231] , [ 1151640000000 , 5.5132447126042] , [ 1154318400000 , 6.1152537710599] , [ 1156996800000 , 6.076765091942] , [ 1159588800000 , 4.6304473798646] , [ 1162270800000 , 4.6301068469402] , [ 1164862800000 , 4.3466656309389] , [ 1167541200000 , 6.830104897003] , [ 1170219600000 , 7.241633040029] , [ 1172638800000 , 7.1432372054153] , [ 1175313600000 , 10.608942063374] , [ 1177905600000 , 10.914964549494] , [ 1180584000000 , 10.933223880565] , [ 1183176000000 , 8.3457524851265] , [ 1185854400000 , 8.1078413081882] , [ 1188532800000 , 8.2697185922474] , [ 1191124800000 , 8.4742436475968] , [ 1193803200000 , 8.4994601179319] , [ 1196398800000 , 8.7387319683243] , [ 1199077200000 , 6.8829183612895] , [ 1201755600000 , 6.984133637885] , [ 1204261200000 , 7.0860136043287] , [ 1206936000000 , 4.3961787956053] , [ 1209528000000 , 3.8699674365231] , [ 1212206400000 , 3.6928925238305] , [ 1214798400000 , 6.7571718894253] , [ 1217476800000 , 6.4367313362344] , [ 1220155200000 , 6.4048441521454] , [ 1222747200000 , 5.4643833239669] , [ 1225425600000 , 5.3150786833374] , [ 1228021200000 , 5.3011272612576] , [ 1230699600000 , 4.1203601430809] , [ 1233378000000 , 4.0881783200525] , [ 1235797200000 , 4.1928665957189] , [ 1238472000000 , 7.0249415663205] , [ 1241064000000 , 7.006530880769] , [ 1243742400000 , 6.994835633224] , [ 1246334400000 , 6.1220222336254] , [ 1249012800000 , 6.1177436137653] , [ 1251691200000 , 6.1413396231981] , [ 1254283200000 , 4.8046006145874] , [ 1256961600000 , 4.6647600660544] , [ 1259557200000 , 4.544865006255] , [ 1262235600000 , 6.0488249316539] , [ 1264914000000 , 6.3188669540206] , [ 1267333200000 , 6.5873958262306] , [ 1270008000000 , 6.2281189839578] , [ 1272600000000 , 5.8948915746059] , [ 1275278400000 , 5.5967320482214] , [ 1277870400000 , 0.99784432084837] , [ 1280548800000 , 1.0950794175359] , [ 1283227200000 , 0.94479734407491] , [ 1285819200000 , 1.222093988688] , [ 1288497600000 , 1.335093106856] , [ 1291093200000 , 1.3302565104985] , [ 1293771600000 , 1.340824670897] , [ 1296450000000 , 0] , [ 1298869200000 , 0] , [ 1301544000000 , 0] , [ 1304136000000 , 0] , [ 1306814400000 , 0] , [ 1309406400000 , 0] , [ 1312084800000 , 0] , [ 1314763200000 , 0] , [ 1317355200000 , 4.4583692315] , [ 1320033600000 , 3.6493043348059] , [ 1322629200000 , 3.8610064091761] , [ 1325307600000 , 5.5144800685202] , [ 1327986000000 , 5.1750695220791] , [ 1330491600000 , 5.6710066952691] , [ 1333166400000 , 5.5611890039181] , [ 1335758400000 , 5.5979368839939]]
            }
        ]
         
        }
        
        $scope.doCreateRel = function() {
             //alert($scope.entity);
             $scope.entity[$scope.relfield]=$scope.recordid;
             $scope.entity['assigned_user_id']='19x6';
                coreBOSWSAPI.doCreate($scope.relmodule,$scope.entity).then(function(response) {
                         coreBOSWSAPI.doGetUi10RelatedRecords( $scope.recordid ,$scope.module,$scope.relmodule, $scope.fields).then(function(response) {
                         $scope.relRecordList =response.data.result.records;
                     });
                 });
         };
	// Click handler for the Save button. Saves the form to the back-end service.
	$scope.saveSignature = function saveSignature() {
		// Check for validity. AngularJS will set $valid == true if all form requirements are met.
		//if ( $scope.sigForm.$valid ) {
		
			var sigPadAPI = $('<div class="sig current" style="display: none;"><canvas class="pad" ng-mouseup="updateModel()" height="240" width="350" name="canvas_sign"></canvas></div>').signaturePad({
				displayOnly: true
			}); 
			// regenerate the signature onto the canvas
			sigPadAPI.regenerate($scope.helpdesk.signature);
			// convert the canvas to a PNG (Newer versions of Chrome, FF, and Safari only.)
			var firma = sigPadAPI.getSignatureImage().substring(22);
			
			var filename = $scope.helpdesk.ticket_no + '_Signature.png';
			
			var model_filename={
					name:filename,
					size:firma.length,
					type:'image/png',
					content:firma
			};
			
			var docData = {
				notes_title: 'Sign: ' + $scope.helpdesk.ticket_title,
				filename: model_filename,
				filetype: model_filename['type'],
				filesize: model_filename['size'],
				filelocationtype: 'I',
				filedownloadcount: 0,
				filestatus: 1,
				folderid: '22x1',
				relations: $scope.helpdesk.id,
			};
			
			coreBOSWSAPI.doCreate('Documents',docData).then(function(response) {
			});
		//}
	};
	// Clear the form fields and scope data
	$scope.clearData = function() {
		$scope.helpdesk = {
			signature: null,
		};
	};
	
	$scope.saveTicketComment = function() {
		coreBOSWSAPI.doAddTicketFaqComment($scope.helpdesk.id,$scope.helpdesk).then(function(response) {
			$scope.helpdesk.comments = null;
			
		});
	};

})
.controller('relationsCtrl',function($scope, $i18next,$routeParams,coreBOSWSAPI, coreBOSAPIStatus) {
	$scope.recordid = $routeParams.id;
        $scope.module=$routeParams.srcmodule;
        $scope.relmodule=$routeParams.rlmodule;
        $scope.relRecordList = [];
	
        coreBOSWSAPI.doGetRelatedRecords( $scope.recordid ,$scope.module,$scope.relmodule, "").then(function(response) {
                        $scope.relRecordList =response.data.result.records;
		});
        $scope.doCreate = function() {
             $scope.entity['related_to']=$scope.recordid;
             $scope.entity['sales_stage']='Negotiation/Review';
             $scope.srelresult=[];
                coreBOSWSAPI.doCreate($scope.module,$scope.entity).then(function(response) {
                         console.log('create:',response);
                         //$scope.srelresult=response;
                         
                         coreBOSWSAPI.doGetRelatedRecords( $scope.recordid ,$scope.module,$scope.relmodule, "").then(function(response) {
                         $scope.relRecordList =response.data.result.records;
                     });
                 });
         };
	$scope.sendgrelCall = function() {
		$scope.grelresult = "";
		var queryParameters = {};
		if (!angular.isUndefined($scope.rpdodisc)) queryParameters.productDiscriminator = $scope.rpdodisc;
		if (!angular.isUndefined($scope.glimit)) queryParameters.limit = $scope.glimit;
		if (!angular.isUndefined($scope.groffset)) queryParameters.offset = $scope.groffset;
		if (!angular.isUndefined($scope.gorder)) queryParameters.orderby = $scope.gorder;
		if (!angular.isUndefined($scope.gcols)) queryParameters.columns = $scope.gcols;
		coreBOSWSAPI.doGetRelatedRecords($scope.grelrecord,$scope.gparentmodule,$scope.grelmodule, queryParameters).then(function(response) {
			$scope.grelresult = response.data;
		});
	};
	$scope.sendsrelCall = function() {
		$scope.srelresult = "";
		coreBOSWSAPI.doSetRelated($scope.srelrecord,$scope.srelwith).then(function(response) {
			$scope.srelresult = response.data;
		});
	};
})
;
