//  Packages
var core = require('@actions/core')
var execSync = require('child_process').execSync
code = execSync('npm install exeq --save')
var exeq = require('exeq')

//  Input variables
var CONFIG_ARGS = core.getInput('config_args')
var DEPLOY_ARGS = core.getInput('deploy_args')

//  Installs Serverless and specified plugins
async function installServerlessAndPlugins() {
  await exeq(
    'echo Installing Serverless and plugins...',
    'npm i serverless -g',
    'npm i serverless-python-requirements',
    'npm i serverless-plugin-canary-deployments'
  )
}

//  Runs Serverless deploy using SERVERLESS_ACCESS_KEY if specified, else AWS Credentials
async function runServerlessDeploy() {
  await exeq(
    `echo Running sls deploy...`,
    `echo deploy_args ${DEPLOY_ARGS}`,
    `echo credentials_args  ${CONFIG_ARGS}`,
    `if [ ${process.env.AWS_ACCESS_KEY_ID} ] && [ ${process.env.AWS_SECRET_ACCESS_KEY} ]; then
      sls config credentials --provider aws --key ${process.env.AWS_ACCESS_KEY_ID} --secret ${process.env.AWS_SECRET_ACCESS_KEY} ${CONFIG_ARGS}
    fi`,
    `sls deploy ${DEPLOY_ARGS}`
  )
}

//  Runs all functions sequentially
async function handler() {
  try {
    await installServerlessAndPlugins()
    await runServerlessDeploy()
  } catch (error) {
    core.setFailed(error.message);
  }
}

//  Main function
if (require.main === module) {
  handler()
}