classList.add('something');
classList.add(a, b);
classList.remove(a, b, c);
classList.remove(d);
a.classList.remove(a, b);
a.b.classList.add(x, y);
c.d.f.classList.add(x, y, 'one-two-three');
// should leave all of the following intact
leave.this.alone(x, y, z);
leave.this.alone.add(a, b);
leave.this.alone.remove(1, 2, 3);
classList(a, b, c);
classList.notAddOrRemove(a, b, c);
add(1, 2, 3);
remove(1, 2, 3);
