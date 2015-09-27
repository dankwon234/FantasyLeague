var app = angular.module('AccountModule', []);

app.controller('AccountController', ['$scope', 'accountService', 'generalService', 'uploadService', 'RestService', function($scope, accountService, generalService, uploadService, RestService) {
	$scope['generalService'] = generalService;
	$scope.profile = null;
	$scope.credentials = {'email':'', 'password':'', 'name':'', 'isPublic':'no'};
	$scope.loading = false;
	$scope.group = {'title':'', 'password':''};

	
	$scope.init = function(){
		accountService.checkCurrentUser(function(response){
			if (response.confirmation == 'success')
				$scope.profile = response.profile;
			
		});
	}

	
	
	$scope.createGroup = function(){
		if ($scope.group.title.length == 0){
			alert('Please Enter a Group Title');
			return;
		}

		if ($scope.group.password.length == 0){
			alert('Please Enter a Group Password');
			return;
		}

		$scope.group['admin'] = $scope.profile.id;
		var fullName = $scope.profile.firstName+' '+$scope.profile.lastName;
		$scope.group['profiles'] = [{'id':$scope.profile.id, 'firstName':$scope.profile.firstName, 'lastName':$scope.profile.lastName, 'fullName':fullName}];

		console.log('CREATE GROUP: '+JSON.stringify($scope.group));
		RestService.post({resource:'group', id:null}, $scope.group, function(response) {
			console.log(JSON.stringify(response));
			if (response.confirmation != 'success'){
				alert(response.message);
				return;
			}

			window.location.href = '/site/group/'+response.group.id;
		});
	}


	
	$scope.login = function(){
		$scope.loading = true;
		accountService.login($scope.credentials, function(response, error){
			if (error != null){
				$scope.loading = false;
                alert(error.message);
				return;
			}
			
			window.location.href = '/site/account';
		});
	}
	
	
	
	
	

}]);
