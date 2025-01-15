import { useState, useEffect } from "react";
import Header from "./Header";
import "./index.css";

function App() {
  const [username, setUsername] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check for token in URL when the app loads
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
      console.log("Token received:", token); // Debug log
      fetchRecommendations(token);
      // Clean up the URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  async function getData() {
    if (!username) {
      setError("Please enter a username");
      return;
    }

    setError("");
    setRecommendations([]);
    setLoading(true);

    try {
      const authResponse = await fetch("http://localhost:5000/authorize");
      const authData = await authResponse.json();
      
      // Store username in localStorage before redirect
      localStorage.setItem('mal_username', username);
      
      // Redirect to MAL authorization page
      window.location.href = authData.auth_url;
    } catch (error) {
      console.error("Error:", error);
      setError("An unexpected error occurred");
      setLoading(false);
    }
  }

  async function fetchRecommendations(token) {
    try {
      // Retrieve username from localStorage
      const savedUsername = localStorage.getItem('mal_username');
      if (!savedUsername) {
        setError("Username not found");
        return;
      }

      const response = await fetch("http://localhost:5000/recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          access_token: token,
          username: savedUsername 
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setRecommendations(data.recommendations);
        // Clear stored username after successful fetch
        localStorage.removeItem('mal_username');
      } else {
        setError(data.error || "Failed to fetch recommendations");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setError("Failed to fetch recommendations");
    } finally {
      setLoading(false);
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
            placeholder="Enter your MyAnimeList username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <button className="submit-button" onClick={getData} disabled={loading}>
            {loading ? "Loading..." : "Get Recommendations!"}
          </button>
        </div>

        {error && <p style={{ color: "red", marginTop: "10px", fontWeight: "bold" }}>{error}</p>}

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
