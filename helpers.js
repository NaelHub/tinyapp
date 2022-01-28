const checkUserByEmail = function(emailInput, users) {
  for (let user in users) {

    if (users[user].email === emailInput) {
      return users[user];
    }
  }
  return undefined;
};


module.exports = {
  checkUserByEmail,
}