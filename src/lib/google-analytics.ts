// Существующий ресурс владельца; просмотры SPA учитываются Enhanced Measurement.
export const GOOGLE_ANALYTICS_BOOTSTRAP = `(function(){
  if(location.hostname!=="optika100.com"&&location.hostname!=="www.optika100.com")return;
  if(document.getElementById("o100-ga4"))return;
  window.dataLayer=window.dataLayer||[];
  window.gtag=window.gtag||function(){window.dataLayer.push(arguments);};
  window.gtag("js",new Date());
  window.gtag("config","G-167W399Z32");
  var script=document.createElement("script");
  script.id="o100-ga4";
  script.async=true;
  script.src="https://www.googletagmanager.com/gtag/js?id=G-167W399Z32";
  document.head.appendChild(script);
})();`;
