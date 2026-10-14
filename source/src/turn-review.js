// Turn-end reminder: opportunities must remain legal after the move and be usable after cancelling it.
(function(global) {
  function opportunities(game, trial) {
    const BF = global.BF || require('./bingfa.js'), side = game.turn;
    if (trial.result) return [];
    const pre = new BF.Game(game.cfg); pre.reset(game.S);
    const post = new BF.Game(game.cfg), S = BF.cloneState(trial.S);
    S.turn = side; S.cnt = { ...game.S.cnt }; S.ckHist = BF.cloneState(game.S).ckHist;
    S.upgraded = game.S.upgraded; S.freeUsed = game.S.freeUsed; S.jmLock = game.S.jmLock;
    post.reset(S);
    const found = [];
    for (let r = 0; r < 10; r++) for (let f = 0; f < 9; f++) {
      const p = pre.at(f,r); if (!p || p.s !== side) continue;
      let dest = null;
      for (let y = 0; y < 10; y++) for (let x = 0; x < 9; x++) if (post.at(x,y)?.id === p.id) dest = [x,y];
      if (!dest) continue;
      if (pre.canUpgrade(f,r) && post.canUpgrade(...dest)) found.push({kind:'up', id:p.id, at:[f,r], name:pre.rankName(p), cost:pre.upgradeCost(p), label:'升级'});
      for (const a of pre.skillTargets(f,r)) {
        const result = BF.attempt(pre.S,a); if (!result?.free) continue;
        const sk = a.sk || pre.skillOf(p);
        const available = post.skillTargets(...dest,sk).some(b => BF.attempt(post.S,b)?.free);
        if (available && !found.some(x=>x.kind==='sk'&&x.id===p.id&&x.skill===sk)) found.push({kind:'sk',id:p.id,at:[f,r],name:pre.rankName(p),skill:sk,label:BF.SKILL_CN[sk]});
      }
    }
    return found;
  }
  // In-memory only: suppression follows one live game object across turns.
  // Starting/reloading a game creates or explicitly resets the scope in the controller.
  class TurnScope {
    constructor() { this.reset(); }
    reset() { this.game = null; this.turnKey = ''; this.muted = false; this.hints = null; }
    sync(game) {
      if (this.game !== game) { this.reset(); this.game = game; }
      const turnKey = game?.bf ? `${game.turn}/${game.S.cnt.r}/${game.S.cnt.b}` : '';
      if (this.turnKey !== turnKey) { this.turnKey = turnKey; this.hints = null; }
    }
    suppress(game, on) { this.sync(game); this.muted = !!on; }
    isSuppressed(game) { this.sync(game); return this.muted; }
    showUpgrades(game) { this.sync(game); this.hints = {kind:'up'}; }
    showSkill(game, skill) { this.sync(game); this.hints = {kind:'sk', skill}; }
    clearHints() { this.hints = null; }
    candidateCells(game) {
      this.sync(game);
      const cells = [];
      if (!this.hints || !game?.bf || game.result) return cells;
      const BF = global.BF || require('./bingfa.js');
      for (let r=0;r<10;r++) for (let f=0;f<9;f++) {
        if (this.hints.kind === 'up' ? game.canUpgrade(f,r)
          : game.skillTargets(f,r,this.hints.skill).some(a => BF.attempt(game.S,a)?.free)) cells.push([f,r]);
      }
      return cells;
    }
  }
  const api = { opportunities, TurnScope };
  if (typeof module !== 'undefined' && module.exports) module.exports=api; else global.TurnReview=api;
})(typeof window !== 'undefined' ? window : globalThis);
