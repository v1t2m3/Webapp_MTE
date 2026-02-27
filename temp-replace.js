const fs = require('fs');
['src/components/reports/weekly-monthly-report.tsx', 'src/components/reports/contract-report.tsx'].forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  c = c.replace(/bucket: isPast \? 'past' : 'future'\s*\}/g, "bucket: isPast ? 'past' : 'future'\n            } as EditableSchedule");
  fs.writeFileSync(f, c);
});
console.log("Replaced successfully!");
