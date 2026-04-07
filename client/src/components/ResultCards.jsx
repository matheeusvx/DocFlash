function ResultCards({ result, loading, error }) {
  const hasResult = Boolean(result);

  return (
    <section className="panel results-panel">
      <div>
        <p className="panel-label">Resultado</p>
        <h2>Insights estruturados</h2>
      </div>

      {loading ? (
        <div className="empty-state">
          <div className="loader" />
          <p>Extraindo texto e montando os insights...</p>
        </div>
      ) : null}

      {!loading && error ? <p className="status error">{error}</p> : null}

      {!loading && !error && !hasResult ? (
        <div className="empty-state">
          <p>O JSON processado aparecera aqui depois do upload.</p>
        </div>
      ) : null}

      {!loading && hasResult ? (
        <div className="cards-stack">
          <article className="result-card accent">
            <span>Resumo</span>
            <p>{result.summary}</p>
          </article>

          <article className="result-card">
            <span>Pontos-chave</span>
            <ul>
              {result.keyPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </article>

          <article className="result-card">
            <span>Proximas acoes</span>
            <ul>
              {result.nextActions.map((action) => (
                <li key={action}>{action}</li>
              ))}
            </ul>
          </article>

          <article className="result-card code-card">
            <span>JSON bruto</span>
            <pre>{JSON.stringify(result, null, 2)}</pre>
          </article>
        </div>
      ) : null}
    </section>
  );
}

export default ResultCards;
