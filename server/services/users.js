[{
  id: '54364ry',
  name: 'Himanshu',
  group: 'group 56'
}]

class Users {
  constructor () {
    this.users = [];
  }
  addUser (id, name, group) {
    var user = {id, name, group};
    this.users.push(user);
    return user;
  }
  removeUser (id) {
    var user = this.getUser(id);

    if (user) {
      this.users = this.users.filter((user) => user.id !== id);
    }

    return user;
  }
  getUser (id) {
    return this.users.filter((user) => user.id === id)[0]
  }
  getUserList (group) {
    var users = this.users.filter((user) => user.group === group);
    var namesArray = users.map((user) => user.name);

    return namesArray;
  }
}

module.exports = {Users};
