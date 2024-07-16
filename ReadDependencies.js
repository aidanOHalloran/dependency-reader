const axios = require('axios');
const fs = require('fs');

async function getChangelogInfo(packageName) {
    try {
        const packageData = await axios.get(`https://registry.npmjs.org/${packageName}`);
        const latestVersion = packageData.data['dist-tags'].latest;
        const time = packageData.data.time[latestVersion];
        const repository = packageData.data.repository.url.replace('git+', '').replace('.git', '');
        const changelogUrl = `${repository}/blob/master/CHANGELOG.md`;

        return { packageName, latestVersion, time, changelogUrl };
    } catch (error) {
        console.error(`Failed to get changelog info for ${packageName}:`, error);
        return null;
    }
}

async function checkDependencies() {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    const dependencies = Object.keys(packageJson.dependencies || {});
    const devDependencies = Object.keys(packageJson.devDependencies || {});

    const allDependencies = [...dependencies, ...devDependencies];

    const changelogInfos = await Promise.all(allDependencies.map(getChangelogInfo));
    changelogInfos.filter(Boolean).forEach(info => {
        console.log(`${info.packageName}:`);
        console.log(`  Latest Version: ${info.latestVersion}`);
        console.log(`  Release Date: ${info.time}`);
        console.log(`  Changelog URL: ${info.changelogUrl}`);
        console.log();
    });
}

checkDependencies();
