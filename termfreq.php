<?php
$q = $_GET["word"];
passthru("python3 papersbyword.py " . $q);
?>
