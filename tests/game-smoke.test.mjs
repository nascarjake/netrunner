import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';

function createGame() {
    const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
    const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
    assert.ok(script, 'game script is present');
    const htmlIds = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]));

    const nodes = new Map();
    const storage = new Map();
    const graphics = new Proxy({}, {
        get: (_, property) => property === 'createLinearGradient' || property === 'createRadialGradient'
            ? () => ({ addColorStop() {} }) : () => {}
    });
    function node(id = '') {
        if (nodes.has(id)) return nodes.get(id);
        const value = {
            id,
            style: {},
            classList: { add() {}, remove() {}, toggle() {} },
            children: [],
            clientWidth: 1100,
            clientHeight: 680,
            innerHTML: '',
            textContent: '',
            innerText: '',
            append(...children) { this.children.push(...children); },
            replaceChildren(...children) { this.children = children; },
            addEventListener() {},
            getContext() { return graphics; }
        };
        nodes.set(id, value);
        return value;
    }
    const context = vm.createContext({
        document: {
            getElementById(id) { assert.ok(htmlIds.has(id), `missing HTML element #${id}`); return node(id); },
            createElement: () => node(`created-${nodes.size}`)
        },
        window: { addEventListener() {}, AudioContext: class {} },
        localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) },
        requestAnimationFrame() {}, setTimeout() {}, clearTimeout() {}, console
    });
    vm.runInContext(script, context, { filename: 'index.html' });
    vm.runInContext('audio.soundEnabled = false', context);
    return { run: source => vm.runInContext(source, context), nodes, storage };
}

test('story decisions unlock equipment and pause the wave clock', () => {
    const game = createGame();
    game.run('startGame()');
    assert.equal(game.run('missionPending'), true);
    assert.equal(game.nodes.get('story-choices').children.length, 2);
    game.run('runWaveEngine()');
    assert.equal(game.run('waveTimer'), 0);
    game.run("chooseStory('trace')");
    assert.equal(game.run('career.intel'), 2);
    assert.equal(game.run('isBladeUnlocked(\'inspector\')'), true);
    assert.equal(game.run('tutorialActive'), true);
    game.run('runWaveEngine()');
    assert.equal(game.run('waveTimer'), 0);
    game.run('skipTutorial()');
    game.run('runWaveEngine()');
    assert.ok(game.run('waveTimer') > 0);
    game.run("currentWave = 3; openMissionForWave(); chooseStory('inspect'); buyBlade('inspector')");
    assert.equal(game.run("modules.filter(m => m.type === 'inspector').length"), 1);
});

test('inspector reveals ghost payloads and quarantine needs manual purge', () => {
    const game = createGame();
    game.run("startGame(); chooseStory('fortify'); currentWave = 5; credits = 2000; buyBlade('inspector'); buyBlade('quarantine')");
    game.run(`
        const wan = modules.find(m => m.type === 'wan_gateway');
        const inspector = modules.find(m => m.type === 'inspector');
        const quarantine = modules.find(m => m.type === 'quarantine');
        const inCable = new PatchCable('test-in', wan.ports[0], inspector.ports[0], '#3b82f6');
        const outCable = new PatchCable('test-out', inspector.ports[2], quarantine.ports[0], '#3b82f6');
        inspector.ports[2].connectedCable = outCable;
        new Packet(inCable, 'ghost').processDestinationArrival();
    `);
    assert.equal(game.run('packets[0].type'), 'malware');
    game.run('packets[0].processDestinationArrival()');
    assert.equal(game.run('quarantine.quarantineLoad'), 1);
    game.run('purgeQuarantine()');
    assert.equal(game.run('quarantine.quarantineLoad'), 0);
    assert.equal(game.run('nitrogenPower'), 80);
});

test('boss warning, story resolution, and endless contract handoff', () => {
    const game = createGame();
    game.run("startGame(); chooseStory('fortify'); currentWave = 5; waveTimer = 9; eventTriggeredThisWave = false; maybeStartChaosEvent()");
    assert.equal(game.run('pendingEvent'), 'blackIceStorm');
    game.run('for (let i = 0; i < 190; i++) updatePendingEvent()');
    assert.equal(game.run('activeEvent.id'), 'blackIceStorm');
    game.run(`
        clearChaosEvent();
        currentWave = 7;
        wavePhase = 'prep';
        openMissionForWave();
        chooseStory('seal');
        wavePhase = 'active';
        activeDirective = { target: 1, getValue: () => 1 };
        advanceWavePhase();
    `);
    assert.equal(game.run('career.campaignCleared'), true);
    assert.equal(game.run('waveBuffPending'), true);
    game.run("chooseWaveBuff('coolant'); advanceWavePhase()");
    assert.equal(game.run('currentWave'), 8);
    assert.equal(game.run('missionPending'), true);
    assert.equal(game.nodes.get('story-choices').children.length, 3);
    game.run("chooseContract('siege')");
    assert.equal(game.run('contract.spawn'), 1.3);
    assert.equal(game.run('missionPending'), false);
    game.run("selectTopology('veteran'); startGame()");
    assert.equal(game.run('credits'), 300);
    assert.equal(game.run("modules.filter(m => m.type === 'inspector').length"), 1);
});

test('repair and armor trade budget for survivability', () => {
    const game = createGame();
    game.run("startGame(); chooseStory('fortify'); systemIntegrity = 60; buyRepair()");
    assert.equal(game.run('systemIntegrity'), 75);
    assert.equal(game.run('repairCost'), 240);
    game.run("credits = 1000; buyUpgrade('coreArmor')");
    assert.equal(game.run('upgrades.coreArmor.level'), 2);
});

test('rack renderer runs with a story briefing and live traffic', () => {
    const game = createGame();
    game.run("startGame(); window.onload(); chooseStory('fortify'); advanceWavePhase(); window.onload()");
    assert.equal(game.run('wavePhase'), 'active');
});

test('endless directives remain achievable at high wave numbers', () => {
    const game = createGame();
    game.run("startGame(); chooseStory('fortify'); currentWave = 101; startWaveDirective()");
    assert.equal(game.run('activeDirective.target'), 14);
    game.run('currentWave = 102; startWaveDirective()');
    assert.equal(game.run('activeDirective.target'), 12);
});

test('story drill teaches a safe route, filtering, cooling, and diagnostics', () => {
    const game = createGame();
    game.run("startGame(); chooseStory('fortify')");
    assert.equal(game.run('tutorialStage'), 'wan');
    game.run(`
        const source = modules.find(m => m.type === 'wan_gateway');
        const filter = modules.find(m => m.type === 'firewall');
        const core = modules.find(m => m.type === 'mainframe_db');
        const intake = new PatchCable('drill-intake', source.ports[0], filter.ports[0], '#3b82f6');
        const exit = new PatchCable('drill-exit', filter.ports[2], core.ports[0], '#3b82f6');
        connections.push(intake, exit);
        source.ports[0].connectedCable = intake;
        filter.ports[0].connectedCable = intake;
        filter.ports[2].connectedCable = exit;
        core.ports[0].connectedCable = exit;
        refreshTutorial();
    `);
    assert.equal(game.run('tutorialStage'), 'good');
    game.run('tutorialAction(); for (let i = 0; i < 220; i++) window.onload()');
    assert.equal(game.run('tutorialStage'), 'bad');
    game.run('tutorialAction(); for (let i = 0; i < 220; i++) window.onload()');
    assert.equal(game.run('tutorialStage'), 'vent');
    game.run('triggerNitrogenBlast()');
    assert.equal(game.run('tutorialStage'), 'lens');
    game.run("activateAbility('diagnosticLens')");
    assert.equal(game.run('tutorialStage'), 'upgrade');
    game.run("buyUpgrade('cableBandwidth')");
    assert.equal(game.run('tutorialActive'), false);
    assert.equal(game.run('career.tutorialComplete'), true);
});

test('empty suite drill asks for a firewall before teaching cables', () => {
    const game = createGame();
    game.run("selectTopology('empty'); startGame(); chooseStory('fortify')");
    assert.equal(game.run('tutorialStage'), 'install');
    game.run("buyBlade('firewall'); refreshTutorial()");
    assert.equal(game.run('tutorialStage'), 'wan');
});

test('story mode changes the risk profile and field assignments reward active tools', () => {
    const game = createGame();
    game.run("startGame(); chooseStory('fortify'); skipTutorial(); currentWave = 2; openMissionForWave(); chooseStory('guardMode')");
    assert.equal(game.run('operationMode'), 'guard');
    assert.ok(game.run('getFirewallSpeedStep()') > 0.015);
    game.run('advanceWavePhase()');
    assert.equal(game.run('fieldObjective.title'), 'USE A PANIC TOOL');
    game.run("activateAbility('diagnosticLens')");
    assert.equal(game.run('fieldObjective.getValue()'), 1);
    game.run("setOperationMode('greed')");
    assert.equal(game.run('operationMode'), 'guard');
    game.run("const beforeReward = credits; activeDirective = { target: 1, getValue: () => 1 }; advanceWavePhase()");
    assert.ok(game.run('credits - beforeReward') >= 110);
    game.run("setOperationMode('greed')");
    assert.equal(game.run('operationMode'), 'greed');
});

test('only physical routing changes reduce the visible enemy trace', () => {
    const game = createGame();
    game.run("startGame(); chooseStory('fortify'); skipTutorial(); currentWave = 4; wavePhase = 'active'; tracePressure = 80; recordManualAction()");
    assert.equal(game.run('tracePressure'), 80);
    game.run("recordManualAction('route')");
    assert.equal(game.run('tracePressure'), 52);
    assert.equal(game.run('manualOpsThisWave'), 1);
});

test('the first ghost is scripted and advances the Inspector lesson', () => {
    const game = createGame();
    game.run(`
        startGame(); chooseStory('fortify'); skipTutorial();
        currentWave = 3; openMissionForWave(); chooseStory('inspect');
        credits = 2000; buyBlade('inspector');
        const gateway = modules.find(m => m.type === 'wan_gateway');
        const inspector = modules.find(m => m.type === 'inspector');
        const line = new PatchCable('lesson-line', gateway.ports[0], inspector.ports[0], '#3b82f6');
        connections.push(line);
        gateway.ports[0].connectedCable = line;
        inspector.ports[0].connectedCable = line;
        advanceWavePhase(); waveTimer = 12; runWaveEngine();
    `);
    assert.equal(game.run('scriptedThreatTriggered'), true);
    assert.equal(game.run('packets[0].type'), 'ghost');
    game.run('packets[0].processDestinationArrival()');
    assert.equal(game.run('fieldObjective.getValue()'), 1);
});
