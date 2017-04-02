export const ar = function(number, index) {
  if (index === 0) {
    return ['منذ لحظات', 'بعد لحظات'];
  }

  const timeStr = formatTime(Math.floor(index / 2), number);
  return [`منذ  ${timeStr}`, `بعد  ${timeStr}`];
};

const timeTypes = [
  ['ثانية', 'ثانيتين', '%s ثوان', '%s ثانية'],    // Seconds
  ['دقيقة', 'دقيقتين', '%s دقائق', '%s دقيقة'],   // Minutes
  ['ساعة', 'ساعتين', '%s ساعات', '%s ساعة'],      // Hours
  ['يوم', 'يومين', '%s أيام', '%s يوماً'],         // Days
  ['أسبوع', 'أسبوعين', '%s أسابيع', '%s أسبوعاً'], // Weeks
  ['شهر', 'شهرين', '%s أشهر', '%s شهراً'],         // Months
  ['عام', 'عامين', '%s أعوام', '%s عاماً'],        // Years
];

function formatTime(type, n) {
  if (n < 3) {
    return timeTypes[type][n - 1];
  }
  else if (n >= 3 && n <= 10) {
    return timeTypes[type][2];
  }
  else {
    return timeTypes[type][3];
  }
}
