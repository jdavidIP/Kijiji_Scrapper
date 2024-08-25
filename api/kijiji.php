<?php
require_once '../scrape_kijiji.php';

header('Content-Type: application/json');

// Call the scraping function and send JSON response
$response = array(
    "status" => "success",
    "data" => scrapeKijiji()
);

echo json_encode($response);
