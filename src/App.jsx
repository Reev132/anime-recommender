import Header from "./Header";
import "./index.css"; // Make sure your CSS is imported here

function App() {
    return (
      <>
        <Header />
        <main className="container">
          <div className="outer-square">
            <input type="text" className="center-input" placeholder="insert MyAnimeList profile link" />
            <button className="submit-button">get recommendations!</button>
          </div>
        </main>
      </>
    );
}

export default App;
