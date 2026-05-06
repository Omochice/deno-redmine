ARG REDMINE_VERSION=5.1@sha256:a6815582a9c53019583b542a69f7c7a18a2e5d9b3696ddd2fd29d6e186002875
FROM redmine:${REDMINE_VERSION}

RUN apt-get update \
    && apt-get install -y --no-install-recommends git \
    && git clone https://github.com/agileware-jp/redmine_issue_templates.git \
        /usr/src/redmine/plugins/redmine_issue_templates \
    && git -C /usr/src/redmine/plugins/redmine_issue_templates checkout a3c30b03ee6bad57ad94d47824e1320e990f6e4f \
    && apt-get purge -y git \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/*
