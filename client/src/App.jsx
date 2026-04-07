import { useState } from "react";
import UploadForm from "./components/UploadForm";
import ResultCards from "./components/ResultCards";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3002/api/upload";

function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleUpload(file) {
    const formData = new FormData();
    formData.append("document", file);

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        body: formData
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Falha ao processar o arquivo.");
      }

      setResult(data);
    } catch (uploadError) {
      setError(uploadError.message || "Erro inesperado ao enviar o arquivo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">DocFlash</p>
        <h1>Transforme PDFs e TXTs em insights acionáveis.</h1>
        <p className="hero-copy">
          Envie um documento e receba um resumo claro, pontos-chave e próximas ações em uma
          interface simples, moderna e direta ao ponto.
        </p>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="panel-label">Análise de documentos</p>
            <h2>Faça upload do seu arquivo</h2>
          </div>
          <p className="panel-copy">Formatos aceitos: PDF e TXT com até 10 MB.</p>
        </div>

        <UploadForm onUpload={handleUpload} loading={loading} />
        {error ? <p className="status error">{error}</p> : null}
        {loading ? <p className="status loading">Processando o documento...</p> : null}
      </section>

      <ResultCards result={result} />
    </main>
  );
}

export default App;
