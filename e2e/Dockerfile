ARG REDMINE_VERSION=7.0@sha256:eff65d7d651d8b07784cbaf37aec5aa74c1ccea3b834e8157e7043c003bdbf70
FROM redmine:${REDMINE_VERSION}

RUN apt-get update \
    && apt-get install -y --no-install-recommends git \
    && git clone https://github.com/agileware-jp/redmine_issue_templates.git \
        /usr/src/redmine/plugins/redmine_issue_templates \
    && git -C /usr/src/redmine/plugins/redmine_issue_templates checkout a3c30b03ee6bad57ad94d47824e1320e990f6e4f \
    && apt-get purge -y git \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/*
