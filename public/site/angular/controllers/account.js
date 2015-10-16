var accountCtr = angular.module('AccountModule', []);

accountCtr.controller('AccountController', ['$scope', 'accountService', 'generalService', 'uploadService', 'RestService', function($scope, accountService, generalService, uploadService, RestService) {
	$scope['generalService'] = generalService;
	$scope.profile = null;
	$scope.credentials = {'email':'', 'password':'', 'name':'', 'isPublic':'no'};
	$scope.loading = false;
	$scope.group = {'title':'', 'password':''};
	$scope.currentSection = 'account';

	
	$scope.init = function(){
		accountService.checkCurrentUser(function(response){
			if (response.confirmation == 'success')
				$scope.profile = response.profile;

			fetchProfileGroups();
			
		});
	}

	function fetchProfileGroups(){
		RestService.query({resource:'group', id:null, 'profiles.id':$scope.profile.id}, function(response) {
			if (response.confirmation != 'success')
				return;
			
			$scope.profile['groups'] = response.groups;
			fetchProfileInvitations();
		});
	}

	function fetchProfileInvitations(){
		RestService.query({resource:'group', id:null, 'invited.email':$scope.profile.email}, function(response) {
			if (response.confirmation != 'success')
				return;
			
			$scope.profile['invited'] = response.groups;
		});
	}

	$scope.joinGroup = function(group){
		var fullName = $scope.profile.firstName+' '+$scope.profile.lastName;
		var profileEntry = {'id':$scope.profile.id, 'email':$scope.profile.email, 'firstName':$scope.profile.firstName, 'lastName':$scope.profile.lastName, 'fullName':fullName};
		if ($scope.profile.phone.length > 0)
			profileEntry['phoneNumber'] = $scope.profile.phone;

		group.profiles.push(profileEntry);
		var updated = [];
		for (var i=0; i<group.invited.length; i++){
			var invitee = group.invited[i];
			console.log('INVITEE: '+JSON.stringify(invitee.name));
			if (invitee.email == $scope.profile.email)
				continue;

			else if (invitee.phone.length>0 && invitee.phone == $scope.profile.phone)
				continue;

			else
				updated.push(invitee);
		}

		group['invited'] = updated;

		var index = $scope.profile.invited.indexOf(group);
		if (index != -1)
			$scope.profile.invited.splice(index, 1);
		

		console.log('JOIN GROUP: '+JSON.stringify(group));
		$scope.loading = true;
		RestService.put({resource:'group', id:group.id}, group, function(response) {
		$scope.loading = false;
			console.log(JSON.stringify(response));
			if (response.confirmation != 'success'){
				alert(response.message);
				return;
			}

			window.location.href = '/site/group/'+response.group.id;
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
		var profileEntry = {'id':$scope.profile.id, 'email':$scope.profile.email, 'firstName':$scope.profile.firstName, 'lastName':$scope.profile.lastName, 'fullName':fullName};
		if ($scope.profile.phone.length > 0)
			profileEntry['phoneNumber'] = $scope.profile.phone;

		$scope.group['profiles'] = [profileEntry];

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

	$scope.onFileSelect = function(files, property, media){
		$scope.loading = true;
		uploadService.uploadFiles({'files':files, 'media':media}, function(response, error){
			$scope.loading = false;
			
			if (error != null){
				alert(error.message);
				return;
			}
			
			var image = response.image;
			$scope.profile['image'] = image.id;
			$scope.updateProfile(false);
		});
	}
	
	$scope.updateProfile = function(showAlert){
		accountService.updateProfile($scope.profile, function(response, error){
			if (error != null){
				$scope.loading = false;
                alert(error.message);
				return;
			}
			
			$scope.profile = response.profile;
			if (showAlert == false)
				return;

			alert('Profile Updated');
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
