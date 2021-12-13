exportFunction('getData', () => ({data: true}));

const visits = Number(localStorage.getItem('visits') ?? 0) + 1;
localStorage.setItem('visits', visits);
console.log(`Visit count: ${visits}`);
