import { useState } from "react";
import Header from "./Header"; // Import the Header component
import "./index.css";

function App() {
  const [username, setUsername] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function getData() {
    setError(""); // Clear previous errors
    setRecommendations([]); // Clear previous recommendations
    setLoading(true); // Start loading
  
    if (!username) {
      setError("Please enter a valid MyAnimeList username.");
      setLoading(false); // Stop loading
      return;
    }
  
    try {
      // Step 1: Get authorization URL and code verifier
      const authResponse = await fetch("http://localhost:5000/authorize");
      const authData = await authResponse.json();
  
      if (!authData.auth_url || !authData.code_verifier) {
        throw new Error("Failed to get authorization URL.");
      }
  
      // Open the authorization URL in a new tab
      window.open(authData.auth_url, "_blank");
  
      // Prompt user to paste the authorization code
      const authorisationCode = prompt("Paste the authorization code here:");
  
      // Step 2: Exchange authorization code for token
      const tokenResponse = await fetch("http://localhost:5000/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          authorisation_code: authorisationCode,
          code_verifier: authData.code_verifier,
        }),
      });
  
      const tokenData = await tokenResponse.json();
  
      if (!tokenResponse.ok || !tokenData.access_token) {
        throw new Error(tokenData.error || "Failed to get access token.");
      }
  
      // Step 3: Fetch recommendations
      const recommendationsResponse = await fetch(
        "http://localhost:5000/recommendations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ access_token: tokenData.access_token }),
        }
      );
  
      const recommendationsData = await recommendationsResponse.json();
  
      if (recommendationsResponse.ok) {
        setRecommendations(recommendationsData.recommendations);
      } else {
        setError(recommendationsData.error || "Failed to fetch recommendations.");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false); // Stop loading after request completes
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

        {/* Display error messages */}
        {error && <p style={{ color: "red", marginTop: "10px", fontWeight: "bold" }}>{error}</p>}

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
