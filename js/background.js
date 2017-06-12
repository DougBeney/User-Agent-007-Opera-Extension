//chrome.storage.sync.set({userSettings: undefined});

var userSettings = [];

var requestFilter = {
    urls: ['<all_urls>']
};
var extraInfoSpec = ['requestHeaders', 'blocking'];

var handler = function(details) {
    chrome.storage.sync.get(function(items) {
        userSettings = items.userSettings;
    });

    var headers = details.requestHeaders;
    var blockingResponse = {};
    var TheUserAgent = "";

    if (details.tabId >= 0) {
        var allSitesAgent = false;
        var allSitesAgent_Agent = "";
        for (var d in userSettings) {
            if(userSettings[d].domain == "*"){
                allSitesAgent = true;
                allSitesAgent_Agent = userSettings[d].agent;
                break;
            }
        }
        for (var d in userSettings) {
            var userDomain = extractHostname(userSettings[d].domain);
            var theCurHostname = extractHostname(details.url);

            if (theCurHostname.indexOf(userDomain) !== -1) {
                TheUserAgent = userSettings[d].agent;
                for (var i = 0, l = headers.length; i < l; ++i) {
                    if (headers[i].name == 'User-Agent') {
                        headers[i].value = TheUserAgent;
                        break;
                    }
                }
                break;
            }else if(allSitesAgent){
                for (var i = 0, l = headers.length; i < l; ++i) {
                    if (headers[i].name == 'User-Agent') {
                        headers[i].value = allSitesAgent_Agent;
                        break;
                    }
                }
            }
        }

    }

    blockingResponse.requestHeaders = headers;
    return blockingResponse;
};

chrome.webRequest.onBeforeSendHeaders.addListener(handler, requestFilter, extraInfoSpec);

chrome.runtime.onMessage.addListener(function(n, t, i) {
	i({
		userSettings: userSettings
	});
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
