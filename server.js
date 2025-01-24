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

let tempCodeVerifier = "";

// Generate code verifier for PKCE
function generateCodeVerifier() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    let result = '';
    for (let i = 0; i < 128; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

// OAuth2 authorization endpoint
app.get("/authorize", (req, res) => {
    const codeVerifier = generateCodeVerifier();
    tempCodeVerifier = codeVerifier;
    console.log("Generated code verifier:", codeVerifier);

    const authUrl = `https://myanimelist.net/v1/oauth2/authorize?response_type=code&client_id=${CLIENT_ID}&code_challenge=${codeVerifier}&redirect_uri=${REDIRECT_URI}`;
    res.json({ auth_url: authUrl });
});

// Callback endpoint to exchange code for an access token
app.get("/callback", async (req, res) => {
    const { code } = req.query;
    console.log("Received code:", code);

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
        console.log("Token response:", data);

        if (data.access_token) {
            res.redirect(`http://localhost:5173?token=${data.access_token}`);
        } else {
            res.status(400).send("Failed to get access token");
        }
    } catch (error) {
        console.error("Token exchange error:", error);
        res.status(500).send("Authentication failed");
    }
});

// Recommendations endpoint
app.post("/recommendations", async (req, res) => {
    const { access_token } = req.body;

    try {
        const response = await fetch("https://api.myanimelist.net/v2/anime/recommendations", {
            headers: {
                "Authorization": `Bearer ${access_token}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            res.json({ recommendations: data });
        } else {
            res.status(500).json({ message: "Failed to fetch recommendations" });
        }
    } catch (error) {
        console.error("Recommendations endpoint error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
