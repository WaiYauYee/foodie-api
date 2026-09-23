import { useState, useEffect, useRef, useCallback } from 'react';

// SpeechRecognition type declarations for browser native Web Speech API
interface IWindowSpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: ((this: IWindowSpeechRecognition, ev: Event) => any) | null;
  onend: ((this: IWindowSpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: IWindowSpeechRecognition, ev: any) => any) | null;
  onresult: ((this: IWindowSpeechRecognition, ev: any) => any) | null;
}

export function useVoiceRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0); // 0 - 100 volume meter

  const recognitionRef = useRef<IWindowSpeechRecognition | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Check support on mount
  useEffect(() => {
    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setIsSupported(false);
    }
  }, []);

  // Cleanup audio tracks
  const cleanupAudio = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setAudioLevel(0);
  }, []);

  // Real-time audio analyzer for visual feedback
  const startAudioAnalyzer = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      const audioCtx = new AudioContextClass();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateLevel = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const normalized = Math.min(100, Math.round((avg / 128) * 100));
        setAudioLevel(normalized);

        animFrameRef.current = requestAnimationFrame(updateLevel);
      };

      updateLevel();
    } catch {
      // Audio level meter failed (e.g. permission or not needed), speech recognition can still work
    }
  }, []);

  const startListening = useCallback(
    (lang: string = 'en-MY') => {
      setError(null);
      setTranscript('');
      setInterimTranscript('');

      const SpeechRecognitionAPI =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognitionAPI) {
        setIsSupported(false);
        setError('Speech recognition is not supported in this browser. You can use sample test phrases below.');
        return;
      }

      try {
        if (recognitionRef.current) {
          try {
            recognitionRef.current.abort();
          } catch {}
        }

        const recognition: IWindowSpeechRecognition = new SpeechRecognitionAPI();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = lang;
        recognition.maxAlternatives = 3;

        // Bias the browser's speech recognition grammar towards Malaysian food terms (Zero API call!)
        const SpeechGrammarListAPI =
          (window as any).SpeechGrammarList || (window as any).webkitSpeechGrammarList;

        if (SpeechGrammarListAPI) {
          try {
            const speechRecognitionList = new SpeechGrammarListAPI();
            const grammar =
              '#JSGF V1.0; grammar malaysianFoods; public <food> = nasi lemak | roti canai | bak kut teh | teh tarik | char kway teow | chicken rice | roti telur | apple | banana | water ;';
            speechRecognitionList.addFromString(grammar, 1);
            (recognition as any).grammars = speechRecognitionList;
          } catch {
            // SpeechGrammarList optional fallback
          }
        }

        recognition.onstart = () => {
          setIsListening(true);
          setError(null);
          startAudioAnalyzer();
        };

        recognition.onresult = (event: any) => {
          let currentInterim = '';
          let currentFinal = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const result = event.results[i];
            const text = result[0].transcript;
            if (result.isFinal) {
              currentFinal += text;
            } else {
              currentInterim += text;
            }
          }

          if (currentFinal) {
            setTranscript((prev) => (prev ? `${prev} ${currentFinal}` : currentFinal));
            setInterimTranscript('');
          } else {
            setInterimTranscript(currentInterim);
          }
        };

        recognition.onerror = (event: any) => {
          const err = event.error;
          if (err === 'no-speech') {
            // Not a fatal error, user just paused
            return;
          }
          if (err === 'not-allowed' || err === 'permission-denied') {
            setError('Microphone access was denied. Please allow microphone permissions in your browser or use the quick simulation options below.');
          } else if (err === 'network') {
            setError('Speech network error. Ensure network connectivity or test with sample commands.');
          } else {
            setError(`Speech recognition error: ${err}`);
          }
          setIsListening(false);
          cleanupAudio();
        };

        recognition.onend = () => {
          setIsListening(false);
          cleanupAudio();
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err: any) {
        setError(err?.message || 'Could not start speech recognition');
        setIsListening(false);
        cleanupAudio();
      }
    },
    [cleanupAudio, startAudioAnalyzer]
  );

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);
    cleanupAudio();
  }, [cleanupAudio]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setError(null);
  }, []);

  const setManualTranscript = useCallback((text: string) => {
    setTranscript(text);
    setInterimTranscript('');
    setError(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      cleanupAudio();
    };
  }, [cleanupAudio]);

  return {
    isListening,
    transcript: (transcript + (interimTranscript ? ` ${interimTranscript}` : '')).trim(),
    finalTranscript: transcript,
    interimTranscript,
    isSupported,
    error,
    audioLevel,
    startListening,
    stopListening,
    resetTranscript,
    setManualTranscript,
  };
}
