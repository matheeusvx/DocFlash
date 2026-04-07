import { useState } from "react";

function UploadForm({ onUpload, loading }) {
  const [selectedFile, setSelectedFile] = useState(null);

  function handleSubmit(event) {
    event.preventDefault();

    if (!selectedFile || loading) {
      return;
    }

    onUpload(selectedFile);
  }

  return (
    <form className="upload-form" onSubmit={handleSubmit}>
      <label className="upload-input">
        <span>Selecione um arquivo PDF ou TXT</span>
        <input
          type="file"
          accept=".pdf,.txt,application/pdf,text/plain"
          onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
          disabled={loading}
        />
      </label>

      <button className="primary-button" type="submit" disabled={!selectedFile || loading}>
        {loading ? "Enviando..." : "Analisar arquivo"}
      </button>

      <p className="helper-text">
        Arquivos aceitos: PDF ou TXT com ate 10 MB.
      </p>
    </form>
  );
}

export default UploadForm;
