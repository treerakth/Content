const { google } = require("googleapis");
const axios = require("axios");
const fs = require("fs");

// Path ไปยังไฟล์ Service Account JSON
const SERVICE_ACCOUNT_FILE = "image-api-443004-b34f0b1100f7.json";

// SCOPES: ใช้สิทธิ์ในการจัดการไฟล์ใน Google Drive
const SCOPES = ["https://www.googleapis.com/auth/drive"];

// URL ของ Webhook จาก Microsoft Teams
const WEBHOOK_URL = "https://nu365.webhook.office.com/webhookb2/efb3b6cb-58c9-4b21-a4e3-c34adfa86609@bf1eb3f8-19d2-409d-b0c5-4e80c943fd52/IncomingWebhook/9bf57115d7a3478d83155dfb091b57f7/395194ba-631a-4986-8e13-827d36d58e85/V2p9-r_PPqfG3_boA8VcG_PadiaucvOh73hF5LvKVRVCQ1";

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
    const localFilePath = "core.png"; // Path ของไฟล์ในเครื่อง
    const driveFileName = "image01.png"; // ชื่อไฟล์ที่ต้องการเก็บใน Google Drive
    const folderId = "1INay5KRAHFsRGf4PhHtYqA6rOYlVvKwF"; // ใส่ Folder ID หากต้องการอัปโหลดในโฟลเดอร์เฉพาะ

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