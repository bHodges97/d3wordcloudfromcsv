<?php
$q = $_GET["word"];
putenv('LC_ALL=en_US.UTF-8');
passthru("./papersbyword.py " . $q);
?>
