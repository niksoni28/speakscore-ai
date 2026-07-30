import React from 'react'
import femaleVideo from "../assets/Videos/female-ai.mp4"
import Timer from './Timer'
import { motion, time } from "motion/react"
import { AnimatePresence } from "motion/react"
import { FaMicrophone, FaMicrophoneSlash, FaSadCry } from 'react-icons/fa'
import { useState, useRef, useEffect } from 'react'
import axios from "axios"
import { ServerUrl } from '../App'
import { BsArrowBarLeft, BsArrowLeft, BsArrowRight } from 'react-icons/bs'

function S2Interview({ interviewData, onFinish }) {
  const { interviewId, questions, userName } = interviewData
  const [isIntroPhase, setIsIntroPhase] = useState(true);
    const [isMicOn, setIsMicOn] = useState(true);
  const recognitionRef = useRef(null);
    const [isAIPlaying, setIsAIPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
    const [answer, setAnswer] = useState("");
    const [feedback, setFeedback] = useState("");
    const [timeLeft, setTimeLeft] = useState(questions[0]?.timeLimit || 60);
    const [selectedVoice, setSelectedVoice] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [subtitle, setSubtitle] = useState("");
    const videoRef = useRef(null);
    const currentQuestion = questions[currentIndex];

  const isMicOnRef = useRef(isMicOn);
  const isAIPlayingRef = useRef(isAIPlaying);
 
  const isActiveRef = useRef(true);

  useEffect(() => { isMicOnRef.current = isMicOn; }, [isMicOn]);
  useEffect(() => { isAIPlayingRef.current = isAIPlaying; }, [isAIPlaying]);

  const setIsAIPlayingBoth = (value) => {
    isAIPlayingRef.current = value;
    setIsAIPlaying(value);
  };
  const setIsMicOnBoth = (value) => {
    isMicOnRef.current = value;
    setIsMicOn(value);
  };


  const isListeningRef = useRef(false);

  useEffect(() => {
    const findFemaleVoice = (voices) => voices.find(v =>
      v.name.toLowerCase().includes("zira") ||
        v.name.toLowerCase().includes("samantha") ||
       v.name.toLowerCase().includes("female")
    );

    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length || selectedVoice) return;

      const femaleVoice = findFemaleVoice(voices);
      setSelectedVoice(femaleVoice || voices[0]);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, [])

  const videoSource = femaleVideo;

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    const handleEnded = () => {
      if (isAIPlaying) {
        videoEl.currentTime = 0;
        videoEl.play().catch(() => {});
      }
    };
    videoEl.addEventListener("ended", handleEnded);
    return () => videoEl.removeEventListener("ended", handleEnded);
  }, [isAIPlaying]);

  const speakOne = (text) => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis || !selectedVoice) {
        resolve();
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = selectedVoice;
      utterance.rate = 0.90 + Math.random() * 0.06;
      utterance.pitch = 1.0 + Math.random() * 0.08;
      utterance.volume = 1;
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      window.speechSynthesis.speak(utterance);
    });
  };

  const speakText = async (text, { noPause = false } = {}) => {
    if (!window.speechSynthesis || !selectedVoice || !isActiveRef.current) return;
    window.speechSynthesis.cancel();
    await new Promise((r) => setTimeout(r, 60));
    if (!isActiveRef.current) return; // bailed out / unmounted while waiting

    const sentences = noPause
      ? [text.trim()]
      : text.split(/(?<=[.?!])\s+/).map(s => s.trim()).filter(Boolean);

    setSubtitle(text);

    setIsAIPlayingBoth(true);
    stopMic();
    if (videoRef.current) {
      videoRef.current.loop = false;
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
    for (let i = 0; i < sentences.length; i++) {
      await speakOne(sentences[i]);
      if (!isActiveRef.current) return; // unmounted mid-speech, stop right here
      if (i < sentences.length - 1) {
        await new Promise(r => setTimeout(r, 250));
        if (!isActiveRef.current) return;
      }
    }
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    setIsAIPlayingBoth(false);
    if (isMicOnRef.current && isActiveRef.current) startMic();

    await new Promise((r) => setTimeout(r, 300));
    if (!isActiveRef.current) return;
    setSubtitle("");
  };
  useEffect(() => {
    if (!selectedVoice) return;
    const runIntro = async () => {
      if (isIntroPhase) {
        await speakText(
          `Hello ${userName}, it's great to meet you today. I hope you're feeling confident and ready. I'll ask you a few questions. Just answer naturally, and take your time. Let's begin.`,
          { noPause: true }
        );
        if (!isActiveRef.current) return;
        setIsIntroPhase(false)
      } else if (currentQuestion) {
        await new Promise(r => setTimeout(r, 800));
        if (!isActiveRef.current) return;

        if (currentIndex === questions.length - 1) {
          await speakText("Alright, Let's move on to the last question and it might be a bit more challenging.");
        }
        if (!isActiveRef.current) return;
        await speakText(currentQuestion.question);
        if (isMicOnRef.current && isActiveRef.current) startMic();
      }
    }
    runIntro()
  }, [selectedVoice, isIntroPhase, currentIndex])
  useEffect(() => {
    if (isIntroPhase) return;
    if (!currentQuestion) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0;
        }
        return prev - 1
      })
    }, 1000);
    return () => clearInterval(timer)
  }, [isIntroPhase, currentIndex])

  useEffect(() => {
    if (!isIntroPhase && currentQuestion) {
      setTimeLeft(currentQuestion.timeLimit || 60);
    }
  }, [currentIndex])

  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) return;

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onstart = () => {
      isListeningRef.current = true;
    };

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      setAnswer((prev) => prev + " " + transcript);
    };

    recognition.onend = () => {
      isListeningRef.current = false;
      if (!isActiveRef.current) return; 
      if (isMicOnRef.current && !isAIPlayingRef.current) {
        startMic();
      }
    };

    recognition.onerror = (event) => {
      isListeningRef.current = false;
      if (!isActiveRef.current) return; 

      if (event.error !== "not-allowed" && event.error !== "service-not-allowed") {
        if (isMicOnRef.current && !isAIPlayingRef.current) {
          startMic();
        }
      }
    };

    recognitionRef.current = recognition;
  }, []);


  const startMic = () => {
    if (!isActiveRef.current) return;
    if (recognitionRef.current && !isListeningRef.current && !isAIPlayingRef.current) {
      try { recognitionRef.current.start(); } catch {}
    }
  };
  const stopMic = () => {
    if (recognitionRef.current && isListeningRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
  };

  const toggleMic = () => {
    if (isMicOn) stopMic();
    else startMic();
    setIsMicOnBoth(!isMicOn);
  };

  const submitAnswer = async () => {
    if (isSubmitting) return;
    stopMic()
    setIsSubmitting(true)
    try {
      const result = await axios.post(ServerUrl + "/api/interview/submit-answer", {
        interviewId,
        questionIndex: currentIndex,
        answer,
        timeTaken: currentQuestion.timeLimit - timeLeft,
      }, { withCredentials: true })
      if (!isActiveRef.current) return;
      setFeedback(result.data.feedback)
      speakText(result.data.feedback)
      setIsSubmitting(false)
    } catch (error) {
      console.log(error)
      if (isActiveRef.current) setIsSubmitting(false)
    }
  }
  const handleNext = async () => {
    setAnswer("");
    setFeedback("");

    if (currentIndex + 1 >= questions.length) {
      finishInterview();
      return;
    }
    const nextIndex = currentIndex + 1;
    const nextIsLast = nextIndex === questions.length - 1;

    if (!nextIsLast) {
      await speakText("Alright, let's move to the next question.");
    }
    if (!isActiveRef.current) return;
    setCurrentIndex(nextIndex);
    setTimeout(() => {
      if (isMicOnRef.current && isActiveRef.current) startMic();
    }, 500);
  }
  const finishInterview = async () => {
    stopMic()
    setIsMicOnBoth(false)
    try {
      const result = await axios.post(`${ServerUrl}/api/interview/finish`, { interviewId }, { withCredentials: true })
      console.log(result.data)
      if (isActiveRef.current) onFinish(result.data)
    } catch (error) {
      console.log(error)
    }}
  useEffect(() => {
    if (isIntroPhase) return;
    if (!currentQuestion) return;
    if (timeLeft === 0 && !isSubmitting && !feedback) {
      submitAnswer();
    }
  }, [timeLeft]);

  useEffect(() => {
    isActiveRef.current = true; 
    return () => {
      isActiveRef.current = false;
      isMicOnRef.current = false;

      if (recognitionRef.current) {
     
        recognitionRef.current.onstart = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        try { recognitionRef.current.stop(); } catch {}
        try { recognitionRef.current.abort(); } catch {}
      }
      window.speechSynthesis.cancel();
    };
  }, []);
  return (
      <div className='min-h-screen bg-linear-to-br from-emerald-50 via-white to-teal-100 flex items-center justify-center p-4 sm:p-6'>
      <div className='w-full max-w-350 min-h-[80vh] bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col lg:flex-row overflow-hidden'>
      <div className='w-full lg:w-[35%] bg-white flex flex-col items-center p-6 space-y-6 border-r border-gray-200'>
      <div className='w-full max-w-md rounded-2xl overflow-hidden'>
            <video
              src={videoSource}
              key={videoSource}
              ref={videoRef}
              muted
              playsInline
              preload='auto'
              className='w-full h-auto object-cover'
            />
          </div>
          <AnimatePresence>
            {subtitle && (
              <motion.div
                initial={{ height: 0, opacity: 0, marginTop: 0 }}
                animate={{ height: "auto", opacity: 1, marginTop: 0 }}
                exit={{ height: 0, opacity: 0, marginTop: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className='w-full max-w-md overflow-hidden'
              >
                <div className='bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm'>
                  <p className='text-gray-700 text-sm sm:text-base font-medium text-center leading-relaxed'>
                    {subtitle}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
            <div className='w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-md p-6 space-y-5'>
            <div className='flex justify-between items-center'>
             <span className='text-sm text-gray-500'>Interview Status</span>
              {isAIPlaying && <span className='text-sm font-semibold text-emerald-600'>AI Speaking</span>}
            </div>

            <div className='h-px bg-gray-200'></div>
            <div className='flex justify-center'>
            <Timer timeLeft={timeLeft} totalTime={currentQuestion?.timeLimit} />
            </div>

            <div className='h-px bg-gray-200'></div>
            <div className='grid grid-cols-2 gap-6 text-center'>
            <div>
            <span className='text-2xl font-bold text-emerald-600'>{currentIndex + 1}</span>
            <span className='text-xs text-gray-400'>Current Questions</span>
            </div>
            <div>
                <span className='text-2xl font-bold text-emerald-600'>{questions.length}</span>
                <span className='text-xs text-gray-400'>Total Questions</span>
        </div>
        </div>
        </div>
        </div>
        <div className='flex-1 flex flex-col p-4 sm:p-6 md:p-8 relative00'>
          <h2 className='text-xl sm:text-2xl font-bold text-emerald-600 mb-6'>AI Smart Interview</h2>
          
          {!isIntroPhase && (
            <div className='relative mb-6 bg-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm'>
            <p className='text-xs sm:text-sm text-gray-400 mb-2'>Question {currentIndex + 1} of {questions.length}</p>
            <div className='text-base sm:text-lg font-semibold text-gray-800 leading-relaxed pr-16'>{currentQuestion?.question}</div>
            </div>
          )}

          <textarea
            placeholder="Type your answer here..."
            onChange={(e) => setAnswer(e.target.value)}
            value={answer}
            className="flex-1 bg-gray-100 p-4 sm:p-6 rounded-2xl resize-none outline-none border border-gray-200 focus:ring-2 focus:ring-emerald-500 transition text-gray-800"
          />

          {!feedback ? (
            <div className='flex items-center gap-4 mt-6'>
              <motion.button
                onClick={toggleMic}
                whileTap={{ scale: 0.9 }}
                className='w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full bg-black text-white shadow-lg'
              >
                {isMicOn ? <FaMicrophone size={20} /> : <FaMicrophoneSlash size={20} />}
              </motion.button>
              <motion.button
                onClick={submitAnswer}
                disabled={isSubmitting}
                whileTap={{ scale: 0.95 }}
                className='flex-1 bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-3 sm:py-4 rounded-2xl shadow-lg hover:opacity-90 transition font-semibold disabled:bg-gray-500'
              >
                {isSubmitting ? "Submitting..." : "Submit Answer"}
              </motion.button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className='mt-6 bg-emerald-50 border border-emerald-200 p-5 rounded-2xl shadow-sm'
            >
              <p className='text-emerald-700 font-medium mb-4'>{feedback}</p>
              <button
                onClick={handleNext}
                className='w-full bg-gradient-to-r from-emerald-600 to-teal-500 text-white py-3 rounded-xl shadow-md hover:opacity-90 transition flex item-center justify-center gap-1'
              >
                Next Question <BsArrowRight size={18} />
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )}
export default S2Interview
