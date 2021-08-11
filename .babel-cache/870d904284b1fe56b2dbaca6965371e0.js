export default function (obj) {
  var k,
      cls = '';

  for (k in obj) {
    if (obj[k]) {
      cls && (cls += ' ');
      cls += k;
    }
  }

  return cls;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm9iai1zdHIubWpzIl0sIm5hbWVzIjpbIm9iaiIsImsiLCJjbHMiXSwibWFwcGluZ3MiOiJBQUFBLGVBQWUsVUFBVUEsR0FBVixFQUFlO0FBQzdCLE1BQUlDLENBQUo7QUFBQSxNQUFPQyxHQUFHLEdBQUMsRUFBWDs7QUFDQSxPQUFLRCxDQUFMLElBQVVELEdBQVYsRUFBZTtBQUNkLFFBQUlBLEdBQUcsQ0FBQ0MsQ0FBRCxDQUFQLEVBQVk7QUFDWEMsTUFBQUEsR0FBRyxLQUFLQSxHQUFHLElBQUksR0FBWixDQUFIO0FBQ0FBLE1BQUFBLEdBQUcsSUFBSUQsQ0FBUDtBQUNBO0FBQ0Q7O0FBQ0QsU0FBT0MsR0FBUDtBQUNBIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gKG9iaikge1xuXHR2YXIgaywgY2xzPScnO1xuXHRmb3IgKGsgaW4gb2JqKSB7XG5cdFx0aWYgKG9ialtrXSkge1xuXHRcdFx0Y2xzICYmIChjbHMgKz0gJyAnKTtcblx0XHRcdGNscyArPSBrO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gY2xzO1xufVxuIl19
// /Users/mszylkowski/src/amphtml/node_modules/obj-str/dist/obj-str.mjs