chrome.runtime.sendMessage({
    check: "userSettings"
}, function(n) {
    console.log(n);
    var userSettings = n.userSettings;
    var TheUserAgent = "";
    var theDomain = extractHostname(window.location.href);

    for (var d in userSettings) {
        var userDomain = extractHostname(userSettings[d].domain);

        if (theDomain.indexOf(userDomain) !== -1) {
            TheUserAgent = userSettings[d].agent;
            break;
        }
    }
    if(TheUserAgent != ""){
        console.log('using '  + TheUserAgent);
        var t = document.createElement("script");
        t.type = "text/javascript", t.text = "navigator.__defineGetter__('userAgent', function () { return '" + TheUserAgent + "'; });", document.getElementsByTagName("head")[0].appendChild(t);
    }
});

function extractHostname(url) {
    var hostname;

    if (url.indexOf("://") > -1) {
        hostname = url.split('/')[2];
    } else {
        hostname = url.split('/')[0];
    }

    hostname = hostname.split(':')[0];
    hostname = hostname.split('?')[0];

    return hostname.replace('www.', '');
}
