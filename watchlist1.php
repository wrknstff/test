<html>
    <head>
        <title>Stock Keeper -- PHP Only</title>
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
    $info[$symbol]['prevClose'] = trim($yahooReturn[1]);
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
unset($info[""]);
echo "<table cellspacing=10>";
echo "<tr>";
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
$count = 0;
    // debug_to_console( $info);

foreach($info as $symbol){
    // debug_to_console( $symbol['symbol']);
    $count++;

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
    echo "<td><a href='http://finance.yahoo.com/q?s=".$symbol['symbol']."'>".$symbol['symbol']."</a></td>";
    echo "<td>".$symbol['description']."</td>";
    echo "<td><div style='float:right;'>".number_format($symbol['qty'],2)."</div></td>";
    echo "<td><div style='float:right;'>$".number_format($symbol['perShareCost'],2)."</div></td>";
    echo "<td><div style='float:right;'>$".number_format($symbol['price'],3)."</div></td>";
    echo "<td><font color='".$dailyFontColor."'><div style='float:right;'>$".number_format($symbol['dailyChange'],2)."</div></font></td>";
    echo "<td><font color='".$dailyFontColor."'><div style='float:right;'>$".number_format($symbol['totalDailyChange'],2)." (".number_format($symbol['dailyChangePct'],2)."%)</div></font></td>";
    echo "<td><font color='".$totalFontColor."'><div style='float:right;'>$".number_format($symbol['totalGL'],2)." (".number_format($symbol['totalGLPct'],2)."%)</div></font></td>";
    echo "<td><div style='float:right;'>$".number_format($symbol['mktValue'],2)."</div></td>";
    echo "</tr>";
}
echo "<tr>";
echo "<th align='left'>Total</th>";
echo "<th colspan='5'><div style='float:right;'></div></th>";
echo "<th><div style='float:right;'>$".number_format($totalDailyChange,2)." (".number_format($totalDailyChangePct,2)."%)</div></th>";
echo "<th><div style='float:right;'>$".number_format($totalAcctGL,2)." (".number_format($totalGLPct,2)."%)</div></th>";
echo "<th><div style='float:right;'>$".number_format($totalAcctMktValue,2)."</div></th>";
echo "</tr>";
echo "</table>";
// var_dump($info);
echo "</body></html>";
fclose($file);
function debug_to_console( $data ) {

    if ( is_array( $data ) )
        $output = "<script>console.log( 'Debug Objects: " . implode( ',', $data) . "' );</script>";
    else
        $output = "<script>console.log( 'Debug Objects: " . $data . "' );</script>";

    echo $output;
}
?>
