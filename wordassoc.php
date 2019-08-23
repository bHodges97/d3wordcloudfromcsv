<?php
$word = "\'\'";
if(isset($_GET["word"]))
{
	$word = $_GET["word"];
}
$dir = ".";
if(isset($_GET["dir"]))
{
	$dir = $_GET["dir"];
}
$count = 20;
if(isset($_GET["count"]))
{
	$count = $_GET["count"];
}
$abstract = "false";
if(isset($_GET["abstract"]))
{
	$abstract = $_GET["abstract"];
}

putenv('LC_ALL=C.UTF-8');
passthru("python3 wordassoc.py " . $word . " " . $dir . " " . $count . " " . $abstract);
?>
