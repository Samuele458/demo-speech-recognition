"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import FrameSDK from "@farcaster/frame-sdk";

// Import the SpeechRecognition component dynamically with no SSR
// This is necessary because the Web Speech API is only available in browsers
const SpeechRecognitionComponent = dynamic(
  () => import("./SpeechRecognition"),
  { ssr: false }
);

export default function SpeechRecognitionWrapper() {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    async function initializeFrameSDK() {
      try {
        await FrameSDK.actions.ready();
        console.log("FRAME SDK READY");
        console.log("User Agent:", navigator.userAgent);
        setInitialized(true);
      } catch (error) {
        console.error("Error initializing FrameSDK:", error);
      }
    }
    initializeFrameSDK();
  }, []);

  return initialized ? (
    <>
      <SpeechRecognitionComponent />
    </>
  ) : (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-lg">Loading...</p>
    </div>
  );
}
