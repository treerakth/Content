import requests
import json
import base64
from datetime import datetime
from tkinter import Tk, filedialog
from dotenv import load_dotenv
import os

# โหลดค่าในไฟล์ .env
load_dotenv()

# ดึงค่า Webhook URL จาก .env
WEBHOOK_URL = os.getenv("WEBHOOK_URL")
HEADER_MESSAGE = os.getenv("HEADER_MESSAGE")

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
                            "text": message,
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
    # ตรวจสอบว่า WEBHOOK_URL ถูกตั้งค่าหรือไม่
    if not WEBHOOK_URL:
        print("Error: WEBHOOK_URL is not set in the .env file.")
        exit(1)

    # เปิดหน้าต่างเลือกไฟล์
    root = Tk()
    root.withdraw()  # ซ่อนหน้าต่างหลักของ Tkinter
    root.attributes('-topmost', True)  # ทำให้หน้าต่างเลือกไฟล์อยู่ด้านบนสุด

    file_path = filedialog.askopenfilename(
        title="เลือกไฟล์ภาพ",
        filetypes=[("Image Files", "*.png;*.jpg;*.jpeg;*.bmp;*.gif")]
    )

    if file_path:
        # แปลงภาพเป็น Base64
        base64_image = encode_image_to_base64(file_path)

        if base64_image:
            # ส่งข้อความและภาพไปยัง Microsoft Teams
            send_message_to_teams(
                message=HEADER_MESSAGE,
                base64_image=base64_image,
                image_detail="ทดสอบส่งภาพจาก Python"
            )
    else:
        print("No file selected.")
