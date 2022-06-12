export default {  
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  collectCoverageFrom: ["**/src/**/*.js"],
  testEnvironment: "jest-environment-node"

}
