var isLoading = false;
var moduleInConfig = null;
function LoadModulesPage() {
    $("#view").html(`<div class="row heading heading-icon">
        <h2>Modules!
        </h2>
    </div>
    <div id="ModulesList">
        <div class="text-center">
            <div class="spinner-border" role="status">
            <span class="sr-only">Loading...</span>
            </div>
        </div>
    </div>`);
    LoadModulesPageData();
}

function LoadModulesPageData() {
    if(!isLoading){
        moduleInConfig = null;
        $("#ModulesList").html(`<div class="text-center">
            <div class="spinner-border" role="status">
            <span class="sr-only">Loading...</span>
            </div>
        </div>`);
        isLoading = true;
        $.ajax({
            url: "/Api/Module"
        }).done(function( data ) {
            isLoading = false;
            if(data.status){
                var ModuleListHtml = `<div class="btn-group-vertical">`;
                for (let i = 0; i < data.modules.length; i++) {
                    const module = data.modules[i];
                    if(module.valid){
                        ModuleListHtml += `<button type="button" moduleId="${module.id}" moduleDescription="${module.description}" moduleMode="${module.mode}" class="btn btn-primary moduleListItem">${module.name}</button>`;
                    }
                }
                ModuleListHtml += "</div>";
                $("#ModulesList").html(ModuleListHtml);
                isLoading = false;
            }else{
                $("#ModulesList").html("Error getting Module list");
            }
        })
    }
}
$("body").on("click", ".moduleListItem", function (e) {
    var buttonObj = $(this);
    var moduleId = buttonObj.attr("moduleId");
    var moduleDescription = buttonObj.attr("moduleDescription");
    var moduleMode = buttonObj.attr("moduleMode");
    var moduleName = buttonObj.text();
    moduleInConfig = {
        Name: moduleName,
        Description: moduleDescription,
        Mode: moduleMode,
        moduleId: moduleId
    }
    if(moduleId != null){
        LoadUnitListPage()
    }
})
function LoadUnitListPage() {
    if(!isLoading && moduleInConfig != null){
        $("#ModulesList").html(`<div class="text-center">
            <div class="spinner-border" role="status">
            <span class="sr-only">Loading...</span>
            </div>
        </div>`);
        isLoading = true;
        $.ajax({
            url: "/Api/GetBots"
        }).done(function( data ) {
            isLoading = false;
            if(data.status){
                if(data.bot.length > 0){
                    var type = moduleInConfig.Mode == module.exports.mode.sinkel ? "radio" : "checkbox";
                    var ModuleListHtml = `<div>`;
                    for (let i = 0; i < data.bot.length; i++) {
                        const bot = data.bot[i];
                        ModuleListHtml += `
                        <div class="form-check">
                            <input class="form-check-input SelectedBotInput" name="SelectedBot" type="${type}" value="${bot.loginName}" id="botList_${bot.loginName}">
                            <label class="form-check-label" for="botList_${bot.loginName}">
                            ${bot.personaname}
                            </label>
                        </div>`;
                    }
                    ModuleListHtml += `<div class="btn-group-vertical">`;
                    ModuleListHtml += `<button type="button" class="btn btn-primary SelectedUnit">Select</button>`;
                    ModuleListHtml += `</div`;
                }else{
                    ModuleListHtml += `you need to add some account to run a module`;
                }
                ModuleListHtml += "</div>";
                $("#ModulesList").html(ModuleListHtml);
                isLoading = false;
            }else{
                $("#ModulesList").html("Error getting Bot list");
            }
        })
    }
}
$("body").on("click", ".SelectedUnit", function (e) {
    if(moduleInConfig != null){
        //if sinkel mode list will just have one. as it will still run the list in sinkel mode.
        var guiSelectedBots = $('.SelectedBotInput:checked');
        if(guiSelectedBots.length > 0){
            if(moduleInConfig.mode == module.exports.mode.sinkel){
                if(guiSelectedBots.length > 1){
                    alert("only select 1 bot");
                    return;
                }
            }
            moduleInConfig.bots = [];
            //it valid, then to next page
            for (let i = 0; i < guiSelectedBots.length; i++) {
                const selectedBot = guiSelectedBots[i];
                moduleInConfig.bots.push($(selectedBot).val())
            }
            //load
            LoadModuleFieldPage();
        }else{
            alert("Select atleast one bot");
        }
        
    }
});

function LoadModuleFieldPage() {
    if(!isLoading && moduleInConfig != null && moduleInConfig.bots.length > 0){
        $("#ModulesList").html(`<div class="text-center">
            <div class="spinner-border" role="status">
            <span class="sr-only">Loading...</span>
            </div>
        </div>`);
        isLoading = true;
        $.ajax({
            url: "/Api/Module/GetModuleFields",
            type: "POST",
            data: { 
                moduleId: moduleInConfig.moduleId,
                bots: moduleInConfig.bots
            }
        }).done(function( data ) {
            isLoading = false;
            console.log(data);
            if(data.status && data.data && data.data.fields && data.data.preObj){
                
                BuildFields(data.data.fields, JSON.parse(data.data.preObj))
            }
        });
    }
}

function BuildFields(fields, dataTofields) {
    var endHtml = "";
    moduleInConfig.fields = fields;
    moduleInConfig.fieldData = dataTofields;
    var fieldKeys = Object.keys(fields);
    for (let i = 0; i < fieldKeys.length; i++) {
        const fieldKey =  fieldKeys[i];
        const field = fields[fieldKey];
        var type = module.exports.field.type.text;
        if(field.type)// maby ensure the type is valid. maby do it when loading the module
        {
            type = field.type;
        }
        endHtml += `<div class="mb-3">`;
        const fieldPreValue = dataTofields[fieldKey] != null? dataTofields[fieldKey] : "";
        if(type == module.exports.field.type.text){
            endHtml += `<label for="${fieldKey}" class="form-label">${field.text}</label>
            <input type="text" id="${fieldKey}_fieldKey" class="form-control" aria-describedby="${fieldKey}Block" value="${fieldPreValue}">`;
            if(type.description){
                endHtml += `<div id="${fieldKey}Block" class="form-text">${type.description}</div>`;
            }
        }else if(type == module.exports.field.type.textField){
            endHtml += `<label for="${fieldKey}" class="form-label">${field.text}</label>
            <textarea class="form-control" id="${fieldKey}_fieldKey" rows="3">${fieldPreValue}</textarea>`;
        }
        endHtml += `</div>`;
    }
    endHtml += `<div class="mb-3">
        <button type="button" id="RunModule" class="btn btn-primary mb-3">Confirm identity</button>
    </div>`;
    $("#ModulesList").html(endHtml);
}
$("body").on("click", "#RunModule", function (e) {
    if(!isLoading && moduleInConfig && moduleInConfig.moduleId && moduleInConfig.bots.length > 0){
        
        var preladedData = moduleInConfig.fieldData || {};
        var fields = moduleInConfig.fields;
        var fieldKeys = Object.keys(fields);
        for (let i = 0; i < fieldKeys.length; i++) {
            const fieldKey =  fieldKeys[i];
            const field = fields[fieldKey];
            if($(`#${fieldKey}_fieldKey`).length > 0){ // then the field did exist in the gui
                var type = module.exports.field.type.text;
                if(field.type)// maby ensure the type is valid. maby do it when loading the module
                {
                    type = field.type;
                }
                if(type == module.exports.field.type.text || type == module.exports.field.type.textField){
                    preladedData[fieldKey] = $(`#${fieldKey}_fieldKey`).val();
                }
            }
        }
        $("#ModulesList").html(`<div class="text-center">
            <div class="spinner-border" role="status">
            <span class="sr-only">Loading...</span>
            </div>
        </div>`);
        isLoading = true;
        $.ajax({
            url: "/Api/Module/RunModule",
            type: "POST",
            data: { 
                moduleId: moduleInConfig.moduleId,
                bots: moduleInConfig.bots,
                objToModule: JSON.stringify(preladedData)
            }
        }).done(function( data ) {
            isLoading = false;
            console.log(data);
            if(data.status){
                $("#ModulesList").html("All done!")
            }else{
                $("#ModulesList").html(data.message)
            }
        });
    }
});