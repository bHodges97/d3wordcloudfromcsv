<?php

$data = file_get_contents('php://input');
$obj = json_decode($data, true);
$dir = $obj["dir"];

//$rel_dir = "../csv/" . $dir . "/";
$rel_dir = "./data/papers.csv";

header('Content-Type: application/json');

$cmd ="python3 requestpapers.py " . $rel_dir;
if( isset( $obj['papers'] ) ){
  $abstract = var_export($obj['abstract'], true);
  $cmd = $cmd . " " . $abstract . " [" . implode(",",$obj['papers']) . "]";
}
passthru($cmd);
?>
