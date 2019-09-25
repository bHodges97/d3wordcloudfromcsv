<?php
$data = file_get_contents('php://input');
$obj = json_decode($data, true);
$q = $obj['word'];
$dir = $obj['dir'];
if(strpos($dir, ".")){
  print("Failed");
  exit(1);
}
$count = $obj['count'];
$abstract = var_export($obj['abstract'], true);
//$rel_dir = "../csv/" . $dir . "/";
$rel_dir = "./data/";

header('Content-Type: application/json');
passthru("python3 wordassoc.py " . $q. " " . $rel_dir . " " . $count . " " . $abstract);
?>
