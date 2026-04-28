import * as THREE from 'three';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ============================================================
// VP User Study — app.js v2.1 (Restore 3D Viewers)
// ============================================================

// ── Utility ──────────────────────────────────────────────────
function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function genId() {
    return 'P_' + Math.random().toString(36).slice(2, 8).toUpperCase();
}

function nowIso() { return new Date().toISOString(); }

// ── Study Configuration ───────────────────────────────────────
// Each structure has: id, stl, vpValue (ground truth, not shown to user)
const BLOCK1_TASKS_RAW = [
    {
        id: 'B1_G1',
        structures: [
            { id: 'thres015', vpValue: 0.761, stl: 'models/namaqualand_50101030_thres0.15_0.761_43.6_pct.stl' },
            { id: 'thres025', vpValue: 0.839, stl: 'models/namaqualand_50101030_thres0.25_0.839_54.4_pct.stl' },
            { id: 'thres045', vpValue: 0.854, stl: 'models/namaqualand_50101030_thres0.45_0.854_60.8_pct.stl' }
        ]
    },
    {
        id: 'B1_G2',
        structures: [
            { id: 'thres025b', vpValue: 0.839, stl: 'models/namaqualand_50101030_thres0.25_0.839_54.4_pct.stl' },
            { id: 'thres045b', vpValue: 0.854, stl: 'models/namaqualand_50101030_thres0.45_0.854_60.8_pct.stl' },
            { id: 'thres055', vpValue: 0.854, stl: 'models/namaqualand_50101030_thres0.55_0.854_61.2_pct.stl' }
        ]
    },
    {
        id: 'B1_G3',
        structures: [
            { id: 'model_44131330', vpValue: 0.835, stl: 'models/namaqualand_44131330_0.835_0.0_pct.stl' },
            { id: 'model_50101030', vpValue: 0.862, stl: 'models/namaqualand_50101030_default_58.2_pct.stl' },
            { id: 'model_53051131', vpValue: 0.882, stl: 'models/namaqualand_53051131_0.882_58.3_pct.stl' }
        ]
    }
];

const BLOCK2_TASKS_RAW = [
    {
        id: 'B2_P1',
        structureA: { id: 'thres015_fab', vpValue: 0.761, stl: 'models/namaqualand_50101030_thres0.15_0.761_43.6_pct.stl' },
        structureB: { id: 'thres055_fab', vpValue: 0.854, stl: 'models/namaqualand_50101030_thres0.55_0.854_61.2_pct.stl' }
    },
    {
        id: 'B2_P2',
        structureA: { id: 'model_44131330_fab', vpValue: 0.835, stl: 'models/namaqualand_44131330_0.835_0.0_pct.stl' },
        structureB: { id: 'model_44092027_fab', vpValue: 0.862, stl: 'models/namaqualand_44092027_0.862_58.3_pct.stl' }
    },
    {
        id: 'B2_P3',
        structureA: { id: 'model_45111133_fab', vpValue: 0.847, stl: 'models/namaqualand_45111133_0.847_0.0_pct.stl' },
        structureB: { id: 'model_44200927_fab', vpValue: 0.794, stl: 'models/namaqualand_44200927_0.794_58.6_pct.stl' }
    }
];

// ── Application State ─────────────────────────────────────────
const state = {
    participantId: '',
    demographics: {},
    block1Tasks: [],
    block2Tasks: [],
    block1Results: [],
    block2Results: [],
    currentBlock1Index: 0,
    currentBlock2Index: 0,
    taskStartTime: null,
    sessionStart: nowIso(),

    // 3D Viewers
    viewers: [], // active viewer instances
    isAutoRotating: true,
    isSyncRotation: true,
    _syncLock: false,

    // Ranking interaction state
    ranking: { 1: null, 2: null, 3: null },
    draggedCardId: null,
    displayedStructures: [],

    // Pairwise interaction state
    pairDisplayOrder: null,
    pairAnswers: { q1: null, q2: null }
};

const INIT_CAM = { x: 2, y: 0.5, z: 2 };
const AUTO_ROTATE_SPEED = 3;

// ── 3D Viewer Logic ───────────────────────────────────────────
function createViewer(container) {
    while (container.firstChild) container.removeChild(container.firstChild);
    const width = container.clientWidth || 300;
    const height = container.clientHeight || 300;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfcfcfc);
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.autoRotate = state.isAutoRotating;
    controls.autoRotateSpeed = AUTO_ROTATE_SPEED;
    controls.enableDamping = false; // Disable damping to prevent it from fighting mirrored positions

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x888888, 1.5);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    dirLight.position.set(5, 10, 7);
    dirLight.castShadow = true;
    scene.add(dirLight);

    let animId;
    function animate() {
        animId = requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();

    const onResize = () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', onResize);

    // Track whether the user is manually interacting (mouse drag / touch)
    let userInteracting = false;

    const instance = {
        scene, camera, controls, renderer,
        get userInteracting() { return userInteracting; },
        dispose() {
            cancelAnimationFrame(animId);
            window.removeEventListener('resize', onResize);
            controls.dispose();
            renderer.dispose();
        }
    };

    // Only mirror on manual user interaction, NOT during auto-rotation.
    // This is the key fix: auto-rotation fires 'change' every frame, and
    // mirroring on every frame caused controls.update() damping on destination
    // viewers to fight the copied position, halving the apparent speed.
    controls.addEventListener('start', () => { userInteracting = true; });
    controls.addEventListener('end', () => { userInteracting = false; });
    controls.addEventListener('change', () => {
        if (userInteracting) {
            mirrorCamera(instance);
        }
    });

    return instance;
}

function loadSTL(viewer, url) {
    return new Promise((resolve, reject) => {
        const loader = new STLLoader();
        loader.load(url, (geometry) => {
            geometry.rotateX(-Math.PI / 2);
            geometry.computeBoundingBox();
            const box = geometry.boundingBox;
            const center = new THREE.Vector3();
            box.getCenter(center);
            geometry.translate(-center.x, -center.y, -center.z);

            const maxDim = Math.max(box.getSize(new THREE.Vector3()).x, box.getSize(new THREE.Vector3()).y, box.getSize(new THREE.Vector3()).z);
            const scale = 2.0 / maxDim;
            geometry.scale(scale, scale, scale);

            const material = new THREE.MeshStandardMaterial({ color: 0xbdbdbd, roughness: 0.9, metalness: 0.0 });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = true;
            viewer.scene.add(mesh);

            viewer.camera.position.set(INIT_CAM.x, INIT_CAM.y, INIT_CAM.z);
            viewer.controls.target.set(0, 0, 0);
            viewer.controls.update();
            resolve(mesh);
        }, undefined, reject);
    });
}

function mirrorCamera(src) {
    if (state._syncLock || !state.isSyncRotation) return;
    state._syncLock = true;
    state.viewers.forEach(dst => {
        if (dst === src) return;
        dst.camera.position.copy(src.camera.position);
        dst.controls.target.copy(src.controls.target);
    });
    state._syncLock = false;
}

function resetViews() {
    state.viewers.forEach(v => {
        v.camera.position.set(INIT_CAM.x, INIT_CAM.y, INIT_CAM.z);
        v.controls.target.set(0, 0, 0);
        v.controls.update();
    });
}

function toggleRotation() {
    state.isAutoRotating = !state.isAutoRotating;
    // All viewers always auto-rotate at the same speed — they stay
    // visually in sync because they share the same speed & start position.
    state.viewers.forEach(v => {
        v.controls.autoRotate = state.isAutoRotating;
        v.controls.autoRotateSpeed = AUTO_ROTATE_SPEED;
    });
    updateControlButtons();
}

function toggleSync() {
    state.isSyncRotation = !state.isSyncRotation;
    if (state.isSyncRotation && state.viewers.length > 1) {
        // Snap all viewers to the lead viewer's current camera position
        const lead = state.viewers[0];
        state.viewers.forEach((v, i) => {
            if (i === 0) return;
            v.camera.position.copy(lead.camera.position);
            v.controls.target.copy(lead.controls.target);
        });
    }
    updateControlButtons();
}

function updateControlButtons() {
    document.querySelectorAll('.ctrl-btn[data-action="pause"]').forEach(btn => {
        btn.classList.toggle('active', !state.isAutoRotating);
        btn.innerHTML = state.isAutoRotating ? '⏸ Pause Rotation' : '▶ Resume Rotation';
    });
    document.querySelectorAll('.ctrl-btn[data-action="sync"]').forEach(btn => {
        btn.classList.toggle('active', state.isSyncRotation);
    });
}

function setupControls() {
    document.querySelectorAll('.ctrl-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            if (action === 'reset') resetViews();
            if (action === 'pause') toggleRotation();
            if (action === 'sync') toggleSync();
        });
    });
    updateControlButtons();
}

// ── Screen Management ─────────────────────────────────────────
const SCREENS = [
    'screen-welcome', 'screen-demographics',
    'screen-block1-intro', 'screen-ranking',
    'screen-block2-intro', 'screen-pairwise',
    'screen-completion'
];

function showScreen(id) {
    SCREENS.forEach(sid => {
        const el = document.getElementById(sid);
        if (el) el.classList.toggle('active', sid === id);
    });
    updateProgress(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateProgress(screenId) {
    const fill = document.getElementById('progress-fill');
    const label = document.getElementById('progress-label');
    const totalB1 = state.block1Tasks.length;
    const totalB2 = state.block2Tasks.length;
    const total = 2 + totalB1 + totalB2;

    let step = 0;
    let labelText = 'Welcome';

    switch (screenId) {
        case 'screen-welcome': step = 0; labelText = 'Welcome'; break;
        case 'screen-demographics': step = 1; labelText = 'Participant Info'; break;
        case 'screen-block1-intro': step = 2; labelText = 'Block 1: Instructions'; break;
        case 'screen-ranking': {
            step = 2 + state.currentBlock1Index + 1;
            labelText = `Block 1 · ${state.currentBlock1Index + 1} / ${totalB1}`;
            break;
        }
        case 'screen-block2-intro': step = 2 + totalB1 + 1; labelText = 'Block 2: Instructions'; break;
        case 'screen-pairwise': {
            step = 2 + totalB1 + 1 + state.currentBlock2Index + 1;
            labelText = `Block 2 · ${state.currentBlock2Index + 1} / ${totalB2}`;
            break;
        }
        case 'screen-completion': step = total + 2; labelText = 'Complete ✓'; break;
    }

    const pct = Math.min(100, Math.round((step / (total + 2)) * 100));
    if (fill) fill.style.width = pct + '%';
    if (label) label.textContent = labelText;
}

// ── Welcome Screen ────────────────────────────────────────────
document.getElementById('btn-welcome-start').addEventListener('click', () => {
    showScreen('screen-demographics');
});

// ── Demographics Screen ───────────────────────────────────────
document.getElementById('btn-gen-pid').addEventListener('click', () => {
    document.getElementById('input-pid').value = genId();
});

document.getElementById('btn-demo-next').addEventListener('click', () => {
    const pid = document.getElementById('input-pid').value.trim();
    if (!pid) document.getElementById('input-pid').value = genId();
    state.participantId = document.getElementById('input-pid').value.trim();
    const genderEl = document.querySelector('input[name="gender"]:checked');
    state.demographics = {
        ageRange: document.getElementById('select-age').value,
        gender: genderEl ? genderEl.value : 'not_provided',
        experience: document.getElementById('select-exp').value
    };
    state.block1Tasks = shuffle(BLOCK1_TASKS_RAW).map(task => ({
        ...task,
        structures: shuffle(task.structures)
    }));
    state.block2Tasks = shuffle(BLOCK2_TASKS_RAW).map(task => {
        if (Math.random() < 0.5) {
            return { ...task, structureA: task.structureB, structureB: task.structureA, _flipped: true };
        }
        return { ...task, _flipped: false };
    });
    showScreen('screen-block1-intro');
});

// ── Block 1 Intro ─────────────────────────────────────────────
document.getElementById('btn-block1-start').addEventListener('click', () => {
    state.currentBlock1Index = 0;
    loadRankingTask();
    showScreen('screen-ranking');
    setupControls();
});

// ── Ranking Task ──────────────────────────────────────────────
async function loadRankingTask() {
    state.taskStartTime = nowIso();
    const task = state.block1Tasks[state.currentBlock1Index];
    const total = state.block1Tasks.length;

    state.displayedStructures = task.structures.map((s, i) => ({
        ...s,
        displayLabel: ['A', 'B', 'C'][i]
    }));

    state.ranking = { 1: null, 2: null, 3: null };
    document.getElementById('ranking-meta').textContent = `Block 1 · Task ${state.currentBlock1Index + 1} / ${total}`;

    // Cleanup viewers
    state.viewers.forEach(v => v.dispose());
    state.viewers = [];

    const row = document.getElementById('candidates-row');
    row.innerHTML = '';

    for (const s of state.displayedStructures) {
        const card = buildStructureCard(s, true);
        card.dataset.structureId = s.id;
        card.dataset.displayLabel = s.displayLabel;
        card.id = 'card-' + s.id;
        row.appendChild(card);

        const viewer = createViewer(card.querySelector('.viewer-container'));
        state.viewers.push(viewer);
        await loadSTL(viewer, s.stl);
    }

    [1, 2, 3].forEach(r => {
        const dz = document.getElementById('drop-' + r);
        dz.innerHTML = '';
        document.getElementById('slot-' + r).classList.remove('filled');
    });

    document.getElementById('btn-ranking-submit').disabled = true;
    document.getElementById('ranking-validation').textContent = 'Please assign all three positions to continue.';

    setupDragDrop();
    setupRankButtons();
}
function buildStructureCard(s, draggable) {
    const card = document.createElement('div');
    card.className = 'structure-card';

    const viewerCont = document.createElement('div');
    viewerCont.className = 'viewer-container';
    card.appendChild(viewerCont);

    const labelEl = document.createElement('div');
    labelEl.className = 'structure-label';
    if (draggable) {
        labelEl.draggable = true;
        labelEl.classList.add('drag-handle');
    }
    labelEl.textContent = `Structure ${s.displayLabel}`;
    card.appendChild(labelEl);

    if (draggable) {
        const rankBtns = document.createElement('div');
        rankBtns.className = 'rank-btn-group';
        [1, 2, 3].forEach(r => {
            const btn = document.createElement('button');
            btn.className = 'rank-btn';
            btn.textContent = r === 1 ? '1st' : r === 2 ? '2nd' : '3rd';
            btn.dataset.rank = r;
            btn.dataset.structureId = s.id;
            btn.dataset.displayLabel = s.displayLabel;
            rankBtns.appendChild(btn);
        });
        card.appendChild(rankBtns);
    }

    return card;
}

function setupRankButtons() {
    document.querySelectorAll('.rank-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            placeInSlot(parseInt(btn.dataset.rank), btn.dataset.structureId, btn.dataset.displayLabel);
        });
    });
}

function placeInSlot(rank, structureId, displayLabel) {
    [1, 2, 3].forEach(r => {
        if (state.ranking[r] === structureId) {
            state.ranking[r] = null;
            document.getElementById('drop-' + r).innerHTML = '';
            document.getElementById('slot-' + r).classList.remove('filled');
        }
    });

    if (state.ranking[rank] && state.ranking[rank] !== structureId) {
        const evicted = state.ranking[rank];
        state.ranking[rank] = null;
        document.getElementById('drop-' + rank).innerHTML = '';
        document.getElementById('slot-' + rank).classList.remove('filled');
        const evictedCard = document.getElementById('card-' + evicted);
        if (evictedCard) evictedCard.style.opacity = '1';
    }

    state.ranking[rank] = structureId;
    const slot = document.getElementById('slot-' + rank);
    const dz = document.getElementById('drop-' + rank);

    dz.innerHTML = '';
    const mini = document.createElement('div');
    mini.className = 'slot-mini-card';
    mini.textContent = `Structure ${displayLabel}`;
    const clearBtn = document.createElement('button');
    clearBtn.className = 'slot-clear-btn';
    clearBtn.textContent = '✕';
    clearBtn.addEventListener('click', () => {
        state.ranking[rank] = null;
        dz.innerHTML = '';
        slot.classList.remove('filled');
        const card = document.getElementById('card-' + structureId);
        if (card) card.style.opacity = '1';
        checkRankingComplete();
    });
    mini.appendChild(clearBtn);
    dz.appendChild(mini);
    slot.classList.add('filled');

    const card = document.getElementById('card-' + structureId);
    if (card) card.style.opacity = '0.4';

    checkRankingComplete();
}

function checkRankingComplete() {
    const allFilled = [1, 2, 3].every(r => state.ranking[r] !== null);
    document.getElementById('btn-ranking-submit').disabled = !allFilled;
    document.getElementById('ranking-validation').textContent = allFilled ? 'All positions assigned. Click Submit.' : 'Please assign all three positions.';
}

function setupDragDrop() {
    document.querySelectorAll('.structure-label.drag-handle').forEach(handle => {
        const card = handle.closest('.structure-card');
        handle.addEventListener('dragstart', e => {
            state.draggedCardId = card.dataset.structureId;
            card.classList.add('dragging');
        });
        handle.addEventListener('dragend', () => card.classList.remove('dragging'));
    });

    [1, 2, 3].forEach(rank => {
        const dz = document.getElementById('drop-' + rank);
        dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('drag-over'); });
        dz.addEventListener('dragleave', () => dz.classList.remove('drag-over'));
        dz.addEventListener('drop', e => {
            e.preventDefault();
            dz.classList.remove('drag-over');
            if (!state.draggedCardId) return;
            const card = document.getElementById('card-' + state.draggedCardId);
            placeInSlot(rank, state.draggedCardId, card ? card.dataset.displayLabel : '?');
            state.draggedCardId = null;
        });
    });
}

document.getElementById('btn-ranking-submit').addEventListener('click', () => {
    const submitTime = nowIso();
    state.block1Results.push({
        taskId: state.block1Tasks[state.currentBlock1Index].id,
        displayOrder: state.displayedStructures.map(s => ({ displayLabel: s.displayLabel, structureId: s.id, vpValue: s.vpValue })),
        ranking: [1, 2, 3].map(r => state.ranking[r]),
        startTime: state.taskStartTime,
        submitTime,
        responseTimeMs: new Date(submitTime) - new Date(state.taskStartTime)
    });
    state.currentBlock1Index++;
    if (state.currentBlock1Index < state.block1Tasks.length) loadRankingTask();
    else showScreen('screen-block2-intro');
});

// ── Block 2 Intro ─────────────────────────────────────────────
document.getElementById('btn-block2-start').addEventListener('click', () => {
    state.currentBlock2Index = 0;
    loadPairwiseTask();
    showScreen('screen-pairwise');
    setupControls();
});

// ── Pairwise Task ─────────────────────────────────────────────
async function loadPairwiseTask() {
    state.taskStartTime = nowIso();
    const task = state.block2Tasks[state.currentBlock2Index];
    state.pairDisplayOrder = {
        A: { ...task.structureA, displayLabel: 'A' },
        B: { ...task.structureB, displayLabel: 'B' }
    };
    state.pairAnswers = { q1: null, q2: null };
    document.getElementById('pairwise-meta').textContent = `Block 2 · Task ${state.currentBlock2Index + 1} / ${state.block2Tasks.length}`;

    state.viewers.forEach(v => v.dispose());
    state.viewers = [];

    const row = document.getElementById('pair-row');
    row.innerHTML = '';
    for (const key of ['A', 'B']) {
        const s = state.pairDisplayOrder[key];
        const card = buildStructureCard(s, false);
        row.appendChild(card);
        const viewer = createViewer(card.querySelector('.viewer-container'));
        state.viewers.push(viewer);
        await loadSTL(viewer, s.stl);
    }

    ['q1-btn-a', 'q1-btn-b', 'q2-btn-a', 'q2-btn-b'].forEach(id => document.getElementById(id).classList.remove('selected'));
    document.getElementById('btn-pairwise-submit').disabled = true;
    document.getElementById('pairwise-validation').textContent = 'Please answer both questions.';
}

['q1-btn-a', 'q1-btn-b', 'q2-btn-a', 'q2-btn-b'].forEach(id => {
    document.getElementById(id).addEventListener('click', function () {
        state.pairAnswers['q' + this.dataset.q] = this.dataset.choice;
        document.querySelectorAll(`.answer-btn[data-q="${this.dataset.q}"]`).forEach(b => b.classList.remove('selected'));
        this.classList.add('selected');
        const done = state.pairAnswers.q1 !== null && state.pairAnswers.q2 !== null;
        document.getElementById('btn-pairwise-submit').disabled = !done;
        document.getElementById('pairwise-validation').textContent = done ? 'Both answered. Click Submit.' : 'Please answer both questions.';
    });
});

document.getElementById('btn-pairwise-submit').addEventListener('click', () => {
    const submitTime = nowIso();
    state.block2Results.push({
        taskId: state.block2Tasks[state.currentBlock2Index].id,
        displayOrder: {
            A: { structureId: state.pairDisplayOrder.A.id, vpValue: state.pairDisplayOrder.A.vpValue },
            B: { structureId: state.pairDisplayOrder.B.id, vpValue: state.pairDisplayOrder.B.vpValue }
        },
        q1_vp_answer: state.pairAnswers.q1,
        q2_fab_answer: state.pairAnswers.q2,
        startTime: state.taskStartTime,
        submitTime,
        responseTimeMs: new Date(submitTime) - new Date(state.taskStartTime)
    });
    state.currentBlock2Index++;
    if (state.currentBlock2Index < state.block2Tasks.length) loadPairwiseTask();
    else showCompletion();
});

// ── Completion & Export ───────────────────────────────────────
function showCompletion() {
    const results = {
        participantId: state.participantId,
        demographics: state.demographics,
        sessionMeta: { timestampStart: state.sessionStart, timestampEnd: nowIso(), userAgent: navigator.userAgent },
        block1: state.block1Results,
        block2: state.block2Results
    };
    window._studyResults = results;
    showScreen('screen-completion');

    // Attempt auto-submit via dataService
    import('./dataService.js').then(({ dataService }) => {
        const statusEl = document.getElementById('submission-status');
        if (statusEl) statusEl.innerHTML = '<span class="status-loading">📤 Submitting results…</span>';
        dataService.submitResults(results).then(res => {
            if (statusEl) statusEl.innerHTML = res.success ? '<span class="status-success">✅ Submitted successfully.</span>' : '<span class="status-error">❌ Submission failed. Download manually.</span>';
        });
    }).catch(() => { });
}

document.getElementById('btn-download-json').addEventListener('click', () => {
    const results = window._studyResults;
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    triggerDownload(blob, `vp_study_${state.participantId}.json`);
});

document.getElementById('btn-download-csv').addEventListener('click', () => {
    const results = window._studyResults;
    const rows = ['participantId,block,taskId,displayA,displayB,displayC,rank1st,rank2nd,rank3rd,q1_vp,q2_fab,responseTimeMs'];
    results.block1.forEach(r => rows.push(`${results.participantId},block1,${r.taskId},${r.displayOrder[0].structureId},${r.displayOrder[1].structureId},${r.displayOrder[2].structureId},${r.ranking[0]},${r.ranking[1]},${r.ranking[2]},,,${r.responseTimeMs}`));
    results.block2.forEach(r => rows.push(`${results.participantId},block2,${r.taskId},${r.displayOrder.A.structureId},${r.displayOrder.B.structureId},,,,${r.q1_vp_answer},${r.q2_fab_answer},${r.responseTimeMs}`));
    triggerDownload(new Blob([rows.join('\n')], { type: 'text/csv' }), `vp_study_${state.participantId}.csv`);
});

function triggerDownload(blob, filename) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
}

function init() {
    document.getElementById('input-pid').value = genId();
    showScreen('screen-welcome');
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
