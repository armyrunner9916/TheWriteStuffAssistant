#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = 'https://oirtcplqedetfhzrdgas.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Legacy query type mappings to new sections and subcategories
const LEGACY_MAPPINGS = {
  // Prose mappings
  'world_building': { section: 'prose', subcategory: 'World Building' },
  'character_development': { section: 'prose', subcategory: 'Character Development' },
  'style_enhancement': { section: 'prose', subcategory: 'Style Enhancement' },
  'story_outline': { section: 'prose', subcategory: 'Story Outline' },
  
  // Poetry mappings
  'poetry_form_structure': { section: 'poetry', subcategory: 'Form & Structure' },
  'poetry_language_imagery': { section: 'poetry', subcategory: 'Language & Imagery' },
  'poetry_rhyme_rhythm': { section: 'poetry', subcategory: 'Rhyme & Rhythm' },
  'poetry_style_voice': { section: 'poetry', subcategory: 'Style & Voice' },
  'poetry_revision_clarity': { section: 'poetry', subcategory: 'Revision & Clarity' },
  
  // Nonfiction mappings
  'research_fact_checking': { section: 'nonfiction', subcategory: 'Research & Fact-Checking' },
  'organization_structure': { section: 'nonfiction', subcategory: 'Organization & Structure' },
  'voice_tone_development': { section: 'nonfiction', subcategory: 'Voice & Tone' },
  'clarity_conciseness': { section: 'nonfiction', subcategory: 'Clarity & Conciseness' },
  'engaging_openings_conclusions': { section: 'nonfiction', subcategory: 'Engaging Openings & Conclusions' },
  
  // Content mappings
  'audience_platform_strategy': { section: 'content', subcategory: 'Audience & Platform Strategy' },
  'content_idea_generation': { section: 'content', subcategory: 'Content Idea Generation' },
  'scripting_storyboarding': { section: 'content', subcategory: 'Scripting & Storyboarding' },
  'filming_production_tips': { section: 'content', subcategory: 'Filming & Production Tips' },
  'posting_optimization_growth': { section: 'content', subcategory: 'Posting, Optimization & Growth' },
  
  // Songwriting mappings
  'theme_concept_development': { section: 'songwriting', subcategory: 'Theme & Concept Development' },
  'lyrics_wordcraft': { section: 'songwriting', subcategory: 'Lyrics & Wordcraft' },
  'melody_hook_creation': { section: 'songwriting', subcategory: 'Melody & Hook Creation' },
  'song_structure_arrangement': { section: 'songwriting', subcategory: 'Song Structure & Arrangement' },
  'style_genre_performance_tips': { section: 'songwriting', subcategory: 'Style, Genre & Performance Tips' },
  
  // Stage & Screen mappings
  'scene_structure_pacing': { section: 'stage', subcategory: 'Scene Structure & Pacing' },
  'dialogue_crafting': { section: 'stage', subcategory: 'Dialogue Crafting' },
  'character_arcs_dynamics': { section: 'stage', subcategory: 'Character Arcs & Dynamics' },
  'visual_staging_suggestions': { section: 'stage', subcategory: 'Visual & Staging Suggestions' },
};

function cleanText(text) {
  if (!text) return '';
  
  return text
    // Remove metadata lines
    .replace(/^Output Type Requested:.*$/gm, '')
    .replace(/^Creative Parameters:.*$/gm, '')
    .replace(/^- \*\*[^:]+:\*\* .+$/gm, '')
    // Remove form labels
    .replace(/^Genre: .+$/gm, '')
    .replace(/^Tone: .+$/gm, '')
    .replace(/^Setting: .+$/gm, '')
    .replace(/^Theme: .+$/gm, '')
    .replace(/^Length: .+$/gm, '')
    .replace(/^Format: .+$/gm, '')
    .replace(/^Audience: .+$/gm, '')
    .replace(/^Platform: .+$/gm, '')
    .replace(/^Budget: .+$/gm, '')
    // Remove empty lines and trim
    .replace(/^\s*$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function reconstructPrompt(queryText, queryType) {
  const cleaned = cleanText(queryText);
  
  if (cleaned && cleaned.length > 10) {
    return cleaned;
  }
  
  // Fallback: create a basic prompt based on the query type
  const mapping = LEGACY_MAPPINGS[queryType];
  if (mapping) {
    return `Generate ${mapping.subcategory.toLowerCase()} content.`;
  }
  
  return 'Generate creative content.';
}

async function migrateLegacyHistory() {
  console.log('Starting legacy history migration...');
  
  try {
    // Fetch all legacy history entries
    const { data: legacyEntries, error: fetchError } = await supabase
      .from('query_history')
      .select('*')
      .in('query_type', Object.keys(LEGACY_MAPPINGS))
      .order('created_at', { ascending: true });

    if (fetchError) {
      throw fetchError;
    }

    console.log(`Found ${legacyEntries.length} legacy entries to migrate`);

    const migratedEntries = [];
    const processedHashes = new Set();

    for (const entry of legacyEntries) {
      const mapping = LEGACY_MAPPINGS[entry.query_type];
      if (!mapping) continue;

      // Create a hash to avoid duplicates
      const entryHash = crypto
        .createHash('md5')
        .update(`${entry.user_id}-${entry.query_text}-${entry.response_text}`)
        .digest('hex');

      if (processedHashes.has(entryHash)) {
        console.log(`Skipping duplicate entry: ${entry.id}`);
        continue;
      }

      processedHashes.add(entryHash);

      const cleanPrompt = reconstructPrompt(entry.query_text, entry.query_type);
      const cleanResponse = cleanText(entry.response_text);

      const migratedEntry = {
        user_id: entry.user_id,
        query_type: mapping.section,
        query_text: cleanPrompt,
        response_text: cleanResponse,
        conversation_id: entry.conversation_id || crypto.randomUUID(),
        created_at: entry.created_at,
      };

      migratedEntries.push(migratedEntry);
    }

    if (migratedEntries.length === 0) {
      console.log('No entries to migrate');
      return;
    }

    // Insert migrated entries in batches
    const batchSize = 100;
    let totalInserted = 0;

    for (let i = 0; i < migratedEntries.length; i += batchSize) {
      const batch = migratedEntries.slice(i, i + batchSize);
      
      const { data, error: insertError } = await supabase
        .from('query_history')
        .insert(batch)
        .select('id');

      if (insertError) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, insertError);
        continue;
      }

      totalInserted += data.length;
      console.log(`Migrated batch ${i / batchSize + 1}: ${data.length} entries`);
    }

    console.log(`Migration complete! Migrated ${totalInserted} entries total.`);
    
    // Optionally delete legacy entries (uncomment if desired)
    // console.log('Cleaning up legacy entries...');
    // const { error: deleteError } = await supabase
    //   .from('query_history')
    //   .delete()
    //   .in('query_type', Object.keys(LEGACY_MAPPINGS));
    
    // if (deleteError) {
    //   console.error('Error deleting legacy entries:', deleteError);
    // } else {
    //   console.log('Legacy entries cleaned up successfully');
    // }

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateLegacyHistory();
}