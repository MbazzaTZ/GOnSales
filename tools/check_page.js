const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const http = require('http');

(async () => {
  try {
    const url = 'http://127.0.0.1:8000/';
    const res = await fetch(url);
    const html = await res.text();

    const dom = new JSDOM(html, {
      url,
      runScripts: 'dangerously',
      resources: 'usable',
      pretendToBeVisual: true
    });

    const { window } = dom;

    // capture console and errors
    window.consoleMessages = [];
    const origConsole = window.console;
    window.console = {
      log: (...args) => origConsole.log('[page]', ...args),
      warn: (...args) => origConsole.warn('[page WARN]', ...args),
      error: (...args) => origConsole.error('[page ERROR]', ...args),
      info: (...args) => origConsole.info('[page INFO]', ...args)
    };

    window.addEventListener('error', (ev) => {
      console.error('Page runtime error:', ev.error ? ev.error.stack : ev.message);
    });

    // wait for resources
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => resolve(), 2500);
      window.addEventListener('load', () => {
        clearTimeout(timeout);
        resolve();
      });
    });

    console.log('Page loaded; running quick checks...');

    // check for key elements
    const markers = ['dashboard-metrics', 'sales-log-table', 'salesTrendChart', 'main.js'];
    markers.forEach(m => {
      const found = !!window.document.getElementById(m) || (window.document.querySelector && window.document.querySelector(m));
      console.log(`marker ${m}: ${found}`);
    });

    // look for any uncaught errors reported on window
    console.log('Finished checks.');
    process.exit(0);
  } catch (err) {
    console.error('Checker encountered error:', err.stack || err.message || err);
    process.exit(2);
  }
})();
