<html><body><head><title>Current Projects</title></head>
<?php
$dir = "./";
if ($handle = opendir($dir)) {
    while (false !== ($entry = readdir($handle))) {
    	$pattern = '/[(php)(txt)(html)]$/';
		if (preg_match($pattern, $entry) == true){
			echo "<br> <a href=\"./$entry\"> $entry </a> <br>";
		}	
  } 
  	closedir($handle);
}
?>
</body></html>