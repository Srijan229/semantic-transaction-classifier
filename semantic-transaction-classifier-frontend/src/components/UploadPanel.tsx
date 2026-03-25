import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { classifyPastedDescriptions, uploadTransactionsCsv } from '../lib/api'
import type { UploadResponse } from '../lib/types'

type UploadPanelProps = {
  onComplete: (result: UploadResponse) => void
}

export function UploadPanel({ onComplete }: UploadPanelProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [mode, setMode] = useState<'csv' | 'paste'>('csv')
  const [pastedText, setPastedText] = useState('')
  const queryClient = useQueryClient()

  const parsedDescriptions = pastedText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  const handleSuccess = (result: UploadResponse) => {
    onComplete(result)
    void queryClient.invalidateQueries({ queryKey: ['transactions'] })
    void queryClient.invalidateQueries({ queryKey: ['transaction-summary'] })
  }

  const uploadMutation = useMutation({
    mutationFn: uploadTransactionsCsv,
    onSuccess: handleSuccess,
  })

  const pasteMutation = useMutation({
    mutationFn: classifyPastedDescriptions,
    onSuccess: (result) => {
      handleSuccess({
        importSummary: {
          totalRows: parsedDescriptions.length,
          acceptedRows: parsedDescriptions.length,
          rejectedRows: 0,
        },
        classificationSummary: {
          keywordMatched: result.keywordMatched,
          aiMatched: result.aiMatched,
          fallback: result.fallback,
        },
        rejectedRows: [],
        results: result.results,
      })
    },
  })

  return (
    <section className="panel upload-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Ingestion</p>
          <h2>Batch transaction input</h2>
        </div>
      </div>

      <div className="mode-toggle" role="tablist" aria-label="Input modes">
        <button
          type="button"
          className={mode === 'csv' ? 'toggle-pill active' : 'toggle-pill'}
          onClick={() => setMode('csv')}
        >
          CSV Upload
        </button>
        <button
          type="button"
          className={mode === 'paste' ? 'toggle-pill active' : 'toggle-pill'}
          onClick={() => setMode('paste')}
        >
          Paste Descriptions
        </button>
      </div>

      {mode === 'csv' ? (
        <>
          <div className="upload-dropzone">
            <p>Choose a CSV file with a required `description` column.</p>
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
            />
          </div>

          <div className="upload-actions">
            <button
              onClick={() => selectedFile && uploadMutation.mutate(selectedFile)}
              disabled={!selectedFile || uploadMutation.isPending}
            >
              {uploadMutation.isPending ? 'Uploading...' : 'Upload and classify'}
            </button>
            {selectedFile ? <span>{selectedFile.name}</span> : null}
          </div>
        </>
      ) : (
        <>
          <div className="upload-dropzone">
            <p>Paste one transaction description per line.</p>
            <textarea
              className="paste-textarea"
              value={pastedText}
              onChange={(event) => setPastedText(event.target.value)}
              placeholder={'DIVIDEND PAYMENT RECEIVED\nCLIENT CASH WITHDRAWAL\nMONTH END JOURNAL RECLASS ENTRY'}
            />
          </div>

          <div className="upload-actions">
            <button
              onClick={() => pasteMutation.mutate(parsedDescriptions)}
              disabled={parsedDescriptions.length === 0 || pasteMutation.isPending}
            >
              {pasteMutation.isPending ? 'Classifying...' : 'Classify pasted descriptions'}
            </button>
            <span>{parsedDescriptions.length} description(s) detected</span>
          </div>
        </>
      )}

      {uploadMutation.isError ? <p className="error-text">{uploadMutation.error.message}</p> : null}
      {pasteMutation.isError ? <p className="error-text">{pasteMutation.error.message}</p> : null}
    </section>
  )
}
