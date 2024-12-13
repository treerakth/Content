import requests
import json
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload
from google.oauth2.service_account import Credentials

# Path ไปยังไฟล์ Service Account JSON
SERVICE_ACCOUNT_FILE = r'C:\Users\treer\Desktop\Projects\Project Co-Operation Work\Connector Microsoft Team\image-api-443004-b34f0b1100f7.json'

# SCOPES: ใช้สิทธิ์ในการจัดการไฟล์ใน Google Drive
SCOPES = ['https://www.googleapis.com/auth/drive']

# URL ของ Webhook จาก Microsoft Teams
WEBHOOK_URL = "https://nu365.webhook.office.com/webhookb2/efb3b6cb-58c9-4b21-a4e3-c34adfa86609@bf1eb3f8-19d2-409d-b0c5-4e80c943fd52/IncomingWebhook/9bf57115d7a3478d83155dfb091b57f7/395194ba-631a-4986-8e13-827d36d58e85/V2p9-r_PPqfG3_boA8VcG_PadiaucvOh73hF5LvKVRVCQ1"

def upload_file_to_drive(file_path, file_name, folder_id=None):
    """
    อัปโหลดไฟล์ไปยัง Google Drive
    :param file_path: Path ของไฟล์ในเครื่อง (local path)
    :param file_name: ชื่อไฟล์ที่ต้องการเก็บใน Google Drive
    :param folder_id: (Optional) ID ของโฟลเดอร์ใน Google Drive (ถ้าไม่มีจะเก็บใน Root)
    :return: Google Drive file link
    """
    try:
        # สร้าง Credentials จาก Service Account
        credentials = Credentials.from_service_account_file(SERVICE_ACCOUNT_FILE, scopes=SCOPES)

        # สร้าง Google Drive API Service
        service = build('drive', 'v3', credentials=credentials)

        # เตรียมไฟล์สำหรับอัปโหลด
        file_metadata = {'name': file_name}
        if folder_id:
            file_metadata['parents'] = [folder_id]

        media = MediaFileUpload(file_path, resumable=True)

        # อัปโหลดไฟล์
        file = service.files().create(
            body=file_metadata,
            media_body=media,
            fields='id'
        ).execute()

        file_id = file.get('id')
        file_link = f"https://drive.google.com/file/d/{file_id}/view?usp=sharing"
        print(f"File uploaded successfully. File ID: {file_id}")
        return file_link, file_id
    except Exception as e:
        print(f"An error occurred: {e}")
        return None, None

def send_message_to_teams(file_link, file_id, image_url):
    """ส่งข้อความแจ้งเตือนไปยัง Microsoft Teams พร้อมกับภาพ"""
    headers = {"Content-Type": "application/json"}
    card_content = {
        "type": "message",
        "attachments": [
            {
                "contentType": "application/vnd.microsoft.card.adaptive",
                "content": {
                    "type": "AdaptiveCard",
                    "body": [
                        {
                            "type": "TextBlock",
                            "text": "Alert! ",
                            "size": "Medium",
                            "weight": "Bolder"
                        },
                        {
                            "type": "Image",
                            "url": image_url  # URL ของภาพที่จะแสดงในข้อความ
                        },
                        {
                            "type": "TextBlock",
                            "text": f"[คลิกเพื่อดูไฟล์ที่อัปโหลด](https://drive.google.com/file/d/{file_id}/view?usp=sharing)",
                            "wrap": True
                        }
                    ],
                    "actions": [
                        {
                            "type": "Action.OpenUrl",
                            "title": "เปิดไฟล์ใน Google Drive",
                            "url": f"https://drive.google.com/file/d/{file_id}/view?usp=sharing"
                        }
                    ]
                }
            }
        ]
    }
    payload = json.dumps(card_content)
    response = requests.post(WEBHOOK_URL, headers=headers, data=payload)
    if response.status_code == 200:
        print("Message sent successfully to Teams!")
    else:
        print(f"Failed to send message: {response.status_code}, {response.text}")

if __name__ == '__main__':
    # กำหนด Path ของไฟล์ในเครื่อง และชื่อที่ต้องการใน Google Drive
    local_file_path = r'C:\Users\treer\Desktop\Projects\Project Co-Operation Work\Connector Microsoft Team\core.png'  # ไฟล์ในเครื่อง
    drive_file_name = 'image01.png'  # ชื่อไฟล์ใน Google Drive
    folder_id = '1INay5KRAHFsRGf4PhHtYqA6rOYlVvKwF'  # ใส่ Folder ID หากต้องการอัปโหลดในโฟลเดอร์เฉพาะ

    # เรียกใช้ฟังก์ชันเพื่ออัปโหลดไฟล์และได้ลิงค์
    file_link, file_id = upload_file_to_drive(local_file_path, drive_file_name, folder_id)

    # ตรวจสอบว่าไฟล์อัปโหลดสำเร็จหรือไม่
    if file_link and file_id:
        # กำหนด URL ของภาพใน Google Drive (อาจจะต้องใช้ URL ของภาพที่สามารถเข้าถึงได้จาก Google Drive)
        image_url = f"https://drive.google.com/uc?export=view&id={file_id}"

        # ส่งข้อความและภาพไปยัง Microsoft Teams
        send_message_to_teams(file_link, file_id, image_url)
