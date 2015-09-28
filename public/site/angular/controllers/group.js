var app = angular.module('GroupModule', []);

app.controller('GroupController', ['$scope', 'accountService', 'generalService', 'uploadService', 'RestService', function($scope, accountService, generalService, uploadService, RestService) {
	$scope['generalService'] = generalService;
	$scope.profile = null;
	$scope.credentials = {'email':'', 'password':'', 'name':'', 'isPublic':'no'};
	$scope.loading = false;
	$scope.group = null;
	$scope.currentSection = 'matchups';
	$scope.invitee = {'name':'', 'email':'', 'phone':''};

	
	$scope.init = function(){
		accountService.checkCurrentUser(function(response){
			if (response.confirmation == 'success')
				$scope.profile = response.profile;

			// fetch group:
			var requestInfo = $scope.generalService.parseLocation('site');
			if (requestInfo.identifier == null){
				alert('Error');
				return;
			}

			RestService.query({resource:'group', id:requestInfo.identifier}, function(response) {
				console.log(JSON.stringify(response));
				if (response.confirmation != 'success'){
					alert(response.message);
					return;
				}

				$scope.group = response.group;
			});

			
		});
	}

	$scope.invite = function(){
		if ($scope.invitee.name.length == 0){
			alert('Please enter a name.');
			return;
		}

		if ($scope.invitee.email.length == 0){
			alert('Please enter an email or phone number.');
			return;
		}

		var email = $scope.invitee.email;
		if ($scope.generalService.validateEmail(email) == false){
			$scope.invitee['phone'] = email; // this is actually a phone number
			$scope.invitee['email'] = '';
		}

		var parts = $scope.invitee.name.split(' ');
		$scope.invitee['firstName'] = parts[0];
		if (parts.length > 1)
			$scope.invitee['lastName'] = parts[parts.length-1];


		console.log('INVTE: '+JSON.stringify($scope.invitee));
		var params = {'group':$scope.group.id, 'invited':[$scope.invitee]};

		RestService.put({resource:'invite', id:$scope.group.id}, params, function(response) {
			console.log(JSON.stringify(response));
			if (response.confirmation != 'success'){
				alert(response.message);
				return;
			}

			$scope.group['invited'] = response.group.invited;
			$scope.invitee = {'name':'', 'email':'', 'phone':''};
			alert('Invitation Sent!');
			document.getElementById('inviteButton').click();
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
