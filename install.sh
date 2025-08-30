#!/bin/bash
echo "Installing dependencies with increased memory limit..."
node --max-old-space-size=4096 $(which npm) install --legacy-peer-deps
echo "Installation complete!"
