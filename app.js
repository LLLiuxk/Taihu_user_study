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
            { id: 'RockBr_50101030_0.8434', vpValue: 0.8434, stl: 'models/RockBr_50101030_0.8434.stl' },
            { id: 'RockBr_44092027_0.8605', vpValue: 0.8605, stl: 'models/RockBr_44092027_0.8605.stl' },
            { id: 'RockBr_80040412_0.8935', vpValue: 0.8935, stl: 'models/RockBr_80040412_0.8935.stl' },
        ]
    },
    {
        id: 'B1_G2',
        structures: [
            { id: 'RockBr_25252525_0.7742', vpValue: 0.7742, stl: 'models/RockBr_25252525_0.7742.stl' },
            { id: 'RockBr_39080845_0.8460', vpValue: 0.846, stl: 'models/RockBr_39080845_0.8460.stl' },
            { id: 'RockBr_61121215_0.8499', vpValue: 0.8499, stl: 'models/RockBr_61121215_0.8499.stl' },
        ]
    },
    {
        id: 'B1_G3',
        structures: [
            { id: 'RockBr_25252525_0.7742', vpValue: 0.7742, stl: 'models/RockBr_25252525_0.7742.stl' },
            { id: 'RockBr_20161648_0.7998', vpValue: 0.7998, stl: 'models/RockBr_20161648_0.7998.stl' },
            { id: 'RockBr_44131330_0.8270', vpValue: 0.827, stl: 'models/RockBr_44131330_0.8270.stl' },
        ]
    },
    {
        id: 'B1_G4',
        structures: [
            { id: 'RockBr_44200927_0.7882', vpValue: 0.7882, stl: 'models/RockBr_44200927_0.7882.stl' },
            { id: 'RockBr_55090927_0.8534', vpValue: 0.8534, stl: 'models/RockBr_55090927_0.8534.stl' },
            { id: 'RockBr_80040412_0.8935', vpValue: 0.8935, stl: 'models/RockBr_80040412_0.8935.stl' },
        ]
    },
    {
        id: 'B1_G5',
        structures: [
            { id: 'RockBr_44200927_0.7882', vpValue: 0.7882, stl: 'models/RockBr_44200927_0.7882.stl' },
            { id: 'RockBr_39080845_0.8460', vpValue: 0.846, stl: 'models/RockBr_39080845_0.8460.stl' },
            { id: 'RockBr_55090927_0.8534', vpValue: 0.8534, stl: 'models/RockBr_55090927_0.8534.stl' },
        ]
    },
    {
        id: 'B1_G6',
        structures: [
            { id: 'RockBr_44200927_0.7882', vpValue: 0.7882, stl: 'models/RockBr_44200927_0.7882.stl' },
            { id: 'RockBr_53110531_0.8354', vpValue: 0.8354, stl: 'models/RockBr_53110531_0.8354.stl' },
            { id: 'RockBr_53051131_0.8727', vpValue: 0.8727, stl: 'models/RockBr_53051131_0.8727.stl' },
        ]
    },
    {
        id: 'B1_G7',
        structures: [
            { id: 'RockBr_25252525_0.7742', vpValue: 0.7742, stl: 'models/RockBr_25252525_0.7742.stl' },
            { id: 'RockBr_48080836_0.8500', vpValue: 0.85, stl: 'models/RockBr_48080836_0.8500.stl' },
            { id: 'RockBr_80040412_0.8935', vpValue: 0.8935, stl: 'models/RockBr_80040412_0.8935.stl' },
        ]
    },
    {
        id: 'B1_G8',
        structures: [
            { id: 'RockBr_25252525_0.7742', vpValue: 0.7742, stl: 'models/RockBr_25252525_0.7742.stl' },
            { id: 'RockBr_50101030_0.8434', vpValue: 0.8434, stl: 'models/RockBr_50101030_0.8434.stl' },
            { id: 'RockBr_48080836_0.8500', vpValue: 0.85, stl: 'models/RockBr_48080836_0.8500.stl' },
        ]
    },
    {
        id: 'B1_G9',
        structures: [
            { id: 'RockBr_61121215_0.8499', vpValue: 0.8499, stl: 'models/RockBr_61121215_0.8499.stl' },
            { id: 'RockBr_48080836_0.8500', vpValue: 0.85, stl: 'models/RockBr_48080836_0.8500.stl' },
            { id: 'RockBr_53051131_0.8727', vpValue: 0.8727, stl: 'models/RockBr_53051131_0.8727.stl' },
        ]
    },
    {
        id: 'B1_G10',
        structures: [
            { id: 'RockBr_45111133_0.8349', vpValue: 0.8349, stl: 'models/RockBr_45111133_0.8349.stl' },
            { id: 'RockBr_53051131_0.8727', vpValue: 0.8727, stl: 'models/RockBr_53051131_0.8727.stl' },
            { id: 'RockBr_80040412_0.8935', vpValue: 0.8935, stl: 'models/RockBr_80040412_0.8935.stl' },
        ]
    },
    {
        id: 'B1_G11',
        structures: [
            { id: 'boulder_44200927_0.8001', vpValue: 0.8001, stl: 'models/boulder_44200927_0.8001.stl' },
            { id: 'boulder_50101030_0.8562', vpValue: 0.8562, stl: 'models/boulder_50101030_0.8562.stl' },
            { id: 'boulder_80040412_0.8990', vpValue: 0.899, stl: 'models/boulder_80040412_0.8990.stl' },
        ]
    },
    {
        id: 'B1_G12',
        structures: [
            { id: 'boulder_53110531_0.8507', vpValue: 0.8507, stl: 'models/boulder_53110531_0.8507.stl' },
            { id: 'boulder_39080845_0.8567', vpValue: 0.8567, stl: 'models/boulder_39080845_0.8567.stl' },
            { id: 'boulder_55090927_0.8607', vpValue: 0.8607, stl: 'models/boulder_55090927_0.8607.stl' },
        ]
    },
    {
        id: 'B1_G13',
        structures: [
            { id: 'boulder_44200927_0.8001', vpValue: 0.8001, stl: 'models/boulder_44200927_0.8001.stl' },
            { id: 'boulder_44131330_0.8384', vpValue: 0.8384, stl: 'models/boulder_44131330_0.8384.stl' },
            { id: 'boulder_48080836_0.8578', vpValue: 0.8578, stl: 'models/boulder_48080836_0.8578.stl' },
        ]
    },
    {
        id: 'B1_G14',
        structures: [
            { id: 'boulder_44200927_0.8001', vpValue: 0.8001, stl: 'models/boulder_44200927_0.8001.stl' },
            { id: 'boulder_44131330_0.8384', vpValue: 0.8384, stl: 'models/boulder_44131330_0.8384.stl' },
            { id: 'boulder_39080845_0.8567', vpValue: 0.8567, stl: 'models/boulder_39080845_0.8567.stl' },
        ]
    },
    {
        id: 'B1_G15',
        structures: [
            { id: 'boulder_44200927_0.8001', vpValue: 0.8001, stl: 'models/boulder_44200927_0.8001.stl' },
            { id: 'boulder_61121215_0.8566', vpValue: 0.8566, stl: 'models/boulder_61121215_0.8566.stl' },
            { id: 'boulder_55090927_0.8607', vpValue: 0.8607, stl: 'models/boulder_55090927_0.8607.stl' },
        ]
    },
    {
        id: 'B1_G16',
        structures: [
            { id: 'boulder_20161648_0.8227', vpValue: 0.8227, stl: 'models/boulder_20161648_0.8227.stl' },
            { id: 'boulder_48080836_0.8578', vpValue: 0.8578, stl: 'models/boulder_48080836_0.8578.stl' },
            { id: 'boulder_55090927_0.8607', vpValue: 0.8607, stl: 'models/boulder_55090927_0.8607.stl' },
        ]
    },
    {
        id: 'B1_G17',
        structures: [
            { id: 'boulder_20161648_0.8227', vpValue: 0.8227, stl: 'models/boulder_20161648_0.8227.stl' },
            { id: 'boulder_44092027_0.8715', vpValue: 0.8715, stl: 'models/boulder_44092027_0.8715.stl' },
            { id: 'boulder_80040412_0.8990', vpValue: 0.899, stl: 'models/boulder_80040412_0.8990.stl' },
        ]
    },
    {
        id: 'B1_G18',
        structures: [
            { id: 'boulder_61121215_0.8566', vpValue: 0.8566, stl: 'models/boulder_61121215_0.8566.stl' },
            { id: 'boulder_48080836_0.8578', vpValue: 0.8578, stl: 'models/boulder_48080836_0.8578.stl' },
            { id: 'boulder_53051131_0.8784', vpValue: 0.8784, stl: 'models/boulder_53051131_0.8784.stl' },
        ]
    },
    {
        id: 'B1_G19',
        structures: [
            { id: 'boulder_44200927_0.8001', vpValue: 0.8001, stl: 'models/boulder_44200927_0.8001.stl' },
            { id: 'boulder_44131330_0.8384', vpValue: 0.8384, stl: 'models/boulder_44131330_0.8384.stl' },
            { id: 'boulder_50101030_0.8562', vpValue: 0.8562, stl: 'models/boulder_50101030_0.8562.stl' },
        ]
    },
    {
        id: 'B1_G20',
        structures: [
            { id: 'boulder_20161648_0.8227', vpValue: 0.8227, stl: 'models/boulder_20161648_0.8227.stl' },
            { id: 'boulder_61121215_0.8566', vpValue: 0.8566, stl: 'models/boulder_61121215_0.8566.stl' },
            { id: 'boulder_48080836_0.8578', vpValue: 0.8578, stl: 'models/boulder_48080836_0.8578.stl' },
        ]
    },
    {
        id: 'B1_G21',
        structures: [
            { id: 'moonrock_50101030_0.8434', vpValue: 0.8434, stl: 'models/moonrock_50101030_0.8434.stl' },
            { id: 'moonrock_48080832_0.8518', vpValue: 0.8518, stl: 'models/moonrock_48080832_0.8518.stl' },
            { id: 'moonrock_53051131_0.8709', vpValue: 0.8709, stl: 'models/moonrock_53051131_0.8709.stl' },
        ]
    },
    {
        id: 'B1_G22',
        structures: [
            { id: 'moonrock_55090927_0.8535', vpValue: 0.8535, stl: 'models/moonrock_55090927_0.8535.stl' },
            { id: 'moonrock_53051131_0.8709', vpValue: 0.8709, stl: 'models/moonrock_53051131_0.8709.stl' },
            { id: 'moonrock_80040412_0.8971', vpValue: 0.8971, stl: 'models/moonrock_80040412_0.8971.stl' },
        ]
    },
    {
        id: 'B1_G23',
        structures: [
            { id: 'moonrock_45111133_0.8371', vpValue: 0.8371, stl: 'models/moonrock_45111133_0.8371.stl' },
            { id: 'moonrock_53051131_0.8709', vpValue: 0.8709, stl: 'models/moonrock_53051131_0.8709.stl' },
            { id: 'moonrock_80040412_0.8971', vpValue: 0.8971, stl: 'models/moonrock_80040412_0.8971.stl' },
        ]
    },
    {
        id: 'B1_G24',
        structures: [
            { id: 'moonrock_44131330_0.8269', vpValue: 0.8269, stl: 'models/moonrock_44131330_0.8269.stl' },
            { id: 'moonrock_53110531_0.8371', vpValue: 0.8371, stl: 'models/moonrock_53110531_0.8371.stl' },
            { id: 'moonrock_53051131_0.8709', vpValue: 0.8709, stl: 'models/moonrock_53051131_0.8709.stl' },
        ]
    },
    {
        id: 'B1_G25',
        structures: [
            { id: 'moonrock_44200927_0.7778', vpValue: 0.7778, stl: 'models/moonrock_44200927_0.7778.stl' },
            { id: 'moonrock_53110531_0.8371', vpValue: 0.8371, stl: 'models/moonrock_53110531_0.8371.stl' },
            { id: 'moonrock_61121215_0.8546', vpValue: 0.8546, stl: 'models/moonrock_61121215_0.8546.stl' },
        ]
    },
    {
        id: 'B1_G26',
        structures: [
            { id: 'moonrock_44131330_0.8269', vpValue: 0.8269, stl: 'models/moonrock_44131330_0.8269.stl' },
            { id: 'moonrock_48080832_0.8518', vpValue: 0.8518, stl: 'models/moonrock_48080832_0.8518.stl' },
            { id: 'moonrock_55090927_0.8535', vpValue: 0.8535, stl: 'models/moonrock_55090927_0.8535.stl' },
        ]
    },
    {
        id: 'B1_G27',
        structures: [
            { id: 'moonrock_53110531_0.8371', vpValue: 0.8371, stl: 'models/moonrock_53110531_0.8371.stl' },
            { id: 'moonrock_55090927_0.8535', vpValue: 0.8535, stl: 'models/moonrock_55090927_0.8535.stl' },
            { id: 'moonrock_80040412_0.8971', vpValue: 0.8971, stl: 'models/moonrock_80040412_0.8971.stl' },
        ]
    },
    {
        id: 'B1_G28',
        structures: [
            { id: 'moonrock_44200927_0.7778', vpValue: 0.7778, stl: 'models/moonrock_44200927_0.7778.stl' },
            { id: 'moonrock_44092027_0.8578', vpValue: 0.8578, stl: 'models/moonrock_44092027_0.8578.stl' },
            { id: 'moonrock_80040412_0.8971', vpValue: 0.8971, stl: 'models/moonrock_80040412_0.8971.stl' },
        ]
    },
    {
        id: 'B1_G29',
        structures: [
            { id: 'moonrock_25252525_0.77', vpValue: 0.77, stl: 'models/moonrock_25252525_0.77.stl' },
            { id: 'moonrock_44200927_0.7778', vpValue: 0.7778, stl: 'models/moonrock_44200927_0.7778.stl' },
            { id: 'moonrock_53110531_0.8371', vpValue: 0.8371, stl: 'models/moonrock_53110531_0.8371.stl' },
        ]
    },
    {
        id: 'B1_G30',
        structures: [
            { id: 'moonrock_44200927_0.7778', vpValue: 0.7778, stl: 'models/moonrock_44200927_0.7778.stl' },
            { id: 'moonrock_20161648_0.7946', vpValue: 0.7946, stl: 'models/moonrock_20161648_0.7946.stl' },
            { id: 'moonrock_39080843_0.8401', vpValue: 0.8401, stl: 'models/moonrock_39080843_0.8401.stl' },
        ]
    },
    {
        id: 'B1_G31',
        structures: [
            { id: 'namaqualand_5501134_0.8803', vpValue: 0.8803, stl: 'models/namaqualand_5501134_0.8803.stl' },
            { id: 'namaqualand_0100_0.9660', vpValue: 0.966, stl: 'models/namaqualand_0100_0.9660.stl' },
            { id: 'namaqualand_1000_0.9731', vpValue: 0.9731, stl: 'models/namaqualand_1000_0.9731.stl' },
        ]
    },
    {
        id: 'B1_G32',
        structures: [
            { id: 'namaqualand_50101030adj35_0.8264', vpValue: 0.8264, stl: 'models/namaqualand_50101030adj35_0.8264.stl' },
            { id: 'namaqualand_50101030adj55_0.8341', vpValue: 0.8341, stl: 'models/namaqualand_50101030adj55_0.8341.stl' },
            { id: 'namaqualand_0202060_0.8563', vpValue: 0.8563, stl: 'models/namaqualand_0202060_0.8563.stl' },
        ]
    },
    {
        id: 'B1_G33',
        structures: [
            { id: 'namaqualand_50101030adj25_0.8084', vpValue: 0.8084, stl: 'models/namaqualand_50101030adj25_0.8084.stl' },
            { id: 'namaqualand_50101030adj55_0.8341', vpValue: 0.8341, stl: 'models/namaqualand_50101030adj55_0.8341.stl' },
            { id: 'namaqualand_000_0.9625', vpValue: 0.9625, stl: 'models/namaqualand_000_0.9625.stl' },
        ]
    },
    {
        id: 'B1_G34',
        structures: [
            { id: 'namaqualand_25252525_0.7648', vpValue: 0.7648, stl: 'models/namaqualand_25252525_0.7648.stl' },
            { id: 'namaqualand_0100_0.9660', vpValue: 0.966, stl: 'models/namaqualand_0100_0.9660.stl' },
            { id: 'namaqualand_0010_0.9997', vpValue: 0.9997, stl: 'models/namaqualand_0010_0.9997.stl' },
        ]
    },
    {
        id: 'B1_G35',
        structures: [
            { id: 'namaqualand_25252525_0.7648', vpValue: 0.7648, stl: 'models/namaqualand_25252525_0.7648.stl' },
            { id: 'namaqualand_50101030adj25_0.8084', vpValue: 0.8084, stl: 'models/namaqualand_50101030adj25_0.8084.stl' },
            { id: 'namaqualand_50101030adj45_0.8273', vpValue: 0.8273, stl: 'models/namaqualand_50101030adj45_0.8273.stl' },
        ]
    },
    {
        id: 'B1_G36',
        structures: [
            { id: 'namaqualand_25252525_0.7648', vpValue: 0.7648, stl: 'models/namaqualand_25252525_0.7648.stl' },
            { id: 'namaqualand_5511034_0.8293', vpValue: 0.8293, stl: 'models/namaqualand_5511034_0.8293.stl' },
            { id: 'namaqualand_7015150_0.8747', vpValue: 0.8747, stl: 'models/namaqualand_7015150_0.8747.stl' },
        ]
    },
    {
        id: 'B1_G37',
        structures: [
            { id: 'namaqualand_50101030adj25_0.8084', vpValue: 0.8084, stl: 'models/namaqualand_50101030adj25_0.8084.stl' },
            { id: 'namaqualand_50101030adj55_0.8341', vpValue: 0.8341, stl: 'models/namaqualand_50101030adj55_0.8341.stl' },
            { id: 'namaqualand_7015150_0.8747', vpValue: 0.8747, stl: 'models/namaqualand_7015150_0.8747.stl' },
        ]
    },
    {
        id: 'B1_G38',
        structures: [
            { id: 'namaqualand_50101030adj15_0.7048', vpValue: 0.7048, stl: 'models/namaqualand_50101030adj15_0.7048.stl' },
            { id: 'namaqualand_50101030adj55_0.8341', vpValue: 0.8341, stl: 'models/namaqualand_50101030adj55_0.8341.stl' },
            { id: 'namaqualand_5501134_0.8803', vpValue: 0.8803, stl: 'models/namaqualand_5501134_0.8803.stl' },
        ]
    },
    {
        id: 'B1_G39',
        structures: [
            { id: 'namaqualand_50101030adj15_0.7048', vpValue: 0.7048, stl: 'models/namaqualand_50101030adj15_0.7048.stl' },
            { id: 'namaqualand_5511034_0.8293', vpValue: 0.8293, stl: 'models/namaqualand_5511034_0.8293.stl' },
            { id: 'namaqualand_0100_0.9660', vpValue: 0.966, stl: 'models/namaqualand_0100_0.9660.stl' },
        ]
    },
    {
        id: 'B1_G40',
        structures: [
            { id: 'namaqualand_50101030adj25_0.8084', vpValue: 0.8084, stl: 'models/namaqualand_50101030adj25_0.8084.stl' },
            { id: 'namaqualand_000_0.9625', vpValue: 0.9625, stl: 'models/namaqualand_000_0.9625.stl' },
            { id: 'namaqualand_1000_0.9731', vpValue: 0.9731, stl: 'models/namaqualand_1000_0.9731.stl' },
        ]
    },
];

const BLOCK2_TASKS_RAW = [
    {
        id: 'B2_P1',
        structureA: { id: 'RockBr_48080836_0.8500', vpValue: 0.85, stl: 'models/RockBr_48080836_0.8500.stl' },
        structureB: { id: 'RockBr_55090927_0.8534', vpValue: 0.8534, stl: 'models/RockBr_55090927_0.8534.stl' }
    },
    {
        id: 'B2_P2',
        structureA: { id: 'RockBr_44200927_0.7882', vpValue: 0.7882, stl: 'models/RockBr_44200927_0.7882.stl' },
        structureB: { id: 'RockBr_44131330_0.8270', vpValue: 0.827, stl: 'models/RockBr_44131330_0.8270.stl' }
    },
    {
        id: 'B2_P3',
        structureA: { id: 'RockBr_25252525_0.7742', vpValue: 0.7742, stl: 'models/RockBr_25252525_0.7742.stl' },
        structureB: { id: 'RockBr_45111133_0.8349', vpValue: 0.8349, stl: 'models/RockBr_45111133_0.8349.stl' }
    },
    {
        id: 'B2_P4',
        structureA: { id: 'RockBr_20161648_0.7998', vpValue: 0.7998, stl: 'models/RockBr_20161648_0.7998.stl' },
        structureB: { id: 'RockBr_80040412_0.8935', vpValue: 0.8935, stl: 'models/RockBr_80040412_0.8935.stl' }
    },
    {
        id: 'B2_P5',
        structureA: { id: 'RockBr_20161648_0.7998', vpValue: 0.7998, stl: 'models/RockBr_20161648_0.7998.stl' },
        structureB: { id: 'RockBr_48080836_0.8500', vpValue: 0.85, stl: 'models/RockBr_48080836_0.8500.stl' }
    },
    {
        id: 'B2_P6',
        structureA: { id: 'RockBr_20161648_0.7998', vpValue: 0.7998, stl: 'models/RockBr_20161648_0.7998.stl' },
        structureB: { id: 'RockBr_50101030_0.8434', vpValue: 0.8434, stl: 'models/RockBr_50101030_0.8434.stl' }
    },
    {
        id: 'B2_P7',
        structureA: { id: 'RockBr_44200927_0.7882', vpValue: 0.7882, stl: 'models/RockBr_44200927_0.7882.stl' },
        structureB: { id: 'RockBr_50101030_0.8434', vpValue: 0.8434, stl: 'models/RockBr_50101030_0.8434.stl' }
    },
    {
        id: 'B2_P8',
        structureA: { id: 'RockBr_44200927_0.7882', vpValue: 0.7882, stl: 'models/RockBr_44200927_0.7882.stl' },
        structureB: { id: 'RockBr_20161648_0.7998', vpValue: 0.7998, stl: 'models/RockBr_20161648_0.7998.stl' }
    },
    {
        id: 'B2_P9',
        structureA: { id: 'RockBr_55090927_0.8534', vpValue: 0.8534, stl: 'models/RockBr_55090927_0.8534.stl' },
        structureB: { id: 'RockBr_53051131_0.8727', vpValue: 0.8727, stl: 'models/RockBr_53051131_0.8727.stl' }
    },
    {
        id: 'B2_P10',
        structureA: { id: 'RockBr_50101030_0.8434', vpValue: 0.8434, stl: 'models/RockBr_50101030_0.8434.stl' },
        structureB: { id: 'RockBr_80040412_0.8935', vpValue: 0.8935, stl: 'models/RockBr_80040412_0.8935.stl' }
    },
    {
        id: 'B2_P11',
        structureA: { id: 'boulder_44200927_0.8001', vpValue: 0.8001, stl: 'models/boulder_44200927_0.8001.stl' },
        structureB: { id: 'boulder_80040412_0.8990', vpValue: 0.899, stl: 'models/boulder_80040412_0.8990.stl' }
    },
    {
        id: 'B2_P12',
        structureA: { id: 'boulder_44092027_0.8715', vpValue: 0.8715, stl: 'models/boulder_44092027_0.8715.stl' },
        structureB: { id: 'boulder_53051131_0.8784', vpValue: 0.8784, stl: 'models/boulder_53051131_0.8784.stl' }
    },
    {
        id: 'B2_P13',
        structureA: { id: 'boulder_50101030_0.8562', vpValue: 0.8562, stl: 'models/boulder_50101030_0.8562.stl' },
        structureB: { id: 'boulder_44092027_0.8715', vpValue: 0.8715, stl: 'models/boulder_44092027_0.8715.stl' }
    },
    {
        id: 'B2_P14',
        structureA: { id: 'boulder_44200927_0.8001', vpValue: 0.8001, stl: 'models/boulder_44200927_0.8001.stl' },
        structureB: { id: 'boulder_50101030_0.8562', vpValue: 0.8562, stl: 'models/boulder_50101030_0.8562.stl' }
    },
    {
        id: 'B2_P15',
        structureA: { id: 'boulder_44200927_0.8001', vpValue: 0.8001, stl: 'models/boulder_44200927_0.8001.stl' },
        structureB: { id: 'boulder_53110531_0.8507', vpValue: 0.8507, stl: 'models/boulder_53110531_0.8507.stl' }
    },
    {
        id: 'B2_P16',
        structureA: { id: 'boulder_53051131_0.8784', vpValue: 0.8784, stl: 'models/boulder_53051131_0.8784.stl' },
        structureB: { id: 'boulder_80040412_0.8990', vpValue: 0.899, stl: 'models/boulder_80040412_0.8990.stl' }
    },
    {
        id: 'B2_P17',
        structureA: { id: 'boulder_44131330_0.8384', vpValue: 0.8384, stl: 'models/boulder_44131330_0.8384.stl' },
        structureB: { id: 'boulder_39080845_0.8567', vpValue: 0.8567, stl: 'models/boulder_39080845_0.8567.stl' }
    },
    {
        id: 'B2_P18',
        structureA: { id: 'boulder_44131330_0.8384', vpValue: 0.8384, stl: 'models/boulder_44131330_0.8384.stl' },
        structureB: { id: 'boulder_55090927_0.8607', vpValue: 0.8607, stl: 'models/boulder_55090927_0.8607.stl' }
    },
    {
        id: 'B2_P19',
        structureA: { id: 'boulder_39080845_0.8567', vpValue: 0.8567, stl: 'models/boulder_39080845_0.8567.stl' },
        structureB: { id: 'boulder_55090927_0.8607', vpValue: 0.8607, stl: 'models/boulder_55090927_0.8607.stl' }
    },
    {
        id: 'B2_P20',
        structureA: { id: 'boulder_55090927_0.8607', vpValue: 0.8607, stl: 'models/boulder_55090927_0.8607.stl' },
        structureB: { id: 'boulder_53051131_0.8784', vpValue: 0.8784, stl: 'models/boulder_53051131_0.8784.stl' }
    },
    {
        id: 'B2_P21',
        structureA: { id: 'moonrock_50101030_0.8434', vpValue: 0.8434, stl: 'models/moonrock_50101030_0.8434.stl' },
        structureB: { id: 'moonrock_55090927_0.8535', vpValue: 0.8535, stl: 'models/moonrock_55090927_0.8535.stl' }
    },
    {
        id: 'B2_P22',
        structureA: { id: 'moonrock_20161648_0.7946', vpValue: 0.7946, stl: 'models/moonrock_20161648_0.7946.stl' },
        structureB: { id: 'moonrock_44131330_0.8269', vpValue: 0.8269, stl: 'models/moonrock_44131330_0.8269.stl' }
    },
    {
        id: 'B2_P23',
        structureA: { id: 'moonrock_55090927_0.8535', vpValue: 0.8535, stl: 'models/moonrock_55090927_0.8535.stl' },
        structureB: { id: 'moonrock_53051131_0.8709', vpValue: 0.8709, stl: 'models/moonrock_53051131_0.8709.stl' }
    },
    {
        id: 'B2_P24',
        structureA: { id: 'moonrock_44092027_0.8578', vpValue: 0.8578, stl: 'models/moonrock_44092027_0.8578.stl' },
        structureB: { id: 'moonrock_80040412_0.8971', vpValue: 0.8971, stl: 'models/moonrock_80040412_0.8971.stl' }
    },
    {
        id: 'B2_P25',
        structureA: { id: 'moonrock_39080843_0.8401', vpValue: 0.8401, stl: 'models/moonrock_39080843_0.8401.stl' },
        structureB: { id: 'moonrock_80040412_0.8971', vpValue: 0.8971, stl: 'models/moonrock_80040412_0.8971.stl' }
    },
    {
        id: 'B2_P26',
        structureA: { id: 'moonrock_45111133_0.8371', vpValue: 0.8371, stl: 'models/moonrock_45111133_0.8371.stl' },
        structureB: { id: 'moonrock_53051131_0.8709', vpValue: 0.8709, stl: 'models/moonrock_53051131_0.8709.stl' }
    },
    {
        id: 'B2_P27',
        structureA: { id: 'moonrock_20161648_0.7946', vpValue: 0.7946, stl: 'models/moonrock_20161648_0.7946.stl' },
        structureB: { id: 'moonrock_39080843_0.8401', vpValue: 0.8401, stl: 'models/moonrock_39080843_0.8401.stl' }
    },
    {
        id: 'B2_P28',
        structureA: { id: 'moonrock_53110531_0.8371', vpValue: 0.8371, stl: 'models/moonrock_53110531_0.8371.stl' },
        structureB: { id: 'moonrock_48080832_0.8518', vpValue: 0.8518, stl: 'models/moonrock_48080832_0.8518.stl' }
    },
    {
        id: 'B2_P29',
        structureA: { id: 'moonrock_50101030_0.8434', vpValue: 0.8434, stl: 'models/moonrock_50101030_0.8434.stl' },
        structureB: { id: 'moonrock_80040412_0.8971', vpValue: 0.8971, stl: 'models/moonrock_80040412_0.8971.stl' }
    },
    {
        id: 'B2_P30',
        structureA: { id: 'moonrock_20161648_0.7946', vpValue: 0.7946, stl: 'models/moonrock_20161648_0.7946.stl' },
        structureB: { id: 'moonrock_80040412_0.8971', vpValue: 0.8971, stl: 'models/moonrock_80040412_0.8971.stl' }
    },
    {
        id: 'B2_P31',
        structureA: { id: 'namaqualand_50101030adj15_0.7048', vpValue: 0.7048, stl: 'models/namaqualand_50101030adj15_0.7048.stl' },
        structureB: { id: 'namaqualand_25252525_0.7648', vpValue: 0.7648, stl: 'models/namaqualand_25252525_0.7648.stl' }
    },
    {
        id: 'B2_P32',
        structureA: { id: 'namaqualand_25252525_0.7648', vpValue: 0.7648, stl: 'models/namaqualand_25252525_0.7648.stl' },
        structureB: { id: 'namaqualand_5501134_0.8803', vpValue: 0.8803, stl: 'models/namaqualand_5501134_0.8803.stl' }
    },
    {
        id: 'B2_P33',
        structureA: { id: 'namaqualand_0100_0.9660', vpValue: 0.966, stl: 'models/namaqualand_0100_0.9660.stl' },
        structureB: { id: 'namaqualand_0010_0.9997', vpValue: 0.9997, stl: 'models/namaqualand_0010_0.9997.stl' }
    },
    {
        id: 'B2_P34',
        structureA: { id: 'namaqualand_50101030adj45_0.8273', vpValue: 0.8273, stl: 'models/namaqualand_50101030adj45_0.8273.stl' },
        structureB: { id: 'namaqualand_0010_0.9997', vpValue: 0.9997, stl: 'models/namaqualand_0010_0.9997.stl' }
    },
    {
        id: 'B2_P35',
        structureA: { id: 'namaqualand_50101030adj35_0.8264', vpValue: 0.8264, stl: 'models/namaqualand_50101030adj35_0.8264.stl' },
        structureB: { id: 'namaqualand_0100_0.9660', vpValue: 0.966, stl: 'models/namaqualand_0100_0.9660.stl' }
    },
    {
        id: 'B2_P36',
        structureA: { id: 'namaqualand_50101030adj25_0.8084', vpValue: 0.8084, stl: 'models/namaqualand_50101030adj25_0.8084.stl' },
        structureB: { id: 'namaqualand_0010_0.9997', vpValue: 0.9997, stl: 'models/namaqualand_0010_0.9997.stl' }
    },
    {
        id: 'B2_P37',
        structureA: { id: 'namaqualand_25252525_0.7648', vpValue: 0.7648, stl: 'models/namaqualand_25252525_0.7648.stl' },
        structureB: { id: 'namaqualand_7015150_0.8747', vpValue: 0.8747, stl: 'models/namaqualand_7015150_0.8747.stl' }
    },
    {
        id: 'B2_P38',
        structureA: { id: 'namaqualand_50101030adj25_0.8084', vpValue: 0.8084, stl: 'models/namaqualand_50101030adj25_0.8084.stl' },
        structureB: { id: 'namaqualand_5511034_0.8293', vpValue: 0.8293, stl: 'models/namaqualand_5511034_0.8293.stl' }
    },
    {
        id: 'B2_P39',
        structureA: { id: 'namaqualand_25252525_0.7648', vpValue: 0.7648, stl: 'models/namaqualand_25252525_0.7648.stl' },
        structureB: { id: 'namaqualand_50101030adj25_0.8084', vpValue: 0.8084, stl: 'models/namaqualand_50101030adj25_0.8084.stl' }
    },
    {
        id: 'B2_P40',
        structureA: { id: 'namaqualand_50101030adj15_0.7048', vpValue: 0.7048, stl: 'models/namaqualand_50101030adj15_0.7048.stl' },
        structureB: { id: 'namaqualand_1000_0.9731', vpValue: 0.9731, stl: 'models/namaqualand_1000_0.9731.stl' }
    },
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
