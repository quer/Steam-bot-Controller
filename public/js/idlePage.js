var isLoading = false;
function LoadIdlePage() {
    $("#view").html(`<div class="row heading heading-icon">
        <h2>Bots idle!
        </h2>
    </div>
    <div id="BotList">
        <div class="text-center">
            <div class="spinner-border" role="status">
            <span class="sr-only">Loading...</span>
            </div>
        </div>
    </div>`);
    LoadIdlePageData();
}

function LoadIdlePageData() {
    if(!isLoading){
        $("#BotList").html(`<div class="text-center">
            <div class="spinner-border" role="status">
            <span class="sr-only">Loading...</span>
            </div>
        </div>`);
        isLoading = true;
        $.ajax({
            url: "/Api/Idle"
        }).done(function( data ) {
            isLoading = false;
            if(data.status){
                var botHtml = `<div class="card-columns">`;
                for (let i = 0; i < data.bot.length; i++) {
                    const bot = data.bot[i];
                    var gamesHtml = `<div class="row">`;
                    for (let ii = 0; ii < bot.idleList.length; ii++) {
                        const idleGame = bot.idleList[ii];
                        gamesHtml += `
                        <div class="col-md-12">
                            <div class="media">
                              <div class="media-left">
                                <a href="#">
                                    <img class="media-object" src="https://steamcdn-a.akamaihd.net/steam/apps/${idleGame.appid}/header.jpg" style="width: 100px;">
                                </a>
                              </div>
                              <div class="media-body">
                                <h4 class="media-heading">${idleGame.name}</h4>
                                you have ${idleGame.playtime} minutes in this game
                                </div>
                            </div>
                        </div>`;
                    }
                    gamesHtml += ` </div>`;
                    botHtml += `
                        <div class="card" steamId="${bot.steamid}" loginName="${bot.loginName}">
                            <img src="${bot.avatar}" class="card-img-top" alt="${bot.personaname}">
                            <div class="card-body">
                                <h5 class="card-title">${bot.personaname}</h5>
                                <h5 class="card-title">
                                    <button type="button" class="btn btn-primary StartIdleBot">
                                        <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-caret-right-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M12.14 8.753l-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z"/>
                                        </svg>
                                        Start idle
                                    </button>
                                ${bot.idleList.length > 0 ? `
                                    <button type="button" class="btn btn-primary StopIdleBot">
                                        <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-x-square-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                            <path fill-rule="evenodd" d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2zm3.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/>
                                        </svg>
                                        Stop idle
                                    </button>
                                    ` : ``}
                                </h5>
                                <h5 class="card-title">Status:${bot.online ? `Online` : `Offline`}</h5>
                            </div>
                            <div class="card-footer text-muted">
                            ${gamesHtml}
                            </div>
                        </div>
                    `;

                }
                botHtml += "</div>";
                $("#BotList").html(botHtml);
                isLoading = false;
            }else{
                $("#BotList").html("Error getting Bot list");
            }
        })
    }
}
$("body").on("click", ".StopIdleBot", function (e) {
    var buttonObj = $(this);
    var steamLogin = buttonObj.parent().parent().parent().attr("loginName")
    e.preventDefault();
    if(steamLogin != ""){
        var dialog = modal_box({
            title: "Stop idle Steam Account",
            description: `<p>Are you sure you what to stop idle for the bot</p>`,
            doneButton: "Stop",
            cancelButton: "Cancel",
            callback: function (clickDone) {
                if(clickDone){
                    LoadIdlePageData();
                }
            },
            doneRulesCallback:  function (callback) {
                $.ajax({
                    method: "POST",
                    url: "Api/Idle/IdleStop",
                    data: { 
                        loginName: steamLogin
                    }
                })
                .done(function( data ) {
                    callback(true);
                });
            }
        })
        dialog.show();
    }
})

$("body").on("click", ".StartIdleBot", function (e) {
    var steamLogin = $(this).parent().parent().parent().attr("loginName")
    $.ajax({
        method: "GET",
        url: "Api/Idle/GetBotIdleGameList",
        dataType: "json",
        traditional: true,
        data: { 
            loginName: steamLogin
        }
    })
    .done(function( data ) {
        if(data.status && data.games.length <= 0){
            alert("the account do not have any games");
            return;
        }
        var listHtml = ``;
        for (let i = 0; i < data.games.length; i++) {
            const gameData = data.games[i];
            listHtml += `<div class="form-check">
                <input class="form-check-input selectedApp"  type="checkbox" value="${gameData.appid}" id="listNr${i}">
                <label class="form-check-label" for="listNr${i}">
                    ${gameData.name}
                </label>
            </div>`;
        }
        var dialog = modal_box({
            title: "Start Idle game list",
            description: `
                <p>When you click start, it will stop the current idle list, and only run what you select here.</p>
                ${listHtml}
                `,
            doneButton: "Start Idle",
            cancelButton: "cancel",
            callback: function (clickDone) {
                if(clickDone){
                    LoadIdlePageData();
                }
            },
            doneRulesCallback:  function (callback) {
                var model = $(".modalDialog_block_page");
                var valid = true;
                var selectedList = model.find(".selectedApp");
                //the account do not have any games.
                if(selectedList.length <= 0){
                    valid = false;
                }
                var selectedAppList = [];
                for (let i = 0; i < selectedList.length; i++) {
                    const selectedApp = selectedList[i];
                    if($(selectedApp).is(':checked')){
                        selectedAppList.push($(selectedApp).val())
                    }
                }
                if(selectedAppList.length > 30){
                    valid = false;
                    alert("Max select 30 games, you selected "+selectedAppList.length + " games");
                }
                if(valid){
                    $.ajax({
                        method: "POST",
                        url: "Api/Idle/IdleGames",
                        dataType: "json",
                        traditional: true,
                        data: { 
                            loginName: steamLogin,
                            Games: selectedAppList
                        }
                    })
                    .done(function( data ) {
                        callback(true);
                    });
                }else{
                    callback(false);
                }
            }
        });
        dialog.show();
    });
});