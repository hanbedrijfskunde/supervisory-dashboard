import { Modal } from '../common/Modal'
import { ExportImportPanel } from './ExportImportPanel'

/**
 * Settings modal with data management options
 */
export function SettingsModal({ isOpen, onClose, onDataChange }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Settings"
      size="lg"
    >
      <div className="space-y-6">
        <ExportImportPanel onDataChange={onDataChange} />
      </div>
    </Modal>
  )
}
