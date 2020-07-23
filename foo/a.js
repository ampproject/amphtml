console.log('Hello, World!');

let b = () => {return 6;}

function remove(array, shouldRemove) {
    const removed = [];
    let index = 0;
    for (let i = 0; i < array.length; i++) {
      const item = array[i];
      if (shouldRemove(item, i, array)) {
        removed.push(item);
      } else {
        if (index < i) {
          array[index] = item;
        }
        index++;
      }
    }
    if (index < array.length) {
      array.length = index;
    }
    return removed;
  }