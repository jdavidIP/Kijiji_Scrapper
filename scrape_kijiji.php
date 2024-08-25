<?php
function scrapeKijiji() {
    $node_path = __DIR__ . '/nodejs/node.exe'; // Adjust path separator for cross-platform compatibility
    $output = [];
    $retval = null;

    chdir(__DIR__);

    // Construct the command to execute Node.js script
    $command = "$node_path public/js/scrape_kijiji.js 2>&1";

    // Execute the command
    exec($command, $output, $retval);

    // Check for command execution errors
    if ($retval !== 0) {
        return ['status' => 'error', 'message' => 'Failed to execute scraping script.', 'error' => implode("\n", $output)];
    }

    // Join the output lines into a single string
    $outputString = implode("\n", $output);

    // Try to decode the JSON output
    $listings = json_decode($outputString, true);

    // If decoding fails, return an error
    if (json_last_error() !== JSON_ERROR_NONE) {
        return ['status' => 'error', 'message' => 'Failed to decode JSON.', 'error' => json_last_error_msg(), 'output' => $outputString];
    }

    return ['status' => 'success', 'data' => $listings];
}
