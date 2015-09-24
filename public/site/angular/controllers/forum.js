var app = angular.module('ForumModule', []);

app.controller('ForumController', ['$scope', 'generalService', 'accountService', 'uploadService', 'RestService', function($scope, generalService, accountService, uploadService, RestService) {
	$scope['generalService'] = generalService;
	$scope.profile = null;
	$scope.credentials = {'email':'', 'password':'', 'name':''};
	$scope.post = {'text':'', 'title':'', 'link':''};
	$scope.recentPosts = {};
	$scope.loading = false;

	
	$scope.init = function(){
		console.log('Fourm Module: INIT');
		accountService.checkCurrentUser(function(response){
			if (response.confirmation == 'success')
				$scope.profile = response.profile;
			
			fetchRecentPosts();
		});
	}
	
	function fetchRecentPosts(){
		RestService.query({resource:'post', id:null, limit:'0'}, function(response){
			if (response.confirmation != 'success')
				return;
			
			var posts = response.posts;
			var all = [];
			var links = [];
			var originals = [];
			for (var i=0; i<posts.length; i++){
				var post = posts[i];
				all.push(post);
				if (post.link.length > 0){
					links.push(post);
					post['source'] = identifySource(post);
				}
				else{
					originals.push(post);
				}
			}
			
			$scope.recentPosts['all'] = all;
			$scope.recentPosts['links'] = links;
			$scope.recentPosts['originals'] = originals;
			console.log('RECENT POSTS == '+JSON.stringify($scope.recentPosts));
		});
	}
	
	
	function identifySource(post){
		var source = post.link;
		var parts = source.split('//');
		if (parts.length < 2)
			return ''; 
	
		var p = parts[1].split('/');
		return parts[0]+'//'+p[0];
	}
	
	$scope.openPost = function(post){
		if (post == null)
			return;
		
		if (post.link.length == 0){
			window.location.href = '/site/post/'+post.id;
			return;
		}
		
		var url = post.link;
		if (url.indexOf('http') == -1)
			url = 'http://'+url;
		
		window.open(url, '_blank');
	}
	
	
	$scope.submitPost = function(){
		if ($scope.profile == null){
			alert('Please log in to submit a post.');
			return;
		}
		
		var username = '';
		if ($scope.profile.username.length == 0)
			username = $scope.profile.firstName.substring(0, 1)+$scope.profile.lastName;
		else
			username = $scope.profile.username;
		
		$scope.post['profile'] = {'id':$scope.profile.id, 'username':username};
		RestService.post({resource:'post', id:null}, $scope.post, function(response){
			console.log('FORUM CONTROLLER == '+JSON.stringify(response));
			if (response.confirmation != 'success')
				return;
			
			var post = response.post;
			$scope.recentPosts.all.unshift(post);
			if (post.link.length > 0){
				post['source'] = identifySource(post);
				$scope.recentPosts.links.unshift(post);
			}
			else
				$scope.recentPosts.originals.unshift(post);
		});
	}
	
	
	$scope.viewAccount = function(){
		if ($scope.profile.id == null)
			return;
		
		window.location.href = '/site/account';
	}
	
	$scope.register = function(){
		$scope.loading = true;
		accountService.register($scope.profile, function(response, error){
			if (error != null){
				$scope.loading = false;
                alert(error.message);
				return;
			}
			
			window.location.href = '/site/forum';
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
			
			window.location.href = '/site/forum';
		});
	}


}]);
