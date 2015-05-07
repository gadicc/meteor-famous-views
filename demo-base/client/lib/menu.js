Menu = {
  list: {},
  add: function(item, cat) {
  	var name, route;
    if (!cat) cat = '_';
    if (!this.list[cat]) this.list[cat]=[];

    if (_.isObject(item)) {
    	name = item.name; route = item.route;
    } else {
    	name = item; route = item;
    }

    this.list[cat].push({
      name: name,
      route: route.substr(0,4) == 'http' ? route : '/'+route,
      target: route.substr(0,4) == 'http' ? '_TOP' : undefined
    });
  }
};
