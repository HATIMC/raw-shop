pkg update && pkg upgrade -y
pkg install jq
pkg install nodejs-lts
npm install -g firebase-tools
firebase logout
firebase login
firebase projects:list

# List projects and get first project ID
FIRST_PROJECT_ID=$(firebase projects:list --json 2>/dev/null | jq -r '.result[] | .projectId' | head -n1)

if [ -z "$FIRST_PROJECT_ID" ]; then
  echo "No Firebase projects found. Run 'firebase login' first."
  exit 1
fi

echo "First project ID: $FIRST_PROJECT_ID"

# Create or update .firebaserc with first project as default
cat > .firebaserc << EOF
{
  "projects": {
    "default": "$FIRST_PROJECT_ID"
  }
}
EOF

# Set as active project
firebase use "$FIRST_PROJECT_ID"

echo "✅ Set $FIRST_PROJECT_ID as default in .firebaserc"
echo "Active project: $(firebase use)"