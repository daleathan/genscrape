var debug = require('debug')('main'),
    Emitter = require('events').EventEmitter,
    utils = require('./utils');

/**
 * Main genscrape function.
 * Compare current location to the list of urls
 * registered by the scrapers to find a scraper
 * that can handle this page.
 * Return an EventEmitter object.
 */
var genscrape = function(){
  var emitter = new Emitter();
  var thisUrl = window.location.href;
  debug('url', thisUrl);
  
  var match = false;
  utils.forEach(scrapers, function(scraper){
    utils.forEach(scraper.urls, function(regex){
      debug(regex);
      if(regex.test(thisUrl)){
        debug('match');
        match = true;
        scraper.scraper(emitter);
        // Short-circuit on match
        return false;
      }
    });
    // Short-circuit on match
    if(match) return false;
  });
  
  // Nothing matched. Return basic EventEmitter
  // that will send a 'noMatch' event.
  if(!match){
    debug('no match');
    setTimeout(function(){
      emitter.emit('noMatch');
    });
  }
  
  return emitter;
};

var scrapers = genscrape._scrapers = [];

/**
 * Register a scraper.
 * Give an array of regex for matching urls
 * and a function to call which begins the process
 * of scraping and returns an EventEmitter object.
 */
var register = genscrape.register = function(urls, scraper){
  // TODO: prevent duplicate registration
  debug('register');
  if(utils.isArray(urls) && utils.isFunction(scraper)){
    scrapers.push({
      urls: urls,
      scraper: scraper
    });
  }
};

module.exports = genscrape;

// Include scrapers. This is primarily done so that
// browserify can find and include them.
// TODO: find a method that allows us to dynamically include all scrapers
require('./scrapers/fs-record')(register);
require('./scrapers/fs-ancestor')(register);