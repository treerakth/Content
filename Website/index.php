<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Send Content to Microsoft Teams</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f4f4f9;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        h1, h2 {
            margin-bottom: 20px;
        }
        form {
            max-width: 600px;
            background: #fff;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        textarea, input[type="file"], input[type="text"] {
            width: 100%;
            margin: 10px 0;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 4px;
            box-sizing: border-box;
        }
        button {
            padding: 10px 20px;
            background-color: #0078d4;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        button:hover {
            background-color: #005a9e;
        }
        table {
            max-width: 600px;
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            background: #fff;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        table, th, td {
            border: 1px solid #ddd;
        }
        th, td {
            padding: 10px;
            text-align: left;
        }
        th {
            background-color: #f4f4f4;
        }
        .pagination {
            display: flex;
            justify-content: center;
            list-style: none;
            padding: 0;
        }
        .pagination li {
            margin: 0 5px;
        }
        .pagination a {
            text-decoration: none;
            padding: 8px 12px;
            border: 1px solid #ddd;
            color: #333;
        }
        .pagination a.active {
            background-color: #0078d4;
            color: #fff;
        }
    </style>
    <script>
        function showPopup(message) {
            alert(message);
        }
        function updateTable(title, time) {
            const table = document.getElementById('messageTableBody');
            const row = table.insertRow(0);
            const cell1 = row.insertCell(0);
            const cell2 = row.insertCell(1);
            cell1.innerHTML = title;
            cell2.innerHTML = time;
        }
        function handleSubmit(event) {
            event.preventDefault();
            const title = document.getElementById('title').value;
            const details = document.getElementById('details').value;
            const image = document.getElementById('image').files[0];
            const currentTime = new Date().toLocaleString();
            const formData = new FormData();
            formData.append('title', title);
            formData.append('details', details);
            formData.append('image', image);

            fetch('send_content.php', {
                method: 'POST',
                body: formData
            }).then(response => response.text())
            .then(result => {
                showPopup(result);
                updateTable(title, currentTime);
                document.getElementById('title').value = '';
                document.getElementById('details').value = '';
                document.getElementById('image').value = '';
            }).catch(error => {
                showPopup('Failed to send message: ' + error);
            });
        }
    </script>
</head>
<body>
    <h1>Send Content to Microsoft Teams</h1>
    <form id="messageForm" onsubmit="handleSubmit(event)" enctype="multipart/form-data">
        <label for="title">หัวข้อ : </label>
        <input type="text" name="title" id="title" placeholder="พิมพ์หัวข้อ" required>

        <label for="details">รายละเอียด : </label>
        <textarea name="details" id="details" rows="4" placeholder="พิมพ์รายละเอียด" required></textarea>

        <label for="image">แนบรูปภาพ (ไม่บังคับ) : </label>
        <input type="file" name="image" id="image" accept="image/*">

        <button type="submit">ส่ง</button>
    </form>

    <h2>Message History</h2>
    <table>
        <thead>
            <tr>
                <th>Message</th>
                <th>Timestamp</th>
            </tr>
        </thead>
        <tbody id="messageTableBody">
            <?php
            $filePath = 'History.json';
            $currentPage = isset($_GET['page']) ? (int)$_GET['page'] : 1;
            $itemsPerPage = 5;

            function getMessageHistory($filePath, $currentPage, $itemsPerPage) {
                if (!file_exists($filePath)) {
                    return ["messages" => [], "totalPages" => 1];
                }

                $messages = json_decode(file_get_contents($filePath), true) ?: [];
                $totalItems = count($messages);
                $totalPages = ceil($totalItems / $itemsPerPage);
                $startIndex = ($currentPage - 1) * $itemsPerPage;
                return [
                    "messages" => array_slice($messages, $startIndex, $itemsPerPage),
                    "totalPages" => $totalPages
                ];
            }

            $history = getMessageHistory($filePath, $currentPage, $itemsPerPage);
            foreach ($history['messages'] as $index => $message): ?>
                <tr>
                    <td><?= htmlspecialchars($message['message']) ?></td>
                    <td><?= htmlspecialchars($message['timestamp']) ?></td>
                </tr>
            <?php endforeach; ?>
        </tbody>
    </table>

    <ul class="pagination">
        <?php for ($page = 1; $page <= $history['totalPages']; $page++): ?>
            <li>
                <a href="?page=<?= $page ?>" class="<?= $page == $currentPage ? 'active' : '' ?>">
                    <?= $page ?>
                </a>
            </li>
        <?php endfor; ?>
    </ul>
</body>
</html>
