ARG REDMINE_VERSION=7.0@sha256:c3c9da0407e99b2a47af9e0af7b06bce1a3cfec16def1c14cd1fae61e3fa0770
FROM redmine:${REDMINE_VERSION}

RUN apt-get update \
    && apt-get install -y --no-install-recommends git \
    && git clone https://github.com/agileware-jp/redmine_issue_templates.git \
        /usr/src/redmine/plugins/redmine_issue_templates \
    && git -C /usr/src/redmine/plugins/redmine_issue_templates checkout a3c30b03ee6bad57ad94d47824e1320e990f6e4f \
    && apt-get purge -y git \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/*
