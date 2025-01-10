<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); 
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

function writeLog($message)
{
    $timestamp = date('Y-m-d H:i:s');
    file_put_contents("log.txt", "[$timestamp] $message" . PHP_EOL, FILE_APPEND);
}

$rawInput = file_get_contents('php://input');
writeLog("Incoming request: " . $rawInput);

$data = json_decode($rawInput, true);

if (isset($data['html'])) {
    $html = $data['html'];

    $sanitizedHtml = strip_tags($html);
    writeLog("Sanitized HTML content received for summarization.");

    $apiKey = "";
    $summary = summarizeContentWithGemini($sanitizedHtml, $apiKey);

    writeLog("Generated summary: " . $summary);

    echo json_encode(['summary' => $summary]);
} else {
    writeLog("Error: No HTML content provided in the request.");
    echo json_encode(['error' => 'No HTML content provided.']);
}

/**
 * Summarizes content using the Gemini API.
 *
 * @param string $content The content to be summarized.
 * @param string $apiKey The API key for Gemini.
 * @return string The summary or an error message.
 */
function summarizeContentWithGemini($content, $apiKey)
{
    $url = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=" . $apiKey;

    $data = [
        "contents" => [
            [
                "parts" => [
                    ["text" => "Summarize the following HTML content: \n\n" . $content]
                ]
            ]
        ]
    ];

    $options = [
        "http" => [
            "header" => "Content-Type: application/json\r\n",
            "method" => "POST",
            "content" => json_encode($data),
            "timeout" => 15, 
        ]
    ];

    $context = stream_context_create($options);

    try {
        $result = file_get_contents($url, false, $context);

        if ($result === FALSE) {
            $error = error_get_last();
            writeLog("Error during Gemini API request: " . $error["message"]);
            return "Error summarizing content: " . $error["message"];
        }

        $response = json_decode($result, true);

        if (isset($response['candidates'][0]['content']['parts'][0]['text'])) {
            writeLog("Successfully received summary response from Gemini API.");
            return $response['candidates'][0]['content']['parts'][0]['text'];
        } else {
            writeLog("Error: Unable to extract summary. Response: " . json_encode($response));
            return "Error: Unable to extract summary from the Gemini API response.";
        }
    } catch (Exception $e) {
        writeLog("Exception during request: " . $e->getMessage());
        return "Error summarizing content: " . $e->getMessage();
    }
}
