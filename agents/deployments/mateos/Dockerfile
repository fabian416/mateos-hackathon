FROM python:3.12-slim

RUN pip install --no-cache-dir requests requests-oauthlib

RUN useradd -m -s /bin/bash agent
USER agent
WORKDIR /home/agent/app

COPY --chown=agent:agent scripts/ scripts/
COPY --chown=agent:agent .env .env
RUN mkdir -p logs && echo '{}' > tweet-state.json

COPY --chown=agent:agent docker-entrypoint.sh /home/agent/
RUN chmod +x /home/agent/docker-entrypoint.sh

ENTRYPOINT ["/home/agent/docker-entrypoint.sh"]
