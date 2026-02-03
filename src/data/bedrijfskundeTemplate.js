/**
 * Bedrijfskunde AOD Programme Template based on HAN 2025 P3N
 */
export const BEDRIJFSKUNDE_TEMPLATE_ID = 'bedrijfskunde-aod-2025-26'

export const bedrijfskundeTemplate = {
  id: BEDRIJFSKUNDE_TEMPLATE_ID,
  name: 'AOD – Bedrijfskunde (HAN 2025-26)',
  durationWeeks: 22,
  isDefault: false,
  archived: false,

  milestones: [
    {
      id: 'bk01',
      name: 'Stageaanvraag ingediend via stageportaal',
      week: 0,
      type: 'admin',
      tracking: 'checkbox_date'
    },
    {
      id: 'bk02',
      name: 'AOD goedgekeurd door Cluster Coördinator',
      week: 0,
      type: 'admin',
      tracking: 'checkbox_date'
    },
    {
      id: 'bk03',
      name: 'Afstudeerovereenkomst ingeleverd',
      week: 1,
      type: 'admin',
      tracking: 'checkbox_date'
    },
    {
      id: 'bk04',
      name: 'Ingeschreven afstuderen in Osiris',
      week: 1,
      type: 'admin',
      tracking: 'checkbox'
    },
    {
      id: 'bk05',
      name: 'Startbijeenkomst & Workshop 1 bijgewoond',
      week: 0,
      type: 'meeting',
      tracking: 'checkbox_date'
    },
    {
      id: 'bk06',
      name: 'Workshop 2: Kennis- en Veld Databronnen',
      week: 3,
      type: 'meeting',
      tracking: 'checkbox_date'
    },
    {
      id: 'bk07',
      name: 'Workshop 3: Theoretisch Kader en Methode',
      week: 5,
      type: 'meeting',
      tracking: 'checkbox_date'
    },
    {
      id: 'bk08',
      name: 'Plan van Aanpak (PvA) ingeleverd via HANdin',
      week: 7,
      type: 'deliverable',
      tracking: 'checkbox_date'
    },
    {
      id: 'bk09',
      name: 'Workshop 4: Ethiek & Terugkomdag AOD',
      week: 11,
      type: 'meeting',
      tracking: 'checkbox_date'
    },
    {
      id: 'bk10',
      name: 'Eindproduct ingeleverd via HANdin',
      week: 18,
      type: 'deliverable',
      tracking: 'checkbox_date'
    },
    {
      id: 'bk11',
      name: 'Go/No-go beslissing ontvangen',
      week: 19,
      type: 'admin',
      tracking: 'checkbox_date'
    },
    {
      id: 'bk12',
      name: 'Presentatie & Eindgesprek',
      week: 21,
      type: 'assessment',
      tracking: 'checkbox_date'
    },
    {
      id: 'bk13',
      name: 'Diploma-uitreiking',
      week: 22,
      type: 'admin',
      tracking: 'checkbox_date'
    },
    {
      id: 'bk14',
      name: 'Herkansing mondeling (indien van toepassing)',
      week: null,
      type: 'assessment',
      tracking: 'checkbox_date'
    }
  ],

  performanceAreas: [
    { id: 'bkpa1', name: 'Onderzoekend Vermogen', short: 'OV' },
    { id: 'bkpa2', name: 'Professioneel Product', short: 'PP' },
    { id: 'bkpa3', name: 'Ethisch Handelen', short: 'EH' }
  ],

  specialisations: [
    'Financieel Management',
    'Human Resource Management',
    'Marketing Management',
    'Logistiek Management',
    'Generiek'
  ]
}
