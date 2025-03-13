'use client';

import { useState, useEffect, useRef } from 'react';

// Define type for the SpeechRecognition API since TypeScript doesn't have native types for it
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
  length: number;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

// Speech recognition error event
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

// Global interface for the SpeechRecognition API
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onaudioend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onaudiostart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  onnomatch: ((this: SpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => void) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

// Extend the global Window interface to include SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

export default function SpeechRecognitionComponent() {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  
  // Use ref to persist the recognition instance across renders
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  const addLog = (message: string) => {
    setLogs((prevLogs) => [
      ...prevLogs,
      `[${new Date().toLocaleTimeString()}] ${message}`,
    ]);
    // Also print to console for debugging
    console.log(message);
  };
  
  // Initialize the recognition instance only once
  useEffect(() => {
    // Check if browser supports SpeechRecognition
    const SpeechRecognitionClass =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognitionClass) {
      setError("Speech Recognition API not supported in this browser");
      addLog("Error: Speech Recognition API not supported in this browser");
      setIsSupported(false);
      return;
    }
    
    setIsSupported(true);
    addLog("Speech Recognition API is supported");
    
    // Create a new recognition instance
    const recognitionInstance = new SpeechRecognitionClass();
    recognitionInstance.continuous = true;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = "en-US";
    
    // Set up event handlers
    recognitionInstance.onstart = () => {
      addLog("Speech recognition started, listening...");
      setIsListening(true);
    };
    
    recognitionInstance.onend = () => {
      addLog("Speech recognition ended");
      setIsListening(false);
    };
    
    recognitionInstance.onerror = (event: SpeechRecognitionErrorEvent) => {
      setIsListening(false);
      setError(`Speech recognition error: ${event.error}`);
      addLog(`Error: ${event.error}`);
    };
    
    recognitionInstance.onresult = (event: SpeechRecognitionEvent) => {
      let currentTranscript = '';
      
      // Loop through results
      for (let i = event.resultIndex; i < event.results.length; i++) {
        // Get the transcript
        const transcript = event.results[i][0].transcript;
        // If it's a final result, append it to our transcript
        if (event.results[i].isFinal) {
          currentTranscript += transcript;
        } else {
          // For interim results
          currentTranscript += transcript;
        }
      }
      
      setTranscript(currentTranscript);
      addLog(`Recognized: "${currentTranscript}"`);
    };
    
    // Store the recognition instance in our ref
    recognitionRef.current = recognitionInstance;
    
    // Check for microphone permission
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(() => {
        addLog("Microphone access granted");
      })
      .catch((err: Error) => {
        setError(`Microphone access denied: ${err.message}`);
        addLog(`Error: Microphone access denied - ${err.message}`);
      });
    
    return () => {
      // Cleanup
      if (recognitionRef.current) {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        
        if (isListening) {
          try {
            recognitionRef.current.stop();
          } catch (error) {
            console.error("Error stopping recognition:", error);
          }
          addLog("Speech recognition stopped (component cleanup)");
        }
      }
    };
  }, []); // Only run once on mount
  
  const toggleListening = () => {
    if (!recognitionRef.current) {
      addLog("Speech recognition not available");
      return;
    }
    
    if (isListening) {
      addLog("Stopping speech recognition...");
      try {
        recognitionRef.current.stop();
      } catch (err) {
        const error = err as Error;
        addLog(`Error stopping recognition: ${error.message}`);
      }
    } else {
      setTranscript("");
      addLog("Starting speech recognition...");
      try {
        recognitionRef.current.start();
      } catch (err) {
        const error = err as Error;
        addLog(`Error starting recognition: ${error.message}`);
      }
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Speech Recognition Demo</h1>
      
      <div className="mb-6">
        <button
          onClick={toggleListening}
          className={`p-3 rounded-md ${
            isListening ? "bg-red-500 text-white" : "bg-green-500 text-white"
          }`}
          disabled={!isSupported}
        >
          {isListening ? "Stop Listening" : "Start Listening"}
        </button>
      </div>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Status:</h2>
        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
          <p>
            Listening: <strong>{isListening ? "Yes" : "No"}</strong>
          </p>
          <p>
            Browser Support: <strong>{isSupported ? "Yes" : "No"}</strong>
          </p>
          {error && <p className="text-red-500">Error: {error}</p>}
        </div>
      </div>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Recognized Text:</h2>
        <div className="p-4 min-h-[100px] border border-gray-300 dark:border-gray-600 rounded-md">
          {transcript || (
            <span className="text-gray-400">(No speech detected yet)</span>
          )}
        </div>
      </div>
      
      <div>
        <h2 className="text-lg font-semibold mb-2">Logs:</h2>
        <div className="p-4 bg-black text-green-400 font-mono text-sm h-60 overflow-y-auto rounded-md">
          {logs.length === 0 ? (
            <span>No logs yet</span>
          ) : (
            logs.map((log, index) => <div key={index}>{log}</div>)
          )}
        </div>
      </div>
    </div>
  );
}
