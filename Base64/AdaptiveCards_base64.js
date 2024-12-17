require("dotenv").config(); // โหลด dotenv
const axios = require("axios");
const fs = require("fs");

// โหลดค่าต่าง ๆ จากไฟล์ .env
const WEBHOOK_URL = process.env.WEBHOOK_URL;
const IMAGE_PATH = process.env.IMAGE_PATH;
const IMAGE_DETAIL = process.env.IMAGE_DETAIL;

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
    // ใช้ค่าจาก .env
    await sendMessageToTeamsWithBase64(IMAGE_PATH, IMAGE_DETAIL);
})();
