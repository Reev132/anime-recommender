import Header from "./Header";
import "./index.css"; // Make sure your CSS is imported here

function App() {
    return (
      <>
        <Header />
        <main className="container">
          <div className="outer-square">
            <input type="text" className="center-input" placeholder="insert MyAnimeList profile link" />
            <button className="submit-button" onClick={getData}>get recommendations!</button>
          </div>
        </main>
      </>
    );
}

async function getData() {
  const profileLink = document.querySelector(".center-input").value;

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
          console.log("Recommendations:", data.recommendations);
          alert("Success! Check the console for recommendations.");
      } else {
          console.error("Error:", data.error);
          alert("Error: " + data.error);
      }
  } catch (error) {
      console.error("Fetch error:", error);
      alert("An error occurred while fetching recommendations.");
  }
}



export default App;
