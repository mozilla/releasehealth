/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

var BIG_SCREEN = "bigscreen";
var SMALL_SCREEN = "smallscreen";

var BUGZILLA_URL;
var BUGZILLA_REST_URL;
var versions;
var bugQueries;

$(document).ready(function () {
	$.getJSON('js/bzconfig.json', function(data) {
		main(data);
	});
});

function main(bzconfig){
	BUGZILLA_URL = bzconfig.BUGZILLA_URL;
	BUGZILLA_REST_URL = bzconfig.BUGZILLA_REST_URL;
	versions = bzconfig.versions;
	bugQueries = bzconfig.bugQueries;

	var channel = getChannel();
	var display = getDisplay();
	var version = getVersion(channel);
	
	displayTitle(channel);
	displayMeasures();
	
	if(display !== BIG_SCREEN){
		displayForkOnGitHub();
		displayChannelFooter(channel);
	}
	
	addVersionToQueryURLs(version);
	
	getBugCounts(version);
	
}

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
	$("#title").append(versions[channel].title + " " + versions[channel].version);
	if(channel == "aurora" || channel == "nightly"){
		$("#title").attr("class", "title-light");
		$("#subtitle").attr("class", "subtitle title-light");
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
	$("#body").append("<span id=\"forkongithub\"><a href=\"https://github.com/mozilla/ReleaseHealth\">Fork me on GitHub</a></span>");
}

function displayChannelFooter(channel){
	$("#body").append("<div id=\"footer\" class=\"footer-" + channel + "\">Channel &gt; <a href=\"?channel=release\">Release</a> | <a href=\"?channel=beta\">Beta</a> | <a href=\"?channel=aurora\">Developer Edition</a> | <a href=\"?channel=nightly\">Nightly</a></div>");
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
