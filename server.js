import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:5173/callback";

app.use(cors());
app.use(express.json());

// Store code verifier temporarily (in production, use a proper session store)
let tempCodeVerifier = "";

app.get("/authorize", (req, res) => {
    const codeVerifier = generateCodeVerifier();
    tempCodeVerifier = codeVerifier; // Store temporarily
    
    const authUrl = `https://myanimelist.net/v1/oauth2/authorize?response_type=code&client_id=${CLIENT_ID}&code_challenge=${codeVerifier}&redirect_uri=${REDIRECT_URI}`;
    res.json({ auth_url: authUrl });
});

app.get("/callback", async (req, res) => {
    const { code } = req.query;
    
    try {
        const response = await fetch("https://myanimelist.net/v1/oauth2/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                code: code,
                code_verifier: tempCodeVerifier,
                grant_type: "authorization_code",
                redirect_uri: REDIRECT_URI
            })
        });

        const data = await response.json();
        
        // Send the token back to the frontend
        res.redirect(`http://localhost:5173?token=${data.access_token}`);
    } catch (error) {
        res.status(500).send("Authentication failed");
    }
});

app.post("/recommendations", async (req, res) => {
    const { access_token } = req.body;

    try {
        const response = await fetch("https://api.myanimelist.net/v2/users/@me/animelist?fields=list_status", {
            headers: {
                "Authorization": `Bearer ${access_token}`
            }
        });

        const data = await response.json();
        const recommendations = data.data?.slice(0, 5).map(item => ({
            title: item.node.title,
            score: item.list_status.score,
            genres: []
        })) || [];

        res.json({ recommendations });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch recommendations" });
    }
});

function generateCodeVerifier() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    let result = '';
    for (let i = 0; i < 128; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
