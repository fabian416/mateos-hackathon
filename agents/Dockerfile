FROM node:24-slim

# Install system deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    cron \
    curl \
    git \
    gettext-base \
    ca-certificates \
    && pip3 install --break-system-packages requests requests-oauthlib \
    && rm -rf /var/lib/apt/lists/*

# Install himalaya (email CLI)
ARG HIMALAYA_VERSION=v1.2.0
RUN curl -fsSL "https://github.com/pimalaya/himalaya/releases/download/${HIMALAYA_VERSION}/himalaya.x86_64-linux.tgz" \
    | tar -xz -C /usr/local/bin/ \
    && chmod +x /usr/local/bin/himalaya

# Install gog (Google Workspace CLI for Sheets, Calendar, Gmail, Drive, etc.)
# cache-bust: v2
ARG GOG_VERSION=0.12.0
RUN curl -fsSL "https://github.com/steipete/gogcli/releases/download/v${GOG_VERSION}/gogcli_${GOG_VERSION}_linux_amd64.tar.gz" \
    | tar -xz -C /usr/local/bin/ gog \
    && chmod +x /usr/local/bin/gog

# Install openclaw globally
# Note: gog skill metadata is bundled in _base/workspace/skills/gog/ (copied later)
RUN npm i -g openclaw

# Create app user and directories
RUN useradd -m -s /bin/bash agent
USER agent
WORKDIR /home/agent

RUN mkdir -p .openclaw/workspace .openclaw/logs .openclaw/credentials/whatsapp .config/himalaya .openclaw/credentials

# Copy base workspace files
COPY --chown=agent:agent _base/workspace/ .openclaw/workspace/

# Overlay agent-specific workspace files
ARG AGENT_TYPE=el-baqueano
COPY --chown=agent:agent ${AGENT_TYPE}/workspace/ .openclaw/workspace/

# Copy config templates, scripts, and hooks
COPY --chown=agent:agent _base/config/ /tmp/config/
COPY --chown=agent:agent _base/scripts/ /tmp/scripts/
COPY --chown=agent:agent _base/hooks/ .openclaw/hooks/

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
RUN cp /tmp/scripts/delegate.py /home/agent/delegate.py \
    && chmod +x /home/agent/delegate.py
RUN cp /tmp/scripts/tweet.py /home/agent/tweet.py \
    && chmod +x /home/agent/tweet.py

ENTRYPOINT ["/home/agent/docker-entrypoint.sh"]
