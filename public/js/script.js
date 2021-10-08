// use #! to hash
var activePageName = null;
router = new Navigo(null, true, '#!');
router.on({
    // 'view' is the id of the div element inside which we render the HTML
    'Bots': () => { 
        beforeChacePage();
        ChanceMenu("Bots");
        LoadBotPage();
        console.log("Bots");
    },
    'Idle': () => { 
        beforeChacePage();
        ChanceMenu("Idle");
        LoadIdlePage();
        console.log("Idle");
    },
    'Chat': () => { 
        beforeChacePage();
        ChanceMenu("Chat");
        $("#view").html("Chat"); 
        console.log("Chat");
    },
    'Modules': () => { 
        beforeChacePage();
        ChanceMenu("Modules");
        LoadModulesPage();
        console.log("Modules");
    },
    'Nodes': () => { 
        beforeChacePage();
        ChanceMenu("Nodes");
        LoadNodesPage();
        console.log("Nodes");
    },
    'debugCall': () => { 
        //ChanceMenu("debugCall");
        
    }
});

// set the default route
router.on(() => { $('#view').html('<h2>Here by default</h2>'); });

// set the 404 route
router.notFound((query) => { $('#view').html('<h3>Couldn\'t find the page you\'re looking for...</h3>'); });

router.resolve();
function beforeChacePage() {
    for (var i = connections.length - 1; i >= 0; i--) {
        const connection = connections[i];
        connection.remove();
        connections.splice(i, 1);
    }
}
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