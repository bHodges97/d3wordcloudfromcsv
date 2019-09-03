<?php
$data = file_get_contents('php://input');
$obj = json_decode($data, true);
$dir = $obj["dir"];
$papers = $obj["papers"];

$rel_dir = "../csv/" . "$dir" . "/tfs.npz";
$rel_dir = "./data/tfs.npz";

header('Content-Type: application/json');
passthru("python3 classify.py " . $rel_dir . " [" . implode(",",$papers) . "]" );
?>
