// modules/minecraft.js
/**
 * Minecraft Super Bot - all-in-one module
 * Features:
 *  - Commands via in-game chat (prefix "!")
 *  - Automatic modes: farming, chopping, mining, guarding villagers, exploring
 *  - PvP features: auto-attack, auto-shield, retreat, !pvp, !duel
 *  - Sleep automatic when bed found & night
 *  - Logs to Minecraft chat AND logs.txt
 *  - Safety: human-like delays, anti-destroy-house tree detection, whitelist friendly
 *
 * Usage: require('./modules/minecraft').init(client, options)
 *
 * Options example:
 * {
 *   host: 'BananaUcok.aternos.me',
 *   port: 14262,
 *   username: 'BotServer',
 *   version: '1.20.1',
 *   auth: 'offline',
 *   authPassword: null, // optional for AuthMe: '/login <pass>'
 *   homeChestPos: {x:123,y:64,z:-456} // optional
 * }
 */

const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const { GoalNear, GoalBlock, GoalFollow } = goals;
const collectBlock = require('mineflayer-collectblock').plugin;
const toolPlugin = require('mineflayer-tool').plugin;
const pvp = require('mineflayer-pvp').plugin;
const autoeat = require('mineflayer-auto-eat').plugin;
const mcDataLoader = require('minecraft-data');
const { Vec3 } = require('vec3');
const fs = require('fs-extra');
const path = require('path');

const LOG_FILE = path.join(__dirname, '..', 'logs.txt');

function now() { return (new Date()).toISOString(); }
async function appendLog(line) {
  const out = `[${now()}] ${line}\n`;
  try { await fs.appendFile(LOG_FILE, out); } catch (e) { console.error('Log write failed', e); }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function rnd(min=200, max=1200){ return Math.floor(Math.random()*(max-min))+min; }

// =================== MAIN EXPORT ===================
module.exports = {
  init: (discordClient = null, options = {}) => {
    const cfg = Object.assign({
      host: 'localhost',
      port: 25565,
      username: 'BotServer',
      version: false,
      auth: 'offline',
      authPassword: null,
      homeChestPos: null, // {x,y,z} optional
      safeVillageRadius: 24,
      exploreRadius: 250
    }, options);

    let bot = null;
    let mcData = null;
    let movements = null;
    let exploring = false;
    let autoModes = {
      farming: true,
      chopping: true,
      mining: true,
      guarding: true,
      autopvp: true,
      autoeat: true,
      autosleep: true
    };

    // active target for !mod / !pvp
    let forcedTargetName = null;

    const createBot = () => {
      console.log('🔄 Starting Minecraft bot...');
      bot = mineflayer.createBot({
        host: cfg.host,
        port: cfg.port,
        username: cfg.username,
        version: cfg.version || false,
        auth: cfg.auth
      });

      bot.loadPlugin(pathfinder);
      bot.loadPlugin(collectBlock);
      bot.loadPlugin(toolPlugin);
      bot.loadPlugin(pvp);
      bot.loadPlugin(autoeat);

      bot.once('spawn', async () => {
        mcData = mcDataLoader(bot.version);
        movements = new Movements(bot, mcData);
        movements.canDig = true;
        movements.allow1by1towers = false;
        movements.allowFreeMotion = false;
        movements.canOpenDoors = true;
        movements.allowLadder = true;
        bot.pathfinder.setMovements(movements);

        bot.autoEat.options = { priority: 'saturation', startAt: 14, bannedFood: [] };

        logBoth(`Bot ter-spawn di ${bot.entity.position.floored().toString()}`);
        if (cfg.authPassword) {
          await sleep(4000 + rnd(0,2000));
          safeChat(`/login ${cfg.authPassword}`);
          await sleep(2000);
        }

        // initial brief delay so server doesn't flag
        await sleep(3000 + rnd(0,2000));

        // start autopilot loop
        autopilotLoop().catch(e=>console.error('autopilot error', e));
      });

      bot.on('chat', (username, message) => {
        if (!message || !message.startsWith('!')) return;
        if (username === bot.username) return;
        handleCommand(username, message.trim());
      });

      bot.on('kicked', async (reason) => {
        logBoth(`Dikick: ${reason.toString ? reason.toString() : reason}`);
        await appendLog(`KICK: ${reason}`);
        reconnectLater();
      });
      bot.on('end', () => {
        logBoth('Koneksi terputus, reconnect...');
        reconnectLater();
      });
      bot.on('error', (err) => {
        console.error('MC ERROR', err);
        reconnectLater();
      });

      bot.on('physicTick', () => {
        // defensive PvP: auto attack nearby dangerous mobs if autopvp on
        if (autoModes.autopvp) {
          const hostile = nearestHostile();
          if (hostile) {
            engageHostile(hostile).catch(()=>{});
          }
        }
      });

      bot.on('playerCollect', (collector, item) => {
        // ignore
      });

      // when attacked - auto shield + retreat.
      bot.on('entityHurt', async (entity) => {
        // if bot is damaged
        if (entity?.username === bot.username || entity?.uuid === bot.entity?.uuid) {
          // handled via onHealthCheck in autopilot
        }
      });

      // Auto equip best tools when item picked
      bot.on('inventoryUpdate', () => {
        // equip shield if exists on hotbar when being attacked handled elsewhere
      });
    };

    function reconnectLater(){
      try { bot.quit(); } catch {}
      setTimeout(()=>{ createBot(); }, 25000 + rnd(0,5000));
    }

    // ---------- Helpers ----------
    function safeChat(text){
      // small throttle: ensure not spamming
      try {
        if (!bot || !bot.chat) return;
        bot.chat(text);
      } catch(e) { console.error('safeChat failed', e); }
    }
    async function logBoth(text){
      const pref = `[LOG] ${text}`;
      try { safeChat(pref); } catch {}
      await appendLog(pref);
      // also send to discord if provided
      try {
        if (discordClient && typeof discordClient.channels !== 'undefined') {
          // user can change channel id or implement their own hook
          // -> here we won't automatically post to discord to avoid leaking token; user integrate if desired.
        }
      } catch(e){}
    }

    function distance(a,b){ return a.distanceTo ? a.distanceTo(b) : Math.sqrt((a.x-b.x)**2 + (a.y-b.y)**2 + (a.z-b.z)**2); }

    function nearestHostile(range=16){
      const hostiles = ['zombie','husk','drowned','skeleton','stray','creeper','spider','witch','phantom','enderman'];
      let closest = null; let d = Infinity;
      for (const id in bot.entities) {
        const e = bot.entities[id];
        if (!e || !e.name) continue;
        if (hostiles.includes(e.name)) {
          const dist = distance(bot.entity.position, e.position);
          if (dist < d) { d = dist; closest = e; }
        }
      }
      return (d <= range) ? closest : null;
    }

    async function tryEquipBestWeapon(){
      const swordOrder = ['netherite_sword','diamond_sword','iron_sword','stone_sword','wooden_sword'];
      for (const s of swordOrder) {
        const it = bot.inventory.items().find(i => i.name === s);
        if (it) {
          try { await bot.equip(it, 'hand'); } catch {}
          return;
        }
      }
    }

    async function tryEquipShield(){
      const shield = bot.inventory.items().find(i => i.name === 'shield');
      if (shield) try { await bot.equip(shield, 'off-hand'); } catch {}
    }

    function isTreeLog(block){
      if(!block) return false;
      if (!block.name.includes('log') && !block.name.includes('stem')) return false;
      // check above for leaves within 1-3 blocks up
      for (let dy=1; dy<=3; dy++){
        const b = bot.blockAt(block.position.offset(0,dy,0));
        if (b && (b.name.includes('leaves') || b.name.includes('leaf'))) return true;
      }
      return false;
    }

    function nearVillager(){
      for (const id in bot.entities){
        const e = bot.entities[id];
        if (!e || !e.name) continue;
        if (e.name === 'villager' && distance(bot.entity.position, e.position) < cfg.safeVillageRadius) return true;
      }
      return false;
    }

    // ---------- Actions / Tasks ----------
    async function collectBlockByName(name, max=16){
      // find block by item/block name
      const id = mcData.blocksByName[name]?.id || mcData.itemsByName[name]?.id;
      if(!id) return 0;
      let found = bot.findBlock({ matching: id, maxDistance: 64 });
      let cnt = 0;
      while (found && cnt < max) {
        try {
          await bot.tool.equipForBlock(found, { requireHarvest: true }).catch(()=>{});
          await bot.dig(found);
          cnt++;
          await sleep(rnd(200,600));
        } catch (e){ break; }
        found = bot.findBlock({ matching: id, maxDistance: 64 });
      }
      return cnt;
    }

    async function storeAllToChestNearby(){
      const chestBlock = bot.findBlock({ matching: b => b.name && b.name.includes('chest'), maxDistance: 8 });
      if (!chestBlock) {
        await logBoth('Storage: Chest tidak ditemukan di radius 8.');
        return false;
      }
      const chest = await bot.openChest(chestBlock);
      try {
        const items = bot.inventory.items();
        for (const it of items) {
          // skip tools & armor (heuristic: durability or name)
          if (it.name.includes('sword') || it.name.includes('pickaxe') || it.name.includes('shovel') || it.name.includes('axe') || it.name.includes('_helmet') || it.name.includes('_chestplate')) continue;
          try {
            await chest.deposit(it.type, null, it.count);
            await sleep(rnd(150,400));
          } catch(e){}
        }
        await logBoth('Storage: Menyimpan hasil ke chest terdekat.');
        return true;
      } finally {
        try { await chest.close(); } catch(e){}
      }
    }

    // Farming: find mature crops and harvest & replant if seed available
    async function doFarming(radius = 16){
      const crops = ['wheat','carrots','potatoes','beetroot'];
      let totalHarvest = {};
      for (const c of crops) totalHarvest[c] = 0;

      for (const c of crops){
        const blockIds = [];
        // find appropriate block ids: for wheat we look for fully grown farmland crop block id
        for (const name in mcData.blocksByName){
          if (name.includes(c) && !name.includes('stem')) {
            blockIds.push(mcData.blocksByName[name].id);
          }
        }
        const found = bot.findBlock({ matching: blockIds, maxDistance: radius });
        if (!found) continue;

        // collect many occurrences nearby
        let target = found;
        while (target) {
          // only harvest if mature: check block metadata via name includes 'ripe' detection is not reliable across versions.
          // We'll attempt to dig; if seeds dropped, replant if we have seed items
          try {
            await bot.dig(target);
            // count drops heuristically by scanning inventory (not exact)
            await sleep(rnd(200,500));
            totalHarvest[c] += 1;
            // attempt replant: check seeds
            const seedName = c === 'wheat' ? 'wheat_seeds' : c === 'beetroot' ? 'beetroot_seeds' : c === 'carrots' ? 'carrot' : 'potato';
            const seedItem = bot.inventory.items().find(i => i.name === seedName || i.name === c);
            if (seedItem) {
              // try to place seed on farmland under
              const below = bot.blockAt(target.position.offset(0,-1,0));
              try {
                await bot.placeBlock(below, new Vec3(0,1,0));
              } catch(e){}
            }
          } catch(e){ break; }
          // find next crop nearby
          target = bot.findBlock({ matching: blockIds, maxDistance: radius });
          await sleep(rnd(150,400));
        }
      }

      // log summary
      const summary = Object.entries(totalHarvest).filter(([k,v])=>v>0).map(([k,v])=>`${v} ${k}`).join(', ');
      if (summary) {
        await logBoth(`Farming: Panen ${summary}`);
        // try to store if chest nearby
        await storeAllToChestNearby();
      }
    }

    // Chop: find tree logs that are tree (not house) and chop
    async function doChop(radius = 32, targetLogs = 8){
      const logIds = [];
      for (const name in mcData.blocksByName) if (name.endsWith('_log') || name.endsWith('_stem')) logIds.push(mcData.blocksByName[name].id);
      let found = bot.findBlock({ matching: logIds, maxDistance: radius });
      let chopped = 0;
      while (found && chopped < targetLogs) {
        if (!isTreeLog(found)) {
          // skip (likely house post)
          found = bot.findBlock({ matching: logIds, maxDistance: radius });
          continue;
        }
        try {
          await bot.tool.equipForBlock(found, { requireHarvest: true }).catch(()=>{});
          await bot.dig(found);
          chopped++;
          await sleep(rnd(300,900));
        } catch(e) { break; }
        found = bot.findBlock({ matching: logIds, maxDistance: radius });
      }
      if (chopped > 0) await logBoth(`Chop: Menebang pohon ${chopped} logs`);
      // try to plant sapling if available
      const sapling = bot.inventory.items().find(i => i.name.includes('sapling'));
      if (sapling) {
        // attempt to plant near base
        const base = bot.entity.position.floored();
        for (let dx=-2; dx<=2; dx++){
          for (let dz=-2; dz<=2; dz++){
            const pos = base.offset(dx, -1, dz);
            const ground = bot.blockAt(pos);
            if (ground && (ground.name.includes('dirt')||ground.name.includes('grass'))){
              try {
                await bot.equip(sapling, 'hand');
                await bot.placeBlock(ground, new Vec3(0,1,0));
                await sleep(200);
                throw 'planted'; // break loops (quick hack)
              } catch(e){}
            }
          }
        }
      }
      // after chopping try store
      await storeAllToChestNearby();
    }

    // Mining: naive surface ore mining + follow player mining (assist)
    async function doMining(radius = 48){
      // look for ores
      const ores = ['coal_ore','iron_ore','gold_ore','redstone_ore','lapis_ore','diamond_ore','emerald_ore'];
      const foundList = [];
      for (const o of ores){
        const bid = mcData.blocksByName[o]?.id;
        if (!bid) continue;
        const f = bot.findBlock({ matching: bid, maxDistance: radius });
        if (f) foundList.push(f);
      }
      let mined = {diamond:0, iron:0, coal:0};
      for (const b of foundList){
        try {
          await bot.pathfinder.goto(new GoalNear(b.position.x, b.position.y, b.position.z, 1));
          await bot.tool.equipForBlock(b, { requireHarvest: true }).catch(()=>{});
          await bot.dig(b);
          await sleep(rnd(200,600));
        } catch(e){}
      }
      await logBoth('Mining: Selesai scanning area.');
      // store
      await storeAllToChestNearby();
    }

    // Guard villagers: patrol and kill zombies
    async function guardVillagers(){
      // find nearest villager & walk around
      let v = null;
      for (const id in bot.entities){
        const e = bot.entities[id];
        if (e && e.name === 'villager' && e.position) { v = e; break; }
      }
      if (!v) return;
      await logBoth('Guard: Villager ditemukan, memulai patroli.');
      // patrol loop briefly
      for (let i=0;i<6;i++){
        if (!bot.entity) break;
        const targetPos = v.position.offset(Math.floor((Math.random()-0.5)*6), 0, Math.floor((Math.random()-0.5)*6));
        try {
          await bot.pathfinder.goto(new GoalNear(targetPos.x, targetPos.y, targetPos.z, 1));
        } catch(e){}
        // scan for zombie
        const hostile = nearestHostile(12);
        if (hostile) {
          await engageHostile(hostile);
        }
      }
    }

    // Engage hostile entity: try equip weapon, shield, attack; retreat if low HP
    async function engageHostile(entity){
      if (!entity || !bot.entity) return;
      // if forcedTargetName set, filter others
      if (forcedTargetName && entity.name !== forcedTargetName) return;
      try {
        // equip best weapon
        await tryEquipBestWeapon();
        await tryEquipShield();
        // chase and attack
        await bot.pathfinder.setGoal(new GoalNear(entity.position.x, entity.position.y, entity.position.z, 2));
        await sleep(500);
        // attack loop short
        try { bot.pvp.attack(entity); } catch(e){}
        await sleep(600);
        // retreat if low HP
        if (bot.health && bot.health < 6) {
          await logBoth(`Survival: Mundur, HP rendah (${Math.round(bot.health)}/20)`);
          // move back toward home or random safe direction
          const safe = bot.entity.position.offset(-Math.sign(Math.random()-0.5)*6, 0, -Math.sign(Math.random()-0.5)*6);
          try { await bot.pathfinder.goto(new GoalNear(safe.x, safe.y, safe.z, 2)); } catch(e){}
        } else {
          // small cooldown
          await sleep(rnd(300,900));
        }
      } catch(e){
        console.error('engageHostile err', e);
      }
    }

    // Explore routine (spiral-ish)
    async function startExplore(radius = cfg.exploreRadius){
      if (exploring) return;
      exploring = true;
      await logBoth('Explore: Memulai eksplorasi...');
      const origin = bot.entity.position.floored();
      const step = 30;
      let ring = 1;
      while (exploring){
        for (let dx = -ring*step; dx <= ring*step; dx += step){
          if (!exploring) break;
          const target = origin.offset(dx, 0, -ring*step);
          await gotoAndScan(target);
        }
        for (let dz = -ring*step; dz <= ring*step; dz += step){
          if (!exploring) break;
          const target = origin.offset(ring*step, 0, dz);
          await gotoAndScan(target);
        }
        for (let dx = ring*step; dx >= -ring*step; dx -= step){
          if (!exploring) break;
          const target = origin.offset(dx, 0, ring*step);
          await gotoAndScan(target);
        }
        for (let dz = ring*step; dz >= -ring*step; dz -= step){
          if (!exploring) break;
          const target = origin.offset(-ring*step, 0, dz);
          await gotoAndScan(target);
        }
        ring++;
        if (ring * step > radius) break;
      }
      exploring = false;
      await logBoth('Explore: Selesai/berhenti.');
    }

    async function gotoAndScan(vec3){
      // goto x,z while staying near ground
      try {
        await bot.pathfinder.goto(new GoalNear(vec3.x, vec3.y, vec3.z, 3), { timeout: 120000 });
      } catch(e){}
      await sleep(300 + rnd(0,500));
      // detect biome & structures
      try {
        const pos = bot.entity.position.floored();
        // biome detection using world.getBiome (may need client seed access)
        try {
          const biome = bot.world.getBiome(pos.x, pos.y, pos.z);
          if (biome && biome.name) {
            await logBoth(`Biome ditemukan: ${biome.name} (X:${pos.x} Y:${pos.y} Z:${pos.z})`);
          }
        } catch(e){}
        // structure heuristics
        const nearby = bot.findBlocks({matching: block=> {
          const name = block.name || '';
          const checks = ['rail','cobweb','oak_log','planks','purpur','end_portal','prismarine','chest','hopper'];
          return checks.some(k=> name.includes(k));
        }, maxDistance: 48, count: 5});
        if (nearby && nearby.length > 0) {
          await logBoth(`Struktur terindikasi di sekitar (X:${pos.x} Z:${pos.z})`);
        }
      } catch(e){}
    }

    // Sleep when night and there is bed nearby
    async function trySleepIfNight(){
      try {
        const time = bot.time;
        // In Minecraft, day time values: 0 -> dawn. night when time > 13000
        if (time && time.age && (bot.time.dayTime > 13000 || bot.time.dayTime < 2300)) {
          const bed = bot.findBlock({ matching: b => b.name && b.name.includes('bed'), maxDistance: 16 });
        
