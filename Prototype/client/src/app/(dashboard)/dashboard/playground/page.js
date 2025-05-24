"use client";

import React, { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import { Button } from "@/components/ui/button";

const AdversarialPlayground = () => {
  const [model, setModel] = useState(null);
  const [imageTensor, setImageTensor] = useState(null);
  const [output, setOutput] = useState([]);

  useEffect(() => {
    const loadModel = async () => {
      const loaded = await tf.loadLayersModel("/models/mnist/model.json");
      setModel(loaded);
    };
    loadModel();
  }, []);

  const runFGSM = async () => {
    if (!model || !imageTensor) return;

    const epsilon = 0.25;

    const gradFunction = tf.grad((x) => {
      const prediction = model.predict(x.reshape([1, 28, 28, 1]));
      return prediction.mean(); // Can customize for target class
    });

    const gradients = gradFunction(imageTensor);
    const adversarial = imageTensor.add(gradients.sign().mul(epsilon)).clipByValue(0, 1);
    const prediction = model.predict(adversarial.reshape([1, 28, 28, 1]));
    const probs = Array.from(await prediction.data());

    setOutput(probs);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 28;
      canvas.height = 28;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, 28, 28);

      const imageData = ctx.getImageData(0, 0, 28, 28);
      const data = tf.browser.fromPixels(imageData, 1).toFloat().div(255);
      setImageTensor(data);
    };
  };

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Adversarial Attack Playground</h2>

      <input type="file" accept="image/*" onChange={handleImageUpload} />
      <Button onClick={runFGSM} className="mt-4">
        Run FGSM Attack
      </Button>

      {output.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Model Predictions:</h3>
          <ul className="space-y-1">
            {output.map((p, i) => (
              <li key={i}>
                Class {i}: {(p * 100).toFixed(2)}%
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AdversarialPlayground;
