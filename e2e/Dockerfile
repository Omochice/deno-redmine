ARG REDMINE_VERSION=5.1
FROM redmine:${REDMINE_VERSION}

RUN apt-get update && apt-get install -y --no-install-recommends git \
    && rm -rf /var/lib/apt/lists/*

RUN git clone https://github.com/agileware-jp/redmine_issue_templates.git \
    /usr/src/redmine/plugins/redmine_issue_templates
