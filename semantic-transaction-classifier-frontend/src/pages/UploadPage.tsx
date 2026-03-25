import { useState } from 'react'
import type { UploadResponse } from '../lib/types'
import { UploadPanel } from '../components/UploadPanel'

export function UploadPage() {
  const [lastUpload, setLastUpload] = useState<UploadResponse | null>(null)

  return (
    <div className="page-stack">
      <section className="hero-panel">
        <p className="eyebrow">Ingestion workflow</p>
        <h2>Import transaction batches from CSV</h2>
        <p>
          Upload synthetic transaction files, validate rows, classify accepted entries, and inspect rejected records immediately.
        </p>
      </section>

      <UploadPanel onComplete={setLastUpload} />

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Accepted format</p>
            <h2>Supported CSV columns</h2>
          </div>
        </div>

        <div className="code-block">transactionDate,description,amount,accountNumber,cusip</div>
      </section>

      {lastUpload ? (
        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Latest import</p>
              <h2>Upload results</h2>
            </div>
          </div>

          <div className="card-grid compact">
            <article className="metric-card">
              <p>Total rows</p>
              <strong>{lastUpload.importSummary.totalRows}</strong>
            </article>
            <article className="metric-card">
              <p>Accepted</p>
              <strong>{lastUpload.importSummary.acceptedRows}</strong>
            </article>
            <article className="metric-card">
              <p>Rejected</p>
              <strong>{lastUpload.importSummary.rejectedRows}</strong>
            </article>
            <article className="metric-card">
              <p>AI matched</p>
              <strong>{lastUpload.classificationSummary.aiMatched}</strong>
            </article>
          </div>

          <div className="split-grid">
            <div>
              <h3>Rejected rows</h3>
              {lastUpload.rejectedRows.length === 0 ? (
                <p>No rejected rows.</p>
              ) : (
                <ul className="result-list">
                  {lastUpload.rejectedRows.map((row, index) => (
                    <li key={`${row.rowNumber}-${index}`}>
                      Row {row.rowNumber ?? 'N/A'}: {row.error}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <h3>Saved results</h3>
              <ul className="result-list">
                {lastUpload.results.map((result) => (
                  <li key={result.transactionId}>
                    {result.predictedCategoryCode} · {result.description}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  )
}
