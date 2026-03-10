import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Trash2,
  Lightbulb,
  Wrench,
  Droplets,
  AlertTriangle,
  HardHat,
  Shield,
  MapPin,
  Camera,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Zap,
  Upload,
  Mic,
  X,
  Navigation,
} from "lucide-react";
import { appwriteService } from "../appwriteService";
import { account } from "../appwrite";
import { toast } from "sonner";

const categories = [
  {
    id: "Garbage",
    icon: Trash2,
    label: "Garbage",
    color: "bg-amber-100 text-amber-600 border-amber-200",
    desc: "Overflow, littering",
  },
  {
    id: "Streetlight",
    icon: Lightbulb,
    label: "Streetlight",
    color: "bg-yellow-100 text-yellow-600 border-yellow-200",
    desc: "Failures, dim lights",
  },
  {
    id: "Pothole",
    icon: Wrench,
    label: "Pothole",
    color: "bg-red-100 text-red-600 border-red-200",
    desc: "Roads, footpaths",
  },
  {
    id: "Water",
    icon: Droplets,
    label: "Water",
    color: "bg-blue-100 text-blue-600 border-blue-200",
    desc: "Supply failures",
  },
  {
    id: "Sanitation",
    icon: AlertTriangle,
    label: "Sanitation",
    color: "bg-purple-100 text-purple-600 border-purple-200",
    desc: "Drains, sewage",
  },
  {
    id: "Construction",
    icon: HardHat,
    label: "Construction",
    color: "bg-green-100 text-green-600 border-green-200",
    desc: "Illegal building",
  },
  {
    id: "Safety",
    icon: Shield,
    label: "Safety",
    color: "bg-rose-100 text-rose-600 border-rose-200",
    desc: "Hazards, risks",
  },
  {
    id: "Other",
    icon: MapPin,
    label: "Other",
    color: "bg-slate-100 text-slate-600 border-slate-200",
    desc: "Any civic issue",
  },
];

const subcategories: Record<string, string[]> = {
  Pothole: ["Road", "Footpath", "Bridge", "Parking Area"],
  Garbage: ["Overflow", "Illegal Dumping", "Litter", "Dead Animal"],
  Streetlight: ["Main Road", "Residential Lane", "Underpass", "Park"],
  Water: ["Supply Failure", "Pipe Burst", "Contamination", "Low Pressure"],
  Sanitation: [
    "Drainage Clog",
    "Sewage Overflow",
    "Public Toilet",
    "Manhole Issue",
  ],
  Construction: ["Illegal Building", "Road Damage", "Encroachment", "Debris"],
  Safety: ["Exposed Wires", "Tree Fall Risk", "Broken Barrier", "Open Manhole"],
  Other: ["Noise", "Animal Menace", "Illegal Parking", "General"],
};

type Step = 1 | 2 | 3 | 4 | 5;

export default function ReportIssue() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(
    null,
  );
  const [description, setDescription] = useState("");
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [locationDetected, setLocationDetected] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [address, setAddress] = useState("");
  const [area, setArea] = useState("");
  const [pincode, setPincode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [complaintId, setComplaintId] = useState("");
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const handleCategorySelect = (id: string) => {
    setSelectedCategory(id);
  };

  const handlePhotoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingPhoto(true);
    try {
      const photoUrls: string[] = [];
      const fileList = Array.from(files);
      console.log(`Processing ${fileList.length} files...`);

      for (const file of fileList.slice(0, 5)) {
        try {
          console.log(
            `Uploading: ${file.name}, Size: ${file.size}, Type: ${file.type}`,
          );
          const photoUrl = await appwriteService.uploadPhoto(file);
          if (photoUrl) {
            console.log(`Successfully uploaded: ${photoUrl}`);
            photoUrls.push(photoUrl);
          }
        } catch (uploadInnerErr: any) {
          console.error(
            `Individual file upload failed: ${file.name}`,
            uploadInnerErr,
          );
          toast.error(
            `Could not upload ${file.name}: ${uploadInnerErr.message}`,
          );
          // Continue with next file instead of breaking completely
        }
      }

      if (photoUrls.length > 0) {
        setUploadedPhotos((prev) => [...prev, ...photoUrls]);
      }
    } catch (error: any) {
      console.error("Core upload process error:", error);
      toast.error("Upload system encountered an error. Please try one by one.");
    } finally {
      setIsUploadingPhoto(false);
      // Clear the input value so the same file can be selected again if needed
      if (event.target) event.target.value = "";
    }
  };

  const removePhoto = (photoUrl: string) => {
    setUploadedPhotos((prev) => prev.filter((url) => url !== photoUrl));
  };

  const handleManualGeocode = async (
    manualAddr: string,
    manualArea: string,
  ) => {
    if (!manualAddr && !manualArea) return;
    const fullSearch = `${manualAddr} ${manualArea}`.trim();
    if (fullSearch.length < 5) return;

    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullSearch)}&key=AIzaSyAc0wUSsARYzaJZUWX15rgxtvTS0Wd8mMs`,
      );
      const data = await response.json();
      if (data.status === "OK" && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location;
        setCoords({ lat, lng });
        console.log("Auto-fetched coordinates for manual entry:", lat, lng);
      }
    } catch (err) {
      console.error("Manual geocoding failed:", err);
    }
  };

  const handleDetectLocation = () => {
    setIsDetectingLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setCoords({ lat: latitude, lng: longitude });

          try {
            // Using reverse geocoding
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyAc0wUSsARYzaJZUWX15rgxtvTS0Wd8mMs`,
            );
            const data = await response.json();

            if (data.status === "OK" && data.results.length > 0) {
              const result = data.results[0];
              const comps = result.address_components;

              // Find the human-readable location name (e.g., Building Name, Landmark, or Street)
              const premise = comps.find((c: any) =>
                c.types.includes("premise"),
              )?.long_name;
              const subpremise = comps.find((c: any) =>
                c.types.includes("subpremise"),
              )?.long_name;
              const pointOfInterest = comps.find((c: any) =>
                c.types.includes("point_of_interest"),
              )?.long_name;
              const route = comps.find((c: any) =>
                c.types.includes("route"),
              )?.long_name;

              // Construct a shorter, more recognizable location name for the primary field
              const locationName =
                pointOfInterest ||
                premise ||
                subpremise ||
                route ||
                result.formatted_address.split(",")[0];
              setAddress(locationName);

              const areaComp =
                comps.find((c: any) =>
                  c.types.includes("sublocality_level_1"),
                ) ||
                comps.find((c: any) => c.types.includes("sublocality")) ||
                comps.find((c: any) => c.types.includes("locality"));
              if (areaComp) setArea(areaComp.long_name);

              const pinComp = comps.find((c: any) =>
                c.types.includes("postal_code"),
              );
              if (pinComp) setPincode(pinComp.long_name);
            } else {
              setAddress(
                `Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
              );
            }
          } catch (err) {
            console.error("Geocoding failed:", err);
            setAddress(
              `Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
            );
          }

          setLocationDetected(true);
          setIsDetectingLocation(false);
          toast.success("Location locked successfully!");
        },
        (error) => {
          console.error("Error detecting location:", error);
          let errorMsg =
            "Could not detect location automatically. Please enter it manually.";
          if (error.code === error.PERMISSION_DENIED) {
            errorMsg =
              "Location access was denied. Please enable location permissions in your browser settings.";
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            errorMsg =
              "Location information is unavailable. Please try again or enter manually.";
          } else if (error.code === error.TIMEOUT) {
            errorMsg =
              "Location detection timed out. Please try again or enter manually.";
          }
          toast.error(errorMsg);
          setIsDetectingLocation(false);
          // Don't setLocationDetected(true) on error so they can try again or see the manual state
          setLocationDetected(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        },
      );
    } else {
      toast.error("Geolocation is not supported by your browser.");
      setIsDetectingLocation(false);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const user = await account.get();
      if (!user) {
        throw new Error("User not found. Please log in again.");
      }

      const payload = {
        category: selectedCategory || "Other",
        subcategory: selectedSubcategory || "",
        description: description.trim() || "No description provided",
        address: `${address}${area ? ", " + area : ""}${pincode ? " - " + pincode : ""}`,
        coordinates: coords ? { lat: coords.lat, lng: coords.lng } : null,
        photos: uploadedPhotos || [],
        ward: area || "General",
        reporterName: user.name || "Anonymous",
        reporterId: user.$id || "anon",
        // priorityScore + slaHours computed server-side by FastAPI based on category
      };

      console.log("Submitting complaint with payload:", payload);
      const newId = await appwriteService.createComplaint(payload as any);
      console.log("Submission successful. ID:", newId);

      setComplaintId(newId);
      setStep(5);
      toast.success("Complaint submitted successfully!");
    } catch (error: any) {
      console.error("Failed to submit:", error);
      toast.error(`Submission failed: ${error.message || "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { num: 1, label: "Category" },
    { num: 2, label: "Location" },
    { num: 3, label: "Details" },
    { num: 4, label: "Photo" },
    { num: 5, label: "Done" },
  ];

  return (
    <div className="min-h-screen bg-[#050b18] py-8 text-white relative overflow-hidden">
      {/* Background Glow Blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-indigo-600/20 blur-[100px] rounded-full" />
      </div>

      <div className="max-w-2xl mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 mb-6 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Back to Dashboard
          </button>
          <h1 className="text-4xl font-[900] text-white tracking-tight mb-2">
            Report a Civic Issue
          </h1>
          <p className="text-blue-200/50 text-base">
            Your report helps make the city better for everyone.
          </p>
        </div>

        {/* Step Progress */}
        <div className="flex items-center gap-0 mb-10">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-[700] transition-all duration-500 ${
                    step > s.num
                      ? "bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                      : step === s.num
                        ? "bg-blue-600 text-white ring-4 ring-blue-500/20 shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                        : "bg-white/10 text-white/40 border border-white/10"
                  }`}
                >
                  {step > s.num ? <CheckCircle className="w-5 h-5" /> : s.num}
                </div>
                <span
                  className={`text-[10px] md:text-xs mt-2 font-[600] uppercase tracking-wider ${step === s.num ? "text-blue-400" : "text-white/30"}`}
                >
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`h-[2px] flex-1 mx-2 mt-[-20px] transition-all duration-500 ${step > s.num ? "bg-emerald-500" : "bg-white/10"}`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Card Content with Glassmorphism */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden mx-4 md:mx-0"
            >
              <div className="p-6 md:p-8">
                <h2 className="text-xl font-[700] text-white mb-2 flex items-center gap-2">
                  🏷️ Select Category
                </h2>
                <p className="text-sm text-blue-100/60 mb-8">
                  What type of civic issue needs attention?
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {categories.map(({ id, icon: Icon, label, color, desc }) => (
                    <button
                      key={id}
                      onClick={() => handleCategorySelect(id)}
                      className={`p-4 rounded-2xl border transition-all duration-300 group ${
                        selectedCategory === id
                          ? "bg-blue-600/30 border-blue-500 ring-2 ring-blue-500/50 shadow-lg"
                          : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center transition-transform group-hover:scale-110 ${
                          selectedCategory === id
                            ? "bg-blue-500 text-white"
                            : "bg-white/10 text-blue-400"
                        }`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="text-sm font-[700] text-white">
                        {label}
                      </div>
                    </button>
                  ))}
                </div>

                {selectedCategory && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-4"
                  >
                    <div className="text-sm font-[600] text-blue-200/80 mb-3">
                      Refine Problem Type
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(subcategories[selectedCategory] || []).map((sub) => (
                        <button
                          key={sub}
                          onClick={() => setSelectedSubcategory(sub)}
                          className={`px-4 py-2 rounded-xl text-sm font-[600] border transition-all ${
                            selectedSubcategory === sub
                              ? "bg-blue-600 text-white border-blue-500 shadow-md"
                              : "bg-white/5 text-blue-100/70 border-white/10 hover:bg-white/10"
                          }`}
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
              <div className="px-6 py-5 bg-white/5 border-t border-white/10 flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  disabled={!selectedCategory || !selectedSubcategory}
                  className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed text-white text-sm font-[700] rounded-2xl transition-all shadow-lg hover:shadow-blue-500/40"
                >
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden mx-4 md:mx-0"
            >
              <div className="p-6 md:p-8">
                <h2 className="text-xl font-[700] text-white mb-2 flex items-center gap-2">
                  📍 Pin the Location
                </h2>
                <p className="text-sm text-blue-100/60 mb-6">
                  Accurate location helps us dispatch the right team faster.
                </p>

                <div className="relative bg-[#0a0a1a] rounded-2xl h-64 overflow-hidden mb-6 border border-white/10 shadow-inner">
                  <div
                    className="absolute inset-0 opacity-30"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle at 2px 2px, #3b82f6 1px, transparent 0)",
                      backgroundSize: "24px 24px",
                    }}
                  />
                  {!locationDetected && !isDetectingLocation && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] z-20">
                      <button
                        onClick={handleDetectLocation}
                        className="group flex flex-col items-center gap-4 p-8 rounded-3xl bg-blue-600/20 border border-blue-500/30 hover:bg-blue-600/30 transition-all hover:scale-105"
                      >
                        <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-[0_0_30px_rgba(37,99,235,0.5)]">
                          <Navigation className="w-8 h-8 text-white group-hover:animate-bounce" />
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-[900] text-white">
                            Auto-Detect Location
                          </div>
                          <div className="text-xs text-blue-200/60 mt-1 font-[600]">
                            Uses your device's GPS for precision
                          </div>
                        </div>
                      </button>
                    </div>
                  )}
                  {(isDetectingLocation || (locationDetected && coords)) && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-md z-30">
                      {isDetectingLocation ? (
                        <>
                          <div className="relative w-24 h-24 mb-6">
                            <motion.div
                              animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                              transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "linear",
                              }}
                              className="absolute inset-0 border-t-2 border-r-2 border-blue-500 rounded-full"
                            />
                            <motion.div
                              animate={{ rotate: -360, scale: [1, 1.2, 1] }}
                              transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "linear",
                              }}
                              className="absolute inset-4 border-b-2 border-l-2 border-indigo-500 rounded-full opacity-50"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-4 h-4 bg-blue-500 rounded-full animate-ping" />
                            </div>
                          </div>
                          <div className="text-blue-200 font-[900] tracking-[0.2em] uppercase text-[10px] animate-pulse text-center">
                            Syncing with Satellites...
                            <br />
                            <span className="text-[8px] opacity-60">
                              Please allow location access if prompted
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="relative flex flex-col items-center">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.4)] mb-4"
                          >
                            <CheckCircle className="w-10 h-10 text-white" />
                          </motion.div>
                          <div className="text-emerald-400 font-[900] tracking-[0.2em] uppercase text-[10px] text-center">
                            Coordinates Locked
                            <br />
                            <span className="text-white/60 font-mono text-[9px] lowercase">
                              {coords?.lat.toFixed(6)}, {coords?.lng.toFixed(6)}
                            </span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDetectLocation();
                            }}
                            className="mt-4 text-[9px] font-bold text-blue-400 hover:text-blue-300 uppercase tracking-widest bg-blue-500/10 px-3 py-1.5 rounded-lg border border-blue-500/20"
                          >
                            Re-sync GPS
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                      <motion.div
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.5, 0.2, 0.5],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -inset-8 bg-blue-500 rounded-full blur-xl"
                      />
                      <div className="relative w-10 h-10 bg-blue-600 rounded-full border-4 border-white shadow-2xl flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-white" />
                      </div>
                    </div>
                  </div>
                  {locationDetected && !isDetectingLocation && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute bottom-4 left-4 right-4 bg-blue-900/80 backdrop-blur-md rounded-xl px-4 py-3 border border-white/20"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                          <Navigation className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[10px] text-blue-200 uppercase font-[700] tracking-wider flex items-center gap-2">
                            {coords
                              ? "Coordinates Locked"
                              : "Manual Entry Mode"}
                            {coords && (
                              <span className="text-emerald-400 font-mono lower-case opacity-60">
                                ({coords.lat.toFixed(4)},{" "}
                                {coords.lng.toFixed(4)})
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-white font-[500] truncate">
                            {address || area || "Location Entered"}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-inner space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase font-[900] text-blue-400 tracking-[0.2em] mb-3">
                      Location Details
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)] animate-pulse" />
                      <input
                        type="text"
                        placeholder="House No, Building, Landmark..."
                        value={address}
                        onChange={(e) => {
                          setAddress(e.target.value);
                          if (!locationDetected) setLocationDetected(true);
                        }}
                        className="w-full text-lg text-white font-[600] bg-transparent border-none focus:ring-0 placeholder:text-white/20"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                    <div>
                      <label className="text-[10px] uppercase font-[900] text-blue-400 tracking-wider mb-2 block">
                        Area / Locality <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={area}
                        onChange={(e) => {
                          setArea(e.target.value);
                          if (!locationDetected) setLocationDetected(true);
                        }}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500/50"
                        placeholder="Required"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-[900] text-blue-400/60 tracking-wider mb-2 block">
                        Pincode (Optional)
                      </label>
                      <input
                        type="text"
                        value={pincode}
                        onChange={(e) => {
                          setPincode(e.target.value);
                          if (!locationDetected) setLocationDetected(true);
                        }}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500/50"
                        placeholder="122001"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-6 py-5 bg-white/5 border-t border-white/10 flex justify-between items-center group/footer">
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 px-6 py-3 text-blue-200 hover:text-white text-sm font-[700] transition-all hover:translate-x-[-4px]"
                >
                  <ArrowLeft className="w-4 h-4" /> Go Back
                </button>
                <button
                  onClick={async () => {
                    if (!coords) {
                      await handleManualGeocode(address, area);
                    }
                    setStep(3);
                  }}
                  disabled={!area.trim()}
                  className="flex items-center gap-2 px-10 py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-20 disabled:cursor-not-allowed text-white text-sm font-[800] rounded-2xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-blue-500/50"
                >
                  Next Step <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.98, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -30 }}
              className="bg-white/[0.03] backdrop-blur-[40px] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 md:p-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center border border-blue-500/30">
                    <span className="text-xl">📝</span>
                  </div>
                  <h2 className="text-2xl font-[900] text-white tracking-tight">
                    Describe Issue
                  </h2>
                </div>
                <p className="text-blue-100/40 text-sm mb-8">
                  Your description helps AI understand the urgency and danger
                  level.
                </p>

                <div className="space-y-6">
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur opacity-0 group-focus-within:opacity-20 transition duration-500" />
                    <textarea
                      placeholder="e.g. Large pothole near the bus stop — very dangerous for two-wheelers, multiple near-accidents..."
                      value={description}
                      onChange={(e) =>
                        setDescription(e.target.value.slice(0, 500))
                      }
                      rows={6}
                      className="relative w-full px-6 py-5 text-lg text-white font-[500] bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-blue-500/50 shadow-inner placeholder:text-white/10 resize-none transition-all"
                    />
                    <div className="absolute bottom-4 right-4 text-[10px] font-mono font-[900] tracking-widest text-white/20">
                      {description.length} / 500
                    </div>
                  </div>

                  <div className="bg-blue-600/10 border border-blue-500/20 rounded-2xl p-5 flex items-center gap-4">
                    <div className="shrink-0 w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-blue-400" />
                    </div>
                    <span className="text-[11px] text-blue-100/60 leading-relaxed font-[500]">
                      Reports are encrypted and anonymized before processing.
                    </span>
                  </div>
                </div>
              </div>
              <div className="px-6 py-5 bg-white/5 border-t border-white/10 flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="flex items-center gap-2 px-6 py-3 text-blue-200 hover:text-white text-sm font-[700] transition-transform hover:translate-x-[-4px]"
                >
                  <ArrowLeft className="w-4 h-4" /> Go Back
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="flex items-center gap-2 px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white text-sm font-[800] rounded-2xl transition-all shadow-lg hover:shadow-blue-500/50 group"
                >
                  Next Step{" "}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.98, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -30 }}
              className="bg-white/[0.03] backdrop-blur-[40px] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 md:p-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center border border-blue-500/30">
                    <span className="text-xl">📸</span>
                  </div>
                  <h2 className="text-2xl font-[900] text-white tracking-tight">
                    Attach Evidence
                  </h2>
                </div>
                <p className="text-blue-100/40 text-sm mb-8">
                  Visual proof allows our rapid-response teams to verify and act
                  immediately (Optional).
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                  {/* Take Photo Option */}
                  <label className="group relative border-2 border-dashed border-white/10 rounded-[1.5rem] p-8 text-center hover:border-blue-500/50 hover:bg-blue-500/5 transition-all cursor-pointer overflow-hidden block">
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      disabled={isUploadingPhoto}
                    />
                    <div className="w-16 h-16 bg-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <Camera className="w-8 h-8 text-blue-400" />
                    </div>
                    <div className="text-sm font-[900] text-white uppercase tracking-tight">
                      Camera
                    </div>
                  </label>

                  {/* Upload Photo Option */}
                  <label className="group relative border-2 border-dashed border-white/10 rounded-[1.5rem] p-8 text-center hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all cursor-pointer overflow-hidden block">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      disabled={isUploadingPhoto}
                    />
                    <div className="w-16 h-16 bg-indigo-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <Upload className="w-8 h-8 text-indigo-400" />
                    </div>
                    <div className="text-sm font-[900] text-white uppercase tracking-tight">
                      Gallery
                    </div>
                  </label>
                </div>

                {isUploadingPhoto && (
                  <div className="relative z-10 text-blue-400 mb-8 p-6 bg-white/5 rounded-3xl border border-white/10 text-center">
                    <div className="w-10 h-10 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <div className="text-xs font-[800] tracking-widest uppercase text-blue-400/60">
                      Uploading Photos...
                    </div>
                  </div>
                )}

                {uploadedPhotos.length > 0 && (
                  <div className="space-y-8">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                      {uploadedPhotos.map((photoUrl, index) => (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          key={index}
                          className="relative rounded-[1.5rem] overflow-hidden border border-white/20 aspect-square shadow-2xl group"
                        >
                          <img
                            src={photoUrl}
                            alt="Evidence"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                removePhoto(photoUrl);
                              }}
                              className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white shadow-xl hover:bg-red-600 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="px-6 py-5 bg-white/5 border-t border-white/10 flex justify-between items-center group/footer">
                <button
                  onClick={() => setStep(3)}
                  className="flex items-center gap-2 px-6 py-3 text-blue-200 hover:text-white text-sm font-[700] transition-all"
                >
                  <ArrowLeft className="w-4 h-4" /> Go Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-base font-[900] rounded-2xl transition-all shadow-[0_0_30px_rgba(37,99,235,0.4)]"
                >
                  {isSubmitting ? "Processing..." : "Submit Issue"}{" "}
                  <Zap className="w-5 h-5 fill-current" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] shadow-2xl overflow-hidden text-center mx-4 md:mx-0 p-8 md:p-12"
            >
              <div className="max-w-md mx-auto">
                <motion.div
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: "spring",
                    damping: 10,
                    stiffness: 100,
                    delay: 0.2,
                  }}
                  className="w-24 h-24 rounded-full bg-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.4)] flex items-center justify-center mx-auto mb-8"
                >
                  <CheckCircle className="w-12 h-12 text-white" />
                </motion.div>

                <h2 className="text-3xl font-[900] text-white mb-3">
                  Mission Accepted! 🎉
                </h2>
                <p className="text-blue-100/60 text-base mb-8">
                  Your report has been logged and assigned a priority slot in
                  the civic queue.
                </p>

                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-8 relative overflow-hidden group">
                  <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="text-[10px] text-blue-300 font-[800] uppercase tracking-widest mb-2">
                    Ticket ID
                  </div>
                  <div className="text-3xl font-mono font-[900] text-white tracking-widest">
                    {complaintId}
                  </div>
                  <div className="flex items-center justify-center gap-2 text-[11px] text-blue-400 mt-4 font-[600]">
                    <Zap className="w-3 h-3" />
                    Real-time tracking enabled via Dashboard
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-10">
                  {[
                    { label: "SLA Deadline", value: "72 hrs", icon: "⏰" },
                    { label: "Community", value: "+20 XP", icon: "💎" },
                    { label: "Reputation", value: "+1", icon: "⭐" },
                  ].map(({ label, value, icon }) => (
                    <div
                      key={label}
                      className="bg-white/5 border border-white/10 rounded-2xl py-4 flex flex-col items-center"
                    >
                      <span className="text-2xl mb-2">{icon}</span>
                      <span className="text-sm font-[800] text-white">
                        {value}
                      </span>
                      <span className="text-[10px] text-white/30 font-[700] uppercase tracking-tighter">
                        {label}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col md:flex-row gap-4 px-4 md:px-0">
                  <button
                    onClick={() => {
                      if (complaintId) {
                        navigate(`/dashboard/complaints/${complaintId}`);
                      } else {
                        navigate("/dashboard/complaints");
                      }
                    }}
                    className="flex-1 py-4 bg-white text-blue-900 text-sm font-[800] rounded-2xl transition-all hover:bg-blue-50 active:scale-95 shadow-xl"
                  >
                    Track Progress
                  </button>
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="flex-1 py-4 bg-white/10 text-white text-sm font-[800] rounded-2xl border border-white/20 transition-all hover:bg-white/20 active:scale-95"
                  >
                    Finish
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
