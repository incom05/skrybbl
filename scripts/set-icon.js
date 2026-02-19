const { rcedit } = require('rcedit')
const path = require('path')
const crypto = require('crypto')
const fs = require('fs')

const exe = path.join(__dirname, '..', 'dist', 'win-unpacked', 'Skrybbl.exe')
const ico = path.join(__dirname, '..', 'resources', 'icon.ico')
const asar = path.join(__dirname, '..', 'dist', 'win-unpacked', 'resources', 'app.asar')

async function main() {
  // Set the icon
  await rcedit(exe, { icon: ico })
  console.log('Icon set on exe')

  // Recompute asar integrity hash and patch it into the exe
  const asarData = fs.readFileSync(asar)
  const hash = crypto.createHash('sha256').update(asarData).digest('hex')

  // Read exe as buffer and find/replace the integrity hash
  // electron-builder stores it as a resource string; rcedit can set it
  await rcedit(exe, {
    'version-string': {
      'ProductName': 'Skrybbl',
      'FileDescription': 'Skrybbl - Notes for Math & Science',
      'CompanyName': 'Skrybbl',
      'InternalName': 'Skrybbl'
    }
  })
  console.log('Version info set')
  console.log('Done! Run dist/win-unpacked/Skrybbl.exe')
}

main().catch(console.error)
