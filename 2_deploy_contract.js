const UserProfile = artifacts.require("UserProfile");

module.exports = function (deployer) {
  deployer.deploy(UserProfile);
};

