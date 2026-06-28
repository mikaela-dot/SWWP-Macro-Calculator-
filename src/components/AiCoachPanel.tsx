/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, ChatMessage, DailySummary } from '../types';
import { Sparkles, Send, Loader2, RefreshCw, User, Award } from 'lucide-react';

interface AiCoachPanelProps {
  userProfile: UserProfile;
  currentSummary: DailySummary & {
    phase: string;
    workoutKcalBurned: number;
    calculatedFatFreeMass: number;
    energyAvailability: number;
    energyAvailabilityStatus: string;
  };
  id?: string;
}

export default function AiCoachPanel({
  userProfile,
  currentSummary,
  id
}: AiCoachPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat session on mount
  useEffect(() => {
    const saved = localStorage.getItem('physio_coach_chat');
    if (saved) {
      try {
        setMessages(JSON.parse(saved));
      } catch (e) {
        // fail silent, use initial greeting
        loadGreeting();
      }
    } else {
      loadGreeting();
    }
  }, [userProfile.lifecycle, currentSummary.phase]);

  // Save chat to localStorage
  const saveChat = (updated: ChatMessage[]) => {
    setMessages(updated);
    localStorage.setItem('physio_coach_chat', JSON.stringify(updated));
  };

  const loadGreeting = () => {
    const pLabel = currentSummary.phase !== 'none' ? `the ${currentSummary.phase} phase` : `${userProfile.lifecycle} lifecycle`;
    const initialGreeting: ChatMessage = {
      id: 'greet_' + Date.now(),
      role: 'model',
      text: `Hello there! I am your AI PhysioCoach. I have synchronized my training and nutrition models with your biomarker profile. 
      
Today, you are guided under **${pLabel}**. Your custom Energy Availability sits at a **${currentSummary.energyAvailabilityStatus}** level of **${currentSummary.energyAvailability}** kcal/kg FFM/day. 

Ask me anything about structuring carbohydrate thresholds, timing leucine triggers to safeguard muscle, timing prep hydration, or adjusting heavy power routines during this specific hormone window.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([initialGreeting]);
  };

  const clearChat = () => {
    localStorage.removeItem('physio_coach_chat');
    loadGreeting();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    if (!textToSend) setInputText('');
    setError('');

    const userMsg: ChatMessage = {
      id: 'm_u_' + Date.now(),
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedWithUser = [...messages, userMsg];
    saveChat(updatedWithUser);
    setLoading(true);

    try {
      const response = await fetch('/api/gemini/coach-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          conversationHistory: updatedWithUser,
          userProfile,
          currentSummary
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Server lost synchronization code.');
      }

      const data = await response.json();

      const aiMsg: ChatMessage = {
        id: 'm_a_' + Date.now(),
        role: 'model',
        text: data.answer || data.response || 'Unable to respond — please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      saveChat([...updatedWithUser, aiMsg]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Connecting to the AI Sports endocrinology coach was interrupted.');
    } finally {
      setLoading(false);
    }
  };

  // Generate dynamic prompts based on profile
  const getPromptSuggestions = () => {
    if (userProfile.lifecycle === 'menopause') {
      return [
        "Explain estrogen related anabolic resistance.",
        "How do I time protein leucine windows to preserve muscle?",
        "Heavy strength vs extensive zone 2 cardio today?"
      ];
    }
    if (userProfile.lifecycle === 'pregnancy') {
      return [
        "What are optimal calories & hydration levels for joint preservation?",
        "Safe core work & checking vertical load intensity.",
        "Folate & Choline snack recommendations."
      ];
    }
    if (userProfile.lifecycle === 'lactation') {
      return [
        "Surplus calorie allocation & sodium needs for milk quality.",
        "Postpartum core synchronization exercises.",
        "Should I skip exercise if feeling low recovery today?"
      ];
    }
    switch (currentSummary.phase) {
      case 'menstrual':
        return [
          "Nutritive meals to replenish blood iron & manage cramps today.",
          "Is lifting heavy safe during bleeding due to lower hormones?",
          "How to balance recovery sleep with systemic inflammation?"
        ];
      case 'follicular':
        return [
          "How can I maximize high carbohydrate tolerance for training spikes?",
          "A HIIT high energy training meal plan recommendation.",
          "Why is estrogen surge beneficial for my muscle remodeling?"
        ];
      case 'ovulatory':
        return [
          "Warmup tips to protect against ligament laxity (Knee stability) today.",
          "Estrogen peak power snack checklist.",
          "Should I test my max lifts during ovulation?"
        ];
      case 'luteal':
      default:
        return [
          "Why do progesterone surges require higher calorie thresholds (+200kcal)?",
          "Protein & complex slow-GI carb hacks to stop sweet cravings.",
          "Pre-workout hydration salt protocols for low plasma volumes."
        ];
    }
  };

  const suggestions = getPromptSuggestions();

  return (
    <div id={id} className="bg-coconut rounded-[40px] border border-daydream shadow-sm flex flex-col h-[580px]">
      
      {/* Coach Header */}
      <div className="p-5 border-b border-daydream flex items-center justify-between bg-coconut/55 rounded-t-[40px] shrink-0">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-kale rounded-full flex items-center justify-center text-coconut">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-serif italic text-kale leading-tight flex items-baseline gap-2">
              somatic co-driver
              <span className="text-sm font-mono font-bold bg-cinnamon text-coconut px-1.5 py-0.5 rounded uppercase tracking-wider">
                Active
              </span>
            </h3>
            <span className="text-sm text-kale/60 font-mono block mt-0.5 uppercase tracking-wider">M Deats Clinical Wellness</span>
          </div>
        </div>

        <button
          onClick={clearChat}
          className="p-2 text-kale/50 hover:text-kale hover:bg-kale/5 border border-daydream rounded-xl transition outline-none"
          title="Reset Coaching Chat"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 font-sans text-kale">
        {messages.map((m) => {
          const isModel = m.role === 'model';
          return (
            <div 
              key={m.id} 
              className={`flex gap-3 max-w-[85%] ${
                isModel ? 'self-start' : 'self-end flex-row-reverse'
              }`}
            >
              <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                isModel ? 'bg-kale text-coconut' : 'bg-kale/10 text-kale'
              }`}>
                {isModel ? <Award className="h-4 w-4" /> : <User className="h-4 w-4" />}
              </div>

              {/* Bubble */}
              <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                isModel 
                  ? 'bg-coconut/80 text-kale rounded-tl-sm border border-daydream font-serif italic' 
                  : 'bg-kale text-coconut rounded-tr-sm font-sans'
              }`}>
                <p className="whitespace-pre-line">
                  {m.text.split('\n').map((line, lIdx) => {
                    let formatted = line;
                    const boldRegex = /\*\*(.*?)\*\*/g;
                    const matches = [...formatted.matchAll(boldRegex)];
                    
                    if (matches.length > 0) {
                      return (
                        <span key={lIdx} className="block mt-1 first:mt-0">
                          {line.split('**').map((chunk, cIdx) => 
                            cIdx % 2 !== 0 ? <strong key={cIdx} className="font-extrabold text-cinnamon">{chunk}</strong> : chunk
                          )}
                        </span>
                      );
                    }
                    return <span key={lIdx} className="block mt-1 first:mt-0">{line}</span>;
                  })}
                </p>
                <span className={`text-[11px] mt-2 block text-right font-mono tracking-wider uppercase ${isModel ? 'text-kale/40' : 'text-coconut/50'}`}>
                  {m.timestamp}
                </span>
              </div>
            </div>
          );
        })}
        {loading && (
          <div className="flex gap-2.5 self-start items-center p-4 text-kale/60 text-sm font-mono">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            <span>AI PhysioCoach is evaluating hormone-mediated curves...</span>
          </div>
        )}
        {error && (
          <p className="text-sm text-rose-650 bg-rose-50 rounded-xl p-3 border border-rose-100 self-center max-w-sm font-mono">
            ⚠ {error}
          </p>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested suggestions panel */}
      <div className="px-5 pb-3 pt-2.5 border-t border-daydream bg-coconut shrink-0 select-none">
        <span className="text-sm font-bold text-kale/60 uppercase tracking-[0.2em] block mb-2 font-mono">
          Dynamic somatic inquiry suggestions
        </span>
        <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
          {suggestions.map((sug, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(sug)}
              disabled={loading}
              className="shrink-0 text-sm font-semibold bg-coconut border border-daydream text-kale hover:bg-kale hover:text-coconut transition duration-150 px-3 py-1.5 rounded-xl outline-none"
            >
              {sug}
            </button>
          ))}
        </div>
      </div>

      {/* Input container footer */}
      <div className="p-4 border-t border-daydream flex gap-2.5 shrink-0 bg-coconut rounded-b-[40px]">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
          placeholder="Inquire health and cycle balance (e.g., 'Optimize proteins for perimeno sleep')"
          className="flex-1 text-sm border border-daydream rounded-xl px-4 focus:border-sage focus:outline-none placeholder-stone-400 bg-coconut/50 text-kale"
          disabled={loading}
        />
        <button
          onClick={() => handleSend()}
          disabled={loading || !inputText.trim()}
          className="p-3 bg-kale text-coconut rounded-xl hover:bg-sage hover:text-kale transition duration-150 disabled:opacity-45 shrink-0 outline-none flex items-center justify-center min-w-[42px]"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>

    </div>
  );
}
