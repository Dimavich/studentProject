$(document).ready(function () {
   $('select').formSelect();

   //Predefined surfing locations and their coordinates
   var surfSpot = [
      { name: "Select beach" },
      { name: "Santa Cruz", lat: 36.952005, lng: -122.001477 },
      { name: "Pacifica", lat: 37.606077, lng: -122.513127 },
      { name: "Asilomar State Beach", lat: 36.618758, lng: -121.943070 },
      { name: "Newport Beach", lat: 33.599058, lng: -117.939925 },
      { name: "San Diego", lat: 32.702983, lng: -117.291659 },
   ];


   var displayStormglassData = function (fetchedData) {
      var airTemp = fetchedData.hours[0].airTemperature.noaa;
 //Converting to Fahrenheit
      airTemp = ((airTemp * (9 / 5)) + 32).toFixed(2);
      $("#airTemp").html("<p class='black-text'>Current Temperature</p>" + airTemp + " °F");

      var waveHeight = fetchedData.hours[0].waveHeight.noaa;
 //Converting to feet and rounding to 2 decimal points.
      waveHeight = (waveHeight * 3.281).toFixed(2);
      $("#waveHeight").text(waveHeight + "ft");

   };

 //Fetching gifs from Giphy API

 var fetchGifs = function () {
   var surfConditions = "";

      if (waveHeight < 2) {
       surfConditions = "Today is a good day for surfing!" ;
    } else if (waveHeight > 2) {
       surfConditions = "Surfing today is not recommended.";
    } else {
        surfConditions = "Today is a good day for surfing!";
    }

      var off = Math.floor(Math.random() * 20 + 1);

      // Searching gifs using Giphy API with "surfing" keyword and display on the page
      fetch(
         `https://api.giphy.com/v1/gifs/search?q=
        surfing&api_key=Bp3XvQZse87d1YsB5T7Cpl5akJIKvcNg&limit=1&offset=${off}`
      )

         .then(function (response) {
            if (response.ok) {
               return response.json();
            } else {
               throw new Error('Something went wrong');
            }
         })
         .then(function (response) {
            var giphyResponse = document.querySelector('.waves-giphy');

            giphyResponse.innerHTML = "";

            var giphyimage = document.createElement('img');
            giphyimage.setAttribute('src', response.data[0].images.fixed_height.url);

            giphyResponse.appendChild(giphyimage);

         })
         .catch((error) => {
            console.log(error)
         });

    //Display surf conditions description and append to page as text

      var surfConditionsEl = document.querySelector("#surf-recommendation");

      surfConditionsEl.innerHTML = surfConditions;

   };


   var fetchStormglassData = function (lat, lng) {

      // Convert time to UTC time, required to pass into the fetch parameter
     var currentTime = Math.floor((new Date().getTime()) / 1000);


      var params = "airTemperature,waveHeight";
      apiKey = "07a15aca-a88d-11eb-9cd1-0242ac130002-07a15b42-a88d-11eb-9cd1-0242ac130002"

      fetch(`https://api.stormglass.io/v2/weather/point?lat=${lat}&lng=${lng}&params=${params}&start=${currentTime}&end=${currentTime}&source=noaa`, {
         headers: {
            'Authorization': apiKey
         }
      }).then((response) => {
         if (response.ok) {
            response.json().then((jsonData) => {
               displayStormglassData(jsonData);

             // Calling gif API based on Stormglass data

               fetchGifs(jsonData);
            });
         }
         else {
            document.querySelector(".modal-bg").style.display = "flex";
         };
      });
   };

  //Adding event listener for when the beach is selected
  var beachSelect = document.querySelector('#select');

   beachSelect.addEventListener("change", function (event) {
      // set variable for index value of selection
      var selection = document.getElementById("select").value;

      // converting the lat and lng to correspond with the selected beach
      var lat = surfSpot[event.target.value].lat;
      var lng = surfSpot[event.target.value].lng;
      var beachName = surfSpot[event.target.value].name;

      // Storing last search and lat lng in local storage
      localStorage.setItem("last-beach-name", beachName);
      localStorage.setItem("last-selection", selection);
      localStorage.setItem("last-lat", lat);
      localStorage.setItem("last-lng", lng);
      // Fetching new lat and lng variables form Stormglass
      fetchStormglassData(lat, lng);
     
      document.getElementById("current-beach").innerHTML = beachName;

   });


//To store values and get from local storage and show the last chosen beach.

   if (localStorage.getItem("last-selection")) {
      var defaultOpt = document.getElementById("default");
      defaultOpt.setAttribute("selected", "false");

      // set the value of the selected option to equal the last selection value in local storage
      beachSelect.selectedIndex = localStorage.getItem("last-selection");
      lat = localStorage.getItem("last-lat");
      lng = localStorage.getItem("last-lng");

      var lastSelection = beachSelect.options[beachSelect.selectedIndex];
      lastSelection.setAttribute("selected", "true");

      fetchStormglassData(lat, lng);

      document.getElementById("current-beach").innerHTML = localStorage.getItem("last-beach-name");
   } else {
      beachSelect.selectedIndex = "-1";
   }

});