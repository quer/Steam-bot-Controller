// use #! to hash
var activePageName = null;
router = new Navigo(null, true, '#!');
router.on({
    // 'view' is the id of the div element inside which we render the HTML
    'Bots': () => { 
        ChanceMenu("Bots");
        LoadBotPage();
        console.log("Bots");
    },
    'Idle': () => { 
        ChanceMenu("Idle");
        LoadIdlePage();
        console.log("Idle");
    },
    'Chat': () => { 
        ChanceMenu("Chat");
        $("#view").html("Chat"); 
        console.log("Chat");
    },
    'Modules': () => { 
        ChanceMenu("Modules");
        $("#view").html("Modules"); 
        console.log("Modules");
    },
    'debugCall': () => { 
        ChanceMenu("debugCall");
        $("#view").html("debugCall"); 
        console.log("debugCall");
        
        $.ajax({
            url: "/Api/debugCall"
        }).done(function( data ) {

        })
        $.ajax({
            method: "GET",
            url: "Api/GetBotIdleGameList",
            dataType: "json",
            traditional: true,
            data: { 
                loginName: "botclient0"
            }
        })
        .done(function( data ) {
            callback(true);
        });
    }
});

// set the default route
router.on(() => { $('#view').html('<h2>Here by default</h2>'); });

// set the 404 route
router.notFound((query) => { $('#view').html('<h3>Couldn\'t find the page you\'re looking for...</h3>'); });

router.resolve();

function ChanceMenu(newMenu) {
    activePageName = newMenu;
    var menuItems = $("#menuItems li a");
    for (let i = 0; i < menuItems.length; i++) {
        const menuItem = menuItems[i];
        $(menuItem).removeClass("active");
        if($(menuItem).attr("href") == newMenu){
            $(menuItem).addClass("active");
        }
    }
}