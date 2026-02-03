import { useState, useEffect } from 'react'
import { Modal } from '../common/Modal'
import { Input } from '../common/Input'
import { Button } from '../common/Button'
import { FormSection } from '../common/FormSection'
import { STANDARD_ROLES } from '../../context/appReducer'

/**
 * Form for creating or editing a student
 */
export function StudentForm({
  isOpen,
  onClose,
  onSubmit,
  template,
  initialData = null,
  customRoles = [],
  onAddCustomRole
}) {
  const [formData, setFormData] = useState({
    firstName: '',
    organisation: '',
    organisationCity: '',
    companyCoachName: '',
    examinerName: '',
    specialisation: '',
    startDate: '',
    role: ''
  })
  const [errors, setErrors] = useState({})
  const [showCustomRoleInput, setShowCustomRoleInput] = useState(false)
  const [customRoleInput, setCustomRoleInput] = useState('')

  const isEditing = !!initialData

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          firstName: initialData.firstName || '',
          organisation: initialData.organisation || '',
          organisationCity: initialData.organisationCity || '',
          companyCoachName: initialData.companyCoachName || '',
          examinerName: initialData.examinerName || '',
          specialisation: initialData.specialisation || '',
          startDate: initialData.startDate ? initialData.startDate.slice(0, 10) : '',
          role: initialData.role || ''
        })
      } else {
        setFormData({
          firstName: '',
          organisation: '',
          organisationCity: '',
          companyCoachName: '',
          examinerName: '',
          specialisation: template?.specialisations?.[0] || '',
          startDate: new Date().toISOString().slice(0, 10),
          role: ''
        })
      }
      setErrors({})
      setShowCustomRoleInput(false)
      setCustomRoleInput('')
    }
  }, [isOpen, initialData, template])

  const validate = () => {
    const newErrors = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }

    if (!formData.organisation.trim()) {
      newErrors.organisation = 'Organisation is required'
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    onSubmit({
      ...formData,
      firstName: formData.firstName.trim(),
      organisation: formData.organisation.trim(),
      organisationCity: formData.organisationCity.trim(),
      companyCoachName: formData.companyCoachName.trim(),
      examinerName: formData.examinerName.trim()
    })
  }

  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Student' : 'Add Student'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Required fields - always visible */}
        <Input
          id="firstName"
          label="First name"
          value={formData.firstName}
          onChange={handleChange('firstName')}
          error={errors.firstName}
          helpText="First name only, for privacy"
          autoFocus
          required
        />

        <Input
          id="organisation"
          label="Organisation"
          value={formData.organisation}
          onChange={handleChange('organisation')}
          error={errors.organisation}
          helpText="Company or organisation name"
          required
        />

        <Input
          id="startDate"
          label="Start date"
          type="date"
          value={formData.startDate}
          onChange={handleChange('startDate')}
          error={errors.startDate}
          helpText="When the graduation internship starts"
          required
        />

        {/* Optional fields - collapsible section */}
        <FormSection
          title="Additional Details"
          description="Optional information about the student and supervision"
          collapsible
          defaultOpen={isEditing}
        >
          <Input
            id="organisationCity"
            label="City"
            value={formData.organisationCity}
            onChange={handleChange('organisationCity')}
            helpText="Location of the organisation"
          />

          <div>
            <label htmlFor="specialisation" className="block text-sm font-medium text-gray-700 mb-1">
              Specialisation
            </label>
            <select
              id="specialisation"
              value={formData.specialisation}
              onChange={handleChange('specialisation')}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="">Select specialisation</option>
              {template?.specialisations?.map(spec => (
                <option key={spec} value={spec}>{spec}</option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">Student's programme specialisation</p>
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Supervisor role
            </label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) => {
                const value = e.target.value
                if (value === '__custom__') {
                  setShowCustomRoleInput(true)
                } else {
                  setFormData(prev => ({ ...prev, role: value }))
                }
              }}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="">Select role...</option>
              {STANDARD_ROLES.map(role => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
              {customRoles.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
              <option value="__custom__">+ Add custom role...</option>
            </select>
            <p className="text-sm text-gray-500 mt-1">Your role in supervising this student</p>

            {showCustomRoleInput && (
              <div className="mt-2 flex gap-2">
                <Input
                  id="customRole"
                  value={customRoleInput}
                  onChange={(e) => setCustomRoleInput(e.target.value)}
                  placeholder="Enter custom role"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    if (customRoleInput.trim()) {
                      const newRole = customRoleInput.trim()
                      onAddCustomRole?.(newRole)
                      setFormData(prev => ({ ...prev, role: newRole }))
                      setCustomRoleInput('')
                      setShowCustomRoleInput(false)
                    }
                  }}
                >
                  Add
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowCustomRoleInput(false)
                    setCustomRoleInput('')
                  }}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>

          <Input
            id="companyCoachName"
            label="Company coach"
            value={formData.companyCoachName}
            onChange={handleChange('companyCoachName')}
            helpText="Name of the company supervisor"
          />

          <Input
            id="examinerName"
            label="Examiner"
            value={formData.examinerName}
            onChange={handleChange('examinerName')}
            helpText="Name of the second examiner"
          />
        </FormSection>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">
            {isEditing ? 'Save Changes' : 'Add Student'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
