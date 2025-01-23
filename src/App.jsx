import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [testMessage, setTestMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // "success" or "error"

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    console.log("URL token:", token);

    if (token) {
      console.log("Got token:", token);
      setTestMessage("Token received!");
      setMessageType("success");
      testAuth(token);
    } else {
      console.error("No token found in URL");
    }
  }, []);

  async function testAuth(token) {
    try {
      const response = await fetch("http://localhost:5000/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ access_token: token }),
      });

      if (!response.ok) {
        throw new Error("Failed to validate token");
      }

      const data = await response.json();
      console.log("Test response:", data);
      setTestMessage(data.message || "Test completed");
      setMessageType("success");
    } catch (error) {
      console.error("Test error:", error);
      setTestMessage("Token validation failed");
      setMessageType("error");
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>OAuth Authentication Test</h1>
        {testMessage && (
          <div className={`message ${messageType}`}>
            {testMessage}
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
