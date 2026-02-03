import { useState, useRef } from 'react'
import { Button } from '../common/Button'
import { Modal } from '../common/Modal'
import { exportService } from '../../services/exportService'
import { importService } from '../../services/importService'
import { storageService } from '../../services/storageService'

/**
 * Panel for exporting and importing data
 */
export function ExportImportPanel({ onDataChange }) {
  const [showImportModal, setShowImportModal] = useState(false)
  const [importData, setImportData] = useState(null)
  const [importValidation, setImportValidation] = useState(null)
  const [importMode, setImportMode] = useState('replace')
  const [importResult, setImportResult] = useState(null)
  const fileInputRef = useRef(null)

  const exportStats = exportService.getExportStats()
  const storageUsage = storageService.getStorageUsage()

  // Format bytes to human readable
  const formatBytes = (bytes) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  }

  const handleExport = () => {
    exportService.downloadAsFile()
  }

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const content = await importService.readFile(file)
      const parsed = importService.parseJSON(content)
      const validation = importService.validate(parsed)

      setImportData(parsed)
      setImportValidation(validation)
      setImportResult(null)
      setShowImportModal(true)
    } catch {
      setImportValidation({ valid: false, errors: ['Failed to read file'], stats: null })
      setShowImportModal(true)
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleImport = () => {
    if (!importData || !importValidation?.valid) return

    let result
    if (importMode === 'replace') {
      const success = importService.importReplace(importData)
      result = { success, mode: 'replace' }
    } else {
      result = { ...importService.importMerge(importData), mode: 'merge' }
    }

    setImportResult(result)

    if (result.success) {
      onDataChange?.()
    }
  }

  const closeImportModal = () => {
    setShowImportModal(false)
    setImportData(null)
    setImportValidation(null)
    setImportResult(null)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Management</h3>

      {/* Storage usage */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Storage used</span>
          <span>{formatBytes(storageUsage)}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full"
            style={{ width: `${Math.min((storageUsage / (5 * 1024 * 1024)) * 100, 100)}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {exportStats.groupCount} groups, {exportStats.studentCount} students, {exportStats.noteCount} notes
        </p>
      </div>

      {/* Export section */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Export Data</h4>
        <p className="text-sm text-gray-500 mb-3">
          Download all your data as a JSON file for backup or transfer.
        </p>
        <Button onClick={handleExport} variant="secondary">
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export Backup
        </Button>
      </div>

      {/* Import section */}
      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Import Data</h4>
        <p className="text-sm text-gray-500 mb-3">
          Restore data from a previously exported JSON file.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleFileSelect}
          className="hidden"
          data-testid="import-file-input"
        />
        <Button onClick={() => fileInputRef.current?.click()} variant="secondary">
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Import Backup
        </Button>
      </div>

      {/* Import Modal */}
      <Modal
        isOpen={showImportModal}
        onClose={closeImportModal}
        title="Import Data"
      >
        {importResult ? (
          // Show result
          <div className="space-y-4">
            {importResult.success ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-700">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="font-medium">Import successful!</span>
                </div>
                {importResult.mode === 'merge' && (
                  <p className="text-sm text-green-600 mt-2">
                    Added {importResult.templatesAdded} templates, {importResult.groupsAdded} groups.
                    {importResult.groupsSkipped > 0 && ` Skipped ${importResult.groupsSkipped} existing groups.`}
                  </p>
                )}
                {importResult.mode === 'replace' && (
                  <p className="text-sm text-green-600 mt-2">
                    All data has been replaced with the imported backup.
                  </p>
                )}
              </div>
            ) : (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-700">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span className="font-medium">Import failed</span>
                </div>
              </div>
            )}
            <div className="flex justify-end">
              <Button onClick={closeImportModal}>Close</Button>
            </div>
          </div>
        ) : importValidation?.valid ? (
          // Valid file - show options
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <span className="font-medium">Ready to import:</span> {importValidation.stats?.groupCount} groups,{' '}
                {importValidation.stats?.studentCount} students, {importValidation.stats?.noteCount} notes
              </p>
              {importValidation.stats?.exportedAt && (
                <p className="text-xs text-blue-600 mt-1">
                  Exported on: {new Date(importValidation.stats.exportedAt).toLocaleString()}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Import mode:</label>
              <div className="space-y-2">
                <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="importMode"
                    value="replace"
                    checked={importMode === 'replace'}
                    onChange={() => setImportMode('replace')}
                    className="mt-0.5"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Replace all data</p>
                    <p className="text-sm text-gray-500">Deletes existing data and replaces with imported data</p>
                  </div>
                </label>
                <label className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="importMode"
                    value="merge"
                    checked={importMode === 'merge'}
                    onChange={() => setImportMode('merge')}
                    className="mt-0.5"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Merge with existing</p>
                    <p className="text-sm text-gray-500">Adds new groups and templates, keeps existing ones</p>
                  </div>
                </label>
              </div>
            </div>

            {importMode === 'replace' && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-700">
                  <span className="font-medium">Warning:</span> This will delete all your current data. Make sure you have a backup if needed.
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={closeImportModal}>Cancel</Button>
              <Button onClick={handleImport}>
                {importMode === 'replace' ? 'Replace Data' : 'Merge Data'}
              </Button>
            </div>
          </div>
        ) : (
          // Invalid file
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700 mb-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="font-medium">Invalid import file</span>
              </div>
              <ul className="text-sm text-red-600 list-disc list-inside">
                {importValidation?.errors.map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            </div>
            <div className="flex justify-end">
              <Button variant="secondary" onClick={closeImportModal}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
