import requests
import json
import base64
from datetime import datetime

# URL ของ Webhook จาก Microsoft Teams
WEBHOOK_URL = "https://nu365.webhook.office.com/webhookb2/YOUR_WEB_HOOK"

def encode_image_to_base64(file_path):
    """
    แปลงไฟล์ภาพเป็น Base64
    :param file_path: Path ของไฟล์ภาพในเครื่อง
    :return: Base64 string
    """
    try:
        with open(file_path, "rb") as image_file:
            base64_image = base64.b64encode(image_file.read()).decode("utf-8")
            return base64_image
    except Exception as e:
        print(f"An error occurred while encoding the image: {e}")
        return None

def send_message_to_teams(message, base64_image, image_detail):
    """
    ส่งข้อความและภาพ Base64 ไปยัง Microsoft Teams
    :param message: ข้อความที่ต้องการส่ง
    :param base64_image: Base64 string ของภาพ
    :param image_detail: รายละเอียดของภาพ
    """
    upload_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    headers = {"Content-Type": "application/json"}

    # สร้าง Adaptive Card payload
    card_content = {
        "type": "message",
        "attachments": [
            {
                "contentType": "application/vnd.microsoft.card.adaptive",
                "content": {
                    "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
                    "type": "AdaptiveCard",
                    "version": "1.4",
                    "body": [
                        {
                            "type": "TextBlock",
                            "text": "Alert!",
                            "size": "Medium",
                            "weight": "Bolder"
                        },
                        {
                            "type": "Image",
                            "url": f"data:image/png;base64,{base64_image}",
                            "altText": "Attached Image"
                        },
                        {
                            "type": "TextBlock",
                            "text": f"อัพโหลดเมื่อ : {upload_time}",
                            "isSubtle": True,
                            "wrap": True
                        },
                        {
                            "type": "TextBlock",
                            "text": f"รายละเอียด : {image_detail}",
                            "wrap": True
                        }
                    ]
                }
            }
        ]
    }

    # ส่งข้อความไปยัง Teams
    payload = json.dumps(card_content)
    response = requests.post(WEBHOOK_URL, headers=headers, data=payload)

    if response.status_code == 200:
        print("Message sent successfully to Teams!")
    else:
        print(f"Failed to send message: {response.status_code}, {response.text}")

if __name__ == '__main__':
    # กำหนด Path ของไฟล์ในเครื่อง
    local_file_path = r'YOUR_PATH_IMAGE'  # แก้ไข Path ให้ตรงกับไฟล์จริง

    # แปลงภาพเป็น Base64
    base64_image = encode_image_to_base64(local_file_path)

    if base64_image:
        # ส่งข้อความและภาพไปยัง Microsoft Teams
        send_message_to_teams(
            message="Alert!",
            base64_image=base64_image,
            image_detail="ทดสอบส่งภาพจาก Python"
        )
