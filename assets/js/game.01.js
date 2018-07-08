// game js version 0.1

// Initialize Firebase
var config = {
    apiKey: "AIzaSyA67vaw_Xc2GfxcVRKQc-Do-nMdD1SqC2U",
    authDomain: "dragonball-z-rpg-game.firebaseapp.com",
    databaseURL: "https://dragonball-z-rpg-game.firebaseio.com",
    projectId: "dragonball-z-rpg-game",
    storageBucket: "dragonball-z-rpg-game.appspot.com",
    messagingSenderId: "987151345140"
};
firebase.initializeApp(config);
// Variables to reference the database.
var database = firebase.database();

//Global Variables
let blast = new Audio('assets/sounds/laser_cannon.mp3');
let counterBlast = new Audio('assets/sounds/ray_gun.mp3');
var gameMessage = $('#game-message');
var attack = $('#attack');



const determineAttack = (power) => {
    return Math.floor(Math.random() * power);
}

//Functions

//This function is for rendering list of selectable characters 
function renderChar() {
    database.ref("characters").once('value', function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            var childData = childSnapshot.val();
            var img = $("<img>");
            img.attr("src", childData.charThumbnail);
            img.attr("data-name", childData.charName);
            img.attr("data-health", childData.health);
            img.attr("data-power", childData.power);
            img.attr("data-src", childData.charImage);
            img.addClass("character-thumbnail");
            $("#char-selection").append(img);
        });
    });
}

const displayOnScreen = () => {
    var playerSessionInfo = sessionStorage.getItem("player");

    database.ref("players").once('value', function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            var childKey = childSnapshot.key;
            var childData = childSnapshot.val();
            var img = $("<img>");
            img.attr("src", childData.charImage);
            img.addClass("character");

            var attackBtn = $("<button>").text("Attack");
            attackBtn.addClass("btn btn-danger");

            var charName = $("<h3>").text(childData.charSelected);
            var health = $("<h4>").addClass("health").text(childData.charHealth);

            if (childKey === "playerOne") {
                $("#playerOne").append(img);
                $("#playerOneName").text(childData.playerName);
                $("#playerOneCharName").append(charName, health);
                if (playerSessionInfo === "one") {
                    $("#playerOneCharName").append(attackBtn);
                    attackBtn.addClass("playerOneAttackBtn");
                }  
            } else if (childKey === "playerTwo") {
                $("#playerTwo").append(img);
                $("#playerTwoName").text(childData.playerName);
                $("#playerTwoCharName").append(charName, health);
                if (playerSessionInfo === "two") {
                    $("#playerTwoCharName").append(attackBtn);
                    attackBtn.addClass("playerTwoAttackBtn");
                }  
            }
        })
    })
    
    //Identifying Player's Turn
    database.ref().on("value", function (snapshot) {
        var data = snapshot.val();
        
        var playerTurn = data.playerCount.turn;
        console.log(playerTurn);

        if (playerTurn === "one") {
            
            gameMessage.text("Player One's turn to attack!");
        } else if ( playerTurn === "two") {
            gameMessage.text("Player Two's turn to attack!");
        } else if (playerTurn === "none") {
            gameMessage.text("Click on Start Game to enter your name and select your characters!");
        }

        //Game Result
        var playerOneHealthStatus = parseInt(data.players.playerOne.charHealth);
        console.log("Player One Health: " + playerOneHealthStatus);
        var playerTwoHealthStatus = parseInt(data.players.playerTwo.charHealth);

        if (playerOneHealthStatus < 0) {
            $('#result').text("Player Two Wins!")
            $('#gameOver').modal('show');
        } else if (playerTwoHealthStatus < 0) {
            $('#result').text("Player One Wins!")
            $('#gameOver').modal('show');
        }
    })

    

    
}

    
//Generates GameID Number to track games and chats (for scaling multiple game sessions)
// var gameID = "";
// function generateGameID() {
//     for (var i = 0; i < 8; i++) {
//         var randomNumber = Math.floor(Math.random() * 8) + 1;
//         gameID = randomNumber + gameID;
//     }
//     console.log(gameID);
// }

displayOnScreen();

$(document).ready(() => {

    var storedPlayerName = sessionStorage.getItem("playerName");
    var storedSelectedChar = sessionStorage.getItem("charSelected");
    
    //Retrieve Number of Players from Firebase
    database.ref().on("value", function (snapshot) {
        var data = snapshot.val();
        var updatedPlayerCount = parseInt(data.playerCount.total);
        console.log("Number of Players: " + updatedPlayerCount);

        //Select character
        $(document).on("click", ".character-thumbnail", function() {
            $(this).toggleClass("selected-character");
            var charSelected = $(this).attr("data-name");
            var charHealth = $(this).attr("data-health");
            var charPower = $(this).attr("data-power");
            var charImage = $(this).attr("data-src");
            console.log(charSelected);
            $('#char-select').text(charSelected);

            //Submit Player
            $(".submit").on("click", function () {
            var playerName = $("#player-name").val().trim(); //player-name
            
            if (updatedPlayerCount == 2) {
                //validate if there are already two players
                alert("Player limit reached!");
                } else if (updatedPlayerCount == 0) {
                    //validation for identifying player one
                    updatedPlayerCount++
                    // generateGameID();
                    // Code for handling the setting playerOne data
                    database.ref("players/playerOne").set({
                        player: "one",
                        playerName: playerName,
                        charSelected: charSelected,
                        charHealth: charHealth,
                        charPower: charPower,
                        charImage: charImage,
                        dateAdded: firebase.database.ServerValue.TIMESTAMP
                    });

                database.ref("playerCount").set({
                    total: updatedPlayerCount,
                    turn: "one"
                })

                //Store player's name and character selected
                sessionStorage.setItem("playerName", playerName);
                sessionStorage.setItem("charSelected", charSelected);
                sessionStorage.setItem("charHealth", charHealth);
                sessionStorage.setItem("charPower", charPower);
                sessionStorage.setItem("charImage", charImage);
                sessionStorage.setItem("player", "one");
                alert("Waiting for one more player!");
                
                //Set Interval for waiting for the second player
                    //Refresh every 10 seconds
                    //If updatedPlayercount = 2, clearInterval
                    //Else continue interval

                } else if (updatedPlayerCount == 1) {
                //validation for identifying player two
                updatedPlayerCount++

                // Code for handling the setting playerTwo data
                database.ref("players/playerTwo").set({
                    player: "two",
                    playerName: playerName,
                    charSelected: charSelected,
                    charHealth: charHealth,
                    charPower: charPower,
                    charImage: charImage,
                    dateAdded: firebase.database.ServerValue.TIMESTAMP
                });

                database.ref("playerCount").update({
                    total : updatedPlayerCount
                })

                //Store player's name and character selected
                sessionStorage.setItem("playerName", playerName);
                sessionStorage.setItem("charSelected", charSelected);
                sessionStorage.setItem("charHealth", charHealth);
                sessionStorage.setItem("charPower", charPower);
                sessionStorage.setItem("charImage", charImage);
                sessionStorage.setItem("player", "two");

                alert("Let's get the game started!");
                }
                location.reload();
            });
        });
    });

    $("#restart-button").on("click", function () {
        database.ref("players").remove();
        database.ref("playerCount").update({
            total: "0",
            turn: "none"
        })
        location.reload();
    });

    $(document).on("click", ".playerOneAttackBtn", function () {
        attack.html("<img class='kamehameha' src='assets/images/kamehameha.png'>");
        blast.play();
        database.ref("players").once('value', function(snapshot) {
            var data = snapshot.val();
            let playerOnePower = determineAttack(data.playerOne.charPower);
            let playerTwoHealth = data.playerTwo.charHealth;

            playerTwoHealth -= playerOnePower;

            database.ref("players/playerTwo").update({
                charHealth: playerTwoHealth
            })

            database.ref("playerCount").update({
                turn: "two"
            })
            
        });
        setTimeout(() => {
            location.reload();
        }, 1500); 
    })

    $(document).on("click", ".playerTwoAttackBtn", function () {
        attack.html("<img class='kamehameha-reverse' src='assets/images/kamehameha-reverse.png'>"); 
        counterBlast.play();
        database.ref("players").once('value', function(snapshot) {
            var data = snapshot.val();
            let playerTwoPower = determineAttack(data.playerTwo.charPower);
            let playerOneHealth = data.playerOne.charHealth;

            playerOneHealth -= playerTwoPower;

            database.ref("players/playerOne").update({
                charHealth: playerOneHealth
            })

            database.ref("playerCount").update({
                turn: "one"
            })
            
        });
        setTimeout(() => {
            location.reload();
        }, 1500);
        
    })

    renderChar();
});
