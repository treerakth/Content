<?php
error_log("send_content.php was called.");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    error_log("POST request received.");
    
    // รับข้อมูลจากฟอร์ม
    $title = isset($_POST['title']) ? $_POST['title'] : null;
    $details = isset($_POST['details']) ? $_POST['details'] : null;
    $image = isset($_FILES['image']) ? $_FILES['image'] : null;
    $timestamp = date("Y-m-d H:i:s"); // Time Stamp ปัจจุบัน

    // Log Debug
    error_log("Title: " . $title);
    error_log("Details: " . $details);
    error_log("Timestamp: " . $timestamp);

    // อัปโหลดรูปภาพ (ถ้ามี)
    if ($image && $image['error'] === UPLOAD_ERR_OK) {
        $imageData = file_get_contents($image['tmp_name']);
        $base64Image = base64_encode($imageData);
        error_log("Image successfully uploaded.");
    } else {
        $base64Image = null;
        error_log("No image uploaded or there was an error with the file upload.");
    }

    // บันทึกข้อความลงไฟล์ JSON
    saveMessageHistory($title, $timestamp);

    // ส่งข้อมูลไปยัง Microsoft Teams
    $result = sendToTeams($title, $details, $base64Image, $timestamp);
    error_log("Result from sendToTeams: " . $result);
    echo $result;
} else {
    error_log("No POST request received.");
}

function sendToTeams($title, $details, $base64Image, $timestamp) {
    $webhookUrl = "https://nu365.webhook.office.com/webhookb2/YOUR_WEB_HOOK/"; // เปลี่ยน URL Webhook
    $payload = [
        "type" => "message",
        "attachments" => [
            [
                "contentType" => "application/vnd.microsoft.card.adaptive",
                "content" => [
                    "schema" => "http://adaptivecards.io/schemas/adaptive-card.json",
                    "type" => "AdaptiveCard",
                    "version" => "1.4",
                    "body" => [
                        [
                            "type" => "TextBlock",
                            "text" => "หัวข้อ : " . htmlspecialchars($title),
                            "size" => "Medium",
                            "weight" => "Bolder",
                            "wrap" => true
                        ],
                        [
                            "type" => "TextBlock",
                            "text" => "รายละเอียด : " . htmlspecialchars($details),
                            "wrap" => true
                        ],
                        [
                            "type" => "TextBlock",
                            "text" => "เวลาที่ส่ง : " . htmlspecialchars($timestamp),
                            "wrap" => true,
                            "isSubtle" => true
                        ]
                    ]
                ]
            ]
        ]
    ];

    // เพิ่มรูปภาพถ้ามี
    if ($base64Image) {
        $payload["attachments"][0]["content"]["body"][] = [
            "type" => "Image",
            "url" => "data:image/png;base64," . $base64Image,
            "altText" => "Attached Image"
        ];
    }

    // ส่งข้อมูลผ่าน cURL
    $ch = curl_init($webhookUrl);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

    if (curl_errno($ch)) {
        $errorMessage = 'cURL error: ' . curl_error($ch);
        error_log($errorMessage);
        return $errorMessage;
    }

    curl_close($ch);

    error_log("HTTP Code: $httpCode");
    error_log("Response from Teams: $response");

    if ($httpCode >= 200 && $httpCode < 300) {
        return "Message sent successfully!";
    } else {
        return "Failed to send message. Response: $response";
    }
}

function saveMessageHistory($message, $timestamp) {
    $filePath = 'History.json';

    // โหลดข้อมูลเก่า
    $data = file_exists($filePath) ? json_decode(file_get_contents($filePath), true) : [];

    // เพิ่มข้อความใหม่
    $data[] = ['message' => $message, 'timestamp' => $timestamp];

    // บันทึกลงไฟล์
    file_put_contents($filePath, json_encode($data));
}
?>
