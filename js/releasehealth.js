/* -*- Mode: C++; tab-width: 8; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set ts=8 sts=2 et sw=2 tw=80: */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Impalement the Firefox Release Health Dashboard.
 */
class ReleaseHealth {
  /**
   * Initialize a new `ReleaseHealth` instance.
   */
  constructor() {
    this.params = new URLSearchParams(location.search);
    this.channel = this.getChannel();

    this.loadConfig();

    // Add a class name to the body element that corresponds to the channel, allows per channel CSS
    document.body.classList.add(this.channel);

    // If there is a `display=bigscreen` parameter in the URL, we hide some clutter (office TV displays)
    if (this.params.get('display') === 'bigscreen') {
      document.body.classList.add('bigscreen');
    }
  }

  /**
   * Get a channel name in the URL params. Use the Beta channel by default if missing.
   * @returns {String} Channel name, e.g. "beta".
   */
  getChannel() {
    const channel = this.params.get('channel');

    return channel && ['release', 'beta', 'nightly'].includes(channel) ? channel : 'beta';
  }

  /**
   * Fetch a remote JSON file and return the results.
   * @param {String} url URL to fetch.
   * @returns {Promise.<Object>} Decoded JSON.
   */
  async getJSON(url) {
    return fetch(url).then(response => response.json());
  }

  /**
   * Load the configuration file as well as product details.
   */
  async loadConfig() {
    this.config = await this.getJSON('js/bzconfig.json');
    this.versions = await this.getJSON(this.config.VERSIONS_URL);

    for (const channel of Object.values(this.config.channels)) {
      channel.version = Number(this.versions[channel.pd_key].match(/^\d+/)[0]);
    }

    this.renderUI();
  }

  /**
   * Start rendering the UI.
   */
  renderUI() {
    const { title, version } = this.config.channels[this.channel];

    document.querySelector('#title').textContent = `${title} ${version}`;

    this.addVersionToQueryURLs(version);
    this.displayMeasures();
    this.getBugCounts();

    // Update counts periodically
    window.setInterval(() => this.getBugCounts(), this.config.refreshMinutes * 60 * 1000);
  }

  /**
   * Replace version placeholders in the query URL.
   * @param {Number} version Firefox version number, e.g. 70.
   */
  addVersionToQueryURLs(version) {
    for (const query of this.config.bugQueries) {
      query.url = query.url.replace(/{RELEASE}/g, version).replace(/{OLDERRELEASE}/g, version - 1);
    }
  }

  /**
   * Display the measures with a placeholder.
   */
  displayMeasures() {
    for (const { id, title, url } of this.config.bugQueries) {
      document.querySelector(`#${id}`).innerHTML =
        `<h2>${title}<h2><a class="data greyedout" href="${this.config.BUGZILLA_URL}${url}">?</a>`;
    }
  }

  /**
   * Fetch the number of bugs for all the queries.
   */
  getBugCounts() {
    for (const query of this.config.bugQueries) {
      // Use an inner `async` so the loop continues
      (async () => {
        const { bug_count } = await this.getJSON(`${this.config.BUGZILLA_REST_URL}${query.url}&count_only=1`);

        if (bug_count !== undefined) {
          query.count = bug_count;
          this.displayCount(query);
        }
      })();
    }
  }

  /**
   * Display the number of bugs for a query.
   * @param {String} id Element ID.
   * @param {Number} count Number of bugs.
   */
  displayCount({ id, count }) {
    const $placeholder = document.querySelector(`#${id} .data`);

    $placeholder.textContent = count;
    $placeholder.classList.remove('greyedout');
  }
};

window.addEventListener('DOMContentLoaded', () => new ReleaseHealth(), { once: true });
