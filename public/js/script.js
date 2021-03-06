var UserName, score, latestScore,player,userTeam, customTeam,avatar, teamName, newScore;


$(".login").on("click", function(){
	$("#signinModal").modal('toggle');

})
$(".signup").on("click", function(){
	$("#signupModal").modal('toggle');
})

$(".btnLogin").on("click", function(){
	if ($(".name").val() == "" || $(".password").val() == ""){
	}else{
		UserName = $(".name").val();
		localStorage.setItem('UserName', UserName);
	}
})


$(".btnsignup").on("click", function(){
	UserName = $(".signUpName").val();
	alert(UserName);
	localStorage.setItem('UserName', UserName);
	window.location.href= "/dashboard.html"
})


$.get("/api/players", function(data){
	for (var i =0; i< data.length; i++){		
		createNewPlayer(data[i]);
		$(".players").append(player);
	}
});

//enabling popover messages to use html tags inside them
function dashboard(){
	$(document).ready(function(){
		$('[data-toggle="popover"]').popover({html:true}); 
	});
	setTimeout(function(){
		UserName = localStorage.getItem('UserName');
		getUserInfo(UserName);
	}, 800);

};

$(document).on("click", ".buy", function(){
	var parent = $(this).parent();
	playersValue = parent.find(".value").text().replace(/\D/g,'');
	var count= $('.team div').length;
	if(score >= playersValue && count < 7){
		buy(parent);
		console.log(score, playersValue);
		newScore = score;
		newScore -= parseInt(playersValue);
		console.log(score, playersValue, newScore);
	}else{
		alert("you can't afford this player or your squad is full.");
	}
});

$(document).on("click", ".delete", function(){
	var parent = $(this).parent();
	remove(parent);
	console.log(userTeam, customTeam);

});
//add player to the team button functionality
function buy(div){
	div.find("button").text("Delete").removeClass("buy").addClass("delete");
	div.appendTo($(".team"));
	var playerID = div.attr("playerID");
	customTeam.push(playerID);
};
//remove player from the chosen previously team button functionality
function remove(div){
	div.find("button").text("Add").removeClass("delete").addClass("buy");
	div.appendTo($(".players"));
	var playerID = div.attr("playerID");
	customTeam = customTeam.filter(function(item) { 
		return item !== playerID
	})
}

$(".save").on("click", function(){
	console.log(score, playersValue, newScore);
		$.ajax({
			method: "PUT",
			url: "/api/users",
			data: {
				userName: UserName,
				team : customTeam.toString(),
				score: newScore
			}
		})
			.done(function() {
			window.location.reload();
		});
});
//error message in bootstrap popover functionality using tether.js and Popper.js
$(".play").popover();
$(".play").on("click", function(){
	if (customTeam.length != 7){
		$('.play').popover('toggle');
	} else if (customTeam.length == 7){
		$('.play').popover('hide');
		window.location = "/game.html";
	}else if(userTeam != customTeam){
		alert("Your need to save your changes.")
	}else{
		window.location = "/game.html";
	}
});
//Creating new player divs and displaying them in bootstrap's card elements
function createNewPlayer(data){
	player = $("<div class='player card text-center'>");
	player.attr("playerID", data.id);
	var playerPic = $("<img>");
	var playerName = $("<h6 class='card-header'>");
	var playerClub = $("<h6>");
	var playerPossition = $("<h6>");
	var playerValue = $("<h6 class='value'>");
	playerPic.attr("src", data.image);
	playerPic.attr("class", "card-img");
	playerName.text(data.name);
	playerClub.text(data.club);
	playerPossition.text(data.position);
	playerValue.text("Points: " + data.value);
	player.append(playerName);
	player.append(playerPic);
	player.append(playerClub);
	player.append(playerPossition);
	player.append(playerValue);
	player.append($("<button class='buy btn btn-success btn-sm'>" + "Add" + "</button>"));
	player.append($("<span id='latestScore'>" + data.current_score + "</span>"));
};

//getting user's input to creat user's team name and team initial team composition array
function getUserInfo(UserName){
	console.log(UserName);
	$.get("/api/team/" + UserName)
		.done(function(data){
		console.log(UserName, data);
		userTeam = data.teamMembers.split(",");
		customTeam = userTeam;
		score = data.score;
		latestScore = data.latestScore;
		teamName = data.teamName;
		avatar = data.image;
		$(".team h6").html(teamName);
		$(".navbar-brand img").attr("src", avatar);
		$("#score").text(score);
		for(var i = 0; i < userTeam.length; i++){
			var teamPlayer = $("[playerID=" +userTeam[i] +"]");
			teamPlayer.find("button").text("Delete").removeClass("buy").addClass("delete");
			teamPlayer.appendTo($(".team"));
		}
		console.log(userTeam);
	});
}

//===============================
//The script for the Game page
//===============================

//==================
//getting the user's team
//==================

function game(){
	var name = localStorage.getItem('UserName');
	var playersDB = 0;
	getUserInfo(name, "team");
	$.ajax({
		method: "GET",
		async: "false",
		url: "/api/players"}).done(function(data){
		playersDB = data;
		for (var i =0; i< data.length; i++){	
			for(var j = 0; j< userTeam.length; j++){
				if(userTeam[j] == data[i].id){
					createNewPlayer(data[i]);
					$(".team").append(player);
					console.log(playersDB.length);
				}
			}
		}
		$(".team").append("<h6>Match Points: " + latestScore + "</h6>");
	});


	//==================
	//getting other users teams
	//==================
	console.log(playersDB.length);
	$.ajax({
		method: "GET",
		async: "false",
		url: "/api/users",
		data: {
			name : name,
		}
	}).done(function(data){
		for (var x = 0; x< data.length; x++) {
			console.log(data[x].name, x);
			var div = "otherUser" + x;
			console.log(playersDB.length);
			var otherTeam = data[x].teamMembers.split(",");
			var otherTeamName = data[x].teamName;
			var otherScore = data[x].score;
			var otherLatest = data[x].latestScore;
			console.log(otherTeam, div);
			$("." + div+ " .teamName").text(data[x].teamName);
			for (var i =0; i< playersDB.length; i++){
				for(var j = 0; j < otherTeam.length; j++){
					if(otherTeam[j] == playersDB[i].id){
						createNewPlayer(playersDB[i]);
						$("." + div).append(player);
					}
				}}
			$("." + div).append("<h6>Match Points: " + otherLatest + "</h6>");
		}
	});

	$('.player button').remove();

	$(".start").on("click", function(){
		$.ajax({
			method: "GET",
			async: "false",
			url: "/api/stats"})
			.done(function(data){
			setTimeout(function(){
				window.location.reload();
			},1200); 
		})
	});
	//leaderboard modal functionality
	$(".leader").on("click", function(){
		$.ajax({
			method: "GET",
			async: "false",
			url: "/api/leader"})
			.done(function(data){
			$(".modal-body").empty();
			for(var y =0; y < data.length; y++){
				console.log(data[y].score);
				var name = data[y].name;
				var points = data[y].score;
				$(".modal-body").append((y + 1) + ".  " + name + "    " + points + "<hr>");
				// Showing the modal with the best match 
				$("#myModal").modal('toggle');
			}
		})
	})

}