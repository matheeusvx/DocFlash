import { useRef, useState } from "react";

function UploadForm({ onUpload, loading }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [validationError, setValidationError] = useState("");
  const fileInputRef = useRef(null);

  function handleFileChange(event) {
    const file = event.target.files?.[0] || null;
    setValidationError("");
    setSelectedFile(file);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!selectedFile) {
      setValidationError("Selecione um arquivo PDF ou TXT antes de enviar.");
      return;
    }

    await onUpload(selectedFile);
  }

  function clearSelection() {
    setSelectedFile(null);
    setValidationError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <form className="panel upload-panel" onSubmit={handleSubmit}>
      <div>
        <p className="panel-label">Upload</p>
        <h2>Envie seu documento</h2>
        <p className="panel-copy">
          Arquivos aceitos: PDF e TXT com ate 10 MB.
        </p>
      </div>

      <label className="dropzone" htmlFor="document">
        <input
          ref={fileInputRef}
          id="document"
          type="file"
          accept=".pdf,.txt"
          onChange={handleFileChange}
          disabled={loading}
        />
        <span>{selectedFile ? selectedFile.name : "Clique para escolher o arquivo"}</span>
      </label>

      {validationError ? <p className="status error">{validationError}</p> : null}

      <div className="actions-row">
        <button type="submit" disabled={loading}>
          {loading ? "Processando..." : "Enviar arquivo"}
        </button>
        <button type="button" className="ghost-button" onClick={clearSelection} disabled={loading}>
          Limpar
        </button>
      </div>
    </form>
  );
}

export default UploadForm;
