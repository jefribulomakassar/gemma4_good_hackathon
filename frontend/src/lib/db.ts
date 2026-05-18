// frontend/lib/db.ts
import Dexie, { Table } from 'dexie'

export interface PatientRecord {
  id?: number
  kader_id: string
  patient_age: number
  patient_sex: string
  symptoms: string
  triage_level: string
  recommendation: string
  timestamp: number
  synced: boolean
}

class PuskesmasDB extends Dexie {
  patients!: Table<PatientRecord>

  constructor() {
    super('PuskesmasAI')
    this.version(1).stores({
      patients: '++id, kader_id, timestamp, synced',
    })
  }
}

export const db = new PuskesmasDB()

export async function savePatientRecord(
  record: Omit<PatientRecord, 'id'>
): Promise<number> {
  return await db.patients.add({ ...record, synced: false })
}

export async function getUnsyncedRecords(): Promise<PatientRecord[]> {
  return await db.patients.where('synced').equals(0).toArray()
}

export async function markAsSynced(ids: number[]): Promise<void> {
  await db.patients.where('id').anyOf(ids).modify({ synced: true })
}

export async function getAllRecords(): Promise<PatientRecord[]> {
  return await db.patients.orderBy('timestamp').reverse().toArray()
}

export async function deleteRecord(id: number): Promise<void> {
  await db.patients.delete(id)
}