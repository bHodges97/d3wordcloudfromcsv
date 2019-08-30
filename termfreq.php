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
//$rel_dir = "../csv/" . $dir . "/tfs.npz";
$rel_dir = "'./tfs.npz'";

putenv('LC_ALL=C.UTF-8');
passthru("python3 termfreq.py " . $q . " " . $rel_dir);
?>
