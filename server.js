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

app.get("/authorize", (req, res) => {
    const codeVerifier = generateCodeVerifier();
    tempCodeVerifier = codeVerifier;
    
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

app.post("/recommendations", async (req, res) => {
    const { access_token, username } = req.body;

    if (!access_token || !username) {
        return res.status(400).json({ error: "Missing access token or username" });
    }

    try {
        // First, verify the access token by getting user info
        const userResponse = await fetch("https://api.myanimelist.net/v2/users/@me", {
            headers: {
                "Authorization": `Bearer ${access_token}`
            }
        });

        if (!userResponse.ok) {
            throw new Error("Invalid access token");
        }

        // Then fetch the user's anime list
        const animeListResponse = await fetch(
            `https://api.myanimelist.net/v2/users/${username}/animelist?fields=list_status,genres`,
            {
                headers: {
                    "Authorization": `Bearer ${access_token}`
                }
            }
        );

        if (!animeListResponse.ok) {
            throw new Error("Failed to fetch anime list");
        }

        const animeListData = await animeListResponse.json();
        
        // Process the anime list to create recommendations
        const recommendations = animeListData.data
            .slice(0, 5)
            .map(item => ({
                title: item.node.title,
                score: item.list_status.score || "No score",
                genres: [] // MAL API doesn't provide genres in this endpoint
            }));

        res.json({ recommendations });
    } catch (error) {
        console.error("Recommendations error:", error);
        res.status(500).json({ error: error.message || "Failed to fetch recommendations" });
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

// Add this new test endpoint after your other routes
app.post("/test-recommendations", async (req, res) => {
    const { access_token } = req.body;

    if (!access_token) {
        return res.status(400).json({ error: "Missing access token" });
    }

    try {
        // Test the access token by making a simple API call
        const testResponse = await fetch("https://api.myanimelist.net/v2/users/@me", {
            headers: {
                "Authorization": `Bearer ${access_token}`
            }
        });

        if (testResponse.ok) {
            const userData = await testResponse.json();
            console.log("Test successful for user:", userData.name);
            res.json({ 
                message: "Test successful", 
                username: userData.name 
            });
        } else {
            throw new Error("Failed to verify access token");
        }
    } catch (error) {
        console.error("Test failed:", error);
        res.status(500).json({ error: error.message || "Test failed" });
    }
});
