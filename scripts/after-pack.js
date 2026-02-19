// After electron-builder packs, set the icon on the exe using rcedit
// This runs after asar integrity is computed, so we need to be careful
// We only set version-string info here, NOT the icon (that's handled by electron-builder)
exports.default = async function afterPack(context) {
  console.log('afterPack: build complete at', context.appOutDir)
}
