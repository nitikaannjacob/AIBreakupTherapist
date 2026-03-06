import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  SafeAreaView, Animated, Modal, FlatList, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Theme ──────────────────────────────────────────────────
const C = {
  bg:        '#080b12',
  surface:   '#0f1420',
  card:      '#141926',
  border:    '#1c2538',
  accent:    '#4f8ef7',
  green:     '#3ecf8e',
  purple:    '#a78bfa',
  orange:    '#fb923c',
  pink:      '#f472b6',
  yellow:    '#fbbf24',
  text:      '#e2e8f0',
  muted:     '#64748b',
  dim:       '#1e2a40',
};

// ─── Data ───────────────────────────────────────────────────
const MOODS = [
  { id: 'great',   label: 'Great',    emoji: '😄', color: C.green  },
  { id: 'good',    label: 'Good',     emoji: '🙂', color: C.accent },
  { id: 'meh',     label: 'Meh',      emoji: '😐', color: C.yellow },
  { id: 'low',     label: 'Low',      emoji: '😔', color: C.purple },
  { id: 'anxious', label: 'Anxious',  emoji: '😰', color: C.orange },
  { id: 'angry',   label: 'Angry',    emoji: '😤', color: C.pink   },
];

const WORKOUTS = {
  great: {
    title: 'Power & Energy',
    subtitle: "You're glowing — channel it!",
    color: C.green,
    exercises: [
      { name: 'Jump Squats',      sets: '3x12', rest: '45s', muscle: 'Legs',  emoji: '🦵' },
      { name: 'Push-Ups',         sets: '3x10', rest: '45s', muscle: 'Chest', emoji: '💪' },
      { name: 'Dumbbell Rows',    sets: '3x12', rest: '45s', muscle: 'Back',  emoji: '🏋️' },
      { name: 'Plank Hold',       sets: '3x30s',rest: '30s', muscle: 'Core',  emoji: '🧱' },
      { name: 'Jumping Jacks',    sets: '3x20', rest: '30s', muscle: 'Cardio',emoji: '⚡' },
    ],
  },
  good: {
    title: 'Balanced Flow',
    subtitle: 'Steady energy, steady gains.',
    color: C.accent,
    exercises: [
      { name: 'Bodyweight Squats',sets: '3x15', rest: '45s', muscle: 'Legs',  emoji: '🦵' },
      { name: 'Incline Push-Ups', sets: '3x10', rest: '45s', muscle: 'Chest', emoji: '💪' },
      { name: 'Glute Bridges',    sets: '3x15', rest: '30s', muscle: 'Glutes',emoji: '🍑' },
      { name: 'Bird Dog',         sets: '3x10', rest: '30s', muscle: 'Core',  emoji: '🧘' },
      { name: 'Wall Sit',         sets: '3x30s',rest: '30s', muscle: 'Legs',  emoji: '🧱' },
    ],
  },
  meh: {
    title: 'Gentle Activation',
    subtitle: 'Movement shifts your mood.',
    color: C.yellow,
    exercises: [
      { name: 'Morning Stretches',sets: '5 min',rest: '—',   muscle: 'Full', emoji: '🌅' },
      { name: 'Walking Lunges',   sets: '2x10', rest: '45s', muscle: 'Legs', emoji: '🚶' },
      { name: 'Knee Push-Ups',    sets: '2x10', rest: '45s', muscle: 'Chest',emoji: '💪' },
      { name: 'Cat-Cow Stretch',  sets: '2x10', rest: '30s', muscle: 'Spine',emoji: '🐱' },
      { name: 'Light Walk',       sets: '10min',rest: '—',   muscle: 'Cardio',emoji: '🌿' },
    ],
  },
  low: {
    title: 'Restorative Flow',
    subtitle: 'Be gentle — movement heals.',
    color: C.purple,
    exercises: [
      { name: 'Deep Breathing',   sets: '5 min',rest: '—',   muscle: 'Mind', emoji: '🌬️' },
      { name: 'Child\'s Pose',    sets: '3 min',rest: '—',   muscle: 'Spine',emoji: '🧘' },
      { name: 'Gentle Neck Rolls',sets: '2 min',rest: '—',   muscle: 'Neck', emoji: '💆' },
      { name: 'Seated Forward Fold',sets:'3min',rest: '—',   muscle: 'Hams', emoji: '🌿' },
      { name: 'Savasana Rest',    sets: '5 min',rest: '—',   muscle: 'Full', emoji: '💤' },
    ],
  },
  anxious: {
    title: 'Calm & Ground',
    subtitle: 'Release the tension.',
    color: C.orange,
    exercises: [
      { name: '4-7-8 Breathing',  sets: '5 reps',rest: '—',  muscle: 'Mind', emoji: '🌬️' },
      { name: 'Slow Squats',      sets: '2x10',  rest: '60s', muscle: 'Legs', emoji: '🦵' },
      { name: 'Shoulder Rolls',   sets: '2 min', rest: '—',   muscle: 'Shoulders',emoji:'🔄'},
      { name: 'Grounding Walk',   sets: '10 min',rest: '—',   muscle: 'Cardio',emoji:'🌳'},
      { name: 'Body Scan',        sets: '5 min', rest: '—',   muscle: 'Mind', emoji: '🧘' },
    ],
  },
  angry: {
    title: 'Release & Reset',
    subtitle: 'Burn it out the healthy way.',
    color: C.pink,
    exercises: [
      { name: 'Shadow Boxing',    sets: '3x1min',rest: '30s', muscle: 'Full', emoji: '🥊' },
      { name: 'Burpees',          sets: '3x8',   rest: '60s', muscle: 'Full', emoji: '💥' },
      { name: 'High Knees',       sets: '3x30s', rest: '30s', muscle: 'Cardio',emoji:'🔥'},
      { name: 'Mountain Climbers',sets: '3x20',  rest: '30s', muscle: 'Core', emoji: '⛰️' },
      { name: 'Cool-down Stretch',sets: '5 min', rest: '—',   muscle: 'Full', emoji: '🌊' },
    ],
  },
};

const BREATHWORK = [
  {
    id: 'box',
    name: 'Box Breathing',
    desc: 'Military stress relief technique',
    color: C.accent,
    emoji: '🟦',
    steps: ['Inhale 4s', 'Hold 4s', 'Exhale 4s', 'Hold 4s'],
    durations: [4, 4, 4, 4],
    benefit: 'Reduces anxiety & sharpens focus',
  },
  {
    id: '478',
    name: '4-7-8 Breathing',
    desc: 'Natural tranquilizer for the nervous system',
    color: C.purple,
    emoji: '💜',
    steps: ['Inhale 4s', 'Hold 7s', 'Exhale 8s'],
    durations: [4, 7, 8],
    benefit: 'Calms anxiety & aids sleep',
  },
  {
    id: 'belly',
    name: 'Belly Breathing',
    desc: 'Deep diaphragmatic breathing',
    color: C.green,
    emoji: '🌿',
    steps: ['Inhale deep 5s', 'Pause 2s', 'Exhale slow 6s'],
    durations: [5, 2, 6],
    benefit: 'Reduces tension & lowers heart rate',
  },
];

const MEDITATIONS = [
  { id: 'm1', name: 'Body Scan',      duration: '5 min', emoji: '🧘', color: C.purple,
    guide: ['Find a comfortable position and close your eyes.',
            'Start at the top of your head. Notice any tension.',
            'Slowly move awareness down to your face, jaw, neck.',
            'Continue down through your chest, arms, belly.',
            'Move through your hips, thighs, knees, feet.',
            'Feel the whole body at once. Breathe gently.',
            'When ready, slowly open your eyes.'] },
  { id: 'm2', name: 'Loving Kindness',duration: '7 min', emoji: '💖', color: C.pink,
    guide: ['Sit comfortably. Take 3 deep breaths.',
            'Bring to mind someone you love easily.',
            'Silently say: "May you be happy. May you be well."',
            'Now direct that same warmth to yourself.',
            '"May I be happy. May I be peaceful. May I be free."',
            'Extend it to someone neutral, then someone difficult.',
            'Finally, extend it to all beings everywhere.'] },
  { id: 'm3', name: 'Breath Anchor',  duration: '3 min', emoji: '⚓', color: C.accent,
    guide: ['Sit or lie down comfortably.',
            'Bring full attention to your breath.',
            'Notice the sensation of air entering your nose.',
            'Feel your chest and belly rise and fall.',
            'When your mind wanders, gently return to the breath.',
            'No judgment — wandering is normal. Just return.',
            'Rest here, breathing naturally.'] },
];

// ─── Breathwork Modal ────────────────────────────────────────
function BreathModal({ exercise, onClose }) {
  const [phase, setPhase]       = useState(0);
  const [counter, setCounter]   = useState(exercise.durations[0]);
  const [running, setRunning]   = useState(false);
  const [cycles, setCycles]     = useState(0);
  const scaleAnim               = useRef(new Animated.Value(1)).current;
  const intervalRef             = useRef(null);

  const startAnim = (dur) => {
    Animated.timing(scaleAnim, {
      toValue: phase % 2 === 0 ? 1.5 : 1,
      duration: dur * 1000,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    if (!running) return;
    startAnim(exercise.durations[phase]);
    intervalRef.current = setInterval(() => {
      setCounter(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          const next = (phase + 1) % exercise.steps.length;
          setPhase(next);
          if (next === 0) setCycles(c => c + 1);
          setCounter(exercise.durations[next]);
          return exercise.durations[next];
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running, phase]);

  const toggle = () => {
    if (running) clearInterval(intervalRef.current);
    setRunning(r => !r);
  };

  const reset = () => {
    setRunning(false);
    clearInterval(intervalRef.current);
    setPhase(0);
    setCounter(exercise.durations[0]);
    setCycles(0);
    scaleAnim.setValue(1);
  };

  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <View style={bm.overlay}>
        <View style={bm.sheet}>
          <TouchableOpacity style={bm.closeBtn} onPress={onClose}>
            <Text style={bm.closeText}>✕</Text>
          </TouchableOpacity>

          <Text style={bm.title}>{exercise.emoji} {exercise.name}</Text>
          <Text style={bm.benefit}>{exercise.benefit}</Text>

          {/* Breathing circle */}
          <View style={bm.circleWrap}>
            <Animated.View style={[bm.circle, { backgroundColor: exercise.color + '22', borderColor: exercise.color, transform: [{ scale: scaleAnim }] }]}>
              <Text style={[bm.phaseLabel, { color: exercise.color }]}>{exercise.steps[phase]}</Text>
              <Text style={[bm.counter, { color: exercise.color }]}>{counter}</Text>
            </Animated.View>
          </View>

          <Text style={bm.cycles}>Cycles completed: <Text style={{ color: exercise.color }}>{cycles}</Text></Text>

          {/* Steps */}
          <View style={bm.stepsRow}>
            {exercise.steps.map((s, i) => (
              <View key={i} style={[bm.stepChip, i === phase && running && { backgroundColor: exercise.color + '33', borderColor: exercise.color }]}>
                <Text style={[bm.stepText, i === phase && running && { color: exercise.color }]}>{s}</Text>
              </View>
            ))}
          </View>

          <View style={bm.btnRow}>
            <TouchableOpacity style={[bm.btn, { backgroundColor: exercise.color }]} onPress={toggle}>
              <Text style={bm.btnText}>{running ? '⏸ Pause' : '▶ Start'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={bm.resetBtn} onPress={reset}>
              <Text style={bm.resetText}>↺ Reset</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const bm = StyleSheet.create({
  overlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  sheet:      { backgroundColor: C.card, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 28, paddingBottom: 48 },
  closeBtn:   { alignSelf: 'flex-end', padding: 4 },
  closeText:  { color: C.muted, fontSize: 18 },
  title:      { fontSize: 24, fontWeight: '800', color: C.text, marginBottom: 6 },
  benefit:    { fontSize: 14, color: C.muted, marginBottom: 28 },
  circleWrap: { alignItems: 'center', marginBottom: 24 },
  circle:     { width: 160, height: 160, borderRadius: 80, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  phaseLabel: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
  counter:    { fontSize: 40, fontWeight: '900' },
  cycles:     { textAlign: 'center', color: C.muted, fontSize: 13, marginBottom: 16 },
  stepsRow:   { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 28 },
  stepChip:   { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border },
  stepText:   { color: C.muted, fontSize: 12, fontWeight: '600' },
  btnRow:     { flexDirection: 'row', gap: 12 },
  btn:        { flex: 1, paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  btnText:    { color: '#fff', fontWeight: '800', fontSize: 16 },
  resetBtn:   { paddingVertical: 16, paddingHorizontal: 20, borderRadius: 14, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, alignItems: 'center' },
  resetText:  { color: C.muted, fontWeight: '700', fontSize: 15 },
});

// ─── Meditation Modal ────────────────────────────────────────
function MeditationModal({ med, onClose }) {
  const [step, setStep] = useState(0);
  const fadeAnim        = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, [step]);

  const next = () => {
    if (step < med.guide.length - 1) {
      fadeAnim.setValue(0);
      setStep(s => s + 1);
    } else {
      Alert.alert('🌟 Well done', 'You completed the meditation. Take a moment to notice how you feel.');
      onClose();
    }
  };

  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <View style={mm.overlay}>
        <View style={mm.card}>
          <TouchableOpacity style={mm.closeBtn} onPress={onClose}><Text style={mm.closeText}>✕</Text></TouchableOpacity>
          <Text style={mm.title}>{med.emoji} {med.name}</Text>
          <Text style={mm.duration}>{med.duration} • Step {step + 1}/{med.guide.length}</Text>

          <View style={mm.progressRow}>
            {med.guide.map((_, i) => (
              <View key={i} style={[mm.dot, i <= step && { backgroundColor: med.color }]} />
            ))}
          </View>

          <Animated.View style={{ opacity: fadeAnim, flex: 1, justifyContent: 'center' }}>
            <Text style={[mm.guideText, { color: med.color }]}>{med.guide[step]}</Text>
          </Animated.View>

          <TouchableOpacity style={[mm.btn, { backgroundColor: med.color }]} onPress={next}>
            <Text style={mm.btnText}>{step < med.guide.length - 1 ? 'Next →' : '✓ Complete'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const mm = StyleSheet.create({
  overlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', padding: 24 },
  card:        { backgroundColor: C.card, borderRadius: 24, padding: 28, minHeight: 380 },
  closeBtn:    { alignSelf: 'flex-end' },
  closeText:   { color: C.muted, fontSize: 18 },
  title:       { fontSize: 24, fontWeight: '800', color: C.text, marginTop: 8, marginBottom: 4 },
  duration:    { fontSize: 13, color: C.muted, marginBottom: 20 },
  progressRow: { flexDirection: 'row', gap: 6, marginBottom: 28 },
  dot:         { flex: 1, height: 3, borderRadius: 2, backgroundColor: C.border },
  guideText:   { fontSize: 20, fontWeight: '600', lineHeight: 30, textAlign: 'center', paddingHorizontal: 8 },
  btn:         { marginTop: 32, paddingVertical: 16, borderRadius: 14, alignItems: 'center' },
  btnText:     { color: '#fff', fontWeight: '800', fontSize: 16 },
});

// ─── Streak helpers ──────────────────────────────────────────
const TODAY = new Date().toISOString().split('T')[0];

async function loadStreak() {
  try {
    const raw = await AsyncStorage.getItem('healing_streak');
    if (!raw) return { count: 0, lastDate: null, history: [] };
    return JSON.parse(raw);
  } catch { return { count: 0, lastDate: null, history: [] }; }
}

async function markToday(streakData) {
  if (streakData.lastDate === TODAY) return streakData;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yStr = yesterday.toISOString().split('T')[0];
  const newCount = streakData.lastDate === yStr ? streakData.count + 1 : 1;
  const updated = { count: newCount, lastDate: TODAY, history: [...(streakData.history || []).slice(-29), TODAY] };
  await AsyncStorage.setItem('healing_streak', JSON.stringify(updated));
  return updated;
}

// ─── MAIN SCREEN ─────────────────────────────────────────────
export default function HealingScreen() {
  const [tab, setTab]               = useState('today');    // today | breathe | meditate | progress
  const [mood, setMood]             = useState(null);
  const [workout, setWorkout]       = useState(null);
  const [activeBreath, setActiveBreath] = useState(null);
  const [activeMed, setActiveMed]   = useState(null);
  const [streak, setStreak]         = useState({ count: 0, lastDate: null, history: [] });
  const [completedExercises, setCompletedExercises] = useState([]);
  const fadeAnim                    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadStreak().then(setStreak);
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  const selectMood = async (m) => {
    setMood(m);
    setWorkout(WORKOUTS[m.id]);
    setCompletedExercises([]);
    const updated = await markToday(streak);
    setStreak(updated);
  };

  const toggleExercise = (name) => {
    setCompletedExercises(prev =>
      prev.includes(name) ? prev.filter(e => e !== name) : [...prev, name]
    );
  };

  const completionPct = workout
    ? Math.round((completedExercises.length / workout.exercises.length) * 100)
    : 0;

  // ── TAB: TODAY ─────────────────────────────────────────────
  const renderToday = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Streak banner */}
      <View style={[s.streakBanner, { borderColor: C.yellow + '50' }]}>
        <Text style={s.streakFire}>🔥</Text>
        <View style={{ flex: 1 }}>
          <Text style={s.streakCount}>{streak.count} Day Streak</Text>
          <Text style={s.streakSub}>{streak.lastDate === TODAY ? 'Active today ✓' : 'Check in to keep your streak!'}</Text>
        </View>
        <Text style={[s.streakNum, { color: C.yellow }]}>{streak.count}</Text>
      </View>

      {/* Mood selector */}
      <Text style={s.sectionTitle}>How are you feeling right now?</Text>
      <View style={s.moodGrid}>
        {MOODS.map(m => (
          <TouchableOpacity
            key={m.id}
            style={[s.moodBtn, mood?.id === m.id && { borderColor: m.color, backgroundColor: m.color + '18' }]}
            onPress={() => selectMood(m)}
          >
            <Text style={s.moodEmoji}>{m.emoji}</Text>
            <Text style={[s.moodLabel, mood?.id === m.id && { color: m.color }]}>{m.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Workout plan */}
      {workout && (
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={[s.workoutHeader, { borderLeftColor: workout.color }]}>
            <View>
              <Text style={[s.workoutTitle, { color: workout.color }]}>{workout.title}</Text>
              <Text style={s.workoutSubtitle}>{workout.subtitle}</Text>
            </View>
            {completionPct > 0 && (
              <View style={[s.pctBadge, { backgroundColor: workout.color + '22', borderColor: workout.color }]}>
                <Text style={[s.pctText, { color: workout.color }]}>{completionPct}%</Text>
              </View>
            )}
          </View>

          {/* Progress bar */}
          <View style={s.progressBarBg}>
            <View style={[s.progressBarFill, { width: `${completionPct}%`, backgroundColor: workout.color }]} />
          </View>

          {workout.exercises.map((ex, i) => {
            const done = completedExercises.includes(ex.name);
            return (
              <TouchableOpacity
                key={i}
                style={[s.exerciseCard, done && { opacity: 0.6, backgroundColor: workout.color + '10', borderColor: workout.color + '40' }]}
                onPress={() => toggleExercise(ex.name)}
              >
                <View style={[s.exEmoji, { backgroundColor: workout.color + '15' }]}>
                  <Text style={{ fontSize: 20 }}>{ex.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.exName, done && { textDecorationLine: 'line-through', color: C.muted }]}>{ex.name}</Text>
                  <Text style={s.exMeta}>{ex.muscle} • {ex.rest} rest</Text>
                </View>
                <View style={[s.setsBadge, { backgroundColor: done ? workout.color : C.dim }]}>
                  <Text style={[s.setsText, { color: done ? '#fff' : C.muted }]}>
                    {done ? '✓' : ex.sets}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}

          {completionPct === 100 && (
            <View style={s.completeBanner}>
              <Text style={s.completeText}>🎉 Workout complete! Amazing work today.</Text>
            </View>
          )}
        </Animated.View>
      )}

      {!mood && (
        <View style={s.emptyState}>
          <Text style={s.emptyEmoji}>🌱</Text>
          <Text style={s.emptyTitle}>Check in to start</Text>
          <Text style={s.emptySub}>Select your mood above to get a personalized workout plan for today.</Text>
        </View>
      )}
      <View style={{ height: 40 }} />
    </ScrollView>
  );

  // ── TAB: BREATHE ───────────────────────────────────────────
  const renderBreathe = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={s.sectionTitle}>Breathwork Exercises</Text>
      <Text style={s.sectionSub}>Controlled breathing calms your nervous system in minutes.</Text>
      {BREATHWORK.map(ex => (
        <TouchableOpacity key={ex.id} style={s.breathCard} onPress={() => setActiveBreath(ex)}>
          <View style={[s.breathIcon, { backgroundColor: ex.color + '18' }]}>
            <Text style={{ fontSize: 28 }}>{ex.emoji}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.breathName}>{ex.name}</Text>
            <Text style={s.breathDesc}>{ex.desc}</Text>
            <Text style={[s.breathBenefit, { color: ex.color }]}>{ex.benefit}</Text>
          </View>
          <View style={[s.startChip, { backgroundColor: ex.color + '18', borderColor: ex.color }]}>
            <Text style={[s.startChipText, { color: ex.color }]}>Start</Text>
          </View>
        </TouchableOpacity>
      ))}
      <View style={{ height: 40 }} />
    </ScrollView>
  );

  // ── TAB: MEDITATE ──────────────────────────────────────────
  const renderMeditate = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Text style={s.sectionTitle}>Guided Meditation</Text>
      <Text style={s.sectionSub}>Step-by-step guides to quiet your mind.</Text>
      {MEDITATIONS.map(med => (
        <TouchableOpacity key={med.id} style={s.medCard} onPress={() => setActiveMed(med)}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <View style={[s.medIcon, { backgroundColor: med.color + '18' }]}>
              <Text style={{ fontSize: 24 }}>{med.emoji}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.medName}>{med.name}</Text>
              <Text style={[s.medDuration, { color: med.color }]}>{med.duration}</Text>
            </View>
            <View style={[s.startChip, { backgroundColor: med.color + '18', borderColor: med.color }]}>
              <Text style={[s.startChipText, { color: med.color }]}>Begin</Text>
            </View>
          </View>
          <View style={s.guidePreview}>
            {med.guide.slice(0, 2).map((g, i) => (
              <Text key={i} style={s.guidePreviewText}>• {g}</Text>
            ))}
            <Text style={[s.guidePreviewText, { color: med.color }]}>+{med.guide.length - 2} more steps...</Text>
          </View>
        </TouchableOpacity>
      ))}
      <View style={{ height: 40 }} />
    </ScrollView>
  );

  // ── TAB: PROGRESS ──────────────────────────────────────────
  const renderProgress = () => {
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const str = d.toISOString().split('T')[0];
      return { date: str, label: ['Su','Mo','Tu','We','Th','Fr','Sa'][d.getDay()], active: (streak.history || []).includes(str) };
    });
    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={s.sectionTitle}>Your Healing Progress</Text>

        {/* Streak card */}
        <View style={[s.bigCard, { borderColor: C.yellow + '50' }]}>
          <Text style={s.bigCardEmoji}>🔥</Text>
          <Text style={[s.bigCardNum, { color: C.yellow }]}>{streak.count}</Text>
          <Text style={s.bigCardLabel}>Day Streak</Text>
          <Text style={s.bigCardSub}>Keep showing up for yourself</Text>
        </View>

        {/* Week calendar */}
        <Text style={[s.sectionTitle, { marginTop: 24 }]}>This Week</Text>
        <View style={s.weekRow}>
          {last7.map((d, i) => (
            <View key={i} style={[s.dayCol, d.active && { backgroundColor: C.green + '18' }]}>
              <Text style={s.dayLabel}>{d.label}</Text>
              <View style={[s.dayDot, d.active && { backgroundColor: C.green }]}>
                {d.active && <Text style={{ fontSize: 10 }}>✓</Text>}
              </View>
            </View>
          ))}
        </View>

        {/* Stats */}
        <Text style={[s.sectionTitle, { marginTop: 24 }]}>Stats</Text>
        <View style={s.statsRow}>
          {[
            { label: 'Total Check-ins', value: (streak.history || []).length, color: C.accent,  emoji: '📅' },
            { label: 'Best Streak',     value: streak.count,                  color: C.yellow, emoji: '🏆' },
            { label: 'This Week',       value: last7.filter(d => d.active).length, color: C.green, emoji: '📈' },
          ].map((stat, i) => (
            <View key={i} style={[s.statCard, { borderColor: stat.color + '40' }]}>
              <Text style={{ fontSize: 22 }}>{stat.emoji}</Text>
              <Text style={[s.statNum, { color: stat.color }]}>{stat.value}</Text>
              <Text style={s.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Tips */}
        <Text style={[s.sectionTitle, { marginTop: 24 }]}>Daily Reminders</Text>
        {[
          { emoji: '💧', tip: 'Drink at least 8 glasses of water today.' },
          { emoji: '😴', tip: '7–9 hours of sleep is when your body heals.' },
          { emoji: '🌞', tip: '10 minutes of sunlight boosts serotonin.' },
          { emoji: '📵', tip: 'Try 30 min phone-free time before bed.' },
        ].map((t, i) => (
          <View key={i} style={s.tipRow}>
            <Text style={s.tipEmoji}>{t.emoji}</Text>
            <Text style={s.tipText}>{t.tip}</Text>
          </View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    );
  };

  // ── TABS CONFIG ────────────────────────────────────────────
  const TABS = [
    { id: 'today',    label: "Today's Plan", emoji: '🏋️' },
    { id: 'breathe',  label: 'Breathe',      emoji: '🌬️' },
    { id: 'meditate', label: 'Meditate',     emoji: '🧘' },
    { id: 'progress', label: 'Progress',     emoji: '📈' },
  ];

  return (
    <SafeAreaView style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerTitle}>Healing Journey</Text>
        <Text style={s.headerSub}>Mind + Body Recovery</Text>
      </View>

      {/* Tab bar */}
      <View style={s.tabBar}>
        {TABS.map(t => (
          <TouchableOpacity
            key={t.id}
            style={[s.tabBtn, tab === t.id && s.tabBtnActive]}
            onPress={() => setTab(t.id)}
          >
            <Text style={s.tabEmoji}>{t.emoji}</Text>
            <Text style={[s.tabLabel, tab === t.id && s.tabLabelActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <View style={s.content}>
        {tab === 'today'    && renderToday()}
        {tab === 'breathe'  && renderBreathe()}
        {tab === 'meditate' && renderMeditate()}
        {tab === 'progress' && renderProgress()}
      </View>

      {/* Modals */}
      {activeBreath && <BreathModal exercise={activeBreath} onClose={() => setActiveBreath(null)} />}
      {activeMed    && <MeditationModal med={activeMed}    onClose={() => setActiveMed(null)} />}
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────
const s = StyleSheet.create({
  container:  { flex: 1, backgroundColor: C.bg },

  header:     { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 12 },
  headerTitle:{ fontSize: 28, fontWeight: '900', color: C.text },
  headerSub:  { fontSize: 13, color: C.muted, marginTop: 2 },

  tabBar: {
    flexDirection: 'row', paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: C.border,
    backgroundColor: C.surface,
  },
  tabBtn:      { flex: 1, alignItems: 'center', paddingVertical: 10, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabBtnActive:{ borderBottomColor: C.accent },
  tabEmoji:    { fontSize: 16, marginBottom: 2 },
  tabLabel:    { fontSize: 10, color: C.muted, fontWeight: '600' },
  tabLabelActive: { color: C.accent },

  content:    { flex: 1, paddingHorizontal: 20, paddingTop: 20 },

  sectionTitle: { fontSize: 18, fontWeight: '800', color: C.text, marginBottom: 6 },
  sectionSub:   { fontSize: 13, color: C.muted, marginBottom: 16, lineHeight: 18 },

  // Streak banner
  streakBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: C.card, borderRadius: 16, padding: 16,
    borderWidth: 1, marginBottom: 24,
  },
  streakFire:  { fontSize: 28 },
  streakCount: { fontSize: 15, fontWeight: '800', color: C.text },
  streakSub:   { fontSize: 12, color: C.muted, marginTop: 2 },
  streakNum:   { fontSize: 32, fontWeight: '900' },

  // Mood grid
  moodGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  moodBtn: {
    width: '30%', alignItems: 'center', paddingVertical: 12,
    backgroundColor: C.card, borderRadius: 14,
    borderWidth: 1.5, borderColor: C.border,
  },
  moodEmoji:   { fontSize: 26, marginBottom: 4 },
  moodLabel:   { fontSize: 12, fontWeight: '600', color: C.muted },

  // Workout
  workoutHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: C.card, borderRadius: 14, padding: 16,
    borderLeftWidth: 4, marginBottom: 8,
  },
  workoutTitle:   { fontSize: 18, fontWeight: '800', color: C.text },
  workoutSubtitle:{ fontSize: 13, color: C.muted, marginTop: 2 },
  pctBadge:       { borderWidth: 1, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  pctText:        { fontSize: 14, fontWeight: '800' },

  progressBarBg:  { height: 4, backgroundColor: C.dim, borderRadius: 2, marginBottom: 12 },
  progressBarFill:{ height: 4, borderRadius: 2 },

  exerciseCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: C.card, borderRadius: 14,
    borderWidth: 1, borderColor: C.border, padding: 14, marginBottom: 10,
  },
  exEmoji:    { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  exName:     { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 2 },
  exMeta:     { fontSize: 12, color: C.muted },
  setsBadge:  { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, minWidth: 48, alignItems: 'center' },
  setsText:   { fontSize: 12, fontWeight: '700' },

  completeBanner: {
    backgroundColor: C.green + '18', borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: C.green + '50', alignItems: 'center', marginTop: 8,
  },
  completeText: { color: C.green, fontWeight: '700', fontSize: 15 },

  emptyState: { alignItems: 'center', marginTop: 40, paddingHorizontal: 24 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: C.text, marginBottom: 8 },
  emptySub:   { fontSize: 14, color: C.muted, textAlign: 'center', lineHeight: 20 },

  // Breathwork
  breathCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: C.card, borderRadius: 16,
    borderWidth: 1, borderColor: C.border, padding: 16, marginBottom: 14,
  },
  breathIcon: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  breathName: { fontSize: 16, fontWeight: '800', color: C.text, marginBottom: 2 },
  breathDesc: { fontSize: 12, color: C.muted, marginBottom: 4 },
  breathBenefit: { fontSize: 12, fontWeight: '600' },

  startChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  startChipText: { fontSize: 12, fontWeight: '700' },

  // Meditation
  medCard: {
    backgroundColor: C.card, borderRadius: 16,
    borderWidth: 1, borderColor: C.border, padding: 16, marginBottom: 14,
  },
  medIcon:    { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  medName:    { fontSize: 16, fontWeight: '800', color: C.text },
  medDuration:{ fontSize: 13, fontWeight: '600', marginTop: 2 },
  guidePreview:    { backgroundColor: C.surface, borderRadius: 10, padding: 12, gap: 4 },
  guidePreviewText:{ fontSize: 12, color: C.muted, lineHeight: 18 },

  // Progress
  bigCard: {
    backgroundColor: C.card, borderRadius: 20, borderWidth: 1,
    padding: 28, alignItems: 'center', marginBottom: 8,
  },
  bigCardEmoji: { fontSize: 40, marginBottom: 8 },
  bigCardNum:   { fontSize: 64, fontWeight: '900', lineHeight: 72 },
  bigCardLabel: { fontSize: 18, fontWeight: '800', color: C.text, marginTop: 4 },
  bigCardSub:   { fontSize: 13, color: C.muted, marginTop: 6 },

  weekRow:    { flexDirection: 'row', gap: 8 },
  dayCol: {
    flex: 1, alignItems: 'center', paddingVertical: 12,
    backgroundColor: C.card, borderRadius: 12, borderWidth: 1, borderColor: C.border,
  },
  dayLabel:   { fontSize: 11, color: C.muted, fontWeight: '600', marginBottom: 8 },
  dayDot:     { width: 24, height: 24, borderRadius: 12, backgroundColor: C.dim, alignItems: 'center', justifyContent: 'center' },

  statsRow:   { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1, backgroundColor: C.card, borderRadius: 14,
    borderWidth: 1, padding: 14, alignItems: 'center', gap: 4,
  },
  statNum:    { fontSize: 26, fontWeight: '900' },
  statLabel:  { fontSize: 10, color: C.muted, textAlign: 'center', fontWeight: '600' },

  tipRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: C.card, borderRadius: 12,
    borderWidth: 1, borderColor: C.border, padding: 14, marginBottom: 10,
  },
  tipEmoji: { fontSize: 22 },
  tipText:  { flex: 1, fontSize: 14, color: C.text, lineHeight: 20 },
});