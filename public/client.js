/**
 * Webchat basierend auf Node.js
 * - basierend auf https://github.com/nodecode/Node.js-Chat
 * - jetzt in geil
 * 
 * @author Alexander Ochs, http://noxmiles.de
 * 
 * + + LICENCES + +
 * Notification Sound:
 * https://notificationsounds.com/notification-sounds/you-wouldnt-believe-510
 * Licensed under the Creative Commons Attribution license
 * 
 * Icons from www.flaticon.com
 * flash by 'freepik' http://www.flaticon.com/packs/photography-skills
 * speaker by 'Madebyoliver' http://www.flaticon.com/packs/essential-set-2
 * sun/moon by 'Vectors Market' http://www.flaticon.com/packs/weather-elements
 */

$(document).ready(function () {
    var socket = io.connect();
    var isActive = true;
    var hasNotofication = false;
    var audio = new Audio("you-wouldnt-believe.mp3");
    var timeVar = new Date().getTime();
    var playSound = true;
    var soundDelay = 1;
    var showFlash = true;

    // # # #   F U N K T I O N E N   # # #

    function timeBigger(time) {
        var timeTemp = new Date().getTime();
        if (((timeTemp - timeVar) / 1000) > time) {
            return true;
        } else {
            return false;
        }
    }

    function getCookie(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(";");
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == " ") {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

    window.onfocus = function () {
        isActive = true;
        PageTitleNotification.Off();
        hasNotofication = false;
    };

    window.onblur = function () {
        isActive = false;
    };

    var PageTitleNotification = {
        Vars: {
            OriginalTitle: document.title,
            Interval: null
        },
        On: function (notification, intervalSpeed) {
            hasNotofication = true;
            var _this = this;
            _this.Vars.Interval = setInterval(function () {
                document.title = (_this.Vars.OriginalTitle == document.title) ?
                    notification :
                    _this.Vars.OriginalTitle;
            }, (intervalSpeed) ? intervalSpeed : 2000);
        },
        Off: function () {
            hasNotofication = false;
            clearInterval(this.Vars.Interval);
            document.title = this.Vars.OriginalTitle;
        }
    };

    function checkSound() {
        switch (document.getElementById("sound").textContent) {
            case "0":
                playSound = false;
                break;
            case "1":
                soundDelay = 0;
                playSound = true;
                break;
            case "60":
                soundDelay = 60;
                playSound = true;
                break;
            case "5":
                soundDelay = 5 * 60;
                playSound = true;
                break;
            case "10":
                soundDelay = 10 * 60;
                playSound = true;
                break;
            case "30":
                soundDelay = 30 * 60;
                playSound = true;
                break;
        }
    }

    function checkFlash() {
        if (document.getElementById("flash").textContent == "1") {
            showFlash = true;
            //alert(showFlash);
        } else {
            showFlash = false;
            //alert(showFlash);
        }
    }

    function senden() {
        // Eingabefelder auslesen
        var name = $('#name').val();
        var text = $('#text').val();
        name = name; // + " (" + ip + ")";
        if (text.length > 1000) {
            text = text.substring(0, 1000);
        }

        // Socket senden
        if (text.length > 0) {
            socket.emit('chat', {
                name: name,
                text: text
            });
        }

        // Clear Textfeld
        $('#text').val('');

        // Cookie backen
        document.cookie = "name=" + $('#name').val();
    }





    // # # #   S E I T E   # # #

    if (getCookie("flash") == "0") {
        document.getElementById("flash").style.background = "#ddd url('flash-off.png') no-repeat center";
        document.getElementById("flash").textContent = "0";
        showFlash = false;
    }

    if (getCookie("style") == "dark") {
        document.getElementById("myCSS").href = "style-dark.css";
        document.getElementById("style").style.background = "#ddd url('night.png') no-repeat center";
    }

    switch (getCookie("sound")) {
        case "0":
            playSound = false;
            document.getElementById("sound").textContent = "0";
            document.getElementById("sound").style.background = "#ddd url('speaker0.png') no-repeat center";
            break;
        case "1":
            soundDelay = 0;
            document.getElementById("sound").textContent = "1";
            document.getElementById("sound").style.background = "#ddd url('speaker1.png') no-repeat center";
            break;
        case "60":
            soundDelay = 60;
            document.getElementById("sound").textContent = "60";
            document.getElementById("sound").style.background = "#ddd url('speaker60.png') no-repeat center";
            break;
        case "5":
            soundDelay = 5 * 60;
            document.getElementById("sound").textContent = "5";
            document.getElementById("sound").style.background = "#ddd url('speaker5.png') no-repeat center";
            break;
        case "10":
            soundDelay = 10 * 60;
            document.getElementById("sound").textContent = "10";
            document.getElementById("sound").style.background = "#ddd url('speaker10.png') no-repeat center";
            break;
        case "30":
            soundDelay = 30 * 60;
            document.getElementById("sound").textContent = "30";
            document.getElementById("sound").style.background = "#ddd url('speaker30.png') no-repeat center";
            break;
    }

    document.getElementById("name").value = getCookie("name");

    socket.on('chat', function (data) {
        var zeit = new Date(data.zeit);

        if (data.bold) {
            $('#content').append(
                $('<li></li>').append(
                    // Uhrzeit
                    $('<span id="time">').text('[' +
                        (zeit.getHours() < 10 ? '0' + zeit.getHours() : zeit.getHours()) +
                        ':' +
                        (zeit.getMinutes() < 10 ? '0' + zeit.getMinutes() : zeit.getMinutes()) +
                        '] '
                    ),
                    // Name
                    $('<b>').text(typeof (data.name) != 'undefined' ? data.name + ': ' : ''),
                    // Text
                    $('<span style="font-weight: bold;">').text(data.text))
            );
        } else {
            $('#content').append(
                $('<li></li>').append(
                    $('<span id="time">').text('[' +
                        (zeit.getHours() < 10 ? '0' + zeit.getHours() : zeit.getHours()) +
                        ':' +
                        (zeit.getMinutes() < 10 ? '0' + zeit.getMinutes() : zeit.getMinutes()) +
                        '] '
                    ),
                    $('<b>').text(typeof (data.name) != 'undefined' ? data.name + ': ' : ''),
                    $('<span>').text(data.text))
            );
        }

        // nach unten scrollen
        $('body').scrollTop($('body')[0].scrollHeight);

        checkSound();
        checkFlash();
        if (isActive === false && hasNotofication === false && showFlash === true) {
            PageTitleNotification.On("Neue Nachricht");
        }
        if (isActive === false && timeBigger(soundDelay) && playSound) {
            audio.play();
            timeVar = new Date().getTime();
        }
    });


    // Text senden
    $('#senden').click(senden);
    $('#text').keypress(function (e) {
        if (e.which == 13) {
            senden();
        }
    });



    // Hash function - not in use
    /*
    var hash = 0;
    for (i = 0; i < help.length; i++) {
        char = help.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    name = name + " #" + (hash >>> 0).toString(16).toUpperCase();
    */
});