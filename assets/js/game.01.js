// game js version 0.1

$(document).ready(() => {

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
    var storedPlayerName = sessionStorage.getItem("playerName");
    var storedSelectedChar = sessionStorage.getItem("charSelected");

    //Functions

    //This function is for showing data on manage character dashboard
    function showData() {
        database.ref("players").once('value', function(snapshot) {
        snapshot.forEach(function(childSnapshot) {
            var childData = childSnapshot.val();
            var table = $(".table");
            var row = $("<tr>");
            var td = $("<td>");

            var displayPlayerName = $("<td>").text(childData.playerName);
            var displayPlayerNum = $("<td>").text(childData.player);
            var displayCharSelected = $("<td>").text(childData.charSelected);
            row.append(displayPlayerName, displayPlayerNum, displayCharSelected);
            table.append(row);
            });
        });
    }

    //This function is for rendering list of selectable characters 
    function renderChar() {
        database.ref("characters").once('value', function(snapshot) {
            snapshot.forEach(function(childSnapshot) {
                var childData = childSnapshot.val();
                console.log(childData);
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

    function renderSelectedChar() {
        database.ref("players").once('value', function(snapshot) {
            snapshot.forEach(function(childSnapshot) {
                var childKey = childSnapshot.key;
                var childData = childSnapshot.val();
                console.log(childData);

                var img = $("<img>");
                img.attr("src", childData.charImage);
                img.addClass("character");

                var charName = $("<h3>").text(childData.charSelected);
                var health = $("<h4>").addClass("health").text(childData.charHealth);
                var attackBtn = $("<button>").text("Attack");
                attackBtn.addClass("btn btn-danger");

                if (childKey === "playerOne") {
                    $("#playerOne").append(img);
                    $("#playerOneName").text(childData.playerName);
                    $("#playerOneCharName").append(charName, health, attackBtn);
                    attackBtn.addClass("playerOneAttackBtn");
                } else if (childKey === "playerTwo") {
                    $("#playerTwo").append(img);
                    $("#playerTwoName").text(childData.playerName);
                    $("#playerTwoCharName").append(charName, health, attackBtn);
                    attackBtn.addClass("playerTwoAttackBtn");
                }
            })
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
    
    
    //Retrieve Number of Players from Firebase
    database.ref().on("value", function (snapshot) {
        var data = snapshot.val();
        var updatedPlayerCount = parseInt(data.playerCount.total);
        console.log(updatedPlayerCount);

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
                    total : updatedPlayerCount
                })

                //Store player's name and character selected
                sessionStorage.setItem("playerName", playerName);
                sessionStorage.setItem("charSelected", charSelected);
                alert("Waiting for one more player!");
                location.reload();

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

                database.ref("playerCount").set({
                    total : updatedPlayerCount
                })

                //Store player's name and character selected
                sessionStorage.setItem("playerName", playerName);
                sessionStorage.setItem("charSelected", charSelected);
                sessionStorage.setItem("charHealth", charHealth);
                sessionStorage.setItem("charPower", charPower);
                sessionStorage.setItem("charImage", charImage);
                alert("Let's get the game started!");
                location.reload();
                }
            });
        }); 
    })

    showData();
    renderChar();
    renderSelectedChar();
});