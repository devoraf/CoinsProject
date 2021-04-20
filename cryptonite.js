//global variables
let arrSelectedCoins = [];
let arrModalNonSelectedCoins = [];
let arrCoins = [];
let fsyms = "";
let cardsHTML = "";
let counter = 0;
let selectedCoin;
let chartInterval;
let modalSaveClicked = false;

  /* On modal click, determine where the click occurs and set the variable accordingly */
  $('#selectedCoinsModal').on('click', function (e) {
    if ($(e.target).hasClass("btn-warning")) {
      modalSaveClicked = true;
      $('#selectedCoinsModal').modal('hide');
    }
    else
      modalSaveClicked = false;
  });

/* activate nav item when clicking on it */
$('.nav-item').on('click', function(){
    $('.nav-item').removeClass('active');
    $(this).addClass('active');
});

/* collapse hamburger menu after clicking on a link - for mobile */
$('.navbar-collapse a').click(function(){
  $(".navbar-collapse").collapse('hide');
});

/* handle coins selection */
$(document).on('change', '.switch', (e)=>{
  // toggle is off
  if (!e.target.checked) {
      let index = arrSelectedCoins.indexOf(e.target.id);
      arrSelectedCoins.splice(index, 1);
  // toggle is on
  } else {
      if (arrSelectedCoins.length == 5) {
        selectedCoin = e.target;
        displayModal();
    } else 
      arrSelectedCoins.push(e.target.id)
  }
});

/* handle coins selection on modal dialog */
$(document).on('change', '.modalSwitch', (e)=> {
  // toggle is off
  if (!e.target.checked) {
    arrModalNonSelectedCoins.push(e.target.id)
  // toggle is on
  } else {
    let index = arrModalNonSelectedCoins.indexOf(e.target.id);
    arrModalNonSelectedCoins.splice(index, 1);
  }
});

/* display modal window with selected coins */
function displayModal() {

  $("#modalGrid").empty();
  for (let i = 0; i < 5 ;i++) {

    $("#modalGrid").append(`
    <div>
      <label class="modalSwitch">
      <input type="checkbox" checked id="${arrSelectedCoins[i]}">
      <span class="slider round"></span>
    </div>
    <div><span>${arrSelectedCoins[i].toUpperCase()}</span></div>  
    </div>`)

    }
    arrModalNonSelectedCoins = []
    $('#selectedCoinsModal').modal();
}

/* actions to be done after the modal window is closed */
$('#selectedCoinsModal').on('hidden.bs.modal', function () {

  if (modalSaveClicked) {
    if (arrModalNonSelectedCoins.length == 0)
      selectedCoin.checked = false;
    else {
       for (let i = 0; i < arrModalNonSelectedCoins.length; i++) {
          let id = `${arrModalNonSelectedCoins[i]}`;
          let index = arrSelectedCoins.indexOf(id);
          arrSelectedCoins.splice(index, 1);
          $(`#${id}`).prop('checked', false);
       }
       arrSelectedCoins.push(selectedCoin.id);
    }
  }
  else 
    selectedCoin.checked = false;
});

/* search button is clicked */
function searchCoin() {

    let symbol = $("#search").val();
    // search text is not empty
    if (symbol) {

      // enable search from all screens - not yet implemented
      // currently search is avilable only from Coins screen
      // if ($('.mainContainer').find('.card-deck-wrapper').length == 0) 
      //   coinsClicked()

      // search coin
      let index= arrCoins.findIndex(x => x.name === symbol.toUpperCase())
      // coin found
      if (index >= 0) {   
        // get html of the coin 
        let html = $(`#card${arrCoins[index].id}`)[0].outerHTML;
        
        // save html of all cards
        cardsHTML = $(".card-deck").html();
        // display coin 
        $(".card-deck").empty();
        $(".card-deck").append(html);
        if (isCoinSelected(symbol))
          $(`#${symbol}`).prop('checked', true);

      }    
  }
}

/* display all coins in search mode */
function redisplayCoins() {
  $(".card-deck").empty();
  $(".card-deck").append(cardsHTML);
  for (let i = 0; i < arrSelectedCoins.length; i++) 
    $(`#${arrSelectedCoins[i]}`).prop('checked', true);
}

/* the enter or x button of the search input field, is being clicked */
function onSearch() {
  // if field is empty - display all coins 
  if ($("#search").val() == "" && cardsHTML != "") 
    redisplayCoins();
}

function searchChanged() {
  if (cardsHTML != "") 
    redisplayCoins();
}

/* current time formatting */
function getCurrentTime() {
    let now = new Date(Date.now());
    let fnow =  (now.getHours() < 10 ? "0" : "") + now.getHours() + ":" + 
                (now.getMinutes() < 10 ? "0" : "") + now.getMinutes() + ":" + 
                (now.getSeconds() < 10 ? "0" : "") + now.getSeconds();
    return fnow;
}

/* render chart every 2 seconds */
function updateChart (chart){

  currentTime = getCurrentTime();
  
  $.get(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${fsyms}&tsyms=USD`, (data)=> {
      let index = 0;
      for(coin in data) {
          chart.options.data[index].dataPoints.push({label: currentTime, y: data[coin].USD});
          index++;
      }
      chart.render(); 
  });            
};

/* display chart for the first time */
function initChart(data) {

    $('.mainContainer').empty();

    // no data available for the selected coin
    if (data.Response == "Error") {
      $('.mainContainer').append(`<div class="chartError"><span class="error">${data.Message}</span></div>`);
      return;
    }

    $('.mainContainer').append(`<div id="chartContainer"></div>`);

    let chart = new CanvasJS.Chart("chartContainer");
    
    currentTime = getCurrentTime();

    chart.options.title = { text: `${fsyms} to USD`, fontSize: 20, fontFamily: "Arial", fontWeight: "bold"};
    chart.options.data = [];

    for(coin in data) {
        let series = {
            type: "line",
            name: coin,
            showInLegend: true
        };
        
        chart.options.data.push(series);
        series.dataPoints = [ 
            { label: currentTime, y: data[coin].USD }
        ];

      }
    
    chart.render();

    // update chart every 2 seconds
    chartInterval = setInterval(()=>{updateChart(chart)}, 2000);
}

/* display spinner while loading data*/
function displaySpinner() {

    $('.mainContainer').empty();
    $('.mainContainer').append(`
    <div class="loading d-flex justify-content-center align-items-center">
        <img src="imgs/Loading_icon.gif" alt="Loading..."></div>
    </div>
    </div>`);
}

/* home */
function homeClicked() {

  clearInterval(chartInterval);
  $('.btn').prop("disabled", true).addClass("ui-state-disabled");
  $('#search').prop("disabled", true).addClass("ui-state-disabled");

  $('.mainContainer').empty();
  $('.mainContainer').append(
      `<div class="parallax"></div>
      <div class="welcome">
          <span><h1>Welcome to Cryptonite</h1>
                <h2>A decentralized network of digital currency</h2>
          </span>
      </div>
      <div class="parallax"></div>`
  ); 
}

/* coins */
function coinsClicked() {
 
    clearInterval(chartInterval);
    $('.btn').prop("disabled", false).removeClass("ui-state-disabled");
    $('#search').prop("disabled", false).removeClass("ui-state-disabled");
    $('.mainContainer').css({"background" : "rgb(191, 150, 93)"});

    displaySpinner();
    getCoinsList();
}

/* reports */
function reportsClicked() {

  clearInterval(chartInterval);
  $('.btn').prop("disabled", true).addClass("ui-state-disabled");
    $('#search').prop("disabled", true).addClass("ui-state-disabled");
     $('.mainContainer').css({"background" : "white"});

  if (arrSelectedCoins.length == 0) {
    let err = "No coins have selected. Please select a coin for being displayed in the report"
    $('.mainContainer').empty();
    $('.mainContainer').append(`<div class="chartError"><span class="error">${err}</span></div>`);
    return;
  }
  displaySpinner();
  getMultipleCoins();
}

/* about */
function aboutClicked() {

    clearInterval(chartInterval);

     $('.mainContainer').css({"background" : "white"});
    $('.btn').prop("disabled", true).addClass("ui-state-disabled");
    $('#search').prop("disabled", true).addClass("ui-state-disabled");

    $('.mainContainer').empty();
    $('.mainContainer').append(`
    <div class="aboutContainer">
      <span class="aboutContent">
        <img src="imgs/aboutme.jpg" width="400px" height="285px" style="margin-bottom: 20px;">
        <h3>Devora Fodor</h3>
        
        <h4>A student at John Bryce</h4>
        <h4>Full Stack Course</h4>
        <h6>May - Jul 2019</h6>
        </span>   
    </div>

    `); 
}

/* a menu item on the navbar is being clicked */
function navbar_onclick() {
  // $('.mainContainer').css({"background" : "white"});
}

/* get selected coins data */
function getMultipleCoins() {

  fsyms = "";
  for (let i = 0; i < arrSelectedCoins.length; i++)
    fsyms += (fsyms != "" ? "," : "") + arrSelectedCoins[i].toUpperCase();
  
  $.get(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=${fsyms}&tsyms=USD`, initChart);
}

/* get all coins list */
function getCoinsList() {
    
    $.get(`https://api.coingecko.com/api/v3/coins/list`,displayCoins);
}

/* display cards of the coins */
function displayCoins(value){
  
   $('.mainContainer').css({"background" : "rgb(191, 150, 93)"});
   $(".mainContainer").empty();
   $(".mainContainer").append(`<div class="card-deck-wrapper"><div class="card-deck"></div></div>`);
        for(let i=0 ; i<100 ; i+=1) {  
            arrCoins[i]={id:value[i].id,name:value[i].symbol.toUpperCase()}
            $(".card-deck").append(`
            <div class="card text-white text-center border-0" id="card${value[i].id}" >
                <div class="card-body">
                    <h5 class="card-title">${value[i].symbol.toUpperCase()}</h5>
                    <p class="card-text">${value[i].name}</p>                           
                    <div class="card_buttons">
                        <div class="card_toggle">
                            <label class="switch">
                            <input type="checkbox" id= "${value[i].symbol}" ${isCoinSelected(value[i].symbol).toUpperCase()}>
                            <span class="slider round"></span>
                        </div>
                        <div class="card_info">
                            <button class="btn btn-outline-warning info" id= "${value[i].id}">Info</button>
                        </div> 
                    </div>         
                  </div>
                <div class="card-footer">
                    <div class="spinner-border spinner-border-sm text-warning" role="status" id="spinner${value[i].id}" style="display: none;">
                    <span class="sr-only">Loading...</span>
                    </div>
                    <span id="details${value[i].id}"></span>
                </div>  
            </div>`);
        }
      }
                    
      //collapser for more info
      $(document).on('click', '.info', (e)=> {
        // info is open - hide it
        if ($("#details"+e.target.id +" > p").size() > 0) {
          $("#details"+e.target.id).hide();
          $("#details"+e.target.id).empty()
        } else {
          // info was not clicked yet - get data from API
          if (!localStorage.getItem(e.target.id)) {
            $("#spinner"+e.target.id).show();
            $.get(`https://api.coingecko.com/api/v3/coins/${e.target.id}`, (value)=>{
          
                let storageValue= `<p style="line-height: normal;"><img src=${value.image.thumb}><br>
                $${value.market_data.current_price.usd}<br>
                &euro;${value.market_data.current_price.eur}<br>
                &#8362; ${value.market_data.current_price.ils}</p>`

                localStorage.setItem(e.target.id,storageValue)
              
                $("#details"+e.target.id).append(storageValue)
                $("#details"+e.target.id).show("slow");
                $("#spinner"+e.target.id).hide();
            })
          // info was clicked already - get data from local storage
          }else{
            $("#details"+e.target.id).empty()
            $("#details"+e.target.id).append(localStorage.getItem(e.target.id))
            $("#details"+e.target.id).show("slow");
          } 
          // set timout for reset info after 2 seconds
        setTimeout(()=>{
          localStorage.removeItem(e.target.id)
          $("#details"+e.target.id).parent().empty()
        }, 120000);
      }     
 })

 /* check if a coin is selected or not */
 function isCoinSelected(symbol) {
   
  if (arrSelectedCoins.indexOf(symbol) == -1)
    return "";
  else
    return "checked";
 }