# อธิบายเกี่ยวกับการสร้าง Adaptive Cards และส่งเข้า Microsoft Teams
## จะแบ่งเป็น 2 รูปแบบ คือ
    1.การส่งภาพเข้าสู่ Teams โดยการแปลงภาพเป็น Base64 
    2.การส่งภาพเข้าสู่ Teams โดยใช้ Google Drive
โดยทั้งสองแบบมี Requirement ที่แตกต่างกัน โดยจะขอเริ่มไปทีละขั้นตอน
***
## Base64

#### Requirement ที่จำเป็น  
- Incoming Webhook Microsoft Teams URL [Incoming Teams](https://learn.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook?tabs=newteams%2Cdotnet)

## Google Drive

#### Requirement ที่จำเป็น
- Incoming Webhook Microsoft Teams URL [Incoming Teams](https://learn.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook?tabs=newteams%2Cdotnet)
- Service Account ( JSON File) [Google Cloud](https://console.cloud.google.com/)
- SCOPES
- Folder ID ( Folder ในการอัพโหลดภาพ )
- Permission in Folder ( การเพิ่ม Permission ภายใน Folder โดยการกำหนดสิทธิ์ให้ Client email ภายใน Service Account ไฟล์ มีสิทธิ์ ในการอัพโหลด หรือ ลบ ไฟล์ภาพได้ )




## Install Library

### Python

├── google-api-python-client==2.154.0

├── requests==2.31.0

├── google-auth==2.28.1

├── python-dotenv==1.0.1

└── google-auth-oauthlib==1.2.1

command  : `pip install requests google-api-python-client google-auth google-auth-oauthlib python-dotenv`


### Node.js

├── axios@1.7.8

├── dotenv@16.4.7

└── googleapis@144.0.0

command : `npm install axios@1.7.8 googleapis@144.0.0 dotenv@16.4.7`

