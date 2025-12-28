pkg update && pkg upgrade -y
pkg install nodejs-lts
npm install -g firebase-tools
firebase logout
firebase login
firebase projects:list

echo "Saving first Firebase project id to .firebaserc (if available)..."
node - <<'NODE'
const { execSync } = require('child_process');
const fs = require('fs');

try {
  let out = '';
  try {
    out = execSync('firebase projects:list --json', { encoding: 'utf8' });
  } catch (e) {
    // fall back to plain text listing
    try { out = execSync('firebase projects:list', { encoding: 'utf8' }); } catch (err) { throw err; }
  }

  if (!out) {
    console.error('No output from firebase projects:list');
    process.exit(1);
  }

  // Try parse JSON first
  let json = null;
  try { json = JSON.parse(out); } catch (e) { json = null; }

  let projectId = null;

  if (json) {
    const first = (json.results && json.results[0]) || (json.projects && json.projects[0]);
    projectId = first && (first.projectId || first.project_id || first.project);
  } else {
    // parse plain text output: take the first non-header, non-empty line and the first column
    const lines = out.split('\n').map(l => l.trim()).filter(l => l && !/^\s*Project\s+ID/i.test(l));
    if (lines.length) {
      const cols = lines[0].split(/\s+/);
      projectId = cols[0];
    }
  }

  if (!projectId) {
    console.error('No Firebase project id found. Please ensure you have at least one project and are logged in.');
    process.exit(1);
  }

  // Write/update .firebaserc
  let rc = { projects: {} };
  try { rc = JSON.parse(fs.readFileSync('.firebaserc','utf8')); } catch (e) { rc = { projects: {} }; }
  rc.projects = rc.projects || {};
  rc.projects.default = projectId;
  fs.writeFileSync('.firebaserc', JSON.stringify(rc, null, 2));
  console.log('Saved default project:', projectId);
  process.exit(0);
} catch (err) {
  console.error('Failed to determine/save Firebase project id:', err.message || err);
  process.exit(1);
}
NODE