ARG REDMINE_VERSION=7.0@sha256:998b423fff33db87c3bec33f4a5f9aa4c08748d6b9227aead48255418082d9e9
FROM redmine:${REDMINE_VERSION}

RUN apt-get update \
    && apt-get install -y --no-install-recommends git \
    && git clone https://github.com/agileware-jp/redmine_issue_templates.git \
        /usr/src/redmine/plugins/redmine_issue_templates \
    && git -C /usr/src/redmine/plugins/redmine_issue_templates checkout a3c30b03ee6bad57ad94d47824e1320e990f6e4f \
    && apt-get purge -y git \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/*
