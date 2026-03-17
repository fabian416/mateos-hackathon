#!/bin/bash
cd /home/lucholeonel/CODE-werify/projects/mateos/agents/deployments/mateos

# Cargar env vars desde .env
set -a
source .env 2>/dev/null
set +a

# Correr scheduler
/usr/bin/python3 scripts/tweet-scheduler.py >> logs/marcos.log 2>&1
