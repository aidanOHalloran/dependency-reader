const axios = require('axios'); // Import axios for making HTTP requests
const fs = require('fs'); // Import fs for reading the file system

// Function to fetch changelog information for a given package
async function getChangelogInfo(packageName) {
    try {
        // Make a GET request to the npm registry for the package's metadata
        const packageData = await axios.get(`https://registry.npmjs.org/${packageName}`);
        // Extract the latest version of the package
        const latestVersion = packageData.data['dist-tags'].latest;
        // Extract the release time of the latest version
        const time = packageData.data.time[latestVersion];
        // Extract the repository URL, clean it up by removing 'git+' prefix and '.git' suffix
        const repository = packageData.data.repository.url.replace('git+', '').replace('.git', '');
        // Construct the URL for the changelog file in the repository
        const changelogUrl = `${repository}/blob/master/CHANGELOG.md`;
        // Return an object containing the package name, latest version, release time, and changelog URL
        return { packageName, latestVersion, time, changelogUrl };
    } catch (error) {
        // Log an error message if the request fails and return null
        console.error(`Failed to get changelog info for ${packageName}:`, error);
        return null;
    }
}

// Function to check dependencies and fetch their changelog information
async function checkDependencies() {
    // Read and parse the package.json file to get the dependencies
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    // Get the names of the regular dependencies
    const dependencies = Object.keys(packageJson.dependencies || {});
    // Get the names of the dev dependencies
    const devDependencies = Object.keys(packageJson.devDependencies || {});
    // Combine both dependencies and dev dependencies into a single array
    const allDependencies = [...dependencies, ...devDependencies];
    // Fetch changelog information for all dependencies concurrently
    const changelogInfos = await Promise.all(allDependencies.map(getChangelogInfo));
    // Filter out any null results and log the changelog information for each dependency
    changelogInfos.filter(Boolean).forEach(info => {
        console.log(`${info.packageName}:`);
        console.log(`  Latest Version: ${info.latestVersion}`);
        console.log(`  Release Date: ${info.time}`);
        console.log(`  Changelog URL: ${info.changelogUrl}`);
        console.log();
    });
}

// Invoke the checkDependencies function to start the process
checkDependencies();
