import { useRef, useState } from "react";

function UploadForm({ onUpload, loading }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  function updateSelectedFile(file) {
    setSelectedFile(file || null);
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (!selectedFile || loading) {
      return;
    }

    onUpload(selectedFile);
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];
    if (file) {
      updateSelectedFile(file);
    }
  }

  function handleDragOver(event) {
    event.preventDefault();
    if (!loading) {
      setIsDragging(true);
    }
  }

  function handleDragLeave(event) {
    event.preventDefault();
    setIsDragging(false);
  }

  function openFilePicker() {
    if (!loading) {
      inputRef.current?.click();
    }
  }

  return (
    <form className="upload-form" onSubmit={handleSubmit}>
      <input
        ref={inputRef}
        className="sr-only"
        type="file"
        accept=".pdf,.txt,application/pdf,text/plain"
        onChange={(event) => updateSelectedFile(event.target.files?.[0])}
        disabled={loading}
      />

      <div
        className={`upload-dropzone${isDragging ? " is-dragging" : ""}${selectedFile ? " has-file" : ""}`}
        onClick={openFilePicker}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        role="button"
        tabIndex={loading ? -1 : 0}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openFilePicker();
          }
        }}
      >
        <div className="upload-icon" aria-hidden="true">
          ↑
        </div>
        <div className="upload-copy">
          <p className="upload-title">Clique para selecionar um arquivo</p>
          <p className="upload-subtitle">ou arraste um PDF/TXT aqui</p>
        </div>

        <div className="selected-file" aria-live="polite">
          {selectedFile ? (
            <>
              <span className="selected-file-label">Arquivo selecionado</span>
              <strong className="selected-file-name">{selectedFile.name}</strong>
            </>
          ) : (
            <>
              <span className="selected-file-label">Nenhum arquivo selecionado</span>
              <strong className="selected-file-name">Escolha um documento para começar</strong>
            </>
          )}
        </div>
      </div>

      <button className="primary-button" type="submit" disabled={!selectedFile || loading}>
        {loading ? "Analisando..." : "Analisar documento"}
      </button>
    </form>
  );
}

export default UploadForm;
