#!/usr/bin/env node
const { spawn, execSync } = require('child_process');
const fs = require('fs');
const readline = require('readline');

function run(cmd) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: 'inherit', shell: true });
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

function openUrl(url) {
  try {
    if (process.platform === 'win32') {
      execSync(`start ${url}`);
    } else if (process.platform === 'darwin') {
      execSync(`open ${url}`);
    } else {
      execSync(`xdg-open ${url}`);
    }
  } catch (e) {
    console.log('Open browser failed; please open:', url);
  }
}

function readDefaultProject() {
  try {
    const rc = JSON.parse(fs.readFileSync('.firebaserc', 'utf8'));
    return rc?.projects?.default || '';
  } catch (e) {
    return '';
  }
}

// Validate that a project id exists in the user's accessible Firebase projects
function validateProject(projectId) {
  try {
    // Try JSON output first
    let out = '';
    try {
      out = execSync('firebase projects:list --json', { encoding: 'utf8', shell: true });
    } catch (e) {
      out = execSync('firebase projects:list', { encoding: 'utf8', shell: true });
    }

    return out && out.includes(projectId);
  } catch (e) {
    // If listing fails, return false so user can decide
    return false;
  }
}

async function ensureFirebaseSetup() {
  // Clear npm cache (best-effort)
  try {
    console.log('\nClearing npm cache...');
    run('npm cache clean --force');
  } catch (e) {
    console.warn('npm cache clean failed (you may not have permissions).');
  }

  // Ensure firebase-tools installed
  let firebaseInstalled = true;
  try {
    execSync('firebase --version', { stdio: 'ignore', shell: true });
  } catch (e) {
    firebaseInstalled = false;
  }

  if (!firebaseInstalled) {
    const install = (await ask('firebase-tools not found. Install globally now? (Y/n)', 'Y')).toLowerCase();
    if (install === 'y' || install === 'yes') {
      try {
        run('npm install -g firebase-tools');
      } catch (err) {
        console.error('Global install failed. Please install firebase-tools manually and re-run.');
        process.exit(1);
      }
    } else {
      console.error('firebase-tools required. Aborting.');
      process.exit(1);
    }
  }

  // Ensure logged in
  try {
    execSync('firebase projects:list', { stdio: 'ignore', shell: true });
  } catch (e) {
    console.log('Not logged into Firebase CLI. Running `firebase login` now...');
    run('firebase login');
  }

  // Ensure default project is set (persist in .firebaserc)
  let defaultProject = readDefaultProject();
  if (!defaultProject) {
    while (true) {
      const proj = await ask('No default Firebase project found. Enter project id to persist as default (or leave blank to skip)', '');
      if (!proj) break;

      const ok = validateProject(proj);
      if (ok) {
        let rc = { projects: {} };
        try { rc = JSON.parse(fs.readFileSync('.firebaserc', 'utf8')); } catch (e) { /* start fresh */ }
        rc.projects = rc.projects || {};
        rc.projects.default = proj;
        fs.writeFileSync('.firebaserc', JSON.stringify(rc, null, 2));
        console.log(`Saved default project '${proj}' to .firebaserc`);
        defaultProject = proj;
        break;
      } else {
        const cont = (await ask('Project not found or inaccessible. Save it anyway? (y/N)', 'N')).toLowerCase();
        if (cont === 'y' || cont === 'yes') {
          let rc = { projects: {} };
          try { rc = JSON.parse(fs.readFileSync('.firebaserc', 'utf8')); } catch (e) { /* start fresh */ }
          rc.projects = rc.projects || {};
          rc.projects.default = proj;
          fs.writeFileSync('.firebaserc', JSON.stringify(rc, null, 2));
          console.log(`Saved default project '${proj}' to .firebaserc (note: project validation failed)`);
          defaultProject = proj;
          break;
        }
        // else loop again
      }
    }
  }

  return defaultProject;
}

async function main() {
  const defaultProject = await ensureFirebaseSetup();
  if (!defaultProject) {
    console.log('\nNo default project set. The deploy step will ask for project if needed.');
  } else {
    console.log(`\nUsing default Firebase project: ${defaultProject}`);
  }

  console.log('\nInstalling project dependencies (root + admin) if needed...');
  run('npm run setup');

  console.log('\nStarting Shop + Admin + API dev servers. Press Ctrl+C when finished editing to build & deploy.');

  // Start API (in background)
  const api = spawn('npm', ['run', 'dev:api'], { stdio: 'inherit', shell: true });

  // Start Shop dev server (Vite on :5173)
  const shop = spawn('npm', ['run', 'dev', '--', '--host'], { stdio: 'inherit', shell: true });

  // Start Admin dev server
  const admin = spawn('npm', ['--prefix', 'admin', 'run', 'dev'], { stdio: 'inherit', shell: true });

  // Open Admin page in default browser (Shop runs in background)
  openUrl('http://localhost:3001');

  // On Ctrl+C (SIGINT), stop servers and deploy
  process.on('SIGINT', async () => {
    console.log('\n\nSIGINT received — stopping dev servers and deploying...');

    try { api.kill('SIGTERM'); } catch (e) {}
    try { admin.kill('SIGTERM'); } catch (e) {}
    try { shop.kill('SIGTERM'); } catch (e) {}

    try {
      console.log('\nBuilding Shop...');
      run('npm run build');

      console.log('\nBuilding Admin...');
      run('npm --prefix admin run build');

      console.log('\nCopying Admin build into shop/dist/admin...');
      run('node scripts/copy-admin-dist.cjs');

      // Deploy to default project or ask
      let project = defaultProject;
      if (!project) {
        project = await ask('Enter Firebase project id to deploy to', '');
        if (!project) {
          console.error('No project specified. Aborting deploy.');
          process.exit(1);
        }
      }

      // Attempt deploy; if it fails because project is invalid, allow retry
      while (true) {
        try {
          console.log(`\nDeploying to Firebase project: ${project}`);
          run(`firebase deploy --only hosting --project ${project}`);
          break; // success
        } catch (err) {
          console.error('\nDeploy failed:', err.message || err);
          const retry = (await ask('Deploy failed. Enter a different project id to retry or leave blank to cancel', '')).trim();
          if (!retry) {
            console.error('No project specified. Aborting deploy.');
            process.exit(1);
          }
          project = retry;
          const persist = (await ask('Persist this project as default? (y/N)', 'N')).toLowerCase();
          if (persist === 'y' || persist === 'yes') {
            let rc = { projects: {} };
            try { rc = JSON.parse(fs.readFileSync('.firebaserc', 'utf8')); } catch (e) { /* start fresh */ }
            rc.projects = rc.projects || {};
            rc.projects.default = project;
            fs.writeFileSync('.firebaserc', JSON.stringify(rc, null, 2));
            console.log(`Saved default project '${project}' to .firebaserc`);
          }
        }
      }

      console.log('\n✅ Deploy complete.');
      console.log(` - Shop: https://${project}.web.app`);
      console.log(` - Admin: https://${project}.web.app/admin`);

      process.exit(0);
    } catch (err) {
      console.error('\nDeploy failed:', err);
      process.exit(1);
    }
  });

  api.on('exit', (code, signal) => {
    console.log(`API process exited (code: ${code}, signal: ${signal}). To deploy, press Ctrl+C.`);
  });
  shop.on('exit', (code, signal) => {
    console.log(`Shop process exited (code: ${code}, signal: ${signal}). To deploy, press Ctrl+C.`);
  });
  admin.on('exit', (code, signal) => {
    console.log(`Admin process exited (code: ${code}, signal: ${signal}). To deploy, press Ctrl+C.`);
  });
}

main();
