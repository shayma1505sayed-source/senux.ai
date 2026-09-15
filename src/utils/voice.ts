/**
 * Voice utilities for SenuxGPT: Speech Synthesis & Speech Recognition
 */

// Global audio element/context tracker
let currentAudioElement: HTMLAudioElement | null = null;

export const playSpeech = async (
  text: string,
  voiceName: string = 'Zephyr',
  onStart?: () => void,
  onEnd?: () => void,
  onError?: () => void
) => {
  stopSpeech();

  // Strip code blocks and markdown symbols for natural vocal reading
  const cleanText = text
    .replace(/```[\s\S]*?```/g, 'Code block omitted.')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/[*#_~>]/g, '')
    .trim();

  if (!cleanText) {
    if (onEnd) onEnd();
    return;
  }

  // Try server-side Gemini TTS first
  try {
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: cleanText.slice(0, 450), voice: voiceName }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.audio) {
        if (onStart) onStart();
        const audioSrc = `data:audio/mp3;base64,${data.audio}`;
        const audio = new Audio(audioSrc);
        currentAudioElement = audio;

        audio.onended = () => {
          currentAudioElement = null;
          if (onEnd) onEnd();
        };

        audio.onerror = () => {
          currentAudioElement = null;
          // Fallback to browser synthesis
          speakWithBrowser(cleanText, onStart, onEnd, onError);
        };

        await audio.play();
        return;
      }
    }
  } catch (err) {
    console.warn('Gemini TTS error, falling back to browser synthesis:', err);
  }

  // Seamless fallback to browser speech synthesis
  speakWithBrowser(cleanText, onStart, onEnd, onError);
};

export const stopSpeech = () => {
  if (currentAudioElement) {
    currentAudioElement.pause();
    currentAudioElement = null;
  }
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};

const speakWithBrowser = (
  text: string,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: () => void
) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onError) onError();
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text.slice(0, 1000));
  utterance.rate = 1.05;
  utterance.pitch = 1.0;

  // Try to pick a smooth English voice
  const voices = window.speechSynthesis.getVoices();
  const englishVoice = voices.find(
    (v) => (v.name.includes('Google') || v.name.includes('Natural')) && v.lang.startsWith('en')
  ) || voices.find((v) => v.lang.startsWith('en'));

  if (englishVoice) {
    utterance.voice = englishVoice;
  }

  utterance.onstart = () => {
    if (onStart) onStart();
  };

  utterance.onend = () => {
    if (onEnd) onEnd();
  };

  utterance.onerror = () => {
    if (onError) onError();
  };

  window.speechSynthesis.speak(utterance);
};

export const createSpeechRecognizer = (
  onTranscript: (text: string, isFinal: boolean) => void,
  onError: (err: string) => void,
  onEnd: () => void
) => {
  if (typeof window === 'undefined') return null;

  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    onError('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.');
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  recognition.onresult = (event: any) => {
    let interimTranscript = '';
    let finalTranscript = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }

    const currentText = finalTranscript || interimTranscript;
    if (currentText) {
      onTranscript(currentText, Boolean(finalTranscript));
    }
  };

  recognition.onerror = (event: any) => {
    console.error('Speech recognition error:', event.error);
    onError(event.error);
  };

  recognition.onend = () => {
    onEnd();
  };

  return recognition;
};
