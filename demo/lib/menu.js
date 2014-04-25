Menu = {
  list: {},
  add: function(item, cat) {
    if (!cat) cat = '_';
    if (!this.list[cat]) this.list[cat]=[];
    this.list[cat].push({ name: item, route: '/'+item });
  }
};
