import { useState, useEffect } from "react";
import Header from "./Header";
import TestMessage from "./TestMessage";
import "./index.css";

function App() {
  const [username, setUsername] = useState("");
  const [testMessage, setTestMessage] = useState("");
  const [messageType, setMessageType] = useState("success"); // 'success' or 'error'
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
      console.log("Got token:", token);
      setTestMessage("Token received!");
      setMessageType("success");
      testAuth(token);
    }
  }, []);

  async function testAuth(token) {
    try {
      const response = await fetch("http://localhost:5000/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ access_token: token })
      });

      const data = await response.json();
      console.log("Test response:", data);
      setTestMessage(data.message || "Test completed");
      setMessageType("success");
    } catch (error) {
      console.error("Test error:", error);
      setTestMessage("Test failed!");
      setMessageType("error");
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
            {loading ? "Loading..." : "Test Auth"}
          </button>
        </div>

        {testMessage && <TestMessage message={testMessage} type={messageType} />}
      </main>
    </>
  );
}

export default App;