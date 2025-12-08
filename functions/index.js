// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const MikroNode = require('mikronode');

admin.initializeApp();

// 🔒 SECURITY WARNING: ideally use functions.config() for these in production
const ROUTER_CONFIG = {
    host: 'remoteanyx888.jrandombytes.com:31177', // e.g., 'myisp.sn.mynetname.net'
    port: 10443, // Default API port (Make sure this is open!)
    user: 'swiftnet_bot',
    password: 'swiftnet_bot'
};

exports.toggleSubscriber = functions.https.onCall(async (data, context) => {
    // 1. Security Check: Ensure the person clicking the button is logged in
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'You must be logged in.');
    }

    const { username, action } = data; // action will be 'cut' or 'restore'
    
    // 2. Connect to MikroTik
    // We create a new connection for every request
    const device = new MikroNode(ROUTER_CONFIG.host, ROUTER_CONFIG.port);
    
    try {
        const [login] = await device.connect();
        const conn = await login(ROUTER_CONFIG.user, ROUTER_CONFIG.password);
        const channel = conn.openChannel("api"); // Open API channel

        console.log(`Processing ${action} command for user: ${username}`);

        if (action === 'cut') {
            // STEP A: Find the PPP Secret ID
            channel.write('/ppp/secret/print', { '?name': username });
            const secretData = await channel.read();
            const secretId = secretData.data[0]?.[".id"];

            // STEP B: Disable the Secret (Prevents future login)
            if (secretId) {
                await channel.write('/ppp/secret/set', { '.id': secretId, 'disabled': 'yes' });
            }

            // STEP C: Find the Active Connection ID
            channel.write('/ppp/active/print', { '?name': username });
            const activeData = await channel.read();
            const activeId = activeData.data[0]?.[".id"];

            // STEP D: Kick the user immediately
            if (activeId) {
                await channel.write('/ppp/active/remove', { '.id': activeId });
            }
            
            device.close();
            return { success: true, message: `Subscriber ${username} has been CUT.` };

        } else if (action === 'restore') {
            // STEP A: Find the PPP Secret ID
            channel.write('/ppp/secret/print', { '?name': username });
            const secretData = await channel.read();
            const secretId = secretData.data[0]?.[".id"];

            // STEP B: Enable the Secret
            if (secretId) {
                await channel.write('/ppp/secret/set', { '.id': secretId, 'disabled': 'no' });
            }
            
            device.close();
            return { success: true, message: `Subscriber ${username} has been RESTORED.` };
        }

    } catch (error) {
        console.error("MikroTik Connection Error:", error);
        // Clean up connection if it failed halfway
        if(device) device.close(); 
        throw new functions.https.HttpsError('internal', 'Router Connection Failed: ' + error.message);
    }
});