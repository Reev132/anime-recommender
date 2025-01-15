import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

app.use(cors());
app.use(express.json());

// OAuth authorization endpoint
app.get("/authorize", (req, res) => {
    const codeVerifier = generateCodeVerifier();
    const authUrl = `https://myanimelist.net/v1/oauth2/authorize?response_type=code&client_id=${CLIENT_ID}&code_challenge=${codeVerifier}`;
    res.json({ auth_url: authUrl, code_verifier: codeVerifier });
});

// Token exchange endpoint
app.post("/token", async (req, res) => {
    const { authorisation_code, code_verifier } = req.body;
    
    try {
        const response = await fetch("https://myanimelist.net/v1/oauth2/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                code: authorisation_code,
                code_verifier: code_verifier,
                grant_type: "authorization_code"
            })
        });

        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Failed to exchange token" });
    }
});

// Recommendations endpoint
app.post("/recommendations", async (req, res) => {
    const { access_token } = req.body;

    try {
        const response = await fetch("https://api.myanimelist.net/v2/users/@me/animelist?fields=list_status", {
            headers: {
                "Authorization": `Bearer ${access_token}`
            }
        });

        const data = await response.json();
        // Simple recommendation logic - just return the first 5 anime from the user's list
        const recommendations = data.data?.slice(0, 5).map(item => ({
            title: item.node.title,
            score: item.list_status.score,
            genres: [] // MAL API doesn't provide genres in this endpoint
        })) || [];

        res.json({ recommendations });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch recommendations" });
    }
});

// Helper function to generate code verifier
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
