$(function() {
	  getTxt = function (){
    $.ajax({
      url:'./positions06272014.csv.xls',
      success: function (data){
        var lines;
        var dataLine=0;
        lines = data.split('\n');  //each line as element in array
        for(var i=0; i<lines.length - 1 ; i++) {
          var flag = false;
          dataLine = lines[i].split("");  //each character as element in array for scrubbing source file
          var count = 0;
          var newLine = "";  //  this is appended each iteration with the scrubbed text
          //  scrub section removes the commas within quotes (and dollar signs) 
          //  for conflict with importing data on "," delimeter
          //  flag = true means you're inside the quotes and looking for a comma or the closing quotes
          while(count < dataLine.length - 1) {
            if(flag == false && dataLine[count] == "\"") {
              if(dataLine[count +1] == "\""){
                dataLine.splice(count,2);
              } else {
                flag = true;
                count++;
              }
            } else if(flag == true && dataLine[count] == ",") {
              var c = dataLine.splice(count,1)                    //  don't advance count because array shifts to left
            } else if(flag == true && dataLine[count] == "\"") {
                flag = false;
                count++;
            } else {
              if(dataLine[count] == "$") {
                dataLine.splice(count,1);
              } else {
                newLine = newLine + dataLine[count];
                count++;
              }
            }
          }
          lines[i] = newLine.split(",");  //  put the scrubbed version back where you got it, but now a nested arrray
          lines[i].pop();  //  takes care of trailing "," at end of each line in data file
          lines[i].splice(3,1);  //  takes care of a blank element that i couldn't find == value for comparison above in scrubbing section
  	    }
  	      //  get rid of the unecessary top and bottom rows
        lines.shift();
        lines.pop();
        lines.pop();
        lines.pop();
        lines.pop();
  			for(var count = 0; count < lines.length; count++) {
  			}
  			getGoogleData(lines);
      }
    });
  }
  var test = getTxt();

	function getGoogleData(lines) {
    var stockObject = [];
    var totalAcctDailyGL = 0;
    var totalAcctGL = 0;
    var totalAcctMktValue = 0;
		var symbols = "";
    for(var count = 0; count < lines.length; count++) {
    	symbols += lines[count][0] + ",";
    }
    symbols = symbols.slice(0,-1);
  	var count = 0;

    $.getJSON('http://www.google.com/finance/info?nfotype=infoquoteall&q=' + symbols + '&callback=?', function(data) {
      $.each(data, function() {
      	var Stock = {};
      	Stock.symbol = lines[count][0];
      	Stock.description = lines[count][1];
      	Stock.qty = lines[count][2];
      	Stock.cost = lines[count][4];
        $.each(this, function(name, value) {
          if(name == "t") {
            Stock.symbol = value;
          } else if(name == "pcls_fix") {
          	Stock.prevClose = parseFloat(value);
          } else if(name == "l") {
          	Stock.price = parseFloat(value);
          }
        });
        Stock.change = Stock.price - Stock.prevClose;
        Stock.dailyGL = Stock.qty * Stock.change;
        Stock.dailyGLPct = (Stock.change / Stock.prevClose) * 100;
        Stock.totalGL = (Stock.price - Stock.cost) * Stock.qty;
        Stock.totalGLPct = (Stock.totalGL / (Stock.cost * Stock.qty)) * 100;
        Stock.mktValue = (Stock.qty * Stock.price);
        stockObject[count] = Stock;
        totalAcctDailyGL += Stock.dailyGL;
        totalAcctGL += Stock.totalGL;
        totalAcctMktValue += Stock.mktValue;
        count++;
      });
			createTable(stockObject,totalAcctDailyGL,totalAcctGL,totalAcctMktValue);
    });
  };
  function createTable(stockObject,totalAcctDailyGL,totalAcctGL,totalAcctMktValue) {
  	var table = document.createElement("table");
    table.setAttribute("id", "myTable");
    var tbody = document.createElement("tbody");
    tbody.setAttribute("id", "myTBody");
    var test = document.getElementById("targetDiv").appendChild(table).appendChild(tbody);
    var row = document.createElement("tr");
    row.setAttribute("id","header");
    document.getElementById("myTBody").appendChild(row);
    var text = document.createTextNode("Symbol");
    var cell = document.createElement("th");
    document.getElementById("header").appendChild(cell).appendChild(text);
    var text = document.createTextNode("Description");
    var cell = document.createElement("th");
    document.getElementById("header").appendChild(cell).appendChild(text);
    var text = document.createTextNode("Quantity");
    var cell = document.createElement("th");
    document.getElementById("header").appendChild(cell).appendChild(text);
    var text = document.createTextNode("Avg. Cost");
    var cell = document.createElement("th");
    document.getElementById("header").appendChild(cell).appendChild(text);
    var text = document.createTextNode("Price");
    var cell = document.createElement("th");
    document.getElementById("header").appendChild(cell).appendChild(text);
    var text = document.createTextNode("Change");
    var cell = document.createElement("th");
    document.getElementById("header").appendChild(cell).appendChild(text);
    var text = document.createTextNode("Daily G/L");
    var cell = document.createElement("th");
    document.getElementById("header").appendChild(cell).appendChild(text);
    var text = document.createTextNode("Total G/L");
    var cell = document.createElement("th");
    document.getElementById("header").appendChild(cell).appendChild(text);
    var text = document.createTextNode("Market Value");
    var cell = document.createElement("th");
    document.getElementById("header").appendChild(cell).appendChild(text);

    for(var i=0; i< stockObject.length; i++) { 
      var row = document.createElement("tr");
      row.setAttribute("id",stockObject[i].symbol);
      document.getElementById("myTBody").appendChild(row);

      var text = document.createTextNode(stockObject[i].symbol);
      var cell = document.createElement("td");
      cell.setAttribute("id", stockObject[i].symbol + "symbol");
      var result = document.getElementById(stockObject[i].symbol).appendChild(cell).appendChild(text);

      var text = document.createTextNode(stockObject[i].description);
      var cell = document.createElement("td");
      cell.setAttribute("id", stockObject[i].symbol + "description");
      var result = document.getElementById(stockObject[i].symbol).appendChild(cell).appendChild(text);

      var text = document.createTextNode(stockObject[i].qty);
      var cell = document.createElement("td");
      cell.setAttribute("id", stockObject[i].symbol + "qty");
      cell.setAttribute("align","center");
      var result = document.getElementById(stockObject[i].symbol).appendChild(cell).appendChild(text);

      var text = document.createTextNode(formatCurrency(stockObject[i].cost));
      var cell = document.createElement("td");
      cell.setAttribute("id", stockObject[i].symbol + "cost");
      cell.setAttribute("class","currency");  // ONE way to do it--see below
      var result = document.getElementById(stockObject[i].symbol).appendChild(cell).appendChild(text);

      var text = document.createTextNode(formatCurrency(stockObject[i].price.toFixed(2)));
      var cell = document.createElement("td");
      cell.setAttribute("id", stockObject[i].symbol + "price");
      var result = document.getElementById(stockObject[i].symbol).appendChild(cell).appendChild(text);
      $("#" + stockObject[i].symbol + "price").addClass("currency");  // ANOTHER way to do it--see above

      var text = document.createTextNode(formatCurrency(stockObject[i].change.toFixed(2)));
      var cell = document.createElement("td");
      cell.setAttribute("id", stockObject[i].symbol + "change");
      document.getElementById(stockObject[i].symbol).appendChild(cell).appendChild(text);
      if(stockObject[i].change > 0) {
        $("#" + stockObject[i].symbol + "change").css("color","green");
      } else if(stockObject[i].change < 0) {
        $("#" + stockObject[i].symbol + "change").css("color","red");
      }
      $("#" + stockObject[i].symbol + "change").addClass("currency");  

      var text = document.createTextNode(formatCurrency(stockObject[i].dailyGL.toFixed(2)) 
        + " (" + stockObject[i].dailyGLPct.toFixed(2) + "%)");
      var cell = document.createElement("td");
      cell.setAttribute("id", stockObject[i].symbol + "dailyGL");
      var result = document.getElementById(stockObject[i].symbol).appendChild(cell).appendChild(text);
      if(stockObject[i].change > 0) {
        $("#" + stockObject[i].symbol + "dailyGL").css("color","green");
      } else if(stockObject[i].change < 0) {
        $("#" + stockObject[i].symbol + "dailyGL").css("color","red");
      }
      $("#" + stockObject[i].symbol + "dailyGL").addClass("currency");  

      var text = document.createTextNode(formatCurrency(stockObject[i].totalGL.toFixed(2)) + " (" + stockObject[i].totalGLPct.toFixed(2) + "%)");
      var cell = document.createElement("td");
      cell.setAttribute("id", stockObject[i].symbol + "totalGL");
      var result = document.getElementById(stockObject[i].symbol).appendChild(cell).appendChild(text); 
      if(stockObject[i].totalGL > 0) {
        $("#" + stockObject[i].symbol + "totalGL").css("color","green");
      } else if(stockObject[i].totalGL < 0) {
        $("#" + stockObject[i].symbol + "totalGL").css("color","red");
      }
      $("#" + stockObject[i].symbol + "totalGL").addClass("currency");  

      var text = document.createTextNode(formatCurrency(stockObject[i].mktValue.toFixed(2)));
      var cell = document.createElement("td");
      cell.setAttribute("id", stockObject[i].symbol + "mktValue");
      var result = document.getElementById(stockObject[i].symbol).appendChild(cell).appendChild(text); 
      $("#" + stockObject[i].symbol + "mktValue").addClass("currency"); 
    }
    var text = document.createTextNode("Total");
    var row = document.createElement("tr");
    row.setAttribute("id","totalsRow");
    document.getElementById("myTBody").appendChild(row);
    var cell = document.createElement("th");
    cell.setAttribute("colspan",6);
    document.getElementById("totalsRow").appendChild(cell).appendChild(text);

    var text = document.createTextNode(formatCurrency(totalAcctDailyGL.toFixed(2))
      + " (" + ((totalAcctDailyGL / (totalAcctMktValue - totalAcctDailyGL)) * 100).toFixed(2) + "%)");
    var cell = document.createElement("th");
    cell.setAttribute("id","totalAcctDailyGL");
    document.getElementById("totalsRow").appendChild(cell).appendChild(text);
    $("#totalAcctDailyGL").addClass("currency");  

    var text = document.createTextNode(formatCurrency(totalAcctGL.toFixed(2))
      + " (" + ((totalAcctGL / (totalAcctMktValue - totalAcctGL)) * 100).toFixed(2) + "%)");
    var cell = document.createElement("th");
    cell.setAttribute("id","totalAcctGL");
    document.getElementById("totalsRow").appendChild(cell).appendChild(text);
    $("#totalAcctGL").addClass("currency");

    var text = document.createTextNode(formatCurrency(totalAcctMktValue.toFixed(2)));
    var cell = document.createElement("th");
    cell.setAttribute("id","totalAcctMktValue");
    document.getElementById("totalsRow").appendChild(cell).appendChild(text);
    $("#totalAcctMktValue").addClass("currency");

    setInterval(function(){updateTable(stockObject)},6000);
  };
  
  function updateTable(stockObject) {
  	var symbols = "";
    var totalAcctDailyGL = 0;
    var totalAcctGL = 0;
    var totalAcctMktValue = 0;
  	var count = 0;
		var randomStock = Math.floor(Math.random() * 18);
  	for(var i = 0; i < stockObject.length; i++) {
  		symbols += stockObject[i].symbol + ",";
  	}
    symbols = symbols.slice(0,-1);
    $.getJSON('http://www.google.com/finance/info?nfotype=infoquoteall&q=' + symbols + '&callback=?', function(data) {
      $.each(data, function() {
        var oldPrice = 0;
        $.each(this, function(name, value) {
          if(value == stockObject[randomStock].symbol) {
            oldPrice = document.getElementById(stockObject[randomStock].symbol + "price").textContent;
            stockObject[randomStock].price = parseFloat(data[randomStock].l);
          }
        });
        stockObject[randomStock].change = stockObject[randomStock].price - stockObject[randomStock].prevClose;
        stockObject[randomStock].dailyGL = stockObject[randomStock].qty * stockObject[randomStock].change;
        stockObject[randomStock].dailyGLPct = (stockObject[randomStock].change / stockObject[randomStock].prevClose) * 100;
        stockObject[randomStock].totalGL = (stockObject[randomStock].price - stockObject[randomStock].cost) * stockObject[randomStock].qty;
        stockObject[randomStock].totalGLPct = (stockObject[randomStock].totalGL / (stockObject[randomStock].cost * stockObject[randomStock].qty)) * 100;
        stockObject[randomStock].mktValue = (stockObject[randomStock].qty * stockObject[randomStock].price);
        totalAcctDailyGL += stockObject[count].dailyGL;
        totalAcctGL += stockObject[count].totalGL;
        totalAcctMktValue += stockObject[count].mktValue;
        count++;
      });
      var prevPrice = $("#" + stockObject[randomStock].symbol + "price").text().replace("$","");
      $("#" + stockObject[randomStock].symbol + "price").fadeOut(300).fadeIn(100);     //or show()/fadeOut()
      if(prevPrice < stockObject[randomStock].price) {
        var $p = $("#" + stockObject[randomStock].symbol + "price");
        $p.stop().css("background-color","white").fadeOut(500, function() {
          $p.css("background-color","green").fadeIn(750, function() {
            $p.css("background-color","white").fadeIn(100);
          });
        });
      } else if (prevPrice > stockObject[randomStock].price) {
        var $p = $("#" + stockObject[randomStock].symbol + "price");
        $p.stop().css("background-color","white").fadeOut(500, function() {
          $p.css("background-color","red").fadeIn(750, function() {
            $p.css("background-color","white").fadeIn(100);
          });
        });
      } else {
        $("#" + stockObject[randomStock].symbol + "price").css("background-color", "white"); 
      }
			var text = document.createTextNode(formatCurrency(stockObject[randomStock].price.toFixed(2)));
			var check = document.getElementById(stockObject[randomStock].symbol + "price");
			check.removeChild(check.childNodes[0]);
			check.appendChild(text);

      var text = document.createTextNode(formatCurrency(stockObject[randomStock].change.toFixed(2)));
      var check = document.getElementById(stockObject[randomStock].symbol + "change");
      check.removeChild(check.childNodes[0]);
      check.appendChild(text);
      if(stockObject[randomStock].change > 0) {
        $("#" + stockObject[randomStock].symbol + "change").css("color","green");
      } else if(stockObject[randomStock].change < 0) {
        $("#" + stockObject[randomStock].symbol + "change").css("color","red");
      }

      var text = document.createTextNode(formatCurrency(stockObject[randomStock].dailyGL.toFixed(2)) 
        + " (" + stockObject[randomStock].dailyGLPct.toFixed(2) + "%)");
      var check = document.getElementById(stockObject[randomStock].symbol + "dailyGL");
      check.removeChild(check.childNodes[0]);
      check.appendChild(text);
      if(stockObject[randomStock].change > 0) {
        $("#" + stockObject[randomStock].symbol + "dailyGL").css("color","green");
      } else if(stockObject[randomStock].change < 0) {
        $("#" + stockObject[randomStock].symbol + "dailyGL").css("color","red");
      }      

      var text = document.createTextNode(formatCurrency(stockObject[randomStock].totalGL.toFixed(2))
        + " (" + stockObject[randomStock].totalGLPct.toFixed(2) + "%)");
      var check = document.getElementById(stockObject[randomStock].symbol + "totalGL");
      check.removeChild(check.childNodes[0]);
      check.appendChild(text);
      if(stockObject[randomStock].totalGL > 0) {
        $("#" + stockObject[randomStock].symbol + "totalGL").css("color","green");
      } else if(stockObject[randomStock].totalGL < 0) {
        $("#" + stockObject[randomStock].symbol + "totalGL").css("color","red");
      }            

      var text = document.createTextNode(formatCurrency(stockObject[randomStock].mktValue.toFixed(2)));
      var check = document.getElementById(stockObject[randomStock].symbol + "mktValue");
      check.removeChild(check.childNodes[0]);
      check.appendChild(text);
    
			var text = document.createTextNode(formatCurrency(totalAcctDailyGL.toFixed(2))
        + " (" + ((totalAcctDailyGL / (totalAcctMktValue - totalAcctDailyGL)) * 100).toFixed(2) + "%)");
			var check = document.getElementById("totalAcctDailyGL");
			check.removeChild(check.childNodes[0]);
			check.appendChild(text);

			var text = document.createTextNode(formatCurrency(totalAcctGL.toFixed(2))
        + " (" + ((totalAcctGL / (totalAcctMktValue - totalAcctGL)) * 100).toFixed(2) + "%)");
			var check = document.getElementById("totalAcctGL");
			check.removeChild(check.childNodes[0]);
			check.appendChild(text);

			var text = document.createTextNode(formatCurrency(totalAcctMktValue.toFixed(2)));
			var check = document.getElementById("totalAcctMktValue");
			check.removeChild(check.childNodes[0]);
			check.appendChild(text);

      // console.log("update successful!");
    });
  };

  function formatCurrency(number) {
    if(number >= 1000) {
      var temp = number.split("");
      temp.splice(-6,0,",");
      temp.splice(temp.length,"$");
      number = "";
      for(var count = 0; count < temp.length; count++) {
        number = number + temp[count];
      }
    }
    number = "$" + number;
    return number;
  }
});

