var versions = {"release": 43, 
				"beta": 44,
				"aurora": 45, 
				"nightly": 46}; 

var bugQueries = [{"id": "blockingDiv",
	               "title": "Blocking",
				   "url": "https://bugzilla.mozilla.org/rest/bug?o1=equals&v1=blocking&f1=cf_tracking_firefox" + "45" + "&resolution=---&query_format=advanced&include_fields=id",},
				  {"id": "newRegressionDiv",
				   "title": "New Regressions",
				   "url": "https://bugzilla.mozilla.org/rest/bug?v4=%3F&o5=equals&keywords=regression%2C%20&keywords_type=allwords&f1=cf_status_firefox45&o3=equals&list_id=12797573&v3=unaffected&columnlist=bug_severity%2Cpriority%2Cop_sys%2Cassigned_to%2Cbug_status%2Cresolution%2Cshort_desc%2Cchangeddate%2Cproduct%2Ccomponent%2Ckeywords%2Ccf_blocking_b2g%2Cflagtypes.name%2Ccf_status_firefox43%2Ccf_status_firefox44%2Ccf_status_firefox45&o1=equals&j2=OR&resolution=---&f4=cf_status_firefox44&v5=---&query_format=advanced&f3=cf_status_firefox44&f2=OP&o4=equals&f5=cf_status_firefox44&v1=affected&f6=CP&include_fields=id"},
				  {"id": "knowRegressionDiv",
				   "title": "Known Regressions",
				   "url": "https://bugzilla.mozilla.org/rest/bug?v4=%3F&o5=equals&n2=1&keywords=regression%2C%20&keywords_type=allwords&f1=cf_status_firefox45&o3=equals&list_id=12797575&v3=unaffected&columnlist=bug_severity%2Cpriority%2Cop_sys%2Cassigned_to%2Cbug_status%2Cresolution%2Cshort_desc%2Cchangeddate%2Cproduct%2Ccomponent%2Ckeywords%2Ccf_blocking_b2g%2Cflagtypes.name%2Ccf_status_firefox43%2Ccf_status_firefox44%2Ccf_status_firefox45&o1=equals&j2=OR&resolution=---&f4=cf_status_firefox44&v5=---&query_format=advanced&f3=cf_status_firefox44&f2=OP&o4=equals&f5=cf_status_firefox44&v1=affected&f6=CP&include_fields=id"}];
					


$(document).ready(function () {
	var release = versions.aurora;
	
	getBugCounts(release);
	
});

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