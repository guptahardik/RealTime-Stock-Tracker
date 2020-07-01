// Hardik Gupta
// Applied for EdPlus Student Developer Position

var companyInList = {};
// This object will contain the current price and stock symbol will be it's key.
// Making a hash table for the companies as it has  O(1) lookup time.

var xy = 0;// To check how many times have the prices been updated.

//This function will run in every 5 seconds to update stock prices.
 setInterval(function(){
     var boolCheck = Object.keys(companyInList).length;
     // This variable has the value of size of our hash map.
     // This will prevent the google charts and api call to load if there is nothing.

     var offset = new Date().getTimezoneOffset();// getting offset to make time in gmt+0 zone (UTC) (for gmt+5 offset comes as -300 minutes)
     var date = new Date(); // New Variable to set date.
     date.setMinutes ( date.getMinutes() + offset);// date now in UTC time

     var easternTimeOffset = -240; //for dayLight saving, Eastern time become 4 hours behind UTC thats why its offset is -4x60 = -240 minutes. So when Day light is not active the offset will be -300
     date.setMinutes ( date.getMinutes() + easternTimeOffset);
     console.log(date); //With Daylight saving, time in new york as NYSE operates from 9:30 AM to 4:00 PM.

     if(!(date.getDay() == 0 || date.getDay() == 6)){ // Market is closed Sundays and Saturdays.
         console.log("It is a day when stock market is open"); //Console tells if market open today.
         if((date.getHours() >= 9 && date.getMinutes() >=30) && date.getHours() <16 ) {
             console.log("Market is open Currently");
             if (boolCheck != 0) {
                 APICall(); // Calls the API call function which updates all stock symbol prices.
                 initialize(); // Calls google charts to update the values of prices.
                 console.log('---------------------------------------');
                 console.log(xy); // Prints out to the console.
                 xy++; // Increments the value such that we can know count of how many times this function
                 // has been repeated in console.
             }
         }else{
             console.log("Market is closed right now.");
         }
     }else{
         console.log("Market is closed today.");
     }


}, 5000); // It makes sure it times out in 5 seconds and runs again.



function addCompany() {
    //This function is called when we press Add button in HTML.

    var ul = document.getElementById("companyList");
    var companyName = document.getElementById("companyName");
    if(companyName.value.toUpperCase() in companyInList){
        // Checks if the symbol already exists in the list,
        // if exists will give this alert
        alert("Stock Symbol Already In The List!!");
    }else {
        // Otherwise it will continue adding the symbol to list and graph.

        var li = document.createElement("li");
        li.setAttribute('id', companyName.value.toUpperCase());
        li.appendChild(document.createTextNode(companyName.value.toUpperCase()));
        ul.appendChild(li); // This adds Stock Symbol to our list in HTML.

        companyInList[(companyName.value).toUpperCase()] = {
            price: 0
        }
        // The key will be company name's value and the key's value will be current price
        // The current price would be initialized to 0.

        APICALLONCE((companyName.value).toUpperCase());
        // Calls API call function intended to only return the price of the newly added stock.
        initialize();
        //Calls google charts to refresh.
    }
}

function APICall() {
    //With the instructions given on Website Finnhub.io, I wrote this code.
    // More information can be found here.
    // https://finnhub.io/docs/api

    console.log('API CALL Started'); // Tells us API call succesfully started.
    for(var i in companyInList) { // This for loop makes sure every stock symbol in list gets updated.

        var xhReq = new XMLHttpRequest(); // It opens a new XML request.

        xhReq.open("GET", 'https://finnhub.io/api/v1/quote?symbol='+i+'&token=brnejcnrh5rcnlf5lf3g', false);
        //Using the URL and my API Key to fetch Json.
        xhReq.send(null);

        var jsonObject = JSON.parse(xhReq.responseText);
        //Parsing Json using inbuilt function of js and storing it in a variable.

        console.log(jsonObject.c);
        //Printing out it's price.

        companyInList[i].price = jsonObject.c;
        //Updating the price in our data structure.
    }

}

function APICALLONCE(nameOfFirm) { //Parameter is Passed in it from the function addCompany.

    var xhReq = new XMLHttpRequest();
    //XML request.
    xhReq.open("GET", 'https://finnhub.io/api/v1/quote?symbol='+nameOfFirm+'&token=brnejcnrh5rcnlf5lf3g', false);
    xhReq.send(null);
    // Using URL and API key to get info.
    var jsonObject = JSON.parse(xhReq.responseText);
    // Parsing Json.
    companyInList[nameOfFirm].price = jsonObject.c;
    // Updating price from 0 to the original value.
}

function initialize() {
    //From the instructions given on Google Charts API, this code has been made.
    // https://developers.google.com/chart/interactive/docs/gallery/barchart
    // More information can be found here.

    google.charts.load("current", {packages: ["corechart"]});
    google.charts.setOnLoadCallback(drawChart);

    function drawChart() {

        var array1 = [['Stock Symbol', 'Prices in USD']]
        // Manually making an array to enter it into the dataToTable function
        // This is done because we had a hashmap and hashmap was not compatible with this form of table.

        //debugging
        //checking if update working
        /*
        if(xy%2 == 0){
            array1.push(['Harry', 98.50]);
        }else{
            array1.push(['Harry', 108.50]);
        }
         */

        for (var i in companyInList){
            array1.push([i, companyInList[i].price]);
        }
        // Transfers the data from hash map to array such that it can be transferred to the table.

        var data = new google.visualization.arrayToDataTable(array1);
        // Making a variable data.

        formatPattern = '#,##0.0000';
        // Setting the format to be upto two decimal places.
        // This is done because google chart approximates the numbers if not specified the format.

        var formatNumber = new google.visualization.NumberFormat({
            pattern: formatPattern
        });

        formatNumber.format(data, 1);
        // Data is formatted to two decimal digits.

        var view = new google.visualization.DataView(data);
        // A new view is created where data is impotred from the data variable as it was in form of data table.

        view.setColumns([0, 1,
            { calc: "stringify",
                sourceColumn: 1,
                type: "string",
                role: "annotation" }]);
        //This has been specified because of the prices which show up as annotations on the bars.

        var options = {
            title: "Stock Prices",
            width: 1000,
            height: 600,
            bar: {groupWidth: "95%"},
            legend: { position: "none" },
            axes: {
                x: {
                    0: { side: 'top', label: 'Prices in USD'} // Top x-axis.
                }}
        };
        // These are some setting we can manually change anytime to get a comfortable screen view.

        var chart = new google.visualization.BarChart(document.getElementById("top_x_div"));
        chart.draw(view, options);
        // finally putting our work together on the chart.
    }
}

