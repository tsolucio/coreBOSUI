'use strict';

angular.module('coreBOSJSTickets',
	[ 'ngRoute', 'coreBOSJSTickets.setup', 'ngSanitize', 'coreBOSJSTickets.filters', 'coreBOSAPIservice',
		'coreBOSJSTickets.directives', 'coreBOSJSTickets.controllers', 'angular-md5', 'xeditable','ui.bootstrap',
		'jm.i18next', 'trNgGrid', 'ngTable','nvd3'])
	.config([ '$routeProvider', function($routeProvider) {
		$routeProvider.when('/currentorder/:id', {
			templateUrl : 'partials/currentorderview.html',
			controller : 'orderviewCtrl'
		});
		$routeProvider.when('/neworder', {
			templateUrl : 'partials/neworder.html',
			controller : 'neworderCtrl'
		});
		$routeProvider.when('/currentorder', {
			templateUrl : 'partials/currentorder.html',
			controller : 'currentorderCtrl'
		});
		$routeProvider.when('/helpdesk/:id', {
			templateUrl : 'partials/helpdeskview.html',
			controller : 'helpdeskviewCtrl'
		});
		$routeProvider.when('/helpdesk', {
			templateUrl : 'partials/helpdesk.html',
			controller : 'helpdeskCtrl'
		});
		$routeProvider.when('/myaccount', {
			templateUrl : 'partials/myaccount.html',
			controller : 'myaccountCtrl'
		});
		$routeProvider.when('/emailus', {
			templateUrl : 'partials/emailus.html',
			controller : 'emailusCtrl'
		});
		$routeProvider.when('/config', {
			templateUrl : 'partials/config.html',
			controller : 'configCtrl'
		});
		$routeProvider.when('/referral', {
			templateUrl : 'partials/referral.html',
			controller : 'referralCtrl'
		});
		$routeProvider.when('/termsc', {
			templateUrl : 'partials/termsc.html',
			controller : 'termscCtrl'
		});
		$routeProvider.when('/logout', {
			templateUrl : 'partials/login.html',
			controller : 'logoutCtrl'
		});
		$routeProvider.when('/login', {
			templateUrl : 'partials/login.html',
			controller : 'loginCtrl'
		});
		$routeProvider.when('/timecontrol', {
			templateUrl : 'partials/timecontrol.html',
			controller : 'timecontrolCtrl'
		});
                $routeProvider.when('/cid_module/:module/:moduleLabel', {
			templateUrl : 'partials/cid_module.html',
			controller : 'moduleCtrl'
		});
                $routeProvider.when('/cid_moduleview/:module/:id', {
			templateUrl : 'partials/cid_moduleview.html',
			controller : 'moduleViewCtrl'
		});
                $routeProvider.when('/cid_relatedList/:srcmodule/:relmodule/:id', {
			templateUrl : 'partials/cid_relatedList.html',
			controller : 'relationsCtrl'
		});
		$routeProvider.otherwise({
			redirectTo : '/cid_module/Anamnesis/Anamnesis'
		});
	}
	])
	.config(['Setup','$i18nextProvider', function (Setup, $i18nextProvider) {
	$i18nextProvider.options = {
		lng: Setup.language,
		useCookie: true,
		useLocalStorage: false,
		fallbackLng: 'en',
		resGetPath: 'locales/__lng__/translation.json',
		defaultLoadingValue: '' // ng-i18next option, *NOT* directly supported by i18next
	};
	}])
	.run(function (Setup, $rootScope, coreBOSAPIStatus, coreBOSWSAPI, $location, $window) {
		$rootScope.$on('$routeChangeStart', function (ev, next, curr) {
		  $rootScope.menuShow = true;
		  if (next.$$route) {
			if (coreBOSAPIStatus.hasInvalidKeys()) {
				$location.path('/login');
				$rootScope.location = $location;
			}
			else
			{
				if ($window.innerWidth < 768)
				{
					$rootScope.menuShow = false;
				}
			}
		  }
		});
		var trgesTranslation = {
			"Search": "Buscar",
			"Page":"Página",
			"First Page": "Primera",
			"Next Page": "Siguiente",
			"Previous Page": "Anterior",
			"Last Page": "Ultima",
			"Sort": "Ordenar",
			"No items to display": "No hay registros",
			"displayed": "mostrados",
			"in total": "en total"
		};
		TrNgGrid.translations['es'] = trgesTranslation;
	})
	.run(function(editableOptions) {
		editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
	})
;
