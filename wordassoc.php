<?php
$q = $_GET['word'];

function get_related($word){
	if (($handle = fopen("related_papers.csv","r")) !== FALSE) {
		while (($data = fgetcsv($handle, ",")) !== FALSE) {
			if($data[0] == $word){
				return $data[1];
			}
		}
	}else{
		echo "failed";
	}
}
function getHTML($line){
	$handle = fopen("papers.csv", "r");
	$row = 1;
	while (($data = fgetcsv($handle, ",")) !== FALSE) {
		if($row == $line){
			return $data[1];
		}
        $row++;
    }
}

$data = json_decode(get_related($q),true);
$out = "";

foreach ($data as $index => $count) {
	$html = getHTML($index);
	$out .= "<li> Count:" . $count . " <br> " . $html . "</li>"; 
}

echo "<ul>" . $out . "</ul>"



?>
