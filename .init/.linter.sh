#!/bin/bash
cd /home/kavia/workspace/code-generation/unified-shopping-platform-45431/react_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

