//Commented out previous format using a drop-down menu for preselected locations
/*$(document).ready(function () {
   $('select').formSelect();*/

   //Predefined surfing locations and their coordinates
  /* var surfSpot = [
      { name: "Select beach" },
      { name: "Half Moon Bay", lat: 37.479500, lng: -122.455873 },
      { name: "Santa Cruz", lat: 36.952005, lng: -122.001477 },
      { name: "Pacifica", lat: 37.606077, lng: -122.513127 },
      { name: "Pismo Beach", lat: 35.140374, lng: -120.648411 },
      { name: "Santa Barbara", lat: 34.408765, lng: -119.804104 },
      { name: "San Diego", lat: 32.702983, lng: -117.291659 },
   ];*/

 
//Function to get current weather and display in main-weather div:
var date = moment().format('MMMM Do YYYY');
var apiKey = '4e4c7ba3fe27e6a028d58369839454fe';
var locationEl = $('.location');
var tempEl = $('.main-temp');
var hiEl = $('.high');
var lowEl = $('.low');

function getWeather(city) {
   var weatherURL = 'https://api.openweathermap.org/data/2.5/weather?q=' + city + '&units=imperial' + '&appid=' + apiKey;
   $.ajax({
       url: weatherURL,
       method: 'GET',
   }).then(function (weatherResponse) {
       weather = weatherResponse;
     
       var temp = (weather.main.temp).toFixed(0);

       var icon = weatherResponse.weather[0].icon;
       var iconSrc = 'https://openweathermap.org/img/wn/' + icon + '@2x.png';
     
       locationEl.text(weather.name + ' (' + date + ')');
      
       tempEl.text('Temperature: ' + temp + '°F');

       hiEl.text(weather.main.temp_min).toFixed(0);

       lowEl.text(weather.main.temp_max).toFixed(0);
      
       })
   }


$('#search-btn').on('click', function (event) {
   event.preventDefault();
   var city = $('#search-bar').val().trim();
   var citiesSearched = JSON.parse(localStorage.getItem('citiesSearched'));
   if (citiesSearched == null) {
       citiesSearched = [];
   }
   citiesSearched.unshift(city);
   var citiesPast = localStorage.setItem('citiesSearched', JSON.stringify(citiesSearched));
   addCityButton(city);
   getWeather(city);
})

/*Function to create and display buttons for each location searched. TO-DO:
write a function to clear values/reset search upon reload or something*/
function addCityButton(city) {
   $('#th').text('Previous Cities Searched');
   var newSearch = $('<tr id="previousSearch">');
   var cityButton = $('<button id=' + city + ' class=btn>').text(city);
   newSearch.append(cityButton);
   cityButton.on('click', function () {
       getWeather(city);
   })
   $('#cityButton').prepend(newSearch);
}


window.onload = function () {
   var citiesPast = JSON.parse(localStorage.getItem('citiesSearched'));
   console.log(citiesPast);
   if (citiesPast == null) {
       citiesPast = [];
   }

   for (i = 0; i < citiesPast.length; i++) {
       if (citiesPast[i] != null) {
           addCityButton(citiesPast[i]);
       }
   }

   if (citiesPast.length > 0) {
       getWeather(citiesPast[0]);
   }
}

////////////Start of Stormglass API for getting wave height.///////////////
   var displayStormglassData = function (fetchedData) {
      //var airTemp = fetchedData.hours[0].airTemperature.noaa;
 //Converting to Fahrenheit
      //airTemp = ((airTemp * (9 / 5)) + 32).toFixed(2);
      //$(".main-temp").html("<p class='black-text'>Current Temperature</p>" + airTemp + " °F");

      var waveHeight = fetchedData.hours[0].waveHeight.noaa;
 //Converting to feet and rounding to 2 decimal points.
      waveHeight = (waveHeight * 3.281).toFixed(2);
      $(".wave-report").text(waveHeight + "ft");

   };

//TO-DO: Review below to see where to display on the HTML or if we want to use this at all
 
//Fetching gifs from Giphy API. Not sure where to display this on the HTML

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
            var giphyResponse = document.querySelector('.wave-report');

            giphyResponse.innerHTML = "";

            var giphyimage = document.createElement('img');
            giphyimage.setAttribute('src', response.data[0].images.fixed_height.url);

            giphyResponse.appendChild(giphyimage);

         })
         .catch((error) => {
            console.log(error)
         });

    //Display surf conditions description and append to page as text

      var surfConditionsEl = document.querySelector(".wave-report");

      surfConditionsEl.innerHTML = surfConditions;

   };

//TO-DO: Need to work out how to display wave height from Stormglass and where in the HTML
   var fetchStormglassData = function (lat, lng) {

      // Convert time to UTC time, required to pass into the fetch parameter
     var currentTime = Math.floor((new Date().getTime()) / 1000);


      var params = "waveHeight";
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
            document.querySelector(".wave-report").style.display = "flex";
         };
      });
   };