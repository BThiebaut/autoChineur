#!/bin/bash

set -e
git switch prod
git rebase develop
git push
git switch develop