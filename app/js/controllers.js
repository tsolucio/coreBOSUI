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
//        coreBOSWSAPI.doQuery('select * from PHBManager' ).then(function(response) {
//			$scope.result = response.data.result[0];
//                        less.modifyVars({
//                              '@color': $scope.result.menu_color
//        });
//		});
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
        coreBOSWSAPI.getRelatedActions($scope.module,'LISTVIEWPORTAL').then(function(response) {
			$scope.relatedactions=response.data.result;		
		});
          
        $routeParams.module=$routeParams.module.toLowerCase();
	coreBOSWSAPI.doQuery('select * from '+$routeParams.module).then(function(response) {
            $scope.moduleList = response.data.result;
//            if($scope.fields!='')
//            {
//                if($scope.fields.indexOf('patientvis')!='-1' ){
//                 angular.forEach($scope.moduleList, function(value, key) {
//                    coreBOSWSAPI.doQuery('select patientsname from patients where patientsid='+value.patientvis).then(function(response) {
//                        $scope.moduleList[key]['assigned_user_id']=response.data.result[0]['first_name']+' '+response.data.result[0]['last_name'];
//
//                    });
//                 });
//             }
//            }
        
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
        $scope.get_contact = function() {
		coreBOSWSAPI.doQuery('select * from vitals join patiens on pazientide=patientid where patientsname like %'+$scope.searchPat+'%').then(function(response) {
		$scope.moduleList = response.data.result;
		$scope.myPageItemsCount = response.data.result.length;
	});
	};
        if($scope.module=='Vitals'){ 
            less.modifyVars({
                              '@pageRightWidth': '60%',
                              '@pageLeftWidth': '37%'
        });
        } 
        else{
            less.modifyVars({
                              '@pageRightWidth': '27%',
                              '@pageLeftWidth': '70%'
        });
        }
    if($scope.module=='Vitals'){ 
    $scope.options = {
            chart: {
                type: 'multiBarChart',
                height: 450,
                margin : {
                    top: 20,
                    right: 20,
                    bottom: 60,
                    left: 45
                },
                clipEdge: true,
                staggerLabels: true,
                transitionDuration: 500,
                stacked: true,
                xAxis: {
                    axisLabel: 'Parametri Vitali',
                    tickFormat: function(d) {
                        var label = $scope.data[0].values[d][0];
                        return label ;
                    }
                },
                y1Axis: {
                    axisLabel: '',
                    tickFormat: function(d){return d3.format(',f')(d)}
                }
            }
        };
        
        var blood = [],colesterol=[],hdl=[],redglobules=[],whiteglobules=[],
                piastrin=[],glicemia=[],bloodpressdi=[];
        angular.forEach($scope.moduleList, function(value, key) {
                    blood.push([value.vitalsname,  value.bloodpressy]);
                    colesterol.push([value.vitalsname, value.colesterol]);
                    hdl.push([value.vitalsname, value.hdl]);
                    redglobules.push([value.vitalsname, value.redglobules]);
                    whiteglobules.push([value.vitalsname, value.whiteglobules]);
                    piastrin.push([value.vitalsname, value.piastrin]);
                    glicemia.push([value.vitalsname, value.glicemia]);
                    bloodpressdi.push([value.vitalsname, value.bloodpressdi]);
        });
        
        $scope.data = [
//            {
//                "key" : "Blood Pressure Systolic" ,
//                "values" :  blood 
//            },
            {
                "key" : "Colesterolo Totale" ,
                "values" :  colesterol 
            },
            {
                "key" : "Hdl" ,
                "values" :  hdl 
            },
            {
                "key" : "Globuli Rossi" ,
                "values" :  redglobules 
            },
            {
                "key" : "Globuli Bianchi" ,
                "values" :  whiteglobules 
            },
            {
                "key" : "Piastrine" ,
                "values" :  piastrin 
            },
            {
                "key" : "Glicemia" ,
                "values" :  glicemia 
            }
//            ,{
//                "key" : "Blood Pressure Diastolic" ,
//                "values" : bloodpressdi 
//            }
        ];
    }//for Vitals ListView
        
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
                $scope.indexFields = response.data.result.indexFields;
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
                                    if ($scope.modulefields[i]['name']!='id') {
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
                                    }
                                };
				flds.push(cols);
				$scope.modulefieldList = flds;
				$scope.moduleData = moduleData;
                        }
                        else
                        {
//                            var flds = [], cols = [], ui10 = [];
//			coreBOSWSAPI.doRetrieve($routeParams.id).then(function(response) {
//				angular.forEach(response.data.result, function(value, key) {
//					var found = $filter('getArrayElementById')($scope.modulefields, key, 'name');
//                                        if(found.uitype=='10'){
//                                            coreBOSWSAPI.getReferenceValue(value).then(function(response) {
//                                                var t=response.data.result[value];
//                                                ui10[key]=t['reference'];//alert(t['reference']);
//                                            });
//                                        }
//                                });
//                            });
                       coreBOSWSAPI.doRetrieve($routeParams.id).then(function(response) {
				var flds = [], cols = [];
				var moduleData = {};
				var numcols = 3;
				var lblclass = 'col-md-2', vlclass = 'col-md-2';
				angular.forEach(response.data.result, function(value, key) {
					if (key!='id') {
                                            var found = $filter('getArrayElementById')($scope.modulefields, key, 'name');
					if (key==$scope.labelFields) {
						$scope.accountname = value;
					}
                                        
//                                        if(found.uitype=='10'){//alert(key+' '+value);
//                                            value=ui10[key];
//                                            //alert(value);
//                                        }
                                        var id10='';
//                                        if(found.uitype=='10'){
//                                            id10=value['id10'];
//                                            value=value['v10'];
////                                            coreBOSWSAPI.getReferenceValue(value).then(function(response) {
////                                                var t=response.data.result[value];
////                                                value=t;//alert(t['reference']);
////                                            });
//                                        }
					var fld = {
						label:found.label,
						labelclass:lblclass,
						field:key,
						val: value == '' ? 'none' : value,
						val10:id10,
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
                                    }
                                });
				flds.push(cols);
				$scope.modulefieldList = flds;
				$scope.moduleData = moduleData;
			});
                }
            if($scope.module=='Vitals'){
                    $scope.bloodpresure=$scope.moduleData['bloodpresure'];
                    $scope.oxygensat=$scope.moduleData['oxygensat'];
                    $scope.weight=$scope.moduleData['weight'];
                    $scope.bloodpressdi=$scope.moduleData['bloodpressdi'];
            }
        
		}
	});
        $scope.relmodule=$scope.module;
        $scope.relRecordList = [];
	
        $scope.showRel = function(relmod,relfield){
            if(relmod!=$scope.module){
            
            coreBOSWSAPI.getFilterFields(relmod).then(function(response) {
			$scope.fields=response.data.result.fields;
                        $scope.linkfields=response.data.result.linkfields;
               		scope.fieldlabels = response.data.result.fieldlabels;         
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
                    $scope.pulse=response.data.result.vitals[6];
                    $scope.issues=response.data.result.issues;
            });
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
