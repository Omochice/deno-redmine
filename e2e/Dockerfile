ARG REDMINE_VERSION=7.0@sha256:104dd6eb2cc5ef2d357a37ba1f4c20e32b2a28378843f5b406a7cff9ae47090d
FROM redmine:${REDMINE_VERSION}

RUN apt-get update \
    && apt-get install -y --no-install-recommends git \
    && git clone https://github.com/agileware-jp/redmine_issue_templates.git \
        /usr/src/redmine/plugins/redmine_issue_templates \
    && git -C /usr/src/redmine/plugins/redmine_issue_templates checkout a3c30b03ee6bad57ad94d47824e1320e990f6e4f \
    && apt-get purge -y git \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/*
