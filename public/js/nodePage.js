var isLoading = false;
var allMenuItems = [];
var allboxs = [];
var objectThatIsDragging = null;

function LoadNodesPage() {
    $("#view").html(`<div class="row heading heading-icon">
        <h2>Node Modules!
        <button type="button" class="btn btn-primary" id="NewNodeModule">
                <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-plus-circle" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                    <path fill-rule="evenodd" d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                </svg>
            </button>
        </h2>
    </div>
    <div id="NodeModulesList">
        <div class="text-center">
            <div class="spinner-border" role="status">
            <span class="sr-only">Loading...</span>
            </div>
        </div>
    </div>`);
    $("#NewNodeModule").click(function () {
        SetCreateNodeModulePage();
    });

}
$("#save").click(function () {
    console.log("save - validate");
    var valid = true;
    allboxs.forEach(box => {
        if(!box.RunRules()){
            valid = false;
        }
    });
    if(valid){
        console.log("save");
        var boxesStored = [];
        var boxConnectionsStored = [];
        allboxs.forEach(box => {
            boxesStored.push(box.ExportBox());
            boxConnectionsStored = boxConnectionsStored.concat(box.ExportConnections());
        });
        console.log({boxes: boxesStored, connection: boxConnectionsStored})
    }else{
        alert("not mandatory field have been set");
    }
})
$("#clear").click(function () {
    console.log("clear");
    for (var i = allboxs.length - 1; i >= 0; i--) {
        allboxs[i].Delete()
    }
})
function SetCreateNodeModulePage() {
    if(!isLoading){
        $("#view").html(`<div class="text-center">
            <div class="spinner-border" role="status">
            <span class="sr-only">Loading...</span>
            </div>
        </div>`);
        isLoading = true;
        $.ajax({
            url: "/Api/Nodes/GetNodes"
        }).done(function( response ) {
            isLoading = false;
            if(response.status){
                $("#view").html(`<div class="NodeModule_wrapper">
                    <div class="NodeModule_col">
                    </div>
                    <div class="NodeModule_col-right">
                        <div id="NodeModule_flow"></div>
                    </div>
                    <div id="NodeModule_clear">Clear</div>
                    <div id="NodeModule_save">Save</div>
                </div>`);
                $("#NodeModule_flow").on("drop", function (ev) {
                    console.log("ondrop");
                    ev.originalEvent.preventDefault();
                    console.log(objectThatIsDragging.setting);
                    CreateBox(objectThatIsDragging.setting, {x: ev.pageX - 301, y: ev.pageY})
                    
                })
                $("#NodeModule_flow").on("dragover", function (ev) {
                    ev.originalEvent.preventDefault();
                })
                response.data.Moduler.forEach(module => {
                    allMenuItems.push(new MenuItem(module));
                });
                if(response.data.Load){
                    Load(JSON.parse(response.data.Load));
                }
            }
        })
    }
}

function MenuItem(setting) {
    this.setting = setting;
    this.el = $('<div class="NodeModule_drag-drawflow" draggable="true"><span>'+ setting.Name +'</span></div>')
    var that = this;
    this.el.on("dragstart", function (ev) {
        console.log("ondragstart");
        objectThatIsDragging = that;
    });
    $(this.el).appendTo('.NodeModule_col'); 
}


function CreateBox(setting, pos, preloadData = null) {
    allboxs.push(new Node_Box(setting, pos, preloadData));
}

function Load(data) {
    //first load all boxes
    data.boxes.forEach(box => {
        var menuItem = GetMenuItem(box.UniqId);
        if(menuItem != null){
            CreateBox(menuItem.setting, {x: box.x, y: box.y}, {RealId: box.RealId, fields: box.fields});
        }else{
            console.log("noget gik galt, UniqId:" + box.UniqId)
        }
    });
    data.connection.forEach(connection => {
        /*connection.FromID
        connection.FromRealId
        connection.ToID
        connection.ToRealId*/
        var fromBox = GetBox(connection.FromRealId);
        if(fromBox != null){
            var toBox = GetBox(connection.ToRealId);
            if(toBox != null){
                var output = fromBox.GetOutput(connection.FromID);
                if(output != null){
                    var input = toBox.GetInput(connection.ToID);
                    if(input != null){
                        input.AddConnection(output);
                        console.log("Done loaded");
        
                    }else{
                        console.log("noget gik galt, 'connection-to-output' ID:" + connection.FromRealId+ " ID: "+ connection.FromRealId);
                    }  
    
                }else{
                    console.log("noget gik galt, 'connection-to-input' ID:" + connection.FromRealId+ " ID: "+ connection.FromRealId);
                }

            }else{
                console.log("noget gik galt, 'connection-to' ID:" + connection.FromRealId);
            }
        }else{
            console.log("noget gik galt, 'connection-from' ID:" + connection.FromRealId);
        }
    });
}
function GetBox(realId) {
    var returnValue = null;
    allboxs.forEach(box => {
        if(box.preloadId == realId){
            returnValue = box;
            return;
        }
    });
    return returnValue;
}
function GetMenuItem(id) {
    var returnValue = null;
    allMenuItems.forEach(menuItem => {
        if(menuItem.setting.UniqId == id){
            returnValue = menuItem;
            return;
        }
    });
    return returnValue;
}