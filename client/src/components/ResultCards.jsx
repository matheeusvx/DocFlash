function ResultCards({ result }) {
  if (!result) {
    return null;
  }

  return (
    <section className="results-grid">
      <article className="result-card summary-card">
        <div className="card-head">
          <div>
            <p className="card-label">Resumo</p>
            <h2>Visão geral do documento</h2>
          </div>
          <span className="file-pill">{result.fileName}</span>
        </div>
        <p className="summary-text">{result.summary}</p>
      </article>

      <article className="result-card secondary-card">
        <p className="card-label">Pontos-chave</p>
        <h3>Destaques principais</h3>
        <ul className="result-list">
          {result.keyPoints.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </article>

      <article className="result-card secondary-card">
        <p className="card-label">Próximas ações</p>
        <h3>Sugestões de encaminhamento</h3>
        <ul className="result-list">
          {result.nextActions.map((action) => (
            <li key={action}>{action}</li>
          ))}
        </ul>
      </article>
    </section>
  );
}

export default ResultCards;
