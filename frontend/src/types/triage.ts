// triage.ts
export interface TriageData {
  timestamp: string
  patient_age: number
  patient_sex: string
  symptoms: string
  triage_level: string
  recommendation: string
  possible_conditions?: string[]
  immediate_actions?: string[]
  red_flags?: string[]
  disclaimer: string
}