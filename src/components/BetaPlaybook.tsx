/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Sparkles, 
  MessageSquare, 
  Compass, 
  CheckCircle, 
  Copy, 
  Mail, 
  Flame, 
  Scale, 
  Goal,
  Activity,
  Heart,
  BookOpen,
  Bookmark,
  FileText
} from 'lucide-react';
import { BmrFormula } from '../types';

interface BetaPlaybookProps {
  currentFormula: BmrFormula;
  userEmail: string;
}

export default function BetaPlaybook({ currentFormula, userEmail }: BetaPlaybookProps) {
  // Feedback form state
  const [feedbackText, setFeedbackText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('UI Aesthetic');
  const [testerGoal, setTesterGoal] = useState<string>('Performance & Recovery');
  const [overallRating, setOverallRating] = useState<number>(5);
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showResearch, setShowResearch] = useState(false);

  const categories = ['UI Aesthetic', 'Hormonal Sync Insights', 'Food & Workout Loggers', 'AI PhysioCoach', 'Other / Suggestion'];

  const formulaGuide = [
    {
      id: 'owen',
      name: 'Owen (Female)',
      suitedFor: 'General Fitness & standard physiological frames status',
      description: 'The clinical standard. Excellent baseline recommendation for women who do not know their body fat percentage or are starting an active lifestyle program.',
      proTip: 'Ideal if you want simple, reliable metabolic target settings without complex lab-tested inputs.'
    },
    {
      id: 'katch_mcardle',
      name: 'Katch-McArdle',
      suitedFor: 'Athletic, muscular, or larger/denser bone frames',
      description: 'Calculates metabolic expenditure based strictly on Lean Body Mass (LBM) rather than total weight. Superior accuracy for lifters, highly active women, and denser somatic statures.',
      proTip: 'Requires entering your estimated Body Fat %. This ensures your hard-earned metabolically active muscle tissues are fully fueled.'
    },
    {
      id: 'cunningham',
      name: 'Cunningham Equation',
      suitedFor: 'Competitive female athletes & heavy neuromuscular strain loading',
      description: 'Applies a heightened metabolic coefficient (22x) specifically tailored to the tissue turnover of highly trained athletes and larger athletic profiles with rich glycogen storage capacity.',
      proTip: 'Extremely vital for women training 4+ times a week to prevent the dangerous subclinical levels of REDs (Relative Energy Deficiency in Sport).'
    },
    {
      id: 'de_lorenzo',
      name: 'De Lorenzo',
      suitedFor: 'Taller, larger-framed, or higher body weight profiles',
      description: 'An equation tracking larger absolute heights and weights with stronger mathematical multipliers. Highly effective for scaling caloric targets on women with sturdy physical statures and broad frames.',
      proTip: 'Use this if you are tall or larger-boned and want to ensure your foundational energy needs are not underestimated.'
    }
  ];

  const handleCopyFeedback = () => {
    const feedbackPayload = `
=========================================
M DEATS ACTIVE - BETA TESTER FEEDBACK
=========================================
Tester Email: ${userEmail}
Tester Focus Goal: ${testerGoal}
Formula Selected: ${currentFormula.toUpperCase()}
Rating of App: ${overallRating}/5
Focus Category: ${selectedCategory}

Feedback Notes:
"${feedbackText}"
=========================================
    `.trim();

    navigator.clipboard.writeText(feedbackPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmitMock = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // Persist in localStorage as well
    const savedFeedbacks = JSON.parse(localStorage.getItem('beta_tester_feedbacks') || '[]');
    savedFeedbacks.push({
      date: new Date().toISOString(),
      category: selectedCategory,
      goal: testerGoal,
      rating: overallRating,
      text: feedbackText,
      selectedFormula: currentFormula
    });
    localStorage.setItem('beta_tester_feedbacks', JSON.stringify(savedFeedbacks));
  };

  return (
    <div className="bg-coconut rounded-[40px] p-6 md:p-8 border border-daydream shadow-sm flex flex-col gap-8">
      
      {/* Intro Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-daydream pb-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono font-bold bg-cinnamon text-coconut px-2.5 py-0.5 uppercase tracking-widest rounded-sm">
              Beta Phase Guidelines
            </span>
            <span className="text-sm uppercase tracking-[0.25em] text-kale/60 font-mono font-bold">
              • TESTER RESOURCES
            </span>
          </div>
          <h2 className="text-2xl font-serif italic text-kale font-semibold tracking-tight">
            The Active Female Beta Playbook
          </h2>
          <p className="text-sm text-kale/70 max-w-2xl leading-relaxed font-sans">
            Welcome to the tester platform for <strong className="text-kale">Sérénité Active by MDeats</strong>. This space is custom-engineered to synchronize nutrition, training, and hormonal lifecycle curves—perfectly optimized for high-performance athletes, recreational exercisers, walking/resistance lifestyle enthusiasts, and women seeking metabolic balance or healthy perimenopausal transitions.
          </p>
        </div>
        
        <div className="p-4 bg-[#FAF7F2] border border-daydream rounded-[24px] shrink-0 text-left md:max-w-[280px]">
          <div className="flex items-center gap-2 text-cinnamon font-serif italic text-sm font-bold mb-1">
            <Goal className="h-4 w-4" />
            <span>Tester Mandate</span>
          </div>
          <p className="text-sm text-kale/80 font-sans leading-relaxed">
            Before using this suite, you <strong className="font-semibold text-kale">must have a clear goal in mind</strong>—whether it is raw athletic performance, lean tissue synthesis, healthy perimenopause maintenance, or metabolic deficit buffering. Adjust this under your <strong className="text-cinnamon">Somatic Profile</strong>.
          </p>
        </div>
      </div>

      {/* Guide to choosing the formula */}
      <div className="space-y-4">
        <div>
          <span className="text-sm uppercase tracking-[0.2em] text-kale/60 block font-mono font-bold">BIO-ENERGETIC CALIBRATION</span>
          <h3 className="text-lg font-serif italic text-kale font-semibold tracking-tight">
            How to select your Metobolic Expenditure Formula
          </h3>
          <p className="text-sm text-kale/70 font-sans mt-1">
            Menstrual cycle synchronization shifts macro targets relative to your daily Basal Metabolic Rate (BMR). Tweak this setting in your <strong className="text-kale">Somatic Profile</strong> to match your physique profile:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {formulaGuide.map((f) => {
            const isCurrentlySelected = currentFormula === f.id;
            return (
              <div 
                key={f.id} 
                className={`p-5 rounded-[28px] border transition-all duration-200 flex flex-col justify-between gap-3 ${
                  isCurrentlySelected 
                    ? 'bg-[#FAF7F2] border-kale shadow-sm' 
                    : 'bg-coconut/40 border-daydream'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-base font-serif italic font-bold text-kale">{f.name}</span>
                    {isCurrentlySelected && (
                      <span className="text-[11px] font-mono font-bold bg-kale text-coconut px-2 py-0.5 tracking-wider uppercase">
                        Active Selection
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-mono text-cinnamon block mt-1 font-bold uppercase tracking-wider">
                    Suited For: {f.suitedFor}
                  </span>
                  <p className="text-sm text-kale/75 leading-relaxed font-sans mt-2.5">
                    {f.description}
                  </p>
                </div>
                <div className="bg-coconut border border-daydream/60 p-2.5 rounded-2xl text-sm text-kale/80 font-sans">
                  <span className="font-semibold font-mono text-cinnamon">PRO-TIP:</span> {f.proTip}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Embedded Beautiful Feedback Form */}
      <div id="feedback-form" className="bg-coconut/80 rounded-[32px] border border-daydream p-6 md:p-8 space-y-6">
        <div className="flex items-start gap-3 border-b border-daydream pb-4">
          <div className="p-2 bg-cinnamon text-coconut rounded-full shrink-0">
            <MessageSquare className="h-4.5 w-4.5" />
          </div>
          <div>
            <h4 className="font-serif italic text-base font-bold text-kale">Integrated Beta Feedback Hub</h4>
            <p className="text-sm text-kale/70 leading-relaxed font-sans mt-0.5">
              Submit and capture your experience right inside the clinical tracking suite. Copy your typed report with one click to email or text directly to Mikaela at <span className="font-semibold text-kale font-mono">mikaela@mdeatswellness.com</span>.
            </p>
          </div>
        </div>

        {submitted ? (
          <div className="p-6 bg-kale/5 border border-kale/20 rounded-[24px] text-center space-y-3">
            <CheckCircle className="h-8 w-8 text-sage mx-auto" />
            <h5 className="font-serif italic text-base text-kale font-bold">Feedback Logged Successfully!</h5>
            <p className="text-sm text-kale/85 max-w-md mx-auto leading-relaxed font-sans">
              Thank you for contributing to the Sérénité Active by MDeats physiological trials! Your feedback is cached dynamically. Please click the button below to copy the report format so you can send it directly.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleCopyFeedback}
                className="bg-cinnamon hover:bg-cinnamon/90 text-coconut px-4 py-2 rounded-xl text-sm font-mono uppercase tracking-wider font-bold inline-flex items-center gap-1.5 transition-colors"
              >
                <Copy className="h-3.5 w-3.5" />
                {copied ? 'Copied Report!' : 'Copy Summary Report'}
              </button>
              <a
                href={`mailto:mikaela@mdeatswellness.com?subject=Sérénité Active Beta Feedback&body=Goal: ${testerGoal}%0AFormula: ${currentFormula.toUpperCase()}%0ANotes: ${encodeURIComponent(feedbackText)}`}
                className="bg-kale hover:bg-kale/95 text-coconut px-4 py-2 rounded-xl text-sm font-mono uppercase tracking-wider font-bold inline-flex items-center gap-1.5 transition-colors"
              >
                <Mail className="h-3.5 w-3.5" />
                Email Mikaela
              </a>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="border border-daydream hover:bg-coconut/85 text-kale px-4 py-2 rounded-xl text-sm font-mono uppercase tracking-wider font-bold transition-colors"
              >
                Reset Form
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmitMock} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Tester Goal Selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-mono text-kale/60 uppercase tracking-widest font-bold px-1">
                  Your Primary Focus Goal
                </label>
                <select 
                  value={testerGoal}
                  onChange={(e) => setTesterGoal(e.target.value)}
                  className="bg-coconut font-sans text-sm border border-daydream rounded-xl p-3 text-kale focus:outline-none focus:border-kale transition-colors"
                >
                  <option value="Performance & Recovery">Performance & Recovery</option>
                  <option value="Lean Tissue / Muscle Synthesis">Lean Tissue / Muscle Synthesis</option>
                  <option value="Perimenopause Healthy Maintenance">Healthy Maintenance & Vitality</option>
                  <option value="Weight & Metabolic Deficit Alignment">Metabolic Deficit Alignment</option>
                </select>
              </div>

              {/* Feedback Category */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-mono text-kale/60 uppercase tracking-widest font-bold px-1">
                  Focus Diagnostic Category
                </label>
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-coconut font-sans text-sm border border-daydream rounded-xl p-3 text-kale focus:outline-none focus:border-kale transition-colors"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Rating Star Selection */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-mono text-kale/60 uppercase tracking-widest font-bold px-1">
                  Overall Aesthetic & Comfort Rating
                </label>
                <div className="flex items-center h-11 px-3 bg-coconut border border-daydream rounded-xl gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setOverallRating(star)}
                      className={`text-base p-1 outline-none transition-transform active:scale-90 ${
                        star <= overallRating ? 'text-cinnamon' : 'text-kale/20'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                  <span className="text-sm font-mono text-kale/50 ml-auto font-bold uppercase">{overallRating}/5 Stars</span>
                </div>
              </div>

            </div>

            {/* Custom Notes */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-mono text-kale/60 uppercase tracking-widest font-bold px-1">
                Your Professional Experience & Visual Review
              </label>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                rows={4}
                required
                placeholder="What feels dreamy? What inputs did you try? Did the macro thresholds sync nicely with your athletic energy demands? Type your review here..."
                className="bg-coconut font-sans text-sm border border-daydream rounded-2xl p-4 text-kale focus:outline-none focus:border-kale placeholder:text-kale/30 leading-relaxed"
              />
            </div>

            <div className="flex justify-end gap-3 border-t border-daydream pt-4">
              <button
                type="button"
                onClick={handleCopyFeedback}
                disabled={feedbackText.trim() === ''}
                className="border border-daydream hover:bg-[#FAF7F2] text-kale px-4 py-2.5 rounded-xl text-sm font-mono uppercase tracking-wider font-bold transition duration-150 inline-flex items-center gap-1.5 disabled:opacity-50"
              >
                <Copy className="h-3.5 w-3.5" />
                {copied ? 'Copied!' : 'Copy Form Content'}
              </button>
              
              <button
                type="submit"
                className="bg-kale hover:bg-kale/95 text-coconut px-5 py-2.5 rounded-xl text-sm font-mono uppercase tracking-wider font-bold transition duration-150"
              >
                Log Feedback
              </button>
            </div>
          </form>
        )}
      </div>


      {/* Food Logging Accuracy Guide */}
      <div className="border-t border-daydream pt-8">
        <div className="mb-6">
          <span className="text-sm uppercase tracking-[0.2em] text-kale/60 block font-mono font-bold">Logging Guide</span>
          <h3 className="text-xl font-serif italic text-kale mt-1">How to Log Food Accurately</h3>
          <p className="text-sm text-kale/70 leading-relaxed font-sans mt-1">Understanding the accuracy of each logging method so you get the most from your data.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Method 1 - Raw Grams */}
          <div className="bg-[#EAF3DE] border border-sage/30 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-mono font-bold text-opt uppercase tracking-wider bg-opt/10 px-2 py-1 rounded">Most Accurate</span>
            </div>
            <h4 className="font-serif italic text-kale text-sm font-bold mb-2">Raw Grams Calculator</h4>
            <p className="text-sm text-kale/70 leading-relaxed font-sans">Weigh your food raw before cooking. Enter the exact grams. This is the gold standard — cooking changes weight through water loss, so raw weight with raw macros gives the most consistent results across days.</p>
            <div className="mt-3 text-sm font-mono text-opt/80 font-bold">✓ Accuracy: ~95-98%</div>
          </div>

          {/* Method 2 - Barcode */}
          <div className="bg-[#FDF5F0] border border-cinnamon/20 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-mono font-bold text-cinnamon uppercase tracking-wider bg-cinnamon/10 px-2 py-1 rounded">Very Accurate</span>
            </div>
            <h4 className="font-serif italic text-kale text-sm font-bold mb-2">Barcode Scanner</h4>
            <p className="text-sm text-kale/70 leading-relaxed font-sans">Scans packaged food directly from the Open Food Facts database. Macros are per 100g from the label. Weigh or measure your actual serving and enter the grams for best results.</p>
            <div className="mt-3 text-sm font-mono text-cinnamon/80 font-bold">✓ Accuracy: ~90-95%</div>
          </div>

          {/* Method 3 - AI Parser */}
          <div className="bg-coconut border border-daydream rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-mono font-bold text-kale/60 uppercase tracking-wider bg-daydream/50 px-2 py-1 rounded">Estimated</span>
            </div>
            <h4 className="font-serif italic text-kale text-sm font-bold mb-2">Smart AI Natural Text</h4>
            <p className="text-sm text-kale/70 leading-relaxed font-sans">Describe your meal in plain language and AI estimates the macros. Convenient for quick logging but less precise — AI uses standard portion sizes which may not match yours exactly.</p>
            <div className="mt-3 text-sm font-mono text-kale/50 font-bold">~ Accuracy: ±15-20%</div>
          </div>
        </div>

        <div className="bg-[#FAF7F2] border border-daydream rounded-2xl p-4">
          <p className="text-sm text-kale/70 leading-relaxed font-sans">
            <strong className="text-kale font-semibold">Clinical note:</strong> No food tracking method is perfectly accurate — even laboratory analysis has margins of error. The most important principle is <strong className="text-kale font-semibold">consistency</strong>. Log the same way every day and your trends will be meaningful, even if absolute numbers aren't perfect. For cycle-phase pattern analysis, consistent logging matters far more than gram-perfect accuracy.
          </p>
        </div>
      </div>

      {/* Clinical Science & Reference Library */}
      <div className="border-t border-daydream pt-8">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <span className="text-sm uppercase tracking-[0.2em] text-kale/60 block font-mono font-bold">SCIENCE & EVIDENCE</span>
            <h4 className="font-serif italic text-base font-bold text-kale mt-1">Clinical Science & Reference Library</h4>
            <p className="text-sm text-kale/70 leading-relaxed font-sans mt-0.5">
              Review the peer-reviewed clinical studies, physiological math formulas, and endocrine guidelines used to build Sérénité Active by MDeats.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowResearch(!showResearch)}
            className="border border-daydream hover:bg-[#FAF7F2] text-kale px-4 py-2 rounded-xl text-sm font-mono uppercase tracking-wider font-bold transition duration-150 inline-flex items-center gap-1.5 self-start shrink-0"
          >
            <BookOpen className="h-3.5 w-3.5" />
            {showResearch ? "Hide Reference Library" : "Show Reference Library"}
          </button>
        </div>

        {showResearch && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            {/* Research Card 1 */}
            <div className="bg-[#FAF7F2]/50 border border-daydream rounded-3xl p-5 space-y-4">
              <div className="flex items-start gap-2.5">
                <span className="p-1.5 bg-cinnamon/10 text-cinnamon rounded-lg text-sm font-bold font-mono">01</span>
                <div>
                  <h5 className="font-serif italic font-bold text-sm text-kale">Relative Energy Deficiency in Sport (REDs)</h5>
                  <span className="text-sm font-mono font-semibold text-kale/50">Mountjoy, M. et al. (2018) • British Journal of Sports Medicine</span>
                </div>
              </div>
              <p className="text-sm text-kale/80 font-sans leading-relaxed">
                Establishes the physiological threshold model of Energy Availability (EA). When net caloric availability drops below 30 kcal/kg Fat-Free Mass (FFM) per day, the female endocrine system downregulates (amenorrhea, slowed bone remodeling, thyroid downregulation).
              </p>
              <div className="bg-coconut/80 border border-daydream/60 rounded-xl p-3 text-sm space-y-1">
                <span className="font-mono text-sm font-bold text-cinnamon block uppercase">Applied Mechanics:</span>
                <p className="text-kale/80 font-sans">
                  The <strong className="text-kale font-bold">Energy Availability Card</strong> parses your daily calorie logs minus recorded exercise expenditure, dividing by your Fat-Free Mass (derived from body fat %) to report real-time risk indicators.
                </p>
              </div>
            </div>

            {/* Research Card 2 */}
            <div className="bg-[#FAF7F2]/50 border border-daydream rounded-3xl p-5 space-y-4">
              <div className="flex items-start gap-2.5">
                <span className="p-1.5 bg-cinnamon/10 text-cinnamon rounded-lg text-sm font-bold font-mono">02</span>
                <div>
                  <h5 className="font-serif italic font-bold text-sm text-kale">Estrogen-Progesterone Biphasic Energy Flux</h5>
                  <span className="text-sm font-mono font-semibold text-kale/50">Oosthuyse, T. & Bosch, A. N. (2010) • Sports Medicine Journal</span>
                </div>
              </div>
              <p className="text-sm text-kale/80 font-sans leading-relaxed">
                Tracks the rise of serum progesterone during the mid-to-late luteal phase, which triggers an average elevation of 0.5°C in basal body temperature. This thermoregulatory shift expands resting energy expenditure by approximately 5–8% over baseline (Solomon et al., Davidsen et al.) — applied proportionally to your individual TDEE rather than as a flat figure, since a fixed kcal addition would over- or under-correct depending on body size. Conversely, estrogen acts as an insulin-sensitizing, glucose-sparing agent during the follicular phase.
              </p>
              <div className="bg-coconut/80 border border-daydream/60 rounded-xl p-3 text-sm space-y-1">
                <span className="font-mono text-sm font-bold text-cinnamon block uppercase">Applied in App:</span>
                <p className="text-kale/80 font-sans">
                  The engine applies a +6% adjustment in luteal phase (regular cycle), +2% in ovulatory phase, and a conservative +3% in perimenopausal luteal phase to reflect irregular ovulation — all proportional to your calculated TDEE, not flat additions.
                </p>
              </div>
            </div>

            {/* Research Card 3 */}
            <div className="bg-[#FAF7F2]/50 border border-daydream rounded-3xl p-5 space-y-4">
              <div className="flex items-start gap-2.5">
                <span className="p-1.5 bg-cinnamon/10 text-cinnamon rounded-lg text-sm font-bold font-mono">03</span>
                <div>
                  <h5 className="font-serif italic font-bold text-sm text-kale">Equation Selection & Body Composition</h5>
                  <span className="text-sm font-mono font-semibold text-kale/50">Owen, O. E. (1986) & De Lorenzo, A. (1999) • Female-Validated RMR Studies</span>
                </div>
              </div>
              <p className="text-sm text-kale/80 font-sans leading-relaxed">
                Demonstrates that for highly active or muscular individuals, standard weight-based equations developed from male or mixed-sex cohorts misrepresent energy needs in active women. Owen and De Lorenzo were validated in female populations; Cunningham and Katch-McArdle offer superior accuracy by anchoring calculation to Fat-Free Mass.
              </p>
              <div className="bg-coconut/80 border border-daydream/60 rounded-xl p-3 text-sm space-y-1">
                <span className="font-mono text-sm font-bold text-cinnamon block uppercase">Applied Mechanics:</span>
                <p className="text-kale/80 font-sans">
                  The <strong className="text-kale font-bold">Somatic Profile BMR Equations</strong> empower highly trained active female users to switch baseline calculators dynamically, integrating estimated lean body mass for personalized macro parameters.
                </p>
              </div>
            </div>

            {/* Research Card 4 */}
            <div className="bg-[#FAF7F2]/50 border border-daydream rounded-3xl p-5 space-y-4">
              <div className="flex items-start gap-2.5">
                <span className="p-1.5 bg-cinnamon/10 text-cinnamon rounded-lg text-sm font-bold font-mono">04</span>
                <div>
                  <h5 className="font-serif italic font-bold text-sm text-kale">Anabolic Resistance & Daily Leucine Thresholds</h5>
                  <span className="text-sm font-mono font-semibold text-kale/50">Devries, M. C. et al. (2015) • Nutrients Journal</span>
                </div>
              </div>
              <p className="text-sm text-kale/80 font-sans leading-relaxed">
                During ovarian aging and estrogen decline, women experience increased "anabolic resistance" where muscles require higher concentrations of the amino acid leucine to trigger protein synthesis. To maintain vital lean tissue, women need a minimum of 30g of complete, high-quality protein per meal (delivering 2.5g+ leucine) to offset muscle loss—even without rigorous workouts.
              </p>
              <div className="bg-coconut/80 border border-daydream/60 rounded-xl p-3 text-sm space-y-1">
                <span className="font-mono text-sm font-bold text-cinnamon block uppercase">Applied in App:</span>
                <p className="text-kale/80 font-sans">
                  Per-meal minimum is set to 30g for regular cycles and follicular-phase women, rising to 35g for perimenopause and menopause to offset anabolic resistance — shown alongside your daily protein target on the dashboard.
                </p>
              </div>
            </div>

            {/* Research Card 5 */}
            <div className="bg-[#FAF7F2]/50 border border-daydream rounded-3xl p-5 space-y-4">
              <div className="flex items-start gap-2.5">
                <span className="p-1.5 bg-cinnamon/10 text-cinnamon rounded-lg text-sm font-bold font-mono">05</span>
                <div>
                  <h5 className="font-serif italic font-bold text-sm text-kale">Perimenopause & Cellular Lipid Shifts</h5>
                  <span className="text-sm font-mono font-semibold text-kale/50">Lobo, R. A. (2008) • Lancet Endocrinology & Metabolism</span>
                </div>
              </div>
              <p className="text-sm text-kale/80 font-sans leading-relaxed">
                Ovarian reserve depletion triggers erratic fluctuations in Follicle-Stimulating Hormone (FSH) and declines in estradiol. This shift alters lipid storage depots, favoring visceral fat distribution and slowing thyroid t3/t4 conversion, which downregulates basal metabolic rate even when exercise volume is constant.
              </p>
              <div className="bg-coconut/80 border border-daydream/60 rounded-xl p-3 text-sm space-y-1">
                <span className="font-mono text-sm font-bold text-cinnamon block uppercase">Perimenopause Balance:</span>
                <p className="text-kale/80 font-sans">
                  Our system offers metabolic target offsets under the <strong className="text-kale font-bold">Health & Vitality</strong> profile mode to adjust insulin-to-carb sensitivity recommendations, preventing metabolic fatigue.
                </p>
              </div>
            </div>

            {/* Research Card 6 */}
            <div className="bg-[#FAF7F2]/50 border border-daydream rounded-3xl p-5 space-y-4">
              <div className="flex items-start gap-2.5">
                <span className="p-1.5 bg-cinnamon/10 text-cinnamon rounded-lg text-sm font-bold font-mono">06</span>
                <div>
                  <h5 className="font-serif italic font-bold text-sm text-kale">Skeletal Calcium Depletion & Mineral Balance</h5>
                  <span className="text-sm font-mono font-semibold text-kale/50">Eastell, R. et al. (2016) • Journal of Bone and Mineral Research</span>
                </div>
              </div>
              <p className="text-sm text-kale/80 font-sans leading-relaxed">
                Estrogen deficiency during menopausal transitions directly accelerates osteoclastic activity, creating a critical window for bone remodeling. Ensuring continuous intake of calcium, vitamin D3, and magnesium, alongside adequate baseline calorie availability, is crucial to protect bone mineral density.
              </p>
              <div className="bg-coconut/80 border border-daydream/60 rounded-xl p-3 text-sm space-y-1">
                <span className="font-mono text-sm font-bold text-cinnamon block uppercase">Applied Mechanics:</span>
                <p className="text-kale/80 font-sans">
                  The food logs and nutrient targets prioritize high bone-fortifying micronutrient thresholds if a user flags perimenopausal profile settings.
                </p>
              </div>
            </div>
            

            {/* Research Card 7 — Protein in Female Athletes */}
            <div className="bg-[#FAF7F2]/50 border border-daydream rounded-3xl p-5 space-y-4">
              <div className="flex items-start gap-2.5">
                <span className="p-1.5 bg-cinnamon/10 text-cinnamon rounded-lg text-sm font-bold font-mono">07</span>
                <div>
                  <h5 className="font-serif italic font-bold text-sm text-kale">Protein Requirements for Female Athletes — Aligning Science with Sex-Specific Needs</h5>
                  <span className="text-sm font-mono font-semibold text-kale/50">Gatorade Sports Science Institute (2025) • Sports Science Exchange</span>
                </div>
              </div>
              <p className="text-sm text-kale/80 font-sans leading-relaxed">
                Current evidence does not support manipulating protein intake across menstrual cycle phases — consistent daily intake matters more than phase-cycling. Baseline for active women is 1.4–1.6 g/kg/day, distributed evenly every 3–4 hours. On endurance training days, Williamson et al. (2023) recommend ~1.89 g/kg — beyond current upper athletic guidelines — reflecting female-specific amino acid oxidation during exercise.
              </p>
              <div className="bg-coconut/80 border border-daydream/60 rounded-xl p-3 text-sm space-y-1">
                <span className="font-mono text-sm font-bold text-cinnamon block uppercase">Applied in App:</span>
                <p className="text-kale/80 font-sans">
                  Protein targets are dynamic by goal and lifecycle — not cycle phase. Training day augmentation (+0.2–0.4 g/kg) fires automatically when a workout is logged, based on session type. No phase manipulation applied.
                </p>
              </div>
            </div>

            {/* Research Card 8 — Menopause Anabolic Resistance */}
            <div className="bg-[#FAF7F2]/50 border border-daydream rounded-3xl p-5 space-y-4">
              <div className="flex items-start gap-2.5">
                <span className="p-1.5 bg-cinnamon/10 text-cinnamon rounded-lg text-sm font-bold font-mono">08</span>
                <div>
                  <h5 className="font-serif italic font-bold text-sm text-kale">Resistance Training & High-Protein Diet in Postmenopausal Women</h5>
                  <span className="text-sm font-mono font-semibold text-kale/50">Ioannidou et al. (2024) • Journal of Nutrition Health & Aging</span>
                </div>
              </div>
              <p className="text-sm text-kale/80 font-sans leading-relaxed">
                12-week RCT at German Sports University Cologne. Postmenopausal women combining resistance training with 2.5 g/kg FFM protein showed meaningful improvements in body composition, muscle thickness, and strength capacity versus training or protein alone. Menopause increases anabolic resistance — muscle cells require higher protein doses to trigger the same synthesis response as younger women, making elevated intake non-negotiable for lean mass preservation.
              </p>
              <div className="bg-coconut/80 border border-daydream/60 rounded-xl p-3 text-sm space-y-1">
                <span className="font-mono text-sm font-bold text-cinnamon block uppercase">Applied in App:</span>
                <p className="text-kale/80 font-sans">
                  Perimenopause floor: 1.8 g/kg. Menopause floor: 2.0 g/kg. Both elevated automatically — the app explains why to the user in the protein goal selector. Per-meal minimum raised to 35g for these lifecycle stages.
                </p>
              </div>
            </div>

            {/* Research Card 9 — Leucine Threshold & Meal Distribution */}
            <div className="bg-[#FAF7F2]/50 border border-daydream rounded-3xl p-5 space-y-4">
              <div className="flex items-start gap-2.5">
                <span className="p-1.5 bg-cinnamon/10 text-cinnamon rounded-lg text-sm font-bold font-mono">09</span>
                <div>
                  <h5 className="font-serif italic font-bold text-sm text-kale">Protein Dose & Leucine Threshold in Trained Women Post-Resistance Exercise</h5>
                  <span className="text-sm font-mono font-semibold text-kale/50">Mallinson et al. (2023) • Scandinavian Journal of Medicine & Science in Sports</span>
                </div>
              </div>
              <p className="text-sm text-kale/80 font-sans leading-relaxed">
                30g of protein post-exercise in trained women significantly increased myofibrillar fractional synthetic rate above baseline across 24 hours. 15g did not. Distribution across meals matters as much as total daily intake — each meal must independently cross the leucine threshold (~2.8g leucine, ~30g complete protein) to count as an anabolic event. After leucine activates mTORC1, a 3–4 hour refractory period follows before the pathway can respond again (Layman, Frontiers in Nutrition 2024).
              </p>
              <div className="bg-coconut/80 border border-daydream/60 rounded-xl p-3 text-sm space-y-1">
                <span className="font-mono text-sm font-bold text-cinnamon block uppercase">Applied in App:</span>
                <p className="text-kale/80 font-sans">
                  Per-meal minimum of 30g shown to users (35g for perimenopause/menopause). Four-meal structure at 3.5–4 hour gaps is recommended — aligning with leucine refractory period. This matches the Metabolic Balance–informed meal timing already embedded in the program philosophy.
                </p>
              </div>
            </div>

            {/* Research Card 10 — Cycle Phase & MPS: Current Evidence */}
            <div className="bg-[#FAF7F2]/50 border border-daydream rounded-3xl p-5 space-y-4">
              <div className="flex items-start gap-2.5">
                <span className="p-1.5 bg-cinnamon/10 text-cinnamon rounded-lg text-sm font-bold font-mono">10</span>
                <div>
                  <h5 className="font-serif italic font-bold text-sm text-kale">Menstrual Cycle Phase Does Not Influence Muscle Protein Synthesis After Resistance Exercise</h5>
                  <span className="text-sm font-mono font-semibold text-kale/50">Colenso-Semple et al. (2025) • Journal of Physiology</span>
                </div>
              </div>
              <p className="text-sm text-kale/80 font-sans leading-relaxed">
                Using best-practice cycle verification methodology and stable isotope techniques, this study found no evidence of menstrual cycle phase-specific effects on muscle protein synthesis, myofibrillar proteolysis, or anabolic processes in response to resistance exercise. Aligns with D'Souza et al. (2023) meta-analysis. The popular assumption that the luteal phase is catabolic and the follicular phase is anabolic is not supported by current rigorous female-specific research.
              </p>
              <div className="bg-coconut/80 border border-daydream/60 rounded-xl p-3 text-sm space-y-1">
                <span className="font-mono text-sm font-bold text-cinnamon block uppercase">Applied in App:</span>
                <p className="text-kale/80 font-sans">
                  Protein targets do not fluctuate by cycle phase. Phase-aware adjustments are applied to carbohydrate and fat ratios only — areas where the evidence for cycle-phase differences is more robust (substrate oxidation, insulin sensitivity, glycogen dynamics).
                </p>
              </div>
            </div>

            {/* Research Card 11 — Perimenopause & Weight Loss Resistance */}
            <div className="bg-[#FAF7F2]/50 border border-daydream rounded-3xl p-5 space-y-4">
              <div className="flex items-start gap-2.5">
                <span className="p-1.5 bg-cinnamon/10 text-cinnamon rounded-lg text-sm font-bold font-mono">11</span>
                <div>
                  <h5 className="font-serif italic font-bold text-sm text-kale">Weight Loss Resistance Across the Menopausal Transition in Resistance-Trained Women</h5>
                  <span className="text-sm font-mono font-semibold text-kale/50">Oelmann et al. (2025) • Journal of the International Society of Sports Nutrition</span>
                </div>
              </div>
              <p className="text-sm text-kale/80 font-sans leading-relaxed">
                Postmenopausal women self-report the highest rates of weight loss resistance compared to premenopausal and perimenopausal women, with perimenopausal women reporting higher rates than premenopausal — a progressive trend reflecting increasing hormonal and physiological disruption. Standard calorie deficit strategies fail this population because traditional equations don't account for the hormonal metabolic shift independent of body composition changes.
              </p>
              <div className="bg-coconut/80 border border-daydream/60 rounded-xl p-3 text-sm space-y-1">
                <span className="font-mono text-sm font-bold text-cinnamon block uppercase">Applied in App:</span>
                <p className="text-kale/80 font-sans">
                  The metabolic adaptation offset (−150 or −250 kcal) directly addresses this. Combined with elevated protein targets and female-validated RMR equations, the app avoids prescribing calorie targets that standard tools would over-estimate for this population.
                </p>
              </div>
            </div>
            {/* Added Section for Clinicians */}
            <div className="md:col-span-2 bg-[#FAF7F2] border border-daydream rounded-3xl p-5 text-sm text-kale/85 font-sans leading-relaxed flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="font-serif italic text-sm font-bold block text-cinnamon">✦ Professional/Clinical Summary File</span>
                <p className="text-sm text-kale/70">
                  Are you a physical therapist, dietitian, or endocrine clinician managing client protocols in Sérénité Active by MDeats? You can download or cite our equations — Owen, De Lorenzo, Cunningham, and Katch-McArdle — directly from our code lines.
                </p>
              </div>
              <div className="font-mono text-sm bg-coconut border border-daydream/80 rounded-xl px-3 py-1.5 font-bold text-kale text-right shrink-0 uppercase tracking-wider">
                Full-Stack Clinical Math Integration
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
