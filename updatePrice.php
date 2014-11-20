<?php
	$symbol = $_GET["symbol"];

    $yahooReturn = file_get_contents("http://download.finance.yahoo.com/d/quotes.csv?s=$symbol&f=l1p") or exit("Unable to open file!");
    // $yahooReturn = explode(',', $yahooReturn);
    echo $yahooReturn;
?>