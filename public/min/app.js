var modules=["HomeModule","AccountModule","GroupModule","ContestModule","NFLPlayersModule","GeneralServiceModule","RestServiceModule","UploadServiceModule","AccountServiceModule"],app=angular.module("TheVig",modules,["$interpolateProvider",function(a){a.startSymbol("<%"),a.endSymbol("%>")}]);app.directive("spinner",function(){return{restrict:"A",replace:!0,scope:{startSpinner:"=spin"},template:"<div></div>",link:function(a,b,c){var d={lines:13,length:20,width:10,radius:30,corners:1,rotate:0,direction:1,color:"#fff",speed:1,trail:60,shadow:!1,hwaccel:!1,className:"spinner",zIndex:2e9},e=new Spinner(d);a.$watch("startSpinner",function(a){a?e.spin(b[0]):e.stop()})}}}),app.directive("knob",function(){return{restrict:"A",replace:!1,scope:{knobValue:"=time"},link:function(a,b,c){a.$watch("knobValue",function(a){b.knob({format:function(a){return a+" min"}}),b.val(a).trigger("change")})}}});var accountService=angular.module("AccountServiceModule",["RestServiceModule"]);accountService.factory("accountService",["RestService",function(a){function b(a,b){var c=document.getElementById(b);c.style.border=a[b].length>0?"none":"1px solid red"}function c(a){var b=/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;return b.test(a)}var d={};return d.checkCurrentUser=function(b){a.get({resource:"currentuser",id:null},function(a){console.log("ACCOUNT SERVICE RESPONSE == "+JSON.stringify(a)),null!=b&&b(a)})},d.register=function(d,e){for(var f=[{firstName:"First Name"},{lastName:"Last Name"},{email:"Email"}],g=null,h=0;h<f.length;h++){var i=f[h],j=Object.keys(i)[0];if(0==d[j].length){b(d,j),g=i[j];break}}return null!=g?void(null!=e&&e(null,{message:"Missing "+g})):0==c(d.email)?void(null!=e&&e(null,{message:"Invalid Email"})):void a.post({resource:"profile",id:null},d,function(a){return console.log("ACCOUNT SERVICE RESPONSE == "+JSON.stringify(a)),"success"!=a.confirmation?void(null!=e&&e(null,{message:a.message})):void(null!=e&&e(a,null))})},d.updateProfile=function(b,c){a.update({resource:"profile",id:b.id},b,function(a){return console.log("ACCOUNT SERVICE RESPONSE == "+JSON.stringify(a)),"success"!=a.confirmation?void(null!=c&&c(null,{message:a.message})):void(null!=c&&c(a,null))})},d.login=function(b,d){return 0==b.email.length?void alert("Please enter your email"):0==b.password.length?void alert("Please enter your password"):0==c(b.email)?void alert("Please enter a valid email"):void a.post({resource:"login",id:null},b,function(a){return console.log("ACCOUNT SERVICE RESPONSE == "+JSON.stringify(a)),"success"!=a.confirmation?void(null!=d&&d(null,{message:a.message})):void(null!=d&&d(a,null))})},d}]);var generalService=angular.module("GeneralServiceModule",[]);generalService.factory("generalService",[function(){var a={};return a.truncatedText=function(a,b){return a.length<b?a:a.substring(0,b)+"..."},a.capitalize=function(a){if(null!=a){for(var b=a.split(" "),c="",d=0;d<b.length;d++){var e=b[d];e.length<=1?c=c+" "+e.toUpperCase():(e=e.charAt(0).toUpperCase()+e.slice(1),c=c+" "+e)}return c=c.trim()}},a.formattedNumber=function(a){return null!=a?a.toString().replace(/\B(?=(\d{3})+(?!\d))/g,","):void 0},a.formattedDate=function(a){var b=moment(new Date(a)).format("MMM D, YYYY");return b},a.validateEmail=function(a){var b=/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;return b.test(a)},a.convertToLinks=function(a){var b;return b=/(\b(https?):\/\/[-A-Z0-9+&amp;@#\/%?=~_|!:,.;]*[-A-Z0-9+&amp;@#\/%=~_|])/gi,replacedText=a.replace(b,'<a class="colored-link-1" title="$1" href="$1" target="_blank">$1</a>'),replacePattern2=/(^|[^\/])(www\.[\S]+(\b|$))/gim,replacedText=replacedText.replace(replacePattern2,'$1<a class="colored-link-1" href="http://$2" target="_blank">$2</a>'),replacedText},a.parseLocation=function(a){var b=location.href.replace(window.location.origin,""),c={page:null,identifier:null,params:{}},d=b.split("?");if(d.length>1){for(var e=d[1],f=e.split("&"),g={},h=0;h<f.length;h++){var i=f[h].split("=");i.length<1||(g[i[0]]=i[1])}c.params=g}b=d[0];var j=b.split(a+"/");if(j.length>1)for(var k=j[1].split("/"),h=0;h<k.length;h++)0==h&&(c.page=k[h]),1==h&&(c.identifier=k[h]);return c},a}]);var restService=angular.module("RestServiceModule",["ngResource"]);restService.factory("RestService",["$resource",function(a){return a("/api/:resource/:id",{},{query:{method:"GET",params:{},isArray:!1},get:{method:"GET"},post:{method:"POST"},put:{method:"PUT"},update:{method:"PUT"}})}]);var uploadService=angular.module("UploadServiceModule",["angularFileUpload"]);uploadService.factory("uploadService",["$http","$upload",function(a,b){function c(a,c,d,e){for(var f=0;f<a.length;f++){var g=a[f];b.upload({url:c,method:"POST",file:g}).progress(function(a){console.log("percent: "+parseInt(100*a.loaded/a.total))}).success(function(a,b,c,d){var f=a.confirmation;return"success"!=f?void(null!=e&&e(null,{message:a.message})):void(null!=e&&e(a,null))})}}var d={};return d.uploadFiles=function(b,d){console.log("UPLOAD SERVICE: Upload "+b.files.length+" Files - "+JSON.stringify(b));var e="https://media-service.appspot.com/api/upload?media="+b.media;a.get(e).success(function(a,e,f,g){return console.log("DATA : "+JSON.stringify(a)),"success"!=a.confirmation?void(null!=d&&d(null,{message:a.message})):void c(b.files,a.upload,b.media,d)}).error(function(a,b,c,e){console.log("error",a,b,c,e),null!=d&&d(null,{message:a})})},d}]);var accountCtr=angular.module("AccountModule",[]);accountCtr.controller("AccountController",["$scope","accountService","generalService","uploadService","RestService",function(a,b,c,d,e){function f(){e.query({resource:"group",id:null,"profiles.id":a.profile.id},function(b){"success"==b.confirmation&&(a.profile.groups=b.groups,g())})}function g(){e.query({resource:"group",id:null,"invited.email":a.profile.email},function(b){"success"==b.confirmation&&(a.profile.invited=b.groups)})}a.generalService=c,a.profile=null,a.credentials={email:"",password:"",name:"",isPublic:"no"},a.loading=!1,a.group={title:"",password:""},a.currentSection="account",a.init=function(){b.checkCurrentUser(function(b){"success"==b.confirmation&&(a.profile=b.profile),f()})},a.joinGroup=function(b){var c=a.profile.firstName+" "+a.profile.lastName,d={id:a.profile.id,email:a.profile.email,firstName:a.profile.firstName,lastName:a.profile.lastName,fullName:c};a.profile.phone.length>0&&(d.phoneNumber=a.profile.phone),b.profiles.push(d);for(var f=[],g=0;g<b.invited.length;g++){var h=b.invited[g];console.log("INVITEE: "+JSON.stringify(h.name)),h.email!=a.profile.email&&(h.phone.length>0&&h.phone==a.profile.phone||f.push(h))}b.invited=f;var i=a.profile.invited.indexOf(b);-1!=i&&a.profile.invited.splice(i,1),console.log("JOIN GROUP: "+JSON.stringify(b)),a.loading=!0,e.put({resource:"group",id:b.id},b,function(b){return a.loading=!1,console.log(JSON.stringify(b)),"success"!=b.confirmation?void alert(b.message):void(window.location.href="/site/group/"+b.group.id)})},a.createGroup=function(){if(0==a.group.title.length)return void alert("Please Enter a Group Title");if(0==a.group.password.length)return void alert("Please Enter a Group Password");a.group.admin=a.profile.id;var b=a.profile.firstName+" "+a.profile.lastName,c={id:a.profile.id,email:a.profile.email,firstName:a.profile.firstName,lastName:a.profile.lastName,fullName:b};a.profile.phone.length>0&&(c.phoneNumber=a.profile.phone),a.group.profiles=[c],console.log("CREATE GROUP: "+JSON.stringify(a.group)),e.post({resource:"group",id:null},a.group,function(a){return console.log(JSON.stringify(a)),"success"!=a.confirmation?void alert(a.message):void(window.location.href="/site/group/"+a.group.id)})},a.onFileSelect=function(b,c,e){a.loading=!0,d.uploadFiles({files:b,media:e},function(b,c){if(a.loading=!1,null!=c)return void alert(c.message);var d=b.image;a.profile.image=d.id,a.updateProfile(!1)})},a.updateProfile=function(c){b.updateProfile(a.profile,function(b,d){return null!=d?(a.loading=!1,void alert(d.message)):(a.profile=b.profile,void(0!=c&&alert("Profile Updated")))})},a.login=function(){a.loading=!0,b.login(a.credentials,function(b,c){return null!=c?(a.loading=!1,void alert(c.message)):void(window.location.href="/site/account")})}}]);var contestCtr=angular.module("ContestModule",[]);contestCtr.controller("ContestController",["$scope","accountService","generalService","uploadService","RestService",function(a,b,c,d,e){function f(b){e.query({resource:"contest",id:b},function(b){return console.log(JSON.stringify(b)),"success"!=b.confirmation?void alert(b.message):(a.contest=b.contest,void g())})}function g(){var b=Object.keys(a.profiles);b.length!=a.contest.participants.length&&e.query({resource:"profile",id:a.contest.participants[b.length]},function(b){return"success"!=b.confirmation?void alert(b.message):(a.profiles[b.profile.id]=b.profile,g(),void console.log(JSON.stringify(a.profiles)))})}a.generalService=c,a.profile=null,a.credentials={email:"",password:"",name:"",isPublic:"no"},a.loading=!1,a.group=null,a.contest=null,a.profiles={},a.currentWeek=null,a.init=function(){b.checkCurrentUser(function(b){"success"==b.confirmation&&(a.profile=b.profile),e.query({resource:"weeklysummary",id:null,limit:"1"},function(b){if("success"!=b.confirmation)return void alert(b.message);a.currentWeek=b["weekly summaries"][0];for(var c=a.currentWeek.games,d=Object.keys(c),e=[],g=(new Date,0);g<d.length;g++){var h=c[d[g]];new Date(h.Date);e.push(h)}e.sort(function(a,b){return new Date(b.Date)-new Date(a.Date)}),a.currentWeek.upcomingGames=e;var i=a.generalService.parseLocation("site");return null==i.identifier?void alert("Error"):(a.currentSection=i.params.section?i.params.section:"summary",void f(i.identifier))})})},a.login=function(){a.loading=!0,b.login(a.credentials,function(b,c){return null!=c?(a.loading=!1,void alert(c.message)):void(window.location.href="/site/account")})}}]);var groupCtr=angular.module("GroupModule",[]);groupCtr.controller("GroupController",["$scope","accountService","generalService","uploadService","RestService",function(a,b,c,d,e){function f(b){e.query({resource:"group",id:b},function(b){return console.log(JSON.stringify(b)),"success"!=b.confirmation?void alert(b.message):(a.group=b.group,void g())})}function g(){e.query({resource:"contest",id:null,group:a.group.id},function(b){if(console.log(JSON.stringify(b)),"success"!=b.confirmation)return void alert(b.message);for(var c={closed:[],notclosed:[]},d=0;d<b.contests.length;d++){var e=b.contests[d];"closed"==e.state?c.closed.push(e):c.notclosed.push(e)}a.group.contests=c,h()})}function h(){for(var b=a.group.rosters[a.profile.id].roster,c=0;c<b.length;c++){var d=b[c];e.query({resource:"nflplayer",id:null,fantasyPlayerKey:d},function(c){if("success"!=c.confirmation)return void alert(c.message);var d=c.players[0];a.players[d.fantasyPlayerKey]=d;var e=Object.keys(a.players);e.length==b.length&&i()})}}function i(){for(var b=Object.keys(a.players),c=0;c<b.length;c++){var d=a.players[b[c]];a.salaryCap-=d.value}console.log("SALARY CAP: "+a.salaryCap)}function j(){var b={};b.profile=a.profile.id,b.score="0";var c=a.group.rosters[a.profile.id];if(null==c)return void alert("Please draft at least one player before entering this contest.");for(var d=c.roster,e=[],f=0;f<d.length;f++){var g=d[f],h=a.players[g];-1!=a.contest.eligibleTeams.indexOf(h.team.toLowerCase())&&(console.log("PLAYER: "+JSON.stringify(h)),e.push(g))}return b.lineup=e,b}a.generalService=c,a.profile=null,a.credentials={email:"",password:"",name:"",isPublic:"no"},a.loading=!1,a.group=null,a.currentSection="matchups",a.invitee={name:"",email:"",phone:""},a.players={},a.contestDescription="No Prize",a.currentWeek=null,a.salaryCap=5e4,a.contest={creator:"",group:"",season:"",week:"",title:"",state:"open",entries:[],participants:[],eligibleTeams:[],payouts:[],minEntries:5,buyIn:0},a.init=function(){b.checkCurrentUser(function(b){"success"==b.confirmation&&(a.profile=b.profile),e.query({resource:"weeklysummary",id:null,limit:"1"},function(b){if("success"!=b.confirmation)return void alert(b.message);a.currentWeek=b["weekly summaries"][0];for(var c=a.currentWeek.games,d=Object.keys(c),e=[],g=(new Date,0);g<d.length;g++){var h=c[d[g]];new Date(h.Date);a.contest.eligibleTeams.push(h.HomeTeam.toLowerCase()),a.contest.eligibleTeams.push(h.AwayTeam.toLowerCase()),e.push(h)}e.sort(function(a,b){return new Date(b.Date)-new Date(a.Date)}),a.currentWeek.upcomingGames=e;var i=a.generalService.parseLocation("site");return null==i.identifier?void alert("Error"):void f(i.identifier)})})},a.invite=function(){if(0==a.invitee.name.length)return void alert("Please enter a name.");if(0==a.invitee.email.length)return void alert("Please enter an email or phone number.");var b=a.invitee.email;0==a.generalService.validateEmail(b)&&(a.invitee.phone=b,a.invitee.email="");var c=a.invitee.name.split(" ");a.invitee.firstName=c[0],c.length>1&&(a.invitee.lastName=c[c.length-1]),console.log("INVTE: "+JSON.stringify(a.invitee));var d={group:a.group.id,invited:[a.invitee]};e.put({resource:"invite",id:a.group.id},d,function(b){return console.log(JSON.stringify(b)),"success"!=b.confirmation?void alert(b.message):(a.group.invited=b.group.invited,a.invitee={name:"",email:"",phone:""},alert("Invitation Sent!"),void document.getElementById("inviteButton").click())})},a.createContest=function(){a.contest.participants=[a.profile.id],a.contest.group=a.group.id,a.contest.creator=a.profile.id,a.contest.week=a.currentWeek.week,a.contest.season=a.currentWeek.season;var b=a.currentWeek.upcomingGames[0];a.contest.expires=b.Date;var c=j();a.contest.entries.push(c),e.post({resource:"contest",id:null},a.contest,function(b){return console.log(JSON.stringify(b)),"success"!=b.confirmation?void alert(b.message):(console.log("CONTEST CREATED: "+JSON.stringify(b)),void a.group.contests.notclosed.push(b.contest))})},a.joinContest=function(b){b.participants.push(a.profile.id);var c=j();b.entries.push(c),e.put({resource:"contest",id:b.id},b,function(a){return console.log(JSON.stringify(a)),"success"!=a.confirmation?void alert(a.message):void console.log("JOIN CONTEST: "+JSON.stringify(b))})},a.updateContestDescription=function(){if(0==a.contest.buyIn)return void(a.contestDescription="No Prize");var b=a.contest.buyIn*a.contest.minEntries;if(a.contest.minEntries<5)return a.contest.payouts=[b],void(a.contestDescription="First Place: $"+b+".");var c=2*a.contest.buyIn,d=b-c;a.contestDescription="First Place: $"+d+". Second Place: $"+c,a.contest.payouts=[d,c],console.log("updateContestDescription: "+JSON.stringify(a.contest))},a.login=function(){a.loading=!0,b.login(a.credentials,function(b,c){return null!=c?(a.loading=!1,void alert(c.message)):void(window.location.href="/site/account")})}}]);var homeCtr=angular.module("HomeModule",[]);homeCtr.controller("HomeController",["$scope","accountService","generalService","uploadService","RestService",function(a,b,c,d,e){a.generalService=c,a.profile=null,a.credentials={email:"",password:"",name:""},a.loading=!1,a.init=function(){b.checkCurrentUser(function(b){"success"==b.confirmation&&(a.profile=b.profile)})},a.viewAccount=function(){null!=a.profile.id&&(window.location.href="/site/account")},a.register=function(){a.loading=!0;var c=a.credentials.name.split(" ");a.credentials.firstName=c[0],c.length>1&&(a.credentials.lastName=c[c.length-1]),b.register(a.credentials,function(b,c){return null!=c?(a.loading=!1,void alert(c.message)):void(window.location.href="/site/account")})},a.login=function(){a.loading=!0,b.login(a.credentials,function(b,c){return null!=c?(a.loading=!1,void alert(c.message)):void(window.location.href="/site/account")})}}]);var nflPlayersCtr=angular.module("NFLPlayersModule",[]);nflPlayersCtr.controller("NFLPlayersController",["$scope","accountService","generalService","uploadService","RestService",function(a,b,c,d,e){function f(){a.pages=[];for(var b=0;b<a.playerMap[a.playerSource].length;b++)20>b&&a.visiblePlayers.push(a.playerMap[a.playerSource][b]),b%20==0&&a.pages.push(b/20+1)}function g(b){e.query({resource:"group",id:b},function(b){console.log(JSON.stringify(b)),"success"==b.confirmation&&(a.group=b.group,null==a.group.rosters[a.profile.id]?a.group.rosters[a.profile.id]={roster:[],profile:{id:a.profile.id,firstName:a.profile.firstName,lastName:a.profile.lastName,username:a.profile.username}}:h())})}function h(){for(var b=a.group.rosters[a.profile.id].roster,c=0;c<b.length;c++){var d=a.playerMap[b[c]];a.salaryCap-=d.value}}function i(){var b=a.group.rosters[a.profile.id];e.put({resource:"updateroster",id:a.group.id},{roster:b},function(a){console.log(JSON.stringify(a)),"success"!=a.confirmation})}a.generalService=c,a.profile=null,a.credentials={email:"",password:"",name:""},a.loading=!1,a.playerMap={all:[],qb:[],rb:[],wr:[],te:[]},a.visiblePlayers=[],a.playerSource="all",a.pages=[],a.group=null,a.salaryCap=5e4,a.init=function(){b.checkCurrentUser(function(b){"success"==b.confirmation&&(a.profile=b.profile),e.query({resource:"nflplayer",id:null},function(b){if("success"==b.confirmation){for(var c=0;c<b.players.length;c++){var d=b.players[c];if(0!=d.value){d.index=c,a.playerMap.all.push(d),a.playerMap[d.fantasyPlayerKey]=d;var e=a.playerMap[d.position];null!=e&&a.playerMap[d.position].push(d)}}if(f(),null!=a.profile){var h=a.generalService.parseLocation("site");null!=h.params&&null!=h.params.group&&g(h.params.group)}}})})},a.setPlayerSource=function(b){console.log("SET PLAYER SOURCE: "+b),a.playerSource=b,f(),a.loadPlayers(0)},a.loadPlayers=function(b){console.log("LOAD PLAYERS");var c=20*b,d=c+20;d>=a.playerMap[a.playerSource].length&&(d=a.playerMap[a.playerSource].length),a.visiblePlayers=[];for(var e=c;d>e;e++)a.visiblePlayers.push(a.playerMap[a.playerSource][e])},a.addPlayer=function(b){var c=a.group.rosters[a.profile.id].roster.indexOf(b.fantasyPlayerKey);if(-1==c){if(b.value>a.salaryCap)return void alert("No Cap Space. Please drop a player first.");a.salaryCap-=b.value,a.group.rosters[a.profile.id].roster.push(b.fantasyPlayerKey);a.group.rosters[a.profile.id];i()}},a.dropPlayer=function(b){console.log("DROP PLAYER: "+JSON.stringify(b));var c=a.group.rosters[a.profile.id].roster.indexOf(b.fantasyPlayerKey);-1!=c&&(a.salaryCap+=b.value,a.group.rosters[a.profile.id].roster.splice(c,1),i())},a.login=function(){a.loading=!0,b.login(a.credentials,function(b,c){return null!=c?(a.loading=!1,void alert(c.message)):void(window.location.href="/site/account")})}}]);