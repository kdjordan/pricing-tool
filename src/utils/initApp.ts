import { useUserProfileStore } from '../stores/userProfileStore'
import { useDBstate } from '@/stores/dbStore'
import { openDB } from 'idb'
import { DBName, StandardizedData } from '../../types/app-types'

async function loadDB() {
  try {
    const db = await openDB('az', 1, {
      upgrade(db) {
        db.createObjectStore('AZtest1.csv', { keyPath: 'id', autoIncrement: true })
        db.createObjectStore('AZtest2.csv', { keyPath: 'id', autoIncrement: true })
      },
    })

    const DBstore = useDBstate()

    // Load AZtest1.csv
    const responseFile1 = await fetch('/src/data/AZtest1.csv')
    const csvTextFile1 = await responseFile1.text()
    DBstore.addFileUploaded('az1', DBName.AZ, 'AZtest1.csv')

    // Load AZtest2.csv
    const responseFile2 = await fetch('/src/data/AZtest2.csv')
    const csvTextFile2 = await responseFile2.text()
    DBstore.addFileUploaded('az2', DBName.AZ, 'AZtest2.csv')

    // Process and store data
    await storeData(db, 'AZtest1.csv', processData(csvTextFile1))
    await storeData(db, 'AZtest2.csv', processData(csvTextFile2))

    console.log('Sample data loaded into IndexedDB')
  } catch (error) {
    console.error('Error loading sample data into IndexedDB:', error)
  }
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