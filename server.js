import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_ID = process.env.CLIENT_ID;

app.use(cors());
app.use(express.json());

app.post("/recommendations", async (req, res) => {
    console.log("Request received:", req.body);
    const { profileLink } = req.body;

    if (!profileLink) {
        console.log("No profile link provided");
        return res.status(400).json({ error: "Profile link is required" });
    }

    try {
        console.log("Extracting username from:", profileLink);
        const username = extractUsername(profileLink);
        if (!username) {
            console.log("Invalid profile link");
            return res.status(400).json({ error: "Invalid MyAnimeList profile link" });
        }

        console.log("Username extracted:", username);
        //console.log("CLIENT_ID:", CLIENT_ID ? "Set" : "Not set");

        console.log("Fetching data from MAL API");
        const response = await fetch(`https://api.myanimelist.net/v2/users/${username}/animelist?fields=list_status,genres,score`, {
            method: "GET",
            headers: {
                "X-MAL-CLIENT-ID": CLIENT_ID,
            },
        });

        console.log("MAL API Response Status:", response.status);
        if (!response.ok) {
            const errorMessage = await response.text();
            console.error("MAL API Error:", errorMessage);
            return res.status(response.status).json({ error: errorMessage });
        }

        const data = await response.json();
        console.log("Data received from MAL API");
        const recommendations = generateRecommendations(data);
        res.json({ recommendations });
    } catch (error) {
        console.error("Error in /recommendations route:", error);
        res.status(500).json({ error: "An error occurred while processing the request" });
    }
    console.log("Request processing completed");
});

function extractUsername(profileLink) {
    const match = profileLink.match(/https?:\/\/myanimelist\.net\/profile\/(\w+)/);
    return match ? match[1] : null;
}

function generateRecommendations(data) {
    // This is a placeholder function. Implement your actual recommendation logic here.
    const animeList = data.data || [];
    const sortedList = animeList.sort((a, b) => b.list_status.score - a.list_status.score);
    return sortedList.slice(0, 5).map(anime => ({
        title: anime.node.title,
        score: anime.list_status.score,
        genres: anime.node.genres ? anime.node.genres.map(genre => genre.name) : []
    }));
}

// Test route
app.get("/test", (req, res) => {
    console.log("Test route hit");
    res.json({ message: "Server is running", clientIdSet: !!CLIENT_ID });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`CLIENT_ID is ${CLIENT_ID ? 'set' : 'not set'}`);
});
