import { useState } from 'react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { ArrowRight } from 'lucide-react';
import WelcomeScreen from './WelcomeScreen';

const QUESTIONS = {
  de: [
    { id: 'name', label: 'Wie heißt du?', placeholder: 'Dein Name...', type: 'text' },
    { id: 'age', label: 'Wie alt bist du?', placeholder: 'Alter eingeben...', type: 'number' },
    { id: 'gender', label: 'Geschlecht?', options: ['männlich', 'weiblich', 'divers', 'keine Angabe'], type: 'select' },
    { id: 'goal', label: 'Was ist dein Ziel?', placeholder: 'z.B. Gedächtnis verbessern...', type: 'text' },
    { id: 'dailyExercises', label: 'Übungen pro Tag?', options: ['1', '3', '5', '10'], type: 'select' },
  ],
  en: [
    { id: 'name', label: 'What\'s your name?', placeholder: 'Your name...', type: 'text' },
    { id: 'age', label: 'How old are you?', placeholder: 'Your age...', type: 'number' },
    { id: 'gender', label: 'Gender?', options: ['male', 'female', 'diverse', 'prefer not to say'], type: 'select' },
    { id: 'goal', label: 'What\'s your goal?', placeholder: 'e.g. improve memory...', type: 'text' },
    { id: 'dailyExercises', label: 'Exercises per day?', options: ['1', '3', '5', '10'], type: 'select' },
  ],
};

export default function OnboardingFlow({ onComplete }) {
  const [phase, setPhase] = useState('welcome');
  const [language, setLanguage] = useState('de');
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [saving, setSaving] = useState(false);

  const questions = QUESTIONS[language];
  const currentQuestion = questions[currentStep];

  const handleWelcomeDone = (lang) => {
    setLanguage(lang);
    setPhase('form');
  };

  const handleAnswer = (value) => {
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: value }));
  };

  const handleNext = async () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Save all data
      setSaving(true);
      try {
        const user = await base44.auth.me();
        const profiles = await base44.entities.UserProfile.filter({ created_by: user.email });
        
        if (profiles.length > 0) {
          const profileId = profiles[0].id;
          await base44.entities.UserProfile.update(profileId, {
            display_name: answers.name || user.full_name,
            age: parseInt(answers.age) || null,
            gender: answers.gender || null,
            preferred_language: language,
            goals: {
              daily_exercises: parseInt(answers.dailyExercises) || 3,
              focus_domains: []
            },
            onboarding_completed: true,
          });
        }
      } catch (e) {
        console.error('Onboarding save error:', e);
      }
      setSaving(false);
      onComplete?.();
    }
  };

  const isAnswered = answers[currentQuestion.id] !== undefined && answers[currentQuestion.id] !== '';

  if (phase === 'welcome') {
    return <WelcomeScreen onStart={handleWelcomeDone} />;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, #4c1d95 0%, #1e1b4b 40%, #0f0a1e 100%)' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-slate-100 dark:border-slate-700"
      >
        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold text-slate-600 dark:text-slate-400">
              Schritt {currentStep + 1} von {questions.length}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-500">
              {Math.round(((currentStep + 1) / questions.length) * 100)}%
            </span>
          </div>
          <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-600"
              initial={{ width: `${(currentStep / questions.length) * 100}%` }}
              animate={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        {/* Question */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h2 className="text-2xl font-black text-slate-800 dark:text-white">
            {currentQuestion.label}
          </h2>

          {/* Input */}
          {currentQuestion.type === 'text' && (
            <input
              autoFocus
              type="text"
              placeholder={currentQuestion.placeholder}
              value={answers[currentQuestion.id] || ''}
              onChange={e => handleAnswer(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && isAnswered && handleNext()}
              className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 text-base"
            />
          )}

          {currentQuestion.type === 'number' && (
            <input
              autoFocus
              type="number"
              placeholder={currentQuestion.placeholder}
              value={answers[currentQuestion.id] || ''}
              onChange={e => handleAnswer(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && isAnswered && handleNext()}
              className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 text-base"
            />
          )}

          {currentQuestion.type === 'select' && (
            <div className="grid grid-cols-2 gap-2">
              {currentQuestion.options.map(opt => (
                <button
                  key={opt}
                  onClick={() => handleAnswer(opt)}
                  className={`py-3 px-4 rounded-2xl font-bold text-sm transition-all ${
                    answers[currentQuestion.id] === opt
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Button */}
        <button
          onClick={handleNext}
          disabled={!isAnswered || saving}
          className="w-full mt-8 py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black flex items-center justify-center gap-2 hover:from-purple-600 hover:to-indigo-700 disabled:opacity-50 transition-all shadow-lg"
        >
          {saving ? 'Speichert...' : currentStep === questions.length - 1 ? 'Fertig! 🚀' : 'Weiter →'}
          {!saving && currentStep < questions.length - 1 && <ArrowRight className="w-4 h-4" />}
        </button>

        {/* Step indicator dots */}
        <div className="flex justify-center gap-2 mt-6">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${
                i <= currentStep ? 'bg-purple-500 w-6' : 'bg-slate-300 dark:bg-slate-600 w-2'
              }`}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}