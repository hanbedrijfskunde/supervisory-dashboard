import { useState } from 'react'
import { AppProvider, useAppContext } from './context/AppContext'
import { useGroups } from './hooks/useGroups'
import { useStudents } from './hooks/useStudents'
import { useTemplates } from './hooks/useTemplates'
import { useCustomRoles } from './hooks/useCustomRoles'
import { useToast } from './hooks/useToast'
import { GroupList } from './components/groups/GroupList'
import { GroupForm } from './components/groups/GroupForm'
import { GroupDeleteConfirm } from './components/groups/GroupDeleteConfirm'
import { GroupMenu } from './components/groups/GroupMenu'
import { StudentTable } from './components/students/StudentTable'
import { StudentForm } from './components/students/StudentForm'
import { StudentDeleteConfirm } from './components/students/StudentDeleteConfirm'
import { StudentMenu } from './components/students/StudentMenu'
import { StudentDetail } from './views/StudentDetail'
import { ThisWeekPanel } from './components/dashboard/ThisWeekPanel'
import { SettingsModal } from './components/settings/SettingsModal'
import { Sidebar, SidebarToggle } from './components/common/Sidebar'
import { ToastContainer } from './components/common/Toast'

function AppContent() {
  const { reloadFromStorage } = useAppContext()
  const { activeGroups, archivedGroups, addGroup, updateGroup, deleteGroup, archiveGroup, unarchiveGroup, getGroup } = useGroups()
  const { getStudentsForGroup, addStudent, updateStudent, deleteStudent } = useStudents()
  const { templates, activeTemplates, getTemplate } = useTemplates()
  const { customRoles, addCustomRole } = useCustomRoles()

  // UI state - Groups
  const [selectedGroupId, setSelectedGroupId] = useState(null)
  const [showGroupForm, setShowGroupForm] = useState(false)
  const [editingGroup, setEditingGroup] = useState(null)
  const [deletingGroup, setDeletingGroup] = useState(null)
  const [groupMenuState, setGroupMenuState] = useState({ isOpen: false, groupId: null, position: { top: 0, left: 0 } })

  // UI state - Students
  const [selectedStudentId, setSelectedStudentId] = useState(null)
  const [showStudentForm, setShowStudentForm] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  const [deletingStudent, setDeletingStudent] = useState(null)
  const [studentMenuState, setStudentMenuState] = useState({ isOpen: false, studentId: null, position: { top: 0, left: 0 } })

  // UI state - Settings
  const [showSettings, setShowSettings] = useState(false)

  // UI state - Mobile sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Toast notifications
  const toast = useToast()

  // Group handlers
  const handleNewGroup = () => {
    setEditingGroup(null)
    setShowGroupForm(true)
  }

  const handleGroupFormSubmit = (data) => {
    if (editingGroup) {
      updateGroup(editingGroup.id, data)
      toast.success('Group updated')
    } else {
      const newGroup = addGroup(data)
      setSelectedGroupId(newGroup.id)
      toast.success('Group created')
    }
    setShowGroupForm(false)
    setEditingGroup(null)
    setSidebarOpen(false) // Close sidebar on mobile after action
  }

  const closeGroupMenu = () => {
    setGroupMenuState({ isOpen: false, groupId: null, position: { top: 0, left: 0 } })
  }

  const handleEditGroup = () => {
    const group = getGroup(groupMenuState.groupId)
    setEditingGroup(group)
    setShowGroupForm(true)
    closeGroupMenu()
  }

  const handleArchiveGroup = () => {
    archiveGroup(groupMenuState.groupId)
    if (selectedGroupId === groupMenuState.groupId) {
      setSelectedGroupId(null)
    }
    closeGroupMenu()
  }

  const handleUnarchiveGroup = () => {
    unarchiveGroup(groupMenuState.groupId)
    closeGroupMenu()
  }

  const handleDeleteGroupClick = () => {
    const group = getGroup(groupMenuState.groupId)
    setDeletingGroup(group)
    closeGroupMenu()
  }

  const handleDeleteGroupConfirm = () => {
    if (deletingGroup) {
      deleteGroup(deletingGroup.id)
      if (selectedGroupId === deletingGroup.id) {
        setSelectedGroupId(null)
      }
      toast.success('Group deleted')
    }
    setDeletingGroup(null)
  }

  // Student handlers
  const handleAddStudent = () => {
    setEditingStudent(null)
    setShowStudentForm(true)
  }

  const handleStudentFormSubmit = (data) => {
    if (editingStudent) {
      updateStudent(selectedGroupId, editingStudent.id, data)
      toast.success('Student updated')
    } else {
      // Pass template to initialize milestones
      addStudent(selectedGroupId, data, selectedTemplate)
      toast.success('Student added')
    }
    setShowStudentForm(false)
    setEditingStudent(null)
  }

  const handleSelectStudent = (studentId) => {
    setSelectedStudentId(studentId)
  }

  const handleBackFromStudent = () => {
    setSelectedStudentId(null)
  }

  // Handle clicking an action item in This Week panel
  const handleActionItemClick = (item) => {
    setSelectedGroupId(item.groupId)
    setSelectedStudentId(item.studentId)
  }

  const handleEditStudentFromDetail = () => {
    const student = students.find(s => s.id === selectedStudentId)
    setEditingStudent(student)
    setShowStudentForm(true)
  }

  const handleStudentMenu = (studentId, event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    setStudentMenuState({
      isOpen: true,
      studentId,
      position: { top: rect.bottom + 4, left: rect.left }
    })
  }

  const closeStudentMenu = () => {
    setStudentMenuState({ isOpen: false, studentId: null, position: { top: 0, left: 0 } })
  }

  const handleEditStudent = () => {
    const students = getStudentsForGroup(selectedGroupId)
    const student = students.find(s => s.id === studentMenuState.studentId)
    setEditingStudent(student)
    setShowStudentForm(true)
    closeStudentMenu()
  }

  const handleDeleteStudentClick = () => {
    const students = getStudentsForGroup(selectedGroupId)
    const student = students.find(s => s.id === studentMenuState.studentId)
    setDeletingStudent(student)
    closeStudentMenu()
  }

  const handleDeleteStudentConfirm = () => {
    if (deletingStudent && selectedGroupId) {
      deleteStudent(selectedGroupId, deletingStudent.id)
      // If deleting the currently viewed student, go back to list
      if (selectedStudentId === deletingStudent.id) {
        setSelectedStudentId(null)
      }
      toast.success('Student deleted')
    }
    setDeletingStudent(null)
  }

  const selectedGroup = selectedGroupId ? getGroup(selectedGroupId) : null
  const groupMenuGroup = groupMenuState.groupId ? getGroup(groupMenuState.groupId) : null
  const selectedTemplate = selectedGroup ? getTemplate(selectedGroup.templateId) : null
  const students = selectedGroupId ? getStudentsForGroup(selectedGroupId) : []
  const selectedStudent = selectedStudentId ? students.find(s => s.id === selectedStudentId) : null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SidebarToggle onClick={() => setSidebarOpen(true)} />
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">GI Supervision Tracker</h1>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Settings"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar - Groups */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)}>
          <GroupList
            groups={activeGroups}
            archivedGroups={archivedGroups}
            templates={templates}
            selectedGroupId={selectedGroupId}
            onSelectGroup={(groupId) => {
              setSelectedGroupId(groupId)
              setSelectedStudentId(null) // Reset student selection when changing groups
              setSidebarOpen(false) // Close sidebar on mobile after selection
            }}
            onNewGroup={handleNewGroup}
            onMenuAction={(groupId) => {
              setGroupMenuState({
                isOpen: true,
                groupId,
                position: { top: 100, left: 250 }
              })
            }}
          />
        </Sidebar>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto" role="main">
          {selectedStudent ? (
            <StudentDetail
              groupId={selectedGroupId}
              student={selectedStudent}
              template={selectedTemplate}
              onBack={handleBackFromStudent}
              onEdit={handleEditStudentFromDetail}
            />
          ) : selectedGroup ? (
            <div className="p-6">
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Student table - takes 2 columns on large screens */}
                <div className="xl:col-span-2">
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">
                    {selectedGroup.name}
                  </h2>
                  <p className="text-gray-500 mb-6">
                    {`${students.length} student${students.length !== 1 ? 's' : ''}`}
                  </p>

                  <StudentTable
                    students={students}
                    template={selectedTemplate}
                    onSelectStudent={handleSelectStudent}
                    onMenuStudent={handleStudentMenu}
                    onAddStudent={handleAddStudent}
                  />
                </div>

                {/* This Week panel - right column on large screens */}
                <div className="xl:col-span-1">
                  <ThisWeekPanel onSelectItem={handleActionItemClick} />
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Welcome message */}
                <div className="flex flex-col items-center justify-center text-center p-6 bg-white border border-gray-200 rounded-lg min-h-[300px]">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  {activeGroups.length === 0 ? (
                    <>
                      <h2 className="text-xl font-medium text-gray-900 mb-2">No groups yet</h2>
                      <p className="text-gray-500 mb-4">Create your first group to get started</p>
                      <button
                        onClick={handleNewGroup}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <svg className="w-5 h-5 mr-2 -ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Create your first group
                      </button>
                    </>
                  ) : (
                    <>
                      <h2 className="text-xl font-medium text-gray-900 mb-2">Select a group</h2>
                      <p className="text-gray-500">Choose a group from the sidebar to view students</p>
                    </>
                  )}
                </div>

                {/* This Week panel */}
                <div>
                  <ThisWeekPanel onSelectItem={handleActionItemClick} />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Group Modals */}
      <GroupForm
        isOpen={showGroupForm}
        onClose={() => {
          setShowGroupForm(false)
          setEditingGroup(null)
        }}
        onSubmit={handleGroupFormSubmit}
        templates={activeTemplates}
        initialData={editingGroup}
      />

      <GroupDeleteConfirm
        isOpen={!!deletingGroup}
        onClose={() => setDeletingGroup(null)}
        onConfirm={handleDeleteGroupConfirm}
        group={deletingGroup}
      />

      <GroupMenu
        isOpen={groupMenuState.isOpen}
        onClose={closeGroupMenu}
        onEdit={handleEditGroup}
        onArchive={handleArchiveGroup}
        onUnarchive={handleUnarchiveGroup}
        onDelete={handleDeleteGroupClick}
        isArchived={groupMenuGroup?.status === 'archived'}
        position={groupMenuState.position}
      />

      {/* Student Modals */}
      <StudentForm
        isOpen={showStudentForm}
        onClose={() => {
          setShowStudentForm(false)
          setEditingStudent(null)
        }}
        onSubmit={handleStudentFormSubmit}
        template={selectedTemplate}
        initialData={editingStudent}
        customRoles={customRoles}
        onAddCustomRole={addCustomRole}
      />

      <StudentDeleteConfirm
        isOpen={!!deletingStudent}
        onClose={() => setDeletingStudent(null)}
        onConfirm={handleDeleteStudentConfirm}
        student={deletingStudent}
      />

      <StudentMenu
        isOpen={studentMenuState.isOpen}
        onClose={closeStudentMenu}
        onEdit={handleEditStudent}
        onDelete={handleDeleteStudentClick}
        position={studentMenuState.position}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onDataChange={() => {
          reloadFromStorage()
          setSelectedGroupId(null)
          setSelectedStudentId(null)
          toast.success('Data updated')
        }}
      />

      {/* Toast notifications */}
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
    </div>
  )
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}

export default App
