const axios = require("axios");
const fs = require("fs");

// URL ของ Webhook จาก Microsoft Teams
const WEBHOOK_URL = "https://nu365.webhook.office.com/webhookb2/efb3b6cb-58c9-4b21-a4e3-c34adfa86609@bf1eb3f8-19d2-409d-b0c5-4e80c943fd52/IncomingWebhook/9bf57115d7a3478d83155dfb091b57f7/395194ba-631a-4986-8e13-827d36d58e85/V2p9-r_PPqfG3_boA8VcG_PadiaucvOh73hF5LvKVRVCQ1";

async function sendMessageToTeamsWithBase64(imagePath, imageDetail) {
    try {
        // อ่านไฟล์ภาพและแปลงเป็น Base64
        const imageData = fs.readFileSync(imagePath).toString("base64");

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
                                url: `data:image/png;base64,${imageData}`,
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
                        version: "1.0",
                    },
                },
            ],
        };

        // ส่งข้อความไปยัง Microsoft Teams
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
    const imageDetail = "ทดสอบส่งภาพแบบ Base64 จาก Node.js"; // รายละเอียดของภาพ

    // ส่งข้อความพร้อมภาพแบบ Base64 ไปยัง Microsoft Teams
    await sendMessageToTeamsWithBase64(localFilePath, imageDetail);
})();
