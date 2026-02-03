/**
 * Default IB/CS Programme Template based on HAN ISB GI Manual 2025-2026
 */
export const DEFAULT_TEMPLATE_ID = 'default-ib-cs-2025-26'

export const defaultTemplate = {
  id: DEFAULT_TEMPLATE_ID,
  name: 'GI – IB/CS (HAN ISB 2025-26)',
  durationWeeks: 21,
  isDefault: true,
  archived: false,

  milestones: [
    {
      id: 'm01',
      name: 'Meet & greet with supervisor',
      week: 0,
      type: 'meeting',
      tracking: 'checkbox_date'
    },
    {
      id: 'm02',
      name: 'Agree PIP submission date',
      week: 0,
      type: 'admin',
      tracking: 'date'
    },
    {
      id: 'm03',
      name: 'Student starts at company',
      week: 1,
      type: 'admin',
      tracking: 'date'
    },
    {
      id: 'm04',
      name: 'PIP submitted',
      week: 1,
      type: 'deliverable',
      tracking: 'checkbox_date'
    },
    {
      id: 'm05',
      name: '1st company visit',
      week: 2,
      type: 'visit',
      tracking: 'checkbox_date'
    },
    {
      id: 'm06',
      name: 'AI usage permission discussed & confirmed',
      week: 2,
      type: 'admin',
      tracking: 'checkbox'
    },
    {
      id: 'm07',
      name: 'Meeting report Wk 2/3 received',
      week: 3,
      type: 'deliverable',
      tracking: 'checkbox_date'
    },
    {
      id: 'm08',
      name: '1st round 360° feedback forms collected',
      week: 9,
      type: 'deliverable',
      tracking: 'counter',
      counterMax: 4
    },
    {
      id: 'm09',
      name: '1st appraisal form (company coach) received',
      week: 9,
      type: 'deliverable',
      tracking: 'checkbox_date'
    },
    {
      id: 'm10',
      name: '1st interim portfolio submitted',
      week: 10,
      type: 'deliverable',
      tracking: 'checkbox_date'
    },
    {
      id: 'm11',
      name: '2nd company visit',
      week: 10,
      type: 'visit',
      tracking: 'checkbox_date'
    },
    {
      id: 'm12',
      name: 'Meeting report Wk 10/11 received',
      week: 11,
      type: 'deliverable',
      tracking: 'checkbox_date'
    },
    {
      id: 'm13',
      name: 'Student survey completed',
      week: 11,
      type: 'admin',
      tracking: 'checkbox'
    },
    {
      id: 'm14',
      name: '2nd interim portfolio submitted',
      week: 14,
      type: 'deliverable',
      tracking: 'checkbox_date'
    },
    {
      id: 'm15',
      name: '2nd round 360° feedback forms collected',
      week: 15,
      type: 'deliverable',
      tracking: 'counter',
      counterMax: 4
    },
    {
      id: 'm16',
      name: '2nd appraisal form (company coach) received',
      week: 16,
      type: 'deliverable',
      tracking: 'checkbox_date'
    },
    {
      id: 'm17',
      name: 'Draft (concept) final portfolio submitted',
      week: 17,
      type: 'deliverable',
      tracking: 'checkbox_date'
    },
    {
      id: 'm18',
      name: 'Final portfolio submitted (HARD DEADLINE)',
      week: 19,
      type: 'deliverable',
      tracking: 'checkbox_date'
    },
    {
      id: 'm19',
      name: 'Portfolio uploaded in HandIn',
      week: 19,
      type: 'admin',
      tracking: 'checkbox'
    },
    {
      id: 'm20',
      name: 'Internship agreement included in HandIn',
      week: 19,
      type: 'admin',
      tracking: 'checkbox'
    },
    {
      id: 'm21',
      name: 'CBI held',
      week: 21,
      type: 'assessment',
      tracking: 'checkbox_date'
    },
    {
      id: 'm22',
      name: 'Resit portfolio submitted (if applicable)',
      week: null,
      type: 'deliverable',
      tracking: 'checkbox_date'
    },
    {
      id: 'm23',
      name: 'Resit CBI held (if applicable)',
      week: null,
      type: 'assessment',
      tracking: 'checkbox_date'
    }
  ],

  performanceAreas: [
    { id: 'pa1', name: 'Entrepreneurial Behaviour', short: 'EB' },
    { id: 'pa2', name: 'Innovative Capacity', short: 'IC' },
    { id: 'pa3', name: 'Collaborative Capacity', short: 'CC' },
    { id: 'pa4', name: 'Intercultural Proficiency', short: 'IP' },
    { id: 'pa5', name: 'Reflective Practitioner', short: 'RP' },
    { id: 'pp', name: 'Professional Products', short: 'PP' }
  ],

  specialisations: [
    'Finance',
    'Marketing & Sales',
    'Supply Chain Management',
    'Organisation & Change',
    'Generic'
  ]
}
