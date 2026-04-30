const fs = require('fs');

async function test() {
  const formData = new FormData();
  // Read real image
  const imgData = fs.readFileSync('D:\\AITD_Hack\\aitd_hack\\sample.jpg');
  const blob = new Blob([imgData], { type: 'image/jpeg' });
  formData.append('file', blob, 'test_image.jpg');
  formData.append('location', 'Test Loc');
  formData.append('item_type', 'found');
  formData.append('timestamp', new Date().toISOString());

  try {
    const res = await fetch('http://localhost:8000/process_item', {
      method: 'POST',
      body: formData
    });
    console.log("Status:", res.status);
    const json = await res.json();
    console.log("Keys returned:", Object.keys(json));
    console.log("Has embedding:", !!json.embedding);
    if (json.embedding) {
      console.log("Embedding length:", json.embedding.length);
    } else {
      console.log("Full response:", json);
    }
  } catch(e) {
    console.error("Error:", e);
  }
}
test();
