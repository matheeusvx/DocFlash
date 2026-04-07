import { useState } from "react";
import UploadForm from "./components/UploadForm.jsx";
import ResultCards from "./components/ResultCards.jsx";

const API_URL = "http://localhost:3001/api/upload";

function App() {
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleUpload(file) {
    setLoading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("document", file);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Nao foi possivel processar o arquivo.");
      }

      setResult(data);
    } catch (requestError) {
      setError(requestError.message || "Ocorreu um erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">React + Vite + Express</p>
        <h1>Analise PDFs e TXTs em segundos</h1>
        <p className="hero-copy">
          Envie um documento, extraia o texto no backend e receba um JSON com
          resumo, pontos-chave e proximas acoes.
        </p>
      </section>

      <section className="content-grid">
        <UploadForm onUpload={handleUpload} loading={loading} />
        <ResultCards result={result} loading={loading} error={error} />
      </section>
    </main>
  );
}

export default App;
