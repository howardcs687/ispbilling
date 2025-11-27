const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();

// This is the URL your router will talk to
exports.syncMikrotik = functions.https.onRequest(async (req, res) => {
  // 1. Security Check (So random people don't update your data)
  const secretKey = req.query.key; 
  if (secretKey !== "MY_SUPER_SECRET_PASSWORD_123") {
    return res.status(403).send("Unauthorized");
  }

  // 2. Get Data from Router
  // Router sends JSON: { "username": "john", "up": 1000, "down": 5000 }
  const { username, up, down } = req.body;

  if (!username) return res.status(400).send("No username");

  try {
    // 3. Convert Bytes to GB
    const dl_gb = (down / (1024 * 1024 * 1024)).toFixed(2);
    const ul_gb = (up / (1024 * 1024 * 1024)).toFixed(2);

    // 4. Find User in DB and Update
    // Note: This assumes your Firestore collection is 'isp_users_v1'
    const usersRef = db.collection('artifacts').doc('swiftnet-isp').collection('public').doc('data').collection('isp_users_v1');
    const snapshot = await usersRef.where('username', '==', username).get();

    if (snapshot.empty) {
        return res.send(`User ${username} not found in DB`);
    }

    const userId = snapshot.docs[0].id;

    await db.doc(`artifacts/swiftnet-isp/public/data/isp_users_v1/${userId}`).update({
        usage: {
            download: parseFloat(dl_gb),
            upload: parseFloat(ul_gb),
            lastUpdated: new Date().toISOString()
        }
    });

    res.send(`Updated ${username}`);
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
});