/**
 * Formatting utilities for Jira data
 */
import { JiraIssue, JiraComment } from "../types.js";

/**
 * Format a date string to a more readable format
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format a Jira issue for display
 */
export function formatIssue(issue: JiraIssue, storyPointsField: string | null = null): string {
  let output = `${issue.key}: ${issue.fields.summary}
- Type: ${issue.fields.issuetype.name}
- Status: ${issue.fields.status.name}
- Priority: ${issue.fields.priority?.name || "Not set"}`;

  // Only show Story Points if field is configured
  if (storyPointsField && issue.fields[storyPointsField] !== undefined) {
    output += `\n- Story Points: ${issue.fields[storyPointsField] || "Not set"}`;
  }

  output += `\n- Created: ${formatDate(issue.fields.created)}
- Description: ${issue.fields.description || "No description"}
- Creator: ${issue.fields.creator.displayName}`;

  // Add labels if any exist
  if (issue.fields.labels && issue.fields.labels.length > 0) {
    output += `\n- Labels: ${issue.fields.labels.join(", ")}`;
  }

  if (issue.fields.parent) {
    output += `\n- Parent Epic: ${issue.fields.parent.key} - ${issue.fields.parent.fields.summary}`;
  }

  // Add Epic link information if available
  for (const [fieldId, value] of Object.entries(issue.fields)) {
    if (fieldId.startsWith('customfield_') && value && typeof value === 'string') {
      output += `\n- Epic Link: ${value}`;
    }
  }

  const comments = issue.fields.comment?.comments;
  if (comments && comments.length > 0) {
    output += "\n\nComments:";
    comments.forEach((comment) => {
      output += `\n\n[${formatDate(comment.created)} by ${
        comment.author.displayName
      }]\n${comment.body}`;
    });
  }

  return output;
}

/**
 * Format a list of Jira issues for display
 */
export function formatIssueList(issues: JiraIssue[], projectKey: string, storyPointsField: string | null = null): string {
  if (issues.length === 0) {
    return "No issues found.";
  }

  const formattedIssues = issues
    .map((issue) => formatIssue(issue, storyPointsField))
    .join("\n\n");
  return `Latest Jira Issues in ${projectKey} Project:\n\n${formattedIssues}\n\nTotal Issues: ${issues.length}`;
}

/**
 * Format a created issue response
 */
export function formatCreatedIssue(issue: any, domain: string): string {
  return `Issue created successfully:
- Key: ${issue.key}
- URL: https://${domain}.atlassian.net/browse/${issue.key}`;
}