// SmartBin Git Commit Helper
// This script helps ensure proper git commit practices for the SmartBin project
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// ANSI color codes for pretty console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
};

/**
 * Execute git command and return output
 * @param {string} command - The git command to run
 * @returns {string} Command output
 */
function runGitCommand(command) {
  try {
    return execSync(command, { encoding: 'utf-8' });
  } catch (error) {
    console.error(`${colors.red}${colors.bright}Error executing command:${colors.reset} ${command}`);
    console.error(error.message);
    return null;
  }
}

/**
 * Get the current git status
 * @returns {string} Git status output
 */
function getGitStatus() {
  return runGitCommand('git status --porcelain');
}

/**
 * Generate detailed diff summary for changes
 * @returns {string} Diff summary content
 */
function generateDiffSummary() {
  return runGitCommand('git diff --cached');
}

/**
 * Create a temporary summary file with the staged changes
 * @returns {string} Path to the created summary file
 */
function createSummaryFile() {
  const summaryFilePath = path.join(process.cwd(), 'commit-summary.txt');
  const diffSummary = generateDiffSummary();
  fs.writeFileSync(summaryFilePath, diffSummary, 'utf-8');
  return summaryFilePath;
}

/**
 * Get the current branch name
 * @returns {string} Current branch name
 */
function getCurrentBranch() {
  const branchOutput = runGitCommand('git branch --show-current');
  return branchOutput ? branchOutput.trim() : 'unknown';
}

/**
 * Check if there are any staged changes
 * @returns {boolean} True if there are staged changes
 */
function hasStagedChanges() {
  const status = getGitStatus();
  if (!status) return false;
  
  const stagedChanges = status
    .split('\n')
    .filter(line => line.trim().length > 0)
    .some(line => !line.startsWith('??') && !line.startsWith(' '));
    
  return stagedChanges;
}

/**
 * Suggest a commit type based on the changed files
 * @returns {string} Suggested commit type
 */
function suggestCommitType() {
  const diff = runGitCommand('git diff --cached --name-only');
  if (!diff) return 'feat';

  const files = diff.split('\n').filter(f => f.trim());
  
  if (files.some(f => f.includes('test') || f.endsWith('.test.js') || f.endsWith('.test.ts'))) {
    return 'test';
  } else if (files.some(f => f === 'package.json' || f === 'package-lock.json' || f === 'yarn.lock')) {
    return 'deps';
  } else if (files.some(f => f.endsWith('.md') || f.endsWith('.txt'))) {
    return 'docs';
  } else if (files.some(f => f.includes('fix') || f.includes('bug'))) {
    return 'fix';
  }
  
  return 'feat';
}

/**
 * Format the commit message following SmartBin project standards
 * @param {string} title - The commit title
 * @param {string} detailedDescription - The detailed description
 * @returns {string} Formatted commit command 
 */
function formatCommitMessage(title, detailedDescription) {
  // Clean up the detailed description - add bullet points if needed
  let formattedDescription = detailedDescription;
  if (!formattedDescription.includes('-')) {
    formattedDescription = formattedDescription
      .split('\n')
      .map(line => line.trim() ? `- ${line}` : line)
      .join('\n');
  }

  return `git commit -m "${title}" -m "${formattedDescription}"`;
}

/**
 * Main function to guide the user through the commit process
 */
async function main() {
  console.log('\n' + 
    colors.cyan + colors.bright +
    '=== SmartBin Git Commit Helper ===' + 
    colors.reset + '\n'
  );

  // Check if repository exists
  if (!fs.existsSync(path.join(process.cwd(), '.git'))) {
    console.log(`${colors.red}Error: Not a git repository.${colors.reset}`);
    rl.close();
    return;
  }

  // Show git status
  const status = runGitCommand('git status');
  console.log(`${colors.yellow}Current Status:${colors.reset}\n${status}`);
  
  // Check for staged changes
  if (!hasStagedChanges()) {
    console.log(`${colors.yellow}No staged changes found. Would you like to add all changes? (y/n)${colors.reset}`);
    const answer = await new Promise(resolve => rl.question('> ', resolve));
    
    if (answer.toLowerCase() === 'y') {
      console.log(`${colors.blue}Adding all changes...${colors.reset}`);
      runGitCommand('git add .');
    } else {
      console.log(`${colors.yellow}Please stage your changes manually using 'git add <files>' and run this script again.${colors.reset}`);
      rl.close();
      return;
    }
  }

  // Create summary file
  console.log(`${colors.blue}Creating commit summary file...${colors.reset}`);
  const summaryFilePath = createSummaryFile();
  console.log(`${colors.green}Summary file created at: ${summaryFilePath}${colors.reset}`);
  
  // Show diff summary stats
  const diffStat = runGitCommand('git diff --cached --stat');
  console.log(`${colors.yellow}Files to be committed:${colors.reset}\n${diffStat}`);
  
  // Suggest commit type
  const suggestedType = suggestCommitType();
  
  // Ask for commit message
  const currentBranch = getCurrentBranch();
  console.log(`\n${colors.cyan}Current branch: ${colors.bright}${currentBranch}${colors.reset}`);
  
  console.log(`\n${colors.yellow}Please enter a brief commit title:${colors.reset}`);
  console.log(`${colors.green}Suggested format: ${colors.bright}<${suggestedType}>: Brief description${colors.reset}`);
  
  const commitTitle = await new Promise(resolve => rl.question('> ', resolve));
  
  console.log(`\n${colors.yellow}Please enter a detailed description (multiple lines supported, empty line to finish):${colors.reset}`);
  console.log(`${colors.green}Suggestion: List the key changes, why they were made, and any impact${colors.reset}`);
  
  const detailedLines = [];
  let line;
  
  while (true) {
    line = await new Promise(resolve => rl.question('> ', resolve));
    if (line.trim() === '') break;
    detailedLines.push(line);
  }
  
  const detailedDescription = detailedLines.join('\n');
  
  // Format and execute commit
  const commitCommand = formatCommitMessage(commitTitle, detailedDescription);
  
  console.log(`\n${colors.blue}Executing commit command:${colors.reset}`);
  console.log(commitCommand);
  
  try {
    execSync(commitCommand, { stdio: 'inherit' });
    console.log(`\n${colors.green}${colors.bright}Commit successful!${colors.reset}`);
    
    // Clean up summary file
    fs.unlinkSync(summaryFilePath);
    console.log(`${colors.blue}Removed summary file: ${summaryFilePath}${colors.reset}`);
    
    // Ask if user wants to push
    console.log(`\n${colors.yellow}Would you like to push your changes to remote? (y/n)${colors.reset}`);
    const shouldPush = await new Promise(resolve => rl.question('> ', resolve));
    
    if (shouldPush.toLowerCase() === 'y') {
      console.log(`${colors.blue}Pushing to remote...${colors.reset}`);
      execSync(`git push origin ${currentBranch}`, { stdio: 'inherit' });
      console.log(`${colors.green}${colors.bright}Push successful!${colors.reset}`);
    }
  } catch (error) {
    console.error(`${colors.red}Error during commit:${colors.reset} ${error.message}`);
  }
  
  rl.close();
}

// Run the main function
main().catch(error => {
  console.error(`${colors.red}${colors.bright}Error:${colors.reset} ${error.message}`);
  rl.close();
});
