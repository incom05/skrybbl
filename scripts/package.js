const { cpSync, mkdirSync, renameSync, rmSync, copyFileSync } = require('fs')
const { join } = require('path')
const { rcedit } = require('rcedit')

const root = join(__dirname, '..')
const dist = join(root, 'dist', 'Skrybbl')
const electronDist = join(root, 'node_modules', 'electron', 'dist')
const appDir = join(dist, 'resources', 'app')

async function main() {
  console.log('Cleaning dist...')
  rmSync(dist, { recursive: true, force: true })

  console.log('Copying Electron runtime...')
  cpSync(electronDist, dist, { recursive: true })
  renameSync(join(dist, 'electron.exe'), join(dist, 'Skrybbl.exe'))

  console.log('Copying app files...')
  mkdirSync(appDir, { recursive: true })
  cpSync(join(root, 'out'), join(appDir, 'out'), { recursive: true })
  copyFileSync(join(root, 'package.json'), join(appDir, 'package.json'))
  cpSync(join(root, 'node_modules'), join(appDir, 'node_modules'), { recursive: true })

  console.log('Copying icon resource...')
  copyFileSync(join(root, 'resources', 'icon.png'), join(dist, 'resources', 'icon.png'))

  console.log('Setting exe icon...')
  await rcedit(join(dist, 'Skrybbl.exe'), {
    icon: join(root, 'resources', 'icon.ico'),
    'version-string': {
      ProductName: 'Skrybbl',
      FileDescription: 'Skrybbl - Notes for Math & Science',
      CompanyName: 'Skrybbl'
    }
  })

  console.log('Done! Run dist/Skrybbl/Skrybbl.exe')
}

main().catch((e) => { console.error(e); process.exit(1) })
