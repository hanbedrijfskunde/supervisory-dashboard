import { useState } from 'react'
import { Modal } from '../common/Modal'
import { Button } from '../common/Button'
import { Input, Select } from '../common/Input'

/**
 * Form for creating/editing a group
 */
export function GroupForm({
  isOpen,
  onClose,
  onSubmit,
  templates = [],
  initialData = null
}) {
  const isEditing = !!initialData

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    templateId: initialData?.templateId || '',
    description: initialData?.description || ''
  })

  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when field is changed
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.templateId && !isEditing) {
      newErrors.templateId = 'Template is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!validate()) return

    onSubmit({
      ...formData,
      name: formData.name.trim(),
      description: formData.description.trim()
    })

    // Reset form
    setFormData({ name: '', templateId: '', description: '' })
    setErrors({})
  }

  const handleClose = () => {
    setFormData({ name: '', templateId: '', description: '' })
    setErrors({})
    onClose()
  }

  const templateOptions = templates.map(t => ({
    value: t.id,
    label: t.name
  }))

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'Edit Group' : 'New Group'}
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {isEditing ? 'Save' : 'Create'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
          placeholder="e.g., Semester 2 - Feb 2026"
        />

        {!isEditing && (
          <Select
            label="Template"
            name="templateId"
            value={formData.templateId}
            onChange={handleChange}
            options={templateOptions}
            error={errors.templateId}
            required
            placeholder="Select a programme template..."
          />
        )}

        <Input
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Optional notes about this group"
        />
      </form>
    </Modal>
  )
}
