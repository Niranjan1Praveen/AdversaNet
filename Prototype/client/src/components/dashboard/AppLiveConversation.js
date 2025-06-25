"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, CircleDot, Keyboard } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "../ui/label";
const barHeights = [20, 32, 16, 40, 24, 40, 16, 32, 20];
import axios from "axios";

const classifySentiment = async (text) => {
  const HF_TOKEN = process.env.NEXT_PUBLIC_HF_TOKEN;
  const API_URL = process.env.NEXT_PUBLIC_HF_API_URL;

  try {
    const response = await axios.post(
      API_URL,
      { inputs: text },
      {
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = response.data;

    // ✅ Handle nested response
    if (!Array.isArray(data) || !Array.isArray(data[0])) {
      console.warn("Unexpected response format:", data);
      return null;
    }

    const topResult = data[0][0]; // First prediction in the top group

    if (!topResult || !topResult.label || topResult.score === undefined) {
      console.warn("Incomplete prediction data:", topResult);
      return null;
    }

    return {
      label: topResult.label,
      score: Number(topResult.score).toFixed(3),
    };
  } catch (error) {
    console.error("Sentiment analysis failed:", error.message || error);
    return null;
  }
};

export default function AppLiveConversation() {
  const [recording, setRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [manualInput, setManualInput] = useState("");
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [language, setLanguage] = useState("en-US");
  const [activeTab, setActiveTab] = useState("voice");
  const recognitionRef = useRef(null);
  const [sentiment, setSentiment] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = language;

      recognition.onresult = (event) => {
        let finalTranscript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        setTranscript((prev) => prev + finalTranscript + " ");
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error", event);
      };

      recognitionRef.current = recognition;
    }
  }, [language]);

  const handleStartRecording = () => {
    setRecording(true);
    setStartTime(Date.now());
    setEndTime(null);
    setTranscript("");
    if (recognitionRef.current) {
      recognitionRef.current.lang = language;
      recognitionRef.current.start();
    } else {
      console.error("Speech recognition not available");
      alert("Speech recognition is not supported in this browser.");
    }
  };

  const handleStopRecording = async () => {
    setRecording(false);
    setEndTime(Date.now());
    if (!recognitionRef.current) {
      alert("Speech recognition is not available.");
      return;
    }
    recognitionRef.current.stop();

    // Small delay to make sure transcript is updated
    setTimeout(async () => {
      if (transcript.trim()) {
        const result = await classifySentiment(transcript);
        setSentiment(result);
        if (result) {
          toast.success(`Sentiment: ${result.label} (${result.score})`);
        } else {
          toast.error("Failed to classify sentiment.");
        }
      }
    }, 500);
  };

  const getDuration = () => {
    if (startTime && endTime) {
      const durationInSeconds = Math.floor((endTime - startTime) / 1000);
      return `${durationInSeconds}s`;
    }
    return null;
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
        <div className="flex-1 flex flex-col items-center">
          <h2 className="text-2xl text-center font-semibold text-indigo-500 mb-2">
            Live Conversation Capture
          </h2>

          {/* Tab Selector */}
          <div className="flex mb-4 w-full justify-center gap-4">
            <Button
              variant={"outline"}
              className={`px-4 py-2 ${
                activeTab === "voice"
                  ? "border-b-2 border-indigo-500 text-indigo-500"
                  : "text-muted-foreground"
              }`}
              onClick={() => setActiveTab("voice")}
            >
              Voice Input
            </Button>
            <Button
              variant={"outline"}
              className={`px-4 py-2 ${
                activeTab === "text"
                  ? "border-b-2 border-indigo-500 text-indigo-500"
                  : "text-muted-foreground"
              }`}
              onClick={() => setActiveTab("text")}
            >
              Text Input
            </Button>
          </div>

          {activeTab === "voice" ? (
            <>
              <div className="flex items-center justify-between gap-5 my-4">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="rounded p-2"
                >
                  <option value="en-US" className="text-black">
                    English
                  </option>
                  <option value="hi-IN" className="text-black">
                    Hindi
                  </option>
                </select>

                <Button
                  className="bg-indigo-500 hover:bg-indigo-600 text-primary"
                  onClick={
                    recording ? handleStopRecording : handleStartRecording
                  }
                >
                  {recording ? "Stop Recording" : "Start Now"}
                </Button>
              </div>

              <div className="relative mb-6">
                {recording && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <CircleDot className="text-red-500 animate-ping w-4 h-4" />
                  </div>
                )}
                <div className="w-20 h-20 bg-indigo-500 rounded-full flex items-center justify-center">
                  <Mic className="text-white w-10 h-10" />
                </div>
              </div>

              <div className="flex items-center gap-[3px]">
                {barHeights.map((height, i) => (
                  <motion.div
                    key={i}
                    className="w-1 bg-indigo-500 rounded"
                    style={{ height: `${height}px` }}
                    animate={
                      recording ? { scaleY: [1, 1.8, 1] } : { scaleY: 1 }
                    }
                    transition={
                      recording
                        ? {
                            duration: 2,
                            repeat: Infinity,
                            repeatType: "loop",
                            delay: i * 0.1,
                          }
                        : { duration: 0 }
                    }
                  />
                ))}
              </div>
              <div
                className="w-full max-w-sm h-1 bg-indigo-500 rounded-full my-5"
                style={{ width: "80%" }}
              />
              {startTime && (
                <p className="text-muted-foreground text-sm mb-1 mt-4">
                  {recording ? `Recording...` : `Duration: ${getDuration()}`}
                </p>
              )}

              {recording && (
                <p
                  className="text-sm text-indigo-600 cursor-pointer"
                  onClick={handleStopRecording}
                >
                  Click to stop recording
                </p>
              )}

              {!recording && transcript && (
                <div className="mt-4 space-y-2 text-center w-full">
                  <p className="text-sm text-muted-foreground">Transcript:</p>
                  <div className="text-sm p-4 rounded-md whitespace-pre-wrap w-full max-w-md">
                    {transcript}
                  </div>
                </div>
              )}
              {sentiment && (
                <p className="text-sm mt-4">
                  <strong>Sentiment:</strong> {sentiment.label} (
                  {sentiment.score})
                </p>
              )}
            </>
          ) : (
            <div className="w-full max-w-md space-y-4">
              <div className="space-y-2">
                <Label htmlFor="manual-input">
                  Enter Conversation Manually
                </Label>
                <Textarea
                  id="manual-input"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="Type the conversation here..."
                  className="min-h-[200px]"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
