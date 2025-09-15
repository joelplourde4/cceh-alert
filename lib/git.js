import { Octokit } from "@octokit/rest";

const REPOSITORY_OWNER = "joelplourde4";
const REPOSITORY_NAME = "cceh-alert";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
if (!GITHUB_TOKEN) {
    error("GITHUB_TOKEN environment variable is not set. Cannot fetch data.json from GitHub.");
}

/**
 * Pushes a file to a GitHub repository.
 * @param {string} path - File path in the repository.
 * @param {string} content - File content (string).
 * @param {string} message - Commit message.
 */
export async function pushFileToGitHub(path, content, message) {
    const { Octokit } = await import("@octokit/rest"); // dynamic import
    const octokit = new Octokit({ auth: GITHUB_TOKEN });

    // Get the current file SHA if it exists
    let sha;
    try {
        const { data } = await octokit.repos.getContent({
            owner: REPOSITORY_OWNER,
            repo: REPOSITORY_NAME,
            path
        });
        sha = data.sha;
    } catch (err) {
        if (err.status !== 404) throw err;
    }

    await octokit.repos.createOrUpdateFileContents({
        owner: REPOSITORY_OWNER,
        repo: REPOSITORY_NAME,
        path,
        message,
        content: Buffer.from(content).toString("base64"),
        sha
    });
}

/**
 * Retrieves a file's content from a GitHub repository.
 * @param {string} token - GitHub personal access token.
 * @param {string} owner - Repository owner.
 * @param {string} repo - Repository name.
 * @param {string} path - File path in the repository.
 * @returns {Promise<string>} - The file content as a string.
 */
export async function getFileFromGitHub(path) {
    const octokit = new Octokit({ auth: GITHUB_TOKEN });
    const { data } = await octokit.repos.getContent({
        owner: REPOSITORY_OWNER,
        repo: REPOSITORY_NAME,
        path
    });
    return Buffer.from(data.content, "base64").toString("utf8");
}