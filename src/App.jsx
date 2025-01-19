import { useState, useEffect } from "react";
import Header from "./Header";
import "./index.css";

function App() {
  const [username, setUsername] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [testStatus, setTestStatus] = useState(""); // Add this line

  useEffect(() => {
    // Check for token in URL when the app loads
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
      console.log("Token received:", token);
      testRecommendations(token); // Changed this line
    }
  }, []);

  // Add this new test function
  async function testRecommendations(token) {
    try {
      const response = await fetch("http://localhost:5000/test-recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ access_token: token }),
      });

      const data = await response.json();
      if (response.ok) {
        setTestStatus("Recommendations working!"); // Success message
        console.log("Test successful:", data);
      } else {
        setTestStatus("Recommendations failed!"); // Failure message
        console.error("Test failed:", data.error);
      }
    } catch (error) {
      setTestStatus("Recommendations failed!"); // Failure message
      console.error("Test error:", error);
    } finally {
      setLoading(false);
    }
  }

  async function getData() {
    if (!username) {
      setError("Please enter a username");
      return;
    }

    setError("");
    setTestStatus(""); // Clear previous test status
    setLoading(true);

    try {
      const authResponse = await fetch("http://localhost:5000/authorize");
      const authData = await authResponse.json();
      
      localStorage.setItem('mal_username', username);
      window.location.href = authData.auth_url;
    } catch (error) {
      console.error("Error:", error);
      setError("An unexpected error occurred");
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

        {/* Add this test status display */}
        {testStatus && (
          <p style={{ 
            color: testStatus.includes("working") ? "green" : "red",
            marginTop: "10px", 
            fontWeight: "bold" 
          }}>
            {testStatus}
          </p>
        )}

        {error && <p style={{ color: "red", marginTop: "10px", fontWeight: "bold" }}>{error}</p>}
      </main>
    </>
  );
}

export default App;
