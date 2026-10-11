# 暂停存档（10-11，Ham 说额度要没了，10-16 再启动）
- `skillfx-ingame-wip.diff`：技能特效进游戏的半成品（基于 dev 15fbca9）。
  - 内容：象腿成品造型 ghostLeg、立体金盾 goldShield、齐射 skyVolley（加快、箭跟着棋子抖）、拒马实心短矛、Stand 切换时兵阵淡出。
  - 其中 main.js / template.html 的部分是已上线的 V14，打补丁时会和 dev 重复，跳过这部分即可。
  - 还没做：用游戏镜头录屏核对金盾和象腿 → 四个技能重新挂审批台 → 通过后写 V 号交 TD，并告诉角色部 squads.js 改了什么。
- 造型对比页在 `source/art-director/skillfx/lookdev/`。
