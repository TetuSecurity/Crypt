var app = angular.module('Crypt', ['ngRoute']);

app.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/', {
		controller: 'PageCtrl',
		templateUrl: 'views/main.html'
	})
	.otherwise({
		templateUrl: 'views/404.html'
	});
}]);
