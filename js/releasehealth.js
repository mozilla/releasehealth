var BIG_SCREEN = "bigscreen";
var SMALL_SCREEN = "smallscreen";

var BUGZILLA_URL = "https://bugzilla.mozilla.org/buglist.cgi";
var BUGZILLA_REST_URL = "https://bugzilla.mozilla.org/rest/bug"

var versions = {"release": {"version": 44, "title": "Firefox", "img": "images/firefox.png"},
				"beta": {"version": 45, "title": "Beta", "img": "images/firefox-beta.png"},
				"aurora": {"version": 46, "title": "Developer Edition", "img": "images/firefox-developer.png"}, 
				"nightly": {"version": 47, "title": "Nightly", "img": "images/firefox-nightly.png"}
			   }

var bugQueries = [{"id": "blockingDiv",
	               "title": "Blocking Release",
				   "url": "?o1=equals&v1=blocking&f1=cf_tracking_firefox{RELEASE}&resolution=---&query_format=advanced&include_fields=id",},
				  {"id": "newRegressionDiv",
				   "title": "New Regressions",
				   "url": "?v4=%3F&o5=equals&keywords=regression%2C&keywords_type=allwords&f1=cf_status_firefox{RELEASE}&o3=equals&v3=unaffected&o1=equals&j2=OR&resolution=---&f4=cf_status_firefox{OLDERRELEASE}&v5=---&f3=cf_status_firefox{OLDERRELEASE}&f2=OP&o4=equals&f5=cf_status_firefox{OLDERRELEASE}&v1=affected&f6=CP&include_fields=id"},
				  {"id": "knowRegressionDiv",
				   "title": "Carryover Regressions",
				   "url": "?v4=%3F&o5=equals&n2=1&keywords=regression%2C&keywords_type=allwords&f1=cf_status_firefox{RELEASE}&o3=equals&v3=unaffected&o1=equals&j2=OR&resolution=---&f4=cf_status_firefox{OLDERRELEASE}&v5=---&f3=cf_status_firefox{OLDERRELEASE}&f2=OP&o4=equals&f5=cf_status_firefox{OLDERRELEASE}&v1=affected&f6=CP&include_fields=id"}];
					


$(document).ready(function () {
	var channel = getChannel();
	var display = getDisplay();
	var version = getVersion(channel);
	
	displayTitle(channel);
	displayMeasures();
	
	if(display !== BIG_SCREEN){
		displayForkOnGitHub();
	}
	
	addVersionToQueryURLs(version);
	
	getBugCounts(version);
	
});

function getChannel(){
	var channel = $.url().param('channel');
	if(channel && (channel === "release" || channel === "beta" || channel === "aurora" || channel === "nightly")){
		return channel;
	}
	return "beta";
}

function getDisplay(){
	var display = $.url().param('display');
	if(display && (display === BIG_SCREEN)){
		return BIG_SCREEN;
	}
	return SMALL_SCREEN;
}

function getVersion(channel){
	return versions[channel].version;
}

function displayTitle(channel){
	$("#title").append(versions[channel].title + " " + versions[channel].version + " Bug Count");
	if(channel == "aurora" || channel == "nightly"){
		$("#title").attr("class", "title-light");
	}
	$("#title-img").attr("src",versions[channel].img);
	$("#header-bg").attr("class", "header-bg header-bg-" + channel);
}

function displayMeasures(){
	for(var i = 0; i < bugQueries.length; i++){
		var query = bugQueries[i];
		$("#" + query.id).replaceWith( "<div class=\"bugcount\"><h2>" + query.title + "</h2><div id=\"data" + i + "\" class=\"data greyedout\">?</div></div>" );
	}
	
}

function displayForkOnGitHub(){
	$("#body").append("<span id=\"forkongithub\"><a href=\"https://github.com/lmandel/ReleaseHealth\">Fork me on GitHub</a></span>");
}

function addVersionToQueryURLs(release){
	for(var i = 0; i < bugQueries.length; i++){
		var url = bugQueries[i].url
		url = url.replace(/{RELEASE}/g, release);
		url = url.replace(/{OLDERRELEASE}/g, release-1);
		bugQueries[i].url = url;
	}
}

function getBugCounts(release){
	for(var i = 0; i < bugQueries.length; i++){
		var bugQuery = bugQueries[i];
		$.ajax({
			  url: BUGZILLA_REST_URL + bugQuery.url,
			  bugQuery: bugQuery,
			  index: i,
			  crossDomain:true, 
			  dataType: 'json',
			  success: function(data){
			    this.bugQuery.count = data.bugs.length;
			    displayCount(this.index, this.bugQuery.count, BUGZILLA_URL + this.bugQuery.url);
			  },
			  error: function(jqXHR, textStatus, errorThrown){
				alert(textStatus);
			  }
		});
	}
}

function displayCount(index, count, url){
	$("#data" + index).replaceWith( "<div class=\"data\"><a href=\"" + url + "\">" + count + "</a></div>" )
}