var activeOutput = null;

var unitNumber = 0;
var connections = [];
function Node_Box(settings, poss, preloadData = null) {
    ++unitNumber;
    this.id = unitNumber;
    if(preloadData != null){ // if preload is not null, then it was added by the import
        this.preloadId = preloadData.RealId;
    }
    this.input = [];
    this.output = [];
    this.field = [];
    this.settings = settings;
    if(this.settings.Input){
        for (let i = 0; i < this.settings.Input.length; i++) {
            const inputSetting = this.settings.Input[i];
            this.input.push(new Node_Input(inputSetting, this))
        }
    }
    if(this.settings.Output){
        for (let i = 0; i < this.settings.Output.length; i++) {
            const outputSetting = this.settings.Output[i];
            this.output.push(new Node_Output(outputSetting, this))
        }
    }
    if(this.settings.Field){
        for (let i = 0; i < this.settings.Field.length; i++) {
            const fieldSetting = this.settings.Field[i];
            var fieldPreLoadData = null;
            if(preloadData && preloadData.fields){
                var preloadDataStored =  preloadData.fields.filter(x => x.fieldID == fieldSetting.UniqId);
                if(preloadDataStored.length > 0){ // shoud never be more then 1.
                    fieldPreLoadData = preloadDataStored[0];
                }
            }
            this.field.push(new Node_Field(fieldSetting, this, fieldPreLoadData))
        }
    }
    this.el = $(`<div class="draggable NodeModule_flowBox" id="${ this.settings.UniqId }_${ this.id }"><div class="NodeModule_flow_content_node"><div>
        <div class="NodeModule_title-box">${ this.settings.Name }</div>
        <div class="NodeModule_box NodeModule_box-connection">
        <div class="NodeModule_inputs"></div>
        </div>
        <div class="NodeModule_box NodeModule_box-normal">
            ${ this.settings.Name }
        </div>
        <div class="NodeModule_box NodeModule_box-normal">
            <div class="NodeModule_fields"></div>
        </div>
        <div class="NodeModule_box NodeModule_box-connection">
            <div class="NodeModule_outputs"></div>
        </div>
    </div></div>
    <div class="NodeModule_delete"><div class="NodeModule_mdiv">
        <div class="NodeModule_md"></div>
    </div></div>
    </div>`);
    this.el.css({'left': poss.x, 'top': poss.y})
    if(this.settings.Width){
        this.el.css({ 'width': this.settings.Width })
    }
    var that = this;
    this.input.forEach(input => {
        $(input.el).appendTo(that.el.find(".NodeModule_inputs")[0]);
    });
    this.output.forEach(output => {
        $(output.el).appendTo(that.el.find(".NodeModule_outputs")[0]);
    });
    this.field.forEach(field => {
        $(field.el).appendTo(that.el.find(".NodeModule_fields")[0]);
    });


    this.el.find(".NodeModule_delete").click(function() {
        console.log("delete");
        that.Delete();
    });

    $(this.el).appendTo('#NodeModule_flow');   
    $(this.el).draggable(
        { drag: function() {
            that.input.forEach(input => {
                if(input.line != null){
                    input.line.position()
                }
            });
            that.output.forEach(output => {
                if(output.line != null){
                    output.line.position()
                }
            });
        }
    });

    this.ExportBox = function () {
        var fieldsExports = [];
        this.field.forEach(field => {
            var fieldExport = field.Export();
            if(fieldExport != null){
                fieldsExports.push(fieldExport);
            }
        });
        return {
            'UniqId': this.settings.UniqId,
            'RealId': this.id,
            'x': this.el.css('left'),
            'y': this.el.css('top'),
            'fields': fieldsExports
        }
    }
    this.Delete = function () {
        that.input.forEach(input => {
            input.DeleteConnection();
        });
        that.output.forEach(output => {
            output.DeleteConnection();
        });
        that.el.remove();
        for (let i = 0; i < allboxs.length; i++) {
            const box = allboxs[i];
            if(box.id == that.id){
                allboxs.splice(i, 1);
                break;
            }
        }
    }
    this.ExportConnections = function () {
        var connections = [];
        this.output.forEach(output => {
            if(output.connectedTo != null){
                var obj = {
                    'FromID': output.setting.UniqId,
                    'FromRealId': output.parentBox.id,
                    'ToID': output.connectedTo.setting.UniqId,
                    'ToRealId': output.connectedTo.parentBox.id,
                }
                connections.push(obj);
            }
        });
        return connections;
    }
    this.GetInput = function(id) {
        var returnValue = null;
        this.input.forEach(input => {
            if(input.setting.UniqId == id){
                returnValue = input;
                return;
            }
        });
        return returnValue;
    }
    this.GetOutput = function(id) {
        var returnValue = null;
        this.output.forEach(output => {
            if(output.setting.UniqId == id){
                returnValue = output;
                return;
            }
        });
        return returnValue;
    }
    this.RunRules = function () {
        var valid = true;
        this.input.forEach(input => {
            if(!input.RunRules()){
                valid = false;
            }
        });
        this.output.forEach(output => {
            if(!output.RunRules()){
                valid = false;
            }
        });
        this.field.forEach(field => {
            if(!field.RunRules()){
                valid = false;
            }
        });
        return valid;
    }
}

function Node_Input(setting, parentBox) {
    ++unitNumber;
    this.id = unitNumber;
    this.setting = setting;
    this.parentBox = parentBox;
    this.el = $('<div class="NodeModule_input_box"><div class="NodeModule_input" id="'+this.setting.UniqId+'_'+this.id+'"></div><div class="NodeModule_input_text">'+this.setting.Text+'</div></div>');
    this.allow = this.setting.Type;
    this.connectedTo = null;
    this.line = null;
    var that = this;
    this.el.find(".NodeModule_input").click(function() {
        that.AddConnection(activeOutput);
    });
    this.AddConnection = function (output) {
        if(output != null){
            if(output.parentBox != that.parentBox){
                if(that.connectedTo == null){
                    if(that.DoTypeMatch(output.type)){
                        that.DeleteConnection()
                        output.DeleteConnection();
                        that.connectedTo = output;
                        var line = new LeaderLine(
                            $("#" + output.setting.UniqId + "_" + output.id)[0],
                            $("#" + that.setting.UniqId + "_" + that.id)[0],
                            {startSocket: 'right', endSocket: 'left'}
                        ); 
                        that.line = line;
                        connections.push(line);
                        that.line.position();
                        output.connectedTo = that;
                        output.line = that.line;
                        output.RemoveActiveColor();
                        output = null;
                    }else{
                        alert("Wrong type");
                    }
                }else{
                    alert("allready connected");
                }
            }else{
                alert("can not be connect to it self");
            }
        }else{
            alert("intet output valgt");
        }
    }
    this.DoTypeMatch = function (outputTypeList1) {
        var returnValue = false;
        if(Array.isArray(this.allow)){
            this.allow.forEach(allowedType => {
                if(Array.isArray(outputTypeList1)){
                    if(outputTypeList1.includes(allowedType)){
                        returnValue = true;
                        return;
                    }
                }else{
                    if(allowedType == outputTypeList1){
                        returnValue = true;
                        return;
                    }
                }
            });
        }else{
            if(Array.isArray(outputTypeList1)){
                if(outputTypeList1.includes(this.allow)){
                    returnValue = true;
                }
            }else{
                if(this.allow == outputTypeList1){
                    returnValue = true;
                }
            }
        }
        return returnValue;
    }
    this.DeleteConnection = function () {
        if(that.connectedTo != null){
            var oldConection = that.connectedTo;
            oldConection.connectedTo = null;
            that.connectedTo = null;
            const indexOfValue = connections.indexOf(that.line);
            if (indexOfValue >= 0) connections.splice(indexOfValue, 1);
            that.line.remove();
            that.line = null;
            oldConection.line = null;
        }
        
    }
    this.RunRules = function () {
        this.el.find(".NodeModule_input").removeClass("NodeModule_alerts-border");
        if(this.setting.Mandatory && this.connectedTo == null){
            this.el.find(".NodeModule_input").addClass("NodeModule_alerts-border");
            return false;
        }
        return true;
    }
}
function Node_Output(setting, parentBox) {
    ++unitNumber;
    this.id = unitNumber;
    this.setting = setting;
    this.parentBox = parentBox;
    this.el = $('<div class="NodeModule_output_box"><div class="NodeModule_output" id="'+this.setting.UniqId+'_'+this.id+'"></div><div class="NodeModule_output_text">'+this.setting.Text+'</div></div>');
    this.type = this.setting.Type;
    this.connectedTo = null;
    this.line = null;
    var that = this;
    this.el.find(".NodeModule_output").click(function() {
        if(activeOutput != null){
            activeOutput.RemoveActiveColor();
        }
        if(activeOutput != that)
        {
            activeOutput = that;
            activeOutput.SetActiveColor();   
        }else {
            that.DeleteConnection();
        }
    });
    this.DeleteConnection = function () {
        if(that.connectedTo != null){
            var oldConection = that.connectedTo;
            oldConection.connectedTo = null;
            that.connectedTo = null;
            const indexOfValue = connections.indexOf(that.line);
            if (indexOfValue >= 0) connections.splice(indexOfValue, 1);
            that.line.remove();
            that.line = null;
            oldConection.line = null;
            activeOutput = null;
        }
    }
    this.SetActiveColor = function () {
        this.el.find(".NodeModule_output").css({'background-color': 'red'});
    }
    this.RemoveActiveColor = function () {
        this.el.find(".NodeModule_output").css({'background-color': ''});
    }
    this.RunRules = function () {
        this.el.find(".NodeModule_output").removeClass("NodeModule_alerts-border");
        if(this.setting.Mandatory && this.connectedTo == null){
            this.el.find(".NodeModule_output").addClass("NodeModule_alerts-border");
            return false;
        }
        return true;
    }
}


function Node_Field(setting, parentBox, preLoadData = null) {
    ++unitNumber;
    this.id = unitNumber;
    this.setting = setting;
    this.parentBox = parentBox;
    this.elId = this.setting.UniqId+'_'+this.id;
    this.el = $('<div class="NodeModule_field_box" id="'+this.elId+'"></div>');
    this.fieldEl = null;
    if(this.setting.Type == "checkbox"){
        this.fieldEl = new Node_Field_checkbox(this.setting, this, preLoadData);
    }else if(this.setting.Type == "input"){
        this.fieldEl = new Node_Field_input(this.setting, this, preLoadData);
    }else if(this.setting.Type == "radio"){
        this.fieldEl = new Node_Field_radio(this.setting, this, preLoadData);
    }

    if(this.fieldEl != null){
        $(this.fieldEl.el).appendTo(this.el);
    }

    this.Export = function () {
        if(this.fieldEl != null)
            return this.fieldEl.Export();
        return null;
    }
    this.RunRules = function () {
        if(this.fieldEl != null)
            return this.fieldEl.RunRules();
        return true;
    }
}
function Node_Field_radio(setting, parentBox, preLoadData = null) {
    this.setting = setting;
    this.parentBox = parentBox;
    this.localId = `${this.setting.UniqId}_${this.parentBox.id}`;
    var inputHtml = `${this.setting.Text}<br>`;
    for (let i = 0; i < this.setting.Values.length; i++) {
        const checkboxValue = this.setting.Values[i];
        var preloadHtml = "";
        if(preLoadData && preLoadData.checked == i){
            preloadHtml = ` checked="checked"`;
        }
        inputHtml += `<input type="radio" id="${this.localId}_${i}" name="${this.localId}" value="${i}" ${preloadHtml}>
        <label for="${this.localId}_${i}">${checkboxValue}</label><br>`;
    }

    this.el = $(`<div>${inputHtml}</div>`);

    this.Export = function () {
        for (let i = 0; i < this.setting.Values.length; i++) {
            var radioGui = this.el.find(`#${this.localId}_${i}`);
            if(radioGui.is(':checked')){
                return {'fieldID': this.setting.UniqId, 'checked': i};
            }
        }
        return null;
    }
    this.RunRules = function () {
        this.el.removeClass("NodeModule_alerts-border");
        if(this.setting.Mandatory){
            var valid = false;
            for (let i = 0; i < this.setting.Values.length; i++) {
                var radioGui = this.el.find(`#${this.localId}_${i}`);
                if(radioGui.is(':checked')){
                    valid = true;
                    break;
                }
            }
            if(!valid){
                this.el.addClass("NodeModule_alerts-border");
            }
            return valid;
        }
        return true;
    }
}
function Node_Field_input(setting, parentBox, preLoadData = null) {
    this.setting = setting;
    this.parentBox = parentBox;
    var preloadHtml = "";
    if(preLoadData && preLoadData.value != ""){
        preloadHtml = ` value="${preLoadData.value}"`;
    }
    var inputHtml = `<label for="${this.setting.UniqId}">${this.setting.Text}</label>
        <input type="text" id="${this.setting.UniqId}" ${preloadHtml}><br>`;

    this.el = $(`<div>${inputHtml}</div>`);

    this.Export = function () {
        var inputGui = this.el.find(`#${this.setting.UniqId}`);
        if(inputGui.val() != ""){
            return {'fieldID': this.setting.UniqId, 'value': inputGui.val()};
        }
        return null;
    }
    this.RunRules = function () {
        this.el.removeClass("NodeModule_alerts-border");
        if(this.setting.Mandatory){
            var inputGui = this.el.find(`#${this.setting.UniqId}`);
            if(inputGui.val() == ""){
                this.el.addClass("NodeModule_alerts-border");
                return false;
            }
        }
        return true;
    }
}
function Node_Field_checkbox(setting, parentBox, preLoadData = null) {
    this.setting = setting;
    this.parentBox = parentBox;
    var inputHtml = `${this.setting.Text}<br>`;
    for (let i = 0; i < this.setting.Values.length; i++) {
        const checkboxValue = this.setting.Values[i];
        var preloadHtml = "";
        if(preLoadData && preLoadData.checked.includes(i)){
            preloadHtml = ` checked`;
        }
        inputHtml += `<input type="checkbox" id="${this.setting.UniqId}_${i}" value="${i}" ${preloadHtml}>
        <label for="${this.setting.UniqId}_${i}">${checkboxValue}</label><br>`;
    }

    this.el = $(`<div>${inputHtml}</div>`);
    
    this.Export = function () {
        var checkedList = [];
        for (let i = 0; i < this.setting.Values.length; i++) {
            var checkBoxGui = this.el.find(`#${this.setting.UniqId}_${i}`);
            if(checkBoxGui.is(':checked')){
                checkedList.push(i)
            }
        }
        if(checkedList.length > 0){
            return {'fieldID': this.setting.UniqId, 'checked': checkedList};
        }
        return null;
    }
    this.RunRules = function () {
        this.el.removeClass("NodeModule_alerts-border");
        if(this.setting.mandatory){
            var valid = false;
            for (let i = 0; i < this.setting.Values.length; i++) {
                var checkBoxGui = this.el.find(`#${this.setting.UniqId}_${i}`);
                if(checkBoxGui.is(':checked')){
                    valid = true;
                    break;
                }
            }
            if(!valid){
                this.el.addClass("NodeModule_alerts-border");
            }
            return valid;
        }
        return true;
    }
}