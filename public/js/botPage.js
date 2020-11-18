var updateSteamBotInterval = null;
var botsLoaded = [];
function LoadBotPage() {

    $("#view").html(`<div class="row heading heading-icon">
        <h2>Bots!
            <button type="button" class="btn btn-primary" id="AddSteamBot">
                <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-plus-circle" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                    <path fill-rule="evenodd" d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                </svg>
            </button>
        </h2>
    </div>
    <div id="BotList">
        <div class="text-center">
            <div class="spinner-border" role="status">
            <span class="sr-only">Loading...</span>
            </div>
        </div>
    </div>`);
    LoadBotData();
    updateSteamBotInterval = setInterval(function () {
        if(activePageName == "Bots"){
            LoadBotData();
        }
    } , 60000);
    $("#AddSteamBot").click(function () {
      
        var dialog = modal_box({
            title: "Add Steam Account",
            description: `<div class="form-group">
                    <label for="SteamUserName">Steam UserName</label>
                    <input type="text" class="form-control" id="SteamUserName" value="" required>
                </div>
                <div class="form-group">
                    <label for="SteamPassword">Steam Password</label>
                    <input type="password" class="form-control" id="SteamPassword" value="" required>
                </div>
                <div class="form-group">
                    <label for="SteamSharedSecret">Steam Shared Secret</label>
                    <input type="password" class="form-control" value="" id="SteamSharedSecret" required>
                </div>
                <div class="custom-control custom-switch">
                    <input type="checkbox" class="custom-control-input" id="StartWhenSystemStartRestart">
                    <label class="custom-control-label" for="StartWhenSystemStartRestart">Start When System Start/Restart</label>
                </div>
                <div class="custom-control custom-switch">
                    <input type="checkbox" class="custom-control-input" id="RestartOnConnectionFail">
                    <label class="custom-control-label" for="RestartOnConnectionFail">Restart On Connection Fail</label>
                </div>`,
            doneButton: "Save",
            cancelButton: "cancel",
            callback: function (clickDone) {
                if(clickDone){
                    LoadBotData();
                }
            },
            doneRulesCallback:  function (callback) {
                var model = $(".modalDialog_block_page");
                var loginName = $(model.find("#SteamUserName")[0])
                var password = $(model.find("#SteamPassword")[0])
                var sharedSecret = $(model.find("#SteamSharedSecret")[0])
                var startWhenSystemStartRestart = model.find("#StartWhenSystemStartRestart")[0]
                var restartOnConnectionFail = model.find("#RestartOnConnectionFail")[0]
                var valid = true;
                if(!SetFormFieldValid(loginName, loginName.val() != "")){
                    valid = false;
                }
                if(!SetFormFieldValid(password, password.val() != "")){
                    valid = false;
                }
                if(!SetFormFieldValid(sharedSecret, sharedSecret.val() != "")){
                    valid = false;
                }

                if(valid){
                    $.ajax({
                        method: "POST",
                        url: "Api/AddBot",
                        data: { 
                            loginName: loginName.val(), 
                            password: password.val(),
                            sharedSecret: sharedSecret.val(),
                            startWhenSystemStartRestart: startWhenSystemStartRestart.checked, 
                            restartOnConnectionFail: restartOnConnectionFail.checked, 
                        }
                    })
                    .done(function( data ) {
                        if(data.status){
                            callback(true);
                        }else{
                            SetFormFieldValid(loginName, false);
                            SetFormFieldValid(password, false);
                            SetFormFieldValid(sharedSecret, false);               
                            callback(false);
                        }
                    });
                }else{
                    SetFormFieldValid(loginName, false);
                    SetFormFieldValid(password, false);
                    SetFormFieldValid(sharedSecret, false); 
                    callback(false);
                }
            }
        });
        dialog.show()
    });
}
function unLoad() {
    if(updateSteamBotInterval != null){
        clearInterval(updateSteamBotInterval);
    }
}
var isLoading = false;
function LoadBotData() {
    if(!isLoading){
        $("#BotList").html(`<div class="text-center">
            <div class="spinner-border" role="status">
            <span class="sr-only">Loading...</span>
            </div>
        </div>`);
        isLoading = true;
        $.ajax({
            url: "/Api/GetBots"
        }).done(function( data ) {
            if(data.status){
                botsLoaded = data.bot;
                let current_datetime = new Date()
                let formatted_date = current_datetime.getFullYear() + "-" + (current_datetime.getMonth() + 1) + "-" + current_datetime.getDate() + " " + current_datetime.getHours() + ":" + current_datetime.getMinutes() + ":" + current_datetime.getSeconds() 

                var botHtml = `<div class="card-columns">`;
                for (let i = 0; i < data.bot.length; i++) {
                    const bot = data.bot[i];
                    botHtml += `
                        <div class="card" steamId="${bot.steamid}" loginName="${bot.loginName}">
                            <img src="${bot.avatar}" class="card-img-top" alt="${bot.personaname}">
                            <div class="card-body">
                                <h5 class="card-title">${bot.personaname}</h5>
                                <h5 class="card-title">
                                    <button type="button" class="btn btn-primary EditSteamBot">
                                        <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-pencil-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                            <path fill-rule="evenodd" d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z"/>
                                        </svg>
                                        edit
                                    </button>

                                    <button type="button" class="btn btn-primary RemoveSteamBot">
                                        <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-x-octagon-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                            <path fill-rule="evenodd" d="M11.46.146A.5.5 0 0 0 11.107 0H4.893a.5.5 0 0 0-.353.146L.146 4.54A.5.5 0 0 0 0 4.893v6.214a.5.5 0 0 0 .146.353l4.394 4.394a.5.5 0 0 0 .353.146h6.214a.5.5 0 0 0 .353-.146l4.394-4.394a.5.5 0 0 0 .146-.353V4.893a.5.5 0 0 0-.146-.353L11.46.146zm-6.106 4.5a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/>
                                        </svg>
                                        remove
                                    </button>

                                    ${
                                        bot.online ? `
                                        <button type="button" class="btn btn-primary SetPersonaState">
                                            <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-eye-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z"/>
                                                <path fill-rule="evenodd" d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/>
                                            </svg>
                                            Persona State
                                        </button>
                                        <button type="button" class="btn btn-primary StopBot">
                                            <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-x-square-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                                <path fill-rule="evenodd" d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2zm3.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/>
                                            </svg>
                                            Stop
                                        </button>
                                        ` : `
                                        <button type="button" class="btn btn-primary StartBot">
                                            <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-caret-right-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M12.14 8.753l-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z"/>
                                            </svg>
                                            Start
                                        </button>
                                        `
                                    }

                                </h5>
                                <p class="card-text">Not running any games</p>
                                <p>${bot.online ? bot.personastate.name : 'Offline'}</p>
                            </div>
                            <div class="card-footer text-muted">
                            ${formatted_date}
                            </div>
                        </div>
                    `;

                }
                botHtml += "</div>";
                $("#BotList").html(botHtml);
                isLoading = false;
            }else{
                botsLoaded = [];
                $("#BotList").html("Error getting Bot list");
                isLoading = false;
            }
        });
    }
}
$("body").on("click", ".RemoveSteamBot", function (e) {
    var buttonObj = $(this);
    var steamLogin = buttonObj.parent().parent().parent().attr("loginName")
    e.preventDefault();
    if(steamLogin != ""){
        var dialog = modal_box({
            title: "Remove Steam Account",
            description: `<p>Are you sure you what to remove the bot</p>`,
            doneButton: "Remove",
            cancelButton: "cancel",
            callback: function (clickDone) {
                if(clickDone){
                    LoadBotData();
                }
            },
            doneRulesCallback:  function (callback) {
                $.ajax({
                    method: "POST",
                    url: "Api/RemoveBot",
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
$("body").on("click", ".EditSteamBot", function (e) {
    var buttonObj = $(this);
    var steamLogin = buttonObj.parent().parent().parent().attr("loginName");
    var botData = GetBotData(steamLogin)
    e.preventDefault();
    var dialog = modal_box({
        title: "Edit Steam Account",
        description: `
            <div class="custom-control custom-switch">
                <input type="checkbox" class="custom-control-input" ${botData.startSystemStart? "Checked" : ""} id="StartWhenSystemStartRestart">
                <label class="custom-control-label" for="StartWhenSystemStartRestart">Start When System Start/Restart</label>
            </div>
            <div class="custom-control custom-switch">
                <input type="checkbox" class="custom-control-input" ${botData.startOnConnectionFail? "Checked" : ""} id="RestartOnConnectionFail">
                <label class="custom-control-label" for="RestartOnConnectionFail">Restart On Connection Fail</label>
            </div>`,
        doneButton: "Save",
        cancelButton: "cancel",
        callback: function (clickDone) {
            if(clickDone){
                LoadBotData();
            }
        },
        doneRulesCallback:  function (callback) {
            var model = $(".modalDialog_block_page");
            var startWhenSystemStartRestart = model.find("#StartWhenSystemStartRestart")[0]
            var restartOnConnectionFail = model.find("#RestartOnConnectionFail")[0]
           
            $.ajax({
                method: "POST",
                url: "Api/EditBot",
                data: { 
                    loginName: steamLogin, 
                    startWhenSystemStartRestart: startWhenSystemStartRestart.checked, 
                    restartOnConnectionFail: restartOnConnectionFail.checked, 
                }
            })
            .done(function( data ) {
                callback(true);
                
            });
        }
    })
    dialog.show();
})
$("body").on("click", ".SetPersonaState", function (e) {
    var buttonObj = $(this);
    var steamLogin = buttonObj.parent().parent().parent().attr("loginName");
    var botData = GetBotData(steamLogin)
    e.preventDefault();
    $.ajax({
        url: "/Api/GetPersonaState"
    }).done(function( data ) {
        if(data.status){
            var personaStates = data.list;
            var listHtml = "";
            for (const [key, value] of Object.entries(personaStates) ) {
                var currentSelected = botData.personastate.id;
                listHtml += `<option value="${value}" ${currentSelected == value ? "selected" : ""}>${key}</option>\n`;
            }
            var dialog = modal_box({
                title: "Set Persona State",
                description: `
                <div class="form-group">
                <label for="exampleFormControlSelect1">Example select</label>
                <select class="form-control" id="selectedPersonaState">
                  ${ listHtml }
                </select>
              </div>`,
                doneButton: "Save",
                cancelButton: "cancel",
                callback: function (clickDone) {
                    if(clickDone){
                        LoadBotData();
                    }
                },
                doneRulesCallback:  function (callback) {
                    var model = $(".modalDialog_block_page");
                    var selectedPersonaState = $(model.find("#selectedPersonaState")[0])
                
                    $.ajax({
                        method: "POST",
                        url: "Api/SetBotPersonaState",
                        data: { 
                            loginName: steamLogin, 
                            PersonaState: selectedPersonaState.val()
                        }
                    })
                    .done(function( data ) {
                        callback(true);
                        
                    });
                }
            })
            dialog.show();
        }
    });
})
$("body").on("click", ".StopBot", function (e) {
    var buttonObj = $(this);
    var steamLogin = buttonObj.parent().parent().parent().attr("loginName")
    e.preventDefault();
    if(steamLogin != ""){
        var dialog = modal_box({
            title: "Stop Steam Account",
            description: `<p>Are you sure you what to stop the bot</p>`,
            doneButton: "Stop",
            cancelButton: "Cancel",
            callback: function (clickDone) {
                if(clickDone){
                    LoadBotData();
                }
            },
            doneRulesCallback:  function (callback) {
                $.ajax({
                    method: "POST",
                    url: "Api/StopBot",
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
$("body").on("click", ".StartBot", function (e) {
    var buttonObj = $(this);
    var steamLogin = buttonObj.parent().parent().parent().attr("loginName")
    e.preventDefault();
    if(steamLogin != ""){
        var dialog = modal_box({
            title: "Start Steam Account",
            description: `<p>Are you sure you what to start the bot</p>`,
            doneButton: "Start",
            cancelButton: "Cancel",
            callback: function (clickDone) {
                if(clickDone){
                    LoadBotData();
                }
            },
            doneRulesCallback:  function (callback) {
                $.ajax({
                    method: "POST",
                    url: "Api/StartBot",
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
function SetFormFieldValid(el, isValid) {
    el.removeClass("is-invalid");
    el.removeClass("is-valid");
    if(isValid){
        el.addClass("is-valid");
    }else{
        el.addClass("is-invalid");
    }
    return isValid;
}
function GetBotData(LoginName) {
    for (let i = 0; i < botsLoaded.length; i++) {
        const botLoaded = botsLoaded[i];
        if(botLoaded.loginName == LoginName){
            return botLoaded;
        }
    }
    return null;
}