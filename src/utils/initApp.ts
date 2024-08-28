import { useUserProfileStore } from '../stores/userProfileStore'
import { useDBstate } from '@/stores/dbStore'
import { openDB, IDBPDatabase } from 'idb'
import { DBName, StandardizedData } from '../../types/app-types'

async function loadDB() {
  try {
    const db = await openDB<StandardizedData>('az', 1, {
      upgrade(db) {
        db.createObjectStore('AZtest1.csv', { keyPath: 'id', autoIncrement: true })
        db.createObjectStore('AZtest2.csv', { keyPath: 'id', autoIncrement: true })
      },
    })

    const DBstore = useDBstate()

    // Load and process AZtest1.csv
    await loadAndProcessFile(db, DBstore, 'az1', 'AZtest1.csv')

    // Load and process AZtest2.csv
    await loadAndProcessFile(db, DBstore, 'az2', 'AZtest2.csv')

    console.log('Sample data loaded into IndexedDB')
  } catch (error) {
    console.error('Error loading sample data into IndexedDB:', error)
  }
}

async function loadAndProcessFile(db: IDBPDatabase<StandardizedData>, DBstore: any, fileId: string, fileName: string) {
  const response = await fetch(`/src/data/${fileName}`)
  const csvText = await response.text()
  DBstore.addFileUploaded(fileId, DBName.AZ, fileName)
  await storeData(db, fileName, processData(csvText))
}

function processData(csvText: string): StandardizedData[] {
  const rows = csvText.trim().split('\n')
  return rows.map((row) => {
    const [destName, dialCode, rate] = row.split(',')
    return {
      destName: destName.trim(),
      dialCode: Number(dialCode.trim()),
      rate: Number(rate.trim()),
    }
  })
}

async function storeData(db: any, storeName: string, data: StandardizedData[]) {
  const tx = db.transaction(storeName, 'readwrite')
  const store = tx.objectStore(storeName)
  data.forEach((item) => store.put(item))
  await tx.done
}

export async function initAppWithSampleData(isPaid: boolean = false, loadSampleDB: boolean = false) {
  const userProfileStore = useUserProfileStore()
  userProfileStore.setupDummyProfile(isPaid)

  if (loadSampleDB) {
    await loadDB()
  }
}