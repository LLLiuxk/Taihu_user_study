import * as THREE from 'three';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { dataService } from './dataService.js';

// ============================================================
// State & Configuration
// ============================================================

const trials = [
    { id: 1, question: "Which structure feels more 'open' and 'breathable'?", type: "VP Evaluation", modelA: "models/namaqualand_20161648_0.844_58.0%.stl", modelB: "models/namaqualand_25252525_0.786_59.7%.stl" },
    { id: 2, question: "Which structure looks more like a naturally weathered stone?", type: "Organic Likeness", modelA: "models/namaqualand_35131339_0.841_57.8%.stl", modelB: "models/namaqualand_39080845_0.868_58.2%.stl" },
    { id: 3, question: "Which structure feels more 'open' and 'breathable'?", type: "VP Evaluation", modelA: "models/namaqualand_44092027_0.862_58.3%.stl", modelB: "models/namaqualand_44131330_0.835_0.0%.stl" },
    { id: 4, question: "Which structure looks more like a naturally weathered stone?", type: "Organic Likeness", modelA: "models/namaqualand_44200927_0.794_58.6%.stl", modelB: "models/namaqualand_45111133_0.847_0.0%.stl" },
    { id: 5, question: "Which structure feels more 'open' and 'breathable'?", type: "VP Evaluation", modelA: "models/namaqualand_48080836_0.863_0.0%.stl", modelB: "models/namaqualand_50101030_default_58.2%.stl" },
    { id: 6, question: "Which structure looks more like a naturally weathered stone?", type: "Organic Likeness", modelA: "models/namaqualand_50101030_thres0.15_0.761_43.6%.stl", modelB: "models/namaqualand_50101030_thres0.25_0.839_54.4%.stl" },
    { id: 7, question: "Which structure feels more 'open' and 'breathable'?", type: "VP Evaluation", modelA: "models/namaqualand_50101030_thres0.45_0.854_60.8%.stl", modelB: "models/namaqualand_50101030_thres0.55_0.854_61.2%.stl" },
    { id: 8, question: "Which structure looks more like a naturally weathered stone?", type: "Organic Likeness", modelA: "models/namaqualand_53051131_0.882_58.3%.stl", modelB: "models/namaqualand_53110531_0.845_58.6%.stl" },
    { id: 9, question: "Which structure feels more 'open' and 'breathable'?", type: "VP Evaluation", modelA: "models/namaqualand_55090927_0.856_0.0%.stl", modelB: "models/namaqualand_61121215_0.849_58.9%.stl" },
    { id: 10, question: "Which structure looks more like a naturally weathered stone?", type: "Organic Likeness", modelA: "models/namaqualand_65070721_0.873_58.7%.stl", modelB: "models/namaqualand_80040412_0.897_56.2%.stl" }
];

const ratingModels = [
    { id: "M_$20161648", url: "models/namaqualand_20161648_0.844_58.0%.stl" },
    { id: "M_$35131339", url: "models/namaqualand_35131339_0.841_57.8%.stl" },
    { id: "M_$50101030_default", url: "models/namaqualand_50101030_default_58.2%.stl" },
    { id: "M_$53051131", url: "models/namaqualand_53051131_0.882_58.3%.stl" },
    { id: "M_$80040412", url: "models/namaqualand_80040412_0.897_56.2%.stl" }
];

let currentTrialIndex = 0;
let currentRatingIndex = 0;
const results = {
    demographics: {},
    comparisons: [],
    ratings: [],
    feedback: {},
    timestampStart: new Date().toISOString()
};

let isAutoRotating = true;
let isSyncRotation = true; // Default sync to true for better comparison experience
let _syncLock = false;

const INIT_CAM = { x: 2, y: 0.5, z: 2 };

let viewerInstanceA = null;
let viewerInstanceB = null;
let viewerInstanceSingle = null;

// ============================================================
// DOM References
// ============================================================
const screens = {
    intro: document.getElementById('intro-container'),
    demographics: document.getElementById('demographics-container'),
    trial: document.getElementById('trial-container'),
    rating: document.getElementById('rating-container'),
    feedback: document.getElementById('feedback-container'),
    completion: document.getElementById('completion-container')
};

const qText    = document.getElementById('question-text');
const pText    = document.getElementById('progress-text');
const pFill    = document.getElementById('progress-fill');
const containerA = document.getElementById('viewer-a');
const containerB = document.getElementById('viewer-b');
const containerSingle = document.getElementById('viewer-single');
const resJson    = document.getElementById('results-json');
const btnPause   = document.getElementById('btn-pause');
const btnSync    = document.getElementById('btn-sync');

// ============================================================
// Event Listeners
// ============================================================
document.getElementById('btn-start').addEventListener('click', () => showScreen('demographics'));
document.getElementById('btn-demographics-next').addEventListener('click', saveDemographics);
document.getElementById('btn-a').addEventListener('click', () => selectModel('A'));
document.getElementById('btn-equal').addEventListener('click', () => selectModel('Equal'));
document.getElementById('btn-b').addEventListener('click', () => selectModel('B'));
document.getElementById('btn-rating-next').addEventListener('click', saveRating);
document.getElementById('btn-submit-all').addEventListener('click', saveFeedback);
document.getElementById('btn-download').addEventListener('click', downloadResults);
document.getElementById('btn-reset').addEventListener('click', resetViews);
btnPause.addEventListener('click', toggleRotation);
btnSync.addEventListener('click', toggleSync);

// ============================================================
// Navigation Logic
// ============================================================
function showScreen(screenId) {
    Object.values(screens).forEach(s => s.style.display = 'none');
    screens[screenId].style.display = 'block';

    if (screenId === 'trial') initTrial();
    if (screenId === 'rating') initRating();
}

function saveDemographics() {
    results.demographics = {
        occupation: document.getElementById('input-occupation').value,
        experience: document.getElementById('select-exp').value,
        priorKnowledge: document.querySelector('input[name="knowledge"]:checked').value
    };
    showScreen('trial');
}

function saveRating() {
    const model = ratingModels[currentRatingIndex];
    results.ratings.push({
        modelId: model.id,
        transparency: document.getElementById('range-transparency').value,
        naturalness: document.getElementById('range-naturalness').value,
        complexity: document.getElementById('range-complexity').value
    });

    currentRatingIndex++;
    if (currentRatingIndex < ratingModels.length) {
        initRating();
    } else {
        showScreen('feedback');
    }
}

function saveFeedback() {
    results.feedback = {
        utilitarian: document.getElementById('text-utilitarian').value,
        general: document.getElementById('text-feedback').value
    };
    results.timestampEnd = new Date().toISOString();
    showCompletion();
}

// ============================================================
// Viewers & 3D Logic (Modularized)
// ============================================================
function createViewer(container) {
    while (container.firstChild) container.removeChild(container.firstChild);
    const width  = container.clientWidth || 500;
    const height = container.clientHeight || 500;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf9f9f9);
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.autoRotate = isAutoRotating;
    controls.autoRotateSpeed = 2.2;

    // Lights (Soft lighting to prevent yellow/black patches)
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x555555, 1.2);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 7);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-5, 0, -5);
    scene.add(fillLight);

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

    return { scene, camera, controls, renderer, dispose() {
        cancelAnimationFrame(animId);
        window.removeEventListener('resize', onResize);
        controls.dispose();
        renderer.dispose();
    }};
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

            const material = new THREE.MeshStandardMaterial({ color: 0xd4c5a9, roughness: 0.8, metalness: 0.1 });

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

// ============================================================
// Interaction Logic
// ============================================================
const onAChange = () => mirrorCamera(viewerInstanceA, viewerInstanceB);
const onBChange = () => mirrorCamera(viewerInstanceB, viewerInstanceA);

function resetViews() {
    [viewerInstanceA, viewerInstanceB, viewerInstanceSingle].forEach(v => {
        if (v) { 
            v.camera.position.set(INIT_CAM.x, INIT_CAM.y, INIT_CAM.z); 
            v.controls.target.set(0, 0, 0); 
            v.controls.update(); 
        }
    });
}

function toggleRotation() {
    isAutoRotating = !isAutoRotating;
    if (viewerInstanceA) viewerInstanceA.controls.autoRotate = isAutoRotating;
    if (viewerInstanceSingle) viewerInstanceSingle.controls.autoRotate = isAutoRotating;
    
    // Only enable auto-rotate on B if they are NOT synced
    if (viewerInstanceB) {
        viewerInstanceB.controls.autoRotate = isSyncRotation ? false : isAutoRotating;
    }
    
    btnPause.classList.toggle('active', !isAutoRotating);
}

function toggleSync() {
    isSyncRotation = !isSyncRotation;
    btnSync.classList.toggle('active', isSyncRotation);
    
    if (isSyncRotation) {
        setupSyncListeners();
        // Prevent double speed by disabling auto-rotate on viewer B when syncing
        if (viewerInstanceB) viewerInstanceB.controls.autoRotate = false;
    } else {
        removeSyncListeners();
        // Restore auto-rotate state
        if (viewerInstanceB) viewerInstanceB.controls.autoRotate = isAutoRotating;
    }
}

function mirrorCamera(src, dst) {
    if (_syncLock || !isSyncRotation || !dst || !src) return;
    _syncLock = true;
    dst.camera.position.copy(src.camera.position);
    dst.controls.target.copy(src.controls.target);
    dst.controls.update();
    _syncLock = false;
}

function setupSyncListeners() {
    if (viewerInstanceA) viewerInstanceA.controls.addEventListener('change', onAChange);
    if (viewerInstanceB) viewerInstanceB.controls.addEventListener('change', onBChange);
}

function removeSyncListeners() {
    if (viewerInstanceA) viewerInstanceA.controls.removeEventListener('change', onAChange);
    if (viewerInstanceB) viewerInstanceB.controls.removeEventListener('change', onBChange);
}

// ============================================================
// Boot & Initialization
// ============================================================
function initApp() {
    console.log("TaihuStone App Initializing...");
    
    // Add trial navigation listeners
    const btnStart = document.getElementById('btn-start');
    const btnDemoNext = document.getElementById('btn-demographics-next');
    
    if (btnStart) {
        console.log("Found #btn-start, attaching listener.");
        btnStart.addEventListener('click', () => {
            console.log("#btn-start clicked!");
            showScreen('demographics');
        });
    } else {
        console.error("Critical: #btn-start not found in DOM.");
    }

    if (btnDemoNext) {
        btnDemoNext.addEventListener('click', saveDemographics);
    }

    // Initial Screen
    showScreen('intro');
}

// Ensure DOM is ready even though it's a module
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// ============================================================
// Trial & Rating Initialization
// ============================================================
function initTrial() {
    if (currentTrialIndex >= trials.length) {
        showScreen('rating');
        return;
    }
    const trial = trials[currentTrialIndex];
    qText.textContent = trial.question;
    pText.textContent = `Visual Comparison ${currentTrialIndex + 1} / ${trials.length}`;
    pFill.style.width = `${(currentTrialIndex / trials.length) * 50}%`; // First 50% for trials

    if (viewerInstanceA) viewerInstanceA.dispose();
    if (viewerInstanceB) viewerInstanceB.dispose();
    viewerInstanceA = createViewer(containerA);
    viewerInstanceB = createViewer(containerB);
    loadSTL(viewerInstanceA, trial.modelA);
    loadSTL(viewerInstanceB, trial.modelB);
    
    // Prevent double speed automatically if synced
    if (isSyncRotation) {
        if (viewerInstanceB) viewerInstanceB.controls.autoRotate = false;
        setupSyncListeners();
    }
}

function selectModel(choice) {
    const trial = trials[currentTrialIndex];
    results.comparisons.push({ trialId: trial.id, choice, timestamp: new Date().toISOString() });
    currentTrialIndex++;
    initTrial();
}

function initRating() {
    const model = ratingModels[currentRatingIndex];
    pText.textContent = `Model Rating ${currentRatingIndex + 1} / ${ratingModels.length}`;
    pFill.style.width = `${50 + (currentRatingIndex / ratingModels.length) * 40}%`;

    if (viewerInstanceSingle) viewerInstanceSingle.dispose();
    viewerInstanceSingle = createViewer(containerSingle);
    loadSTL(viewerInstanceSingle, model.url);
}

// Import was moved to the top

function showCompletion() {
    pFill.style.width = '100%';
    pText.textContent = 'Completed';
    screens.feedback.style.display = 'none';
    screens.completion.style.display = 'block';
    resJson.value = JSON.stringify(results, null, 2);

    const statusEl = document.getElementById('submission-status');
    statusEl.innerHTML = '<span class="status-loading">📤 Submitting results...</span>';

    dataService.submitResults(results).then(res => {
        if (res.success) {
            statusEl.innerHTML = '<span class="status-success">✅ Results saved successfully!</span>';
        } else {
            statusEl.innerHTML = '<span class="status-error">❌ Submission failed. Please download the data manually below and contact the researcher.</span>';
        }
    });
}

function downloadResults() {
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `taihustone_study_${Date.now()}.json`;
    a.click();
}

// Initial Screen cleanup
// The initial call is now handled by the event listener / initApp block above.
