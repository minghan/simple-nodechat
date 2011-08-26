/*****************************
    Configurations
*****************************/

var globals = {
    'port': 8337,
    'password': 'pakrox'
};


/*****************************
    Includes
*****************************/


net = require("net");


/*****************************
    Snippets
*****************************/

// From http://snippets.dzone.com/posts/show/701
String.prototype.trim = function() {
    return this.replace(/^\s+|\s+$/, '');
};


/*****************************
    Classes
*****************************/

function User(socket) {
    this.socket = socket;
    this.username = 'anonymous';

    // current defined states are:
    // login, identify, ok
    this.state = 'login'; 

    this.init();

}

User.prototype = {
    init: function() {
        this.socket.setEncoding("utf8");
    },

    identify: function(username) {
        this.username = username;
    }

};

// pretty print (singleton)
var PP = {
    
    msg: function(username, text) {
        return this.user(username) + " " + text.trim() + "\n";
    },

    user: function(username) {
        return "<" + username + ">";
    }

};



/*****************************
    Server Stuff
*****************************/

var users = [];


var s = net.Server(function(socket) {

    var user = new User(socket);
    users.push(user);

    socket.on('connect', function() {
        socket.write("Enter the password: ");
    });

    socket.on('data', function(data) {
        if (user.state == 'login') {
            data = data.trim();
            if (data == globals.password) {
                socket.write("Enter your username: ");
                user.state = "identify";
            } else {
                socket.destroy();
            }
            return;
        }

        if (user.state == 'identify') {
            var username = data.trim();
            user.identify(username);
            socket.write("==> Congratulations! You are now logined!\n");
            user.state = "ok";
            return;
        }

        // the `ok` state
        
        users.forEach(function(someuser) {
            if (someuser == user) return;

            someuser.socket.write(PP.msg(user.username, data));
        });

    });

    socket.on('end', function() {
        var i = users.indexOf(user);
        users.splice(i, 1);
    });

});

s.listen(globals.port);

console.log("Chat server started on port " + globals.port);

