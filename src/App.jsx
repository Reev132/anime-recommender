import { useState } from "react";
import Header from "./Header"; // Import the Header component
import "./index.css";

function App() {
  const [profileLink, setProfileLink] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState("");

  // Fetch recommendations from the backend
  async function getData() {
    setError(""); // Clear previous errors
    setRecommendations([]); // Clear previous recommendations

    if (!profileLink) {
      setError("Please enter a valid MyAnimeList profile link.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ profileLink }),
      });

      const data = await response.json();

      if (response.ok) {
        setRecommendations(data.recommendations);
      } else {
        setError(data.error || "Failed to fetch recommendations.");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("An unexpected error occurred. Please try again.");
    }
  }

  return (
    <>
      <Header />
      <main className="container">
        <div className="outer-square">
          <input
            type="text"
            className="center-input"
            placeholder="Insert MyAnimeList profile link"
            value={profileLink}
            onChange={(e) => setProfileLink(e.target.value)}
          />
          <button className="submit-button" onClick={getData}>
            Get Recommendations!
          </button>
        </div>

        {/* Display error messages */}
        {error && <p style={{ color: "red", marginTop: "10px" , fontWeight: "bold"}}>{error}</p>}

        {/* Display recommendations */}
        {recommendations.length > 0 && (
          <div className="recommendations">
            <h2>Recommended Anime</h2>
            <ul>
              {recommendations.map((anime, index) => (
                <li key={index}>
                  <strong>{anime.title}</strong> (Score: {anime.score})<br />
                  Genres: {anime.genres.join(", ")}
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </>
  );
}

export default App;
