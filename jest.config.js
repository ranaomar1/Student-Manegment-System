export default {

  testEnvironment: "jsdom",

  setupFilesAfterEnv: [
    "<rootDir>/src/setupTests.js"
  ],

  transform: {
    "^.+\\.jsx?$": "babel-jest"
  },

  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy"
  }

};