import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// All exercises ordered by domain and difficulty
const EXERCISES = [
  { id: 'att_1', domain: 'attention', difficulty: 1, xpReward: 20 },
  { id: 'att_2', domain: 'attention', difficulty: 2, xpReward: 30 },
  { id: 'att_3', domain: 'attention', difficulty: 2, xpReward: 30 },
  { id: 'mem_1', domain: 'memory', difficulty: 1, xpReward: 20 },
  { id: 'mem_2', domain: 'memory', difficulty: 2, xpReward: 35 },
  { id: 'mem_6', domain: 'memory', difficulty: 1, xpReward: 25 },
  { id: 'exe_1', domain: 'executive', difficulty: 2, xpReward: 35 },
  { id: 'exe_2', domain: 'executive', difficulty: 2, xpReward: 30 },
  { id: 'exe_4', domain: 'executive', difficulty: 2, xpReward: 40 },
  { id: 'vis_1', domain: 'visuomotor', difficulty: 1, xpReward: 20 },
  { id: 'vis_2', domain: 'visuomotor', difficulty: 2, xpReward: 35 },
  { id: 'vis_3', domain: 'visuomotor', difficulty: 2, xpReward: 35 },
  { id: 'pro_1', domain: 'processing', difficulty: 1, xpReward: 20 },
  { id: 'pro_3', domain: 'processing', difficulty: 1, xpReward: 25 },
  { id: 'pro_5', domain: 'processing', difficulty: 1, xpReward: 20 },
  { id: 'rea_1', domain: 'reasoning', difficulty: 2, xpReward: 35 },
  { id: 'rea_2', domain: 'reasoning', difficulty: 2, xpReward: 30 },
  { id: 'rea_6', domain: 'reasoning', difficulty: 1, xpReward: 25 },
  { id: 'lan_1', domain: 'language', difficulty: 1, xpReward: 20 },
  { id: 'lan_2', domain: 'language', difficulty: 2, xpReward: 30 },
  { id: 'lan_6', domain: 'language', difficulty: 2, xpReward: 30 },
  { id: 'mat_1', domain: 'math', difficulty: 1, xpReward: 20 },
  { id: 'mat_3', domain: 'math', difficulty: 1, xpReward: 25 },
  { id: 'mat_4', domain: 'math', difficulty: 2, xpReward: 35 },
];

const ALL_DOMAINS = ['attention', 'memory', 'executive', 'visuomotor', 'processing', 'reasoning', 'language', 'math'];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const today = new Date().toISOString().split('T')[0];

    // Check if plan already exists for today
    const existing = await base44.entities.TrainingPlan.filter({ created_by: user.email });
    const todayPlan = existing.find(p => p.date === today);
    if (todayPlan) {
      return Response.json({ plan: todayPlan, cached: true });
    }

    // Fetch last 30 exercise results
    const results = await base44.entities.ExerciseResult.list('-created_date', 50);
    const userResults = results.filter(r => r.created_by === user.email);

    // Calculate average score per domain
    const domainScores = {};
    ALL_DOMAINS.forEach(d => { domainScores[d] = { total: 0, count: 0 }; });

    userResults.forEach(r => {
      if (domainScores[r.domain]) {
        domainScores[r.domain].total += r.score || 0;
        domainScores[r.domain].count += 1;
      }
    });

    // Sort domains: untrained first (count=0), then by lowest avg score
    const ranked = ALL_DOMAINS.map(d => ({
      domain: d,
      avg: domainScores[d].count > 0 ? domainScores[d].total / domainScores[d].count : -1,
      count: domainScores[d].count,
    })).sort((a, b) => {
      if (a.avg === -1 && b.avg !== -1) return -1;
      if (b.avg === -1 && a.avg !== -1) return 1;
      return a.avg - b.avg;
    });

    // Pick top 3 focus domains
    const focusDomains = ranked.slice(0, 3).map(d => d.domain);

    // Build exercise list: 2 from each focus domain (easiest first) + 1 wildcard from 4th domain
    const selectedExercises = [];
    const usedIds = new Set();

    focusDomains.forEach(domain => {
      const domainExs = EXERCISES
        .filter(e => e.domain === domain && !usedIds.has(e.id))
        .sort((a, b) => a.difficulty - b.difficulty);
      domainExs.slice(0, 2).forEach(e => {
        selectedExercises.push(e.id);
        usedIds.add(e.id);
      });
    });

    // Add 1 wildcard from 4th domain for variety
    const wildcardDomain = ranked[3]?.domain;
    if (wildcardDomain) {
      const wildcard = EXERCISES.find(e => e.domain === wildcardDomain && !usedIds.has(e.id));
      if (wildcard) selectedExercises.push(wildcard.id);
    }

    // Create plan
    const plan = await base44.entities.TrainingPlan.create({
      date: today,
      exercises: selectedExercises,
      focus_domains: focusDomains,
      completed_exercises: [],
      generated_by: 'neuro',
    });

    return Response.json({ plan, cached: false });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});