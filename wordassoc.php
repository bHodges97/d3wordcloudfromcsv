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
$abstract = var_export($_GET['abstract'], true);
//$rel_dir = "../csv/" . $dir . "/";
$rel_dir = "./data/";

passthru("python3 wordassoc.py " . $q. " " . $rel_dir . " " . $count . " " . $abstract);
?>
