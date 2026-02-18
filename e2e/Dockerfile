ARG REDMINE_VERSION=5.1
FROM redmine:${REDMINE_VERSION}

RUN apt-get update \
    && apt-get install -y --no-install-recommends git \
    && git clone --branch v3.1.1 --depth 1 https://github.com/agileware-jp/redmine_issue_templates.git \
        /usr/src/redmine/plugins/redmine_issue_templates \
    && apt-get purge -y git \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/*
