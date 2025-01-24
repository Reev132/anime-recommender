import { useState, useEffect } from "react";
import Header from "./Header";
import TestMessage from "./TestMessage";
import "./index.css";

function App() {
  const [username, setUsername] = useState("");
  const [testMessage, setTestMessage] = useState("");
  const [messageType, setMessageType] = useState("success");
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState([]); // For storing recommendations

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    if (token) {
      console.log("Got token:", token);
      setTestMessage("Token received!");
      setMessageType("success");
      fetchRecommendations(token);
    }
  }, []);

  async function fetchRecommendations(token) {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/recommendations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ access_token: token }),
      });

      const data = await response.json();
      console.log("Recommendations response:", data);
      setRecommendations(data.recommendations || []);
      setMessageType("success");
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      setTestMessage("Failed to load recommendations.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  }

  async function getData() {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/authorize");
      const data = await response.json();
      console.log("Auth URL received:", data.auth_url);
      window.location.href = data.auth_url;
    } catch (error) {
      console.error("Error:", error);
      setTestMessage("Error getting auth URL");
      setMessageType("error");
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
            {loading ? "Loading..." : "Get Recommendations"}
          </button>
        </div>

        {testMessage && <TestMessage message={testMessage} type={messageType} />}

        {/* Display Recommendations */}
        {recommendations.length > 0 && (
          <div className="recommendations">
            <h2>Anime Recommendations:</h2>
            <ul>
              {recommendations.map((rec, index) => (
                <li key={index}>{rec.title}</li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </>
  );
}

export default App;
