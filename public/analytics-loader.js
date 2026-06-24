/**
 * Analytics loader — loaded as a regular script (NOT module),
 * so it doesn't enter the critical module graph.
 * Injected by App.tsx via useEffect (after first paint).
 */
(function() {
  const MIXPANEL_TOKEN = "4afda88244640b3af6bf932b2c022eec";
  
  // Mixpanel standard snippet (carrega a lib real, não o wrapper)
  (function(f,b){if(!b.__SV){var e,g,i,h;window.mixpanel=b;b._i=[];b.init=function(e,f,c){function g(a,d){var b=d.split(".");2==b.length&&(a=a[b[0]],d=b[1]);a[d]=function(){a.push([d].concat(Array.prototype.slice.call(arguments,0)))}}var a=b;"undefined"!==typeof c?a=b[c]=[]:c="mixpanel";a.people=a.people||[];a.toString=function(a){var d="mixpanel";"mixpanel"!==c&&(d+="."+c);a||(d+=" (stub)");return d};a.people.toString=function(){return a.toString(1)+".people (stub)"};i="disable time_event track track_pageview track_links track_forms register register_once alias unregister identify name_tag set_config reset people.set people.set_once people.increment people.append people.union people.track_charge people.clear_charges people.delete_user".split(" ");for(h=0;h<i.length;h++)g(a,i[h]);b._i.push([e,f,c])};b.__SV=1.2;e=f.createElement("script");e.type="text/javascript";e.async=!0;e.src="https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";g=f.getElementsByTagName("script")[0];g.parentNode.insertBefore(e,g)}})(document,window.mixpanel||[]);
  
  // Init when ready
  function init() {
    if (window.mixpanel && window.mixpanel.init) {
      window.mixpanel.init(MIXPANEL_TOKEN, {
        autocapture: true,
        track_pageview: true,
        persistence: "localStorage",
      });
    }
  }
  
  if (document.readyState === "complete") {
    setTimeout(init, 3000);
  } else {
    window.addEventListener("load", () => setTimeout(init, 3000));
  }
  
  // GTM — desktop only
  function initGTM() {
    if (window.innerWidth < 768) return;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function(){window.dataLayer.push(arguments);};
    window.gtag('js', new Date());
    window.gtag('config', 'G-3XTNX614JK');
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=G-3XTNX614JK';
    document.head.appendChild(s);
  }
  
  window.addEventListener("load", () => setTimeout(initGTM, 3000));
})();
