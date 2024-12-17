const { google } = require("googleapis");
const axios = require("axios");
const fs = require("fs");

// Path ไปยังไฟล์ Service Account JSON
const SERVICE_ACCOUNT_FILE = "YOUR_PATH_SERVCE_FILE";

// SCOPES: ใช้สิทธิ์ในการจัดการไฟล์ใน Google Drive
const SCOPES = ["https://www.googleapis.com/auth/drive"];

// URL ของ Webhook จาก Microsoft Teams
const WEBHOOK_URL = "https://nu365.webhook.office.com/webhookb2/YOUR_WEB_HOOK/";

async function uploadFileToDrive(filePath, fileName, folderId = null) {
    try {
        // สร้าง JWT Client สำหรับ Google Drive API
        const auth = new google.auth.GoogleAuth({
            keyFile: SERVICE_ACCOUNT_FILE,
            scopes: SCOPES,
        });

        const drive = google.drive({ version: "v3", auth });

        // เตรียมไฟล์สำหรับอัปโหลด
        const fileMetadata = { name: fileName };
        if (folderId) fileMetadata.parents = [folderId];

        const media = { mimeType: "image/png", body: fs.createReadStream(filePath) };

        // อัปโหลดไฟล์
        const file = await drive.files.create({
            resource: fileMetadata,
            media: media,
            fields: "id",
        });

        const fileId = file.data.id;
        const fileLink = `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;

        console.log(`File uploaded successfully. File ID: ${fileId}`);
        return { fileLink, fileId };
    } catch (error) {
        console.error(`Error uploading file to Drive: ${error.message}`);
        return null;
    }
}

async function sendMessageToTeams(fileLink, fileId, imageUrl, imageDetail) {
    const uploadTime = new Date().toLocaleString(); // เพิ่มเวลาปัจจุบัน

    const payload = {
        type: "message",
        attachments: [
            {
                contentType: "application/vnd.microsoft.card.adaptive",
                content: {
                    type: "AdaptiveCard",
                    body: [
                        {
                            type: "TextBlock",
                            text: "Alert!",
                            size: "Medium",
                            weight: "Bolder",
                        },
                        {
                            type: "Image",
                            url: imageUrl,
                        },
                        {
                            type: "TextBlock",
                            text: `อัพโหลดเมื่อ : ${uploadTime}`,
                            isSubtle: true,
                            wrap: true,
                        },
                        {
                            type: "TextBlock",
                            text: `รายละเอียด : ${imageDetail}`,
                            wrap: true,
                        },
                    ],
                    actions: [
                        {
                            type: "Action.OpenUrl",
                            title: "เปิดไฟล์ภาพ",
                            url: `https://drive.google.com/file/d/${fileId}/view?usp=sharing`,
                        },
                    ],
                    version: "1.0",
                },
            },
        ],
    };

    try {
        const response = await axios.post(WEBHOOK_URL, payload, {
            headers: { "Content-Type": "application/json" },
        });
        if (response.status === 200) {
            console.log("Message sent successfully to Teams!");
        } else {
            console.log(`Failed to send message: ${response.status}, ${response.statusText}`);
        }
    } catch (error) {
        console.error(`Error sending message to Teams: ${error.message}`);
    }
}

(async () => {
    const localFilePath = "YOUR_PATH_IMAGE"; // Path ของไฟล์ในเครื่อง
    const driveFileName = "YOUR_NAME_IMAGE_IN_DRIVE.png"; // ชื่อไฟล์ที่ต้องการเก็บใน Google Drive
    const folderId = "FOLDER_IN_DRIVE_ID"; // ใส่ Folder ID หากต้องการอัปโหลดในโฟลเดอร์เฉพาะ

    // อัปโหลดไฟล์ไปยัง Google Drive
    const { fileLink, fileId } = await uploadFileToDrive(localFilePath, driveFileName, folderId);

    if (fileLink && fileId) {
        // กำหนด URL ของภาพ
        const imageUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
        const imageDetail = "ทดสอบส่งภาพจาก Node.js"; // รายละเอียดของภาพ

        // ส่งข้อความพร้อมภาพไปยัง Microsoft Teams
        await sendMessageToTeams(fileLink, fileId, imageUrl, imageDetail);
    }
})();
