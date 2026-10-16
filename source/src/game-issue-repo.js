(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.GameIssueRepo = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const CURRENT_REPO = 'liukaidipeng-ops/chuhan_gpt';
  const LEGACY_REPO = 'liukaidipeng-ops/chuhan_v01';
  const REPO_RE = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;

  function validRepo(repo) { return typeof repo === 'string' && REPO_RE.test(repo); }
  function repoFromUrl(url) {
    if (typeof url !== 'string' || !url) return null;
    try {
      const u = new URL(url);
      if (u.hostname !== 'github.com') return null;
      const p = u.pathname.split('/').filter(Boolean);
      const repo = p.length >= 4 && p[2] === 'issues' ? `${p[0]}/${p[1]}` : null;
      return validRepo(repo) ? repo : null;
    } catch (e) { return null; }
  }
  function repoOf(issue) {
    if (issue && validRepo(issue.repo)) return issue.repo;
    return repoFromUrl(issue && issue.url) || LEGACY_REPO;
  }
  function shortRepo(repo) { return String(repo || '').split('/').pop() || repo; }
  function issuePath(issue, suffix) {
    return `/repos/${repoOf(issue)}/issues/${issue.n}${suffix || ''}`;
  }
  function migrateRecords(records) {
    let changed = false;
    for (const rec of records || []) {
      const issue = rec && rec.issue;
      if (!issue || !issue.n || validRepo(issue.repo)) continue;
      issue.repo = repoOf(issue); changed = true;
    }
    return changed;
  }
  async function sendIssue(opt) {
    const { rec, parts, title, label, request, persist } = opt;
    let issue = rec.issue, createdNow = false;
    if (!issue || !issue.n) {
      const j = await request(`/repos/${CURRENT_REPO}/issues`, 'POST', { title, body: parts[0], labels: [label] }, CURRENT_REPO);
      issue = rec.issue = { n: j.number, url: j.html_url, repo: CURRENT_REPO, chunks: parts.length, sent: 1, state: 'open', replies: 0, at: Date.now() };
      createdNow = true; persist(rec);
    } else {
      const repo = repoOf(issue), addedRepo = issue.repo !== repo;
      issue.repo = repo;
      if (addedRepo) persist(rec);
      if (issue.chunks !== parts.length) throw new Error('原工单的分块数量与本地记录不一致；已保留原工单，请勿重开或跨仓库补发');
    }
    const repo = repoOf(issue);
    if (!createdNow && (issue.sent || 1) < parts.length) {
      const remote = await request(issuePath(issue), 'GET', null, repo);
      if (!remote || remote.body !== parts[0]) throw new Error('原工单首块与本地记录不一致；已停止补发并保留原工单');
    }
    for (let i = Math.max(1, issue.sent || 1); i < parts.length; i++) {
      await request(issuePath(issue, '/comments'), 'POST', { body: parts[i] }, repo);
      issue.sent = i + 1; persist(rec);
    }
    return issue;
  }

  return { CURRENT_REPO, LEGACY_REPO, validRepo, repoFromUrl, repoOf, shortRepo, issuePath, migrateRecords, sendIssue };
});
