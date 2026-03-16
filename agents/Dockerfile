FROM node:24-slim

# Install system deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    cron \
    curl \
    git \
    gettext-base \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install himalaya (email CLI)
ARG HIMALAYA_VERSION=v1.2.0
RUN curl -fsSL "https://github.com/pimalaya/himalaya/releases/download/${HIMALAYA_VERSION}/himalaya.x86_64-linux.tgz" \
    | tar -xz -C /usr/local/bin/ \
    && chmod +x /usr/local/bin/himalaya

# Install openclaw globally
RUN npm i -g openclaw

# Create app user and directories
RUN useradd -m -s /bin/bash agent
USER agent
WORKDIR /home/agent

RUN mkdir -p .openclaw/workspace .openclaw/logs .openclaw/credentials/whatsapp .config/himalaya

# Copy base workspace files
COPY --chown=agent:agent _base/workspace/ .openclaw/workspace/

# Overlay agent-specific workspace files
ARG AGENT_TYPE=el-baqueano
COPY --chown=agent:agent ${AGENT_TYPE}/workspace/ .openclaw/workspace/

# Copy config templates and scripts
COPY --chown=agent:agent _base/config/ /tmp/config/
COPY --chown=agent:agent _base/scripts/ /tmp/scripts/

# Copy and setup entrypoint
COPY --chown=agent:agent _base/docker/docker-entrypoint.sh.template /home/agent/docker-entrypoint.sh
RUN chmod +x /home/agent/docker-entrypoint.sh

# Initialize state files
RUN echo '{}' > .openclaw/workspace/channel-state.json \
    && echo '{}' > .openclaw/workspace/tweet-state.json

# Make scripts executable
RUN cp /tmp/scripts/channel-checker.py /home/agent/channel-checker.py \
    && chmod +x /home/agent/channel-checker.py
RUN if [ -f /tmp/scripts/tweet-scheduler.py ]; then \
      cp /tmp/scripts/tweet-scheduler.py /home/agent/tweet-scheduler.py \
      && chmod +x /home/agent/tweet-scheduler.py; \
    fi

ENTRYPOINT ["/home/agent/docker-entrypoint.sh"]
