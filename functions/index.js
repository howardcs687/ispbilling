const { onRequest } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

// This is the specific URL your router will hit
exports.syncMikrotik = onRequest(async (req, res) => {
  const secretKey = req.query.key;
  
  // 1. Security Check (Change this password!)
  if (secretKey !== "SWIFTNET_SECRET_123") {
    return res.status(403).send("Unauthorized Access");
  }

  // 2. The Router sends data in the 'body'
  // Structure: { username: "john", download: 123456, upload: 123456 }
  const { username, download, upload } = req.body;

  if (!username) return res.status(400).send("Missing username");

  try {
    // 3. Convert Bytes to Gigabytes (GB)
    // MikroTik sends bytes. We divide by 1073741824 to get GB.
    const dl_gb = (download / (1024 * 1024 * 1024));
    const ul_gb = (upload / (1024 * 1024 * 1024));

    // 4. Find the User in your Database
    // We look for a user whose 'username' matches the queue name
    const usersRef = db.collection('artifacts').doc('swiftnet-isp').collection('public').doc('data').collection('isp_users_v1');
    const q = usersRef.where('username', '==', username);
    const snapshot = await q.get();

    if (snapshot.empty) {
        console.log(`User ${username} not found in DB.`);
        return res.send("User not found");
    }

    const docId = snapshot.docs[0].id;

    // 5. Update the Database
    await db.doc(`artifacts/swiftnet-isp/public/data/isp_users_v1/${docId}`).update({
        usage: {
            download: dl_gb,
            upload: ul_gb,
            lastUpdated: new Date().toISOString()
        }
    });

    res.send(`Synced ${username}: ${dl_gb.toFixed(2)} GB`);

  } catch (error) {
    console.error("Sync Error:", error);
    res.status(500).send(error.message);
  }
});