<?php
$q = $_GET["word"];
putenv('LC_ALL=C.UTF-8');
passthru("python3 termfreq.py " . $q);
?>
