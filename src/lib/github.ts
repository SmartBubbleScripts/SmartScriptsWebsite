import { Octokit } from '@octokit/rest';

export async function inviteUserToRepo(
  githubUsername: string,
  owner: string,
  repo: string
) {
  if (!process.env.GITHUB_PAT) {
    console.error('GITHUB_PAT environment variable is not set.');
    return {
      success: false,
      error: 'Server configuration error (Missing GitHub Token)',
    };
  }
  const octokit = new Octokit({ auth: process.env.GITHUB_PAT });

  if (!owner || !repo) {
    console.error('Missing owner or repo for GitHub invite');
    return {
      success: false,
      error: 'Repository details missing in product config',
    };
  }
  if (!githubUsername) {
    console.error('Missing githubUsername for GitHub invite');
    return { success: false, error: 'GitHub username missing' };
  }

  try {
    await octokit.repos.addCollaborator({
      owner,
      repo,
      username: githubUsername,
      permission: 'pull',
    });
    console.log(`Invited ${githubUsername} to ${owner}/${repo}`);
    return { success: true };
  } catch (error) {
    console.error(
      `Failed to invite ${githubUsername} to ${owner}/${repo}:`,
      error
    );
    let message = 'Unknown GitHub API error';
    if (error instanceof Error) {
      // Fixed: Check status property safely without 'as any'
      const status =
        typeof error === 'object' && error !== null && 'status' in error
          ? Number((error as { status?: number }).status)
          : undefined;
      if (status === 404) {
        message = 'GitHub user not found or repository details incorrect.';
      } else if (status === 422) {
        message = 'Validation failed (e.g., already invited/limit).';
      } else {
        // Fixed: Use error.message directly
        message = error.message;
      }
    }
    return { success: false, error: `GitHub invite failed: ${message}` };
  }
}
