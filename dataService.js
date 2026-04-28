/**
 * dataService.js
 * Handles saving survey results to Supabase.
 *
 * ── Setup Instructions ──────────────────────────────────────
 * 1. Go to https://supabase.com and create a free project.
 * 2. In SQL Editor, run the table creation SQL (see guide).
 * 3. Replace SUPABASE_URL and SUPABASE_ANON_KEY below.
 * ─────────────────────────────────────────────────────────────
 */

// ⬇️ Replace these two values with your Supabase project credentials
const SUPABASE_URL = 'YOUR_SUPABASE_URL';       // e.g. https://abcdefg.supabase.co
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // e.g. eyJhbGciOiJIUzI1NiIs...

const IS_CONFIGURED = !SUPABASE_URL.startsWith('YOUR_');

export const dataService = {
    /**
     * Submit results to Supabase via REST API.
     * Falls back gracefully if Supabase is not configured.
     */
    async submitResults(results) {
        if (!IS_CONFIGURED) {
            console.warn('[dataService] Supabase not configured. Skipping server submission.');
            console.log('[dataService] Results available for local download:', results);
            return { success: true, local: true };
        }

        console.log('[dataService] Submitting results to Supabase...');

        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/study_results`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                    participant_id: results.participantId,
                    age_range: results.demographics?.ageRange || null,
                    gender: results.demographics?.gender || null,
                    experience: results.demographics?.experience || null,
                    block1_results: results.block1,
                    block2_results: results.block2,
                    full_data: results,
                    submitted_at: new Date().toISOString()
                })
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`HTTP ${response.status}: ${errText}`);
            }

            console.log('[dataService] ✅ Successfully submitted to Supabase.');
            return { success: true };
        } catch (error) {
            console.error('[dataService] ❌ Submission failed:', error);
            return { success: false, error: error.message };
        }
    }
};
