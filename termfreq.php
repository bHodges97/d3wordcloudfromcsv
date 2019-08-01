<?php
$q = $_GET["word"];
passthru("./papersbyword.py " . $q);
?>
