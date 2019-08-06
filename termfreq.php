<?php
$q = $_GET["word"];
putenv('LC_ALL=en_US.UTF-8');
passthru("python3 termfreq.py " . $q);
?>
