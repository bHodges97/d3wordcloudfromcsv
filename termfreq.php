<?php

$data = file_get_contents('php://input');
$obj = json_decode($data, true);
$q = $obj['word'];
$dir = $obj['dir'];
if(strpos($dir, ".")){
  print("Failed");
  exit(1);
}
$papers = $obj['papers'];

//$rel_dir = "../csv/" . $dir . "/tfs.npz";
$rel_dir = "'./data/tfs.npz'";
$cmd = "python3 termfreq.py " . $q . " " . $rel_dir . " " . $papers;

header('Content-Type: application/json');
passthru($cmd);
?>
