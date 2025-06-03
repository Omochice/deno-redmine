
import type { Context } from "../context.ts";
import { Client as Issue } from "./issues/mod.ts";
import { Client as Project } from "./projects/mod.ts";
import { Client as Tracker } from "./trackers/mod.ts";
import { Client as IssueTemplate } from "./issue-templates/mod.ts";
import { Client as Wiki } from "./wiki-pages/mod.ts";

export class Redmine {
  readonly #context: Context;
  readonly issue: Issue;
  readonly project: Project;
  readonly tracker: Tracker;
  readonly issueTemplate: IssueTemplate;
  readonly wiki: Wiki;

  constructor(context: Context) {
    this.#context = context;
    this.issue = new Issue(this.#context);
    this.project = new Project(this.#context);
    this.tracker = new Tracker(this.#context);
    this.issueTemplate = new IssueTemplate(this.#context);
    this.wiki = new Wiki(this.#context);
  }
}
