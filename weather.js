var data = {}
var storage = []
function getDate(offset) {
  var d = new Date()
  d.setDate(d.getDate() + offset)
  var date = `${d.getMonth()}/${d.getDate()}/${d.getFullYear()}`
  return date
}

function updateList(searchWord) {
  storage = JSON.parse(localStorage.getItem("storage"))
  if (storage == null) {
    storage = []
  }

  if (searchWord !== null) {
    storage.push(searchWord)
    localStorage.setItem("storage", JSON.stringify(storage))
  }
  var searchList = $("#list")
  var list = ""
  for (var i = 0; i < storage.length; i++) {
    list = list + `
      <li>${storage[i]}</li>
    `

  }
  searchList.html(list);
} 
$(document).ready(function () {

  updateList(null)

  $(".btn-search").on("click", function (e) {
    //$('.search-results').empty()



    var apiKey = "37aefb1e9a2ea4a79898d7dd44ee984f"
    var searchWord = $('#keywords').val()
    console.log("search word: " + searchWord)


    updateList(searchWord)


    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + searchWord + "&appid=" + apiKey + "&units=imperial";

    $.ajax({
      url: queryURL,
      method: "GET"
    }).then(function (response) {
      console.log(response)
      data.temp = response.main.temp
      data.humidity = response.main.humidity
      data.wind = response.wind.speed
      data.city = response.name
      data.lat = response.coord.lat
      data.lon = response.coord.lon

      var queryURL = "https://api.openweathermap.org/data/2.5/uvi?lat=" + data.lat + "&lon=" + data.lon + "&appid=" + apiKey
      uvPromise = $.ajax({
        url: queryURL,
        method: "GET"
      }).done(function (response) {
        console.log(response)
        data.uv = response.value
      })

      var queryURL = "https://api.openweathermap.org/data/2.5/onecall?lat=" + data.lat + "&lon=" + data.lon + "&appid=" + apiKey + "&units=imperial";
      forecastPromise = $.ajax({
        url: queryURL,
        method: "GET"
      }).done(function (response) {
        console.log(response)
        data.daily = response.daily
      })

      return Promise.all([uvPromise, forecastPromise])
    }).done(function (response) {



      var weatherInfo = $("#today")
      weatherInfo.html(`
        <div class="card">
          <div class="card-content">
            <header>
              <div class="card-title">
                ${data.city} -
                ${getDate(0)}
              </div>
            </header>
          <div class="card horizontal weather-info">
            <div class="row align-wrapper">
              <div class="card-image col s3">
              </div>
              <div class="col s3 center-align">
                <span class="temp">High: ${data.temp}</span>
              </div>
            <div class="card-stacked">
              <div class="card-content">
                <ul>
                  <li>Humidity: ${data.humidity}</li>
                  <li>Wind Speed: ${data.wind}</li>
                  <li>UV Index: <span class="index">${data.uv}</span></li>
                </ul> 
              </div>
            </div>
          </div>
        </div>
    `);


      var weatherInfo = $("#cards")
      var daily = ""
      for (var i = 1; i < 6; i++) {
        var day = data.daily[i]
        var temp = day.temp.max
        var humidity = day.humidity
        daily = daily + `
          <div class="col">
           <div class="card" style="width: auto;">
             <div class="card-body">
                <h5 class="card-title">${getDate(i)}</h5>
                <h6 class="card-subtitle mb-2">High: ${temp}</h6>
                <p class="card-text">Humidity: ${humidity}%</p>
              </div>
            </div>
          </div>
        `


      }
      weatherInfo.html(daily);




    })
    return false;
  })
})







