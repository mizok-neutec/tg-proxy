# Telegram Bot Proxy API

這是一個基於 Vercel Serverless Functions 的 Telegram Bot 訊息代理 API，允許你通過 HTTP 請求來發送 Telegram 訊息。

## 功能特色

- 🚀 基於 Vercel Serverless Functions，部署簡單
- 🔧 支援任意 Telegram Bot Token
- 📱 支援發送到任意聊天室或用戶
- 🎨 支援 HTML 和 Markdown 格式
- 🔒 包含錯誤處理和參數驗證
- 🌐 支援 CORS 跨域請求

## 快速開始

### 1. 部署到 Vercel

1. Fork 或下載此專案
2. 在 Vercel 中導入專案
3. 部署完成後，你會得到一個類似 `https://your-project.vercel.app` 的 URL

### 2. 獲取 Telegram Bot Token

1. 在 Telegram 中找到 [@BotFather](https://t.me/BotFather)
2. 發送 `/newbot` 建立新的 Bot
3. 按照指示設定 Bot 名稱和用戶名
4. 獲取 Bot Token（格式：`123456789:ABCdefGhIJKlmNOPQrsTUVwxyZ`）

### 3. 獲取聊天室 ID

#### 方法一：私人聊天

1. 向你的 Bot 發送任意訊息
2. 訪問 `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
3. 在回應中找到 `chat.id`

#### 方法二：群組聊天

1. 將 Bot 加入群組
2. 在群組中發送包含 Bot 的訊息（例如：`@your_bot_name hello`）
3. 訪問 `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
4. 在回應中找到 `chat.id`（群組 ID 通常是負數）

## API 使用方法

### 端點

```text
POST https://your-project.vercel.app/api/send-message
```

### 請求參數

| 參數                    | 類型          | 必需 | 說明                                     |
| ----------------------- | ------------- | ---- | ---------------------------------------- |
| `botToken`              | string        | ✅   | Telegram Bot Token                       |
| `chatId`                | string/number | ✅   | 目標聊天室 ID 或用戶名                   |
| `message`               | string        | ✅   | 要發送的訊息內容                         |
| `parseMode`             | string        | ❌   | 訊息格式，預設為 `HTML`，可選 `Markdown` |
| `disableWebPagePreview` | boolean       | ❌   | 是否禁用網頁預覽，預設為 `false`         |

### 請求範例

#### 基本訊息

```bash
curl -X POST https://your-project.vercel.app/api/send-message \
  -H "Content-Type: application/json" \
  -d '{
    "botToken": "123456789:ABCdefGhIJKlmNOPQrsTUVwxyZ",
    "chatId": "987654321",
    "message": "Hello from Vercel!"
  }'
```

#### HTML 格式訊息

```bash
curl -X POST https://your-project.vercel.app/api/send-message \
  -H "Content-Type: application/json" \
  -d '{
    "botToken": "123456789:ABCdefGhIJKlmNOPQrsTUVwxyZ",
    "chatId": "987654321",
    "message": "<b>粗體</b> 和 <i>斜體</i> 文字",
    "parseMode": "HTML"
  }'
```

#### JavaScript (Fetch API)

```javascript
const response = await fetch(
  "https://your-project.vercel.app/api/send-message",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      botToken: "123456789:ABCdefGhIJKlmNOPQrsTUVwxyZ",
      chatId: "987654321",
      message: "來自 JavaScript 的訊息！",
      parseMode: "HTML",
    }),
  }
);

const result = await response.json();
console.log(result);
```

#### Python

```python
import requests

url = "https://your-project.vercel.app/api/send-message"
data = {
    "botToken": "123456789:ABCdefGhIJKlmNOPQrsTUVwxyZ",
    "chatId": "987654321",
    "message": "來自 Python 的訊息！"
}

response = requests.post(url, json=data)
print(response.json())
```

### 成功回應

```json
{
  "success": true,
  "message": "Message sent successfully",
  "messageId": 123,
  "chatId": 987654321,
  "date": 1640995200
}
```

### 錯誤回應

```json
{
  "error": "Missing bot token",
  "message": "botToken is required in the request body"
}
```

## 本地開發

### 安裝依賴

```bash
npm install
```

### 本地運行

```bash
npm run dev
```

API 將在 `http://localhost:3000/api/send-message` 運行。

### 測試

```bash
curl -X POST http://localhost:3000/api/send-message \
  -H "Content-Type: application/json" \
  -d '{
    "botToken": "your_bot_token",
    "chatId": "your_chat_id",
    "message": "測試訊息"
  }'
```

## 安全注意事項

⚠️ **重要安全提醒：**

1. **不要在前端代碼中暴露 Bot Token**
2. **考慮添加 API 認證機制**
3. **在生產環境中使用 HTTPS**
4. **定期更換 Bot Token**
5. **監控 API 使用情況**

## 錯誤碼說明

| HTTP 狀態碼 | 說明                             |
| ----------- | -------------------------------- |
| 200         | 訊息發送成功                     |
| 400         | 請求參數錯誤或 Telegram API 錯誤 |
| 405         | 不支援的 HTTP 方法               |
| 500         | 服務器內部錯誤                   |

## 進階功能

### 支援的訊息格式

#### HTML 格式 (預設)

```html
<b>粗體</b>
<i>斜體</i>
<u>底線</u>
<s>刪除線</s>
<code>程式碼</code>
<pre>程式碼區塊</pre>
<a href="https://example.com">連結</a>
```

#### Markdown 格式

```markdown
_粗體_
_斜體_
`程式碼`
[連結](https://example.com)
```

## 故障排除

### 常見問題

1. **Bot Token 無效**

   - 檢查 Token 格式是否正確
   - 確認 Bot 是否已被刪除

2. **聊天室 ID 錯誤**

   - 確認 Chat ID 格式正確
   - 群組 ID 通常為負數

3. **Bot 無法發送訊息**
   - 確認用戶已啟動與 Bot 的對話
   - 確認 Bot 已被加入群組且有發言權限

## 授權

MIT License

## 貢獻

歡迎提交 Issue 和 Pull Request！
