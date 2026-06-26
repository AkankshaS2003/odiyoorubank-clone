import React, { useState, useEffect, useRef } from 'react';
import * as faceapi from 'face-api.js';
import Webcam from 'react-webcam';
import { Camera, UploadCloud, CheckCircle, XCircle, Loader, AlertTriangle, RefreshCcw } from 'lucide-react';
import api from '../services/api';

interface FaceVerificationProps {
  onVerificationComplete: (result: {
    status: 'Face Verified' | 'Manual Review Required' | 'Failed',
    score: number | null,
    aadhaarFaceImage: string | null,
    selfieImage: string | null
  }) => void;
  threshold?: number;
}

export const FaceVerification: React.FC<FaceVerificationProps> = ({ onVerificationComplete, threshold = 0.45 }) => {
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Aadhaar Data
  const [aadhaarImgUrl, setAadhaarImgUrl] = useState<string | null>(null);
  const [aadhaarDescriptor, setAadhaarDescriptor] = useState<Float32Array | null>(null);
  const [aadhaarFaceExtracted, setAadhaarFaceExtracted] = useState<string | null>(null);
  const aadhaarImgRef = useRef<HTMLImageElement>(null);

  // Selfie Data
  const webcamRef = useRef<Webcam>(null);
  const [selfieImgUrl, setSelfieImgUrl] = useState<string | null>(null);
  const [selfieDescriptor, setSelfieDescriptor] = useState<Float32Array | null>(null);
  const [selfieFaceExtracted, setSelfieFaceExtracted] = useState<string | null>(null);
  const selfieImgRef = useRef<HTMLImageElement>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models')
        ]);
        setModelsLoaded(true);
      } catch (err) {
        console.error("Failed to load models", err);
        setError("Failed to load AI verification models. Please try again later.");
      }
    };
    loadModels();
  }, []);

  const extractFaceImage = async (imgElement: HTMLImageElement | HTMLVideoElement, detection: faceapi.FaceDetection) => {
    const canvas = document.createElement('canvas');
    const box = detection.box;
    // Add some padding to the box
    const padding = 20;
    const x = Math.max(0, box.x - padding);
    const y = Math.max(0, box.y - padding);
    const width = Math.min(imgElement.width - x, box.width + padding * 2);
    const height = Math.min(imgElement.height - y, box.height + padding * 2);
    
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    ctx.drawImage(imgElement, x, y, width, height, 0, 0, width, height);
    return canvas.toDataURL('image/jpeg');
  };

  const handleAadhaarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setAadhaarImgUrl(imageUrl);
      setError(null);
    }
  };

  const processAadhaar = async () => {
    if (!aadhaarImgRef.current) return;
    setIsProcessing(true);
    setError(null);
    
    try {
      const img = aadhaarImgRef.current;
      const detections = await faceapi.detectAllFaces(img).withFaceLandmarks().withFaceDescriptors();
      
      if (detections.length === 0) {
        setError("No face detected in the Aadhaar card. Please upload a clearer image.");
        setAadhaarImgUrl(null);
      } else if (detections.length > 1) {
        setError("Multiple faces detected in the image. Please crop exactly one face.");
        setAadhaarImgUrl(null);
      } else {
        const detection = detections[0];
        setAadhaarDescriptor(detection.descriptor);
        const faceDataUrl = await extractFaceImage(img, detection.detection);
        setAadhaarFaceExtracted(faceDataUrl);
        setStep(2);
      }
    } catch (err) {
      console.error(err);
      setError("Error processing image.");
    } finally {
      setIsProcessing(false);
    }
  };

  const captureSelfie = async () => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    if (imageSrc) {
      setSelfieImgUrl(imageSrc);
      setError(null);
    }
  };

  const retakeSelfie = () => {
    setSelfieImgUrl(null);
    setSelfieDescriptor(null);
    setSelfieFaceExtracted(null);
    setError(null);
  };

  const processSelfieAndCompare = async () => {
    if (!selfieImgRef.current || !aadhaarDescriptor) return;
    setIsProcessing(true);
    setError(null);

    try {
      const img = selfieImgRef.current;
      const detections = await faceapi.detectAllFaces(img).withFaceLandmarks().withFaceDescriptors();

      if (detections.length === 0) {
        setError("No face detected in selfie. Ensure good lighting and look at the camera.");
        setSelfieImgUrl(null);
      } else if (detections.length > 1) {
        setError("Multiple faces detected in selfie. Only you should be in the frame.");
        setSelfieImgUrl(null);
      } else {
        const detection = detections[0];
        setSelfieDescriptor(detection.descriptor);
        const faceDataUrl = await extractFaceImage(img, detection.detection);
        setSelfieFaceExtracted(faceDataUrl);

        // Compare
        const distance = faceapi.euclideanDistance(aadhaarDescriptor, detection.descriptor);
        
        if (distance <= threshold) {
          onVerificationComplete({
            status: 'Face Verified',
            score: distance,
            aadhaarFaceImage: aadhaarFaceExtracted,
            selfieImage: faceDataUrl
          });
        } else {
          const newRetryCount = retryCount + 1;
          setRetryCount(newRetryCount);
          if (newRetryCount >= MAX_RETRIES) {
            onVerificationComplete({
              status: 'Manual Review Required',
              score: distance,
              aadhaarFaceImage: aadhaarFaceExtracted,
              selfieImage: faceDataUrl
            });
          } else {
            setError(`Face verification failed (Score: ${distance.toFixed(2)}). Attempt ${newRetryCount} of ${MAX_RETRIES}. Please try again.`);
            setSelfieImgUrl(null);
          }
        }
      }
    } catch (err) {
      console.error(err);
      setError("Error processing selfie.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCameraError = () => {
    setError("Camera access denied or unavailable. Falling back to manual review.");
    onVerificationComplete({
      status: 'Manual Review Required',
      score: null,
      aadhaarFaceImage: aadhaarFaceExtracted,
      selfieImage: null
    });
  };

  if (!modelsLoaded) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-gray-500">
        <Loader className="w-12 h-12 animate-spin text-blue-600 mb-4" />
        <p>Loading biometric verification models...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 max-w-2xl mx-auto">
      <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <Camera className="w-6 h-6 text-blue-600" />
        AI Face Verification
      </h3>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Step 1: Aadhaar Upload */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="text-center">
            <h4 className="font-semibold text-gray-800 mb-2">Step 1: Upload Aadhaar Card</h4>
            <p className="text-sm text-gray-500">Upload a clear photo of the front of your Aadhaar Card.</p>
          </div>

          {!aadhaarImgUrl ? (
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition cursor-pointer">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleAadhaarUpload} 
                className="hidden" 
                id="aadhaar-upload" 
              />
              <label htmlFor="aadhaar-upload" className="cursor-pointer flex flex-col items-center">
                <UploadCloud className="w-12 h-12 text-blue-500 mb-3" />
                <span className="font-medium text-gray-700">Click to upload Aadhaar</span>
                <span className="text-xs text-gray-400 mt-1">JPEG, PNG, max 5MB</span>
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-lg overflow-hidden border border-gray-200">
                <img 
                  ref={aadhaarImgRef} 
                  src={aadhaarImgUrl} 
                  alt="Aadhaar" 
                  className="w-full h-auto max-h-64 object-contain"
                />
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setAadhaarImgUrl(null)} 
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200"
                  disabled={isProcessing}
                >
                  Change Photo
                </button>
                <button 
                  onClick={processAadhaar} 
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex justify-center items-center gap-2"
                  disabled={isProcessing}
                >
                  {isProcessing ? <Loader className="w-5 h-5 animate-spin" /> : 'Extract Face'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 2: Live Selfie */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="text-center">
            <h4 className="font-semibold text-gray-800 mb-2">Step 2: Live Selfie Verification</h4>
            <p className="text-sm text-gray-500">Remove glasses, ensure good lighting, and look straight at the camera.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg flex flex-col items-center">
              <span className="text-xs font-semibold text-gray-500 uppercase mb-2">Aadhaar Photo</span>
              {aadhaarFaceExtracted && (
                <img src={aadhaarFaceExtracted} alt="Extracted Face" className="w-32 h-32 object-cover rounded-full border-4 border-white shadow-md" />
              )}
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg flex flex-col items-center">
              <span className="text-xs font-semibold text-gray-500 uppercase mb-2">Live Selfie</span>
              {!selfieImgUrl ? (
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md bg-gray-200 relative flex justify-center items-center">
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={{ facingMode: "user" }}
                    onUserMediaError={handleCameraError}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <img ref={selfieImgRef} src={selfieImgUrl} alt="Selfie" className="w-32 h-32 object-cover rounded-full border-4 border-white shadow-md" />
              )}
            </div>
          </div>

          <div className="flex gap-3 justify-center">
            {!selfieImgUrl ? (
              <button 
                onClick={captureSelfie} 
                className="px-6 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 shadow-md flex items-center gap-2"
              >
                <Camera className="w-5 h-5" /> Capture Selfie
              </button>
            ) : (
              <>
                <button 
                  onClick={retakeSelfie} 
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 flex items-center gap-2"
                  disabled={isProcessing}
                >
                  <RefreshCcw className="w-5 h-5" /> Retake
                </button>
                <button 
                  onClick={processSelfieAndCompare} 
                  className="px-6 py-3 bg-green-600 text-white rounded-full font-medium hover:bg-green-700 shadow-md flex items-center gap-2"
                  disabled={isProcessing}
                >
                  {isProcessing ? <Loader className="w-5 h-5 animate-spin" /> : <><CheckCircle className="w-5 h-5" /> Verify Identity</>}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
