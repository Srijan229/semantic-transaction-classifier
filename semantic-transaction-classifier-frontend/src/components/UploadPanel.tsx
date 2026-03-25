import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { uploadTransactionsCsv } from '../lib/api'
import type { UploadResponse } from '../lib/types'

type UploadPanelProps = {
  onComplete: (result: UploadResponse) => void
}

export function UploadPanel({ onComplete }: UploadPanelProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const queryClient = useQueryClient()

  const uploadMutation = useMutation({
    mutationFn: uploadTransactionsCsv,
    onSuccess: (result) => {
      onComplete(result)
      void queryClient.invalidateQueries({ queryKey: ['transactions'] })
      void queryClient.invalidateQueries({ queryKey: ['transaction-summary'] })
    },
  })

  return (
    <section className="panel upload-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">CSV Import</p>
          <h2>Batch transaction upload</h2>
        </div>
      </div>

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

      {uploadMutation.isError ? <p className="error-text">{uploadMutation.error.message}</p> : null}
    </section>
  )
}
