#!/usr/bin/env node
const fs = require('fs');
const { execSync } = require('child_process');
const readline = require('readline');

function run(cmd, opts = {}) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: 'inherit', shell: true, ...opts });
}

function ask(question, defaultValue = '') {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const prompt = defaultValue ? `${question} (${defaultValue}): ` : `${question}: `;
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      rl.close();
      resolve(answer.trim() || defaultValue);
    });
  });
}

(async () => {
  console.log('\n=== Firebase Auto Deploy (Shop + Admin) ===\n');

  // Check firebase CLI
  try {
    execSync('firebase --version', { stdio: 'ignore', shell: true });
  } catch (err) {
    console.error('Firebase CLI not found. Install and authenticate: npm i -g firebase-tools && firebase login');
    process.exit(1);
  }

  // Read default project from .firebaserc if present
  let defaultProject = '';
  try {
    const rc = JSON.parse(fs.readFileSync('.firebaserc', 'utf8'));
    defaultProject = rc?.projects?.default || '';
  } catch (e) {
    // ignore
  }

  // Ensure user is logged in to Firebase CLI; if not, launch login flow
  try {
    execSync('firebase projects:list', { stdio: 'ignore', shell: true });
  } catch (e) {
    console.log('Not logged into Firebase CLI. Running `firebase login` now...');
    run('firebase login');
  }

  const projectId = await ask('Firebase project id to deploy to (leave blank to use default)', defaultProject);
  const siteName = await ask('Hosting site id (leave blank to use default hosting site)', '');

  const ok = (await ask('Proceed with build & deploy? (y/N)', 'N')).toLowerCase();
  if (ok !== 'y' && ok !== 'yes') {
    console.log('Aborted.');
    process.exit(0);
  }

  try {
    console.log('\nInstalling dependencies (if needed)...');
    run('npm run setup');

    console.log('\nBuilding shop (root)...');
    run('npm run build');

    console.log('\nBuilding admin...');
    run('npm --prefix admin run build');

    console.log('\nCopying admin build into shop/dist/admin...');
    run('node scripts/copy-admin-dist.js');

    // Deploy
    let deployCmd = 'firebase deploy --only hosting';
    if (siteName) deployCmd = `firebase deploy --only hosting:${siteName}`;
    if (projectId) deployCmd += ` --project ${projectId}`;

    console.log('\nDeploying to Firebase...');
    run(deployCmd);

    // Suggest URLs
    const projectToUse = projectId || defaultProject || '';
    if (projectToUse) {
      const shopUrl = `https://${projectToUse}.web.app`;
      console.log(`\n✅ Deployment complete. Example URLs:`);
      console.log(` - Shop: ${shopUrl}`);
      console.log(` - Admin: ${shopUrl}/admin`);
    } else {
      console.log('\n✅ Deployment complete. Check Firebase hosting console for the deployed site URL.');
    }

    console.log('\nDone.');
  } catch (err) {
    console.error('\nDeployment failed:', err);
    process.exit(1);
  }
})();
