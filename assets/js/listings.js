(function(){
  "use strict";

  function ready(fn){
    if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",fn);
    else fn();
  }

  ready(function(){
    var grid=document.querySelector("[data-listings-grid]");
    if(!grid) return;

    var cards=Array.prototype.slice.call(grid.querySelectorAll(".listing-card[data-listing-id]"));
    var search=document.querySelector("[data-listing-search]");
    var filters=Array.prototype.slice.call(document.querySelectorAll("[data-listing-filter]"));
    var summary=document.querySelector("[data-listing-summary]");
    var active="all";

    function apply(){
      var query=(search&&search.value||"").trim().toLowerCase();
      var shown=0;
      cards.forEach(function(card){
        var category=(card.getAttribute("data-category")||"").toLowerCase();
        var hay=(card.textContent||"").toLowerCase();
        var visible=(active==="all"||category===active)&&(!query||hay.indexOf(query)!==-1);
        card.hidden=!visible;
        if(visible) shown+=1;
      });
      if(summary) summary.textContent=shown+" of "+cards.length+" opportunities shown";
    }

    filters.forEach(function(button){
      button.addEventListener("click",function(){
        active=button.getAttribute("data-listing-filter")||"all";
        filters.forEach(function(item){item.setAttribute("aria-pressed",String(item===button));});
        apply();
        if(window.BBAS&&window.BBAS.track){
          window.BBAS.track("listing_filter",{event_category:"listing",listing_category:active});
        }
      });
    });
    if(search) search.addEventListener("input",apply);
    apply();
  });
})();
