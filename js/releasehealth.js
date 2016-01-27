var versions = {"release": {"version": 44, "title": "Firefox", "img": "images/firefox.png"},
				"beta": {"version": 45, "title": "Beta", "img": "images/firefox-beta.png"},
				"aurora": {"version": 46, "title": "Developer Edition", "img": "images/firefox-developer.png"}, 
				"nightly": {"version": 47, "title": "Nightly", "img": "images/firefox-nightly.png"}
			   }

var bugQueries = [{"id": "blockingDiv",
	               "title": "Blocking",
				   "url": "https://bugzilla.mozilla.org/rest/bug?o1=equals&v1=blocking&f1=cf_tracking_firefox{RELEASE}&resolution=---&query_format=advanced&include_fields=id",},
				  {"id": "newRegressionDiv",
				   "title": "New Regressions",
				   "url": "https://bugzilla.mozilla.org/rest/bug?v4=%3F&o5=equals&keywords=regression%2C&keywords_type=allwords&f1=cf_status_firefox{RELEASE}&o3=equals&v3=unaffected&o1=equals&j2=OR&resolution=---&f4=cf_status_firefox{OLDERRELEASE}&v5=---&f3=cf_status_firefox{OLDERRELEASE}&f2=OP&o4=equals&f5=cf_status_firefox{OLDERRELEASE}&v1=affected&f6=CP&include_fields=id"},
				  {"id": "knowRegressionDiv",
				   "title": "Carryover Regressions",
				   "url": "https://bugzilla.mozilla.org/rest/bug?v4=%3F&o5=equals&n2=1&keywords=regression%2C&keywords_type=allwords&f1=cf_status_firefox{RELEASE}&o3=equals&v3=unaffected&o1=equals&j2=OR&resolution=---&f4=cf_status_firefox{OLDERRELEASE}&v5=---&f3=cf_status_firefox{OLDERRELEASE}&f2=OP&o4=equals&f5=cf_status_firefox{OLDERRELEASE}&v1=affected&f6=CP&include_fields=id"}];
					


$(document).ready(function () {
	var channel = getChannel();
	var version = getVersion(channel);
	
	setTitle(channel);
	
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

function getVersion(channel){
	return versions[channel].version;
}

function setTitle(channel){
	$("#title").append(versions[channel].title + " Bug Count");
	if(channel == "aurora" || channel == "nightly"){
		$("#title").attr("class", "title-light");
	}
	$("#title-img").attr("src",versions[channel].img);
	$("#header-bg").attr("class", "header-bg header-bg-" + channel);
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
			  url: bugQuery.url,
			  bugQuery: bugQuery,
			  crossDomain:true, 
			  dataType: 'json',
			  success: function(data){
			    this.bugQuery.count = data.bugs.length;
			    displayCount(this.bugQuery.id, this.bugQuery.title, this.bugQuery.count);
			  },
			  error: function(jqXHR, textStatus, errorThrown){
				alert(textStatus);
			  }
		});
	}
}

function displayCount(divId, title, count){
	$("#" + divId).replaceWith( "<div class=\"bugcount\"><h2>" + title + "</h2><div class=\"data\">" + count + "</div></div>" )
}