// api/send-sms.js
export default async function handler(req, res) {
  // 1. Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 2. Get data from the frontend
  const { phone, message } = req.body;

  // 3. Get API Key from Vercel Environment Variables (Secure)
  const API_KEY = process.env.PHILSMS_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ error: 'Server Error: Missing API Key' });
  }

  try {
    // 4. Send to PhilSMS (Server-to-Server)
    const response = await fetch("https://app.philsms.com/api/v3/sms/send", {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        recipient: phone,
        sender_id: "PhilSMS", // Change this if you have a registered Sender ID
        type: 'plain',
        message: message
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ success: false, error: data.message });
    }

    // 5. Success!
    return res.status(200).json({ success: true, data });

  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}