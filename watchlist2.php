<html>
    <head>
        <title>watchlistTest2.php</title>
        <script language="JavaScript"></script>
        <script type="text/javascript" src="./jquery-1.11.1.min.js"></script>
        <!-- // <script type="text/javascript" src="updatePriceArray.js"></script> -->
        <script type="text/javascript" src="./watchlist2.js"></script>
        <link rel="stylesheet" type="text/css" href="./fiddle.css" />
    </head>
<body>
<?php
$file = fopen("./positions06272014.csv.xls", "r") or exit("Unable to open file!");
$info = array();
$totalDailyChange = 0;
$totalDailyChangePct = 0;
$totalAcctCost = 0;
$totalAcctMktValue = 0;
$totalAcctGL = 0;
$totalGLPct = 0;
$dailyFontColor = "black";
$totalFontColor = "black";
while (($data = fgetcsv($file, 8000, ",")) !== FALSE) {
    $symbol = $data[0];
    $info[$symbol] = array('symbol'=>$data[0],
                           'description'=>$data[1],
                           'qty'=>$data[2],
                           'totalCost'=>$data[4],
                           'perShareCost'=>$data[5]);
    $yahooReturn = file_get_contents("http://download.finance.yahoo.com/d/quotes.csv?s=$symbol&f=l1p");
    $yahooReturn = explode(',', $yahooReturn);
    $info[$symbol]['price'] = $yahooReturn[0];
    $info[$symbol]['prevClose'] = $yahooReturn[1];
    $info[$symbol]['totalCost'] = str_replace("$", "", $info[$symbol]['totalCost']);
    $info[$symbol]['totalCost'] = str_replace(",", "", $info[$symbol]['totalCost']);
    $info[$symbol]['dailyChange'] = $info[$symbol]['price'] - $info[$symbol]['prevClose'];
    $info[$symbol]['dailyChangePct'] = ($info[$symbol]['dailyChange'] / $info[$symbol]['prevClose']) * 100;
    $info[$symbol]['perShareCost'] = str_replace("$", "", $info[$symbol]['perShareCost']);
    $info[$symbol]['perShareCost'] = str_replace(",", "", $info[$symbol]['perShareCost']);
    $info[$symbol]['dailyChangePct'] = ($info[$symbol]['dailyChange']/$info[$symbol]['perShareCost']) * 100;
    $info[$symbol]['mktValue'] = $info[$symbol]['price'] * $info[$symbol]['qty'];
    $info[$symbol]['totalDailyChange'] = $info[$symbol]['dailyChange'] * $info[$symbol]['qty'];
    $info[$symbol]['totalGL'] = $info[$symbol]['mktValue'] - $info[$symbol]['totalCost'];
    $info[$symbol]['totalGLPct'] = $info[$symbol]['totalGL'] / $info[$symbol]['totalCost'] * 100;
    $totalAcctMktValue = $info[$symbol]['mktValue'] + $totalAcctMktValue;
    $totalDailyChange = $info[$symbol]['totalDailyChange'] + $totalDailyChange;
    $totalAcctCost = $info[$symbol]['totalCost'] + $totalAcctCost;
}
$totalDailyChangePct = $totalDailyChange / ($totalAcctMktValue - $totalDailyChange) * 100;
$totalAcctGL = $totalAcctMktValue - $totalAcctCost;
$totalGLPct = (($totalAcctMktValue - $totalAcctCost) / $totalAcctCost) * 100;
unset($info['Symbol']);
unset($info['Total Securities']);
unset($info['Total Account Value']);
unset($info['Money']);
echo "<table cellspacing=10>";
echo "<tr id='header'>";
echo "<th>Symbol</th>";
echo "<th>Description</th>";
echo "<th>Qty</th>";
echo "<th>Avg Price</th>";
echo "<th>Price</th>";
echo "<th>Change</th>";
echo "<th>Daily G/L (%)</th>";
echo "<th>Total G/L (%)</th>";
echo "<th>Mkt Value</th>";
echo "</tr>";
foreach($info as $symbol){
    if($symbol['dailyChange'] > 0){
        $dailyFontColor = "green";
    } else {
        $dailyFontColor = "red";
    }
    if($symbol['totalGL'] > 0){
        $totalFontColor = "green";
    } else {
        $totalFontColor = "red";
    }
    echo "<tr id='" . $symbol['symbol'] . "'>";
    echo "<td><div id='" . $symbol['symbol'] . "symbol'><a href=http://finance.yahoo.com/q?s=".$symbol['symbol'].">".$symbol['symbol']."</a></div></td>";
    echo "<td><div id='" . $symbol['symbol'] . "description'>".$symbol['description']."</div></td>";
    echo "<td><div id='" . $symbol['symbol'] . "qty' style='float:right;'>".number_format($symbol['qty'],2)."</div></td>";
    echo "<td><div id='" . $symbol['symbol'] . "perShareCost' style='float:right;'>$".number_format($symbol['perShareCost'],2)."</div></td>";
    echo "<td><div id='" . $symbol['symbol'] . "price' style='float:right;'>$".number_format($symbol['price'],3)."</div></td>";
    echo "<td><font color=$dailyFontColor><div id='" . $symbol['symbol'] . "dailyChange' style='float:right;'>$".number_format($symbol['dailyChange'],2)."</div></font></td>";
    echo "<td><font color=$dailyFontColor><div id='" . $symbol['symbol'] . "totalDailyChange' style='float:right;'>$".number_format($symbol['totalDailyChange'],2)." (".number_format($symbol['dailyChangePct'],2)."%)</div></font></td>";
    echo "<td><font color=$totalFontColor><div id='" . $symbol['symbol'] . "totalGL' style='float:right;'>$".number_format($symbol['totalGL'],2)." (".number_format($symbol['totalGLPct'],2)."%)</div></font></td>";
    echo "<td><div id='" . $symbol['symbol'] . "mktValue' style='float:right;'>$".number_format($symbol['mktValue'],2)."</div></td>";
    echo "</tr>";
}
echo "<tr id='total'>";
echo "<th align='left'>Total</th>";
echo "<th colspan=5><div style='float:right;'></div></th>";
echo "<th><div id='totalDailyChange' style='float:right;'>$".number_format($totalDailyChange,2)." (".number_format($totalDailyChangePct,2)."%)</div></th>";
echo "<th><div id='totalAcctGL' style='float:right;'>$".number_format($totalAcctGL,2)." (".number_format($totalGLPct,2)."%)</div></th>";
echo "<th><div id='totalAcctMktValue' style='float:right;'>$".number_format($totalAcctMktValue,2)."</div></th>";
echo "</tr>";
echo "</table>";
// var_dump($info);
echo "</body></html>";
fclose($file);
?>
