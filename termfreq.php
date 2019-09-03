<?php
$q = $_GET['word'];
if(! isset($q)){
  print("User word= and dir= as parameters");
  exit(1);
}
$dir = $_GET['dir'];
if(strpos($dir, ".")){
  print("Failed");
  exit(1);
}
$papers = $_GET['papers'];

//$rel_dir = "../csv/" . $dir . "/tfs.npz";
$rel_dir = "'./data/tfs.npz'";
$cmd = "python3 termfreq.py " . $q . " " . $rel_dir . " " . $papers;

header('Content-Type: application/json');
passthru($cmd);
?>
