const fs = require('fs');
['src/components/reports/weekly-monthly-report.tsx', 'src/components/reports/contract-report.tsx'].forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/bucket: ''\s*\}\)/g, "bucket: ''\n            } as EditableSchedule)");
  fs.writeFileSync(f, c);
});
console.log("Replaced successfully!");
