#!/bin/bash
#
# These scripts make it easy to perform some common Git operations.
# You can copy the contents below into your .bash_profile.

# Creates a new branch and then goes to that branch (checks it out).
git_track() {
  if [ $# -eq 0 ]
    then
      echo "You must specify the name of the branch to create."
      return
  fi
  git branch --track $1 origin/master
  echo "Checking out $1"
  git checkout $1
}

# Deletes a branch.
# (If you accidentally delete a branch, see https://gist.github.com/jbgo/1944238
# for instructions on how to recover it.)
git_delete_branch() {
  if [ $# -eq 0 ]
    then
      echo "You must specify the name of the branch to delete."
      return
  fi
  git checkout master
  git branch -D $1
  echo "Deleted local branch $1"
  git push origin --delete $1
  echo "Deleted remote branch origin:$1 (if it existed)"
}

# Syncs your local master branch to the HEAD of the "upstream" repository,
# then pushes the updates to your remote master branch and the local
# branch you ran this command from.
git_sync() {
  local branch_name=$(git symbolic-ref -q HEAD)
  branch_name=${branch_name##refs/heads/}
  branch_name=${branch_name:-HEAD}
  echo "Checking out your master branch"
  git checkout master
  echo "Updating your local master branch with the latest changes (pulling upstream/master)"
  git pull --rebase upstream master
  git rebase -i
  echo "Updating your remote repository with the latest changes (pushing origin/master)"
  git push origin master -f
  echo "Checking out $branch_name"
  git checkout $branch_name
  echo "Updating your local $branch_name branch"
  git rebase master
}

# Pushes your changes from the current branch to your remote repository.
# If the branch doesn't exist on the remote repository it will be created.
git_push() {
  local branch_name=$(git symbolic-ref -q HEAD)
  branch_name=${branch_name##refs/heads/}
  branch_name=${branch_name:-HEAD}
  echo "Rebasing $branch_name"
  git rebase -i
  echo "Pushing your local branch to your remote repository (pushing origin/$branch_name)"
  git push origin $branch_name -f
}

alias git_track=git_track
alias git_delete_branch=git_delete_branch
alias git_sync=git_sync
alias git_push=git_push
