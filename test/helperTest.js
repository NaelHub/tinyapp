const { assert } = require('chai');

const { checkUserByEmail } = require("../helpers.js");

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('checkUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = checkUserByEmail("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.equal(user.id, expectedUserID)
    console.log(user)
  });
  it('should return as undefined without a non-existent email', function() {
    const user = checkUserByEmail("test@test.comm", testUsers)
    // const expectedUserID = "userRandomID";
    assert.isUndefined(user)
    console.log(user)
  });

});