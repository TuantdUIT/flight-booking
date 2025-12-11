const fs = require('fs');
const path = require('path');

const filesToCheck = [
  'src/core/types/seat.ts',
  'src/features/seats/store/index.ts',
  'src/features/seats/hooks/index.ts',
  'src/features/seats/hooks/use-seats.ts',
  'src/features/seats/components/index.ts',
  'src/features/seats/components/seat.tsx',
  'src/features/seats/components/seat-row.tsx',
  'src/features/seats/components/seat-map.tsx',
  'src/features/seats/components/legend.tsx',
  'src/features/seats/components/admin-panel.tsx',
  'src/features/seats/components/selection-summary.tsx',
  'src/features/seats/repository/index.ts',
  'src/features/seats/services/seats.service.ts',
  'src/app/api/seats/route.ts',
  'src/app/api/seats/[id]/route.ts',
  'src/app/(protected)/select-seat/page.tsx',
];

console.log('🔍 Verifying seat selection files...\n');

let allExist = true;
filesToCheck.forEach(file => {
  const exists = fs.existsSync(file);
  const status = exists ? '✅' : '❌';
  console.log(`${status} ${file}`);
  if (!exists) allExist = false;
});

console.log('\n' + (allExist ? '✅ All files exist!' : '❌ Some files are missing!'));

if (allExist) {
  console.log('\n📝 If TypeScript still shows errors:');
  console.log('1. In VS Code: Press Ctrl+Shift+P → "TypeScript: Restart TS Server"');
  console.log('2. Or close and reopen VS Code');
  console.log('3. Or delete .next folder and restart dev server');
}
