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
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ error: "Username is required" });
    }

    try {
        const response = await fetch(`https://api.myanimelist.net/v2/users/${username}/animelist?fields=list_status,genres,score`, {
            headers: {
                "X-MAL-CLIENT-ID": CLIENT_ID,
            },
        });

        if (!response.ok) {
            return res.status(response.status).json({ error: "Failed to fetch data from MAL" });
        }

        const data = await response.json();
        const recommendations = generateRecommendations(data);
        res.json({ recommendations });
    } catch (error) {
        res.status(500).json({ error: "An error occurred while processing the request" });
    }
});

function generateRecommendations(data) {
    // Simple recommendation logic
    return data.data
        .filter(item => item.list_status.score >= 8)
        .map(item => ({
            title: item.node.title,
            score: item.list_status.score,
            genres: item.node.genres.map(genre => genre.name)
        }))
        .slice(0, 5);  // Return top 5 recommendations
}

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
