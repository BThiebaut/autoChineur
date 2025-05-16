#!/usr/bin
set -e
git switch -c prod
git rebase develop
git push
git switch develop