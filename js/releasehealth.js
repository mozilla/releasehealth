var versions = {"release": 43, 
				"beta": 44,
				"aurora": 45, 
				"nightly": 46}; 

var bugQueries = [{"id": "blockingDiv",
	               "title": "Blocking",
				   "url": "https://bugzilla.mozilla.org/rest/bug?o1=equals&v1=blocking&f1=cf_tracking_firefox{RELEASE}&resolution=---&query_format=advanced&include_fields=id",},
				  {"id": "newRegressionDiv",
				   "title": "New Regressions",
				   "url": "https://bugzilla.mozilla.org/rest/bug?v4=%3F&o5=equals&keywords=regression%2C&keywords_type=allwords&f1=cf_status_firefox{RELEASE}&o3=equals&v3=unaffected&o1=equals&j2=OR&resolution=---&f4=cf_status_firefox{OLDERRELEASE}&v5=---&f3=cf_status_firefox{OLDERRELEASE}&f2=OP&o4=equals&f5=cf_status_firefox{OLDERRELEASE}&v1=affected&f6=CP&include_fields=id"},
				  {"id": "knowRegressionDiv",
				   "title": "Known Regressions",
				   "url": "https://bugzilla.mozilla.org/rest/bug?v4=%3F&o5=equals&n2=1&keywords=regression%2C&keywords_type=allwords&f1=cf_status_firefox{RELEASE}&o3=equals&v3=unaffected&o1=equals&j2=OR&resolution=---&f4=cf_status_firefox{OLDERRELEASE}&v5=---&f3=cf_status_firefox{OLDERRELEASE}&f2=OP&o4=equals&f5=cf_status_firefox{OLDERRELEASE}&v1=affected&f6=CP&include_fields=id"}];
					


$(document).ready(function () {
	var version = getVersion();
	
	addVersionToQueryURLs(version);
	
	getBugCounts(version);
	
});

function getVersion(){
	var version = $.url().param('version');
	if(version && (version === "release" || version === "beta" || version === "aurora" || version === "nightly")){
		return versions[version];
	}
	return versions.beta;
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
	$("#" + divId).replaceWith( "<div>" + title + ": " + count + "</div>" )
}