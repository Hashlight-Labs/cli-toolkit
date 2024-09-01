import { logger } from "@/lib/logger";
import chalk from "chalk";
import simpleGit from "simple-git";
const git = simpleGit();

export async function checkIfRepoIsUpToDate(onFetch: () => void) {
  try {
    // Fetch latest commits from remote
    await git.fetch();

    // Get the current branch name
    const status = await git.status();
    const currentBranch = status.current;

    // Get the local and remote commit hashes
    const localCommit = await git.revparse(["HEAD"]);
    const remoteCommit = await git.revparse([`origin/${currentBranch}`]);

    onFetch();
    if (localCommit === remoteCommit) {
      logger.info("You're using the latest version. Good job!");
    } else {
      logger.warn(
        `Your CLI is not up to date. Please use ${chalk.green(
          "yarn update"
        )} or ${chalk.yellow(
          "yarn update:force"
        )} (removes local changes) to update`
      );
    }
  } catch (error) {
    logger.error("Error checking the repository status:", error);
  }
}
