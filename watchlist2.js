$(function(){
	var numRows = document.getElementsByTagName("tr").length;
	var symbols = document.getElementsByTagName("tr");
	function getSymbols() { 
		for(var i=1;i<numRows-1;i++){
			var symbol;
    	if(!symbol){
    		symbol = symbols[i].getAttribute("id");
    	} else {
    		symbol = symbol + "," + symbols[i].getAttribute("id");
    	}
		}
		return symbol;
	};

	var symbols = getSymbols();
	// var test = getData(symbols);
	setInterval("getData('" + symbols + "')",2000);
});
// var XMLHttpRequestObject = false;
if(window.XMLHttpRequest) {
	XMLHttpRequestObject = new XMLHttpRequest();
} else if (window.ActiveXObject) {
	XMLHttpRequestObject = new ActiveXObject("Microsoft.XMLHTTP");
}
function getData(symbols) {
	var result;
	var test = "help!";

	if(XMLHttpRequestObject) {
		var interval;
		var resultArray;
		var symbolArray;
		var result;
		var test;
		// clearInterval(interval);

		var url = "./updatePrice.php?symbol=" + symbols;
		XMLHttpRequestObject.open("GET", url, true);
		XMLHttpRequestObject.onreadystatechange = function() {
			if(XMLHttpRequestObject.readyState == 4 && XMLHttpRequestObject.status == 200) {
				result = XMLHttpRequestObject.responseText;
				// delete XMLHttpRequestObject;
				// XMLHttpRequestObject = null;
				symbolArray = symbols.split(",");
				resultArray = result.split("\r");
				var numRows = resultArray.length - 1;
				updatePrice(symbolArray,resultArray);
				// interval = setInterval("updatePrice('" + symbolArray + "','" + resultArray + "')", 3000);

				test = result;
				return test;
			}
		}
		XMLHttpRequestObject.send(null);
	}
	// return result;
}
function updatePrice(symbolArray,resultArray) {
	var change = 0;
	var lastChange = 0;
	var i = Math.floor(Math.random() * 18);
	var target = document.getElementById(symbolArray[i] + "price");
	var perShareCost = document.getElementById(symbolArray[i] + "perShareCost").textContent.replace("$","");
	var qty = document.getElementById(symbolArray[i] + "qty").textContent;
	var totalGL = 0;
	mktValue = 0;
	var prices = resultArray[i].split(",");
	prices[0] = prices[0].replace("\n","");
	prices[0] = parseFloat(prices[0]).toFixed(3);
	// console.log("prices[0]: " + prices[0]);
	target.innerHTML = "$" + prices[0];

	$("#" + symbolArray[i] + "price").fadeOut(300).fadeIn(100);     //or show()/fadeOut()
	target = document.getElementById(symbolArray[i] + "dailyChange");
	change = (prices[0] - prices[1]).toFixed(2);
	lastChange = document.getElementById(symbolArray[i] + "dailyChange").textContent.replace("$","");
	lastChange = parseFloat(lastChange).toFixed(2);

	if(change > lastChange){
		var $p = $("#" + symbolArray[i] + "price");
    $p.stop().css("background-color","white").fadeOut(500, function() {
      $p.css("background-color","green").fadeIn(750, function() {
      	$p.css("background-color","white").fadeIn(100);
      });
    });
	} else if (change < lastChange) {
		var $p = $("#" + symbolArray[i] + "price");
    $p.stop().css("background-color","white").fadeOut(500, function() {
      $p.css("background-color","red").fadeIn(750, function() {
      	$p.css("background-color","white").fadeIn(100);
      });
    });
	} else {
		$("#" + symbolArray[i] + "price").css("background-color", "white");	
	}
	target.innerHTML = "$" + change;
	if(change > 0){
		$("#" + symbolArray[i] + "dailyChange").css("color","green");
	} else if(change < 0) {
		$("#" + symbolArray[i] + "dailyChange").css("color","red");
	}
	target = document.getElementById(symbolArray[i] + "totalDailyChange");
	target.innerHTML = "$" + (document.getElementById(symbolArray[i] + "qty").textContent * (prices[0] - prices[1])).toFixed(2) + " (" + (change/prices[0] *100).toFixed(2) + "%)";

	if(change > 0){
		$("#" + symbolArray[i] + "totalDailyChange").css("color","green");
	} else if(change < 0) {
		$("#" + symbolArray[i] + "totalDailyChange").css("color","red");
	}
	target = document.getElementById(symbolArray[i] + "totalGL");
	totalGL = ((qty * prices[0]) - (qty * perShareCost)).toFixed(2);
	if(totalGL >= 1000) {
		var temp = totalGL.split("");
		temp.splice(-6,0,",");
		// console.log(temp);
		totalGL = "";
		for(var count = 0; count < temp.length; count++) {
			totalGL = totalGL + temp[count];
		}
		// console.log(totalGL);
	}
	target.innerHTML = "$" + totalGL + " (" + (((prices[0] - perShareCost)/ perShareCost) * 100).toFixed(2) + "%)";
	if(totalGL > 0) {
		$("#" + symbolArray[i] + "totalGL").css("color","green");
	} else if (totalGL < 0){
		$("#" + symbolArray[i] + "totalGL").css("color","red");
	}
	target = document.getElementById(symbolArray[i] + "mktValue");
	mktValue = (qty * prices[0]).toFixed(2);
	if(mktValue >= 1000) {
		var temp = mktValue.split("");
		temp.splice(-6,0,",");
		// console.log(temp);
		mktValue = "";
		for(var count = 0; count < temp.length; count++) {
			mktValue = mktValue + temp[count];
		}
		// console.log(mktValue);
	}
	target.innerHTML = "$" + mktValue;
	updateTotals(symbolArray,resultArray);
}
function updateTotals(symbolArray,resultArray) {
	var totalAcctGL=0;
	var totalAcctMktValue=0;
	var totalDailyChange=0;
	var qty=0;
	var change=0;
	var yesterday=0;
	var prices;
	var perShareCost=0;
	var percentTDC=0;
	var percentTAGL=0;
	var purchaseTotal=0;
	for(var i=0; i<symbolArray.length; i++){
		prices = resultArray[i].split(",");
		change = prices[0] - prices[1];
		qty = document.getElementById(symbolArray[i] + "qty").textContent;
		perShareCost = document.getElementById(symbolArray[i] + "perShareCost").textContent.replace("$","");
		totalDailyChange = totalDailyChange + (qty * change);
		totalAcctGL = totalAcctGL + ((qty * prices[0]) - (qty * perShareCost));

		totalAcctMktValue = totalAcctMktValue + (prices[0] * qty);
		yesterday = yesterday + (qty * prices[1]);
		purchaseTotal = purchaseTotal + (qty * perShareCost);
	}
	percentTDC = (((totalAcctMktValue - yesterday)/yesterday)*100).toFixed(2);
	percentTAGL = (((totalAcctMktValue - purchaseTotal)/purchaseTotal)*100).toFixed(2);
	if(totalDailyChange >= 1000) {
		totalDailyChange = totalDailyChange.toFixed(2);
		var temp = totalDailyChange.split("");
		temp.splice(-6,0,",");
		totalDailyChange = "";
		for(var count = 0; count < temp.length; count++) {
			totalDailyChange = totalDailyChange + temp[count];
		}
	}
	if(totalAcctGL >= 1000) {

		// console.log("totalAcctGL: " + totalAcctGL.toFixed(2));
		totalAcctGL = totalAcctGL.toFixed(2);
		var temp = totalAcctGL.split("");
		temp.splice(-6,0,",");
		// console.log(temp);
		totalAcctGL = "";
		for(var count = 0; count < temp.length; count++) {
			totalAcctGL = totalAcctGL + temp[count];
		}
		// console.log(totalAcctMktValue);
	}
	if(totalAcctMktValue >= 1000) {

		// console.log("totalAcctMktValue: " + totalAcctMktValue.toFixed(2));
		totalAcctMktValue = totalAcctMktValue.toFixed(2);
		var temp = totalAcctMktValue.split("");
		temp.splice(-6,0,",");
		console.log(temp);
		totalAcctMktValue = "";
		for(var count = 0; count < temp.length; count++) {
			totalAcctMktValue = totalAcctMktValue + temp[count];
		}
		console.log(totalAcctMktValue);
	}
	document.getElementById("totalDailyChange").innerHTML = "$" + totalDailyChange.toFixed(2) + "(" + percentTDC + "%)" ;
	document.getElementById("totalAcctGL").innerHTML = "$" + totalAcctGL + "(" + percentTAGL + "%)";
	document.getElementById("totalAcctMktValue").innerHTML = "$" + totalAcctMktValue;
}