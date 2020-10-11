
    // Defining our jQuery plugin
    var modal_box = function(prop){
        var $ = jQuery;
        // Default parameters
        var options = $.extend({
            height : "250",
            width : "600",
            title:"Modal title",
            description: "modal box.",
            top: "20%",
            left: "30%",
            showCancel: true,
            doneButton: "Ok",
            cancelButton: "Cancel",
            doneRulesCallback: function (callback) { callback(true)  }, // can be called to ensure we are allowed to click done
            callback: function () {}
        },prop);

        
         function add_styles(){         
            $('.modalDialog_modal_box').css({ 
                'position':'absolute', 
                'left':options.left,
                'top':options.top,
                'display':'none',
                'height': 'auto',
                'width': options.width + 'px',
                'border':'1px solid rgba(0,0,0,.2)',
                'border-radius': '.3rem',
                'padding': '12px',
                'background': '#fff', 
                'z-index':'50',
            });
            /*Block page overlay*/
            var pageHeight = $(document).height();
            var pageWidth = $(window).width();

            $('.modalDialog_block_page').css({
                'position':'absolute',
                'top':'0',
                'left':'0',
                'background-color':'rgba(0,0,0,0.6)',
                'height':pageHeight,
                'width':pageWidth,
                'z-index':'1000000000'
            });
            
            $('.modalDialog_modal_content').css({
                'float':'left',
                'display':'block',
                'height':'auto',
                'width':'100%',
            });
            
            $('.modalDialog_modal_content_button').css({
                'float':'left',
                'buttom': '0px',
                'display':'block',
                'width':'100%',
            });
        }

         function add_block_page(){
            var block_page = $('<div class="modalDialog_block_page"></div>');

            $(block_page).appendTo('body');
        }

        function add_popup_box(){
            var pop_up = $(`<div class="modalDialog_modal_box">
                <div  class="modalDialog_modal_content">
                    <h2 style="text-align: center;">${ options.title }</h2>
                    <p style="text-align: center;">${ options.description }</p>
                </div>
                <div class="modalDialog_modal_content_button">
                    <div style="text-align: center;"> 
                        <a href="#" class="btn btn-primary modalDialog_modal_Done" type="button" style="float:right;">${ options.doneButton }</a>
                        ${ options.showCancel ? `<a href="#" class="btn btn-secondary modalDialog_modal_close" type="button" style="float:right;margin-right:15px;" >${ options.cancelButton }</a>` : "" }                    
                    </div>
                </div>
             </div>`);
            $(pop_up).appendTo('.modalDialog_block_page');

            $('.modalDialog_modal_close').click(function(event){
                event.preventDefault();
                options.callback(false);
                $('.modalDialog_block_page').fadeOut().remove();
            });
            $('.modalDialog_modal_Done').click(function(event){
                event.preventDefault();
                options.doneRulesCallback(function (valid) {
                    if(valid){
                        options.callback(true);
                        $('.modalDialog_block_page').fadeOut().remove(); 
                    }
                })
            });
        }
        this.show = function () {
            add_block_page();
            add_popup_box();
            add_styles();
            
            $('.modalDialog_modal_box').fadeIn();
        }
        return this;
    };
