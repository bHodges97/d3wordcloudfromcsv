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
$count = $_GET['count'];
$abstract = $_GET['abstract'];

$rel_dir = "./tfs.npz";
//$rel_dir = "../csv/" . $dir . "/";

putenv('LC_ALL=C.UTF-8');
passthru("python3 wordassoc.py " . $q. " " . $rel_dir . " " . $count . " " . $abstract);
?>
