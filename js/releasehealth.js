/* -*- Mode: C++; tab-width: 8; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set ts=8 sts=2 et sw=2 tw=80: */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

$(document).ready(function () {
  $.getJSON('js/bzconfig.json', function(bzconfig) {
    $.getJSON(bzconfig.VERSIONS_URL, function(fxversions) {
      main(bzconfig, fxversions);
    });
  });
});

function main(bzconfig, fxversions) {
  BUGZILLA_URL = bzconfig.BUGZILLA_URL;
  BUGZILLA_REST_URL = bzconfig.BUGZILLA_REST_URL;
  versions = bzconfig.versions;
  bugQueries = bzconfig.bugQueries;

  versions['nightly'].version = fxversions.FIREFOX_NIGHTLY.split('.', 1)[0];
  versions['beta'].version = fxversions.LATEST_FIREFOX_DEVEL_VERSION.split('.', 1)[0];
  versions['release'].version = fxversions.LATEST_FIREFOX_VERSION.split('.', 1)[0];

  var channel = getChannel();
  var version = versions[channel].version;

  // Add a class name to the body element that corresponds to the channel, allows per channel css
  document.body.classList.add(channel);

  // Display title
  $("#title").text(versions[channel].title + " " + versions[channel].version);

  displayMeasures();

  // if there is a display=bigscreen parameter in the url, we hide some clutter (office TV displays)
  if (getURLParam('display') === 'bigscreen') {
    document.body.classList.add("bigscreen");
  }

  addVersionToQueryURLs(version);

  getBugCounts(version);

  // Update counts periodically
  window.setInterval(getBugCounts, bzconfig.refreshMinutes * 60 * 1000, version);
}

function getChannel() {
  var channel = getURLParam('channel');
  if (channel && ['release', 'beta', 'nightly'].includes(channel)) {
    return channel;
  }
  // By default, without a query parameter in the url, we display Beta
  return "beta";
}

function getURLParam(param) {
  return new URLSearchParams(window.location.search).get(param);
}

function displayMeasures() {
  for (var i = 0; i < bugQueries.length; i++) {
    var query = bugQueries[i];
    $("#" + query.id).replaceWith("<div class=\"bugcount\"><h2>"
                                  + query.title + "</h2>"
                                  + "<div id=\"data" + i + "\""
                                  + " class=\"data greyedout\">?</div></div>");
  }
}

function addVersionToQueryURLs(release) {
  for (var i = 0; i < bugQueries.length; i++) {
    var url = bugQueries[i].url;
    url = url.replace(/{RELEASE}/g, release);
    url = url.replace(/{OLDERRELEASE}/g, release-1);
    bugQueries[i].url = url;
  }
}

function getBugCounts(release) {
  for (var i = 0; i < bugQueries.length; i++) {
    var bugQuery = bugQueries[i];
    $.ajax({
      url: BUGZILLA_REST_URL + bugQuery.url + '&count_only=1',
      bugQuery: bugQuery,
      index: i,
      crossDomain:true,
      dataType: 'json',
      ifModified: true,
      success: function(data, status) {
        if (status === 'success') {
          this.bugQuery.count = data.bug_count;
          displayCount(this.index, this.bugQuery.count,
                       BUGZILLA_URL + this.bugQuery.url);
        }
      },
      error: function(jqXHR, textStatus, errorThrown) {
        console.error(textStatus);
      }
    });
  }
}

function displayCount(index, count, url) {
  $("#data" + index).replaceWith("<div class=\"data\"><a href=\"" + url
                                 + "\">" + count + "</a></div>" );
}
