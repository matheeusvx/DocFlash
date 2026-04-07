function ResultCards({ result }) {
  if (!result) {
    return null;
  }

  return (
    <section className="results-grid">
      <article className="result-card summary-card">
        <p className="card-label">Resumo</p>
        <h2>{result.fileName}</h2>
        <p>{result.summary}</p>
      </article>

      <article className="result-card">
        <p className="card-label">Pontos-chave</p>
        <ul>
          {result.keyPoints.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
      </article>

      <article className="result-card">
        <p className="card-label">Proximas acoes</p>
        <ul>
          {result.nextActions.map((action) => (
            <li key={action}>{action}</li>
          ))}
        </ul>
      </article>
    </section>
  );
}

export default ResultCards;
